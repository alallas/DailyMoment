// REVIEW - client下面的router.js
// 打包之后的node_module里面的next下面的dist下面的client文件夹



var _construct = __webpack_require__("(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/construct.js");
var _s = $RefreshSig$();
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it)
        o = it;
      var i = 0;
      var F = function F() { };
      return {
        s: F,
        n: function n() {
          if (i >= o.length)
            return {
              done: true
            };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function e(_e) {
          throw _e;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err;
  return {
    s: function s() {
      it = it.call(o);
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it["return"] != null)
          it["return"]();
      } finally {
        if (didErr)
          throw err;
      }
    }
  };
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

function _export(target, all) {
  for (var name in all)
    Object.defineProperty(target, name, {
      enumerable: true,
      get: all[name]
    });
}

_export(exports, {
  Router: function Router() {
    return _router["default"];
  },
  createRouter: function createRouter() {
    return _createRouter;
  },
  // Export the singletonRouter and this is the public API.
  "default": function _default() {
    return _default2;
  },
  makePublicRouterInstance: function makePublicRouterInstance() {
    return _makePublicRouterInstance;
  },
  useRouter: function useRouter() {
    return _useRouter;
  },
  withRouter: function withRouter() {
    return _withrouter["default"];
  }
});


var _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */
  "(pages-dir-browser)/./node_modules/@swc/helpers/esm/_interop_require_default.js");
var _react = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! react */
    "(pages-dir-browser)/./node_modules/react/index.js"));
var _router = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! ../shared/lib/router/router */
    "(pages-dir-browser)/./node_modules/next/dist/shared/lib/router/router.js"));
var _routercontextsharedruntime = __webpack_require__(/*! ../shared/lib/router-context.shared-runtime */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/router-context.shared-runtime.js");
var _iserror = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! ../lib/is-error */
    "(pages-dir-browser)/./node_modules/next/dist/lib/is-error.js"));
var _withrouter = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! ./with-router */
    "(pages-dir-browser)/./node_modules/next/dist/client/with-router.js"));


var singletonRouter = {
  router: null,
  readyCallbacks: [],
  ready: function ready(callback) {
    if (this.router)
      return callback();
    if (true) {
      this.readyCallbacks.push(callback);
    }
  }
};



var urlPropertyFields = ['pathname', 'route', 'query', 'asPath', 'components', 'isFallback', 'basePath', 'locale', 'locales', 'defaultLocale', 'isReady', 'isPreview', 'isLocaleDomain', 'domainLocales'];
var routerEvents = ['routeChangeStart', 'beforeHistoryChange', 'routeChangeComplete', 'routeChangeError', 'hashChangeStart', 'hashChangeComplete'];
var coreMethodFields = ['push', 'replace', 'reload', 'back', 'prefetch', 'beforePopState'];



Object.defineProperty(singletonRouter, 'events', {
  get: function get() {
    return _router["default"].events;
  }
});


function getRouter() {
  if (!singletonRouter.router) {
    var message = 'No router instance found.\n' + 'You should only use "next/router" on the client side of your app.\n';
    throw Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
      value: "E394",
      enumerable: false,
      configurable: true
    });
  }
  return singletonRouter.router;
}

urlPropertyFields.forEach(function (field) {
  Object.defineProperty(singletonRouter, field, {
    get: function get() {
      var router = getRouter();
      return router[field];
    }
  });
});


coreMethodFields.forEach(function (field) {
  ; singletonRouter[field] = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var router = getRouter();
    return router[field].apply(router, args);
  };
});



// 把routerEvents这么多数量的回调函数放入readyCallbacks队列里面
routerEvents.forEach(function (event) {
  singletonRouter.ready(function () {
    _router["default"].events.on(event, function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var eventField = "on" + event.charAt(0).toUpperCase() + event.substring(1);
      var _singletonRouter = singletonRouter;
      if (_singletonRouter[eventField]) {
        try {
          _singletonRouter[eventField].apply(_singletonRouter, args);
        } catch (err) {
          console.error("Error when running the Router event: " + eventField);
          console.error((0,
            _iserror["default"])(err) ? err.message + "\n" + err.stack : err + '');
        }
      }
    });
  });
});




var _default2 = singletonRouter;


function _useRouter() {
  _s();
  var router = _react["default"].useContext(_routercontextsharedruntime.RouterContext);
  if (!router) {
    throw Object.defineProperty(new Error('NextRouter was not mounted. https://nextjs.org/docs/messages/next-router-not-mounted'), "__NEXT_ERROR_CODE", {
      value: "E509",
      enumerable: false,
      configurable: true
    });
  }
  return router;
}

_s(_useRouter, "rbAhEc3dLGnVlsHWaSDsgP4MZS0=");


function _createRouter() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  singletonRouter.router = _construct(_router["default"], args);
  singletonRouter.readyCallbacks.forEach(function (cb) {
    return cb();
  });
  singletonRouter.readyCallbacks = [];
  return singletonRouter.router;
}


function _makePublicRouterInstance(router) {
  var scopedRouter = router;
  var instance = {};
  var _iterator = _createForOfIteratorHelper(urlPropertyFields), _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var property = _step.value;
      if (typeof scopedRouter[property] === 'object') {
        instance[property] = Object.assign(Array.isArray(scopedRouter[property]) ? [] : {}, scopedRouter[property])// makes sure query is not stateful
          ;

        continue;
      }
      instance[property] = scopedRouter[property];
    }
    // Events is a static property on the router, the router doesn't have to be initialized to use it
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  instance.events = _router["default"].events;
  coreMethodFields.forEach(function (field) {
    instance[field] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return scopedRouter[field].apply(scopedRouter, args);
    }
      ;
  });
  return instance;
}
if ((typeof exports["default"] === 'function' || typeof exports["default"] === 'object' && exports["default"] !== null) && typeof exports["default"].__esModule === 'undefined') {
  Object.defineProperty(exports["default"], '__esModule', {
    value: true
  });
  Object.assign(exports["default"], exports);
  module.exports = exports["default"];
}


; (function () {
  var _a, _b;
  // Legacy CSS implementations will `eval` browser code in a Node.js context
  // to extract CSS. For backwards compatibility, we need to check we're in a
  // browser context before continuing.
  if (typeof self !== 'undefined' && // AMP / No-JS mode does not inject these helpers:
    '$RefreshHelpers$' in self) {
    // @ts-ignore __webpack_module__ is global
    var currentExports = module.exports;
    // @ts-ignore __webpack_module__ is global
    var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
    // This cannot happen in MainTemplate because the exports mismatch between
    // templating and execution.
    self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
    // A module can be accepted automatically based on its exports, e.g. when
    // it is a Refresh Boundary.
    if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
      // Save the previous exports signature on update so we can compare the boundary
      // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
      module.hot.dispose(function (data) {
        data.prevSignature = self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
      });
      // Unconditionally accept an update to this module, we'll check if it's
      // still a Refresh Boundary later.
      // @ts-ignore importMeta is replaced in the loader
      module.hot.accept();
      // This field is set when the previous version of this module was a
      // Refresh Boundary, letting us know we need to check for invalidation or
      // enqueue an update.
      if (prevSignature !== null) {
        // A boundary can become ineligible if its exports are incompatible
        // with the previous exports.
        //
        // For example, if you add/remove/change exports, we'll want to
        // re-execute the importing modules, and force those components to
        // re-render. Similarly, if you convert a class component to a
        // function, we want to invalidate the boundary.
        if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
          module.hot.invalidate();
        } else {
          self.$RefreshHelpers$.scheduleUpdate();
        }
      }
    } else {
      // Since we just executed the code for the module, it's possible that the
      // new exports made it ineligible for being a boundary.
      // We only care about the case when we were _previously_ a boundary,
      // because we already accepted this update (accidental side effect).
      var isNoLongerABoundary = prevSignature !== null;
      if (isNoLongerABoundary) {
        module.hot.invalidate();
      }
    }
  }
}
)();
//# sourceURL=[module]
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1icm93c2VyKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvY2xpZW50L3JvdXRlci5qcyIsIm1hcHBpbmdzIjoiQUFBQSxtQkFBaUM7O0FBQUEsSUFBQUEsVUFBQSxHQUFBQyxtQkFBQTtBQUFBLElBQUFDLEVBQUEsR0FBQUMsWUFBQTtBQUFBLFNBQUFDLDJCQUFBQyxDQUFBLEVBQUFDLGNBQUEsUUFBQUMsRUFBQSxVQUFBQyxNQUFBLG9CQUFBSCxDQUFBLENBQUFHLE1BQUEsQ0FBQUMsUUFBQSxLQUFBSixDQUFBLHFCQUFBRSxFQUFBLFFBQUFHLEtBQUEsQ0FBQUMsT0FBQSxDQUFBTixDQUFBLE1BQUFFLEVBQUEsR0FBQUssMkJBQUEsQ0FBQVAsQ0FBQSxNQUFBQyxjQUFBLElBQUFELENBQUEsV0FBQUEsQ0FBQSxDQUFBUSxNQUFBLHFCQUFBTixFQUFBLEVBQUFGLENBQUEsR0FBQUUsRUFBQSxNQUFBTyxDQUFBLFVBQUFDLENBQUEsWUFBQUEsRUFBQSxlQUFBQyxDQUFBLEVBQUFELENBQUEsRUFBQUUsQ0FBQSxXQUFBQSxFQUFBLFFBQUFILENBQUEsSUFBQVQsQ0FBQSxDQUFBUSxNQUFBLFdBQUFLLElBQUEsbUJBQUFBLElBQUEsU0FBQUMsS0FBQSxFQUFBZCxDQUFBLENBQUFTLENBQUEsVUFBQU0sQ0FBQSxXQUFBQSxFQUFBQyxFQUFBLFVBQUFBLEVBQUEsS0FBQUMsQ0FBQSxFQUFBUCxDQUFBLGdCQUFBUSxTQUFBLGlKQUFBQyxnQkFBQSxTQUFBQyxNQUFBLFVBQUFDLEdBQUEsV0FBQVYsQ0FBQSxXQUFBQSxFQUFBLElBQUFULEVBQUEsR0FBQUEsRUFBQSxDQUFBb0IsSUFBQSxDQUFBdEIsQ0FBQSxNQUFBWSxDQUFBLFdBQUFBLEVBQUEsUUFBQVcsSUFBQSxHQUFBckIsRUFBQSxDQUFBc0IsSUFBQSxJQUFBTCxnQkFBQSxHQUFBSSxJQUFBLENBQUFWLElBQUEsU0FBQVUsSUFBQSxLQUFBUixDQUFBLFdBQUFBLEVBQUFVLEdBQUEsSUFBQUws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QyxFQUFFRyxJQUFJLEdBQUcsQ0FBQyxFQUFFQSxJQUFJLEdBQUdILElBQUksRUFBRUcsSUFBSSxFQUFFLEVBQUM7UUFDbkZELElBQUksQ0FBQ0MsSUFBSSxDQUFDLEdBQUdGLFNBQVMsQ0FBQ0UsSUFBSSxDQUFDO01BQ2hDO01BQ0EsT0FBT2UsWUFBWSxDQUFDbkIsS0FBSyxDQUFDLENBQUFLLEtBQUEsQ0FBbkJjLFlBQVksRUFBV2hCLElBQUksQ0FBQztJQUN2QyxDQUFDO0VBQ0wsQ0FBQyxDQUFDO0VBQ0YsT0FBT2lCLFFBQVE7QUFDbkI7QUFFQSxJQUFJLENBQUMsT0FBT3ZELE9BQU8sV0FBUSxLQUFLLFVBQVUsSUFBSyxPQUFPQSxPQUFPLFdBQVEsS0FBSyxRQUFRLElBQUlBLE9BQU8sV0FBUSxLQUFLLElBQUssS0FBSyxPQUFPQSxPQUFPLFdBQVEsQ0FBQzRELFVBQVUsS0FBSyxXQUFXLEVBQUU7RUFDckt4RSxNQUFNLENBQUNXLGNBQWMsQ0FBQ0MsT0FBTyxXQUFRLEVBQUUsWUFBWSxFQUFFO0lBQUUxQixLQUFLLEVBQUU7RUFBSyxDQUFDLENBQUM7RUFDckVjLE1BQU0sQ0FBQ3VFLE1BQU0sQ0FBQzNELE9BQU8sV0FBUSxFQUFFQSxPQUFPLENBQUM7RUFDdkNDLE1BQU0sQ0FBQ0QsT0FBTyxHQUFHQSxPQUFPLFdBQVE7QUFDbEMiLCJzb3VyY2VzIjpbIkQ6XFxhYV9mcm9udEVuZFxcbmV4dF9wcmFjdGljZVxcbm9kZV9tb2R1bGVzXFxuZXh0XFxkaXN0XFxjbGllbnRcXHJvdXRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgd2luZG93ICovIFwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuMCAmJiAobW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgUm91dGVyOiBudWxsLFxuICAgIGNyZWF0ZVJvdXRlcjogbnVsbCxcbiAgICBkZWZhdWx0OiBudWxsLFxuICAgIG1ha2VQdWJsaWNSb3V0ZXJJbnN0YW5jZTogbnVsbCxcbiAgICB1c2VSb3V0ZXI6IG51bGwsXG4gICAgd2l0aFJvdXRlcjogbnVsbFxufSk7XG5mdW5jdGlvbiBfZXhwb3J0KHRhcmdldCwgYWxsKSB7XG4gICAgZm9yKHZhciBuYW1lIGluIGFsbClPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBuYW1lLCB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogYWxsW25hbWVdXG4gICAgfSk7XG59XG5fZXhwb3J0KGV4cG9ydHMsIHtcbiAgICBSb3V0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3JvdXRlci5kZWZhdWx0O1xuICAgIH0sXG4gICAgY3JlYXRlUm91dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVJvdXRlcjtcbiAgICB9LFxuICAgIC8vIEV4cG9ydCB0aGUgc2luZ2xldG9uUm91dGVyIGFuZCB0aGlzIGlzIHRoZSBwdWJsaWMgQVBJLlxuICAgIGRlZmF1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2RlZmF1bHQ7XG4gICAgfSxcbiAgICBtYWtlUHVibGljUm91dGVySW5zdGFuY2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbWFrZVB1YmxpY1JvdXRlckluc3RhbmNlO1xuICAgIH0sXG4gICAgdXNlUm91dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHVzZVJvdXRlcjtcbiAgICB9LFxuICAgIHdpdGhSb3V0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3dpdGhyb3V0ZXIuZGVmYXVsdDtcbiAgICB9XG59KTtcbmNvbnN0IF9pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdCA9IHJlcXVpcmUoXCJAc3djL2hlbHBlcnMvXy9faW50ZXJvcF9yZXF1aXJlX2RlZmF1bHRcIik7XG5jb25zdCBfcmVhY3QgPSAvKiNfX1BVUkVfXyovIF9pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdC5fKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5jb25zdCBfcm91dGVyID0gLyojX19QVVJFX18qLyBfaW50ZXJvcF9yZXF1aXJlX2RlZmF1bHQuXyhyZXF1aXJlKFwiLi4vc2hhcmVkL2xpYi9yb3V0ZXIvcm91dGVyXCIpKTtcbmNvbnN0IF9yb3V0ZXJjb250ZXh0c2hhcmVkcnVudGltZSA9IHJlcXVpcmUoXCIuLi9zaGFyZWQvbGliL3JvdXRlci1jb250ZXh0LnNoYXJlZC1ydW50aW1lXCIpO1xuY29uc3QgX2lzZXJyb3IgPSAvKiNfX1BVUkVfXyovIF9pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdC5fKHJlcXVpcmUoXCIuLi9saWIvaXMtZXJyb3JcIikpO1xuY29uc3QgX3dpdGhyb3V0ZXIgPSAvKiNfX1BVUkVfXyovIF9pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdC5fKHJlcXVpcmUoXCIuL3dpdGgtcm91dGVyXCIpKTtcbmNvbnN0IHNpbmdsZXRvblJvdXRlciA9IHtcbiAgICByb3V0ZXI6IG51bGwsXG4gICAgcmVhZHlDYWxsYmFja3M6IFtdLFxuICAgIHJlYWR5IChjYWxsYmFjaykge1xuICAgICAgICBpZiAodGhpcy5yb3V0ZXIpIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMucmVhZHlDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8gQ3JlYXRlIHB1YmxpYyBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzIG9mIHRoZSByb3V0ZXIgaW4gdGhlIHNpbmdsZXRvblJvdXRlclxuY29uc3QgdXJsUHJvcGVydHlGaWVsZHMgPSBbXG4gICAgJ3BhdGhuYW1lJyxcbiAgICAncm91dGUnLFxuICAgICdxdWVyeScsXG4gICAgJ2FzUGF0aCcsXG4gICAgJ2NvbXBvbmVudHMnLFxuICAgICdpc0ZhbGxiYWNrJyxcbiAgICAnYmFzZVBhdGgnLFxuICAgICdsb2NhbGUnLFxuICAgICdsb2NhbGVzJyxcbiAgICAnZGVmYXVsdExvY2FsZScsXG4gICAgJ2lzUmVhZHknLFxuICAgICdpc1ByZXZpZXcnLFxuICAgICdpc0xvY2FsZURvbWFpbicsXG4gICAgJ2RvbWFpbkxvY2FsZXMnXG5dO1xuY29uc3Qgcm91dGVyRXZlbnRzID0gW1xuICAgICdyb3V0ZUNoYW5nZVN0YXJ0JyxcbiAgICAnYmVmb3JlSGlzdG9yeUNoYW5nZScsXG4gICAgJ3JvdXRlQ2hhbmdlQ29tcGxldGUnLFxuICAgICdyb3V0ZUNoYW5nZUVycm9yJyxcbiAgICAnaGFzaENoYW5nZVN0YXJ0JyxcbiAgICAnaGFzaENoYW5nZUNvbXBsZXRlJ1xuXTtcbmNvbnN0IGNvcmVNZXRob2RGaWVsZHMgPSBbXG4gICAgJ3B1c2gnLFxuICAgICdyZXBsYWNlJyxcbiAgICAncmVsb2FkJyxcbiAgICAnYmFjaycsXG4gICAgJ3ByZWZldGNoJyxcbiAgICAnYmVmb3JlUG9wU3RhdGUnXG5dO1xuLy8gRXZlbnRzIGlzIGEgc3RhdGljIHByb3BlcnR5IG9uIHRoZSByb3V0ZXIsIHRoZSByb3V0ZXIgZG9lc24ndCBoYXZlIHRvIGJlIGluaXRpYWxpemVkIHRvIHVzZSBpdFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNpbmdsZXRvblJvdXRlciwgJ2V2ZW50cycsIHtcbiAgICBnZXQgKCkge1xuICAgICAgICByZXR1cm4gX3JvdXRlci5kZWZhdWx0LmV2ZW50cztcbiAgICB9XG59KTtcbmZ1bmN0aW9uIGdldFJvdXRlcigpIHtcbiAgICBpZiAoIXNpbmdsZXRvblJvdXRlci5yb3V0ZXIpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdObyByb3V0ZXIgaW5zdGFuY2UgZm91bmQuXFxuJyArICdZb3Ugc2hvdWxkIG9ubHkgdXNlIFwibmV4dC9yb3V0ZXJcIiBvbiB0aGUgY2xpZW50IHNpZGUgb2YgeW91ciBhcHAuXFxuJztcbiAgICAgICAgdGhyb3cgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5ldyBFcnJvcihtZXNzYWdlKSwgXCJfX05FWFRfRVJST1JfQ09ERVwiLCB7XG4gICAgICAgICAgICB2YWx1ZTogXCJFMzk0XCIsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHNpbmdsZXRvblJvdXRlci5yb3V0ZXI7XG59XG51cmxQcm9wZXJ0eUZpZWxkcy5mb3JFYWNoKChmaWVsZCk9PntcbiAgICAvLyBIZXJlIHdlIG5lZWQgdG8gdXNlIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBiZWNhdXNlIHdlIG5lZWQgdG8gcmV0dXJuXG4gICAgLy8gdGhlIHByb3BlcnR5IGFzc2lnbmVkIHRvIHRoZSBhY3R1YWwgcm91dGVyXG4gICAgLy8gVGhlIHZhbHVlIG1pZ2h0IGdldCBjaGFuZ2VkIGFzIHdlIGNoYW5nZSByb3V0ZXMgYW5kIHRoaXMgaXMgdGhlXG4gICAgLy8gcHJvcGVyIHdheSB0byBhY2Nlc3MgaXRcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2luZ2xldG9uUm91dGVyLCBmaWVsZCwge1xuICAgICAgICBnZXQgKCkge1xuICAgICAgICAgICAgY29uc3Qgcm91dGVyID0gZ2V0Um91dGVyKCk7XG4gICAgICAgICAgICByZXR1cm4gcm91dGVyW2ZpZWxkXTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5jb3JlTWV0aG9kRmllbGRzLmZvckVhY2goKGZpZWxkKT0+e1xuICAgIC8vIFdlIGRvbid0IHJlYWxseSBrbm93IHRoZSB0eXBlcyBoZXJlLCBzbyB3ZSBhZGQgdGhlbSBsYXRlciBpbnN0ZWFkXG4gICAgO1xuICAgIHNpbmdsZXRvblJvdXRlcltmaWVsZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5Kyspe1xuICAgICAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3V0ZXIgPSBnZXRSb3V0ZXIoKTtcbiAgICAgICAgcmV0dXJuIHJvdXRlcltmaWVsZF0oLi4uYXJncyk7XG4gICAgfTtcbn0pO1xucm91dGVyRXZlbnRzLmZvckVhY2goKGV2ZW50KT0+e1xuICAgIHNpbmdsZXRvblJvdXRlci5yZWFkeSgoKT0+e1xuICAgICAgICBfcm91dGVyLmRlZmF1bHQuZXZlbnRzLm9uKGV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvcih2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKXtcbiAgICAgICAgICAgICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZXZlbnRGaWVsZCA9IFwib25cIiArIGV2ZW50LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZXZlbnQuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgY29uc3QgX3NpbmdsZXRvblJvdXRlciA9IHNpbmdsZXRvblJvdXRlcjtcbiAgICAgICAgICAgIGlmIChfc2luZ2xldG9uUm91dGVyW2V2ZW50RmllbGRdKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgX3NpbmdsZXRvblJvdXRlcltldmVudEZpZWxkXSguLi5hcmdzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoZW4gcnVubmluZyB0aGUgUm91dGVyIGV2ZW50OiBcIiArIGV2ZW50RmllbGQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCgwLCBfaXNlcnJvci5kZWZhdWx0KShlcnIpID8gZXJyLm1lc3NhZ2UgKyBcIlxcblwiICsgZXJyLnN0YWNrIDogZXJyICsgJycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbmNvbnN0IF9kZWZhdWx0ID0gc2luZ2xldG9uUm91dGVyO1xuZnVuY3Rpb24gdXNlUm91dGVyKCkge1xuICAgIGNvbnN0IHJvdXRlciA9IF9yZWFjdC5kZWZhdWx0LnVzZUNvbnRleHQoX3JvdXRlcmNvbnRleHRzaGFyZWRydW50aW1lLlJvdXRlckNvbnRleHQpO1xuICAgIGlmICghcm91dGVyKSB7XG4gICAgICAgIHRocm93IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXcgRXJyb3IoJ05leHRSb3V0ZXIgd2FzIG5vdCBtb3VudGVkLiBodHRwczovL25leHRqcy5vcmcvZG9jcy9tZXNzYWdlcy9uZXh0LXJvdXRlci1ub3QtbW91bnRlZCcpLCBcIl9fTkVYVF9FUlJPUl9DT0RFXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiBcIkU1MDlcIixcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcm91dGVyO1xufVxuZnVuY3Rpb24gY3JlYXRlUm91dGVyKCkge1xuICAgIGZvcih2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKXtcbiAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG4gICAgc2luZ2xldG9uUm91dGVyLnJvdXRlciA9IG5ldyBfcm91dGVyLmRlZmF1bHQoLi4uYXJncyk7XG4gICAgc2luZ2xldG9uUm91dGVyLnJlYWR5Q2FsbGJhY2tzLmZvckVhY2goKGNiKT0+Y2IoKSk7XG4gICAgc2luZ2xldG9uUm91dGVyLnJlYWR5Q2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHNpbmdsZXRvblJvdXRlci5yb3V0ZXI7XG59XG5mdW5jdGlvbiBtYWtlUHVibGljUm91dGVySW5zdGFuY2Uocm91dGVyKSB7XG4gICAgY29uc3Qgc2NvcGVkUm91dGVyID0gcm91dGVyO1xuICAgIGNvbnN0IGluc3RhbmNlID0ge307XG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiB1cmxQcm9wZXJ0eUZpZWxkcyl7XG4gICAgICAgIGlmICh0eXBlb2Ygc2NvcGVkUm91dGVyW3Byb3BlcnR5XSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGluc3RhbmNlW3Byb3BlcnR5XSA9IE9iamVjdC5hc3NpZ24oQXJyYXkuaXNBcnJheShzY29wZWRSb3V0ZXJbcHJvcGVydHldKSA/IFtdIDoge30sIHNjb3BlZFJvdXRlcltwcm9wZXJ0eV0pIC8vIG1ha2VzIHN1cmUgcXVlcnkgaXMgbm90IHN0YXRlZnVsXG4gICAgICAgICAgICA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpbnN0YW5jZVtwcm9wZXJ0eV0gPSBzY29wZWRSb3V0ZXJbcHJvcGVydHldO1xuICAgIH1cbiAgICAvLyBFdmVudHMgaXMgYSBzdGF0aWMgcHJvcGVydHkgb24gdGhlIHJvdXRlciwgdGhlIHJvdXRlciBkb2Vzbid0IGhhdmUgdG8gYmUgaW5pdGlhbGl6ZWQgdG8gdXNlIGl0XG4gICAgaW5zdGFuY2UuZXZlbnRzID0gX3JvdXRlci5kZWZhdWx0LmV2ZW50cztcbiAgICBjb3JlTWV0aG9kRmllbGRzLmZvckVhY2goKGZpZWxkKT0+e1xuICAgICAgICBpbnN0YW5jZVtmaWVsZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvcih2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKXtcbiAgICAgICAgICAgICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNjb3BlZFJvdXRlcltmaWVsZF0oLi4uYXJncyk7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5pZiAoKHR5cGVvZiBleHBvcnRzLmRlZmF1bHQgPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiBleHBvcnRzLmRlZmF1bHQgPT09ICdvYmplY3QnICYmIGV4cG9ydHMuZGVmYXVsdCAhPT0gbnVsbCkpICYmIHR5cGVvZiBleHBvcnRzLmRlZmF1bHQuX19lc01vZHVsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMuZGVmYXVsdCwgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuICBPYmplY3QuYXNzaWduKGV4cG9ydHMuZGVmYXVsdCwgZXhwb3J0cyk7XG4gIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yb3V0ZXIuanMubWFwIl0sIm5hbWVzIjpbIl9jb25zdHJ1Y3QiLCJyZXF1aXJlIiwiX3MiLCIkUmVmcmVzaFNpZyQiLCJfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlciIsIm8iLCJhbGxvd0FycmF5TGlrZSIsIml0IiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJBcnJheSIsImlzQXJyYXkiLCJfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkiLCJsZW5ndGgiLCJpIiwiRiIsInMiLCJuIiwiZG9uZSIsInZhbHVlIiwiZSIsIl9lIiwiZiIsIlR5cGVFcnJvciIsIm5vcm1hbENvbXBsZXRpb24iLCJkaWRFcnIiLCJlcnIiLCJjYWxsIiwic3RlcCIsIm5leHQiLCJfZTIiLCJtaW5MZW4iLCJfYXJyYXlMaWtlVG9BcnJheSIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwic2xpY2UiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJmcm9tIiwidGVzdCIsImFyciIsImxlbiIsImFycjIiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJtb2R1bGUiLCJSb3V0ZXIiLCJjcmVhdGVSb3V0ZXIiLCJtYWtlUHVibGljUm91dGVySW5zdGFuY2UiLCJ1c2VSb3V0ZXIiLCJ3aXRoUm91dGVyIiwiX2V4cG9ydCIsInRhcmdldCIsImFsbCIsImVudW1lcmFibGUiLCJnZXQiLCJfcm91dGVyIiwiX2RlZmF1bHQiLCJfd2l0aHJvdXRlciIsIl9pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdCIsIl9yZWFjdCIsIl8iLCJfcm91dGVyY29udGV4dHNoYXJlZHJ1bnRpbWUiLCJfaXNlcnJvciIsInNpbmdsZXRvblJvdXRlciIsInJvdXRlciIsInJlYWR5Q2FsbGJhY2tzIiwicmVhZHkiLCJjYWxsYmFjayIsInB1c2giLCJ1cmxQcm9wZXJ0eUZpZWxkcyIsInJvdXRlckV2ZW50cyIsImNvcmVNZXRob2RGaWVsZHMiLCJldmVudHMiLCJnZXRSb3V0ZXIiLCJtZXNzYWdlIiwiRXJyb3IiLCJjb25maWd1cmFibGUiLCJmb3JFYWNoIiwiZmllbGQiLCJfbGVuIiwiYXJndW1lbnRzIiwiYXJncyIsIl9rZXkiLCJhcHBseSIsImV2ZW50Iiwib24iLCJldmVudEZpZWxkIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzdWJzdHJpbmciLCJfc2luZ2xldG9uUm91dGVyIiwiY29uc29sZSIsImVycm9yIiwic3RhY2siLCJ1c2VDb250ZXh0IiwiUm91dGVyQ29udGV4dCIsImNiIiwic2NvcGVkUm91dGVyIiwiaW5zdGFuY2UiLCJfaXRlcmF0b3IiLCJfc3RlcCIsInByb3BlcnR5IiwiYXNzaWduIiwiX19lc01vZHVsZSJdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==
//# sourceURL=webpack-internal:///(pages-dir-browser)/./node_modules/next/dist/client/router.js








// REVIEW - client下面的index.js
// 打包之后的node_module里面的next下面的dist下面的client文件夹






var _regeneratorRuntime = __webpack_require__(/*! ./node_modules/@babel/runtime/regenerator/index.js */
  "(pages-dir-browser)/./node_modules/@babel/runtime/regenerator/index.js");
var _slicedToArray = __webpack_require__(/*! ./node_modules/next/dist/compiled/@babel/runtime/helpers/slicedToArray.js */
  "(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/slicedToArray.js");
var _defineProperty = __webpack_require__(/*! ./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js */
  "(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js");
var _asyncToGenerator = __webpack_require__(/*! ./node_modules/next/dist/compiled/@babel/runtime/helpers/asyncToGenerator.js */
  "(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/asyncToGenerator.js");
var _classCallCheck = __webpack_require__(/*! ./node_modules/next/dist/compiled/@babel/runtime/helpers/classCallCheck.js */
  "(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/classCallCheck.js");
