/**
 * Created by jim on 2020/5/7.
 */

class ItemModel {
    /** * @description constructor from static db */
    static initWithLevel(kfId,level) {

    }
    static emptyItem(){
        return {"itemId": 0,"itemName": "","itemLevel": 0,"itemDesc": "",
            "itemCate": "","kfId": 0,
            "itemPrice": 0,
            "itemSellable": 1,"itemDropable": 1,"stack": 1,
            "itemSource": "",
            "fist": 0,"sword": 0,"machete": 0,"spear": 0,"ejection": 0,"heal": 0,"enchant": 0,"swift": 0,
            "hit": 0,"atk": 0,"def": 0,"crt": 0,"crm": 0,"hst": 0,"dge": 0,"par": 0,"fdb": 0,"fdh": 0,"ris": 0,"luk": 0,"reg": 0,"rem": 0
        };
    }

    /**
     * 创建 itemObj , 对应dbItem
     * @param tier [0,7]
     * @param neili [0,1,2] 阴柔 调和 阳刚
     * @param type [0,1,2] 内功 外功 轻功  =1 -> 11=fist 12=sword 13=machete 14=spear 15=ejection
     * @returns {}
     */
    static dynamicItem(tier, neili, type){
        // get tier,neilitype,kfType by item id
        tier = arguments[0] ? arguments[0] : 0;
        neili = arguments[1] ? arguments[1] : 0;
        type = arguments[2] ? arguments[2] : 0;

        tier = parseInt(tier); tier = tier>=7 ? 7 : tier; tier = tier<0 ? 0 : tier;
        neili = parseInt(neili); neili = neili >= 2 ? 2 : neili; neili = neili <=0 ? 0 : neili;
        type = parseInt(type); type = type<=0 ? 0 : type;

        let iId = (tier-2)*24 + 182;
        let fac = 0;
        if(type>10){
            fac = (type-9) * 3;
        }else {
            if (type == 2) {
                fac = 21;
            } else {
                fac = type * 3;
            }
        }
        // switch(type){
        //     case 0: fac = 0;break;
        //     case 1: fac = 3;break;
        //     case 2: fac = 21;break;
        //     case 11: fac = 6;break;
        //     case 12: fac = 9;break;
        //     case 13: fac = 12;break;
        //     case 14: fac = 15;break;
        //     case 15: fac = 18;break;
        //     default:fac =0;break;
        // }

        iId = iId + fac + neili;

        return gDB.getItemById(iId);
    }
    static identifyItem(itemId){
        // [182,325]
        // 根据itemId 拆出来 kf tier neili type
        // 生成 kf，更新到 dbKF
        // 生成物品名称
        // 生成物品数据
        // todo - inventory - 移除原物品
        // todo - inventory- 替换新物品
        // debug itemId = 268 阳刚 刀法
        if(itemId>325 || itemId<182){
            return gDB.getItemById(itemId);
        }
        let tier = Math.floor((itemId - 182) / 24) + 2;     // 5
        let neili = (itemId - 182) % 3;     // 2
        // let fac = Math.floor((itemId-182)/3);   //  28

        let f1 = (itemId-182)%24;   // 14
        let fac = Math.floor(f1/3); // 4

        let itype = 0;
        switch(fac){    // [0,1,2] 内功 外功 轻功  =1 -> 11=fist 12=sword 13=machete 14=spear 15=ejection
            case 0:itype=0;break;   // 内功
            case 1:itype=1;break;   // 外功
            case 2:itype=11;break;  // 拳法
            case 3:itype=12;break;  // 剑法
            case 4:itype=13;break;  // 刀法
            case 5:itype=14;break;  // 枪法
            case 6:itype=15;break;  // 暗器
            case 7:itype=2;break;   // 轻功
            default:itype=0;break;  // 内功
        }
        let kf = KFModel.kfDynamic(tier,neili,itype);
        dbKF.push(kf);

        let iObj = ItemModel.emptyItem();
        iObj.templateId = itemId;
        iObj.itemId = ItemModel._uuid();
        ItemModel._dynamicItemNameAndCate(kf,iObj);
        iObj.itemLevel = tier;
        iObj.desc = 'N/A';
        // iObj.desc = 'N/A';
        iObj.itemSource = 'dynamic';
        iObj.itemPrice = ItemModel._getPriceByTier(tier);
        iObj.kfId = kf.kfId;

        // dbItem.push(iObj);

        return iObj;
    }

