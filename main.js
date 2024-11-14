const { Plugin } = require('obsidian');

class AutoCreateButtonPlugin extends Plugin {
    async onload() {
        // 添加图标按钮到左侧功能区
        const ribbonIconEl = this.addRibbonIcon(
            'plus',  // 默认图标作为后备
            'Create New Task', // 鼠标悬停时的提示文本
            (evt) => {
                // 按钮点击响应函数
                this.handleButtonClick();
            }
        );

        // 加载自定义SVG图标
        try {
            const response = await fetch(this.app.vault.adapter.getResourcePath('plus.svg'));
            const svgContent = await response.text();
            
            // 设置图标大小为 16x16 像素（与 Obsidian 左侧图标一致）
            const iconContainer = ribbonIconEl.children[0];
            iconContainer.innerHTML = svgContent;
            iconContainer.addClass('custom-icon');
        } catch (error) {
            console.error('Failed to load custom icon:', error);
        }

        // 添加自定义样式
        this.addStyle(`
            .custom-icon svg {
                width: 16px;
                height: 16px;
                display: block;
            }
        `);
    }

    async handleButtonClick() {
        // 这里添加按钮点击后的具体操作
        console.log('Button clicked!');
    }

    onunload() {
        // 清理工作
    }
}

module.exports = AutoCreateButtonPlugin; 