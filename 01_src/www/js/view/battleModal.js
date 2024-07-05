/**
 * Created by jim on 2021/7/27.
 */

class BattleModal {
    // object properties
    constructor() {
        this.logList = [];
        this.battleZoneObj = '';
        this.mobList = [];
        // this.autoLogHandler = '';
        this.currentLog = '';
        this.readyMobIdx = -1;
        this.lastLogIndex = -1;
        this.selectorHud = "#battleModalHud";
        this.dmgTotal = 0;
        this.msStart = 0;

        // $("#startFightBtn").on('click',BattleModal.startFight);
        $("#startFightBtn").on('click',BattleModal.startFightMultiple);
        $("#startFightAllBtn").on('click',BattleModal.startFightAll);
        $("#leaveQuickBattleBtn").on('click',BattleModal.leaveQuickBattle);
    }

    // shared functions
    static drawBattleModal(){
        $(".modal").modal('hide');
        $(".kf-pop-over").popover('hide').popover('dispose');
        BattleModal.updateModelContent("");
        $("#battleModal").modal('show');
    }
    static updateModelContent(logText){
        // always show bottom as log-viewer
        $("#quickCombatLog").html(logText).scrollTop(function() { return this.scrollHeight; });
    }
    static leaveQuickBattle(){
        this.dmgTotal = 0;
        // bug-fix 刷新npcAction
        let npcId =  $("#battleModal").data('npcId');
        let cId = $("#battleModal").data('cId');
        let bId = $("#battleModal").data('bId');
        if(npcId == '0'){
            // 说明是从 大地图 进入的战斗，此时应该退回大地图
            gApp.leaveQuickBattle();
        }else{
            // 说明是从其他城市中发起的，例如是 城市里面的切磋。
            gGui.drawNPCActions(npcId,bId,cId);
            gApp.leaveQuickBattleToCity();
        }
        gGui.enableKeys();
    }

    static isShow(){
        return ($("#battleModal").css('display') === 'block');
    }
    static hideModal(){
        $("#battleModal").modal('hide');
    }

    // instance functions
    prepareLogs(){
        // let logStr = this.logList.join('<p>');
        this.logList = [];
        this.currentLog = '';
        this.dmgTotal = 0;
    }
    // 根据battleZoneId创建battleZone对象
    initBattleZone(battleZoneObj, npcId, bId){
        this.prepareLogs(); // clear logs;
        $("#startFightBtn").show();
        $("#startFightAllBtn").show();
        $("#battleModal").data('npcId',npcId);
        $("#battleModal").data('bId',bId);
        $("#battleModal").data('cId',dbPlayer[pId].zoneId);

        // console.log("cid="+dbPlayer[pId].zoneId+" bId="+bId + " npcId="+npcId);

        this.battleZoneObj = battleZoneObj;
        this.mobList = [];
        this.currentLog = '';
        this.readyMobIdx = -1;
        this.lastLogIndex = -1;

        let intNpcId = parseInt(npcId); // if 0, system=进入普通zone，如果=npcId，说明是切磋模式。

        this.appendLog(globalStrings.ENTER_LEVEL+" [ "+this.battleZoneObj.zoneName + " ]");
        $("#battleModal").data('zoneId',battleZoneObj.zoneId);
        // console.log("进入 [ "+this.battleZoneObj.zoneName + " ]");
        // - 设置自动刷新log
        // this.autoLogHandler = setInterval(this.updateLogs,1000);
        // 读取怪物列表
        this.mobList = ArmyModel.prepareMobObjList(battleZoneObj.zoneId,intNpcId);
        this.appendLog(globalStrings.BM_LOAD_ENEMY+" : [ "+this.mobList.length+" ] "+globalStrings.BM_LOAD_ENEMY_END);
        // updated 2023.05.18 百人斩、无尽关，不显示具体名字，太多了。
        if(this.mobList.length < 40){
            let mobNameLog = "";
            for(let i =0;i<this.mobList.length;i++){
                mobNameLog = mobNameLog + "<span class='badge bg-primary'>"+"[lv."+this.mobList[i].level +"] "+ this.mobList[i].name+"</span>";
            }
            this.appendLog(mobNameLog);
        }

        // this.appendLog("共载入 " + mobNames.length + " 个敌人。");
        this.updateLogs();
        // console.log("init battle done");
        this.readyMobIdx = this.mobList.length > 0 ? 0 : -1;
    }
    updateLogs(force){
        let newLog = '';
        for(let i=0;i<this.logList.length;i++){
            newLog += '<p class="log_class_'+this.logList[i].cls+'">' + this.logList[i].content + '</p>';
        }
        if(force === 1){
            BattleModal.updateModelContent(newLog);
            this.currentLog = newLog;
            return;
        }
        if(this.currentLog !== newLog){
            BattleModal.updateModelContent(newLog);
            this.currentLog = newLog;
        }
    }

