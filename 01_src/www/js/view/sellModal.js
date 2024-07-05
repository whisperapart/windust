/**
 * Created by jim on 2020/3/25.
 */

class SellModal{
// constructor
    constructor(){
        $('#smSell').click(SellModal.sellItemOne);
        $('#smSellStack').click(SellModal.sellItemStack);
        $('#sellModal').on('hidden.bs.modal',function () {
            $("#npcHail").html(globalStrings.MER_HAIL_1);
        });
        $("#sellModal .card").hide();
        $(document).click(function() {
            $(".kf-pop-over").popover('hide').popover('dispose');
        });
    }

    // shared functions
    static drawModal(intNpcId) {
        $('.modal').modal('hide');
        SellModal.drawEmptySlots();
        SellModal.drawItems();
        SellModal.markSellAblesForNpc(intNpcId);
        $("#sellModalSpanMoney").html(toReadableString(dbPlayer[pId].money));
        $('#sellModal').modal('show');
        // SellModal.updateEquipAbles();
    }

    static isShow() {
        return $("#sellModal").css('display') === 'block';
    }
    static hideModal() {
        $("#sellModal").modal('hide');
    }

    static drawEmptySlots(){
        let str = '';
        $("#sellModal .item-wrap").html(str);
        for(let i=1;i<=64;i++){
            str += '<button class="btn item-slot item-slot-empty" id="smSlot'+i+'"></button>';
        }
        $("#sellModal .item-wrap").html(str);
        // $('#sellModal .item-slot').click(SellModal.clickItem);
        $('#sellModal .item-slot').click(SellModal.clickItem);
    }

