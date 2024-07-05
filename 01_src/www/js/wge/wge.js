const baseSpeed = 100;  // chase 的时候 的默认速度。应该是普通移动速度的 50%左右，单位：像素/秒
const CHASE_CRITICAL_DISTANCE = 100;    // chase的临界距离，低于这个去撞，高于这个巡航
const LIGHTNING_HEIGHT = 400;       // 闪电的起始发生高度
const LIGHTNING_RANGE = 400;        // 闪电向下的射程

const HEX_COLOR_FDB = 0xC0C0C0;     // 813 荆棘 - 银色
const HEX_COLOR_BLOOD = 0xC76A79;   // 814 吸血 - 深红色
const HEX_COLOR_SLOW = 0x52a8ff;    // 815 深寒 - 减速 -
const HEX_COLOR_POSION = 0x32cd32;  // 816 剧毒 - 绿色 -
const HEX_COLOR_BLIND = 0x2d2d2d;   // 817 暗影 - 深灰
const HEX_COLOR_STUN = 0x9F9F9F;    // 818 击退/眩晕 - 灰色
const HEX_COLOR_SNARE = 0x1e90ff;   // 819 寒潮/迟缓 - 深红色
const HEX_COLOR_NORMAL = 0xF5F5F5;  // 普通状态颜色 - 白色
const HEX_COLOR_DEAD = 0x6E6E6E;    // 死亡状态颜色 - 灰色
const HEX_COLOR_LOOTED = 0x101010;    // 已经拾取
const HEX_COLOR_DEFAULT = 0xeb6864; // 默认bullet颜色 - 红色主题色


