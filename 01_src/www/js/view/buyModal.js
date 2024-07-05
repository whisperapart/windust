/**
 * Created by jim on 2020/3/25.
 */
class BuyModal{
    // constructor
    constructor(){
        $('#bmBuy').click(BuyModal.buyItem);
        $('#bmBuyPack').click(BuyModal.buyPack);
        $('#buyModal').on('hidden.bs.modal',function () {
            $("#npcHail").html(globalStrings.MER_HAIL);
        });
    }

    // shared functions
    static drawBuyModal(cityId,npcId){
        $(".modal").modal('hide');
        let items = gDB.getItemDetailForSell(cityId,npcId);
        // console.log(items);
        // 城市发展度比较
        let itemsSell = [];
        let cityDev = parseInt(gDB.getCityById(cityId).devLevel);
        // console.log('city dev ='+cityDev);
        $("#dataSaleCityId").val(cityId);
        for(let i =0;i<items.length;i++){
            if(parseInt(items[i].devLevel) <= parseInt(cityDev)){
                itemsSell.push(items[i]);
            }
        }
        // console.log(itemsSell);
        BuyModal.drawEmptySlots();
        BuyModal.updateBuyModal(itemsSell);
        $('#bmSpanMoney').html(toReadableString(dbPlayer[pId].money));
        $("#buyModal").modal('show');

        // 20220308 杜甫 - 更换城市
        if(parseInt(npcId) === 9){
            gApp.dfCityId = NPCModel.getNextCityIdForDF(parseInt(cityId));
            // console.log(gApp.dfCityId);
        }
    }

