/**
 * CharRain Manager - char rain animation
 * Jim Dai 2023.10.13
 */

class CharRainManager {
    constructor(conf) {
        this.data = {
            'row': 10,                  // 行数
            'col': 15,                  // 列数
            'strTitle':'',
            'strNLIcon':'',
            'strKFIcon' : '',
            'isScrollTitleShow':false,
            // 'charW' : 50,               // 单个字符div宽度, 单位 px
            // 'charH' : 50,               // 单个字符div长度, 单位 px
            // 'fontSize' : 32,            // 字体大小，单位 px
            'isPlaying' : false,        // 标记，是否正在播放动画
            'mainItv' : -1,             // 主循环 的 handler
            'duration' : 10000,         // 播放时长，毫秒
            'timelineObj' : {},         // 包括播放时间节点数组，根据 duration 控制
            'msPlayed' : 0,             // 已循环播放的时间 ms，用于清除本轮播放
            'fps': 60,                  // fps
            'msIntval' : 15,            // 默认刷新间隔，在 init 的时候根据fps 计算。
            'charArr' : [],             // 所有会出现的字符数组
            'rainDropItv' : []          // 字符刷新的intval 的handler 数组
        };
        if(conf){
            this.data.row = conf.row ? conf.row : this.data.row;
            this.data.col = conf.col ? conf.col : this.data.col;
        }

        this._initCharData();
        // this._initHTML();
        this.data.msIntval = 1000 / this.data.fps;
        this.instance = null;
    }

    static eleWrapId = "stage_1_rain";

    static getInstance(conf) {
        if (this.instance) {
            return this.instance;
        }
        return this.instance = new CharRainManager(conf);
    }

    static isShow() {
        return ($("#" + CharRainManager.eleWrapId).css('display') === 'block');
    }
    static isDivShow(id){
        return ($("#" + id).css('display') === 'block');
    }
    static randSaving(rate){
        return (Math.random() < rate);
    }

