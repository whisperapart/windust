/**
 * Created by jim on 2020/6/26.
 */

const baseJumpForce = 0.45;
const gravity = 0.0009;
const animate_speed_factor = 0.9;  // old value = 0.15 用于控制 hastle 对动画的影响，越大越快

class Player {
    // playerMaxJumps = Math.floor(dbPlayer[pId].totalSkill.swift % 35) + 1;
    // playerJumps = 0; // 移除多段跳
    // keysSpaceDownFlag = false;
    scene = undefined;  // 场景对象
    aniConfigKey = '1-fist'; // pId 与 weapon 的组合，用于 在 playerAniArr
    playerJumpStartPosY = 0;
    playerJumpOnAirTime = 0;
    onGround  = true;
    speed = 0;
    jump = 0;
    // prevVelocityY;
    isInWorldMap = false;
    sprite;
    speedBase = 2.68;// walk 一步 75像素 一个动画 2步 150 像素， 6个动画frame -> frameRate=12 : speed =300
    face = 1;
    isAttack = false;
    isSpastic = false; // spastDuration
    hud = undefined;    // hud bar
    // deBuffManager = undefined;  // debuff

    constructor(scene, xdep) {
        this.scene = scene;
        if(scene.sceneName === 'WorldScene'){
            this.isInWorldMap = true;
        }

        // Create the animations we need from the player spritesheet
        this.aniConfigKey = (pId+1) + "-" + CharacterModel.getPlayerWeapon();
        this._createAnimationsAll();
        // Create the physics-based sprite that we will move around and animate
        this.sprite = scene.physics.add.sprite(0, 0, this.aniConfigKey).setDepth(xdep);
        this.sprite.name = "player";
        let w = (pId === 2)?40:50;
        let h = (pId === 2)?80:90;
        this.sprite.setTint(dbPlayer[pId].tint);
        this.sprite.setBounce(0);
        this.sprite.setPushable(false);
        this.sprite.setImmovable(true);
        this.sprite.play(this.aniConfigKey+'-stand');
        this.sprite.setBodySize(w,h,true);
        this.sprite.setOffset((this.sprite.frame.realWidth-w)*0.5,this.sprite.frame.realHeight - h - 10);
        this.sprite.setScale(1.0);
        // this.sprite.originX = 0;
        // this.sprite.originY = 1;
        this.arg_pos_y_min = 32*32- this.sprite.displayHeight*0.4;   // 0.4 是经验得到，因为有脚下阴影，比较难实际测算
        this.arg_pos_y_max = 32*41 - this.sprite.displayHeight*0.52;    // 经验得到。0。5的时候站在草丛里面会稍微漏出一点脚尖

        this.intGuiUpdateTick = 0;
        this.intGuiUpdateTickMax = 1000;


        this.hud = new SpriteHUDBar(scene,this.sprite.body.center.x,this.sprite.body.center.y,this.sprite.body.width,this.sprite.body.height,dbPlayer[pId].name, dbPlayer[pId].maxHP);

        // Track the arrow keys & WASD
        const { LEFT, RIGHT, UP, DOWN, SPACE, A, D, O, P, W, S } = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input.keyboard.addKeys({
            left: LEFT,
            right: RIGHT,
            up : UP,
            down: DOWN,
            jump: SPACE,
            a: A,
            d: D,
            w: W,
            s: S
            // zoomIn: O,
            // zoomOut: P,
        });

        // this.speed = this.speedBase * (100 + dbPlayer[pId].totalSkill.swift).toFixed(0);
        this.speed = this.speedBase * dbPlayer[pId].moveOnSpeed;

        // this.deBuffManager = new DeBuffManager();
        // this.speed = 900;   //debug
    }

    refreshSpeed(){
        this.speed = this.speedBase * dbPlayer[pId].moveOnSpeed;
    }
    refreshWeapon(){
        this.aniConfigKey = (pId+1) + "-" + CharacterModel.getPlayerWeapon();
        // this.sprite.body.reset();
        let w = (pId === 2)?40:50;
        let h = (pId === 2)?80:90;
        this.sprite.play(this.aniConfigKey+'-stand');
        this.sprite.setBodySize(w,h,true);
        this.sprite.setOffset((this.sprite.frame.realWidth-w)*0.5,this.sprite.frame.realHeight - h - 10);
        this.sprite.setScale(1.0);
    }

    moveTo(x,y){
        this.sprite.setX(x);
        this.sprite.setY(y);
        this.playerJumpStartPosY = this.sprite.y;
        this.hud.x = x;
        this.hud.y = y;
        this.hud.draw(dbPlayer[pId].hp);
    }

