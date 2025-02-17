// REVIEW - 全局变量
// 1.createElement阶段
var hasSymbol = typeof Symbol === "function" && Symbol.for;
var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 0xeac7;

// 2.创建fiber阶段
// !渲染模式
var NoContext = 0; // 二进制为000，非并发模式
var ConcurrentMode = 1; // 二进制为001，并发模式，需要时间切片，分配优先级
var StrictMode = 2; // 二进制为010
var ProfileMode = 4; // 二进制为100

// 是否允许开启profiler的计时器指标？？？？？？
var enableProfilerTimer = true;
// 是否允许跟踪每次提交的交互触发
var enableSchedulerTracing = true;
// 是否开启开发工具
var isDevToolsPresent = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined";

// 组件类型tag
var FunctionComponent = 0;
var ClassComponent = 1;
var IndeterminateComponent = 2; // Before we know whether it is function or class
var HostRoot = 3; // Root of a host tree. Could be nested inside another node.
var HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
var HostComponent = 5;
var HostText = 6;

// 这个用来干嘛？？，放在root对象里面的
var noTimeout = -1;

// 3.批量更新定义阶段
// 是批量更新模式，默认为非批量更新，也就是全部瞬时更新
var isBatchingUpdates = false;
// 非批量更新模式，默认为批量更新
var isUnbatchingUpdates = false;

// 4.正式的updateContainer阶段
// 多个root（更新的，第二个的...）的链表头尾记录器
// 第一个root指针，首次渲染阶段为null，后续在requestWork函数里面变为xxx
var firstScheduledRoot = null;
// 最后一个需要更新的root，首次渲染阶段为null，后续在requestWork函数里面变为xxx
var lastScheduledRoot = null;

// !过期时间（优先级的包裹形态，最终形态）等级定义
var NoWork = 0;
var Never = 1;
var maxSigned31BitInt = 1073741823;
var Sync = maxSigned31BitInt;

var UNIT_SIZE = 10;
var MAGIC_NUMBER_OFFSET = maxSigned31BitInt - 1;


var LOW_PRIORITY_EXPIRATION = 5000;
var LOW_PRIORITY_BATCH_SIZE = 250;
var HIGH_PRIORITY_EXPIRATION = 500;
var HIGH_PRIORITY_BATCH_SIZE = 100;


const hasNativePerformanceNow = typeof performance === "object" && typeof performance.now === "function";
const now = hasNativePerformanceNow
  ? () => performance.now()
  : () => Date.now();
function msToExpirationTime(ms) {
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
}
// 这是数字number类型,当前的时间戳，是一串数字，距离标准时间的毫秒数
let originalStartTimeMs = now();

// 当前的过期时间（优先级的包裹形态，最终形态），(x/y)|0表示y差距以内的数都相同，抹平了短时间内重复交互导致过期时间不一样的问题
var currentRendererTime = msToExpirationTime(originalStartTimeMs);
// 两个变量的初始化默认都是一个时间戳，单纯的时间戳，而非某个时间差
// 在首次渲染阶段，两个变量都会变为首次渲染准备开始的时间与下载完js开始执行的时间
// 因为首次渲染肯定会执行updateContainer
var currentSchedulerTime = currentRendererTime;

// !优先级（初始形态）定义
var ImmediatePriority = 1;
var UserBlockingPriority = 2;
var NormalPriority = 3;
var LowPriority = 4;
var IdlePriority = 5;

// 当前的优先级（初始形态），初始化状态为中等优先级，3水平
var currentPriorityLevel = NormalPriority;
var currentEventStartTime = -1;
var currentExpirationTime = -1;

var callbackExpirationTime = NoWork;
var callbackID = void 0;

// schedule阶段也用到了
// 记录下一个优先级最高的root，也就是即将要操作调度的root？？？
var nextFlushedRoot = null;
var nextFlushedExpirationTime = NoWork;

// 阶段的标识符
// 是否正在渲染过程中，指的是“遍历树的开始”到“遍历副作用链结束”的过程，初始化肯定是否
// isRendering就是包含render阶段和commit阶段，是整个渲染过程的开关指示器
var isRendering = false;
var isWorking = false;
var isCommitting$1 = false;

// 下面的很重要，是跟随两个阶段（render和commit）一直不断变化的，主要在renderRoot里面被更新
// 下一个将要创建fiber的虚拟DOM，也是一个单元
var nextUnitOfWork = null;
var nextRoot = null;
// 正在渲染阶段的过期时间，初始化值是最低的优先级，目的干嘛？？在renderRoot里面被赋值
// root.nextExpirationTimeToWorkOn等于这个全局值
var nextRenderExpirationTime = NoWork;

var lowestPriorityPendingInteractiveExpirationTime = NoWork;
var hasUnhandledError = false;
var unhandledError = null;

var completedBatches = null;

// 上下文，如果用户使用了react的context，就可以保存在这里，全局的对象上面
var emptyContextObject = {};
{
  Object.freeze(emptyContextObject);
}
var contextStackCursor = createCursor(emptyContextObject);
var didPerformWorkStackCursor = createCursor(false);
var previousContext = emptyContextObject;
function createCursor(defaultValue) {
  return {
    current: defaultValue,
  };
}
// push方法使用的索引
var index = -1;
// push方法用来保存上下文的数组
var valueStack = [];
// push方法用来保存fiber
var fiberStack = void 0;

var NO_CONTEXT = {};
var contextStackCursor$1 = createCursor(NO_CONTEXT);
var contextFiberStackCursor = createCursor(NO_CONTEXT);
var rootInstanceStackCursor = createCursor(NO_CONTEXT);

// 5. 从root开始更新的scheduleRootUpdate（也可以说是updateContainerForExpirationTime）的阶段

// 工具类
var ReactFiberInstrumentation = {
  debugTool: null,
};
var ReactFiberInstrumentation_1 = ReactFiberInstrumentation;

// 记录当前工作中的fiber的
var current = null;
var phase = null;
var didWarnAboutNestedUpdates = void 0;
var didWarnAboutFindNodeInStrictMode = void 0;

// 更新的类别
var UpdateState = 0;
var ReplaceState = 1;
var ForceUpdate = 2;
var CaptureUpdate = 3;

// 这是什么目的？？？？？？
var rootWithPendingPassiveEffects = null;
var passiveEffectCallbackHandle = null;
var passiveEffectCallback = null;

// 把更新对象保存起来！
var didWarnUpdateInsideUpdate = void 0;
var currentlyProcessingQueue = void 0;
var resetCurrentlyProcessingQueue = void 0;

// 6. 全局调度的scheduleWork阶段

// 工具类
var enableUserTimingAPI = true;

// 当前的阶段，用来干嘛？？？？？？
var currentPhase = null;
var currentPhaseFiber = null;

// 这是干嘛，很多地方用到了？？？？初始值为true
var enableSchedulerTracing = true;

// 7. renderRoot阶段

// dispatcher相关
var ReactSharedInternals =
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
if (!ReactSharedInternals.hasOwnProperty("ReactCurrentDispatcher")) {
  ReactSharedInternals.ReactCurrentDispatcher = {
    current: null,
  };
}
var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
var ReactCurrentOwner$2 = ReactSharedInternals.ReactCurrentOwner;

var ContextOnlyDispatcher = {
  readContext: readContext,

  useCallback: throwInvalidHookError,
  useContext: throwInvalidHookError,
  useEffect: throwInvalidHookError,
  useImperativeHandle: throwInvalidHookError,
  useLayoutEffect: throwInvalidHookError,
  useMemo: throwInvalidHookError,
  useReducer: throwInvalidHookError,
  useRef: throwInvalidHookError,
  useState: throwInvalidHookError,
  useDebugValue: throwInvalidHookError,
};

// 当前的fiber记录器
var currentFiber = null;
// 当前的loop中提交次数
var commitCountInCurrentWorkLoop = 0;

// 工具类
// 性能更新追踪
var supportsUserTiming =
  typeof performance !== "undefined" &&
  typeof performance.mark === "function" &&
  typeof performance.clearMarks === "function" &&
  typeof performance.measure === "function" &&
  typeof performance.clearMeasures === "function";
var stashedWorkInProgressProperties = void 0;
var mayReplayFailedUnitOfWork = void 0;
var isReplayingFailedUnitOfWork = void 0;

// 这是干嘛？？
var replayFailedUnitOfWorkWithInvokeGuardedCallback = true;

// 8. beginWork阶段
// 新旧props是否一样，不一样需要更新
var didReceiveUpdate = false;

// 标签的处理
var emptyAncestorInfo = {
  current: null,

  formTag: null,
  aTagInScope: null,
  buttonTagInScope: null,
  nobrTagInScope: null,
  pTagInButtonScope: null,

  listItemTagAutoclosing: null,
  dlItemTagAutoclosing: null,
};

// 是否强制批量更新？？
var hasForceUpdate = false;

// 当前正在进行更新的额queue对象
var currentlyProcessingQueue = void 0;

// 9. proceedUpdateQueue阶段

// 副作用链的标识
var Placement = /*             */ 2;
var Update = /*                */ 4;
var PlacementAndUpdate = /*    */ 6;
var Deletion = /*              */ 8;
var ContentReset = /*          */ 16;
var Callback = /*              */ 32;
var DidCapture = /*            */ 64;
var Ref = /*                   */ 128;
var Snapshot = /*              */ 256;
var Passive = /*               */ 512;

// 两个变量为React Dev Tools所用
var NoEffect = /*              */ 0;
var PerformedWork = /*         */ 1;

// 10. scheduleChildren阶段

// 孩子的组件类型的定义，fiber的tag定义！！
var FunctionComponent = 0;
var ClassComponent = 1;
var IndeterminateComponent = 2; // Before we know whether it is function or class
var HostRoot = 3; // Root of a host tree. Could be nested inside another node.
var HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
var HostComponent = 5;
var HostText = 6;
var Fragment = 7;
var Mode = 8;
var ContextConsumer = 9;
var ContextProvider = 10;
var ForwardRef = 11;
var Profiler = 12;
var SuspenseComponent = 13;
var MemoComponent = 14;
var SimpleMemoComponent = 15;
var LazyComponent = 16;
var IncompleteClassComponent = 17;
var DehydratedSuspenseComponent = 18;

// 服务器渲染相关信息！
// 当前是否水化！
var supportsHydration = true;
var hydrationParentFiber = null;
var nextHydratableInstance = null;
var isHydrating = false;

// 在每个函数组件或者类组件处理期间需要用到的变量
var renderExpirationTime = NoWork;
// 实际上就是WIP，只是名字不同
var currentlyRenderingFiber$1 = null;

// Hooks are stored as a linked list on the fiber's memoizedState field. The
// current hook list is the list that belongs to the current fiber. The
// work-in-progress hook list is a new list that will be added to the
// work-in-progress fiber.
var currentHook = null;
var nextCurrentHook = null;
var firstWorkInProgressHook = null;
var workInProgressHook = null;
var nextWorkInProgressHook = null;

var remainingExpirationTime = NoWork;
var componentUpdateQueue = null;
var sideEffectTag = 0;

// 什么时候用？？？？？赋予effectTag的值的时候吗
var NoEffect$1 = /*             */ 0;
var UnmountSnapshot = /*      */ 2;
var UnmountMutation = /*      */ 4;
var MountMutation = /*        */ 8;
var UnmountLayout = /*        */ 16;
var MountLayout = /*          */ 32;
var MountPassive = /*         */ 64;
var UnmountPassive = /*       */ 128;

// 11. （不是一个阶段，是一个专题）dispatcher相关的

// 函数执行过程中使用的存储器，实际上就是ReactCurrentDispatcher，只是为了函数调用方便又赋了一个变量
var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;

// hooks的工具箱！！
HooksDispatcherOnMountInDEV = {
  readContext: function (context, observedBits) {
    return readContext(context, observedBits);
  },
  useCallback: function (callback, deps) {
    currentHookNameInDev = "useCallback";
    mountHookTypesDev();
    return mountCallback(callback, deps);
  },
  useContext: function (context, observedBits) {
    currentHookNameInDev = "useContext";
    mountHookTypesDev();
    return readContext(context, observedBits);
  },
  useEffect: function (create, deps) {
    currentHookNameInDev = "useEffect";
    mountHookTypesDev();
    return mountEffect(create, deps);
  },
  useImperativeHandle: function (ref, create, deps) {
    currentHookNameInDev = "useImperativeHandle";
    mountHookTypesDev();
    return mountImperativeHandle(ref, create, deps);
  },
  useLayoutEffect: function (create, deps) {
    currentHookNameInDev = "useLayoutEffect";
    mountHookTypesDev();
    return mountLayoutEffect(create, deps);
  },
  useMemo: function (create, deps) {
    currentHookNameInDev = "useMemo";
    mountHookTypesDev();
    var prevDispatcher = ReactCurrentDispatcher$1.current;
    ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
    try {
      return mountMemo(create, deps);
    } finally {
      ReactCurrentDispatcher$1.current = prevDispatcher;
    }
  },
  useReducer: function (reducer, initialArg, init) {
    currentHookNameInDev = "useReducer";
    mountHookTypesDev();
    var prevDispatcher = ReactCurrentDispatcher$1.current;
    ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
    try {
      return mountReducer(reducer, initialArg, init);
    } finally {
      ReactCurrentDispatcher$1.current = prevDispatcher;
    }
  },
  useRef: function (initialValue) {
    currentHookNameInDev = "useRef";
    mountHookTypesDev();
    return mountRef(initialValue);
  },
  useState: function (initialState) {
    currentHookNameInDev = "useState";
    mountHookTypesDev();
    var prevDispatcher = ReactCurrentDispatcher$1.current;
    ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
    try {
      return mountState(initialState);
    } finally {
      ReactCurrentDispatcher$1.current = prevDispatcher;
    }
  },
  useDebugValue: function (value, formatterFn) {
    currentHookNameInDev = "useDebugValue";
    mountHookTypesDev();
    return mountDebugValue(value, formatterFn);
  },
};

// ？？？？？？？？用来？？
// Whether an update was scheduled during the currently executing render pass.
var didScheduleRenderPhaseUpdate = false;
// Lazily created map of render-phase updates
var renderPhaseUpdates = null;
// Counter to prevent infinite loops.
var numberOfReRenders = 0;
var RE_RENDER_LIMIT = 25;

// In DEV, this is the name of the currently executing primitive hook
var currentHookNameInDev = null;

// In DEV, this list ensures that hooks are called in the same order between renders.
// The list stores the order of hooks used during the initial render (mount).
// Subsequent renders (updates) reference this list.
var hookTypesDev = null;
var hookTypesUpdateIndexDev = -1;

// REVIEW - 创建虚拟DOM（jsx等于虚拟DOM）

function createElementWithValidation(type, props, children) {
  // 验证第一个参数！
  var validType = isValidElementType(type);

  if (!validType) {
    var info = "";
    if (
      type === undefined ||
      (typeof type === "object" &&
        type !== null &&
        Object.keys(type).length === 0)
    ) {
      info +=
        " You likely forgot to export your component from the file " +
        "it's defined in, or you might have mixed up default and named imports.";
    }

    var sourceInfo = getSourceInfoErrorAddendum(props);
    if (sourceInfo) {
      info += sourceInfo;
    } else {
      info += getDeclarationErrorAddendum();
    }

    var typeString = void 0;
    if (type === null) {
      typeString = "null";
    } else if (Array.isArray(type)) {
      typeString = "array";
    } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
      typeString = "<" + (getComponentName(type.type) || "Unknown") + " />";
      info =
        " Did you accidentally export a JSX literal instead of a component?";
    } else {
      typeString = typeof type;
    }

    warning$1(
      false,
      "React.createElement: type is invalid -- expected a string (for " +
        "built-in components) or a class/function (for composite " +
        "components) but got: %s.%s",
      typeString,
      info
    );
  }

  // 开始正式整合材料 + 创建对象
  var element = createElement.apply(this, arguments);

  if (element == null) {
    return element;
  }

  // 遍历检查孩子
  if (validType) {
    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], type);
    }
  }

  // 检查props对象是不是有不合法的key名字
  if (type === REACT_FRAGMENT_TYPE) {
    validateFragmentProps(element);
  } else {
    validatePropTypes(element);
  }

  return element;
}

function createElement(type, config, children) {
  var propName = void 0;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = "" + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;

    // 把所有的config上面的（不包括原型上面）的属性放到props里面
    // 相当于用Object.keys拿到config对象的keyName，然后放到props上面
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // 把children放到props对象上面
  // 为了防止后面还有第四个参数，也放到children数组上面
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  // 如果type是一个class组件，那么把类组件的私有props也放入props对象里面
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  // 下面在干嘛？
  // 为props放入key和ref属性，get函数是拿到警告信息
  {
    if (key || ref) {
      var displayName =
        typeof type === "function"
          ? type.displayName || type.name || "Unknown"
          : type;
      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }
      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }
  }
  // 把材料整合起来，成为一个虚拟DOM，就是一个对象
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
}

var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };

  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    Object.defineProperty(element._store, "validated", {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false,
    });
    // self and source are DEV only properties.
    Object.defineProperty(element, "_self", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    });
    // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.
    Object.defineProperty(element, "_source", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source,
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};

function validateChildKeys(node, parentType) {
  if (typeof node !== "object") {
    return;
  }
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var child = node[i];
      if (isValidElement(child)) {
        validateExplicitKey(child, parentType);
      }
    }
  } else if (isValidElement(node)) {
    // This element was passed in a valid location.
    if (node._store) {
      node._store.validated = true;
    }
  } else if (node) {
    var iteratorFn = getIteratorFn(node);
    if (typeof iteratorFn === "function") {
      // Entry iterators used to provide implicit keys,
      // but now we print a separate warning for them later.
      if (iteratorFn !== node.entries) {
        var iterator = iteratorFn.call(node);
        var step = void 0;
        while (!(step = iterator.next()).done) {
          if (isValidElement(step.value)) {
            validateExplicitKey(step.value, parentType);
          }
        }
      }
    }
  }
}

