const Client = require("./client.js").Client;

const client = new Client(9898);

async function main() {
    while (true) {
        const cmd = (await client.get_cmd());
        console.log(cmd);
    }
}

main();