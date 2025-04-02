

// 17.router相关

// 对url栈的动作定义
var Action = {
  Pop: "POP",
  Push: "PUSH",
  Replace: "REPLACE",
}

// 路由相关信息
var locationProp = {
  hash: '',
  key: 'default',
  pathname: '/',
  search: '',
  state: null,
}


// 历史栈工具箱和路由的provider
let NavigationContext = React.createContext({
  basename: string,
  navigator: {
    createHref,
    encodeLocation,
    go,
    push,
    replace,
  },
  static: boolean,
  future: {
    v7_relativeSplatPath: boolean,
  },
})

let LocationContext = React.createContext({
  location: {
    state,
    key,
  },
  navigationType: NavigationType,
})

let RouteContext = React.createContext({
  outlet: React.ReactElement,
  matches: RouteMatch,
  isDataRoute: boolean,
})


// 处理routes数组的时候，需要给路由设置优先级
const paramRe = /^:[\w-]+$/;
const dynamicSegmentValue = 3;
const indexRouteValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;



// renderedRoute里面用到的一个上下文，有点像一个工具集
var DataRouterContext = React.createContext({
  router,
  staticContext,
})



// <navigate>组件用到的
// 在使用工具箱的listen函数时，监听这个事件
const PopStateEventType = "popstate";




// REVIEW - 下面是经过beginWork分发后来到router相关的【BrowserRouters组件】的更新函数



// 使用例子：
// 不用useRoutes(routes)，就用routes包裹着route
// function Blog() {
//   return (
//     <Routes>
//       <Route path="post/:id" element={<Post />} />
//     </Routes>
//   );
// }
// 如果用useRoutes(routes)，相当于用一个钩子实现routes及其内部包裹的元素树



// BrowserRouters是一个函数组件
// 下面是BrowserRouters的renderWithHooks里面执行Component()函数之后来到的地方

function BrowserRouter({ basename, children, future, window, }) {

  // 1. 拿出历史栈相关的工具箱
  // 使用ref来记录东西，把关于历史栈的一些工具放到historyRef.current里面，相当于historyRef就是一个工具箱
  let historyRef = React.useRef();
  // 这个工具箱才建立一次！！！，只有在初始的时候才建立，用ref来记录，永远存到同一个内存地址
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window, v5Compat: true });
  }

  // 2. 同时用useState来管理这个工具箱里面的其中两个函数
  // 一个是动作，例如Action.Pop
  // 一个是createBrowserLocation函数的调用结果，是拿到location对象，
  // 里面记录当前页面上的url的一些信息，包括{ pathname, search, hash }等
  let history = historyRef.current;
  let [state, setStateImpl] = React.useState({
    action: history.action,
    location: history.location,
  });


  // 从renderWithHooks进来的参数是props和refOrContext，但是BrowserRouter没有props（除了孩子），也就是没有参数的，这里是undefined
  let { v7_startTransition } = future || {};


  // 3. 用useCallback把setState的函数缓存起来！
  let setState = React.useCallback(
    // 下面的newState长这样：{ action: NavigationType; location: Location }
    (newState) => {
      v7_startTransition && startTransitionImpl
        ? startTransitionImpl(() => setStateImpl(newState))
        : setStateImpl(newState);
    },
    [setStateImpl, v7_startTransition]
  );

  // 用LayoutEffect在绘制页面之前，监听setState这个函数，看他是否有变化
  // diapatchAction一般是一直保存在useState的，内存地址不会变
  React.useLayoutEffect(() => history.listen(setState), [history, setState]);

  // logV6DeprecationWarnings函数里面都是警告的逻辑
  React.useEffect(() => logV6DeprecationWarnings(future), [future]);

  // 再包裹一层是因为这个Router是【最后的包装者】
  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
      future={future}
    />
  );
}


function createBrowserHistory(options) {
  function createBrowserLocation(window, globalHistory) {
    // window.location是浏览器的全局对象
    // window.location.href → 整个url："https://www.example.com:8080/path/to/page?name=value&age=30#section1"
    // window.location.protocol → 协议："https:"
    // window.location.host → 主地址："www.example.com:8080"
    // window.location.hostname → 主地址名字："www.example.com"
    // window.location.port → 端口号："8080"
    // window.location.pathname → 路径："/path/to/page"
    // window.location.search → 查询参数："?name=value&age=30"
    // window.location.hash → 哈希值："#section1"
    // window.location.origin → 协议和主地址名字："https://www.example.com"

    // 这里拿的是路径、查询参数和哈希值
    let { pathname, search, hash } = window.location;
    return createLocation(
      "",
      { pathname, search, hash },
      (globalHistory.state && globalHistory.state.usr) || null,
      (globalHistory.state && globalHistory.state.key) || "default"
    );
  }

  function createBrowserHref(window, to) {
    return typeof to === "string" ? to : createPath(to);
  }

  return getUrlBasedHistory(createBrowserLocation, createBrowserHref, null, options);
}




function createPath({pathname = "/", search = "", hash = ""}) {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}




