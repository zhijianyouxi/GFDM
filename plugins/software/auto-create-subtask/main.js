const { Plugin } = require('obsidian');
const { Notice } = require('obsidian');

const fs = require('fs');
const path = require('path');

module.exports = class AutoCreateSubtaskPlugin extends Plugin {
    onload() {
        this.addCommand({
            id: 'create-subtask-and-file',
            name: 'Create Subtask and File',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) return;

                const fileName = this.app.vault.getAbstractFileByPath(activeFile.path).path;
                const currentDir = path.dirname(fileName);

                // 根据文件名中的子字符串决定新文件的名称
                if (fileName.includes('版本说明')) {

                    // 创建版本开发子任务目录
                    const subVersionTask= '版本任务1';
                    const subVersionTaskPath = `${currentDir}/${subVersionTask}`;
                    await this.app.vault.createFolder(subVersionTaskPath);

                    // 创建版本测试文档
                    const subTestFile = '测试案例.md'; // 创建版本测试报告
                    const testFilePath = `${subVersionTaskPath}/${subTestFile}`;
                    
                    // 创建版本需求文档
                    const subRequirementFile = '需求文档.md'; // 创建版本需求文档
                    const requirementFilePath = `${subVersionTaskPath}/${subRequirementFile}`;
                    const requirementFileContent = `# 需求文档\n\n1.需求1\n2.需求2\n\n测试报告详见[测试案例](./${subTestFile})`
                    await this.app.vault.create(requirementFilePath, requirementFileContent);

                    const tableContent = `
|案例名称|重要级别(高/中/低)|操作步骤|预期结果|测试结果|是否完成|
| -------- | ------- |------- |------- |------- |------- |
| 案例1  | 高 |1.打开软件|1.io口设置为1|未测试|未完成|
`;
				
                    const tableContentHead = '# 测试报告\n\n'
                    const tableContentTest1 = '# 单元测试案例\n\n'
                    const tableContentTest2 = '# 流程测试案例\n\n'
                    const tableContentTest3 = '# 测试件测试案例\n\n'
                    // const tableContentTail = '\n\n需求详见[[`${requirementFilePath}`]]'

                    const unitTestCheck = `
- [ ] 单元测试任务是否完成
`;

                    const processTestCheck = `
- [ ] 流程测试任务是否完成
`;

                    const deviceTestCheck = `
- [ ] 测试件任务是否完成
`;

                    await this.app.vault.create(testFilePath, tableContentHead + tableContentTest1 + tableContent.trim() + '\n\n' + unitTestCheck.trim() + '\n\n' + tableContentTest2 + tableContent.trim() + '\n\n' + processTestCheck.trim() + '\n\n' + tableContentTest3 + tableContent.trim() + '\n\n' + deviceTestCheck.trim());
                
                } else {
                    new Notice(`请选中项目说明文档，然后创建项目的版本任务: ${newFileName}`);
                }
            }
        });
    }
};
