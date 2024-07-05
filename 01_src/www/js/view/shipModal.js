/**
 * Created by jim on 2020/3/25.
 */
class ShipModal{
// constructor
    constructor(){
        $("#shipModalSell").on('click', ShipModal.onBtnSell);
        $("#shipModalSpeedUp").on('click', ShipModal.onBtnSpeedUp);
        $("#shipModalCapacityUp").on('click', ShipModal.onBtnCapacityUp);
        // $("#investBtnOK").on('click', InvestModal.onBtnOK);
    }

    // shared functions
    static drawModal(sellable,upgradable) {
        sellable = sellable || 'no';
        upgradable = upgradable || 'no';

        $('.modal').modal('hide');
        CharacterModel.updateShipDataFromInventory();
        let ship = gDB.getShipById(dbPlayer[pId].shipId);
        if(parseInt(dbPlayer[pId].shipId)<=0 || ship === undefined) {
            $("#npcHail").html(globalStrings.NO_SHIP);
            return;
        }
        // 港口信息
        let port = gDB.getCityById(dbPlayer[pId].shipPortId);
        let zoneName = '';
        if(port !== undefined){ zoneName = port.zoneName; } else {zoneName = globalStrings.KF_TIER_KFTIERNAME_9;}
        // 船只信息
        $("#shipModalName").html(ship.shipName);
        $("#shipModalPort").html(zoneName);
        // 速度
        $("#shipModalSpeed").css("width",(ship.speed*(1+0.1*dbPlayer[pId].shipFitSpeed) / 3.5) + "%");
        $("#shipModalSpeed span").html(ship.speed + " + (" + Math.floor(ship.speed*dbPlayer[pId].shipFitSpeed/10) + ")");
        // 容量
        $("#shipModalCapacity").css("width",(ship.cargoMax*(1+0.1*dbPlayer[pId].shipFitCargo) / 10) + "%");
        $("#shipModalCapacity span").html(ship.cargoMax + " + (" + Math.floor(ship.cargoMax*dbPlayer[pId].shipFitCargo/10) + ")");
        // 补给
        let s1 = dbPlayer[pId].shipSupply/5;
        let s2 = ship.supplyMax/5;
        $("#shipModalSupply1").css("width",s1 + "%");
        $("#shipModalSupply1 span").html(dbPlayer[pId].shipSupply + " / " +ship.supplyMax);
        $("#shipModalSupplyText").html(dbPlayer[pId].shipSupply + " / " + ship.supplyMax);
        $("#shipModalSupply2").css("width",(s2 - s1) + "%");
        // 消耗
        let consumStr = '';
        for(let i=0;i<parseInt(ship.consumption);i++){
            consumStr += '<i class="iconfont icon-explore3"></i>';
        }
        $("#shipModalConsumption").html(consumStr);
        // 升级
        if(('yes' === upgradable) && (dbPlayer[pId].shipFitSpeed < 3)){
            // $("#shipModalSpeedUpWrap:nth-child(2)").html(ShipModal.getUpgradePriceSpeed());
            $("#shipModalSpeedUp").show();
        }else{
            // $("#shipModalSpeedUpWrap:nth-child(2)").html("");
            $("#shipModalSpeedUp").hide();
        }
        if(('yes' === upgradable) && (dbPlayer[pId].shipFitCargo < 3)){
            // $("#shipModalCapacityUpWrap:nth-child(2)").html(ShipModal.getUpgradePriceCapacity());
            $("#shipModalCapacityUp").show();
        }else{
            // $("#shipModalCapacityUpWrap:nth-child(2)").html("");
            $("#shipModalCapacityUp").hide();
        }

        // 速度
        let spdStr = '';
        for(let i=0;i<dbPlayer[pId].shipFitSpeed;i++){ spdStr += '<i class="iconfont icon-speed1"></i>';}
        $("#shipModalSpeedUp").siblings("span:last").html(spdStr);
        let capStr = '';
        for(let i=0;i<dbPlayer[pId].shipFitCargo;i++){ capStr += '<i class="iconfont icon-reg"></i>';}
        $("#shipModalCapacityUp").siblings("span:last").html(capStr);

        if('yes' === sellable){
            let sp = Math.floor(stringToNumber(ship.price)*(1-gApp.getMerchantProfit()));
            $("#shipModalSellPrice").html(globalStrings.PRICE+":"+ toReadableString(sp)).data('price',sp);
            $("#shipModalSell").show();
        }else{
            $("#shipModalSellPrice").html(globalStrings.PRICE+":" + toReadableString(Math.floor(stringToNumber(ship.price))));
            $("#shipModalSell").hide();
        }

        // 货物
        let cargoStr = '<li class="list-group-item d-flex justify-content-between align-items-center cityInfoCargo"><span>'+globalStrings.CARGO+'</span><span>'+globalStrings.STOCK+'</span><span>'+globalStrings.COST+'</span>';
        let cp = 0;
        for(let i=0;i<dbPlayer[pId].cargoArr.length;i++){
            let cargoName = gDB.getCargoNameById(dbPlayer[pId].cargoArr[i].cargoId);
            cargoStr += '<li class="list-group-item d-flex justify-content-between align-items-center cityInfoCargo">' +
                '<span><svg class="icon" aria-hidden="true"><use xlink:href="' +
                utilGetCssIconById(dbPlayer[pId].cargoArr[i].cargoId) +
                '"></use></svg>&nbsp;'
                +cargoName+'</span><span>'+dbPlayer[pId].cargoArr[i].count+'</span><span>'+dbPlayer[pId].cargoArr[i].cost+'</span></li>';
            cp += dbPlayer[pId].cargoArr[i].count;
        }
        $("#shipModalCargoList").html(cargoStr);

        let cargoMax = CharacterModel.getShipCargoCapacity();
        $("#shipModalCapacityText").html(cp + " / " + cargoMax);

        $('#shipModal').modal('show');
    }
    static isShow() {
        return $("#shipModal").css('display') == 'block' ? true : false;
    }
    static hideModal() {
        $("#shipModal").modal('hide');
    }

