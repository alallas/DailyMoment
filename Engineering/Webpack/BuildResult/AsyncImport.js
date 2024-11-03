// ! 主chunk代码 main.js

(() => {

	// 主树对象
 	var __webpack_modules__ = ({});

	// 缓存对象
 	var __webpack_module_cache__ = {};
 	

 	function __webpack_require__(moduleId) {

 		var cachedModule = __webpack_module_cache__[moduleId];
 		if (cachedModule !== undefined) {
 			return cachedModule.exports;
 		}

 		var module = __webpack_module_cache__[moduleId] = {
 			exports: {}
 		};
 	
 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
 	
 		return module.exports;
 	}
 	
	// 主树对象（副本）
 	__webpack_require__.m = __webpack_modules__;
 	

 	/* （一）e方法 */
 	(() => {
		__webpack_require__.f = {};

		__webpack_require__.e = (chunkId) => {
			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
				__webpack_require__.f[key](chunkId, promises);
				return promises;
			}, []));
		};
	})();



 	/* （二）f对象的j方法 + （四）给额外的chunk自定义一个方法 */
 	(() => {

		// 定义状态机
 		// undefined = chunk not loaded, 
    // null = chunk preloaded/prefetched
 		// [resolve, reject, Promise] = chunk loading, 
    // 0 = chunk loaded
 		var installedChunks = {
 			"main": 0
 		};
 		
		// f对象的j方法
 		__webpack_require__.f.j = (chunkId, promises) => {
			// 创建一个当前变量
			var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
			if(installedChunkData !== 0) {
	
				// 如果状态机里面没有这个状态
				if(installedChunkData) {
					promises.push(installedChunkData[2]);
				} else {
					if(true) {
						// 新建promise，保存到状态机
						var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
						promises.push(installedChunkData[2] = promise);
	
						// 构造一个url
						var url = __webpack_require__.p + __webpack_require__.u(chunkId);

						// 错误处理
						var error = new Error();
						var loadingEnded = (event) => {
							if(__webpack_require__.o(installedChunks, chunkId)) {
								installedChunkData = installedChunks[chunkId];
								if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
								if(installedChunkData) {
									var errorType = event && (event.type === 'load' ? 'missing' : event.type);
									var realSrc = event && event.target && event.target.src;
									error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
									error.name = 'ChunkLoadError';
									error.type = errorType;
									error.request = realSrc;
									installedChunkData[1](error);
								}
							}
						};

						// 去加载资源
						__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
					}
				}
			}
 		};
 		
 		// 自定义一个函数，保存在window对象，加载完script之后，可以执行这个函数
 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
 			var [chunkIds, moreModules, runtime] = data;

			// 合并这个额外的chunk到原本的主树对象
 			var moduleId, chunkId, i = 0;
 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
 				for(moduleId in moreModules) {
 					if(__webpack_require__.o(moreModules, moduleId)) {
 						__webpack_require__.m[moduleId] = moreModules[moduleId];
 					}
 				}
 				if(runtime) var result = runtime(__webpack_require__);
 			}
 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);

			// 执行resolve()函数，接连改变状态
 			for(;i < chunkIds.length; i++) {
 				chunkId = chunkIds[i];
 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
 					installedChunks[chunkId][0]();
 				}
 				installedChunks[chunkId] = 0;
 			}
 		}
 		
		// 保存自定义函数到window对象
 		var chunkLoadingGlobal = self["webpackChunkzyl"] = self["webpackChunkzyl"] || [];
 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
 	})();



 	/* （三）加载script标签，拿到chunk资源 */
 	(() => {
		var inProgress = {};
		var dataWebpackPrefix = "zyl:";

		__webpack_require__.l = (url, done, key, chunkId) => {
			if(inProgress[url]) { inProgress[url].push(done); return; }
			var script, needAttach;

		 // 看html中是不是已经有同样url的script，这样就不用再创建一个了
			if(key !== undefined) {
				var scripts = document.getElementsByTagName("script");
				for(var i = 0; i < scripts.length; i++) {
					var s = scripts[i];
					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
				}
			}
		 // 创建一个新的script标签
			if(!script) {
				needAttach = true;
				script = document.createElement('script');
		
				script.charset = 'utf-8';
				script.timeout = 120;
				if (__webpack_require__.nc) {
					script.setAttribute("nonce", __webpack_require__.nc);
				}
				script.setAttribute("data-webpack", dataWebpackPrefix + key);
		
				script.src = url;
			}

		 // 后续成功加载或失败的函数处理
			inProgress[url] = [done];
		 
		 // 失败把原来保存的东西都删掉，防止内存泄漏
			var onScriptComplete = (prev, event) => {
				script.onerror = script.onload = null;
				clearTimeout(timeout);
				var doneFns = inProgress[url];
				delete inProgress[url];
				script.parentNode && script.parentNode.removeChild(script);
				doneFns && doneFns.forEach((fn) => (fn(event)));
				if(prev) return prev(event);
			}
			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
			script.onerror = onScriptComplete.bind(null, script.onerror);
			script.onload = onScriptComplete.bind(null, script.onload);

		 // script标签挂上去
			needAttach && document.head.appendChild(script);
		};
	})();



 	/* （五）t方法 */
 	(() => {
 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
 		var leafPrototypes;

 		// mode & 1: value is a module id, require it（八进制转换成二进制表示就是0001）
 		// mode & 2: merge all properties of value into the ns
 		// mode & 4: return value when already ns object
 		// mode & 16: return value when it's Promise-like
 		// mode & 8|1: behave like require

 		__webpack_require__.t = function(value, mode) {
			// 大多数情况都要执行__webpack_require__(path)，得到exports对象的值
 			if(mode & 1) value = this(value);

			// 其他8、4、16的情况，（已经是es6Module或一个Promise对象）直接返回本身
 			if(mode & 8) return value;
 			if(typeof value === 'object' && value) {
 				if((mode & 4) && value.__esModule) return value;
 				if((mode & 16) && typeof value.then === 'function') return value;
 			}

			// 如果是module.exports = xxx的情况，改成es6Module的情况
 			var ns = Object.create(null);
 			__webpack_require__.r(ns);
 			var def = {};
 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
 			
			// 2的情况：把value的所有属性合并到def上，后面def摘合并到ns上，返回ns
			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
 			}

			// 设置默认属性为chunk的【所有】导出值
 			def['default'] = () => (value);

			// 把def挂到ns上，强制变为es6Module
 			__webpack_require__.d(ns, def);

			// then回调函数的返回值可以resolve本then的Promise，然后传递给下一个then
 			return ns;
 		};
 	})();
 	



 	/* d方法：挂载其他对象的属性到目标对象上面 */
 	(() => {
 		__webpack_require__.d = (exports, definition) => {
 			for(var key in definition) {
 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
 				}
 			}
 		};
 	})();
 	

 	/* 定义一下全局this */
 	(() => {
 		__webpack_require__.g = (function() {
 			if (typeof globalThis === 'object') return globalThis;
 			try {
 				return this || new Function('return this')();
 			} catch (e) {
 				if (typeof window === 'object') return window;
 			}
 		})();
 	})();


 	/* o方法：检查对象有没有xx属性 */
 	(() => {
 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
 	})();
 	

 	/* r方法：挂es6Module属性 */
 	(() => {
 		__webpack_require__.r = (exports) => {
 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
 			}
 			Object.defineProperty(exports, '__esModule', { value: true });
 		};
 	})();
 	

 	/* 为异步的JSchunk提取域名 */
 	(() => {
 		var scriptUrl;
 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
 		var document = __webpack_require__.g.document;
 		if (!scriptUrl && document) {
 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
 				scriptUrl = document.currentScript.src;
 			if (!scriptUrl) {
 				var scripts = document.getElementsByTagName("script");
 				if(scripts.length) {
 					var i = scripts.length - 1;
 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
 				}
 			}
 		}

 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
 		__webpack_require__.p = scriptUrl;
 	})();
 	

 	/* 构造chunk文件名和扩展名 */
 	(() => {
 		__webpack_require__.u = (chunkId) => {
 			return "" + chunkId + ".js";
 		};
 	})();

 	

	/* 入口chunk的函数 */
	console.log('index js running')
	const btn = document.getElementById('btn');
	btn.addEventListener('click', () => {
		// 执行e方法，第一个then执行t方法，然后才是第二个then
		__webpack_require__.e("src_test_title_js").then(__webpack_require__.t.bind(__webpack_require__, "./src/test/title.js", 23)).then(result => {
			console.log(result);
		})
	})

})();



// ! 异步加载的额外的chunk代码 title.js
(self["webpackChunkzyl"] = self["webpackChunkzyl"] || []).push([
  ["src_test_title_js"],
  {
  "./src/test/title.js":
    ((module) => {
      console.log('title js running----')
      module.exports = 'title';
    })
  }
]);