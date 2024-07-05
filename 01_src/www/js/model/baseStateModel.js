/**
hit     : 0.0,          // 命中       %       // 外功 内功
atk : 0.0,          // 攻击强度           // 内功修正
def     : 0.0,          // 防御       %       // 外功修正 内功修正
crt    : 0.0,          // 爆率       %       // 被外功修正
crm   : 0.0,          // 爆击倍数   %       // 被内功修正
hst      : 0.0,          // 极速       %       // 轻功
dge       : 0.0,          // 闪避       %       // 轻功
par       : 0.0,          // 招架       %       // 被外功修正
fdb       : 0.0,          // 反伤       %
fdh  : 0.0,          // 吸血       %
ris   : 0.0,          // 毒抗       %
luk   : 0.0,          // 幸运       %
reg       : 0.0,          // 回血               // 内功修正
rem       : 0.0,          // 回蓝               // 内功修正
**/

// todo: -  js 保留小数的逻辑需要修改，在这个静态方法类里面，所有的数据应该用实际值（小数），展示的时候才转为百分制。

class BaseStateModel {            // 被真气修正 被轻功修正 被外功修正
    /** * @description constructor with 14 base values */
    static initFromValue(pc,  ap,  df,  cr,  cm,  hl,  dg,  py,  th,  dh,  pr,  mf,  hr,  mr) {
        let baseState = {};
        baseState.hit = pc;
        baseState.atk = parseInt(ap);
        baseState.def = df;
        baseState.crt = cr;
        baseState.crm = cm;
        baseState.hst = hl;
        baseState.dge = dg;
        baseState.par = py;
        baseState.fdb = th;
        baseState.fdh = dh;
        baseState.ris = pr;
        baseState.luk = mf;
        baseState.reg = parseInt(hr);
        baseState.rem = parseInt(mr);
        BaseStateModel._checkRng(baseState);
        return baseState;
    }

    /** * @description constructor with an array which contains 14 base values */
    static initFromArr(arr) {
        if(!Array.isArray(arr)) return BaseStateModel.Zero();
        if (arr.length != 14) return BaseStateModel.Zero();
        return  BaseStateModel.initFromValue(arr[0],arr[1],arr[2],arr[3],arr[4],arr[5],arr[6],arr[7],arr[8],arr[9],arr[10],arr[11],arr[12],arr[13]);
    }

    /** * @returns {0,0,0,0,0, 0,0,0,0,0, 0,0,0,0} */
    static Zero() { return BaseStateModel.initFromValue(0,0,0,0,0,   0,0,0,0,0,   0,0,0,0); }

    /** * @returns object calculation from str and wis */
    static initFromStrWis(str,wis){
        let baseState = {};
        baseState.hit = 0.0001 * wis;   // 同级别基础命中率96%，每相差1级别相差1%
        baseState.atk = 0.01 * str * str;
        baseState.def = Math.min(0.0003 * str , GlobalConfig.STATE_DEF_MAX);
        baseState.crt = 0.0002 * str;
        baseState.crm = 1.4 + 0.006 * wis;
        baseState.hst = 0;
        baseState.dge = Math.min(0.0003 * wis, GlobalConfig.STATE_DGE_MAX);
        baseState.par = Math.min(0.0002 * str , GlobalConfig.STATE_PAR_MAX);
        baseState.fdb = 0;
        baseState.fdh = 0;
        baseState.ris = 0;
        baseState.luk = 0;
        baseState.reg = Math.floor(str/60)+3;
        baseState.rem = Math.floor(wis/60)+3;
        BaseStateModel._checkRng(baseState);
        return baseState;
    }

