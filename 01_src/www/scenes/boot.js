/**
 * 启动并加载load 资源，解决直接进入 worldScene 的卡顿问题 -- 加入 loadScene
 */
class BootScene extends Phaser.Scene{
    constructor () {
        super({ key: 'boot' });
    }

    preload () {
        // load all files necessary for the loading screen
        this.load.json('assets', 'assets/json/assets.json');
        this.load.image('logo', 'assets/images/main/logo.png');
    }

    create () {
        this.scene.start('preload');
    }
}

class PreloadScene extends Phaser.Scene{
    constructor () {
        super({key: 'preload'});
    }

    preload () {
        this.loadAssets(this.cache.json.get('assets'));
        let cX = this.centerX();
        let content_width = cX*1.2;
        let img_width = content_width > 800 ? 800 : content_width;
        let img_height = 0.75 * img_width;
        let img = this.add.image(this.centerX(), this.centerY(), 'logo');
        img.setDisplaySize(img_width,img_height);
        this.createProgressbar(this.centerX(), document.body.offsetHeight-120);
        let idx = Math.floor(Math.random() * dbTips.length);
        let txt = this.add.text(this.centerX(),document.body.offsetHeight-60,dbTips[idx],
            {fontSize: "16px", fontFamily:'"Hiragino Sans GB","PingFang SC","Microsoft YaHei", "WenQuanYi Micro Hei"',
                color: "#F0F0F0",
                align: "center",
                boundsAlignH: "center",
                boundsAlignV: "middle"
            }
            ).setOrigin(0.5, 0.5);
        txt.setWordWrapWidth(content_width,true);
    }



    createProgressbar (x, y) {
        // size & position
        let width = 400;
        let height = 20;
        let xStart = x - width / 2;
        let yStart = y - height / 2;

        // border size
        let borderOffset = 1;
        let borderRect = new Phaser.Geom.Rectangle(xStart - borderOffset, yStart - borderOffset, width + borderOffset * 2, height + borderOffset * 2);
        let border = this.add.graphics({lineStyle: {width: 0, color: 0xEEEEEE}});
        border.strokeRectShape(borderRect);
        let progressbar = this.add.graphics();

        /**
         * Updates the progress bar.
         *
         * @param {number} percentage
         */
        let updateProgressbar = function (percentage) {
            progressbar.clear();
            progressbar.fillStyle(0xEB6864, 1);
            progressbar.fillRect(xStart, yStart, percentage * width, height);
        };

        this.load.on('progress', updateProgressbar);

        this.load.once('complete', function () {
            this.load.off('progress', updateProgressbar);
            this.scene.start('WorldScene');
            // this.scene.start('credits');
        }, this);
    }

    _loadAudio(json){
        json.audio.forEach(function(value,index){
            this.load.audio(value[0],value[1]);
        },this);
        json.audioSprite.forEach(function(value,index){
            this.load.audioSprite(value[0],value[1],value[2]);
        },this);
    }
    _loadAtlas(json){
        json.atlas.forEach(function (v,index){
            this.load.atlas(v[0],v[1],v[2]);    // atlas name, player image , json file
        },this);
    }
    _loadImage(json){
        json.image.forEach(function(value,index){
            this.load.image(value[0],value[1]);
        },this);

    }
    _loadTile(json){
        // this.load.tilemapTiledJSON(json.tile._tileMapKey, json.tile._tileMapInJson);
        // //  "tile": {
        // //    "_tileMapKey": "worldmap",
        // //    "_tileMapInJson": "assets/maps/world/map_o_1000_20220211.json"
        // //  },
    }

    loadAssets(json){
        this._loadImage(json);  // load image first, as tile use image
        this._loadTile(json);
        this._loadAtlas(json);
        // this._loadAudio(json);
    }

