/**
 * Created by jim on 2020/3/25.
 * implemented by Jim 20220810
 * bank-in and bank-out together => bankModal
 */
class BankModal{
    // 类变量定义
    static strSelector = '#bankModal';
    static strSelectorSpanMoney = '#bkSpanMoney';
    static strSelectorBtnBank= ".bkSlotShare";
    static strSelectorBtnBankID= "#bkSlot-";
    static strSelectorTipInfo= "#bkTipInfo";
    static strSelectorWrapInventory = "#bkSlotWrap";

    // constructor
    constructor(){
    }

    // shared functions
    static drawModal(intCityId){
        $(".modal").modal('hide');
        $(".kf-pop-over").popover('hide').popover('dispose');
        BankModal.updateModalContent();
        $(BankModal.strSelector).modal('show');
        $(BankModal.strSelector).data('intCityId',intCityId);
    }

    static updateModalContent(){
    }

    // private functions

    // util functions
    static isShow(){
        return ($(BankModal.strSelector).css('display') === 'block');
    }
    static hideModal(){
        $(BankModal.strSelector).modal('hide');
    }
    static animateShakeThis(ele){
        gGui.playSoundEffect("fail");
        $(ele).addClass("animated headShake");
        setTimeout(function () { $(ele).removeClass("animated headShake"); },1000);
    }
    static animateMoneyHUD(disStr){
        let str = '<span class="modalSpanMoneyDelta">'+disStr+'</span>';
        $("#bankModal .left-info").append(str);
        $("#bankModal .left-info .modalSpanMoneyDelta").show().addClass('slideOutUp animated show');
        setTimeout(function () { $('#bankModal .left-info .modalSpanMoneyDelta').remove(); },600);
    }
}

let bankModal = new BankModal();