/**
 * Created by jim on 2020/5/5.
 */

class KongFuModal{
    constructor(){
        $("#kfBtnActive").click(KongFuModal.activeKF);
        $("#kfBtnFirstPriority").click(KongFuModal.setFirstPriority);
        $("#kfBtnForget").click(KongFuModal.forgetKF);
        $("#kongFuModal .card").hide();

        $("#kfHealMed354").click(KongFuModal.setMed);
        $("#kfHealMed353").click(KongFuModal.setMed);
        $("#kfHealMed352").click(KongFuModal.setMed);
        $("#kfHealMed351").click(KongFuModal.setMed);
        $("#kfHealMed350").click(KongFuModal.setMed);
        $("#kfHealMed349").click(KongFuModal.setMed);
        $("#kfHealMed348").click(KongFuModal.setMed);
        $("#kfHealSlot0").click(KongFuModal.unsetMed);
    }

    static drawKongFuModal(cancelEsc){
        $(".modal").modal('hide');
        KongFuModal._updateContent();
        // $("#kongFuModal").modal('show');
        $('#kongFuModal').modal({show:true,keyboard:!cancelEsc});
    }

    static _drawEmptyList(){
        let strNoKF = '<i class="iconfont icon-blockbannedstopdisabledban1"></i> '+globalStrings.QSA_7+'<span class="badge badge-primary badge-pill">0</span>';
        $("#kfWg0").html(strNoKF);$("#kfWg1").html(strNoKF);$("#kfWg2").html(strNoKF);$("#kfWg3").html(strNoKF);
        $("#kfNg0").html(strNoKF);$("#kfNg1").html(strNoKF);$("#kfNg2").html(strNoKF);$("#kfNg3").html(strNoKF);
        $("#kfQg0").html(strNoKF);$("#kfQg1").html(strNoKF);
        $("#kfZl0").html(strNoKF);
        $("#kongFuModal .cm-right .card-body").html('');
        $("#kongFuModal .cm-right .btn").hide();
    }

