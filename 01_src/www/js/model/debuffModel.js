/** updated 2023.05.17
 * 试图整合原先的 debuffManager 和 后加入的 .dbfObj. 的实现方式
 * 不修改原来的 dbPlayer[pId].dbfObj.xxx 和 现有的 DeBuffModel / DeBuffManager 方式
 * 加入 DeBuffManager.initFromPlayer(), 根据 dbPlayer[pId].dbfObj 初始化DeBuffManager
 * 这样保存游戏的逻辑不用改变，载入游戏/开始游戏之后，调用 initFromPlayer 一次，即可。
 * 错误：~~封装所有原先直接对 .dbfObj. 的操作，通过 DeBuffManger 完成，实现数据的同步（DeBuffModel 与 .dbfObj.xxx）~~
 * 更正：实际上所有的debuff逻辑在CharacterModel已经实现，因此 DebuffModdel 弃用。
 * !!! 更正： 放弃此部分代码，使用 DeBuffWidget代替，写入 deBuffWidget.js !!!
 * todo: DynamicScene 中，使用的 Player 仍旧使用 原来的 DeBuffModel 和 DeBuffManager, 需要调整
 *
 */

class DeBuffModel{
    dbf = undefined;    // mob skill
    _tar = undefined;   // player_model, undefined = quickbattle
    _active = false;    // if active
    _cur = 0; _max = 0; // cooldown_time 命中后当前计时 , cooldown_max_time - debuff 总时间
    _tur = 0; _tick = 0;    // tick_time, tick_max_time - debuff 的tick 效果时间计数
    _applyCB = undefined;   // debuff 命中的回调
    _tickCB = undefined;    // tick 触发 的 回调
    _direction = undefined; // 方向，战斗场景决定方向问题
    _dmg = undefined;   // debuff 附带伤害，例如 中毒效果

    // targetModel 必须实现接口： getHurt updateTotalState blind repel
    constructor(int_skill_id, targetModel, dmg = 0) {
        dmg = dmg === undefined ? 0 : dmg; // 用于 816，记录mob dot 伤害。
        this.dbf = gDB.getMobSkillById(int_skill_id);
        this._tar = targetModel;    // this._tar =undefined 表示快速战斗，= dynamicScene里面的player.js 表示 dynamic 战斗
        this._dmg = dmg;
    }

    // 每次 update 调用
    update(time,delta){
        if(!this._active) return;
        this._tur = this._tur + delta;
        this._cur = this._cur + delta;

        if(this._tur >= this._tick){
            this.tick();
        }
        if(this._cur >= this._max){
            this.fade();
        }
    }

    // 应用到对象model - 例如，命中玩家，direction表示方向，例如击退效果
    apply(direction){   // direction: -1 向左边（missile在玩家右边，朝左推）， 1 向右边
        this._max = this.dbf.duration != null ? this.dbf.duration : 0;
        switch(this.dbf.skill_id){
            case 815:       // 815	深寒	攻击附带减速（hst）效果20%，持续6秒
                this._applyCB = this._dbf815;
                this._tickCB = undefined;
                break;
            case 816:       // 816	剧毒	攻击附带中毒效果，12秒内造成原伤害100%伤害
                // this._applyCB = undefined;
                // this._tick = this.dbf.cdMax * 1000;
                // this._tickCB = this._dbf816;
                // changed 2022.12.02 dot效果在characterModel的 regen 里面实现
                this._applyCB = this._dbf816;
                this._tickCB = undefined;
                break;
            case 817:       // 817	暗影	盲目，无法视物，持续2秒，持续2秒
                this._applyCB = this._dbf817;
                this._tickCB = undefined;
                break;
            case 818:       // 818	击退
                this._applyCB = this._dbf818;
                this._tickCB = undefined;
                this._direction = direction;
                break;
            case 819:       // 819	寒潮	攻击附带降低移动速度效果，持续2秒
                this._applyCB = this._dbf819;
                this._tickCB = undefined;
                break;
            default:
                this._applyCB = undefined;
                this._tickCB = undefined;
                break;
        }
        if(typeof this._applyCB === 'function'){
            this._applyCB();
            this._active = true;
        }
        // this._tar.updateTotalState();
        // 刷新角色属性，并更新hud bubble buff debuff
        CharacterModel.calcTotalState();
    }