class WgeSprite extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        // this.startX = x;
        // this.startY = y;
        // this.trip = 0;
        // this.maxRange = 0;
        // this.setScale(0.3);
        this.setDepth(9999999);
        this.displayedTime = 0;
        this.displayedTimeMax = 0;
        this.startX = 0;
        this.startY = 0;
        this.dmg = 0;
        this.collideWith = '';
        this.destroyOnHit = true;
        this.flipX = false;
        this.zoomX = 0;
        this.zoomY = 0;
        this.hitArray = []; // 记录跟哪些 mob / player 碰撞过了，避免多次触发
        /* 追踪情况下，所需要的数据 */
        this.autoChase = false; // 默认：不会自动追踪目标
        this.chaseTarget = undefined;   // 默认：没有追踪目标
        this.deltaX = 0;        // 决定巡航轨道 - 默认的移动方向是 tarObj.x + deltaX
        this.deltaY = 0;        // 决定巡航轨道 - 默认的移动方向是 tarObj.y + deltaY
        this.navIntvalMax = 300;  // 追踪修正的时间间隔
        this.navIntval = 0;     // 流逝的追踪时间
        this.debuffArr = undefined;    // debuff 数组，默认无
        this.fireFrom = -2; // 谁发射的 -1=player 0~n 表示 mobInArmy 的下标
        // 碰撞
        bindRayOverlap(this);
    }

    // todo: sprite 会有几种动作：
    // 1. 直线移动，例如气功波，又区分碰撞后消失 还是 不消失
    // 2. 呆在原地，例如刀光，也区分碰撞后消失 还是 不消失
    // 3. 移动并缩放，例如扩散的弧线刀光，也区分碰撞后消失 还是 不消失
    // 4. 圆周移动

    // 在某点，向某个点移动，同时扩散， nvx nvy =0 表示原地不动
    fire_vector(startX,startY,dmg,collideWith,flip,duration,vx,vy,zoomX,zoomY,av=0){
        this.x = startX;
        this.y = startY;
        this.startX = startX;
        this.startY = startY;
        this.body.reset(startX, startY);
        this.dmg = dmg;
        this.collideWith = collideWith;
        this.flipX = flip !== false;
        this.displayedTimeMax = duration;
        this.displayedTime = 0;
        this.setDepth(9999999);
        this.zoomX = zoomX === -1 ? 0 : (zoomX - this.scaleX) / duration;
        this.zoomY = zoomY === -1 ? 0 : (zoomY - this.scaleY) / duration;
        this.hitArray = [];
        // this.scene.add.existing(this);
        this.setActive(true);
        this.setVisible(true);
        this.setPushable(false);
        this.setImmovable(true);

        if(vx !== 0 || vy !== 0){
            this.setVelocity(vx,vy);
        }
        if(av !== 0){
            this.setAngularVelocity(av);
        }
        // console.log("fire with duration="+this.displayedTimeMax);
        // console.log(this);
    }

    // 沿圆周移动
    fire_circular(startX,startY,dmg,collideWith,flip,duration,vx,vDist,zoomX,zoomY){
        let sty = vDist;

        this.x = startX;
        this.y = startY - sty * 0.5;
        this.startX = startX;
        this.startY = startY - sty * 0.5;
        this.body.reset(this.startX, this.startY);
        this.dmg = dmg;
        this.collideWith = collideWith;
        this.flipX = flip !== false;
        this.displayedTimeMax = duration;
        this.displayedTime = 0;
        this.setDepth(9999999);
        this.zoomX = zoomX === -1 ? 0 : (zoomX - this.scaleX) / duration;
        this.zoomY = zoomY === -1 ? 0 : (zoomY - this.scaleY) / duration;
        this.hitArray = [];
        // this.scene.add.existing(this);
        this.setActive(true);
        this.setVisible(true);
        this.setPushable(false);
        this.setImmovable(true);
        // 抛物线 Stx = Vx*t + 0.5 * Ax* t*t
        // 抛物线 Sty = Vy*t

        vx = vx * 0.82;
        let ax = - 4000 * vx / duration;

        this.setVelocity(2*vx, 1.4*Math.abs(vx));
        this.setAcceleration(0.9*ax,0);
        // this.setAccelerationY(0.5);
    }

    /**
     * 追踪目标 - 移动速度固定为 baseSpeed (大约普通的 50%），要有路径噪点，避免多个追踪missile 的 路径相同
     * @param startX - 发射点
     * @param startY - 发射点
     * @param dmg - 伤害
     * @param collideWith - 与谁碰撞 mob|player
     * @param flip - 是否左右颠倒
     * @param duration - 存在的持续时间
     * @param angle - 初始发射角度，影响巡航轨道
     * @param targetObj - 自动追踪的目标 sprite
     */
    fire_chase(startX,startY,dmg,collideWith,flip,duration,angle,targetObj){
        this.autoChase = true;
        this.startX = startX; // 发射点，注意不是missile 的实际开始点
        this.startY = startY; // 发射点，注意不是missile 的实际开始点
        this.deltaX = 60 * Math.cos(angle * 0.017453293 );  // angle 是角度
        this.deltaY = 60 * Math.sin(angle * 0.017453293);
        this.x = startX + this.deltaX;
        this.y = startY + this.deltaY;

        this.body.reset(this.x, this.y);
        this.dmg = dmg;
        this.collideWith = collideWith;
        this.flipX = flip !== false;
        this.displayedTimeMax = duration;
        this.displayedTime = 0;
        this.setScale(0.5);
        this.setDepth(9999999);
        this.hitArray = [];
        this.chaseTarget = targetObj;
        this.navIntval = 0;

        this.tarX = targetObj.x + this.deltaX;       // 移动目标 - 会需要定期更新
        this.tarY = targetObj.y + this.deltaY;       // 移动目标 - 会需要定期更新
        let rotation = Math.atan2(this.tarY-this.y,this.tarX-this.x);
        this.setRotation(rotation);
        let v = normalizeVector(this.x,this.y,this.tarX,this.tarY);
        // let v = Phaser.Math.Vector2.normalize(this.x,this.y,this.tarX,this.tarY);
        // console.log("normalized v.x = " + v.x);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocity(baseSpeed * v.x,baseSpeed * v.y);
        this.setPushable(false);
        this.setImmovable(true);
        // console.log("chase vx =" + baseSpeed * v.x);
    }

    _resetData(){
        this.body.reset(0, 0);
        this.setScale(1.0);
        this.startX = 0;
        this.startY = 0;
        this.dmg = 0;
        this.collideWith = '';
        this.destroyOnHit = true;
        this.flipX = false;
        this.zoomX = 0;
        this.zoomY = 0;
        this.displayedTime = 0;
        this.setAcceleration(0,0);
        this.setVelocity(0,0);
        this.setAngularVelocity(0);
        this.setRotation(0);
        this.autoChase = false; // 默认：不会自动追踪目标
        this.chaseTarget = undefined;   // 默认：没有追踪目标
        this.deltaX = 0;        // 决定巡航轨道 - 默认的移动方向是 tarObj.x + deltaX
        this.deltaY = 0;        // 决定巡航轨道 - 默认的移动方向是 tarObj.y + deltaY
        this.navIntvalMax = 300;  // 追踪修正的时间间隔
        this.navIntval = 0;     // 流逝的追踪时间
        this.hitArray = [];
        this.debuffArr = undefined;
        this.fireFrom = -2;
        this.kfObj = null;

        this.setPushable(false);
        this.setImmovable(true);
    }

    // ...
    preUpdate(time, delta) {
        if(!this.visible) return;
        super.preUpdate(time, delta);
        if(this.displayedTime >= this.displayedTimeMax){
            // this.scene.wgeGroup.killAndHide(this);
            this.group.killAndHide(this);
            this._resetData();
        }else if(this.autoChase){
            if(this.navIntval >= this.navIntvalMax) {
                // 重置计数
                this.navIntval = 0;
                // 重新锁定目标
                let dis = getDistance(this.x, this.y, this.chaseTarget.x, this.chaseTarget.y);
                // console.log("nav check， dis="+dis);
                if (dis <= CHASE_CRITICAL_DISTANCE) {   // 临界距离
                    // 距离很近，俯冲
                    this.tarX = this.chaseTarget.x;
                    this.tarY = this.chaseTarget.y;
                } else {
                    // 距离较远，继续巡航，修正目标坐标
                    this.tarX = this.chaseTarget.x + this.deltaX;
                    this.tarY = this.chaseTarget.y + this.deltaY;
                }
                // 调整朝向
                let rotation = Math.atan2(this.tarY - this.y, this.tarX - this.x);
                this.setRotation(rotation);
                // 调整速度
                let v = normalizeVector(this.x, this.y, this.tarX, this.tarY);
                this.setVelocity(baseSpeed * v.x, baseSpeed * v.y);
            }
        }
    }

    update(time,delta) {
        if(!this.visible) return;
        if(this.zoomX !== 0 || this.zoomY !== 0){
            // console.log(this.zoomX+","+this.zoomY*delta);
            Phaser.Actions.ScaleY([this], this.zoomY*delta);
        }
        this.displayedTime = this.displayedTime + delta;

        if(this.autoChase){
            this.navIntval = this.navIntval + delta;
        }
    }

    hideSelf(){
        this._resetData();
        this.setActive(false);
        this.setVisible(false);
        // console.log("bullet hide self");

        // // 处理粒子效果
        // if(!this.boolPartile) return;
        // if(this.particle.handler !== null){
        //     // console.log('emmiter not null');
        //     this.particle.handler.stop();
        //     // console.log('emmiter stop');
        //     if(this.particle.handler.getAliveParticleCount() === 0){
        //         this.particle.handler.remove();
        //         // console.log('particle removed');
        //     }
        // }
    }
}

