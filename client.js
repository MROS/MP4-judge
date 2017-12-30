const net = require("net");
const readline = require("readline");
const cmd = require("./cmd.js");

const STATUS = {
    NOT_CONNECTED: 0,
    IDLE: 1,
    MATCHING: 2,
    TALKING: 3,
};

const EVENT = {
    TRY_MATCH_ACK: 0,
    MATCHED: 1,
    QUIT_FROM_MATCHING_ACK: 2,
    QUIT_FROM_TALKING_ACK: 3,
    SEND_MESSAGE_ACK: 4,
    RECV_MESSAGE: 5,
    OTHER_SIDE_QUIT: 6
};


class Client {
    constructor(port, hook) {
        this.status = STATUS.NOT_CONNECTED;
        this.socket = net.createConnection({ host: "localhost", port: port });
        this.hook = hook || {};

        this.socket.on('connect', () => { this.status = STATUS.IDLE; });
        this.buffer = "";
        this.socket.on('data', (data) => {
            this.buffer += data.toString();
        })

    }
    get_cmd() {
        return new Promise((resolve, reject) => {
            let arr = this.buffer.split("\n");
            let len = arr.length;

            if (len > 1) {
                resolve(JSON.parse(arr[0]));
                this.buffer = arr.slice(1).join("\n");
            } else {
                let callback;
                callback = (data) => {
                    arr = this.buffer.split("\n");
                    len = arr.length;
                    if (len > 1) {
                        resolve(JSON.parse(arr[0]));
                        this.buffer = arr.slice(1).join("\n");
                        this.socket.removeListener('data', callback);
                    }
                };
                this.socket.on('data', callback);
            }
        });
    }
    try_match(age, filter) {
        this.socket.write(cmd.try_match(age, filter));
    }
    async get_try_match_ack() {
        const res = await this.get_cmd();
        return res.cmd == "try_match";
    }
    async get_matched(check_fun) {
        const res = await this.get_cmd();
        return (res.cmd == "matched") && check_fun(res);
    }
}

module.exports = {
    Client,
    EVENT
}