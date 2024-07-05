/**
 * Create by jim on 2021/10/26.
 * journalModal - 包括玩家所有task 的 任务日志 弹窗 (J)
 * taskModel - 包括task 相关数据操作的 模型 - task对象 的操作和 taskList的操作 - 对应实体类
 * taskManagerModel - 封装所有task List 相关的操作，暂时放在 taskModel中，不启用taskManager
 */

class JournalModal {
    // 类变量定义
    static strSelector = '#journalModal';
    static strSelectorBtnAbort = '#jmBtnAbort';
    static strSelectorTaskList = '#jmListTask';
    static strSelectorTaskListItem = '#jmListTask a';
    static strSelectorTaskDesc = '#jmTxtTaskDesc';

    // static functions
    static drawModal(){
        $(".modal").modal('hide');
        $(".kf-pop-over").popover('hide').popover('dispose');
        JournalModal.updateModelContent();
        $(JournalModal.strSelector).modal('show');
    }
    static updateModelContent(){
        // <li className="nav-item d-flex justify-content-between align-items-center"><a className="nav-link">[1]任务名称</a><span className="badge bg-primary rounded-pill">!</span></li>
        let taskArr = gDB.getActiveTasks();
        let str = '';
        for(let i=0;i<taskArr.length;i++){
            str += '<a onclick="JournalModal.onClickTaskIdx('+i+')" class="list-group-item list-group-item-action">' +
                '['+taskArr[i].level + '] ' + taskArr[i].name +
                TaskModel.getTaskStatusStringByTaskId(taskArr[i].id) +
                '</a>';
        }
        $(JournalModal.strSelectorTaskList).html(str);
        $(JournalModal.strSelectorTaskDesc).html('');
        JournalModal.removePopupClick();
        $("#jmBtnAbort").prop('disabled',true).data('taskIdx',-1);
    }

    // 静态函数 - 通常不需要修改
    /**
     * 判断当前 弹窗 是否已经显示
     * @returns {boolean} true=已经显示 false=没有显示
     */
    static isShow(){
        return $(JournalModal.strSelector).css('display') === 'block';
    }

    /**
     * 隐藏当前弹窗
     */
    static hideModal(){
        $(JournalModal.strSelector).modal('hide');
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
    static abortTask(){
        // 调用 TaskModel
        // 查找task
        // 检查是否已经完成了此任务
        // 判断能否完成（重复任务？否则已经完成的无法完成）
        // 标记任务状态
        let taskIdx = $(JournalModal.strSelectorBtnAbort).data('taskIdx');
        let intTaskIdx = parseInt(taskIdx);
        if(intTaskIdx < 0) return;
        let intTaskId = parseInt(dbPlayer[pId].taskActive[intTaskIdx]);
        if(intTaskId <=0) return;
        gGui.playSoundEffect("fail");
        TaskModel.abortTask(intTaskId);
        JournalModal.updateModelContent();
    }
    // 第几个任务编号被点击
    static onClickTaskIdx(idx){
        gGui.playSoundEffect();
        JournalModal.removePopupClick();
        let intIdx = parseInt(idx);
        let taskArr = gDB.getActiveTasks();
        $(JournalModal.strSelectorTaskListItem).removeClass('active ');
        $(JournalModal.strSelectorTaskListItem).eq(intIdx).addClass('active ');  // li-current
        $(JournalModal.strSelectorBtnAbort).prop('disabled',false).data('taskIdx',intIdx);
        $(JournalModal.strSelectorTaskDesc).html(TaskModel.toString(taskArr[intIdx]));
        JournalModal.bindPopupClick();
    }

    static bindPopupClick(){
        $(".kf-pop-over").click(function(e) {
            $(".kf-pop-over").popover('hide').popover('dispose');
            $(this).popover('toggle');
            $('.popover').click(function(e) {
                return false;
            });
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }
    static removePopupClick(){
        $(".kf-pop-over").popover('hide').popover('dispose');
    }

    // instance functions

    // 构造函数 - new 对象的时候调用
    constructor() {
        $(JournalModal.strSelectorBtnAbort).on('click',JournalModal.abortTask);
        // $(document).click(JournalModal.removePopupClick);
        $("#journalModal").on('click',JournalModal.removePopupClick);
    }


}

let journalModal = new JournalModal();