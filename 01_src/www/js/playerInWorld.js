/**
 * Created by jim on 2020/10/15.
 */
class PlayerInWorld {
    speed = 0;
    speedRatio = 2.5;
    gun;
    _timerGuiReDrawMax = 100;  // 多久重绘一次 gui
    _timerGuiReDrawCur = 0;     // 当前计数
    space_key_flag = false;
    tp_xq = 'texture-player-xq';    th_xq = 'texture-horse-xq';
    tp_wd = 'texture-player-wonda'; th_wd = 'texture-horse-wd';
    tp_we = 'texture-player-woner'; th_we = 'texture-horse-we';
    tp = this.tp_we;
    th = this.th_we;

    constructor(scene, xdep) {
        this.scene = scene;
        this.xdep = xdep;
        if(pId === 1){
            this.tp = this.tp_xq;
            this.th = this.th_xq;
        }else if (pId === 2){
            this.tp = this.tp_wd;
            this.th = this.th_wd;
        }

        // Create the animations we need from the player spritesheet
        this._createAnimations();

        this.reloadPlayerBody();

        this.player.setVisible(false);
        this.ship.setVisible(false);
        this.horse.setVisible(false);
        switch(dbPlayer[pId].moveOn){
            case 'ship': this.sprite = this.ship;break;
            case 'foot': this.sprite = this.player;break;
            case 'horse': this.sprite = this.horse;break;
            default: this.sprite = this.player;break;
        }
        this.sprite.setVisible(true);

        // Track the arrow keys & WASD
        const { W, S, A, D, UP,DOWN,LEFT,RIGHT, SPACE} = Phaser.Input.Keyboard.KeyCodes;
        // const MW = Phaser.Input.MOUSE_WHEEL;
        this.keys = scene.input.keyboard.addKeys({
            a: A,
            d: D,
            w: W,
            s: S,
            up : UP,
            down : DOWN,
            left : LEFT,
            right : RIGHT,
            jump: SPACE
        });


        // todo: 根据 步行=身法 骑马=马的种类 乘船=船速， 设置player的加速效果，并且应用到这里
        // todo: 注意存档的时候，要保存位置和骑乘状态，否则 加速效果可能错误。 .moveOn = foot horse ship
        //this.speed = 300 * (1+dbPlayer[pId].totalState.hst).toFixed(2);       // walk 一步 75像素 一个动画 2步 150 像素， 6个动画frame -> frameRate=12 : speed =300
        // this.speed = CharacterModel.calcMoveOnSpeed();
        this.speed = this.speedRatio * dbPlayer[pId].moveOnSpeed;
    }

    reloadPlayerBody(){
        let scene = this.scene;
        let xdep = this.xdep;
        // Create the physics-based sprite that we will move around and animate
        // this.player = scene.physics.add.sprite(0, 0, "texture-player", "character-front-walk-0.png").setDepth(xdep);
        // let s = 80/256;
        // this.player.setScale(s);
        this.player = scene.physics.add.sprite(0, 0, this.tp, "side_run_1.png").setDepth(xdep);
        // this.player.setTint(dbPlayer[pId].tint);
        this.player.setScale(0.4);
        this.player.body.setSize(90,90);
        this.ship = scene.physics.add.sprite(0, 0, "texture-ship", "ship-0.png").setDepth(xdep);
        this.ship.setTint(dbPlayer[pId].tint);
        this.ship.body.setSize(40,40);
        this.horse = scene.physics.add.sprite(0, 0, this.th, "side_raid_4.png").setDepth(xdep);
        // this.horse.setTint(dbPlayer[pId].tint);
        this.horse.setScale(0.4);
        this.horse.body.setSize(90,90,true);
    }

    selfDestroy(){
        this.scene = null;
        this.player.destroy(true);
        this.ship.destroy(true);
        this.horse.destroy(true);
        this.sprite = null;
    }

