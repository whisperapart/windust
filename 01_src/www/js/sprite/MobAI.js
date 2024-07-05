/**
 * 意识层AI，负责战略的决策。战术的执行，例如具体的攻击技能的选择，不再这里决定。
 */
class MobAI{
    constructor(aiConfigObject, mobControllerHost) {
        if(mobControllerHost === undefined) return;
        this.host = mobControllerHost;      // AI 归属的 mob
        // this.intSkillCount = mobControllerHost.skills.length;
        this.config = aiConfigObject;
        this.actionTick = this.config.aiInterval;    // 默认的响应时常, time+delta 超过之后，重新制定策略
        this.currentTick =this.config.aiInterval;   // 当前的tick, 相应之后=0，达到或者超过 actionTick 之后，制定新的策略
        this.currentStrategy = this.config.currentStrategy; // 默认的策略
        this.aggroFlag = false;     // isAggro, default = false
        this.playerDistanceInMind = 999999; // 指定策略时，记录的与玩家的距离
        // this.status = 'idle';
        // this.statusPre = 'idle';
    }

    update(time,delta, isAlive){
        // 检测机，判断本轮要不要响应
        // console.log("mob ai update");
        if(!isAlive) return 'dead';
        if(this.host.sprite.isHurt) return 'hurt';
        if(!this._actionCheck(delta)) return 'skip';

        // this.regSelf();

        // 决策层  - 控制状态
        this.currentStrategy = this._makeDecision();    //  flee | attack | dead | idle | patrol： 逃跑 | 战斗 | 已死亡 | 待命 | 巡逻
        return this.currentStrategy;

        // 行为层 - 根据状态 决定 执行对应的行为，可能存在取消之前动作的逻辑
        // switch (this.currentStrategy){
        //     case 'flee':    this._exeFlee(); break;
        //     case 'attack':  this._exeAttack(); break;   // 可能不攻击，如果无可用技能，或者cd
        //     case 'dead':    this.die(); break;
        //     case 'idle':    this._exeIdle(); break;
        //     case 'patrol':  this._exePatrol(delta); break;
        //     default:        this._exeIdle(); break;
        // }
    }

    _actionCheck(delta){
        // 决定本轮是否需要AI介入： 判断条件：iq - 智商100 的 1秒决定1次策略  智商200 的 0.5秒调整一次策略
        this.currentTick = this.currentTick + delta;
        if(this.currentTick < this.actionTick){     // 处于上轮策略执行中状态，不更新AI策略
            return false;
        }
        this.currentTick = 0;
        return true;
    }
    _makeDecision(){
        // 优先级策略
        // this.statusPre = this.status;
        // 死亡状态 dead
        // if(!this.host.isAlive()) return 'dead';
        // aggro check
        this._aggroCheck();

        // 逃跑状态 flee
        // 血量低逃跑，然后跑出了 2倍 aggro 距离: 应该继续逃跑到20%血量以上，还是停止逃跑？ 应该是后者
        if(this.aggroFlag && this.host.isMoraleCollapse()) return 'flee';

        if(this.aggroFlag) return 'attack'; // 只要是 aggro状态，不管距离，追杀

        // 巡逻状态 patrol - 没有进入战斗
        if(this._targetDistance() > this.config.tarTolerance){
            return 'patrol';
        }

        // idle状态
        return 'idle';

        // 场景模拟 - check
        // 怪物逃跑，超出2Ar，变为 patrol 往回走，又遇到玩家1Ar，HP小于20%，继续逃跑，HP大于20%，战斗。
    }

