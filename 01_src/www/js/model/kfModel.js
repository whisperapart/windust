/**
 * Created by jim on 2020/4/28.
 */

const GLOBAL_DIFFICULTY = 1.0;  // 用于怪物伤害、血量 设置等，默认1.0 // todo: 做成可设置，可以在菜单中调整，与掉落挂钩

class KFModel {
    /** * @description constructor from static db */
    static initWithLevel(kfId,level) {
        let kfObj = {};
        let tmp = gDB.getKFById(kfId);
        if(jQuery.isEmptyObject(tmp)){
            return kfObj;
        }
        kfObj.kfId = kfId;
        kfObj.dbObj = JSON.parse(JSON.stringify(tmp));
        if(level == 0 ){
            kfObj.learnFlag = false;
            kfObj.kfLevel = 10;
        }else{
            kfObj.kfLevel = level > 10 ? 10 : level;
            kfObj.kfLevel = kfObj.kfLevel<= 1 ? 1 : kfObj.kfLevel;
            kfObj.learnFlag = true;
        }

        //

        switch(kfObj.dbObj.kfType){
            case 'qing':
                let difficultyMultiQ = (gApp.difficulty === 1) ? 1 : 0.5;
                kfObj.refObj = gDB.getQGById(kfObj.dbObj.refId);
                kfObj.hst = parseFloat(kfObj.refObj.hst * kfObj.dbObj.hstR * (0.3 + 0.7*kfObj.kfLevel / 10) * difficultyMultiQ);
                kfObj.dge = parseFloat(kfObj.refObj.dge * kfObj.dbObj.dgeR * (0.3 + 0.7*kfObj.kfLevel / 10) * difficultyMultiQ);
                break;
            case 'nei':
                let difficultyMulti = (gApp.difficulty === 1) ? 1 : 0.25;
                kfObj.refObj = gDB.getZQById(kfObj.dbObj.refId);
                // pc,ap,df,cr,cm,hl,dg,py,th,dh,pr,mf,hr,mr
                kfObj.hit = kfObj.refObj.hit * kfObj.dbObj.hitR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.atk = kfObj.refObj.atk * kfObj.dbObj.atkR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.def = kfObj.refObj.def * kfObj.dbObj.defR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.crt = kfObj.refObj.crt * kfObj.dbObj.crtR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.crm = kfObj.refObj.crm * kfObj.dbObj.crmR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.hst = kfObj.refObj.hst * kfObj.dbObj.hstR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.dge = kfObj.refObj.dge * kfObj.dbObj.dgeR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.par = kfObj.refObj.par * kfObj.dbObj.parR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.fdb = kfObj.refObj.fdb * kfObj.dbObj.fdbR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.fdh = kfObj.refObj.fdh * kfObj.dbObj.fdhR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.ris = kfObj.refObj.ris * kfObj.dbObj.risR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.luk =  kfObj.refObj.luk * kfObj.dbObj.lukR * (0.3 + 0.07*kfObj.kfLevel) * difficultyMulti;
                kfObj.reg = Math.round(kfObj.refObj.reg * kfObj.dbObj.regR * (0.4 + 0.06*kfObj.kfLevel)* difficultyMulti) ;
                kfObj.rem =  Math.round(kfObj.refObj.rem * kfObj.dbObj.remR * (0.4 + 0.06*kfObj.kfLevel)* difficultyMulti);
                kfObj.HPMax =  Math.round(kfObj.refObj.HPMax * kfObj.dbObj.HPMaxR * (0.4 + 0.06*kfObj.kfLevel)* difficultyMulti);
                kfObj.MPMax =  Math.round(kfObj.refObj.MPMax * kfObj.dbObj.MPMaxR * (0.4 + 0.06*kfObj.kfLevel)* difficultyMulti);
                break;
            case 'fist':
                kfObj.refObj = gDB.getWGEById(kfObj.dbObj.refId);
                kfObj.wgeDmg = KFModel._getWGEDamageWithKFLevel(kfObj.refObj.wgeDmg,kfObj.dbObj.wgeDmgR,kfObj.kfLevel);
                kfObj.wgeDist = KFModel._getWGEDist(kfObj.refObj.wgeDist,kfObj.dbObj.wgeDistR,kfObj.kfLevel);
                kfObj.wgeRadius = KFModel._getWGERadius(kfObj.refObj.wgeRadius,kfObj.dbObj.wgeRadiusR,kfObj.kfLevel);
                kfObj.wgeDmgActive = KFModel._getWGActiveDamage(kfObj.wgeDmg,dbPlayer[pId].totalState.atk,dbPlayer[pId].totalSkill.fist);
                kfObj.wgeCd = Math.round(100 * kfObj.refObj.cd * dbPlayer[pId].gcd/1.5)/100;
                kfObj.dbObj.costR = isNaN(kfObj.dbObj.costR) ? 1.0 : kfObj.dbObj.costR;
                kfObj.cost = Math.ceil( KFModel._getWGKFMana(kfObj.dbObj.kfTier,kfObj.kfLevel,kfObj.dbObj.kfType) * kfObj.dbObj.costR );
                kfObj.wgeObj = KFModel._prepareForWgeClass(kfObj.wgeDmgActive,kfObj.wgeDist,kfObj.wgeRadius,kfObj.wgeCd,kfObj.kfLevel,kfObj.refObj);
                // kfObj.wgeObj = deepClone(kfObj.refObj);
                // kfObj.wgeObj.wgeDmg = kfObj.wgeDmgActive;
                // kfObj.wgeObj.wgeDist = kfObj.wgeDist;
                // kfObj.wgeObj.wgeRadius = kfObj.wgeRadius;
                // kfObj.wgeObj.wgeCd = kfObj.wgeCd;
                // kfObj.wgeObj.wgeAniLast = KFModel._getWGEAniLast(kfObj.refObj.wgeAniLast,kfObj.kfLevel);
                break;
            case 'sword':
                kfObj.refObj = gDB.getWGEById(kfObj.dbObj.refId);
                kfObj.wgeDmg = KFModel._getWGEDamageWithKFLevel(kfObj.refObj.wgeDmg,kfObj.dbObj.wgeDmgR,kfObj.kfLevel);
                kfObj.wgeDist = KFModel._getWGEDist(kfObj.refObj.wgeDist,kfObj.dbObj.wgeDistR,kfObj.kfLevel);
                kfObj.wgeRadius = KFModel._getWGERadius(kfObj.refObj.wgeRadius,kfObj.dbObj.wgeRadiusR,kfObj.kfLevel);
                kfObj.wgeDmgActive =  KFModel._getWGActiveDamage(kfObj.wgeDmg,dbPlayer[pId].totalState.atk,dbPlayer[pId].totalSkill.sword);
                kfObj.wgeCd =  Math.round(100 * kfObj.refObj.cd * dbPlayer[pId].gcd/1.5)/100;
                kfObj.dbObj.costR = isNaN(kfObj.dbObj.costR) ? 1.0 : kfObj.dbObj.costR;
                kfObj.cost = Math.ceil (KFModel._getWGKFMana(kfObj.dbObj.kfTier,kfObj.kfLevel,kfObj.dbObj.kfType) * kfObj.dbObj.costR );
                kfObj.wgeObj = KFModel._prepareForWgeClass(kfObj.wgeDmgActive,kfObj.wgeDist,kfObj.wgeRadius,kfObj.wgeCd,kfObj.kfLevel,kfObj.refObj);
                break;
            case 'machete':
                kfObj.refObj = gDB.getWGEById(kfObj.dbObj.refId);
                kfObj.wgeDmg = KFModel._getWGEDamageWithKFLevel(kfObj.refObj.wgeDmg,kfObj.dbObj.wgeDmgR,kfObj.kfLevel);
                kfObj.wgeDist = KFModel._getWGEDist(kfObj.refObj.wgeDist,kfObj.dbObj.wgeDistR,kfObj.kfLevel);
                kfObj.wgeRadius = KFModel._getWGERadius(kfObj.refObj.wgeRadius,kfObj.dbObj.wgeRadiusR,kfObj.kfLevel);
                kfObj.wgeDmgActive =  KFModel._getWGActiveDamage(kfObj.wgeDmg,dbPlayer[pId].totalState.atk,dbPlayer[pId].totalSkill.machete);
                kfObj.wgeCd =  Math.round(100 * kfObj.refObj.cd * dbPlayer[pId].gcd/1.5)/100;
                kfObj.dbObj.costR = isNaN(kfObj.dbObj.costR) ? 1.0 : kfObj.dbObj.costR;
                kfObj.cost = Math.ceil( KFModel._getWGKFMana(kfObj.dbObj.kfTier,kfObj.kfLevel,kfObj.dbObj.kfType) * kfObj.dbObj.costR );
                kfObj.wgeObj = KFModel._prepareForWgeClass(kfObj.wgeDmgActive,kfObj.wgeDist,kfObj.wgeRadius,kfObj.wgeCd,kfObj.kfLevel,kfObj.refObj);
                break;
            case 'spear':
                kfObj.refObj = gDB.getWGEById(kfObj.dbObj.refId);
                kfObj.wgeDmg = KFModel._getWGEDamageWithKFLevel(kfObj.refObj.wgeDmg,kfObj.dbObj.wgeDmgR,kfObj.kfLevel);
                kfObj.wgeDist = KFModel._getWGEDist(kfObj.refObj.wgeDist,kfObj.dbObj.wgeDistR,kfObj.kfLevel);
                kfObj.wgeRadius = KFModel._getWGERadius(kfObj.refObj.wgeRadius,kfObj.dbObj.wgeRadiusR,kfObj.kfLevel);
                kfObj.wgeDmgActive = KFModel._getWGActiveDamage(kfObj.wgeDmg,dbPlayer[pId].totalState.atk,dbPlayer[pId].totalSkill.spear);
                kfObj.wgeCd =  Math.round(100 * kfObj.refObj.cd * dbPlayer[pId].gcd/1.5)/100;
                kfObj.dbObj.costR = isNaN(kfObj.dbObj.costR) ? 1.0 : kfObj.dbObj.costR;
                kfObj.cost = Math.ceil( KFModel._getWGKFMana(kfObj.dbObj.kfTier,kfObj.kfLevel,kfObj.dbObj.kfType) * kfObj.dbObj.costR );
                kfObj.wgeObj = KFModel._prepareForWgeClass(kfObj.wgeDmgActive,kfObj.wgeDist,kfObj.wgeRadius,kfObj.wgeCd,kfObj.kfLevel,kfObj.refObj);
                break;
            case 'ejection':
                kfObj.refObj = gDB.getWGEById(kfObj.dbObj.refId);
                kfObj.wgeDmg = KFModel._getWGEDamageWithKFLevel(kfObj.refObj.wgeDmg,kfObj.dbObj.wgeDmgR,kfObj.kfLevel);
                kfObj.wgeDist = KFModel._getWGEDist(kfObj.refObj.wgeDist,kfObj.dbObj.wgeDistR,kfObj.kfLevel);
                kfObj.wgeRadius = KFModel._getWGERadius(kfObj.refObj.wgeRadius,kfObj.dbObj.wgeRadiusR,kfObj.kfLevel);
                kfObj.wgeDmgActive =  KFModel._getWGActiveDamage(kfObj.wgeDmg,dbPlayer[pId].totalState.atk,dbPlayer[pId].totalSkill.ejection);
                kfObj.wgeCd =  Math.round(100 * kfObj.refObj.cd * dbPlayer[pId].gcd/1.5)/100;
                kfObj.dbObj.costR = isNaN(kfObj.dbObj.costR) ? 1.0 : kfObj.dbObj.costR;
                kfObj.cost = Math.ceil( KFModel._getWGKFMana(kfObj.dbObj.kfTier,kfObj.kfLevel,kfObj.dbObj.kfType) * kfObj.dbObj.costR );
                kfObj.wgeObj = KFModel._prepareForWgeClass(kfObj.wgeDmgActive,kfObj.wgeDist,kfObj.wgeRadius,kfObj.wgeCd,kfObj.kfLevel,kfObj.refObj);
                break;
            case 'heal':
                kfObj.refObj = gDB.getZLById(kfObj.dbObj.refId);
                kfObj.realHeal = KFModel._getRealHeal(kfObj.refObj.heal);
                break;
            default:
                break;
        }

        if(kfObj.dbObj.kfType === 'fist' || kfObj.dbObj.kfType === 'sword'|| kfObj.dbObj.kfType === 'machete'
            || kfObj.dbObj.kfType === 'spear' || kfObj.dbObj.kfType === 'ejection') {
            kfObj.dbfObj = gDB.getDBFById(kfObj.dbObj.dbfId);
            if(!jQuery.isEmptyObject(kfObj.dbfObj)){
                kfObj.dbfRat = (kfObj.dbObj.kfTier + 1)*0.04 + dbPlayer[pId].totalSkill.enchant * 0.004;
                kfObj.dbfSpd = parseFloat(kfObj.dbfObj.dbfArg1 * kfObj.dbObj.dbfSpdR * (0.3 + 0.7 * kfObj.kfLevel / 10));
                kfObj.dbfHst = parseFloat(kfObj.dbfObj.dbfArg1 * kfObj.dbObj.dbfHstR * (0.3 + 0.7 * kfObj.kfLevel / 10));
                kfObj.dbfDmg = parseFloat(kfObj.dbfObj.dbfArg1 * kfObj.dbObj.dbfDmgR * (0.3 + 0.7 * kfObj.kfLevel / 10));
                kfObj.dbfDur = parseFloat(kfObj.dbfObj.dbfArg1 * kfObj.dbObj.dbfDurR * (0.3 + 0.7 * kfObj.kfLevel / 10));
            }
        }

        return kfObj;
    }