function validatePropTypes(element) {
  var type = element.type;
  if (type === null || type === undefined || typeof type === "string") {
    return;
  }
  var name = getComponentName(type);

  // 下面是在判断propTypes（若有）的props类型是否合法
  var propTypes = void 0;
  if (typeof type === "function") {
    propTypes = type.propTypes;
  } else if (
    typeof type === "object" &&
    (type.$$typeof === REACT_FORWARD_REF_TYPE ||
      // Note: Memo only checks outer props here.
      // Inner props are checked in the reconciler.
      type.$$typeof === REACT_MEMO_TYPE)
  ) {
    propTypes = type.propTypes;
  } else {
    return;
  }
  if (propTypes) {
    setCurrentlyValidatingElement(element);
    checkPropTypes(
      propTypes,
      element.props,
      "prop",
      name,
      ReactDebugCurrentFrame.getStackAddendum
    );
    setCurrentlyValidatingElement(null);
  } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
    propTypesMisspellWarningShown = true;
    warningWithoutStack$1(
      false,
      "Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?",
      name || "Unknown"
    );
  }
  if (typeof type.getDefaultProps === "function") {
    !type.getDefaultProps.isReactClassApproved
      ? warningWithoutStack$1(
          false,
          "getDefaultProps is only used on classic React.createClass " +
            "definitions. Use a static property named `defaultProps` instead."
        )
      : void 0;
  }
}

function getComponentName(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }
  {
    if (typeof type.tag === "number") {
      warningWithoutStack$1(
        false,
        "Received an unexpected object in getComponentName(). " +
          "This is likely a bug in React. Please file an issue."
      );
    }
  }
  if (typeof type === "function") {
    return type.displayName || type.name || null;
  }
  if (typeof type === "string") {
    return type;
  }
  switch (type) {
    case REACT_CONCURRENT_MODE_TYPE:
      return "ConcurrentMode";
    case REACT_FRAGMENT_TYPE:
      return "Fragment";
    case REACT_PORTAL_TYPE:
      return "Portal";
    case REACT_PROFILER_TYPE:
      return "Profiler";
    case REACT_STRICT_MODE_TYPE:
      return "StrictMode";
    case REACT_SUSPENSE_TYPE:
      return "Suspense";
  }
  if (typeof type === "object") {
    switch (type.$$typeof) {
      case REACT_CONTEXT_TYPE:
        return "Context.Consumer";
      case REACT_PROVIDER_TYPE:
        return "Context.Provider";
      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, "ForwardRef");
      case REACT_MEMO_TYPE:
        return getComponentName(type.type);
      case REACT_LAZY_TYPE: {
        var thenable = type;
        var resolvedThenable = refineResolvedLazyComponent(thenable);
        if (resolvedThenable) {
          return getComponentName(resolvedThenable);
        }
      }
    }
  }
  return null;
}

// REVIEW - ReactDOM的render方法，主入口，创建root对象，fiber，ReactRoot对象等

var ReactDOM = {
  render: function (element, container, callback) {
    !isValidContainer(container)
      ? invariant(false, "Target container is not a DOM element.")
      : void 0;
    {
      !!container._reactHasBeenPassedToCreateRootDEV
        ? warningWithoutStack$1(
            false,
            "You are calling ReactDOM.render() on a container that was previously " +
              "passed to ReactDOM.%s(). This is not supported. " +
              "Did you mean to call root.render(element)?",
            enableStableConcurrentModeAPIs
              ? "createRoot"
              : "unstable_createRoot"
          )
        : void 0;
    }
    return legacyRenderSubtreeIntoContainer(
      null,
      element,
      container,
      false,
      callback
    );
  },
};

function legacyRenderSubtreeIntoContainer(
  parentComponent,
  children,
  container,
  forceHydrate,
  callback
) {
  {
    topLevelUpdateWarnings(container);
  }

  // member of intersection type." Whyyyyyy.
  var root = container._reactRootContainer;
  if (!root) {
    // 【首次渲染的时候】，root原生节点没有_reactRootContainer属性

    // 创建ReactRoot对象，并把这个对象放到原生的DOM上面了，利用_reactRootContainer属性可以获得
    // 下一次只要container还是那个container，也就是复用了原来的root真实的节点，那么第二次渲染就不会进入到这个判断里面
    // 这里做一个缓存的作用，保证连ReactRoot对象本身都是可以复用的
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate
    );

    // 如果还有第三个参数，源地修改一下这个回调，并以纯正的root作为对象，作为他的上下文，让他可以拿到某些属性
    // 后面放入队列，等到commit完之后执行
    if (typeof callback === "function") {
      var originalCallback = callback;
      callback = function () {
        var instance = getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }

    // 首次渲染（没有母节点，也就是从根开始更新）不应该是批次更新，而应该是瞬时更新
    unbatchedUpdates(function () {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback
        );
      } else {
        root.render(children, callback);
      }
    });
  } else {
    if (typeof callback === "function") {
      var _originalCallback = callback;
      callback = function () {
        var instance = getPublicRootInstance(root._internalRoot);
        _originalCallback.call(instance);
      };
    }
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback
      );
    } else {
      root.render(children, callback);
    }
  }
  return getPublicRootInstance(root._internalRoot);
}

function legacyCreateRootFromDOMContainer(container, forceHydrate) {
  // 看是否需要水化
  var shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  if (!shouldHydrate) {
    var warned = false;
    var rootSibling = void 0;
    while ((rootSibling = container.lastChild)) {
      {
        if (
          !warned &&
          rootSibling.nodeType === ELEMENT_NODE &&
          rootSibling.hasAttribute(ROOT_ATTRIBUTE_NAME)
        ) {
          warned = true;
          warningWithoutStack$1(
            false,
            "render(): Target node has markup rendered by React, but there " +
              "are unrelated nodes as well. This is most commonly caused by " +
              "white-space inserted around server-rendered markup."
          );
        }
      }
      container.removeChild(rootSibling);
    }
  }
  {
    if (shouldHydrate && !forceHydrate && !warnedAboutHydrateAPI) {
      warnedAboutHydrateAPI = true;
      lowPriorityWarning$1(
        false,
        "render(): Calling ReactDOM.render() to hydrate server-rendered markup " +
          "will stop working in React v17. Replace the ReactDOM.render() call " +
          "with ReactDOM.hydrate() if you want React to attach to the server HTML."
      );
    }
  }

  // 普通的非服务器渲染的react情况：
  // root节点或对象是非同步的
  // 创建root对象，实际上是包裹了一层ReactRoot的对象，一层属性有_internalRoot，里面才是指向的root对象
  // 虽然属性只有一个，但是另外提供了很多方法，其中的render方法是最重要的入口
  var isConcurrent = false;
  return new ReactRoot(container, isConcurrent, shouldHydrate);
}

function ReactRoot(container, isConcurrent, hydrate) {
  var root = createContainer(container, isConcurrent, hydrate);
  this._internalRoot = root;
}
ReactRoot.prototype.render = function (children, callback) {
  var root = this._internalRoot;
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, "render");
  }
  if (callback !== null) {
    work.then(callback);
  }
  updateContainer(children, root, null, work._onCommit);
  return work;
};
ReactRoot.prototype.unmount = function (callback) {
  var root = this._internalRoot;
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, "render");
  }
  if (callback !== null) {
    work.then(callback);
  }
  updateContainer(null, root, null, work._onCommit);
  return work;
};
ReactRoot.prototype.legacy_renderSubtreeIntoContainer = function (
  parentComponent,
  children,
  callback
) {
  var root = this._internalRoot;
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, "render");
  }
  if (callback !== null) {
    work.then(callback);
  }
  updateContainer(children, root, parentComponent, work._onCommit);
  return work;
};
ReactRoot.prototype.createBatch = function () {
  var batch = new ReactBatch(this);
  var expirationTime = batch._expirationTime;

  var internalRoot = this._internalRoot;
  var firstBatch = internalRoot.firstBatch;
  if (firstBatch === null) {
    internalRoot.firstBatch = batch;
    batch._next = null;
  } else {
    // Insert sorted by expiration time then insertion order
    var insertAfter = null;
    var insertBefore = firstBatch;
    while (
      insertBefore !== null &&
      insertBefore._expirationTime >= expirationTime
    ) {
      insertAfter = insertBefore;
      insertBefore = insertBefore._next;
    }
    batch._next = insertBefore;
    if (insertAfter !== null) {
      insertAfter._next = batch;
    }
  }

  return batch;
};

function createContainer(containerInfo, isConcurrent, hydrate) {
  return createFiberRoot(containerInfo, isConcurrent, hydrate);
}

function createFiberRoot(containerInfo, isConcurrent, hydrate) {
  // 创建根节点的根fiber！！！
  var uninitializedFiber = createHostRootFiber(isConcurrent);

  var root = void 0;
  if (enableSchedulerTracing) {
    root = {
      // 这里装着fiber对象
      current: uninitializedFiber,
      // 这里装着原生的DOM对象
      containerInfo: containerInfo,
      pendingChildren: null,

      earliestPendingTime: NoWork,
      latestPendingTime: NoWork,
      earliestSuspendedTime: NoWork,
      latestSuspendedTime: NoWork,
      latestPingedTime: NoWork,

      pingCache: null,

      didError: false,

      pendingCommitExpirationTime: NoWork,
      finishedWork: null,
      timeoutHandle: noTimeout,
      context: null,
      pendingContext: null,
      hydrate: hydrate,
      nextExpirationTimeToWorkOn: NoWork,
      expirationTime: NoWork,
      firstBatch: null,
      nextScheduledRoot: null,

      // 跟踪交互的触发（每次提交）
      interactionThreadID: tracing.unstable_getThreadID(),
      memoizedInteractions: new Set(),
      pendingInteractionMap: new Map(),
    };
  } else {
    root = {
      current: uninitializedFiber,
      containerInfo: containerInfo,
      pendingChildren: null,

      pingCache: null,

      earliestPendingTime: NoWork,
      latestPendingTime: NoWork,
      earliestSuspendedTime: NoWork,
      latestSuspendedTime: NoWork,
      latestPingedTime: NoWork,

      didError: false,

      pendingCommitExpirationTime: NoWork,
      finishedWork: null,
      timeoutHandle: noTimeout,
      context: null,
      pendingContext: null,
      hydrate: hydrate,
      nextExpirationTimeToWorkOn: NoWork,
      expirationTime: NoWork,
      firstBatch: null,
      nextScheduledRoot: null,
    };
  }

  // 这里是root对象和root的fiber对象的相互引用
  // 也就是说，root的fiber的stateNode指向的不是root原生的DOM，而是root对象
  uninitializedFiber.stateNode = root;

  return root;
}

function createHostRootFiber(isConcurrent) {
  // 如果isConcurrent是false，也就是非同步，让模式为000
  // 如果isConcurrent是true，也就是同步，让模式为001和010的或运算得到011
  // 首次渲染状态下，isConcurrent是false，模式为000
  var mode = isConcurrent ? ConcurrentMode | StrictMode : NoContext;

  // 如果使用了开发工具，记录一下时间？？？什么的时间
  if (enableProfilerTimer && isDevToolsPresent) {
    mode |= ProfileMode;
  }

  return createFiber(HostRoot, null, null, mode);
}

var createFiber = function (tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
};

function FiberNode(tag, pendingProps, key, mode) {
  // tag可以说是type的类型
  // Instance
  this.tag = tag;
  this.key = key;
  // 下面两个区别？？？？？
  this.elementType = null;
  this.type = null;
  // 原生dom
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.contextDependencies = null;

  this.mode = mode;

  // Effects
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 注意：任何fiber的过期时间的初始化都是0，是最低的优先级
  this.expirationTime = NoWork;
  this.childExpirationTime = NoWork;

  this.alternate = null;

  // 开发模式下，记录时间，初始化
  if (enableProfilerTimer) {
    this.actualDuration = Number.NaN;
    this.actualStartTime = Number.NaN;
    this.selfBaseDuration = Number.NaN;
    this.treeBaseDuration = Number.NaN;

    this.actualDuration = 0;
    this.actualStartTime = -1;
    this.selfBaseDuration = 0;
    this.treeBaseDuration = 0;
  }

  {
    this._debugID = debugCounter++;
    this._debugSource = null;
    this._debugOwner = null;
    this._debugIsCurrentlyTiming = false;
    this._debugHookTypes = null;
    if (!hasBadMapPolyfill && typeof Object.preventExtensions === "function") {
      Object.preventExtensions(this);
    }
  }
}

// REVIEW - ReactDOM的render方法，主入口后面的unbatchedUpdates更新函数，调用ReactRoot的render方法更新

// 创建完root对象之后，进入此函数，这个函数用来调节批量更新
function unbatchedUpdates(fn, a) {
  // 如果是批量更新，修改isUnbatchingUpdates变量，执行回调函数，后面再把isUnbatchingUpdates改回来
  if (isBatchingUpdates && !isUnbatchingUpdates) {
    isUnbatchingUpdates = true;
    try {
      return fn(a);
    } finally {
      isUnbatchingUpdates = false;
    }
  }
  // 首次渲染阶段（两个变量都是false（相互矛盾）），需要立刻执行回调函数
  // 或者是非批量更新的模式，需要立刻执行回调函数
  return fn(a);
}
// 其中回调函数长下面这样：
// function () {
//   if (parentComponent != null) {
//     root.legacy_renderSubtreeIntoContainer(parentComponent, children, callback);
//   } else {
//     root.render(children, callback);
//   }
// }
// 如果是顶层的执行（顶层的，仅次于root节点的下一个节点），parentComponent就是null
// 这个时候执行的是ReactRoot对象的render方法
// *REVIEW - 问题
// ?为什么要把核心主入口函数放到ReactRoot对象上面呢？
// ?是不是因为ReactRoot对象上面保存有root对象，可以直接通过
// legacyRenderSubtreeIntoContainer函数分发两个东西，一个是创建好的ReactRoot对象，一个是定义批量或非批量，执行入口函数

ReactRoot.prototype.render = function (children, callback) {
  var root = this._internalRoot;

  // 创建一个work，用来保存render函数的第三个参数，后面等到一定的时机会执行
  // _callbacks数组存的callback函数
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, "render");
  }

  // then方法是在把callback函数加入队列，也就是ReactWork实例存储的回调函数队列里面
  if (callback !== null) {
    work.then(callback);
  }

  // 开始真正的更新，真正的入口原来在这里！！！！！！
  updateContainer(children, root, null, work._onCommit);
  return work;
};

function ReactWork() {
  this._callbacks = null;
  this._didCommit = false;
  // list of Work objects.
  this._onCommit = this._onCommit.bind(this);
}
ReactWork.prototype.then = function (onCommit) {
  if (this._didCommit) {
    onCommit();
    return;
  }
  var callbacks = this._callbacks;
  if (callbacks === null) {
    callbacks = this._callbacks = [];
  }
  callbacks.push(onCommit);
};
ReactWork.prototype._onCommit = function () {
  if (this._didCommit) {
    return;
  }
  this._didCommit = true;
  var callbacks = this._callbacks;
  if (callbacks === null) {
    return;
  }
  for (var i = 0; i < callbacks.length; i++) {
    var _callback2 = callbacks[i];
    !(typeof _callback2 === "function")
      ? invariant(
          false,
          "Invalid argument passed as callback. Expected a function. Instead received: %s",
          _callback2
        )
      : void 0;
    _callback2();
  }
};

// REVIEW - ReactRoot对象里面的render方法调用的updateContainer函数，是真正的入口！！！开始计算过期时间（优先级）
// 分两步，首先计算过期时间，然后根据过期时间进行更新

function updateContainer(element, container, parentComponent, callback) {
  // 拿到的是root的fiber对象
  var current$$1 = container.current;
  // 计算当前的时间（当前执行到这个函数与拿到js初始执行的那一个的时间差）
  var currentTime = requestCurrentTime();
  // 根据当前时间计算优先级，肯定是越往后交互的事件导致引发的scheduleWork引发的计算优先级会更高
  var expirationTime = computeExpirationForFiber(currentTime, current$$1);
  // 开始更新，根据优先级
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback
  );
}

function requestCurrentTime() {
  // 在一次render中，如果我有一个新的任务进来了，要计算 expirationTime 发现现在处于渲染阶段，这时直接返回上次 render 开始的时间，再去计算 expirationTime
  // 好处是 前后两次计算出来的 expirationTime 是一样的，让这个任务提前进行调度
  if (isRendering) {
    return currentSchedulerTime;
  }

  // ?找优先级最高的一个root。。。。。。。目的是？？？？
  findHighestPriorityRoot();

  // 如果nextFlushedExpirationTime是优先级低（1）和最低（0）的，都要重新计算一下当前的时间，为什么？？？？？？？
  // 在首次渲染阶段，nextFlushedExpirationTime是0，
  // ?每次findHighestPriorityRoot执行完之后，都会把nextFlushedExpirationTime变为xxxxxx
  if (
    nextFlushedExpirationTime === NoWork ||
    nextFlushedExpirationTime === Never
  ) {
    // 如果当前没有任务进行，或者组件从来没有更新过，重新算一下现在的时间距离初始schedule的时间中间经过了多长时间，赋予给currentRendererTime，return出去，作为currentTime

    recomputeCurrentRendererTime();
    currentSchedulerTime = currentRendererTime;
    return currentSchedulerTime;
  }

  // 在一个batched更新中，只有第一次创建更新才会重新计算时间，后面的所有更新都会复用第一次创建更新的时候的时间，这个也是为了保证在一个批量更新中产生的同类型的更新只会有相同的过期时间
  return currentSchedulerTime;
}

