// 主应用

// 主应用beforeLoad（执行子应用的js资源之前）-->子应用bootstraped-->主应用beforeMount-->子应用mount-->主应用afterMount-->
// 子应用update-->主应用beforeUnmount-->子应用unmount-->主应用afterUnmount


// 1. 【qiankun】注册微应用
// 外部写法
// 总结一句话：至此已经实现了微应用的html的挂载和js的执行（还没执行子应用的生命周期函数）

registerMicroApp(
  [
    {
      name: "microApp1",
      entry: "https://xxx.com",
      container: "#micro-app",
      activeRule: "/micro-app1",
    },
  ],
  {
    beforeLoad: (app) => {
      console.log("before load", app.name);
      return Promise.resolve();
    },
    beforeMount: (app) => {
      console.log("before mount", app.name);
      return Promise.resolve();
    },
    afterMount: (app) => {
      console.log("after mount", app.name);
      return Promise.resolve();
    },
    beforeUnmount: (app) => {
      console.log("before unmount", app.name);
      return Promise.resolve();
    },
    afterUnmount: (app) => {
      console.log("after unmount", app.name);
      return Promise.resolve();
    },
  }
);


// 内部实现

export function registerMicroApps(apps, lifeCycles) {
  var unregisteredApps = apps.filter(function (app) {
    return !microApps.some(function (registeredApp) {
      return registeredApp.name === app.name;
    });
  });
  microApps = [].concat(_toConsumableArray(microApps), _toConsumableArray(unregisteredApps));
  unregisteredApps.forEach(function (app) {
    var name = app.name,
      activeRule = app.activeRule,
      _app$loader = app.loader,
      loader = _app$loader === void 0 ? _noop : _app$loader,
      props = app.props,
      appConfig = _objectWithoutProperties(app, _excluded);

    // 下面的注册函数是single-spa的入口函数，这个库专门用于处理微应用的生命周期
    registerApplication({
      name: name,
      app: function () {
        var _app = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3() {
          var _yield$loadApp, mount, otherMicroAppConfigs;
          return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                loader(true);
                _context3.next = 3;
                return frameworkStartedDefer.promise;

              // 3.1 第一步：加载微应用
              case 3:
                _context3.next = 5;

                // loadApp的内在逻辑是：
                return loadApp(_objectSpread({
                  name: name,
                  props: props
                }, appConfig), frameworkConfiguration, lifeCycles);
              case 5:
                _context3.t0 = _context3.sent;
                _yield$loadApp = (0, _context3.t0)();
                mount = _yield$loadApp.mount;
                otherMicroAppConfigs = _objectWithoutProperties(_yield$loadApp, _excluded2);
                return _context3.abrupt("return", _objectSpread({
                  mount: [/*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
                    return _regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) switch (_context.prev = _context.next) {
                        case 0:
                          return _context.abrupt("return", loader(true));
                        case 1:
                        case "end":
                          return _context.stop();
                      }
                    }, _callee);
                  }))].concat(_toConsumableArray(toArray(mount)), [/*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
                    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) switch (_context2.prev = _context2.next) {
                        case 0:
                          return _context2.abrupt("return", loader(false));
                        case 1:
                        case "end":
                          return _context2.stop();
                      }
                    }, _callee2);
                  }))])
                }, otherMicroAppConfigs));
              case 10:
              case "end":
                return _context3.stop();
            }
          }, _callee3);
        }));
        function app() {
          return _app.apply(this, arguments);
        }
        return app;
      }(),
      activeWhen: activeRule,
      customProps: props
    });
  });
}



// 2. 【single-spa】先去single-spa库
// 对微应用的相关属性做预准备，主要用到promise控制流程

const apps = [];

// 2.1 入口的注册函数
export function registerApplication(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {

  // 整合并检验所有的入参
  const registration = sanitizeArguments(
    appNameOrConfig,
    appOrLoadApp,
    activeWhen,
    customProps
  );

  if (!isStarted() && !startWarningInitialized) {
    startWarningInitialized = true;

    setTimeout(() => {
      if (!isStarted()) {
        console.warn(
          formatErrorMessage(
            1,
            __DEV__ &&
              `singleSpa.start() has not been called, 5000ms after single-spa was loaded. Before start() is called, apps can be declared and loaded, but not bootstrapped or mounted.`
          )
        );
      }
    }, 5000);
  }

  if (getAppNames().indexOf(registration.name) !== -1)
    throw Error(
      formatErrorMessage(
        21,
        __DEV__ &&
          `There is already an app registered with name ${registration.name}`,
        registration.name
      )
    );

  // 在api.js文件处的apps数组注入一个对象，每个对象是一个微应用
  apps.push(
    assign(
      {
        loadErrorTime: null,
        // !！！注意初始化的状态是【NOT_LOADED】
        status: NOT_LOADED,
        parcels: {},
        devtools: {
          overlays: {
            options: {},
            selectors: [],
          },
        },
      },
      registration
    )
  );

  // 进入reroute核心函数，监听url的情况
  if (isInBrowser) {
    ensureJQuerySupport();
    reroute();
  }
}

function sanitizeArguments(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  const usingObjectAPI = typeof appNameOrConfig === "object";

  const registration = {
    name: null,
    loadApp: null,
    activeWhen: null,
    customProps: null,
  };

  // 把主应用写的配置全部挂到这个对象上面
  if (usingObjectAPI) {
    validateRegisterWithConfig(appNameOrConfig);
    registration.name = appNameOrConfig.name;
    registration.loadApp = appNameOrConfig.app;
    registration.activeWhen = appNameOrConfig.activeWhen;
    registration.customProps = appNameOrConfig.customProps;
  } else {
    validateRegisterWithArguments(
      appNameOrConfig,
      appOrLoadApp,
      activeWhen,
      customProps
    );
    registration.name = appNameOrConfig;
    registration.loadApp = appOrLoadApp;
    registration.activeWhen = activeWhen;
    registration.customProps = customProps;
  }

  registration.loadApp = sanitizeLoadApp(registration.loadApp);
  registration.customProps = sanitizeCustomProps(registration.customProps);
  registration.activeWhen = sanitizeActiveWhen(registration.activeWhen);

  return registration;
}


// 2.2 reroute函数：分发当前的生命周期阶段函数
// 要么已经start去performAppChanges，要么还没start去loadApps

export function reroute(
  pendingPromises = [],
  eventArguments,
  silentNavigation = false
) {
  if (appChangeUnderway) {
    return new Promise((resolve, reject) => {
      peopleWaitingOnAppChange.push({
        resolve,
        reject,
        eventArguments,
      });
    });
  }

  let startTime, profilerKind;

  if (__PROFILE__) {
    startTime = performance.now();
    if (silentNavigation) {
      profilerKind = "silentNavigation";
    } else if (eventArguments) {
      profilerKind = "browserNavigation";
    } else {
      profilerKind = "triggerAppChange";
    }
  }

  // 2.2.1 拿到当前对应生命周期的微应用对象
  const { appsToUnload, appsToUnmount, appsToLoad, appsToMount } =
    getAppChanges();
  
  let appsThatChanged,
    cancelPromises = [],
    oldUrl = currentUrl,
    newUrl = (currentUrl = window.location.href);

  // 2.2.2 检查当前是否已经执行了start函数
  if (isStarted()) {
    // 3.1 主应用外部的start函数执行完之后，去到【single-spa】的start函数，执行reroute，来这里分发到performAppChanges函数
    appChangeUnderway = true;
    appsThatChanged = appsToUnload.concat(
      appsToLoad,
      appsToUnmount,
      appsToMount
    );
    return performAppChanges();

  } else {
    // 2.2.3 还没执行就需要执行loadApps函数，去加载微应用
    appsThatChanged = appsToLoad;
    return loadApps();
  }

  function cancelNavigation(val = true) {
    const promise = typeof val?.then === "function" ? val : Promise.resolve(val);
    cancelPromises.push(
      promise.catch((err) => {
        console.warn(
          Error(
            formatErrorMessage(
              42,
              __DEV__ &&
                `single-spa: A cancelNavigation promise rejected with the following value: ${err}`
            )
          )
        );
        console.warn(err);
        return false;
      })
    );
  }

  // 2.2.3 加载微应用
  function loadApps() {
    // 返回一个promise，这个时候调用栈已经没有函数了，去到then执行回调
    return Promise.resolve().then(() => {

      // 2.3 加载每一个微应用，【确保每一微应用的生命周期函数得到保存】
      const loadPromises = appsToLoad.map(toLoadPromise);
      let succeeded;

      return (
        // 2.4 每一个微应用加载完毕之后（状态为【NOT_BOOTSTRAPPED】），开始执行callAllEventListeners
        Promise.all(loadPromises)
          .then(callAllEventListeners)
          .then(() => {
            if (__PROFILE__) {
              succeeded = true;
            }
            // 返回一个空数组
            return [];
          })
          .catch((err) => {
            if (__PROFILE__) {
              succeeded = false;
            }

            callAllEventListeners();
            throw err;
          })
          .finally(() => {
            if (__PROFILE__) {
              addProfileEntry(
                "routing",
                "loadApps",
                profilerKind,
                startTime,
                performance.now(),
                succeeded
              );
            }
          })
      );
    });
  }

  // 3.1 执行子应用的生命周期函数
  function performAppChanges() {
    return Promise.resolve().then(() => {
      // 因为performAppChanges之后没有别的函数了，继续执行then回调

      // 触发事件回调函数
      // 此时的appsThatChanged应该只有一个配置对象，是appsToLoad里面的
      fireSingleSpaEvent(
        appsThatChanged.length === 0
          ? "before-no-app-change"
          : "before-app-change",
        getCustomEventDetail(true)
      );

      fireSingleSpaEvent(
        "before-routing-event",
        getCustomEventDetail(true, { cancelNavigation })
      );

      // 等到所有取消promise执行完毕之后（一般为空数组[]？？？）
      return Promise.all(cancelPromises).then((cancelValues) => {
        const navigationIsCanceled = cancelValues.some((v) => v);
        if (navigationIsCanceled) {
          originalReplaceState.call(
            window.history,
            history.state,
            "",
            oldUrl.substring(location.origin.length)
          );

          currentUrl = location.href;
          appChangeUnderway = false;

          if (__PROFILE__) {
            addProfileEntry(
              "routing",
              "navigationCanceled",
              profilerKind,
              startTime,
              performance.now(),
              true
            );
          }
          return reroute(pendingPromises, eventArguments, true);
        }

        // 到这里的时候，只有appsToLoad是有东西的

        // （1）处理要卸载的微应用
        const unloadPromises = appsToUnload.map(toUnloadPromise);

        const unmountUnloadPromises = appsToUnmount
          .map(toUnmountPromise)
          .map((unmountPromise) => unmountPromise.then(toUnloadPromise));

        const allUnmountPromises = unmountUnloadPromises.concat(unloadPromises);
        const unmountAllPromise = Promise.all(allUnmountPromises);
        let unmountFinishedTime;
        unmountAllPromise.then(
          () => {
            if (__PROFILE__) {
              unmountFinishedTime = performance.now();

              addProfileEntry(
                "routing",
                "unmountAndUnload",
                profilerKind,
                startTime,
                performance.now(),
                true
              );
            }
            fireSingleSpaEvent(
              "before-mount-routing-event",
              getCustomEventDetail(true)
            );
          },
          (err) => {
            if (__PROFILE__) {
              addProfileEntry(
                "routing",
                "unmountAndUnload",
                profilerKind,
                startTime,
                performance.now(),
                true
              );
            }

            throw err;
          }
        );

        // （2）处理要加载的微应用
        // 执行bootstrap方法
        const loadThenMountPromises = appsToLoad.map((app) => {
          // 下面toLoadPromise函数在开始因为判断是否存在loadPromise属性而退出了
          return toLoadPromise(app).then((app) =>
            // 来到这里执行子应用的Bootstrap方法
            tryToBootstrapAndMount(app, unmountAllPromise)
          );
        });

        // （3）处理要挂载的微应用
        const mountPromises = appsToMount
          .filter((appToMount) => appsToLoad.indexOf(appToMount) < 0)
          .map((appToMount) => {
            return tryToBootstrapAndMount(appToMount, unmountAllPromise);
          });

        // 返回要卸载的微应用的promise
        return unmountAllPromise
          .catch((err) => {
            callAllEventListeners();
            throw err;
          })
          .then(() => {
            callAllEventListeners();
            return Promise.all(loadThenMountPromises.concat(mountPromises))
              .catch((err) => {
                pendingPromises.forEach((promise) => promise.reject(err));
                throw err;
              })
              .then(finishUpAndReturn)
              .then(
                () => {
                  if (__PROFILE__) {
                    addProfileEntry(
                      "routing",
                      "loadAndMount",
                      profilerKind,
                      unmountFinishedTime,
                      performance.now(),
                      true
                    );
                  }
                },
                (err) => {
                  if (__PROFILE__) {
                    addProfileEntry(
                      "routing",
                      "loadAndMount",
                      profilerKind,
                      unmountFinishedTime,
                      performance.now(),
                      false
                    );
                  }

                  throw err;
                }
              );
          });
      });
    });
  }

  function finishUpAndReturn() {
    const returnValue = getMountedApps();
    pendingPromises.forEach((promise) => promise.resolve(returnValue));

    try {
      const appChangeEventName =
        appsThatChanged.length === 0 ? "no-app-change" : "app-change";
      fireSingleSpaEvent(appChangeEventName, getCustomEventDetail());
      fireSingleSpaEvent("routing-event", getCustomEventDetail());
    } catch (err) {
      /* We use a setTimeout because if someone else's event handler throws an error, single-spa
       * needs to carry on. If a listener to the event throws an error, it's their own fault, not
       * single-spa's.
       */
      setTimeout(() => {
        throw err;
      });
    }

    /* Setting this allows for subsequent calls to reroute() to actually perform
     * a reroute instead of just getting queued behind the current reroute call.
     * We want to do this after the mounting/unmounting is done but before we
     * resolve the promise for the `reroute` function.
     */
    appChangeUnderway = false;

    if (peopleWaitingOnAppChange.length > 0) {
      /* While we were rerouting, someone else triggered another reroute that got queued.
       * So we need reroute again.
       */
      const nextPendingPromises = peopleWaitingOnAppChange;
      peopleWaitingOnAppChange = [];
      reroute(nextPendingPromises);
    }

    return returnValue;
  }

  function callAllEventListeners() {
    // During silent navigation (when navigation was canceled and we're going back to the old URL),
    // we should not fire any popstate / hashchange events
    if (!silentNavigation) {
      pendingPromises.forEach((pendingPromise) => {
        callCapturedEventListeners(pendingPromise.eventArguments);
      });

      callCapturedEventListeners(eventArguments);
    }
  }

  function getCustomEventDetail(isBeforeChanges = false, extraProperties) {
    const newAppStatuses = {};
    const appsByNewStatus = {
      // for apps that were mounted
      [MOUNTED]: [],
      // for apps that were unmounted
      [NOT_MOUNTED]: [],
      // apps that were forcibly unloaded
      [NOT_LOADED]: [],
      // apps that attempted to do something but are broken now
      [SKIP_BECAUSE_BROKEN]: [],
    };

    if (isBeforeChanges) {
      appsToLoad.concat(appsToMount).forEach((app, index) => {
        // 把appsToLoad和appsToMount的状态都设置为MOUNTED
        addApp(app, MOUNTED);
      });
      appsToUnload.forEach((app) => {
        addApp(app, NOT_LOADED);
      });
      appsToUnmount.forEach((app) => {
        addApp(app, NOT_MOUNTED);
      });
    } else {
      appsThatChanged.forEach((app) => {
        addApp(app);
      });
    }

    const result = {
      detail: {
        newAppStatuses, // key为每个微应用的名字，value为当前的状态
        appsByNewStatus, // key为每个状态，value为数组，里面是对应的应用
        totalAppChanges: appsThatChanged.length,
        originalEvent: eventArguments?.[0],
        oldUrl,
        newUrl,
      },
    };

    if (extraProperties) {
      assign(result.detail, extraProperties);
    }

    // 返回一个大对象
    return result;

    function addApp(app, status) {
      const appName = toName(app);
      status = status || getAppStatus(appName);
      newAppStatuses[appName] = status;
      const statusArr = (appsByNewStatus[status] =
        appsByNewStatus[status] || []);
      statusArr.push(appName);
    }
  }

  function fireSingleSpaEvent(name, eventProperties) {
    // 构造一个事件对象，并抛出，之前监听的回调函数可以执行了
    if (!silentNavigation) {
      window.dispatchEvent(
        // 这里传入的参数eventProperties是：
        // {
        //   detail: {
        //     newAppStatuses, // key为每个微应用的名字，value为当前的状态
        //     appsByNewStatus, // key为每个状态，value为数组，里面是对应的应用
        //     totalAppChanges: appsThatChanged.length,
        //     originalEvent: eventArguments?.[0],
        //     oldUrl,
        //     newUrl,
        //   },
        // }
        new CustomEvent(`single-spa:${name}`, eventProperties)
      );
    }
  }
}


export function getAppChanges() {
  const appsToUnload = [],
    appsToUnmount = [],
    appsToLoad = [],
    appsToMount = [];

  // We re-attempt to download applications in LOAD_ERROR after a timeout of 200 milliseconds
  const currentTime = new Date().getTime();

  // 在入口的注册函数，apps已经被加入了一个微应用，并且status为NOT_LOADED
  apps.forEach((app) => {
    const appShouldBeActive =
      app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app);

    switch (app.status) {
      case LOAD_ERROR:
        if (appShouldBeActive && currentTime - app.loadErrorTime >= 200) {
          appsToLoad.push(app);
        }
        break;

      // 如果是没有加载或者正在加载的，归类到appsToLoad数组
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) {
          appsToLoad.push(app);
        }
        break;
      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        if (!appShouldBeActive && getAppUnloadInfo(toName(app))) {
          appsToUnload.push(app);
        } else if (appShouldBeActive) {
          appsToMount.push(app);
        }
        break;
      case MOUNTED:
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }
        break;
    }
  });

  return { appsToUnload, appsToUnmount, appsToLoad, appsToMount };
}


// 检查当前是否已经执行了start函数
let started = false;

export function start(opts) {
  started = true;
  if (isInBrowser) {
    patchHistoryApi(opts);
    reroute();
  }
}

export function isStarted() {
  return started;
}






// 2.3 每个微应用的加载函数：改状态为正在加载 + 等待外部qiankun的app函数执行完毕


export function toLoadPromise(appOrParcel) {
  // 入参是apps数组里面的微应用整合对象

  // 返回一个promise，因为父函数后面也是promise，因此回到这里继续执行then回调
  return Promise.resolve().then(() => {
    // 判断这个微应用对象是否已经处理过了
    // 从loadThenMountPromises进来这里，就会因为已经有这个属性，就不进去了，直接返回之前的已经resolve的promise
    if (appOrParcel.loadPromise) {
      return appOrParcel.loadPromise;
    }

    if (
      appOrParcel.status !== NOT_LOADED &&
      appOrParcel.status !== LOAD_ERROR
    ) {
      return appOrParcel;
    }

    let startTime;

    if (__PROFILE__) {
      startTime = performance.now();
    }

    // 在这里状态改为【正在加载】
    appOrParcel.status = LOADING_SOURCE_CODE;

    let appOpts, isUserErr;

    // 继续返回一个promise，外部的all方法需要等到每个promise内部的所有then都执行完毕，外层的promise才会变为resolve状态
    // 因此这里继续执行这个then回调
    return (appOrParcel.loadPromise = Promise.resolve()
      .then(() => {

        // 拿到之前在sanitizeArguments函数挂到微应用对象上面的loadApp函数，也就是qiankun库里面registerMicroApps函数传入的app函数
        // 执行这个函数，得到一个promise（_asyncToGenerator函数生成的）
        const loadPromise = appOrParcel.loadApp(getProps(appOrParcel));
        if (!smellsLikeAPromise(loadPromise)) {
          isUserErr = true;
          throw Error(
            formatErrorMessage(
              33,
              __DEV__ &&
                `single-spa loading function did not return a promise. Check the second argument to registerApplication('${toName(
                  appOrParcel
                )}', loadingFunction, activityFunction)`,
              toName(appOrParcel)
            )
          );
        }

        // 然后挂上then函数，需要等到loadPromise完成，也就是子应用加载完毕！！
        // 至此回到【qiankun】的代码主战场
        return loadPromise.then((val) => {

          // qiankun的主代码app函数执行完了，回到【single-spa】
          // 拿到结果，里面是子应用的生命周期函数的集合对象
          // 也就是parcelConfig对象
          appOrParcel.loadErrorTime = null;
          appOpts = val;

          // 一些错误判断
          let validationErrMessage, validationErrCode;
          if (typeof appOpts !== "object") {
            validationErrCode = 34;
            if (__DEV__) {
              validationErrMessage = `does not export anything`;
            }
          }
          if (
            Object.prototype.hasOwnProperty.call(appOpts, "bootstrap") &&
            !validLifecycleFn(appOpts.bootstrap)
          ) {
            validationErrCode = 35;
            if (__DEV__) {
              validationErrMessage = `does not export a valid bootstrap function or array of functions`;
            }
          }
          if (!validLifecycleFn(appOpts.mount)) {
            validationErrCode = 36;
            if (__DEV__) {
              validationErrMessage = `does not export a mount function or array of functions`;
            }
          }
          if (!validLifecycleFn(appOpts.unmount)) {
            validationErrCode = 37;
            if (__DEV__) {
              validationErrMessage = `does not export a unmount function or array of functions`;
            }
          }
          const type = objectType(appOpts);
          if (validationErrCode) {
            let appOptsStr;
            try {
              appOptsStr = JSON.stringify(appOpts);
            } catch {}
            console.error(
              formatErrorMessage(
                validationErrCode,
                __DEV__ &&
                  `The loading function for single-spa ${type} '${toName(
                    appOrParcel
                  )}' resolved with the following, which does not have bootstrap, mount, and unmount functions`,
                type,
                toName(appOrParcel),
                appOptsStr
              ),
              appOpts
            );
            handleAppError(
              validationErrMessage,
              appOrParcel,
              SKIP_BECAUSE_BROKEN
            );
            return appOrParcel;
          }
          if (appOpts.devtools && appOpts.devtools.overlays) {
            appOrParcel.devtools.overlays = assign(
              {},
              appOrParcel.devtools.overlays,
              appOpts.devtools.overlays
            );
          }

          // 当子应用的代码已经loaded之后
          // 改变状态为【NOT_BOOTSTRAPPED】
          // 挂载生命周期函数
          appOrParcel.status = NOT_BOOTSTRAPPED;
          appOrParcel.bootstrap = flattenFnArray(appOpts, "bootstrap");
          appOrParcel.mount = flattenFnArray(appOpts, "mount");
          appOrParcel.unmount = flattenFnArray(appOpts, "unmount");
          appOrParcel.unload = flattenFnArray(appOpts, "unload");
          appOrParcel.timeouts = ensureValidAppTimeouts(appOpts.timeouts);

          delete appOrParcel.loadPromise;

          if (__PROFILE__) {
            addProfileEntry(
              "application",
              toName(appOrParcel),
              "load",
              startTime,
              performance.now(),
              true
            );
          }

          // 到这个时候这个微应用已经算是加载成功了，回到all方法那边
          return appOrParcel;
        });
      })
      .catch((err) => {
        delete appOrParcel.loadPromise;

        let newStatus;
        if (isUserErr) {
          newStatus = SKIP_BECAUSE_BROKEN;
        } else {
          newStatus = LOAD_ERROR;
          appOrParcel.loadErrorTime = new Date().getTime();
        }
        handleAppError(err, appOrParcel, newStatus);

        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(appOrParcel),
            "load",
            startTime,
            performance.now(),
            false
          );
        }

        return appOrParcel;
      }));
  });
}






// 3. 【回到qiankun】加载微应用


export function loadApp(_x3) {
  return _loadApp.apply(this, arguments);
}
function _loadApp() {
  _loadApp = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(app) {
    var _sandboxContainer, _sandboxContainer$ins;
    var configuration,
      lifeCycles,
      entry,
      appName,
      appInstanceId,
      markName,
      _configuration$singul,
      singular,
      _configuration$sandbo,
      sandbox,
      excludeAssetFilter,
      _configuration$global,
      globalContext,
      importEntryOpts,
      _yield$importEntry,
      template,
      execScripts,
      assetPublicPath,
      getExternalScripts,
      appContent,
      strictStyleIsolation,
      scopedCSS,
      initialAppWrapperElement,
      initialContainer,
      legacyRender,
      render,
      initialAppWrapperGetter,
      global,
      mountSandbox,
      unmountSandbox,
      useLooseSandbox,
      speedySandbox,
      sandboxContainer,
      _mergeWith,
      _mergeWith$beforeUnmo,
      beforeUnmount,
      _mergeWith$afterUnmou,
      afterUnmount,
      _mergeWith$afterMount,
      afterMount,
      _mergeWith$beforeMoun,
      beforeMount,
      _mergeWith$beforeLoad,
      beforeLoad,
      scriptExports,
      _getLifecyclesFromExp,
      bootstrap,
      mount,
      unmount,
      update,
      _getMicroAppStateActi,
      onGlobalStateChange,
      setGlobalState,
      offGlobalStateChange,
      syncAppWrapperElement2Sandbox,
      parcelConfigGetter,
      _args17 = arguments;
    return _regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) switch (_context17.prev = _context17.next) {

        // 3.1 第一步：通过fetch方法拉取写在主应用的配置项那边的entry的url的微应用资源
        // 包括html的fetch和css的fetch
        case 0:
          configuration = _args17.length > 1 && _args17[1] !== undefined ? _args17[1] : {};
          lifeCycles = _args17.length > 2 ? _args17[2] : undefined;
          entry = app.entry, appName = app.name;
          appInstanceId = genAppInstanceIdByName(appName);
          markName = "[qiankun] App ".concat(appInstanceId, " Loading");
          if (process.env.NODE_ENV === 'development') {
            performanceMark(markName);
          }
          _configuration$singul = configuration.singular, singular = _configuration$singul === void 0 ? false : _configuration$singul, _configuration$sandbo = configuration.sandbox, sandbox = _configuration$sandbo === void 0 ? true : _configuration$sandbo, excludeAssetFilter = configuration.excludeAssetFilter, _configuration$global = configuration.globalContext, globalContext = _configuration$global === void 0 ? window : _configuration$global, importEntryOpts = _objectWithoutProperties(configuration, _excluded); // get the entry html content and script executor
          _context17.next = 9;

          // !!!内部通过fetch请求这个entry的url
          // 返回一个大对象（里面的html字符串是已经处理过css的）
          return importEntry(entry, importEntryOpts);

        // 3.2 第二步：fetch里面的js资源，汇总结果
        case 9:
          _yield$importEntry = _context17.sent;
          // 保存上一步的一些变量到全局
          template = _yield$importEntry.template;
          execScripts = _yield$importEntry.execScripts;
          assetPublicPath = _yield$importEntry.assetPublicPath;
          getExternalScripts = _yield$importEntry.getExternalScripts;
          _context17.next = 16;

          // 执行importHTML里面传入的getExternalScripts函数
          // 返回一个js资源的汇总的数组
          return getExternalScripts();
        
        // 校验
        case 16:
          _context17.next = 18;
          return validateSingularMode(singular, app);
        case 18:
          if (!_context17.sent) {
            _context17.next = 21;
            break;
          }
          _context17.next = 21;
          return prevAppUnmountedDeferred && prevAppUnmountedDeferred.promise;
        
        // 3.3 第三步：往主应用的container上构造一个专属的div，把微应用的html放到这个专属div上
          case 21:
          // （1）把微应用的HTML模板字符串放入一个自定义的div里面
          appContent = getDefaultTplWrapper(appInstanceId, sandbox)(template);
          
          // 查看是否开启严格样式隔离
          strictStyleIsolation = _typeof(sandbox) === 'object' && !!sandbox.strictStyleIsolation;
          if (process.env.NODE_ENV === 'development' && strictStyleIsolation) {
            console.warn("[qiankun] strictStyleIsolation configuration will be removed in 3.0, pls don't depend on it or use experimentalStyleIsolation instead!");
          }
          // 查看是否开启实验性样式隔离
          scopedCSS = isEnableScopedCSS(sandbox);
          
          // （2）创建一个div，得到自定义有id，data-name的div
          initialAppWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId);
          initialContainer = 'container' in app ? app.container : undefined;
          legacyRender = 'render' in app ? app.render : undefined;

          // （3）确保每次应用加载前容器 dom 结构已经设置完毕
          // 返回一个函数，这个函数把自定义dom放到container的dom里面
          render = getRender(appInstanceId, appContent, legacyRender);
          render({
            element: initialAppWrapperElement,
            loading: true,
            container: initialContainer
          }, 'loading');

          // （4）开启沙箱环境
          initialAppWrapperGetter = getAppWrapperGetter(appInstanceId, !!legacyRender, strictStyleIsolation, scopedCSS, function () {
            return initialAppWrapperElement;
          });
          global = globalContext;
          mountSandbox = function mountSandbox() {
            return Promise.resolve();
          };
          unmountSandbox = function unmountSandbox() {
            return Promise.resolve();
          };
          useLooseSandbox = _typeof(sandbox) === 'object' && !!sandbox.loose; // enable speedy mode by default
          speedySandbox = _typeof(sandbox) === 'object' ? sandbox.speedy !== false : true;
          if (sandbox) {
            // 创建沙箱对象
            sandboxContainer = createSandboxContainer(
              appInstanceId,
              initialAppWrapperGetter,
              scopedCSS,
              useLooseSandbox,
              excludeAssetFilter,
              global,
              speedySandbox
            );
            // 用沙箱的代理对象作为接下来使用的全局对象
            global = sandboxContainer.instance.proxy;
            mountSandbox = sandboxContainer.mount;
            unmountSandbox = sandboxContainer.unmount;
          }

          // （5）处理主应用的生命周期函数，执行beforeLoad函数
          // 整合主应用所有生命周期函数到这个_mergeWith大对象
          _mergeWith = _mergeWith2({}, getAddOns(global, assetPublicPath), lifeCycles, function (v1, v2) {
            return _concat(v1 !== null && v1 !== void 0 ? v1 : [], v2 !== null && v2 !== void 0 ? v2 : []);
          }),
          _mergeWith$beforeUnmo = _mergeWith.beforeUnmount,
          beforeUnmount = _mergeWith$beforeUnmo === void 0 ? [] : _mergeWith$beforeUnmo,
          _mergeWith$afterUnmou = _mergeWith.afterUnmount,
          afterUnmount = _mergeWith$afterUnmou === void 0 ? [] : _mergeWith$afterUnmou,
          _mergeWith$afterMount = _mergeWith.afterMount,
          afterMount = _mergeWith$afterMount === void 0 ? [] : _mergeWith$afterMount,
          _mergeWith$beforeMoun = _mergeWith.beforeMount,
          beforeMount = _mergeWith$beforeMoun === void 0 ? [] : _mergeWith$beforeMoun,
          _mergeWith$beforeLoad = _mergeWith.beforeLoad,
          beforeLoad = _mergeWith$beforeLoad === void 0 ? [] : _mergeWith$beforeLoad;
          _context17.next = 40;

          // 针对beforeLoad数组构造promise链条，执行beforeLoad函数
          return execHooksChain(toArray(beforeLoad), app, global);

        // 3.4 第四步：执行js资源
        case 40:
          _context17.next = 42;
          // 执行importHTML里面传入的execScripts函数
          return execScripts(global, sandbox && !useLooseSandbox, {
            scopedGlobalVariables: speedySandbox ? cachedGlobals : []
          });

        // 3.5 第五步：处理子应用的生命周期函数
        case 42:
          scriptExports = _context17.sent;
          // scriptExports的结果是子应用生命周期的函数的集合对象

          // 校验子应用的生命周期函数！
          _getLifecyclesFromExp = getLifecyclesFromExports(
            scriptExports,
            appName,
            global,
            (_sandboxContainer = sandboxContainer) === null || _sandboxContainer === void 0
              ? void 0
              : (_sandboxContainer$ins = _sandboxContainer.instance) === null || _sandboxContainer$ins === void 0
                ? void 0
                : _sandboxContainer$ins.latestSetProp
          ),

          // 拿到子应用的生命周期函数
          bootstrap = _getLifecyclesFromExp.bootstrap,
          mount = _getLifecyclesFromExp.mount,
          unmount = _getLifecyclesFromExp.unmount,
          update = _getLifecyclesFromExp.update;

          // 配置应用间的状态通信机制
          // 返回一个对象，里面有发布订阅的方法
          _getMicroAppStateActi = getMicroAppStateActions(appInstanceId),
          onGlobalStateChange = _getMicroAppStateActi.onGlobalStateChange,
          setGlobalState = _getMicroAppStateActi.setGlobalState,
          offGlobalStateChange = _getMicroAppStateActi.offGlobalStateChange;

          syncAppWrapperElement2Sandbox = function syncAppWrapperElement2Sandbox(element) {
            return initialAppWrapperElement = element;
          };
          parcelConfigGetter = function parcelConfigGetter() {
            var remountContainer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialContainer;
            var appWrapperElement;
            var appWrapperGetter;
            var parcelConfig = {
              name: appInstanceId,
              bootstrap: bootstrap,
              mount: [
                // （1）性能标注
                _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
                  var marks;
                  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {

                      case 0:
                        if (process.env.NODE_ENV === 'development') {
                          marks = performanceGetEntriesByName(markName, 'mark'); // mark length is zero means the app is remounting
                          if (marks && !marks.length) {
                            performanceMark(markName);
                          }
                        }
                      case 1:
                      case "end":
                        return _context2.stop();
                    }
                  }, _callee2);

                })),

                // （2）单例模式验证
                _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
                  return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return validateSingularMode(singular, app);
                      case 2:
                        _context3.t0 = _context3.sent;
                        if (!_context3.t0) {
                          _context3.next = 5;
                          break;
                        }
                        _context3.t0 = prevAppUnmountedDeferred;
                      case 5:
                        if (!_context3.t0) {
                          _context3.next = 7;
                          break;
                        }
                        return _context3.abrupt("return", prevAppUnmountedDeferred.promise);
                      case 7:
                        return _context3.abrupt("return", undefined);
                      case 8:
                      case "end":
                        return _context3.stop();
                    }
                  }, _callee3);
                })),
                
                // （3）再次准备容器
                _asyncToGenerator(_regeneratorRuntime.mark(function _callee4() {
                  return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) switch (_context4.prev = _context4.next) {
                      case 0:
                        // initialAppWrapperElement是自定义有id，data-name的div
                        appWrapperElement = initialAppWrapperElement;
                        // 返回的是一个函数
                        appWrapperGetter = getAppWrapperGetter(appInstanceId, !!legacyRender, strictStyleIsolation, scopedCSS, function () {
                          return appWrapperElement;
                        });
                      case 2:
                      case "end":
                        return _context4.stop();
                    }
                  }, _callee4);
                })),

                // （4）二次保证DOM容器已经被创建
                // 添加 mount hook, 确保每次应用加载前容器 dom 结构已经设置完毕
                _asyncToGenerator(_regeneratorRuntime.mark(function _callee5() {
                  var useNewContainer;
                  return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) switch (_context5.prev = _context5.next) {
                      case 0:
                        useNewContainer = remountContainer !== initialContainer;
                        if (useNewContainer || !appWrapperElement) {
                          appWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId);
                          syncAppWrapperElement2Sandbox(appWrapperElement);
                        }
                        // appWrapperElement是自定义的专属div
                        // remountContainer是主应用注册的时候传入的container，也就是#qiankun-root
                        // 这里即使进去也不会重新创建一个dom，因为判断#qiankun-root下面已经包含了自定义的专属div
                        // 【只是在做保证工作】
                        render({
                          element: appWrapperElement,
                          loading: true,
                          container: remountContainer
                        }, 'mounting');
                      case 3:
                      case "end":
                        return _context5.stop();
                    }
                  }, _callee5);
                })),

                // （5）沙箱挂载
                mountSandbox,

                // （6）执行！主应用！的beforeMount函数
                _asyncToGenerator(_regeneratorRuntime.mark(function _callee6() {
                  return _regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) switch (_context6.prev = _context6.next) {
                      case 0:
                        return _context6.abrupt("return", execHooksChain(toArray(beforeMount), app, global));
                      case 1:
                      case "end":
                        return _context6.stop();
                    }
                  }, _callee6);
                })),

                // （7）执行子应用的mount函数，子应用那边开始执行render函数（react的root.render函数）
                // Q：子应用怎么拿到root？
                // A：container.querySelector('#microapp-itself-root')这个时候的子应用的html已经被加入到专属div下面了
                function () {
                  var _ref7 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee7(props) {
                    // 这里的props对象如下：
                    // mountParcel: ƒ ()
                    // name: "OTAMicroApp"
                    // singleSpa: {…}
                    return _regeneratorRuntime.wrap(function _callee7$(_context7) {
                      while (1) switch (_context7.prev = _context7.next) {
                        case 0:
                          // 子应用那边执行mount函数传入的props对象如下：
                          // container: div#__qiankun_microapp_wrapper_for_ota_micro_app__
                          // mountParcel: ƒ ()
                          // name: "OTAMicroApp"
                          // onGlobalStateChange: ƒ onGlobalStateChange(callback, fireImmediately)
                          // setGlobalState: ƒ setGlobalState()
                          // singleSpa: {…}
                          return _context7.abrupt("return", mount(_objectSpread(_objectSpread({}, props), {}, {
                            // 给子应用的mount函数传入的额外的参数
                            // container就是专属的div
                            container: appWrapperGetter(),
                            setGlobalState: setGlobalState,
                            onGlobalStateChange: onGlobalStateChange
                          })));
                        case 1:
                        case "end":
                          return _context7.stop();
                      }
                    }, _callee7);
                  }));
                  return function (_x4) {
                    return _ref7.apply(this, arguments);
                  };
                }(),

                // （8）三次保证DOM容器已经被创建
                _asyncToGenerator(_regeneratorRuntime.mark(function _callee8() {
                  return _regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) switch (_context8.prev = _context8.next) {
                      case 0:
                        return _context8.abrupt("return", render({
                          element: appWrapperElement,
                          loading: false,
                          container: remountContainer
                        }, 'mounted'));
                      case 1:
                      case "end":
                        return _context8.stop();
                    }
                  }, _callee8);
                })),

                // （9）执行！主应用！的afterMount函数
                _asyncToGenerator(_regeneratorRuntime.mark(function _callee9() {
                  return _regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) switch (_context9.prev = _context9.next) {
                      case 0:
                        return _context9.abrupt("return", execHooksChain(toArray(afterMount), app, global));
                      case 1:
                      case "end":
                        return _context9.stop();
                    }
                  }, _callee9);
                })),

                // （10）校验
                _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10() {
                  return _regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) switch (_context10.prev = _context10.next) {
                      case 0:
                        _context10.next = 2;
                        return validateSingularMode(singular, app);
                      case 2:
                        if (!_context10.sent) {
                          _context10.next = 4;
                          break;
                        }
                        prevAppUnmountedDeferred = new Deferred();
                      case 4:
                      case "end":
                        return _context10.stop();
                    }
                  }, _callee10);
                })),
                
                // （11）性能测量
                _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11() {
                  var measureName;
                  return _regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) switch (_context11.prev = _context11.next) {
                      case 0:
                        if (process.env.NODE_ENV === 'development') {
                          measureName = "[qiankun] App ".concat(appInstanceId, " Loading Consuming");
                          performanceMeasure(measureName, markName);
                        }
                      case 1:
                      case "end":
                        return _context11.stop();
                    }
                  }, _callee11);
                }))
              ],
              unmount: [/*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12() {
                return _regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) switch (_context12.prev = _context12.next) {
                    case 0:
                      return _context12.abrupt("return", execHooksChain(toArray(beforeUnmount), app, global));
                    case 1:
                    case "end":
                      return _context12.stop();
                  }
                }, _callee12);
              })), /*#__PURE__*/function () {
                var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(props) {
                  return _regeneratorRuntime.wrap(function _callee13$(_context13) {
                    while (1) switch (_context13.prev = _context13.next) {
                      case 0:
                        return _context13.abrupt("return", unmount(_objectSpread(_objectSpread({}, props), {}, {
                          container: appWrapperGetter()
                        })));
                      case 1:
                      case "end":
                        return _context13.stop();
                    }
                  }, _callee13);
                }));
                return function (_x5) {
                  return _ref13.apply(this, arguments);
                };
              }(), unmountSandbox, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14() {
                return _regeneratorRuntime.wrap(function _callee14$(_context14) {
                  while (1) switch (_context14.prev = _context14.next) {
                    case 0:
                      return _context14.abrupt("return", execHooksChain(toArray(afterUnmount), app, global));
                    case 1:
                    case "end":
                      return _context14.stop();
                  }
                }, _callee14);
              })), /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15() {
                return _regeneratorRuntime.wrap(function _callee15$(_context15) {
                  while (1) switch (_context15.prev = _context15.next) {
                    case 0:
                      render({
                        element: null,
                        loading: false,
                        container: remountContainer
                      }, 'unmounted');
                      offGlobalStateChange(appInstanceId);
                      // for gc
                      appWrapperElement = null;
                      syncAppWrapperElement2Sandbox(appWrapperElement);
                    case 4:
                    case "end":
                      return _context15.stop();
                  }
                }, _callee15);
              })), /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16() {
                return _regeneratorRuntime.wrap(function _callee16$(_context16) {
                  while (1) switch (_context16.prev = _context16.next) {
                    case 0:
                      _context16.next = 2;
                      return validateSingularMode(singular, app);
                    case 2:
                      _context16.t0 = _context16.sent;
                      if (!_context16.t0) {
                        _context16.next = 5;
                        break;
                      }
                      _context16.t0 = prevAppUnmountedDeferred;
                    case 5:
                      if (!_context16.t0) {
                        _context16.next = 7;
                        break;
                      }
                      prevAppUnmountedDeferred.resolve();
                    case 7:
                    case "end":
                      return _context16.stop();
                  }
                }, _callee16);
              }))]
            };
            if (typeof update === 'function') {
              parcelConfig.update = update;
            }
            return parcelConfig;
          };

          // 执行parcelConfigGetter函数，返回一个子应用的对象！
          return _context17.abrupt("return", parcelConfigGetter);
        case 48:
        case "end":
          return _context17.stop();
      }
    }, _callee17);
  }));
  return _loadApp.apply(this, arguments);
}



 
// 3.1 【import-html-entry】通过fetch拉取微应用的html资源

