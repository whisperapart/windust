/**
 * Peerless build tool, for windows
 * @Author: Jim Dai
 * @Date: 2023.07.20
 * @platform: windows
 * @description: this file output min js/css/json files.
 */

/**
 * usage:
 * npm install terser --save
 * npm install clean-css-cli --save
 * npm install html-minifier-terser -g
 * node min.js
 */

const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const process = require('node:process');

const FOLDER_MIN_PATH = '..\\07_min\\';   // min file folder
const PLAT_SPEC_PATH = '..\\02_plat_spec\\';  // platform 文件 electorn = windows / osx iphone
const CORDOVA_PRJ_PATH = '..\\08_dist\\'; // cordova project root folder
const RELEASE_PATH = '..\\09_release\\'; // release folder
const PLATFORM_PATH = CORDOVA_PRJ_PATH + 'platforms\\'; // cordova platforms folder

function execCmd(cmd){
    console.log("running "+cmd);
    let res = execSync(cmd,{encoding:'utf-8'});
    if(res !== ''){
        console.log(res);
    }else{
        console.log("done");
    }
}

function removeFolder(path){
    console.log("=== 清除文件夹 => " + path);
    if(fs.existsSync(path)){
        let cleanCmd = 'rmdir /s/q '+path;
        execCmd(cleanCmd);
    }else{
        console.log(path + "不存在，无需移除。");
    }

}

function createFolderRecursive(path){
    console.log("=== 创建文件夹 => " + path);
    if(fs.existsSync(path)){
        let cleanCmd = 'rmdir /s/q '+path;
        console.log(path + "已存在，移除。");
        execCmd(cleanCmd);
    }
    let dirCmd = 'mkdir '+path;
    execCmd(dirCmd);
}

function removePreviousMinFiles(){
    removeFolder(FOLDER_MIN_PATH+'www');
}

