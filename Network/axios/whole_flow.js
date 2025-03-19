


// 工具函数

// utils.forEach函数就是下面的函数


var utils = {
  forEach(obj, fn, {allOwnKeys = false} = {}) {
    if (obj === null || typeof obj === 'undefined') {
      return;
    }
    let i;
    let l;
    if (typeof obj !== 'object') {
      obj = [obj];
    }
    if (isArray(obj)) {
      for (i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // 找到非原型属性！！
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;

      // 遍历这些属性，执行函数
      for (i = 0; i < len; i++) {
        key = keys[i];
        fn.call(null, obj[key], key, obj);
      }
    }
  },
  
  // 下面是深度合并
  merge() {
    const {caseless} = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key) => {
      const targetKey = caseless && findKey(result, key) || key;
      if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
        result[targetKey] = merge(result[targetKey], val);
      } else if (isPlainObject(val)) {
        result[targetKey] = merge({}, val);
      } else if (isArray(val)) {
        result[targetKey] = val.slice();
      } else {
        result[targetKey] = val;
      }
    }
  
    for (let i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach(arguments[i], assignValue);
    }

    return result;
  },
  typeOfTest(type) {
    return thing => typeof thing === type;
  },
  isFunction() {
    return this.typeOfTest('function');
  },
  isFormData(thing) {
    let kind;
    return thing && (
      // 先判断入参是否是FormData的实例，是的话直接返回true
      (typeof FormData === 'function' && thing instanceof FormData) || (
        // 不是的话看thing里面有没有append函数，没有的话返回false
        isFunction(thing.append) && (
          // 如果有的话，看kind是否是'formdata'、'object'类型
          // kindOf 是一个返回对象类型标识的函数（如返回 'formdata'、'object' 等）
          (kind = kindOf(thing)) === 'formdata' ||
          (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
        )
      )
    )
  },
  findKey(obj, key) {
    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
      _key = keys[i];
      if (key === _key.toLowerCase()) {
        return _key;
      }
    }
    return null;
  }
}




// REVIEW - 




// axios的get函数执行进来的是第二个return里面的函数
// thisArg是一个对象，有 defaults、interceptors 两个属性

function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// 上面的fn进来就是下面函数的return的函数
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  // 针对这些【xxx】的方法，给axios类的原型加上一个方法
  Axios.prototype[method] = function(url, config) {

    // this指的是Axios的实例，这里直接看下面的request函数
    // 返回的是一个promise
    return this.request(mergeConfig(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});



function mergeConfig(config1, config2) {
  // 又是一个工厂模式的工具包！
  // 把公用的配置和自定义的配置混合在一起

  // 入参：
  // 从方法如get等函数进来
  // config1是自定义的配置
  // config2是默认的配置，有method、url、data

  // 从_request进来
  // config1是默认的配置
  // config2是自定义的配置，有method、url、data等

  config2 = config2 || {};
  const config = {};

  function getMergedValue(target, source, prop, caseless) {
    // 在这个函数中，source一般是默认的配置，通常来说是有值的
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      // 下面的情况是两者都是一个对象
      // 深度合并到一个第三方新对象
      return utils.merge.call({caseless}, target, source);

    } else if (utils.isPlainObject(source)) {
      // 下面的情况是target不是一个对象，而source是一个对象
      // 直接深度合并到一个新对象然后返回
      return utils.merge({}, source);

    } else if (utils.isArray(source)) {
      // 下面的情况是target不是一个对象，而source是一个数组
      // 返回一个新数组
      return source.slice();
    }

    // 下面的情况是：source不是一个对象，而target也不是一个对象 或者 target或source是undefined
    // 直接返回该对象
    return source;
  }

  // 深度合并，此时一般config1是默认的配置，一般都是存在的，因此看source有无来绝对是否需要这个入参
  function mergeDeepProperties(a, b, prop , caseless) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(a, b, prop , caseless);
    } else if (!utils.isUndefined(a)) {
      return getMergedValue(undefined, a, prop , caseless);
    }
  }

  // url、method和data的合并方式，target为undefined，只关注source
  // 只有三件套才用这种方法，因为三件套是最基础最简单的数据类型
  // 当三件套要合并时，通常config2是默认的配置（method、url、data），config1是自定义的配置
  // 这里把自定义的配置的三件套的内容设为undefined，也就是只看默认的值，要么深层合并，要么返回自身
  function valueFromConfig2(a, b) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(undefined, b);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(a, b) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(undefined, b);
    } else if (!utils.isUndefined(a)) {
      return getMergedValue(undefined, a);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(undefined, a);
    }
  }

  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b , prop) => mergeDeepProperties(headersToObject(a), headersToObject(b),prop, true)
  };

  utils.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
    // 根据配置里面的每一个props指定合并函数，没有的话统一用深度合并
    const merge = mergeMap[prop] || mergeDeepProperties;

    // 执行合并方法，拿到合并之后的结果（三件套要么深层合并，要么返回自身）
    const configValue = merge(config1[prop], config2[prop], prop);

    // 只有在configValue是undefined且merge方法是除了mergeDirectKeys之外的其他方法的情况下，才抛弃这个属性
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  // 返回合并之后的对象
  return config;
}








