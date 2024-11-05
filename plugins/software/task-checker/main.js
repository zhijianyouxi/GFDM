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
            const absolutePath = this.app.vault.getAbstractFileByPath(activeFile.path).path;
            this.createNewNote(absolutePath);
        } else {
            new Notice('请先完成所有任务！');
        }
    }

    async createNewNote(fileName) {

        // 获取当前文件的目录
        const dir = path.dirname(fileName);
        
        // 定义要创建的文件名
        let newFileName;

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

            await this.app.vault.create(newFileName, contentHead + content1 + fileCheck.trim() + content1 + fileCheck1.trim() + content1 + fileCheck2.trim());
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
            newFileName = path.join(dir, '功能验收.md');
            const contentHead = '# 功能验收\n\n'
            const content1 = '功能开发完成，已验收'
          
            await this.app.vault.create(newFileName, contentHead + content1);
            new Notice(`已创建新笔记: ${newFileName}`);
        } 
        
    }
};