    static onBtnSell(){
        gGui.playSoundEffect();
        $("#npcHail").html(globalStrings.SELL_SHIP);
        // let priceStr = $("#shipModalSellPrice").html();
        let priceStr = $("#shipModalSellPrice").data('price');
        let price  = stringToNumber(priceStr);
        if(price > 0){
            // 检查货物
            let used = CharacterModel.getShipCargoUsed();
            if(used>0){
                // 还有货物，无法出售，gui 音效 效果
                ShipModal.animateShake("shipModal .card-body");
                $("#npcHail").html(globalStrings.CARGO_FIRST);
            }else{
                let intSid = parseInt(dbPlayer[pId].shipId);
                if(intSid <=0){ return; }
                let shipName = $("#shipModalName").html();
                let shipPort = $("#shipModalPort").html();
                let itemId = 164 + intSid;
                CharacterModel.removeItem(itemId,1);    // 删除船契
                CharacterModel.removeShip();    // 重置dbPlayer 船只数据
                $(".modal").modal("hide");  // 关闭窗口
                // $("#citySpanMoney").html(dbPlayer[pId].money); // city 左边页面加入 金币效果
                dbPlayer[pId].money += price;
                $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));
                $("#npcHail").html(globalStrings.SELL_SHIP_1+" [ "+shipPort+" ] "+globalStrings.SELL_SHIP_2+" [ "+shipName+" ] "+globalStrings.SELL_SHIP_3+" [ " + toReadableString(price) + " ]"+globalStrings.EOL);
                //
            }
        }
    }

    static getUpgradePriceSpeed(){
        let ship = gDB.getShipById(dbPlayer[pId].shipId);
        let price = Math.ceil( stringToNumber(ship.price) * 0.1 * (dbPlayer[pId].shipFitSpeed + 1));
        return toReadableString(price);
    }
    static getUpgradePriceCapacity(){
        let ship = gDB.getShipById(dbPlayer[pId].shipId);
        let price = Math.ceil( stringToNumber(ship.price) * 0.1 * (dbPlayer[pId].shipFitCargo + 1));
        return toReadableString(price);
    }

    static onBtnSpeedUp(){
        // 获得船信息
        gGui.playSoundEffect();
        if(dbPlayer[pId].shipId <=0){ $("#npcHail").html(globalStrings.NO_SHIP);return;}
        let ship = gDB.getShipById(dbPlayer[pId].shipId);
        if(ship === undefined){ $("#npcHail").html(globalStrings.NO_SHIP);return;}
        // 判断是否能够升级
        if(dbPlayer[pId].shipFitSpeed >=3) { $("#npcHail").html(globalStrings.SHIP_UPDATE_MAX);return;}
        // 计算升级费用
        let price = Math.ceil( stringToNumber(ship.price) * 0.1 * (dbPlayer[pId].shipFitSpeed + 1));
        // 钱够不够的判断
        let moneyLeft = dbPlayer[pId].money - price;
        if(moneyLeft >=0 ){
            dbPlayer[pId].money = moneyLeft;
            dbPlayer[pId].shipFitSpeed += 1;
            $("#npcHail").html("[ "+ship.shipName+" ] "+globalStrings.SHIP_UPDATE_1+" [ "+dbPlayer[pId].shipFitSpeed+" ] "+globalStrings.SHIP_UPDATE_2+" [ "+toReadableString(price)+" ]"+globalStrings.EOL);
            ShipModal.drawModal("no","yes");
            $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));
        }else{
            $("#npcHail").html(globalStrings.SHIP_UPDATE_MONEY+" [ "+toReadableString(price)+" ], "+globalStrings.SHIP_UPDATE_NO_MONEY);
            ShipModal.animateShake("shipModalSpeedUpWrap");
        }

        let dialogIdx = $("#shipModal").attr('z-index');
        // console.log("zindex="+dialogIdx);
        $("#npcWelcome").attr('z-index',parseInt(dialogIdx)+1);
    }

    static onBtnCapacityUp(){
        gGui.playSoundEffect();
        // 获得船信息
        if(dbPlayer[pId].shipId <=0){ $("#npcHail").html(globalStrings.NO_SHIP);return;}
        let ship = gDB.getShipById(dbPlayer[pId].shipId);
        if(ship === undefined){ $("#npcHail").html(globalStrings.NO_SHIP);return;}
        // 判断是否能够升级
        if(dbPlayer[pId].shipFitCargo >=3) { $("#npcHail").html(globalStrings.SHIP_UPDATE_MAX);return;}
        // 计算升级费用
        let price = Math.ceil( stringToNumber(ship.price) * 0.1 * (dbPlayer[pId].shipFitCargo + 1));
        // 钱够不够的判断
        let moneyLeft = dbPlayer[pId].money - price;
        if(moneyLeft >=0 ){
            dbPlayer[pId].money = moneyLeft;
            dbPlayer[pId].shipFitCargo += 1;
            $("#npcHail").html("[ "+ship.shipName+" ] "+globalStrings.SHIP_UPDATE_3+" [ "+dbPlayer[pId].shipFitSpeed+" ] "+globalStrings.SHIP_UPDATE_2+" [ "+toReadableString(price)+" ]"+globalStrings.EOL);
            ShipModal.drawModal("no","yes");
            $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));
        }else{
            $("#npcHail").html(globalStrings.SHIP_UPDATE_MONEY+" [ "+toReadableString(price)+" ], "+globalStrings.SHIP_UPDATE_NO_MONEY);
            ShipModal.animateShake("shipModalCapacityUpWrap");
        }

        let dialogIdx = $("#shipModal").css('z-index');
        console.log("zindex="+dialogIdx);
        $("#npcWelcome").css('z-index',parseInt(dialogIdx)+1);
    }

    // private functions

    // util functions
    static animateMoneyHUD(htmlId, disStr){
        // $('#buyModal .left-info .modalSpanMoneyDelta').remove();
        let str = '<span class="modalSpanMoneyDelta">'+disStr+'</span>';
        $("#"+htmlId).append(str);
        $("#"+htmlId+" .modalSpanMoneyDelta").show().addClass('slideOutUp animated show');
        // setTimeout(function () { $("#"+htmlId+" .modalSpanMoneyDelta").remove(); },600);
    }
    static animateMoneyShake(){
        $("#shipModal .left-info").addClass("animated headShake");
        setTimeout(function () { $('#shipModal .left-info').removeClass("animated headShake"); },1000);
    }
    static animateShake(id){
        gGui.playSoundEffect("fail");
        $("#"+id).addClass("animated headShake");
        setTimeout(function () { $("#"+id).removeClass("animated headShake"); },1000);
    }
}

let shipModal = new ShipModal();