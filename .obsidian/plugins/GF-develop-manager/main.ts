import { App, Editor, MarkdownView, Modal, Notice, Plugin, WorkspaceLeaf,PluginSettingTab, Setting, SuggestModal, ItemView } from 'obsidian';

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

// Add this new modal class before TableContentView
class TemplateSelectModal extends Modal {
    result: string | null = null;
    onChoose: (template: string | null) => void;
    templates: string[] = [];

    constructor(app: App, templates: string[], onChoose: (template: string | null) => void) {
        super(app);
        this.templates = templates;
        this.onChoose = onChoose;
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: '选择模板文件' });

        const buttonContainer = contentEl.createDiv('button-container');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.padding = '20px';

        this.templates.forEach(template => {
            const btn = buttonContainer.createEl('button', {
                text: template,
                cls: 'mod-cta'
            });
            
            btn.style.padding = '10px 20px';
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            
            btn.onclick = () => {
                this.result = template;
                this.close();
            };
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.onChoose(this.result);
    }
}

// Add this class definition before the GFDM class
class TableContentView extends ItemView {
    private contentEl: HTMLElement;
	private templateBasePath: string = '';
    private templateFileName: string = '';
	private content: string[][];  // 添加这个属性来存储完整的内容数据

    getViewType(): string {
        return "table-content-view";
    }

    getDisplayText(): string {
        return "Table Content";
    }

    async onOpen(): Promise<void> {
        this.contentEl = this.containerEl.children[1];
        this.contentEl.empty();
    }

