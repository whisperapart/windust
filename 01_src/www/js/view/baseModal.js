/**
 * Created by jim on 2021/12/22.
 * 这是 弹窗 函数的一个基类，包括了所有的通用和基本操作。
 * 封装部分通用函数
 * 2023.05.11 目前只用于 MeditationModal
 * 调整了关闭时候的拦截函数，可以支持拿回物品
 */

class BaseModal {
    // 类变量定义
    strSelector = '#baseModal';

    // 静态函数 - 该弹窗的控制函数
    static drawModal(){

    }
    static updateModelContent(intInput){

    }

    static isShow(strSelector){
        return ($(strSelector).css('display') === 'block');
    }
    static hideModal(strSelector){
        $(strSelector).modal('hide');
    }
    static animateShakeThis(strSelector){
        $(strSelector).addClass("animated headShake");
        setTimeout(function () { $(strSelector).removeClass("animated headShake"); },1000);
    }
    static disableButton(strSelector){
        $(strSelector).prop('disabled',true);
    }
    static enableButton(strSelector){
        $(strSelector).prop('disabled',false);
    }

    eventHandlerOnHide(){
        console.log("base event handler on hide");
    }

    // instance functions
    // 构造函数 - new 对象的时候调用
    constructor(strSelector) {
        this.strSelector = strSelector;
        let that = this;
        $(this.strSelector).on("hide.bs.modal", function (){
            gGui.enableKeys();
            that.eventHandlerOnHide();
        }).on('show.bs.modal',gGui.disableKeys);
    }
}

// let ancestorModal = new AncestorModal();