function getUrlBasedHistory(getLocation, createHref, validateLocation, options) {

  // 入参长这样
  // getLocation就是createBrowserLocation: (window: Window, globalHistory: Window["history"]) => Location,
  // createHref就是createBrowserHref: (window: Window, to: To) => string,
  // validateLocation: ((location: Location, to: To) => void) | null,
  // options: { window, v5Compat: true }

  let { window, v5Compat } = options;
  let globalHistory = window.history;
  let action = Action.Pop;
  let listener = null;


  // （一）：初始化历史栈的索引
  // 拿到当前历史栈里面的state（也就是索引）
  // 一开始拿到的是null，于是改为0
  let index = getIndex();
  if (index == null) {
    // 将 index 初始化为 0，表示当前页面是历史记录栈中的第一个条目。
    index = 0;
    // 通过 replaceState 更新当前历史记录的状态，
    // 保留原有 state 的其他字段，并添加 idx: index 字段。
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, "");
  }
  function getIndex() {
    let state = globalHistory.state || { idx: null };
    return state.idx;
  }


  // （二）设置监听页面变化的函数，更新当前在BrowserRouter函数组件里面维护的当前的url相关信息
  // 处理浏览器历史记录的 popstate 事件
  // （例如用户点击前进/后退按钮或调用 history.go(delta) 、history.back()、history.forward()触发的导航）
  function handlePop() {
    // 表示当前是由浏览器的前进/后退触发的导航。
    // Push 表示主动跳转，Pop 表示浏览器历史栈变化
    action = Action.Pop;

    // idx 是在历史记录栈中跟踪页面位置的字段（例如首次加载时为 0，跳转后递增为 1，回退后可能变回 0）
    // delta是导航步数差（向前或向后多少步），例如：
    //   用户点击 后退：delta 为 -1（如从 index=1 变为 nextIndex=0）。
    //   用户点击 前进：delta 为 +1（如从 index=0 变为 nextIndex=1）。
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;

    // 执行listen函数，也就是经过useCallback包装的setState函数
    // 把当前的loaction对象（记录路由信息），以及本次的东西和导航步数差三个数据进行更新
    if (listener) {
      listener({ action, location: history.location, delta });
    }

    // 示例流程：
    // 用户点击后退按钮 → 触发 popstate 事件。
    // 调用 handlePop：
    // 更新 action 为 Action.Pop。
    // 获取最新的 nextIndex（例如从 1 变为 0）。
    // 计算 delta = 0 - 1 = -1。
    // 更新 index = 0。
    // 调用 listener，传递 delta=-1。
    // 监听器根据 delta 更新 UI（如回退到上一个页面）。
  }


  // （三）不刷新页面，改变url的工具！
  // 从navigate组件的useEffect函数进来的
  function push(to, state) {
    // 参数：
    // to是三剑客对象，state为undefined（如果<naviagte>没有其他props的话）

    action = Action.Push;

    // 1. 创建一个目标路径的location对象，包括：
    // 当前的所在的url的路径部分三剑客location对象里面的pathname，以及目标路径对象的全部属性
    // 一般来说是目标路径的对象（三剑客及key，state等属性），因为第二参数会覆盖第一参数
    let location = createLocation(history.location, to, state);

    // 验证一下
    if (validateLocation) validateLocation(location, to);

    // 2. 收集所有当前位于历史栈的何处的相关信息
    // {
    //   usr: location.state,
    //   key: location.key,
    //   idx: index,
    // }

    // 拿到globalHistory.state里面的idx，初始是0
    // 给栈索引加一，表示进一步跳转到别的地方了
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);


    // 3. 创建一个url（目标路径的url），例如'/users/login'，就是和在routes数组里面写的url是一样的
    // 就是去createBrowserHref函数
    let url = history.createHref(location);

    
    // 4. 更新当前页面的实际状态和url：
    // 把当前的状态（历史栈的何处的相关信息）与目标路径的url放入栈里面，不会触发页面刷新，仅更新 URL 和状态（State）
    // 第三个参数的 URL需符合同源策略，不传则使用当前 URL。

    // 调用原生的window.history方法（允许在不刷新页面的情况下直接操作浏览器历史记录，为单页应用（SPA）的路由管理提供了底层支持）
    // 不会触发 popstate 事件（也就是页面刷新），需要手动触发
    // 传统方法window.location.href会触发页面更新，history.pushState()不会
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      // 有错误的话，使用原生的方法（assign 与 location.href 等效）
      // assign() 会卸载当前页面资源，重新加载新 URL 的内容。（给历史栈添加了信息，用户能通过“后退”返回）
      // 若新页面与原页面同源，会触发完整的页面生命周期（如 beforeunload、unload 事件）。
      window.location.assign(url);
    }

    // 5. 更新BrowserRouter里面维护的当前路由的信息
    // 然后执行之前在（BrowserRouter里面用useLayoutEffect监听的setState函数），更新跳转之后的路由信息
    // delta为1表示是跳转到别的页面，location是当前的所在的url的路径部分三剑客location对象
    // (注意，这个时候的history的state已经变了，因为之前执行过pushState，这里保存的是跳转之后的路由信息)
    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 1 });
    }

    // 这里进入dispatchAction，
    // 此时的fiber是BrowserRouter函数组件，queue是当前这个setState新建的hook的queue属性
    // 然后进入scheduleWork，在requestWork那里因为处于isRendering所以退出了
    // ?!为什么这个时候是isRending，按道理这个副作用是异步的，应该等到当前栈为空才执行的宏任务，isRendering在performWorkOnRoot的最末尾改为了false
    // 回答：因为这个函数是通过commitPassiveEffects进来的，而这个时候在里面把renderding改为了true
  }


  // （四）
  function replace(to, state) {
    action = Action.Replace;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);

    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);

    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 0 });
    }
  }


  function createURL(to) {
    // 拿到基础的host和协议和端口号的地址
    let base =
      window.location.origin !== "null"
        ? window.location.origin // 当前页面的协议、主机名和端口号（https://www.example.com）
        : window.location.href; // 当前页面的完整 URL（https://www.example.com/path/to/page）
  
    // 拿到路径部分
    // 将包含路径信息的对象转换为路径字符串
    let href = typeof to === "string" ? to : createPath(to);
  
    // 把空格换成url的特有的编码模式！
    href = href.replace(/ $/, "%20");
    return new URL(href, base);
  }

  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window, globalHistory);
    },

    // （五）开启监听页面变化
    // 从browerRouter的useLayoutEffect钩子（绘制页面之后执行生函过程中）进来的
    // 这个时候的fn就是经过useCallback包装的setState函数
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }

      // 给顶层加上一个监听事件！事件名为'popstate'，执行函数handlePop实际上是执行fn（即listener），也就是
      window.addEventListener(PopStateEventType, handlePop);
      // 同步立刻赋予listener一个函数
      listener = fn;

      // 返回一个卸载函数（摧毁函数）
      return () => {
        window.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref(window, to);
    },
    createURL,
    encodeLocation(to) {
      // 拿到一个包含路径和origin形式（协议加host加端口号）的路由的对象
      let url = createURL(to);
      // 返回一个三剑客的对象（路径，查询参数以及哈希值）
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
      };
    },
    push,
    replace,

    // 调用原生的window.history的go方法，去到相对于当前页面的差数的页面
    go(n) {
      return globalHistory.go(n);
    },
  };

  return history;
}