    /**
     * 判断是否aggro ，距离aggro内=aggro，1-2倍aggro内=保持aggro或者非aggro,2倍aggro外=取消aggro
     * @private
     */
    _aggroCheck(){
        // 计算距离
        // 如果在 aggro 距离内 - aggro
        // 如果 在 aggro - 2倍 aggro 内 - aggroFlag： 原先 aggro 保持 aggro, 原先非aggro 保持 非aggro
        // 如果 超出 2倍 aggro - 取消 aggro  -- 改掉，永远追杀
        // 问题 : 如果玩家在2倍aggro外攻击，怪物被动 aggro。这时候怎么办？ - 理论上，应该朝玩家跑进入attack状态，或者 flee
        this.playerDistanceInMind = this._playerDistance();
        if(this.aggroFlag) return;  // 已经aggro
        if(!this.config.aggressive) return; // 不主动攻击怪物
        // console.log("distance check = "+this.playerDistanceInMind);
        if(this.playerDistanceInMind <= this.config.aggroRange){
            this.aggroFlag = true;
        }
    }

    _playerDistance(){
        return getDistance(this.host.scene.player.sprite.x,this.host.scene.player.sprite.y,this.host.sprite.x,this.host.sprite.y);
    }
    _targetDistance(){
        return getDistance(this.config.tarX,this.config.tarY,this.host.sprite.x,this.host.sprite.y);
    }


    _exeAttack(){
        // 根据距离，决定可选策略
        // 根据cooldown状态，列出所有可选进攻方式
        // 可选进攻的选择策略：
            // 距离低于近战范围，使用近战|  this.playerDistanceInMind
            // 距离低于远程范围，使用远程|
            // 距离超出远程范围=无可用进攻方式
                // 是否在射程内->休息本轮，恢复 hpReg
                // 否则移动到射程内（靠近）
    }

    /**
     * 撤销所有动作，并停留在原地，idle, 非aggro
     * @private
     */
    _exeIdle(){
        this.host.hp = this.host.hpMax;
        this.resetCoolDown();
    }

    /**
     * 受到攻击后，被动进入aggro状态。
     */
    notifyAttack(){
        this.aggroFlag = true;
        this.currentStrategy = this._makeDecision();
    }

    die(){
        // this.host.isAlive = false;
        this.host.die();    // 调用 宿主 的 die 方法，处理掉落等逻辑。
    }

    _exePatrol(delta){
        // 巡逻指令，朝tarX tarY移动，状态改为 非aggro
        // todo: 寻路
    }

    regSelf(){
        if(this.host.isAlive && (this.host.reg > 0)) this.healSelf(this.host.reg);
    }

    healSelf(intHp){
        let newHP = this.host.hp + intHp;
        if(intHp >0){   // heal
            this.host.hp = newHP > this.host.hpMax ? this.host.hpMax : newHP;
        }else if(intHp < 0){    // damage
            this.host.hp = newHP <= 0 ? 0 : newHP;
            if(this.host.hp <= 0){
                this.die();
            }
        }
    }

    skillTactic(){
        // 如果处于 aggro 状态
        // 如果处于 retreat 状态
        // 如果处于 sleep 状态
        // 如果处于 patrol 状态

        switch(this.status){
            case 'sleep':   // 待命状态
                break;
            case 'aggro':   // 进入战斗
                break;
            case 'retreat': // 撤退状态 - 远程拉开距离再攻击
                break;
            case 'flee':    // 逃跑状态 - hp 低于 20%
                break;
            case 'patrol':  // 巡逻状态 - 从 pos 移动到 tar
                break;
            case 'dead':    // 死亡状态
                break;
            default:
                break;
        }

        // aggro
        // 如果距离过远，走进
        // 如果在射程内
        // 如果只有一个技能，使用
        // 如果有两个技能，优先使用距离远的，然后使用距离近的
        // 如果有距离远的可用，但是目前距离近，拉开距离用距离远的
        // 如果自己的移动速度低于玩家，且被追杀无法拉开距离（考虑拉开距离状态，但连续被攻击2次？），改为近距离模式
        // 如果有超过2个技能的，多出来的技能在射程范围内，随机释放

        // 射击类攻击方式，可以不在一条水平线
        // 其他攻击方式，必须在水平方向
    }

    skillTacticSleep(){

    }
    skillTacticAggro(){

    }
    skillTacticRetreat(){

    }

    returnHome(){   // aggro 之后，离开最大距离，mob 返回

    }

    destroy(){

    }
}