    /**
     * 更新战斗日志，并刷新页面
     * @param strContent - 战斗内容
     */
    logAppend(strContent,force){
        this.logList.push(strContent);
        if(force){
            this.updateLogs(1);
        }else{
            if(this.logList.length - this.lastLogIndex >50){
                this.updateLogs(1);
                this.lastLogIndex = this.logList.length-1;
            }
        }
    }

    appendLog(strContent,side){
        let cls = side === 'player' ? side+'Log' : 'systemLog';
        cls = side === 'mob' ? side+'Log' : cls;
        this.logList.push({cls:cls,content:strContent});
        if(this.logList.length > GlobalConfig.COMBAT_LOG_MAX ){
            this.logList.shift();
        }
    }

    /**
     * 提示语，玩家收到伤害之后，判断闪避 招架 和实际收到伤害。
     * @param actDmg
     */
    appendLogPlayerHurt(actDmg){
        if(actDmg === -1){
            this.appendLog(dbPlayer[pId].name + globalStrings.BM_DGE+globalStrings.EOL,'player');
        }else if(actDmg === -2){
            this.appendLog(dbPlayer[pId].name + globalStrings.BM_PAR+globalStrings.EOL,'player');
        }else{
            this.appendLog(dbPlayer[pId].name + globalStrings.BM_HURT+toReadableString(actDmg)+globalStrings.EOL,'player');
        }
    }
    appendLogMobHurt(mobName,actDmg){
        if(actDmg === -1){
            this.appendLog(mobName + globalStrings.BM_DGE+globalStrings.EOL,'player');
        }else if(actDmg === -2){
            this.appendLog(mobName + globalStrings.BM_PAR+globalStrings.EOL,'player');
        }else{
            this.appendLog(mobName + globalStrings.BM_HURT+toReadableString(actDmg)+globalStrings.EOL,'mob');
        }
    }

    // 离开快速战斗zone，清除页面刷新计时器
    // leaveBattleZone(){
    //     clearInterval(this.autoLogHandler);
    // }

    // 从第一个怪物开始，单挑
    static startFight(){
        if(battleModal.readyMobIdx >= battleModal.mobList.length) return;
        gGui.playSoundEffect();
        $("#startFightBtn").prop("disabled",true);
        $("#leaveQuickBattleBtn").prop("disabled",true);
        let i = battleModal.readyMobIdx;
        battleModal.appendLog("开始战斗, 怪物"+battleModal.mobList[i].name+"，编号 # " + battleModal.readyMobIdx);

        if(dbPlayer[pId].curHP > 0){
            // let result = GQuickBattle.oneOnOne(battleModal.mobList[i]);
            GQuickBattle.oneOnOne(battleModal.mobList[i]).then(result => {
                let resultStr = result === 1 ? dbPlayer[pId].name + "打败了"+ battleModal.mobList[i].shortName: dbPlayer[pId].name +" 战败，胜利者："+battleModal.mobList[i].shortName;
                resultStr = result === -2 ? "平局" : resultStr;
                battleModal.appendLog(resultStr);

                if(result === 1){
                    // 获取掉落
                    for(let j=0;j<battleModal.mobList[i].inventory.length;j++){
                        // dbPlayer[pId].inventory.push({'id':battleModal.mobList[i].inventory[j].itemId,'count':1});
                        let gainItemResult = CharacterModel.gainItem(battleModal.mobList[i].inventory[j].itemId,1);
                        // 1=成功 2=成功且超出堆叠后重新分组 -1=没有足够空位 -2=没有足够空位添加了部分 0=item未发现 -3=数量异常 -4=唯一物品无法重复创建
                        let mobDropStr = '';
                        switch (gainItemResult){
                            case 1:
                                // console.log("玩家获得物品:"+battleModal.mobList[i].inventory[j].itemName);
                                mobDropStr = battleModal.mobList[i].inventory[j].itemName;
                                if(mobDropStr !== ""){
                                    battleModal.appendLog(dbPlayer[pId].name + "获得物品：" + mobDropStr);
                                }
                                break;
                            case 2:
                                // console.log("玩家获得物品:"+battleModal.mobList[i].inventory[j].itemName);
                                mobDropStr += battleModal.mobList[i].inventory[j].itemName + " ";
                                if(mobDropStr !== ""){
                                    battleModal.appendLog(dbPlayer[pId].name + "获得物品：" + mobDropStr);
                                }
                                break;
                            case -1:
                                battleModal.appendLog("行囊满了，无法装下。");
                                break;
                            case -2:
                                battleModal.appendLog("行囊已装满。");
                                break;
                            case -4:
                                battleModal.appendLog("["+battleModal.mobList[i].inventory[j].itemName + "]是唯一物品，无法拾取。");
                                break;
                            default:
                                break;
                        }
                    }
                    // 修改：经验和掉落的计算放到场景中，而非在数据对象中
                    let mobExp = battleModal.mobList[i].getExp();
                    CharacterModel.gainExp(mobExp);
                    let zoneId =  parseInt($("#battleModal").data('zoneId'));
                    CharacterModel.addKillCountForTask(zoneId,battleModal.mobList[i].mobId);
                    battleModal.appendLog(dbPlayer[pId].name + "获得经验值："+ toReadableString(mobExp));
                    // 准备下一个mob
                    let nextMobIndex = i + 1;
                    if(nextMobIndex >= battleModal.mobList.length){
                        // 所有怪物都被杀死
                        // console.log("所有怪物已被击败。");
                        battleModal.appendLog("所有怪物已被击败。");
                        $("#startFightBtn").hide();
                    }else{
                        battleModal.readyMobIdx = nextMobIndex;
                    }
                }else{
                    // player lose
                    // 2021.11.25 玩家不死亡。
                    dbPlayer[pId].curHP = 1;
                    battleModal.appendLog("挑战失败，少侠再来过吧。");
                    $("#startFightBtn").hide();
                }
                gGui.drawHUD();
                battleModal.updateLogs(1);
                $("#startFightBtn").prop("disabled",false);
                $("#leaveQuickBattleBtn").prop("disabled",false);
            });
        }else{
            gGui.drawHUD();
            battleModal.appendLog("已经战败，重整旗鼓再来过。");
            $("#startFightBtn").hide();
            $("#startFightBtn").prop("disabled",false);
            $("#leaveQuickBattleBtn").prop("disabled",false);
        }
        battleModal.updateLogs(1);
    }

