const GlobalConfig = {
    DEV_CONSOLE : false, // 是否启用console
    TAP_DEVICE : false,  // 是否启用移动设备虚拟按键
    GAME_VERSION : 1.2, // 游戏版本
    BUILD_VERSION : 240515,    // Build版本，用于记录和处理存档/备份相关逻辑，跟随dump信息一起。
    EXP_NEWBIE : 2500000,
    SAVE_SLOT_ENU_START : 1000, // 英文游戏存档开始位置
    SAVE_SLOT_CN_START : 0, // 中文游戏存档开始位置

    EXP_BONUS_WD : 1.2, // 王大的经验奖励倍数
    FLOAT_MIN : 0.00001,
    RATE_MULTI : 100000,        // 用于放大概率 = 1 / FLOAT_MIN
    MERCHANT_PROFIT : 0.5,     // 商人的利润率，物品售价 =  原价 * (1- 利润率)

    HERB_RATIO : 0.01,   // 草变为药草的概率 0.01 是不错的选择
    HERB_GRASS_ID : 355, // 草的ID tile ID
    HERB_ID : 382,  // 草药的ID, tile ID
    ITEM_HERB_ID: 347, // 草药 物品 ID
    ITEM_MED_MAX_ID : 354,   // 顶级药品编号 [ITEM_HERB_ID, ITEM_MEDMAX_ID] 认为是药物

    ELECTRON_TAP_RADIUS_RATE : 0.36,    // windows mac 按键移动的半径 / 屏幕尺寸
    MOBILE_TAP_RADIUS_RATE : 0.13,      // 手机端 按键移动的半径 / 屏幕尺寸

    HORSE_TRAVEL_FEE : 2000,    // 驿站传送服务单位收费

    // 每一点属性出售时候折算的价格
    STATE_PRICE:1,
    STATE_PRICE_PC:2, STATE_PRICE_AP:3, STATE_PRICE_DF:3, STATE_PRICE_CR:2, STATE_PRICE_CM:2,
    STATE_PRICE_HL:2, STATE_PRICE_DG:2, STATE_PRICE_PY:2, STATE_PRICE_TH:3, STATE_PRICE_DH:5,
    STATE_PRICE_PR:2, STATE_PRICE_MF:4, STATE_PRICE_HR:5, STATE_PRICE_MR:5,
    STATE_PAR_MAX: 0.81,
    STATE_DEF_MAX: 0.81,
    STATE_DGE_MAX: 0.81,
    STATE_HIT_MAX: 1.00,
    STATE_CRT_MAX: 1.00,
    STATE_RIS_MAX: 1.00,

    STATE_DEF_MAX_MOB : 810,    // 千分之
    STATE_PAR_MAX_MOB : 81,     // 百分之
    STATE_DGE_MAX_MOB : 81,     // 百分之

    NG_LVL_HP : 200,
    NG_LVL_MP : 300,
    MOB_ATTACK_CD : 3.0,
    SKILL_MAX : 100,

    EXP_KF_WIS_DIVIDER : 400,   // origin=600, try to change so can learn quicker - 20230718
    EXP_KF_PERCENT_MAX : 0.4,

    SWIFT_TREE : 40,
    SWIFT_HILL : 70,
    SWIFT_WATER: 100,

    // INT_DEFAULT_MOB_DEBUFF_HIT_RATE : 18.0,   // 怪物debuff 默认命中概率 * 100
    INT_DEFAULT_MOB_DEBUFF_HIT_RATE : 18.0,   // 怪物debuff 默认命中概率 * 100

    ZONE_ID_COW : 82,   // 秘境
    ZONE_ID_ARENA: 109, // 武道会 - BOSS单刷
    ZONE_ID_ASHRAM : 112,    // 道场
    ZONE_ID_ENDLESS : 113,  // 无尽
    ZONE_ID_FIELD : 115,    // 比武场

    ZONE_ID_ASHRAM_100 : 999,   // 百人道场 - 道场解锁后

    ITEM_ID_TJZ: 164,   // 推荐状

    // boss mob_template_id array
    MOB_TEMPLATE_BOSS : [102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,119,120,121,122,123,124,125,126,127,131,132,133,134,135,136,137,144,165,166],
    MOB_TEMPLATE_UNDEAD : [145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,165,166],


    QUICK_BATTLE_INTERVAL : 100,  // 快速战斗刷新间隔 毫秒
    QUICK_BATTLE_DURATION : 120000,  // 快速战斗总时长 毫秒
    COMBAT_LOG_MAX : 500,       // 快速战斗日志最大条数
    GAMBLING_CITY_DEV_LEVEL_1 : 1500,
    GAMBLING_CITY_DEV_LEVEL_2 : 3000,
    GAMBLING_CITY_DEV_LEVEL_3 : 5000,

    //  Gray : 1, White : 2, Blue : 3, Gold:4, Purple : 5, Epic :6 , Green : 9
    TEXT_COLOR_GRAY :   "gray",
    TEXT_COLOR_WHITE:   "white",
    TEXT_COLOR_BLUE:    "blue",
    TEXT_COLOR_GOLD:    "gold",
    TEXT_COLOR_PURPLE:  "purple",
    TEXT_COLOR_EPIC:    "pink",
    TEXT_COLOR_GREEN:   "green",

    // mob move speed in Dynamic Scene
    MOVE_SPEED_DEFAULT : 160,
    MOVE_SPEED_10 : 100,
    MOVE_SPEED_20 : 120,
    MOVE_SPEED_30 : 140,

    // 包子掉落概率
    DROP_RATE_BAOZI : 0.2,

    // default random seed
    DEFAULT_RANDOM_SEED : "game_seed=Wind and Dust",

    // 武功词缀数组
    // NG_PRE + NG_KEYWORD + NG_SUF  => 龙 风 宝典
    NG_PRE_ARR : init_ng_pre_arr(),
    NG_SUF_ARR : init_ng_suf_arr(),
    // WG_PRE + WG_SUF + WG_KEYWORD   => 幽冥 鬼 爪
    WG_PRE_ARR : init_wg_pre_arr(),
    WG_SUF_ARR : init_wg_suf_arr(),
    WG_KEY_ARR : init_wg_key_arr(),
    // QG PRE + SUF + KEY
    QG_PRE_ARR : init_qg_pre_arr(),
    QG_SUF_ARR : init_qg_suf_arr(),
    QG_KEY_ARR : init_qg_key_arr(),

/** 内置物品定义
 * 价格基于 100g 人民币价格 估算
 */

    // 精英怪物 - not used
    EliteTitleArr : [
        "洞察", "慧眼", "神行", "百变", "如林", "如山", "解毒", "岐黄", "铁卫", "近卫",
        "伏兵","替身","斗转","星移","威压","驱逐","霸王","顶天","昂扬","强壮",
        "孔武","拔山","剧毒","狮吼"
    ],

    // 精华宝石价格 300     900     2700    8100    24300   72900   218700  656100  1968300 5904900     1771,4700

    GEM_PRICE_1 : 300,GEM_PRICE_2 : 900,GEM_PRICE_3 : 2700,GEM_PRICE_4 : 8100,GEM_PRICE_5 : 24300,
    GEM_PRICE_6 : 72900,GEM_PRICE_7 : 218700,GEM_PRICE_8 : 656100,GEM_PRICE_9 : 1968300,GEM_PRICE_10 : 5904900,
    GEM_PRICE_11 : 17714700,

};


    // 掉落 rate 为小数，理论上不大于1，最小为0
    // @return  CDSDropItem[]
    // GlobalConfig.animalDropModel = [
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc1,0.618),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc2,0.382),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc7,0.005)
    // ];
    // GlobalConfig.tigerDropModel = [
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc3,0.162),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc4,0.088)
    // ];
    //     GlobalConfig.tigerDropRichModel = [
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc3,0.618),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc4,0.382)
    // ];
    // GlobalConfig.deerDropModel = [
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc5,0.162),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc6,0.088)
    // ];
    // GlobalConfig.bearDropModel = [
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc8,0.162)
    // ];
    // GlobalConfig.tigerTotalModel =   GlobalConfig.animalDropModel.concat(GlobalConfig.tigerDropModel);
    // GlobalConfig.tigerTotalRModel =  GlobalConfig.animalDropModel.concat(GlobalConfig.tigerDropRichModel);
    // GlobalConfig.bearTotalModel =    GlobalConfig.animalDropModel.concat(GlobalConfig.bearDropModel);
    // GlobalConfig.deerTotalModel =    GlobalConfig.animalDropModel.concat(GlobalConfig.deerDropModel);
    //
    // GlobalConfig.humanDropGrayModel = [
    //     CDSDropItem._initFromTierAndRate(CDEItemTier.Gray,0.186)
    // ];
    // GlobalConfig.humanDropWhiteModel = [
    //     CDSDropItem._initFromTierAndRate(CDEItemTier.White,0.186)
    // ];
    // GlobalConfig.humanDropBlueModel = [
    //     CDSDropItem._initFromTierAndRate(CDEItemTier.Blue,0.186),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc10,0.08)
    // ];
    // GlobalConfig.humanDropGoldModel = [
    //     CDSDropItem._initFromTierAndRate(CDEItemTier.Gold,0.186),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc10,0.168),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc9,0.08)
    // ];
    // GlobalConfig.humanDropPurpleModel = [
    //     CDSDropItem._initFromTierAndRate(CDEItemTier.Purple,0.186),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc9,0.168)
    // ];
    // GlobalConfig.humanDropEpicModel = [
    //     CDSDropItem._initFromTierAndRate(CDEItemTier.Epic,0.186),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc9,0.382)
    // ];
    // GlobalConfig.humanDropEpicRModel = [
    //     CDSDropItem._initFromTierAndRate(CDEItemTier.Epic,0.886),
    //     CDSDropItem._initFromItemAndRate(GlobalConfig.itemMisc9,0.982)
    // ];
    //
    //
    // // 怪物
    // GlobalConfig.mobRabbitW = new CDSMobModel(CDEMobType.Rabit, GlobalDict.MOB_NAME_RABBITW,1,GlobalConfig.animalDropModel);
    // GlobalConfig.mobRabbitB = new CDSMobModel(CDEMobType.Rabit, GlobalDict.MOB_NAME_RABBITB, 2, GlobalConfig.animalDropModel);
    // GlobalConfig.mobRabbitG = new CDSMobModel(CDEMobType.Rabit, GlobalDict.MOB_NAME_RABBITG, 3, GlobalConfig.animalDropModel);
    //
    // GlobalConfig.mobTiger = new CDSMobModel(CDEMobType.Tiger, GlobalDict.MOB_NAME_TIGER, 11, GlobalConfig.tigerTotalModel);
    // GlobalConfig.mobTigerKid = new CDSMobModel(CDEMobType.Tiger, GlobalDict.MOB_NAME_TIGERKID, 6, GlobalConfig.tigerDropModel);
    // GlobalConfig.mobTigerElder = new CDSMobModel(CDEMobType.Tiger, GlobalDict.MOB_NAME_TIGERELDER, 15, GlobalConfig.tigerTotalRModel);
    // GlobalConfig.mobTigerKing = new CDSMobModel(CDEMobType.Tiger, GlobalDict.MOB_NAME_TIGERKING, 18, GlobalConfig.tigerTotalRModel);
    //
    // GlobalConfig.mobBearW = new CDSMobModel(CDEMobType.Bear, GlobalDict.MOB_NAME_BEARW, 7, GlobalConfig.bearTotalModel);
    // GlobalConfig.mobBearB = new CDSMobModel(CDEMobType.Bear, GlobalDict.MOB_NAME_BEARB, 8, GlobalConfig.bearTotalModel);
    // GlobalConfig.mobBearG = new CDSMobModel(CDEMobType.Bear, GlobalDict.MOB_NAME_BEARG, 9, GlobalConfig.bearTotalModel);
    //
    // GlobalConfig.mobDeerW = new CDSMobModel(CDEMobType.Deer, GlobalDict.MOB_NAME_DEERW, 5, GlobalConfig.bearTotalModel);
    // GlobalConfig.mobDeerB = new CDSMobModel(CDEMobType.Deer, GlobalDict.MOB_NAME_DEERB, 4, GlobalConfig.bearTotalModel);
    // GlobalConfig.mobDeerG = new CDSMobModel(CDEMobType.Deer, GlobalDict.MOB_NAME_DEERG, 6, GlobalConfig.bearTotalModel);
    //
    // GlobalConfig.mobBandit1 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT1, 9, GlobalConfig.humanDropGrayModel);
    // GlobalConfig.mobBandit2 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT2, 10, GlobalConfig.humanDropGrayModel);
    // GlobalConfig.mobBandit3 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT3, 13, GlobalConfig.humanDropGrayModel);
    // GlobalConfig.mobBandit4 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT4, 15, GlobalConfig.humanDropWhiteModel);
    // GlobalConfig.mobBandit5 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT5, 17, GlobalConfig.humanDropBlueModel);
    // GlobalConfig.mobBandit6 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT6, 20, GlobalConfig.humanDropBlueModel);
    // GlobalConfig.mobBandit7 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT7, 25, GlobalConfig.humanDropGoldModel);
    // GlobalConfig.mobBandit8 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT8, 33, GlobalConfig.humanDropGoldModel);
    // GlobalConfig.mobBandit9 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT9, 40, GlobalConfig.humanDropEpicModel);
    // GlobalConfig.mobBandit10 = new CDSMobModel(CDEMobType.Bandit, GlobalDict.MOB_NAME_BANDIT10, 50, GlobalConfig.humanDropEpicRModel);
    //