    static _getUnIdentifyNeiliTypeByItemId(itemId){
        let neili = (itemId - 182) % 3;     // 2
        switch (neili){
            case 1: return KFModel.getThemeForNeili('调和');
            case 2: return KFModel.getThemeForNeili('阳刚');
            case 0: return KFModel.getThemeForNeili('阴柔');
            default: return KFModel.getThemeForNeili('');
        }
    }

    static _uuid(){
        let id = dbItem.length;
        while(gDB.getItemById(id) !== undefined){
            id++;
        }
        return id;
    }

    static getLevelArr(type,level){
        let levelArr = [0,0,0,0,0,0,0,0];
        switch(type){
            case 'qing':    levelArr[7] = Math.floor(level+2)/2; break;
            case 'nei':     levelArr[6] = Math.floor(level+2)/2; break;
            case 'heal':    levelArr[5] = Math.floor(level+2)/2; break;
            case 'fist':    levelArr[0] = Math.floor(level+2)/2; break;
            case 'spear':   levelArr[3] = Math.floor(level+2)/2; break;
            case 'sword':   levelArr[1] = Math.floor(level+2)/2; break;
            case 'machete': levelArr[2] = Math.floor(level+2)/2; break;
            case 'ejection':levelArr[4] = Math.floor(level+2)/2; break;
            default: break;
        }
        return levelArr;
    }
    static getLevelMin(type,level){
        let levelArr = [0,0,0,0,0,0,0,0];
        switch(type){
            case 'qing':    levelArr[7] = level * 9; break;
            case 'nei':     levelArr[6] = level * 9; break;
            case 'heal':    levelArr[5] = level * 9; break;
            case 'fist':    levelArr[0] = level * 9; break;
            case 'spear':   levelArr[3] = level * 9; break;
            case 'sword':   levelArr[1] = level * 9; break;
            case 'machete': levelArr[2] = level * 9; break;
            case 'ejection':levelArr[4] = level * 9; break;
            default: break;
        }
        return levelArr;
    }

    static getPrice(itemObj){
        if(itemObj == null) return 0;
        let prc;
        if(typeof(itemObj.itemPrice) == 'string'){
            prc = parseInt(itemObj.itemPrice.replace(/,/gi, ''));
        }else{
            prc = parseInt(itemObj.itemPrice);
        }
        if(prc<=0){ prc =ItemModel._getPriceByTier(itemObj.itemLevel);}
        return prc;
    }
    static _getPriceByTier(tier){
        // return (tier+1) * (tier+1) * 20 + 20;
        // updated 20220217 统一为 2pow(tier+1)*100 ，所有item价格也调整
        return Math.pow(2,tier+1)*100;
    }
    static _dynamicItemNameAndCate(kfObj,iObj){
        let pre = " "+globalStrings.ITEM_PRE_SM;    // Secret Manual
        switch (kfObj.kfType){
            case 'nei':pre = globalStrings.ITEM_PRE_NG+pre;iObj.itemCate = '内功秘笈';break;    // Inner-Work Secret Manual
            case 'qing':pre = globalStrings.ITEM_PRE_QG+pre;iObj.itemCate = '轻功秘笈';break;
            case 'heal':pre= globalStrings.ITEM_PRE_YS;iObj.itemCate = '医书';break;
            case 'fist':pre = globalStrings.ITEM_PRE_QZ+pre;iObj.itemCate = '外功秘笈';break;
            case 'sword':pre = globalStrings.ITEM_PRE_JF+pre;iObj.itemCate = '外功秘笈';break;
            case 'machete':pre = globalStrings.ITEM_PRE_DF+pre;iObj.itemCate = '外功秘笈';break;
            case 'spear':pre = globalStrings.ITEM_PRE_QF+pre;iObj.itemCate = '外功秘笈';break;
            case 'ejection':pre = globalStrings.ITEM_PRE_AQ+pre;iObj.itemCate = '外功秘笈';break;
            default:break;
        }
        iObj.itemName = pre + ': '+kfObj.kfName;
    }

