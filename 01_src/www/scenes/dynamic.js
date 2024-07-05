/**
 * Created by jim on 2022/04/11.
 * https://newdocs.phaser.io/docs/3.55.2/Phaser.Cache.BaseCache
 * https://rexrainbow.github.io/phaser3-rex-notes/docs/site/structs-set/
 */

let TILES_BLANK  = -1;
let tileset_wall_collision_array = [
    2,130,62,
];
const STUN_FORCE = 500;
const HEX_TINT_STUN = 0x525252;     //
const HEX_TINIT_SNARE = 0x1e90ff;   // dodger blue
const HEX_TINT_FROZE = 0x99FFFF;    // 冰蓝色
const HEX_TINT_POSION = 0x32cd32;   // Limegreen
let arg_pos_y_max = 32*41 ;  // line 39 - 2024.03.20 改为 40
let arg_pos_y_min = 32*32;  // line 32 , player height 64, anchor 0.5 ，0.25解决脚下的空间问题
const dynamic_scene_config = {
    type: Phaser.AUTO,
    width: canvasWidth,
    height: canvasHeight,
    key:'DynamicScene',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: false
        },
    },
    parent: 'game_div',
}

class DynamicScene extends Phaser.Scene {
    // dbZoneObj = gDB.getCityById(dbPlayer[pId].zoneId);  // raw object of zone in DB = // {"zoneId":55,"zoneCode":"houshan","zoneName":"后山","zType":"dungeon","tileX":414,"tileY":288,"landExitX":414,"landExitY":288,"waterExitX":0,"waterExitY":0,"loSwift":0,"initLevel":0,"sceneArray":{"type":"dynamic","startRoom":"p001","endRoom":"p002","dynamicLength":7,"dynamicInventory":["p001","p002","p003","p004","p005","p006","p007","p008","p009","p010"]}},
    dbZoneObj;
    intNPCId = 0;
    army;       // [array] full of objects of Mob - controller
    player;     // [sprite] player sprite
    intMapLength;   // 地图总宽度(单位：tile数量) - 根据 sceneArr 配置计算得出
    // SpawnPoints;    // 怪物刷新点，随机地图创建完成之后，生成
    startPos = {x: 32* 6 + 16, y: 32 * 35 + 16};    // 默认的玩家初始位置
    bossPos;    // 默认的boss位置
    gameMap;    // 地图指针
    mapLayer = new Map();   // 图层集合
    playerDepth = 4;    // 玩家 sprite depth
    cameraZoom = 1.0;   // 默认摄像机缩放
    cameraZoom_max = 1.25;   // 最大放大倍数
    cameraZoom_min = 0.75;   // 最大缩小倍数
    cameraZoom_step = 0.0618;
    debug;  // 是否启动debug

    /** tile map 相关 */
    _tileRoomInJson = [];   // e.g. [{name:"p001",url:"assets/maps/rooms/p001.json"}]
    _tileSetImageArr = ["assets/maps/rooms/tileset_wall.png"];
    _tileSetNameArr = ["tileset_wall"];
    _tileLayerNameArr = ["sky","far","main","screen"];
    _roomCache = new Phaser.Cache.BaseCache();  // 存放所有需要载入的room(tilemap object) , 注意 Cache.tilemap 里面有 其他场景的 tilemap，所以不能混淆
    _roomsArr = []; // room 组成地图，默认room 空，顺序重要
    _zoneEntrance = undefined;
    _zoneEntranceText = undefined;
    _zoneExit = undefined;
    _zoneExitText = undefined;
    _missileArr = [];

    /** mob 相关 */
    // 包括所有mob 名称的列表 - 简单粗暴，全部加载，不要 _initMobSet 动态计算加载了。
    _mobList = ['bat','rabbit','bear','tiger','deer','bow-1','bow-2','bow-3','cavalry-1','cavalry-2','cavalry-3','katana-1','katana-2','katana-3','shield-1','shield-2','shield-3','spear-1','spear-2','spear-3','mummy'];
    _mobArr = [];   // 所有 Mob 的 Controller 对象 todo - 删除
    _mob_atlas_pre = 'assets/sprits/mobs/';
    _mob_json_pre = 'assets/sprits/mobs/';

    /** 物品 相关 */
    dropArr = [];   // 包含所有掉落的数组

    /** 无尽关 */
    intWave = 1;    // 默认wave 1 开始
    _objPrepareArmyResult = {"mobs":[],"flagEndlessAdj":false,"flagBossBattleAdj":false};

    /** 键盘鼠标输入 相关 */
    mouseTouchDown = false;
    phaserKeys = [];
    keys = [];

    // _msMusicIdle = 1;
    // _msMusicIdleMax = 3000;  // 3秒钟之后，播放下一个music

    /** 外功效果组 */
    wgeGroupFist = [];  // 所有的拳法
    wgeGroupSword = []; // 所有的剑法
    wgeGroupMachete = [];   // 所有的刀法
    wgeGroupSpear = []; // 所有的长柄
    wgeGroupEjection = [];  // 所有的暗器
    wgeGroupArc = [];   // 弧线刀光 wgeId = 8 特殊情况
    // paw | hammer | thunder | arrow | meteor | mine
    wgeGroupPaw = [];   // 动物爪击
    wgeGroupHammer = [];    // 锤
    wgeGroupThunder = [];   // 雷电
    wgeGroupArrow = [];     // 弓箭 弓矢
    wgeGroupMeteor = [];    // 流星
    wgeGroupMine = [];      // 地刺 地雷 骨牢等
    wgeGroupSpark = [];      // 索命

    _musicList = new Map([
        ['music_death',        'assets/audio/bg/death.mp3'],
        ['battle_boss_epic',        'assets/audio/bg/battle_boss_epic.mp3'],
        ['battle_encounter',        'assets/audio/bg/battle_encounter.mp3'],
        ['battle_encounter_loop',   'assets/audio/bg/battle_encounter_loop.mp3'],
        ['battle_in_the_winter',    'assets/audio/bg/battle_in_the_winter.mp3'],
        ['battle_mystical',         'assets/audio/bg/battle_mystical.mp3'],
        ['battle_rain_long',        'assets/audio/bg/battle_rain_long.mp3']
    ]);
    _musicInstanceMap = new Map();
    _musicBattleRandomKeyList = ["battle_boss_epic","battle_encounter","battle_encounter_loop","battle_in_the_winter","battle_mystical","battle_rain_long"];
    _pPlayingMusic = {};
    // _seKeyList = [
    //     "se_player_ejection","se_player_fist","se_player_sword","se_player_machete","se_player_spear","se_player_jump",
    //     "se_mob_beast_claw","se_mob_beast_roar","se_mob_deer_die","se_mob_cat_die","se_mob_beast_die","se_mob_beast_hurt",
    //     "se_mob_man_attack","se_mob_man_hurt_1","se_mob_man_hurt_2","se_mob_man_die","se_mob_mummy_die","se_mob_horse","se_mob_horse_die"
    // ];
    // _seInstanceMap = new Map();
    _seSprite = {};
    _bgSprite = {};