// REVIEW - 核心的request或者_request函数






// 合并完配置项后来到这里
async function request(configOrUrl, config) {
  // 入参：configOrUrl是合并之后的配置项

  // 这个函数相当于包裹了this._request函数，并保存错误捕获的逻辑

  try {
    return await this._request(configOrUrl, config);
  } catch (err) {
    if (err instanceof Error) {
      let dummy = {};

      Error.captureStackTrace ? Error.captureStackTrace(dummy) : (dummy = new Error());

      const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
      try {
        if (!err.stack) {
          err.stack = stack;
        } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
          err.stack += '\n' + stack
        }
      } catch (e) {
      }
    }

    throw err;
  }
}




// 合并完配置项后，通过request来到这里

function _request(configOrUrl, config) {
  // 入参：configOrUrl是合并之后的配置项，比如：
  // { url: 'xxxxxxx', method: 'get' }

  // 1. 入参统一为一个对象
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  // this.defaults是axios类初始化的时候传入的对象instanceConfig
  config = mergeConfig(this.defaults, config);

  const {transitional, paramsSerializer, headers} = config;

  // 2. 数据检验与修正
  // 1）过渡性配置transitional对象,里面长这样
  // {
  //   clarifyTimeoutError: false
  //   forcedJSONParsing: true
  //   silentJSONParsing: true
  // }
  if (transitional !== undefined) {
    // assertOptions实际上在遍历，
    // validators.transitional实际上在执行validators.validator函数
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }
  // 2）参数序列化器paramsSerializer
  if (paramsSerializer != null) {
    if (utils.isFunction(paramsSerializer)) {
      config.paramsSerializer = {
        serialize: paramsSerializer
      }
    } else {
      validator.assertOptions(paramsSerializer, {
        encode: validators.function,
        serialize: validators.function
      }, true);
    }
  }
  // 3）设置 allowAbsoluteUrls（是否允许绝对 URL）
  if (config.allowAbsoluteUrls !== undefined) {
  } else if (this.defaults.allowAbsoluteUrls !== undefined) {
    config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
  } else {
    config.allowAbsoluteUrls = true;
  }
  // 4）拼写校验（如 baseUrl -> baseURL）
  validator.assertOptions(config, {
    baseUrl: validators.spelling('baseURL'),
    withXsrfToken: validators.spelling('withXSRFToken')
  }, true);
  // 5）设置请求方法（默认 'get'）
  config.method = (config.method || this.defaults.method || 'get').toLowerCase();


  // 3. 请求头处理
  // 1）合并公共头和方法特定头（如 headers.get 和 headers.common）
  let contextHeaders = headers && utils.merge(
    headers.common,
    headers[config.method]
  );
  // 2）首先删除方法特定的头属性（之前提取出来过，这里先删掉，后面会合并进去的）
  headers && utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    (method) => {
      delete headers[method];
    }
  );
  // 3）然后合并，合并后的头赋值给 config.headers
  config.headers = AxiosHeaders.concat(contextHeaders, headers);


  // 3. 拦截器链构建（this.interceptors里面的request和response是拦截器）
  // 1）请求拦截器
  const requestInterceptorChain = [];
  let synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    // 根据 runWhen 条件跳过拦截器
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }
    // 存在异步拦截器时，整体标记为异步
    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
    // 从头加入拦截器的完成/失败函数（先进后出）
    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  // 2）响应拦截器
  const responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    // 从尾加入拦截器的完成/失败函数（先进先出）
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });


  // 4. 开始执行请求拦截器

  let promise;
  let i = 0;
  let len;

  // 1）存在异步请求拦截器，额外处理（全部类型的拦截器一起处理）
  if (!synchronousRequestInterceptors) {
    // 首先构建完整的链条
    // [请求拦截器..., dispatchRequest, 响应拦截器...]
    const chain = [dispatchRequest.bind(this), undefined];
    chain.unshift.apply(chain, requestInterceptorChain);
    chain.push.apply(chain, responseInterceptorChain);
    len = chain.length;

    // 通过 Promise 链按顺序执行
    promise = Promise.resolve(config);
    while (i < len) {
      // 将返回的新promise一直替换原本的promise
      promise = promise.then(chain[i++], chain[i++]);
    }
    // 返回这个promise链条
    return promise;
  }


  // 2）请求拦截器全都是同步的情况：
  len = requestInterceptorChain.length;
  let newConfig = config;
  i = 0;

  // 按顺序同步执行请求拦截器
  while (i < len) {
    const onFulfilled = requestInterceptorChain[i++];
    const onRejected = requestInterceptorChain[i++];
    try {
      // 这里有可能修改配置，所以直接覆盖！
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected.call(this, error);
      break;
    }
  }

  // 然后执行中间的dispatchRequest函数
  try {
    promise = dispatchRequest.call(this, newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  // 然后按顺序异步执行响应拦截器
  i = 0;
  len = responseInterceptorChain.length;

  while (i < len) {
    promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
  }

  // 最后返回这个promise链
  return promise;
}







// REVIEW - 验证器validators



const validators = {};
const validator = {};


// 这个函数实际上就是去执行validator函数
// 看配置里面的transional的属性值的类型是不是对应着自己手动输入进去的类型
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // 返回一个函数，上面缓存入参的validator，也就是validators.boolean
  return (value, opt, opts) => {
    // 入参：
    // value就是配置config里面transitional对象对应的boolean值
    // opt就是对应的属性名字
    // opts就是配置config里面transitional对象
    if (validator === false) {
      throw new AxiosError(
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        AxiosError.ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    // 直接去执行validator函数(也就是validators.boolean的方法，实际上就是‘boolean’函数)
    // 可是'boolean'并等于typeof value的返回值（布尔类型），那么直接返回true
    return validator ? validator(value, opt, opts) : true;
  };
};



['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});



validator.assertOptions = function (options, schema, allowUnknown) {
  // 入参：
  // options是transitional对象，里面长这样
  // {
  //   clarifyTimeoutError: false
  //   forcedJSONParsing: true
  //   silentJSONParsing: true
  // }
  // schema是一个对象，里面的属性值是一个函数，是validators.transitional函数

  if (typeof options !== 'object') {
    throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
  }

  // 下面相当于从一个地方（config.transitional）拿出一个配置项（boolean形式，以此说明这个配置项是否需要！）
  // 从另外一个地方(validators.transitional)拿出一个函数，然后结合两者执行
  // 倒序遍历
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    // 从schema对象里面拿出对应的函数
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      // 函数存在的话，拿到对应的boolean值
      const value = options[opt];
      // 然后执行validator函数（就是validators.transitional的返回值），前两个入参是boolean值和属性名字
      const result = value === undefined || validator(value, opt, options);
      // 拿到结果，不是true就抛出错误
      if (result !== true) {
        throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    // 遍历到最后没错就ok！
    if (allowUnknown !== true) {
      throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
    }
  }
}



validators.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  }
};







// REVIEW - dispatchRequest函数【promise执行链中间的函数】





function dispatchRequest(config) {
  // 检查 config 中是否存在取消标记（如 cancelToken 或 signal），
  // 若请求已被取消，立即抛出错误，中断后续流程。
  throwIfCancellationRequested(config);

  // 1. 请求头标准化
  // 将用户传入的 headers（可能是普通对象或字符串）转换为 Axios 内部统一的 AxiosHeaders 实例（赋予很多方法）
  config.headers = AxiosHeaders.from(config.headers);

  // 2. 请求数据转化（格式化data数据）
  // 按顺序执行 config.transformRequest 数组中的一个函数，将对象转为 JSON 字符串
  config.data = transformData.call(
    config,
    config.transformRequest
  );

  // 3. 设置Content-Type【一般Content-Type在上面的data数据转化中就根据数据类型而被设置好了】
  // 仅当请求方法是 POST、PUT 或 PATCH 时，默认设置Content-Type为 application/x-www-form-urlencoded
  if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
    config.headers.setContentType('application/x-www-form-urlencoded', false);
  }

  // 4. 执行适配器并处理响应
  // 1）找到能用的适配器
  // config.adapter是一个数组，里面是[xhr,http,fetch]，都是浏览器本身的底层API，直接调用是发出网络请求
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter);

  // 2）调用这个适配器（相当于借用xhr的API发出网络请求）——去看xhr部分
  return adapter(config).then(function onAdapterResolution(response) {
    // 成功回调
    throwIfCancellationRequested(config);

    // 将原始响应数据（如 JSON 字符串）转换为目标格式（如对象）
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    // 转化响应头为内部统一的 AxiosHeaders 实例（赋予很多方法）
    response.headers = AxiosHeaders.from(response.headers);

    return response;
  }, function onAdapterRejection(reason) {
    // 失败回调
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // 处理 HTTP 错误（如 404、500）
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders.from(reason.response.headers);
      }
    }

    // 传递错误
    return Promise.reject(reason);
  });
}


