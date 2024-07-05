/**
 * Created by jim on 2020/5/8.
 */

/**
 * 升级经验系数 fix = max[ (1000 - wis) / 1000 , 0.5 ]
 * 升级经验公式 level * level * level * 30 * fix
 * 武学经验系数 wis/1000
 * 武学所需经验 (1 + 当前等级)*(1 + 当前等级)*(1 + 当前等级)*武学品级*武学品级*50
 * inventory size = 64
 **/

class CharacterModel{
    constructor(){

    }

    /**
     * 玩家获得exp
     * @param exp
     * @param method ： battle / trade / adventure
     */
    static gainExp(exp, method='battle'){
        // console.log("玩家获得exp:"+exp)
        let pObj = dbPlayer[pId];
        // updated 2023.08.24 王大的经验速率提高
        if(pId === 2) exp = Math.round(exp * GlobalConfig.EXP_BONUS_WD);
        // updated 2023.09.15 提高经验获取速率
        exp = Math.round( exp * 1.25 );

        // fix 20220219 贸易产生的经验不计入武学经验，战斗/冒险的计入
        if(method !== 'trade'){
            // 分配给正在修习的武学
            // updated 2023.06.01 加入等级惩罚，防止后期 学习武学太容易
            // let float_fix_var = 0.0985;  // 100 级 = 8倍，99级 = 7倍
            // updated 2023.11.22 降低高等级之后学习武学的难度
            // let float_fix_var = 0.0422;     // 100 级 = 4倍，99级 = 3倍
            let float_fix_var = 0.07;     // 100 级 = 6倍，99级 = 5倍
            let level_fix = dbPlayer[pId].level < 30 ? 1 : Math.ceil(float_fix_var*(dbPlayer[pId].level - 28));    // 30级以前，新手保护
            let modified_exp = Math.floor (exp / level_fix);
            CharacterModel.learnKF(modified_exp);
        }

        // 玩家exp
        // 20230511 需要解锁巅峰等级之后，才能继续获得巅峰等级经验
        let flagLevelUp = false;
        if(pObj.flagPara){  // 巅峰已解锁
            pObj.curExp = pObj.paraLevel < 100 ? pObj.curExp + exp : -1;    // 巅峰未满100 才能获得经验，否则 -1
            while((pObj.paraLevel < 100) && (pObj.curExp >= pObj.nextExp) ){    // 巅峰未满100 并且 经验大于等于升级经验
                pObj.curExp = pObj.curExp - pObj.nextExp;
                let fix = Math.max((1000 - pObj.wisdom ) / 1000, 0.5);
                pObj.nextExp = Math.floor(pObj.level * pObj.level * pObj.level * 20 * fix );
                if(pObj.level >=100){   // 普通等级已满
                    pObj.paraLevel = pObj.paraLevel + 1;
                    // console.log("玩家巅峰等级提升为 "+ pObj.paraLevel);
                    gGui.bootToast(globalStrings.CM_LEVEL_UP,globalStrings.CM_PA,globalStrings.CM_PARA_LV_UP+ pObj.paraLevel);
                }else{  // 普通等级未满
                    pObj.level = pObj.level + 1;
                    // console.log("玩家等级提升为 "+ pObj.level);
                    gGui.bootToast(globalStrings.CM_LEVEL_UP,"",globalStrings.CM_PARA_CH_UP+ pObj.level);
                }
                pObj.statPoint = pObj.statPoint + 1;
                flagLevelUp = true;
            }
            if(pObj.paraLevel >=100){
                pObj.curExp = -1;
                pObj.nextExp = -1;
            }
        }else{  // 巅峰未解锁
            pObj.curExp = pObj.level < 100 ? pObj.curExp + exp : -1;    // 等级未满100 才能获得经验，否则 -1
            while((pObj.level < 100) && (pObj.curExp >= pObj.nextExp) ){    // 等级未满100 并且 经验大于等于升级经验
                pObj.curExp = pObj.curExp - pObj.nextExp;
                let fix = Math.max((1000 - pObj.wisdom ) / 1000, 0.5);
                pObj.nextExp = Math.floor(pObj.level * pObj.level * pObj.level * 20 * fix );
                pObj.level = pObj.level + 1;
                // console.log("玩家等级提升为 "+ pObj.level);
                pObj.statPoint = pObj.statPoint + 1;
                flagLevelUp = true;
                gGui.bootToast(globalStrings.CM_LEVEL_UP,"",globalStrings.CM_PARA_CH_UP+ pObj.level);
            }
            if(pObj.level >=100){
                pObj.curExp = -1;
                pObj.nextExp = -1;
            }
        }
        CharacterModel.calcTotalState();
        if(flagLevelUp){
            pObj.curHP = pObj.maxHP;
            pObj.curMP = pObj.maxMP;
            gGui.playSoundEffect('succ');
            gGui.drawHUD();
        }
        // BubbleWidget.updateBubble();
        // bug-fixing : 20220310 检查collision 轻功是否提升
    }
    static learnKF(exp){
        // let pObj = dbPlayer[pId];
        if(dbPlayer[pId].eqList[7]>0 && dbPlayer[pId].learningNextExp > 0){
            let kfFix = Math.min(dbPlayer[pId].wisdom / GlobalConfig.EXP_KF_WIS_DIVIDER , GlobalConfig.EXP_KF_PERCENT_MAX);
            let learnedExp = Math.ceil(exp * kfFix);
            // console.log("武学exp="+learnedExp);
            dbPlayer[pId].learningCurExp += learnedExp;
            // [done]: 武学升级，更新 ngList wgList qgList
            // todo: 修改 inventoryModal , 装备武学的时候
            // todo: - 检查学习条件：1。 内功是否匹配 2。 技能是否达标 3. 是否还有空位
            // [done]: 注意：医书可以随便学习
            // 每个Tier 的医书，只能修习到 tierMax 的 heal 熟练度
            // 修习所需技能点 = tier * 9 - 20220217 已调整 KFModel.getSkillMaxByLearn
            // 修习所能到的最大技能点 =  tier * 16 + 25 - 20220217 已调整 KFModel.getSkillMinToLearn

            if(dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp){
                let iObj = gDB.getItemById(dbPlayer[pId].eqList[7]);
                if(iObj == undefined || iObj.kfId == undefined || iObj.kfId <=0 ){return;}
                let kObj = gDB.getKFById(iObj.kfId);
                if(kObj == undefined || kObj.kfType == undefined){return;}
                let tierMax = KFModel.getSkillMaxByLearn(kObj.kfTier);
                let kfIdx = CharacterModel.getKFIndexById(kObj.kfId);
                switch(kObj.kfType){
                    case 'heal':
                        let force_icon_refresh_flag = false;    // 20230804 同一个治疗技能升级，也会导致刷新。
                        do{
                            dbPlayer[pId].learningCurExp = dbPlayer[pId].learningCurExp - dbPlayer[pId].learningNextExp;
                            if(dbPlayer[pId].baseSkill.heal < tierMax){
                                CharacterModel.addSkill('heal',KFModel.getLevelUpSkillPoint(kObj.kfTier), tierMax);
                            }
                            if(dbPlayer[pId].zlKfId !== iObj.kfId){ // newly learned heal skill
                                force_icon_refresh_flag = true;
                                dbPlayer[pId].zlKfId = iObj.kfId;
                            }
                            gGui.bootToast(globalStrings.CM_MED_UP,"",kObj.kfName+globalStrings.CM_MED_DONE);
                            // 制药
                            let herbCnt = CharacterModel.countItem(GlobalConfig.ITEM_HERB_ID);
                            if(herbCnt > 0){
                                let medArr = MedicineModel.levelUp(kObj.kfTier,herbCnt);
                                if(medArr.length>0){
                                    let herbUsed = 0;
                                    let medStr = "";
                                    for(let i=0;i<medArr.length;i++){
                                        herbUsed = herbUsed + medArr[i].count;
                                        let med = gDB.getItemById(medArr[i].id);
                                        medStr += "["+med.itemName +"]x" + medArr[i].count;
                                    }
                                    CharacterModel.removeItem(GlobalConfig.ITEM_HERB_ID,herbUsed);
                                    for(let i=0;i<medArr.length;i++){
                                        CharacterModel.gainItem(medArr[i].id,medArr[i].count);
                                    }
                                    gGui.bootToast(globalStrings.CM_EXC_DONE,kObj.kfName,medStr);
                                }
                            }

                        }while(dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp);
                        if(force_icon_refresh_flag) BubbleWidget.updateKFIcons();   // bug-fixing: 学会治疗技能后，bubble没有刷新
                        break;
                    case 'nei':
                        if(kfIdx < 0){
                            // 这里查不到，也有可能是第一次学习
                            kfIdx = CharacterModel.getAvaSlotForKF(kObj.kfType);
                            if(kfIdx < 0){return;}
                            dbPlayer[pId].ngList[kfIdx] = {kfId:iObj.kfId,kfLevel:0};
                        }
                        while((dbPlayer[pId].ngList[kfIdx].kfLevel < 10)
                            && (dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp)){
                            dbPlayer[pId].learningCurExp = dbPlayer[pId].learningCurExp - dbPlayer[pId].learningNextExp;
                            if(dbPlayer[pId].baseSkill.enchant < tierMax){
                                CharacterModel.addSkill('enchant',KFModel.getLevelUpSkillPoint(kObj.kfTier), tierMax);
                            }
                            dbPlayer[pId].ngList[kfIdx].kfLevel = dbPlayer[pId].ngList[kfIdx].kfLevel + 1;
                            // console.log("ng level up");
                            gGui.bootToast(globalStrings.CM_INNER_UP,"",kObj.kfName+globalStrings.CM_INNER_1+dbPlayer[pId].ngList[kfIdx].kfLevel + globalStrings.CM_INNER_2 );
                            if(dbPlayer[pId].ngList[kfIdx].kfLevel >= 10){
                                dbPlayer[pId].learningNextExp = -1;
                                dbPlayer[pId].learningCurExp = -1;
                                break;
                            }else{
                                let kfObj = gDB.getKFById(dbPlayer[pId].ngList[kfIdx].kfId);
                                dbPlayer[pId].learningNextExp = KFModel.getLevelUpExp(kfObj.kfType,kfObj.kfTier,dbPlayer[pId].ngList[kfIdx].kfLevel, dbPlayer[pId].wisdom);    // 需要与Tier挂钩
                            }
                        }
                        break;
                    case 'qing':
                        if(kfIdx < 0){
                            // 这里查不到，也有可能是第一次学习
                            kfIdx = CharacterModel.getAvaSlotForKF(kObj.kfType);
                            if(kfIdx < 0){return;}
                            dbPlayer[pId].qgList[kfIdx] = {kfId:iObj.kfId,kfLevel:0};
                        }
                        while((dbPlayer[pId].qgList[kfIdx].kfLevel < 10)
                        && (dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp)){
                            dbPlayer[pId].learningCurExp = dbPlayer[pId].learningCurExp - dbPlayer[pId].learningNextExp;
                            if(dbPlayer[pId].baseSkill.swift < tierMax){
                                CharacterModel.addSkill('swift',KFModel.getLevelUpSkillPoint(kObj.kfTier), tierMax);
                            }
                            dbPlayer[pId].qgList[kfIdx].kfLevel = dbPlayer[pId].qgList[kfIdx].kfLevel + 1;
                            gGui.bootToast(globalStrings.CM_UPPER_UP,"",kObj.kfName+globalStrings.CM_INNER_1+dbPlayer[pId].qgList[kfIdx].kfLevel + globalStrings.CM_INNER_2 );
                            if(dbPlayer[pId].qgList[kfIdx].kfLevel >= 10){
                                dbPlayer[pId].learningNextExp = -1;
                                dbPlayer[pId].learningCurExp = -1;
                                break;
                            }else{
                                let kfObj = gDB.getKFById(dbPlayer[pId].qgList[kfIdx].kfId);
                                dbPlayer[pId].learningNextExp = KFModel.getLevelUpExp(kfObj.kfType,kfObj.kfTier,dbPlayer[pId].qgList[kfIdx].kfLevel, dbPlayer[pId].wisdom);    // 需要与Tier挂钩
                            }
                        }
                        break;
                    case 'fist':
                        if(kfIdx < 0){
                            kfIdx = CharacterModel.getAvaSlotForKF(kObj.kfType);
                            if(kfIdx < 0){return;}
                            dbPlayer[pId].wgList[kfIdx] = {kfId:iObj.kfId,kfLevel:0};
                        }
                        while((dbPlayer[pId].wgList[kfIdx].kfLevel < 10)
                        && (dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp)){
                            dbPlayer[pId].learningCurExp = dbPlayer[pId].learningCurExp - dbPlayer[pId].learningNextExp;
                            if(dbPlayer[pId].baseSkill.fist < tierMax){
                                CharacterModel.addSkill('fist',KFModel.getLevelUpSkillPoint(kObj.kfTier), tierMax);
                            }
                            dbPlayer[pId].wgList[kfIdx].kfLevel = dbPlayer[pId].wgList[kfIdx].kfLevel + 1;
                            gGui.bootToast(globalStrings.CM_OUTER_UP,"",kObj.kfName+globalStrings.CM_INNER_1+dbPlayer[pId].wgList[kfIdx].kfLevel + globalStrings.CM_INNER_2 );
                            if(dbPlayer[pId].wgList[kfIdx].kfLevel >= 10){
                                dbPlayer[pId].learningNextExp = -1;
                                dbPlayer[pId].learningCurExp = -1;
                                break;
                            }else{
                                let kfObj = gDB.getKFById(dbPlayer[pId].wgList[kfIdx].kfId);
                                dbPlayer[pId].learningNextExp = KFModel.getLevelUpExp(kfObj.kfType,kfObj.kfTier,dbPlayer[pId].wgList[kfIdx].kfLevel, dbPlayer[pId].wisdom);    // 需要与Tier挂钩
                            }
                        }
                        dbPlayer[pId].wgList[kfIdx].kfObj = KFModel.initWithLevel(dbPlayer[pId].wgList[kfIdx].kfId,dbPlayer[pId].wgList[kfIdx].kfLevel);
                        dbPlayer[pId].cdList[kfIdx].max =  dbPlayer[pId].wgList[kfIdx].kfObj.wgeCd * 1000;
                        BubbleWidget.updateKFIcons();   // 有新的武学升级。或者学会了新本事
                        break;
                    case 'sword':
                        if(kfIdx < 0){
                            kfIdx = CharacterModel.getAvaSlotForKF(kObj.kfType);
                            if(kfIdx < 0){return;}
                            dbPlayer[pId].wgList[kfIdx] = {kfId:iObj.kfId,kfLevel:0};
                        }
                        while((dbPlayer[pId].wgList[kfIdx].kfLevel < 10)
                        && (dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp)){
                            dbPlayer[pId].learningCurExp = dbPlayer[pId].learningCurExp - dbPlayer[pId].learningNextExp;
                            if(dbPlayer[pId].baseSkill.sword < tierMax){
                                CharacterModel.addSkill('sword',KFModel.getLevelUpSkillPoint(kObj.kfTier), tierMax);
                            }
                            dbPlayer[pId].wgList[kfIdx].kfLevel = dbPlayer[pId].wgList[kfIdx].kfLevel + 1;
                            gGui.bootToast(globalStrings.CM_OUTER_UP,"",kObj.kfName+globalStrings.CM_INNER_1+dbPlayer[pId].wgList[kfIdx].kfLevel + globalStrings.CM_INNER_2 );
                            if(dbPlayer[pId].wgList[kfIdx].kfLevel >= 10){
                                dbPlayer[pId].learningNextExp = -1;
                                dbPlayer[pId].learningCurExp = -1;
                                break;
                            }else{
                                let kfObj = gDB.getKFById(dbPlayer[pId].wgList[kfIdx].kfId);
                                dbPlayer[pId].learningNextExp = KFModel.getLevelUpExp(kfObj.kfType,kfObj.kfTier,dbPlayer[pId].wgList[kfIdx].kfLevel, dbPlayer[pId].wisdom);    // 需要与Tier挂钩
                            }
                        }
                        dbPlayer[pId].wgList[kfIdx].kfObj = KFModel.initWithLevel(dbPlayer[pId].wgList[kfIdx].kfId,dbPlayer[pId].wgList[kfIdx].kfLevel);
                        dbPlayer[pId].cdList[kfIdx].max =  dbPlayer[pId].wgList[kfIdx].kfObj.wgeCd * 1000;
                        BubbleWidget.updateKFIcons();   // 有新的武学升级。或者学会了新本事
                        break;
                    case 'machete':if(kfIdx < 0){
                        kfIdx = CharacterModel.getAvaSlotForKF(kObj.kfType);
                        if(kfIdx < 0){return;}
                        dbPlayer[pId].wgList[kfIdx] = {kfId:iObj.kfId,kfLevel:0};
                    }
                        while((dbPlayer[pId].wgList[kfIdx].kfLevel < 10)
                        && (dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp)){
                            dbPlayer[pId].learningCurExp = dbPlayer[pId].learningCurExp - dbPlayer[pId].learningNextExp;
                            if(dbPlayer[pId].baseSkill.machete < tierMax){
                                CharacterModel.addSkill('machete',KFModel.getLevelUpSkillPoint(kObj.kfTier), tierMax);
                            }
                            dbPlayer[pId].wgList[kfIdx].kfLevel = dbPlayer[pId].wgList[kfIdx].kfLevel + 1;
                            gGui.bootToast(globalStrings.CM_OUTER_UP,"",kObj.kfName+globalStrings.CM_INNER_1+dbPlayer[pId].wgList[kfIdx].kfLevel + globalStrings.CM_INNER_2 );
                            if(dbPlayer[pId].wgList[kfIdx].kfLevel >= 10){
                                dbPlayer[pId].learningNextExp = -1;
                                dbPlayer[pId].learningCurExp = -1;
                                break;
                            }else{
                                let kfObj = gDB.getKFById(dbPlayer[pId].wgList[kfIdx].kfId);
                                dbPlayer[pId].learningNextExp = KFModel.getLevelUpExp(kfObj.kfType,kfObj.kfTier,dbPlayer[pId].wgList[kfIdx].kfLevel, dbPlayer[pId].wisdom);    // 需要与Tier挂钩
                            }
                        }
                        dbPlayer[pId].wgList[kfIdx].kfObj = KFModel.initWithLevel(dbPlayer[pId].wgList[kfIdx].kfId,dbPlayer[pId].wgList[kfIdx].kfLevel);
                        dbPlayer[pId].cdList[kfIdx].max =  dbPlayer[pId].wgList[kfIdx].kfObj.wgeCd * 1000;
                        BubbleWidget.updateKFIcons();   // 有新的武学升级。或者学会了新本事
                        break;
                    case 'spear':if(kfIdx < 0){
                        kfIdx = CharacterModel.getAvaSlotForKF(kObj.kfType);
                        if(kfIdx < 0){return;}
                        dbPlayer[pId].wgList[kfIdx] = {kfId:iObj.kfId,kfLevel:0};
                    }
                        while((dbPlayer[pId].wgList[kfIdx].kfLevel < 10)
                        && (dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp)){
                            dbPlayer[pId].learningCurExp = dbPlayer[pId].learningCurExp - dbPlayer[pId].learningNextExp;
                            if(dbPlayer[pId].baseSkill.spear < tierMax){
                                CharacterModel.addSkill('spear',KFModel.getLevelUpSkillPoint(kObj.kfTier), tierMax);
                            }
                            dbPlayer[pId].wgList[kfIdx].kfLevel = dbPlayer[pId].wgList[kfIdx].kfLevel + 1;
                            gGui.bootToast(globalStrings.CM_OUTER_UP,"",kObj.kfName+globalStrings.CM_INNER_1+dbPlayer[pId].wgList[kfIdx].kfLevel + globalStrings.CM_INNER_2 );
                            if(dbPlayer[pId].wgList[kfIdx].kfLevel >= 10){
                                dbPlayer[pId].learningNextExp = -1;
                                dbPlayer[pId].learningCurExp = -1;
                                break;
                            }else{
                                let kfObj = gDB.getKFById(dbPlayer[pId].wgList[kfIdx].kfId);
                                dbPlayer[pId].learningNextExp = KFModel.getLevelUpExp(kfObj.kfType,kfObj.kfTier,dbPlayer[pId].wgList[kfIdx].kfLevel, dbPlayer[pId].wisdom);    // 需要与Tier挂钩
                            }
                        }
                        dbPlayer[pId].wgList[kfIdx].kfObj = KFModel.initWithLevel(dbPlayer[pId].wgList[kfIdx].kfId,dbPlayer[pId].wgList[kfIdx].kfLevel);
                        dbPlayer[pId].cdList[kfIdx].max =  dbPlayer[pId].wgList[kfIdx].kfObj.wgeCd * 1000;
                        BubbleWidget.updateKFIcons();   // 有新的武学升级。或者学会了新本事
                        break;
                    case 'ejection':if(kfIdx < 0){
                        kfIdx = CharacterModel.getAvaSlotForKF(kObj.kfType);
                        if(kfIdx < 0){return;}
                        dbPlayer[pId].wgList[kfIdx] = {kfId:iObj.kfId,kfLevel:0};
                    }
                        while((dbPlayer[pId].wgList[kfIdx].kfLevel < 10)
                        && (dbPlayer[pId].learningCurExp >= dbPlayer[pId].learningNextExp)){
                            dbPlayer[pId].learningCurExp = dbPlayer[pId].learningCurExp - dbPlayer[pId].learningNextExp;
                            if(dbPlayer[pId].baseSkill.ejection < tierMax){
                                CharacterModel.addSkill('ejection',KFModel.getLevelUpSkillPoint(kObj.kfTier), tierMax);
                            }
                            dbPlayer[pId].wgList[kfIdx].kfLevel = dbPlayer[pId].wgList[kfIdx].kfLevel + 1;
                            gGui.bootToast(globalStrings.CM_OUTER_UP,"",kObj.kfName+globalStrings.CM_INNER_1+dbPlayer[pId].wgList[kfIdx].kfLevel + globalStrings.CM_INNER_2 );
                            if(dbPlayer[pId].wgList[kfIdx].kfLevel >= 10){
                                dbPlayer[pId].learningNextExp = -1;
                                dbPlayer[pId].learningCurExp = -1;
                                break;
                            }else{
                                let kfObj = gDB.getKFById(dbPlayer[pId].wgList[kfIdx].kfId);
                                dbPlayer[pId].learningNextExp = KFModel.getLevelUpExp(kfObj.kfType,kfObj.kfTier,dbPlayer[pId].wgList[kfIdx].kfLevel, dbPlayer[pId].wisdom);    // 需要与Tier挂钩
                            }
                        }
                        dbPlayer[pId].wgList[kfIdx].kfObj = KFModel.initWithLevel(dbPlayer[pId].wgList[kfIdx].kfId,dbPlayer[pId].wgList[kfIdx].kfLevel);
                        dbPlayer[pId].cdList[kfIdx].max =  dbPlayer[pId].wgList[kfIdx].kfObj.wgeCd * 1000;
                        BubbleWidget.updateKFIcons();   // 有新的武学升级。或者学会了新本事
                        break;
                    default:break;
                }
            }
        }
    }

