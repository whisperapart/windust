/**
 * Created by jim on 2020/3/25.
 */
class InvestModal extends BaseModal{
    // constructor
    constructor(){
        super("#investModal");
        $("#investBtnMax").on('click', InvestModal.onBtnMax);
        $("#investBtnMin").on('click', InvestModal.onBtnMin);
        $("#investBtnClear").on('click', InvestModal.onBtnClr);
        $("#investBtnOK").on('click', InvestModal.onBtnOK);
    }

    // shared functions
    static drawModal(intCid) {
        $('.modal').modal('hide');
        if(intCid<=0) return
        let city = gDB.getCityById(intCid);
        if(city === undefined) return;
        if(city.devLevel === undefined) return;
        $("#investModalCityId").val(intCid);
        $("#investModalSlotMoney").val(city.devLevel);
        InvestModal.drawEmptySlots(intCid);
        $("#investSpanMoney").html(toReadableString(dbPlayer[pId].money));
        $('#investModal').modal('show');
    }
    static isShow() {
        return $("#investModal").css('display') == 'block' ? true : false;
    }
    static hideModal() {
        $("#investModal").modal('hide');
    }
    static drawEmptySlots(intCid){
        let str = '';
        $("#investModal .item-wrap").html(str);
        for(let i=1;i<=36;i++){
            str += '<button class="btn item-slot item-slot-empty" id="investSlot'+i+'"><i class="iconfont icon-gold2"></i></button>';
        }
        $("#investModal .invest-wrap").html(str);
        $('#investModal .item-slot').click(InvestModal.clickItem);
    }

    static clickItem() {
        $('#investModal .item-slot').removeClass('active');
        $("#investAmountDisplay").html('');
        let iid = parseInt($(this).attr('id').substr(10));
        let slotMoney = parseInt($("#investModalSlotMoney").val());
        if(isNaN(iid) || iid <=0 ){return;}
        if(slotMoney<=0) {return;}

        for(let i=1;i<=iid;i++){
            $("#investSlot"+i).addClass("active").removeClass("item-slot-empty");
        }
        let invest = iid * slotMoney;
        $("#investAmountDisplay").html(invest);


        if(invest > dbPlayer[pId].money){
            // error: not enough money
        }
    }

    eventHandlerOnHide() {
        // 清空之前的投资数字，可能点了数字，但是没有点BtnOK。导致其他城市打开的时候，还是之前的投资数字。
        $('#investModal .item-slot').removeClass('active');
        $("#investAmountDisplay").html('0');
    }

    /**
     * 最大投资按钮
     */
    static onBtnMax(){
        gGui.playSoundEffect();
        let slotMoney = parseInt($("#investModalSlotMoney").val());
        if(slotMoney<=0) {return;}
        $('#investModal .item-slot').removeClass('active').removeClass('item-slot-empty');
        for(let i=1;i<=36;i++){
            $("#investSlot"+i).addClass("active");
        }
        let invest = 36 * slotMoney;
        $("#investAmountDisplay").html(invest);
    }

    /**
     * 最小投资按钮
     */
    static onBtnMin(){
        gGui.playSoundEffect();
        let slotMoney = parseInt($("#investModalSlotMoney").val());
        if(slotMoney<=0) {return;}
        $('#investModal .item-slot').removeClass('active');
        $("#investSlot1").addClass("active");
        let invest = 1 * slotMoney;
        $("#investAmountDisplay").html(invest);
    }

    /**
     * 清零按钮
     */
    static onBtnClr(){
        gGui.playSoundEffect("fail");
        $('#investModal .item-slot').removeClass('active');
        $("#investAmountDisplay").html('0');
    }

    /**
     * 确认投资按钮
     */
    static onBtnOK(){
        let investMoney = parseInt($("#investAmountDisplay").html());
        if(investMoney<=0){return;}
        let moneyLeft = dbPlayer[pId].money - investMoney;
        if(moneyLeft <0) {
            // $("#investAmountDisplay").html('0');
            InvestModal.animateMoneyShake();
            $("#npcHail").html(globalStrings.INVEST_NO_MONEY);
            return;
        }
        gGui.playSoundEffect("succ");
        // 占有度调整
        let slotMoney = parseInt($("#investModalSlotMoney").val());
        let fac_inc = Math.floor(investMoney / slotMoney);
        let intCityId = parseInt($("#investModalCityId").val());

        $('#investModal .item-slot').removeClass('active');
        $("#investAmountDisplay").html('0');
        dbPlayer[pId].money = moneyLeft

        CharacterModel.increaseFac(intCityId,fac_inc);
        InvestModal.animateMoneyHUD("-"+toReadableString(investMoney));
        $("#investSpanMoney").html(toReadableString(dbPlayer[pId].money));
        let cityId =  $("#investModalCityId").val();
        let city = gDB.getCityById(cityId);
        city.invest = city.invest + investMoney;
        $("#npcHail").html(globalStrings.INVEST_DONE);
        // update cityGUIMoney along with city fac and city Invest
        // gGui.cityUpdateInfoPanelMoney(cityId);
        // updated 2023.05.31 gTime的时间前进，防止长时间不刷货物
        // gTime.setNextHour(); // 相当于花了1游戏小时 的时间。
        // updated 2023.06.02 移除，在进入building 的时候，花费1小时。而不是每次投资花费1小时
        gGui.cityUpdateInfoPanel(cityId);
        // gGui.drawHUD();
    }

    // private functions

    // util functions
    static animateMoneyHUD(disStr){
        // $('#buyModal .left-info .modalSpanMoneyDelta').remove();
        let str = '<span class="modalSpanMoneyDelta">'+disStr+'</span>';
        $("#investModal .left-info").append(str);
        $("#investModal .left-info .modalSpanMoneyDelta").show().addClass('slideOutUp animated show');
        setTimeout(function () { $('#investModal .left-info .modalSpanMoneyDelta').remove(); },600);
    }
    static animateMoneyShake(){
        gGui.playSoundEffect("fail");
        $("#investModal .left-info").addClass("animated headShake");
        setTimeout(function () { $('#investModal .left-info').removeClass("animated headShake"); },1000);
    }
}

let investModal = new InvestModal();