function createLocation(current, to, state, key) {

  // 从createBrowserLocation过来是
  // 入参：
  // current是‘’
  // to是当前所在位置（三剑客对象）pathname，search，hash
  // state是globalHistory.state.usr
  // key是globalHistory.state.key

  let location = {
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: "",
    ...(typeof to === "string" ? parsePath(to) : to),
    state,
    key: (to && to.key) || key || createKey(),
  };
  return location;
}

function createKey() {
  return Math.random().toString(36).substr(2, 8);
}




function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index,
  };
}




function Router({basename: basenameProp = "/", children = null, location: locationProp, navigationType = NavigationType.Pop, navigator, static: staticProp = false, future,}) {
  
  // 入参：
  // basename为默认值，即/
  // children为BrowserRouter的children
  // location是location对象
  // navigationType就是action（例如pop）
  // navigator就是历史栈的工具箱
  // future是undefined
  // staticProp是默认值，false
  // locationProp是默认值，即如下
  // var locationProp = {
  //   hash: '',
  //   key: 'default',
  //   pathname: '/',
  //   search: '',
  //   state: null,
  // }
  

  // 再包装一下工具箱，用memo缓存
  // 把路径的前面改为只有一个/
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = React.useMemo(() => ({
      basename,
      navigator,
      static: staticProp,
      future: {
        v7_relativeSplatPath: false,
        ...future,
      },
    }),
    [basename, future, navigator, staticProp]
  );

  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }

  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default",
  } = locationProp;

  // 包装一下路由的基本信息，用memo缓存
  let locationContext = React.useMemo(() => {
    // 从pathname里面截取basename的值
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        // 路径、查询参数、哈希值
        pathname: trailingPathname,
        search,
        hash,
        state,
        key,
      },
      navigationType,
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);

  if (locationContext == null) {
    return null;
  }

  // 下面一个是提供历史栈的工具箱，一个是提供路由信息的工具箱
  return (
    <NavigationContext.Provider value={navigationContext}>
      <LocationContext.Provider children={children} value={locationContext} />
    </NavigationContext.Provider>
  );
}


function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;

  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }

  let startIndex = basename.endsWith("/")
    ? basename.length - 1
    : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }

  return pathname.slice(startIndex) || "/";
}






// REVIEW - 下面是【useRoutes的钩子函数】相关




// 其中的routes数组长下面这样，这个需要自己定义！！！
// const routes = [
//   {
//     path: "/",
//     element: <Navigate to="/users/login" />,
//   },
//   {
//     path: "/users/login",
//     element: <Login />,
//   },
//   {
//     path: "/users/home",
//     element: <Home />,
//   }
// ]




function useRoutes(routes, locationArg) {
  return useRoutesImpl(routes, locationArg);
}