    /** * @description output as HTML String */
    /** * @param itemObj : item object */
    /** * @param escStr : bool, if true = support popover, if false = do not support popover, default = true */
    /** * @returns string */
    static toString(itemObj,escStr=true) {
        if(itemObj === undefined) return;
        let idesc = '';
        let nlClass = ItemModel._getUnIdentifyNeiliTypeByItemId(itemObj.itemId);
        // 如果附带功夫，拼接功夫显示字符串
        if(itemObj.kfId != '' && itemObj.kfId !== undefined){
            let lv = KFModel.getPlayerLevelForKF(itemObj.kfId);
            // console.log('kfid = '+itemObj.kfId + ' - lv = '+ lv);
            let kfObj = KFModel.initWithLevel(itemObj.kfId,lv);
            // idesc += KFModel.toString(kfObj);
            //let x = escString(kfObj).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
            let btnClass = KFModel.getThemeForNeili(kfObj.dbObj.kfNeili);
            let x = escStr ? '<button class="btn btn-xs '+btnClass+' kf-pop-over" title="" data-container="body" data-toggle="popover" data-placement="bottom" data-html="true" data-content="'+escString(KFModel.toString(kfObj))+'">'+kfObj.dbObj.kfName+'</button>' : '<span class="'+btnClass+'"> ['+kfObj.dbObj.kfName+'] </span>';
            // console.log(x);
            x += '<br/>'+globalStrings.ITEM_DESC_1+KFModel.getSkillNameForKF(kfObj.dbObj.kfType)+">="+KFModel.getSkillMinToLearn(kfObj.dbObj.kfTier);
            x += '<br/>'+globalStrings.ITEM_DESC_2 + CharacterModel.getSkillValue(kfObj.dbObj.kfType);
            x += '<div>'+globalStrings.ITEM_DESC_3 + KFModel.getLevelUpSkillPoint(kfObj.dbObj.kfTier) + '<br/>'+globalStrings.ITEM_DESC_5+ KFModel.getSkillMaxByLearn(kfObj.dbObj.kfTier) + '</div>';
            idesc = '<div class="kf-desc-cookie">'+globalStrings.ITEM_DESC_4+x+'</div>';
        }else{
            idesc = (itemObj.itemDesc == 'NA' || itemObj.itemDesc == '' || itemObj.itemDesc === undefined) ? '' :  '<div class="kf-desc-cookie">'+itemObj.itemDesc+'</div>';
        }
        // 物品本身的其他属性描述字符串
        let iconStr = ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
        let themeStr = ItemModel.getThemColorByTier(itemObj.itemLevel);
        if((itemObj.itemId >= 182) && (itemObj.itemId<=325)){   // 领悟的秘笈
            themeStr = 'theme-gray';
        }
        let ret = '<div class="kf-desc '+themeStr+'">'
            + iconStr
            + '<span class="">'+itemObj.itemName + '</span> ' + idesc
            + '</div>';
        ret += '<div>'+globalStrings.KM_STR_TIER+'<span class="'+themeStr+'">'+gDB.getTierString(itemObj.itemLevel)+'</span></div>' +
            '<div>'+globalStrings.KM_STR_TYPE+ItemModel.itemCateToLocStr(itemObj.itemCate)+ '</div>';
        let priceStr = toReadableString(ItemModel.getPrice(itemObj));
        // let priceStr = (itemObj.itemSellable == 0)? globalStrings.ITEM_DESC_NOT_SELL:  toReadableString(ItemModel.getPrice(itemObj));
        priceStr = (itemObj.itemSellable == 0)? (priceStr +"<br/>"+globalStrings.ITEM_DESC_NOT_SELL):priceStr;
        ret += '<div>'+globalStrings.KM_STR_PRICE+ priceStr +'</div>';
        let s = ItemModel.getItemStatString(itemObj);

        ret += '<div class="kf-desc">'+s+'</div>';

        // 如果未鉴定，提示去 学坊找学士鉴定
        if((itemObj.itemId >= 182) && (itemObj.itemId<=325)){   // 领悟的秘笈
            ret += '<div class="kf-desc">'+globalStrings.ITEM_DESC_6+'</div>';
        }

        // if ship - udpated 2023.05.04
        if(itemObj.itemId >=165 && itemObj.itemId <=173){
            let ship = gDB.getShipById(parseInt(itemObj.itemId)-164);
            let strShip = globalStrings.SHIP_SPEED+': '+ship.speed+"<br/>"+globalStrings.SHIP_SPACE+": "+ship.cargoMax+"<br/>"+globalStrings.SHIP_SUPPLY+": "+ship.supplyMax + "<br/>"+globalStrings.SHIP_CONSUMPTION+": "+ship.consumption;
            ret += '<div class="kf-desc">'+strShip+'</div>';
        }




        // s += itemObj.HPMax > 0 ? '防御：+'+itemObj.atk+'% <br/>' : '';
        // s += itemObj.HPMax > 0 ? '防御：+'+itemObj.atk+'% <br/>' : '';




        // if (bStateArr.hit        >= GlobalConfig.FLOAT_MIN) ret += "命中等级 + " + bStateArr.hit + "<br>";
        // if (bStateArr.atk    >= GlobalConfig.FLOAT_MIN) ret += "攻击强度 + " + bStateArr.atk + "<br>";
        // if (bStateArr.def        >= GlobalConfig.FLOAT_MIN) ret += "防御等级 + " + bStateArr.def + "<br>";
        // if (bStateArr.crt       >= GlobalConfig.FLOAT_MIN) ret += "爆击等级 + " + bStateArr.crt + "<br>";
        // if (bStateArr.crm      >= GlobalConfig.FLOAT_MIN) ret += "爆伤等级 + " + bStateArr.crm + "<br>";
        // if (bStateArr.hst         >= GlobalConfig.FLOAT_MIN) ret += "极速等级 + " + bStateArr.hst + "<br>";
        // if (bStateArr.dge          >= GlobalConfig.FLOAT_MIN) ret += "闪避等级 + " + bStateArr.dge + "<br>";
        // if (bStateArr.par          >= GlobalConfig.FLOAT_MIN) ret += "招架等级 + " + bStateArr.par + "<br>";
        // if (bStateArr.fdb          >= GlobalConfig.FLOAT_MIN) ret += "反伤等级 + " + bStateArr.fdb + "<br>";
        // if (bStateArr.fdh     >= GlobalConfig.FLOAT_MIN) ret += "吸血等级 + " + bStateArr.fdh + "<br>";
        // if (bStateArr.ris      >= GlobalConfig.FLOAT_MIN) ret += "毒抗等级 + " + bStateArr.ris + "<br>";
        // if (bStateArr.luk      >= GlobalConfig.FLOAT_MIN) ret += "幸运等级 + " + bStateArr.luk + "<br>";
        // if (bStateArr.reg          >= GlobalConfig.FLOAT_MIN) ret += "生命回复 + " + bStateArr.reg + "<br>";
        // if (bStateArr.rem          >= GlobalConfig.FLOAT_MIN) ret += "内力回复 + " + bStateArr.rem + "<br>";

        return ret;
    }