function findHighestPriorityRoot() {
  var highestPriorityWork = NoWork;
  var highestPriorityRoot = null;

  // 首次渲染阶段：一开始的lastScheduledRoot最后一个root肯定为空，不走这里
  // ?待定看
  if (lastScheduledRoot !== null) {
    var previousScheduledRoot = lastScheduledRoot;
    var root = firstScheduledRoot;
    while (root !== null) {
      var remainingExpirationTime = root.expirationTime;
      if (remainingExpirationTime === NoWork) {
        // This root no longer has work. Remove it from the scheduler.
        // below where we set lastScheduledRoot to null, even though we break
        // from the loop right after.
        !(previousScheduledRoot !== null && lastScheduledRoot !== null)
          ? invariant(
              false,
              "Should have a previous and last root. This error is likely caused by a bug in React. Please file an issue."
            )
          : void 0;
        if (root === root.nextScheduledRoot) {
          // This is the only root in the list.
          root.nextScheduledRoot = null;
          firstScheduledRoot = lastScheduledRoot = null;
          break;
        } else if (root === firstScheduledRoot) {
          // This is the first root in the list.
          var next = root.nextScheduledRoot;
          firstScheduledRoot = next;
          lastScheduledRoot.nextScheduledRoot = next;
          root.nextScheduledRoot = null;
        } else if (root === lastScheduledRoot) {
          // This is the last root in the list.
          lastScheduledRoot = previousScheduledRoot;
          lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
          root.nextScheduledRoot = null;
          break;
        } else {
          previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
          root.nextScheduledRoot = null;
        }
        root = previousScheduledRoot.nextScheduledRoot;
      } else {
        if (remainingExpirationTime > highestPriorityWork) {
          // Update the priority, if it's higher
          highestPriorityWork = remainingExpirationTime;
          highestPriorityRoot = root;
        }
        if (root === lastScheduledRoot) {
          break;
        }
        if (highestPriorityWork === Sync) {
          // Sync is highest priority by definition so
          // we can stop searching.
          break;
        }
        previousScheduledRoot = root;
        root = root.nextScheduledRoot;
      }
    }
  }

  // ?这两个参数用来干嘛？？？？？
  // 每次找优先级最高的root都会：把红扑扑的根节点和优先级初始化定义一下，优先级为xxx，root为xxx
  // 初始阶段：root是null，优先级是最低级为0
  nextFlushedRoot = highestPriorityRoot;
  nextFlushedExpirationTime = highestPriorityWork;
}

// 【调用当前这个函数】到【scheduleWork开始的时候】（或者【js下载完之后开始执行的时间】）中间经过的时间，（一次渲染或更新（视图渲染那种））
// 那么这个函数什么时候调用？？？需要用到currentTime的时候，或者需要计算expirationTime的时候
// originalStartTimeMs是指react buddle加载完成之后初始的时间，也就是js加载完成的时间
function recomputeCurrentRendererTime() {
  const currentTimeMs = now() - originalStartTimeMs;
  currentRendererTime = msToExpirationTime(currentTimeMs);
}

function computeExpirationForFiber(currentTime, fiber) {
  // 拿到当前的优先级，当前的什么的优先级？？？？？fiber的优先级？？？
  const priorityLevel = getCurrentPriorityLevel();

  let expirationTime;

  // 首次渲染状态下，isConcurrent是false，root的fiber.mode模式为000
  // ConcurrentMode为001，两者运算得到000，就是NoContext
  // 首次渲染状态下，过期时间就是Sync，最大的那个

  // !知识点！
  // ConcurrentMode：表示启用了并发模式，允许中断渲染以处理更高优先级的任务,会将任务分配到不同的优先级，并分配不同的过期时间，允许中断和恢复。
  // NoContext：表示当前没有启用并发模式，当前不在Concurrent模式下
  // 如果当前 fiber 所处的模式 不是并发模式（即没有启用并发模式，fiber.mode 中没有 ConcurrentMode 标志）
  // 过期时间就是Sync，会立即执行任务而不进行时间分片，所以不需要考虑优先级调度，直接标记为同步处理。
  // React使用位掩码来组合不同的模式，通过按位与操作可以检查当前是否启用了某个模式。

  if ((fiber.mode & ConcurrentMode) === NoContext) {
    expirationTime = Sync;
  } else if (isWorking && !isCommitting$1) {
    // 正在working中，但是没有提交，复用上一次的时间
    expirationTime = nextRenderExpirationTime;
  } else {
    switch (priorityLevel) {
      case ImmediatePriority:
        expirationTime = Sync;
        break;
      case UserBlockingPriority:
        expirationTime = computeInteractiveExpiration(currentTime);
        break;
      case NormalPriority:
        // This is a normal, concurrent update
        expirationTime = computeAsyncExpiration(currentTime);
        break;
      case LowPriority:
      case IdlePriority:
        expirationTime = Never;
        break;
      default:
        break;
    }

    // ?这里在干嘛？？？？
    if (nextRoot !== null && expirationTime === nextRenderExpirationTime) {
      expirationTime -= 1;
    }
  }

  // ?这里在设置最低优先级的过期时间，目的是什么？？？？
  // 首次渲染状态下，lowestPriorityPendingInteractiveExpirationTime是最低优先级，也就是0，但是priorityLevel是3，不满足下面的条件
  if (
    priorityLevel === UserBlockingPriority &&
    (lowestPriorityPendingInteractiveExpirationTime === NoWork ||
      expirationTime < lowestPriorityPendingInteractiveExpirationTime)
  ) {
    lowestPriorityPendingInteractiveExpirationTime = expirationTime;
  }

  return expirationTime;
}

function getCurrentPriorityLevel() {
  return currentPriorityLevel;
}


function computeInteractiveExpiration(currentTime) {
  return computeExpirationBucket(currentTime, HIGH_PRIORITY_EXPIRATION, HIGH_PRIORITY_BATCH_SIZE);
}

function computeAsyncExpiration(currentTime) {
  return computeExpirationBucket(currentTime, LOW_PRIORITY_EXPIRATION, LOW_PRIORITY_BATCH_SIZE);
}


function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs) {
  return MAGIC_NUMBER_OFFSET - ceiling(MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE, bucketSizeMs / UNIT_SIZE);
}

// ceiling 函数用于将数字 num 四舍五入到指定精度（precision）。
// 它确保了差值 MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE 能够按批次大小 bucketSizeMs 分割成“桶”（buckets），这些桶用于调整任务的调度粒度。
// 将时间分桶，让一定时间范围内的任务具有相同的过期时间，这样可以批量处理，减少计算次数，优化性能。
function ceiling(num, precision) {
  return ((num / precision | 0) + 1) * precision;
}
// 按位或0的操作，相当于Math.floor(num/precision)，然后加1再乘以precision，这样就实现了向上取整到precision的倍数。
// 例如，如果num是12，precision是5，那么结果是15。这样的处理可以让同一时间段内的多个任务具有相同的过期时间




// REVIEW - updateContainer函数的最后一个函数updateContainerAtExpirationTime，计算完过期时间，开始着手更新了！！！
// 其中updateContainerAtExpirationTime也是一个小小的包裹，中间保存了上下文到root对象里面
// scheduleRootUpdate才是更新的开始

function updateContainerAtExpirationTime(
  element,
  container,
  parentComponent,
  expirationTime,
  callback
) {
  // 这里拿到的就是root对象的fiber
  var current$$1 = container.current;

  // 浏览器debug工具类的设置
  {
    // 首次渲染阶段：ReactFiberInstrumentation_1的debugTool是null，不走这里
    if (ReactFiberInstrumentation_1.debugTool) {
      if (current$$1.alternate === null) {
        ReactFiberInstrumentation_1.debugTool.onMountContainer(container);
      } else if (element === null) {
        ReactFiberInstrumentation_1.debugTool.onUnmountContainer(container);
      } else {
        ReactFiberInstrumentation_1.debugTool.onUpdateContainer(container);
      }
    }
  }

  // ?这里在设置上下文，目的是什么？？？？
  // 首次渲染阶段：parentComponent为空，拿到空的上下文
  var context = getContextForSubtree(parentComponent);
  // 首次渲染阶段：container，也就是root对象的上下文context是空的，这里给他初始化一个空对象
  if (container.context === null) {
    container.context = context;
  } else {
    container.pendingContext = context;
  }

  return scheduleRootUpdate(current$$1, element, expirationTime, callback);
}

function getContextForSubtree(parentComponent) {
  // 首次渲染阶段：parentComponent为空，拿到空的上下文
  if (!parentComponent) {
    return emptyContextObject;
  }

  var fiber = get(parentComponent);
  var parentContext = findCurrentUnmaskedContext(fiber);

  if (fiber.tag === ClassComponent) {
    var Component = fiber.type;
    if (isContextProvider(Component)) {
      return processChildContext(fiber, Component, parentContext);
    }
  }

  return parentContext;
}

function scheduleRootUpdate(current$$1, element, expirationTime, callback) {
  {
    // 这里在提示什么
    // 首次渲染阶段肯定不符合这个，phase和current都是null
    if (phase === "render" && current !== null && !didWarnAboutNestedUpdates) {
      didWarnAboutNestedUpdates = true;
      warningWithoutStack$1(
        false,
        "Render methods should be a pure function of props and state; " +
          "triggering nested component updates from render is not allowed. " +
          "If necessary, trigger nested updates in componentDidUpdate.\n\n" +
          "Check the render method of %s.",
        getComponentName(current.type) || "Unknown"
      );
    }
  }

  // 1. @@过期时间计算完之后，第一，存到每一个update对象里面
  // 创建一个更新对象
  var update = createUpdate(expirationTime);

  // 保存一些属性，包括虚拟DOM和callback函数
  // 把虚拟的DOM保存一下，保存到更新对象的payload的核心属性里面
  update.payload = { element: element };

  // 把本次render的callback也保存到本次的update对象里面
  // 经过在ReactRoot的render方法里面，传入的callback是work实例的一个_onCommit空函数
  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    !(typeof callback === "function")
      ? warningWithoutStack$1(
          false,
          "render(...): Expected the last optional `callback` argument to be a " +
            "function. Instead received: %s.",
          callback
        )
      : void 0;
    update.callback = callback;
  }

  //
  flushPassiveEffects();

  // 把update对象加入queue更新队列中，queue保存到fiber的updateQueue属性中
  enqueueUpdate(current$$1, update);

  // 调度工作
  scheduleWork(current$$1, expirationTime);

  return expirationTime;
}

function createUpdate(expirationTime) {
  return {
    expirationTime: expirationTime,

    tag: UpdateState,
    payload: null,
    callback: null,

    next: null,
    nextEffect: null,
  };
}

function flushPassiveEffects() {
  // 首次渲染阶段，这两个参数都是null，不走下面的两个逻辑
  if (passiveEffectCallbackHandle !== null) {
    cancelPassiveEffects(passiveEffectCallbackHandle);
  }
  if (passiveEffectCallback !== null) {
    // We call the scheduled callback instead of commitPassiveEffects directly
    // to ensure tracing works correctly.
    passiveEffectCallback();
  }
}

function enqueueUpdate(fiber, update) {
  // 找到上一次的fiber
  var alternate = fiber.alternate;
  var queue1 = void 0;
  var queue2 = void 0;

  // 1. 新建或者复用queue对象，这个对象是用来装下每个update对象的
  // 首次渲染阶段，上一次没有fiber，alternate为空
  if (alternate === null) {
    // 只用一个更新队列（且有的话直接用之前的内存地址，不需要新建一个！！！）
    queue1 = fiber.updateQueue;
    queue2 = null;
    // 首次渲染，fiber都没有更新队列，为null
    // 走下面做初始化，创建一个队列对象，给到fiber的updateQueue属性，注意，队列也是一个对象！！！用的是链表结构，而不是数组！！
    if (queue1 === null) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
    }
  } else {
    // ?待补充！！！！！！！！！！！！！！！！！！！
    // There are two owners.
    queue1 = fiber.updateQueue;
    queue2 = alternate.updateQueue;
    if (queue1 === null) {
      if (queue2 === null) {
        // Neither fiber has an update queue. Create new ones.
        queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
        queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState);
      } else {
        // Only one fiber has an update queue. Clone to create a new one.
        queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
      }
    } else {
      if (queue2 === null) {
        // Only one fiber has an update queue. Clone to create a new one.
        queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
      } else {
        // Both owners have an update queue.
      }
    }
  }

  // 2. 把update对象保存到queue对象里面
  // 首次渲染阶段：只是用到了队列1对象，
  if (queue2 === null || queue1 === queue2) {
    // 这是在处理只用到一个队列的情况，把
    appendUpdateToQueue(queue1, update);
  } else {
    // 这里在处理用到两个队列的情况：
    // ?待补充！！！！！！！！！！！1
    // There are two queues. We need to append the update to both queues,
    // while accounting for the persistent structure of the list — we don't
    // want the same update to be added multiple times.
    if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
      // One of the queues is not empty. We must add the update to both queues.
      appendUpdateToQueue(queue1, update);
      appendUpdateToQueue(queue2, update);
    } else {
      // Both queues are non-empty. The last update is the same in both lists,
      // because of structural sharing. So, only append to one of the lists.
      appendUpdateToQueue(queue1, update);
      // But we still need to update the `lastUpdate` pointer of queue2.
      queue2.lastUpdate = update;
    }
  }

  {
    if (
      fiber.tag === ClassComponent &&
      (currentlyProcessingQueue === queue1 ||
        (queue2 !== null && currentlyProcessingQueue === queue2)) &&
      !didWarnUpdateInsideUpdate
    ) {
      warningWithoutStack$1(
        false,
        "An update (setState, replaceState, or forceUpdate) was scheduled " +
          "from inside an update function. Update functions should be pure, " +
          "with zero side-effects. Consider using componentDidUpdate or a " +
          "callback."
      );
      didWarnUpdateInsideUpdate = true;
    }
  }
}

function createUpdateQueue(baseState) {
  var queue = {
    baseState: baseState,

    // 保存update对象，记录首尾，中间的链条让update对象自己手拉手连接（next）
    firstUpdate: null,
    lastUpdate: null,

    firstCapturedUpdate: null,
    lastCapturedUpdate: null,
    firstEffect: null,
    lastEffect: null,
    firstCapturedEffect: null,
    lastCapturedEffect: null,
  };
  return queue;
}

function appendUpdateToQueue(queue, update) {
  // 把当前的update对象加入到queue的链表中

  if (queue.lastUpdate === null) {
    // 如果当前的queue对象的最后一个update不存在，也就是链表本身就不存在
    // 是首次渲染的情况，就初始化firstUpdate和lastUpdate
    queue.firstUpdate = queue.lastUpdate = update;
  } else {
    // 如果queue对象的最后一个update存在，把当前的update更新到链表的末尾，然后让last指针指向当前的update对象（末尾）
    queue.lastUpdate.next = update;
    queue.lastUpdate = update;
  }
}

// REVIEW - scheduleRootUpdate的scheduleWork，保存好更新队列之后，开始全局从root开始调度！！！

function scheduleWork(fiber, expirationTime) {
  // 首先先攀岩到根root上面，无论目前身处哪个fiber，这个root是root对象，而非原生的stateNode
  // 同时更新每个fiber身上的过期时间（优先级），包括替身fiber
  var root = scheduleWorkToRoot(fiber, expirationTime);

  // 处理root为null的情况，不知道啥时候会发生
  if (root === null) {
    {
      switch (fiber.tag) {
        case ClassComponent:
          warnAboutUpdateOnUnmounted(fiber, true);
          break;
        case FunctionComponent:
        case ForwardRef:
        case MemoComponent:
        case SimpleMemoComponent:
          warnAboutUpdateOnUnmounted(fiber, false);
          break;
      }
    }
    return;
  }

  // ?这是在干啥？？？？首次渲染的nextRenderExpirationTime是NoWork，也就是0
  if (
    !isWorking &&
    nextRenderExpirationTime !== NoWork &&
    expirationTime > nextRenderExpirationTime
  ) {
    // This is an interruption. (Used for performance tracking.)
    interruptedBy = fiber;
    resetStack();
  }

  // ?记录一下最高和最低的优先级，并改一下root的相关属性，目的是？？？？？
  markPendingPriorityLevel(root, expirationTime);

  // 首次渲染阶段进入这里面，因为不在working中
  if (!isWorking || isCommitting$1 || nextRoot !== root) {
    // 把更新过的root.expirationTime过期时间给到下面的分岔路口（走向perform函数的分岔路）
    var rootExpirationTime = root.expirationTime;
    requestWork(root, rootExpirationTime);
  }

  if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
    // Reset this back to zero so subsequent updates don't throw.
    nestedUpdateCount = 0;
    invariant(
      false,
      "Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops."
    );
  }
}

