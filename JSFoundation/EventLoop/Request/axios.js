// 提供的对外出口
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

var axios = createInstance(defaults);
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};



// Axios大构造对象
// 属性写在构造函数的原始处
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {

    // 两者分别是两个新的InterceptorManager实例，实例里面必须有forEach方法
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };


  // 构造默认的defaultConfig
  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // 环境为浏览器
      adapter = require('./adapters/xhr');
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // 环境为nodeJS
      adapter = require('./adapters/http');
    }
    return adapter;
  }
  
  this.defaults = {
    adapter: getDefaultAdapter(),
  
    timeout: 0,
  
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
  
    maxContentLength: -1,
   
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };
  
  defaults.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };
}





// 拦截器构造对象
function InterceptorManager() {
  this.handlers = []
}
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};





// Axios单个请求方法的构造，都基于Request方法进行包裹
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(
      utils.merge(
        config || {}, 
        {
          method: method,
          url: url
        }
      )
    );
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  Axios.prototype[method] = function(url, data, config) {
    return this.request(
      utils.merge(
        config || {}, 
        {
          method: method,
          url: url,
          data: data
        }
      )
    );
  };
});

Axios.prototype.request = function request(config) {

  // 保证一定有config这个对象
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }
  // 用户自定义的config和默认的合并起来
  config = mergeConfig(this.defaults, config);


  // 设置config对象里面的method属性
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }


  // 构造执行链条并遍历执行
  // 初始的执行链条
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  // 从中间往前加请求拦截函数，包括成功和失败两类
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  // 从末尾往中间加响应拦截函数，包括成功和失败两类
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  // 从头到尾执行链条，chain此时为请求n-请求1-dispatchRequest-undefined-响应1-响应n
  // 覆盖式的Promise链条！！
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  // 返回当前的Promise，这个时候如果then，拿到的res是经过各个拦截器构造之后的结果
  return promise;
};




// chain执行链中间的函数，主要用于执行adapter函数，调用XMLHttpRequest执行函数
function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  config.headers = config.headers || {};

  // 构造config的data属性
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // 构造config的headers属性
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  // 删除headers对象的“方法”的key和value
  // ! 不明白为什么，因为前面不是还定义了headers对象的以当前方法作为key的属性吗？？？
  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  // 执行XMLHttpRequest的请求方法
  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // 对接受到的数据做一些处理
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;

  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // 对接受到的数据做一些处理
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};





// 浏览器环境下的请求函数（缩略版！！）
function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {

    var request = new XMLHttpRequest();

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    request.onreadystatechange = function handleLoad() {

    };

    request.onabort = function handleAbort() {}

    request.onerror = function handleError() {}

    request.ontimeout = function handleTimeout() {}

    request.send(requestData);

  })
}
