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
cp ${server 所在目錄}/inf-bonbon-server .
node judge.js
```

2. 先於你的 MP4 下編譯好 inf-bonbon-server，再於命令行參數指定它所在的目錄

``` sh
# 先在 MP4 目錄下編譯 inf-bonbon-server
node judge.js --dir ${MP4 目錄}
```

這兩種做法的執行行爲有差，第一種會僅複製執行檔到一個空目錄底下執行，而第二種則會將整個 MP4 目錄底下的檔案、目錄全數複製到一個空目錄底下再執行。

你可以使用 `-s` 或 `--silent` 的命令行參數來關閉伺服器的標準輸出與標準錯誤輸出

## 目錄結構解釋

本測試程式的目錄結構如下
```
.
├── judge.js                    # 測試單支伺服器的腳本
├── judge_all.js                # 測試所有同學伺服器的腳本，需要額外資料
├── judge_base.js               # judge 程式的核心，judge.js 與 judge_all.js 皆依賴此檔案
├── client.js                   # 客戶端的類別
├── cmd.js                      # 生成 API 的輔助函式
├── util.js                     # 功能性函式
├── filter_function.js          # 生成篩選函式的輔助函式
├── package.json                # node.js 建置訊息
├── README.md                   # 讀我
├── c_code                      # 測速時用到的 C 程式碼
│   ├── filter_function.c
│   └── run.c
└── test_suite                  # 測試集，存放各個測資的定義
    ├── 1_1_basic.js
    ├── 1_2_small.js
    ├── 2_parallel.js
    ├── 3_always_crash.js
    ├── 3_sometimes_crash.js
    ├── 4_1_800_online.js
    └── 4_2_800_online_offline.js
```

## 自定義

可以修改 judge_base.js 中的 `test_suites` 變數來選擇想測試的測資 

此外，每一個測資都可以設定 time\_limit ，若無設定則一律是 30 秒，若想要設定請自行修改 test_suite 底下的各檔案。