function useRoutesImpl(routes, locationArg, dataRouterState, future) {

  // 从上下文种拿到工具箱
  let { navigator, static: isStatic } = React.useContext(NavigationContext);
  let { matches: parentMatches } = React.useContext(RouteContext);

  // 1. 拿到url收集栈的最后一个，并拿到这个url的信息
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;

  // 2. 拿到Location上下文里面的location对象，长这样！
  // {
  //   pathname: trailingPathname,
  //   search,
  //   hash,
  //   state,
  //   key,
  // }
  let locationFromContext = useLocation();
  let location;
  if (locationArg) {
    // useRoutes没有第二个参数，就不走下面，让location直接等于从上下文拿到的location对象
    let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }

  // 3. 拿到当前url的路径部分（pathname把parentPathnameBase截掉之后的部分）
  let pathname = location.pathname || "/";
  let remainingPathname = pathname;
  // pathname把parentPathnameBase截掉
  // 首次渲染parentPathnameBase为/，不走下面
  if (parentPathnameBase !== "/") {
    let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
    let segments = pathname.replace(/^\//, "").split("/");
    remainingPathname = "/" + segments.slice(parentSegments.length).join("/");
  }

  // 4. 拿到【当前url的路径部分】和【routes数组里面任意一个path】对应上的匹配结果
  // 第一次执行的时候，这个时候的路由有可能是/，然后去到navigate组件，在其useEffect函数内部直接改了url
  // 第二次执行的时候，再次匹配url，就能拿到匹配好的结果了
  let matches =
    !isStatic &&
    dataRouterState &&
    dataRouterState.matches &&
    dataRouterState.matches.length > 0
      ? dataRouterState.matches
      : matchRoutes(routes, { pathname: remainingPathname });

  // 5. 拿到RenderedRoute的函数组件
  // 这个RenderedRoute函数组件是把匹配上的match对象，以及提取其孩子作为props传递给RouteContent.Provider
  let renderedMatches = _renderMatches(
    matches && matches.map((match) =>
      Object.assign({}, match, {
        params: Object.assign({}, parentParams, match.params),
        // 下面去到encodeLocation函数
        pathname: joinPaths([
          parentPathnameBase,
          navigator.encodeLocation
            ? navigator.encodeLocation(match.pathname).pathname
            : match.pathname,
        ]),
        pathnameBase:
          match.pathnameBase === "/"
            ? parentPathnameBase
            : joinPaths([
                parentPathnameBase,
                navigator.encodeLocation
                  ? navigator.encodeLocation(match.pathnameBase).pathname
                  : match.pathnameBase,
              ]),
      })
    ),
    parentMatches,
    dataRouterState,
    future
  );

  // useRoutes没有第二个参数，就不走下面
  if (locationArg && renderedMatches) {
    return (
      <LocationContext.Provider
        value={{
          location: {
            pathname: "/",
            search: "",
            hash: "",
            state: null,
            key: "default",
            ...location,
          },
          navigationType: NavigationType.Pop,
        }}
      >
        {renderedMatches}
      </LocationContext.Provider>
    );
  }

  // 6. 直接返回孩子
  return renderedMatches;
}



function useLocation() {
  return useContext(LocationContext).location;
}



function matchRoutes(routes, locationArg, basename = "/") {
  return matchRoutesImpl(routes, locationArg, basename, false);
}



function matchRoutesImpl(routes, locationArg, basename, allowPartial) {

  // locationArg是{ pathname: remainingPathname }
  // routes就是自己定义的一个路由管理数组
  // const routes = [
  //   {
  //     path: "/",
  //     element: <Navigate to="/users/login" />,
  //   },
  //   {
  //     path: "/users/login",
  //     element: <Login />,
  //   },
  //   {
  //     path: "/users/home",
  //     element: <Home />,
  //   }
  // ]


  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;

  // 1. 处理当前页面上的url的路径部分
  // pathname，也就是remainingPathname，让他截掉basename的部分
  // 实际上basename就是/，截不了
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }

  // 2. 递归整合所有的path（实际上是包装好的对象），放到一个数组里面
  // 【为什么要递归？】因为有子路由的情况，一个路由下有多个别的路由
  let branches = flattenRoutes(routes);

  // 3. 对数组进行原地排序！按照分数从大到小排序
  // 减少遍历次数！
  rankRouteBranches(branches);

  // 4. 遍历自定义的routes，逐一查看其中哪个path和当前页面上的url的path是一样的
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    let decoded = decodePath(pathname);
    matches = matchRouteBranch(branches[i], decoded, allowPartial);
  }

  // 最后的matches里面的一个（正常来说只匹配到一个）长这样：
  // {
  //   params: 参数对象（key是参数名字，value是参数的实际值）
  //   pathname: 完整的路径
  //   pathnameBase: 基础部分的路径（与 完整的路径 差不多）
  //   route: routes里面的每一个route对象
  // }

  return matches;
}




function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = "") {
  let flattenRoute = (route, index, relativePath) => {

    // 针对routes再次包装一个对象
    let meta = {
      relativePath: relativePath === undefined ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route,
    };

    // 从matchRoutesImpl过来的，这里parentPath为空字符串，
    // 相当于没有裁剪或者合并什么东西
    if (meta.relativePath.startsWith("/")) {
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);


    // 如果有孩子，继续执行本函数，拿到更多的路由数组
    // 【注意】因此在外部写的时候route对象里面的 孩子路由 是写children
    if (route.children && route.children.length > 0) {
      flattenRoutes(route.children, branches, routesMeta, path);
    }
    if (route.path == null && !route.index) {
      return;
    }

    // 把【路径，包装对象，路径得分（优先级的体现）】放到 “ 路由枝条数组 ” 中
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta,
    });
  };

  routes.forEach((route, index) => {
    if (route.path === "" || !route.path?.includes("?")) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, exploded);
      }
    }
  });

  return branches;
}



function joinPaths(paths){
  // 把//变为/
  paths.join("/").replace(/\/\/+/g, "/")
}



function computeScore(path, index) {
  // 把路径分开
  let segments = path.split("/");
  // 有多少段就设置初始分数为多少分
  let initialScore = segments.length;

  // 看有无星号，只要有一个星号，就在原始的分数上面减去2，这是一个惩罚
  if (segments.some(isSplat)) {
    // 是否 至少有一个元素 满足指定的条件，返回一个布尔值
    initialScore += splatPenalty;
  }

  // 如果routes数组里面的元素有index属性的话，分数再加2
  if (index) {
    initialScore += indexRouteValue;
  }

  // 把那些没有星号的筛除掉
  // 然后根据每一个段的情况加分
  // 如果是动态段（例如 /user/:id 中的 :id），则加上 dynamicSegmentValue（3）
  // 如果是空字符串段（例如path最前面有“根路径 /”），则加上 emptySegmentValue（1）
  // 如果是静态段（例如 /users 中的 users），则加上 staticSegmentValue（10）
  return segments
    .filter((s) => !isSplat(s))
    .reduce(
      (score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue),
      initialScore
    );
}


