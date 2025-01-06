// *TODO - 全局变量
// 1.createElement阶段
var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;

// 2.创建fiber阶段
// 模式
var NoContext = 0; // 二进制为000
var ConcurrentMode = 1; // 二进制为001
var StrictMode = 2; // 二进制为010
var ProfileMode = 4; // 二进制为100

// 是否允许开启profiler的计时器指标？？？？？？
var enableProfilerTimer = true;
// 是否允许跟踪每次提交的交互触发
var enableSchedulerTracing = true;
// 是否开启开发工具
var isDevToolsPresent = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';

// 组件类型tag
var FunctionComponent = 0;
var ClassComponent = 1;
var IndeterminateComponent = 2; // Before we know whether it is function or class
var HostRoot = 3; // Root of a host tree. Could be nested inside another node.
var HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
var HostComponent = 5;
var HostText = 6;


// 3.批量更新定义阶段
// 是批量更新模式，默认为非批量更新，也就是全部瞬时更新
var isBatchingUpdates = false;
// 非批量更新模式，默认为批量更新
var isUnbatchingUpdates = false;



// 4.正式的updateContainer阶段
// 多个root（更新的，第二个的...）的链表头尾记录器
// 第一个root指针，首次渲染阶段为null，后续变为xxx
var firstScheduledRoot = null;
// 最后一个需要更新的root，首次渲染阶段为null，后续变为xxx
var lastScheduledRoot = null;


// 过期时间（优先级的包裹形态，最终形态）等级定义
var NoWork = 0;
var Never = 1;
var maxSigned31BitInt = 1073741823;
var Sync = maxSigned31BitInt;

var UNIT_SIZE = 10;
var MAGIC_NUMBER_OFFSET = maxSigned31BitInt - 1;

const hasNativePerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';
const now = hasNativePerformanceNow ? () => performance.now() : () => Date.now();
function msToExpirationTime(ms) {
  return MAGIC_NUMBER_OFFSET - (ms / UNIT_SIZE | 0);
}
// 这是数字number类型,当前的时间戳，是一串数字，距离标准时间的毫秒数
let originalStartTimeMs = now();

// 当前的过期时间（优先级的包裹形态，最终形态），(x/y)|0表示y差距以内的数都相同，抹平了短时间内重复交互导致过期时间不一样的问题
var currentRendererTime = msToExpirationTime(originalStartTimeMs);
// 两个变量的初始化默认都是一个时间戳，单纯的时间戳，而非某个时间差
// 在首次渲染阶段，两个变量都会变为首次渲染准备开始的时间与下载完js开始执行的时间
// 因为首次渲染肯定会执行updateContainer
var currentSchedulerTime = currentRendererTime;


// 优先级（初始形态）定义
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



// 是否正在渲染过程中，指的是“遍历树的开始”到“遍历副作用链结束”的过程，初始化肯定是否
var isRendering = false;
// 啥意思？？？
var nextFlushedRoot = null;
var nextFlushedExpirationTime = NoWork;



var isWorking = false;

// 下一个将要创建fiber的虚拟DOM，也是一个单元
var nextUnitOfWork = null;
var nextRoot = null;

// 正在渲染阶段的过期时间，初始化值是最低的优先级，目的干嘛？？在scheduleWork里面被赋值
var nextRenderExpirationTime = NoWork;

var lowestPriorityPendingInteractiveExpirationTime = NoWork;
var hasUnhandledError = false;
var unhandledError = null;


var completedBatches = null;


// 上下文，用来干嘛？？？
var emptyContextObject = {};
{
  Object.freeze(emptyContextObject);
}
var contextStackCursor = createCursor(emptyContextObject);
var didPerformWorkStackCursor = createCursor(false);
var previousContext = emptyContextObject;




// 5. 从root开始更新的scheduleRootUpdate（也可以说是updateContainerForExpirationTime）的阶段

// 工具类
var ReactFiberInstrumentation = {
  debugTool: null
};
var ReactFiberInstrumentation_1 = ReactFiberInstrumentation;

// 不知道干嘛的
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



// *TODO - 创建虚拟DOM（jsx等于虚拟DOM）


