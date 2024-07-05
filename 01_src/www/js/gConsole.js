let gConsole = new class{
    constructor(){
        // object properties
        this.cmd = '';
        $("#consoleDiv").hide();

        $(document).keydown(function(e) {
            if($("#consoleDiv").is(":hidden")){
                // if (e.which === 192) {       // `
                //     $("#consoleDiv").slideDown(50);
                // }
                if(gApp.flagInGameMenu && (e.which != 27)){
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                if(pId<0 || dbPlayer[pId] == undefined){ return; }
                if(!dbPlayer[pId].isAlive){ // 如果玩家死亡，只能输入 ESC 唤起菜单
                    if(e.which !== 27) return;
                }
                switch(e.which){
                    case 192:
                        if(GlobalConfig.DEV_CONSOLE){
                            $("#consoleDiv").slideDown(50);
                        }
                        break;  // `
                        // old way
                    // case 27: gGui.onInGameMenu();break;        // ESC  = Menu
                    // case 67: gGui.drawCharacter();break;        // C    = Character
                    // case 73: gGui.drawInventory();break;        // I    = Inventory
                    // case 75: gGui.drawKongFu();break;           // K    = KongFu
                    // case 79: gGui.drawShip("no","no");break;               // O    = Ship / Cargo
                        // use menu click
                    case 27:$("#btnInputKeyEsc").focus().click();break;     // ESC  = Menu
                    case 67: $("#btnInputKeyC").focus().click();break;       // C    = Character
                    case 73: $("#btnInputKeyI").focus().click();break;       // I    = Inventory
                    case 74: $("#btnInputKeyJ").focus().click();break;       // J    = Journal
                    case 75: $("#btnInputKeyK").focus().click();break;       // K    = KongFu
                    case 77: $("#btnInputKeyM").focus().click();break;       // M    = Map
                    case 79: $("#btnInputKeyO").focus().click();break;       // O    = Ship / Cargo
                    case 49: $("#btnInputKey1").focus().click();break;      // 1
                    case 50: $("#btnInputKey2").focus().click();break;      // 2
                    case 51: $("#btnInputKey3").focus().click();break;      // 3
                    case 52: $("#btnInputKey4").focus().click();break;      // 4
                    case 188: $("#miniMapZoomOut").focus().click();break;       // M <   = Map
                    case 190: $("#miniMapZoomIn").focus().click();break;       // M >   = Map
                    default:break;

                }
                // console panel is not active, do nothing
            }else{
                if(gApp.flagInGameMenu){
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (e.which === 192) {       // `
                    $("#consoleDiv").slideUp(50);
                } else if(e.which !== 13) { // not enter
                    if(e.which === 8 || e.which === 46){ // back key
                        $("#consoleDiv .input .right").text($("#consoleDiv .input .right").text().substring(0,$("#consoleDiv .input .right").text().length-1));
                    }else{
                        $("#consoleDiv .input .right").append(String.fromCharCode(e.which));
                    }
                    e.preventDefault();
                    e.stopPropagation();

                } else {    // enter
                    this.cmd = $("#consoleDiv .input .right").text();
                    // $("#consoleDiv .output").html( this.cmd );
                    $("#consoleDiv .input .right").text("");
                    gConsole.dispatcher(this.cmd);
                    e.preventDefault();
                    e.stopPropagation();
                }
                // event.preventDefault();  // disable scroll in console
            }
            // event.preventDefault();
        });

        $(document).mouseup(function(e){
            if(e.button == 2){
                // console.log("right mouse click");
                $("#btnInputKeyRM").focus().click();
            }
            // document.getElementById("se_click").volume = SOUND_EFFECT_VOLUME;
            document.getElementsByClassName("game-se-controls").volume = SOUND_EFFECT_VOLUME;
        })
    }

    // shared functions
    dispatcher(cmd){
        let fArr = cmd.trim(" ").split(" ");
        if(fArr.length >= 1){
            let fname = fArr.shift();
            console.log("cmd:"+fname);
            if( gConsole.__proto__.hasOwnProperty( fname )){
                eval("gConsole."+fname+"(fArr)");
            }else{
                $("#consoleDiv .output").html( "Invalid input: "+ cmd );
                this.cmd = '';
            }
        }else{
            $("#consoleDiv .output").html( "Console Command undefined: "+ cmd );
            gConsole.cmd = '';
        }
    }

    // ITEMADD 3 1
    ITEMADD(arg){
        if(Array.isArray(arg) && arg.length == 2){
            $("#consoleDiv .output").html( "> EXEC > ITEMADD > "+ arg.join(",") );
            let iid = isNaN(parseInt(arg[0]))? 0 : parseInt(arg[0]);
            let cnt = isNaN(parseInt(arg[1]))? 0 : parseInt(arg[1]);
            if(iid>0 && cnt >0){
                if(dbPlayer[pId].inventory.length >=64){
                    $("#consoleDiv .output").html( "> EXEC > ITEMADD > Inventory Full. ");
                }else{
                    dbPlayer[pId].inventory.push({id:iid,count:cnt});
                    $("#consoleDiv .output").html( "> ItemAdd > item: "+gDB.getItemNameById(iid)+" > mount: "+cnt+". ");
                    InventoryModal.drawItems();
                }
            }else{
                $("#consoleDiv .output").html( "> EXEC > ITEMADD > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > ITEMADD > Invalid Arg.");
        }

    }
    // ITEMNEW tier[2-7] neili[0-2] type[0,1,2,11,12,13,14,15]
    ITEMNEW(arg){
        if(Array.isArray(arg) && arg.length == 3){
            $("#consoleDiv .output").html( "> EXEC > ITEMNEW > "+ arg.join(",") );
            let tier = isNaN(parseInt(arg[0]))? 0 : parseInt(arg[0]);
            let neili = isNaN(parseInt(arg[1]))? 0 : parseInt(arg[1]);
            let type = isNaN(parseInt(arg[2]))? 0 : parseInt(arg[2]);
            if(tier>=0 && neili>=0 && type>=0){
                let x = ItemModel.dynamicItem(tier,neili,type);
                $("#consoleDiv .output").html( "> SUCC > Secret > "+tier+". ");
                console.log(ItemModel.toString(x));
                let y = ItemModel.identifyItem(x.itemId);
                dbItem.push(y);
                console.log(y);

            }else{
                $("#consoleDiv .output").html( "> EXEC > KFNEW > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > KFNEW > arg count err.");
        }
    }
    INVINFO(arg){
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > INVENTORY INFO > "+ arg.join(",") );
            let idx = isNaN(parseInt(arg[0]))? 0 : parseInt(arg[0]);
            if(idx>=0 && idx<64 ){
                let x = dbPlayer[pId].inventory[idx];
                let item = gDB.getItemById(x.id);
                $("#consoleDiv .output").html( "> SUCC > Item Info > "+JSON.stringify(item)+". ");
            }else{
                $("#consoleDiv .output").html( "> EXEC > INVENTORY INFO > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > INVENTORY INFO > arg count err.");
        }
    }

    // List Item for sell
    ITEMSHOP(arg){
        if(Array.isArray(arg) && arg.length == 2){
            $("#consoleDiv .output").html( "> EXEC > SHOP > "+ arg.join(",") );
            let cityId = isNaN(parseInt(arg[0]))? 0 : parseInt(arg[0]);
            let npcId = isNaN(parseInt(arg[1]))? 0 : parseInt(arg[1]);
            if(cityId>0 && npcId >0){
                // let arr = gDB.getItemForSell(cityId,npcId);
                // let ret = [];
                // for(let i=0;i<arr.length;i++){
                //     let iobj = gDB.getItemById(arr[i].itemId);
                //     iobj.devLevel = arr[i].devLevel;
                //     iobj.stock = arr[i].stock;
                //     ret.push(iobj);
                // }

                let arr = gDB.getItemDetailForSell(cityId,npcId);
                console.log(arr);
                $("#consoleDiv .output").html( "> SUCC > amount: "+arr.length+". ");
            }else{
                $("#consoleDiv .output").html( "> EXEC > ITEMSHOP > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > ITEMSHOP > Invalid Arg.");
        }



    }


    MONEYADD(arg){
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > MONEYADD > "+ arg.join(",") );
            let amt = isNaN(parseInt(arg[0]))? 0 : parseInt(arg[0]);
            if(amt>0){
                dbPlayer[pId].money += amt;
                $("#consoleDiv .output").html( "> MoneyAdd > money > amount: "+amt+". ");
            }else{
                $("#consoleDiv .output").html( "> EXEC > MONEYADD > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > MONEYADD > Invalid Arg.");
        }
    }
    EXPADD(arg){
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > EXPADD > "+ arg.join(",") );
            let amt = isNaN(parseInt(arg[0]))? 0 : parseInt(arg[0]);
            if(amt>0){
                CharacterModel.gainExp(amt);
                $("#consoleDiv .output").html( "> SUCC > Exp > amount: "+amt+". ");
            }else{
                $("#consoleDiv .output").html( "> EXEC > EXPADD > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > EXPADD > arg count err.");
        }
    }
    SKILLSET(arg){
        if(Array.isArray(arg) && arg.length == 2){
            $("#consoleDiv .output").html( "> EXEC > SKILLSET > "+ arg.join(",") );
            let amt = isNaN(parseInt(arg[1]))? 0 : parseInt(arg[1]);
            if(amt>0){
                switch(arg[0]){
                    case 'FIST': dbPlayer[pId].baseSkill.fist = amt;break;
                    case 'SWORD': dbPlayer[pId].baseSkill.sword = amt;break;
                    case 'MACHETE': dbPlayer[pId].baseSkill.machete = amt;break;
                    case 'SPEAR': dbPlayer[pId].baseSkill.spear = amt;break;
                    case 'EJECTION': dbPlayer[pId].baseSkill.ejection = amt;break;
                    case 'HEAL': dbPlayer[pId].baseSkill.heal = amt;break;
                    case 'ENCHANT': dbPlayer[pId].baseSkill.enchant = amt;break;
                    case 'SWIFT': dbPlayer[pId].baseSkill.swift = amt;break;
                    default:break;
                }
                CharacterModel.calcTotalState();
                BuffWidget.updateBuff();
                $("#consoleDiv .output").html( "> Done > "+arg[0]+" > value: "+amt+". ");
            }else{
                $("#consoleDiv .output").html( "> EXEC > SKILLSET > Invalid arg. ");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > SKILLSET > arg count err.");
        }
    }
    KFNEW(arg){
        if(Array.isArray(arg) && arg.length == 3){
            $("#consoleDiv .output").html( "> EXEC > KFNEW > "+ arg.join(",") );
            let tier = isNaN(parseInt(arg[0]))? 0 : parseInt(arg[0]);
            let neili = isNaN(parseInt(arg[1]))? 0 : parseInt(arg[1]);
            let type = isNaN(parseInt(arg[2]))? 0 : parseInt(arg[2]);
            if(tier>=0 && neili>=0 && type>=0){
                let x = KFModel.kfDynamic(tier,neili,type);
                dbKF.push(x);
                $("#consoleDiv .output").html( "> SUCC > KF > "+tier+". ");
                console.log(KFModel.toString(KFModel.initWithLevel(x.kfId,0)));
            }else{
                $("#consoleDiv .output").html( "> EXEC > KFNEW > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > KFNEW > arg count err.");
        }
    }

    MODALSHOW(arg){
        if(Array.isArray(arg)){
            $(".modal").modal('hide');
            if(arg.length == 1) {
                $("#consoleDiv .output").html("> EXEC > MODALSHOW > " + arg.join(","));
            }
            if(arg.length == 2){
                switch(arg[0]){
                    case 'PUZZLE':
                        // load puzzle by id
                        gGui.actHandler6(0,0,0,arg[1]);
                        break;
                    case 'PURCHASE':
                        gGui.actHandler9(0,0,arg[1]);
                        break;
                    default:
                        break;
                }
            }
            if(arg.length!=0){
                switch(arg[0]){
                    case 'CHARACTER':
                        gGui.drawCharacter();
                        break;
                    case 'BATTLE':
                        gGui.drawBattle();
                        break;
                    //case 'BUY':
                        //gGui.drawBuyModal();
                        //break;
                    case 'BANK':
                        gGui.actHandler12();
                    break;
                    default:
                        $("#"+arg[0].toLowerCase()+"Modal").modal('show');
                        break;
                }
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > ITEMADD > Invalid Arg.");
        }
    }
    MODALHIDE(arg){
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > MODALHIDE > "+ arg.join(",") );
            $("#"+arg[0].toLowerCase()+"Modal").modal('hide');
        }else{
            $("#consoleDiv .output").html( "> EXEC > ITEMADD > Invalid Arg.");
        }
    }

    CARGOSALE(arg){
        if(Array.isArray(arg) && arg.length == 3){
            $("#consoleDiv .output").html( "> EXEC > CARGOSALE > "+ arg.join(",") );

            gTrade.priceWaveOnSell(arg[0],arg[1],arg[2]);   // cargoId, quantity , cityId
            purchaseModal.drawPurchase();
        }else{
            $("#consoleDiv .output").html( "> EXEC > CARGOSALE > Invalid Arg.");
        }
    }

    // SETPOS 311 128
    SETPOS(arg){
        if(Array.isArray(arg) && arg.length == 2){
            $("#consoleDiv .output").html( "> EXEC > SETPOS > "+ arg.join(",") );
            let x = isNaN(parseInt(arg[0]))? 0 : parseInt(arg[0]);
            let y = isNaN(parseInt(arg[1]))? 0 : parseInt(arg[1]);
            if(x>0 && y >0){
                if(game.scene.getScene("WorldScene").player != null){
                    game.scene.getScene("WorldScene").player.moveTo(x,y);
                    game.scene.getScene("WorldScene").updateEnvironment();
                    $("#consoleDiv .output").html( "> Move Done  > x："+x+" > y："+y+". ");
                } else{
                    $("#consoleDiv .output").html( "> EXEC > SETPOS > Player not found. ");
                }
            }else{
                $("#consoleDiv .output").html( "> EXEC > SETPOS > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > SETPOS > arg count err.");
        }
    }
    JZONE(arg){
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > JZONE > "+ arg.join(",") );
            let zone = isNaN(arg[0]) ? dbCity.find(x=>x.zoneCode.toUpperCase() === arg[0]) : gDB.getCityById(parseInt(arg[0]));
            if(zone != null){
                game.scene.getScene("WorldScene").player.moveTo(zone.landExitX*40+20,zone.landExitY*40+20);
                game.scene.getScene("WorldScene").updateEnvironment();
                $("#consoleDiv .output").html( "> Move Done  > zone："+zone.zoneName+" id="+zone.zoneId);
            }else{
                $("#consoleDiv .output").html( "> EXEC > JZONE > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > JZONE > arg count err.");
        }
    }
    SPORT(arg){
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > SPORT > "+ arg.join(",") );
            let zone = isNaN(arg[0]) ? dbCity.find(x=>x.zoneCode.toUpperCase() === arg[0]) : gDB.getCityById(parseInt(arg[0]));
            if(zone != null){
                dbPlayer[pId].shipPortId = parseInt(zone.zoneId);
                $("#consoleDiv .output").html( "> Ship Move Done  > zone："+zone.zoneName+" id="+zone.zoneId);
            }else{
                $("#consoleDiv .output").html( "> EXEC > SPORT > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > SPORT > arg count err.");
        }
    }

    // 强制刷新item,用于修改了itemStatic之后，不重新开档，更新item
    // ` ITEMREINIT 1
    ITEMREINIT(arg){
        console.log(arg);
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > Item ReInit > "+ arg.join(",") );
            if((arg[0] === 'FORCE') || (arg === '1')){
                // 注意，如果 dbItemStatic 和 之前的 dbItem数量不一样，会有问题。
                // ~~逻辑：从dbItemStatic的最后一个，往前找匹配的。
                //   如果找到：dbItem对应的位置后面的，是dynamicItem
                //   如果找不到：这个dbItemStatic的物品是新增的，继续用前一个来尝试匹配
                //   找到对应的dynamic Item 位置之后，保存dynamicItem到数组
                //   dbItem = copy dbItemStatic
                //   dynamic 插入到 dbItem末尾，修改 itemid
                // 问题：已经装备（修行）的dynamic物品，编号会乱。~~
                // 算了，妈的，直接覆盖得了。
                for(let i=0;i<dbItemStatic.length;i++){
                    dbItem[i] = JSON.parse(JSON.stringify(dbItemStatic[i]));
                }
                $("#consoleDiv .output").html( "> ItemStatic reload done.");
            }else{
                $("#consoleDiv .output").html( "> EXEC > Item ReInit > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > Item ReInit > arg count err.");
        }
    }
    HELP(){
        let pArr = Object.getOwnPropertyNames(gConsole.__proto__);
        let dArr = [];
        for(let i=0;i<pArr.length;i++){
            if(  /[A-Z]/.test(pArr[i].charAt(0)) ){
                dArr.push(pArr[i]);
            }
        }
        dArr.sort();
        $("#consoleDiv .output").html('<pre>'+dArr.join('&#9;')+'</pre>');
    }

    WHOSYOURDADDY(){
        $("#consoleDiv .output").html( "> EXEC > whos your daddy " );
        CharacterModel.addSkill("FIST",100,125);
        CharacterModel.addSkill("SWORD",100,125);
        CharacterModel.addSkill("MACHETE",100,125);
        CharacterModel.addSkill("SPEAR",100,125);
        CharacterModel.addSkill("EJECTION",100,125);
        CharacterModel.addSkill("HEAL",100,125);
        CharacterModel.addSkill("ENCHANT",100,125);
        CharacterModel.addSkill("SWIFT",100,125);
        dbPlayer[pId].flagPara = true;
        dbPlayer[pId].flagArena = true;
        dbPlayer[pId].flagAshram = true;
        dbPlayer[pId].flagCow = true;
        dbPlayer[pId].flagEndless = true;
        dbPlayer[pId].flagJNC = true;
        CharacterModel.gainExp(9999999999);
        $("#consoleDiv .output").html( "> whos your daddy  done.");
    }

    UNLOCKCHAR(arg){
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > UnlockChar > "+ arg.join(",") );
            if((arg[0] === '2') || (arg[0] === '1')){
                let cid = parseInt(arg[0]);
                dbPlayer[cid].flagUnlock = true;
                $("#consoleDiv .output").html( "> char "+cid+" unlocked.");
            }else{
                $("#consoleDiv .output").html( "> EXEC > UNLOCK CHAR > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > UNLOCK CHAR > arg count err.");
        }
    }

    /**
     * 重置城市faction 情况，解决调整了城市初始faction后需要重新开档的问题
     * @param arg
     * @constructor
     */
    RESETFAC(arg){
        console.log(arg);
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > fac reset > "+ arg.join(",") );
            if((arg[0] === 'FORCE') || (arg === '1')){

                // for(let i=0;i<dbItemStatic.length;i++){
                //     dbItem[i] = JSON.parse(JSON.stringify(dbItemStatic[i]));
                // }
                for(let i=0;i<dbCity.length;i++){
                    dbCity[i].fac_fc = dtZone[i].fac_fc;
                    dbCity[i].fac_hd = dtZone[i].fac_hd;
                    dbCity[i].fac_ts = dtZone[i].fac_ts;
                    dbCity[i].fac_yw = dtZone[i].fac_yw;
                }
                $("#consoleDiv .output").html( "> fac reset reload done.");
            }else{
                $("#consoleDiv .output").html( "> EXEC > fac reset > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > fac reset > arg count err.");
        }
    }

    // 强制刷新zone信息,代码调试，用于修改了dtZone之后，不重新开档，更新dbCity
    // ` REINITZONE FORCE
    REINITZONE(arg){
        console.log(arg);
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > dbCity ReInit > "+ arg.join(",") );
            if((arg[0] === 'FORCE') || (arg === '1')){
                // 注意，如果 dbItemStatic 和 之前的 dbItem数量不一样，会有问题。
                // ~~逻辑：从dbItemStatic的最后一个，往前找匹配的。
                //   如果找到：dbItem对应的位置后面的，是dynamicItem
                //   如果找不到：这个dbItemStatic的物品是新增的，继续用前一个来尝试匹配
                //   找到对应的dynamic Item 位置之后，保存dynamicItem到数组
                //   dbItem = copy dbItemStatic
                //   dynamic 插入到 dbItem末尾，修改 itemid
                // 问题：已经装备（修行）的dynamic物品，编号会乱。~~
                // 算了，妈的，直接覆盖得了。
                gApp._initCity();
                $("#consoleDiv .output").html( "> dbCity reload done.");
            }else{
                $("#consoleDiv .output").html( "> EXEC > dbCity ReInit > Invalid Arg.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > dbCity ReInit > arg count err.");
        }
    }

    // 在dynamicScene，给player 添加 debuff，用于调试。
    // ` DEBUFFADD 815
    DEBUFFADD(arg){
        console.log(arg);
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > debuff add > "+ arg.join(",") );
                let sce = game.scene.getScene("DynamicScene");
                if(sce){
                    sce.player.deBuffManager.addOne(parseInt(arg[0]),sce.player);
                    $("#consoleDiv .output").html( ">  debuff add done.");
                }else{
                    $("#consoleDiv .output").html( ">  Faild to find scene.");
                }
        }else{
            $("#consoleDiv .output").html( "> EXEC >  debuff add > arg count err.");
        }
    }

    /** 重新初始化角色信息，用于修改了dbPlayer 之后 ，不重开游戏直接应用 REINITPLAYER 0/1/2 **/
    REINITPLAYER(arg){
        if(Array.isArray(arg) && arg.length == 1){
            $("#consoleDiv .output").html( "> EXEC > dbPlayer ReInit > "+ arg.join(",") );
            let iid = parseInt(arg[0]);
            if(isNaN(iid) || iid <0 || iid > 2 ){
                $("#consoleDiv .output").html( "> EXEC > dbPlayer ReInit > Invalid Arg.");
            }else{
                dbPlayer[iid] = deepClone(dtPlayer[iid]);
                dbPlayer[iid].flagUnlock = true;
                gGui._drawInGameMenu();
                $("#consoleDiv .output").html( "> dbPlayer "+ iid + " reload done.");
            }
        }else{
            $("#consoleDiv .output").html( "> EXEC > dbPlayer ReInit > arg count err.");
        }
    }

    /** 重新初始化基础武学信息，用于修改了dbKFStatic 之后 ，不重开游戏直接应用
     *  useage: REINITKF
     *  **/
    REINITKF(arg){
        $("#consoleDiv .output").html( "> EXEC > dbKF Static ReInit > "+ arg.join(",") );
        // dbKF = deepClone(dbKFStatic);
        for(let i=0;i<dbKFStatic.length;i++){
            dbKF[i] = deepClone(dbKFStatic[i]);
        }
        $("#consoleDiv .output").html( "> dbKF reload done.");
    }

    /** 重新初始化基港口货物信息，用于修改了dbCityCargo 之后 ，不重开游戏直接应用
     *  useage: REINITCARGO
     *  **/
    REINITCARGO(arg){
        $("#consoleDiv .output").html( "> EXEC > city cargo ReInit > "+ arg.join(",") );
        // dbKF = deepClone(dbKFStatic);
        dbCityCargo = deepClone(dtCityCargo);
        $("#consoleDiv .output").html( "> city cargo reload done.");
    }

    /**
     * 在 DynamicScene 让第一个怪物释放arg[0] = mobSkillId
     * @param arg [0,12] [111,117] [211,218] [311,318]
     * @constructor
     */
    MOBFIRE(arg){
        $("#consoleDiv .output").html( "> EXEC > Mob Fire > "+ arg.join(",") );
        let wgeId = parseInt(arg[0]);
        let sce = game.scene.getScene("DynamicScene");
        if(!sce) return;
        let mobCtrl = sce.army[0];
        let wgeObject = KFModel.initMobSkill(wgeId,mobCtrl.model.atk);
        mobCtrl.sprite.attack(wgeObject);  // // wgeType: point | line | cone | threeLines | area | arc | circle | double | explode
        console.log(wgeObject);
        $("#consoleDiv .output").html( "> EXEC > Mob Fire done.");
    }
    PLAYERFIRE(arg){
        let sampleKFObj = {
            "wgeDmg": 478,
            "wgeObj": {
                "wgeId": 2,
                "wgType": "fist",
                "wgeType": "line",
                "wgeDmg": 1290,
                "wgeDist": 585,
                "wgeRadius": 0,
                "wgeAniInvoke": 0,
                "wgeAniLast": 300,
                "cd": 2,
                "collateralProbability": 0.1667,
                "chainProbability": 1,
                "wgeDesc": "真气激射，对前方 {wgeDist} 米范围内的敌人造成 {wgeDmg} 伤害",
                "wgeCd": 1.33
            },
            // "kfId": 57,
            // "dbObj": {
            //     "kfId": 57,
            //     "kfTier": 6,
            //     "kfNeili": "阳刚",
            //     "kfType": "fist",
            //     "refId": 2,
            //     "wgeDmgR": 0.7965,
            //     "wgeDistR": 0.7308,
            //     "wgeRadiusR": 0.6666,
            //     "costR": 0.70225,
            //     "dbfId": 0,
            //     "dbfSpdR": 0.8953,
            //     "dbfHstR": 0.457,
            //     "dbfDurR": 0.636,
            //     "dbfDmgR": 0.8869,
            //     "kfName": "混元九通",
            //     "hitR": 0,
            //     "atkR": 0,
            //     "defR": 0,
            //     "crtR": 0,
            //     "crmR": 0,
            //     "parR": 0,
            //     "fdbR": 0,
            //     "fdhR": 0,
            //     "risR": 0,
            //     "lukR": 0,
            //     "hstR": 0,
            //     "dgeR": 0,
            //     "regR": 0,
            //     "HPMaxR": 0,
            //     "remR": 0,
            //     "MPMaxR": 0
            // },
            // "kfLevel": 10,
            // "learnFlag": true,
            // "refObj": {
            //     "wgeId": 2,
            //     "wgType": "fist",
            //     "wgeType": "line",
            //     "wgeDmg": 600,
            //     "wgeDist": 800,
            //     "wgeRadius": 0,
            //     "wgeAniInvoke": 0,
            //     "wgeAniLast": 300,
            //     "cd": 2,
            //     "collateralProbability": 0.1667,
            //     "chainProbability": 1,
            //     "wgeDesc": "真气激射，对前方 {wgeDist} 米范围内的敌人造成 {wgeDmg} 伤害"
            // },
            //
            // "wgeDist": 585,
            // "wgeRadius": 0,
            // "wgeDmgActive": 1290,
            // "wgeCd": 1.33,
            // "cost": 106,

            "intIndexInArmy": -1
        };

        $("#consoleDiv .output").html( "> EXEC > Player Fire > "+ arg.join(",") );
        let wgeId = parseInt(arg[0]);
        let sce = game.scene.getScene("DynamicScene");
        if(!sce) return;
        let wgeObj = gDB.getWGEById(wgeId);
        if(!wgeObj) return;
        sampleKFObj.wgeObj = deepClone(wgeObj);
        let ps = sce.player;
        ps.attack(sampleKFObj);
        // let wgeObject = KFModel.initWithLevel();
        // mobCtrl.sprite.attack(wgeObject);  // // wgeType: point | line | cone | threeLines | area | arc | circle | double | explode
        // console.log(wgeObject);
        // wgeGroup.fire(this.sprite.body.center.x + this.face * 0.5 * this.sprite.frame.halfWidth,this.sprite.body.center.y,'mob',(this.face > 0),dbPlayer[pId].tint,this.kfObj.wgeObj,this.kfObj);
        $("#consoleDiv .output").html( "> EXEC > Player Fire done.");
    }

    DUMP(){
        let dump = {};
        dump.version = GlobalConfig.BUILD_VERSION;
        dump.kf = dbKF;

        dbPlayer[0].lastSaveTime = GlobalFunction.getNowFormatDate();
        dbPlayer[0].difficulty = gApp.difficulty;
        dump.player = dbPlayer;

        dump.zone = dbCity;
        dump.item = dbItem;
        dump.trade = dbCityCargo;

        dump.world = {
            'updateCounts':gTime.updateCounts,
            'gameTime':gTime.gameTime,          // 时间：小时
            'gameDay':gTime.gameDay,            // 时间：天
            'gameMonth':gTime.gameMonth,        // 时间：月
            'shareItemIdArr': gApp.shareItemIdArr,    // bank 中的共享物品
            'dfCityId': gApp.dfCityId,           // 杜甫所在城市
            'gameSeed': gApp.gameSeed,
            'difficulty': gApp.difficulty,
            'gameSeedState': SeedRandom.random.state()
        };
        let strDump = JSON.stringify(dump);
        console.log(strDump);
        // $("#consoleDiv .output").html(strDump);
        let tmpLink = document.createElement("a");
        let exportName = dbPlayer[0].lastSaveTime;
        let blob = new Blob([strDump],{type:"text/json"});
        // const downloadFile = new File([strDump],exportName+".txt","text/plain");
        let objectUrl = URL.createObjectURL(blob);
        tmpLink.href = objectUrl;
        tmpLink.download = exportName+".json";
        tmpLink.click();
        // document.body.removeChild(tmpLink);
        tmpLink.remove();
        URL.revokeObjectURL(objectUrl);
    }


    // alias
    MF(arg){
        gConsole.MOBFIRE(arg);
    }

    PF(arg){
        gConsole.PLAYERFIRE(arg);
    }

    /* utils */

}();