// loader-runner.js

const fs = require('fs');
const path = require('path');
const readFile = fs.readFile.bind(fs);

const PATH_QUERY = /^([^?#]*)(\?[^#]*)?(#.*)?$/;


function resolveQueryPath(resource) {
  let result = PATH_QUERY.exec(resource);
  return {
    resourcePath: result[1],      // ./src/inde.js
    resourceQuery: result[2],     // ?name=zzzzz
    resourceFragment: result[3],  // #top
  }
}


function createLoaderObject(loader) {
  let obj = {
    path: '',
    query: '',
    fragment: '',

    normal: null, // loader的主函数
    pitch: null, // 当前loader的pinch函数
    pitchExecuted: false, // 当前的pitch函数已经执行过了
    normalExecuted: false, // 当前的normal函数已经执行过了

    raw: null, // normal.raw为true表示这是一个buffer
    data: {}, //当前loader的数据

  }

  // 提供一个【还原】方法，调用loader.request可以拿到loader原来的绝对路径
  Object.defineProperty(obj, 'request', {
    get() {
      return obj.path +
      (obj.query ? obj.query : '') + 
      (obj.fragment ? obj.fragment : '');
    },
    set(value) {
      let { resourcePath, resourceQuery, resourceFragment } = resolveQueryPath(value);
      obj.path = resourcePath;
      obj.query = resourceQuery;
      obj.fragment = resourceFragment;
    }
  })

  obj.request = loader;
  return obj;
}


function processResource(processOptions, loaderContext, callback) {
  // 重置index为最后一个
  loaderContext.loaderIndex = loaderContext.loaders.length - 1;

  // 开始读取这个资源里面的内容，读完之后执行里面的回调函数，也就是开始进入normal函数的迭代
  let resourcePath = loaderContext.resourcePath;
  processOptions.readResource(resourcePath, (err, buffer) => {
    if (err) return callback(err)
    processOptions.resourceBuffer = buffer; // 保存好原始的代码
    iterateNormalLoaders(processOptions, loaderContext, [buffer], callback)
  });

}


function convertArgs(args, raw) {
  // 如果需要buffer（raw为true），且现在不是buffer，需要转化成buffer
  if (raw && !Buffer.isBuffer(args[0])) {
    args[0] = Buffer.from(args[0], 'utf8')
  } else if (!raw && Buffer.isBuffer(args[0])) {
    // 不需要buffer，但现在是buffer，转化成字符串
    args[0] = args[0].toString('utf8')
  }
}






// 为什么normal函数要加上一个args的参数，因为normal函数的出参是要给上一个normal函数的入参的，需要迭代执行
function iterateNormalLoaders(processOptions, loaderContext, args, callback) {

  // normal全部执行完之后，就执行最外部的callback函数了，传出转换后的buffer
  if (loaderContext.loaderIndex < 0) {
    return callback(null, args)
  }

  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.normalExecuted) {
    loaderContext.loaderIndex --;
    return iterateNormalLoaders(processOptions, loaderContext, args, callback);
  }

  let normalFunction = currentLoaderObject.normal;
  currentLoaderObject.normalExecuted = true;

  // 把buffer转化成字符串，或相反
  convertArgs(args, currentLoaderObject.raw);

  runSyncOrAsync(
    normalFunction,
    loaderContext,
    args,

    // switchNextCallback回调函数
    function (err) {
      if (err) return callback(err);
      let newArgs = Array.prototype.slice.call(arguments, 1);
      iterateNormalLoaders(processOptions, loaderContext, newArgs, callback)
    }
  )
}




function iteratePitchingLoaders(processOptions, loaderContext, callback) {

  // 终止条件
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    // pitch函数到头的，开始读取资源
    return processResource(processOptions, loaderContext, callback)
  }

  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex ++;
    return iteratePitchingLoaders(processOptions, loaderContext, callback);
  }
  
  // 为currentLoaderObject的normal和pitch赋值，拿到真正的loader函数
  loadLoader(currentLoaderObject)

  let pitchFunction = currentLoaderObject.pitch;
  currentLoaderObject.pitchExecuted = true;

  // 这里为什么要这么设计呢
  // 如果当前的loader没有pitch函数，那直接index++去到下一个，pitchExecuted还是false不行吗，为什么要重新进到自己的loader的内部

  // 回答：很多地方都用到了index++去执行下一个，比如 1. 没有pitch函数；2. pitch函数执行完了，且没有返回值
  // 写成这样是1.说明pitch函数我已经操作过了（无论有无） 2.再次进入自己的loader世界，如果pitch函数已经操作过了，才进入下一个 3.两个步骤都可以公共地写，不用分开两次写
  if (!pitchFunction) {
    return iteratePitchingLoaders(processOptions, loaderContext, callback)
  }

  runSyncOrAsync(
    pitchFunction,
    loaderContext, 

    // 下面是要传递给pitch函数的参数
    [loaderContext.remainingRequest, loaderContext.previousRequest, loaderContext.data = {}],

    // ！！关键的回调函数，【链条节点的对外开关】，决定往前走还是往后走
    function (err, args) {

      // 如果args有值，说明pitch函数有返回值，index--，开始回退了
      if (args) {
        loaderContext.loaderIndex--;
        iterateNormalLoaders(processOptions, loaderContext, Array.isArray(args) ? args : [args], callback);
      } else {
        // 如果没有返回值，执行下一个loader的pitch函数
        return iteratePitchingLoaders(processOptions, loaderContext, callback);
      }
    }
  );



}