function createElementWithValidation(type, props, children) {
  var validType = isValidElementType(type);


  if (!validType) {
    var info = '';
    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
      info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
    }

    var sourceInfo = getSourceInfoErrorAddendum(props);
    if (sourceInfo) {
      info += sourceInfo;
    } else {
      info += getDeclarationErrorAddendum();
    }

    var typeString = void 0;
    if (type === null) {
      typeString = 'null';
    } else if (Array.isArray(type)) {
      typeString = 'array';
    } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
      typeString = '<' + (getComponentName(type.type) || 'Unknown') + ' />';
      info = ' Did you accidentally export a JSX literal instead of a component?';
    } else {
      typeString = typeof type;
    }

    warning$1(false, 'React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
  }

  var element = createElement.apply(this, arguments);


  if (element == null) {
    return element;
  }

  if (validType) {
    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], type);
    }
  }

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
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;


    // 把所有的config上面的（不包括原型上面）的属性放到props里面
    // 相当于用Object.keys拿到config对象的keyName，然后放到props上面
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
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
      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }
      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }
  }
  // 把材料整合起来，成为一个虚拟DOM，就是一个对象
  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
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
    _owner: owner
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
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    });
    // self and source are DEV only properties.
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self
    });
    // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};



function validateChildKeys(node, parentType) {
  if (typeof node !== 'object') {
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
    if (typeof iteratorFn === 'function') {
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
  if (type === null || type === undefined || typeof type === 'string') {
    return;
  }
  var name = getComponentName(type);

  // 下面是在判断propTypes（若有）的props类型是否合法
  var propTypes = void 0;
  if (typeof type === 'function') {
    propTypes = type.propTypes;
  } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE ||
  // Note: Memo only checks outer props here.
  // Inner props are checked in the reconciler.
  type.$$typeof === REACT_MEMO_TYPE)) {
    propTypes = type.propTypes;
  } else {
    return;
  }
  if (propTypes) {
    setCurrentlyValidatingElement(element);
    checkPropTypes(propTypes, element.props, 'prop', name, ReactDebugCurrentFrame.getStackAddendum);
    setCurrentlyValidatingElement(null);
  } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
    propTypesMisspellWarningShown = true;
    warningWithoutStack$1(false, 'Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', name || 'Unknown');
  }
  if (typeof type.getDefaultProps === 'function') {
    !type.getDefaultProps.isReactClassApproved ? warningWithoutStack$1(false, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : void 0;
  }
}


function getComponentName(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }
  {
    if (typeof type.tag === 'number') {
      warningWithoutStack$1(false, 'Received an unexpected object in getComponentName(). ' + 'This is likely a bug in React. Please file an issue.');
    }
  }
  if (typeof type === 'function') {
    return type.displayName || type.name || null;
  }
  if (typeof type === 'string') {
    return type;
  }
  switch (type) {
    case REACT_CONCURRENT_MODE_TYPE:
      return 'ConcurrentMode';
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';
    case REACT_PORTAL_TYPE:
      return 'Portal';
    case REACT_PROFILER_TYPE:
      return 'Profiler';
    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';
    case REACT_SUSPENSE_TYPE:
      return 'Suspense';
  }
  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_CONTEXT_TYPE:
        return 'Context.Consumer';
      case REACT_PROVIDER_TYPE:
        return 'Context.Provider';
      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');
      case REACT_MEMO_TYPE:
        return getComponentName(type.type);
      case REACT_LAZY_TYPE:
        {
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



// *TODO - ReactDOM的render方法，主入口，创建root对象，fiber，ReactRoot对象等


var ReactDOM = {

  render: function (element, container, callback) {
    !isValidContainer(container) ? invariant(false, 'Target container is not a DOM element.') : void 0;
    {
      !!container._reactHasBeenPassedToCreateRootDEV ? warningWithoutStack$1(false, 'You are calling ReactDOM.render() on a container that was previously ' + 'passed to ReactDOM.%s(). This is not supported. ' + 'Did you mean to call root.render(element)?', enableStableConcurrentModeAPIs ? 'createRoot' : 'unstable_createRoot') : void 0;
    }
    return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
  },
}

function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
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
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);


    // 如果还有第三个参数，源地修改一下这个回调，并以纯正的root作为对象，作为他的上下文，让他可以拿到某些属性
    // 后面放入队列，等到commit完之后执行
    if (typeof callback === 'function') {
      var originalCallback = callback;
      callback = function () {
        var instance = getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }

    // 首次渲染不应该是批次更新，而应该是瞬时更新
    unbatchedUpdates(function () {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(parentComponent, children, callback);
      } else {
        root.render(children, callback);
      }
    });

  } else {

    if (typeof callback === 'function') {
      var _originalCallback = callback;
      callback = function () {
        var instance = getPublicRootInstance(root._internalRoot);
        _originalCallback.call(instance);
      };
    }
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(parentComponent, children, callback);
    } else {
      root.render(children, callback);
    }
  }
  return getPublicRootInstance(root._internalRoot);

}



