/**
 * Created by jim on 2020/4/29.
 */
let SOUND_EFFECT_VOLUME = 1.0;
let BOOL_NEW_GAME = false;

let gApp = new class {
    flagInGameMenu = false;
    gameSettingObj = {};
    dfCityId = 22;
    shareItemIdArr = [-1,-1,-1,-1,-1,-1];
    gameSeed = GlobalConfig.DEFAULT_RANDOM_SEED;
    gameSeedState = undefined;
    difficulty = 1;

    constructor() {
        this.loadGameSettings();
        gGui.updateMenuStatus();
    }

    newGame(intDiff = 1){
        BOOL_NEW_GAME = true;
        gGui.disableKeys();
        this._initGameData();
        this._enterWorld();
        this.difficulty = intDiff;
        // 角色初始化脚本
        // if(pId===0){
        //     let intItemId = 331;
        //     let itemObj = gDB.getItemById(intItemId);
        //     CharacterModel.studyKF(itemObj.kfId);
        //     dbPlayer[pId].eqList[7] = intItemId;
        // }
    }

    saveGame(slot){
        if(slot === undefined || slot >=3 || slot<-1) return;

        let start_slot = GlobalConfig.SAVE_SLOT_CN_START;
        if(gApp.gameSettingObj.locale === 'en'){
            start_slot = GlobalConfig.SAVE_SLOT_ENU_START;
        }
        slot = slot + start_slot;

        let kfPromise = gApp._saveKF(slot); // save KF data
        let playerPromise = gApp._savePlayer(slot); // save player data, with taskFlag
        let zonePromise = gApp._saveZone(slot); // save world data - 城市发展都
        let itemPromise = gApp._saveItem(slot);
        let cargoPromise = gApp._saveTrade(slot); // save trade data
        let worldPromise = gApp._saveWorld(slot); // 保存世界设置，例如：日期时间、杜甫所在城市、共享物品、游戏Seed等
        return Promise.all([kfPromise,playerPromise,zonePromise,itemPromise,cargoPromise,worldPromise]).then(function(v){
            console.log('Game data saved to slot: ' + slot);
            // gGui.saveGameResult();
        });
    }
    saveGameAuto(){
        gApp.saveGame(-1);
    }

    loadGame(slot,playerId){

        let start_slot = GlobalConfig.SAVE_SLOT_CN_START;
        if(gApp.gameSettingObj.locale === 'en'){
            start_slot = GlobalConfig.SAVE_SLOT_ENU_START;
        }
        slot = slot + start_slot;

        let kfPromise = gApp._loadKF(slot);
        let payerPromise = gApp._loadPlayer(slot);
        let zonePromise = gApp._loadZone(slot);// todo: load world data - 公共宝箱
        let itemPromise = gApp._loadItem(slot);
        let cargoPromise = gApp._loadCityCargo(slot);
        let worldPromise = gApp._loadWorld(slot);

        // 这里先强制刷新一下，解决载入游戏后价格异常问题。也可以把 dbCityCargo 存入本次存储，在这里读入
        // gTrade.priceWaveDaily20220214();
        // gTrade.restoreSupplyDaily();

        return Promise.all([kfPromise,payerPromise,zonePromise,itemPromise,cargoPromise,worldPromise]).then(function(v){
            console.log('Game data loaded.');
            pId = playerId;
            // CharacterModel.calcTotalState();
            gApp._enterWorld();
        });
    }

    resetGame(){
        console.log("resetting game");
        flagInGame = false;
        this.flagInGameMenu = false;
        // dbPlayer[pId].timerPauseFlag = true;
        //game.scene.getScene("WorldScene").registry.destroy();
        //game.scene.getScene("WorldScene").events.off();
        // game.scene.getScene("WorldScene").player.destroy();
        // game.destroy(false,false);
        // game.scene.getScene("WorldScene").sys.game.destroy(true);

        // game.scene.getScene("WorldScene").player.destroy();
        // console.log("player destroy");
        // game.scene.getScene("WorldScene").scene.sleep();
        // console.log("scene sleep");
        // game.scene.getScene("WorldScene").scene.shutdown();
        // console.log("scene shutdown");
        // game.scene.getScene("WorldScene").scene.destroy();
        // console.log("scene destroy");

        game.destroy(true);
        console.log("game destroy");
        // game=null;
        dbKF=[];dbPlayer=[];dbItem=[];dbCity=[];
        pId=0;
        $("#game_div").html('');
    }

    exitGame(){
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        } else if( (typeof app !== 'undefined') && (typeof app.exit !== 'undefined')){
            app.exit(); // electron exit
        }else {
            window.close();
        }
    }

    // private functions
    // 初始化所有游戏数据，用于游戏重新开始的时候
    _initGameData(){
        pId = 0;
        gApp._initKF();
        gApp._initPlayer();
        gApp._initItem();
        gApp._initCity();
        gApp.gameSeed = "game_seed="+GlobalFunction.uuid();
    }

    _initKF(){
        dbKF = JSON.parse(JSON.stringify(dbKFStatic));
        // return gApp.saveKF();
    }
    _initPlayer(){
        dbPlayer = JSON.parse(JSON.stringify(dtPlayer));
        // return gApp.savePlayer();
        // return gApp.savePlayer();
    }
    _initItem(){
        dbItem = JSON.parse(JSON.stringify(dbItemStatic));
        // return gApp.saveItem();
    }
    _initCity(){
        dbCity = JSON.parse(JSON.stringify(dtZone));
        for(let i=0;i<dbCity.length;i++){
            dbCity[i].devLevel = parseInt(dbCity[i].initLevel);
            dbCity[i].invest = 0;
        }
        // return gApp.saveZone();
    }

    _loadKF(slot=0){
        return localforage.getItem('dbKF'+slot).then(function(v){
            dbKF = v;
            console.log("KF data loaded.");
            // console.log(dbKF);
        });
    }
    _loadPlayer(slot=0){
        return localforage.getItem('dbPlayer'+slot).then(function(v){
            dbPlayer = v;
            console.log("Player data loaded.");
        });
    }
    _loadItem(slot=0){
        return localforage.getItem('dbItem'+slot).then(function(v){
            dbItem = v;
            console.log("Item data loaded.");
        });
    }
    _loadZone(slot=0){
        return localforage.getItem('dbZone'+slot).then(function(v){
            dbCity = v;
            console.log("Zone data loaded.");
        });
    }
    _loadCityCargo(slot=0){
        return localforage.getItem('dbCityCargo'+slot).then(function(v){
            dbCityCargo = v;
            console.log("cargo data loaded.");
        });
    }
    _loadWorld(slot=0){
        // return localforage.getItem('gTime'+slot).then(function(v){
        return localforage.getItem('gWorld'+slot).then(function(v){
            gTime.updateCounts = v.updateCounts;
            gTime.gameTime = v.gameTime;
            gTime.gameDay = v.gameDay;
            gTime.gameMonth = v.gameMonth;
            gApp.dfCityId = v.dfCityId ? v.dfCityId : 22;
            gApp.shareItemIdArr = v.shareItemIdArr ? v.shareItemIdArr : [-1,-1,-1,-1,-1,-1];
            gApp.gameSeed = v.gameSeed ? v.gameSeed : GlobalConfig.DEFAULT_RANDOM_SEED;
            gApp.gameSeedState = v.gameSeedState ? v.gameSeedState : '';
            gApp.difficulty = v.difficulty ? parseInt(v.difficulty) : 1;
            console.log("world data loaded.");
        });
    }

    _saveKF(slot){
        // if(slot===undefined || slot <-1 || slot >2) return;
        return localforage.setItem('dbKF'+slot,dbKF).then(function(){
            console.log("KF save done");
        }).catch(function(e){
            console.log(e);
        });
    }
    _savePlayer(slot){
        // if(slot===undefined || slot <-1 || slot >2) return;
        dbPlayer[0].lastSaveTime = GlobalFunction.getNowFormatDate();
        dbPlayer[0].difficulty = gApp.difficulty;
        return localforage.setItem('dbPlayer'+slot,dbPlayer).then(function(){
            console.log("Player save done: pos" + dbPlayer[pId].worldPosX + "," + dbPlayer[pId].worldPosY);
            console.log("Save time:"+dbPlayer[0].lastSaveTime);
            console.log(dbPlayer);
        }).catch(function(e){
            console.log(e);
        });
    }
    _saveItem(slot){
        // if(slot===undefined || slot <-1 || slot >2) return;
        return localforage.setItem('dbItem'+slot,dbItem).then(function(){
            console.log("Item save done");
        }).catch(function(e){
            console.log(e);
        });
    }
    _saveZone(slot){
        // if(slot===undefined || slot <-1 || slot >2) return;
        return localforage.setItem('dbZone'+slot,dbCity).then(function(){
            console.log("Zone save done");
        }).catch(function(e){
            console.log(e);
        });
    };
    _saveTrade(slot){
        // if(slot===undefined || slot <-1 || slot >2) return;
        return localforage.setItem('dbCityCargo'+slot,dbCityCargo).then(function(){
            console.log("cityCargo save done");
        }).catch(function(e){
            console.log(e);
        });
    }
    _saveWorld(slot){
        // if(slot===undefined || slot <-1 || slot >2) return;
        return localforage.setItem('gWorld'+slot,
            {
                'updateCounts':gTime.updateCounts,
                'gameTime':gTime.gameTime,          // 时间：小时
                'gameDay':gTime.gameDay,            // 时间：天
                'gameMonth':gTime.gameMonth,        // 时间：月
                'shareItemIdArr': gApp.shareItemIdArr,    // bank 中的共享物品
                'dfCityId': gApp.dfCityId,           // 杜甫所在城市
                'gameSeed': gApp.gameSeed,
                'difficulty': gApp.difficulty,
                'gameSeedState': SeedRandom.random.state()
            }
        ).then(function(){
            // console.log(SeedRandom.random.state());
            console.log("world save done");
        }).catch(function(e){
            console.log(e);
        });
    }

    // 启动 phaser 游戏，载入 世界 场景
    _enterWorld() {
        // worldScene = new WorldScene();   // 场景对象
        // phaserWorldConfig.scene = [worldScene];
        if(gApp.gameSeedState === undefined || gApp.gameSeedState === ''){
            SeedRandom.random = new Math.seedrandom(gApp.gameSeed,{state: true});
            // console.log("restore fail, new from game seed : "+ gApp.gameSeed);
            // console.log(SeedRandom.random.state());
        }else{
            SeedRandom.random = new Math.seedrandom('',{state: gApp.gameSeedState});
            // console.log("restore succ, load from state : "+ JSON.stringify(gApp.gameSeedState));
        }

        game = new Phaser.Game(phaserWorldConfig);
        gGui.flagGuiShow = false;

        // 我也不知道为什么，但是太他妈奇怪了，调用这个blur函数之后，fps就非常稳定，否则上蹿下跳。
        // 百思不得其解
        setTimeout(function (){
            $("#btnInputKeyEsc").blur();
        },1000);

        // gGui.enableKeys();
        // game = new Phaser.Game();
        // game.scene.add('WorldScene', WorldScene, true);
        // game.scene.start('WorldScene');

        // bug-fix: 20230430 - 改为了 boot pre 之后，解决没有进入world 就出现 hud bubble gui的问题
        // gTime.timerPauseFlag = false;
        // flagInGame = true;
        // dbPlayer[pId].isInWorldMap = true;
        // CharacterModel.calcTotalState();
        // gGui.drawHUD();
        // BubbleWidget.updateKFIcons();
        // BubbleWidget.showBubble();
        // BubbleWidget.buttonSetCoolDown("#all");
        // 随机数种子设定
    }

    openChest(zoneId){
        $(".modal").modal('hide');

        let intZoneId = parseInt(zoneId);
        if(isNaN(intZoneId) || (intZoneId <=0) || (dbPlayer[pId].chestList.indexOf(intZoneId)>=0)) {
            gGui.sysToast(globalStrings.APP_CHEST_EMPTY);
            return;
        }

        let zone = gDB.getCityById(intZoneId);
        // console.log(zone.zoneName);
        // bug-fix 2022.11.03 sceneArray 被convertTable存成了字符串的问题 "[{itemId,count},{itemId,count}]"
        let rewArr = Array.isArray(zone.sceneArray) ? zone.sceneArray : eval(zone.sceneArray);
        // bug-fix 20230511 行囊空间检查
        if(dbPlayer[pId].inventory.length + rewArr.length > inventorySize){
            gGui.sysToast(globalStrings.APP_CHEST_INV_FULL);
            return;
        }

        // let rewNameArr = [];
        dbPlayer[pId].chestList.push(intZoneId);
        for(let i=0;i<rewArr.length;i++){
            let item = gDB.getItemById(rewArr[i].itemId);
            let icon = ItemModel.getItemIcon(item.itemCate,rewArr[i].itemId);
            let gainResult = CharacterModel.gainItem(rewArr[i].itemId,rewArr[i].count);
            if(gainResult<0){
                // 折算成钱
                let amt = stringToNumber(item.itemPrice) * parseInt(rewArr[i].count) ;
                // gGui.sysToast("物品 [ "+item.itemName+" ] 折算为金钱:"+amt+"。");
                gGui.bootToast(globalStrings.APP_CHEST_FOUND+zone.zoneName+"! ","",icon +" : "+item.itemName + " x "+rewArr[i].count + ","+globalStrings.CONVERT_TO_MONEY+" : "+toReadableString(amt)+globalStrings.EOL);
                // console.log("物品 [ "+item.itemName+" ] 折算为金钱:"+amt+"。");
                CharacterModel.gainMoney(amt);
            }else{
                gGui.bootToast(globalStrings.APP_CHEST_FOUND+zone.zoneName+"! ","",icon +" : "+item.itemName + " x "+rewArr[i].count);
            }

            // rewNameArr.push(icon +"[ "+item.itemName + " ] x "+rewArr[i].count);

            // gGui.sysToast(rewNameArr.join(","), '');
        }
        // gGui.sysToast(rewNameArr.join(","), "获得 <"+zone.zoneName+"> ！");
    }

    enterZone(zoneId,npcId=0,bId=0,cId=0){
        $(".modal").modal('hide');
        let enterBy = dbPlayer[pId].moveOn;

        if(dbPlayer[pId].moveOn === 'horse'){
            BuffWidget.offHorse();
        }

        CharacterModel.calcTotalState();
        gGui.updateHUDSupply();
        let zone = gDB.getCityById(zoneId);
        if($.isEmptyObject(zone)){
            console.log("zone not found");
            return;
        }
        zoneId = parseInt(zoneId);
        npcId = parseInt(npcId);
        bId = parseInt(bId);
        cId = parseInt(cId);
        if(zone.zType === 'port' || zone.zType === 'city'){
            if (dbPlayer[pId].visitedCity.indexOf (zoneId) === -1) { dbPlayer[pId].visitedCity.push (zoneId); }
        }

        if(zone.zType === 'port' || zone.zType === 'city' || zone.zType ==='hill' || zone.zType ==='pass'){
            dbPlayer[pId].isInWorldMap = false;
            dbPlayer[pId].zoneId = zoneId;
            dbPlayer[pId].enterBy = enterBy;
            if(enterBy === 'ship'){
                dbPlayer[pId].shipPortId = zoneId;
                dbPlayer[pId].worldPosX = zone.waterExitX * 40 + 20;
                dbPlayer[pId].worldPosY = zone.waterExitY * 40 + 20;
            }
            gGui.updateHUDCordStr(zone.zoneName);
            console.log("entering zone: "+ zone.zoneName + " with zoneId="+zoneId);
            // display city gui and lock input
            gTime.pauseTime();
            game.scene.getScene("WorldScene").input.keyboard.resetKeys();
            game.scene.sleep('WorldScene');
            gGui.drawCity(zoneId);
            BubbleWidget.hideBubble();
            // 添加travel exp
            if(dbPlayer[pId].travelDistance > 0){
                let targetExp = Math.round(dbPlayer[pId].travelDistance / 10);
                if(targetExp>0){
                    CharacterModel.gainExp(Math.round(targetExp),'adventure');
                    gGui.sysToast(globalStrings.APP_AD_EXP+targetExp + globalStrings.EOL);
                    dbPlayer[pId].travelDistance = 0;
                }
            }
        }else if(zone.zType === 'dungeon'){
            if($("#battleModeModal").css("display") == "block"){
                return;
            }
            gApp._describeZone(zone,npcId,bId,cId);
            console.log("entering dungeon, id="+zoneId+", name="+zone.zoneName+", npcId="+npcId+",buildingId="+bId);
        }else{
            console.log("entering zone:"+zone.zoneName);
            // BubbleWidget.showBubble();
        }
        // gApp.saveGameAuto();
        let slot = gGui._getActualSaveSlot(-1)

        let kfPromise = gApp._saveKF(slot); // save KF data
        let playerPromise = gApp._savePlayer(slot); // save player data, with taskFlag
        let zonePromise = gApp._saveZone(slot); // save world data - 城市发展都
        let itemPromise = gApp._saveItem(slot);
        let cargoPromise = gApp._saveTrade(slot); // save trade data
        let worldPromise = gApp._saveWorld(slot); // 保存世界设置，例如：日期时间、杜甫所在城市、共享物品、游戏Seed等
        return Promise.all([kfPromise,playerPromise,zonePromise,itemPromise,cargoPromise,worldPromise]).then(function(v){
            console.log('auto save done');
            // gGui.saveGameResult();
            dbPlayer[pId].moveOn = 'foot';
            dbPlayer[pId].horseId = 0;
        });

    }

    _describeZone(zone,npcId=0,bId=0,cId=0){
        let zoneId = zone.zoneId;
        gTime.pauseTime();
        flagInGame = true;
        dbPlayer[pId].isInWorldMap = false;
        game.scene.pause('WorldScene');
        gGui.disableKeys();

        dbPlayer[pId].zoneId = zoneId;
        if(zoneId !== 115){
            dbPlayer[pId].worldPosX = zone.landExitX * 40 + 20;
            dbPlayer[pId].worldPosY = zone.landExitY * 40 + 20;
        }else{
            dbPlayer[pId].zoneId = cId;
        }
        let miniMapManager = MiniMapManager.getInstance();
        miniMapManager.hideMap();

        if(gApp.gameSettingObj.doNotAskBattleMode){
            if(gApp.gameSettingObj.quickBattleFlag){
                gApp._enterZoneQuickBattle(zone,npcId,bId,cId);
            }else{
                gApp._enterZoneDynamicScene(zone,npcId);
            }
        }else{
            let zoneDesc = "<p>"+zone.zoneName+"</p>";
            let mobs = ArmyModel.prepareMobObjList(zone.zoneId,npcId);
            let lvmin = 0; let lvmax = 0;
            $("#bmmSaveMode").prop("checked",gApp.gameSettingObj.doNotAskBattleMode);

            if(mobs.length > 0){
                lvmin = mobs[0].level; lvmax = mobs[0].level;
                for(let i=1;i<mobs.length;i++){
                    lvmin = Math.min(lvmin,mobs[i].level);
                    lvmax = Math.max(lvmax,mobs[i].level);
                }
                zoneDesc += "<p> "+globalStrings.MOB_LEVEL+": [" +lvmin + ","+lvmax+ "]</p>";
                zoneDesc += "<p> "+globalStrings.MOB_COUNT+": "+mobs.length+"</p>";
                zoneDesc += "<p> "+globalStrings.MOB_BOSS+": lv."+mobs[mobs.length-1].level + " " + mobs[mobs.length-1].name +" </p>";
            }else{
                zoneDesc += globalStrings.APP_ZONE_EMPTY;
            }
            $("#bmmZone").html(zoneDesc);
            $("#bmmPlayer").html("<p>"+dbPlayer[pId].name+"</p><p>"+globalStrings.CM_LV+dbPlayer[pId].level +" + " + dbPlayer[pId].paraLevel+"</p><p>"+globalStrings.HP+":"+dbPlayer[pId].curHP +" / "+ dbPlayer[pId].maxHP+"</p><p>"+globalStrings.MP+":"
                + dbPlayer[pId].curMP + " / "+ dbPlayer[pId].maxMP + "</p>"
            );

            $("#bmmBtnDynamicBattle").unbind("click").one("click",function(){
                gApp._enterZoneDynamicScene(zone,npcId);
            });
            $("#bmmBtnQuickBattle").unbind("click").one("click",function(){
                gApp._enterZoneQuickBattle(zone,npcId,bId,cId);
            });
            $("#bmmLeave").unbind("click").one("click",function(){
                gGui.leaveBattleModeModalV20240516(zone,npcId,bId,cId);
            });

            $("#battleModeModal").modal('show');
        }
    }

    _enterZoneQuickBattle(zone,npcId=0,bId=0,cId=0){
        let doNotAskAgain = $("#bmmSaveMode").prop('checked');
        if(doNotAskAgain){
            gGui._onSetDoNotAskBattleMode(true);
            gGui._onSetQuickBattle(true);
        }
        $("#chkDoNotAskBattleMode").trigger('change');

        let zoneId = zone.zoneId;
        $("#battleModeModal").modal('hide');
        // disable I(nventory) S(ship) etc
        // $("#btnInputKeyI").attr('disabled',true);        // I    = Inventory
        $("#btnInputKeyO").attr('disabled',true);        // O    = Ship / Cargo
        $("#btnInputKeyEsc").attr('disabled',true);        // ESC    = Menu
        $("#btnInputKeyC").attr('disabled',true);        // C    = Character
        $("#btnInputKeyK").attr('disabled',true);        // K    = Kongfu
        $("#btnInputKeyI").attr('disabled',true);        // I    = Inventory
        $(".modal").modal('hide');
        // game.scene.pause('WorldScene');
        // 如果是快速战斗模式，弹出快速战斗对话框(battleZoneId=zoneId)
        battleModal.initBattleZone(zone,npcId,bId);
        gGui.drawBattle();  // 显示 快速战斗对话框
        battleModal.updateLogs(1);
        BubbleWidget.hideBubble();
    }
    _enterZoneDynamicScene(zone,npcId){
        let doNotAskAgain = $("#bmmSaveMode").prop('checked');
        if(doNotAskAgain){
            gGui._onSetDoNotAskBattleMode(true);
            gGui._onSetQuickBattle(false);
        }
        $("#chkDoNotAskBattleMode").trigger('change');

        let zoneId = zone.zoneId;
        // instScene = new BFScene();
        console.log("enter dynamic scene triggered");
        gGui.enableKeys();

        // disable I(nventory) S(ship) etc
        // $("#btnInputKeyI").attr('disabled',true);        // I    = Inventory
        $("#btnInputKeyO").attr('disabled',true);        // O    = Ship / Cargo
        gGui.hideCity(zoneId);
        $("#btnInputKeyEsc").attr('disabled',true);        // ESC    = Menu
        // $("#btnInputKeyC").attr('disabled',true);        // C    = Character
        // $("#btnInputKeyJ").attr('disabled',true);        // J    = Journal
        // $("#btnInputKeyK").attr('disabled',true);        // K    = Kongfu

        // game.scene.getScene("WorldScene").player.selfDestroy();
        // if isDynamicScene(zoneId) === true

        // game.scene.getScene("WorldScene").scene.transition({ target: 'DynamicScene', duration: 2000 });
        game.scene.add('DynamicScene', DynamicScene, false,{"npcId":npcId,"zoneObj":zone});
        // 只有竞技场模式生效，指定zone中刷新的 npc -> 对应的mob
        game.scene.getScene('WorldScene').scene.start('DynamicScene');

        $("#battleModeModal").modal('hide');

        game.scene.getScene('WorldScene').scene.stop('WorldScene');

        // game.scene.getScene('WorldScene').scene.remove('WorldScene');
        // game.scene.getScene('WorldScene').scene.destroy();
        // game.scene.remove('WorldScene');
        // game.scene.destroy('WorldScene');
        gGui.drawHUD();
        BubbleWidget.updateKFIcons();   // 进入zone
        BubbleWidget.showBubble();
        BubbleWidget.buttonSetCoolDown("#all");
    }

    reEnterWorld(){
        game.destroy(true);
        $(".modal").modal('hide');
        // console.log("hide gui");
        // BubbleWidget.hideBubble();
        // gGui.hideHUD();
        gGui.domUIHide();
        // console.log("hide gui done");

        // let zone = gDB.getCityById(dbPlayer[pId].zoneId);
        dbPlayer[pId].zoneId = '0';
        // dbPlayer[pId].enterBy = '';
        // gGui.hideCity(dbPlayer[pId].zoneId);
        // let exitX = 422;
        // let exitY = 292;
        // if (zone.landExitX>0 && zone.landExitY>0){
        //     exitX = zone.landExitX;
        //     exitY = zone.landExitY;
        // }
        // dbPlayer[pId].x = exitX;
        // dbPlayer[pId].y = exitY;

        dbPlayer[pId].horseId = 0;  // 默认下马
        CharacterModel.calcTotalState();
        this._enterWorld();
        // console.log("leaving zone, re-enter world.");
        gGui.updateHUDSupply();

        $("#btnInputKeyEsc").attr('disabled',false);        // ESC    = Menu
        $("#btnInputKeyC").attr('disabled',false);        // C    = Character
        $("#btnInputKeyJ").attr('disabled',false);        // J    = Journal
        $("#btnInputKeyK").attr('disabled',false);        // K    = Kongfu
        $("#btnInputKeyI").attr('disabled',false);        // I    = Inventory
        $("#btnInputKeyO").attr('disabled',false);        // O    = Ship / Cargo

        BubbleWidget.showBubble();
        gTime.resumeTime();
        dbPlayer[pId].isInWorldMap = true;
    }
    leaveZone(moveBy = 'foot'){
        $(".modal").modal('hide');
        let zone = gDB.getCityById(dbPlayer[pId].zoneId);
        dbPlayer[pId].zoneId = '0';
        dbPlayer[pId].enterBy = '';
        gGui.hideCity(dbPlayer[pId].zoneId);
        let exitX = 422;
        let exitY = 292;
        if(moveBy === 'ship'){
            if (zone.waterExitX>0 && zone.waterExitY>0){
                exitX = zone.waterExitX;
                exitY = zone.waterExitY;
            }

        }else{
            if (zone.landExitX>0 && zone.landExitY>0){
                exitX = zone.landExitX;
                exitY = zone.landExitY;
            }
        }

        gTime.resumeTime();

        dbPlayer[pId].horseId = 0;  // 默认下马
        CharacterModel.calcTotalState();
        gGui.updateHUDSupply();
        dbPlayer[pId].isInWorldMap = true;
        game.scene.getScene("WorldScene").input.keyboard.resetKeys();
        game.scene.getScene("WorldScene").scene.wake("WorldScene");
        if(moveBy === 'ship'){
            game.scene.getScene("WorldScene").player.moveOn('ship');
            game.scene.getScene("WorldScene").playMusic("music_ship","theme");
        }else{
            game.scene.getScene("WorldScene").player.moveOn('foot');
            game.scene.getScene("WorldScene").playMusic();
        }
        game.scene.getScene("WorldScene").player.moveTo(exitX*40 + 20,exitY*40 + 20);
        console.log("leaving zone: "+ zone.zoneName);
        CharacterModel.calcMoveOnSpeed();
        BubbleWidget.showBubble();

    }
    leaveQuickBattle(moveBy = 'foot'){
        $(".modal").modal('hide');
        let zone = gDB.getCityById(dbPlayer[pId].zoneId);
        dbPlayer[pId].zoneId = '0';
        dbPlayer[pId].enterBy = '';
        let exitX = 422;
        let exitY = 292;
        if(moveBy === 'ship'){
            if (zone.waterExitX>0 && zone.waterExitY>0){
                exitX = zone.waterExitX;
                exitY = zone.waterExitY;
            }
        }else{
            if (zone.landExitX>0 && zone.landExitY>0){
                exitX = zone.landExitX;
                exitY = zone.landExitY;
            }
        }

        gTime.resumeTime();

        // game.scene.getScene("WorldScene").input.keyboard.resetKeys();
        game.scene.getScene("WorldScene").scene.resume("WorldScene");
        game.scene.getScene("WorldScene").playMusic();
        // game.scene.getScene("WorldScene").input.keyboard.resetKeys();
        // game.scene.getScene("WorldScene").player.moveOn(moveBy);
        // game.scene.getScene("WorldScene").player.moveTo(exitX*40,exitY*40 + 40);
        console.log("leaving zone: "+ zone.zoneName);

        BubbleWidget.updateKFIcons();
        BubbleWidget.showBubble();
        BubbleWidget.buttonSetCoolDown("#all");
        dbPlayer[pId].isInWorldMap = true;

        $("#btnInputKeyI").attr('disabled',false);        // I    = Inventory
        $("#btnInputKeyO").attr('disabled',false);        // O    = Ship / Cargo
        $("#btnInputKeyC").attr('disabled',false);        // C    = Character
        $("#btnInputKeyEsc").attr('disabled',false);        // C    = Character
        $("#btnInputKeyK").attr('disabled',false);        // C    = Character

        game.scene.getScene("WorldScene").player.moveOn('foot');
        dbPlayer[pId].horseId = 0;  // 默认下马
        CharacterModel.calcTotalState();
        game.scene.getScene('WorldScene').updateLayerCollision(dbPlayer[pId].moveOn);
        gGui.updateHUDSupply();
    }
    leaveQuickBattleToCity(){
        $(".modal").modal('hide');
        $("#btnInputKeyI").attr('disabled',false);        // I    = Inventory
        $("#btnInputKeyO").attr('disabled',false);        // O    = Ship / Cargo
        $("#btnInputKeyC").attr('disabled',false);        // C    = Character
        $("#btnInputKeyEsc").attr('disabled',false);        // C    = Character
        $("#btnInputKeyK").attr('disabled',false);        // C    = Character
        game.scene.getScene("WorldScene").scene.resume("WorldScene");
        let music_town = Math.random()>=0.5 ? "music_town" : "music_city";
        game.scene.getScene("WorldScene").playMusic(music_town);
    }

    getMerchantProfit(){
        let cid = dbPlayer[pId].zoneId;
        let zobj = gDB.getCityById(cid);
        if(zobj && zobj.fac_fc){
            let discount = zobj.fac_fc / 2500;
            let profit = GlobalConfig.MERCHANT_PROFIT - discount;
            profit = profit > 0 ? profit : 0;
            return profit.toFixed(4);
        }
        return GlobalConfig.MERCHANT_PROFIT;
    }


    cout(str){
        console.log(">> exec > "+str);
        console.log(dbKF);
    }

    /**
     * 用于解锁 困难模式
     */
    unlockGameDifficulty(){
        this.gameSettingObj.difficultyUnlockFlag = true;
        localforage.setItem('settings_difficultyUnlockFlag',true);
    }

    // 读取游戏相关设置：快速战斗、背景音乐、音效、音量
    loadGameSettings(){
        this.gameSettingObj.quickBattleFlag = false;    // 跳过战斗-快速战斗
        this.gameSettingObj.backgroundMusic = 100;     // 背景音乐
        this.gameSettingObj.gameSoundEffect = 100;     // 音效
        this.gameSettingObj.difficultyUnlockFlag = false; // 是否解锁了高级难度，默认没有解锁
        this.gameSettingObj.skipNewbieFlag = false;   // 跳过新手任务 - 直接30级别毕业，在平原，有船，马，5万启动资金
        this.gameSettingObj.newGameHelpFlag = true;   // 是否启用新手帮助，默认启用
        this.gameSettingObj.doNotAskBattleMode = false; // 是否询问战斗模式
        this.gameSettingObj.theme = 'assets/css/bootstrap.lumen.min.css';
        this.gameSettingObj.locale = 'cn';  // 默认语言中文 cn en
        let that = this;

        let p_quickBattleFlag = localforage.getItem('settings_quickBattleFlag').then(function(v){
            that.gameSettingObj.quickBattleFlag = !!v;  // default false
        });
        let p_backgroundMusic = localforage.getItem('settings_backgroundMusic').then(function(v){
            that.gameSettingObj.backgroundMusic = v ? v : 100;  // default 100
        });
        let p_gameSoundEffect = localforage.getItem('settings_gameSoundEffect').then(function(v){
            that.gameSettingObj.gameSoundEffect = v ? v : 100;  // default 100
            SOUND_EFFECT_VOLUME = that.gameSettingObj.gameSoundEffect / 100.0;
            if(document.getElementById("se_page") !== null){
                document.getElementById("se_page").volume = SOUND_EFFECT_VOLUME;
                document.getElementById("se_ding").volume = SOUND_EFFECT_VOLUME;
                document.getElementById("se_click").volume = SOUND_EFFECT_VOLUME;
                document.getElementById("se_drum").volume = SOUND_EFFECT_VOLUME;
            }
        });

        // add 20230906 - 难度解锁标记，新手帮助标记，跳过新手区任务标记
        let p_difficultyUnlockFlag = localforage.getItem('settings_difficultyUnlockFlag').then(function(v){
            that.gameSettingObj.difficultyUnlockFlag = !!v;  // default false
        });
        let p_newGameHelpFlag = localforage.getItem('settings_newGameHelpFlag').then(function(v){
            that.gameSettingObj.newGameHelpFlag = (v != false);  // default true
        });
        let p_skipNewbieFlag = localforage.getItem('settings_skipNewbieFlag').then(function(v){
            that.gameSettingObj.skipNewbieFlag = !!v;  // default false
        });
        let p_doNotAskBattleMode = localforage.getItem('settings_doNotAskBattleMode').then(function(v){
            that.gameSettingObj.doNotAskBattleMode = !!v;  // default false
        });

        let p_theme = localforage.getItem('settings_theme').then(function(v){
            that.gameSettingObj.theme = v;
        });
        let p_locale = localforage.getItem('settings_locale').then(function (v) {
            that.gameSettingObj.locale = v ? v : 'cn';   // default cn
        });

        Promise.all([p_quickBattleFlag,p_backgroundMusic,p_gameSoundEffect,p_difficultyUnlockFlag,p_newGameHelpFlag,p_skipNewbieFlag,p_doNotAskBattleMode,p_theme,p_locale]).then(function(){
            console.log("load game settings done.");
            // console.log(that.gameSettingObj);
            // change_skin(that.gameSettingObj.theme);
            setLocale(that.gameSettingObj.locale);
        });
    }

    // 新游戏开始时候的初始化配置
    newGameInitScript(){
        // 如果跳过新手区
        if(gApp.gameSettingObj.skipNewbieFlag){ // 跳过新手区
            if(pId===0){
                // 等级30
                CharacterModel.gainExp(GlobalConfig.EXP_NEWBIE);
                // 资金5万
                CharacterModel.gainMoney(50000);
                // 有一匹马
                CharacterModel.gainItem(2,1);
                // 位置在平原城外
                let zone = dbCity.find(x=>x.zoneCode.toUpperCase() === 'PINGYUAN');
                if(zone != null) {
                    game.scene.getScene("WorldScene").player.moveTo(zone.landExitX * 40 + 20, zone.landExitY * 40 + 20);
                    game.scene.getScene("WorldScene").updateEnvironment();
                }
                // 接了 41 粮食危机任务
                TaskModel.acceptTask(41);
                // +200 口粮 - 可以直接换船
                CharacterModel.gainItem(107,200);
            }
        }
    }
}();