function loadLoader(loaderObject) {
  const module = require(loaderObject.path);
  loaderObject.normal = module;
  loaderObject.pitch = module.pitch;
  loaderObject.raw = module.raw;
}


function runSyncOrAsync(fn, context, fnArgs, switchNextCallback) {
  let isSync = true; // 默认是同步
  let isDone = false; // 函数是否已经执行过了

  // 异步的设置，等pitch函数调用才执行，此时把isSync变为false，下面的同步就不会执行了
  // 然后一直等，等到innerCallback被调用才去执行开关函数，决定往哪里走
  context.async = function () {
    isSync = false;

    // 为什么要把这个函数赋予给两个变量，因为：可以从不同的方式拿到这个函数然后手动调用
    const innerCallback = context.callback = function (err, ...args) {
      isDone = true;
      // 保证不会走下面的同步函数了
      isSync = false;
      // 这里的args是本innerCallback函数的参数，也就是调用context.callback方法传递的参数（这个参数相当于【同步函数里面的return值】）
      switchNextCallback(null, ...args);
    }

    return innerCallback;
  }


  // 调用pitch函数
  const result = fn.apply(context, fnArgs)


  // 同步的执行，去执行开关函数，决定往哪里走
  if (isSync) {
    isDone = true;
    return switchNextCallback(null, result)
  }

}


exports.runLoaders = function(options, callback) {

  // module 的绝对路径
  let moduleResource = options.resource || '';

  // loaders数组
  let loaders = options.loaders || [];
  // loader执行的时候的上下文
  let loaderContext = {};

  // 读文件的方法（为什么要传递参数？？？？？）
  let readResource = options.readResource || readFile;

  // 解析路径，保存一下当前module所在的目录（文件夹），以及解析结果
  let { resourcePath, resourceQuery, resourceFragment } = resolveQueryPath(moduleResource)
  loaderContext.moduleContext = path.dirname(resourcePath)
  loaderContext.resourcePath = resourcePath;
  loaderContext.resourceQuery = resourceQuery;
  loaderContext.resourceFragment = resourceFragment;

  // 生成loader对象数组，保存
  loaders = loaders.map(createLoaderObject)
  

  // 保存当前loader的索引
  loaderContext.loaderIndex = 0;
  loaderContext.loaders = loaders;

  loaderContext.async = null;
  loaderContext.callback = null;


  // 输出一个方法，可以查询moduleResource的绝对路径
  // 这不可以直接保存moduleResource吗，也就是loaderContext.moduleResource = moduleResource
  Object.defineProperty(loaderContext, 'moduleResource', {
    get() {
      return loaderContext.resourcePath + loaderContext.resourceQuery + loaderContext.resourceFragment;
    }
  })


  // 输出一个方法，可以拿到loader的绝对路径数组和module的绝对路径数组的结合
  // request为【loader1的绝对路径！loader2的绝对路径！module的绝对路径】
  Object.defineProperty(loaderContext, 'request', {
    get() {
      return loaders.map(i => i.request).concat(loaderContext.moduleResource).join('!')
    }
  })



  // 剩下的loader和module的绝对路径
  Object.defineProperty(loaderContext, 'remainingRequest', {
    get() {
      return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(i => i.request).concat(loaderContext.moduleResource).join('!')
    }
  })


  // 当前及之后的loader和module的绝对路径
  Object.defineProperty(loaderContext, 'currentRequest', {
    get() {
      return loaderContext.loaders.slice(loaderContext.loaderIndex).map(i => i.request).concat(loaderContext.moduleResource).join('!')
    }
  })


  // 执行过的loader的绝对路径
  Object.defineProperty(loaderContext, 'previousRequest', {
    get() {
      return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(i => i.request).join('!')
    }
  })


  // 当前的loader的options或者query
  Object.defineProperty(loaderContext, 'query', {
    get() {
      let loader = loaderContext.loaders[loaderContext.loaderIndex];
      return loader.options || loader.query;
    }
  })

  // 当前的loader的data
  Object.defineProperty(loaderContext, 'data', {
    get() {
      let loader = loaderContext.loaders[loaderContext.loaderIndex];
      return loader.data;
    }
  })


  let processOptions = {
    resourceBuffer: null, // 最后会把loader执行的buffer放在这里
    readResource,
  }

  iteratePitchingLoaders(processOptions, loaderContext, function(err, result) {
    if (err) {
      return callback(err, {});
    }
    callback(null, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    })
  })
}


