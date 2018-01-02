const Client = require("./client.js").Client;
const EVENT = require("./client.js").EVENT;
const filter_function = require("./filter_function.js");
const util = require("./util.js");
const child_process = require("child_process");

function measure_time() {


    child_process.execSync("cp ../filter_function.c .");
    child_process.execSync("cp ../run.c .");
    child_process.execSync("gcc -O2 -fPIC -shared filter_function.c -o libfilter.so");
    child_process.execSync("gcc run.c -o runner -ldl");

    const prev = process.hrtime();
    child_process.execSync("./runner");
    const diff = process.hrtime(prev);

    const ns = diff[0] * 1e9 + diff[1];
    console.log(`單一函式耗時 ${ns / 1e9} 秒`);

    child_process.execSync("rm runner run.c filter_function.c libfilter.so");

    return ns;
}

const C = 500 * 1000 * 1000;

module.exports = [
    {
        name: "速度是否達到兩倍",
        func: async function (port) {
            const FALSE_NUMBER = 10;
            const unit_ns = measure_time();
            const estimate_ns = unit_ns * (FALSE_NUMBER * (FALSE_NUMBER + 1) / 2 + 1);

            const prev = process.hrtime();

            const client_1 = new Client(port);
            client_1.try_match(1, filter_function.always_true);
            await client_1.get_try_match_ack();

            for (let i = 0; i < FALSE_NUMBER; i++) {
                const client = (new Client(port));
                client.try_match(0, filter_function.busy_then_false(C));
                await client.get_try_match_ack();
            }

            const client_2 = new Client(port);
            client_2.try_match(2, filter_function.always_true);
            await client_2.get_try_match_ack();

            let ok = await client_1.get_matched((cmd) => cmd.age == 2);
            ok = ok && (await client_2.get_matched((cmd) => cmd.age == 1));
            if (!ok) { return false; }

            const diff = process.hrtime(prev);

            const real_ns = diff[0] * 1e9 + diff[1];
            const rate = estimate_ns / real_ns;

            console.log(`estimate: ${estimate_ns / 1e9}\nreal: ${real_ns / 1e9}`);
            console.log(`加速 ${rate} 倍`);

            if (rate < 2) {
                return false;
            } else {
                return true;
            }

        },
    }
];
