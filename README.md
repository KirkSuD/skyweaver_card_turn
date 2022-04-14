# Skyweaver opponent card draw turn memorizer userscript & extension

[中文版 README](README.zhtw.md)

This remembers which turn the opponent drew the cards by replacing/patching webpage Javascript code.  
This is still in **Alpha** stage. There's absolutely no warranty.  
Userscript only supports **Firefox**.  
Browser extension supports **major browsers**, including **Chrome, Edge, Firefox**...

<!-- ![Screenshot](https://i.imgur.com/xg6Gq0D.png) -->
<!-- ![Screenshot](https://i.imgur.com/Y48UsBB.png) -->
[![Screenshot](https://i.imgur.com/OPiGp3A.png)](https://i.imgur.com/39WCBEW.mp4)
[![Screenshot](https://i.imgur.com/443bnNP.png)](https://i.imgur.com/39WCBEW.mp4)
<!-- https://imgur.com/a/PfjH1bT -->

## Features

- Remember the opponent got the cards...  
    - on which player's turn
    - on which turn (number)
    - from where: Deck, Limbo...
    - by doing what: StartTurn, EndTurn, PlayCard, Attack...
    - the allowed pool: Anywhere, Prisms...
    - mulligan: how many cards
    - fatigue (basically imply conjure)
    - the played card & target
    - attacker & defender
    - trigger card & effect type
- Mark special cards with an underline (cards not normally drawn from Deck/CardSelection)  
- View opponent's & your prisms' card that are not present
- Draggable beautiful UI box
- Save state in localStorage, so you can resume after refreshing the page

## Install

### Browser Extension

The extension is not on Chrome/Firefox add-on store yet.

1. Download [latest release/browser_extension_VERSION.zip](https://github.com/KirkSuD/skyweaver_card_turn/raw/master/release/browser_extension_2022.04.14.10.zip)
2. Extract the zip file to a folder
3. Follow browser-specific steps below

#### Chrome/Edge

1. Goto [chrome://extensions/](chrome://extensions/)
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the unzipped folder
5. Make sure the extension is enabled & permissions are given
6. The extension should be working. If not, try refreshing the webpage & clearing the browser cache

#### Firefox

1. Goto [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox)
2. Click `Load Temporary Add-on`
3. Select the zip file or the unzipped `manifest.json`
4. The extension should be working. If not, try refreshing the webpage & clearing the browser cache

### Userscript

1. Open **Firefox**
2. Install add-on GreaseMonkey / TamperMonkey
3. Install userscript from [greasyfork](https://greasyfork.org/zh-TW/scripts/441991)

## Restrictions

May not work on newer version of Skyweaver.  
When they update the code, rewriting code might be necessary
    because this works by patching their code.

Some errors cannot be avoided because without knowing cards' details &
    simulating how they work, it's not possible to make it 100% accurately correct.

### Userscript

Userscript only works on **Firefox** because not able to intercept body script on Chromium.  
Tested on GreaseMonkey & TamperMonkey.  

## Contributing & Troubleshooting

Feel free to fork, create issue, create PR.

To view the output of this script, search "Skyweaver card turn" in the developer tool's console.  
To help debugging, when you find something wrong,  
    open browser developer tool by pressing F12 right after the game,  
    type "JSON.stringify(window.skyweaverWorkerProxyStoreEvents)",  
    then right click the output json message,
    click "copy object", save it as a text file,  
    which contains all game events, useful for debugging.

## Disclaimer

This is software with absolutely no warranty.  
    Please disable this userscript/extension and reload web page if you find something wrong.

## Changelog

### 2022.03.24.09

First version.  
This would patch https://play.skyweaver.net/game/fbc69ea5693e28c1a859bc8f7bdaa9eeb88d958e/main-fea492886614074130ff.js

### 2022.03.25.16

Hot fix.  
This would patch https://play.skyweaver.net/game/6e90311d3ead8634147fb04d62ca9a7c3c671ab1/main-0855b4c75acf85cb7f03.js  
Newer version may come in the form of browser extension in order to support Chrome.

### 2022.03.26.05

Regex matching "https://play.skyweaver.net/game/* /main-*.js" to patch  
Mark "gift cards" with an underline  
Draggable beautiful UI box  
Save & load state in localStorage  
Browser extension which supports Firefox & Chromium is done! Stay tuned.

### 2022.03.31.01

Modify browser extension structure to fix the background to content communication bug.  
    Now Chrome background script blocks script, Chrome content script patches script.  
    Now Firefox background script does nothing, Firefox content script blocks & patches script.  
Now content script is also userscript.

### 2022.04.14.10

Epic new features: remember how opponent got the cards, view opponent's & your prisms' cards.

## Donation

Winning using this userscript? Consider buying me a coffee!  
My crypto addresses:
```
Skyweaver Sequence wallet
      0xB77702eF2213e0472f8071c6209CbD10324b3c21
BTC   bc1qttretrlxjfv2363zdg7xvthyvrstsru0mhangk
ETH AVAX MATIC FTT GRT CAKE
      0x760a6c97eAcABFE46D6c602a371f42099d6a8576
BNB   bnb1pqzkpxl5s5wc3s7h2hga5hq8sn98sz4a0xefec
LUNA  terra1upxh8ufp3carg8z8nc39sdrsrn02cde8hxxlz9
SOL   2V9Ux48XttpH3r4ZTg3rxRpd5fmLiYz2EAq2eCSNifCY
DOT   14j8gPesPyxmw4eC1rBpUqgydT3xw7KJSo2dJ6VuigG9J4E9
DOGE  DA19CxjfTkURNVxs5fNeZGNdsUPsStax5E
LTC   ltc1qlgqh5aqemjazsfnq7zxayg6y75aqv7twl2r56d
ATOM  cosmos1gaqjnqrz9aae2w03dw3zr3xr8un2tnpnv075rf
THETA 0xa3415F2e117A256c3371B7ee4a6340862A1294E9
DASH  XgrxBD5KWjnYaScpNd6u4fGxiYfc9u2uBN
DGB   dgb1q65h5v9990mrx2eutyu4xud23qlty6e5u66xzv9
XNO   nano_1m5kn3h34gibzoz54g9yie5je5c6psiofiwr4tcx3um8up3abaz31z33tqo4
TT    0x08AF0f949a8Af3027177C8b42B91d85f951a487B
LBC   bZqCwFPuGDaQfH5W1QYy19Fs4uGF83UvgC
```