export function importEntry(entry) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _opts$fetch3 = opts.fetch,
    fetch = _opts$fetch3 === void 0 ? defaultFetch : _opts$fetch3,
    _opts$getTemplate = opts.getTemplate,
    getTemplate = _opts$getTemplate === void 0 ? defaultGetTemplate : _opts$getTemplate,
    postProcessTemplate = opts.postProcessTemplate;
  var getPublicPath = opts.getPublicPath || opts.getDomain || defaultGetPublicPath;
  if (!entry) {
    throw new SyntaxError('entry should not be empty!');
  }


  if (typeof entry === 'string') {

    // 去拉取这个url的index.html
    return importHTML(entry, {
      fetch: fetch,
      getPublicPath: getPublicPath,
      getTemplate: getTemplate,
      postProcessTemplate: postProcessTemplate
    });
  }

  // 不走下面！
  if (Array.isArray(entry.scripts) || Array.isArray(entry.styles)) {
    var _entry$scripts = entry.scripts,
      scripts = _entry$scripts === void 0 ? [] : _entry$scripts,
      _entry$styles = entry.styles,
      styles = _entry$styles === void 0 ? [] : _entry$styles,
      _entry$html = entry.html,
      html = _entry$html === void 0 ? '' : _entry$html;
    var getHTMLWithStylePlaceholder = function getHTMLWithStylePlaceholder(tpl) {
      return styles.reduceRight(function (html, styleSrc) {
        return "".concat(genLinkReplaceSymbol(styleSrc)).concat(html);
      }, tpl);
    };
    var getHTMLWithScriptPlaceholder = function getHTMLWithScriptPlaceholder(tpl) {
      return scripts.reduce(function (html, scriptSrc) {
        return "".concat(html).concat(genScriptReplaceSymbol(scriptSrc));
      }, tpl);
    };
    return getEmbedHTML(getTemplate(getHTMLWithScriptPlaceholder(getHTMLWithStylePlaceholder(html))), styles, {
      fetch: fetch
    }).then(function (embedHTML) {
      return {
        template: embedHTML,
        assetPublicPath: getPublicPath(entry),
        getExternalScripts: function getExternalScripts() {
          return _getExternalScripts(scripts, fetch);
        },
        getExternalStyleSheets: function getExternalStyleSheets() {
          return _getExternalStyleSheets(styles, fetch);
        },
        execScripts: function execScripts(proxy, strictGlobal) {
          var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
          if (!scripts.length) {
            return Promise.resolve();
          }
          return _execScripts(scripts[scripts.length - 1], scripts, proxy, _objectSpread({
            fetch: fetch,
            strictGlobal: strictGlobal
          }, opts));
        }
      };
    });
  } else {
    throw new SyntaxError('entry scripts or styles should be array!');
  }
}