    async setContent(content: string[][]): Promise<void> {
        this.contentEl.empty();
        this.content = content;

        // 添加固定宽度的容器
        const container = this.contentEl.createEl('div', { cls: 'table-container' });
        container.style.width = '100%';
        container.style.maxWidth = '800px'; // 设置最大宽度
        
        // Create header row
        const headerRow = container.createEl('div', { cls: 'table-header-row' });
        headerRow.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 5px 0;
            font-weight: bold;
            width: 100%;
        `;
        
        // Add headers with specific widths
        const headerWidths = ['20%', '45%', '10%', '5%', '20%']; // 总和为100%
        ['类型', '模板', '模板变更', '生成', '进度'].forEach((header, index) => {
            const headerCell = headerRow.createEl('div', { text: header });
            headerCell.style.cssText = `
                flex: 0 0 ${headerWidths[index]};
                text-align: left;
                padding: 5px;
            `;
        });

		console.log('Received content:', content);
		console.log('Content length:', content[0].length);

        // Create content rows
        for (let i = 0; i < content[0].length; i++) {
            console.log('Processing row:', i, content[0][i]);
			const templatePath = content[0][i][1] || "";
            const lastSlashIndex = templatePath.lastIndexOf('/');
            this.templateBasePath = templatePath.substring(0, lastSlashIndex + 1);
            this.templateFileName = templatePath.substring(lastSlashIndex + 1);
            
            if (i > 0) {
                const divider = container.createEl('hr', { cls: 'row-divider' });
                divider.style.cssText = `
                    margin: 8px 0;
                    border: none;
                    height: 1px;
                    background-color: var(--background-modifier-border);
                `;
            }
            
            const rowDiv = container.createEl('div', { cls: 'table-row' });
            rowDiv.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 5px 0;
                width: 100%;
            `;

            // Type cell
            const typeCell = rowDiv.createEl('div', { text: content[0][i][0] || "", cls: 'type-cell' });
            typeCell.style.cssText = `
                flex: 0 0 ${headerWidths[0]};
                text-align: left;
                padding: 5px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;

            // Template cell
            const templateCell = rowDiv.createEl('div', { text: this.templateFileName || "", cls: 'template-cell' });
            templateCell.style.cssText = `
                flex: 0 0 ${headerWidths[1]};
                text-align: left;
                padding: 5px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;

            // Change button
            const changeButton = rowDiv.createEl('button', { cls: 'change-button' });
            changeButton.innerHTML = '...';
            changeButton.style.cssText = `
                flex: 0 0 ${headerWidths[2]};
                text-align: left;
                padding: 5px;
            `;
            
            // Add click handler for change button
            changeButton.onclick = async () => {
                try {
                    const files = await this.app.vault.getMarkdownFiles();
                    const templateFiles = files
                        .filter(file => {
                            const isInTemplateDir = file.path.startsWith(this.templateBasePath);
                            const hasTemplateInName = file.name.toLowerCase().includes('模板');
                            return isInTemplateDir && hasTemplateInName;
                        })
                        .map(file => file.name);

                    new TemplateSelectModal(this.app, templateFiles, (selectedTemplate) => {
                        if (selectedTemplate) {
                            this.templateFileName = selectedTemplate;
                            templateCell.setText(selectedTemplate);

							// 更新存储的数据
                            const fullTemplatePath = this.templateBasePath + selectedTemplate;
                            this.content[0][i][1] = fullTemplatePath;  // 更新模板路径
                        }
                    }).open();
                } catch (error) {
                    new Notice('获取模板文件失败: ' + error.message);
                }
            };

            // Generate button
            const generateButton = rowDiv.createEl('button', { cls: 'generate-button' });
            generateButton.innerHTML = '✓';
            generateButton.style.cssText = `
                flex: 0 0 ${headerWidths[3]};
                text-align: left;
                padding: 5px;
            `;
            
            // Add click handler for generate button
            generateButton.onclick = async () => {
                try {
                    // Get templater plugin
                    const templater = this.app.plugins.plugins['templater-obsidian'];
                    if (!templater) {
                        new Notice('Templater 插件未启用!');
                        return;
                    }

                    // Get template file using the stored path
                    const templatePath = this.content[0][i][1];
                    const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
                    if (!templateFile) {
                        new Notice(`模板文件不存在: ${templatePath}`);
                        return;
                    }

                    // Create new note from template
                    await templater.templater.create_new_note_from_template(templateFile);
                    new Notice('文件创建成功');
                } catch (error) {
                    console.error('创建文件失败:', error);
                    new Notice(`创建失败: ${error}`);
                }
            };

            // Progress text
            const progressText = rowDiv.createEl('div', { text: '进行中', cls: 'progress-text' });
            progressText.style.cssText = `
                flex: 0 0 ${headerWidths[4]};
                text-align: left;
                padding: 1px;
                background-color: var(--background-secondary);
                border-radius: 4px;
            `;
        }
    }

	async setContentEntry(entryName: string, templatePath_param: string): Promise<void> {
        this.contentEl.empty();
        this.content = "";  // Convert to the expected format

        // Create header row
       // 添加固定宽度的容器
		const container = this.contentEl.createEl('div', { cls: 'table-container' });
		container.style.width = '100%';
		container.style.maxWidth = '800px'; // 设置最大宽度
		
		// Create header row with specific widths
		const headerRow = container.createEl('div', { cls: 'table-header-row' });
		headerRow.style.cssText = `
			display: flex;
			align-items: center;
			gap: 10px;
			margin: 5px 0;
			font-weight: bold;
			width: 100%;
		`;
		
		// Add headers with specific widths
		const headerWidths = ['20%', '45%', '10%', '5%', '20%']; // 总和为100%
		['类型', '模板', '模板变更', '生成', '进度'].forEach((header, index) => {
			const headerCell = headerRow.createEl('div', { text: header });
			headerCell.style.cssText = `
				flex: 0 0 ${headerWidths[index]};
				text-align: left;
				padding: 5px;
			`;
		});

        // Create content rows
        
		const templatePath = templatePath_param || "";
		const lastSlashIndex = templatePath.lastIndexOf('/');
		this.templateBasePath = templatePath.substring(0, lastSlashIndex + 1);
		this.templateFileName = templatePath.substring(lastSlashIndex + 1);

		console.log('entryName:', entryName);
		console.log('templateBasePath:', this.templateBasePath);
		console.log('templateFileName:', this.templateFileName);
		
		// 更新行样式
		const rowDiv = container.createEl('div', { cls: 'table-row' });
		rowDiv.style.cssText = `
			display: flex;
			align-items: center;
			gap: 10px;
			margin: 5px 0;
			width: 100%;
		`;

		// Update cell content to use actual data from content array
		 // 类型单元格
		const typeCell = rowDiv.createEl('div', { text: entryName || "", cls: 'type-cell' });
		typeCell.style.cssText = `
			flex: 0 0 ${headerWidths[0]};
			text-align: left;
			padding: 5px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		`;

		const templateCell = rowDiv.createEl('div', { text: this.templateFileName || "", cls: 'template-cell' });
		templateCell.style.cssText = `
			flex: 0 0 ${headerWidths[1]};
			text-align: left;
			padding: 5px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		`;

		// Add change button
		const changeButton = rowDiv.createEl('button', { cls: 'change-button' });
		changeButton.innerHTML = '...';
		changeButton.style.cssText = `
			flex: 0 0 ${headerWidths[2]};
			text-align: left;
			padding: 5px;
		`;
		
		// Add click handler for change button
		changeButton.onclick = async () => {
			try {
				const files = await this.app.vault.getMarkdownFiles();
				const templateFiles = files
					.filter(file => {
						const isInTemplateDir = file.path.startsWith(this.templateBasePath);
						const hasTemplateInName = file.name.toLowerCase().includes('模板');
						return isInTemplateDir && hasTemplateInName;
					})
					.map(file => file.name);

				new TemplateSelectModal(this.app, templateFiles, (selectedTemplate) => {
					if (selectedTemplate) {
						this.templateFileName = selectedTemplate;
						templateCell.setText(selectedTemplate);

						// 更新存储的数据
						const fullTemplatePath = this.templateBasePath + selectedTemplate;
						this.content = fullTemplatePath;  // 更新模板路径
					}
				}).open();
			} catch (error) {
				new Notice('获取模板文件失败: ' + error.message);
			}
		};

		// Add generate button
		const generateButton = rowDiv.createEl('button', { cls: 'generate-button' });
		generateButton.innerHTML = '✓';
		generateButton.style.cssText = `
			flex: 0 0 ${headerWidths[3]};
			text-align: left;
			padding: 5px;
		`;
		
		// Add click handler for generate button
		generateButton.onclick = async () => {
			try {
				// Get templater plugin
				const templater = this.app.plugins.plugins['templater-obsidian'];
				if (!templater) {
					new Notice('Templater 插件未启用!');
					return;
				}

				// Get template file using the stored path
				const templatePath = this.content;
				const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
				if (!templateFile) {
					new Notice(`模板文件不存在: ${templatePath}`);
					return;
				}

				// Create new note from template
				await templater.templater.create_new_note_from_template(templateFile);
				new Notice('文件创建成功');
			} catch (error) {
				console.error('创建文件失败:', error);
				new Notice(`创建失败: ${error}`);
			}
		};

		// Add progress text
		const progressText = rowDiv.createEl('div', { text: '进行中', cls: 'progress-text' });
		progressText.style.cssText = `
			flex: 0 0 ${headerWidths[4]};
			text-align: left;
			padding: 4px;
			background-color: var(--background-secondary);
			border-radius: 4px;
		`;
	}
}

