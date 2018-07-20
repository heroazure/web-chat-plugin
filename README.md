# 简单的聊天注入插件

#### 使用入口（按顺序阅读）

- 脚本示例：src/views/plugin/html.html中

```
<script type='text/javascript'>
      (function(m, ei, q, i, a, j, s) {
        m[i]=m[i]||{}
        m[i].obj={cId:200938}
        j = ei.createElement(q),
          s = ei.getElementsByTagName(q)[0];
        j.async = true;
        j.charset = 'UTF-8';
        j.src = 'http://localhost:9900/js/ykxd.js';
        s.parentNode.insertBefore(j, s);
        j.onload=j.onreadystatechange=function () {
          ykxd.showChatPane()
        }
      })(window, document, 'script', 'ykxd');
</script>
    
```
  
  该脚本注入任意的HTML页面 `</body>` 之前即可调出聊天框
 
- http://localhost:9900/js/ykxd.js

  该文件最终由yarn run build-plugin命令生成
  
  来源自：src/other/plugin/index.js
  
  该文件中let pcSrc='http://localhost:9900/pc-chat'配置iframe的src
  
- http://localhost:9900/pc-chat

  执行命令: yarn run dev可访问
  
  该页面作为iframe的src
  
  页面文件：src/views/pc-chat

- 最终需部署的文件在dist目录

  dist/views/pc-chat/index.html
  
  dist/js/ykxd.js

- 该聊天插件只是个参照，websocket后端部分有bug未维护

- 启动项目顺序
  
  yarn run build-plugin
  
  yarn run dev
  
  访问： localhost:9900/plugin
  
<img style="width:60%;height:auto;" src="http://oonwiy2x0.bkt.clouddn.com/pic.jpg"/>
