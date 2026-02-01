const vscode = require('vscode');
const fs = require("fs");
const path = require("path");
const { execSync } = require('child_process');

/**
 * 
 * @param {string} problemFilePath 
 * @param {string} problemExePath 
 * @param {string} language 
 * @returns {boolean | string} bool or error info
 */
function compile(problemFilePath, problemExePath, language) {
	let compileCommand = "";
	if (language === "cpp") {
		compileCommand = "g++ " + problemFilePath + " -o " + problemExePath;
	} else {
		return "Language not supported!";
	}
	try {
		execSync(compileCommand);
	} catch (error) {
        console.log("ERROR");
		let error_info = error.stderr.toString();
		return error_info;
	}
	return true;
}
/**
 * 
 * @param {string} problemExePath 
 * @param {string} inputFilePath 输入文件路径
 * @param {string} outputFilePath 输出文件路径
 * @returns {boolean | string} bool or error info
 */
function exec(problemExePath, inputFilePath, outputFilePath) {
	let execCommand = problemExePath + " < " + inputFilePath + " > " + outputFilePath;
	try {
		execSync(execCommand);
	} catch (error) {
		let error_info = error.stdout.toString();
		return error_info;
	}
	return true;
}

/**
 * 
 * @param {string} ans_file 答案文件
 * @param {string} out_file 输出文件
 * @returns {boolean} 是否相同
 */
function diff(ans_file, out_file) {
	let ans = fs.readFileSync(ans_file, "utf-8");
	let out = fs.readFileSync(out_file, "utf-8");
	// 去除结尾回车
	if (ans[ans.length - 1] === '\n') {
		ans = ans.slice(0, ans.length - 1);
	}
	if (out[out.length - 1] === '\n') {
		out = out.slice(0, out.length - 1);
	}
	fs.writeFileSync(ans_file, ans);
	fs.writeFileSync(out_file, out);
	// 对比
	if (ans === out) {
		return true;
	}
	else {
		return false;
	}
}


/**
 * 获取题目文件夹中的所有测试用例
 * @param {string} problemFolderPath 题目文件夹路径
 * @returns {number[]} 测试用例编号数组
 */
function getTestCases(problemFolderPath) {
	const files = fs.readdirSync(problemFolderPath);
	const testCases = [];
	for (const file of files) {
		const match = file.match(/^(\d+)\.in$/);
		if (match) {
			testCases.push(parseInt(match[1]));
		}
	}
	return testCases.sort((a, b) => a - b);
}

/**
 * 运行单个测试用例
 * @param {string} problemExePath 可执行文件路径
 * @param {string} problemFolderPath 题目文件夹路径
 * @param {number} caseNum 测试用例编号
 * @returns {{status: string, caseNum: number, message?: string}} 测试结果
 */
function runTestCase(problemExePath, problemFolderPath, caseNum) {
	const inputFilePath = path.join(problemFolderPath, caseNum + ".in");
	const outputFilePath = path.join(problemFolderPath, caseNum + ".out");
	const answerFilePath = path.join(problemFolderPath, caseNum + ".ans");

	if (!fs.existsSync(inputFilePath)) {
		return { status: "skip", caseNum, message: "输入文件不存在" };
	}
	if (!fs.existsSync(answerFilePath)) {
		return { status: "skip", caseNum, message: "答案文件不存在" };
	}

	// 运行程序
	const execResult = exec(problemExePath, inputFilePath, outputFilePath);
	if (execResult !== true) {
		return { status: "RE", caseNum, message: execResult };
	}

	// 对比答案
	const diffResult = diff(answerFilePath, outputFilePath);
	if (diffResult) {
		return { status: "AC", caseNum };
	} else {
		return { status: "WA", caseNum, answerFilePath, outputFilePath };
	}
}


function testProblem() {
	// 获取当前打开的文件
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        vscode.window.showErrorMessage("Please open a file!");
        return;
    }
    let fileName = editor.document.fileName;
    let problemID = path.basename(fileName, path.extname(fileName));
    console.log(problemID);
    let workFolder = vscode.workspace.getConfiguration("oitest").get("workFolder");
    let language = vscode.workspace.getConfiguration("oitest").get("language");

    if (problemID === undefined) {
        vscode.window.showErrorMessage("Please input a problem ID!");
        return;
    }
    // 获取当前打开的文件夹
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Please open a folder!");
        return;
    }
    let folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    // 进入工作文件夹
    let workFolderPath = path.join(folderPath, workFolder);
    if (!fs.existsSync(workFolderPath)) {
        vscode.window.showErrorMessage("Work folder not found!");
        return;
    }
    // 进入题目文件夹
    let problemFolderPath = path.join(workFolderPath, problemID);
    if (!fs.existsSync(problemFolderPath)) {
        vscode.window.showErrorMessage("Problem folder not found!");
        return;
    }
    let problemFilePath = ""
    if (language === "cpp") {
        problemFilePath = path.join(problemFolderPath, problemID + ".cpp");
    }
    else {
        vscode.window.showErrorMessage("Language not supported!");
        return;
    }
    let problemExePath = path.join(problemFolderPath, problemID + ".exe");
    if (!fs.existsSync(problemFilePath)) {
        vscode.window.showErrorMessage("Problem file not found!");
        return;
    }
    // 编译题目文件
    let ret = compile(problemFilePath, problemExePath, language);
    if (ret !== true) {
        vscode.window.showErrorMessage(ret);
        return;
    }

    // 获取所有测试用例
    const testCases = getTestCases(problemFolderPath);
    if (testCases.length === 0) {
        vscode.window.showErrorMessage("No test cases found!");
        return;
    }

    // 运行所有测试用例
    const results = [];
    for (const caseNum of testCases) {
        const result = runTestCase(problemExePath, problemFolderPath, caseNum);
        results.push(result);
    }

    // 统计结果
    const acCount = results.filter(r => r.status === "AC").length;
    const waCount = results.filter(r => r.status === "WA").length;
    const reCount = results.filter(r => r.status === "RE").length;
    const total = results.length;

    // 显示结果
    if (acCount === total) {
        vscode.window.showInformationMessage(`All Accepted! (${acCount}/${total})`);
    } else {
        const failedCase = results.find(r => r.status === "WA" || r.status === "RE");
        let message = `测试结果: AC=${acCount}, WA=${waCount}, RE=${reCount} (${total} cases)`;
        vscode.window.showErrorMessage(message, "show diff").then(value => {
            if (value === "show diff" && failedCase && failedCase.status === "WA") {
                let terminal = undefined;
                vscode.window.terminals.forEach(element => {
                    if (element.name === "diff") {
                        terminal = element;
                    }
                });
                if (terminal === undefined) {
                    terminal = vscode.window.createTerminal("diff");
                }
                terminal.show();
                let diffCommand = vscode.workspace.getConfiguration("oitest").get("diffCommand");
                terminal.sendText(diffCommand + " " + failedCase.answerFilePath + " " + failedCase.outputFilePath);
            }
        });
    }
}

module.exports = {
    testProblem
}