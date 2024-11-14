import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, SuggestModal } from 'obsidian';

interface EntryItem {
	name: string;
	template: string;
}

interface GFDMSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: GFDMSettings = {
	mySetting: 'default'
}

// 创建一个新的 Modal 类
class EntryModal extends Modal {
	result: EntryItem | null = null;
	onChoose: (entry: EntryItem | null) => void;

	constructor(app: App, onChoose: (entry: EntryItem | null) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// 添加标题
		contentEl.createEl('h2', { text: '选择创建类型' });

		try {
			// 获取所有入口
			const plugin = this.app.plugins.plugins['GF-develop-manager'] as GFDM;
			const entries = await plugin.parseEntryFile();

			// 创建按钮容器
			const buttonContainer = contentEl.createDiv('button-container');
			buttonContainer.style.display = 'flex';
			buttonContainer.style.flexDirection = 'column';
			buttonContainer.style.gap = '10px';
			buttonContainer.style.padding = '20px';

			// 为每个入口创建一个按钮
			entries.forEach(entry => {
				const btn = buttonContainer.createEl('button', {
					text: entry.name,
					cls: 'mod-cta'
				});
				
				// 设置按钮样式
				btn.style.padding = '10px 20px';
				btn.style.width = '100%';
				btn.style.textAlign = 'left';
				
				// 添加点击事件
				btn.onclick = () => {
					this.result = entry;
					this.close();
				};
			});

		} catch (error) {
			// 显示错误信息
			contentEl.createEl('p', {
				text: '加载入口失败: ' + error.message,
				cls: 'error-message'
			});
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		this.onChoose(this.result);
	}
}

export default class GFDM extends Plugin {
	settings: GFDMSettings;

	// 解析入口文件
	async parseEntryFile(): Promise<EntryItem[]> {
		try {
			const entryFile = this.app.vault.getAbstractFileByPath('数据（由程序管理，请勿编辑）/入口.md');
			if (!entryFile) {
				throw new Error('入口文件不存在');
			}

			const content = await this.app.vault.read(entryFile);
			const lines = content.split('\n');
			
			const entries: EntryItem[] = [];

			for (const line of lines) {
				// 跳过表头和分隔行
				if (line.startsWith('| --') || line.startsWith('| 入口名称')) {
					continue;
				}
				
				// 解析表格行
				if (line.startsWith('|')) {
					const [_, name, template] = line.split('|').map(cell => cell.trim());
					if (name && template) {
						entries.push({
							name: name,
							template: template
						});
					}
				}
			}

			return entries;
		} catch (error) {
			console.error('解析入口文件失败:', error);
			throw error;
		}
	}

	// 修改选择入口的方法
	async selectEntry(): Promise<EntryItem | null> {
		return new Promise((resolve) => {
			new EntryModal(this.app, (result) => {
				resolve(result);
			}).open();
		});
	}

	async onload() {
		await this.loadSettings();
		console.log('GF develop manager loaded');

		// 添加左侧 ribbon 按钮
		this.addRibbonIcon(
			'plus-circle',
			'创建新笔记',
			async () => {
				try {
					const selectedEntry = await this.selectEntry();
					console.log('selectedEntry', selectedEntry);
					if (!selectedEntry) {
						return;
					}

					// 获取 templater 插件实例
					const templater = this.app.plugins.plugins['templater-obsidian'];
					if (!templater) {
						new Notice('Templater 插件未启用!');
						return;
					}

					// 获取模板文件
					const templateFile = this.app.vault.getAbstractFileByPath(selectedEntry.template);
					if (!templateFile) {
						new Notice(`模板文件不存在: ${selectedEntry.template}`);
						return;
					}

					// 使用 templater 的内部 API 创建笔记
					await templater.templater.create_new_note_from_template(templateFile);
				} catch (error) {
					console.error('创建笔记失败:', error);
					new Notice(`创建失败: ${error}`);
				}
			}
		);

		// 添加创建模板的命令
		this.addCommand({
			id: 'create-from-template',
			name: '从模板创建笔记',
			callback: async () => {
				try {
					// 获取用户选择的入口
					const selectedEntry = await this.selectEntry();
					if (!selectedEntry) {
						return;
					}

					// 获取 templater 插件实例
					const templater = this.app.plugins.plugins['templater-obsidian'];
					if (!templater) {
						new Notice('Templater 插件未启用!');
						return;
					}

					// 获取模板文件
					const templateFile = this.app.vault.getAbstractFileByPath(selectedEntry.template);
					if (!templateFile) {
						new Notice(`模板文件不存在: ${selectedEntry.template}`);
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