    anchor_move_ctrl_origin_x = 0;  // 屏幕移动虚拟按键中心位置 - createCamera 的时候赋值
    anchor_move_ctrl_origin_y = 0 ;
    move_ctrl_radius = 0;   // 屏幕移动虚拟按键的半径
    move_ctrl_jump_radius = 0;  // 这个半径内认为按的是跳/ 骑马，中心圆环
    arrow_right = false;    // 方向箭头，用来跟踪移动端输入
    arrow_up = false;
    arrow_down = false;
    arrow_left = false;
    arrow_center = false;
    tapZone = undefined;
    jumpZone = undefined; jumpZoneFX = undefined;
    arcT=undefined;arcL=undefined;arcR=undefined;arcB=undefined;
    arcTL=undefined;arcTR=undefined;arcBL=undefined;arcBR=undefined;
    // arcFillColor = 0x22b24c;jumpZoneFillColor = 0x22b24c;
    // arcFillColor = 0xEB6864;jumpZoneFillColor = 0xEB6864;
    arcFillColor = dbPlayer[pId].tint;jumpZoneFillColor = dbPlayer[pId].tint;
    arcFillAlpha = 0.1;
    arcRadius=0;


    constructor() {
        super(dynamic_scene_config);
    }

    init () {
        this.intNPCId = parseInt(this.scene.settings.data.npcId);
        // bug-fix 2023.11.25 切磋之后为了能够返回原来的城市，把dbPlayer[pId].zoneId 设置成了城市编号，而不是115=Arena了。
        this.dbZoneObj = (this.scene.settings.data.zoneObj) ? this.scene.settings.data.zoneObj :  gDB.getCityById(dbPlayer[pId].zoneId);
        this._initInputKeys();
        this._initRoomSet();   // 根据 dbZoneObj, 得到 所有需要加载的 room, set 无重复 , this._tileRoomInJson  = [{name:'',url:''}]
        // this._initMobSet(this.dbZoneObj.zoneId);    // 根据 dbZoneObj, 得到 所有需要加载的 mob sprite key , set 无重复 , this._mobList = ['rabbit','katana-1'];
    }

    preload() {
        this._loadTiledRoom();      // 载入所有需要展示的room素材
    }

    create() {
        this._createDynamicRoomsWithConf(this.dbZoneObj.sceneArray);    // 根据配置文件，创建随机地图：开始room 结束room 随机room
        this._createTemplateRooms();    // 创建模板room, 放入 _roomCache
        this._createDynamicMapFromRoom();   // 根据 _roomArr, 复制对应的 room 到地图，形成随机地图

        this._updateMapCollision(); // 设置地图碰撞

        this._createPlayer();   // 创建玩家
        this.physics.add.overlap(this.player.sprite, this._zoneEntrance,this._onLeaveScene);

        this._createMissile();

        this._createArmy(this.dbZoneObj.zoneId);  // 创建所有的怪物 controller
        // this._spawnArmy(this.dbZoneObj.sceneArray);  // 根据地图尺寸，怪物信息，计算刷新点，并更新 army 信息
        // 创建第一波 MobCtrl
        this.army = ArmyModel.prepareMobCtrList(this._objPrepareArmyResult, this, this.intWave);
        // this._spawnArmy_v2_with_random_pos_no_recursive(this.dbZoneObj.sceneArray);  // 根据地图尺寸，怪物信息，计算刷新点，并更新 army 信息
        this._spawnArmy_v3_with_section_random_pos_no_recursive(this.dbZoneObj.sceneArray);  // 根据地图尺寸，怪物信息，计算刷新点，并更新 army 信息

        if(this.army.length <=0){
            // this.player.hud.addHurtInfo("空旷寂寥，竟无敌手。");
            gGui.showScreenMask(globalStrings.QB_EMPTY);
        }

        this._createCamera();
        this._bindMouse();
        if(GlobalConfig.TAP_DEVICE) this._bindTapZone();
        let startStr = this._objPrepareArmyResult.flagEndlessAdj ? (this.dbZoneObj.zoneName + "<br/>Wave " + this.intWave) : this.dbZoneObj.zoneName;
        gGui.showScreenMask(startStr);
    }

    update(time,delta) {
        // this.player.update(time,delta);
        // this.mapLayer.get('far').x = (this.player.sprite.x - this.startPos.x)/100;
        // this.debug.setText("FPS="+parseInt(1000/delta));
        // this.debug.setPosition(this.cameras.main.scrollX + this.cameras.main.width/2,this.cameras.main.scrollY+ 40);
        if(GlobalConfig.TAP_DEVICE) this._tapHandler();
        this.player.update(time,delta);
        // this.army.forEach(m => {
        //     m.update(time,delta);
        // });
        for(let i=0;i<this.army.length;i++){
            if(this.army[i].flagIsBossOfThisLevel !== undefined ){
                if(this.army[i].flagIsBossOfThisLevel && (!this.army[i].model.isAlive) && (!this._objPrepareArmyResult.flagEndlessAdj) ){
                    this._showExit();  // boss 死亡, 不是无尽关， 显示出口
                }
            }

            if(this.army[i].sprite.shouldDestroy){
                this.army[i].destroy(); // 需要同时移除所有 missile 与它的 overlap
                this.army.splice(i,1);
                i=i-1;
            }else{
                this.army[i].update(time,delta);
            }
        }


        // 如果是无尽关，并且当前怪物已清空，那么刷新下一波
        if((this._objPrepareArmyResult.flagEndlessAdj) && (this.army.length<=0)){
            this.intWave++;
            this.army = ArmyModel.prepareMobCtrList(this._objPrepareArmyResult, this, this.intWave);
            // this._spawnArmy_v2_with_random_pos_no_recursive(this.dbZoneObj.sceneArray);  // 根据地图尺寸，怪物信息，计算刷新点，并更新 army 信息
            this._spawnArmy_v3_with_section_random_pos_no_recursive(this.dbZoneObj.sceneArray);  // 根据地图尺寸，怪物信息，计算刷新点，并更新 army 信息
            // this.player.hud.addHurtInfo("Wave " + this.intWave );
            gGui.showScreenMask("Wave " + this.intWave)
            this.playMusic();
        }

        // if(this._msMusicIdle <=0){
        //     this._msMusicIdle = this._msMusicIdle + delta;
        // }
        //
        // if(this._msMusicIdleMax >= this._msMusicIdleMax){
        //     this.playMusic();
        //     // this._msMusicIdle = 1;
        // }

        // console.log(this._pPlayingMusic.getCurrentTime() + "/" + this._pPlayingMusic.totalDuration);

        for(let i=0;i<this.dropArr.length;i++){
            if(this.dropArr[i].isLooted){
                this.dropArr[i].destroy();
                this.dropArr.splice(i,1);
                i = i -1;
            }else{
                this.dropArr[i].update(time,delta);
            }
        }

        this.wgeGroupFist.update(time,delta);
        this.wgeGroupSword.update(time,delta);
        this.wgeGroupMachete.update(time,delta);
        this.wgeGroupSpear.update(time,delta);
        this.wgeGroupEjection.update(time,delta);
        this.wgeGroupArc.update(time,delta);
        this.wgeGroupPaw.update(time,delta);   // 动物爪击
        this.wgeGroupHammer.update(time,delta);    // 锤
        this.wgeGroupThunder.update(time,delta);   // 雷电
        this.wgeGroupArrow.update(time,delta);     // 弓箭 弓矢
        this.wgeGroupMeteor.update(time,delta);    // 流星
        this.wgeGroupMine.update(time,delta);      // 地刺 地雷 骨牢等
        this.wgeGroupSpark.update(time,delta);      //


        // Game.input.activePointer is either the first finger touched, or the mouse
        if (game.input.activePointer.leftButtonDown()) {
            // We'll manually keep track if the pointer wasn't already down
            if (!this.mouseTouchDown) {
                this.touchDown();
            }
        } else {
            if (this.mouseTouchDown) {
                this.touchUp();
            }
        }
    }

