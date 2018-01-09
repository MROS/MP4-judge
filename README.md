# 台大系統程式設計 2017 單班 MP4 測試程式

## 安裝

請先擁有版本 v8.0 以上的 node.js

``` sh
git clone https://github.com/MROS/MP4-judge
cd MP4-judge
npm install
```

## 測試
假設仍位於 MP4-judge 目錄，此時有兩種執行測試的方式。

1. 先複製執行檔到當前目錄，執行 judge.js

``` sh
cp ${你的 server 所在目錄}/inf-bonbon-server .
node judge.js
```

2. 先於你的 MP4 下編譯好 inf-bonbon-server，再於命令行參數指定它所在的目錄

``` sh
# 編譯 inf-bonbon-server
node judge.js --dir ${MP4 目錄}
```

這兩種做法的執行行爲有差，第一種會僅複製執行檔到一個空目錄底下執行，而第二種則會將整個 MP4 目錄底下的檔案、目錄全數複製到一個空目錄底下再執行。

你可以使用 `-s` 或 `--silent` 的命令行參數來關閉伺服器的標準輸出與標準錯誤輸出

## 目錄結構解釋

本測試程式的目錄結構如下

## 自定義

可以修改 judge.js 中的 `test_suites` 變數來選擇想測試的測資 