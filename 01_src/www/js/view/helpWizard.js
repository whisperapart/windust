/**
 * Help Wizard
 * Jim Dai 2023.09.11
 */

class HelpWizard{
    constructor() {
        this.data = {
            'boolNewGame':false,
            'stepOneStatus':0
        };
        this.instance = null;
        $("#uiHelpWizardNext").on("click",this._step2);
        $("#menuBtnOptionsCtrlHelpOK").on("click",this._step3);
    }

    static getInstance(){
        if (this.instance) { return this.instance; }
        return this.instance = new HelpWizard();
    }
    static isShow(){
        return ($("#uiHelpDiv").css('display') === 'block');
    }

    /** help wizard, step-1
     * 显示 UI说明
     */
    start(){
        if(gApp.difficulty !== 1) return;
        this.data.stepOneStatus = 1;
        $("#uiHelpDiv").show();
        gGui.domUIShow();
        this._step_1_updateGui();
        BOOL_NEW_GAME = true;
    }

    _step_1_updateGui(){
        $(".hw-hud").hide();
        if(this.data.stepOneStatus <=0) return;
        if(this.data.stepOneStatus >5) return;
        $("#hw-hud-"+this.data.stepOneStatus).show();
        $("#uiHelpWizardNext").hide();
        let that  = this;
        switch (this.data.stepOneStatus){
            case 1 :
                $("#uiHelpWizardNext").hide();
                $("#hw-hud-info").html(globalStrings.WIZARD_1_1).show();
                // $(".ui-help-hud").addClass("help-rect");
                $(".ui-help-hud").one("click",function(){
                    that.data.stepOneStatus = 2;
                    // $(".ui-help-hud").removeClass("help-rect");
                    $(".ui-help-hud .help-rect").html("<i class='iconfont icon-Check-fuben'></i>");
                    that._step_1_updateGui();
                });
                break;
            case 2:
                $("#uiHelpWizardNext").hide();
                $("#hw-hud-info").html(globalStrings.WIZARD_1_2).show();
                // $(".ui-help-effect").addClass("ui-help-shine");
                $(".ui-help-effect").one("click",function(){
                    that.data.stepOneStatus = 3;
                    // $(".ui-help-effect").removeClass("ui-help-shine");
                    $(".ui-help-effect .help-rect").html("<i class='iconfont icon-Check-fuben'></i>");
                    that._step_1_updateGui();
                });
                break;
            case 3:
                $("#uiHelpWizardNext").hide();
                $("#hw-hud-info").html(globalStrings.WIZARD_1_3).show();
                // $(".ui-help-map").addClass("ui-help-shine");
                $(".ui-help-map").one("click",function(){
                    that.data.stepOneStatus = 4;
                    // $(".ui-help-map").removeClass("ui-help-shine");
                    $(".ui-help-map .help-rect").html("<i class='iconfont icon-Check-fuben'></i>");
                    that._step_1_updateGui();
                });
                break;
            case 4:
                $("#uiHelpWizardNext").hide();
                $("#hw-hud-info").html(globalStrings.WIZARD_1_4).show();
                // $(".ui-help-ctrl").addClass("ui-help-shine");
                $(".ui-help-ctrl").one("click",function(){
                    that.data.stepOneStatus = 5;
                    // $(".ui-help-ctrl").removeClass("ui-help-shine");
                    $(".ui-help-ctrl .help-rect").html("<i class='iconfont icon-Check-fuben'></i>");
                    that._step_1_updateGui();
                });
                break;
            case 5:
                $("#uiHelpWizardNext").show();
                $("#hw-hud-info").hide();
                $("#hw-hud-5").html(globalStrings.WIZARD_1_5);
                break;
            default:
                break;
        }
    }

    /** help wizard, step-2
     * 显示 控制说明
     */
    _step2(){
        $("#uiHelpDiv").hide();
        $("#uiHelpDiv .help-rect").html("");
        gGui.onGamePlayHelp();
        $("#menuBtnOptionsCtrlHelpBack").hide();
        $("#menuBtnOptionsCtrlHelpOK").show();
        $("#menuDiv").show();
    }
    /** help wizard, step-3
     * 显示 Inventory 提示装备武器 ，修习武学
     */
    _step3(){
        gGui.playSoundEffect();
        gGui._animateHide("#game_control_help_wrap");
        // console.log(dbPlayer[pId].eqList);
        $("#menuDiv").hide();
        let hw = HelpWizard.getInstance();
        hw._helpInventoryUse();
        // next - InventoryModal.imStudy
    }

    _helpInventoryUse(){
        InventoryModal.drawModal(true);
        $("#imSlot1").focus().click();
        $("#imSlot1").addClass("blink");
        $("#btnInputKeyI").addClass("active blink");
        // $("#toastBody").html( "请[装备]刀，才能使用刀法。").unbind('click');
        // $("#sysToast .toast-header").html("装备物品").show();
        // $("#sysToast").show().addClass("slideInUp animated");
        gGui.sysToastWithoutHide(globalStrings.WIZARD_INV_USE_TITLE,globalStrings.WIZARD_INV_USE_HEADER);
        $("#inventoryModal .modal-header span").html(globalStrings.WIZARD_INV_USE_CONTENT).show();
        $("#inventoryModal .modal-footer button").hide();
        $("#imDrop").hide();
        $("#imEquip").addClass("blink").one("click",function(){
            $("#btnInputKeyI").removeClass("active blink");
            $("#imSlot1").focus().click();
            InventoryModal.imEquip(5);  // 刀

            $("#sysToast").hide().addClass("slideInUp");
            $(".popover").hide();
            $("#sysToast .npc-welcome").removeClass("npc-welcome-top");


            let hw = HelpWizard.getInstance();
            $("#imSlot1").removeClass("blink");
            $("#imSlot1").removeClass("blink");
            $("#imEquip").removeClass("blink");
            hw._helpInventoryStudy();
        });
    }