export default class GFDM extends Plugin {
	settings: GFDMSettings;
	view: TableContentView;

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

	async showInRightSidebar(content: string[][]) {
		// 如果视图不存在，创建一个新的
		if (!this.view) {
			// 获取现有的右边栏叶子，如果不存在则创建新的
			let leaf = this.app.workspace.getLeavesOfType("table-content-view")[0];
			
			if (!leaf) {
				leaf = this.app.workspace.getRightLeaf(false); // 改为 true 以强制创建新叶子
				await leaf.setViewState({
					type: "table-content-view",
					active: true,
				});
			}

			// 确保视图被激活
			this.app.workspace.revealLeaf(leaf);
			
			// 获取视图实例
			this.view = leaf.view as TableContentView;
		}

		// 更新视图内容
		if (this.view) {
			await this.view.setContent(content);
		} else {
			throw new Error('View not properly initialized');
		}
	}

	async showInRightSidebarEntry(entryName: string, templatePath: string) {
		// 如果视图不存在，创建一个新的			
		if (!this.view) {
			// 获取现有的右边栏叶子，如果不存在则创建新的
			let leaf = this.app.workspace.getLeavesOfType("table-content-view")[0];
			
			if (!leaf) {
				leaf = this.app.workspace.getRightLeaf(false); // 改为 true 以强制创建新叶子
				await leaf.setViewState({
					type: "table-content-view",
					active: true,
				});
			}

			// 确保视图被激活
			this.app.workspace.revealLeaf(leaf);
			
			// 获取视图实例
			this.view = leaf.view as TableContentView;
		}

		// 更新视图内容
		if (this.view) {
			await this.view.setContentEntry(entryName, templatePath);
		} else {
			throw new Error('View not properly initialized');
		}
	}

