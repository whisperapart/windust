/**
 * 封装 NPC 的操作
 * Created by jim on 2022/03/08.
 */
class NPCModel{
    constructor(intNPCId){

    }

    /**
     * 杜甫，计算下一个杜甫所在城市
     * @param intCurrentCityId - 当前城市id
     * @returns {number} - 下一个城市Id
     */
    static getNextCityIdForDF(intCurrentCityId){
        let avaCityList = [1,4,15,22,31,32];    // dbCityItem npcId == 9
        let nextCityId = 22;
        let idx = avaCityList.lastIndexOf(intCurrentCityId);
        if(idx>=0){
            // 方案1：顺序循环
            // idx = ((idx + 1) >= avaCityList.length) ? 0 : (idx + 1);
            // 方案2：随机变化
            idx = GlobalFunction.getRandIntExcept(0,avaCityList.length,idx);
            // 可能还会抽到 idx
            nextCityId = avaCityList[idx];
        }
        return nextCityId;
    }

    /**
     * 创建 NPC 对应的 Mob 对象
     * @param intNPCId
     * @param intZoneId
     * @returns {{drop: number[], fleeAble: boolean, par: number, dge: number, def: number, level: number, mob_template_id: number, aggroRange: number, title: string, mob_template_name: string, hpMax: number, affix: number, sprite: string, atk: number, aggressive: boolean}|{drop: number[], fleeAble: boolean, par: number, dge: number, def: number, level: number, mob_template_id: number, aggroRange: number, title: string, mob_template_name: string, hpMax: number, affix: string, sprite: string, atk: number, aggressive: boolean}}
     */
    static createNPCMobForZone(intNPCId, intZoneId){
        //  {"mob_template_id":1,"mob_template_name":"白兔","sprite":"rabbit","title":"","affix":1,"level":1,
        //  "drop":[13.7,14.7,19.005],
        //  "aggressive":false,"fleeAble":true,"aggroRange":160,"atk":2,"def":2,"dge":25,"par":0,"hpMax":160},
        let npc = gDB.getNPCById(intNPCId);
        let defaultRet = undefined;
        if(npc.mob_template_id){
            let npc_id = parseInt(npc.mob_template_id);
            defaultRet = gDB.getMobById(npc_id);
            defaultRet.mob_template_name = npc.npcName;
            defaultRet.name = npc.npcName;
        }else{
            defaultRet = gDB.getMobById(1);
        }
        defaultRet.zone_id = intZoneId;
        return defaultRet;
    }

}

