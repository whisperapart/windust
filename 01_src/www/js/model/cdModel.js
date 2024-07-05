/**
 * CDModel: 处理cd 的基本逻辑
 * Author:  JimDai
 * Date:    2022.04.30
 */

// todo: CharacterModel 里面的 cd 计算也要改用这个类

class CDModel{
    constructor(intMax) {
        this._max = intMax;
        this._cur = intMax;
        this._ready = true;
        this._active = true;
    }

    update(delta){
        if(!this._active) return;
        this._cur = this._cur + delta;
        if(this._cur >= this._max) this._ready = true;
    }

    reset(){
        this._cur = 0;
        this._ready = false;
    }

    isReady(){
        return this._ready;
    }

    stop(){
        this._active = false;
    }

    getCD(){
        return this._max;
    }

    ready(){
        this._ready = true;
        this._cur = this._max;
    }
}