function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new CanceledError(null, config);
  }
}


function transformData(fns, response) {
  // 入参：
  // fns就是config.transformRequest数组或者是config.transformResponse
  // response是只有在收到数据之后调用本方法的时候才会传入这个第二参数，response长这样
    // config = {transitional: {…}, adapter: Array(3), transformRequest: Array(1), transformResponse: Array(1), timeout: 0, …}
    // data = '{"data":{"banner":{"context":{"currentTime":1538014774},"isEnd":true,"list":[{"acm":"3.mce.2_10_1jhwa.43542.0.ccy5br4OlfK0Q.pos_0-m_454801-sd_119","height":390,"height923":390}],"nextPage":1}},"returnCode":"SUCCESS","success":true}\n'
    // headers = content-length: 4605 content-type: application/json
    // request = XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, …}
    // status = 200
    // statusText = 'OK'

  // this指的是axios实例
  const config = this || defaults;
  // 请求时执行这个函数是没有response的，取的是配置大对象config（请求头和data都从配置里面拿出来）
  // 响应之后这个context取得是response数据（请求头和data都从返回的数据里面拿出来）
  const context = response || config;
  // 请求头实例
  const headers = AxiosHeaders.from(context.headers);
  let data = context.data;

  // 开始遍历config.transformRequest/Response数组，执行函数，转换对象为JSON 或者 转换JSON为对象
  // 这个config.transformRequest/Response数组存在下面的defaults对象里面
  utils.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });

  headers.normalize();

  return data;
}

