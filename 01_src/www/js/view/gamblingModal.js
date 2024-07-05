/**
 * Created by jim on 2021/12/01.
 * 赌博模态框
 */

class GamblingModal {
    // 类变量定义
    static strSelector = '#gamblingModal';
    static strMoneySelector = '#gmSpanMoney';
    static strBuySelector = '#gmBuy';

    // 静态函数 - 该弹窗的控制函数
    static drawModal(intCityId){
        $(".modal").modal('hide');
        GamblingModal.updateModelContent(intCityId);
        $(GamblingModal.strSelector).data('intCityId',intCityId).modal('show');
    }
    static updateModelContent(intCityId){
    }

    static isShow(){
        return ($(GamblingModal.strSelector).css('display') === 'block');
    }
    static hideModal(){
        $(GamblingModal.strSelector).modal('hide');
    }
    static animateShakeThis(ele){
        gGui.playSoundEffect("fail");
        $(ele).addClass("animated headShake");
        setTimeout(function () { $(ele).removeClass("animated headShake"); },1000);
    }

    // instance functions
    // 构造函数 - new 对象的时候调用
    constructor() {
    }
}

let gamblingModal = new GamblingModal();