    // 第二版本，支持群体攻击
    static startFightMultiple(){
        gGui.playSoundEffect();
        $("#startFightBtn").prop("disabled",true);
        $("#startFightAllBtn").prop("disabled",true);
        $("#leaveQuickBattleBtn").prop("disabled",true);
        battleModal.appendLog(globalStrings.START_BATTLE+globalStrings.EOL);
        battleModal.msStart = performance.now();
        battleModal.dmgTotal = 0;
        if(dbPlayer[pId].curHP > 0){
            let zoneId =  parseInt($("#battleModal").data('zoneId'));
            GQuickBattle.oneOnMore(battleModal.mobList,zoneId).then(result => {
                let resultStr = result === 0 ? dbPlayer[pId].name + globalStrings.BM_WIN+globalStrings.EOL : dbPlayer[pId].name + globalStrings.BM_FAIL+globalStrings.EOL;
                battleModal.appendLog(resultStr);

                if(result === 0){
                    if(GQuickBattle.getFirstAvaMobIdx(battleModal.mobList)<0){
                        // 所有怪物都被杀死
                        // console.log("所有怪物已被击败。");
                        let sDur = (performance.now() - battleModal.msStart)/1000;
                        let dps = battleModal.dmgTotal / sDur;
                        battleModal.appendLog(globalStrings.BM_DEFEAT_ALL+globalStrings.EOL);
                        battleModal.appendLog("dmg = "+toReadableString(battleModal.dmgTotal)+" , duration = "+(sDur.toFixed(2))+"s, dps = "+(dps.toFixed(1)));
                        $("#startFightBtn").hide();
                        $("#startFightAllBtn").hide();
                    }else{

                    }
                }else{
                    // player lose
                    // 2021.11.25 玩家不死亡。
                    dbPlayer[pId].curHP = dbPlayer[pId].curHP < 1 ? 1 : dbPlayer[pId].curHP;
                    let sDur = (performance.now() - battleModal.msStart)/1000;
                    let dps = battleModal.dmgTotal / sDur;
                    battleModal.appendLog(globalStrings.BM_DEFEATED);
                    battleModal.appendLog("dmg = "+toReadableString(battleModal.dmgTotal)+" , duration = "+(sDur.toFixed(2))+"s, dps = "+(dps.toFixed(1)));
                    $("#startFightBtn").hide();
                    $("#startFightAllBtn").hide();
                }
                gGui.drawHUD();
                battleModal.updateLogs(1);
                $("#startFightBtn").prop("disabled",false);
                $("#startFightAllBtn").prop("disabled",false);
                $("#leaveQuickBattleBtn").prop("disabled",false);
                $(battleModal.selectorHud).html("");
            });
        }else{
            let sDur = (performance.now() - battleModal.msStart)/1000;
            let dps = battleModal.dmgTotal / sDur;
            gGui.drawHUD();
            battleModal.appendLog(globalStrings.BM_AGAIN);
            battleModal.appendLog("dmg = "+toReadableString(battleModal.dmgTotal)+" , duration = "+(sDur.toFixed(2))+"s, dps = "+(dps.toFixed(1)));
            $("#startFightBtn").hide();
            $("#startFightAllBtn").hide();
            $("#startFightBtn").prop("disabled",false);
            $("#startFightAllBtn").prop("disabled",false);
            $("#leaveQuickBattleBtn").prop("disabled",false);
            $(battleModal.selectorHud).html("");
        }
        battleModal.updateLogs(1);
    }