class WgeGroup extends Phaser.Physics.Arcade.Group{
    constructor(scene, wgType) {    // wgType = fist | sword | machete | spear | ejection
        super(scene.physics.world, scene);
        this.wgType = wgType;
        // Initialize the group
        let that = this;
        this.createMultiple({
            classType: WgeSprite, // This is the class we create just below
            frameQuantity: 50, // Create 50 instances in the pool
            active: false,
            visible: false,
            key: wgType + 'Missile',
            createCallback: function (bullet) {
                bullet.body.setAllowGravity(false);
                bullet.group = that;
                bullet.body.syncBounds = true;
            },
        });
    }

    update(time,delta){
        this.getChildren().forEach(function(s){
            s.update(time,delta);
        });
    }

    /**
     * wgGroup 的主要函数，发射bullet
     * @param startX
     * @param startY
     * @param collideWith
     * @param faceRight true = 面向右边，所有的攻击从左往右； false=面向左边，所有的攻击从右往左
     * @param tint
     * @param wgeObj
     * @param dbfObj = null , 玩家的dbfObj, 怪物的直接看词缀，玩家的因为不同武功的debuff不同，需要加到missile里面
     */
    fire(startX,startY,collideWith,faceRight,tint,wgeObj,dbfObj=null){
        // fist machete spear 默认可以穿人，命中后不消失
        // sword ejection 默认不能穿人，命中后消失
        // 特殊情况: wgeType === 'point' 说明是单目标效果，所以默认全部 命中后消失
        let destroyOnHit = (!(wgeObj.wgType === 'fist' || wgeObj.wgType === 'machete' || wgeObj.wgType === 'spear'));
        if(collideWith === 'player'){   // mob 发出来，撞击玩家的
            destroyOnHit = true;    // 所有mob 技能 碰撞后消失
        }
        // console.log("collideWith="+collideWith + " destroyOnHit="+destroyOnHit);
        switch(wgeObj.wgeType){
            case "point":
                destroyOnHit = true;    // 打单个敌人
                // console.log("single target wge, change destroyOnHit to True");
                this._fireVect(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj);
                break;
            case "line": this._fireVect(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj); break;
            case "cone": this._fireCone(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj); break;
            case "threeLines": this._fireThreeLines(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj); break;
            case "double": this._fireDouble(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj); break;
            case "area": this._fireDirections(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,6,0,dbfObj); break;
            // case "area": this._fireDouble(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj); break;
            case "arc": this._fireArc(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj); break;
            case "circle": this._fireDirections(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,2,314*64,dbfObj); break;
            case "explode": this._fireRain(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,6,dbfObj); break;
            case "chase": this._fireChase(startX,startY,collideWith,faceRight,tint,wgeObj,true,dbfObj);break;
            case "lightning": this._fireLightning(collideWith,tint,wgeObj,dbfObj);break;
            default : break;
        }
    }