    /**
     * item Cate 转换为本地字符串。 itemCate 没有定义，随便什么都行，是个中文类型的字符串。
     * @param cate item cate string
     * @return {string} localized string
     */
    static itemCateToLocStr(cate){
        switch (cate){
            case '帽子':return globalStrings.ITEM_CATE_HAT;
            case '项链':return globalStrings.ITEM_CATE_NECKLACE;
            case '戒指':return globalStrings.ITEM_CATE_RING;
            case '手套':return globalStrings.ITEM_CATE_GLOVES;
            case '剑':return globalStrings.ITEM_CATE_SWORD;
            case '刀':return globalStrings.ITEM_CATE_MACHETE;
            case '枪':return globalStrings.ITEM_CATE_SPEAR;
            case '暗器':return globalStrings.ITEM_CATE_EJECTION;
            case '上衣':return globalStrings.ITEM_CATE_COAT;
            case '裤子':return globalStrings.ITEM_CATE_PLANTS;
            case '鞋子':return globalStrings.ITEM_CATE_SHOES;
            case '任务':return globalStrings.ITEM_CATE_TASK;
            case '医书':return globalStrings.ITEM_CATE_MEDBOOK;
            case '外功秘笈':return globalStrings.ITEM_CATE_OUTER;
            case '内功秘笈':return globalStrings.ITEM_CATE_INNER;
            case '轻功秘笈':return globalStrings.ITEM_CATE_UPPER;
            default: return globalStrings.ITEM_CATE_MISC;
        }
    }

