document.oncontextmenu = function() {return false;}

function initModalAnimate(){
    let animate = GlobalConfig.TAP_DEVICE ? 'slideInDown' : 'zoomIn';
    $(".modal").on('show.bs.modal',function (e) {
        $(".modal .modal-dialog").attr('class','modal-dialog '+animate+' animated');
        gGui.flagGuiShow = true;
    });
    $(".modal").on('hide.bs.modal',function (e) {
        $(".modal .modal-dialog").attr('class','modal-dialog slideOutDown animated');
        gGui.flagGuiShow = false;
    });
}
function initGraphicsOption(){
    if(GlobalConfig.TAP_DEVICE) $("#menuBtnGraphics").remove();
}
function initOrentation(){
    if(GlobalConfig.TAP_DEVICE) screen.orientation.lock('landscape');
}
function tapAvatarHandler(){
    if(GlobalConfig.TAP_DEVICE){
        $("#hudDiv").on("click",function(){
            $("#hudDiv img").toggleClass('circle-div-expand').toggleClass('circle-div');
            $("#hpCircleDiv").toggleClass('hp-circle-div-expand').toggleClass('hp-circle-div');
            $("#mpCircleDiv").toggleClass('mp-circle-div-expand').toggleClass('mp-circle-div');
            $("#foodCircleDiv").toggleClass('food-circle-div-expand').toggleClass('food-circle-div');
        });
    }
}

function initVersion(){
    $("#pVersion").html("Version:"+GlobalConfig.GAME_VERSION+"."+GlobalConfig.BUILD_VERSION);
}

$(document).ready(function(){
    initVersion();
    initModalAnimate();
    initGraphicsOption();
    tapAvatarHandler();
    // getLocale();
    // initOrentation();
    // glossary
    // apply translations


    gGui.drawMainMenu();
    let bubbleManager = BubbleManager.getInstance();
    bubbleManager.start();
    let flyingBirdManager = FlyingBirdManager.getInstance();
    flyingBirdManager.start();
    $(window).resize(function(){
        console.log("index resize cb");
        if(!game) return;
        if(!game.scene) return;
        let worldScene = game.scene.getScene("WorldScene");
        if(worldScene){
            worldScene.flagReBindTap = true;
        }
    });
});

/***
 * 用于国际化本地化的文本编辑和处理
 * 2024.04.12
 */

// used for one time only, do not need to run again, 除非真的知道自己在干嘛。
function dt_zone_i18n(){
    return; // 除非真的知道自己在干嘛
    let dt_zone_loc = [];
    let loc_dic = globalStringCn;
    for(let i=0;i<dtZone.length;i++){
        let tmp_zone = dtZone[i];
        let dic_key = 'ZONE_NAME_'+(tmp_zone.zoneCode.toUpperCase());
        let dic_value = tmp_zone.zoneName;
        loc_dic[dic_key] = dic_value;
        tmp_zone.zoneName = dic_key;
        dt_zone_loc.push(tmp_zone);
    }
    console.log(dt_zone_loc);
    console.log(loc_dic);
}