    _shakeCB(){
        this.scene.cameras.main.shake(200,0.01,true);
    }

    _fireVect(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj){
        // 攻击单个敌人，造成 {wgeDmg} 伤害
        // {"wgeId": 1,"wgType": "fist","wgeType": "point","wgeDmg": 800,"wgeDist": 60,"wgeRadius": 0,"wgeAniInvoke": 0,"wgeAniLast": 200,"cd":1.5, "wgeDesc": "拳掌攻击单个敌人，造成 {wgeDmg} 伤害}
        // {"wgeId":2,"wgType":"fist","wgeType":"line","wgeDmg":600,"wgeDist":300,"wgeRadius":0,"wgeAniInvoke":0,"wgeAniLast":300,"cd":1.5,"wgeDesc":"真气激射，对前方 {wgeDist} 米范围内的敌人造成 {wgeDmg} 伤害"}
        let flip = !faceRight;
        let duration = wgeObj.wgeAniLast;
        // let duration = wgeObj.duration;
        let vx = 1000 * wgeObj.wgeDist / wgeObj.wgeAniLast
        vx = faceRight ? vx : -vx;
        let bullet = this.getFirstDead(false);
        // console.log(bullet);
        bullet.setTint(tint);
        // bullet.setScale(0.25);
        bullet.setRotation(0);
        bullet.destroyOnHit = destroyOnHit;
        bullet.level = parseInt(wgeObj.level);
        // debug purpose
        if(wgeObj.debuffArr != null){
            bullet.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
        }
        bullet.fireFrom = wgeObj.intIndexInArmy;
        // console.log("calling from group, fire bullet, index in army = "+ bullet.fireFrom );
        bullet.dbfObj = dbfObj;
        bullet.fire_vector(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,vx,0,-1,-1);
    }
    _fireCone(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj){
        // {"wgeId":3,"wgType":"fist","wgeType":"cone","wgeDmg":500,"wgeDist":200,"wgeRadius":200,"wgeAniInvoke":0,"wgeAniLast":0.2,"cd":3,"wgeDesc":"排山倒海，对前方 {wgeDist} 米锥形范围内的敌人造成 {wgeDmg} 伤害"}
        let flip = !faceRight;
        let duration = wgeObj.wgeAniLast;
        let vx = 1000 * wgeObj.wgeDist / wgeObj.wgeAniLast
        vx = faceRight ? vx : -vx;
        let bullet = this.getFirstDead(false);
        bullet.setScale(0.25,0.5);
        bullet.setRotation(0);
        bullet.setTint(tint);
        bullet.level = parseInt(wgeObj.level);
        bullet.destroyOnHit = destroyOnHit;
        if(wgeObj.debuffArr != null){
            bullet.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
        }
        bullet.fireFrom = wgeObj.intIndexInArmy;
        bullet.dbfObj = dbfObj;
        bullet.fire_vector(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,vx,0,-1,wgeObj.wgeRadius);
    }
    _fireThreeLines(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj){
        // {"wgeId":5,"wgType":"sword","wgeType":"threeLines","wgeDmg":750,"wgeDist":400,"wgeRadius":0,"wgeAniInvoke":0,"wgeAniLast":300,"cd":1.5,"wgeDesc":"三道剑芒，对前方 {wgeDist} 米范围内的敌人造成 {wgeDmg} 伤害"}
        // let x = faceRight ? startX - 32 : startX + 32;
        this._fireVect(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj);
        this._fireVect(startX,startY-48,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj);
        this._fireVect(startX,startY+48,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj);
    }

