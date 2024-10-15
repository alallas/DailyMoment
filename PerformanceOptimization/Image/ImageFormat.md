# 图片格式优化

https://blog.csdn.net/2301_77342543/article/details/131868089
https://baijiahao.baidu.com/s?id=1804618831704641468&wfr=spider&for=pc

## 原生格式（所有场景！！！）
### 分类
#### webp格式

https://mp.weixin.qq.com/s?__biz=MzIyODM2ODE5NQ==&mid=2247487234&idx=1&sn=a9b1336455dcb38909ab34dc21373d5c&scene=21#wechat_redirect


- WebP 是一种现代图像格式，可为 Web 上的图像提供出色的无损和有损压缩。使用 WebP，网站管理员和 Web 开发人员可以创建更小，更丰富的图像，从而使 Web 更快。
- 与 PNG 相比，WebP 无损图像的尺寸要小 26％。在同等的 SSIM 质量指数下，WebP 有损图像比同类 JPEG 图像小 25-34％。
- 无损 WebP 支持透明性（也称为 Alpha 通道），而仅增加了 22％ 的字节数。对于可以接受有损 RGB 压缩的情况，有损 WebP 还支持透明性，与 PNG 相比，文件大小通常小 3 倍。


##### 补充：如何判断当前浏览器是否支持webp格式！！

- 方法一：用一个webp的图片地址赋给一个Image实例的src，这个image加载onload之后看能不能获取到图片的宽高，能获取到说明是支持的。其他任何情况（加载失败onerror或者拿不到宽高）都返回false

```
function isSupportWebp(imgPath) {
    let isSupportWebp = false
    const imgCheck = new Image()
    imgCheck.src = imgPath
    imgCheck.onload = () => {
        if (imgCheck.height > 0 && imgCheck.width > 0) {
            console.log('supprot pic', imgCheck.width, imgCheck.height)
            isSupportWebp = true
        }
    }
    return isSupportWebp
}
```


- 方法二：创建一个canvas，使用toDataUrl的方法把canvas的默认png格式转化成webp格式，如果转化之后他的dataUrl里面开头有“data:image/webp”，说明转化成功，浏览器支持webp格式

```
function isSupportWebp() {
    try {
        // 这里为什么要加一个!![].map，因为IE浏览器的Canvas没有toDataUrl的方法
        // 首先用数组的map方法来判断是否IE浏览器，然后才去后面的判断
        // 方法：使用!!将[].map返回的对象强制转化为布尔形式
        return(!![].map && document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0)
    } catch(err) {
        return false
    }
}
```


- 方法三：直接调出userAgent，看ua里面是否有某些IE浏览器的字段，有的话就不支持webp格式

```
function isSupportWebp() {
    const ua = navigator.userAgent
    const isIE = ua.indexOf('compatible') > -1 && ua.indexOf('MSIE') > -1
    const isIE11 = ua.indexOf('Trident') > -1 && ua.indexOf('rv:11.0') > -1
    if (isIE || isIE11) {
        return false
    } else {
        return true
    }
}
```



#### avif格式

https://help.aliyun.com/zh/oss/user-guide/integrate-web-support-for-avif-images
https://cloud.tencent.com/developer/article/1830689


- AVIF是一种基于AV1视频编码的新图像格式，相对于JPEG、WebP等图片格式压缩率更高，并且画面细节更好。
- AVIF通过使用更现代的压缩算法，在相同质量的前提下，AVIF文件大小是JPEG文件的35%左右。
- AVIF支持高动态范围（HDR）和标准动态范围 （SDR）内容，包括常用的sRGB和BT.2020色彩空间。

- 优点：
  - 支持8、10和12位的颜色深度
  - 胶片颗粒保留
  - PNG图像的透明度
  - GIF格式的动画


1. 用法一：picture标签
```
<picture>
    <source
        srcset="https://image-compress-demo.oss-cn-zhangjiakou.aliyuncs.com/demo.jpg?x-oss-process=image/format,avif"
        type="image/avif"
     />
     <img src="https://image-compress-demo.oss-cn-zhangjiakou.aliyuncs.com/demo.jpg"/>
 </picture>
 ```

上述代码：

- 采用HTML的picture标签，在picture标签中填写一个source标签和一个img标签，source标签设置为AVIF图片。浏览器会优先显示AVIF图片，如果浏览器渲染AVIF图片失败，就会再次请求img标签内的图片并正常渲染。（相当于有两次请求，多了一次请求量）

- 目前此方案不支持IE浏览器和OperaMini，因为该浏览器不支持picture标签。picture标签的兼容性如下图所示：


2. 用法二：js判断兼容性

```
async function supportsAvif() {
    if (!this.createImageBitmap) return false
    const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='
    const blob = await fetch(avifData).then((r) => r.blob())
    return createImageBitmap(blob).then(
        () => true,
        () => false
    )
}

(async () => {
    const classAvif = (await supportsAvif()) ? 'avif' : 'no-avif'document.body.classList.add(classAvif)
})()
```

css如下：

```
div {
   background-repeat: no-repeat;
   background-size: 500px 200px;
   width: 500px;
   height: 200px;
 }
 .avif div {
   background-image: url(https://image-compress-demo.oss-cn-zhangjiakou.aliyuncs.com/demo.jpg?x-oss-process=image/format,avif);
 }
 .no-avif div {
   background-image: url(https://image-compress-demo.oss-cn-zhangjiakou.aliyuncs.com/demo.jpg);
 }
```