var isSplat = (s) => s === "*";





// 从大到小排序
// 如果分数一样，且childrenIndex不一样，没有排序可言
// childrenIndex一样，排在routes前面的路由（索引更小）有更高的优先权
function rankRouteBranches(branches) {
  branches.sort((a, b) =>
    a.score !== b.score
      ? b.score - a.score
      : compareIndexes(
          a.routesMeta.map((meta) => meta.childrenIndex),
          b.routesMeta.map((meta) => meta.childrenIndex)
        )
  );
}


function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? a[a.length - 1] - b[b.length - 1] : 0;
}




// 下面函数是处理/这个字符
// decodeURIComponent("path%2Fto%2Ffile") 会变成 "path/to/file"
// 解码一遍，再重新编码一遍（因为 / 在 URL 编码中是一个特殊字符，所以该函数将 / 替换成 %2F，以确保路径中原本的 / 符号不会被误处理为路径分隔符）
function decodePath(value) {
  try {
    return value
      .split("/")
      .map((v) => decodeURIComponent(v).replace(/\//g, "%2F"))
      .join("/");
  } catch (error) {
    return value;
  }
}


function matchRouteBranch(branch, pathname, allowPartial = false) {
  // 这是一个放在遍历里面的函数，branch指的是自定义routes里面的一个路由对象
  // pathname是当前location对象的当前的路径（没有其他host等）

  let { routesMeta } = branch;

  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];

  // routesMeta只有一个元素，长这样：
  // {
  //   relativePath: relativePath === undefined ? route.path || "" : relativePath,
  //   caseSensitive: route.caseSensitive === true,
  //   childrenIndex: index,
  //   route,
  // }
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;

    // 拿到当前页面上的url的路径部分
    // remainingPathname实际上就是当前页面上的url的路径部分
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    
    // 将当前页面上的url的路径部分，和自定义routes里面的一个路由对象的path进行对比，看是否匹配
    let match = matchPath(
      { path: meta.relativePath, caseSensitive: meta.caseSensitive, end },
      remainingPathname
    );

    // 如果匹配不到，且当前的route对象没有index属性，又允许allowPartial
    let route = meta.route;
    if (!match && end && allowPartial && !routesMeta[routesMeta.length - 1].route.index) {
      match = matchPath(
        {
          path: meta.relativePath,
          caseSensitive: meta.caseSensitive,
          end: false,
        },
        remainingPathname
      );
    }

    // 还是匹配不到就退出
    if (!match) {
      return null;
    }

    Object.assign(matchedParams, match.params);

    // 最后把匹配上的信息组合到一起，放入一个数组里面
    matches.push({
      // 参数对象（key是参数名字，value是参数的实际值）
      params: matchedParams,
      // 完整的路径
      pathname: joinPaths([matchedPathname, match.pathname]),
      // 基础部分的路径（与 完整的路径 差不多）
      // 规则是 删除路径末尾的所有斜杠，并且匹配路径开头的多个斜杠，并将它们替换为单个斜杠/
      pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
      route,
    });

    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }

  return matches;
}



// 将实际的 URL 路径（pathname）与给定的路径模式（pattern）进行匹配，并提取出路径中的参数。
function matchPath(pattern, pathname) {
  // 入参：
  // pattern就是自定义routes里面的一个路由对象的path的包装对象
  // { path: meta.relativePath, caseSensitive: meta.caseSensitive, end },
  // pathname就是当前页面上的url

  if (typeof pattern === "string") {
    pattern = { path: pattern, caseSensitive: false, end: true };
  }

  // 1. 拿到可以匹配完整path（【合法的规范的path】）的正则表达式，以及记录所有参数的对象
  let [matcher, compiledParams] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);

  // 2. 开启匹配
  let match = pathname.match(matcher);
  if (!match) return null;

  // 3. （1）从匹配结果中获取完全匹配的路径部分，完整路径
  let matchedPathname = match[0];

  // 4. （2）处理匹配路径的基础部分，清除末尾的多余斜杠，保留路径的基本部分
  // （因为matchedPathname的末尾肯定是要么零个/，要么多个/，实际上经过compilePath，末尾应该不能有/）
  // 举例：有一个路径 "/user/123/"
  // /(.)\/+$/ 会匹配路径的最后一个字符（3）和随后的所有斜杠。使用 "\$1" 替换时，会保留最后的非斜杠字符 3，并去掉末尾的斜杠。
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");

  // 5. （3）从正则表达式匹配中提取到的捕获组，构造参数对象
  // （即路径参数的实际值，因为只有在保存参数的时候设置了捕获组）
  let captureGroups = match.slice(1);

  // 遍历将每个路径参数的值提取出来
  let params = compiledParams.reduce((memo, { paramName, isOptional }, index) => {
    if (paramName === "*") {
      // 当末尾为*时（之前再末尾为*设置了捕获组）
      let splatValue = captureGroups[index] || "";
      // 将路径的基础部分去除末尾的.之后的，再去除头部开始的多余的点
      pathnameBase = matchedPathname
        .slice(0, matchedPathname.length - splatValue.length)
        .replace(/(.)\/+$/, "$1");
    }

    // 把参数的实际值和参数名字放到一个对象里面保存起来
    const value = captureGroups[index];
    if (isOptional && !value) {
      memo[paramName] = undefined;
    } else {
      memo[paramName] = (value || "").replace(/%2F/g, "/");
    }
    return memo;
  }, {});

  return {
    // 参数
    params,
    // 全部完整路径
    pathname: matchedPathname,
    // 基础路径的部分
    pathnameBase,
    // 一些对路径的设置
    pattern,
  };
}




