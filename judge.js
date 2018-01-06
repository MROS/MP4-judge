
if (process.argv.length > 3) {
    console.log("用法： node judge.js [-s|--slient]");
    process.exit();
}

const { test_suites, judge } = require("./judge_base.js");

judge(test_suites).then(() => { console.log("end"); });