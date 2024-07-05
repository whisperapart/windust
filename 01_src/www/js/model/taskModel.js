/**
 * Created by jim on 2020/6/1.
 */

// 20230609 - 加入通关判断
const TASK_ID_GAME_WIN_1 = 128; // taskId = 128 扭转乾坤 踌躇满志任务线
const TASK_ID_GAME_WIN_2 = 450; // taskId = 450 风尘三侠 江湖任务
//         taskFlag : [3,4,5], // taskId - completed
//         taskActive: [1,2],  // taskId - accepted
class TaskModel{
    constructor(){

    }

    // shared functions


    /**
     * 获取当前城市对应npc所有可用任务，过滤已经完成的任务，系列任务显示当前可用阶段的任务
     * @param cityId int 城市编号
     * @param npcId int npc编号
     * @returns {*[]}
     */
    static getTasks(cityId,npcId){
        let taskArr = gDB.getTasksByNPC(cityId,npcId);
        let tasks = [];
        // 已经完成的任务 - 不显示
        // 没完成的任务 - 已经接进行中 / 没有接
        // bug-fixing -  如果任务已经接了，sender 列表不应该显示
        // 2022.11.02 - 如果任务不是这个玩家的任务，不现实

        for(let i=0;i<taskArr.length;i++){
            // 放弃 - bug-fixing-v2: 也许，已经接了的任务，sender 列表也显示。 那么为了解决同一个人发任务给自己的情况，要去重。
            // 放弃 - 另外， sender那边要做判断，变为放弃按钮。
            if(dbPlayer[pId].taskActive.indexOf(parseInt(taskArr[i].id)) >=0){
                // 这个任务已经接了
                continue;
            }
            if(!TaskModel.isTaskDesignedForUser(parseInt(taskArr[i].id),pId)){
                // 这任务跟当前玩家无关
                continue;
            }
            if(jQuery.inArray(parseInt(taskArr[i].id),dbPlayer[pId].taskFlag)<0){
                // 没有完成
                let preId = parseInt(taskArr[i].preQuest);
                if(preId === 0 || isNaN(preId)){    // isNaN 一般是任务编辑出错了。
                    tasks.push(taskArr[i]);
                }else{
                    // check if preQest done
                    let preQId = parseInt(gDB.getTaskById(taskArr[i].preQuest).id);
                    if(jQuery.inArray(preQId,dbPlayer[pId].taskFlag)>=0){
                        tasks.push(taskArr[i]);
                    }
                }
            }
        }

        // bug-fixing -  如果这个任务是 npc 结束的，列表也要显示
        let endTaskArr = gDB.getTasksEndByNPC(cityId,npcId);
        for(let i=0;i<endTaskArr.length;i++){
            if(dbPlayer[pId].taskActive.indexOf(parseInt(endTaskArr[i].id)) >= 0){
                if(tasks.some(item=>item.id===parseInt(endTaskArr[i].id))){

                }else{
                    tasks.push(endTaskArr[i]);
                }

            }
        }

        return tasks;
    }

    /**
     * 检查当前 building 上是否有 任务标记：0=可接未接，1=接了没完成，2=接了完成但是没有提交。
     * @param intCityId
     * @param intBuildingId
     * @returns {number} 0=可接未接，1=接了没完成，2=接了完成但是没有提交 3=复杂情况，详见 2022.11.03
     */
    static checkTasksForBuilding(intCityId,intBuildingId){
        let myMax = -1;
        // 获取building 对应的npc
        let npcIdArr = gDB.getNpcIdListForBuilding(intCityId,intBuildingId);
        for(let i=0;i<npcIdArr.length;i++){
            let result = TaskModel.checkTasksForNpc(intCityId,npcIdArr[i]);
            myMax = Math.max(result,myMax);
        }
        return myMax;
    }

    /**
     * 检查当前 building 上是否有 任务标记：0=可接未接，1=接了没完成，2=接了完成但是没有提交。区分send 和 end
     * @param intCityId
     * @param intBuildingId
     * @returns {number} 0=可接未接，1=接了没完成，2=接了完成但是没有提交 3=复杂情况，详见 2022.11.03
     */
    static checkTasksAllForBuilding(intCityId,intBuildingId){
        // 获取building 对应的npc
        let ret = {"sendFlag":0,"endFlag":0};
        let npcIdArr = gDB.getNpcIdListForBuilding(intCityId,intBuildingId);
        for(let i=0;i<npcIdArr.length;i++) {
            let result = TaskModel.checkTasksAllForNpc(intCityId, npcIdArr[i]);
            ret.sendFlag = Math.max(result.sendFlag, ret.sendFlag);
            ret.endFlag = Math.max(result.endFlag, ret.endFlag);
        }
        return ret;
    }


