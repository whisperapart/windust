/**
 * Travel related ,
 * 2023.10.04
 */

class gTravelManager{
    // 是否已经访问过这个城市 - 主要用于控制：没有到达过的城市无法驿站快速移动
    static isVisited(intZoneId,visitedArray){
        return (visitedArray.indexOf(intZoneId) !== -1);
    }
}

// 陆地 驿站 的快速移动服务
class HorseTravelModal{
    static strSelector = "#horseTravelModal";
    static ssBtnOK = "#horseTravelMapOK";
    // 计算两个zone之间的最短距离， INF 表示 无法到达
    static getDis(intZoneIdFrom, intZoneIdTo){
        let idxF = cityGraphIdArray.indexOf(intZoneIdFrom);
        let idxT = cityGraphIdArray.indexOf(intZoneIdTo);
        if (idxF === -1 || idxT === -1) return INF;
        return cityGraphPath[idxF][idxT];
    }

    // 获取所有可以驿站快速到达的城市,没有到达过的城市无法驿站快速移动
    // @return [{zoneId:int,distance:int}]
    static getTravelAbleZones(intZoneId,visitedArray){
        let idxF = cityGraphIdArray.indexOf(intZoneId);
        if (idxF === -1 ) return [];
        let zones = cityGraphPath[idxF];
        let ableZ = [];

        for(let i=0;i<zones.length;i++){
            let v = INF;
            let zid = cityGraphIdArray[i];  // cityId
            if(zones[i] === 0 || zones[i] === INF){ // 自己到自己，或者本来就无法到达
                v = zones[i];
            }else{          // 原本可以到达，检查是否访问过
                if(gTravelManager.isVisited(zid,visitedArray)){
                    v = zones[i];       // 访问过
                }else{
                    v = INF;        // 没有访问过，设置为INF
                }
            }
            // ableZ.push({'zoneId':zid,'distance':v});
            if((v !== 0) && ( v!== INF) ){
                ableZ.push({'zoneId':zid,'distance':v});
            }
        }
        return ableZ;
    }

    static getInstance(){
        if (this.instance) { return this.instance; }
        return this.instance = new HorseTravelModal();
    }

    static isShow(){
        return ($(HorseTravelModal.strSelector).css('display') === 'block');
    }
    static hideModal(){
        $(HorseTravelModal.strSelector).modal('hide');
    }
    static animateShakeThis(ele){
        gGui.playSoundEffect("fail");
        $(ele).addClass("animated headShake");
        setTimeout(function () { $(ele).removeClass("animated headShake"); },1000);
    }
    // 静态函数 - 该弹窗的控制函数
    static drawModal(){
        $(".modal").modal('hide');
        HorseTravelModal.updateModelContent();
        $(HorseTravelModal.ssBtnOK).attr('disabled',true);
        $(HorseTravelModal.strSelector).modal('show');
    }
    static updateModelContent(){
        let ccO = gDB.getCityById(dbPlayer[pId].zoneId);
        $("#horseTravelDeparture").val(ccO.zoneName);
        $("#horseTravelArrival").val(globalStrings.ARRIVAL);
        $("#horseTravelCharge").val(globalStrings.CHARGE);
        let ableZ = HorseTravelModal.getTravelAbleZones(parseInt(dbPlayer[pId].zoneId),dbPlayer[pId].visitedCity);
        // draw map

        // draw current city
        // ableZ.unshift({'zoneId':dbPlayer[pId].zoneId,'distance':0});

        // draw cities
        let str = '';
        let hw = 12;  // 24px 中间是12px
        let width = $("#horseTravelMapArea").width();
        let height = $("#horseTravelMapArea").height();
        let xRatio = width / 1000;  // 地图尺寸是1000
        let yRatio = height / 1000;

        // let maskStr = "-webkit-mask-image: radial-gradient(circle at 240px 120p,transparent 32px, black 64px);"
        let maskArr = [];
        // todo: 应该把所有的city 都在地图标记，但是用不同颜色表示能否到达。
        for(let i=0;i<dbPlayer[pId].visitedCity.length;i++){
            let city = gDB.getCityById(dbPlayer[pId].visitedCity[i]);
            let x =  (city.tileX - hw) * xRatio;    // 因为png地图是4000x4000，tile是 1000x1000
            let y = (city.tileY - hw) * yRatio;
            let n = city.zoneName.substring(0,1);
            // let theme = 'success';
            let tmpStr = "<div class='zone btn btn-dark' style='left:"+x+"px;top:"+y+"px' id='horse-map-zone-"+city.zoneId+"' onclick='horseTravelModal.setArrival("+city.zoneId+")'>"+n+"</div>";
            str += tmpStr;
            let mx = x + hw;
            let my = y + hw;
            maskArr.push('radial-gradient(circle at '+mx+'px '+my+'px,transparent 16px, black 40px)');

        }
        $("#horseTravelMapCity").html(str);
        $("#horseTravelMapMask").css('-webkit-mask-image',maskArr.join(","));

        // 当前城市
        $("#horse-map-zone-"+dbPlayer[pId].zoneId).removeClass("btn-dark").addClass("btn-info zactive");

        for(let i=0;i<ableZ.length;i++){
            $("#horse-map-zone-"+ableZ[i].zoneId).removeClass("btn-dark").addClass("btn-success");
        }


    }