    /**
     * player sound effect. call it from player.js or MobController.js
     * @param key key name in seList
     */
    playSoundEffect(key){
    }

    touchDown() {
        // Set touchDown to true, so we only trigger this once
        this.mouseTouchDown = true;
        // console.log("dynamicScene left mouse");
        // BubbleWidget.InputKey1();
        // this.fireLaser();   // debug purpose , test missiles
        // this.fireLaserMob();    // test mob missiles


    }

    touchUp() {
        // Set touchDown to false, so we can trigger touchDown on the next click
        this.mouseTouchDown = false;
    }

    /**
     * 绑定 键盘 和 鼠标输入
     * @private
     */
    _initInputKeys(){
        const { W,S,A, D, ENTER, SPACE,} = Phaser.Input.Keyboard.KeyCodes;
        this.keys = this.input.keyboard.addKeys({
            left: A,
            right: D,
            up: W,
            down: S,
            space: SPACE,
            enter : ENTER
        });
    }
    /**
     * 获取所有需要加载的room 的 {name:'',url:''} 描述对象，set，无重复
     * @private
     */
    _initRoomSet(){
        let zoneConf = this.dbZoneObj.sceneArray;
        // {"type":"dynamic","startRoom":"p001","endRoom":"p002","dynamicLength":7,"dynamicInventory":["p001","p002","p003","p004","p005","p006","p007","p008","p009","p010"]}
        // 准备所有的room 列表
        if(zoneConf.type==="dynamic"){
            let listAll = zoneConf.dynamicInventory.concat(zoneConf.startRoom,zoneConf.endRoom);
            let mapsAll = Array.from(new Set(listAll));  // 去重
            for(let i=0;i<mapsAll.length;i++){
                this._tileRoomInJson.push({"name":mapsAll[i],"url":"assets/maps/rooms/"+mapsAll[i]+".json"});
            }
        }
    }
    _loadTiledRoom(){
        // tile set image
        let that = this;
        /** - 20220812 image 的加载已经放到 asset.json 和 bootScene
        this._tileSetImageArr.forEach(function(value,index){
            that.load.image("tileImageDynamic"+index,value);
        });
        */
        // tile map in json format & compressed b64
        // this.load.tilemapTiledJSON('worldmap', this._tileMapInJson);
        this._tileRoomInJson.forEach(function (o){
            that.load.tilemapTiledJSON(o.name,o.url);
        });
    }