    updateTotalState() {
        CharacterModel.calcTotalState();
        // calc debuff
        // this.explainDeBuffChange();
    }

    explainDeBuffChange(){
        let hst = deBuffManager.explainHstChange();
        // console.log("explain debuff, hst = ");
        // console.log(hst);
        dbPlayer[pId].totalState.hst = dbPlayer[pId].totalState.hst - hst;  // hst 可以小于0

        let moveSpeed = deBuffManager.explainMoveSpeedChange();
        // console.log("explain debuff, moveSpeed = ");
        // console.log(moveSpeed);
        dbPlayer[pId].moveOnSpeed = dbPlayer[pId].moveOnSpeed - moveSpeed;
        dbPlayer[pId].moveOnSpeed = dbPlayer[pId].moveOnSpeed > 0 ? dbPlayer[pId].moveOnSpeed : 0;  // movespeed 最小为0
        this.refreshSpeed();
    }

    /**
     * 中了盲目效果，屏幕变黑
     */
    blind(duration,r,g,b){
        // use camera mask
        // blind 的颜色深度，跟 dbPlayer[pId].totalState.ris 有关。
        // this.scene.cameras.main.flash(duration,r,g,b,true);
        let durR = 1-dbPlayer[pId].totalState.ris;
        if(durR > 0){
            this.scene.cameras.main.setBackgroundColor(r,g,b);
            this.scene.cameras.main.setAlpha(0);
            setTimeout(()=>{
                let sce = game.scene.getScene("DynamicScene");
                if(sce){
                    sce.cameras.main.setAlpha(1);
                }

            },durR * duration);
        }

        // ？ bug ？ : 目盲的时候移动，出了zone，导致camera找不到。 还是干脆不管了？
    }

    /**
     * 被击退，后退60像素
     * @param direction: 1: 向右推，-1：向左推
     */
    repel(direction){
        let posX = this.sprite.x+direction*20;
        posX = posX > 32 ? posX : 32;
        posX = posX < this.scene.mapWidthTotal-32 ? posX : this.scene.mapWidthTotal-32;
        this.moveTo(posX,this.sprite.y);
        // this.sprite.setVelocityX(20*direction);
        this.scene.cameras.main.shake(200,0.01,true);
    }

    // 播放 攻击 动画，回调函数创造 bullet
    attack(kfObj){
        // if(!this.onGround) return;
        // updated 20230628 空中也可以攻击？直接出效果。主要是玩家的动作问题？
        this.kfObj = deepClone(kfObj);
        this.kfObj.intIndexInArmy = -1;    // -1 means fired by player
        let kfDmg = this.kfObj.wgeDmg;

        // 决定 播放 attack 还是 melee 动画
        let wgType = this.kfObj.wgeObj.wgType;
        let weapon = CharacterModel.getPlayerWeapon();
        let atkAnimation = "attack";
        if(wgType === weapon){
            if(wgType === 'fist'){
                // 武器和武学都是 fist - 放 attack ，但是为了好玩，随机出melee
                atkAnimation = Math.random()>0.66 ? 'melee' : "attack";
            }else{
                // 匹配的武学和匹配的武器 - 放 attack， 啥都不干
            }
        }else{  // wgType 应该是 fist，weapon 不是 fist
            atkAnimation = "melee";
        }
        // # end of 决定 播放 attack 还是 melee 动画

        // 计算暴击概率
        let crt = Math.round(dbPlayer[pId].totalState.crt * 10000);
        let rnd = GlobalFunction.getRand(0,10000);

        if(rnd < crt ){
            this.kfObj.wgeDmg = Math.round(kfDmg * dbPlayer[pId].totalState.crm);
            // console.log( "暴击："+this.wgeObj.wgeDmg + "/"+kfDmg+" = "+dbPlayer[pId].totalState.crm);  // 暴击命中
        }

        this.sprite.play(this.aniConfigKey+"-"+atkAnimation, true);
        this.sprite.on('animationcomplete', this._attackCB);
        // this.sprite.setVelocityX(0);
        this.isAttack = true;

        let wgeGroup = undefined ;
        // this.kfObj 就是  this.scene.player.kfObj  -- 因为原来在 _CB里面，所以从scene拿。
        switch (this.kfObj.wgeObj.wgType){
            case 'fist': wgeGroup = this.scene.wgeGroupFist; break;
            case 'sword': wgeGroup = this.scene.wgeGroupSword; break;
            case 'machete':
                if(this.kfObj.wgeObj.wgeType === 'circle'){
                    wgeGroup = this.scene.wgeGroupArc;
                }else{
                    wgeGroup = this.scene.wgeGroupMachete;
                }
                break;
            case 'spear': wgeGroup = this.scene.wgeGroupSpear; break;
            case 'ejection': wgeGroup = this.scene.wgeGroupEjection; break;
            default : break;
        }
        this.playSoundEffect(this.kfObj.wgeObj.wgType);
        if(wgeGroup === undefined) return;
        // this.kfObj.wgeObj.refKfObj = this.kfObj; // 危险，循环引用
        // todo: 想其他办法解决 - 需要 dbfObj
        // console.log(wgeGroup);
        this.kfObj.wgeObj.intIndexInArmy = -1;
        wgeGroup.fire(this.sprite.body.center.x + this.face * 0.5 * this.sprite.frame.halfWidth,this.sprite.body.center.y,'mob',(this.face > 0),dbPlayer[pId].tint,this.kfObj.wgeObj,this.kfObj);
        // console.log(this.kfObj);
        // this.scene.wgeGroupFist.fire(scene.player.sprite.x,scene.player.sprite.y,'mob',(scene.player.face > 0),dbPlayer[pId].tint,kfObj.wgeObj);
    }

