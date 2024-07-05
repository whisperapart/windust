/**
 * Created by jim on 2020/3/28.
 */

const coreProductivity = 8.0;   // 20220214 从3.0 改为4.0，提升生产效率
const originPriceFixCoefficient = 1.1; // sale price = basePrice * originPriceFixCoefficient;   原产地出售的价格 与 basePrice的限制关系。
const cargoTypeRelationCoefficient = 0.618; // 售出物品时，同类型的物品换算需求变化量的系数
const cargoDemandMaxMultiplier = 3; // 2023.05.25 试图稳定物价，不让波动太剧烈，调整demandMax
const cargoP2PRangeCoefficient = 0.5; // 2023.05.25 试图稳定物价，不让波动太剧烈，调整波动范围
// const dailyRigidRate = 3.2;   // = 涨幅最大值 的 两倍
const dailyRigidRate = 2.4;   // = updated 20220214 wave太剧烈，调整 3.2 -> 2.4

const shipSupplyPrice = 20;    // 船只补给的单价
const playerFoodDaily = 5;      // 单人每日Food消耗
const horseFoodDaily = 10;      // 骑马每日Food消耗
const playerFoodSupply = 24;    // 每次补充

let gTrade = new class{
    // constructor
    constructor(){

    }

    // shared functions
    /**
     * 20220214 重写
     * 逻辑：假设有虚拟的销售，进而调整价格
     */
    priceWaveDaily20220214(){
        for(let i=0;i<dbCityCargo.length;i++){
            let rnd = Math.random() - 0.5;// [0,1) => [-0.5,0.5)
            let q = dbCityCargo[i].demandMax * cargoDemandMaxMultiplier * dbCityCargo[i].rigid * dailyRigidRate * rnd;
            q = Math.round(q);
            gTrade.priceWaveOnSaleOnlyOne(dbCityCargo[i].cargoId,q,dbCityCargo[i].cityId);
        }
    }
    priceWaveOnSaleOnlyOne(cargoId,quantity,cityId){
        let cityCargoArr = gDB.getCargoAllForCity(cityId);
        // updated 2023.05.26 试图减少 波动的幅度，不修改db，在计算的时候处理
        //  第一，p2pRange 取值为数据中的一半
        //  第二，增加demandMax值 * 3

        for(let i=0;i<cityCargoArr.length;i++){
            if(parseInt(cityCargoArr[i].cargoId) === parseInt(cargoId)){
                let cDemandMax = cityCargoArr[i].demandMax * cargoDemandMaxMultiplier;
                let cP2pRange = cityCargoArr[i].p2pRange * cargoP2PRangeCoefficient;

                let q = Math.round(quantity);
                let t = cityCargoArr[i].demand - q;
                // 爆港 = -max
                t = t < -cDemandMax ? -cDemandMax : t;
                cityCargoArr[i].demand =  t > cDemandMax ? cDemandMax : t;
                // wave price for current Cargo
                let x = cP2pRange * q  / cDemandMax;
                let delta = Math.floor(cityCargoArr[i].basePrice * x);
                cityCargoArr[i].price = cityCargoArr[i].price > 0 ? cityCargoArr[i].price : cityCargoArr[i].basePrice;
                let normalPrice =  cityCargoArr[i].price - delta;  // bug-fixing，price是被dailyWave 修正过的价格，直接再乘以需求戏数，导致放大。 价格随之下降
                let priceMin = Math.floor(cityCargoArr[i].basePrice*(1-cP2pRange));
                let priceMax = Math.ceil(cityCargoArr[i].basePrice*(1+cP2pRange));
                normalPrice = normalPrice > priceMin ? normalPrice : priceMin;
                normalPrice = normalPrice < priceMax ? normalPrice : priceMax;
                cityCargoArr[i].price = normalPrice;
            }
        }
    }

    priceWaveDaily(){
        for(let i=0;i<dbCityCargo.length;i++){
            // 每日需求波动
            let rnd = Math.random() - 0.5;// [0,1) => [-0.5,0.5)
            let q = dbCityCargo[i].demandMax * dbCityCargo[i].rigid * dailyRigidRate * rnd;
            // 根据需求波动计算价格
            let t = dbCityCargo[i].demand + q;  // 需求每天自动增加
            t = t > dbCityCargo[i].demandMax ? dbCityCargo[i].demandMax : t;
            t = t<= -dbCityCargo[i].demandMax ? -dbCityCargo[i].demandMax : t;  // 需求最少的情况 = -max
            dbCityCargo[i].demand =  t;
            // wave price
            let x = dbCityCargo[i].p2pRange * dbCityCargo[i].demand / dbCityCargo[i].demandMax;
            dbCityCargo[i].price = dbCityCargo[i].price > 0 ? dbCityCargo[i].price : dbCityCargo[i].basePrice;
            let delta = dbCityCargo[i].basePrice * x;
            let p = dbCityCargo[i].price + delta;   // 价格随之提高
            let priceMin = Math.floor(dbCityCargo[i].basePrice*(1-dbCityCargo[i].p2pRange));
            let priceMax = Math.ceil(dbCityCargo[i].basePrice*(1+dbCityCargo[i].p2pRange));
            p = p > priceMax ? priceMax : p;
            p = p < priceMin ? priceMin : p;
            dbCityCargo[i].price = p;

            // if(i==0){
            //     console.log("q="+q+" | t="+t+" | x="+x+" | delta="+delta+" | p="+p);
            // }
        }
        // debug purpose
        // let py = dbCityCargo.filter(x => (x.cityId==='25'));
        // console.log(py[0].price);
    }
    priceWaveDaily_old(){
        for(let i=0;i<dbCityCargo.length;i++){
            let q = dbCityCargo[i].demandMax * dbCityCargo[i].rigid * dailyRigidRate;
            // var t = portObj.buy[i].demand + q;
            // update: try to fix issue: price kept on raising instead of waving besides basePrice
            //var t = dbCityCargo[i].demand > 0 ? dbCityCargo[i].demand - q : dbCityCargo[i].demand + q;
            let t = dbCityCargo[i].demand > 0.618 * dbCityCargo[i].demandMax ? dbCityCargo[i].demand - q : dbCityCargo[i].demand + q;   // 需求会增长到最大值的 61.8% 左右
            t = t<= -dbCityCargo[i].demandMax ? -dbCityCargo[i].demandMax : t;  // 需求最少的情况 = -max
            dbCityCargo[i].demand =  t > dbCityCargo[i].demandMax ? dbCityCargo[i].demandMax : t;
            // wave price
            let x = 1 + dbCityCargo[i].p2pRange * t / dbCityCargo[i].demandMax;
            let p = Math.round(dbCityCargo[i].basePrice * x) ;
            // 加入乱数，可以突破max
            let v = p > dbCityCargo[i].basePrice ? Math.random()*0.05 + 0.95 : Math.random()*0.05 + 0.97;
            //var v = p > portObj.buy[i].basePrice ? Math.random()*0.15 + 0.85 : Math.random()*0.15 + 0.95;
            let normalPrice = Math.round(v * p);
            dbCityCargo[i].price = normalPrice;

            // if(dbCityCargo[i].supplyMax > 0){   // 当前城市也出售这个商品
            //     var fixedSellPrice = Math.round(dbCityCargo[i].basePrice * originPriceFixCoefficient);
            //     dbCityCargo[i].salePrice =  normalPrice > fixedSellPrice ? fixedSellPrice : normalPrice ;
            //     dbCityCargo[i].salePrice = Math.round( dbCityCargo[i].salePrice * 0.5);
            // }

            // comment out: 不再单独记录贩卖价格，而是固定从price计算（* 0.5）
            // dbCityCargo[i].salePrice = dbCityCargo[i].supplyMax > 0 ? Math.round( normalPrice * 0.5) : 0;
        }
    }

    /**
     * 出售之后变更价格
     * @param cargoId string 货物编号
     * @param quantity int 出售数量，负数表示购买
     * @param cityId string 城市编号
     * {"cityId": "1", "cityName": "金陵", "cargoId": "1", "cargoName": "面粉", "cargoType": "食物", "basePrice" :20, "price": 0, "p2pRange": 0.5, "demand": 0, "demandMax": 300, "rigid": 0.15, "devLevel": 300, "supply": 0, "supplyMax": 1200},
     */
    priceWaveOnSell(cargoId,quantity,cityId){
        let cityCargoArr = gDB.getCargoAllForCity(cityId);
        let cargoType = gDB.getCargoTypeById(cargoId);
        
        for(let i=0;i<cityCargoArr.length;i++){
            if(cityCargoArr[i].cargoType === cargoType){
                // updated 2023.05.26 试图减少 波动的幅度，不修改db，在计算的时候处理
                //  第一，p2pRange 取值为数据中的一半
                //  第二，增加demandMax值 * 3
                let cDemandMax = cityCargoArr[i].demandMax * cargoDemandMaxMultiplier;
                let cP2pRange = cityCargoArr[i].p2pRange * cargoP2PRangeCoefficient;

                // if it is the cargo use quantity, if it is only the same type -> quantity * 0.618 for wave;
                let q = Math.round(quantity);
                q = parseInt(cityCargoArr[i].cargoId) === parseInt(cargoId) ? q : (q * cargoTypeRelationCoefficient);   // bug-fixing: 不需要是整数
                let t = cityCargoArr[i].demand - q;     // 需求得到满足，减少
                // 爆港 = -max
                t = t < -cDemandMax ? -cDemandMax : t;
                cityCargoArr[i].demand =  t > cDemandMax ? cDemandMax: t;
                // wave price for current Cargo
                let x = cP2pRange * q  / cDemandMax;
                // let x = cityCargoArr[i].p2pRange * cityCargoArr[i].demand  / cityCargoArr[i].demandMax;
                let delta = Math.round(cityCargoArr[i].basePrice * x);
                cityCargoArr[i].price = cityCargoArr[i].price > 0 ? cityCargoArr[i].price : cityCargoArr[i].basePrice;
                let normalPrice =  cityCargoArr[i].price - delta;  // bug-fixing，price是被dailyWave 修正过的价格，直接再乘以需求戏数，导致放大。 价格随之下降
                let priceMin = Math.floor(cityCargoArr[i].basePrice*(1-cP2pRange));
                let priceMax = Math.ceil(cityCargoArr[i].basePrice*(1+cP2pRange));
                normalPrice = normalPrice > priceMin ? normalPrice : priceMin;
                normalPrice = normalPrice < priceMax ? normalPrice : priceMax;
                cityCargoArr[i].price = normalPrice;

                // comment out: 不再单独记录贩卖价格，而是固定从price计算（* 0.5）
                // cityCargoArr[i].salePrice = cityCargoArr[i].supplyMax > 0 ? Math.round( normalPrice * 0.5) : 0;

                // console.log("new price:"+cityCargoArr[i].cargoName+"="+normalPrice);

                // if(cityCargoArr[i].supplyMax >0){
                //     var fixedSellPrice = Math.round(cityCargoArr.basePrice * originPriceFixCoefficient);
                //     portObj.sell[sellIdx].price = normalPrice > fixedSellPrice ? fixedSellPrice : normalPrice ;
                //     cityCargoArr.price = Math.round(portObj.sell[sellIdx].price * 0.5);
                // }

            }
        }
    }
    restoreSupplyDaily(){
        // console.log("restore supply daily");
        for(let i=0;i<dbCityCargo.length;i++){
            if(dbCityCargo[i].supplyMax > 0){
                let city = gDB.getCityById(dbCityCargo[i].cityId);
                // todo debug this, why city === undefined
                if(city === undefined) continue;
                if(city.devLevel === undefined) city.devLevel = 0;
                let cityDev = parseInt(city.devLevel);
                if(cityDev >= dbCityCargo[i].devLevel){
                    let cargoProductivity = Math.floor(Math.floor(cityDev / dbCityCargo[i].devLevel) * coreProductivity);
                    // 20221205 try to fix fac_fc for daily supply
                    cargoProductivity = Math.ceil(cargoProductivity * city.fac_fc / 1000);
                    let t = dbCityCargo[i].supply + cargoProductivity;
                    t = t < 0 ? 0 : Math.round(t);
                    dbCityCargo[i].supply =  t > dbCityCargo[i].supplyMax ? dbCityCargo[i].supplyMax : t;
                }
            }
        }
    }
    // private functions

    // utils
}();

