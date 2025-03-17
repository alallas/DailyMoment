


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
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;
  
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
  // 1）过渡性配置transitional
  if (transitional !== undefined) {
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
  // 2）删除方法特定的头属性（避免冗余）
  headers && utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    (method) => {
      delete headers[method];
    }
  );
  // 3）合并后的头赋值给 config.headers
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






// REVIEW - dispatchRequest函数【promise执行链中间的函数】






function dispatchRequest(config) {
  // 检查 config 中是否存在取消标记（如 cancelToken 或 signal），
  // 若请求已被取消，立即抛出错误，中断后续流程。
  throwIfCancellationRequested(config);

  // 1. 请求头标准化
  // 将用户传入的 headers（可能是普通对象或字符串）转换为 Axios 内部统一的 AxiosHeaders 实例（赋予很多方法）
  config.headers = AxiosHeaders.from(config.headers);

  // 2. 请求数据转化
  // 按顺序执行 config.transformRequest 中的每个函数，将对象转为 JSON 字符串
  config.data = transformData.call(
    config,
    config.transformRequest
  );

  // 3. 设置Content-Type
  // 仅当请求方法是 POST、PUT 或 PATCH 时，默认设置Content-Type为 application/x-www-form-urlencoded
  if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
    config.headers.setContentType('application/x-www-form-urlencoded', false);
  }

  // 4. 执行适配器并处理响应
  // 1）找到能用的适配器
  // config.adapter是一个数组，里面是[xhr,http,fetch]，都是浏览器本身的底层API，直接调用是发出网络请求
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter);

  // 2）调用这个适配器
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
  // fns就是config.transformRequest数组

  // this指的是axios实例
  const config = this || defaults;
  // 配置对象
  const context = response || config;
  // 请求头实例
  const headers = AxiosHeaders.from(context.headers);
  let data = context.data;

  // 开始遍历config.transformRequest数组，执行函数，转换对象为JSON
  utils.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });

  headers.normalize();

  return data;
}



// REVIEW - 下面是axiosHeaders大类




class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }

  set(header, valueOrRewrite, rewrite) {
    const self = this;

    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);

      if (!lHeader) {
        throw new Error('header name must be a non-empty string');
      }

      const key = utils.findKey(self, lHeader);

      if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
        self[key || _header] = normalizeValue(_value);
      }
    }

    const setHeaders = (headers, _rewrite) =>
      utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

    if (utils.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite)
    } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils.isHeaders(header)) {
      for (const [key, value] of header.entries()) {
        setHeader(value, key, rewrite);
      }
    } else {
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

  normalize(format) {
    const self = this;
    const headers = {};

    utils.forEach(this, (value, header) => {
      const key = utils.findKey(headers, header);

      if (key) {
        self[key] = normalizeValue(value);
        delete self[header];
        return;
      }

      const normalized = format ? formatHeader(header) : String(header).trim();

      if (normalized !== header) {
        delete self[header];
      }

      self[normalized] = normalizeValue(value);

      headers[normalized] = true;
    });

    return this;
  }

  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }

  toJSON(asStrings) {
    const obj = Object.create(null);

    utils.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value);
    });

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

// reserved names hotfix
utils.reduceDescriptors(AxiosHeaders.prototype, ({value}, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  }
});

utils.freezeMethods(AxiosHeaders);





// REVIEW - 下面为adapters！





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
    const _config = resolveConfig(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders.from(_config.headers).normalize();
    let {responseType, onUploadProgress, onDownloadProgress} = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;

    function done() {
      flushUpload && flushUpload(); // flush events
      flushDownload && flushDownload(); // flush events

      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

      _config.signal && _config.signal.removeEventListener('abort', onCanceled);
    }

    let request = new XMLHttpRequest();

    request.open(_config.method.toUpperCase(), _config.url, true);

    // Set the request timeout in MS
    request.timeout = _config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      const responseHeaders = AxiosHeaders.from(
        'getAllResponseHeaders' in request && request.getAllResponseHeaders()
      );
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

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
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

      // Clean up request
      request = null;
    };

    // Remove Content-Type if data is undefined
    requestData === undefined && requestHeaders.setContentType(null);

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = _config.responseType;
    }

    // Handle progress if needed
    if (onDownloadProgress) {
      ([downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true));
      request.addEventListener('progress', downloadThrottled);
    }

    // Not all browsers support upload events
    if (onUploadProgress && request.upload) {
      ([uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress));

      request.upload.addEventListener('progress', uploadThrottled);

      request.upload.addEventListener('loadend', flushUpload);
    }

    if (_config.cancelToken || _config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
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

    const protocol = parseProtocol(_config.url);

    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
      return;
    }


    // Send the request
    request.send(requestData || null);
  });
}




function resolveConfig(config) {

  // 复制一个新的对象出来
  const newConfig = mergeConfig({}, config);
  let {data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth} = newConfig;

  // 请求头转换为 AxiosHeaders 实例（赋予很多方法）
  newConfig.headers = headers = AxiosHeaders.from(headers);

  // buildFullPath将 baseURL 和 url 拼接成完整 URL（例如 baseURL: '/api' + url: 'user' → /api/user）
  // 将参数序列化并附加到 URL（如 { id: 1 } → ?id=1），依赖 paramsSerializer 处理复杂参数
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);

  // HTTP基本认证处理
  // encodeURIComponent + unescape：确保密码中的特殊字符（如 @）正确编码
  // btoa：将 username:password 转为 Base64 字符串。
  if (auth) {
    headers.set('Authorization', 'Basic ' +
      btoa((auth.username || '') + ':' + (auth.password ? unescape(encodeURIComponent(auth.password)) : ''))
    );
  }

  let contentType;

  if (utils.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(undefined); // Let the browser set it
    } else if ((contentType = headers.getContentType()) !== false) {
      const [type, ...tokens] = contentType ? contentType.split(';').map(token => token.trim()).filter(Boolean) : [];
      headers.setContentType([type || 'multipart/form-data', ...tokens].join('; '));
    }
  }

  // Add xsrf header
  // This is only done if running in a standard browser environment.
  // Specifically not if we're in a web worker, or react-native.

  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

    if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(newConfig.url))) {
      // Add xsrf header
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);

      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }

  return newConfig;
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




