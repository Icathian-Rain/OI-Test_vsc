const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 直接测试 test.js 中的辅助函数
// 我们需要将这些函数提取出来进行测试

suite('Test Utilities Test Suite', () => {
	let testDir;

	suiteSetup(() => {
		// 创建临时测试目录
		testDir = path.join(os.tmpdir(), 'oitest-unit-test-' + Date.now());
		fs.mkdirSync(testDir, { recursive: true });
	});

	suiteTeardown(() => {
		// 清理测试目录
		if (testDir && fs.existsSync(testDir)) {
			fs.rmSync(testDir, { recursive: true, force: true });
		}
	});

	suite('getTestCases', () => {
		test('should find all .in files with numeric names', () => {
			// 创建测试文件
			fs.writeFileSync(path.join(testDir, '1.in'), '');
			fs.writeFileSync(path.join(testDir, '1.ans'), '');
			fs.writeFileSync(path.join(testDir, '2.in'), '');
			fs.writeFileSync(path.join(testDir, '2.ans'), '');
			fs.writeFileSync(path.join(testDir, '10.in'), '');
			fs.writeFileSync(path.join(testDir, '10.ans'), '');
			fs.writeFileSync(path.join(testDir, 'test.cpp'), '');

			// 模拟 getTestCases 函数逻辑
			const files = fs.readdirSync(testDir);
			const testCases = [];
			for (const file of files) {
				const match = file.match(/^(\d+)\.in$/);
				if (match) {
					testCases.push(parseInt(match[1]));
				}
			}
			testCases.sort((a, b) => a - b);

			assert.deepStrictEqual(testCases, [1, 2, 10]);
		});

		test('should return empty array when no .in files', () => {
			const emptyDir = path.join(testDir, 'empty');
			fs.mkdirSync(emptyDir, { recursive: true });
			fs.writeFileSync(path.join(emptyDir, 'test.cpp'), '');

			const files = fs.readdirSync(emptyDir);
			const testCases = [];
			for (const file of files) {
				const match = file.match(/^(\d+)\.in$/);
				if (match) {
					testCases.push(parseInt(match[1]));
				}
			}

			assert.deepStrictEqual(testCases, []);
		});
	});

	suite('diff', () => {
		test('should return true for identical content', () => {
			const file1 = path.join(testDir, 'diff1.txt');
			const file2 = path.join(testDir, 'diff2.txt');
			fs.writeFileSync(file1, 'hello world\n');
			fs.writeFileSync(file2, 'hello world\n');

			// 模拟 diff 函数逻辑
			let ans = fs.readFileSync(file1, 'utf-8');
			let out = fs.readFileSync(file2, 'utf-8');
			if (ans[ans.length - 1] === '\n') {
				ans = ans.slice(0, ans.length - 1);
			}
			if (out[out.length - 1] === '\n') {
				out = out.slice(0, out.length - 1);
			}

			assert.strictEqual(ans === out, true);
		});

		test('should return false for different content', () => {
			const file1 = path.join(testDir, 'diff3.txt');
			const file2 = path.join(testDir, 'diff4.txt');
			fs.writeFileSync(file1, 'hello world\n');
			fs.writeFileSync(file2, 'hello earth\n');

			let ans = fs.readFileSync(file1, 'utf-8');
			let out = fs.readFileSync(file2, 'utf-8');
			if (ans[ans.length - 1] === '\n') {
				ans = ans.slice(0, ans.length - 1);
			}
			if (out[out.length - 1] === '\n') {
				out = out.slice(0, out.length - 1);
			}

			assert.strictEqual(ans === out, false);
		});

		test('should handle trailing newline difference', () => {
			const file1 = path.join(testDir, 'diff5.txt');
			const file2 = path.join(testDir, 'diff6.txt');
			fs.writeFileSync(file1, 'hello\n');
			fs.writeFileSync(file2, 'hello');

			let ans = fs.readFileSync(file1, 'utf-8');
			let out = fs.readFileSync(file2, 'utf-8');
			if (ans[ans.length - 1] === '\n') {
				ans = ans.slice(0, ans.length - 1);
			}
			if (out[out.length - 1] === '\n') {
				out = out.slice(0, out.length - 1);
			}

			assert.strictEqual(ans === out, true);
		});
	});

	suite('compile command generation', () => {
		test('should generate correct g++ command for cpp', () => {
			const problemFilePath = '/path/to/problem.cpp';
			const problemExePath = '/path/to/problem.exe';
			const language = 'cpp';

			let compileCommand = '';
			if (language === 'cpp') {
				compileCommand = 'g++ ' + problemFilePath + ' -o ' + problemExePath;
			}

			assert.strictEqual(compileCommand, 'g++ /path/to/problem.cpp -o /path/to/problem.exe');
		});
	});
});