function legacyCreateRootFromDOMContainer(container, forceHydrate) {
  // 看是否需要水化
  var shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  if (!shouldHydrate) {
    var warned = false;
    var rootSibling = void 0;
    while (rootSibling = container.lastChild) {
      {
        if (!warned && rootSibling.nodeType === ELEMENT_NODE && rootSibling.hasAttribute(ROOT_ATTRIBUTE_NAME)) {
          warned = true;
          warningWithoutStack$1(false, 'render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.');
        }
      }
      container.removeChild(rootSibling);
    }
  }
  {
    if (shouldHydrate && !forceHydrate && !warnedAboutHydrateAPI) {
      warnedAboutHydrateAPI = true;
      lowPriorityWarning$1(false, 'render(): Calling ReactDOM.render() to hydrate server-rendered markup ' + 'will stop working in React v17. Replace the ReactDOM.render() call ' + 'with ReactDOM.hydrate() if you want React to attach to the server HTML.');
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
    warnOnInvalidCallback(callback, 'render');
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
    warnOnInvalidCallback(callback, 'render');
  }
  if (callback !== null) {
    work.then(callback);
  }
  updateContainer(null, root, null, work._onCommit);
  return work;
};
ReactRoot.prototype.legacy_renderSubtreeIntoContainer = function (parentComponent, children, callback) {
  var root = this._internalRoot;
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, 'render');
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
    while (insertBefore !== null && insertBefore._expirationTime >= expirationTime) {
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
      pendingInteractionMap: new Map()
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
      nextScheduledRoot: null
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
    if (!hasBadMapPolyfill && typeof Object.preventExtensions === 'function') {
      Object.preventExtensions(this);
    }
  }
}



// *TODO - ReactDOM的render方法，主入口后面的unbatchedUpdates更新函数，调用ReactRoot的render方法更新


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
// !为什么要把核心主入口函数放到ReactRoot对象上面呢？
// !是不是因为ReactRoot对象上面保存有root对象，可以直接通过
// legacyRenderSubtreeIntoContainer函数分发两个东西，一个是创建好的ReactRoot对象，一个是定义批量或非批量，执行入口函数




ReactRoot.prototype.render = function (children, callback) {
  var root = this._internalRoot;

  // 创建一个work，用来保存render函数的第三个参数，后面等到一定的时机会执行
  // _callbacks数组存的callback函数
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, 'render');
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
    !(typeof _callback2 === 'function') ? invariant(false, 'Invalid argument passed as callback. Expected a function. Instead received: %s', _callback2) : void 0;
    _callback2();
  }
};




// *TODO - ReactRoot对象里面的render方法调用的updateContainer函数，是真正的入口！！！
// 分两步，首先计算过期时间，然后根据过期时间进行更新



function updateContainer(element, container, parentComponent, callback) {
  // 拿到的是root的fiber对象
  var current$$1 = container.current;
  // 计算当前的时间（当前执行到这个函数与拿到js初始执行的那一个的时间差）
  var currentTime = requestCurrentTime();
  // 根据当前时间计算优先级，肯定是越往后交互的事件导致引发的scheduleWork引发的计算优先级会更高
  var expirationTime = computeExpirationForFiber(currentTime, current$$1);
  // 开始更新，根据优先级
  return updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback);
}