    static getItemStatString(itemObj){
        let s = '';

        s += itemObj.atk > 0 ? globalStrings.ATK+': +'+itemObj.atk+'<br/>' : '';
        s += itemObj.hit > 0 ? globalStrings.HIT+': +'+toPercentString(itemObj.hit)+' <br/>' : '';
        s += itemObj.def > 0 ? globalStrings.DEF+': +'+toPercentString(itemObj.def)+' <br/>' : '';
        s += itemObj.crt > 0 ? globalStrings.CRT+': +'+toPercentString(itemObj.crt)+' <br/>' : '';
        s += itemObj.crm > 0 ? globalStrings.CRM+': +'+toPercentString(itemObj.crm)+' <br/>' : '';
        s += itemObj.hst > 0 ? globalStrings.HST+': +'+toPercentString(itemObj.hst)+' <br/>' : '';
        s += itemObj.dge > 0 ? globalStrings.DGE+': +'+toPercentString(itemObj.dge)+' <br/>' : '';
        s += itemObj.par > 0 ? globalStrings.PAR+': +'+toPercentString(itemObj.par)+' <br/>' : '';
        s += itemObj.fdb > 0 ? globalStrings.FDB+': +'+toPercentString(itemObj.fdb)+' <br/>' : '';
        s += itemObj.fdh > 0 ? globalStrings.FDH+': +'+toPercentString(itemObj.fdh)+' <br/>' : '';
        s += itemObj.ris > 0 ? globalStrings.RIS+': +'+toPercentString(itemObj.ris)+' <br/>' : '';
        s += itemObj.luk > 0 ? globalStrings.LUK+': +'+toPercentString(itemObj.luk)+' <br/>' : '';
        s += itemObj.reg > 0 ? globalStrings.REG+': +'+itemObj.reg+'<br/>' : '';
        s += itemObj.rem > 0 ? globalStrings.REM+': +'+itemObj.rem+'<br/>' : '';

        s += itemObj.fist > 0 ? globalStrings.SKILL_FIST+': +'+itemObj.fist+'<br/>' : '';
        s += itemObj.sword > 0 ? globalStrings.SKILL_SWORD+': +'+itemObj.sword+'<br/>' : '';
        s += itemObj.machete > 0 ? globalStrings.SKILL_MACHETE+': +'+itemObj.machete+'<br/>' : '';
        s += itemObj.spear > 0 ? globalStrings.SKILL_SPEAR+': +'+itemObj.spear+'<br/>' : '';
        s += itemObj.ejection > 0 ? globalStrings.SKILL_EJECTION+': +'+itemObj.ejection+'<br/>' : '';
        s += itemObj.enchant > 0 ? globalStrings.SKILL_ENCHANT+': +'+itemObj.enchant+'<br/>' : '';
        s += itemObj.swift > 0 ? globalStrings.SKILL_SWIFT+': +'+itemObj.swift+'<br/>' : '';
        s += itemObj.heal > 0 ? globalStrings.SKILL_HEAL+': +'+itemObj.heal+'<br/>' : '';

        return s;
    }