    static studyKF(kfId){
        if(dbPlayer[pId].learningKFId === kfId) return -1; // 正在学习，不动
        let studied = CharacterModel.getKFLvById(kfId);
        let lv = studied === -1 ? 0 : studied;

        // todo bug-fixing: 解决外功已经满了，还可以学习外功的bug?

        // bug-fixing: 解决医书的问题，不进行医书的判断，所有武功顶级了也可以修炼。
        // if(lv >=10) return -2;    // 已经顶级
        dbPlayer[pId].learningKFId = kfId;
        dbPlayer[pId].learningCurExp = 0;
        let fix = Math.max((2000 - dbPlayer[pId].wisdom ) / 2000, 0.618);
        let kfObj = gDB.getKFById(kfId);
        let tierFix = 1.1 + kfObj.kfTier * kfObj.kfTier * 0.1
        // dbPlayer[pId].learningNextExp = Math.ceil((lv*0.2+1) * 1000 * fix * tierFix * 50 / dbPlayer[pId].wisdom );    // 需要与Tier挂钩
        dbPlayer[pId].learningNextExp = KFModel.getLevelUpExp(kfObj.kfType,kfObj.kfTier,lv, dbPlayer[pId].wisdom);    // 需要与Tier挂钩
        return 1;
    }
    static unStudyKF(){
        dbPlayer[pId].learningKFId = -1;
        dbPlayer[pId].learningCurExp = -1;
        dbPlayer[pId].learningNextExp = -1;
    }
    static getKFLvById(kfId){
        for(let w=0;w<dbPlayer[pId].wgList.length;w++){
            if(parseInt(dbPlayer[pId].wgList[w].kfId) === parseInt(kfId)) return dbPlayer[pId].wgList[w].kfLevel;
        }
        for(let w=0;w<dbPlayer[pId].ngList.length;w++){
            if(parseInt(dbPlayer[pId].ngList[w].kfId) === parseInt(kfId)) return dbPlayer[pId].ngList[w].kfLevel;
        }
        for(let w=0;w<dbPlayer[pId].qgList.length;w++){
            if(parseInt(dbPlayer[pId].qgList[w].kfId) === parseInt(kfId)) return dbPlayer[pId].qgList[w].kfLevel;
        }
        if(parseInt(dbPlayer[pId].zlKfId) ===  parseInt(kfId)) return 10;
        return -1;
    }
    static getKFIndexById(kfId){
        for(let w=0;w<dbPlayer[pId].wgList.length;w++){
            if(parseInt(dbPlayer[pId].wgList[w].kfId) == parseInt(kfId)) return w;
        }
        for(let w=0;w<dbPlayer[pId].ngList.length;w++){
            if(parseInt(dbPlayer[pId].ngList[w].kfId) == parseInt(kfId)) return w;
        }
        for(let w=0;w<dbPlayer[pId].qgList.length;w++){
            if(parseInt(dbPlayer[pId].qgList[w].kfId) == parseInt(kfId)) return w;
        }
        return -1;
    }
    static getAvaSlotForKF(kfType){
        switch(kfType){
            case 'nei':
                for(let i=0;i<dbPlayer[pId].ngList.length;i++){
                    if(dbPlayer[pId].ngList[i].kfId == undefined || dbPlayer[pId].ngList[i].kfId == -1){
                        return i;
                    }
                }
                return -1;
                break;
            case 'qing':
                for(let i=0;i<dbPlayer[pId].qgList.length;i++){
                    if(dbPlayer[pId].qgList[i].kfId == undefined || dbPlayer[pId].qgList[i].kfId == -1){
                        return i;
                    }
                }
                return -1;
                break;
            default:
                for(let i=0;i<dbPlayer[pId].wgList.length;i++){
                    if(dbPlayer[pId].wgList[i].kfId == undefined || dbPlayer[pId].wgList[i].kfId == -1){
                        return i;
                    }
                }
                return -1;
                break;
        }
    }

