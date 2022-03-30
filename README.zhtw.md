# Skyweaver 對手手牌 獲取回和數 記憶器 使用者腳本 & 瀏覽器外掛

[English README](README.md)

這個專案會記住Skyweaver對手手牌獲取的回合數，原理是透過替換、修補網頁的Javascript程式碼來抓取資料。  
這個專案仍在開發測試初期，不保證不會出錯。  
使用者腳本版本只支援**Firefox**。  
瀏覽器外掛版本支援主流瀏覽器，包括**Chrome, Edge, Firefox**...

<!-- (![截圖](https://i.imgur.com/xg6Gq0D.png)) -->
![截圖](https://i.imgur.com/Y48UsBB.png)

## 功能

- 顯示對手獲取手牌的回合數
- 以底線標記不是選牌/牌組/手牌來源的特殊卡牌
- 可拖曳的顯示方塊
- 儲存狀態在瀏覽器 localStorage，所以可以在您的回合重整網頁
- 未來有可能新增更多功能。您可以贊助來激勵我！

## 安裝

### 瀏覽器外掛

還沒有上架 Chrome/Firefox 的外掛商店，請下載安裝。

1. 下載 [最新的 release/browser_extension_版本.zip](https://github.com/KirkSuD/skyweaver_card_turn/raw/master/release/browser_extension_2022.03.26.09.zip)
2. 解壓 zip 到資料夾
3. 根據瀏覽器，繼續以下操作

#### Chrome/Edge

1. 前往 [chrome://extensions/](chrome://extensions/)
2. 開啟 `開發人員模式`
3. 點選 `載入未封裝項目`
4. 選擇剛剛解壓縮的資料夾
5. 確認外掛已啟用，且權限已授予
6. 外掛應該已經正常運作。如果有問題，嘗試清除瀏覽器快取

#### Firefox

1. 前往 [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox)
2. 點選 `載入暫用附加元件...`
3. 選擇 zip 或 解壓後的 `manifest.json`
4. 外掛應該已經正常運作。如果有問題，嘗試清除瀏覽器快取

### 使用者腳本

1. 開啟 **Firefox**
2. 安裝 外掛 GreaseMonkey 或 TamperMonkey
3. 從 [greasyfork](https://greasyfork.org/zh-TW/scripts/441991) 安裝 使用者腳本

## 限制

可能無法在新版的 Skyweaver 運作。  
當他們更新網頁程式，這個專案的程式碼可能得重寫。

### 使用者腳本

使用者腳本版本只支援**Firefox** 因為在 Chromium 無法攔截 body script。  
在 GreaseMonkey & TamperMonkey 測試過。  

## 貢獻 & 尋找問題

歡迎 fork、創建 issue、創建 PR。

要檢視輸出，在開發者工具搜尋 "Skyweaver card turn"。  
要尋找問題，當你發現問題，遊戲結束後不要離開，按F12開啟開發者工具，  
    輸入 "JSON.stringify(window.skyweaverWorkerProxyStoreEvents)"，  
    在輸出的 json 訊息上按右鍵，按 "複製物件"，以文字檔儲存，  
    這包含剛剛遊戲的所有事件，對除錯可能有幫助。

## 免責聲明

不保證程式不會出錯。發現問題時請關閉使用者腳本/瀏覽器外掛並重整頁面。

## 版本歷史

### 2022.03.24.09

第一版。  
這會修補並替代 https://play.skyweaver.net/game/fbc69ea5693e28c1a859bc8f7bdaa9eeb88d958e/main-fea492886614074130ff.js

### 2022.03.25.16

快速但不穩的修補。  
這會修補並替代 https://play.skyweaver.net/game/6e90311d3ead8634147fb04d62ca9a7c3c671ab1/main-0855b4c75acf85cb7f03.js  
之後的版本可能會是瀏覽器外掛，那樣才能支援Chrome。

### 2022.03.26.05

這會修補並替代 "https://play.skyweaver.net/game/* /main-*.js"  
以底線標記不是選牌/牌組/手牌來源的特殊卡牌  
可拖曳的顯示方塊  
儲存狀態在瀏覽器 localStorage，所以可以在您的回合重整網頁  
支援主流瀏覽器的瀏覽器外掛已完成！敬請期待

## 贊助

用這個贏了？不如請我一杯咖啡吧！  
我的加密貨幣地址：
```
BTC   bc1qttretrlxjfv2363zdg7xvthyvrstsru0mhangk  
ETH   0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
BNB   bnb1pqzkpxl5s5wc3s7h2hga5hq8sn98sz4a0xefec  
LUNA  terra1upxh8ufp3carg8z8nc39sdrsrn02cde8hxxlz9  
SOL   2V9Ux48XttpH3r4ZTg3rxRpd5fmLiYz2EAq2eCSNifCY  
DOT   14j8gPesPyxmw4eC1rBpUqgydT3xw7KJSo2dJ6VuigG9J4E9  
AVAX  0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
DOGE  DA19CxjfTkURNVxs5fNeZGNdsUPsStax5E  
MATIC 0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
LTC   ltc1qlgqh5aqemjazsfnq7zxayg6y75aqv7twl2r56d  
ATOM  cosmos1gaqjnqrz9aae2w03dw3zr3xr8un2tnpnv075rf  
FTT   0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
THETA 0xa3415F2e117A256c3371B7ee4a6340862A1294E9  
GRT   0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
CAKE  0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
DASH  XgrxBD5KWjnYaScpNd6u4fGxiYfc9u2uBN  
DGB   dgb1q65h5v9990mrx2eutyu4xud23qlty6e5u66xzv9  
XNO   nano_1m5kn3h34gibzoz54g9yie5je5c6psiofiwr4tcx3um8up3abaz31z33tqo4  
TT    0x08AF0f949a8Af3027177C8b42B91d85f951a487B  
LBC   bZqCwFPuGDaQfH5W1QYy19Fs4uGF83UvgC
```