    /**
     * 生成 包括物品名 的pop up 详情的说明
     * @param intItemId - int 物品编号
     * @returns {string} html string
     */
    static drawItem(intItemId){
        // 如果不可装备，添加红色mask效果，并且不出现装备按钮
        let itemObj = gDB.getItemById(intItemId);
        if(itemObj == null) return '';
        // let iconStr = ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
        let disableCheck = (ItemModel.isStudyAble(itemObj.itemCate) && (!CharacterModel.isEquipAble(itemObj))) ? "item-disabled" : '';
        let strItem = '<a class="kf-pop-over item-slot-'+ itemObj.itemLevel+' '+disableCheck+'" data-container="body" data-toggle="popover" ' +
        'data-placement="bottom" data-html="true" ' +
        'data-content="'+escString(ItemModel.toString(itemObj,false))+'" ' +
        'data-original-title="" aria-describedby="popover">'+
            //iconStr
            itemObj.itemName
            +'</a>';
        return strItem;
    }

    static getThemColorByTier(tier){
        switch(parseInt(tier)){
            case 0: return 'theme-gray';break;
            case 1: return 'theme-white';break;
            case 2: return 'theme-blue';break;
            case 3: return 'theme-gold';break;
            case 4: return 'theme-purple';break;
            case 5: return 'theme-epic';break;
            case 6: return 'theme-legend';break;
            case 7: return 'theme-marvel';break;
            case 8: return 'theme-suit';break;
            default: return 'theme-gray';break;
        }
    }

    static getItemIcon(itemType,itemId){
        let id = parseInt(itemId);
        if(id>=109 && id<=141){ // gems
            return '<img class="icon" src="./assets/images/item/'+id+'.png"/>';
        }
        if(id>=165 && id<=173){ // 船契
            return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-wd-accent-scroll"></use></svg>';
        }
        if(id>=182 && id<=325){ // 随机武学
            return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-question"></use></svg>';
        }
        switch(id){
            case 1: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-explore"></use></svg>'; // 罗盘
            case 2: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-icon_Horse"></use></svg>';  // 缰绳
            case 3: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon--horse"></use></svg>'; // 千里马
            case 4: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-jian"></use></svg>';    // 大王剑
            case 5: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-dao"></use></svg>';  // 小王刀
            case 6: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-jiezhi"></use></svg>'; // 银戒指
            case 7: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-magicscroll"></use></svg>'; // 古书 风
            case 8: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-magicscroll"></use></svg>';// 古书 尘
            case 9: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-magicscroll"></use></svg>';// 古书 一
            case 10: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-magicscroll"></use></svg>';// 古书 二
            case 11: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-magicscroll"></use></svg>';// 古书 三
            case 12: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-magicscroll"></use></svg>';// 古书 侠
            case 13: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-food-cashew"></use></svg>';// 肉
            case 14: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-tail1"></use></svg>';// 皮
            case 15: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-icon"></use></svg>';// 虎牙
            case 16: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-gutou"></use></svg>';// 虎骨
            case 17: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-lurong"></use></svg>';// 鹿茸
            case 18: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-huixiang"></use></svg>';// 麝香
            case 19: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-maozhao"></use></svg>';// 幸运兔脚
            case 20: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-General-2-09"></use></svg>';// 熊掌
            case 21: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-jinding"></use></svg>';// 金锭
            case 22: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-jinding1"></use></svg>';// 银锭
            case 107: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-food-bread"></use></svg>'; // 食物
            case 164: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-explore3"></use></svg>'; // 推荐状
            case 347: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-shumiao"></use></svg>';    // 药材
            case 348: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-icon-test1"></use></svg>';    // 药品1 花露丸
            case 349: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-food-mochi"></use></svg>';    // 药品2 熊鹿丸
            case 350: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-liangshi"></use></svg>';    // 药品3 地灵丸
            case 351: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-food-pecan"></use></svg>';    // 药品4 小还丹
            case 352: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-food-avocado"></use></svg>';    // 药品5 大还丹
            case 353: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-food-sushi"></use></svg>';    // 药品6 断续膏
            case 354: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-huaping"></use></svg>';    // 药品7 安神集

            default:break;
        }

        switch(itemType){
            //case '任务': return '<i class="iconfont icon-rule4"></i>';
            case '任务': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-rule3"></use></svg>';
            case '杂物': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-hexagon_dashed"></use></svg>';
            case '帽子': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-helmet"></use></svg>';
            case '项链': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-xianglian_"></use></svg>';
            case '手套': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-protective-gloves"></use></svg>';
            case '戒指': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-jiezhi1"></use></svg>';
            case '暗器': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-gongjian1"></use></svg>';
            case '外功秘笈': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-gushu"></use></svg>';
            case '医书': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-gufengwujianzhongguofengzhujian_huaban_huaban_huaban"></use></svg>';
            case '内功秘笈': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-gushu2"></use></svg>';
            case '轻功秘笈': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-gushu1"></use></svg>';
            case '刀': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-dao1"></use></svg>';
            case '剑': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-baojian"></use></svg>';
            case '裤子': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-kuzi1"></use></svg>';
            case '枪': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-spear"></use></svg>';
            case '上衣': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-dayi1"></use></svg>';
            case '鞋子': return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-xuezi3"></use></svg>';
            default: return '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-goldmedal"></use></svg>';
        }
    }

