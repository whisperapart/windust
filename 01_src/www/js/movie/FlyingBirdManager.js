/**
 * Flying Bird Manager - controls flying birds animation
 * Jim Dai 2023.10.13
 */

class FlyingBirdManager {
    constructor() {
        this.data = {
            'birdData':[
                // 'top:0px;left:420px;rotate:-15deg;scale:0.8;',
                'top:-10vh;left:21.875vw;rotate:-15deg;scale:0.8;-webkit-transform:rotate(-15deg);-webkit-transform:scale(0.8);',
                'top:25.925vh;left:55.2vw;rotate:10deg;scale:0.5;-webkit-transform:rotate(10deg);-webkit-transform:sca;e(0.5);'
            ],
            'birdHTML':'<div class="bird-wing-1 flipWing1">)</div><div class="bird-wing-2 flipWing2">(</div>'
        };
        this.instance = null;
    }

    static eleWrapId = "bird_wrap";

    static doClick(){
        console.log("do click");
        // gGui.sysToast("+1","clicked");
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        return this.instance = new FlyingBirdManager();
    }

    static isShow() {
        return ($("#" + FlyingBirdManager.eleWrapId).css('display') === 'block');
    }

    start(){
        // console.log("bird manager runs");
        $("#" + FlyingBirdManager.eleWrapId).html('');
        for(let i=0;i<this.data.birdData.length;i++){
            // let str = '<div class="bird" style="left:'+this.data.birdData[i].left+';top:'+this.data.birdData[i].top+';">' + this.data.birdHTML + '</div>';
            let str = '<div class="bird" style="'+this.data.birdData[i]+'">' + this.data.birdHTML + '</div>';
            $("#" + FlyingBirdManager.eleWrapId).append(str);
        }
    }
}