    _attackCB(){
        // console.log("animation complete");
        // console.log("attack cb");
        this.scene.player.isAttack = false;
        this.scene.player.sprite.off("animationcomplete");
        this.scene.player.sprite.anims.play(this.scene.player.aniConfigKey+"-stand",true);
    }

    getHurt(dmg,saving='def'){
        let actDmg = 0;
        if(saving === 'def'){
            actDmg = CharacterModel.getHurt(dmg);
            this.hurt(actDmg);
        }else if(saving === 'ris'){
            actDmg = CharacterModel.getHurtWithRis(dmg);
            this.hurtByRis(actDmg);
        }
        if(dbPlayer[pId].curHP <=0 ){
            this.scene.input.keyboard.enabled = false;
            dbPlayer[pId].isAlive = false;
            this.sprite.setVelocity(0);
            this.sprite.stop();
            this.sprite.play(this.aniConfigKey+"-dead",false);
            // 禁用所有输入
            this.sprite.on('animationcomplete', this._deadCB);
            return 0;
        }else{
            return actDmg;
        }
    }
    _deadCB(){
        // this.scene.player.sprite.off("animationcomplete");
        // console.log("player dead");
        let scene = game.scene.getScene('DynamicScene');
        CharacterModel.die(scene);
        game.scene.stop('DynamicScene');
    }

    hurtByRis(actDmg){
        this.hud.addHurtInfo("-"+actDmg);
        if(actDmg > 0){
            this.isAttack = false;
            this.isSpastic = true;
            this.sprite.anims.stop();   // 停止所有动作
            this.sprite.anims.play(this.aniConfigKey+"-hurt",false);  // DO NOT ignore
            this.sprite.on('animationcomplete', this._hurtCB);
        }
    }

    hurt(dmg){
        if( !dbPlayer[pId].isAlive ) return;
        this.hud.draw(dbPlayer[pId].curHP);
        if(dmg === -1){
            this.hud.addHurtInfo(globalStrings.BM_DGE);
            return;
        }
        if(dmg === -2){
            this.hud.addHurtInfo(globalStrings.BM_PAR);
            return;
        }

        this.hud.addHurtInfo("-"+dmg);
        this.isAttack = false;
        this.isSpastic = true;
        this.sprite.setVelocityX(0);
        this.sprite.anims.stop();   // 停止所有动作
        this.sprite.anims.play(this.aniConfigKey+"-hurt",false);  // DO NOT ignore
        this.sprite.on('animationcomplete', this._hurtCB);
        // this.playSoundEffect("hurt");
        // gGui.playSoundEffect("se_drum");
    }
    _hurtCB(){
        this.scene.player.sprite.off("animationcomplete");
        this.scene.player.isSpastic = false;
        this.scene.player.sprite.anims.play(this.scene.player.aniConfigKey+"-stand",true);
    }
    heal(){
        // console.log("player heal");
        this.sprite.anims.stop();   // 停止所有动作
        this.sprite.anims.play(this.aniConfigKey+"-melee",false);  // DO NOT ignore
        this.sprite.on('animationcomplete', this._healCB);
        this.isAttack = true;
        gGui.playSoundEffect("succ");
    }
    _healCB(){
        this.scene.player.sprite.off("animationcomplete");
        this.scene.player.isAttack = false;
        this.scene.player.sprite.anims.play(this.scene.player.aniConfigKey+"-stand",true);
    }

