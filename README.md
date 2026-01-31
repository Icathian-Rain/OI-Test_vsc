# OITest

一个用于竞赛编程（OI/ICPC）的 VSCode 扩展，帮助你快速创建题目文件夹并测试 C++ 解决方案。

## 功能

- **新建题目**：一键创建题目文件夹，自动生成代码模板、输入文件和答案文件
- **测试题目**：编译并运行代码，自动对比输出与期望答案
- **CodeLens 支持**：在代码编辑器中直接点击"Test"按钮运行测试

## 安装

1. 在 VSCode 扩展市场搜索 `oitest`
2. 点击安装

## 使用方法

### 新建题目

1. 打开命令面板（`Ctrl+Shift+P`）
2. 输入 `newProblem` 并执行
3. 输入题目 ID（如 `P1001`）
4. 扩展会自动创建以下文件结构：
   ```
   {workFolder}/
   └── P1001/
       ├── P1001.cpp    # 代码文件（使用 pattern.cpp 模板）
       ├── P1001.in     # 测试输入
       └── P1001.ans    # 期望输出
   ```

### 测试题目

1. 打开题目的 `.cpp` 文件
2. 使用以下任一方式运行测试：
   - 点击代码末尾的 "Test" CodeLens 按钮
   - 打开命令面板执行 `testProblem`
3. 测试结果：
   - **Accepted**：输出与答案一致
   - **Wrong Answer**：可点击"show diff"查看差异

### 代码模板

在工作区根目录创建 `pattern.cpp` 文件作为代码模板，新建题目时会自动使用该模板。

## 配置

在 VSCode 设置中搜索 `oitest`：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `oitest.workFolder` | 题目文件夹名称 | `Luogu` |
| `oitest.language` | 编程语言 | `cpp` |
| `oitest.diffCommand` | 差异对比命令 | `diff` |

## 文件标记

扩展使用特殊注释标记来识别题目文件：

```cpp
// @oitest id=P1001 lang=cpp
#include <iostream>
using namespace std;

int main() {
    // your code
    return 0;
}
// @oitest code=end
```

## 环境要求

- VSCode 1.85.0 或更高版本
- g++ 编译器（需要在系统 PATH 中）

## 未来计划

### 多语言支持
- [ ] 支持 Python
- [ ] 支持 Java
- [ ] 支持 Rust

### 多测试用例
- [ ] 支持同一题目多组测试数据（如 `1.in`、`2.in`、`3.in`）
- [ ] 批量运行所有测试用例并汇总结果

### OJ 平台集成
- [ ] 从洛谷自动获取题目信息和样例数据
- [ ] 支持 Codeforces 题目导入
- [ ] 支持 AtCoder 题目导入

### 测试增强
- [ ] 添加运行超时检测（TLE）
- [ ] 显示程序运行时间
- [ ] 显示内存使用情况
- [ ] 支持 Special Judge（自定义评测器）

### 编译选项
- [ ] 支持自定义编译参数（如 `-O2`、`-std=c++17`）
- [ ] 支持调试模式编译（`-g`、`-fsanitize=address`）

### 用户体验
- [ ] 添加侧边栏面板显示题目列表
- [ ] 支持快捷键绑定
- [ ] 测试结果高亮显示差异位置

## 许可证

MIT