    /**
     * 根据 KF 等级、player 攻强等信息 ，创建对应用于产生 dynamicScene bullet 的 配置对象
     * @param wgeDmgActive
     * @param wgeDist
     * @param wgeRadius
     * @param wgeCd
     * @param kfLevel
     * @param refObj
     * @returns {*}
     * @private
     */
    static _prepareForWgeClass(wgeDmgActive,wgeDist,wgeRadius,wgeCd,kfLevel,refObj){
        let wgeObj = deepClone(refObj);
        wgeObj.wgeDmg = wgeDmgActive;
        wgeObj.wgeDist = wgeDist;
        wgeObj.wgeRadius = wgeRadius;
        wgeObj.wgeCd = wgeCd;
        wgeObj.wgeAniLast = KFModel._getWGEAniLast(refObj.wgeAniLast,kfLevel);
        return wgeObj;
    }

    static initMobSkill(intMobSkillId, mobAtk){
        // kfObj.kfType = player :  fist | sword | machete | spear | ejection |
        //              => mob:     paw | hammer | thunder | arrow | meteor | mine

        // kfObj.wgeObj   .wgeDmg wgeRadius wgeAniLast wgeDist
        let mobSkillObj = gDB.getMobSkillById(intMobSkillId);
        // sample: {"skill_id":5,"affix":"猛踹","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":1500,"duration":1000,"range":60,"dmgRate":1.2},
        // {
        //         "wgeId": 14,
        //         "wgType": "ejection",
        //         "wgeType": "double",
        //         "wgeDmg": 700,
        //         "wgeDist": 600,
        //         "wgeRadius": 0,
        //         "wgeAniInvoke": 0,
        //         "wgeAniLast": 2000,
        //         "cd":3.0,
        //         "wgeDesc": "暗器连射，对前方 {wgeDist} 米范围内的敌人造成 {wgeDmg} 伤害"
        //     },

        let wgeObj = {
            "wgeId":mobSkillObj.skill_id,
            "wgeName":mobSkillObj.affix,
            "wgeDesc":mobSkillObj.desc,
            "wgeDmg": Math.ceil(mobSkillObj.dmgRate * mobAtk * GLOBAL_DIFFICULTY),
            "wgeDuration":mobSkillObj.duration, // 动画持续时间
            "wgeAniLast":mobSkillObj.wgeAniLast,    // 前摇动画持续时间
            "wgeCD":mobSkillObj.cdMax * 1000,   //
            "cdMax":mobSkillObj.cdMax * 1000,       // cdmax
            "wgeDist":mobSkillObj.range,
            "wgeType":mobSkillObj.wgeType, // point | line | cone | threeLines | area | arc | circle | double | explode
            "wgeRadius":mobSkillObj.wgeRadius,
            "wgType":mobSkillObj.wgType,     // fist | sword | machete | spear | ejection | paw | arrow ...
            "missileCount": mobSkillObj.wgeCount  // 发射几个missile
        };

        return wgeObj;
        // cd: 3
        // wgType: "fist"
        // wgeAniInvoke: 0
        // wgeAniLast: 165
        // wgeCd: 3
        // wgeDesc: "排山倒海，对前方 {wgeDist} 米锥形范围内的敌人造成 {wgeDmg} 伤害"
        // wgeDist: 38
        // wgeDmg: 38
        // wgeId: 3
        // wgeRadius: 1
        // wgeType: point | line | cone | threeLines | area | arc | circle | double | explode

    }

