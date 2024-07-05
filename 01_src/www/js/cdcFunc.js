// Warning: if you call Math.seedrandom without `new`, it replaces
// Math.random with the predictable new Math.seedrandom(...), as follows:
// Math.seedrandom('hello.');
// console.log(Math.random());          // Always 0.9282578795792454
// console.log(Math.random());          // Always 0.3752569768646784

// Math.seedrandom('game seed');
// Excellent as expected.

Array.prototype.Contains = function (obj) {
    let i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};
Array.prototype.Remove = function(val) {
    let index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
Array.prototype.Replace=function(reg,rpby){
    var ta=this.slice(0),d='\0';
    var str=ta.join(d);str=str.replace(reg,rpby);
    return str.split(d);
};
String.prototype.Replace = String.prototype.replace;

function typeName(val) {return Object.prototype.toString.call(val).slice(8, -1);}
function isArray(a) { return typeName(a) === 'Array'; };

/**
 * Returns an indication of whether the argument is a Date or not
 */
function isDate(d) { return (d instanceof Date);}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 如果是中文字符串，返回开头2个； 如果是英文字符串，返回最前面2个大写，没有的话返回开头2个字符 Hill -> H 而不是 Hi
 * @param str
 * @return {*|string}
 */
function getFirstTwoChars(str){
    let uppercaseMatches = str.match(/[A-Z]/g);
    return uppercaseMatches ? uppercaseMatches.slice(0, 2).join('') : str.substring(0, 2);
}

/**
 * 中文字符串返回最后一个中文字；英文字符串返回自后一个英文单词（用驼峰判断）
 * @param str
 * @return {string|*}
 */
function getLastPart(str) {
    // 先检查是否包含中文，如果有，返回最后一个中文字符
    for(let i = str.length - 1; i >= 0; i--) {
        if(/[\u4e00-\u9fa5]/.test(str.charAt(i))) {
            return str.charAt(i);
        }
    }

    // 如果没有中文，检查是否有大写字母并返回从最后一个大写字母开始的部分
    // 如果没有大写字母，直接返回整个字符串（意味着全是小写字母或无字母字符）
    let lastIndex = -1;
    for(let i = 0; i < str.length; i++) {
        if(str[i] === str[i].toUpperCase() && str[i] !== str[i].toLowerCase()) {
            lastIndex = i;
        }
    }

    return lastIndex !== -1 ? str.slice(lastIndex) : str;
}

// 示例
// console.log(getLastPart("HelloWorld")); // 输出: "World"
// console.log(getLastPart("Hello世界")); // 输出: "界"
// console.log(getLastPart("Hello")); // 输出: "Hello"
// console.log(getLastPart("hello")); // 输出: "hello"
// console.log(getLastPart("你好世界")); // 输出: "界"


/**
 * Does a deep clone of the object.
 */
function deepClone(obj) {
    if (!obj || typeof obj === 'function' || isDate(obj) || typeof obj !== 'object') {
        return obj;
    }

    var retVal, i;

    if (isArray(obj)) {
        retVal = [];
        for (i = 0; i < obj.length; ++i) {
            retVal.push(deepClone(obj[i]));
        }
        return retVal;
    }

    retVal = {};
    for (i in obj) {
        // https://issues.apache.org/jira/browse/CB-11522 'unknown' type may be returned in
        // custom protocol activation case on Windows Phone 8.1 causing "No such interface supported" exception
        // on cloning.
        if ((!(i in retVal) || retVal[i] !== obj[i]) && typeof obj[i] !== 'undefined' && typeof obj[i] !== 'unknown') { // eslint-disable-line valid-typeof
            retVal[i] = deepClone(obj[i]);
        }
    }
    return retVal;
}

function escString(str){
    return str.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
}
function toPercentString(f,n=1){
    return (f*100).toFixed(n)+'%';
}
function stringToNumber(str){
    if(typeof(str) == 'string'){
        return parseInt(str.replace(/,/gi, ''));
    }else{
        return parseInt(str);
    }
}
function toReadableString(intPrice){
    if(typeof(intPrice) == 'string') return intPrice;
    return intPrice.toLocaleString('en-US');
}

/**
 * 千分的整数 转变为百分比
 * @param intNumber
 * @returns {string}
 */
function facToPercentString(intNumber){
    if(typeof(intNumber) == 'string') return intNumber;
    return (intNumber*0.1).toFixed(1)+"%";
}

/**
 * 无向图，最短路径，Dijkstra 算法
 * @param graph, number[][] 图，邻接矩阵，二维数组,
 * @param src, 顶点
 * @return {*[]} 顶点到达所有其他点的最短路径
 * @constructor
 */
function dijkstra(graph, src) {
    //dist 用来存储路径值(权)
    //visited  用来存储顶点是否访问
    let dist = []
    let visited = []

    const length = graph.length
    const INF = Number.MAX_SAFE_INTEGER
    //初始化dist 和 visited 列表
    for (let i = 0; i < length; i++) {
        dist[i] = INF
        visited[i] = false
    }

    //选择第一个节点 进入循环
    dist[src] = 0

    let i =0
    while (i < length - 1) {
        //此时对应节点 已经访问设置 true
        visited[src] = true
        //找到对应节点 的 对应的边集合
        let currentEdges = graph[src]
        //遍历边,更新路径
        for (let i = 0; i < currentEdges.length; i++) {
            if (currentEdges[i] !== 0) {
                //存在边 , 找到最短路径  例如
                //A=>B=>C 最短路径的权
                //为 A=>B 的权(dist[src]) +  B=>C的权(currentEdegs[i]) 和 A=>C(dist[i]) 的权 进行比较
                if (dist[src] + currentEdges[i] < dist[i]) {
                    //符合上面条件 更新dist[i] 保证dist[i]是每次探路的最短路径
                    dist[i] = currentEdges[i] + dist[src]
                }
            }
        }
        //迪杰斯特拉的核心算法 , 找到最短路径 重新探路.
        //选择最短路径
        let min = INF
        let minIndex = -2
        for (let i = 0; i < dist.length; i++) {
            if (!visited[i] && dist[i] < min) {
                min = dist[i]
                minIndex = i
            }
        }

        //进入下一次循环
        src = minIndex
        i ++
    }
    return dist
}

/**
 * 无向图，floy算法，计算所有顶点之间的最短路径
 * @param graph: number[][] - 图， 注意，不连通用 INF 表示
 * @return {*[]}
 */
function floydWarshall(graph){
    const dist = []
    const length = graph.length

    //初始化dist
    for (let i = 0; i < length; i++) {
        dist[i] = []
        for (let j = 0; j < length; j++) {
            if (i === j) {
                dist[i][j] = 0
            } else {
                dist[i][j] = graph[i][j]
            }
        }
    }

    //核心操作  判断 K 是否 是 i 到 j 可能的中点
    for (let k = 0; k < length; k++) {
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j]
                }
            }
        }
    }

    return dist
}

