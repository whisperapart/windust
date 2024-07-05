/**
 * Created by jim on 2020/5/1.
 */
/**
 * Created by jim on 2020/3/25.
 */

class CharacterModal {
    // object properties
    constructor() {
        $("#cmPoint1Minus").on('click',CharacterModal.pointStrMinus);
        $("#cmPoint2Minus").on('click',CharacterModal.pointWisMinus);
        $("#cmPoint1Plus").on('click',CharacterModal.pointStrPlus);
        $("#cmPoint2Plus").on('click',CharacterModal.pointWisPlus);
        $("#cmPoint1OK").on('click',CharacterModal.pointStrOK);
        $("#cmPoint2OK").on('click',CharacterModal.pointWisOK);

        $("#characterModal").on('click',function(e) {
            $(".kf-pop-over").popover('hide').popover('dispose');
            // // 20220518 - 试图解决dynamicScene 唤醒 C 界面，点击C界面 同时也会导致 dynamicScene响应鼠标点击的问题
            // console.log("mouse clicked in CharacterModal");
            // e.stopPropagation();
            // e.preventDefault();
        });
        this.autoRefreshHandler = -1;
    }

    // shared functions
    static drawCharacterModal(cancelEsc = false){
        $(".modal").modal('hide');
        JournalModal.removePopupClick();
        // $(".kf-pop-over").popover('hide').popover('dispose');
        CharacterModal.updateModelContent();
        CharacterModal._drawEqList();
        // $("#characterModal").modal('show');
        $('#characterModal').modal({show:true,keyboard:!cancelEsc});
        // bug-fixing: 修正C页面不刷新内容，导致饥饿值不对等问题
        // characterModal.autoRefreshHandler = setInterval(CharacterModal.updateModelContent,1500);
        // this.flagGuiShow = true;
    }
    // static updateCharacterAvatar(){
    //     $(".cm-eq-middle img").attr('src','assets/images/npc/'+dbPlayer[pId].avatar+'.png');
    // }