function init_ng_pre_arr(){
    return [
        globalStrings.NG_PRE_ARR_0,globalStrings.NG_PRE_ARR_1,globalStrings.NG_PRE_ARR_2,globalStrings.NG_PRE_ARR_3,globalStrings.NG_PRE_ARR_4,globalStrings.NG_PRE_ARR_5,globalStrings.NG_PRE_ARR_6,globalStrings.NG_PRE_ARR_7,globalStrings.NG_PRE_ARR_8,globalStrings.NG_PRE_ARR_9,
        globalStrings.NG_PRE_ARR_10,globalStrings.NG_PRE_ARR_11,globalStrings.NG_PRE_ARR_12,globalStrings.NG_PRE_ARR_13,globalStrings.NG_PRE_ARR_14,globalStrings.NG_PRE_ARR_15,globalStrings.NG_PRE_ARR_16,globalStrings.NG_PRE_ARR_17,globalStrings.NG_PRE_ARR_18,globalStrings.NG_PRE_ARR_19,
        globalStrings.NG_PRE_ARR_20,globalStrings.NG_PRE_ARR_21,globalStrings.NG_PRE_ARR_22,globalStrings.NG_PRE_ARR_23,globalStrings.NG_PRE_ARR_24,globalStrings.NG_PRE_ARR_25,globalStrings.NG_PRE_ARR_26,globalStrings.NG_PRE_ARR_27,globalStrings.NG_PRE_ARR_28,globalStrings.NG_PRE_ARR_29,
        globalStrings.NG_PRE_ARR_30,globalStrings.NG_PRE_ARR_31,globalStrings.NG_PRE_ARR_32,globalStrings.NG_PRE_ARR_33,globalStrings.NG_PRE_ARR_34,globalStrings.NG_PRE_ARR_35,globalStrings.NG_PRE_ARR_36,globalStrings.NG_PRE_ARR_37,globalStrings.NG_PRE_ARR_38,globalStrings.NG_PRE_ARR_39,
        globalStrings.NG_PRE_ARR_40,globalStrings.NG_PRE_ARR_41,globalStrings.NG_PRE_ARR_42,globalStrings.NG_PRE_ARR_43,globalStrings.NG_PRE_ARR_44,globalStrings.NG_PRE_ARR_45,globalStrings.NG_PRE_ARR_46,globalStrings.NG_PRE_ARR_47,globalStrings.NG_PRE_ARR_48,globalStrings.NG_PRE_ARR_49,
        globalStrings.NG_PRE_ARR_50,globalStrings.NG_PRE_ARR_51,globalStrings.NG_PRE_ARR_52,globalStrings.NG_PRE_ARR_53,globalStrings.NG_PRE_ARR_54,globalStrings.NG_PRE_ARR_55,globalStrings.NG_PRE_ARR_56,globalStrings.NG_PRE_ARR_57,globalStrings.NG_PRE_ARR_58,globalStrings.NG_PRE_ARR_59,
        globalStrings.NG_PRE_ARR_60,globalStrings.NG_PRE_ARR_61,globalStrings.NG_PRE_ARR_62,globalStrings.NG_PRE_ARR_63,globalStrings.NG_PRE_ARR_64,globalStrings.NG_PRE_ARR_65,globalStrings.NG_PRE_ARR_66,globalStrings.NG_PRE_ARR_67,globalStrings.NG_PRE_ARR_68,globalStrings.NG_PRE_ARR_69,
    ];
}
function init_ng_suf_arr(){
    return [ globalStrings.NG_SUF_ARR_0,globalStrings.NG_SUF_ARR_1,globalStrings.NG_SUF_ARR_2,globalStrings.NG_SUF_ARR_3,globalStrings.NG_SUF_ARR_4,globalStrings.NG_SUF_ARR_5,globalStrings.NG_SUF_ARR_6,globalStrings.NG_SUF_ARR_7];
}
function init_wg_pre_arr(){
    return [
        globalStrings.WPA_0,globalStrings.WPA_1,globalStrings.WPA_2,globalStrings.WPA_3,globalStrings.WPA_4,globalStrings.WPA_5,globalStrings.WPA_6,globalStrings.WPA_7,globalStrings.WPA_8,globalStrings.WPA_9,
        globalStrings.WPA_10,globalStrings.WPA_11,globalStrings.WPA_12,globalStrings.WPA_13,globalStrings.WPA_14,globalStrings.WPA_15,globalStrings.WPA_16,globalStrings.WPA_17,globalStrings.WPA_18,globalStrings.WPA_19,
        globalStrings.WPA_20,globalStrings.WPA_21,globalStrings.WPA_22,globalStrings.WPA_23,globalStrings.WPA_24,globalStrings.WPA_25,globalStrings.WPA_26,globalStrings.WPA_27,globalStrings.WPA_28,globalStrings.WPA_29,
        globalStrings.WPA_30,globalStrings.WPA_31,globalStrings.WPA_32,globalStrings.WPA_33,globalStrings.WPA_34,globalStrings.WPA_35,globalStrings.WPA_36,globalStrings.WPA_37,globalStrings.WPA_38,globalStrings.WPA_39,
        globalStrings.WPA_40,globalStrings.WPA_41,globalStrings.WPA_42,globalStrings.WPA_43,globalStrings.WPA_44,globalStrings.WPA_45,globalStrings.WPA_46,globalStrings.WPA_47,globalStrings.WPA_48,globalStrings.WPA_49,
        globalStrings.WPA_50,globalStrings.WPA_51,globalStrings.WPA_52,globalStrings.WPA_53,globalStrings.WPA_54,globalStrings.WPA_55,globalStrings.WPA_56,globalStrings.WPA_57,globalStrings.WPA_58,globalStrings.WPA_59,
        globalStrings.WPA_60,globalStrings.WPA_61,globalStrings.WPA_62,globalStrings.WPA_63,globalStrings.WPA_64,globalStrings.WPA_65,globalStrings.WPA_66,globalStrings.WPA_67,globalStrings.WPA_68,globalStrings.WPA_69,
        globalStrings.WPA_70,globalStrings.WPA_71,globalStrings.WPA_72,globalStrings.WPA_73,globalStrings.WPA_74,globalStrings.WPA_75,globalStrings.WPA_76,globalStrings.WPA_77,globalStrings.WPA_78,globalStrings.WPA_79,
    ];
}
function init_wg_suf_arr(){
    return [
        globalStrings.WSA_0,globalStrings.WSA_1,globalStrings.WSA_2,globalStrings.WSA_3,globalStrings.WSA_4,globalStrings.WSA_5,globalStrings.WSA_6,globalStrings.WSA_7,globalStrings.WSA_8,globalStrings.WSA_9,
        globalStrings.WSA_10,globalStrings.WSA_11,globalStrings.WSA_12,globalStrings.WSA_13,globalStrings.WSA_14,globalStrings.WSA_15,globalStrings.WSA_16,globalStrings.WSA_17,globalStrings.WSA_18,globalStrings.WSA_19,
        globalStrings.WSA_20,globalStrings.WSA_21,globalStrings.WSA_22,globalStrings.WSA_23,globalStrings.WSA_24,globalStrings.WSA_25,globalStrings.WSA_26,globalStrings.WSA_27,globalStrings.WSA_28,globalStrings.WSA_29,
        globalStrings.WSA_30,globalStrings.WSA_31,globalStrings.WSA_32,globalStrings.WSA_33,globalStrings.WSA_34,globalStrings.WSA_35,globalStrings.WSA_36,globalStrings.WSA_37,globalStrings.WSA_38,globalStrings.WSA_39,
        "","","","","","","","","",""
    ];
}
function init_wg_key_arr(){
    return [
        [globalStrings.WKA_0_0, globalStrings.WKA_0_1, globalStrings.WKA_0_2, globalStrings.WKA_0_3, globalStrings.WKA_0_4, globalStrings.WKA_0_5, globalStrings.WKA_0_6, globalStrings.WKA_0_7, globalStrings.WKA_0_8,],
        [globalStrings.WKA_1_0,globalStrings.WKA_1_1,globalStrings.WKA_1_2,globalStrings.WKA_1_3,globalStrings.WKA_1_4,globalStrings.WKA_1_5,globalStrings.WKA_1_6,globalStrings.WKA_1_7,globalStrings.WKA_1_8],
        [globalStrings.WKA_2_0,globalStrings.WKA_2_1,globalStrings.WKA_2_2,globalStrings.WKA_2_3,globalStrings.WKA_2_4,globalStrings.WKA_2_5,globalStrings.WKA_2_6,globalStrings.WKA_2_7,globalStrings.WKA_2_8],
        [globalStrings.WKA_3_0,globalStrings.WKA_3_1,globalStrings.WKA_3_2,globalStrings.WKA_3_3,globalStrings.WKA_3_4,globalStrings.WKA_3_5,globalStrings.WKA_3_6,globalStrings.WKA_3_7,globalStrings.WKA_3_8],
        [globalStrings.WKA_4_0,globalStrings.WKA_4_1,globalStrings.WKA_4_2,globalStrings.WKA_4_3,globalStrings.WKA_4_4,globalStrings.WKA_4_5,globalStrings.WKA_4_6,globalStrings.WKA_4_7,globalStrings.WKA_4_8]
    ];
}
function init_qg_pre_arr(){
    return [ globalStrings.QPA_0,globalStrings.QPA_1,globalStrings.QPA_2,globalStrings.QPA_3,globalStrings.QPA_4,globalStrings.QPA_5,globalStrings.QPA_6,globalStrings.QPA_7,globalStrings.QPA_8,globalStrings.QPA_9,globalStrings.QPA_10,globalStrings.QPA_11,globalStrings.QPA_12,globalStrings.QPA_13];
}
function init_qg_suf_arr(){
    return [ globalStrings.QSA_0, globalStrings.QSA_1, "", globalStrings.QSA_2, globalStrings.QSA_3, "", "", "",globalStrings.QSA_4,globalStrings.QSA_5,globalStrings.QSA_6,globalStrings.QSA_7,globalStrings.QSA_8 ];
}
function init_qg_key_arr(){
    return [ globalStrings.QKA_0,globalStrings.QKA_1,globalStrings.QKA_2,globalStrings.QKA_3,globalStrings.QKA_4,globalStrings.QKA_5,globalStrings.QKA_6,globalStrings.QKA_7,globalStrings.QKA_8,globalStrings.QKA_9];
}