    moveTo(x,y){
        // console.log(`move to ${x},${y}`);
        this.sprite.setPosition(x,y);
        // console.log(`now pos ${this.sprite.x},${this.sprite.y}`);
        this.sprite.body.setVelocity(0,0);
        // this.sprite.refreshBody();
        // this.scene.updateEnvironment();
    }

    moveOn(moveBy = 'foot'){
        // 20230815 试图修正在水上召唤马的问题
        if(moveBy === 'horse'){
            if(this.scene.checkPlayerTileInWater()){
                moveBy = 'foot';
                dbPlayer[pId].horseId = 0;
                CharacterModel.calcTotalState();
                return;
            }
        }

        dbPlayer[pId].worldPosX = this.sprite.x;
        dbPlayer[pId].worldPosY = this.sprite.y;
        // console.log("x="+dbPlayer[pId].worldPosX + " y="+dbPlayer[pId].worldPosY);
        this.player.setVisible(false);
        this.ship.setVisible(false);
        this.horse.setVisible(false);
        // let posX = this.sprite.x;
        // let poxY = this.sprite.Y;
        switch(moveBy){
            case 'ship': this.sprite = this.ship;break;
            case 'foot': this.sprite = this.player;break;
            case 'horse': this.sprite = this.horse;break;
            default: this.sprite = this.player;break;
        }
        this.scene.updateLayerCollision(moveBy);
        // this.sprite.setPosition(dbPlayer[pId].worldPosX, dbPlayer[pId].worldPosY);
        this.moveTo(dbPlayer[pId].worldPosX,dbPlayer[pId].worldPosY);
        // console.log("x="+dbPlayer[pId].worldPosX + " y="+dbPlayer[pId].worldPosY);
        dbPlayer[pId].moveOn = moveBy;
        this.sprite.setVisible(true);
        this.scene.cameras.main.startFollow(this.sprite);
    }