function scheduleWorkToRoot(fiber, expirationTime) {
  // ?做这个的目的是什么？？？
  recordScheduleUpdate();

  // 首次渲染阶段，fiber.stateNode是root对象
  // 如果是类组件，把stateNode赋予给instance实例
  {
    if (fiber.tag === ClassComponent) {
      var instance = fiber.stateNode;
      warnAboutInvalidUpdates(instance);
    }
  }

  // 2. @@过期时间计算完之后，第二，存到每一个fiber或向上的fiber对象或替身的fiber对象里面
  // 首次渲染阶段，fiber的过期时间是0，初始化是0，所以肯定小于当前传入的过期时间，要更新
  if (fiber.expirationTime < expirationTime) {
    fiber.expirationTime = expirationTime;
  }
  // ?同时更新一下过去的fiber的过期时间为最新的，为什么？？？？？
  var alternate = fiber.alternate;
  if (alternate !== null && alternate.expirationTime < expirationTime) {
    alternate.expirationTime = expirationTime;
  }

  // 向上爬，一直找到root节点
  // 如果父节点的孩子优先级小，更新他的孩子优先级childExpirationTime为当前的节点的优先级
  // 也就是当前节点往上的所有节点的优先级，如果比我还小，就要全部与我一致（包括母亲节点，祖母节点等）
  var node = fiber.return;
  var root = null;
  if (node === null && fiber.tag === HostRoot) {
    // 首次渲染阶段的fiber就是root，直接走这里
    root = fiber.stateNode;
  } else {
    while (node !== null) {
      alternate = node.alternate;
      if (node.childExpirationTime < expirationTime) {
        // 自己本身的孩子优先级需要更新，上一次的对应的节点也需要更新
        node.childExpirationTime = expirationTime;
        if (alternate !== null && alternate.childExpirationTime < expirationTime) {
          alternate.childExpirationTime = expirationTime;
        }
      } else if (alternate !== null && alternate.childExpirationTime < expirationTime) {
        // 自己的本身的孩子优先级不需要更新，但是也要询问一下上一次的对应的节点是否需要更新
        alternate.childExpirationTime = expirationTime;
      }
      // 同时往上找到root节点的root对象
      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode;
        break;
      }
      node = node.return;
    }
  }

  if (enableSchedulerTracing) {
    if (root !== null) {
      // 首次渲染阶段，interactions的size长度为0，走不进去
      var interactions = tracing.__interactionsRef.current;
      if (interactions.size > 0) {
        // ?待补充！！！！！！！！！！！！！！！
        var pendingInteractionMap = root.pendingInteractionMap;
        var pendingInteractions = pendingInteractionMap.get(expirationTime);
        if (pendingInteractions != null) {
          interactions.forEach(function (interaction) {
            if (!pendingInteractions.has(interaction)) {
              // Update the pending async work count for previously unscheduled interaction.
              interaction.__count++;
            }

            pendingInteractions.add(interaction);
          });
        } else {
          pendingInteractionMap.set(expirationTime, new Set(interactions));

          // Update the pending async work count for the current interactions.
          interactions.forEach(function (interaction) {
            interaction.__count++;
          });
        }

        var subscriber = tracing.__subscriberRef.current;
        if (subscriber !== null) {
          var threadID = computeThreadID(
            expirationTime,
            root.interactionThreadID
          );
          subscriber.onWorkScheduled(interactions, threadID);
        }
      }
    }
  }
  return root;
}

function recordScheduleUpdate() {
  // 首次渲染阶段，enableUserTimingAPI为true，但是isCommitting为false，currentPhase为null
  if (enableUserTimingAPI) {
    if (isCommitting) {
      hasScheduledUpdateInCurrentCommit = true;
    }
    if (
      currentPhase !== null &&
      currentPhase !== "componentWillMount" &&
      currentPhase !== "componentWillReceiveProps"
    ) {
      hasScheduledUpdateInCurrentPhase = true;
    }
  }
}

function markPendingPriorityLevel(root, expirationTime) {
  // 保证root对象的didError是false，目的是？？？
  root.didError = false;

  // 3. @@过期时间计算完之后，第三，存到root对象的earliestPendingTime和latestPendingTime，仅在最小或最大的时候
  var earliestPendingTime = root.earliestPendingTime;

  // 首次渲染阶段，earliestPendingTime就是初始化为Nowork
  if (earliestPendingTime === NoWork) {
    // 更新一下root对象自己的优先级（过期时间）
    root.earliestPendingTime = root.latestPendingTime = expirationTime;
  } else {
    if (earliestPendingTime < expirationTime) {
      // expirationTime越大，说明这个更新是最早的？？？？为什么？？
      root.earliestPendingTime = expirationTime;
    } else {
      // 如果expirationTime比最小的还要小，更新一下最小的时间，也就是最近的时间
      var latestPendingTime = root.latestPendingTime;
      if (latestPendingTime > expirationTime) {
        // This is the latest pending update
        root.latestPendingTime = expirationTime;
      }
    }
  }
  // 4. root对象的nextExpirationTimeToWorkOn和expirationTime要改一下，
  // 前者改为优先级最小的，也就是我所认为的最早触发的（实际上是最晚最新触发的）；后者改为和nextExpirationTimeToWorkOn一样 或者 是优先级最大的挂起的时间，我所认为的最晚最新触发的（实际上是最早触发的）
  findNextExpirationTimeToWorkOn(expirationTime, root);
}

function findNextExpirationTimeToWorkOn(completedExpirationTime, root) {
  var earliestSuspendedTime = root.earliestSuspendedTime;
  var latestSuspendedTime = root.latestSuspendedTime;
  var earliestPendingTime = root.earliestPendingTime;
  var latestPingedTime = root.latestPingedTime;

  // 1. 改变nextExpirationTimeToWorkOn
  // 如果优先级最大（最早）的时间不是0（也就是还比较重要），让下一个亟需操作的过期时间为他，即最早（优先级最大）的那个，不然就是最晚的那个
  // 首次渲染阶段，earliestPendingTime等于expirationTime
  var nextExpirationTimeToWorkOn = earliestPendingTime !== NoWork ? earliestPendingTime : latestPingedTime;

  // 如果下一个亟需操作的过期时间为0，优先级最低（说明可能不是很重要），并且 当期的fiber的过期时间的优先级最低 或者 比最小优先级的时间要大，也就是latestSuspendedTime还是最小优先级的（没人比得过他）
  if (
    nextExpirationTimeToWorkOn === NoWork &&
    (completedExpirationTime === NoWork ||
      latestSuspendedTime < completedExpirationTime)
  ) {
    // 最新的最迟的也就是最小优先级的要成为下一个亟需操作的工作单元，
    // The lowest priority suspended work is the work most likely to be
    // committed next. Let's start rendering it again, so that if it times out,
    // it's ready to commit.
    nextExpirationTimeToWorkOn = latestSuspendedTime;
  }

  // 2. 改变expirationTime
  // 然后让下一个亟需操作的工作单元的过期时间等于现在这个当前的expirationTime
  var expirationTime = nextExpirationTimeToWorkOn;

  // 如果当前的root的优先级比最早的已经挂起的还要小，不及优先级最大的
  if (expirationTime !== NoWork && earliestSuspendedTime > expirationTime) {
    // 让优先级最大的，也就是最早触发的但是已经挂起的交互，覆盖掉expirationTime
    expirationTime = earliestSuspendedTime;
  }

  // 4. @@过期时间计算完之后，第四，存到root对象的nextExpirationTimeToWorkOn和expirationTime，找出最急需更新的一个
  // 改变root的属性
  // 首次渲染阶段，nextExpirationTimeToWorkOn等于expirationTime，两个变量都相当于初始化
  root.nextExpirationTimeToWorkOn = nextExpirationTimeToWorkOn;
  root.expirationTime = expirationTime;
}

function requestWork(root, expirationTime) {
  // 把当前的根对象加入到xxx里面
  addRootToSchedule(root, expirationTime);

  // 如果当前处于正常render阶段，不走下面
  if (isRendering) {
    // Prevent reentrancy. Remaining work will be scheduled at the end of
    // the currently rendering batch.
    return;
  }

  // 首次渲染模式下，这两个变量都是false，不走这里
  if (isBatchingUpdates) {
    // Flush work at the end of the batch.
    if (isUnbatchingUpdates) {
      // ...unless we're inside unbatchedUpdates, in which case we should
      // flush it now.
      nextFlushedRoot = root;
      nextFlushedExpirationTime = Sync;
      performWorkOnRoot(root, Sync, false);
    }
    return;
  }

  // 首次渲染下，root的时间是sync（最大的那个），会走第一个performSyncWork逻辑，是同步更新
  if (expirationTime === Sync) {
    performSyncWork();
  } else {
    scheduleCallbackWithExpirationTime(root, expirationTime);
  }
}

function addRootToSchedule(root, expirationTime) {
  // 把当前的root加入到链表结构里面，
  // 如果是首次渲染初始化，nextScheduledRoot为空
  if (root.nextScheduledRoot === null) {
    root.expirationTime = expirationTime;

    if (lastScheduledRoot === null) {
      // 首次渲染阶段：lastScheduledRoot为空
      // root更新到首尾，并让他的next指针指向自己
      firstScheduledRoot = lastScheduledRoot = root;
      root.nextScheduledRoot = root;
    } else {
      // 这个什么时候会走，nextScheduledRoot不是每个root都会有吗，
      // 把当前的root通过next指针指向新的root，然后移动last指针，然后构造环形的，让last指针的next连接首指针
      lastScheduledRoot.nextScheduledRoot = root;
      lastScheduledRoot = root;
      lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
    }
  } else {
    // 更新阶段：
    // 为什么要拿自己的过期时间和自己的过期时间比？？？？？？
    // ?待补充！！
    var remainingExpirationTime = root.expirationTime;
    if (expirationTime > remainingExpirationTime) {
      root.expirationTime = expirationTime;
    }
  }
}

function performSyncWork() {
  // 同步更新下：
  // minExpirationTime为Sync，优先级最大的，isYieldy为false，说明是非批量更新
  // ?同步和批量的关系？？？？？
  performWork(Sync, false);
}

function performWork(minExpirationTime, isYieldy) {
  // 首先找到最优先，最高优先级的root，更新一下全局的nextXXXRoot变量
  findHighestPriorityRoot();

  if (isYieldy) {
    // 批量更新
    recomputeCurrentRendererTime();
    currentSchedulerTime = currentRendererTime;

    if (enableUserTimingAPI) {
      var didExpire = nextFlushedExpirationTime > currentRendererTime;
      var timeout = expirationTimeToMs(nextFlushedExpirationTime);
      stopRequestCallbackTimer(didExpire, timeout);
    }

    while (
      nextFlushedRoot !== null &&
      nextFlushedExpirationTime !== NoWork &&
      minExpirationTime <= nextFlushedExpirationTime &&
      !(didYield && currentRendererTime > nextFlushedExpirationTime)
    ) {
      performWorkOnRoot(
        nextFlushedRoot,
        nextFlushedExpirationTime,
        currentRendererTime > nextFlushedExpirationTime
      );
      findHighestPriorityRoot();
      recomputeCurrentRendererTime();
      currentSchedulerTime = currentRendererTime;
    }
  } else {
    // 非批量更新，也就是瞬时全部更新
    // 找到亟需更新的优先级最高的root对象nextFlushedRoot，并且这个即将更新的过期时间要大于等于min的时间
    // 首次渲染阶段，minExpirationTime是sync，且nextFlushedExpirationTime是root自己的过期时间，也就是sync，两者相等
    // performWorkOnRoot的最后一个参数是false，表明是非批量更新
    while (
      nextFlushedRoot !== null &&
      nextFlushedExpirationTime !== NoWork &&
      minExpirationTime <= nextFlushedExpirationTime
    ) {
      // 开始perform函数了，正式进入render阶段！！！！
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false);
      findHighestPriorityRoot();
    }
  }

  // ?如果是批量更新，记录一下callback的信息？？？？？为什么？？？
  if (isYieldy) {
    callbackExpirationTime = NoWork;
    callbackID = null;
  }

  // 首次渲染阶段，nextFlushedExpirationTime被赋值了，是优先级最高的time
  if (nextFlushedExpirationTime !== NoWork) {
    scheduleCallbackWithExpirationTime(
      nextFlushedRoot,
      nextFlushedExpirationTime
    );
  }

  // Clean-up.
  finishRendering();
}

function findHighestPriorityRoot() {
  var highestPriorityWork = NoWork;
  var highestPriorityRoot = null;

  // 首次渲染阶段，在addRootToXXX函数里面，last和first的root都被更新过了，就是root本身
  if (lastScheduledRoot !== null) {
    var previousScheduledRoot = lastScheduledRoot;
    var root = firstScheduledRoot;

    // 从第一个root开始遍历
    while (root !== null) {
      var remainingExpirationTime = root.expirationTime;

      // 如果这个root的时间优先级最低走下面的逻辑
      if (remainingExpirationTime === NoWork) {
        // This root no longer has work. Remove it from the scheduler.
        // below where we set lastScheduledRoot to null, even though we break
        // from the loop right after.
        !(previousScheduledRoot !== null && lastScheduledRoot !== null)
          ? invariant(
              false,
              "Should have a previous and last root. This error is likely caused by a bug in React. Please file an issue."
            )
          : void 0;
        if (root === root.nextScheduledRoot) {
          // This is the only root in the list.
          root.nextScheduledRoot = null;
          firstScheduledRoot = lastScheduledRoot = null;
          break;
        } else if (root === firstScheduledRoot) {
          // This is the first root in the list.
          var next = root.nextScheduledRoot;
          firstScheduledRoot = next;
          lastScheduledRoot.nextScheduledRoot = next;
          root.nextScheduledRoot = null;
        } else if (root === lastScheduledRoot) {
          // This is the last root in the list.
          lastScheduledRoot = previousScheduledRoot;
          lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
          root.nextScheduledRoot = null;
          break;
        } else {
          previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
          root.nextScheduledRoot = null;
        }
        root = previousScheduledRoot.nextScheduledRoot;
      } else {
        // 如果这个root的时间优先级只要不是最低，都要走下面的逻辑
        // 首次渲染阶段root.expirationTime为sync，必然大于highestPriorityWork
        if (remainingExpirationTime > highestPriorityWork) {
          // 更新一下最大的时间，以及与之相对应的root对象
          highestPriorityWork = remainingExpirationTime;
          highestPriorityRoot = root;
        }
        // 首次渲染阶段，最后一个root就是第一个root
        if (root === lastScheduledRoot) {
          break;
        }
        if (highestPriorityWork === Sync) {
          // Sync is highest priority by definition so
          // we can stop searching.
          break;
        }
        previousScheduledRoot = root;
        root = root.nextScheduledRoot;
      }
    }
  }

  // ?更新一下这两个变量，用来干嘛？？？？？
  // 记录最高优先级的root，也就是定义下一个需要操作的root是谁！
  nextFlushedRoot = highestPriorityRoot;
  nextFlushedExpirationTime = highestPriorityWork;
}

function performWorkOnRoot(root, expirationTime, isYieldy) {
  // 真正开始从亟需更新的root开始渲染
  isRendering = true;

  if (!isYieldy) {
    // 这是非批量更新走的逻辑：

    // 如果之前render阶段完了，然后时间片没有剩余的时间，来不及commit，那这个finishedWork是有值的
    // 首次渲染阶段，这个finishedWork为null
    var finishedWork = root.finishedWork;
    if (finishedWork !== null) {
      // 进入提交阶段
      completeRoot(root, finishedWork, expirationTime);
    } else {
      root.finishedWork = null;

      // 这个timeoutHandle属性用来干嘛？？？？
      // 在首次渲染阶段，timeoutHandle属性为noTimeout
      var timeoutHandle = root.timeoutHandle;
      if (timeoutHandle !== noTimeout) {
        root.timeoutHandle = noTimeout;
        cancelTimeout(timeoutHandle);
      }

      // 1. 进入render阶段
      renderRoot(root, isYieldy);

      // 2. 进入提交阶段
      // 用root对象的fini shedWork来指示是否结束了render阶段
      finishedWork = root.finishedWork;
      if (finishedWork !== null) {
        completeRoot(root, finishedWork, expirationTime);
      }
    }
  } else {
    // 这是批量更新走的逻辑
    var _finishedWork = root.finishedWork;
    if (_finishedWork !== null) {
      // This root is already complete. We can commit it.
      completeRoot(root, _finishedWork, expirationTime);
    } else {
      root.finishedWork = null;
      // If this root previously suspended, clear its existing timeout, since
      // we're about to try rendering again.
      var _timeoutHandle = root.timeoutHandle;
      if (_timeoutHandle !== noTimeout) {
        root.timeoutHandle = noTimeout;
        // $FlowFixMe Complains noTimeout is not a TimeoutID, despite the check above
        cancelTimeout(_timeoutHandle);
      }
      renderRoot(root, isYieldy);
      _finishedWork = root.finishedWork;
      if (_finishedWork !== null) {
        // We've completed the root. Check the if we should yield one more time
        // before committing.
        if (!shouldYieldToRenderer()) {
          // Still time left. Commit the root.
          completeRoot(root, _finishedWork, expirationTime);
        } else {
          // There's no time left. Mark this root as complete. We'll come
          // back and commit it later.
          root.finishedWork = _finishedWork;
        }
      }
    }
  }

  // 可见render就是包含render阶段和commit阶段，是整个渲染过程的开关指示器
  isRendering = false;
}

// REVIEW - performWorkOnRoot的renderRoot函数调用，开始isWorking阶段，也就是render渲染阶段！！！

