/***
 * 快速战斗静态库
 * 2021.09.28
 * @author JimDai
 * Updated 2022.11.09 - 支持 1vN
 */

const FLOAT_AGGRO_RATE = 0.05;      // 战斗过程中，更多怪物参战的概率，加入规则：命中，则mobList顺位中后一位会主动攻击的加入，只加入1个
const FLOAT_DE_AGGRO_RATE = 0.05;   // 战斗过程中，怪物脱离的概率
const INT_AGGRO_INTVAL = 6000;  // 每隔6 秒有一次add机会
const INT_DE_AGGRO_INTVAL = 5000; // 每隔 5 秒可能有怪物脱离战斗
const FLOAT_WGE_PROBABILITY_THRESHOLD = 0.05; // 概率低于 0.05 的 认为不发生
const INT_QUICK_DELTA_TIME = 100; // 刷新的粒度，相当于 1秒钟 /100 = 10帧
// const INT_MOB_DEBUFF_TRIGGER_RATE = 40; // 40%概率触发 debuff

class GQuickBattle{
    /* 第一版本 - 1v1 单挑 */
    // oMob 已经拼装成功的 Mob: mob->zoneMob->oMob
    static async oneOnOne(oMob){
        let oPlayer = dbPlayer[pId];
        // 把玩家状态设置满 hp mp 冷却完成
        CharacterModel.calcTotalState();
        CharacterModel.tickCoolDown(1000000);
        oPlayer.curHP = oPlayer.maxHP;
        oPlayer.curMP = oPlayer.maxMP;

        let frameCount = GlobalConfig.QUICK_BATTLE_DURATION;    // 最大战斗帧数
        let endFlag = 0;        // 结束标记，0=没结束，1=玩家胜利，-1=怪物胜利，-2=平局
        let playerFrame = oPlayer.gcd * 1000; // 根据加速进行调整
        let mobFrame = oMob.gcdObj.getCD();    // 可以考虑 根据加速进行调整， 但是目前mob 只有 atk def
        oPlayer.nextFrame = frameCount - playerFrame;
        oMob.nextFrame = frameCount - mobFrame;

        battleModal.appendLog(oPlayer.name +" lv="+ oPlayer.level + "[ "+oPlayer.curHP+" / "+oPlayer.maxHP+" ] vs "+oMob.shortName + " lv="+oMob.level+ "[ "+oMob.hp + " / " + oMob.hpMax + " ]");

        while(endFlag === 0){
            if(oPlayer.nextFrame > oMob.nextFrame){
                // 玩家出手
                // player.AI 的逻辑 (hp<=50%) ? skillHeal : doDamage(kfId)
                // doDamage 的优先级 武器所能使用的wge，cd完成的，选择威力大的，如果没有cd完成的，等待下一个frame(本轮 cd 不动)
                frameCount = oPlayer.nextFrame;
                // console.log("fc="+frameCount + ", player attack");

                let actFlag = false;
                // 检查，是不是需要治疗
                if(oPlayer.maxHP / oPlayer.curHP >= 2) {
                    // battleModal.appendLog(oPlayer.name + " HP 低于 50%， 尝试使用治疗技能。",'player');
                    let heal_result = CharacterModel.cmdDoSkillHeal();  // todo: tobe re-check. 2021.10.19:22:00
                    if (heal_result.value > 0) {
                        // heal 成功，不做其他的攻击动作
                        battleModal.appendLog(oPlayer.name + globalStrings.QB_CAST + "[ "+heal_result.name+" ]，HP +"+ toReadableString(heal_result.value) + " = "+dbPlayer[pId].curHP,'player');
                        actFlag = true;
                    }else{
                        battleModal.appendLog(oPlayer.name + globalStrings.QB_HEAL_FAIL+ heal_result.desc + globalStrings.QB_HEAL_SKIP,'player');
                    }
                    BuffWidget.updateBuff();
                }
                // 检查，是否已经治疗过，否则执行攻击策略
                if(!actFlag){
                    // heal 失败（可能原因：mana不够，cd中，等），继续执行其他攻击动作。
                    let atk = {"reason":"","damage":-10};
                    for(let tries=0;tries<4;tries++){
                        atk = CharacterModel.cmdDoWGAttack(tries,oMob.level);
                        if(atk.damage>=0){  // 攻击成功，可能未命中 命中 暴击
                            let dmg = atk.damage;
                            if(dmg === 0){
                                battleModal.appendLog(oPlayer.name + globalStrings.QB_CAST+"[ "+atk.kfName+" ], "+atk.reason,'player');
                            }else{
                                let actDmg = oMob.getHurt(dmg); actDmg = toReadableString(actDmg);
                                if(atk.reason===globalStrings.QB_CRIT){
                                    battleModal.appendLog(oPlayer.name + globalStrings.QB_CAST+"[ "+atk.kfName+" ]"+globalStrings.QB_ATK_DMG+dmg+"( "+globalStrings.QB_CRIT+" )"+globalStrings.EOL,'player');
                                }else{
                                    battleModal.appendLog(oPlayer.name + globalStrings.QB_CAST+"[ "+atk.kfName+ " ]"+globalStrings.QB_ATK_DMG+dmg+globalStrings.EOL,'player');
                                }
                                if(actDmg === -1){
                                    battleModal.appendLog(oMob.shortName + globalStrings.BM_DGE+globalStrings.EOL,'mob');
                                }else if(actDmg === -2){
                                    battleModal.appendLog(oMob.shortName + globalStrings.BM_PAR+globalStrings.EOL,'mob');
                                }else{
                                    battleModal.appendLog(oMob.shortName + globalStrings.QB_GET_DMG +actDmg + globalStrings.EOL,'mob');
                                }

                                if(oMob.hp <= 0){
                                    endFlag = 1;    // 玩家胜利
                                }
                            }
                            break;
                        }
                        // console.log("技能尝试="+tries+" 结果="+atk.reason + "伤害="+atk.damage);
                    }
                    // 如果4个都试过了，还是没有可用的攻击技能
                    if(atk.damage < 0){
                        // 等待下一轮
                        // battleModal.appendLog(oPlayer.name + "无可用攻击技能。",'player');
                        // console.log("无可用攻击技能");
                        GQuickBattle.playerRest();
                    }
                }

                // 玩家的nextFrame 调整 - 快速战斗的 计时
                oPlayer.nextFrame = oPlayer.nextFrame - playerFrame;
                // 玩家的cd调整 - 技能冷却
                CharacterModel.tickCoolDown(playerFrame);   // todo: tobe re-checked. 2021.10.19:21:48
                let tickResult = CharacterModel.tickHeartBeat(playerFrame);  // 自动恢复
                if(tickResult > 0){
                    battleModal.appendLog(oPlayer.name + globalStrings.QB_RECOVER + globalStrings.EOL,'player');
                    // console.log("player tick reg.");
                }
            }else{
                // 怪物出手
                frameCount = oMob.nextFrame;
                // console.log("fc="+frameCount + ", mob attack");

                let dmg = oMob.atk;
                let actDmg = CharacterModel.getHurt(dmg);actDmg = toReadableString(actDmg);
                // oPlayer.getHurt(dmg);
                // console.log(oMob.name + "攻击，对玩家造成"+dmg+"伤害。");
                if(actDmg === -1){
                    battleModal.appendLog(oMob.shortName + globalStrings.QB_ATK+dmg+globalStrings.EOL,'mob');
                    battleModal.appendLog(oPlayer.name + globalStrings.BM_DGE+globalStrings.EOL,'player');
                }else if(actDmg === -2){
                    battleModal.appendLog(oMob.shortName + globalStrings.QB_ATK+dmg+globalStrings.EOL,'mob');
                    battleModal.appendLog(oPlayer.name + globalStrings.BM_PAR+globalStrings.EOL,'player');
                }else{
                    battleModal.appendLog(oMob.shortName + globalStrings.QB_ATK+dmg+","+globalStrings.QB_HIT+globalStrings.EOL,'mob');
                    battleModal.appendLog(oPlayer.name + globalStrings.QB_GET_DMG+actDmg+"。",'player');
                }

                if(oPlayer.curHP <=0){
                    endFlag = -1;   // 怪物胜利
                    // oPlayer.curHP = 1;
                    return endFlag;
                }
                // 怪物的nextFrame 调整
                oMob.nextFrame = oMob.nextFrame - mobFrame;
                gGui.drawHUD();
            }
            if(frameCount <= 0 && endFlag === 0 ){
                endFlag = -2;   // 已经超时，如果还没有决定胜负
                battleModal.appendLog(globalStrings.QB_DRAW);
            }

            battleModal.updateLogs(1);
            await sleep(GlobalConfig.QUICK_BATTLE_INTERVAL);
        }
        return endFlag;
    }

