
### webpack侧异步加载（执行js）
https://segmentfault.com/a/1190000020233387

交互型懒加载

如题：
```
const button = document.createElement('button');
button.innerHTML = '关注 webyouxuan';
document.body.appendChild(button);
document.addEventListener('click',()=>{
    import('./a').then(data=>{
        console.log(data.default);
    })
});
```

打包出来的函数清单里面长这样：
```
 "./src/index.js":
 ((__unusedmodule, __unusedexports, __webpack_require__) => {
eval(`
    const button = document.createElement('button');
    button.innerHTML = '关注 webyouxuan';
    document.body.appendChild(button);
    document.addEventListener('click',()=>{
       __webpack_require__.e("src_a_js").then(
          __webpack_require__.t.bind(__webpack_require__, "./src/a.js", 7)).then(data=>{
            console.log(data.default);
          })
     })
    `);
 })
```

#### step1
创建script
```
__webpack_require__.f = {};
__webpack_require__.e = (chunkId) => { // chunkId => src_a_js动态加载的模块
    return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
        __webpack_require__.f[key](chunkId, promises); // 调用j方法 将数组传入return promises;
    }, []));
};
// 紫色相当于j方法


var installedChunks = {
    "main": 0 // 默认main已经加载完成
};
// f方法上有个j属性
__webpack_require__.f.j = (chunkId, promises) => {
    var installedChunkData = Object.prototype.hasOwnProperty.call(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
    if(installedChunkData !== 0) {  // 默认installedChunks肯定没有要加载的模块
    
        if(installedChunkData) {
            promises.push(installedChunkData[2]);
        } else {
            if(true) { // 创建一个promise 把当前的promise 成功失败保存到 installedChunks
                var promise = new Promise((resolve, reject) => {
                    installedChunkData = installedChunks[chunkId] = [resolve, reject];
                });
                // installedChunks[src_a_js] = [resolve,reject,promise]
                promises.push(installedChunkData[2] = promise);
                
                // 这句的意思是看是否配置publicPath，配置了就加个前缀
                var url = __webpack_require__.p + __webpack_require__.u(chunkId);
                
                // 1)创建script标签var script = document.createElement('script');
                var onScriptComplete;
                script.charset = 'utf-8';
                script.timeout = 120;
                script.src = url; // 2)开始加载这个文件var error = new Error();
                onScriptComplete = function (event) { //  完成工作
                    script.onerror = script.onload = null;
                    clearTimeout(timeout);
                    var reportError = loadingEnded();
                    if(reportError) {
                        var errorType = event && (event.type === 'load' ? 'missing' : event.type);
                        var realSrc = event && event.target && event.target.src;
                        error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
                        error.name = 'ChunkLoadError';
                        error.type = errorType;
                        error.request = realSrc;
                        reportError(error);
                    }
                };
                var timeout = setTimeout(function(){ // 超时工作onScriptComplete({ type: 'timeout', target: script });
                }, 120000);
                script.onerror = script.onload = onScriptComplete;
                document.head.appendChild(script); // 3)将标签插入到页面
            } else installedChunks[chunkId] = 0;
        }
    }
};
```

#### step2
合并module到原本的主chunk，执行e方法产生的异步函数
```
function webpackJsonpCallback(data) { // 3) 文件加载后会调用此方法
    var chunkIds = data[0]; // data是什么来着，你看看src_a_js怎么写的你就知道了 看上面！ ["src_a_js"]
    var moreModules = data[1]; // 获取新增的模块
    var moduleId, chunkId, i = 0, resolves = [];
    
    for(;i < chunkIds.length; i++) {
        chunkId = chunkIds[i];
        if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
            // installedChunks[src_a_js] = [resolve,reject,promise] 这个是上面做的
            // 很好理解 其实就是取到刚才放入的promise的resolve方法
            resolves.push(installedChunks[chunkId][0]);
        }
        installedChunks[chunkId] = 0; // 模块加载完成
    }
    
    // 将新增模块与默认的模块进行合并 也是就是modules模块，这样modules中就多了动态加载的模块
    for(moduleId in moreModules) {
        if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
            __webpack_require__.m[moduleId] = moreModules[moduleId];
        }
    }
    
    if(runtime) runtime(__webpack_require__);
    if(parentJsonpFunction) parentJsonpFunction(data);

    // 调用promise的resolve方法，这样e方法就调用完成了
    while(resolves.length) { 
        resolves.shift()();
    }
};

var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || []; // 1) window["webpackJsonp"]等于一个数组
var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
jsonpArray.push = webpackJsonpCallback; // 2) 重写了数组的push方法
var parentJsonpFunction = oldJsonpFunction;
```


