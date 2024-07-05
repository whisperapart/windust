/**
 * 这里一个工厂类，负责根据把 zone 中所有的 mob 实例化后，放入一个List
 * Created by jim on 2022/04/26.
 */

class ArmyModel{

    static prepareMobRaw(intZoneId,intNPCId){
        let mobs = [];
        let flagEndlessAdj = false;
        let flagBossBattleAdj = false;  // 拿着推荐状进入武道会。
        let returnObj = {
            "mobs":[],
            flagEndlessAdj : false,
            flagBossBattleAdj : false
        }

        switch (intZoneId){
            case GlobalConfig.ZONE_ID_COW:  // 秘境 cow 82
                // zoneId=82 秘境奶牛关，没有解锁时候无法进入，解锁后进入并刷新怪物
                if(dbPlayer[pId].flagCow){
                    mobs = gDB.getMobsInZone(intZoneId);
                }
                break;
            case GlobalConfig.ZONE_ID_ARENA: // 武道会 arena 109
                // zoneId=109 武道会，没有推荐状无法进入，有推荐状刷新怪物，完成任务风尘三侠通关后，进入则变为boss竞技场=直接随机刷新boss
                if(dbPlayer[pId].flagArena){
                    // boss 随机单挑模式
                    // boss_list = GlobalConfig.MOB_TEMPLATE_BOSS
                    // [102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,119,120,121,122,123,124,125,126,127,131,132,133,134,135,136,137,144,165,166]
                    let intMobTemplateId = GlobalConfig.MOB_TEMPLATE_BOSS[Math.floor(Math.random()* GlobalConfig.MOB_TEMPLATE_BOSS.length)];
                    let npc = gDB.getMobById(intMobTemplateId);
                    mobs.push(npc);
                }
                else if(CharacterModel.hasItem(GlobalConfig.ITEM_ID_TJZ)){   // 164 = 推荐状
                    // 刷新怪物
                    mobs = gDB.getMobsInZone(intZoneId);
                    flagBossBattleAdj = true;
                }
                break;
            case GlobalConfig.ZONE_ID_ASHRAM:  // 百人道场 ashram 112
                // zoneId=112 百人道场 unlockCode=5 解锁后 flagAshram ,进入 zone 切换至百人状态，否则进入 普通状态。
                if(dbPlayer[pId].flagAshram){
                    // load 百人道场 mobs, 100 个
                    mobs = gDB.getMobsInZone(GlobalConfig.ZONE_ID_ASHRAM_100);
                }else{
                    mobs = gDB.getMobsInZone(intZoneId);
                }
                break;
            case GlobalConfig.ZONE_ID_ENDLESS: // 无尽模式 endless 113
                // zoneId=113 无尽模式，没有解锁时候无法进入，解锁后进入并刷新怪物
                if(dbPlayer[pId].flagEndless){
                    flagEndlessAdj = true;
                    mobs = gDB.getMobsInZone(intZoneId);
                }
                break;
            case GlobalConfig.ZONE_ID_FIELD:    // 比武场 115
                let npc = NPCModel.createNPCMobForZone(intNPCId, intZoneId);
                mobs.push(npc);
                break;
            default:
                // 普通zone
                mobs = gDB.getMobsInZone(intZoneId);
                break;
        }
        returnObj.mobs = mobs;
        returnObj.flagEndlessAdj = flagEndlessAdj;
        returnObj.flagBossBattleAdj = flagBossBattleAdj;
        return returnObj;
    }

    /**
     * 实例化所有mob，放入数组返回，主要hp mp drops 等, Used in QuickBattle
     * @param intZoneId
     * @param intNPCId
     * @returns {[{hp:*,mp:*,drop:[{*}],atk:*,def:*}]}
     */
    static prepareMobObjList(intZoneId, intNPCId){
        let mobs = [];
        let mobObjList = [];
        let flagEndlessAdj = false;
        let flagBossBattleAdj = false;  // 拿着推荐状进入武道会。

        let prepareObj = ArmyModel.prepareMobRaw(intZoneId,intNPCId);
        mobs = deepClone(prepareObj.mobs);
        flagEndlessAdj = prepareObj.flagEndlessAdj;
        flagBossBattleAdj = prepareObj.flagBossBattleAdj;
        prepareObj = undefined;

        if(!flagEndlessAdj){
            for(let i =0;i<mobs.length;i++){
                let oMob = new MobModel(mobs[i]);
                if(flagBossBattleAdj) oMob.aggressive = false;
                mobObjList.push(oMob);
            }
        }else{
            // 如果是无尽模式，applyWaveBuff - 无尽模式1000 个 = 100 轮，每轮重复 db中的 【0-9）
            for(let t=0;t<100;t++){
                for(let i =0;i<mobs.length;i++){
                    let oMob = new MobModel(mobs[i]);
                    oMob.applyWaveBuff(t*10+i+1);
                    mobObjList.push(oMob);
                }
            }
        }
        return mobObjList;
    }

    /**
     * used in Dynamic Battle
     * @param prepareObj {"mobs":[],"flagEndlessAdj":bool,"flagBossBattleAdj":bool}
     * @param scene
     * @param intWave int
     * @return {*[]}
     */
    static prepareMobCtrList(prepareObj, scene, intWave=1){

        let mobs = prepareObj.mobs;
        let flagEndlessAdj = prepareObj.flagEndlessAdj;
        let flagBossBattleAdj = prepareObj.flagBossBattleAdj;
        let mobObjList = [];

        if(!flagEndlessAdj){
            for(let i =0;i<mobs.length;i++){
                let oMob = new MobController(scene,mobs[i],i);
                if(flagBossBattleAdj) oMob.model.aggressive = false;
                mobObjList.push(oMob);
            }
        }else{
            // 如果是无尽模式，applyWaveBuff - 无尽模式1000 个 = 100 轮，每轮重复 db中的 【0-9）
            for(let i =0;i<mobs.length;i++){
                let wave_order = (intWave-1)*10+i+1;
                let oMob = new MobController(scene,mobs[i],i,wave_order);
                // oMob.model.applyWaveBuff((intWave-1)*10+i+1);
                mobObjList.push(oMob);
            }
        }
        return mobObjList;
    }
}

