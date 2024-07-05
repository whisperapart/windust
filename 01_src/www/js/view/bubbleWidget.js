/**
 * Created by jim on 2020/5/11.
 */
let btnTimerLeftArr = [0,0,0,0,0];
let btnTimerRightArr = [0,0,0,0,0];
const  BUBBLE_EXP_BAR_LENGTH = 72.6;    // vmin 与css 一致

class BubbleWidget{
    constructor(){
        $("#btnInputKey1").on('click',BubbleWidget.InputKey1);
        $("#btnInputKey2").on('click',BubbleWidget.InputKey2);
        $("#btnInputKey3").on('click',BubbleWidget.InputKey3);
        $("#btnInputKey4").on('click',BubbleWidget.InputKey4);
        $("#btnInputKeyRM").on('click',BubbleWidget.InputKeyRM);
        // $("#btnInputKeyLM").on('click',BubbleWidget.InputKey1);
        // 取消： 处理dynamic scene 中的 leftClick 事件
        $("#btnInputKeyC").on('click',BubbleWidget.InputKeyC);
        $("#btnInputKeyI").on('click',BubbleWidget.InputKeyI);
        $("#btnInputKeyJ").on('click',BubbleWidget.InputKeyJ);
        $("#btnInputKeyO").on('click',BubbleWidget.InputKeyO);
        $("#btnInputKeyK").on('click',BubbleWidget.InputKeyK);
        $("#btnInputKeyM").on('click',BubbleWidget.InputKeyM);
        $("#btnInputKeyEsc").on('click',BubbleWidget.InputKeyEsc);
    }

    static hpPercent(){
        $(".hp-circle-div div").css('height',(100*dbPlayer[pId].curHP/dbPlayer[pId].maxHP)+"%");
        $(".hp-circle-div-expand div").css('height',(100*dbPlayer[pId].curHP/dbPlayer[pId].maxHP)+"%");
    }
    static mpPercent(){
        let strNeili = 'mp-circle-div-yang';
        if(pId === 1) strNeili = 'mp-circle-div-yin';
        if(pId === 2) strNeili = 'mp-circle-div-he';
        $(".mp-circle-div>div,.mp-circle-div-expand>div").css('height',(100*dbPlayer[pId].curMP/dbPlayer[pId].maxMP)+"%")
            .removeClass('mp-circle-div-yang')
            .removeClass('mp-circle-div-yin')
            .removeClass('mp-circle-div-he')
            .addClass(strNeili);
    }
    static foodPercent(){
        let fp = dbPlayer[pId].food > 100 ? 100 : dbPlayer[pId].food;
        $(".food-circle-div div").css('height',fp+"%");
        $(".food-circle-div-expand div").css('height',fp+"%");
    }
    static expPercent(){
        let w = (dbPlayer[pId].nextExp <= 0 || dbPlayer[pId].curExp === -1) ? BUBBLE_EXP_BAR_LENGTH : BUBBLE_EXP_BAR_LENGTH*dbPlayer[pId].curExp/dbPlayer[pId].nextExp;
        $("#expBigDiv").css('width',(w.toFixed(2))+"vmin");
    }
    static learnExpPercent(){
        // console.log('calling lean exp progress');
        let w = (dbPlayer[pId].learningCurExp === -1 || dbPlayer[pId].learningNextExp === -1) ? BUBBLE_EXP_BAR_LENGTH : BUBBLE_EXP_BAR_LENGTH*dbPlayer[pId].learningCurExp/dbPlayer[pId].learningNextExp;
        $("#expLearnBigDiv").css('width',w.toFixed(2)+"vmin");
    }
    static updateBubble(){    //todo: player heal/reg 的时候，调用此方法更新gui, hud 也要更新
        BubbleWidget.hpPercent();
        BubbleWidget.mpPercent();
        BubbleWidget.foodPercent();
        BubbleWidget.expPercent();
        BubbleWidget.learnExpPercent();
    }
    static showBubble(){
        $("#bubbleWidget").show();
    }
    static hideBubble(){
        $("#bubbleWidget").hide();
    }
    // static async btnBlur(){
    //     $(".hot-key-item-div .btn").blur();
    // }