#### step3
e方法产生的异步函数执行并.then()之后，同步执行__webpack_require__，得到打包后的uglyJS代码
```
__webpack_require__.t = function(value, mode) { // t方法其实很简单就是
    if(mode & 1) value = this(value); // 就是调用__webpack_require__加载最新的模块
};
```


### React侧异步加载（加载js渲染组件）
https://blog.csdn.net/sinat_17775997/article/details/106794133

组件型懒加载

#### step1
react router监测到路由变化，需要xx组件。判断组件类型，初始化一个对应类型的对象
```
// 初始新建一个对象
export function lazy<T, R>(ctor: () => Thenable<T, R>): LazyComponent<T> {
  let lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _ctor: ctor,
    // React uses these fields to store the result.
    _status: -1,
    _result: null,
  };
 
  return lazyType;
}


// 开启一系列嵌套函数
...
case LazyComponent: {
  const elementType = workInProgress.elementType;
  return mountLazyComponent(
    current,
    workInProgress,
    elementType,
    updateExpirationTime,
    renderExpirationTime,
  );
}
...


function mountLazyComponent(
  _current,
  workInProgress,
  elementType,
  updateExpirationTime,
  renderExpirationTime,
) { 
  ...
  let Component = readLazyComponentType(elementType);
  ...
}
```


#### step2
异步import模块的代码，向上抛出此时的promise函数
```
// Pending = 0, Resolved = 1, Rejected = 2
export function readLazyComponentType<T>(lazyComponent: LazyComponent<T>): T {
  const status = lazyComponent._status;
  const result = lazyComponent._result;
  switch (status) {
    case Resolved: {
      const Component: T = result;
      return Component;
    }
    case Rejected: {
      const error: mixed = result;
      throw error;
    }
    case Pending: {
      const thenable: Thenable<T, mixed> = result;
      throw thenable;
    }
    default: { // lazyComponent 首次被渲染
      lazyComponent._status = Pending;
      const ctor = lazyComponent._ctor;
      const thenable = ctor();
      thenable.then(
        moduleObject => {
          if (lazyComponent._status === Pending) {
            const defaultExport = moduleObject.default;
            lazyComponent._status = Resolved;
            lazyComponent._result = defaultExport;
          }
        },
        error => {
          if (lazyComponent._status === Pending) {
            lazyComponent._status = Rejected;
            lazyComponent._result = error;
          }
        },
      );
      // Handle synchronous thenables.
      switch (lazyComponent._status) {
        case Resolved:
          return lazyComponent._result;
        case Rejected:
          throw lazyComponent._result;
      }
      lazyComponent._result = thenable;
      throw thenable;
    }
  }
}
```

其中，ctor即import()的函数如下：
```
function import(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const tempGlobal = "__tempModuleLoadingVariable" + Math.random().toString(32).substring(2);
    script.type = "module";
    script.textContent = `import * as m from "${url}"; window.${tempGlobal} = m;`;
 
    script.onload = () => {
      resolve(window[tempGlobal]);
      delete window[tempGlobal];
      script.remove();
    };
 
    script.onerror = () => {
      reject(new Error("Failed to load module script with URL " + url));
      delete window[tempGlobal];
      script.remove();
    };
 
    document.documentElement.appendChild(script);
  });
}
```