    // 20230529 startFightMultiple 基础上
    static startFightAll(){
        gGui.playSoundEffect();
        $("#startFightBtn").prop("disabled",true);
        $("#startFightAllBtn").prop("disabled",true);
        $("#leaveQuickBattleBtn").prop("disabled",true);
        battleModal.appendLog(globalStrings.BM_ONCE_FOR_ALL);
        battleModal.updateLogs(1);
        setTimeout(function(){
            battleModal.appendLog("Tui! [ "+dbPlayer[pId].name+" ] "+globalStrings.BM_POSE);
            battleModal.updateLogs(1);
            setTimeout(function(){
                // 你们这帮渣滓，给 姑奶奶/爷 一起上吧，老 娘/子 赶时间！
                battleModal.appendLog(globalStrings.BM_DIRTY_1+(pId===1 ? globalStrings.BM_DIRTY_2 : globalStrings.BM_DIRTY_3)+globalStrings.BM_DIRTY_6+(pId===1 ? globalStrings.BM_DIRTY_4 : globalStrings.BM_DIRTY_5)+globalStrings.BM_DIRTY_7);
                battleModal.updateLogs(1);
                setTimeout(function(){
                    battleModal.appendLog(globalStrings.BM_SHOUT);
                    battleModal.updateLogs(1);
                    setTimeout(function(){
                        battleModal.appendLog(globalStrings.BM_SHOUT_RET);
                        battleModal.updateLogs(1);
                        setTimeout(function(){
                            battleModal.msStart = performance.now();
                            battleModal.dmgTotal = 0;
                            if(dbPlayer[pId].curHP > 0){
                                let zoneId =  parseInt($("#battleModal").data('zoneId'));
                                GQuickBattle.oneOnMore(battleModal.mobList,zoneId,true).then(result => {
                                    let resultStr = result === 0 ? dbPlayer[pId].name + globalStrings.BM_WIN+globalStrings.EOL : dbPlayer[pId].name + globalStrings.BM_FAIL+globalStrings.EOL;
                                    battleModal.appendLog(resultStr);

                                    if(result === 0){
                                        if(GQuickBattle.getFirstAvaMobIdx(battleModal.mobList)<0){
                                            // 所有怪物都被杀死
                                            // console.log("所有怪物已被击败。");
                                            let sDur = (performance.now() - battleModal.msStart)/1000;
                                            let dps = battleModal.dmgTotal / sDur;
                                            battleModal.appendLog(globalStrings.BM_DEFEAT_ALL+globalStrings.EOL);
                                            battleModal.appendLog("dmg = "+toReadableString(battleModal.dmgTotal)+" , duration = "+(sDur.toFixed(2))+"s, dps = "+(dps.toFixed(1)));
                                            $("#startFightBtn").hide();
                                            $("#startFightAllBtn").hide();
                                        }else{

                                        }
                                    }else{
                                        // player lose
                                        // 2021.11.25 玩家不死亡。
                                        dbPlayer[pId].curHP = dbPlayer[pId].curHP < 1 ? 1 : dbPlayer[pId].curHP;
                                        let sDur = (performance.now() - battleModal.msStart)/1000;
                                        let dps = battleModal.dmgTotal / sDur;
                                        battleModal.appendLog(globalStrings.BM_ALL_FAIL);
                                        battleModal.appendLog("dmg = "+toReadableString(battleModal.dmgTotal)+" , duration = "+(sDur.toFixed(2))+"s, dps = "+(dps.toFixed(1)));
                                        $("#startFightBtn").hide();
                                        $("#startFightAllBtn").hide();
                                    }
                                    gGui.drawHUD();
                                    battleModal.updateLogs(1);
                                    $("#startFightBtn").prop("disabled",false);
                                    $("#startFightAllBtn").prop("disabled",false);
                                    $("#leaveQuickBattleBtn").prop("disabled",false);
                                    $(battleModal.selectorHud).html("");
                                });
                            }else{
                                gGui.drawHUD();
                                let sDur = (performance.now() - battleModal.msStart)/1000;
                                let dps = battleModal.dmgTotal / sDur;
                                battleModal.appendLog(globalStrings.BM_ALL_AGAIN);
                                battleModal.appendLog("dmg = "+toReadableString(battleModal.dmgTotal)+" , duration = "+(sDur.toFixed(2))+"s, dps = "+(dps.toFixed(1)));
                                $("#startFightBtn").hide();
                                $("#startFightAllBtn").hide();
                                $("#startFightBtn").prop("disabled",false);
                                $("#startFightAllBtn").prop("disabled",false);
                                $("#leaveQuickBattleBtn").prop("disabled",false);
                                $(battleModal.selectorHud).html("");
                            }
                        },900);
                    },800);
                },700);
            },600);
        },500);

        battleModal.updateLogs(1);
    }
}