export default function importHTML(url) {
  // url就是entry，比如https://xxx.com
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var fetch = defaultFetch;
  var autoDecodeResponse = false;
  var getPublicPath = defaultGetPublicPath;
  var getTemplate = defaultGetTemplate;
  var postProcessTemplate = opts.postProcessTemplate;

  // fetch方法支持外部的配置
  if (typeof opts === 'function') {
    fetch = opts;
  } else {
    if (opts.fetch) {
      if (typeof opts.fetch === 'function') {
        fetch = opts.fetch;
      } else {
        fetch = opts.fetch.fn || defaultFetch;
        autoDecodeResponse = !!opts.fetch.autoDecodeResponse;
      }
    }
    getPublicPath = opts.getPublicPath || opts.getDomain || defaultGetPublicPath;
    getTemplate = opts.getTemplate || defaultGetTemplate;
  }

  // 用fetch拉取url资源
  return embedHTMLCache[url] || (embedHTMLCache[url] = fetch(url).then(function (response) {
    // 这里拿到的response是一个对象，长这样：
    // body : (...)
    // bodyUsed: false
    // headers: Headers {}
    // ok: true
    // redirected: false
    // status: 200
    // statusText: "OK"
    // type: "cors"
    // url: "https://jdxota-beta-ui.jdl.cn/"

    // 读取response的body，第二个参数autoDecodeResponse是false
    return readResAsString(response, autoDecodeResponse);
  }).then(function (html) {
    // 这个时候的html是子应用的整个index.html的字符串

    // 去defaultGetPublicPath，返回子应用末尾加上了/的url
    var assetPublicPath = getPublicPath(url);

    // 处理html（用正则提取style和script资源，保存到数组，返回一个汇总对象）
    var _processTpl = processTpl(getTemplate(html), assetPublicPath, postProcessTemplate),
      template = _processTpl.template,
      scripts = _processTpl.scripts,
      entry = _processTpl.entry,
      styles = _processTpl.styles;

    // 去fetch里面的link的css资源，然后读取内容之后用<style>标签包裹替换原本的link标签，放入html字符串里面
    return getEmbedHTML(template, styles, {
      fetch: fetch
    }).then(function (embedHTML) {
      // 最后对外返回一个大对象，此时还没去fetch里面的js资源
      // 外面的函数会执行大对象里面的getExternalScripts函数，去fetch里面的js资源
      return {
        template: embedHTML,
        assetPublicPath: assetPublicPath,
        getExternalScripts: function getExternalScripts() {
          return _getExternalScripts(scripts, fetch);
        },
        getExternalStyleSheets: function getExternalStyleSheets() {
          return _getExternalStyleSheets(styles, fetch);
        },
        execScripts: function execScripts(proxy, strictGlobal) {
          // proxy是沙箱
          // strictGlobal是true
          var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
          if (!scripts.length) {
            return Promise.resolve();
          }
          // 执行js
          return _execScripts(entry, scripts, proxy, _objectSpread({
            fetch: fetch,
            strictGlobal: strictGlobal
          }, opts));
        }
      };
    });
  }));
}

