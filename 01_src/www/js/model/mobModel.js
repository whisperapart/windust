/**
 * Mob模型，构造zone中的具体mob
 * Created by jim on 2020/6/2.
 */

const mob_reg_default = 0.02;
const mob_reg_skill = 0.06;

class MobModel{
    // 静态函数
    /**
     * 根据传入的掉落数组 e.g. [101.1,102.04]，创建掉落列表 物品Id.掉率
     * @param dropArr
     * @returns {*[]} - 掉落数组
     */
    static initDrops(dropArr){
        let inventory = [];
        for(let i=0;i<dropArr.length;i++){
            // drop example : "drop":[13.1,14.05]
            let itemId = Math.floor(parseInt(dropArr[i]));
            let rate = dropArr[i] - itemId;
            // console.log("random rate =["+rate+"] and itemId=<"+itemId+">");
            // updated 2023.05.18 掉率乘以随机数，进一步调整掉率
            // 20级以下，等级保护，新手区，掉率不修正。20级以上掉率需要先随机。
            let dropFix = (dbPlayer[pId].level <= 20) ? 1.0 : Math.random();
            rate = rate * dropFix + 0.36 * dbPlayer[pId].totalState.luk;
            if(GlobalFunction.randSaving(rate)){
                inventory.push(gDB.getItemById(itemId));
            }
        }
        return inventory;
    }
    /**
     * 根据传入的affix,切割为 skill_id数组，并处理 随机技能问题
     * @param affix
     * @return skill_id 数组
     */
    static explainSkillsFromAffix(affix){
        let array_skills = affix.toString().split(',');
        // console.log("init skills = " + array_skills.toString());
        let explained_skills = [];
        for(let i=0;i<array_skills.length;i++){
            switch (array_skills[i]){
                case "101": // [ 111 , 117 ]
                    // let seq = GlobalFunction.getRandUnique(111,118,1);
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(111,118,1));
                    break;
                case "102":
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(111,118,2));
                    break;
                case "103":
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(111,118,3));
                    break;
                case "201": // [ 211 , 218 ]
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(211,219,1));
                    break;
                case "202":
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(211,219,2));
                    break;
                case "203":
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(211,219,3));
                    break;
                case "801": // [ 811 , 820 ]
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(811,821,1));
                    break;
                case "802":
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(811,821,2));
                    break;
                case "803":
                    explained_skills = explained_skills.concat(GlobalFunction.getRandUnique(811,821,3));
                    break;
                default:
                    explained_skills.push(parseInt(array_skills[i]));
                    break;
            }
        }
        // console.log("explained skills = " + explained_skills.toString());
        // 注意，这里有个潜在的问题：如果技能数组里面已经有 811, 80x 随机的时候，也随机到了 811 怎么办？
        // 对 explained_skills 去重
        return Array.from(new Set(explained_skills));
    }


    // 构造函数
    /**
     * mob_meta = {"zone_id":55,"mob_template_id":1,"name":"小白兔","pos_x":50,"pos_y":100,"height":32,"animation_speed":1}
     * @param zone_mob
     */
    constructor(zone_mob){
        let tmp = gDB.getMobById(zone_mob.mob_template_id);
        if(tmp === undefined) return;
        // deep copy
        this.id = GlobalFunction.uuid();
        this.mobId = tmp.mob_template_id;
        this.name = zone_mob.name ? zone_mob.name : tmp.mob_template_name;  // 优先使用地图上的名字
        this.title = tmp.title; // 展示用 例如：绿林盟主
        // bug-fix for loc 20240515: remove title
        this.title = '';
        this.displayAffix = ""; // 默认词缀 没有
        // this.sprite = tmp.sprite;   // gui 展示层对象
        this.level = tmp.level;
        this.atk = tmp.atk;     // 词缀之后的数值， 不处理debuff，debuff实时计算
        this.def = tmp.def;
        this.hpMax = tmp.hpMax;
        this.hp = tmp.hpMax;
        this.reg = Math.ceil(this.hpMax * mob_reg_default);  // 根据 gcd来， 不是根据 AI 的 tick，默认2%，恢复技能 6%
        this.fdb = 0;           // 反伤效果系数
        this.fdh = 0;           /** 吸血效果系数 */
        this.dge = tmp.dge ? tmp.dge : 0;
        this.par = tmp.par ? tmp.par : 0;
        this.spasticity = true; // 被攻击之后的僵直状态，默认启用，僵直时间统一 300ms
        this.spastDuration = 300;
        // updated 2023.07.26 等级低的怪物，速度降低 30以下
        this.moveSpeed = GlobalConfig.MOVE_SPEED_DEFAULT;  // player default = 200 词缀之后的数值， 不处理debuff，debuff实时计算
        if(this.level<10){
            this.moveSpeed = GlobalConfig.MOVE_SPEED_10;
        }else if(this.level<20){
            this.moveSpeed = GlobalConfig.MOVE_SPEED_20;
        }else if(this.level<30){
            this.moveSpeed = GlobalConfig.MOVE_SPEED_30;
        }

        this.fRangeMin = 40.0;  // 射程最小值 - 通常默认，近战距离
        this.fRangeMax = 60.0;  // 射程最大值 - 应该根据 wgList 进行调整
        this.gcdObj = new CDModel(1500);    // 技能 gcd
        this.regCDObj = new CDModel(6000);  // 自动恢复 cd
        this.faceDirection = 1;   // 1 向右 -1 向左 根据图片朝向设置
        this.isAlive = true;
        // this.fleeAble = tmp.fleeAble;
        this.aggressive = tmp.aggressive;    // 用于快速战斗 - 是否add

        // updated 20230825 - 小秋不会被墓穴怪物主动攻击
        if(pId === 1){
            // 范围 [145,159] [165,166]
            if(GlobalConfig.MOB_TEMPLATE_UNDEAD.indexOf(tmp.mob_template_id) >= 0){
                this.aggressive = false;
            }
        }


        // generate drop-item from drop array
        this.inventory = MobModel.initDrops(tmp.drop);
        this.inventoryStr = this.inventory.map( obj =>{ return obj.itemName; }).join(",");

        this.dbfFactors = {"dbfDmg":0.0,"dbfHst":0.0,"dbfSpd":0.0,"msNoMoveDuration":0,"msStunDuration":0,"msSpasticDuration":0}; // 收到debuff影响的数组

        // 拼装词缀 技能
        // 随机skill 的处理
        this.wgList = [];   // {kfId:14,cdMax:1500,cdCount:1200},
        this.ngList = [];   // {dbfId:811,dbfName:"深寒",dbfDesc:"",dbfArg1:0.16,dbfRate:0.33}
        this.explainedSkillIdArray = [];
        this.explainedSkillIdArray = MobModel.explainSkillsFromAffix(tmp.affix);
        this._initSkills();
        this._initWgeObjects();
        // console.log(JSON.stringify(this.wgList));

        this.shortName = this.name;
        // 使用 template 里面的mob_name - 因为template里面有title，zone里面没有title
        if(zone_mob.name !== this.name) this.name = this.title === "" ? this.name : this.name + "<" + this.title+">";
        // 显示词缀
        this.name = this.displayAffix === "" ? this.name : this.name + " [ " + this.displayAffix + " ]";

        // this.aiScriptConfig = {
        //     aggroRange : 750,   // aggro 设置为0时，表示不会主动攻击
        //     tick: 1000,      // 默认的响应时常, time+delta 超过之后，重新制定策略
        //     currentStrategy: 'flee',     //  flee | attack | dead | idle | patrol： 逃跑 | 战斗 | 已死亡 | 待命 | 巡逻
        //     fleeAble:true,  // 是否会逃跑，默认低于20%，野兽会逃跑
        //     tarX:200,tarY:150,  // 目标坐标点，激活后，默认朝此目标移动。
        //     tarTolerance: 48,   // 目标坐标点的偏差允许范围，低于这个值，认为已经到达目标
        // }
        //
        // this.ai = new MobAI(this);  // 初始化AI， AI控制层对象
    }

    /** 无尽模式的时候，怪物的强度随 wave 而增强 **/
    applyWaveBuff(intWave){
        // 每10关变强一次，强度提升 30%
        let factor = 0.2 + 0.3 * (Math.ceil( intWave * 0.1) ) + 0.02*(intWave-1);
        this.level = intWave;
        this.atk = Math.round(this.atk * factor);
        this.def = Math.round(this.def * factor);
        this.hpMax = Math.round(this.hpMax * factor);
        this.hp = Math.round(this.hpMax * factor);
        this.reg = Math.ceil(this.hpMax * mob_reg_default * factor);
        this.fdb = Math.round(this.fdb * factor);           // 反伤效果系数
        this.fdh = Math.round(this.fdh * factor);           /** 吸血效果系数 */
        // this.dge = Math.round(this.dge * factor);
        // this.par = Math.round(this.par * factor);
    }

    // 公有函数
    /**
     * 常规更新相应函数，每个update 执行的动作
     * @param time
     * @param delta
     */
    update(time,delta){
        let ret = 'skip';
        this.isAlive = this.isAlive ? this.hp > 0 : false;
        // 眩晕逻辑 - 跳过本轮其他逻辑 - 这里没问题，玩家的debuff 认为是持久的，不需要考虑其他dbuff的时间衰减问题
        if(this.dbfFactors.msStunDuration > 0){
            this.dbfFactors.msStunDuration = this.dbfFactors.msStunDuration > delta ? this.dbfFactors.msStunDuration - delta : 0;
            return 'stun';
        }
        // 僵直逻辑 - 无法攻击，在调用方进行判断
        if(this.dbfFactors.msSpasticDuration > 0){
            this.dbfFactors.msSpasticDuration = this.dbfFactors.msSpasticDuration > delta ? this.dbfFactors.msSpasticDuration - delta : 0;
            ret = 'spastic';
        }
        // 止行逻辑 - 无法移动，在调用方 对 dbFactors.msNoMoveDuration 进行判断
        if(this.dbfFactors.msNoMoveDuration > 0){
            this.dbfFactors.msNoMoveDuration = this.dbfFactors.msNoMoveDuration > delta ? this.dbfFactors.msNoMoveDuration - delta : 0;
            ret = 'snare';
        }

        // 减速逻辑
        let slowRate = (1 - this.dbfFactors.dbfHst).toFixed(4);
        let mobDelta = Math.round(delta * slowRate);    // 通过 update 实现 减速

        if(this.isAlive){
            this.gcdObj.update(mobDelta);
            this.regCDObj.update(mobDelta);
            for(let i=0;i<this.wgList.length;i++){
                this.wgList[i].cdObj.update(mobDelta);
            }

            if(this.regCDObj.isReady()){
                this.healSelf(this.reg);
                this.regCDObj.reset();
            }
        }else{
            ret = 'dead';
        }
        return ret;
    }
    /**
     * 受到攻击
     * @param dmg
     * @param isBackstab boolean 是否是背后的攻击。如果是，不进行闪避、招架的豁免判定，默认命中。
     * @returns {number}
     */
    getHurt(dmg,isBackstab=false){
        // this.ai.notifyAttack(); // 通知mob 进入 aggro 状态 - 被打了 - 放到控制器层
        // 如果是定身状态，直接返回最大伤害
        if(this.dbfFactors.msStunDuration > 0){
            this.hp = this.hp - dmg;
            if(this.hp<=0){ this.die();}
            return dmg;
        }
        // 如果，不是背刺，判断 闪避 - 招架
        if(!isBackstab){    // 非背刺
            // 闪避豁免
            // updated 20230518 玩家的命中影响此处闪避的判断。
            let hitFix = dbPlayer[pId].totalState.hit * 100; // 3% 命中 => 减少 3点闪避
            let dge = Math.round(this.dge - hitFix);
            let rnd = GlobalFunction.getRand(0,100);
            // console.log("闪避豁免：dge="+dge+" rnd="+rnd);
            if(rnd < dge ){return -1;}

            // todo: 中止当前动作

            // 招架豁免
            // updated 20230518 玩家的幸运影响此处招架的判断。
            let lukFix = dbPlayer[pId].totalState.luk * 100; // 3% 幸运 => 减少 3点招架
            let par = Math.round(this.par - lukFix);
            rnd = GlobalFunction.getRand(0,100);
            // console.log("招架豁免：par="+par+" rnd="+rnd);
            // todo: 招架动画
            if(rnd < par){return -2;}
        }

        // 非定身状态，并且没有闪避，也没有招架，计算防御效果
        // def 减伤 = def/1000;
        // dbf stun 效果：防御无效
        // 怪物防御 是 千分比
        // let actDmg = this.dbfFactors.msStunDuration > 0 ? dmg : Math.ceil(dmg * (1 - this.def * 0.001));
        let actDmg = Math.ceil(dmg * (1 - this.def * 0.001));
        // updated 2023.07.26 - 连击追加伤害
        if(dbPlayer[pId].comboCount > 0) actDmg = Math.floor(actDmg * (1 + dbPlayer[pId].comboCount * 0.1));
        // console.log("怪物受到实际伤害="+actDmg);
        this.hp = this.hp - actDmg;
        if(this.hp<=0){ this.die();}
        return actDmg;
    }

    /**
     * 怪物上debuff
     * @param kfObj debuff Obj，可以直接用kfObj
     * @returns {number} -1:怪物免疫控制 0 数据异常 1+ 对应的debuff编号
     */
    gainDebuff(kfObj){
        /*
            dbfInfo = {'dbfObj':kfObj.dbfObj,
            "dbfDmg":kfObj.dbfDmg,"dbfDur":kfObj.dbfDur,"dbfHst":kfObj.dbfHst,
            "dbfRat":kfObj.dbfRat,"dbfSpd":kfObj.dbfSpd
            };
            // dbfDmg : NaN
            // dbfDur : 6.704992
            // dbfHst : 4.849664
            // dbfObj : {dbfId: 6, dbfName: '奇痒', dbfDesc: '攻击速度降低 {dbfHstR} %', dbfArg1: 32}
            // dbfRat : 0.356
            // dbfSpd : 4.695744
        // debuff, 怪物的从简，中了之后就一直有，不会消退 -- 除非是定身 眩晕 有明确时间的
        // debuff，所有同类型的，取最大影响值：伤害-10% 伤害-15% => 伤害 -15%
        // 减速 的实现， 在 update 里面 deltaTime 直接乘以系数： 10%减速， delta = delta * （1-10%）
        // 移动速度的实现，直接反应在 moveSpeed - 快速战斗体现在 命中玩家的概率，体现为命中概率
        // 伤害 - 直接影响 dmg，根据初始atk和词缀得到的atk结果不变，但是攻击命中后实际产生伤害的时候，算debuff
         */

        if(!kfObj.dbfObj){ return 0; }
        switch (kfObj.dbfObj.dbfId){
            case 1: // 眩晕 "无法攻击与移动，持续 {dbfDurR} 秒"
                if(this.isImmuneToControl()) return -1;
                this._dbfStun(Math.round(kfObj.dbfDur * 1000));
                return 1;
            case 2: // 僵直 "无法攻击，持续 {dbfDurR} 秒",
                if(this.isImmuneToControl()) return -1;
                this._dbfSpastic(Math.round(kfObj.dbfDur * 1000));
                return 2;
            case 3: // "止行"  "无法移动，持续 {dbfDurR} 秒",
                if(this.isImmuneToControl()) return -1;
                this._dbfNoMove(Math.round(kfObj.dbfDur * 1000));
                return 3;
            case 4: // "减速","攻击速度降低 {dbfHstR} %，移动速度降低 {dbfSpdR} %",
                this._dbfSlowMove(kfObj.dbfSpd*0.01);
                this._dbfSlowAttack(kfObj.dbfHst*0.01);
                return 4;
            case 5: // "剧痛","移动速度降低 {dbfSpdR} %，伤害降低 {dbfDmgR} %",
                this._dbfSlowMove(kfObj.dbfSpd*0.01);
                this._dbfWeakDamage(kfObj.dbfDmg * 0.01);
                return 5;
            case 6: // "奇痒","攻击速度降低 {dbfHstR} %",
                this._dbfSlowAttack(kfObj.dbfHst*0.01);
                return 6;
            case 7: // "虚弱","攻击速度降低 {dbfHstR} %,伤害降低 {dbfDmgR} %",
                this._dbfSlowAttack(kfObj.dbfHst*0.01);
                this._dbfWeakDamage(kfObj.dbfDmg * 0.01);
                return 7;
            case 8: // "无力", "伤害降低 {dbfDmgR} %",
                this._dbfWeakDamage(kfObj.dbfDmg * 0.01);
                return 8;
            case 9: // "断筋","移动速度降低 {dbfSpdR} %",
                if(this.isImmuneToControl()) return -1;
                this._dbfSlowMove(kfObj.dbfSpd*0.01);
                return 9;
            default: return 0;
        }
    }

    isImmuneToControl(){
        return (this.explainedSkillIdArray.indexOf(912) > 0 || this.explainedSkillIdArray.indexOf(913) > 0 || this.explainedSkillIdArray.indexOf(914) > 0);
    }

    _dbfSlowMove(percentage){
        if(this.isImmuneToControl()){ return;}
        if(this.explainedSkillIdArray.indexOf(811) > 0) return; // 811 = 神行
        this.dbfFactors.dbfSpd = this.dbfFactors.dbfSpd >= percentage ? this.dbfFactors.dbfSpd : percentage.toFixed(4);
    }
    _dbfStun(msDuration){
        if(this.isImmuneToControl()){ return;}
        this.dbfFactors.msStunDuration = this.dbfFactors.msStunDuration + msDuration;
    }
    _dbfSpastic(msDuration){
        if(this.isImmuneToControl()){ return;}
        this.dbfFactors.msSpasticDuration = this.dbfFactors.msSpasticDuration + msDuration;
    }
    _dbfNoMove(msDuration){
        if(this.isImmuneToControl()){ return;}
        this.dbfFactors.msNoMoveDuration = this.dbfFactors.msNoMoveDuration + msDuration;
    }
    _dbfSlowAttack(percentage){
        this.dbfFactors.dbfHst = this.dbfFactors.dbfHst >= percentage ? this.dbfFactors.dbfHst : percentage.toFixed(4);
    }
    _dbfWeakDamage(percentage){
        this.dbfFactors.dbfDmg = this.dbfFactors.dbfDmg >= percentage ? this.dbfFactors.dbfDmg : percentage.toFixed(4)
    }


    healSelf(amount){
        if(!this.isAlive) return;
        this.hp = this.hp+amount > this.hpMax ? this.hpMax : this.hp+amount;
    }
    /**
     * 怪物死亡逻辑
     */
    die(){
        this.isAlive = false;
        // drop item
        // add exp
        // 物品与exp的问题，交到battleModal中
        // console.log("怪物死亡。");
        // CharacterModel.gainExp(this._myExp());
        // todo: 移除逻辑，sprite 清除，ai清除 等，死亡动画等
        // this.ai = null;
        // this.sprite = null;
    }
    // 攻击逻辑，包括无可用攻击技能的应对（例如:移动、等待或者休息）
    getAttackObjId(dis){
        // 注意，内功的附加属性判断saving 通过之后，应该转移到bullet上。 计算碰撞需要
        // 组装 wgeObject
        let skillIdx = this._getAvailableSkillIndex(dis);
        // console.log("mob ava skill=" + skillIdx);
        if(skillIdx !== -1){
            // 有可用技能，使用对应技能
            // 处理 skill cd
            this.wgList[skillIdx].cdObj.reset();
            // 处理 gcd
            this.gcdObj.reset();
            // console.log("wgList in model："+JSON.stringify(this.wgList[skillIdx]));
            return this.wgList[skillIdx].skill_id;
        }
        return null;
    }
    /**
     * 逃跑逻辑
     */
    flee(){
        // 恢复生命
        // 不需要了，因为update里面会自动
    }
    /**
     * 怪物提供的经验值
     * @returns {number}
     */
    getExp(){
        return this.level * this.level * 8;
    }

    fixRangeWithSelfWidth(intSelfWidth){
        this.fRangeMax = this.fRangeMax + intSelfWidth;
    }

    // 私有函数
    /**
     * 根据已经explained Skill Array，增加 wgList 和 ngList，调整对应的怪物属性e.g. hp atk def 等
     * @private
     */
    _initSkills(){
        // {"skill_id":1,"affix":"撕咬","desc":"撕咬攻击，伤害=dmg * level * dmgRate* 难度修正系数","type":"active","cdMax":1500,"duration":1000,"range":60,"dmgRate":0.8}
        this.wgList = [];
        // 默认都会普通攻击技能，伤害 = atk
        let default_skill_proto = gDB.getMobSkillById(0);
        // {"skill_id":0,"affix":"攻击","desc":"普通攻击，伤害=dmg。","type":"active","cdMax":1500,"duration":1400,"range":64,"dmgRate":1.0}
        this._prepareWG(default_skill_proto);

        for(let i=0;i<this.explainedSkillIdArray.length;i++){
            switch(this.explainedSkillIdArray[i]){
                case 811: this._skill811(); break;
                case 812: this._skill812(); break;
                case 813: this._skill813(); break;
                case 814: this._skill814(); break;
                case 815: this._skill815(); break;
                case 816: this._skill816(); break;
                case 817: this._skill817(); break;
                case 818: this._skill818(); break;
                case 819: this._skill819(); break;
                case 820: this._skill820(); break;
                case 911: this._skill911(); break;
                case 912: this._skill912(); break;
                case 913: this._skill913(); break;
                case 914: this._skill914(); break;
                default:    // 说明是外功
                    this._skillWG(this.explainedSkillIdArray[i]);
                    break;
            }
        }
    }
    _initWgeObjects(){
        for(let i=0;i<this.wgList.length;i++){
            this.wgList[i].wgeObj = this._convertSkillToWgeObject(i);
        }
    }

    /**
     * 给怪物增加外功技能，同时调整 rangeMax
     * @param skillProto
     * @private
     */
    _prepareWG(skillProto){
        if(skillProto.type !== 'active') return;    // 非主动技能，被动技能，不计入外功组
        let tmpObj = deepClone(skillProto);
        tmpObj.cdObj = new CDModel(tmpObj.cdMax*1000);
        // tmpObj.range = parseFloat(tmpObj.range).toFixed(2);
        tmpObj.range = Math.round(parseFloat(tmpObj.range) * 100) / 100;
        // console.log(JSON.stringify(tmpObj));
        this.wgList.push(tmpObj);
        this.fRangeMax = Math.max(this.fRangeMax,tmpObj.range);
    }
    /**
     * 计算显示词缀的字符串: e.g 神弓 霸体
     * @param skillProto
     * @private
     */
    _prepareAffix(skillProto){
        if(skillProto === undefined) return;
        if(skillProto.affix === undefined) return;
        this.displayAffix = skillProto ? (this.displayAffix + " " + skillProto.affix).trim() : this.displayAffix.trim();
    }
    /**
     * 默认的技能处理逻辑：获取对应的技能，压入wgList，准备词缀。
     * @param intSkillId
     * @private
     */
    _skillWG(intSkillId){
        let skill = gDB.getMobSkillById(intSkillId);
        // console.log("_skillWG, skllCDMax ="+skill.cdMax);
        this._prepareWG(skill);
        this._prepareAffix(skill);
    }
    /**
     * 获取可用的攻击技能，优先选择编号最大的技能。
     * @private
     * @return {number} - 可用的wgList下标，如果有多个，优先技能编号靠后的
     */
    _getAvailableSkillIndex(dis){
        for(let i=this.wgList.length-1;i>=0;i--){
            if(this.wgList[i].cdObj.isReady() && (this.wgList[i].range >= dis)){
                return i;
            }
        }
        return -1;
    }
    _convertSkillToWgeObject(intSkillIdx){
        let kfObj = KFModel.initMobSkill(intSkillIdx, this.atk);
        // kfObj.kfType = player :  fist | sword | machete | spear | ejection |
        //              => mob:     paw | hammer | thunder | arrow | meteor | mine
        let wgeObj = kfObj.wgeObj;
        // sample: {"skill_id":5,"affix":"猛踹","desc":"攻击，伤害=dmg * level * dmgRate * 难度修正系数","type":"active","cdMax":1500,"duration":1000,"range":60,"dmgRate":1.2},
        // wgeType: point | line | cone | threeLines | area | arc | circle | double | explode
        return wgeObj;
    }
    /** 811	神行	速度200% */
    _skill811(){
        this.moveSpeed = this.moveSpeed * 2.0;
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_811;
    }
    /** 812	自愈	每（心跳/固定时间）自动恢复生命百分比 1% */
    _skill812(){
        this.reg = Math.ceil(this.hpMax * mob_reg_skill);
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_812;
    }
    /** 813	荆棘	反伤33% */
    _skill813(){
        this.fdb = 0.33;
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_813;
        this.tintBullet = HEX_COLOR_FDB;     // 银色
    }
    /** 814	吸血	造成伤害后治愈自身25% */
    _skill814(){
        this.fdh = 0.25;
        this.displayAffix =this.displayAffix + " "+ globalStrings.FDH;
        this.tintBullet = HEX_COLOR_BLOOD;     // dark-red
    }
    /** 815	深寒	攻击附带减速（hst）效果20%，持续6秒 */
    _skill815(){
        this.ngList.push(815);
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_815;
        this.tintBullet = HEX_COLOR_SLOW;     // lignt-green
    }
    /** 816	剧毒	攻击附带中毒效果，12秒内造成原伤害100%伤害 */
    _skill816(){
        this.ngList.push(816);
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_816;
        this.tintBullet = HEX_COLOR_POSION;     // 绿色
    }
    /** 817	暗影	盲目，无法攻击与移动，持续2秒 */
    _skill817(){
        this.ngList.push(817);
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_817;
        this.tintBullet = HEX_COLOR_BLIND;     // dark-black
    }
    /** 818	击退	攻击附带击退打断效果，距离60像素 */
    _skill818(){
        this.ngList.push(818);
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_818;
        this.tintBullet = HEX_COLOR_STUN;
    }
    /** 819	寒潮	攻击附带降低移动速度效果，持续2秒 */
    _skill819(){
        this.ngList.push(819);
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_819;
        this.tintBullet = HEX_COLOR_SNARE;
    }
    /** 820	金刚	防御+50%，生命+50% */
    _skill820(){
        // this.ngList.push(gDB.getMobSkillById(820));
        this.def = Math.min(this.def * 1.5,GlobalConfig.STATE_DEF_MAX_MOB);
        this.hpMax = this.hpMax * 1.5;
        this.hp = this.hpMax;
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_820;
    }
    /** 911	镇狱	攻击+50%，防御+50%，生命+50% */
    _skill911(){
        this.atk = this.atk * 1.5;
        this.def = Math.min(this.def * 1.5,GlobalConfig.STATE_DEF_MAX_MOB);
        this.hpMax = Math.round(this.hpMax * 1.5);
        this.hp = this.hpMax;
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_911;
    }
    /** 912	霸王	霸体，打断、减速等效果无效，生命+50%  */
    _skill912(){
        this.hpMax = Math.round(this.hpMax * 1.5);
        this.spasticity = false;
        this.spastDuration = 0;
        this.displayAffix =this.displayAffix + " "+ globalStrings.ITEM_ITEMNAME_105;
    }
    /** 913	无双	天神下凡，攻击+100%，防御+100%，生命+100% */
    _skill913(){
        this.atk = this.atk * 2;    // 911 + 913 使用乘法
        this.def = Math.min(this.def * 2,GlobalConfig.STATE_DEF_MAX_MOB);
        this.hpMax = this.hpMax * 2;
        this.hp = this.hpMax;
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_913;
    }
    /** 914	魔王	打断、减速无效，攻击+150%，防御+50%,生命+100% */
    _skill914(){
        this.atk = this.atk * 2.5;
        this.def = Math.min(this.def * 1.5,GlobalConfig.STATE_DEF_MAX_MOB);
        this.hpMax =this.hpMax * 2;
        this.hp = this.hpMax;
        this.spasticity = false;
        this.spastDuration = 0;
        this.displayAffix =this.displayAffix + " "+ globalStrings.MOB_SKILL_AFFIX_914;
    }


}

// Omitted
// 测试函数 - 忽略 - 测试 两种不同方式生成不重复随机数的效率
// 结论：getRandUnique 效率更高，getIntRandUniqueQuick 效率低一些
// static performanceCheck_rand(){
//     let testTimes = 10000;
//     let min = 111;
//     let max = 118;
//     let count = 3;
//     let seq1 = [];
//     let d1 = new Date().getMilliseconds();
//     for(let i=0;i<testTimes;i++){
//         let seq = GlobalFunction.getRandUnique(min,max,count);
//         seq1.push(seq);
//     }
//     let d2 = new Date().getMilliseconds();
//     console.log("算法1 - 运算耗时:"+(d2-d1));
//
//     let seq2 = [];
//     let d3 = new Date().getMilliseconds();
//     for(let i=0;i<testTimes;i++){
//         let seq = GlobalFunction.getIntRandUniqueQuick(min,max,count);
//         seq2.push(seq);
//     }
//     let d4 = new Date().getMilliseconds();
//     console.log("算法2 - 运算耗时:"+(d4-d3));
//
//     console.log(seq1);
//     console.log(seq2);
// }

