/**
 * Created by jim on 2020/3/18.
 */
let gDB = new class {
    constructor() {
        // empty, as this class contains static db functions only
    }

    // shared functions

    // dbTask
    getTaskById(tid){return dbTask.find(x => (parseInt(x.id) === parseInt(tid)));}
    getTasksByNPC(cityId,npcId){
        return dbTask.filter(x=> (parseInt(x.senderCityId) === parseInt(cityId)) && (parseInt(x.senderId) === parseInt(npcId)));
    }
    getTasksEndByNPC(cityId,npcId){
        return dbTask.filter(x=> (parseInt(x.receiverCityId) === parseInt(cityId)) && (parseInt(x.receiverId) === parseInt(npcId)));
    }
    getNextTasks(tid){return dbTask.filter(x => (parseInt(x.preQuest) === parseInt(tid)));}
    getPreTask(tid){
        let preId = dbTask.find(x => (parseInt(x.id) === parseInt(tid))).preQuest;
        if(preId <=0){
            return null;
        }
        return dbTask.find(x => (parseInt(x.id) === parseInt(preId)));
    }
    getActiveTasks(){
        let tasks = [];
        for(let i=0;i<dbPlayer[pId].taskActive.length;i++){
            let t = gDB.getTaskById(dbPlayer[pId].taskActive[i]);
            tasks.push(t);
        }
        return tasks;
    }

    // dbCity
    getCityById(cId){return dbCity.find(x => (parseInt(x.zoneId) === parseInt(cId))); }
    // getCityDevLevel(cId){ return parseInt(dbCity.find(x => x.cityId === cId).cityDevLevel);}
    getCityNPCNameById(npcId) {return dbCityCmd.find(x => x.npcId === npcId).npcName;}
    // getZoneByPos(px,py){return dbCity.find(x=>((parseInt(x.tileX) === parseInt(px)) && (parseInt(x.tileY) === parseInt(py))));}
    getZoneByPos(px,py){return dbCity.find(x=>((Math.abs((parseInt(x.tileX) - parseInt(px)))<=1) && (Math.abs((parseInt(x.tileY) - parseInt(py)))<=1)));}
    getCityNPCNameArray(cityId){
        let arr = [];
        let intCid = parseInt(cityId);
        for(let i=0;i<dbCityCmd.length;i++){
            if(parseInt(dbCityCmd[i].cityId) === intCid){
                if(arr.indexOf(dbCityCmd[i].npcName)===-1){
                    arr.push(dbCityCmd[i].npcName);
                }
            }
        }
        return arr;
    }
    getCityNPCActArray(cityId){
        let arr = [];
        let intCid = parseInt(cityId);
        for(let i=0;i<dbCityCmd.length;i++){
            if(parseInt(dbCityCmd[i].cityId) === intCid){
                if(arr.indexOf(dbCityCmd[i].actId)===-1){
                    arr.push(dbCityCmd[i].actId);
                }
            }
        }
        return arr;
    }
    getCityNPCIdArray(cityId){
        let arr = [];
        let intCid = parseInt(cityId);
        for(let i=0;i<dbCityCmd.length;i++){
            if(parseInt(dbCityCmd[i].cityId) === intCid){
                let intNid = parseInt(dbCityCmd[i].npcId);
                if(intNid <= 0) break;
                if(arr.indexOf(intNid)===-1){
                    arr.push(intNid);
                }
            }
        }
        return arr;
    }

    // dbCityAction
    getActionNameById(aId){ return dbCityAction.find( x => parseInt(x.actId) === parseInt(aId)).actName ;}
    // dbCityBuilding
    getBuildingIdByName(bName){ return dbCityBuilding.find(x => x.buildingName === bName).buildingId; }
    getBuildingById(bid){ return dbCityBuilding.find(x => x.buildingId === bid); }

    // dbCityCmd
    getNpcIdListForBuilding(intCityId,intBuildingId){
        let npcArr = [];
        for(let i=0;i<dbCityCmd.length;i++){
            if((dbCityCmd[i].buildingId === intBuildingId) && (dbCityCmd[i].cityId === intCityId)){
                npcArr.push(parseInt(dbCityCmd[i].npcId));
            }
        }
        npcArr = [...new Set(npcArr)];
        return npcArr;
    }
    getBuildingNameListForCity(intCityId){
        let buildingArr = [];
        dbCityCmd.forEach(function(cmd){
            if(parseInt(cmd.cityId) === intCityId){
                // console.log(cmd.cityName + "-" + cmd.buildingName + "-" + cmd.npcName + "-" + cmd.actName);
                if(buildingArr.indexOf(cmd.buildingName) >= 0){

                }else{
                    buildingArr.push(cmd.buildingName);
                }
            }
        });
        return buildingArr;
    }

    // dbPoem
    getPoemById(pid){ return dbPoem.find(x => parseInt(x.id) === parseInt(pid)); }

    // dbCityCargo
    // todo: - 调用时注意： 查询条件需要加入城市当前发展度与特产品 devLevel 的关系

    /**
     * 特产列表
     * @param cid
     */
    getCargoListForCity(cid){ return dbCityCargo.filter(x => ((parseInt(x.cityId) === parseInt(cid)) && (x.supplyMax !== 0)));}

    /**
     * 可售列表 - && x.locked ===0 移除，在显示的时候判断是会否 剑南春并处理
     * @param cityId
     */
    getCargoSalebleForCity(cityId){
        let cityDev = parseInt(gDB.getCityById(cityId).devLevel);
        return dbCityCargo.filter(x => (((parseInt(x.cityId) === parseInt(cityId)))
            && (x.supplyMax !== 0)
            && (x.devLevel <= cityDev)
        ));
    }

    /**
     * 该城市所有商品列表，包括非特产，但是有价格，一般用于 sale
     * @param cid
     */
    getCargoAllForCity(cid){ return dbCityCargo.filter(x => (parseInt(x.cityId) === parseInt(cid)));}
    // 判断cargo是否是city的特产品
    isCargoProducableInCity(cargoId,cityId){ return dbCityCargo.find(x => ((x.cityId == cityId+"") && (x.cargoId == cargoId+"") && (x.supplyMax > 0))) == -1; }
    getCargoTypeById(cid){ return dbCityCargo.find(x=>parseInt(x.cargoId) === parseInt(cid)).cargoType;}
    getCargoStockById(cargoId,cityId){ return dbCityCargo.find(x=>((parseInt(x.cargoId) === parseInt(cargoId)) && (parseInt(x.cityId) === parseInt(cityId)))).supply;}
    // getCargoSupplyMaxById(cargoId,cityId){ return dbCityCargo.find(x=>((parseInt(x.cargoId) === parseInt(cargoId)) && (parseInt(x.cityId) === parseInt(cityId)))).supplyMax;}
    getCargoPriceById(cargoId,cityId){ return dbCityCargo.find(x=>((parseInt(x.cargoId) === parseInt(cargoId)) && (parseInt(x.cityId) === parseInt(cityId)))).price;}
    setCargoStock(cargoId,cityId,supply){
        let idx = dbCityCargo.findIndex(x=>((parseInt(x.cargoId) === parseInt(cargoId)) && (parseInt(x.cityId) === parseInt(cityId))));
        if(idx>=0){
            dbCityCargo[idx].supply = supply;
        }
    }

    getCargoNameById(cargoId){
        return dbCityCargo.find(x => (parseInt(x.cargoId) === parseInt(cargoId))).cargoName;
    }
    // ommitted - 设置城市-货物的锁定状态
    updateCityCargoLock(intCityId,intCargoId,intLockStatus){
        let idx = dbCityCargo.findIndex(x=>((parseInt(x.cargoId) === intCargoId) && (parseInt(x.cityId) === intCityId)));
        if(idx>=0){
            dbCityCargo[idx].locked = intLockStatus;
        }
    }

    // dbNPC
    getNPCById(nid) { return dbNPC.find(x => parseInt(x.npcId) === parseInt(nid));}

    // dbKF
    getKFById(kfId) {return dbKF.find(x => parseInt(x.kfId) === parseInt(kfId));}
    getQGById(refId){return dtQg.find(x => parseInt(x.qgId) === parseInt(refId));}
    getWGEById(refId){return dtWgE.find(x => parseInt(x.wgeId) === parseInt(refId));}
    getZLById(refId){return dbZl.find(x => parseInt(x.zlId) === parseInt(refId));}
    getZQById(refId){return dtZq.find(x => parseInt(x.zqId) === parseInt(refId));}
    getDBFById(refId){return dtDbf.find(x => parseInt(x.dbfId) === parseInt(refId));}
    getKFTierById(tier){return dbKFTier.find(x => parseInt(x.kfTier) === parseInt(tier));}

    getWGEByType(type){
        let ret = [];
        for(let i=0;i<dtWgE.length;i++){
            if(dtWgE[i].wgType == type){ ret.push(dtWgE[i].wgeId);}
        }
        return ret;
    }

    getTierObj(tier){return dbKFTier.find(x => parseInt(x.kfTier) === parseInt(tier));}
    getTierString(tier){return dbKFTier.find(x => parseInt(x.kfTier) === parseInt(tier)).kfTierName;}

    // dbItem
    getItemById(itemId){return dbItem.find(x => parseInt(x.itemId) === parseInt(itemId));}
    getItemNameById(itemId){return dbItem.find(x => parseInt(x.itemId) === parseInt(itemId)).itemName;}
    getItemStackById(itemId){return parseInt(dbItem.find(x => parseInt(x.itemId) === parseInt(itemId)).stack);}
    getItemByNameAndLevel(strName,intLevel){return dbItem.find(x => (x.itemName === strName) && (x.itemLevel === intLevel));}
    //dbShip
    getShipById(shipId){return dbShip.find(x => parseInt(x.shipId) === parseInt(shipId));}
    getShipCapacity(shipId,shipFitCargo){
        if(parseInt(shipId) <=0 ) return 0;
        let ship = dbShip.find(x => parseInt(x.shipId) === parseInt(shipId));
        return Math.floor(parseInt(ship.cargoMax) * (1 + shipFitCargo * 0.1));
    }

    // NPC sell
    getItemForSell(cityId,npcId){return dbCityItem.filter(x=> (parseInt(x.cityId)===parseInt(cityId)) && (parseInt(x.npcId)==parseInt(npcId)) && (parseInt(x.actId)==5));}
    getItemDetailForSell(cityId,npcId){
        let arr = gDB.getItemForSell(cityId,npcId);
        let ret = [];
        for(let i=0;i<arr.length;i++){
            let iobj = gDB.getItemById(arr[i].itemId);
            iobj.devLevel = arr[i].devLevel;
            iobj.stock = arr[i].stock;
            ret.push(iobj);
        }
        return ret;
    }
    getItemSellCity(intItemId){
        return dbCityItem.filter(x=>(parseInt(x.itemId) === parseInt(intItemId)));
    }

    // mob
    getMobsInZone(zoneId){return dbMobsInZone.filter(x => (parseInt(x.zone_id) === parseInt(zoneId))); }
    getMobById(mobId){ return dbMob.find(x=>(parseInt(x.mob_template_id) === parseInt(mobId)));}
    getMobSprite(intMobTemplateId){ return dbMob.find(x=>(parseInt(x.mob_template_id) === parseInt(intMobTemplateId))).sprite;}
    getMobSkillById(sId){ return dbMobSkills.find(x=>(parseInt(x.skill_id) === parseInt(sId)));}
    // getMobNGById(intMobNGId){return dbMobNGList.find(x=>(parseInt(x.dbfId) === parseInt(intMobNGId)));}

    // hill - meditation
    getHillById(zoneId){return dbHill.find(x=>(parseInt(x.zoneId) === parseInt(zoneId)));}
}();