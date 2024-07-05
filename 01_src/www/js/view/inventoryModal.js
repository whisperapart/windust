/**
 * Created by jim on 2020/3/25.
 */

class InventoryModal {
    // constructor
    constructor() {
        $("#inventoryModal .card").hide();
        $('#imSort').bind('click', InventoryModal.sortItem);
        $('#imUse').click(InventoryModal.imUse);
        $('#imStudy').click(InventoryModal.imStudy);
        $('#imUnStudy').click(InventoryModal.imUnStudy);
        $('#imEat').click(InventoryModal.imEat);
        $('#imEquip').click(InventoryModal.imEquip);
        $('#imUnEquip').click(InventoryModal.imUnEquip);
        $('#imDrop').click(InventoryModal.imDrop);
        $(document).click(function() {
            $(".kf-pop-over").popover('hide').popover('dispose');
        });

    }

    // shared functions
    static drawModal(cancelEsc = false) {
        $('.modal').modal('hide');
        InventoryModal.drawEmptySlots();
        InventoryModal.drawItems();
        $("#imSpanMoney").html(toReadableString(dbPlayer[pId].money));
        // if(!BOOL_NEW_GAME){
        //     $("#imSlot6").removeClass("blink");
        //     $("#imStudy").removeClass("blink");
        // }
        if(cancelEsc){
            console.log('init inventory modal with keyboard false');
            $('#inventoryModal').modal({show:true,keyboard:false});
        }else{
            console.log('init inventory modal with keyboard support');
            $('#inventoryModal').modal({show:true,keyboard:true});
        }

    }

    static isShow() {
        return $("#inventoryModal").css('display') === 'block' ? true : false;
    }
    static hideModal() {
        $("#inventoryModal").modal('hide');
    }

    static drawEmptySlots(){
        let str = '';
        $("#inventoryModal .item-wrap").html(str);
        for(let i=1;i<=64;i++){
            str += '<button class="btn item-slot item-slot-empty" id="imSlot'+i+'"></button>';
        }
        $("#inventoryModal .item-wrap").html(str);
        $('#inventoryModal .item-slot').click(InventoryModal.clickItem);
    }
    static drawItems() {
        $(".kf-pop-over").popover('hide').popover('dispose');
        $("#inventoryModal .card").hide();
        InventoryModal.updateItems();
    }
    static updateItems(){
        let len = dbPlayer[pId].inventory.length;
        for (let i = 0; i < len; i++) {
            if(dbPlayer[pId].inventory[i].id > 0){
                InventoryModal.drawOneItem(i);
            }
        }
    }
    static drawOneItem(i){
        // 如果不可装备，添加红色mask效果，并且不出现装备按钮
        let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
        let istr = ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
        // console.log('count='+dbPlayer[pId].inventory[i].count);
        if (dbPlayer[pId].inventory[i].count > 1) {
            istr += '<span class="badge">' + dbPlayer[pId].inventory[i].count + '</span>';
        }
        // if(jQuery.inArray(dbPlayer[pId].inventory[i].id, dbPlayer[pId].eqList) >= 0 ){
        //     istr += '<span class="badge"><i class="iconfont icon-lock"></i></span>';
        // }
        // bug-fixing: 装备物品标记，装备的物品第一个标记，其他的不标记
        if(CharacterModel.isEquipped(dbPlayer[pId].inventory[i].id)){
            let inv_idx = -1;
            for(let j=0;j<dbPlayer[pId].inventory.length;j++){
                if(dbPlayer[pId].inventory[j].id === dbPlayer[pId].inventory[i].id){
                    inv_idx = j;
                    break;
                }
            }
            if(inv_idx === i){
                istr += '<span class="badge"><i class="iconfont icon-lock"></i></span>';
            }
        }


        $('#imSlot'+(i+1)).removeClass()
            // .attr('data-itemid',dbPlayer[pId].inventory[i].id)
            .addClass('item-slot-'+ itemObj.itemLevel).addClass('item-slot').addClass('btn')
            .html(istr);
        if(ItemModel.isStudyAble(itemObj.itemCate)){
            // console.log('cate = equipable = '+ itemObj.itemCate);
            if(!CharacterModel.isAbleToStudy(itemObj.kfId)){
                // add red mask
                // console.log('not equipable for current user');
                $('#imSlot'+(i+1)).addClass('item-disabled');
            }
        }
    }
    static updateEquips(){
        for(let i = 0;i<dbPlayer[pId].eqList.length;i++){
            if(dbPlayer[pId].eqList[i] > 0 ){
                InventoryModal.updateItemByItemId(dbPlayer[pId].eqList[i]);
            }
        }
    }
    static updateEquipAbles(){
        let len = dbPlayer[pId].inventory.length;
        for (let i = 0; i < len; i++) {
            if(dbPlayer[pId].inventory[i].id > 0){
                let itemObj = gDB.getItemById(dbPlayer[pId].inventory[i].id);
                if ( ItemModel.isEquipAble(itemObj.itemCate) || ItemModel.isStudyAble(itemObj.itemCate) ){
                    InventoryModal.drawOneItem(i);
                }
            }
        }


    }
    static updateItemByItemId(itemId){
        let idx = -1;
        for(let i=0;i<dbPlayer[pId].inventory.length;i++){
            if(dbPlayer[pId].inventory[i].id == itemId){
                idx = i;
                break;
            }
        }
        if(idx >= 0){
            InventoryModal.drawOneItem(idx);
        }
    }