    static _getRealHeal(hValue){
        return Math.floor(hValue * (1 + dbPlayer[pId].totalSkill.heal * 0.03));
    }

    /**
     * 计算外功所需要内力
     * @param tier 外功等级
     * @param level 外功等级
     * @param kfType 外功类型 'fist' 'sword' 'machete' 'spear' 'ejection'
     * @returns {number} 所需要的内力值
     */
    static _getWGKFMana(tier,level,kfType){
        let rate = 1.0;
        switch(kfType){
            case 'fist': rate = 0.5; break;
            case 'sword': rate = 0.8; break;
            case 'machete': rate = 1.0; break;
            case 'spear': rate = 1.2; break;
            case 'ejection': rate = 0.9; break;
            default:break;
        }
        // updated 2023.05.21 减少内力需求量 rate * 3 * => rate * 2.4 *
        // return Math.ceil(rate * 2.0 * tier*tier*Math.sqrt(level) + 3.6 * level);
        // updated 2023.07.18 进一步降低需求
        return Math.ceil(rate * tier * Math.sqrt(tier)* (Math.sqrt(level) + 1.2 * level));
    }
    static _getWGEDamageWithKFLevel(wgeDmg,wgeDmgR,kfLevel){
        return Math.round(wgeDmg * wgeDmgR * (0.1 + 0.9*kfLevel*kfLevel / 100));
    }
    static _getWGActiveDamage(wgeDmg,playerAtk,skillLevel){
        return Math.round((wgeDmg + playerAtk)*(0.1 + 0.9 * skillLevel / 100));
    }
    static _getWGEDist(wgeDist,wgeDistR,kfLevel){
        return Math.round(wgeDist * wgeDistR  * (0.6 + 0.4*kfLevel / 10));
    }
    static _getWGERadius(wgeRadius,wgeRadiusR,kfLevel){
        // return Math.round(wgeRadius * wgeRadiusR  * (0.6 + 0.4*kfLevel / 10));
        return Math.round(wgeRadius * wgeRadiusR  * (0.7 + 0.3*kfLevel / 10));
    }
    static _getWGEAniLast(wgeAniLast,kfLevel){
        // return Math.round(wgeRadius * wgeRadiusR  * (0.6 + 0.4*kfLevel / 10));
        return Math.round(wgeAniLast  * (0.5 + 0.5*kfLevel / 10));
    }

    static getLevelUpExp(kfType,kfTier,kfLevel,wis){
        // if(kfType === 'heal'){ return Math.ceil(1000+3200*(kfTier+1)*(kfTier+3)*32/wis);}
        if(kfType === 'heal'){ return Math.ceil(2000*(kfTier+1)*(kfTier+2)*(kfTier+4)*(kfTier+8)/wis);}
        if(kfLevel>=10){return -1;}
        // console.log("kfTier="+kfTier);
        // console.log("kfLevel="+kfLevel);
        // updated 20220214 升级需要的经验太多，nerf
        // return Math.ceil((1+kfTier)*(1+kfTier) * (100*(1+kfTier)*(1+kfLevel)+500)*50/wis);
        // return Math.ceil(640+(1+kfTier)*(1+Math.sqrt(kfTier)) * (100*(1+kfTier)*(1+kfLevel)+500)*32/wis);
        // updated 2023.11.22 调整速度，tier越高需要得越多，t=0，1时候大致相等，t=6，7时候，大致为上次算法的2倍
        return Math.ceil((1+kfTier)*(2+kfTier)*(3+kfTier) * (0.2*(1+kfTier)*(1+kfLevel)*(1+kfLevel)+500)*32/wis);
    }

    static getLevelUpSkillPoint(kfTier){
        return Math.floor(kfTier/2.0) + 1;
    }
    // 修习所需技能点 = tier * 9
    static getSkillMinToLearn(kfTier){
        return Math.max((kfTier-1) * 10 ,0);          // 0=0 1=9 2=18 3=27 4=36 5=45 6=54 7=63
    }
    // 修习所能到的最大技能点 =  tier * 16 + 25
    static getSkillMaxByLearn(kfTier){
        // changed 20220217. 调低
        let tMax = kfTier * 15 + 10;
        tMax = tMax > 100 ? 100 : tMax;
        return tMax; // 0=10 1=25 2=40 3=55 4=70 5=85 6=100 7=115
        // return kfTier * 16 + 25;    // 0=25 1=31 2=57 3=73 4=89 5>100
    }
    static getLevelArr(type,level){
        let levelArr = [0,0,0,0,0,0,0,0];
        switch(type){
            case 'qing':    levelArr[7] = Math.floor(level+2)/2; break;
            case 'nei':     levelArr[6] = Math.floor(level+2)/2; break;
            case 'heal':    levelArr[5] = Math.floor(level+2)/2; break;
            case 'fist':    levelArr[0] = Math.floor(level+2)/2; break;
            case 'spear':   levelArr[3] = Math.floor(level+2)/2; break;
            case 'sword':   levelArr[1] = Math.floor(level+2)/2; break;
            case 'machete': levelArr[2] = Math.floor(level+2)/2; break;
            case 'ejection':levelArr[4] = Math.floor(level+2)/2; break;
            default: break;
        }
        return levelArr;
    }
    static getLevelMin(type,level){
        let levelArr = [0,0,0,0,0,0,0,0];
        switch(type){
            case 'qing':    levelArr[7] = level * 9; break;
            case 'nei':     levelArr[6] = level * 9; break;
            case 'heal':    levelArr[5] = level * 9; break;
            case 'fist':    levelArr[0] = level * 9; break;
            case 'spear':   levelArr[3] = level * 9; break;
            case 'sword':   levelArr[1] = level * 9; break;
            case 'machete': levelArr[2] = level * 9; break;
            case 'ejection':levelArr[4] = level * 9; break;
            default: break;
        }
        return levelArr;
    }


