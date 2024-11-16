import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, ItemView, WorkspaceLeaf, TFile, TFolder } from 'obsidian';

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

// 添加视图类型常量
const VIEW_TYPE_GFDM = "gfdm-view"; 

// 添加自定义视图类
class GFDMView extends ItemView {
	private currentFile: TFile | null = null;
	private config: GFDMConfig | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_GFDM;
	}

	getDisplayText() {
		return "GFDM Steps";
	}

	async updateConfig(newConfig: GFDMConfig) {
		if (!this.currentFile) return;
		
		// 确保 template-path 以 / 结尾
		if (!newConfig["template-path"].endsWith('/')) {
			newConfig["template-path"] += '/';
		}
		
		const fileContent = await this.app.vault.read(this.currentFile);
		const configStart = fileContent.indexOf("<gfdm-conf");
		const configEnd = fileContent.indexOf("/>", configStart) + 2;
		
		const newContent = fileContent.slice(0, configStart) + 
			"<gfdm-conf \n" + 
			JSON.stringify(newConfig, null, 2) + 
			"\n/>" +
			fileContent.slice(configEnd);
			
		await this.app.vault.modify(this.currentFile, newContent);
		this.config = newConfig;
	}

	// 修改获取基础文件名的方法
	private getBaseName(path: string): string {
		return path.split('/').pop() || '';
	}

	// 修改获取模板文件的方法
	private async getTemplateFiles(templatePath: string): Promise<{fullPath: string, fileName: string}[]> {
		const files: {fullPath: string, fileName: string}[] = [];
		if (!templatePath) return files;

		// 确保路径以 / 结尾
		const normalizedPath = templatePath.endsWith('/') ? templatePath : templatePath + '/';
		
		// 获取模板目录下的所有文件
		const folder = this.app.vault.getAbstractFileByPath(normalizedPath.slice(0, -1));
		if (!folder || !(folder instanceof TFolder)) return files;

		// 递归获取所有 .md 文件
		const getFiles = (folder: TFolder) => {
			for (const child of folder.children) {
				if (child instanceof TFile && child.extension === 'md') {
					files.push({
						fullPath: child.path,
						fileName: this.getBaseName(child.path)
					});
				} else if (child instanceof TFolder) {
					getFiles(child);
				}
			}
		};

		getFiles(folder);
		return files;
	}

	async render() {
		console.log('render');
		const container = this.containerEl.children[1];
		container.empty();
		
		if (!this.config || !this.currentFile) return;

		// 添加标题
		const titleContainer = container.createEl("div", { cls: "gfdm-title" });
		const folderName = this.currentFile.parent?.name || "";
		titleContainer.createEl("h2", { text: folderName });

		const stepsContainer = container.createEl("div", { cls: "steps-container" });
		
		// 添加模板路径输入框
		const pathRow = stepsContainer.createEl("div", { cls: "path-row" });
		pathRow.createEl("span", { text: "模板路径：", cls: "path-label" });
		const pathInput = pathRow.createEl("input", {
			type: "text",
			value: this.config["template-path"] || "",
			cls: "path-input",
			placeholder: "请输入模板路径"
		});

		// 模板路径变化监听
		pathInput.addEventListener("change", async () => {
			this.config!["template-path"] = pathInput.value;
			
			await this.updateConfig(this.config!);
			await this.render();
		});

		// 添加一个刷新按钮来手动更新模板列表
		const refreshBtn = pathRow.createEl("button", { 
			text: "刷新",
			cls: "refresh-button" 
		});
		refreshBtn.addEventListener("click", async () => {
			await this.render();
		});

		// 获取文件类型
		const fileContent = await this.app.vault.read(this.currentFile);
		const frontmatter = this.app.metadataCache.getFileCache(this.currentFile)?.frontmatter;
		const fileType = frontmatter?.['文件类型'];

		// 添加小节标题
		const sectionTitle = fileType === '步骤集合' ? '步骤' : '容器';
		stepsContainer.createEl("h3", { text: sectionTitle, cls: "section-title" });

		// 创建表头
		const header = stepsContainer.createEl("div", { cls: "step-header" });
		header.createEl("span", { text: "名称", cls: "header-name" });
		header.createEl("span", { text: "模板文件", cls: "header-template" });
		header.createEl("span", { text: "操作", cls: "header-actions" });

		// 获取模板文件列表
		const templateFiles = await this.getTemplateFiles(this.config["template-path"]);

		// 创建步骤列表
		this.config.step.forEach((step, index) => {
			const stepRow = stepsContainer.createEl("div", { cls: "step-row" });
			
			// 步骤名输入框
			const nameInput = stepRow.createEl("input", { 
				type: "text",
				value: step.name,
				cls: "step-name"
			});
			
			// 模板文件下拉列表
			const createSelect = stepRow.createEl("select", {
				cls: "step-template"
			});

			// 添加空选项
			createSelect.createEl("option", {
				value: "",
				text: "请选择模板文件"
			});

			// 添加模板文件选项
			templateFiles.forEach(file => {
				const option = createSelect.createEl("option", {
					value: file.fileName, // 只保存文件名
					text: file.fileName, // 显示文件名
					selected: file.fileName === step.create // 使用文件名比较
				});
			});

			// 如果有已选择的模板，确保它被选中
			if (step.create) {
				createSelect.value = step.create;
			}

			// 输入框变化监听
			nameInput.addEventListener("change", async () => {
				this.config!.step[index].name = nameInput.value;
				
				await this.updateConfig(this.config!);
				await this.render();
			});

			createSelect.addEventListener("change", async () => {
				this.config!.step[index].create = createSelect.value;
				
				await this.updateConfig(this.config!);
				await this.render();
			});

			// 按钮组
			const buttonGroup = stepRow.createEl("div", { cls: "button-group" });
			
			// 生成按钮
			const generateBtn = buttonGroup.createEl("button", { text: "生成" });
			generateBtn.addEventListener("click", async () => {
				await this.createNoteFromTemplate(step.create);
			});

			// 添加按钮
			const addBtn = buttonGroup.createEl("button", { text: "+" });
			addBtn.addEventListener("click", async () => {
				this.config!.step.splice(index + 1, 0, {
					name: "",
					pre: "",
					create: "",
					after: ""
				});
				await this.updateConfig(this.config!);
				await this.render();
			});

			// 删除按钮
			const deleteBtn = buttonGroup.createEl("button", { text: "-" });
			deleteBtn.addEventListener("click", async () => {
				this.config!.step.splice(index, 1);
				await this.updateConfig(this.config!);
				await this.render();
			});
		});

		// 更新样式
		container.createEl("style", {
			text: `
				.gfdm-title {
					padding: 10px;
					border-bottom: 1px solid var(--background-modifier-border);
				}
				.gfdm-title h2 {
					margin: 0;
					font-size: 1.5em;
					color: var(--text-normal);
				}
				.section-title {
					margin: 15px 0 10px;
					font-size: 1.2em;
					color: var(--text-normal);
				}
				.steps-container { 
					padding: 10px; 
				}
				.path-row { 
					display: flex; 
					margin-bottom: 20px; 
					align-items: center; 
				}
				.path-label { 
					margin-right: 10px; 
					font-weight: bold;
				}
				.path-input { 
					flex: 1; 
				}
				.step-header { 
					display: flex; 
					margin-bottom: 10px; 
					font-weight: bold;
					padding: 5px 0;
					border-bottom: 1px solid var(--background-modifier-border);
				}
				.header-name, .header-template { 
					flex: 1;
					min-width: 150px;
				}
				.header-actions {
					width: 100px;
					text-align: center;
				}
				.step-row { 
					display: flex; 
					margin-bottom: 10px; 
					align-items: center; 
				}
				.step-name, .step-template { 
					flex: 1; 
					margin-right: 10px;
					min-width: 150px;
				}
				.button-group { 
					display: flex; 
					gap: 5px;
					width: 100px;
					justify-content: center;
				}
				button { 
					padding: 4px 8px; 
				}
				select.step-template {
					width: 100%;
					padding: 4px;
				}
		 `
		});
	}

	async setFile(file: TFile) {
		this.currentFile = file;
		const content = await this.app.vault.read(file);
		const match = content.match(/<gfdm-conf\s*([\s\S]*?)\s*\/>/);
		
		if (match && match[1]) {
			try {
				// 去除可能的前后空格
				const configStr = match[1].trim();
				console.log("Found config string:", configStr); // 调试日志
				
				this.config = JSON.parse(configStr);
				console.log("Parsed config:", this.config); // 调试日志
				
				// 确保配置对象具有必要的结构
				if (!this.config.step) {
					this.config.step = [];
				}
				if (!this.config["template-path"]) {
					this.config["template-path"] = "";
				}
				
				await this.render();
			} catch (e) {
				console.error("解析配置失败:", e);
				// 初始化默认配置
				this.config = {
					step: [{
						name: "",
						pre: "",
						create: "",
						after: ""
					}],
					"template-path": ""
				};
				await this.render();
			}
		} else {
			console.log("No config found, initializing default"); // 调试日志
			// 如果没有找到配置，创建默认配置
			this.config = {
				step: [{
					name: "",
					pre: "",
					create: "",
					after: ""
				}],
				"template-path": ""
			};
			await this.render();
		}
	}

	// 添加一个方法来解析模板文件的属性
	private async parseTemplateProperties(templateFile: TFile): Promise<Record<string, string>> {
		const content = await this.app.vault.read(templateFile);
		const properties: Record<string, string> = {};
		
		// 解析 frontmatter
		const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			const lines = frontmatterMatch[1].split('\n');
			for (const line of lines) {
				const [key, value] = line.split(':').map(s => s.trim());
				if (key && value) {
					properties[key] = value;
				}
			}
		}
		
		return properties;
	}

	// 添加一个辅助方法来处理用户输入
	private async promptForInput(message: string): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new Modal(this.app);
			modal.titleEl.setText(message);
			
			const input = modal.contentEl.createEl("input", {
				type: "text",
				cls: "prompt-input"
			});
			
			const buttonContainer = modal.contentEl.createDiv({
				cls: "button-container"
			});
			
			const submitButton = buttonContainer.createEl("button", {
				text: "确定"
			});
			
			const cancelButton = buttonContainer.createEl("button", {
				text: "取消"
			});
			
			// 添加样式
			modal.contentEl.createEl("style", {
				text: `
					.prompt-input {
						width: 100%;
						margin-bottom: 10px;
					}
					.button-container {
						display: flex;
						justify-content: flex-end;
						gap: 10px;
					}
			 `
			});
			
			submitButton.addEventListener("click", () => {
				const value = input.value.trim();
				modal.close();
				resolve(value || null);
			});
			
			cancelButton.addEventListener("click", () => {
				modal.close();
				resolve(null);
			});
			
			input.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					const value = input.value.trim();
					modal.close();
					resolve(value || null);
				} else if (e.key === "Escape") {
					modal.close();
					resolve(null);
				}
			});
			
			modal.open();
			input.focus();
		});
	}

	// 修改创建笔记的方法
	async createNoteFromTemplate(fileName: string) {
		try {
			const templater = this.app.plugins.plugins['templater-obsidian'];
			if (!templater) {
				new Notice('Templater 插件未启用!');
				return;
			}

			// 获取当前属性文件所在的文件夹路径
			const currentFolder = this.currentFile?.parent?.path;
			if (!currentFolder) {
				new Notice('无法获取当前文件夹路径');
				return;
			}

			// 确保模板路径以 / 结尾
			const templatePath = this.config!["template-path"].endsWith('/') 
				? this.config!["template-path"] 
				: this.config!["template-path"] + '/';

			// 拼接完整路径
			const fullTemplatePath = templatePath + fileName;

			// 获取模板文件
			const templateFile = this.app.vault.getAbstractFileByPath(fullTemplatePath);
			if (!templateFile) {
				new Notice(`模板文件不存在: ${fullTemplatePath}`);
				return;
			}

			// 解析模板属性
			const properties = await this.parseTemplateProperties(templateFile);
			const fileType = properties['文件类型'];
			let collectionName = properties['集合名称'];

			// 如果是集合类型，需要创建子文件夹
			if (fileType === '步骤集合' || fileType === '容器集合') {
				// 如果没有集合名称，弹框询问
				if (!collectionName) {
					collectionName = await this.promptForInput("请输入集合名称：");
					if (!collectionName) {
						new Notice('未指定集合名称，取消创建');
						return;
					}
				}

				// 创建子文件夹
				const newFolderPath = `${currentFolder}/${collectionName}`;
				try {
					if (!await this.app.vault.adapter.exists(newFolderPath)) {
						await this.app.vault.createFolder(newFolderPath);
					}
					
					// 在新文件夹中创建笔记
					await templater.templater.create_new_note_from_template(templateFile, newFolderPath);
				} catch (error) {
					new Notice(`创建文件夹失败: ${error}`);
					return;
				}
			} else {
				// 普通文件直接在当前文件夹创建
				await templater.templater.create_new_note_from_template(templateFile, currentFolder);
			}
		} catch (error) {
			console.error('创建笔记失败:', error);
			new Notice(`创建失败: ${error}`);
		}
	}
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

