/**
 * MiniMap Manager
 * Jim Dai 2023.09.04
 */

class MiniMapManager{
    constructor() {
        this.data = {
            'x':0,
            'y':0,
            'direction':0,
            'zoomLevel':4,
            'vw':0.25,
            'strMapWrap':'#miniMap',
            'strArrow':'#miniMapArrow img',
            'zoomMin':0.5,
            'zoomMax':4,
            'filterPort' : true,
            'filterCity' : true,
            'filterDungeon': true,
            'filterHill':true
        };
        this.instance = null;
        $("#miniMapZoomOut").on("click",function(){
            let miniMapIns = MiniMapManager.getInstance();
            miniMapIns.zoomOut();
        });
        $("#miniMapZoomIn").on("click",function(){
            let miniMapIns = MiniMapManager.getInstance();
            miniMapIns.zoomIn();
        });
        // $("#miniMapLeft").on("click",function(){ let miniMapIns = MiniMapManager.getInstance(); miniMapIns.setMapCenter(miniMapIns.data.x-10,miniMapIns.data.y);});

        $("#miniMapCollapse").on("click",function(){
            $("#btnInputKeyM").focus().click();
        });

        $("#miniMapFilterCity").on("click",function (){
            let miniMapIns = MiniMapManager.getInstance();
            miniMapIns.switchFilterCity();
        });
        $("#miniMapFilterPort").on("click",function (){
            let miniMapIns = MiniMapManager.getInstance();
            miniMapIns.switchFilterPort();
        });
        $("#miniMapFilterDungeon").on("click",function (){
            let miniMapIns = MiniMapManager.getInstance();
            miniMapIns.switchFilterDungeon();
        });
        $("#miniMapFilterHill").on("click",function (){
            let miniMapIns = MiniMapManager.getInstance();
            miniMapIns.switchFilterHill();
        });

        this.drawCities();
        this.drawFilters();
    }

    static getInstance(){
        if (this.instance) { return this.instance; }
        return this.instance = new MiniMapManager();
    }
    static isShow(){
        return ($("#miniMapDiv").css('display') === 'block');
    }

    showMap(){
        this.data.zoomLevel = 4;
        this.drawCities();
        this.drawFilters();
        this.updateMap(true);
        $("#miniMapDiv").show();
    }
    hideMap(){
        $("#miniMapDiv").hide();
    }

    /**
     * 以玩家为中心，zoomLevel=4 完全重制整个小地图
     * 用法：移动了地图，或者改变了游戏尺寸之后，解决小地图定位不准的问题
     */
    resetMap(){

    }

    /**
     * 以(x,y)为中心，展示小地图内容
     * 用法：查看上下左右部分地图
     */
    setMapCenter(x,y){

    }

    updateMap(bForce = false){
        if((!MiniMapManager.isShow())  && (!bForce)) return;
        canvasWidth = document.body.offsetWidth;    // 画面宽度
        canvasHeight = document.body.offsetHeight;  // 画面高度
        let mapW = this.data.vw * canvasWidth;
        let mapHalf = mapW * 0.5;
        let x = Math.floor(this.data.zoomLevel * dbPlayer[pId].worldPosX / 40 - mapHalf );    // 40像素一个tile 但是小地图10%
        let y = Math.floor(this.data.zoomLevel * dbPlayer[pId].worldPosY / 40 - mapHalf);


        $("#miniMap").css('transform',"scale("+this.data.zoomLevel/4+")");

        let disX = 0 - x;
        let disY = 0 - y;
        if((x !== this.data.x) || (y !== this.data.y) || bForce){
            $(this.data.strMapWrap).css("top",disY+"px").css("left",disX+"px");
            this.data.x = x;
            this.data.y = y;
        }
        if(dbPlayer[pId].worldDirection === undefined){
            dbPlayer[pId].worldDirection = 0;
        }
        if((dbPlayer[pId].worldDirection !== this.data.direction) || bForce){
            this.data.direction = dbPlayer[pId].worldDirection;
            $(this.data.strArrow).css("transform","rotate("+this.data.direction+"deg)");
            // switch (this.data.direction){
            //     case 'north':
            //         $(this.data.strArrow).css("transform","rotate(0deg)");
            //         break;
            //     case 'south':
            //         $(this.data.strArrow).css("transform","rotate(180deg)");
            //         break;
            //     case 'west':
            //         $(this.data.strArrow).css("transform","rotate(-90deg)");
            //         break;
            //     case 'east':
            //         $(this.data.strArrow).css("transform","rotate(90deg)");
            //         break;
            //     default:
            //         break;
            // }
        }
    }

