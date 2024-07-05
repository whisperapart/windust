/**
 * Created by jim on 2020/3/25.
 */
class PurchaseModal {
    // todo: this class needs to be rewrite in latest js-class-format
    // todo: add variables for cargoArr, currentCargoId, input-Value etc...
    // constructor
    constructor(){
        // this.shipCargoArr = [];

        $("#calculatorDisplay").html('0');
        $("#calculatorBtn0").on('click', this.__proto__.constructor.handlerBtn0);
        $("#calculatorBtn00").on('click',this.__proto__.constructor.handlerBtn00);
        $("#calculatorBtn1").on('click', this.__proto__.constructor.handlerBtn1);
        $("#calculatorBtn2").on('click', this.__proto__.constructor.handlerBtn2);
        $("#calculatorBtn3").on('click', this.__proto__.constructor.handlerBtn3);
        $("#calculatorBtn4").on('click', this.__proto__.constructor.handlerBtn4);
        $("#calculatorBtn5").on('click', this.__proto__.constructor.handlerBtn5);
        $("#calculatorBtn6").on('click', this.__proto__.constructor.handlerBtn6);
        $("#calculatorBtn7").on('click', this.__proto__.constructor.handlerBtn7);
        $("#calculatorBtn8").on('click', this.__proto__.constructor.handlerBtn8);
        $("#calculatorBtn9").on('click', this.__proto__.constructor.handlerBtn9);
        $("#calculatorBtnMax").on('click',this.__proto__.constructor.handlerBtnMax);
        $("#calculatorBtnMin").on('click',this.__proto__.constructor.handlerBtnMin);
        $("#calculatorBtnClear").on('click',this.__proto__.constructor.handlerBtnClear);
        $("#calculatorBtnOK").on('click',this.__proto__.constructor.handlerBtnOK);
        $("#calculatorRange").attr("max",$("#dataPurchaseMax").val());
        $("#calculatorRange").on('change',this.__proto__.constructor.handlerSlider);

        this.cityId = -1;
        // this.purchasedArr = []; // {cityId:1 , cargoId:10, amount:12} - 记录所有city的？
    }

    // shared functions
    drawPurchase(cId){
        let strCid = parseInt(cId) > 0 ?  cId+"" : $("#dataPurchaseCityId").val();
        let intCid = parseInt(strCid);
        intCid = isNaN(intCid)? 0 : intCid;
        this.cityId = intCid;

        if(intCid > 0){
            $("#dataPurchaseCityId").val(intCid);
            // let carr = gDB.getCargoListForCity(cid);
            purchaseModal.drawPurchaseContent();
        }else{
            return;
        }
        // title  buttons etc
        $("#purchaseModal").modal('show');
    }

    drawPurchaseContent(){
        $("#purchaseTable").html('');
        let str = '';
        // let cityObj = gDB.getCityById(this.cityId);
        let cargoArr = gDB.getCargoSalebleForCity(this.cityId);
        // let cargoArr = deepClone(carr);
        // for(let i=0;i<cargoArr.length;i++){
        //     cargoArr[i].supply = Math.min(cargoArr[i].supply,Math.floor(cargoArr[i].supplyMax * cityObj.fac_fc / 1000));
        //     let sold = 0;
        //     for(let j=0;j<this.purchasedArr.length;j++){
        //         if(this.purchasedArr[j].cityId === this.cityId && this.purchasedArr[j].cargoId === cargoArr[i].cargoId){
        //             sold = this.purchasedArr[j].amount;
        //             break;
        //         }
        //     }
        //     cargoArr[i].supplyLeft = cargoArr[i].supply > sold ? cargoArr[i].supply - sold : 0 ;
        // }
        // console.log(cargoArr);

        for(let i =0;i<cargoArr.length;i++){
            if(cargoArr[i].cargoId === 50 && cargoArr[i].cityId === 14){
                // 南平 - 剑南春
                if(!dbPlayer[pId].flagJNC) continue;
            }
            let disPrice = Math.ceil(cargoArr[i].price);
            let trend = Math.round(disPrice * 100 / cargoArr[i].basePrice);
            // let supply =  Math.floor(cargoArr[i].supply * cityObj.fac_fc / 1000);

            str += "<tr id='cargoTr"+cargoArr[i].cargoId+"' onclick='purchaseModal.actSelectCargo(\""+cargoArr[i].cargoId+"\")'>" +
                "<th><svg class='icon' aria-hidden='true'><use xlink:href='" +
                utilGetCssIconById(cargoArr[i].cargoId) +
                "'></use></svg>&nbsp;"+cargoArr[i].cargoName+"</th>" +
                "<td>"+cargoArr[i].supply+"</td>" +
                "<td>"+disPrice+"</td>" +
                "<td>"+trend+"%</td>" +
                // "<td>"+cargoArr[i].salePrice+"</td>" +
                "</tr>";
        }
        $("#purchaseTable").html(str);
        $("#pmSpanMoney").html(toReadableString(dbPlayer[pId].money));

        let capacity = CharacterModel.getShipCargoCapacity();
        let used = CharacterModel.getShipCargoUsed();
        $("#pmSpanSlot").html(used+"/"+capacity);
    }

