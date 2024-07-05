const playerAniArr= {
    '1-fist': [
        {aniName:'1-fist-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'1-fist-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:6,repeat:-1,yoyo:true},
        {aniName:'1-fist-attack',aniConfig:{ prefix: "attack-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'1-fist-melee',aniConfig:{ prefix: "melee-", start: 1, end: 2, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:0},
        {aniName:'1-fist-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'1-fist-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'1-fist-jump',aniConfig:{ prefix: "jump-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:10, repeat:0}
    ],
    '1-sword': [
        {aniName:'1-sword-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'1-sword-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'1-sword-attack',aniConfig:{ prefix: "attack-", start: 1, end: 8, zeroPad: 2 , suffix: ".png" }, aniRate:24,repeat:0},
        {aniName:'1-sword-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'1-sword-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'1-sword-jump',aniConfig:{ prefix: "jump-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:10, repeat:0},
        {aniName:'1-sword-melee',aniConfig:{ prefix: "melee-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:15, repeat:0}
    ],
    '1-machete': [
        {aniName:'1-machete-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'1-machete-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'1-machete-attack',aniConfig:{ prefix: "attack-", start: 1, end: 9, zeroPad: 2 , suffix: ".png" }, aniRate:27,repeat:0},
        {aniName:'1-machete-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'1-machete-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'1-machete-jump',aniConfig:{ prefix: "jump-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:7, repeat:0},
        {aniName:'1-machete-melee',aniConfig:{ prefix: "melee-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:15, repeat:0}
    ],
    '1-spear': [
        {aniName:'1-spear-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'1-spear-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'1-spear-attack',aniConfig:{ prefix: "attack-", start: 1, end: 10, zeroPad: 2 , suffix: ".png" }, aniRate:30,repeat:0},
        {aniName:'1-spear-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'1-spear-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'1-spear-jump',aniConfig:{ prefix: "jump-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:7, repeat:0},
        {aniName:'1-spear-melee',aniConfig:{ prefix: "melee-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:15, repeat:0}
    ],
    '1-ejection': [
        {aniName:'1-ejection-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'1-ejection-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'1-ejection-attack',aniConfig:{ prefix: "attack-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'1-ejection-melee',aniConfig:{ prefix: "melee-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'1-ejection-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'1-ejection-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'1-ejection-jump',aniConfig:{ prefix: "jump-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:10, repeat:0}
    ],

    '2-fist': [
        {aniName:'2-fist-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'2-fist-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'2-fist-attack',aniConfig:{ prefix: "attack-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'2-fist-melee',aniConfig:{ prefix: "melee-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:15,repeat:0},
        {aniName:'2-fist-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'2-fist-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'2-fist-jump',aniConfig:{ prefix: "jump-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:9, repeat:0}
    ],
    '2-sword': [
        {aniName:'2-sword-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'2-sword-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'2-sword-attack',aniConfig:{ prefix: "attack-", start: 1, end: 12, zeroPad: 2 , suffix: ".png" }, aniRate:36,repeat:0},
        {aniName:'2-sword-melee',aniConfig:{ prefix: "melee-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:12,repeat:0},
        {aniName:'2-sword-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'2-sword-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'2-sword-jump',aniConfig:{ prefix: "jump-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:9, repeat:0}
    ],
    '2-machete': [
        {aniName:'2-machete-attack',aniConfig:{ prefix: "attack-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:21,repeat:0},
        {aniName:'2-machete-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'2-machete-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'2-machete-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'2-machete-jump',aniConfig:{ prefix: "jump-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:9, repeat:0},
        {aniName:'2-machete-melee',aniConfig:{ prefix: "melee-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:12,repeat:0},
        {aniName:'2-machete-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12}
    ],
    '2-spear': [
        {aniName:'2-spear-attack',aniConfig:{ prefix: "attack-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'2-spear-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'2-spear-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'2-spear-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'2-spear-jump',aniConfig:{ prefix: "jump-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:9, repeat:0},
        {aniName:'2-spear-melee',aniConfig:{ prefix: "melee-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:12,repeat:0},
        {aniName:'2-spear-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12}
    ],
    '2-ejection': [
        {aniName:'2-ejection-attack',aniConfig:{ prefix: "attack-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'2-ejection-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'2-ejection-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'2-ejection-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'2-ejection-jump',aniConfig:{ prefix: "jump-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:9, repeat:0},
        {aniName:'2-ejection-melee',aniConfig:{ prefix: "melee-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:12,repeat:0},
        {aniName:'2-ejection-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12}
    ],

    '3-fist': [
        {aniName:'3-fist-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'3-fist-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'3-fist-attack',aniConfig:{ prefix: "attack-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'3-fist-melee',aniConfig:{ prefix: "melee-", start: 1, end: 2, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:0},
        {aniName:'3-fist-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'3-fist-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'3-fist-jump',aniConfig:{ prefix: "jump-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:10, repeat:0}
    ],
    '3-sword': [
        {aniName:'3-sword-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'3-sword-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'3-sword-attack',aniConfig:{ prefix: "attack-", start: 1, end: 8, zeroPad: 2 , suffix: ".png" }, aniRate:24,repeat:0},
        {aniName:'3-sword-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'3-sword-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'3-sword-jump',aniConfig:{ prefix: "jump-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:10, repeat:0},
        {aniName:'3-sword-melee',aniConfig:{ prefix: "melee-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:15, repeat:0}
    ],
    '3-machete': [
        {aniName:'3-machete-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'3-machete-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'3-machete-attack',aniConfig:{ prefix: "attack-", start: 1, end: 9, zeroPad: 2 , suffix: ".png" }, aniRate:27,repeat:0},
        {aniName:'3-machete-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'3-machete-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'3-machete-jump',aniConfig:{ prefix: "jump-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:7, repeat:0},
        {aniName:'3-machete-melee',aniConfig:{ prefix: "melee-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:15, repeat:0}
    ],
    '3-spear': [
        {aniName:'3-spear-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'3-spear-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'3-spear-attack',aniConfig:{ prefix: "attack-", start: 1, end: 10, zeroPad: 2 , suffix: ".png" }, aniRate:30,repeat:0},
        {aniName:'3-spear-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'3-spear-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'3-spear-jump',aniConfig:{ prefix: "jump-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:7, repeat:0},
        {aniName:'3-spear-melee',aniConfig:{ prefix: "melee-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:15, repeat:0}
    ],
    '3-ejection': [
        {aniName:'3-ejection-walk',aniConfig:{ prefix: "run-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'3-ejection-stand',aniConfig:{ prefix: "idle-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4,repeat:-1,yoyo:true},
        {aniName:'3-ejection-attack',aniConfig:{ prefix: "attack-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'3-ejection-melee',aniConfig:{ prefix: "melee-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:18,repeat:0},
        {aniName:'3-ejection-dead',aniConfig:{ prefix: "dead-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:5,repeat:0},
        {aniName:'3-ejection-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:20, repeat:0},
        {aniName:'3-ejection-jump',aniConfig:{ prefix: "jump-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:10, repeat:0}
    ],
};

const mobAniArr = {
    'bat':[
        {aniName:'bat-walk',aniConfig:{ prefix: "run_", start: 1, end: 10, zeroPad: 1 , suffix: ".png" }, aniRate:15},
        {aniName:'bat-stand',aniConfig:{ prefix: "stand-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'bat-attack',aniConfig:{ prefix: "attack_", start: 1, end: 8, zeroPad: 1 , suffix: ".png" }, aniRate:24,repeat:0},
        {aniName:'bat-dead',aniConfig:{ prefix: "dead_", start: 1, end: 7, zeroPad: 1 , suffix: ".png" }, aniRate:10,repeat:0},
        {aniName:'bat-hurt',aniConfig:{ prefix: "hurt_", start: 1, end: 2, zeroPad: 1 , suffix: ".png" }, aniRate:3, repeat:0}
    ],
    'rabbit':[
        {aniName:'rabbit-walk',aniConfig:{ prefix: "run_", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:9},
        {aniName:'rabbit-stand',aniConfig:{ prefix: "stand-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:10,yoyo:true},
        {aniName:'rabbit-attack',aniConfig:{ prefix: "attack_", start: 1, end: 8, zeroPad: 1 , suffix: ".png" }, aniRate:24,repeat:0},
        {aniName:'rabbit-dead',aniConfig:{ prefix: "dead_", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:9,repeat:0},
        {aniName:'rabbit-hurt',aniConfig:{ prefix: "hurt_", start: 1, end: 2, zeroPad: 1 , suffix: ".png" }, aniRate:9, repeat:0}
    ],
    'tiger':[
        {aniName:'tiger-walk',aniConfig:{ prefix: "run_", start: 1, end: 9, zeroPad: 1 , suffix: ".png" }, aniRate:15},
        {aniName:'tiger-stand',aniConfig:{ prefix: "stand-", start: 1, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:10},
        {aniName:'tiger-attack',aniConfig:{ prefix: "attack_", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:24},
        {aniName:'tiger-dead',aniConfig:{ prefix: "dead_", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:9},
        {aniName:'tiger-hurt',aniConfig:{ prefix: "hurt_", start: 1, end: 2, zeroPad: 1 , suffix: ".png" }, aniRate:3, repeat:0}
    ],
    'bear':[
        {aniName:'bear-walk',aniConfig:{ prefix: "run_", start: 1, end: 5, zeroPad: 1 , suffix: ".png" }, aniRate:8},
        {aniName:'bear-stand',aniConfig:{ prefix: "stand-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:9},
        {aniName:'bear-attack',aniConfig:{ prefix: "attack_", start: 1, end: 8, zeroPad: 1 , suffix: ".png" }, aniRate:24},
        {aniName:'bear-dead',aniConfig:{ prefix: "dead_", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:9},
        {aniName:'bear-hurt',aniConfig:{ prefix: "hurt_", start: 1, end: 2, zeroPad: 1 , suffix: ".png" }, aniRate:3, repeat:-1}
    ],
    'deer':[
        {aniName:'deer-walk',aniConfig:{ prefix: "run_", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:9},
        {aniName:'deer-stand',aniConfig:{ prefix: "stand-", start: 1, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:9},
        {aniName:'deer-attack',aniConfig:{ prefix: "attack_", start: 1, end: 8, zeroPad: 1 , suffix: ".png" }, aniRate:24},
        {aniName:'deer-dead',aniConfig:{ prefix: "dead_", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:9},
        {aniName:'deer-hurt',aniConfig:{ prefix: "hurt_", start: 1, end: 2, zeroPad: 1 , suffix: ".png" }, aniRate:3, repeat:-1}
    ],
    'bow-1' : [
        {aniName:'bow-1-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'bow-1-stand',aniConfig:{ prefix: "stand-", start: 0, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:7},
        {aniName:'bow-1-attack',aniConfig:{ prefix: "attack-", start: 0, end: 15, zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'bow-1-dead',aniConfig:{ prefix: "dead-", start: 0, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:7},
        {aniName:'bow-1-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2},
        {aniName:'bow-1-melee',aniConfig:{ prefix: "melee-", start: 0, end: 12, zeroPad: 2 , suffix: ".png" }, aniRate:13}
    ],
    'bow-2':[
        {aniName:'bow-2-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'bow-2-stand',aniConfig:{ prefix: "stand-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'bow-2-attack',aniConfig:{ prefix: "attack-", start: 0, end: 12, zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'bow-2-dead',aniConfig:{ prefix: "dead-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:6},
        {aniName:'bow-2-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2},
        {aniName:'bow-2-melee',aniConfig:{ prefix: "melee-", start: 0, end: 13, zeroPad: 2 , suffix: ".png" }, aniRate:14}
    ],
    'bow-3':[
        {aniName:'bow-3-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'bow-3-stand',aniConfig:{ prefix: "stand-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'bow-3-attack',aniConfig:{ prefix: "attack-", start: 0, end: 12, zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'bow-3-dead',aniConfig:{ prefix: "dead-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:6},
        {aniName:'bow-3-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2},
        {aniName:'bow-3-melee',aniConfig:{ prefix: "melee-", start: 0, end: 13, zeroPad: 2 , suffix: ".png" }, aniRate:14}
    ],
    'cavalry-1':[
        {aniName:'cavalry-1-walk',aniConfig:{ prefix: "walk-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'cavalry-1-stand',aniConfig:{ prefix: "stand-", start: 0, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:5},
        {aniName:'cavalry-1-attack',aniConfig:{ prefix: "attack-", start: 0, end: 8, zeroPad: 2 , suffix: ".png" }, aniRate:30},
        {aniName:'cavalry-1-dead',aniConfig:{ prefix: "dead-", start: 0, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:7},
        {aniName:'cavalry-1-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'cavalry-2':[
        {aniName:'cavalry-2-walk',aniConfig:{ prefix: "walk-", start: 0, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:10},
        {aniName:'cavalry-2-stand',aniConfig:{ prefix: "stand-", start: 0, end: 10, zeroPad: 2 , suffix: ".png" }, aniRate:11},
        {aniName:'cavalry-2-attack',aniConfig:{ prefix: "attack-", start: 0, end: 8, zeroPad: 2 , suffix: ".png" }, aniRate:30},
        {aniName:'cavalry-2-dead',aniConfig:{ prefix: "dead-", start: 0, end: 8, zeroPad: 2 , suffix: ".png" }, aniRate:9},
        {aniName:'cavalry-2-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'cavalry-3':[
        {aniName:'cavalry-3-walk',aniConfig:{ prefix: "walk-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:12},
        {aniName:'cavalry-3-stand',aniConfig:{ prefix: "stand-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:6},
        {aniName:'cavalry-3-attack',aniConfig:{ prefix: "attack-", start: 0, end: 13, zeroPad: 2 , suffix: ".png" }, aniRate:30},
        {aniName:'cavalry-3-dead',aniConfig:{ prefix: "dead-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'cavalry-3-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'katana-1':[
        {aniName:'katana-1-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'katana-1-stand',aniConfig:{ prefix: "stand-", start: 0, end: 9, zeroPad: 2 , suffix: ".png" }, aniRate:10},
        {aniName:'katana-1-attack',aniConfig:{ prefix: "attack-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'katana-1-dead',aniConfig:{ prefix: "dead-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:6},
        {aniName:'katana-1-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'katana-2':[
        {aniName:'katana-2-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'katana-2-stand',aniConfig:{ prefix: "stand-", start: 0, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:5},
        {aniName:'katana-2-attack',aniConfig:{ prefix: "attack-", start: 2, end:13 , zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'katana-2-dead',aniConfig:{ prefix: "dead-", start: 0, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:7},
        {aniName:'katana-2-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'katana-3':[
        {aniName:'katana-3-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'katana-3-stand',aniConfig:{ prefix: "stand-", start: 0, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:5},
        {aniName:'katana-3-attack',aniConfig:{ prefix: "attack-", start: 1, end: 9, zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'katana-3-dead',aniConfig:{ prefix: "deak-", start: 0, end: 8, zeroPad: 2 , suffix: ".png" }, aniRate:9},
        {aniName:'katana-3-hurt',aniConfig:{ prefix: "deak-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'shield-1':[
        {aniName:'shield-1-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'shield-1-stand',aniConfig:{ prefix: "stand-", start: 0, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:5},
        {aniName:'shield-1-attack',aniConfig:{ prefix: "attack-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'shield-1-dead',aniConfig:{ prefix: "dead-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:6},
        {aniName:'shield-1-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'shield-2':[
        {aniName:'shield-2-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'shield-2-stand',aniConfig:{ prefix: "stand-", start: 0, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:5},
        {aniName:'shield-2-attack',aniConfig:{ prefix: "attack-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'shield-2-dead',aniConfig:{ prefix: "dead-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'shield-2-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'shield-3':[
        {aniName:'shield-3-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'shield-3-stand',aniConfig:{ prefix: "stand-", start: 0, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:7},
        {aniName:'shield-3-attack',aniConfig:{ prefix: "attack-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:24},
        {aniName:'shield-3-dead',aniConfig:{ prefix: "dead-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'shield-3-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'spear-1':[
        {aniName:'spear-1-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'spear-1-stand',aniConfig:{ prefix: "stand-", start: 0, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:7},
        {aniName:'spear-1-attack',aniConfig:{ prefix: "attack-", start: 0, end: 10, zeroPad: 2 , suffix: ".png" }, aniRate:30},
        {aniName:'spear-1-dead',aniConfig:{ prefix: "dead-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:6},
        {aniName:'spear-1-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'spear-2':[
        {aniName:'spear-2-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'spear-2-stand',aniConfig:{ prefix: "stand-", start: 0, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:7},
        {aniName:'spear-2-attack',aniConfig:{ prefix: "attack-", start: 0, end: 9, zeroPad: 2 , suffix: ".png" }, aniRate:30},
        {aniName:'spear-2-dead',aniConfig:{ prefix: "dead-", start: 0, end: 6, zeroPad: 2 , suffix: ".png" }, aniRate:7},
        {aniName:'spear-2-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 1, zeroPad: 2 , suffix: ".png" }, aniRate:2}
    ],
    'spear-3':[
        {aniName:'spear-3-walk',aniConfig:{ prefix: "walk-", start: 0, end: 3, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'spear-3-stand',aniConfig:{ prefix: "stand-", start: 0, end: 5, zeroPad: 2 , suffix: ".png" }, aniRate:6},
        {aniName:'spear-3-attack',aniConfig:{ prefix: "attack-", start: 0, end: 10, zeroPad: 2 , suffix: ".png" }, aniRate:30},
        {aniName:'spear-3-dead',aniConfig:{ prefix: "dead-", start: 0, end: 7, zeroPad: 2 , suffix: ".png" }, aniRate:8},
        {aniName:'spear-3-hurt',aniConfig:{ prefix: "dead-", start: 0, end: 2, zeroPad: 2 , suffix: ".png" }, aniRate:3}
    ],
    'mummy':[
        {aniName:'mummy-walk',aniConfig:{ prefix: "walk-", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:12},
        {aniName:'mummy-stand',aniConfig:{ prefix: "stand-", start: 1, end: 4, zeroPad: 2 , suffix: ".png" }, aniRate:4},
        {aniName:'mummy-dead',aniConfig:{ prefix: "dead-", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:6},
        {aniName:'mummy-attack',aniConfig:{ prefix: "attack-", start: 1, end: 6, zeroPad: 1 , suffix: ".png" }, aniRate:24},
        {aniName:'mummy-hurt',aniConfig:{ prefix: "hurt-", start: 1, end: 2, zeroPad: 1 , suffix: ".png" }, aniRate:4}
    ],

};