function bundleJS(){
    console.log("=== 打包JS文件 ===");
    let jsDirCmd = 'mkdir '+FOLDER_MIN_PATH+'www\\js';
    let terserCmd = 'terser "..\\01_src\\www\\libs\\phaser\\phaser.min.3.60.0.js" "..\\01_src\\www\\libs\\jquery\\jquery.3.4.0.min.js" "..\\01_src\\www\\libs\\bootstrap\\popper.min.js" "..\\01_src\\www\\libs\\bootstrap\\bootstrap.min.js" "..\\01_src\\www\\libs\\iconfont\\iconfont.js" "..\\01_src\\www\\libs\\localforage.min.js" "..\\01_src\\www\\libs\\seedrandom.3.05.min.js" "..\\01_src\\www\\js\\cdcFunc.js" "..\\01_src\\www\\js\\cdcConfig.js" "..\\01_src\\www\\js\\model\\cdModel.js"  "..\\01_src\\www\\js\\sprite\\MobSprite.js" "..\\01_src\\www\\js\\sprite\\MobController.js" "..\\01_src\\www\\js\\sprite\\MobAI.js"  "..\\01_src\\www\\js\\model\\baseStateModel.js" "..\\01_src\\www\\js\\model\\kfModel.js" "..\\01_src\\www\\js\\model\\itemModel.js" "..\\01_src\\www\\js\\model\\characterModel.js" "..\\01_src\\www\\js\\model\\skillModel.js" "..\\01_src\\www\\js\\model\\recipeModel.js" "..\\01_src\\www\\js\\model\\armyModel.js"   "..\\01_src\\www\\js\\gDB.js" "..\\01_src\\www\\js\\db\\dbCity.js" "..\\01_src\\www\\js\\db\\dbCityCmd.js" "..\\01_src\\www\\js\\db\\dbCityBuilding.js" "..\\01_src\\www\\js\\db\\dbCityAction.js" "..\\01_src\\www\\js\\db\\dbPoem.js" "..\\01_src\\www\\js\\db\\dbCityCargo.js" "..\\01_src\\www\\js\\db\\dbNPC.js" "..\\01_src\\www\\js\\db\\dbHill.js" "..\\01_src\\www\\js\\db\\dbShip.js" "..\\01_src\\www\\js\\db\\dbPlayer.js" "..\\01_src\\www\\js\\db\\dbKf.js" "..\\01_src\\www\\js\\db\\dbItem.js" "..\\01_src\\www\\js\\db\\dbCityItem.js" "..\\01_src\\www\\js\\db\\dbTask.js" "..\\01_src\\www\\js\\db\\dbMob.js" "..\\01_src\\www\\js\\model\\mobModel.js" "..\\01_src\\www\\js\\model\\npcModel.js" "..\\01_src\\www\\js\\model\\taskModel.js" "..\\01_src\\www\\js\\model\\medicineModel.js"  "..\\01_src\\www\\js\\gConsole.js" "..\\01_src\\www\\js\\gGui.js" "..\\01_src\\www\\js\\gTrade.js" "..\\01_src\\www\\js\\gTime.js" "..\\01_src\\www\\js\\gQuickBattle.js" "..\\01_src\\www\\js\\gTravelManager.js" "..\\01_src\\www\\js\\view\\baseModal.js" "..\\01_src\\www\\js\\view\\bankModal.js" "..\\01_src\\www\\js\\view\\puzzleModal.js" "..\\01_src\\www\\js\\view\\taskModal.js" "..\\01_src\\www\\js\\view\\journalModal.js" "..\\01_src\\www\\js\\view\\purchaseModal.js" "..\\01_src\\www\\js\\view\\saleModal.js" "..\\01_src\\www\\js\\view\\characterModal.js" "..\\01_src\\www\\js\\view\\buyModal.js" "..\\01_src\\www\\js\\view\\gamblingModal.js" "..\\01_src\\www\\js\\view\\meditationModal.js" "..\\01_src\\www\\js\\view\\composeModal.js" "..\\01_src\\www\\js\\view\\decomposeModal.js" "..\\01_src\\www\\js\\view\\sellModal.js" "..\\01_src\\www\\js\\view\\battleModal.js" "..\\01_src\\www\\js\\view\\shipModal.js" "..\\01_src\\www\\js\\view\\kongFuModal.js" "..\\01_src\\www\\js\\view\\miniMapManager.js" "..\\01_src\\www\\js\\view\\helpWizard.js" "..\\01_src\\www\\js\\view\\inventoryModal.js" "..\\01_src\\www\\js\\view\\investModal.js" "..\\01_src\\www\\js\\view\\buffWidget.js" "..\\01_src\\www\\js\\view\\deBuffWidget.js" "..\\01_src\\www\\js\\view\\bubbleWidget.js" "..\\01_src\\www\\js\\gApp.js" "..\\01_src\\www\\js\\wge\\wge.js"  "..\\01_src\\www\\scenes\\boot.js" "..\\01_src\\www\\scenes\\credits.js" "..\\01_src\\www\\scenes\\world.js" "..\\01_src\\www\\js\\config.js" "..\\01_src\\www\\js\\aniConfig.js"  "..\\01_src\\www\\js\\playerInWorld.js" "..\\01_src\\www\\js\\player.js" "..\\01_src\\www\\scenes\\dynamic.js" "..\\01_src\\www\\js\\movie\\BubbleManager.js" "..\\01_src\\www\\js\\movie\\FlyingBirdManager.js" "..\\01_src\\www\\js\\movie\\CharRainManager.js"  "..\\01_src\\www\\js\\index.js" -o "'+FOLDER_MIN_PATH+'www\\js\\bundle.js"';
    execCmd(jsDirCmd);
    execCmd(terserCmd);
}

function bundleCSS(){
    console.log("=== 压缩CSS文件 ===");
    createFolderRecursive(FOLDER_MIN_PATH+'www\\assets\\css');
    let CssArr = [
        "assets\\css\\bootstrap.Journal.min.css",
        "assets\\css\\iconfont.css",
        "assets\\css\\animateCss.css",
        "assets\\css\\gConsole.css",
        "assets\\css\\gGui.css",
        "assets\\css\\movie.css",
        "assets\\css\\credits.css"
    ]
    let inPath = '..\\01_src\\www/';
    let outPath = FOLDER_MIN_PATH+'www\\';
    for(let i=0;i<CssArr.length;i++){
        let cmd = 'cleancss -o '+ outPath + CssArr[i] + ' '+ inPath + CssArr[i];
        execCmd(cmd);
    }
}