const defaults = {

  // 这里的transitional就是默认值，就是下面这个
  // {
  //   clarifyTimeoutError: false
  //   forcedJSONParsing: true
  //   silentJSONParsing: true
  // }
  transitional: transitionalDefaults,

  // 请求
  transformRequest: [function transformRequest(data, headers) {
    // 入参：
    // data就是config里面的data属性
    // headers就是标准化之后的AxiosHeaders实例

    // 下面函数就是在把object对象改为json，并根据情况修改ContentType

    const contentType = headers.getContentType() || '';
    const hasJSONContentType = contentType.indexOf('application/json') > -1;
    const isObjectPayload = utils.isObject(data);
  
    // 格式化data数据（变成FormData的实例），然后把他变成JSON
    if (isObjectPayload && utils.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData = utils.isFormData(data);
    if (isFormData) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
  
    // 满足任意一个条件就返回data
    if (utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data) ||
      utils.isReadableStream(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }

    // url有参数的话，contentType改一下
    if (utils.isURLSearchParams(data)) {
      headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
      return data.toString();
    }
  
    let isFileList;
  
    if (isObjectPayload) {
      if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
  
      if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
        const _FormData = this.env && this.env.FormData;
  
        return toFormData(
          isFileList ? {'files[]': data} : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
  
    if (isObjectPayload || hasJSONContentType ) {
      headers.setContentType('application/json', false);
      return stringifySafely(data);
    }

    return data;
  }],

  // 响应
  transformResponse: [function transformResponse(data) {
    // 这里的this指向的是本defauls

    // 这个data就是从网络那边拿过来的JSON化的数据，看一下本defaults是不是要求forcedJSONParsing
    const transitional = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    // 看本defauls对象的responseType属性是否要求为json
    const JSONRequested = this.responseType === 'json';

    if (utils.isResponse(data) || utils.isReadableStream(data)) {
      return data;
    }
    // 如果data是一个JSON，就开始解析为对象，然后直接返回
    if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
      const silentJSONParsing = transitional && transitional.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    // 解析完之后的数据直接返回
    return data;
  }],
}





// REVIEW - 下面是axiosHeaders大类




class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }

  set(header, valueOrRewrite, rewrite) {
    const self = this;

    function setHeader(_value, _header, _rewrite) {
      // 第二个参数才是header的key值

      // normalizeHeader有小写作用：Content-Type变成了content-type
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error('header name must be a non-empty string');
      }

      // 返回原来存起来的（有可能是首字母大写，也有可能是小写）
      const key = utils.findKey(self, lHeader);

      // 统一将 Header 名称转为小写存储
      // 设置这个_value为这个实例的这个header的值
      if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
        self[key || _header] = normalizeValue(_value);
      }
    }

    const setHeaders = (headers, _rewrite) =>
      utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

    if (utils.isPlainObject(header) || header instanceof this.constructor) {
      // 如果入参header是一个对象，批量改
      setHeaders(header, valueOrRewrite)

    } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      // 如果是字符串，且不是全空格，且不是一个有效的，批量执行
      // 传入的是解析过的header
      setHeaders(parseHeaders(header), valueOrRewrite);

    } else if (utils.isHeaders(header)) {
      // 传入的是一个标准的header对象
      for (const [key, value] of header.entries()) {
        setHeader(value, key, rewrite);
      }

    } else {
      // 都不是执行下面
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }

    return this;
  }

  get(header, parser) {
    header = normalizeHeader(header);

    if (header) {
      const key = utils.findKey(this, header);

      if (key) {
        const value = this[key];

        if (!parser) {
          return value;
        }

        if (parser === true) {
          return parseTokens(value);
        }

        if (utils.isFunction(parser)) {
          return parser.call(this, value, key);
        }

        if (utils.isRegExp(parser)) {
          return parser.exec(value);
        }

        throw new TypeError('parser must be boolean|regexp|function');
      }
    }
  }

  has(header, matcher) {
    header = normalizeHeader(header);

    if (header) {
      const key = utils.findKey(this, header);

      return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }

    return false;
  }

  delete(header, matcher) {
    const self = this;
    let deleted = false;

    function deleteHeader(_header) {
      _header = normalizeHeader(_header);

      if (_header) {
        const key = utils.findKey(self, _header);

        if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
          delete self[key];

          deleted = true;
        }
      }
    }

    if (utils.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }

    return deleted;
  }

  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;

    while (i--) {
      const key = keys[i];
      if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }

    return deleted;
  }


  // 将小写键转换为首字母大写格式：headers['Content-Type'] = 'application/json'
  // 删除原小写键：delete headers['content-type']
  normalize(format) {
    // this是axiosHeaders的类实例
    const self = this;
    const headers = {};

    utils.forEach(this, (value, header) => {
      // this上面的每一个非原型属性都遍历执行下面函数
      // value是属性值obj[key]，header是属性名key

      // ！下面这小段是为了处理headers里面重复的属性名，让后面的覆盖前面的
      // 从缓存里面找这个原来的属性名字（有可能大写也有可能小写）
      // 找的过程大家都小写化了
      const key = utils.findKey(headers, header);
      // 能够找到就在实例里面重新赋予一下这个属性名 + 属性值（字符串化）
      // 且删掉原来的
      if (key) {
        self[key] = normalizeValue(value);
        delete self[header];
        return;
      }

      // 把header（属性名）改为首字母大写的，删除旧的重新保存新的
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self[header];
      }
      // 属性值（字符串化）保存！
      self[normalized] = normalizeValue(value);
      // 缓存当前的
      headers[normalized] = true;
    });

    return this;
  }

  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }

  // 在xhr的promise同步函数里面对请求头进行设置时，用到了下面的方法
  // requestHeaders.toJSON()目的是把那些值为undefined的属性去掉
  toJSON(asStrings) {
    const obj = Object.create(null);

    utils.forEach(this, (value, header) => {
      // 只有当value不为 null/undefined，且不等于 false才保存值到obj里面
      // asStrings && utils.isArray(value) 两个条件都满足的时候，转成逗号分隔字符串
      value != null && value !== false && (obj[header] = (asStrings && utils.isArray(value)) ? value.join(', ') : value);
    });

    // 返回新的对象
    return obj;
  }

  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }

  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
  }

  get [Symbol.toStringTag]() {
    return 'AxiosHeaders';
  }

  // 转化为AxiosHeaders的实例
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }

  static concat(first, ...targets) {
    const computed = new this(first);

    targets.forEach((target) => computed.set(target));

    return computed;
  }

  static accessor(header) {
    const internals = this[$internals] = (this[$internals] = {
      accessors: {}
    });

    const accessors = internals.accessors;
    const prototype = this.prototype;

    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);

      if (!accessors[lHeader]) {
        buildAccessors(prototype, _header);
        accessors[lHeader] = true;
      }
    }

    utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

    return this;
  }
}

AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);


function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}

// 单纯转化为字符串
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils.isArray(value) ? value.map(normalizeValue) : String(value);
}


// 单词的首字母转为大写，其他下小写
function formatHeader(header) {
  // [a-z\d] 匹配一个小写字母或数字。它代表单词的首个字母或数字
  // \w* 匹配零个或多个字母、数字或下划线。它代表单词的剩余部分（即首字母后面的字符）
  // g 标志表示全局匹配，也就是说它会在整个字符串中匹配所有符合条件的部分
  
  // replace 方法会对每一个匹配到的部分执行回调函数 (w, char, str)
  // w 是整个匹配的字符串（即一个完整的单词）
  // char 是匹配到的第一个字符（即字母或数字）
  // str 是匹配到的后续字符（即除第一个字符外的部分）
  return header.trim()
    .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
      return char.toUpperCase() + str;
    });
}


// 不允许的字符：空格和 !
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());




function parseHeaders(rawHeaders) {
  const parsed = {};
  let key;
  let val;
  let i;

  rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
    i = line.indexOf(':');
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();

    if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
      return;
    }

    if (key === 'set-cookie') {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};





// REVIEW - 下面为adapters，意思是：寻找可发出网络请求的API





var adapters = {
  getAdapter: (adapters) => {
    // 拿到[xhr,http,fetch]数组
    adapters = utils.isArray(adapters) ? adapters : [adapters];

    const {length} = adapters;
    let nameOrAdapter;
    let adapter;

    const rejectedReasons = {};

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;
      adapter = nameOrAdapter;

      // 看这个api是否是一个函数，不是函数的话走下面
      // 一般是字符串，比如‘xhr’
      if (!isResolvedHandle(nameOrAdapter)) {
        // 从仓库里面拿出适配器！
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

        if (adapter === undefined) {
          throw new AxiosError(`Unknown adapter '${id}'`);
        }
      }

      // 如果能够拿到，就直接退出函数，
      // 说明一个能够找到就行了，现在的目的只是要发送网络请求而已
      if (adapter) {
        break;
      }

      rejectedReasons[id || '#' + i] = adapter;
    }

    // 没找到就报错！
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons)
        .map(([id, state]) => `adapter ${id} ` +
          (state === false ? 'is not supported by the environment' : 'is not available in the build')
        );

      let s = length ?
        (reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0])) :
        'as no adapter specified';

      throw new AxiosError(
        `There is no suitable adapter to dispatch the request ` + s,
        'ERR_NOT_SUPPORT'
      );
    }

    // 找到就直接返回这个函数
    return adapter;
  },
  adapters: knownAdapters
}



