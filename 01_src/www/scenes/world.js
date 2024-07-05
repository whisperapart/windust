/**
 * Created by jim on 2020/10/9.
 */

class WorldScene extends Phaser.Scene {
    player;
    ship;
    gameMap;
    mapLayer = new Map();
    playerDepth = 10;
    cameraZoom = 1.0;
    cameraZoom_max = 1.5;
    cameraZoom_min = 0.75;
    ellipseParticle;
    particleEmmiter;
    playerChunkID = -1;
    flagReBindTap = false;
    flagNextUpdateReBindTap = false;
    _seSprite = {};
    _bgSprite = {};

    // _tileMapInJson = 'assets/maps/world/map_o_1000_20201001_8.json';
    // _tileMapInJson = 'assets/maps/world/map_o_1000_20220211.json';
    _tileSetImageArr = ["assets/maps/world/wang_tile_v4_ext_2.png",
        "assets/maps/world/cliff_v3_ext_2.png",
        "assets/maps/world/buildings.png",
        "assets/maps/world/buildings_s.png",
        "assets/maps/world/rock.png"
    ];
    _tileSetNameArr = ["ground","cliff","buildings","buildings_s","rocks"];
    _tileLayerNameArr = ["earth","decoration"];
    // _playerAtlas = './assets/player/atlas.png';
    // _playerInJson = './assets/player/player.json';

    _playerAtlas = 'assets/sprits/character/chomoo.png';
    _playerAtlasWd = 'assets/sprits/character/wonda.png';
    _playerAtlasWe = 'assets/sprits/character/woner.png';
    _playerInJson = 'assets/sprits/character/chomoo.json';
    _playerInJsonWd = 'assets/sprits/character/wonda.json';
    _playerInJsonWe = 'assets/sprits/character/woner.json';

    _shipAtlas = 'assets/sprits/ship/ship.png';
    _shipInJson = 'assets/sprits/ship/ship.json';

    _horseAtlasXq = 'assets/sprits/horse/chomoo_horse.png';
    _horseAtlasWd = 'assets/sprits/horse/wonda_horse.png';
    _horseAtlasWe = 'assets/sprits/horse/woner_horse.png';
    _horseInJsonXq = 'assets/sprits/horse/chomoo_horse.json';
    _horseInJsonWd = 'assets/sprits/horse/wonda_horse.json';
    _horseInJsonWe = 'assets/sprits/horse/woner_horse.json';

    _mobList = [];  // 包括所有mob 名称的列表
    _mobArr = []; // 所有 Mob 的 Controller 对象

    _musicInstanceMap = new Map();
    _musicThemeRandomKeyList = ["theme_boreas","theme_cold_wind","theme_forest","theme_magical","theme_rain_sad","theme_old_city"];
    // _musicBattleRandomKeyList = ["battle_boss_epic","battle_encounter","battle_encounter_loop","battle_in_the_winter","battle_mystical","battle_rain_long"];

    // used for chunk-loading
    displayedChunks = [];
    maps = {};
    chunkWidth = 0;
    chunkHeight = 0;
    nbChunksHorizontal = 0;
    nbChunksVertical = 0;
    lastChunkID = 0;
    mapWidthTotal = 0;
    mapHeightTotal = 0;
    // chunkUrl = 'assets/maps/world/chunks_x_400/';
    // chunkUrl = 'assets/maps/world/chunks_x_400_2/';
    // updated 2023.05.03 new map
    chunkUrl = 'assets/maps/world/chunks_x_400_3/';
    chunkColliderArr = [];
    playerChunkX = 0;
    playerChunkY = 0;
    anchor_move_ctrl_origin_x = 0;  // 屏幕移动虚拟按键中心位置 - createCamera 的时候赋值
    anchor_move_ctrl_origin_y = 0 ;
    move_ctrl_radius = 0;   // 屏幕移动虚拟按键的半径
    move_ctrl_jump_radius = 0;  // 这个半径内认为按的是跳/ 骑马，中心圆环
    arrow_right = false;    // 方向箭头，用来跟踪移动端输入
    arrow_up = false;
    arrow_down = false;
    arrow_left = false;
    arrow_center = false; arrow_center_cd = 0; arrow_center_cd_max=100;
    tapZone = undefined;
    jumpZone = undefined; jumpZoneFX = undefined;
    arcT=undefined;arcL=undefined;arcR=undefined;arcB=undefined;
    arcTL=undefined;arcTR=undefined;arcBL=undefined;arcBR=undefined;
    // arcFillColor = 0x22b24c;jumpZoneFillColor = 0x22b24c;
    // arcFillColor = 0xEB6864;jumpZoneFillColor = 0xEB6864;
    arcFillColor = dbPlayer[pId].tint;jumpZoneFillColor = dbPlayer[pId].tint;
    arcFillAlpha = GlobalConfig.TAP_DEVICE ? 0.1 : 0;
    moveCtrlZoneAlpha =  GlobalConfig.TAP_DEVICE ? 0.05 : 0;
    moveCtrlFillColor = 0x777777;
    jumpZoneAlpha = GlobalConfig.TAP_DEVICE ? 0.32 : 0;
    jumpZoneAlphaMax = GlobalConfig.TAP_DEVICE ? 0.99 : 0;
    arcRadius=0;

