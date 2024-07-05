let saveSlot = -1;
let guiChosenSlot = -2;
let version_click_counter = 0;
// let comboDivDisplayTimeMax = 1000;
function change_skin(obj){
    if(obj.length<1){
        return;
    }else{
        document.getElementById("style").href=obj;
        console.log(obj);
        localforage.setItem('settings_theme',obj).then(function (v){
            console.log("game theme set to = " + obj);
        });
    }
}

class HudManager{
    constructor() {
        this.data = {
            'strName' : '','intAvatarId' : 0,
            'intLevel' : -1, 'intParaLevel' : -1,
            'intCurHP' : -1, 'intMaxHP' : -1,
            'intCurMP' : -1, 'intMaxMP' : -1,
            'intCurExp' : -1, 'intNextExp' : -1,
            'intLearnCurExp' : -2, 'intLearnNextExp' : -2,
            'strDate' : '',
            'strMoveOn': '','intFood':-1,
            'intShipSupply' : -1, 'intShipSupplyMax' : -1,
            'intShipId': -1,
            'strCoordinate' : '',
            'intComboCount':0
        };
        this.instance = null;
    }

    static getInstance(){
        if (this.instance) { return this.instance; }
        return this.instance = new HudManager();
    }

    drawHud(boolForce=false){
        if(boolForce || this.data.intAvatarId !== dbPlayer[pId].avatarId) this._drawAvatar();
        if(boolForce || this.data.intLevel !== dbPlayer[pId].level
                || this.data.paraLevel !== dbPlayer[pId].paraLevel
                || this.data.strName !== dbPlayer[pId].name ) this._drawName();
        if(boolForce || this.data.intCurHP !== dbPlayer[pId].curHP || this.data.intMaxHP !== dbPlayer[pId].maxHP){
            BubbleWidget.hpPercent();
            this._drawHP();
        }
        if(boolForce || this.data.intCurMP !== dbPlayer[pId].curMP || this.data.intMaxMP !== dbPlayer[pId].maxMP) {
            BubbleWidget.mpPercent();
            this._drawMP();
        }
        if(boolForce || this.data.intCurExp !== dbPlayer[pId].curExp || this.data.intNextExp !== dbPlayer[pId].nextExp) {
            BubbleWidget.expPercent();
            this._drawEXP();
        }
        BubbleWidget.foodPercent();
        if(boolForce || this.data.intLearnCurExp !== dbPlayer[pId].learningCurExp || this.data.intLearnNextExp !== dbPlayer[pId].learningNextExp) {
            this.data.intLearnCurExp = dbPlayer[pId].learningCurExp;
            this.data.intLearnNextExp = dbPlayer[pId].learningNextExp;
            BubbleWidget.learnExpPercent();
        }

        if(boolForce || this.data.strDate !== gTime.time2String()) this._drawDate();
        if(boolForce || this.data.intShipId !== dbPlayer[pId].shipId
                || this.data.strMoveOn !== dbPlayer[pId].moveOn
                || this.data.intFood !== dbPlayer[pId].food
                || this.data.intShipSupply !== dbPlayer[pId].shipSupply
        ) this._drawSupply();

        if(boolForce || this.data.intComboCount !== dbPlayer[pId].comboCount) this._drawCombo(dbPlayer[pId].comboCount);

        $("#hudDiv").show();
        $("#buffWidget").show();
        let buffWidget = BuffWidget.getInstance();
        buffWidget.updateWithCache();
        DeBuffWidget.guiUpdate();

        let miniMap = MiniMapManager.getInstance();
        miniMap.updateMap();
    }

    _drawCombo(intCount){
        if(dbPlayer[pId].isInWorldMap){
            dbPlayer[pId].comboCount = 0;
            return;
        }
        this.data.intComboCount = isNaN(intCount) ? 0 : intCount;
        if(this.data.intComboCount  <= 0){
            this.data.intComboCount = 0;
            $("#comboDiv").hide().removeClass('animated tada');
            return;
        }
        $("#comboDiv span").html(globalStrings.GUI_COMBO+" x "+intCount);
        $("#comboDiv").show().addClass('animated tada');
        setTimeout(function (){
            $("#comboDiv").hide().removeClass('animated tada');
            // this.data.comboDivDisplayTime = -1;
        },1500);
    }

    _drawAvatar(){
        this.data.intAvatarId = dbPlayer[pId].avatarId;
        $("#guiDiv .avatar-div img").attr('src','./assets/images/npc/'+this.data.intAvatarId+'.png');
    }
    _drawName(){
        this.data.intLevel = dbPlayer[pId].level;
        this.data.intParaLevel = dbPlayer[pId].paraLevel;
        this.data.strName = dbPlayer[pId].name;
        let nameStr = this.data.intLevel >= 100 ? this.data.strName + "("+this.data.intLevel + ":" + this.data.intParaLevel+")" : this.data.strName + "("+this.data.intLevel + ")";
        $("#guiDiv .name-div").html(nameStr);
    }
    _drawHP(){
        this.data.curHP = dbPlayer[pId].curHP;this.data.maxHP = dbPlayer[pId].maxHP;
        let hpPer = (100.0 *  this.data.curHP / this.data.maxHP).toFixed(2);
        $("#hpDiv .progress-bar").css('width',hpPer+ "%").attr("title",this.data.curHP+ " / " + this.data.maxHP);
        $("#hpDiv").attr("title",this.data.curHP + " / " + this.data.maxHP);
    }
    _drawMP(){
        this.data.curMP = dbPlayer[pId].curMP;this.data.maxMP = dbPlayer[pId].maxMP;
        let mpPer = (100.0 * this.data.curMP / this.data.maxMP).toFixed(2);
        $("#mpDiv .progress-bar").css('width',mpPer + "%").attr("title",this.data.curMP + " / " + this.data.maxMP);
        $("#mpDiv").attr("title",this.data.curMP + " / " + this.data.maxMP);
        $("#mpDivProgressBar").css("background",dbPlayer[pId].themeColor);
    }
    _drawEXP(){
        this.data.curExp = dbPlayer[pId].curExp; this.data.nextExp = dbPlayer[pId].nextExp;
        let ExpPer = (100.0 * this.data.curExp  / this.data.nextExp).toFixed(2);
        $("#expDiv .progress-bar").css('width',ExpPer + "%").attr("title",this.data.curExp  + " / " + this.data.nextExp);
        $("#expDiv").attr("title",this.data.curExp  + " / " + this.data.nextExp);
    }
    _drawDate(){
        this.data.strDate = gTime.time2String();
        $("#dateDiv").html(this.data.strDate);
    }
    _drawSupply(){
        let ship = gDB.getShipById(dbPlayer[pId].shipId);
        this.data.strMoveOn = dbPlayer[pId].moveOn;
        this.data.intFood = dbPlayer[pId].food;
        if(dbPlayer[pId].moveOn === 'ship'){
            this.data.intShipSupply = parseInt(dbPlayer[pId].shipSupply);
            this.data.intShipSupplyMax = stringToNumber(ship.supplyMax);
            let shipP = 100*(this.data.intShipSupply / this.data.intShipSupplyMax).toFixed(2);
            $("#foodDiv div.progress-bar").css("width",shipP + "%" );
            $("#foodDiv").attr("title",this.data.intShipSupply + " / " + this.data.intShipSupplyMax);
        }else{  // on foot or horse
            let foodP = 100*(this.data.intFood / 100).toFixed(2);
            $("#foodDiv div.progress-bar").css("width",foodP + "%" );
            $("#foodDiv").attr("title",this.data.intFood + " / 100");
        }
    }
}

