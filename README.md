# 台大系統程式設計 2017 單班 MP4 測試程式

## 安裝

請先擁有版本 v8.0 以上的 node.js

``` sh
git clone https://github.com/MROS/MP4-judge
cd MP4-judge
npm install
```

## 測試
假設仍位於 MP4-judge 目錄

``` sh
cp ${你的 server 所在目錄}/inf-bonbon-server .
node judge.js
```

或者你可以使用 `node judge.js -s` 來關閉伺服器的標準輸出與標準錯誤輸出

## 自定義

可以修改 judge.js 中的 `test_suite` 變數來選擇想測試的測資 