export function readResAsString(response, autoDetectCharset) {
  // 未启用自动检测
  if (!autoDetectCharset) {
    // 返回的 Response 对象会提供 .text() 方法
    // 用于将响应体（Response Body）解析为字符串
    return response.text();
  }

  // 如果没headers，发生在test环境下的mock数据，为兼容原有测试用例
  if (!response.headers) {
    return response.text();
  }

  // 如果没返回content-type，走默认逻辑
  var contentType = response.headers.get('Content-Type');
  if (!contentType) {
    return response.text();
  }

  // 解析content-type内的charset
  // Content-Type: text/html; charset=utf-8
  // Content-Type: multipart/form-data; boundary=something
  // GET请求下不会出现第二种content-type
  var charset = 'utf-8';
  var parts = contentType.split(';');
  if (parts.length === 2) {
    var _parts$1$split = parts[1].split('='),
      _parts$1$split2 = _slicedToArray(_parts$1$split, 2),
      value = _parts$1$split2[1];
    var encoding = value && value.trim();
    if (encoding) {
      charset = encoding;
    }
  }

  // 如果还是utf-8，那么走默认，兼容原有逻辑，这段代码删除也应该工作
  if (charset.toUpperCase() === 'UTF-8') {
    return response.text();
  }

  // 走流读取，编码可能是gbk，gb2312等，比如sofa 3默认是gbk编码
  return response.blob().then(function (file) {
    return new Promise(function (resolve, reject) {
      var reader = new window.FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsText(file, charset);
    });
  });
}