    _charRainJoinArr(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].length > 1) {
                this.data.charArr.concat(arr[i].split(''));
            } else {
                this.data.charArr.push(arr[i]);
            }
        }
    }
    _initCharData() {
        this._charRainJoinArr(GlobalConfig.NG_PRE_ARR);
        this._charRainJoinArr(GlobalConfig.NG_SUF_ARR);
        this._charRainJoinArr(GlobalConfig.WG_PRE_ARR);
        this._charRainJoinArr(GlobalConfig.WG_SUF_ARR);
        this._charRainJoinArr(GlobalConfig.WG_KEY_ARR[0]);
        this._charRainJoinArr(GlobalConfig.WG_KEY_ARR[1]);
        this._charRainJoinArr(GlobalConfig.WG_KEY_ARR[2]);
        this._charRainJoinArr(GlobalConfig.WG_KEY_ARR[3]);
        this._charRainJoinArr(GlobalConfig.WG_KEY_ARR[4]);
        this._charRainJoinArr(GlobalConfig.QG_PRE_ARR);
        this._charRainJoinArr(GlobalConfig.QG_SUF_ARR);
        this._charRainJoinArr(GlobalConfig.QG_KEY_ARR);
    }
    _initTimeline(){
        this.data.timelineObj = {};
        this.data.timelineObj.playIdx = 0;
        this.data.timelineObj.arrTimeline = [];
        for(let i=0;i<20;i++){
            let ph = {'ts': this.data.duration * 0.05 * i, 'isTrigger':false};
            this.data.timelineObj.arrTimeline.push(ph);
        }
    }
    _clearTimeline(){
        this.data.timelineObj = {};
    }
    setDuration(msDuration){
        this.data.duration = msDuration;
        if(msDuration > 0){
            this._initTimeline();
        }else{
            this._clearTimeline();
        }
    }

    charRainDrop(id) {
        // intv 方法，好处是一直存在或者可以控制停止，问题是字符刷新的间隔固定。
        let rate = 1000 + Math.ceil(Math.random() * 1000);
        let itv = setInterval(function () {
            let ch = charRainManager.data.charArr[Math.floor(Math.random() * charRainManager.data.charArr.length)];
            $("#" + id).html(ch);
        }, rate);
        this.data.rainDropItv.push(itv);

        // timeout 方法。好处是每个字符的间隔不固定。
        // charRainDropRefresh(id,0);
    }

    charRainDropRefresh(id, i) {
        if (i < 10) {
            let rate = i * 200 + Math.ceil(Math.random() * 400);
            let ch = charRainManager.data.charArr[Math.floor(Math.random() * charRainManager.data.charArr.length)];
            $("#" + id).html(ch);
            setTimeout(charRainManager.charRainDropRefresh, rate, id, i + 1);
        }
    }

    _initHTML(){
        let str = "";
        for (let i = 0; i < this.data.col; i++) {
            str += '<div class="rain_drop_col">';
            for (let j = 0; j < this.data.row; j++) {
                str += '<div id="rain_drop_c_' + i + '_r_' + j + '" class="rain-drop"></div>';
            }
            str += "</div>";
        }
        $("#"+CharRainManager.eleWrapId).html(str);
        $("#stage_1_scroll").html('');
        // $("#stage_1_scroll_wrap").show();
    }

    _startCharRain(){
        for (let i = 0; i < this.data.row; i++) {
            for (let j = 0; j < this.data.col; j++) {
                let id = "rain_drop_c_" + j + "_r_" + i;
                this.charRainDrop(id);
            }
        }
    }
    _endCharRain(){
        for(let i=0;i<this.data.rainDropItv.length;i++){
            clearInterval(this.data.rainDropItv[i]);
        }
        this.data.rainDropItv = [];
        $("#"+CharRainManager.eleWrapId).html();
    }

    start(msDuration,strTitle,strNLIcon,strKFIcon){
        // let charRainManager = CharRainManager.getInstance();
        this._initHTML();
        let scaleX = $(document).width() / 1920;
        // let dH = $(document).height();
        // let top = (dH * 0.5 - 220) * scaleX;
        $("#"+CharRainManager.eleWrapId).css("transform","scale("+scaleX+")")
            // .css("top",top+"px")
            .show();
        $("#stage_1_scroll_wrap").css("transform","scale("+scaleX+")");
        $(".menu_logo_class").hide();
        $("#mapDiv").show();
        $("#cityDiv").hide();
        $("#hudDiv").hide();
        $("#buffWidget").hide();
        $("#miniMapDiv").hide();
        $(".modal-backdrop").hide();

        // if(MeditationModal.isShow()){
        $(MeditationModal.strSelector).css("visibility","hidden");
        // }

        if(this.data.isPlaying){
            if(this.data.msPlayed >= this.data.duration ){
                this.setDuration(0);
                clearInterval(this.data.mainItv);
                this.data.msPlayed = 0;
                this.data.isPlaying = false;
            }
        }else{
            charRainManager._startCharRain();
            this.setDuration(msDuration);
            this.data.strTitle = strTitle;
            this.data.strNLIcon = strNLIcon;
            this.data.strKFIcon = strKFIcon;
            this.data.isPlaying = true;
            this.data.mainItv = setInterval(charRainManager.update,this.data.msIntval);
        }
    }
    end(){
        if(this.data.isPlaying){
            this.setDuration(0);
            this.data.isPlaying = false;
            this.data.msPlayed = 0;
            clearInterval(this.data.mainItv);
            this._endCharRain();
            $(MeditationModal.strSelector).css("visibility","visible");
            $(".menu_logo_class").show();
            $("#mapDiv").hide();
            $("#cityDiv").show();
            $("#hudDiv").show();
            $("#buffWidget").show();
            $("#miniMapDiv").show();
            $(".modal-backdrop").show();
            $("#"+CharRainManager.eleWrapId).hide().html('');
            this.data.isScrollTitleShow = false;
            // $(".rain-drop").css("visibility", "visible");
            // $(".rain_drop_col").css("height","434px").show();
            // $(".rain_drop_col").css("opacity", 1);
        }
    }

    showRainDrop(intRow,intCol){
        $("#rain_drop_c_" + intCol + "_r_" + intRow).css("visibility", "visible");
    }
    showRainDropAll(){
        $(".rain-drop").css("visibility", "visible");
    }
    hideRainDrop(intRow,intCol){
        $("#rain_drop_c_" + intCol + "_r_" + intRow).css("visibility", "hidden");
    }
    hideRainDropAll(){
        $(".rain-drop").css("visibility", "hidden");
    }
    hideRainField(){
        $(".rain_drop_col").hide();
    }

    timelineCheck(ts){
        // console.log("timeline check ts =" + ts);
        if(this.data.timelineObj && this.data.timelineObj.arrTimeline){
            for(let i=this.data.timelineObj.playIdx;i<this.data.timelineObj.arrTimeline.length;i++){
                if((ts >= this.data.timelineObj.arrTimeline[i].ts) && (!this.data.timelineObj.arrTimeline[i].isTrigger)){
                    this.data.timelineObj.arrTimeline[i].isTrigger = true;
                    this.data.timelineObj.playIdx = i;
                    this.timelineHandler(i);
                }
            }
        }
    }
    timelineHandler(idx){
        // console.log("timeline-handler idx="+idx);
        switch (idx){
            case 0:$(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.05)) $(this).css('visibility','visible'); });break;
            case 1:$(".rain_drop_col").css("border-color","#EB686410");break;
            case 2:
                $(".rain_drop_col").css("border-color","#EB686430");
                $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.2))  $(this).css('visibility','visible'); }); break;
            case 3: $(".rain_drop_col").css("border-color","#EB686450");break;
            case 4:
                $(".rain_drop_col").css("border-color","#EB686470");
                $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.5)) $(this).css('visibility','visible'); }); break;
            case 5: $(".rain_drop_col").css("border-color","#EB686490");break;
            case 6:
                $(".rain_drop_col").css("border-color","#EB6864A0");
                $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.9)) $(this).css('visibility','visible'); }); break;
            case 7: $(".rain_drop_col").css("border-color","#EB6864D0");break;
            case 8:
                $(".rain_drop_col").css("border-color","#EB6864");
                charRainManager.showRainDropAll(); break;
            // case 5: break;
            case 10: $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.1)) $(this).css('visibility','hidden'); }); break;
            case 11: $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.1)) $(this).css('visibility','hidden'); }); break;
            case 12: $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.2)) $(this).css('visibility','hidden'); }); break;
            case 13: $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.2)) $(this).css('visibility','hidden'); }); break;
            case 14: $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.48)) $(this).css('visibility','hidden'); }); break;
            case 15: $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.48)) $(this).css('visibility','hidden'); }); break;
            case 16: $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.66)) $(this).css('visibility','hidden'); }); break;
            // case 9: $(".rain-drop").each(function (){ if(CharRainManager.randSaving(0.8)) $(this).css('visibility','hidden'); }); break;
            case 18: charRainManager.hideRainDropAll(); break;
            default: break;
        }
    }

    rainDropHeightCheck(ts){
        if(this.data.duration <=0 ) return;
        let p = ts / this.data.duration;
        if(p>=0.5){
            let h = $(".rain_drop_col").height();
            let t = 434;
            let opc = (this.data.duration - ts) / 4000;
            opc = opc < 0 ? 0 : opc;
            $(".rain_drop_col").css("opacity", opc);

            if (h <= 80) {
                // if(!CharRainManager.isDivShow("stage_1_scroll_wrap")){
                // console.log("height check < 80");
                if(!this.data.isScrollTitleShow){
                    this.scrollTitleShow(this.data.strTitle,this.data.strNLIcon,this.data.strKFIcon);
                    $("#stage_1_scroll_wrap").show();
                    $("#stage_1_scroll").show();
                    $(".rain_drop_col").hide();
                    setTimeout(function (){
                        charRainManager.scrollRoll();
                    },2400);
                }

            } else {
                $(".rain_drop_col").css("height", h - 1).css("margin-top", (t - h) / 2);
            }
        }
    }

    scrollRoll_ori(){
        // $("#stage_1_scroll").addClass("roll-div");
        $("#stage_1_scroll_wrap").addClass("ani-small-div");
        // $("#stage_1_scroll_wrap").addClass("ani-big-div");
        setTimeout(function (){
            // $("#stage_1_scroll").removeClass("roll-div");
            $("#stage_1_scroll_wrap").removeClass("ani-small-div").hide();
        },900);
    }

    scrollRoll(){
        // $("#stage_1_scroll").addClass("roll-div");
        $("#stage_1_scroll_wrap").addClass("animated zoomOutDown fast").show();
        // $("#stage_1_scroll_wrap").addClass("ani-big-div");
        setTimeout(function (){
            // $("#stage_1_scroll").removeClass("roll-div");
            $("#stage_1_scroll_wrap").removeClass("animated zoomOutDown fast").hide();
        },900);
    }


    scrollTitleShow(strTitle,strNLIcon,strKFIcon){
        this.data.isScrollTitleShow = true;
        let str = "";
        for(let i=0;i<strTitle.length;i++){
            str+='<div id="scroll_title_'+i+'">' + strTitle[i] + '</div>';
        }
        str+='<div id="scroll_title_'+(strTitle.length)+'">' + strNLIcon + '</div>';
        str+='<div id="scroll_title_'+(strTitle.length + 1)+'">' + strKFIcon + '</div>';
        $("#stage_1_scroll").html(str);

        for(let i=0;i<strTitle.length+2;i++){
            setTimeout(function(idx){
                charRainManager.scrollTitleAddEffect(idx);
            },i* 300,i);
        }
    }
    scrollTitleAddEffect(i){
        // console.log("scroll title "+i);
        $("#scroll_title_"+i).css("visibility","visible");
        $("#stage_1_scroll").addClass("shake");
        setTimeout(function (){
            $("#stage_1_scroll").removeClass("shake");
        },200);
    }

    update(){
        charRainManager.data.msPlayed = charRainManager.data.msPlayed + charRainManager.data.msIntval;
        if(charRainManager.data.msPlayed >= charRainManager.data.duration){
            charRainManager.end();
           return;
        }
        charRainManager.timelineCheck(charRainManager.data.msPlayed);
        charRainManager.rainDropHeightCheck(charRainManager.data.msPlayed);
    }
}

let charRainManager1 = CharRainManager.getInstance();