/**
 * Created by jim on 2020/3/25.
 */
let saleModal = new class{
    // constructor
    constructor(){
        this.userCargoArr = [];

        $("#calculatorDisplayS").html('0');
        $("#calculatorBtn0S").on('click', this.__proto__.constructor.handlerBtn0);
        $("#calculatorBtn00S").on('click',this.__proto__.constructor.handlerBtn00);
        $("#calculatorBtn1S").on('click', this.__proto__.constructor.handlerBtn1);
        $("#calculatorBtn2S").on('click', this.__proto__.constructor.handlerBtn2);
        $("#calculatorBtn3S").on('click', this.__proto__.constructor.handlerBtn3);
        $("#calculatorBtn4S").on('click', this.__proto__.constructor.handlerBtn4);
        $("#calculatorBtn5S").on('click', this.__proto__.constructor.handlerBtn5);
        $("#calculatorBtn6S").on('click', this.__proto__.constructor.handlerBtn6);
        $("#calculatorBtn7S").on('click', this.__proto__.constructor.handlerBtn7);
        $("#calculatorBtn8S").on('click', this.__proto__.constructor.handlerBtn8);
        $("#calculatorBtn9S").on('click', this.__proto__.constructor.handlerBtn9);
        $("#calculatorBtnMaxS").on('click',this.__proto__.constructor.handlerBtnMax);
        $("#calculatorBtnMinS").on('click',this.__proto__.constructor.handlerBtnMin);
        $("#calculatorBtnClearS").on('click',this.__proto__.constructor.handlerBtnClear);
        $("#calculatorBtnOKS").on('click',this.__proto__.constructor.handlerBtnOK);
        $("#calculatorRangeS").attr("max",$("#dataSaleMax").val());
        $("#calculatorRangeS").on('change',this.__proto__.constructor.handlerSlider);

        // this.cityId = -1;

    }

    // shared functions
    drawSale(cId){
        // let cid = parseInt(cId) > 0 ?  cId+"" : $("#dataSaleCityId").val();
        let strCid = parseInt(cId) > 0 ?  cId+"" : $("#dataSaleCityId").val();
        let intCid = parseInt(strCid);
        intCid = isNaN(intCid)? 0 : intCid;

        if(intCid > 0){
            $("#dataSaleCityId").val(intCid);
            saleModal.drawSaleContent(intCid+'');
            // this.cityId = cid;
        }else{
            return;
        }
        // title  buttons etc
        $("#saleModal").modal('show');
    }

    drawSaleContent(cid){
        $("#saleTable").html('');

        let cityCargoArr = gDB.getCargoAllForCity(cid);
        saleModal.userCargoArr = JSON.parse(JSON.stringify(dbPlayer[pId].cargoArr));
        for(let i=0;i<saleModal.userCargoArr.length;i++){ // [{cargoId:0,count:0,cost:0}]
            let tmp = cityCargoArr.find(x => ((parseInt(x.cityId) === parseInt(cid)) && (parseInt(x.cargoId) === parseInt(saleModal.userCargoArr[i].cargoId))));
            if(tmp === undefined) continue;
            saleModal.userCargoArr[i].price = tmp.supplyMax > 0 ? Math.floor(tmp.price * 0.5) : Math.floor(tmp.price);
            saleModal.userCargoArr[i].cargoName = tmp.cargoName;
        }
        let str = '';
        for(let i =0;i<saleModal.userCargoArr.length;i++){
            str += "<tr id='cargoSTr"+i+"' onclick='saleModal.actSelectCargo(\""+i+"\")'>" +
                "<th><svg class='icon' aria-hidden='true'><use xlink:href='" +
                utilGetCssIconById(saleModal.userCargoArr[i].cargoId) +
                "'></use></svg>&nbsp;"+saleModal.userCargoArr[i].cargoName+"</th>" +
                "<td>"+saleModal.userCargoArr[i].count+"</td>" +
                "<td>"+saleModal.userCargoArr[i].price+"</td>" +
                "<td>"+saleModal.userCargoArr[i].cost+"</td>" +
                "</tr>";
        }
        $("#saleTable").html(str);
        $("#smSpanMoney").html(toReadableString(dbPlayer[pId].money));
        $("#dataSaleCargoId").val('-1');
        let capacity = CharacterModel.getShipCargoCapacity();
        let used = CharacterModel.getShipCargoUsed();
        $("#smSpanSlot").html(used+"/"+capacity);
    }

    actSelectCargo(idx){
        gGui.playSoundEffect();
        saleModal.resetCalculator();
        $("#dataSaleCargoId").val(idx);
        let i = parseInt(idx);
        let supply = parseInt(saleModal.userCargoArr[idx].count);
        let price = parseInt(saleModal.userCargoArr[idx].price);
        if(supply <= 0 )return;
        if(price <= 0 )return;
        $("#dataSaleMax").val(supply);
        // set calculatorRange
        $("#calculatorRangeS").attr('max',supply);
        // gui related
        $("#saleTable tr").removeClass("table-primary");
        $("#cargoSTr"+i).addClass("table-primary");
    }

    resetCalculator(){
        $("#calculatorRangeS").attr('max',0);
        $("#calculatorRangeS").val(0);
        $("#calculatorDisplayS").html(0);
        $("#dataSaleMax").val(0);
    }

    // private functions
    handlerBtnNum(n){
        gGui.playSoundEffect();
        let num = parseInt($("#calculatorRangeS").val());
        let max = parseInt($("#dataSaleMax").val());
        num = ( num * 10 + n ) <= max ? (num * 10 + n) : num;
        num = (num <= 0) ? 0 : num;
        $("#calculatorDisplayS").html(num);
        $("#calculatorRangeS").val(num);
    }
    static handlerBtn0(){ saleModal.handlerBtnNum(0); }
    static handlerBtn1(){ saleModal.handlerBtnNum(1); }
    static handlerBtn2(){ saleModal.handlerBtnNum(2); }
    static handlerBtn3(){ saleModal.handlerBtnNum(3); }
    static handlerBtn4(){ saleModal.handlerBtnNum(4); }
    static handlerBtn5(){ saleModal.handlerBtnNum(5); }
    static handlerBtn6(){ saleModal.handlerBtnNum(6); }
    static handlerBtn7(){ saleModal.handlerBtnNum(7); }
    static handlerBtn8(){ saleModal.handlerBtnNum(8); }
    static handlerBtn9(){ saleModal.handlerBtnNum(9); }

    static handlerBtn00(){
        gGui.playSoundEffect();
        let num = parseInt($("#calculatorRangeS").val());
        let max = parseInt($("#dataSaleMax").val());
        num = ( num * 100 ) <= max ? (num * 100 ) : num;
        num = (num <= 0) ? 0 : num;
        $("#calculatorDisplayS").html(num);
        $("#calculatorRangeS").val(num);
    }

    static handlerBtnMax(){
        gGui.playSoundEffect();
        let max = parseInt($("#dataSaleMax").val());
        $("#calculatorDisplayS").html(max);
        $("#calculatorRangeS").val(max);
    }
    static handlerBtnMin(){
        gGui.playSoundEffect();
        let max = parseInt($("#dataSaleMax").val());
        let min = max>0 ? 1 : 0;
        $("#calculatorDisplayS").html(min);
        $("#calculatorRangeS").val(min);
    }
    static handlerBtnOK(){
        gGui.playSoundEffect();
        let amount = parseInt($("#calculatorDisplayS").html());
        let idx = parseInt($("#dataSaleCargoId").val());
        let cityId = $("#dataSaleCityId").val()+'';
        if(amount<=0 || idx <0 || '0' == cityId) return;
        let stock = saleModal.userCargoArr[idx];
        let supply = parseInt(stock.count);
        let price = Math.floor(stock.price);
        let cargoId = stock.cargoId+'';
        // 比较数量(0，max]  比较金币： 数量*单价 <= money
        let newCnt = supply - amount;
        if(amount >0 && newCnt>=0){
            // important: 注意: 这里不能用 cargoId 唯一标识，因为同一个Cargo可能进货价不同
            // 移除玩家货物
            // 如果库存已经为0，移除整个库存对象
            CharacterModel.removeCargoByIdx(idx,amount);
            // set cargo demand
            // wave on sale
            gTrade.priceWaveOnSell(cargoId,amount,cityId);
            // 重新刷新窗口 - 重新计算价格 并重绘
            let moneyGain =  price * amount;
            $("#smSpanMoneyDelta").html("+"+toReadableString(moneyGain));
            saleModal._animateSplash("#smSpanMoneyDelta");

            // dbPlayer[pId].money = dbPlayer[pId].money + moneyGain;
            CharacterModel.gainMoney(moneyGain);
            gGui.cityUpdateInfoPanelMoney( cityId);
            CharacterModel.gainExp(moneyGain,'trade');
            // gGui.sysToast('获得经验：'+moneyGain+"。");
            // gGui._npcHail(43,'商家','获得经验：'+moneyGain+"。",false);
            $("#npcHail").html(globalStrings.SALE_PAY+toReadableString(moneyGain)+globalStrings.SALE_GET+toReadableString(moneyGain)+globalStrings.EOL);
            // console.log("sale done.");
            saleModal.drawSaleContent(cityId);
            saleModal.resetCalculator();
        }else{
            // console.log('amount error');
            $("#npcHail").html(globalStrings.SALE_AMOUNT_ERROR);
        }
    }
    static handlerBtnClear(){
        gGui.playSoundEffect();
        $("#calculatorRangeS").val(0);
        $("#calculatorDisplayS").html(0);
    }
    static handlerSlider(){
        $("#calculatorDisplayS").html( $("#calculatorRangeS").val());
    }
    // util functions
    _animateSplash(id){
        $(id).show().addClass('slideOutUp animated show');
        setTimeout(function () { $(id).removeClass('slideOutUp animated show');  $(id).hide(); },600);
    }
}();