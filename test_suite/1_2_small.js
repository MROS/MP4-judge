const Client = require("../client.js").Client;
const EVENT = require("../client.js").EVENT;
const filter_function = require("../filter_function.js");
const util = require("../util.js");

module.exports = [
    {
        name: "連續十人匹配，總是匹配",
        func: async function (port) {
            const clients = [];
            for (let i = 0; i < 10; i++) {
                const client = new Client(port);
                client.try_match(i, filter_function.always_true);
                await client.get_try_match_ack();
                clients.push(client);
            }
            let promises = [];
            for (let i = 0; i < 5; i++) {
                const x = i * 2;
                const y = i * 2 + 1;
                let p = clients[x].get_matched((cmd) => cmd.age == y);
                promises.push(p);
                p = clients[y].get_matched((cmd) => cmd.age == x);
                promises.push(p)
            }
            let results = await Promise.all(promises);
            return util.all_true(results);
        },
    },
    {
        name: "連續十人匹配，指定對象匹配",
        func: async function (port) {
            const clients = {};
            for (let i = 1; i <= 5; i++) {
                const client = new Client(port);
                client.try_match(i, filter_function.match_with_age(i + 100));
                await client.get_try_match_ack();
                clients[i] = client;
            }
            for (let i = 5; i >= 1; i--) {
                const client = new Client(port);
                client.try_match(i + 100, filter_function.match_with_age(i));
                await client.get_try_match_ack();
                clients[i + 100] = client;
            }
            let promises = [];
            for (let i = 1; i <= 5; i++) {
                let p = clients[i].get_matched((cmd) => cmd.age == i + 100);
                promises.push(p);
                p = clients[i + 100].get_matched((cmd) => cmd.age == i);
                promises.push(p)
            }
            let results = await Promise.all(promises);
            return util.all_true(results);
        },
    },
    {
        name: "在配對途中送 quit",
        func: async function (port) {
            const false_client_1 = new Client(port);
            false_client_1.try_match(1, filter_function.always_true);
            await false_client_1.get_try_match_ack();

            const false_client_2 = new Client(port);
            false_client_2.try_match(2, filter_function.busy_then_false(2e9));
            await false_client_2.get_try_match_ack();

            false_client_1.quit();
            let ok = (await false_client_1.get_quit_ack());
            if (!ok) { return false; }

            const true_client_1 = new Client(port);
            true_client_1.try_match(3, filter_function.always_true);
            await true_client_1.get_try_match_ack();

            const true_client_2 = new Client(port);
            true_client_2.try_match(4, filter_function.always_true);
            await true_client_2.get_try_match_ack();

            ok = await true_client_1.get_matched((cmd) => cmd.age == 4);
            ok = ok && true_client_2.get_matched((cmd) => cmd.age == 3);

            return ok;
        },
    },
    {
        name: "在配對失敗後送 quit",
        func: async function (port) {
            const false_client_1 = new Client(port);
            false_client_1.try_match(1, filter_function.always_true);
            await false_client_1.get_try_match_ack();

            const false_client_2 = new Client(port);
            false_client_2.try_match(2, filter_function.always_false);
            await false_client_2.get_try_match_ack();

            await util.sleep(1000);

            false_client_1.quit();
            let ok = (await false_client_1.get_quit_ack());
            if (!ok) { return false; }

            const true_client_1 = new Client(port);
            true_client_1.try_match(3, filter_function.always_true);
            await true_client_1.get_try_match_ack();

            const true_client_2 = new Client(port);
            true_client_2.try_match(4, filter_function.always_true);
            await true_client_2.get_try_match_ack();

            ok = await true_client_1.get_matched((cmd) => cmd.age == 4);
            ok = ok && true_client_2.get_matched((cmd) => cmd.age == 3);

            return ok;
        },
    },
    {
        name: "斷線後會傳 other_side_quit",
        func: async function (port) {
            const client_1 = new Client(port);
            client_1.try_match(1, filter_function.always_true);
            await client_1.get_try_match_ack();

            const client_2 = new Client(port);
            client_2.try_match(2, filter_function.always_true);
            await client_2.get_try_match_ack();

            await client_1.get_matched((cmd) => cmd.age == 2);
            await client_2.get_matched((cmd) => cmd.age == 1);

            client_1.close();

            let ok = await client_2.get_other_side_quit();

            return ok;
        },
    },
    {
        name: "斷線後換人上",
        func: async function (port) {
            const client_1 = new Client(port);
            client_1.try_match(1, filter_function.always_true);
            await client_1.get_try_match_ack();

            const client_2 = new Client(port);
            client_2.try_match(2, filter_function.busy_then_false(2e9));
            await client_2.get_try_match_ack();

            client_2.close();

            const client_3 = new Client(port);
            client_3.try_match(3, filter_function.always_true);
            await client_3.get_try_match_ack();

            let ok = (await client_1.get_matched((cmd) => cmd.age == 3));
            ok = ok && (await client_3.get_matched((cmd) => cmd.age == 1));

            return ok;
        },
    }
];