const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: fetchAdapter
}

utils.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, 'name', {value});
    } catch (e) {
      // eslint-disable-next-line no-empty
    }
    Object.defineProperty(fn, 'adapterName', {value});
  }
});

const renderReason = (reason) => `- ${reason}`;

const isResolvedHandle = (adapter) => utils.isFunction(adapter) || adapter === null || adapter === false;







// REVIEW - xhr函数（其中一个适配器函数）






const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

isXHRAdapterSupported && function xhr(config) {
  // 直接返回一个promise
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    // 初始化promise对象，同步执行这个里面的函数
    // 这里的入参config就是处理好的大总配置对象

    // 1. 做一些鉴权、XSRF（同源才要设置）、设置跨端（非浏览器环境）请求头等事情
    // （重新复制（新内存）一个config对象出来）
    const _config = resolveConfig(config);
    let requestData = _config.data;

    // 拿到（格式统一化的）请求头
    const requestHeaders = AxiosHeaders.from(_config.headers).normalize();
    let {responseType, onUploadProgress, onDownloadProgress} = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;

    // 2. 创建xhr实例，并初始化请求，给到 方法 和 url 
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;

    // 3. 响应处理逻辑（事先定义好）
    // 1）处理【完成】之后的逻辑
    // 定义清理函数 done
    function done() {
      // 清空上传进度事件和下载进度事件
      flushUpload && flushUpload();
      flushDownload && flushDownload();

      // 取消订阅
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      // 移除事件监听
      _config.signal && _config.signal.removeEventListener('abort', onCanceled);
    }
    // 完成之后处理的主函数
    function onloadend() {
      if (!request) {
        return;
      }
      // 获取响应头
      const responseHeaders = AxiosHeaders.from(
        'getAllResponseHeaders' in request && request.getAllResponseHeaders()
      );
      // 获取响应数据，构造对象
      const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
        request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };

      // 根据状态码决定 resolve/reject，传递数据（第三个参数）给下一层，并执行清理函数
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // 清理实例
      request = null;
    }
    // 把完成事件的主函数挂到request上面！
    if ('onloadend' in request) {
      // 标准浏览器使用 onloadend
      request.onloadend = onloadend;
    } else {
      // 不然的话，旧浏览器通过 readyState === 4 判断请求完成
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }

    // 2）处理【请求取消】的情况
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      // 直接对这个promise reject一个错误
      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));
      request = null;
    };

    // 3）处理【网络错误】的情况
    request.onerror = function handleError() {
      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));
      request = null;
    };

    // 4）处理【超时】的情况
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? 'timeout of ' + _config.timeout + 'ms exceeded' : 'timeout exceeded';
      const transitional = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError(
        timeoutErrorMessage,
        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
        config,
        request));

      request = null;
    };

    // 4. 最后关头再改一下请求头
    // 1）Content-Type（如果data是空的话，没有Content-Type）
    requestData === undefined && requestHeaders.setContentType(null);
    // 2）筛选掉那些值为无效的属性，重新设置请求头
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    // 3）跨域凭据（非同源）
    if (!utils.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    // 4）设置传递过程中的数据类型！
    if (responseType && responseType !== 'json') {
      request.responseType = _config.responseType;
    }

    // 5. 进度事件处理（是什么？？？）
    // 1）下载进度
    if (onDownloadProgress) {
      ([downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true));
      request.addEventListener('progress', downloadThrottled);
    }
    // 上传进度（仅支持有 upload 属性的环境）
    if (onUploadProgress && request.upload) {
      ([uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress));
      request.upload.addEventListener('progress', uploadThrottled);
      request.upload.addEventListener('loadend', flushUpload);
    }

    // 3. 【补充！】响应处理逻辑（事先定义好）
    // 5）处理【取消请求】的情况
    if (_config.cancelToken || _config.signal) {
      onCanceled = cancel => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener('abort', onCanceled);
      }
    }

    // 6. 协议检查
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
      return;
    }

    // 最后终于发送请求了！！！
    // 用这个配置好的实例，发送大配置里面的data数据
    request.send(requestData || null);
  });
}




