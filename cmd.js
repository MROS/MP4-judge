const fs = require("fs");

module.exports = {
    quit: function() {
        return JSON.stringify({
            cmd: "quit",
        }) + "\n";
    },
    try_match: function(age, filter) {
        const info = {
            cmd: "try_match",
            name: "loser",
            age: age,
            gender: "male",
            introduction: "",
            filter_function: filter 
        };
        return JSON.stringify(info) + "\n";
    },
    send_message: function(msg, count) {
        return JSON.stringify({
            cmd: "send_message",
            sequence: count,
            message: msg,
        }) + "\n";
    }
}