    /**
     * 检查当前 city building npc 有没有玩家可以接的任务，或者正在执行中的任务
     * @param intCityId
     * @param intNpcId
     * @returns {number} 0=可接未接，1=接了没完成，2=接了完成但是没有提交
     */
    static checkTasksForNpc(intCityId,intNpcId){
        let taskArr = gDB.getTasksByNPC(intCityId,intNpcId);    // sender , 另外，要区分 sender 接了之后没有完成
        let myMax = -1;

        for(let i=0;i<taskArr.length;i++){
            // 检查完成条件并返回 : 0未接任务 1：已接任务，条件未达成 2: 已接任务，条件已达成 [3（非可重复任务）已完成 暂不考虑] -1=不能接
            let st = TaskModel.taskStatus(taskArr[i].id);
            // bug-fixing: 如果 是 sender 并且已经接了，不应该有标记
            st = (st !== 0) ? -1 : 0;
            myMax = Math.max(st, myMax);
        }
        // bug-fixing - 要检查 ender
        let endArr = gDB.getTasksEndByNPC(intCityId,intNpcId);
        for(let i=0;i<endArr.length;i++){
            let st = TaskModel.taskStatus(endArr[i].id);
            st = (st <= 0)? -1 : st;    // 没有接任务，不显示
            myMax = Math.max(st,myMax);
        }
        return myMax;
    }

    /**
     * 检查当前 city building npc 可能给玩家任务的所有状态，上一个方法只返回最大的一个状态
     * @param intCityId
     * @param intNpcId
     * @returns [{number}] 0=可接未接，1=接了没完成，2=接了完成但是没有提交
     * todo: 调用这个函数，而不是上面那个。修改展示逻辑。
     */
    static checkTasksAllForNpc(intCityId,intNpcId){
        let taskArr = gDB.getTasksByNPC(intCityId,intNpcId);    // sender , 另外，要区分 sender 接了之后没有完成
        let sendFlag = 0;let endFlag = 0;

        for(let i=0;i<taskArr.length;i++){
            // 检查完成条件并返回 : 0未接任务 1：已接任务，条件未达成 2: 已接任务，条件已达成 [3（非可重复任务）已完成 暂不考虑] -1=不能接
            let st = TaskModel.taskStatus(taskArr[i].id);
            // bug-fixing: 如果 是 sender 并且已经接了，不应该有标记
            if(st ===0){
                sendFlag = 1; // 发送任务的人，任务没接
                break;
            }
        }
        // bug-fixing - 要检查 ender
        let endArr = gDB.getTasksEndByNPC(intCityId,intNpcId);
        for(let i=0;i<endArr.length;i++){
            let st = TaskModel.taskStatus(endArr[i].id);
            if(st===2){             // 优先展示已经完成的
                endFlag = 2;
                break;
            }else if(st===1){
                endFlag = 1;
                // break;
            }
        }
        return {"sendFlag":sendFlag,"endFlag":endFlag};
    }


    /**
     * 接受特定任务
     * @param tid int 任务编号
     */
    static acceptTask(tid){
        // 插入 taskActive
        // 插入 killList - 添加击杀监控，在CharacterModel 中调用 updateKillCount
        let intTaskId = parseInt(tid);
        if(jQuery.inArray(tid,dbPlayer[pId].taskActive)>=0){return;}
        dbPlayer[pId].taskActive.push(intTaskId); // 任务标记
        CharacterModel.addKillForTask(intTaskId); // 击杀监控
        CharacterModel.addPoemForTask(intTaskId); // 诗词监控
    }

    /**
     * 判断任务状态的核心逻辑, 不处理嵌套的 code=6 的情况
     * @param intTaskId 任务编号
     * @param intReceiverCityId 任务完成城市
     * @param intCon0 = isNaN(parseInt(taskObj.condition[0])) ? 0 : parseInt(taskObj.condition[0])
     * @param intCon1 = isNaN(parseInt(taskObj.condition[1])) ? 0 : parseInt(taskObj.condition[1])
     * @param intCon2 = isNaN(parseInt(taskObj.condition[2])) ? 0 : parseInt(taskObj.condition[2])
     * @return boolean true=已完成 false=未完成
     * @private
     */
    static _taskStatusCheckEngine(intTaskId,intReceiverCityId,intCon0,intCon1,intCon2){
        switch(intCon0){
            case 0:  return true;  // 无条件，接受了就自动完成
            case 1: // 提交物品{code} x {number}
                let amt = CharacterModel.countItemNotEquipped(intCon1);
                return (amt >= intCon2);
            case 2: // 打败{code} x {number}
                let mobKill = CharacterModel.getKillCountForTask(intTaskId,intCon1);
                let mobMax = CharacterModel.getKillRequiredForTask(intTaskId,intCon1);
                if(mobMax <=0) return false;   // 数据异常
                return (mobKill >= mobMax);
            case 3: // 提交金钱 x {number}
                return (dbPlayer[pId].money >= intCon2);
            case 4: // 完成诗词魔方 {code} x {number}
                return CharacterModel.isPoemDone(intCon1, intCon2);
            case 5: // 提交货物{code} x {number}
                // 如果船不在当前任务港口 - 肯定不完成
                if(intReceiverCityId !== parseInt(dbPlayer[pId].shipPortId)){ return false; }
                let cargoCnt = CharacterModel.getCargoAmount(intCon1);
                return (cargoCnt >= intCon2);
            case 6: // 多种条件[[],[],[]]
                return false;  // error: should never be here ... unless the calling code logic error.
            case 7: // 等级要求
                return (dbPlayer[pId].level>=intCon1 && dbPlayer[pId].paraLevel>=intCon2);
            default:
                return false;
        }
    }