    // 不加到 dbItem 里面
    // dynamicItem 不会在战斗场景掉落，所以texture 放在dbItem里面应该没关系。
    // 不过综合考虑之后，决定还是放在这里用逻辑实现。
    static getItemPhaserTexture(itemType,itemId){
        let id = parseInt(itemId);
        if(id>=109 && id<=141){ // gems
            return 'item_gem_'+id;
        }
        if(id>=165 && id<=173){ // 船契
            return 'item_scroll';
        }
        if(id>=182 && id<=325){ // 随机武学
            return 'item_scroll';
        }
        if(id===107){  return 'item_food';}
        switch(id){
            case 1: return 'item_misc'; // 罗盘
            case 2: return 'item_misc';  // 缰绳
            case 3: return 'item_misc'; // 千里马
            case 4: return 'item_sword';    // 大王剑
            case 5: return 'item_machete';  // 小王刀
            case 6: return 'item_ring'; // 银戒指
            case 7: return 'item_book'; // 古书 风
            case 8: return 'item_book';// 古书 尘
            case 9: return 'item_book';// 古书 一
            case 10: return 'item_book';// 古书 二
            case 11: return 'item_book';// 古书 三
            case 12: return 'item_book';// 古书 侠
            case 13: return 'item_meat';// 肉
            case 14: return 'item_fur';// 皮
            case 15: return 'item_fang';// 虎牙
            case 16: return 'item_bone';// 虎骨
            case 17: return 'item_horn';// 鹿茸
            case 18: return 'item_musk';// 麝香
            case 19: return 'item_rabbit';// 幸运兔脚
            case 20: return 'item_paw';// 熊掌
            case 21: return 'item_gold';// 金锭
            case 22: return 'item_silver';// 银锭
            default:break;
        }

        switch(itemType){
            //case '任务': return '<i class="iconfont icon-rule4"></i>';
            case '任务': return 'item_misc';
            case '杂物': return 'item_misc';
            case '帽子': return 'item_hat';
            case '项链': return 'item_necklace';
            case '手套': return 'item_gloves';
            case '戒指': return 'item_ring';
            case '暗器': return 'item_bow';
            case '外功秘笈': return 'item_book';
            case '医书': return 'item_book';
            case '内功秘笈': return 'item_book';
            case '轻功秘笈': return 'item_book';
            case '刀': return 'item_machete';
            case '剑': return 'item_sword';
            case '裤子': return 'item_pants';
            case '枪': return 'item_spear';
            case '上衣': return 'item_clothes';
            case '鞋子': return 'item_shoes';
            default: return 'item_misc';
        }
    }

    static isEquipAble(cate){
        return cate == '帽子' || cate == '项链' || cate == '戒指' ||
            cate == '手套' || cate == '剑' || cate == '刀' ||
            cate == '枪' || cate == '暗器' || cate == '上衣' ||
            cate == '裤子' || cate == '鞋子';
    }