    static updateKFIcons(){
        // load Player KF-WG
        let p = dbPlayer[pId];
        let strDefault = '<i class="iconfont icon-swords1"></i>';
        // clear timeout
        for(let i=0;i<5;i++){
            clearTimeout(btnTimerLeftArr[i]);
            clearTimeout(btnTimerRightArr[i]);
        }
        // for to refresh
        CharacterModel.resetCoolDown(0);
        CharacterModel.resetCoolDown(1);
        CharacterModel.resetCoolDown(2);
        CharacterModel.resetCoolDown(3);
        CharacterModel.resetCoolDown(4);
        CharacterModel.resetGCD();
        BubbleWidget.buttonSetCoolDown("#all");

        for(let i=1;i<=4;i++){
            let bntInputKeyEle = $("#btnInputKey"+i);
            if((p.wgList[i-1] !== undefined) && (p.wgList[i-1].kfId>0)){
                // if(!p.wgList[i-1].kfObj){
                //     p.wgList[i-1].kfObj = KFModel.initWithLevel(p.wgList[i-1].kfId,p.wgList[i-1].kfLevel);
                //     p.cdList[i-1].max =  p.wgList[i-1].kfObj.wgeCd * 1000;
                // }
                let kf = p.wgList[i-1].kfObj;
                // console.log(kf);
                let strIcon = KFModel.getWgeIcon(kf.refObj.wgeType);
                let strKF = KFModel.getKFIcon(kf.dbObj.kfType);
                let strDbf = (kf.dbfObj !== undefined)? '<i class="'+KFModel.getDbfIcon(kf.dbfObj.dbfId)+'"></i>' : '';
                // console.log(kf.dbObj.kfType);
                let statCheck = CharacterModel.isWgUsableWithEquip(kf.dbObj.kfType);
                // console.log('stat Chekc= '+statCheck);
                bntInputKeyEle.html(strKF+strIcon+strDbf).attr('data-disabled',!statCheck ).attr('data-cd',kf.wgeCd).addClass("disabled").attr("disabled",true);
                if(statCheck){
                    bntInputKeyEle.html(strKF+strIcon+strDbf).attr('data-disabled',false).removeClass("disabled").attr("disabled",false);
                }
            }else{
                bntInputKeyEle.html(strDefault).attr('data-disabled',true).attr('data-cd',0).addClass("disabled").attr("disabled",true);
            }
        }
        // load Player KF-Heal
        if(p.zlKfId<=0){
            $("#btnInputKeyRM").html('<i class="iconfont icon-health2"></i>').attr('data-disabled',true).addClass("disabled").attr("disabled",true);
        }else{
            let kf = KFModel.initWithLevel(p.zlKfId,10);
            let strIcon = KFModel.getZlIcon(kf.dbObj.refId);
            $("#btnInputKeyRM").html(strIcon).attr('data-disabled',false).removeClass("disabled").attr("disabled",false);
        }
    }

