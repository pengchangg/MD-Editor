const notificationQueue=[];let isNotificationShowing=!1;function showNotification(e,i="info",t=3e3){notificationQueue.push({message:e,type:i,duration:t}),isNotificationShowing||processNotificationQueue()}function processNotificationQueue(){if(0===notificationQueue.length)return void(isNotificationShowing=!1);isNotificationShowing=!0;const{message:e,type:i,duration:t}=notificationQueue.shift(),n=document.getElementById("notification");n.className="notification",n.classList.add(`notification-${i}`),n.textContent=e,n.classList.add("show");setTimeout((()=>{n.classList.remove("show"),setTimeout((()=>{processNotificationQueue()}),300)}),t)}function formatFileSize(e){return e<1024?e+" B":e<1048576?(e/1024).toFixed(2)+" KB":e<1073741824?(e/1048576).toFixed(2)+" MB":(e/1073741824).toFixed(2)+" GB"}function debounce(e,i){let t;return function(...n){const o=this;clearTimeout(t),t=setTimeout((()=>e.apply(o,n)),i)}}function throttle(e,i){let t;return function(...n){const o=this;t||(e.apply(o,n),t=!0,setTimeout((()=>t=!1),i))}}function getFileExtension(e){return e.slice(2+(e.lastIndexOf(".")-1>>>0))}function generateUniqueId(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}function isFeatureSupported(e){switch(e){case"localStorage":try{return"localStorage"in window&&null!==window.localStorage}catch(e){return!1}case"fileAPI":return window.File&&window.FileReader&&window.FileList&&window.Blob;case"indexedDB":return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;default:return!1}}function isMobileDevice(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}function getOSInfo(){const e=window.navigator.userAgent;let i="Unknown";return-1!==e.indexOf("Windows")?i="Windows":-1!==e.indexOf("Mac")?i="MacOS":-1!==e.indexOf("Linux")?i="Linux":-1!==e.indexOf("Android")?i="Android":-1!==e.indexOf("iOS")&&(i="iOS"),i}function isDarkMode(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches}function addClass(e,i){e.classList?e.classList.add(i):e.className+=" "+i}function removeClass(e,i){e.classList?e.classList.remove(i):e.className=e.className.replace(new RegExp("(^|\\b)"+i.split(" ").join("|")+"(\\b|$)","gi")," ")}function toggleClass(e,i){if(e.classList)e.classList.toggle(i);else{const t=e.className.split(" "),n=t.indexOf(i);n>=0?t.splice(n,1):t.push(i),e.className=t.join(" ")}}const UIUtils={showNotification:(e,i="info",t=3e3)=>{"number"==typeof i&&(t=i,i="info");let n=e;!("string"==typeof e&&(e.includes("已")||e.includes("cleaned")||e.includes("MB")||e.includes("KB")))&&"undefined"!=typeof LanguageModule&&LanguageModule.getTranslation&&(n=LanguageModule.getTranslation(e)||e),showNotification(n,i,t)},hideNotification:function(){window.AppElements.notification.classList.remove("show"),notificationQueue.length=0,isNotificationShowing=!1},insertText:function(e,i,t){const n=window.AppElements.editor,o=n.selectionStart,s=n.selectionEnd,a=n.value.substring(o,s),c=a||t;n.value=n.value.substring(0,o)+e+c+i+n.value.substring(s),n.selectionStart=o+e.length,n.selectionEnd=o+e.length+c.length,n.focus(),Editor.updatePreview(),LineNumbersModule.updateLineNumbers(),HistoryModule.addState(n.value)},debounce:function(e,i){let t;return function(...n){const o=this;clearTimeout(t),t=setTimeout((()=>e.apply(o,n)),i)}},throttle:function(e,i){let t;return function(...n){const o=this;t||(e.apply(o,n),t=!0,setTimeout((()=>t=!1),i))}}};