function compilePath(path, caseSensitive = false, end = true) {

  // 入参：
  // path: 路径模式（例如 /user/:id）。
  // caseSensitive: 是否区分大小写，默认为 false。
  // end: 是否匹配路径的结尾，默认为 true。

  // 举例：
  // 假设此时遍历到的route的path是/users/login或者/users/home或者/，最后得到的正则表达式分别为
  // regexpSource为^/users/login\\/*$，matcher为/^\/users\/login\/*$/i（两侧加上//表示这是一个正则表达式）
  // regexpSource为^/users/home\\/*$ ，matcher为/^\/users\/home\/*$/i（两侧加上//表示这是一个正则表达式）
  // regexpSource为^/\\/*$，matcher为/^\/\/*$/i


  // 数组用于存储路径中的参数信息
  let params = [];
  // 开始逐渐构造一个正则表达式
  let regexpSource =
    "^" +
    path
      // 移除路径末尾的一个或多个/（有*也去掉），因为会单独处理通配符部分
      .replace(/\/*\*?$/, "") 
      // 确保路径以斜杠 / 开头
      .replace(/^\/*/, "/") 
      // 转义路径中的正则特殊字符，例如：[、 ]、 *、 + 等，防止它们被误解为正则表达式的操作符
      // 全部变为\或者$或者&
      .replace(/[\\.*+^${}|()[\]]/g, "\\$&") 
      // 查找路径中的动态参数，形式为 /:paramName。
      // 保存参数，且全部变为 /([^/]+)，也就是把:的匹配去掉，因为已经保存起来了
      .replace(
        /\/:([\w-]+)(\?)?/g,
        (_, paramName, isOptional) => {
          params.push({ paramName, isOptional: isOptional != null });
          return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
        }
      );

  // 如果路径以 * 结尾，则会把它转化为匹配任意字符的正则表达式：
  // (.*)$ 表示匹配末尾的0个或多个.
  // (?:【\\/(.+)】|【\\/*】)$ 表示匹配末尾的/xxx或xxx///，【这里匹配的是xxx这些部分】
  // (?:)非捕获组，不会保存捕获结果，一些不重要的东西，但是又必须有的东西，放到这里面
  if (path.endsWith("*")) {
    params.push({ paramName: "*" });
    regexpSource +=
      path === "*" || path === "/*"
        ? "(.*)$"
        : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    // 如果 end 为 true，表示路径必须精确匹配
    // 在末尾添加 \\/*$，表示匹配零个或多个斜杠
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    // 如果不是以*结尾，也不是必须精确匹配，末尾加上/或者$的匹配
    regexpSource += "(?:(?=\\/|$))";
  } else {
    // "" or "/"的情况
  }

  let matcher = new RegExp(regexpSource, caseSensitive ? undefined : "i");

  return [matcher, params];
}



// 删除路径末尾的所有斜杠，并且匹配路径开头的多个斜杠，并将它们替换为单个斜杠 /
var normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");




function createPath({pathname = "/", search = "", hash = ""}) {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}



// params = {}
// pathname = '/'
// pathnameBase = '/'
// route = {path: '/', element: {…}}



