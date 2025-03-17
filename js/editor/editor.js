const Editor=function(){const e=document.getElementById("editor"),t=document.getElementById("preview"),n=document.getElementById("line-numbers"),o=document.getElementById("char-count"),r=document.getElementById("line-pos"),l=document.getElementById("col-pos");function s(){try{const n=e.value,o=/!\[(.*?)\]\((.*?)\)/g;let r;for(console.debug("检查Markdown中的图片语法:");null!==(r=o.exec(n));)console.debug(`- 图片: alt="${r[1]}", src="${r[2]}"`);let l="";try{l=marked.parse(n),console.debug("Markdown解析结果类型:",typeof l,null===l?"null":void 0===l?"undefined":"object"==typeof l?JSON.stringify(l).substring(0,100)+"...":""),"string"!=typeof l&&(console.error("Markdown解析结果不是字符串:",null===l?"null":void 0===l?"undefined":"object"==typeof l?JSON.stringify(l).substring(0,100)+"...":l),l=String(l||""),console.debug("转换后的HTML:",l.substring(0,100)+"..."))}catch(e){console.error("Markdown解析错误:",e),l=`<div class="error">Markdown解析错误: ${e.message}</div><div>${n.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`}const s=/<img[^>]*data-img-id="(img_[0-9]+)"[^>]*>/g;let i;for(console.debug("检查HTML中的图片标签:");null!==(i=s.exec(l));)console.debug(`- 找到图片标签，ID: ${i[1]}`);if("undefined"!=typeof ImageHandler)try{if("string"!=typeof l&&(console.error("传递给processImages的不是字符串:",null===l?"null":void 0===l?"undefined":typeof l),l=String(l||"")),console.debug("处理图片前的HTML类型:",typeof l),"string"==typeof l){const e=ImageHandler.processImages(l);"string"==typeof e?l=e:(console.error("processImages返回的不是字符串:",null===e?"null":void 0===e?"undefined":typeof e),console.debug("使用原始HTML"))}else console.error("无法将HTML转换为字符串，跳过图片处理")}catch(e){console.error("图片处理错误:",e)}try{t.innerHTML=l,console.debug("预览内容已更新，HTML长度:",l.length),console.debug("预览内容前100个字符:",l.substring(0,100))}catch(e){console.error("设置预览HTML时出错:",e),t.innerHTML=`<div class="error">设置预览HTML时出错: ${e.message}</div>`}try{document.querySelectorAll("pre code").forEach((e=>{hljs.highlightElement(e)}))}catch(e){console.error("代码高亮错误:",e)}}catch(e){console.error("预览更新错误:",e);try{t.innerHTML=`<div class="error">预览更新错误: ${e.message}</div>`}catch(e){console.error("设置错误信息时出错:",e)}}}function i(){const t=e.value.split("\n").length;let o="";for(let e=1;e<=t;e++)o+=`<div class="line-number" data-line="${e}">${e}</div>`;n.innerHTML=o,c()}function c(){const t=e.selectionStart,n=e.value.substring(0,t).split("\n").length;document.querySelectorAll(".line-number").forEach((e=>{e.classList.remove("active"),e.classList.remove("active-line")}));const o=document.querySelector(`.line-number[data-line="${n}"]`);o&&o.classList.add("active-line")}function a(){const t=e.selectionStart,n=e.value.substring(0,t).split("\n"),o=n.length,s=n[n.length-1].length+1;r.textContent=o,l.textContent=s,c()}function u(){o.textContent=e.value.length}return{init:function(){e.addEventListener("input",(function(){s(),i(),u(),a()})),e.addEventListener("scroll",(function(){n.scrollTop=e.scrollTop})),e.addEventListener("click",a),e.addEventListener("keyup",a),e.addEventListener("mouseup",a),e.addEventListener("select",a),e.addEventListener("selectionchange",a),e.addEventListener("keydown",(function(t){if("Tab"===t.key){t.preventDefault();const n=e.selectionStart,o=e.selectionEnd;e.value=e.value.substring(0,n)+"    "+e.value.substring(o),e.selectionStart=e.selectionEnd=n+4,s(),i(),u(),a()}})),function(){try{const e=new marked.Renderer;e.link=function(e,t,n){try{return e=null!=e?String(e):"",t=null!=t?String(t):"",n=null!=n?String(n):"",!e||"[object Object]"===e||e.includes("[object")?(console.warn("无效的链接URL:",e),`<span class="invalid-link">${n}</span>`):`<a href="${e}" ${t?`title="${t}"`:""}>${n}</a>`}catch(e){return console.error("链接渲染器出错:",e),`<span class="error-link">${n}</span>`}},e.image=function(e,t,n){try{return console.debug("图片渲染参数:",{href:typeof e,title:typeof t,text:typeof n}),e=null!=e?String(e):"",t=null!=t?String(t):"",n=null!=n?String(n):"",console.debug("图片渲染处理后:",{href:e,title:t,text:n}),e&&e.startsWith("img_")?(console.debug("检测到本地图片ID:",e),`<img data-img-id="${e}" alt="${n}" title="${t}" class="local-image" >`):!e||"[object Object]"===e||e.includes("[object")?(console.warn("无效的图片URL:",e),"<img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100'  height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Cpath fill='%23d9534f' d='M30 30 L70 70 M70 30 L30 70'/%3E%3C/svg%3E\" alt=\"无效的图片URL\" class=\"local-image error\">"):`<img src="${e}" alt="${n}" ${t?`title="${t}"`:""}>`}catch(e){return console.error("图片渲染器出错:",e),"<img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Cpath fill='%23d9534f' d='M30 30 L70 70 M70 30 L30 70'/%3E%3C/svg%3E\" alt=\"图片渲染错误\" class=\"local-image error\">"}},marked.setOptions({sanitize:!1,silent:!0,headerIds:!1}),marked.use({renderer:e,highlight:function(e,t){try{return t&&hljs.getLanguage(t)?hljs.highlight(e,{language:t}).value:hljs.highlightAuto(e).value}catch(t){return console.error("代码高亮出错:",t),e}},pedantic:!1,gfm:!0,breaks:!0,smartLists:!0,smartypants:!1,xhtml:!1,walkTokens:function(e){try{"image"===e.type&&e.href&&("string"!=typeof e.href&&(console.warn("发现非字符串的图片URL:",e.href),e.href=String(e.href||"")),("[object Object]"===e.href||e.href.includes("[object"))&&(console.warn("发现[object Object]图片URL:",e.href),e.href=""))}catch(e){console.error("处理token时出错:",e)}}}),s()}catch(e){console.error("设置预览时出错:",e)}}(),i(),u(),console.log("编辑器模块初始化完成")},updatePreview:s,updateLineNumbers:i,updateCursorPosition:a,updateStatusBar:u,insertText:function(t){const n=e.selectionStart,o=e.selectionEnd;e.value.substring(n,o),e.value=e.value.substring(0,n)+t+e.value.substring(o),e.selectionStart=e.selectionEnd=n+t.length,e.focus(),s(),i(),u();const r=new Event("input");e.dispatchEvent(r)},wrapText:function(t,n){const o=e.selectionStart,r=e.selectionEnd,l=e.value.substring(o,r);e.value=e.value.substring(0,o)+t+l+n+e.value.substring(r),l.length>0?(e.selectionStart=o+t.length,e.selectionEnd=r+t.length):e.selectionStart=e.selectionEnd=o+t.length,e.focus(),s(),i(),u();const c=new Event("input");e.dispatchEvent(c)},getContent:function(){return e.value},setContent:function(t){e.value=t,s(),i(),u()}}}();document.addEventListener("DOMContentLoaded",(function(){Editor.init()}));