    /**
     * player 休息，回复 hp mp = level. 最大不超过 max
     */
    static playerRest(){
        dbPlayer[pId].curHP = dbPlayer[pId].curHP + dbPlayer[pId].level >= dbPlayer[pId].maxHP ? dbPlayer[pId].maxHP :  dbPlayer[pId].curHP + dbPlayer[pId].level;
        dbPlayer[pId].curMP = dbPlayer[pId].curMP + dbPlayer[pId].level >= dbPlayer[pId].maxMP ? dbPlayer[pId].maxMP :  dbPlayer[pId].curMP + dbPlayer[pId].level;
        battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_REST+dbPlayer[pId].level+globalStrings.EOL,'player');
    }

    /* 第一版本 - 结束 */

    /* 第二版本 - 1vN 支持 AOE Add */

    /* Mob Sample
        [{   "id":"d9ad1555-a5d6-4f45-932a-0cd2b7b9123c","mobId":71,"name":"归仁兵<李归仁> [ 挥砍 狂刀 ]","title":"李归仁",
                "displayAffix":"挥砍 狂刀","level":70,"atk":210,"def":210,"hpMax":2920,"hp":2920,"reg":59,"fdb":0,"fdh":0,"dge":0,
                "par":10,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":180,
                "gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},
                "regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},
                "faceDirection":1,"isAlive":true,"aggressive":true,
                "inventory":[],"inventoryStr":"",
                "wgList":[
                    {"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},
                    {"skill_id":8,"affix":"挥砍","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":1500,"range":64,"dmgRate":1.2,"wgType":"machete","wgeType":"arc","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},
                    {"skill_id":111,"affix":"狂刀","desc":"正面180度，伤害=dmg * dmg  * level * arg2 * 难度修正系数","type":"active","cdMax":6,"duration":900,"range":180,"dmgRate":0.6,"wgType":"machete","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true}}
                ],
                "ngList":[],
                "explainedSkillIdArray":[8,111],
                "shortName":"归仁兵"
            }]
     */

    /**
     * 第二版本战斗逻辑，支持 aoe add deaggro
     * @param mobList - zone 的怪物列表，注意，可能有已经死亡的
     * @param intZoneId - zone编号，主要用于计算 任务中的击杀
     * @param boolVsAll - boolean true=把zone剩余所有怪物一起A了，false=一个个打（仍然可能add）
     * @returns {Promise<number>}
     */

    // done 玩家外功附带dbf
    // done mob dbf 免疫 - 神行 / 霸体
    // done mob 特性 荆棘反伤813 / 吸血814 - 真实伤害，不会再被反伤，受防御减免，可招架、闪避
    // done 玩家 反伤 吸血；不触发mob的反伤、吸血，真实伤害，受防御减免，可招架、闪避，眩晕时防御无效
    // done mob 外功 附带 dbf,作用于玩家 ： 深寒815 / 剧毒816 / 817盲目-防御无效 / 818击退 / 819寒潮
    // todo mob aoe 效果 伤害数值 在快速战斗里面是否数值修正？ - 还是不修正 20230529 加入 oneVsAll 解决这个问题
    static async oneOnMore(mobList,intZoneId,boolVsAll = false){
        // 参战触发优先级：从怪物列表开始，往末尾，寻找所有会主动攻击的怪物
        // 脱离计算规则：如果参战怪物数>=2，第一个（mobList最前面战斗的那个）不会脱离，其他的每个均有 FLOAT_DE_AGGRO_RATE 的概率脱离战斗
        // 把玩家状态设置满 hp mp 所有的技能都没准备好
        GQuickBattle.initPlayer();
        BuffWidget.updateBuff();
        let oPlayer = dbPlayer[pId];

        // 初始化怪物列表，增加 aggroFlag
        GQuickBattle.initMobList(mobList);
        let aggroArray = []; // 已经aggro的怪物数组
        let oMob = undefined;
        if(!boolVsAll){
            let oMobIdx = GQuickBattle.getFirstAvaMobIdx(mobList);    // alive aggroFlag=false 的第一个 （第一个与aggressive 无关）
            if(oMobIdx<0){
                battleModal.appendLog(globalStrings.QB_EMPTY);
                return 0;
            }
            oMob = mobList[oMobIdx];
            battleModal.appendLog(oPlayer.name +" lv="+ oPlayer.level + "[ "+oPlayer.curHP+" / "+oPlayer.maxHP+" ] vs "+oMob.shortName +"#"+oMob.battleIdx + " lv="+oMob.level+ "[ "+oMob.hp + " / " + oMob.hpMax + " ]");
            oMob.aggroFlag = true;
            aggroArray.push(oMob);
        }else{
            for(let i=0;i<mobList.length;i++){
                if(mobList[i].isAlive){
                    mobList[i].aggroFlag = true;
                    aggroArray.push(mobList[i]);
                }
            }

            // updated 20230530 保证至少2个怪物的时候，才给予cd奖励
            if(aggroArray.length > 1){
                // updated 20230530 怪物先发呆，先手给玩家。
                for(let i=0;i<aggroArray.length;i++){
                    aggroArray[i].gcdObj.reset();
                    for(let j=0;j<aggroArray[i].wgList.length;j++){
                        aggroArray[i].wgList[j].cdObj.reset();
                    }
                }
                // updated 20230530 玩家所有技能完毕，先手给玩家
                dbPlayer[pId].gcdObj.cur = dbPlayer[pId].gcdObj.max;
                dbPlayer[pId].gcdObj.ready = true;
                for(let i=0;i<5;i++){
                    dbPlayer[pId].cdList[i].cur = dbPlayer[pId].cdList[i].max;
                    dbPlayer[pId].cdList[i].ready = true;
                }
            }


            oMob = aggroArray.length > 0 ? aggroArray[0] : undefined;
            battleModal.appendLog(aggroArray.length+globalStrings.QB_MANY);
            battleModal.appendLog(oPlayer.name +" lv="+ oPlayer.level + "[ "+oPlayer.curHP+" / "+oPlayer.maxHP+" ]。");
        }

        if(oMob === undefined){
            battleModal.appendLog(globalStrings.QB_EMPTY);
        }

        let intTotalTime = 0;
        // let intMaxBattleTime = 3 * 60 * 1000;   // 最大战斗持续时间，未分胜负的情况
        let intMaxBattleTime = GlobalConfig.QUICK_BATTLE_DURATION;   // 最大战斗持续时间，未分胜负的情况
        let aggroCD = new CDModel(INT_AGGRO_INTVAL);
        let deAggroCD = new CDModel(INT_DE_AGGRO_INTVAL);

        while(aggroArray.length > 0 && dbPlayer[pId].curHP > 0){
            // 寻找 mob 里面最先出手的
            // 每个 mob 攻击都可能 导致 add - 只有 aggressive 的 mob 才会 add
            // 每个 mob 攻击都可能 导致 de_aggro
            // aggroArray[0] 是玩家的默认攻击目标
            // 不使用 oneOnOne 的frame 逻辑 ， 使用 update 的逻辑
            intTotalTime = intTotalTime + INT_QUICK_DELTA_TIME;

            let ret = CharacterModel.update(INT_QUICK_DELTA_TIME);
            if(ret === 1) {
                if(dbPlayer[pId].dbfObj.dot.duration > 0){
                    battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_POISON+dbPlayer[pId].dbfObj.dot.value +"; "+globalStrings.QB_REST_HP+dbPlayer[pId].totalState.reg+globalStrings.QB_REST_MP+dbPlayer[pId].totalState.rem + globalStrings.EOL,'player');
                }else{
                    battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_REST_HP+dbPlayer[pId].totalState.reg+globalStrings.QB_REST_MP+dbPlayer[pId].totalState.rem + globalStrings.EOL,'player');
                }
            }

            for(let i=0;i<aggroArray.length;i++){
                // aggroArray[i].gcdObj.update(INT_QUICK_DELTA_TIME);
                // for(let j=0;j<aggroArray[i].wgList.length;j++){
                //     aggroArray[i].wgList[j].cdObj.update(INT_QUICK_DELTA_TIME);
                // }
                // fixed 2022.11.15 - 使用 mobModel的内置 update,而不是这里的逻辑 - 增加了恢复功能
                aggroArray[i].update(intTotalTime,INT_QUICK_DELTA_TIME);
            }

            if(!boolVsAll){
                aggroCD.update(INT_QUICK_DELTA_TIME);
                deAggroCD.update(INT_QUICK_DELTA_TIME);

                if(aggroCD.isReady()){
                    if(GQuickBattle.aggroSaving(dbPlayer[pId].level,oMob.level)){
                        GQuickBattle.aggroMove(mobList,aggroArray);
                    }
                    aggroCD.reset();
                }
                if(deAggroCD.isReady()){
                    if(GQuickBattle.deAggroSaving()) {
                        if(aggroArray.length>1){
                            let deAggroIdx = GlobalFunction.getRand(1,aggroArray.length);
                            GQuickBattle.deAggroMove(aggroArray,deAggroIdx);
                        }
                    }
                    deAggroCD.reset();
                }
            }

            // 2023.05.16 似乎用不到了。不确定，先注释掉
            // deBuffManager.update(intTotalTime,INT_QUICK_DELTA_TIME);



            GQuickBattle.playerMove(aggroArray);

            for(let i=0;i<aggroArray.length;i++){
                if(aggroArray[i].hp <= 0){
                    battleModal.appendLog(aggroArray[i].shortName + "#" + aggroArray[i].battleIdx + globalStrings.QB_MOB_DEFEAT,'mob');
                    GQuickBattle.reward(aggroArray[i],intZoneId);
                    aggroArray[i].isAlive = false;
                    aggroArray.splice(i,1);
                }
            }
            if(aggroArray.length>0){
                $(battleModal.selectorHud).html(aggroArray[0].shortName + " : "+ aggroArray[0].hp + " / " + aggroArray[0].hpMax);
            }


            GQuickBattle.mobMove(aggroArray);

            gGui.drawHUD();
            battleModal.updateLogs(1);
            await sleep(GlobalConfig.QUICK_BATTLE_INTERVAL/10);
            // 更新是100毫秒
            // GlobalConfig.QUICK_BATTLE_INTERVAL 也是100毫秒
            // sleep的时间跟更新间隔相等，= 1倍速
            // 除以10， 等于休眠时间变为10秒 对应 更新100秒，即战斗速度是10倍
            if(intTotalTime >= intMaxBattleTime){
                battleModal.appendLog(globalStrings.QB_TIME_OUT);
                break;
            }
        }
        return aggroArray.length;
    }

    /**
     * 玩家的动作
     * @param aggroArray
     */
    static playerMove(aggroArray){
        // 玩家出手
        // player.AI 的逻辑 (hp<=25%) ? skillHeal : doDamage(kfId)
        // doDamage 的优先级 武器所能使用的wge，cd完成的，选择威力大的，如果没有cd完成的，等待下一个frame(本轮 cd 不动)
        // 检查，是不是需要治疗
        // 完成 附带的攻击效果
        if( dbPlayer[pId].curHP >0 && (dbPlayer[pId].curHP / dbPlayer[pId].maxHP < 0.25)) {
            if(dbPlayer[pId].cdList[4].ready && dbPlayer[pId].gcdObj.ready){
                let healResult = CharacterModel._skillHeal();
                if (healResult.value > 0) {
                    dbPlayer[pId].gcdObj.cur = 0;
                    dbPlayer[pId].gcdObj.ready = false;
                    dbPlayer[pId].cdList[4].cur = 0;
                    dbPlayer[pId].cdList[4].ready = false;
                    battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_CAST+"[ "+healResult.name+" ]，HP +"+ toReadableString(healResult.value) + " = "+dbPlayer[pId].curHP + globalStrings.QB_DETOX+toReadableString(healResult.value)+globalStrings.EOL,'player');
                }else{
                    // battleModal.appendLog(dbPlayer[pId].name + "试图治疗，但"+ healResult.desc + "，继续战斗。",'player');
                }
            }
        }

        // heal 失败（可能原因：mana不够，cd中，等），继续执行其他攻击动作。
        if(dbPlayer[pId].gcdObj.ready){
            let atk = {"reason":globalStrings.QB_NONE,"damage":-10};
            for(let tries=0;tries<4;tries++){
                atk = CharacterModel.handlerDoWGAttack(tries);
                if(atk.damage > 0){ // 施放成功
                    // 重置冷却
                    CharacterModel.resetCoolDown(tries);
                    CharacterModel.resetGCD();
                    battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_CAST+"[ "+atk.kfName+" ]"+globalStrings.EOL,'player');
                    for(let i=0;i<aggroArray.length;i++){
                        let mobAtk = {};
                        let odds = 1;
                        if(i > 0) {
                            odds = atk.wgeObj.collateralProbability * Math.pow(atk.wgeObj.chainProbability,i-1);
                            // 第二个 下标1 = collateralProbability
                            // 第三个 下标2 = collateralProbability * chainProbability
                        }
                        if(odds >= FLOAT_WGE_PROBABILITY_THRESHOLD){
                            let saving = GlobalFunction.getRandFloat(0.0,1.0);
                            if(saving < odds){
                                mobAtk = CharacterModel.handlerHitSaving(aggroArray[i].level,atk); // 玩家招式的初始伤害效果
                                if(mobAtk.damage > 0){  // 命中
                                    mobAtk = CharacterModel.handlerCritSaving(mobAtk);  // 玩家招式暴击后的伤害效果

                                    let actDmg = aggroArray[i].getHurt(mobAtk.damage);
                                    if(mobAtk.reason===globalStrings.QB_CRIT){
                                        battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_DE+"[ "+mobAtk.kfName+" ]"+globalStrings.QB_HIT+ aggroArray[i].shortName +"#"+aggroArray[i].battleIdx+globalStrings.QB_ATK_DMG+mobAtk.damage+"( "+globalStrings.QB_CRIT+" )"+globalStrings.EOL,'player');
                                    }else{
                                        battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_DE+"[ "+mobAtk.kfName+ " ]"+globalStrings.QB_HIT+ aggroArray[i].shortName +"#"+aggroArray[i].battleIdx+globalStrings.QB_ATK_DMG+mobAtk.damage+globalStrings.EOL,'player');
                                    }
                                    if(actDmg === -1){
                                        battleModal.appendLog(aggroArray[i].shortName +"#"+aggroArray[i].battleIdx + globalStrings.BM_DGE+globalStrings.EOL,'mob');
                                    }else if(actDmg === -2){
                                        battleModal.appendLog(aggroArray[i].shortName +"#"+aggroArray[i].battleIdx + globalStrings.BM_PAR+globalStrings.EOL,'mob');
                                    }else{
                                        if(aggroArray[i].dbfFactors.msStunDuration > 0){
                                            battleModal.appendLog(aggroArray[i].shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_STUN+toReadableString(actDmg) + globalStrings.EOL,'mob');
                                        }else{
                                            battleModal.appendLog(aggroArray[i].shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_GET_DMG+toReadableString(actDmg) + globalStrings.EOL,'mob');
                                        }
                                        // dps 计算
                                        if(actDmg > 0){
                                            battleModal.dmgTotal += actDmg;
                                        }
                                        // 玩家 是否有吸血效果 - 不区分显示过量治疗
                                        if(dbPlayer[pId].totalState.fdh > 0){
                                            let hAmount = Math.ceil(dbPlayer[pId].totalState.fdh * actDmg);
                                            if(hAmount > 0){
                                                CharacterModel.healSelf(hAmount);
                                                battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_FDH+ hAmount + globalStrings.EOL,'player');
                                            }
                                        }

                                        // mob 是否有荆棘
                                        if(aggroArray[i].fdb > 0){
                                            let fdDmg = Math.ceil(aggroArray[i].fdb * actDmg);
                                            battleModal.appendLog(aggroArray[i].shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_FDB+toReadableString(fdDmg) + globalStrings.EOL,'mob');
                                            let fdResult = CharacterModel.getHurt(fdDmg);
                                            battleModal.appendLogPlayerHurt(fdResult);
                                        }

                                        // 玩家的攻击是否附带 dbf 效果
                                        if(atk.kfObj.dbfObj){   // 存在 debuff
                                            // debuff 判断
                                            let dbfRand = GlobalFunction.getRandFloat(0,1.0);
                                            if(dbfRand < atk.kfObj.dbfRat){
                                                // debuff 命中
                                                let debuffResult = aggroArray[i].gainDebuff(atk.kfObj);
                                                if(debuffResult !== 0){
                                                    let tmp = atk.kfObj.dbfObj.dbfDesc;
                                                    tmp = tmp.replace('{dbfSpdR}', atk.kfObj.dbfSpd.toFixed(2))
                                                        .replace('{dbfHstR}', atk.kfObj.dbfHst.toFixed(2))
                                                        .replace('{dbfDmgR}', atk.kfObj.dbfDmg.toFixed(2))
                                                        .replace('{dbfDurR}', atk.kfObj.dbfDur.toFixed(2));
                                                    battleModal.appendLog(aggroArray[i].shortName +"#"+aggroArray[i].battleIdx + " "+atk.kfObj.dbfObj.dbfName+" > "+tmp + "。",'mob');
                                                }else if (debuffResult === -1){
                                                    battleModal.appendLog(aggroArray[i].shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_DBF_IMU,'mob');
                                                }else{
                                                    battleModal.appendLog(globalStrings.QB_DBF_ERR,'mob');
                                                }

                                            }
                                        }

                                    }
                                }else{
                                    battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_CAST+"[ "+atk.kfName+" ], "+mobAtk.reason+globalStrings.EOL,'player');
                                }
                            }
                        }else{
                            break;  // 后面的概率太小，丢弃
                        }
                    }

                    break;
                }
            }
            // 如果循环跑完了，也没放出个武功出来，那也正常（内功不足，没有武学，或者没有cd 等等原因）
        }
    }

    /**
     * 怪物的动作
     * @param aggroArray
     */
    static mobMove(aggroArray){
        // 怪物出手
        // 20221109 怪物技能、伤害修正
        // 攻击逻辑，从wgList 后面往前面找可以用的技能(cd.ready)
        for(let i=0;i<aggroArray.length;i++){
            let oMob = aggroArray[i];
            let oPlayer = dbPlayer[pId];
            let idx = -1;
            for(let tries=oMob.wgList.length-1;tries>=0;tries--){
                if(oMob.gcdObj.isReady() && oMob.wgList[tries].cdObj.isReady()){
                    idx = tries;
                    break;
                }
            }
            if(idx !== -1){
                // dbf 定身 - update 初定身外的逻辑不执行，gcd不转，理论上不会到这里
                if(oMob.dbfFactors.msStunDuration > 0){
                    battleModal.appendLog(oMob.shortName +"#"+aggroArray[i].battleIdx +  globalStrings.QB_MOB_STUN,'mob');
                    return;
                }
                // dbf 僵直判断
                if(oMob.dbfFactors.msSpasticDuration > 0){
                    if( oMob.dbfFactors.flagSpastic  && (oMob.dbfFactors.msSpasticDuration < INT_QUICK_DELTA_TIME)){
                        oMob.dbfFactors.flagSpastic = false;
                        battleModal.appendLog(oMob.shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_MOB_STUN_OUT,'mob');
                    }

                    if ( (oMob.dbfFactors.flagSpastic === undefined) || (oMob.dbfFactors.flagSpastic === false)){
                        oMob.dbfFactors.flagSpastic = true;
                        battleModal.appendLog(oMob.shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_MOB_STUN_TIME+ (oMob.dbfFactors.msSpasticDuration/1000).toFixed(3)+ "s。",'mob');
                    }

                    return;
                }

                // dbf 无法移动判断 - 认为攻击miss + 50%
                let missRate = oMob.dbfFactors.dbfSpd;
                if(oMob.dbfFactors.msNoMoveDuration > 0){
                    missRate = missRate + 0.5;
                    battleModal.appendLog(oMob.shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_MOB_ROOT,'mob');
                }
                // dbf 攻速判断 不需要处理 - 在 mobModel 的 update 处理了
                // dbf 减攻击速判断 - 不需要做，在update里面
                // dbf 减移动速度判断 - = miss 概率
                let missRand = GlobalFunction.getRandFloat(0,1);
                oMob.wgList[idx].cdObj.reset();
                oMob.gcdObj.reset();
                let kfName = gDB.getMobSkillById(oMob.wgList[idx].skill_id).affix;
                if(missRand >= missRate){   // 命中
                    // dbf 降低伤害
                    let dmg = Math.ceil(oMob.wgList[idx].dmgRate * oMob.atk * ( 1 - oMob.dbfFactors.dbfDmg));
                    let actDmg = CharacterModel.getHurt(dmg);
                    // let kfName = gDB.getMobSkillById(oMob.wgList[idx].skill_id).affix;
                    battleModal.appendLog(oMob.shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_CAST+"[ "+kfName+" ], "+globalStrings.QB_DMG_IS+dmg+globalStrings.EOL,'mob');
                    battleModal.appendLogPlayerHurt(actDmg);    // 包括了 闪避 招架的判断

                    // 玩家 反伤 逻辑
                    // updated 2023.05.21 - 反弹伤害按照防御之前的伤害 actDmg -> dmg
                    if(dbPlayer[pId].totalState.fdb > 0){
                        let fdDmg = Math.ceil(dbPlayer[pId].totalState.fdb * dmg);
                        battleModal.appendLog(dbPlayer[pId].name +globalStrings.QB_FDB_IS+fdDmg+globalStrings.EOL,'player');
                        let fdResult = oMob.getHurt(fdDmg);
                        battleModal.appendLogMobHurt(oMob.shortName+"#"+aggroArray[i].battleIdx,fdResult);
                        // dps 计算
                        if(fdDmg > 0){
                            battleModal.dmgTotal += fdDmg;
                        }
                    }
                    // 吸血按照实际伤害，因此如果无实际伤害，则无吸血
                    if(actDmg <=0) return;  // 闪避 招架 ，直接结束。
                    // mob 吸血逻辑
                    if(oMob.fdh > 0 ){
                        let hAmount = Math.ceil(oMob.fdh * actDmg);
                        oMob.healSelf(hAmount);
                        battleModal.appendLog(oMob.shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_FDH+hAmount+globalStrings.EOL,'mob');
                    }

                    // mob 词缀 dbf 效果： 深寒815 / 剧毒816 / 817盲目-防御无效 / 818击退 / 819寒潮
                    if(oMob.explainedSkillIdArray.indexOf(815) >= 0){
                        // {"skill_id":815,"affix":"深寒","desc":"攻击附带减速（hst）效果20%，持续6秒","type":"passive","cdMax":"","duration":6000,"range":"","dmgRate":0.2,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                        // - hst
                        if(CharacterModel.isDebuffHit(oMob.level)){
                            // let dbfObj = deBuffManager.addOne(815,undefined,0,0);
                            CharacterModel.gainDeBuff(815);
                            battleModal.appendLog(oMob.shortName+"#"+aggroArray[i].battleIdx + globalStrings.QB_SH,'mob');
                            battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_SLOW,'player');
                        }
                    }
                    if(oMob.explainedSkillIdArray.indexOf(816) >= 0){
                        // {"skill_id":816,"affix":"剧毒","desc":"攻击附带中毒效果，60秒内造成持续伤害","type":"passive","cdMax":5,"duration":60000,"range":"","dmgRate":0.25,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                        // - hp
                        // CharacterModel.gainDebuff(816, actDmg);
                        if(CharacterModel.isDebuffHit(oMob.level)){
                            // deBuffManager.addOne(816, undefined, 0, actDmg);
                            CharacterModel.gainDeBuff(816,actDmg);
                            battleModal.appendLog(oMob.shortName+"#"+aggroArray[i].battleIdx + globalStrings.QB_JD,'mob');
                            battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_JD_1 + actDmg + globalStrings.QB_JD_2, 'player');
                        }
                    }
                    if(oMob.explainedSkillIdArray.indexOf(817) >= 0){
                        // {"skill_id":817,"affix":"暗影","desc":"盲目，无法视物，持续2秒","type":"passive","cdMax":"","duration":2000,"range":"","dmgRate":"","wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                        // - 命中率 hit - 50%
                        if(CharacterModel.isDebuffHit(oMob.level)){
                            // deBuffManager.addOne(817,undefined,0,0);
                            CharacterModel.gainDeBuff(817);
                            battleModal.appendLog(oMob.shortName+"#"+aggroArray[i].battleIdx + globalStrings.QB_MM,'mob');
                            battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_MM_1,'player');
                        }
                    }
                    if(oMob.explainedSkillIdArray.indexOf(818) >= 0){
                        // {"skill_id":818,"affix":"击退","desc":"攻击附带击退打断效果，距离60像素","type":"passive","cdMax":"","duration":"","range":"","dmgRate":"","wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                        // - stun , update delta 停止，防御无效
                        if(CharacterModel.isDebuffHit(oMob.level)){
                            // deBuffManager.addOne(818, undefined, 0, 0);
                            CharacterModel.gainDeBuff(818);
                            battleModal.appendLog(oMob.shortName+"#"+aggroArray[i].battleIdx + globalStrings.QB_JT,'mob');
                            battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_JT_1, 'player');
                        }
                    }
                    if(oMob.explainedSkillIdArray.indexOf(819) >= 0){
                        // {"skill_id":819,"affix":"寒潮","desc":"攻击附带降低移动速度效果，持续2秒","type":"passive","cdMax":"","duration":2000,"range":"","dmgRate":0.2,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""}
                        // - spd
                        if(CharacterModel.isDebuffHit(oMob.level)){
                            // deBuffManager.addOne(819, undefined, 0, 0);
                            CharacterModel.gainDeBuff(819);
                            battleModal.appendLog(oMob.shortName+"#"+aggroArray[i].battleIdx + globalStrings.QB_HC,'mob');
                            battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_HC_1, 'player');
                        }
                    }

                }else{  // 没有命中
                    battleModal.appendLog(oMob.shortName +"#"+aggroArray[i].battleIdx + globalStrings.QB_CAST+"[ "+kfName+" ]"+globalStrings.QB_MISS,'mob');
                }
            }
        }

    }

    /**
     * 判断是否导致了 aggro
     * @returns {boolean}
     */
    static aggroSaving(intPlayerLevel,intMobLevel){
        let aggro_rate = FLOAT_AGGRO_RATE + ( intMobLevel - intPlayerLevel ) / 255.0 - dbPlayer[pId].totalState.luk;
        let rand = GlobalFunction.getRandFloat(0.0,1.0);
        return rand < aggro_rate;   // intPlayerLevel - intMobLevel > 255 * FLOAT_AGGRO_RATE 的时候，必定不 aggro
    }

    /**
     * aggro 的 处理函数
     * @param mobList
     * @param aggroArray
     */
    static aggroMove(mobList,aggroArray){
        let idx = GQuickBattle.getAddMobIdx(mobList);
        if(idx > 0 ){
            mobList[idx].aggroFlag = true;
            aggroArray.push(mobList[idx]);
            battleModal.appendLog(mobList[idx].shortName +"#"+mobList[idx].battleIdx +globalStrings.QB_ADD);
        }
    }

    /**
     * 判断是否怪物脱离战斗
     * @returns {boolean}
     */
    static deAggroSaving() {
        let rand = GlobalFunction.getRandFloat(0.0, 1.0);
        return rand < FLOAT_DE_AGGRO_RATE;
    }

    /**
     * 脱离战斗的 处理函数
     * @param aggroArray - 当前 aggro的所有怪物的数组
     * @param aggroIdx - 数组中要脱离战斗的怪物的下标
     */
    static deAggroMove(aggroArray,aggroIdx){
        aggroArray[aggroIdx].aggroFlag = false;
        battleModal.appendLog(aggroArray[aggroIdx].shortName + globalStrings.QB_LEAVE,'mob');
        aggroArray.splice(aggroIdx,1);
    }

    /**
     * 怪物死后的处理函数，掉落、任务等
     * @param oMob
     * @param zoneId
     */
    static reward(oMob,zoneId){
        // 获取掉落
        for(let j=0;j<oMob.inventory.length;j++){
            let gainItemResult = CharacterModel.gainItem(oMob.inventory[j].itemId,1);
            // 1=成功 2=成功且超出堆叠后重新分组 -1=没有足够空位 -2=没有足够空位添加了部分 0=item未发现 -3=数量异常 -4=唯一物品无法重复创建
            let mobDropStr = '';
            switch (gainItemResult){
                case 1:
                    // console.log("玩家获得物品:"+battleModal.mobList[i].inventory[j].itemName);
                    mobDropStr = oMob.inventory[j].itemName;
                    if(mobDropStr !== ""){
                        battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_ITEM_GET + mobDropStr);
                    }
                    break;
                case 2:
                    // console.log("玩家获得物品:"+battleModal.mobList[i].inventory[j].itemName);
                    mobDropStr += oMob.inventory[j].itemName + " ";
                    if(mobDropStr !== ""){
                        battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_ITEM_GET + mobDropStr);
                    }
                    break;
                case -1:
                    battleModal.appendLog(globalStrings.NOT_ENOUGH_ROOM+globalStrings.EOL);
                    break;
                case -2:
                    battleModal.appendLog(globalStrings.NOT_ENOUGH_ROOM+globalStrings.EOL);
                    break;
                case -4:
                    battleModal.appendLog("["+oMob.inventory[j].itemName + "] "+globalStrings.QB_ITEM_UNIQ);
                    break;
                default:
                    break;
            }
        }
        // 修改：经验和掉落的计算放到场景中，而非在数据对象中
        let mobExp = oMob.getExp();
        CharacterModel.gainExp(mobExp);
        CharacterModel.addKillCountForTask(zoneId,oMob.mobId);
        battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_EXP+ toReadableString(mobExp) + globalStrings.EOL);
    }

    /**
     * 第一个可以用于战斗的mob，条件：alive 并且 aggroFlag=false 的第一个 （第一个与aggressive 无关）
     * @param mobList
     * @returns {number}
     */
    static getFirstAvaMobIdx(mobList){
        for(let i=0;i<mobList.length;i++){
            if(mobList[i].isAlive && (!mobList[i].aggroFlag)) return i;
        }
        return -1;
    }

    /**
     * 第一个可以add的怪物：条件 alive 并且 aggroFlag=false 并且 aggressive=true 的第一个
     * @param mobList
     * @returns {number}
     */
    static getAddMobIdx(mobList){
        for(let i=0;i<mobList.length;i++){
            if(mobList[i].isAlive && mobList[i].aggressive && (!mobList[i].aggroFlag)) return i;
        }
        return -1;
    }

    /**
     * 初始化玩家状态： HP MP满，所有技能【没有】准备好
     */
    static initPlayer(){
        // CharacterModel.restorePlayerState();
        // updated 2023.08.09 nerf 快速战斗进入战斗 补满 hp mp，改为 +20%
        CharacterModel.removeDebuffAll();
        CharacterModel.calcTotalState();
        CharacterModel.healSelf(Math.ceil(dbPlayer[pId].maxHP * 0.2));
        CharacterModel.manaSelf(Math.ceil(dbPlayer[pId].maxMP * 0.2));
        // dbPlayer[pId].curHP = dbPlayer[pId].maxHP;  // HP满
        // dbPlayer[pId].curMP = dbPlayer[pId].maxMP;  // MP满
        CharacterModel.resetAllCD();    // 所有cd没好
        CharacterModel.resetCombo();
    }

    /**
     * 初始化怪物状态，aggro 没有，冷却 【没有】
     * @param mobList
     */
    static initMobList(mobList){
        for(let i=0;i<mobList.length;i++){
            if(mobList[i].isAlive ){
                mobList[i].aggroFlag = false;
                mobList[i].battleIdx = i;
                mobList[i].gcdObj.reset();
                for(let j=0;j<mobList[i].wgList.length;j++){
                    mobList[i].wgList[j].cdObj.ready();
                }
            }
        }
    }

    /* 第二版本 - 结束 */
}