    /**
     *检查完成条件并返回 : 0未接任务 1：已接任务，条件未达成 2: 已接任务，条件已达成 -2=（非可重复任务）已完成 -1=没有达到条件，无法接任务 -9=无行囊空间
     */
    static taskStatus(taskId){
        let intTaskId = parseInt(taskId);
        if(dbPlayer[pId].taskFlag.indexOf(intTaskId) >=0 ) return -2; // 已完成 =-2
        if(dbPlayer[pId].taskActive.indexOf(intTaskId) >=0){    // 已经接了任务
            // 已经达成完成条件 = 2
            // 没有达成完成条件 = 1
            let tObj = gDB.getTaskById(taskId);
            let c0 = isNaN(parseInt(tObj.condition[0])) ? -1 : parseInt(tObj.condition[0]);
            let c1 = isNaN(parseInt(tObj.condition[1])) ? 0 : parseInt(tObj.condition[1]);
            let c2 = isNaN(parseInt(tObj.condition[2])) ? 0 : parseInt(tObj.condition[2]);
            switch(c0){
                case 0:  return 2;  // 无条件，接受了就自动完成
                case 1: // 提交物品{code} x {number}
                    return this._taskStatusCheckEngine(intTaskId,tObj.receiverCityId,1,c1,c2) ? 2 : 1;
                case 2: // 打败{code} x {number}
                    let mobMax = CharacterModel.getKillRequiredForTask(taskId,parseInt(tObj.condition[1]));
                    if(mobMax <=0) return -1;   // 数据异常
                    return this._taskStatusCheckEngine(intTaskId,tObj.receiverCityId,2,c1,c2) ? 2 : 1;
                case 3: // 提交金钱 x {number}
                    return this._taskStatusCheckEngine(intTaskId,tObj.receiverCityId,3,c1,c2) ? 2 : 1;
                case 4: // 完成诗词魔方 {code} x {number}
                    return this._taskStatusCheckEngine(intTaskId,tObj.receiverCityId,4,c1,c2) ? 2 : 1;
                case 5: // 提交货物{code} x {number}
                    // 如果船不在当前任务港口 - 肯定不完成
                    if(parseInt(tObj.receiverCityId) !== parseInt(dbPlayer[pId].shipPortId)){ return 1; }
                    return this._taskStatusCheckEngine(intTaskId,tObj.receiverCityId,5,c1,c2) ? 2 : 1;
                case 6: // 多种条件 [6,[[3,1000,0],[2,1,10]],0]
                    let moreCondition = tObj.condition[1]; // [[3,1000,0],[2,1,10]]
                    // let defaultResult = true;
                    for(let i = 0; i< moreCondition.length; i ++){
                        let ic0 = isNaN(moreCondition[i][0]) ? -1 : parseInt(moreCondition[i][0]);
                        if(ic0 ===  6) return -1;   // error: 不支持循环嵌套
                        let ic1 = isNaN(moreCondition[i][1]) ? 0 : parseInt(moreCondition[i][1]);
                        let ic2 = isNaN(moreCondition[i][2]) ? 0 : parseInt(moreCondition[i][2]);
                        let result = this._taskStatusCheckEngine(intTaskId,tObj.receiverCityId,ic0,ic1,ic2);
                        // console.log(ic0 + ","+ ic1 + "," + ic2 + " => "+ result);
                        if(!result) return 1;   // 只要有一个条件没有达成，就是未完成，不需要再计算。
                    }
                    return 2;
                case 7: // 等级要求
                    return this._taskStatusCheckEngine(intTaskId,tObj.receiverCityId,7,c1,c2) ? 2 : 1;
                default:
                    break;
            }
            return 1;
        }else{      // 没有接任务
            // 条件没有达到 = -1
            // if(TaskModel.isPreQuestDone(intTaskId)){ // 条件达到了没有接 = 0
            //     if(TaskModel.isTaskDesignedForUser(intTaskId,pId)){
            //         return 0;
            //     }else{
            //         return -1;
            //     }
            // }else{
            //     return -1;
            // }
            return (TaskModel.isPreQuestDone(intTaskId) && TaskModel.isTaskDesignedForUser(intTaskId,pId)) ? 0 : -1;
            // if(TaskModel.isPreQuestDone(intTaskId) && TaskModel.isTaskDesignedForUser(intTaskId,pId)){
            //     return 0;
            // }else{
            //     return -1;
            // }

        }
    }

    /**
     * 是否已经完成前置任务
     * @param intTaskId
     * @returns {boolean}
     */
    static isPreQuestDone(intTaskId){
        let tObj = gDB.getTaskById(intTaskId);
        if(tObj.preQuest === 0) return true;
        return dbPlayer[pId].taskFlag.indexOf(tObj.preQuest) >= 0;
    }

    /**
     * 是否玩家的专属任务
     * @param intTaskId - 任务编号
     * @param intUserIdx - 用户索引 = pId
     * @returns {boolean} - 是：例如王二的专属任务， 否：不是王二的专属任务 - 王大的专属任务 或者所有人都能接的任务
     */
    static isTaskReservedForUser(intTaskId,intUserIdx){
        let tObj = gDB.getTaskById(intTaskId);
        if(tObj.reserved == null){  // 不是专属任务
            return false;
        }else{
            return parseInt(tObj.reserved) === intUserIdx + 1;
        }
    }