interface Step {
	name: string;
	pre: string;
	create: string;
	after: string;
}

interface GFDMConfig {
	step: Step[];
	"template-path": string;
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

		// 注册视图
		this.registerView(
			VIEW_TYPE_GFDM,
			(leaf) => new GFDMView(leaf)
		);

		// 修改文件打开事件监听
		this.registerEvent(
			this.app.workspace.on('file-open', async (file) => {
				if (!file) return;
				
				// 获取当前文件或其父目录下的属性文件
				let propertyFile = await this.findPropertyFile(file);
				if (!propertyFile) return;
				
				// 检查属性文件的标签
				const cache = this.app.metadataCache.getFileCache(propertyFile);
				const tags = cache?.frontmatter?.tags || [];

				if (tags.includes('GFDM') && tags.includes('属性')) {
					let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_GFDM)[0];
					
					if (!leaf) {
						leaf = this.app.workspace.getRightLeaf(false);
						await leaf.setViewState({
							type: VIEW_TYPE_GFDM,
							active: true,
						});
					}
					
					const view = leaf.view as GFDMView;
					await view.setFile(propertyFile);
				}
			})
		);

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

	async onunload() {
		// 清理视图
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_GFDM);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 添加查找属性文件的方法
	private async findPropertyFile(file: TFile): Promise<TFile | null> {
		// 检查当前文件是否为属性文件
		if (file.name === "属性.md") {
			return file;
		}
		
		// 检查父目录下是否有属性文件
		const parent = file.parent;
		if (parent) {
			const propertyFile = parent.children.find(f => f.name === "属性.md");
			return propertyFile instanceof TFile ? propertyFile : null;
		}
		
		return null;
	}
}
