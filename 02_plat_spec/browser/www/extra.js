function onGameGraphics(){
    gGui.playSoundEffect();
    $(".menuBtnClass").hide();
    gGui._animateHide("#menuBtnOptions");
    gGui._animateShow("#menuBtnOptionsGraphic");
}
function onGraphicsFullScreen(){
    window._cdvElectronIpc.setResolution(0);
    // localforage.setItem('game_resoltuion',0);
    if(!game) return;
    if(!game.scene) return;
    let worldScene = game.scene.getScene("WorldScene");
    if(worldScene){
        worldScene.flagReBindTap = true;
    }
}
function onGraphicsWindowF(){
    window._cdvElectronIpc.setResolution(9);    // 窗口 最大化
    // localforage.setItem('game_resoltuion',9);
    if(!game) return;
    if(!game.scene) return;
    let worldScene = game.scene.getScene("WorldScene");
    if(worldScene){
        worldScene.flagReBindTap = true;
    }
}
function onGraphicsWindowS(){
    window._cdvElectronIpc.setResolution(1);    // 640x400
    // localforage.setItem('game_resoltuion',1);
    if(!game) return;
    if(!game.scene) return;
    let worldScene = game.scene.getScene("WorldScene");
    if(worldScene){
        worldScene.flagReBindTap = true;
    }
}
function onGraphicsWindowM(){
    window._cdvElectronIpc.setResolution(2);
    // localforage.setItem('game_resoltuion',2);
    if(!game) return;
    if(!game.scene) return;
    let worldScene = game.scene.getScene("WorldScene");
    if(worldScene){
        worldScene.flagReBindTap = true;
    }
}
function onGraphicsWindowL(){
    window._cdvElectronIpc.setResolution(3);
    // localforage.setItem('game_resoltuion',3);
    if(!game) return;
    if(!game.scene) return;
    let worldScene = game.scene.getScene("WorldScene");
    if(worldScene){
        worldScene.flagReBindTap = true;
    }
}
function loadReslution(){
    localforage.getItem('game_resoltuion').then(function(v){
        let intV = isNaN(parseInt(v)) ? 0 : parseInt(v);
        switch (intV){
            case 1: onGraphicsWindowS();break;
            case 2: onGraphicsWindowM();break;
            case 3: onGraphicsWindowL();break;
            case 9: onGraphicsWindowF();break;
            default: onGraphicsFullScreen();break;
        }
        console.log("game resultuion ="+intV);
    });
}

$("#menuBtnGraphics").on("click",onGameGraphics);
$("#menuBtnGraphicsFullScreen").on("click",onGraphicsFullScreen);
$("#menuBtnGraphicsWindowF").on("click",onGraphicsWindowF);
$("#menuBtnGraphicsWindowS").on("click",onGraphicsWindowS);
$("#menuBtnGraphicsWindowM").on("click",onGraphicsWindowM);
$("#menuBtnGraphicsWindowL").on("click",onGraphicsWindowL);

// loadReslution();