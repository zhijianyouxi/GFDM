const { Plugin } = require('obsidian');
const { Notice } = require('obsidian');

module.exports = class AutoCreateProjectPlugin extends Plugin {
    onload() {
        this.addCommand({
            id: 'create-project-and-file',
            name: 'Create Project and File',
            callback: async () => {
                const currentDir = this.app.vault.getRoot().path; // 获取根目录
                const subDirName = 'software/software_workflow/新项目'; // 要创建的子目录名称
                const fileName = '项目说明.md'; // 要创建的文件名称

                // 创建项目路径
                const subDirPath = `${currentDir}/${subDirName}`;
                await this.app.vault.createFolder(subDirPath);

                // 创建项目文档
                const filePath = `${subDirPath}/${fileName}`;
                await this.app.vault.create(filePath, '# 项目说明\n\n1.创建软件版本任务时，请先激活<<项目说明>>\n\n2.创建软件版本子任务时，请先激活<<版本说明>>\n\n3.创建软件子任务开发时，请顺序完成系统分析文档, 需求文档，测试案例，详细设计，编码及单元测试，流程模拟测试，测试件打印，测试报告，功能验收\n\n4.在任意目录可创建新软件项目');
				
				const subVersionDirName = '9.0.0.1'; // 创建版本任务路径
				
				// 创建版本任务路径
                const subVersionPath = `${subDirPath}/${subVersionDirName}`;
                await this.app.vault.createFolder(subVersionPath);
				
				// 创建版本说明文档
				const subVersionFile = '版本说明.md'; // 创建版本说明文档
                const versionFilePath = `${subVersionPath}/${subVersionFile}`;
                await this.app.vault.create(versionFilePath, '# 版本说明\n\n1.版本说明\n2.版本说明');

                // 创建版本开发子任务目录
				const subVersionTask= '版本任务1';
                const subVersionTaskPath = `${subVersionPath}/${subVersionTask}`;
                await this.app.vault.createFolder(subVersionTaskPath);

                const subSystemDesignFile= '系统设计文档.md';
                const subSystemDesignFilePath = `${subVersionTaskPath}/${subSystemDesignFile}`;
                await this.createSystemDesignDoc(subSystemDesignFilePath);

                // 提示用户
                new Notice(`项目已创建在 ${subDirPath}`);
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
