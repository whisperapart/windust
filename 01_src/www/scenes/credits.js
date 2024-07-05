/**
 * Credits 场景，鸣谢 -- 加入 loadScene
 */

class CreditsScene extends Phaser.Scene{

    _bgMusicKey = "music_credits";
    _bgMusicInMillSeconds = (2*60+44) * 1000;   // 164000 音乐长度
    _w = phaserCreditsConfig.width;
    _h = phaserCreditsConfig.height;
    // _speed_normal = 0.3; // 0.3
    // _speed_hurry = 3.0;
    _y_thanks_for_play = 1780;      // 到感谢游玩长度 1760, 20230608 长度 14500
    _ts_first_screen = 2000;        // 首先的静止画面持续时间
    _ts_thanks_for_play = 60000;    // 前面 ms 用来播放第一段


    msDisplay = 0;


    constructor(){
        super({key: 'CreditsScene'});
    }

    preload(){
        // this.loadAssets(this.cache.json.get('assets'));
        // this.add.image(this.centerX(), this.centerY(), 'logo');
        // this.createProgressbar(this.centerX(), this.centerY() + 200);
        // this.load.css('creditCss', 'assets/css/credits.css');
        this.load.audio(this._bgMusicKey,'assets/audio/bg/theme_credits.mp3');
        this.load.html('creditHTML', 'assets/html/credits.html');
        this.load.image('image_credits','assets/images/main/credits.png');
    }

    create(){
        // show background image
        // play background music
        // add Credits text
        // add Back Button
        // Scroll background image - camera moves ? background-image moves?
        // Scroll Credits screen by screen.


        this._createMusic();
        this._createBackgroundImage();

        // this.version = this.add.dom(this._w * 0.5, this._h * 0.3, 'div', "left:10px;top:10px;font-size:12px;color: #A7A7A7; width:500px;height:50px;", this._releaseVersion);
        // version.setClassName('version');
       this.creditHtml = this.add.dom(0,0).createFromCache("creditHTML");
       this.creditHtml.setOrigin(0,0);
       this.creditHtml.x = 0;
       this.creditHtml.y = 0;

       let thanksDiv1 = this.creditHtml.getChildByID("thanksDiv1");
       let thanksY = thanksDiv1.getBoundingClientRect().top;
       this._y_thanks_for_play = isNaN(thanksY) ? this._y_thanks_for_play : thanksY;
       console.log(thanksY);

       this._speed_normal =  this._y_thanks_for_play / (this._ts_thanks_for_play - this._ts_first_screen);
       this._speed_hurry =  (this.creditHtml.height - this._y_thanks_for_play) / (this._bgMusicInMillSeconds - this._ts_thanks_for_play);

       // console.log(this.creditHtml.height + " , "+this._speed_normal + "," + this._speed_hurry);

        // ~~放弃 ～～ 添加点击事件，长按暂停滚动。双击改变滚动方向。

        this._playBackgroundMusic();
        this.msDisplay = 0;

        const timeline = this.add.timeline([
            {
                at: this._ts_first_screen,
                tween: {
                    targets: this.creditHtml,
                    y: -this._y_thanks_for_play,
                    ease: 'linear',
                    duration: this._ts_thanks_for_play
                }
            },
            {
                at: this._ts_first_screen + this._ts_thanks_for_play,
                tween: {
                    targets: this.creditHtml,
                    y: this._h - this.creditHtml.height,
                    ease: 'linear',
                    duration: this._bgMusicInMillSeconds - this._ts_thanks_for_play,
                    yoyo: false,
                    repeat: 0
                }
            }
        ]);

        timeline.play();
    }

    update(time,delta){
        // this.creditHtml.y = this.creditHtml.y - (this.msDisplay >= this._ts_thanks_for_play ? this._speed_hurry : this._speed);
        // this.creditImage.x +=0.2;
        // this.msDisplay += delta;
        // if((this.msDisplay >= this._ts_first_screen)  && (this.creditHtml.y+this._h*0.5 >= -this.creditHtml.height)){
        //     // this.creditHtml.y = this.creditHtml.y - delta * (this.creditHtml.y >= -this._y_thanks_for_play ? this._speed_normal : this._speed_hurry );
        //     // 方法2： 使用补间动画，是否可以更加平滑一些。
        // }

        // console.log(this.msDisplay + " , y="+this.creditHtml.y);
        // 20230610 改为需要用户手动点击退回。
        // if(this.msDisplay >= this._bgMusicInMillSeconds){
        //     // gGui._onCreditsBack();
        // }
    }