    static drawItems(intNpcId) {
        $("#sellModal .card").hide();
        SellModal.updateItems(intNpcId);
        $("#sellModalSpanMoney").html(toReadableString(dbPlayer[pId].money));
    }
    static updateItems(){
        let len = dbPlayer[pId].inventory.length;
        for (let i = 0; i < len; i++) {
            SellModal.drawOneItem(i);
        }
    }
    static drawOneItem(i){
        let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
        let istr = ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
        if (dbPlayer[pId].inventory[i].count > 1) {
            istr += '<span class="badge">' + dbPlayer[pId].inventory[i].count + '</span>';
        }
        // if(jQuery.inArray(dbPlayer[pId].inventory[i].id, dbPlayer[pId].eqList) >= 0 ){
        //     istr += '<span class="badge"><i class="iconfont icon-lock"></i></span>';
        // }
        $('#smSlot'+(i+1)).removeClass()
            .addClass('item-slot-'+ itemObj.itemLevel).addClass('item-slot').addClass('btn')
            .html(istr).addClass('btn-dark').addClass('disabled').css('opacity','0.1');
        // 默认全部disable ，不给卖。 调用 markSellAblesForNpc 启用
    }
    static markSellAblesForNpc(intNpcId){
        $("#sellModalNpcId").val(intNpcId);
        // console.log("update items, npcId="+intNpcId);
        // todo: 检查是否已经装备，装备的物品无法出售
        intNpcId = parseInt(intNpcId);
        let len = dbPlayer[pId].inventory.length;
        switch (intNpcId){
            case 42:    // 42 马商 - 缰绳
                // console.log("进入马商");
                $("#sellModalTitle").html(globalStrings.SM_SELL_HORSE);
                for (let i = 0; i < len; i++) {
                    // todo:check - 起码进城，卖掉了马的情况 - 如果进城自动下马，不需要考虑这个问题
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    if((2 === dbPlayer[pId].inventory[i].id) || (3 === dbPlayer[pId].inventory[i].id) ){
                        $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                    }
                }
                break;
            case 45:    // 小二 - 杂物
                // console.log("进入小二");
                $("#sellModalTitle").html(globalStrings.SM_SELL_MISC);
                for (let i = 0; i < len; i++) {
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    // 是杂物，并且是 食物、金锭、银锭
                    if((globalStrings.ITEM_CATE_MISC === itemObj.itemCate) && (dbPlayer[pId].inventory[i].id >=13) && (dbPlayer[pId].inventory[i].id <=20 )){
                        // console.log("绘制 杂物");
                        // console.log(itemObj);
                        $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                    }
                    // if(("杂物" === itemObj.itemCate) && (dbPlayer[pId].inventory[i].id >=GlobalConfig.ITEM_HERB_ID) && (dbPlayer[pId].inventory[i].id <=GlobalConfig.ITEM_MED_MAX_ID )){
                    //     $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                    // }
                }
                break;
            case 46:        // 工匠 - 装备
                // console.log("进入工匠");
                $("#sellModalTitle").html(globalStrings.SM_SELL_EQUIP);
                for (let i = 0; i < len; i++) {
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    if( ItemModel.isEquipAble(itemObj.itemCate)){
                        $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                    }
                }
                break;
            case 47:    // 47 教头 - 秘籍
                // console.log("进入教头");
                $("#sellModalTitle").html(globalStrings.SM_SELL_SECRET);
                for (let i = 0; i < len; i++) {
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    if( ItemModel.isKFBook(itemObj.itemCate) ){
                        // 检查是否已经装备/修习，装备及修习的装备无法出售
                        if(dbPlayer[pId].eqList.indexOf(dbPlayer[pId].inventory[i].id) <=0){
                            $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                        }
                    }
                }
                break;
            case 48: // 48、55 学者 教授 - 宝石
                // console.log("进入学者");
                $("#sellModalTitle").html(globalStrings.SM_SELL_MED);
                for (let i = 0; i < len; i++) {
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    // if( ItemModel.isGem(dbPlayer[pId].inventory[i].id)){
                    //     $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                    // }
                    if((globalStrings.ITEM_CATE_MISC === itemObj.itemCate) && (dbPlayer[pId].inventory[i].id >=GlobalConfig.ITEM_HERB_ID) && (dbPlayer[pId].inventory[i].id <=GlobalConfig.ITEM_MED_MAX_ID )){
                        $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                    }
                }
                break;
            case 55:// 48、55 学者 教授 - 宝石
                // console.log("进入教授");
                $("#sellModalTitle").html(globalStrings.SM_SELL_ESS);
                for (let i = 0; i < len; i++) {
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    if( ItemModel.isGem(itemObj.itemCate)){
                        $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                    }
                }
                break;
            case 58:// [58,62] 医生 - 医书
                // console.log("进入医生");
                $("#sellModalTitle").html(globalStrings.SM_SELL_MB);
                for (let i = 0; i < len; i++) {
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    if( ItemModel.isHealBook(itemObj.itemCate)){
                        // 检查是否已经装备/修习，装备及修习的装备无法出售
                        if(dbPlayer[pId].eqList.indexOf(dbPlayer[pId].inventory[i].id) <=0){
                            $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                        }
                    }
                }
                break;
            case 59:
                // console.log("进入医生");
                $("#sellModalTitle").html(globalStrings.SM_SELL_MB);
                for (let i = 0; i < len; i++) {
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    if( ItemModel.isHealBook(itemObj.itemCate)){
                        // 检查是否已经装备/修习，装备及修习的装备无法出售
                        if(dbPlayer[pId].eqList.indexOf(dbPlayer[pId].inventory[i].id) <=0){
                            $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                        }
                    }
                }
                break;
            case 60:
                // console.log("进入医生");
                $("#sellModalTitle").html(globalStrings.SM_SELL_MB);
                for (let i = 0; i < len; i++) {
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    if( ItemModel.isHealBook(itemObj.itemCate)){
                        // 检查是否已经装备/修习，装备及修习的装备无法出售
                        if(dbPlayer[pId].eqList.indexOf(dbPlayer[pId].inventory[i].id) <=0){
                            $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                        }
                    }
                }
                break;
            case 61:
                // console.log("进入医生");
                $("#sellModalTitle").html(globalStrings.SM_SELL_MB);
                for (let i = 0; i < len; i++) {
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    if( ItemModel.isHealBook(itemObj.itemCate)){
                        // 检查是否已经装备/修习，装备及修习的装备无法出售
                        if(dbPlayer[pId].eqList.indexOf(dbPlayer[pId].inventory[i].id) <=0){
                            $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                        }
                    }
                }
                break;
            case 62:
                // console.log("进入医生");
                $("#sellModalTitle").html(globalStrings.SM_SELL_MB);
                for (let i = 0; i < len; i++) {
                    if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)) continue; // 装备的不能卖
                    let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                    if( ItemModel.isHealBook(itemObj.itemCate)){
                        // 检查是否已经装备/修习，装备及修习的装备无法出售
                        if(dbPlayer[pId].eqList.indexOf(dbPlayer[pId].inventory[i].id) <=0){
                            $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
                        }
                    }
                }
                break;
            default:
                // console.log("默认绘制");
                break;
        }
        for (let i = 0; i < len; i++) {
            if((21 === dbPlayer[pId].inventory[i].id) || (22 === dbPlayer[pId].inventory[i].id)){
                // 金锭与银锭
                // console.log("绘制 金银");
                $('#smSlot'+(i+1)).removeClass('disabled').removeClass('btn-dark').css('opacity','1.0');
            }
        }
    }

    static updateEquips(){
        for(let i = 0;i<dbPlayer[pId].eqList.length;i++){
            if(dbPlayer[pId].eqList[i] > 0 ){
                SellModal.updateItemByItemId(dbPlayer[pId].eqList[i]);
            }
        }
    }
    static updateEquipAbles(){
        let len = dbPlayer[pId].inventory.length;
        for (let i = 0; i < len; i++) {
            if(dbPlayer[pId].inventory[i].id > 0){
                let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                if ( ItemModel.isEquipAble(itemObj.itemCate) || ItemModel.isStudyAble(itemObj.itemCate) ){
                    SellModal.drawOneItem(i);
                }
            }
        }


    }
    static updateItemByItemId(itemId){
        let idx = -1;
        for(let i=0;i<dbPlayer[pId].inventory.length;i++){
            if(dbPlayer[pId].inventory[i].id === itemId){
                idx = i;
                break;
            }
        }
        if(idx >= 0){
            SellModal.drawOneItem(idx);
        }
    }

    static clickItem() {
        gGui.playSoundEffect();
        $('.item-slot').removeClass('active');
        $(this).addClass('active');
        $(".im-btn-action").attr('data-iid', '').hide();

        let iid = parseInt($(this).attr('id').substr(6));
        if(isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length){
            $("#sellModal .card-body").html('');
            $("#sellModal .card").hide();
            $('#smInventoryIdx').val('');
            return;
        }
        $('#smInventoryIdx').val(iid);
        let itemId = dbPlayer[pId].inventory[iid-1].id;
        if (itemId === undefined) {
            $("#sellModal .card-body").html('');
            $("#sellModal .card").hide();
            $('#smInventoryIdx').val('');
            return;
        }
        let itemObj = gDB.getItemById(itemId);
        let itemStr = ItemModel.toString(itemObj);
        let profit = gApp.getMerchantProfit();
        let price = stringToNumber(itemObj.itemPrice) * (1 - profit);
        price = Math.ceil(price);
        itemStr += "<p>"+globalStrings.SM_PROFIT+":"+ toPercentString(profit) +"<br/>"+globalStrings.PRICE+":"+toReadableString(price)+"</p>"
        if(itemObj.itemSellable){
            $("#smSell").show();
            $("#smSellStack").show();
            $("#smSellUnsellable").hide();
        }else{
            $("#smSell").hide();
            $("#smSellStack").hide();
            $("#smSellUnsellable").show();
        }

        $("#sellModal .card-body").html(itemStr);
        $("#sellModal .card").show();
    }

    /**
     * 卖出一个当前物品，如果只有一个=移除，如果这堆有多个，数量减少一个
     */
    static sellItemOne(){
        gGui.playSoundEffect();
        let iid = parseInt($('#smInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#smInventoryIdx').val('');
            return;
        }
        let id = parseInt(dbPlayer[pId].inventory[iid-1].id);
        // console.log("itemid = "+id);
        // let count = parseInt(dbPlayer[pId].inventory[iid-1].count);
        if(id<=0) return;
        let itemObj = gDB.getItemById(id);
        if(!itemObj) return;
        if(!itemObj.itemSellable){  // 无法卖出
            SellModal.animateShakeThis($("smSell"));
            return;
        }
        // bug-fixing: "1,600,000" -> 1 .... mother fuck
        let profit = gApp.getMerchantProfit();
        let price = stringToNumber(itemObj.itemPrice) * (1 - profit);
        price = Math.ceil(price);
        // console.log("sell item=" +itemObj.itemName +" for price="+price);
        CharacterModel.removeItem(id,1);
        CharacterModel.gainMoney(price);
        SellModal.animateMoneyHUD("+"+price);
        // sell item - calc price
        // sell one by one
        // remove from inventory
        SellModal.drawEmptySlots();
        // get npc id
        let npcId = parseInt($("#sellModalNpcId").val());
        SellModal.drawItems();
        SellModal.markSellAblesForNpc(npcId);
        $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));
        $("#smSlot"+iid).removeClass("active");
    }

    /**
     * 卖出整堆，如果最大堆叠50，当前46，卖出46个。
     * bug-fix : 这个功能改为，出售全部，比如2堆，1堆50 1堆46，点了之后，出售96个
     */
    static sellItemStack(){
        gGui.playSoundEffect();
        let iid = parseInt($('#smInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#smInventoryIdx').val('');
            return;
        }
        let id = parseInt(dbPlayer[pId].inventory[iid-1].id);
        if(id<=0) return;
        let itemObj = gDB.getItemById(id);
        if(!itemObj) return;
        if(!itemObj.itemSellable){  // 无法卖出
            SellModal.animateShakeThis($("smSellStack"));
            return;
        }

        let profit = gApp.getMerchantProfit();
        let price = stringToNumber(itemObj.itemPrice) * (1 - profit);
        price = Math.ceil(price);

        // console.log("sell item=" +itemObj.itemName +" for price="+price);
        // bug-fix: 改为全部出售
        // let count = parseInt(dbPlayer[pId].inventory[iid-1].count);
        let count = CharacterModel.countItem(id);
        if(count <=0)return;
        CharacterModel.removeItem(id,count);
        let amount = price * count;
        CharacterModel.gainMoney(amount);
        SellModal.animateMoneyHUD("+"+amount);
        SellModal.drawEmptySlots();
        let npcId = parseInt($("#sellModalNpcId").val());
        SellModal.drawItems();
        SellModal.markSellAblesForNpc(npcId);
        $("#citySpanMoney").html(toReadableString(dbPlayer[pId].money));
        $("#smSlot"+iid).removeClass("active");
    }


    static animateMoneyHUD(disStr){
        // $('#buyModal .left-info .modalSpanMoneyDelta').remove();
        // let str = '<span class="sellModalSpanMoneyDelta">'+disStr+'</span>';
        $("#sellModal .left-info #sellModalSpanMoneyDelta").html(disStr);
        $("#sellModal .left-info #sellModalSpanMoneyDelta").show().addClass('slideOutUp animated show');
        setTimeout(function () { $('#sellModal .left-info #sellModalSpanMoneyDelta').removeClass('slideOutUp animated show').hide(); },600);
    }
    static animateMoneyShake(){
        $("#sellModal .left-info").addClass("animated headShake");
        setTimeout(function () { $('#sellModal .left-info').removeClass("animated headShake"); },1000);
    }
    static animateShakeThis(ele){
        gGui.playSoundEffect("fail");
        $(ele).addClass("animated headShake");
        setTimeout(function () { $(ele).removeClass("animated headShake"); },1000);
    }


    // private functions

    // util functions
    utilGetInventoryData() {

    }
}

let sellModal = new SellModal();