/**
 * Created by jim on 2021/01/23.
 */


const db_mob_se = new Map([
    ["rabbit",new Map([["attack","mob_claw"],["hurt","mob_rabbit_hurt"],["die","mob_deer_die"]])],
    ["tiger",new Map([["attack","mob_roar"],["hurt","mob_hurt"],["die","mob_cat_die"]])],
    ["bear",new Map([["attack","mob_roar"],["hurt","mob_hurt"],["die","mob_die"]])],
    ["deer",new Map([["attack","mob_claw"],["hurt","mob_rabbit_hurt"],["die","mob_deer_die"]])],
    ["katana",new Map([["attack","mob_man_attack"],["hurt","mob_man_hurt_1"],["die","mob_man_die"]])],
    ["spear",new Map([["attack","mob_man_attack"],["hurt","mob_man_hurt_1"],["die","mob_man_die"]])],
    ["shield",new Map([["attack","mob_man_attack"],["hurt","mob_man_hurt_1"],["die","mob_man_die"]])],
    ["bow",new Map([["attack","mob_man_attack"],["hurt","mob_man_hurt_1"],["die","mob_man_die"]])],
    ["cavalry",new Map([["attack","horse"],["hurt","mob_hurt"],["die","horse_die"]])],
    ["mummy",new Map([["attack","mob_mummy_die"],["hurt","mob_mummy_die"],["die","mob_mummy_die"]])],
    ["bat",new Map([["attack","mob_bat_attack"],["hurt","mob_claw"],["die","mob_claw"]])]
]);


class MobController {
    config;         // config json object
    model;          // data - mobModel
    ai;             // ai - automation
    sprite;         // view - phaser Sprite
    scene;          // scene 对象 - 场景指针
    intIndexInArmy; // army 中的下标，用于定位controller对象
    arrCollider;    // missile 与它的碰撞信息 collider 对象 - 在wge bind 的时候绑定
    msTimerTint = 0;    // 计时器，是否检查自身tint颜色
    msTimerTintMax = 100; // 计时器，最大这么长时间检查一次自身的颜色
    dieFlag = false;

    // mob_zon = {"zone_id":55,"mob_template_id":1,"name":"小白兔","pos_x":50,"pos_y":100,"height":32,"animation_speed":1}
    constructor_v1(scene, mob_zon, intIndexInArmy) {
        this.model = new MobModel(mob_zon);
        this.scene = scene;
        this._config(mob_zon);
        this._prepareSprite();
        // this.addColliderWithMissile();
        // this.model.fixRangeWithSelfWidth(this.sprite.frame.halfWidth);
        this.ai = new MobAI(this.config.aiConfig, this);
        // bullet 颜色要根据怪物的词缀变
        this.config.tintBullet = this.ai.tintBullet !== undefined ? this.ai.tintBullet : this.config.tintBullet;
        this.intIndexInArmy = intIndexInArmy;
        this.arrCollider = [];
    }

    constructor(scene, mob_zon, intIndexInArmy,wave_order=0) {
        this.model = new MobModel(mob_zon);
        if(wave_order > 0){
            this.model.applyWaveBuff(wave_order);
        }
        this.scene = scene;
        this._config(mob_zon);
        this._prepareSprite();
        // this.addColliderWithMissile();
        // this.model.fixRangeWithSelfWidth(this.sprite.frame.halfWidth);
        this.ai = new MobAI(this.config.aiConfig, this);
        // bullet 颜色要根据怪物的词缀变
        this.config.tintBullet = this.ai.tintBullet !== undefined ? this.ai.tintBullet : this.config.tintBullet;
        this.intIndexInArmy = intIndexInArmy;
        this.arrCollider = [];
    }

