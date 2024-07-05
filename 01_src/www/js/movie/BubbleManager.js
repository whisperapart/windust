/**
 * Bubble Manager - controls bubble animation
 * Jim Dai 2023.10.14
 */

class BubbleManager {
    constructor() {
        this.data = {
            'count': 10,                  // bubble 个数
            'deg': 90                     // 朝上飞
        };
        this.instance = null;
    }

    static eleWrapId = "bubble-wrap";

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        return this.instance = new BubbleManager();
    }

    static isShow() {
        return ($("#" + BubbleManager.eleWrapId).css('display') === 'block');
    }

    start(){
       let str = "";
       for(let i=0;i<this.data.count;i++){
           str += '<div class="bubble"></div>';
       }
       $("#"+BubbleManager.eleWrapId).html(str);
       this.updateBubbleSetting();
    }

    updateBubbleSetting(){
        $("#"+BubbleManager.eleWrapId + " .bubble").each(function (){
            let r = Math.ceil(10 + Math.random() * 40);
            let p = Math.ceil(Math.random() * 100);
            // let b =  Math.random() * 1;
            // let l = Math.random() * 2.4;
            let l = 0;
            let d = 10 + Math.random() * 20;
            $(this).css('animation-duration',d+"s")
                .css('animation-delay',l+"s")
                .css('left',p+"vw")
                // .css('bottom','calc(-10px + '+b+'vh)')
                .css('bottom','5vh')
                .css('width',r+"px").css('height',r+"px");

        });
    }
}