    /**
     * 这个任务设计出来能否被这个角色接。例如，王二不能接王大专属任务，但是公共任务都可以接
     * @param intTaskId - 任务编号
     * @param intUserIdx - 用户索引 = pId
     * @returns {boolean} - 是：可以接=王二专属或者公共任务，否：不是公共任务，或者是王大的专属任务
     */
    static isTaskDesignedForUser(intTaskId,intUserIdx){
        let tObj = gDB.getTaskById(intTaskId);
        if(tObj.reserved == null || tObj.reserved===0){  // 不是专属任务
            return true;    // 玩家可以接
        }else{
            return parseInt(tObj.reserved) === intUserIdx + 1;
        }
    }

    /**
     * 返回 字体图标 字符串，用于表示任务状态
     * @param intTaskId - 任务编号
     * @returns {string}
     */
    static getTaskStatusStringByTaskId(intTaskId){
        let iconFlag = TaskModel.taskStatus(intTaskId);
        return TaskModel.getTaskStatusStringByFlag(iconFlag);
    }
    /**
     * 返回 字体图标 字符串，用于表示任务状态
     * @param intFlag - 任务状态
     * @returns {string}
     */
    static getTaskStatusStringByFlag(intFlag){
        // 0未接任务 1：已接任务，条件未达成 2: 已接任务，条件已达成 -2（非可重复任务）已完成 -1不满足接任务条件 3:多种情况混合
        switch(intFlag){
            case 0: return "<i class='iconfont icon-gantanhao task-icon'></i>";
            case 1: return "<i class='iconfont icon-question-full task-icon'></i>";
            case 2: return "<i class='iconfont icon-question-full task-icon' style='color:#FFD700;'></i>";
            case 3: return "<i class='iconfont icon-gantanhao task-icon'></i><i class='iconfont icon-question-full task-icon'></i>";
            case -1:  return '';
            default: return '';
        }
    }

    static _removeTaskItemsAndCargos(taskId,conArr){
        switch(conArr[0]){
            case 0: // 直接完成
                break;
            case 1: // 提交物品{code} x {number}
                CharacterModel.removeItem(parseInt(conArr[1]),parseInt(conArr[2]));
                break;
            case 2: // 打败{code} x {number}
                CharacterModel.removeKillForTask(taskId);
                break;
            case 3: // 提交金钱 x {number}
                CharacterModel.gainMoney(0-parseInt(conArr[2]));
                break;
            case 4: // 完成诗词魔方 {code}
                // 移除诗词监控
                CharacterModel.removePoemForTask(taskId);
                break;
            case 5: // 提交货物{code} x {number}
                CharacterModel.removeCargoByCargoId(parseInt(conArr[1]),parseInt(conArr[2]));
                // let cargoName = gDB.getCargoNameById(conArr1);
                // str += '上交货物：'+ cargoName + 'x' + conArr[2];
                break;
            case 6: // 提交多个物品{code} x {number} [6,101.1,102.3,104.3]
                // id=129: 解锁巅峰 基本等级到100级，请带1个永恒调和精华，1个永恒阴柔精华，和1个永恒阳刚精华来
                // ~~["l.100.0","i.119.1","i.130.1","i.141.1"]~~
                // [[1,119,1],[1,130,1],[1,141,1]]
                // id=450, 风尘三侠, [7.1,8.1,11.1,12.1]
                // 复杂条件，不应该到这个逻辑
                break;
            case 7: // 等级要求 condition[1]=等级 condition[2]=巅峰等级
                break;
            default:
                break;
        }
    }