    static _updateContent(){
        $("#kongFuModal .list-kf li").off('click');
        $("#heal_med_div").hide();
        if(gApp.difficulty > 1){
            $("#kfBtnActive").hide();
            // console.log("active btn removed");
        }else{
            $("#kfBtnActive").show();
        }
        // KongFuModal._drawEmptyList();
        let w = dbPlayer[pId].wgList;
        let n = dbPlayer[pId].ngList;
        let q = dbPlayer[pId].qgList;
        $('#kongFuModal .list-kf li').removeClass('active').removeClass('li-current');
        $("#kongFuModal .card-body").html('');
        $("#kongFuModal .card").hide();
        // console.log(w);
        for(let i=0;i<w.length;i++){
            if((!jQuery.isEmptyObject(w[i])) && (w[i].kfId >0)){
                let kfObj = gDB.getKFById(w[i].kfId);
                if(!jQuery.isEmptyObject(kfObj)){
                    let str = KFModel.getKFIcon(kfObj.kfType)+kfObj.kfName+'<span class="badge badge-primary badge-pill">'+w[i].kfLevel+'</span>';
                    $("#kfWg"+i).html(str).attr('data-kfid',w[i].kfId);
                    $("#kfWg"+i).html(str).attr('data-kflevel',w[i].kfLevel);
                    $("#kfWg"+i).html(str).attr('data-kftype','wai');
                    if(i === dbPlayer[pId].wgaId){ $("#kfWg"+i).addClass('active');}
                }
            }else{
                $("#kfWg"+i).html('<i class="iconfont icon-blockbannedstopdisabledban1"></i> '+globalStrings.QSA_7+' <span class="badge badge-primary badge-pill">0</span>')
                    .attr('data-kfid',-1).attr('data-kflevel',-1);
            }
        }
        for(let i=0;i<n.length;i++){
            if((!jQuery.isEmptyObject(n[i])) && (n[i].kfId >0)){
                let kfObj = gDB.getKFById(n[i].kfId);
                if(!jQuery.isEmptyObject(kfObj)){
                    let str = '<i class="iconfont icon-six"></i>'+kfObj.kfName+
                        '<span class="badge badge-primary badge-pill">'+n[i].kfLevel+'</span>';
                    $("#kfNg"+i).html(str).attr('data-kfid',n[i].kfId);
                    $("#kfNg"+i).html(str).attr('data-kflevel',n[i].kfLevel);
                    $("#kfNg"+i).html(str).attr('data-kftype','nei');
                    if(gApp.difficulty === 1){
                        if(i == dbPlayer[pId].ngaId){ $("#kfNg"+i).addClass('active');}
                    }

                }
            }else{
                $("#kfNg"+i).html('<i class="iconfont icon-blockbannedstopdisabledban1"></i> '+globalStrings.QSA_7+' <span class="badge badge-primary badge-pill">0</span>')
                    .attr('data-kfid',-1).attr('data-kflevel',-1);
            }
        }
        for(let i=0;i<q.length;i++){
            if((!jQuery.isEmptyObject(q[i])) && (q[i].kfId >0)){
                let kfObj = gDB.getKFById(q[i].kfId);
                //console.log(kfObj);
                if(!jQuery.isEmptyObject(kfObj)){
                    let str = '<i class="iconfont icon-speed1"></i>'+
                        kfObj.kfName+
                        '<span class="badge badge-primary badge-pill">'+
                        q[i].kfLevel+'</span>';
                    $("#kfQg"+i).html(str).attr('data-kfid',q[i].kfId);
                    $("#kfQg"+i).html(str).attr('data-kflevel',q[i].kfLevel);
                    $("#kfQg"+i).html(str).attr('data-kftype','qing');
                    if(gApp.difficulty === 1) {
                        if (i == dbPlayer[pId].qgaId) {
                            $("#kfQg" + i).addClass('active');
                        }
                    }
                }
            }else {
                $("#kfQg"+i).html('<i class="iconfont icon-blockbannedstopdisabledban1"></i> '+globalStrings.QSA_7+' <span class="badge badge-primary badge-pill">0</span>')
                    .attr('data-kfid',-1).attr('data-kflevel',-1);
            }
        }
        if(dbPlayer[pId].zlKfId>0){
            // let kfObj = KFModel.initWithLevel(dbPlayer[pId].zlKfId,10);
            let kfObj = gDB.getKFById(dbPlayer[pId].zlKfId);
            if(!jQuery.isEmptyObject(kfObj)){
                let str = '<i class="iconfont icon-health2"></i>'+kfObj.kfName
                    + '<span class="badge badge-primary badge-pill">0</span>';
                $("#kfZl0").html(str).attr('data-kfid',dbPlayer[pId].zlKfId);
                $("#kfZl0").html(str).attr('data-kftype','heal').attr('data-kflevel',10);        // KFLevel 默认10级
            }else{
                $("#kfZl0").html('<i class="iconfont icon-blockbannedstopdisabledban1"></i> '+globalStrings.KF_NONE+' <span class="badge badge-primary badge-pill">0</span>')
                    .attr('data-kfid',-1).attr('data-kflevel',-1);
            }
        }else{
            $("#kfZl0").html('<i class="iconfont icon-blockbannedstopdisabledban1"></i> '+globalStrings.KF_NONE+' <span class="badge badge-primary badge-pill">0</span>')
                .attr('data-kfid',-1).attr('data-kflevel',-1);
        }

        $("#kongFuModal .list-kf li").on('click',KongFuModal.bindClicks);

        KongFuModal.onUpdateMed();
    }

