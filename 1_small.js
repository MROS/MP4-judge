const Client = require("./client.js").Client;
const EVENT = require("./client.js").EVENT;
const filter_function = require("./filter_function.js");
const util = require("./util.js");

module.exports = [
    // try_match 會回 ack
    async function(port) {
        const client = new Client(port);
        client.try_match(0, filter_function.always_true);
        return (await client.get_try_match_ack());
    },
    // 1. 兩人 try_match 能夠配對
    // 2. 互傳訊息
    // 3. 其中一人離去
    async function(port) {
        const client_1 = new Client(port);
        const client_2 = new Client(port);
        client_1.try_match(1, filter_function.always_true);
        client_2.try_match(2, filter_function.always_true);
        let ok = true;
        ok = ok && (await client_1.get_try_match_ack());
        ok = ok && (await client_2.get_try_match_ack());
        if (!ok) { return false; }

        ok = ok && (await client_1.get_matched((cmd) => cmd.age == 2));
        ok = ok && (await client_2.get_matched((cmd) => cmd.age == 1));
        if (!ok) { return false; }

        // 已配對，開始傳訊息
        const msg_1 = "1111111111";
        client_1.send_message(msg_1);

        ok = ok && (await client_1.get_send_message_ack((cmd) => cmd.message == msg_1));
        ok = ok && (await client_2.get_recv_message((cmd) => cmd.message == msg_1));
        if (!ok) { return false; }

        const msg_2 = "2222222222";
        client_2.send_message(msg_2);
        ok = ok && (await client_2.get_send_message_ack((cmd) => cmd.message == msg_2));
        ok = ok && (await client_1.get_recv_message((cmd) => cmd.message == msg_2));
        if (!ok) { return false; }

        // // 一人離開
        client_1.quit();
        ok = ok && (await client_1.get_quit_ack());
        ok = ok && (await client_2.get_other_side_quit());

        return ok;
    },
    // 三人匹配，1 應與 3 配對
    async function (port) {
        console.log("測資：三人匹配，1 應與 3 配對");
        const client_1 = new Client(port);
        const client_2 = new Client(port);
        const client_3 = new Client(port);

        let ok = true;
        client_1.try_match(1, filter_function.always_true);
        ok = ok && (await client_1.get_try_match_ack());

        client_2.try_match(2, filter_function.always_false);
        ok = ok && (await client_2.get_try_match_ack());

        client_3.try_match(3, filter_function.always_true);
        ok = ok && (await client_3.get_try_match_ack());

        if (!ok) { return false; }

        ok = ok && (await client_1.get_matched((cmd) => cmd.age == 3));
        if (!ok) { return false; }

        ok = ok && (await client_3.get_matched((cmd) => cmd.age == 1));

        return ok;
    },
    // 連續十人匹配
    async function(port) {
        console.log("連續十人匹配");
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
    async function(port) {
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
    }
];