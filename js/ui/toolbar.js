const Toolbar=function(){const t=document.getElementById("editor"),e=document.getElementById("preview"),n=document.getElementById("bold-btn"),o=document.getElementById("italic-btn"),i=document.getElementById("heading-btn"),l=document.getElementById("link-btn"),a=document.getElementById("image-btn"),s=document.getElementById("list-btn"),u=document.getElementById("ordered-list-btn"),d=document.getElementById("quote-btn"),c=document.getElementById("code-btn"),g=document.getElementById("table-btn"),r=document.getElementById("help-btn"),f=document.getElementById("undo-btn"),b=document.getElementById("redo-btn"),p=document.getElementById("save-btn");function v(){if(!window.AppConfig){console.warn("AppConfig 未定义，使用默认配置");const t=navigator.platform.toUpperCase().indexOf("MAC")>=0;window.AppConfig={isMac:t,modKey:t?"⌘":"Ctrl",altKey:t?"⌥":"Alt",AUTO_SAVE_DELAY:3e4,MAX_HISTORY_STATES:100,PERFORMANCE_SAMPLE_RATE:.1}}const t=window.AppConfig.modKey;if(n){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("bold-btn")} (${t}+B)`:`粗体 (${t}+B)`;n.setAttribute("data-tooltip",e),n.title=""}if(o){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("italic-btn")} (${t}+I)`:`斜体 (${t}+I)`;o.setAttribute("data-tooltip",e),o.title=""}if(i){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("heading-btn")} (${t}+1~6)`:`标题 (${t}+1~6)`;i.setAttribute("data-tooltip",e),i.title=""}if(l){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("link-btn")} (${t}+K)`:`链接 (${t}+K)`;l.setAttribute("data-tooltip",e),l.title=""}if(a){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("image-btn")} (${t}+Shift+I)`:`图片 (${t}+Shift+I)`;a.setAttribute("data-tooltip",e),a.title=""}if(s){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("list-btn")} (${t}+Shift+L)`:`无序列表 (${t}+Shift+L)`;s.setAttribute("data-tooltip",e),s.title=""}if(u){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("ordered-list-btn")} (${t}+Shift+O)`:`有序列表 (${t}+Shift+O)`;u.setAttribute("data-tooltip",e),u.title=""}if(d){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("quote-btn")} (${t}+Shift+B)`:`引用 (${t}+Shift+B)`;d.setAttribute("data-tooltip",e),d.title=""}if(c){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("code-btn")} (${t}+Shift+C)`:`代码块 (${t}+Shift+C)`;c.setAttribute("data-tooltip",e),c.title=""}if(g){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("table-btn")} (${t}+Shift+T)`:`表格 (${t}+Shift+T)`;g.setAttribute("data-tooltip",e),g.title=""}if(r){const t="undefined"!=typeof LanguageModule?LanguageModule.getTranslation("help-btn"):"快捷键帮助";r.setAttribute("data-tooltip",t),r.title=""}if(f){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("undo-btn")}`:`撤销 (${t}+Z)`;f.setAttribute("data-tooltip",e),f.title=""}if(b){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("redo-btn")}`:`重做 (${t}+Y 或 ${t}+Shift+Z)`;b.setAttribute("data-tooltip",e),b.title=""}if(p){const e="undefined"!=typeof LanguageModule?`${LanguageModule.getTranslation("save-btn")}`:`保存 (${t}+S)`;p.setAttribute("data-tooltip",e),p.title=""}const e=document.getElementById("export-btn"),v=document.getElementById("autosave-btn"),m=document.getElementById("language-btn"),E=document.getElementById("theme-btn"),h=document.getElementById("export-md-btn"),L=document.getElementById("export-pdf-btn"),y=document.getElementById("cleanup-images-btn");if(e){const t="undefined"!=typeof LanguageModule?LanguageModule.getTranslation("export-btn"):"导出文档";e.setAttribute("data-tooltip",t)}if(v){const t="undefined"!=typeof LanguageModule?LanguageModule.getTranslation("autosave-btn"):"自动保存";v.setAttribute("data-tooltip",t)}if(m){const t="zh"===("undefined"!=typeof LanguageModule&&LanguageModule.getCurrentLanguage?LanguageModule.getCurrentLanguage():"zh")?"切换到英文":"Switch to Chinese";m.setAttribute("data-tooltip",t)}if(E){const t="undefined"!=typeof LanguageModule?LanguageModule.getTranslation("theme-btn"):"切换主题 (浅色/深色)";E.setAttribute("data-tooltip",t)}if(h){const t="undefined"!=typeof LanguageModule?LanguageModule.getTranslation("export-md-btn"):"导出为Markdown文件";h.setAttribute("data-tooltip",t)}if(L){const t="undefined"!=typeof LanguageModule?LanguageModule.getTranslation("export-pdf-btn"):"导出为PDF文件";L.setAttribute("data-tooltip",t)}if(y){const t="undefined"!=typeof LanguageModule?LanguageModule.getTranslation("cleanup-images-btn"):"清理未使用的图片";y.setAttribute("data-tooltip",t),y.title=""}}function m(e,n){const o=t.selectionStart,i=t.selectionEnd,l=t.value.substring(o,i);l.length>0?(t.value=t.value.substring(0,o)+e+l+n+t.value.substring(i),t.selectionStart=o+e.length,t.selectionEnd=o+e.length+l.length):(t.value=t.value.substring(0,o)+e+n+t.value.substring(i),t.selectionStart=t.selectionEnd=o+e.length),t.focus(),C()}function E(){const e=t.selectionStart,n=t.selectionEnd,o=(t.value.substring(e,n),t.value.lastIndexOf("\n",e-1)+1),i=t.value.indexOf("\n",e),l=t.value.substring(o,i>-1?i:t.value.length),a=l.match(/^(#{1,6})\s/);if(a){const e=a[1].length;if(e<6){const e="#"+l;t.value=t.value.substring(0,o)+e+t.value.substring(i>-1?i:t.value.length),t.selectionStart=o,t.selectionEnd=o+e.length}else{const n=l.substring(e+1);t.value=t.value.substring(0,o)+n+t.value.substring(i>-1?i:t.value.length),t.selectionStart=o,t.selectionEnd=o+n.length}}else{const e="## "+l;t.value=t.value.substring(0,o)+e+t.value.substring(i>-1?i:t.value.length),t.selectionStart=o,t.selectionEnd=o+e.length}t.focus(),C()}function h(){const e=t.selectionStart,n=t.selectionEnd,o=t.value.substring(e,n);if(o.length>0){const i=`[${o}](链接地址)`;t.value=t.value.substring(0,e)+i+t.value.substring(n),t.selectionStart=e+o.length+3,t.selectionEnd=e+o.length+7}else{const o="[链接文本](链接地址)";t.value=t.value.substring(0,e)+o+t.value.substring(n),t.selectionStart=e+1,t.selectionEnd=e+5}t.focus(),C()}function L(){if("undefined"!=typeof ImageHandler)return;const e=t.selectionStart,n=t.selectionEnd,o=t.value.substring(e,n);if(o.length>0){const i=`![${o}](图片地址)`;t.value=t.value.substring(0,e)+i+t.value.substring(n),t.selectionStart=e+o.length+4,t.selectionEnd=e+o.length+8}else{const o="![图片描述](图片地址)";t.value=t.value.substring(0,e)+o+t.value.substring(n),t.selectionStart=e+2,t.selectionEnd=e+6}t.focus(),C()}function y(){const e=t.selectionStart,n=t.selectionEnd,o=t.value.substring(e,n);if(o.length>0){const i=o.split("\n").map((t=>`- ${t}`)).join("\n");t.value=t.value.substring(0,e)+i+t.value.substring(n),t.selectionStart=e,t.selectionEnd=e+i.length}else{const o="- 列表项1\n- 列表项2\n- 列表项3";t.value=t.value.substring(0,e)+o+t.value.substring(n),t.selectionStart=e+2,t.selectionEnd=e+6}t.focus(),C()}function S(){const e=t.selectionStart,n=t.selectionEnd,o=t.value.substring(e,n);if(o.length>0){const i=o.split("\n").map(((t,e)=>`${e+1}. ${t}`)).join("\n");t.value=t.value.substring(0,e)+i+t.value.substring(n),t.selectionStart=e,t.selectionEnd=e+i.length}else{const o="1. 列表项1\n2. 列表项2\n3. 列表项3";t.value=t.value.substring(0,e)+o+t.value.substring(n),t.selectionStart=e+3,t.selectionEnd=e+7}t.focus(),C()}function M(){const e=t.selectionStart,n=t.selectionEnd,o=t.value.substring(e,n);if(o.length>0){const i=o.split("\n").map((t=>`> ${t}`)).join("\n");t.value=t.value.substring(0,e)+i+t.value.substring(n),t.selectionStart=e,t.selectionEnd=e+i.length}else{const o="> 引用文本";t.value=t.value.substring(0,e)+o+t.value.substring(n),t.selectionStart=e+2,t.selectionEnd=e+6}t.focus(),C()}function B(){const e=t.selectionStart,n=t.selectionEnd,o=t.value.substring(e,n);if(o.length>0){const i="```\n"+o+"\n```";t.value=t.value.substring(0,e)+i+t.value.substring(n),t.selectionStart=e,t.selectionEnd=e+i.length}else{const o="```\n代码块\n```";t.value=t.value.substring(0,e)+o+t.value.substring(n),t.selectionStart=e+4,t.selectionEnd=e+8}t.focus(),C()}function $(){const e=t.selectionStart,n="| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 单元格1 | 单元格2 | 单元格3 |\n| 单元格4 | 单元格5 | 单元格6 |";t.value=t.value.substring(0,e)+n+t.value.substring(e),t.selectionStart=e,t.selectionEnd=e+85,t.focus(),C()}function A(){document.getElementById("shortcut-help").style.display="block"}function T(){document.execCommand("undo"),C()}function I(){document.execCommand("redo"),C()}function w(){Storage.saveContent(),UIUtils.showNotification("文档已保存","success")}function C(){const e=new Event("input",{bubbles:!0});t.dispatchEvent(e)}function k(t){const e=t.currentTarget,n=e.getAttribute("data-tooltip");if(!n)return;const o=document.createElement("div");o.style.position="absolute",o.style.visibility="hidden",o.style.whiteSpace="nowrap",o.style.fontSize="0.85rem",o.style.padding="6px 12px",o.innerText=n,document.body.appendChild(o);const i=o.offsetWidth,l=e.getBoundingClientRect(),a=l.left+l.width/2-i/2;a<10?e.classList.add("tooltip-left-align"):a+i>window.innerWidth-10?e.classList.add("tooltip-right-align"):(e.classList.remove("tooltip-left-align"),e.classList.remove("tooltip-right-align")),document.body.removeChild(o)}function x(t){const e=t.currentTarget,n=e.getAttribute("data-tooltip");if(!n)return;const o=document.createElement("div");o.style.position="absolute",o.style.visibility="hidden",o.style.whiteSpace="nowrap",o.style.fontSize="0.85rem",o.style.padding="6px 12px",o.innerText=n,document.body.appendChild(o);const i=o.offsetWidth;e.getBoundingClientRect().right+i+20>window.innerWidth?e.classList.add("tooltip-left-side"):e.classList.remove("tooltip-left-side"),document.body.removeChild(o)}return{init:function(){console.debug("工具栏初始化开始"),console.debug("DOM元素状态:",{editor:!!t,preview:!!e,boldBtn:!!n,italicBtn:!!o,headingBtn:!!i,linkBtn:!!l,imageBtn:!!a,listBtn:!!s,orderedListBtn:!!u,quoteBtn:!!d,codeBtn:!!c,tableBtn:!!g,helpBtn:!!r,undoBtn:!!f,redoBtn:!!b,saveBtn:!!p}),v(),n&&n.addEventListener("click",(()=>m("**","**"))),o&&o.addEventListener("click",(()=>m("*","*"))),i&&i.addEventListener("click",E),l&&l.addEventListener("click",h),a&&a.addEventListener("click",L),s&&s.addEventListener("click",y),u&&u.addEventListener("click",S),d&&d.addEventListener("click",M),c&&c.addEventListener("click",B),g&&g.addEventListener("click",$),r&&r.addEventListener("click",A),f&&f.addEventListener("click",T),b&&b.addEventListener("click",I),p&&p.addEventListener("click",w),function(){document.querySelectorAll(".toolbar button").forEach((t=>{t.addEventListener("mouseenter",k)}));document.querySelectorAll(".dropdown-content button").forEach((t=>{t.addEventListener("mouseenter",x)}))}(),console.debug("工具栏初始化完成")},updateButtonTooltips:v}}();document.addEventListener("DOMContentLoaded",(function(){Toolbar.init()}));