    /**
     * 判断物品是否为可修习的物品
     * @param cate
     * @returns {boolean}
     */
    static isStudyAble(cate){
        return cate == '医书' || cate == '秘笈' || cate == '轻功秘笈' ||
            cate == '外功秘笈' || cate == '内功秘笈';
    }
    static isKFBook(cate){ return cate === '秘笈' || cate === '轻功秘笈' || cate === '外功秘笈' || cate === '内功秘笈'; }
    static isHealBook(cate){ return cate === '医书'; }
    static isGem(intItemId){ return (intItemId>=109) && (intItemId<=141); }
    static getGemTheme(intItemId){
        if(intItemId>=109 && intItemId<=119) return 'theme-purple';
        if(intItemId>=120 && intItemId<=130) return 'theme-blue';
        if(intItemId>=131 && intItemId<=141) return 'theme-gold';
        return 'theme-gray';
    }
    static getGemString(intItemId){
        let itemObj = gDB.getItemById(intItemId);
        let iStr = ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId);
        let intItemCount = CharacterModel.countItem(intItemId)
        iStr += '<span class="badge">' +intItemCount + '</span>';
        return iStr;
    }
    static getGemStringForceCount(intItemId, intCount){
        let itemObj = gDB.getItemById(intItemId);
        return ItemModel.getItemIcon(itemObj.itemCate, itemObj.itemId) + '<span class="badge">' +intCount + '</span>';
    }
    static getWeaponSkill(cate){
        switch(cate){
            case '手套':return 'fist';
            case '暗器':return 'ejection';
            case '刀':return 'machete';
            case '剑':return 'sword';
            case '枪':return 'spear';
            default:return 'fist';
        }
    }

    /**
     * 根据输入参数，计算对应的卷轴id：注意是没有鉴定的卷轴，另外，输入的是物品等级。如果是领悟的，应该用领悟的宝石等级换算出物品等级。
     * @param intZQId
     * @param intKFType
     * @param intLevel 输入的是物品等级。如果是领悟的，应该用领悟的宝石等级换算出物品等级。
     */
    static getScrollIdByInfo(intZQId,intKFType,intLevel){
        // 183	调和内功秘笈：未鉴定	2
        // 207	调和内功秘笈：未鉴定	3
        // 231	调和内功秘笈：未鉴定	4
        // 255	调和内功秘笈：未鉴定	5
        // 279	调和内功秘笈：未鉴定	6
        // 303	调和内功秘笈：未鉴定	7
        // intZQRow 1=阴柔 2=调和 3=阳刚
        // intKFCol 1=内功 2=外功 3=轻功
        let str1 = '';
        if(intZQId === 1) str1 = globalStrings.SCROLL_NAME_YIN;
        if(intZQId === 2) str1 = globalStrings.SCROLL_NAME_HE;
        if(intZQId === 3) str1 = globalStrings.SCROLL_NAME_YANG;
        if(str1==='') return -1;

        let str2 = '';
        if(intKFType === 1) str2 = globalStrings.SCROLL_NAME_NG;
        if(intKFType === 2) str2 = globalStrings.SCROLL_NAME_WG;
        if(intKFType === 21) str2 = globalStrings.SCROLL_NAME_QZ;
        if(intKFType === 22) str2 = globalStrings.SCROLL_NAME_JF;
        if(intKFType === 23) str2 = globalStrings.SCROLL_NAME_DF;
        if(intKFType === 24) str2 = globalStrings.SCROLL_NAME_CB;
        if(intKFType === 25) str2 = globalStrings.SCROLL_NAME_AQ;
        if(intKFType === 3) str2 = globalStrings.SCROLL_NAME_QG;
        if(str2==='') return -1;

        let strName = str1+str2+globalStrings.SCROLL_NAME_LEFT;
        let scroll = gDB.getItemByNameAndLevel(strName,intLevel);
        return parseInt(scroll.itemId);
    }
}