    /**
     * 左侧功夫列表被点击之后，打开对应的功夫详情，控制激活、遗忘等按钮
     */
    static bindClicks(){
        $("#kongFuModal .card-body").html('');
        $("#kongFuModal .card").hide();
        //$("#kongFuModal .list-kf li").removeClass('inset-shadow');
        $("#kongFuModal .list-kf li").removeClass('li-current');
        let kid = parseInt($(this).attr('data-kfid'));  // 解决 data 缓存的问题
        let idx = parseInt($(this).attr('id').substr(4));
        idx = isNaN(idx) ? -1 : idx;
        $('#kfActiveId').val('');
        $('#kfActiveType').val('');
        $("#kongFuModal").attr('data-kfId',kid);
        // bug-fixing
        let klevel = CharacterModel.getKFLvById(kid);
        // let klevel = parseInt($(this).data('kflevel'));
        if(kid>0 && klevel>0){
            //$(this).addClass('inset-shadow');
            $(this).addClass('li-current');
            $('#kfActiveId').val(idx);
            $('#kfActiveType').val($(this).attr('data-kftype'));
            let kfObj = KFModel.initWithLevel(kid,klevel);
            if(!jQuery.isEmptyObject(kfObj)){
                // let str = '<i class="iconfont icon-daoju"></i>'+kfObj.dbObj.kfName;
                // str += '<br/>'+kfObj.dbObj.kfNeili;
                // str += '<br/>'+kfObj.dbObj.kfTier;
                switch($(this).attr('data-kftype')){
                    case 'wai':
                        // if(dbPlayer[pId].wgaId == idx){
                        //     $("#kfBtnActive").html(globalStrings.CANCEL);
                        //     $("#kfBtnForget").hide();
                        // }else{
                        $("#kfBtnActive").html(globalStrings.ACTIVATE).hide();
                        $("#kfBtnForget").show();
                        $("#heal_med_div").hide();
                        $("#kfBtnFirstPriority").show();

                        //     }
                        break;
                    case 'nei':
                        $("#heal_med_div").hide();
                        if(gApp.difficulty === 1){
                            if(dbPlayer[pId].ngaId === idx){
                                $("#kfBtnActive").html(globalStrings.CANCEL).show();
                                $("#kfBtnForget").hide();
                            }else{$("#kfBtnActive").html(globalStrings.ACTIVATE).show();$("#kfBtnForget").show();}
                            $("#kfBtnFirstPriority").hide();
                        }else{
                            $("#kfBtnActive").html(globalStrings.ACTIVATE).hide();
                            $("#kfBtnForget").show();
                            $("#kfBtnFirstPriority").hide();
                        }
                        break;
                    case 'qing':
                        $("#heal_med_div").hide();
                        if(gApp.difficulty === 1) {
                            if (dbPlayer[pId].qgaId === idx) {
                                $("#kfBtnActive").html(globalStrings.CANCEL).show();
                                $("#kfBtnForget").hide();
                            } else {
                                $("#kfBtnActive").html(globalStrings.ACTIVATE).show();
                                $("#kfBtnForget").show();
                            }
                            $("#kfBtnFirstPriority").hide();
                        }else{
                            $("#kfBtnActive").html(globalStrings.ACTIVATE).hide();
                            $("#kfBtnForget").show();
                            $("#kfBtnFirstPriority").hide();
                        }
                        break;
                    case 'heal':
                        $("#kfBtnForget").hide();
                        $("#kfBtnActive").hide();
                        $("#kfBtnFirstPriority").hide();
                        $("#heal_med_div").show();
                        break;
                    default:
                        // $("#kfBtnActive").html(globalStrings.ACTIVATE);
                        $("#heal_med_div").hide();
                        $("#kfBtnForget").show();
                        $("#kfBtnFirstPriority").hide();
                        break;
                }

                let str = KFModel.toString(kfObj);
                $("#kongFuModal .card-body").html(str);
                $("#kongFuModal .card").show().addClass('fadeIn animated');
                setTimeout(function () { $("#kongFuModal .card").removeClass('fadeIn animated');},200);
            }
        }

    }

    static isShow(){
        return $("#kongFuModal").css('display') == 'block' ? true : false;
    }
    static hideModal(){
        $("#kongFuModal").modal('hide');
    }

    static activeKF(){
        gGui.playSoundEffect();
        let idx =  parseInt($('#kfActiveId').val());
        let kfType = $('#kfActiveType').val();
        let valStr = $(this).html();
        if(valStr == globalStrings.ACTIVATE){
            switch(kfType){
                case 'wai':
                    // dbPlayer[pId].wgaId = isNaN(idx) ? -1 : idx;
                    $('.kf-kf-wg').removeClass('active');
                    // $('#kfWg'+idx).addClass('active');
                    $("#kfBtnActive").html(globalStrings.CANCEL).hide();
                    $("#kfBtnForget").show();
                    break;
                case 'nei':
                    dbPlayer[pId].ngaId = isNaN(idx) ? -1 : idx;
                    $('.kf-kf-ng').removeClass('active');
                    $('#kfNg'+idx).addClass('active');
                    $("#kfBtnActive").html(globalStrings.CANCEL).show();
                    $("#kfBtnForget").hide();
                    break;
                case 'qing':
                    dbPlayer[pId].qgaId = isNaN(idx) ? -1 : idx;
                    $('.kf-kf-qg').removeClass('active');
                    $('#kfQg'+idx).addClass('active');
                    $("#kfBtnActive").html(globalStrings.CANCEL).show();
                    $("#kfBtnForget").hide();
                    break;
                default:break;
            }
        }else{
            switch(kfType){
                case 'wai':
                    // dbPlayer[pId].wgaId = -1;
                    $('.kf-kf-wg').removeClass('active');
                    $("#kfBtnActive").html(globalStrings.ACTIVATE).hide();
                    $("#kfBtnForget").show();
                    break;
                case 'nei':
                    dbPlayer[pId].ngaId = -1;
                    $('.kf-kf-ng').removeClass('active');
                    $("#kfBtnActive").html(globalStrings.ACTIVATE);
                    $("#kfBtnForget").show();
                    break;
                case 'qing':
                    dbPlayer[pId].qgaId = -1;
                    $('.kf-kf-qg').removeClass('active');
                    $("#kfBtnActive").html(globalStrings.ACTIVATE);
                    $("#kfBtnForget").show();
                    break;
                default:break;
            }
        }


        CharacterModel.calcTotalState();
        BuffWidget.updateBuff();
        //console.log(dbPlayer[pId]);
    }
    static setFirstPriority(){
        gGui.playSoundEffect();
        let idx =  parseInt($('#kfActiveId').val());
        let kfType = $('#kfActiveType').val();
        let valStr = $(this).html();
        if((valStr === globalStrings.PRIOR) && (kfType === 'wai')){
            // 设置外功优先级
            CharacterModel.setWGPriority(idx);
        }

        CharacterModel.calcTotalState();
        BuffWidget.updateBuff();
        KongFuModal._updateContent();
        BubbleWidget.updateKFIcons();   // 设置武学优先级
    }
    static forgetKF(){
        gGui.playSoundEffect();
        let kfId = $("#kongFuModal").attr('data-kfId');
        let intKfId = parseInt(kfId);
        intKfId = isNaN(intKfId) ? 0 : intKfId;
        if(intKfId <=0) return;

        let cmdStr = $("#kfBtnForget").html();
        if(cmdStr === globalStrings.FORGET){
            $("#kfBtnForget").html(globalStrings.KM_CONFIRM_FORGET);
            setTimeout(function(){
                $("#kfBtnForget").html(globalStrings.FORGET);
            },600);
        }else if(cmdStr === globalStrings.KM_CONFIRM_FORGET) {
            $("#kfBtnForget").html(globalStrings.FORGET);
            CharacterModel.forgetKF(intKfId);
            KongFuModal._updateContent();
        }
    }

