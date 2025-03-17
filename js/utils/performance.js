const PerformanceModule={metrics:{renderTime:[],scrollSyncTime:[],lineNumberUpdateTime:[],titleUpdateTime:[]},init:function(){"devper"===window.AppConfig.version&&setInterval((()=>{this.logReport()}),6e4)},recordMetric:function(e,t){this.metrics[e]&&(this.metrics[e].push(t),this.metrics[e].length>50&&this.metrics[e].shift())},getAverage:function(e){if(!this.metrics[e]||0===this.metrics[e].length)return 0;return this.metrics[e].reduce(((e,t)=>e+t),0)/this.metrics[e].length},getReport:function(){return{averageRenderTime:this.getAverage("renderTime").toFixed(2)+"ms",averageScrollSyncTime:this.getAverage("scrollSyncTime").toFixed(2)+"ms",averageLineNumberUpdateTime:this.getAverage("lineNumberUpdateTime").toFixed(2)+"ms",averageTitleUpdateTime:this.getAverage("titleUpdateTime").toFixed(2)+"ms"}},logReport:function(){console.log("性能报告:",this.getReport())}};