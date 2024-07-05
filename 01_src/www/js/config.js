let game;
// let worldScene;                   // phaser 的游戏对象
// let inst;
let instScene;
let flagInGame = false;     // 是否已经进入游戏
let canvasWidth = document.body.offsetWidth;    // 画面宽度
let canvasHeight = document.body.offsetHeight;  // 画面高度
let preferredWidth = 0;     // 约束后的宽度，用于展示城市画面 4：3 比例
let preferredHeight = 0;    // 约束后的高度，用户展示城市画面 4：3 比例
let inventorySize = 64;     // 玩家背包尺寸

let phaserCreditsConfig = {
    type: Phaser.AUTO,
    width: canvasWidth,
    height: canvasHeight,
    scene : CreditsScene,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game_div',
        width: canvasWidth,
        height: canvasHeight
    },
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: false
        }
    },
    parent: 'game_div'
};

let phaserWorldConfig = {
    type: Phaser.AUTO,
    width: canvasWidth,
    height: canvasHeight,
    scene : [ BootScene, PreloadScene, WorldScene, CreditsScene ],
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game_div',
        width: canvasWidth,
        height: canvasHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            tileBias: 40,
            debug: false
        }
    },
    fps: { forceSetTimeOut: true, target: 60 },
    parent: 'game_div'
};

let dynamicMapConfig = {
    type: Phaser.AUTO,
    width: canvasWidth,
    height: canvasHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game_div',
        width: canvasWidth,
        height: canvasHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            tileBias: 32,
            debug: false
        }
    },
    parent: 'game_div'
};

// let sceneBFConfig = {
//     type: Phaser.AUTO,
//     width: canvasWidth,
//     height: canvasHeight,
//     physics: {
//         default: 'arcade',
//         arcade: {
//             gravity: {y: 1000},
//             debug: true
//         }
//     },
//     parent: 'inst_div'
// };