    _fireDouble(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj){
        let x = faceRight ? startX - 48 : startX + 48;
        this._fireVect(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj);
        this._fireVect(x,startY-48,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj);
    }

    _fireDirections(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,count,angularVelocity=0,dbfObj){
        let flip = !faceRight;
        let duration = wgeObj.wgeAniLast;
        let v = 1000 * wgeObj.wgeRadius / wgeObj.wgeAniLast;
        for(let i=0;i<count;i++){
            let bullet = this.getFirstDead(false);
            // bullet.setScale(0.5,0.5);
            bullet.setTint(tint);
            bullet.destroyOnHit = destroyOnHit;
            let angle = 2 * i* Math.PI / count;
            let vx = v * Math.cos(angle);
            vx = faceRight ? vx : -vx;
            let vy = v * Math.sin(angle);
            let roAng = faceRight ? angle : -angle;
            bullet.setRotation(roAng);
            if(wgeObj.debuffArr != null){
                bullet.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
            }
            bullet.level = parseInt(wgeObj.level);
            bullet.fireFrom = wgeObj.intIndexInArmy;
            bullet.dbfObj = dbfObj;
            // console.log("collideWith = "+collideWith);
            bullet.fire_vector(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,vx,vy,-1,-1,angularVelocity);
        }
    }