    static InputKey1(){
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if($("#btnInputKey1").hasClass("disabled") || !flagInGame){
            gGui.playSoundEffect("fail");
            return;
        }

        let scene = game.scene.getScene("DynamicScene");
        if(scene == null) return;
        if(CharacterModel.isCDReady(0)){
            let wg = dbPlayer[pId].wgList[0];    // {kfId:28,kfLevel:1}
            let kfObj = KFModel.initWithLevel(wg.kfId,wg.kfLevel);
            let mana = kfObj.cost;
            if(dbPlayer[pId].curMP < mana) {
                gGui.playSoundEffect("fail");
                return {"reason":"内力不足","damage":-6};   // 冷却中
            }
            // console.log("key1 ready mana enough");
            CharacterModel.manaSelf(-mana);
            scene.player.attack(kfObj);  // 控制加入是否在空中的判断。空中无法攻击？
            // play sound Effect
            gGui.playSoundEffect("melee");
            CharacterModel.resetCoolDown(0);
            BubbleWidget.buttonSetCoolDown(0);
            $("#btnInputKey1").addClass("active");
        }else{
            gGui.playSoundEffect("fail");
        }
    }
    static InputKey2(){
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if($("#btnInputKey2").hasClass("disabled") || !flagInGame){
            gGui.playSoundEffect("fail");
            return;
        }
        let scene = game.scene.getScene("DynamicScene");
        if(scene == null) return;
        if(CharacterModel.isCDReady(1)){
            let wg = dbPlayer[pId].wgList[1];    // {kfId:28,kfLevel:1}
            let kfObj = KFModel.initWithLevel(wg.kfId,wg.kfLevel);
            let mana = kfObj.cost;
            if(dbPlayer[pId].curMP < mana){
                gGui.playSoundEffect("fail");
                return {"reason":"内力不足","damage":-6};   // 冷却中
            }
            CharacterModel.manaSelf(-mana);
            // console.log("fire with key 2");
            scene.player.attack(kfObj);
            gGui.playSoundEffect("melee");
            CharacterModel.resetCoolDown(1);
            BubbleWidget.buttonSetCoolDown(1);
            $("#btnInputKey2").addClass("active");
        }else{
            gGui.playSoundEffect("fail");
        }
    }
    static InputKey3(){
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if($("#btnInputKey3").hasClass("disabled") || !flagInGame){
            gGui.playSoundEffect("fail");
            return;
        }
        let scene = game.scene.getScene("DynamicScene");
        if(scene == null) return;
        if(CharacterModel.isCDReady(2)){
            let wg = dbPlayer[pId].wgList[2];    // {kfId:28,kfLevel:1}
            let kfObj = KFModel.initWithLevel(wg.kfId,wg.kfLevel);
            let mana = kfObj.cost;
            if(dbPlayer[pId].curMP < mana){
                gGui.playSoundEffect("fail");
                return {"reason":"内力不足","damage":-6};   // 冷却中
            }
            CharacterModel.manaSelf(-mana);
            scene.player.attack(kfObj);
            gGui.playSoundEffect("melee");
            CharacterModel.resetCoolDown(2);
            BubbleWidget.buttonSetCoolDown(2);
            $("#btnInputKey3").addClass("active");
        }else{
            gGui.playSoundEffect("fail");
        }
    }
    static InputKey4(){
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if($("#btnInputKey4").hasClass("disabled") || !flagInGame){
            gGui.playSoundEffect("fail");
            return;
        }
        let scene = game.scene.getScene("DynamicScene");
        if(scene == null) return;
        if(CharacterModel.isCDReady(3)){
            let wg = dbPlayer[pId].wgList[3];    // {kfId:28,kfLevel:1}
            let kfObj = KFModel.initWithLevel(wg.kfId,wg.kfLevel);
            let mana = kfObj.cost;
            if(dbPlayer[pId].curMP < mana){
                gGui.playSoundEffect("fail");
                return {"reason":"内力不足","damage":-6};   // 冷却中
            }
            CharacterModel.manaSelf(-mana);
            scene.player.attack(kfObj);
            gGui.playSoundEffect("melee");
            CharacterModel.resetCoolDown(3);
            BubbleWidget.buttonSetCoolDown(3);
            $("#btnInputKey4").addClass("active");
        }else{
            gGui.playSoundEffect("fail");
        }
    }
    static InputKeyRM(){
        if((game === undefined) ||(game.scene === undefined) ) return;  // 游戏尚未载入
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if(!dbPlayer[pId].isAlive) return;
        if(dbPlayer[pId].curHP < 0) return; // 已经死亡
        if($("#btnInputKeyRM").hasClass("disabled") || !flagInGame){
            gGui.playSoundEffect("fail");
            return;
        }

        let healResult = CharacterModel.cmdDoSkillHeal();

        if(healResult.value >=0) {
            BubbleWidget.buttonSetCoolDown(4);
            $("#btnInputKeyRM").addClass("active");
            // BubbleWidget.updateCoolDown();
            // 这里优先治疗，再播放动画，不存在打断
            gGui.playSoundEffect("succ");
            // 如果是在战斗场景，播放动画？
            let scene = game.scene.getScene("DynamicScene");
            if (scene != null) {
                scene.player.heal();
                scene.player.hud.addHurtInfo("+"+healResult.value);
            }
        }
        else{
            gGui.playSoundEffect("fail");
        }
        BubbleWidget.updateBubble();
        // BuffWidget.updateBuff();
        let buffWidget = BuffWidget.getInstance();
        buffWidget.updateWithCache();
        DeBuffWidget.guiUpdate();
    }
    static buttonSetCoolDown(intIdx){
        // 把除 strSelector 外的设置位 gcd
        // 把 strSelector 设置为 time
        BubbleWidget.setCoolDown(0,dbPlayer[pId].cdList[0].max - dbPlayer[pId].cdList[0].cur);
        BubbleWidget.setCoolDown(1,dbPlayer[pId].cdList[1].max - dbPlayer[pId].cdList[1].cur);
        BubbleWidget.setCoolDown(2,dbPlayer[pId].cdList[2].max - dbPlayer[pId].cdList[2].cur);
        BubbleWidget.setCoolDown(3,dbPlayer[pId].cdList[3].max - dbPlayer[pId].cdList[3].cur);
        BubbleWidget.setCoolDown(4,dbPlayer[pId].cdList[4].max - dbPlayer[pId].cdList[4].cur);
        // let strSelector = "#btnInputKey1"+(intIdx + 1);
        // switch(strSelector){
        //     case '#btnInputKey1':
        //         // cd = parseFloat($("#btnInputKey1").attr('data-cd'));
        //         BubbleWidget.setCoolDown(0,dbPlayer[pId].cdList[0].max);
        //         BubbleWidget.setCoolDown(1,dbPlayer[pId].cdList[1].max - dbPlayer[pId].cdList[1].cur);
        //         BubbleWidget.setCoolDown(2,dbPlayer[pId].cdList[2].max - dbPlayer[pId].cdList[2].cur);
        //         BubbleWidget.setCoolDown(3,dbPlayer[pId].cdList[3].max - dbPlayer[pId].cdList[3].cur);
        //         BubbleWidget.setCoolDown(4,dbPlayer[pId].cdList[4].max - dbPlayer[pId].cdList[4].cur);
        //         break;
        //     case '#btnInputKey2':
        //         // cd = parseFloat($("#btnInputKey2").attr('data-cd'));
        //         BubbleWidget.setCoolDown("#btnInputKey2",dbPlayer[pId].cdList[1].max);
        //         BubbleWidget.setCoolDown("#btnInputKey1",dbPlayer[pId].cdList[0].max - dbPlayer[pId].cdList[0].cur);
        //         BubbleWidget.setCoolDown("#btnInputKey3",dbPlayer[pId].cdList[2].max - dbPlayer[pId].cdList[2].cur);
        //         BubbleWidget.setCoolDown("#btnInputKey4",dbPlayer[pId].cdList[3].max - dbPlayer[pId].cdList[3].cur);
        //         BubbleWidget.setCoolDown("#btnInputKeyRM",dbPlayer[pId].cdList[4].max - dbPlayer[pId].cdList[4].cur);
        //         break;
        //     case '#btnInputKey3':
        //         // cd = parseFloat($("#btnInputKey3").attr('data-cd'));
        //         BubbleWidget.setCoolDown("#btnInputKey3",dbPlayer[pId].cdList[2].max);
        //         BubbleWidget.setCoolDown("#btnInputKey1",dbPlayer[pId].cdList[0].max - dbPlayer[pId].cdList[0].cur);
        //         BubbleWidget.setCoolDown("#btnInputKey2",dbPlayer[pId].cdList[1].max - dbPlayer[pId].cdList[1].cur);
        //         BubbleWidget.setCoolDown("#btnInputKey4",dbPlayer[pId].cdList[3].max - dbPlayer[pId].cdList[3].cur);
        //         BubbleWidget.setCoolDown("#btnInputKeyRM",dbPlayer[pId].cdList[4].max - dbPlayer[pId].cdList[4].cur);
        //         break;
        //     case '#btnInputKey4':
        //         // cd = parseFloat($("#btnInputKey4").attr('data-cd'));
        //         BubbleWidget.setCoolDown("#btnInputKey4",dbPlayer[pId].cdList[3].max);
        //         BubbleWidget.setCoolDown("#btnInputKey1",dbPlayer[pId].cdList[0].max - dbPlayer[pId].cdList[0].cur);
        //         BubbleWidget.setCoolDown("#btnInputKey2",dbPlayer[pId].cdList[1].max - dbPlayer[pId].cdList[1].cur);
        //         BubbleWidget.setCoolDown("#btnInputKey3",dbPlayer[pId].cdList[2].max - dbPlayer[pId].cdList[2].cur);
        //         BubbleWidget.setCoolDown("#btnInputKeyRM",dbPlayer[pId].cdList[4].max - dbPlayer[pId].cdList[4].cur);
        //         break;
        //     case '#btnInputKeyRM':
        //         break;
        //     default:    // reset all
        //         if(dbPlayer[pId].cdList[0].max > 0) { BubbleWidget.setCoolDown("#btnInputKey1",dbPlayer[pId].cdList[0].max);}
        //         if(dbPlayer[pId].cdList[1].max > 0) { BubbleWidget.setCoolDown("#btnInputKey2",dbPlayer[pId].cdList[1].max);}
        //         if(dbPlayer[pId].cdList[2].max > 0) { BubbleWidget.setCoolDown("#btnInputKey3",dbPlayer[pId].cdList[2].max);}
        //         if(dbPlayer[pId].cdList[3].max > 0) { BubbleWidget.setCoolDown("#btnInputKey4",dbPlayer[pId].cdList[3].max);}
        //         if(dbPlayer[pId].cdList[4].max > 0) { BubbleWidget.setCoolDown("#btnInputKeyRM",dbPlayer[pId].cdList[4].max);}
        //         break;
        // }

    }

