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

                    const xuqiuDoc = `系统设计文档.md`;
                    const xuqiuDocPath = `${subVersionTaskPath}/${xuqiuDoc}`;

                    await this.createSystemDesignDoc(xuqiuDocPath);
                    // await this.createTestDoc(subVersionTaskPath);

                } else {
                    new Notice(`请选中项目说明文档，然后创建项目的版本任务: ${newFileName}`);
                }
            }
        });
    }

    async createSystemDesignDoc(filePath) {
        const contentHead = '\n'
        const content1 = '# 需求收集\n\n'
        const content1_1 = '功能需求\n\n 1. 需求1\n\n'
        const content1_2 = '非功能需求\n\n 1. 需求1\n\n'
        const content1_3 = '用户场景\n\n 1. 场景1\n\n\n\n'
        const content2 = '# 系统用例\n\n 1. 用例1\n\n\n\n'
        const content2_1 = '# 系统架构\n\n 1. 模块说明1\n\n'
        const fileCheck1 = `
- [ ] 需求收集是否完成
`;
        const fileCheck2 = `
- [ ] 系统用例是否完成
`;
        const fileCheck3 = `
- [ ] 系统架构是否完成
`;
    
        const content = contentHead + content1 + content1_1 + content1_2 + content1_3 + 
                       content2 + content2_1 + '\n\n\n' + 
                       fileCheck1.trim() + '\n\n' + 
                       fileCheck2.trim() + '\n\n' + 
                       fileCheck3.trim();
    
        await this.app.vault.create(filePath, content);
    }

    async createTestDoc(subVersionTaskPath) {
        // 创建版本需求文档
        const subRequirementFile = '需求文档.md';
        const requirementFilePath = `${subVersionTaskPath}/${subRequirementFile}`;
    
         // 创建版本测试文档
        const subTestFile = '测试案例.md';
        const testFilePath = `${subVersionTaskPath}/${subTestFile}`;
    
        const requirementFileContent = `# 需求文档\n\n1.需求1\n2.需求2\n\n测试报告详见[测试案例](./${subTestFile})`
        await this.app.vault.create(requirementFilePath, requirementFileContent);
    
        const tableContent = `
|案例名称|重要级别(高/中/低)|操作步骤|预期结果|测试结果|是否完成|
| -------- | ------- |------- |------- |------- |------- |
| 案例1  | 高 |1.打开软件|1.io口设置为1|未测试|未完成|
`;
    
        const tableContentHead = '# 测试报告\n\n';
        const tableContentTest1 = '# 单元测试案例\n\n';
        const tableContentTest2 = '# 流程测试案例\n\n';
        const tableContentTest3 = '# 测试件测试案例\n\n';
    
        const unitTestCheck = `
- [ ] 单元测试任务是否完成
`;
    
        const processTestCheck = `
- [ ] 流程测试任务是否完成
`;
    
        const deviceTestCheck = `
- [ ] 测试件任务是否完成
`;
    
        const content = tableContentHead + 
                       tableContentTest1 + tableContent.trim() + '\n\n' + unitTestCheck.trim() + '\n\n' +
                       tableContentTest2 + tableContent.trim() + '\n\n' + processTestCheck.trim() + '\n\n' +
                       tableContentTest3 + tableContent.trim() + '\n\n' + deviceTestCheck.trim();
    
        await this.app.vault.create(testFilePath, content);
    }
};