function renderRoot(root, isYieldy) {
  // 首次渲染阶段：passiveEffectCallbackHandle和passiveEffectCallback都是null，这个函数不起作用
  flushPassiveEffects();

  // 开始render阶段，isWorking指示的仅仅是render阶段
  isWorking = true;

  // 首次渲染阶段这里是null，有点像是临时替换ContextOnlyDispatcher给当前的RCD
  var previousDispatcher = ReactCurrentDispatcher.current;
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;

  // 拿到nextExpirationTimeToWorkOn的属性作为当前的过期时间，这个属性记录着当前最新的最迟的也就是最小优先级的更新
  // 首次渲染阶段，这个等同于root的原本的expirationTime
  var expirationTime = root.nextExpirationTimeToWorkOn;

  // 首次渲染阶段，nextRenderExpirationTime相当于noWork，也就是0，nextRoot也是null，nextUnitOfWork也是null
  if (
    expirationTime !== nextRenderExpirationTime ||
    root !== nextRoot ||
    nextUnitOfWork === null
  ) {
    // 恢复一些顶层变量为初始的默认值
    resetStack();

    // 更新下一次的root和优先级为当前的root和优先级
    nextRoot = root;
    nextRenderExpirationTime = expirationTime;
    // 创建或更新nextUnitOfWork（也就是第二个Fiber，除了root的第一个以外！！），这是在准备第一个要工作的单元！！！！！
    nextUnitOfWork = createWorkInProgress(
      nextRoot.current,
      null,
      nextRenderExpirationTime
    );
    root.pendingCommitExpirationTime = NoWork;

    if (enableSchedulerTracing) {
      // 首次渲染阶段，pendingInteractionMap属性只是一个空的map
      var interactions = new Set();
      root.pendingInteractionMap.forEach(function (
        scheduledInteractions,
        scheduledExpirationTime
      ) {
        if (scheduledExpirationTime >= expirationTime) {
          scheduledInteractions.forEach(function (interaction) {
            return interactions.add(interaction);
          });
        }
      });

      // Store the current set of interactions on the FiberRoot for a few reasons:
      // We can re-use it in hot functions like renderRoot() without having to recalculate it.
      // We will also use it in commitWork() to pass to any Profiler onRender() hooks.
      // This also provides DevTools with a way to access it when the onCommitRoot() hook is called.
      root.memoizedInteractions = interactions;

      // 首次渲染阶段，这个时候的interactions的长度也是0
      if (interactions.size > 0) {
        var subscriber = tracing.__subscriberRef.current;
        if (subscriber !== null) {
          var threadID = computeThreadID(
            expirationTime,
            root.interactionThreadID
          );
          try {
            subscriber.onWorkStarted(interactions, threadID);
          } catch (error) {
            // Work thrown by an interaction tracing subscriber should be rethrown,
            // But only once it's safe (to avoid leaving the scheduler in an invalid state).
            // Store the error for now and we'll re-throw in finishRendering().
            if (!hasUnhandledError) {
              hasUnhandledError = true;
              unhandledError = error;
            }
          }
        }
      }
    }
  }

  // 这里有点像是用root.memoizedInteractions暂时替换一下tracing.__interactionsRef.current，后面用额外保存好的prevInteractions替换回来
  var prevInteractions = null;
  if (enableSchedulerTracing) {
    // 首次渲染阶段，这个tracing.__interactionsRef.current是一个空的set
    prevInteractions = tracing.__interactionsRef.current;
    tracing.__interactionsRef.current = root.memoizedInteractions;
  }

  var didFatal = false;

  // 更新一下当前的fiber和提交次数的全局变量
  startWorkLoopTimer(nextUnitOfWork);

  // 开始正式进入循环
  do {
    try {
      workLoop(isYieldy);
    } catch (thrownValue) {
      resetContextDependences();
      resetHooks();

      // Reset in case completion throws.
      // This is only used in DEV and when replaying is on.
      var mayReplay = void 0;
      if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
        mayReplay = mayReplayFailedUnitOfWork;
        mayReplayFailedUnitOfWork = true;
      }

      if (nextUnitOfWork === null) {
        // This is a fatal error.
        didFatal = true;
        onUncaughtError(thrownValue);
      } else {
        if (enableProfilerTimer && nextUnitOfWork.mode & ProfileMode) {
          // Record the time spent rendering before an error was thrown.
          // This avoids inaccurate Profiler durations in the case of a suspended render.
          stopProfilerTimerIfRunningAndRecordDelta(nextUnitOfWork, true);
        }

        {
          // Reset global debug state
          // We assume this is defined in DEV
          resetCurrentlyProcessingQueue();
        }

        if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
          if (mayReplay) {
            var failedUnitOfWork = nextUnitOfWork;
            replayUnitOfWork(failedUnitOfWork, thrownValue, isYieldy);
          }
        }

        // At least this shows a nicer error message until we figure out the cause.
        // https://github.com/facebook/react/issues/12449#issuecomment-386727431
        !(nextUnitOfWork !== null)
          ? invariant(
              false,
              "Failed to replay rendering after an error. This is likely caused by a bug in React. Please file an issue with a reproducing case to help us find it."
            )
          : void 0;

        var sourceFiber = nextUnitOfWork;
        var returnFiber = sourceFiber.return;
        if (returnFiber === null) {
          // This is the root. The root could capture its own errors. However,
          // we don't know if it errors before or after we pushed the host
          // context. This information is needed to avoid a stack mismatch.
          // Because we're not sure, treat this as a fatal error. We could track
          // which phase it fails in, but doesn't seem worth it. At least
          // for now.
          didFatal = true;
          onUncaughtError(thrownValue);
        } else {
          throwException(
            root,
            returnFiber,
            sourceFiber,
            thrownValue,
            nextRenderExpirationTime
          );
          nextUnitOfWork = completeUnitOfWork(sourceFiber);
          continue;
        }
      }
    }
    break;
  } while (true);

  if (enableSchedulerTracing) {
    // Traced work is done for now; restore the previous interactions.
    tracing.__interactionsRef.current = prevInteractions;
  }

  // We're done performing work. Time to clean up.
  isWorking = false;
  ReactCurrentDispatcher.current = previousDispatcher;
  resetContextDependences();
  resetHooks();

  // Yield back to main thread.
  if (didFatal) {
    var _didCompleteRoot = false;
    stopWorkLoopTimer(interruptedBy, _didCompleteRoot);
    interruptedBy = null;
    // There was a fatal error.
    {
      resetStackAfterFatalErrorInDev();
    }
    // `nextRoot` points to the in-progress root. A non-null value indicates
    // that we're in the middle of an async render. Set it to null to indicate
    // there's no more work to be done in the current batch.
    nextRoot = null;
    onFatal(root);
    return;
  }

  if (nextUnitOfWork !== null) {
    // There's still remaining async work in this tree, but we ran out of time
    // in the current frame. Yield back to the renderer. Unless we're
    // interrupted by a higher priority update, we'll continue later from where
    // we left off.
    var _didCompleteRoot2 = false;
    stopWorkLoopTimer(interruptedBy, _didCompleteRoot2);
    interruptedBy = null;
    onYield(root);
    return;
  }

  // We completed the whole tree.
  var didCompleteRoot = true;
  stopWorkLoopTimer(interruptedBy, didCompleteRoot);
  var rootWorkInProgress = root.current.alternate;
  !(rootWorkInProgress !== null)
    ? invariant(
        false,
        "Finished root should have a work-in-progress. This error is likely caused by a bug in React. Please file an issue."
      )
    : void 0;

  // `nextRoot` points to the in-progress root. A non-null value indicates
  // that we're in the middle of an async render. Set it to null to indicate
  // there's no more work to be done in the current batch.
  nextRoot = null;
  interruptedBy = null;

  if (nextRenderDidError) {
    // There was an error
    if (hasLowerPriorityWork(root, expirationTime)) {
      // There's lower priority work. If so, it may have the effect of fixing
      // the exception that was just thrown. Exit without committing. This is
      // similar to a suspend, but without a timeout because we're not waiting
      // for a promise to resolve. React will restart at the lower
      // priority level.
      markSuspendedPriorityLevel(root, expirationTime);
      var suspendedExpirationTime = expirationTime;
      var rootExpirationTime = root.expirationTime;
      onSuspend(
        root,
        rootWorkInProgress,
        suspendedExpirationTime,
        rootExpirationTime,
        -1 // Indicates no timeout
      );
      return;
    } else if (
      // There's no lower priority work, but we're rendering asynchronously.
      // Synchronously attempt to render the same level one more time. This is
      // similar to a suspend, but without a timeout because we're not waiting
      // for a promise to resolve.
      !root.didError &&
      isYieldy
    ) {
      root.didError = true;
      var _suspendedExpirationTime = (root.nextExpirationTimeToWorkOn =
        expirationTime);
      var _rootExpirationTime = (root.expirationTime = Sync);
      onSuspend(
        root,
        rootWorkInProgress,
        _suspendedExpirationTime,
        _rootExpirationTime,
        -1 // Indicates no timeout
      );
      return;
    }
  }

  if (isYieldy && nextLatestAbsoluteTimeoutMs !== -1) {
    // The tree was suspended.
    var _suspendedExpirationTime2 = expirationTime;
    markSuspendedPriorityLevel(root, _suspendedExpirationTime2);

    // Find the earliest uncommitted expiration time in the tree, including
    // work that is suspended. The timeout threshold cannot be longer than
    // the overall expiration.
    var earliestExpirationTime = findEarliestOutstandingPriorityLevel(
      root,
      expirationTime
    );
    var earliestExpirationTimeMs = expirationTimeToMs(earliestExpirationTime);
    if (earliestExpirationTimeMs < nextLatestAbsoluteTimeoutMs) {
      nextLatestAbsoluteTimeoutMs = earliestExpirationTimeMs;
    }

    // Subtract the current time from the absolute timeout to get the number
    // of milliseconds until the timeout. In other words, convert an absolute
    // timestamp to a relative time. This is the value that is passed
    // to `setTimeout`.
    var currentTimeMs = expirationTimeToMs(requestCurrentTime());
    var msUntilTimeout = nextLatestAbsoluteTimeoutMs - currentTimeMs;
    msUntilTimeout = msUntilTimeout < 0 ? 0 : msUntilTimeout;

    var _rootExpirationTime2 = root.expirationTime;
    onSuspend(
      root,
      rootWorkInProgress,
      _suspendedExpirationTime2,
      _rootExpirationTime2,
      msUntilTimeout
    );
    return;
  }

  // Ready to commit.
  onComplete(root, rootWorkInProgress, expirationTime);
}

function resetStack() {
  if (nextUnitOfWork !== null) {
    var interruptedWork = nextUnitOfWork.return;
    while (interruptedWork !== null) {
      unwindInterruptedWork(interruptedWork);
      interruptedWork = interruptedWork.return;
    }
  }

  {
    ReactStrictModeWarnings.discardPendingWarnings();
    checkThatStackIsEmpty();
  }

  nextRoot = null;
  nextRenderExpirationTime = NoWork;
  nextLatestAbsoluteTimeoutMs = -1;
  nextRenderDidError = false;
  nextUnitOfWork = null;
}

function createWorkInProgress(current, pendingProps, expirationTime) {
  // 这里的current指的是root的fiber
  // 看能不能拿到这个fiber的替身值来复用
  var workInProgress = current.alternate;
  if (workInProgress === null) {
    // 首次渲染阶段，没有替身值，要去重新新建第二个（也是最后一个）fiber
    // createFiber的函数如下，在上面有定义：
    // var createFiber = function (tag, pendingProps, key, mode) {
    //   return new FiberNode(tag, pendingProps, key, mode);
    // };
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );

    // 然后开始附上一些属性
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    {
      // DEV环境下
      workInProgress._debugID = current._debugID;
      workInProgress._debugSource = current._debugSource;
      workInProgress._debugOwner = current._debugOwner;
      workInProgress._debugHookTypes = current._debugHookTypes;
    }

    // 最后进行相互引用
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 如果存在替身，直接复用，不新建，然后更新一下一些属性
    workInProgress.pendingProps = pendingProps;

    workInProgress.effectTag = NoEffect;
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;

    if (enableProfilerTimer) {
      // We intentionally reset, rather than copy, actualDuration & actualStartTime.
      // This prevents time from endlessly accumulating in new commits.
      // This has the downside of resetting values for different priority renders,
      // But works for yielding (the common case) and should support resuming.
      workInProgress.actualDuration = 0;
      workInProgress.actualStartTime = -1;
    }
  }

  // 这些不论是新建还是更新都要重新赋予的属性：
  workInProgress.childExpirationTime = current.childExpirationTime;
  workInProgress.expirationTime = current.expirationTime;

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.contextDependencies = current.contextDependencies;

  // These will be overridden during the parent's reconciliation
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  if (enableProfilerTimer) {
    workInProgress.selfBaseDuration = current.selfBaseDuration;
    workInProgress.treeBaseDuration = current.treeBaseDuration;
  }

  return workInProgress;
}

function startWorkLoopTimer(nextUnitOfWork) {
  if (enableUserTimingAPI) {
    // 更新一下当前的fiber的值
    currentFiber = nextUnitOfWork;
    if (!supportsUserTiming) {
      return;
    }
    // 初始化在当前的loop中的提交次数
    commitCountInCurrentWorkLoop = 0;

    beginMark("(React Tree Reconciliation)");

    resumeTimers();
  }
}

var beginMark = function (markName) {
  performance.mark(formatMarkName(markName));
};

var resumeTimers = function () {
  // 在干嘛？？？？？
  if (currentFiber !== null) {
    resumeTimersRecursively(currentFiber);
  }
};

var resumeTimersRecursively = function (fiber) {
  // 首次渲染阶段，下面两个判断都进不去
  if (fiber.return !== null) {
    resumeTimersRecursively(fiber.return);
  }
  if (fiber._debugIsCurrentlyTiming) {
    beginFiberMark(fiber, null);
  }
};

// REVIEW - render渲染阶段的workLoop循环，是调度动作的入口点、控制器、排队处、记事本、前台！！！！
// ?核心作用是控制每一个节点是否进入工作间

function workLoop(isYieldy) {
  // 首次渲染阶段，是非批量更新模式，走第一个逻辑
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {
    while (nextUnitOfWork !== null && !shouldYieldToRenderer()) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  }
}

function performUnitOfWork(workInProgress) {
  // 拿到workInProgress的替身fiber
  // 在首次渲染阶段，两个fiber树是一样的东西，且是root的fiber
  var current$$1 = workInProgress.alternate;

  // 更新部分全局变量，目的是为devTool的debug服务
  startWorkTimer(workInProgress);

  // 这里给全局变量：current和ReactDebugCurrentFrame.getCurrentStack赋予值
  {
    setCurrentFiber(workInProgress);
  }

  // 赋予stashedWorkInProgressProperties值（新建fiber）
  if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
    stashedWorkInProgressProperties = assignFiberPropertiesInDEV(
      stashedWorkInProgressProperties,
      workInProgress
    );
  }

  var next = void 0;
  if (enableProfilerTimer) {
    // beginwork开始之前，记录一下时间
    if (workInProgress.mode & ProfileMode) {
      startProfilerTimer(workInProgress);
    }

    // !开始beginWork得到的结果是当前节点的大儿子节点fiber
    // current$$1是WIP的替身，workInProgress是当前fiber，renderExpirationTime是全局的nextRenderET（就是root的nextETToWork）
    next = beginWork(current$$1, workInProgress, nextRenderExpirationTime);

    // 改一下props为memoized
    workInProgress.memoizedProps = workInProgress.pendingProps;

    // 首次渲染阶段，这两个变量都是4，也就是100，与运算为100，为true
    // 这是计算一个节点的fiber构建持续的时间，startProfilerTimer(workInProgress)是开始
    if (workInProgress.mode & ProfileMode) {
      // 算一下渲染持续的时间
      // fiber.actualDuration为整棵树总共执行完毕持续的时间
      // fiber.selfBaseDuration为当个fiber节点构建完毕持续的时间
      stopProfilerTimerIfRunningAndRecordDelta(workInProgress, true);
    }
  } else {
    next = beginWork(current$$1, workInProgress, nextRenderExpirationTime);
    workInProgress.memoizedProps = workInProgress.pendingProps;
  }

  // 重置一下全局变量：current和ReactDebugCurrentFrame.getCurrentStack的相关信息，在beginWork之前设置好了
  // 用于开发工具的使用
  {
    resetCurrentFiber();
    // 首次渲染这个变量为false，进不去这个函数
    if (isReplayingFailedUnitOfWork) {
      rethrowOriginalError();
    }
  }
  // 首次渲染阶段，ReactFiberInstrumentation_1.debugTool为null，不走这里
  if (true && ReactFiberInstrumentation_1.debugTool) {
    ReactFiberInstrumentation_1.debugTool.onBeginWork(workInProgress);
  }

  // next是当前节点的大儿子
  // 当没有大儿子了，就开始complete，往右往上走了！！！
  if (next === null) {
    next = completeUnitOfWork(workInProgress);
  }

  // 恢复这个ReactCurrentOwner$2为null，用来干嘛？？？？？？
  ReactCurrentOwner$2.current = null;

  // 返回大儿子fiber，回到【workLoop】函数，开始从树继续往下探底！！
  return next;
}

function startWorkTimer(fiber) {
  if (enableUserTimingAPI) {
    // 在首次渲染阶段，!supportsUserTiming是false，也就是说如果performance失去作用了，才会进行下面的逻辑
    if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
      return;
    }
    // If we pause, this is the fiber to unwind from.
    currentFiber = fiber;
    if (!beginFiberMark(fiber, null)) {
      return;
    }
    fiber._debugIsCurrentlyTiming = true;
  }
}

function setCurrentFiber(fiber) {
  {
    ReactDebugCurrentFrame.getCurrentStack = getCurrentFiberStackInDev;
    current = fiber;
    phase = null;
  }
}

function assignFiberPropertiesInDEV(target, source) {
  if (target === null) {
    // 在首次渲染阶段，stashedWorkInProgressProperties为null，需要新建一个fiber
    target = createFiber(IndeterminateComponent, null, null, NoContext);
  }
  // 然后把WorkInProgress的属性值给他
  target.tag = source.tag;
  target.key = source.key;
  target.elementType = source.elementType;
  target.type = source.type;
  target.stateNode = source.stateNode;
  target.return = source.return;
  target.child = source.child;
  target.sibling = source.sibling;
  target.index = source.index;
  target.ref = source.ref;
  target.pendingProps = source.pendingProps;
  target.memoizedProps = source.memoizedProps;
  target.updateQueue = source.updateQueue;
  target.memoizedState = source.memoizedState;
  target.contextDependencies = source.contextDependencies;
  target.mode = source.mode;
  target.effectTag = source.effectTag;
  target.nextEffect = source.nextEffect;
  target.firstEffect = source.firstEffect;
  target.lastEffect = source.lastEffect;
  target.expirationTime = source.expirationTime;
  target.childExpirationTime = source.childExpirationTime;
  target.alternate = source.alternate;
  if (enableProfilerTimer) {
    target.actualDuration = source.actualDuration;
    target.actualStartTime = source.actualStartTime;
    target.selfBaseDuration = source.selfBaseDuration;
    target.treeBaseDuration = source.treeBaseDuration;
  }
  target._debugID = source._debugID;
  target._debugSource = source._debugSource;
  target._debugOwner = source._debugOwner;
  target._debugIsCurrentlyTiming = source._debugIsCurrentlyTiming;
  target._debugHookTypes = source._debugHookTypes;
  return target;
}

