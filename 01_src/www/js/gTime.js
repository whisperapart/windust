/**
 * Created by jim on 2020/3/28.
 */

let gTime = new class {
    // constructor
    constructor(){
        this.updateCounts = 60;
        this.gameTime = 22;
        this.gameDay = 28;
        this.gameMonth = 11;
        this.timerPauseFlag = true;
    }

    // shared functions
    pauseTime(){ this.timerPauseFlag  = true;}
    resumeTime(){ this.timerPauseFlag = false;}
    ctrlTime(){ this.timerPauseFlag = !this.timerPauseFlag;}

    getMonth(){ return this.gameMonth;}
    getDay(){ return this.gameDay;}
    getHour(){ return this.gameTime;}

    /**
     * 游戏时间 + 1 小时
     */
    setNextHour(){
        for(let i=0;i<60;i++){
            this.update(true);
        }
    }

    // private functions
    /**
     * updated 20230601:0016 解决进入城市之后，投资调用update 但是 timerPauseFlag 导致不更新时间的问题。
     * @param force
     */
    update(force= false){
        if(!force && this.timerPauseFlag) return;
        // if(this.timerPauseFlag) return;
        // if((this.updateCounts % 14) === 0 )$(".hot-key-item-div .btn").blur();
        // if((this.updateCounts % 14) === 0 ) BubbleWidget.btnBlur();
        // if(this.updateCounts<=29){   // 0.5秒 = 1小时, 12秒=1天
        if(this.updateCounts<=58){      // 1秒 = 1小时， 24秒=1天
        // if(this.updateCounts<=1){
            this.updateCounts++;
        }else{
            this.updateCounts = 0;   // update 60 times = 1s in real = 1 hour in game

            // the ship needs supply on sail
            //player.onSailing();

            //if(gameTime == 0){
            // for(var i = 0 ; i< corePort.length; i++){
            //     // portController.priceWaveDaily(corePort[i]);   // 00:00 每日需求恢复
            //     //portController.priceWaveOnSell();
            //     portController.priceWaveDailyByIndex(i);   // 00:00 每日需求恢复
            //     portController.restoreSupplyDaily(corePort[i]);   // 00:00 每日供给恢复
            //     // portController.refreshSupplyPrice(corePort[i]);    // refresh price
            //
            //     // debug refresh price in port
            //     //player.guiDrawStockPanel();
            //     if(portController.activeBuildingName == dict.PB_JIAOYITING){
            //         portController.onEnterBuilding_market();
            //     }
            //  }
            //}
            let newDayFlag = false;
            let newMonthFlag = false;
            let newYearFlag = false;
            let newWeekFlag = false;
            if(this.gameTime>22){
                this.gameTime = -1;
                this.gameDay++;
                newDayFlag = true;
            }

            let newWeek = this.gameDay%7;
            if (newWeek===0){
                newWeekFlag = true;
            }

            let newMonth = Math.floor(this.gameDay/31);
            if(newMonth >= 1){
                this.gameMonth++;
                if(this.gameMonth>12){
                    newYearFlag = true;
                    this.gameMonth = 1;
                }
                // update portInvestigate
                this.gameDay=1;
                newMonthFlag = true;
                // portController.dbUpdateAllPortInvests();
            }
            this.gameTime++;

            this.eventHourly();
            if(newDayFlag){ this.eventDaily(); }
            if(newWeekFlag && newDayFlag){this.eventWeekly();}
            if(newMonthFlag && newDayFlag){ this.eventMonthly(); }
            if(newYearFlag && newDayFlag){ this.eventYearly(); }
        }
    }

    // events
    eventHourly(){
        // SupplyModel.tick();
    }
    eventDaily(){
        // 更新GUI
        gGui.updateHUDDate(this.time2String());
        // 交易
        gTrade.priceWaveDaily20220214();
        gTrade.restoreSupplyDaily();

        // 饥饿
        CharacterModel.consumeDaily();
    }
    eventWeekly(){
        // 更新港口投资数据
        for(let i=0;i<dbCity.length;i++){
            if(dbCity[i].invest > 0){
                let x = parseInt(dbCity[i].devLevel);
                // updated 2023.05.03 投资速度太慢，进行加强
                let baseMultiplier = 3;
                let m = parseInt(dbCity[i].invest) * baseMultiplier;
                let root = Math.floor(0.5* (Math.sqrt((2*x+1)*(2*x+1)+8*m) - (2*x+1))); // 不用递归算，求解一元二次方程  x=[-b±√(b²-4ac)]/2a
                if(root<=0) continue;
                let used = root*(x + 0.5*(1+root));
                let left = Math.floor((m - used)/baseMultiplier);
                if(left<0){
                    // error here
                    left =0;
                }
                dbCity[i].invest = left;
                dbCity[i].devLevel = (x + root) <=9999 ? (x + root) : 9999;
                console.log("city invest updated: cityId = "+i+" initLevel="+x+" invest="+m+" upLevel="+root+" newLevel="+ dbCity[i].devLevel + " leftInvest="+ left);
            }
        }

        // 计算投资收益 - updated 20230824 只有王二有投资港口的收益
        if(pId===0){
            let intBonus = 0;
            for(let i=0;i<dbCity.length;i++){
                if(dbCity[i].fac_fc > 500){
                    intBonus = intBonus + Math.floor(dbCity[i].devLevel * 7 * dbCity[i].fac_fc / 1000);
                }
            }
            if(intBonus > 0) {
                CharacterModel.gainMoney(intBonus);
                // gGui.sysToast("投资都市获得收益："+toReadableString(intBonus) + "。");
                gGui.bootToast(globalStrings.INVEST_TIP_TITLE,"",globalStrings.INVEST_TIP_CONTENT+toReadableString(intBonus) + globalStrings.EOL);
                // console.log("投资都市获得收益："+toReadableString(intBonus) + "。");
            }
        }


        // 重置港口已购商品 - 不需要，直接在 productivity 里面控制
        // purchaseModal.resetPurchaseHistory();
    }
    eventMonthly(){
        // todo : - 重置月度副本
    }
    eventYearly(){
        // todo : - 重置年度副本
    }

    // startTick(){
    //     gTime.update();
    //     window.RAF(gTime.startTick);
    // }

    // utils
    time2String(){
        // return this.gameMonth.toString().padStart(2,'0')
        //     +"-"+this.gameDay.toString().padStart(2,'0')
        //     +"."+this.gameTime.toString().padStart(2,'0');
            // +":"+this.updateCounts.toString().padStart(2,'0');
        return (this.gameMonth>=10 ? this.gameMonth : '0'+this.gameMonth)
            +"-"+(this.gameDay>=10 ? this.gameDay : '0'+this.gameDay)
            +"."+(this.gameTime>=10 ? this.gameTime : '0'+this.gameTime);
    }
}();

// gTime.startTick();