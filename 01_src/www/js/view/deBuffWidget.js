/**
 * 封装 deBuff 展示 相关功能
 * 2023.05.17
 * 所有的debuff逻辑在CharacterModel已经实现，此 Widget 进行UI展示
 * 1. 在玩家信息载入完毕后，调用 deBuffWidget.initFromPlayer(), 进行初始化，产生映射关系
 * 2. 在需要更新debuff展示的时候，调用 deBuffWidget.guiUpdate()
 * 3. updated: 发现没必要弄个对象，直接封装操作就行了。数据直接从 dbPlayer拿，改为 全 static
 */
class DeBuffWidget {
    // deBuffMap;  // key = mob_skill_id, value = DeBuffModel

    constructor() {
        // this.deBuffMap = new Map();
    }

    /** 更新所有 debuff 的 描述 */
    static toString(){
        let retStr = "<div>";
        retStr += DeBuffWidget._dbfToString(815,dbPlayer[pId].dbfObj.hst.duration);
        retStr += DeBuffWidget._dbfToString(816,dbPlayer[pId].dbfObj.dot.duration);
        retStr += DeBuffWidget._dbfToString(817,dbPlayer[pId].dbfObj.blind.duration);
        retStr += DeBuffWidget._dbfToString(818,dbPlayer[pId].dbfObj.stun.duration);
        retStr += DeBuffWidget._dbfToString(819,dbPlayer[pId].dbfObj.spd.duration);

        if(dbPlayer[pId].food <=30){
            retStr += '<div class="bw-buff-wrap"> <i class="iconfont icon-confused"></i> <span>'+globalStrings.DBF_HUNGER+'</span> </div>';
        }
        return retStr+"</div>";
    }

    /** 单个 debuff 的展示 */
    static _dbfToString(skill_id, duration){
        if(duration === 0) return "";
        let rest = Math.ceil(duration/1000);
        return '<div class="bw-buff-wrap"> <i class="iconfont '
            +DeBuffWidget._guiGetIconById(skill_id)+'"></i> <span>'
            +DeBuffWidget._guiGetDbfName(skill_id)
            +DeBuffWidget._guiGetDurationStr(rest)+'</span> </div>';
    }

    /** 判断是否是一个debuff */
    static _boolMobDeBuffCheck(skill_id) {
        return (skill_id >= 815) && (skill_id <= 819);
    }

    /** 获取 debuff 名称 */
    static _guiGetDbfName(skill_id){
        let name = "";
        if(DeBuffWidget._boolMobDeBuffCheck(skill_id)) {
            name = gDB.getMobSkillById(skill_id).affix;
        }
        return name;
    }

    /** 获取 debuff 剩余时间时间 */
    static _guiGetDurationStr(rest){
        let restStr = '('+rest + 's)';
        if(rest > 3600){
            restStr = '('+Math.floor(rest/3600) + 'h)';
        }else if (rest > 60){
            restStr = '('+Math.floor(rest/60) + 'm)';
        }
        return restStr;
    }

    /** 获取 debuff 图标 */
    static _guiGetIconById(skill_id){
        switch(skill_id){
            case 815:       // 815	深寒	攻击附带减速（hst）效果20%，持续6秒
                return "icon-frozen";
            case 816:       // 816	剧毒	攻击附带中毒效果，12秒内造成原伤害100%伤害
                return "icon-bomb_exploded";
            case 817:       // 817	暗影	盲目，无法视物，持续2秒，持续2秒
                return "icon-Weaken";
            case 818:       // 818	击退	眩晕，无法防御，持续2秒，持续2秒
                return "icon-confused";
            case 819:       // 819	寒潮	攻击附带降低移动速度效果，持续2秒
                return "icon-Hurt";
            default: return "";
        }
    }

    /** 更新 widget 的展示内容 */
    static guiUpdate(){
        $("#div_de_buff").html(DeBuffWidget.toString());
    }
}
