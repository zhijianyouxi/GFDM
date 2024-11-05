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
                await this.app.vault.create(filePath, '# 项目说明\n\n1.创建软件版本任务时，请先激活<<项目说明>>\n\n2.创建软件版本子任务时，请先激活<<版本说明>>\n\n3.创建软件子任务开发时，请顺序完成需求文档，测试案例，详细设计，编码及单元测试，流程模拟测试，测试件打印，测试报告，功能验收\n\n4.在任意目录可创建新软件项目');
				
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

				// 创建版本测试文档
				const subTestFile = '测试案例.md'; // 创建版本测试报告
                const testFilePath = `${subVersionTaskPath}/${subTestFile}`;
				
				// 创建版本需求文档
				const subRequirementFile = '需求文档.md'; // 创建版本需求文档
                const requirementFilePath = `${subVersionTaskPath}/${subRequirementFile}`;
				const requirementFileContent = `# 需求文档\n\n1.需求1\n\n2.需求2\n\n测试案例详见[测试案例](./${subTestFile})`
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
                
                // 提示用户
                new Notice(`项目已创建在 ${subDirPath}`);
            }
        });
    }
};