function _renderMatches(matches, parentMatches = [], dataRouterState = null, future = null) {

  // 入参：
  // matches长这样，是一个数组，且一般来说只有一个匹配上的路由对象
  //   params = {}
  //   pathname = '/'
  //   pathnameBase = '/'
  //   route = {path: '/', element: {…}}
  // 其他的参数一般都是默认值

  // 找不到路由的情况
  if (matches == null) {
    if (!dataRouterState) {
      return null;
    }

    // dataRouterState为null的话，直接返回null
    if (dataRouterState.errors) {
      matches = dataRouterState.matches;
    } else if (
      future?.v7_partialHydration &&
      parentMatches.length === 0 &&
      !dataRouterState.initialized &&
      dataRouterState.matches.length > 0
    ) {
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }

  // 能够找到路由的情况：
  let renderedMatches = matches;

  // dataRouterState为默认值null不走下面
  let errors = dataRouterState?.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(
      (m) => m.route.id && errors?.[m.route.id] !== undefined
    );
    renderedMatches = renderedMatches.slice(0, Math.min(renderedMatches.length, errorIndex + 1));
  }

  let renderFallback = false;
  let fallbackIndex = -1;

  // dataRouterState为默认值null不走下面
  if (dataRouterState && future && future.v7_partialHydration) {
    for (let i = 0; i < renderedMatches.length; i++) {
      let match = renderedMatches[i];
      if (match.route.HydrateFallback || match.route.hydrateFallbackElement) {
        fallbackIndex = i;
      }

      if (match.route.id) {
        let { loaderData, errors } = dataRouterState;
        let needsToRunLoader =
          match.route.loader &&
          loaderData[match.route.id] === undefined &&
          (!errors || errors[match.route.id] === undefined);
        if (match.route.lazy || needsToRunLoader) {
          renderFallback = true;
          if (fallbackIndex >= 0) {
            renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
          } else {
            renderedMatches = [renderedMatches[0]];
          }
          break;
        }
      }
    }
  }

  // reduceRight 与reduce类似，是从数组的 右端（即从最后一个元素）开始 进行累积操作的
  // 但是一般renderedMatches也就是matches数组只有一个匹配上的对象
  return renderedMatches.reduceRight((outlet, match, index) => {
    let error;
    let shouldRenderHydrateFallback = false;
    let errorElement = null;
    let hydrateFallbackElement = null;

    // dataRouterState为默认值null不走下面
    if (dataRouterState) {
      error = errors && match.route.id ? errors[match.route.id] : undefined;
      errorElement = match.route.errorElement || defaultErrorElement;

      if (renderFallback) {
        if (fallbackIndex < 0 && index === 0) {
          shouldRenderHydrateFallback = true;
          hydrateFallbackElement = null;
        } else if (fallbackIndex === index) {
          shouldRenderHydrateFallback = true;
          hydrateFallbackElement = match.route.hydrateFallbackElement || null;
        }
      }
    }

    let matches = parentMatches.concat(renderedMatches.slice(0, index + 1));

    // 最终return的是这个函数的返回值
    let getChildren = () => {
      let children;
      if (error) {
        children = errorElement;
      } else if (shouldRenderHydrateFallback) {
        children = hydrateFallbackElement;
      } else if (match.route.Component) {
        children = <match.route.Component />;

      } else if (match.route.element) {
      // 一般来说走这里，直接让大孩子等于这个route的element！！！
        children = match.route.element;

      } else {
        children = outlet;
      }
      return (
        <RenderedRoute
          match={match}
          routeContext={{
            outlet,
            matches,
            isDataRoute: dataRouterState != null,
          }}
          children={children}
        />
      );
    };

    // dataRouterState为默认值null，直接执行getChildren函数
    return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0)
      ? (<RenderErrorBoundary
          location={dataRouterState.location}
          revalidation={dataRouterState.revalidation}
          component={errorElement}
          error={error}
          children={getChildren()}
          routeContext={{ outlet: null, matches, isDataRoute: true }}
        />)
      : (getChildren());
  }, null);
}




function RenderedRoute({ routeContext, match, children }) {

  // 入参：
  // match就是match对象
  // routeContext就是当前的路由的一些信息
  // {
  //   outlet：是null
  //   matches：是match对象包裹了一个[]（是一个数组）
  //   isDataRoute: dataRouterState != null ：是false
  // }
  // children就是当前的匹配上的route对象里面的element的函数组件（一个函数式的虚拟DOM）

  let dataRouterContext = React.useContext(DataRouterContext);
  if (
    dataRouterContext &&
    dataRouterContext.static &&
    dataRouterContext.staticContext &&
    // 匹配上的route里面如果有错误承接元素，就把这个route的id存起来，后面可能要进行错误页面的渲染
    (match.route.errorElement || match.route.ErrorBoundary)
  ) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }

  return (
    <RouteContext.Provider value={routeContext}>
      {children}
    </RouteContext.Provider>
  );
}







// REVIEW - 下面是<Navigate>组件




// 如果上面的路由刚好匹配到 /
// 那么就来到<Navigate to="/users/login" />
// 这是一个函数组件

function Navigate({to, replace, state, relative}) {

  // 入参：
  // to是目标路由："/users/login"

  // future长这样：
  // future: {
  //   v7_relativeSplatPath: false,
  // }
  // isStatic是false
  let { future, static: isStatic } = React.useContext(NavigationContext);

  // 1. 拿到当前的匹配上的route的对象
  let { matches } = React.useContext(RouteContext);

  // 2. 拿到location的对象
  // 使用这个useLocation相当于从Location的上下文对象里面拿到location的对象（里面存有三剑客）
  // location: {
  //   pathname: "/",
  //   search: "",
  //   hash: "",
  //   state: null,
  //   key: "default",
  // }
  let { pathname: locationPathname } = useLocation();

  // 3. 拿到跳转函数（跳转钩子）
  let navigate = useNavigate();


  // 4. 拿到目标路径的包装对象（三剑客）的字符化结果
  // hash = ''
  // pathname = '/users/login'
  // search = ''
  let path = resolveTo(to, getResolveToMatches(matches, future.v7_relativeSplatPath), locationPathname, relative === "path");
  let jsonPath = JSON.stringify(path);


  // 5. 在页面显示之后才跳转
  React.useEffect(() => navigate(JSON.parse(jsonPath), { replace, state, relative }),
    [navigate, jsonPath, relative, replace, state]
  );

  // 返回的大孩子是null
  return null;
}



function useNavigate() {
  // isDataRoute是false
  let { isDataRoute } = React.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}