    /**
     * 重置已经购买的记录，在 gTime.eventWeekly触发
     * 可以购买的物品数量 = 总数量 * 占有率 比例 - 当周已经购买的数量( purchasedArr )
     */
    // resetPurchaseHistory(){
    //     this.purchasedArr = [];
    // }
    // addPurchaseHistory(intCityId,intCargoId,intAmount){
    //     let match = -1;
    //     for(let i=0;i<this.purchasedArr.length;i++){
    //         if(this.purchasedArr[i].cargoId === intCargoId && this.purchasedArr[i].cityId === intCityId){
    //             this.purchasedArr[i].amount += intAmount;
    //             match = i;
    //             break;
    //         }
    //     }
    //     if(match === -1){
    //         this.purchasedArr.push({cityId:intCityId,cargoId:intCargoId,amount:intAmount});
    //     }
    // }

    /**
     * 选中某种货物
     * @param cargoId
     */
    actSelectCargo(cargoId){
        purchaseModal.resetCalculator();
        $("#dataPurchaseCargoId").val(cargoId);
        // let cityId = $("#dataPurchaseCityId").val();
        // set dataPurchaseMax
        let supply = parseInt(gDB.getCargoStockById(cargoId,this.cityId));
        // let supplyMax = parseInt(gDB.getCargoSupplyMaxById(cargoId,this.cityId));
        // // 20220308 -  加入占有度fac 控制，最大可购买数量 = 城市存货数量 * 占有度
        // let cityObj = gDB.getCityById(this.cityId);
        // supply = Math.min(supply,Math.floor(supplyMax * cityObj.fac_fc / 1000));
        //
        // for(let j=0;j<this.purchasedArr.length;j++){
        //     if(this.purchasedArr[j].cityId === this.cityId && this.purchasedArr[j].cargoId === parseInt(cargoId)){
        //         supply = supply - this.purchasedArr[j].amount;
        //         break;
        //     }
        // }
        supply = supply > 0 ? supply : 0;

        let price = Math.ceil(gDB.getCargoPriceById(cargoId,this.cityId));
        // if(supply <= 0 )return;
        if(price <= 0 )return;
        let tmp = Math.floor(dbPlayer[pId].money / price);  // 钱最多买多少
        supply = Math.min(tmp,supply);

        $("#dataPurchaseMax").val(supply);
        // set calculatorRange
        $("#calculatorRange").attr('max',supply);
        // gui related
        $("#purchaseTable tr").removeClass("table-primary");
        $("#cargoTr"+cargoId).addClass("table-primary");

        // not to implement: set purchaseCart

    }

    resetCalculator(){
        $("#calculatorRange").attr('max',0);
        $("#calculatorRange").val(0);
        $("#calculatorDisplay").html(0);
        $("#dataPurchaseMax").val(0);
    }

    // private functions
    handlerBtnNum(n){
        gGui.playSoundEffect();
        let num = parseInt($("#calculatorRange").val());
        let max = parseInt($("#dataPurchaseMax").val());
        num = ( num * 10 + n ) <= max ? (num * 10 + n) : num;
        num = (num <= 0) ? 0 : num;
        $("#calculatorDisplay").html(num);
        $("#calculatorRange").val(num);
    }
    static handlerBtn0(){ purchaseModal.handlerBtnNum(0); }
    static handlerBtn1(){ purchaseModal.handlerBtnNum(1); }
    static handlerBtn2(){ purchaseModal.handlerBtnNum(2); }
    static handlerBtn3(){ purchaseModal.handlerBtnNum(3); }
    static handlerBtn4(){ purchaseModal.handlerBtnNum(4); }
    static handlerBtn5(){ purchaseModal.handlerBtnNum(5); }
    static handlerBtn6(){ purchaseModal.handlerBtnNum(6); }
    static handlerBtn7(){ purchaseModal.handlerBtnNum(7); }
    static handlerBtn8(){ purchaseModal.handlerBtnNum(8); }
    static handlerBtn9(){ purchaseModal.handlerBtnNum(9); }

    static handlerBtn00(){
        let num = parseInt($("#calculatorRange").val());
        let max = parseInt($("#dataPurchaseMax").val());
        num = ( num * 100 ) <= max ? (num * 100 ) : num;
        num = (num <= 0) ? 0 : num;
        $("#calculatorDisplay").html(num);
        $("#calculatorRange").val(num);
    }

    static handlerBtnMax(){
        gGui.playSoundEffect();
        let max = parseInt($("#dataPurchaseMax").val());
        let cap = CharacterModel.getShipCargoCapacity();
        let use = CharacterModel.getShipCargoUsed();
        let ava = cap - use;
        max = max > ava ? ava : max;
        $("#calculatorDisplay").html(max);
        $("#calculatorRange").val(max);
    }
    static handlerBtnMin(){
        gGui.playSoundEffect();
        let max = parseInt($("#dataPurchaseMax").val());
        let min = max>0 ? 1 : 0;
        $("#calculatorDisplay").html(min);
        $("#calculatorRange").val(min);
    }