function bundleJson(){
    console.log("=== 压缩JSON文件 ===");
    let jsonFolderArr = [
        'assets\\json\\',
        'assets\\maps\\rooms\\',
        'assets\\sprits\\character\\',
        'assets\\sprits\\horse\\',
        'assets\\sprits\\character\\',
        'assets\\sprits\\mobs\\',
        'assets\\sprits\\ship\\'
    ];
    for(let i=0;i<jsonFolderArr.length;i++){
        mini_json_file_or_copy_other_files_in_folder('..\\01_src\\www\\'+jsonFolderArr[i],FOLDER_MIN_PATH+'www\\'+jsonFolderArr[i]);
    }
}

/**
 * if source_dir contains json file, mini and out, otherwise copy file.
 * @param source_dir should be ended with '/'
 * @param dest_dir should be ended with '/'
 */
function mini_json_file_or_copy_other_files_in_folder(source_dir,dest_dir){
    if(!fs.existsSync(dest_dir)){
        fs.mkdirSync(dest_dir,{ recursive: true });
    }
    let files = fs.readdirSync(source_dir);
    for(let i=0;i<files.length;i++){
        let fileExt = path.extname(files[i]);
        if(fileExt === '.json'){
            miniJsonFileSync(source_dir+files[i], dest_dir+files[i]);
        }else{
            console.log("复制文件：" + source_dir+files[i] + ' '+dest_dir+files[i]);
            execCmd('copy ' + source_dir+files[i] + ' '+dest_dir+files[i]);
        }
    }
}

function miniJsonFile(inPath,outPath){
    fs.readFile(inPath, 'utf8', (err, data) => {
        if (err) {
            console.log(`Error reading file from disk: ${err}`)
        } else {
            let dataObj = JSON.parse(data);
            let dataStr = JSON.stringify(dataObj);
            fs.writeFile(outPath,dataStr, 'utf8', err => {
                if (err) {
                    console.log(`Error writing file: ${err}`)
                } else {
                    console.log(outPath+ ` 创建成功。`)
                }
            });
        }
    });
}
function miniJsonFileSync(inPath,outPath){
    let data = fs.readFileSync(inPath,{ encoding: 'utf8', flag: 'r' });
    let dataObj = JSON.parse(data);
    let dataStr = JSON.stringify(dataObj);
    fs.writeFileSync(outPath,dataStr, {encoding: "utf8"});
    console.log(outPath+ ` 创建成功。`)
}

function bundleFolders(){
    console.log("=== 复制目录 ===");
    let folders = [
        'assets\\audio\\',
        'assets\\fonts\\',
        'assets\\images\\',
        'assets\\maps\\world\\',
        'assets\\maps\\images\\',
        'assets\\particles\\',
        'assets\\sprits\\missile\\',
        'js\\db\\i18n\\'
    ];
    createFolderRecursive(FOLDER_MIN_PATH+'www\\js\\db\\i18n\\');
    for(let i=0;i<folders.length;i++){
        console.log('复制'+'../01_src/www/'+folders[i]+ ' '+ ''+FOLDER_MIN_PATH+'www/'+folders[i] + " /Y /S /E");
        execCmd('xcopy '+'..\\01_src\\www\\'+folders[i]+ ' '+ ''+FOLDER_MIN_PATH+'www\\'+folders[i] + " /Y /S /E");
    }
}

function bundleHTML(){
    console.log("=== 压缩HTML文件 ===");
    if(!fs.existsSync(''+FOLDER_MIN_PATH+'www\\assets\\html\\')){
        fs.mkdirSync(''+FOLDER_MIN_PATH+'www\\assets\\html\\',{ recursive: true });
    }
    let creCmd = 'html-minifier-terser ..\\01_src\\www\\assets\\html\\credits.html -o '+FOLDER_MIN_PATH+'www\\assets\\html\\credits.html --collapse-whitespace --remove-comments --minify-js true --minify-css true';
    execCmd(creCmd);

    console.log("=== 压缩index文件 ===");
    let htmlCmd = 'html-minifier-terser ..\\01_src\\www\\index-for-pack.html -o '+FOLDER_MIN_PATH+'www\\index.html --collapse-whitespace --remove-comments --minify-js true --minify-css true';
    execCmd(htmlCmd);
}

