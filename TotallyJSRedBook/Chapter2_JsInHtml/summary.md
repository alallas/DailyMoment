# script标签
## 执行

- 特性：
1. <script>标签从上往下执行
2. 执行阻塞Dom的解析

- 一般地：
放在body的最后面

## 属性

1. async和defer
- Async
  - 立即并行下载js文件（不阻塞渲染，不等待其他script下载），然后立即执行（阻塞）
  - js脚本的执行顺序不确定，并非按照顺序执行

- Defer
  - 立即并行下载js文件（不阻塞渲染，不等待其他script下载），然后等到dom解析完之后（DOMContentLoaded事件发生之前）执行
  - js脚本按照顺序执行


- 额外补充：动态加载js（非属性）：
```
  // 这表示默认是以async的方式进行加载的js
  let script = document.createElement('script')
  script.src = 'xxx.js'
  document.head.appendChild(script)

  // 但有的浏览器不支持async，那就需要取消异步加载的方式
  let script = document.createElement('script')
  script.src = 'xxx.js'
  script.async = false
  document.head.appendChild(script)

  // 但是动态加载的方式本身不可预见，又不是异步加载，很容易因为加载网络问题产生延迟，而一直阻塞渲染
  // 解决：让浏览器预加载器提前知道这些要动态导入的文件的存在，使用rel的preload属性
  <link rel="preload" href="xxx.js">
```


2. Crossorigin
- 默认：不使用cors
- anonymous：表示不设置凭据
- use-credentials：表示设置凭据

3. Integrity
- 对比接受到的资源和加密签名来验证完整性，不匹配脚本不执行
- 确保CDN不会提供恶意内容

4. Src
（有src，标签里面又有内容，只会执行src的）
- src可以是跨源的地址，发起请求可以成功拿到js数据
- 一保证源可信，二使用上面的integrity属性

5. Type
- 定义脚本语言的类型（MIME类型）
- 默认是：‘text/javascript’（最好不要指定）
- 如果src的文件是jsx或ts或tsx格式的，服务器会根据扩展名来响应正确的MIME类型（因为服务器首先会识别脚本的扩展，浏览器则不关心）


## 特殊字符

- 浏览器具有解析</script>的精细的规则（or算法？），所以不能在标签里面使用字符串的</script>，会报错显示Invalid or unexpected token，并把他当成结束符号。
```
function say() {
    console.log('</script>')
}
say()
```

- 需要对/进行转译
```
function say() {
    console.log('<\/script>')
}
say()
```


## 最佳实践

每个js文件作为“组件”分开在一个个script标签里面，浏览器缓存可以缓存所有外部链接的js文件


# 文档模式
- 混杂模式：让IE像IE5一样
- 标准模式：IE可以兼容多标准
- 准标准模式：支持很多标准，但没有标准规定的这么严格


# noscript标签
浏览器如果不支持脚本（或对脚本的支持被关闭），noscript标签里面的内容会被渲染，相当于一个兜底方案