    /**
     *
     * @param taskId
     * @return {number|number} 任务完成状态：-9=任务奖励物品但是没有空间，其余=任务状态标记
     */
    static completeTask(taskId){
        // 区分可重复和不可重复 - isRepeat
        // 检查完成条件并返回 : 0未接任务 1：已接任务，条件未达成 2: 已接任务，条件已达成 3（非可重复任务）已完成


        // 没有完成，返回-1

        // 已经达成条件，创建奖励
        // 物品栏已满 返回
        // 创建奖励成功 返回
        let st = TaskModel.taskStatus(taskId);
        if(st === 2){
            let tobj = gDB.getTaskById(taskId);

            // 20230511 - 检查行囊空间
            if(tobj.reward[0] === 2){
                if(dbPlayer[pId].inventory.length >= inventorySize){
                    return -9;  // 无行囊空间。
                }
            }

            dbPlayer[pId].taskActive = dbPlayer[pId].taskActive.filter(function(item) {
                return item !== taskId;
            });
            // 要更新清单，免得重复触发任务
            // 20220214 实现重复任务
            if(!tobj.repeatAble){
                dbPlayer[pId].taskFlag.push(taskId);
            }
            // remove KillList
            // remove Item
            // remove Money
            // remove Cargo
            if(tobj.condition[0]===6){
                // id=129: 解锁巅峰 基本等级到100级，请带1个永恒调和精华，1个永恒阴柔精华，和1个永恒阳刚精华来
                // [6,[[7,100,0],[1,119,1],[1,130,1],[1,141,1]],0]
                // id=450, 风尘三侠, [6,[[1,7,1],[1,8,1],[1,11,1],[1,12,1]],0]
                for(let i=0;i<tobj.condition[1].length;i++){
                    this._removeTaskItemsAndCargos(taskId,tobj.condition[1][i]);
                }
            }else{
                this._removeTaskItemsAndCargos(taskId,tobj.condition);
            }

            TaskModel._rewardGenerate(tobj.reward,tobj.level);

            // 20230609 - 加入通关判断
            // taskId = 128 扭转乾坤 踌躇满志任务线
            // taskId = 450 风尘三侠 江湖任务
            if((TASK_ID_GAME_WIN_1 === taskId ) || (TASK_ID_GAME_WIN_2 === taskId)){
                // Congratulations
                // switch CreditsScene
                gGui.hideHUD();
                $("#cityDiv").hide();
                let miniMapManager = MiniMapManager.getInstance();
                miniMapManager.hideMap();
                dbPlayer[pId].isAlive = false;
                $(".popover").popover('hide').popover('dispose');
                $(".modal-backdrop").remove();
                flagInGame = false;
                $(".modal").modal('hide');
                $("#sysToast").hide();
                let reason = globalStrings.TM_WIN;
                $("#gameOverDiv").html(reason).removeClass().show();
                // scene.cameras.main.flash(5000,235,104,100,true);
                setTimeout(function(){
                    $("#gameOverDiv").addClass('animated fadeOutUpBig slower');
                },3000);
                setTimeout(function(){
                    let scene = game.scene.getScene('WorldScene').scene;
                    scene.start('CreditsScene');
                    $("#btnCreditsBackButton").show();
                    $("#gameOverDiv").hide();
                }, 5000);

            }

        }else{
        }
        return st;
    }

    /**
     * 放弃任务
     * @param tid int 任务编号
     */
    static abortTask(tid){
        // 移除 taskActive
        // 移除 任务killList
        CharacterModel.removeActiveForTask(tid);
        CharacterModel.removeKillForTask(tid);
    }

    /**
     * 返回任务列表，包括执行中的和已完成的
     * @returns {{taskListCompleted: *[], taskListActive: *[]}}
     */
    static getTaskList(){
        // taskFlag : [3,4,5], // taskId - completed
        // taskActive: [1,2],  // taskId - accepted
        let taskListActive = [];
        let taskListCompleted = [];
        for(let a=0;a<dbPlayer[pId].taskActive.length;a++){
            let t = gDB.getTaskById(dbPlayer[pId].taskActive[a]);
            taskListActive.push(t);
        }
        for(let c=0;c<dbPlayer[pId].taskFlag.length;c++){
            let t = gDB.getTaskById(dbPlayer[pId].taskFlag[c]);
            taskListCompleted.push(t);
        }
        return {"taskListActive":taskListActive,"taskListCompleted":taskListCompleted};
    }

    //{"id":1,"name":"钟声","preQuest":0,"level":1,"isRepeat":0,
    // "senderCityId":27,"senderCityName":"王村","senderId":64,"senderName":"驿长",
    // "receiverCityId":27,"receiverCityName":"王村","receiverId":64,"receiverName":"驿长",
    // "condition":[0,0,0],"reward":[0,0,0],
    // "brief":"跟随钟声，回到王村。","detail":"远处的钟声响起，慌乱绕过山腰的老槐树，惊碎了小村的宁静。"},
    static toString(taskObj){
        let str = '';
        let senderCityName = gDB.getCityById(taskObj.senderCityId).zoneName;
        let senderName = gDB.getNPCById(taskObj.senderId).npcName;
        let receiverCityName = gDB.getCityById(taskObj.receiverCityId).zoneName;
        let receiverName = gDB.getNPCById(taskObj.receiverId).npcName;
        str += '<h5 class="task-modal-title"><small class="text-muted"> ['+taskObj.level+'] </small>' + taskObj.name + '</h5>';
        if(taskObj.preQuest !== 0){
            let preQ = gDB.getTaskById(parseInt(taskObj.preQuest));
            if(preQ){
                str += "<p class='underscore'>"+preQ.name + " > " + taskObj.name + "</p>";
            }
        }
        str += '<p class="task-modal-detail"><b>'+globalStrings.TM_SENDER+'</b>:[ ' + senderCityName +' ] ' + senderName + '<br/>';
        str += '<b>'+globalStrings.TM_RECEIVER+'</b>：[ ' + receiverCityName +' ] ' + receiverName + '</p><p class="task-modal-detail-body">'
            + taskObj.detail.replace(/\n/g,'<br/>')  + '</p>';
        str += '<p class="task-modal-brief">' + taskObj.brief + '</p>';
        str += '<h5>'+globalStrings.TM_CC+'</h5><p class="task-modal-condition">' + TaskModel._conditionToString(taskObj.zone_id,taskObj.condition) + '</p>';
        // bug fix : 如果任务已经接了，而且是击杀数量的任务，增加展示目前击杀数
        str += '<h5>'+globalStrings.TM_TP+'</h5><p class="task-modal-progress">';
        if(dbPlayer[pId].taskActive.indexOf(taskObj.id) >=0){
            str += TaskModel._progressToString(taskObj.id,taskObj.condition);
        }
        str += "</p>";
        str += '<h5>'+globalStrings.TM_TR+'</h5><p class="task-modal-reward">' + TaskModel._rewardToString(taskObj.reward,taskObj.level) + '</p>';
        return str;
    }

