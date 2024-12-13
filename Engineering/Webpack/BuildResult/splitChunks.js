(() => {



  // ! 大对象

  var __webpack_modules__ = {
    "./src/index.js": (
      __unused_webpack_module,
      __unused_webpack_exports,
      __webpack_require__
    ) => {
      // 两个入口导入同一个依赖
      const title = __webpack_require__("./src/title.js");
      console.log("index-title", title);

      const sum = __webpack_require__("./src/sum.js");
      console.log("index-sum", sum);

      const isArray = __webpack_require__("./node_modules/isarray/index.js");
      console.log(isArray([1, 2, 3]));
    },

    "./src/sum.js": (module) => {
      module.exports = "summmm";
    },
  };




  // ! 核心主代码webpack

  var __webpack_module_cache__ = {};
  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }

    var module = (__webpack_module_cache__[moduleId] = {
      exports: {},
    });

    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
  }
  __webpack_require__.m = __webpack_modules__;




  // ! O方法，检查每个chunkID是否已经被加载，是否可以开始wprq主入口的chunk

  (() => {
    var deferred = [];
    __webpack_require__.O = (result, chunkIds, fn, priority) => {
      // 凡是在主入口处执行的O方法，都会保存一下当前的入口的所有依赖的信息，但是为什么用数组来保存？？？
      // 好像这个数组永远都是只有一个元素，对deferred遍历好像也没有意义啊！！？！！

      if (chunkIds) {
        priority = priority || 0;
        for (
          var i = deferred.length;
          i > 0 && deferred[i - 1][2] > priority;
          i--
        )
          deferred[i] = deferred[i - 1];
        deferred[i] = [chunkIds, fn, priority];
        return;
      }
      var notFulfilled = Infinity;

      for (var i = 0; i < deferred.length; i++) {
        var [chunkIds, fn, priority] = deferred[i];
        var fulfilled = true;

        // 循环过程中每次都要检查当前的chunkID是否在installedChunks里面可以找到，一旦一个找不到，就是false，不能加载主代码

        for (var j = 0; j < chunkIds.length; j++) {
          if (
            (priority & (1 === 0) || notFulfilled >= priority) &&
            Object.keys(__webpack_require__.O).every((key) =>
              __webpack_require__.O[key](chunkIds[j])
            )
          ) {
            chunkIds.splice(j--, 1);
          } else {
            fulfilled = false;
            if (priority < notFulfilled) notFulfilled = priority;
          }
        }

        // 循环结束来检查一下状态

        if (fulfilled) {
          deferred.splice(i--, 1);
          var r = fn();
          if (r !== undefined) result = r;
        }
      }
      return result;
    };
  })();



  (() => {
    __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
  })();




  // ! 每个小chunk都要执行的方法，做了三件事
  // 把模块源代码保存到大对象
  // 把chunkID保存到installedChunks
  // 再次调用O方法检查是不是所有的chunk已经被存起来（加载完毕），是否可以开始wprq入口chunk

  (() => {
    var installedChunks = {
      main: 0,
    };

    __webpack_require__.O.j = (chunkId) => installedChunks[chunkId] === 0;

    var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
      var [chunkIds, moreModules, runtime] = data;
      var moduleId,
        chunkId,
        i = 0;
      if (chunkIds.some((id) => installedChunks[id] !== 0)) {
        for (moduleId in moreModules) {
          if (__webpack_require__.o(moreModules, moduleId)) {
            __webpack_require__.m[moduleId] = moreModules[moduleId];
          }
        }
        if (runtime) var result = runtime(__webpack_require__);
      }
      if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
      for (; i < chunkIds.length; i++) {
        chunkId = chunkIds[i];
        if (
          __webpack_require__.o(installedChunks, chunkId) &&
          installedChunks[chunkId]
        ) {
          installedChunks[chunkId][0]();
        }
        installedChunks[chunkId] = 0;
      }
      return __webpack_require__.O(result);
    };


    // 这里假如在html里面先引入了被分割的小chunk，那就先使用原生的数组的push方法把参数存到这个对象的属性里面
    // 然后再加载main的主入口chunk，这时候取出这个参数，然后执行webpackJsonpCallback方法
    var chunkLoadingGlobal = (self["webpackChunkzyl"] =
      self["webpackChunkzyl"] || []);
    chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));


    // 下面这行就是正常的加载顺序（先主入口大chunk，后其他小chunk），然后重写这个数组的push方法
    chunkLoadingGlobal.push = webpackJsonpCallback.bind(
      null,
      chunkLoadingGlobal.push.bind(chunkLoadingGlobal)
    );
  })();




  // ! 入口代码初始执行

  var __webpack_exports__ = __webpack_require__.O(
    undefined,
    ["vendors-node_modules_isarray_index_js", "commons-src_title_js"],
    () => __webpack_require__("./src/index.js")
  );
  __webpack_exports__ = __webpack_require__.O(__webpack_exports__);
})();



// ! 下面是每个被分割的js代码
// ! dist/commons-src_title_js.js

(self["webpackChunkzyl"] = self["webpackChunkzyl"] || []).push([
  ["commons-src_title_js"],
  {
    "./src/title.js": (module) => {
      module.exports = "title";
    },
  },
]);




// ! dist/vendors-node_modules_isarray_index_js.js

(self["webpackChunkzyl"] = self["webpackChunkzyl"] || []).push([
  ["vendors-node_modules_isarray_index_js"],
  {
    "./node_modules/isarray/index.js": (module) => {
      var toString = {}.toString;
      module.exports =
        Array.isArray ||
        function (arr) {
          return toString.call(arr) == "[object Array]";
        };
    },
  },
]);