    /** 心跳效果 **/
    tick(){
        // fixme: 这里实现了dot 扣血，那么 characterModel 里面 reg 的dot扣血逻辑是否移除？
        if(typeof this._tickCB === 'function') this._tickCB();
        deBuffManager.guiUpdateBuffWidget();
        this._tur = 0;
    }

    fade(){
        if(!this._active) return;
        this._active = false;
        // this._tar.updateTotalState();
        CharacterModel.calcTotalState();
        // this._tar.deBuffManager.notifyChange();  // 改变逻辑，不用事件，改为定期刷新
        this._tar = undefined;
    }

    /**
     * 合并debuff
     * @param anotherDeBuffModel DeBuffModel
     */
    mergeDebuff(anotherDeBuffModel){
        if(this.dbf.skill_id !== anotherDeBuffModel.dbf.skill_id ) return;  // 只有相同的debuff才合并
        this._active = true;
        switch (this.dbf.skill_id){
            case 815:
                this._max = dbPlayer[pId].dbfObj.hst.duration;
                this._cur = 0;
                break;
            case 816:
                this._max = dbPlayer[pId].dbfObj.dot.duration;
                this._cur = 0;
                break;
            case 817:
                this._max = dbPlayer[pId].dbfObj.blind.duration;
                this._cur = 0;
                break;
            case 818:
                this._max = dbPlayer[pId].dbfObj.stun.duration;
                this._cur = 0;
                break;
            case 819:
                this._max = dbPlayer[pId].dbfObj.spd.duration;
                this._cur = 0;
                break;
            default:
                break;
        }
    }

    isActive(){
        return this._active;
    }

    _dbf815(){  // 815	深寒	攻击附带减速（hst）效果20%，持续6秒
        // this._tar.dbfHst(this.dbf.dmgRate);
        // this._tar.updateTotalState();
        // updated 2022.12.02 新的处理逻辑
        CharacterModel.gainDeBuff(815);
    }
    _dbf816(){   // 816	剧毒	攻击附带中毒效果，12秒内造成原伤害100%伤害
        // this._tar.getHurt(this._dmg * this.dbf.dmgRate, 'ris');    // 20221202, 应该不需要了，命中的时候直接有伤害
        CharacterModel.gainDeBuff(816,this._dmg * this.dbf.dmgRate);
        // CharacterModel.getHurtWithRis(this.dbf.dmg * this.dbf.dmgRate);
    }
    _dbf817(){  // 817	暗影	盲目，无法视物，持续2秒，持续2秒
        //  黑屏？ 眼盲逻辑
        if(this._tar){
            this._tar.blind(this.dbf.duration,0,0,0);
        }
        CharacterModel.gainDeBuff(817);
    }
    _dbf818(){  // 818 击退
        //  击退 logic
        this._direction = this._direction != null ? this._direction : 1;
        if(this._tar){
            this._tar.repel(this._direction);
        }
        CharacterModel.gainDeBuff(818);
    }
    _dbf819(){  // 819	寒潮	攻击附带降低移动速度效果，持续2秒
        // this._tar.dbfMoveSpeed(this.dbf.dmgRate);
        // 不需要了，因为再计算totalState的时候已经算了 debuffManager的情况
        // 只要刷新 totalState
        CharacterModel.gainDeBuff(819);
        CharacterModel.calcTotalState();
        // todo: 检查 dynamic scene 里面计算移动速度的逻辑
    }

    toString(){
        let rest = Math.ceil((this._max - this._cur)/1000);
        let restStr = '('+rest + 's)';
        if(rest > 3600){
            restStr = '('+Math.floor(rest/3600) + 'h)';
        }else if (rest > 60){
            restStr = '('+Math.floor(rest/60) + 'm)';
        }
        return '<div class="bw-buff-wrap"> <i class="iconfont '+this.guiGetIconById()+'"></i> <span>'+this.dbf.affix+restStr+'</span> </div>';
    }