    _fireRain(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,count,dbfObj){
        let duration = wgeObj.wgeAniLast;
        let flip = !faceRight;
        let x = faceRight ? wgeObj.wgeDist : -wgeObj.wgeDist;
        let tarX = startX + x;      // 计算落点
        // let rainDrops = [];
        // let rainDropFlyDistance = 600;      // 雨点飞行的长度，默认300
        let v = 1000 * 600 / wgeObj.wgeAniLast;
        let vx = faceRight ? v * 0.707 : v * -0.707;
        let vy = v * 0.707;
        for(let i=0;i<count;i++){
            let angle = 2* Math.random() * Math.PI;
            let rdx = tarX + wgeObj.wgeRadius * Math.cos(angle);    // 计算落点
            let rdy = startY + wgeObj.wgeRadius *Math.sin(angle);

            let sx = faceRight ? rdx - 424 : rdx + 424; // 600 *0.707
            let sy = rdy - 424;

            let bullet = this.getFirstDead(false);
            // bullet.setScale(0.5,0.5);
            bullet.setTint(tint);
            let roAng = faceRight ? Math.PI*0.25 : -Math.PI*0.25;
            bullet.setRotation(roAng);
            // updated 20230707 所有的rain 碰撞后消失，不会被弹开
            bullet.destroyOnHit = true;
            bullet.level = parseInt(wgeObj.level);
            // bullet.setScale(Math.random()*0.3 + 0.35);
            // updated 20230707 解决落点太小问题
            bullet.setScale(Math.random()*0.3 + 0.65);
            if(wgeObj.debuffArr != null){
                bullet.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
            }
            bullet.fireFrom = wgeObj.intIndexInArmy;
            bullet.dbfObj = dbfObj;
            // updated 20230707 解决下雨的时候不完全落地问题，把持续时间加倍
            bullet.fire_vector(sx,sy,wgeObj.wgeDmg,collideWith,flip,duration * 1.5,vx*(1+Math.random()*0.2),vy*(1+Math.random()*0.2),-1,-1);
        }
        if(wgeObj.wgType === "meteor" || wgeObj.wgType === "thunder"){
            this.scene.time.addEvent({
                delay: duration,   // ms
                callback: this._shakeCB,
                callbackScope: this,
                repeat: 0
            });
        }
    }

    _fireArc(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj){
        let flip = !faceRight;
        let duration = wgeObj.wgeAniLast;
        let dist = wgeObj.wgeDist + this.scene.player.sprite.displayHeight;
        let vx = 1000 * dist / wgeObj.wgeAniLast
        vx = faceRight ? vx : -vx;
        let bullet = this.getFirstDead(false);
        bullet.setTint(tint);
        // bullet.setScale(0.25);
        bullet.setRotation(0);
        bullet.destroyOnHit = destroyOnHit;
        if(wgeObj.debuffArr != null){
            bullet.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
        }
        bullet.level = parseInt(wgeObj.level);
        bullet.fireFrom = wgeObj.intIndexInArmy;
        bullet.dbfObj = dbfObj;
        bullet.fire_circular(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,vx,dist,-1,-1);

    }