    setArrival(zid){
        let intArrivalId = parseInt(zid);
        let arrivalCity = gDB.getCityById(intArrivalId);
        if(intArrivalId === dbPlayer[pId].zoneId){
            // gGui._npcHail(64,"驿长","",true);
            $("#npcHail").html(arrivalCity.zoneName+globalStrings.TRAVEL_1);
            $("#horseTravelArrival").val(globalStrings.ARRIVAL);
            $("#horseTravelCharge").val(globalStrings.CHARGE);
            $(HorseTravelModal.ssBtnOK).attr('disabled',true);
        }else{
            let ableZ = HorseTravelModal.getTravelAbleZones(parseInt(dbPlayer[pId].zoneId),dbPlayer[pId].visitedCity);
            let match = -1;
            for(let i=0;i<ableZ.length;i++){
                if(ableZ[i].zoneId === intArrivalId){
                    let charge = ableZ[i].distance*GlobalConfig.HORSE_TRAVEL_FEE;
                    $("#npcHail").html(globalStrings.TRAVEL_2+arrivalCity.zoneName+globalStrings.TRAVEL_3+toReadableString(charge)+globalStrings.EOL);
                    $("#horseTravelCharge").val(toReadableString(charge));
                    $("#horseTravelArrival").val(arrivalCity.zoneName);
                    match = 1;
                    this.data.arrivalId = intArrivalId;
                    this.data.charge = charge;
                    $(HorseTravelModal.ssBtnOK).attr('disabled',false);
                    break;
                }
            }
            if(match === -1){
                $("#npcHail").html(globalStrings.TRAVEL_4+arrivalCity.zoneName+globalStrings.EOL);
                $("#horseTravelCharge").val(globalStrings.CHARGE);
                $("#horseTravelArrival").val(arrivalCity.zoneName);
                $(HorseTravelModal.ssBtnOK).attr('disabled',true);
            }
        }
    }
    horseTravel(){
        if(!CharacterModel.hasHorse()){
            $("#npcHail").html(globalStrings.TRAVEL_NO_HORSE);
            $(HorseTravelModal.ssBtnOK).attr('disabled',true);
            return;
        }
        if(horseTravelModal.data.charge > dbPlayer[pId].money){
            $("#npcHail").html(globalStrings.TRAVEL_COST_INFO+toReadableString(horseTravelModal.data.charge)+globalStrings.TRAVEL_NO_MONEY);
            $(HorseTravelModal.ssBtnOK).attr('disabled',true);
        }else{
            CharacterModel.gainMoney(0 - horseTravelModal.data.charge);
            gApp.leaveZone();
            let zone = gDB.getCityById(horseTravelModal.data.arrivalId);
            game.scene.getScene("WorldScene").player.moveTo(zone.landExitX*40+20,zone.landExitY*40+20);
            game.scene.getScene("WorldScene").updateEnvironment();
        }
    }

    constructor() {
        this.instance = null;
        this.data = {
            'arrivalId':-1,
            'charge':0
        };
        $(HorseTravelModal.ssBtnOK).on("click",this.horseTravel);
    }

}

let horseTravelModal = HorseTravelModal.getInstance();

class shipTravelManager{

}