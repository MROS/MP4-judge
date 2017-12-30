const Client = require("./client.js").Client;
const EVENT = require("./client.js").EVENT;
const filter_function = require("./filter_function.js");

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
    }
];