    /** * @returns {BaseStateModel} */
    static DynamicWithTier(pCategory, pTier){
        // Gray = 1,White = 2,Blue = 3,Gold=4, Purple = 5, Epic =6 , Green = 9
        // Misc = 1, Hat = 2, Necklace = 3, Ring = 4 , Sword = 5, Gloves = 6, Machete = 7, Spear = 8, Coat = 9, Pants = 10 , Shoes = 11, Ammo = 12, Bow = 13

        // 计算应该有几个属性
        //int stateCount = (1 + (int)pTier) / 2; // 1、2 =1  3=2 4=3 5=3/4 6=4/5
        let stateCount = GlobalFunction.GetStateCount(Math.floor(pTier));

        // 计算类型， 防具加 def 武器 加 ap
        let def = 0;
        let ap = 0;
        if (GlobalFunction.IsWeapon(pCategory)) {
            // weapons
            ap = GlobalFunction.possRand(1, pTier * 3);
            stateCount--;
        }
        if (GlobalFunction.IsArmor(pCategory)) {
            // armors
            def = GlobalFunction.possRand(1, pTier * 3);
            stateCount--;
        }
        // MISC 类型的这里不作处理。

        let valArr = [ 0, ap, def, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        // 获取不重复的随机数
        if (stateCount > 0)
        {
            // 可能出现类似 防具 又随机到 def， 武器又随机到 AP 的情况, 是正常的
            let posArr = GlobalFunction.getRandUnique(0, 14, stateCount); // [0,13] stateCount 个 posArr = 词缀数组
            for (let j = 0; j < posArr.length; j++)
            {
                valArr[posArr[j]] += GlobalFunction.possRand(0, pTier * 3);
            }

        }

        return BaseStateModel.initFromArr(valArr);
    }

    /** * @returns {BaseStateModel} */
    static DynamicFromTemplate(bState, low=0.32){
        let ret = BaseStateModel.Zero();
        ret.hit     = GlobalFunction.midPosRand(bState.hit, low);
        ret.atk = GlobalFunction.midPosRand(bState.atk, low);
        ret.def     = GlobalFunction.midPosRand(bState.def, low);
        ret.crt    = GlobalFunction.midPosRand(bState.crt, low);
        ret.crm   = GlobalFunction.midPosRand(bState.crm, low);
        ret.hst      = GlobalFunction.midPosRand(bState.hst, low);
        ret.dge       = GlobalFunction.midPosRand(bState.dge, low);
        ret.par       = GlobalFunction.midPosRand(bState.par, low);
        ret.fdb       = GlobalFunction.midPosRand(bState.fdb, low);
        ret.fdh  = GlobalFunction.midPosRand(bState.fdh, low);
        ret.ris   = GlobalFunction.midPosRand(bState.ris, low);
        ret.luk   = GlobalFunction.midPosRand(bState.luk, low);
        ret.reg       = GlobalFunction.midPosRand(bState.reg, low);
        ret.rem       = GlobalFunction.midPosRand(bState.rem, low);

        return ret;
    }

    /** * @param.min int [0,100)
    /** * @returns {BaseStateModel} */
    static DynamicFromTemplateRange(bState, min, max){
        let ret = BaseStateModel.Zero();
        ret.hit = Math.floor(bState.hit * GlobalFunction.getRand(min, max) * 0.01);
        ret.atk = Math.floor(bState.atk * GlobalFunction.getRand(min, max) * 0.01);
        ret.def = Math.floor(bState.def * GlobalFunction.getRand(min, max) * 0.01);
        ret.crt = Math.floor(bState.crt * GlobalFunction.getRand(min, max) * 0.01);
        ret.crm = Math.floor(bState.crm * GlobalFunction.getRand(min, max) * 0.01);
        ret.hst = Math.floor(bState.hst * GlobalFunction.getRand(min, max) * 0.01);
        ret.dge = Math.floor(bState.dge * GlobalFunction.getRand(min, max) * 0.01);
        ret.par = Math.floor(bState.par * GlobalFunction.getRand(min, max) * 0.01);
        ret.fdb = Math.floor(bState.fdb * GlobalFunction.getRand(min, max) * 0.01);
        ret.fdh = Math.floor(bState.fdh * GlobalFunction.getRand(min, max) * 0.01);
        ret.ris = Math.floor(bState.ris * GlobalFunction.getRand(min, max) * 0.01);
        ret.luk = Math.floor(bState.luk * GlobalFunction.getRand(min, max) * 0.01);
        ret.reg = Math.floor(bState.reg * GlobalFunction.getRand(min, max) * 0.01);
        ret.rem = Math.floor(bState.rem * GlobalFunction.getRand(min, max) * 0.01);
        return ret;
    }

    /** * @description 根据物品 bState, CDEItemCategory category获取词缀数组 */
    /** * @returns { List<string> preList} */
    static ReturnPreStrForDynamicItems( bState) {
        //ReturnPreStrForDynamicItems : function( bState,pCategory) {
        let preList =[];
        if (bState.hit      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_MZ);
        if (bState.atk      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_GQ);
        if (bState.def      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_FY);
        if (bState.crt      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_BL);
        if (bState.crm      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_BB);
        if (bState.hst      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_JS);
        if (bState.dge      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_SB);
        if (bState.par      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_ZJ);
        if (bState.fdb      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_FS);
        if (bState.fdh      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_XX);
        if (bState.ris      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_DK);
        if (bState.luk      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_XY);
        if (bState.reg      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_HX);
        if (bState.rem      >= GlobalConfig.FLOAT_MIN) preList.push(GlobalDict.ITEM_PRE_HL);
        return preList;
    }

    /** * @returns {int } */
    static GetPrice(bState){
        let ret = 0;
        if (bState.hit >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.hit * GlobalConfig.STATE_PRICE_PC);
        if (bState.atk >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.atk * GlobalConfig.STATE_PRICE_AP);
        if (bState.def >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.def * GlobalConfig.STATE_PRICE_DF);
        if (bState.crt >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.crt * GlobalConfig.STATE_PRICE_CR);
        if (bState.crm >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.crm * GlobalConfig.STATE_PRICE_CM);
        if (bState.hst >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.hst * GlobalConfig.STATE_PRICE_HL);
        if (bState.dge >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.dge * GlobalConfig.STATE_PRICE_DG);
        if (bState.par >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.par * GlobalConfig.STATE_PRICE_PY);
        if (bState.fdb >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.fdb * GlobalConfig.STATE_PRICE_TH);
        if (bState.fdh >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.fdh * GlobalConfig.STATE_PRICE_DH);
        if (bState.ris >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.ris * GlobalConfig.STATE_PRICE_PR);
        if (bState.luk >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.luk * GlobalConfig.STATE_PRICE_MF);
        if (bState.reg >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.reg * GlobalConfig.STATE_PRICE_HR);
        if (bState.rem >= GlobalConfig.FLOAT_MIN)       ret += Math.ceil(bState.rem * GlobalConfig.STATE_PRICE_MR);
        return ret;
    }

    /** * @description bState * by */
    /** * @returns {BaseStateModel } */
    static Multi(bState,by){
        return BaseStateModel.initFromValue(
            bState.hit * by,
            Math.round(bState.atk * by),
            bState.def * by,
            bState.crt * by,
            bState.crm * by,
            bState.hst * by,
            bState.dge * by,
            bState.par * by,
            bState.fdb * by,
            bState.fdh * by,
            bState.ris * by,
            bState.luk * by,
            Math.round(bState.reg * by),
            Math.round(bState.rem * by)
        );
    }
    static _checkRng(obj){
        obj.hit = Math.min(obj.hit,GlobalConfig.STATE_HIT_MAX); // 100%
        obj.def = Math.min(obj.def,GlobalConfig.STATE_DEF_MAX); // 72%
        obj.crt = Math.min(obj.crt,GlobalConfig.STATE_CRT_MAX); // 100%
        obj.dge = Math.min(obj.dge,GlobalConfig.STATE_DGE_MAX); // 72%
        obj.par = Math.min(obj.par,GlobalConfig.STATE_PAR_MAX); // 72%
        obj.ris = Math.min(obj.ris,GlobalConfig.STATE_RIS_MAX); // 100%
    }

    /** * @description merge all stateArr together */
    static merge(bsArr){
        let ret = BaseStateModel.Zero();
        bsArr.forEach(function(bs){
            ret.hit += isNaN(parseFloat(bs.hit)) ? 0.0 : parseFloat(bs.hit);
            ret.atk += isNaN(parseInt(bs.atk)) ? 0 : parseInt(bs.atk);
            ret.def += isNaN(parseFloat(bs.def)) ? 0.0 : parseFloat(bs.def);
            ret.crt += isNaN(parseFloat(bs.crt)) ? 0.0 : parseFloat(bs.crt);
            ret.crm += isNaN(parseFloat(bs.crm)) ? 0.0 : parseFloat(bs.crm);
            ret.hst += isNaN(parseFloat(bs.hst)) ? 0.0 : parseFloat(bs.hst);
            ret.dge += isNaN(parseFloat(bs.dge)) ? 0.0 : parseFloat(bs.dge);
            ret.par += isNaN(parseFloat(bs.par)) ? 0.0 : parseFloat(bs.par);
            ret.fdb += isNaN(parseFloat(bs.fdb)) ? 0.0 : parseFloat(bs.fdb);
            ret.fdh += isNaN(parseFloat(bs.fdh)) ? 0.0 : parseFloat(bs.fdh);
            ret.ris += isNaN(parseFloat(bs.ris)) ? 0.0 : parseFloat(bs.ris);
            ret.luk += isNaN(parseFloat(bs.luk)) ? 0. : parseFloat(bs.luk);
            ret.reg += isNaN(parseInt(bs.reg)) ? 0 : parseInt(bs.reg);
            ret.rem += isNaN(parseInt(bs.rem)) ? 0 : parseInt(bs.rem);
        });
        BaseStateModel._checkRng(ret);
        return ret;
    }
    static multiAtk(ori,multi){
        let atk1 = isNaN(parseInt(ori.atk)) ? 0 : parseInt(ori.atk);
        let atk2 = isNaN(parseFloat(multi.atk)) ? 0.0: parseFloat(multi.atk);
        let r = BaseStateModel.merge([ori,multi]);
        r.atk = parseInt(atk1 * (1 + atk2));
        return r;
    }

     /** * @description output as HTML String */
    /** * @returns string */
    static toString(bStateArr) {
        if(bStateArr === undefined) return;
        let ret = "";
        if (bStateArr.hit        >= GlobalConfig.FLOAT_MIN) ret += "命中 + " + (100*bStateArr.hit).toFixed(2) + "%<br>";
        if (bStateArr.atk    >= GlobalConfig.FLOAT_MIN) ret += "攻强 + " + parseInt(bStateArr.atk) + "<br>";
        if (bStateArr.def        >= GlobalConfig.FLOAT_MIN) ret += "防御 + " + (100*bStateArr.def).toFixed(2) + "%<br>";
        if (bStateArr.crt       >= GlobalConfig.FLOAT_MIN) ret += "爆率 + " + (100*bStateArr.crt).toFixed(2) + "%<br>";
        if (bStateArr.crm      >= GlobalConfig.FLOAT_MIN) ret += "爆伤 + " + (100*bStateArr.crm).toFixed(2) + "%<br>";
        if (bStateArr.hst         >= GlobalConfig.FLOAT_MIN) ret += "急速 + " + (100*bStateArr.hst).toFixed(2) + "%<br>";
        if (bStateArr.dge          >= GlobalConfig.FLOAT_MIN) ret += "闪避 + " + (100*bStateArr.dge).toFixed(2) + "%<br>";
        if (bStateArr.par          >= GlobalConfig.FLOAT_MIN) ret += "招架 + " + (100*bStateArr.par).toFixed(2) + "%<br>";
        if (bStateArr.fdb          >= GlobalConfig.FLOAT_MIN) ret += "反伤 + " + (100*bStateArr.fdb).toFixed(2) + "%<br>";
        if (bStateArr.fdh     >= GlobalConfig.FLOAT_MIN) ret += "吸血 + " + (100*bStateArr.fdh).toFixed(2) + "%<br>";
        if (bStateArr.ris      >= GlobalConfig.FLOAT_MIN) ret += "抗性 + " + (100*bStateArr.ris).toFixed(2) + "%<br>";
        if (bStateArr.luk      >= GlobalConfig.FLOAT_MIN) ret += "精准 + " + (100*bStateArr.luk).toFixed(2) + "%<br>";
        if (bStateArr.reg          >= GlobalConfig.FLOAT_MIN) ret += "再生 + " + parseInt(bStateArr.reg) + "<br>";
        if (bStateArr.rem          >= GlobalConfig.FLOAT_MIN) ret += "内息 + " + parseInt(bStateArr.rem) + "<br>";
        return ret;
    }
}