function resolveConfig(config) {

  // 复制一个新的对象出来
  const newConfig = mergeConfig({}, config);
  let {data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth} = newConfig;

  // 1. 请求头转换为 AxiosHeaders 实例（赋予很多方法）
  newConfig.headers = headers = AxiosHeaders.from(headers);

  // 2. 拼接URL
  // buildFullPath将 baseURL 和 url 拼接成完整 URL（例如 baseURL: '/api' + url: 'user' → /api/user）
  // 将参数序列化并附加到 URL（如 { id: 1 } → ?id=1），依赖 paramsSerializer 处理复杂参数
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);

  // 3. 【】设置HTTP基本认证处理
  // encodeURIComponent + unescape：确保密码中的特殊字符（如 @）正确编码
  // btoa：将 username:password 转为 Base64 字符串。
  if (auth) {
    headers.set('Authorization', 'Basic ' +
      btoa((auth.username || '') + ':' + (auth.password ? unescape(encodeURIComponent(auth.password)) : ''))
    );
  }

  let contentType;

  // 4. 请求头中跨端的Content-Type设置（这里仅仅防止app端设置不了！）
  // 进到这里，data是合规的类型（在dispatchRequest这个链条的中间那边处理好了）
  if (utils.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      // 让浏览器自动设置 Content-Type（含 multipart/form-data 和 boundary）
      headers.setContentType(undefined);
    } else if ((contentType = headers.getContentType()) !== false) {
      // 非浏览器环境（如 React Native）手动修复 Content-Type
      const [type, ...tokens] = contentType ? contentType.split(';').map(token => token.trim()).filter(Boolean) : [];
      headers.setContentType([type || 'multipart/form-data', ...tokens].join('; '));
    }
  }

  // 5. 【】添加 XSRF 防御头（如 X-XSRF-TOKEN）
  if (platform.hasStandardBrowserEnv) {
    // 浏览器环境下需要 XSRF 头（支持函数配置）
    withXSRFToken && utils.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

    // 同源策略：默认对同源请求自动添加 XSRF 头（isURLSameOrigin 检测）。
    if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(newConfig.url))) {
      // 从 xsrfCookieName 指定的 Cookie 中读取令牌，写入 xsrfHeaderName 指定的请求头。
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }

  return newConfig;
}