    /**
     * 检查是否可以学习对应的武学 - 2022.02.18 更新，使用 totalSkill 而不是 baseSkill( 装备提供的 也算 )
     * @param intKFID
     * @returns {boolean}
     */
    static isAbleToStudy(intKFID){
        let iKid = parseInt(intKFID);
        let kfObj = gDB.getKFById(iKid);

        if((kfObj.kfNeili === globalStrings.KF_INNER_TYPE_ANY) || (kfObj.kfNeili === dbPlayer[pId].neili) || (globalStrings.KF_INNER_TYPE_HE === dbPlayer[pId].neili)) {     // 内力匹配判断
            switch(kfObj.kfType) {          // 技能等级判断
                case 'nei': return dbPlayer[pId].totalSkill.enchant >= KFModel.getSkillMinToLearn(kfObj.kfTier);
                case 'qing': return dbPlayer[pId].totalSkill.swift >= KFModel.getSkillMinToLearn(kfObj.kfTier);
                case 'heal': return dbPlayer[pId].totalSkill.heal >= KFModel.getSkillMinToLearn(kfObj.kfTier);
                case 'fist': return dbPlayer[pId].totalSkill.fist >= KFModel.getSkillMinToLearn(kfObj.kfTier);
                case 'sword': return dbPlayer[pId].totalSkill.sword >= KFModel.getSkillMinToLearn(kfObj.kfTier);
                case 'machete': return dbPlayer[pId].totalSkill.machete >= KFModel.getSkillMinToLearn(kfObj.kfTier);
                case 'spear': return dbPlayer[pId].totalSkill.spear >= KFModel.getSkillMinToLearn(kfObj.kfTier);
                case 'ejection': return dbPlayer[pId].totalSkill.ejection >= KFModel.getSkillMinToLearn(kfObj.kfTier);
                default: return false;
            }
        }
        return false;
    }

    static addSkill(skill,point,skillMax){
        let pObj = dbPlayer[pId];
        switch(skill.toUpperCase()){
            case 'FIST': pObj.baseSkill.fist = (pObj.baseSkill.fist + point > skillMax) ? skillMax : pObj.baseSkill.fist + point;break;
            case 'SWORD': pObj.baseSkill.sword = (pObj.baseSkill.sword + point > skillMax) ? skillMax : pObj.baseSkill.sword + point;break;
            case 'MACHETE': pObj.baseSkill.machete = (pObj.baseSkill.machete + point > skillMax) ? skillMax : pObj.baseSkill.machete + point;break;
            case 'SPEAR': pObj.baseSkill.spear = (pObj.baseSkill.spear + point > skillMax) ? skillMax : pObj.baseSkill.spear + point;break;
            case 'EJECTION': pObj.baseSkill.ejection = (pObj.baseSkill.ejection + point > skillMax) ? skillMax : pObj.baseSkill.ejection + point;break;
            case 'HEAL': pObj.baseSkill.heal = (pObj.baseSkill.heal + point > skillMax) ? skillMax : pObj.baseSkill.heal + point;break;
            case 'ENCHANT': pObj.baseSkill.enchant = (pObj.baseSkill.enchant + point > skillMax) ? skillMax : pObj.baseSkill.enchant + point;break;
            case 'SWIFT': pObj.baseSkill.swift = (pObj.baseSkill.swift + point > skillMax) ? skillMax : pObj.baseSkill.swift + point;break;
            default:break;
        }
        CharacterModel.calcTotalState();
    }

    static calcSkill(){
        let pObj = dbPlayer[pId];
        let eqArr = [];
        // 20220203 优化轻功swift 碰撞的逻辑
        let swift_old = pObj.totalSkill.swift;
        for(let i=0;i<pObj.eqList.length;i++){
            if(pObj.eqList[i] > 0){
                eqArr[i] = gDB.getItemById(pObj.eqList[i]);
            }else{
                eqArr[i] = SkillModel.Zero();
            }
        }
        pObj.equipSkill = SkillModel.merge(eqArr);
        pObj.totalSkill = SkillModel.merge([pObj.baseSkill,pObj.equipSkill]);

        // bug-fix 2022-310 -  这里应该不需要了。因为在quickbattle中，这个时候 scene 是 pause的，无法修改。
        // 改为在离开 quickBattle的时候，调整collision.
        // battleModal.js leaveQuickBattle
        // let swift_new = pObj.totalSkill.swift;
        // if(swift_old !== swift_new){
        //     if((game !== undefined) && (game.scene !== undefined) && (game.scene.getScene('WorldScene')!==null)){
        //         // game.scene.getScene('WorldScene').updateLayerCollision(dbPlayer[pId].moveOn);
        //         // console.log("player move on " + dbPlayer[pId].moveOn);
        //         // console.log('new swift, update collision: swift = '+swift_new);
        //         // game.scene.getScene('WorldScene').status
        //     }
        // }
    }

    static calcState(){
        let pObj = dbPlayer[pId];
        // baseState
        pObj.baseState = BaseStateModel.initFromStrWis(pObj.strength,pObj.wisdom);
        // equipState
        let eqArr = [];
        for(let i=0;i<pObj.eqList.length;i++){
            if(pObj.eqList[i] > 0){
                eqArr[i] = gDB.getItemById(pObj.eqList[i]);
            }else {
                eqArr[i] = BaseStateModel.Zero();
            }
        }
        pObj.totalState = BaseStateModel.merge(eqArr.concat(pObj.baseState));
        pObj.maxHP = (pObj.level + pObj.paraLevel)*30;
        pObj.maxMP = (pObj.level + pObj.paraLevel)*20;
    }

