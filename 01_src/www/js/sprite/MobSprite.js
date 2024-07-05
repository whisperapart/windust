/**
 * Created by jim on 2022/05/11.
 */

const Hurt_Bar_Display_Time_Max = 1000;

class SpriteHUDBar {
    constructor (scene, x, y, spriteWidth, spriteHeight,strName, hpMax) {
        this.x = x;
        this.y = y;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.value = hpMax;
        this.hpMax = hpMax;
        this.p = (this.spriteWidth - 2) / this.spriteWidth ;

        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.bar.setDepth(4);
        this.textBar = new Phaser.GameObjects.Text(scene,x,y,strName,
            {fontSize: "24px", fontFamily:"SimHei,'Microsoft YaHei',monospace",color: "#FFFFFF",
                stroke: "#000", strokeThickness:4,
                align: "center",maxLines:1,
            }
        );
        // stroke: "#555555", strokeThickness:4,
        // this.textBar.setOrigin(0.5).setDepth(9999999);
        this.textBar.setOrigin(0.5);
        this.textBar.setDepth(4);
        this.draw();
        scene.add.existing(this.bar);
        scene.add.existing(this.textBar);
        this.textBar.setScale(1);
        this.scene = scene;
        this.hurtBars = [];
        this.isActive = true;
    }

    decrease (amount) {
        this.value -= amount;
        if (this.value < 0) {
            this.value = 0;
        }
        this._drawHPBar();
        return (this.value === 0);
    }

    draw(hp){
        if(!isNaN(hp)){
            this.value = hp;
        }
        this._drawHPBar();
        this._drawTextBar();
    }
    onChange(x,y,hp,hpMax){
        if((x === this.x) && (y===this.y) &&(hp === this.value) &&(hpMax === this.hpMax)){
            // do nothing. no need to update
        }else{
            this.x = x;
            this.y = y;
            this.hpMax = hpMax;
            this.value = hp;
            this._drawHPBar();
            this._drawTextBar();
        }
    }
    destroy(){
        this.isActive = false;
        this.hurtBars.forEach(function(b){
            b.destroy();
        });
        this.textBar.destroy();
        this.bar.destroy();
        // this.scene = null;
    }
    /**
     * 被击中后，增加 受到伤害的信息
     * @param dmg
     */
    addHurtInfo(dmg){
        let nDmg = parseInt(dmg);
        let hurtBar;
        if(isNaN(nDmg)){
            // f5e625  stroke: "#eb6864", strokeThickness:2,
             hurtBar = new Phaser.GameObjects.Text(this.scene,this.x,this.y,dmg,
                {fontSize: "24px", fontFamily:"Papyrus, monospace, SimHei,'Microsoft YaHei'",color: "#f5e625",
                    align: "center",maxLines:1
                }
            );
            hurtBar.setOrigin(0.5);
            hurtBar.displayTime = 0;
            hurtBar.x = this.x - 25;
            hurtBar.y = this.y - this.spriteHeight * 0.5 - 25;
            // hurtBar.spd = -0.125;

        }else{
            // #eb6864 stroke: "#eb6864", strokeThickness:2,
            hurtBar = new Phaser.GameObjects.Text(this.scene,this.x,this.y,dmg,
                {fontSize: "24px", fontFamily:"Papyrus, monospace, SimHei,'Microsoft YaHei'",color: "#eb6864",
                    align: "center",maxLines:1
                }
            );
            hurtBar.setOrigin(0.5);
            hurtBar.displayTime = 0;
            hurtBar.x = this.x;
            hurtBar.y = this.y - this.spriteHeight * 0.5 - 50;
            // hurtBar.spd = -0.25;
        }

        this.scene.add.existing(hurtBar);
        this.hurtBars.push(hurtBar);
        hurtBar.setScale(1);
        hurtBar.setDepth(4);
        // hurtBar.setFontSize(48);
        // hurtBar.setOrigin(0.5).setDepth(9999999);

    }

    /**
     * 添加 伤害信息上浮的动画效果
     * @param time
     * @param delta
     */
    update(time,delta){
        for(let i=0;i<this.hurtBars.length;i++){
            this.hurtBars[i].displayTime += delta;
            if(this.hurtBars[i].displayTime >= Hurt_Bar_Display_Time_Max){
                this.hurtBars[i].destroy();
                this.hurtBars.splice(i, 1);  // 删除当前
                i--;
            }else{
                // Phaser.Actions.IncY(this.hurtBars[i],this.hurtBars[i].spd);
            }
        }
        Phaser.Actions.IncY(this.hurtBars,-0.25);
    }

