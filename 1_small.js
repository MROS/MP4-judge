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
    // 兩人 try_match 能夠配對成功
    async function(port) {
        const client_1 = new Client(port);
        const client_2 = new Client(port);
        client_1.try_match(1, filter_function.always_true);
        client_2.try_match(2, filter_function.always_true);
        let ok = true;
        ok = ok && (await client_1.get_try_match_ack());
        ok = ok && (await client_2.get_try_match_ack());
        if (!ok) {
            return false;
        }
        ok = ok && (await client_1.get_matched((cmd) => cmd.age == 2));
        ok = ok && (await client_2.get_matched((cmd) => cmd.age == 1));
        return ok;
    }
];