var _createClass = __webpack_require__(/*! ./node_modules/next/dist/compiled/@babel/runtime/helpers/createClass.js */
  "(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/createClass.js");
var _inherits = __webpack_require__(/*! ./node_modules/next/dist/compiled/@babel/runtime/helpers/inherits.js */
  "(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/inherits.js");
var _possibleConstructorReturn = __webpack_require__(/*! ./node_modules/next/dist/compiled/@babel/runtime/helpers/possibleConstructorReturn.js */
  "(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/possibleConstructorReturn.js");
var _getPrototypeOf = __webpack_require__(/*! ./node_modules/next/dist/compiled/@babel/runtime/helpers/getPrototypeOf.js */
  "(pages-dir-browser)/./node_modules/next/dist/compiled/@babel/runtime/helpers/getPrototypeOf.js");
var _s = $RefreshSig$()
  , _s2 = $RefreshSig$()
  , _s3 = $RefreshSig$();
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })),
      t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  }
    ;
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct)
    return false;
  if (Reflect.construct.sham)
    return false;
  if (typeof Proxy === "function")
    return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () { }));
    return true;
  } catch (e) {
    return false;
  }
}
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
0 && (0);
function _export(target, all) {
  for (var name in all)
    Object.defineProperty(target, name, {
      enumerable: true,
      get: all[name]
    });
}
_export(exports, {
  emitter: function emitter() {
    return _emitter;
  },
  hydrate: function hydrate() {
    return _hydrate;
  },
  initialize: function initialize() {
    return _initialize;
  },
  router: function router() {
    return _router2;
  },
  version: function version() {
    return _version;
  }
});



var _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */
  "(pages-dir-browser)/./node_modules/@swc/helpers/esm/_interop_require_default.js");
var _jsxruntime = __webpack_require__(/*! react/jsx-runtime */
  "(pages-dir-browser)/./node_modules/react/jsx-runtime.js");
__webpack_require__(/*! ../build/polyfills/polyfill-module */
  "(pages-dir-browser)/./node_modules/next/dist/build/polyfills/polyfill-module.js");
var _react = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! react */
    "(pages-dir-browser)/./node_modules/react/index.js"));
var _client = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! react-dom/client */
    "(pages-dir-browser)/./node_modules/react-dom/client.js"));
var _headmanagercontextsharedruntime = __webpack_require__(/*! ../shared/lib/head-manager-context.shared-runtime */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/head-manager-context.shared-runtime.js");
var _mitt = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! ../shared/lib/mitt */
    "(pages-dir-browser)/./node_modules/next/dist/shared/lib/mitt.js"));
var _routercontextsharedruntime = __webpack_require__(/*! ../shared/lib/router-context.shared-runtime */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/router-context.shared-runtime.js");
var _handlesmoothscroll = __webpack_require__(/*! ../shared/lib/router/utils/handle-smooth-scroll */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/router/utils/handle-smooth-scroll.js");
var _isdynamic = __webpack_require__(/*! ../shared/lib/router/utils/is-dynamic */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/router/utils/is-dynamic.js");
var _querystring = __webpack_require__(/*! ../shared/lib/router/utils/querystring */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/router/utils/querystring.js");
var _runtimeconfigexternal = __webpack_require__(/*! ../shared/lib/runtime-config.external */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/runtime-config.external.js");
var _utils = __webpack_require__(/*! ../shared/lib/utils */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/utils.js");
var _portal = __webpack_require__(/*! ./portal */
  "(pages-dir-browser)/./node_modules/next/dist/client/portal/index.js");
var _headmanager = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! ./head-manager */
    "(pages-dir-browser)/./node_modules/next/dist/client/head-manager.js"));
var _pageloader = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! ./page-loader */
    "(pages-dir-browser)/./node_modules/next/dist/client/page-loader.js"));
var _routeannouncer = __webpack_require__(/*! ./route-announcer */
  "(pages-dir-browser)/./node_modules/next/dist/client/route-announcer.js");
var _router = __webpack_require__(/*! ./router */
  "(pages-dir-browser)/./node_modules/next/dist/client/router.js");
var _iserror = __webpack_require__(/*! ../lib/is-error */
  "(pages-dir-browser)/./node_modules/next/dist/lib/is-error.js");
var _imageconfigcontextsharedruntime = __webpack_require__(/*! ../shared/lib/image-config-context.shared-runtime */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/image-config-context.shared-runtime.js");
var _removebasepath = __webpack_require__(/*! ./remove-base-path */
  "(pages-dir-browser)/./node_modules/next/dist/client/remove-base-path.js");
var _hasbasepath = __webpack_require__(/*! ./has-base-path */
  "(pages-dir-browser)/./node_modules/next/dist/client/has-base-path.js");
var _approutercontextsharedruntime = __webpack_require__(/*! ../shared/lib/app-router-context.shared-runtime */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js");
var _adapters = __webpack_require__(/*! ../shared/lib/router/adapters */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/router/adapters.js");
var _hooksclientcontextsharedruntime = __webpack_require__(/*! ../shared/lib/hooks-client-context.shared-runtime */
  "(pages-dir-browser)/./node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.js");
var _onrecoverableerror = __webpack_require__(/*! ./react-client-callbacks/on-recoverable-error */
  "(pages-dir-browser)/./node_modules/next/dist/client/react-client-callbacks/on-recoverable-error.js");
var _tracer = /*#__PURE__*/
  _interop_require_default._(__webpack_require__(/*! ./tracing/tracer */
    "(pages-dir-browser)/./node_modules/next/dist/client/tracing/tracer.js"));
var _isnextroutererror = __webpack_require__(/*! ./components/is-next-router-error */
  "(pages-dir-browser)/./node_modules/next/dist/client/components/is-next-router-error.js");
var _version = "15.2.4";
var _router2;
var _emitter = (0,
  _mitt["default"])();
var looseToArray = function looseToArray(input) {
  return [].slice.call(input);
};
var initialData;
var defaultLocale = undefined;
var asPath;
var pageLoader;
var appElement;
var headManager;
var initialMatchesMiddleware = false;
var lastAppProps;
var _lastRenderReject;
var devClient;
var CachedApp, onPerfEntry;
var CachedComponent;





var Container = /*#__PURE__*/
  function (_react$default$Compon) {
    // 继承父组件的属性
    _inherits(Container, _react$default$Compon);
    // 定义super函数
    var _super = _createSuper(Container);

    // 定义Container组件
    function Container() {
      _classCallCheck(this, Container);
      return _super.apply(this, arguments);
    }

    // 为container加上生命周期函数
    _createClass(
      Container,
      [
        {
          key: "componentDidCatch",
          value: function componentDidCatch(componentErr, info) {
            this.props.fn(componentErr, info);
          }
        },
        {
          key: "componentDidMount",
          value: function componentDidMount() {
            this.scrollToHash();
            // We need to replace the router state if:
            // - the page was (auto) exported and has a query string or search (hash)
            // - it was auto exported and is a dynamic route (to provide params)
            // - if it is a client-side skeleton (fallback render)
            // - if middleware matches the current page (may have rewrite params)
            // - if rewrites in next.config.js match (may have rewrite params)
            if (_router2.isSsr && (initialData.isFallback || initialData.nextExport && ((0,
              _isdynamic.isDynamicRoute)(_router2.pathname) || location.search || false || initialMatchesMiddleware) || initialData.props && initialData.props.__N_SSG && (location.search || false || initialMatchesMiddleware))) {
              // update query on mount for exported pages
              _router2.replace(_router2.pathname + '?' + String((0,
                _querystring.assign)((0,
                  _querystring.urlQueryToSearchParams)(_router2.query), new URLSearchParams(location.search))), asPath, {
                // @ts-ignore
                // WARNING: `_h` is an internal option for handing Next.js
                // client-side hydration. Your app should _never_ use this property.
                // It may change at any time without notice.
                _h: 1,
                // Fallback pages must trigger the data fetch, so the transition is
                // not shallow.
                // Other pages (strictly updating query) happens shallowly, as data
                // requirements would already be present.
                shallow: !initialData.isFallback && !initialMatchesMiddleware
              })["catch"](function (err) {
                if (!err.cancelled)
                  throw err;
              });
            }
          }
        }, 
        {
          key: "componentDidUpdate",
          value: function componentDidUpdate() {
            this.scrollToHash();
          }
        },
        {
          key: "scrollToHash",
          value: function scrollToHash() {
            var _location = location
              , hash = _location.hash;
            hash = hash && hash.substring(1);
            if (!hash)
              return;
            var el = document.getElementById(hash);
            if (!el)
              return;
            // If we call scrollIntoView() in here without a setTimeout
            // it won't scroll properly.
            setTimeout(function () {
              return el.scrollIntoView();
            }, 0);
          }
        },
        {
          key: "render",
          value: function render() {
            if (false) { } else {
              var _require = __webpack_require__(/*! ./components/react-dev-overlay/pages/pages-dev-overlay */
                "(pages-dir-browser)/./node_modules/next/dist/client/components/react-dev-overlay/pages/pages-dev-overlay.js")
                , PagesDevOverlay = _require.PagesDevOverlay;
              return /*#__PURE__*/
              (0,
                _jsxruntime.jsx)(PagesDevOverlay, {
                  children: this.props.children
                });
            }
          }
        }
      ]
    );
    return Container;
  }(_react["default"].Component);






function _initialize(_x) {
  return _initialize2.apply(this, arguments);
}
function _initialize2() {
  _initialize2 = _asyncToGenerator(/*#__PURE__*/
    _regeneratorRuntime.mark(function _callee(opts) {
      var prefix, _require2, normalizeLocalePath, _require3, detectDomainLocale, _require4, parseRelativeUrl, _require5, formatUrl, parsedAs, localePathResult, detectedDomain, _require6, initScriptLoader, register;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1)
          switch (_context.prev = _context.next) {
            case 0:
              if (opts === void 0)
                opts = {};
              // This makes sure this specific lines are removed in production
              if (true) {
                _tracer["default"].onSpanEnd((__webpack_require__(/*! ./tracing/report-to-socket */
                  "(pages-dir-browser)/./node_modules/next/dist/client/tracing/report-to-socket.js")["default"]));
                devClient = opts.devClient;
              }
              initialData = JSON.parse(document.getElementById('__NEXT_DATA__').textContent);
              window.__NEXT_DATA__ = initialData;
              defaultLocale = initialData.defaultLocale;
              prefix = initialData.assetPrefix || '';
              self.__next_set_public_path__("" + prefix + "/_next/")//eslint-disable-line
                ;
              // Initialize next/config with the environment configuration
              (0,
                _runtimeconfigexternal.setConfig)({
                  serverRuntimeConfig: {},
                  publicRuntimeConfig: initialData.runtimeConfig || {}
                });
              asPath = (0,
                _utils.getURL)();
              // make sure not to attempt stripping basePath for 404s
              if ((0,
                _hasbasepath.hasBasePath)(asPath)) {
                asPath = (0,
                  _removebasepath.removeBasePath)(asPath);
              }
              if (false) { }
              if (initialData.scriptLoader) {
                _require6 = __webpack_require__(/*! ./script */
                  "(pages-dir-browser)/./node_modules/next/dist/client/script.js"),
                  initScriptLoader = _require6.initScriptLoader;
                initScriptLoader(initialData.scriptLoader);
              }
              pageLoader = new _pageloader["default"](initialData.buildId, prefix);
              register = function register(param) {
                var _param = _slicedToArray(param, 2)
                  , r = _param[0]
                  , f = _param[1];
                return pageLoader.routeLoader.onEntrypoint(r, f);
              }
                ;
              if (window.__NEXT_P) {
                // Defer page registration for another tick. This will increase the overall
                // latency in hydrating the page, but reduce the total blocking time.
                window.__NEXT_P.map(function (p) {
                  return setTimeout(function () {
                    return register(p);
                  }, 0);
                });
              }
              window.__NEXT_P = [];
              window.__NEXT_P.push = register;
              headManager = (0,
                _headmanager["default"])();
              headManager.getIsSsr = function () {
                return _router2.isSsr;
              }
                ;
              appElement = document.getElementById('__next');
              return _context.abrupt("return", {
                assetPrefix: prefix
              });
            case 21:
            case "end":
              return _context.stop();
          }
      }, _callee);
    }));
  return _initialize2.apply(this, arguments);
}
function renderApp(App, appProps) {
  return /*#__PURE__*/
  (0,
    _jsxruntime.jsx)(App, _objectSpread({}, appProps));
}
function AppContainer(param) {
  _s();
  var children = param.children;
  // Create a memoized value for next/navigation router context.
  var adaptedForAppRouter = _react["default"].useMemo(function () {
    return (0,
      _adapters.adaptForAppRouterInstance)(_router2);
  }, []);
  var _self___NEXT_DATA___autoExport;
  return /*#__PURE__*/
  (0,
    _jsxruntime.jsx)(Container, {
      fn: function fn(error) {
        return (// TODO: Fix disabled eslint rule
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          renderError({
            App: CachedApp,
            err: error
          })["catch"](function (err) {
            return console.error('Error rendering page: ', err);
          }));
      },
      children: /*#__PURE__*/
        (0,
          _jsxruntime.jsx)(_approutercontextsharedruntime.AppRouterContext.Provider, {
            value: adaptedForAppRouter,
            children: /*#__PURE__*/
              (0,
                _jsxruntime.jsx)(_hooksclientcontextsharedruntime.SearchParamsContext.Provider, {
                  value: (0,
                    _adapters.adaptForSearchParams)(_router2),
                  children: /*#__PURE__*/
                    (0,
                      _jsxruntime.jsx)(_adapters.PathnameContextProviderAdapter, {
                        router: _router2,
                        isAutoExport: (_self___NEXT_DATA___autoExport = self.__NEXT_DATA__.autoExport) != null ? _self___NEXT_DATA___autoExport : false,
                        children: /*#__PURE__*/
                          (0,
                            _jsxruntime.jsx)(_hooksclientcontextsharedruntime.PathParamsContext.Provider, {
                              value: (0,
                                _adapters.adaptForPathParams)(_router2),
                              children: /*#__PURE__*/
                                (0,
                                  _jsxruntime.jsx)(_routercontextsharedruntime.RouterContext.Provider, {
                                    value: (0,
                                      _router.makePublicRouterInstance)(_router2),
                                    children: /*#__PURE__*/
                                      (0,
                                        _jsxruntime.jsx)(_headmanagercontextsharedruntime.HeadManagerContext.Provider, {
                                          value: headManager,
                                          children: /*#__PURE__*/
                                            (0,
                                              _jsxruntime.jsx)(_imageconfigcontextsharedruntime.ImageConfigContext.Provider, {
                                                value: {
                                                  "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
                                                  "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384],
                                                  "path": "/_next/image",
                                                  "loader": "default",
                                                  "dangerouslyAllowSVG": false,
                                                  "unoptimized": false,
                                                  "domains": [],
                                                  "remotePatterns": []
                                                },
                                                children: children
                                              })
                                        })
                                  })
                            })
                      })
                })
          })
    });
}
_s(AppContainer, "F6BSfrFQNeqenuPnUMVY/6gI8uE=");
_c = AppContainer;
var wrapApp = function wrapApp(App) {
  return function (wrappedAppProps) {
    var appProps = _objectSpread(_objectSpread({}, wrappedAppProps), {}, {
      Component: CachedComponent,
      err: initialData.err,
      router: _router2
    });
    return /*#__PURE__*/
    (0,
      _jsxruntime.jsx)(AppContainer, {
        children: renderApp(App, appProps)
      });
  }
    ;
};
// This method handles all runtime and debug errors.
// 404 and 500 errors are special kind of errors
// and they are still handle via the main render method.
function renderError(renderErrorProps) {
  var App = renderErrorProps.App
    , err = renderErrorProps.err;
  // In development runtime errors are caught by our overlay
  // In production we catch runtime errors using componentDidCatch which will trigger renderError
  if (true) {
    // A Next.js rendering runtime error is always unrecoverable
    // FIXME: let's make this recoverable (error in GIP client-transition)
    devClient.onUnrecoverableError();
    // We need to render an empty <App> so that the `<ReactDevOverlay>` can
    // render itself.
    // TODO: Fix disabled eslint rule
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return doRender({
      App: function App() {
        return null;
      },
      props: {},
      Component: function Component() {
        return null;
      },
      styleSheets: []
    });
  }
  // Make sure we log the error to the console, otherwise users can't track down issues.
  console.error(err);
  console.error("A client-side exception has occurred, see here for more info: https://nextjs.org/docs/messages/client-side-exception-occurred");
  return pageLoader.loadPage('/_error').then(function (param) {
    var ErrorComponent = param.page
      , styleSheets = param.styleSheets;
    return (lastAppProps == null ? void 0 : lastAppProps.Component) === ErrorComponent ? __webpack_require__.e(/*! import() */
      "_pages-dir-browser_node_modules_next_dist_pages__error_js").then(__webpack_require__.t.bind(__webpack_require__, /*! ../pages/_error */
        "(pages-dir-browser)/./node_modules/next/dist/pages/_error.js", 23)).then(function (errorModule) {
          return __webpack_require__.e(/*! import() */
            "_pages-dir-browser_node_modules_next_dist_pages__app_js").then(__webpack_require__.t.bind(__webpack_require__, /*! ../pages/_app */
              "(pages-dir-browser)/./node_modules/next/dist/pages/_app.js", 23)).then(function (appModule) {
                App = appModule["default"];
                renderErrorProps.App = App;
                return errorModule;
              });
        }).then(function (m) {
          return {
            ErrorComponent: m["default"],
            styleSheets: []
          };
        }) : {
      ErrorComponent: ErrorComponent,
      styleSheets: styleSheets
    };
  }).then(function (param) {
    var ErrorComponent = param.ErrorComponent
      , styleSheets = param.styleSheets;
    var _renderErrorProps_props;
    // In production we do a normal render with the `ErrorComponent` as component.
    // If we've gotten here upon initial render, we can use the props from the server.
    // Otherwise, we need to call `getInitialProps` on `App` before mounting.
    var AppTree = wrapApp(App);
    var appCtx = {
      Component: ErrorComponent,
      AppTree: AppTree,
      router: _router2,
      ctx: {
        err: err,
        pathname: initialData.page,
        query: initialData.query,
        asPath: asPath,
        AppTree: AppTree
      }
    };
    return Promise.resolve(((_renderErrorProps_props = renderErrorProps.props) == null ? void 0 : _renderErrorProps_props.err) ? renderErrorProps.props : (0,
      _utils.loadGetInitialProps)(App, appCtx)).then(function (initProps) {
        return (// TODO: Fix disabled eslint rule
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          doRender(_objectSpread(_objectSpread({}, renderErrorProps), {}, {
            err: err,
            Component: ErrorComponent,
            styleSheets: styleSheets,
            props: initProps
          })));
      });
  });
}
// Dummy component that we render as a child of Root so that we can
// toggle the correct styles before the page is rendered.
function Head(param) {
  _s2();
  var callback = param.callback;
  // We use `useLayoutEffect` to guarantee the callback is executed
  // as soon as React flushes the update.
  _react["default"].useLayoutEffect(function () {
    return callback();
  }, [callback]);
  return null;
}
_s2(Head, "n7/vCynhJvM+pLkyL2DMQUF0odM=");
_c2 = Head;
var performanceMarks = {
  navigationStart: 'navigationStart',
  beforeRender: 'beforeRender',
  afterRender: 'afterRender',
  afterHydrate: 'afterHydrate',
  routeChange: 'routeChange'
};
var performanceMeasures = {
  hydration: 'Next.js-hydration',
  beforeHydration: 'Next.js-before-hydration',
  routeChangeToRender: 'Next.js-route-change-to-render',
  render: 'Next.js-render'
};
var reactRoot = null;
// On initial render a hydrate should always happen
var shouldHydrate = true;
function clearMarks() {
  ;[performanceMarks.beforeRender, performanceMarks.afterHydrate, performanceMarks.afterRender, performanceMarks.routeChange].forEach(function (mark) {
    return performance.clearMarks(mark);
  });
}
function markHydrateComplete() {
  if (!_utils.ST)
    return;
  performance.mark(performanceMarks.afterHydrate)// mark end of hydration
    ;

  var hasBeforeRenderMark = performance.getEntriesByName(performanceMarks.beforeRender, 'mark').length;
  if (hasBeforeRenderMark) {
    var beforeHydrationMeasure = performance.measure(performanceMeasures.beforeHydration, performanceMarks.navigationStart, performanceMarks.beforeRender);
    var hydrationMeasure = performance.measure(performanceMeasures.hydration, performanceMarks.beforeRender, performanceMarks.afterHydrate);
    if (true && // Old versions of Safari don't return `PerformanceMeasure`s from `performance.measure()`
      beforeHydrationMeasure && hydrationMeasure) {
      _tracer["default"].startSpan('navigation-to-hydration', {
        startTime: performance.timeOrigin + beforeHydrationMeasure.startTime,
        attributes: {
          pathname: location.pathname,
          query: location.search
        }
      }).end(performance.timeOrigin + hydrationMeasure.startTime + hydrationMeasure.duration);
    }
  }
  if (onPerfEntry) {
    performance.getEntriesByName(performanceMeasures.hydration).forEach(onPerfEntry);
  }
  clearMarks();
}
function markRenderComplete() {
  if (!_utils.ST)
    return;
  performance.mark(performanceMarks.afterRender)// mark end of render
    ;

  var navStartEntries = performance.getEntriesByName(performanceMarks.routeChange, 'mark');
  if (!navStartEntries.length)
    return;
  var hasBeforeRenderMark = performance.getEntriesByName(performanceMarks.beforeRender, 'mark').length;
  if (hasBeforeRenderMark) {
    performance.measure(performanceMeasures.routeChangeToRender, navStartEntries[0].name, performanceMarks.beforeRender);
    performance.measure(performanceMeasures.render, performanceMarks.beforeRender, performanceMarks.afterRender);
    if (onPerfEntry) {
      performance.getEntriesByName(performanceMeasures.render).forEach(onPerfEntry);
      performance.getEntriesByName(performanceMeasures.routeChangeToRender).forEach(onPerfEntry);
    }
  }
  clearMarks();
  [performanceMeasures.routeChangeToRender, performanceMeasures.render].forEach(function (measure) {
    return performance.clearMeasures(measure);
  });
}
function renderReactElement(domEl, fn) {
  // mark start of hydrate/render
  if (_utils.ST) {
    performance.mark(performanceMarks.beforeRender);
  }
  var reactEl = fn(shouldHydrate ? markHydrateComplete : markRenderComplete);
  if (!reactRoot) {
    // Unlike with createRoot, you don't need a separate root.render() call here
    reactRoot = _client["default"].hydrateRoot(domEl, reactEl, {
      onRecoverableError: _onrecoverableerror.onRecoverableError
    });
    // TODO: Remove shouldHydrate variable when React 18 is stable as it can depend on `reactRoot` existing
    shouldHydrate = false;
  } else {
    var startTransition = _react["default"].startTransition;
    startTransition(function () {
      reactRoot.render(reactEl);
    });
  }
}
function Root(param) {
  _s3();
  var callbacks = param.callbacks
    , children = param.children;
  // We use `useLayoutEffect` to guarantee the callbacks are executed
  // as soon as React flushes the update
  _react["default"].useLayoutEffect(function () {
    return callbacks.forEach(function (callback) {
      return callback();
    });
  }, [callbacks]);
  if (false) { }
  return children;
}
_s3(Root, "Gjgl5rfcc2T4sFnfEMfRvL6K4Q4=");
_c3 = Root;
function doRender(input) {
  var App = input.App
    , Component = input.Component
    , props = input.props
    , err = input.err;
  var styleSheets = 'initial' in input ? undefined : input.styleSheets;
  Component = Component || lastAppProps.Component;
  props = props || lastAppProps.props;
  var appProps = _objectSpread(_objectSpread({}, props), {}, {
    Component: Component,
    err: err,
    router: _router2
  });
  // lastAppProps has to be set before ReactDom.render to account for ReactDom throwing an error.
  lastAppProps = appProps;
  var canceled = false;
  var resolvePromise;
  var renderPromise = new Promise(function (resolve, reject) {
    if (_lastRenderReject) {
      _lastRenderReject();
    }
    resolvePromise = function resolvePromise() {
      _lastRenderReject = null;
      resolve();
    }
      ;
    _lastRenderReject = function lastRenderReject() {
      canceled = true;
      _lastRenderReject = null;
      var error = Object.defineProperty(new Error('Cancel rendering route'), "__NEXT_ERROR_CODE", {
        value: "E503",
        enumerable: false,
        configurable: true
      });
      error.cancelled = true;
      reject(error);
    }
      ;
  }
  );
  // This function has a return type to ensure it doesn't start returning a
  // Promise. It should remain synchronous.
  function onStart() {
    if (!styleSheets || // We use `style-loader` in development, so we don't need to do anything
      // unless we're in production:
      true) {
      return false;
    }
    var currentStyleTags = looseToArray(document.querySelectorAll('style[data-n-href]'));
    var currentHrefs = new Set(currentStyleTags.map(function (tag) {
      return tag.getAttribute('data-n-href');
    }));
    var noscript = document.querySelector('noscript[data-n-css]');
    var nonce = noscript == null ? void 0 : noscript.getAttribute('data-n-css');
    styleSheets.forEach(function (param) {
      var href = param.href
        , text = param.text;
      if (!currentHrefs.has(href)) {
        var styleTag = document.createElement('style');
        styleTag.setAttribute('data-n-href', href);
        styleTag.setAttribute('media', 'x');
        if (nonce) {
          styleTag.setAttribute('nonce', nonce);
        }
        document.head.appendChild(styleTag);
        styleTag.appendChild(document.createTextNode(text));
      }
    });
    return true;
  }
  function onHeadCommit() {
    if (// Turbopack has it's own css injection handling, this code ends up removing the CSS.
      false) {
      var referenceNode, idx, currentHrefs, currentStyleTags, desiredHrefs;
    }
    if (input.scroll) {
      var _input$scroll = input.scroll
        , x = _input$scroll.x
        , y = _input$scroll.y;
      (0,
        _handlesmoothscroll.handleSmoothScroll)(function () {
          window.scrollTo(x, y);
        });
    }
  }
  function onRootCommit() {
    resolvePromise();
  }
  onStart();
  var elem = /*#__PURE__*/
    (0,
      _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [/*#__PURE__*/
          (0,
            _jsxruntime.jsx)(Head, {
              callback: onHeadCommit
            }), /*#__PURE__*/
          (0,
            _jsxruntime.jsxs)(AppContainer, {
              children: [renderApp(App, appProps), /*#__PURE__*/
              (0,
                _jsxruntime.jsx)(_portal.Portal, {
                  type: "next-route-announcer",
                  children: /*#__PURE__*/
                    (0,
                      _jsxruntime.jsx)(_routeannouncer.RouteAnnouncer, {})
                })]
            })]
      });
  // We catch runtime errors using componentDidCatch which will trigger renderError
  renderReactElement(appElement, function (callback) {
    return /*#__PURE__*/
    (0,
      _jsxruntime.jsx)(Root, {
        callbacks: [callback, onRootCommit],
        children: false ? /*#__PURE__*/
          0 : elem
      });
  });
  return renderPromise;
}
function render(_x2) {
  return _render.apply(this, arguments);
}
function _render() {
  _render = _asyncToGenerator(/*#__PURE__*/
    _regeneratorRuntime.mark(function _callee2(renderingProps) {
      var renderErr;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1)
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(renderingProps.err && (// renderingProps.Component might be undefined if there is a top/module-level error
                typeof renderingProps.Component === 'undefined' || !renderingProps.isHydratePass))) {
                _context2.next = 4;
                break;
              }
              _context2.next = 3;
              return renderError(renderingProps);
            case 3:
              return _context2.abrupt("return");
            case 4:
              _context2.prev = 4;
              _context2.next = 7;
              return doRender(renderingProps);
            case 7:
              _context2.next = 17;
              break;
            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](4);
              renderErr = (0,
                _iserror.getProperError)(_context2.t0);
              // bubble up cancelation errors
              if (!renderErr.cancelled) {
                _context2.next = 14;
                break;
              }
              throw renderErr;
            case 14:
              if (true) {
                // Ensure this error is displayed in the overlay in development
                setTimeout(function () {
                  throw renderErr;
                });
              }
              _context2.next = 17;
              return renderError(_objectSpread(_objectSpread({}, renderingProps), {}, {
                err: renderErr
              }));
            case 17:
            case "end":
              return _context2.stop();
          }
      }, _callee2, null, [[4, 9]]);
    }));
  return _render.apply(this, arguments);
}
function _hydrate(_x3) {
  return _hydrate2.apply(this, arguments);
}
function _hydrate2() {
  _hydrate2 = _asyncToGenerator(/*#__PURE__*/
    _regeneratorRuntime.mark(function _callee3(opts) {
      var initialErr, appEntrypoint, app, mod, pageEntrypoint, _require7, isValidElementType, getServerError, renderCtx;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1)
          switch (_context3.prev = _context3.next) {
            case 0:
              initialErr = initialData.err;
              _context3.prev = 1;
              _context3.next = 4;
              return pageLoader.routeLoader.whenEntrypoint('/_app');
            case 4:
              appEntrypoint = _context3.sent;
              if (!('error' in appEntrypoint)) {
                _context3.next = 7;
                break;
              }
              throw appEntrypoint.error;
            case 7:
              app = appEntrypoint.component,
                mod = appEntrypoint.exports;
              CachedApp = app;
              if (mod && mod.reportWebVitals) {
                onPerfEntry = function onPerfEntry(param) {
                  var id = param.id
                    , name = param.name
                    , startTime = param.startTime
                    , value = param.value
                    , duration = param.duration
                    , entryType = param.entryType
                    , entries = param.entries
                    , attribution = param.attribution;
                  // Combines timestamp with random number for unique ID
                  var uniqueID = Date.now() + "-" + (Math.floor(Math.random() * (9e12 - 1)) + 1e12);
                  var perfStartEntry;
                  if (entries && entries.length) {
                    perfStartEntry = entries[0].startTime;
                  }
                  var webVitals = {
                    id: id || uniqueID,
                    name: name,
                    startTime: startTime || perfStartEntry,
                    value: value == null ? duration : value,
                    label: entryType === 'mark' || entryType === 'measure' ? 'custom' : 'web-vital'
                  };
                  if (attribution) {
                    webVitals.attribution = attribution;
                  }
                  mod.reportWebVitals(webVitals);
                }
                  ;
              }
              if (!(true && initialData.err)) {
                _context3.next = 14;
                break;
              }
              _context3.t0 = {
                error: initialData.err
              };
              _context3.next = 17;
              break;
            case 14:
              _context3.next = 16;
              return pageLoader.routeLoader.whenEntrypoint(initialData.page);
            case 16:
              _context3.t0 = _context3.sent;
            case 17:
              pageEntrypoint = _context3.t0;
              if (!('error' in pageEntrypoint)) {
                _context3.next = 20;
                break;
              }
              throw pageEntrypoint.error;
            case 20:
              CachedComponent = pageEntrypoint.component;
              if (false) { }
              _require7 = __webpack_require__(/*! next/dist/compiled/react-is */
                "(pages-dir-browser)/./node_modules/next/dist/compiled/react-is/index.js"),
                isValidElementType = _require7.isValidElementType;
              if (isValidElementType(CachedComponent)) {
                _context3.next = 25;
                break;
              }
              throw Object.defineProperty(new Error('The default export is not a React Component in page: "' + initialData.page + '"'), "__NEXT_ERROR_CODE", {
                value: "E286",
                enumerable: false,
                configurable: true
              });
            case 25:
              _context3.next = 30;
              break;
            case 27:
              _context3.prev = 27;
              _context3.t1 = _context3["catch"](1);
              // This catches errors like throwing in the top level of a module
              initialErr = (0,
                _iserror.getProperError)(_context3.t1);
            case 30:
              if (true) {
                getServerError = (__webpack_require__(/*! ./components/react-dev-overlay/pages/client */
                  "(pages-dir-browser)/./node_modules/next/dist/client/components/react-dev-overlay/pages/client.js").getServerError);
                // Server-side runtime errors need to be re-thrown on the client-side so
                // that the overlay is rendered.
                if (initialErr) {
                  if (initialErr === initialData.err) {
                    setTimeout(function () {
                      var error;
                      try {
                        // Generate a new error object. We `throw` it because some browsers
                        // will set the `stack` when thrown, and we want to ensure ours is
                        // not overridden when we re-throw it below.
                        throw Object.defineProperty(new Error(initialErr.message), "__NEXT_ERROR_CODE", {
                          value: "E394",
                          enumerable: false,
                          configurable: true
                        });
                      } catch (e) {
                        error = e;
                      }
                      error.name = initialErr.name;
                      error.stack = initialErr.stack;
                      var errSource = initialErr.source;
                      // In development, error the navigation API usage in runtime,
                      // since it's not allowed to be used in pages router as it doesn't contain error boundary like app router.
                      if ((0,
                        _isnextroutererror.isNextRouterError)(initialErr)) {
                        error.message = 'Next.js navigation API is not allowed to be used in Pages Router.';
                      }
                      throw getServerError(error, errSource);
                    });
                  } else {
                    setTimeout(function () {
                      throw initialErr;
                    });
                  }
                }
              }
              if (!window.__NEXT_PRELOADREADY) {
                _context3.next = 34;
                break;
              }
              _context3.next = 34;
              return window.__NEXT_PRELOADREADY(initialData.dynamicIds);
            case 34:
              _router2 = (0,
                _router.createRouter)(initialData.page, initialData.query, asPath, {
                  initialProps: initialData.props,
                  pageLoader: pageLoader,
                  App: CachedApp,
                  Component: CachedComponent,
                  wrapApp: wrapApp,
                  err: initialErr,
                  isFallback: Boolean(initialData.isFallback),
                  subscription: function subscription(info, App, scroll) {
                    return render(Object.assign({}, info, {
                      App: App,
                      scroll: scroll
                    }));
                  },
                  locale: initialData.locale,
                  locales: initialData.locales,
                  defaultLocale: defaultLocale,
                  domainLocales: initialData.domainLocales,
                  isPreview: initialData.isPreview
                });
              _context3.next = 37;
              return _router2._initialMatchesMiddlewarePromise;
            case 37:
              initialMatchesMiddleware = _context3.sent;
              renderCtx = {
                App: CachedApp,
                initial: true,
                Component: CachedComponent,
                props: initialData.props,
                err: initialErr,
                isHydratePass: true
              };
              if (!(opts == null ? void 0 : opts.beforeRender)) {
                _context3.next = 42;
                break;
              }
              _context3.next = 42;
              return opts.beforeRender();
            case 42:
              render(renderCtx);
            case 43:
            case "end":
              return _context3.stop();
          }
      }, _callee3, null, [[1, 27]]);
    }));
  return _hydrate2.apply(this, arguments);
}
if ((typeof exports["default"] === 'function' || typeof exports["default"] === 'object' && exports["default"] !== null) && typeof exports["default"].__esModule === 'undefined') {
  Object.defineProperty(exports["default"], '__esModule', {
    value: true
  });
  Object.assign(exports["default"], exports);
  module.exports = exports["default"];
}
var _c, _c2, _c3;
$RefreshReg$(_c, "AppContainer");
$RefreshReg$(_c2, "Head");
$RefreshReg$(_c3, "Root");