    /**
     * 创建模板room,放进 _roomCache
     * @private
     */
    _createTemplateRooms(){
        for(let i=0;i<this._tileRoomInJson.length;i++){
            this._roomCache.add(this._tileRoomInJson[i].name,this.make.tilemap({key:this._tileRoomInJson[i].name}));
            // console.log(this._roomCache.get(this._tileRoomInJson[i].name));
        }
        // let templateNameArr = Array.from(new Set(this._roomsArr));  // 去重，只加载需要加载的地图
        // for(let i=0;i<templateNameArr.length;i++){
        //     this._roomCache.add(templateNameArr[i],this.make.tilemap({key:templateNameArr[i]}));
        // }
    }
    /**
     * 根据配置文件，创建随机地图：开始room 结束room 随机room
     * @param conf {"startRoom":"p001","endRoom":"p002","dynamicLength":7,"dynamicInventory":[]}
     * @private
     */
    _createDynamicRoomsWithConf(conf){
        // 不是按照宽度来，而是根据conf 配置：{"startRoom":"p001","endRoom":"p002","dynamicLength":7,"dynamicInventory":[]}
        let cache = this.cache.tilemap;
        let intMinIndex = 0;
        let intMaxIndex = conf.dynamicInventory.length;
        this.intMapLength = 0;    // 当前的width
        this._roomsArr = [];     // 清空 rooms Arr
        this._roomsArr.push(conf.startRoom);
        this.intMapLength = this.intMapLength + cache.get(conf.startRoom).data.width;
        for(let i=0;i<conf.dynamicLength;i++){
            let nextRoomsIndex = GlobalFunction.getRand(intMinIndex,intMaxIndex);    // 预生成下一个房间的idx [intMinIndex,intMaxIndex)
            // fix-work-around 20240327
            // 更改了w008 w009 的地图，只能用于开始和结束，移除了dbCity中 随机Iventory随机到 w008 w009 的情况
            // 但是原来存档中，dbCity是保存的，因此老存档会让然随机到这两个图
            // 临时解决办法，如果随机到这两个地图，就用隔壁的代替
            let roomName = conf.dynamicInventory[nextRoomsIndex] === "w008" ? "w007" : conf.dynamicInventory[nextRoomsIndex];
            roomName = roomName === "w009" ? "w010" : roomName;
            this._roomsArr.push(roomName);
            this.intMapLength = this.intMapLength + cache.get(roomName).data.width;
        }
        this._roomsArr.push(conf.endRoom);
        this.intMapLength = this.intMapLength + cache.get(conf.endRoom).data.width;
        // console.log(this._roomsArr);
    }
    /**
     * 创建 Army = [mob controller]
     * @private
     */
    _createArmy(intZoneId){
        // 准备所有的 mobRaw 数据
        this._objPrepareArmyResult = ArmyModel.prepareMobRaw(intZoneId,this.intNPCId);
    }
    /**
     * 随机地图创建完毕后，根据army信息，创建刷新点，并刷新army信息
     * @private
     */
    _spawnArmy(conf){
        // 计算随机部分的总长度：地图长度 - startRoom长度  - endRoom长度
        // 计算可以刷新的格子总数：宽度固定是7 = [32,38]，长度如上
        // 计算所有可以刷新的格子编号：
            // [ 0, 7, ...
            // [ 1, 8, ...
            // [ 2, 9, ...
            // [ 3, 10,
            // [ 4,
            // [ 5,
            // [ 6,
        // 从所有编号中，随机获取 army 长度 -1 个 ，得到刷新点
        // boss 固定在 endRoom 的中间，不计入 spawnPoints
        // player 固定在 start Room x=2,y=35(32~38, 居中)，不计入 spawnPoints
        let cache = this.cache.tilemap;
        let startRoomLength = cache.get(conf.startRoom).data.width;
        let endRoomLength = cache.get(conf.endRoom).data.width;
        let randRoomTiles = this.intMapLength - startRoomLength - endRoomLength;
        let randRoomTilesStart = startRoomLength * 7;
        let randRoomTilesRange = randRoomTiles * 7;
        let mobCounts = this.army.length - 1;
        let tileArr = GlobalFunction.getRandUnique(randRoomTilesStart,randRoomTilesRange,mobCounts);

        // 部分场景，可能里面空的，没有怪物，就不需要计算刷新位置了。
        if(mobCounts<=0) return;

        // todo: check 是否可以用 Arcade.Sprite.setRandomPosition 代替？ - 可能不行，要解决重复问题？
        for(let i=0;i<tileArr.length;i++){
            let col = Math.floor(tileArr[i] / 7);
            let row = tileArr[i] - col * 7 + 32;

            if(this.mapLayer.get("far").layer.data[row][col].index !== -1){
                console.log("unplaceable pos detected: row="+row+" , col="+ col);
                let newPos = this._utilGetNextAvailableSpawnPoint(row,col); // 向下尝试新的可用刷新点。
                // 如果找到的下一个可用刷新点，与后一个刷新点重合，放弃本刷新点
                if(i<tileArr.length-1){
                    let nextCol = Math.floor(tileArr[i+1] / 7);
                    let nextRow = tileArr[i+1] - nextCol * 7 + 32;
                    if((newPos.row !== nextRow ) && (newPos.col !== nextCol)){
                        col = newPos.col;
                        row = newPos.row;
                    }
                }
            }
            let sp = {x: 32* col + 16 ,y: 32 * row + 16};   // origin 都设置为 0.5 0.5 与 sprite 对齐
            // this.spawnPoints.push(sp);
            // this.army[i].pos_x = sp.x;
            // this.army[i].pos_y = sp.y;
            this.army[i].moveTo(sp.x,sp.y);
            this.army[i].setAITargetPosition(sp.x,sp.y);
            // this.army[i].sprite.setDepth(this.army[i].sprite.depth + i);
            // updated 20230705 设置为 main  的depth =3
            // this.mapLayer.get("main").add(this.army[i].sprite);
            this.army[i].sprite.setDepth(3);
            // this.mapLayer.get("main")._depth
        }

        this.bossPos = {x: (this.intMapLength - endRoomLength * 0.5 ) * 32 + 16, y: 32 * 35 + 16};
        // this.army[this.army.length-1].pos_x = this.bossPos.x;
        // this.army[this.army.length-1].pos_y = this.bossPos.y;
        this.army[this.army.length-1].moveTo(this.bossPos.x,this.bossPos.y);
        this.army[this.army.length-1].setAITargetPosition(this.bossPos.x,this.bossPos.y);
        this.army[this.army.length-1].sprite.setDepth(3);
        // console.log(this.bossPos);

        // todo :  bug -  spawn point 可能在 不可到达的地点，比如 竹林中间。 需要test 或者移动位置
        // bug-fix: 检查 far 是否为 -1
    }
    _spawnArmy_v2_with_random_pos_no_recursive(conf){
        let cache = this.cache.tilemap;
        let startRoomLength = cache.get(conf.startRoom).data.width;
        let endRoomLength = cache.get(conf.endRoom).data.width;
        let randRoomTiles = this.intMapLength - startRoomLength - endRoomLength;
        let mobCounts = this.army.length - 1;
        // 部分场景，可能里面空的，没有怪物，就不需要计算刷新位置了。
        if(mobCounts<0) return;

        let rectX = 32 * startRoomLength // startRoom 不刷怪
        let rectY = arg_pos_y_min; // 与 MobSprite Line 252 相同
        let rectW = 32 * randRoomTiles;  // 随机范围宽度
        let rectH = arg_pos_y_max - arg_pos_y_min; // 与 MobSprite Line 253 相同 +8 - 32

        // console.log(this.army);

        for(let i=0;i<this.army.length-1;i++){
            // this.army[i].sprite.setRandomPosition(rectX,rectY,rectW,rectH);
            // let x = isNaN(this.army[i].sprite.x) ? rectX + rectW * 0.5 : this.army[i].sprite.x;
            // let y = isNaN(this.army[i].sprite.y) ? rectY + rectH * 0.5 : this.army[i].sprite.y;
            let x = Math.floor(rectX + rectW * Math.random());
            let y = Math.floor(rectY + rectH * Math.random());
            this.army[i].moveTo(x,y);
            this.army[i].setAITargetPosition(x,y);

            // this.army[i].setAITargetPosition(this.army[i].sprite.x,this.army[i].sprite.y);
            this.army[i].sprite.setDepth(3);
            this.army[i].addColliderWithMissile();
        }

        this.bossPos = {x: (this.intMapLength - endRoomLength * 0.5 ) * 32 + 16, y: 32 * 35 + 16};
        this.army[this.army.length-1].moveTo(this.bossPos.x,this.bossPos.y);
        this.army[this.army.length-1].setAITargetPosition(this.bossPos.x,this.bossPos.y);
        this.army[this.army.length-1].sprite.setDepth(3);
        this.army[this.army.length-1].addColliderWithMissile();
        this.army[this.army.length-1].flagIsBossOfThisLevel = true;  // 设置为boss。死亡之后出现出口。
    }
    _spawnArmy_v3_with_section_random_pos_no_recursive(conf){
        let cache = this.cache.tilemap;
        let startRoomLength = cache.get(conf.startRoom).data.width;
        let endRoomLength = cache.get(conf.endRoom).data.width;
        let randRoomTiles = this.intMapLength - startRoomLength - endRoomLength;
        let mobCounts = this.army.length - 1;
        // 部分场景，可能里面空的，没有怪物，就不需要计算刷新位置了。
        if(mobCounts<0) return;

        let rectX = 32 * startRoomLength // startRoom 不刷怪
        let rectY = arg_pos_y_min; // 与 MobSprite Line 252 相同
        let rectW = 32 * randRoomTiles;  // 随机范围宽度
        let rectH = arg_pos_y_max - arg_pos_y_min; // 与 MobSprite Line 253 相同 +8 - 32

        // 刷怪区域分为N块，怪物前面1/N刷在左边1/N区域，以此类推。boss逻辑不变
        for(let i=0;i<this.army.length-1;i++){
            let secS = i / this.army.length;    // 开始刷新区域 ....../
            let secE = (i+2) / this.army.length;    // 结束刷新区域 ....../xxx/
            let x = Math.floor(rectX + rectW * secS + rectW * Math.random() * (secE - secS));
            let y = Math.floor(rectY + rectH * Math.random());
            this.army[i].moveTo(x,y);
            this.army[i].setAITargetPosition(x,y);

            this.army[i].sprite.setDepth(3);
            this.army[i].addColliderWithMissile();
        }

        this.bossPos = {x: (this.intMapLength - endRoomLength * 0.5 ) * 32 + 16, y: 32 * 35 + 16};
        this.army[this.army.length-1].moveTo(this.bossPos.x,this.bossPos.y);
        this.army[this.army.length-1].setAITargetPosition(this.bossPos.x,this.bossPos.y);
        this.army[this.army.length-1].sprite.setDepth(3);
        this.army[this.army.length-1].addColliderWithMissile();
        this.army[this.army.length-1].flagIsBossOfThisLevel = true;  // 设置为boss。死亡之后出现出口。
    }

