const Client = require("../client.js").Client;
const EVENT = require("../client.js").EVENT;
const filter_function = require("../filter_function.js");
const util = require("../util.js");
const child_process = require("child_process");

module.exports = [
    {
        time_limit: 90,
        name: "十個總是 crash，兩個匹配",
        func: async function (port) {
            const clients = [];
            for (let i = 0; i < 10; i++) {
                const client = new Client(port);
                client.try_match(0, filter_function.crash_between(0, 100));
                await client.get_try_match_ack();
                clients.push(client);
            }
            const client_1 = new Client(port);
            client_1.try_match(1, filter_function.always_true);
            await client_1.get_try_match_ack();

            const client_2 = new Client(port);
            client_2.try_match(2, filter_function.always_true);
            await client_2.get_try_match_ack();

            let ok = true;
            ok = ok && (await client_1.get_matched((cmd) => cmd.age == 2));
            ok = ok && (await client_2.get_matched((cmd) => cmd.age == 1));

            client_1.close()
            client_2.close()
            clients.forEach((client) => client.close())
            return ok;
        },
    },
];