    static updateBuyModal(arr){
        $(".kf-pop-over").popover('hide').popover('dispose');
        $("#buyModal .card").hide();
        BuyModal.updateItems(arr);
    }
    static updateItems(arr){
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            BuyModal.drawOneItem(i,arr[i]);
        }
    }
    static drawOneItem(i,itemObj){
        // todo: 如果不可装备，添加红色mask效果，并且不出现装备按钮
        //let itemObj = gDB.getItemById(iid);
        let istr = ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
        // console.log('count='+dbPlayer[pId].inventory[i].count);
        // if (itemObj.stock > 1) {
        //     istr += '<span class="badge">' + itemObj.stock + '</span>';
        // }
        $('#bmSlot'+(i+1)).removeClass()
        // .attr('data-itemid',dbPlayer[pId].inventory[i].id)
            .addClass('item-slot-'+ itemObj.itemLevel).addClass('item-slot').addClass('btn')
            .html(istr)
            .attr('data-itemid',itemObj.itemId);
        // if(ItemModel.isStudyAble(itemObj.itemCate)){
        //     if(!CharacterModel.isEquipAble(itemObj)){
        //         // add red mask
        //         console.log('not equipable for current user');
        //         $('#bmSlot'+(i+1)).addClass('item-disabled');
        //     }
        // }
    }
    static drawEmptySlots(){
        let str = '';
        $("#buyModal .item-wrap").html(str);
        for(let i=1;i<=64;i++){
            str += '<button class="btn item-slot item-slot-empty" id="bmSlot'+i+'"></button>';
        }
        $("#buyModal .item-wrap").html(str);
        $('#buyModal .item-slot').click(BuyModal.clickItem);
    }

    static isShow() {
        return $("#buyModal").css('display') == 'block' ? true : false;
    }
    static hideModal() {
        $("#buyModal").modal('hide');
    }
    static clickItem(){
        gGui.playSoundEffect();
        $("#npcHail").html(globalStrings.MER_HAIL_1);
        $('.item-slot').removeClass('active');
        $("#bmBuy").attr('disabled','disabled');
        $("#buyModal .card-body").html('');

        let iid = parseInt($(this).data('itemid'));
        if(!iid){
            $("#bmBuy").hide();
            $("#bmBuyPack").hide();
            return;
        }
        $(this).addClass('active');
        $(".kf-pop-over").popover('hide').popover('dispose');
        let itemObj = gDB.getItemById(iid);
        let itemStr = ItemModel.toString(itemObj);
        let price = ItemModel.getPrice(itemObj);

        $("#bmCurrentItemId").val(iid);
        $("#bmCurrentItemPrice").val(price);
        $("#bmBuy").show();
        // 如果价格超过money，buy disable
        if(price>dbPlayer[pId].money){
            $("#bmBuy").attr('disabled','disabled');
        }else{
            $("#bmBuy").attr('disabled',false);
        }
        // add 2023.05.16 107 口粮增加批量购买
        if(itemObj.itemId == 107){
            $("#bmBuyPack").show();
            if(price * 50 >dbPlayer[pId].money){
                $("#bmBuyPack").attr('disabled','disabled');
            }else{
                $("#bmBuyPack").attr('disabled',false);
            }
        }else{
            $("#bmBuyPack").hide();
        }

        //console.log(itemStr);
        //if (itemObj.itemId == 107 || itemObj.itemId == 2 || itemObj.itemId == 3) { $('#imUse').html('使用').attr('data-iid', itemId).show(); }
        $("#buyModal .card-body").html(itemStr);
        $("#buyModal .card").show();
    }
    static buyItem(){
        $('#bmBuy').attr("disabled",true);
        let iid = parseInt($("#bmCurrentItemId").val());
        let cost = stringToNumber($('#bmCurrentItemPrice').val());
        let cid = parseInt($("#dataSaleCityId").val());
        if(iid>0){
            if(dbPlayer[pId].inventory.length<64){
                let restMoney = dbPlayer[pId].money - cost;
                if(restMoney>=0){
                    // 如果买的是船，判断是否已经有船了
                    if((iid >=165 )&&(iid <=173)){
                        if(dbPlayer[pId].shipId !== 0){
                            // 已经有船了
                            $("#npcHail").html(globalStrings.MER_BUY_SHIP_FAIL);
                            ShipModal.animateShake("bmBuy");
                            $('#bmBuy').attr("disabled",false);
                            gGui.playSoundEffect("fail");
                            return;
                        }
                    }

                    dbPlayer[pId].money = restMoney;
                    // dbPlayer[pId].inventory.push({id:iid,count:1});
                    let buyResult = CharacterModel.gainItem(iid,1);
                    if(buyResult === -4){    // 唯一物品
                        $("#npcHail").html(globalStrings.MER_BUY_HAVE);
                        ShipModal.animateShake("bmBuy");
                        dbPlayer[pId].money = restMoney + cost; // 购买失败，反钱。
                        $('#bmBuy').attr("disabled",false);
                        gGui.playSoundEffect("fail");
                        return;
                    }
                    $('#bmSpanMoney').html(toReadableString(dbPlayer[pId].money));
                    BuyModal.animateMoneyHUD("-"+parseInt($('#bmCurrentItemPrice').val()));
                    // 如果是船，更新船只信息
                    if((iid >=165 )&&(iid <=173)){
                        CharacterModel.updateShipDataFromInventory();
                        dbPlayer[pId].shipPortId = cid;
                    }
                    // 如果已经有了，要堆叠
                    InventoryModal.sortItem();
                    let itemName = gDB.getItemNameById(iid);
                    $("#npcHail").html(globalStrings.BUY_TIP+' [ '+itemName+' ] '+globalStrings.TRADE_DONE);
                    $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));
                    gGui.playSoundEffect("succ");
                }else{
                    $("#npcHail").html(globalStrings.SHIP_UPDATE_NO_MONEY);
                    BuyModal.animateMoneyShake();
                }
            }else{
                // todo: inventory is full
                $("#npcHail").html(globalStrings.NOT_ENOUGH_ROOM);
            }

        }
        $('#bmBuy').attr("disabled",false);
        gGui.cityUpdateInfoPanelMoney(cid);
    }

    /** 购买 50 份 食物 **/
    static buyPack(){
        let itemObj = gDB.getItemById(107);
        let price = ItemModel.getPrice(itemObj);

        $('#bmBuy').attr("disabled",true);
        $('#bmBuyPack').attr("disabled",true);
        let cost = price * 50;

        if(dbPlayer[pId].inventory.length<64){
            let restMoney = dbPlayer[pId].money - cost;
            if(restMoney>=0){
                dbPlayer[pId].money = restMoney;
                let buyResult = CharacterModel.gainItem(107,50);
                $('#bmSpanMoney').html(toReadableString(dbPlayer[pId].money));
                BuyModal.animateMoneyHUD("-"+cost);
                // 如果已经有了，要堆叠
                InventoryModal.sortItem();
                $("#npcHail").html(globalStrings.BUY_PACK+' [ '+itemObj.itemName+' ] '+globalStrings.TRADE_DONE);
                $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));
                gGui.playSoundEffect("succ");
            }else{
                $("#npcHail").html(globalStrings.SHIP_UPDATE_NO_MONEY);
                BuyModal.animateMoneyShake();
            }
        }else{
            // inventory is full
            $("#npcHail").html(globalStrings.NOT_ENOUGH_ROOM);
        }
        $('#bmBuy').attr("disabled",false);
        $('#bmBuyPack').attr("disabled",false);
    }

    static animateMoneyHUD(disStr){
        // $('#buyModal .left-info .modalSpanMoneyDelta').remove();
        let str = '<span class="modalSpanMoneyDelta">'+disStr+'</span>';
        $("#buyModal .left-info").append(str);
        $("#buyModal .left-info .modalSpanMoneyDelta").show().addClass('slideOutUp animated show');
        setTimeout(function () { $('#buyModal .left-info .modalSpanMoneyDelta').remove(); },600);
    }
    static animateMoneyShake(){
        $("#buyModal .left-info").addClass("animated headShake");
        gGui.playSoundEffect("fail");
        setTimeout(function () { $('#buyModal .left-info').removeClass("animated headShake"); },1000);
    }

    // private functions

    // util functions
}

let buyModal = new BuyModal();