const fs = require("fs");
const child_process = require("child_process");
const { test_suites, judge } = require("./judge_base.js");

function ZERO_REPORT(msg, id, late) {
	return {
		id: `${id}`,
		reason: msg,
		late: late,
	};
}

let id_list = fs.readFileSync("../student_list").toString().trim().split("\n");

// judge(test_suites).then(() => { console.log("end"); });

stdout = console.log;

async function judge_id(id) {

    const repo_path = `../repos/${id}`
    stdout(`開始測試 ${repo_path}`);

    let last_commit_str;
    try {
        last_commit_str = child_process.execSync(`git --git-dir ${repo_path}/.git log --pretty="%cd" -- MP4`).toString().split("\n")[0];
    } catch (error) {
        stdout("無法取得 git log")
        return ZERO_REPORT("無法取得 git log", id, 0);
    }

    const last_commit_date = new Date(last_commit_str);
    const due_date = new Date("2017/12/27 00:00:00");
    const MICRO_SEC_PER_DAY = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((last_commit_date - due_date) / MICRO_SEC_PER_DAY);

    stdout(`最後修改時間：${last_commit_date.toDateString()}`);

    if (diff <= 0) {
        stdout("準時交");
    } else if (diff <= 7) {
        stdout(`遲交： ${diff} 天`)
    } else {
        stdout(`遲交： ${diff} 天。0 分`)
    }

    try {
        child_process.execSync(`cd ${repo_path}/MP4 && rm inf-bonbon-server && make`)
    } catch (error) {
        stdout("make 失敗");
        return ZERO_REPORT("make 失敗", id, diff);
    }
    stdout("make 成功");
    try {
        child_process.execSync(`rm -f inf-bonbon-server`);
        child_process.execSync(`cp ${repo_path}/MP4/inf-bonbon-server .`)
    } catch (error) {
        stdout("複製 inf-bonbon-server 失敗");
        return ZERO_REPORT("複製 inf-bonbon-server 失敗", id, diff);
    }
    stdout("複製 inf-bonbon-server 成功");
    return ZERO_REPORT("成功", id, diff);
}

(async function() {
    const log = [];
    for (let id of id_list) {
        const report = await judge_id(id)
        log.push(report);
    }

    console.log(JSON.stringify(log, null, 2));

})().then();