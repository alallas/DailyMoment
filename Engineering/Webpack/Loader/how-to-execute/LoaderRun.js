// LoaderRun.js

const path = require('path');
const fs = require('fs');
const { runLoaders } = require('./loader-runner');

// 构造一个方法，使得相对路径变为绝对路径
let loadDir = path.resolve(__dirname, 'loaders');
const resolvePath = (loader) => path.resolve(loadDir, loader)


const moduleAndInlineLoaderCommand = '!!inline-loader1!inline-loader2!./src/index.js'
// 首先把开头的! !! -!三个符号去掉，-出现0或1次，！出现1或多次
// 然后把中间隔开的!做一个预防的处理，去掉多个!!!的情况
let inlineLoaders = moduleAndInlineLoaderCommand.replace(/^-?!+/, '').replace(/!!+/g, '!').split('!')


const modulePath = inlineLoaders.pop()
inlineLoaders = inlineLoaders.map(resolvePath)



const rules = [
  {
    test: /\.js$/,
    use: ['normal-loader1', 'normal-loader2'],
  },
  {
    test: /\.js$/,
    use: ['pre-loader1', 'pre-loader2'],
    enforce: 'pre',
  },
  {
    test: /\.js$/,
    use: ['pre-loader3'],
    enforce: 'pre',
  },
  {
    test: /\.js$/,
    use: ['post-loader1', 'post-loader2'],
    enforce: 'post',
  }
]

let preLoaders = [];
let postLoaders = [];
let normalLoaders = [];



for (let i = 0; i < rules.length; i++) {
  const rule = rules[i];
  if (rule.test.test(modulePath)) {
    if (rule.enforce === 'pre') {
      preLoaders.push(...rule.use)
    } else if (rule.enforce === 'post') {
      postLoaders.push(...rule.use)
    } else {
      normalLoaders.push(...rule.use)
    }
  }
}


preLoaders = preLoaders.map(resolvePath);
postLoaders = postLoaders.map(resolvePath);
normalLoaders = normalLoaders.map(resolvePath);


let allLoaders = []


if (moduleAndInlineLoaderCommand.startsWith('!!')) {
  // 不要前后置和普通loader，只要inlineloader
  allLoaders = [...inlineLoaders];
} else if (moduleAndInlineLoaderCommand.startsWith('!')) {
  // 不要普通loader
  allLoaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
} else if (moduleAndInlineLoaderCommand.startsWith('-!')) {
  // 不要前置和普通loader
  allLoaders = [...postLoaders, ...inlineLoaders];
} else {
  allLoaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
}


runLoaders({
  resource: path.join(__dirname, modulePath),
  loaders: allLoaders,
  readResource: fs.readFile.bind(fs)
}, (err, data) => {
  console.log(err);
  console.log(data);
})