#### step3
suspense接受到下层返回的promise，判断显示loading还是组件
```
class Suspense extends React.Component {
  state = {
    promise: null
  }
 
  componentDidCatch(err) {
    // 判断 err 是否是 thenable
    if (err !== null && typeof err === 'object' && typeof err.then === 'function') {
      this.setState({ promise: err }, () => {
        err.then(() => {
          this.setState({
            promise: null
          })
        })
      })
    }
  }
 
  render() {
    const { fallback, children } = this.props
    const { promise } = this.state
    return <>{ promise ? fallback : children }</>
  }
}
```



### webpack配置

基本结构：
- entry
  - 名字：路径
- modules（就是loader）
  - （一个）：
- Plugin
  - CommonsChunkPlugin
- output
  - filename：是否需要动态名字[name].js
  - path：路径

```
const webpack = require('webpack')
module.exports = {
    entry: {
        foo: './foo.js',
        vendor: ['react'] //没有设置路径，默认去node_modules模块下面去找
    },
    output: {
        filename:'[name].js'
    },
    plugin: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor', // 打包出来的文件的chunk名字
            filename: 'vendor.js' // 提取后的资源文件名，即bundle的名字
            chunks: ['a','b']
        })
    ]
}
```


#### plugin
##### CommonsChunkPlugin
https://juejin.cn/post/7312293783973462016

1. 原理：
- 多入口：所有入口文件的共同import的module
- 单入口：
  - 设置一个额外的数组形式的入口，里面是【想要提取的公共部分】，其与入口文件的公共部分就是额外入口本身
  - 使用一样的name，比如vendor，作为生成的公共部分，覆盖原来的入口文件，成为一个chunk

```
const webpack = require('webpack')
module.exports = {
    entry: {
        foo: './foo.js',
        vendor: ['react'] //没有设置路径，默认去node_modules模块下面去找
    },
    output: {
        filename:'[name].js'
    },
    plugin: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor', // 打包出来的文件的chunk名字
            filename: 'vendor.js' // 提取后的资源文件名，即bundle的名字
        })
    ]
}
```

2. 配置项：
- 设置【找公共部分】的入口范围
chunk：【】

```
const webpack = require('webpack')
module.exports = {
    entry: {
        a: './a.js',
        b: './b.js',
        c: './c.js'
    },
    output: {
        filename:'[name].js'
    },
    plugin: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            filename: 'vendor.js',
            chunks: ['a','b']
        })
    ]
}
```

- 设置最小出现次数：
如果小于此个最小出现次数，那么不会被提取（数组形式的入口不受这个数字的限制）

```
const webpack = require('webpack')
module.exports = {
    entry: {
        foo: './foo.js',
        bar: './bar.js',
        vendor: ['react']
    },
    output: {
        filename:'[name].js'
    },
    plugin: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js',
            minChunks: 3
        })
    ]
}


// 更高级的minChunk设置，返回true表明需要提取当前module的公共部分
new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.js',
    minChunks: function(module,count){
        //module.context 模块目录路径
        if(module.context && module.context.includes('node_modules')){
            return true
        }
        //module.resource 包含模块名的完整路径
        if(module.resource && module.resource.endWith('util.js')){
            return true
        }
        //count为模块被引用次数
        if(count > 5){
            return true
        }
    }
})
```

比如：

这里util.js只是引用了两次，因此不会被打包，但是react是数组形式引入的，不受minChunks的影响，此时react的提取规则就是CommonsChunkPlugin的默认提取规则，有了两个入口引用了react，那么react就会被提取


##### SplitChunks

- 使用optimization.splitChunks代替了CommonsChunkPlugin，并指定chunks的值为all，这个配置项的含义是，SplitChunks会对所有的chunks生效（默认情况下，SplitChunks只对异步chunks生效，并且不需要配置，也就是异步的代码都会进行分包处理，无论大小）
- mode是webpack4新增的配置项，可以针对当前是开发环境还是生产环境自动添加对应的一些webpack配置

```
//webpack.config.js
module.exports = {
    entry: {
        foo: './foo.js',
    },
    output: {
        filename:'[name].js',
        publicPath:'/dist/'
    },
    mode:'development',
    optimization:{
        splitChunks: {
            chunks: 'all'
        }
    }
}
```