    guiGetIconById(){
        switch(this.dbf.skill_id){
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
}

class DeBuffManager {
    // deBuffMap;  // key = mob_skill_id, value = DeBuffModel
    deBuffArr = [];
    _refreshTick;

    constructor() {
        // this.deBuffMap = new Map();
        this.debuffArr = [];
        this._refreshTick = 0;
    }

    initFromPlayer(){
        // {hst:{duration:0,value:0.2},spd:{duration:0,value:0.2},stun:{duration:0},blind:{duration:0},dot:{duration:0,value:0}}
        // 815 深寒	攻击附带减速（hst）效果20%，持续6秒
        this.deBuffMap.set(815,dbPlayer[pId].dbfObj.hst);
        // 816	剧毒	攻击附带中毒效果，12秒内造成原伤害100%伤害
        this.deBuffMap.set(816,dbPlayer[pId].dbfObj.dot);
        // 817	暗影	盲目，无法视物，持续2秒，持续2秒
        this.deBuffMap.set(817,dbPlayer[pId].dbfObj.blind);
        // 818	击退	眩晕，无法防御，持续2秒，持续2秒
        this.deBuffMap.set(818,dbPlayer[pId].dbfObj.stun);
        // 819	寒潮	攻击附带降低移动速度效果，持续2秒
        this.deBuffMap.set(819,dbPlayer[pId].dbfObj.spd);
    }

    removeOne(skill_id,player){
        let idx = -1;
        for(let i=0;i<this.debuffArr.length;i++){
            if(this.debuffArr[i].dbf.skill_id === skill_id){
                idx = i;
                break;
            }
        }
        if(idx >=0){    // debuff 已经存在
            this.debuffArr[idx].fade();
        }
    }


    addOne(skill_id, player, missileX, dmg=0) {
        dmg = dmg === undefined ? 0 : dmg;
        let dbfModelObj = new DeBuffModel(skill_id, player, dmg);
        // todo - 不要用 array.push 因为在model层已经实现了时间的累加和效果的累加
        // fixme - 解决 dot 出现了无数个的问题，应该叠加。同样类型的 skill_id 不应该出现多个debuff图标。
        // fixed - debuff 图标缺少 stun
        let idx = -1;
        for(let i=0;i<this.debuffArr.length;i++){
            if(this.debuffArr[i].dbf.skill_id === skill_id){
                idx = i;
                break;
            }
        }
        let direction = -1;
        if(player){
            direction = missileX > player.sprite.x ? -1 : 1;
        }
        dbfModelObj.apply(direction);   // 数据模型层，加入 debuff
        // 逻辑展示层
        if(idx >=0){    // debuff 已经存在
            this.debuffArr[idx].mergeDebuff(dbfModelObj);
        }else{  // debuff 不存在，新增
            this.debuffArr.push(dbfModelObj);
        }
        return dbfModelObj;
    }

    update(time, delta) {
        for (let i = 0; i < this.debuffArr.length; i++) {
            if(this.debuffArr[i].isActive()){
                this.debuffArr[i].update(time, delta);
            }else{
                this.debuffArr.splice(i, 1);
                i--;
            }
        }
        this._refreshTick = this._refreshTick + delta;
        if(this._refreshTick >=1000){   // 每秒刷新
            // if(this.debuffArr.length > 0){
            this.guiUpdateBuffWidget();
            // }
            this._refreshTick = 0;
        }
    }

    // notifyChange(){
    //     for (let i = 0; i < this.debuffArr.length; i++) {
    //         if(!this.debuffArr[i].isActive()){
    //             this.debuffArr.splice(i, 1);
    //             i--;
    //         }
    //     }
    //      this.guiUpdateBuffWidget();
    // }

    explainHstChange() {
        let sum815 = 0;
        for (let i = 0; i < this.debuffArr.length;i++){
            if(this.debuffArr[i].isActive() && this.debuffArr[i].dbf.skill_id === 815){
                sum815 += this.debuffArr[i].dbf.dmgRate;
            }
        }
        return sum815;  // 0.51% = 0.0051; -20%
    }
    explainMoveSpeedChange(){
        let sum819 = 0;
        for (let i = 0; i < this.debuffArr.length;i++){
            if(this.debuffArr[i].isActive() && this.debuffArr[i].dbf.skill_id === 819){
                sum819 += this.debuffArr[i].dbf.dmgRate;
            }
        }
        return sum819*100; // moveOnSpeed = 200;
    }

    toString(){
        let retStr = "<div>";
        for(let i=0;i<this.debuffArr.length;i++){
            retStr = retStr + this.debuffArr[i].toString();
        }
        return retStr+"</div>";
    }

    guiUpdateBuffWidget(){
        $("#div_de_buff").html(this.toString());
    }
}

let deBuffManager = new DeBuffManager();