    /** 刷新角色属性，并更新hud bubble buff debuff */
    static calcTotalState(){
        let pObj = dbPlayer[pId];
        CharacterModel.calcState();
        CharacterModel.calcSkill();
        // 20230521 治疗增加抗性
        // if(pObj.zlKfId > 0){
        //     let zlKF = gDB.getKFById(pObj.zlKfId);
        //     pObj.totalState.ris = ( zlKF.kfTier - 3 ) * 0.18;
        // }
        switch (pObj.zlKfId){
            case 6:     //  神农本草经 - 治愈术
                pObj.totalState.ris =  0.18;
                break;
            case 7:     // 难经 - 易经洗髓
                pObj.totalState.ris =  0.36;
                break;
            case 8:     //  千金方 - 三花聚顶
                pObj.totalState.ris =  0.54;
                break;
            case 9:     // 皇帝内经 - 脱胎换骨
                pObj.totalState.ris =  0.72;
                break;
            default:break;
        }


        // 20230821 增加游戏难度控制
        if(gApp.difficulty === 1){  // 简单难度 - 计算激活的内功 轻功
            if(pObj.ngaId >=0){
                pObj.ngObj = KFModel.initWithLevel(pObj.ngList[pObj.ngaId].kfId,pObj.ngList[pObj.ngaId].kfLevel);
                //pObj.totalState = BaseStateModel.merge([pObj.totalState,ngObj]);
                pObj.totalState = BaseStateModel.multiAtk(pObj.totalState,pObj.ngObj);
                pObj.maxHP = (pObj.level + pObj.paraLevel)*30 + pObj.ngObj.HPMax;
                pObj.maxMP = (pObj.level + pObj.paraLevel)*20 + pObj.ngObj.MPMax;
            }
            if(pObj.qgaId >=0){
                pObj.qgObj = KFModel.initWithLevel(pObj.qgList[pObj.qgaId].kfId,pObj.qgList[pObj.qgaId].kfLevel);
                pObj.totalState = BaseStateModel.merge([pObj.totalState,pObj.qgObj]);
            }
        }else{
            pObj.maxHP = (pObj.level + pObj.paraLevel)*30;
            pObj.maxMP = (pObj.level + pObj.paraLevel)*20;
            let ngObj  = BaseStateModel.Zero();
            for(let i=0;i<pObj.ngList.length;i++){
                if(!pObj.ngList[i]) continue;
                if(!pObj.ngList[i].kfId) continue;
                let tmpObj = KFModel.initWithLevel(pObj.ngList[i].kfId,pObj.ngList[i].kfLevel);
                ngObj = BaseStateModel.merge([ngObj,tmpObj]);
                pObj.maxHP = pObj.maxHP + tmpObj.HPMax;
                pObj.maxMP = pObj.maxMP + tmpObj.MPMax;
            }
            pObj.totalState = BaseStateModel.multiAtk(pObj.totalState,ngObj);

            let qgObj  = BaseStateModel.Zero();
            for(let i=0;i<pObj.qgList.length;i++){
                if(!pObj.qgList[i]) continue;
                if(!pObj.qgList[i].kfId) continue;
                let tmpQObj = KFModel.initWithLevel(pObj.qgList[i].kfId,pObj.qgList[i].kfLevel);
                qgObj = BaseStateModel.merge([qgObj,tmpQObj]);
            }
            pObj.totalState = BaseStateModel.merge([pObj.totalState,qgObj]);
        }

        // if(pObj.wgaId >=0){
        //     pObj.wgObj = KFModel.initWithLevel(pObj.wgList[pObj.wgaId].kfId,pObj.wgList[pObj.wgaId].kfLevel);
        // }


        CharacterModel.calcFoodBuff();
        CharacterModel.calcMoveOnSpeed();
        //debuff logic - 忽略，因为在其他地方处理了？不是直接反映在 totalState中，除了移动速度
        // 减速逻辑： 1- 1/(（1+hst)(1-v)) 推倒出来的公式  2022120.
        // pObj.totalState.hst = pObj.dbfObj.hst.duration > 0 ? pObj.totalState.hst - pObj.dbfObj.hst.value : pObj.totalState.hst;
        // pObj.totalState.hit = pObj.dbfObj.blind.duration > 0 ? 0 : pObj.totalState.hit;
        // pObj.totalState.def = pObj.dbfObj.stun.duration > 0 ? 0 : pObj.totalState.def;

        // todo check - 是不是这里直接移除，就可以了。
        // if(game != null && game.scene!= null){
        //     let sce = game.scene.getScene("DynamicScene");
        //     if(sce){
        //         sce.player.explainDeBuffChange();
        //     }
        // }


        pObj.gcd = 1.5 / (1+pObj.totalState.hst);
        pObj.gcd = pObj.gcd > 1.0 ? pObj.gcd : 1.0;
        pObj.gcdObj.max = pObj.gcd * 1000;
        pObj.tickInterval = Math.round(100 * 5 / (1+pObj.totalState.hst))/100;
        (pObj.tickInterval >= 2.0) || (pObj.tickInterval = 2.0);

        for(let i=0;i<pObj.wgList.length;i++){
            if((pObj.wgList[i] != undefined) && (pObj.wgList[i].kfId > 0)){
                pObj.wgList[i].kfObj = KFModel.initWithLevel(pObj.wgList[i].kfId,pObj.wgList[i].kfLevel);
                pObj.cdList[i].max =  pObj.wgList[i].kfObj.wgeCd * 1000;
            }
        }
        pObj.cdList[4].max =   pObj.tickInterval * 1000; // 所有的治疗效果统一改为5秒，且受急速影响

        CharacterModel.updateShipDataFromInventory();
        // BuffWidget.updateBuff();
        // BubbleWidget.updateBubble();
        // deBuffWidget.guiUpdate();
        gGui.drawHUD();

        // 20220130 - 试图在这里调整跟地图的碰撞，实现轻功超过70的时候翻山
        // 效率太差
        // if((game !== undefined) && (game.scene !== undefined) && (game.scene.getScene('WorldScene')!==null)){
        //     game.scene.getScene('WorldScene').updateLayerCollision(dbPlayer[pId].moveOn);
        // }
    }
    static getSkillValue(typ){
        CharacterModel.calcTotalState();
        switch(typ){
            case 'qing': return dbPlayer[pId].totalSkill.swift;
            case 'nei': return dbPlayer[pId].totalSkill.enchant;
            case 'fist': return dbPlayer[pId].totalSkill.fist;
            case 'sword': return dbPlayer[pId].totalSkill.sword
            case 'machete': return dbPlayer[pId].totalSkill.machete;
            case 'spear': return dbPlayer[pId].totalSkill.spear;
            case 'ejection': return dbPlayer[pId].totalSkill.ejection;
            case 'heal': return dbPlayer[pId].totalSkill.heal;
            default:return 0;
        }
    }

    static calcMoveOnSpeed(){
        let pObj = dbPlayer[pId];
        switch(pObj.moveOn){
            case 'foot':
                pObj.moveOnSpeed = (100 + pObj.totalSkill.swift).toFixed(0);
                if(pObj.dbfObj!==undefined && pObj.dbfObj.spd !== undefined && pObj.dbfObj.spd.duration !==undefined && pObj.dbfObj.spd.duration > 0){
                    pObj.moveOnSpeed = Math.round(pObj.moveOnSpeed * (1-pObj.dbfObj.spd.value));  // 移动速度 - 20%
                }
                break;
            case 'horse':
                if(parseInt(pObj.horseId) === 2){
                    pObj.moveOnSpeed = 200;
                }else if(parseInt(pObj.horseId) === 3){
                    pObj.moveOnSpeed = 300;
                }else{
                    pObj.moveOnSpeed = (100 + pObj.totalSkill.swift).toFixed(0);
                }
                break;
            case 'ship':
                if(dbPlayer[pId].shipId == 0){
                    pObj.moveOnSpeed = 100;
                    console.log("error: should move by ship");
                    break;
                }
                let ship = gDB.getShipById(dbPlayer[pId].shipId);
                if(ship !== undefined){
                    pObj.moveOnSpeed = (parseInt(ship.speed) * (1+dbPlayer[pId].shipFitSpeed*0.1)).toFixed(0);
                }else{
                    // error, should never happen
                    pObj.moveOnSpeed = 100;
                    console.log("error: should move by ship else v2");
                }
                break;
            default:
                pObj.moveOnSpeed = (100 + pObj.totalSkill.swift).toFixed(0);
        }

    }
    static calcFoodBuff(){
        if(dbPlayer[pId].food <=30){
            //  hunger debuff: 急速 hl + 5% ，hr = 0 mr =0
            let hungerBuff = BaseStateModel.initFromValue(0,0,0,0,0,0.05,0,0,0,0,0,0,0,0);
            dbPlayer[pId].totalState = BaseStateModel.merge([dbPlayer[pId].totalState,hungerBuff]);
            dbPlayer[pId].totalState.reg = 0;
            dbPlayer[pId].totalState.rem = 0;
            return;
        }
        if(dbPlayer[pId].food >100) {
            //  full debuff: 暴击伤害 cm + 25% hl =0 闪避 dg =0
            let fullBuff = BaseStateModel.initFromValue(0,0,0,0,0.25,0,0,0,0,0,0,0,0,0);
            dbPlayer[pId].totalState = BaseStateModel.merge([dbPlayer[pId].totalState,fullBuff]);
            dbPlayer[pId].totalState.hst = 0;
            dbPlayer[pId].totalState.dge = 0;
        }
    }

    static tickCoolDown(delta){ // delta 单位 毫秒
        for(let i=0;i<dbPlayer[pId].cdList.length;i++){
            if((dbPlayer[pId].cdList[i].max >0 && (!dbPlayer[pId].cdList[i].ready) )){
                dbPlayer[pId].cdList[i].cur = dbPlayer[pId].cdList[i].cur + delta;
                if(dbPlayer[pId].cdList[i].cur >= dbPlayer[pId].cdList[i].max){
                    dbPlayer[pId].cdList[i].cur = 0;
                    dbPlayer[pId].cdList[i].ready = true;
                }
            }
        }
        if((dbPlayer[pId].gcdObj.max > 0) && (!dbPlayer[pId].gcdObj.ready)){
            dbPlayer[pId].gcdObj.cur = dbPlayer[pId].gcdObj.cur + delta;
            if(dbPlayer[pId].gcdObj.cur >= dbPlayer[pId].gcd){
                dbPlayer[pId].gcdObj.cur = 0;
                dbPlayer[pId].gcdObj.ready = true;
            }
        }
    }
    static tickHeartBeat(delta){  // 恢复， 单位 毫秒
        let target = dbPlayer[pId].tickInterval * 1000;
        dbPlayer[pId].tickTimer += delta;
        if(dbPlayer[pId].tickTimer >= target){
            // 触发 心跳事件，例如 回血
            CharacterModel.calcTotalState();
            CharacterModel.tick();
            dbPlayer[pId].tickTimer = 0;
            // asyn 函数更新 gui
            // BubbleWidget.updateBubble();
            // gGui.drawHUD();
            return 1;
        }
        return 0;
    }
    static tickDebuff(delta){
        // dbPlayer[pId].dbfList['815'] = dbPlayer[pId].dbfList['815'] - delta > 0 ? dbPlayer[pId].dbfList['815'] - delta : 0;
        dbPlayer[pId].dbfObj.hst.duration = dbPlayer[pId].dbfObj.hst.duration - delta > 0 ? dbPlayer[pId].dbfObj.hst.duration - delta : 0;
        dbPlayer[pId].dbfObj.spd.duration = dbPlayer[pId].dbfObj.spd.duration - delta > 0 ? dbPlayer[pId].dbfObj.spd.duration - delta : 0;
        dbPlayer[pId].dbfObj.stun.duration = dbPlayer[pId].dbfObj.stun.duration - delta > 0 ? dbPlayer[pId].dbfObj.stun.duration - delta : 0;
        dbPlayer[pId].dbfObj.dot.duration = dbPlayer[pId].dbfObj.dot.duration - delta > 0 ? dbPlayer[pId].dbfObj.dot.duration - delta : 0;
        dbPlayer[pId].dbfObj.blind.duration = dbPlayer[pId].dbfObj.blind.duration - delta > 0 ? dbPlayer[pId].dbfObj.blind.duration - delta : 0;
    }

    /**
     * wrap of tickCoolDown & tickHeartBeat. write in normal update style
     * 这个 delta 可以受到玩家 debff 减速的影响
     * @param delta
     * @return healResult = 1 : selfHeal, 0 : no regen
     */
    static update(delta){
        // 减速逻辑
        if(dbPlayer[pId].dbfObj.hst.duration > 0){
            let slowRate = (1 - dbPlayer[pId].dbfObj.hst.value).toFixed(4); // should always be 0.2
            delta = Math.round(delta * slowRate);    // 通过 update 实现 减速
        }
        // debuff tickDown
        CharacterModel.tickDebuff(delta);
        CharacterModel.tickCoolDown(delta);
        return CharacterModel.tickHeartBeat(delta);        // reg also trigger debuff effect - if dot
    }

    static resetCoolDown(idx){
        dbPlayer[pId].cdList[idx].cur = 0;
        dbPlayer[pId].cdList[idx].ready = false;
        CharacterModel.resetGCD();
        for(let i=0;i<5;i++){
            if(idx === i) {continue;}
            if(dbPlayer[pId].cdList[i].ready){
                dbPlayer[pId].cdList[i].cur = dbPlayer[pId].cdList[i].max - dbPlayer[pId].gcdObj.max;
            }else{  // 本技能cd所需要的时间小于gcd,所需要的时间改为gcd的时间。
                if(dbPlayer[pId].cdList[i].max -  dbPlayer[pId].cdList[i].cur < dbPlayer[pId].gcdObj.max){
                    dbPlayer[pId].cdList[i].cur = dbPlayer[pId].cdList[i].max - dbPlayer[pId].gcdObj.max;
                }else{
                    // 本技能cd所需要的时间大于gcd,什么都不做就可以了。
                }
            }
            dbPlayer[pId].cdList[i].ready = false;
        }
    }
    static resetGCD(){
        dbPlayer[pId].gcdObj.cur = 0;
        dbPlayer[pId].gcdObj.ready = false;
    }

    /**
     * 把所有 cd 都重制为 cur=0 没有冷却的状态。
     */
    static resetAllCD(){
        CharacterModel.resetGCD();
        for(let i=0;i<5;i++){
            dbPlayer[pId].cdList[i].cur = 0;
            dbPlayer[pId].cdList[i].ready = false;
        }
    }

    /**
     * 移除单个debuff
     * @param int_skill_id - debuff ID
     */
    static removeDebuff(int_skill_id){
        switch (int_skill_id){
            case 815:   // 深寒 - hst
                dbPlayer[pId].dbfObj.hst.duration=0;
                // dbPlayer[pId].dbfObj.hst.fade();
                break;
            case 816:   // 剧毒
                dbPlayer[pId].dbfObj.dot.duration=0;
                dbPlayer[pId].dbfObj.dot.value=0;
                break;
            case 817:   // 盲目
                dbPlayer[pId].dbfObj.blind.duration=0;
                break;
            case 818:   // stun
                dbPlayer[pId].dbfObj.stun.duration=0;
                break;
            case 819:   // -spd
                dbPlayer[pId].dbfObj.spd.duration=0;
                break;
            default:
                break;
        }
    }