    /**
     * 任务奖励的经验值
     * @param taskLevel
     * @returns {number}
     */
    static taskExp(taskLevel){
        let intTl = parseInt(taskLevel);
        // updated 20223.05.05 增加任务exp，降低游戏难度
        // let multiplier = Math.ceil(intTl / 30);
        // return (intTl * (intTl+1) * 20 + 120) * multiplier;
        // updated 2023.11.22 减少任务exp 至 100级 25万左右，同时低等级尽量保持不变
        let multiplier = Math.ceil(intTl / 60);
        return (intTl * (intTl+1) * 12 + 120) * multiplier;
    }

    // private functions

    /**
     * 返回任务条件字符串
     * @param zoneId task zone_id
     * @param conArr taskObj.condition array
     * @returns {string}
     * @private
     */
    static _conditionToString(zoneId,conArr){
        let str='';
        switch(conArr[0]){
            case 0:  // 无条件
                str = globalStrings.TM_READY;
                break;
            case 1: // 提交物品{code} x {number}
                let strItemPop = ItemModel.drawItem(conArr[1]);
                str = globalStrings.TM_ITEM+' : [' + strItemPop + '] x ' + conArr[2];
                break;
            case 2: // 打败{code} x {number}
                let mobs = dbMob;
                let zoneName = '';
                if(zoneId >0){
                    mobs = gDB.getMobsInZone(zoneId);
                    let zo = gDB.getCityById(zoneId);
                    zoneName = zo.zoneName;
                }
                let mob_template_id = conArr[1];
                let mobName = '';   // 这里可能有问题，因为可能会存在同一个mob_template_id 在 mobs_in_zone 里面配置了不同名字导致问题。questEditor 里面选择的可能对不上。
                // 但是不处理了。因为在questEditor 里面操作的时候注意一下，规避即可。
                for(let i =0;i<mobs.length;i++) {
                    if (mobs[i].mob_template_id === mob_template_id) {
                        let oMob = new MobModel(mobs[i]);
                        mobName = oMob.shortName;
                        break;
                    }
                }
                if(mobName === ''){
                    mobName = gDB.getMobById(conArr[1]).mob_template_name;
                }
                if(zoneName === '') {
                    str = globalStrings.TM_DEFEAT+' : [' + mobName + '] x ' + conArr[2];
                }else{
                    str = globalStrings.TM_DEFEAT+' : ['+zoneName+'] -> [' + mobName + '] x ' + conArr[2];
                }
                break;
            case 3: // 提交金钱 x {number}
                str = globalStrings.MONEY+' : ' + conArr[2];
                break;
            case 4: // 完成诗词魔方 {code}
                let poem = gDB.getPoemById(conArr[1]);
                str = globalStrings.PUZZLE + ' : '+ poem.title;
                break;
            case 5: // 提交货物{code} x {number}
                let cargoName = gDB.getCargoNameById(conArr[1]);
                str = globalStrings.CARGO+' : ['+ cargoName + '] x ' + conArr[2];
                break;
            case 6: // 多种条件
                // id=129: 解锁巅峰 基本等级到100级，请带1个永恒调和精华，1个永恒阴柔精华，和1个永恒阳刚精华来
                // [6,[[7,100,0],[1,119,1],[1,130,1],[1,141,1]],0]
                // id=450, 风尘三侠, [6,[[1,7,1],[1,8,1],[1,11,1],[1,12,1]],0]
                let iConArr = conArr[1];
                for(let i=0;i<iConArr.length;i++){
                    str += this._conditionToString(zoneId,iConArr[i]);
                    if(i < iConArr.length -1){
                        str += "<br/>";
                    }
                }
                break;
            case 7: // 等级要求
                if(conArr[1]>0) str += (globalStrings.CHAR_LEVEL+" : "+conArr[1]);
                if(conArr[1]>0 && conArr[2]>0){
                    str += "<br/>";
                }
                if(conArr[2]>0) str += (globalStrings.PEER_LEVEL+" : "+conArr[2]);
                break;
            default:
                break;
        }
        return str;
    }