    /**
     * 绘制 HP 条，低于30%改变颜色
     * @private
     */
    _drawHPBar() {
        this.bar.clear();
        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x - this.spriteWidth * 0.5, this.y - this.spriteHeight*0.5 - 10, this.spriteWidth, 10);
        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x - this.spriteWidth * 0.5 + 1, this.y - this.spriteHeight*0.5 - 9 , (this.spriteWidth - 2), 8);

        if (this.value/this.hpMax <= 0.3) {
            this.bar.fillStyle(0xff0000);
        } else {
            this.bar.fillStyle(0x00ff00);
        }

        let d = Math.floor(this.p * this.spriteWidth * this.value / this.hpMax);
        this.bar.fillRect(this.x  - this.spriteWidth * 0.5 + 1, this.y - this.spriteHeight*0.5 -9, d, 8);
    }

    /**
     * 绘制 名字文本
     * @private
     */
    _drawTextBar(){
        this.textBar.x = this.x;
        this.textBar.y = this.y - this.spriteHeight * 0.5 - 30;
    }

}

class DropSprite extends Phaser.Physics.Arcade.Image{
    constructor(scene,x,y,texture,itemObj) {
        super(scene, x, y, texture);
        this.setScale(0.4);
        this.setAngle(180);
        this.scene.add.existing(this);
        this.setDepth(3 + 1);
        this.setInteractive();
        this.itemObj = itemObj;
        this.startPos = {x: x, y: y};
        this.dropPos = this._getRndDropPlace();
        // this.stepCnt = 0;
        // this.stepMax = 500;
        // this.xStep = (this.dropPos.x - this.startPos.x) / this.stepMax;
        // this.yStep = (this.dropPos.y - this.startPos.y) / this.stepMax;
        this.x = x;
        this.y = y;
        this.isLooted = false;
        this.displayTime = 0;   // 确保掉落动画 500ms 播放完毕之后，才可以点击
        this.fadeTime = 60*1000;  // 30秒 不点击拾取，自动消失

        this.on('pointerup', function (pointer) {
            this._clickHandler();
        });
    }

    _clickHandler(){
        if(!this.isLooted && (this.displayTime > 500)) {
            this.isLooted = true;
            // this.setTint(HEX_COLOR_LOOTED);
            // loot item
            // if true, add item in inventory
            let gainItemResult = CharacterModel.gainItem(this.itemObj.itemId,1);
            // 1=成功 2=成功且超出堆叠后重新分组 -1=没有足够空位 -2=没有足够空位添加了部分 0=item未发现 -3=数量异常 -4=唯一物品无法重复创建
            if(gainItemResult >=1){
                // already add to inventory, remove self
                this.setActive(false);
                this.setVisible(false);
                // in scene update , remove from scene.dropArr
                // console.log("add to inventory result = "+gainItemResult);
                gGui.playSoundEffect("click");
            }else{
                let _this = this;
                this.displayTime = 0;
                this.scene.tweens.add({
                    targets: _this,
                    y: _this.dropPos.y-30,
                    angle:720,
                    ease: 'Cubic.easeOut',
                    yoyo:true,
                    duration: 200,
                    repeat: 0
                });
                this.isLooted = false;
                gGui.playSoundEffect("fail");
            }
        }
    }

    update(time,delta){
        // click handler
        this.displayTime = this.displayTime + delta;
        if(this.displayTime >= this.fadeTime){
            this.isLooted = true;   // 最大时间也没有拾取，那么标记为拾取。在DynamicScene 的 Update 中，下一个frame 会 删除。
        }
    }

    _getRndDropPlace(){
        // debug
        // return {x:this.x-32,y:this.y+32};
        let xRnd = GlobalFunction.getRand(-32,32);
        let yRnd = GlobalFunction.getRand(-32,32);
        let xMin = 0 + 16;
        let xMax = this.scene.mapWidthTotal - 16;
        let yMin = arg_pos_y_min + 50;
        let yMax = arg_pos_y_max - 16;
        let x = this.x+xRnd;
        x = x < xMin ? xMin : x;
        x = x > xMax ? xMax : x;
        let y = this.y+yRnd;
        y = y < yMin ? yMin : y;
        y = y > yMax ? yMax : y;
        return {x:x,y:y};
    }
}