function utilGetCssIconById(cid){
    switch(cid+""){
        case '1': return "#icon-food-bread";    // 面粉
        case '2': return "#icon-liangshi";  // 粟米
        case '3': return "#icon-mifan";  // 粳米
        case '4': return "#icon-yurou";  // 鱼肉
        case '5': return "#icon-zhurou";  // 猪肉
        case '6': return "#icon-pingguo-";  // 苹果
        case '7': return "#icon-shucai-1";  // 藕
        case '8': return "#icon-longyan";  // 龙眼
        case '9': return "#icon-ganlan";  // 橄榄
        case '10': return "#icon-qiezi-"; // 茄子
        case '11': return "#icon-yezi"; // 椰子
        case '12': return "#icon-xigua"; // 西瓜
        case '13': return "#icon-food-pistachio"; // 槟郎
        case '14': return "#icon-juqi"; // 枸杞
        case '15': return "#icon-bajiao"; // 八角
        case '16': return "#icon-shucai-"; // 生姜
        case '17': return "#icon-ChiliPepper"; // 花椒
        case '18': return "#icon-CINNAMONROLL"; // 肉桂
        case '19': return "#icon-food-pecan"; // 沉香
        case '20': return "#icon-rencan"; // 人参
        case '21': return "#icon-shumu"; // 紫衫
        case '22': return "#icon-yan"; // 盐
        case '23': return "#icon-cuzongsuan"; // 醋
        case '24': return "#icon-jiutan"; // 米酒
        case '25': return "#icon-icon-test1"; // 蜜饯
        case '26': return "#icon-jiutan-copy"; // 清酒
        case '27': return "#icon-chaye"; // 龙井
        case '28': return "#icon-zheshan"; // 折扇
        case '29': return "#icon-yanzhi"; // 胭脂
        case '30': return "#icon-ziyuan"; // 漆器
        case '31': return "#icon-shuijing-hongx"; // 水晶
        case '32': return "#icon-boliqiu"; // 雨花石
        case '33': return "#icon-huaping"; // 陶瓷
        case '34': return "#icon-diaosu"; // 石雕
        case '35': return "#icon-sichou1"; // 丝绸
        case '36': return "#icon-maojinzhiwu"; // 云锦
        case '37': return "#icon-sichou2"; // 苏绣
        case '38': return "#icon-sichou"; // 湖丝
        case '39': return "#icon-yizhonghualidemaozhibu_zarape"; // 蜀绣
        case '40': return "#icon-gongjian"; // 强弓
        case '41': return "#icon-sv"; // 明光铠
        case '42': return "#icon-dao"; // 大刀
        case '43': return "#icon-xiegan"; // 长矛
        case '44': return "#icon-cupid"; // 火药箭
        case '45': return "#icon-yanhuabaozhu"; // 飞火
        case '46': return "#icon-moshui"; // 徽墨
        case '47': return "#icon-zhipin"; // 宣纸
        case '48': return "#icon-icon-test"; // 湖笔
        case '49': return "#icon-maobiyantai-"; // 端砚
        case '50': return "#icon-chundao"; // 剑南春
        case '51': return "#icon-lizhi"; // 荔枝
        case '52': return "#icon-zhenzhu"; // 珍珠
        case '53': return "#icon-feicuivip"; // 翡翠
        case '54': return "#icon-yushi"; // 玛瑙
        case '55': return "#icon-miandianyushikuang"; // 软玉
        default: return "#icon-food-strawberry";
    }
}