    static updateModelContent(){
        // CharacterModal.updateCharacterAvatar();
        $(".cm-eq-middle img").attr('src','assets/images/npc/'+dbPlayer[pId].avatar+'.png');
        // if(!flagInGame) return;
        if((pId < 0) || (pId >2)) return;
        if(pId === 0)
        {
            $("#characterModalHud").html("<span>"+globalStrings.CM_1+"</span><i class='iconfont icon-jifen'></i>");
        }else if(pId===1){
            $("#characterModalHud").html("<span>"+globalStrings.CM_2+"</span><i class='iconfont icon-shadow'></i>");
        }else if(pId===2){
            $("#characterModalHud").html("<span>"+globalStrings.CM_3+"</span><i class='iconfont icon-gongfu'></i>");
        }
        else{
            $("#characterModalHud").html();
            return;
        }


        $("#cmName").html(dbPlayer[pId].name);
        $("#cmLevel").html(globalStrings.CM_LV+ dbPlayer[pId].level);
        $("#cmParaLevel").html(globalStrings.CM_PA+ dbPlayer[pId].paraLevel);
        $("#cmHP").html(dbPlayer[pId].curHP + " / " + dbPlayer[pId].maxHP );
        $("#cmMP").html(dbPlayer[pId].curMP + " / " + dbPlayer[pId].maxMP );
        switch(dbPlayer[pId].neili){
            case globalStrings.KF_INNER_TYPE_YIN: $("#cmMP").css('color','mediumpurple');
                break;
            case globalStrings.KF_INNER_TYPE_YANG: $("#cmMP").css('color','gold');
                break;
            default: $("#cmMP").css('color','skyblue');
                break;
        }
        $("#cmStr").html(dbPlayer[pId].strength);
        $("#cmWis").html(dbPlayer[pId].wisdom);
        let ExpPer = 100.0 * dbPlayer[pId].curExp / dbPlayer[pId].nextExp;
        $("#cmExp .progress-bar").css('width',ExpPer.toFixed(2) + "%");
        $("#cmExp span").html(toReadableString(dbPlayer[pId].curExp) + "/" + toReadableString(dbPlayer[pId].nextExp));

        if(dbPlayer[pId].eqList[7]>0){
            let learnExpPer = 100.0 * dbPlayer[pId].learningCurExp / dbPlayer[pId].learningNextExp;
            $("#cmExpLearn .progress-bar").css('width',learnExpPer.toFixed(2) + "%");
        }
        $("#cmExpLearn span").html(toReadableString(dbPlayer[pId].learningCurExp) + "/" + toReadableString(dbPlayer[pId].learningNextExp));

        $("#cmPoint").html(dbPlayer[pId].statPoint);
        if(dbPlayer[pId].statPoint > 0 ){
            $("#cmStr").removeClass('offset-6');$("#cmWis").removeClass('offset-6');
            $('#cmStrCtrl').show();$('#cmWisCtrl').show();
        }else{
            $('#cmStrCtrl').hide();$('#cmWisCtrl').hide();
            $("#cmStr").addClass('offset-6');$("#cmWis").addClass('offset-6');
        }

        $("#cmFood").html(dbPlayer[pId].food);
        $("#cmMoney").html(toReadableString(dbPlayer[pId].money));
        if(dbPlayer[pId].dbfObj.spd.duration>0){
            $("#moveOnSpeed").html("<span class='character-debuff'>" + dbPlayer[pId].moveOnSpeed + "</span>");
        }
        else{
            $("#moveOnSpeed").html(dbPlayer[pId].moveOnSpeed);
        }
        $("#cmHit").html(toPercentString(dbPlayer[pId].totalState.hit,2));
        $("#cmAtk").html(dbPlayer[pId].totalState.atk.toFixed(0));
        $("#cmCrt").html(toPercentString(dbPlayer[pId].totalState.crt,2));
        $("#cmDef").html(toPercentString(dbPlayer[pId].totalState.def,2));
        $("#cmCrm").html(toPercentString(dbPlayer[pId].totalState.crm,0));
        // updated 2023。07。10 解决 中了 -hst debuff 之后，不显示的问题
        // -- 因为现在的减速逻辑是直接作用在update 的 delta 上的。不在totalState里面
        // value 永远是 0.2 减速 20%
        if(dbPlayer[pId].dbfObj.hst.duration>0){
            $("#cmHst").html("<span class='character-debuff'>"+toPercentString(dbPlayer[pId].totalState.hst -0.2,2) + "</span>");
        }else{
            $("#cmHst").html(toPercentString(dbPlayer[pId].totalState.hst,2));
        }

        $("#cmDge").html(toPercentString(dbPlayer[pId].totalState.dge,2));
        $("#cmPar").html(toPercentString(dbPlayer[pId].totalState.par,2));
        $("#cmFdb").html(toPercentString(dbPlayer[pId].totalState.fdb,2));
        $("#cmFdh").html(toPercentString(dbPlayer[pId].totalState.fdh,2));
        $("#cmRis").html(toPercentString(dbPlayer[pId].totalState.ris,2));
        $("#cmLuk").html(toPercentString(dbPlayer[pId].totalState.luk,2));
        $("#cmReg").html(dbPlayer[pId].totalState.reg.toFixed(0));
        $("#cmRem").html(dbPlayer[pId].totalState.rem.toFixed(0));

        $("#cmFist").html(dbPlayer[pId].baseSkill.fist + "+"+dbPlayer[pId].equipSkill.fist);
        $("#cmSword").html(dbPlayer[pId].baseSkill.sword+ "+"+dbPlayer[pId].equipSkill.sword);
        $("#cmMachete").html(dbPlayer[pId].baseSkill.machete+ "+"+dbPlayer[pId].equipSkill.machete);
        $("#cmSpear").html(dbPlayer[pId].baseSkill.spear+ "+"+dbPlayer[pId].equipSkill.spear);
        $("#cmEjection").html(dbPlayer[pId].baseSkill.ejection+ "+"+dbPlayer[pId].equipSkill.ejection);
        $("#cmEnchant").html(dbPlayer[pId].baseSkill.enchant+ "+"+dbPlayer[pId].equipSkill.enchant);
        $("#cmSwift").html(dbPlayer[pId].baseSkill.swift+ "+"+dbPlayer[pId].equipSkill.swift);
        $("#cmHeal").html(dbPlayer[pId].baseSkill.heal+ "+"+dbPlayer[pId].equipSkill.heal);


    }

    static _drawEqList(){
        $("#cm-eq-1").html('<button class="item-slot" id="cmSlot0"><i class="iconfont icon-diaosu"></i></button>\n' +
            '                                <button class="item-slot" id="cmSlot1"><i class="iconfont icon-xianglian"></i></button>\n' +
            '                                <button class="item-slot" id="cmSlot2"><i class="iconfont icon-jiezhi-"></i></button>\n' +
            '                                <button class="item-slot" id="cmSlot3"><i class="iconfont icon-nunchaku"></i></button>');
        $("#cm-eq-2").html('<button class="item-slot" id="cmSlot4"><i class="iconfont icon-sv"></i> </button>\n' +
            '                                <button class="item-slot" id="cmSlot5"><i class="iconfont icon-kuzi"></i></button>\n' +
            '                                <button class="item-slot" id="cmSlot6"><i class="iconfont icon-xuezi"></i></button>\n' +
            '                                <button class="item-slot" id="cmSlot7"><i class="iconfont icon-zhipin"></i></button>');

        for(let i=0;i<dbPlayer[pId].eqList.length;i++){
            if(dbPlayer[pId].eqList[i]>0){
                let iobj = gDB.getItemById(dbPlayer[pId].eqList[i]);
                let x = ItemModel.toString(iobj,false);

                $("#cmSlot"+i).html(ItemModel.getItemIcon(iobj.itemCate,iobj.itemId))
                    .removeClass().addClass('item-slot')
                    .addClass('item-slot-'+iobj.itemLevel)
                    .addClass('kf-pop-over')
                    .attr('data-html',true)
                    .attr('data-content',x)
                    .click(function(e) {
                        $(".kf-pop-over").popover('hide').popover('dispose');
                        // $(this).popover('show');
                        $(this).popover('toggle');
                        $('.popover').click(function(e) {
                            return false;
                        });
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    });


                //str += '<button data-itemid="' + dbPlayer[pId].inventory[i].id + '"
                // class="btn item-slot item-slot-' + itemObj.itemLevel + '">'
                // + ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
            }else{
            }
        }
    }

