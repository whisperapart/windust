/**
 * Created by jim on 2020/3/25.
 * Implemented by jim on 2021/10/25.
 * taskModal - 展示具体task的 弹窗
 * journalModal - 包括玩家所有task 的 任务日志 弹窗 (J)
 * taskModel - 包括task 相关数据操作的 模型 - task对象 的操作和 taskList的操作 - 对应实体类
 * taskManagerModel - 封装所有task List 相关的操作，暂时放在 taskModel中，不启用taskManager
 */

class TaskModal {
    // 类变量定义
    static strSelector = '#taskModal';
    static strSelectorBtnAbort= '#tmBtnAbort';
    static strSelectorBtnAccept = '#tmBtnAccept';
    static strSelectorTxtDetail = '#tmTaskDetail';
    static strSelectorTxtComplete = '#tmBtnComplete';

    // static functions
    static drawModal(intTaskID){
        $(".modal").modal('hide');
        $(".kf-pop-over").popover('hide').popover('dispose');
        $(TaskModal.strSelectorTxtComplete).hide();
        $(TaskModal.strSelectorBtnAccept).hide();
        $(TaskModal.strSelectorBtnAbort).hide();
        TaskModal.updateModelContent(intTaskID);
        let ts = TaskModel.taskStatus(intTaskID);
        switch(ts){
            case 1: $(TaskModal.strSelectorBtnAbort).show(); break; // 1：已接任务，条件未达成 = 显示放弃任务
            case 2: $(TaskModal.strSelectorTxtComplete).show(); break; // 2: 已接任务，条件已达成 = 显示完成任务 ... todo 需要判断接收人？
            case 0: $(TaskModal.strSelectorBtnAccept).show(); break;  // 0未接任务 = 显示接任务
            case -1: break; // -1=没有达到条件，无法接任务 = 不应该显示
            case -2: break; // -2=（非可重复任务）已完成 = 已完成，不应该显示
            default: break; // 0未接任务 1：已接任务，条件未达成 2: 已接任务，条件已达成 -2=（非可重复任务）已完成 -1=没有达到条件，无法接任务
        }

        $(TaskModal.strSelector).data('taskId',intTaskID).modal('show');
    }
    static updateModelContent(intTaskID){
        JournalModal.removePopupClick();
        // always show top as log-viewer
        let task = gDB.getTaskById(intTaskID);
        let logText = TaskModel.toString(task);
        $(TaskModal.strSelectorTxtDetail).html(logText);
        // $("#quickCombatLog").html(logText).scrollTop(function() { return 0; });
        JournalModal.bindPopupClick();
    }

    // 静态函数 - 通常不需要修改
    /**
     * 判断当前 弹窗 是否已经显示
     * @returns {boolean} true=已经显示 false=没有显示
     */
    static isShow(){
        return ($(TaskModal.strSelector).css('display') === 'block');
    }

    /**
     * 隐藏当前弹窗
     */
    static hideModal(){
        $(TaskModal.strSelector).modal('hide');
    }

    /**
     * 为指定的dom元素，添加抖动效果，1秒后自动取消
     * @param ele dom元素，使用 jQuery(ele)
     */
    static animateShakeThis(ele){
        gGui.playSoundEffect("fail");
        $(ele).addClass("animated headShake");
        setTimeout(function () { $(ele).removeClass("animated headShake"); },1000);
    }

    /**
     * 非模板类函数
     */

    /**
     * 接受任务
     * @params taskId int 任务编号
     */
    static acceptTask(){
        // 调用 TaskModel
        // 查找task
        // 检查是否已经完成了此任务
        // 判断能否完成（重复任务？否则已经完成的无法完成）
        // 标记任务状态
        gGui.playSoundEffect();
        let intTaskId = parseInt($(TaskModal.strSelector).data('taskId'));
        TaskModel.acceptTask(intTaskId);
        TaskModal.hideModal();
        let taskObj = gDB.getTaskById(intTaskId);
        let npcId = $("#actionDiv").data('npcId');
        let bId = $("#actionDiv").data('bId');
        let cId = $("#actionDiv").data('cId');
        gGui.drawNPCActions(npcId,bId,cId);
        $("#npcHail").html(globalStrings.QUEST_ACCEPT+" ["+taskObj.name+"]"+globalStrings.EOL);
        let miniMap = MiniMapManager.getInstance();
        miniMap.updateCityHalo();
    }

    static completeTask(){
        // todo - 检查代码
        // 检查任务完成情况
        // 移除击杀watch清单
        // 移除任务物品
        // 标记任务完成
        // 发放任务奖励
        gGui.playSoundEffect("succ");
        let intTaskId = parseInt($(TaskModal.strSelector).data('taskId'));
        let completeRet = TaskModel.completeTask(intTaskId);
        if(completeRet === -9){
            // 没有足够的行囊空间
            $("#npcHail").html(globalStrings.NOT_ENOUGH_ROOM + globalStrings.EOL);
        }
        // 刷新任务页面 -  日志页面
        TaskModal.hideModal();
        // 更新npc hail
        // 刷新building 页面，因为npc的左侧菜单改了
        let taskObj = gDB.getTaskById(intTaskId);
        let npcId = $("#actionDiv").data('npcId');
        let bId = $("#actionDiv").data('bId');
        let cId = $("#actionDiv").data('cId');
        gGui.drawNPCActions(npcId,bId,cId);
        // $("#npcHail").html("任务["+taskObj.name+"]完成，获得奖励："+TaskModel._rewardToString(taskObj.reward,taskObj.level)+"。");
        $("#npcHail").html(globalStrings.CTRL_QUEST+" [ "+taskObj.name+" ] "+globalStrings.COMPLETED+globalStrings.EOL);
        // 一般在城市，所以需要刷新 cityInfoPanel 里面的货币等信息
        gGui.cityUpdateInfoPanel(cId);
        let miniMap = MiniMapManager.getInstance();
        miniMap.updateCityHalo();
    }

    static abortTask(){
        let intTaskId = parseInt($(TaskModal.strSelector).data('taskId'));
        if(intTaskId < 0) return;
        gGui.playSoundEffect("fail");
        TaskModel.abortTask(intTaskId);
        let npcId = $("#actionDiv").data('npcId');
        let bId = $("#actionDiv").data('bId');
        let cId = $("#actionDiv").data('cId');
        gGui.drawNPCActions(npcId,bId,cId);
        TaskModal.hideModal();
        $("#npcHail").html(globalStrings.QUEST_GIVE_UP);
        let miniMap = MiniMapManager.getInstance();
        miniMap.updateCityHalo();
    }


    // instance functions

    // 构造函数 - new 对象的时候调用
    constructor() {
        $(TaskModal.strSelectorBtnAccept).on('click',TaskModal.acceptTask);
        $(TaskModal.strSelectorTxtComplete).on('click',TaskModal.completeTask);
        $(TaskModal.strSelectorBtnAbort).on('click',TaskModal.abortTask);
    }


}

let taskModal = new TaskModal();