    _utilGetNextAvailableSpawnPoint(row,col){
        let ret = {row:-1,col:-1};
        let newRow = row + 1;
        if(newRow >=32 && newRow<=38){
            if(this.mapLayer.get("far").layer.data[newRow][col].index === -1) return {row:newRow,col:col}
        }else{
            ret = this._utilGetNextAvailableSpawnPoint(32,col+1);
        }
        return ret;
    }

    /**
     * 复制图层中的所有数据，到另外一个图层，工具函数
     * @param srcLayer
     * @param desLayer
     * @param left
     * @param top
     * @private
     */
    _copyLayerToLayer(srcLayer,desLayer,left,top){
        for(let row=0;row<srcLayer.data.length;row++){
            for(let col=0;col<srcLayer.data[0].length;col++){
                if(srcLayer.data[row][col].index !== -1){
                    desLayer.putTileAt(srcLayer.data[row][col].index-1,col + left,row + top,true);
                }
            }
        }
    }

    /**
     * 根据 _roomArr，使用已经预创建的room，分别复制到 map中，形成随机大地图
     * @private
     */
    _createDynamicMapFromRoom(){
        // 把roomsArr 里面每个room，放置到 gameMap ，不见的地方
        // 对于 this.roomArr, 里面的每个room（room放置在上面不可见的地方）: 复制对应的layer,到对应的位置（在可见位置）

        this.gameMap = this.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: this.intMapLength,
            height: 50,
        });
        this.mapWidthTotal = this.gameMap.widthInPixels;
        this.mapHeightTotal = this.gameMap.heightInPixels;

        // const tileset = [];
        // tileset.push(this.gameMap.addTilesetImage("tileImageDynamic0", null, 32, 32, 1, 2)); // 1px margin, 2px spacing
        // tileset.push(this.gameMap.addTilesetImage("tileImageDynamic1", null, 32, 32, 0, 0));
        // tileset.push(this.gameMap.addTilesetImage("tileImageDynamic2", null, 32, 32, 0, 0));
        const tileset_wall = this.gameMap.addTilesetImage("tileset_wall","tileImageDynamic0", 32, 32, 1, 2,0); // 1px margin, 2px spacing
        const ts_2024 = this.gameMap.addTilesetImage("ts-2024","tileImageDynamic1",  32, 32, 1, 2,400);
        const ts_img = this.gameMap.addTilesetImage("ts-img","tileImageDynamic2",  32, 32, 1, 2,1424);

        this.mapLayer.set("sky",this.gameMap.createBlankLayer("sky", [tileset_wall,ts_2024,ts_img]).fill(TILES_BLANK).setDepth(1));
        this.mapLayer.set("far",this.gameMap.createBlankLayer("far", [tileset_wall,ts_2024,ts_img]).fill(TILES_BLANK).setDepth(2));
        this.mapLayer.set("main",this.gameMap.createBlankLayer("main", [tileset_wall,ts_2024,ts_img]).fill(TILES_BLANK).setDepth(3));
        this.mapLayer.set("screen",this.gameMap.createBlankLayer("screen", [tileset_wall,ts_2024,ts_img]).fill(TILES_BLANK).setDepth(6).setAlpha(0.618));

        /** 一个layer 一个layer 循环， 解决 depth 问题 */
        let left = 0;
        for(let r=0;r<this._roomsArr.length;r++){
            let room = this._roomCache.get(this._roomsArr[r]);
            this._copyLayerToLayer(room.getLayer("sky"),this.mapLayer.get("sky"),left,0);
            left = left + room.width;
        }

        left = 0;
        let mp_layer_far = this.mapLayer.get("far");
        for(let r=0;r<this._roomsArr.length;r++){
            let room = this._roomCache.get(this._roomsArr[r]);
            this._copyLayerToLayer(room.getLayer("far"),mp_layer_far,left,0);
            left = left + room.width;
        }

        left = 0;
        for(let r=0;r<this._roomsArr.length;r++){
            let room = this._roomCache.get(this._roomsArr[r]);
            this._copyLayerToLayer(room.getLayer("main"),this.mapLayer.get("main"),left,0);
            left = left + room.width;
        }

        left = 0;
        for(let r=0;r<this._roomsArr.length;r++){
            let room = this._roomCache.get(this._roomsArr[r]);
            this._copyLayerToLayer(room.getLayer("screen"),this.mapLayer.get("screen"),left,0);
            left = left + room.width;
        }

        // 设置 zone,用于离开 场景
        // this.zoneEntrance = this.add.zone(32, (arg_pos_y_min + arg_pos_y_max)/2).setSize(64, (arg_pos_y_max - arg_pos_y_min));
        this._zoneEntrance = this.add.rectangle(32, (arg_pos_y_min + arg_pos_y_max)/2,64, (arg_pos_y_max - arg_pos_y_min),0x137ea7,0.32);
        this._zoneEntrance.setDepth(3);
        this.physics.world.enable(this._zoneEntrance);
        this._zoneEntrance.body.setAllowGravity(false);
        this._zoneEntrance.body.moves = false;
        // this._zoneEntrance.setTint(0x3C3C3C);
        // exit string:   ⇦
        this._zoneEntranceText = this.add.text(6, (arg_pos_y_min + arg_pos_y_max -24 )/2," ⇦ ",
            {fontSize: "32px", fontFamily:"SimHei,'Microsoft YaHei',monospace",color: "#FFFFFF",
            stroke: "#EB6864", strokeThickness:4,
            align: "center",maxLines:1,
        });
        this._zoneEntranceText.setDepth(3);
    }

    _showExit(){
        if(this._zoneExit != null) return;
        if(this._zoneExitText != null) return;
        this._zoneExit = this.add.rectangle(32 * this.intMapLength - 32, (arg_pos_y_min + arg_pos_y_max)/2, 64 , (arg_pos_y_max - arg_pos_y_min),0x137ea7,0.32);
        this._zoneExit.setDepth(3);
        this.physics.world.enable(this._zoneExit);
        this._zoneExit.body.setAllowGravity(false);
        this._zoneExit.body.moves = false;
        this._zoneExitText = this.add.text(32 * this.intMapLength - 56, (arg_pos_y_min + arg_pos_y_max -24 )/2," ⇨ ",
            {fontSize: "32px", fontFamily:"SimHei,'Microsoft YaHei',monospace",color: "#FFFFFF",
                stroke: "#EB6864", strokeThickness:4,
                align: "center",maxLines:1,
            });
        this._zoneExitText.setDepth(3);
        this.physics.add.overlap(this.player.sprite, this._zoneExit,this._onLeaveScene);
    }

    _onLeaveScene(){
        // this.exitScene();
        gGui.hideScreenMask();
        let sce = game.scene.getScene("DynamicScene");
        if(sce != null){
            sce.cameras.main.fadeIn(1000, 0, 0, 0);
        }
        gApp.reEnterWorld();
    }

    _updateMapCollision(){
        this.mapLayer.get("sky").setCollision(tileset_wall_collision_array,true);
        this.mapLayer.get("far").setCollision(tileset_wall_collision_array,true);
        this.mapLayer.get("main").setCollision(tileset_wall_collision_array,true);
        this.mapLayer.get("screen").setCollision(tileset_wall_collision_array,true);
    }

    _onCollideWithEnvironment(p,o){
        if(undefined === o) return;
        if(o.properties === undefined) return;
        if(p.onGround === false){ // 在空中碰到了障碍物
            p.onGround = true;
            // console.log("空中碰到了障碍物");
            let p_bottom = p.y + p.height * 0.5;
            let o_top = o.y + o.height;
            if(p_bottom >= o_top){
                p.y = o_top;
            }
            // p.sprite.refreshBody();
        }
    }
    _onUsePotion(player,potion){
        potion.destroy();
        CharacterModel.healSelf(0.2*dbPlayer[pId].maxHP);
        CharacterModel.manaSelf(0.2*dbPlayer[pId].maxMP);
        gGui.playSoundEffect("succ");
    }

    _createMissile(){
        this.wgeGroupFist = new WgeGroup(this,"fist");
        this.wgeGroupSword = new WgeGroup(this,"sword");
        this.wgeGroupMachete = new WgeGroup(this,"machete");
        this.wgeGroupSpear = new WgeGroup(this,"spear");
        this.wgeGroupEjection = new WgeGroup(this,"ejection");
        this.wgeGroupArc = new WgeGroup(this,"arc");
        this.wgeGroupPaw = new WgeGroup(this,"paw");   // 动物爪击
        this.wgeGroupHammer = new WgeGroup(this,"hammer");    // 锤
        this.wgeGroupThunder = new WgeGroup(this,"thunder");   // 雷电
        this.wgeGroupArrow = new WgeGroup(this,"arrow");     // 弓箭 弓矢
        this.wgeGroupMeteor = new WgeGroup(this,"meteor");    // 流星
        this.wgeGroupMine = new WgeGroup(this,"mine");      // 地刺 地雷 骨牢等
        this.wgeGroupSpark = new WgeGroup(this,"spark");      // 地刺 地雷 骨牢等
    }

    _bindMouse(){
        let that = this;
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            that._zoomCamera(deltaY);
        });
    }

    showFPS(){
        if(this.fpsText === undefined){
            this.fpsText = this.add.text(this.cameras.main.x, this.cameras.main.y, '', { font: '20px Courier', fill: '#00ff00' });
            this.fpsText.setDepth(9999999999);
        }
    }

    _createDebug(){
        // Turn on physics debugging to show player's hitbox
        this.physics.world.createDebugGraphic();
        this.debug = this.add.text(200, 32*30, '', { font: '20px Courier', fill: '#00ff00' });
        this.debug.setDepth(9999999999);
        // Create worldLayer collision graphic above the player, but below the help text
        const graphics = this.add
            .graphics()
            .setAlpha(0.75)
            .setDepth(9999999999);
        this.mapLayer.get("main").renderDebug(graphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
        this.mapLayer.get("far").renderDebug(graphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
        this.mapLayer.get("sky").renderDebug(graphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
        this.mapLayer.get("screen").renderDebug(graphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });

    }

    _createPlayer(){
        // this.startPos = this.gameMap.findObject("player", obj => obj.name === "PlayerStartLocation");
        // if(this.startPos === null) this.startPos = {x:100,y:arg_pos_y_max};   // debug purpose
        CharacterModel.restorePlayerState();
        this.player = new Player(this,this.playerDepth);       // depth: 取决于 layer 数组 world layer 位置
        this.player.moveTo(this.startPos.x,this.startPos.y);
        this.player.updateTotalState();

        this.physics.world.bounds.height = this.gameMap.heightInPixels;
        this.physics.world.bounds.width = this.gameMap.widthInPixels;
        this.physics.world.addCollider(this.player.sprite, this.mapLayer.get("main"),this._onCollideWithEnvironment);
        this.physics.world.addCollider(this.player.sprite, this.mapLayer.get("far"),this._onCollideWithEnvironment);
        this.physics.world.addCollider(this.player.sprite, this.mapLayer.get("sky"),this._onCollideWithEnvironment);

        this.player.sprite.setCollideWorldBounds(true);
    }

    _createCamera(){
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setZoom(this.cameraZoom);
        this.cameras.main.setBounds(0, 0, this.gameMap.widthInPixels, this.gameMap.heightInPixels);

        return;
        // todo: enhance the logic here.
        let vmin = canvasWidth > canvasHeight ? canvasHeight : canvasWidth;
        // let mw= this.intMapLength * 32;
        let miniW = vmin * 0.5;
        let minH = vmin * 0.14;
        let ratio = 0.2;
        // let ch = this.player.arg_pos_y_max - this.player.arg_pos_y_min;
        // let ratio = ch / miniH;
        // let miniW = ratio * this.gameMap.widthInPixels;
        this.minimap = this.cameras.add(canvasWidth - miniW, vmin * 0.14, miniW, minH).setZoom(ratio).setName('mini');
        this.minimap.setBackgroundColor(0x22222216);
        // this.minimap.scrollX = miniW*0.5;
        // this.minimap.scrollY = this.player.arg_pos_y_min;
        this.minimap.ignore(this.mapLayer.get("sky"));
        // this.minimap.ignore(this.mapLayer.get("far"));
        this.minimap.ignore(this.mapLayer.get("screen"));
        this.minimap.setBounds(0, 0, this.gameMap.widthInPixels, this.gameMap.heightInPixels);
        this.minimap.startFollow(this.player.sprite);
    }
    _zoomCamera(d){
        let dd = d/1000;
        if(dd<0){
            this.cameraZoom = this.cameraZoom - dd > this.cameraZoom_max ? this.cameraZoom_max : this.cameraZoom - dd;
        }else if(dd>0){
            this.cameraZoom = this.cameraZoom - dd < this.cameraZoom_min ? this.cameraZoom_min : this.cameraZoom - dd;
        }
        this.cameras.main.setZoom(this.cameraZoom);
        this._redrawTapZone();
    }

    _onOverlapWithPlayer(bullet,player){
        // bullet.destroy();
        bullet.hideSelf();

        return;
        // p.body.setVelocity(0);
        let ox = o.realX;
        let oy = o.realY;
        if(o.properties.isZone || o.properties.isCity){
            if(ox>=0 && oy>=0){
                p.body.setVelocity(0,0);
                let zone = gDB.getZoneByPos(ox,oy);
                if(zone !== undefined){
                    console.log(zone.zoneName);
                    // dbPlayer[pId].isInZone  =  true;
                    gApp.enterZone(zone.zoneId);
                    // game.scene.getScene("WorldScene")._removeOldChunks();
                    // empty chunk_cache
                }
            }
        }
    }

    _onOverlapWithMob(bullet,mob){
        // bullet.destroy();
        console.log("missile collide mob");
        bullet.hideSelf();
        if(bullet.dmg === undefined) return;
        if(isNaN(bullet.dmg)) return;
        mob.controller.hurt(bullet.dmg);

        return;
        // p.body.setVelocity(0);
        let ox = o.realX;
        let oy = o.realY;
        if(o.properties.isZone || o.properties.isCity){
            if(ox>=0 && oy>=0){
                p.body.setVelocity(0,0);
                let zone = gDB.getZoneByPos(ox,oy);
                if(zone !== undefined){
                    console.log(zone.zoneName);
                    // dbPlayer[pId].isInZone  =  true;
                    gApp.enterZone(zone.zoneId);
                    // game.scene.getScene("WorldScene")._removeOldChunks();
                    // empty chunk_cache
                }
            }
        }
    }

    _onOverlapWithBullet(bullet, sprite){
        if(bullet.dmg === undefined) return;
        if(bullet.collideWith == null) return;
        if(isNaN(bullet.dmg)) return;
        // console.log("overlap with bullet callback trigger, collidewith="+bullet.collideWith + " spriteName="+sprite.name);
        let sce = game.scene.getScene("DynamicScene");
        if(bullet.collideWith === 'player') {        // mob attack player
            // console.log("player get hurt dmg="+bullet.dmg);
            // 重写逻辑，统一通过 getHurt方法
            // 元素 -1 代表 player
            if(sprite.name!=='player') return;
            if(!dbPlayer[pId].isAlive) return;
            if(bullet.hitArray.lastIndexOf(-1) < 0){
                // 没有与玩家碰撞过
                bullet.hitArray.push(-1);
                let playerDmg = sce.player.getHurt(bullet.dmg); // 等同于 gQuickBattle line 517 开始，做miss def 判断
                // 以上，等于 gQuickBattle line 520 得到了 actDmg / playerDmg
                // 玩家 反伤 逻辑
                if (playerDmg <=0) return;  // 玩家闪避/招架等，无实际伤害，则不计算反伤、吸血、debuff
                CharacterModel.resetCombo();    // 玩家被击中，取消combo
                if(sce.army[bullet.fireFrom] && sce.army[bullet.fireFrom].model){  // 可能这个时候mob已经死了，并且被 destroy了
                    if(dbPlayer[pId].totalState.fdb > 0){
                        let fdDmg = Math.ceil(dbPlayer[pId].totalState.fdb * bullet.dmg);
                        sce.army[bullet.fireFrom].model.getHurt(fdDmg);
                        // fix 被反伤打死后，下一行，无法addHurtInfo
                        if(sce.army[bullet.fireFrom].model.isAlive){
                        // if(sce.army[bullet.fireFrom].sprite.hud){
                            sce.army[bullet.fireFrom].sprite.hud.addHurtInfo("-"+fdDmg);
                        }
                    }
                    // 吸血按照实际伤害，因此如果无实际伤害，则无吸血
                    if(playerDmg <=0) return;  // 闪避 招架 ，直接结束。
                    // mob 吸血逻辑
                    if(sce.army[bullet.fireFrom].model.fdh > 0 ){
                        let hAmount = Math.ceil(sce.army[bullet.fireFrom].model.fdh * playerDmg);
                        sce.army[bullet.fireFrom].model.healSelf(hAmount);
                        sce.army[bullet.fireFrom].sprite.hud.addHurtInfo("+"+hAmount);
                    }
                }

                // console.log(bullet.debuffArr);

                // -- 从 gQuickBattle copy过来，考虑统一
                // gQuickBattle 543 行开始 -
                // todo: 注意mob 可能有 debuff 的情况，是否要重写 或者 调整 ，例如QuickBattle 定身是命中-50%，但是实际应该就是不能动。
                if(!Array.isArray(bullet.debuffArr)) return;
                if(bullet.debuffArr.indexOf(815) >= 0){
                    // {"skill_id":815,"affix":"深寒","desc":"攻击附带减速（hst）效果20%，持续6秒","type":"passive","cdMax":"","duration":6000,"range":"","dmgRate":0.2,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                    // - hst
                    if(CharacterModel.isDebuffHit(bullet.level)){
                        CharacterModel.gainDeBuff(815);
                        sce.player.hud.addHurtInfo(globalStrings.MOB_SKILL_AFFIX_815);
                        DeBuffWidget.guiUpdate();
                    }else{
                        sce.player.hud.addHurtInfo(globalStrings.INFO_RESIST);
                    }
                }
                if(bullet.debuffArr.indexOf(816) >= 0){
                    // {"skill_id":816,"affix":"剧毒","desc":"攻击附带中毒效果，60秒内造成持续伤害","type":"passive","cdMax":5,"duration":60000,"range":"","dmgRate":0.25,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                    // - hp
                    if(CharacterModel.isDebuffHit(bullet.level)){
                        CharacterModel.gainDeBuff(816,playerDmg);
                        sce.player.hud.addHurtInfo(globalStrings.MOB_SKILL_AFFIX_816);
                        DeBuffWidget.guiUpdate();
                    }else{
                        sce.player.hud.addHurtInfo(globalStrings.INFO_RESIST);
                    }
                }
                if(bullet.debuffArr.indexOf(817) >= 0){
                    // {"skill_id":817,"affix":"暗影","desc":"盲目，无法视物，持续2秒","type":"passive","cdMax":"","duration":2000,"range":"","dmgRate":"","wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                    // - 命中率 hit - 50%
                    if(CharacterModel.isDebuffHit(bullet.level)){
                        CharacterModel.gainDeBuff(817);
                        sce.player.hud.addHurtInfo(globalStrings.MOB_SKILL_AFFIX_817);
                        DeBuffWidget.guiUpdate();
                        sce.cameras.main.fadeFrom(2000,0,0,0,true);
                    }else{
                        sce.player.hud.addHurtInfo(globalStrings.INFO_RESIST);
                    }
                }
                if(bullet.debuffArr.indexOf(818) >= 0){
                    // {"skill_id":818,"affix":"击退","desc":"攻击附带击退打断效果，距离60像素","type":"passive","cdMax":"","duration":"","range":"","dmgRate":"","wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""},
                    // - stun , update delta 停止，防御无效
                    if(CharacterModel.isDebuffHit(bullet.level)){
                        CharacterModel.gainDeBuff(818);
                        sce.player.hud.addHurtInfo(globalStrings.MOB_SKILL_AFFIX_818);
                        DeBuffWidget.guiUpdate();

                        // stun 效果实装
                        let direction = bullet.x > sce.player.sprite.x ? -1 : 1;
                        let vx = direction  * STUN_FORCE;
                        sce.player.sprite.setVelocityX(vx);
                    }
                }
                if(bullet.debuffArr.indexOf(819) >= 0){
                    // {"skill_id":819,"affix":"寒潮","desc":"攻击附带降低移动速度效果，持续2秒","type":"passive","cdMax":"","duration":2000,"range":"","dmgRate":0.2,"wgType":"","wgeType":"","wgeAniLast":"","wgeRadius":"","wgeCount":""}
                    // - spd
                    if(CharacterModel.isDebuffHit(bullet.level)){
                        CharacterModel.gainDeBuff(819);
                        sce.player.hud.addHurtInfo(globalStrings.MOB_SKILL_AFFIX_819);
                        DeBuffWidget.guiUpdate();
                    }else{
                        sce.player.hud.addHurtInfo(globalStrings.INFO_RESIST);
                    }
                }
            }
            CharacterModel.calcTotalState();
            bullet.hideSelf();
        }else if(bullet.collideWith === 'mob'){     // player attack mob
            if(sprite.name!=='player'){
                // 检查overlap 过程中是否触发多次？
                if(!sprite.controller.model.isAlive) return;
                // console.log("mob in army get hurt, index="+sprite.controller.intIndexInArmy);
                if(bullet.hitArray.lastIndexOf(sprite.controller.intIndexInArmy) === -1){
                    bullet.hitArray.push(sprite.controller.intIndexInArmy);
                    bullet.damage = bullet.dmg;
                    let atkResult = CharacterModel.handlerHitSaving(sprite.controller.config.level,bullet);
                    if(atkResult.damage === 0){
                        sce.player.hud.addHurtInfo("Miss");
                        CharacterModel.resetCombo();
                        bullet.hideSelf();
                        return;
                    }
                    // 判断是否在怪物背后 - 与玩家位置无关，只与bullet 与 怪物位置有关
                    let mobFace = sprite.flipX ? 1 : -1; // 1 朝右 -1 朝左 怪物默认朝左边
                    let stabFlag = false;
                    if(((mobFace === 1)  && (bullet.x < sprite.x))
                        || ((mobFace === -1) && (bullet.x > sprite.x)   )
                    ){
                        stabFlag = true;    // bullet > 怪物 >    ||  <怪物  < bullet
                    }

                    atkResult = CharacterModel.handlerCritSaving(atkResult,stabFlag);  // 玩家招式暴击后的伤害效果
                    let strHurtInfo = '';
                    if(stabFlag){
                        // sce.player.hud.addHurtInfo(globalStrings.BACKSTAB + "      　　　　");
                        strHurtInfo = globalStrings.BACKSTAB + ' ';
                    }
                    if(atkResult.reason === globalStrings.QB_CRIT){
                        // sce.player.hud.addHurtInfo(globalStrings.QB_CRIT);
                        strHurtInfo = strHurtInfo + globalStrings.QB_CRIT;
                    }
                    if(strHurtInfo !== ''){
                        sce.player.hud.addHurtInfo(strHurtInfo);
                    }
                    let actDmg = sprite.controller.hurt(atkResult.damage,stabFlag);
                    // 等于 gQuickBattle playerMove Line 388 开始。
                    if(( actDmg > 0) && (bullet.fireFrom === -1)){
                        CharacterModel.addCombo();
                        // 等于 gQuickBattle Line 403开始
                        // todo：检查debuff的影响
                        // 等于 gQuickBattle Line 409开始
                        // 玩家 是否有吸血效果 - 不区分显示过量治疗
                        if(dbPlayer[pId].totalState.fdh > 0){
                            let hAmount = Math.ceil(dbPlayer[pId].totalState.fdh * actDmg);
                            sce.player.hud.addHurtInfo("+"+hAmount);
                            if(hAmount > 0){
                                CharacterModel.healSelf(hAmount);
                            }
                        }
                        // mob 是否有荆棘
                        if(sprite.controller.model.fdb > 0){
                            let fdDmg = Math.ceil(sprite.controller.model.fdb * actDmg);
                            let fdResult = CharacterModel.getHurt(fdDmg);
                            if(fdResult <= 0){
                                if(fdResult === -1){
                                    sce.player.hud.addHurtInfo(globalStrings.BM_DGE);
                                }else if (fdResult === -2){
                                    sce.player.hud.addHurtInfo(globalStrings.BM_PAR);
                                }
                            }else{
                                sce.player.hud.addHurtInfo("-"+fdResult);
                            }
                            // battleModal.appendLogPlayerHurt(fdResult);
                        }

                        // 玩家的攻击是否附带 dbf 效
                        // console.log(bullet.dbfObj.dbfObj);
                        if(sprite.controller.model.isAlive){
                            if(bullet.dbfObj.dbfObj){   // 存在 debuff 且mob 还活着
                                // debuff 判断
                                let dbfRand = GlobalFunction.getRandFloat(0,1.0);
                                // movie purpose , temp , 100%命中debuff
                                // let dbfRand = 0;
                                if(dbfRand < bullet.dbfObj.dbfRat){
                                    // debuff 命中
                                    // 2023.0705
                                    sprite.controller.gainDebuff(bullet.dbfObj);
                                }
                            }
                        }else{
                            sprite.dead();
                        }

                    }
                    if(bullet.destroyOnHit){
                        // console.log("hide on hit");
                        bullet.hideSelf();
                    }

                    // if(( actDmg > 0) && (bullet.fireFrom === -1)){
                    //     // 玩家吸血判断
                    //     if(dbPlayer[pId].totalState.fdh > 0){
                    //         CharacterModel.healSelf(Math.ceil(actDmg * dbPlayer[pId].totalState.fdh));
                    //     }
                    //     // 怪物反伤 - 统一为物理伤害，可以招架 闪避
                    //     if(this.army[sprite.controller.intIndexInArmy].model.fdb > 0){
                    //         let fdbDmg = Math.ceil(actDmg * this.army[sprite.controller.intIndexInArmy].model.fdb);
                    //         this.scene.player.getHurt(fdbDmg,'def');
                    //     }
                    // }
                    // console.log('first hit');
                    // console.log("his array = "+bullet.hitArray.join("|"));
                }
            }
        }else{
            return;
        }
    }
    playMusic(strName){
    }

    _musicPlayDone(){
        // console.log("music looped");
        this._pPlayingMusic.off('looped');
        this.playMusic();
    }

    _tapHandler(){
        if(this.input.activePointer.isDown){
            let pointer = this.input.activePointer;
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
                    this.arrow_center = true;   // 跳
                    this.add.tween({targets:this.jumpZone, fillAlpha:{from:0.32, to :1.0}, radius:{from:this.move_ctrl_jump_radius,to:this.move_ctrl_jump_radius*0.618}, yoyo:1, duration: 50});
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

            if(this.arrow_center){  // 在中间小圆圈，释放了按键，应该跳
                // console.log("jump");
                // todo: call player jump, or ignore, but set arrow_center=false in playerUpdate?
                // this.arrow_center = false;
                this.player._handleInput();
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

    _bindTapZone(){
        let vmin = (this.cameras.main.width > this.cameras.main.height) ? this.cameras.main.height : this.cameras.main.width;
        this.anchor_move_ctrl_origin_x = vmin * 0.1 + 0.13 * this.cameras.main.width;
        this.anchor_move_ctrl_origin_y = this.cameras.main.height - this.anchor_move_ctrl_origin_x;
        this.move_ctrl_radius = 0.13 * this.cameras.main.width;
        this.move_ctrl_jump_radius = 0.04 * this.cameras.main.width;
        this.tapZone = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.move_ctrl_radius,0,360,false,0x777777,0.05);
        this.tapZone.setScrollFactor(0);
        this.tapZone.setDepth(9999);

        this.jumpZone = this.add.arc(this.anchor_move_ctrl_origin_x, this.anchor_move_ctrl_origin_y,this.move_ctrl_jump_radius,0,360,false,this.jumpZoneFillColor,0.32);
        this.jumpZone.setScrollFactor(0);
        this.jumpZone.setDepth(10001);

        this.actRadius = this.move_ctrl_radius*0.8;
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
        if(!GlobalConfig.TAP_DEVICE) return;
        let cw = this.cameras.main.width;
        let ch = this.cameras.main.height;

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
}