    _loadAssets (json) {
        Object.keys(json).forEach(function (group) {
            Object.keys(json[group]).forEach(function (key) {
                let value = json[group][key];

                if (group === 'atlas' ||
                    group === 'unityAtlas' ||
                    group === 'bitmapFont' ||
                    group === 'spritesheet' ||
                    group === 'multiatlas')
                {

                    // atlas:ƒ       (key, textureURL,  atlasURL,  textureXhrSettings, atlasXhrSettings)
                    // unityAtlas:ƒ  (key, textureURL,  atlasURL,  textureXhrSettings, atlasXhrSettings)
                    // bitmapFont ƒ  (key, textureURL,  xmlURL,    textureXhrSettings, xmlXhrSettings)
                    // spritesheet:ƒ (key, url,         config,    xhrSettings)
                    // multiatlas:ƒ  (key, textureURLs, atlasURLs, textureXhrSettings, atlasXhrSettings)
                    this.load[group](key, value[0], value[1]);

                }
                else if (group === 'audio') {

                    // do not add mp3 unless, you bought a license ;)
                    // opus, webm and ogg are way better than mp3
                    // if (value.hasOwnProperty('opus') && this.sys.game.device.audio.opus) {
                    //     this.load[group](key, value['opus']);
                    //
                    // }
                    // else if (value.hasOwnProperty('webm') && this.sys.game.device.audio.webm) {
                    //     this.load[group](key, value['webm']);
                    //
                    // }
                    // else if (value.hasOwnProperty('ogg') && this.sys.game.device.audio.ogg) {
                    //     this.load[group](key, value['ogg']);
                    //
                    // }
                    // else if (value.hasOwnProperty('wav') && this.sys.game.device.audio.wav) {
                    //     this.load[group](key, value['wav']);
                    // }
                    console.log("key="+key);
                    console.log("value="+value[0]+value[1]);
                    this.load.audio(value[0],value[1]);

                }
                else if (group === 'html') {
                    // html:ƒ (key, url, width, height, xhrSettings)
                    this.load[group](key, value[0], value[1], value[2]);

                }else if(group === "tile"){
                    this.load.tilemapTiledJSON('worldmap', this._tileMapInJson);
                }
                else {
                    // animation:ƒ (key, url, xhrSettings)
                    // binary:ƒ (key, url, xhrSettings)
                    // glsl:ƒ (key, url, xhrSettings)
                    // image:ƒ (key, url, xhrSettings)
                    // image:ƒ (key, [url, normal-url], xhrSettings)
                    // json:ƒ (key, url, xhrSettings)
                    // plugin:ƒ (key, url, xhrSettings)
                    // script:ƒ (key, url, xhrSettings)
                    // svg:ƒ (key, url, xhrSettings)
                    // text:ƒ (key, url, xhrSettings)
                    // tilemapCSV:ƒ (key, url, xhrSettings)
                    // tilemapTiledJSON:ƒ (key, url, xhrSettings)
                    // tilemapWeltmeister:ƒ (key, url, xhrSettings)
                    // xml:ƒ (key, url, xhrSettings)
                    this.load[group](key, value);
                }
            }, this);
        }, this);
    }

    centerX ()
    {
        // return this.sys.game.config.width / 2;
        return document.body.offsetWidth / 2;
    }
    centerY ()
    {
        // return this.sys.game.config.height / 2;
        return document.body.offsetHeight / 2;
    }
}


// let assets.json = {
//     "image": {
//         "image-key": "assets/main-key.jpg"
//     },
//     "svg": {
//         "svg-key": "assets/svg-key.svg"
//     },
//     "audio": {
//         "audio-key" : {
//             "ogg" : "assets/audio-key.ogg",
//             "opus" : "assets/audio-key.opus",
//             "webm" : "assets/audio-key.webm"
//         }
//     },
//     "atlas": {
//         "atlas-key": ["assets/atlas-key.images.png", "assets/atlas-key.info.json"]
//     },
//
//     "spritesheet": {
//         "sheet-key" : ["assets/sheet-key.png", { "frameWidth": 32, "frameHeight": 48 }]
//     },
//     "xml": {
//         "xml-key": "/assets/xml-key.xml"
//     }
// }