    _config(mob_zon){
        // sample: mob_raw [dbMob] {"mob_template_id":1,"mob_template_name":"白兔","sprite":"Rabbit","title":"","affix":1,"level":1,"drop":[13.7,14.7,19.005],"atk":1,"def":2,"dge":25,"par":0,"hpMax":160}
            // ? aniArr
            // + aggressive fleeAble aggroRange
        // sample: mob_zon [mobsInZone] {"zone_id":55,"mob_template_id":1,"name":"","pos_x":50,"pos_y":100,"height":32,width:50,"animation_speed":1},
        // sample: mob_zon-new [mobsInZone] {"zone_id":55,"mob_template_id":1,"name":"",displayWidth:32,displayHeight:50,bodyWidth:32,bodyHeight:50,"animation_speed":1},
        // pos_x pos_y 不需要，因为用随机生成算法做了
            // ? displayWidth:32,displayHeight:50,bodyWidth:32,bodyHeight:50 | zoom ?
            // - animation_speed
            // + tintNormal tintAggro tintBullet
        let mob_raw = deepClone(gDB.getMobById(mob_zon.mob_template_id));
        // updated 20230825 - 小秋不会被墓穴怪物主动攻击
        if(pId === 1){
            // 范围 [145,159] [165,166]
            if(GlobalConfig.MOB_TEMPLATE_UNDEAD.indexOf(mob_raw.mob_template_id) >= 0){
                mob_raw.aggressive = false;
            }
        }

        this.config = {
            depth : 3,
            key : mob_raw.sprite,    // e.g. 'katana-1'
            level : mob_raw.level,
            // debug - purpose
            // key : 'bow-1',
            // width : mob_zon.displayWidth !== undefined ? mob_zon.displayWidth : -1,         // displayWidth
            // height : mob_zon.displayHeight !== undefined ? mob_zon.displayHeight : -1,      // 同一个 template 在不同zone 可能大小不一样，在zone 里面设置 display 和 碰撞大小
            // bodyWidth : mob_zon.bodyWidth !== undefined ? mob_zon.bodyWidth : -1,     // 碰撞
            // bodyHeight : mob_zon.bodyHeight !== undefined ? mob_zon.bodyHeight : -1,
            scaleX : mob_zon.scaleX !== undefined ? mob_zon.scaleX : 1.0,
            scaleY : mob_zon.scaleY !== undefined ? mob_zon.scaleY : 1.0,
            tintNormal : mob_zon.tintNormal !== undefined ? mob_zon.tintNormal : HEX_COLOR_NORMAL,
            tintDead : mob_zon.tintDead !== undefined ? mob_zon.tintDead : HEX_COLOR_DEAD,
            tintAggro : mob_zon.tintAggro !== undefined ? mob_zon.tintAggro : 0xF50000,
            tintBullet : mob_zon.tintBullet !== undefined ? mob_zon.tintBullet : HEX_COLOR_DEFAULT,
            // 'aniArr':[{aniName:'katana-1-walk',aniConfig:{ prefix: "walk-", start: 0, end: 90, zeroPad: 2 , suffix: ".png" }, aniRate:60}],
            aniArr : mobAniArr[mob_raw.sprite],
            moveSpeed : this.model.moveSpeed,
            x:0,y:0,    // 默认位置
            hpMax: this.model.hpMax,
            displayName : this.model.name,
            fleeAble: mob_raw.fleeAble,  // 是否会逃跑，默认低于20%，野兽会逃跑
            aiConfig : {
                aggroRange : mob_zon.aggroRange > 0 ? mob_zon.aggroRange : 750,   //
                aiInterval: mob_zon.aiInterval > 0 ? mob_zon.aiInterval : 500,      // 默认的响应时常, time+delta 超过之后，重新制定策略
                currentStrategy: 'idle',     //  flee | attack | dead | idle | patrol： 逃跑 | 战斗 | 已死亡 | 待命 | 巡逻
                aggressive : mob_raw.aggressive,  // 是否主动攻击
                tarX:0,tarY:0,  // 目标坐标点，激活后，默认朝此目标移动。
                tarTolerance: 48,   // 目标坐标点的偏差允许范围，低于这个值，认为已经到达目标
                // todo: 这里其实有问题的，因为计算距离的时候都是用中心点的坐标，而实际上mob大小不一，应该算边缘距离？
                // 特别是计算攻击范围的情况下。怎么办？
            },
        }
    }
    _prepareSprite(){
        // this.sprite = this.scene.physics.add.sprite(0, 0, this.config.key, "stand-01.png").setDepth(this.config.depth);
        this.sprite = new MobSprite(this.scene,this.config,this);
        // this.scene.add.existing(this.sprite);
        this.sprite.setBodySize(this.sprite.frame.width,this.sprite.frame.height);
        this.scene.physics.world.addCollider(this.sprite, this.scene.mapLayer.get("far"),this._onCollide);
        this.scene.physics.world.addCollider(this.sprite, this.scene.mapLayer.get("main"),this._onCollide);
        this.scene.physics.world.addCollider(this.sprite, this.scene.mapLayer.get("sky"),this._onCollide);
        // this.scene.physics.world.addCollider(this.sprite, this.scene.player.sprite,this._onCollide);
    }