    static isShow(){
        return $("#characterModal").css('display') == 'block' ? true : false;
    }
    static hideModal(){
        clearInterval(characterModal.autoRefreshHandler);
        $("#characterModal").modal('hide');
        JournalModal.removePopupClick();
        // gGui.flagGuiShow = false;
    }

    static pointStrMinus(){
        gGui.playSoundEffect();
        let total = dbPlayer[pId].statPoint;
        let strP = parseInt($("#cmPoint1").html());
        let wisP = parseInt($("#cmPoint2").html());
        if((strP >= 1)&&(strP + wisP <=total)){
            strP = strP - 1;
            $("#cmPoint1").html(strP);
        }else{
            $("#cmPoint1").html(0);
        }
    }
    static pointStrPlus(){
        gGui.playSoundEffect();
        let total = dbPlayer[pId].statPoint;
        let strP = parseInt($("#cmPoint1").html());
        let wisP = parseInt($("#cmPoint2").html());
        if((strP + wisP < total)&&(strP>=0)){
            $("#cmPoint1").html(strP+1);
        }else{
            $("#cmPoint1").html(strP);
        }
        $("#characterModalFootnote").html(globalStrings.CM_4).show();
    }
    static pointStrOK(){
        gGui.playSoundEffect();
        let total = dbPlayer[pId].statPoint;
        let strP = parseInt($("#cmPoint1").html());
        let wisP = parseInt($("#cmPoint2").html());

        if((strP + wisP <= total)&&(strP>=0)){
            dbPlayer[pId].statPoint = dbPlayer[pId].statPoint - strP;
            dbPlayer[pId].strength = dbPlayer[pId].strength + strP;
            CharacterModel.calcTotalState();
            BuffWidget.updateBuff();
            // let playerPromise = gApp.savePlayer();
            $("#cmPoint1").html(0);
            CharacterModal.updateModelContent();
            // Promise.all([playerPromise]).then(function(){
            //     CharacterModal.updateModelContent();
            // });
        }
        $("#characterModalFootnote").html(" ");
    }
    static pointWisMinus(){
        gGui.playSoundEffect();
        let total = dbPlayer[pId].statPoint;
        let strP = parseInt($("#cmPoint1").html());
        let wisP = parseInt($("#cmPoint2").html());
        if((wisP >= 1)&&(strP + wisP <=total)){
            wisP = wisP - 1;
            $("#cmPoint2").html(wisP);
        }else{
            $("#cmPoint2").html(0);
        }
    }
    static pointWisPlus(){
        gGui.playSoundEffect();
        let total = dbPlayer[pId].statPoint;
        let strP = parseInt($("#cmPoint1").html());
        let wisP = parseInt($("#cmPoint2").html());
        if((strP + wisP < total)&&(wisP>=0)){
            $("#cmPoint2").html(wisP+1);
        }else{
            $("#cmPoint2").html(wisP);
        }
        $("#characterModalFootnote").html(globalStrings.CM_5).show();
    }
    static pointWisOK(){
        gGui.playSoundEffect();
        let total = dbPlayer[pId].statPoint;
        let strP = parseInt($("#cmPoint1").html());
        let wisP = parseInt($("#cmPoint2").html());
        if((strP + wisP <= total)&&(wisP>=0)){
            dbPlayer[pId].statPoint = dbPlayer[pId].statPoint - wisP;
            dbPlayer[pId].wisdom = dbPlayer[pId].wisdom + wisP;
            CharacterModel.calcTotalState();
            BuffWidget.updateBuff();
            // let playerPromise = gApp.savePlayer();
            $("#cmPoint2").html(0);
            CharacterModal.updateModelContent();
            // Promise.all([playerPromise]).then(function(){
            //     // $("#cmPoint").html(dbPlayer[pId].statPoint);
            //     // $("#cmPoint2").html(0);
            //     // $("#cmStr").html(dbPlayer[pId].strength);
            //     // $("#cmWis").html(dbPlayer[pId].wisdom);
            //     CharacterModal.updateModelContent();
            // });
        }
        $("#characterModalFootnote").html(" ");
    }
}

let characterModal = new CharacterModal();