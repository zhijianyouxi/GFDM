import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log('GF develop manager loaded');
		// 添加创建模板的命令
		this.addCommand({
			id: 'create-from-template',
			name: '从模板创建笔记',
			callback: async () => {
				// 获取 templater 插件实例
				const templater = this.app.plugins.plugins['templater-obsidian'];
				if (!templater) {
					new Notice('Templater 插件未启用!');
					return;
				}

				try {
					// 指定模板路径
					const templatePath = '软件/项目模板/测试模板.md';
					
					// 获取模板文件
					const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
					if (!templateFile) {
						new Notice(`模板文件不存在: ${templatePath}`);
						return;
					}

					// 使用 templater 的内部 API 创建笔记
					await templater.templater.create_new_note_from_template(templateFile);
				} catch (error) {
					console.error('创建笔记失败:', error);
					new Notice(`创建失败: ${error}`);
				}
			}
		});

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
