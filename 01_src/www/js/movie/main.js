let timeline = [];
// let charArr = [];
// let rainDropItv = [];

let bubbleManager = BubbleManager.getInstance();
bubbleManager.start();
let flyingBirdManager = FlyingBirdManager.getInstance();
flyingBirdManager.start();

let charRainManager = CharRainManager.getInstance();
let nlIcon = '<i class="iconfont icon-FontAwesomemoonsolid"></i>';
let kfIcon = '<i class="iconfont icon-speed1"></i>';
let kfDuration = 10000;
charRainManager.start(kfDuration,"自创武学",nlIcon,kfIcon);

let rippleManager = RippleManager.getInstance();
setTimeout(rippleManager.start,kfDuration-1000);
// rippleManager.start();

// roll background image
setTimeout(function(){
    $("#stage_1_rain").hide();
    $("#stage_1_scroll_wrap").hide();
    $("#stage_1_fly").hide();
    $("#stage_1_bg img").css("left","-1920px");
},kfDuration);

setTimeout(function(){
    $("#stage_1_bg img").css("left","-3840px");
},kfDuration+3000);