    // 发射追逐目标的missile
    _fireChase(startX,startY,collideWith,faceRight,tint,wgeObj,destroyOnHit,dbfObj){
        // 攻击单个敌人，造成 {wgeDmg} 伤害
        // {"wgeId": 1,"wgType": "fist","wgeType": "point","wgeDmg": 800,"wgeDist": 60,"wgeRadius": 0,"wgeAniInvoke": 0,"wgeAniLast": 200,"cd":1.5, "wgeDesc": "拳掌攻击单个敌人，造成 {wgeDmg} 伤害}
        // {"wgeId":2,"wgType":"fist","wgeType":"line","wgeDmg":600,"wgeDist":300,"wgeRadius":0,"wgeAniInvoke":0,"wgeAniLast":300,"cd":1.5,"wgeDesc":"真气激射，对前方 {wgeDist} 米范围内的敌人造成 {wgeDmg} 伤害"}
        let flip = !faceRight;
        let duration = wgeObj.wgeDuration;
        let count = wgeObj.missileCount;
        let targetObj = wgeObj.chaseTarget;
        wgeObj.chaseTarget = null;
        // 断开 wgeObj的 chaseTarget 指针？ 测试 null 之后 有无影响， targetObj会不会变成null?
        switch (count){
            case 2: // 发射两个，一上 一下
                let bullet1 = this.getFirstDead(true);
                bullet1.destroyOnHit = destroyOnHit;
                if(wgeObj.debuffArr != null){
                    bullet1.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
                }
                bullet1.level = parseInt(wgeObj.level);
                bullet1.fireFrom = wgeObj.intIndexInArmy;
                bullet1.dbfObj = dbfObj;
                bullet1.setTint(tint);
                bullet1.fire_chase(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,90,targetObj);
                let bullet2 = this.getFirstDead(true);
                bullet2.destroyOnHit = destroyOnHit;
                if(wgeObj.debuffArr != null){
                    bullet2.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
                }
                bullet2.level = parseInt(wgeObj.level);
                bullet2.fireFrom = wgeObj.intIndexInArmy;
                bullet2.dbfObj = dbfObj;
                bullet2.setTint(tint);
                bullet2.fire_chase(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,-90,targetObj);
                break;
            case 3: // 发射三个 Y 形状
                let bulleta = this.getFirstDead(true);
                bulleta.destroyOnHit = destroyOnHit;
                if(wgeObj.debuffArr != null){
                    bulleta.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
                }
                bulleta.level = parseInt(wgeObj.level);
                bulleta.fireFrom = wgeObj.intIndexInArmy;
                bulleta.dbfObj = dbfObj;
                bulleta.setTint(tint);
                bulleta.fire_chase(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,30,targetObj);
                let bulletb = this.getFirstDead(true);
                bulletb.destroyOnHit = destroyOnHit;
                if(wgeObj.debuffArr != null){
                    bulletb.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
                }
                bulletb.level = parseInt(wgeObj.level);
                bulletb.fireFrom = wgeObj.intIndexInArmy;
                bulletb.dbfObj = dbfObj;
                bulletb.setTint(tint);
                bulletb.fire_chase(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,120,targetObj);
                let bulletc = this.getFirstDead(true);
                bulletc.destroyOnHit = destroyOnHit;
                if(wgeObj.debuffArr != null){
                    bulletc.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
                }
                bulletc.level = parseInt(wgeObj.level);
                bulletc.fireFrom = wgeObj.intIndexInArmy;
                bulletc.dbfObj = dbfObj;
                bulletc.setTint(tint);
                bulletc.fire_chase(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,-90,targetObj);
                break;
            default:    // 默认发射1个，在上方
                let bullet = this.getFirstDead(true);
                bullet.destroyOnHit = destroyOnHit;
                if(wgeObj.debuffArr != null){
                    bullet.debuffArr = (wgeObj.debuffArr.length > 0) ? wgeObj.debuffArr.slice() : undefined;
                }
                bullet.level = parseInt(wgeObj.level);
                bullet.fireFrom = wgeObj.intIndexInArmy;
                bullet.dbfObj = dbfObj;
                bullet.setTint(tint);
                bullet.fire_chase(startX,startY,wgeObj.wgeDmg,collideWith,flip,duration,90,targetObj);
                break;
        }

    }

    _fireLightning(collideWith,tint,wgeObj,dbfObj){

        // let wgeAniLast = wgeObj.wgeAniLast; // 动画持续的时间 - 这里其实混淆了mob 的前摇时间和 动画持续时间，但是不管了。
        let wgeDuration = wgeObj.wgeDuration;   // wge持续的时间： 一个wge可以有多个missile，每个missile有ani发射时间
        let count = wgeObj.missileCount;
        let radius = wgeObj.wgeRadius;
        let minX = wgeObj.chaseTarget.x - radius;
        // let maxX = wgeObj.chaseTarget.y + radius;
        let delay = wgeDuration / count;
        let actY = wgeObj.chaseTarget.y;
        wgeObj.chaseTarget = null;

        let xArr = [minX];
        for(let i=1;i<count;i++){
            xArr.push(minX + i * radius * 2/(count-1));
        }
        xArr.sort(function() {return .5 - Math.random();});

        // console.log("fire ligntning count="+count + ", radius=" + radius + ", delay="+delay);
        for(let i=0;i<count;i++){
            this.scene.time.addEvent({
                delay: delay*i,   // ms
                callback: this._fireLightningCB,
                args: [{"x":xArr[i],"y":actY-LIGHTNING_HEIGHT- 64*(0.5*Math.random()),"collideWith":collideWith,"tint":tint,"wgeObj":wgeObj,"dbfObj":dbfObj}],
                callbackScope: this,
                repeat: 0
            });
        }
    }