    static InputKeyC(){     // character - 角色
        // if($("#btnInputKeyC").prop("disabled")) return;
        // if(flagInGame === false) return;
        // if(BattleModal.isShow()) return;
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if($("#btnInputKeyC").prop("disabled")  || flagInGame === false || BattleModal.isShow()) {
            gGui.playSoundEffect("fail");
            return;
        }
        gGui.drawCharacter();
        // $("#btnInputKeyC").blur();
    }
    static InputKeyI(){     // inventory - 行囊
        if(!game.scene.getScene("WorldScene")) return;
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if(!flagInGame || $("#btnInputKeyI").prop("disabled") || BattleModal.isShow() ){
            gGui.playSoundEffect("fail");
            return;
        }
        gGui.drawInventory();
        // $("#btnInputKeyI").blur();
    }
    static InputKeyJ(){     // journal - 任务日志
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if(!flagInGame || $("#btnInputKeyJ").prop("disabled") || BattleModal.isShow() ){
            gGui.playSoundEffect("fail");
            return;
        }
        gGui.drawJournal();
        // $("#btnInputKeyI").blur();
    }
    static InputKeyO(){     // ship - 载具
        if(!game.scene.getScene("WorldScene")) return;
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if(!flagInGame || $("#btnInputKeyO").prop("disabled") || BattleModal.isShow() ){
            gGui.playSoundEffect("fail");
            return;
        }
        gGui.drawShip("no","no");
        // $("#btnInputKeyO").blur();
    }
    static InputKeyK(){     // kongfu - 功夫
        // if(!game.scene.isActive("WorldScene")) return;
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if(!flagInGame || $("#btnInputKeyK").prop("disabled") || BattleModal.isShow() ){
            gGui.playSoundEffect("fail");
            return;
        }
        gGui.drawKongFu();
        // $("#btnInputKeyK").blur();
    }
    static InputKeyM(){     // map - 地图
        let miniMap = MiniMapManager.getInstance();
        if (MiniMapManager.isShow()){
            miniMap.hideMap();
            $("#btnInputKeyM").blur();
        }else{
            miniMap.showMap();
        }

    }
    static InputKeyEsc(){
        if(!game.scene.getScene("WorldScene")) return;
        if(game.scene.isVisible('preload') || game.scene.isVisible('boot')) return;
        if($("#btnInputKeyEsc").prop("disabled") || BattleModal.isShow()){
            gGui.playSoundEffect("fail");
            return;
        }
        gGui.onInGameMenu();
        // $("#btnInputKeyEsc").blur();
    }

