const argv = require('minimist')(process.argv.slice(2));

const { test_suites, judge } = require("./judge_base.js");

if (argv["dir"]) {
	judge(test_suites, argv["dir"]).then(() => { console.log("end"); });
} else {
	judge(test_suites).then(() => { console.log("end"); });
}
