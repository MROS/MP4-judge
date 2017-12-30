// 請將本 judge.js 程式與您的 inf-bonbon-server 置於同一個乾淨目錄後
// 執行 node judge.js

const child_process = require("child_process");
const Client = require("./client.js").Client;

const argv = require('minimist')(process.argv.slice(2));

const PROGRAM_NAME = "inf-bonbon-server";

if (process.argv.length > 3) {
    console.log("用法： node judge.js [-s|--slient]");
    process.exit();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const PORT_LOWER_BOUND = 50000;
const PORT_UPPER_BOUND = 60000;

async function run_until_port_ok() {

    while (true) {
        const range = PORT_UPPER_BOUND - PORT_LOWER_BOUND;
        let port = PORT_LOWER_BOUND + Math.floor(Math.random() * range);
        // port = 9898;

        console.log(`嘗試 ${port} 埠口`);

        let server = child_process.spawn("./inf-bonbon-server", [`${port}`]);

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

        await sleep(1000);
        
        if (ok) {
            console.log(`綁定於 ${port} 埠口`);
            return port;
        }
    }
}

const test_suite_1_small = require("./1_small.js");

const test_suites = [
    test_suite_1_small
];

async function judge(test_suites) {
    let point = 0;
    for (let test_suite of test_suites) {
        let ok = true;
        for (let test_case of test_suite) {
            const port = await run_until_port_ok();
            ok = ok && await test_case(port);
            child_process.execSync("killall inf-bonbon-server");
        }
        point += (ok ? 2 : 0);
    }
    console.log(`得分爲 ${point} 分`)
}

judge(test_suites).then();