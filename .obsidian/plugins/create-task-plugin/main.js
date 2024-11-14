const { Plugin, Modal, Notice } = require('obsidian');

// 添加模板选择模态窗口类
class TemplateSelectModal extends Modal {
    constructor(app, templates, onChoose) {
        super(app);
        this.templates = templates;
        this.onChoose = onChoose;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.createEl("h2", {text: "选择模板"});

        for (const [key, value] of Object.entries(this.templates)) {
            const btn = contentEl.createEl("button", {text: key});
            btn.addEventListener("click", () => {
                this.onChoose(key, value);
                this.close();
            });
        }
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

module.exports = class CreateTaskPlugin extends Plugin {
    async onload() {
        // 添加图标按钮到左侧功能区
        const ribbonIconEl = this.addRibbonIcon(
            'plus',  // 默认图标作为后备
            '任务创建', // 鼠标悬停时的提示文本
            async () => {
                await this.handleButtonClick();
            }
        );
    }

    async handleButtonClick() {
        try {
            // 读取模板文件
            const templateContent = await this.app.vault.adapter.read('/template/template.json');
            const templates = JSON.parse(templateContent);
            
            // 显示模板选择窗口
            new TemplateSelectModal(this.app, templates, (key, value) => {
                new Notice(`选择了模板: ${key}`);

                // 确保 Templater 插件已加载
                if (!this.app.plugins.getPlugin("templater")) {
                    new Notice("Templater plugin is not installed or enabled.");
                    return;
                }
                
                console.log('Selected template:', value);
            }).open();
            
        } catch (error) {
            new Notice('读取模板文件失败: ' + error.message);
            console.error('Error reading template file:', error);
        }
    }

    onunload() {
        // 清理工作
    }
};
