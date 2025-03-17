const ThemeModule={THEME_LIGHT:"light",THEME_DARK:"dark",THEME_AUTO:"auto",currentTheme:"light",init:function(){const e=localStorage.getItem("markdown-editor-theme");this.currentTheme=e||this.THEME_LIGHT,this.applyTheme(this.currentTheme),this.currentTheme===this.THEME_AUTO&&(document.getElementById("theme-btn").innerHTML='<i class="fas fa-adjust"></i>'),this.setupSystemThemeListener(),document.getElementById("theme-btn").addEventListener("click",this.toggleTheme.bind(this))},toggleTheme:function(){this.currentTheme===this.THEME_LIGHT?(this.currentTheme=this.THEME_DARK,UIUtils.showNotification("已切换到暗色主题")):this.currentTheme===this.THEME_DARK?(this.currentTheme=this.THEME_AUTO,UIUtils.showNotification("已切换到自动主题（跟随系统）"),document.getElementById("theme-btn").innerHTML='<i class="fas fa-adjust"></i>'):(this.currentTheme=this.THEME_LIGHT,UIUtils.showNotification("已切换到亮色主题")),this.applyTheme(this.currentTheme),localStorage.setItem("markdown-editor-theme",this.currentTheme)},applyTheme:function(e){const t=document.body,s=document.getElementById("theme-btn"),i=document.getElementById("code-theme");t.classList.remove("light-theme","dark-theme"),e===this.THEME_AUTO?window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?(t.classList.add("dark-theme"),s.innerHTML='<i class="fas fa-adjust"></i>',i.href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css"):(t.classList.add("light-theme"),s.innerHTML='<i class="fas fa-adjust"></i>',i.href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css"):e===this.THEME_DARK?(t.classList.add("dark-theme"),s.innerHTML='<i class="fas fa-sun"></i>',i.href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css"):(t.classList.add("light-theme"),s.innerHTML='<i class="fas fa-moon"></i>',i.href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css")},setupSystemThemeListener:function(){if(window.matchMedia){window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",(e=>{this.currentTheme===this.THEME_AUTO&&this.applyTheme(this.THEME_AUTO)}))}}};