;// Wrapped in an IIFE to avoid polluting the global scope
; (function () {
  var _a, _b;
  // Legacy CSS implementations will `eval` browser code in a Node.js context
  // to extract CSS. For backwards compatibility, we need to check we're in a
  // browser context before continuing.
  if (typeof self !== 'undefined' && // AMP / No-JS mode does not inject these helpers:
    '$RefreshHelpers$' in self) {
    // @ts-ignore __webpack_module__ is global
    var currentExports = module.exports;
    // @ts-ignore __webpack_module__ is global
    var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
    // This cannot happen in MainTemplate because the exports mismatch between
    // templating and execution.
    self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
    // A module can be accepted automatically based on its exports, e.g. when
    // it is a Refresh Boundary.
    if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
      // Save the previous exports signature on update so we can compare the boundary
      // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
      module.hot.dispose(function (data) {
        data.prevSignature = self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
      });
      // Unconditionally accept an update to this module, we'll check if it's
      // still a Refresh Boundary later.
      // @ts-ignore importMeta is replaced in the loader
      module.hot.accept();
      // This field is set when the previous version of this module was a
      // Refresh Boundary, letting us know we need to check for invalidation or
      // enqueue an update.
      if (prevSignature !== null) {
        // A boundary can become ineligible if its exports are incompatible
        // with the previous exports.
        //
        // For example, if you add/remove/change exports, we'll want to
        // re-execute the importing modules, and force those components to
        // re-render. Similarly, if you convert a class component to a
        // function, we want to invalidate the boundary.
        if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
          module.hot.invalidate();
        } else {
          self.$RefreshHelpers$.scheduleUpdate();
        }
      }
    } else {
      // Since we just executed the code for the module, it's possible that the
      // new exports made it ineligible for being a boundary.
      // We only care about the case when we were _previously_ a boundary,
      // because we already accepted this update (accidental side effect).
      var isNoLongerABoundary = prevSignature !== null;
      if (isNoLongerABoundary) {
        module.hot.invalidate();
      }
    }
  }
}
)();
//# sourceURL=[module]
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1icm93c2VyKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvY2xpZW50L2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBLHNCQUFzQjtBQUNUOztBQUFBLElBQUFBLG1CQUFBLEdBQUFDLG1CQUFBO0FBQUEsSUFBQUMsY0FBQSxHQUFBRCxtQkFBQTtBQUFBLElBQUFFLGVBQUEsR0FBQUYsbUJBQUE7QUFBQSxJQUFBRyxpQkFBQSxHQUFBSCxtQkFBQTtBQUFBLElBQUFJLGVBQUEsR0FBQUosbUJBQUE7QUFBQSxJQUFBSyxZQUFBLEdBQUFMLG1CQUFBO0FBQUEsSUFBQU0sU0FBQSxHQUFBTixtQkFBQTtBQUFBLElBQUFPLDBCQUFBLEdBQUFQLG1CQUFBO0FBQUEsSUFBQVEsZUFBQSxHQUFBUixtQkFBQTtBQUFBLElBQUFTLEVBQUEsR0FBQUMsWUFBQTtFQUFBQyxHQUFBLEdBQUFELFlBQUE7RUFBQUUsR0FBQSxHQUFBRixZQUFBO0FBQUEsU0FBQUcsUUFBQUMsQ0FBQSxFQUFBQyxDQUFBLFFBQUFDLENBQUEsR0FBQUMsTUFBQSxDQUFBQyxJQUFBLENBQUFKLENBQUEsT0FBQUcsTUFBQSxDQUFBRSxxQkFBQSxRQUFBQyxDQUFBLEdBQUFILE1BQUEsQ0FBQUUscUJBQUEsQ0FBQUwsQ0FBQSxHQUFBQyxDQUFBLEtBQUFLLENBQUEsR0FBQUEsQ0FBQSxDQUFBQyxNQUFBLFdBQUFOLENBQUEsV0FBQUUsTUFBQSxDQUFBSyx3QkFBQSxDQUFBUixDQUFBLEVBQUFDLENBQUEsRUFBQVEsVUFBQSxPQUFBUCxDQUFBLENBQUFRLElBQUEsQ0FBQUMsS0FBQSxDQUFBVCxDQUFBLEVBQUFJLENBQUEsWUFBQUosQ0FBQTtBQUFBLFNBQUFVLGNBQUFaLENBQUEsYUFBQUMsQ0FBQSxNQUFBQSxDQUFBLEdBQUFZLFNBQUEsQ0FBQUMsTUFBQSxFQUFBYixDQUFBLFVBQUFDLENBQUEsV0FBQVcsU0FBQSxDQUFBWixDQUFBLElBQUFZLFNBQUEsQ0FBQVosQ0FBQSxRQUFBQSxDQUFBLE9BQUFGLE9BQUEsQ0FBQUksTUFBQSxDQUFBRCxDQUFBLE9BQUFhLE9BQUEsV0FBQWQsQ0FBQSxJQUFBYixlQUFBLENBQUFZLENBQUEsRUFBQUMsQ0FBQSxFQUFBQyxDQUFBLENBQUFELENBQUEsU0FBQUUsTUFBQSxDQUFBYSx5QkFBQSxHQUFBYixNQUFBLENBQUFjLGdCQUFBLENBQUFqQixDQUFBLEVBQUFHLE1BQUEsQ0FBQWEseUJBQUEsQ0FBQWQsQ0FBQSxLQUFBSCxPQUFBLENBQUFJLE1BQUEsQ0FBQUQsQ0FBQSxHQUFBYSxPQUFBLFdBQUFkLENBQUEsSUFBQUUsTUFBQSxDQUFBZSxjQUFBLENBQUFsQixDQUFBLEVBQUFDLENBQUEsRUFBQUUsTUFBQSxDQUFBSyx3QkFBQSxDQUFBTixDQUFBLEVBQUFELENBQUEsaUJBQUFELENBQUE7QUFBQSxTQUFBbUIsYUFBQUMsT0FBQSxRQUFBQyx5QkFBQSxHQUFBQyx5QkFBQSxvQkFBQUMscUJBQUEsUUFBQUMsS0FBQSxHQUFBOUIsZUFBQSxDQUFBMEIsT0FBQSxHQUFBSyxNQUFBLE1BQUFKLHlCQUFBLFFBQUFLLFNBQUEsR0FBQWhDLGVBQUEsT0FBQWlDLFdBQUEsRUFBQUYsTUFBQSxHQUFBRyxPQUFBLENBQUFDLFNBQUEsQ0FBQUwsS0FBQSxFQUFBWCxTQUFBLEVBQUFhLFNBQUEsWUFBQUQsTUFBQSxHQUFBRCxLQUFBLENBQUFiLEtBQUEsT0FBQUUsU0FBQSxZQUFBcEIsMEJBQUEsT0FBQWdDLE1BQUE7QUFBQSxTQUFBSCwwQkFBQSxlQUFBTSxPQUFBLHFCQUFBQSxPQUFBLENBQUFDLFNBQUEsb0JBQUFELE9BQUEsQ0FBQUMsU0FBQSxDQUFBQyxJQUFBLDJCQUFBQyxLQUFBLG9DQUFBQyxPQUFBLENBQUFDLFNBQUEsQ0FBQUMsT0FBQSxDQUFBQyxJQUFBLENBQUFQLE9BQUEsQ0FBQUMsU0FBQSxDQUFBRyxPQUFBLDhDQUFBaEMsQ0FBQTtBQUNiRyw4Q0FBNkM7RUFDekNrQyxLQUFLLEVBQUU7QUFDWCxDQUFDLEVBQUM7QUFDRixDQUFDLEtBQUtDLENBTUwsQ0FBQztBQUNGLFNBQVNNLE9BQU9BLENBQUNDLE1BQU0sRUFBRUMsR0FBRyxFQUFFO0VBQzFCLEtBQUksSUFBSUMsSUFBSSxJQUFJRCxHQUFHLEVBQUMzQyxNQUFNLENBQUNlLGNBQWMsQ0FBQzJCLE1BQU0sRUFBRUUsSUFBSSxFQUFFO0lBQ3BEdEMsVUFBVSxFQUFFLElBQUk7SUFDaEJ1QyxHQUFHLEVBQUVGLEdBQUcsQ0FBQ0MsSUFBSTtFQUNqQixDQUFDLENBQUM7QUFDTjtBQUNBSCxPQUFPLENBQUNSLE9BQU8sRUFBRTtFQUNiRyxPQUFPLEVBQUUsU0FBQUEsUUFBQSxFQUFXO0lBQ2hCLE9BQU9BLFFBQU87RUFDbEIsQ0FBQztFQUNEQyxPQUFPLEVBQUUsU0FBQUEsUUFBQSxFQUFXO0lBQ2hCLE9BQU9BLFFBQU87RUFDbEIsQ0FBQztFQUNEQyxVQUFVLEVBQUUsU0FBQUEsV0FBQSxFQUFXO0lBQ25CLE9BQU9BLFdBQVU7RUFDckIsQ0FBQztFQUNEQyxNQUFNLEVBQUUsU0FBQUEsT0FBQSxFQUFXO0lBQ2YsT0FBT0EsUUFBTTtFQUNqQixDQUFDO0VBQ0RDLE9BQU8sRUFBRSxTQUFBQSxRQUFBLEVBQVc7SUFDaEIsT0FBT0EsUUFBTztFQUNsQjtBQUNKLENBQUMsQ0FBQztBQUNGLElBQU1NLHdCQUF3QixHQUFHL0QsbUJBQU8sQ0FBQyxnSUFBeUMsQ0FBQztBQUNuRixJQUFNZ0UsV0FBVyxHQUFHaEUsbUJBQU8sQ0FBQyxrRkFBbUIsQ0FBQztBQUNoREEsbUJBQU8sQ0FBQywySEFBb0MsQ0FBQztBQUM3QyxJQUFNaUUsTUFBTSxHQUFHLGFBQWNGLHdCQUF3QixDQUFDRyxDQUFDLENBQUNsRSxtQkFBTyxDQUFDLGdFQUFPLENBQUMsQ0FBQztBQUN6RSxJQUFNbUUsT0FBTyxHQUFHLGFBQWNKLHdCQUF3QixDQUFDRyxDQUFDLENBQUNsRSxtQkFBTyxDQUFDLGdGQUFrQixDQUFDLENBQUM7QUFDckYsSUFBTW9FLGdDQUFnQyxHQUFHcEUsbUJBQU8sQ0FBQyx5SkFBbUQsQ0FBQztBQUNyRyxJQUFNcUUsS0FBSyxHQUFHLGFBQWNOLHdCQUF3QixDQUFDRyxDQUFDLENBQUNsRSxtQkFBTyxDQUFDLDJGQUFvQixDQUFDLENBQUM7QUFDckYsSUFBTXNFLDJCQUEyQixHQUFHdEUsbUJBQU8sQ0FBQyw2SUFBNkMsQ0FBQztBQUMxRixJQUFNdUUsbUJBQW1CLEdBQUd2RSxtQkFBTyxDQUFDLHFKQUFpRCxDQUFDO0FBQ3RGLElBQU13RSxVQUFVLEdBQUd4RSxtQkFBTyxDQUFDLGlJQUF1QyxDQUFDO0FBQ25FLElBQU15RSxZQUFZLEdBQUd6RSxtQkFBTyxDQUFDLG1JQUF3QyxDQUFDO0FBQ3RFLElBQU0wRSxzQkFBc0IsR0FBRzFFLG1CQUFPLENBQUMsaUlBQXVDLENBQUM7QUFDL0UsSUFBTTJFLE1BQU0sR0FBRzNFLG1CQUFPLENBQUMsNkZBQXFCLENBQUM7QUFDN0MsSUFBTTRFLE9BQU8sR0FBRzVFLG1CQUFPLENBQUMscUZBQVUsQ0FBQztBQUNuQyxJQUFNNkUsWUFBWSxHQUFHLGFBQWNkLHdCQUF3QixDQUFDRyxDQUFDLENBQUNsRSxtQkFBTyxDQUFDLDJGQUFnQixDQUFDLENBQUM7QUFDeEYsSUFBTThFLFdBQVcsR0FBRyxhQUFjZix3QkFBd0IsQ0FBQ0csQ0FBQyxDQUFDbEUsbUJBQU8sQ0FBQyx5RkFBZSxDQUFDLENBQUM7QUFDdEYsSUFBTStFLGVBQWUsR0FBRy9FLG1CQUFPLENBQUMsaUdBQW1CLENBQUM7QUFDcEQsSUFBTWdGLE9BQU8sR0FBR2hGLG1CQUFPLENBQUMsK0VBQVUsQ0FBQztBQUNuQyxJQUFNaUYsUUFBUSxHQUFHakYsbUJBQU8sQ0FBQyxxRkFBaUIsQ0FBQztBQUMzQyxJQUFNa0YsZ0NBQWdDLEdBQUdsRixtQkFBTyxDQUFDLHlKQUFtRCxDQUFDO0FBQ3JHLElBQU1tRixlQUFlLEdBQUduRixtQkFBTyxDQUFDLG1HQUFvQixDQUFDO0FBQ3JELElBQU1vRixZQUFZLEdBQUdwRixtQkFBTyxDQUFDLDZGQUFpQixDQUFDO0FBQy9DLElBQU1xRiw4QkFBOEIsR0FBR3JGLG1CQUFPLENBQUMscUpBQWlELENBQUM7QUFDakcsSUFBTXNGLFNBQVMsR0FBR3RGLG1CQUFPLENBQUMsaUhBQStCLENBQUM7QUFDMUQsSUFBTXVGLGdDQUFnQyxHQUFHdkYsbUJBQU8sQ0FBQyx5SkFBbUQsQ0FBQztBQUNyRyxJQUFNd0YsbUJBQW1CLEdBQUd4RixtQkFBTyxDQUFDLHlKQUErQyxDQUFDO0FBQ3BGLElBQU15RixPQUFPLEdBQUcsYUFBYzFCLHdCQUF3QixDQUFDRyxDQUFDLENBQUNsRSxtQkFBTyxDQUFDLCtGQUFrQixDQUFDLENBQUM7QUFDckYsSUFBTTBGLGtCQUFrQixHQUFHMUYsbUJBQU8sQ0FBQyxpSUFBbUMsQ0FBQztBQUN2RSxJQUFNeUQsUUFBTyxHQUFHLFFBQVE7QUFDeEIsSUFBSUQsUUFBTTtBQUNWLElBQU1ILFFBQU8sR0FBRyxDQUFDLENBQUMsRUFBRWdCLEtBQUssV0FBUSxFQUFFLENBQUM7QUFDcEMsSUFBTXNCLFlBQVksR0FBRyxTQUFmQSxZQUFZQSxDQUFJQyxLQUFLO0VBQUEsT0FBRyxFQUFFLENBQUNDLEtBQUssQ0FBQzVDLElBQUksQ0FBQzJDLEtBQUssQ0FBQztBQUFBO0FBQ2xELElBQUlFLFdBQVc7QUFDZixJQUFJQyxhQUFhLEdBQUdDLFNBQVM7QUFDN0IsSUFBSUMsTUFBTTtBQUNWLElBQUlDLFVBQVU7QUFDZCxJQUFJQyxVQUFVO0FBQ2QsSUFBSUMsV0FBVztBQUNmLElBQUlDLHdCQUF3QixHQUFHLEtBQUs7QUFDcEMsSUFBSUMsWUFBWTtBQUNoQixJQUFJQyxpQkFBZ0I7QUFDcEIsSUFBSUMsU0FBUztBQUNiLElBQUlDLFNBQVMsRUFBRUMsV0FBVztBQUMxQixJQUFJQyxlQUFlO0FBQUMsSUFDZEMsU0FBUywwQkFBQUMscUJBQUE7RUFBQXZHLFNBQUEsQ0FBQXNHLFNBQUEsRUFBQUMscUJBQUE7RUFBQSxJQUFBQyxNQUFBLEdBQUE3RSxZQUFBLENBQUEyRSxTQUFBO0VBQUEsU0FBQUEsVUFBQTtJQUFBeEcsZUFBQSxPQUFBd0csU0FBQTtJQUFBLE9BQUFFLE1BQUEsQ0FBQXJGLEtBQUEsT0FBQUUsU0FBQTtFQUFBO0VBQUF0QixZQUFBLENBQUF1RyxTQUFBO0lBQUFHLEdBQUE7SUFBQTVELEtBQUEsRUFDWCxTQUFBNkQsa0JBQWtCQyxZQUFZLEVBQUVDLElBQUksRUFBRTtNQUNsQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsRUFBRSxDQUFDSCxZQUFZLEVBQUVDLElBQUksQ0FBQztJQUNyQztFQUFDO0lBQUFILEdBQUE7SUFBQTVELEtBQUEsRUFDRCxTQUFBa0Usa0JBQUEsRUFBb0I7TUFDaEIsSUFBSSxDQUFDQyxZQUFZLENBQUMsQ0FBQztNQUNuQjtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQSxJQUFJOUQsUUFBTSxDQUFDK0QsS0FBSyxLQUFLekIsV0FBVyxDQUFDMEIsVUFBVSxJQUFJMUIsV0FBVyxDQUFDMkIsVUFBVSxLQUFLLENBQUMsQ0FBQyxFQUFFakQsVUFBVSxDQUFDa0QsY0FBYyxFQUFFbEUsUUFBTSxDQUFDbUUsUUFBUSxDQUFDLElBQUlDLFFBQVEsQ0FBQ0MsTUFBTSxJQUFJQyxLQUErQixJQUFJekIsd0JBQXdCLENBQUMsSUFBSVAsV0FBVyxDQUFDcUIsS0FBSyxJQUFJckIsV0FBVyxDQUFDcUIsS0FBSyxDQUFDYyxPQUFPLEtBQUtMLFFBQVEsQ0FBQ0MsTUFBTSxJQUFJQyxLQUErQixJQUFJekIsd0JBQXdCLENBQUMsQ0FBQyxFQUFFO1FBQ2pWO1FBQ0E3QyxRQUFNLENBQUMwRSxPQUFPLENBQUMxRSxRQUFNLENBQUNtRSxRQUFRLEdBQUcsR0FBRyxHQUFHUSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUxRCxZQUFZLENBQUMyRCxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUzRCxZQUFZLENBQUM0RCxzQkFBc0IsRUFBRTdFLFFBQU0sQ0FBQzhFLEtBQUssQ0FBQyxFQUFFLElBQUlDLGVBQWUsQ0FBQ1gsUUFBUSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU1QixNQUFNLEVBQUU7VUFDM0s7VUFDQTtVQUNBO1VBQ0E7VUFDQXVDLEVBQUUsRUFBRSxDQUFDO1VBQ0w7VUFDQTtVQUNBO1VBQ0E7VUFDQUMsT0FBTyxFQUFFLENBQUMzQyxXQUFXLENBQUMwQixVQUFVLElBQUksQ0FBQ25CO1FBQ3pDLENBQUMsQ0FBQyxTQUFNLENBQUMsVUFBQ3FDLEdBQUcsRUFBRztVQUNaLElBQUksQ0FBQ0EsR0FBRyxDQUFDQyxTQUFTLEVBQUUsTUFBTUQsR0FBRztRQUNqQyxDQUFDLENBQUM7TUFDTjtJQUNKO0VBQUM7SUFBQTNCLEdBQUE7SUFBQTVELEtBQUEsRUFDRCxTQUFBeUYsbUJBQUEsRUFBcUI7TUFDakIsSUFBSSxDQUFDdEIsWUFBWSxDQUFDLENBQUM7SUFDdkI7RUFBQztJQUFBUCxHQUFBO0lBQUE1RCxLQUFBLEVBQ0QsU0FBQW1FLGFBQUEsRUFBZTtNQUNYLElBQUF1QixTQUFBLEdBQWVqQixRQUFRO1FBQWpCa0IsSUFBSSxHQUFBRCxTQUFBLENBQUpDLElBQUk7TUFDVkEsSUFBSSxHQUFHQSxJQUFJLElBQUlBLElBQUksQ0FBQ0MsU0FBUyxDQUFDLENBQUMsQ0FBQztNQUNoQyxJQUFJLENBQUNELElBQUksRUFBRTtNQUNYLElBQU1FLEVBQUUsR0FBR0MsUUFBUSxDQUFDQyxjQUFjLENBQUNKLElBQUksQ0FBQztNQUN4QyxJQUFJLENBQUNFLEVBQUUsRUFBRTtNQUNUO01BQ0E7TUFDQUcsVUFBVSxDQUFDO1FBQUEsT0FBSUgsRUFBRSxDQUFDSSxjQUFjLENBQUMsQ0FBQztNQUFBLEdBQUUsQ0FBQyxDQUFDO0lBQzFDO0VBQUM7SUFBQXJDLEdBQUE7SUFBQTVELEtBQUEsRUFDRCxTQUFBa0csT0FBQSxFQUFTO01BQ0wsSUFBSSxPQUF1QyxFQUUxQyxNQUFNO1FBQ0gsSUFBQUUsUUFBQSxHQUE0QnZKLG1CQUFPLENBQUMsMktBQXdELENBQUM7VUFBckZ3SixlQUFlLEdBQUFELFFBQUEsQ0FBZkMsZUFBZTtRQUN2QixPQUFPLGFBQWMsQ0FBQyxDQUFDLEVBQUV4RixXQUFXLENBQUN5RixHQUFHLEVBQUVELGVBQWUsRUFBRTtVQUN2REYsUUFBUSxFQUFFLElBQUksQ0FBQ25DLEtBQUssQ0FBQ21DO1FBQ3pCLENBQUMsQ0FBQztNQUNOO0lBQ0o7RUFBQztFQUFBLE9BQUExQyxTQUFBO0FBQUEsRUFwRG1CM0MsTUFBTSxXQUFRLENBQUN5RixTQUFTO0FBQUEsU0FzRGpDbkcsV0FBVUEsQ0FBQW9HLEVBQUE7RUFBQSxPQUFBQyxZQUFBLENBQUFuSSxLQUFBLE9BQUFFLFNBQUE7QUFBQTtBQUFBLFNBQUFpSSxhQUFBO0VBQUFBLFlBQUEsR0FBQXpKLGlCQUFBLGVBQUFKLG1CQUFBLENBQUE4SixJQUFBLENBQXpCLFNBQUFDLFFBQTBCQyxJQUFJO0lBQUEsSUFBQUMsTUFBQSxFQUFBQyxTQUFBLEVBQUFDLG1CQUFBLEVBQUFDLFNBQUEsRUFBQUMsa0JBQUEsRUFBQUMsU0FBQSxFQUFBQyxnQkFBQSxFQUFBQyxTQUFBLEVBQUFDLFNBQUEsRUFBQUMsUUFBQSxFQUFBQyxnQkFBQSxFQUFBQyxjQUFBLEVBQUFDLFNBQUEsRUFBQUMsZ0JBQUEsRUFBQUMsUUFBQTtJQUFBLE9BQUEvSyxtQkFBQSxDQUFBZ0wsSUFBQSxVQUFBQyxTQUFBQyxRQUFBO01BQUEsa0JBQUFBLFFBQUEsQ0FBQUMsSUFBQSxHQUFBRCxRQUFBLENBQUFFLElBQUE7UUFBQTtVQUMxQixJQUFJcEIsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFQSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1VBQzlCO1VBQ0EsSUFBSSxNQUF3QztZQUN4Q3RFLE9BQU8sV0FBUSxDQUFDMkYsU0FBUyxDQUFDcEwscUpBQTZDLENBQUM7WUFDeEV3RyxTQUFTLEdBQUd1RCxJQUFJLENBQUN2RCxTQUFTO1VBQzlCO1VBQ0FWLFdBQVcsR0FBR3VGLElBQUksQ0FBQ0MsS0FBSyxDQUFDckMsUUFBUSxDQUFDQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUNxQyxXQUFXLENBQUM7VUFDOUVDLE1BQU0sQ0FBQ0MsYUFBYSxHQUFHM0YsV0FBVztVQUNsQ0MsYUFBYSxHQUFHRCxXQUFXLENBQUNDLGFBQWE7VUFDbkNpRSxNQUFNLEdBQUdsRSxXQUFXLENBQUM0RixXQUFXLElBQUksRUFBRTtVQUM1Q0MsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxFQUFFLEdBQUc1QixNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUM7VUFBQTtVQUV2RDtVQUNBLENBQUMsQ0FBQyxFQUFFdEYsc0JBQXNCLENBQUNtSCxTQUFTLEVBQUU7WUFDbENDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztZQUN2QkMsbUJBQW1CLEVBQUVqRyxXQUFXLENBQUNrRyxhQUFhLElBQUksQ0FBQztVQUN2RCxDQUFDLENBQUM7VUFDRi9GLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRXRCLE1BQU0sQ0FBQ3NILE1BQU0sRUFBRSxDQUFDO1VBQzdCO1VBQ0EsSUFBSSxDQUFDLENBQUMsRUFBRTdHLFlBQVksQ0FBQzhHLFdBQVcsRUFBRWpHLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZDQSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUVkLGVBQWUsQ0FBQ2dILGNBQWMsRUFBRWxHLE1BQU0sQ0FBQztVQUN4RDtVQUNBLElBQUk2QixLQUErQixFQUFFLEVBeUJwQztVQUNELElBQUloQyxXQUFXLENBQUM0RyxZQUFZLEVBQUU7WUFBQTlCLFNBQUEsR0FDRzVLLG1CQUFPLENBQUMsK0VBQVUsQ0FBQyxFQUF4QzZLLGdCQUFnQixHQUFBRCxTQUFBLENBQWhCQyxnQkFBZ0I7WUFDeEJBLGdCQUFnQixDQUFDL0UsV0FBVyxDQUFDNEcsWUFBWSxDQUFDO1VBQzlDO1VBQ0F4RyxVQUFVLEdBQUcsSUFBSXBCLFdBQVcsV0FBUSxDQUFDZ0IsV0FBVyxDQUFDNkcsT0FBTyxFQUFFM0MsTUFBTSxDQUFDO1VBQzNEYyxRQUFRLEdBQUcsU0FBWEEsUUFBUUEsQ0FBSThCLEtBQUssRUFBRztZQUN0QixJQUFBQyxNQUFBLEdBQUE1TSxjQUFBLENBQWEyTSxLQUFLO2NBQWI3TCxDQUFDLEdBQUE4TCxNQUFBO2NBQUVDLENBQUMsR0FBQUQsTUFBQTtZQUNULE9BQU8zRyxVQUFVLENBQUM2RyxXQUFXLENBQUNDLFlBQVksQ0FBQ2pNLENBQUMsRUFBRStMLENBQUMsQ0FBQztVQUNwRCxDQUFDO1VBQ0QsSUFBSXRCLE1BQU0sQ0FBQ3lCLFFBQVEsRUFBRTtZQUNqQjtZQUNBO1lBQ0F6QixNQUFNLENBQUN5QixRQUFRLENBQUNDLEdBQUcsQ0FBQyxVQUFDQyxDQUFDO2NBQUEsT0FBR2hFLFVBQVUsQ0FBQztnQkFBQSxPQUFJMkIsUUFBUSxDQUFDcUMsQ0FBQyxDQUFDO2NBQUEsR0FBRSxDQUFDLENBQUM7WUFBQSxFQUFDO1VBQzVEO1VBQ0EzQixNQUFNLENBQUN5QixRQUFRLEdBQUcsRUFBRTtVQUNwQnpCLE1BQU0sQ0FBQ3lCLFFBQVEsQ0FBQ3pMLElBQUksR0FBR3NKLFFBQVE7VUFDL0IxRSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUV2QixZQUFZLFdBQVEsRUFBRSxDQUFDO1VBQ3pDdUIsV0FBVyxDQUFDZ0gsUUFBUSxHQUFHLFlBQUk7WUFDdkIsT0FBTzVKLFFBQU0sQ0FBQytELEtBQUs7VUFDdkIsQ0FBQztVQUNEcEIsVUFBVSxHQUFHOEMsUUFBUSxDQUFDQyxjQUFjLENBQUMsUUFBUSxDQUFDO1VBQUMsT0FBQStCLFFBQUEsQ0FBQW9DLE1BQUEsV0FDeEM7WUFDSDNCLFdBQVcsRUFBRTFCO1VBQ2pCLENBQUM7UUFBQTtRQUFBO1VBQUEsT0FBQWlCLFFBQUEsQ0FBQXFDLElBQUE7TUFBQTtJQUFBLEdBQUF4RCxPQUFBO0VBQUEsQ0FDSjtFQUFBLE9BQUFGLFlBQUEsQ0FBQW5JLEtBQUEsT0FBQUUsU0FBQTtBQUFBO0FBQ0QsU0FBUzRMLFNBQVNBLENBQUNDLEdBQUcsRUFBRUMsUUFBUSxFQUFFO0VBQzlCLE9BQU8sYUFBYyxDQUFDLENBQUMsRUFBRXpKLFdBQVcsQ0FBQ3lGLEdBQUcsRUFBRStELEdBQUcsRUFBQTlMLGFBQUEsS0FDdEMrTCxRQUFRLENBQ2QsQ0FBQztBQUNOO0FBQ0EsU0FBU0MsWUFBWUEsQ0FBQ2QsS0FBSyxFQUFFO0VBQUFuTSxFQUFBO0VBQ3pCLElBQU02SSxRQUFRLEdBQUtzRCxLQUFLLENBQWxCdEQsUUFBUTtFQUNkO0VBQ0EsSUFBTXFFLG1CQUFtQixHQUFHMUosTUFBTSxXQUFRLENBQUMySixPQUFPLENBQUMsWUFBSTtJQUNuRCxPQUFPLENBQUMsQ0FBQyxFQUFFdEksU0FBUyxDQUFDdUkseUJBQXlCLEVBQUVySyxRQUFNLENBQUM7RUFDM0QsQ0FBQyxFQUFFLEVBQUUsQ0FBQztFQUNOLElBQUlzSyw4QkFBOEI7RUFDbEMsT0FBTyxhQUFjLENBQUMsQ0FBQyxFQUFFOUosV0FBVyxDQUFDeUYsR0FBRyxFQUFFN0MsU0FBUyxFQUFFO0lBQ2pEUSxFQUFFLEVBQUUsU0FBQUEsR0FBQzJHLEtBQUs7TUFBQTtRQUFHO1FBQ1Q7UUFDQUMsV0FBVyxDQUFDO1VBQ1JSLEdBQUcsRUFBRS9HLFNBQVM7VUFDZGlDLEdBQUcsRUFBRXFGO1FBQ1QsQ0FBQyxDQUFDLFNBQU0sQ0FBQyxVQUFDckYsR0FBRztVQUFBLE9BQUd1RixPQUFPLENBQUNGLEtBQUssQ0FBQyx3QkFBd0IsRUFBRXJGLEdBQUcsQ0FBQztRQUFBO01BQUM7SUFBQTtJQUNqRVksUUFBUSxFQUFFLGFBQWMsQ0FBQyxDQUFDLEVBQUV0RixXQUFXLENBQUN5RixHQUFHLEVBQUVwRSw4QkFBOEIsQ0FBQzZJLGdCQUFnQixDQUFDQyxRQUFRLEVBQUU7TUFDbkdoTCxLQUFLLEVBQUV3SyxtQkFBbUI7TUFDMUJyRSxRQUFRLEVBQUUsYUFBYyxDQUFDLENBQUMsRUFBRXRGLFdBQVcsQ0FBQ3lGLEdBQUcsRUFBRWxFLGdDQUFnQyxDQUFDNkksbUJBQW1CLENBQUNELFFBQVEsRUFBRTtRQUN4R2hMLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRW1DLFNBQVMsQ0FBQytJLG9CQUFvQixFQUFFN0ssUUFBTSxDQUFDO1FBQ2xEOEYsUUFBUSxFQUFFLGFBQWMsQ0FBQyxDQUFDLEVBQUV0RixXQUFXLENBQUN5RixHQUFHLEVBQUVuRSxTQUFTLENBQUNnSiw4QkFBOEIsRUFBRTtVQUNuRjlLLE1BQU0sRUFBRUEsUUFBTTtVQUNkK0ssWUFBWSxFQUFFLENBQUNULDhCQUE4QixHQUFHbkMsSUFBSSxDQUFDRixhQUFhLENBQUMrQyxVQUFVLEtBQUssSUFBSSxHQUFHViw4QkFBOEIsR0FBRyxLQUFLO1VBQy9IeEUsUUFBUSxFQUFFLGFBQWMsQ0FBQyxDQUFDLEVBQUV0RixXQUFXLENBQUN5RixHQUFHLEVBQUVsRSxnQ0FBZ0MsQ0FBQ2tKLGlCQUFpQixDQUFDTixRQUFRLEVBQUU7WUFDdEdoTCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUVtQyxTQUFTLENBQUNvSixrQkFBa0IsRUFBRWxMLFFBQU0sQ0FBQztZQUNoRDhGLFFBQVEsRUFBRSxhQUFjLENBQUMsQ0FBQyxFQUFFdEYsV0FBVyxDQUFDeUYsR0FBRyxFQUFFbkYsMkJBQTJCLENBQUNxSyxhQUFhLENBQUNSLFFBQVEsRUFBRTtjQUM3RmhMLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRTZCLE9BQU8sQ0FBQzRKLHdCQUF3QixFQUFFcEwsUUFBTSxDQUFDO2NBQ3BEOEYsUUFBUSxFQUFFLGFBQWMsQ0FBQyxDQUFDLEVBQUV0RixXQUFXLENBQUN5RixHQUFHLEVBQUVyRixnQ0FBZ0MsQ0FBQ3lLLGtCQUFrQixDQUFDVixRQUFRLEVBQUU7Z0JBQ3ZHaEwsS0FBSyxFQUFFaUQsV0FBVztnQkFDbEJrRCxRQUFRLEVBQUUsYUFBYyxDQUFDLENBQUMsRUFBRXRGLFdBQVcsQ0FBQ3lGLEdBQUcsRUFBRXZFLGdDQUFnQyxDQUFDNEosa0JBQWtCLENBQUNYLFFBQVEsRUFBRTtrQkFDdkdoTCxLQUFLLEVBQUUyRSwwTkFBNkI7a0JBQ3BDd0IsUUFBUSxFQUFFQTtnQkFDZCxDQUFDO2NBQ0wsQ0FBQztZQUNMLENBQUM7VUFDTCxDQUFDO1FBQ0wsQ0FBQztNQUNMLENBQUM7SUFDTCxDQUFDO0VBQ0wsQ0FBQyxDQUFDO0FBQ047QUFBQzdJLEVBQUEsQ0F0Q1FpTixZQUFZO0FBQUFzQixFQUFBLEdBQVp0QixZQUFZO0FBdUNyQixJQUFNdUIsT0FBTyxHQUFHLFNBQVZBLE9BQU9BLENBQUl6QixHQUFHO0VBQUEsT0FBRyxVQUFDMEIsZUFBZSxFQUFHO0lBQ2xDLElBQU16QixRQUFRLEdBQUEvTCxhQUFBLENBQUFBLGFBQUEsS0FDUHdOLGVBQWU7TUFDbEJ4RixTQUFTLEVBQUUvQyxlQUFlO01BQzFCK0IsR0FBRyxFQUFFNUMsV0FBVyxDQUFDNEMsR0FBRztNQUNwQmxGLE1BQU0sRUFBTkE7SUFBTSxFQUNUO0lBQ0QsT0FBTyxhQUFjLENBQUMsQ0FBQyxFQUFFUSxXQUFXLENBQUN5RixHQUFHLEVBQUVpRSxZQUFZLEVBQUU7TUFDcERwRSxRQUFRLEVBQUVpRSxTQUFTLENBQUNDLEdBQUcsRUFBRUMsUUFBUTtJQUNyQyxDQUFDLENBQUM7RUFDTixDQUFDO0FBQUE7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTTyxXQUFXQSxDQUFDbUIsZ0JBQWdCLEVBQUU7RUFDbkMsSUFBTTNCLEdBQUcsR0FBVTJCLGdCQUFnQixDQUE3QjNCLEdBQUc7SUFBRTlFLEdBQUcsR0FBS3lHLGdCQUFnQixDQUF4QnpHLEdBQUc7RUFDZDtFQUNBO0VBQ0EsSUFBSSxNQUF1QztJQUN2QztJQUNBO0lBQ0FsQyxTQUFTLENBQUM0SSxvQkFBb0IsQ0FBQyxDQUFDO0lBQ2hDO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsT0FBT0MsUUFBUSxDQUFDO01BQ1o3QixHQUFHLEVBQUUsU0FBQUEsSUFBQTtRQUFBLE9BQUksSUFBSTtNQUFBO01BQ2JyRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO01BQ1R1QyxTQUFTLEVBQUUsU0FBQUEsVUFBQTtRQUFBLE9BQUksSUFBSTtNQUFBO01BQ25CNEYsV0FBVyxFQUFFO0lBQ2pCLENBQUMsQ0FBQztFQUNOO0VBQ0E7RUFDQXJCLE9BQU8sQ0FBQ0YsS0FBSyxDQUFDckYsR0FBRyxDQUFDO0VBQ2xCdUYsT0FBTyxDQUFDRixLQUFLLENBQUMsK0hBQStILENBQUM7RUFDOUksT0FBTzdILFVBQVUsQ0FBQ3FKLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLFVBQUM1QyxLQUFLLEVBQUc7SUFDaEQsSUFBWTZDLGNBQWMsR0FBa0I3QyxLQUFLLENBQTNDOEMsSUFBSTtNQUFrQkosV0FBVyxHQUFLMUMsS0FBSyxDQUFyQjBDLFdBQVc7SUFDdkMsT0FBTyxDQUFDaEosWUFBWSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsR0FBR0EsWUFBWSxDQUFDb0QsU0FBUyxNQUFNK0YsY0FBYyxHQUFHLG1QQUF5QixDQUFDRCxJQUFJLENBQUMsVUFBQ0csV0FBVyxFQUFHO01BQy9ILE9BQU8sNk9BQXVCLENBQUNILElBQUksQ0FBQyxVQUFDSSxTQUFTLEVBQUc7UUFDN0NwQyxHQUFHLEdBQUdvQyxTQUFTLFdBQVE7UUFDdkJULGdCQUFnQixDQUFDM0IsR0FBRyxHQUFHQSxHQUFHO1FBQzFCLE9BQU9tQyxXQUFXO01BQ3RCLENBQUMsQ0FBQztJQUNOLENBQUMsQ0FBQyxDQUFDSCxJQUFJLENBQUMsVUFBQ0ssQ0FBQztNQUFBLE9BQUk7UUFDTkosY0FBYyxFQUFFSSxDQUFDLFdBQVE7UUFDekJQLFdBQVcsRUFBRTtNQUNqQixDQUFDO0lBQUEsQ0FBQyxDQUFDLEdBQUc7TUFDTkcsY0FBYyxFQUFkQSxjQUFjO01BQ2RILFdBQVcsRUFBWEE7SUFDSixDQUFDO0VBQ0wsQ0FBQyxDQUFDLENBQUNFLElBQUksQ0FBQyxVQUFDNUMsS0FBSyxFQUFHO0lBQ2IsSUFBTTZDLGNBQWMsR0FBa0I3QyxLQUFLLENBQXJDNkMsY0FBYztNQUFFSCxXQUFXLEdBQUsxQyxLQUFLLENBQXJCMEMsV0FBVztJQUNqQyxJQUFJUSx1QkFBdUI7SUFDM0I7SUFDQTtJQUNBO0lBQ0EsSUFBTUMsT0FBTyxHQUFHZCxPQUFPLENBQUN6QixHQUFHLENBQUM7SUFDNUIsSUFBTXdDLE1BQU0sR0FBRztNQUNYdEcsU0FBUyxFQUFFK0YsY0FBYztNQUN6Qk0sT0FBTyxFQUFQQSxPQUFPO01BQ1B2TSxNQUFNLEVBQU5BLFFBQU07TUFDTnlNLEdBQUcsRUFBRTtRQUNEdkgsR0FBRyxFQUFIQSxHQUFHO1FBQ0hmLFFBQVEsRUFBRTdCLFdBQVcsQ0FBQzRKLElBQUk7UUFDMUJwSCxLQUFLLEVBQUV4QyxXQUFXLENBQUN3QyxLQUFLO1FBQ3hCckMsTUFBTSxFQUFOQSxNQUFNO1FBQ044SixPQUFPLEVBQVBBO01BQ0o7SUFDSixDQUFDO0lBQ0QsT0FBT0csT0FBTyxDQUFDQyxPQUFPLENBQUMsQ0FBQyxDQUFDTCx1QkFBdUIsR0FBR1gsZ0JBQWdCLENBQUNoSSxLQUFLLEtBQUssSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHMkksdUJBQXVCLENBQUNwSCxHQUFHLElBQUl5RyxnQkFBZ0IsQ0FBQ2hJLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRXhDLE1BQU0sQ0FBQ3lMLG1CQUFtQixFQUFFNUMsR0FBRyxFQUFFd0MsTUFBTSxDQUFDLENBQUMsQ0FBQ1IsSUFBSSxDQUFDLFVBQUNhLFNBQVM7TUFBQTtRQUFHO1FBQ2xOO1FBQ0FoQixRQUFRLENBQUEzTixhQUFBLENBQUFBLGFBQUEsS0FDRHlOLGdCQUFnQjtVQUNuQnpHLEdBQUcsRUFBSEEsR0FBRztVQUNIZ0IsU0FBUyxFQUFFK0YsY0FBYztVQUN6QkgsV0FBVyxFQUFYQSxXQUFXO1VBQ1huSSxLQUFLLEVBQUVrSjtRQUFTLEVBQ25CO01BQUM7SUFBQSxFQUFDO0VBQ1gsQ0FBQyxDQUFDO0FBQ047QUFDQTtBQUNBO0FBQ0EsU0FBU0MsSUFBSUEsQ0FBQzFELEtBQUssRUFBRTtFQUFBak0sR0FBQTtFQUNqQixJQUFNNFAsUUFBUSxHQUFLM0QsS0FBSyxDQUFsQjJELFFBQVE7RUFDZDtFQUNBO0VBQ0F0TSxNQUFNLFdBQVEsQ0FBQ3VNLGVBQWUsQ0FBQztJQUFBLE9BQUlELFFBQVEsQ0FBQyxDQUFDO0VBQUEsR0FBRSxDQUMzQ0EsUUFBUSxDQUNYLENBQUM7RUFDRixPQUFPLElBQUk7QUFDZjtBQUFDNVAsR0FBQSxDQVJRMlAsSUFBSTtBQUFBRyxHQUFBLEdBQUpILElBQUk7QUFTYixJQUFNSSxnQkFBZ0IsR0FBRztFQUNyQkMsZUFBZSxFQUFFLGlCQUFpQjtFQUNsQ0MsWUFBWSxFQUFFLGNBQWM7RUFDNUJDLFdBQVcsRUFBRSxhQUFhO0VBQzFCQyxZQUFZLEVBQUUsY0FBYztFQUM1QkMsV0FBVyxFQUFFO0FBQ2pCLENBQUM7QUFDRCxJQUFNQyxtQkFBbUIsR0FBRztFQUN4QkMsU0FBUyxFQUFFLG1CQUFtQjtFQUM5QkMsZUFBZSxFQUFFLDBCQUEwQjtFQUMzQ0MsbUJBQW1CLEVBQUUsZ0NBQWdDO0VBQ3JEOUgsTUFBTSxFQUFFO0FBQ1osQ0FBQztBQUNELElBQUkrSCxTQUFTLEdBQUcsSUFBSTtBQUNwQjtBQUNBLElBQUlDLGFBQWEsR0FBRyxJQUFJO0FBQ3hCLFNBQVNDLFVBQVVBLENBQUEsRUFBRztFQUNsQjtFQUNBLENBQ0laLGdCQUFnQixDQUFDRSxZQUFZLEVBQzdCRixnQkFBZ0IsQ0FBQ0ksWUFBWSxFQUM3QkosZ0JBQWdCLENBQUNHLFdBQVcsRUFDNUJILGdCQUFnQixDQUFDSyxXQUFXLENBQy9CLENBQUNsUCxPQUFPLENBQUMsVUFBQ2dJLElBQUk7SUFBQSxPQUFHMEgsV0FBVyxDQUFDRCxVQUFVLENBQUN6SCxJQUFJLENBQUM7RUFBQSxFQUFDO0FBQ25EO0FBQ0EsU0FBUzJILG1CQUFtQkEsQ0FBQSxFQUFHO0VBQzNCLElBQUksQ0FBQzdNLE1BQU0sQ0FBQzhNLEVBQUUsRUFBRTtFQUNoQkYsV0FBVyxDQUFDMUgsSUFBSSxDQUFDNkcsZ0JBQWdCLENBQUNJLFlBQVksQ0FBQyxDQUFDO0VBQUE7O0VBRWhELElBQU1ZLG1CQUFtQixHQUFHSCxXQUFXLENBQUNJLGdCQUFnQixDQUFDakIsZ0JBQWdCLENBQUNFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQ2hQLE1BQU07RUFDdEcsSUFBSThQLG1CQUFtQixFQUFFO0lBQ3JCLElBQU1FLHNCQUFzQixHQUFHTCxXQUFXLENBQUNNLE9BQU8sQ0FBQ2IsbUJBQW1CLENBQUNFLGVBQWUsRUFBRVIsZ0JBQWdCLENBQUNDLGVBQWUsRUFBRUQsZ0JBQWdCLENBQUNFLFlBQVksQ0FBQztJQUN4SixJQUFNa0IsZ0JBQWdCLEdBQUdQLFdBQVcsQ0FBQ00sT0FBTyxDQUFDYixtQkFBbUIsQ0FBQ0MsU0FBUyxFQUFFUCxnQkFBZ0IsQ0FBQ0UsWUFBWSxFQUFFRixnQkFBZ0IsQ0FBQ0ksWUFBWSxDQUFDO0lBQ3pJLElBQUk7SUFBMEM7SUFDOUNjLHNCQUFzQixJQUFJRSxnQkFBZ0IsRUFBRTtNQUN4Q3JNLE9BQU8sV0FBUSxDQUFDc00sU0FBUyxDQUFDLHlCQUF5QixFQUFFO1FBQ2pEQyxTQUFTLEVBQUVULFdBQVcsQ0FBQ1UsVUFBVSxHQUFHTCxzQkFBc0IsQ0FBQ0ksU0FBUztRQUNwRUUsVUFBVSxFQUFFO1VBQ1J2SyxRQUFRLEVBQUVDLFFBQVEsQ0FBQ0QsUUFBUTtVQUMzQlcsS0FBSyxFQUFFVixRQUFRLENBQUNDO1FBQ3BCO01BQ0osQ0FBQyxDQUFDLENBQUNzSyxHQUFHLENBQUNaLFdBQVcsQ0FBQ1UsVUFBVSxHQUFHSCxnQkFBZ0IsQ0FBQ0UsU0FBUyxHQUFHRixnQkFBZ0IsQ0FBQ00sUUFBUSxDQUFDO0lBQzNGO0VBQ0o7RUFDQSxJQUFJMUwsV0FBVyxFQUFFO0lBQ2I2SyxXQUFXLENBQUNJLGdCQUFnQixDQUFDWCxtQkFBbUIsQ0FBQ0MsU0FBUyxDQUFDLENBQUNwUCxPQUFPLENBQUM2RSxXQUFXLENBQUM7RUFDcEY7RUFDQTRLLFVBQVUsQ0FBQyxDQUFDO0FBQ2hCO0FBQ0EsU0FBU2Usa0JBQWtCQSxDQUFBLEVBQUc7RUFDMUIsSUFBSSxDQUFDMU4sTUFBTSxDQUFDOE0sRUFBRSxFQUFFO0VBQ2hCRixXQUFXLENBQUMxSCxJQUFJLENBQUM2RyxnQkFBZ0IsQ0FBQ0csV0FBVyxDQUFDLENBQUM7RUFBQTs7RUFFL0MsSUFBTXlCLGVBQWUsR0FBR2YsV0FBVyxDQUFDSSxnQkFBZ0IsQ0FBQ2pCLGdCQUFnQixDQUFDSyxXQUFXLEVBQUUsTUFBTSxDQUFDO0VBQzFGLElBQUksQ0FBQ3VCLGVBQWUsQ0FBQzFRLE1BQU0sRUFBRTtFQUM3QixJQUFNOFAsbUJBQW1CLEdBQUdILFdBQVcsQ0FBQ0ksZ0JBQWdCLENBQUNqQixnQkFBZ0IsQ0FBQ0UsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDaFAsTUFBTTtFQUN0RyxJQUFJOFAsbUJBQW1CLEVBQUU7SUFDckJILFdBQVcsQ0FBQ00sT0FBTyxDQUFDYixtQkFBbUIsQ0FBQ0csbUJBQW1CLEVBQUVtQixlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUN6TyxJQUFJLEVBQUU2TSxnQkFBZ0IsQ0FBQ0UsWUFBWSxDQUFDO0lBQ3BIVyxXQUFXLENBQUNNLE9BQU8sQ0FBQ2IsbUJBQW1CLENBQUMzSCxNQUFNLEVBQUVxSCxnQkFBZ0IsQ0FBQ0UsWUFBWSxFQUFFRixnQkFBZ0IsQ0FBQ0csV0FBVyxDQUFDO0lBQzVHLElBQUluSyxXQUFXLEVBQUU7TUFDYjZLLFdBQVcsQ0FBQ0ksZ0JBQWdCLENBQUNYLG1CQUFtQixDQUFDM0gsTUFBTSxDQUFDLENBQUN4SCxPQUFPLENBQUM2RSxXQUFXLENBQUM7TUFDN0U2SyxXQUFXLENBQUNJLGdCQUFnQixDQUFDWCxtQkFBbUIsQ0FBQ0csbUJBQW1CLENBQUMsQ0FBQ3RQLE9BQU8sQ0FBQzZFLFdBQVcsQ0FBQztJQUM5RjtFQUNKO0VBQ0E0SyxVQUFVLENBQUMsQ0FBQztFQUNaLENBQ0lOLG1CQUFtQixDQUFDRyxtQkFBbUIsRUFDdkNILG1CQUFtQixDQUFDM0gsTUFBTSxDQUM3QixDQUFDeEgsT0FBTyxDQUFDLFVBQUNnUSxPQUFPO0lBQUEsT0FBR04sV0FBVyxDQUFDZ0IsYUFBYSxDQUFDVixPQUFPLENBQUM7RUFBQSxFQUFDO0FBQzVEO0FBQ0EsU0FBU1csa0JBQWtCQSxDQUFDQyxLQUFLLEVBQUVyTCxFQUFFLEVBQUU7RUFDbkM7RUFDQSxJQUFJekMsTUFBTSxDQUFDOE0sRUFBRSxFQUFFO0lBQ1hGLFdBQVcsQ0FBQzFILElBQUksQ0FBQzZHLGdCQUFnQixDQUFDRSxZQUFZLENBQUM7RUFDbkQ7RUFDQSxJQUFNOEIsT0FBTyxHQUFHdEwsRUFBRSxDQUFDaUssYUFBYSxHQUFHRyxtQkFBbUIsR0FBR2Esa0JBQWtCLENBQUM7RUFDNUUsSUFBSSxDQUFDakIsU0FBUyxFQUFFO0lBQ1o7SUFDQUEsU0FBUyxHQUFHak4sT0FBTyxXQUFRLENBQUN3TyxXQUFXLENBQUNGLEtBQUssRUFBRUMsT0FBTyxFQUFFO01BQ3BERSxrQkFBa0IsRUFBRXBOLG1CQUFtQixDQUFDb047SUFDNUMsQ0FBQyxDQUFDO0lBQ0Y7SUFDQXZCLGFBQWEsR0FBRyxLQUFLO0VBQ3pCLENBQUMsTUFBTTtJQUNILElBQU13QixlQUFlLEdBQUc1TyxNQUFNLFdBQVEsQ0FBQzRPLGVBQWU7SUFDdERBLGVBQWUsQ0FBQyxZQUFJO01BQ2hCekIsU0FBUyxDQUFDL0gsTUFBTSxDQUFDcUosT0FBTyxDQUFDO0lBQzdCLENBQUMsQ0FBQztFQUNOO0FBQ0o7QUFDQSxTQUFTSSxJQUFJQSxDQUFDbEcsS0FBSyxFQUFFO0VBQUFoTSxHQUFBO0VBQ2pCLElBQU1tUyxTQUFTLEdBQWVuRyxLQUFLLENBQTdCbUcsU0FBUztJQUFFekosUUFBUSxHQUFLc0QsS0FBSyxDQUFsQnRELFFBQVE7RUFDekI7RUFDQTtFQUNBckYsTUFBTSxXQUFRLENBQUN1TSxlQUFlLENBQUM7SUFBQSxPQUFJdUMsU0FBUyxDQUFDbFIsT0FBTyxDQUFDLFVBQUMwTyxRQUFRO01BQUEsT0FBR0EsUUFBUSxDQUFDLENBQUM7SUFBQSxFQUFDO0VBQUEsR0FBRSxDQUMxRXdDLFNBQVMsQ0FDWixDQUFDO0VBQ0YsSUFBSWpMLEtBQTRCLEVBQUUsRUFRakM7RUFDRCxPQUFPd0IsUUFBUTtBQUNuQjtBQUFDMUksR0FBQSxDQWpCUWtTLElBQUk7QUFBQU0sR0FBQSxHQUFKTixJQUFJO0FBa0JiLFNBQVN6RCxRQUFRQSxDQUFDekosS0FBSyxFQUFFO0VBQ3JCLElBQU00SCxHQUFHLEdBQTRCNUgsS0FBSyxDQUFwQzRILEdBQUc7SUFBRTlELFNBQVMsR0FBaUI5RCxLQUFLLENBQS9COEQsU0FBUztJQUFFdkMsS0FBSyxHQUFVdkIsS0FBSyxDQUFwQnVCLEtBQUs7SUFBRXVCLEdBQUcsR0FBSzlDLEtBQUssQ0FBYjhDLEdBQUc7RUFDaEMsSUFBSTRHLFdBQVcsR0FBRyxTQUFTLElBQUkxSixLQUFLLEdBQUdJLFNBQVMsR0FBR0osS0FBSyxDQUFDMEosV0FBVztFQUNwRTVGLFNBQVMsR0FBR0EsU0FBUyxJQUFJcEQsWUFBWSxDQUFDb0QsU0FBUztFQUMvQ3ZDLEtBQUssR0FBR0EsS0FBSyxJQUFJYixZQUFZLENBQUNhLEtBQUs7RUFDbkMsSUFBTXNHLFFBQVEsR0FBQS9MLGFBQUEsQ0FBQUEsYUFBQSxLQUNQeUYsS0FBSztJQUNSdUMsU0FBUyxFQUFUQSxTQUFTO0lBQ1RoQixHQUFHLEVBQUhBLEdBQUc7SUFDSGxGLE1BQU0sRUFBTkE7RUFBTSxFQUNUO0VBQ0Q7RUFDQThDLFlBQVksR0FBR21ILFFBQVE7RUFDdkIsSUFBSTRGLFFBQVEsR0FBRyxLQUFLO0VBQ3BCLElBQUlDLGNBQWM7RUFDbEIsSUFBTUMsYUFBYSxHQUFHLElBQUlyRCxPQUFPLENBQUMsVUFBQ0MsT0FBTyxFQUFFcUQsTUFBTSxFQUFHO0lBQ2pELElBQUlqTixpQkFBZ0IsRUFBRTtNQUNsQkEsaUJBQWdCLENBQUMsQ0FBQztJQUN0QjtJQUNBK00sY0FBYyxHQUFHLFNBQUFBLGVBQUEsRUFBSTtNQUNqQi9NLGlCQUFnQixHQUFHLElBQUk7TUFDdkI0SixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDRDVKLGlCQUFnQixHQUFHLFNBQUFBLGlCQUFBLEVBQUk7TUFDbkI4TSxRQUFRLEdBQUcsSUFBSTtNQUNmOU0saUJBQWdCLEdBQUcsSUFBSTtNQUN2QixJQUFNd0gsS0FBSyxHQUFHOU0sTUFBTSxDQUFDZSxjQUFjLENBQUMsSUFBSXlSLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLG1CQUFtQixFQUFFO1FBQzFGdFEsS0FBSyxFQUFFLE1BQU07UUFDYjVCLFVBQVUsRUFBRSxLQUFLO1FBQ2pCbVMsWUFBWSxFQUFFO01BQ2xCLENBQUMsQ0FBQztNQUNGM0YsS0FBSyxDQUFDcEYsU0FBUyxHQUFHLElBQUk7TUFDdEI2SyxNQUFNLENBQUN6RixLQUFLLENBQUM7SUFDakIsQ0FBQztFQUNMLENBQUMsQ0FBQztFQUNGO0VBQ0E7RUFDQSxTQUFTNEYsT0FBT0EsQ0FBQSxFQUFHO0lBQ2YsSUFBSSxDQUFDckUsV0FBVyxJQUFJO0lBQ3BCO0lBQUEsSUFDcUMsRUFBRTtNQUNuQyxPQUFPLEtBQUs7SUFDaEI7SUFDQSxJQUFNc0UsZ0JBQWdCLEdBQUdqTyxZQUFZLENBQUNzRCxRQUFRLENBQUM0SyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3RGLElBQU1DLFlBQVksR0FBRyxJQUFJQyxHQUFHLENBQUNILGdCQUFnQixDQUFDMUcsR0FBRyxDQUFDLFVBQUM4RyxHQUFHO01BQUEsT0FBR0EsR0FBRyxDQUFDQyxZQUFZLENBQUMsYUFBYSxDQUFDO0lBQUEsRUFBQyxDQUFDO0lBQzFGLElBQU1DLFFBQVEsR0FBR2pMLFFBQVEsQ0FBQ2tMLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQztJQUMvRCxJQUFNQyxLQUFLLEdBQUdGLFFBQVEsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUdBLFFBQVEsQ0FBQ0QsWUFBWSxDQUFDLFlBQVksQ0FBQztJQUM3RTNFLFdBQVcsQ0FBQ3pOLE9BQU8sQ0FBQyxVQUFDK0ssS0FBSyxFQUFHO01BQ3pCLElBQU15SCxJQUFJLEdBQVd6SCxLQUFLLENBQXBCeUgsSUFBSTtRQUFFQyxJQUFJLEdBQUsxSCxLQUFLLENBQWQwSCxJQUFJO01BQ2hCLElBQUksQ0FBQ1IsWUFBWSxDQUFDUyxHQUFHLENBQUNGLElBQUksQ0FBQyxFQUFFO1FBQ3pCLElBQU1HLFFBQVEsR0FBR3ZMLFFBQVEsQ0FBQ3dMLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDaERELFFBQVEsQ0FBQ0UsWUFBWSxDQUFDLGFBQWEsRUFBRUwsSUFBSSxDQUFDO1FBQzFDRyxRQUFRLENBQUNFLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1FBQ25DLElBQUlOLEtBQUssRUFBRTtVQUNQSSxRQUFRLENBQUNFLFlBQVksQ0FBQyxPQUFPLEVBQUVOLEtBQUssQ0FBQztRQUN6QztRQUNBbkwsUUFBUSxDQUFDMEwsSUFBSSxDQUFDQyxXQUFXLENBQUNKLFFBQVEsQ0FBQztRQUNuQ0EsUUFBUSxDQUFDSSxXQUFXLENBQUMzTCxRQUFRLENBQUM0TCxjQUFjLENBQUNQLElBQUksQ0FBQyxDQUFDO01BQ3ZEO0lBQ0osQ0FBQyxDQUFDO0lBQ0YsT0FBTyxJQUFJO0VBQ2Y7RUFDQSxTQUFTUSxZQUFZQSxDQUFBLEVBQUc7SUFDcEI7SUFBSTtJQUNKLEtBS1MsRUFBRSx5RUE4QlY7SUFDRCxJQUFJbFAsS0FBSyxDQUFDOFAsTUFBTSxFQUFFO01BQ2QsSUFBQUMsYUFBQSxHQUFpQi9QLEtBQUssQ0FBQzhQLE1BQU07UUFBckJFLENBQUMsR0FBQUQsYUFBQSxDQUFEQyxDQUFDO1FBQUVDLENBQUMsR0FBQUYsYUFBQSxDQUFERSxDQUFDO01BQ1osQ0FBQyxDQUFDLEVBQUV0UixtQkFBbUIsQ0FBQ3VSLGtCQUFrQixFQUFFLFlBQUk7UUFDNUN0SyxNQUFNLENBQUN1SyxRQUFRLENBQUNILENBQUMsRUFBRUMsQ0FBQyxDQUFDO01BQ3pCLENBQUMsQ0FBQztJQUNOO0VBQ0o7RUFDQSxTQUFTRyxZQUFZQSxDQUFBLEVBQUc7SUFDcEIxQyxjQUFjLENBQUMsQ0FBQztFQUNwQjtFQUNBSyxPQUFPLENBQUMsQ0FBQztFQUNULElBQU1zQyxJQUFJLEdBQUcsYUFBYyxDQUFDLENBQUMsRUFBRWpTLFdBQVcsQ0FBQ2tTLElBQUksRUFBRWxTLFdBQVcsQ0FBQ21TLFFBQVEsRUFBRTtJQUNuRTdNLFFBQVEsRUFBRSxDQUNOLGFBQWMsQ0FBQyxDQUFDLEVBQUV0RixXQUFXLENBQUN5RixHQUFHLEVBQUU2RyxJQUFJLEVBQUU7TUFDckNDLFFBQVEsRUFBRXVFO0lBQ2QsQ0FBQyxDQUFDLEVBQ0YsYUFBYyxDQUFDLENBQUMsRUFBRTlRLFdBQVcsQ0FBQ2tTLElBQUksRUFBRXhJLFlBQVksRUFBRTtNQUM5Q3BFLFFBQVEsRUFBRSxDQUNOaUUsU0FBUyxDQUFDQyxHQUFHLEVBQUVDLFFBQVEsQ0FBQyxFQUN4QixhQUFjLENBQUMsQ0FBQyxFQUFFekosV0FBVyxDQUFDeUYsR0FBRyxFQUFFN0UsT0FBTyxDQUFDd1IsTUFBTSxFQUFFO1FBQy9DQyxJQUFJLEVBQUUsc0JBQXNCO1FBQzVCL00sUUFBUSxFQUFFLGFBQWMsQ0FBQyxDQUFDLEVBQUV0RixXQUFXLENBQUN5RixHQUFHLEVBQUUxRSxlQUFlLENBQUN1UixjQUFjLEVBQUUsQ0FBQyxDQUFDO01BQ25GLENBQUMsQ0FBQztJQUVWLENBQUMsQ0FBQztFQUVWLENBQUMsQ0FBQztFQUNGO0VBQ0E5RCxrQkFBa0IsQ0FBQ3JNLFVBQVUsRUFBRSxVQUFDb0ssUUFBUTtJQUFBLE9BQUcsYUFBYyxDQUFDLENBQUMsRUFBRXZNLFdBQVcsQ0FBQ3lGLEdBQUcsRUFBRXFKLElBQUksRUFBRTtNQUM1RUMsU0FBUyxFQUFFLENBQ1B4QyxRQUFRLEVBQ1J5RixZQUFZLENBQ2Y7TUFDRDFNLFFBQVEsRUFBRXhCLE1BQThCLEdBQUcsYUFBYyxDQUV2RCxHQUFHbU87SUFDVCxDQUFDLENBQUM7RUFBQSxFQUFDO0VBQ1AsT0FBTzFDLGFBQWE7QUFDeEI7QUFBQyxTQUNjbEssTUFBTUEsQ0FBQW9OLEdBQUE7RUFBQSxPQUFBQyxPQUFBLENBQUFqVixLQUFBLE9BQUFFLFNBQUE7QUFBQTtBQUFBLFNBQUErVSxRQUFBO0VBQUFBLE9BQUEsR0FBQXZXLGlCQUFBLGVBQUFKLG1CQUFBLENBQUE4SixJQUFBLENBQXJCLFNBQUE4TSxTQUFzQkMsY0FBYztJQUFBLElBQUFDLFNBQUE7SUFBQSxPQUFBOVcsbUJBQUEsQ0FBQWdMLElBQUEsVUFBQStMLFVBQUFDLFNBQUE7TUFBQSxrQkFBQUEsU0FBQSxDQUFBN0wsSUFBQSxHQUFBNkwsU0FBQSxDQUFBNUwsSUFBQTtRQUFBO1VBQUEsTUFLNUJ5TCxjQUFjLENBQUNsTyxHQUFHO1VBQUk7VUFDekIsT0FBT2tPLGNBQWMsQ0FBQ2xOLFNBQVMsS0FBSyxXQUFXLElBQUksQ0FBQ2tOLGNBQWMsQ0FBQ0ksYUFBYSxDQUFDO1lBQUFELFNBQUEsQ0FBQTVMLElBQUE7WUFBQTtVQUFBO1VBQUE0TCxTQUFBLENBQUE1TCxJQUFBO1VBQUEsT0FDeEU2QyxXQUFXLENBQUM0SSxjQUFjLENBQUM7UUFBQTtVQUFBLE9BQUFHLFNBQUEsQ0FBQTFKLE1BQUE7UUFBQTtVQUFBMEosU0FBQSxDQUFBN0wsSUFBQTtVQUFBNkwsU0FBQSxDQUFBNUwsSUFBQTtVQUFBLE9BSTNCa0UsUUFBUSxDQUFDdUgsY0FBYyxDQUFDO1FBQUE7VUFBQUcsU0FBQSxDQUFBNUwsSUFBQTtVQUFBO1FBQUE7VUFBQTRMLFNBQUEsQ0FBQTdMLElBQUE7VUFBQTZMLFNBQUEsQ0FBQUUsRUFBQSxHQUFBRixTQUFBO1VBRXhCRixTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUU1UixRQUFRLENBQUNpUyxjQUFjLEVBQUFILFNBQUEsQ0FBQUUsRUFBSyxDQUFDLEVBQ25EO1VBQUEsS0FDSUosU0FBUyxDQUFDbE8sU0FBUztZQUFBb08sU0FBQSxDQUFBNUwsSUFBQTtZQUFBO1VBQUE7VUFBQSxNQUNiMEwsU0FBUztRQUFBO1VBRW5CLElBQUksTUFBd0M7WUFDeEM7WUFDQTFOLFVBQVUsQ0FBQyxZQUFJO2NBQ1gsTUFBTTBOLFNBQVM7WUFDbkIsQ0FBQyxDQUFDO1VBQ047VUFBQ0UsU0FBQSxDQUFBNUwsSUFBQTtVQUFBLE9BQ0s2QyxXQUFXLENBQUF0TSxhQUFBLENBQUFBLGFBQUEsS0FDVmtWLGNBQWM7WUFDakJsTyxHQUFHLEVBQUVtTztVQUFTLEVBQ2pCLENBQUM7UUFBQTtRQUFBO1VBQUEsT0FBQUUsU0FBQSxDQUFBekosSUFBQTtNQUFBO0lBQUEsR0FBQXFKLFFBQUE7RUFBQSxDQUVUO0VBQUEsT0FBQUQsT0FBQSxDQUFBalYsS0FBQSxPQUFBRSxTQUFBO0FBQUE7QUFBQSxTQUNjMkIsUUFBT0EsQ0FBQTZULEdBQUE7RUFBQSxPQUFBQyxTQUFBLENBQUEzVixLQUFBLE9BQUFFLFNBQUE7QUFBQTtBQUFBLFNBQUF5VixVQUFBO0VBQUFBLFNBQUEsR0FBQWpYLGlCQUFBLGVBQUFKLG1CQUFBLENBQUE4SixJQUFBLENBQXRCLFNBQUF3TixTQUF1QnROLElBQUk7SUFBQSxJQUFBdU4sVUFBQSxFQUFBQyxhQUFBLEVBQUFDLEdBQUEsRUFBQUMsR0FBQSxFQUFBQyxjQUFBLEVBQUFDLFNBQUEsRUFBQUMsa0JBQUEsRUFBQUMsY0FBQSxFQUFBQyxTQUFBO0lBQUEsT0FBQS9YLG1CQUFBLENBQUFnTCxJQUFBLFVBQUFnTixVQUFBQyxTQUFBO01BQUEsa0JBQUFBLFNBQUEsQ0FBQTlNLElBQUEsR0FBQThNLFNBQUEsQ0FBQTdNLElBQUE7UUFBQTtVQUNuQm1NLFVBQVUsR0FBR3hSLFdBQVcsQ0FBQzRDLEdBQUc7VUFBQXNQLFNBQUEsQ0FBQTlNLElBQUE7VUFBQThNLFNBQUEsQ0FBQTdNLElBQUE7VUFBQSxPQUVBakYsVUFBVSxDQUFDNkcsV0FBVyxDQUFDa0wsY0FBYyxDQUFDLE9BQU8sQ0FBQztRQUFBO1VBQXBFVixhQUFhLEdBQUFTLFNBQUEsQ0FBQUUsSUFBQTtVQUFBLE1BQ2YsT0FBTyxJQUFJWCxhQUFhO1lBQUFTLFNBQUEsQ0FBQTdNLElBQUE7WUFBQTtVQUFBO1VBQUEsTUFDbEJvTSxhQUFhLENBQUN4SixLQUFLO1FBQUE7VUFFVnlKLEdBQUcsR0FBbUJELGFBQWEsQ0FBOUNZLFNBQVMsRUFBZ0JWLEdBQUcsR0FBS0YsYUFBYSxDQUE5QnJVLE9BQU87VUFDL0J1RCxTQUFTLEdBQUcrUSxHQUFHO1VBQ2YsSUFBSUMsR0FBRyxJQUFJQSxHQUFHLENBQUNXLGVBQWUsRUFBRTtZQUM1QjFSLFdBQVcsR0FBRyxTQUFBQSxZQUFDa0csS0FBSyxFQUFHO2NBQ25CLElBQU15TCxFQUFFLEdBQXdFekwsS0FBSyxDQUEvRXlMLEVBQUU7Z0JBQUV4VSxJQUFJLEdBQWtFK0ksS0FBSyxDQUEzRS9JLElBQUk7Z0JBQUVtTyxTQUFTLEdBQXVEcEYsS0FBSyxDQUFyRW9GLFNBQVM7Z0JBQUU3TyxLQUFLLEdBQWdEeUosS0FBSyxDQUExRHpKLEtBQUs7Z0JBQUVpUCxRQUFRLEdBQXNDeEYsS0FBSyxDQUFuRHdGLFFBQVE7Z0JBQUVrRyxTQUFTLEdBQTJCMUwsS0FBSyxDQUF6QzBMLFNBQVM7Z0JBQUVDLE9BQU8sR0FBa0IzTCxLQUFLLENBQTlCMkwsT0FBTztnQkFBRUMsV0FBVyxHQUFLNUwsS0FBSyxDQUFyQjRMLFdBQVc7Y0FDM0U7Y0FDQSxJQUFNQyxRQUFRLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUlDLElBQUksQ0FBQ0MsS0FBSyxDQUFDRCxJQUFJLENBQUNFLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO2NBQ25GLElBQUlDLGNBQWM7Y0FDbEIsSUFBSVIsT0FBTyxJQUFJQSxPQUFPLENBQUMzVyxNQUFNLEVBQUU7Z0JBQzNCbVgsY0FBYyxHQUFHUixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUN2RyxTQUFTO2NBQ3pDO2NBQ0EsSUFBTWdILFNBQVMsR0FBRztnQkFDZFgsRUFBRSxFQUFFQSxFQUFFLElBQUlJLFFBQVE7Z0JBQ2xCNVUsSUFBSSxFQUFKQSxJQUFJO2dCQUNKbU8sU0FBUyxFQUFFQSxTQUFTLElBQUkrRyxjQUFjO2dCQUN0QzVWLEtBQUssRUFBRUEsS0FBSyxJQUFJLElBQUksR0FBR2lQLFFBQVEsR0FBR2pQLEtBQUs7Z0JBQ3ZDOFYsS0FBSyxFQUFFWCxTQUFTLEtBQUssTUFBTSxJQUFJQSxTQUFTLEtBQUssU0FBUyxHQUFHLFFBQVEsR0FBRztjQUN4RSxDQUFDO2NBQ0QsSUFBSUUsV0FBVyxFQUFFO2dCQUNiUSxTQUFTLENBQUNSLFdBQVcsR0FBR0EsV0FBVztjQUN2QztjQUNBZixHQUFHLENBQUNXLGVBQWUsQ0FBQ1ksU0FBUyxDQUFDO1lBQ2xDLENBQUM7VUFDTDtVQUFDLE1BR0QsU0FBMENsVCxXQUFXLENBQUM0QyxHQUFHO1lBQUFzUCxTQUFBLENBQUE3TSxJQUFBO1lBQUE7VUFBQTtVQUFBNk0sU0FBQSxDQUFBZixFQUFBLEdBQUc7WUFDeERsSixLQUFLLEVBQUVqSSxXQUFXLENBQUM0QztVQUN2QixDQUFDO1VBQUFzUCxTQUFBLENBQUE3TSxJQUFBO1VBQUE7UUFBQTtVQUFBNk0sU0FBQSxDQUFBN00sSUFBQTtVQUFBLE9BQVNqRixVQUFVLENBQUM2RyxXQUFXLENBQUNrTCxjQUFjLENBQUNuUyxXQUFXLENBQUM0SixJQUFJLENBQUM7UUFBQTtVQUFBc0ksU0FBQSxDQUFBZixFQUFBLEdBQUFlLFNBQUEsQ0FBQUUsSUFBQTtRQUFBO1VBSjNEUixjQUFjLEdBQUFNLFNBQUEsQ0FBQWYsRUFBQTtVQUFBLE1BS2hCLE9BQU8sSUFBSVMsY0FBYztZQUFBTSxTQUFBLENBQUE3TSxJQUFBO1lBQUE7VUFBQTtVQUFBLE1BQ25CdU0sY0FBYyxDQUFDM0osS0FBSztRQUFBO1VBRTlCcEgsZUFBZSxHQUFHK1EsY0FBYyxDQUFDUyxTQUFTO1VBQUM7VUFBQVIsU0FBQSxHQUVSM1gsbUJBQU8sQ0FBQyw0R0FBNkIsQ0FBQyxFQUE3RDRYLGtCQUFrQixHQUFBRCxTQUFBLENBQWxCQyxrQkFBa0I7VUFBQSxJQUNyQkEsa0JBQWtCLENBQUNqUixlQUFlLENBQUM7WUFBQXFSLFNBQUEsQ0FBQTdNLElBQUE7WUFBQTtVQUFBO1VBQUEsTUFDOUJsSyxNQUFNLENBQUNlLGNBQWMsQ0FBQyxJQUFJeVIsS0FBSyxDQUFDLHdEQUF3RCxHQUFHM04sV0FBVyxDQUFDNEosSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLG1CQUFtQixFQUFFO1lBQzNJdk0sS0FBSyxFQUFFLE1BQU07WUFDYjVCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCbVMsWUFBWSxFQUFFO1VBQ2xCLENBQUMsQ0FBQztRQUFBO1VBQUFzRSxTQUFBLENBQUE3TSxJQUFBO1VBQUE7UUFBQTtVQUFBNk0sU0FBQSxDQUFBOU0sSUFBQTtVQUFBOE0sU0FBQSxDQUFBa0IsRUFBQSxHQUFBbEIsU0FBQTtVQUlWO1VBQ0FWLFVBQVUsR0FBRyxDQUFDLENBQUMsRUFBRXJTLFFBQVEsQ0FBQ2lTLGNBQWMsRUFBQWMsU0FBQSxDQUFBa0IsRUFBTyxDQUFDO1FBQUM7VUFFckQsSUFBSSxNQUF3QztZQUNsQ3JCLGNBQWMsR0FBRzdYLDJMQUFxRSxFQUM1RjtZQUNBO1lBQ0EsSUFBSXNYLFVBQVUsRUFBRTtjQUNaLElBQUlBLFVBQVUsS0FBS3hSLFdBQVcsQ0FBQzRDLEdBQUcsRUFBRTtnQkFDaENTLFVBQVUsQ0FBQyxZQUFJO2tCQUNYLElBQUk0RSxLQUFLO2tCQUNULElBQUk7b0JBQ0E7b0JBQ0E7b0JBQ0E7b0JBQ0EsTUFBTTlNLE1BQU0sQ0FBQ2UsY0FBYyxDQUFDLElBQUl5UixLQUFLLENBQUM2RCxVQUFVLENBQUM2QixPQUFPLENBQUMsRUFBRSxtQkFBbUIsRUFBRTtzQkFDNUVoVyxLQUFLLEVBQUUsTUFBTTtzQkFDYjVCLFVBQVUsRUFBRSxLQUFLO3NCQUNqQm1TLFlBQVksRUFBRTtvQkFDbEIsQ0FBQyxDQUFDO2tCQUNOLENBQUMsQ0FBQyxPQUFPNVMsQ0FBQyxFQUFFO29CQUNSaU4sS0FBSyxHQUFHak4sQ0FBQztrQkFDYjtrQkFDQWlOLEtBQUssQ0FBQ2xLLElBQUksR0FBR3lULFVBQVUsQ0FBQ3pULElBQUk7a0JBQzVCa0ssS0FBSyxDQUFDcUwsS0FBSyxHQUFHOUIsVUFBVSxDQUFDOEIsS0FBSztrQkFDOUIsSUFBTUMsU0FBUyxHQUFHL0IsVUFBVSxDQUFDZ0MsTUFBTTtrQkFDbkM7a0JBQ0E7a0JBQ0EsSUFBSSxDQUFDLENBQUMsRUFBRTVULGtCQUFrQixDQUFDNlQsaUJBQWlCLEVBQUVqQyxVQUFVLENBQUMsRUFBRTtvQkFDdkR2SixLQUFLLENBQUNvTCxPQUFPLEdBQUcsbUVBQW1FO2tCQUN2RjtrQkFDQSxNQUFNdEIsY0FBYyxDQUFDOUosS0FBSyxFQUFFc0wsU0FBUyxDQUFDO2dCQUMxQyxDQUFDLENBQUM7Y0FDTixDQUFDLE1BQU07Z0JBQ0hsUSxVQUFVLENBQUMsWUFBSTtrQkFDWCxNQUFNbU8sVUFBVTtnQkFDcEIsQ0FBQyxDQUFDO2NBQ047WUFDSjtVQUNKO1VBQUMsS0FDRzlMLE1BQU0sQ0FBQ2dPLG1CQUFtQjtZQUFBeEIsU0FBQSxDQUFBN00sSUFBQTtZQUFBO1VBQUE7VUFBQTZNLFNBQUEsQ0FBQTdNLElBQUE7VUFBQSxPQUNwQkssTUFBTSxDQUFDZ08sbUJBQW1CLENBQUMxVCxXQUFXLENBQUMyVCxVQUFVLENBQUM7UUFBQTtVQUU1RGpXLFFBQU0sR0FBRyxDQUFDLENBQUMsRUFBRXdCLE9BQU8sQ0FBQzBVLFlBQVksRUFBRTVULFdBQVcsQ0FBQzRKLElBQUksRUFBRTVKLFdBQVcsQ0FBQ3dDLEtBQUssRUFBRXJDLE1BQU0sRUFBRTtZQUM1RTBULFlBQVksRUFBRTdULFdBQVcsQ0FBQ3FCLEtBQUs7WUFDL0JqQixVQUFVLEVBQVZBLFVBQVU7WUFDVnNILEdBQUcsRUFBRS9HLFNBQVM7WUFDZGlELFNBQVMsRUFBRS9DLGVBQWU7WUFDMUJzSSxPQUFPLEVBQVBBLE9BQU87WUFDUHZHLEdBQUcsRUFBRTRPLFVBQVU7WUFDZjlQLFVBQVUsRUFBRTFFLE9BQU8sQ0FBQ2dELFdBQVcsQ0FBQzBCLFVBQVUsQ0FBQztZQUMzQ29TLFlBQVksRUFBRSxTQUFBQSxhQUFDMVMsSUFBSSxFQUFFc0csR0FBRyxFQUFFa0ksTUFBTTtjQUFBLE9BQUdyTSxNQUFNLENBQUNwSSxNQUFNLENBQUNtSCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVsQixJQUFJLEVBQUU7Z0JBQzFEc0csR0FBRyxFQUFIQSxHQUFHO2dCQUNIa0ksTUFBTSxFQUFOQTtjQUNKLENBQUMsQ0FBQyxDQUFDO1lBQUE7WUFDUG5KLE1BQU0sRUFBRXpHLFdBQVcsQ0FBQ3lHLE1BQU07WUFDMUJGLE9BQU8sRUFBRXZHLFdBQVcsQ0FBQ3VHLE9BQU87WUFDNUJ0RyxhQUFhLEVBQWJBLGFBQWE7WUFDYjhULGFBQWEsRUFBRS9ULFdBQVcsQ0FBQytULGFBQWE7WUFDeENDLFNBQVMsRUFBRWhVLFdBQVcsQ0FBQ2dVO1VBQzNCLENBQUMsQ0FBQztVQUFDOUIsU0FBQSxDQUFBN00sSUFBQTtVQUFBLE9BQzhCM0gsUUFBTSxDQUFDdVcsZ0NBQWdDO1FBQUE7VUFBeEUxVCx3QkFBd0IsR0FBQTJSLFNBQUEsQ0FBQUUsSUFBQTtVQUNsQkosU0FBUyxHQUFHO1lBQ2R0SyxHQUFHLEVBQUUvRyxTQUFTO1lBQ2R1VCxPQUFPLEVBQUUsSUFBSTtZQUNidFEsU0FBUyxFQUFFL0MsZUFBZTtZQUMxQlEsS0FBSyxFQUFFckIsV0FBVyxDQUFDcUIsS0FBSztZQUN4QnVCLEdBQUcsRUFBRTRPLFVBQVU7WUFDZk4sYUFBYSxFQUFFO1VBQ25CLENBQUM7VUFBQSxNQUNHak4sSUFBSSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsR0FBR0EsSUFBSSxDQUFDNkcsWUFBWTtZQUFBb0gsU0FBQSxDQUFBN00sSUFBQTtZQUFBO1VBQUE7VUFBQTZNLFNBQUEsQ0FBQTdNLElBQUE7VUFBQSxPQUNuQ3BCLElBQUksQ0FBQzZHLFlBQVksQ0FBQyxDQUFDO1FBQUE7VUFFN0J2SCxNQUFNLENBQUN5TyxTQUFTLENBQUM7UUFBQztRQUFBO1VBQUEsT0FBQUUsU0FBQSxDQUFBMUssSUFBQTtNQUFBO0lBQUEsR0FBQStKLFFBQUE7RUFBQSxDQUNyQjtFQUFBLE9BQUFELFNBQUEsQ0FBQTNWLEtBQUEsT0FBQUUsU0FBQTtBQUFBO0FBRUQsSUFBSSxDQUFDLE9BQU91QixPQUFPLFdBQVEsS0FBSyxVQUFVLElBQUssT0FBT0EsT0FBTyxXQUFRLEtBQUssUUFBUSxJQUFJQSxPQUFPLFdBQVEsS0FBSyxJQUFLLEtBQUssT0FBT0EsT0FBTyxXQUFRLENBQUMrVyxVQUFVLEtBQUssV0FBVyxFQUFFO0VBQ3JLaFosTUFBTSxDQUFDZSxjQUFjLENBQUNrQixPQUFPLFdBQVEsRUFBRSxZQUFZLEVBQUU7SUFBRUMsS0FBSyxFQUFFO0VBQUssQ0FBQyxDQUFDO0VBQ3JFbEMsTUFBTSxDQUFDbUgsTUFBTSxDQUFDbEYsT0FBTyxXQUFRLEVBQUVBLE9BQU8sQ0FBQztFQUN2Q0UsTUFBTSxDQUFDRixPQUFPLEdBQUdBLE9BQU8sV0FBUTtBQUNsQztBQUFDLElBQUE4TCxFQUFBLEVBQUF5QixHQUFBLEVBQUEyQyxHQUFBO0FBQUE4RyxZQUFBLENBQUFsTCxFQUFBO0FBQUFrTCxZQUFBLENBQUF6SixHQUFBO0FBQUF5SixZQUFBLENBQUE5RyxHQUFBIiwic291cmNlcyI6WyJEOlxcYWFfZnJvbnRFbmRcXG5leHRfcHJhY3RpY2VcXG5vZGVfbW9kdWxlc1xcbmV4dFxcZGlzdFxcY2xpZW50XFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgbG9jYXRpb24gKi8gLy8gaW1wb3J0cyBwb2x5ZmlsbCBmcm9tIGBAbmV4dC9wb2x5ZmlsbC1tb2R1bGVgIGFmdGVyIGJ1aWxkLlxuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG4wICYmIChtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBlbWl0dGVyOiBudWxsLFxuICAgIGh5ZHJhdGU6IG51bGwsXG4gICAgaW5pdGlhbGl6ZTogbnVsbCxcbiAgICByb3V0ZXI6IG51bGwsXG4gICAgdmVyc2lvbjogbnVsbFxufSk7XG5mdW5jdGlvbiBfZXhwb3J0KHRhcmdldCwgYWxsKSB7XG4gICAgZm9yKHZhciBuYW1lIGluIGFsbClPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBuYW1lLCB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogYWxsW25hbWVdXG4gICAgfSk7XG59XG5fZXhwb3J0KGV4cG9ydHMsIHtcbiAgICBlbWl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGVtaXR0ZXI7XG4gICAgfSxcbiAgICBoeWRyYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGh5ZHJhdGU7XG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGluaXRpYWxpemU7XG4gICAgfSxcbiAgICByb3V0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcm91dGVyO1xuICAgIH0sXG4gICAgdmVyc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgIH1cbn0pO1xuY29uc3QgX2ludGVyb3BfcmVxdWlyZV9kZWZhdWx0ID0gcmVxdWlyZShcIkBzd2MvaGVscGVycy9fL19pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdFwiKTtcbmNvbnN0IF9qc3hydW50aW1lID0gcmVxdWlyZShcInJlYWN0L2pzeC1ydW50aW1lXCIpO1xucmVxdWlyZShcIi4uL2J1aWxkL3BvbHlmaWxscy9wb2x5ZmlsbC1tb2R1bGVcIik7XG5jb25zdCBfcmVhY3QgPSAvKiNfX1BVUkVfXyovIF9pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdC5fKHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5jb25zdCBfY2xpZW50ID0gLyojX19QVVJFX18qLyBfaW50ZXJvcF9yZXF1aXJlX2RlZmF1bHQuXyhyZXF1aXJlKFwicmVhY3QtZG9tL2NsaWVudFwiKSk7XG5jb25zdCBfaGVhZG1hbmFnZXJjb250ZXh0c2hhcmVkcnVudGltZSA9IHJlcXVpcmUoXCIuLi9zaGFyZWQvbGliL2hlYWQtbWFuYWdlci1jb250ZXh0LnNoYXJlZC1ydW50aW1lXCIpO1xuY29uc3QgX21pdHQgPSAvKiNfX1BVUkVfXyovIF9pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdC5fKHJlcXVpcmUoXCIuLi9zaGFyZWQvbGliL21pdHRcIikpO1xuY29uc3QgX3JvdXRlcmNvbnRleHRzaGFyZWRydW50aW1lID0gcmVxdWlyZShcIi4uL3NoYXJlZC9saWIvcm91dGVyLWNvbnRleHQuc2hhcmVkLXJ1bnRpbWVcIik7XG5jb25zdCBfaGFuZGxlc21vb3Roc2Nyb2xsID0gcmVxdWlyZShcIi4uL3NoYXJlZC9saWIvcm91dGVyL3V0aWxzL2hhbmRsZS1zbW9vdGgtc2Nyb2xsXCIpO1xuY29uc3QgX2lzZHluYW1pYyA9IHJlcXVpcmUoXCIuLi9zaGFyZWQvbGliL3JvdXRlci91dGlscy9pcy1keW5hbWljXCIpO1xuY29uc3QgX3F1ZXJ5c3RyaW5nID0gcmVxdWlyZShcIi4uL3NoYXJlZC9saWIvcm91dGVyL3V0aWxzL3F1ZXJ5c3RyaW5nXCIpO1xuY29uc3QgX3J1bnRpbWVjb25maWdleHRlcm5hbCA9IHJlcXVpcmUoXCIuLi9zaGFyZWQvbGliL3J1bnRpbWUtY29uZmlnLmV4dGVybmFsXCIpO1xuY29uc3QgX3V0aWxzID0gcmVxdWlyZShcIi4uL3NoYXJlZC9saWIvdXRpbHNcIik7XG5jb25zdCBfcG9ydGFsID0gcmVxdWlyZShcIi4vcG9ydGFsXCIpO1xuY29uc3QgX2hlYWRtYW5hZ2VyID0gLyojX19QVVJFX18qLyBfaW50ZXJvcF9yZXF1aXJlX2RlZmF1bHQuXyhyZXF1aXJlKFwiLi9oZWFkLW1hbmFnZXJcIikpO1xuY29uc3QgX3BhZ2Vsb2FkZXIgPSAvKiNfX1BVUkVfXyovIF9pbnRlcm9wX3JlcXVpcmVfZGVmYXVsdC5fKHJlcXVpcmUoXCIuL3BhZ2UtbG9hZGVyXCIpKTtcbmNvbnN0IF9yb3V0ZWFubm91bmNlciA9IHJlcXVpcmUoXCIuL3JvdXRlLWFubm91bmNlclwiKTtcbmNvbnN0IF9yb3V0ZXIgPSByZXF1aXJlKFwiLi9yb3V0ZXJcIik7XG5jb25zdCBfaXNlcnJvciA9IHJlcXVpcmUoXCIuLi9saWIvaXMtZXJyb3JcIik7XG5jb25zdCBfaW1hZ2Vjb25maWdjb250ZXh0c2hhcmVkcnVudGltZSA9IHJlcXVpcmUoXCIuLi9zaGFyZWQvbGliL2ltYWdlLWNvbmZpZy1jb250ZXh0LnNoYXJlZC1ydW50aW1lXCIpO1xuY29uc3QgX3JlbW92ZWJhc2VwYXRoID0gcmVxdWlyZShcIi4vcmVtb3ZlLWJhc2UtcGF0aFwiKTtcbmNvbnN0IF9oYXNiYXNlcGF0aCA9IHJlcXVpcmUoXCIuL2hhcy1iYXNlLXBhdGhcIik7XG5jb25zdCBfYXBwcm91dGVyY29udGV4dHNoYXJlZHJ1bnRpbWUgPSByZXF1aXJlKFwiLi4vc2hhcmVkL2xpYi9hcHAtcm91dGVyLWNvbnRleHQuc2hhcmVkLXJ1bnRpbWVcIik7XG5jb25zdCBfYWRhcHRlcnMgPSByZXF1aXJlKFwiLi4vc2hhcmVkL2xpYi9yb3V0ZXIvYWRhcHRlcnNcIik7XG5jb25zdCBfaG9va3NjbGllbnRjb250ZXh0c2hhcmVkcnVudGltZSA9IHJlcXVpcmUoXCIuLi9zaGFyZWQvbGliL2hvb2tzLWNsaWVudC1jb250ZXh0LnNoYXJlZC1ydW50aW1lXCIpO1xuY29uc3QgX29ucmVjb3ZlcmFibGVlcnJvciA9IHJlcXVpcmUoXCIuL3JlYWN0LWNsaWVudC1jYWxsYmFja3Mvb24tcmVjb3ZlcmFibGUtZXJyb3JcIik7XG5jb25zdCBfdHJhY2VyID0gLyojX19QVVJFX18qLyBfaW50ZXJvcF9yZXF1aXJlX2RlZmF1bHQuXyhyZXF1aXJlKFwiLi90cmFjaW5nL3RyYWNlclwiKSk7XG5jb25zdCBfaXNuZXh0cm91dGVyZXJyb3IgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzL2lzLW5leHQtcm91dGVyLWVycm9yXCIpO1xuY29uc3QgdmVyc2lvbiA9IFwiMTUuMi40XCI7XG5sZXQgcm91dGVyO1xuY29uc3QgZW1pdHRlciA9ICgwLCBfbWl0dC5kZWZhdWx0KSgpO1xuY29uc3QgbG9vc2VUb0FycmF5ID0gKGlucHV0KT0+W10uc2xpY2UuY2FsbChpbnB1dCk7XG5sZXQgaW5pdGlhbERhdGE7XG5sZXQgZGVmYXVsdExvY2FsZSA9IHVuZGVmaW5lZDtcbmxldCBhc1BhdGg7XG5sZXQgcGFnZUxvYWRlcjtcbmxldCBhcHBFbGVtZW50O1xubGV0IGhlYWRNYW5hZ2VyO1xubGV0IGluaXRpYWxNYXRjaGVzTWlkZGxld2FyZSA9IGZhbHNlO1xubGV0IGxhc3RBcHBQcm9wcztcbmxldCBsYXN0UmVuZGVyUmVqZWN0O1xubGV0IGRldkNsaWVudDtcbmxldCBDYWNoZWRBcHAsIG9uUGVyZkVudHJ5O1xubGV0IENhY2hlZENvbXBvbmVudDtcbmNsYXNzIENvbnRhaW5lciBleHRlbmRzIF9yZWFjdC5kZWZhdWx0LkNvbXBvbmVudCB7XG4gICAgY29tcG9uZW50RGlkQ2F0Y2goY29tcG9uZW50RXJyLCBpbmZvKSB7XG4gICAgICAgIHRoaXMucHJvcHMuZm4oY29tcG9uZW50RXJyLCBpbmZvKTtcbiAgICB9XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9IYXNoKCk7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gcmVwbGFjZSB0aGUgcm91dGVyIHN0YXRlIGlmOlxuICAgICAgICAvLyAtIHRoZSBwYWdlIHdhcyAoYXV0bykgZXhwb3J0ZWQgYW5kIGhhcyBhIHF1ZXJ5IHN0cmluZyBvciBzZWFyY2ggKGhhc2gpXG4gICAgICAgIC8vIC0gaXQgd2FzIGF1dG8gZXhwb3J0ZWQgYW5kIGlzIGEgZHluYW1pYyByb3V0ZSAodG8gcHJvdmlkZSBwYXJhbXMpXG4gICAgICAgIC8vIC0gaWYgaXQgaXMgYSBjbGllbnQtc2lkZSBza2VsZXRvbiAoZmFsbGJhY2sgcmVuZGVyKVxuICAgICAgICAvLyAtIGlmIG1pZGRsZXdhcmUgbWF0Y2hlcyB0aGUgY3VycmVudCBwYWdlIChtYXkgaGF2ZSByZXdyaXRlIHBhcmFtcylcbiAgICAgICAgLy8gLSBpZiByZXdyaXRlcyBpbiBuZXh0LmNvbmZpZy5qcyBtYXRjaCAobWF5IGhhdmUgcmV3cml0ZSBwYXJhbXMpXG4gICAgICAgIGlmIChyb3V0ZXIuaXNTc3IgJiYgKGluaXRpYWxEYXRhLmlzRmFsbGJhY2sgfHwgaW5pdGlhbERhdGEubmV4dEV4cG9ydCAmJiAoKDAsIF9pc2R5bmFtaWMuaXNEeW5hbWljUm91dGUpKHJvdXRlci5wYXRobmFtZSkgfHwgbG9jYXRpb24uc2VhcmNoIHx8IHByb2Nlc3MuZW52Ll9fTkVYVF9IQVNfUkVXUklURVMgfHwgaW5pdGlhbE1hdGNoZXNNaWRkbGV3YXJlKSB8fCBpbml0aWFsRGF0YS5wcm9wcyAmJiBpbml0aWFsRGF0YS5wcm9wcy5fX05fU1NHICYmIChsb2NhdGlvbi5zZWFyY2ggfHwgcHJvY2Vzcy5lbnYuX19ORVhUX0hBU19SRVdSSVRFUyB8fCBpbml0aWFsTWF0Y2hlc01pZGRsZXdhcmUpKSkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHF1ZXJ5IG9uIG1vdW50IGZvciBleHBvcnRlZCBwYWdlc1xuICAgICAgICAgICAgcm91dGVyLnJlcGxhY2Uocm91dGVyLnBhdGhuYW1lICsgJz8nICsgU3RyaW5nKCgwLCBfcXVlcnlzdHJpbmcuYXNzaWduKSgoMCwgX3F1ZXJ5c3RyaW5nLnVybFF1ZXJ5VG9TZWFyY2hQYXJhbXMpKHJvdXRlci5xdWVyeSksIG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKSkpLCBhc1BhdGgsIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgLy8gV0FSTklORzogYF9oYCBpcyBhbiBpbnRlcm5hbCBvcHRpb24gZm9yIGhhbmRpbmcgTmV4dC5qc1xuICAgICAgICAgICAgICAgIC8vIGNsaWVudC1zaWRlIGh5ZHJhdGlvbi4gWW91ciBhcHAgc2hvdWxkIF9uZXZlcl8gdXNlIHRoaXMgcHJvcGVydHkuXG4gICAgICAgICAgICAgICAgLy8gSXQgbWF5IGNoYW5nZSBhdCBhbnkgdGltZSB3aXRob3V0IG5vdGljZS5cbiAgICAgICAgICAgICAgICBfaDogMSxcbiAgICAgICAgICAgICAgICAvLyBGYWxsYmFjayBwYWdlcyBtdXN0IHRyaWdnZXIgdGhlIGRhdGEgZmV0Y2gsIHNvIHRoZSB0cmFuc2l0aW9uIGlzXG4gICAgICAgICAgICAgICAgLy8gbm90IHNoYWxsb3cuXG4gICAgICAgICAgICAgICAgLy8gT3RoZXIgcGFnZXMgKHN0cmljdGx5IHVwZGF0aW5nIHF1ZXJ5KSBoYXBwZW5zIHNoYWxsb3dseSwgYXMgZGF0YVxuICAgICAgICAgICAgICAgIC8vIHJlcXVpcmVtZW50cyB3b3VsZCBhbHJlYWR5IGJlIHByZXNlbnQuXG4gICAgICAgICAgICAgICAgc2hhbGxvdzogIWluaXRpYWxEYXRhLmlzRmFsbGJhY2sgJiYgIWluaXRpYWxNYXRjaGVzTWlkZGxld2FyZVxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycik9PntcbiAgICAgICAgICAgICAgICBpZiAoIWVyci5jYW5jZWxsZWQpIHRocm93IGVycjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb0hhc2goKTtcbiAgICB9XG4gICAgc2Nyb2xsVG9IYXNoKCkge1xuICAgICAgICBsZXQgeyBoYXNoIH0gPSBsb2NhdGlvbjtcbiAgICAgICAgaGFzaCA9IGhhc2ggJiYgaGFzaC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGlmICghaGFzaCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhhc2gpO1xuICAgICAgICBpZiAoIWVsKSByZXR1cm47XG4gICAgICAgIC8vIElmIHdlIGNhbGwgc2Nyb2xsSW50b1ZpZXcoKSBpbiBoZXJlIHdpdGhvdXQgYSBzZXRUaW1lb3V0XG4gICAgICAgIC8vIGl0IHdvbid0IHNjcm9sbCBwcm9wZXJseS5cbiAgICAgICAgc2V0VGltZW91dCgoKT0+ZWwuc2Nyb2xsSW50b1ZpZXcoKSwgMCk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgeyBQYWdlc0Rldk92ZXJsYXkgfSA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9yZWFjdC1kZXYtb3ZlcmxheS9wYWdlcy9wYWdlcy1kZXYtb3ZlcmxheScpO1xuICAgICAgICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gKDAsIF9qc3hydW50aW1lLmpzeCkoUGFnZXNEZXZPdmVybGF5LCB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZShvcHRzKSB7XG4gICAgaWYgKG9wdHMgPT09IHZvaWQgMCkgb3B0cyA9IHt9O1xuICAgIC8vIFRoaXMgbWFrZXMgc3VyZSB0aGlzIHNwZWNpZmljIGxpbmVzIGFyZSByZW1vdmVkIGluIHByb2R1Y3Rpb25cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgX3RyYWNlci5kZWZhdWx0Lm9uU3BhbkVuZChyZXF1aXJlKCcuL3RyYWNpbmcvcmVwb3J0LXRvLXNvY2tldCcpLmRlZmF1bHQpO1xuICAgICAgICBkZXZDbGllbnQgPSBvcHRzLmRldkNsaWVudDtcbiAgICB9XG4gICAgaW5pdGlhbERhdGEgPSBKU09OLnBhcnNlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdfX05FWFRfREFUQV9fJykudGV4dENvbnRlbnQpO1xuICAgIHdpbmRvdy5fX05FWFRfREFUQV9fID0gaW5pdGlhbERhdGE7XG4gICAgZGVmYXVsdExvY2FsZSA9IGluaXRpYWxEYXRhLmRlZmF1bHRMb2NhbGU7XG4gICAgY29uc3QgcHJlZml4ID0gaW5pdGlhbERhdGEuYXNzZXRQcmVmaXggfHwgJyc7XG4gICAgc2VsZi5fX25leHRfc2V0X3B1YmxpY19wYXRoX18oXCJcIiArIHByZWZpeCArIFwiL19uZXh0L1wiKSAvL2VzbGludC1kaXNhYmxlLWxpbmVcbiAgICA7XG4gICAgLy8gSW5pdGlhbGl6ZSBuZXh0L2NvbmZpZyB3aXRoIHRoZSBlbnZpcm9ubWVudCBjb25maWd1cmF0aW9uXG4gICAgKDAsIF9ydW50aW1lY29uZmlnZXh0ZXJuYWwuc2V0Q29uZmlnKSh7XG4gICAgICAgIHNlcnZlclJ1bnRpbWVDb25maWc6IHt9LFxuICAgICAgICBwdWJsaWNSdW50aW1lQ29uZmlnOiBpbml0aWFsRGF0YS5ydW50aW1lQ29uZmlnIHx8IHt9XG4gICAgfSk7XG4gICAgYXNQYXRoID0gKDAsIF91dGlscy5nZXRVUkwpKCk7XG4gICAgLy8gbWFrZSBzdXJlIG5vdCB0byBhdHRlbXB0IHN0cmlwcGluZyBiYXNlUGF0aCBmb3IgNDA0c1xuICAgIGlmICgoMCwgX2hhc2Jhc2VwYXRoLmhhc0Jhc2VQYXRoKShhc1BhdGgpKSB7XG4gICAgICAgIGFzUGF0aCA9ICgwLCBfcmVtb3ZlYmFzZXBhdGgucmVtb3ZlQmFzZVBhdGgpKGFzUGF0aCk7XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5fX05FWFRfSTE4Tl9TVVBQT1JUKSB7XG4gICAgICAgIGNvbnN0IHsgbm9ybWFsaXplTG9jYWxlUGF0aCB9ID0gcmVxdWlyZSgnLi4vc2hhcmVkL2xpYi9pMThuL25vcm1hbGl6ZS1sb2NhbGUtcGF0aCcpO1xuICAgICAgICBjb25zdCB7IGRldGVjdERvbWFpbkxvY2FsZSB9ID0gcmVxdWlyZSgnLi4vc2hhcmVkL2xpYi9pMThuL2RldGVjdC1kb21haW4tbG9jYWxlJyk7XG4gICAgICAgIGNvbnN0IHsgcGFyc2VSZWxhdGl2ZVVybCB9ID0gcmVxdWlyZSgnLi4vc2hhcmVkL2xpYi9yb3V0ZXIvdXRpbHMvcGFyc2UtcmVsYXRpdmUtdXJsJyk7XG4gICAgICAgIGNvbnN0IHsgZm9ybWF0VXJsIH0gPSByZXF1aXJlKCcuLi9zaGFyZWQvbGliL3JvdXRlci91dGlscy9mb3JtYXQtdXJsJyk7XG4gICAgICAgIGlmIChpbml0aWFsRGF0YS5sb2NhbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRBcyA9IHBhcnNlUmVsYXRpdmVVcmwoYXNQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsZVBhdGhSZXN1bHQgPSBub3JtYWxpemVMb2NhbGVQYXRoKHBhcnNlZEFzLnBhdGhuYW1lLCBpbml0aWFsRGF0YS5sb2NhbGVzKTtcbiAgICAgICAgICAgIGlmIChsb2NhbGVQYXRoUmVzdWx0LmRldGVjdGVkTG9jYWxlKSB7XG4gICAgICAgICAgICAgICAgcGFyc2VkQXMucGF0aG5hbWUgPSBsb2NhbGVQYXRoUmVzdWx0LnBhdGhuYW1lO1xuICAgICAgICAgICAgICAgIGFzUGF0aCA9IGZvcm1hdFVybChwYXJzZWRBcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGRlcml2ZSB0aGUgZGVmYXVsdCBsb2NhbGUgaWYgaXQgd2Fzbid0IGRldGVjdGVkIGluIHRoZSBhc1BhdGhcbiAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBkb24ndCBwcmVyZW5kZXIgc3RhdGljIHBhZ2VzIHdpdGggYWxsIHBvc3NpYmxlIGRlZmF1bHRcbiAgICAgICAgICAgICAgICAvLyBsb2NhbGVzXG4gICAgICAgICAgICAgICAgZGVmYXVsdExvY2FsZSA9IGluaXRpYWxEYXRhLmxvY2FsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGF0dGVtcHQgZGV0ZWN0aW5nIGRlZmF1bHQgbG9jYWxlIGJhc2VkIG9uIGhvc3RuYW1lXG4gICAgICAgICAgICBjb25zdCBkZXRlY3RlZERvbWFpbiA9IGRldGVjdERvbWFpbkxvY2FsZShwcm9jZXNzLmVudi5fX05FWFRfSTE4Tl9ET01BSU5TLCB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgICAgICAgLy8gVE9ETzogaW52ZXN0aWdhdGUgaWYgZGVmYXVsdExvY2FsZSBuZWVkcyB0byBiZSBwb3B1bGF0ZWQgYWZ0ZXJcbiAgICAgICAgICAgIC8vIGh5ZHJhdGlvbiB0byBwcmV2ZW50IG1pc21hdGNoZWQgcmVuZGVyc1xuICAgICAgICAgICAgaWYgKGRldGVjdGVkRG9tYWluKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdExvY2FsZSA9IGRldGVjdGVkRG9tYWluLmRlZmF1bHRMb2NhbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGluaXRpYWxEYXRhLnNjcmlwdExvYWRlcikge1xuICAgICAgICBjb25zdCB7IGluaXRTY3JpcHRMb2FkZXIgfSA9IHJlcXVpcmUoJy4vc2NyaXB0Jyk7XG4gICAgICAgIGluaXRTY3JpcHRMb2FkZXIoaW5pdGlhbERhdGEuc2NyaXB0TG9hZGVyKTtcbiAgICB9XG4gICAgcGFnZUxvYWRlciA9IG5ldyBfcGFnZWxvYWRlci5kZWZhdWx0KGluaXRpYWxEYXRhLmJ1aWxkSWQsIHByZWZpeCk7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAocGFyYW0pPT57XG4gICAgICAgIGxldCBbciwgZl0gPSBwYXJhbTtcbiAgICAgICAgcmV0dXJuIHBhZ2VMb2FkZXIucm91dGVMb2FkZXIub25FbnRyeXBvaW50KHIsIGYpO1xuICAgIH07XG4gICAgaWYgKHdpbmRvdy5fX05FWFRfUCkge1xuICAgICAgICAvLyBEZWZlciBwYWdlIHJlZ2lzdHJhdGlvbiBmb3IgYW5vdGhlciB0aWNrLiBUaGlzIHdpbGwgaW5jcmVhc2UgdGhlIG92ZXJhbGxcbiAgICAgICAgLy8gbGF0ZW5jeSBpbiBoeWRyYXRpbmcgdGhlIHBhZ2UsIGJ1dCByZWR1Y2UgdGhlIHRvdGFsIGJsb2NraW5nIHRpbWUuXG4gICAgICAgIHdpbmRvdy5fX05FWFRfUC5tYXAoKHApPT5zZXRUaW1lb3V0KCgpPT5yZWdpc3RlcihwKSwgMCkpO1xuICAgIH1cbiAgICB3aW5kb3cuX19ORVhUX1AgPSBbXTtcbiAgICB3aW5kb3cuX19ORVhUX1AucHVzaCA9IHJlZ2lzdGVyO1xuICAgIGhlYWRNYW5hZ2VyID0gKDAsIF9oZWFkbWFuYWdlci5kZWZhdWx0KSgpO1xuICAgIGhlYWRNYW5hZ2VyLmdldElzU3NyID0gKCk9PntcbiAgICAgICAgcmV0dXJuIHJvdXRlci5pc1NzcjtcbiAgICB9O1xuICAgIGFwcEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnX19uZXh0Jyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYXNzZXRQcmVmaXg6IHByZWZpeFxuICAgIH07XG59XG5mdW5jdGlvbiByZW5kZXJBcHAoQXBwLCBhcHBQcm9wcykge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovICgwLCBfanN4cnVudGltZS5qc3gpKEFwcCwge1xuICAgICAgICAuLi5hcHBQcm9wc1xuICAgIH0pO1xufVxuZnVuY3Rpb24gQXBwQ29udGFpbmVyKHBhcmFtKSB7XG4gICAgbGV0IHsgY2hpbGRyZW4gfSA9IHBhcmFtO1xuICAgIC8vIENyZWF0ZSBhIG1lbW9pemVkIHZhbHVlIGZvciBuZXh0L25hdmlnYXRpb24gcm91dGVyIGNvbnRleHQuXG4gICAgY29uc3QgYWRhcHRlZEZvckFwcFJvdXRlciA9IF9yZWFjdC5kZWZhdWx0LnVzZU1lbW8oKCk9PntcbiAgICAgICAgcmV0dXJuICgwLCBfYWRhcHRlcnMuYWRhcHRGb3JBcHBSb3V0ZXJJbnN0YW5jZSkocm91dGVyKTtcbiAgICB9LCBbXSk7XG4gICAgdmFyIF9zZWxmX19fTkVYVF9EQVRBX19fYXV0b0V4cG9ydDtcbiAgICByZXR1cm4gLyojX19QVVJFX18qLyAoMCwgX2pzeHJ1bnRpbWUuanN4KShDb250YWluZXIsIHtcbiAgICAgICAgZm46IChlcnJvcik9Pi8vIFRPRE86IEZpeCBkaXNhYmxlZCBlc2xpbnQgcnVsZVxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11c2UtYmVmb3JlLWRlZmluZVxuICAgICAgICAgICAgcmVuZGVyRXJyb3Ioe1xuICAgICAgICAgICAgICAgIEFwcDogQ2FjaGVkQXBwLFxuICAgICAgICAgICAgICAgIGVycjogZXJyb3JcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpPT5jb25zb2xlLmVycm9yKCdFcnJvciByZW5kZXJpbmcgcGFnZTogJywgZXJyKSksXG4gICAgICAgIGNoaWxkcmVuOiAvKiNfX1BVUkVfXyovICgwLCBfanN4cnVudGltZS5qc3gpKF9hcHByb3V0ZXJjb250ZXh0c2hhcmVkcnVudGltZS5BcHBSb3V0ZXJDb250ZXh0LlByb3ZpZGVyLCB7XG4gICAgICAgICAgICB2YWx1ZTogYWRhcHRlZEZvckFwcFJvdXRlcixcbiAgICAgICAgICAgIGNoaWxkcmVuOiAvKiNfX1BVUkVfXyovICgwLCBfanN4cnVudGltZS5qc3gpKF9ob29rc2NsaWVudGNvbnRleHRzaGFyZWRydW50aW1lLlNlYXJjaFBhcmFtc0NvbnRleHQuUHJvdmlkZXIsIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogKDAsIF9hZGFwdGVycy5hZGFwdEZvclNlYXJjaFBhcmFtcykocm91dGVyKSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogLyojX19QVVJFX18qLyAoMCwgX2pzeHJ1bnRpbWUuanN4KShfYWRhcHRlcnMuUGF0aG5hbWVDb250ZXh0UHJvdmlkZXJBZGFwdGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlcjogcm91dGVyLFxuICAgICAgICAgICAgICAgICAgICBpc0F1dG9FeHBvcnQ6IChfc2VsZl9fX05FWFRfREFUQV9fX2F1dG9FeHBvcnQgPSBzZWxmLl9fTkVYVF9EQVRBX18uYXV0b0V4cG9ydCkgIT0gbnVsbCA/IF9zZWxmX19fTkVYVF9EQVRBX19fYXV0b0V4cG9ydCA6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogLyojX19QVVJFX18qLyAoMCwgX2pzeHJ1bnRpbWUuanN4KShfaG9va3NjbGllbnRjb250ZXh0c2hhcmVkcnVudGltZS5QYXRoUGFyYW1zQ29udGV4dC5Qcm92aWRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICgwLCBfYWRhcHRlcnMuYWRhcHRGb3JQYXRoUGFyYW1zKShyb3V0ZXIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IC8qI19fUFVSRV9fKi8gKDAsIF9qc3hydW50aW1lLmpzeCkoX3JvdXRlcmNvbnRleHRzaGFyZWRydW50aW1lLlJvdXRlckNvbnRleHQuUHJvdmlkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKDAsIF9yb3V0ZXIubWFrZVB1YmxpY1JvdXRlckluc3RhbmNlKShyb3V0ZXIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiAvKiNfX1BVUkVfXyovICgwLCBfanN4cnVudGltZS5qc3gpKF9oZWFkbWFuYWdlcmNvbnRleHRzaGFyZWRydW50aW1lLkhlYWRNYW5hZ2VyQ29udGV4dC5Qcm92aWRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaGVhZE1hbmFnZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiAvKiNfX1BVUkVfXyovICgwLCBfanN4cnVudGltZS5qc3gpKF9pbWFnZWNvbmZpZ2NvbnRleHRzaGFyZWRydW50aW1lLkltYWdlQ29uZmlnQ29udGV4dC5Qcm92aWRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHByb2Nlc3MuZW52Ll9fTkVYVF9JTUFHRV9PUFRTLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfSk7XG59XG5jb25zdCB3cmFwQXBwID0gKEFwcCk9Pih3cmFwcGVkQXBwUHJvcHMpPT57XG4gICAgICAgIGNvbnN0IGFwcFByb3BzID0ge1xuICAgICAgICAgICAgLi4ud3JhcHBlZEFwcFByb3BzLFxuICAgICAgICAgICAgQ29tcG9uZW50OiBDYWNoZWRDb21wb25lbnQsXG4gICAgICAgICAgICBlcnI6IGluaXRpYWxEYXRhLmVycixcbiAgICAgICAgICAgIHJvdXRlclxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gLyojX19QVVJFX18qLyAoMCwgX2pzeHJ1bnRpbWUuanN4KShBcHBDb250YWluZXIsIHtcbiAgICAgICAgICAgIGNoaWxkcmVuOiByZW5kZXJBcHAoQXBwLCBhcHBQcm9wcylcbiAgICAgICAgfSk7XG4gICAgfTtcbi8vIFRoaXMgbWV0aG9kIGhhbmRsZXMgYWxsIHJ1bnRpbWUgYW5kIGRlYnVnIGVycm9ycy5cbi8vIDQwNCBhbmQgNTAwIGVycm9ycyBhcmUgc3BlY2lhbCBraW5kIG9mIGVycm9yc1xuLy8gYW5kIHRoZXkgYXJlIHN0aWxsIGhhbmRsZSB2aWEgdGhlIG1haW4gcmVuZGVyIG1ldGhvZC5cbmZ1bmN0aW9uIHJlbmRlckVycm9yKHJlbmRlckVycm9yUHJvcHMpIHtcbiAgICBsZXQgeyBBcHAsIGVyciB9ID0gcmVuZGVyRXJyb3JQcm9wcztcbiAgICAvLyBJbiBkZXZlbG9wbWVudCBydW50aW1lIGVycm9ycyBhcmUgY2F1Z2h0IGJ5IG91ciBvdmVybGF5XG4gICAgLy8gSW4gcHJvZHVjdGlvbiB3ZSBjYXRjaCBydW50aW1lIGVycm9ycyB1c2luZyBjb21wb25lbnREaWRDYXRjaCB3aGljaCB3aWxsIHRyaWdnZXIgcmVuZGVyRXJyb3JcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAvLyBBIE5leHQuanMgcmVuZGVyaW5nIHJ1bnRpbWUgZXJyb3IgaXMgYWx3YXlzIHVucmVjb3ZlcmFibGVcbiAgICAgICAgLy8gRklYTUU6IGxldCdzIG1ha2UgdGhpcyByZWNvdmVyYWJsZSAoZXJyb3IgaW4gR0lQIGNsaWVudC10cmFuc2l0aW9uKVxuICAgICAgICBkZXZDbGllbnQub25VbnJlY292ZXJhYmxlRXJyb3IoKTtcbiAgICAgICAgLy8gV2UgbmVlZCB0byByZW5kZXIgYW4gZW1wdHkgPEFwcD4gc28gdGhhdCB0aGUgYDxSZWFjdERldk92ZXJsYXk+YCBjYW5cbiAgICAgICAgLy8gcmVuZGVyIGl0c2VsZi5cbiAgICAgICAgLy8gVE9ETzogRml4IGRpc2FibGVkIGVzbGludCBydWxlXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgICAgcmV0dXJuIGRvUmVuZGVyKHtcbiAgICAgICAgICAgIEFwcDogKCk9Pm51bGwsXG4gICAgICAgICAgICBwcm9wczoge30sXG4gICAgICAgICAgICBDb21wb25lbnQ6ICgpPT5udWxsLFxuICAgICAgICAgICAgc3R5bGVTaGVldHM6IFtdXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBNYWtlIHN1cmUgd2UgbG9nIHRoZSBlcnJvciB0byB0aGUgY29uc29sZSwgb3RoZXJ3aXNlIHVzZXJzIGNhbid0IHRyYWNrIGRvd24gaXNzdWVzLlxuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICBjb25zb2xlLmVycm9yKFwiQSBjbGllbnQtc2lkZSBleGNlcHRpb24gaGFzIG9jY3VycmVkLCBzZWUgaGVyZSBmb3IgbW9yZSBpbmZvOiBodHRwczovL25leHRqcy5vcmcvZG9jcy9tZXNzYWdlcy9jbGllbnQtc2lkZS1leGNlcHRpb24tb2NjdXJyZWRcIik7XG4gICAgcmV0dXJuIHBhZ2VMb2FkZXIubG9hZFBhZ2UoJy9fZXJyb3InKS50aGVuKChwYXJhbSk9PntcbiAgICAgICAgbGV0IHsgcGFnZTogRXJyb3JDb21wb25lbnQsIHN0eWxlU2hlZXRzIH0gPSBwYXJhbTtcbiAgICAgICAgcmV0dXJuIChsYXN0QXBwUHJvcHMgPT0gbnVsbCA/IHZvaWQgMCA6IGxhc3RBcHBQcm9wcy5Db21wb25lbnQpID09PSBFcnJvckNvbXBvbmVudCA/IGltcG9ydCgnLi4vcGFnZXMvX2Vycm9yJykudGhlbigoZXJyb3JNb2R1bGUpPT57XG4gICAgICAgICAgICByZXR1cm4gaW1wb3J0KCcuLi9wYWdlcy9fYXBwJykudGhlbigoYXBwTW9kdWxlKT0+e1xuICAgICAgICAgICAgICAgIEFwcCA9IGFwcE1vZHVsZS5kZWZhdWx0O1xuICAgICAgICAgICAgICAgIHJlbmRlckVycm9yUHJvcHMuQXBwID0gQXBwO1xuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvck1vZHVsZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS50aGVuKChtKT0+KHtcbiAgICAgICAgICAgICAgICBFcnJvckNvbXBvbmVudDogbS5kZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN0eWxlU2hlZXRzOiBbXVxuICAgICAgICAgICAgfSkpIDoge1xuICAgICAgICAgICAgRXJyb3JDb21wb25lbnQsXG4gICAgICAgICAgICBzdHlsZVNoZWV0c1xuICAgICAgICB9O1xuICAgIH0pLnRoZW4oKHBhcmFtKT0+e1xuICAgICAgICBsZXQgeyBFcnJvckNvbXBvbmVudCwgc3R5bGVTaGVldHMgfSA9IHBhcmFtO1xuICAgICAgICB2YXIgX3JlbmRlckVycm9yUHJvcHNfcHJvcHM7XG4gICAgICAgIC8vIEluIHByb2R1Y3Rpb24gd2UgZG8gYSBub3JtYWwgcmVuZGVyIHdpdGggdGhlIGBFcnJvckNvbXBvbmVudGAgYXMgY29tcG9uZW50LlxuICAgICAgICAvLyBJZiB3ZSd2ZSBnb3R0ZW4gaGVyZSB1cG9uIGluaXRpYWwgcmVuZGVyLCB3ZSBjYW4gdXNlIHRoZSBwcm9wcyBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgd2UgbmVlZCB0byBjYWxsIGBnZXRJbml0aWFsUHJvcHNgIG9uIGBBcHBgIGJlZm9yZSBtb3VudGluZy5cbiAgICAgICAgY29uc3QgQXBwVHJlZSA9IHdyYXBBcHAoQXBwKTtcbiAgICAgICAgY29uc3QgYXBwQ3R4ID0ge1xuICAgICAgICAgICAgQ29tcG9uZW50OiBFcnJvckNvbXBvbmVudCxcbiAgICAgICAgICAgIEFwcFRyZWUsXG4gICAgICAgICAgICByb3V0ZXIsXG4gICAgICAgICAgICBjdHg6IHtcbiAgICAgICAgICAgICAgICBlcnIsXG4gICAgICAgICAgICAgICAgcGF0aG5hbWU6IGluaXRpYWxEYXRhLnBhZ2UsXG4gICAgICAgICAgICAgICAgcXVlcnk6IGluaXRpYWxEYXRhLnF1ZXJ5LFxuICAgICAgICAgICAgICAgIGFzUGF0aCxcbiAgICAgICAgICAgICAgICBBcHBUcmVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKChfcmVuZGVyRXJyb3JQcm9wc19wcm9wcyA9IHJlbmRlckVycm9yUHJvcHMucHJvcHMpID09IG51bGwgPyB2b2lkIDAgOiBfcmVuZGVyRXJyb3JQcm9wc19wcm9wcy5lcnIpID8gcmVuZGVyRXJyb3JQcm9wcy5wcm9wcyA6ICgwLCBfdXRpbHMubG9hZEdldEluaXRpYWxQcm9wcykoQXBwLCBhcHBDdHgpKS50aGVuKChpbml0UHJvcHMpPT4vLyBUT0RPOiBGaXggZGlzYWJsZWQgZXNsaW50IHJ1bGVcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdXNlLWJlZm9yZS1kZWZpbmVcbiAgICAgICAgICAgIGRvUmVuZGVyKHtcbiAgICAgICAgICAgICAgICAuLi5yZW5kZXJFcnJvclByb3BzLFxuICAgICAgICAgICAgICAgIGVycixcbiAgICAgICAgICAgICAgICBDb21wb25lbnQ6IEVycm9yQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgIHN0eWxlU2hlZXRzLFxuICAgICAgICAgICAgICAgIHByb3BzOiBpbml0UHJvcHNcbiAgICAgICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIER1bW15IGNvbXBvbmVudCB0aGF0IHdlIHJlbmRlciBhcyBhIGNoaWxkIG9mIFJvb3Qgc28gdGhhdCB3ZSBjYW5cbi8vIHRvZ2dsZSB0aGUgY29ycmVjdCBzdHlsZXMgYmVmb3JlIHRoZSBwYWdlIGlzIHJlbmRlcmVkLlxuZnVuY3Rpb24gSGVhZChwYXJhbSkge1xuICAgIGxldCB7IGNhbGxiYWNrIH0gPSBwYXJhbTtcbiAgICAvLyBXZSB1c2UgYHVzZUxheW91dEVmZmVjdGAgdG8gZ3VhcmFudGVlIHRoZSBjYWxsYmFjayBpcyBleGVjdXRlZFxuICAgIC8vIGFzIHNvb24gYXMgUmVhY3QgZmx1c2hlcyB0aGUgdXBkYXRlLlxuICAgIF9yZWFjdC5kZWZhdWx0LnVzZUxheW91dEVmZmVjdCgoKT0+Y2FsbGJhY2soKSwgW1xuICAgICAgICBjYWxsYmFja1xuICAgIF0pO1xuICAgIHJldHVybiBudWxsO1xufVxuY29uc3QgcGVyZm9ybWFuY2VNYXJrcyA9IHtcbiAgICBuYXZpZ2F0aW9uU3RhcnQ6ICduYXZpZ2F0aW9uU3RhcnQnLFxuICAgIGJlZm9yZVJlbmRlcjogJ2JlZm9yZVJlbmRlcicsXG4gICAgYWZ0ZXJSZW5kZXI6ICdhZnRlclJlbmRlcicsXG4gICAgYWZ0ZXJIeWRyYXRlOiAnYWZ0ZXJIeWRyYXRlJyxcbiAgICByb3V0ZUNoYW5nZTogJ3JvdXRlQ2hhbmdlJ1xufTtcbmNvbnN0IHBlcmZvcm1hbmNlTWVhc3VyZXMgPSB7XG4gICAgaHlkcmF0aW9uOiAnTmV4dC5qcy1oeWRyYXRpb24nLFxuICAgIGJlZm9yZUh5ZHJhdGlvbjogJ05leHQuanMtYmVmb3JlLWh5ZHJhdGlvbicsXG4gICAgcm91dGVDaGFuZ2VUb1JlbmRlcjogJ05leHQuanMtcm91dGUtY2hhbmdlLXRvLXJlbmRlcicsXG4gICAgcmVuZGVyOiAnTmV4dC5qcy1yZW5kZXInXG59O1xubGV0IHJlYWN0Um9vdCA9IG51bGw7XG4vLyBPbiBpbml0aWFsIHJlbmRlciBhIGh5ZHJhdGUgc2hvdWxkIGFsd2F5cyBoYXBwZW5cbmxldCBzaG91bGRIeWRyYXRlID0gdHJ1ZTtcbmZ1bmN0aW9uIGNsZWFyTWFya3MoKSB7XG4gICAgO1xuICAgIFtcbiAgICAgICAgcGVyZm9ybWFuY2VNYXJrcy5iZWZvcmVSZW5kZXIsXG4gICAgICAgIHBlcmZvcm1hbmNlTWFya3MuYWZ0ZXJIeWRyYXRlLFxuICAgICAgICBwZXJmb3JtYW5jZU1hcmtzLmFmdGVyUmVuZGVyLFxuICAgICAgICBwZXJmb3JtYW5jZU1hcmtzLnJvdXRlQ2hhbmdlXG4gICAgXS5mb3JFYWNoKChtYXJrKT0+cGVyZm9ybWFuY2UuY2xlYXJNYXJrcyhtYXJrKSk7XG59XG5mdW5jdGlvbiBtYXJrSHlkcmF0ZUNvbXBsZXRlKCkge1xuICAgIGlmICghX3V0aWxzLlNUKSByZXR1cm47XG4gICAgcGVyZm9ybWFuY2UubWFyayhwZXJmb3JtYW5jZU1hcmtzLmFmdGVySHlkcmF0ZSkgLy8gbWFyayBlbmQgb2YgaHlkcmF0aW9uXG4gICAgO1xuICAgIGNvbnN0IGhhc0JlZm9yZVJlbmRlck1hcmsgPSBwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKHBlcmZvcm1hbmNlTWFya3MuYmVmb3JlUmVuZGVyLCAnbWFyaycpLmxlbmd0aDtcbiAgICBpZiAoaGFzQmVmb3JlUmVuZGVyTWFyaykge1xuICAgICAgICBjb25zdCBiZWZvcmVIeWRyYXRpb25NZWFzdXJlID0gcGVyZm9ybWFuY2UubWVhc3VyZShwZXJmb3JtYW5jZU1lYXN1cmVzLmJlZm9yZUh5ZHJhdGlvbiwgcGVyZm9ybWFuY2VNYXJrcy5uYXZpZ2F0aW9uU3RhcnQsIHBlcmZvcm1hbmNlTWFya3MuYmVmb3JlUmVuZGVyKTtcbiAgICAgICAgY29uc3QgaHlkcmF0aW9uTWVhc3VyZSA9IHBlcmZvcm1hbmNlLm1lYXN1cmUocGVyZm9ybWFuY2VNZWFzdXJlcy5oeWRyYXRpb24sIHBlcmZvcm1hbmNlTWFya3MuYmVmb3JlUmVuZGVyLCBwZXJmb3JtYW5jZU1hcmtzLmFmdGVySHlkcmF0ZSk7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyAmJiAvLyBPbGQgdmVyc2lvbnMgb2YgU2FmYXJpIGRvbid0IHJldHVybiBgUGVyZm9ybWFuY2VNZWFzdXJlYHMgZnJvbSBgcGVyZm9ybWFuY2UubWVhc3VyZSgpYFxuICAgICAgICBiZWZvcmVIeWRyYXRpb25NZWFzdXJlICYmIGh5ZHJhdGlvbk1lYXN1cmUpIHtcbiAgICAgICAgICAgIF90cmFjZXIuZGVmYXVsdC5zdGFydFNwYW4oJ25hdmlnYXRpb24tdG8taHlkcmF0aW9uJywge1xuICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogcGVyZm9ybWFuY2UudGltZU9yaWdpbiArIGJlZm9yZUh5ZHJhdGlvbk1lYXN1cmUuc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aG5hbWU6IGxvY2F0aW9uLnBhdGhuYW1lLFxuICAgICAgICAgICAgICAgICAgICBxdWVyeTogbG9jYXRpb24uc2VhcmNoXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuZW5kKHBlcmZvcm1hbmNlLnRpbWVPcmlnaW4gKyBoeWRyYXRpb25NZWFzdXJlLnN0YXJ0VGltZSArIGh5ZHJhdGlvbk1lYXN1cmUuZHVyYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChvblBlcmZFbnRyeSkge1xuICAgICAgICBwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKHBlcmZvcm1hbmNlTWVhc3VyZXMuaHlkcmF0aW9uKS5mb3JFYWNoKG9uUGVyZkVudHJ5KTtcbiAgICB9XG4gICAgY2xlYXJNYXJrcygpO1xufVxuZnVuY3Rpb24gbWFya1JlbmRlckNvbXBsZXRlKCkge1xuICAgIGlmICghX3V0aWxzLlNUKSByZXR1cm47XG4gICAgcGVyZm9ybWFuY2UubWFyayhwZXJmb3JtYW5jZU1hcmtzLmFmdGVyUmVuZGVyKSAvLyBtYXJrIGVuZCBvZiByZW5kZXJcbiAgICA7XG4gICAgY29uc3QgbmF2U3RhcnRFbnRyaWVzID0gcGVyZm9ybWFuY2UuZ2V0RW50cmllc0J5TmFtZShwZXJmb3JtYW5jZU1hcmtzLnJvdXRlQ2hhbmdlLCAnbWFyaycpO1xuICAgIGlmICghbmF2U3RhcnRFbnRyaWVzLmxlbmd0aCkgcmV0dXJuO1xuICAgIGNvbnN0IGhhc0JlZm9yZVJlbmRlck1hcmsgPSBwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKHBlcmZvcm1hbmNlTWFya3MuYmVmb3JlUmVuZGVyLCAnbWFyaycpLmxlbmd0aDtcbiAgICBpZiAoaGFzQmVmb3JlUmVuZGVyTWFyaykge1xuICAgICAgICBwZXJmb3JtYW5jZS5tZWFzdXJlKHBlcmZvcm1hbmNlTWVhc3VyZXMucm91dGVDaGFuZ2VUb1JlbmRlciwgbmF2U3RhcnRFbnRyaWVzWzBdLm5hbWUsIHBlcmZvcm1hbmNlTWFya3MuYmVmb3JlUmVuZGVyKTtcbiAgICAgICAgcGVyZm9ybWFuY2UubWVhc3VyZShwZXJmb3JtYW5jZU1lYXN1cmVzLnJlbmRlciwgcGVyZm9ybWFuY2VNYXJrcy5iZWZvcmVSZW5kZXIsIHBlcmZvcm1hbmNlTWFya3MuYWZ0ZXJSZW5kZXIpO1xuICAgICAgICBpZiAob25QZXJmRW50cnkpIHtcbiAgICAgICAgICAgIHBlcmZvcm1hbmNlLmdldEVudHJpZXNCeU5hbWUocGVyZm9ybWFuY2VNZWFzdXJlcy5yZW5kZXIpLmZvckVhY2gob25QZXJmRW50cnkpO1xuICAgICAgICAgICAgcGVyZm9ybWFuY2UuZ2V0RW50cmllc0J5TmFtZShwZXJmb3JtYW5jZU1lYXN1cmVzLnJvdXRlQ2hhbmdlVG9SZW5kZXIpLmZvckVhY2gob25QZXJmRW50cnkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyTWFya3MoKTtcbiAgICBbXG4gICAgICAgIHBlcmZvcm1hbmNlTWVhc3VyZXMucm91dGVDaGFuZ2VUb1JlbmRlcixcbiAgICAgICAgcGVyZm9ybWFuY2VNZWFzdXJlcy5yZW5kZXJcbiAgICBdLmZvckVhY2goKG1lYXN1cmUpPT5wZXJmb3JtYW5jZS5jbGVhck1lYXN1cmVzKG1lYXN1cmUpKTtcbn1cbmZ1bmN0aW9uIHJlbmRlclJlYWN0RWxlbWVudChkb21FbCwgZm4pIHtcbiAgICAvLyBtYXJrIHN0YXJ0IG9mIGh5ZHJhdGUvcmVuZGVyXG4gICAgaWYgKF91dGlscy5TVCkge1xuICAgICAgICBwZXJmb3JtYW5jZS5tYXJrKHBlcmZvcm1hbmNlTWFya3MuYmVmb3JlUmVuZGVyKTtcbiAgICB9XG4gICAgY29uc3QgcmVhY3RFbCA9IGZuKHNob3VsZEh5ZHJhdGUgPyBtYXJrSHlkcmF0ZUNvbXBsZXRlIDogbWFya1JlbmRlckNvbXBsZXRlKTtcbiAgICBpZiAoIXJlYWN0Um9vdCkge1xuICAgICAgICAvLyBVbmxpa2Ugd2l0aCBjcmVhdGVSb290LCB5b3UgZG9uJ3QgbmVlZCBhIHNlcGFyYXRlIHJvb3QucmVuZGVyKCkgY2FsbCBoZXJlXG4gICAgICAgIHJlYWN0Um9vdCA9IF9jbGllbnQuZGVmYXVsdC5oeWRyYXRlUm9vdChkb21FbCwgcmVhY3RFbCwge1xuICAgICAgICAgICAgb25SZWNvdmVyYWJsZUVycm9yOiBfb25yZWNvdmVyYWJsZWVycm9yLm9uUmVjb3ZlcmFibGVFcnJvclxuICAgICAgICB9KTtcbiAgICAgICAgLy8gVE9ETzogUmVtb3ZlIHNob3VsZEh5ZHJhdGUgdmFyaWFibGUgd2hlbiBSZWFjdCAxOCBpcyBzdGFibGUgYXMgaXQgY2FuIGRlcGVuZCBvbiBgcmVhY3RSb290YCBleGlzdGluZ1xuICAgICAgICBzaG91bGRIeWRyYXRlID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3RhcnRUcmFuc2l0aW9uID0gX3JlYWN0LmRlZmF1bHQuc3RhcnRUcmFuc2l0aW9uO1xuICAgICAgICBzdGFydFRyYW5zaXRpb24oKCk9PntcbiAgICAgICAgICAgIHJlYWN0Um9vdC5yZW5kZXIocmVhY3RFbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIFJvb3QocGFyYW0pIHtcbiAgICBsZXQgeyBjYWxsYmFja3MsIGNoaWxkcmVuIH0gPSBwYXJhbTtcbiAgICAvLyBXZSB1c2UgYHVzZUxheW91dEVmZmVjdGAgdG8gZ3VhcmFudGVlIHRoZSBjYWxsYmFja3MgYXJlIGV4ZWN1dGVkXG4gICAgLy8gYXMgc29vbiBhcyBSZWFjdCBmbHVzaGVzIHRoZSB1cGRhdGVcbiAgICBfcmVhY3QuZGVmYXVsdC51c2VMYXlvdXRFZmZlY3QoKCk9PmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjayk9PmNhbGxiYWNrKCkpLCBbXG4gICAgICAgIGNhbGxiYWNrc1xuICAgIF0pO1xuICAgIGlmIChwcm9jZXNzLmVudi5fX05FWFRfVEVTVF9NT0RFKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9ydWxlcy1vZi1ob29rc1xuICAgICAgICBfcmVhY3QuZGVmYXVsdC51c2VFZmZlY3QoKCk9PntcbiAgICAgICAgICAgIHdpbmRvdy5fX05FWFRfSFlEUkFURUQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5fX05FWFRfSFlEUkFURURfQ0IpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuX19ORVhUX0hZRFJBVEVEX0NCKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xufVxuZnVuY3Rpb24gZG9SZW5kZXIoaW5wdXQpIHtcbiAgICBsZXQgeyBBcHAsIENvbXBvbmVudCwgcHJvcHMsIGVyciB9ID0gaW5wdXQ7XG4gICAgbGV0IHN0eWxlU2hlZXRzID0gJ2luaXRpYWwnIGluIGlucHV0ID8gdW5kZWZpbmVkIDogaW5wdXQuc3R5bGVTaGVldHM7XG4gICAgQ29tcG9uZW50ID0gQ29tcG9uZW50IHx8IGxhc3RBcHBQcm9wcy5Db21wb25lbnQ7XG4gICAgcHJvcHMgPSBwcm9wcyB8fCBsYXN0QXBwUHJvcHMucHJvcHM7XG4gICAgY29uc3QgYXBwUHJvcHMgPSB7XG4gICAgICAgIC4uLnByb3BzLFxuICAgICAgICBDb21wb25lbnQsXG4gICAgICAgIGVycixcbiAgICAgICAgcm91dGVyXG4gICAgfTtcbiAgICAvLyBsYXN0QXBwUHJvcHMgaGFzIHRvIGJlIHNldCBiZWZvcmUgUmVhY3REb20ucmVuZGVyIHRvIGFjY291bnQgZm9yIFJlYWN0RG9tIHRocm93aW5nIGFuIGVycm9yLlxuICAgIGxhc3RBcHBQcm9wcyA9IGFwcFByb3BzO1xuICAgIGxldCBjYW5jZWxlZCA9IGZhbHNlO1xuICAgIGxldCByZXNvbHZlUHJvbWlzZTtcbiAgICBjb25zdCByZW5kZXJQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcbiAgICAgICAgaWYgKGxhc3RSZW5kZXJSZWplY3QpIHtcbiAgICAgICAgICAgIGxhc3RSZW5kZXJSZWplY3QoKTtcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlUHJvbWlzZSA9ICgpPT57XG4gICAgICAgICAgICBsYXN0UmVuZGVyUmVqZWN0ID0gbnVsbDtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgbGFzdFJlbmRlclJlamVjdCA9ICgpPT57XG4gICAgICAgICAgICBjYW5jZWxlZCA9IHRydWU7XG4gICAgICAgICAgICBsYXN0UmVuZGVyUmVqZWN0ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KG5ldyBFcnJvcignQ2FuY2VsIHJlbmRlcmluZyByb3V0ZScpLCBcIl9fTkVYVF9FUlJPUl9DT0RFXCIsIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJFNTAzXCIsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVycm9yLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuICAgIH0pO1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gaGFzIGEgcmV0dXJuIHR5cGUgdG8gZW5zdXJlIGl0IGRvZXNuJ3Qgc3RhcnQgcmV0dXJuaW5nIGFcbiAgICAvLyBQcm9taXNlLiBJdCBzaG91bGQgcmVtYWluIHN5bmNocm9ub3VzLlxuICAgIGZ1bmN0aW9uIG9uU3RhcnQoKSB7XG4gICAgICAgIGlmICghc3R5bGVTaGVldHMgfHwgLy8gV2UgdXNlIGBzdHlsZS1sb2FkZXJgIGluIGRldmVsb3BtZW50LCBzbyB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nXG4gICAgICAgIC8vIHVubGVzcyB3ZSdyZSBpbiBwcm9kdWN0aW9uOlxuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3VycmVudFN0eWxlVGFncyA9IGxvb3NlVG9BcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzdHlsZVtkYXRhLW4taHJlZl0nKSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRIcmVmcyA9IG5ldyBTZXQoY3VycmVudFN0eWxlVGFncy5tYXAoKHRhZyk9PnRhZy5nZXRBdHRyaWJ1dGUoJ2RhdGEtbi1ocmVmJykpKTtcbiAgICAgICAgY29uc3Qgbm9zY3JpcHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdub3NjcmlwdFtkYXRhLW4tY3NzXScpO1xuICAgICAgICBjb25zdCBub25jZSA9IG5vc2NyaXB0ID09IG51bGwgPyB2b2lkIDAgOiBub3NjcmlwdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbi1jc3MnKTtcbiAgICAgICAgc3R5bGVTaGVldHMuZm9yRWFjaCgocGFyYW0pPT57XG4gICAgICAgICAgICBsZXQgeyBocmVmLCB0ZXh0IH0gPSBwYXJhbTtcbiAgICAgICAgICAgIGlmICghY3VycmVudEhyZWZzLmhhcyhocmVmKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0eWxlVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgICAgICBzdHlsZVRhZy5zZXRBdHRyaWJ1dGUoJ2RhdGEtbi1ocmVmJywgaHJlZik7XG4gICAgICAgICAgICAgICAgc3R5bGVUYWcuc2V0QXR0cmlidXRlKCdtZWRpYScsICd4Jyk7XG4gICAgICAgICAgICAgICAgaWYgKG5vbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlVGFnLnNldEF0dHJpYnV0ZSgnbm9uY2UnLCBub25jZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuICAgICAgICAgICAgICAgIHN0eWxlVGFnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBvbkhlYWRDb21taXQoKSB7XG4gICAgICAgIGlmICgvLyBUdXJib3BhY2sgaGFzIGl0J3Mgb3duIGNzcyBpbmplY3Rpb24gaGFuZGxpbmcsIHRoaXMgY29kZSBlbmRzIHVwIHJlbW92aW5nIHRoZSBDU1MuXG4gICAgICAgICFwcm9jZXNzLmVudi5UVVJCT1BBQ0sgJiYgLy8gV2UgdXNlIGBzdHlsZS1sb2FkZXJgIGluIGRldmVsb3BtZW50LCBzbyB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nXG4gICAgICAgIC8vIHVubGVzcyB3ZSdyZSBpbiBwcm9kdWN0aW9uOlxuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nICYmIC8vIFdlIGNhbiBza2lwIHRoaXMgZHVyaW5nIGh5ZHJhdGlvbi4gUnVubmluZyBpdCB3b250IGNhdXNlIGFueSBoYXJtLCBidXRcbiAgICAgICAgLy8gd2UgbWF5IGFzIHdlbGwgc2F2ZSB0aGUgQ1BVIGN5Y2xlczpcbiAgICAgICAgc3R5bGVTaGVldHMgJiYgLy8gRW5zdXJlIHRoaXMgcmVuZGVyIHdhcyBub3QgY2FuY2VsZWRcbiAgICAgICAgIWNhbmNlbGVkKSB7XG4gICAgICAgICAgICBjb25zdCBkZXNpcmVkSHJlZnMgPSBuZXcgU2V0KHN0eWxlU2hlZXRzLm1hcCgocyk9PnMuaHJlZikpO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0eWxlVGFncyA9IGxvb3NlVG9BcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzdHlsZVtkYXRhLW4taHJlZl0nKSk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SHJlZnMgPSBjdXJyZW50U3R5bGVUYWdzLm1hcCgodGFnKT0+dGFnLmdldEF0dHJpYnV0ZSgnZGF0YS1uLWhyZWYnKSk7XG4gICAgICAgICAgICAvLyBUb2dnbGUgYDxzdHlsZT5gIHRhZ3Mgb24gb3Igb2ZmIGRlcGVuZGluZyBvbiBpZiB0aGV5J3JlIG5lZWRlZDpcbiAgICAgICAgICAgIGZvcihsZXQgaWR4ID0gMDsgaWR4IDwgY3VycmVudEhyZWZzLmxlbmd0aDsgKytpZHgpe1xuICAgICAgICAgICAgICAgIGlmIChkZXNpcmVkSHJlZnMuaGFzKGN1cnJlbnRIcmVmc1tpZHhdKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3R5bGVUYWdzW2lkeF0ucmVtb3ZlQXR0cmlidXRlKCdtZWRpYScpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdHlsZVRhZ3NbaWR4XS5zZXRBdHRyaWJ1dGUoJ21lZGlhJywgJ3gnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZW9yZGVyIHN0eWxlcyBpbnRvIGludGVuZGVkIG9yZGVyOlxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZU5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdub3NjcmlwdFtkYXRhLW4tY3NzXScpO1xuICAgICAgICAgICAgaWYgKC8vIFRoaXMgc2hvdWxkIGJlIGFuIGludmFyaWFudDpcbiAgICAgICAgICAgIHJlZmVyZW5jZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBzdHlsZVNoZWV0cy5mb3JFYWNoKChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICAgICAgbGV0IHsgaHJlZiB9ID0gcGFyYW07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFRhZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N0eWxlW2RhdGEtbi1ocmVmPVwiJyArIGhyZWYgKyAnXCJdJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICgvLyBUaGlzIHNob3VsZCBiZSBhbiBpbnZhcmlhbnQ6XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFRhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YXJnZXRUYWcsIHJlZmVyZW5jZU5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlTm9kZSA9IHRhcmdldFRhZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRmluYWxseSwgY2xlYW4gdXAgc2VydmVyIHJlbmRlcmVkIHN0eWxlc2hlZXRzOlxuICAgICAgICAgICAgbG9vc2VUb0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbZGF0YS1uLXBdJykpLmZvckVhY2goKGVsKT0+e1xuICAgICAgICAgICAgICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0LnNjcm9sbCkge1xuICAgICAgICAgICAgY29uc3QgeyB4LCB5IH0gPSBpbnB1dC5zY3JvbGw7XG4gICAgICAgICAgICAoMCwgX2hhbmRsZXNtb290aHNjcm9sbC5oYW5kbGVTbW9vdGhTY3JvbGwpKCgpPT57XG4gICAgICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKHgsIHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gb25Sb290Q29tbWl0KCkge1xuICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgIH1cbiAgICBvblN0YXJ0KCk7XG4gICAgY29uc3QgZWxlbSA9IC8qI19fUFVSRV9fKi8gKDAsIF9qc3hydW50aW1lLmpzeHMpKF9qc3hydW50aW1lLkZyYWdtZW50LCB7XG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAvKiNfX1BVUkVfXyovICgwLCBfanN4cnVudGltZS5qc3gpKEhlYWQsIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogb25IZWFkQ29tbWl0XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIC8qI19fUFVSRV9fKi8gKDAsIF9qc3hydW50aW1lLmpzeHMpKEFwcENvbnRhaW5lciwge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckFwcChBcHAsIGFwcFByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgLyojX19QVVJFX18qLyAoMCwgX2pzeHJ1bnRpbWUuanN4KShfcG9ydGFsLlBvcnRhbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJuZXh0LXJvdXRlLWFubm91bmNlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IC8qI19fUFVSRV9fKi8gKDAsIF9qc3hydW50aW1lLmpzeCkoX3JvdXRlYW5ub3VuY2VyLlJvdXRlQW5ub3VuY2VyLCB7fSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KVxuICAgICAgICBdXG4gICAgfSk7XG4gICAgLy8gV2UgY2F0Y2ggcnVudGltZSBlcnJvcnMgdXNpbmcgY29tcG9uZW50RGlkQ2F0Y2ggd2hpY2ggd2lsbCB0cmlnZ2VyIHJlbmRlckVycm9yXG4gICAgcmVuZGVyUmVhY3RFbGVtZW50KGFwcEVsZW1lbnQsIChjYWxsYmFjayk9Pi8qI19fUFVSRV9fKi8gKDAsIF9qc3hydW50aW1lLmpzeCkoUm9vdCwge1xuICAgICAgICAgICAgY2FsbGJhY2tzOiBbXG4gICAgICAgICAgICAgICAgY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgb25Sb290Q29tbWl0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgY2hpbGRyZW46IHByb2Nlc3MuZW52Ll9fTkVYVF9TVFJJQ1RfTU9ERSA/IC8qI19fUFVSRV9fKi8gKDAsIF9qc3hydW50aW1lLmpzeCkoX3JlYWN0LmRlZmF1bHQuU3RyaWN0TW9kZSwge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBlbGVtXG4gICAgICAgICAgICB9KSA6IGVsZW1cbiAgICAgICAgfSkpO1xuICAgIHJldHVybiByZW5kZXJQcm9taXNlO1xufVxuYXN5bmMgZnVuY3Rpb24gcmVuZGVyKHJlbmRlcmluZ1Byb3BzKSB7XG4gICAgLy8gaWYgYW4gZXJyb3Igb2NjdXJzIGluIGEgc2VydmVyLXNpZGUgcGFnZSAoZS5nLiBpbiBnZXRJbml0aWFsUHJvcHMpLFxuICAgIC8vIHNraXAgcmUtcmVuZGVyaW5nIHRoZSBlcnJvciBwYWdlIGNsaWVudC1zaWRlIGFzIGRhdGEtZmV0Y2hpbmcgb3BlcmF0aW9uc1xuICAgIC8vIHdpbGwgYWxyZWFkeSBoYXZlIGJlZW4gZG9uZSBvbiB0aGUgc2VydmVyIGFuZCBORVhUX0RBVEEgY29udGFpbnMgdGhlIGNvcnJlY3RcbiAgICAvLyBkYXRhIGZvciBzdHJhaWdodC1mb3J3YXJkIGh5ZHJhdGlvbiBvZiB0aGUgZXJyb3IgcGFnZVxuICAgIGlmIChyZW5kZXJpbmdQcm9wcy5lcnIgJiYgLy8gcmVuZGVyaW5nUHJvcHMuQ29tcG9uZW50IG1pZ2h0IGJlIHVuZGVmaW5lZCBpZiB0aGVyZSBpcyBhIHRvcC9tb2R1bGUtbGV2ZWwgZXJyb3JcbiAgICAodHlwZW9mIHJlbmRlcmluZ1Byb3BzLkNvbXBvbmVudCA9PT0gJ3VuZGVmaW5lZCcgfHwgIXJlbmRlcmluZ1Byb3BzLmlzSHlkcmF0ZVBhc3MpKSB7XG4gICAgICAgIGF3YWl0IHJlbmRlckVycm9yKHJlbmRlcmluZ1Byb3BzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkb1JlbmRlcihyZW5kZXJpbmdQcm9wcyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IHJlbmRlckVyciA9ICgwLCBfaXNlcnJvci5nZXRQcm9wZXJFcnJvcikoZXJyKTtcbiAgICAgICAgLy8gYnViYmxlIHVwIGNhbmNlbGF0aW9uIGVycm9yc1xuICAgICAgICBpZiAocmVuZGVyRXJyLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgdGhyb3cgcmVuZGVyRXJyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgICAgLy8gRW5zdXJlIHRoaXMgZXJyb3IgaXMgZGlzcGxheWVkIGluIHRoZSBvdmVybGF5IGluIGRldmVsb3BtZW50XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgdGhyb3cgcmVuZGVyRXJyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgcmVuZGVyRXJyb3Ioe1xuICAgICAgICAgICAgLi4ucmVuZGVyaW5nUHJvcHMsXG4gICAgICAgICAgICBlcnI6IHJlbmRlckVyclxuICAgICAgICB9KTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoeWRyYXRlKG9wdHMpIHtcbiAgICBsZXQgaW5pdGlhbEVyciA9IGluaXRpYWxEYXRhLmVycjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcHBFbnRyeXBvaW50ID0gYXdhaXQgcGFnZUxvYWRlci5yb3V0ZUxvYWRlci53aGVuRW50cnlwb2ludCgnL19hcHAnKTtcbiAgICAgICAgaWYgKCdlcnJvcicgaW4gYXBwRW50cnlwb2ludCkge1xuICAgICAgICAgICAgdGhyb3cgYXBwRW50cnlwb2ludC5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGNvbXBvbmVudDogYXBwLCBleHBvcnRzOiBtb2QgfSA9IGFwcEVudHJ5cG9pbnQ7XG4gICAgICAgIENhY2hlZEFwcCA9IGFwcDtcbiAgICAgICAgaWYgKG1vZCAmJiBtb2QucmVwb3J0V2ViVml0YWxzKSB7XG4gICAgICAgICAgICBvblBlcmZFbnRyeSA9IChwYXJhbSk9PntcbiAgICAgICAgICAgICAgICBsZXQgeyBpZCwgbmFtZSwgc3RhcnRUaW1lLCB2YWx1ZSwgZHVyYXRpb24sIGVudHJ5VHlwZSwgZW50cmllcywgYXR0cmlidXRpb24gfSA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIC8vIENvbWJpbmVzIHRpbWVzdGFtcCB3aXRoIHJhbmRvbSBudW1iZXIgZm9yIHVuaXF1ZSBJRFxuICAgICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZUlEID0gRGF0ZS5ub3coKSArIFwiLVwiICsgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICg5ZTEyIC0gMSkpICsgMWUxMik7XG4gICAgICAgICAgICAgICAgbGV0IHBlcmZTdGFydEVudHJ5O1xuICAgICAgICAgICAgICAgIGlmIChlbnRyaWVzICYmIGVudHJpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlcmZTdGFydEVudHJ5ID0gZW50cmllc1swXS5zdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHdlYlZpdGFscyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkIHx8IHVuaXF1ZUlELFxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSB8fCBwZXJmU3RhcnRFbnRyeSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlID09IG51bGwgPyBkdXJhdGlvbiA6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogZW50cnlUeXBlID09PSAnbWFyaycgfHwgZW50cnlUeXBlID09PSAnbWVhc3VyZScgPyAnY3VzdG9tJyA6ICd3ZWItdml0YWwnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgd2ViVml0YWxzLmF0dHJpYnV0aW9uID0gYXR0cmlidXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZC5yZXBvcnRXZWJWaXRhbHMod2ViVml0YWxzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFnZUVudHJ5cG9pbnQgPSAvLyBUaGUgZGV2IHNlcnZlciBmYWlscyB0byBzZXJ2ZSBzY3JpcHQgYXNzZXRzIHdoZW4gdGhlcmUncyBhIGh5ZHJhdGlvblxuICAgICAgICAvLyBlcnJvciwgc28gd2UgbmVlZCB0byBza2lwIHdhaXRpbmcgZm9yIHRoZSBlbnRyeXBvaW50LlxuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyAmJiBpbml0aWFsRGF0YS5lcnIgPyB7XG4gICAgICAgICAgICBlcnJvcjogaW5pdGlhbERhdGEuZXJyXG4gICAgICAgIH0gOiBhd2FpdCBwYWdlTG9hZGVyLnJvdXRlTG9hZGVyLndoZW5FbnRyeXBvaW50KGluaXRpYWxEYXRhLnBhZ2UpO1xuICAgICAgICBpZiAoJ2Vycm9yJyBpbiBwYWdlRW50cnlwb2ludCkge1xuICAgICAgICAgICAgdGhyb3cgcGFnZUVudHJ5cG9pbnQuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgQ2FjaGVkQ29tcG9uZW50ID0gcGFnZUVudHJ5cG9pbnQuY29tcG9uZW50O1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgY29uc3QgeyBpc1ZhbGlkRWxlbWVudFR5cGUgfSA9IHJlcXVpcmUoJ25leHQvZGlzdC9jb21waWxlZC9yZWFjdC1pcycpO1xuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkRWxlbWVudFR5cGUoQ2FjaGVkQ29tcG9uZW50KSkge1xuICAgICAgICAgICAgICAgIHRocm93IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXcgRXJyb3IoJ1RoZSBkZWZhdWx0IGV4cG9ydCBpcyBub3QgYSBSZWFjdCBDb21wb25lbnQgaW4gcGFnZTogXCInICsgaW5pdGlhbERhdGEucGFnZSArICdcIicpLCBcIl9fTkVYVF9FUlJPUl9DT0RFXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiRTI4NlwiLFxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBUaGlzIGNhdGNoZXMgZXJyb3JzIGxpa2UgdGhyb3dpbmcgaW4gdGhlIHRvcCBsZXZlbCBvZiBhIG1vZHVsZVxuICAgICAgICBpbml0aWFsRXJyID0gKDAsIF9pc2Vycm9yLmdldFByb3BlckVycm9yKShlcnJvcik7XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICBjb25zdCBnZXRTZXJ2ZXJFcnJvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9yZWFjdC1kZXYtb3ZlcmxheS9wYWdlcy9jbGllbnQnKS5nZXRTZXJ2ZXJFcnJvcjtcbiAgICAgICAgLy8gU2VydmVyLXNpZGUgcnVudGltZSBlcnJvcnMgbmVlZCB0byBiZSByZS10aHJvd24gb24gdGhlIGNsaWVudC1zaWRlIHNvXG4gICAgICAgIC8vIHRoYXQgdGhlIG92ZXJsYXkgaXMgcmVuZGVyZWQuXG4gICAgICAgIGlmIChpbml0aWFsRXJyKSB7XG4gICAgICAgICAgICBpZiAoaW5pdGlhbEVyciA9PT0gaW5pdGlhbERhdGEuZXJyKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG5ldyBlcnJvciBvYmplY3QuIFdlIGB0aHJvd2AgaXQgYmVjYXVzZSBzb21lIGJyb3dzZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3aWxsIHNldCB0aGUgYHN0YWNrYCB3aGVuIHRocm93biwgYW5kIHdlIHdhbnQgdG8gZW5zdXJlIG91cnMgaXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBvdmVycmlkZGVuIHdoZW4gd2UgcmUtdGhyb3cgaXQgYmVsb3cuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3IEVycm9yKGluaXRpYWxFcnIubWVzc2FnZSksIFwiX19ORVhUX0VSUk9SX0NPREVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIkUzOTRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IubmFtZSA9IGluaXRpYWxFcnIubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3Iuc3RhY2sgPSBpbml0aWFsRXJyLnN0YWNrO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJTb3VyY2UgPSBpbml0aWFsRXJyLnNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gZGV2ZWxvcG1lbnQsIGVycm9yIHRoZSBuYXZpZ2F0aW9uIEFQSSB1c2FnZSBpbiBydW50aW1lLFxuICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSBpdCdzIG5vdCBhbGxvd2VkIHRvIGJlIHVzZWQgaW4gcGFnZXMgcm91dGVyIGFzIGl0IGRvZXNuJ3QgY29udGFpbiBlcnJvciBib3VuZGFyeSBsaWtlIGFwcCByb3V0ZXIuXG4gICAgICAgICAgICAgICAgICAgIGlmICgoMCwgX2lzbmV4dHJvdXRlcmVycm9yLmlzTmV4dFJvdXRlckVycm9yKShpbml0aWFsRXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IubWVzc2FnZSA9ICdOZXh0LmpzIG5hdmlnYXRpb24gQVBJIGlzIG5vdCBhbGxvd2VkIHRvIGJlIHVzZWQgaW4gUGFnZXMgUm91dGVyLic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZ2V0U2VydmVyRXJyb3IoZXJyb3IsIGVyclNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgaW5pdGlhbEVycjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAod2luZG93Ll9fTkVYVF9QUkVMT0FEUkVBRFkpIHtcbiAgICAgICAgYXdhaXQgd2luZG93Ll9fTkVYVF9QUkVMT0FEUkVBRFkoaW5pdGlhbERhdGEuZHluYW1pY0lkcyk7XG4gICAgfVxuICAgIHJvdXRlciA9ICgwLCBfcm91dGVyLmNyZWF0ZVJvdXRlcikoaW5pdGlhbERhdGEucGFnZSwgaW5pdGlhbERhdGEucXVlcnksIGFzUGF0aCwge1xuICAgICAgICBpbml0aWFsUHJvcHM6IGluaXRpYWxEYXRhLnByb3BzLFxuICAgICAgICBwYWdlTG9hZGVyLFxuICAgICAgICBBcHA6IENhY2hlZEFwcCxcbiAgICAgICAgQ29tcG9uZW50OiBDYWNoZWRDb21wb25lbnQsXG4gICAgICAgIHdyYXBBcHAsXG4gICAgICAgIGVycjogaW5pdGlhbEVycixcbiAgICAgICAgaXNGYWxsYmFjazogQm9vbGVhbihpbml0aWFsRGF0YS5pc0ZhbGxiYWNrKSxcbiAgICAgICAgc3Vic2NyaXB0aW9uOiAoaW5mbywgQXBwLCBzY3JvbGwpPT5yZW5kZXIoT2JqZWN0LmFzc2lnbih7fSwgaW5mbywge1xuICAgICAgICAgICAgICAgIEFwcCxcbiAgICAgICAgICAgICAgICBzY3JvbGxcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgbG9jYWxlOiBpbml0aWFsRGF0YS5sb2NhbGUsXG4gICAgICAgIGxvY2FsZXM6IGluaXRpYWxEYXRhLmxvY2FsZXMsXG4gICAgICAgIGRlZmF1bHRMb2NhbGUsXG4gICAgICAgIGRvbWFpbkxvY2FsZXM6IGluaXRpYWxEYXRhLmRvbWFpbkxvY2FsZXMsXG4gICAgICAgIGlzUHJldmlldzogaW5pdGlhbERhdGEuaXNQcmV2aWV3XG4gICAgfSk7XG4gICAgaW5pdGlhbE1hdGNoZXNNaWRkbGV3YXJlID0gYXdhaXQgcm91dGVyLl9pbml0aWFsTWF0Y2hlc01pZGRsZXdhcmVQcm9taXNlO1xuICAgIGNvbnN0IHJlbmRlckN0eCA9IHtcbiAgICAgICAgQXBwOiBDYWNoZWRBcHAsXG4gICAgICAgIGluaXRpYWw6IHRydWUsXG4gICAgICAgIENvbXBvbmVudDogQ2FjaGVkQ29tcG9uZW50LFxuICAgICAgICBwcm9wczogaW5pdGlhbERhdGEucHJvcHMsXG4gICAgICAgIGVycjogaW5pdGlhbEVycixcbiAgICAgICAgaXNIeWRyYXRlUGFzczogdHJ1ZVxuICAgIH07XG4gICAgaWYgKG9wdHMgPT0gbnVsbCA/IHZvaWQgMCA6IG9wdHMuYmVmb3JlUmVuZGVyKSB7XG4gICAgICAgIGF3YWl0IG9wdHMuYmVmb3JlUmVuZGVyKCk7XG4gICAgfVxuICAgIHJlbmRlcihyZW5kZXJDdHgpO1xufVxuXG5pZiAoKHR5cGVvZiBleHBvcnRzLmRlZmF1bHQgPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiBleHBvcnRzLmRlZmF1bHQgPT09ICdvYmplY3QnICYmIGV4cG9ydHMuZGVmYXVsdCAhPT0gbnVsbCkpICYmIHR5cGVvZiBleHBvcnRzLmRlZmF1bHQuX19lc01vZHVsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMuZGVmYXVsdCwgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuICBPYmplY3QuYXNzaWduKGV4cG9ydHMuZGVmYXVsdCwgZXhwb3J0cyk7XG4gIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXSwibmFtZXMiOlsiX3JlZ2VuZXJhdG9yUnVudGltZSIsInJlcXVpcmUiLCJfc2xpY2VkVG9BcnJheSIsIl9kZWZpbmVQcm9wZXJ0eSIsIl9hc3luY1RvR2VuZXJhdG9yIiwiX2NsYXNzQ2FsbENoZWNrIiwiX2NyZWF0ZUNsYXNzIiwiX2luaGVyaXRzIiwiX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4iLCJfZ2V0UHJvdG90eXBlT2YiLCJfcyIsIiRSZWZyZXNoU2lnJCIsIl9zMiIsIl9zMyIsIm93bktleXMiLCJlIiwiciIsInQiLCJPYmplY3QiLCJrZXlzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwibyIsImZpbHRlciIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJwdXNoIiwiYXBwbHkiLCJfb2JqZWN0U3ByZWFkIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiZm9yRWFjaCIsImdldE93blByb3BlcnR5RGVzY3JpcHRvcnMiLCJkZWZpbmVQcm9wZXJ0aWVzIiwiZGVmaW5lUHJvcGVydHkiLCJfY3JlYXRlU3VwZXIiLCJEZXJpdmVkIiwiaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCIsIl9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QiLCJfY3JlYXRlU3VwZXJJbnRlcm5hbCIsIlN1cGVyIiwicmVzdWx0IiwiTmV3VGFyZ2V0IiwiY29uc3RydWN0b3IiLCJSZWZsZWN0IiwiY29uc3RydWN0Iiwic2hhbSIsIlByb3h5IiwiQm9vbGVhbiIsInByb3RvdHlwZSIsInZhbHVlT2YiLCJjYWxsIiwiZXhwb3J0cyIsInZhbHVlIiwibW9kdWxlIiwiZW1pdHRlciIsImh5ZHJhdGUiLCJpbml0aWFsaXplIiwicm91dGVyIiwidmVyc2lvbiIsIl9leHBvcnQiLCJ0YXJnZXQiLCJhbGwiLCJuYW1lIiwiZ2V0IiwiX2ludGVyb3BfcmVxdWlyZV9kZWZhdWx0IiwiX2pzeHJ1bnRpbWUiLCJfcmVhY3QiLCJfIiwiX2NsaWVudCIsIl9oZWFkbWFuYWdlcmNvbnRleHRzaGFyZWRydW50aW1lIiwiX21pdHQiLCJfcm91dGVyY29udGV4dHNoYXJlZHJ1bnRpbWUiLCJfaGFuZGxlc21vb3Roc2Nyb2xsIiwiX2lzZHluYW1pYyIsIl9xdWVyeXN0cmluZyIsIl9ydW50aW1lY29uZmlnZXh0ZXJuYWwiLCJfdXRpbHMiLCJfcG9ydGFsIiwiX2hlYWRtYW5hZ2VyIiwiX3BhZ2Vsb2FkZXIiLCJfcm91dGVhbm5vdW5jZXIiLCJfcm91dGVyIiwiX2lzZXJyb3IiLCJfaW1hZ2Vjb25maWdjb250ZXh0c2hhcmVkcnVudGltZSIsIl9yZW1vdmViYXNlcGF0aCIsIl9oYXNiYXNlcGF0aCIsIl9hcHByb3V0ZXJjb250ZXh0c2hhcmVkcnVudGltZSIsIl9hZGFwdGVycyIsIl9ob29rc2NsaWVudGNvbnRleHRzaGFyZWRydW50aW1lIiwiX29ucmVjb3ZlcmFibGVlcnJvciIsIl90cmFjZXIiLCJfaXNuZXh0cm91dGVyZXJyb3IiLCJsb29zZVRvQXJyYXkiLCJpbnB1dCIsInNsaWNlIiwiaW5pdGlhbERhdGEiLCJkZWZhdWx0TG9jYWxlIiwidW5kZWZpbmVkIiwiYXNQYXRoIiwicGFnZUxvYWRlciIsImFwcEVsZW1lbnQiLCJoZWFkTWFuYWdlciIsImluaXRpYWxNYXRjaGVzTWlkZGxld2FyZSIsImxhc3RBcHBQcm9wcyIsImxhc3RSZW5kZXJSZWplY3QiLCJkZXZDbGllbnQiLCJDYWNoZWRBcHAiLCJvblBlcmZFbnRyeSIsIkNhY2hlZENvbXBvbmVudCIsIkNvbnRhaW5lciIsIl9yZWFjdCRkZWZhdWx0JENvbXBvbiIsIl9zdXBlciIsImtleSIsImNvbXBvbmVudERpZENhdGNoIiwiY29tcG9uZW50RXJyIiwiaW5mbyIsInByb3BzIiwiZm4iLCJjb21wb25lbnREaWRNb3VudCIsInNjcm9sbFRvSGFzaCIsImlzU3NyIiwiaXNGYWxsYmFjayIsIm5leHRFeHBvcnQiLCJpc0R5bmFtaWNSb3V0ZSIsInBhdGhuYW1lIiwibG9jYXRpb24iLCJzZWFyY2giLCJwcm9jZXNzIiwiZW52IiwiX19ORVhUX0hBU19SRVdSSVRFUyIsIl9fTl9TU0ciLCJyZXBsYWNlIiwiU3RyaW5nIiwiYXNzaWduIiwidXJsUXVlcnlUb1NlYXJjaFBhcmFtcyIsInF1ZXJ5IiwiVVJMU2VhcmNoUGFyYW1zIiwiX2giLCJzaGFsbG93IiwiZXJyIiwiY2FuY2VsbGVkIiwiY29tcG9uZW50RGlkVXBkYXRlIiwiX2xvY2F0aW9uIiwiaGFzaCIsInN1YnN0cmluZyIsImVsIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInNldFRpbWVvdXQiLCJzY3JvbGxJbnRvVmlldyIsInJlbmRlciIsImNoaWxkcmVuIiwiX3JlcXVpcmUiLCJQYWdlc0Rldk92ZXJsYXkiLCJqc3giLCJDb21wb25lbnQiLCJfeCIsIl9pbml0aWFsaXplMiIsIm1hcmsiLCJfY2FsbGVlIiwib3B0cyIsInByZWZpeCIsIl9yZXF1aXJlMiIsIm5vcm1hbGl6ZUxvY2FsZVBhdGgiLCJfcmVxdWlyZTMiLCJkZXRlY3REb21haW5Mb2NhbGUiLCJfcmVxdWlyZTQiLCJwYXJzZVJlbGF0aXZlVXJsIiwiX3JlcXVpcmU1IiwiZm9ybWF0VXJsIiwicGFyc2VkQXMiLCJsb2NhbGVQYXRoUmVzdWx0IiwiZGV0ZWN0ZWREb21haW4iLCJfcmVxdWlyZTYiLCJpbml0U2NyaXB0TG9hZGVyIiwicmVnaXN0ZXIiLCJ3cmFwIiwiX2NhbGxlZSQiLCJfY29udGV4dCIsInByZXYiLCJuZXh0Iiwib25TcGFuRW5kIiwiSlNPTiIsInBhcnNlIiwidGV4dENvbnRlbnQiLCJ3aW5kb3ciLCJfX05FWFRfREFUQV9fIiwiYXNzZXRQcmVmaXgiLCJzZWxmIiwiX19uZXh0X3NldF9wdWJsaWNfcGF0aF9fIiwic2V0Q29uZmlnIiwic2VydmVyUnVudGltZUNvbmZpZyIsInB1YmxpY1J1bnRpbWVDb25maWciLCJydW50aW1lQ29uZmlnIiwiZ2V0VVJMIiwiaGFzQmFzZVBhdGgiLCJyZW1vdmVCYXNlUGF0aCIsIl9fTkVYVF9JMThOX1NVUFBPUlQiLCJsb2NhbGVzIiwiZGV0ZWN0ZWRMb2NhbGUiLCJsb2NhbGUiLCJfX05FWFRfSTE4Tl9ET01BSU5TIiwiaG9zdG5hbWUiLCJzY3JpcHRMb2FkZXIiLCJidWlsZElkIiwicGFyYW0iLCJfcGFyYW0iLCJmIiwicm91dGVMb2FkZXIiLCJvbkVudHJ5cG9pbnQiLCJfX05FWFRfUCIsIm1hcCIsInAiLCJnZXRJc1NzciIsImFicnVwdCIsInN0b3AiLCJyZW5kZXJBcHAiLCJBcHAiLCJhcHBQcm9wcyIsIkFwcENvbnRhaW5lciIsImFkYXB0ZWRGb3JBcHBSb3V0ZXIiLCJ1c2VNZW1vIiwiYWRhcHRGb3JBcHBSb3V0ZXJJbnN0YW5jZSIsIl9zZWxmX19fTkVYVF9EQVRBX19fYXV0b0V4cG9ydCIsImVycm9yIiwicmVuZGVyRXJyb3IiLCJjb25zb2xlIiwiQXBwUm91dGVyQ29udGV4dCIsIlByb3ZpZGVyIiwiU2VhcmNoUGFyYW1zQ29udGV4dCIsImFkYXB0Rm9yU2VhcmNoUGFyYW1zIiwiUGF0aG5hbWVDb250ZXh0UHJvdmlkZXJBZGFwdGVyIiwiaXNBdXRvRXhwb3J0IiwiYXV0b0V4cG9ydCIsIlBhdGhQYXJhbXNDb250ZXh0IiwiYWRhcHRGb3JQYXRoUGFyYW1zIiwiUm91dGVyQ29udGV4dCIsIm1ha2VQdWJsaWNSb3V0ZXJJbnN0YW5jZSIsIkhlYWRNYW5hZ2VyQ29udGV4dCIsIkltYWdlQ29uZmlnQ29udGV4dCIsIl9fTkVYVF9JTUFHRV9PUFRTIiwiX2MiLCJ3cmFwQXBwIiwid3JhcHBlZEFwcFByb3BzIiwicmVuZGVyRXJyb3JQcm9wcyIsIm9uVW5yZWNvdmVyYWJsZUVycm9yIiwiZG9SZW5kZXIiLCJzdHlsZVNoZWV0cyIsImxvYWRQYWdlIiwidGhlbiIsIkVycm9yQ29tcG9uZW50IiwicGFnZSIsImVycm9yTW9kdWxlIiwiYXBwTW9kdWxlIiwibSIsIl9yZW5kZXJFcnJvclByb3BzX3Byb3BzIiwiQXBwVHJlZSIsImFwcEN0eCIsImN0eCIsIlByb21pc2UiLCJyZXNvbHZlIiwibG9hZEdldEluaXRpYWxQcm9wcyIsImluaXRQcm9wcyIsIkhlYWQiLCJjYWxsYmFjayIsInVzZUxheW91dEVmZmVjdCIsIl9jMiIsInBlcmZvcm1hbmNlTWFya3MiLCJuYXZpZ2F0aW9uU3RhcnQiLCJiZWZvcmVSZW5kZXIiLCJhZnRlclJlbmRlciIsImFmdGVySHlkcmF0ZSIsInJvdXRlQ2hhbmdlIiwicGVyZm9ybWFuY2VNZWFzdXJlcyIsImh5ZHJhdGlvbiIsImJlZm9yZUh5ZHJhdGlvbiIsInJvdXRlQ2hhbmdlVG9SZW5kZXIiLCJyZWFjdFJvb3QiLCJzaG91bGRIeWRyYXRlIiwiY2xlYXJNYXJrcyIsInBlcmZvcm1hbmNlIiwibWFya0h5ZHJhdGVDb21wbGV0ZSIsIlNUIiwiaGFzQmVmb3JlUmVuZGVyTWFyayIsImdldEVudHJpZXNCeU5hbWUiLCJiZWZvcmVIeWRyYXRpb25NZWFzdXJlIiwibWVhc3VyZSIsImh5ZHJhdGlvbk1lYXN1cmUiLCJzdGFydFNwYW4iLCJzdGFydFRpbWUiLCJ0aW1lT3JpZ2luIiwiYXR0cmlidXRlcyIsImVuZCIsImR1cmF0aW9uIiwibWFya1JlbmRlckNvbXBsZXRlIiwibmF2U3RhcnRFbnRyaWVzIiwiY2xlYXJNZWFzdXJlcyIsInJlbmRlclJlYWN0RWxlbWVudCIsImRvbUVsIiwicmVhY3RFbCIsImh5ZHJhdGVSb290Iiwib25SZWNvdmVyYWJsZUVycm9yIiwic3RhcnRUcmFuc2l0aW9uIiwiUm9vdCIsImNhbGxiYWNrcyIsIl9fTkVYVF9URVNUX01PREUiLCJ1c2VFZmZlY3QiLCJfX05FWFRfSFlEUkFURUQiLCJfX05FWFRfSFlEUkFURURfQ0IiLCJfYzMiLCJjYW5jZWxlZCIsInJlc29sdmVQcm9taXNlIiwicmVuZGVyUHJvbWlzZSIsInJlamVjdCIsIkVycm9yIiwiY29uZmlndXJhYmxlIiwib25TdGFydCIsImN1cnJlbnRTdHlsZVRhZ3MiLCJxdWVyeVNlbGVjdG9yQWxsIiwiY3VycmVudEhyZWZzIiwiU2V0IiwidGFnIiwiZ2V0QXR0cmlidXRlIiwibm9zY3JpcHQiLCJxdWVyeVNlbGVjdG9yIiwibm9uY2UiLCJocmVmIiwidGV4dCIsImhhcyIsInN0eWxlVGFnIiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsImhlYWQiLCJhcHBlbmRDaGlsZCIsImNyZWF0ZVRleHROb2RlIiwib25IZWFkQ29tbWl0IiwiVFVSQk9QQUNLIiwiZGVzaXJlZEhyZWZzIiwicyIsImlkeCIsInJlbW92ZUF0dHJpYnV0ZSIsInJlZmVyZW5jZU5vZGUiLCJ0YXJnZXRUYWciLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwibmV4dFNpYmxpbmciLCJyZW1vdmVDaGlsZCIsInNjcm9sbCIsIl9pbnB1dCRzY3JvbGwiLCJ4IiwieSIsImhhbmRsZVNtb290aFNjcm9sbCIsInNjcm9sbFRvIiwib25Sb290Q29tbWl0IiwiZWxlbSIsImpzeHMiLCJGcmFnbWVudCIsIlBvcnRhbCIsInR5cGUiLCJSb3V0ZUFubm91bmNlciIsIl9fTkVYVF9TVFJJQ1RfTU9ERSIsIlN0cmljdE1vZGUiLCJfeDIiLCJfcmVuZGVyIiwiX2NhbGxlZTIiLCJyZW5kZXJpbmdQcm9wcyIsInJlbmRlckVyciIsIl9jYWxsZWUyJCIsIl9jb250ZXh0MiIsImlzSHlkcmF0ZVBhc3MiLCJ0MCIsImdldFByb3BlckVycm9yIiwiX3gzIiwiX2h5ZHJhdGUyIiwiX2NhbGxlZTMiLCJpbml0aWFsRXJyIiwiYXBwRW50cnlwb2ludCIsImFwcCIsIm1vZCIsInBhZ2VFbnRyeXBvaW50IiwiX3JlcXVpcmU3IiwiaXNWYWxpZEVsZW1lbnRUeXBlIiwiZ2V0U2VydmVyRXJyb3IiLCJyZW5kZXJDdHgiLCJfY2FsbGVlMyQiLCJfY29udGV4dDMiLCJ3aGVuRW50cnlwb2ludCIsInNlbnQiLCJjb21wb25lbnQiLCJyZXBvcnRXZWJWaXRhbHMiLCJpZCIsImVudHJ5VHlwZSIsImVudHJpZXMiLCJhdHRyaWJ1dGlvbiIsInVuaXF1ZUlEIiwiRGF0ZSIsIm5vdyIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsInBlcmZTdGFydEVudHJ5Iiwid2ViVml0YWxzIiwibGFiZWwiLCJ0MSIsIm1lc3NhZ2UiLCJzdGFjayIsImVyclNvdXJjZSIsInNvdXJjZSIsImlzTmV4dFJvdXRlckVycm9yIiwiX19ORVhUX1BSRUxPQURSRUFEWSIsImR5bmFtaWNJZHMiLCJjcmVhdGVSb3V0ZXIiLCJpbml0aWFsUHJvcHMiLCJzdWJzY3JpcHRpb24iLCJkb21haW5Mb2NhbGVzIiwiaXNQcmV2aWV3IiwiX2luaXRpYWxNYXRjaGVzTWlkZGxld2FyZVByb21pc2UiLCJpbml0aWFsIiwiX19lc01vZHVsZSIsIiRSZWZyZXNoUmVnJCJdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==
//# sourceURL=webpack-internal:///(pages-dir-browser)/./node_modules/next/dist/client/index.js


function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}