function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  // 第二个参数是外部传递进来的url字符串
  // 在练习中，为'http://123.207.32.32:8000/home/multidata'

  // 如果是相对的，要合并为绝对的
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && isRelativeUrl || allowAbsoluteUrls == false) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

// 看看有无 http://, https://, ftp://
// 或者以 // 开头的 URL，如 //example.com
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}


function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}



function buildURL(url, params, options) {
  // 入参：
  // url是绝对的url
  // params是参数（config.params）
  // options是config.paramsSerializer

  if (!params) {
    return url;
  }
  
  // 统一化格式
  const _encode = options && options.encode || encode;
  if (utils.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;

  let serializedParams;

  // 如果传递了options（就是serializeFn），并且他是一个函数
  // 执行她，这个函数是对params字符串进行修改的
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    // 不然规范params的格式
    serializedParams = utils.isURLSearchParams(params) ?
      params.toString() :
      new AxiosURLSearchParams(params, options).toString(_encode);
  }

  // 给路由加上参数部分
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
}



const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';
const _navigator = typeof navigator === 'object' && navigator || undefined;

// 首先判断window是否存在
// 然后判断navigator是否不存在，如果不存在就不用看['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0
// 如果navigator存在，继续看是否是'ReactNative', 'NativeScript', 'NS'
// 如果navigator存在，且不是三者中的一个，就直接返回true
const hasStandardBrowserEnv = hasBrowserEnv &&
  (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);






const origin = hasBrowserEnv && window.location.href || 'http://localhost';

var isURLSameOrigin = ((origin, isMSIE) => (url) => {
  // origin是 new URL(window)，当前页面的 URL
  // isMSIE是 当前是否是 MSIE（Internet Explorer）浏览器

  // url是外部传入的url，第二个参数是当前页面的根 URL
  // 如果 url 是一个相对路径，它会被解析为相对于 platform.origin 的完整 URL。
  // 如果 url 已经是一个完整的 URL，则 url 不会发生变化。
  url = new URL(url, platform.origin);

  // 比较协议、主机和端口
  // 比较两个 URL 的协议部分（例如 http: 或 https:）
  // 比较两个 URL 的主机名（包括域名和端口，如果有的话）
  // IE浏览器的端口号比较（ IE 在某些情况下不会包括端口号）
  return (
    origin.protocol === url.protocol &&
    origin.host === url.host &&
    (isMSIE || origin.port === url.port)
  );
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
)




function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
}





// REVIEW - 【备份】下面为Axios大类的原始函数！






class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }

  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};

        Error.captureStackTrace ? Error.captureStackTrace(dummy) : (dummy = new Error());

        // slice off the Error: ... line
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
        try {
          if (!err.stack) {
            err.stack = stack;
            // match without the 2 top stack lines
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
            err.stack += '\n' + stack
          }
        } catch (e) {
          // ignore the case where "stack" is an un-writable property
        }
      }

      throw err;
    }
  }

  _request(configOrUrl, config) {
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    config = mergeConfig(this.defaults, config);

    const {transitional, paramsSerializer, headers} = config;

    if (transitional !== undefined) {
      validator.assertOptions(transitional, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }

    if (paramsSerializer != null) {
      if (utils.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        }
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }

    // Set config.allowAbsoluteUrls
    if (config.allowAbsoluteUrls !== undefined) {
      // do nothing
    } else if (this.defaults.allowAbsoluteUrls !== undefined) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }

    validator.assertOptions(config, {
      baseUrl: validators.spelling('baseURL'),
      withXsrfToken: validators.spelling('withXSRFToken')
    }, true);

    // Set config.method
    config.method = (config.method || this.defaults.method || 'get').toLowerCase();

    // Flatten headers
    let contextHeaders = headers && utils.merge(
      headers.common,
      headers[config.method]
    );

    headers && utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      (method) => {
        delete headers[method];
      }
    );

    config.headers = AxiosHeaders.concat(contextHeaders, headers);

    // filter out skipped interceptors
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    let promise;
    let i = 0;
    let len;

    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), undefined];
      chain.unshift.apply(chain, requestInterceptorChain);
      chain.push.apply(chain, responseInterceptorChain);
      len = chain.length;

      promise = Promise.resolve(config);

      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }

      return promise;
    }

    len = requestInterceptorChain.length;

    let newConfig = config;

    i = 0;

    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }

    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    i = 0;
    len = responseInterceptorChain.length;

    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }

    return promise;
  }

  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
}

utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/

  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url,
        data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});