    moveTo(x,y){
        // if(isNaN(x) || isNaN(y)) return;
        this.sprite.moveTo(x,y);
        // this.wgeRayGroup = new WgeRayGroup(this.scene,{tint:this.config.tintBullet});
    }

    setAITargetPosition(x,y){
        // if(isNaN(x) || isNaN(y)) return;
        this.config.aiConfig.tarX = x;
        this.config.aiConfig.tarY = y;
        this.ai.config.tarX = x;
        this.ai.config.tarY = y;
    }

    _onCollide(p,o){
        // console.log("mob Collide");
    }
    // 被debuff 命中后的处理
    gainDebuff(dbfObj){
        let debuffResult =  this.model.gainDebuff(dbfObj);
        switch (debuffResult){
            case 1:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_1);  //  "无法攻击、移动及防御，持续 {dbfDurR} 秒",
                this.sprite.setTint(HEX_COLOR_STUN);
                this.sprite.stop();
                this.sprite.setVelocity(0);
                break;
            case 2:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_2);
                this.sprite.setTint(HEX_COLOR_BLIND);
                this.sprite.stop();
                this.sprite.setVelocity(0);
                break;
            case 3:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_3);
                this.sprite.setTint(HEX_COLOR_SNARE);
                this.sprite.stop();
                this.sprite.setVelocity(0);
                break;
            case 4:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_4);
                this.sprite.setTint(HEX_COLOR_SLOW);
                break;
            case 5:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_5);
                this.sprite.setTint(HEX_COLOR_POSION);
                break;
            case 6:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_6);
                this.sprite.setTint(HEX_COLOR_SLOW);
                break;
            case 7:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_7);
                this.sprite.setTint(HEX_COLOR_POSION);
                break;
            case 8:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_8);
                this.sprite.setTint(HEX_COLOR_POSION);
                break;
            case 9:
                this.sprite.hud.addHurtInfo(globalStrings.DBF_DBFNAME_9);
                this.sprite.setTint(HEX_COLOR_SNARE);
                break;
            default: break;
        }
    }

    getTintColor(){
        if(!this.model.isAlive){
            if(this.sprite.isLooted) return HEX_COLOR_LOOTED;
            return HEX_COLOR_DEAD;
        }
        if(this.model.dbfFactors.msStunDuration > 0 ) return HEX_COLOR_STUN;
        if(this.model.dbfFactors.msSpasticDuration > 0) return HEX_COLOR_BLIND;
        if(this.model.dbfFactors.msNoMoveDuration > 0) return HEX_COLOR_SNARE;
        if(this.model.dbfFactors.dbfDmg >= 0.0001 ) return HEX_COLOR_POSION;
        if(this.model.dbfFactors.dbfHst >= 0.0001 ) return HEX_COLOR_SLOW;
        if(this.model.dbfFactors.dbfSpd >= 0.0001 ) return HEX_COLOR_SNARE;
        return this.config.tintNormal;
    }

    update(time,delta) {
        // console.log("mob controller update");
        this.msTimerTint = this.msTimerTint + delta;
        if(this.msTimerTint >= this.msTimerTintMax) {
            this.msTimerTint = 0;
            if(this.sprite.tint !== HEX_COLOR_NORMAL){
                this.sprite.setTint(this.getTintColor());
            }
        }

        let modelCmd = this.model.update(time,delta);   // stun spastic snare dead skip
        if(modelCmd === 'dead'){    // 死亡的优先级最高，直接走死亡逻辑。避免定身之后被打死了，走的还是定身逻辑。
            this._exeDie();
            this.sprite.update(time,delta,this.model.isAlive);
            return;
        }
        if(modelCmd === 'stun') return; // 定身

        let aiCmd = this.ai.update(time,delta,this.model.isAlive);  // flee attack dead idle patrol skip hurt

        // console.log("cmd="+cmd);
        // 行为层 - 根据状态 决定 执行对应的行为，可能存在取消之前动作的逻辑
        switch (aiCmd){
            case 'flee':
                if(modelCmd !== 'snare') this._exeFlee();   // 逃跑的时候 没有 遇到减速
                break;
            case 'attack':
                if(modelCmd !== 'spastic') this._exeAttack();  // 攻击的时候 没有 遇到僵直
                break;   // 可能不攻击，如果无可用技能，或者cd
            case 'dead':    this._exeDie(); break;
            case 'idle':    this._exeIdle(); break;
            case 'patrol':  this._exePatrol(delta); break;
            case 'skip':    break;                      // 本次update AI不介入
            case 'hurt':    break;                      // 僵直状态 AI不介入
            default:        break;
        }
        // 如果定身了，仍旧让mobattack 导致 mob 移动。
        if(modelCmd === 'snare' || modelCmd === 'stun' || modelCmd==='spastic'){
            this.sprite.setVelocity(0);
        }
        this.sprite.update(time,delta,this.model.isAlive);
    }

    // 士气崩溃判断
    isMoraleCollapse(){
        // debug
        // return true;
        return (this.model.hp <= this.model.hpMax * 0.2) && (this.config.fleeAble);
    }

    _exeFlee(){
        // console.log("mob controller exeFlee");
        // 决定向左还是向右边逃跑
        let x = this.sprite.x >= this.scene.player.sprite.x ? 300 : -300;
        this.sprite.walk(this.sprite.x+x,this.sprite.y);
        // this.sprite.walk(this.sprite.x+x,999999);
        // 在 model update 里面 自动恢复
    }
    _exeAttack(){
        if(!dbPlayer[pId].isAlive) return;
        // console.log("mob controller exeAttack");
        // distance_check
        // todo: 判断 玩家距离和可用技能，决定是否朝玩家移动，还是执行攻击
        // 这个逻辑放在AI 决定 还是放在控制层决定？
        // let flipFactor = this.sprite.flipX? 1 : -1;
        let dis = getDistance(this.scene.player.sprite.x,this.scene.player.sprite.y,this.sprite.x,this.sprite.y);
        // console.log("mob check player distance = " + dis);
        if(dis > this.model.fRangeMax){
            // move
            // debug
            this.sprite.walk(this.scene.player.sprite.x,this.scene.player.sprite.y);
            // console.log("sprite walk");
            // console.log("out of range, mob move");
        }else{  // attack - or wait
            // console.log("in range");
            this.sprite.setVelocity(0);
            this.sprite.stop();
            this.sprite.stand();
            if(this.model.gcdObj.isReady()){
                // console.log("controller attack！");
                // 调用 model.attack 方法，获取到 wgeObject
                let wgeId = this.model.getAttackObjId(dis);
                // console.log("controller wgeobj="+JSON.stringify(wgeObject));
                if(wgeId != null){
                    let wgeObject = KFModel.initMobSkill(wgeId,this.model.atk);
                    // wgeObject.chaseTarget = this.scene.player.sprite;    // debug purpose
                    // wgeObject.intIndexInArmy = this.intIndexInArmy;
                    this.sprite.attack(wgeObject);  // // wgeType: point | line | cone | threeLines | area | arc | circle | double | explode
                    // console.log(wgeObject);
                    this.playSoundEffect("attack");
                }else{
                    this.sprite.walk(this.scene.player.sprite.x,this.scene.player.sprite.y);
                }
            }else{
                // console.log("wait for next skill");
                // todo: 随机选择 [0,4] 0:原地不动， 1 保持原速度移动（朝玩家背后） 2（向上） 3 相反速度移动（往后退） 4 向下
                // 一直移动，直到下一个decision
                let decision_code = GlobalFunction.getRand(0,5);
                // let decision_code = 0;
                // debug
                // decision_code = 0;
                switch (decision_code){
                    case 0:
                        this.sprite.setVelocity(0);
                        this.sprite.stop();
                        this.sprite.stand();
                        break;
                    case 1: break;
                    case 2:
                        this.sprite.setVelocity(0,-this.model.moveSpeed);
                        this.sprite.play(this.config.key+'-walk',true);
                        break;
                    case 3:
                        this.sprite.setVelocity(-this.model.moveSpeed,0);   // 后退，不管 face
                        this.sprite.play(this.config.key+'-walk',true);
                        break;
                    case 4:
                        this.sprite.setVelocity(0,this.model.moveSpeed);
                        this.sprite.play(this.config.key+'-walk',true);
                        break;
                    default:
                        break;
                }
                this.ai.currentStrategy = "idle";
            }

        }



    }
    _exeDie(){
        // console.log("mob controller exeDie");
        this.sprite.dead();
    }
    _exeIdle(){
        // console.log("mob controller exeIdle");
        this.sprite.setVelocity(0);
        this.sprite.stop();
        this.sprite.stand();
    }
    _exePatrol(delta){
        console.log("mob controller exePatrol: #"+this.intIndexInArmy + " x / y = " + this.sprite.x+"/"+this.sprite.y + " tarX /tarY ="+this.ai.config.tarX + "/"+ this.ai.config.tarY);
        this.sprite.walk(this.ai.config.tarX,this.ai.config.tarY);
    }

    hurt(dmg,isBackstab = false){
        // console.log("mob controller exeHurt");
        if(isNaN(dmg)){
            console.log("player damage = " + dmg + " is not a num");
            return;
        }
        // 命中、闪避、防御等判断

        let result = this.model.getHurt(dmg,isBackstab);
        // console.log("player attack dmg="+dmg+", result="+result);
        if(result === -1){  // 闪避
            // console.log("player damage = " + dmg + ", mob doge");
            this.sprite.hurt(result);
        }else if(result === -2){    // 招架
            this.sprite.hurt(result);
            // console.log("player damage = " + dmg + ", mob para");
        }else{
            this.sprite.hurt(result);
            // console.log("current hp = " + this.model.hp + "/" + this.model.hpMax);
            this.sprite.hud.decrease(result);
            this.sprite.hud.draw(this.model.hp);
            this.playSoundEffect("hurt");
        }
        this.ai.notifyAttack();
        return result;
    }
    _addCollider(wgeGroup){
        for(let i=0;i<wgeGroup.length;i++){
            let collider = this.scene.physics.world.addOverlap(wgeGroup[i], this.sprite, this.scene._onOverlapWithBullet);
            this.arrCollider.push(collider);
        }
    }
    addColliderWithMissile(){
        this._addCollider(this.scene.wgeGroupFist.getChildren());
        this._addCollider(this.scene.wgeGroupSword.getChildren());
        this._addCollider(this.scene.wgeGroupMachete.getChildren());
        this._addCollider(this.scene.wgeGroupSpear.getChildren());
        this._addCollider(this.scene.wgeGroupEjection.getChildren());
        this._addCollider(this.scene.wgeGroupArc.getChildren());
        this._addCollider(this.scene.wgeGroupPaw.getChildren());
        this._addCollider(this.scene.wgeGroupHammer.getChildren());
        this._addCollider(this.scene.wgeGroupThunder.getChildren());
        this._addCollider(this.scene.wgeGroupArrow.getChildren());
        this._addCollider(this.scene.wgeGroupMeteor.getChildren());
        this._addCollider(this.scene.wgeGroupMine.getChildren());
        this._addCollider(this.scene.wgeGroupSpark.getChildren());
    }
    removeCollider(){
        for(let i=0;i<this.arrCollider.length;i++){
            this.arrCollider[i].destroy();
        }
        this.arrCollider = undefined;
    }

    destroy() {
        this.config = undefined;         // config json object
        this.model = undefined;          // data - mobModel
        this.ai = undefined;             // ai - automation
        this.sprite.destroy();

        this.intIndexInArmy = undefined; // army 中的下标，用于定位controller对象
        // 移除所有missile 的 collider
        this.removeCollider();
        this.scene = null;          // scene 对象 - 场景指针
    }

    playSoundEffect(strAction){
        // 根据mob的造型，以及传递进来的动作，决定播放 se_phaser.json 中的哪个 sprite
        let keyArr = this.config.key.split("-");    // e.g. katana-1
        let mob_mod = keyArr[0];    // e.g. tiger katana
        let mod_obj = db_mob_se.get(mob_mod);
        if(mod_obj){
            let se_key = mod_obj.get(strAction);
            if(se_key === 'mob_man_hurt_1'){
                // 有概率变成 mob_man_hurt_2
                let saving = Math.random();
                if(saving <=0.318){
                    se_key = "mob_man_hurt_2";
                }
            }
            this.scene.playSoundEffect(se_key);
        }
    }
}