let battleModal = new BattleModal();

/* mob list sample
[
    {   "id":"d9ad1555-a5d6-4f45-932a-0cd2b7b9123c","mobId":71,"name":"归仁兵<李归仁> [ 挥砍 狂刀 ]","title":"李归仁",
        "displayAffix":"挥砍 狂刀","level":70,"atk":210,"def":210,"hpMax":2920,"hp":2920,"reg":59,"fdb":0,"fdh":0,"dge":0,
        "par":10,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":180,
        "gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},
        "regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},
        "faceDirection":1,"isAlive":true,"aggessive":true,
        "inventory":[],"inventoryStr":"",
        "wgList":[
            {"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},
            {"skill_id":8,"affix":"挥砍","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":1500,"range":64,"dmgRate":1.2,"wgType":"machete","wgeType":"arc","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},
            {"skill_id":111,"affix":"狂刀","desc":"正面180度，伤害=dmg * dmg  * level * arg2 * 难度修正系数","type":"active","cdMax":6,"duration":900,"range":180,"dmgRate":0.6,"wgType":"machete","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true}}
        ],
        "ngList":[],
        "explainedSkillIdArray":[8,111],
        "shortName":"归仁兵"
    },

    {"id":"b866f9c7-d9b1-4b4d-84e2-c2e518d094c6","mobId":71,"name":"归仁兵<李归仁> [ 挥砍 狂刀 ]","title":"李归仁","displayAffix":"挥砍 狂刀","level":70,"atk":210,"def":210,"hpMax":2920,"hp":2920,"reg":59,"fdb":0,"fdh":0,"dge":0,"par":10,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":180,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":8,"affix":"挥砍","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":1500,"range":64,"dmgRate":1.2,"wgType":"machete","wgeType":"arc","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":111,"affix":"狂刀","desc":"正面180度，伤害=dmg * dmg  * level * arg2 * 难度修正系数","type":"active","cdMax":6,"duration":900,"range":180,"dmgRate":0.6,"wgType":"machete","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[8,111],"shortName":"归仁兵"},{"id":"b7f1a062-b955-43c0-8891-1dc29f03706f","mobId":72,"name":"归仁近卫<李归仁> [ 挥砍 狂刀 乱战 ]","title":"李归仁","displayAffix":"挥砍 狂刀 乱战","level":74,"atk":222,"def":222,"hpMax":3080,"hp":3080,"reg":62,"fdb":0,"fdh":0,"dge":0,"par":20,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":600,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":8,"affix":"挥砍","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":1500,"range":64,"dmgRate":1.2,"wgType":"machete","wgeType":"arc","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":111,"affix":"狂刀","desc":"正面180度，伤害=dmg * dmg  * level * arg2 * 难度修正系数","type":"active","cdMax":6,"duration":900,"range":180,"dmgRate":0.6,"wgType":"machete","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true}},{"skill_id":117,"affix":"乱战","desc":"近战范围内，六道剑气","type":"active","cdMax":12,"duration":3000,"range":600,"dmgRate":0.8,"wgType":"sword","wgeType":"area","wgeAniLast":400,"wgeRadius":400,"wgeCount":"","cdObj":{"_max":12000,"_cur":12000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[8,111,117],"shortName":"归仁近卫"},{"id":"ea679aff-b991-41ae-84f0-6ca07e6725f0","mobId":72,"name":"归仁近卫<李归仁> [ 挥砍 狂刀 乱战 ]","title":"李归仁","displayAffix":"挥砍 狂刀 乱战","level":74,"atk":222,"def":222,"hpMax":3080,"hp":3080,"reg":62,"fdb":0,"fdh":0,"dge":0,"par":20,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":600,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":8,"affix":"挥砍","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":1500,"range":64,"dmgRate":1.2,"wgType":"machete","wgeType":"arc","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":111,"affix":"狂刀","desc":"正面180度，伤害=dmg * dmg  * level * arg2 * 难度修正系数","type":"active","cdMax":6,"duration":900,"range":180,"dmgRate":0.6,"wgType":"machete","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true}},{"skill_id":117,"affix":"乱战","desc":"近战范围内，六道剑气","type":"active","cdMax":12,"duration":3000,"range":600,"dmgRate":0.8,"wgType":"sword","wgeType":"area","wgeAniLast":400,"wgeRadius":400,"wgeCount":"","cdObj":{"_max":12000,"_cur":12000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[8,111,117],"shortName":"归仁近卫"},{"id":"0d73c0af-6627-4238-b134-c5a56b6e666e","mobId":73,"name":"归仁尉<李归仁> [ 穿刺 冲锋 地火 湮灭 ]","title":"李归仁","displayAffix":"穿刺 冲锋 地火 湮灭","level":76,"atk":228,"def":228,"hpMax":3160,"hp":3160,"reg":64,"fdb":0,"fdh":0,"dge":10,"par":10,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":600,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":7,"affix":"穿刺","desc":"近战攻击，伤害=level * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":900,"range":64,"dmgRate":0.8,"wgType":"sword","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":12,"affix":"冲锋","desc":"冲锋距离，伤害","type":"active","cdMax":12,"duration":12000,"range":200,"dmgRate":2,"wgType":"spear","wgeType":"line","wgeAniLast":600,"wgeRadius":"","wgeCount":"","cdObj":{"_max":12000,"_cur":12000,"_ready":true,"_active":true}},{"skill_id":114,"affix":"地火","desc":"前后各三把火炬散开，碰撞伤害","type":"active","cdMax":9,"duration":2000,"range":600,"dmgRate":1.2,"wgType":"mine","wgeType":"area","wgeAniLast":600,"wgeRadius":300,"wgeCount":"","cdObj":{"_max":9000,"_cur":9000,"_ready":true,"_active":true}},{"skill_id":311,"affix":"湮灭","desc":"超强的单次近战攻击","type":"active","cdMax":36,"duration":1000,"range":60,"dmgRate":4,"wgType":"arc","wgeType":"line","wgeAniLast":600,"wgeRadius":"","wgeCount":"","cdObj":{"_max":36000,"_cur":36000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[7,12,114,311],"shortName":"归仁尉"},{"id":"7373cfd7-5b77-4e8f-a901-150b840f22b5","mobId":73,"name":"归仁尉<李归仁> [ 穿刺 冲锋 地火 湮灭 ]","title":"李归仁","displayAffix":"穿刺 冲锋 地火 湮灭","level":76,"atk":228,"def":228,"hpMax":3160,"hp":3160,"reg":64,"fdb":0,"fdh":0,"dge":10,"par":10,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":600,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":7,"affix":"穿刺","desc":"近战攻击，伤害=level * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":900,"range":64,"dmgRate":0.8,"wgType":"sword","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":12,"affix":"冲锋","desc":"冲锋距离，伤害","type":"active","cdMax":12,"duration":12000,"range":200,"dmgRate":2,"wgType":"spear","wgeType":"line","wgeAniLast":600,"wgeRadius":"","wgeCount":"","cdObj":{"_max":12000,"_cur":12000,"_ready":true,"_active":true}},{"skill_id":114,"affix":"地火","desc":"前后各三把火炬散开，碰撞伤害","type":"active","cdMax":9,"duration":2000,"range":600,"dmgRate":1.2,"wgType":"mine","wgeType":"area","wgeAniLast":600,"wgeRadius":300,"wgeCount":"","cdObj":{"_max":9000,"_cur":9000,"_ready":true,"_active":true}},{"skill_id":311,"affix":"湮灭","desc":"超强的单次近战攻击","type":"active","cdMax":36,"duration":1000,"range":60,"dmgRate":4,"wgType":"arc","wgeType":"line","wgeAniLast":600,"wgeRadius":"","wgeCount":"","cdObj":{"_max":36000,"_cur":36000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[7,12,114,311],"shortName":"归仁尉"},{"id":"d5e7c3c0-ba78-427f-8f1f-948d514b879a","mobId":74,"name":"归仁骑<李归仁> [ 穿刺 冲锋 地火 ]","title":"李归仁","displayAffix":"穿刺 冲锋 地火","level":72,"atk":216,"def":216,"hpMax":3000,"hp":3000,"reg":60,"fdb":0,"fdh":0,"dge":5,"par":10,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":600,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":7,"affix":"穿刺","desc":"近战攻击，伤害=level * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":900,"range":64,"dmgRate":0.8,"wgType":"sword","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":12,"affix":"冲锋","desc":"冲锋距离，伤害","type":"active","cdMax":12,"duration":12000,"range":200,"dmgRate":2,"wgType":"spear","wgeType":"line","wgeAniLast":600,"wgeRadius":"","wgeCount":"","cdObj":{"_max":12000,"_cur":12000,"_ready":true,"_active":true}},{"skill_id":114,"affix":"地火","desc":"前后各三把火炬散开，碰撞伤害","type":"active","cdMax":9,"duration":2000,"range":600,"dmgRate":1.2,"wgType":"mine","wgeType":"area","wgeAniLast":600,"wgeRadius":300,"wgeCount":"","cdObj":{"_max":9000,"_cur":9000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[7,12,114],"shortName":"归仁骑"},{"id":"bc8c746f-b32b-43e9-88dc-fb5895674d46","mobId":74,"name":"归仁骑<李归仁> [ 穿刺 冲锋 地火 ]","title":"李归仁","displayAffix":"穿刺 冲锋 地火","level":72,"atk":216,"def":216,"hpMax":3000,"hp":3000,"reg":60,"fdb":0,"fdh":0,"dge":5,"par":10,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":600,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":7,"affix":"穿刺","desc":"近战攻击，伤害=level * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":900,"range":64,"dmgRate":0.8,"wgType":"sword","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":12,"affix":"冲锋","desc":"冲锋距离，伤害","type":"active","cdMax":12,"duration":12000,"range":200,"dmgRate":2,"wgType":"spear","wgeType":"line","wgeAniLast":600,"wgeRadius":"","wgeCount":"","cdObj":{"_max":12000,"_cur":12000,"_ready":true,"_active":true}},{"skill_id":114,"affix":"地火","desc":"前后各三把火炬散开，碰撞伤害","type":"active","cdMax":9,"duration":2000,"range":600,"dmgRate":1.2,"wgType":"mine","wgeType":"area","wgeAniLast":600,"wgeRadius":300,"wgeCount":"","cdObj":{"_max":9000,"_cur":9000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[7,12,114],"shortName":"归仁骑"},{"id":"d9c3235b-fe6e-43be-834a-1fae41398287","mobId":75,"name":"归仁将<李归仁> [ 挥砍 天雷 千军 ]","title":"李归仁","displayAffix":"挥砍 天雷 千军","level":80,"atk":240,"def":240,"hpMax":3320,"hp":3320,"reg":67,"fdb":0,"fdh":0,"dge":10,"par":20,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":600,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":8,"affix":"挥砍","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":1500,"range":64,"dmgRate":1.2,"wgType":"machete","wgeType":"arc","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":115,"affix":"天雷","desc":"追击玩家击落闪电，6秒内 6 次，每次伤害","type":"active","cdMax":24,"duration":6000,"range":600,"dmgRate":2,"wgType":"thunder","wgeType":"lightning","wgeAniLast":200,"wgeRadius":240,"wgeCount":6,"cdObj":{"_max":24000,"_cur":24000,"_ready":true,"_active":true}},{"skill_id":315,"affix":"千军","desc":"三个闪光，追击玩家","type":"active","cdMax":36,"duration":12000,"range":600,"dmgRate":1.5,"wgType":"spark","wgeType":"chase","wgeAniLast":9000,"wgeRadius":"","wgeCount":3,"cdObj":{"_max":36000,"_cur":36000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[8,115,315],"shortName":"归仁将"},{"id":"5ae36fd4-8613-43fb-914a-f1ffe407b6e3","mobId":75,"name":"归仁将<李归仁> [ 挥砍 天雷 千军 ]","title":"李归仁","displayAffix":"挥砍 天雷 千军","level":80,"atk":240,"def":240,"hpMax":3320,"hp":3320,"reg":67,"fdb":0,"fdh":0,"dge":10,"par":20,"spasticity":true,"spastDuration":300,"moveSpeed":160,"fRangeMin":40,"fRangeMax":600,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[],"inventoryStr":"","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":8,"affix":"挥砍","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":1500,"range":64,"dmgRate":1.2,"wgType":"machete","wgeType":"arc","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":115,"affix":"天雷","desc":"追击玩家击落闪电，6秒内 6 次，每次伤害","type":"active","cdMax":24,"duration":6000,"range":600,"dmgRate":2,"wgType":"thunder","wgeType":"lightning","wgeAniLast":200,"wgeRadius":240,"wgeCount":6,"cdObj":{"_max":24000,"_cur":24000,"_ready":true,"_active":true}},{"skill_id":315,"affix":"千军","desc":"三个闪光，追击玩家","type":"active","cdMax":36,"duration":12000,"range":600,"dmgRate":1.5,"wgType":"spark","wgeType":"chase","wgeAniLast":9000,"wgeRadius":"","wgeCount":3,"cdObj":{"_max":36000,"_cur":36000,"_ready":true,"_active":true}}],"ngList":[],"explainedSkillIdArray":[8,115,315],"shortName":"归仁将"},{"id":"1d427934-b3a1-48db-9aad-14b8b1e1e46a","mobId":123,"name":"李归仁<刀仙> [ 挥砍 狂刀 真龙 寒潮 吸血 魔王 ]","title":"刀仙","displayAffix":"挥砍 狂刀 真龙 寒潮 吸血 魔王","level":103,"atk":1800,"def":309,"hpMax":34000,"hp":34000,"reg":340,"fdb":0,"fdh":0.1,"dge":20,"par":45,"spasticity":false,"spastDuration":0,"moveSpeed":160,"fRangeMin":40,"fRangeMax":900,"gcdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true},"regCDObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true},"faceDirection":1,"isAlive":true,"aggessive":true,"inventory":[{"itemId":116,"itemName":"无暇的阴柔精华","itemLevel":4,"itemDesc":"精华8","itemCate":"杂物","kfId":0,"itemPrice":"656,100","itemSellable":1,"itemDropable":1,"itemSource":"副本","unique":0,"stack":50,"fist":0,"sword":0,"machete":0,"spear":0,"ejection":0,"heal":0,"enchant":0,"swift":0,"hit":0,"atk":0,"def":0,"crt":0,"crm":0,"hst":0,"dge":0,"par":0,"fdb":0,"fdh":0,"ris":0,"luk":0,"reg":0,"rem":0},{"itemId":127,"itemName":"无暇的调和精华","itemLevel":4,"itemDesc":"精华8","itemCate":"杂物","kfId":0,"itemPrice":"656,100","itemSellable":1,"itemDropable":1,"itemSource":"副本","unique":0,"stack":50,"fist":0,"sword":0,"machete":0,"spear":0,"ejection":0,"heal":0,"enchant":0,"swift":0,"hit":0,"atk":0,"def":0,"crt":0,"crm":0,"hst":0,"dge":0,"par":0,"fdb":0,"fdh":0,"ris":0,"luk":0,"reg":0,"rem":0},{"itemId":127,"itemName":"无暇的调和精华","itemLevel":4,"itemDesc":"精华8","itemCate":"杂物","kfId":0,"itemPrice":"656,100","itemSellable":1,"itemDropable":1,"itemSource":"副本","unique":0,"stack":50,"fist":0,"sword":0,"machete":0,"spear":0,"ejection":0,"heal":0,"enchant":0,"swift":0,"hit":0,"atk":0,"def":0,"crt":0,"crm":0,"hst":0,"dge":0,"par":0,"fdb":0,"fdh":0,"ris":0,"luk":0,"reg":0,"rem":0},{"itemId":138,"itemName":"无暇的阳刚精华","itemLevel":4,"itemDesc":"精华8","itemCate":"杂物","kfId":0,"itemPrice":"656,100","itemSellable":1,"itemDropable":1,"itemSource":"副本","unique":0,"stack":50,"fist":0,"sword":0,"machete":0,"spear":0,"ejection":0,"heal":0,"enchant":0,"swift":0,"hit":0,"atk":0,"def":0,"crt":0,"crm":0,"hst":0,"dge":0,"par":0,"fdb":0,"fdh":0,"ris":0,"luk":0,"reg":0,"rem":0},{"itemId":180,"itemName":"含光","itemLevel":6,"itemDesc":"帝王","itemCate":"剑","kfId":0,"itemPrice":"10,240","itemSellable":1,"itemDropable":1,"itemSource":"副本","unique":1,"stack":1,"fist":0,"sword":5,"machete":0,"spear":0,"ejection":0,"heal":0,"enchant":0,"swift":0,"hit":0.01,"atk":170,"def":0,"crt":0,"crm":0,"hst":0,"dge":0,"par":0.01,"fdb":0.01,"fdh":0,"ris":0,"luk":0,"reg":0,"rem":0}],"inventoryStr":"无暇的阴柔精华,无暇的调和精华,无暇的调和精华,无暇的阳刚精华,含光","wgList":[{"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg","type":"active","cdMax":1.5,"duration":400,"range":64,"dmgRate":1,"wgType":"fist","wgeType":"point","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":1500,"_cur":1500,"_ready":true,"_active":true}},{"skill_id":8,"affix":"挥砍","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":2,"duration":1500,"range":64,"dmgRate":1.2,"wgType":"machete","wgeType":"arc","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":2000,"_cur":2000,"_ready":true,"_active":true}},{"skill_id":111,"affix":"狂刀","desc":"正面180度，伤害=dmg * dmg  * level * arg2 * 难度修正系数","type":"active","cdMax":6,"duration":900,"range":180,"dmgRate":0.6,"wgType":"machete","wgeType":"line","wgeAniLast":300,"wgeRadius":"","wgeCount":"","cdObj":{"_max":6000,"_cur":6000,"_ready":true,"_active":true}},{"skill_id":316,"affix":"真龙","desc":"召唤满屏彗星攻击，随机轰击","type":"active","cdMax":36,"duration":6000,"range":900,"dmgRate":1.8,"wgType":"meteor","wgeType":"explode","wgeAniLast":600,"wgeRadius":500,"wgeCount":"","cdObj":{"_max":36000,"_cur":36000,"_ready":true,"_active":true}}],"ngList":[819],"explainedSkillIdArray":[8,111,316,819,814,914],"tintBullet":13068921,"shortName":"李归仁"}
]
 */