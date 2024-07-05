#  A tale of Wind and dust open source Project
- This is the open source project of Wind and dust. 
- This project contains the trail version of the game, which is a simplified version of the full game. 
- For the full version of the game, please visit steam link <a href="https://steamcommunity.com/app/2640630" target="_blank">here</a>.

## Media
<img src="06_marketing/images/jump.png" alt="Jump" style="width: 100%; max-width: 616px;">

## Links
- <a href="https://windust.anpena.com/demo/" target="_blank">Online Trail</a>
- <a href="https://whisperapart.github.io" target="_blank">Trail in github</a>
- <a href="https://steamcommunity.com/app/2640630" target="_blank">Steam</a>
- <a href="https://windust.anpena.com" target="_blank">Official website</a> : https://windust.anpena.com
- <a href="https://github.com/whisperapart/windust" target="_blank">Github</a> : https://github.com/whisperapart/windust
- <a href="https://gitee.com/whisperapart/windust" target="_blank"> Gitee </a> : https://gitee.com/whisperapart/windust

##  Features vs Full Game
| Features | Full Game | Trail Version |
| --- | :-: | :-: |
| Watermark | No  | Yes |
| Trail Icon | No  | Yes |
| Music | Yes  | No |
| Save Game | Yes | No |
| Load Game | Yes | No |
| Meditation for KongFu Scroll | Yes  | No |
| Gem Compose | Yes  | No |
| City Bank | Yes  | No |
| Gambling | Yes  | No |
| City and Zones | All 125 | Part 32 |
| Other Features | Yes | Yes |

## Installation
### Click to Play
1. Open 01_src/www/index.html with your browser

## Dev Guide
### Pre-requisites
- install cordova
- install nodejs
- cordova add platform browser / electorn

### Project Structure
- 01_src: Source code
- 02_plat_spec: Platform specific code
- 03_build_tools: Build tools
- 07_min: template folder, used to save minified files
- 08_dist: template folder, used to save the final package
- 09_release: release folder, used to save release package
- readme.md: readme file

### Run
```bash
 - cd 01_src
 - cordova platform add browser
 - cordova run browser
```
Note: for latest version of cordova, platform browser has been removed. In this case, you can use either of the following options:
1. cordova electron
```bash
cordova platform add electron
cordova run electron
```

2. Or run the project directly with your browser.
```bash
 - cd 01_src/www
 - run index.html directly with your browser
```


### Build
 - windows : cordova build windows
 - mac : cordova build osx
 
### Release
```
    cd 03_build_tools
    node dist_cmd.js windows # for windows
    node dist_bash.js osx # for mac
 ```

## Donation
Please donate to support the project.

| Donation | Alipay | Wechat | PayPal |
| --- | :-: | :-: | :-: |
|  | ![alipay](06_marketing/qrcode/alipay.png) | ![wechat](06_marketing/qrcode/wx.png) | <a href="https://paypal.me/whisperapart" target="_blank"> PayPal </a> |

## License  
 1. This open-source project is for demonstration and learning purposes only.
 2. Encourages use for learning, education, and personal projects.
 3. Commercial use is prohibited.