    _fireLightningCB(arg){
        // console.log(arg);
        let duration = arg.wgeObj.wgeAniLast;
        let vy = 1000 * LIGHTNING_RANGE / arg.wgeObj.wgeAniLast;
        let bullet = this.getFirstDead(false);
        bullet.setTint(arg.tint);
        // bullet.setScale(0.25);
        bullet.setRotation(0);
        bullet.destroyOnHit = false;
        if(arg.wgeObj.debuffArr != null){
            bullet.debuffArr = (arg.wgeObj.debuffArr.length > 0) ? arg.wgeObj.debuffArr.slice() : undefined;
        }
        bullet.level = parseInt(arg.wgeObj.level);
        bullet.fireFrom = arg.wgeObj.intIndexInArmy;
        bullet.dbfObj = arg.dbfObj;
        bullet.fire_vector(arg.x,arg.y,arg.wgeObj.wgeDmg,arg.collideWith,1,duration,0,vy,-1,-1);
        if(arg.wgeObj.wgType === "meteor" || arg.wgeObj.wgType === "thunder") this._shakeCB();
    }

    // omitted
    _fireLaser(x, y,dmg,collideWith) {
        // e.g missile0
        // Get the first available sprite in the group
        const laser0 = this.getFirstDead(false);
        if(laser0 === null) return;
        laser0.dmg = dmg;
        laser0.foe = collideWith;
        laser0.fire(x,y,0);
        const laser1 = this.getFirstDead(false);
        if(laser1 === null) return;
        laser1.dmg = dmg;
        laser1.foe = collideWith;
        laser1.fire(x,y,1);
        const laser2 = this.getFirstDead(false);
        if(laser2 === null) return;
        laser2.dmg = dmg;
        laser2.foe = collideWith;
        laser2.fire(x,y,2);
        const laser3 = this.getFirstDead(false);
        if(laser3 === null) return;
        laser3.dmg = dmg;
        laser3.foe = collideWith;
        laser3.fire(x,y,3);
        const laser4 = this.getFirstDead(false);
        if(laser4 === null) return;
        laser4.dmg = dmg;
        laser4.foe = collideWith;
        laser4.fire(x,y,4);
        const laser5 = this.getFirstDead(false);
        if(laser5 === null) return;
        laser5.dmg = dmg;
        laser5.foe = collideWith;
        laser5.fire(x,y,5);
        // if (laser) {
        //     laser.fire(x, y);
        // }
    }
}

function bindRayOverlap(ray){ // ray 与  +player 碰撞 ,不考虑与 -mob碰撞，mob的在mobCtrl 处理
    // updated 20230711 只增加与玩家的，与mob的在mobCtrl中处理
    // for(let i=0;i<ray.scene.army.length;i++){
    //     ray.scene.physics.world.addCollider(ray, ray.scene.army[i].sprite, ray.scene._onOverlapWithBullet);
    //     // no need: check 20220512 给mob 和 player 绑定相同的 回调函数，在 回调函数中，区分bullet 的  foe 属性，是等于 'mob' 还是 'player'
    // }
    ray.scene.physics.world.addCollider(ray, ray.scene.player.sprite, ray.scene._onOverlapWithBullet);
    // done in mobCtrl: 回调函数，怪物死亡的时候，从_mobArr删除
}