class PotionSprite extends DropSprite{
    constructor(scene,x,y,texture) {
        super(scene, x, y, texture,{});
        scene.physics.add.existing(this);
        this.setDepth(5);
        this.name = 'poition';
        scene.physics.world.addOverlap(scene.player.sprite,this,scene._onUsePotion);
    }

    update(time,delta){
        this.displayTime = this.displayTime + delta;
        if(this.displayTime >= this.fadeTime){
            this.isLooted = true;   // 最大时间也没有拾取，那么标记为拾取。在DynamicScene 的 Update 中，下一个frame 会 删除。
        }
    }
}

class MobSprite extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,confObj,controller) {
        super(scene,confObj.x,confObj.y,confObj.key,'stand-01.png');
        this.config = confObj;
        this.controller = controller;
        this.setScale(confObj.scaleX,confObj.scaleY);   // 优先使用scale，不用bodyWidth
        // 如果config 里面没有设定 宽高  = -1，使用默认值
        // if(this.config.bodyWidth < 0 ) this.config.bodyWidth = this.width;
        // if(this.config.bodyHeight < 0 ) this.config.bodyHeight = this.height;
        this.config.bodyWidth = this.displayWidth;
        this.config.bodyHeight = this.displayHeight;
        this.name = this.config.displayName;
        this.isHurt = false;
        this.isAlive = true;
        this.isLooted = false;
        this.lootedTime = 0;
        this.lootedTimeMax = 4000;  // 2000ms 后尸体消失
        this.shouldDestroy = false; // 是否应该销毁，lootedTimeMax 到达之后，尸体腐烂。
        // this.spastDuration = this.config.spastDuration;
        // this.hurtDuration = 0;
        this.xMin = 0 + 8 + 64; // 8 mob width space, 64 exitZone width
        this.xMax = this.scene.mapWidthTotal - 8;
        this.yMin = arg_pos_y_min - this.displayHeight*0.2; // 考虑脚下阴影问题
        this.yMax = arg_pos_y_max - this.displayHeight*0.5;

        this.hud = new SpriteHUDBar(scene,confObj.x,confObj.y,this.config.bodyWidth,this.config.bodyHeight,confObj.displayName, confObj.hpMax);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBodySize(this.frame.width*0.8,this.frame.height*0.8);

        this.setInteractive();
        // this.setBodySize(this.config.bodyWidth,this.config.bodyHeight);
        this.setTint(confObj.tintNormal);
        this.setDepth(confObj.depth);
        this.setPushable(false);
        this.setBounce(0);
        this.setImmovable(true);
        this.setCollideWorldBounds(true);
        this._createAnimations();

        this.on('pointerup', function (pointer) {
            this._clickHandler();
        });