    constructor() {
        // super("WorldScene");
        // console.log("world scene construct");
        super({
            type: Phaser.AUTO,
            width: canvasWidth,
            height: canvasHeight,
            key: 'WorldScene',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {y: 0},
                    tileBias: 40,
                    debug: false
                }
            },
            parent: 'game_div'
        })
        this.displayedChunks = [];
    }

    init () {
        //this.physics = this.matter;
        // console.log("world scene init");
    }

    preload() {
        // console.log("world scene preload");
        // this._loadTiledMap();
        // console.log('pre_load');
        this._loadTiledMapByChunks();
        // this._loadPlayer();
        // this._loadMobs();
        // this.load.image('spark', 'assets/particles/blue.png');

        // this._loadAudio();
    }

    gameResize(){
        console.log("game resize");
        let worldScene = game.scene.getScene("WorldScene");
        worldScene._bindTapZone();
        worldScene._redrawTapZone();
    }

    create() {
        // this.renderer.on("resize",this.gameResize);
        // this.game.events.on('resize', this.resizeHandler);
        // console.log('world scene create');
        // this._createTiledMap();
        this._createTiledMapByChunks();
        this._createPlayer();
        this.updateEnvironment();

        // this._createMobs();
        this._createCamera();
        // this.cameras.main.on('camerazoomcomplete', this.resizeHandler);

        this._bindMouse();
        // if(GlobalConfig.TAP_DEVICE) this._bindTapZone();
        this._bindTapZone();

        // this.updateLayerCollision(dbPlayer[pId].moveOn);

        // bug-fix: 20230430 - 改为了 boot pre 之后，解决没有进入world 就出现 hud bubble gui的问题
        gTime.timerPauseFlag = false;
        flagInGame = true;
        dbPlayer[pId].isInWorldMap = true;
        CharacterModel.calcTotalState();
        gGui.drawHUD();
        BubbleWidget.updateKFIcons();   // 进入世界
        BubbleWidget.showBubble();
        BubbleWidget.buttonSetCoolDown("#all");
        gGui.domUIShow();

        let music_song = dbPlayer[pId].moveOn === 'ship' ? "theme_ship":"";
        // this.playMusic(music_song,"theme");

        // 20230906 新手操作帮助
        if(BOOL_NEW_GAME){
            gApp.newGameInitScript();
            if(gApp.gameSettingObj.newGameHelpFlag && (gApp.difficulty === 1)) {
                // gGui.newGameHelpWizard();
                let helpWizard = HelpWizard.getInstance();
                helpWizard.start();
            }else{
                BOOL_NEW_GAME = false;
                gGui.enableKeys();
            }
        }else{
            gGui.enableKeys();
        }
        // 打开小地图
        let miniMap = MiniMapManager.getInstance();
        miniMap.showMap();
    }

    resizeHandler(){
        console.log("render handler");
        let sce = game.scene.getScene("WorldScene");
        if(sce.flagReBindTap){
            console.log("flag true");
            sce.flagReBindTap = false;
            sce._bindTapZone();
            sce._redrawTapZone();
        }
    }

    update(time,delta) {
        // console.log(parseInt(1000/delta));

        if(!dbPlayer[pId].isInWorldMap) return;
        if(pId < 0 || (!dbPlayer[pId].isAlive)) {
            return;
        }
        if(BOOL_NEW_GAME) return;
        // if(GlobalConfig.TAP_DEVICE) this._tapHandler();
        // if(this.flagNextUpdateReBindTap){
        //     this.flagNextUpdateReBindTap = false;
        //     // this._bindTapZone();
        //     // this._redrawTapZone();
        //     this._zoomCamera(-500);
        //     this._zoomCamera(500);
        // }
        if(this.flagReBindTap){
            this.flagReBindTap = false;
            this._bindTapZone();
            this._redrawTapZone();

            // let that = this;
            // setTimeout(function(){
            //     that._bindTapZone();
            //     that._redrawTapZone();
            //     gGui.sysToast("update redraw bind tap");
            // },500);

            // this.flagNextUpdateReBindTap = true;
        }


        this._tapHandler();
        this.player.update(time,delta);
        // let fps = parseInt(1000/delta);
        // // console.log("FPS="+fps);
        // $("#comboDiv").css("display","block");
        // $("#comboDiv span").html("fps = "+fps);
        gTime.update();

        if(this.arrow_center_cd > 0){
            this.arrow_center_cd = (this.arrow_center_cd - delta < 0) ? 0 : (this.arrow_center_cd - delta);
        }
    }

    _tapHandler(){
        // this.anchor_move_ctrl_origin_x = this.player.sprite.x;
        // this.anchor_move_ctrl_origin_y = this.player.sprite.y;
        if(gGui.flagGuiShow) return;
        // if(this.input.activePointer.isDown){
        if(this.input.activePointer.leftButtonDown()){
            let pointer = this.input.activePointer;
            // console.log(pointer);
            this.arrow_up = false;
            this.arrow_down = false;
            this.arrow_left = false;
            this.arrow_right = false;
            this.arrow_center = false;

            // 计算鼠标位置与anchor的距离
            // 有效距离是 半径 = 6.5 vw
            let dis = getDistance(pointer.x,pointer.y,this.anchor_move_ctrl_origin_x,this.anchor_move_ctrl_origin_y);
            if((dis <= this.move_ctrl_radius)&&(dis>=0)){
                if(dis <= this.move_ctrl_jump_radius){
                    // jump or horse.. in worldmap, only horse. check if had a horse
                    if(this.arrow_center_cd <=0){
                        this.arrow_center = true;
                        this.arrow_center_cd = this.arrow_center_cd_max;
                        this.add.tween({
                            targets:this.jumpZone,
                            // fillColor:{from:0x1E90FF, to:0x1E90FF},
                            fillAlpha:{from: this.jumpZoneAlpha, to :this.jumpZoneAlphaMax},
                            // angle:{from:0,to:180},
                            // scale:{from:1.0,to:0.618},
                            radius:{from:this.move_ctrl_jump_radius,to:this.move_ctrl_jump_radius*0.618},
                            yoyo:1,
                            duration: 50
                        });
                    }
                }else{  // 移动逻辑
                    // +- 22.5度以内，认为是一个方向
                    let rad = Math.atan2(this.anchor_move_ctrl_origin_y-pointer.y,pointer.x - this.anchor_move_ctrl_origin_x);
                    // angel [-pi ~ pi]: 22.5 * angel / 180 -> 弧度
                    let degree = rad * 180 / Math.PI;
                    let tweenArc = undefined;
                    if((degree > -22.5) && (degree <=22.5)){    // right
                        this.arrow_right = true;
                        this.resetArcFills();
                        this.arcR.setFillStyle(this.arcFillColor,1);
                        tweenArc = this.arcR;
                    }else if((degree >22.5)&&(degree<=67.5)){   // right - top
                        this.arrow_right = true;
                        this.arrow_up = true;
                        this.resetArcFills();
                        this.arcTR.setFillStyle(this.arcFillColor,1);
                        tweenArc = this.arcTR;
                    }else if((degree > 67.5)&&(degree<= 112.5)){    // top
                        this.arrow_up = true;
                        this.resetArcFills();
                        this.arcT.setFillStyle(this.arcFillColor,1);
                        tweenArc = this.arcT;
                    }else if((degree > 112.5)&&(degree<=157.5)){    // left-top
                        this.arrow_left = true;
                        this.arrow_up = true;
                        this.resetArcFills();
                        this.arcTL.setFillStyle(this.arcFillColor,1);
                        tweenArc = this.arcTL;
                    }else if((degree > 157.5) || (degree <= -157.5)){   //left
                        this.arrow_left = true;
                        this.resetArcFills();
                        this.arcL.setFillStyle(this.arcFillColor,1);
                        tweenArc = this.arcL;
                    }else if((degree >-67.5)&&(degree<=-22.5)){     // right - bottom
                        this.arrow_right = true;
                        this.arrow_down = true;
                        this.resetArcFills();
                        this.arcBR.setFillStyle(this.arcFillColor,1);
                        tweenArc = this.arcBR;
                    }else if((degree > -112.5)&&(degree <= -67.5)){ // bottom
                        this.arrow_down = true;
                        this.resetArcFills();
                        this.arcB.setFillStyle(this.arcFillColor,1);
                        tweenArc = this.arcB;
                    }else if((degree > -157.5)&&(degree <=-112.5)){ // left - bottom
                        this.arrow_left = true;
                        this.arrow_down = true;
                        this.resetArcFills();
                        this.arcBL.setFillStyle(this.arcFillColor,1);
                        tweenArc = this.arcBL;
                    }
                    if(tweenArc!==undefined){
                        this.add.tween({targets:tweenArc,duration:300,
                            radius:{from:this.actRadius,to:this.move_ctrl_jump_radius},
                            fillAlpha:{from:1, to: this.arcFillAlpha}
                        });
                    }
                }
            }
        }else{
            this.arrow_up = false;
            this.arrow_down = false;
            this.arrow_left = false;
            this.arrow_right = false;

            if(this.arrow_center){  // 在中间小圆圈，释放了按键，大地图应该召唤马匹
                // console.log("horse");
                if(GlobalConfig.TAP_DEVICE){
                    this.player.key_jump_handler();
                }
            }
        }
    }

    resetArcFills(){
        this.arcT.setFillStyle(this.arcFillColor,this.arcFillAlpha);
        this.arcB.setFillStyle(this.arcFillColor,this.arcFillAlpha);
        this.arcR.setFillStyle(this.arcFillColor,this.arcFillAlpha);
        this.arcL.setFillStyle(this.arcFillColor,this.arcFillAlpha);
        this.arcTR.setFillStyle(this.arcFillColor,this.arcFillAlpha);
        this.arcTL.setFillStyle(this.arcFillColor,this.arcFillAlpha);
        this.arcBR.setFillStyle(this.arcFillColor,this.arcFillAlpha);
        this.arcBL.setFillStyle(this.arcFillColor,this.arcFillAlpha);
    }

    createEllipseEffect(){
        // if((this.particleEmmiter !== undefined) && (this.particleEmmiter.totalCnt>=10)) return;
        this.particleEmmiter = this.ellipseParticle.createEmitter({
            x: 0,
            y: 0,
            blendMode: 'SCREEN',
            scale: { start: 0.2, end: 0.4 },
            speed: { min: -200, max: 200 },
            quantity: 10
        });

        this.particleEmmiter.setEmitZone({
            source: new Phaser.Geom.Ellipse(0, 0, 80, 40),
            type: 'edge',
            quantity: 10
        });
        this.particleEmmiter.startFollow(this.player.sprite);
        this.particleEmmiter.totalCnt = 1;
    }
    _removeEllipseEffect(){
        this.particleEmmiter.totalCnt = 0;
        this.particleEmmiter.remove();
        // this.particleEmmiter = null;
    }

    _loadTiledMap(){
        // tile set image
        let that = this;
        this._tileSetImageArr.forEach(function(value,index){
            that.load.image("tileImage"+index,value);
        });
        // tile map in json format & compressed b64
        // this.load.tilemapTiledJSON('worldmap', this._tileMapInJson);
    }
    _loadTiledMapByChunks(){
        let that = this;
        this.cache.tilemap.events.on('add',function(cache,key){
            that._displayChunk(key);
        });
        // this._tileSetImageArr.forEach(function(value,index){
        //     that.load.image("tileImage"+index,value);
        // });
        this.load.json('master', this.chunkUrl+'master.json');
    }

    bindCacheAddEvent(){
        let that = this;
        this.cache.tilemap.events.on('add',function(cache,key){
            that._displayChunk(key);
        });
    }

    _loadPlayer(){
        this.load.atlas("texture-player-wonda", this._playerAtlasWd, this._playerInJsonWd);  // atlas name, player image , json file
        this.load.atlas("texture-player-woner", this._playerAtlasWe, this._playerInJsonWe);  // atlas name, player image , json file
        this.load.atlas("texture-player-xq", this._playerAtlas, this._playerInJson);  // atlas name, player image , json file
        this.load.atlas("texture-ship", this._shipAtlas, this._shipInJson);  // atlas name, player image , json file
        this.load.atlas("texture-horse-xq", this._horseAtlasXq, this._horseInJsonXq);  // atlas name, player image , json file
        this.load.atlas("texture-horse-we", this._horseAtlasWe, this._horseInJsonWe);  // atlas name, player image , json file
        this.load.atlas("texture-horse-wd", this._horseAtlasWd, this._horseInJsonWd);  // atlas name, player image , json file
    }
    _loadMobs(){
        for(let i=0; i<this._mobList.length; i++){
            let key = "texture-"+this._mobList[i].texture;
            if(!this.exists(key)){
                this.load.atlas(key, 'assets/'+this._mobList[i].texture+'.png', 'assets/'+this._mobList[i].texture+'.json');
            }
        }
    }
    // _loadAudio(){
    //     let that = this;
    //     this._musicList.forEach(function(value,key){
    //         that.load.audio(key, value);
    //     });
    // }

    _createDebug(){
        // Turn on physics debugging to show player's hitbox
        this.physics.world.createDebugGraphic();

        // Create worldLayer collision graphic above the player, but below the help text
        const graphics = this.add
            .graphics()
            .setAlpha(0.75)
            .setDepth(20);
        // this.mapLayer.get("layerEarth").renderDebug(graphics, {
        //     tileColor: null, // Color of non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
        // this.mapLayer.get("layerDecoration").renderDebug(graphics, {
        //     tileColor: null, // Color of non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
    }


    _createTiledMap(){
        this.gameMap = this.make.tilemap({key:"worldmap"});
        let tileSetArr = [];
        for(let i =0;i<this._tileSetNameArr.length;i++){
            if(i == 0 || i ==1){
                tileSetArr.push(this.gameMap.addTilesetImage(this._tileSetNameArr[i],"tileImage"+i,40,40,2,4));
            } else {
                tileSetArr.push(this.gameMap.addTilesetImage(this._tileSetNameArr[i],"tileImage"+i));
            }
        }
        let layerEarth = this.gameMap.createLayer("earth", tileSetArr,0,0);
        let layerDecoration = this.gameMap.createLayer("decoration", tileSetArr,0,0);
        layerEarth.setCollisionByProperty({ isWater: true, isBoundary: true });
        layerDecoration.setCollisionByProperty({ isBuilding: true, isCliff: true, isTree: true, isRock: true, isZone: true, isCity: true });
        this.mapLayer.set("layerEarth",layerEarth);
        this.mapLayer.set("layerDecoration",layerDecoration);
        // this.mapLayer.set("layer2",layerZone);
        this.mapWidthTotal = this.gameMap.widthInPixels;
        this.mapHeightTotal = this.gameMap.heightInPixels;
    }
    // publicMethodRemoveCliffCollision(){
    //     // todo: -  这里不对，应该在上面 的函数里面直接做。 而 轻功属性提升之后，应该强制重绘地图，就会重新载入碰撞。
    //     let layerDecoration = this.mapLayer.get("decoration");
    //     layerDecoration.setCollisionByProperty({ isBuilding: true, isCliff: false, isTree: true, isRock: true, isZone: true, isCity: true });
    // }
    _createTiledMapByChunks(){
        this.maps = {};
        this.displayedChunks = [];
        let masterData = this.cache.json.get("master");
        this.chunkWidth = masterData.chunkWidth;
        this.chunkHeight = masterData.chunkHeight;
        this.nbChunksHorizontal = masterData.nbChunksHorizontal;
        this.nbChunksVertical = masterData.nbChunksVertical;
        this.lastChunkID = (this.nbChunksHorizontal * this.nbChunksVertical) - 1;

        this.mapWidthTotal = masterData.nbChunksHorizontal*masterData.chunkWidth*40;
        this.mapHeightTotal = masterData.nbChunksVertical*masterData.chunkHeight*40;
        // this._updateEnvironment();// The core method responsible for displaying/destroying chunks
        // console.log("mapWidthTotal="+this.mapWidthTotal+", mapHeightTotal="+this.mapHeightTotal);
    }
    // Determines the ID of the chunk on which the player charachter is based on its coordinates in the world
    _computeChunkID(x,y){
        let tileX = Math.floor(x/40);
        let tileY = Math.floor(y/40);
        let chunkX = Math.floor(tileX/this.chunkWidth);
        let chunkY = Math.floor(tileY/this.chunkHeight);
        return (chunkY*this.nbChunksHorizontal)+chunkX;
    };
    // Returns the entries in secondArray that are not present in firstArray
    _findDiffArrayElements(firstArray,secondArray){
        return firstArray.filter(function(i) {return secondArray.indexOf(i) < 0;});
    };

    updateEnvironment(){
        let chunkID = this._computeChunkID(this.player.sprite.x,this.player.sprite.y);
        this.playerChunkID = chunkID;
        let chunks = this._listAdjacentChunks(chunkID); // List the id's of the chunks surrounding the one we are in
        let newChunks = this._findDiffArrayElements(chunks,this.displayedChunks); // Lists the surrounding chunks that are not displayed yet (and have to be)
        // let oldChunks = this._findDiffArrayElements(this.displayedChunks,chunks); // Lists the surrounding chunks that are still displayed (and shouldn't anymore)
        this.playerChunkX = (chunkID%this.nbChunksHorizontal)*this.chunkWidth;
        this.playerChunkY = Math.floor(chunkID/this.nbChunksHorizontal)*this.chunkHeight;

        let that = this;
        newChunks.forEach(function (c) {
            // console.log("loading chunk:"+c) ;
            that.load.tilemapTiledJSON("chunk"+c, that.chunkUrl+"chunk"+c+".json");
        });
        // for(let i=0;i<newChunks.length;i++){
        //     console.log('loading chunk:'+newChunks[i]);
        //     this.load.tilemapTiledJSON('chunk'+newChunks[i], this.chunkUrl+'chunk'+newChunks[i]+'.json');
        // }

        if(newChunks.length > 0) {
            // console.log('displayed:'+this.displayedChunks.concat(''));
            this.load.start();
        }

        // for(let i=0;i<oldChunks.length;i++) {
        //     console.log('destroying chunk'+oldChunks[i]);
        //     this._removeChunk(oldChunks[i]);
        // }


    };
    _removeOldChunks(){
        let chunkID = this._computeChunkID(this.player.sprite.x,this.player.sprite.y);
        let chunks = this._listAdjacentChunks(chunkID); // List the id's of the chunks surrounding the one we are in
        // let newChunks = this._findDiffArrayElements(chunks,this.displayedChunks); // Lists the surrounding chunks that are not displayed yet (and have to be)
        let oldChunks = this._findDiffArrayElements(this.displayedChunks,chunks); // Lists the surrounding chunks that are still displayed (and shouldn't anymore)

        for(let i=0;i<oldChunks.length;i++) {
            // console.log('destroying chunk'+oldChunks[i]);
            this._removeChunk(oldChunks[i]);
        }
    }

    checkPlayerTileInWater(){
        let chunkID = this._computeChunkID(this.player.sprite.x,this.player.sprite.y);
        this.playerChunkID = chunkID;
        let pos = this.maps[chunkID].worldToTileXY(this.player.sprite.x,this.player.sprite.y);
        let tile = this.maps[chunkID].getTileAt(pos.x,pos.y,true,'earth');
        // console.log(tile);
        if(tile.properties){
            if(tile.properties.isWater){
                return true;
            }
        }
        return false;
    }


    updateLayerCollision(moveOn='foot'){
        if(!dbPlayer[pId].isInWorldMap) return;
        this.physics.world.colliders.removeAll();
        let that = this;
        this.mapLayer.forEach(function(layer,k){
            if(moveOn === 'ship'){
                layer.setCollisionByProperty({ isWater: true},false);
                layer.setCollisionByProperty({ isBuilding: true, isCliff: true, isTree: true, isRock: true, isLand: true, isBoundary: true, isZone: true, isCity: true },true);
                layer.setCollisionBetween(19,30,true);
                // layer.setCollisionByExclusion([17,33],false);
            }else{
                layer.setCollisionByProperty({ isBuilding: true, isHerb:true,isCliff: true, isTree: true, isRock: true, isLand: true, isBoundary: true, isZone: true, isCity: true },false);
                // layer.setCollisionByProperty({ isBuilding: true, isCliff: true, isTree: true, isRock: true, isWater: true, isBoundary: true, isZone: true, isCity: true },true,true);
                // 如果是 onFoot 需要再验证 轻功
                let swift = dbPlayer[pId].totalSkill.swift;
                let collisionObj = { isBuilding: true, isHerb:true, isCliff: true, isTree: true, isRock: true, isWater: true, isBoundary: true, isZone: true, isCity: true };
                if(moveOn === 'foot' || moveOn===undefined){
                    if(swift>=GlobalConfig.SWIFT_TREE){
                        collisionObj.isTree = false;
                        collisionObj.isRock = false;
                    }
                    if(swift>=GlobalConfig.SWIFT_HILL){
                        collisionObj.isCliff = false;
                    }
                    layer.setCollisionByProperty(collisionObj,true,true);   // 和水会碰撞
                    // update 202308.15 踏浪
                    if(swift >= GlobalConfig.SWIFT_WATER){
                        // layer.setCollisionByProperty({ isWater: true},false);
                        layer.setCollisionBetween(17,32,false); // 和32的水不碰撞 但是从1 开始
                        layer.setCollisionBetween(34,48,false); // 但是可能和建筑的32也不碰撞了
                        collisionObj = { isBuilding: true, isHerb:true, isBoundary: true, isZone: true, isCity: true };  // 再次设置 建筑32的碰撞
                        layer.setCollisionByProperty(collisionObj,true,true);
                    }
                }else{  // 骑马
                    layer.setCollisionByProperty(collisionObj,true,true);
                }

            }
            that.physics.world.addCollider(that.player.sprite, layer, that._onCollideWithOther);

            // layer.data.tile.forEach(function(t,tk){
            //
            // });

            // that.physics.world.createDebugGraphic();
            // const graphics = that.add
            //     .graphics()
            //     .setAlpha(0.75)
            //     .setDepth(20);
            // layer.renderDebug(graphics, {
            //     tileColor:  new Phaser.Display.Color(243, 243, 243, 255), // Color of non-colliding tiles
            //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
            // });
        });
    }

    _displayChunk(key){
        if(!dbPlayer[pId].isInWorldMap) return;

        let map = this.make.tilemap({ key: key});

        // The first parameter is the name of the tileset in Tiled and the second parameter is the key
        // of the tileset image used when loading the file in preload.
        let tileSetArr = [];
        for(let i =0;i<this._tileSetNameArr.length;i++){
            if(i == 0 || i == 1){
                tileSetArr.push(map.addTilesetImage(this._tileSetNameArr[i],"tileImage"+i,40,40,2,4));
            }else{
                tileSetArr.push(map.addTilesetImage(this._tileSetNameArr[i],"tileImage"+i));
            }
        }

        // We need to compute the position of the chunk in the world
        let chunkID = parseInt(key.match(/\d+/)[0]); // Extracts the chunk number from file name
        let chunkX = (chunkID%this.nbChunksHorizontal)*this.chunkWidth;
        let chunkY = Math.floor(chunkID/this.nbChunksHorizontal)*this.chunkHeight;
        // console.log("chunkID="+chunkID+",chunkX="+chunkX+", chunkY="+chunkY);
        for(let i = 0; i < map.layers.length; i++) {
            // You can load a layer from the map using the layer name from Tiled, or by using the layer
            // index
            let layer = map.createLayer(i, tileSetArr, chunkX*40, chunkY*40);
            // let layer = map.createDynamicLayer(i, tileSetArr, chunkX*40, chunkY*40);
            // Trick to automatically give different depths to each layer while avoid having a layer at depth 1 (because depth 1 is for our player character)
            layer.setDepth(2*i);
            // on_land
            if(dbPlayer[pId].moveOn == 'ship'){
                layer.setCollisionByProperty({ isWater: true},false);
                layer.setCollisionByProperty({ isBuilding: true, isCliff: true, isTree: true, isRock: true, isLand: true, isBoundary: true, isZone: true, isCity: true },true);
                layer.setCollisionBetween(19,30,true);
            }else{
                layer.setCollisionByProperty({ isBuilding: true, isHerb:true, isCliff: true, isTree: true, isRock: true, isLand: true, isBoundary: true, isZone: true, isCity: true },false);
                // layer.setCollisionByProperty({ isBuilding: true, isCliff: true, isTree: true, isRock: true, isWater: true, isBoundary: true, isZone: true, isCity: true },true,true);
                // 如果是 onFoot 需要再验证 轻功
                // 如果是 onFoot 需要再验证 轻功
                let swift = dbPlayer[pId].totalSkill.swift;
                let moveOn = dbPlayer[pId].moveOn;
                let collisionObj = { isBuilding: true, isHerb:true, isCliff: true, isTree: true, isRock: true, isWater: true, isBoundary: true, isZone: true, isCity: true };
                if(moveOn === 'foot' || moveOn===undefined){
                    if(swift>=GlobalConfig.SWIFT_TREE){
                        collisionObj.isTree = false;
                        collisionObj.isRock = false;
                    }
                    if(swift>=GlobalConfig.SWIFT_HILL){
                        collisionObj.isCliff = false;
                    }
                    layer.setCollisionByProperty(collisionObj,true,true);   // 和水会碰撞
                    // update 202308.15 踏浪
                    if(swift >= GlobalConfig.SWIFT_WATER){
                        // layer.setCollisionByProperty({ isWater: true},false);
                        layer.setCollisionBetween(17,32,false); // 和32的水不碰撞 但是从1 开始
                        layer.setCollisionBetween(34,48,false); // 但是可能和建筑的32也不碰撞了
                        collisionObj = { isBuilding: true, isHerb:true, isBoundary: true, isZone: true, isCity: true };  // 再次设置 建筑32的碰撞
                        layer.setCollisionByProperty(collisionObj,true,true);
                    }
                }else{  // 骑马
                    layer.setCollisionByProperty(collisionObj,true,true);
                }
            }

            layer.layer.data.forEach(function(row){
                row.forEach(function(tile){
                    tile.realX = chunkX + tile.x;
                    tile.realY = chunkY + tile.y;
                    // if(tile.collides.length >0 ){
                    //     console.log(tile.collides[0]);
                    // }
                })
            });

            let tmp = this.physics.world.addCollider(this.player.sprite, layer, this._onCollideWithOther);
            // let tmp = this.physics.world.addOverlap(this.player.sprite, layer, this._onCllideWithOther)
            tmp.chunkID = chunkID;
            this.chunkColliderArr.push(tmp);
            this.maps[chunkID] = map;
            this.displayedChunks.push(chunkID);
            this.mapLayer.set(chunkID+"-"+i, layer);
            // console.log("key = "+key+ ", layer="+i);
            // console.log(layer);

            // if debug - for debug purpose
            // this.physics.world.createDebugGraphic();
            // const graphics = this.add
            //     .graphics()
            //     .setAlpha(0.75)
            //     .setDepth(20);
            // layer.renderDebug(graphics, {
            //     tileColor:new Phaser.Display.Color(243, 243, 243, 255), // Color of non-colliding tiles
            //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
            // });
        }

        // let herbId = 353 + 29;
        // let grasId = 353 + 2;
        // map.replaceByIndex(355,353+29,0,0,50,50);
        // let matchCnt = 0;

        // Method 1: 先查找所有的，得到数组，然后应用概率
        // let grassArr = [];
        // let matchIdx = map.findByIndex(grasId,matchCnt,false,"decoration");
        // while(matchIdx !== null){
        //     grassArr.push(matchIdx);
        //     matchCnt = matchCnt + 1;
        //     matchIdx = map.findByIndex(grasId,matchCnt,false,"decoration");
        // }
        // for(let i=0;i<grassArr.length;i++){
        //     if(GlobalFunction.randSaving(GlobalConfig.HERB_RATIO)){
        //         map.putTileAt(herbId,grassArr[i].x,grassArr[i].y);
        //     }
        // }

        // Method 2: 一边查找一边概率替换
        let that = this;

        setTimeout(function (){
            let matchCnt = 0;
            let matchIdx = map.findByIndex(GlobalConfig.HERB_GRASS_ID,matchCnt,false,"decoration");
            while(matchIdx !== null){
                if(GlobalFunction.randSaving(GlobalConfig.HERB_RATIO)){
                    map.putTileAt(GlobalConfig.HERB_ID,matchIdx.x,matchIdx.y);
                    let t = map.getTileAt(matchIdx.x,matchIdx.y);
                    t.flagHarvestAble = true;
                }else{
                    matchCnt = matchCnt + 1;
                }
                matchIdx = map.findByIndex(GlobalConfig.HERB_GRASS_ID,matchCnt,false,"decoration");
            }
            // if((matchCnt > 0)&&(dbPlayer[pId].moveOn !== 'ship')){
            if(matchCnt > 0){   // bug-fix 碰撞与否，与display的时候是否开船无关，否则开船的时候刷出来的草药都不能采
                let chunkID = parseInt(key.match(/\d+/)[0]);
                let mapLayerKey = chunkID + "-1";   // decoration id = 1
                let layer = that.mapLayer.get(mapLayerKey);
                // console.log("display called for "+key);
                // console.log(layer);
                // layer.setCollisionBetween(GlobalConfig.HERB_ID,GlobalConfig.HERB_ID,true);
                layer.setCollision(GlobalConfig.HERB_ID,true,false,true);
                // that.physics.world.addCollider(that.player.sprite, layer, that._onCollideWithOther);

                // that.mapLayer.forEach(function(layer,k){
                //     console.log("display called for "+key);
                //     console.log(layer);
                //     if(layer.layer.name==='decoration'){
                //         if(dbPlayer[pId].moveOn !== 'ship'){
                //             layer.setCollisionBetween(GlobalConfig.HERB_ID,GlobalConfig.HERB_ID,true);
                //             that.physics.world.addCollider(that.player.sprite, layer, that._onCollideWithOther);
                //         }
                //     }
                // });
            }
        },0,that,map,key);
    };

    _removeChunk(chunkID){
        for(let i=0;i<this.chunkColliderArr.length;i++){
            if(this.chunkColliderArr[i] == null) continue;
            if(this.chunkColliderArr[i].chunkID == chunkID){
                this.physics.world.colliders.remove(this.chunkColliderArr[i]);
                this.chunkColliderArr[i] = null;
            }
        }
        this.chunkColliderArr = this.chunkColliderArr.filter(Boolean);
        this.maps[chunkID].destroy();
        let idx = this.displayedChunks.indexOf(chunkID);
        if(idx > -1) this.displayedChunks.splice(idx,1);
    };

    // Returns the list of chunks surrounding a specific chunk, taking the world borders into
    // account. If you find a smarter way to do it, I'm interested!
    _listAdjacentChunks(chunkID){
        let chunks = [];
        let isAtTop = (chunkID < this.nbChunksHorizontal);
        let isAtBottom = (chunkID > this.lastChunkID - this.nbChunksHorizontal);
        let isAtLeft = (chunkID%this.nbChunksHorizontal == 0);
        let isAtRight = (chunkID%this.nbChunksHorizontal == this.nbChunksHorizontal-1);
        chunks.push(chunkID);
        if(!isAtTop) chunks.push(chunkID - this.nbChunksHorizontal);
        if(!isAtBottom) chunks.push(chunkID + this.nbChunksHorizontal);
        if(!isAtLeft) chunks.push(chunkID-1);
        if(!isAtRight) chunks.push(chunkID+1);
        if(!isAtTop && !isAtLeft) chunks.push(chunkID-1-this.nbChunksHorizontal);
        if(!isAtTop && !isAtRight) chunks.push(chunkID+1-this.nbChunksHorizontal);
        if(!isAtBottom && !isAtLeft) chunks.push(chunkID-1+this.nbChunksHorizontal);
        if(!isAtBottom && !isAtRight) chunks.push(chunkID+1+this.nbChunksHorizontal);
        return chunks;
    };

    _onCollideWithOther(p,o){
        // console.log(JSON.stringify(p));
        // console.log(JSON.stringify(o));
        // p.body.setVelocity(0);
        if(undefined === o) return;
        if(o.index === GlobalConfig.HERB_ID){
            // let that = game.scene.getScene("WorldScene");
            if(dbPlayer[pId].moveOn === 'ship') return;    // 如果开船，不能摘草
            let newHarvest = o.flagHarvestAble;
            o.flagHarvestAble = false;
            let that = p.scene;
            let chunkID = that._computeChunkID(o.realX*40,o.realY*40);
            that.maps[chunkID].putTileAt(GlobalConfig.HERB_GRASS_ID,o.x,o.y);
            if(newHarvest){  // 直接跳出，与草不碰撞，如果将来与草要碰撞了，要改这个逻辑。
                // gain item
                CharacterModel.gainItem(GlobalConfig.ITEM_HERB_ID,1);
                // gui prompt asyn
                gGui.bootToast(globalStrings.TASK_NAME_506," ",globalStrings.QB_ITEM_GET + " "+globalStrings.ITEM_ITEMNAME_347);
                return;
            }
        }

        if(o.properties === undefined) return;

        let ox = o.realX;
        let oy = o.realY;
        // console.log(p);
        // console.log(o);
        if(o.properties.isZone || o.properties.isCity){
            // console.log("is zone or city");
            if(ox>=0 && oy>=0){
                p.body.setVelocity(0,0);
                let zone = gDB.getZoneByPos(ox,oy);
                if(zone !== undefined){
                    // console.log(zone.zoneName);
                    // dbPlayer[pId].isInZone  =  true;

                    // debug 20220218
                    /*
                    dbPlayer[pId].worldPosX = p.x;
                    dbPlayer[pId].worldPosY = p.y;
                    game.scene.scenes[0].player.moveOn('foot');
                    */

                    if(dbPlayer[pId].moveOn === 'horse'){
                        // let that = game.scene.scenes[0];
                        let that = game.scene.getScene("WorldScene");
                        that.player.player.x = that.player.sprite.x;
                        that.player.player.y = that.player.sprite.y;
                        that.player.ship.x = that.player.sprite.x;
                        that.player.ship.y = that.player.sprite.y;
                        that.player.horse.x = that.player.sprite.x;
                        that.player.horse.y = that.player.sprite.y;

                        that.player.sprite = that.player.player;
                        that.player.player.setVisible(true);
                        that.player.ship.setVisible(false);
                        that.player.horse.setVisible(false);

                        dbPlayer[pId].moveOn = 'foot';
                        that.updateLayerCollision('foot');
                        that.stopSoundEffect("horse_run");
                    }
                    // game.scene.scenes[0].player.moveTo(game.scene.scenes[0].player.horse.x,game.scene.scenes[0].player.horse.y);

                    // this.sprite.setVisible(true);

                    // bug-fix: 20220403 take care of bg-music
                    // if enterZone || enterDungeon_but_in_quick_battle , handle music by worldScene.
                    // otherwise simply enterZone and leave music to DynamicScene.
                    if(zone.zType === 'port' || zone.zType === 'city' || zone.zType ==='hill' || zone.zType ==='pass'){
                        let music_town = Math.random()>=0.5 ? "theme_town" : "theme_old_city";
                        game.scene.getScene("WorldScene").playMusic(music_town);
                    }else if(zone.zType === 'dungeon'){
                        // if(gApp.gameSettingObj.quickBattleFlag){
                        //     game.scene.getScene("WorldScene").playMusic("","battle");
                        // }
                    }
                    gApp.enterZone(zone.zoneId);
                    // game.scene.getScene("WorldScene").playMusic("music_town");
                    // game.scene.getScene("WorldScene")._removeOldChunks();
                    // empty chunk_cache
                }
            }
        }else if(o.properties.isBuilding && o.properties.zType==='chest') {
            // console.log("it is a chest");
            let zone = gDB.getZoneByPos(ox, oy);
            // console.log(zone);  // 瞎写，debug purpose 也记不得宝箱有没有放到 zone表了 - 卧槽。居然成功了。
            if (zone !== undefined) {
                p.body.setVelocity(0,0);
                o.properties.zType = undefined;
                gGui.playSoundEffect("succ");
                gApp.openChest(zone.zoneId);
            }
        }else if(o.properties.isWater){
            if(dbPlayer[pId].moveOn === 'horse'){
                BuffWidget.offHorse();
            }
        }

        // } else if (o.properties.isCliff){
        //     CharacterModel.calcTotalState();
        //     if(dbPlayer[pId].totalSkill.swift >= 70){
        //         //  轻功超过70，可以翻山
        //         // console.log("todo: should be able to continue");
        //     }
        // }
        // else{
        //     // console.log(o);
        //     // console.log("collide, stop player");
        // }
    }

    _createPlayer(){
        // this.startPos = this.gameMap.findObject("player", obj => obj.name === "PlayerStartLocation");
        this.player = new PlayerInWorld(this,this.playerDepth);       // depth: 取决于 layer 数组 world layer 位置
        // this.player.moveTo(this.startPos.x,this.startPos.y);
        // console.log("creating player:"+dbPlayer[pId].name+" : "+dbPlayer[pId].worldPosX+","+dbPlayer[pId].worldPosY);
        this.player.moveTo(dbPlayer[pId].worldPosX,dbPlayer[pId].worldPosY);
        // this.player.sprite.refreshBody();

        this.physics.world.bounds.height = this.mapHeightTotal;
        this.physics.world.bounds.width = this.mapWidthTotal;
        // this.physics.world.addCollider(this.player.sprite, this.mapLayer.get("layerEarth"));
        // this.physics.world.addCollider(this.player.sprite, this.mapLayer.get("layerDecoration"));
        this.player.sprite.body.setCollideWorldBounds(true);
    }
    _createShip(){
        this.ship = new PlayerInWorld(this,this.playerDepth);       // depth: 取决于 layer 数组 world layer 位置
        this.ship.sprite.body.setSize(40,40);
        // console.log("creating ship:"+dbPlayer[pId].name+" : "+dbPlayer[pId].shipPosX+","+dbPlayer[pId].shipPosY);
        this.ship.moveTo(dbPlayer[pId].shipPosX,dbPlayer[pId].shipPosY);

        this.physics.world.bounds.height = this.mapHeightTotal;
        this.physics.world.bounds.width = this.mapWidthTotal;
        this.ship.sprite.setCollideWorldBounds(true);
    }
    _createMobs(){
        for(let i=0; i< this._mobList.length;i++){
            this._mob = new SpriteController(this._mobList[i], this, this.playerDepth)
        }
    }
    _createCamera(){
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setZoom(this.cameraZoom);
        this.cameras.main.setBackgroundColor(0xe5dcb7);

        // let cw = this.cameras.main.width / 2;
        // let ch = this.cameras.main.height / 2;
        //
        // this.cameras.main.setBounds(-cw, -ch, this.mapWidthTotal+cw, this.mapHeightTotal+ch);
    }
    _bindMouse(){
        let that = this;
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            that._zoomCamera(deltaY);
        });
        // this.input.on('pointerdown', function(pointer){
        //     let touchX = pointer.x;
        //     let touchY = pointer.y;
        //     console.log("touchx="+touchX +" touchY="+touchY);
        //     console.log("camera size:="+that.cameras.main.width + 'x' + that.cameras.main.height);
        // });
        // this.input.on('pointerup',function(pointer){
        //
        // });
    }
    _bindTapZone(){
        let vmin = (this.cameras.main.width > this.cameras.main.height) ? this.cameras.main.height : this.cameras.main.width;
        // console.log("camera vmin = "+vmin);
        // if(w && h){
        //     vmin = w > h ? h : w;
        //     console.log("canvas vmin = "+vmin);
        // }
        if(GlobalConfig.TAP_DEVICE){
            this.anchor_move_ctrl_origin_x = vmin * 0.1 + 0.13 * this.cameras.main.width;
            this.anchor_move_ctrl_origin_y = this.cameras.main.height - this.anchor_move_ctrl_origin_x;
            this.move_ctrl_radius = GlobalConfig.MOBILE_TAP_RADIUS_RATE * this.cameras.main.width;
            this.move_ctrl_jump_radius = 0.3 * GlobalConfig.MOBILE_TAP_RADIUS_RATE * this.cameras.main.width;
        }else{
            this.anchor_move_ctrl_origin_x = this.cameras.main.width * 0.5;
            this.anchor_move_ctrl_origin_y = this.cameras.main.height * 0.5;
            this.move_ctrl_radius = GlobalConfig.ELECTRON_TAP_RADIUS_RATE * vmin;
            this.move_ctrl_jump_radius = 0.1 * GlobalConfig.ELECTRON_TAP_RADIUS_RATE * vmin;
        }
        this.tapZone = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.move_ctrl_radius,0,360,false,this.moveCtrlFillColor,this.moveCtrlZoneAlpha);
        // this.tapZone = this.add.circle(300,300,100,0x777777,0.32);
        // this.tapZone.setOrigin(0,1);
        this.tapZone.setScrollFactor(0);
        this.tapZone.setDepth(9999);

        this.jumpZone = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.move_ctrl_jump_radius,0,360,false,this.jumpZoneFillColor,this.jumpZoneAlpha);
        this.jumpZone.setScrollFactor(0);
        this.jumpZone.setDepth(10001);

        this.actRadius = this.move_ctrl_radius*0.9;
        this.arcT = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.actRadius,-67.5,-112.5,true,this.arcFillColor,this.arcFillAlpha);
        this.arcT.setScrollFactor(0);
        this.arcT.setDepth(10000);

        this.arcR = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.actRadius,22.5,-22.5,true,this.arcFillColor,this.arcFillAlpha);
        this.arcR.setScrollFactor(0);
        this.arcR.setDepth(10000);

        this.arcB = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.actRadius,112.5,67.5,true,this.arcFillColor,this.arcFillAlpha);
        this.arcB.setScrollFactor(0);
        this.arcB.setDepth(10000);

        this.arcL = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.actRadius,202.5,157.5,true,this.arcFillColor,this.arcFillAlpha);
        this.arcL.setScrollFactor(0);
        this.arcL.setDepth(10000);

        this.arcTR = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.actRadius,-22.5,-67.5,true,this.arcFillColor,this.arcFillAlpha);
        this.arcTR.setScrollFactor(0);
        this.arcTR.setDepth(10000);

        this.arcTL = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.actRadius,-112.5,-157.5,true,this.arcFillColor,this.arcFillAlpha);
        this.arcTL.setScrollFactor(0);
        this.arcTL.setDepth(10000);

        this.arcBR = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.actRadius,67.5,22.5,true,this.arcFillColor,this.arcFillAlpha);
        this.arcBR.setScrollFactor(0);
        this.arcBR.setDepth(10000);

        this.arcBL = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.actRadius,157.5,112.5,true,this.arcFillColor,this.arcFillAlpha);
        this.arcBL.setScrollFactor(0);
        this.arcBL.setDepth(10000);

    }
    _redrawTapZone(){
        // if(!GlobalConfig.TAP_DEVICE) return;
        let cw = this.cameras.main.width;
        let ch = this.cameras.main.height;

        // let vmin = (this.cameras.main.width > this.cameras.main.height) ? this.cameras.main.height : this.cameras.main.width;
        // if(GlobalConfig.TAP_DEVICE){
        //     this.anchor_move_ctrl_origin_x = vmin * 0.1 + 0.13 * this.cameras.main.width;
        //     this.anchor_move_ctrl_origin_y = this.cameras.main.height - this.anchor_move_ctrl_origin_x;
        //     this.move_ctrl_radius = GlobalConfig.MOBILE_TAP_RADIUS_RATE * this.cameras.main.width;
        //     this.move_ctrl_jump_radius = 0.3 * GlobalConfig.MOBILE_TAP_RADIUS_RATE * this.cameras.main.width;
        // }else{
        //     this.anchor_move_ctrl_origin_x = this.cameras.main.width * 0.5;
        //     this.anchor_move_ctrl_origin_y = this.cameras.main.height * 0.5;
        //     this.move_ctrl_radius = GlobalConfig.ELECTRON_TAP_RADIUS_RATE * vmin;
        //     this.move_ctrl_jump_radius = 0.1 * GlobalConfig.ELECTRON_TAP_RADIUS_RATE * vmin;
        // }

        let disX = cw/2 - (cw/2 - this.anchor_move_ctrl_origin_x) / this.cameraZoom;
        let disY = ch/2 - (ch/2 - this.anchor_move_ctrl_origin_y) / this.cameraZoom;
        this.tapZone.setPosition(disX,disY);
        this.tapZone.setScale(1/this.cameraZoom);

        this.jumpZone.setPosition(disX,disY);
        this.jumpZone.setScale(1/this.cameraZoom);
        this.arcT.setPosition(disX,disY);this.arcT.setScale(1/this.cameraZoom);
        this.arcR.setPosition(disX,disY);this.arcR.setScale(1/this.cameraZoom);
        this.arcB.setPosition(disX,disY);this.arcB.setScale(1/this.cameraZoom);
        this.arcL.setPosition(disX,disY);this.arcL.setScale(1/this.cameraZoom);
        this.arcTR.setPosition(disX,disY);this.arcTR.setScale(1/this.cameraZoom);
        this.arcTL.setPosition(disX,disY);this.arcTL.setScale(1/this.cameraZoom);
        this.arcBR.setPosition(disX,disY);this.arcBR.setScale(1/this.cameraZoom);
        this.arcBL.setPosition(disX,disY);this.arcBL.setScale(1/this.cameraZoom);

    }

    _zoomCamera(d){
        let dd = d/1000;
        if(dd<0){
            this.cameraZoom = this.cameraZoom - dd > this.cameraZoom_max ? this.cameraZoom_max : this.cameraZoom - dd;
            this.cameras.main.setZoom(this.cameraZoom);
        }else if(dd>0){
            this.cameraZoom = this.cameraZoom - dd < this.cameraZoom_min ? this.cameraZoom_min : this.cameraZoom - dd;
            this.cameras.main.setZoom(this.cameraZoom);
        }
        this._bindTapZone();
        this._redrawTapZone();
    }

    playMusic(strName,cate="theme"){
    }
    /**
     * player sound effect. call it from player.js or MobController.js
     * @param key key name in seList
     */
    playSoundEffect(key){
    }
    stopSoundEffect(key){
    }
}