export function defaultGetPublicPath(entry) {
  if (_typeof(entry) === 'object') {
    return '/';
  }
  try {
    // entry是子应用的url，location.href是主应用的当前的url
    var _URL = new URL(entry, location.href),
      // origin是子应用的url，等于entry
      origin = _URL.origin,
      // pathname是/
      pathname = _URL.pathname;
    var paths = pathname.split('/');
    paths.pop();
    // 最后得到的url是https://xxx.com/
    // 子应用的entry末尾加上了/
    return "".concat(origin).concat(paths.join('/'), "/");
  } catch (e) {
    console.warn(e);
    return '';
  }
}

export default function processTpl(tpl, baseURI, postProcessTemplate) {
  // 入参：
  // tpl是整个html字符串
  // baseURI是子应用末尾加上了/的url
  // postProcessTemplate是undefined

  var scripts = [];
  var styles = [];
  var entry = null;
  var moduleSupport = isModuleScriptSupported();
  var template = tpl

  // 1. 去掉注释
  .replace(HTML_COMMENT_REGEX, '')
  .replace(HTML_COMMENT_REGEX, '')

  // 2. 处理link标签
  .replace(LINK_TAG_REGEX, function (match) {
    var styleType = !!match.match(STYLE_TYPE_REGEX);
    if (styleType) {
      var styleHref = match.match(STYLE_HREF_REGEX);
      var styleIgnore = match.match(LINK_IGNORE_REGEX);
      // 如果是style类型的link标签，并且有href属性
      if (styleHref) {
        var href = styleHref && styleHref[2];
        var newHref = href;
        // 构造一个完整的url，类似于"https://xxx.com/css/main-111.min.css"
        if (href && !hasProtocol(href)) {
          newHref = getEntirePath(href, baseURI);
        }
        if (styleIgnore) {
          return genIgnoreAssetReplaceSymbol(newHref);
        }
        newHref = parseUrl(newHref);
        // url保存到style数组
        styles.push(newHref);

        // 将原来的<link>标签注释掉
        return genLinkReplaceSymbol(newHref);
      }
    }
    var preloadOrPrefetchType = match.match(LINK_PRELOAD_OR_PREFETCH_REGEX) && match.match(LINK_HREF_REGEX) && !match.match(LINK_AS_FONT);
    if (preloadOrPrefetchType) {
      var _match$match = match.match(LINK_HREF_REGEX),
        _match$match2 = _slicedToArray(_match$match, 3),
        linkHref = _match$match2[2];
      return genLinkReplaceSymbol(linkHref, true);
    }
    return match;
  })

  // 3. 处理style标签
  .replace(STYLE_TAG_REGEX, function (match) {
    if (STYLE_IGNORE_REGEX.test(match)) {
      return genIgnoreAssetReplaceSymbol('style file');
    }
    return match;
  })

  // 4. 处理script标签（每个script标签都会处理）
  .replace(ALL_SCRIPT_REGEX, function (match, scriptTag) {
    var scriptIgnore = scriptTag.match(SCRIPT_IGNORE_REGEX);
    var moduleScriptIgnore = moduleSupport && !!scriptTag.match(SCRIPT_NO_MODULE_REGEX) || !moduleSupport && !!scriptTag.match(SCRIPT_MODULE_REGEX);

    // 获取script标签的type属性
    var matchedScriptTypeMatch = scriptTag.match(SCRIPT_TYPE_REGEX);
    var matchedScriptType = matchedScriptTypeMatch && matchedScriptTypeMatch[2];
    if (!isValidJavaScriptType(matchedScriptType)) {
      return match;
    }

    // 如果是外部的script标签
    if (SCRIPT_TAG_REGEX.test(match) && scriptTag.match(SCRIPT_SRC_REGEX)) {

      // 获取script标签的src属性
      var matchedScriptEntry = scriptTag.match(SCRIPT_ENTRY_REGEX);
      var matchedScriptSrcMatch = scriptTag.match(SCRIPT_SRC_REGEX);
      var matchedScriptSrc = matchedScriptSrcMatch && matchedScriptSrcMatch[2];
      if (entry && matchedScriptEntry) {
        throw new SyntaxError('You should not set multiply entry script!');
      }

      // 构造一个完整的url，类似于"https://xxx.com/js/main-111.js"
      if (matchedScriptSrc) {
        if (!hasProtocol(matchedScriptSrc)) {
          // 原本的src是相对路径，没有前面的协议，在这里构造一个完整的url
          matchedScriptSrc = getEntirePath(matchedScriptSrc, baseURI);
        }
        matchedScriptSrc = parseUrl(matchedScriptSrc);
      }
      entry = entry || matchedScriptEntry && matchedScriptSrc;
      if (scriptIgnore) {
        return genIgnoreAssetReplaceSymbol(matchedScriptSrc || 'js file');
      }
      if (moduleScriptIgnore) {
        return genModuleScriptReplaceSymbol(matchedScriptSrc || 'js file', moduleSupport);
      }

      // 保存到scripts数组
      if (matchedScriptSrc) {
        var asyncScript = !!scriptTag.match(SCRIPT_ASYNC_REGEX);
        var crossOriginScript = !!scriptTag.match(SCRIPT_CROSSORIGIN_REGEX);
        scripts.push(asyncScript || crossOriginScript ? {
          async: asyncScript,
          src: matchedScriptSrc,
          crossOrigin: crossOriginScript
        } : matchedScriptSrc);

        // 将原来的<script>标签注释掉
        return genScriptReplaceSymbol(matchedScriptSrc, asyncScript, crossOriginScript);
      }
      return match;
    } else {
      if (scriptIgnore) {
        return genIgnoreAssetReplaceSymbol('js file');
      }
      if (moduleScriptIgnore) {
        return genModuleScriptReplaceSymbol('js file', moduleSupport);
      }

      // if it is an inline script
      var code = getInlineCode(match);

      // remove script blocks when all of these lines are comments.
      var isPureCommentBlock = code.split(/[\r\n]+/).every(function (line) {
        return !line.trim() || line.trim().startsWith('//');
      });
      if (!isPureCommentBlock) {
        scripts.push(match);
      }
      return inlineScriptReplaceSymbol;
    }
  });

  // 全部处理结束之后
  scripts = scripts.filter(function (script) {
    return !!script;
  });
  var tplResult = {
    template: template,
    scripts: scripts,
    styles: styles,
    entry: entry || scripts[scripts.length - 1]
  };
  if (typeof postProcessTemplate === 'function') {
    tplResult = postProcessTemplate(tplResult);
  }

  // 汇总全部资源路径，返回一个对象
  return tplResult;
}

function getEntirePath(path, baseURI) {
  return new URL(path, baseURI).toString();
}

// 转换 url 中的转义字符，例如 &amp; => &
export function parseUrl(url) {
  var parser = new DOMParser();
  var html = "<script src=\"".concat(url, "\"></script>");
  var doc = parser.parseFromString(html, "text/html");
  return doc.scripts[0].src;
}

export var genLinkReplaceSymbol = function genLinkReplaceSymbol(linkHref) {
  var preloadOrPrefetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return "<!-- ".concat(preloadOrPrefetch ? 'prefetch/preload' : '', " link ").concat(linkHref, " replaced by import-html-entry -->");
};

export var genScriptReplaceSymbol = function genScriptReplaceSymbol(scriptSrc) {
  var async = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var crossOrigin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return "<!-- ".concat(crossOrigin ? 'cors' : '', " ").concat(async ? 'async' : '', " script ").concat(scriptSrc, " replaced by import-html-entry -->");
};

function getEmbedHTML(template, styles) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _opts$fetch = opts.fetch,
    fetch = _opts$fetch === void 0 ? defaultFetch : _opts$fetch;
  var embedHTML = template;

  // 处理外部的style资源
  return _getExternalStyleSheets(styles, fetch).then(function (styleSheets) {
    // 得到的styleSheets是一个数组，每个元素都是一个对象，有src和value两个属性
    embedHTML = styleSheets.reduce(function (html, styleSheet) {
      var styleSrc = styleSheet.src;
      var styleSheetContent = styleSheet.value;
      // 把这个外部的css放入<style>标签里面，再放入html里面（替换掉原本的<link>标签）
      html = html.replace(genLinkReplaceSymbol(styleSrc), isInlineCode(styleSrc) ? "".concat(styleSrc) : "<style>/* ".concat(styleSrc, " */").concat(styleSheetContent, "</style>"));
      return html;
    }, embedHTML);
    return embedHTML;
  });
}


function _getExternalStyleSheets(styles) {
  var fetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultFetch;
  return allSettledButCanBreak(styles.map( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(styleLink) {
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            // 处理内联样式
            if (!isInlineCode(styleLink)) {
              _context.next = 4;
              break;
            }
            return _context.abrupt("return", getInlineCode(styleLink));
          case 4:
            // 处理外部样式
            // 发起网络请求并将 Promise 存入缓存
            return _context.abrupt("return", styleCache[styleLink] || (styleCache[styleLink] = fetch(styleLink).then(function (response) {
              if (response.status >= 400) {
                throw new Error("".concat(styleLink, " load failed with status ").concat(response.status));
              }
              // 返回相应的文本内容
              return response.text();
            })["catch"](function (e) {
              try {
                if (e.message.indexOf(styleLink) === -1) {
                  e.message = "".concat(styleLink, " ").concat(e.message);
                }
              } catch (_) {
                // e.message 可能是 readonly，此时会触发异常
              }
              throw e;
            })));
          case 5:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }())).then(function (results) {
    return results.map(function (result, i) {
      // 得到的results是一个对象，有status和value两个属性
      if (result.status === 'fulfilled') {
        // 重写value属性
        result.value = {
          src: styles[i],
          value: result.value
        };
      }
      return result;
    }).filter(function (result) {
      // 忽略失败的请求，避免异常下载阻塞后续资源加载
      if (result.status === 'rejected') {
        Promise.reject(result.reason);
      }
      return result.status === 'fulfilled';
    }).map(function (result) {
      return result.value;
    });
  });
}

var isInlineCode = function isInlineCode(code) {
  return code.startsWith('<');
};





