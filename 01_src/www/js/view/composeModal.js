/**
 * Created by jim on 2021/12/08.
 * Implemented by jim on 2021/12/08.
 * ComposeModal - 合成精华 弹窗
 * DecomposeModal - 分解精华 弹窗
 */

class ComposeModal {
    // 类变量定义
    static strSelector = '#composeModal';
    static strSelectorBtnOK = '#comBtnOK';

    // static functions
    static drawModal(){
        $(".modal").modal('hide');
        $(ComposeModal.strSelector).data('intgemarr',[]);
        ComposeModal.updateModelContent();
        $(ComposeModal.strSelector).modal('show');
    }
    static updateModelContent(){

    }

    // 静态函数 - 通常不需要修改
    /**
     * 判断当前 弹窗 是否已经显示
     * @returns {boolean} true=已经显示 false=没有显示
     */
    static isShow(){
        return ($(ComposeModal.strSelector).css('display') === 'block');
    }

    /**
     * 隐藏当前弹窗
     */
    static hideModal(){
        $(ComposeModal.strSelector).modal('hide');
        $(ComposeModal.strSelector).data('intgemarr',[]);
    }

    /**
     * 为指定的dom元素，添加抖动效果，1秒后自动取消
     * @param ele dom元素，使用 jQuery(ele)
     */
    static animateShakeThis(ele){
        gGui.playSoundEffect("fail");
        $(ele).addClass("animated headShake");
        setTimeout(function () { $(ele).removeClass("animated headShake"); },1000);
    }

    /**
     * 非模板类函数
     */


    // instance functions

    // 构造函数 - new 对象的时候调用
    constructor() {
        $("#composeItem4").data('intgemid',-1);
        $(ComposeModal.strSelector).on("hide.bs.modal",function(){
            gGui.enableKeys();
        });
    }


}

let composeModal = new ComposeModal();