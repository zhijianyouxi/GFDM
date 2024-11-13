const { Plugin, Notice } = require('obsidian');

const fs = require('fs');
const path = require('path');

module.exports = class TaskCheckerPlugin extends Plugin {
    onload() {
        this.addCommand({
            id: 'check-tasks-and-create-note',
            name: 'Check Tasks and Create Note',
            callback: () => {
                this.checkTasksAndCreateNote();
            }
        });
    }

    async getGitUserName() {
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
          // Execute git command to get the username
          exec('git config --global user.name', (error, stdout, stderr) => {
            if (error) {
              console.error(`Error fetching Git username: ${stderr}`);
              resolve(null);
            } else {
              // Trim the output and return the username
              resolve(stdout.trim());
            }
          });
        });
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

    async createNewNote(fileName) {
        // 获取当前文件的目录
        const dir = path.dirname(fileName);
        
        // 定义要创建的文件名
        let newFileName;


         // 根据文件名中的子字符串决定新文件的名称
        if (fileName.includes('系统设计文档')) {
            const currentDir1 = dir;
            await this.createTestDoc(currentDir1);
        }

        // 根据文件名中的子字符串决定新文件的名称
        if (fileName.includes('测试案例')) {
            newFileName = path.join(dir, '详细设计.md');
            // 创建新文件并写入示例内容
            const contentHead = '# 详细设计\n\n'
            const content1 = '## 数据结构设计\n\n1.xxx字段, 1表示正常, 0表示异常\n\n2.xxx字段, 1表示正常, 0表示异常\n\n'
            const content2 = '## 算法实现设计\n\n1.函数xxx实现伪代码\n\n2.函数xxx实现伪代码\n\n'
            const fileCheck = `
- [ ] 详细设计任务是否完成
`;

            await this.app.vault.create(newFileName, contentHead + content1 + content2 + fileCheck.trim());
            new Notice(`已创建新笔记: ${newFileName}`);
        } 
        if (fileName.includes('详细设计')) {
            newFileName = path.join(dir, '编码及单元测试.md');
            // 创建新文件并写入示例内容
            const contentHead = '# 编码及单元测试\n\n'
            const content1 = '\n'
            const fileCheck = `
- [ ] 编码是否完成
`;
            const fileCheck1 = `
- [ ] 单元测试是否完成
`;
            const fileCheck2 = `
- [ ] 代码审查是否完成
`;

            await this.app.vault.create(newFileName, contentHead + content1 + fileCheck.trim() + content1 + fileCheck1.trim() + content1);
            new Notice(`已创建新笔记: ${newFileName}`);

        } 
        if (fileName.includes('编码及单元测试')) {
            newFileName = path.join(dir, '流程模拟测试.md');
            const contentHead = '# 流程模拟测试\n\n'
            const content1 = '\n'
            const fileCheck1 = `
- [ ] 流程测试是否完成
`;
            const fileCheck2 = `
- [ ] 日志审查是否完成
`;

            await this.app.vault.create(newFileName, contentHead + content1 + fileCheck1.trim() + content1 + fileCheck2.trim());
            new Notice(`已创建新笔记: ${newFileName}`);
        } 
        if (fileName.includes('流程模拟测试')) {
            newFileName = path.join(dir, '测试件打印.md');
            const contentHead = '# 测试件打印\n\n'
            const content1 = '\n'
            const fileCheck1 = `
- [ ] 测试件打印是否完成
`;
            const fileCheck2 = `
- [ ] 日志审查是否完成
`;

            await this.app.vault.create(newFileName, contentHead + content1 + fileCheck1.trim() + content1 + fileCheck2.trim());
            new Notice(`已创建新笔记: ${newFileName}`);
        } 

        if (fileName.includes('测试件打印')) {
            newFileName = path.join(dir, '测试报告.md');
            const contentHead = '# 测试报告\n\n'
            const fileCheck1 = `
- [ ] 测试案例中所有单元测试是否完成
`;
            const fileCheck2 = `
- [ ] 测试案例中所有流程测试是否完成
`;

            const fileCheck3 = `
- [ ] 测试案例中所有测试件测试是否完成
`;
          
            await this.app.vault.create(newFileName, contentHead + fileCheck1.trim() + '\n\n' + fileCheck2.trim() + '\n\n' + fileCheck3.trim());
            new Notice(`已创建新笔记: ${newFileName}`);
        } 

        if (fileName.includes('测试报告')) {
            const fileCheck1 = `
- [ ] 代码检视是否完成
`;
            newFileName = path.join(dir, '功能验收.md');
            const contentHead = '# 功能验收\n\n'
            const content1 = '\n\n'
          
            await this.app.vault.create(newFileName, contentHead + fileCheck1.trim() + content1);
            new Notice(`已创建新笔记: ${newFileName}`);
        } 
        
    }


    async checkTasksAndCreateNote() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return;

        const content = await this.app.vault.read(activeFile);
        const lines = content.split('\n');
        let allCompleted = true;

        lines.forEach(line => {
            if (line.startsWith('- [ ]')) {
                allCompleted = false;
            }
        });

        if (allCompleted) {
            const gitUserName = await this.getGitUserName();
            if (activeFile.basename.includes('测试案例') || activeFile.basename.includes('系统设计文档') || activeFile.basename.includes('功能验收')) {
                if (gitUserName !== 'bean22-dev') {
                    new Notice('You do not have permission to change this checkbox.');
                    return;
                }
            }

            if (activeFile.basename.includes('详细设计') || activeFile.basename.includes('编码及单元测试') || activeFile.basename.includes('流程模拟测试') || activeFile.basename.includes('测试件打印') || activeFile.basename.includes('测试报告')) {
                if (gitUserName !== 'bean22-dev') {
                    new Notice('You do not have permission to change this checkbox.');
                    return;
                }
            }
        }
        
        if (allCompleted) {
            const absolutePath = this.app.vault.getAbstractFileByPath(activeFile.path).path;
            new Notice(`已经当前任务！${absolutePath}`);
            this.createNewNote(absolutePath);
        } else {
            new Notice('请先完成当前任务！');
            return
        }
    }

};