    /**
     * 移除所有debuff
     */
    static removeDebuffAll(){
        dbPlayer[pId].dbfObj = {hst:{duration:0,value:0.2},spd:{duration:0,value:0.2},stun:{duration:0},blind:{duration:0},dot:{duration:0,value:0}};
    }

    static isCDReady(idx){
        return dbPlayer[pId].gcdObj.ready && dbPlayer[pId].cdList[idx].ready;
    }

    static updateShipDataFromInventory(){   // 165 - 173
        dbPlayer[pId].shipId = 0;
        for(let i=0;i<dbPlayer[pId].inventory.length;i++){
            if(dbPlayer[pId].inventory[i].id >=165 && dbPlayer[pId].inventory[i].id <=173){
                dbPlayer[pId].shipId = dbPlayer[pId].inventory[i].id - 164;
                break;
            }
        }
    }
    static removeShip(){
        dbPlayer[pId].shipId = 0;
        dbPlayer[pId].shipSupply = 0;
        dbPlayer[pId].shipFitSpeed = 0;   // 0,1 2 3
        dbPlayer[pId].shipFitCargo = 0;   // 0,1 2 3
        dbPlayer[pId].shipPortId = 0;  // 船只停靠港口
        dbPlayer[pId].cargoArr = [];
    }

    static getShipCargoCapacity(){
        let cap = gDB.getShipCapacity(dbPlayer[pId].shipId,dbPlayer[pId].shipFitCargo);
        return cap<=0? 0 : cap;
    }
    static getShipCargoUsed(){
        let used = 0;
        for(let i=0;i<dbPlayer[pId].cargoArr.length;i++){
            used = used + dbPlayer[pId].cargoArr[i].count;
        }
        return used;
    }

    static consumeDaily(){
        if(dbPlayer[pId].moveOn === 'ship'){
            if(parseInt(dbPlayer[pId].shipId) <= 0){    // 没船
                CharacterModel.die();
            }
            let ship = gDB.getShipById(dbPlayer[pId].shipId);   // 没船
            if(ship === undefined){
                CharacterModel.die();
            }
            dbPlayer[pId].shipSupply = dbPlayer[pId].shipSupply - parseInt(ship.consumption);
            if(dbPlayer[pId].shipSupply <= 0){  // 船只补给不够
                CharacterModel.die();
            }
            if(dbPlayer[pId].shipSupply / stringToNumber(ship.supplyMax) <= 0.2){
                gGui.animateShake("#foodDiv");
            }
        }
        if(dbPlayer[pId].moveOn === 'foot') {
            // dbPlayer[pId].food = dbPlayer[pId].food - playerFoodDaily;
            CharacterModel.eat(-playerFoodDaily);
            // console.log("daily food = "+ playerFoodDaily);
        }
        if(dbPlayer[pId].moveOn === 'horse'){
            // dbPlayer[pId].food = dbPlayer[pId].food - horseFoodDaily;
            CharacterModel.eat(-horseFoodDaily);
        }
        // if(dbPlayer[pId].food<=0){
        //     CharacterModel.die();
        // }
        if(dbPlayer[pId].food <= 30){ gGui.animateShake("#foodDiv"); }
        gGui.updateHUDSupply();
    }

    /**
     * 检查指定外功招式与当前装备的武器是否匹配
     * @param kfType - kf类型 拳掌 / 剑 / 刀 等, 对应 装备物品栏index=3
     * @returns {boolean}   如果匹配返回 true,否则 false
     */
    static isWgUsableWithEquip(kfType){
        let iid = dbPlayer[pId].eqList[3];
        let item = gDB.getItemById(iid);
        if((iid === 0) || (item === undefined)){  // 空手，可以使用拳掌
            return (kfType === 'fist');
        }
        let strSkill = ItemModel.getWeaponSkill(item.itemCate);
        if(strSkill === kfType ) return true;
        return (kfType === 'fist');
        return false;
    }

    /**
     * 返回玩家的装备的武器类型
     * @return {string} ：fist sword machete spear ejection
     */
    static getPlayerWeapon(){
        let iid = dbPlayer[pId].eqList[3];
        let item = gDB.getItemById(iid);
        if((iid === 0) || (item === undefined)){  // 空手，可以使用拳掌
            return 'fist';
        }
        return ItemModel.getWeaponSkill(item.itemCate);
    }


    /** added todo: untested */
    // called when the player equip weapons
    static resetActiveKF(){
        let pObj = dbPlayer[pId];
        pObj.wgaId = -1;pObj.wgObj = {};
        pObj.ngaId = -1;pObj.ngObj = {};
        pObj.qgaId = -1;pObj.qgObj = {};
        BuffWidget.updateBuff();
    }
    static isEquipped(intItemId){
        return dbPlayer[pId].eqList.indexOf(intItemId) >=0;
    }
    static isEquipAble(iObj){
        // 检查学习条件：1。 内功是否匹配 2。 技能是否达标 3. 是否还有空位
        let pObj = dbPlayer[pId];
        let skillMin = KFModel.getSkillMinToLearn(iObj.itemLevel);
        // console.log('skillmin = '+skillMin);
        // console.log(pObj);
        // console.log(iObj);
        if(iObj.kfId<=0){ return true;}
        let kfObj = gDB.getKFById(iObj.kfId);

        switch(kfObj.kfType){
            case 'fist': if(pObj.baseSkill.fist < skillMin || CharacterModel.getAvaSlotForKF('wai') == -1){return false;}break;
            case 'sword': if(pObj.baseSkill.sword < skillMin || CharacterModel.getAvaSlotForKF('wai') == -1){return false;}break;
            case 'machete': if(pObj.baseSkill.machete < skillMin || CharacterModel.getAvaSlotForKF('wai') == -1){return false;}break;
            case 'spear': if(pObj.baseSkill.spear < skillMin || CharacterModel.getAvaSlotForKF('wai') == -1){return false;}break;
            case 'ejection': if(pObj.baseSkill.ejection < skillMin || CharacterModel.getAvaSlotForKF('wai') == -1){return false;}break;
            case 'enchant': if(pObj.baseSkill.enchant < skillMin || CharacterModel.getAvaSlotForKF('nei') == -1){return false;}break;
            case 'qing': if(pObj.baseSkill.swift < skillMin || CharacterModel.getAvaSlotForKF('qing') == -1){return false;}break;
            case 'heal':
                if(pObj.baseSkill.heal < skillMin){
                    // console.log("heal skill less than skillMin");
                    return false;
                }else{
                    // console.log("heal skill greater than skillMin");
                }
            break;
            default:break;
        }

        // console.log(kfObj);
        return kfObj.kfNeili == globalStrings.KF_INNER_TYPE_ANY || kfObj.kfNeili == pObj.neili;
    }

    static forgetKF(kfId){
        // get kfType
        // if it were active, disable
        // find kf in list
        // reset to empty
        let kfObj = gDB.getKFById(kfId);
        let idx = -1;
        switch (kfObj.kfType){
            case 'nei':
                idx = CharacterModel.getKFIndexById(kfId);
                if(idx>-1){
                    if(dbPlayer[pId].ngaId == idx){dbPlayer[pId].ngaId = -1;}
                    dbPlayer[pId].ngList[idx] = {}; // todo: 这里存在一个需要测试的点：已经学会并且正在修习，这时候忘记，应该重新学习。
                }
                break;
            case 'qing':
                idx = CharacterModel.getKFIndexById(kfId);
                if(idx>-1){
                    if(dbPlayer[pId].qgaId == idx){dbPlayer[pId].qgaId = -1;}
                    dbPlayer[pId].qgList[idx] = {}; // todo: 这里存在一个需要测试的点：已经学会并且正在修习，这时候忘记，应该重新学习。
                }
                break;
            case 'fist':
                idx = CharacterModel.getKFIndexById(kfId);
                if(idx>-1){
                    if(dbPlayer[pId].wgaId == idx){dbPlayer[pId].wgaId = -1;}
                    dbPlayer[pId].wgList[idx] = {}; // todo: 这里存在一个需要测试的点：已经学会并且正在修习，这时候忘记，应该重新学习。
                }
                break;
            case 'sword':
                idx = CharacterModel.getKFIndexById(kfId);
                if(idx>-1){
                    if(dbPlayer[pId].wgaId == idx){dbPlayer[pId].wgaId = -1;}
                    dbPlayer[pId].wgList[idx] = {}; // todo: 这里存在一个需要测试的点：已经学会并且正在修习，这时候忘记，应该重新学习。
                }
                break;
            case 'machete':
                idx = CharacterModel.getKFIndexById(kfId);
                if(idx>-1){
                    if(dbPlayer[pId].wgaId == idx){dbPlayer[pId].wgaId = -1;}
                    dbPlayer[pId].wgList[idx] = {}; // todo: 这里存在一个需要测试的点：已经学会并且正在修习，这时候忘记，应该重新学习。
                }
                break;
            case 'spear':
                idx = CharacterModel.getKFIndexById(kfId);
                if(idx>-1){
                    if(dbPlayer[pId].wgaId == idx){dbPlayer[pId].wgaId = -1;}
                    dbPlayer[pId].wgList[idx] = {}; // todo: 这里存在一个需要测试的点：已经学会并且正在修习，这时候忘记，应该重新学习。
                }
                break;
            case 'ejection':
                idx = CharacterModel.getKFIndexById(kfId);
                if(idx>-1){
                    if(dbPlayer[pId].wgaId == idx){dbPlayer[pId].wgaId = -1;}
                    dbPlayer[pId].wgList[idx] = {}; // todo: 这里存在一个需要测试的点：已经学会并且正在修习，这时候忘记，应该重新学习。
                }
                break;
            default: break;
        }
        CharacterModel.calcTotalState();

    }

    /**
     * 更改外功的先后次序 - 快速战斗逻辑中，优先使用考前的武功
     * @param idx
     */
    static setWGPriority(idx){
        let wgObj = dbPlayer[pId].wgList.splice(idx,1);
        if(wgObj.length === 1){
            dbPlayer[pId].wgList.unshift(wgObj[0]);
        }
    }

    static getHurt(dmg){
        // attacker hit check - skip , not in this loop
        // player Guard - ommitted

        // player doge -1
        // player par -2
        // player get Hurt
        // player dmg reduce dmg
        // player hp change

        // update 20221202 - stun 状态无法闪避
        let dge = dbPlayer[pId].dbfObj.stun.duration > 0 ? 0 :  Math.round(dbPlayer[pId].totalState.dge * 10000);
        let rnd = GlobalFunction.getRand(0,10000);
        // console.log("闪避豁免：dge="+dge+" rnd="+rnd);
        if(rnd < dge ){return -1;}

        // update 20221202 - stun 状态无法招架
        let par = dbPlayer[pId].dbfObj.stun.duration > 0 ? 0 : Math.round(dbPlayer[pId].totalState.par * 10000);
        rnd = GlobalFunction.getRand(0,10000);
        // console.log("招架豁免：par="+par+" rnd="+rnd);
        if(rnd < par){return -2;}

        // 如果 stun，防御无效
        let dmgRate = dbPlayer[pId].dbfObj.stun.duration > 0 ? 1 : 1.0-dbPlayer[pId].totalState.def;
        let actDmg = Math.floor(dmg * dmgRate);
        // console.log("玩家受到伤害=" + dmg +"，实际伤害="+actDmg);
        dbPlayer[pId].curHP -= actDmg;
        if(dbPlayer[pId].curHP <=0 ){
            // 2021.11.25 死亡的判定放到 gQuickBattle中。
            // CharacterModel.die();
            dbPlayer[pId].curHP = 0;
        }
        return actDmg;
    }

