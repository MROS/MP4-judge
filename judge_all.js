const fs = require("fs");
const child_process = require("child_process");
const { test_suites, judge } = require("./judge_base.js");
const path = require("path");

function ZERO_REPORT(msg, id, late) {
	return {
		id: `${id}`,
		reason: msg,
		late: late,
		point: 0
	};
}

let id_list = fs.readFileSync("../student_list").toString().trim().split("\n");

// judge(test_suites).then(() => { console.log("end"); });

async function judge_id(id) {

    const repo_path = `../repos/${id}`
    console.log(`開始測試 ${repo_path}`);

    let last_commit_str;
    try {
        last_commit_str = child_process.execSync(`git --git-dir ${repo_path}/.git log --pretty="%cd" -- MP4`).toString().split("\n")[0];
    } catch (error) {
        console.log("無法取得 git log")
        return ZERO_REPORT("無法取得 git log", id, 0);
    }

    const last_commit_date = new Date(last_commit_str);
    const due_date = new Date("2017/12/27 00:00:00");
    const MICRO_SEC_PER_DAY = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((last_commit_date - due_date) / MICRO_SEC_PER_DAY);

    console.log(`最後修改時間：${last_commit_date.toDateString()}`);

    if (diff <= 0) {
        console.log("準時交");
    } else if (diff <= 7) {
        console.log(`遲交： ${diff} 天`)
    } else if (diff > 7) {
        console.log(`遲交： ${diff} 天。0 分`)
        return ZERO_REPORT("遲交太久", id, diff);
    } else {
        console.log(`無法讀取時間`)
        return ZERO_REPORT("無法讀取時間", id, diff);
	}

    try {
        child_process.execSync(`cd ${repo_path}/MP4 && rm -f inf-bonbon-server && make`)
    } catch (error) {
        console.log("make 失敗");
        return ZERO_REPORT("make 失敗", id, diff);
    }
    console.log("make 成功");
    try {
        child_process.execSync(`rm -f inf-bonbon-server`);
        child_process.execSync(`cp ${repo_path}/MP4/inf-bonbon-server .`)
    } catch (error) {
        console.log("複製 inf-bonbon-server 失敗");
        return ZERO_REPORT("複製 inf-bonbon-server 失敗", id, diff);
    }

    console.log("複製 inf-bonbon-server 成功");

	child_process.execSync(`mkdir -p ../logs`);
	child_process.execSync(`echo "" > ../logs/${id}-stdout`);
	child_process.execSync(`echo "" > ../logs/${id}-error`);

	const tmp_log = console.log
	const tmp_error = console.error
	const std_path = path.resolve(`../logs/${id}-stdout`);
	const error_path = path.resolve(`../logs/${id}-error`);
	console.log = (data) => { fs.appendFileSync(std_path, data + "\n"); };
	console.error = (data) => { fs.appendFileSync(error_path, data + "\n"); };

	const mp4_path = path.resolve(`${repo_path}/MP4`);
	let point = await judge(test_suites, mp4_path);

	console.log = tmp_log;
	console.error = tmp_error;

    let report = ZERO_REPORT("成功", id, diff);
	report.point = point;
	return report;
}

(async function() {

    for (let id of id_list) {
		let grades = JSON.parse(fs.readFileSync("grades.json").toString());
		console.log(grades[id]);
		if (!grades[id]) {
			const report = await judge_id(id)
			grades[id] = report;
			fs.writeFileSync("grades.json", JSON.stringify(grades, null, 2));
		}
    }

})().then();
