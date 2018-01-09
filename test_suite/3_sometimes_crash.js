const Client = require("../client.js").Client;
const EVENT = require("../client.js").EVENT;
const filter_function = require("../filter_function.js");
const util = require("../util.js");
const child_process = require("child_process");

module.exports = [
    {
        time_limit: 90,
        name: "偶爾 crash，偶爾匹配",
        func: async function (port) {
            const clients = [];
            for (let i = 0; i < 10; i++) {
                const client = new Client(port);
                client.try_match(i, filter_function.crash_between(0, 100));
                await client.get_try_match_ack();
                clients.push(client);
            }
            const client = new Client(port);
            client.try_match(200, filter_function.always_true);
            await client.get_try_match_ack();


            let ok = true;
            ok = ok && (await client.get_matched((cmd) => cmd.age == 0));
            ok = ok && (await clients[0].get_matched((cmd) => cmd.age == 200))

            client.close()
            clients.forEach((client) => client.close())
            return ok;
        },
    }
];