// min and copy files to 07_min
function min_resources(){
    removePreviousMinFiles(); // clean previous files
    bundleJS();      // bundle JS
    bundleCSS();     // bundle CSS
    bundleJson();    // bundle json files
    bundleHTML();
    bundleFolders();    // copy audio / image / etc files
}

function argv_check(args){
    if(args.length !== 3){
        return -1;
    }
    return args[2];
}
function getNowTime () {
    let now = new Date();
    let year = now.getFullYear(); //获取完整的年份(4位,1970-????)
    let month = now.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    let today = now.getDate(); //获取当前日(1-31)
    let hour = now.getHours(); //获取当前小时数(0-23)
    let minute = now.getMinutes(); //获取当前分钟数(0-59)
    let second = now.getSeconds(); //获取当前秒数(0-59)
    let nowTime = ''
    nowTime = year + fillZero(month) + fillZero(today) + '-' + fillZero(hour) +
        fillZero(minute) + fillZero(second);
    return nowTime
};

function fillZero (str) {
    return (str<10)? '0'+str : ''+str;
}

// main entrance, min file, copy all necessary files to build folder
function main() {
    let platform = argv_check(process.argv);
    if((platform !== 'iphone') && (platform !== 'windows') && (platform !== 'osx') && (platform !== 'browser')){
        console.log("platform error, supported = iphone | windows | osx | browser");
        return;
    }
    let actPlat = (platform === 'windows' || platform === 'osx' )? 'electron' : platform;
    console.log("==> processing building with platform = "+ actPlat);

    min_resources();
    console.log("==> source code minify done.");

    // remove previous build files
    let dist_path = PLATFORM_PATH + actPlat + "\\"; // e.g. = ../08_dist/platforms/electron/
    console.log("==> clear dist folder");
    removeFolder(dist_path);
    removeFolder(PLATFORM_PATH + '.gitignore');
    removeFolder(PLATFORM_PATH + 'config.xml');
    removeFolder(PLATFORM_PATH + 'package.json');
    // create skeleton folders
    createFolderRecursive(dist_path + 'cordova');       // ../08_dist/platforms/electron/cordova
    createFolderRecursive(dist_path + 'platform_www');  // ../08_dist/platforms/electron/platform_www
    createFolderRecursive(CORDOVA_PRJ_PATH + 'www');    // ../08_dist/www

    // copy 07_min files to 08_dist
    console.log("==> copy 08_min files to 08_dist");
    execCmd("xcopy "+FOLDER_MIN_PATH + '\\www\\ ' + CORDOVA_PRJ_PATH+'www\\' + " /Y /S /E");
    // 02_plat_spec files to 08_dis
    console.log("==> copy 02_plat_spec files to 08_dist");
    execCmd("copy "+PLAT_SPEC_PATH + actPlat + '\\www\\extra.js '+ CORDOVA_PRJ_PATH + 'www\\js\\extra.js');
    execCmd("copy "+PLAT_SPEC_PATH  + 'config.xml '+ CORDOVA_PRJ_PATH + 'config.xml');
    execCmd("copy "+PLAT_SPEC_PATH  + 'package.json '+ CORDOVA_PRJ_PATH + 'package.json');
    execCmd("copy "+PLAT_SPEC_PATH  + 'package-lock.json '+ CORDOVA_PRJ_PATH + 'package-lock.json');
    execCmd("xcopy "+PLAT_SPEC_PATH + actPlat + '\\cordova\\ '+ dist_path + 'cordova\\'+" /Y /S /E");
    execCmd("xcopy "+PLAT_SPEC_PATH + actPlat + '\\platform_www\\ '+ dist_path + 'platform_www\\'+" /Y /S /E");

    console.log("08 dist preparation done");
    // create build
    // execCmd("npm install");
    if(actPlat === 'browser'){
        execCmd("cd "+CORDOVA_PRJ_PATH+" && cordova build browser --release --verbose");
    }else{
        execCmd("cd "+CORDOVA_PRJ_PATH+" && cordova build electron --release --verbose");
    }

    // move created build to daily build folder
    console.log("==> creating 09_release folder ");
    let release_path = RELEASE_PATH + getNowTime() + '_'+platform;
    createFolderRecursive(release_path);
    execCmd("move /Y "+ dist_path+'build ' + release_path);
    // execCmd("explorer.exe "+release_path);
    execCmd("start "+release_path);
}

main();