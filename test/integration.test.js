const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

suite('Integration Test Suite', () => {
	let testWorkspace;
	let workFolder = 'Luogu';

	suiteSetup(() => {
		// 创建临时测试工作区
		testWorkspace = path.join(os.tmpdir(), 'oitest-integration-' + Date.now());
		fs.mkdirSync(testWorkspace, { recursive: true });

		// 创建 pattern.cpp 模板文件
		const patternContent = `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`;
		fs.writeFileSync(path.join(testWorkspace, 'pattern.cpp'), patternContent);
	});

	suiteTeardown(() => {
		// 清理测试工作区
		if (testWorkspace && fs.existsSync(testWorkspace)) {
			fs.rmSync(testWorkspace, { recursive: true, force: true });
		}
	});

	suite('Problem Folder Structure', () => {
		test('should create correct folder structure for new problem', () => {
			const problemID = 'P1001';
			const workFolderPath = path.join(testWorkspace, workFolder);
			const problemFolderPath = path.join(workFolderPath, problemID);

			// 模拟 newProblem 创建文件夹结构
			fs.mkdirSync(workFolderPath, { recursive: true });
			fs.mkdirSync(problemFolderPath, { recursive: true });

			// 创建代码文件
			const patternContent = fs.readFileSync(path.join(testWorkspace, 'pattern.cpp'), 'utf-8');
			const codeContent = `// @oitest id=${problemID} lang=cpp\n${patternContent}\n// @oitest code=end\n`;
			fs.writeFileSync(path.join(problemFolderPath, `${problemID}.cpp`), codeContent);

			// 创建测试用例文件
			fs.writeFileSync(path.join(problemFolderPath, '1.in'), '');
			fs.writeFileSync(path.join(problemFolderPath, '1.ans'), '');

			// 验证文件结构
			assert.ok(fs.existsSync(problemFolderPath));
			assert.ok(fs.existsSync(path.join(problemFolderPath, `${problemID}.cpp`)));
			assert.ok(fs.existsSync(path.join(problemFolderPath, '1.in')));
			assert.ok(fs.existsSync(path.join(problemFolderPath, '1.ans')));
		});

		test('should support multiple test cases', () => {
			const problemID = 'P1002';
			const problemFolderPath = path.join(testWorkspace, workFolder, problemID);
			fs.mkdirSync(problemFolderPath, { recursive: true });

			// 创建多组测试用例
			fs.writeFileSync(path.join(problemFolderPath, '1.in'), '1 2\n');
			fs.writeFileSync(path.join(problemFolderPath, '1.ans'), '3\n');
			fs.writeFileSync(path.join(problemFolderPath, '2.in'), '10 20\n');
			fs.writeFileSync(path.join(problemFolderPath, '2.ans'), '30\n');
			fs.writeFileSync(path.join(problemFolderPath, '3.in'), '100 200\n');
			fs.writeFileSync(path.join(problemFolderPath, '3.ans'), '300\n');

			// 获取测试用例
			const files = fs.readdirSync(problemFolderPath);
			const testCases = [];
			for (const file of files) {
				const match = file.match(/^(\d+)\.in$/);
				if (match) {
					testCases.push(parseInt(match[1]));
				}
			}
			testCases.sort((a, b) => a - b);

			assert.deepStrictEqual(testCases, [1, 2, 3]);
		});
	});

	suite('Compile and Run', () => {
		test('should compile cpp file successfully', function() {
			this.timeout(10000); // 增加超时时间
			// 跳过如果没有 g++
			try {
				execSync('g++ --version', { stdio: 'ignore' });
			} catch (e) {
				this.skip();
				return;
			}

			const problemID = 'P1003';
			const problemFolderPath = path.join(testWorkspace, workFolder, problemID);
			fs.mkdirSync(problemFolderPath, { recursive: true });

			// 创建简单的 C++ 程序
			const cppContent = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`;
			const cppPath = path.join(problemFolderPath, `${problemID}.cpp`);
			const exePath = path.join(problemFolderPath, `${problemID}.exe`);
			fs.writeFileSync(cppPath, cppContent);

			// 编译
			try {
				execSync(`g++ "${cppPath}" -o "${exePath}"`);
				assert.ok(fs.existsSync(exePath));
			} catch (error) {
				assert.fail('Compilation failed: ' + error.message);
			}
		});

		test('should run program and compare output correctly', function() {
			this.timeout(10000); // 增加超时时间
			// 跳过如果没有 g++
			try {
				execSync('g++ --version', { stdio: 'ignore' });
			} catch (e) {
				this.skip();
				return;
			}

			const problemID = 'P1004';
			const problemFolderPath = path.join(testWorkspace, workFolder, problemID);
			fs.mkdirSync(problemFolderPath, { recursive: true });

			// 创建程序
			const cppContent = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`;
			const cppPath = path.join(problemFolderPath, `${problemID}.cpp`);
			const exePath = path.join(problemFolderPath, `${problemID}.exe`);
			fs.writeFileSync(cppPath, cppContent);

			// 创建测试用例
			fs.writeFileSync(path.join(problemFolderPath, '1.in'), '1 2\n');
			fs.writeFileSync(path.join(problemFolderPath, '1.ans'), '3\n');

			// 编译
			execSync(`g++ "${cppPath}" -o "${exePath}"`);

			// 运行
			const inputPath = path.join(problemFolderPath, '1.in');
			const outputPath = path.join(problemFolderPath, '1.out');
			execSync(`"${exePath}" < "${inputPath}" > "${outputPath}"`);

			// 比较结果
			let ans = fs.readFileSync(path.join(problemFolderPath, '1.ans'), 'utf-8');
			let out = fs.readFileSync(outputPath, 'utf-8');

			// 规范化换行符（处理 Windows \r\n）
			ans = ans.replace(/\r\n/g, '\n').trim();
			out = out.replace(/\r\n/g, '\n').trim();

			assert.strictEqual(ans, out);
		});

		test('should detect wrong answer', function() {
			// 跳过如果没有 g++
			try {
				execSync('g++ --version', { stdio: 'ignore' });
			} catch (e) {
				this.skip();
				return;
			}

			const problemID = 'P1005';
			const problemFolderPath = path.join(testWorkspace, workFolder, problemID);
			fs.mkdirSync(problemFolderPath, { recursive: true });

			// 创建一个错误的程序（乘法而不是加法）
			const cppContent = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;  // 错误：应该是加法
    return 0;
}
`;
			const cppPath = path.join(problemFolderPath, `${problemID}.cpp`);
			const exePath = path.join(problemFolderPath, `${problemID}.exe`);
			fs.writeFileSync(cppPath, cppContent);

			// 创建测试用例（期望加法结果）
			fs.writeFileSync(path.join(problemFolderPath, '1.in'), '2 3\n');
			fs.writeFileSync(path.join(problemFolderPath, '1.ans'), '5\n');  // 2+3=5

			// 编译
			execSync(`g++ "${cppPath}" -o "${exePath}"`);

			// 运行
			const inputPath = path.join(problemFolderPath, '1.in');
			const outputPath = path.join(problemFolderPath, '1.out');
			execSync(`"${exePath}" < "${inputPath}" > "${outputPath}"`);

			// 比较结果
			let ans = fs.readFileSync(path.join(problemFolderPath, '1.ans'), 'utf-8');
			let out = fs.readFileSync(outputPath, 'utf-8');

			// 规范化换行符
			ans = ans.replace(/\r\n/g, '\n').trim();
			out = out.replace(/\r\n/g, '\n').trim();

			// 程序输出 6 (2*3)，期望 5 (2+3)，应该不相等
			assert.notStrictEqual(ans, out);
		});
	});
});