    static setCoolDown(intId,time){
        let tmin = time/2000;
        let strId = (intId >=4) ? "#btnInputKeyRM" : "#btnInputKey"+(intId + 1);
        let strCD = '<div class="hot-key-cool-down"><div class="cooldown-half"><div class="cooldown-half-rotator cooldown-half-rotator-left"></div></div><div class="cooldown-half">' +
            '<div class="cooldown-half-rotator cooldown-half-rotator-right"></div></div></div>';
        $(strId).parent().find(".hot-key-cool-down").remove();
        clearTimeout(btnTimerRightArr[intId]);
        clearTimeout(btnTimerLeftArr[intId]);
        // $(".hot-key-item-div .btn").blur();
        $(strId).parent().append(strCD).find(".cooldown-half-rotator-right").offset();  // fuck ..... in order to force refreshing dom ... mother fuka..... cost me 3 hours!!!!!!
        $(strId).parent().find(".cooldown-half-rotator-right").css("transition","all "+tmin+"s linear 0s").css("transform","rotate(180deg)");
        btnTimerLeftArr[intId] = setTimeout( function(){
            $(strId).parent().find(".cooldown-half-rotator-left").css({
                "transform":"rotate(180deg)",
                "transition":"transform "+tmin+"s",
                "transition-timing-function":"linear"
            });
            // $(".hot-key-item-div .btn").blur();
            btnTimerRightArr[intId] = setTimeout( function(){
                $(strId).parent().find(".hot-key-cool-down").remove();
                $(strId).removeClass('active');
                // $(strId).blur();
            }, time/2 );
        }, time/2 );
    }

