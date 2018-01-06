const Client = require("../client.js").Client;
const EVENT = require("../client.js").EVENT;
const filter_function = require("../filter_function.js");
const util = require("../util.js");
const randomstring = require("randomstring");

module.exports = [
    {
        name: "700 上線後、350 人下線、350 人上線、5 人忙碌匹配、傳 100 訊息",
        func: async function (port) {
            const clients = [];
            const NUMBER = 350;
            for (let i = 0; i < NUMBER * 2; i++) {
                const client = new Client(port);
                clients.push(client);
                client.try_match(i, filter_function.always_true);
                await client.get_try_match_ack();
            }
            let promises = [];
            for (let i = 0; i < NUMBER * 2; i++) {
                const p = clients[i].get_matched((cmd) => cmd.age == ((i % 2 == 0) ? i + 1 : i - 1));
                promises.push(p);
            }
            let ok = util.all_true(await Promise.all(promises));
            if (!ok) { return false; }
            console.log(`前 ${NUMBER * 2} 位匹配完成`);

            // 一半的人斷線
            console.log("一半的人斷線");
            for (let i = 0; i < NUMBER; i++) {
                clients[2 * i].close();
            }
            for (let i = 0; i < NUMBER; i++) {
                await clients[2 * i + 1].get_other_side_quit();
            }
            console.log("全數收到對方斷線");
            for (let i = 0; i < NUMBER; i++) {
                clients[2 * i] = new Client(port);
            }
            for (let i = 0; i < NUMBER * 2; i++) {
                clients[i].try_match(i, filter_function.always_true);
                await clients[i].get_try_match_ack();
            }
            promises = [];
            for (let i = 0; i < NUMBER * 2; i++) {
                const p = clients[i].get_matched((cmd) => cmd.age == ((i % 2 == 0) ? i + 1 : i - 1));
                promises.push(p);
            }
            ok = util.all_true(await Promise.all(promises));
            if (!ok) { return false; }
            console.log(`前 ${NUMBER * 2} 位再次匹配完成`);


            const busy_clients = []
            for (let i = 0; i < 5; i++) {
                const client = new Client(port);
                busy_clients.push(client);
                client.try_match(0, filter_function.busy_then_false(1e10));
                await client.get_try_match_ack();
            }

            promises = [];

            const p = new Promise(function (resolve, reject) {

                console.log("開始傳送訊息");
                setTimeout(function () { resolve(false); }, 2000);

                for (let i = 0; i < 100; i++) {
                    const str = randomstring.generate(1000);
                    clients[2 * i].send_message(str);
                    let p = clients[2 * i + 1].get_recv_message((cmd) => cmd.message == str);
                    promises.push(p);
                }

                Promise.all(promises).then((res) => {
                    resolve(util.all_true(res))
                });

            });

            const res = await p

            busy_clients.forEach((c) => c.close());
            clients.forEach((c) => c.close());

            return res;

        },
    },
];