    static clickItem() {
        gGui.playSoundEffect();
        $('.item-slot').removeClass('active');
        $(this).addClass('active');
        $(".im-btn-action").attr('data-iid', '').hide();
        $(".kf-pop-over").popover('hide').popover('dispose');

        $('#imStudy').hide();$('#imUnStudy').hide();
        $('#imEquip').hide();$('#imUnEquip').hide();
        $('#imEat').hide();$('#imUse').hide();
        $("#imDrop").hide();


        let iid = parseInt($(this).attr('id').substr(6));
        if(isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length){
            $("#inventoryModal .card-body").html('');
            $("#inventoryModal .card").hide();
            $('#imInventoryIdx').val('');
            return;
        }
        $('#imInventoryIdx').val(iid);
        let itemId = dbPlayer[pId].inventory[iid-1].id;
        if (itemId == undefined) {
            $("#inventoryModal .card-body").html('');
            $("#inventoryModal .card").hide();
            $('#imInventoryIdx').val('');
            return;
        }
        let itemObj = gDB.getItemById(itemId);
        let itemStr = ItemModel.toString(itemObj);
        $("#inventoryModal .card-body").html(itemStr);

        // 可装备
        if ( ItemModel.isEquipAble(itemObj.itemCate)) {
            if(jQuery.inArray(itemId,dbPlayer[pId].eqList)>=0){ // 已装备
                $('#imUnEquip').attr('data-iid', itemId).show();
            }else{
                if(CharacterModel.isEquipAble(itemObj)){    // 玩家达到装备要求
                    $('#imEquip').attr('data-iid', itemId).show();
                }
                if (itemObj.itemDropable === 1) $("#imDrop").attr('data-iid', itemId).show();
            }
        }
        // 可修习
        if(ItemModel.isStudyAble(itemObj.itemCate)){
            if(jQuery.inArray(itemId,dbPlayer[pId].eqList)>=0) { // 已修习
                $('#imUnStudy').attr('data-iid', itemId).show();
            }else{
                if(CharacterModel.isAbleToStudy(itemObj.kfId)){ // 可修习物品，当前玩家可能无法修习
                    // 检查是否有足够的修习空位
                    if(itemObj.itemCate === '外功秘笈'){
                        if(dbPlayer[pId].wgList[0].kfId === undefined || dbPlayer[pId].wgList[1].kfId === undefined
                            || dbPlayer[pId].wgList[2].kfId === undefined  || dbPlayer[pId].wgList[3].kfId === undefined
                            || dbPlayer[pId].wgList[0].kfId === itemObj.kfId || dbPlayer[pId].wgList[1].kfId === itemObj.kfId || dbPlayer[pId].wgList[2].kfId === itemObj.kfId || dbPlayer[pId].wgList[3].kfId === itemObj.kfId) {
                            $('#imStudy').attr('data-iid', itemId).show();
                        }
                    }
                    if(itemObj.itemCate === '内功秘笈'){
                        if(dbPlayer[pId].ngList[0].kfId === undefined   || dbPlayer[pId].ngList[1].kfId === undefined
                            || dbPlayer[pId].ngList[2].kfId === undefined   || dbPlayer[pId].ngList[3].kfId === undefined
                            || dbPlayer[pId].ngList[0].kfId === itemObj.kfId || dbPlayer[pId].ngList[1].kfId === itemObj.kfId
                            || dbPlayer[pId].ngList[2].kfId === itemObj.kfId || dbPlayer[pId].ngList[3].kfId === itemObj.kfId
                        ) {
                            $('#imStudy').attr('data-iid', itemId).show();
                        }
                    }
                    if(itemObj.itemCate === '轻功秘笈'){
                        if(dbPlayer[pId].qgList[0].kfId === undefined   || dbPlayer[pId].qgList[1].kfId === undefined
                            || dbPlayer[pId].qgList[0].kfId === itemObj.kfId || dbPlayer[pId].qgList[1].kfId === itemObj.kfId
                        ) {
                            $('#imStudy').attr('data-iid', itemId).show();
                        }
                    }
                    // if(dbPlayer[pId].zlKfId === itemObj.kfId){
                    //     $('#imStudy').attr('data-iid', itemId).show();
                    // }
                    if(itemObj.itemCate === '医书'){
                        $('#imStudy').attr('data-iid', itemId).show();
                    }

                }
                if (itemObj.itemDropable === 1) $("#imDrop").attr('data-iid', itemId).show();
            }
        }
        // 特殊物品
        if (itemObj.itemId == 2 || itemObj.itemId == 3) {
            if(game.scene.isActive("WorldScene")){  // bug-fix :20240519 只有在大地图才能使用 缰绳
                $('#imUse').attr('data-iid', itemId).show();
            }
        } // 缰绳
        if (itemObj.itemId == 107) { // 口粮
            $('#imEat').attr('data-iid', itemId).show();
            $("#imDrop").attr('data-iid', itemId).show();
        }


        // // 可销毁
        // if (itemObj.itemDropable == 1) $("#imDrop").show();
        // if ( ItemModel.isEquipAble(itemObj.itemCate)) {
        //     if(jQuery.inArray(itemId,dbPlayer[pId].eqList)>=0){
        //         $('#imUse').html('卸下').attr('data-iid', itemId).show();
        //         $('#imDrop').hide();
        //     }else{
        //         if(ItemModel.isEquipAble(itemObj.itemCate)){
        //             if(CharacterModel.isEquipAble(itemObj)){
        //                 $('#imUse').html('装备').attr('data-iid', itemId).show();
        //                 if(itemObj.itemDropable == 1){$('#imDrop').show();}
        //             }else{
        //                 $('#imUse').attr('data-iid', '').hide();
        //             }
        //         }else{
        //             $('#imUse').attr('data-iid', '').hide();
        //         }
        //     }
        // } else {
        //     $('#imUse').attr('data-iid', '').hide();
        // }
        // // 可修习
        // if(ItemModel.isStudyAble(itemObj.itemCate)){
        //     $('#imUse').html('修习').attr('data-iid', itemId).show();
        //     // 确定是否满足修习条件
        //     if(CharacterModel.isAbleToStudy(itemObj.kfId)){
        //         $('#imUse').html('修习').attr("disabled",false);
        //     }else{
        //         $('#imUse').html('修习').attr("disabled",true);
        //     }
        //
        //     // 如果已经在修习
        //     if(dbPlayer[pId].learningKFId === itemObj.kfId){
        //         $('#imUse').html('辍学').attr("disabled",false);
        //         $('#imDrop').hide();
        //     }
        //
        // }else{
        //     $('#imUse').attr("disabled",false);
        // }
        // if (itemObj.itemId == 2 || itemObj.itemId == 3) { $('#imUse').html('使用').attr('data-iid', itemId).show(); } // 缰绳
        // if (itemObj.itemId == 107) { $('#imUse').html('吃').attr('data-iid', itemId).show(); }  // 口粮


        $("#inventoryModal .card").show();

        $(".kf-pop-over").click(function(e) {
            $(".kf-pop-over").popover('toggle');
            $('.popover').click(function(e) {
                // e.preventDefault();
                // e.stopPropagation();
                return false;
            });
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    static imUse(){
        gGui.playSoundEffect();
        let iid = parseInt($('#imInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#imInventoryIdx').val('');
            return;
        }
        let id = dbPlayer[pId].inventory[iid-1].id;
        if(parseInt(id) === 2 || parseInt(id) === 3){
            if(dbPlayer[pId].moveOn === 'ship') return;  // 船上不能用啊不能用
            if(game.scene.isActive("DynamicScene")) return; // 战斗场景不能使用
            if(dbPlayer[pId].moveOn === 'horse'){
                BuffWidget.offHorse();
            }else{
                // bug-fix 20220130 -  remove effect
                // game.scene.scenes[0].createEllipseEffect();
                // game.scene.scenes[0].player.moveOn('horse');
                if(game.scene.getScene("WorldScene").checkPlayerTileInWater()){
                    // 在水上，不能召唤马
                }else{
                    game.scene.getScene("WorldScene").player.moveOn("horse");
                    dbPlayer[pId].horseId = parseInt(id);
                }

            }
            // game.scene.scenes[0].createEllipseEffect();
            // game.scene.scenes[0].player.moveOn('horse');
            // dbPlayer[pId].horseId = parseInt(id);
            CharacterModel.calcTotalState();
        }
        InventoryModal.drawItems();
        $("#imSlot"+iid).removeClass("active");
    }
    static imStudy(){
        gGui.playSoundEffect();
        // if(BOOL_NEW_GAME){
        //     $("#imStudy").removeClass("blink");
        //     $("#imSlot6").removeClass("blink");
        //     $("#imDrop").show();
        //     $("#inventoryModal .modal-header span").hide();
        //     $("#inventoryModal .modal-footer button").show();
        //     $("#sysToast").hide();
        //     gGui._onGameHelpStep4();
        // }

        let iid = parseInt($('#imInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#imInventoryIdx').val('');
            return;
        }
        let intId = dbPlayer[pId].inventory[iid-1].id;
        if(intId<=0) return;
        let itemObj = gDB.getItemById(intId);
        let studyResult = CharacterModel.studyKF(itemObj.kfId);
        if(studyResult <0) return;
        dbPlayer[pId].eqList[7] = intId;
        $('#imStudy').attr('data-iid', '').hide();
        $('#imUnStudy').attr('data-iid', intId).show();
        InventoryModal.updateEquipAbles();
        $("#imSlot"+iid).addClass('active');
        $("#imDrop").attr('data-iid', '').hide();
    }
    static imUnStudy(){
        gGui.playSoundEffect();
        let iid = parseInt($('#imInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#imInventoryIdx').val('');
            return;
        }
        let intId = dbPlayer[pId].inventory[iid-1].id;
        if(intId<=0) return;
        let itemObj = gDB.getItemById(intId);
        dbPlayer[pId].eqList[7] = 0;
        CharacterModel.unStudyKF();
        $('#imStudy').attr('data-iid', intId).show();
        $('#imUnStudy').attr('data-iid', '').hide();
        InventoryModal.updateEquipAbles();
        $("#imSlot"+iid).addClass('active');
        if (itemObj.itemDropable === 1) $("#imDrop").attr('data-iid', intId).show();
    }
    static imEat(){
        gGui.playSoundEffect();
        // 减少 107 物品数量，如果已经没有了，移除物品
        let iid = parseInt($('#imInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#imInventoryIdx').val('');
            return;
        }

        // console.log(iid);
        let id = dbPlayer[pId].inventory[iid-1].id;
        if(CharacterModel.removeItem(107,1) < 0){ return; }
        // 更新界面显示
        InventoryModal.drawEmptySlots();
        InventoryModal.drawItems();
        // 这里不加入gcd，但是要解决疯狂吃东西的问题
        // $("#imSlot"+iid).addClass("gcd-btn-cd");
        $("#imSlot"+iid).removeClass("active");
        // $("#imSlot"+iid).click();
        // $("#imEat").addClass("gcd-btn-cd");
        // setTimeout(function(){$("#imEat").removeClass("gcd-btn-cd");},2000);
        // 加入进食粒子效果
        // 20220217 remove particles
        // game.scene.scenes[0].createEllipseEffect();
        // 提升 food 值
        CharacterModel.eat(playerFoodSupply);
        // 计算 饥饿 / 饱腹 buff 计算玩家属性
        CharacterModel.calcTotalState();

    }
    static imEquip(intItemID){
        gGui.playSoundEffect();
        // 问题： 使用某种内功和武学的时候，只能使用对应的装备 // udpated 更换武器不会重置激活的武学 2020-12-08
        let intId = parseInt(intItemID);
        let iid = parseInt($('#imInventoryIdx').val()) ;
        if(isNaN(intId)){
            if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
                $('#imInventoryIdx').val('');
                return;
            }
            intId = dbPlayer[pId].inventory[iid-1].id;
        }

        if(intId<=0) return;
        let itemObj = gDB.getItemById(intId);
        switch (itemObj.itemCate) {
            case '帽子':dbPlayer[pId].eqList[0] = intId;break;
            case '项链':dbPlayer[pId].eqList[1] = intId;break;
            case '戒指':dbPlayer[pId].eqList[2] = intId;break;
            case '剑':
                dbPlayer[pId].eqList[3] = intId;
                // CharacterModel.resetActiveKF();  // udpated 更换武器不会重置激活的武学 2020-12-08
                break;
            case '刀':dbPlayer[pId].eqList[3] = intId;break;   // udpated 更换武器不会重置激活的武学 2020-12-08
            case '枪':dbPlayer[pId].eqList[3] = intId;break;   // udpated 更换武器不会重置激活的武学 2020-12-08
            case '手套':dbPlayer[pId].eqList[3] = intId;break;  // udpated 更换武器不会重置激活的武学 2020-12-08
            case '暗器':dbPlayer[pId].eqList[3] = intId;break;  // udpated 更换武器不会重置激活的武学 2020-12-08
            case '上衣':dbPlayer[pId].eqList[4] = intId;break;
            case '裤子':dbPlayer[pId].eqList[5] = intId;break;
            case '鞋子':dbPlayer[pId].eqList[6] = intId;break;
            default:break;
        }
        CharacterModel.calcSkill();
        CharacterModel.calcTotalState();
        InventoryModal.updateEquipAbles();
        BuffWidget.updateBuff();
        BubbleWidget.updateKFIcons();   // 装备武器

        let scene = game.scene.getScene("DynamicScene");
        if(scene){
            scene.player.refreshWeapon();
        }

        $("#imEquip").attr('data-iid','').hide();
        $("#imUnEquip").attr('data-iid',intId).show();
        $("#imSlot"+iid).addClass('active');
        $("#imDrop").attr('data-iid', '').hide();
    }
    static imUnEquip(){
        gGui.playSoundEffect();
        // 问题: 更换武器不会重置激活的武学 2021-10-20
        let iid = parseInt($('#imInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#imInventoryIdx').val('');
            return;
        }
        let intId = dbPlayer[pId].inventory[iid-1].id;
        if(intId<=0) return;
        let itemObj = gDB.getItemById(intId);
        switch (itemObj.itemCate) {
            case '帽子':dbPlayer[pId].eqList[0] = 0;break;
            case '项链':dbPlayer[pId].eqList[1] = 0;break;
            case '戒指':dbPlayer[pId].eqList[2] = 0;break;
            case '剑':
                dbPlayer[pId].eqList[3] = intId;
                // CharacterModel.resetActiveKF();  // udpated 更换武器不会重置激活的武学 2020-12-08
                break;
            case '刀':dbPlayer[pId].eqList[3] = 0;break;   // udpated 更换武器不会重置激活的武学 2020-12-08
            case '枪':dbPlayer[pId].eqList[3] = 0;break;   // udpated 更换武器不会重置激活的武学 2020-12-08
            case '手套':dbPlayer[pId].eqList[3] = 0;break;  // udpated 更换武器不会重置激活的武学 2020-12-08
            case '暗器':dbPlayer[pId].eqList[3] = 0;break;  // udpated 更换武器不会重置激活的武学 2020-12-08
            case '上衣':dbPlayer[pId].eqList[4] = 0;break;
            case '裤子':dbPlayer[pId].eqList[5] = 0;break;
            case '鞋子':dbPlayer[pId].eqList[6] = 0;break;
            default:break;
        }
        CharacterModel.calcSkill();
        CharacterModel.calcTotalState();
        InventoryModal.updateEquipAbles();
        BuffWidget.updateBuff();
        BubbleWidget.updateKFIcons();   // 装备武器
        $("#imEquip").attr('data-iid',intId).show();
        $("#imUnEquip").attr('data-iid','').hide();
        $("#imSlot"+iid).addClass('active');
        if (itemObj.itemDropable === 1) $("#imDrop").attr('data-iid', intId).show();
    }
    static imDrop(){
        gGui.playSoundEffect("fail");
        let iid = parseInt($('#imInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#imInventoryIdx').val('');
            return;
        }

        let cmdStr = $("#imDrop").html();
        if(cmdStr === globalStrings.DISCARD){
            $("#imDrop").html(globalStrings.IM_CONFIRM_DISCARD);
            setTimeout(function(){
                $("#imDrop").html(globalStrings.DISCARD);
            },600);
            return;
        }else if(cmdStr === globalStrings.IM_CONFIRM_DISCARD){
            $("#imDrop").html(globalStrings.DISCARD);
            let intItemId = dbPlayer[pId].inventory[iid-1].id;
            let intStackCount = dbPlayer[pId].inventory[iid-1].count;
            if(intItemId<=0) return;
            if(CharacterModel.removeItem(intItemId,intStackCount) < 0){ return; }
            InventoryModal.drawEmptySlots();
            InventoryModal.drawItems();
        }else{
            $("#imDrop").html(globalStrings.DISCARD);
            return;
        }
    }

    /**
     * 这个函数没有用？！
     */
    static useItem() {
        let iid = parseInt($('#imInventoryIdx').val());
        if (isNaN(iid) || iid <=0 || iid > dbPlayer[pId].inventory.length) {
            $('#imInventoryIdx').val('');
            return;
        }

        let itemObj = gDB.getItemById(dbPlayer[pId].inventory[iid-1].id);
        let id = dbPlayer[pId].inventory[iid-1].id;
        // 食物
        // 缰绳等特殊物品

        if(parseInt(id) === 2 || parseInt(id) === 3){
            if(dbPlayer[pId].moveOn === 'ship') return;  // 船上不能用啊不能用
            // console.log(dbPlayer[pId].moveOn);
            if(dbPlayer[pId].moveOn === 'horse'){
                console.log("move on horse, going to off");
                // game.scene.scenes[0].player.moveOn('foot');
                BuffWidget.offHorse();
            }else{
                // 20220217 remove particles
                // game.scene.scenes[0].createEllipseEffect();
                // game.scene.scenes[0].player.moveOn('horse');
                game.scene.getScene("WorldScene").player.moveOn("horse");
                dbPlayer[pId].horseId = parseInt(id);
            }
            CharacterModel.calcTotalState();
        }
        if(parseInt(id) === 107){
            // 减少 107 物品数量 - 口粮
            if(CharacterModel.removeItem(107,1) < 0){ return; }
            // 更新界面显示
            InventoryModal.drawEmptySlots();
            InventoryModal.drawItems();
            // 加入cd 动画 - buff？
            // 如果已经没有了，移除物品
            // 加入进食粒子效果
            // game.scene.scenes[0].createEllipseEffect();
            // 提升 food 值
            CharacterModel.eat(playerFoodSupply);
            // 计算 饥饿 / 饱腹 buff
            // 计算玩家属性
            CharacterModel.calcTotalState();

        }

        // equipments
        // 可装备
        if ( ItemModel.isEquipAble(itemObj.itemCate) || ItemModel.isStudyAble(itemObj.itemCate) ) {
            if(!CharacterModel.isEquipAble(itemObj)){return;}

            let tmp = id;
            if(jQuery.inArray(id,dbPlayer[pId].eqList)>=0) {
                tmp = 0;
                let cmdStr = ItemModel.isStudyAble(itemObj.itemCate) ? "修习" : "装备";
                $('#imUse').html(cmdStr).attr('data-iid', id).show();
                if(itemObj.itemDropable == 1){$('#imDrop').show();}
            }else{
                $('#imUse').html('卸下').attr('data-iid', id).show();
                $('#imDrop').hide();
            }

            // 问题： 使用某种内功和武学的时候，只能使用对应的装备 // udpated 更换武器不会重置激活的武学 2020-12-08
            switch (itemObj.itemCate) {
                case '帽子':dbPlayer[pId].eqList[0] = tmp;break;
                case '项链':dbPlayer[pId].eqList[1] = tmp;break;
                case '戒指':dbPlayer[pId].eqList[2] = tmp;break;
                case '剑':
                    dbPlayer[pId].eqList[3] = tmp;
                    // CharacterModel.resetActiveKF();  // udpated 更换武器不会重置激活的武学 2020-12-08
                    break;
                case '刀':dbPlayer[pId].eqList[3] = tmp;break;   // udpated 更换武器不会重置激活的武学 2020-12-08
                case '枪':dbPlayer[pId].eqList[3] = tmp;break;   // udpated 更换武器不会重置激活的武学 2020-12-08
                case '手套':dbPlayer[pId].eqList[3] = tmp;break;  // udpated 更换武器不会重置激活的武学 2020-12-08
                case '暗器':dbPlayer[pId].eqList[3] = tmp;break;  // udpated 更换武器不会重置激活的武学 2020-12-08
                case '上衣':dbPlayer[pId].eqList[4] = tmp;break;
                case '裤子':dbPlayer[pId].eqList[5] = tmp;break;
                case '鞋子':dbPlayer[pId].eqList[6] = tmp;break;
                case '医书':dbPlayer[pId].eqList[7] = tmp; CharacterModel.studyKF(itemObj.kfId);$('#imUse').html('辍学');break;  // learn KF
                case '轻功秘笈':dbPlayer[pId].eqList[7] = tmp;CharacterModel.studyKF(itemObj.kfId);$('#imUse').html('辍学');break;
                case '内功秘笈':dbPlayer[pId].eqList[7] = tmp;CharacterModel.studyKF(itemObj.kfId);$('#imUse').html('辍学');break;
                case '外功秘笈':dbPlayer[pId].eqList[7] = tmp;CharacterModel.studyKF(itemObj.kfId);$('#imUse').html('辍学');break;
                case '秘笈':dbPlayer[pId].eqList[7] = tmp;CharacterModel.studyKF(itemObj.kfId);$('#imUse').html('辍学');break;
                default:break;
            }
            CharacterModel.calcSkill();
            CharacterModel.calcTotalState();
            // InventoryModal.drawOneItem(iid-1);
            // InventoryModal.updateItems();
            InventoryModal.updateEquipAbles();
            BuffWidget.updateBuff();
            // $("#imUse").html('已装备');
        }
    }
    static studyItem(){

    }
    static delItem(){

    }

    static sortItem() {
        // // 排序 - 装备的在最前面
        // let eqArr = [];
        // for(let i=0;i<dbPlayer[pId].eqList.length;i++){
        //     if(dbPlayer[pId].eqList[i] > 0 ){
        //         // bug-fix: 装备的物品如果存在多个，整理后，只剩下1个。因为push的count 是1
        //         let eqCnt = 0;
        //         for(let e=0;e<dbPlayer[pId].inventory.length;e++){
        //             if(dbPlayer[pId].inventory[e].id === dbPlayer[pId].eqList[i]){
        //                 eqCnt = eqCnt + dbPlayer[pId].inventory[e].count;
        //             }
        //         }
        //
        //         if(eqCnt > 0){
        //             eqArr.push({id:dbPlayer[pId].eqList[i],count:eqCnt});
        //             // 应该一直存在，否则就是装备了但是包里面不存在，应该是异常情况
        //         }
        //     }
        // }
        //
        // let restArr = [];
        // for(let i=0;i<dbPlayer[pId].inventory.length;i++){
        //     if(jQuery.inArray(dbPlayer[pId].inventory[i].id,dbPlayer[pId].eqList)==-1){
        //         restArr.push({id:dbPlayer[pId].inventory[i].id,count:dbPlayer[pId].inventory[i].count});
        //     }
        // }
        // let restArr = dbPlayer[pId].inventory;
        // bug-fixing: 2021.10.18 - 移除unique 物品
        let restArr = [];
        for(let i=0;i<dbPlayer[pId].inventory.length;i++){
            let intItemId = parseInt(dbPlayer[pId].inventory[i].id);
            if(intItemId <= 0) continue;
            let itemObj = gDB.getItemById(intItemId);
            if(!itemObj) continue;
            if(parseInt(itemObj.unique) !== 1){     // 不是唯一物品，直接插入
                restArr.push(dbPlayer[pId].inventory[i]);
            }else{                  //  是唯一物品 - 检查当前缓存数组restArr是否存在
                let idx = -1;
                for(let x=0;x<restArr.length;x++){
                    if(restArr[x].id === intItemId){
                        // 已经有过这个唯一物品了
                        idx = x;
                        break;
                    }
                }
                if(idx>-1){
                    // 已经有过这个唯一物品了 - 啥都不干，跳过这个物品，继续下一个物品
                }else{
                    // 唯一物品，而且restArr里面没有，插入
                    restArr.push(dbPlayer[pId].inventory[i]);
                }
            }
        }

        // 同样的物品堆叠
        let newArr = [];
        let idxArr = [];
        for (let i = 0; i < restArr.length; i++) {
            let cnt = parseInt(restArr[i].count);
            if(jQuery.inArray(restArr[i].id,idxArr) === -1 ){
                for (let j = i + 1; j < restArr.length; j++) {
                    if (restArr[j].id === restArr[i].id) {
                        cnt = cnt + restArr[j].count;
                    }
                }
                newArr.push({ id: restArr[i].id, count: cnt });
                idxArr.push(restArr[i].id);
            }
        }
        // 超过最大堆叠数的分拆
        let xArr = [];
        for (let i = 0; i < newArr.length; i++) {
            let stack = gDB.getItemStackById(newArr[i].id);
            stack = stack > 0 ? stack : 1;
            // if (newArr[i].count > stack) {
            //     console.log('count > stack: count = ' + newArr[i].count);
            //     newArr.splice(i + 1, 0, { id: newArr[i].id, count: newArr[i].count - stack });
            //     newArr[i].count = stack;
            // }
            let cnt = newArr[i].count;
            while(cnt>stack){
                // if(newArr[i].id==3){console.log('calc id=3: cnt ='+cnt + 'stack='+stack);}
                xArr.push({ id: newArr[i].id, count: stack });
                cnt = cnt - stack;
            }
            xArr.push({ id: newArr[i].id, count: cnt });
        }
        newArr = xArr;

        // 排序 - 按编号从低到高
        newArr.sort(function(a, b) { return a.id > b.id ? 1 : -1; });
        // 超过背包总数64的异常处理 - 应该不会发生
        dbPlayer[pId].inventory = newArr.slice(0,64);
        InventoryModal.drawEmptySlots();
        InventoryModal.drawItems();
    }


    // private functions

    // util functions
    utilGetInventoryData() {

    }

}

let inventoryModal = new InventoryModal();