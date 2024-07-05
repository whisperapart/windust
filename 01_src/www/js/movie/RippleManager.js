/**
 * Ripple Manager - controls bubble animation
 * Jim Dai 2023.10.13
 * #ripple_1{top: 940px;left: 720px;position: absolute;}
 * #ripple_2{top: 880px;left: 1060px;position: absolute;}
 * #ripple_3{top: 890px;left: 1560px;position: absolute;}
 */

class RippleManager {
    constructor() {
        this.data = {
            'rippleData':[
                {'top':'940px','left':'720px','msStart':0,'msEnd':2000},
                {'top':'880px','left':'1060px','msStart':250,'msEnd':4000},
                {'top':'890px','left':'1560px','msStart':600,'msEnd':6000},
                {'top':'780px','left':'1960px','msStart':900,'msEnd':8000}
            ],
            // 'rippleHTML': '<div class="w w5"></div><div class="w w4"></div> <div class="w w3"></div> <div class="w w2"></div> <div class="w w1"></div> <div class="w w0"></div>'
            'rippleHTML': '<div class="w w5"></div><div class="w w2"></div> <div class="w w0"></div>',
            'jumpHTMLpre': '<div class="ripple-jump-icon"><i class="iconfont icon-gongfu"></i></div>',
            // 'jumpHTMLpre': '<div class="ripple-jump-icon" id=""><svg class="icon" aria-hidden="true"><use xlink:href="#icon-martialarts-jump-copy"></use></svg></div>',
            'jumpHTMLsuf': '<div class="ripple-jump-icon"><i class="iconfont icon-martialarts-jump-copy"></i></div>'
        };
        this.instance = null;
    }

    static eleWrapId = "ripple_wrap";

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        return this.instance = new RippleManager();
    }

    static isShow() {
        return ($("#" + RippleManager.eleWrapId).css('display') === 'block');
    }

    start(){
        console.log("ripple manager runs");
        // 第一跳，圈+后摇
        setTimeout(function (){
            let rm = RippleManager.getInstance();
            let str = '<div class="ripple" id="ripple-0" style="left:'+rm.data.rippleData[0].left+';top:'+rm.data.rippleData[0].top+';">' + rm.data.rippleHTML + '</div>';
            $("#"+RippleManager.eleWrapId).append(str);
            let jStr = '<div class="ripple-jump-icon ripple-jump-suf" id="ripple-0-jump" style="left:'+rm.data.rippleData[0].left+';top:'+rm.data.rippleData[0].top+';">'+rm.data.jumpHTMLsuf+'</div>'
            $("#"+RippleManager.eleWrapId).append(jStr);
        },rippleManager.data.rippleData[0].msStart);
        // 第一跳，移除后摇
        setTimeout(function (){$("#ripple-0-jump").remove();},rippleManager.data.rippleData[0].msStart+100);
        setTimeout(function(){$("#ripple-0").remove();},rippleManager.data.rippleData[0].msEnd);

        // 第二跳，前摇
        setTimeout(function(){
            let rm = RippleManager.getInstance();
            let jStr = '<div class="ripple-jump-icon ripple-jump-pre" id="ripple-1-jump-pre" style="left:'+rm.data.rippleData[1].left+';top:'+rm.data.rippleData[1].top+';">'+rm.data.jumpHTMLpre+'</div>'
            $("#"+RippleManager.eleWrapId).append(jStr);
        },rippleManager.data.rippleData[1].msStart-100);
        // 第二跳，圈+后摇
        setTimeout(function(){
            let rm = RippleManager.getInstance();
            let str = '<div class="ripple" id="ripple-1" style="left:'+rm.data.rippleData[1].left+';top:'+rm.data.rippleData[1].top+';">' + rm.data.rippleHTML + '</div>';
            $("#"+RippleManager.eleWrapId).append(str);
            $("#ripple-1-jump-pre").remove();
            let jStr = '<div class="ripple-jump-icon ripple-jump-suf" id="ripple-1-jump-suf" style="left:'+rm.data.rippleData[1].left+';top:'+rm.data.rippleData[1].top+';">'+rm.data.jumpHTMLsuf+'</div>'
            $("#"+RippleManager.eleWrapId).append(jStr);
        },rippleManager.data.rippleData[1].msStart);
        // 第二跳，移除后摇
        setTimeout(function (){$("#ripple-1-jump-suf").remove();},rippleManager.data.rippleData[1].msStart+100);
        // 第二跳，移除波纹
        setTimeout(function(){$("#ripple-1").remove();},rippleManager.data.rippleData[1].msEnd);

        // 第三跳，前摇
        setTimeout(function(){
            let rm = RippleManager.getInstance();
            let jStr = '<div class="ripple-jump-icon ripple-jump-pre" id="ripple-2-jump-pre" style="left:'+rm.data.rippleData[2].left+';top:'+rm.data.rippleData[2].top+';">'+rm.data.jumpHTMLpre+'</div>'
            $("#"+RippleManager.eleWrapId).append(jStr);
        },rippleManager.data.rippleData[2].msStart-150);

        // 第三跳，圈+后摇
        setTimeout(function(){
            let rm = RippleManager.getInstance();
            let str = '<div class="ripple" id="ripple-2" style="left:'+rm.data.rippleData[2].left+';top:'+rm.data.rippleData[2].top+';">' + rm.data.rippleHTML + '</div>';
            $("#"+RippleManager.eleWrapId).append(str);
            $("#ripple-2-jump-pre").remove();
            let jStr = '<div class="ripple-jump-icon ripple-jump-suf" id="ripple-2-jump-suf" style="left:'+rm.data.rippleData[2].left+';top:'+rm.data.rippleData[2].top+';">'+rm.data.jumpHTMLsuf+'</div>'
            $("#"+RippleManager.eleWrapId).append(jStr);
        },rippleManager.data.rippleData[2].msStart);
        // 第三跳，移除后摇
        setTimeout(function (){$("#ripple-2-jump-suf").remove();},rippleManager.data.rippleData[2].msStart+150);
        // 第三跳，移除波纹
        setTimeout(function(){$("#ripple-2").remove();},rippleManager.data.rippleData[2].msEnd);

        // 第四跳，前摇
        setTimeout(function(){
            let rm = RippleManager.getInstance();
            let jStr = '<div class="ripple-jump-icon ripple-jump-pre" id="ripple-3-jump-pre" style="left:'+rm.data.rippleData[3].left+';top:'+rm.data.rippleData[3].top+';">'+rm.data.jumpHTMLpre+'</div>'
            $("#"+RippleManager.eleWrapId).append(jStr);
        },rippleManager.data.rippleData[3].msStart-100);
    }
}

