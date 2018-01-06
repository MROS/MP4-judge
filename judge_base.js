// 請將本 judge.js 程式與您的 inf-bonbon-server 置於同一個乾淨目錄後
// 執行 node judge.js


const child_process = require("child_process");
const { Client, destroy_sockets} = require("./client.js");
const util = require("./util.js");
require("colors");

const argv = require('minimist')(process.argv.slice(2));

const PROGRAM_NAME = "inf-bonbon-server";

const PORT_LOWER_BOUND = 50000;
const PORT_UPPER_BOUND = 60000;

async function run_until_port_ok() {

    while (true) {
        const range = PORT_UPPER_BOUND - PORT_LOWER_BOUND;
        let port = PORT_LOWER_BOUND + Math.floor(Math.random() * range);
        // port = 9898;

        console.log(`嘗試 ${port} 埠口`);

        let server = child_process.spawn("../inf-bonbon-server", [`${port}`]);

        let ok = true;

        server.stdout.on('data', (data) => {
            if (data.toString() == "socket fail\n") {
                console.log(`嘗試 ${port} 埠口失敗`);
                server.kill();
                ok = false;
            }
        });

        if (!argv["s"] && !argv["silent"]) {
            server.stdout.on('data', (data) => {
                console.log(data.toString());
            });
            server.stderr.on('data', (data) => {
                console.log(data.toString());
            });
        }

        await util.sleep(1000);
        
        if (ok) {
            console.log(`綁定於 ${port} 埠口`);
            return port;
        }
    }
}

const test_suite_1_1_basic = require("./test_suite/1_1_basic.js");
const test_suite_1_2_small = require("./test_suite/1_2_small.js");
const test_suite_2_parallel = require("./test_suite/2_parallel.js");
const test_suite_3_crash = require("./test_suite/3_crash.js");
const test_suite_4_1_800_online = require("./test_suite/4_1_800_online.js");
const test_suite_4_2_800_online_offline = require("./test_suite/4_2_800_online_offline.js");

const test_suites = [
    {
        name: "基礎",
        cases: test_suite_1_1_basic,
        point: 1,
    },
    {
        name: "小型",
        cases: test_suite_1_2_small,
        point: 1,
    },
    {
        name: "平行化程度",
        cases: test_suite_2_parallel,
        point: 2,
    },
    {
        name: "惡意程式",
        cases: test_suite_3_crash,
        point: 2,
    },
    {
        name: "多人上線",
        cases: test_suite_4_1_800_online,
        point: 1,
    },
    {
        name: "多人上線下線",
        cases: test_suite_4_2_800_online_offline,
        point: 1,
    },
];

async function run_until_work(f) {
	while (true) {
		try {
			f();
		} catch(error) {
			console.log(error.message);
			console.log("再試一次");
			await util.sleep(1000)
			continue;
		}
		break;
	}
}

async function run_with_time_limit(limit, promise) {
    const p = new Promise(async function (resolve, reject) {
        let t = setTimeout(function () { resolve("timeout"); }, limit * 1000);

        let res = await promise;
        clearTimeout(t);
        resolve(res);
    });
    return p;
};

async function judge(test_suites) {
    let point = 0;
    let count = 1;
    for (let test_suite of test_suites) {
        let ok = true;
        for (let test_case of test_suite.cases) {
			await run_until_work(() => { child_process.execSync("rm -rf working_dir"); })
            child_process.execSync("mkdir working_dir");
            child_process.execSync("cp inf-bonbon-server working_dir");
            process.chdir("./working_dir");
            const port = await run_until_port_ok();

            console.log(`測試：${test_case.name}`);
            const time_limit = test_case.time_limit || 15; // 沒有限制時間，就是 15 秒
            let case_ok;
            try {
                case_ok = await run_with_time_limit(time_limit, test_case.func(port));
            } catch (error) {
                case_ok = error.message;
            }

            switch (case_ok) {
                case true:
                console.log(`測試：${test_case.name} ${"通過".green}`);
                break;
                case false:
                ok = false;
                console.log(`測試：${test_case.name} ${"失敗".red}`);
                break;
                case "timeout":
                ok = false;
                console.log(`測試：${test_case.name} ${"超時".red}`);
                break;
                default:
                console.log(`測試：${test_case.name} ${case_ok.red}`);
                ok = false;
            }

            destroy_sockets();
            child_process.execSync("killall -q inf-bonbon-server");
            process.chdir("..");
        }
        point += (ok ? test_suite.point : 0);
        console.log(`-------------- 測試集 ${test_suite.name}： ${ok ? "通過".green : "失敗".red} ----------------`);
        count += 1;
    }
    console.log(`得分爲 ${point} 分`);
}

module.exports= {
    test_suites,
    judge
};