function startProfilerTimer(fiber) {
  if (!enableProfilerTimer) {
    return;
  }
  // 让这个profilerStartTime开始时间等于当前的时间戳
  profilerStartTime = now();

  // 首次渲染的时候fiber.actualStartTime是-1,
  // 同时也更新一下fiber本身的开始时间
  if (fiber.actualStartTime < 0) {
    fiber.actualStartTime = now();
  }
}

// REVIEW - render渲染阶段的workLoop循环里面的beginWork，是为树的每一个节点构造一个fiber！！！！
// ?是对每一个节点的【类型】的分发，（此时位于工作间内部，有点像机场里面门口内的安检程序，需要派发到不同的地方）

function beginWork(current$$1, workInProgress, renderExpirationTime) {
  // 入参：current$$1是workInProgress的替身fiber
  // renderExpirationTime

  // 在首次渲染阶段（首次进入这个函数），updateExpirationTime也就是fiber本身的expirationTime，和入参的renderExpirationTime是一样的
  var updateExpirationTime = workInProgress.expirationTime;

  // 1. 查看新旧props是否一样，标记是否需要update
  // current$$1是workInProgress的替身
  if (current$$1 !== null) {
    // 在首次渲染阶段（首次进入这个函数），props没有值
    // memo是被存起来的上一次的props，pending是新的
    var oldProps = current$$1.memoizedProps;
    var newProps = workInProgress.pendingProps;

    if (oldProps !== newProps || hasContextChanged()) {
      // 新旧的props不一样，需要更新
      didReceiveUpdate = true;
    } else if (updateExpirationTime < renderExpirationTime) {
      // ?这里为什么要自己和自己比呢，和之前有一个地方一样，fiber的eT和入参的eT对比，不是一样的么？？？？
      // 新旧的props一样，但是fiber本身的优先级，小于链表里面的亟需更新的优先级，不用更新
      didReceiveUpdate = false;

      switch (workInProgress.tag) {
        case HostRoot:
          pushHostRootContext(workInProgress);
          resetHydrationState();
          break;
        case HostComponent:
          pushHostContext(workInProgress);
          break;
        case ClassComponent: {
          var Component = workInProgress.type;
          if (isContextProvider(Component)) {
            pushContextProvider(workInProgress);
          }
          break;
        }
        case HostPortal:
          pushHostContainer(
            workInProgress,
            workInProgress.stateNode.containerInfo
          );
          break;
        case ContextProvider: {
          var newValue = workInProgress.memoizedProps.value;
          pushProvider(workInProgress, newValue);
          break;
        }
        case Profiler:
          if (enableProfilerTimer) {
            workInProgress.effectTag |= Update;
          }
          break;
        case SuspenseComponent: {
          var state = workInProgress.memoizedState;
          var didTimeout = state !== null;
          if (didTimeout) {
            // If this boundary is currently timed out, we need to decide
            // whether to retry the primary children, or to skip over it and
            // go straight to the fallback. Check the priority of the primary
            var primaryChildFragment = workInProgress.child;
            var primaryChildExpirationTime =
              primaryChildFragment.childExpirationTime;
            if (
              primaryChildExpirationTime !== NoWork &&
              primaryChildExpirationTime >= renderExpirationTime
            ) {
              // The primary children have pending work. Use the normal path
              // to attempt to render the primary children again.
              return updateSuspenseComponent(
                current$$1,
                workInProgress,
                renderExpirationTime
              );
            } else {
              // The primary children do not have pending work with sufficient
              // priority. Bailout.
              var child = bailoutOnAlreadyFinishedWork(
                current$$1,
                workInProgress,
                renderExpirationTime
              );
              if (child !== null) {
                // The fallback children have pending work. Skip over the
                // primary children and work on the fallback.
                return child.sibling;
              } else {
                return null;
              }
            }
          }
          break;
        }
        case DehydratedSuspenseComponent: {
          if (enableSuspenseServerRenderer) {
            // We know that this component will suspend again because if it has
            // been unsuspended it has committed as a regular Suspense component.
            // If it needs to be retried, it should have work scheduled on it.
            workInProgress.effectTag |= DidCapture;
            break;
          }
        }
      }
      return bailoutOnAlreadyFinishedWork(
        current$$1,
        workInProgress,
        renderExpirationTime
      );
    }
  } else {
    // 【首次渲染】，新旧props都是null，且fiber本身的和亟需更新的优先级的时间一样
    didReceiveUpdate = false;
  }

  // ?把fiber本身的优先级改回为NoWork，最低的，为什么？？？？？
  workInProgress.expirationTime = NoWork;

  // 2. 开始分发，哪种类型去哪里
  // 首次渲染是hostRoot类型，去updateHostRoot
  switch (workInProgress.tag) {
    // 函数组件走这里
    case IndeterminateComponent: {
      var elementType = workInProgress.elementType;
      return mountIndeterminateComponent(
        current$$1,
        workInProgress,
        elementType,
        renderExpirationTime
      );
    }
    case LazyComponent: {
      var _elementType = workInProgress.elementType;
      return mountLazyComponent(
        current$$1,
        workInProgress,
        _elementType,
        updateExpirationTime,
        renderExpirationTime
      );
    }
    case FunctionComponent: {
      var _Component = workInProgress.type;
      var unresolvedProps = workInProgress.pendingProps;
      var resolvedProps =
        workInProgress.elementType === _Component
          ? unresolvedProps
          : resolveDefaultProps(_Component, unresolvedProps);
      return updateFunctionComponent(
        current$$1,
        workInProgress,
        _Component,
        resolvedProps,
        renderExpirationTime
      );
    }
    case ClassComponent: {
      var _Component2 = workInProgress.type;
      var _unresolvedProps = workInProgress.pendingProps;
      var _resolvedProps =
        workInProgress.elementType === _Component2
          ? _unresolvedProps
          : resolveDefaultProps(_Component2, _unresolvedProps);
      return updateClassComponent(
        current$$1,
        workInProgress,
        _Component2,
        _resolvedProps,
        renderExpirationTime
      );
    }

    // 首次渲染走这里
    case HostRoot:
      // 这里分发完之后就没事了！！回到【performUnitOfWork】函数
      return updateHostRoot(current$$1, workInProgress, renderExpirationTime);
    case HostComponent:
      return updateHostComponent(
        current$$1,
        workInProgress,
        renderExpirationTime
      );
    case HostText:
      return updateHostText(current$$1, workInProgress);
    case SuspenseComponent:
      return updateSuspenseComponent(
        current$$1,
        workInProgress,
        renderExpirationTime
      );
    case HostPortal:
      return updatePortalComponent(
        current$$1,
        workInProgress,
        renderExpirationTime
      );
    case ForwardRef: {
      var type = workInProgress.type;
      var _unresolvedProps2 = workInProgress.pendingProps;
      var _resolvedProps2 =
        workInProgress.elementType === type
          ? _unresolvedProps2
          : resolveDefaultProps(type, _unresolvedProps2);
      return updateForwardRef(
        current$$1,
        workInProgress,
        type,
        _resolvedProps2,
        renderExpirationTime
      );
    }
    case Fragment:
      return updateFragment(current$$1, workInProgress, renderExpirationTime);
    case Mode:
      return updateMode(current$$1, workInProgress, renderExpirationTime);
    case Profiler:
      return updateProfiler(current$$1, workInProgress, renderExpirationTime);
    case ContextProvider:
      return updateContextProvider(
        current$$1,
        workInProgress,
        renderExpirationTime
      );
    case ContextConsumer:
      return updateContextConsumer(
        current$$1,
        workInProgress,
        renderExpirationTime
      );
    case MemoComponent: {
      var _type2 = workInProgress.type;
      var _unresolvedProps3 = workInProgress.pendingProps;
      // Resolve outer props first, then resolve inner props.
      var _resolvedProps3 = resolveDefaultProps(_type2, _unresolvedProps3);
      {
        if (workInProgress.type !== workInProgress.elementType) {
          var outerPropTypes = _type2.propTypes;
          if (outerPropTypes) {
            checkPropTypes(
              outerPropTypes,
              _resolvedProps3, // Resolved for outer only
              "prop",
              getComponentName(_type2),
              getCurrentFiberStackInDev
            );
          }
        }
      }
      _resolvedProps3 = resolveDefaultProps(_type2.type, _resolvedProps3);
      return updateMemoComponent(
        current$$1,
        workInProgress,
        _type2,
        _resolvedProps3,
        updateExpirationTime,
        renderExpirationTime
      );
    }
    case SimpleMemoComponent: {
      return updateSimpleMemoComponent(
        current$$1,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        updateExpirationTime,
        renderExpirationTime
      );
    }
    case IncompleteClassComponent: {
      var _Component3 = workInProgress.type;
      var _unresolvedProps4 = workInProgress.pendingProps;
      var _resolvedProps4 =
        workInProgress.elementType === _Component3
          ? _unresolvedProps4
          : resolveDefaultProps(_Component3, _unresolvedProps4);
      return mountIncompleteClassComponent(
        current$$1,
        workInProgress,
        _Component3,
        _resolvedProps4,
        renderExpirationTime
      );
    }
    case DehydratedSuspenseComponent: {
      if (enableSuspenseServerRenderer) {
        return updateDehydratedSuspenseComponent(
          current$$1,
          workInProgress,
          renderExpirationTime
        );
      }
      break;
    }
  }
  // 这里分发完之后就没事了！！
}

// REVIEW - root对象经过beginWork分发之后，来到updateHostRoot！！！！

function updateHostRoot(current$$1, workInProgress, renderExpirationTime) {
  // 首次渲染阶段，current$$1是WIP的替身，workInProgress是当前fiber，renderExpirationTime是全局的nextRenderET（就是root的nextETToWork）

  // 保存上下文对象到一个统一的栈里面
  pushHostRootContext(workInProgress);

  // 拿到一些属性
  var updateQueue = workInProgress.updateQueue;
  var nextProps = workInProgress.pendingProps;
  var prevState = workInProgress.memoizedState;
  var prevChildren = prevState !== null ? prevState.element : null;

  // 处理更新，拿到更新队列里面最新的一个状态，标记副作用链，
  processUpdateQueue(
    workInProgress,
    updateQueue,
    nextProps,
    null,
    renderExpirationTime
  );

  // 拿到接下来需要更新的state（已经经过队列的所有应该更新的state的合并）
  var nextState = workInProgress.memoizedState;

  // 这个element指的是当前节点的下一个节点的虚拟DOM对象，之前在scheduleRootUpdate给payload赋值过一个有element属性的对象
  var nextChildren = nextState.element;
  // 首次渲染阶段不走下面的逻辑
  if (nextChildren === prevChildren) {
    // If the state is the same as before, that's a bailout because we had
    // no work that expires at this time.
    resetHydrationState();
    return bailoutOnAlreadyFinishedWork(
      current$$1,
      workInProgress,
      renderExpirationTime
    );
  }

  // 这里拿到的是root对象
  var root = workInProgress.stateNode;

  // current$$1是workInProgress的替身
  // 这是ssr的逻辑，如果是水化的话，副作用链改为placement，而不是update，也就是dom节点不变
  if (
    (current$$1 === null || current$$1.child === null) &&
    root.hydrate &&
    enterHydrationState(workInProgress)
  ) {
    // If we don't have any current children this might be the first pass.
    // We always try to hydrate. If this isn't a hydration pass there won't
    // be any children to hydrate which is effectively the same thing as
    // not hydrating.

    // This is a bit of a hack. We track the host root as a placement to
    // know that we're currently in a mounting state. That way isMounted
    // works as expected. We must reset this before committing.
    workInProgress.effectTag |= Placement;

    // Ensure that children mount into this root without tracking
    // side-effects. This ensures that we don't store Placement effects on
    // nodes that will be hydrated.
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime
    );
  } else {
    // 这是正常react的逻辑，开始对孩子进行调度！！！！！！
    // nextChildren指的是当前节点的虚拟DOM对象（在【首次渲染阶段】，这个element就是root的下一个节点的虚拟DOM，要么是函数组件，要么是类组件！！）
    reconcileChildren(
      current$$1,
      workInProgress,
      nextChildren,
      renderExpirationTime
    );
    resetHydrationState();
  }
  // 最后返回大儿子的fiber，回到【beginWork】函数
  return workInProgress.child;
}

function pushHostRootContext(workInProgress) {
  var root = workInProgress.stateNode;
  if (root.pendingContext) {
    pushTopLevelContextObject(
      workInProgress,
      root.pendingContext,
      root.pendingContext !== root.context
    );
  } else if (root.context) {
    // 首次渲染阶段，root的上下文是一个空对象
    pushTopLevelContextObject(workInProgress, root.context, false);
  }
  pushHostContainer(workInProgress, root.containerInfo);
}

function pushTopLevelContextObject(fiber, context, didChange) {
  push(contextStackCursor, context, fiber);
  push(didPerformWorkStackCursor, didChange, fiber);
}

function push(cursor, value, fiber) {
  // 总的来说，用来保存value到cursor的current里面，然后这个对象再保存到对应的栈里面，
  index++;
  // 首次渲染，这里第0个保存着一个空对象
  valueStack[index] = cursor.current;
  {
    fiberStack[index] = fiber;
  }
  // 首次渲染阶段，把context空对象给到contextStackCursor对象的current属性
  // 或者是false给到didPerformWorkStackCursor对象的current属性
  cursor.current = value;
}

function pushHostContainer(fiber, nextRootInstance) {
  // 首次渲染阶段，保存root的原生DOM到rootInstanceStackCursor的current里面，再保存到valueStack
  push(rootInstanceStackCursor, nextRootInstance, fiber);
  // 保存fiber到contextFiberStackCursor的current里面，再保存到valueStack
  push(contextFiberStackCursor, fiber, fiber);

  // 把一个空对象保存到contextStackCursor$1的current，然后保存到栈
  push(contextStackCursor$1, NO_CONTEXT, fiber);

  // 拿到根节点的原生DOM的类型，标准等信息，保存到contextStackCursor$1的current值
  var nextRootContext = getRootHostContext(nextRootInstance);
  // 把当前位置的contextStackCursor$1的current值从栈拿走，也就是删掉了之前的一个空对象NO_CONTEXT
  pop(contextStackCursor$1, fiber);
  // 把这个原生rootDOM的信息对象保存到contextStackCursor$1的current，再保存到栈
  push(contextStackCursor$1, nextRootContext, fiber);
}

function getRootHostContext(rootContainerInstance) {
  var type = void 0;
  var namespace = void 0;
  var nodeType = rootContainerInstance.nodeType;
  switch (nodeType) {
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE: {
      type = nodeType === DOCUMENT_NODE ? "#document" : "#fragment";
      var root = rootContainerInstance.documentElement;
      namespace = root ? root.namespaceURI : getChildNamespace(null, "");
      break;
    }
    default: {
      // root节点，这里得到的type是div，namespace是'http://www.w3.org/1999/xhtml'
      var container =
        nodeType === COMMENT_NODE
          ? rootContainerInstance.parentNode
          : rootContainerInstance;
      var ownNamespace = container.namespaceURI || null;
      type = container.tagName;
      namespace = getChildNamespace(ownNamespace, type);
      break;
    }
  }
  {
    var validatedTag = type.toLowerCase();
    var _ancestorInfo = updatedAncestorInfo(null, validatedTag);
    return { namespace: namespace, ancestorInfo: _ancestorInfo };
  }
  return namespace;
}

function getChildNamespace(parentNamespace, type) {
  if (parentNamespace == null || parentNamespace === HTML_NAMESPACE$1) {
    // No (or default) parent namespace: potential entry point.
    return getIntrinsicNamespace(type);
  }
  if (parentNamespace === SVG_NAMESPACE && type === "foreignObject") {
    // We're leaving SVG.
    return HTML_NAMESPACE$1;
  }
  // By default, pass namespace below.
  return parentNamespace;
}

function getIntrinsicNamespace(type) {
  switch (type) {
    case "svg":
      return SVG_NAMESPACE;
    case "math":
      return MATH_NAMESPACE;
    default:
      return HTML_NAMESPACE$1;
  }
}

updatedAncestorInfo = function (oldInfo, tag) {
  var ancestorInfo = _assign({}, oldInfo || emptyAncestorInfo);
  var info = { tag: tag };

  if (inScopeTags.indexOf(tag) !== -1) {
    ancestorInfo.aTagInScope = null;
    ancestorInfo.buttonTagInScope = null;
    ancestorInfo.nobrTagInScope = null;
  }
  if (buttonScopeTags.indexOf(tag) !== -1) {
    ancestorInfo.pTagInButtonScope = null;
  }

  // See rules for 'li', 'dd', 'dt' start tags in
  // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
  if (
    specialTags.indexOf(tag) !== -1 &&
    tag !== "address" &&
    tag !== "div" &&
    tag !== "p"
  ) {
    ancestorInfo.listItemTagAutoclosing = null;
    ancestorInfo.dlItemTagAutoclosing = null;
  }

  ancestorInfo.current = info;

  if (tag === "form") {
    ancestorInfo.formTag = info;
  }
  if (tag === "a") {
    ancestorInfo.aTagInScope = info;
  }
  if (tag === "button") {
    ancestorInfo.buttonTagInScope = info;
  }
  if (tag === "nobr") {
    ancestorInfo.nobrTagInScope = info;
  }
  if (tag === "p") {
    ancestorInfo.pTagInButtonScope = info;
  }
  if (tag === "li") {
    ancestorInfo.listItemTagAutoclosing = info;
  }
  if (tag === "dd" || tag === "dt") {
    ancestorInfo.dlItemTagAutoclosing = info;
  }

  return ancestorInfo;
};

