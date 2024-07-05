/**
 * Created by jim on 2020/3/25.
 */

let puzzleModal = new class{
    // object properties
    exp = 0;
    constructor() {
        $("#puzzleOK").on('click',function () {
            puzzleModal.handlerPuzzleDone();
        });
        this.data = {};
        this.data.charArr = [];
        this._initCharData();
        this.data.animateDoneCharCount = 0;
        this.data.charCount = 0;
    }

    _charRainJoinArr(arr) {
        let cArr = [];
        for (let i = 0; i < arr.length; i++) {
            let s = arr[i].content.split('');
            // console.log(s);
            cArr = cArr.concat(s);
        }
        // remove |
        this.data.charArr = cArr.filter(item => item !== "|");
    }
    _initCharData() {
        this._charRainJoinArr(dbPoem);
        // console.log(this.data.charArr);
    }
    _animateThisChar(i,j,oriChar,count){
        let ms = Math.random() * 100 + 50;
        if(count < 10){
            count++;
            let ch = puzzleModal.data.charArr[ Math.floor( Math.random() * puzzleModal.data.charArr.length) ];
            $("#poem-"+i+"-"+j).html(ch);
            setTimeout(puzzleModal._animateThisChar,ms,i,j,oriChar,count);
        }else{
            $("#poem-"+i+"-"+j).html(oriChar);
            puzzleModal.data.animateDoneCharCount++ ;
            if(puzzleModal.data.animateDoneCharCount >= puzzleModal.data.charCount ){
                setTimeout(function(){
                    $("#puzzleModalBody .btn-arrow-up").css("visibility","visible");
                    $("#puzzleModalBody .btn-arrow-down").css("visibility","visible");
                    $("#puzzleModalBody .btn-arrow-left").css("visibility","visible");
                    $("#puzzleModalBody .btn-arrow-right").css("visibility","visible");
                },500);
            }
        }
    }

    // shared functions
    drawPuzzleModal(po,npcId,bId,cId){
        if(po === undefined){ return }

        let pc = po.content.split("|");
        $("#puzzleModal .modal-title").html(po.title);
        $("#puzzleContentOriginal").val(po.content);
        this.exp = this.getExp(pc.length,pc[0].length);
        let str = "<div class='row'><div class='col-1 offset-1 btn-arrow-left'></div>";
        for(let c=0;c<pc[0].length;c++){
            str += "<button class='btn btn-sm btn-primary col-1 btn-arrow-up' onclick='puzzleModal.utilPuzzleMove0("+c+")'> <i class='iconfont icon-T_shangjiantou_sjt'></i> </button>";
        }
        str+="</div>";
        //str+="<div class='row'><button class='btn btn-sm btn-default col-1'>&nbsp;</button></div>";

        str += "<div id='puzzleModalBodyPoem'>";
        for(let i=0;i<pc.length;i++){
            str += "<div class='row poem-row' id='poem-row-"+i+"'><div class='col-1'></div><button class='btn btn-sm btn-primary col-1 btn-arrow-left' onclick='puzzleModal.utilPuzzleMove3("+i+")'> <i class='iconfont icon-zuojiantou'></i> </button>";
            for(let j=0;j<pc[0].length;j++){
                str+="<button id='poem-"+i+"-"+j+"' class='btn btn-sm btn-default col-1 poem-col poem-col-"+j+"'></button>";
            }
            str += "<button class='btn btn-sm btn-primary col-1 btn-arrow-right' onclick='puzzleModal.utilPuzzleMove1("+i+")'> <i class='iconfont icon-youjiantou'></i> </button></div>";
        }
        str+="</div>";

        str += "<div class='row'><div class='col-1 offset-1 btn-arrow-left'></div>";
        for(let c=0;c<pc[0].length;c++){
            str += "<button class='btn btn-sm btn-primary col-1  offset-1 btn-arrow-down' onclick='puzzleModal.utilPuzzleMove2("+c+")'> <i class='iconfont icon-T_xiajiantou_xjt'></i> </button>";
        }
        str += "</div>";
        $("#puzzleModalBody").html(str).data('poem_id',po.id)
            .data('npcId',npcId).data('bId',bId).data('cId',cId);
        let raw = puzzleModal.utilPuzzleEncode(10,pc).join("|");
        puzzleModal.drawPuzzleContent(raw);

        $("#puzzleOK").attr('disabled',true);
        $("#puzzleModal").modal('show');

        $("#puzzleModalBody .btn-arrow-up").css("visibility","hidden");
        $("#puzzleModalBody .btn-arrow-down").css("visibility","hidden");
        $("#puzzleModalBody .btn-arrow-left").css("visibility","hidden");
        $("#puzzleModalBody .btn-arrow-right").css("visibility","hidden");
        this.data.animateDoneCharCount = 0;

        for(let i=0;i<pc.length;i++){
            for(let j=0;j<pc[0].length;j++){
                puzzleModal._animateThisChar(i,j,pc[i][j],0);
            }
        }


    }

    drawPuzzleContent(pc){
        let pa = pc.split("|");
        this.data.charCount = 0;
        for(let i=0;i<pa.length;i++){
            for(let j=0;j<pa[0].length;j++){
                $("#poem-"+i+"-"+j).html(pa[i][j]);
                this.data.charCount++ ;
            }
        }
    }

    // util - private functions

    utilPuzzleGetModalContent(){
        let rows = $("#puzzleModalBody .poem-row").length;
        let cols = $("#puzzleModalBody #poem-row-0").children('.poem-col').length;
        let str = "";
        for(let i=0;i<rows;i++){
            for(let j=0;j<cols;j++){
                str += $("#poem-"+i+"-"+j).html();
            }
            str = (i == rows-1) ? str : (str + "|");
        }
        return str;
    }

    // kick off puzzle game
    utilPuzzleEncode(moveTimes,arr){
        let rowCount = arr.length;
        let colCount = arr[0].length;

        for(let i=0;i<moveTimes;i++){
            let row = Math.floor(Math.random()*rowCount);
            let col = Math.floor(Math.random()*colCount);
            let act = Math.floor(Math.random()*4);  // 0 1 2 3
            switch(act){
                case 0:
                    arr = puzzleModal.utilPuzzleM0(col,arr);
                    break;
                case 1:
                    arr = puzzleModal.utilPuzzleM1(row,arr);
                    break;
                case 2:
                    arr = puzzleModal.utilPuzzleM2(col,arr);
                    break;
                case 3:
                    arr = puzzleModal.utilPuzzleM3(row,arr);
                    break;
                default:
                    break;
            }
        }
        return arr;
    }
    utilPuzzleValidate(){
        let cur = puzzleModal.utilPuzzleGetModalContent();
        let ori = $("#puzzleContentOriginal").val();
        let len = ori.length;
        if(len<=0) return;
        if(cur === ori){
            gGui.playSoundEffect('succ');
            return true;
        }else{
            return false;
        }
    }
    handlerPuzzleDone(){
        gGui.playSoundEffect();
        if(this.utilPuzzleValidate){
            // 获得经验
            // console.log("gain exp："+this.exp);
            CharacterModel.gainExp(this.exp,'adventure');
            // 判断是否是在 任务的观察列表
            let intPoemId = parseInt($("#puzzleModalBody").data('poem_id'));
            if(intPoemId > 0){
                CharacterModel.addPoemCountForTask(intPoemId);
            }
            // 关闭当前对话框
            $("#puzzleModal").modal('hide');
            // npchail
            // 刷新npc action List - 如果完成了诗词任务，需要刷新
            let npcId =  $("#puzzleModalBody").data('npcId');
            let bId = $("#puzzleModalBody").data('bId');
            let cId = $("#puzzleModalBody").data('cId');
            gGui.drawNPCActions(npcId,bId,cId);
            $("#npcHail").html(globalStrings.PUZZLE_DONE+ toReadableString(this.exp)+globalStrings.EOL);
        }
    }

    // model move / data - arr move
    utilPuzzleM3(row,arr){      // left
        gGui.playSoundEffect();
        let one = arr[row].substr(0,1);
        arr[row] = arr[row].slice(1);
        arr[row] = arr[row] + one;
        return arr;
    }
    utilPuzzleM1(row,arr){      // right
        gGui.playSoundEffect();
        let last = arr[row].substr(arr[row].length - 1,1);
        arr[row] = arr[row].slice(0,arr[row].length - 1);
        arr[row] = last + arr[row];
        return arr;
    }
    utilPuzzleM0(col,arr){      // up
        gGui.playSoundEffect();
        let tmp = arr[0][col];
        for(let i=0;i<arr.length;i++){
            let head = arr[i].substr(0,col);
            let tail = arr[i].substr(col+1);
            if(i!=arr.length-1){
                arr[i] = head + arr[i+1][col] + tail;
            }else{
                arr[i] = head + tmp + tail;
            }
        }
        return arr;
    }
    utilPuzzleM2(col,arr){      // down
        gGui.playSoundEffect();
        let tmp = arr[arr.length-1][col];
        for(let i=arr.length - 1;i>=0;i--){
            let head = arr[i].substr(0,col);
            let tail = arr[i].substr(col+1);
            if(i!=0){
                arr[i] = head + arr[i-1][col] + tail;
            }else{
                arr[i] = head + tmp + tail;
            }
        }
        return arr;
    }

    // gui move
    utilPuzzleMove3(row){   // left
        gGui.playSoundEffect();
        let str = puzzleModal.utilPuzzleGetModalContent();
        $("#poem-row-"+row + " button.poem-col").addClass('slideInRight animated');
        let arr = str.split("|");
        arr = puzzleModal.utilPuzzleM3(row,arr);
        let ret = arr.join("|");
        puzzleModal.drawPuzzleContent(ret);
        setTimeout(function () { $("#poem-row-"+row + " button.poem-col").removeClass('slideInRight animated');},200);
        if(puzzleModal.utilPuzzleValidate()){ $("#puzzleOK").removeAttr('disabled'); } else { $("#puzzleOK").attr('disabled',true);}
    }
    utilPuzzleMove1(row){   // right
        gGui.playSoundEffect();
        let str = puzzleModal.utilPuzzleGetModalContent();
        $("#poem-row-"+row + " button.poem-col").addClass('slideInLeft animated');
        let arr = str.split("|");
        arr = puzzleModal.utilPuzzleM1(row,arr);
        let ret = arr.join("|");
        puzzleModal.drawPuzzleContent(ret);
        setTimeout(function () { $("#poem-row-"+row + " button.poem-col").removeClass('slideInLeft animated');},200);
        if(puzzleModal.utilPuzzleValidate()){ $("#puzzleOK").removeAttr('disabled'); } else { $("#puzzleOK").attr('disabled',true);}
    }
    utilPuzzleMove0(col){   // up
        gGui.playSoundEffect();
        let str = puzzleModal.utilPuzzleGetModalContent();
        $("#puzzleModalBodyPoem button.poem-col-"+col).addClass('slideInUp animated');
        let arr = str.split("|");
        arr = puzzleModal.utilPuzzleM0(col,arr);
        let ret = arr.join("|");
        puzzleModal.drawPuzzleContent(ret);
        setTimeout(function () { $("#puzzleModalBodyPoem button.poem-col-"+col).removeClass('slideInUp animated');},200);
        if(puzzleModal.utilPuzzleValidate()){ $("#puzzleOK").removeAttr('disabled'); } else { $("#puzzleOK").attr('disabled',true);}
    }
    utilPuzzleMove2(col){   // down
        gGui.playSoundEffect();
        let str = puzzleModal.utilPuzzleGetModalContent();
        $("#puzzleModalBodyPoem button.poem-col-"+col).addClass('slideInDown animated');
        let arr = str.split("|");
        arr = puzzleModal.utilPuzzleM2(col,arr);
        let ret = arr.join("|");
        puzzleModal.drawPuzzleContent(ret);
        setTimeout(function () { $("#puzzleModalBodyPoem button.poem-col-"+col).removeClass('slideInDown animated');},200);
        if(puzzleModal.utilPuzzleValidate()){ $("#puzzleOK").removeAttr('disabled'); } else { $("#puzzleOK").attr('disabled',true);}
    }

    getExp(row,col){
        return (row*col)*(col*col)*(Math.pow(2,row));
    }

}();