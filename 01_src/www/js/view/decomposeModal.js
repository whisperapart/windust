/**
 * Created by jim on 2021/12/08.
 * Implemented by jim on 2021/12/21.
 * ComposeModal - 合成精华 弹窗
 * DecomposeModal - 分解精华 弹窗
 */

class DecomposeModal {
    // 类变量定义
    static strSelector = '#decomposeModal';
    static ssItem1 = '#decomposeItem1'; static ssItem1Text = "#decomposeItem1Text";
    static ssItem2 = '#decomposeItem2'; static ssItem2Text = "#decomposeItem2Text";
    static ssItem3 = '#decomposeItem3'; static ssItem3Text = "#decomposeItem3Text";
    static ssItem4 = '#decomposeItem4'; static ssItem4Text = "#decomposeItem4Text";
    static ssCircleWarp = '#decomposeCircleWarp';
    static ssCircle = '#decomposeCircle';
    static ssInventory = '#decomposeInventory';
    static ssBtnOK = '#decomposeDo';

    // static functions
    static drawModal(){
        $(".modal").modal('hide');
        DecomposeModal.updateModelContent();
        $(DecomposeModal.ssBtnOK).attr('disabled',true);
        $(DecomposeModal.strSelector).modal('show');
    }

    static updateModelContent(){

    }

    // 静态函数 - 通常不需要修改
    /**
     * 判断当前 弹窗 是否已经显示
     * @returns {boolean} true=已经显示 false=没有显示
     */
    static isShow(){
        return ($(DecomposeModal.strSelector).css('display') === 'block');
    }

    /**
     * 隐藏当前弹窗
     */
    static hideModal(){
        $(DecomposeModal.strSelector).modal('hide');
    }

    /**
     * 为指定的dom元素，添加抖动效果，1秒后自动取消
     * @param ele dom元素，使用 jQuery(ele)
     */
    static animateShakeThis(ele){
        gGui.playSoundEffect("fail");
        $(ele).addClass("animated headShake");
        setTimeout(function () { $(ele).removeClass("animated headShake"); },1000);
    }

    /**
     * 非模板类函数
     */


    // instance functions

    // 构造函数 - new 对象的时候调用
    constructor() {
        $(DecomposeModal.strSelector).on("hide.bs.modal",function(){
            gGui.enableKeys();
        }).on('show.bs.modal',gGui.disableKeys);
    }
}

let decomposeModal = new DecomposeModal();