    /** 被dot 攻击 **/
    static getHurtWithRis(dmg){
        let red = dbPlayer[pId].totalState.ris / 5; // 500 = 全抗
        let actDmg = Math.ceil(dmg * (1-red));
        actDmg = actDmg > 0 ? actDmg : 0;

        dbPlayer[pId].curHP -= actDmg;
        if(dbPlayer[pId].curHP <=0 ){
            dbPlayer[pId].curHP = 0;
        }
        // console.log("dot dmg = "+actDmg);
        return actDmg;
    }

    /**
     * 玩家被debuff 命中，增加debuff 效果
     * 一个带毒的效果由两部分组成，一个直接伤害的dd,一个debuff，debuff附带减速效果和伤害效果，伤害效果利用dot实现，命中时无伤害，时间到了之后有伤害
     * @param dbfObj {{skill_id:intSkill_id,duration:last_time_in_ms,dmgRate:dbf_damage_without_ris,cdMax:tick_intval_in_s,dmg:mob_damage}}
     */
    static addDebuff(dbfObj){
        // 是否考虑dbf 合并?
        // 加入之后根据tick 调整数据
        switch (dbfObj.skill_id){
            case 815:       // 815	深寒	攻击附带减速（hst）效果20%，持续6秒
                break;
            case 816:       // 816	剧毒	攻击附带中毒效果，12秒内造成原伤害100%伤害
                break;
            case 817:       // 817	暗影	盲目，无法攻击与移动，持续2秒
                break;
            case 818:       // 818	攻击附带击退打断效果，距离60像素
                break;
            case 819:       // 819	寒潮	攻击附带降低移动速度效果，持续2秒
                break;
        }

    }

    /**
     * 判断 mob 的debuff 是否命中玩家
     * @param intMobLevel 默认应该等于 mob.level + INT_DEFAULT_MOB_DEBUFF_HIT_RATE (40)
     * @return {boolean} 命中=true 没有命中=false
     */
    static isDebuffHit(intMobLevel) {
        // console.log("mobLevel="+intMobLevel+" ris="+(dbPlayer[pId].totalState.ris * 100));
        let saving = Math.round(intMobLevel/1.25 + GlobalConfig.INT_DEFAULT_MOB_DEBUFF_HIT_RATE - (dbPlayer[pId].totalState.ris * 100));
        let rnd = GlobalFunction.getRand(0,100);
        // console.log("debuff saving:"+ rnd + " / "+ saving + " mob level="+intMobLevel);
        return rnd < saving;
    }

    /**
     * -- 1vM 新版本quickbattle逻辑，用来替换原来的 debuffManager
     * 玩家被debuff 命中，增加debuff效果， v2 快速战斗版本，支持 1 v N
     * @param mobSkill_id: mob skill id
     * @param value :  主要用作计算dot的累加伤害，其他debuff无效
     */
    static gainDeBuff(mobSkill_id,value=0){
        value = value===undefined ? 0 : value;
        switch (mobSkill_id){
            case 815:       // 815	深寒	攻击附带减速（hst）效果20%，持续6秒
                // {"skill_id":815,"affix":"深寒","desc":"攻击附带减速（hst）效果20%，持续6秒","type":"passive","cdMax":"","duration":6000,"range":"","dmgRate":0.2,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                // - hst
                dbPlayer[pId].dbfObj.hst.duration = dbPlayer[pId].dbfObj.hst.duration + 6000;
                dbPlayer[pId].dbfObj.hst.value = 0.2;
                break;
            case 816:       // 816	剧毒	攻击附带中毒效果，12秒内造成原伤害100%伤害
                            // {"skill_id":816,"affix":"剧毒","desc":"攻击附带中毒效果，60秒内造成持续伤害","type":"passive","cdMax":5,"duration":60000,"range":"","dmgRate":0.25,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                            // - hp
                let tickInMs = (dbPlayer[pId].tickInterval * 1000);
                let restTicks = Math.floor(dbPlayer[pId].dbfObj.dot.duration / tickInMs);
                let restDmg = Math.round(dbPlayer[pId].dbfObj.dot.value * restTicks);
                let totalDmg = restDmg + value;
                dbPlayer[pId].dbfObj.dot.duration = 12000;  // updated 2022.12.02 毒的持续时间都是12秒，伤害叠。
                let totalTickNum = Math.floor(dbPlayer[pId].dbfObj.dot.duration / tickInMs);
                dbPlayer[pId].dbfObj.dot.value = Math.round(totalDmg / totalTickNum);
                break;
            case 817:       // 817	暗影	盲目，无法攻击与移动，持续2秒
                            // {"skill_id":817,"affix":"暗影","desc":"盲目，无法视物，持续2秒","type":"passive","cdMax":"","duration":2000,"range":"","dmgRate":"","wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                            // - 命中率 hit - 100%
                dbPlayer[pId].dbfObj.blind.duration = dbPlayer[pId].dbfObj.blind.duration + 2000;
                // dbPlayer[pId].dbfObj.blind.duration = 2000;
                // CharacterModel.handlerHitSaving :  在玩家攻击逻辑里面，判断blind，并实装miss 命中
                break;
            case 818:       // 818	攻击附带击退打断效果，距离60像素
                            // {"skill_id":818,"affix":"击退","desc":"攻击附带击退打断效果，距离60像素","type":"passive","cdMax":"","duration":"","range":"","dmgRate":"","wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                            // - stun , update delta 停止，防御无效
                dbPlayer[pId].dbfObj.stun.duration = dbPlayer[pId].dbfObj.stun.duration + 2000;
                // done 在玩家受伤逻辑里面，判断 stun，并且实装 防御无效 效果
                // 放弃: 在CharacterModel.update 里面，判断 stun - 注意，stun了之后不能跟mob一样，直接return，因为还要算其他debuff 的衰减
                // 放弃的后果，玩家没有击晕，只有击退。击退状态仍然可以进行攻击等行为。即，理解为玩家一直具有霸体，但是可以被打飞。
                break;
            case 819:       // 819	寒潮	攻击附带降低移动速度效果，持续6秒
                            // {"skill_id":819,"affix":"寒潮","desc":"攻击附带降低移动速度效果，持续2秒","type":"passive","cdMax":"","duration":2000,"range":"","dmgRate":0.2,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""}
                            // - spd
                dbPlayer[pId].dbfObj.spd.duration += 6000;
                dbPlayer[pId].dbfObj.spd.value = 0.2;
                // todo: 在移动的情况下，特别是真实场景战斗，控制移动速度效果
                break;
            default:
                break;
        }
    }

    static die(scene){
        // return; // debug purpose
        dbPlayer[pId].isAlive = false;
        $(".popover").popover('hide').popover('dispose');
        $(".modal-backdrop").remove();
        // 停止phaser 响应
        flagInGame = false;
        $(".modal").modal('hide');
        gGui.hideHUD();
        BubbleWidget.hideBubble();
        // $("#guiDiv div").hide();
        $("#uiHelpDiv").hide();
        $("#game_control_help_wrap").hide();
        $("#sysToast").hide();
        $("#miniMapDiv").hide();

        let reason = "GAME OVER";
        if (dbPlayer[pId].food <=0) reason = reason+"<br>"+globalStrings.STARVATION;

        $("#gameOverDiv").html(reason).show();

        // 锁定除了 esc 之外的所有按键和鼠标点击
        // 关闭所有modal，并且不接受快捷键输入
        if(scene == null){
            // scene = game.scene.scenes[game.scene.scenes.length-1];
            // console.log(scene);
            scene = game.scene.getScene('WorldScene');
        }
        // scene.player.stop();
        scene.player.sprite.stop();
        scene.player.sprite.body.stop();
        scene.player.sprite.body.destroy();
        scene.cameras.default.flash(3000,235,104,100,true);
        if(scene.playMusic) scene.playMusic("death");

        setTimeout(gGui.__onBtnBackToMainMenuConfirm, 10000);

    }
    static eat(amt){
        let tmp = dbPlayer[pId].food + amt;
        dbPlayer[pId].food = tmp > 120 ? 120 : tmp;
        if(dbPlayer[pId].food <=0){
            CharacterModel.die();
            dbPlayer[pId].food = 0;
            return;
        }
        CharacterModel.calcTotalState();
    }

    static tick(){
        CharacterModel.healSelf(dbPlayer[pId].totalState.reg);
        CharacterModel.manaSelf(dbPlayer[pId].totalState.rem);
        if(dbPlayer[pId].dbfObj.dot.duration > 0 ){
            CharacterModel.getHurtWithRis(dbPlayer[pId].dbfObj.dot.value);
        }
    }
    static healSelf(amt){
        if(isNaN(amt)) return;
        let intAmt = parseInt(amt);
        if(intAmt<=0) return;
        dbPlayer[pId].curHP = (dbPlayer[pId].curHP+intAmt > dbPlayer[pId].maxHP) ? dbPlayer[pId].maxHP : (dbPlayer[pId].curHP+intAmt);
    }
    static manaSelf(amt){
        if(isNaN(amt)) return;
        let x = dbPlayer[pId].curMP+parseInt(amt);
        dbPlayer[pId].curMP = x < 0 ? 0 : x;
        dbPlayer[pId].curMP = (x > dbPlayer[pId].maxMP) ? dbPlayer[pId].maxMP : x;
    }

    static restorePlayerState(){
        CharacterModel.removeDebuffAll();
        CharacterModel.calcTotalState();
        dbPlayer[pId].curHP = dbPlayer[pId].maxHP;  // HP满
        dbPlayer[pId].curMP = dbPlayer[pId].maxMP;  // MP满
        CharacterModel.resetAllCD();    // 所有cd没好
        CharacterModel.resetCombo();
    }

    /**
     * 治疗触发的移除debuff 逻辑。不同等级的效果不同。
     * @param zlId
     * @param amt
     */
    static detoxify(zlId,amt){
        // 移除dot效果 深寒815 / 剧毒816 / 817盲目-防御无效 / 818击退 / 819寒潮
        if(zlId >=4){ CharacterModel.removeDebuff(819);}   // 妙手回春 - 移除减速效果 spd
        if(zlId >=5){ CharacterModel.removeDebuff(815); }   // 治愈术 - 移除减速效果，hst
        if(zlId >=6){ CharacterModel.removeDebuff(818); }   // 易经洗髓 - 移除眩晕效果，stun
        if(zlId >=7){ CharacterModel.removeDebuff(816); }   // 三花聚顶 - 移除所有负面效果 ，包括剧毒
        if(zlId >=8){ CharacterModel.removeDebuff(817); }   // 脱胎换骨 - 移除所有负面效果，包括目盲

        // console.log("calling detoxify, healid =" + zlId);

        if(zlId <7){    // 无法完全移除剧毒效果，根据治疗量缓解毒发。
            if(amt<=0) return;
            if(dbPlayer[pId].dbfObj.dot.duration > 0){
                let newV = dbPlayer[pId].dbfObj.dot.value - amt;
                if(newV <=0){
                    dbPlayer[pId].dbfObj.dot = {duration:0,value:0};
                }else{
                    dbPlayer[pId].dbfObj.dot.value  = newV;
                }
            }
        }
    }