    zoomOut(){
        if(!MiniMapManager.isShow()) return;
        this.data.zoomLevel = this.data.zoomLevel / 2;
        this.data.zoomLevel = this.data.zoomLevel <= this.data.zoomMin ? this.data.zoomMin : this.data.zoomLevel;
        this.updateMap(true);
        this.setZoomForCites(4/this.data.zoomLevel);
        $("#miniMapCity .zone").css("overflow","hidden");
    }
    zoomIn(){
        if(!MiniMapManager.isShow()) return;
        this.data.zoomLevel = this.data.zoomLevel * 2;
        this.data.zoomLevel = this.data.zoomLevel >= this.data.zoomMax ? this.data.zoomMax : this.data.zoomLevel;
        this.updateMap(true);
        this.setZoomForCites(4/this.data.zoomLevel);
        $("#miniMapCity .zone").css("overflow",'visible');
    }

    drawCities(){
        let str = '';
        let hw = 16;  // 32px 中间是16px
        for(let i=0;i<dbCity.length;i++){
            if(dbCity[i].zType === 'pass') continue;
            if( dbCity[i].zoneId === 115) continue;
            if(dbCity[i].zType === 'city'){
                if(!this.data.filterCity) continue;
            }else if(dbCity[i].zType === 'port'){
                if(!this.data.filterPort) continue;
            }else if(dbCity[i].zType === 'hill'){
                if(!this.data.filterHill) continue;
            }else if(dbCity[i].zType === 'dungeon'){
                if(!this.data.filterDungeon) continue;
            }
            let x = dbCity[i].tileX * 4 - hw;    // 因为png地图是4000x4000，tile是 1000x1000
            let y = dbCity[i].tileY * 4 - hw;
            // updated 20240515 , 解决英文地名的缩写问题
            // let n = getFirstTwoChars(dbCity[i].zoneName);
            // let n = dbCity[i].zoneName.substring(0,2);
            let n = dbCity[i].zoneName;
            let theme = (dbCity[i].zType === 'dungeon') ? 'danger' : 'success';
            theme =  (dbCity[i].zType === 'chest') ? 'warning' : theme;
            theme =  (dbCity[i].zType === 'port') ? 'info' : theme;
            let tmpStr = "<div class='zone bg-"+theme+"' style='left:"+x+"px;top:"+y+"px' id='mini-map-zone-"+dbCity[i].zoneId+"'>"+n+"</div>";
            str += tmpStr;
        }
        $("#miniMapCity").html(str);
        this.updateCityHalo();
    }
    drawFilters(){
        if(this.data.filterCity){
            $("#miniMapFilterCity").removeClass("btn-secondary").addClass("btn-primary");
        }else{
            $("#miniMapFilterCity").removeClass("btn-primary").addClass("btn-secondary");
        }
        if(this.data.filterPort){
            $("#miniMapFilterPort").removeClass("btn-secondary").addClass("btn-primary");
        }else{
            $("#miniMapFilterPort").removeClass("btn-primary").addClass("btn-secondary");
        }
        if(this.data.filterDungeon){
            $("#miniMapFilterDungeon").removeClass("btn-secondary").addClass("btn-primary");
        }else{
            $("#miniMapFilterDungeon").removeClass("btn-primary").addClass("btn-secondary");
        }
        if(this.data.filterHill){
            $("#miniMapFilterHill").removeClass("btn-secondary").addClass("btn-primary");
        }else{
            $("#miniMapFilterHill").removeClass("btn-primary").addClass("btn-secondary");
        }
    }
    switchFilterCity(){
        this.data.filterCity = !this.data.filterCity;
        this.drawCities();
        this.drawFilters();
        this.updateMap(true);
        this.setZoomForCites(4/this.data.zoomLevel);
    }
    switchFilterPort(){
        this.data.filterPort = !this.data.filterPort;
        this.drawCities();
        this.drawFilters();
        this.updateMap(true);
        this.setZoomForCites(4/this.data.zoomLevel);
    }
    switchFilterDungeon(){
        this.data.filterDungeon = !this.data.filterDungeon;
        this.drawCities();
        this.drawFilters();
        this.updateMap(true);
        this.setZoomForCites(4/this.data.zoomLevel);
    }
    switchFilterHill(){
        this.data.filterHill = !this.data.filterHill;
        this.drawCities();
        this.drawFilters();
        this.updateMap(true);
        this.setZoomForCites(4/this.data.zoomLevel);
    }

    setZoomForCites(nZoomLv){
        let z = nZoomLv >=4 ? 4 : nZoomLv;
        z = nZoomLv <= 1 ? 1 : nZoomLv;
        $("#miniMapCity .zone").each(function(){
            $(this).css("transform",'scale('+z+')');
        })
    }
    updateCityHalo(){
        $("#miniMapCity .zone").removeClass("active");
        let tasks = dbPlayer[pId].taskActive;
        for(let i=0;i<tasks.length;i++){
            let t = gDB.getTaskById(tasks[i]);
            if(t.condition && t.condition[0]===2){
                if(t.zone_id !== 0){ // 在 zone 击杀怪物
                    $("#mini-map-zone-"+t.zone_id).addClass("active");
                }
            }

            $("#mini-map-zone-"+t.receiverCityId).addClass("active");
        }
    }
}