    _createBackgroundImage(){
        // this.creditImage = this.add.image(0,0,'image_credits');
        this.creditImage = this.physics.add.sprite(0,0,'image_credits');
        this.creditImage.setOrigin(0.5,0.5);
        let ratio_w = this._w / this.creditImage.width;
        let ratio_h = this._h / this.creditImage.height;
        let ratio = Math.ceil(Math.max(ratio_w,ratio_h))+1;
        this.creditImage.setScale(ratio);
        this.creditImage.setPosition(this._w * 0.5, this._h * 0.5);
        this.creditImage.setAlpha(0.32);
        this.creditImage.body.setSize(this.creditImage.width,this.creditImage.height);
        this.creditImage.body.setBounce(1,1);
        this.creditImage.body.setCollideWorldBounds(true);

        let x = this._w - this.creditImage.displayWidth;
        let y = this._h - this.creditImage.displayHeight;
        let w = 2*this.creditImage.displayWidth - this._w * 1.1;
        let h = 2*this.creditImage.displayHeight - this._h * 1.1;

        this.physics.world.setBounds(x,y,w,h);

        let vX = ratio * 10;
        // let vX = 500;
        let vR = (this._h * 0.5 - this.creditImage.displayHeight) / (this._w * 0.5 - this.creditImage.displayWidth);
        let vRran = GlobalFunction.getRandFloat(0.1,Math.abs(vR));
        let mX = Math.random() >= 0.5 ? 1 : -1;
        let mY = Math.random() >= 0.5 ? 1 : -1;
        this.creditImage.body.setVelocity(vX * mX,vX * vRran * mY);

        // this.useTimeLine();
        // this.aniRows = Math.ceil(this.creditImage.displayHeight / this._h);
    }

    _createCredits(){
        this.creditsText = this.add.text(this._w*0.5, this._h*0.5, this._creditsContent, { fontSize: '16px', fill: '#fff' });
        // this.creditsText.setOrigin(0.5);
        // this.creditsText.rotation = 3.14 * 0.5;
        // this.madeByText = this.add.text(0, 0, 'Created By: Jim Dai', { fontSize: '26px', fill: '#fff' });
        // rtl:true
        // this.madeByText = this.add.text(0,0,'DESIGN', { fontSize: '26px', fill: '#fff' });
        // this.madeByText.setOrigin(0,0.5);
        // this.madeByText.rotation = -3.14*0.45;
        // this.madeByText.setY(this._h * 0.4);
        //
        // this.madeByText1 = this.add.text(0,0,'PROGRAM', { fontSize: '26px', fill: '#fff' });
        // this.madeByText1.setOrigin(0,0.5);
        // this.madeByText1.rotation = -3.14*0.45;
        // this.madeByText1.setY(this._h * 0.4);
        // const gameNameC = this.add.dom(this._w * 0.5, this._h * 0.6, 'div', null, this._gameNameC);
        // gameNameC.setClassName('title-center');

        // this.zone = this.add.zone(this._w * 0.5, this._h * 0.5, this._w, this._h);
        // Phaser.Display.Align.In.Center(
        //     this.creditsText,
        //     this.zone
        // );
        // Phaser.Display.Align.In.Center(
        //     this.madeByText,
        //     this.zone
        // );
        // this.creditsText.setY(this._h * 0.2);
        // this.madeByText.setX(this._w * 0.5);
        // this.madeByText1.setX(this._w * 0.6);

        // this.creditsTween = this.tweens.add({
        //     targets: this.creditsText,
        //     y: -100,
        //     ease: 'Power1',
        //     duration: 20000,
        //     delay: 500,
        //     onComplete: function () {
        //         this.destroy;
        //     }
        // });
        // this.madeByTween = this.tweens.add({
        //     targets: [this.madeByText,this.madeByText1],
        //     x: -100,
        //     ease: 'Power1',
        //     duration: 8000,
        //     delay: 500,
        //     onComplete: function () {
        //         this.madeByTween.destroy;
        //         this.scene.start('WorldScene');
        //     }.bind(this)
        // });
    }

    _formatText(str){

    }

    _createMusic(){
        this.sound.add(this._bgMusicKey,{loop:true});
    }

    // _createBackButton(){
    //     // todo: 添加返回按钮
    //     this.backButton = this.add.text(100, 100, ' < Back To Main', { fill: '#f7ffff', fontSize:'14px' });
    //     this.backButton.setOrigin(0.5)
    //         .setPadding(6)
    //         .setStyle({ backgroundColor: '#eb6864' })
    //         .on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
    //         .on('pointerout', () => button.setStyle({ fill: '#eb6864' }));
    //     this.backButton.setInteractive();
    //     this.backButton.on('pointerup', () => {
    //         this.destroy;
    //         this.scene.start('WorldScene');
    //     });
    // }

    _createTween(){

    }

    _playBackgroundMusic(){
        this.sound.stopAll();
        this.sound.setVolume(gApp.gameSettingObj.backgroundMusic/200.0);
        this.sound.play(this._bgMusicKey);
    }

    useTimeLine(){
        const timeline = this.add.timeline([
            {
                at: 100,
                tween: {
                    targets: this.creditImage,
                    x: this._w-this.creditImage.displayWidth,
                    ease: 'sine.out',
                    duration: 1000000
                }
            },
            {
                at: 20200,
                tween: {
                    targets: this.creditImage,
                    y: this._h-this.creditImage.displayHeight,
                    ease: 'sine.out',
                    duration: 1000000,
                }
            },
            {
                at: 40300,
                tween: {
                    targets: this.creditImage,
                    x: 0,
                    ease: 'sine.out',
                    duration: 1000000,
                }
            },
            {
                at: 60400,
                tween: {
                    targets: this.creditImage,
                    y: 0,
                    ease: 'sine.out',
                    duration: 1000000,
                }
            }
        ]);

        timeline.play();
    }
}