上述代码：

- 除了使用picture标签外，还可以使用CSS+JS的方式，兼容显示AVIF图片。
- 使用supportsAvif方法判断浏览器是否支持AVIF，如果支持就设置div的样式为avif，背景图片设置为AVIF图片。
- 如果不支持就会设置div的样式为no-avif，背景图片设置为原图（其他格式备用图片也可以）



#### SVG
- 场景：图标，需要放大清晰度高的

- 优点：
  - 可以100%视觉还原，SVG图像在屏幕上总是边缘清晰，它的清晰度适合任何屏幕分辨力和打印分辨力。用户可以任意缩放图像显示，而不会破坏图像的清晰度、细节等。
  - SVG图像中的文字独立于图像，文字保留可编辑和可搜寻的状态。也不会再有字体的限制，用户系统即使没有安装某一字体，也会看到和他们制作时完全相同的画面。（文本类型）可通过 gzip 等压缩算法对文本进行压缩。
  - 总体来讲，SVG文件比那些GIF和JPEG格式的文件要小很多，因而下载也很快。
  - 随意修改颜色和宽高：：注意fill属性，颜色是在这里调整的，而宽高则是在svg标签中修改width与height属性

- 缺点：
  - 需要在导出svg切图的时候，图形边缘不留有空白，如果留有空白会导致原本像素对齐的边缘不再对齐到像素；但如果不统一切成正方形会增加开发难度



### 格式回退
https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/picture


- 尽管 AVIF 还没有得到广泛支持，但是我们仍然可以在原生 HTML 中使用带有 `<picture>`元素的格式。
- 元素允许渐进式支持，因为我们可以按照我们希望加载的顺序列出图像源，浏览器将加载它支持的第一个源。如果浏览器根本不支持`<picture>`，它将退回到使用默认的 `<img>`。


！！！！（也就是说，picture标签里面的img标签是回退的最最兜底格式）！！！！



- <img> 元素有两个目的：
  - 描述图像的大小和其他属性及其呈现。
  - 在所有的 <source> 元素提供的图片都不可用时提供备选图片。

1. 格式回退

```
<picture>
    <source srcset="img/photo.avif" type="image/avif">
    <source srcset="img/photo.webp" type="image/webp">
    <img src="img/photo.jpg" alt="Description of Photo">
</picture>
```


2. 响应式

```
<picture>
    <source srcset="mdn-logo-wide.png" media="(min-width: 600px)" />
    <img src="mdn-logo-narrow.png" alt="MDN" />
</picture>
```




## 整合格式
### css精灵图

- 场景：很多小图标，或者http1.1情况

- 优点：
  - 将静态图像连接成单个 sprite 文件可以减少页面上的请求总数，并允许更轻松地进行缓存。虽然由于多线程处理，HTTP/2 的请求数量可能不那么重要，但它仍然可能会有所帮助，具体取决于您的网站。


- 缺点：
  - 缓存效率： 如果 sprite 图中某个图像发生变化，即使其他图像没有改变，整个sprite图都需要重新下载和缓存，导致缓存失效；
  - 过度下载：当页面只需要 sprite 图中的几个图像时，仍然需要下载整个合并的图像，这可能导致不必要的数据传输；
  - 渲染性能：大型的 sprite 图可能对浏览器的渲染性能产生影响，尤其是在移动设备上，因为需要更多的 CPU和内存去处理大图像的解码、背景定位；


在 HTTP/2 时代 CSS sprites 可能不再是性能优化的最佳方案，icon fonts、base64 或 SVG 图像可能是更好的选择。


### Base64 编码

- 场景：小图片！！

- 优点：
  - 由于 JPEG、PNG 和 GIF 等格式图片无法被 gzip 等压缩算法压缩，所以通过配置 webpack，在打包时，将 JPEG、PNG 和 GIF 等格式图片转换为 图片 Base64 编码的 DataURI，即可通过 gzip 等压缩算法对文本进行压缩。

- 缺点：
  - 需要注意的是，将图片转换为图片 Base64 编码的 DataURI 字符串可能会导致文件大小变大，并且会影响到应用程序的加载速度。因此，建议只将小文件转换为 base64 编码的字符串，而将大文件编译成普通的图片文件。


#### Iconfont
https://www.cnblogs.com/linbudu/p/11068340.html

- 场景：图标

- 优点：可以通过 CSS 控制图标大小（ 使用 font-size）， 颜色，阴影，旋转等。

- 缺点：
  - icon font 在一倍屏幕下渲染效果并不好，在细节部分锯齿还是很明显的。因为浏览器认为其是文本，所以会对其使用抗锯齿，尤其在火狐浏览器上的渲染比在其它浏览器上的渲染要更重些。这会让整个页面显得不好看且笨重。（即便是加 henting hack，路径也会有瑕疵）。
  - 只支持单色，icon font 做为字体无法支持多色图形，这就对设计造成了许多限制，因此这也成为了 icon font 的一个瓶颈。


```
<style>
    @font-face{
        font-family: 'iconfont-css';
        src: url("../icomoon (4)/fonts/icomoon.ttf") format('truetype');
        font-weight: normal;
        font-style: normal;}
    .iconfont-css{
        display: inline-block;}
    .iconfont-css::before{
        content: '\e900';
        font-size: 32px;
        font-family: 'iconfont-css';}
</style>
<body>
<span><i class="iconfont-css">GayHub</i></span>
</body>
```