    // preUpdate(){
    //     if(this.onGround){
    //         if(this.sprite.y > arg_pos_y_max){
    //             this.sprite.y = arg_pos_y_max;
    //         }else if(this.sprite.y < arg_pos_y_min){
    //             this.sprite.y = arg_pos_y_min;
    //         }
    //     }
    // }

    update(time,delta) {
        if(!dbPlayer[pId].isAlive) return;
        // const onGround = sprite.body.blocked.down;
        CharacterModel.update(delta);
        CharacterModel.calcTotalState();

        // asyn 函数更新 gui
        // 不需要每次都刷新，应该记录缓存数据，不一致的时候才刷新
        // BubbleWidget.updateBubble();
        this.intGuiUpdateTick += delta;
        if(this.intGuiUpdateTick >= this.intGuiUpdateTickMax){
            gGui.drawHUD();
            DeBuffWidget.guiUpdate();
            this.intGuiUpdateTick = 0;
        }

        this._handleJumpOnAir(time,delta);
        this._handleInput(time,delta);

        // deBuffManager.update(time,delta);
        // this.hud.x = this.sprite.body.center.x;
        // this.hud.y = this.sprite.body.center.y;
        // this.hud.draw(dbPlayer[pId].curHP);
        this.hud.onChange(this.sprite.body.center.x,this.sprite.body.center.y,dbPlayer[pId].curHP,dbPlayer[pId].maxHP);
        this.hud.update(time,delta);
    }

    destroy() {
        this.sprite.destroy();
    }

    _handleJumpOnAir(time,delta){
        if(!this.onGround){
            if(this.sprite.y > this.playerJumpStartPosY){  // 到了起跳点以下
                this.onGround = true;
                this.playerJumpOnAirTime = 0;
                this.sprite.y = this.playerJumpStartPosY;
                // let aniName = this.isAttack ? "player-attack" : "player-stand";
                // this.sprite.anims.play(aniName,true);
                // console.log("lower than start pos, reset jump start y");
                this.sprite.setVelocity(0);
            }else {
                this.playerJumpOnAirTime = this.playerJumpOnAirTime + delta;    // delta ~== 20 (ms)
                // baseJumpForce 需要跟player 的 swift 挂钩
                let jumpForce = baseJumpForce * (1 + dbPlayer[pId].totalSkill.swift * 0.0024);
                this.sprite.y = this.playerJumpStartPosY - (-gravity * this.playerJumpOnAirTime * this.playerJumpOnAirTime + jumpForce * this.playerJumpOnAirTime);
            }
        }
    }

    _handleInput(time,delta){
        if(!dbPlayer[pId].isAlive) return;  // 死亡
        if(this.isSpastic) return;  // 僵直
        if(this.isAttack) return;   // 攻击动画播放中

        // 已经跳在空中
        let keys = this.keys;
        if(this.onGround === false){
            // console.log("current y = " + this.sprite.y + " , jump start y = " + this.playerJumpStartPosY);
            // y = -0.001 * x * x + 0.5 * x => y = 距离， x = time
            if (keys.left.isDown || keys.a.isDown || this.scene.arrow_left) {
                this.sprite.flipX = true;
                this.sprite.setVelocityX(-this.speed);
                this.face = -1;
            } else if (keys.right.isDown || keys.d.isDown || this.scene.arrow_right) {
                this.sprite.flipX = false;
                this.sprite.setVelocityX(this.speed);
                this.face = 1;
            }
        }else{
            if(keys.jump.isDown || this.scene.arrow_center){   // 在地上，按了jump，浮空标记为false
                this.playerJumpStartPosY = this.sprite.y;
                this.scene.arrow_center = false;
                this.onGround = false;
                // this.sprite.anims.stop();
                this.sprite.anims.play(this.aniConfigKey+"-jump",true);
                this.playSoundEffect("jump");
            }else{
                let vVect = new Phaser.Math.Vector2(0,0);
                if (keys.left.isDown || keys.a.isDown || this.scene.arrow_left) {  // 左右键
                    this.sprite.flipX = true;
                    vVect.add(new Phaser.Math.Vector2(-1,0));
                    this.face = -1;
                } else if (keys.right.isDown || keys.d.isDown || this.scene.arrow_right) {
                    this.sprite.flipX = false;
                    vVect.add(new Phaser.Math.Vector2(1,0));
                    this.face = 1;
                }
                let up_key_special_logic = -1;   // 上，到了最高点，会被拦住不给继续上，但是这时候动画也变成 stand 了。进行特殊处理，继续播放walk
                if((keys.up.isDown || keys.w.isDown || this.scene.arrow_up) && this.onGround){    // 上下键
                    // this.sprite.anims.play("player-walk",true);
                    vVect.add(new Phaser.Math.Vector2(0,-1));
                    up_key_special_logic = 1;
                } else if((keys.down.isDown || keys.s.isDown || this.scene.arrow_down) && this.onGround){  // 没有在跳的时候
                    vVect.add(new Phaser.Math.Vector2(0,1));
                }
                if(this.sprite.y <= this.arg_pos_y_min){
                    // console.log(this.sprite.y + " / " + arg_pos_y_min + " /" + arg_pos_y_max);
                    this.sprite.y = this.arg_pos_y_min;
                    vVect.y = (vVect.y <  0) ? 0 : vVect.y ;
                    if(up_key_special_logic === 1) {
                        up_key_special_logic = 2;
                    }
                }
                if(this.sprite.y >= this.arg_pos_y_max){
                    // console.log(this.sprite.y + " / " + arg_pos_y_min + " /" + arg_pos_y_max);
                    this.sprite.y = this.arg_pos_y_max;
                    vVect.y = (vVect.y >  0) ? 0 : vVect.y ;
                }

                if(vVect.equals(Phaser.Math.Vector2.ZERO) && (2 !== up_key_special_logic)){
                    this.sprite.setVelocity(0);
                    let aniName = this.sprite.isAttack ? (this.aniConfigKey+"-attack") : (this.aniConfigKey+"-stand");
                    this.sprite.anims.play(aniName,true);

                }else{
                    vVect.normalize();
                    this.sprite.setVelocity(vVect.x * this.speed,vVect.y*this.speed);
                    let aniName = this.sprite.isAttack ? (this.aniConfigKey+"-attack") : (this.aniConfigKey+"-walk");
                    this.sprite.anims.play(aniName,true);
                }
            }
        }
    }

