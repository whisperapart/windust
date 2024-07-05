/**
 * Created by jim on 2021/12/01.
 *
 *
 **/

let charRainManager;

class MeditationModal extends BaseModal{
    // 类变量定义
    static strSelector = '#meditationModal';
    static ssMMDo = '#mmDo';
    static ssMMInventory = "#mmInventory";

    // 静态函数 - 该弹窗的控制函数
    static drawModal(intCityId){
        // charRainManager = CharRainManager.getInstance();
        $(".modal").modal('hide');
        $(MeditationModal.strSelector).data('intCityId',intCityId).data('intZQId',-1).data('intKFType',-1).data('intItemId',-1);
        MeditationModal.updateModelContent(intCityId);
        $(MeditationModal.strSelector).modal('show');
        // $("#npcHail").html(globalStrings.MM_INTRO);
    }

    static updateModelContent(intCityId){
    }

    // instance functions
    // 构造函数 - new 对象的时候调用
    constructor() {
        super(MeditationModal.strSelector);
    }
}

let meditationModal = new MeditationModal();