        this.aniCBObj = null;
    }
    _createAnimations(){
        for(let i=0;i<this.config.aniArr.length;i++){
            if(this.scene.anims.exists(this.config.aniArr[i].aniName)){
                continue;
            }
            let initFrame = this.config.aniArr[i].aniConfig.start;
            if(this.config.aniArr[i].aniName === this.config.key+'-stand') {
                initFrame = GlobalFunction.getRand(this.config.aniArr[i].aniConfig.start, this.config.aniArr[i].aniConfig.end);
                // console.log("this.config.aniArr[i].aniName initFrame = "+initFrame);
                this.config.aniArr[i].aniConfig.yoyo = true;
            }
            this.scene.anims.create({
                key: this.config.aniArr[i].aniName,
                frames: this.scene.anims.generateFrameNames(this.config.key, this.config.aniArr[i].aniConfig),
                frameRate: this.config.aniArr[i].aniRate,
                repeat: this.config.aniArr[i].aniConfig.repeat === null ? -1 : this.config.aniArr[i].aniConfig.repeat,
                startFrame: initFrame,
                yoyo: this.config.aniArr[i].aniConfig.yoyo ? this.config.aniArr[i].aniConfig.yoyo : false
            });
        }
    }

    // preUpdate(time,delta){
    //     super.preUpdate(time,delta);
    //
    //
    // }

    _clickHandler(){
        // 如果已经死了
        if(!this.isAlive){
            // 处理点击事件
            if (!this.isLooted) {
                this.isLooted = true;
                // console.log("clicked body");
                // console.log("drop list ="+this.controller.model.inventoryStr);
                this.dropItems();
                this.toggleFlipX();
                this.setTint(HEX_COLOR_LOOTED);
            }
            if(this.hud.isActive) this.hud.destroy();
        }
    }

    update(time,delta,isAlive){
        // 如果已经被Looted 并且时间超过2000ms
        if(this.isLooted){
            if(this.lootedTime >= this.lootedTimeMax){
                this.setVisible(false);
                this.setActive(false);
                this.shouldDestroy = true;
            }else{
                this.lootedTime = this.lootedTime + delta;
            }
        }

        // 如果已经死了
        if(!isAlive){
            // 处理点击事件
            // if (game.input.activePointer.leftButtonDown() && !this.isLooted) {
            //     this.isLooted = true;
            //     console.log("clicked body");
            //     console.log("drop list ="+this.controller.model.inventoryStr);
            //     this.dropItems();
            //     this.toggleFlipX();
            // }
            // if(this.hud.isActive) this.hud.destroy();
        }else{
            // 如果活着
            // this.x = isNaN(this.x) ? (this.xMax + this.xMin)/2 : this.x;
            // this.y = isNaN(this.y) ? (this.yMax + this.yMin)/2 : this.y;
            this.x = this.x < this.xMin ? this.xMin : this.x;
            this.x = this.x > this.xMax ? this.xMax : this.x;
            this.y = this.y < this.yMin ? this.yMin : this.y;
            this.y = this.y > this.yMax ? this.yMax : this.y;

            this.hud.x = this.x;
            this.hud.y = this.y;
            this.hud.draw(this.controller.model.hp);
            this.hud.update(time,delta);

            if(this.aniCBObj != null){
                // animation 执行完毕，等待实现效果
                this.aniCBObj.duration = this.aniCBObj.duration + delta;
                if(this.aniCBObj.duration >= this.aniCBObj.durationMax){
                    // 执行 CB
                    switch (this.aniCBObj.cmd){
                        case 'attack':      // 攻击动画播放完毕
                            this._attackCB(this.aniCBObj.wgeObj);
                            break;
                        case 'hurt':        // 受伤动画播放完毕 - 啥都不干，恢复idle即可
                            this._hurtCB();
                            break;
                        case 'dead':        // 死亡动画播放完毕
                            this._deadCB();
                            break;
                        default:
                            break;
                    }
                    // 清空 aniCBObj
                    this.aniCBObj = null;
                }
            }
        }
    }

    dropItems(){
        let drops = this.controller.model.inventory;
        for(let i=0;i<drops.length;i++){
            let iconStr = ItemModel.getItemPhaserTexture(drops[i].itemCate,drops[i].itemId);
            let drop = new DropSprite(this.scene,this.x, this.y,iconStr,drops[i]);
            this.scene.dropArr.push(drop);
            this.scene.tweens.add({
                targets: drop,
                x: drop.dropPos.x,
                y: drop.dropPos.y,
                scale:0.8,
                angle:0,
                ease: 'Cubic.easeOut',
                duration: 500,
                repeat: 0,
            });
        }
        // potion drop
        if(Math.random()< GlobalConfig.DROP_RATE_BAOZI){
            let drop = new PotionSprite(this.scene,this.x, this.y,"item_potion_baozi");
            this.scene.dropArr.push(drop);
            this.scene.tweens.add({
                targets: drop,
                x: drop.dropPos.x,
                y: drop.dropPos.y,
                scale:0.8,
                angle:0,
                ease: 'Cubic.easeOut',
                duration: 500,
                repeat: 0,
            });
        }
    }

    // todo: 应该是itemSprite 的点击响应函数
    lootItem(){
        let gainItemResult = CharacterModel.gainItem(battleModal.mobList[i].inventory[j].itemId,1);
        // 1=成功 2=成功且超出堆叠后重新分组 -1=没有足够空位 -2=没有足够空位添加了部分 0=item未发现 -3=数量异常 -4=唯一物品无法重复创建
        let mobDropStr = '';
        switch (gainItemResult){
            case 1:
                // console.log("玩家获得物品:"+battleModal.mobList[i].inventory[j].itemName);
                mobDropStr = battleModal.mobList[i].inventory[j].itemName;
                if(mobDropStr !== ""){
                    battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_ITEM_GET + mobDropStr);
                }
                break;
            case 2:
                // console.log("玩家获得物品:"+battleModal.mobList[i].inventory[j].itemName);
                mobDropStr += battleModal.mobList[i].inventory[j].itemName + " ";
                if(mobDropStr !== ""){
                    battleModal.appendLog(dbPlayer[pId].name + globalStrings.QB_ITEM_GET + mobDropStr);
                }
                break;
            case -1:
                battleModal.appendLog(globalStrings.NOT_ENOUGH_ROOM+globalStrings.EOL);
                break;
            case -2:
                battleModal.appendLog(globalStrings.NOT_ENOUGH_ROOM+globalStrings.EOL);
                break;
            case -4:
                battleModal.appendLog("["+battleModal.mobList[i].inventory[j].itemName + "] " + globalStrings.QB_ITEM_UNIQ);
                break;
            default:
                break;
        }
    }

    moveTo(x,y){
        this.setX(x);
        this.setY(y);
        this.hud.x = x;
        this.hud.y = y;
        this.hud.draw(this.controller.model.hp);
    }
    walk(tarX,tarY){
        this.faceTarget(tarX);
        let direction = normalizeVector(this.x,this.y,tarX,tarY);
        if(isNaN(direction.x) || isNaN(direction.y)) return;
        this.setVelocity(direction.x*this.config.moveSpeed,direction.y*this.config.moveSpeed);
        // console.log("mob walk "+ direction.x + " - "+ direction.y);
        this.anims.play(this.config.key+'-walk',true);
    }

    /**
     * 响应Aggro的通知，改变tint颜色
     */
    ackAggro(){
        this.setTint(this.config.tintAggro);
    }

    ackCancelAggro(){
        this.setTint(this.config.tintNormal);
    }

    /**
     * 让mob 面朝玩家
     * @param intPlayerFace - 玩家的朝向：1 右边 -1左边。
     */
    faceTarget(tarX){
        if(this.x > tarX){
            this.setFlipX(false);
        }else{
            this.setFlipX(true);
        }
    }
    /**
     * 背朝玩家
     * @param intPlayerFace - 玩家的朝向：1 右边 -1左边。
     */
    backTarget(tarX){
        if(this.x > tarX){
            this.setFlipX(true);
        }else{
            this.setFlipX(false);
        }
    }
    stopMove(){
        this.setVelocity(0,0);
    }
    stand(){
        // console.log("mob sprite stand");
        // let startFrame = GlobalFunction.getRand(0,7);
        // console.log('start from frame = '+ startFrame);
        this.anims.play(this.config.key+"-stand", true);
    }
    dead(){
        if(this.isAlive){
            this.isAlive = false;
            this.setVelocity(0,0);
            this.stop();
            this.play(this.config.key+"-dead", true);
            // this.setDepth(this.scene.player.sprite.depth-1);
            this.body.destroy();
            this.hud.bar.setVisible(false);
            let _this = this;
            this.scene.tweens.add({
                targets: _this,
                scale:_this.scaleX*1.2,
                y: _this.y-15,
                ease: 'Cubic.easeOut',
                duration: 150,
                yoyo:true,
                repeat: 0
            });

            let mobExp = this.controller.model.getExp();
            CharacterModel.gainExp(mobExp);
            let zoneId =  parseInt(this.scene.dbZoneObj.zoneId);
            CharacterModel.addKillCountForTask(zoneId,this.controller.model.mobId);
            // this.setTint(this.config.tintDead);this.setTint(this.config.tintDead);

            this.aniCBObj = {cmd:"dead",duration:0,durationMax:300};
            this.on('animationcomplete', this._deadCB);
            this.controller.playSoundEffect("die");
        }
    }

    attack(wgeObj){
        // console.log("mob sprite attack");
        // this.setVelocity(0,0);   // todo: 想一想，要不要把速度改成0
        let myWgeObj = deepClone(wgeObj);
        myWgeObj.level = this.config.level; // 记录 mob 的level
        this.faceTarget(this.scene.player.sprite.x);
        this.setVelocity(0);
        this.stop();
        this.play(this.config.key+"-attack", false);
        // this.scene.wgeRayGroup.fireLaser(x,y);
        // this.aniCBObj = {cmd:"attack",duration:0,durationMax:wgeObj.wgeDuration,wgeObj:myWgeObj};
        this._attackCB(myWgeObj); // 不再等动画播放完毕才出攻击效果，攻击效果和动画同时开始
    }
    /**
     * 响应被攻击通知，改变动画等
     */
    hurt(dmg){
        // console.log("mob sprite hurt");
        if(dmg===-1){
            this.hud.addHurtInfo(globalStrings.BM_DGE);
            return;
        }
        if(dmg===-2){
            this.hud.addHurtInfo(globalStrings.BM_PAR);
            return;
        }
        this.hud.addHurtInfo("-"+dmg);
        // this.on('animationcomplete', this._hurtCB);
        if(this.controller.model.spasticity){   // 默认可以被打断，除非有霸体技能 - 在model 里面 设置 spasticity 标记
            this.isHurt = true;
            this.anims.stop();
            // this.anims.play(this.config.key+"-hurt", false ,0);
            this.anims.play({key:this.config.key+"-hurt",duration:this.config.spastDuration,repeat:1});
            this.aniCBObj = {cmd:"hurt",duration:0,durationMax:this.controller.model.spastDuration};
        }

    }

    _attackCB(wgeObj){
        // console.log("mob sprite attackCB");
        let wgeGroup = undefined;
        switch (wgeObj.wgType){
            case 'fist': wgeGroup = this.scene.wgeGroupFist; break;
            case 'sword': wgeGroup = this.scene.wgeGroupSword; break;
            case 'machete':
                if(wgeObj.wgeType === 'circle'){
                    wgeGroup = this.scene.wgeGroupArc;
                }else{
                    wgeGroup = this.scene.wgeGroupMachete;
                }
                break;
            case 'spear': wgeGroup = this.scene.wgeGroupSpear; break;
            case 'ejection': wgeGroup = this.scene.wgeGroupEjection; break;
            // wgeType: point | line | cone | threeLines | area | arc | circle | double | explode
            // geType: = player :  fist | sword | machete | spear | ejection |
            //          => mob:     paw | hammer | thunder | arrow | meteor | mine
            case 'paw': wgeGroup = this.scene.wgeGroupPaw; break;
            case 'hammer': wgeGroup = this.scene.wgeGroupHammer; break;
            case 'thunder': wgeGroup = this.scene.wgeGroupThunder; break;
            case 'arrow': wgeGroup = this.scene.wgeGroupArrow; break;
            case 'meteor': wgeGroup = this.scene.wgeGroupMeteor; break;
            case 'mine': wgeGroup = this.scene.wgeGroupMine;break;
            case 'spark': wgeGroup = this.scene.wgeGroupSpark;break;
            case 'arc': wgeGroup = this.scene.wgeGroupArc;break;
            default : break;
        }
        // console.log("attack cb wgeObj="+JSON.stringify(wgeObj));
        this.aniCBObj = null;
        if(wgeGroup === undefined) return;
        if(wgeObj.wgeType === "chase" || wgeObj.wgeType === "lightning"){
            wgeObj.chaseTarget = this.scene.player.sprite;
        }
        wgeObj.debuffArr = [];
        if(this.controller.model.ngList.length !== 0){
            wgeObj.debuffArr = this.controller.model.ngList.slice();    // 浅拷贝即可
        }
        wgeObj.intIndexInArmy = this.controller.intIndexInArmy;
        wgeObj.level = this.controller.model.level;
        // console.log(this.controller.intIndexInArmy);
        // wgeGroup.fire(this.x,this.y,'player',(this.x < this.scene.player.sprite.x),this.config.tintBullet,wgeObj);
        // updated 20230629 试图修正发射的攻击是从怪物中心开始，而非从边缘开始
        let flipFactor = this.flipX ? 1 : -1;
        wgeGroup.fire(this.x + flipFactor * this.frame.halfWidth,this.y,'player',(this.x < this.scene.player.sprite.x),this.controller.model.tintBullet,wgeObj);
    }
    _deadCB(){  // animation 播放完成之后，update触发
        // 移除mob
        // console.log("mob sprite deadCB");
        this.aniCBObj = null;
        this.hud.destroy();
        // this.controller.model.die();
        // this.destroy();
    }
    _hurtCB(){
        // console.log("mob sprite hurtCB");
        this.aniCBObj = null;
        this.isHurt = false;
        // this.isHurt = false;
        // this.hurtDuration = 0;
    }
}