    _helpInventoryStudy(){
        InventoryModal.drawModal(true);
        $("#imSlot6").focus().click();
        $("#imSlot6").addClass("blink");
        $("#btnInputKeyI").addClass("active blink");
        // $("#toastBody").html( "秘笈需要[修习]，才能随着经验的获得而升级。").unbind('click');
        // $("#sysToast .toast-header").html("武学系统").show();
        // $("#sysToast").show().addClass("slideInUp animated");
        gGui.sysToastWithoutHide(globalStrings.WIZARD_INV_STUDY_TITLE,globalStrings.WIZARD_INV_USE_HEADER);
        $("#inventoryModal .modal-header span").html(globalStrings.WIZARD_INV_STUDY_CONTENT).show();
        $("#inventoryModal .modal-footer button").hide();
        $("#imDrop").hide();
        $("#imStudy").addClass("blink").one("click",function(){
            $("#imSlot6").focus().click();
            $("#btnInputKeyI").removeClass("active blink");
            InventoryModal.imStudy();
            $("#imStudy").removeClass("blink");
            $("#imSlot6").removeClass("blink");
            $("#imStudy").removeClass("blink");
            $("#imDrop").show();
            $("#inventoryModal .modal-header span").hide();
            $("#inventoryModal .modal-footer button").show();
            $("#sysToast").hide().addClass("slideInUp");
            $(".popover").hide();
            $("#sysToast .npc-welcome").removeClass("npc-welcome-top");


            let hw = HelpWizard.getInstance();
            hw._step4();
        });
    }

    /**
     * 显示角色页面
     */
    _step4(){
        // gGui.drawCharacter();
        CharacterModal.drawCharacterModal(true);
        $("#characterModal .modal-footer .btn-secondary").hide();

        // tells about the weapon equipped
        $("#cmSlot3").addClass("active blink");
        gGui.sysToastWithoutHide(globalStrings.WIZARD_4_1,globalStrings.WIZARD_4_2);
        $("#cmSlot3").one('click',function (){
            $("#sysToast").removeClass('slideInDown animated');
            $("#cmSlot3").removeClass("active blink");
            $("#sysToast").hide().addClass("slideInUp");
            $(".popover").hide();
            $("#sysToast .npc-welcome").removeClass("npc-welcome-top");

            // tells about the kongfu studying
            $("#cmSlot7").addClass("active blink");
            gGui.sysToastWithoutHide(globalStrings.WIZARD_4_3,globalStrings.WIZARD_4_4);
            $("#cmSlot7").one('click',function () {
                $("#sysToast").removeClass('slideInDown animated');
                $("#cmSlot7").removeClass("active blink");
                $("#sysToast").hide().addClass("slideInUp");
                $(".popover").hide();
                $("#sysToast .npc-welcome").removeClass("npc-welcome-top");

                // cmExp
                $("#cmExpLearn").addClass("blink");
                gGui.sysToastWithoutHide(globalStrings.WIZARD_4_5,globalStrings.WIZARD_4_6);
                $("#cmExpLearn").one('click',function () {
                    $("#sysToast").removeClass('slideInDown animated');
                    $("#cmExpLearn").removeClass("blink");
                    $("#sysToast").hide().addClass("slideInUp");
                    $("#sysToast .npc-welcome").removeClass("npc-welcome-top");
                    $("#characterModal .modal-footer .btn-secondary").show();
                    let hw = HelpWizard.getInstance();
                    hw._step5();
                });
            });
        });

    }

    /**
     * 显示武学介绍页面
     */
    _step5(){
        KongFuModal.drawKongFuModal(true);
        $("#kfNg0").focus().click();
        $("#btnInputKeyK").addClass("active blink");
        gGui.sysToastWithoutHide(globalStrings.WIZARD_5_1,globalStrings.WIZARD_5_2);
        $("#kongFuModal .modal-header span").show();
        $("#kongFuModal .modal-footer button").hide();
        let kfHelp = "<div class='alert alert-danger'>"+globalStrings.WIZARD_5_3+"</p></div>";
        $("#kongFuModal .cm-right .card-body").append(kfHelp);
        $("#kfBtnActive").show().addClass("blink").one("click",function(){
            $("#kfBtnActive").removeClass("blink");
            $("#kongFuModal .modal-header span").hide();
            $("#kongFuModal .modal-footer button").show();
            KongFuModal.hideModal();
            $("#sysToast").removeClass('slideInDown animated');
            $("#sysToast").hide().addClass("slideInUp");
            $("#sysToast .npc-welcome").removeClass("npc-welcome-top");
            gGui.sysToastWithoutForHelpWizard(globalStrings.WIZARD_5_4,globalStrings.TOAST_EXIT);
            // setTimeout(function(){
            //     $("#sysToast").removeClass('slideInUp animated').hide();
            // },3000);
            // gGui.sysToast(globalStrings.WIZARD_5_4,globalStrings.NEWBIE_HELP);
            $("#btnInputKeyK").removeClass("active blink");
            BOOL_NEW_GAME = false;
            gGui.enableKeys();
        });
    }

}