// 3.2 加载微应用的js资源


function _getExternalScripts(scripts) {
  var fetch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultFetch;
  var entry = arguments.length > 2 ? arguments[2] : undefined;
  var fetchScript = function fetchScript(scriptUrl, opts) {
    return scriptCache[scriptUrl] || (scriptCache[scriptUrl] = fetch(scriptUrl, opts).then(function (response) {
      if (response.status >= 400) {
        throw new Error("".concat(scriptUrl, " load failed with status ").concat(response.status));
      }
      return response.text();
    })["catch"](function (e) {
      try {
        if (e.message.indexOf(scriptUrl) === -1) {
          e.message = "".concat(scriptUrl, " ").concat(e.message);
        }
      } catch (_) {
        // e.message 可能是 readonly，此时会触发异常
      }
      throw e;
    }));
  };

  // entry js 下载失败应该直接 break
  var shouldBreakWhileError = function shouldBreakWhileError(i) {
    return scripts[i] === entry;
  };
  // 对scripts数组进行逐一的fetch操作
  // fetch是异步的，因此会首先遍历完数组，把全部的js都去执行fetchScript函数
  return allSettledButCanBreak(scripts.map( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(script) {
      var src, async, crossOrigin, fetchOpts;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {

          // 处理内联的<script>标签的js资源
          case 0:
            if (!(typeof script === 'string')) {
              _context2.next = 8;
              break;
            }
            if (!isInlineCode(script)) {
              _context2.next = 5;
              break;
            }
            return _context2.abrupt("return", getInlineCode(script));

          // 处理外部js资源，需要去请求
          case 5:
            return _context2.abrupt("return", fetchScript(script));
          case 6:
            _context2.next = 13;
            break;
          case 8:
            // use idle time to load async script
            src = script.src, async = script.async, crossOrigin = script.crossOrigin;
            fetchOpts = crossOrigin ? {
              credentials: 'include'
            } : {};
            if (!async) {
              _context2.next = 12;
              break;
            }
            return _context2.abrupt("return", {
              src: src,
              async: true,
              content: new Promise(function (resolve, reject) {
                return requestIdleCallback(function () {
                  return fetchScript(src, fetchOpts).then(resolve, reject);
                });
              })
            });
          case 12:
            return _context2.abrupt("return", fetchScript(src, fetchOpts));
          case 13:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }()), shouldBreakWhileError).then(function (results) {

    // 最后拿到全部结果的js的字符串的数组
    return results.map(function (result, i) {
      if (result.status === 'fulfilled') {
        result.value = {
          src: scripts[i],
          value: result.value
        };
      }
      return result;
    }).filter(function (result) {
      // 忽略失败的请求，避免异常下载阻塞后续资源加载
      if (result.status === 'rejected') {
        Promise.reject(result.reason);
      }
      return result.status === 'fulfilled';
    }).map(function (result) {
      return result.value;
    });
  });
}



// 3.3 往主应用的container上构造一个专属的div，把微应用的html放到这个专属div上


export function getDefaultTplWrapper(name, sandboxOpts) {
  // name是微应用的名称
  // sandboxOpts是true
  return function (tpl) {
    // tpl是已经处理过css的html模板字符串
    var tplWithSimulatedHead;
    if (tpl.indexOf('<head>') !== -1) {
      // 把<head>标签换成自定义的标签，比如<qiankun-head>
      tplWithSimulatedHead = tpl.replace('<head>', "<".concat(qiankunHeadTagName, ">")).replace('</head>', "</".concat(qiankunHeadTagName, ">"));
    } else {
      tplWithSimulatedHead = "<".concat(qiankunHeadTagName, "></").concat(qiankunHeadTagName, ">").concat(tpl);
    }
    // 返回一个主应用的container下面的div标签，把微应用的html模板字符串（tplWithSimulatedHead）塞进去
    return "<div id=\"".concat(getWrapperId(name), "\" data-name=\"").concat(name, "\" data-version=\"").concat(version, "\" data-sandbox-cfg=").concat(JSON.stringify(sandboxOpts), ">").concat(tplWithSimulatedHead, "</div>");
  };
}

export function getWrapperId(name) {
  return "__qiankun_microapp_wrapper_for_".concat(_snakeCase(name), "__");
}


export function isEnableScopedCSS(sandbox) {
  if (_typeof(sandbox) !== 'object') {
    return false;
  }
  if (sandbox.strictStyleIsolation) {
    return false;
  }
  return !!sandbox.experimentalStyleIsolation;
}


// 创建qiankun的为微应用服务的专属div
function createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId) {
  // 入参：
  // appContent就是包含了微应用的html模板字符串
  // appInstanceId是微应用的name
  // strictStyleIsolation和scopedCSS都是false

  var containerElement = document.createElement('div');
  containerElement.innerHTML = appContent;

  var appElement = containerElement.firstChild;
  if (strictStyleIsolation) {
    if (!supportShadowDOM) {
      console.warn('[qiankun]: As current browser not support shadow dom, your strictStyleIsolation configuration will be ignored!');
    } else {
      var innerHTML = appElement.innerHTML;
      appElement.innerHTML = '';
      var shadow;
      if (appElement.attachShadow) {
        shadow = appElement.attachShadow({
          mode: 'open'
        });
      } else {
        // createShadowRoot was proposed in initial spec, which has then been deprecated
        shadow = appElement.createShadowRoot();
      }
      shadow.innerHTML = innerHTML;
    }
  }
  if (scopedCSS) {
    var attr = appElement.getAttribute(css.QiankunCSSRewriteAttr);
    if (!attr) {
      appElement.setAttribute(css.QiankunCSSRewriteAttr, appInstanceId);
    }
    var styleNodes = appElement.querySelectorAll('style') || [];
    _forEach(styleNodes, function (stylesheetElement) {
      css.process(appElement, stylesheetElement, appInstanceId);
    });
  }
  // 返回这个div的第一个孩子，也就是自定义的有id，data-name等属性的div
  return appElement;
}



function getRender(appInstanceId, appContent, legacyRender) {
  // 入参：
  // appContent就是包含了微应用的html模板字符串
  // appInstanceId是微应用的name
  // legacyRender是undefined

  var render = function render(_ref, phase) {
    // 入参：
    // _ref是一个对象
    // {
    //   element: 自定义的div的dom,
    //   loading: true,
    //   container: 主应用的container的字符串，如：#micro-app
    // }
    // phase是‘loading’

    var element = _ref.element,
      loading = _ref.loading,
      container = _ref.container;
    if (legacyRender) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[qiankun] Custom rendering function is deprecated and will be removed in 3.0, you can use the container element setting instead!');
      }
      return legacyRender({
        loading: loading,
        appContent: element ? appContent : ''
      });
    }

    // 拿到主应用的container的dom
    var containerElement = getContainer(container);

    // 检验dom是否存在
    if (phase !== 'unmounted') {
      var errorMsg = function () {
        switch (phase) {
          case 'loading':
          case 'mounting':
            return "Target container with ".concat(container, " not existed while ").concat(appInstanceId, " ").concat(phase, "!");
          case 'mounted':
            return "Target container with ".concat(container, " not existed after ").concat(appInstanceId, " ").concat(phase, "!");
          default:
            return "Target container with ".concat(container, " not existed while ").concat(appInstanceId, " rendering!");
        }
      }();
      assertElementExist(containerElement, errorMsg);
    }

    // 把自定义的div加入到主应用的container里面
    if (containerElement && !containerElement.contains(element)) {
      // 清除原有的container的孩子
      while (containerElement.firstChild) {
        rawRemoveChild.call(containerElement, containerElement.firstChild);
      }
      if (element) {
        rawAppendChild.call(containerElement, element);
      }
    }
    return undefined;
  };
  return render;
}

export function getContainer(container) {
  return typeof container === 'string' ? document.querySelector(container) : container;
}

var rawAppendChild = HTMLElement.prototype.appendChild;
var rawRemoveChild = HTMLElement.prototype.removeChild;




function getAppWrapperGetter(appInstanceId, useLegacyRender, strictStyleIsolation, scopedCSS, elementGetter) {
  // appInstanceId是微应用的name
  // elementGetter是获取自定义div的函数
  // 其他入参都是undefined
  return function () {
    if (useLegacyRender) {
      if (strictStyleIsolation) throw new QiankunError('strictStyleIsolation can not be used with legacy render!');
      if (scopedCSS) throw new QiankunError('experimentalStyleIsolation can not be used with legacy render!');
      var appWrapper = document.getElementById(getWrapperId(appInstanceId));
      assertElementExist(appWrapper, "Wrapper element for ".concat(appInstanceId, " is not existed!"));
      return appWrapper;
    }
    // 拿到专属div
    var element = elementGetter();
    assertElementExist(element, "Wrapper element for ".concat(appInstanceId, " is not existed!"));
    if (strictStyleIsolation && supportShadowDOM) {
      return element.shadowRoot;
    }
    // 直接返回专属div
    return element;
  };
}





export function createSandboxContainer(appName, elementGetter, scopedCSS, useLooseSandbox, excludeAssetFilter, globalContext, speedySandBox) {
  var sandbox;
  // 新建一个沙箱实例
  if (window.Proxy) {
    sandbox = useLooseSandbox ? new LegacySandbox(appName, globalContext) : new ProxySandbox(appName, globalContext, {
      speedy: !!speedySandBox
    });
  } else {
    sandbox = new SnapshotSandbox(appName);
  }

  // 赋予一些属性
  var bootstrappingFreers = patchAtBootstrapping(appName, elementGetter, sandbox, scopedCSS, excludeAssetFilter, speedySandBox);
  var mountingFreers = [];
  var sideEffectsRebuilders = [];

  // 返回一个沙箱对象
  return {
    instance: sandbox,
    /**
     * 沙箱被 mount
     * 可能是从 bootstrap 状态进入的 mount
     * 也可能是从 unmount 之后再次唤醒进入 mount
     */
    mount: function mount() {
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var sideEffectsRebuildersAtBootstrapping, sideEffectsRebuildersAtMounting;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              /* ------------------------------------------ 因为有上下文依赖（window），以下代码执行顺序不能变 ------------------------------------------ */
              /* ------------------------------------------ 1. 启动/恢复 沙箱------------------------------------------ */
              sandbox.active();
              sideEffectsRebuildersAtBootstrapping = sideEffectsRebuilders.slice(0, bootstrappingFreers.length);
              sideEffectsRebuildersAtMounting = sideEffectsRebuilders.slice(bootstrappingFreers.length); // must rebuild the side effects which added at bootstrapping firstly to recovery to nature state
              if (sideEffectsRebuildersAtBootstrapping.length) {
                sideEffectsRebuildersAtBootstrapping.forEach(function (rebuild) {
                  return rebuild();
                });
              }
              /* ------------------------------------------ 2. 开启全局变量补丁 ------------------------------------------*/
              // render 沙箱启动时开始劫持各类全局监听，尽量不要在应用初始化阶段有 事件监听/定时器 等副作用
              mountingFreers = patchAtMounting(appName, elementGetter, sandbox, scopedCSS, excludeAssetFilter, speedySandBox);
              /* ------------------------------------------ 3. 重置一些初始化时的副作用 ------------------------------------------*/
              // 存在 rebuilder 则表明有些副作用需要重建
              if (sideEffectsRebuildersAtMounting.length) {
                sideEffectsRebuildersAtMounting.forEach(function (rebuild) {
                  return rebuild();
                });
              }
              // clean up rebuilders
              sideEffectsRebuilders = [];
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }))();
    },
    /**
     * 恢复 global 状态，使其能回到应用加载之前的状态
     */
    unmount: function unmount() {
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              // record the rebuilders of window side effects (event listeners or timers)
              // note that the frees of mounting phase are one-off as it will be re-init at next mounting
              sideEffectsRebuilders = [].concat(_toConsumableArray(bootstrappingFreers), _toConsumableArray(mountingFreers)).map(function (free) {
                return free();
              });
              sandbox.inactive();
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }))();
    }
  };
}

