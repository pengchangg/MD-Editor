// 主题管理模块 - 负责主题切换功能
const ThemeModule = {
    // 主题常量
    THEME_LIGHT: 'light',
    THEME_DARK: 'dark',
    THEME_AUTO: 'auto',
    
    // 当前主题
    currentTheme: 'light',
    
    // 初始化主题模块
    init: function() {
        // 加载保存的主题
        const savedTheme = localStorage.getItem('markdown-editor-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // 默认使用亮色主题
            this.currentTheme = this.THEME_LIGHT;
        }

        // 应用主题
        this.applyTheme(this.currentTheme);

        // 设置主题按钮图标
        if (this.currentTheme === this.THEME_AUTO) {
            document.getElementById('theme-btn').innerHTML = '<i class="fas fa-adjust"></i>';
        }

        // 设置系统主题变化监听器
        this.setupSystemThemeListener();
        
        // 添加主题切换按钮事件
        document.getElementById('theme-btn').addEventListener('click', this.toggleTheme.bind(this));
    },
    
    // 切换主题
    toggleTheme: function() {
        // 循环切换主题：亮色 -> 暗色 -> 自动 -> 亮色
        if (this.currentTheme === this.THEME_LIGHT) {
            this.currentTheme = this.THEME_DARK;
            UIUtils.showNotification('已切换到暗色主题');
        } else if (this.currentTheme === this.THEME_DARK) {
            this.currentTheme = this.THEME_AUTO;
            UIUtils.showNotification('已切换到自动主题（跟随系统）');
            document.getElementById('theme-btn').innerHTML = '<i class="fas fa-adjust"></i>';
        } else {
            this.currentTheme = this.THEME_LIGHT;
            UIUtils.showNotification('已切换到亮色主题');
        }

        // 应用主题
        this.applyTheme(this.currentTheme);

        // 保存主题设置
        localStorage.setItem('markdown-editor-theme', this.currentTheme);
    },
    
    // 应用主题
    applyTheme: function(theme) {
        const body = document.body;
        const themeBtn = document.getElementById('theme-btn');
        const codeTheme = document.getElementById('code-theme');
        
        // 移除所有主题类
        body.classList.remove('light-theme', 'dark-theme');
        
        if (theme === this.THEME_AUTO) {
            // 自动主题：根据系统主题设置
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-theme');
                themeBtn.innerHTML = '<i class="fas fa-adjust"></i>';
                codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css';
            } else {
                body.classList.add('light-theme');
                themeBtn.innerHTML = '<i class="fas fa-adjust"></i>';
                codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
            }
        } else if (theme === this.THEME_DARK) {
            // 暗色主题
            body.classList.add('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css';
        } else {
            // 亮色主题（默认）
            body.classList.add('light-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
        }
    },
    
    // 设置系统主题变化监听器
    setupSystemThemeListener: function() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // 添加主题变化监听器
            mediaQuery.addEventListener('change', (e) => {
                if (this.currentTheme === this.THEME_AUTO) {
                    this.applyTheme(this.THEME_AUTO);
                }
            });
        }
    }
}; 