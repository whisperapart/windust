// 20240410 : 添加国际化和本地化支持

let globalStrings = globalStringCn; // 起作用的 字符串字典

// 添加切换语言的逻辑，主要就是改 globalStrings 的值
function setLocale(strLocale){
    let loc = strLocale;
    switch (strLocale){
        case 'cn':
            globalStrings = globalStringCn;
            loc = 'cn';
            $("#btnLocaleRadioCn").prop("checked","checked");
            $("#btnLocaleRadioEn").prop("checked",undefined);
            $(".menu_logo_class").css('background-image','url(assets/images/main/logo_cn.png)').addClass('animated zoomIn');
            setTimeout(function () {$(".menu_logo_class").removeClass('animated zoomIn');},300);
            break;
        case 'en':
            globalStrings = globalStringEn;
            loc = 'en';
            $("#btnLocaleRadioCn").prop("checked",undefined);
            $("#btnLocaleRadioEn").prop("checked","checked");
            $(".menu_logo_class").css('background-image','url(assets/images/main/logo_en.png)').addClass('animated zoomIn');
            setTimeout(function () {$(".menu_logo_class").removeClass('animated zoomIn');},300);
            break;
        default:
            globalStrings = globalStringCn;
            loc = 'cn';
            $("#btnLocaleRadioCn").prop("checked","checked");
            $("#btnLocaleRadioEn").prop("checked",undefined);
            $(".menu_logo_class").css('background-image','url(assets/images/main/logo_cn.png)').addClass('animated zoomIn');
            setTimeout(function () {$(".menu_logo_class").removeClass('animated zoomIn');},300);
            break;
    }
    if(gApp && gApp.gameSettingObj){
        gApp.gameSettingObj.locale = loc;
    }
    localization();
    localforage.setItem('settings_locale',loc).then(function (v){
        console.log("game locale set to = " + loc);
        if(gApp && gApp.gameSettingObj){
            gApp.gameSettingObj.locale = loc;
        }
    });
}

function getLocale(){
    localforage.getItem('settings_locale').then(function (v) {
        gApp.gameSettingObj.locale = v ? v : 'cn';   // default cn
        console.log('game locale load = '+gApp.gameSettingObj.locale);
        setLocale(gApp.gameSettingObj.locale);
    });
}

function localization(){
    $("[data-i18n]").each(function () {
        let key = $(this).data("i18n");
        // 如果本地化没有，默认使用中文字符串
        let value = globalStrings.hasOwnProperty(key) ? globalStrings[key] : globalStringCn[key];
        $(this).html(value);
        if(key === 'DIFF_HARD_ERR_FIX'){
            console.log("switch id= "+ $(this).attr('id')+", loc of globalStrings.DIFFICULTY_HARD = " + value);
        }
    });
    GlobalConfig.NG_PRE_ARR = init_ng_pre_arr();
    GlobalConfig.NG_SUF_ARR = init_ng_suf_arr();
    GlobalConfig.WG_PRE_ARR = init_wg_pre_arr();
    GlobalConfig.WG_SUF_ARR = init_wg_suf_arr();
    GlobalConfig.WG_KEY_ARR = init_wg_key_arr();
    GlobalConfig.QG_PRE_ARR = init_qg_pre_arr();
    GlobalConfig.QG_SUF_ARR = init_qg_suf_arr();
    GlobalConfig.QG_KEY_ARR = init_qg_key_arr();

    dbTips = init_db_tips();
    dbPoem = init_db_poem();
    dbNPC = init_db_npc();
    dtZone = init_dt_zone();
    dbCityAction = init_db_city_action();
    dbCityBuilding = init_db_city_building();
    dtCityCargo = init_dt_city_cargo();
    dbCityCargo = deepClone(dtCityCargo);
    dbCityCmd = init_db_city_cmd();
    dbCityItem = init_db_city_item();
    dbHill = init_db_hill();
    dbItemStatic = init_db_item_static();
    dbKFTier = init_db_kf_tier();
    dtWgE = init_dt_wge();
    dtZq = init_dt_zq();
    dtDbf = init_dt_dbf();
    dtQg = init_dt_qg();
    dbZl = init_db_zl();
    dbKFStatic = init_db_kf_static();
    dbMob = init_db_mob();
    dbMobsInZone = init_db_mobs_in_zone();
    dbMobSkills = init_db_mob_skills();
    NeiLiType = init_neili_type();
    dtPlayer = init_dt_player();
    dbShip = init_db_ship();
    dbTask = init_db_task();
}

/**
 *
 * @param db - e.g. dbCityAction - 这里是对象实例
 * @param dbShortName - e.g. "dbCityAction" - 这里是名称，避免使用反射麻烦，用于globalString 里面 的 key
 * @param arr_keyNames -e.g. ["actName",'actDescription']
 * @param indexName - e.g. "actId"
 */
function loc_db(db,dbShortName,arr_keyNames,indexName){
    // 获取 dbCityAction[n]['actName']
    // 在现有的 globalStringCn 查找key对应的value dbCityAction[n]['actName']
        // 如果已经存在，就用 globalStringCn里面的 key 代替
        // 如果不存在，就用插入到 globalStringCn: upper(dbName)_upper(keyName)_dbCityAction[n]['indexName']
        // 并且用上文的字符串，替换 dbName中 对应的 keyName 值： dbCityAction[n]['actName'] = globalStrings.upper(dbName)_upper(keyName)_dbCityAction[n]['indexName']

    let newObj = {};
    // let idx = (indexName+'').replaceAll("-","_");
    let index_mode = indexName === '' ? 'autoIncrease' : 'string';
    let idx = '';
    if(index_mode === 'string'){
        idx = isNaN(indexName) ? indexName.replaceAll("-","_") : indexName.toString();
    }else{
        idx = 1;
    }

    // let idx = 0;
    for(let i=0;i<db.length;i++){
        for(let j=0;j<arr_keyNames.length;j++){
            let keyName = arr_keyNames[j];
            let unloc_str = db[i][keyName];
            if(unloc_str === "") continue;
            let unloc_key = get_loc_str_key(unloc_str);
            if(unloc_key === null){
                if(index_mode === 'string'){
                    unloc_key = dbShortName + "_" + keyName + "_" + db[i][idx];
                }else{
                    unloc_key = dbShortName + "_" + keyName + "_" + idx;
                    idx++;
                }

                // idx++;
                unloc_key = unloc_key.toUpperCase();
                // let loc_obj = {unloc_key:unloc_str}
                // globalStringCn.push(loc_obj);
                globalStringCn[unloc_key] = unloc_str;
                newObj[unloc_key] = unloc_str;
            }
            db[i][keyName] = "globalStrings." + unloc_key;
        }
    }
    console.log(db);
    console.log(globalStringCn);
    console.log("======以下复制[ "+dbShortName+" ]=====");
    console.log(JSON.stringify(db));
    console.log("======以下添加[ globalStringCn ]=====");
    console.log(newObj);

}

/**
 * 获取 globalStringCn 中 unloc_str 对应的key，如果没有匹配，返回null
 * @param unloc_str
 */
function get_loc_str_key(unloc_str){
    for (let key of Object.keys(globalStringCn)){
        if(globalStrings[key] === unloc_str){
            return key;
        }
    }
    return null;
}