    _createAnimations(){
        let animArr = playerAniArr[this.aniConfigKey];
        for(let i=0;i<animArr.length;i++){
            let initFrame = animArr[i].aniConfig.start;
            // if(animArr[i].aniName === this.aniConfigKey+'-stand') {
            //     initFrame = animArr[i].aniConfig.start;
            //     animArr[i].aniConfig.yoyo = true;
            // }
            this.scene.anims.create({
                key: animArr[i].aniName.replace(this.aniConfigKey,'player'), // walk stand attack melee dead hurt jump
                frames: this.scene.anims.generateFrameNames(this.aniConfigKey, animArr[i].aniConfig),
                frameRate: animArr[i].aniRate * (1+dbPlayer[pId].totalState.hst * animate_speed_factor),
                repeat: animArr[i].aniConfig.repeat === null ? -1 : animArr[i].aniConfig.repeat,
                startFrame: initFrame,
            });
        }
    }
    _createAnimationsAll(){
        let keyArr = [
            '1-fist','1-sword','1-machete','1-spear','1-ejection',
            '2-fist','2-sword','2-machete','2-spear','2-ejection',
            '3-fist','3-sword','3-machete','3-spear','3-ejection'
        ]
        let animArr = [];
        for(let ki = 0; ki<keyArr.length;ki++){
            animArr = playerAniArr[keyArr[ki]];
            for(let i=0;i<animArr.length;i++){
                let initFrame = animArr[i].aniConfig.start;
                this.scene.anims.create({
                    key: animArr[i].aniName, // walk stand attack melee dead hurt jump
                    frames: this.scene.anims.generateFrameNames(keyArr[ki], animArr[i].aniConfig),
                    frameRate: animArr[i].aniRate * (1+dbPlayer[pId].totalState.hst * animate_speed_factor),
                    repeat: animArr[i].aniConfig.repeat === null ? -1 : animArr[i].aniConfig.repeat,
                    startFrame: initFrame,
                });
            }
        }


    }

    playSoundEffect(strAction){
        switch (strAction){
            case 'jump':
                this.scene.playSoundEffect("jump");
                break;
            case "hurt":
                // this.scene.playSoundEffect();
                // no sound effect for now.
                break;
            case 'fist':
                this.scene.playSoundEffect("fist");
                break;
            case 'sword':
                this.scene.playSoundEffect("sword");
                break;
            case 'machete':
                this.scene.playSoundEffect("machete");
                break;
            case 'spear':
                this.scene.playSoundEffect("spear");
                break;
            case 'ejection':
                this.scene.playSoundEffect("ejection");
                break;
            default:
                break;
        }
    }
}