function requestCurrentTime() {
  // 在一次render中，如果我有一个新的任务进来了，要计算 expirationTime 发现现在处于渲染阶段，这时直接返回上次 render 开始的时间，再去计算 expirationTime
  // 好处是 前后两次计算出来的 expirationTime 是一样的，让这个任务提前进行调度
  if (isRendering) {
    return currentSchedulerTime;
  }

  // !找优先级最高的一个root。。。。。。。目的是？？？？
  findHighestPriorityRoot();

  // 如果nextFlushedExpirationTime是优先级低（1）和最低（0）的，都要重新计算一下当前的时间，为什么？？？？？？？
  // 在首次渲染阶段，nextFlushedExpirationTime是0，
  // !每次findHighestPriorityRoot执行完之后，都会把nextFlushedExpirationTime变为xxxxxx
  if (nextFlushedExpirationTime === NoWork || nextFlushedExpirationTime === Never) {
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
  // !待定看
  if (lastScheduledRoot !== null) {
    var previousScheduledRoot = lastScheduledRoot;
    var root = firstScheduledRoot;
    while (root !== null) {
      var remainingExpirationTime = root.expirationTime;
      if (remainingExpirationTime === NoWork) {
        // This root no longer has work. Remove it from the scheduler.
        // below where we set lastScheduledRoot to null, even though we break
        // from the loop right after.
        !(previousScheduledRoot !== null && lastScheduledRoot !== null) ? invariant(false, 'Should have a previous and last root. This error is likely caused by a bug in React. Please file an issue.') : void 0;
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

  // !这两个参数用来干嘛？？？？？
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
  if ((fiber.mode & ConcurrentMode) === NoContext) {
    expirationTime = Sync;
  } else if (isWorking && !isCommitting) {
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

    // !这里在干嘛？？？？
    if (nextRoot !== null && expirationTime === nextRenderExpirationTime) {
      expirationTime -= 1;
    }
  }

  // !这里在设置最低优先级的过期时间，目的是什么？？？？
  // 首次渲染状态下，lowestPriorityPendingInteractiveExpirationTime是最低优先级，也就是0，但是priorityLevel是3，不满足下面的条件
  if (
    priorityLevel === UserBlockingPriority && 
    (lowestPriorityPendingInteractiveExpirationTime === NoWork || expirationTime < lowestPriorityPendingInteractiveExpirationTime)
  ) {
    lowestPriorityPendingInteractiveExpirationTime = expirationTime;
  }

  return expirationTime;
}

function getCurrentPriorityLevel() {
  return currentPriorityLevel;
}




// *TODO - updateContainer函数的最后一个函数updateContainerAtExpirationTime，计算完过期时间，开始着手更新了！！！
// 其中updateContainerAtExpirationTime也是一个小小的包裹，中间保存了上下文到root对象里面
// scheduleRootUpdate才是更新的开始



function updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback) {
  // 这里拿到的就是root对象的fiber
  var current$$1 = container.current;

  // debug工具类的设置
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

  // !这里在设置上下文，目的是什么？？？？
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
    if (phase === 'render' && current !== null && !didWarnAboutNestedUpdates) {
      didWarnAboutNestedUpdates = true;
      warningWithoutStack$1(false, 'Render methods should be a pure function of props and state; ' + 'triggering nested component updates from render is not allowed. ' + 'If necessary, trigger nested updates in componentDidUpdate.\n\n' + 'Check the render method of %s.', getComponentName(current.type) || 'Unknown');
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
    !(typeof callback === 'function') ? warningWithoutStack$1(false, 'render(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callback) : void 0;
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
    nextEffect: null
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
    // 只用一个更新队列
    queue1 = fiber.updateQueue;
    queue2 = null;
    // 首次渲染，fiber都没有更新队列，为null
    // 走下面做初始化，创建一个队列对象，给到fiber的updateQueue属性，注意，队列也是一个对象！！！用的是链表结构，而不是数组！！
    if (queue1 === null) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
    }
  } else {
    // !待补充！！！！！！！！！！！！！！！！！！！
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
    // !待补充！！！！！！！！！！！1
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
    if (fiber.tag === ClassComponent && (currentlyProcessingQueue === queue1 || queue2 !== null && currentlyProcessingQueue === queue2) && !didWarnUpdateInsideUpdate) {
      warningWithoutStack$1(false, 'An update (setState, replaceState, or forceUpdate) was scheduled ' + 'from inside an update function. Update functions should be pure, ' + 'with zero side-effects. Consider using componentDidUpdate or a ' + 'callback.');
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
    lastCapturedEffect: null
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




// *TODO - scheduleRootUpdate的scheduleWork，保存好更新队列之后，开始全局从root开始调度！！！




function scheduleWork(fiber, expirationTime) {

  // 首先先攀岩到根root上面，无论目前身处哪个fiber，这个root是root对象，而非原生的stateNode
  // 同时更新每个fiber身上的优先级，包括替身fiber
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

  // 这是在干啥？？？？首次渲染的nextRenderExpirationTime是NoWork，也就是0
  if (!isWorking && nextRenderExpirationTime !== NoWork && expirationTime > nextRenderExpirationTime) {
    // This is an interruption. (Used for performance tracking.)
    interruptedBy = fiber;
    resetStack();
  }

  markPendingPriorityLevel(root, expirationTime);


  if (!isWorking || isCommitting$1 || nextRoot !== root) {
    var rootExpirationTime = root.expirationTime;
    requestWork(root, rootExpirationTime);
  }

  if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
    // Reset this back to zero so subsequent updates don't throw.
    nestedUpdateCount = 0;
    invariant(false, 'Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.');
  }
}


function scheduleWorkToRoot(fiber, expirationTime) {
  // !做这个的目的是什么？？？
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
  // !同时更新一下过去的fiber的过期时间为最新的，为什么？？？？？
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
        // !待补充！！！！！！！！！！！！！！！
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
          var threadID = computeThreadID(expirationTime, root.interactionThreadID);
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
    if (currentPhase !== null && currentPhase !== 'componentWillMount' && currentPhase !== 'componentWillReceiveProps') {
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
  findNextExpirationTimeToWorkOn(expirationTime, root);
}


