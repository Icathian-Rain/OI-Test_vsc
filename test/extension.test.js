const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const os = require('os');

suite('OITest Extension Test Suite', () => {
	let testWorkspace;

	suiteSetup(async () => {
		// 创建临时测试工作区
		testWorkspace = path.join(os.tmpdir(), 'oitest-test-' + Date.now());
		fs.mkdirSync(testWorkspace, { recursive: true });

		// 创建 pattern.cpp 模板文件
		const patternContent = `#include <iostream>
using namespace std;

int main() {
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

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('Icathian-Rain.oitest'));
	});

	test('Extension should activate', async () => {
		const ext = vscode.extensions.getExtension('Icathian-Rain.oitest');
		await ext.activate();
		assert.ok(ext.isActive);
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('oitest.newProblem'));
		assert.ok(commands.includes('oitest.testProblem'));
	});
});