    _createAnimationsPlayer(){
        // player animations
        this.scene.anims.create({
            key: "misa-left-walk",
            frames: this.scene.anims.generateFrameNames(this.tp, { prefix: "side_run_", start: 0, end: 5, zeroPad: 1 , suffix: ".png" }),
            frameRate: 20,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-right-walk",
            frames: this.scene.anims.generateFrameNames(this.tp, { prefix: "side_run_", start: 0, end: 5, zeroPad: 1 , suffix: ".png" }),
            // frames: this.scene.anims.generateFrameNames("texture-player", { prefix: "p5-walk-fast_", start: 0, end: 15, zeroPad: 2 , suffix: ".png" }),
            frameRate: 20,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-front-walk",
            frames: this.scene.anims.generateFrameNames(this.tp, { prefix: "front_run_", start: 0, end: 5, zeroPad: 1, suffix: ".png" }),
            frameRate: 20,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-back-walk",
            frames: this.scene.anims.generateFrameNames(this.tp, { prefix: "back_run_", start: 0, end: 5, zeroPad: 1, suffix:".png" }),
            frameRate: 20,
            repeat: -1
        });
    }
    _createAnimationsPlayer2024(){
        // player animations
        this.scene.anims.create({
            key: "misa-left-walk",
            frames: this.scene.anims.generateFrameNames(this.tp, { prefix: "side_run_", start: 0, end: 5, zeroPad: 1 , suffix: ".png" }),
            frameRate: 15,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-right-walk",
            frames: this.scene.anims.generateFrameNames(this.tp, { prefix: "side_run_", start: 0, end: 5, zeroPad: 1 , suffix: ".png" }),
            // frames: this.scene.anims.generateFrameNames("texture-player", { prefix: "p5-walk-fast_", start: 0, end: 15, zeroPad: 2 , suffix: ".png" }),
            frameRate: 15,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-front-walk",
            frames: this.scene.anims.generateFrameNames(this.tp, { prefix: "front_run_", start: 0, end: 5, zeroPad: 1, suffix: ".png" }),
            frameRate: 15,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-back-walk",
            frames: this.scene.anims.generateFrameNames(this.tp, { prefix: "back_run_", start: 0, end: 5, zeroPad: 1, suffix:".png" }),
            frameRate: 15,
            repeat: -1
        });
    }
    _createAnimationsHorse2024(){
        this.scene.anims.create({
            key: "horse-left-walk",
            frames: this.scene.anims.generateFrameNames(this.th, { prefix: "side_raid_", start: 0, end: 5, zeroPad: 1 , suffix: ".png" }),
            frameRate: 15,
            repeat: -1
        });
        this.scene.anims.create({
            key: "horse-right-walk",
            frames: this.scene.anims.generateFrameNames(this.th, { prefix: "side_raid_", start: 0, end: 5, zeroPad: 1 , suffix: ".png" }),
            frameRate: 15,
            repeat: -1
        });
        this.scene.anims.create({
            key: "horse-front-walk",
            frames: this.scene.anims.generateFrameNames(this.th, { prefix: "front_raid_", start: 0, end: 5, zeroPad: 1, suffix: ".png" }),
            frameRate: 15,
            repeat: -1
        });
        this.scene.anims.create({
            key: "horse-back-walk",
            frames: this.scene.anims.generateFrameNames(this.th, { prefix: "back_raid_", start: 0, end: 5, zeroPad: 1, suffix:".png" }),
            frameRate: 15,
            repeat: -1
        });
    }
    _createAnimationsHorse_bk(){
        this.scene.anims.create({
            key: "horse-left-walk",
            frames: this.scene.anims.generateFrameNames("texture-horse", { prefix: "h_", start: 48, end: 55, zeroPad: 1 , suffix: ".png" }),
            frameRate: 18,
            repeat: -1
        });
        this.scene.anims.create({
            key: "horse-right-walk",
            frames: this.scene.anims.generateFrameNames("texture-horse", { prefix: "h_", start: 16, end: 23, zeroPad: 1 , suffix: ".png" }),
            frameRate: 18,
            repeat: -1
        });
        this.scene.anims.create({
            key: "horse-front-walk",
            frames: this.scene.anims.generateFrameNames("texture-horse", { prefix: "h_", start: 32, end: 39, zeroPad: 1, suffix: ".png" }),
            frameRate: 18,
            repeat: -1
        });
        this.scene.anims.create({
            key: "horse-back-walk",
            frames: this.scene.anims.generateFrameNames("texture-horse", { prefix: "h_", start: 0, end: 7, zeroPad: 2, suffix:".png" }),
            frameRate: 18,
            repeat: -1
        });
    }
    _createAnimationsPlayer_new(){
        // player animations
        this.scene.anims.create({
            key: "misa-left-walk",
            frames: this.scene.anims.generateFrameNames("texture-player", { prefix: "character-left-walk-", start: 0, end: 5, zeroPad: 0 , suffix: ".png" }),
            frameRate: 9,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-right-walk",
            // frames: this.scene.anims.generateFrameNames("texture-player", { prefix: "character-right-walk-", start: 0, end: 5, zeroPad: 0 , suffix: ".png" }),
            frames: this.scene.anims.generateFrameNames("texture-player-p5", { prefix: "p5-walk-fast_", start: 0, end: 15, zeroPad: 1 , suffix: ".png" }),
            frameRate: 20,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-front-walk",
            frames: this.scene.anims.generateFrameNames("texture-player", { prefix: "character-front-walk-", start: 0, end: 5, zeroPad: 0, suffix: ".png" }),
            frameRate: 9,
            repeat: -1
        });
        this.scene.anims.create({
            key: "misa-back-walk",
            frames: this.scene.anims.generateFrameNames("texture-player", { prefix: "character-back-walk-", start: 0, end: 5, zeroPad: 0, suffix:".png" }),
            frameRate: 9,
            repeat: -1
        });
    }
    _createAnimations(){
        this._createAnimationsPlayer2024();
        // ship animations
        this.scene.anims.create({
            key: "ship-front-walk",
            frames: this.scene.anims.generateFrameNames("texture-ship", { prefix: "ship-", start: 4, end: 7, zeroPad: 1 , suffix: ".png" }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: "ship-back-walk",
            frames: this.scene.anims.generateFrameNames("texture-ship", { prefix: "ship-", start: 8, end: 11, zeroPad: 1 , suffix: ".png" }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: "ship-left-walk",
            frames: this.scene.anims.generateFrameNames("texture-ship", { prefix: "ship-", start: 0, end: 3, zeroPad: 1, suffix: ".png" }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: "ship-right-walk",
            frames: this.scene.anims.generateFrameNames("texture-ship", { prefix: "ship-", start: 12, end: 15, zeroPad: 1, suffix:".png" }),
            frameRate: 10,
            repeat: -1
        });
        // horse animations
        this._createAnimationsHorse2024();
    }

    update(time,delta) {
        if(!dbPlayer[pId].isAlive){ // 已经死了。
            console.log("player dead");
            this.sprite.body.setVelocity(0,0);
            this.sprite.body.stop();
            this.destroy();
            return;
        }

        this.speed = this.speedRatio * dbPlayer[pId].moveOnSpeed;
        const keys = this.keys;
        const player = this.sprite;



        // CharacterModel.tickCoolDown(delta);
        // CharacterModel.tickHeartBeat(delta);
        CharacterModel.update(delta);
        // asyn 函数更新 gui
        this._timerGuiReDrawCur += delta;
        if(this._timerGuiReDrawCur >= this._timerGuiReDrawMax){
            this._timerGuiReDrawCur = 0;
            gGui.drawHUD();
        }

        // console.log("player pos:"+player.x+","+player.y);

        // if(keys.zoomIn.isDown){
        //     this.scene.zoomIn();
        // }else if(keys.zoomOut.isDown){
        //     this.scene.zoomOut();
        // }


        const speed = this.speed;
        const prevVelocity = player.body.velocity.clone();

        // Stop any previous movement from the last frame
        this.sprite.body.setVelocity(0,0);
        // updated 2023.10.05 决定在弹出gui窗口的时候，也允许移动
        // if(gGui.flagGuiShow){
        //     this.sprite.stop();
        //     return;
        // }

        if(flagInGame && dbPlayer[pId].isInWorldMap){
            gGui.updateHUDCord(Math.floor(player.x/40),Math.floor(player.y/40));
        }
        // Horizontal movement
        // let deg = 0;    // 箭头默认正北方
        let moveKeyPressFlag = false;
        if (keys.left.isDown || keys.a.isDown || this.scene.arrow_left) {
            player.body.setVelocityX(-speed);
            this.scene.updateEnvironment();
            // deg = -90;
            // dbPlayer[pId].worldDirection = deg;
            moveKeyPressFlag = true;
        } else if (keys.right.isDown || keys.d.isDown || this.scene.arrow_right) {
            player.body.setVelocityX(speed);
            this.scene.updateEnvironment();
            // deg = 90;
            // dbPlayer[pId].worldDirection = deg;
            moveKeyPressFlag = true;
        }

        // Vertical movement
        if (keys.up.isDown || keys.w.isDown || this.scene.arrow_up) {
            player.body.setVelocityY(-speed);
            this.scene.updateEnvironment();
            // deg = deg === 0 ? 0 : deg + 45;
            // dbPlayer[pId].worldDirection = deg;
            moveKeyPressFlag = true;
        } else if (keys.down.isDown || keys.s.isDown || this.scene.arrow_down) {
            player.body.setVelocityY(speed);
            this.scene.updateEnvironment();
            // deg = deg === 0 ? 180 : ((Math.abs(deg) + 45) * (deg/Math.abs(deg)));
            // dbPlayer[pId].worldDirection = deg;
            moveKeyPressFlag = true;
        }

        if(GlobalConfig.TAP_DEVICE){
            if(keys.jump.isDown){
                this.space_key_flag = true;
            }else{
                this.key_jump_handler();
            }
        }





        // Normalize and scale the velocity so that player can't move faster along a diagonal
        player.body.velocity.normalize().scale(speed);
        // updated 2023.11.21 fix minimap direction when player stops.
        if(moveKeyPressFlag){
            dbPlayer[pId].worldDirection = Math.atan2(player.body.velocity.y,player.body.velocity.x) * (180/Math.PI) - 270;
            // Ensure the degree is in the range [0, 360)
            dbPlayer[pId].worldDirection = (dbPlayer[pId].worldDirection % 360 + 360) % 360;
            // 如果是骑马移动
            if(dbPlayer[pId].moveOn === 'horse'){
                this.scene.playSoundEffect('horse_run');
            }
        }else{
            this.scene.stopSoundEffect('horse_run');   // stop horse_run
        }

        // Update the animation last and give left/right animations precedence over up/down animations
        if(dbPlayer[pId].moveOn === 'ship'){
            if (keys.left.isDown || keys.a.isDown || this.scene.arrow_left) {
                player.anims.play("ship-left-walk", true);
            } else if (keys.right.isDown || keys.d.isDown || this.scene.arrow_right) {
                player.anims.play("ship-right-walk", true);
            } else if (keys.up.isDown || keys.w.isDown || this.scene.arrow_up) {
                player.anims.play("ship-back-walk", true);
            } else if (keys.down.isDown || keys.s.isDown || this.scene.arrow_down) {
                player.anims.play("ship-front-walk", true);
            } else {
                player.anims.stop();

                // If we were moving, pick and idle frame to use
                if (prevVelocity.x < 0) player.setTexture("texture-ship", "ship-4.png");
                else if (prevVelocity.x > 0) player.setTexture("texture-ship", "ship-8.png");
                else if (prevVelocity.y < 0) player.setTexture("texture-ship", "ship-12.png");
                else if (prevVelocity.y > 0) player.setTexture("texture-ship", "ship-0.png");
            }
        } else if(dbPlayer[pId].moveOn === 'horse'){
            if (keys.left.isDown || keys.a.isDown || this.scene.arrow_left) {
                player.setFlipX(true);
                player.anims.play("horse-left-walk", true);
                player.setScale(0.4);
                player.body.setSize(90,90);
            } else if (keys.right.isDown || keys.d.isDown || this.scene.arrow_right) {
                player.setFlipX(false);
                player.anims.play("horse-right-walk", true);
                player.setScale(0.4);
                player.body.setSize(90,90);
            } else if (keys.up.isDown || keys.w.isDown || this.scene.arrow_up) {
                player.anims.play("horse-back-walk", true);
                player.setScale(0.45);
                player.body.setSize(80,80);
            } else if (keys.down.isDown || keys.s.isDown || this.scene.arrow_down) {
                player.anims.play("horse-front-walk", true);
                player.setScale(0.45);
                player.body.setSize(80,80);
            } else {
                player.anims.stop();

                // If we were moving, pick and idle frame to use
                if (prevVelocity.x < 0) player.setTexture(this.th, "side_raid_4.png");
                else if (prevVelocity.x > 0) player.setTexture(this.th, "side_raid_4.png");
                else if (prevVelocity.y < 0) player.setTexture(this.th, "back_raid_4.png");
                else if (prevVelocity.y > 0) player.setTexture(this.th, "front_raid_4.png");
            }
        }else{  // on foot
            if (keys.left.isDown || keys.a.isDown || this.scene.arrow_left) {
                player.setFlipX(true);
                player.anims.play("misa-left-walk", true);
            } else if (keys.right.isDown || keys.d.isDown || this.scene.arrow_right) {
                player.setFlipX(false);
                player.anims.play("misa-right-walk", true);
            } else if (keys.up.isDown || keys.w.isDown || this.scene.arrow_up) {
                player.anims.play("misa-back-walk", true);
            } else if (keys.down.isDown || keys.s.isDown || this.scene.arrow_down) {
                player.anims.play("misa-front-walk", true);
            } else {
                player.anims.stop();

                // If we were moving, pick and idle frame to use
                // if (prevVelocity.x < 0) player.setTexture("texture-player", "character-left-walk-0.png");
                // else if (prevVelocity.x > 0) player.setTexture("texture-player", "character-right-walk-0.png");
                // else if (prevVelocity.y < 0) player.setTexture("texture-player", "character-back-walk-0.png");
                // else if (prevVelocity.y > 0) player.setTexture("texture-player", "character-front-walk-0.png");
                if (prevVelocity.x < 0) player.setTexture(this.tp, "side_run_1.png");
                else if (prevVelocity.x > 0) player.setTexture(this.tp, "side_run_1.png");
                else if (prevVelocity.y < 0) player.setTexture(this.tp, "back_run_1.png");
                else if (prevVelocity.y > 0) player.setTexture(this.tp, "front_run_1.png");

                // updated 2023.11.22 解决 载入游戏存档之后，玩家的朝向问题
                if(prevVelocity.x ===0 && prevVelocity.y === 0){
                    // if(dbPlayer[pId].worldDirection === 270) player.setTexture("texture-player", "character-left-walk-0.png");
                    // else if (dbPlayer[pId].worldDirection === 90) player.setTexture("texture-player", "character-right-walk-0.png");
                    // else if (dbPlayer[pId].worldDirection === 180) player.setTexture("texture-player", "character-front-walk-0.png");
                    // else player.setTexture("texture-player", "character-back-walk-0.png");
                    if(dbPlayer[pId].worldDirection === 270) player.setTexture(this.tp, "side_run_1.png");
                    else if (dbPlayer[pId].worldDirection === 90) player.setTexture(this.tp, "side_run_1.png");
                    else if (dbPlayer[pId].worldDirection === 180) player.setTexture(this.tp, "front_run_1.png");
                    else player.setTexture(this.tp, "back_run_1.png");
                }
            }
        }

        dbPlayer[pId].travelDistance += Math.round(Math.abs(this.sprite.x - dbPlayer[pId].worldPosX) + Math.abs(this.sprite.y - dbPlayer[pId].worldPosY));
        dbPlayer[pId].worldPosX = this.sprite.x;
        dbPlayer[pId].worldPosY = this.sprite.y;

        // console.log(dbPlayer[pId].worldPosX + "," + dbPlayer[pId].worldPosY);

    }

    key_jump_handler(){
        if(this.space_key_flag || this.scene.arrow_center){
            this.scene.arrow_center = false;
            this.space_key_flag = false;
            if(CharacterModel.hasItem(3)){   // 千里马
                if(dbPlayer[pId].moveOn === 'horse'){
                    BuffWidget.offHorse();
                }else if(dbPlayer[pId].moveOn !== 'ship'){
                    if(!this.scene.checkPlayerTileInWater()){
                        dbPlayer[pId].horseId = 3;
                        this.moveOn("horse");
                    }
                }
                CharacterModel.calcTotalState();
            }else if(CharacterModel.hasItem(2)) {  // 普通马
                if(dbPlayer[pId].moveOn === 'horse'){
                    BuffWidget.offHorse();
                }else if(dbPlayer[pId].moveOn !== 'ship'){
                    if(!this.scene.checkPlayerTileInWater()){
                        dbPlayer[pId].horseId = 2;
                        this.moveOn("horse");
                    }
                }
                CharacterModel.calcTotalState();
                // console.log(this.player.sprite.x);
            }else{
                // console.log("do not have a horse");
            }
        }
    }

    destroy() {
        console.log("player in world destroy");
        this.sprite.destroy();
    }

    fire(){
        // todo fire particles
    }
}