function pop(cursor, fiber) {
  if (index < 0) {
    {
      warningWithoutStack$1(false, "Unexpected pop.");
    }
    return;
  }

  {
    if (fiber !== fiberStack[index]) {
      warningWithoutStack$1(false, "Unexpected Fiber popped.");
    }
  }

  cursor.current = valueStack[index];

  valueStack[index] = null;

  {
    fiberStack[index] = null;
  }

  index--;
}

function processUpdateQueue(
  workInProgress,
  queue,
  props,
  instance,
  renderExpirationTime
) {
  hasForceUpdate = false;

  // 这里需要保证提升的更新队列，和目前的更新队列不是一个内存地址的对象，为什么？为啥queue对象就不能复用呢？
  queue = ensureWorkInProgressQueueIsAClone(workInProgress, queue);

  // 然后替换掉全局的正在更新中的队列对象
  {
    currentlyProcessingQueue = queue;
  }

  // 定义一些本函数才用的变量
  var newBaseState = queue.baseState;
  var newFirstUpdate = null;
  var newExpirationTime = NoWork;

  // 初始化链表遍历中需要更新的中间变量
  var update = queue.firstUpdate;
  var resultState = newBaseState;
  while (update !== null) {
    // 这里的update存的eT就是root.nextExpirationTimeToWorkOn
    var updateExpirationTime = update.expirationTime;

    // 如果更新的优先级比较小
    // 首次渲染阶段，两者一样
    if (updateExpirationTime < renderExpirationTime) {
      // 这次更新的优先级低，需要跳过
      if (newFirstUpdate === null) {
        newFirstUpdate = update;
        newBaseState = resultState;
      }
      // 这个更新还留在链表里面，更新一下newExpirationTime的优先级
      if (newExpirationTime < updateExpirationTime) {
        newExpirationTime = updateExpirationTime;
      }
    } else {
      // 首次渲染走下面的逻辑
      // 更新的优先级大，需要进行更新，拿到最新的state，更新resultState变量
      resultState = getStateFromUpdate(
        workInProgress,
        queue,
        update,
        resultState,
        props,
        instance
      );

      // 首次渲染阶段，callback为work实例的一个_onCommit空函数
      var _callback = update.callback;
      if (_callback !== null) {
        // effectTag的初始默认值为0，Callback为32，与运算之后标识为32
        workInProgress.effectTag |= Callback;

        // 重置一下副作用链，以免上次残留的没有清理干净！
        // 然后依次把queue里面的update对象放到queue上面的effect链表上面，queue还是一个queue，只是把一个地方的属性的东西放到另一个属性上面
        update.nextEffect = null;
        if (queue.lastEffect === null) {
          queue.firstEffect = queue.lastEffect = update;
        } else {
          queue.lastEffect.nextEffect = update;
          queue.lastEffect = update;
        }
      }
    }
    // 去到更新队列的下一个update
    update = update.next;
  }

  // 首次渲染queue.firstCapturedUpdate为null，不走下面
  // 走到这里，最终resultState为最后的更新好之后的state
  // 后面再次进入一个update对象的循环，为什么？
  // queue对象的firstCapturedUpdate和firstUpdate什么区别？？
  var newFirstCapturedUpdate = null;
  update = queue.firstCapturedUpdate;
  while (update !== null) {
    var _updateExpirationTime = update.expirationTime;

    // 如果最后的这个update的优先级比较小，跳过
    if (_updateExpirationTime < renderExpirationTime) {
      if (newFirstCapturedUpdate === null) {
        // 更新一下newFirstCapturedUpdate的值，Captured是啥意思？
        newFirstCapturedUpdate = update;
        if (newFirstUpdate === null) {
          newBaseState = resultState;
        }
      }
      // 更新一下新的时间
      if (newExpirationTime < _updateExpirationTime) {
        newExpirationTime = _updateExpirationTime;
      }
    } else {
      // 更新的优先级大，需要进行更新，拿到最新的state，更新resultState变量
      resultState = getStateFromUpdate(
        workInProgress,
        queue,
        update,
        resultState,
        props,
        instance
      );

      // 首次渲染阶段，callback为null
      var _callback2 = update.callback;
      if (_callback2 !== null) {
        // 标记一下要更新的类型到副作用链阶段要用的effectTag上面
        workInProgress.effectTag |= Callback;
        update.nextEffect = null;
        if (queue.lastCapturedEffect === null) {
          queue.firstCapturedEffect = queue.lastCapturedEffect = update;
        } else {
          queue.lastCapturedEffect.nextEffect = update;
          queue.lastCapturedEffect = update;
        }
      }
    }
    update = update.next;
  }

  // 如果说一整个下来，newFirstUpdate都是空的，意味着每个update的优先级都很高，进入if的第二个逻辑
  // 如果不是的话，因此把lastUpdate变为null，因为队列里面按照应该是没有update对象的！
  if (newFirstUpdate === null) {
    queue.lastUpdate = null;
  }
  if (newFirstCapturedUpdate === null) {
    queue.lastCapturedUpdate = null;
  } else {
    // 标记一下要更新的类型到副作用链阶段要用的effectTag上面
    workInProgress.effectTag |= Callback;
  }

  if (newFirstUpdate === null && newFirstCapturedUpdate === null) {
    // 说明更新优先级都很低，还没更新这两个变量的值，说明此时的resultState就是最新的状态
    newBaseState = resultState;
  }

  // 更新queue对象的属性
  queue.baseState = newBaseState;
  queue.firstUpdate = newFirstUpdate;
  queue.firstCapturedUpdate = newFirstCapturedUpdate;

  // 把优先级和状态（memoizedState）一起更新在workInProgress里面
  workInProgress.expirationTime = newExpirationTime;
  workInProgress.memoizedState = resultState;

  // 恢复currentlyProcessingQueue变量的值
  {
    currentlyProcessingQueue = null;
  }
}

function ensureWorkInProgressQueueIsAClone(workInProgress, queue) {
  var current = workInProgress.alternate;
  if (current !== null) {
    // If the work-in-progress queue is equal to the current queue,
    // we need to clone it first.
    if (queue === current.updateQueue) {
      queue = workInProgress.updateQueue = cloneUpdateQueue(queue);
    }
  }
  return queue;
}

function cloneUpdateQueue(currentQueue) {
  var queue = {
    baseState: currentQueue.baseState,
    firstUpdate: currentQueue.firstUpdate,
    lastUpdate: currentQueue.lastUpdate,
    // keep these effects.
    firstCapturedUpdate: null,
    lastCapturedUpdate: null,

    firstEffect: null,
    lastEffect: null,

    firstCapturedEffect: null,
    lastCapturedEffect: null,
  };
  return queue;
}

function getStateFromUpdate(
  workInProgress,
  queue,
  update,
  prevState,
  nextProps,
  instance
) {
  switch (update.tag) {
    case ReplaceState: {
      var _payload = update.payload;
      if (typeof _payload === "function") {
        // Updater function
        {
          enterDisallowedContextReadInDEV();
          if (
            debugRenderPhaseSideEffects ||
            (debugRenderPhaseSideEffectsForStrictMode &&
              workInProgress.mode & StrictMode)
          ) {
            _payload.call(instance, prevState, nextProps);
          }
        }
        var nextState = _payload.call(instance, prevState, nextProps);
        {
          exitDisallowedContextReadInDEV();
        }
        return nextState;
      }
      // State object
      return _payload;
    }
    case CaptureUpdate: {
      workInProgress.effectTag =
        (workInProgress.effectTag & ~ShouldCapture) | DidCapture;
    }
    // Intentional fallthrough
    case UpdateState: {
      // 首次渲染，payload是这个对象：update.payload = { element: element };
      var _payload2 = update.payload;
      var partialState = void 0;
      if (typeof _payload2 === "function") {
        // 如果state是一个函数，就执行他，然后利用return的新state值
        // 一些开发环境的设置
        {
          enterDisallowedContextReadInDEV();
          if (
            debugRenderPhaseSideEffects ||
            (debugRenderPhaseSideEffectsForStrictMode &&
              workInProgress.mode & StrictMode)
          ) {
            _payload2.call(instance, prevState, nextProps);
          }
        }

        // 这里的instance在首次渲染的时候是null
        // 这个函数的入参是过去的state，和下一个props
        partialState = _payload2.call(instance, prevState, nextProps);

        // 一些开发环境的设置
        {
          exitDisallowedContextReadInDEV();
        }
      } else {
        // 如果payload也就是state的对象不是一个函数，就直接覆盖当前函数的变量
        partialState = _payload2;
      }

      if (partialState === null || partialState === undefined) {
        // 如果state是null，那就用之前的state（用来显示在页面上！！）
        return prevState;
      }

      // 用来和之前的state对象合并！注意是合并！
      // Merge the partial state and the previous state.
      return _assign({}, prevState, partialState);
    }
    case ForceUpdate: {
      hasForceUpdate = true;
      return prevState;
    }
  }
  return prevState;
}

// REVIEW - beginWork分发之后，对根节点已经进行处理（整合state）了，然后开始对孩子进行调度！！！！

function reconcileChildren(
  current$$1,
  workInProgress,
  nextChildren,
  renderExpirationTime
) {
  // 这里的current$$1是WIP的替身，
  // nextChildren是下一个节点的element虚拟DOM（这个会有变化吗，这是nextState.element），
  // renderExpirationTime就是全局的nextRenderET（就是root的nextETToWork），
  if (current$$1 === null) {
    // If this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. Instead,
    // we will add them all to the child before it gets rendered. That means
    // we can optimize this reconciliation pass by not tracking side-effects.
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime
    );
  } else {
    // 首次渲染走下面的逻辑，current$$1.child将会是null，nextChildren就是root的大儿子（唯一的儿子）
    // 开始处理fiber的大儿子！！！！
    // 得到处理好的大儿子之后给到child属性
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current$$1.child,
      nextChildren,
      renderExpirationTime
    );
  }
}

function ChildReconciler(shouldTrackSideEffects) {
  function reconcileChildFibers(
    returnFiber,
    currentFirstChild,
    newChild,
    expirationTime
  ) {
    // returnFiber是父亲fiber
    // currentFirstChild是父亲fiber的替身的大儿子（应该也是一个fiber），也就是当前页面显示的对应的节点
    // newChild是nextState.element，是最新的虚拟DOM

    // 用来处理这种情况 <>{[...]}</> 和 <>...</>
    // 在这种情况下，保证newChild除去了空的标签符号，剩下里面的所有孩子
    var isUnkeyedTopLevelFragment =
      typeof newChild === "object" &&
      newChild !== null &&
      newChild.type === REACT_FRAGMENT_TYPE &&
      newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children;
    }

    var isObject = typeof newChild === "object" && newChild !== null;

    // 如果newChild是一个对象或者一个数组的形式
    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // 首次渲染走这里！！！如果首次渲染的root的大儿子是一个单纯的函数组件或类组件的话
          // 通过reconcileSingleElement拿到大儿子节点的fiber
          // 然后修改effectTag属性，看是新增还是更新
          // 最后返回fiber！
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber,
              currentFirstChild,
              newChild,
              expirationTime
            )
          );
        case REACT_PORTAL_TYPE:
          return placeSingleChild(
            reconcileSinglePortal(
              returnFiber,
              currentFirstChild,
              newChild,
              expirationTime
            )
          );
      }
    }

    if (typeof newChild === "string" || typeof newChild === "number") {
      return placeSingleChild(
        reconcileSingleTextNode(
          returnFiber,
          currentFirstChild,
          "" + newChild,
          expirationTime
        )
      );
    }

    if (isArray(newChild)) {
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        expirationTime
      );
    }

    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(
        returnFiber,
        currentFirstChild,
        newChild,
        expirationTime
      );
    }

    if (isObject) {
      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === "function") {
        warnOnFunctionType();
      }
    }
    if (typeof newChild === "undefined" && !isUnkeyedTopLevelFragment) {
      // If the new child is undefined, and the return fiber is a composite
      // component, throw an error. If Fiber return types are disabled,
      // we already threw above.
      switch (returnFiber.tag) {
        case ClassComponent: {
          {
            var instance = returnFiber.stateNode;
            if (instance.render._isMockFunction) {
              // We allow auto-mocks to proceed as if they're returning null.
              break;
            }
          }
        }
        // Intentionally fall through to the next case, which handles both
        // functions and classes
        // eslint-disable-next-lined no-fallthrough
        case FunctionComponent: {
          var Component = returnFiber.type;
          invariant(
            false,
            "%s(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null.",
            Component.displayName || Component.name || "Component"
          );
        }
      }
    }

    // Remaining cases are all treated as empty.
    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }

  function reconcileSingleElement(
    returnFiber,
    currentFirstChild,
    element,
    expirationTime
  ) {
    // 这个函数是孩子fiber建设的分发器

    // returnFiber是父亲fiber节点
    // currentFirstChild就是父亲fiber节点的替身的大儿子fiber，也就是当前在页面显示出来的还没有更新的节点！！
    // element就是父亲fiber节点的大儿子fiber，也就是接下来要处理的节点！！
    // expirationTime就是全局的nextRenderET（就是root的nextETToWork）

    var key = element.key;
    var child = currentFirstChild;

    // 在首次渲染的时候，currentFirstChild是null，因为替身没有child属性
    // 如果有替身，就用替身，不用再新建一个fiber
    while (child !== null) {
      // the first item in the list.
      if (child.key === key) {
        if (
          child.tag === Fragment
            ? element.type === REACT_FRAGMENT_TYPE
            : child.elementType === element.type
        ) {
          deleteRemainingChildren(returnFiber, child.sibling);
          var existing = useFiber(
            child,
            element.type === REACT_FRAGMENT_TYPE
              ? element.props.children
              : element.props,
            expirationTime
          );
          existing.ref = coerceRef(returnFiber, child, element);
          existing.return = returnFiber;
          {
            existing._debugSource = element._source;
            existing._debugOwner = element._owner;
          }
          return existing;
        } else {
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }

    // 空标签走下面的逻辑
    if (element.type === REACT_FRAGMENT_TYPE) {
      var created = createFiberFromFragment(
        element.props.children,
        returnFiber.mode,
        expirationTime,
        element.key
      );
      created.return = returnFiber;
      return created;
    } else {
      // 单纯的函数组件或类组件走下面的逻辑
      // 创建一个fiber，然后更新ref属性
      // 给return的属性赋予父亲fiber
      var _created4 = createFiberFromElement(
        element,
        returnFiber.mode,
        expirationTime
      );
      _created4.ref = coerceRef(returnFiber, currentFirstChild, element);
      _created4.return = returnFiber;
      return _created4;
    }
  }

  function createFiberFromElement(element, mode, expirationTime) {
    var owner = null;
    {
      owner = element._owner;
    }
    var type = element.type;
    var key = element.key;
    var pendingProps = element.props;

    // 孩子的fiber的优先级（过期时间）和父亲的一致！！！！
    var fiber = createFiberFromTypeAndProps(
      type,
      key,
      pendingProps,
      owner,
      mode,
      expirationTime
    );
    {
      fiber._debugSource = element._source;
      fiber._debugOwner = element._owner;
    }
    return fiber;
  }

  function createFiberFromTypeAndProps(
    type, // React$ElementType
    key,
    pendingProps,
    owner,
    mode,
    expirationTime
  ) {
    var fiber = void 0;

    // 先假定一个中间类型的fiberTag
    var fiberTag = IndeterminateComponent;
    // 这是虚拟DOM的类型
    var resolvedType = type;

    // 开始定义fiberTag
    // 函数组件下面的判断都走不了，fiberTag只能是IndeterminateComponent
    // 类组件
    if (typeof type === "function") {
      if (shouldConstruct(type)) {
        fiberTag = ClassComponent;
      }
    } else if (typeof type === "string") {
      // 文本节点
      fiberTag = HostComponent;
    } else {
      // 其他类型的
      getTag: switch (type) {
        case REACT_FRAGMENT_TYPE:
          return createFiberFromFragment(
            pendingProps.children,
            mode,
            expirationTime,
            key
          );
        case REACT_CONCURRENT_MODE_TYPE:
          return createFiberFromMode(
            pendingProps,
            mode | ConcurrentMode | StrictMode,
            expirationTime,
            key
          );
        case REACT_STRICT_MODE_TYPE:
          return createFiberFromMode(
            pendingProps,
            mode | StrictMode,
            expirationTime,
            key
          );
        case REACT_PROFILER_TYPE:
          return createFiberFromProfiler(
            pendingProps,
            mode,
            expirationTime,
            key
          );
        case REACT_SUSPENSE_TYPE:
          return createFiberFromSuspense(
            pendingProps,
            mode,
            expirationTime,
            key
          );
        default: {
          if (typeof type === "object" && type !== null) {
            switch (type.$$typeof) {
              case REACT_PROVIDER_TYPE:
                fiberTag = ContextProvider;
                break getTag;
              case REACT_CONTEXT_TYPE:
                // This is a consumer
                fiberTag = ContextConsumer;
                break getTag;
              case REACT_FORWARD_REF_TYPE:
                fiberTag = ForwardRef;
                break getTag;
              case REACT_MEMO_TYPE:
                fiberTag = MemoComponent;
                break getTag;
              case REACT_LAZY_TYPE:
                fiberTag = LazyComponent;
                resolvedType = null;
                break getTag;
            }
          }
          var info = "";
          {
            if (
              type === undefined ||
              (typeof type === "object" &&
                type !== null &&
                Object.keys(type).length === 0)
            ) {
              info +=
                " You likely forgot to export your component from the file " +
                "it's defined in, or you might have mixed up default and " +
                "named imports.";
            }
            var ownerName = owner ? getComponentName(owner.type) : null;
            if (ownerName) {
              info += "\n\nCheck the render method of `" + ownerName + "`.";
            }
          }
          invariant(
            false,
            "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s",
            type == null ? type : typeof type,
            info
          );
        }
      }
    }

    fiber = createFiber(fiberTag, pendingProps, key, mode);
    fiber.elementType = type;
    fiber.type = resolvedType;
    fiber.expirationTime = expirationTime;

    return fiber;
  }

  function shouldConstruct(Component) {
    var prototype = Component.prototype;
    return !!(prototype && prototype.isReactComponent);
  }

  function coerceRef(returnFiber, current$$1, element) {
    // 拿到孩子当前的ref
    var mixedRef = element.ref;
    if (
      mixedRef !== null &&
      typeof mixedRef !== "function" &&
      typeof mixedRef !== "object"
    ) {
      {
        if (returnFiber.mode & StrictMode) {
          var componentName = getComponentName(returnFiber.type) || "Component";
          if (!didWarnAboutStringRefInStrictMode[componentName]) {
            warningWithoutStack$1(
              false,
              'A string ref, "%s", has been found within a strict mode tree. ' +
                "String refs are a source of potential bugs and should be avoided. " +
                "We recommend using createRef() instead." +
                "\n%s" +
                "\n\nLearn more about using refs safely here:" +
                "\nhttps://fb.me/react-strict-mode-string-ref",
              mixedRef,
              getStackByFiberInDevAndProd(returnFiber)
            );
            didWarnAboutStringRefInStrictMode[componentName] = true;
          }
        }
      }

      if (element._owner) {
        var owner = element._owner;
        var inst = void 0;
        if (owner) {
          var ownerFiber = owner;
          !(ownerFiber.tag === ClassComponent)
            ? invariant(
                false,
                "Function components cannot have refs. Did you mean to use React.forwardRef()?"
              )
            : void 0;
          inst = ownerFiber.stateNode;
        }
        !inst
          ? invariant(
              false,
              "Missing owner for string ref %s. This error is likely caused by a bug in React. Please file an issue.",
              mixedRef
            )
          : void 0;
        var stringRef = "" + mixedRef;
        // Check if previous string ref matches new string ref
        if (
          current$$1 !== null &&
          current$$1.ref !== null &&
          typeof current$$1.ref === "function" &&
          current$$1.ref._stringRef === stringRef
        ) {
          return current$$1.ref;
        }
        var ref = function (value) {
          var refs = inst.refs;
          if (refs === emptyRefsObject) {
            // This is a lazy pooled frozen object, so we need to initialize.
            refs = inst.refs = {};
          }
          if (value === null) {
            delete refs[stringRef];
          } else {
            refs[stringRef] = value;
          }
        };
        ref._stringRef = stringRef;
        return ref;
      } else {
        !(typeof mixedRef === "string")
          ? invariant(
              false,
              "Expected ref to be a function, a string, an object returned by React.createRef(), or null."
            )
          : void 0;
        !element._owner
          ? invariant(
              false,
              "Element ref was specified as a string (%s) but no owner was set. This could happen for one of the following reasons:\n1. You may be adding a ref to a function component\n2. You may be adding a ref to a component that was not created inside a component's render method\n3. You have multiple copies of React loaded\nSee https://fb.me/react-refs-must-have-owner for more information.",
              mixedRef
            )
          : void 0;
      }
    }
    return mixedRef;
  }

  function placeSingleChild(newFiber) {
    // placement的标识说明这是一个新建的fiber
    // shouldTrackSideEffects肯定是true
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement;
    }
    return newFiber;
  }

  return reconcileChildFibers;
}