    static _skillHeal(){
        if(dbPlayer[pId].zlKfId <=0) return {"result":"fail","value":-1,"desc":globalStrings.QB_HEAL_NONE};
        let zl = gDB.getKFById(dbPlayer[pId].zlKfId);
        if(zl === undefined) return {"result":"fail","value":-2,"desc":globalStrings.QB_HEAL_INVALID};
        if(zl.kfType !== 'heal') return {"result":"fail","value":-3,"desc":globalStrings.QB_HEAL_NOT_CURE};
        if(zl.refId <= 0) return {"result":"fail","value":-4,"desc":globalStrings.QB_HEAL_ERROR};
        let zle = gDB.getZLById(zl.refId);
        if(zle === undefined) return {"result":"fail","value":-5,"desc":globalStrings.QB_HEAL_NO_MATCH};
        if(dbPlayer[pId].curMP < zle.cost) return {"result":"fail","value":-6,"desc":globalStrings.QB_NO_MANA};
        let zleAmount = zle.heal;
        if(zleAmount<=0) return {"result":"fail","value":-1,"desc":globalStrings.QB_HEAL_NONE};
        // zleAmount = Math.floor(zle.heal*(1+dbPlayer[pId].totalSkill.heal * 0.03));
        zleAmount = KFModel._getRealHeal(parseInt(zle.heal));
        //  检查药物
        if(dbPlayer[pId].zlMedId > 0) {
            let iCnt = CharacterModel.countItem(dbPlayer[pId].zlMedId);
            if(iCnt>0){
                let effect = MedicineModel.getMedEffectById(dbPlayer[pId].zlMedId);
                CharacterModel.removeItem(dbPlayer[pId].zlMedId,1);
                zleAmount = Math.round(zleAmount * effect);
            }
        }

        CharacterModel.detoxify(zle.zlId,zle.heal);
        CharacterModel.manaSelf(-zle.cost);
        CharacterModel.healSelf(zleAmount);
        return {"result":"succ","value":zleAmount,"name":zl.kfName};
    }
    // static isHealReady(){ return dbPlayer[pId].curMP >= dbPlayer[pId].level * 2;}
    /**
     * 执行治疗命令，如果成功返回正，如果失败返回负数。
     * @returns {{result: string, name: *, value: *}} -1=noKF -2=KFnotFound -3=notHealSkill -4=kfHealRefId<0 -5=kfHealRefError -6=notEnoughMana -7=CDNotReady 1=ok
     */
    static cmdDoSkillHeal(){
        if(!CharacterModel.isCDReady(4)) return {"result":"fail","value":-7,"desc":globalStrings.QB_CD};
        let healResult = CharacterModel._skillHeal();
        if(healResult.value<0) return healResult;
        CharacterModel.resetCoolDown(4);
        CharacterModel.resetGCD();
        return healResult;
    }

    static handlerDoWGAttack(idx){
        // let retObj = {"reason":"","damage":-10};
        if(( idx > 3) || (idx < 0)) return {"reason":globalStrings.QB_WG_IDX_ERR,"damage":-1};  // invalid idx
        // {kfId:14,kfLevel: 1}
        if(dbPlayer[pId].wgList[idx] === {})  return {"reason":globalStrings.QB_WG_NONE,"damage":-2}; // empty kf - not studied
        let kfId = dbPlayer[pId].wgList[idx].kfId;
        let kfLevel = dbPlayer[pId].wgList[idx].kfLevel;
        if((kfId <=0) || (kfLevel<=0))  return {"reason":globalStrings.QB_WG_DATA_ERR,"damage":-3}; // invalid kf info
        let kf = gDB.getKFById(kfId);
        // {"kfId":3,"kfName":"桃花掌法","kfNeili":"阴柔","kfTier":3,"kfType":"fist","refId":2,"wgeDmgR":0.35,"wgeDistR":0.6,"wgeRadiusR":0.45,"dbfId":3,"dbfSpdR":0.45,"dbfHstR":0.45,"dbfDmgR":0.45,"dbfDurR":0.45,"hitR":0,"atkR":0,"defR":0,"crtR":0,"crmR":0,"hstR":0,"dgeR":0,"parR":0,"fdbR":0,"fdhR":0,"risR":0,"lukR":0,"regR":0,"remR":0,"HPMaxR":0,"MPMaxR":0},
        if(undefined === kf)  return {"reason":globalStrings.QB_WG_UN_DEFINED,"damage":-4}; // no kf found
        if(!CharacterModel.isWgUsableWithEquip(kf.kfType))  return {"reason":globalStrings.QB_WG_NOT_MATCH,"damage":-5}; // 外攻与武器不匹配

        // 检查冷却时间
        if(!CharacterModel.isCDReady(idx)) return {"reason":globalStrings.QB_CD,"damage":-7};   // 冷却中

        let kfObj = KFModel.initWithLevel(kfId,kfLevel);
        // 检查魔法消耗
        let mana = kfObj.cost;
        if(dbPlayer[pId].curMP < mana) return {"reason":globalStrings.QB_NO_MANA,"damage":-6};   // 冷却中
        CharacterModel.manaSelf(-mana);
        let strKFName = kfObj.dbObj.kfName;
        let dbfInfo = undefined;
        if(kfObj.dbfObj){
            // dbfDmg : NaN
            // dbfDur : 6.704992
            // dbfHst : 4.849664
            // dbfObj : {dbfId: 6, dbfName: '奇痒', dbfDesc: '攻击速度降低 {dbfHstR} %', dbfArg1: 32}
            // dbfRat : 0.356
            // dbfSpd : 4.695744
            // dbfInfo = {
            //     'dbfObj':kfObj.dbfObj,
            //     "dbfDmg":kfObj.dbfDmg,
            //     "dbfDur":kfObj.dbfDur,
            //     "dbfHst":kfObj.dbfHst,
            //     "dbfRat":kfObj.dbfRat,
            //     "dbfSpd":kfObj.dbfSpd
            // };
        }
        return {"reason":"施放成功","damage":kfObj.wgeDmgActive,'kfName':strKFName,'wgeObj':kfObj.wgeObj,"kfObj":kfObj};  // 普通命中
    }

    static resetCombo(){
        dbPlayer[pId].comboCount = 0;
        gGui.drawHUD(); // should hide the combo div;
    }
    static addCombo(){
        dbPlayer[pId].comboCount++;
        gGui.drawHUD();
    }

    static handlerHitSaving(intMobLevel, originResult){
        // 计算命中 - 同级别基础命中率96%，每相差1级别相差1%
        let hitFix = 100*(dbPlayer[pId].level - intMobLevel) + 9600;
        let hit = Math.floor(dbPlayer[pId].totalState.hit * 10000) + hitFix;
        // updated 20221202 - debuff.blind
        if(dbPlayer[pId].dbfObj.blind.duration>0){
            return {"reason":globalStrings.QB_BLIND,"damage":0,'kfName':originResult.kfName};// 没有命中 - 但是算作攻击完成
        }

        let hnd = GlobalFunction.getRand(0,10000);
        // let strKFType = KFModel.getKFType(kfObj.dbObj.kfType);
        // console.log(strKFName+"命中豁免：hit="+hit+" rnd="+hnd);
        if(hnd < hit ){
            // 命中
            return {"reason":globalStrings.QB_HIT,"damage":originResult.damage,'kfName':originResult.kfName};  // 普通命中
        }else{
            return {"reason":globalStrings.QB_NOT_HIT,"damage":0,'kfName':originResult.kfName};// 没有命中 - 但是算作攻击完成
        }
    }

    static handlerCritSaving(originRet,stabFlag = false){
        // 计算暴击概率
        let pCrt = stabFlag ? (dbPlayer[pId].totalState.crt + 0.5) : dbPlayer[pId].totalState.crt;
        let crt = Math.round(pCrt * 10000);
        let rnd = GlobalFunction.getRand(0,10000);
        // console.log("暴击豁免：crt="+crt+" rnd="+rnd);

        if(rnd < crt ){
            let damage = Math.round(originRet.damage * dbPlayer[pId].totalState.crm);
            return {"reason":globalStrings.QB_CRIT,"damage":damage,'kfName':originRet.kfName};  // 暴击命中
        }
        return {"reason":globalStrings.QB_HIT,"damage":originRet.damage,'kfName':originRet.kfName};  // 普通命中
    }

    /**
     * 进行外攻攻击 - 这个函数为 oneOnOne 专用。因为会控制 冷却，使用的是frame逻辑
     * @param idx - int [0,1,2,3] 对应 wgList 0-3
     * @param intMobLevel
     * @returns
     */
    static cmdDoWGAttack(idx, intMobLevel){
        let ret = CharacterModel.handlerDoWGAttack(idx);
        if(ret.damage > 0){
            ret = CharacterModel.handlerHitSaving(intMobLevel,ret);
        }
        if(ret.damage > 0){
            ret = CharacterModel.handlerCritSaving(ret);
        }
        // 重置冷却
        CharacterModel.resetCoolDown(idx);
        CharacterModel.resetGCD();
        return ret;
    }

    // // 击杀任何怪物之后调用，用于更新任务中需要击杀的怪物数量
    // // 注意：不同任务不能要求击杀同一种怪物，否则会有问题。done：加入 taskId 即可。
    // 使用 addKillCount 代替
    // static updateKillCount(mobId){
    //     for(let i=0;i<dbPlayer[pId].killList.length;i++){
    //         if(parseInt(dbPlayer[pId].killList[i].mobId) === parseInt(mobId)){
    //             dbPlayer[pId].killList[i].count = (dbPlayer[pId].killList[i].count + 1 > dbPlayer[pId].killList[i].max) ? dbPlayer[pId].killList[i].max : (dbPlayer[pId].killList[i].count + 1);
    //             // break;
    //         }
    //     }
    // }

    /**
     * 判断当前角色是否拥有 某 物品
     * @param intItemId - 物品编号
     * @returns {boolean}
     */
    static hasItem(intItemId){
        for(let i=0;i<dbPlayer[pId].inventory.length;i++){
            if(parseInt(dbPlayer[pId].inventory[i].id) === parseInt(intItemId)) return true;
        }
        return false;
    }

    /**
     * 判断当前角色是否拥有 船
     * @returns {boolean} - True=有船 false=没有船
     */
    static hasShip(){
        let INT_SHIP_ID_MIN = 165; let INT_SHIP_ID_MAX = 173;
        for(let i=INT_SHIP_ID_MIN;i<=INT_SHIP_ID_MAX;i++){
            if(CharacterModel.hasItem(i)){
                return true;
            }
        }
        return false;
    }

    static hasHorse(){
        return (CharacterModel.hasItem(2) || CharacterModel.hasItem(3));
    }

    static countItemNotEquipped(intItemId){
        let cnt = 0;
        for(let i=0;i<dbPlayer[pId].inventory.length;i++){
            if(parseInt(dbPlayer[pId].inventory[i].id) === parseInt(intItemId)){
                cnt += dbPlayer[pId].inventory[i].count;
            }
        }
        if(dbPlayer[pId].eqList.indexOf(intItemId)>=0) cnt--;
        return cnt;
    }

    static countItem(intItemId){
        let cnt = 0;
        for(let i=0;i<dbPlayer[pId].inventory.length;i++){
            if(parseInt(dbPlayer[pId].inventory[i].id) === parseInt(intItemId)){
                cnt += dbPlayer[pId].inventory[i].count;
            }
        }
        return cnt;
    }

