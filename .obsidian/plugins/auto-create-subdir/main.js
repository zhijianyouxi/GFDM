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
                    
                    // 创建版本开发子任务目录
                    const subSystemDesignFile= '系统设计文档.md';
                    const subSystemDesignFilePath = `${subVersionTaskPath}/${subSystemDesignFile}`;
                    await this.createSystemDesignDoc(subSystemDesignFilePath);

                } else {
                    new Notice(`请选中项目说明文档，然后创建项目的版本任务`);
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
};
