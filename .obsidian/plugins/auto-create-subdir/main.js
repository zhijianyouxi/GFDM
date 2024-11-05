const { Plugin } = require('obsidian');
const { Notice } = require('obsidian');

const fs = require('fs');
const path = require('path');

module.exports = class AutoCreateSubdirPlugin extends Plugin {
    onload() {
        this.addCommand({
            id: 'create-subdir-and-file',
            name: 'Create Subdirectory and File',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) return;

                const fileName = this.app.vault.getAbstractFileByPath(activeFile.path).path;
                const currentDir = path.dirname(fileName);

                // 根据文件名中的子字符串决定新文件的名称
                if (fileName.includes('项目说明')) {
                    const subVersionDirName = '9.0.0.1'; // 创建版本任务路径

                    // 创建版本任务路径
                    const subVersionPath = `${currentDir}/${subVersionDirName}`;
                    await this.app.vault.createFolder(subVersionPath);
                    
                    // 创建版本说明文档
                    const subVersionFile = '版本说明.md'; // 创建版本说明文档
                    const versionFilePath = `${subVersionPath}/${subVersionFile}`;
                    await this.app.vault.create(versionFilePath, '# 版本说明\n1.版本说明\n\n2.版本说明');

                    // 创建版本开发子任务目录
                    const subVersionTask= '版本任务1';
                    const subVersionTaskPath = `${subVersionPath}/${subVersionTask}`;
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
                    
                    const processContent = `
|案例名称|重要级别(高/中/低)|操作步骤|预期结果|测试结果|是否完成|
| -------- | ------- |------- |------- |------- |------- |
| 案例1  | 高 |1.打开软件|1.io口设置为1|未测试|未完成|
`;
    
                    const deviceContent = `
|案例名称|重要级别(高/中/低)|操作步骤|预期结果|测试结果|是否完成|
| -------- | ------- |------- |------- |------- |------- |
| 案例1  | 高 |1.打开软件|1.io口设置为1|未测试|未完成|
`;
                    
                    const tableContentHead = '# 测试案例\n\n'
                    const tableContentTest1 = '# 单元测试案例\n\n'
                    const tableContentTest2 = '# 流程测试案例\n\n'
                    const tableContentTest3 = '# 测试件测试案例\n\n'
                    const tableContentTail = `\n\n需求详见[需求文档](./${subRequirementFile})`
    
                    const unitTestCheck = `
- [ ] 单元测试任务是否完成
`;
    
                    const processTestCheck = `
- [ ] 流程测试任务是否完成
`;
    
                    const deviceTestCheck = `
- [ ] 测试件任务是否完成
`;
                    
                    // 创建测试案例
                    await this.app.vault.create(testFilePath, tableContentHead + tableContentTest1 + tableContent.trim() + '\n\n' + unitTestCheck.trim() + '\n\n'+  tableContentTest2  + processContent.trim() + '\n\n' + processTestCheck.trim() + '\n\n' + tableContentTest3 +  deviceContent.trim() + '\n\n' + deviceTestCheck.trim() + '\n\n' + tableContentTail);

                } else {
                    new Notice(`请选中项目说明文档，然后创建项目的版本任务`);
                }
            }
        });
    }
};
