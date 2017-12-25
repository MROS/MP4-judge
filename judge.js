// 請將本 judge.js 程式與您的 inf-bonbon-server 置於同一個乾淨目錄後
// 執行 node judge.js

const child_process = require("child_process");

const PROGRAM_NAME = "inf-bonbon-server";

if (process.argv.length != 2) {
    console.log("用法： node judge.js");
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

        console.log(`嘗試 ${port} 埠口`);

        let server = child_process.spawn("./inf-bonbon-server", [`${port}`]);

        let ok = true;

        server.stdout.on('data', (data) => {
            if (data.toString() == "socket fail\n") {
                console.log(`嘗試 ${port} 埠口失敗`);
                ok = false;
            }
        });

        await sleep(1000);
        
        if (ok) {
            console.log(`綁定於 ${port} 埠口`);
            return port;
        }
    }
}

async function judge() {
    const port = await run_until_port_ok();
}

judge().then();