    /**
     * 当前玩家获取物品
     * @param intItemId 整形 物品id
     * @param count 整形 数量 非负 -3=参数异常 -4=唯一物品重复 -1=背包已满64 0=堆叠数异常  1=成功 2=成功并重新分堆 3=部分成功，重新分堆后放不下丢失了部分。
     */
    static gainItem(intItemId,count){
        // 查找 id 是否存在
        // 如果存在，添加数量
        // 如果不存在，新增对象和数量 - 检查背包空位是否足够=返回-1
        // 都有 - 对刚才增加的数量，检查最大堆叠数，超出的分堆
        // 都有 - 检查背包空位是否足够=返回-2
        // 返回 - 1=成功 2=成功且超出堆叠后重新分组 -1=没有足够空位 -2=没有足够空位添加了部分 0=item未发现 -3=数量异常 -4=唯一物品无法重复创建
        if(count <= 0) return -3;   // 参数异常
        // bug-fixing : 加入唯一物品验证
        let itemObj = gDB.getItemById(intItemId);
        if(itemObj === undefined) return -3;    // 参数异常
        if((parseInt(itemObj.unique) === 1) && (CharacterModel.countItem(intItemId) >=1 )){
            return -4;  // 唯一物品重复
        }
        let maxAllowed = gDB.getItemStackById(intItemId);
        if(!maxAllowed) return 0;   // 堆叠数获取异常
        let idx = -1;
        let pi = dbPlayer[pId].inventory;
        // bug-fix: 如果2堆，1堆50，1堆2。总数是52。但是idx 只会查到50的那堆，总数也不对。
        // 从后面往前面找，而不是从前面往后。 // 还是不对
        // 应该找第一个不等于stock_max 的

        for(let i=pi.length-1;i>=0;i--){
            if((pi[i].id === intItemId) && (pi[i].count !== maxAllowed)){
                idx = i;
                break;
            }
        }

        if(idx>=0){ // 物品已经有了，找到了可以放的idx
            // bug-fix 需要统计背包里面，总共有多少个
            // let itemCountInInventory = 0;
            // for(let x=0;x<pi.length;x++){
            //     itemCountInInventory = pi[x].id === intItemId ? itemCountInInventory + pi[x].count : itemCountInInventory;
            // }
            // pi[idx].count += itemCountInInventory + count;
            pi[idx].count = pi[idx].count + count;
            // console.log("item exists, add count");
        }else{  // 物品不存在 或者 物品虽然有但是堆满了，应该另起一堆直接放入背包
            if(pi.length >= inventorySize){// inventory size
                return -1;  // 背包已满64
            }else{
                pi.push({"id":intItemId,"count":count});
                idx = pi.length-1;    // idx 指向正确的位置 = 最后的位置
            }
        }
        // 检查最大堆叠数量
        if(pi[idx].count > maxAllowed){
            // 递归分组，直到位置足够
            // 或者不用递归，计算需要几个位置
            let slot = Math.ceil(pi[idx].count / maxAllowed) - 1;  // 还需要几个额外的位置: 124/50 = 2 => 总共3个格子，额外2个。
            if(pi.length + slot > inventorySize){
                // 塞满后，不够
                slot = inventorySize - pi.length;
                for(let i=0;i<slot;i++){
                    pi.push({"id":intItemId,"count":maxAllowed});
                }
                return 3;   // 部分成功，部分重新分组后放不下丢失了。
            }else{
                // 能放得下
                let totalCount = pi[idx].count;
                let lastCount = totalCount % maxAllowed;
                lastCount = lastCount === 0 ? maxAllowed : lastCount;
                // bug: 100个，这里面算出来就不对了。
                pi[idx].count = maxAllowed;
                for(let i=0;i<slot;i++){
                    if(i === (slot -1)){
                        pi.push({"id":intItemId,"count":lastCount}); // 最后一个
                    }else{
                        pi.push({"id":intItemId,"count":maxAllowed});
                    }
                }
                return 2;   // 成功，重新分组成功
            }

        }else{
            return 1;   // 成功
        }
    }

    static removeItem(itemId,count){
        // bug - 需要200口粮，但是口粮的最大堆叠是100，所以逻辑错了。
        let intItemId = parseInt(itemId);
        let invCnt = CharacterModel.countItem(intItemId);
        if(invCnt < count) return;

        // let match = -1;
        let required = count;
        for(let i=0;i<dbPlayer[pId].inventory.length;i++){
            if(parseInt(dbPlayer[pId].inventory[i].id) === intItemId){
                required = required - dbPlayer[pId].inventory[i].count;
                if(required <0){    // 需要1个，堆叠10个 -> 数量减少
                    dbPlayer[pId].inventory[i].count = 0 - required;
                    return dbPlayer[pId].inventory[i].count;
                }
                if(required === 0){ // 需要10个，堆叠10个 -> 删除这堆
                    dbPlayer[pId].inventory.splice(i,1);
                    return 0;
                }
                if(required > 0){   // 需要20个，堆叠10个 -> 删除这堆，继续循环。
                    dbPlayer[pId].inventory.splice(i,1);
                    i--;
                }
            }
        }
        return -1;
    }

    /**
     * 添加任务击杀监控
     * @param intTaskId
     */
    static addKillForTask(intTaskId){
        let task = gDB.getTaskById(intTaskId);
        if(task.condition[0] !== 2) return;   // task 完成条件错误，不是杀怪
        let match = -1;
        for(let i=0;i<dbPlayer[pId].killList.length;i++){
            if(intTaskId === parseInt(dbPlayer[pId].killList[i].taskId)){
                match = i;
                dbPlayer[pId].killList[i].count = 0;
                break;
            }
        }
        if(-1===match){
            dbPlayer[pId].killList.push({taskId:intTaskId,mobId:parseInt(task.condition[1]),zoneId:task.zone_id,count:0,max:parseInt(task.condition[2])});
        }
    }
    static removeKillForTask(taskId){
        let match = -1;
        for(let i=0;i<dbPlayer[pId].killList.length;i++){
            if(parseInt(taskId) === parseInt(dbPlayer[pId].killList[i].taskId)){
                match = i;
                break;
            }
        }
        if(match!==-1){
            dbPlayer[pId].killList.splice(match,1);
        }
    }
    static addKillCountForTask(intZoneId,intMobId){
        //[{taskId:0,mobId:0,count:0,max:10}], 记录任务中需要击杀的怪物信息
        // if(dbPlayer[pId].taskActive.indexOf(intTaskId) < 0) return -1;
        let match = -1;
        for(let i=0;i<dbPlayer[pId].killList.length;i++){
            if(((intZoneId === parseInt(dbPlayer[pId].killList[i].zoneId))|| (dbPlayer[pId].killList[i].zoneId ===0) || (intZoneId === 0) || (intZoneId === 115) ) && (intMobId === parseInt(dbPlayer[pId].killList[i].mobId))){
                dbPlayer[pId].killList[i].count = dbPlayer[pId].killList[i].count + 1;
                // updated 2023.05.23 不同任务需要杀同样的怪物的时候，杀一个，多个任务都更新击杀。 自古南平/汉中 任务。
                match = 1;
            }
        }
        return match;
    }
    static getKillCountForTask(intTaskId,intMobId){
        //[{taskId:0,mobId:0,count:0,max:10}], 记录任务中需要击杀的怪物信息
        for(let i=0;i<dbPlayer[pId].killList.length;i++){
            if((intTaskId === parseInt(dbPlayer[pId].killList[i].taskId))   && (intMobId === parseInt(dbPlayer[pId].killList[i].mobId))){
                return dbPlayer[pId].killList[i].count;
            }
        }
        return 0;
    }
    static getKillRequiredForTask(intTaskId, intMobId){
        for(let i=0;i<dbPlayer[pId].killList.length;i++){
            if((intTaskId === parseInt(dbPlayer[pId].killList[i].taskId))   && (intMobId === parseInt(dbPlayer[pId].killList[i].mobId))){
                return dbPlayer[pId].killList[i].max;
            }
        }
        return -1;
    }

    /**
     * 添加任务诗词监控
     * @param taskId
     */
    static addPoemForTask(intTaskId){
        let match = -1;
        let task = gDB.getTaskById(intTaskId);
        if(task.condition[0] !== 4) return; // condition=4 诗词
        for(let i=0;i<dbPlayer[pId].poemList.length;i++){
            if(dbPlayer[pId].poemList[i].poemId === task.condition[1]){
                match = i;
                dbPlayer[pId].poemList[i].count = 0;
                break;
            }
        }
        if(match===-1){
            dbPlayer[pId].poemList.push({poemId:task.condition[1],count:0,max:parseInt(task.condition[2])});
        }
    }
    static addPoemCountForTask(intPoemId){
        //[{poemId:0,count:0,max:0}], 记录任务中需要击杀的怪物信息
        // if(dbPlayer[pId].taskActive.indexOf(intTaskId) < 0) return -1;
        for(let i=0;i<dbPlayer[pId].poemList.length;i++){
            if(intPoemId === dbPlayer[pId].poemList[i].poemId){
                dbPlayer[pId].poemList[i].count = dbPlayer[pId].poemList[i].count + 1;
                return 1;
            }
        }
        return -1;
    }

    /**
     * 移除任务的诗词监控
     * @param taskId
     */
    static removePoemForTask(intTaskId){
        // [{poemId:0,count:0,max:0}]
        let match = -1;
        let task = gDB.getTaskById(intTaskId);
        if(task.condition[0] !== 4) return; // condition=4 诗词
        for(let i=0;i<dbPlayer[pId].poemList.length;i++){
            if(dbPlayer[pId].poemList[i].poemId === task.condition[1]){
                match = i;
                break;
            }
        }
        if(match!==-1){
            dbPlayer[pId].poemList.splice(match,1);
        }
    }

    static removeActiveForTask(taskId){
        dbPlayer[pId].taskActive = dbPlayer[pId].taskActive.filter(function(item) {
            return item != taskId;
        });
    }

    /**
     * 是否完成过 poem。
     * @param intPoemId int 诗歌编号
     * @param intCount int 完成次数，默认1
     * @returns {boolean} true=完成 false=没有完成过
     */
    static isPoemDone(intPoemId, intCount = 1){
        for(let i=0;i<dbPlayer[pId].poemList.length;i++){
            if(parseInt(dbPlayer[pId].poemList[i].poemId) === parseInt(intPoemId)){
                if(parseInt(dbPlayer[pId].poemList[i].count) >= intCount){
                    return true;
                }
            }
        }
        return false;
    }

    static gainMoney(amount){
        dbPlayer[pId].money += parseInt(amount);
    }

    /**
     * 移除玩家船舱中的cargo - 注意，如果是同一个cargo 的 不同单价的分组，也要处理
     * @param intCargoId
     * @param intCargoCount
     */
    static removeCargoByCargoId(intCargoId,intCargoCount){
        // 总数不够辣么多
        let totalCount = CharacterModel.getCargoAmount(intCargoId);
        if(totalCount < intCargoCount) return;
        // 总数够的情况下，找第一堆
        let intIdx = -1;
        for(let i=0;i<dbPlayer[pId].cargoArr.length;i++){
            if(parseInt(dbPlayer[pId].cargoArr[i].cargoId) === intCargoId){
                intIdx = i;
                break;
            }
        }
        // console.log("found idx = "+intIdx);
        if(intIdx === -1) return;
        if(dbPlayer[pId].cargoArr[intIdx].count >= intCargoCount){  // 货物数量大于等于要移除的数量，直接移除
            CharacterModel.removeCargoByIdx(intIdx,intCargoCount);
        }else{
            // 要移除的很多，但是这次不够
            let countNextTime = intCargoCount - dbPlayer[pId].cargoArr[intIdx].count;
            CharacterModel.removeCargoByIdx(intIdx,dbPlayer[pId].cargoArr[intIdx].count);
            CharacterModel.removeCargoByCargoId(intCargoId,countNextTime);  // 递归
        }

    }
    static removeCargoByIdx(intIndex,intCargoCount){
        let newCnt = dbPlayer[pId].cargoArr[intIndex].count - intCargoCount;
        if(newCnt>0){
            dbPlayer[pId].cargoArr[intIndex].count = newCnt;
        }else{
            dbPlayer[pId].cargoArr.splice(intIndex,1);
        }
    }

    /**
     * 获取玩家cargo 总数
     * @param intCargoId
     * @returns {number}
     */
    static getCargoAmount(intCargoId){
        // bug-fix 20220216 同一个cargo 在不同价格的时候，会分成不同的组别，这时候统计的时候，就会有问题。
        let cnt = 0;
        for(let i=0;i<dbPlayer[pId].cargoArr.length;i++){
            if(parseInt(dbPlayer[pId].cargoArr[i].cargoId) === intCargoId){
                cnt += parseInt(dbPlayer[pId].cargoArr[i].count);
            }
        }
        return cnt;
    }

    static increaseFac(intCityId, facCount){
        let city = gDB.getCityById(intCityId);
        let intFacCount = parseInt(facCount);
        let intAvaCount = 1000 - city.fac_fc - city.fac_yw - city.fac_hd - city.fac_ts;
        if(intAvaCount <=0) return;
        intAvaCount = intAvaCount > intFacCount ? intFacCount : intAvaCount;
        city.fac_fc = parseInt(city.fac_fc) + intAvaCount;
    }

    /** omitted
     * 用于计算在大地图的步数，已实现踩地雷随机遇敌。暂时放弃这部分的设计。
     */
    static getStepsInWorld(){
        // let pObj = dbPlayer[pId];
        // pObj.worldPosX
    }
    static setStepsInWorld(){

    }
    static addStepsInWorld(){

    }
}