export function patchAtBootstrapping(appName, elementGetter, sandbox, scopedCSS, excludeAssetFilter, speedySandBox) {
  var _patchersInSandbox$sa2;
  var patchersInSandbox = _defineProperty(_defineProperty(_defineProperty({}, SandBoxType.LegacyProxy, [function () {
    return patchLooseSandbox(appName, elementGetter, sandbox, false, scopedCSS, excludeAssetFilter);
  }]), SandBoxType.Proxy, [function () {
    return patchStrictSandbox(appName, elementGetter, sandbox, false, scopedCSS, excludeAssetFilter, speedySandBox);
  }]), SandBoxType.Snapshot, [function () {
    return patchLooseSandbox(appName, elementGetter, sandbox, false, scopedCSS, excludeAssetFilter);
  }]);
  return (_patchersInSandbox$sa2 = patchersInSandbox[sandbox.type]) === null || _patchersInSandbox$sa2 === void 0 ? void 0 : _patchersInSandbox$sa2.map(function (patch) {
    return patch();
  });
}


function execHooksChain(hooks, app) {
  // hooks是beforeLoad的一个数组，里面有三个beforeLoad函数
  // app是主应用写的对微应用的配置对象
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;
  
  // 构造一个promise链条
  // 因为第一个promise是一个已经resolve的，因此可以去到第一个then函数，也就是去执行beforeLoad函数
  if (hooks.length) {
    return hooks.reduce(function (chain, hook) {
      return chain.then(function () {
        return hook(app, global);
      });
    }, Promise.resolve());
  }
  return Promise.resolve();
}




// 3.4 执行js资源


function _execScripts(entry, scripts) {
  // entry是微应用的url host
  // scripts是js资源数组
  var proxy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _opts$fetch2 = opts.fetch,
    fetch = _opts$fetch2 === void 0 ? defaultFetch : _opts$fetch2,
    _opts$strictGlobal = opts.strictGlobal,
    strictGlobal = _opts$strictGlobal === void 0 ? false : _opts$strictGlobal,
    success = opts.success,
    _opts$error = opts.error,
    error = _opts$error === void 0 ? function () {} : _opts$error,
    _opts$beforeExec = opts.beforeExec,
    beforeExec = _opts$beforeExec === void 0 ? function () {} : _opts$beforeExec,
    _opts$afterExec = opts.afterExec,
    afterExec = _opts$afterExec === void 0 ? function () {} : _opts$afterExec,
    _opts$scopedGlobalVar2 = opts.scopedGlobalVariables,
    scopedGlobalVariables = _opts$scopedGlobalVar2 === void 0 ? [] : _opts$scopedGlobalVar2;
  
  // 这里再次去fetch资源，为什么，之前不是已经fetch过了吗？？？？
  return _getExternalScripts(scripts, fetch, entry).then(function (scriptsText) {
    // 返回的scriptsText是结果数组，每个对象有src和value属性

    var geval = function geval(scriptSrc, inlineScript) {
      // scriptSrc是js的url
      // inlineScript是js的字符串模板

      // 外部有传这个参数就执行，没有则为空函数
      var rawCode = beforeExec(inlineScript, scriptSrc) || inlineScript;
      // 对每个js字符串代码绑定沙箱作用域
      var code = getExecutableScript(scriptSrc, rawCode, {
        proxy: proxy,
        strictGlobal: strictGlobal,
        scopedGlobalVariables: scopedGlobalVariables
      });

      // 真正执行代码！
      evalCode(scriptSrc, code);

      // 外部有传这个参数就执行，没有则为空函数
      afterExec(inlineScript, scriptSrc);
    };
    function exec(scriptSrc, inlineScript, resolve) {
      // scriptSrc是js的url
      // inlineScript是js的字符串模板
      // resolve是进行下一步的开关

      var markName = "Evaluating script ".concat(scriptSrc);
      var measureName = "Evaluating Time Consuming: ".concat(scriptSrc);
      if (process.env.NODE_ENV === 'development' && supportsUserTiming) {
        performance.mark(markName);
      }

      // 判断scriptSrc是不是entry
      if (scriptSrc === entry) {
        noteGlobalProps(strictGlobal ? proxy : window);
        try {
          geval(scriptSrc, inlineScript);
          var exports = proxy[getGlobalProp(strictGlobal ? proxy : window)] || {};
          resolve(exports);
        } catch (e) {
          // entry error must be thrown to make the promise settled
          console.error("[import-html-entry]: error occurs while executing entry script ".concat(scriptSrc));
          throw e;
        }
      } else {

        // 进入这里！
        if (typeof inlineScript === 'string') {
          try {
            if (scriptSrc !== null && scriptSrc !== void 0 && scriptSrc.src) {
              geval(scriptSrc.src, inlineScript);

            } else {
              // 执行js
              geval(scriptSrc, inlineScript);
            }
          } catch (e) {
            // consistent with browser behavior, any independent script evaluation error should not block the others
            throwNonBlockingError(e, "[import-html-entry]: error occurs while executing normal script ".concat(scriptSrc));
          }
        } else {
          // external script marked with async
          inlineScript.async && (inlineScript === null || inlineScript === void 0 ? void 0 : inlineScript.content.then(function (downloadedScriptText) {
            return geval(inlineScript.src, downloadedScriptText);
          })["catch"](function (e) {
            throwNonBlockingError(e, "[import-html-entry]: error occurs while executing async script ".concat(inlineScript.src));
          }));
        }
      }
      if (process.env.NODE_ENV === 'development' && supportsUserTiming) {
        performance.measure(measureName, markName);
        performance.clearMarks(markName);
        performance.clearMeasures(measureName);
      }
    }
    function schedule(i, resolvePromise) {
      if (i < scriptsText.length) {
        // 拿出这个script
        var script = scriptsText[i];
        var scriptSrc = script.src;
        var inlineScript = script.value;

        // 执行一个js
        exec(scriptSrc, inlineScript, resolvePromise);

        // 执行完之后继续执行下一个，递归调用
        if (!entry && i === scriptsText.length - 1) {
          resolvePromise();
        } else {
          schedule(i + 1, resolvePromise);
        }
      }
    }

    // 首先执行调度函数
    return new Promise(function (resolve) {
      return schedule(0, success || resolve);
    });
  })["catch"](function (e) {
    error();
    throw e;
  });
}


function getExecutableScript(scriptSrc, scriptText) {
  // scriptSrc是js的url
  // inlineScript是js的字符串模板

  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var proxy = opts.proxy,
    strictGlobal = opts.strictGlobal,
    _opts$scopedGlobalVar = opts.scopedGlobalVariables,
    scopedGlobalVariables = _opts$scopedGlobalVar === void 0 ? [] : _opts$scopedGlobalVar;
  var sourceUrl = isInlineCode(scriptSrc) ? '' : "//# sourceURL=".concat(scriptSrc, "\n");

  // scopedGlobalVariables就是原生的js里面所有对象类型的字符串的数组，比如Array，Map等
  // 将 scopedGlobalVariables 拼接成变量声明，用于缓存全局变量，避免每次使用时都走一遍代理
  // 实际上得到的scopedGlobalVariableDefinition是const {Array, Map} = this;
  var scopedGlobalVariableDefinition = scopedGlobalVariables.length ? "const {".concat(scopedGlobalVariables.join(','), "}=this;") : '';

  // 通过这种方式获取全局 window，因为 script 也是在全局作用域下运行的，所以我们通过 window.proxy 绑定时也必须确保绑定到全局 window 上
  // 否则在嵌套场景下， window.proxy 设置的是内层应用的 window，而代码其实是在全局作用域运行的，会导致闭包里的 window.proxy 取的是最外层的微应用的 proxy
  var globalWindow = (0, eval)('window');
  globalWindow.proxy = proxy;

  // 对scriptText绑定沙箱window
  // TODO 通过 strictGlobal 方式切换 with 闭包，待 with 方式坑趟平后再合并
  return strictGlobal
    ? scopedGlobalVariableDefinition
      ? ";(function(){with(this){".concat(scopedGlobalVariableDefinition).concat(scriptText, "\n").concat(sourceUrl, "}}).bind(window.proxy)();")
      : ";(function(window, self, globalThis){with(window){;".concat(scriptText, "\n").concat(sourceUrl, "}}).bind(window.proxy)(window.proxy, window.proxy, window.proxy);")
    : ";(function(window, self, globalThis){;".concat(scriptText, "\n").concat(sourceUrl, "}).bind(window.proxy)(window.proxy, window.proxy, window.proxy);");
}


export function evalCode(scriptSrc, code) {
  var key = scriptSrc;
  if (!evalCache[key]) {
    // 包裹js 并 缓存
    var functionWrappedCode = "(function(){".concat(code, "})");
    evalCache[key] = (0, eval)(functionWrappedCode);
  }
  // 拿到缓存开始执行代码
  var evalFunc = evalCache[key];
  evalFunc.call(window);
}



// 3.5 处理子应用的生命周期函数


function getLifecyclesFromExports(scriptExports, appName, global, globalLatestSetProp) {
  // scriptExports是子应用生命周期函数的集合对象
  // appName、globalLatestSetProp是子应用的名称
  // global是沙箱

  // 校验通过，直接返回scriptExports，也就是子应用生命周期函数的集合对象
  if (validateExportLifecycle(scriptExports)) {
    return scriptExports;
  }

  if (globalLatestSetProp) {
    var lifecycles = global[globalLatestSetProp];
    if (validateExportLifecycle(lifecycles)) {
      return lifecycles;
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn("[qiankun] lifecycle not found from ".concat(appName, " entry exports, fallback to get from window['").concat(appName, "']"));
  }

  var globalVariableExports = global[appName];
  if (validateExportLifecycle(globalVariableExports)) {
    return globalVariableExports;
  }
  throw new QiankunError("You need to export lifecycle functions in ".concat(appName, " entry"));
}


export function getMicroAppStateActions(id, isMaster) {
  return {
    /**
     * onGlobalStateChange 全局依赖监听
     *
     * 收集 setState 时所需要触发的依赖
     *
     * 限制条件：每个子应用只有一个激活状态的全局监听，新监听覆盖旧监听，若只是监听部分属性，请使用 onGlobalStateChange
     *
     * 这么设计是为了减少全局监听滥用导致的内存爆炸
     *
     * 依赖数据结构为：
     * {
     *   {id}: callback
     * }
     *
     * @param callback
     * @param fireImmediately
     */
    onGlobalStateChange: function onGlobalStateChange(callback, fireImmediately) {
      if (!(callback instanceof Function)) {
        console.error('[qiankun] callback must be function!');
        return;
      }
      if (deps[id]) {
        console.warn("[qiankun] '".concat(id, "' global listener already exists before this, new listener will overwrite it."));
      }
      deps[id] = callback;
      if (fireImmediately) {
        var cloneState = _cloneDeep(globalState);
        callback(cloneState, cloneState);
      }
    },
    /**
     * setGlobalState 更新 store 数据
     *
     * 1. 对输入 state 的第一层属性做校验，只有初始化时声明过的第一层（bucket）属性才会被更改
     * 2. 修改 store 并触发全局监听
     *
     * @param state
     */
    setGlobalState: function setGlobalState() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (state === globalState) {
        console.warn('[qiankun] state has not changed！');
        return false;
      }
      var changeKeys = [];
      var prevGlobalState = _cloneDeep(globalState);
      globalState = _cloneDeep(Object.keys(state).reduce(function (_globalState, changeKey) {
        if (isMaster || _globalState.hasOwnProperty(changeKey)) {
          changeKeys.push(changeKey);
          return Object.assign(_globalState, _defineProperty({}, changeKey, state[changeKey]));
        }
        console.warn("[qiankun] '".concat(changeKey, "' not declared when init state\uFF01"));
        return _globalState;
      }, globalState));
      if (changeKeys.length === 0) {
        console.warn('[qiankun] state has not changed！');
        return false;
      }
      emitGlobal(globalState, prevGlobalState);
      return true;
    },
    // 注销该应用下的依赖
    offGlobalStateChange: function offGlobalStateChange() {
      delete deps[id];
      return true;
    }
  };
}






// 2.4 每一个微应用加载完毕之后（状态为【NOT_BOOTSTRAPPED】），开始执行callAllEventListeners

