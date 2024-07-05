/**
 * Created by jim on 2020/5/11.
 */

class BuffWidget{
    constructor(){
        this.ngaId = -1;
        this.qgaId = -1;
        this.horseId = -1;
        this.food = -1;
        this.strCached = '';
        this.instance = null;
    }
    static getInstance(){
        if (this.instance) { return this.instance; }
        return this.instance = new BuffWidget();
    }

    updateWithCache(){
        if(gApp.difficulty === 1) { // 简单难度 - 计算激活的内功 轻功
            if (this.strCached === '' || this.ngaId !== dbPlayer[pId].ngaId
                || this.qgaId !== dbPlayer[pId].qgaId
                || this.horseId !== dbPlayer[pId].horseId
                || this.food !== dbPlayer[pId].food
            ) {
                this.ngaId = dbPlayer[pId].ngaId;
                this.qgaId = dbPlayer[pId].qgaId;
                this.horseId = dbPlayer[pId].horseId;
                this.food = dbPlayer[pId].food;
                this.strCached = BuffWidget.updateBuff();
            }
        }else{
            let ngStr = "";
            for(let i=0;i<dbPlayer[pId].ngList.length;i++){
                ngStr += (dbPlayer[pId].ngList[i].kfId + ",");
            }
            let qgStr = "";
            for(let i=0;i<dbPlayer[pId].qgList.length;i++){
                qgStr += (dbPlayer[pId].qgList[i].kfId + ",");
            }
            if (this.strCached === '' || this.ngaId !== ngStr
                || this.qgaId !== qgStr
                || this.horseId !== dbPlayer[pId].horseId
                || this.food !== dbPlayer[pId].food
            ) {
                this.ngaId = ngStr;
                this.qgaId = qgStr;
                this.horseId = dbPlayer[pId].horseId;
                this.food = dbPlayer[pId].food;
                this.strCached = BuffWidget.updateBuff();
            }
        }
    }

    static updateBuff(){
        let str = '<div id="div_buff">';
        // wg - update 20201217 现在外功不存在激活，因此此部分代码弃用
        // if(dbPlayer[pId].wgaId >=0) {
        //     //let wgObj = KFModel.initWithLevel(dbPlayer[pId].wgList[dbPlayer[pId].wgaId].kfId,dbPlayer[pId].wgList[dbPlayer[pId].wgaId].kfLevel);
        //     let wgObj = dbPlayer[pId].wgObj;
        //     let wqIcon = KFModel.getWgeIcon(wgObj.refObj.wgeType);
        //     str += '<div class="bw-buff-wrap"> '+wqIcon+' <span>'+wgObj.dbObj.kfName+'('+wgObj.wgeDmgActive+')</span> </div>';
        //     if(wgObj.dbfObj != undefined){
        //         let dbfIcon = KFModel.getDbfIcon(wgObj.dbfObj.dbfId);
        //         str += '<div class="bw-buff-wrap"><i class="'+dbfIcon+'"></i><span>'+wgObj.dbfObj.dbfName+'</span> </div>';
        //     }
        // }
        // ng - zq
        if(gApp.difficulty === 1){
            if(dbPlayer[pId].ngaId >=0) {
                //let ngObj = KFModel.initWithLevel(dbPlayer[pId].ngList[dbPlayer[pId].ngaId].kfId,dbPlayer[pId].ngList[dbPlayer[pId].ngaId].kfLevel);
                let ngObj = dbPlayer[pId].ngObj;
                let zqIcon = KFModel.getZqIcon(ngObj.dbObj.refId);
                let zqName = ngObj.refObj.zqName;
                zqName = getFirstTwoChars(zqName);
                str += '<div class="bw-buff-wrap"> <i class="'+zqIcon+'"></i> <span>'+zqName+'</span> </div>';
            }
            // qg
            if(dbPlayer[pId].qgaId >=0){
                //let qgObj = KFModel.initWithLevel(dbPlayer[pId].qgList[dbPlayer[pId].qgaId].kfId,dbPlayer[pId].qgList[dbPlayer[pId].qgaId].kfLevel);
                let qgObj = dbPlayer[pId].qgObj;
                let qgName = getFirstTwoChars(qgObj.dbObj.kfName);
                str += '<div class="bw-buff-wrap"> <i class="iconfont icon-fast1"></i> <span>'+qgName+'</span> </div>';
            }
        }else{
            let pObj = dbPlayer[pId];
            for(let i=0;i<pObj.ngList.length;i++){
                if(!pObj.ngList[i]) continue;
                if(!pObj.ngList[i].kfId) continue;
                let tmpObj = KFModel.initWithLevel(pObj.ngList[i].kfId,pObj.ngList[i].kfLevel);
                let zqIcon = KFModel.getZqIcon(tmpObj.dbObj.refId);
                let zqName = tmpObj.refObj.zqName;
                zqName = getFirstTwoChars(zqName);
                str += '<div class="bw-buff-wrap"> <i class="'+zqIcon+'"></i> <span>'+zqName+'</span> </div>';
            }
            for(let i=0;i<pObj.qgList.length;i++){
                if(!pObj.qgList[i]) continue;
                if(!pObj.qgList[i].kfId) continue;
                let tmpQObj = KFModel.initWithLevel(pObj.qgList[i].kfId,pObj.qgList[i].kfLevel);
                let oName = getFirstTwoChars(tmpQObj.dbObj.kfName);
                str += '<div class="bw-buff-wrap"> <i class="iconfont icon-fast1"></i> <span>'+oName+'</span> </div>';
            }
        }

        // 骑马
        if(dbPlayer[pId].horseId >0){
            str += '<div class="bw-buff-wrap" onclick="BuffWidget.offHorse()"> <i class="iconfont icon--horse"></i> <span>'+globalStrings.RIDE+'</span> </div>';
        }
        // 饥饿
        // if(dbPlayer[pId].food <=30){
        //     str += '<div class="bw-buff-wrap"> <i class="iconfont icon-confused"></i> <span>饥饿</span> </div>';
        // }
        if(dbPlayer[pId].food >100) {
            // full debuff
            str += '<div class="bw-buff-wrap"> <i class="iconfont icon-happy"></i> <span>'+globalStrings.DBF_SATIETY+'</span> </div>';
        }
        str += "</div><div id='div_de_buff'>";
        // str = str + '<div class="bw-buff-wrap"> <i class="iconfont icon-frozen"></i> <span>debug</span> </div>';
        // str = str + '<div class="bw-buff-wrap"> <i class="iconfont icon-bomb_exploded"></i> <span>debug</span> </div>';
        // str = str + '<div class="bw-buff-wrap"> <i class="iconfont icon-Weaken"></i> <span>debug</span> </div>';
        // str = str + '<div class="bw-buff-wrap"> <i class="iconfont icon-Hurt"></i> <span>debug</span> </div>';
        str = str + "</div>";
        $("#buffWidget").html(str);
        return str;
    }

    static offHorse(){
        // 20220217 remove particles
        // game.scene.scenes[0].createEllipseEffect();
        dbPlayer[pId].horseId = 0;
        // game.scene.scenes[0].player.moveOn('foot');
        game.scene.getScene("WorldScene").player.moveOn("foot");
        CharacterModel.calcTotalState();
    }
}