    /** * @description output as HTML String */
    /** * @returns string */
    static toString(kfModel) {
        if(kfModel === undefined) return;
        let ret = '<div class="kf-desc '+KFModel.getThemColorByTier(kfModel.dbObj.kfTier)+'">' + kfModel.dbObj.kfName + "</div>";
        ret += '<div>'+globalStrings.KM_STR_TIER+gDB.getTierString(kfModel.dbObj.kfTier)+'</div>' +
            '<div>'+globalStrings.KM_STR_TYPE+KFModel.getKFType(kfModel.dbObj.kfType) + '</div>' +
            '<div>'+globalStrings.KM_STR_INNER+'<span class="badge '+KFModel.getThemeForNeili(kfModel.dbObj.kfNeili)+'">'+kfModel.dbObj.kfNeili+'</span></div>';
        ret += kfModel.learnFlag ? '<div>'+globalStrings.KM_STR_LV+kfModel.kfLevel+' / 10 </div>' : '<div>'+globalStrings.KM_STR_NOT_STUDY+KFModel.getSkillNameForKF(kfModel.dbObj.kfType)+">="+KFModel.getSkillMinToLearn(kfModel.dbObj.kfTier)+'</div>';
        ret += globalStrings.ITEM_DESC_2 + CharacterModel.getSkillValue(kfModel.dbObj.kfType);
        ret +='<div>'+globalStrings.ITEM_DESC_3 + KFModel.getLevelUpSkillPoint(kfModel.dbObj.kfTier) + '<br/>'+globalStrings.ITEM_DESC_5+ KFModel.getSkillMaxByLearn(kfModel.dbObj.kfTier) + '</div>';

        //ret += '<span>'+KFModel.getKFType(kfModel.dbObj.kfType)+'</span>';
        let tmp = {};
        let tmpStr = '';
        switch(kfModel.dbObj.kfType){
            case 'qing':
                tmpStr = kfModel.refObj.desc.replace('{hst}',(100*kfModel.hst).toFixed(2) + '%').replace('{dge}',(100*kfModel.dge).toFixed(2)+'%');
                ret += '<div class="kf-desc">'+globalStrings.KM_STR_HAS_EFFECT+'<i class="iconfont icon-fast1"></i><br/>'+tmpStr+'</div>';
                break;
            case 'nei':
                let neiStr = '';
                neiStr += kfModel.hit > GlobalConfig.FLOAT_MIN ? globalStrings.HIT+': +'+(kfModel.hit * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.atk > GlobalConfig.FLOAT_MIN ? globalStrings.ATK+': +'+(kfModel.atk * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.def > GlobalConfig.FLOAT_MIN ? globalStrings.DEF+': +'+(kfModel.def * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.crt > GlobalConfig.FLOAT_MIN ? globalStrings.CRT+': +'+(kfModel.crt * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.crm > GlobalConfig.FLOAT_MIN ? globalStrings.CRM+': +'+(kfModel.crm * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.hst > GlobalConfig.FLOAT_MIN ? globalStrings.HST+': +'+(kfModel.hst * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.dge > GlobalConfig.FLOAT_MIN ? globalStrings.DGE+': +'+(kfModel.dge * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.par > GlobalConfig.FLOAT_MIN ? globalStrings.PAR+': +'+(kfModel.par * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.fdb > GlobalConfig.FLOAT_MIN ? globalStrings.FDB+': +'+(kfModel.fdb * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.fdh > GlobalConfig.FLOAT_MIN ? globalStrings.FDH+': +'+(kfModel.fdh * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.ris > GlobalConfig.FLOAT_MIN ? globalStrings.RIS+': +'+(kfModel.ris * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.luk > GlobalConfig.FLOAT_MIN ? globalStrings.LUK+': +'+(kfModel.luk * 100 ).toFixed(2)+'%<br/>' : '' ;
                neiStr += kfModel.reg > 0 ? globalStrings.REG+': +'+kfModel.reg +'&emsp;&emsp;' : '' ;
                neiStr += kfModel.HPMax > 0 ? globalStrings.HP+': +'+kfModel.HPMax +'<br/>' : '' ;
                neiStr += kfModel.rem > 0 ? globalStrings.REM+': +'+kfModel.rem +'&emsp;&emsp;' : '' ;
                neiStr += kfModel.MPMax > 0 ? globalStrings.MP+': +'+kfModel.MPMax +'<br/>' : '' ;

                // kfModel.dbfSpd = parseFloat(kfModel.dbfObj.dbfArg1 * kfObj.dbObj.dbfSpdR * (0.3 + 0.7*kfObj.kfLevel / 10));
                // kfModel.dbfHst = parseFloat(kfModel.dbfObj.dbfArg1 * kfObj.dbObj.dbfHstR * (0.3 + 0.7*kfObj.kfLevel / 10));
                // kfModel.dbfDmg = parseFloat(kfModel.dbfObj.dbfArg1 * kfObj.dbObj.dbfDmgR * (0.3 + 0.7*kfObj.kfLevel / 10));
                // kfModel.dbfDur = parseFloat(kfObj.dbfObj.dbfArg1 * kfObj.dbObj.dbfDurR * (0.3 + 0.7*kfObj.kfLevel / 10));
                //


                // tmpStr = BaseStateModel.toString(kfModel.zqState);
                ret += '<div class="kf-desc">'+kfModel.refObj.zqName+globalStrings.ZQ+': <i class="'+KFModel.getZqIcon(kfModel.refObj.zqId)+'"></i><br/><span class="kf-zq-desc">'+kfModel.refObj.zqDesc+'</span><br/>'+neiStr+'</div>';
                break;
            case 'fist':
                // tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmg);
                // tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                // tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                // ret += '<div class="kf-desc">武学效果：'+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';

                tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmgActive);
                tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                tmpStr += '<br/>'+globalStrings.COOLDOWN+': '+ kfModel.wgeCd + ' '+globalStrings.SECOND;
                ret += '<div class="kf-desc">'+globalStrings.MANA_COST+': '+kfModel.cost+'</div><div class="kf-desc">'+globalStrings.ATK_EFFECT+': '+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';
                break;
            case 'sword':
                // tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmg);
                // tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                // tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                // ret += '<div class="kf-desc">武学效果：'+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';

                tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmgActive);
                tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                tmpStr += '<br/>'+globalStrings.COOLDOWN+': '+ kfModel.wgeCd + ' '+globalStrings.SECOND;
                ret += '<div class="kf-desc">'+globalStrings.MANA_COST+': '+kfModel.cost+'</div><div class="kf-desc">'+globalStrings.ATK_EFFECT+': '+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';
                break;
            case 'machete':
                // tmp = gDB.getWGEById(kfModel.dbObj.refId);
                //ret += '<div class="kf-desc">效果：<br/>'+tmp.wgeDesc+'</div>';
                // tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmg);
                // tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                // tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                // ret += '<div class="kf-desc">武学效果：'+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';

                tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmgActive);
                tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                tmpStr += '<br/>'+globalStrings.COOLDOWN+': '+ kfModel.wgeCd + ' '+globalStrings.SECOND;
                ret += '<div class="kf-desc">'+globalStrings.MANA_COST+': '+kfModel.cost+'</div><div class="kf-desc">'+globalStrings.ATK_EFFECT+': '+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';
                break;
            case 'spear':
                // tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmg);
                // tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                // tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                // ret += '<div class="kf-desc">武学效果：<br/>'+tmpStr+'</div>';

                tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmgActive);
                tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                tmpStr += '<br/>'+globalStrings.COOLDOWN+': '+ kfModel.wgeCd + ' '+globalStrings.SECOND;
                ret += '<div class="kf-desc">'+globalStrings.MANA_COST+': '+kfModel.cost+'</div><div class="kf-desc">'+globalStrings.ATK_EFFECT+': '+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';
                break;
            case 'ejection':
                // tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmg);
                // tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                // tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                // ret += '<div class="kf-desc">武学效果：'+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';

                tmpStr = kfModel.refObj.wgeDesc.replace('{wgeDmg}',kfModel.wgeDmgActive);
                tmpStr = tmpStr.replace('{wgeRadius}',kfModel.wgeRadius);
                tmpStr = tmpStr.replace('{wgeDist}',kfModel.wgeDist);
                tmpStr += '<br/>'+globalStrings.COOLDOWN+': '+ kfModel.wgeCd + ' '+globalStrings.SECOND;
                ret += '<div class="kf-desc">'+globalStrings.MANA_COST+': '+kfModel.cost+'</div><div class="kf-desc">'+globalStrings.ATK_EFFECT+': '+KFModel.getWgeIcon(kfModel.refObj.wgeType)+'<br/>'+tmpStr+'</div>';
                break;
            case 'heal':
                tmpStr = kfModel.refObj.desc.replace('{healValue}',kfModel.realHeal);
                tmpStr += '<br/>'+globalStrings.COOLDOWN+': '+ dbPlayer[pId].tickInterval + ' '+globalStrings.SECOND;
                ret += '<div class="kf-desc">'+globalStrings.HEAL_EFFECT+': '+KFModel.getZlIcon(kfModel.refObj.zlId)+'<br/>'+tmpStr+'</div>';
                break;
            default:
                break;
        }

        if(kfModel.dbObj.kfType == 'fist' || kfModel.dbObj.kfType == 'sword'|| kfModel.dbObj.kfType == 'machete'
            || kfModel.dbObj.kfType == 'spear' || kfModel.dbObj.kfType == 'ejection'){
            if(!jQuery.isEmptyObject(kfModel.dbfObj)) {
                tmpStr = '<div class="kf-desc">'+globalStrings.DBF_EFFECT+': <i class="'+ KFModel.getDbfIcon(kfModel.dbfObj.dbfId) +'"></i><br/>';
                tmpStr += kfModel.dbfObj.dbfName + ', '+ (kfModel.dbfRat * 100).toFixed(1) + ' % ' + kfModel.dbfObj.dbfDesc;
                tmpStr += '</div>';
                tmpStr = tmpStr.replace('{dbfSpdR}', kfModel.dbfSpd.toFixed(2))
                    .replace('{dbfHstR}', kfModel.dbfHst.toFixed(2))
                    .replace('{dbfDmgR}', kfModel.dbfDmg.toFixed(2))
                    .replace('{dbfDurR}', kfModel.dbfDur.toFixed(2));
                ret += tmpStr;
            }
        }


        // if (bStateArr.hit        >= GlobalConfig.FLOAT_MIN) ret += "命中等级 + " + bStateArr.hit + "<br>";
        // if (bStateArr.atk    >= GlobalConfig.FLOAT_MIN) ret += "攻击强度 + " + bStateArr.atk + "<br>";
        // if (bStateArr.def        >= GlobalConfig.FLOAT_MIN) ret += "防御等级 + " + bStateArr.def + "<br>";
        // if (bStateArr.crt       >= GlobalConfig.FLOAT_MIN) ret += "爆击等级 + " + bStateArr.crt + "<br>";
        // if (bStateArr.crm      >= GlobalConfig.FLOAT_MIN) ret += "爆伤等级 + " + bStateArr.crm + "<br>";
        // if (bStateArr.hst         >= GlobalConfig.FLOAT_MIN) ret += "极速等级 + " + bStateArr.hst + "<br>";
        // if (bStateArr.dge          >= GlobalConfig.FLOAT_MIN) ret += "闪避等级 + " + bStateArr.dge + "<br>";
        // if (bStateArr.par          >= GlobalConfig.FLOAT_MIN) ret += "招架等级 + " + bStateArr.par + "<br>";
        // if (bStateArr.fdb          >= GlobalConfig.FLOAT_MIN) ret += "反伤等级 + " + bStateArr.fdb + "<br>";
        // if (bStateArr.fdh     >= GlobalConfig.FLOAT_MIN) ret += "吸血等级 + " + bStateArr.fdh + "<br>";
        // if (bStateArr.ris      >= GlobalConfig.FLOAT_MIN) ret += "毒抗等级 + " + bStateArr.ris + "<br>";
        // if (bStateArr.luk      >= GlobalConfig.FLOAT_MIN) ret += "幸运等级 + " + bStateArr.luk + "<br>";
        // if (bStateArr.reg          >= GlobalConfig.FLOAT_MIN) ret += "生命回复 + " + bStateArr.reg + "<br>";
        // if (bStateArr.rem          >= GlobalConfig.FLOAT_MIN) ret += "内力回复 + " + bStateArr.rem + "<br>";

        return ret;
    }

    static getThemColorByTier(tier){
        switch(parseInt(tier)){
            case 0: return 'theme-gray';break;
            case 1: return 'theme-white';break;
            case 2: return 'theme-blue';break;
            case 3: return 'theme-gold';break;
            case 4: return 'theme-purple';break;
            case 5: return 'theme-epic';break;
            case 6: return 'theme-legend';break;
            case 7: return 'theme-marvel';break;
            case 8: return 'theme-suit';break;
            default: return 'theme-gray';break;
        }
    }
    static getKFType(typ){
        switch(typ){
            case 'qing': return globalStrings.ITEM_PRE_QG;break;
            case 'nei': return globalStrings.ITEM_PRE_NG;break;
            case 'fist': return globalStrings.ITEM_PRE_QZ;break;
            case 'sword': return globalStrings.ITEM_PRE_JF;break;
            case 'machete': return globalStrings.ITEM_PRE_DF;break;
            case 'spear': return globalStrings.ITEM_PRE_QF;break;
            case 'ejection': return globalStrings.ITEM_PRE_AQ;break;
            case 'heal': return globalStrings.SKILL_HEAL;break;
            default:return '';break;
        }
    }
    static getKFIcon(typ){
        switch(typ){
            case 'qing': return '<i class="iconfont icon-fast2"></i>';
            case 'nei': return '<i class="iconfont icon-six"></i>';
            case 'fist': return '<i class="iconfont icon-fist-raised"></i>';
            case 'sword': return '<i class="iconfont icon-jian"></i>';
            case 'machete': return '<i class="iconfont icon-dao"></i>';
            case 'spear': return '<i class="iconfont icon-arrow-line1"></i>';
            case 'ejection': return '<i class="iconfont icon-bow"></i>';
            case 'heal': return '<i class="iconfont icon-health1"></i>';
            default:return '';
        }
    }
    static getZlIcon(zlId){
        switch(zlId){
            case 1:return '<i class="iconfont icon-Injured"></i>';        // 包扎       急救术 26
            case 2:return '<i class="iconfont icon-tree4"></i>';        // 草药       草药学 27
            case 3:return '<i class="iconfont icon-health1"></i>';        // 治疗       伤寒论 4
            case 4:return '<i class="iconfont icon-hand"></i>';        // 妙手回春     杂病论 5
            case 5:return '<i class="iconfont icon-health2"></i>';        // 治愈术      神农本草经   6
            case 6:return '<i class="iconfont icon-attacktime"></i>';        // 易经洗髓     难经      7
            case 7:return '<i class="iconfont icon-luckycharm"></i>';        // 三花聚顶     千金方     8
            case 8:return '<i class="iconfont icon-threetriangles"></i>';        // 脱胎换骨     皇帝内经    9
            default: return '';
        }
    }
    static getWgeIcon(wgeType){
        switch(wgeType){
            case 'point': return '<i class="iconfont icon-spot1"></i>';
            case 'line': return '<i class="iconfont icon-line"></i>';
            case 'threeLines': return '<i class="iconfont icon-arrow-line"></i>';
            case 'double': return '<i class="iconfont icon-doublearrow1"></i>';
            case 'cone': return '<i class="iconfont icon-wifi-strength-"></i>';
            case 'circle': return '<i class="iconfont icon-lucky1"></i>';
            case 'area': return '<i class="iconfont icon-point"></i>';
            case 'arc': return '<i class="iconfont icon-wifi-strength-outline"></i>';
            case 'explode': return '<i class="iconfont icon-bomb_exploded"></i>';
            default: return '<i class="iconfont icon-stop1"></i>';
        }
    }
    static getZqIcon(zqId){
        switch(parseInt(zqId)){
            case 1:return 'iconfont icon-Ioniconsmdcloudoutline';   // 紫霞
            case 2:return 'iconfont icon-frozen';   // 寒冰
            case 3:return 'iconfont icon-frozen2';  // 六阴
            case 4:return 'iconfont icon-dark';     // 玄冥
            case 5:return 'iconfont icon-taichi';   // 太极
            case 6:return 'iconfont icon-threetriangles';      // 三清
            case 7:return 'iconfont icon-flower';      // 繁花
            case 8:return 'iconfont icon-Wind';      // 和风
            case 9:return 'iconfont icon-lucky_playdefuben';      // 无相
            case 10:return 'iconfont icon-rate';     // 先天
            case 11:return 'iconfont icon-coin';     // 乾坤
            case 12:return 'iconfont icon-equal';     // 逍遥
            case 13:return 'iconfont icon-sun';     // 旭日
            case 14:return 'iconfont icon-dian';     // 纯源
            case 15:return 'iconfont icon-sun1';     // 九阳
            case 16:return 'iconfont icon-icons-pagoda';     // 天罡
            case 17:return 'iconfont icon-jiugongge1';     // 九宫
            case 18:return 'iconfont icon-star-hexagon';     // 六镜
            default:return 'iconfont icon-i7';     // 默认
        }
    }
    static getDbfIcon(dbfId){
        switch(parseInt(dbfId)){
            case 1:return 'iconfont icon-Confused';   // 眩晕
            case 2:return 'iconfont icon-spa-stone-';   // 僵直
            case 3:return 'iconfont icon-point2';  // 止行
            case 4:return 'iconfont icon-slow';     // 减速
            case 5:return 'iconfont icon-hurt-love';   // 剧痛
            case 6:return 'iconfont icon-confused';      // 奇痒
            case 7:return 'iconfont icon-sad';      // 虚弱
            case 8:return 'iconfont icon-Weaken';      // 无力
            case 9:return 'iconfont icon-Hurt';      // 断筋
            default:return 'iconfont icon-health3';
        }
    }
    static getThemeForNeili(nl){
        switch(nl){
            case globalStrings.KF_INNER_TYPE_YIN:return 'badge-purple';break;
            case globalStrings.KF_INNER_TYPE_YANG:return 'badge-warning';break;
            case globalStrings.KF_INNER_TYPE_HE:return 'badge-info';break;
            default:return 'badge-primary';break;
        }
    }

    static getSkillNameForKF(typ){
        switch(typ){
            case 'qing': return globalStrings.SKILL_SWIFT;break;
            case 'nei': return globalStrings.SKILL_ENCHANT;break;
            case 'fist': return globalStrings.SKILL_FIST;break;
            case 'sword': return globalStrings.SKILL_SWORD;break;
            case 'machete': return globalStrings.SKILL_MACHETE;break;
            case 'spear': return globalStrings.SKILL_SPEAR;break;
            case 'ejection': return globalStrings.SKILL_EJECTION;break;
            case 'heal': return globalStrings.SKILL_HEAL;break;
            default:return '';break;
        }

    }

    static getPlayerLevelForKF(kfId){
        for(let w=0;w<dbPlayer[pId].wgList.length;w++){
            if(parseInt(dbPlayer[pId].wgList[w].kfId) == parseInt(kfId)) return dbPlayer[pId].wgList[w].kfLevel;
        }
        for(let w=0;w<dbPlayer[pId].ngList.length;w++){
            if(parseInt(dbPlayer[pId].ngList[w].kfId) == parseInt(kfId)) return dbPlayer[pId].ngList[w].kfLevel;
        }
        for(let w=0;w<dbPlayer[pId].qgList.length;w++){
            if(parseInt(dbPlayer[pId].qgList[w].kfId) == parseInt(kfId)) return dbPlayer[pId].qgList[w].kfLevel;
        }

        return 0;
    }

    /** written but not tested */
    /**
     * 创建 kfObj.dbObj , 对应dbKFStatic
     * @param tier [0,7]
     * @param neili [0,1,2] 阴柔 调和 阳刚
     * @param type [0,1,2] 内功 外功 轻功  =1 -> 11=fist 12=sword 13=machete 14=spear 15=ejection
     * @returns {{}}
     */
    static kfDynamic(tier,neili,type){
        tier = arguments[0] ? arguments[0] : 0;
        neili = arguments[1] ? arguments[1] : 0;
        type = arguments[2] ? arguments[2] : 0;

        tier = parseInt(tier); tier = tier>=7 ? 7 : tier; tier = tier<0 ? 0 : tier;
        neili = parseInt(neili); neili = neili >= 2 ? 2 : neili; neili = neili <=0 ? 0 : neili;
        type = parseInt(type); type = type<=0 ? 0 : type;

        // 产生kfId - 规避 kfId重复问题

        // 确定是 外功、内功、还是轻功，医书无法随机

        // 根据 外内轻，生成名称 - todo: 暂不规避重名问题?

        // - 内功：确定真气
        // - 内功：根据Tier 随机真气 baseState 和 数值范围
        // 注意： 阴阳调和能够随机的真气不同

        // - 外功：确定 fist sword machete spear ejection
        // - 外功：确定 对应的 wge 和 数值
        // - 外功: 确定 debuff 和 数值 - 注意 阴阳调和对应的外功，对应的dbf 类型不同

        // - 轻功：确定 数值

        let dbObj = {};
        dbObj.kfId = KFModel._uuid();
        dbObj.kfTier = tier;

        switch(neili){
            case 0: dbObj.kfNeili = globalStrings.KF_INNER_TYPE_YIN;break;
            case 1: dbObj.kfNeili = globalStrings.KF_INNER_TYPE_HE;break;
            case 2: dbObj.kfNeili = globalStrings.KF_INNER_TYPE_YANG;break;
            default: dbObj.kfNeili = globalStrings.KF_INNER_TYPE_YIN;break;
        }

        switch(type){
            case 0:KFModel._dynamicN(dbObj);break;
            case 1:KFModel._dynamicW(dbObj);break;
            case 2:KFModel._dynamicQ(dbObj);break;
            case 11:dbObj.kfType='fist';KFModel._dynamicW(dbObj);break;
            case 12:dbObj.kfType='sword';KFModel._dynamicW(dbObj);break;
            case 13:dbObj.kfType='machete';KFModel._dynamicW(dbObj);break;
            case 14:dbObj.kfType='spear';KFModel._dynamicW(dbObj);break;
            case 15:dbObj.kfType='ejection';KFModel._dynamicW(dbObj);break;
            default:dbObj = undefined; break;
        }

        // console.log(dbObj);
        // dbKF.push(dbObj);        // set global, comment out for dbug
        return dbObj;
    }
    static _dynamicW(dbObj){
        // {"kfId":3,"kfName":"桃花掌法","kfNeili":"阴柔","kfTier":3,"kfType":"fist","refId":2,
        // "wgeDmgR":0.35,"wgeDistR":0.6,"wgeRadiusR":0.45,
        // "dbfId":3,"dbfSpdR":0.45,"dbfHstR":0.45,"dbfDmgR":0.45,"dbfDurR":0.45,
        // "hitR":0,"atkR":0,"defR":0,"crtR":0,"crmR":0,"hstR":0,"dgeR":0,"parR":0,"fdbR":0,"fdhR":0,"risR":0,"lukR":0,"regR":0,"remR":0,"HPMaxR":0,"MPMaxR":0},

        if(dbObj.kfType == undefined){
            switch (SeedRandom.getRndInteger(1,5)){
                case 1: dbObj.kfType = 'fist';break;
                case 2: dbObj.kfType = 'sword';break;
                case 3: dbObj.kfType = 'machete';break;
                case 4: dbObj.kfType = 'spear';break;
                case 5: dbObj.kfType = 'ejection';break;
                default:dbObj.kfType = 'fist';break;
            }
        }
        // ref = wge
        let dbTier = gDB.getKFTierById(dbObj.kfTier);
        let wgeArr = gDB.getWGEByType(dbObj.kfType);
        let idx = SeedRandom.getRndInteger(0,wgeArr.length-1);
        dbObj.refId = wgeArr[idx];
        // 2023.09.21 保底20%
        dbObj.wgeDmgR= SeedRandom.getRandFloat(dbTier.kfMin * 0.2,dbTier.kfMax);
        dbObj.wgeDistR= SeedRandom.getRandFloat(dbTier.kfMin * 0.2,dbTier.kfMax);
        dbObj.wgeRadiusR= SeedRandom.getRandFloat(dbTier.kfMin * 0.2,dbTier.kfMax);
        // add 2023.05.15 加入随机 mana 变动范围
        dbObj.costR = 0.5 + SeedRandom.getRandFloat(dbTier.kfMin,dbTier.kfMax) * 0.5;
        // dbf
        switch (dbObj.kfNeili){
            case '阳刚':
                idx = SeedRandom.getRndInteger(0,dbfYang.length-1);
                dbObj.dbfId = dbfYang[idx];
                break;
            case '调和':
                idx = SeedRandom.getRndInteger(0,dbfHe.length-1);
                dbObj.dbfId = dbfHe[idx];
                break;
            default:
                idx = SeedRandom.getRndInteger(0,dbfYin.length-1);
                dbObj.dbfId = dbfYin[idx];
                break;
        }
        // 2023.09.21 保底25%
        dbObj.dbfSpdR=SeedRandom.getRandFloat(dbTier.kfMin * 0.25,dbTier.kfMax);
        dbObj.dbfHstR=SeedRandom.getRandFloat(dbTier.kfMin * 0.25,dbTier.kfMax);
        dbObj.dbfDurR=SeedRandom.getRandFloat(dbTier.kfMin * 0.25,dbTier.kfMax);
        dbObj.dbfDmgR=SeedRandom.getRandFloat(dbTier.kfMin * 0.25,dbTier.kfMax);

        // name
        dbObj.kfName = KFModel._randWGName(dbObj.kfType);

        // buff
        dbObj.hitR = 0;dbObj.atkR = 0;dbObj.defR = 0;dbObj.crtR = 0;dbObj.crmR = 0;
        dbObj.parR = 0;dbObj.fdbR = 0;dbObj.fdhR = 0;dbObj.risR = 0;dbObj.lukR = 0;
        dbObj.hstR = 0;dbObj.dgeR=0;
        dbObj.regR = 0;dbObj.HPMaxR = 0;dbObj.remR = 0;dbObj.MPMaxR = 0;
    }
    static _dynamicQ(dbObj){
        //{"kfId":1,"kfName":"归云纵","kfNeili":"阴柔","kfTier":3,"kfType":"qing","refId":4,
        // "wgeDmgR":0,"wgeDistR":0,"wgeRadiusR":0,"dbfId":0,"dbfSpdR":0,"dbfHstR":0,"dbfDmgR":0,"dbfDurR":0,
        // "hitR":0,"atkR":0,"defR":0,"crtR":0,"crmR":0,"hstR":0.112,"dgeR":0.15,"parR":0,"fdbR":0,"fdhR":0,"risR":0,"lukR":0,"regR":0,"remR":0,"HPMaxR":0,"MPMaxR":0},
        dbObj.kfType = 'qing';
        dbObj.refId = dbObj.kfTier + 1;
        dbObj.kfName = KFModel._randQGName();
        dbObj.wgeDmgR=0; dbObj.wgeDistR=0; dbObj.wgeRadiusR=0;
        dbObj.dbfId=0; dbObj.dbfSpdR=0; dbObj.dbfHstR=0; dbObj.dbfDurR=0;
        dbObj.hitR = 0;dbObj.atkR = 0;dbObj.defR = 0;dbObj.crtR = 0;dbObj.crmR = 0;
        dbObj.parR = 0;dbObj.fdbR = 0;dbObj.fdhR = 0;dbObj.risR = 0;dbObj.lukR = 0;
        dbObj.regR = 0;dbObj.HPMaxR = 0;dbObj.remR = 0;dbObj.MPMaxR = 0;

        let dbTier = gDB.getKFTierById(dbObj.kfTier);
        // dbObj.hstR = SeedRandom.getRandFloat(dbTier.kfMax,dbTier.kfMax);
        // dbObj.dgeR = SeedRandom.getRandFloat(dbTier.kfMin,dbTier.kfMax);
        // updated 2023.09.21 高品级也要随机到垃圾属性 - 改为 5 阶梯 的随机分布， 20%一个档次
        // 忽略 kfMin，没有保底，只有根据max 和 档次来
        let a0 = SeedRandom.getRand(0,5);
        let a1 = SeedRandom.getRand(0,5);

        dbObj.hstR = 0.01 * dbTier.kfMax * SeedRandom.getRand(a0 * 20,(a0 + 1)*20);
        dbObj.dgeR = 0.01 * dbTier.kfMax * SeedRandom.getRand(a1 * 20,(a1 + 1)*20);
    }
    static _dynamicN(dbObj){
        // {"kfId":2,"kfName":"归元劲","kfNeili":"调和","kfTier":3,"kfType":"nei","refId":10,
        // "wgeDmgR":0,"wgeDistR":0,"wgeRadiusR":0,"dbfId":0,"dbfSpdR":0,"dbfHstR":0,"dbfDmgR":0,"dbfDurR":0,
        // "hitR":0,"atkR":0.5,"defR":0.5,"crtR":0,"crmR":0,"hstR":0,"dgeR":0,"parR":0,"fdbR":0,"fdhR":0,"risR":0,"lukR":0,"regR":0.5,"remR":0.5,"HPMaxR":0.5,"MPMaxR":0.5},
        dbObj.kfType = 'nei';
        switch(dbObj.kfNeili){
            case globalStrings.KF_INNER_TYPE_YIN:dbObj.refId = SeedRandom.getRndInteger(1,6);break;
            case globalStrings.KF_INNER_TYPE_HE:dbObj.refId = SeedRandom.getRndInteger(7,12);break;
            case globalStrings.KF_INNER_TYPE_YANG:dbObj.refId = SeedRandom.getRndInteger(13,18);break;
            default: dbObj.refId = SeedRandom.getRndInteger(1,6);break;
        }
        let refObj = gDB.getZQById(dbObj.refId);
        // console.log(refObj);
        // bug-fix : 20240519 如果是中文，取一个 九阴->阴 如果是英文，取后一个字符串
        let tmpName = getLastPart(refObj.zqName);
        dbObj.kfName = KFModel._randNGName(tmpName);

        dbObj.wgeDmgR=0; dbObj.wgeDistR=0; dbObj.wgeRadiusR=0;
        dbObj.dbfId=0; dbObj.dbfSpdR=0; dbObj.dbfHstR=0; dbObj.dbfDurR=0;
        KFModel._dynamicZQ(dbObj);
    }
    static _dynamicZQ(dbObj){
        // 取得 dtZq
        // 根据 tier 决定属性数量 = tier
        // 根据 tier 决定R加权范围 = 范围表
        let a1 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // remR MPMaxR 默认都有
        // 14 个 的数组， 1 和 0， 1 的数量7
        let b1 = KFModel._zqRtoArr(dbObj.refId);    //[0,0,0,1,1,0,1,1,1,0,0,1,1,0];
        // console.log('b1='+b1.join());
        // 从7个 里面随机选择 Tier 个
        // updated 2023.11.22 - 加入属性个数随机，解决内功随机性不明显问题
        // 从7个 里面随机选择 [Math.floor(Tier*0.8),Tier] 个  概率约等于 (tier+1) * 0.72 的小数部分
        let propCount = dbObj.kfTier < 8 ? dbObj.kfTier : 7;
        let fR = SeedRandom.getRand(0,10);
        switch (dbObj.kfTier){
            case 5:
                propCount = fR < 4 ? 4 : 5; // 40%概率 4级别，60%概率5级
                break;
            case 6:
                if(fR < 3){
                    propCount = 4;  // 30%概率 4级别
                }else if(fR < 7){
                    propCount = 5;  // 40%概率 5级别
                }   // 30%概率 6级别
                break;
            case 7:
                if(fR < 3){
                    propCount = 5;  // 30%概率 5级别
                }else if(fR < 7){
                    propCount = 6;  // 40%概率 6级别
                }       // 30%概率 7级别
                break;
            default:break;
        }

        let b2 = SeedRandom.getRandSeq(1,7);    //[7,5,3,1,4,2,6]
        // console.log('b2='+b2.join());
        let b3 = b2.slice(0,propCount);          //[7,5,3]
        // console.log('b3='+b3.join());
        let myCount = 0;
        for(let i=0;i<b1.length;i++){
            if(b1[i]==1){
                myCount++;
                if(jQuery.inArray(myCount,b3)>=0){
                    a1[i] = 1;
                }
            }

        }
        // console.log('a1='+a1.join());
        let dbTier = gDB.getKFTierById(dbObj.kfTier);
        // updated 2023.05.21 改为泊松分布。
        // updatd 2023.08.18 加入class 应用到所有属性
        {
            // let stateClass = SeedRandom.getRand(0,dbObj.kfTier);    // [0,~7)
            // let bStateClass = stateClass * 0.1; // [0,0.7) 固定保底部分 = kfMin + (max-min) * bStateClass
            // let pStateClass = 1.0 - bStateClass;    // 随机部分 = 再 + (max-min) * pStateClass * rand
            // let rng = dbTier.kfMax - dbTier.kfMin;
            // // dbTier.kfMin + rng * (bStateClass + pStateClass * SeedRandom.doublePossRand(0,1))
            // dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass))
            // dbObj.hitR = a1[0]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.atkR = a1[1]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.defR = a1[2]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.crtR = a1[3]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.crmR = a1[4]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.hstR = a1[5]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.dgeR = a1[6]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.parR = a1[7]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.fdbR = a1[8]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.fdhR = a1[9]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.risR = a1[10]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.lukR = a1[11]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.regR = a1[12]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            // dbObj.HPMaxR = a1[13]>0 ? dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass)) : 0;
            //
            // dbObj.remR = dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass));
            // dbObj.MPMaxR = dbTier.kfMin + rng * (bStateClass +  SeedRandom.doublePossRand(0,pStateClass));
        }
        // updated 2023.09.21 高品级也要随机到垃圾属性 - 改为 5 阶梯 的随机分布， 20%一个档次
        // 忽略 kfMin，没有保底，只有根据max 和 档次来
        let ia = [];
        for(let i=0;i<16;i++) {
            ia.push(SeedRandom.getRand(0,5));
        }

        dbObj.hitR = a1[0]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[0] * 20,(ia[0] + 1)*20)) : 0;
        dbObj.atkR = a1[1]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[1] * 20,(ia[1] + 1)*20)) : 0;
        dbObj.defR = a1[2]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[2] * 20,(ia[2] + 1)*20)) : 0;
        dbObj.crtR = a1[3]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[3] * 20,(ia[3] + 1)*20)) : 0;
        dbObj.crmR = a1[4]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[4] * 20,(ia[4] + 1)*20)) : 0;
        dbObj.hstR = a1[5]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[5] * 20,(ia[5] + 1)*20)) : 0;
        dbObj.dgeR = a1[6]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[6] * 20,(ia[6] + 1)*20)) : 0;
        dbObj.parR = a1[7]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[7] * 20,(ia[7] + 1)*20)) : 0;
        dbObj.fdbR = a1[8]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[8] * 20,(ia[8] + 1)*20)) : 0;
        dbObj.fdhR = a1[9]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[9] * 20,(ia[9] + 1)*20)) : 0;
        dbObj.risR = a1[10]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[10] * 20,(ia[10] + 1)*20)) : 0;
        dbObj.lukR = a1[11]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[11] * 20,(ia[11] + 1)*20)) : 0;
        dbObj.regR = a1[12]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[12] * 20,(ia[12] + 1)*20)) : 0;
        dbObj.HPMaxR = a1[13]>0 ? (0.01 * dbTier.kfMax * SeedRandom.getRand(ia[13] * 20,(ia[13] + 1)*20)) : 0;
        dbObj.remR =  0.01 * dbTier.kfMax * SeedRandom.getRand(ia[14] * 20,(ia[14] + 1)*20);
        // MPMax 加入保底?
        let mpMaxa = SeedRandom.getRand(2,5);   // 40 - 100% 相当于保底40%
        dbObj.MPMaxR = 0.01 * dbTier.kfMax * SeedRandom.getRand(mpMaxa * 20,(mpMaxa + 1)*20);

    }
    static _zqRtoArr(zqId){
        let refObj = gDB.getZQById(zqId);
        let arr = [];
        refObj.hit > 0 ? arr.push(1) : arr.push(0);
        refObj.atk > 0 ? arr.push(1) : arr.push(0);
        refObj.def > 0 ? arr.push(1) : arr.push(0);
        refObj.crt > 0 ? arr.push(1) : arr.push(0);
        refObj.crm > 0 ? arr.push(1) : arr.push(0);
        refObj.hst > 0 ? arr.push(1) : arr.push(0);
        refObj.dge > 0 ? arr.push(1) : arr.push(0);
        refObj.par > 0 ? arr.push(1) : arr.push(0);
        refObj.fdb > 0 ? arr.push(1) : arr.push(0);
        refObj.fdh > 0 ? arr.push(1) : arr.push(0);
        refObj.ris > 0 ? arr.push(1) : arr.push(0);
        refObj.luk > 0 ? arr.push(1) : arr.push(0);
        refObj.reg > 0 ? arr.push(1) : arr.push(0);
        //refObj.rem > 0 ? arr.push(1) : arr.push(0);
        refObj.HPMax > 0 ? arr.push(1) : arr.push(0);
        //refObj.MPMax > 0 ? arr.push(1) : arr.push(0);
        return arr;
    }

    static _uuid(){
        let id = dbKF.length;
        while(gDB.getKFById(id) !== undefined){
            id++;
        }
        // console.log("dynamic uuid = "+id);
        return id;
    }
    static _randNGName(key){
        //let zqId = SeedRandom.getRndInteger(1,dtZq.length);   // [1,18]
        //let zqObj = gDB.getZQById(zqId);
        //let key = zqObj.zqName.substr(-1);  // 和风 => 风
        // console.log(key);
        let pre = GlobalConfig.NG_PRE_ARR[SeedRandom.getRand(0,GlobalConfig.NG_PRE_ARR.length)];
        let end = GlobalConfig.NG_SUF_ARR[SeedRandom.getRand(0,GlobalConfig.NG_SUF_ARR.length)];
        return pre+key+" "+end;
    }
    static _randWGName(cate){
        let idx = '';
        switch(cate){
            case 'fist':idx = 0;break;
            case 'sword':idx = 1;break;
            case 'machete':idx = 2;break;
            case 'spear':idx = 3;break;
            case 'ejection':idx = 4;break;
            default:idx = 0;
        }
        let strKeyWord = GlobalConfig.WG_KEY_ARR[idx][SeedRandom.getRand(0, 9)];
        let intPreRand = SeedRandom.getRand(0, GlobalConfig.WG_PRE_ARR.length);
        let intSufRand = SeedRandom.getRand(0, GlobalConfig.WG_SUF_ARR.length);
        return GlobalConfig.WG_PRE_ARR[intPreRand] + GlobalConfig.WG_SUF_ARR[intSufRand] + strKeyWord;
    }
    static _randQGName(){
        let intLen = GlobalConfig.QG_KEY_ARR.length;
        let intIdx = SeedRandom.getRand(0, intLen);
        let strKeyWord = GlobalConfig.QG_KEY_ARR[intIdx];
        let intPreRand = SeedRandom.getRand(0, GlobalConfig.QG_PRE_ARR.length);
        let intSufRand = SeedRandom.getRand(0, GlobalConfig.QG_SUF_ARR.length);
        return GlobalConfig.QG_PRE_ARR[intPreRand] + GlobalConfig.QG_SUF_ARR[intSufRand] + strKeyWord;
    }
}