let gGui = new class{
    constructor(){
        // object properties
        this.cityId = "0";  // init city id 0 = world map
        this.mapDivId = "#mapDiv";
        this.cityDivId = "#cityDiv";
        this.divClass = ".scene-div";
        this.hudDiv = "#hudDiv";
        this.menuDiv = "#menuDiv";
        this.buffDiv = "#buffWidget";
        this.difficulty = 1;
        this.inventoryClass = ".inventory-div";
        this.flagGuiShow = false;

        $(this.divClass).hide();
        $(this.inventoryClass).hide();
        $(this.hudDiv).hide();
        $(this.buffDiv).hide();

        $("#menuBtnNewGame").on("click",this._onBtnNewGame);       // mainMenu 开始新游戏
        $("#menuBtnNewGameGo").on("click",this._onNewGame);       // mainMenu 开始新游戏
        $(".menuBtnDifficulty").on("click",this._onGameDifficulty);
        $("#menuBtnNewGameBack").on("click",this._onBtnBackToMenu);

        $("#menuBtnLoadGame").on("click",this._onLoadGame);     // mainMenu 载入存档
        $("#menuBtnSettings").on("click",this._onGameSettings); // mainMenu 游戏设置
        $("#menuBtnCredits").on("click",this._onCredits); // mainMenu 游戏设置
        $("#btnCreditsBackButton").on("click",this._onCreditsBack); // mainMenu 游戏设置
        $("#menuBtnExitGame").on("click",this._onBtnExitGame);  // mainMenu 退出游戏

        $("#menuBtnSaveGame").on("click",this._onDonationInGame);     // inGame 保存游戏
        $("#menuBtnSettings1").on("click",this._onGameSettings);    // inGame 游戏设置
        $("#menuBtnBackToGame").on("click",this.onInGameMenu);   // inGame 继续游戏
        $("#menuBtnBackToMenu").on("click",this._onBtnBackToMainMenu);  // inGame 返回主菜单

        $("#menuBtnPlayer0").on("click",this._onEnterGame0);     // mainMenu 载入存档 选择角色0
        $("#menuBtnPlayer1").on("click",this._onEnterGame1);     // mainMenu 载入存档 选择角色1
        $("#menuBtnPlayer2").on("click",this._onEnterGame2);     // mainMenu 载入存档 选择角色2

        $("#menuBtnPlayerBack").on("click",this._onBtnBackToMenu);  // mainMenu 载入存档 选择角色 退回
        $("#menuBtnOptionsBack").on("click",this._onBtnBackToMenu);     // main / inGame 游戏设置 退回
        $("#menuPromptOK").on("click",this._onBtnBackToMenu);   // inGame 保存游戏 退回
        $("#menuLoadSlotBack").on("click",this._onBtnBackToMenu);   // inGame 保存游戏 退回

        $("#menuLoadSlot-1").on("click",this._onLoadGameAuto);      // 载入第0个存档
        $("#menuLoadSlot0").on("click",this._onLoadGame0);      // 载入第0个存档
        $("#menuLoadSlot1").on("click",this._onLoadGame1);      // 载入第0个存档
        $("#menuLoadSlot2").on("click",this._onLoadGame2);      // 载入第0个存档

        $("#menuSaveSlot0").on("click",{slot:0},this.confirmSave);
        $("#menuSaveSlot1").on("click",{slot:1},this.confirmSave);
        $("#menuSaveSlot2").on("click",{slot:2},this.confirmSave);
        $("#menuSaveSlotBack").on("click",this._onBtnBackToMenu);

        // $("#menuBtnGraphics").on("click",onGameGraphics);      // Options -放到 平台对应的js，比如 ios.js electron.js
        $("#menuBtnSound").on("click",this._onGameSound);      // Options - sound
        $("#menuBtnControls").on("click",this.onGamePlayHelp);      // Options
        $("#menuBtnGame").on("click",this._onOptionsGame);      // Options
        $("#menuBtnOptionsGameBack").on("click",this._onGameSettings);      // Options - quickbattle - back
        $("#menuBtnOptionsSoundBack").on("click",this._onGameSettings);      // Options - sound -back
        $("#menuBtnOptionsGraphicBack").on("click",this._onGameSettings);      // Options - sound -back
        $("#menuBtnOptionsCtrlHelpBack").on("click",this._onGameSettings);      // Options - sound -back
        // $("#menuBtnOptionsCtrlHelpNext").on("click",this._onGameHelpNext);
        // $("#menuBtnOptionsCtrlHelpOK").on("click",this.onInGameMenu);
        // $("#menuBtnOptionsCtrlHelpOK").on("click",this._onGameHelpStep3);

        $("#menuConfirmOK").on("click",this.__onBtnBackToMainMenuConfirm);
        $("#menuConfirmCancel").on("click",this._onBtnBackToMenu);
        $("#saveConfirmOK").on("click",this.doSaveByConfirm);
        $("#saveConfirmCancel").on("click",this._onBtnBackToMenu);
        // $("#uiHelpWizardNext").on("click",this._onBtnHelpWizardStep2);

        // $("#guiDiv #hudDiv img").on("click",this.drawCharacter);

        $('#chkDoNotAskBattleMode').on('change', this._onSwitchDoNotAskBattleMode);
        $('#chkOptionsGameQuickBattle').on('change', this._onSwitchQuickBattle);
        $('#chkOptionsGameHelp').on('change', this._onSwitchGameHelp);
        $('#chkOptionsSkipNewbie').on('change', this._onSwitchSkipNewbie);
        $('#chkOptionsBackgroundMusic').on('change', this._onChangeBackgroundMusic);
        $('#chkOptionsSoundEffect').on('change', this._onChangeSoundEffect);

        $('#hudDiv .hud-left').on('click', this.drawCharacter);

        // $("#bmmLeave").on("click",this._leaveBattleModeModal);
    }

    // shared functions
    // 检查并设置menu的可见性等，例如：没有存档时，载入按钮灰化
    updateMenuStatus(){
        // theme
        let r0 = false;let r1=false;let r2=false;
        let p1 = localforage.getItem('dbPlayer0').then(function(v){
            if(v === null){
                r0 = false;
            }else if(v[0].lastSaveTime !== undefined){
                r0 = true;
            }
        });
        let p2 = localforage.getItem('dbPlayer1').then(function(v){
            if(v === null){
                r1 = false;
            }else if(v[0].lastSaveTime !== undefined){
                r1 = true;
            }
        });
        let p3 = localforage.getItem('dbPlayer2').then(function(v){
            if(v === null){
                r2 = false;
            }else if(v[0].lastSaveTime !== undefined){
                r2 = true;
            }
        });

        let quickBattleFlag = false;
        let doNotAskBattleMode = false;
        let backgroundMusic = 100;
        let gameSoundEffect = 100;

        let difficultyUnlockFlag = false; // 是否解锁了高级难度，默认没有解锁
        let skipNewbieFlag = false;   // 跳过新手任务 - 直接30级别毕业，在平原，有船，马，5万启动资金
        let newGameHelpFlag = true;   // 是否启用新手帮助，默认启用

        let p_quickBattleFlag = localforage.getItem('settings_quickBattleFlag').then(function(v){
            quickBattleFlag = !!v;  // default false
        });
        let p_doNotAskBattleMode = localforage.getItem('settings_doNotAskBattleMode').then(function(v){
            doNotAskBattleMode = !!v;  // default false
        });
        let p_backgroundMusic = localforage.getItem('settings_backgroundMusic').then(function(v){
            backgroundMusic = v ? v : 100;  // default 100
        });
        let p_gameSoundEffect = localforage.getItem('settings_gameSoundEffect').then(function(v){
            gameSoundEffect = v ? v : 100;  // default 100
        });
        let p_difficultyUnlockFlag = localforage.getItem('settings_difficultyUnlockFlag').then(function(v){
            difficultyUnlockFlag = !!v;  // default false
        });
        let p_newGameHelpFlag = localforage.getItem('settings_newGameHelpFlag').then(function(v){
            newGameHelpFlag = (v != false);  // default true
        });
        let p_skipNewbieFlag = localforage.getItem('settings_skipNewbieFlag').then(function(v){
            skipNewbieFlag = !!v;  // default false
        });

        Promise.all([p1,p2,p3,p_quickBattleFlag,p_backgroundMusic,p_gameSoundEffect,p_difficultyUnlockFlag,p_newGameHelpFlag,p_skipNewbieFlag,p_doNotAskBattleMode]).then(function(){
            $("#menuBtnLoadGame").on("click",gGui._onLoadGame).removeAttr("disabled");
            // 快速战斗
            // console.log("quickbattleflag="+quickBattleFlag);
            $('#chkOptionsGameQuickBattle').prop("checked",quickBattleFlag);
            // 不询问战斗模式
            // console.log("doNotAskBattleMode="+doNotAskBattleMode);
            $('#chkDoNotAskBattleMode').prop("checked",doNotAskBattleMode);
            if(doNotAskBattleMode){
                $('#chkOptionsGameQuickBattle').prop("disabled",false);
                $('#chkOptionsGameQuickBattle').parent().addClass("btn-primary");
            }else{
                $('#chkOptionsGameQuickBattle').prop("disabled",true);
                $('#chkOptionsGameQuickBattle').parent().removeClass("btn-primary");
            }
            // 背景音乐
            // console.log("backgroundMusic="+backgroundMusic);
            $('#chkOptionsBackgroundMusic').val(backgroundMusic);
            // 音效
            // console.log("soundEffect="+gameSoundEffect);
            $('#chkOptionsSoundEffect').val(gameSoundEffect);
            // 困难模式
            // console.log("difficultyUnlock="+difficultyUnlockFlag);
            // $('#chkOptionsGameQuickBattle').prop("checked",difficultyUnlockFlag);
            // bug-fix 20240515 解决本地化翻译问题
            // let strDifficulty = '<strong>'+globalStrings['DIFFICULTY_HARD']+'</strong>';
            // if(!difficultyUnlockFlag){
            //     strDifficulty = strDifficulty + '<span class="badge bg-secondary rounded-pill">'+globalStrings['DIFFICULTY_UNLOCK']+'</span>';
            // }
            // $("#difficultyDetail-3 .diffDetailHeader").html(strDifficulty);
            if(difficultyUnlockFlag){
                $("#difficultyDetail-3 .diffDetailHeader span").hide();
            }else{
                $("#difficultyDetail-3 .diffDetailHeader span").show();
            }
            // 新手帮助
            // console.log("newGameHelpFlag="+newGameHelpFlag);
            $('#chkOptionsGameHelp').prop("checked",newGameHelpFlag);
            // 跳过新手区
            // console.log("skipNewbieFlag="+skipNewbieFlag);
            $('#chkOptionsSkipNewbie').prop("checked",skipNewbieFlag);
        });

    }
    // 检查并设置玩家解锁状态标志位，例如，王二已解锁，小月 王大没有解锁
    updateMenuPlayerStatus(){
        for (let i=0;i<dbPlayer.length;i++){
            if(dbPlayer[i].flagUnlock){
                $("#menuBtnPlayer"+i).removeAttr("disabled");
            }else{
                $("#menuBtnPlayer"+i).attr("disabled",true);
            }
        }
    }
    drawMainMenu(){
        gGui.updateMenuStatus();
        $(".menuBtnClass").hide();
        $(gGui.menuDiv).show();
        $("#menuBtnMain").show();
        // this.flagGuiShow = true;
    }
    onInGameMenu(){
        if(flagInGame){
            gGui.playSoundEffect("page");
            $("#miniMapDiv").hide();
            // 修正，如果有其他的modal，隐藏
            if($(".modal.show").length>=1){
                $(".modal").modal('hide');
                $("#btnInputKeyEsc").blur();
            }else{
                // 如果没有其他的modal，显示inGameMenu
                // fix 只有在大地图才显示，在城市和副本等界面，不展示 inGameMenu
                if(dbPlayer[pId].isInWorldMap){
                    if($(gGui.menuDiv).css("display") == "none"){
                        gGui._drawInGameMenu();
                        gApp.flagInGameMenu = true;
                        game.scene.getScene('WorldScene').input.keyboard.resetKeys();
                        game.scene.sleep('WorldScene');
                        // game.scene.getScene("WorldScene").player.
                        BubbleWidget.hideBubble();
                        $("#hudDiv").hide();
                        $("#buffWidget").hide();
                    }else{
                        gGui._hideInGameMenu();
                        gApp.flagInGameMenu = false;
                        game.scene.getScene('WorldScene').input.keyboard.resetKeys();
                        game.scene.wake('WorldScene');
                        $("#btnInputKeyEsc").blur();
                        BubbleWidget.showBubble();
                        $("#hudDiv").show();
                        $("#buffWidget").show();
                    }
                }
            }
            this.flagGuiShow = true;
        }
    }
    _drawInGameMenu(){
        $(".menuBtnClass").hide();
        $("#maskDiv").show();
        $(gGui.menuDiv).show();
        $("#menuBtnInGame").show();
        this.flagGuiShow = true;
    }
    _hideInGameMenu(){
        $(".menuBtnClass").hide();
        $("#maskDiv").hide();
        $(gGui.menuDiv).hide();
        this.flagGuiShow = false;
    }

    // 原来的方案，每次都强制刷新
    drawHUD_v1(){
        $("#guiDiv .avatar-div img").attr('src','./assets/images/npc/'+dbPlayer[pId].avatarId+'.png');
        let nameStr = dbPlayer[pId].level >= 100 ? dbPlayer[pId].name + "("+dbPlayer[pId].level + ":" + dbPlayer[pId].paraLevel+")" : dbPlayer[pId].name + "("+dbPlayer[pId].level + ")";
        $("#guiDiv .name-div").html(nameStr);
        let hpPer = 100.0 * dbPlayer[pId].curHP / dbPlayer[pId].maxHP;
        let mpPer = 100.0 * dbPlayer[pId].curMP / dbPlayer[pId].maxMP;
        let ExpPer = 100.0 * dbPlayer[pId].curExp / dbPlayer[pId].nextExp;

        $("#hpDiv .progress-bar").css('width',hpPer.toFixed(2) + "%").attr("title",dbPlayer[pId].curHP + " / " + dbPlayer[pId].maxHP);
        $("#hpDiv").attr("title",dbPlayer[pId].curHP + " / " + dbPlayer[pId].maxHP);
        $("#mpDiv .progress-bar").css('width',mpPer.toFixed(2) + "%").attr("title",dbPlayer[pId].curMP + " / " + dbPlayer[pId].maxMP);
        $("#mpDivProgressBar").css("background",dbPlayer[pId].themeColor);
        $("#mpDiv").attr("title",dbPlayer[pId].curMP + " / " + dbPlayer[pId].maxMP);
        this.updateHUDDate(gTime.time2String());
        this.updateHUDSupply();
        $("#expDiv .progress-bar").css('width',ExpPer.toFixed(2) + "%").attr("title",dbPlayer[pId].curExp + " / " + dbPlayer[pId].nextExp);
        $("#expDiv").attr("title",dbPlayer[pId].curExp + " / " + dbPlayer[pId].nextExp);
        $("#hudDiv").show();
        $("#buffWidget").show();

        BubbleWidget.updateBubble();
        BuffWidget.updateBuff();
        DeBuffWidget.guiUpdate();
    }

    // 优化后的方案，引入数据模型，检查到数据模型变化后，才绘制更新
    drawHUD_v2(){
        let hudManager = HudManager.getInstance();
        hudManager.drawHud();

        if(MiniMapManager.isShow()){
            let miniMapManager = MiniMapManager.getInstance();
            miniMapManager.updateMap();
        }
    }

    async drawHUD(){
        // let time1 = Date.now();
        // for(let i=0;i<100;i++){
            gGui.drawHUD_v2();
        // }
        // let time2 = Date.now();
        //
        // for(let i=0;i<100;i++){
        //     gGui.drawHUD_v1();
        // }
        //
        // let time3 = Date.now();
        // let d1 = time2 - time1;
        // let d2 = time3 - time2;
        // console.log(d1 + "vs" + d2);
    }
    hideHUD(){
        $("#hudDiv").hide();
        $("#buffWidget").hide();
    }
    updateHUDDate(str){
        $("#dateDiv").html(str);
    }
    updateHUDCordStr(str){
        // 检查是否有指南针
        // if(CharacterModel.hasItem(1)) $("#coordinateDiv").html(str);
        $("#coordinateDiv").html(str);
    }
    updateHUDCord(x,y){
        if(CharacterModel.hasItem(1)){
            $("#coordinateDiv").html(x+","+y);
        }else{
            $("#coordinateDiv").html("??,??");
        }
    }
    updateHUDSupply(){
        let wp = 0;
        if(dbPlayer[pId].moveOn === 'ship'){
            let ship = gDB.getShipById(dbPlayer[pId].shipId);
            let max = stringToNumber(ship.supplyMax);
            wp = 100*(dbPlayer[pId].shipSupply / max).toFixed(2);
            $("#foodDiv div.progress-bar").css("width", wp + "%" );
            $("#foodDiv").attr("title",dbPlayer[pId].shipSupply + " / " + ship.supplyMax);
        }else{  // on foot or horse
            wp = 100*(dbPlayer[pId].food / 100).toFixed(2);
            $("#foodDiv div.progress-bar").css("width", wp + "%" );
            $("#foodDiv").attr("title",dbPlayer[pId].food + " / 100");
        }
        if(wp <= 30){
            $("#foodDiv").addClass("ui-help-shine");
        }else{
            $("#foodDiv").removeClass("ui-help-shine");
        }
    }
    drawCharacter(){
        gGui.playSoundEffect("page");
        if(CharacterModal.isShow()){
            CharacterModal.hideModal();
            $("#btnInputKeyC").blur();
        }else{
            CharacterModal.drawCharacterModal();
        }
    }
    drawBattle(){
        if(BattleModal.isShow()){
            BattleModal.hideModal();
        }else{
            BattleModal.drawBattleModal();
        }
    }
    drawKongFu(){
        gGui.playSoundEffect("page");
        if(KongFuModal.isShow()){
            KongFuModal.hideModal();
            $("#btnInputKeyK").blur();
        }else {
            KongFuModal.drawKongFuModal();
        }
    }
    drawInventory(){
        gGui.playSoundEffect("page");
        if(InventoryModal.isShow()){
            InventoryModal.hideModal();
            $("#btnInputKeyI").blur();
        }else {
            InventoryModal.drawModal();
        }
    }
    drawJournal(){
        gGui.playSoundEffect("page");
        if(JournalModal.isShow()){
            JournalModal.hideModal();
            $("#btnInputKeyJ").blur();
        }else {
            JournalModal.drawModal();
        }
    }
    drawShip(fromSell,fromFit){
        gGui.playSoundEffect("page");
        if(ShipModal.isShow()){
            ShipModal.hideModal();
            $("#btnInputKeyO").blur();
        }else {
            ShipModal.drawModal(fromSell,fromFit);
        }
    }
    drawSell(npcId){
        gGui.playSoundEffect("page");
        if(SellModal.isShow()){
            SellModal.hideModal();
        }else {
            SellModal.drawModal(npcId);
        }
    }

    drawCity(cityId){
        gGui.playSoundEffect("page");
        gGui.updateCityHtml(cityId);
        $(gGui.divClass).hide();
        $(gGui.cityDivId).show();
        $("#buildingsDiv").show();
        $("#npcWelcome").hide();
        $("#actionDiv").hide();
        $("#npcDiv").hide();
        this.flagGuiShow = true;
    }
    updateCityHtml(cityId){
        $("#buildingsDiv").html("");
        gGui.cityUpdateInfoPanel(cityId);
        let intCityId = parseInt(cityId);
        let buildingArr = gDB.getBuildingNameListForCity(intCityId);
        buildingArr.forEach(function(bName){
            let bId = parseInt(gDB.getBuildingIdByName(bName));
            // let taskFlag = TaskModel.checkTasksForBuilding(intCityId,bId);
            // let strTask = TaskModel.getTaskStatusStringByFlag(taskFlag);

            let taskFlagObj = TaskModel.checkTasksAllForBuilding(intCityId,bId);
            let strTask = "";
            if(taskFlagObj.sendFlag > 0){
                strTask += TaskModel.getTaskStatusStringByFlag(0);
            }
            if(taskFlagObj.endFlag === 1){
                strTask += TaskModel.getTaskStatusStringByFlag(1);
            }else  if(taskFlagObj.endFlag === 2){
                strTask += TaskModel.getTaskStatusStringByFlag(2);
            }

            let str = "<button id='cityBuilding_"+cityId+"_"+bId+"' class='btn btn-primary city-building city-building-"+bId+"' onclick='gGui.drawBuilding(\""+bId+"\",\""+cityId+"\")'>"
                + "<img src='./assets/images/buildsm/"+bId+".png'>"
                + strTask
                + bName
                + "</button>";
            $("#buildingsDiv").append(str);
        });
        let doorStr = "<button id='cityBuilding_"+cityId+"_15' class='btn btn-primary city-building city-building-15' onclick='gApp.leaveZone()'>"
            + "<img src='./assets/images/buildsm/15.png'>"
            + globalStrings.GUI_LEAVE_CITY
            + "</button>";
        $("#buildingsDiv").append(doorStr);
    }
    domUIHide(){
        $("#guiDiv").hide();
    }
    domUIShow(){
        $("#guiDiv").show();
    }
    hideCity(cid) {
        $("#buildingsDiv").html("");
        gGui.drawCity(dbPlayer[pId].zoneId+'');
        $("#cityDiv").hide();
        this.flagGuiShow = false;
    }
    cityUpdateInfoPanelMoney(cityId){
        $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));

        if(parseInt(cityId) <= 0) return;
        let city = gDB.getCityById(cityId);     // cityName 基本信息 城市发展度 类型
        $("#cityInfoDevLevel").html(toReadableString(city.devLevel));
        $("#cityInfoInvest").html(toReadableString(city.invest));
    }
    cityUpdateInfoPanel(cityId){
        if(parseInt(cityId) <= 0) return;
        // this.drawHUD();
        $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));

        let city = gDB.getCityById(cityId);     // cityName 基本信息 城市发展度 类型
        $("#cityInfoName").html(city.zoneName);
        let zType = globalStrings.GUI_TOWN;
        switch (city.zType) {
            case 'port': zType = globalStrings.GUI_PORT;break;
            case 'hill': zType = globalStrings.GUI_HILL;break;
            default: break;
        }
        $("#cityInfoType").html(zType);
        $("#cityInfoDevLevel").html(toReadableString(city.devLevel));
        $("#cityInfoInvest").html(toReadableString(city.invest));

        if(zType === globalStrings.GUI_PORT || zType === globalStrings.GUI_TOWN){
            $("#cityInfoFacTS").html(facToPercentString(city.fac_ts)).parent().show();
            $("#cityInfoFacFC").html(facToPercentString(city.fac_fc)).parent().show();
            $("#cityInfoFacHD").html(facToPercentString(city.fac_hd)).parent().show();
            $("#cityInfoFacYW").html(facToPercentString(city.fac_yw)).parent().show();
        }else{
            $("#cityInfoFacTS").html('').parent().hide();
            $("#cityInfoFacFC").html('').parent().hide();
            $("#cityInfoFacHD").html('').parent().hide();
            $("#cityInfoFacYW").html('').parent().hide();
        }

        // 特殊建筑标记
        let npcNameArr = gDB.getCityNPCNameArray(cityId);
        let npcActArr = gDB.getCityNPCActArray(cityId);
        $(".cityInfoIcon").removeClass("active");
        if(npcNameArr.indexOf(globalStrings.CITY_HORSE_MERCHANT) !== -1){$("#cityInfoIconHorse").addClass('active');}
        if(npcNameArr.indexOf(globalStrings.NPC_NPCNAME_40) !== -1){$("#cityInfoIconShip").addClass('active');}
        if(npcNameArr.indexOf(globalStrings.CITY_CMD_NPCNAME_1_10_41_17) !== -1){$("#cityInfoIconFit").addClass('active');}
        if(npcActArr.indexOf('4') !== -1){$("#cityInfoIconHeal").addClass('active');}     // 医生
        if(npcNameArr.indexOf(globalStrings.CITY_SMITH) !== -1){$("#cityInfoIconSmith").addClass('active');}

        $(".cityInfoCargo").html('<i class="iconfont icon-blockbannedstopdisabledban"></i><span class="badge">'+globalStrings.CITY_CARGO_NONE+'</span>');          // 特产品
        let cityCargoArr = gDB.getCargoListForCity(cityId);
        // console.log(cityCargoArr.length);
        for(let i=1;i<=cityCargoArr.length;i++){
            // let cargoName = parseInt(cityCargoArr[i-1].devLevel) <= parseInt(city.devLevel) ? cityCargoArr[i-1].cargoName : '开发中';
            let cargoProductivity = Math.floor(Math.floor(city.devLevel / cityCargoArr[i-1].devLevel) * coreProductivity);
            cargoProductivity = Math.ceil(cargoProductivity * city.fac_fc / 1000);
            // let strCargoInfo = '<svg class="icon" aria-hidden="true"><use xlink:href="'+utilGetCssIconById(cityCargoArr[i-1].cargoId)+'"></use></svg><span class="badge badge-primary">'+cityCargoArr[i-1].cargoName+'</span>';
            let strCargoInfo = '<svg class="icon" aria-hidden="true"><use xlink:href="'+utilGetCssIconById(cityCargoArr[i-1].cargoId)+'"></use></svg>'+cityCargoArr[i-1].cargoName;
            if(parseInt(cityCargoArr[i-1].devLevel) > parseInt(city.devLevel)){
                strCargoInfo = strCargoInfo + '<span class="badge badge-pill badge-primary">'+globalStrings.CITY_DEV+' '+cityCargoArr[i-1].devLevel+'</span>';
            }else{
                strCargoInfo = strCargoInfo + '<span class="badge badge-pill badge-primary">'+globalStrings.GUI_PRD+' '+cargoProductivity+'</span>';
            }
            $("#cityInfoCargo"+i).html(strCargoInfo);
        }
    }

    drawBuilding(bId,cId,timeCost=1,noAnimation=false){
        if(!noAnimation) gGui.playSoundEffect("page");
        gGui.updateCityHtml(cId);
        // udpated 20230602 进入建筑需要花费1小时
        if(timeCost === 1) {
            gTime.setNextHour();
            gGui.drawHUD();
        }

        $("#npcDiv").hide().html("");
        //$("#npcDiv .npc-list").show();
        $("#buildingsDiv").show();
        $("#npcWelcome").hide();
        $("#actionDiv").hide();

        // $("#cityBuilding_"+cId+"_"+bId).removeClass("btn-primary").addClass("btn-secondary");
        $("#cityBuilding_"+cId+"_"+bId).addClass("building-active");

        // let npcArr = [];
        // for(let i=0;i<dbCityCmd.length;i++){
        //     if((dbCityCmd[i].buildingId == bId) && (dbCityCmd[i].cityId == cId)){
        //         npcArr.push(dbCityCmd[i].npcId);
        //     }
        // }
        // npcArr = [...new Set(npcArr)];
        let npcArr = gDB.getNpcIdListForBuilding(parseInt(cId),parseInt(bId));

        let str = "";
        let intCityId = parseInt(cId);
        for(let i=0; i<npcArr.length;i++){
            // draw npc with their avatar
            let intNpcId = parseInt(npcArr[i]);
            // 20220308 - 杜甫随机城市刷新逻辑
            if( (intNpcId === 9) && (intCityId !== gApp.dfCityId) ) continue;

            // version1. 老的逻辑
            // let taskFlag = TaskModel.checkTasksForNpc(intCityId,intNpcId);
            // let strTask = TaskModel.getTaskStatusStringByFlag(taskFlag);

            // let npcName = gDB.getCityNPCNameById(npcArr[i]);
            // str += "<div class='npc-avatar' onclick='gGui.drawNPCActions(\""+npcArr[i]+"\","+bId+",\""+cId+"\")'><img src='./assets/images/npc/"+npcArr[i]+".png'><label>"
            //     + strTask
            //     + npcName
            //     + "</label></div>";

            // version 2. 新的逻辑
            let taskFlagObj = TaskModel.checkTasksAllForNpc(intCityId,intNpcId);
            let strTask = "";
            if(taskFlagObj.sendFlag > 0){
                strTask += TaskModel.getTaskStatusStringByFlag(0);
            }
            if(taskFlagObj.endFlag === 1){
                strTask += TaskModel.getTaskStatusStringByFlag(1);
            }else  if(taskFlagObj.endFlag === 2){
                strTask += TaskModel.getTaskStatusStringByFlag(2);
            }
            let npcName = gDB.getCityNPCNameById(npcArr[i]);
            str += "<div class='npc-avatar' onclick='gGui.drawNPCActions(\""+npcArr[i]+"\","+bId+",\""+cId+"\")'><img src='./assets/images/npc/"+npcArr[i]+".png'><label>"
                + strTask
                + npcName
                + "</label></div>";

        }
        $("#npcDiv").html("<div class='cover'> <img src='./assets/images/building/"+bId+".jpg'></div><div class='npc-list'>"+str+"</div>");
        if(noAnimation){
            $("#npcDiv").show();
        }else{
            $("#npcDiv").show().addClass("fadeInRight animated");
            setTimeout(function () { $("#npcDiv").removeClass('fadeInRight animated');},200);
        }
    }

    // draw left-action-nav-bar for npc
    drawNPCActions(npcId,bId,cId){
        gGui.playSoundEffect("page");
        // $("#npcDiv .npc-list").hide();
        // $("#buildingsDiv").hide();
        // gGui.updateCityHtml(cId);
        gGui.drawBuilding(bId,cId,0,true);

        let npc = gDB.getNPCById(npcId);
        $("#npcWelcomeAvatar").attr('src','./assets/images/npc/'+npcId+'.png');
        $("#npcWelcomeName").html(npc.npcName);
        $("#npcWelcomeTitle").html(npc.npcDesc === 'NA' ? '' : ' <'+npc.npcDesc+' >');
        $("#npcHail").html(npc.npcHail === '' ? globalStrings.GUI_GREETINGS: npc.npcHail);
        $("#npcWelcome").show().addClass("slideInDown animated");
        setTimeout(function () { $("#npcWelcome").removeClass('slideInDown animated');},200);
        // $(".npc-avatar").removeClass("npc-active");
        // $(this).addClass("npc-active");

        //$("#actionDiv").html('');

        let actArr = [];
        for(let i=0;i<dbCityCmd.length;i++){
            if((parseInt(dbCityCmd[i].npcId) === parseInt(npcId)) && (parseInt(dbCityCmd[i].cityId) === parseInt(cId))){
                actArr.push(dbCityCmd[i].actId);
            }
        }

        let str = "";
        for(let i = 0;i<actArr.length;i++){
            if(parseInt(actArr[i])===0){
                continue;
            }
            let actName = gDB.getActionNameById(actArr[i]);
            str += "<button class='btn btn-primary' onclick='gGui.dispatchActionById(\""+actArr[i]+"\",\""+npcId+"\",\""+cId+"\",\""+bId+"\")'>" + actName +"</button>";
        }

        // 2021.10.25 新功能增加 - 任务
        let tasks = [];
        tasks = TaskModel.getTasks(cId,npcId);
        for(let i=0;i<tasks.length;i++){
            let iconStr = TaskModel.getTaskStatusStringByTaskId(tasks[i].id);
            str += "<button class='btn btn-primary' onclick='gGui.actHandler1(\""+tasks[i].id+"\")'>"
                + iconStr
                + tasks[i].name +"</button>";
            // 2021.11.24 如果任务条件是诗词魔方，添加npc诗词按钮，填入诗词id -
            // todo: 如果npc原先就有诗词指令，这个时候增加诗词魔方指令，两个是否合并？
            // 如果 任务是诗词，并且 是 sender 并且状态是已经接，并且状态是未完成
            if(
                (tasks[i].condition[0] === 4) &&
                (tasks[i].senderId === parseInt(npcId)) &&
                (TaskModel.taskStatus(tasks[i].id) === 1)
            ){
                let poem = gDB.getPoemById(tasks[i].condition[1]);
                str += "<button class='btn btn-primary' onclick='gGui.actHandler6("+npcId+","+bId+","+cId+","+tasks[i].condition[1]+")'>"
                    + globalStrings.PUZZLE +":"+ poem.title +"</button>";
            }
        }

        // 返回按钮
        // str += "<button class='btn btn-secondary' onclick='gGui.drawBuilding(\""+bId+"\",\""+cId+"\",0)'> 返回 </button>";
        $("#actionDiv").html(str).data('npcId',npcId).data('bId',bId).data('cId',cId).show();
    }

    sysToast(strBody,strHeader='<strong class="mr-auto">'+globalStrings.SYSTEM+'</strong><small>'+globalStrings.PROMPT+'</small>'){
        gGui.playSoundEffect("succ");
        $(".modal").modal('hide');
        $("#toastBody").html(strBody).unbind('click');
        if(strHeader === ''){
            $("#sysToast .toast-header").hide();
        }else{
            $("#sysToast .toast-header").html(strHeader).show();
        }
        $("#sysToast").show().addClass("slideInUp animated");
        $("#sysToast").on('click',function (){$("#sysToast").removeClass('slideInUp animated');$("#sysToast").hide();});
    }
    sysToastWithoutHide(strBody,strHeader='<strong class="mr-auto">'+globalStrings.SYSTEM+'</strong><small>'+globalStrings.PROMPT+'</small>'){
        gGui.playSoundEffect("succ");
        $("#toastBody").html(strBody).unbind('click');
        $("#sysToast .npc-welcome").addClass("npc-welcome-top");
        if(strHeader === ''){
            $("#sysToast .toast-header").hide();
        }else{
            $("#sysToast .toast-header").html(strHeader);
        }
        $("#sysToast").removeClass("slideInUp").show().addClass("slideInDown animated");
    }
    sysToastWithoutForHelpWizard(strBody,strHeader='<strong class="mr-auto">'+globalStrings.SYSTEM+'</strong><small>'+globalStrings.PROMPT+'</small>'){
        gGui.playSoundEffect("succ");
        $("#toastBody").html(strBody).unbind('click');
        $("#sysToast .npc-welcome").addClass("npc-welcome-top");
        if(strHeader === ''){
            $("#sysToast .toast-header").hide();
        }else{
            $("#sysToast .toast-header").html(strHeader);
        }
        $("#sysToast").removeClass("slideInUp").show().addClass("slideInDown animated");
        $("#toastBody").on('click',function (){$("#sysToast").removeClass('slideInUp animated');$("#sysToast").hide();});
    }

    bootToast(strTitleStrong, strTitleSmall, strBody){
        // gGui.flagGuiShow = true;
        let ts = 'bt-'+GlobalFunction.uuid();
        let strToast = '<div class="toast fade" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false" data-delay="1000" id="'+ts+'">'
            + '<div class="toast-header">'
            + '<strong class="me-auto header-strong">'
            + strTitleStrong
            +'</strong><small class="header-small">'
            + strTitleSmall+'</small>'
            // + '<button type="button" class="btn-close ms-2 mb-1" data-dismiss="toast" aria-label="Close"><span aria-hidden="true"></span></button>'
            + '</div><div class="toast-body">'+strBody+'</div></div>';
        $("#bootToast").append(strToast);
        $("#"+ts).on('click',function (){
            $(this).toast('dispose').remove();
            // gGui.flagGuiShow = false;
        });
        $("#"+ts).toast("show");
        setTimeout(function(id){
            $("#"+id).toast('dispose').remove();
            // gGui.flagGuiShow = false;
        },2500,ts);
    }

    _npcHail(npcId,npcName,str,pause){
        $("#npcWelcomeAvatar").attr('src','./assets/images/npc/'+dbPlayer[pId].avatarId+'.png');
        $("#npcWelcomeName").html(npcName);
        // $("#npcWelcomeTitle").html(npcDesc);
        $("#npcHail").html(str).unbind('click');
        $("#npcWelcome").show().addClass("slideInDown animated");
        if(pause){
            $("#npcHail").on('click',function (){$("#npcWelcome").removeClass('slideInDown animated');$("#npcWelcome").hide();});
        }else{
            setTimeout(function () { $("#npcWelcome").removeClass('slideInDown animated');$("#npcWelcome").hide();},2000);
        }

    }

    // phaser related
    _onBtnNewGame(){
        saveSlot = -1;
        gGui.playSoundEffect();
        $("#menuBtnMain").addClass('fadeOutLeft animated');
        setTimeout(function () { $("#menuBtnMain").removeClass('fadeOutLeft animated').css("display","none");},200);
        gGui._animateShow("#menuDivDifficulty");
    }

    _onGameDifficulty(){
        let strDiff = $(this).data('diff');
        let intDiff = parseInt(strDiff);
        intDiff = isNaN(intDiff) ? 1 : intDiff;
        gGui.difficulty = intDiff;
        $("#menuDifficultyDetailWrap div.alert").hide();
        gGui._animateShow("#difficultyDetail-"+gGui.difficulty);

        switch (intDiff){
            case 1:
                $("#menuBtnDifficulty-1").removeClass("btn-outline-success").addClass("btn-success");
                $("#menuBtnDifficulty-3").addClass("btn-outline-info").removeClass("btn-info");
                $("#menuBtnDifficulty-8").addClass("btn-outline-danger").removeClass("btn-danger");
                $("#menuBtnNewGameGo").removeClass("disabled");
                break;
            case 3:
                $("#menuBtnDifficulty-1").addClass("btn-outline-success",null,true).removeClass("btn-success",null,false);
                $("#menuBtnDifficulty-3").removeClass("btn-outline-info",null,false).addClass("btn-info",null,true);
                $("#menuBtnDifficulty-8").addClass("btn-outline-danger",null,true).removeClass("btn-danger",null,false);
                if(gApp.gameSettingObj.difficultyUnlockFlag){
                    $("#menuBtnNewGameGo").removeClass("disabled");
                }else{
                    $("#menuBtnNewGameGo").addClass("disabled");
                }
                break;
            case 8:
                $("#menuBtnDifficulty-1").addClass("btn-outline-success",null,true).removeClass("btn-success",null,false);
                $("#menuBtnDifficulty-3").addClass("btn-outline-info",null,true).removeClass("btn-info",null,false);
                $("#menuBtnDifficulty-8").removeClass("btn-outline-danger",null,false).addClass("btn-danger",null,true);
                $("#menuBtnNewGameGo").addClass("disabled");
                break;
            default:
                break;
        }
    }
    _onNewGame(){   // new game handler
        // gGui.playSoundEffect();

        $("#hudDiv").hide();
        $("#mapDiv").hide();
        $("#menuDiv").hide();
        $("#menuDivDifficulty").hide();
        gApp.newGame(gGui.difficulty);
        // console.log("new game start with difficulty = "+gGui.difficulty);
        // $(".menuBtnClass").hide();
        // gGui.drawHUD();
    }

    _getActualSaveSlot(intGuiSlot){
        let start_slot = GlobalConfig.SAVE_SLOT_CN_START;
        // console.log("gapp localce =" + gApp.gameSettingObj.locale);
        if(gApp.gameSettingObj.locale === 'en'){
            start_slot = GlobalConfig.SAVE_SLOT_ENU_START;
        }
        return intGuiSlot + start_slot;
    }

    _onLoadGame(){  // load game handler
        gGui.playSoundEffect();
        $("#menuBtnMain").addClass('fadeOutLeft animated');
        setTimeout(function () { $("#menuBtnMain").removeClass('fadeOutLeft animated').css("display","none");},200);
        $("#menuDonationSlot").removeClass("building-active").show();
        $("#menuDonationAlipay").removeClass("building-active");
        $("#menuDonationWechat").removeClass("building-active");
        $("#menuDonationPaypal").removeClass("building-active");
        gGui._animateShow("#menuLoadSlot");

    }
    _onDonationInGame(){
        gGui.playSoundEffect();
        // $("#menuBtnInGame").addClass('fadeOutLeft animated');
        // setTimeout(function () { $("#menuBtnMain").removeClass('fadeOutLeft animated').css("display","none");},200);
        gGui._animateHide("#menuBtnInGame");
        $("#menuDonationSlot").removeClass("building-active").show();
        $("#menuDonationAlipay").removeClass("building-active");
        gGui._animateShow("#menuDonationSlot");



        // gGui._animateHide("#menuBtnInGame");
        // $("#menuSaveSlot-1").removeClass("building-active").prop("disabled", true); // 自动存档不可人为选择
        // $("#menuSaveSlot0").removeClass("building-active");
        // $("#menuSaveSlot1").removeClass("building-active");
        // $("#menuSaveSlot2").removeClass("building-active");

        // gGui._animateShow("#menuSaveSlot");


    }
    _onLoadGame0(){
        gGui.playSoundEffect();
        // $("#menuLoadSlot").show().addClass('fadeOutLeft animated');
        // setTimeout(function () { $("#menuLoadSlot").removeClass('fadeOutLeft animated');},200);
        // $("#menuBtnPlayer").show().addClass('fadeInRight animated');
        // setTimeout(function () { $("#menuBtnPlayer").removeClass('fadeInRight animated');},200);
        // saveSlot = 0;
        guiChosenSlot = 0;
        gGui._animateHide("#menuLoadSlot");
        let slot = gGui._getActualSaveSlot(guiChosenSlot);
        let p1 = localforage.getItem('dbPlayer'+slot).then(function(v){
            dbPlayer = v;
            dbPlayer[0].flagUnlock ? $("#menuBtnPlayer0").removeAttr("disabled") : $("#menuBtnPlayer0").attr("disabled",true);
            dbPlayer[1].flagUnlock ? $("#menuBtnPlayer1").removeAttr("disabled") : $("#menuBtnPlayer1").attr("disabled",true);
            dbPlayer[2].flagUnlock ? $("#menuBtnPlayer2").removeAttr("disabled") : $("#menuBtnPlayer2").attr("disabled",true);
            gGui._animateShow("#menuBtnPlayer");
        });
    }
    _onLoadGame1(){
        gGui.playSoundEffect();
        // saveSlot = 1;
        guiChosenSlot = 1;
        gGui._animateHide("#menuLoadSlot");
        let slot = gGui._getActualSaveSlot(guiChosenSlot);
        let p1 = localforage.getItem('dbPlayer'+slot).then(function(v){
            dbPlayer = v;
            dbPlayer[0].flagUnlock ? $("#menuBtnPlayer0").removeAttr("disabled") : $("#menuBtnPlayer0").attr("disabled",true);
            dbPlayer[1].flagUnlock ? $("#menuBtnPlayer1").removeAttr("disabled") : $("#menuBtnPlayer1").attr("disabled",true);
            dbPlayer[2].flagUnlock ? $("#menuBtnPlayer2").removeAttr("disabled") : $("#menuBtnPlayer2").attr("disabled",true);
            gGui._animateShow("#menuBtnPlayer");
        });
    }
    _onLoadGame2(){
        gGui.playSoundEffect();
        // saveSlot = 2;
        guiChosenSlot = 2;
        gGui._animateHide("#menuLoadSlot");
        let slot = gGui._getActualSaveSlot(guiChosenSlot);
        let p1 = localforage.getItem('dbPlayer'+slot).then(function(v){
            dbPlayer = v;
            dbPlayer[0].flagUnlock ? $("#menuBtnPlayer0").removeAttr("disabled") : $("#menuBtnPlayer0").attr("disabled",true);
            dbPlayer[1].flagUnlock ? $("#menuBtnPlayer1").removeAttr("disabled") : $("#menuBtnPlayer1").attr("disabled",true);
            dbPlayer[2].flagUnlock ? $("#menuBtnPlayer2").removeAttr("disabled") : $("#menuBtnPlayer2").attr("disabled",true);
            gGui._animateShow("#menuBtnPlayer");
        });
    }
    _onLoadGameAuto(){
        gGui.playSoundEffect();
        guiChosenSlot = -1;
        gGui._animateHide("#menuLoadSlot");
        let slot = gGui._getActualSaveSlot(guiChosenSlot);
        let p1 = localforage.getItem('dbPlayer'+slot).then(function(v){
            dbPlayer = v;
            dbPlayer[0].flagUnlock ? $("#menuBtnPlayer0").removeAttr("disabled") : $("#menuBtnPlayer0").attr("disabled",true);
            dbPlayer[1].flagUnlock ? $("#menuBtnPlayer1").removeAttr("disabled") : $("#menuBtnPlayer1").attr("disabled",true);
            dbPlayer[2].flagUnlock ? $("#menuBtnPlayer2").removeAttr("disabled") : $("#menuBtnPlayer2").attr("disabled",true);
            gGui._animateShow("#menuBtnPlayer");
        });
    }

    // 玩家0 进入游戏
    _onEnterGame0(){    // pId = 0
        gGui.playSoundEffect("succ");
        pId = 0; saveSlot = guiChosenSlot;
        guiChosenSlot = -2;
        $("#hudDiv").hide();
        $("#mapDiv").hide();
        $("#menuDiv").hide();
        gApp.loadGame(saveSlot,pId);
        // $(".menuBtnClass").hide();
        // gGui.drawHUD();
    }
    _onEnterGame1(){        // pId = 1
        gGui.playSoundEffect("succ");
        pId = 1; saveSlot = guiChosenSlot;
        guiChosenSlot = -2;
        $("#hudDiv").hide();
        $("#mapDiv").hide();
        $("#menuDiv").hide();
        gApp.loadGame(saveSlot,pId);
        // $(".menuBtnClass").hide();
        // gGui.drawHUD();
    }
    _onEnterGame2(){    // pId = 2
        gGui.playSoundEffect("succ");
        pId = 2; saveSlot = guiChosenSlot;
        guiChosenSlot = -2;
        $("#hudDiv").hide();
        $("#mapDiv").hide();
        $("#menuDiv").hide();
        gApp.loadGame(saveSlot,pId);
        // $(".menuBtnClass").hide();
        // gGui.drawHUD();
    }

    _onGameSettings(){
        gGui.playSoundEffect();
        $(".menuBtnClass").hide();
        if($("#menuBtnMain").css("display") != "none"){
            $("#menuBtnMain").addClass('fadeOutLeft animated');
            setTimeout(function () { $("#menuBtnMain").removeClass('fadeOutLeft animated').css("display","none");},200);
        }
        if($("#menuBtnInGame").css("display") != "none"){
            $("#menuBtnInGame").addClass('fadeOutLeft animated');
            setTimeout(function () { $("#menuBtnInGame").removeClass('fadeOutLeft animated').css("display","none");},200);
        }
        $("#menuBtnOptions").show().addClass('fadeInRight animated');
        setTimeout(function () { $("#menuBtnOptions").removeClass('fadeInRight animated');},200);
    }
    _onCredits(){
        game = new Phaser.Game(phaserCreditsConfig);
        $("#guiDiv").hide();
        $("#btnCreditsBackButton").show();
    }
    _onCreditsBack(){
        game.scene.getScene("CreditsScene").sys.game.destroy(true);
        $("#btnCreditsBackButton").hide();
        gGui.hideHUD();
        $("#guiDiv").show();
        $("#mapDiv").show();
        gGui.drawMainMenu();
    }
    _onGameSound(){
        gGui.playSoundEffect();
        $(".menuBtnClass").hide();
        gGui._animateHide("#menuBtnOptions");
        gGui._animateShow("#menuBtnOptionsSound");
    }
    _onSaveGame(){
        gGui.playSoundEffect();
        gGui._animateHide("#menuBtnInGame");
        $("#menuSaveSlot-1").removeClass("building-active").prop("disabled", true); // 自动存档不可人为选择
        $("#menuSaveSlot0").removeClass("building-active");
        $("#menuSaveSlot1").removeClass("building-active");
        $("#menuSaveSlot2").removeClass("building-active");

        let ret = [];
        let slot1 = gGui._getActualSaveSlot(0);
        let p1 = localforage.getItem('dbPlayer'+slot1).then(function(v){
            if(v === null){
                ret[0] = globalStrings.SAVE_SLOT_0 + globalStrings.SAVE_SLOT_EMPTY;
                $("#menuSaveSlot0").html(ret[0]).data('flag','empty');
            }else if(v[0].lastSaveTime != undefined){
                // ret[0] = "存档0:  <span class='badge badge-pill'>" + v[0].lastSaveTime + "</span>";
                let dif = v[0].difficulty;
                dif = dif ? parseInt(dif) : 1;
                let strDif = globalStrings.GUI_D1;
                if(dif === 3){
                    strDif = globalStrings.GUI_D2;
                }else if(dif === 8){
                    strDif = globalStrings.GUI_D3;
                }
                ret[0] = globalStrings.SAVE_SLOT_0+"<span class='badge badge-pill'>("+strDif+") "+ v[0].lastSaveTime + "</span><div class='menu-badge'></div>";
                $("#menuSaveSlot0").html(ret[0]).data('flag','taken').data('lastSaveTime',v[0].lastSaveTime);
            }else{
                ret[0] = globalStrings.SAVE_SLOT_0+globalStrings.GUI_SAVE_ERROR+v[0].lastSaveTime;
                $("#menuSaveSlot0").html(ret[0]).data('flag','error');
            }

        });
        let slot2 = gGui._getActualSaveSlot(1);
        let p2 = localforage.getItem('dbPlayer'+slot2).then(function(v){
            if(v === null){
                ret[1] = globalStrings.SAVE_SLOT_1 + globalStrings.SAVE_SLOT_EMPTY;
                $("#menuSaveSlot1").html(ret[1]).data('flag','empty');
            }else if(v[0].lastSaveTime != undefined){
                // ret[1] = "存档1:  <span class='badge badge-pill'>" + v[0].lastSaveTime + "</span>";
                let dif = v[0].difficulty;
                dif = dif ? parseInt(dif) : 1;
                let strDif = globalStrings.GUI_D1;
                if(dif === 3){
                    strDif = globalStrings.GUI_D2;
                }else if(dif === 8){
                    strDif = globalStrings.GUI_D3;
                }
                ret[1] = globalStrings.SAVE_SLOT_1+"<span class='badge badge-pill'>("+strDif+") "+ v[0].lastSaveTime + "</span><div class='menu-badge'></div>";
                $("#menuSaveSlot1").html(ret[1]).data('flag','taken').data('lastSaveTime',v[0].lastSaveTime);
            }else{
                ret[1] = globalStrings.SAVE_SLOT_1+globalStrings.GUI_SAVE_ERROR+v[0].lastSaveTime;
                $("#menuSaveSlot1").html(ret[1]).data('flag','error');
            }
        });
        let slot3 = gGui._getActualSaveSlot(2);
        let p3 = localforage.getItem('dbPlayer'+slot3).then(function(v){
            if(v === null){
                ret[2] = globalStrings.SAVE_SLOT_2 + globalStrings.SAVE_SLOT_EMPTY;
                $("#menuSaveSlot2").html(ret[2]).data('flag','empty');
            }else if(v[0].lastSaveTime != undefined){
                // ret[2] = "存档2:  <span class='badge badge-pill'>" + v[0].lastSaveTime + "</span>";
                let dif = v[0].difficulty;
                dif = dif ? parseInt(dif) : 1;
                let strDif = globalStrings.GUI_D1;
                if(dif === 3){
                    strDif = globalStrings.GUI_D2;
                }else if(dif === 8){
                    strDif = globalStrings.GUI_D3;
                }
                ret[2] = globalStrings.SAVE_SLOT_2+"<span class='badge badge-pill'>("+strDif+") "+ v[0].lastSaveTime + "</span><div class='menu-badge'></div>";
                $("#menuSaveSlot2").html(ret[2]).data('flag','taken').data('lastSaveTime',v[0].lastSaveTime);
            }else{
                ret[2] = globalStrings.SAVE_SLOT_2+globalStrings.GUI_SAVE_ERROR+v[0].lastSaveTime;
                $("#menuSaveSlot2").html(ret[2]).data('flag','error');
            }
        });
        let slot4 = gGui._getActualSaveSlot(-1);
        let pa = localforage.getItem('dbPlayer'+slot4).then(function(v){
            if(v === null){
                ret[3] = globalStrings.SAVE_SLOT_AUTO + globalStrings.SAVE_SLOT_EMPTY;
                $("#menuSaveSlot-1").html(ret[3]).data('flag','empty');
            }else if(v[0].lastSaveTime != undefined){
                // ret[2] = "存档2:  <span class='badge badge-pill'>" + v[0].lastSaveTime + "</span>";
                let dif = v[0].difficulty;
                dif = dif ? parseInt(dif) : 1;
                let strDif = globalStrings.GUI_D1;
                if(dif === 3){
                    strDif = globalStrings.GUI_D2;
                }else if(dif === 8){
                    strDif = globalStrings.GUI_D3;
                }
                ret[3] = globalStrings.SAVE_SLOT_AUTO+"<span class='badge badge-pill'>("+strDif+") "+ v[0].lastSaveTime + "</span><div class='menu-badge'></div>";
                $("#menuSaveSlot-1").html(ret[3]).data('flag','taken').data('lastSaveTime',v[0].lastSaveTime);
            }else{
                ret[3] = globalStrings.SAVE_SLOT_AUTO+globalStrings.GUI_SAVE_ERROR+v[0].lastSaveTime;
                $("#menuSaveSlot-1").html(ret[3]).data('flag','error');
            }
        });
        Promise.all([pa,p1,p2,p3]).then(function(){
            let lastSaveIdx = -1;
            let lastSaveTime = -1;
            if($("#menuSaveSlot0").data('flag') === 'taken' ){
                lastSaveIdx = 0;
                lastSaveTime = new Date($("#menuSaveSlot0").data('lastSaveTime')).getTime();
                // lastSaveTime = parseInt($("#menuSaveSlot0").data('lastSaveTime'));
            }
            if($("#menuSaveSlot1").data('flag') === 'taken' ){
                // let ts = parseInt($("#menuSaveSlot1").data('lastSaveTime'));
                let ts = new Date($("#menuSaveSlot1").data('lastSaveTime')).getTime();
                if(ts > lastSaveTime){
                    lastSaveTime = ts;
                    lastSaveIdx = 1;
                }
            }
            if($("#menuSaveSlot2").data('flag') === 'taken' ){
                // let ts = parseInt($("#menuSaveSlot2").data('lastSaveTime'));
                let ts = new Date($("#menuSaveSlot2").data('lastSaveTime')).getTime();
                if(ts > lastSaveTime){
                    lastSaveTime = ts;
                    lastSaveIdx = 2;
                }
            }
            if($("#menuSaveSlot-1").data('flag') === 'taken' ){
                let ts = new Date($("#menuSaveSlot-1").data('lastSaveTime')).getTime();
                if(ts > lastSaveTime){
                    lastSaveTime = ts;
                    lastSaveIdx = -1;
                }
            }

            if(lastSaveIdx >=-1){
                // $("#menuSaveSlot"+lastSaveIdx).addClass("building-active");
                $("#menuSaveSlot"+lastSaveIdx + " .menu-badge").append('<div class="badge badge-info">'+globalStrings.LATEST+'</div>');
            }
            if(saveSlot >= 0){
                // $("#menuSaveSlot"+saveSlot).addClass("building-active");
                $("#menuSaveSlot"+saveSlot + " .menu-badge").append('<div class="badge badge-success">'+globalStrings.CURRENT+'</div>');
            }
            gGui._animateShow("#menuSaveSlot");
        });
    }

    confirmSave(event){
        let slot = event.data.slot;
        let iSlot = parseInt(slot);
        iSlot = isNaN(iSlot) ? 0 : iSlot;
        guiChosenSlot = iSlot;
        let slotSt = $("#menuSaveSlot"+iSlot).data('flag');
        if(slotSt === 'empty'){
            // 直接保存
            switch (iSlot){
                case 0: gGui._onSaveGame0(); break;
                case 1: gGui._onSaveGame1(); break;
                case 2: gGui._onSaveGame2(); break;
                default:break;
            }
        }else{
            gGui._animateHide("#menuSaveSlot");
            gGui._animateShow("#menuSaveConfirm");
            gGui.playSoundEffect("fail");
        }
    }

    doSaveByConfirm(){
        switch (guiChosenSlot){
            case 0: gGui._onSaveGame0(); break;
            case 1: gGui._onSaveGame1(); break;
            case 2: gGui._onSaveGame2(); break;
            default:break;
        }
        gGui._animateHide("#menuSaveConfirm");
    }

    saveGameResult(){
        // $("#menuDivPrompt").show().addClass('fadeInRight animated show');
        // setTimeout(function () { $("#menuDivPrompt").removeClass('fadeInRight animated');},200);
        gGui._animateShow("#menuDivPrompt");
        gGui.playSoundEffect("succ");
    }

    saveGameSettings(){
        let p_quickBattle = localforage.setItem('settings_quickBattleFlag',true).then(function (v){
            console.log("quick battle flag set to = ")
        });
    }

    playSoundEffect(str){
        let volume = gApp.gameSettingObj.gameSoundEffect / 100;
        let seObj;
        switch (str){
            case 'succ':
                seObj = document.getElementById("se_ding");
                break;
            case 'fail':
                seObj= document.getElementById("se_drum");
                break;
            case 'page':
                seObj = document.getElementById("se_page");
                break;
            case 'melee':
                seObj = document.getElementById("se_melee");
                break;
            default:
                // if(document.getElementById("se_click")){
                //     document.getElementById("se_click").play();
                // }
                seObj = document.getElementById("se_click");
                break;
        }
        if(seObj){
            seObj.volume = volume;
            seObj.play();
        }

    }

    _onOptionsGame(){
        gGui.playSoundEffect();
        gGui._animateHide("#menuBtnOptions");
        gGui._animateShow("#menuBtnOptionsGame");
    }

    _onSwitchQuickBattle(){
        gGui.playSoundEffect("fail");
        let newState = $('#chkOptionsGameQuickBattle').is(":checked");
        console.log(newState);
        localforage.setItem('settings_quickBattleFlag',newState).then(function (v){
            console.log("quick battle flag set to = " + newState);
        });
        gApp.gameSettingObj.quickBattleFlag = newState;
    }
    _onSwitchGameHelp(){
        gGui.playSoundEffect("fail");
        let newState = $('#chkOptionsGameHelp').is(":checked");
        console.log(newState);
        localforage.setItem('settings_newGameHelpFlag',newState).then(function (v){
            console.log("new gam help flag set to = " + newState);
        });
        gApp.gameSettingObj.newGameHelpFlag = newState;
    }
    _onSwitchSkipNewbie(){
        gGui.playSoundEffect("fail");
        let newState = $('#chkOptionsSkipNewbie').is(":checked");
        console.log(newState);
        localforage.setItem('settings_skipNewbieFlag',newState).then(function (v){
            console.log("skip newbie flag set to = " + newState);
        });
        gApp.gameSettingObj.skipNewbieFlag = newState;
    }
    _onSwitchDoNotAskBattleMode(){
        gGui.playSoundEffect("fail");
        let newState = $('#chkDoNotAskBattleMode').is(":checked");
        console.log(newState);
        localforage.setItem('settings_doNotAskBattleMode',newState).then(function (v){
            console.log("do not ask battle mode set to = " + newState);
        });
        gApp.gameSettingObj.doNotAskBattleMode = newState;
        if(newState){   // 不要问 ， 那么启用
            $("#chkOptionsGameQuickBattle").prop("disabled",false);
            $("#chkOptionsGameQuickBattle").parent().addClass("btn-primary")
        }else{
            $("#chkOptionsGameQuickBattle").prop("disabled",true);
            $("#chkOptionsGameQuickBattle").parent().removeClass("btn-primary");
        }
    }
    _onSetDoNotAskBattleMode(boolSet){
        $("#chkDoNotAskBattleMode").prop("checked",boolSet);
        gApp.gameSettingObj.doNotAskBattleMode = boolSet;
        localforage.setItem('settings_doNotAskBattleMode',boolSet).then(function (v){
            console.log("do not ask battle mode set to = " + boolSet);
        });
        // gApp.gameSettingObj.doNotAskBattleMode = booSet;
        // if(booSet){   // 不要问 ， 那么启用
        //     $("#chkOptionsGameQuickBattle").prop("disabled",false);
        //     $("#chkOptionsGameQuickBattle").parent().addClass("btn-primary")
        // }else{
        //     $("#chkOptionsGameQuickBattle").prop("disabled",true);
        //     $("#chkOptionsGameQuickBattle").parent().removeClass("btn-primary");
        // }
    }
    _onSetQuickBattle(boolSet){
        $("#chkOptionsGameQuickBattle").prop("checked",boolSet);
        gApp.gameSettingObj.quickBattleFlag = boolSet;
        localforage.setItem('settings_quickBattleFlag',boolSet).then(function (v){
            console.log("quick battle flag set to = " + boolSet);
        });
        // gApp.gameSettingObj.quickBattleFlag = boolSt;
    }

    _onChangeBackgroundMusic(){
        let bgmV = $('#chkOptionsBackgroundMusic').val();
        console.log("background music volume = " + bgmV);
        localforage.setItem('settings_backgroundMusic',bgmV).then(function (v){
            console.log("background music volume set to = " + bgmV);
        });
        gApp.gameSettingObj.backgroundMusic = bgmV;
        // 在游戏中的设置和调整，应该同时应用到游戏中。
        try{
            // 在 Dynamic Scene 不允许弹出 ESC 菜单，因此这里只处理大地图
            let sce = game.scene.getScene("WorldScene");
            sce.sound.setVolume(bgmV/100.0);
            console.log("world bg sound set to "+bgmV);
            // document.getElementById("se_ding").volume = bgmV/100.0;
            // gGui.playSoundEffect("succ");
            // document.getElementById("se_ding").volume = SOUND_EFFECT_VOLUME;
        }catch (e){
            // do nothing
        }
    }
    _onChangeSoundEffect(){
        let seV = $('#chkOptionsSoundEffect').val();
        console.log("sound effect volume = " + seV);
        localforage.setItem('settings_gameSoundEffect',seV).then(function (v){
            console.log("sound effect volume set to = " + seV);
        });
        gApp.gameSettingObj.gameSoundEffect = seV;
        SOUND_EFFECT_VOLUME = seV/100.0;
        document.getElementById("se_page").volume = SOUND_EFFECT_VOLUME;
        document.getElementById("se_ding").volume = SOUND_EFFECT_VOLUME;
        document.getElementById("se_click").volume = SOUND_EFFECT_VOLUME;
        document.getElementById("se_drum").volume = SOUND_EFFECT_VOLUME;
        gGui.playSoundEffect("succ");
    }

    _onSaveGame0(){
        // $("#menuSaveSlot").addClass('fadeOutLeft animated');
        // setTimeout(function () { $("#menuSaveSlot").removeClass('fadeOutLeft animated').css("display","none");},200);
        gGui._animateHide("#menuSaveSlot");
        // saveSlot = 0;    // todo: 没想好，如果保存到其他位置之后，当前存档位置也改为其他位置的，就执行这个（=保存）。如果当前2 保存到0，当前位置不改，最新=0，就注释掉（=另存为）
        gApp.saveGame(0).then(function () {
            gGui.saveGameResult();
        });
    }
    _onSaveGame1(){
        // $("#menuSaveSlot").addClass('fadeOutLeft animated');
        // setTimeout(function () { $("#menuSaveSlot").removeClass('fadeOutLeft animated').css("display","none");},200);
        gGui._animateHide("#menuSaveSlot");
        // saveSlot = 1;// todo: 没想好，如果保存到其他位置之后，当前存档位置也改为其他位置的，就执行这个（=保存）。如果当前2 保存到0，当前位置不改，最新=0，就注释掉（=另存为）
        gApp.saveGame(1).then(function () {
            gGui.saveGameResult();
        });
    }
    _onSaveGame2(){
        // $("#menuSaveSlot").addClass('fadeOutLeft animated');
        // setTimeout(function () { $("#menuSaveSlot").removeClass('fadeOutLeft animated').css("display","none");},200);
        gGui._animateHide("#menuSaveSlot");
        // saveSlot = 2;// todo: 没想好，如果保存到其他位置之后，当前存档位置也改为其他位置的，就执行这个（=保存）。如果当前2 保存到0，当前位置不改，最新=0，就注释掉（=另存为）
        gApp.saveGame(2).then(function () {
            gGui.saveGameResult();
        });
    }
    // _onSaveGameAuto(){
    //     gApp.saveGame(-1).then(function () {
    //         gGui.saveGameResult();
    //     });
    // }

    _onBtnBackToMenu(){
        gGui.playSoundEffect();
        if($("#maskDiv").css("display") == "none"){  // main menu
            $(".menuBtnClass").css("display","none");
            $("#menuBtnMain").show().addClass('fadeInLeft animated');
            setTimeout(function () { $("#menuBtnMain").removeClass('fadeInLeft animated');},200);
        }else{  // in-game menu
            $(".menuBtnClass").css("display","none");
            $("#menuBtnInGame").show().addClass('fadeInLeft animated');
            setTimeout(function () { $("#menuBtnInGame").removeClass('fadeInLeft animated');},200);
        }
    }
    _onBtnBackToMainMenu(){
        gGui.playSoundEffect();
        gGui._animateHide("#menuBtnInGame");
        gGui._animateShow("#menuDivConfirm");
    }
    __onBtnBackToMainMenuConfirm(){
        gGui.playSoundEffect();
        saveSlot = -1;
        $("#menuDivConfirm").hide();
        $("#maskDiv").hide();
        $("#gameOverDiv").hide();
        $("#bubbleWidget").hide();
        gApp.resetGame();
        gGui.hideHUD();
        $("#mapDiv").show();
        gGui.drawMainMenu();
    }
    _onBtnExitGame(){
        gApp.exitGame();
    }

    // todo: - dispatch action_handler for current npc
    dispatchActionById(actId, npcId,cityId,buildingId){
        gGui.playSoundEffect("page");
        eval('gGui.actHandler' + actId + '("'+ npcId+'","'+buildingId+'","'+cityId+'")');
    }

    // todo: -  all action handler

        // todo: - action handler 0 - 17
        // act 0 - N/A
        actHandler0(npcId,bId,cId){
            return 0;
        }
        // {"actId": "1", "actName": "任务"},
        actHandler1(strTaskId){
            let taskId = parseInt(strTaskId);
            if(TaskModal.isShow()){
                TaskModal.hideModal();
            }
            TaskModal.drawModal(taskId);
        }
        //{"actId": "2", "actName": "切磋"},
        // 原本的实现，用quickbattle实现。
        actHandler2_bkup_v1(npcId,bId,cId){
            // invoke arena-scene
            // todo: 先用quickbattle, 后面加入 非快速战斗

            $("#btnInputKeyEsc").attr('disabled',true);        // ESC    = Menu
            $("#btnInputKeyC").attr('disabled',true);        // C    = Character
            $("#btnInputKeyK").attr('disabled',true);        // K    = Kongfu
            let zone = gDB.getCityById(GlobalConfig.ZONE_ID_FIELD);    // 115 = field 比武场
            game.scene.pause('WorldScene');
            battleModal.initBattleZone(zone, npcId, bId);
            gGui.drawBattle();  // 显示 快速战斗对话框
            battleModal.updateLogs(1);
            BubbleWidget.hideBubble();

        }
        // 新代码，加入quickBattle 或者 dynamicScene方式
        actHandler2(npcId,bId,cId){
            // if(gApp.gameSettingObj.quickBattleFlag){
            //     this.actHandler2_bkup_v1(npcId,bId,cId);
            // }else{
            //     gApp.enterZone(GlobalConfig.ZONE_ID_FIELD,npcId);
            // }
            // bug-fix 20230913 - as we use promp for user to choose quick or not.
            gApp.enterZone(GlobalConfig.ZONE_ID_FIELD,npcId,bId,cId);
        }

        //{"actId": "3", "actName": "投资"},
        actHandler3(npcId,bId,cId){
            // todo: invoke invest-modal
            InvestModal.drawModal(parseInt(cId));
        }
        //{"actId": "4", "actName": "诊疗"},
        actHandler4(npcId,bId,cId){
            // todo: invoke heal-modal
            if(dbPlayer[pId].money >= 100){
                dbPlayer[pId].money = dbPlayer[pId].money - 100;
                dbPlayer[pId].curHP = dbPlayer[pId].maxHP;
                dbPlayer[pId].curMP = dbPlayer[pId].maxMP;
                $("#npcHail").html(globalStrings.HEAL_INFO);
                gGui.drawHUD();
                gGui.cityUpdateInfoPanelMoney(cId);
            }else{
                $("#npcHail").html(globalStrings.HEAL_NO_MONEY);
            }
        }
        //{"actId": "5", "actName": "购买"},
        actHandler5(npcId,bId,cId){
            // todo: invoke buy-modal
            BuyModal.drawBuyModal(cId,npcId);
        }
        //{"actId": "6", "actName": "诗词"},
        actHandler6(npcId,bId,cId,pid='0'){
            if(pid == '0'){
                // make it random
                let min = 1;
                let max = dbPoem.length;
                pid = GlobalFunction.getRndInteger(min,max);
            }
            // invoke puzzle-modal
            console.log("puzzle"+pid);
            puzzleModal.drawPuzzleModal(gDB.getPoemById(pid),npcId,bId,cId);

        }
        // {"actId": "7", "actName": "领悟"},
        actHandler7(npcId,bId,cId){
            let intCityId = parseInt(cId);
            if(MeditationModal.isShow()){
                MeditationModal.hideModal();
            }
            MeditationModal.drawModal(intCityId);
        }
        // {"actId": "8", "actName": "出售"},
        /**
         * 商人 - 出售窗口
         * @param npcId - 商人的npc 编号
         * @param bId - 建筑 编号
         * @param cId - 城市编号
         */
        actHandler8(npcId,bId,cId){
            // 如果是船厂老板，开船界面
            // 40 船厂老板 - 船
            // 42 马商 - 缰绳
            // 45 小二 - 食物、肉、杂物
            // 46 工匠 - 装备
            // [58,62] 医生 - 医书
            // 48、55 学者 教授 - 宝石
            // 47 教头 - 秘籍
            let intNpcId = parseInt(npcId);
            if(40 === intNpcId){
                gGui.drawShip("yes","no");
            }else{
                gGui.drawSell(intNpcId);
            }
        }
        // {"actId": "9", "actName": "采购"},
        actHandler9(npcId,bId,cId){
            // 判断玩家是否有船
            if(dbPlayer[pId].shipId === 0){ $("#npcHail").html(globalStrings.PURCHASE_NO_SHIP); return;}
            // 判断船是否在当前港口
            if(parseInt(dbPlayer[pId].shipPortId) !== parseInt(cId)){ $("#npcHail").html(globalStrings.PURCHASE_OTHER_PORT);return;}
            // 20220308 判断是否有占有度
            let cityObj = gDB.getCityById(cId);
            if(cityObj.fac_fc <= 0) { $("#npcHail").html(globalStrings.PURCHASE_NO_FAC); return; }
            // invoke purchase-modal
            // console.log("purchase:"+cId);
            purchaseModal.drawPurchase(cId);
        }
        // {"actId": "10", "actName": "贩卖"},
        actHandler10(npcId,bId,cId){
            // 判断玩家是否有船
            if(dbPlayer[pId].shipId === 0){ $("#npcHail").html(globalStrings.SALE_NO_SHIP); return;}
            // 判断船是否在当前港口
            if(parseInt(dbPlayer[pId].shipPortId) !== parseInt(cId)){ $("#npcHail").html(globalStrings.SALE_OTHER_PORT);return;}
            // 20220308 判断是否有占有度
            let cityObj = gDB.getCityById(cId);
            if(cityObj.fac_fc <= 0) { $("#npcHail").html(globalStrings.PURCHASE_NO_FAC); return; }
            // invoke sale-modal
            saleModal.drawSale(cId);
        }
        // {"actId": "11", "actName": "赌博"},
        actHandler11(npcId,bId,cId){
            // invoke gambling-modal
            let intCityId = parseInt(cId);
            if(GamblingModal.isShow()){
                GamblingModal.hideModal();
            }
            GamblingModal.drawModal(intCityId);

        }
        // {"actId": "12", "actName": "存入"},
        actHandler12(npcId,bId,cId){
            // invoke bank-in-modal
            // 存入需要钱 - 取出不需要钱
            if(BankModal.isShow()){
                BankModal.hideModal();
            }
            BankModal.drawModal(parseInt(cId));
        }
        // {"actId": "13", "actName": "取出"},
        actHandler13(npcId,bId,cId){
            // invoke bank-out-modal
            // bank-in bank-out 应该是同一个modal
            // updated 20220811 - 所有功能并入 actHander12
            gGui.actHandler12(npcId,bId,cId);
        }
        // {"actId": "14", "actName": "出城"},
        actHandler14(npcId,bId,cId){
            gApp.leaveZone();
        }
        // {"actId": "15", "actName": "补给"},
        actHandler15(npcId,bId,cId){
            // 直接付钱补满
            if(parseInt(dbPlayer[pId].shipId) === 0) { $("#npcHail").html(globalStrings.SUPPLY_NO_SHIP);return;}
            let ship = gDB.getShipById(dbPlayer[pId].shipId);
            if(ship === undefined) { $("#npcHail").html(globalStrings.SUPPLY_SHIP_NOT_FOUND);return;}
            if(parseInt(dbPlayer[pId].shipPortId) !== parseInt(cId)) {$("#npcHail").html(globalStrings.SUPPLY_OTHER_PORT);return;}
            let supplyNeed = stringToNumber(ship.supplyMax) - dbPlayer[pId].shipSupply;
            if(supplyNeed <=0) { $("#npcHail").html(globalStrings.SUPPLY_FULL); return;}
            let moneyNeed = shipSupplyPrice * parseInt(supplyNeed);
            if(moneyNeed > dbPlayer[pId].money) { $("#npcHail").html(globalStrings.SUPPLY_MONEY_NEED+" [ "+toReadableString(moneyNeed)+" ] "+globalStrings.SUPPLY_NOT_ENOUGH_MONEY); return;}

            CharacterModel.gainMoney(0 - moneyNeed);
            dbPlayer[pId].shipSupply += supplyNeed;
            $("#npcHail").html(globalStrings.SUPPLY_DONE+" [ "+toReadableString(supplyNeed)+" ] "+globalStrings.SUPPLY_COST+" [ "+toReadableString(moneyNeed)+" ]"+globalStrings.EOL);
            $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));

        }
        // {"actId": "16", "actName": "出港"},
        actHandler16(npcId,bId,cId){
            // 判断玩家是否有船
            if(dbPlayer[pId].shipId === 0){ $("#npcHail").html(globalStrings.SAIL_NO_SHIP); return;}
            // 判断船是否在当前港口
            if(parseInt(dbPlayer[pId].shipPortId) !== parseInt(cId)){ $("#npcHail").html(globalStrings.SAIL_OTHER_PORT);return;}
            // 判断补给
            if(dbPlayer[pId].shipSupply < 9 ){ $("#npcHail").html(globalStrings.SAIL_SHORT_SUPPLY);return;}
            gApp.leaveZone('ship');
        }
        // {"actId": "17", "actName": "改装"}
        actHandler17(npcId,bId,cId){
            // invoke refit-modal
            if(dbPlayer[pId].shipPortId !== parseInt(cId)){ $("#npcHail").html(globalStrings.REFIT_OTHER_PORT);return;}
            gGui.drawShip("no","yes");
        }
        // {"actId": "18", "actName": "鉴定"}
        actHandler18(npcId,bId,cId){
            // 鉴定 无窗口
            let unIdentifyFlag = false;
            for(let i=0;i<dbPlayer[pId].inventory.length;i++){
                if(dbPlayer[pId].inventory[i].id <=325  && dbPlayer[pId].inventory[i].id >=182){
                    unIdentifyFlag = true;
                    break;
                }
            }
            if(!unIdentifyFlag){
                $("#npcHail").html(globalStrings.IDENTIFY_NO_NEED);
                return;
            }
            if(dbPlayer[pId].money >= 1000){
                dbPlayer[pId].money = dbPlayer[pId].money - 1000;
                for(let i=0;i<dbPlayer[pId].inventory.length;i++){
                    if(dbPlayer[pId].inventory[i].id <=325  && dbPlayer[pId].inventory[i].id >=182){
                        for(let j=0;j<dbPlayer[pId].inventory[i].count;j++){
                            let item1 = ItemModel.identifyItem(dbPlayer[pId].inventory[i].id);
                            dbItem.push(item1);
                            dbPlayer[pId].inventory[i].id = item1.itemId;
                            // CharacterModel.removeItem(dbPlayer[pId].inventory[i].id,1)
                            // if(dbPlayer[pId].inventory.length<64){
                            //     dbItem.push(item1);
                            //     dbPlayer[pId].inventory.push({id:item1.itemId,count:1});
                            // }
                        }
                    }
                }
                $("#npcHail").html(globalStrings.IDENTIFY_DONE);
                gGui.drawHUD();
                gGui.cityUpdateInfoPanelMoney(cId);
            }else{
                $("#npcHail").html(globalStrings.IDENTIFY_NO_MONEY);
            }

        }
        // {"actId": "19", "actName": "休息"}
        actHandler19(npcId,bId,cId){
            dbPlayer[pId].curHP = dbPlayer[pId].maxHP;
            dbPlayer[pId].curMP = dbPlayer[pId].maxMP;
            $("#npcHail").html(globalStrings.FULL_RESTORE);
            gGui.drawHUD();
        }

    // {"actId": "20", "actName": "合成"}
    actHandler20(npcId,bId,cId){
        if(ComposeModal.isShow()){
            ComposeModal.hideModal();
        }
        //禁用其他弹窗按钮，避免悲剧
        $("#btnInputKeyEsc").attr('disabled',true);        // ESC    = Menu
        $("#btnInputKeyC").attr('disabled',true);        // C    = Character
        $("#btnInputKeyK").attr('disabled',true);        // K    = Kongfu
        $("#btnInputKeyI").attr('disabled',true);        // I    = Inventory
        $("#btnInputKeyJ").attr('disabled',true);        // J    = Journal
        $("#btnInputKeyO").attr('disabled',true);        // O    = Ship

        ComposeModal.drawModal();
    }

    // {"actId": "21", "actName": "分解"}
    actHandler21(npcId,bId,cId){
        if(DecomposeModal.isShow()){
            DecomposeModal.hideModal();
        }
        DecomposeModal.drawModal();
    }

    //{"actId": "22", "actName": "驿传"}
    actHandler22(npcId,bId,cId){
        // let ableZ = HorseTravelModal.getTravelAbleZones(parseInt(cId),dbPlayer[pId].visitedCity);
        if(HorseTravelModal.isShow()){
            HorseTravelModal.hideModal();
        }
        HorseTravelModal.drawModal();
    }

    // util - private functions
    utilGetCSSClassByCityType(cityType){
        switch(cityType){
            case '贸易城市':
                return 'btn-success';
                break;
            case '副本':
                return 'btn-danger';
                break;
            case '内陆城市':
                return 'btn-info';
                break;
            case '名山':
                return 'btn-primary';
                break;
            case '关隘':
                return 'btn-warning';
                break;
            case '宝物':
                return 'btn-secondary';
                break;
            default:
                return 'btn-primary';
                break;
        }
    }
    _animateShow(id){
        $(id).show().addClass('fadeInRight animated show');
        setTimeout(function () { $(id).removeClass('fadeInRight animated');},200);
    }
    _animateShowSlideInRight(id){
        $(id).show().addClass('slideInRight animated show');
        setTimeout(function () { $(id).removeClass('slideInRight animated');},200);
    }
    _animateHide(id){
        $(id).addClass('fadeOutLeft animated');
        setTimeout(function () { $(id).removeClass('fadeOutLeft animated').css("display","none");},200);
    }
    animateShake(id){
        $(id).addClass("animated headShake");
        setTimeout(function () { $(id).removeClass("animated headShake"); },1000);
    }

    /**
     * display a full screen mask with str in the middle_center of it. e.g. Game Over
     * @param str
     */
    showScreenMask(str){
        $("#gameOverDiv").html(str).show();
        setTimeout(function(){
            $("#gameOverDiv").hide().html("GAME OVER");
        },2000);
    }
    hideScreenMask(){
        $("#gameOverDiv").hide().html("GAME OVER");
    }
    enableKeys(){
        $("#btnInputKeyEsc").attr('disabled',false);        // ESC    = Menu
        $("#btnInputKeyC").attr('disabled',false);        // C    = Character
        $("#btnInputKeyK").attr('disabled',false);        // K    = Kongfu
        $("#btnInputKeyI").attr('disabled',false);        // I    = Inventory
        $("#btnInputKeyJ").attr('disabled',false);        // J    = Journal
        $("#btnInputKeyO").attr('disabled',false);        // O    = Ship
        $("#btnInputKeyM").attr('disabled',false);        // O    = Ship
        // console.log('keys enabled');
    }
    disableKeys(){
        $("#btnInputKeyEsc").attr('disabled',true);        // ESC    = Menu
        $("#btnInputKeyC").attr('disabled',true);        // C    = Character
        $("#btnInputKeyK").attr('disabled',true);        // K    = Kongfu
        $("#btnInputKeyI").attr('disabled',true);        // I    = Inventory
        $("#btnInputKeyJ").attr('disabled',true);        // J    = Journal
        $("#btnInputKeyO").attr('disabled',true);        // O    = Ship
        $("#btnInputKeyM").attr('disabled',true);        // O    = Ship
        // console.log('keys disabled');
    }

    onGamePlayHelp(){
        $("#game_control_help_wrap").show();
        console.log("game ctrl help wrap show ");
        if(GlobalConfig.TAP_DEVICE){    // tap - help
            $("#electron_game_control_help").hide();
        }else{  // key board-help
            $(".mobile-help-div").hide();
        }
        $("#menuBtnOptionsCtrlHelpBack").show();
        $("#menuBtnOptionsCtrlHelpOK").hide();
        gGui.playSoundEffect();
        gGui._animateHide("#menuBtnOptions");
        gGui._animateShowSlideInRight("#game_control_help_wrap");
    }

    _leaveBattleModeModal(){
        // gTime.resumeTime();
        // flagInGame = true;
        // dbPlayer[pId].isInWorldMap = true;
        // game.scene.resume('WorldScene');
        // gGui.enableKeys();
        // game.scene.getScene("WorldScene").player.moveOn('foot');
        // dbPlayer[pId].horseId = 0;  // 默认下马
        // CharacterModel.calcTotalState();
        // game.scene.getScene('WorldScene').updateLayerCollision(dbPlayer[pId].moveOn);
        // gGui.updateHUDSupply();
        gApp.leaveZone();
    }
    leaveBattleModeModalV20240516(zone,npcId,bId,cId){
        if(npcId == 0){
            // 说明是从 大地图 进入的战斗，此时应该退回大地图
            gApp.leaveQuickBattle();
        }else{
            // 说明是从其他城市中发起的，例如是 城市里面的切磋。
            gGui.drawNPCActions(npcId,bId,cId);
            gApp.leaveQuickBattleToCity();
        }
        gGui.enableKeys();
    }

    version_click_handler(){
        // console.log("version clicked");
        // console.log(window.event.clientX+","+window.event.clientY);
        // let cx = window.event.clientX;
        // let cy = window.event.clientY;
        // $("#"+BubbleManager.eleWrapId).append('<div class="bubble" style="animation-duration:1s;left:'+cx+'px;top:'+cy+'px;width:40px;height:40px;"></div>');
        if(version_click_counter === 0){
            setTimeout(function (){
                version_click_counter = 0;
                $("#pVersion").css("font-weight",400).css("font-size","0.8rem");
            },1500);
            version_click_counter = 1;
            $("#pVersion").css("font-weight",400).css("font-size","0.9em");
        }else{
            if(version_click_counter <=3){
                version_click_counter++;
                let x = version_click_counter - 2;
                $("#pVersion").css("font-weight",400+x*100).css("font-size","1."+(0.5*x)+"em");
            }else{
                // console.log("trigger clicks");
                version_click_counter = 0;
                gGui.bootToast(globalStrings.MSG_TITLE,"",globalStrings.MSG_CONSOLE_ON);
                GlobalConfig.DEV_CONSOLE = true;
                gGui.playSoundEffect("succ");
            }
        }
    }
}();