    /**
     * 设置药物
     */
    static setMed(){
        let medStr = $(this).data("med");
        if(medStr === "") return;
        let medId = parseInt(medStr);
        if(medId <= GlobalConfig.ITEM_HERB_ID) return;  // 药材
        if(medId > GlobalConfig.ITEM_MED_MAX_ID) return; // 最大药物

        dbPlayer[pId].zlMedId = medId;

        let itemObj = gDB.getItemById(medId);
        let iStr = ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
        let iCnt = CharacterModel.countItem(medId);
        iCnt = iCnt <= 0 ? 0 : iCnt;
        iStr += '<span class="badge">' + iCnt + '</span>';
        let themeTier = ItemModel.getThemColorByTier(itemObj.itemLevel);
        $("#kfHealSlot0").removeClass().addClass("btn item-slot item-slot-"+itemObj.itemLevel).html(iStr);
        $("#kfHealMedSpan").removeClass().addClass(themeTier).html(itemObj.itemName + "：" +itemObj.itemDesc);
        $("#kfZl0 span.badge").html(iCnt);
    }

    /**
     * 更新所有药物数量，供选择，隐藏数量=0的
     */
    static onUpdateMed(){
        for(let i=GlobalConfig.ITEM_HERB_ID;i<GlobalConfig.ITEM_MED_MAX_ID;i++){
            let medId = 1 + i;
            let iCnt = CharacterModel.countItem(medId);
            if(iCnt > 0){
                // 有
                $("#kfHealMed"+medId +" span.badge").html(iCnt);
                $("#kfHealMed"+medId).show();
            }else{
                // 木有
                $("#kfHealMed"+medId).hide();
            }
        }

        if(dbPlayer[pId].zlMedId > 0){
            let iCnt = CharacterModel.countItem(dbPlayer[pId].zlMedId);
            let itemObj = gDB.getItemById(dbPlayer[pId].zlMedId);
            let iStr = ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
            iCnt = iCnt <= 0 ? 0 : iCnt;
            iStr += '<span class="badge">' + iCnt + '</span>';
            let themeTier = ItemModel.getThemColorByTier(itemObj.itemLevel);
            $("#kfHealSlot0").removeClass().addClass("btn item-slot item-slot-"+itemObj.itemLevel).html(iStr);
            $("#kfHealMedSpan").removeClass().addClass(themeTier).html(itemObj.itemName + "：" +itemObj.itemDesc);
            $("#kfZl0 span.badge").html(iCnt);
        }

    }

    static unsetMed(){
        dbPlayer[pId].zlMedId = -1;
        let unsetStr = '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-cross2"></use></svg>';
        let unsetSpan = globalStrings.MEDICINE_0;
        $("#kfHealSlot0").removeClass().addClass("btn item-slot").html(unsetStr);
        $("#kfHealMedSpan").removeClass().html(unsetSpan);
        $("#kfZl0 span.badge").html(0);
    }
}

let kongFuModal = new KongFuModal();