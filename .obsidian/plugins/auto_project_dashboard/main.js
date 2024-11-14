const { Plugin } = require('obsidian');
const { Notice } = require('obsidian');

const fs = require('fs');
const path = require('path');

module.exports = class AutoProjectDashboardPlugin extends Plugin {
    onload() {
        this.addCommand({
            id: 'create-project-dashboard',
            name: 'Create Project Dashboard',
            callback: async () => {
                const currentDir = this.app.vault.getRoot().path;
                const subDirName = 'software/software_workflow/';
                
                const projectDirs = await this.getProjectDirectories(subDirName);
                console.log('Found project directories:', projectDirs);

                // 获取每个项目的版本任务目录和最新任务
                for (const projectDir of projectDirs) {
                    const versionDirs = await this.getVersionDirectories(projectDir);
                    console.log(`Versions for ${projectDir}:`, versionDirs);
                    
                    // 获取每个版本目录的子任务目录
                    for (const versionDir of versionDirs) {
                        const subTasks = await this.getVersionSubTasks(projectDir, versionDir);
                        console.log(`Sub tasks in ${projectDir}/${versionDir}:`, subTasks);
                        
                        // 获取每个子任务目录中的特定文件
                        for (const subTask of subTasks) {
                            const taskFiles = await this.getSubTaskFiles(projectDir, versionDir, subTask);
                            console.log(`Files in ${subTask}:`, taskFiles);
                            const kanbanHtml = await this.createKanbanView(projectDir, versionDirs, subTasks, taskFiles);
                            console.log('Kanban HTML:', kanbanHtml);
                        }
                    }
                }
            }
        });
    }

    // 获取项目目录列表
    async getProjectDirectories(relativePath) {
        try {
            const absolutePath = path.join(this.app.vault.adapter.basePath, relativePath);
            const files = await this.app.vault.adapter.list(relativePath);
            
            // 过滤出文件夹
            const directories = files.folders
                .map(folder => path.basename(folder));
            
            return directories;
        } catch (error) {
            new Notice(`Error getting project directories: ${error.message}`);
            console.error('Error getting project directories:', error);
            return [];
        }
    }

    // 获取项目版本任务目录
    async getVersionDirectories(projectPath) {
        try {
            const fullPath = path.join(this.app.vault.adapter.basePath, 'software/software_workflow', projectPath);
            const files = await this.app.vault.adapter.list(`software/software_workflow/${projectPath}`);
            
            // 过滤出版本任务文件夹
            const versionDirs = files.folders
                .map(folder => path.basename(folder));
            
            return versionDirs;
        } catch (error) {
            new Notice(`Error getting version directories: ${error.message}`);
            console.error('Error getting version directories:', error);
            return [];
        }
    }

    // 获取版本目录下的子任务目录
    async getVersionSubTasks(projectPath, versionDir) {
        try {
            const dirPath = `software/software_workflow/${projectPath}/${versionDir}`;
            const files = await this.app.vault.adapter.list(dirPath);
            
            // 过滤出子任务文件夹
            const subTaskDirs = files.folders
                .map(folder => path.basename(folder));
            
            return subTaskDirs;
        } catch (error) {
            new Notice(`Error getting version sub tasks: ${error.message}`);
            console.error('Error getting version sub tasks:', error);
            return [];
        }
    }

    // 获取子任务目录中的特定文件信息
    async getSubTaskFiles(projectPath, versionDir, subTaskDir) {
        try {
            const dirPath = `software/software_workflow/${projectPath}/${versionDir}/${subTaskDir}`;
            const files = await this.app.vault.adapter.list(dirPath);
            
            const result = [];
            
            // 遍历所有文件
            for (const file of files.files) {
                const fileName = path.basename(file);
                const stat = await this.app.vault.adapter.stat(file);
                const createdTime = new Date(stat.ctime).toLocaleString();
                
                // 检查系统设计文档
                if (fileName.includes('系统设计') || fileName.includes('system_design')) {
                    result.push(`系统设计文档: ${fileName} (创建于 ${createdTime})`);
                }
                
                // 检查测试案例文件
                if (fileName.includes('测试案例') || fileName.includes('test_case')) {
                    result.push(`测试案例: ${fileName} (创建于 ${createdTime})`);
                }
            }
            
            return result;
        } catch (error) {
            new Notice(`Error getting sub task files: ${error.message}`);
            console.error('Error getting sub task files:', error);
            return [];
        }
    }

    async createKanbanView(projectDir, versionDirs, subTasks, taskFiles) {
        let kanbanHtml = '<div class="kanban-board">';
        
        // 遍历每个版本
        for (const versionDir of versionDirs) {
            kanbanHtml += `
                <div class="version-column">
                    <h3 class="version-header">${versionDir}</h3>
                    <div class="tasks-container">`;
            
            // 获取该版本的所有子任务
            const versionSubTasks = subTasks[versionDir] || [];
            
            // 遍历子任务
            for (const subTask of versionSubTasks) {
                const taskFileList = taskFiles[`${versionDir}/${subTask}`] || [];
                const status = this.determineTaskStatus(taskFileList);
                
                kanbanHtml += `
                    <div class="task-card">
                        <h4 class="task-header">${subTask}</h4>
                        <div class="task-status ${status.toLowerCase()}">${status}</div>
                        <div class="task-files">
                            ${taskFileList.map(file => `
                                <div class="file-item">${file}</div>
                            `).join('')}
                        </div>
                    </div>`;
            }
            
            kanbanHtml += `
                    </div>
                </div>`;
        }
        
        kanbanHtml += '</div>';
        
        // 添加看板样式
        const styles = `
            <style>
                .kanban-board {
                    display: flex;
                    gap: 20px;
                    overflow-x: auto;
                    padding: 20px;
                }
                .version-column {
                    min-width: 300px;
                    background: var(--background-secondary);
                    border-radius: 8px;
                    padding: 15px;
                }
                .version-header {
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid var(--background-modifier-border);
                }
                .task-card {
                    background: var(--background-primary);
                    margin-bottom: 12px;
                    padding: 12px;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .task-header {
                    margin: 0 0 8px 0;
                    font-size: 1.1em;
                }
                .task-status {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-bottom: 8px;
                    font-size: 0.9em;
                }
                .task-status.pending { background: #ffd700; }
                .task-status.in-progress { background: #87ceeb; }
                .task-status.completed { background: #90ee90; }
                .task-files {
                    font-size: 0.9em;
                    color: var(--text-muted);
                }
                .file-item {
                    margin: 4px 0;
                    padding: 4px;
                    background: var(--background-secondary);
                    border-radius: 4px;
                }
            </style>
        `;

        return styles + kanbanHtml;
    }

    // 辅助函数：根据任务文件确定状态
    async determineTaskStatus(taskFiles) {
        if (!taskFiles || taskFiles.length === 0) {
            return 'Pending';
        }
        
        const hasSystemDesign = taskFiles.some(file => 
            file.includes('系统设计') || file.includes('system_design'));
        const hasTestCase = taskFiles.some(file => 
            file.includes('测试案例') || file.includes('test_case'));
        
        if (hasSystemDesign && hasTestCase) {
            return 'Completed';
        } else if (hasSystemDesign || hasTestCase) {
            return 'In-Progress';
        }
        
        return 'Pending';
    }
};