var reconcileChildFibers = ChildReconciler(true);

function resetHydrationState() {
  // 如果不支持水化就直接退出吧！！
  if (!supportsHydration) {
    return;
  }

  // 重置水化的属性
  hydrationParentFiber = null;
  nextHydratableInstance = null;
  isHydrating = false;
}

function stopProfilerTimerIfRunningAndRecordDelta(fiber, overrideBaseTime) {
  if (!enableProfilerTimer) {
    return;
  }

  if (profilerStartTime >= 0) {
    var elapsedTime = now() - profilerStartTime;
    fiber.actualDuration += elapsedTime;
    if (overrideBaseTime) {
      fiber.selfBaseDuration = elapsedTime;
    }
    // 算完之后最后给开始时间恢复默认值！
    profilerStartTime = -1;
  }
}

function resetCurrentFiber() {
  {
    ReactDebugCurrentFrame.getCurrentStack = null;
    current = null;
    phase = null;
  }
}

// REVIEW - 函数组件经过beginWork分发来到mountIndeterminateComponent！！！！

function mountIndeterminateComponent(
  _current,
  workInProgress, 
  Component,
  renderExpirationTime
) {
  // 入参：
  // _current是workInProgress的替身fiber
  // Component是workInProgress.elementType，如果是函数组件的话也就是函数组件的函数本身
  // renderExpirationTime是全局的nextRenderET（就是root的nextETToWork）

  // 更新阶段走下面，首次渲染阶段不走下面
  if (_current !== null) {
    // An indeterminate component only mounts if it suspended inside a non-
    // concurrent tree, in an inconsistent state. We want to treat it like
    // a new mount, even though an empty version of it already committed.
    // Disconnect the alternate pointers.
    _current.alternate = null;
    workInProgress.alternate = null;
    // Since this is conceptually a new fiber, schedule a Placement effect
    workInProgress.effectTag |= Placement;
  }

  // 1. 拿到当前的pendingProps，在createFiberFromElement的时候，props被存到了fiber的这个属性里面
  var props = workInProgress.pendingProps;

  // 2. 下面是在找这个函数组件是不是用了context
  // 获取unmasked的上下文：看一下是否有自己定义的上下文，这个上下文就是一个Unmasked的上下文！
  var unmaskedContext = getUnmaskedContext(workInProgress, Component, false);
  // 获取masked的上下文，包裹一下unmaskedContext
  var context = getMaskedContext(workInProgress, unmaskedContext);

  // 准备好读取这个全局的上下文数据对象
  // ?待研究
  prepareToReadContext(workInProgress, renderExpirationTime);

  var value = void 0;

  // 下面这种情况什么时候会出现？？？
  {
    if (
      Component.prototype &&
      typeof Component.prototype.render === "function"
    ) {
      var componentName = getComponentName(Component) || "Unknown";

      if (!didWarnAboutBadClass[componentName]) {
        warningWithoutStack$1(
          false,
          "The <%s /> component appears to have a render method, but doesn't extend React.Component. " +
            "This is likely to cause errors. Change %s to extend React.Component instead.",
          componentName,
          componentName
        );
        didWarnAboutBadClass[componentName] = true;
      }
    }

    // 首次渲染，孩子的mode和父亲的mode一样，前者为4，后者为2，也就是100和010，与运算得到000，不走下面的逻辑
    if (workInProgress.mode & StrictMode) {
      ReactStrictModeWarnings.recordLegacyContextWarning(workInProgress, null);
    }

    // 3. 真正的函数隐藏在里面！！！使用钩子的函数组件的更新！！（包含函数的调用）
    // 重要的函数！！跟hooks相关的
    // 把当前的workInProgress保存到ReactCurrentOwner$3.current
    ReactCurrentOwner$3.current = workInProgress;
    // 把hooks的工具箱赋给全局变量，这样react对象就能拿到对应的函数，在函数组件执行中就能使用这些钩子函数
    value = renderWithHooks(
      null,
      workInProgress,
      Component,
      props,
      context,
      renderExpirationTime
    );
  }
  // React DevTools reads this flag.
  workInProgress.effectTag |= PerformedWork;

  if (
    typeof value === "object" &&
    value !== null &&
    typeof value.render === "function" &&
    value.$$typeof === undefined
  ) {
    // Proceed under the assumption that this is a class instance
    workInProgress.tag = ClassComponent;

    // Throw out any hooks that were used.
    resetHooks();

    // Push context providers early to prevent context stack mismatches.
    // During mounting we don't know the child context yet as the instance doesn't exist.
    // We will invalidate the child context in finishClassComponent() right after rendering.
    var hasContext = false;
    if (isContextProvider(Component)) {
      hasContext = true;
      pushContextProvider(workInProgress);
    } else {
      hasContext = false;
    }

    workInProgress.memoizedState =
      value.state !== null && value.state !== undefined ? value.state : null;

    var getDerivedStateFromProps = Component.getDerivedStateFromProps;
    if (typeof getDerivedStateFromProps === "function") {
      applyDerivedStateFromProps(
        workInProgress,
        Component,
        getDerivedStateFromProps,
        props
      );
    }

    adoptClassInstance(workInProgress, value);
    mountClassInstance(workInProgress, Component, props, renderExpirationTime);
    return finishClassComponent(
      null,
      workInProgress,
      Component,
      true,
      hasContext,
      renderExpirationTime
    );
  } else {
    // Proceed under the assumption that this is a function component
    workInProgress.tag = FunctionComponent;
    {
      if (
        debugRenderPhaseSideEffects ||
        (debugRenderPhaseSideEffectsForStrictMode &&
          workInProgress.mode & StrictMode)
      ) {
        // Only double-render components with Hooks
        if (workInProgress.memoizedState !== null) {
          value = renderWithHooks(
            null,
            workInProgress,
            Component,
            props,
            context,
            renderExpirationTime
          );
        }
      }
    }
    reconcileChildren(null, workInProgress, value, renderExpirationTime);
    {
      validateFunctionComponentInDev(workInProgress, Component);
    }
    return workInProgress.child;
  }
}

function getUnmaskedContext(
  workInProgress,
  Component,
  didPushOwnContextIfProvider
) {
  if (didPushOwnContextIfProvider && isContextProvider(Component)) {
    // 如果此刻处理的这个fiber有他自己的上下文，是一个上下文的provider
    // 那么我们用以前的上下文，（已经把她的孩子的上下文存到栈里面了）
    return previousContext;
  }
  // 如果只是一个普通的节点，就用现在的这个上下文栈
  return contextStackCursor.current;
}

function isContextProvider(type) {
  var childContextTypes = type.childContextTypes;
  return childContextTypes !== null && childContextTypes !== undefined;
}

function getMaskedContext(workInProgress, unmaskedContext) {
  var type = workInProgress.type;
  var contextTypes = type.contextTypes;
  // 这里在找函数中是不是用了context上下文，不是的话就直接回到原来的函数了
  if (!contextTypes) {
    return emptyContextObject;
  }

  // Avoid recreating masked context unless unmasked context has changed.
  // Failing to do this will result in unnecessary calls to componentWillReceiveProps.
  // This may trigger infinite loops if componentWillReceiveProps calls setState.
  var instance = workInProgress.stateNode;
  if (
    instance &&
    instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext
  ) {
    return instance.__reactInternalMemoizedMaskedChildContext;
  }

  var context = {};
  for (var key in contextTypes) {
    context[key] = unmaskedContext[key];
  }

  {
    var name = getComponentName(type) || "Unknown";
    checkPropTypes(
      contextTypes,
      context,
      "context",
      name,
      getCurrentFiberStackInDev
    );
  }

  // Cache unmasked context so we can avoid recreating masked context unless necessary.
  // Context is created before the class component is instantiated so check for instance.
  if (instance) {
    cacheContext(workInProgress, unmaskedContext, context);
  }

  return context;
}

function prepareToReadContext(workInProgress, renderExpirationTime) {
  currentlyRenderingFiber = workInProgress;
  lastContextDependency = null;
  lastContextWithAllBitsObserved = null;

  var currentDependencies = workInProgress.contextDependencies;
  if (
    currentDependencies !== null &&
    currentDependencies.expirationTime >= renderExpirationTime
  ) {
    // Context list has a pending update. Mark that this fiber performed work.
    markWorkInProgressReceivedUpdate();
  }

  // Reset the work-in-progress list
  workInProgress.contextDependencies = null;
}





function renderWithHooks(
  current,
  workInProgress,
  Component,
  props,
  refOrContext,
  nextRenderExpirationTime
) {
  // 入参：
  // 从mountIndeterminateComponent过来的current为null
  // Component是函数组件的函数本身
  // props是WIPfiber的pendingProps
  // refOrContext是context对象或者ref，从mountIndeterminateComponent过来的话就是context
  // nextRenderExpirationTime是全局的nextRenderET（就是root的nextETToWork）


  // 1. 首先覆盖一些全局变量
  renderExpirationTime = nextRenderExpirationTime;
  currentlyRenderingFiber$1 = workInProgress;
  nextCurrentHook = current !== null ? current.memoizedState : null;

  {
    hookTypesDev = current !== null ? current._debugHookTypes : null;
    hookTypesUpdateIndexDev = -1;
  }

  // 接下来用到的全局变量是这些
  // currentHook = null;
  // workInProgressHook = null;

  // remainingExpirationTime = NoWork;
  // componentUpdateQueue = null;

  // didScheduleRenderPhaseUpdate = false;
  // renderPhaseUpdates = null;
  // numberOfReRenders = 0;
  // sideEffectTag = 0;


  // 2. 接下来是拿到hooks的工具箱
  // 给dispatcher赋值，dispatcher的意思也就是hook的工具箱集合体！！！！
  // 从mountIndeterminateComponent过来的，走ReactCurrentDispatcher$1.current = HooksDispatcherOnMountInDEV
  // 也就是在首次渲染阶段，ReactCurrentDispatcher$1.current存的是响应的hooks的工具包
  {
    if (nextCurrentHook !== null) {
      ReactCurrentDispatcher$1.current = HooksDispatcherOnUpdateInDEV;
    } else if (hookTypesDev !== null) {
      // This dispatcher handles an edge case where a component is updating,
      // but no stateful hooks have been used.
      // We want to match the production code behavior (which will use HooksDispatcherOnMount),
      // but with the extra DEV validation to ensure hooks ordering hasn't changed.
      // This dispatcher does that.
      ReactCurrentDispatcher$1.current =
        HooksDispatcherOnMountWithHookTypesInDEV;
    } else {
      ReactCurrentDispatcher$1.current = HooksDispatcherOnMountInDEV;
    }
  }


  // 3. 拿到之后执行函数组件，用上hooks工具箱
  // 这里非常之重要，这里在真正的执行这个函数组件！！！！
  // 拿到return的虚拟DOM，这个是一个虚拟DOM，而不是一个数组或者对象啥的
  // 这也是函数组件的返回值必须是一个标签包裹的所有标签的原因

  // 期间使用钩子！！！，这里假设使用了reducer和state的钩子
  var children = Component(props, refOrContext);

  //
  if (didScheduleRenderPhaseUpdate) {
    do {
      didScheduleRenderPhaseUpdate = false;
      numberOfReRenders += 1;

      // Start over from the beginning of the list
      nextCurrentHook = current !== null ? current.memoizedState : null;
      nextWorkInProgressHook = firstWorkInProgressHook;

      currentHook = null;
      workInProgressHook = null;
      componentUpdateQueue = null;

      {
        // Also validate hook order for cascading updates.
        hookTypesUpdateIndexDev = -1;
      }

      ReactCurrentDispatcher$1.current = HooksDispatcherOnUpdateInDEV;

      children = Component(props, refOrContext);
    } while (didScheduleRenderPhaseUpdate);

    renderPhaseUpdates = null;
    numberOfReRenders = 0;
  }

  // We can assume the previous dispatcher is always this one, since we set it
  // at the beginning of the render phase and there's no re-entrancy.
  ReactCurrentDispatcher$1.current = ContextOnlyDispatcher;

  var renderedWork = currentlyRenderingFiber$1;

  renderedWork.memoizedState = firstWorkInProgressHook;
  renderedWork.expirationTime = remainingExpirationTime;
  renderedWork.updateQueue = componentUpdateQueue;
  renderedWork.effectTag |= sideEffectTag;

  {
    renderedWork._debugHookTypes = hookTypesDev;
  }

  // This check uses currentHook so that it works the same in DEV and prod bundles.
  // hookTypesDev could catch more cases (e.g. context) but only in DEV bundles.
  var didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;

  renderExpirationTime = NoWork;
  currentlyRenderingFiber$1 = null;

  currentHook = null;
  nextCurrentHook = null;
  firstWorkInProgressHook = null;
  workInProgressHook = null;
  nextWorkInProgressHook = null;

  {
    currentHookNameInDev = null;
    hookTypesDev = null;
    hookTypesUpdateIndexDev = -1;
  }

  remainingExpirationTime = NoWork;
  componentUpdateQueue = null;
  sideEffectTag = 0;

  // These were reset above
  // didScheduleRenderPhaseUpdate = false;
  // renderPhaseUpdates = null;
  // numberOfReRenders = 0;

  !!didRenderTooFewHooks
    ? invariant(
        false,
        "Rendered fewer hooks than expected. This may be caused by an accidental early return statement."
      )
    : void 0;

  return children;
}




// REVIEW - 下面是在执行函数组件过程中，进去执行的钩子函数，都是React对象里面的！！！！





function useReducer(reducer, initialArg, init) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}

function resolveDispatcher() {
  // 拿到hooks的工具箱，这个工具箱子在哪里被赋值？？
  // 在renderWithHooks里面，一旦工具箱子被赋值就立刻执行函数组件的函数
  var dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}
