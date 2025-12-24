## Suda Punch API
速打打卡系統 API 專案：使用 NestJS 框架構建的後端服務，提供打卡功能的 API 介面。

<p align="center">![Uploading SudaLogo.svg…]()<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="512" cy="406" r="215" stroke="url(#paint0_linear_13_555)" stroke-width="50"/>
<circle cx="645.8" cy="226" r="60" fill="url(#paint1_linear_13_555)"/>
<line x1="662.739" y1="197.363" x2="675.963" y2="209.061" stroke="white" stroke-width="24" stroke-linecap="round"/>
<g clip-path="url(#clip0_13_555)">
<path d="M512 256C452.806 256 404.662 304.167 404.662 363.338C404.662 418.919 485.006 479.059 508.234 553.316C508.733 554.919 510.232 556.012 511.912 556.001C513.598 555.977 515.072 554.873 515.549 553.257C538.084 477.173 619.332 418.983 619.337 363.326C619.332 304.167 571.182 256 512 256ZM512 444.762C465.59 444.762 427.827 406.993 427.827 360.588C427.827 314.178 465.59 276.415 512 276.415C558.399 276.415 596.168 314.178 596.168 360.588C596.168 406.993 558.399 444.762 512 444.762Z" fill="url(#paint2_linear_13_555)"/>
<g clip-path="url(#clip1_13_555)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M557.041 321.111L498.834 380.369L467.559 348.526L462.8 353.372L498.834 390.061L561.793 325.95L557.041 321.111Z" fill="#60C6D7"/>
</g>
</g>
<path d="M369.839 855.6C364.639 855.6 356.839 867.8 350.639 878L336.239 853.6C342.439 846.4 350.439 839.8 357.239 836V788.2H338.439V762.2H379.639V819.4L380.439 819C390.239 813.8 404.439 803.2 411.639 792.8H386.439V737.2H421.439V727.8H383.039V704.6H421.439V689.2H443.839V704.6H484.239V727.8H443.839V737.2H480.439V792.8H451.839C463.439 800.4 478.239 811.4 485.039 819.2L470.639 838.4C465.239 831.6 453.239 821.8 443.839 814.2V843H421.439V813.4C414.639 824.6 403.239 835.2 393.039 841.6L379.639 819.4V834.8C382.039 836.6 386.039 839.4 390.839 842C401.239 848.2 417.239 849.6 433.039 849.6C447.239 849.6 474.239 847.8 484.839 845.8L486.039 871.8C479.039 872.6 467.839 873.2 456.639 873.8H454.439C446.439 874.2 438.439 874.4 432.439 874.4C414.239 874.4 398.439 871.8 386.639 865C378.639 860.8 373.839 855.6 369.839 855.6ZM382.639 726.8L363.439 744.8C358.039 736.4 346.439 720.4 339.039 710.2L357.039 694.8C360.039 698.6 363.839 703.2 367.639 708L369.039 709.6C374.239 716 379.239 722.4 382.639 726.8ZM409.039 772H421.439V758.2H409.039V772ZM443.839 772H456.239V758.2H443.839V772ZM575.2 871.2C569.2 875.6 558.8 876.4 545.2 876.4L544.2 850.2C546 850.4 552.4 850.4 555.6 850.4H556.8C559 850.4 558.4 849.4 558.4 846.8V813.2L544.2 817.6L538.4 789.2C544 787.8 550.4 785.6 558.4 783.8V753.2H539.6V726.6H558.4V688.8H582.8V726.6H598.6V753.2H582.8V777.6L598.2 773L601 800.2C595.2 802 589.6 804.4 582.8 806.4V847C582.8 859.6 581 867.2 575.2 871.2ZM653 871C645.4 876 632 876.6 614.6 876.6L613.4 846.4C617.2 847 630.8 846.8 633.8 846.8C636.8 846.8 637.2 845.4 637.2 842V731.8H600V703.6H688.2V731.8H664V842.6C664 857.4 660.6 866.4 653 871Z" fill="url(#paint3_linear_13_555)"/>
<path d="M332.039 936.333C326.7 936.333 322.372 940.661 322.372 946C322.372 951.339 326.7 955.667 332.039 955.667V946V936.333ZM332.039 946V955.667C349.503 955.667 358.447 944.999 364.689 937.866C371.135 930.499 374.878 926.667 382.789 926.667V917V907.333C365.325 907.333 356.381 918.001 350.139 925.134C343.693 932.501 339.95 936.333 332.039 936.333V946Z" fill="url(#paint4_linear_13_555)"/>
<path d="M382.789 917V926.667C390.7 926.667 394.443 930.499 400.889 937.866C407.131 944.999 416.075 955.667 433.539 955.667V946V936.333C425.628 936.333 421.885 932.501 415.439 925.134C409.197 918.001 400.253 907.333 382.789 907.333V917Z" fill="url(#paint5_linear_13_555)"/>
<path d="M433.539 946V955.667C451.003 955.667 459.947 944.999 466.189 937.866C472.635 930.499 476.378 926.667 484.289 926.667V917V907.333C466.825 907.333 457.881 918.001 451.639 925.134C445.193 932.501 441.45 936.333 433.539 936.333V946Z" fill="url(#paint6_linear_13_555)"/>
<path d="M484.289 917V926.667C492.2 926.667 495.943 930.499 502.389 937.866C508.631 944.999 517.575 955.667 535.039 955.667V946V936.333C527.128 936.333 523.385 932.501 516.939 925.134C510.697 918.001 501.753 907.333 484.289 907.333V917Z" fill="url(#paint7_linear_13_555)"/>
<path d="M535.039 946V955.667C552.503 955.667 561.447 944.999 567.689 937.866C574.135 930.499 577.878 926.667 585.789 926.667V917V907.333C568.325 907.333 559.381 918.001 553.139 925.134C546.693 932.501 542.95 936.333 535.039 936.333V946Z" fill="url(#paint8_linear_13_555)"/>
<path d="M585.789 917V926.667C593.7 926.667 597.443 930.499 603.889 937.866C610.131 944.999 619.075 955.667 636.539 955.667V946V936.333C628.628 936.333 624.885 932.501 618.439 925.134C612.197 918.001 603.253 907.333 585.789 907.333V917Z" fill="url(#paint9_linear_13_555)"/>
<path d="M636.539 946V955.667C654.003 955.667 662.947 944.999 669.189 937.866C675.635 930.499 679.378 926.667 687.289 926.667V917V907.333C669.825 907.333 660.881 918.001 654.639 925.134C648.193 932.501 644.45 936.333 636.539 936.333V946ZM687.289 926.667C692.628 926.667 696.956 922.339 696.956 917C696.956 911.661 692.628 907.333 687.289 907.333V917V926.667Z" fill="url(#paint10_linear_13_555)"/>
<defs>
<linearGradient id="paint0_linear_13_555" x1="512" y1="166" x2="512" y2="646" gradientUnits="userSpaceOnUse">
<stop stop-color="#78D3CB"/>
<stop offset="1" stop-color="#3197C7"/>
</linearGradient>
<linearGradient id="paint1_linear_13_555" x1="645.8" y1="166" x2="645.8" y2="286" gradientUnits="userSpaceOnUse">
<stop stop-color="#68D2D6"/>
<stop offset="1" stop-color="#60C6D7"/>
</linearGradient>
<linearGradient id="paint2_linear_13_555" x1="512" y1="256" x2="512" y2="556.001" gradientUnits="userSpaceOnUse">
<stop stop-color="#68D2D6"/>
<stop offset="1" stop-color="#3CA4CE"/>
</linearGradient>
<linearGradient id="paint3_linear_13_555" x1="332" y1="784" x2="692" y2="784" gradientUnits="userSpaceOnUse">
<stop stop-color="#73CFCB"/>
<stop offset="1" stop-color="#2E84B5"/>
</linearGradient>
<linearGradient id="paint4_linear_13_555" x1="332" y1="784" x2="692" y2="784" gradientUnits="userSpaceOnUse">
<stop stop-color="#73CFCB"/>
<stop offset="1" stop-color="#2E84B5"/>
</linearGradient>
<linearGradient id="paint5_linear_13_555" x1="332" y1="784" x2="692" y2="784" gradientUnits="userSpaceOnUse">
<stop stop-color="#73CFCB"/>
<stop offset="1" stop-color="#2E84B5"/>
</linearGradient>
<linearGradient id="paint6_linear_13_555" x1="332" y1="784" x2="692" y2="784" gradientUnits="userSpaceOnUse">
<stop stop-color="#73CFCB"/>
<stop offset="1" stop-color="#2E84B5"/>
</linearGradient>
<linearGradient id="paint7_linear_13_555" x1="332" y1="784" x2="692" y2="784" gradientUnits="userSpaceOnUse">
<stop stop-color="#73CFCB"/>
<stop offset="1" stop-color="#2E84B5"/>
</linearGradient>
<linearGradient id="paint8_linear_13_555" x1="332" y1="784" x2="692" y2="784" gradientUnits="userSpaceOnUse">
<stop stop-color="#73CFCB"/>
<stop offset="1" stop-color="#2E84B5"/>
</linearGradient>
<linearGradient id="paint9_linear_13_555" x1="332" y1="784" x2="692" y2="784" gradientUnits="userSpaceOnUse">
<stop stop-color="#73CFCB"/>
<stop offset="1" stop-color="#2E84B5"/>
</linearGradient>
<linearGradient id="paint10_linear_13_555" x1="332" y1="784" x2="692" y2="784" gradientUnits="userSpaceOnUse">
<stop stop-color="#73CFCB"/>
<stop offset="1" stop-color="#2E84B5"/>
</linearGradient>
<clipPath id="clip0_13_555">
<rect width="300" height="300" fill="white" transform="translate(362 256)"/>
</clipPath>
<clipPath id="clip1_13_555">
<rect width="99" height="100.8" fill="white" transform="translate(462.8 305.2)"/>
</clipPath>
</defs>
</svg>
</p>

## 說明

* 建立一個易用且可靠的速打打卡系統 API，方便用戶快速記錄和管理打卡資訊。

* 功能單一且專注於打卡操作，確保系統的穩定性和高效性。

## 環境參數建立
專案會依照不同環境載入對應的環境變數檔案，請在專案根目錄下建立以下環境變數檔案，並根據需求填寫對應的參數值：
- `.env.development`：開發環境的環境變數。
- `.env.production`：生產環境的環境變數。

## 安裝相依套件

```bash
$ npm install
```

## 本地開發或執行

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 產品環境

產品環境需建立 `.env.production` 環境變數檔案，並設定相關參數。請參考 `.env.development` 範例檔案內容。

啟動時建議帶入參數啟動：

```bash
$ NODE_ENV=production npm run start:prod
```

## 資料庫建立

請確保已安裝並啟動 PostgreSQL 資料庫，並根據 `.env` 檔案中的設定建立對應的資料庫。

安裝完成後，請使用 `suda_database` 路徑下的檔案，透過 pgAdmin 的 Restore 還原資料表結構與初始資料。
