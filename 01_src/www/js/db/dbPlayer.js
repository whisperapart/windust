/**
 * Created by jim on 2020/4/2.
 */

let NeiLiType = init_neili_type();
function init_neili_type(){
    return { Yin:globalStrings.KF_INNER_TYPE_YIN, Yang:globalStrings.KF_INNER_TYPE_YANG, He:globalStrings.KF_INNER_TYPE_HE};
}

let dtPlayer = init_dt_player();
function init_dt_player(){
    return [
        {
            name : globalStrings.NAME_0,
            avatarId : 70,
            level : 1,
            paraLevel : 0,
            curExp : 14,
            nextExp : 28,
            travelDistance : 0,
            curHP : 30,
            maxHP : 30,
            curMP : 20,
            maxMP : 20,
            food : 100,
            money : 100,
            statPoint : 1,
            gcd : 1.5,
            tickInterval : 5.0,
            tickTimer: 0,

            // 1st stat
            strength : 120,        // 力道
            wisdom : 80,          // 悟性
            neili : NeiLiType.Yang,
            // 2nd stat
            baseState : BaseStateModel.initFromStrWis(120,80),
            totalState : BaseStateModel.initFromStrWis(120,80),
            // skill
            baseSkill : {'fist':15,'sword':0,'machete':20,'spear':10,'ejection':0,'heal':5,'enchant':5,'swift':10},
            equipSkill : {'fist':0,'sword':0,'machete':0,'spear':0,'ejection':0,'heal':0,'enchant':0,'swift':0},
            totalSkill : {'fist':15,'sword':0,'machete':20,'spear':10,'ejection':0,'heal':5,'enchant':5,'swift':10},

            eqList : [0,0,0,0,0,0,0,0], // idx 7 = 331
            learningKFId: -1,
            learningCurExp : -1,
            learningNextExp : -1,

            // kongfu
            wgList : [{kfId:14,kfLevel: 1},{kfId:28,kfLevel:1},{},{}],
            ngList : [{kfId:22,kfLevel: 1},{},{},{}],
            qgList : [{kfId:29,kfLevel:1},{}],
            // dbfList : [],   // dbfList = dbfClass Obj array
            dbfObj: {hst:{duration:0,value:0.2},spd:{duration:0,value:0.2},stun:{duration:0},blind:{duration:0},dot:{duration:0,value:0}},
            zlKfId : -1,
            zlMedId : -1,
            cdList : [{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false}],
            gcdObj : {cur:0,max:0,ready:false},

            // actived kongfu
            wgaId : -1,  // wgList index     = 0,1,2,3,-1
            ngaId : -1,  // ngList index    = 0,1,2,3,-1
            qgaId : 0,  // qgList index    = 0.1,-1

            // cached kongfu object - for performance
            wgObj:{},
            ngObj:{},
            qgObj:{},

            // inventory - items
            // max 64 ?
            inventory : [{id:5,count:1},{id:174,count:1},{id:175,count:1},{id:84,count:1},
                {id:107,count:20},
                {id:331,count:1},{id:335,count:1},{id:337,count:1},{id:338,count:1},{id:342,count:1}
            ],

            horseId : 0,  // itemId 2 - 3
            shipId : 1,   // shipId 1 - 9
            shipFitSpeed : 0,   // 0,1 2 3
            shipFitCargo : 0,   // 0,1 2 3
            shipPortId: 25,  // 船只停靠港口 - 默认在平原
            shipSupply: 30, // 船只供给数量
            zoneId:0,

            cargoArr:[],    // [{cargoId:0,count:0,cost:0}]

            moveOn: 'foot', // foot horse ship
            moveOnSpeed: 100,
            worldPosX: 418 * 40 + 20,
            worldPosY: 288 * 40 + 20,
            shipPosX: 0,
            shipPosY: 0,
            // task
            taskFlag : [], // taskId - completed
            taskActive: [459,460,461,1],  // taskId - accepted
            killList : [],      //[{taskId:0,mobId:0,zoneId:0,count:0,max:10}], 记录任务中需要击杀的怪物信息
            poemList : [],      // [{poemId:0,count:0,max:0}] , 记录 诗词魔方游戏完成的次数
            chestList : [],     // 已经开过的箱子列表，cityId 102=龙城遗物
            // game-play-related flag
            flagUnlock: true,   // 角色是否解锁可用 unlockCode = 0，1，2
            flagPara: false,    // 巅峰 - 可获得巅峰经验 unlockCode = 3
            flagCow: false,     // 秘境 - 可进入奶牛关 unlockCode = 4
            flagArena: false,   // 竞技场 - 可进行单挑 -- 未使用？ unlockCode = 5  游戏是否通关
            flagEndless : false,    // 无尽 - 随机 mob 掉落物品 unlockCode = 6
            flagAshram: false,  // 道场 - 百人 等级 1- 100 掉落物品 unlockCode = 7
            flagJNC : false, // 剑南春 - 是否可以购买剑南春 unlockCode = 8
            // flagGameClear: false, //
            tint: 0xFFD700,

            // dead or alive
            isAlive : true,

            // 头像
            avatar:70,
            themeColor: 'gold',
            comboCount:0,
            visitedCity : [27]
        },
        {
            name : globalStrings.NAME_1,
            avatarId : 71,
            level : 1,
            paraLevel : 0,
            curExp : 10,
            nextExp : 28,
            curHP : 30,
            maxHP : 30,
            curMP : 20,
            maxMP : 20,
            food : 100,
            money : 100,
            statPoint : 1,
            gcd : 1.5,
            tickInterval : 5.0,
            tickTimer:0,

            strength : 80,
            wisdom : 120,
            neili : NeiLiType.Yin,
            baseState : BaseStateModel.initFromStrWis(80,120),
            totalState : BaseStateModel.initFromStrWis(80,120),
            baseSkill : {'fist':10,'sword':0,'machete':0,'spear':0,'ejection':20,'heal':15,'enchant':5,'swift':10},
            equipSkill : {'fist':0,'sword':0,'machete':0,'spear':0,'ejection':0,'heal':0,'enchant':0,'swift':0},
            totalSkill : {'fist':10,'sword':0,'machete':0,'spear':0,'ejection':20,'heal':15,'enchant':5,'swift':10},
            eqList : [0,0,0,0,0,0,0,0],
            learningCurExp : -1,
            learningNextExp : -1,
            wgList : [{kfId:32,kfLevel: 1},{kfId:15,kfLevel:1},{},{}],
            ngList : [{kfId:17,kfLevel:1},{},{},{}],
            qgList : [{kfId:1,kfLevel:1},{}],
            dbfObj: {hst:{duration:0,value:0.2},spd:{duration:0,value:0.2},stun:{duration:0},blind:{duration:0},dot:{duration:0,value:0}},
            zlKfId : -1,
            zlMedId : -1,
            cdList : [{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false}],
            gcdObj : {cur:0,max:0,ready:false},
            wgaId : -1,
            ngaId : -1,
            qgaId : -1,
            wgObj:{},
            ngObj:{},
            qgObj:{},
            inventory : [{"id":6,"count":1},{"id":107,"count":20},{"id":111,"count":3},{"id":119,"count":1},{"id":142,"count":1},{"id":156,"count":1},{"id":161,"count":1},{"id":326,"count":1},{"id":341,"count":1},{"id":343,"count":1}],
            horseId : 0,  // itemId 2 - 3
            shipId : 1,   // shipId 1 - 9
            shipFitSpeed : 0,   // 0,1 2 3
            shipFitCargo : 0,   // 0,1 2 3
            shipPortId: 25,  // 船只停靠港口 - 默认在平原
            shipSupply: 30, // 船只供给数量
            zoneId:0,
            cargoArr:[],
            moveOn: 'foot',
            moveOnSpeed: 100,
            worldPosX: 559 * 40 + 20,
            worldPosY: 310 * 40 + 20,
            shipPosX: 0,
            shipPosY: 0,
            taskFlag : [],
            taskActive: [400],
            killList : [],
            poemList : [],
            chestList : [],

            isAlive : true,
            flagUnlock: false,   // 角色是否解锁可用 unlockCode = 0，1，2
            flagPara: false,    // 巅峰 - 可获得巅峰经验 unlockCode = 3
            flagCow: false,     // 秘境 - 可进入奶牛关 unlockCode = 4
            flagArena: false,   // 竞技场 - 可进行单挑 -- 未使用？ unlockCode = 5
            flagEndless : false,    // 无尽 - 随机 mob 掉落物品 unlockCode = 6
            flagAshram: false,  // 道场 - 百人 等级 1- 100 掉落物品 unlockCode = 7
            flagJNC : false, // 剑南春 - 是否可以购买剑南春 unlockCode = 8
            tint: 0x9370DB,

            // 头像
            avatar:71,
            themeColor: '#9370DB',
            comboCount:0,
            visitedCity : [27,28]
        },
        {
            name : globalStrings.NAME_2,
            avatarId : 72,
            level : 1,
            paraLevel : 0,
            curExp : 10,
            nextExp : 28,
            travelDistance : 0,
            curHP : 30,
            maxHP : 30,
            curMP : 20,
            maxMP : 20,
            food : 100,
            money : 100,
            statPoint : 1,
            gcd : 1.5,
            tickInterval : 5.0,
            tickTimer: 0,

            strength : 100,
            wisdom : 100,
            neili : NeiLiType.He,
            baseState : BaseStateModel.initFromStrWis(100,100),
            totalState : BaseStateModel.initFromStrWis(100,100),
            baseSkill : {'fist':15,'sword':20,'machete':0,'spear':5,'ejection':0,'heal':10,'enchant':10,'swift':15},
            equipSkill : {'fist':0,'sword':0,'machete':0,'spear':0,'ejection':0,'heal':0,'enchant':0,'swift':0},
            totalSkill : {'fist':15,'sword':20,'machete':0,'spear':5,'ejection':0,'heal':10,'enchant':10,'swift':15},
            eqList : [0,0,0,0,0,0,0,0],
            learningKFId: -1,
            learningCurExp : -1,
            learningNextExp : -1,
            wgList : [{kfId:16,kfLevel: 1},{kfId:31,kfLevel:1},{},{}],
            ngList : [{kfId:25,kfLevel:1},{},{},{}],
            qgList : [{kfId:30,kfLevel:1},{}],
            // dbfList : [],   // dbfList = dbfClass Obj array
            dbfObj: {hst:{duration:0,value:0.2},spd:{duration:0,value:0.2},stun:{duration:0,value:0.2},blind:{duration:0},dot:{duration:0,value:0}},
            zlKfId : -1,
            zlMedId : -1,
            cdList : [{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false},{cur:0,max:0,ready:false}],
            gcdObj : {cur:0,max:0,ready:false},

            wgaId : -1,
            ngaId : -1,
            qgaId : -1,
            wgObj:{},
            ngObj:{},
            qgObj:{},
            inventory : [{id:4,count:1},{id:174,count:1},{id:175,count:1},{id:84,count:1},
                {id:107,count:20},{id:335,count:1},
                {id:334,count:1},
                {id:332,count:1},{id:339,count:1},{id:340,count:1},{id:344,count:1}
            ],
            horseId : 0,
            shipId : 0,
            shipFitSpeed : 0,
            shipFitCargo : 0,
            shipPortId: 25,  // 船只停靠港口 - 默认在平原
            shipSupply: 30, // 船只供给数量
            zoneId:0,
            cargoArr:[],
            moveOn: 'foot',
            moveOnSpeed: 100,
            worldPosX: 422 * 40 + 20,
            worldPosY: 291 * 40 + 20,
            shipPosX: 0,
            shipPosY: 0,

            taskFlag : [],
            taskActive: [293],
            killList : [],
            poemList : [],
            chestList : [],
            flagUnlock: false,   // 角色是否解锁可用 unlockCode = 0，1，2
            flagPara: false,    // 巅峰 - 可获得巅峰经验 unlockCode = 3
            flagCow: false,     // 秘境 - 可进入奶牛关 unlockCode = 4
            flagArena: false,   // 竞技场 - 可进行单挑 -- 未使用？ unlockCode = 5
            flagEndless : false,    // 无尽 - 随机 mob 掉落物品 unlockCode = 6
            flagAshram: false,  // 道场 - 百人 等级 1- 100 掉落物品 unlockCode = 7
            flagJNC : false, // 剑南春 - 是否可以购买剑南春 unlockCode = 8
            tint: 0x76d7ea,
            isAlive : true,

            // 头像
            avatar:72,
            themeColor: 'skyblue',
            comboCount:0,
            visitedCity : [27,29]
        }
    ];
}


let dbPlayer = [];
let pId = -1;
// 王二 pId =0  小月 pId=1 王大 pId = 2