    // static updateCoolDown(){
    //     for(let i=0;i<dbPlayer[pId].cdList.length;i++){
    //         let id = i<4 ? "#btnInputKey"+(i+1) : "btnInputKeyRM";
    //         if(dbPlayer[pId].cdList[i].ready){
    //             $(id).blur();
    //             $(id).parent().find(".cooldown-half-rotator-left").css("transform","rotate(0deg)").css("opacity",0);
    //             $(id).parent().find(".cooldown-half-rotator-right").css("transform","rotate(0deg)").css("opacity",0);
    //             continue;
    //         }
    //         let middle = 0.5 * dbPlayer[pId].cdList[i].max
    //         if(dbPlayer[pId].cdList[i].cur < middle){
    //             let deg = 180 * dbPlayer[pId].cdList[i].cur / middle;
    //             $(id).parent().find(".cooldown-half-rotator-left").css("transform","rotate(0deg)").css("opacity",1);
    //             $(id).parent().find(".cooldown-half-rotator-right").css("transform","rotate("+deg+"deg)").css("opacity",1);
    //         }else{
    //             let deg = 180 * (dbPlayer[pId].cdList[i].max - dbPlayer[pId].cdList[i].cur) / middle;
    //             $(id).parent().find(".cooldown-half-rotator-right").css("transform","rotate(0deg)").css("opacity",0);
    //             $(id).parent().find(".cooldown-half-rotator-left").css("transform","rotate("+deg+"deg)").css("opacity",1);
    //         }
    //     }
    // }
}

bubbleWidget = new BubbleWidget();