    /**
     * 确认购买
     */
    static handlerBtnOK(){
        gGui.playSoundEffect();
        let amount = parseInt($("#calculatorDisplay").html());
        let cargoId = $("#dataPurchaseCargoId").val();
        let cityId = $("#dataPurchaseCityId").val();
        if(amount<=0 || cargoId == '0' || '0' == cityId) return;
        let supply = parseInt(gDB.getCargoStockById(cargoId,cityId));
        let price = Math.ceil(gDB.getCargoPriceById(cargoId,cityId));
        // 比较数量(0，max]  比较金币： 数量*单价 <= money
        if(amount >0 && amount <=supply){
            let moneySpent = price * amount;
            let moneyLeft = dbPlayer[pId].money - moneySpent;
            if( moneyLeft >= 0 ){
                // let capacity = gDB.getShipCapacity(dbPlayer[pId].shipId,dbPlayer[pId].shipFitCargo);
                let capacity = CharacterModel.getShipCargoCapacity();
                if(capacity <=0){
                    // console.log('user do not have ship');
                    $("#npcHail").html(globalStrings.NO_SHIP);
                    return;
                }

                // 比较 船只容量，太大无法购买
                // let used = 0;
                // for(let i=0;i<dbPlayer[pId].cargoArr.length;i++){
                //     used = used + dbPlayer[pId].cargoArr[i].count;
                // }
                let used = CharacterModel.getShipCargoUsed();
                if(used + amount <= capacity){
                    dbPlayer[pId].money = moneyLeft;
                    gDB.setCargoStock(cargoId,cityId,supply - amount);

                    // $("#pmSpanMoneyDelta").html("-"+moneySpent);
                    // purchaseModal._animateSplash("#pmSpanMoneyDelta");
                    PurchaseModal.animateMoneyHUD("-"+toReadableString(moneySpent));

                    let intCargoId = parseInt(cargoId);
                    let intAmount = parseInt(amount);
                    let intPrice = parseInt(price);

                    dbPlayer[pId].cargoArr.push({cargoId:intCargoId,count:intAmount,cost:intPrice});
                    // console.log("purchase done.");
                    // purchaseModal.addPurchaseHistory(parseInt(cityId),intCargoId,intAmount);
                    gGui.cityUpdateInfoPanelMoney(cityId);
                    gTrade.priceWaveOnSell(cargoId,-amount,cityId);
                    purchaseModal.drawPurchaseContent();
                    purchaseModal.resetCalculator();
                    $("#npcHail").html(globalStrings.PUR_PAY+toReadableString(moneySpent)+globalStrings.PUR_DONE);
                }else{
                    // console.log('not enough ship slot');
                    PurchaseModal.animateMoneyShake();
                    $("#npcHail").html(globalStrings.PUR_NO_ROOM);
                }
            }else{
                // console.log('not enough money');
                PurchaseModal.animateMoneyShake();
                $("#npcHail").html(globalStrings.SHIP_UPDATE_NO_MONEY);
            }
        }else{
            // console.log('amount error');
            $("#npcHail").html(globalStrings.SALE_AMOUNT_ERROR);
        }

    }
    static handlerBtnClear(){
        gGui.playSoundEffect();
        $("#calculatorRange").val(0);
        $("#calculatorDisplay").html(0);
    }
    static handlerSlider(){
        $("#calculatorDisplay").html( $("#calculatorRange").val());
    }
    // util functions
    _animateShow(id){
        $(id).show().addClass('fadeInUp animated show');
        setTimeout(function () { $(id).removeClass('fadeInUp animated');},200);
    }
    _animateHide(id){
        $(id).addClass('fadeOutUp animated');
        setTimeout(function () { $(id).removeClass('fadeOutUp animated').css("display","none");},200);
    }
    _animateSplash(id){
        $(id).show().addClass('slideOutUp animated show');
        setTimeout(function () { $(id).removeClass('slideOutUp animated show');  $(id).hide(); },600);
        // $(id).show();
        // setTimeout(function(){
        //     $(id).addClass('fadeOutUp animated show');
        //     setTimeout(function () {
        //         $(id).removeClass('fadeOutUp animated show');  $(id).hide();
        //     },200)
        // },400);
    }
    static animateMoneyHUD(disStr){
        // $('#buyModal .left-info .modalSpanMoneyDelta').remove();
        let str = '<span class="modalSpanMoneyDelta">'+disStr+'</span>';
        $("#purchaseModal .left-info .col-8:first").append(str);
        $("#purchaseModal .left-info .modalSpanMoneyDelta").show().addClass('slideOutUp animated show');
        setTimeout(function () { $('#purchaseModal .left-info .modalSpanMoneyDelta').remove(); },600);
    }
    static animateMoneyShake(){
        gGui.playSoundEffect("fail");
        $("#purchaseModal .left-info .col-8:last").addClass("animated headShake");
        setTimeout(function () { $('#purchaseModal .left-info .col-8:last').removeClass("animated headShake"); },1000);
    }
}
let purchaseModal = new PurchaseModal();