	async processTemplate(selectedEntry: EntryItem, app: App) {
		if (!selectedEntry?.template) {
			throw new Error('Template path is undefined');
		}

		// Get template file
		const templateFile = app.vault.getAbstractFileByPath(selectedEntry.template);
		if (!templateFile) {
			throw new Error(`Template file not found: ${selectedEntry.template}`);
		}

		// Open template file in the main editor area
		await app.workspace.getLeaf().openFile(templateFile);
		// Get template content
		const templateContent = await app.vault.read(templateFile);
		
		// Parse tables
		const tables = await this.parseTablesFromMarkdown(templateContent);
		console.log('tables', tables);

		if (tables.length == 0) {
			const tables1 = await this.parseEntryTableForTemplate(selectedEntry.template);
			console.log('tables1', tables1[0][0]);
			console.log('tables2', tables1[0][1]);
			if (tables1.length != 0) {
				await this.showInRightSidebarEntry(tables1[0][0], tables1[0][1]);
			}
		} else {
			await this.showInRightSidebar(tables);
		}
	}

	async parseEntryTableForTemplate(templateFile: string): Promise<string[][]> {
		try {
			// 获取入口文件
			const entryFile = this.app.vault.getAbstractFileByPath('数据（由程序管理，请勿编辑）/入口.md');
			if (!entryFile) {
				throw new Error('入口文件不存在');
			}

			// 读取文件内容
			const content = await this.app.vault.read(entryFile);
			const lines = content.split('\n');
			
			let result: string[][] = [];
			let currentTable: string[][] = [];
			let rowCount = 0;
			let isInTable = false;

			// 解析表格内容
			for (const line of lines) {
				if (line.trim().startsWith('|')) {
					isInTable = true;
					// 跳过表头和分隔行
					if (rowCount >= 2) {
						const cells = line.split('|')
							.filter(cell => cell.trim() !== '')
							.map(cell => cell.trim());
						
						// 只取前两列
						if (cells.length >= 2) {
							const [col1, col2] = cells;
							
							// 检查是否匹配模板文件路径
							if (col2 === templateFile) {
								return [[col1, col2]]; // 如果找到匹配项，直接返回这一行
							}
							currentTable.push([col1, col2]);
						}
					}
					rowCount++;
				} else if (isInTable) {
					if (currentTable.length > 0) {
						result = currentTable; // 保存当前表格数据
						currentTable = [];
					}
					isInTable = false;
					rowCount = 0;
				}
			}

			// 处理最后一个表格
			if (currentTable.length > 0) {
				result = currentTable;
			}

			return result;
		} catch (error) {
			console.error('解析入口文件表格失败:', error);
			throw error;
		}
	}

	async parseTablesFromMarkdown(markdown: string): Promise<string[][]> {
		const tables: string[][] = [];
		let currentTable: string[][] = [];
		let rowCount = 0;
		
		const lines = markdown.split('\n');
		let isInTable = false;

		lines.forEach(line => {
			if (line.trim().startsWith('|')) {
				isInTable = true;
				// Skip first two rows of each table
				if (rowCount >= 2) {
					const cells = line.split('|')
						.filter(cell => cell.trim() !== '')
						.map(cell => cell.trim());
					
					if (cells.length > 0) {
						currentTable.push(cells);
					}
				}
				rowCount++;
			} else if (isInTable) {
				if (currentTable.length > 0) {
					tables.push(currentTable);
					currentTable = [];
				}
				isInTable = false;
				rowCount = 0;
			}
		});

		if (currentTable.length > 0) {
			tables.push(currentTable);
		}

		return tables;
	}

	async onload() {
		await this.loadSettings();
		console.log('GF develop manager loaded');

		// 注册自定义视图
		this.registerView(
			"table-content-view",
			(leaf) => (this.view = new TableContentView(leaf))
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

					await this.processTemplate(selectedEntry, this.app);

					// // 获取 templater 插件实例
					// const templater = this.app.plugins.plugins['templater-obsidian'];
					// if (!templater) {
					// 	new Notice('Templater 插件未启用!');
					// 	return;
					// }

					// // 获取模板文件
					// const templateFile = this.app.vault.getAbstractFileByPath(selectedEntry.template);
					// if (!templateFile) {
					// 	new Notice(`模板文件不存在: ${selectedEntry.template}`);
					// 	return;
					// }

					// // 使用 templater 的内部 API 创建笔记
					// await templater.templater.create_new_note_from_template(templateFile);
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
		// 移除视图
		this.app.workspace.detachLeavesOfType("table-content-view");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