export function callCapturedEventListeners(eventArguments) {
  // 入参：
  // 对于 popstate 事件
  // eventArguments = [
  //   {
  //     type: 'popstate',           // 事件类型
  //     state: { ... },             // 历史状态对象
  //     target: window,             // 事件目标
  //     currentTarget: window,      // 当前目标
  //     bubbles: false,             // 是否冒泡
  //     cancelable: false,          // 是否可取消
  //     // ... 其他事件属性
  //   }
  // ]
  // 对于 hashchange 事件
  // eventArguments = [
  //   {
  //     type: 'hashchange',
  //     oldURL: 'http://localhost:3000/#/old-path',
  //     newURL: 'http://localhost:3000/#/new-path',
  //     target: window,
  //     currentTarget: window,
  //     // ... 其他事件属性
  //   }
  // ]

  if (eventArguments) {
    const eventType = eventArguments[0].type;
    if (routingEventsListeningTo.indexOf(eventType) >= 0) {
      // 
      capturedEventListeners[eventType].forEach((listener) => {
        try {
          listener.apply(this, eventArguments);
        } catch (e) {
          setTimeout(() => {
            throw e;
          });
        }
      });
    }
  }
}





// 3. 【qiankun】外部的start()函数执行

export var frameworkConfiguration = {};
export function start() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  frameworkConfiguration = _objectSpread({
    prefetch: true,
    singular: true,
    sandbox: true
  }, opts);
  var _frameworkConfigurati2 = frameworkConfiguration,
    prefetch = _frameworkConfigurati2.prefetch,
    _frameworkConfigurati3 = _frameworkConfigurati2.urlRerouteOnly,
    urlRerouteOnly = _frameworkConfigurati3 === void 0 ? defaultUrlRerouteOnly : _frameworkConfigurati3,
    importEntryOpts = _objectWithoutProperties(_frameworkConfigurati2, _excluded3);
  
  // 如果需要prefetch，那么在NOT_LOADED的状态时就去prefetch资源
  if (prefetch) {
    // 监听'single-spa:first-mount'事件
    doPrefetchStrategy(microApps, prefetch, importEntryOpts);
  }
  // 校验浏览器是否支持proxy
  frameworkConfiguration = autoDowngradeForLowVersionBrowser(frameworkConfiguration);

  // 去到【single-spa】，执行startSingleSpa
  startSingleSpa({
    urlRerouteOnly: urlRerouteOnly
  });
  started = true;
  frameworkStartedDefer.resolve();
}


export function doPrefetchStrategy(apps, prefetchStrategy, importEntryOpts) {
  // 入参：
  // apps是外部register函数的第一入参，就是一个数组，里面每个对象是微应用的配置
  // prefetchStrategy是true
  // importEntryOpts对象长这样：
    // sandbox: true
    // singular: true

  var appsName2Apps = function appsName2Apps(names) {
    return apps.filter(function (app) {
      return names.includes(app.name);
    });
  };
  if (Array.isArray(prefetchStrategy)) {
    prefetchAfterFirstMounted(appsName2Apps(prefetchStrategy), importEntryOpts);
  } else if (_isFunction(prefetchStrategy)) {
    _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
      var _yield$prefetchStrate, _yield$prefetchStrate2, criticalAppNames, _yield$prefetchStrate3, minorAppsName;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return prefetchStrategy(apps);
          case 2:
            _yield$prefetchStrate = _context2.sent;
            _yield$prefetchStrate2 = _yield$prefetchStrate.criticalAppNames;
            criticalAppNames = _yield$prefetchStrate2 === void 0 ? [] : _yield$prefetchStrate2;
            _yield$prefetchStrate3 = _yield$prefetchStrate.minorAppsName;
            minorAppsName = _yield$prefetchStrate3 === void 0 ? [] : _yield$prefetchStrate3;
            prefetchImmediately(appsName2Apps(criticalAppNames), importEntryOpts);
            prefetchAfterFirstMounted(appsName2Apps(minorAppsName), importEntryOpts);
          case 9:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }))();
  } else {
    switch (prefetchStrategy) {
      case true:
        // 走这里！
        // 监听'single-spa:first-mount'事件
        prefetchAfterFirstMounted(apps, importEntryOpts);
        break;
      case 'all':
        prefetchImmediately(apps, importEntryOpts);
        break;
      default:
        break;
    }
  }
}


function prefetchAfterFirstMounted(apps, opts) {
  window.addEventListener('single-spa:first-mount', function listener() {
    var notLoadedApps = apps.filter(function (app) {
      return getAppStatus(app.name) === NOT_LOADED;
    });
    if (process.env.NODE_ENV === 'development') {
      var mountedApps = getMountedApps();
      console.log("[qiankun] prefetch starting after ".concat(mountedApps, " mounted..."), notLoadedApps);
    }
    notLoadedApps.forEach(function (_ref3) {
      var entry = _ref3.entry;
      return prefetch(entry, opts);
    });
    window.removeEventListener('single-spa:first-mount', listener);
  });
}


var autoDowngradeForLowVersionBrowser = function autoDowngradeForLowVersionBrowser(configuration) {
  // configuration对象长这样：
    // prefetch: true
    // sandbox: true
    // singular: true
  
  var _configuration$sandbo = configuration.sandbox,
    sandbox = _configuration$sandbo === void 0 ? true : _configuration$sandbo,
    singular = configuration.singular;
  if (sandbox) {
    // 检验浏览器是否支持Proxy
    if (!window.Proxy) {
      console.warn('[qiankun] Missing window.Proxy, proxySandbox will degenerate into snapshotSandbox');
      if (singular === false) {
        console.warn('[qiankun] Setting singular as false may cause unexpected behavior while your browser not support window.Proxy');
      }
      return _objectSpread(_objectSpread({}, configuration), {}, {
        sandbox: _typeof(sandbox) === 'object' ? _objectSpread(_objectSpread({}, sandbox), {}, {
          loose: true
        }) : {
          loose: true
        }
      });
    }
    if (!isConstDestructAssignmentSupported() && (sandbox === true || _typeof(sandbox) === 'object' && sandbox.speedy !== false)) {
      console.warn('[qiankun] Speedy mode will turn off as const destruct assignment not supported in current browser!');
      return _objectSpread(_objectSpread({}, configuration), {}, {
        sandbox: _typeof(sandbox) === 'object' ? _objectSpread(_objectSpread({}, sandbox), {}, {
          speedy: false
        }) : {
          speedy: false
        }
      });
    }
  }
  return configuration;
};





// 3.1 【single-spa】开启

export function startSingleSpa(opts) {
  // 入参是：
  // {
  //   urlRerouteOnly: true
  // }

  started = true;
  if (isInBrowser) {
    patchHistoryApi(opts);

    // 进去执行reroute，进而被分发到performAppChanges函数
    reroute();
  }
}


function tryToBootstrapAndMount(app, unmountAllPromise) {
  if (shouldBeActive(app)) {
    return toBootstrapPromise(app).then((app) =>
      unmountAllPromise.then(() =>
        // 接下来就去执行mount（去到toMountPromise函数）
        shouldBeActive(app) ? toMountPromise(app) : app
      )
    );
  } else {
    return unmountAllPromise.then(() => app);
  }
}

export function shouldBeActive(app) {
  try {
    return app.activeWhen(window.location);
  } catch (err) {
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
    return false;
  }
}


export function toBootstrapPromise(appOrParcel, hardFail) {
  let startTime, profileEventType;

  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_BOOTSTRAPPED) {
      return appOrParcel;
    }
    if (__PROFILE__) {
      profileEventType = isParcel(appOrParcel) ? "parcel" : "application";
      startTime = performance.now();
    }

    // 改状态为【BOOTSTRAPPING】
    appOrParcel.status = BOOTSTRAPPING;

    if (!appOrParcel.bootstrap) {
      return Promise.resolve().then(successfulBootstrap);
    }

    // 执行bootstrap函数
    return reasonableTime(appOrParcel, "bootstrap")
      .then(successfulBootstrap)
      .catch((err) => {
        if (__PROFILE__) {
          addProfileEntry(
            profileEventType,
            toName(appOrParcel),
            "bootstrap",
            startTime,
            performance.now(),
            false
          );
        }

        if (hardFail) {
          throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
        } else {
          handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          return appOrParcel;
        }
      });
  });

  function successfulBootstrap() {
    // 成功bootstrap之后，改状态为【NOT_MOUNTED】
    appOrParcel.status = NOT_MOUNTED;

    if (__PROFILE__) {
      addProfileEntry(
        profileEventType,
        toName(appOrParcel),
        "bootstrap",
        startTime,
        performance.now(),
        true
      );
    }

    return appOrParcel;
  }
}



export function reasonableTime(appOrParcel, lifecycle) {
  const timeoutConfig = appOrParcel.timeouts[lifecycle];
  const warningPeriod = timeoutConfig.warningMillis;
  const type = objectType(appOrParcel);

  return new Promise((resolve, reject) => {
    let finished = false;
    let errored = false;

    // 执行对应的生命周期函数
    appOrParcel[lifecycle](getProps(appOrParcel))
      .then((val) => {
        finished = true;
        resolve(val);
      })
      .catch((val) => {
        finished = true;
        reject(val);
      });

    setTimeout(() => maybeTimingOut(1), warningPeriod);
    setTimeout(() => maybeTimingOut(true), timeoutConfig.millis);

    const errMsg = formatErrorMessage(
      31,
      __DEV__ &&
        `Lifecycle function ${lifecycle} for ${type} ${toName(
          appOrParcel
        )} lifecycle did not resolve or reject for ${timeoutConfig.millis} ms.`,
      lifecycle,
      type,
      toName(appOrParcel),
      timeoutConfig.millis
    );

    function maybeTimingOut(shouldError) {
      if (!finished) {
        if (shouldError === true) {
          errored = true;
          if (timeoutConfig.dieOnTimeout) {
            reject(Error(errMsg));
          } else {
            console.error(errMsg);
            //don't resolve or reject, we're waiting this one out
          }
        } else if (!errored) {
          const numWarnings = shouldError;
          const numMillis = numWarnings * warningPeriod;
          console.warn(errMsg);
          if (numMillis + warningPeriod < timeoutConfig.millis) {
            setTimeout(() => maybeTimingOut(numWarnings + 1), warningPeriod);
          }
        }
      }
    }
  });
}


export function toMountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_MOUNTED) {
      return appOrParcel;
    }
    let startTime, profileEventType;
    if (__PROFILE__) {
      profileEventType = isParcel(appOrParcel) ? "parcel" : "application";
      startTime = performance.now();
    }

    if (!beforeFirstMountFired) {
      window.dispatchEvent(new CustomEvent("single-spa:before-first-mount"));
      beforeFirstMountFired = true;
    }

    appOrParcel.status = MOUNTING;
    
    // 执行mount函数（去到parcelConfig对象执行里面的mount函数）
    // 然后执行主应用的beforeMount，子应用的mount，主应用的afterMount
    return reasonableTime(appOrParcel, "mount")
      .then(() => {
        appOrParcel.status = MOUNTED;

        // 执行监听事件的回调，之前在prefetchAfterFirstMounted数里面监听的
        // 针对状态为NOT_LOADED的微应用，执行prefetch的操作
        if (!firstMountFired) {
          window.dispatchEvent(new CustomEvent("single-spa:first-mount"));
          firstMountFired = true;
        }

        if (__PROFILE__) {
          addProfileEntry(
            profileEventType,
            toName(appOrParcel),
            "mount",
            startTime,
            performance.now(),
            true
          );
        }

        return appOrParcel;
      })
      .catch((err) => {
        appOrParcel.status = MOUNTED;
        return toUnmountPromise(appOrParcel, true).then(
          setSkipBecauseBroken,
          setSkipBecauseBroken
        );

        function setSkipBecauseBroken() {
          if (__PROFILE__) {
            addProfileEntry(
              profileEventType,
              toName(appOrParcel),
              "mount",
              startTime,
              performance.now(),
              false
            );
          }

          if (!hardFail) {
            handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
            return appOrParcel;
          } else {
            throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          }
        }
      });
  });
}