    /**
     * 返回任务进度描述字符串
     * @param taskId int task id
     * @param conArr array task condition Array
     * @returns {string}
     * @private
     */
    static _progressToString(taskId,conArr){
        let str = "";
        switch(conArr[0]){
            case 0:  // 无条件
                return globalStrings.TM_READY;
            case 1: // 提交物品{code} x {number}
                let intItemId = conArr[1];
                let intItemCount = conArr[2];
                let progressCount = CharacterModel.countItem(intItemId);
                progressCount = progressCount > intItemCount ? intItemCount : progressCount;
                let item = gDB.getItemById(intItemId);
                return item.itemName +" : "+ progressCount + ' / ' + intItemCount;
            case 2: // 打败{code} x {number}
                let mob_template_id = conArr[1];
                let task_kill_count = conArr[2];
                let mob_killed = CharacterModel.getKillCountForTask(taskId,mob_template_id);
                mob_killed = mob_killed>=task_kill_count ? task_kill_count : mob_killed;
                return globalStrings.TM_KILLED+" : "+ mob_killed + " / "+ task_kill_count;
            case 3: // 提交金钱 x {number}
                let money_ready = dbPlayer[pId].money > conArr[2] ? conArr[2] : dbPlayer[pId].money;
                return globalStrings.MONEY+" : "+ toReadableString(money_ready) + " / " + toReadableString(conArr[2]);
            case 4: // 完成诗词魔方 {code}
                return "";   // 这个就不要显示进度了
            case 5: // 提交货物{code} x {number}
                let amount_ready = CharacterModel.getCargoAmount(conArr[1]);
                amount_ready = amount_ready > conArr[2] ? conArr[2] : amount_ready;
                let cargoName = gDB.getCargoNameById(conArr[1]);
                return globalStrings.CARGO+" [ "+cargoName+" ] : " + amount_ready + ' / ' + conArr[2];
            case 6: // 复杂条件
                // id=129: 解锁巅峰 基本等级到100级，请带1个永恒调和精华，1个永恒阴柔精华，和1个永恒阳刚精华来
                // [6,[[7,100,0],[1,119,1],[1,130,1],[1,141,1]],0]
                // id=450, 风尘三侠, [6,[[1,7,1],[1,8,1],[1,11,1],[1,12,1]],0]
                for(let i=0;i<conArr[1].length;i++){
                    str = str + this._progressToString(taskId,conArr[1][i]);
                    if(i<conArr[1].length-1){
                        str = str + "<br/>";
                    }
                }
                return str;
            case 7: // 等级要求
                if(conArr[1]>0) str += (globalStrings.CHAR_LEVEL+" : "+dbPlayer[pId].level + "/" +conArr[1]);
                if(conArr[1]>0 && conArr[2]>0){
                    str += "<br/>";
                }
                if(conArr[2]>0) str += (globalStrings.PEER_LEVEL+" : "+dbPlayer[pId].paraLevel + "/" +conArr[2]);
                return str;
            default: return "";
        }
    }

    /**
     * 返回任务奖励字符串
     * @param rewArr
     * @param taskLevel
     * @returns {string}
     * @private
     */
    static _rewardToString(rewArr,taskLevel){
        let str = '';
        switch(rewArr[0]){
            case 0: // no reward
                break;
            case 1: // item - id = rewArr[1]   count = rewArr[2]
                let item = gDB.getItemById(rewArr[1]);
                if(rewArr[2]>1){
                    str = "["+ItemModel.drawItem(rewArr[1]) + "] x " + rewArr[2] + "<br/>";
                    // str = "["+item.itemName + "] x " + rewArr[2] + "<br/>";
                }else{
                    // str = ItemModel.toString(item) + "<br/>";
                    // str = item.itemName + "<br/>";
                    str = "["+ItemModel.drawItem(rewArr[1]) + "]<br/>";
                }
                break;
            case 2: // not used
                break;
            case 3: // money amount=rewArr[2]
                str = globalStrings.MONEY + ' : '+toReadableString(rewArr[2]) + "<br/>";
                break;
            case 4: // 解锁
                str = globalStrings.TM_UNLOCK + " : " + TaskModel._lockCode2String(rewArr[1]) + "<br/>";
            default:
                break;
        }
        str += globalStrings.EXP + ' : ' + toReadableString(TaskModel.taskExp(taskLevel));
        str += "<br/>"+globalStrings.FACTION+" : +0.5%";
        return str;
    }

    /**
     * 1=小秋2=王大3=巅峰等级4=解锁秘境 5=竞技场 6=无尽
     * @param c
     * @private
     */
    static _lockCode2String(c){
        let intc = parseInt(c);
        switch (intc){
            case 1: return globalStrings.NAME_1;
            case 2: return globalStrings.NAME_2;
            case 3: return globalStrings.PARALEVEL;
            case 4: return globalStrings.ZONE_NAME_RESERVED001;        // 奶牛关 - 通关后解锁
            case 5: return globalStrings.ZONE_NAME_BRDC;      // 百人斩
            case 6: return globalStrings.ZONE_NAME_SURVIVAL;        // 无尽模式 -
            case 7: return globalStrings.TASK_UNLOCK_7;   // 随机boss 单挑
            case 8: return globalStrings.CARGO_CARGONAME_50;    // 解锁 指定港口 的 指定 货物
            case 9: return globalStrings.TASK_UNLOCK_9;  // 解锁困难模式
            default: return '';
        }
    }