function useNavigateUnstable() {

  // 这个dataRouterContext是null
  let dataRouterContext = React.useContext(DataRouterContext);

  // basename默认是/，future是{ v7_relativeSplatPath: false }，navigator是工具箱
  let { basename, future, navigator } = React.useContext(NavigationContext);

  // matches是匹配上的路由对象（数组）
  let { matches } = React.useContext(RouteContext);

  // pathname是当前页面上的url的路径部分
  let { pathname: locationPathname } = useLocation();

  // 拿到匹配上的路径对象，只取出里面的base路径，放入数组，并字符化，最后是'["/"]'
  let routePathnamesJson = JSON.stringify(
    getResolveToMatches(matches, future.v7_relativeSplatPath)
  );

  let activeRef = React.useRef(false);

  // 相当于 useLayoutEffect 的行为
  // 在页面绘制之前把ref设置为true
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });

  let navigate = React.useCallback((to, options = {}) => {
    // 在commitHookEffectList里面进来的
    // 参数：
    // to对象包括以下属性
      // hash = ''
      // pathname = '/users/login'
      // search = ''

    // 确保在页面绘制之后跳转！
    // activeRef.current在页面绘制之前就已经设置为true了
    if (!activeRef.current) return;
    // to如果是页面跳转数之差，就可以直接用浏览器的history属性的go方法去到历史栈里面对应的页面
    if (typeof to === "number") {
      navigator.go(to);
      return;
    }

    // 拿到目标路径的包装对象（三剑客），内含以下属性：
    // hash = ''
    // pathname = '/users/login'
    // search = ''
    let path = resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, options.relative === "path");

    // 下面不会走，basename为/，dataRouterContext是null
    if (dataRouterContext == null && basename !== "/") {
      path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
    }

    // options.replace一般来说是不存在的，没有给navigare组件加props的话，执行push方法
    // push方法是不刷新页面，但是把url改了（历史栈里面对应位置的信息（state和url）），同时更新之前在BrowserRouter维护的信息
    (!!options.replace ? navigator.replace : navigator.push)(path, options.state, options);

  }, [basename, navigator, routePathnamesJson, locationPathname, dataRouterContext]);

  return navigate;
}




function getResolveToMatches(matches, v7_relativeSplatPath) {
  let pathMatches = getPathContributingMatches(matches);

  if (v7_relativeSplatPath) {
    return pathMatches.map((match, idx) =>
      idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase
    );
  }
  // 把match对象改为找到里面的pathnameBase，最后返回的是[基础路径]，比如['/']
  return pathMatches.map((match) => match.pathnameBase);
}



function getPathContributingMatches(matches) {
  return matches.filter((match, index) => index === 0 || (match.route.path && match.route.path.length > 0));
}



function useIsomorphicLayoutEffect(cb) {
  // 这个默认是false
  let isStatic = React.useContext(NavigationContext).static;
  // 在页面绘制之前执行
  if (!isStatic) {
    React.useLayoutEffect(cb);
  }
}






function resolveTo(toArg, routePathnames, locationPathname, isPathRelative = false) {
  // 参数：
  // toArg是目标路径，
  // routePathnames是匹配上的route里面的base类型的路径，用数组包裹["/"]，
  // locationPathname是当前的url路径，是字符串"/"
  // isPathRelative指示目标路径 toArg 是否是相对路径

  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = { ...toArg };
  }

  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;

  let from;

  if (toPathname == null) {
    from = locationPathname;

  } else {
    // toPathname不为空走下面
    let routePathnameIndex = routePathnames.length - 1;

    if (!isPathRelative && toPathname.startsWith("..")) {
      // 如果路径是两个点开头的，把所有开头的点去掉（两个点两个点得去掉）
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }

    // to的路径没有以..开头：
    //   拿到匹配上的route里面的base类型的路径
    //   （使用 routePathnames 数组中的最后一个路径作为 from）
    // !to的路径以..开头：
    //   routePathnames是父路径的集合，为什么？
    //   拿到routePathnameIndex停下来，不再减一的时候的路径
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }

  // 返回to路径的包装对象
  let path = resolvePath(to, from);

  // 目标路径 toPathname 不是根路径且以斜杠 / 结尾，则标记为有显式的尾部斜杠。
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");

  // 目标路径为空或 toPathname 是 "."（表示当前路径），
  // 且当前路径 locationPathname 以斜杠结尾，则标记为当前路径有尾部斜杠
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  
  // 如果目标路径的最终 pathname 没有尾部斜杠，且目标路径或当前路径有尾部斜杠的要求，
  // 则在 path.pathname 上添加尾部斜杠。
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }

  // 返回to路径的包装对象
  return path;
}





function parsePath(path) {
  let parsedPath = {};

  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }

    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }

    if (path) {
      parsedPath.pathname = path;
    }
  }

  return parsedPath;
}




function resolvePath(to, fromPathname = "/") {
// 拿到to对象的三剑客
  let {
    pathname: toPathname,
    search = "",
    hash = "",
  } = typeof to === "string" ? parsePath(to) : to;

  // 拿到目标路径
  let pathname = toPathname
    ? toPathname.startsWith("/")
      ? toPathname
      : resolvePathname(toPathname, fromPathname)
    : fromPathname;

  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash),
  };
}


function resolvePathname(relativePath, fromPathname) {
  // 目标路径不是/开头，说明是一个相对的路径，相对form的路径
  // （以from路径最后一个作为relativePath路径的当前文件夹）

  // 把末尾的//都删掉，然后分割开
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");

  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      // 假设【目标路径分割对象】被分割出来.. 【来源路径分割对象】需要把最后一项删掉
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      // 假设【目标路径分割对象】被分割出来一个正常的文字，往【来源路径分割对象】里面加
      segments.push(segment);
    }
  });

  // 例子：
  // fromPathname = "/a/b/c"
  // relativePath = "../d/e"

  // segments = ["", "a", "b", "c"]（从 /a/b/c 拆分而来）
  // relativeSegments = ["..", "d", "e"]（从 ../d/e 拆分而来）
  // 处理 .. 时，segments 变成 ["", "a", "b"]（返回到上一级目录）
  // 处理 d 和 e 时，segments 变成 ["", "a", "b", "d", "e"]
  // 最终返回 /a/b/d/e

  return segments.length > 1 ? segments.join("/") : "/";
}