/**
 * 获取 (x1,y1) 与 (x2,y2)之间的距离
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {number}
 */
function getDistance(x1,y1,x2,y2){
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

/**
 * 归一化二维向量数组
 * @param sx 向量开始点x坐标
 * @param sy 向量开始点y坐标
 * @param ex 向量结束点x坐标
 * @param ey 向量结束点y坐标
 * @returns {{x: number, y: number}} 归一化向量
 */
function normalizeVector(sx,sy,ex,ey){
    let d = getDistance(sx,sy,ex,ey);
    return {x:Math.round(100*(ex-sx)/d)/100,y:Math.round(100*(ey-sy)/d)/100};
}

/**
 * Created 2023.05.30
 * 引入这个类用来解决 读档/存档 可以刷新领悟武学-鉴定结果的问题，使用专门的seedRandom 算法，生成可存档/读档 并且 restore 的固定随机数字
 * 因此，对于那些不需要存档/读档不变化的 随机情况，直接使用 Math.random 以及对应的 GlobalFunction中的随机函数，例如 possRand getRand 等即可
 * 对于那些，需要存档/读档不变化的 随机情况，例如，某次领悟的结果读档不变，某次鉴定的结果读档不变，则使用此类中的随机算法
 * 另外，对于赌博的情况，经过考虑之后，认为直接使用 Math.random即可
 * 再另外，对于某次领悟/鉴定，可以先用小精华领悟进行调整/跳过随机数，从而改变领悟/鉴定结果，考虑之后，认为允许，不进行干预
 * 最后，对于动态物品，是在领悟时，判断并完成鉴定，还是如目前代码领悟只是生成固定物品、鉴定才是真的创建动态物品：按照道理应该改成前者，但是后者似乎也无妨，改起来太痛苦，算了
 * p.s. 上个问题的改法，动态物品增加两个属性 isIdentified staticItemId. 这样领悟出来的物品直接完成鉴定staticItemId=未鉴定物品id,但是 isIdentified=false，鉴定设为true，修改inventory等展示逻辑，即可。
 * @type {{doublePossRand: (function(*, *, *=)), random: *, getRandSeq: (function(*, *): *[]), getRandUnique: (function(*, *, *): *[]), poisson: (function(*)), getRandFloat: (function(*, *)), possRand: (function(*, *)), getRndInteger: (function(*, *)), getRand: (function(*, *): number)}}
 */
let SeedRandom = {
    random: Math.seedrandom,

    /**
     * [min,max)
     * @param intMin int min included
     * @param intMax int max excluded
     * @return {number}
     */
    getRand: function(intMin, intMax)  {
        return Math.floor(intMin+(intMax-intMin)*this.random());
    },

    /**
     * [min,max]
     * @param intMin int min included
     * @param intMax int max included
     * @return {*}
     */
    getRndInteger : function(intMin, intMax) {
        return Math.floor(this.random() * (intMax - intMin + 1) ) + intMin;
    },

    // 产生一个泊松分布的随机数，Lamda为均值（分布参数λ）
    poisson: function (Lambda) {
        let k = 0;
        let p = 1.0;
        let L = Math.exp(-Lambda); //exp(-Lambda)是接近0的小数
        while (p >= L) {
            let u = this.random();
            p *= u;
            k++;
        }
        return k - 1;
    },
    /**
     * 泊松分布随机数生成 [intMin,intMax)
     * @param intMin 整型 最小
     * @param intMax 整型 最大
     * @return {int} 返回 [intMin,intMax)
     */
    possRand : function(intMin, intMax) {
        let range = intMax - intMin;
        let midRange = range / 2.0;
        let subRange = Math.floor(midRange);
        let poss = this.poisson(subRange);
        let modPoss = poss % range;
        return intMin + modPoss;
    },
    /**
     * 泊松分布随机，两位小数
     * @param dMin double min
     * @param dMax double max
     * @param zoom
     * @return {number}
     */
    doublePossRand : function(dMin, dMax, zoom=100) {
        let intMin = dMin * zoom;
        let intMax = dMax * zoom;
        let pos = this.possRand(intMin,intMax);
        return pos / zoom;
    },
    /**
     * 返回 [min,max)之间 count 个不重复的整数，结论：效率更高。
     * @param min 整形，最小值，包括
     * @param max 整形，最大值，不包括
     * @param count 整形，个数
     * @returns {*[]} 不满足条件返回空，否则返回不重复的随机数序列
     */
    getRandUnique : function(min, max, count){
        let result = [];
        let temp;
        if(count <= max - min ){
            while (result.length < count)
            {
                temp = this.getRand(min, max);
                if (!result.Contains(temp)) {
                    result.push(temp);
                }
            }
        }
        return result;
    },
    /**
     * [min,max]
     * @param min int min contained
     * @param maxContained int max contained
     * @return {*[]}
     */
    getRandSeq : function(min,maxContained){
        let ret = [];
        for(let i=min;i<=maxContained;i++){
            ret.push(i);
        }
        return ret.sort(function(){
            return SeedRandom.random() - 0.5;
        });
    },
    /**
     * [min,max]
     * @param fmin float min contained
     * @param fmaxc float max contained
     * @return {number}
     */
    getRandFloat : function(fmin,fmaxc){
        let imin = Math.floor(fmin * 10000);
        let imax = Math.ceil(fmaxc * 10000);
        let ir = this.getRndInteger(imin,imax);
        return ir/10000;
    },
}

let GlobalFunction = {
    // Random Related

    // 产生一个泊松分布的随机数，Lamda为均值（分布参数λ）
    poisson: function (Lambda) {
        var k = 0;
        var p = 1.0;
        var L = Math.exp(-Lambda); //exp(-Lambda)是接近0的小数
        while (p >= L) {
            var u = Math.random();
            p *= u;
            k++;
        }
        return k - 1;
    },

    /**
     * 泊松分布随机数生成 [intMin,intMax)
     * @param intMin 整型 最小
     * @param intMax 整型 最大
     * @return {int} 返回 [intMin,intMax)
     */
    possRand : function(intMin, intMax) {
        var range = intMax - intMin;
        var midRange = range / 2.0;
        var subRange = Math.floor(midRange);
        var poss = this.poisson(subRange);
        var modPoss = poss % range;
        return intMin + modPoss;
    },
    doublePossRand : function(dMin, dMax, zoom=100) {
        let intMin = dMin * zoom;
        let intMax = dMax * zoom;
        let pos = this.possRand(intMin,intMax);
        return pos / zoom;
    },

    getRand100000 : function(){
        return this.getRand(0,100000);
    },

    //[min,max)
    getRand: function(intMin, intMax)  {
        return Math.floor(intMin+(intMax-intMin)*Math.random());
    },

    //[min,max) 中间 没有 except
    getRandIntExcept(intMin,intMax,intExcept){
        let result = Math.floor(intMin+(intMax-intMin)*Math.random());
        if(intExcept === result){
            result = GlobalFunction.getRandIntExcept(intMin,intMax,intExcept);
        }
        return result;
    },

    // [min,max]
    getRndInteger : function(intMin, intMax) {
        return Math.floor(Math.random() * (intMax - intMin + 1) ) + intMin;
    },
    /**
     * 返回 [min,max)之间 count 个不重复的整数，结论：效率更高。
     * @param min 整形，最小值，包括
     * @param max 整形，最大值，不包括
     * @param count 整形，个数
     * @returns {*[]} 不满足条件返回空，否则返回不重复的随机数序列
     */
    getRandUnique : function(min, max, count){
        var result = [];
        var temp;
        if(count <= max - min ){
            while (result.length < count)
            {
                temp = this.getRand(min, max);
                if (!result.Contains(temp)) {
                    result.push(temp);
                }
            }
        }
        return result;
    },
    /**
     * 返回 [min,max)之间 count 个不重复的整数 - 优化算法 -- 实际更慢，不要使用。
     * @param min 整形，最小值，包括
     * @param max 整形，最大值，不包括
     * @param count 整形，个数
     * @returns {*[]} 不满足条件返回空，否则返回不重复的随机数序列
     */
    getIntRandUniqueQuick : function(min,max,count){
        let originalArray = [];
        if(max <= min) return originalArray;
        if(count > max-min) return originalArray;
        for (let i=0;i<max-min;i++){
            originalArray[i]=min+i;    // 生成 [min,max) 的数组，不包括 max
        }
        originalArray.sort(function(){ return 0.5 - Math.random(); });  // 乱序
        return originalArray.slice(0,count);
    },

    getRandSeq : function(min,maxContained){
        let ret = [];
        for(let i=min;i<=maxContained;i++){
            ret.push(i);
        }
        return ret.sort(function(){
            return Math.random() - 0.5;
        });
    },
    getRandFloat : function(fmin,fmaxc){
        let imin = Math.floor(fmin * 10000);
        let imax = Math.ceil(fmaxc * 10000);
        let ir = GlobalFunction.getRndInteger(imin,imax);
        return ir/10000;
    },





// this one return value for gold/epic merchant cargos, the value is between [v/2,v], possRand, most probably 0.75v
//public static int merchantRand(float v){
//    return v > GlobalConfig.FLOAT_MIN ? possRand((int)(v / 2.0), (int)v) : 0;
//}
    midPosRand : function(floatV,floatLow){
        var low = floatLow >= 1.0 ? 1.0 : floatLow;
        low = floatLow <= 0.0 ? 0.0 : low;
        return floatV > GlobalConfig.FLOAT_MIN ? this.possRand(Math.floor(floatV * low), Math.ceil(floatV)) : 0;
    },


    // return true if should-drop
    randSaving : function(rate){
        return Math.random() < rate;
    },


// utils func
//     /** * @returns {string} */
//     ItemCateToStr : function(cate){
//         switch(parseInt(cate)){
//             case CDEItemCategory.Hat:
//                 return GlobalDict.ITEM_NAME_HAT;
//             case CDEItemCategory.Misc:
//                 return GlobalDict.ITEM_NAME_MISC;
//             case CDEItemCategory.Necklace:
//                 return GlobalDict.ITEM_NAME_NECKLACE;
//             case CDEItemCategory.Ring:
//                 return GlobalDict.ITEM_NAME_RING;
//             case CDEItemCategory.Sword:
//                 return GlobalDict.ITEM_NAME_SWORD;
//             case CDEItemCategory.Gloves:
//                 return GlobalDict.ITEM_NAME_GLOVES;
//             case CDEItemCategory.Machete:
//                 return GlobalDict.ITEM_NAME_MACHETE;
//             case CDEItemCategory.Spear:
//                 return GlobalDict.ITEM_NAME_SPEAR;
//             case CDEItemCategory.Coat:
//                 return GlobalDict.ITEM_NAME_COAT;
//             case CDEItemCategory.Pants:
//                 return GlobalDict.ITEM_NAME_PANTS;
//             case CDEItemCategory.Shoes:
//                 return GlobalDict.ITEM_NAME_SHOES;
//             case CDEItemCategory.Ammo:
//                 return GlobalDict.ITEM_NAME_AMMO;
//             case CDEItemCategory.Bow:
//                 return GlobalDict.ITEM_NAME_BOW;
//             default:
//                 return GlobalDict.ITEM_NAME_PH;
//         }
//     },
//
//     /** * @returns {int} */
//     GetStateCount : function(tier){
//         // 1、2 =1  3=2 4=3 5=3/4 6=4/5
//         if (tier === 3) return 2;
//         if (tier === 4) return 3;
//         if (tier === 5) return GlobalFunction.getRand(3,5);
//         if (tier === 6) return GlobalFunction.getRand(4,6);
//         return 1;
//     },
//
//     /** * @returns {boolean} */
//     IsWeapon : function(pCategory){
//         return (pCategory === CDEItemCategory.Bow || pCategory === CDEItemCategory.Gloves || pCategory === CDEItemCategory.Machete
//             || pCategory === CDEItemCategory.Spear || pCategory === CDEItemCategory.Sword);
//     },
//     /** * @returns {boolean} */
//     IsArmor : function( pCategory) {
//         return (pCategory === CDEItemCategory.Coat || pCategory === CDEItemCategory.Hat || pCategory === CDEItemCategory.Necklace
//             || pCategory === CDEItemCategory.Pants || pCategory === CDEItemCategory.Shoes);
//     },
//
//     /** * @returns {string} */
//     GetItemNameColor : function(pTier){
//         switch(parseInt(pTier)){
//             case CDEItemTier.Blue: return GlobalConfig.TEXT_COLOR_BLUE;
//             case CDEItemTier.Gray: return GlobalConfig.TEXT_COLOR_GRAY;
//             case CDEItemTier.White: return GlobalConfig.TEXT_COLOR_WHITE;
//             case CDEItemTier.Gold: return GlobalConfig.TEXT_COLOR_GOLD;
//             case CDEItemTier.Purple: return GlobalConfig.TEXT_COLOR_PURPLE;
//             case CDEItemTier.Epic: return GlobalConfig.TEXT_COLOR_EPIC;
//             case CDEItemTier.Green: return GlobalConfig.TEXT_COLOR_GREEN;
//             default:return GlobalConfig.TEXT_COLOR_WHITE;
//         }
//
//     },
//
//     /** * @returns {string} */
//     ItemPreCombine : function(preList){
//         let preStr = "";
//         //if( preList.Count < 2 ){
//         //    foreach(string prefix in preList){
//         //        preStr += prefix;
//         //    }
//         //}else{
//         // 3 phases : gq +
//         if(preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_MZ) && preList.Contains(GlobalDict.ITEM_PRE_JS)){
//             preStr += GlobalDict.ITEM_PRE_JF;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_MZ);
//             preList.Remove(GlobalDict.ITEM_PRE_JS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_MZ) && preList.Contains(GlobalDict.ITEM_PRE_BL))
//         {
//             preStr += GlobalDict.ITEM_PRE_PL;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_MZ);
//             preList.Remove(GlobalDict.ITEM_PRE_BL);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_MZ) && preList.Contains(GlobalDict.ITEM_PRE_BB))
//         {
//             preStr += GlobalDict.ITEM_PRE_SD;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_MZ);
//             preList.Remove(GlobalDict.ITEM_PRE_BB);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_BB) && preList.Contains(GlobalDict.ITEM_PRE_BL))
//         {
//             preStr += GlobalDict.ITEM_PRE_LH;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_BB);
//             preList.Remove(GlobalDict.ITEM_PRE_BL);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_BL) && preList.Contains(GlobalDict.ITEM_PRE_JS))
//         {
//             preStr += GlobalDict.ITEM_PRE_HH;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_BL);
//             preList.Remove(GlobalDict.ITEM_PRE_JS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_BB) && preList.Contains(GlobalDict.ITEM_PRE_JS))
//         {
//             preStr += GlobalDict.ITEM_PRE_JL;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_BB);
//             preList.Remove(GlobalDict.ITEM_PRE_JS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//
//         // 3 phases : fy +
//         if (preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_SB) && preList.Contains(GlobalDict.ITEM_PRE_ZJ))
//         {
//             preStr += GlobalDict.ITEM_PRE_BQ;
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_SB);
//             preList.Remove(GlobalDict.ITEM_PRE_ZJ);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_SB) && preList.Contains(GlobalDict.ITEM_PRE_FS))
//         {
//             preStr += GlobalDict.ITEM_PRE_RL;
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_SB);
//             preList.Remove(GlobalDict.ITEM_PRE_FS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_ZJ) && preList.Contains(GlobalDict.ITEM_PRE_FS))
//         {
//             preStr += GlobalDict.ITEM_PRE_FJ;
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_ZJ);
//             preList.Remove(GlobalDict.ITEM_PRE_FS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_XX) && preList.Contains(GlobalDict.ITEM_PRE_HX))
//         {
//             preStr += GlobalDict.ITEM_PRE_BD;
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_XX);
//             preList.Remove(GlobalDict.ITEM_PRE_HX);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_XX) && preList.Contains(GlobalDict.ITEM_PRE_HL))
//         {
//             preStr += GlobalDict.ITEM_PRE_YG;
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_XX);
//             preList.Remove(GlobalDict.ITEM_PRE_HL);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//
//         // 3 phases : gj fy +
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_FS))
//         {
//             preStr += GlobalDict.ITEM_PRE_YB;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_FS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_XX))
//         {
//             preStr += GlobalDict.ITEM_PRE_LS;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_XX);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_HX))
//         {
//             preStr += GlobalDict.ITEM_PRE_YS;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_HX);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_HL))
//         {
//             preStr += GlobalDict.ITEM_PRE_XZ;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_HL);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_BL))
//         {
//             preStr += GlobalDict.ITEM_PRE_YA;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_BL);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_BB))
//         {
//             preStr += GlobalDict.ITEM_PRE_TW;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_BB);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_JS))
//         {
//             preStr += GlobalDict.ITEM_PRE_XQ;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_ZJ);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_ZJ))
//         {
//             preStr += GlobalDict.ITEM_PRE_KL;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_FS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_SB))
//         {
//             preStr += GlobalDict.ITEM_PRE_QH;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_SB);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_FY) && preList.Contains(GlobalDict.ITEM_PRE_MZ))
//         {
//             preStr += GlobalDict.ITEM_PRE_HQ;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_FY);
//             preList.Remove(GlobalDict.ITEM_PRE_MZ);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//
//         // 2 phases
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_MZ))
//         {
//             preStr += GlobalDict.ITEM_PRE_FL;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_MZ);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_BL) && preList.Contains(GlobalDict.ITEM_PRE_BB))
//         {
//             preStr += GlobalDict.ITEM_PRE_ZM;
//             preList.Remove(GlobalDict.ITEM_PRE_BL);
//             preList.Remove(GlobalDict.ITEM_PRE_BB);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_JS) && preList.Contains(GlobalDict.ITEM_PRE_SB))
//         {
//             preStr += GlobalDict.ITEM_PRE_GM;
//             preList.Remove(GlobalDict.ITEM_PRE_JS);
//             preList.Remove(GlobalDict.ITEM_PRE_SB);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_SB) && preList.Contains(GlobalDict.ITEM_PRE_ZJ))
//         {
//             preStr += GlobalDict.ITEM_PRE_NY;
//             preList.Remove(GlobalDict.ITEM_PRE_SB);
//             preList.Remove(GlobalDict.ITEM_PRE_ZJ);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_SB) && preList.Contains(GlobalDict.ITEM_PRE_FS))
//         {
//             preStr += GlobalDict.ITEM_PRE_TJ;
//             preList.Remove(GlobalDict.ITEM_PRE_SB);
//             preList.Remove(GlobalDict.ITEM_PRE_FS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_ZJ) && preList.Contains(GlobalDict.ITEM_PRE_FS))
//         {
//             preStr += GlobalDict.ITEM_PRE_YH;
//             preList.Remove(GlobalDict.ITEM_PRE_ZJ);
//             preList.Remove(GlobalDict.ITEM_PRE_FS);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//         if (preList.Contains(GlobalDict.ITEM_PRE_GQ) && preList.Contains(GlobalDict.ITEM_PRE_XX))
//         {
//             preStr += GlobalDict.ITEM_PRE_BZ;
//             preList.Remove(GlobalDict.ITEM_PRE_GQ);
//             preList.Remove(GlobalDict.ITEM_PRE_XX);
//             //preStr += GlobalFunction.ItemPreCombine(preList);
//         }
//
//
//         //foreach (string prefix in preList)
//         if(preList.length === 1){
//             preStr = preList[0];
//         }else{
//             if(preList.length ===2){
//                 preStr = preList[0] + preList[1];
//             }else{
//                 preStr = preList[0] + preList[1].substr(0,1) + preList[preList.length-1].substr(0,1);
//             }
//         }
//
//
//         // for(let i = 1; i<preList.length;i++) {
//         //     // if((prefix != GlobalDict.ITEM_PRE_FY) && (prefix != GlobalDict.ITEM_PRE_GQ))
//         //     preStr += preList[i].substr(0,1);
//         // }
//
//
//         //}
//         // preStr = preStr.length >= 6 ? preStr.Remove(3, 2) : preStr;
//         // preStr = preStr.length > 6 ? preStr.Remove(4, 2) : preStr;
//         return preStr;
//     },

    /** * @returns {string} */
    NGNameGenerator : function(keyWord){
        let intPreRand = this.getRand(0, GlobalConfig.NG_PRE_ARR.length);
        let intSufRand = this.getRand(0, GlobalConfig.NG_SUF_ARR.length);
        return GlobalConfig.NG_PRE_ARR[intPreRand] + keyWord + GlobalConfig.NG_SUF_ARR[intSufRand];
    },
    /** * @returns {string} */
    WGNameGenerator : function(intCate){
        let strKeyWord = GlobalConfig.WG_KEY_ARR[intCate, GlobalFunction.getRand(0, 9)];
        let intPreRand = getRand(0, GlobalConfig.WG_PRE_ARR.length);
        let intSufRand = getRand(0, GlobalConfig.WG_SUF_ARR.length);
        return GlobalConfig.WG_PRE_ARR[intPreRand] + GlobalConfig.WG_SUF_ARR[intSufRand] + strKeyWord;
    },
    /** * @returns {string} */
    QGNameGenerator : function(){
        let intLen = GlobalConfig.QG_KEY_ARR.length;
        let intIdx = GlobalFunction.getRand(0, intLen);
        let strKeyWord = GlobalConfig.QG_KEY_ARR[intIdx];
        let intPreRand = GlobalFunction.getRand(0, GlobalConfig.QG_PRE_ARR.length);
        let intSufRand = GlobalFunction.getRand(0, GlobalConfig.QG_SUF_ARR.length);
        return GlobalConfig.QG_PRE_ARR[intPreRand] + GlobalConfig.QG_SUF_ARR[intSufRand] + strKeyWord;
    },
    // /** * @returns {int} */
    // GetGFMinByTier : function(tier){
    //     switch (parseInt(tier)){
    //         case CDEGFTier.Gray: return 5;
    //         case CDEGFTier.White: return 20;
    //         case CDEGFTier.Blue: return 35;
    //         case CDEGFTier.Gold: return 50;
    //         case CDEGFTier.Purple: return 65;
    //         case CDEGFTier.Pink: return 80;
    //         case CDEGFTier.Epic: return 90;
    //         case CDEGFTier.Marvel: return 100;
    //         default:return 0;
    //     }
    // },
    // /** * @returns {int} */
    // GetGFMaxByTier : function(tier){
    //     switch (parseInt(tier)){
    //         case CDEGFTier.Gray: return 25;
    //         case CDEGFTier.White: return 40;
    //         case CDEGFTier.Blue: return 55;
    //         case CDEGFTier.Gold: return 70;
    //         case CDEGFTier.Purple: return 85;
    //         case CDEGFTier.Pink: return 95;
    //         case CDEGFTier.Epic: return 100;
    //         case CDEGFTier.Marvel: return 101;
    //         default: return 0;
    //     }
    // },
    // /** * @returns {int} */
    // GetGFHPMaxByTier : function(tier){
    //     switch (parseInt(tier)){
    //         case CDEGFTier.Gray: return 70;
    //         case CDEGFTier.White: return 75;
    //         case CDEGFTier.Blue: return 80;
    //         case CDEGFTier.Gold: return 85;
    //         case CDEGFTier.Purple: return 90;
    //         case CDEGFTier.Pink: return 95;
    //         case CDEGFTier.Epic: return 100;
    //         case CDEGFTier.Marvel: return 101;
    //         default: return 0;
    //     }
    // },
    // /** * @returns {int} */
    // GetGFHPMinByTier : function(tier){
    //     switch (parseInt(tier)){
    //         case CDEGFTier.Gray: return 60;
    //         case CDEGFTier.White: return 65;
    //         case CDEGFTier.Blue: return 70;
    //         case CDEGFTier.Gold: return 75;
    //         case CDEGFTier.Purple: return 80;
    //         case CDEGFTier.Pink: return 85;
    //         case CDEGFTier.Epic: return 90;
    //         case CDEGFTier.Marvel: return 100;
    //         default: return 0;
    //     }
    // },

    uuid : function(){
        let lut = Array(256).fill().map((_, i) => (i < 16 ? '0' : '') + (i).toString(16));
        let formatUuid = ({d0, d1, d2, d3}) =>
            lut[d0       & 0xff]        + lut[d0 >>  8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
            lut[d1       & 0xff]        + lut[d1 >>  8 & 0xff] + '-' +
            lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2       & 0x3f | 0x80] + lut[d2 >>  8 & 0xff] + '-' +
            lut[d2 >> 16 & 0xff]        + lut[d2 >> 24 & 0xff] +
            lut[d3       & 0xff]        + lut[d3 >>  8 & 0xff] +
            lut[d3 >> 16 & 0xff]        + lut[d3 >> 24 & 0xff];

        let getRandomValuesFunc = window.crypto && window.crypto.getRandomValues ?
            () => {
                let dvals = new Uint32Array(4);
                window.crypto.getRandomValues(dvals);
                return {
                    d0: dvals[0],
                    d1: dvals[1],
                    d2: dvals[2],
                    d3: dvals[3],
                };
            } :
            () => ({
                d0: Math.random() * 0x100000000 >>> 0,
                d1: Math.random() * 0x100000000 >>> 0,
                d2: Math.random() * 0x100000000 >>> 0,
                d3: Math.random() * 0x100000000 >>> 0,
            });

        return formatUuid(getRandomValuesFunc());
    },

// Arrays
// public static T[] Combine<T>(params IEnumerable<T>[] items) => items.SelectMany(i => i).ToArray();


    getNowFormatDate: function() {
        let now= new Date();
        let _month = ( 10 > (now.getMonth()+1) ) ? '0' + (now.getMonth()+1) : now.getMonth()+1;
        let _day = ( 10 > now.getDate() ) ? '0' + now.getDate() : now.getDate();
        let _hour = ( 10 > now.getHours() ) ? '0' + now.getHours() : now.getHours();
        let _minute = ( 10 > now.getMinutes() ) ? '0' + now.getMinutes() : now.getMinutes();
        let _second = ( 10 > now.getSeconds() ) ? '0' + now.getSeconds() : now.getSeconds();
        return now.getFullYear() + '-' + _month + '-' + _day + ' ' + _hour + ':' + _minute + ':' + _second;
    },

    wait: async function(time){
        await sleep(time);
    },
};