    /**
     * 创建任务奖励，并加入到行囊清单。如果是动态物品，创建，更新物品表，并加入行囊
     * @param rewArr
     * @param taskLevel
     * @returns {number} -2=not_enough_space
     * @private
     */
    static _rewardGenerate(rewArr,taskLevel){
        switch(rewArr[0]){
            case 0: // no reward
                break;
            case 1: // item - id = rewArr[1]   count = rewArr[2]
                // ship check
                if((rewArr[1] >= 165 && rewArr[1] <= 173) && CharacterModel.hasShip()){
                    // let itemName = gDB.getItemNameById(rewArr[1]);
                    let itemObj = gDB.getItemById(rewArr[1]);
                    let itemPrice = ItemModel.getPrice(itemObj);
                    gGui.sysToast(globalStrings.TM_ITEM+" [ "+itemObj.itemName+" ], "+globalStrings.CONVERT_TO_MONEY+" : "+toReadableString(itemPrice)+globalStrings.EOL);
                    CharacterModel.gainMoney(100000);
                    break;
                }

                let item = {};
                // dynamic items
                if((rewArr[1]>=182) && (rewArr[1]<=325)) {
                    item = ItemModel.identifyItem(rewArr[1]);
                    dbItem.push(item);
                }else{
                    item = gDB.getItemById(rewArr[1]);
                }
                let gainResult = CharacterModel.gainItem(rewArr[1],rewArr[2]);
                // -4 = 唯一物品重复
                if(gainResult<=0){
                    // 折算成钱
                    let amt = TaskModel.taskExp(taskLevel);
                    gGui.sysToast(globalStrings.UNIQ_ITEM+" [ "+item.itemName+" ],"+globalStrings.CONVERT_TO_MONEY+" : "+toReadableString(amt)+globalStrings.EOL);
                    // console.log("物品 [ "+item.itemName+" ] 折算为金钱:"+amt+"。");
                    CharacterModel.gainMoney(amt);
                }
                // 2023.09.12 如果是船，要把港口改为当前港口
                if(rewArr[1] >= 165 && rewArr[1] <= 173){
                    // 马嵬坡奖励的船？ 非port 奖励的船，默认放到平原
                    let zo = gDB.getCityById(dbPlayer[pId].zoneId);

                    if(zo.zType !== 'port'){
                        dbPlayer[pId].shipPortId = 25;  // 设为平原
                    }else{
                        dbPlayer[pId].shipPortId = dbPlayer[pId].zoneId;
                    }

                }

                break;
            case 2: // not used
                break;
            case 3: // money amount=rewArr[2]
                CharacterModel.gainMoney(rewArr[2]);
                break;
            case 4: // 解锁
                let unlockCode = parseInt(rewArr[1]);
                TaskModel._rewardUnlock(unlockCode);
                break;
            default:
                break;
        }
        CharacterModel.gainExp(TaskModel.taskExp(taskLevel),'adventure');
        CharacterModel.increaseFac(dbPlayer[pId].zoneId,5);
        return 1;
    }

    /** todo - 更多解锁条件代码实现
     * 解锁模式，并提供相关提示
     * @param unlockCode 1=小秋2=王大3=巅峰等级4=解锁秘境 5=道场 6=无尽 7=竞技场 8=城市货物
     * @param unlockArg 3位cityId3位cargoId  例如 14050 = 14-南平 050-剑南春
     * @private
     */
    static _rewardUnlock(unlockCode,unlockArg){
        switch (unlockCode){
            case 1: // '小秋';
                dbPlayer[1].flagUnlock = true;
                gGui.sysToast(globalStrings.UNLOCK_CHAR,globalStrings.TM_UNLOCK);
                break;
            case 2: // '王大';
                dbPlayer[2].flagUnlock = true;
                gGui.sysToast(globalStrings.UNLOCK_CHAR,globalStrings.TM_UNLOCK);
                break;
            case 3: // '巅峰等级';
                dbPlayer[pId].flagPara = true;
                gGui.sysToast(globalStrings.UNLOCK_PARA,globalStrings.TM_UNLOCK);
                break;
            case 4: // '秘境';    // 奶牛关 - 通关后解锁
                dbPlayer[pId].flagCow = true;
                gGui.sysToast(globalStrings.UNLOCK_RES,globalStrings.TM_UNLOCK);
                break;
            case 5: // '道场';   // 1-100 怪物连杀 百人道场 - 奇怪的府邸 任务后解锁
                dbPlayer[pId].flagAshram = true;
                gGui.sysToast(globalStrings.UNLOCK_BRDC,globalStrings.TM_UNLOCK);
                break;
            case 6: // '无尽';    // 无尽模式 - 任务清空凌霄楼后解锁
                dbPlayer[pId].flagEndless = true;
                gGui.sysToast(globalStrings.UNLOCK_ENDLESS,globalStrings.TM_UNLOCK);
                break;
            case 7: // '竞技场' - 随机boss 单挑，搏击俱乐部通关后解锁
                dbPlayer[pId].flagArena = true;
                gGui.sysToast(globalStrings.UNLOCK_FIELD,globalStrings.TM_UNLOCK);
                break;
            case 8: // '货物' - 3位城市ID3位货物ID
                // if(isNaN(unlockArg)) return;
                // let intCityId = Math.floor( unlockArg / 1000 );
                // let intCargoId = unlockArg - cityId;
                // let city = gDB.getCityById(intCityId);
                // let cargoName = gDB.getCargoNameById(intCargoId);
                // gDB.updateCityCargoLock(intCityId,intCargoId,0);
                dbPlayer[pId].flagJNC = true;   // 原本打算放在 dbCityCargo 但是想了下，应该是每个角色单独解锁，所以改成这样了
                gGui.sysToast(globalStrings.UNLOCK_JIANNANCHUN,globalStrings.TM_UNLOCK);
                break;
            case 9: // 解锁困难模式
                gApp.unlockGameDifficulty();
                gGui.sysToast(globalStrings.UNLOCK_HARD,globalStrings.TM_UNLOCK);
                break;
            default:
                break;
        }
    }
}