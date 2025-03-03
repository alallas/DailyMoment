// 一些专题类的查找关键字：
// 上下文：【上下文】


// 一些解释：
// 1. 过期时间和优先级之间是什么关系？？

// 过期时间：
// 在 React 中，任务的“过期时间”是基于调度队列的时间戳，表示一个任务在什么时候需要完成。
// 过期时间越小，表示任务越接近超时，需要尽快执行。

// 优先级：
// 优先级高的任务意味着它应该尽快执行，而低优先级的任务可以延后执行。

// 两者关系（负相关）
// 优先级越高，priorityLevel就越小，过期时间离当前时间就越近，也就是过期时间越小
// 用户输入为高优先级任务（尽量快速响应用户的输入）。懒加载内容为低优先级任务



// 2. 各个类型的过期时间及相应的mark函数是什么意思？？
// 一句话：新和早是针对优先级定义的新和早，而非过期时间，也就是说earliest表示晚一点执行的任务（优先级低）

// （一）
// pending任务是一个新创建的任务，没有经过任何的更新，没有经过像 suspend 这样的流程
// 对于调用 scheduleWork 进来的任务，都认为它是 pending 的任务
// earliestPendingTime表示最早的等待更新时间，取最大值，优先级最小
// latestPendingTime 表示最晚的等待更新时间，取最小值, 优先级最大

// function markPendingPriorityLevel(root, expirationTime) {
//   root.didError = false;
//   var earliestPendingTime = root.earliestPendingTime;
//   if (earliestPendingTime === NoWork) {
// 1.处理没有pending任务的情况
//     root.earliestPendingTime = root.latestPendingTime = expirationTime;
//   } else {
// 2.处理有pending任务的情况
//     if (earliestPendingTime < expirationTime) {
// 2.1当前任务的时间比早待处理任务时间更大，优先级更低：更新earliestPendingTime
//       root.earliestPendingTime = expirationTime;
//     } else {
// 2.2当前任务的比早待处理任务时间更小，优先级更高
//       var latestPendingTime = root.latestPendingTime;
//       if (latestPendingTime > expirationTime) {
// 2.2.1当前任务比晚处理任务时间更小，优先级更高：更新latestPendingTime
//         root.latestPendingTime = expirationTime;
//       }
//     }
//   }
//   findNextExpirationTimeToWorkOn(expirationTime, root);
// }


// （二）
// suspend任务是一个经过更新的任务，在commit阶段经过suspend这样的流程


// function markSuspendedPriorityLevel(root, suspendedTime) {
//   root.didError = false;
//   clearPing(root, suspendedTime);
//   var earliestPendingTime = root.earliestPendingTime;
//   var latestPendingTime = root.latestPendingTime;
// 1.挂起任务就是即将要处理的任务
//   if (earliestPendingTime === suspendedTime) {
//     if (latestPendingTime === suspendedTime) {
// 1.1挂起任务等于所有待处理任务：重置（本次处理的是两者同一个，相当于把过去的属性值更新为0）
//       root.earliestPendingTime = root.latestPendingTime = NoWork;
//     } else {
// 1.2挂起任务不是新待处理任务，是早待处理任务：用晚待处理任务覆盖早待处理任务（本次处理的是早待处理，相当于把下一个批次要处理的任务覆盖掉早待处理任务）
//       root.earliestPendingTime = root.latestPendingTime;
//     }
//   } else if (latestPendingTime === suspendedTime) {
// 1.3挂起任务不是早待处理任务，而是晚待处理任务：用早待处理任务覆盖晚待处理任务（本次处理的是晚待处理，相当于把下一个批次要处理的任务覆盖掉晚待处理任务）
//     root.latestPendingTime = earliestPendingTime;
//   }
// 2.挂起任务不是即将要处理的任务
//   var earliestSuspendedTime = root.earliestSuspendedTime;
//   var latestSuspendedTime = root.latestSuspendedTime;
//   if (earliestSuspendedTime === NoWork) {
// 2.1处理没有suspended任务的情况
//     root.earliestSuspendedTime = root.latestSuspendedTime = suspendedTime;
//   } else {
// 2.2处理有suspended任务的情况
//     if (earliestSuspendedTime < suspendedTime) {
// 2.2.1当前任务的时间比早挂起任务时间更大，优先级更低：更新earliestSuspendedTime
//       root.earliestSuspendedTime = suspendedTime;
//     } else if (latestSuspendedTime > suspendedTime) {
// 2.2.2当前任务的时间比晚挂起任务时间更小，优先级更高：更新latestSuspendedTime
//       root.latestSuspendedTime = suspendedTime;
//     }
//   }
//   findNextExpirationTimeToWorkOn(suspendedTime, root);
// }


// （三）
// pinged任务是一个被激活的任务，只有latestPingedTime，没有earliestPingedTime



// （四）
// renderRoot在执行完workLoop之后，如果开启了时间切片，需要找到优先级最低的任务，用来计算剩下的时间，为什么？？？

// function findEarliestOutstandingPriorityLevel(root, renderExpirationTime) {
//   var earliestExpirationTime = renderExpirationTime;
//   var earliestPendingTime = root.earliestPendingTime;
//   var earliestSuspendedTime = root.earliestSuspendedTime;
// 1.如果当前任务的时间小于早待处理任务的时间，当前任务的优先级大：把当前任务的时间改为早待处理任务的时间
//   if (earliestPendingTime > earliestExpirationTime) {
//     earliestExpirationTime = earliestPendingTime;
//   }
// 2.如果当前任务的时间小于早挂起任务的时间，当前任务的优先级大：把当前任务的时间改为早挂起任务的时间
//   if (earliestSuspendedTime > earliestExpirationTime) {
//     earliestExpirationTime = earliestSuspendedTime;
//   }
//   return earliestExpirationTime;
// }




// （五）
// 提交阶段的根据优先级决定下一个执行的root

// function markCommittedPriorityLevels(root, earliestRemainingTime) {
//   root.didError = false;
// 1.处理当前任务为空的情况：清空所有属性
//   if (earliestRemainingTime === NoWork) {
//     root.earliestPendingTime = NoWork;
//     root.latestPendingTime = NoWork;
//     root.earliestSuspendedTime = NoWork;
//     root.latestSuspendedTime = NoWork;
//     root.latestPingedTime = NoWork;
//     findNextExpirationTimeToWorkOn(NoWork, root);
//     return;
//   }
// 2.处理被激活的任务————当前任务时间小于被激活任务的时间，当前任务优先级大：把下一批次的新被激活时间恢复为0
//   if (earliestRemainingTime < root.latestPingedTime) {
//     root.latestPingedTime = NoWork;
//   }
// 3.处理待处理任务
//   var latestPendingTime = root.latestPendingTime;
//   if (latestPendingTime !== NoWork) {
// 确保不为空
//     if (latestPendingTime > earliestRemainingTime) {
// 3.1当前任务时间小于晚待处理任务时间，优先级大：把下一批次的早/晚待处理时间恢复为0，确保findhighest函数中当前任务为优先级最高的
//       root.earliestPendingTime = root.latestPendingTime = NoWork;
//     } else {
//       var earliestPendingTime = root.earliestPendingTime;
//       if (earliestPendingTime > earliestRemainingTime) {
// 3.2当前任务时间大于晚待处理任务时间，且当前任务时间小于早待处理时间（优先级即晚>当前>早）：当前处理的应该是晚待处理时间，把早待处理时间改为晚待处理时间
//         root.earliestPendingTime = root.latestPendingTime;
//       }
//     }
//   }
// 4.处理挂起任务
//   var earliestSuspendedTime = root.earliestSuspendedTime;
// 4.1处理没有suspended任务的情况：直接处理pending任务
//   if (earliestSuspendedTime === NoWork) {
//     markPendingPriorityLevel(root, earliestRemainingTime);
//     findNextExpirationTimeToWorkOn(NoWork, root);
//     return;
//   }
// 4.2处理有suspended任务的情况
//   var latestSuspendedTime = root.latestSuspendedTime;
//   if (earliestRemainingTime < latestSuspendedTime) {
// 4.2.1当前任务时间小于晚挂起任务时间，优先级大：把下一批次的早/晚挂起时间和待激活时间恢复为0，且直接处理pending任务
//     root.earliestSuspendedTime = NoWork;
//     root.latestSuspendedTime = NoWork;
//     root.latestPingedTime = NoWork;
//     markPendingPriorityLevel(root, earliestRemainingTime);
//     findNextExpirationTimeToWorkOn(NoWork, root);
//     return;
//   }
// 4.2.2当前任务时间大于早挂起任务时间，优先级小：直接处理pending任务
//   if (earliestRemainingTime > earliestSuspendedTime) {
//     markPendingPriorityLevel(root, earliestRemainingTime);
//     findNextExpirationTimeToWorkOn(NoWork, root);
//     return;
//   }
//   findNextExpirationTimeToWorkOn(NoWork, root);
// }




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

// 是否开启时间切片模式
var didYield = false;


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

var nextLatestAbsoluteTimeoutMs = -1;

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
// 数字越小，优先级越大
var ImmediatePriority = 1;
var UserBlockingPriority = 2;
var NormalPriority = 3;
var LowPriority = 4;
var IdlePriority = 5;


// 过期时间
// Times out immediately
var IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out
var USER_BLOCKING_PRIORITY = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000;
// Never times out
var IDLE_PRIORITY = maxSigned31BitInt;



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
// 在completeUnitOfWork里面被赋予给下一个孩子
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

// 调用保护性的回调函数，来“重放”失败的工作单元
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
var Placement = /*             */ 2;     // “新插入”
var Update = /*                */ 4;     // 更新 state 或 props
var PlacementAndUpdate = /*    */ 6;     // 新插入 + 更新，也就是Placement 和 Update 的组合（2 | 4）
var Deletion = /*              */ 8;     // 删除
var ContentReset = /*          */ 16;    // 重置（通常用于节点的文本内容或状态恢复）
var Callback = /*              */ 32;    // 回调需要执行（例如 componentDidMount、componentDidUpdate）
var DidCapture = /*            */ 64;    // 捕获到某些异常
var Ref = /*                   */ 128;   // 当前节点有 ref 需要处理
var Snapshot = /*              */ 256;   // 需要快照（通常在 getSnapshotBeforeUpdate 生命周期方法中使用）
var Passive = /*               */ 512;   // 该副作用是被动的（例如，useEffect 的副作用），异步操作

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




// 11.钩子相关
// 11.1 hook链条

// Hooks are stored as a linked list on the fiber's memoizedState field. The
// current hook list is the list that belongs to the current fiber. The
// work-in-progress hook list is a new list that will be added to the
// work-in-progress fiber.

// workInProgressHook用来保存一个函数组件中的所有hook，是有先后顺序的
var currentHook = null;
var nextCurrentHook = null;
var firstWorkInProgressHook = null;
var workInProgressHook = null;
var nextWorkInProgressHook = null;

// hook专用的eT？？？
var remainingExpirationTime = NoWork;

// 下面两个是用在useEffect钩子里面的
var componentUpdateQueue = null;
var sideEffectTag = 0;




// 赋予effectTag的值的时候用
var NoEffect$1 = /*             */ 0; // 没有副作用

var UnmountSnapshot = /*      */ 2; // 卸载一个组件之前先执行该快照副作用

var UnmountMutation = /*      */ 4; // 副作用会在组件被销毁时执行
var MountMutation = /*        */ 8; // 组件被添加到 DOM 中时执行，通常涉及修改 DOM 或其他底层操作

var UnmountLayout = /*        */ 16; // 会在卸载前进行测量或调整 DOM 布局
var MountLayout = /*          */ 32; // 组件首次渲染时的布局调整，确保 DOM 元素按照正确的布局进行排列。

var MountPassive = /*         */ 64; // 在组件挂载之后执行
var UnmountPassive = /*       */ 128; // 组件卸载时执行



// 11.2 dispatcher相关的

// 函数执行过程中使用的存储器，实际上就是ReactCurrentDispatcher，只是为了函数调用方便又赋了一个变量
var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;

// hooks的工具箱！！
// 首渲阶段的工具箱
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

// 二更阶段的工具箱
HooksDispatcherOnUpdateInDEV = {
  readContext: function (context, observedBits) {
    return readContext(context, observedBits);
  },
  useCallback: function (callback, deps) {
    currentHookNameInDev = 'useCallback';
    updateHookTypesDev();
    return updateCallback(callback, deps);
  },
  useContext: function (context, observedBits) {
    currentHookNameInDev = 'useContext';
    updateHookTypesDev();
    return readContext(context, observedBits);
  },
  useEffect: function (create, deps) {
    currentHookNameInDev = 'useEffect';
    updateHookTypesDev();
    return updateEffect(create, deps);
  },
  useImperativeHandle: function (ref, create, deps) {
    currentHookNameInDev = 'useImperativeHandle';
    updateHookTypesDev();
    return updateImperativeHandle(ref, create, deps);
  },
  useLayoutEffect: function (create, deps) {
    currentHookNameInDev = 'useLayoutEffect';
    updateHookTypesDev();
    return updateLayoutEffect(create, deps);
  },
  useMemo: function (create, deps) {
    currentHookNameInDev = 'useMemo';
    updateHookTypesDev();
    var prevDispatcher = ReactCurrentDispatcher$1.current;
    ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
    try {
      return updateMemo(create, deps);
    } finally {
      ReactCurrentDispatcher$1.current = prevDispatcher;
    }
  },
  useReducer: function (reducer, initialArg, init) {
    currentHookNameInDev = 'useReducer';
    updateHookTypesDev();
    var prevDispatcher = ReactCurrentDispatcher$1.current;
    ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
    try {
      return updateReducer(reducer, initialArg, init);
    } finally {
      ReactCurrentDispatcher$1.current = prevDispatcher;
    }
  },
  useRef: function (initialValue) {
    currentHookNameInDev = 'useRef';
    updateHookTypesDev();
    return updateRef(initialValue);
  },
  useState: function (initialState) {
    currentHookNameInDev = 'useState';
    updateHookTypesDev();
    var prevDispatcher = ReactCurrentDispatcher$1.current;
    ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
    try {
      return updateState(initialState);
    } finally {
      ReactCurrentDispatcher$1.current = prevDispatcher;
    }
  },
  useDebugValue: function (value, formatterFn) {
    currentHookNameInDev = 'useDebugValue';
    updateHookTypesDev();
    return updateDebugValue(value, formatterFn);
  }
};




// ？？？？？？？？用来？？
// 是否在当前执行的渲染过程中安排了更新。
var didScheduleRenderPhaseUpdate = false;

// Lazily created map of render-phase updates
var renderPhaseUpdates = null;

// 一个索引，用来拿出当前链条的hook对象
var numberOfReRenders = 0;
var RE_RENDER_LIMIT = 25;

// In DEV, this is the name of the currently executing primitive hook
var currentHookNameInDev = null;


// In DEV, this list ensures that hooks are called in the same order between renders.
// The list stores the order of hooks used during the initial render (mount).
// Subsequent renders (updates) reference this list.
var hookTypesDev = null;
var hookTypesUpdateIndexDev = -1;




// 12. 上下文相关
var isPrimaryRenderer = true;

var rendererSigil = void 0;
{
  // Use this to detect multiple renderers using the same context
  rendererSigil = {};
}

var currentlyRenderingFiber = null;
var lastContextDependency = null;
var lastContextWithAllBitsObserved = null;



// 13. completeWork阶段

// 真实DOM的索引，指向fiber的
var randomKey = Math.random().toString(36).slice(2);
var internalInstanceKey = '__reactInternalInstance$' + randomKey;
var internalEventHandlersKey = '__reactEventHandlers$' + randomKey;


// 给原生DOM进行setProp的时候用到了，
var DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
var SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning';
var SUPPRESS_HYDRATION_WARNING$1 = 'suppressHydrationWarning';
var AUTOFOCUS = 'autoFocus';
var CHILDREN = 'children';
var STYLE$1 = 'style';
var HTML = '__html';



var properties = {};


var registrationNameModules = {};



/* eslint-disable max-len */
var ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
/* eslint-enable max-len */
var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';


var ROOT_ATTRIBUTE_NAME = 'data-reactroot';
var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');

var hasOwnProperty = Object.prototype.hasOwnProperty;
var illegalAttributeNameCache = {};
var validatedAttributeNameCache = {};





// 14. 事件触发相关

// 所有事件

function unsafeCastStringToDOMTopLevelType(topLevelType) {
  return topLevelType;
}

var TOP_ABORT = unsafeCastStringToDOMTopLevelType('abort');
var TOP_ANIMATION_END = unsafeCastStringToDOMTopLevelType(getVendorPrefixedEventName('animationend'));
var TOP_ANIMATION_ITERATION = unsafeCastStringToDOMTopLevelType(getVendorPrefixedEventName('animationiteration'));
var TOP_ANIMATION_START = unsafeCastStringToDOMTopLevelType(getVendorPrefixedEventName('animationstart'));
var TOP_BLUR = unsafeCastStringToDOMTopLevelType('blur');
var TOP_CAN_PLAY = unsafeCastStringToDOMTopLevelType('canplay');
var TOP_CAN_PLAY_THROUGH = unsafeCastStringToDOMTopLevelType('canplaythrough');
var TOP_CANCEL = unsafeCastStringToDOMTopLevelType('cancel');
var TOP_CHANGE = unsafeCastStringToDOMTopLevelType('change');
var TOP_CLICK = unsafeCastStringToDOMTopLevelType('click');
var TOP_CLOSE = unsafeCastStringToDOMTopLevelType('close');
var TOP_COMPOSITION_END = unsafeCastStringToDOMTopLevelType('compositionend');
var TOP_COMPOSITION_START = unsafeCastStringToDOMTopLevelType('compositionstart');
var TOP_COMPOSITION_UPDATE = unsafeCastStringToDOMTopLevelType('compositionupdate');
var TOP_CONTEXT_MENU = unsafeCastStringToDOMTopLevelType('contextmenu');
var TOP_COPY = unsafeCastStringToDOMTopLevelType('copy');
var TOP_CUT = unsafeCastStringToDOMTopLevelType('cut');
var TOP_DOUBLE_CLICK = unsafeCastStringToDOMTopLevelType('dblclick');
var TOP_AUX_CLICK = unsafeCastStringToDOMTopLevelType('auxclick');
var TOP_DRAG = unsafeCastStringToDOMTopLevelType('drag');
var TOP_DRAG_END = unsafeCastStringToDOMTopLevelType('dragend');
var TOP_DRAG_ENTER = unsafeCastStringToDOMTopLevelType('dragenter');
var TOP_DRAG_EXIT = unsafeCastStringToDOMTopLevelType('dragexit');
var TOP_DRAG_LEAVE = unsafeCastStringToDOMTopLevelType('dragleave');
var TOP_DRAG_OVER = unsafeCastStringToDOMTopLevelType('dragover');
var TOP_DRAG_START = unsafeCastStringToDOMTopLevelType('dragstart');
var TOP_DROP = unsafeCastStringToDOMTopLevelType('drop');
var TOP_DURATION_CHANGE = unsafeCastStringToDOMTopLevelType('durationchange');
var TOP_EMPTIED = unsafeCastStringToDOMTopLevelType('emptied');
var TOP_ENCRYPTED = unsafeCastStringToDOMTopLevelType('encrypted');
var TOP_ENDED = unsafeCastStringToDOMTopLevelType('ended');
var TOP_ERROR = unsafeCastStringToDOMTopLevelType('error');
var TOP_FOCUS = unsafeCastStringToDOMTopLevelType('focus');
var TOP_GOT_POINTER_CAPTURE = unsafeCastStringToDOMTopLevelType('gotpointercapture');
var TOP_INPUT = unsafeCastStringToDOMTopLevelType('input');
var TOP_INVALID = unsafeCastStringToDOMTopLevelType('invalid');
var TOP_KEY_DOWN = unsafeCastStringToDOMTopLevelType('keydown');
var TOP_KEY_PRESS = unsafeCastStringToDOMTopLevelType('keypress');
var TOP_KEY_UP = unsafeCastStringToDOMTopLevelType('keyup');
var TOP_LOAD = unsafeCastStringToDOMTopLevelType('load');
var TOP_LOAD_START = unsafeCastStringToDOMTopLevelType('loadstart');
var TOP_LOADED_DATA = unsafeCastStringToDOMTopLevelType('loadeddata');
var TOP_LOADED_METADATA = unsafeCastStringToDOMTopLevelType('loadedmetadata');
var TOP_LOST_POINTER_CAPTURE = unsafeCastStringToDOMTopLevelType('lostpointercapture');
var TOP_MOUSE_DOWN = unsafeCastStringToDOMTopLevelType('mousedown');
var TOP_MOUSE_MOVE = unsafeCastStringToDOMTopLevelType('mousemove');
var TOP_MOUSE_OUT = unsafeCastStringToDOMTopLevelType('mouseout');
var TOP_MOUSE_OVER = unsafeCastStringToDOMTopLevelType('mouseover');
var TOP_MOUSE_UP = unsafeCastStringToDOMTopLevelType('mouseup');
var TOP_PASTE = unsafeCastStringToDOMTopLevelType('paste');
var TOP_PAUSE = unsafeCastStringToDOMTopLevelType('pause');
var TOP_PLAY = unsafeCastStringToDOMTopLevelType('play');
var TOP_PLAYING = unsafeCastStringToDOMTopLevelType('playing');
var TOP_POINTER_CANCEL = unsafeCastStringToDOMTopLevelType('pointercancel');
var TOP_POINTER_DOWN = unsafeCastStringToDOMTopLevelType('pointerdown');


var TOP_POINTER_MOVE = unsafeCastStringToDOMTopLevelType('pointermove');
var TOP_POINTER_OUT = unsafeCastStringToDOMTopLevelType('pointerout');
var TOP_POINTER_OVER = unsafeCastStringToDOMTopLevelType('pointerover');
var TOP_POINTER_UP = unsafeCastStringToDOMTopLevelType('pointerup');
var TOP_PROGRESS = unsafeCastStringToDOMTopLevelType('progress');
var TOP_RATE_CHANGE = unsafeCastStringToDOMTopLevelType('ratechange');
var TOP_RESET = unsafeCastStringToDOMTopLevelType('reset');
var TOP_SCROLL = unsafeCastStringToDOMTopLevelType('scroll');
var TOP_SEEKED = unsafeCastStringToDOMTopLevelType('seeked');
var TOP_SEEKING = unsafeCastStringToDOMTopLevelType('seeking');
var TOP_SELECTION_CHANGE = unsafeCastStringToDOMTopLevelType('selectionchange');
var TOP_STALLED = unsafeCastStringToDOMTopLevelType('stalled');
var TOP_SUBMIT = unsafeCastStringToDOMTopLevelType('submit');
var TOP_SUSPEND = unsafeCastStringToDOMTopLevelType('suspend');
var TOP_TEXT_INPUT = unsafeCastStringToDOMTopLevelType('textInput');
var TOP_TIME_UPDATE = unsafeCastStringToDOMTopLevelType('timeupdate');
var TOP_TOGGLE = unsafeCastStringToDOMTopLevelType('toggle');
var TOP_TOUCH_CANCEL = unsafeCastStringToDOMTopLevelType('touchcancel');
var TOP_TOUCH_END = unsafeCastStringToDOMTopLevelType('touchend');
var TOP_TOUCH_MOVE = unsafeCastStringToDOMTopLevelType('touchmove');
var TOP_TOUCH_START = unsafeCastStringToDOMTopLevelType('touchstart');
var TOP_TRANSITION_END = unsafeCastStringToDOMTopLevelType(getVendorPrefixedEventName('transitionend'));
var TOP_VOLUME_CHANGE = unsafeCastStringToDOMTopLevelType('volumechange');
var TOP_WAITING = unsafeCastStringToDOMTopLevelType('waiting');
var TOP_WHEEL = unsafeCastStringToDOMTopLevelType('wheel');



var knownHTMLTopLevelTypes = [TOP_ABORT, TOP_CANCEL, TOP_CAN_PLAY, TOP_CAN_PLAY_THROUGH, TOP_CLOSE, TOP_DURATION_CHANGE, TOP_EMPTIED, TOP_ENCRYPTED, TOP_ENDED, TOP_ERROR, TOP_INPUT, TOP_INVALID, TOP_LOAD, TOP_LOADED_DATA, TOP_LOADED_METADATA, TOP_LOAD_START, TOP_PAUSE, TOP_PLAY, TOP_PLAYING, TOP_PROGRESS, TOP_RATE_CHANGE, TOP_RESET, TOP_SEEKED, TOP_SEEKING, TOP_STALLED, TOP_SUBMIT, TOP_SUSPEND, TOP_TIME_UPDATE, TOP_TOGGLE, TOP_VOLUME_CHANGE, TOP_WAITING];

var interactiveEventTypeNames = [[TOP_BLUR, 'blur'], [TOP_CANCEL, 'cancel'], [TOP_CLICK, 'click'], [TOP_CLOSE, 'close'], [TOP_CONTEXT_MENU, 'contextMenu'], [TOP_COPY, 'copy'], [TOP_CUT, 'cut'], [TOP_AUX_CLICK, 'auxClick'], [TOP_DOUBLE_CLICK, 'doubleClick'], [TOP_DRAG_END, 'dragEnd'], [TOP_DRAG_START, 'dragStart'], [TOP_DROP, 'drop'], [TOP_FOCUS, 'focus'], [TOP_INPUT, 'input'], [TOP_INVALID, 'invalid'], [TOP_KEY_DOWN, 'keyDown'], [TOP_KEY_PRESS, 'keyPress'], [TOP_KEY_UP, 'keyUp'], [TOP_MOUSE_DOWN, 'mouseDown'], [TOP_MOUSE_UP, 'mouseUp'], [TOP_PASTE, 'paste'], [TOP_PAUSE, 'pause'], [TOP_PLAY, 'play'], [TOP_POINTER_CANCEL, 'pointerCancel'], [TOP_POINTER_DOWN, 'pointerDown'], [TOP_POINTER_UP, 'pointerUp'], [TOP_RATE_CHANGE, 'rateChange'], [TOP_RESET, 'reset'], [TOP_SEEKED, 'seeked'], [TOP_SUBMIT, 'submit'], [TOP_TOUCH_CANCEL, 'touchCancel'], [TOP_TOUCH_END, 'touchEnd'], [TOP_TOUCH_START, 'touchStart'], [TOP_VOLUME_CHANGE, 'volumeChange']];
var nonInteractiveEventTypeNames = [[TOP_ABORT, 'abort'], [TOP_ANIMATION_END, 'animationEnd'], [TOP_ANIMATION_ITERATION, 'animationIteration'], [TOP_ANIMATION_START, 'animationStart'], [TOP_CAN_PLAY, 'canPlay'], [TOP_CAN_PLAY_THROUGH, 'canPlayThrough'], [TOP_DRAG, 'drag'], [TOP_DRAG_ENTER, 'dragEnter'], [TOP_DRAG_EXIT, 'dragExit'], [TOP_DRAG_LEAVE, 'dragLeave'], [TOP_DRAG_OVER, 'dragOver'], [TOP_DURATION_CHANGE, 'durationChange'], [TOP_EMPTIED, 'emptied'], [TOP_ENCRYPTED, 'encrypted'], [TOP_ENDED, 'ended'], [TOP_ERROR, 'error'], [TOP_GOT_POINTER_CAPTURE, 'gotPointerCapture'], [TOP_LOAD, 'load'], [TOP_LOADED_DATA, 'loadedData'], [TOP_LOADED_METADATA, 'loadedMetadata'], [TOP_LOAD_START, 'loadStart'], [TOP_LOST_POINTER_CAPTURE, 'lostPointerCapture'], [TOP_MOUSE_MOVE, 'mouseMove'], [TOP_MOUSE_OUT, 'mouseOut'], [TOP_MOUSE_OVER, 'mouseOver'], [TOP_PLAYING, 'playing'], [TOP_POINTER_MOVE, 'pointerMove'], [TOP_POINTER_OUT, 'pointerOut'], [TOP_POINTER_OVER, 'pointerOver'], [TOP_PROGRESS, 'progress'], [TOP_SCROLL, 'scroll'], [TOP_SEEKING, 'seeking'], [TOP_STALLED, 'stalled'], [TOP_SUSPEND, 'suspend'], [TOP_TIME_UPDATE, 'timeUpdate'], [TOP_TOGGLE, 'toggle'], [TOP_TOUCH_MOVE, 'touchMove'], [TOP_TRANSITION_END, 'transitionEnd'], [TOP_WAITING, 'waiting'], [TOP_WHEEL, 'wheel']];


var eventTypes$4 = {};
var topLevelEventsToDispatchConfig = {};


// 为topLevelEventsToDispatchConfig映射表存储事件，及相应的优先级等信息
function addEventTypeNameToConfig(_ref, isInteractive) {
  var topEvent = _ref[0],
      event = _ref[1];

  var capitalizedEvent = event[0].toUpperCase() + event.slice(1);
  var onEvent = 'on' + capitalizedEvent;

  var type = {
    phasedRegistrationNames: {
      bubbled: onEvent,
      captured: onEvent + 'Capture'
    },
    dependencies: [topEvent],
    isInteractive: isInteractive
  };
  eventTypes$4[event] = type;
  topLevelEventsToDispatchConfig[topEvent] = type;
}

interactiveEventTypeNames.forEach(function (eventTuple) {
  addEventTypeNameToConfig(eventTuple, true);
});
nonInteractiveEventTypeNames.forEach(function (eventTuple) {
  addEventTypeNameToConfig(eventTuple, false);
});



// 包装的事件对象池子
var callbackBookkeepingPool = [];


// 是否批量更新
var isBatching = false;


// 事件对象的插件，用来补充一些属性
var plugins = [];
var namesToPlugins = {};


// 把namesToPlugins的插件放到plugins数组里面
function recomputePluginOrdering() {
  if (!eventPluginOrder) {
    // Wait until an `eventPluginOrder` is injected.
    return;
  }
  for (var pluginName in namesToPlugins) {
    var pluginModule = namesToPlugins[pluginName];
    var pluginIndex = eventPluginOrder.indexOf(pluginName);
    !(pluginIndex > -1) ? invariant(false, 'EventPluginRegistry: Cannot inject event plugins that do not exist in the plugin ordering, `%s`.', pluginName) : void 0;
    if (plugins[pluginIndex]) {
      continue;
    }
    !pluginModule.extractEvents ? invariant(false, 'EventPluginRegistry: Event plugins must implement an `extractEvents` method, but `%s` does not.', pluginName) : void 0;
    plugins[pluginIndex] = pluginModule;
    var publishedEvents = pluginModule.eventTypes;
    for (var eventName in publishedEvents) {
      !publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName) ? invariant(false, 'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', eventName, pluginName) : void 0;
    }
  }
}


// 把一些插件放到namesToPlugins里面
function injectEventPluginsByName(injectedNamesToPlugins) {
  var isOrderingDirty = false;
  for (var pluginName in injectedNamesToPlugins) {
    if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
      continue;
    }
    var pluginModule = injectedNamesToPlugins[pluginName];
    if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== pluginModule) {
      !!namesToPlugins[pluginName] ? invariant(false, 'EventPluginRegistry: Cannot inject two different event plugins using the same name, `%s`.', pluginName) : void 0;
      namesToPlugins[pluginName] = pluginModule;
      isOrderingDirty = true;
    }
  }
  if (isOrderingDirty) {
    recomputePluginOrdering();
  }
}
// 具体的插件函数在【事件触发相关】部分
injectEventPluginsByName({
  SimpleEventPlugin: SimpleEventPlugin,
  EnterLeaveEventPlugin: EnterLeaveEventPlugin,
  ChangeEventPlugin: ChangeEventPlugin,
  SelectEventPlugin: SelectEventPlugin,
  BeforeInputEventPlugin: BeforeInputEventPlugin
});



// 插件运行过程中使用到的

var supportedInputTypes = {
  color: true,
  date: true,
  datetime: true,
  'datetime-local': true,
  email: true,
  month: true,
  number: true,
  password: true,
  range: true,
  search: true,
  tel: true,
  text: true,
  time: true,
  url: true,
  week: true
};




// 将事件名称与其依赖的事件列表关联起来。
// 某些事件的触发可能依赖于其他事件的发生。例如，一个事件可能需要在其他事件先发生后才能正确触发。
// eventTypes: {
//   onClick: {
//     dependencies: ['onMouseDown', 'onMouseUp']
//   },
//   onDoubleClick: {
//     dependencies: ['onClick']
//   }
// }
var registrationNameDependencies = {};
function publishRegistrationName(registrationName, pluginModule, eventName) {
  !!registrationNameModules[registrationName] ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same registration name, `%s`.', registrationName) : void 0;
  registrationNameModules[registrationName] = pluginModule;
  registrationNameDependencies[registrationName] = pluginModule.eventTypes[eventName].dependencies;

  {
    var lowerCasedName = registrationName.toLowerCase();
    possibleRegistrationNames[lowerCasedName] = registrationName;

    if (registrationName === 'onDoubleClick') {
      possibleRegistrationNames.ondblclick = registrationName;
    }
  }
}



var eventQueue = null;

// 唯一一个承担全局事件处理的元素
var fakeNode = document.createElement('react');


// 合成事件池子的容量
var EVENT_POOL_SIZE = 10;
// 外层事件池子容量
var CALLBACK_BOOKKEEPING_POOL_SIZE = 10;




// 15. 提交阶段
var completedBatches = null;

var _enabled = true;


// commit前的准备，记录文本选中范围
var eventsEnabled = null;
var selectionInformation = null;


// 任务调度队列的全局变量
var nextEffect = null;
var firstCallbackNode = null;

var isExecutingCallback = false;
var isHostCallbackScheduled = false;


// 任务调度过程中
var scheduledHostCallback = null;
var isMessageEventScheduled = false;
var timeoutTime = -1;

var isAnimationFrameScheduled = false;

var isFlushingHostCallback = false;

var frameDeadline = 0;
// We start out assuming that we run at 30fps but then the heuristic tracking
// will adjust this value to a faster fps if we get more frequent animation
// frames.
var previousFrameTime = 33;
var activeFrameTime = 33;

var shouldYieldToHost;
shouldYieldToHost = function () {
  return frameDeadline <= now();
};

// We use the postMessage trick to defer idle work until after the repaint.
var channel = new MessageChannel();
var port = channel.port2;


// 回调函数flushWork执行中
var currentDidTimeout = false;


// requestAnimationFrame没有的时候直接用setTimeOut
// 此时的setTimeOut的推迟时间是100
var ANIMATION_FRAME_TIMEOUT = 100;


// onCommit的时候
var nextID = 0;
var helpersByRendererID = new Map();

// onCommitRoot内部
var helpersByRendererID = new Map();
var helpersByRoot = new Map(); // We keep track of mounted roots so we can schedule updates.

var mountedRoots = new Set(); // If a root captures an error, we remember it so we can retry on edit.

var failedRoots = new Set(); // In environments that support WeakMap, we also remember the last element for every root.
// It needs to be weak because we do this even for roots that failed to mount.
// If there is no WeakMap, we won't attempt to do retrying.
// $FlowIssue






// 16. 二次更新

var ReactCurrentOwner$3 = ReactSharedInternals.ReactCurrentOwner;








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

  // 首次渲染阶段：
  // 第一次执行这个函数：一开始的lastScheduledRoot最后一个root肯定为空，不走这里
  // 第二次执行这个函数：lastScheduledRoot是root
  if (lastScheduledRoot !== null) {
    var previousScheduledRoot = lastScheduledRoot;
    var root = firstScheduledRoot;
    while (root !== null) {
      var remainingExpirationTime = root.expirationTime;
      if (remainingExpirationTime === NoWork) {
        // 此时的root的eT为0
        // 构建链条
        if (root === root.nextScheduledRoot) {
          // 只有一个root的时候，就走下面
          root.nextScheduledRoot = null;
          firstScheduledRoot = lastScheduledRoot = null;
          break;
        } else if (root === firstScheduledRoot) {
          // 当前是第一个root
          var next = root.nextScheduledRoot;
          firstScheduledRoot = next;
          lastScheduledRoot.nextScheduledRoot = next;
          root.nextScheduledRoot = null;
        } else if (root === lastScheduledRoot) {
          // 当前是最后一个root
          lastScheduledRoot = previousScheduledRoot;
          lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
          root.nextScheduledRoot = null;
          break;
        } else {
          previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
          root.nextScheduledRoot = null;
        }
        // 连接root
        root = previousScheduledRoot.nextScheduledRoot;

      } else {

        // 此时的root的eT不为0
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
  // 每次找优先级最高的root都会：把下一个刷新的根节点和优先级初始化定义一下，优先级为xxx，root为xxx
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
    // 非并发模式
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

  // 这里在设置上下文，初始化
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
    update.callback = callback;
  }

  // 处理一下passive副作用
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
  // 表示有一个被动副作用的回调已被调度。
  if (passiveEffectCallbackHandle !== null) {
    // 取消这个已调度的被动副作用
    cancelPassiveEffects(passiveEffectCallbackHandle);
  }

  // 当前有一个被动副作用回调需要执行。
  if (passiveEffectCallback !== null) {
    // 必须通过调用已调度的回调来执行副作用
    // 实际执行被动副作用的步骤
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

  // 1. 首先先攀岩到根root上面，无论目前身处哪个fiber，这个root是root对象，而非原生的stateNode
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


  // 2. 记录一下最高和最低的优先级，并改一下root的相关属性，目的是？？？？？
  markPendingPriorityLevel(root, expirationTime);

  // 3. 开始请求渲染
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
  // 保证root对象的didError是false
  // 这个函数在render完之后的commit过程中也会执行，因此为了重新恢复中断的渲染过程，需要把这个错误的属性改为false
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
  // 总而言之，过期时间的优先级由大到小排序是这样：
  // 早suspended > 早pending > 新pinged > 新suspended
  // （当前处理的）         （下一个要处理的）
  // 头一个是当前处理的的逻辑，后面三个都是下一个要处理的任务的逻辑
  var earliestSuspendedTime = root.earliestSuspendedTime;
  var latestSuspendedTime = root.latestSuspendedTime;
  var earliestPendingTime = root.earliestPendingTime;
  var latestPingedTime = root.latestPingedTime;

  // 1. 改变nextExpirationTimeToWorkOn
  // 如果优先级最大（最早）待处理任务的时间不是0（也就是还比较重要），
  // 让下一个亟需操作的过期时间为【最早待处理任务】，即最早（优先级最大）的那个，不然就是【最新的被激活的任务】
  // 首次渲染阶段，earliestPendingTime等于expirationTime
  var nextExpirationTimeToWorkOn = earliestPendingTime !== NoWork ? earliestPendingTime : latestPingedTime;

  // 如果下一个亟需操作的过期时间为0，优先级最低（说明可能不是很重要或者说明这个值是默认值或被恢复为默认值），
  // 并且 当期的fiber的过期时间的优先级最低 或者 比最新的挂起任务（这个的优先级是最低）的过期时间要大，
  // 即优先级比最低的还要低
  if (
    nextExpirationTimeToWorkOn === NoWork &&
    (completedExpirationTime === NoWork || latestSuspendedTime < completedExpirationTime)
  ) {
    // 最新的最迟的【挂起任务】优先级的要成为下一个亟需操作的工作单元，
    // 优先级最低的暂停工作是下一个最有可能提交的工作。让我们再次开始渲染它，这样如果它超时，就可以提交了。
    nextExpirationTimeToWorkOn = latestSuspendedTime;
  }

  // 2. 改变expirationTime
  // 然后让下一个亟需操作的工作单元的过期时间等于现在这个当前的expirationTime
  var expirationTime = nextExpirationTimeToWorkOn;

  // 如果当前的root的过期时间比最早的已经挂起的还要小，即优先级很大
  if (expirationTime !== NoWork && earliestSuspendedTime > expirationTime) {
    // 让优先级最大的，也就是最早触发的但是已经挂起的交互，覆盖掉expirationTime
    // 成为当前的需要处理的任务
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
    // 首次渲染阶段且第一次执行，minExpirationTime是sync，且nextFlushedExpirationTime是root自己的过期时间，也就是sync，两者相等
    // performWorkOnRoot的最后一个参数是false，表明是非批量更新

    // 从后面的提交阶段的函数进入到这里，nextFlushedRoot为0
    while (
      nextFlushedRoot !== null &&
      nextFlushedExpirationTime !== NoWork &&
      minExpirationTime <= nextFlushedExpirationTime
    ) {
      // 开始perform函数了，正式进入render阶段！！！！
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false);

      // 整个渲染结束之后，找到最高优先级的root节点，
      // 这个时候宏任务（有effect的那个调度函数）还没执行
      findHighestPriorityRoot();
    }
  }

  // 如果是批量更新，记录一下callback的信息
  if (isYieldy) {
    callbackExpirationTime = NoWork;
    callbackID = null;
  }

  // 首次渲染阶段
  // 第一次执行这个函数时，nextFlushedExpirationTime被赋值了，是优先级最高的time
  // 第二次执行这个函数时，nextFlushedExpirationTime为0
  if (nextFlushedExpirationTime !== NoWork) {
    scheduleCallbackWithExpirationTime(
      nextFlushedRoot,
      nextFlushedExpirationTime
    );
  }

  // performWorkOnRoot执行完了，开始清理战场
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

      // 这个timeoutHandle属性用来记录发生错误时的属性
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

      // 进入提交阶段
      completeRoot(root, _finishedWork, expirationTime);

    } else {

      root.finishedWork = null;

      // 这个timeoutHandle属性用来记录发生错误时的属性
      var _timeoutHandle = root.timeoutHandle;
      if (_timeoutHandle !== noTimeout) {
        root.timeoutHandle = noTimeout;
        cancelTimeout(_timeoutHandle);
      }

      // 1. 进入render阶段
      renderRoot(root, isYieldy);

      // 2. 进入提交阶段
      _finishedWork = root.finishedWork;
      if (_finishedWork !== null) {
        if (!shouldYieldToRenderer()) {
          // 看还剩时间不？？
          completeRoot(root, _finishedWork, expirationTime);
        } else {
          // 不剩的话保存一下finishedWork（root的WIP），别清空
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

  // 1. 定义一些初始变量
  // 开始render阶段，isWorking指示的仅仅是render阶段
  isWorking = true;

  // 首次渲染阶段这里是null，有点像是临时替换ContextOnlyDispatcher给当前的RCD
  var previousDispatcher = ReactCurrentDispatcher.current;
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;

  // 拿到nextExpirationTimeToWorkOn的属性作为当前的过期时间，这个属性记录着当前最新的最迟的也就是最小优先级的更新
  // 首次渲染阶段，这个等同于root的原本的expirationTime
  var expirationTime = root.nextExpirationTimeToWorkOn;


  // 2. 创建或更新WIP
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


    // 3. 记录interactions，用来干嘛？？
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


  // 4. 记录时间
  // 更新一下当前的fiber和提交次数的全局变量
  startWorkLoopTimer(nextUnitOfWork);


  // 5. 开始正式进入循环
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



  // 6. 渲染完毕，相关标志变量更新一下
  // 在首次渲染阶段，走到这里，说明整个树已经被构建完，包括原生DOM树，以及副作用链
  // 能够走到下面，说明回到了root节点

  if (enableSchedulerTracing) {
    // Traced work is done for now; restore the previous interactions.
    tracing.__interactionsRef.current = prevInteractions;
  }

  // isWorking的标志，hook工具箱，上下文，钩子
  isWorking = false;
  ReactCurrentDispatcher.current = previousDispatcher;
  resetContextDependences();
  resetHooks();


  // 7. 处理异常的结果（需要直接停止的）
  // 7.1 在失败的时候，退回主线程
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

    // 把root.finishedWork改为null
    onFatal(root);
    return;
  }


  // 7.2 在下一个fiber还存在的时候，更新一下标志，停止记录时间，
  if (nextUnitOfWork !== null) {
    // 此树中仍有剩余的异步工作，但我们在当前帧中已用完时间。
    // 退回渲染器。
    // 除非我们被更高优先级的更新打断，否则我们稍后将从中断的地方继续。
    var _didCompleteRoot2 = false;
    stopWorkLoopTimer(interruptedBy, _didCompleteRoot2);
    interruptedBy = null;

    // 把root.finishedWork改为null
    onYield(root);
    return;
  }


  // 6. 渲染完毕，相关标志变量继续更新一下
  var didCompleteRoot = true;
  stopWorkLoopTimer(interruptedBy, didCompleteRoot);
  var rootWorkInProgress = root.current.alternate;
  !(rootWorkInProgress !== null)
    ? invariant(
        false,
        "Finished root should have a work-in-progress. This error is likely caused by a bug in React. Please file an issue."
      )
    : void 0;

  // `nextRoot`指向正在进行的根。非空值表示我们正处于异步渲染中。
  // 将其设置为null表示当前批次中没有更多工作要做。
  nextRoot = null;
  interruptedBy = null;


  // 8. 处理异常的结果（需要挂起的）

  // 8.1 （下一次任务）在下一次render存在错误的时候，
  // 有高优先级工作，优先执行，挂起当前任务（root为整个树的代表）
  // 没有高优先级工作，尝试重新执行当前任务
  if (nextRenderDidError) {
    // hasLowerPriorityWork(root, expirationTime) 判断当前expirationTime是否存在高优先级的工作。
    if (hasLowerPriorityWork(root, expirationTime)) {
      // 如果存在高优先级的工作，React 会选择跳过当前的渲染任务，执行这个高优先级任务
      // 标记当前的渲染任务为挂起，表明它的优先级被降低，React 会在下次渲染时恢复该任务。
      markSuspendedPriorityLevel(root, expirationTime);

      var suspendedExpirationTime = expirationTime;
      var rootExpirationTime = root.expirationTime;

      // onSuspend 会被调用，表示当前渲染已经挂起（没有提交）
      onSuspend(
        root,
        rootWorkInProgress,
        suspendedExpirationTime,
        rootExpirationTime,
        -1 // Indicates no timeout
      );
      return;
    } else if (
      // 没有低优先级的工作，但是正在进行异步渲染 (isYieldy 表示渲染过程是可以被暂停的)
      !root.didError &&
      isYieldy
    ) {
      // React 会尝试同步渲染相同的级别，进行一次重试。
      root.didError = true;

      // 将 root.nextExpirationTimeToWorkOn 设置为当前的 expirationTime，
      // 并将 root.expirationTime 设置为 Sync（同步渲染）。
      // 这意味着 React 将立即尝试同步渲染。
      var _suspendedExpirationTime = (root.nextExpirationTimeToWorkOn =
        expirationTime);
      var _rootExpirationTime = (root.expirationTime = Sync);

      // 再次调用 onSuspend，通知渲染挂起，表示 React 会稍后再次尝试渲染
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


  // 8.2 （当前任务）当处于时间切片的状态下，挂起当前任务（root为整个树的代表）
  // isYieldy：这是一个布尔值，表示渲染是否可以被暂停（即是否为异步渲染）。
  // nextLatestAbsoluteTimeoutMs !== -1：这个条件表示是否有设定的绝对超时值。如果超时值不为 -1，表示渲染有时间限制。
  // 首次渲染不走下面，因为nextLatestAbsoluteTimeoutMs的初始值是-1;
  if (isYieldy && nextLatestAbsoluteTimeoutMs !== -1) {
    // 标记挂起的任务
    var _suspendedExpirationTime2 = expirationTime;
    markSuspendedPriorityLevel(root, _suspendedExpirationTime2);

    // 寻找优先级最小的时间，为什么？？？？
    var earliestExpirationTime = findEarliestOutstandingPriorityLevel(
      root,
      expirationTime
    );

    // 转换为毫秒数
    var earliestExpirationTimeMs = expirationTimeToMs(earliestExpirationTime);

    // 如果找到的最早任务的过期时间比当前设置的绝对超时 (nextLatestAbsoluteTimeoutMs) 还要小，优先级要大
    // 那么就更新这个超时值。
    if (earliestExpirationTimeMs < nextLatestAbsoluteTimeoutMs) {
      nextLatestAbsoluteTimeoutMs = earliestExpirationTimeMs;
    }

    // 计算距离超时的剩余时间
    // 计算从当前时间到下一个超时的剩余时间。如果剩余时间小于零，设置为零。
    var currentTimeMs = expirationTimeToMs(requestCurrentTime());
    var msUntilTimeout = nextLatestAbsoluteTimeoutMs - currentTimeMs;
    msUntilTimeout = msUntilTimeout < 0 ? 0 : msUntilTimeout;

    var _rootExpirationTime2 = root.expirationTime;

    // 通知外部 React 渲染已挂起。它传递了当前的渲染状态，包括：
    // root：当前渲染树的根。
    // rootWorkInProgress：当前正在进行的工作。
    // _suspendedExpirationTime2：挂起的任务的过期时间。
    // _rootExpirationTime2：根节点的过期时间。
    // msUntilTimeout：距离超时的剩余时间。
    onSuspend(
      root,
      rootWorkInProgress,
      _suspendedExpirationTime2,
      _rootExpirationTime2,
      msUntilTimeout
    );
    // 结束当前渲染过程，表明当前渲染被挂起，React 会在稍后继续处理。
    return;
  }


  // 9. 准备开始进入commit阶段了
  // 把root的pendingCommitExpirationTime改为expirationTime
  // 把root的finishedWork改为finishedWork，即当前的root的fiber
  // 接着回到performWorkOnRoot
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
// !是对每一个节点的【类型】的分发，（此时位于工作间内部，有点像机场里面门口内的安检程序，需要派发到不同的地方）
// 分发出去的函数，每个经过了reconcilChildren之后，最终返回的是大儿子

function beginWork(current$$1, workInProgress, renderExpirationTime) {
  // 入参：current$$1是workInProgress的替身fiber
  // renderExpirationTime

  // 在首次渲染阶段（首次进入这个函数），updateExpirationTime也就是fiber本身的expirationTime，和入参的renderExpirationTime是一样的
  var updateExpirationTime = workInProgress.expirationTime;

  // 1. 查看新旧props是否一样，标记是否需要update
  // current$$1是workInProgress的替身，首渲染只有root有替身
  if (current$$1 !== null) {
    // 在首次渲染阶段（首次进入这个函数），props没有值
    // memo是被存起来的上一次的props，pending是新的
    var oldProps = current$$1.memoizedProps;
    var newProps = workInProgress.pendingProps;

    if (oldProps !== newProps || hasContextChanged()) {
      // 新旧的props不一样，需要更新
      didReceiveUpdate = true;
    } else if (updateExpirationTime < renderExpirationTime) {
      // 新旧的props一样，但是fiber本身的优先级，小于链表里面的亟需更新的优先级，不用更新

      // 首次渲染时，fiber的eT和入参的eT对比，是一样的，不进入这里
      // 二更且WIP为root时，根节点的workInProgress.expirationTime被恢复为0，
      // renderExpirationTime是nextRenderExpirationTime，为Sync的值

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


      // 注意！！！看这里，二更时，执行这个函数就好了，就直接return了，不走下面的分发
      return bailoutOnAlreadyFinishedWork(
        current$$1,
        workInProgress,
        renderExpirationTime
      );

    }
  } else {
    // 【首次渲染且非根节点】，新旧props都是null，且fiber本身的和亟需更新的优先级的时间一样
    didReceiveUpdate = false;
  }

  // 因为当前的fiber正在处理中
  // 把fiber本身的优先级改回为NoWork，最低的
  workInProgress.expirationTime = NoWork;

  // 2. 开始分发，哪种类型去哪里
  // 首次渲染是hostRoot类型，去updateHostRoot
  switch (workInProgress.tag) {
    // 函数组件【首渲染】走这里
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
    // 【二更】时的函数组件走这里：
    // mountIndeterminateComponent函数里面改了WIP的tag是函数组件还是类组件
    case FunctionComponent: {
      var _Component = workInProgress.type;
      var unresolvedProps = workInProgress.pendingProps;
      var resolvedProps = workInProgress.elementType === _Component ? unresolvedProps : resolveDefaultProps(_Component, unresolvedProps);
      // renderExpirationTime是nextRenderExpirationTime，为Sync的值
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

  // 先把栈中的值预先存在valueCursor.current中
  cursor.current = valueStack[index];

  // 然后再清空栈这个位置的值
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
  // ?!后面再次进入一个update对象的循环，为什么？
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
    // 下面的函数也就是ChildReconciler(false);也就是reconcileChildFibers
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

    // 1. 用来处理这种情况 <>{[...]}</> 和 <>...</>
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


    // 2. 开始分发
    // 2.1如果newChild是只有一个，且是一个对象或者一个数组的形式（数组不在这里面，去到下面的逻辑）
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

    // 一般来说，一个大的父节点下面肯定有很多个子节点，因此newChild就是一个数组的形式
    // 这里面涉及到diff的算法
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
        // 举例：【上下文】type是一个这样的对象
        // context.Provider = {
        //   $$typeof: REACT_PROVIDER_TYPE,
        //   _context: context
        // };
        // case 的前两个都是，一个提供者一个消费者
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

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, expirationTime) {
    // 这里源码说有双端优化的更好的算法！！
    // 针对某一层进行处理！！！

    // 入参：
    // currentFirstChild是替身WIP的大儿子
    // newChildren是数组形式的虚拟DOM

    {
      // 如果类型是REACT_PORTAL_TYPE，需要检查key是否重复，是否是字符串类型
      var knownKeys = null;
      for (var i = 0; i < newChildren.length; i++) {
        var child = newChildren[i];
        knownKeys = warnOnInvalidKey(child, knownKeys);
      }
    }


    // 定义一些本函数使用的变量
    var resultingFirstChild = null;
    var previousNewFiber = null;

    var oldFiber = currentFirstChild;
    var lastPlacedIndex = 0;
    var newIdx = 0;
    var nextOldFiber = null;


    // 1. 下面是更新时的逻辑
    // 经过首次渲染，lastPlacedIndex为0
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {

      if (oldFiber.index > newIdx) {
        // 遍历第一遍为0
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      
      var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);
      if (newFiber === null) {
        // This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }
        break;
      }

      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }

      // diff算法，看谁需要移动，谁需要插入，注意：这里面没有处理删除逻辑
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }


    if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }


    // 2. 首次渲染走下面
    if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
      // since the rest will all be insertions.
      for (; newIdx < newChildren.length; newIdx++) {

        // 2.1 首先新建孩子fiber，每个孩子都新建一个fiber。
        // 由此可见当遍历到一个节点的时候，他的所有孩子节点都会相应地建立起fiber
        // 往右探索的时候，这个fiber已经存在了
        var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);
        if (!_newFiber) {
          continue;
        }

        // 2.2 然后移动孩子的顺序，都是新增的节点，最后lastPlacedIndex不变，还是为0
        // 这里给fiber加上index的属性，记录位置
        lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);

        // 2.3 赋予sibling的属性
        // 首次渲染且遍历第一遍这个为null
        if (previousNewFiber === null) {
          // 让大儿子变量为_newFiber
          resultingFirstChild = _newFiber;
        } else {
          // 遍历第二遍往后
          // 在这里赋予sibling的属性
          previousNewFiber.sibling = _newFiber;
        }
        // 让当前的fiber进入一个中间变量（等待空间）等待下一次给他赋予sibling的属性，以便连接兄弟
        previousNewFiber = _newFiber;
      }
      return resultingFirstChild;
    }

    // Add all children to a key map for quick lookups.
    var existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
      var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], expirationTime);
      if (_newFiber2) {
        if (shouldTrackSideEffects) {
          if (_newFiber2.alternate !== null) {
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren.delete(_newFiber2.key === null ? newIdx : _newFiber2.key);
          }
        }
        lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber2;
        } else {
          previousNewFiber.sibling = _newFiber2;
        }
        previousNewFiber = _newFiber2;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(function (child) {
        return deleteChild(returnFiber, child);
      });
    }

    return resultingFirstChild;
  }





  function createChild(returnFiber, newChild, expirationTime) {
    // newChildren是单个虚拟DOM

    // 分发：
    // 文本节点
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var created = createFiberFromText('' + newChild, returnFiber.mode, expirationTime);
      created.return = returnFiber;
      return created;
    }


    // 正常的节点
    // 建立fiber，注意这里没有进行sibling的相连接，
    // sibling的连接放在了reconcileChildrenArray，在执行完当前函数之后，在for循环中
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            var _created = createFiberFromElement(newChild, returnFiber.mode, expirationTime);
            _created.ref = coerceRef(returnFiber, null, newChild);
            _created.return = returnFiber;
            return _created;
          }
        case REACT_PORTAL_TYPE:
          {
            var _created2 = createFiberFromPortal(newChild, returnFiber.mode, expirationTime);
            _created2.return = returnFiber;
            return _created2;
          }
      }

      // 如果这个也是个数组，当作被<></>包围了，直接用createFiberFromFragment
      if (isArray(newChild) || getIteratorFn(newChild)) {
        var _created3 = createFiberFromFragment(newChild, returnFiber.mode, expirationTime, null);
        _created3.return = returnFiber;
        return _created3;
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    return null;
  }



  // 类似于V15的diff算法！！！
  // 跟fiber在数组中的位置是相关的，这里没有处理删除！！
  function placeChild(newFiber, lastPlacedIndex, newIndex) {

    // 给这个fiber加上一个index的属性，保存自己在父亲的孩子数组中的位置
    newFiber.index = newIndex;

    // shouldTrackSideEffects是true
    if (!shouldTrackSideEffects) {
      // Noop.
      return lastPlacedIndex;
    }

    // 如果有替身存在
    var current$$1 = newFiber.alternate;
    if (current$$1 !== null) {
      var oldIndex = current$$1.index;
      if (oldIndex < lastPlacedIndex) {
        // 这是移动的情况 
        // 如果本fiber【老的index】比【最后一个需要移动的节点】还要小
        // 说明这个fiber在之前是位于左的，需要向右边移动（事先定义好只能向右边移动）
        // 标记为移动，返回当前的lastPlacedIndex
        newFiber.effectTag = Placement;
        return lastPlacedIndex;
      } else {
        // oldIndex >= lastPlacedIndex的情况：
        // 更新首个孩子时，由于lastPlacedIndex为0，所以肯定会走到这里，也就是此时的lastPlacedIndex被更新为这个fiber过去所在的位置
        // 如果发现这个孩子的老位置比过去位于最右边的节点的位置还要大，
        // 那就说明左边有东西要向右移动到这里，这个节点本身自己则不需要处理，同时更新一下最大的lastPlacedIndex
        return oldIndex;
      }
    } else {
      // 首次渲染走这里
      // 这是插入的情况，都是新增，lastIndex不变，为0
      newFiber.effectTag = Placement;
      return lastPlacedIndex;
    }



    // 在v15里面，代码长这样
    // if (oldChildElement === newChildElement) {
    //   这个时候说明是复用的老节点，接下来要看是否需要移动
    //   if (oldChildElement._mountIndex < lastIndex) {
    //     diffQueue.push({
    //       parentNode,
    //       type: MOVE,
    //       fromIndex: oldChildElement._mountIndex,
    //       toIndex: i,
    //     });
    //   }
    //   lastIndex = Math.max(oldChildElement._mountIndex, lastIndex);
    // } else {
    //   diffQueue.push({
    //     parentNode,
    //     type: INSERT,
    //     toIndex: i,
    //     dom: createDOM(newChildElement),
    //   });
    // }


  }




  function deleteRemainingChildren(returnFiber, currentFirstChild) {

    // 从reconcileChildFibers过来的
    // returnFiber是父亲fiber
    // currentFirstChild是父亲fiber的替身的大儿子（应该也是一个fiber），也就是当前页面显示的对应的节点

    // shouldTrackSideEffects为true的话，就不用删掉，因为只是标记
    // 而这个函数的逻辑是要删掉
    if (!shouldTrackSideEffects) {
      // Noop.
      return null;
    }

    // 把这个fiber删掉，因为newChild(新的虚拟DOM)为null，才来到这里
    var childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  }


  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      // Noop.
      return;
    }
    // Deletions are added in reversed order so we add it to the front.
    // At this point, the return fiber's effect list is empty except for
    // deletions, so we can just append the deletion to the list. The remaining
    // effects aren't added until the complete phase. Once we implement
    // resuming, this may not be true.

    // 放到父亲的副作用链上面
    var last = returnFiber.lastEffect;
    if (last !== null) {
      last.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }

    // 标记删除！！
    childToDelete.nextEffect = null;
    childToDelete.effectTag = Deletion;

  }


  return reconcileChildFibers;
}


var reconcileChildFibers = ChildReconciler(true);
var mountChildFibers = ChildReconciler(false);


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
    // 拿到的是孩子树
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



  // 4. 开始分发（根据孩子树的类型）
  // 第一种情况是是一个类组件
  if (
    typeof value === "object" &&
    value !== null &&
    typeof value.render === "function" &&
    value.$$typeof === undefined
  ) {
    // 改的是父亲的WIP，为什么：
    // 因为孩子树如果是一个对象，且这个对象里面有render函数，说明这个“孩子树”是一个类实例，
    // 说明Component就是一个类组件，执行函数（初始化类）得到的是一个对象，而非函数
    workInProgress.tag = ClassComponent;

    // 重置一下全局变量，相当于任何组件（里面可能用了很多的hook），都用同一个内存的东西来作为全局变量
    // 任意地方使用
    resetHooks();


    // 4.1上下文设置：

    //尽早推送上下文提供程序，以防止上下文堆栈不匹配。
    //在挂载过程中，我们还不知道子上下文，因为实例不存在。
    //我们将在渲染后立即在finishClassComponent（）中使子上下文无效。
    var hasContext = false;
    if (isContextProvider(Component)) {
      hasContext = true;
      pushContextProvider(workInProgress);
    } else {
      hasContext = false;
    }

    // 4.2把state改变一下：
    workInProgress.memoizedState = value.state !== null && value.state !== undefined ? value.state : null;


    // 4.3 还没有执行类组件之前，执行getDerivedStateFromProps(nextProps, nextState)生命周期函数
    // 根据新的 props 来计算和更新组件的 state，在初次渲染和每次 props 或 state 变化时都会被调用。
    // 它返回一个对象（更新后的 state），或者返回 null（表示不需要更新 state）。
    // 也就是：用来在执行类组件的render函数之前，提前判断是否需要更新？？？
    // 例子：
    // static getDerivedStateFromProps(nextProps, nextState) {
    //   如果 props 发生变化，更新 state
    //   if (nextProps.initialCount !== nextState.count) {
    //     return {
    //       count: nextProps.initialCount
    //     };
    //   }
    //   如果没有变化，返回 null，表示不需要更新 state
    //   return null;
    // }
    var getDerivedStateFromProps = Component.getDerivedStateFromProps;
    if (typeof getDerivedStateFromProps === "function") {
      applyDerivedStateFromProps(
        workInProgress,
        Component,
        getDerivedStateFromProps,
        props
      );
    }

    // 4.4 更新类组件：
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

    // 第二种情况不是一个类组件，其他任何类型只要不是类组件都归类于FunctionComponent
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

    // 对孩子进行更新调和，结果会保存在WIP的child属性里面
    reconcileChildren(null, workInProgress, value, renderExpirationTime);

    // 结束之后做一个小小的验证
    {
      validateFunctionComponentInDev(workInProgress, Component);
    }
    // 返回大儿子，回到beginWork函数，继续往下探索
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
  // 使用此变量判断当前是处于渲染还是更新
  // 第一次执行本函数的时候，在执行完component之后，就把hook链条的第一个hook对象赋予给WIP的memoizedState
  // 因此这里是第一个hook
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
      // 更新阶段，使用update的工具包
      ReactCurrentDispatcher$1.current = HooksDispatcherOnUpdateInDEV;
    } else if (hookTypesDev !== null) {
      ReactCurrentDispatcher$1.current =
        HooksDispatcherOnMountWithHookTypesInDEV;
    } else {
      // 首次渲染阶段，使用mount的工具包
      ReactCurrentDispatcher$1.current = HooksDispatcherOnMountInDEV;
    }
  }


  // 3. 拿到之后执行函数组件，用上hooks工具箱
  // 这里非常之重要，这里在真正的执行这个函数组件！！！！
  // 拿到return的虚拟DOM，这个是一个虚拟DOM，而不是一个数组或者对象啥的
  // 这也是函数组件的返回值必须是一个标签包裹的所有标签的原因

  // 期间使用钩子！！！，这里假设使用了reducer和state的钩子
  var children = Component(props, refOrContext);



  // 是否在当前执行的渲染过程中安排了更新，首次渲染的时候这个变量为false，不走这里
  // 更新阶段应该会走这里，这里是在找到hook的链条，然后从头开始计数，同时执行函数，得到最后被覆盖的最新的子树
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


  // 4. 函数组件执行完之后，对一些全局变量进行覆盖更新


  // We can assume the previous dispatcher is always this one, since we set it
  // at the beginning of the render phase and there's no re-entrancy.
  ReactCurrentDispatcher$1.current = ContextOnlyDispatcher;


  // 拿到已经执行过函数的WIP
  var renderedWork = currentlyRenderingFiber$1;

  // （1）WIP的state保存一下hook链条的第一个hook对象
  // 也就是说，凡是函数组件，他的state就是hook链条的第一个
  renderedWork.memoizedState = firstWorkInProgressHook;

  // （2）首次渲染的时候，WIP的eT改为了NoWork
  // !在这里把eT改为0，说明已经执行过了
  renderedWork.expirationTime = remainingExpirationTime;


  // （3）WIP的更新队列变成了effect的链表

  // 注意：函数类型的fiber的updateQueue不是update对象的链表，
  // 而是effect对象的链表componentUpdateQueue（准确来说是effect对象的环形链表的一个口子）

  // 这个时候已经在useEffect那里保存好了，然后接下来会在提交阶段的commitPassive那边用到
  renderedWork.updateQueue = componentUpdateQueue;

  // （4）变成有副作用的effectTag，后续会在提交阶段执行副作用并调度
  renderedWork.effectTag |= sideEffectTag;

  {
    renderedWork._debugHookTypes = hookTypesDev;
  }

  // This check uses currentHook so that it works the same in DEV and prod bundles.
  // hookTypesDev could catch more cases (e.g. context) but only in DEV bundles.
  var didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;


  // 5. 重置所有的hook相关的全局变量
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

  // 6. 返回孩子树，函数组件的返回值
  return children;
}




// REVIEW - 下面是在执行函数组件过程中，进去执行的钩子函数，都是React对象里面的！！！！



function resolveDispatcher() {
  // 拿到hooks的工具箱，这个工具箱子在哪里被赋值？？
  // 在renderWithHooks里面，一旦工具箱子被赋值就立刻执行函数组件的函数
  var dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}



// 其他钩子在开始都有下面两个函数（useXXX和工具箱对应的方法），用来引入mountXXX()
// 这里只是展示了useReducer
function useReducer(reducer, initialArg, init) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}

// 工具箱子里面的钩子
// useReducer: function (reducer, initialArg, init) {
//   currentHookNameInDev = "useReducer";
//   mountHookTypesDev();
//   var prevDispatcher = ReactCurrentDispatcher$1.current;
//   ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;
//   try {
//     return mountReducer(reducer, initialArg, init);
//   } finally {
//     ReactCurrentDispatcher$1.current = prevDispatcher;
//   }
// },




// 1. useReducer钩子函数
function mountReducer(reducer, initialArg, init) {
  // 初始化WIPHook对象及链条
  // 一个钩子一个hook对象
  // 用来保存信息，包括state数据，reducer函数
  var hook = mountWorkInProgressHook();

  // 1. 处理state数据
  var initialState = void 0;

  // 第三个参数是一个return初始state对象的函数
  // 第二个参数是初始的state对象
  if (init !== undefined) {
    initialState = init(initialArg);
  } else {
    initialState = initialArg;
  }
  // 把初始的状态保存到hook对象里面
  hook.memoizedState = hook.baseState = initialState;

  // 2. 整合state数据和reducer函数的信息
  // 新建一个队列，保存最新的一个reducer函数和initState
  var queue = hook.queue = {
    last: null,
    dispatch: null,
    lastRenderedReducer: reducer,
    lastRenderedState: initialState
  };

  // 3. 返回一个dispatch函数，
  // 其中的currentlyRenderingFiber$1在执行函数组件之前已经被赋值了currentlyRenderingFiber$1 = workInProgress;
  // 这里为什么不是一个新的state作为第一个参数，setxxx不是都是以一个新的state对象为参数的吗？？？
  var dispatch = queue.dispatch = dispatchAction.bind(null,
  // Flow doesn't know this is non-null, but we do.
  currentlyRenderingFiber$1, queue);
  return [hook.memoizedState, dispatch];
}




// 2. useState钩子函数
function mountState(initialState) {
  // 一个钩子一个hook对象
  var hook = mountWorkInProgressHook();

  // 1. 处理state数据
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;

  // 2. 整合state数据和reducer函数的信息
  // 实际上，useState就是useReducer，他的reducer就是basicStateReducer
  var queue = hook.queue = {
    last: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };

  // 3. 返回一个dispatch函数，用于到时候改变state
  // 与reducer一模一样
  var dispatch = queue.dispatch = dispatchAction.bind(null,
  // Flow doesn't know this is non-null, but we do.
  currentlyRenderingFiber$1, queue);
  return [hook.memoizedState, dispatch];
}

function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action;
}




function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,

    baseState: null,
    queue: null,
    baseUpdate: null,

    next: null
  };

  // 把hook对象保存到全局的链条里面，注意是全局
  // 如果执行了多个函数组件，也一并放到这里面
  // 那到时候怎么取出来呢？？？用一个全局索引
  if (workInProgressHook === null) {
    // This is the first hook in the list
    firstWorkInProgressHook = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}





function dispatchAction(fiber, queue, action) {
  // 这个时候的fiber就是currentlyRenderingFiber$1，也就是挂上这个函数的时候（函数.bind）的时候的fiber，也就是当前的函数组件
  // 交互时触发这个函数，因为setXXX就是dispatchAction

  var alternate = fiber.alternate;
  if (fiber === currentlyRenderingFiber$1 || alternate !== null && alternate === currentlyRenderingFiber$1) {
    // 有替身！！
    // This is a render phase update. Stash it in a lazily-created map of
    // queue -> linked list of updates. After this render pass, we'll restart
    // and apply the stashed updates on top of the work-in-progress hook.
    didScheduleRenderPhaseUpdate = true;
    var update = {
      expirationTime: renderExpirationTime,
      action: action,
      eagerReducer: null,
      eagerState: null,
      next: null
    };
    if (renderPhaseUpdates === null) {
      renderPhaseUpdates = new Map();
    }
    var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
    if (firstRenderPhaseUpdate === undefined) {
      renderPhaseUpdates.set(queue, update);
    } else {
      // Append the update to the end of the list.
      var lastRenderPhaseUpdate = firstRenderPhaseUpdate;
      while (lastRenderPhaseUpdate.next !== null) {
        lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      }
      lastRenderPhaseUpdate.next = update;
    }
  } else {
    // 首次渲染，没有替身fiber

    // 1. 处理和执行 被动副作用（确保所有挂起的副作用都被执行）
    flushPassiveEffects();

    // 2. 计算当前时间，并通过当前时间计算过期时间
    var currentTime = requestCurrentTime();
    var _expirationTime = computeExpirationForFiber(currentTime, fiber);


    // 3. 新建一个更新对象
    // 里面的action就是setXXX传入的参数，因为之前已经传入了fiber和相应的queue对象
    // 如果是reducer的话就传入的是{type: 'add'}类似的东西
    var _update2 = {
      expirationTime: _expirationTime,
      action: action,
      eagerReducer: null,
      eagerState: null,
      next: null
    };


    // 4. 把这个新建的对象放到fiber的updateQueue链表里面
    var _last = queue.last;
    if (_last === null) {
      // 链表里面有无东西，创造环形链表
      _update2.next = _update2;
    } else {
      // 判断是否存在环形链表
      var first = _last.next;
      if (first !== null) {
        // Still circular.
        _update2.next = first;
      }
      _last.next = _update2;
    }
    queue.last = _update2;


    // 5. 处理无工作时的提前计算：
    if (fiber.expirationTime === NoWork && (alternate === null || alternate.expirationTime === NoWork)) {
      // 如果当前 fiber 没有工作，并且它的 alternate（替身）也没有工作，那么可以提前计算状态。
      // 通过执行 reducer，如果新的状态与当前状态相同，就可以直接跳过渲染，避免不必要的渲染。

      // _lastRenderedReducer要么是state的新数据，要么是reducer的函数本身
      var _lastRenderedReducer = queue.lastRenderedReducer;
      if (_lastRenderedReducer !== null) {
        var prevDispatcher = void 0;
        {
          prevDispatcher = ReactCurrentDispatcher$1.current;
          ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
        }
        try {
          // 拿到当前页面上显示的state
          var currentState = queue.lastRenderedState;
          // 用当前的state执行_lastRenderedReducer，拿到改变之后的state
          var _eagerState = _lastRenderedReducer(currentState, action);

          // 保存一下新数据
          _update2.eagerReducer = _lastRenderedReducer;
          _update2.eagerState = _eagerState;

          // 前后state一样，就不用调用reducer了
          if (is(_eagerState, currentState)) {
            // 跳过，直接return
            return;
          }
        } catch (error) {
          // Suppress the error. It will throw again in the render phase.
        } finally {
          // 把工具箱改回来
          {
            ReactCurrentDispatcher$1.current = prevDispatcher;
          }
        }
      }
    }
    {
      if (shouldWarnForUnbatchedSetState === true) {
        warnIfNotCurrentlyBatchingInDev(fiber);
      }
    }

    // 重新进入sheduleWork，在requestWork那里因为isBatchingUpdates为true而进不去performWork
    // if (isBatchingUpdates) {
    //   if (isUnbatchingUpdates) {
    //     nextFlushedRoot = root;
    //     nextFlushedExpirationTime = Sync;
    //     performWorkOnRoot(root, Sync, false);
    //   }
    //   return;
    // }
    scheduleWork(fiber, _expirationTime);
  }
}


function is(x, y) {
  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
  ;
}


// 3. useEffect钩子函数
function mountEffect(create, deps) {
  return mountEffectImpl(Update | Passive, UnmountPassive | MountPassive, create, deps);
}


function mountEffectImpl(fiberEffectTag, hookEffectTag, create, deps) {
  // 一个钩子一个hook对象
  var hook = mountWorkInProgressHook();

  // 如果没有输入deps参数的话就是一个null，而不是一个空数组！！
  var nextDeps = deps === undefined ? null : deps;

  // 在这里把effectTag变为了passive，
  // 后面在commit阶段，需要判断这颗树是不是有副作用（后面有两个逻辑）
  sideEffectTag |= fiberEffectTag;

  // 在这个hook的state里面存的是effect对象，
  // !什么时候触发这个create函数呢？？？？
  // 在commit那边，提交完之后，执行passive副作用那里执行
  hook.memoizedState = pushEffect(hookEffectTag, create, undefined, nextDeps);
}


function pushEffect(tag, create, destroy, deps) {
  // 使用一个effect对象保存信息，包括函数，以及依赖项，以及摧毁的函数
  var effect = {
    tag: tag,
    create: create,
    destroy: destroy,
    deps: deps,
    // Circular
    next: null
  };

  // 创造一个环形链表，componentUpdateQueue保存的是这个链表的最后一位
  // 函数组件的effect专用的保存过去变化的数据的链表
  // 保存在全局componentUpdateQueue
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    var _lastEffect = componentUpdateQueue.lastEffect;
    if (_lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      var firstEffect = _lastEffect.next;
      _lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}


function createFunctionComponentUpdateQueue() {
  return {
    lastEffect: null
  };
}



// 4. useMemo钩子函数
function mountMemo(nextCreate, deps) {
  // 一个钩子一个hook对象
  var hook = mountWorkInProgressHook();

  var nextDeps = deps === undefined ? null : deps;
  var nextValue = nextCreate();

  // memo的第一个参数是一个函数，return值是新的一个变量
  // 这里存的是memo的下一个value，以及依赖项本身
  hook.memoizedState = [nextValue, nextDeps];

  // 返回这个变量
  return nextValue;
}




// 5. useCallback钩子函数
function mountCallback(callback, deps) {
  // 一个钩子一个hook对象
  var hook = mountWorkInProgressHook();

  var nextDeps = deps === undefined ? null : deps;
  hook.memoizedState = [callback, nextDeps];

  // 相当于只是进来存了一下这个callback，然后又原封不动的返回去了
  // 返回的是第一个函数参数本身的函数
  // 在这里面不用执行进入的第一个函数，而是等到依赖项发生变化的时候才执行
  return callback;
}





// 6. useRef钩子函数
function mountRef(initialValue) {
  var hook = mountWorkInProgressHook();

  // 把变量存到一个对象的current里面！！
  var ref = { current: initialValue };

  // Object.seal
  // 禁止新增属性：不能再向对象中添加新的属性。
  // 禁止删除属性：不能删除对象中已有的属性。
  // 现有属性仍然可修改：可以修改对象中已经存在的属性的值（如果这些属性是可写的）。
  {
    Object.seal(ref);
  }

  // 这里存起来的是ref对象
  hook.memoizedState = ref;
  return ref;
}






// REVIEW - 【上下文】下面是上下文相关的方法
// !包括初始化上下文对象，provider的组件更新，useContext钩子函数



// 建立一个全局的上下文对象（存储数据的仓库）
// !实际上这个方法在React.render函数执行之前执行
function createContext(defaultValue, calculateChangedBits) {
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null;
  } else {
    {
      !(calculateChangedBits === null || typeof calculateChangedBits === 'function') ? warningWithoutStack$1(false, 'createContext: Expected the optional second argument to be a ' + 'function. Instead received: %s', calculateChangedBits) : void 0;
    }
  }

  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,

    // 保存全局的数据！
    // 作为支持多个并发渲染器的解决方法，我们将一些渲染器归类为主要渲染器，而另一些则归类为次要渲染器。
    // 我们最多只期望有两个并发渲染器：React Native（主要）和Fabric（次要）；React DOM（主要）和React ART（次要）。
    // 辅助渲染器将其上下文值存储在单独的字段中。
    _currentValue: defaultValue,
    _currentValue2: defaultValue,

    // 用于跟踪此上下文当前在单个渲染器中支持多少个并发渲染器。例如并行服务器渲染。
    _threadCount: 0,
    
    // 提供者与消费者的存储地方
    Provider: null,
    Consumer: null
  };

  // context的Provider保存了context对象的信息
  // 这个provider在外部的写法是<MyContext.Provider>，等于React.createElement(MyContext.Provider)
  // 因此这个虚拟DOM的type就是这么一个对象
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context
  };

  var hasWarnedAboutUsingNestedContextConsumers = false;
  var hasWarnedAboutUsingConsumerProvider = false;

  {

    // context的Consumer保存了context对象的信息
    var Consumer = {
      $$typeof: REACT_CONTEXT_TYPE,
      _context: context,
      _calculateChangedBits: context._calculateChangedBits
    };

    // 保存一些属性：
    Object.defineProperties(Consumer, {
      Provider: {
        get: function () {
          if (!hasWarnedAboutUsingConsumerProvider) {
            hasWarnedAboutUsingConsumerProvider = true;
            warning$1(false, 'Rendering <Context.Consumer.Provider> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Provider> instead?');
          }
          return context.Provider;
        },
        set: function (_Provider) {
          context.Provider = _Provider;
        }
      },
      _currentValue: {
        get: function () {
          return context._currentValue;
        },
        set: function (_currentValue) {
          context._currentValue = _currentValue;
        }
      },
      _currentValue2: {
        get: function () {
          return context._currentValue2;
        },
        set: function (_currentValue2) {
          context._currentValue2 = _currentValue2;
        }
      },
      _threadCount: {
        get: function () {
          return context._threadCount;
        },
        set: function (_threadCount) {
          context._threadCount = _threadCount;
        }
      },
      Consumer: {
        get: function () {
          if (!hasWarnedAboutUsingNestedContextConsumers) {
            hasWarnedAboutUsingNestedContextConsumers = true;
            warning$1(false, 'Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
          }
          return context.Consumer;
        }
      }
    });
    // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty
    context.Consumer = Consumer;
  }

  {
    context._currentRenderer = null;
    context._currentRenderer2 = null;
  }

  return context;
}




// 一个myConetxt.Provider组件，经过beginWork分发之后，来到这里
function updateContextProvider(current$$1, workInProgress, renderExpirationTime) {
  
  // 拿到初始化的上下文对象
  var providerType = workInProgress.type;
  var context = providerType._context;

  var newProps = workInProgress.pendingProps;
  var oldProps = workInProgress.memoizedProps;

  // 拿到这个fiber里面的value
  var newValue = newProps.value;


  // 什么时候会出现下面这种情况？？？？？？
  {
    var providerPropTypes = workInProgress.type.propTypes;

    if (providerPropTypes) {
      checkPropTypes(providerPropTypes, newProps, 'prop', 'Context.Provider', getCurrentFiberStackInDev);
    }
  }

  // 把Provider的value放到全局的context里面
  // 消费者从哪里拿到，在useContext钩子那边
  pushProvider(workInProgress, newValue);


  // 更新的时候，比较两个上下文是否发生了变化
  if (oldProps !== null) {
    var oldValue = oldProps.value;
    // 检查看上下文是哪里发生了变化
    var changedBits = calculateChangedBits(context, newValue, oldValue);

    // 如果没有发生变化
    if (changedBits === 0) {
      // 并且前后的孩子树都一样，那么这个fiber就不需要更新了
      if (oldProps.children === newProps.children && !hasContextChanged()) {
        // 早期退出的函数，告诉 React，当前的工作已经完成，可以跳过不必要的处理
        return bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);
      }
    } else {
      // 上下文已经变化，更新上下文
      propagateContextChange(workInProgress, context, changedBits, renderExpirationTime);
    }
  }

  var newChildren = newProps.children;
  // 然后开始调和孩子树
  reconcileChildren(current$$1, workInProgress, newChildren, renderExpirationTime);
  return workInProgress.child;
}




function pushProvider(providerFiber, nextValue) {
  // 拿到上下文对象
  var context = providerFiber.type._context;

  // 初始渲染走这里，
  if (isPrimaryRenderer) {
    // 把上下文里面的nextValue值保存在valueCursor的current属性里面
    push(valueCursor, context._currentValue, providerFiber);

    // 把provider的数据放到context._currentValue属性里面
    context._currentValue = nextValue;

    // 这个属性用来干嘛？？
    {
      !(context._currentRenderer === undefined || context._currentRenderer === null || context._currentRenderer === rendererSigil) ? warningWithoutStack$1(false, 'Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.') : void 0;
      context._currentRenderer = rendererSigil;
    }
  } else {

    // 非初始渲染走这里
    push(valueCursor, context._currentValue2, providerFiber);

    // 有两个保存的地方，两个并发渲染器
    context._currentValue2 = nextValue;
    {
      !(context._currentRenderer2 === undefined || context._currentRenderer2 === null || context._currentRenderer2 === rendererSigil) ? warningWithoutStack$1(false, 'Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.') : void 0;
      context._currentRenderer2 = rendererSigil;
    }
  }
}




// 下面是useContext钩子的函数

function useContext(Context, unstable_observedBits) {
  // 拿到hooks的工具箱
  var dispatcher = resolveDispatcher();
  {
    !(unstable_observedBits === undefined) ? warning$1(false, 'useContext() second argument is reserved for future ' + 'use in React. Passing it is not supported. ' + 'You passed: %s.%s', unstable_observedBits, typeof unstable_observedBits === 'number' && Array.isArray(arguments[2]) ? '\n\nDid you call array.map(useContext)? ' + 'Calling Hooks inside a loop is not supported. ' + 'Learn more at https://fb.me/rules-of-hooks' : '') : void 0;

    if (Context._context !== undefined) {
      var realContext = Context._context;
      // Don't deduplicate because this legitimately causes bugs
      // and nobody should be using this in existing code.
      if (realContext.Consumer === Context) {
        warning$1(false, 'Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be ' + 'removed in a future major release. Did you mean to call useContext(Context) instead?');
      } else if (realContext.Provider === Context) {
        warning$1(false, 'Calling useContext(Context.Provider) is not supported. ' + 'Did you mean to call useContext(Context) instead?');
      }
    }
  }

  // 拿到上下文对象
  return dispatcher.useContext(Context, unstable_observedBits);
}

// 接下来进入：
// useContext: function (context, observedBits) {
//   currentHookNameInDev = 'useContext';
//   mountHookTypesDev();
//   return readContext(context, observedBits);
// },




function readContext(context, observedBits) {
  {
    // This warning would fire if you read context inside a Hook like useMemo.
    // Unlike the class check below, it's not enforced in production for perf.
    !!isDisallowedContextReadInDEV ? warning$1(false, 'Context can only be read while React is rendering. ' + 'In classes, you can read it in the render method or getDerivedStateFromProps. ' + 'In function components, you can read it directly in the function body, but not ' + 'inside Hooks like useReducer() or useMemo().') : void 0;
  }

  // lastContextWithAllBitsObserved初始为null，在prepareToReadContext函数里面也将其变为null
  if (lastContextWithAllBitsObserved === context) {
    // Nothing to do. We already observe everything in this context.
  } else if (observedBits === false || observedBits === 0) {
    // Do not observe any updates.
  } else {

    // 这个变量用来干嘛？？？？
    var resolvedObservedBits = void 0; // Avoid deopting on observable arguments or heterogeneous types.
    if (typeof observedBits !== 'number' || observedBits === maxSigned31BitInt) {
      // Observe all updates.
      lastContextWithAllBitsObserved = context;
      resolvedObservedBits = maxSigned31BitInt;
    } else {
      resolvedObservedBits = observedBits;
    }

    // 把上下文对象封起来
    var contextItem = {
      context: context,
      observedBits: resolvedObservedBits,
      next: null
    };


    // 把受封的上下文对象保存在全局的一个链条里面
    if (lastContextDependency === null) {
      !(currentlyRenderingFiber !== null) ? invariant(false, 'Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().') : void 0;

      // 首次渲染进入
      // 保存到lastContextDependency
      lastContextDependency = contextItem;

      // 同时currentlyRenderingFiber也要保存
      currentlyRenderingFiber.contextDependencies = {
        first: contextItem,
        expirationTime: NoWork
      };
    } else {
      // Append a new context item.
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  }

  // 返回之前在provider里面push进去过的_currentValue，也就是provider的value的对象/或者其他任何自己定义的数据
  return isPrimaryRenderer ? context._currentValue : context._currentValue2;
}








// REVIEW - 下面是经过beginWork分发后来到原生的普通的DOM节点的更新函数


function updateHostComponent(current$$1, workInProgress, renderExpirationTime) {

  // 1.更新一下全局的上下文信息
  pushHostContext(workInProgress);

  // 首次渲染的时候，如果是ssr的情况，走下面
  if (current$$1 === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }

  var type = workInProgress.type;
  var nextProps = workInProgress.pendingProps;
  var prevProps = current$$1 !== null ? current$$1.memoizedProps : null;

  var nextChildren = nextProps.children;

  // 2.判断接下来的新的是不是一个文本节点，也就是children是一个字符串的形式
  var isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild) {
    // 如果是的话，就不要遍历孩子了，不需要针对文本节点新建一个fiber
    // 然后进入reconcileChildFibers的时候直接去到deleteRemainingChildren
    // ?!然后直接去到下一个节点（child或者sibling），为什么？？？
    // !相当于这个节点是最后一个节点了，直接返回
    nextChildren = null;

  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // 新的不是一个文本节点，而过去是一个文本节点，说明这个fiber是需要把内容替换掉的，记录到副作用里面
    workInProgress.effectTag |= ContentReset;
  }

  // 有ref的话，workInProgress.effectTag |= Ref
  markRef(current$$1, workInProgress);

  // 3. 是否需要将某个子树的渲染优先级降级，避免不必要的渲染
  // 确认这不是一个永久的、不能被暂停的任务 且 当前的工作是否处于并发模式 且 是否需要降低该组件（type）的渲染优先级
  if (renderExpirationTime !== Never && workInProgress.mode & ConcurrentMode && shouldDeprioritizeSubtree(type, nextProps)) {
    // 将 workInProgress 和它的子节点的过期时间设置为 Never，意味着这个节点及其子节点将不会再在当前的渲染周期内被渲染，直到下一个渲染周期
    // 设置 expirationTime 为 Never 表示这个 fiber 被“延迟”了
    workInProgress.expirationTime = workInProgress.childExpirationTime = Never;
    return null;
  }

  // 4. 进入孩子层级，如果是文本节点，传入的nextChildren是null
  reconcileChildren(current$$1, workInProgress, nextChildren, renderExpirationTime);
  return workInProgress.child;
}



function pushHostContext(fiber) {

  var rootInstance = requiredContext(rootInstanceStackCursor.current);
  // 拿到目前在栈中的指针对应的上下文对象
  var context = requiredContext(contextStackCursor$1.current);

  // 拿到最新的上下文，里面记录的是节点的type类型
  var nextContext = getChildHostContext(context, fiber.type, rootInstance);

  // 如果两个上下文是一个内存地址，直接退出，
  // 但是getChildHostContext返回了一个全新的上下文对象不是吗
  // 所以两者永远都是不可能相等的
  if (context === nextContext) {
    return;
  }

  // 如果这是一个新的上下文，把上下文和fiber同时保存一下
  push(contextFiberStackCursor, fiber, fiber);
  push(contextStackCursor$1, nextContext, fiber);
}


function requiredContext(c) {
  !(c !== NO_CONTEXT) ? invariant(false, 'Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.') : void 0;
  return c;
}


function getChildHostContext(parentHostContext, type, rootContainerInstance) {
  {
    var parentHostContextDev = parentHostContext;

    // 把最新的type融入到以前的上下文对象里面
    var _namespace = getChildNamespace(parentHostContextDev.namespace, type);
    var _ancestorInfo2 = updatedAncestorInfo(parentHostContextDev.ancestorInfo, type);
    
    // 返回更新过的上下文
    return { namespace: _namespace, ancestorInfo: _ancestorInfo2 };
  }
}

var updatedAncestorInfo = function () {};
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
  if (specialTags.indexOf(tag) !== -1 && tag !== 'address' && tag !== 'div' && tag !== 'p') {
    ancestorInfo.listItemTagAutoclosing = null;
    ancestorInfo.dlItemTagAutoclosing = null;
  }

  ancestorInfo.current = info;

  if (tag === 'form') {
    ancestorInfo.formTag = info;
  }
  if (tag === 'a') {
    ancestorInfo.aTagInScope = info;
  }
  if (tag === 'button') {
    ancestorInfo.buttonTagInScope = info;
  }
  if (tag === 'nobr') {
    ancestorInfo.nobrTagInScope = info;
  }
  if (tag === 'p') {
    ancestorInfo.pTagInButtonScope = info;
  }
  if (tag === 'li') {
    ancestorInfo.listItemTagAutoclosing = info;
  }
  if (tag === 'dd' || tag === 'dt') {
    ancestorInfo.dlItemTagAutoclosing = info;
  }

  return ancestorInfo;
};




function tryToClaimNextHydratableInstance(fiber) {
  if (!isHydrating) {
    return;
  }
  var nextInstance = nextHydratableInstance;
  if (!nextInstance) {
    // Nothing to hydrate. Make it an insertion.
    insertNonHydratedInstance(hydrationParentFiber, fiber);
    isHydrating = false;
    hydrationParentFiber = fiber;
    return;
  }
  var firstAttemptedInstance = nextInstance;
  if (!tryHydrate(fiber, nextInstance)) {
    // If we can't hydrate this instance let's try the next one.
    // We use this as a heuristic. It's based on intuition and not data so it
    // might be flawed or unnecessary.
    nextInstance = getNextHydratableSibling(firstAttemptedInstance);
    if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
      // Nothing to hydrate. Make it an insertion.
      insertNonHydratedInstance(hydrationParentFiber, fiber);
      isHydrating = false;
      hydrationParentFiber = fiber;
      return;
    }
    // We matched the next one, we'll now assume that the first one was
    // superfluous and we'll delete it. Since we can't eagerly delete it
    // we'll have to schedule a deletion. To do that, this node needs a dummy
    // fiber associated with it.
    deleteHydratableInstance(hydrationParentFiber, firstAttemptedInstance);
  }
  hydrationParentFiber = fiber;
  nextHydratableInstance = getFirstHydratableChild(nextInstance);
}



function shouldSetTextContent(type, props) {
  return type === 'textarea' || type === 'option' || type === 'noscript' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
}


function markRef(current$$1, workInProgress) {
  var ref = workInProgress.ref;
  if (current$$1 === null && ref !== null || current$$1 !== null && current$$1.ref !== ref) {
    // Schedule a Ref effect
    workInProgress.effectTag |= Ref;
  }
}



function shouldDeprioritizeSubtree(type, props) {
  return !!props.hidden;
}






// REVIEW - 下面是当WIP的大儿子为null的时候，开始向右遍历，进入completeUnitOfWork（从performUnitOfWork函数进来）
// 里面的结构有点像performUnitOfWork里面有beginWork，分发之后最终去到reconcileChildren
// 这里就是compeleteUnitOfWork里面有completeWork





function completeUnitOfWork(workInProgress) {
  // 试图complete当前的fiber，然后往右边走，不然就返回父亲
  while (true) {

    // 目前的flushed状态的fiber就是替身。
    // 理想情况下，任何东西都不应该依赖于此，但在这里依赖它意味着我们不需要在正在进行的工作上增加额外的字段。
    var current$$1 = workInProgress.alternate;

    // 把全局变量current改为当前的fiber
    {
      setCurrentFiber(workInProgress);
    }

    var returnFiber = workInProgress.return;
    var siblingFiber = workInProgress.sibling;

    // 第一种情况是： fiber 当前还没有完成渲染工作，并且没有标记为“没有副作用”
    // NoEffect表示没有副作用，Incomplete表示该fiber没有完成其渲染工作。
    // 检查workInProgress.effectTag是否包含 Incomplete 但不包含 NoEffect
    // 说明这个 fiber 当前还没有完成渲染工作，并且没有标记为“没有副作用”
    // 首次渲染的时候进入到这里面
    if ((workInProgress.effectTag & Incomplete) === NoEffect) {

      // 定义是否需要修复
      if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
        // Don't replay if it fails during completion phase.
        mayReplayFailedUnitOfWork = false;
      }

      nextUnitOfWork = workInProgress;

      // 1.1 在当前停下来的fiber处建立真实的DOM
      if (enableProfilerTimer) {
        // 时间暂停，表明从上往下遍历的阶段结束，开始向右向上遍历
        if (workInProgress.mode & ProfileMode) {
          startProfilerTimer(workInProgress);
        }
        // 进入到completeWork，新建DOM，并为DOM赋予props属性和填充children的内容
        // 最后肯定返回null
        nextUnitOfWork = completeWork(current$$1, workInProgress, nextRenderExpirationTime);
        
        if (workInProgress.mode & ProfileMode) {
          // Update render duration assuming we didn't error.
          stopProfilerTimerIfRunningAndRecordDelta(workInProgress, false);
        }
      } else {
        nextUnitOfWork = completeWork(current$$1, workInProgress, nextRenderExpirationTime);
      }


      if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
        // 因为已经走完了comleteWork，所以可以replay
        mayReplayFailedUnitOfWork = true;
      }

      // 1.2 停止计算时间，
      stopWorkTimer(workInProgress);

      // 1.3 更新WIP的孩子eT
      resetChildExpirationTime(workInProgress, nextRenderExpirationTime);


      {
        resetCurrentFiber();
      }

      // 这个情况貌似不会走，因为completeWork返回的都是null
      if (nextUnitOfWork !== null) {
        // Completing this fiber spawned new work. Work on that next.
        return nextUnitOfWork;
      }

      // 1.4 开始针对父亲fiber挂上effect的链条
      // 当前保证父亲节点存在且未完成
      if (returnFiber !== null && (returnFiber.effectTag & Incomplete) === NoEffect) {

        // 把副作用挂到fiber的effect链条上面

        // （一）先合并自己的孩子
        // 1. 父亲无fE，说明他也没有lE，从上往下连接fE！
        if (returnFiber.firstEffect === null) {
          returnFiber.firstEffect = workInProgress.firstEffect;
        }
        // 2. 孩子有lE，也肯定有fE
        if (workInProgress.lastEffect !== null) {
          // 父亲有lE，连接父亲的最后一个和子的第一个
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
          }
          // 父亲有无fE或lE都要连接lE
          // 连接父亲的最后一个为子的最后一个
          returnFiber.lastEffect = workInProgress.lastEffect;
        }

        // （二）然后合并自己
        var effectTag = workInProgress.effectTag;

        // 这里通过 effectTag > PerformedWork 来过滤掉 NoWork 和 PerformedWork 类型的副作用。
        // NoWork 代表没有工作需要做，PerformedWork 代表已经执行的工作，这两种副作用类型不需要加入副作用链表。
        // 环形链条保存的是WIp本身

        // 等到遍历到root的下一个fiber（或是函数组件或是类组件）
        // 这个fiber的workInProgress.effectTag就会大于1
        // 相当于要把副作用链挂到这个节点身上，也就是root的firstEffect和lastEffect皆指向workInProgress
        if (effectTag > PerformedWork) {
          // 1. 父亲有lE，也肯定有fE，连接孩子
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = workInProgress;
          } else {
            // 2. 父亲无fE，说明他也没有lE，从上往下连接fE！
            returnFiber.firstEffect = workInProgress;
          }
          // 不管怎么样都要连接lE
          returnFiber.lastEffect = workInProgress;
        }
      }


      if (true && ReactFiberInstrumentation_1.debugTool) {
        ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
      }


      // 1.5 开始向右遍历
      if (siblingFiber !== null) {
        return siblingFiber;
        // 没有兄弟姐妹就向上遍历
      } else if (returnFiber !== null) {
        // 回到父亲节点，然后继续执行completeUnitOfWork
        // （因为这个函数是一个while(true)的死循环函数）
        workInProgress = returnFiber;
        continue;
      } else {
        // We've reached the root.
        return null;
      }

    } else {

      // 什么时候会走下面？？？？
      if (enableProfilerTimer && workInProgress.mode & ProfileMode) {
        // Record the render duration for the fiber that errored.
        stopProfilerTimerIfRunningAndRecordDelta(workInProgress, false);

        // Include the time spent working on failed children before continuing.
        var actualDuration = workInProgress.actualDuration;
        var child = workInProgress.child;
        while (child !== null) {
          actualDuration += child.actualDuration;
          child = child.sibling;
        }
        workInProgress.actualDuration = actualDuration;
      }

      // This fiber did not complete because something threw. Pop values off
      // the stack without entering the complete phase. If this is a boundary,
      // capture values if possible.
      var next = unwindWork(workInProgress, nextRenderExpirationTime);
      // Because this fiber did not complete, don't reset its expiration time.
      if (workInProgress.effectTag & DidCapture) {
        // Restarting an error boundary
        stopFailedWorkTimer(workInProgress);
      } else {
        stopWorkTimer(workInProgress);
      }

      {
        resetCurrentFiber();
      }

      if (next !== null) {
        stopWorkTimer(workInProgress);
        if (true && ReactFiberInstrumentation_1.debugTool) {
          ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
        }

        // If completing this work spawned new work, do that next. We'll come
        // back here again.
        // Since we're restarting, remove anything that is not a host effect
        // from the effect tag.
        next.effectTag &= HostEffectMask;
        return next;
      }

      if (returnFiber !== null) {
        // Mark the parent fiber as incomplete and clear its effect list.
        returnFiber.firstEffect = returnFiber.lastEffect = null;
        returnFiber.effectTag |= Incomplete;
      }

      if (true && ReactFiberInstrumentation_1.debugTool) {
        ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
      }

      if (siblingFiber !== null) {
        // If there is more work to do in this returnFiber, do that next.
        return siblingFiber;
      } else if (returnFiber !== null) {
        // If there's no more work in this returnFiber. Complete the returnFiber.
        workInProgress = returnFiber;
        continue;
      } else {
        return null;
      }
    }
  }

}





function completeWork(current, workInProgress, renderExpirationTime) {
  // 入参：
  // current是WIP的替身

  var newProps = workInProgress.pendingProps;

  // 如果首次进入这个函数，这个时候的WIP是最底层的fiber，不是单纯的文本，而是普通节点，其孩子是文本
  // 开始分发！！！

  // 在每次渲染完成后，pop上下文的操作确保了当前组件的上下文不再影响其他组件或层次
  // 从而避免上下文的“泄漏”或错误地传递给不需要的组件。

  switch (workInProgress.tag) {
    case IndeterminateComponent:
      break;
    case LazyComponent:
      break;
    case SimpleMemoComponent:
    // 如果当前的fiber是一个函数组件，那么不用新建DOM
    case FunctionComponent:
      break;
    case ClassComponent:
      {
        var Component = workInProgress.type;
        if (isContextProvider(Component)) {
          popContext(workInProgress);
        }
        break;
      }
    case HostRoot:
      // 如果是顶部的root节点
      {
        // 把上下文从栈中弹出
        popHostContainer(workInProgress);

        // 把最顶层的上下文也弹出
        // 弹出的是didPerformWorkStackCursor和contextStackCursor
        popTopLevelContextObject(workInProgress);

        var fiberRoot = workInProgress.stateNode;
        // 把rootfiber的当前上下文属性置为null
        if (fiberRoot.pendingContext) {
          fiberRoot.context = fiberRoot.pendingContext;
          fiberRoot.pendingContext = null;
        }

        if (current === null || current.child === null) {
          // If we hydrated, pop so that we can delete any remaining children
          // that weren't hydrated.
          popHydrationState(workInProgress);

          // 首次渲染进入这里，目的是？？？
          workInProgress.effectTag &= ~Placement;
        }

        // 下面是一个空函数
        updateHostContainer(workInProgress);
        break;
      }
    case HostComponent:
      // 普通的节点（树的最底层）走这里
      {
        // 首先弹出栈里面的上下文，保证下一层不受干扰
        popHostContext(workInProgress);

        // 拿到根节点的root原生DOM节点
        var rootContainerInstance = getRootHostContainer();
        var type = workInProgress.type;

        // 更新的时候走这里
        if (current !== null && workInProgress.stateNode != null) {
          updateHostComponent$1(current, workInProgress, type, newProps, rootContainerInstance);

          if (current.ref !== workInProgress.ref) {
            markRef$1(workInProgress);
          }
        } else {

          // 首次渲染走这里
          if (!newProps) {
            !(workInProgress.stateNode !== null) ? invariant(false, 'We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.') : void 0;
            // This can happen when we abort work.
            break;
          }

          // 这里拿到的上下文不是之前那个fiber节点的上下文吗，因为在前面已经pop出去了
          var currentHostContext = getHostContext();

          var wasHydrated = popHydrationState(workInProgress);

          // 水化走下面
          if (wasHydrated) {
            // Move this and createInstance step into the beginPhase
            // to consolidate.
            if (prepareToHydrateHostInstance(workInProgress, rootContainerInstance, currentHostContext)) {
              // If changes to the hydrated node needs to be applied at the
              // commit-phase we mark this as such.
              markUpdate(workInProgress);
            }

          } else {
            // 非水化走下面

            // 1. 创建一个真实的当前节点的DOM（空的）
            var instance = createInstance(type, newProps, rootContainerInstance, currentHostContext, workInProgress);

            // 2. 把这个节点的孩子真实DOM附上去到这个真实DOM
            appendAllChildren(instance, workInProgress, false, false);

            // 3. 为这个真实的DOM赋予属性和内容（仅在最底层，内容为文字的时候才加上，其他节点在上面的函数加）
            if (finalizeInitialChildren(instance, type, newProps, rootContainerInstance, currentHostContext)) {
              // 然后标记此时的这个节点为更新的节点，一般情况下不走这个
              markUpdate(workInProgress);
            }
            // 把这个真实的DOM放到stateNode属性上面
            workInProgress.stateNode = instance;
          }

          if (workInProgress.ref !== null) {
            // 标记WIP的effectTag为Ref
            markRef$1(workInProgress);
          }
        }
        break;
      }
    case HostText:
      {
        var newText = newProps;
        if (current && workInProgress.stateNode != null) {
          var oldText = current.memoizedProps;
          // If we have an alternate, that means this is an update and we need
          // to schedule a side-effect to do the updates.
          updateHostText$1(current, workInProgress, oldText, newText);
        } else {
          if (typeof newText !== 'string') {
            !(workInProgress.stateNode !== null) ? invariant(false, 'We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.') : void 0;
            // This can happen when we abort work.
          }
          var _rootContainerInstance = getRootHostContainer();
          var _currentHostContext = getHostContext();
          var _wasHydrated = popHydrationState(workInProgress);
          if (_wasHydrated) {
            if (prepareToHydrateHostTextInstance(workInProgress)) {
              markUpdate(workInProgress);
            }
          } else {
            workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext, workInProgress);
          }
        }
        break;
      }
    case ForwardRef:
      break;
    case SuspenseComponent:
      {
        var nextState = workInProgress.memoizedState;
        if ((workInProgress.effectTag & DidCapture) !== NoEffect) {
          // Something suspended. Re-render with the fallback children.
          workInProgress.expirationTime = renderExpirationTime;
          // Do not reset the effect list.
          return workInProgress;
        }

        var nextDidTimeout = nextState !== null;
        var prevDidTimeout = current !== null && current.memoizedState !== null;

        if (current !== null && !nextDidTimeout && prevDidTimeout) {
          // We just switched from the fallback to the normal children. Delete
          // the fallback.
          // Would it be better to store the fallback fragment on
          var currentFallbackChild = current.child.sibling;
          if (currentFallbackChild !== null) {
            // Deletions go at the beginning of the return fiber's effect list
            var first = workInProgress.firstEffect;
            if (first !== null) {
              workInProgress.firstEffect = currentFallbackChild;
              currentFallbackChild.nextEffect = first;
            } else {
              workInProgress.firstEffect = workInProgress.lastEffect = currentFallbackChild;
              currentFallbackChild.nextEffect = null;
            }
            currentFallbackChild.effectTag = Deletion;
          }
        }

        if (nextDidTimeout || prevDidTimeout) {
          // If the children are hidden, or if they were previous hidden, schedule
          // an effect to toggle their visibility. This is also used to attach a
          // retry listener to the promise.
          workInProgress.effectTag |= Update;
        }
        break;
      }
    case Fragment:
      break;
    case Mode:
      break;
    case Profiler:
      break;
    case HostPortal:
      popHostContainer(workInProgress);
      updateHostContainer(workInProgress);
      break;
    case ContextProvider:
      // 如果是上下文的provider，
      popProvider(workInProgress);
      break;
    case ContextConsumer:
      break;
    case MemoComponent:
      break;
    case IncompleteClassComponent:
      {
        // Same as class component case. I put it down here so that the tags are
        // sequential to ensure this switch is compiled to a jump table.
        var _Component = workInProgress.type;
        if (isContextProvider(_Component)) {
          popContext(workInProgress);
        }
        break;
      }
    case DehydratedSuspenseComponent:
      {
        if (enableSuspenseServerRenderer) {
          if (current === null) {
            var _wasHydrated2 = popHydrationState(workInProgress);
            !_wasHydrated2 ? invariant(false, 'A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React.') : void 0;
            skipPastDehydratedSuspenseInstance(workInProgress);
          } else if ((workInProgress.effectTag & DidCapture) === NoEffect) {
            // This boundary did not suspend so it's now hydrated.
            // To handle any future suspense cases, we're going to now upgrade it
            // to a Suspense component. We detach it from the existing current fiber.
            current.alternate = null;
            workInProgress.alternate = null;
            workInProgress.tag = SuspenseComponent;
            workInProgress.memoizedState = null;
            workInProgress.stateNode = null;
          }
        }
        break;
      }
    default:
      invariant(false, 'Unknown unit of work tag. This error is likely caused by a bug in React. Please file an issue.');
  }

  return null;
}




function popHostContext(fiber) {
  // 这里把栈的上下文对象以及fiber栈弹出
  if (contextFiberStackCursor.current !== fiber) {
    return;
  }

  pop(contextStackCursor$1, fiber);
  pop(contextFiberStackCursor, fiber);
}


function getRootHostContainer() {
  var rootInstance = requiredContext(rootInstanceStackCursor.current);
  return rootInstance;
}

function getHostContext() {
  var context = requiredContext(contextStackCursor$1.current);
  return context;
}



function popHydrationState(fiber) {
  if (!supportsHydration) {
    return false;
  }
  if (fiber !== hydrationParentFiber) {
    // We're deeper than the current hydration context, inside an inserted
    // tree.
    return false;
  }
  if (!isHydrating) {
    // If we're not currently hydrating but we're in a hydration context, then
    // we were an insertion and now need to pop up reenter hydration of our
    // siblings.
    popToNextHostParent(fiber);
    isHydrating = true;
    return false;
  }

  var type = fiber.type;

  // If we have any remaining hydratable nodes, we need to delete them now.
  // We only do this deeper than head and body since they tend to have random
  // other nodes in them. We also ignore components with pure text content in
  // side of them.
  // Better heuristic.
  if (fiber.tag !== HostComponent || type !== 'head' && type !== 'body' && !shouldSetTextContent(type, fiber.memoizedProps)) {
    var nextInstance = nextHydratableInstance;
    while (nextInstance) {
      deleteHydratableInstance(fiber, nextInstance);
      nextInstance = getNextHydratableSibling(nextInstance);
    }
  }

  popToNextHostParent(fiber);
  nextHydratableInstance = hydrationParentFiber ? getNextHydratableSibling(fiber.stateNode) : null;
  return true;
}




function createInstance(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
  // 入参：
  // type是WIP的type
  // props是WIP的pendingProps
  // rootContainerInstance是root的原生DOM
  // hostContext是当前的上下文对象？？？？？包含了标签类型和标准的
  // internalInstanceHandle是当前的WIP

  var parentNamespace = void 0;
  {
    // 检查一下文本节点和标签是否合规
    var hostContextDev = hostContext;
    validateDOMNesting(type, null, hostContextDev.ancestorInfo);
    if (typeof props.children === 'string' || typeof props.children === 'number') {
      var string = '' + props.children;
      var ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type);
      validateDOMNesting(null, string, ownAncestorInfo);
    }
    parentNamespace = hostContextDev.namespace;
  }

  // 创建一个真正的DOM
  var domElement = createElement(type, props, rootContainerInstance, parentNamespace);

  // 把fiber赋到真正的DOM的属性上面（这个属性名是随机的）
  precacheFiberNode(internalInstanceHandle, domElement);

  // 把props赋到真正的DOM的属性上面（这个属性名是随机的）
  updateFiberProps(domElement, props);

  // 返回的是一个空的真实的DOM
  return domElement;
}



validateDOMNesting = function (childTag, childText, ancestorInfo) {
  ancestorInfo = ancestorInfo || emptyAncestorInfo;
  var parentInfo = ancestorInfo.current;
  var parentTag = parentInfo && parentInfo.tag;

  if (childText != null) {
    !(childTag == null) ? warningWithoutStack$1(false, 'validateDOMNesting: when childText is passed, childTag should be null') : void 0;
    childTag = '#text';
  }

  var invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
  var invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
  var invalidParentOrAncestor = invalidParent || invalidAncestor;
  if (!invalidParentOrAncestor) {
    return;
  }

  var ancestorTag = invalidParentOrAncestor.tag;
  var addendum = getCurrentFiberStackInDev();

  var warnKey = !!invalidParent + '|' + childTag + '|' + ancestorTag + '|' + addendum;
  if (didWarn[warnKey]) {
    return;
  }
  didWarn[warnKey] = true;

  var tagDisplayName = childTag;
  var whitespaceInfo = '';
  if (childTag === '#text') {
    if (/\S/.test(childText)) {
      tagDisplayName = 'Text nodes';
    } else {
      tagDisplayName = 'Whitespace text nodes';
      whitespaceInfo = " Make sure you don't have any extra whitespace between tags on " + 'each line of your source code.';
    }
  } else {
    tagDisplayName = '<' + childTag + '>';
  }

  if (invalidParent) {
    var info = '';
    if (ancestorTag === 'table' && childTag === 'tr') {
      info += ' Add a <tbody> to your code to match the DOM tree generated by ' + 'the browser.';
    }
    warningWithoutStack$1(false, 'validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s%s', tagDisplayName, ancestorTag, whitespaceInfo, info, addendum);
  } else {
    warningWithoutStack$1(false, 'validateDOMNesting(...): %s cannot appear as a descendant of ' + '<%s>.%s', tagDisplayName, ancestorTag, addendum);
  }
};





function createElement(type, props, rootContainerElement, parentNamespace) {
  // parentNamespace是标准
  // rootContainerInstance是root的容器

  var isCustomComponentTag = void 0;

  // 首先拿到整个文档
  var ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
  var domElement = void 0;
  var namespaceURI = parentNamespace;
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(type);
  }
  if (namespaceURI === HTML_NAMESPACE) {

    {
      // 检查是否是自我定制的一个DOM（自我定制的DOM中间有横杆tagName.indexOf('-') === -1）
      isCustomComponentTag = isCustomComponent(type, props);
      // Should this check be gated by parent namespace? Not sure we want to
      // allow <SVG> or <mATH>.
      !(isCustomComponentTag || type === type.toLowerCase()) ? warning$1(false, '<%s /> is using incorrect casing. ' + 'Use PascalCase for React components, ' + 'or lowercase for HTML elements.', type) : void 0;
    }

    // 开始根据type建立DOM节点
    if (type === 'script') {
      // Create the script via .innerHTML so its "parser-inserted" flag is
      // set to true and it does not execute
      var div = ownerDocument.createElement('div');
      div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
      // This is guaranteed to yield a script element.
      var firstChild = div.firstChild;
      domElement = div.removeChild(firstChild);
    } else if (typeof props.is === 'string') {
      // $FlowIssue `createElement` should be updated for Web Components
      domElement = ownerDocument.createElement(type, { is: props.is });
    } else {

      // 这里的ownerDocument相当于document，相当于从一个DOM节点上拿到了这个方法
      domElement = ownerDocument.createElement(type);

      // 一些特殊标签的props处理
      if (type === 'select') {
        var node = domElement;
        if (props.multiple) {
          node.multiple = true;
        } else if (props.size) {
          node.size = props.size;
        }
      }
    }
  } else {
    domElement = ownerDocument.createElementNS(namespaceURI, type);
  }

  {
    if (namespaceURI === HTML_NAMESPACE) {
      if (!isCustomComponentTag && Object.prototype.toString.call(domElement) === '[object HTMLUnknownElement]' && !Object.prototype.hasOwnProperty.call(warnedUnknownTags, type)) {
        warnedUnknownTags[type] = true;
        warning$1(false, 'The tag <%s> is unrecognized in this browser. ' + 'If you meant to render a React component, start its name with ' + 'an uppercase letter.', type);
      }
    }
  }

  // 返回DOM节点
  return domElement;
}




function getOwnerDocumentFromRootContainer(rootContainerElement) {
  return rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;
}



function isCustomComponent(tagName, props) {
  if (tagName.indexOf('-') === -1) {
    return typeof props.is === 'string';
  }
  switch (tagName) {
    // These are reserved SVG and MathML elements.
    // We don't mind this whitelist too much because we expect it to never grow.
    // The alternative is to track the namespace in a few places which is convoluted.
    // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return false;
    default:
      return true;
  }
}



function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}


function updateFiberProps(node, props) {
  node[internalEventHandlersKey] = props;
}





var appendAllChildren = void 0;
appendAllChildren = function (parent, workInProgress, needsVisibilityToggle, isHidden) {

  // 参数：
  // parent是真实的空的DOM

  // 1.如果这个WIP是一个原生的，内容为文本的节点，那么他的child为null
  // 因为在beginWork分发出去的函数处理children的过程中，把此fiber的child变为了null
  // 2.如果这个WIP不是上述情况，那么都会经过下面的操作，都有child，直到把所有的原生的节点都放到当前的节点下面

  // 向下递归这个节点的所有子节点，直到最最底层的，没有child
  var node = workInProgress.child;
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {

      // 如果这个孩子是一个原生的节点，直接加到原生的父亲节点的下面
      appendInitialChild(parent, node.stateNode);

    } else if (node.tag === HostPortal) {

    } else if (node.child !== null) {
      // 如果这个孩子节点不是一个原生的节点，而是一个函数组件或类组件或provider
      // 继续往下找，直到是一个原生节点为止
      node.child.return = node;
      node = node.child;
      continue;
    }

    // 特殊情况
    if (node === workInProgress) {
      return;
    }

    // 下面的目的是找到最近的所有孩子，把他加到自己的原生DOM的下面
    // （为什么要这样， 因为有些provider或者func组件的节点）

    // 向上遍历，直到node.sibling有值
    // 然后处理他的sibling，跳出第一个while，然后再往下探查
    while (node.sibling === null) {
      // 如果找完了兄弟姐妹，发现下一个为null，如果这个时候的return为workInProgress，说明到底了，可以return了
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }

    // 向右边遍历，直到node没有兄弟姐妹
    node.sibling.return = node.return;
    node = node.sibling;
  }
};

function appendInitialChild(parentInstance, child) {
  parentInstance.appendChild(child);
}





function markUpdate(workInProgress) {
  // Tag the fiber with an update effect. This turns a Placement into
  // a PlacementAndUpdate.
  workInProgress.effectTag |= Update;
}


function markRef$1(workInProgress) {
  workInProgress.effectTag |= Ref;
}



function stopWorkTimer(fiber) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
      return;
    }
    // If we pause, its parent is the fiber to unwind from.
    currentFiber = fiber.return;
    if (!fiber._debugIsCurrentlyTiming) {
      return;
    }
    fiber._debugIsCurrentlyTiming = false;
    endFiberMark(fiber, null, null);
  }
}


var endFiberMark = function (fiber, phase, warning) {
  var componentName = getComponentName(fiber.type) || 'Unknown';
  var debugID = fiber._debugID;
  var isMounted = fiber.alternate !== null;
  var label = getFiberLabel(componentName, isMounted, phase);
  var markName = getFiberMarkName(label, debugID);
  endMark(label, markName, warning);
};

var endMark = function (label, markName, warning) {
  var formattedMarkName = formatMarkName(markName);
  var formattedLabel = formatLabel(label, warning);
  try {
    performance.measure(formattedLabel, formattedMarkName);
  } catch (err) {}
  // If previous mark was missing for some reason, this will throw.
  // This could only happen if React crashed in an unexpected place earlier.
  // Don't pile on with more errors.

  // Clear marks immediately to avoid growing buffer.
  performance.clearMarks(formattedMarkName);
  performance.clearMeasures(formattedLabel);
};





function resetChildExpirationTime(workInProgress, renderTime) {
  // renderTime就是root.nextExpirationTimeToWork

  if (renderTime !== Never && workInProgress.childExpirationTime === Never) {
    // The children of this component are hidden. Don't bubble their
    // expiration times.
    return;
  }

  // React 中表示没有工作的常量。
  var newChildExpirationTime = NoWork;

  // Bubble up the earliest expiration time.
  if (enableProfilerTimer && workInProgress.mode & ProfileMode) {
    // We're in profiling mode.
    // Let's use this same traversal to update the render durations.
    var actualDuration = workInProgress.actualDuration;
    var treeBaseDuration = workInProgress.selfBaseDuration;

    // 为什么比较 >：是因为我们想找到子组件的最晚过期时间，
    // 以此来更新父组件的过期时间。【父组件需要等待所有子组件更新完毕才能更新】
    // newChildExpirationTime 记录的是最晚的过期时间，
    // 这样 React 调度系统可以确保在更新树时所有必要的组件都会被考虑到。

    var shouldBubbleActualDurations = workInProgress.alternate === null || workInProgress.child !== workInProgress.alternate.child;

    // 找到这个fiber的孩子
    var child = workInProgress.child;
    // 找孩子层最大的过期时间作为自己的childExpirationTime
    while (child !== null) {
      // 这里是在看孩子的过期时间大还是孙子的过期时间大
      var childUpdateExpirationTime = child.expirationTime;
      var childChildExpirationTime = child.childExpirationTime;
      if (childUpdateExpirationTime > newChildExpirationTime) {
        newChildExpirationTime = childUpdateExpirationTime;
      }
      if (childChildExpirationTime > newChildExpirationTime) {
        newChildExpirationTime = childChildExpirationTime;
      }

      // actualDuration：表示当前组件的实际渲染时间。
      // treeBaseDuration：表示当前组件及其所有子组件的渲染时间（包括所有子树的基础渲染时间）。

      // 如果是首次渲染阶段 或者 子树有变化
      if (shouldBubbleActualDurations) {
        actualDuration += child.actualDuration;
      }
      // 累加孩子的treeBaseDuration
      treeBaseDuration += child.treeBaseDuration;
      // 往孩子的右边找（孩子层的所有时间要经过对比）
      child = child.sibling;
    }
    workInProgress.actualDuration = actualDuration;
    workInProgress.treeBaseDuration = treeBaseDuration;
  } else {
    var _child = workInProgress.child;
    while (_child !== null) {
      var _childUpdateExpirationTime = _child.expirationTime;
      var _childChildExpirationTime = _child.childExpirationTime;
      if (_childUpdateExpirationTime > newChildExpirationTime) {
        newChildExpirationTime = _childUpdateExpirationTime;
      }
      if (_childChildExpirationTime > newChildExpirationTime) {
        newChildExpirationTime = _childChildExpirationTime;
      }
      _child = _child.sibling;
    }
  }

  workInProgress.childExpirationTime = newChildExpirationTime;
}







function popProvider(providerFiber) {
  // 把provider的上下文从栈里面弹出

  // 这里currentValue是undefined
  var currentValue = valueCursor.current;

  // 弹出上下文的目的是：
  // 当渲染完成后，确保栈的状态恢复到上一层，从而不会干扰其他组件的渲染。
  pop(valueCursor, providerFiber);

  // 然后存到上下文对象本身的属性里面
  // （这个在pushProvider已经做过了）
  // 但现在存的是undefined
  var context = providerFiber.type._context;
  if (isPrimaryRenderer) {
    context._currentValue = currentValue;
  } else {
    context._currentValue2 = currentValue;
  }
}





function popHostContainer(fiber) {
  pop(contextStackCursor$1, fiber);
  pop(contextFiberStackCursor, fiber);
  pop(rootInstanceStackCursor, fiber);
}




function popTopLevelContextObject(fiber) {
  pop(didPerformWorkStackCursor, fiber);
  pop(contextStackCursor, fiber);
}


var updateHostContainer = void 0;
updateHostContainer = function (workInProgress) {
  // Noop
};





// REVIEW - 为真正的DOM赋予props属性和填充children的内容






function finalizeInitialChildren(domElement, type, props, rootContainerInstance, hostContext) {
  // 为真实的DOM设置属性
  setInitialProperties(domElement, type, props, rootContainerInstance);

  // 是否应该自动聚焦于原生节点，textarea标签有一个属性可以判断，其他都是false
  return shouldAutoFocusHostComponent(type, props);
}



function setInitialProperties(domElement, tag, rawProps, rootContainerElement) {
  // tag是type
  // rootContainerElement是根节点的原生dom节点

  // 检查这是否一个定制的节点
  var isCustomComponentTag = isCustomComponent(tag, rawProps);

  // 1. 检查props是否符合规范
  {
    validatePropertiesInDevelopment(tag, rawProps);
    if (isCustomComponentTag && !didWarnShadyDOM && domElement.shadyRoot) {
      warning$1(false, '%s is using shady DOM. Using shady DOM with React can ' + 'cause things to break subtly.', getCurrentFiberOwnerNameInDevOrNull() || 'A component');
      didWarnShadyDOM = true;
    }
  }

  // 2. 定义好props
  var props = void 0;
  switch (tag) {
    case 'iframe':
    case 'object':
      trapBubbledEvent(TOP_LOAD, domElement);
      props = rawProps;
      break;
    case 'video':
    case 'audio':
      // Create listener for each media event
      for (var i = 0; i < mediaEventTypes.length; i++) {
        trapBubbledEvent(mediaEventTypes[i], domElement);
      }
      props = rawProps;
      break;
    case 'source':
      trapBubbledEvent(TOP_ERROR, domElement);
      props = rawProps;
      break;
    case 'img':
    case 'image':
    case 'link':
      trapBubbledEvent(TOP_ERROR, domElement);
      trapBubbledEvent(TOP_LOAD, domElement);
      props = rawProps;
      break;
    case 'form':
      trapBubbledEvent(TOP_RESET, domElement);
      trapBubbledEvent(TOP_SUBMIT, domElement);
      props = rawProps;
      break;
    case 'details':
      trapBubbledEvent(TOP_TOGGLE, domElement);
      props = rawProps;
      break;
    case 'input':
      initWrapperState(domElement, rawProps);

      // 包装一下props对象，加一些属性，比如checked
      props = getHostProps(domElement, rawProps);

      // 跟踪事件委托
      trapBubbledEvent(TOP_INVALID, domElement);

      // 确保监听onChange事件
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'option':
      validateProps(domElement, rawProps);
      props = getHostProps$1(domElement, rawProps);
      break;
    case 'select':
      initWrapperState$1(domElement, rawProps);
      props = getHostProps$2(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'textarea':
      initWrapperState$2(domElement, rawProps);
      props = getHostProps$3(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    default:
      props = rawProps;
  }

  // 3. 再次检查props是否规范，给出警告
  assertValidProps(tag, props);

  // 4. 为真实的DOM设置props
  setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag);

  switch (tag) {
    case 'input':
      // 建立跟踪器，保存到DOM的_valueTracker属性
      // !跟踪的目的是什么？？
      track(domElement);

      // 同步输入值
      postMountWrapper(domElement, rawProps, false);

      break;
    case 'textarea':
      // Make sure we check if this is still unmounted or do any clean
      // up necessary since we never stop tracking anymore.
      track(domElement);
      postMountWrapper$3(domElement, rawProps);
      break;
    case 'option':
      postMountWrapper$1(domElement, rawProps);
      break;
    case 'select':
      postMountWrapper$2(domElement, rawProps);
      break;
    default:
      if (typeof props.onClick === 'function') {
        // This cast may not be sound for SVG, MathML or custom elements.
        trapClickOnNonInteractiveElement(domElement);
      }
      break;
  }
}


function getHostProps(element, props) {
  var node = element;
  var checked = props.checked;

  var hostProps = _assign({}, props, {
    defaultChecked: undefined,
    defaultValue: undefined,
    value: undefined,
    checked: checked != null ? checked : node._wrapperState.initialChecked
  });

  return hostProps;
}



function assertValidProps(tag, props) {
  if (!props) {
    return;
  }
  // Note the use of `==` which checks for null or undefined.
  if (voidElementTags[tag]) {
    !(props.children == null && props.dangerouslySetInnerHTML == null) ? invariant(false, '%s is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.%s', tag, ReactDebugCurrentFrame$2.getStackAddendum()) : void 0;
  }
  if (props.dangerouslySetInnerHTML != null) {
    !(props.children == null) ? invariant(false, 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.') : void 0;
    !(typeof props.dangerouslySetInnerHTML === 'object' && HTML$1 in props.dangerouslySetInnerHTML) ? invariant(false, '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://fb.me/react-invariant-dangerously-set-inner-html for more information.') : void 0;
  }
  {
    !(props.suppressContentEditableWarning || !props.contentEditable || props.children == null) ? warning$1(false, 'A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.') : void 0;
  }
  !(props.style == null || typeof props.style === 'object') ? invariant(false, 'The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + \'em\'}} when using JSX.%s', ReactDebugCurrentFrame$2.getStackAddendum()) : void 0;
}




function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps, isCustomComponentTag) {
  // 遍历props对象
  for (var propKey in nextProps) {
    // 不要原型上面的
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    var nextProp = nextProps[propKey];

    // 如果是style
    if (propKey === STYLE$1) {
      // 冻结一下，不允许修改
      {
        if (nextProp) {
          Object.freeze(nextProp);
        }
      }
      setValueForStyles(domElement, nextProp);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {

      // 这是用来设置内部html的
      var nextHtml = nextProp ? nextProp[HTML] : undefined;
      if (nextHtml != null) {
        setInnerHTML(domElement, nextHtml);
      }
    } else if (propKey === CHILDREN) {
      // 如果是children，开始填充内容
      // 且children是单个文本，直接填充内容
      if (typeof nextProp === 'string') {
        var canSetTextContent = tag !== 'textarea' || nextProp !== '';
        if (canSetTextContent) {
          setTextContent(domElement, nextProp);
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp);
      }

    } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
      // Noop
    } else if (propKey === AUTOFOCUS) {
      // Noop
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      // 这个时候propKey是一个函数
      if (nextProp != null) {
        if (true && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        // 这个时候propKey是一个函数
        // 如果是一个事件，开启监听！
        ensureListeningTo(rootContainerElement, propKey);
      }
    } else if (nextProp != null) {
      // 其他的属性
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
    }
  }
}



function setValueForStyles(node, styles) {
  var style = node.style;
  for (var styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue;
    }

    var isCustomProperty = styleName.indexOf('--') === 0;
    {
      if (!isCustomProperty) {
        warnValidStyle$1(styleName, styles[styleName]);
      }
    }

    var styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty);
    if (styleName === 'float') {
      styleName = 'cssFloat';
    }

    // 为原生的DOM的style属性设置style对象
    if (isCustomProperty) {
      style.setProperty(styleName, styleValue);
    } else {
      style[styleName] = styleValue;
    }
  }
}




var setInnerHTML = createMicrosoftUnsafeLocalFunction(function (node, html) {
  // 这是在一个标签里面加上innerHTML

  if (node.namespaceURI === Namespaces.svg && !('innerHTML' in node)) {
    reusableSVGContainer = reusableSVGContainer || document.createElement('div');
    reusableSVGContainer.innerHTML = '<svg>' + html + '</svg>';
    var svgNode = reusableSVGContainer.firstChild;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    while (svgNode.firstChild) {
      node.appendChild(svgNode.firstChild);
    }
  } else {
    node.innerHTML = html;
  }
});



var createMicrosoftUnsafeLocalFunction = function (func) {
  if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
    return function (arg0, arg1, arg2, arg3) {
      MSApp.execUnsafeLocalFunction(function () {
        return func(arg0, arg1, arg2, arg3);
      });
    };
  } else {
    return func;
  }
};




var setTextContent = function (node, text) {
  if (text) {
    // 如果这个不是一个最底层的节点，就在她的孩子那里把这个值加上
    var firstChild = node.firstChild;

    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
};






function setValueForProperty(node, name, value, isCustomComponentTag) {

  // node是当前的DOM
  // name是当前的props对象的key4
  // value是key对应的值

  // 从一个公共对象里面拿这个key对应的值
  // 这个对象是什么？是一个specialList
  var propertyInfo = getPropertyInfo(name);

  // 把事件的prop处理掉（on开头的那些）
  if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
    return;
  }

  // 把空的props值处理掉
  if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
    value = null;
  }


  // 开始处理，设置当前的props
  // 1. 如果是一个自定义的tag或者就是普通的prop
  if (isCustomComponentTag || propertyInfo === null) {

    // 检测这个key是否是正确的
    if (isAttributeNameSafe(name)) {
      var _attributeName = name;
      // 如果value是null（在前面判断过的空的value了），除掉这个属性
      if (value === null) {
        node.removeAttribute(_attributeName);
      } else {
        node.setAttribute(_attributeName, '' + value);
      }
    }
    return;
  }

  // 接着开始处理必须要有的props，加到真实的DOM里面
  var mustUseProperty = propertyInfo.mustUseProperty;

  if (mustUseProperty) {
    var propertyName = propertyInfo.propertyName;

    if (value === null) {
      var type = propertyInfo.type;
      node[propertyName] = type === BOOLEAN ? false : '';

    } else {

      // 加上这个property的属性key和值
      node[propertyName] = value;
    }
    return;
  }


  // 接下来这个属性是特殊的属性
  // 处理这个属性
  var attributeName = propertyInfo.attributeName,
      attributeNamespace = propertyInfo.attributeNamespace;

  if (value === null) {
    node.removeAttribute(attributeName);
  } else {
    var _type = propertyInfo.type;

    var attributeValue = void 0;
    if (_type === BOOLEAN || _type === OVERLOADED_BOOLEAN && value === true) {
      attributeValue = '';
    } else {
      // `setAttribute` with objects becomes only `[object]` in IE8/9,
      // ('' + value) makes it output the correct toString()-value.
      attributeValue = '' + value;
    }
    if (attributeNamespace) {
      node.setAttributeNS(attributeNamespace, attributeName, attributeValue);
    } else {
      node.setAttribute(attributeName, attributeValue);
    }
  }

}



function getPropertyInfo(name) {
  return properties.hasOwnProperty(name) ? properties[name] : null;
}



function shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag) {
  if (propertyInfo !== null) {
    return propertyInfo.type === RESERVED;
  }
  if (isCustomComponentTag) {
    return false;
  }
  if (name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
    return true;
  }
  return false;
}






function shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag) {
  if (value === null || typeof value === 'undefined') {
    return true;
  }
  if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag)) {
    return true;
  }
  if (isCustomComponentTag) {
    return false;
  }
  if (propertyInfo !== null) {
    switch (propertyInfo.type) {
      case BOOLEAN:
        return !value;
      case OVERLOADED_BOOLEAN:
        return value === false;
      case NUMERIC:
        return isNaN(value);
      case POSITIVE_NUMERIC:
        return isNaN(value) || value < 1;
    }
  }
  return false;
}




function isAttributeNameSafe(attributeName) {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
    return true;
  }
  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
    return false;
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }
  illegalAttributeNameCache[attributeName] = true;
  {
    warning$1(false, 'Invalid attribute name: `%s`', attributeName);
  }
  return false;
}



function track(node) {
  // 如果原生的DOM有这个属性，就说明已经在跟踪中了
  if (getTracker(node)) {
    return;
  }
  // 没有的话赋予一个属性
  node._valueTracker = trackValueOnNode(node);
}

function getTracker(node) {
  return node._valueTracker;
}


function trackValueOnNode(node) {
  var valueField = isCheckable(node) ? 'checked' : 'value';
  var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);

  var currentValue = '' + node[valueField];

  // if someone has already defined a value or Safari, then bail
  // and don't track value will cause over reporting of changes,
  // but it's better then a hard failure
  // (needed for certain tests that spyOn input values and Safari)
  if (node.hasOwnProperty(valueField) || typeof descriptor === 'undefined' || typeof descriptor.get !== 'function' || typeof descriptor.set !== 'function') {
    return;
  }
  var get = descriptor.get,
      set = descriptor.set;

  // 对DOM节点本身赋予一些属性
  Object.defineProperty(node, valueField, {
    configurable: true,
    get: function () {
      return get.call(this);
    },
    set: function (value) {
      currentValue = '' + value;
      set.call(this, value);
    }
  });

  Object.defineProperty(node, valueField, {
    enumerable: descriptor.enumerable
  });

  // 返回一个跟踪器，可以跟踪到当前DOM上面的checked或value对应的信息
  var tracker = {
    getValue: function () {
      return currentValue;
    },
    setValue: function (value) {
      currentValue = '' + value;
    },
    stopTracking: function () {
      detachTracker(node);
      delete node[valueField];
    }
  };
  return tracker;
}




function postMountWrapper(element, props, isHydrating) {
  // element是原生的DOM
  var node = element;

  // 因为是input或textarea，所以需要同步输入值
  if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
    var type = props.type;
    var isButton = type === 'submit' || type === 'reset';

    // <input type="submit">或者<input type="reset">就退出
    if (isButton && (props.value === undefined || props.value === null)) {
      return;
    }

    var _initialValue = toString(node._wrapperState.initialValue);

    // 1. 更新value和defaultValue的值
    // 非水化走下面
    // 防止服务器渲染的初始值覆盖客户端用户输入
    if (!isHydrating) {

      // 在某些情况下，React 会选择不直接同步 value 或 checked 属性，而是依赖于初始值（比如 defaultValue 或 initialValue）来管理这些状态。
      // 这通过 disableInputAttributeSyncing 标志来控制，目的是提高性能或者避免在某些特殊情况下重新渲染表单元素。
      if (disableInputAttributeSyncing) {
        // 手动同步走下面
        var value = getToStringValue(props.value);

        
        if (value != null) {
          // 更新value的值，如果现在的value经过用户的输入之后不一样了
          if (isButton || value !== node.value) {
            node.value = toString(value);
          }
        }
      } else {
        // 不直接同步 value 或 checked 属性，
        // 而是依赖于初始值（比如 defaultValue 或 initialValue）来管理这些状态。
        if (_initialValue !== node.value) {
          node.value = _initialValue;
        }
      }
    }

    if (disableInputAttributeSyncing) {
      // 手动同步走下面
      var defaultValue = getToStringValue(props.defaultValue);
      if (defaultValue != null) {
        node.defaultValue = toString(defaultValue);
      }
    } else {
      // 自动同步
      node.defaultValue = _initialValue;
    }
  }

  var name = node.name;
  if (name !== '') {
    node.name = '';
  }



  // 2. 更新checked的值
  if (disableInputAttributeSyncing) {
    // 手动同步走下面
    if (!isHydrating) {

      updateChecked(element, props);
    }

    if (props.hasOwnProperty('defaultChecked')) {
      node.defaultChecked = !node.defaultChecked;
      node.defaultChecked = !!props.defaultChecked;
    }
  } else {
    // 自动同步
    node.defaultChecked = !node.defaultChecked;
    node.defaultChecked = !!node._wrapperState.initialChecked;
  }

  if (name !== '') {
    node.name = name;
  }
}


function updateChecked(element, props) {
  var node = element;
  var checked = props.checked;
  if (checked != null) {
    setValueForProperty(node, 'checked', checked, false);
  }
}



function shouldAutoFocusHostComponent(type, props) {
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus;
  }
  return false;
}









// REVIEW - 事件触发相关（在completeWork里面的initialProps，也就是为真实DOM加上props时会走到下面）



function ensureListeningTo(rootContainerElement, registrationName) {
  // rootContainerElement是根节点的真实DOM
  // registrationName是事件名称
  var isDocumentOrFragment = rootContainerElement.nodeType === DOCUMENT_NODE || rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
  var doc = isDocumentOrFragment ? rootContainerElement : rootContainerElement.ownerDocument;
  
  // 确保根节点的原生dom节点有效
  listenTo(registrationName, doc);
}



function listenTo(registrationName, mountAt) {
  // mountAt是根节点的真实DOM
  // registrationName是事件名称


  // 拿到是否已经开始监听的信息
  var isListening = getListeningForDocument(mountAt);
  var dependencies = registrationNameDependencies[registrationName];

  // 为isListening赋予一个属性，就是dependency，值为tue，说明这是一个已经监听了的
  for (var i = 0; i < dependencies.length; i++) {
    var dependency = dependencies[i];
    if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
      switch (dependency) {
        case TOP_SCROLL:
          trapCapturedEvent(TOP_SCROLL, mountAt);
          break;
        case TOP_FOCUS:
        case TOP_BLUR:
          trapCapturedEvent(TOP_FOCUS, mountAt);
          trapCapturedEvent(TOP_BLUR, mountAt);
          // We set the flag for a single dependency later in this function,
          // but this ensures we mark both as attached rather than just one.
          isListening[TOP_BLUR] = true;
          isListening[TOP_FOCUS] = true;
          break;
        case TOP_CANCEL:
        case TOP_CLOSE:
          if (isEventSupported(getRawEventName(dependency))) {
            trapCapturedEvent(dependency, mountAt);
          }
          break;
        case TOP_INVALID:
        case TOP_SUBMIT:
        case TOP_RESET:
          // We listen to them on the target DOM elements.
          // Some of them bubble so we don't want them to fire twice.
          break;
        default:

          // 挂事件，开始监听
          var isMediaEvent = mediaEventTypes.indexOf(dependency) !== -1;
          if (!isMediaEvent) {
            trapBubbledEvent(dependency, mountAt);
          }
          break;
      }
      isListening[dependency] = true;
    }
  }
}



function getListeningForDocument(mountAt) {
  // 管理和返回与文档或元素（mountAt）相关的事件监听器数据
  if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
    // 如果 mountAt 中没有这个属性，表示这个文档或元素还没有相关的事件监听器。
    mountAt[topListenersIDKey] = reactTopListenersCounter++;
    // 初始化为空对象
    alreadyListeningTo[mountAt[topListenersIDKey]] = {};
  }
  return alreadyListeningTo[mountAt[topListenersIDKey]];
}




function trapCapturedEvent(topLevelType, element) {
  if (!element) {
    return null;
  }
  var dispatch = isInteractiveTopLevelEventType(topLevelType) ? dispatchInteractiveEvent : dispatchEvent;

  addEventCaptureListener(element, getRawEventName(topLevelType), dispatch.bind(null, topLevelType));
}


function trapBubbledEvent(topLevelType, element) {
  // topLevelType是事件类型‘click’
  // element是原生的DOM

  if (!element) {
    return null;
  }

  // 检查是否交互的，依据此拿到dispatch函数
  var dispatch = isInteractiveTopLevelEventType(topLevelType) ? dispatchInteractiveEvent : dispatchEvent;

  // 给这个原生的DOM监听一个事件，dispatch则是监听到这个事件之后的处理函数
  // 里面是原生的addEventListener函数，回调就是dispatch.bind(null, topLevelType)
  addEventBubbleListener(element, getRawEventName(topLevelType), dispatch.bind(null, topLevelType));
}



var isInteractiveTopLevelEventType = SimpleEventPlugin.isInteractiveTopLevelEventType;
var SimpleEventPlugin = {
  eventTypes: eventTypes$4,

  isInteractiveTopLevelEventType: function (topLevelType) {
    // topLevelEventsToDispatchConfig将事件类型（例如，"click"）映射到与该事件相关的配置。
    // 配置通常包含有关事件类型的详细信息，例如该事件是否是交互式的、该事件的优先级等
    var config = topLevelEventsToDispatchConfig[topLevelType];
    return config !== undefined && config.isInteractive === true;
  },
}




function dispatchInteractiveEvent(topLevelType, nativeEvent) {
  // topLevelType是事件类型‘click’
  // nativeEvent是原生的事件对象
  interactiveUpdates$1(dispatchEvent, topLevelType, nativeEvent);
}


function interactiveUpdates$1(fn, a, b) {
  // 1. 处理挂起的交互式更新
  // 是否正在批量更新、是否正在渲染、挂起交互式更新的最小过期时间不为0
  if (!isBatchingUpdates && !isRendering && lowestPriorityPendingInteractiveExpirationTime !== NoWork) {
    // 调用 performWork 函数，同步地执行挂起的交互式更新
    performWork(lowestPriorityPendingInteractiveExpirationTime, false);
    // 重置状态 
    lowestPriorityPendingInteractiveExpirationTime = NoWork;
  }

  // 2. 开始批量更新
  var previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;
  try {
    // 执行dispatchEvent函数
    return unstable_runWithPriority(UserBlockingPriority, function () {
      return fn(a, b);
    });
  } finally {

    // 3. 这个时候的previousIsBatchingUpdates就是false了
    isBatchingUpdates = previousIsBatchingUpdates;

    // 可以进入下面，开始同步更新
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork();
    }
  }
}



function dispatchEvent(topLevelType, nativeEvent) {
  if (!_enabled) {
    return;
  }

  // 1. 通过这个事件对象找到这个原生的DOM对象
  var nativeEventTarget = getEventTarget(nativeEvent);

  // 2. 从原生的节点里面找到相应的fiber
  // 之前依靠一个随机key名保存在原生的DOM对象上，可以直接找到fiber
  var targetInst = getClosestInstanceFromNode(nativeEventTarget);

  // 3. 判断某个 fiber（Fiber 对象）是否已经挂载。
  if (targetInst !== null && typeof targetInst.tag === 'number' && !isFiberMounted(targetInst)) {
    // 如果我们在提交该组件的挂载之前收到一个事件（例如：img-onload），
    // 请暂时忽略它（也就是说，将其视为非React树上的事件）。我们还可以考虑对事件进行排队，并在挂载后进行调度。
    targetInst = null;
  }

  // 4. 包裹原生的事件对象
  // 从回调事件的池子里面拿出一个对象
  var bookKeeping = getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst);

  // 5. 开始批量更新
  try {

    // 传入bookKeeping这个包装对象
    batchedUpdates(handleTopLevel, bookKeeping);
  } finally {

    // 恢复外层合成事件对象，把她放回池子里面
    releaseTopLevelCallbackBookKeeping(bookKeeping);
  }
}


function getEventTarget(nativeEvent) {
  // 从原生对象里面拿到原生的DOM节点，也就是这个事件绑定的节点
  var target = nativeEvent.target || nativeEvent.srcElement || window;

  // Normalize SVG <use> element events #4963
  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  }

  // 如果这是一个文本，找到包裹这个文本的父亲节点
  return target.nodeType === TEXT_NODE ? target.parentNode : target;
}


function getClosestInstanceFromNode(node) {
  // 根据原生DOM找最近的fiber
  // 拿到之前createInstance保存在原生节点里面的key，指向的是这个节点的fiber对象

  // 如果是root，他没有这个属性！（也就是树的顶部，肯定会返回null）
  if (node[internalInstanceKey]) {
    return node[internalInstanceKey];
  }

  // 没有的话找父母的，一旦【上面】有一个找到了，就停下
  while (!node[internalInstanceKey]) {
    if (node.parentNode) {
      // 找原生DOM的父亲节点（即使是在root开始往上找的情况下，也能从body-html这样往上找，到html停止）
      node = node.parentNode;
    } else {
      // 说明这是在root节点的位置了，也就是树的顶部了
      return null;
    }
  }

  var inst = node[internalInstanceKey];

  // 如果这是一个原生的fiber节点，直接返回，注意，返回的是fiber
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // In Fiber, this will always be the deepest root.
    return inst;
  }

  return null;
}



function isFiberMounted(fiber) {
  return isFiberMountedImpl(fiber) === MOUNTED;
}

function isFiberMountedImpl(fiber) {
  var node = fiber;
  if (!fiber.alternate) {
    // 一个新创建的 Fiber，它可能尚未插入到 DOM 中

    // 该节点正在被插入
    if ((node.effectTag & Placement) !== NoEffect) {
      return MOUNTING;
    }

    // 找父亲或往上的祖先，父亲正在插入中，那么正在挂载中
    while (node.return) {
      node = node.return;
      if ((node.effectTag & Placement) !== NoEffect) {
        return MOUNTING;
      }
    }
  } else {

    // 有替身，找最顶层的父亲
    while (node.return) {
      node = node.return;
    }
  }
  if (node.tag === HostRoot) {
    // 找到最顶层，也没有插入的副作用
    return MOUNTED;
  }
  // 其他情况都不是，返回UNMOUNTED
  return UNMOUNTED;
}



function getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst) {
  // topLevelType是原生的事件名称
  // nativeEvent是原生的事件对象
  // targetInst就是fiber

  // 从池子里面拿出一个【外层合成事件对象】，加一些信息
  if (callbackBookkeepingPool.length) {
    var instance = callbackBookkeepingPool.pop();
    instance.topLevelType = topLevelType;
    instance.nativeEvent = nativeEvent;
    instance.targetInst = targetInst;
    return instance;
  }

  // 首次渲染，事件池子没有对象
  // 如果没有的话就新建一个，包裹原来的事件对象，加了事件名称和fiber的信息
  return {
    topLevelType: topLevelType,
    nativeEvent: nativeEvent,
    targetInst: targetInst,
    ancestors: []
  };
}



function batchedUpdates(fn, bookkeeping) {

  // 这里的fn指的是handleTopLevel函数，bookkeeping是包装对象

  // 之前在包裹dispatchEvent函数里面改变的是isBatchingUpdates这个标识（为true）
  if (isBatching) {
    // 如果我们当前在另一个批处理中，我们需要等待它完全完成，然后再恢复状态。
    return fn(bookkeeping);
  }

  // 开始进入真正的批次更新过程，切换标识
  isBatching = true;

  try {
    return batchedUpdates$1(fn, bookkeeping);
  } finally {
    // isBatching改回为false
    isBatching = false;

    // 例如，如果 React 中某个受控组件的状态发生变化，
    // 但 React 判断没有必要触及实际的 DOM 更新（例如优化渲染性能），则该组件的状态可能与实际 DOM 不匹配。
    // 在这种情况下，需要恢复状态以确保它的一致性。
    var controlledComponentsHavePendingUpdates = needsStateRestore();
    if (controlledComponentsHavePendingUpdates) {
      // 下面是用于刷新或强制执行某些交互式更新的过程
      _flushInteractiveUpdatesImpl();
      // 根据需要恢复组件的状态
      restoreStateIfNeeded();
    }
  }
}



function batchedUpdates$1(fn, a) {
  // 再改一下标识
  var previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;

  // 执行回调函数，也就是handleTopLevel函数
  try {
    return fn(a);
  } finally {
    isBatchingUpdates = previousIsBatchingUpdates;

    // 如果是非批量更新，直接进入同步更新

    // 首次点击后开始更新时，
    // previousIsBatchingUpdates这里是true，之前在包裹dispatchEvent的函数里面已经修改了
    // 因此这里进不去
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork();
    }
  }
}




function handleTopLevel(bookKeeping) {
  
  // 1. 找到这个事件对象的fiber
  var targetInst = bookKeeping.targetInst;
  var ancestor = targetInst;


  // 2. 下面是：收集发生交互事件的节点
  do {
    if (!ancestor) {
      bookKeeping.ancestors.push(ancestor);
      break;
    }
    // 这个root已经是根节点root的真实的DOM了
    var root = findRootContainerNode(ancestor);
    if (!root) {
      break;
    }
    // 把当前节点的fiber（例如被点击的按钮节点）保存到本次事件对象的祖先队列中
    bookKeeping.ancestors.push(ancestor);

    // 找到距离根节点（原生DOM）最近的fiber
    // 如果是root传入的话，肯定返回null，结束循环
    ancestor = getClosestInstanceFromNode(root);
  } while (ancestor);

  // 到这里bookKeeping.ancestors数组只有交互节点本身
  // 下面这里不是在冒泡
  // 这个数组存的只是自己本身，对自己本身遍历，执行事件函数
  for (var i = 0; i < bookKeeping.ancestors.length; i++) {
    targetInst = bookKeeping.ancestors[i];
    runExtractedEventsInBatch(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
  }
}


function findRootContainerNode(inst) {
  // 源码在这里说：
  // 缓存它以防止不必要的DOM遍历可能是一个好主意，但如果不使用变异观察器来监听所有DOM更改，很难正确地进行缓存。
  // 找到根节点的fiber
  while (inst.return) {
    inst = inst.return;
  }
  if (inst.tag !== HostRoot) {
    // This can happen if we're in a detached tree.
    return null;
  }
  // 拿到这个根fiber的root对象的真实DOM节点
  return inst.stateNode.containerInfo;
}



function runExtractedEventsInBatch(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  // 入参是：
  // topLevelType是事件名称，‘click’
  // targetInst是fiber
  // nativeEvent是原生的event对象
  // nativeEventTarget是当前被点击的真实DOM节点

  // 首先把插件的东西融合到一起
  var events = extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
  runEventsInBatch(events);
}


function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  // 入参是：
  // topLevelType是事件名称
  // targetInst是fiber
  // nativeEvent是原生的event对象
  // nativeEventTarget是当前被点击的真实DOM节点

  var events = null;
  for (var i = 0; i < plugins.length; i++) {
    // 遍历插件数组，整合event
    
    var possiblePlugin = plugins[i];
    if (possiblePlugin) {
      // 返回的是合成事件对象
      var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
      
      // 把两个对象合并到一起，形成一个数组，然后覆盖原先的events
      if (extractedEvents) {
        events = accumulateInto(events, extractedEvents);
      }
    }
  }
  // 返回一个数组
  return events;
}


// 下面是plugins数组的所有插件对象：（逐一执行里面的extractEvent函数）

// 一、根据浏览器事件类型（topLevelType）来确定应该创建哪种类型的合成事件（Synthetic Event）
var SimpleEventPlugin = {
  eventTypes: eventTypes$4,

  isInteractiveTopLevelEventType: function (topLevelType) {
    var config = topLevelEventsToDispatchConfig[topLevelType];
    return config !== undefined && config.isInteractive === true;
  },


  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    // 1. 获取事件分发配置
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor = void 0

    // 2. 根据不同事件类型赋予EventConstructor一个合成事件对象的构造函数（一个类）
    switch (topLevelType) {
      case TOP_KEY_PRESS:
        // Firefox creates a keypress event for function keys too. This removes
        // the unwanted keypress events. Enter is however both printable and
        // non-printable. One would expect Tab to be as well (but it isn't).
        if (getEventCharCode(nativeEvent) === 0) {
          return null;
        }
      /* falls through */
      case TOP_KEY_DOWN:
      case TOP_KEY_UP:
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case TOP_BLUR:
      case TOP_FOCUS:
        EventConstructor = SyntheticFocusEvent;
        break;
      case TOP_CLICK:
        // 点击事件在这里
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
      /* falls through */
      case TOP_AUX_CLICK:
      case TOP_DOUBLE_CLICK:
      case TOP_MOUSE_DOWN:
      case TOP_MOUSE_MOVE:
      case TOP_MOUSE_UP:
      // Disabled elements should not respond to mouse events
      /* falls through */
      case TOP_MOUSE_OUT:
      case TOP_MOUSE_OVER:
      case TOP_CONTEXT_MENU:
        EventConstructor = SyntheticMouseEvent;
        break;
      case TOP_DRAG:
      case TOP_DRAG_END:
      case TOP_DRAG_ENTER:
      case TOP_DRAG_EXIT:
      case TOP_DRAG_LEAVE:
      case TOP_DRAG_OVER:
      case TOP_DRAG_START:
      case TOP_DROP:
        EventConstructor = SyntheticDragEvent;
        break;
      case TOP_TOUCH_CANCEL:
      case TOP_TOUCH_END:
      case TOP_TOUCH_MOVE:
      case TOP_TOUCH_START:
        EventConstructor = SyntheticTouchEvent;
        break;
      case TOP_ANIMATION_END:
      case TOP_ANIMATION_ITERATION:
      case TOP_ANIMATION_START:
        EventConstructor = SyntheticAnimationEvent;
        break;
      case TOP_TRANSITION_END:
        EventConstructor = SyntheticTransitionEvent;
        break;
      case TOP_SCROLL:
        EventConstructor = SyntheticUIEvent;
        break;
      case TOP_WHEEL:
        EventConstructor = SyntheticWheelEvent;
        break;
      case TOP_COPY:
      case TOP_CUT:
      case TOP_PASTE:
        EventConstructor = SyntheticClipboardEvent;
        break;
      case TOP_GOT_POINTER_CAPTURE:
      case TOP_LOST_POINTER_CAPTURE:
      case TOP_POINTER_CANCEL:
      case TOP_POINTER_DOWN:
      case TOP_POINTER_MOVE:
      case TOP_POINTER_OUT:
      case TOP_POINTER_OVER:
      case TOP_POINTER_UP:
        EventConstructor = SyntheticPointerEvent;
        break;
      default:
        {
          if (knownHTMLTopLevelTypes.indexOf(topLevelType) === -1) {
            warningWithoutStack$1(false, 'SimpleEventPlugin: Unhandled event type, `%s`. This warning ' + 'is likely caused by a bug in React. Please file an issue.', topLevelType);
          }
        }
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
        EventConstructor = SyntheticEvent;
        break;
    }

    // 默认情况下，EventConstructor是SyntheticEvent
    // 3. 拿到事件池子里面的一个事件
    var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
    
    // 4. 进行冒泡或者捕获逻辑
    accumulateTwoPhaseDispatches(event);
    return event;
  }
};


// 这里就是EventConstructor.getPooled的函数
function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
  // 这个this就是EventConstructor，也就是SyntheticEvent
  var EventConstructor = this;

  // 从池子里面拿一个合成对象
  // 一开始这个对象的事件池子里面没有东西
  if (EventConstructor.eventPool.length) {
    var instance = EventConstructor.eventPool.pop();
    // 把类改一下上下文为这个对象，相当于重新new EventConstructor一下，只不过用的是过往的内存
    EventConstructor.call(instance, dispatchConfig, targetInst, nativeEvent, nativeInst);
    return instance;
  }
  return new EventConstructor(dispatchConfig, targetInst, nativeEvent, nativeInst);
}

// 相当于new EventConstructor函数
function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {

  // 更新一些属性
  {
    delete this.nativeEvent;
    delete this.preventDefault;
    delete this.stopPropagation;
    delete this.isDefaultPrevented;
    delete this.isPropagationStopped;
  }

  this.dispatchConfig = dispatchConfig;
  this._targetInst = targetInst;
  this.nativeEvent = nativeEvent;

  // 下面在构造一个经过包装的事件对象（合成事件）
  var Interface = this.constructor.Interface;
  for (var propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    {
      delete this[propName];
    }
    var normalize = Interface[propName];
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      if (propName === 'target') {
        this.target = nativeEventTarget;
      } else {
        this[propName] = nativeEvent[propName];
      }
    }
  }

  // 设置阻止默认事件发生的函数
  var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = functionThatReturnsTrue;
  } else {
    this.isDefaultPrevented = functionThatReturnsFalse;
  }
  this.isPropagationStopped = functionThatReturnsFalse;

  // 返回构造好的合成事件对象
  return this;
}


function accumulateTwoPhaseDispatches(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}


function forEachAccumulated(arr, cb, scope) {
  // 这里相当于arr是一个包含各种事件对象的数组，比如一个事件触发了，有很多依赖的事件也触发了
  // 或者说在冒泡或捕获过程中有别的事件
  if (Array.isArray(arr)) {
    // 每个事件对象都要执行一下cb函数，要么是处理冒泡捕获的，要么是最后一起执行的executeDispatchesInOrder
    arr.forEach(cb, scope);
  } else if (arr) {
    // 一般来说，首次从accumulateTwoPhaseDispatches函数过来的，events是单纯的一个合成事件，而非一个数组
    // 这里的cb就是accumulateTwoPhaseDispatchesSingle函数
    cb.call(scope, arr);
  }
}


function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
  }
}

function traverseTwoPhase(inst, fn, arg) {
  // inst是发生交互事件的对象
  // fn是accumulateDirectionalDispatches函数
  // event是第二次包装的合成事件

  // 把自己祖上的元素（必须是原生节点的元素）都找到，放到一个队列里面
  // 注意，这里不包含root节点
  var path = [];
  while (inst) {
    path.push(inst);
    inst = getParent(inst);
  }
  // 然后分别执行fn，也就是accumulateDirectionalDispatches函数
  var i = void 0;
  for (i = path.length; i-- > 0;) {
    fn(path[i], 'captured', arg);
  }
  for (i = 0; i < path.length; i++) {
    fn(path[i], 'bubbled', arg);
  }
}

function getParent(inst) {
  // 找到【上面】最近的一个原生节点为止，返回fiber
  // 注意root节点的tag是HostRoot，因此root也不算在里面
  do {
    inst = inst.return;
  } while (inst && inst.tag !== HostComponent);
  if (inst) {
    return inst;
  }
  return null;
}

// 发生交互事件的自己节点及其祖上所有节点都要执行这个
function accumulateDirectionalDispatches(inst, phase, event) {
  // inst是fiber节点，phase是冒泡还是捕获，event是经过第二次包装的合成事件

  // 拿到onXXX对应的函数
  var listener = listenerAtPhase(inst, event, phase);

  // 如果存在的话，构造一个数组（如果整个祖先链条上有超过两个都有事件函数）或单个元素（如果只有一个的话）
  // 存在本次触发的事件对象上面
  if (listener) {
    event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}



function listenerAtPhase(inst, event, propagationPhase) {
  // propagationPhase是冒泡还是捕获
  // inst是fiber节点
  // event是经过第二次包装的合成事件

  // 这里的registrationName是'onClickCapture'（捕获）或者‘onClick’（冒泡）
  var registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];

  // 拿到onXXX对应的函数
  return getListener(inst, registrationName);
}



function getListener(inst, registrationName) {
  var listener = void 0;

  // 拿到真实的DOM
  var stateNode = inst.stateNode;

  if (!stateNode) {
    return null;
  }

  // 通过真实的DOM拿到props对象
  var props = getFiberCurrentPropsFromNode(stateNode);
  if (!props) {
    // Work in progress.
    return null;
  }

  // 拿到对应的onXXX的函数
  listener = props[registrationName];

  // 是否有disable属性，且是否是一个交互式的元素
  if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
    return null;
  }
  !(!listener || typeof listener === 'function') ? invariant(false, 'Expected `%s` listener to be a function, instead got a value of `%s` type.', registrationName, typeof listener) : void 0;
  return listener;
}



function getFiberCurrentPropsFromNode(node) {
  return node[internalEventHandlersKey] || null;
}



function shouldPreventMouseEvent(name, type, props) {
  switch (name) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
      // 元素被禁用并且它是交互式的
      return !!(props.disabled && isInteractive(type));
    default:
      return false;
  }
}




function accumulateInto(current, next) {
  // current是event._dispatchListeners或者是event._dispatchInstances
  // next是onXXX的函数或者是对应的fiber

  // current一开始是undefined
  // undefined和null双等于，返回onXXX的函数或者是对应的fiber
  if (current == null) {
    return next;
  }

  // 如果current是一个数组
  if (Array.isArray(current)) {
    if (Array.isArray(next)) {
      // 如果两者都是数组：
      // 数组 next 中的每个元素作为单独的参数传递给 push 方法。
      // 这样 next 数组的元素会被合并到 current 数组中。
      current.push.apply(current, next);
      return current;
    }
    current.push(next);
    return current;
  }

  // current 不是数组，但 next 是数组的情况
  // 结合两者
  if (Array.isArray(next)) {
    // 将 current 包装成一个数组，并将 next 数组合并进去
    return [current].concat(next);
  }

  // current 和 next 都不是数组
  return [current, next];
}




// 二、处理鼠标或指针事件（如 mouseover、mouseout、pointerover 和 pointerout），并生成相关的事件对象
var EnterLeaveEventPlugin = {
  eventTypes: eventTypes$2,

  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {

    // 1. 界定处理范围
    // 进入事件： mouseover 或 mouseout（鼠标事件）
    var isOverEvent = topLevelType === TOP_MOUSE_OVER || topLevelType === TOP_POINTER_OVER;
    // 离开事件： pointerover 或 pointerout（指针事件）
    var isOutEvent = topLevelType === TOP_MOUSE_OUT || topLevelType === TOP_POINTER_OUT;

    // 如果事件是进入事件并且存在 relatedTarget 或 fromElement，则返回 null，即不需要处理该事件。
    // 因为这通常是一个从当前元素到另一个元素的过渡，不需要生成新的事件。
    if (isOverEvent && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null;
    }
    // 既不是 mouseover、pointerover，也不是 mouseout、pointerout，则返回 null。
    if (!isOutEvent && !isOverEvent) {
      return null;
    }


    // 2. 获取 window 对象
    var win = void 0;
    if (nativeEventTarget.window === nativeEventTarget) {
      // 自己就是window对象本身
      win = nativeEventTarget;
    } else {
      // 查找 nativeEventTarget 的 ownerDocument，并从中提取 window 对象
      var doc = nativeEventTarget.ownerDocument;
      if (doc) {
        win = doc.defaultView || doc.parentWindow;
      } else {
        win = window;
      }
    }


    // 3. 确定事件的起始和目标元素
    var from = void 0;
    var to = void 0;
    if (isOutEvent) {
      // 鼠标离开事件
      // 从哪里起始
      from = targetInst;
      var related = nativeEvent.relatedTarget || nativeEvent.toElement;
      // 到哪里？拿到他的fiber
      to = related ? getClosestInstanceFromNode(related) : null;
    } else {
      // 鼠标进入事件
      from = null;
      to = targetInst;
    }

    if (from === to) {
      return null;
    }


    // 4. 初始化事件类型和事件对象
    var eventInterface = void 0,
        leaveEventType = void 0,
        enterEventType = void 0,
        eventTypePrefix = void 0;

    if (topLevelType === TOP_MOUSE_OUT || topLevelType === TOP_MOUSE_OVER) {
      // TOP_MOUSE_OUT 和 TOP_MOUSE_OVER 对应鼠标事件，使用 SyntheticMouseEvent
      eventInterface = SyntheticMouseEvent;
      leaveEventType = eventTypes$2.mouseLeave;
      enterEventType = eventTypes$2.mouseEnter;
      eventTypePrefix = 'mouse';
    } else if (topLevelType === TOP_POINTER_OUT || topLevelType === TOP_POINTER_OVER) {
      // TOP_POINTER_OUT 和 TOP_POINTER_OVER 对应指针事件，使用 SyntheticPointerEvent
      eventInterface = SyntheticPointerEvent;
      leaveEventType = eventTypes$2.pointerLeave;
      enterEventType = eventTypes$2.pointerEnter;
      eventTypePrefix = 'pointer';
    }

    // 拿到原生的DOM
    var fromNode = from == null ? win : getNodeFromInstance$1(from);
    var toNode = to == null ? win : getNodeFromInstance$1(to);

    // 拿到池子里面的合成对象
    var leave = eventInterface.getPooled(leaveEventType, from, nativeEvent, nativeEventTarget);
    leave.type = eventTypePrefix + 'leave';
    leave.target = fromNode;
    leave.relatedTarget = toNode;

    var enter = eventInterface.getPooled(enterEventType, to, nativeEvent, nativeEventTarget);
    enter.type = eventTypePrefix + 'enter';
    enter.target = toNode;
    enter.relatedTarget = fromNode;

    // 处理冒泡和捕获逻辑，保存在事件对象里面
    accumulateEnterLeaveDispatches(leave, enter, from, to);

    return [leave, enter];
  }
};


function getNodeFromInstance$1(inst) {
  if (inst.tag === HostComponent || inst.tag === HostText) {
    return inst.stateNode;
  }
}

function accumulateEnterLeaveDispatches(leave, enter, from, to) {
  traverseEnterLeave(from, to, accumulateDispatches, leave, enter);
}

function traverseEnterLeave(from, to, fn, argFrom, argTo) {

  var common = from && to ? getLowestCommonAncestor(from, to) : null;

  var pathFrom = [];

  // 把from和to这个fiber分别放到数组里面
  while (true) {
    if (!from) {
      break;
    }
    if (from === common) {
      break;
    }
    var alternate = from.alternate;
    if (alternate !== null && alternate === common) {
      break;
    }
    pathFrom.push(from);
    from = getParent(from);
  }
  var pathTo = [];
  while (true) {
    if (!to) {
      break;
    }
    if (to === common) {
      break;
    }
    var _alternate = to.alternate;
    if (_alternate !== null && _alternate === common) {
      break;
    }
    pathTo.push(to);
    to = getParent(to);
  }

  // 对数组上面的fiber元素进行遍历，为事件对象挂上对应的函数和fiber信息
  for (var i = 0; i < pathFrom.length; i++) {
    fn(pathFrom[i], 'bubbled', argFrom);
  }
  for (var _i = pathTo.length; _i-- > 0;) {
    fn(pathTo[_i], 'captured', argTo);
  }
}


// 下面这个函数和accumulateDirectionalDispatches有点像
function accumulateDispatches(inst, ignoredDirection, event) {
  if (inst && event && event.dispatchConfig.registrationName) {
    var registrationName = event.dispatchConfig.registrationName;
    var listener = getListener(inst, registrationName);
    if (listener) {
      event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
      event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
    }
  }
}





// 三、处理输入相关事件，特别是与表单元素（如文本框、输入框、选择框等）相关的事件。
// 函数中处理了多种输入事件，包括 change、input、click、blur 等事件

var ChangeEventPlugin = {
  eventTypes: eventTypes$1,

  _isInputEventSupported: isInputEventSupported,

  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {

    // 拿到原生的DOM
    var targetNode = targetInst ? getNodeFromInstance$1(targetInst) : window;

    var getTargetInstFunc = void 0,
        handleEventFunc = void 0;

    // 判断目标元素类型并选择处理函数
    if (shouldUseChangeEvent(targetNode)) {
      // 是否需要使用 change 事件（也就是当前的fiber是否是select，input或者file）
      getTargetInstFunc = getTargetInstForChangeEvent;
    } else if (isTextInputElement(targetNode)) {
      // 文本输入元素（如 <input>、<textarea>）
      if (isInputEventSupported) {
        // 浏览器支持原生的 input 事件
        getTargetInstFunc = getTargetInstForInputOrChangeEvent;
      } else {
        // 浏览器不支持 input 事件（例如某些老版本浏览器）
        getTargetInstFunc = getTargetInstForInputEventPolyfill;
        handleEventFunc = handleEventsForInputEventPolyfill;
      }
    } else if (shouldUseClickEvent(targetNode)) {
      // 点击类的input元素
      getTargetInstFunc = getTargetInstForClickEvent;
    }

    // 如果满足条件，执行函数
    if (getTargetInstFunc) {
      // 返回fiber（仅在 当前的事件命中 的情况下（且value确实有变化）才返回targetInst）
      var inst = getTargetInstFunc(topLevelType, targetInst);
      // 冒泡逻辑，保存函数
      if (inst) {
        var event = createAndAccumulateChangeEvent(inst, nativeEvent, nativeEventTarget);
        return event;
      }
    }

    // 处理 polyfill 事件
    if (handleEventFunc) {
      handleEventFunc(topLevelType, targetNode, targetInst);
    }

    // 处理 blur 事件
    if (topLevelType === TOP_BLUR) {
      handleControlledInputBlur(targetNode);
    }
  }
};


function shouldUseChangeEvent(elem) {
  var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName === 'select' || nodeName === 'input' && elem.type === 'file';
}

function getTargetInstForChangeEvent(topLevelType, targetInst) {
  if (topLevelType === TOP_CHANGE) {
    return targetInst;
  }
}



function isTextInputElement(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();

  if (nodeName === 'input') {
    return !!supportedInputTypes[elem.type];
  }

  if (nodeName === 'textarea') {
    return true;
  }

  return false;
}

function getTargetInstForInputOrChangeEvent(topLevelType, targetInst) {
  if (topLevelType === TOP_INPUT || topLevelType === TOP_CHANGE) {
    return getInstIfValueChanged(targetInst);
  }
}

function getInstIfValueChanged(targetInst) {
  var targetNode = getNodeFromInstance$1(targetInst);
  // 如果变化了就返回targetInst
  if (updateValueIfChanged(targetNode)) {
    return targetInst;
  }
}

function updateValueIfChanged(node) {
  if (!node) {
    return false;
  }

  // 拿到追踪器
  var tracker = getTracker(node);
  // 没有追踪器，说明value变化了
  if (!tracker) {
    return true;
  }

  // 拿到新旧value的值
  var lastValue = tracker.getValue();
  var nextValue = getValueFromNode(node);

  // 看是否一样，不一样就重新设置一下，然后返回true
  if (nextValue !== lastValue) {
    tracker.setValue(nextValue);
    return true;
  }
  return false;
}

function getTracker(node) {
  return node._valueTracker;
}

function getValueFromNode(node) {
  var value = '';
  if (!node) {
    return value;
  }

  if (isCheckable(node)) {
    value = node.checked ? 'true' : 'false';
  } else {
    value = node.value;
  }

  return value;
}



function shouldUseClickEvent(elem) {
  // 点击类的input元素
  var nodeName = elem.nodeName;
  return nodeName && nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio');
}

function getTargetInstForClickEvent(topLevelType, targetInst) {
  if (topLevelType === TOP_CLICK) {
    return getInstIfValueChanged(targetInst);
  }
}



function createAndAccumulateChangeEvent(inst, nativeEvent, target) {
  var event = SyntheticEvent.getPooled(eventTypes$1.change, inst, nativeEvent, target);
  event.type = 'change';

  // 保存到队列中（把真实的DOM）
  enqueueStateRestore(target);

  // 冒泡处理
  accumulateTwoPhaseDispatches(event);
  return event;
}




// 四、处理输入相关事件，特别是与表单元素（如文本框、输入框、选择框等）相关的事件。

var SelectEventPlugin = {
  eventTypes: eventTypes$3,

  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    // 拿到document对象
    var doc = getEventTargetDocument(nativeEventTarget);

    // 查看文档有没有注册 onSelect 事件的监听器
    if (!doc || !isListeningToAllDependencies('onSelect', doc)) {
      return null;
    }

    // 拿到原生DOM
    var targetNode = targetInst ? getNodeFromInstance$1(targetInst) : window;

    switch (topLevelType) {
      // Track the input node that has focus.
      case TOP_FOCUS:
        if (isTextInputElement(targetNode) || targetNode.contentEditable === 'true') {
          // 事件类型是 TOP_FOCUS（即元素获取焦点），并且目标节点是文本输入元素
          activeElement$1 = targetNode;
          activeElementInst$1 = targetInst;
          // 清空之前的记录
          lastSelection = null;
        }
        break;
      case TOP_BLUR:
        activeElement$1 = null;
        activeElementInst$1 = null;
        lastSelection = null;
        break;
      case TOP_MOUSE_DOWN:
        mouseDown = true;
        break;
      // 2. 如果事件类型是（鼠标“结束”事件）
      // TOP_CONTEXT_MENU（右键菜单事件）、
      // TOP_MOUSE_UP（鼠标松开事件）、
      // TOP_DRAG_END（拖动结束事件），
      // 则将 mouseDown 设置为 false，表示鼠标不再按下
      case TOP_CONTEXT_MENU:
      case TOP_MOUSE_UP:
      case TOP_DRAG_END:
        mouseDown = false;
        // 构造一个 select 事件，并返回该事件
        return constructSelectEvent(nativeEvent, nativeEventTarget);

      // 3. 事件类型是（选择变化）
      // TOP_SELECTION_CHANGE（选择发生变化）、
      // TOP_KEY_DOWN（键盘按下事件）
      // TOP_KEY_UP（键盘松开事件）
      case TOP_SELECTION_CHANGE:
        if (skipSelectionChangeEvent) {
          break;
        }
      // falls through
      case TOP_KEY_DOWN:
      case TOP_KEY_UP:
        return constructSelectEvent(nativeEvent, nativeEventTarget);
    }

    return null;
  }
};


function getEventTargetDocument(eventTarget) {
  return eventTarget.window === eventTarget ? eventTarget.document : eventTarget.nodeType === DOCUMENT_NODE ? eventTarget : eventTarget.ownerDocument;
}


function isListeningToAllDependencies(registrationName, mountAt) {
  // mountAt是整个html文档
  // 拿到与文档相关的事件监听器数据
  var isListening = getListeningForDocument(mountAt);

  // 从select插件进来，registrationName是onSelect
  // 通过事件名称拿到其依赖的事件列表
  var dependencies = registrationNameDependencies[registrationName];
  // onSelect相关的事件有下面这些：
  // 'blur'
  // 'contextmenu'
  // 'dragend'
  // 'focus'
  // 'keydown'
  // 'keyup'
  // 'mousedown'
  // 'mouseup'
  // 'selectionchange'
  for (var i = 0; i < dependencies.length; i++) {
    var dependency = dependencies[i];
    if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
      return false;
    }
  }
  return true;
}




function constructSelectEvent(nativeEvent, nativeEventTarget) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior). In HTML5, select
  // fires only on input and textarea thus if there's no focused element we
  // won't dispatch.
  var doc = getEventTargetDocument(nativeEventTarget);

  if (mouseDown || activeElement$1 == null || activeElement$1 !== getActiveElement(doc)) {
    return null;
  }

  // Only fire when selection has actually changed.
  var currentSelection = getSelection(activeElement$1);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    var syntheticEvent = SyntheticEvent.getPooled(eventTypes$3.select, activeElementInst$1, nativeEvent, nativeEventTarget);

    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement$1;

    accumulateTwoPhaseDispatches(syntheticEvent);

    return syntheticEvent;
  }

  return null;
}




// 五、提取输入事件。
// 它的目的是根据事件的类型和其他因素（如组合输入和基础输入事件）提取事件并返回

var BeforeInputEventPlugin = {
  eventTypes: eventTypes,

  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    
    // 提取组合输入事件，返回相应的合成事件对象
    // 提取组合输入事件。组合输入事件通常与输入法（如拼音输入法）相关，
    // 例如，用户在输入时可能会先输入一个拼音组合，然后再选择正确的汉字。
    var composition = extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget);

    // 提取基础的输入事件，返回相应的合成事件对象
    // 在许多情况下，beforeInput 事件是在输入发生之前触发的，比如用户键入某个字符之前。
    // beforeInput 通常会用于处理文本输入等常规输入事件，并且它的处理会比 composition 更直接，通常是在用户开始输入时触发。
    var beforeInput = extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget);

    // 组合两者
    if (composition === null) {
      return beforeInput;
    }

    if (beforeInput === null) {
      return composition;
    }

    return [composition, beforeInput];
  }
};


function extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  var eventType = void 0;
  var fallbackData = void 0;

  // 判断是否支持组合事件
  if (canUseCompositionEvent) {
    // 获取事件类型
    eventType = getCompositionEventType(topLevelType);
  } else if (!isComposing) {
    // 不支持组合事件，并且当前不在组合输入过程中 (!isComposing)
    if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
      // 为组合输入开始事件
      eventType = eventTypes.compositionStart;
    }
  } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
    // 为组合输入结束事件
    eventType = eventTypes.compositionEnd;
  }

  // eventType还是为空说明不满足上面任意条件
  if (!eventType) {
    return null;
  }

  // 处理备用输入数据
  if (useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)) {
    // 需要使用备用数据，且不是韩语输入法
    if (!isComposing && eventType === eventTypes.compositionStart) {
      // 是组合输入开始 (compositionStart)，且当前没有处于组合输入状态（!isComposing）
      isComposing = initialize(nativeEventTarget);
    } else if (eventType === eventTypes.compositionEnd) {
      // 是组合输入结束 (compositionEnd)，并且已经处于组合输入状态（isComposing）
      if (isComposing) {
        fallbackData = getData();
      }
    }
  }

  // 生成合成事件
  var event = SyntheticCompositionEvent.getPooled(eventType, targetInst, nativeEvent, nativeEventTarget);

  // 处理备用数据
  if (fallbackData) {
    // Inject data generated from fallback path into the synthetic event.
    // This matches the property of native CompositionEventInterface.
    event.data = fallbackData;
  } else {
    // 从原生事件中提取自定义数据。如果提取到的数据有效（即不为 null），就将其赋值给 event.data
    var customData = getDataFromCustomEvent(nativeEvent);
    if (customData !== null) {
      event.data = customData;
    }
  }

  // 冒泡逻辑
  accumulateTwoPhaseDispatches(event);
  return event;
}



function getCompositionEventType(topLevelType) {
  switch (topLevelType) {
    case TOP_COMPOSITION_START:
      return eventTypes.compositionStart;
    case TOP_COMPOSITION_END:
      return eventTypes.compositionEnd;
    case TOP_COMPOSITION_UPDATE:
      return eventTypes.compositionUpdate;
  }
}


function extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  var chars = void 0;

  if (canUseTextInputEvent) {
    chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
  } else {
    chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
  }

  // If no characters are being inserted, no BeforeInput event should
  // be fired.
  if (!chars) {
    return null;
  }

  var event = SyntheticInputEvent.getPooled(eventTypes.beforeInput, targetInst, nativeEvent, nativeEventTarget);

  event.data = chars;
  accumulateTwoPhaseDispatches(event);
  return event;
}


function getNativeBeforeInputChars(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case TOP_COMPOSITION_END:
      return getDataFromCustomEvent(nativeEvent);
    case TOP_KEY_PRESS:
      var which = nativeEvent.which;
      if (which !== SPACEBAR_CODE) {
        return null;
      }

      hasSpaceKeypress = true;
      return SPACEBAR_CHAR;

    case TOP_TEXT_INPUT:
      // Record the characters to be added to the DOM.
      var chars = nativeEvent.data;

      if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
        return null;
      }

      return chars;

    default:
      // For other native event types, do nothing.
      return null;
  }
}



function runEventsInBatch(events) {
  // 整合所有的event
  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events);
  }

  // 暂存eventQueue，恢复以前的eventQueue
  var processingEventQueue = eventQueue;
  eventQueue = null;

  if (!processingEventQueue) {
    return;
  }

  // 多少个事件对象就执行多少次（比如点击一个DOM接连着发生了多个事件，而这些事件都被监听了（在创建真实DOM的时候））
  // 这里只是在执行本fiber的连带着触发的所有事件
  // 到这一步才开始执行，用户定义的监听函数
  forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);

  // 抛出错误
  rethrowCaughtError();
}



var executeDispatchesAndReleaseTopLevel = function (e) {
  return executeDispatchesAndRelease(e);
};

var executeDispatchesAndRelease = function (event) {
  // 派发事件（也就是执行listener函数）
  if (event) {
    executeDispatchesInOrder(event);

    // isPersistent() 方法用于判断某个事件对象是否需要在事件处理后保持在内存中，即是否应该“持续”存在。
    // 默认情况下，事件对象会在事件处理完后被回收（从池中释放），
    // 但在某些情况下，开发者可能需要保留事件对象（例如，如果你需要异步处理事件中的数据）。
    // 这时，isPersistent() 会返回 true，表示事件对象应当被持久化，React 不会自动将其释放。

    // 如果是非持久化的话，那要释放事件，将其归还给事件池
    // 去到releasePooledEvent函数！！！
    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};

function executeDispatchesInOrder(event) {

  // 拿到保存的listenr函数和fiber对象
  var dispatchListeners = event._dispatchListeners;
  var dispatchInstances = event._dispatchInstances;

  // 验证一下，
  {
    validateEventDispatches(event);
  }

  if (Array.isArray(dispatchListeners)) {
    // 如果是一个数组就要按顺序监听
    for (var i = 0; i < dispatchListeners.length; i++) {
      // 这是停止冒泡的意思
      // 如果事件的传播被停止（即调用了 event.stopPropagation()），则停止执行后续的事件监听器，跳出循环。
      if (event.isPropagationStopped()) {
        break;
      }
      // 执行监听函数
      executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
    }
  } else if (dispatchListeners) {
    // 执行监听函数
    executeDispatch(event, dispatchListeners, dispatchInstances);
  }
  // 恢复变量
  event._dispatchListeners = null;
  event._dispatchInstances = null;
}


function validateEventDispatches(event) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchInstances = event._dispatchInstances;

  var listenersIsArr = Array.isArray(dispatchListeners);
  var listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;

  var instancesIsArr = Array.isArray(dispatchInstances);
  var instancesLen = instancesIsArr ? dispatchInstances.length : dispatchInstances ? 1 : 0;

  !(instancesIsArr === listenersIsArr && instancesLen === listenersLen) ? warningWithoutStack$1(false, 'EventPluginUtils: Invalid `event`.') : void 0;
};




function executeDispatch(event, listener, inst) {
  var type = event.type || 'unknown-event';
  // 通过fiber拿到原生DOM，赋予给合成对象的currentTarget
  event.currentTarget = getNodeFromInstance(inst);

  // 开始执行监听函数，然后才执行里面的listener，也就是setXXXX，这个时候去看钩子函数返回的是什么样的函数（dispatchAction）
  invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
  event.currentTarget = null;
}


function getNodeFromInstance(inst) {
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // In Fiber this, is just the state node right now. We assume it will be
    // a host component or host text.
    return inst.stateNode;
  }

  // Without this first invariant, passing a non-DOM-component triggers the next
  // invariant for a missing parent, which is super confusing.
  invariant(false, 'getNodeFromInstance: Invalid argument.');
}




function invokeGuardedCallbackAndCatchFirstError(name, func, context, a, b, c, d, e, f) {
  invokeGuardedCallback.apply(this, arguments);
  if (hasError) {
    var error = clearCaughtError();
    if (!hasRethrowError) {
      hasRethrowError = true;
      rethrowError = error;
    }
  }
}


function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
  hasError = false;
  caughtError = null;
  invokeGuardedCallbackDev.apply(reporter, arguments);
}


var invokeGuardedCallbackDev = function (name, func, context, a, b, c, d, e, f) {

  // 检查document是否存在
  !(typeof document !== 'undefined') ? invariant(false, 'The `document` global was defined when React was initialized, but is not defined anymore. This can happen in a test environment if a component schedules an update from an asynchronous callback, but the test has already finished running. To solve this, you can either unmount the component at the end of your test (and ensure that any asynchronous operations get canceled in `componentWillUnmount`), or you can change the test itself to be asynchronous.') : void 0;
  

  // 1. 创建自定义事件
  var evt = document.createEvent('Event');


  // 2. 定义或保存一些变量（错误追踪变量）
  var didError = true;
  // 保存当前 window.event（某些浏览器依赖该值）
  var windowEvent = window.event;
  // 保存 window.event 的属性描述符（用于恢复浏览器原始行为）
  var windowEventDescriptor = Object.getOwnPropertyDescriptor(window, 'event');


  // 3. 包装一下回调函数
  // 拿到函数的参数
  var funcArgs = Array.prototype.slice.call(arguments, 3);
  function callCallback() {
    // 移除事件监听：防止嵌套调用冲突
    fakeNode.removeEventListener(evtType, callCallback, false);
    // 确保回调中能访问原始的 window.event 
    if (typeof window.event !== 'undefined' && window.hasOwnProperty('event')) {
      window.event = windowEvent;
    }
    // 执行回调
    func.apply(context, funcArgs);
    didError = false;
  }

  
  // 4. 定义错误处理函数
  var error = void 0;
  var didSetError = false;
  var isCrossOriginError = false;

  function handleWindowError(event) {
    error = event.error;
    didSetError = true;
    // 跨域错误检测：通过 colno 和 lineno 为 0 判断跨域脚本错误。
    if (error === null && event.colno === 0 && event.lineno === 0) {
      isCrossOriginError = true;
    }
    if (event.defaultPrevented) {
      if (error != null && typeof error === 'object') {
        try {
          error._suppressLogging = true;
        } catch (inner) {
        }
      }
    }
  }


  // 5. 同步事件触发
  // 5.1 生成唯一的事件类型名
  var evtType = 'react-' + (name ? name : 'invokeguardedcallback');

  // window 监听全局错误，fakeNode 监听自定义事件，后面利用【代码式】的事件对象触发callCallback
  window.addEventListener('error', handleWindowError);
  fakeNode.addEventListener(evtType, callCallback, false);

  // 触发回调（同步的）
  // 首先初始化一个全新的事件对象，下面是给他设置一些属性：
  // initEvent 是事件对象的一个方法，用于设置事件的类型、是否可以冒泡以及是否可以取消默认行为。它接受三个参数：
  // evtType：事件的类型，通常是一个字符串。例如 'click'、'keydown' 或者在这个代码中可能是一个自定义的事件类型。
  // false：第二个参数表示事件是否能冒泡，false 表示事件不能冒泡。如果设置为 true，事件就可以冒泡到父级元素。
  // false：第三个参数表示事件的默认行为是否可以被取消。false 表示不可以取消默认行为。如果是 true，那么可以在事件处理程序中调用 event.preventDefault() 来阻止事件的默认行为。
  evt.initEvent(evtType, false, false);
  // 用来将事件对象evt对象（一个事件就是一个对象）派发到fakeNode上，相当于模拟这个node产生了click的交互，然后执行callCallback
  fakeNode.dispatchEvent(evt);
  // 接着开始执行callCallback函数

  // 6. 事件触发后的处理
  // 6.1 恢复浏览器状态
  if (windowEventDescriptor) {
    Object.defineProperty(window, 'event', windowEventDescriptor);
  }
  // 6.2 错误处理
  if (didError) {
    if (!didSetError) {
      error = new Error('An error was thrown inside one of your components, but React ' + "doesn't know what it was. This is likely due to browser " + 'flakiness. React does its best to preserve the "Pause on ' + 'exceptions" behavior of the DevTools, which requires some ' + "DEV-mode only tricks. It's possible that these don't work in " + 'your browser. Try triggering the error in production mode, ' + 'or switching to a modern browser. If you suspect that this is ' + 'actually an issue with React, please file an issue.');
    } else if (isCrossOriginError) {
      error = new Error("A cross-origin error was thrown. React doesn't have access to " + 'the actual error object in development. ' + 'See https://fb.me/react-crossorigin-error for more information.');
    }
    this.onError(error);
  }

  // 移除全局错误监听
  window.removeEventListener('error', handleWindowError);
};




function addEventBubbleListener(element, eventType, listener) {
  element.addEventListener(eventType, listener, false);
}

function getRawEventName(topLevelType) {
  return unsafeCastDOMTopLevelTypeToString(topLevelType);
}

function unsafeCastDOMTopLevelTypeToString(topLevelType) {
  return topLevelType;
}




// 回收合成事件
function releasePooledEvent(event) {
  var EventConstructor = this;
  !(event instanceof EventConstructor) ? invariant(false, 'Trying to release an event instance into a pool of a different type.') : void 0;
  // 走下面的函数SyntheticEvent.prototype.destructor
  // 自己身上有摧毁自己的函数
  event.destructor();

  // 首次更新，这个池子是0，把这个对象回收到（放回）池子里面
  if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
    EventConstructor.eventPool.push(event);
  }
}


SyntheticEvent.prototype.destructor = function () {
  var Interface = this.constructor.Interface;

  // 定义一些警告信息
  for (var propName in Interface) {
    {
      Object.defineProperty(this, propName, getPooledWarningPropertyDefinition(propName, Interface[propName]));
    }
  }


  // 重要！
  // 把所有相关的属性全部改为null
  this.dispatchConfig = null;
  this._targetInst = null;
  this.nativeEvent = null;
  this.isDefaultPrevented = functionThatReturnsFalse;
  this.isPropagationStopped = functionThatReturnsFalse;
  this._dispatchListeners = null;
  this._dispatchInstances = null;


  {
    Object.defineProperty(this, 'nativeEvent', getPooledWarningPropertyDefinition('nativeEvent', null));
    Object.defineProperty(this, 'isDefaultPrevented', getPooledWarningPropertyDefinition('isDefaultPrevented', functionThatReturnsFalse));
    Object.defineProperty(this, 'isPropagationStopped', getPooledWarningPropertyDefinition('isPropagationStopped', functionThatReturnsFalse));
    Object.defineProperty(this, 'preventDefault', getPooledWarningPropertyDefinition('preventDefault', function () {}));
    Object.defineProperty(this, 'stopPropagation', getPooledWarningPropertyDefinition('stopPropagation', function () {}));
  }
}

function functionThatReturnsTrue() {
  return true;
}

function functionThatReturnsFalse() {
  return false;
}




function rethrowCaughtError() {
  if (hasRethrowError) {
    var error = rethrowError;
    hasRethrowError = false;
    rethrowError = null;
    throw error;
  }
}







function needsStateRestore() {
  return restoreTarget !== null || restoreQueue !== null;
}




function releaseTopLevelCallbackBookKeeping(instance) {
  // 恢复属性
  instance.topLevelType = null;
  instance.nativeEvent = null;
  instance.targetInst = null;
  instance.ancestors.length = 0;
  // 放回池子里面
  if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
    callbackBookkeepingPool.push(instance);
  }
}








// REVIEW - renderRoot里面的workLoop完成之后，开始准备进入commit阶段了




function resetContextDependences() {
  currentlyRenderingFiber = null;
  lastContextDependency = null;
  lastContextWithAllBitsObserved = null;
  {
    isDisallowedContextReadInDEV = false;
  }
}



function resetHooks() {
  // hook工具箱
  ReactCurrentDispatcher$1.current = ContextOnlyDispatcher;

  // 当前过期时间，fiber恢复为默认
  renderExpirationTime = NoWork;
  currentlyRenderingFiber$1 = null;

  // 当前的hook
  currentHook = null;
  nextCurrentHook = null;
  firstWorkInProgressHook = null;
  workInProgressHook = null;
  nextWorkInProgressHook = null;

  // 开发阶段的一些变量
  {
    hookTypesDev = null;
    hookTypesUpdateIndexDev = -1;

    currentHookNameInDev = null;
  }

  // 剩下的过期时间、更新队列、副作用tag
  remainingExpirationTime = NoWork;
  componentUpdateQueue = null;
  sideEffectTag = 0;

  didScheduleRenderPhaseUpdate = false;
  renderPhaseUpdates = null;
  numberOfReRenders = 0;
}




// 停止记录时间
function stopWorkLoopTimer(interruptedBy, didCompleteRoot) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    var warning = null;
    if (interruptedBy !== null) {
      if (interruptedBy.tag === HostRoot) {
        warning = 'A top-level update interrupted the previous render';
      } else {
        var componentName = getComponentName(interruptedBy.type) || 'Unknown';
        warning = 'An update to ' + componentName + ' interrupted the previous render';
      }
    } else if (commitCountInCurrentWorkLoop > 1) {
      warning = 'There were cascading updates';
    }
    commitCountInCurrentWorkLoop = 0;
    var label = didCompleteRoot ? '(React Tree Reconciliation: Completed Root)' : '(React Tree Reconciliation: Yielded)';
    
    // 对每一个fiber的时间相关属性都停止一下
    pauseTimers();
    endMark(label, '(React Tree Reconciliation)', warning);
  }
}




var pauseTimers = function () {
  // Stops all currently active measurements so that they can be resumed
  // if we continue in a later deferred loop from the same unit of work.
  var fiber = currentFiber;
  while (fiber) {
    if (fiber._debugIsCurrentlyTiming) {
      endFiberMark(fiber, null, null);
    }
    fiber = fiber.return;
  }
};



var endFiberMark = function (fiber, phase, warning) {
  var componentName = getComponentName(fiber.type) || 'Unknown';
  var debugID = fiber._debugID;
  var isMounted = fiber.alternate !== null;
  // 拿到自定义的标识
  var label = getFiberLabel(componentName, isMounted, phase);
  var markName = getFiberMarkName(label, debugID);
  // 停止
  endMark(label, markName, warning);
};



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



var getFiberLabel = function (componentName, isMounted, phase) {
  if (phase === null) {
    // These are composite component total time measurements.
    return componentName + ' [' + (isMounted ? 'update' : 'mount') + ']';
  } else {
    // Composite component methods.
    return componentName + '.' + phase;
  }
};


var getFiberMarkName = function (label, debugID) {
  return label + ' (#' + debugID + ')';
};




var endMark = function (label, markName, warning) {
  var formattedMarkName = formatMarkName(markName);
  var formattedLabel = formatLabel(label, warning);
  try {
    performance.measure(formattedLabel, formattedMarkName);
  } catch (err) {}
  // If previous mark was missing for some reason, this will throw.
  // This could only happen if React crashed in an unexpected place earlier.
  // Don't pile on with more errors.

  // Clear marks immediately to avoid growing buffer.
  performance.clearMarks(formattedMarkName);
  performance.clearMeasures(formattedLabel);
};



var formatMarkName = function (markName) {
  return reactEmoji + ' ' + markName;
};

var formatLabel = function (label, warning) {
  var prefix = warning ? warningEmoji + ' ' : reactEmoji + ' ';
  var suffix = warning ? ' Warning: ' + warning : '';
  return '' + prefix + label + suffix;
};


function onFatal(root) {
  root.finishedWork = null;
}

function onYield(root) {
  root.finishedWork = null;
}



function hasLowerPriorityWork(root, erroredExpirationTime) {
  // latestPendingTime：表示最新待处理的任务的过期时间。
  // latestSuspendedTime：表示最新挂起任务的过期时间。
  // latestPingedTime：表示最新“被重新唤醒”任务的过期时间。
  var latestPendingTime = root.latestPendingTime;
  var latestSuspendedTime = root.latestSuspendedTime;
  var latestPingedTime = root.latestPingedTime;
  // 如果某个任务（待处理、挂起、被唤醒的任务）的过期时间小于 erroredExpirationTime 
  // 且该任务的过期时间不等于 NoWork，
  // 则说明该任务是待处理的高优先级任务。（也就是Priority的数字很小）
  return latestPendingTime !== NoWork && latestPendingTime < erroredExpirationTime || latestSuspendedTime !== NoWork && latestSuspendedTime < erroredExpirationTime || latestPingedTime !== NoWork && latestPingedTime < erroredExpirationTime;
}




function markSuspendedPriorityLevel(root, suspendedTime) {
  root.didError = false;
  // 首先处理的是pinged的变量，主要是lastest那个 
  clearPing(root, suspendedTime);

  // 1. 更新一下最早和最晚【待处理】任务的过期时间
  var earliestPendingTime = root.earliestPendingTime;
  var latestPendingTime = root.latestPendingTime;

  if (earliestPendingTime === suspendedTime) {
    if (latestPendingTime === suspendedTime) {
      // 表示挂起的任务是唯一一个待处理任务，需要清除这两个标记
      root.earliestPendingTime = root.latestPendingTime = NoWork;
    } else {
      // 否则，suspendedTime仅仅和earliestPendingTime相等，
      // 使得root的latestPendingTime和earliestPendingTime相等（让这个挂起任务成为唯一一个待处理的任务）
      root.earliestPendingTime = root.latestPendingTime;
    }
  } else if (latestPendingTime === suspendedTime) {
    // suspendedTime仅仅和latestPendingTime相等，
    // 使得root的latestPendingTime和earliestPendingTime相等（让这个挂起任务成为唯一一个待处理的任务）
    root.latestPendingTime = earliestPendingTime;
  }


  // 2. 更新一下最早和最晚【挂起】任务的过期时间
  var earliestSuspendedTime = root.earliestSuspendedTime;
  var latestSuspendedTime = root.latestSuspendedTime;
  if (earliestSuspendedTime === NoWork) {
    // 还没有任何任务挂起
    // 把当前的挂起任务变为earliestSuspendedTime和latestSuspendedTime
    // 两者相等是为了表示这里只有同一个挂起任务
    root.earliestSuspendedTime = root.latestSuspendedTime = suspendedTime;
  } else {
    // 有任务挂起中（且是最早挂起的任务，优先级是最大的）
    // 此时suspendedTime比最早的挂起任务的过期时间还要大
    if (earliestSuspendedTime < suspendedTime) {
      // !当前的任务大于最早挂起任务的过期时间，
      // !那说明这个任务比较晚，优先级比较低，为什么更新的是earliestSuspendedTime
      // 有没可能是这个挂起任务要成为下一次的执行对象，因此把他变为earliestSuspendedTime
      root.earliestSuspendedTime = suspendedTime;
    } else if (latestSuspendedTime > suspendedTime) {
      // 同理？？
      root.latestSuspendedTime = suspendedTime;
    }
  }
  // 更新一下当前的全局的过期时间变量（保存到root）
  findNextExpirationTimeToWorkOn(suspendedTime, root);
}


function clearPing(root, completedTime) {
  // 如果现在的eT比最新“被重新唤醒”任务latestPingedTime还要小，
  // 也就是优先级要大，把root.latestPingedTime更新一下
  var latestPingedTime = root.latestPingedTime;
  if (latestPingedTime >= completedTime) {
    root.latestPingedTime = NoWork;
  }
}


// 查找最早的突出优先级
function findEarliestOutstandingPriorityLevel(root, renderExpirationTime) {
  var earliestExpirationTime = renderExpirationTime;
  var earliestPendingTime = root.earliestPendingTime;
  var earliestSuspendedTime = root.earliestSuspendedTime;

  // TODO-
  // 当前的时间小于最早待处理任务的时间，说明当前的时间优先级高，
  // !为什么把earliestExpirationTime变为没有自己优先级高的root.earliestPendingTime？？？
  if (earliestPendingTime > earliestExpirationTime) {
    earliestExpirationTime = earliestPendingTime;
  }

  // 当前的时间小于最早挂起任务的时间，说明当前的时间优先级高，
  // !为什么把earliestExpirationTime变为没有自己优先级高的root.earliestSuspendedTime？？？
  if (earliestSuspendedTime > earliestExpirationTime) {
    earliestExpirationTime = earliestSuspendedTime;
  }
  return earliestExpirationTime;
}


function expirationTimeToMs(expirationTime) {
  return (MAGIC_NUMBER_OFFSET - expirationTime) * UNIT_SIZE;
}




function onSuspend(root, finishedWork, suspendedExpirationTime, rootExpirationTime, msUntilTimeout) {
  // root是根对象
  // finishedWork是当前的顶层的fiber，一般是root的fiber
  // suspendedExpirationTime是当前挂起任务的过期时间
  // rootExpirationTime是root对象的eT过期时间
  // msUntilTimeout是还剩下多少时间，如果他是-1说明没有剩下时间

  root.expirationTime = rootExpirationTime;
  // 如果没有剩下时间了，且不是时间切片模式，而是同步渲染的模式
  if (msUntilTimeout === 0 && !shouldYieldToRenderer()) {
    // 立刻开始进入提commit提交状态
    root.pendingCommitExpirationTime = suspendedExpirationTime;
    root.finishedWork = finishedWork;
  } else if (msUntilTimeout > 0) {
    // 还剩时间的话
    // scheduleTimeout就是setTimeout
    // 相当于回到主线程，等到msUntilTimeout时间之后，才进入提交阶段
    root.timeoutHandle = scheduleTimeout(onTimeout.bind(null, root, finishedWork, suspendedExpirationTime), msUntilTimeout);
  }
}


function shouldYieldToRenderer() {
  if (didYield) {
    return true;
  }
  if (scheduler.unstable_shouldYield()) {
    didYield = true;
    return true;
  }
  return false;
}




var scheduleTimeout = typeof setTimeout === 'function' ? setTimeout : undefined;


function onTimeout(root, finishedWork, suspendedExpirationTime) {
  // root是根对象
  // finishedWork是当前的顶层的fiber，一般是root的fiber
  // suspendedExpirationTime是当前挂起任务的过期时间

  // 执行到这个函数的时候，已经到了要哦提交的时候
  root.pendingCommitExpirationTime = suspendedExpirationTime;
  root.finishedWork = finishedWork;

  // 重新计算一下目前的时间
  recomputeCurrentRendererTime();

  // 把render的时间变为调度的时间
  currentSchedulerTime = currentRendererTime;

  flushRoot(root, suspendedExpirationTime);
}



function flushRoot(root, expirationTime) {
  !!isRendering ? invariant(false, 'work.commit(): Cannot commit while already rendering. This likely means you attempted to commit from inside a lifecycle method.') : void 0;
  
  // 把这种经过等待而来的提交工作，放到flushed相关的变量里面
  nextFlushedRoot = root;
  nextFlushedExpirationTime = expirationTime;

  // 这里为什么要从两个入口分别进入performWorkOnRoot呢，一个是直接进入，一个经过封装的函数进入
  // 1. 异步任务——处理异步或延迟的任务，确保任务按优先级顺序执行
  // 从根开始执行，进入completeWork阶段
  performWorkOnRoot(root, expirationTime, false);

  // 2. 触发额外的同步工作——所有挂起的同步任务都能够被及时处理和执行。
  // 必须立刻开展perform工作，不开启时间切片，且同步执行
  performSyncWork();
}



function onComplete(root, finishedWork, expirationTime) {
  root.pendingCommitExpirationTime = expirationTime;
  root.finishedWork = finishedWork;
}






// REVIEW - 开始进入commit阶段，进入completeRoot的函数
// 就像renderRoot里面有workLoop，而completeRoot里面有commitRoot



function completeRoot(root, finishedWork, expirationTime) {
  // 1. 检查是否存在与 expirationTime 匹配的批次
  // firstBatch 是当前 root 上第一个与该 root 关联的批次。批次通常代表一系列待处理的更新工作。
  var firstBatch = root.firstBatch;
  // 如果这个eT是符合当前的批次的
  if (firstBatch !== null && firstBatch._expirationTime >= expirationTime) {
    // 把批次存入一个全局数组（用二维数组的形式）
    if (completedBatches === null) {
      completedBatches = [firstBatch];
    } else {
      completedBatches.push(firstBatch);
    }

    // 批次需要延迟
    if (firstBatch._defer) {
      // 这个 root 更新将被暂时挂起，直到下次有新的更新。
      // 此时将 root.finishedWork 保存，表示当前的工作尚未完成，
      // root.expirationTime 被设置为 NoWork（表示没有待处理的工作）。
      root.finishedWork = finishedWork;
      root.expirationTime = NoWork;
      return;
    }
  }

  // Commit the root.
  root.finishedWork = null;


  // 2. 处理批次里面的root的相关变量
  // lastCommittedRootDuringThisBatch 记录了上一个已经提交的 root。
  // 如果当前 root 与它相同，说明这次更新是在嵌套更新中发生的
  if (root === lastCommittedRootDuringThisBatch) {
    // 为了避免无限递归，nestedUpdateCount 会被递增
    nestedUpdateCount++;
  } else {
    // 如果不相同
    // 开始处理一个新的 root，此时会重置 nestedUpdateCount 为 0
    lastCommittedRootDuringThisBatch = root;
    nestedUpdateCount = 0;
  }


  // 3. 开始进入commit
  // 这个方法是在scheduler里面的函数
  unstable_runWithPriority(ImmediatePriority, function () {
    commitRoot(root, finishedWork);
  });

}




function unstable_runWithPriority(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
    case IdlePriority:
      break;
    default:
      priorityLevel = NormalPriority;
  }

  // 更新一些全局变量
  // 从completeRoot进来的priorityLevel是优先级最高的ImmediatePriority
  var previousPriorityLevel = currentPriorityLevel;
  var previousEventStartTime = currentEventStartTime;
  currentPriorityLevel = priorityLevel;
  currentEventStartTime = now();

  // 开始执行commit函数
  try {
    return eventHandler();
  } finally {

    // 然后恢复现状
    currentPriorityLevel = previousPriorityLevel;
    currentEventStartTime = previousEventStartTime;

    // 处理立即优先级的回调
    flushImmediateWork();
  }
}





function commitRoot(root, finishedWork) {
  // 进入commit阶段

  // 1. 更新一些全局变量，并记录时间
  isWorking = true;
  isCommitting$1 = true;
  startCommitTimer();

  // 拿出pendingCommitExpirationTime也就是之前renderRoot函数内流传的eT
  // 把pendingCommitExpirationTime改回默认值
  var committedExpirationTime = root.pendingCommitExpirationTime;
  root.pendingCommitExpirationTime = NoWork;


  // 2. 找到下一个需要更新的任务的时间
  // 这需要在调用生命周期之前发生，因为它们可能会安排额外的更新。
  // 如果孩子的eT比root本身的eT还要大，将这个过期时间改为孩子的过期时间
  // 然后找出下一个需要更新的任务的过期时间
  // TODO- 首次渲染的时候孩子的eT和root的eT是一样的，都是0，什么时候重设的？
  var updateExpirationTimeBeforeCommit = finishedWork.expirationTime;
  var childExpirationTimeBeforeCommit = finishedWork.childExpirationTime;
  var earliestRemainingTimeBeforeCommit = childExpirationTimeBeforeCommit > updateExpirationTimeBeforeCommit ? childExpirationTimeBeforeCommit : updateExpirationTimeBeforeCommit;
  markCommittedPriorityLevels(root, earliestRemainingTimeBeforeCommit);


  // 1. 更新一些全局变量
  var prevInteractions = null;
  if (enableSchedulerTracing) {
    // Restore any pending interactions at this point,
    // So that cascading work triggered during the render phase will be accounted for.
    prevInteractions = tracing.__interactionsRef.current;
    tracing.__interactionsRef.current = root.memoizedInteractions;
  }

  // Reset this to null before calling lifecycles
  ReactCurrentOwner$2.current = null;


  // 3. 为root附上副作用链，拿到副作用链的第一个副作用
  var firstEffect = void 0;
  if (finishedWork.effectTag > PerformedWork) {
    // 3.1 如果这个root节点存在副作用
    if (finishedWork.lastEffect !== null) {
      // 3.1.1 这个root节点已经在副作用链里面，把自己加上，
      // 现在链条变成：最底层的需要更新的节点——在他之上的节点——root下面一层的函数/类组件节点——root本身
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      // 3.1.2 这个root节点没有副作用链，只有他自己有副作用
      firstEffect = finishedWork;
    }
  } else {
    // 3.2 如果这个root节点不存在副作用
    firstEffect = finishedWork.firstEffect;
  }


  // 4. 记录选区信息
  // 4.1 开始准备提交
  // 记录下事件启用状态（某些事件或操作是否被启用）和
  // 选区信息（例如文本框的文本选中范围），保存在全局变量
  prepareForCommit(root.containerInfo);


  // 5.提交
  // （下面的提交从【最底层的需要更新的节点】开始，firstEffect是【最底层的需要更新的节点】）
  // 5.1 执行前期生命函数（Snapshot生命周期函数）
  // 这些副作用函数会在 DOM 更新完成后、浏览器绘制之前被调用
  nextEffect = firstEffect;
  startCommitSnapshotEffectsTimer();
  while (nextEffect !== null) {
    var didError = false;
    var error = void 0;
    {
      // 以下函数将会进入commitBeforeMutationLifecycles
      invokeGuardedCallback(null, commitBeforeMutationLifecycles, null);
      if (hasCaughtError()) {
        didError = true;
        error = clearCaughtError();
      }
    }
    if (didError) {
      !(nextEffect !== null) ? invariant(false, 'Should have next effect. This error is likely caused by a bug in React. Please file an issue.') : void 0;
      captureCommitPhaseError(nextEffect, error);
      // Clean-up
      if (nextEffect !== null) {
        nextEffect = nextEffect.nextEffect;
      }
    }
  }
  stopCommitSnapshotEffectsTimer();


  // 记录当前的时间，存到commitTime
  if (enableProfilerTimer) {
    // Mark the current commit time to be shared by all Profilers in this batch.
    // This enables them to be grouped later.
    recordCommitTime();
  }


  // 5.2 对页面 DOM 树的直接修改
  // 包括：节点本身插入、删除或更新；节点的属性；修改事件监听器
  nextEffect = firstEffect;
  startCommitHostEffectsTimer();
  while (nextEffect !== null) {
    var _didError = false;
    var _error = void 0;
    {
      invokeGuardedCallback(null, commitAllHostEffects, null);
      if (hasCaughtError()) {
        _didError = true;
        _error = clearCaughtError();
      }
    }
    if (_didError) {
      !(nextEffect !== null) ? invariant(false, 'Should have next effect. This error is likely caused by a bug in React. Please file an issue.') : void 0;
      captureCommitPhaseError(nextEffect, _error);
      // Clean-up
      if (nextEffect !== null) {
        nextEffect = nextEffect.nextEffect;
      }
    }
  }
  stopCommitHostEffectsTimer();


  // 4.2 恢复之前的准备工作（关于选中的范围的记录）
  resetAfterCommit(root.containerInfo);


  root.current = finishedWork;



  // 5.3 执行生命周期函数
  // 包括：componentDidMount/Update
  nextEffect = firstEffect;
  startCommitLifeCyclesTimer();
  while (nextEffect !== null) {
    var _didError2 = false;
    var _error2 = void 0;
    {
      // 传入的参数一个是root对象，一个是root.pendingCommitExpirationTime
      invokeGuardedCallback(null, commitAllLifeCycles, null, root, committedExpirationTime);
      if (hasCaughtError()) {
        _didError2 = true;
        _error2 = clearCaughtError();
      }
    }
    if (_didError2) {
      !(nextEffect !== null) ? invariant(false, 'Should have next effect. This error is likely caused by a bug in React. Please file an issue.') : void 0;
      captureCommitPhaseError(nextEffect, _error2);
      if (nextEffect !== null) {
        nextEffect = nextEffect.nextEffect;
      }
    }
  }



  // 5.4 执行有副作用的调度函数（useEffect钩子函数）
  // 在执行生命周期函数内：
  // if (effectTag & Passive) {
  //   rootWithPendingPassiveEffects = finishedRoot;
  // }
  // 执行了这样一个逻辑：用来标识root对象是否存在被动副作用（例如 useEffect 钩子的副作用）
  // 如果存在的话，就进入调度，然后执行副作用函数，然后直接return
  // 首次渲染会走下面的逻辑
  if (firstEffect !== null && rootWithPendingPassiveEffects !== null) {

    // 这个函数是用来处理 被动副作用（passive effects） 的函数，通常用于处理例如 useEffect 钩子的副作用，这些副作用会在组件渲染后被执行。
    var callback = commitPassiveEffects.bind(null, root, firstEffect);
    if (enableSchedulerTracing) {
      callback = unstable_wrap(callback);
    }

    // 6.1 先执行runWithPriority函数，更新优先级全局变量，
    // 6.2 然后执行unstable_scheduleCallback函数，决定调度方向
    // 6.3 commitPassiveEffects函数放到newNode里面的callback了，执行副作用函数
    passiveEffectCallbackHandle = unstable_runWithPriority(NormalPriority, function () {
      return unstable_scheduleCallback(callback);
    });

    passiveEffectCallback = callback;
  }

  // 6. 更新一些全局变量，停止记录时间！
  isCommitting$1 = false;
  isWorking = false;
  stopCommitLifeCyclesTimer();
  stopCommitTimer();

  // finishedWork.stateNode此时就是root原生DOM树
  // 这里只是保存了一些信息
  onCommitRoot(finishedWork.stateNode);


  if (true && ReactFiberInstrumentation_1.debugTool) {
    ReactFiberInstrumentation_1.debugTool.onCommitWork(finishedWork);
  }

  // 7. 拿到最大的过期时间
  // 如果孩子的eT比root本身的eT还要大，将这个过期时间改为孩子的过期时间
  // 首次渲染两者都是0
  var updateExpirationTimeAfterCommit = finishedWork.expirationTime;
  var childExpirationTimeAfterCommit = finishedWork.childExpirationTime;
  var earliestRemainingTimeAfterCommit = childExpirationTimeAfterCommit > updateExpirationTimeAfterCommit ? childExpirationTimeAfterCommit : updateExpirationTimeAfterCommit;
  if (earliestRemainingTimeAfterCommit === NoWork) {
    // 没有剩余的工作了
    legacyErrorBoundariesThatAlreadyFailed = null;
  }

  onCommit(root, earliestRemainingTimeAfterCommit);



  // 在开发环境下，走下面的逻辑
  if (enableSchedulerTracing) {
    tracing.__interactionsRef.current = prevInteractions;

    var subscriber = void 0;

    // 尝试获取订阅者并进行交互处理
    try {
      subscriber = tracing.__subscriberRef.current;
      if (subscriber !== null && root.memoizedInteractions.size > 0) {
        var threadID = computeThreadID(committedExpirationTime, root.interactionThreadID);
        // 调用 onWorkStopped 方法，通知订阅者当前交互的工作已经停止。
        subscriber.onWorkStopped(root.memoizedInteractions, threadID);
      }
    } catch (error) {
      // It's not safe for commitRoot() to throw.
      // Store the error for now and we'll re-throw in finishRendering().
      if (!hasUnhandledError) {
        hasUnhandledError = true;
        unhandledError = error;
      }
    } finally {
      // 最终清理挂起的交互
      var pendingInteractionMap = root.pendingInteractionMap;
      // root的pendingInteractionMap是一个映射表，
      // 存储了所有挂起的交互信息以及它们的过期时间（scheduledExpirationTime）。
      pendingInteractionMap.forEach(function (scheduledInteractions, scheduledExpirationTime) {
        // 判断当前交互是否已经完成。
        // 如果该交互的过期时间还大于 earliestRemainingTimeAfterCommit（已经是时间最大的），
        // 则表明该交互已经完成
        if (scheduledExpirationTime > earliestRemainingTimeAfterCommit) {
          // 如果该交互已经完成，删除该交互记录
          pendingInteractionMap.delete(scheduledExpirationTime);

          scheduledInteractions.forEach(function (interaction) {
            // 当执行完一个交互时，__count 会减少。
            interaction.__count--;

            if (subscriber !== null && interaction.__count === 0) {
              try {
                // 通知订阅者该交互已经完成。
                subscriber.onInteractionScheduledWorkCompleted(interaction);
              } catch (error) {
                // 如果在调用 onInteractionScheduledWorkCompleted 时发生错误，
                // 会捕获该错误并将其存储在 unhandledError 中，直到 finishRendering() 时再抛出。
                if (!hasUnhandledError) {
                  hasUnhandledError = true;
                  unhandledError = error;
                }
              }
            }
          });
        }
      });
    }
  }
}




function flushImmediateWork() {
  // 处理立即优先级的回调
  if (
  // 确保我们已经退出了所有的回调函数，但是这个时候，宏任务还没执行（比如useEffect的钩子）
  // currentEventStartTime 是当前事件的开始时间，如果它等于 -1，意味着没有正在进行的事件处理器。
  // 确保第一个回调的优先级是 立即优先级
  currentEventStartTime === -1 && firstCallbackNode !== null && firstCallbackNode.priorityLevel === ImmediatePriority) {
    // 标识正在进行中
    isExecutingCallback = true;
    try {
      do {
        // 处理副作用 + 进入新循环（performWork）
        flushFirstCallback();
      } while (
      // Keep flushing until there are no more immediate callbacks
      firstCallbackNode !== null && firstCallbackNode.priorityLevel === ImmediatePriority);
    } finally {
      // 所有紧急任务结束后
      isExecutingCallback = false;

      if (firstCallbackNode !== null) {
        // 还有任务的话（但不是很紧急的），进入宏任务，开始调度
        ensureHostCallbackIsScheduled();
      } else {
        // 没有node任务了
        isHostCallbackScheduled = false;
      }
    }
  }
}



function startCommitTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    isCommitting = true;
    hasScheduledUpdateInCurrentCommit = false;
    labelsInCurrentCommit.clear();
    beginMark('(Committing Changes)');
  }
}

var beginMark = function (markName) {
  performance.mark(formatMarkName(markName));
};





function markCommittedPriorityLevels(root, earliestRemainingTime) {
  root.didError = false;

  // earliestRemainingTime要么是root的eT，要么是root的child的eT

  // 1. 没有优先级，全部变量恢复为nowork
  if (earliestRemainingTime === NoWork) {
    root.earliestPendingTime = NoWork;
    root.latestPendingTime = NoWork;
    root.earliestSuspendedTime = NoWork;
    root.latestSuspendedTime = NoWork;
    root.latestPingedTime = NoWork;
    findNextExpirationTimeToWorkOn(NoWork, root);
    return;
  }

  // 2. 更新新的【被激活】的任务的时间，当前的时间小，优先级大，更新原本的新激活任务时间为0
  if (earliestRemainingTime < root.latestPingedTime) {
    root.latestPingedTime = NoWork;
  }

  // 3. 处理【待处理任务】
  // !为什么当前任务的时间小（优先级高）就把earliestPendingTime和latestPendingTime变为0？之前记录的任务的时间不就被覆盖了吗？
  // 相当于清除待处理任务的状态，换成处理更高优先级的新任务。
  // 虽然会丢失这些信息，但它是基于新的任务激活的优先级来重新进行任务调度的。
  // 如果这些待处理任务的优先级仍然需要被处理，那么它们会被重新标记为待处理任务。
  // !反正每一次都需要重新评估任务的优先级
  var latestPendingTime = root.latestPendingTime;
  if (latestPendingTime !== NoWork) {
    if (latestPendingTime > earliestRemainingTime) {
      // 目前的任务大于晚待处理任务，但是大于早待处理任务吗
      // 目前的优先级大，消除标记
      root.earliestPendingTime = root.latestPendingTime = NoWork;
    } else {
      // 目前的过期时间大，优先级小
      var earliestPendingTime = root.earliestPendingTime;
      if (earliestPendingTime > earliestRemainingTime) {
        // 如果目前的优先级比【早待处理任务】大，而目前的优先级比【晚待处理任务】小，
        // 就把【新待处理任务】赋予【早待处理任务】
        root.earliestPendingTime = root.latestPendingTime;
      }
    }
  }

  // 4. 处理【挂起任务】
  var earliestSuspendedTime = root.earliestSuspendedTime;
  if (earliestSuspendedTime === NoWork) {
    // 没有早挂起任务，直接改为处理Pending任务
    markPendingPriorityLevel(root, earliestRemainingTime);
    findNextExpirationTimeToWorkOn(NoWork, root);
    return;
  }
  var latestSuspendedTime = root.latestSuspendedTime;
  if (earliestRemainingTime < latestSuspendedTime) {
    // 有早挂起任务，且当前的优先级高于晚挂起任务，执行当前的，降低挂起任务和被激活
    root.earliestSuspendedTime = NoWork;
    root.latestSuspendedTime = NoWork;
    root.latestPingedTime = NoWork;

    // 挂起任务恢复为默认
    // 改为处理pending任务
    markPendingPriorityLevel(root, earliestRemainingTime);
    findNextExpirationTimeToWorkOn(NoWork, root);
    return;
  }

  // 有早挂起任务，且当前的优先级低于早挂起任务
  if (earliestRemainingTime > earliestSuspendedTime) {
    // 改为处理pending任务
    markPendingPriorityLevel(root, earliestRemainingTime);
    findNextExpirationTimeToWorkOn(NoWork, root);
    return;
  }

  // 最后再找一遍最优先的下一个任务
  findNextExpirationTimeToWorkOn(NoWork, root);
}



function prepareForCommit(containerInfo) {
  eventsEnabled = isEnabled();
  selectionInformation = getSelectionInformation();
  setEnabled(false);
}


function setEnabled(enabled) {
  _enabled = !!enabled;
}

function isEnabled() {
  return _enabled;
}



function getSelectionInformation() {
  var focusedElem = getActiveElementDeep();
  // 拿到body
  return {
    focusedElem: focusedElem,
    selectionRange: hasSelectionCapabilities(focusedElem) ? getSelection$1(focusedElem) : null
  };
}


function getActiveElementDeep() {
  var win = window;
  // 拿到document的获得输入焦点的元素，比如文本框、按钮、输入框等。
  // 没有的话拿到body
  var element = getActiveElement();
  // 看他是否嵌套的iframe元素
  while (element instanceof win.HTMLIFrameElement) {
    // 如果href有效，就拿到他
    if (isSameOriginFrame(element)) {
      win = element.contentWindow;
    } else {
      return element;
    }
    element = getActiveElement(win.document);
  }
  // 非iframe就使用body
  return element;
}


function getActiveElement(doc) {
  doc = doc || (typeof document !== 'undefined' ? document : undefined);
  if (typeof doc === 'undefined') {
    return null;
  }
  try {
    return doc.activeElement || doc.body;
  } catch (e) {
    return doc.body;
  }
}

function isSameOriginFrame(iframe) {
  try {
    // Accessing the contentDocument of a HTMLIframeElement can cause the browser
    // to throw, e.g. if it has a cross-origin src attribute.
    // Safari will show an error in the console when the access results in "Blocked a frame with origin". e.g:
    // iframe.contentDocument.defaultView;
    // A safety way is to access one of the cross origin properties: Window or Location
    // Which might result in "SecurityError" DOM Exception and it is compatible to Safari.
    // https://html.spec.whatwg.org/multipage/browsers.html#integration-with-idl

    return typeof iframe.contentWindow.location.href === 'string';
  } catch (err) {
    return false;
  }
}


function hasSelectionCapabilities(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName && (nodeName === 'input' && (elem.type === 'text' || elem.type === 'search' || elem.type === 'tel' || elem.type === 'url' || elem.type === 'password') || nodeName === 'textarea' || elem.contentEditable === 'true');
}


function getSelection$1(input) {
  var selection = void 0;

  if ('selectionStart' in input) {
    // Modern browser with input or textarea.
    selection = {
      start: input.selectionStart,
      end: input.selectionEnd
    };
  } else {
    // Content editable or old IE textarea.
    selection = getOffsets(input);
  }

  return selection || { start: 0, end: 0 };
}



function getOffsets(outerNode) {
  var ownerDocument = outerNode.ownerDocument;

  var win = ownerDocument && ownerDocument.defaultView || window;
  var selection = win.getSelection && win.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  var anchorNode = selection.anchorNode,
      anchorOffset = selection.anchorOffset,
      focusNode = selection.focusNode,
      focusOffset = selection.focusOffset;

  // In Firefox, anchorNode and focusNode can be "anonymous divs", e.g. the
  // up/down buttons on an <input type="number">. Anonymous divs do not seem to
  // expose properties, triggering a "Permission denied error" if any of its
  // properties are accessed. The only seemingly possible way to avoid erroring
  // is to access a property that typically works for non-anonymous divs and
  // catch any error that may otherwise arise. See
  // https://bugzilla.mozilla.org/show_bug.cgi?id=208427

  try {
    /* eslint-disable no-unused-expressions */
    anchorNode.nodeType;
    focusNode.nodeType;
    /* eslint-enable no-unused-expressions */
  } catch (e) {
    return null;
  }

  return getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset);
}



function getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset) {
  var length = 0;
  var start = -1;
  var end = -1;
  var indexWithinAnchor = 0;
  var indexWithinFocus = 0;
  var node = outerNode;
  var parentNode = null;

  outer: while (true) {
    var next = null;

    while (true) {
      if (node === anchorNode && (anchorOffset === 0 || node.nodeType === TEXT_NODE)) {
        start = length + anchorOffset;
      }
      if (node === focusNode && (focusOffset === 0 || node.nodeType === TEXT_NODE)) {
        end = length + focusOffset;
      }

      if (node.nodeType === TEXT_NODE) {
        length += node.nodeValue.length;
      }

      if ((next = node.firstChild) === null) {
        break;
      }
      // Moving from `node` to its first child `next`.
      parentNode = node;
      node = next;
    }

    while (true) {
      if (node === outerNode) {
        // If `outerNode` has children, this is always the second time visiting
        // it. If it has no children, this is still the first loop, and the only
        // valid selection is anchorNode and focusNode both equal to this node
        // and both offsets 0, in which case we will have handled above.
        break outer;
      }
      if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset) {
        start = length;
      }
      if (parentNode === focusNode && ++indexWithinFocus === focusOffset) {
        end = length;
      }
      if ((next = node.nextSibling) !== null) {
        break;
      }
      node = parentNode;
      parentNode = node.parentNode;
    }

    // Moving from `node` to its next sibling `next`.
    node = next;
  }

  if (start === -1 || end === -1) {
    // This should never happen. (Would happen if the anchor/focus nodes aren't
    // actually inside the passed-in node.)
    return null;
  }

  return {
    start: start,
    end: end
  };
}



function startCommitSnapshotEffectsTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    effectCountInCurrentCommit = 0;
    beginMark('(Committing Snapshot Effects)');
  }
}



function stopCommitSnapshotEffectsTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    var count = effectCountInCurrentCommit;
    effectCountInCurrentCommit = 0;
    endMark('(Committing Snapshot Effects: ' + count + ' Total)', '(Committing Snapshot Effects)', null);
  }
}


function recordCommitTime() {
  if (!enableProfilerTimer) {
    return;
  }
  commitTime = now();
}



function startCommitHostEffectsTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    effectCountInCurrentCommit = 0;
    beginMark('(Committing Host Effects)');
  }
}




// REVIEW - commitRoot函数中的【提交】的第一步：执行前期生命函数
// （Snapshot生命周期函数）




function commitBeforeMutationLifecycles() {
  while (nextEffect !== null) {
    // 更新一下全局变量
    {
      setCurrentFiber(nextEffect);
    }

    // 拿到当前effect节点的副作用
    var effectTag = nextEffect.effectTag;
    // 当前 Fiber 节点的副作用类型是 "Snapshot"
    // Snapshot 是指应用更新之前需要执行的副作用。
    if (effectTag & Snapshot) {
      // 记录副作用的数量
      recordEffect();
      var current$$1 = nextEffect.alternate;
      // 执行类组件snapshot的函数，memo组件的挂载和卸载的函数
      commitBeforeMutationLifeCycles(current$$1, nextEffect);
    }

    nextEffect = nextEffect.nextEffect;
  }

  // 恢复全局变量
  {
    resetCurrentFiber();
  }
}


function recordEffect() {
  if (enableUserTimingAPI) {
    effectCountInCurrentCommit++;
  }
}



function commitBeforeMutationLifeCycles(current$$1, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent:
      {
        commitHookEffectList(UnmountSnapshot, NoEffect$1, finishedWork);
        return;
      }
    case ClassComponent:
      {
        if (finishedWork.effectTag & Snapshot) {
          if (current$$1 !== null) {
            var prevProps = current$$1.memoizedProps;
            var prevState = current$$1.memoizedState;
            // 记录时间，getSnapshotBeforeUpdate函数的执行时间+
            startPhaseTimer(finishedWork, 'getSnapshotBeforeUpdate');
            // 拿到类组件的对象
            var instance = finishedWork.stateNode;

            {
              if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                !(instance.props === finishedWork.memoizedProps) ? warning$1(false, 'Expected %s props to match memoized props before ' + 'getSnapshotBeforeUpdate. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance') : void 0;
                !(instance.state === finishedWork.memoizedState) ? warning$1(false, 'Expected %s state to match memoized state before ' + 'getSnapshotBeforeUpdate. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance') : void 0;
              }
            }
            // 执行getSnapshotBeforeUpdate生命周期函数，DOM构建完成，还没绘制在页面上！
            var snapshot = instance.getSnapshotBeforeUpdate(finishedWork.elementType === finishedWork.type ? prevProps : resolveDefaultProps(finishedWork.type, prevProps), prevState);
            {
              var didWarnSet = didWarnAboutUndefinedSnapshotBeforeUpdate;
              if (snapshot === undefined && !didWarnSet.has(finishedWork.type)) {
                didWarnSet.add(finishedWork.type);
                warningWithoutStack$1(false, '%s.getSnapshotBeforeUpdate(): A snapshot value (or null) ' + 'must be returned. You have returned undefined.', getComponentName(finishedWork.type));
              }
            }
            // 把结果保存起来，到类对象的一个属性里面
            instance.__reactInternalSnapshotBeforeUpdate = snapshot;
            stopPhaseTimer();
          }
        }
        return;
      }
    case HostRoot:
    case HostComponent:
    case HostText:
    case HostPortal:
    case IncompleteClassComponent:
      // Nothing to do for these component types
      return;
    default:
      {
        invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
      }
  }
}




function startPhaseTimer(fiber, phase) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    clearPendingPhaseMeasurement();
    if (!beginFiberMark(fiber, phase)) {
      return;
    }
    currentPhaseFiber = fiber;
    currentPhase = phase;
  }
}


function stopPhaseTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    if (currentPhase !== null && currentPhaseFiber !== null) {
      var warning = hasScheduledUpdateInCurrentPhase ? 'Scheduled a cascading update' : null;
      endFiberMark(currentPhaseFiber, currentPhase, warning);
    }
    currentPhase = null;
    currentPhaseFiber = null;
  }
}



var beginFiberMark = function (fiber, phase) {
  var componentName = getComponentName(fiber.type) || 'Unknown';
  var debugID = fiber._debugID;
  var isMounted = fiber.alternate !== null;
  var label = getFiberLabel(componentName, isMounted, phase);

  if (isCommitting && labelsInCurrentCommit.has(label)) {
    // During the commit phase, we don't show duplicate labels because
    // there is a fixed overhead for every measurement, and we don't
    // want to stretch the commit phase beyond necessary.
    return false;
  }
  labelsInCurrentCommit.add(label);

  var markName = getFiberMarkName(label, debugID);
  beginMark(markName);
  return true;
};




function commitHookEffectList(unmountTag, mountTag, finishedWork) {
  // 处理副作用链上每个fiber的挂载（mount）和卸载（unmount）时的副作用
  // 也就是执行useEffect函数，挂载和卸载
  var updateQueue = finishedWork.updateQueue;
  // 这个就是componentUpdateQueue，长这样 { lastEffect: effect对象的链表的最后一个 }
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  // 这个effect指的是下面这个对象
  // var effect = {
  //   tag: tag,
  //   create: create,
  //   destroy: destroy,
  //   deps: deps,
  //   next: null
  // };

  // 然后整个链表都要执行create函数，也就是useEffect钩子里面的函数
  if (lastEffect !== null) {
    var firstEffect = lastEffect.next;
    var effect = firstEffect;
    do {
      // 卸载
      if ((effect.tag & unmountTag) !== NoEffect$1) {
        // Unmount
        var destroy = effect.destroy;
        effect.destroy = undefined;
        if (destroy !== undefined) {
          destroy();
        }
      }

      // 挂载
      if ((effect.tag & mountTag) !== NoEffect$1) {
        // Mount
        var create = effect.create;
        // 执行完之后，把返回值保存到这个effect对象的destroy属性里面
        effect.destroy = create();

        {
          var _destroy = effect.destroy;
          if (_destroy !== undefined && typeof _destroy !== 'function') {
            var addendum = void 0;
            if (_destroy === null) {
              addendum = ' You returned null. If your effect does not require clean ' + 'up, return undefined (or nothing).';
            } else if (typeof _destroy.then === 'function') {
              addendum = '\n\nIt looks like you wrote useEffect(async () => ...) or returned a Promise. ' + 'Instead, write the async function inside your effect ' + 'and call it immediately:\n\n' + 'useEffect(() => {\n' + '  async function fetchData() {\n' + '    // You can await here\n' + '    const response = await MyAPI.getData(someId);\n' + '    // ...\n' + '  }\n' + '  fetchData();\n' + '}, [someId]); // Or [] if effect doesn\'t need props or state\n\n' + 'Learn more about data fetching with Hooks: https://fb.me/react-hooks-data-fetching';
            } else {
              addendum = ' You returned: ' + _destroy;
            }
            warningWithoutStack$1(false, 'An effect function must not return anything besides a function, ' + 'which is used for clean-up.%s%s', addendum, getStackByFiberInDevAndProd(finishedWork));
          }
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}





// REVIEW - commitRoot函数中的【提交】的第二步：操作原生DOM，在页面上显示DOM内容




function commitAllHostEffects() {
  while (nextEffect !== null) {
    // 设置全局变量
    {
      setCurrentFiber(nextEffect);
    }
    // 记录副作用的数量
    recordEffect();

    var effectTag = nextEffect.effectTag;

    // 1. 如果是ContentReset的副作用
    // 把替身的原生节点的text内容设置为空！
    if (effectTag & ContentReset) {
      commitResetTextContent(nextEffect);
    }

    // 2. 如果是ref副作用，把替身的ref设为null
    if (effectTag & Ref) {
      var current$$1 = nextEffect.alternate;
      if (current$$1 !== null) {
        commitDetachRef(current$$1);
      }
    }

    // 3. 副作用是三个中的一个，操作原生DOM
    // !可是之前在commitRoot那里不是已经把原生的DOM设置好内容和属性放到父亲的DOM上面了吗
    // 在首次渲染阶段，最底层节点的primaryEffectTag为0，不走下面
    // （首次渲染，函数/类组件下面的原生标签的stateNode已经有完整内容了，只是root对象的containerInfo只有root自己的原生DOM）
    // 而root下面的函数/类组件走的是PlacementAndUpdate
    var primaryEffectTag = effectTag & (Placement | Update | Deletion);
    switch (primaryEffectTag) {
      case Placement:
        {
          commitPlacement(nextEffect);
          nextEffect.effectTag &= ~Placement;
          break;
        }
      case PlacementAndUpdate:
        {
          // 新插入（这个时候的页面已经显示了）
          commitPlacement(nextEffect);
          // 清掉Placement的标识
          nextEffect.effectTag &= ~Placement;

          // 更新state或者props
          var _current = nextEffect.alternate;
          commitWork(_current, nextEffect);
          break;
        }
      case Update:
        {
          var _current2 = nextEffect.alternate;
          commitWork(_current2, nextEffect);
          break;
        }
      case Deletion:
        {
          commitDeletion(nextEffect);
          break;
        }
    }
    nextEffect = nextEffect.nextEffect;
  }

  // 全局变量恢复默认值
  {
    resetCurrentFiber();
  }
}





function commitResetTextContent(current$$1) {
  if (!supportsMutation) {
    return;
  }
  resetTextContent(current$$1.stateNode);
}

function resetTextContent(domElement) {
  setTextContent(domElement, '');
}

var setTextContent = function (node, text) {
  if (text) {
    var firstChild = node.firstChild;

    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
};



function commitDetachRef(current$$1) {
  var currentRef = current$$1.ref;
  if (currentRef !== null) {
    // 执行ref的函数
    if (typeof currentRef === 'function') {
      currentRef(null);
    } else {
      // 不然ref是{ current: initialValue }，
      // 那么把旧的ref的current设为null
      currentRef.current = null;
    }
  }
}


function commitPlacement(finishedWork) {
  if (!supportsMutation) {
    return;
  }

  // 1. 拿到最顶层的根节点
  var parentFiber = getHostParentFiber(finishedWork);

  // Note: these two variables *must* always be updated together.
  var parent = void 0;
  var isContainer = void 0;

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentFiber.stateNode;
      isContainer = false;
      break;
    case HostRoot:
      parent = parentFiber.stateNode.containerInfo;
      isContainer = true;
      break;
    case HostPortal:
      parent = parentFiber.stateNode.containerInfo;
      isContainer = true;
      break;
    default:
      invariant(false, 'Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.');
  }

  // 如果root节点是重置文本的副作用，执行函数
  if (parentFiber.effectTag & ContentReset) {
    // Reset the text content of the parent before doing any insertions
    resetTextContent(parent);
    // 重置副作用
    parentFiber.effectTag &= ~ContentReset;
  }

  // 2. 找到兄弟节点的原生DOM
  var before = getHostSibling(finishedWork);

  
  // 3. 开始绘制页面
  var node = finishedWork;
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      // 当前的节点是原生的节点
      if (before) {
        // 有兄弟节点的指示
        if (isContainer) {
          // 在root层级的原生节点
          insertInContainerBefore(parent, node.stateNode, before);
        } else {
          // 普通原生节点
          insertBefore(parent, node.stateNode, before);
        }
      } else {
        // 没有兄弟节点的指示
        if (isContainer) {
          appendChildToContainer(parent, node.stateNode);
        } else {
          appendChild(parent, node.stateNode);
        }
      }
    } else if (node.tag === HostPortal) {
      // nope
    } else if (node.child !== null) {
      // 当前的节点还有大儿子，非底层节点，首先继续往下寻找
      node.child.return = node;
      node = node.child;
      continue;
    }

    // 当遍历结束，node回到了原点
    if (node === finishedWork) {
      return;
    }

    // 最后如果没有兄弟节点，就往上找，然后往右边找
    while (node.sibling === null) {
      // 如果已经到头了，没有兄弟，没有儿子，父亲也是开始的那个fiber，回去commitAllHostEffects
      if (node.return === null || node.return === finishedWork) {
        return;
      }
      node = node.return;
    }
    // 往底层找不到了，接着往右边找
    node.sibling.return = node.return;
    node = node.sibling;
  }
}


function getHostParentFiber(fiber) {
  var parent = fiber.return;
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
  invariant(false, 'Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.');
}

function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot || fiber.tag === HostPortal;
}



function getHostSibling(fiber) {
  // 找兄弟的原生节点
  var node = fiber;
  // 使用 siblings 标签来实现跳过不合适的节点并继续在兄弟节点中搜索。
  siblings: while (true) {
    // 1. 拿到最近的兄弟节点
    // 没有sibling的时候，往上找，看能否找到，直到找到为止
    while (node.sibling === null) {
      // 如果父亲为null或到了根节点，返回null
      if (node.return === null || isHostParent(node.return)) {
        return null;
      }
      node = node.return;
    }
    node.sibling.return = node.return;

    // 拿到最近的兄弟
    node = node.sibling;

    // 2. 继续遍历兄弟节点直到找到宿主节点
    while (node.tag !== HostComponent && node.tag !== HostText && node.tag !== DehydratedSuspenseComponent) {
      // 处理兄弟的副作用
      if (node.effectTag & Placement) {
        // 如果当前节点的 effectTag 包含 Placement，
        // 这意味着该节点是新创建的，尚未添加到树中，需要跳过它。
        // 回到外层的大循环！
        continue siblings;
      }
      // 兄弟没有副作用
      // 兄弟没有孩子，到了最底层了，但又不是原生节点，因此还要继续往右边走
      // 需要跳过它，继续搜索兄弟节点
      // 回到外层的大循环！
      if (node.child === null || node.tag === HostPortal) {
        continue siblings;
      } else {
        // 兄弟有孩子，处理兄弟的孩子，继续往底层往下寻找
        node.child.return = node;
        node = node.child;
      }
    }
    // 如果找到了原生的宿主节点，且并非新增的一个节点
    if (!(node.effectTag & Placement)) {
      // 返回他的原生DOM
      return node.stateNode;
    }
  }
}




function insertInContainerBefore(container, child, beforeChild) {
  // container是root的原生DOM，
  // child是当前的有副作用的fiber的原生的DOM，
  // beforeChild是兄弟节点的原生DOM，也就是此时的fiber需要插入到这个的前面
  if (container.nodeType === COMMENT_NODE) {
    // 注释节点的话插入到其父亲的孩子里
    container.parentNode.insertBefore(child, beforeChild);
  } else {
    container.insertBefore(child, beforeChild);
  }
}


function insertBefore(parentInstance, child, beforeChild) {
  parentInstance.insertBefore(child, beforeChild);
}



function appendChildToContainer(container, child) {
  var parentNode = void 0;
  if (container.nodeType === COMMENT_NODE) {
    parentNode = container.parentNode;
    parentNode.insertBefore(child, container);
  } else {
    parentNode = container;
    parentNode.appendChild(child);
  }
  // 下面在干嘛？？
  var reactRootContainer = container._reactRootContainer;
  if ((reactRootContainer === null || reactRootContainer === undefined) && parentNode.onclick === null) {
    // This cast may not be sound for SVG, MathML or custom elements.
    trapClickOnNonInteractiveElement(parentNode);
  }
}

function appendChild(parentInstance, child) {
  parentInstance.appendChild(child);
}




function commitWork(current$$1, finishedWork) {
  // 是否支持突变
  // true表示该渲染器支持直接修改 DOM 的操作。这适用于大多数基于 DOM 的更新，如直接更新页面上的元素。
  // false则意味着该渲染器不支持直接操作 DOM，可能使用像 协调（reconciliation） 或 虚拟 DOM 来处理状态的变更，具体的更新会以不同的方式提交。
  // 首次渲染为false
  if (!supportsMutation) {
    switch (finishedWork.tag) {
      case FunctionComponent:
      case ForwardRef:
      case MemoComponent:
      case SimpleMemoComponent:
        {
          commitHookEffectList(UnmountMutation, MountMutation, finishedWork);
          return;
        }
    }

    commitContainer(finishedWork);
    return;
  }

  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent:
      {
        commitHookEffectList(UnmountMutation, MountMutation, finishedWork);
        return;
      }
    case ClassComponent:
      {
        return;
      }
    case HostComponent:
      {
        var instance = finishedWork.stateNode;
        if (instance != null) {
          // Commit the work prepared earlier.
          var newProps = finishedWork.memoizedProps;
          // For hydration we reuse the update path but we treat the oldProps
          // as the newProps. The updatePayload will contain the real change in
          // this case.
          var oldProps = current$$1 !== null ? current$$1.memoizedProps : newProps;
          var type = finishedWork.type;
          var updatePayload = finishedWork.updateQueue;
          finishedWork.updateQueue = null;
          // 提交更新
          if (updatePayload !== null) {
            commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork);
          }
        }
        return;
      }
    case HostText:
      {
        !(finishedWork.stateNode !== null) ? invariant(false, 'This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.') : void 0;
        var textInstance = finishedWork.stateNode;
        var newText = finishedWork.memoizedProps;
        var oldText = current$$1 !== null ? current$$1.memoizedProps : newText;
        commitTextUpdate(textInstance, oldText, newText);
        return;
      }
    case HostRoot:
      {
        return;
      }
    case Profiler:
      {
        return;
      }
    case SuspenseComponent:
      {
        var newState = finishedWork.memoizedState;

        var newDidTimeout = void 0;
        var primaryChildParent = finishedWork;
        if (newState === null) {
          newDidTimeout = false;
        } else {
          newDidTimeout = true;
          primaryChildParent = finishedWork.child;
          if (newState.timedOutAt === NoWork) {
            // If the children had not already timed out, record the time.
            // This is used to compute the elapsed time during subsequent
            // attempts to render the children.
            newState.timedOutAt = requestCurrentTime();
          }
        }

        if (primaryChildParent !== null) {
          hideOrUnhideAllChildren(primaryChildParent, newDidTimeout);
        }

        // If this boundary just timed out, then it will have a set of thenables.
        // For each thenable, attach a listener so that when it resolves, React
        // attempts to re-render the boundary in the primary (pre-timeout) state.
        var thenables = finishedWork.updateQueue;
        if (thenables !== null) {
          finishedWork.updateQueue = null;
          var retryCache = finishedWork.stateNode;
          if (retryCache === null) {
            retryCache = finishedWork.stateNode = new PossiblyWeakSet$1();
          }
          thenables.forEach(function (thenable) {
            // Memoize using the boundary fiber to prevent redundant listeners.
            var retry = retryTimedOutBoundary.bind(null, finishedWork, thenable);
            if (enableSchedulerTracing) {
              retry = unstable_wrap(retry);
            }
            if (!retryCache.has(thenable)) {
              retryCache.add(thenable);
              thenable.then(retry, retry);
            }
          });
        }

        return;
      }
    case IncompleteClassComponent:
      {
        return;
      }
    default:
      {
        invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
      }
  }
}


function commitUpdate(domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
  // Update the props handle so that we know which props are the ones with
  // with current event handlers.
  updateFiberProps(domElement, newProps);
  // Apply the diff to the DOM node.
  updateProperties(domElement, updatePayload, type, oldProps, newProps);
}



function updateProperties(domElement, updatePayload, tag, lastRawProps, nextRawProps) {
  // Update checked *before* name.
  // In the middle of an update, it is possible to have multiple checked.
  // When a checked radio tries to change name, browser makes another radio's checked false.
  if (tag === 'input' && nextRawProps.type === 'radio' && nextRawProps.name != null) {
    updateChecked(domElement, nextRawProps);
  }

  var wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
  var isCustomComponentTag = isCustomComponent(tag, nextRawProps);
  // Apply the diff.
  updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag);

  // Ensure that an update gets scheduled if any of the special props
  // changed.
  switch (tag) {
    case 'input':
      // Update the wrapper around inputs *after* updating props. This has to
      // happen after `updateDOMProperties`. Otherwise HTML5 input validations
      // raise warnings and prevent the new value from being assigned.
      updateWrapper(domElement, nextRawProps);
      break;
    case 'textarea':
      updateWrapper$1(domElement, nextRawProps);
      break;
    case 'select':
      // <select> value update needs to occur after <option> children
      // reconciliation
      postUpdateWrapper(domElement, nextRawProps);
      break;
  }
}


function stopCommitHostEffectsTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    var count = effectCountInCurrentCommit;
    effectCountInCurrentCommit = 0;
    endMark('(Committing Host Effects: ' + count + ' Total)', '(Committing Host Effects)', null);
  }
}



function resetAfterCommit(containerInfo) {
  restoreSelection(selectionInformation);
  selectionInformation = null;
  setEnabled(eventsEnabled);
  eventsEnabled = null;
}


function restoreSelection(priorSelectionInformation) {
  var curFocusedElem = getActiveElementDeep();
  var priorFocusedElem = priorSelectionInformation.focusedElem;
  var priorSelectionRange = priorSelectionInformation.selectionRange;
  if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
    if (priorSelectionRange !== null && hasSelectionCapabilities(priorFocusedElem)) {
      setSelection(priorFocusedElem, priorSelectionRange);
    }

    // Focusing a node can change the scroll position, which is undesirable
    var ancestors = [];
    var ancestor = priorFocusedElem;
    while (ancestor = ancestor.parentNode) {
      if (ancestor.nodeType === ELEMENT_NODE) {
        ancestors.push({
          element: ancestor,
          left: ancestor.scrollLeft,
          top: ancestor.scrollTop
        });
      }
    }

    if (typeof priorFocusedElem.focus === 'function') {
      priorFocusedElem.focus();
    }

    for (var i = 0; i < ancestors.length; i++) {
      var info = ancestors[i];
      info.element.scrollLeft = info.left;
      info.element.scrollTop = info.top;
    }
  }
}


function setSelection(input, offsets) {
  var start = offsets.start,
      end = offsets.end;

  if (end === undefined) {
    end = start;
  }

  if ('selectionStart' in input) {
    input.selectionStart = start;
    input.selectionEnd = Math.min(end, input.value.length);
  } else {
    setOffsets(input, offsets);
  }
}





// REVIEW - commitRoot函数中的【提交】的第三步：执行其他生命周期函数
// 包括





function commitAllLifeCycles(finishedRoot, committedExpirationTime) {
  // 一些警告信息
  {
    ReactStrictModeWarnings.flushPendingUnsafeLifecycleWarnings();
    ReactStrictModeWarnings.flushLegacyContextWarning();

    if (warnAboutDeprecatedLifecycles) {
      ReactStrictModeWarnings.flushPendingDeprecationWarnings();
    }
  }
  // 开始遍历副作用链
  while (nextEffect !== null) {
    // 重设全局信息
    {
      setCurrentFiber(nextEffect);
    }
    var effectTag = nextEffect.effectTag;

    // 如果是更新或执行回调
    if (effectTag & (Update | Callback)) {
      recordEffect();
      var current$$1 = nextEffect.alternate;
      // 执行生命周期函数
      // finishedRoot是root对象
      commitLifeCycles(finishedRoot, current$$1, nextEffect, committedExpirationTime);
    }

    // 如果是ref，重新为ref对象的current附上属性
    if (effectTag & Ref) {
      recordEffect();
      commitAttachRef(nextEffect);
    }

    if (effectTag & Passive) {
      rootWithPendingPassiveEffects = finishedRoot;
    }

    nextEffect = nextEffect.nextEffect;
  }
  {
    resetCurrentFiber();
  }
}




function commitLifeCycles(finishedRoot, current$$1, finishedWork, committedExpirationTime) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent:
      // 第二个节点（root下面的大组件）是这个类型
      {
        commitHookEffectList(UnmountLayout, MountLayout, finishedWork);
        break;
      }
    case ClassComponent:
      {
        var instance = finishedWork.stateNode;
        // 如果是更新的副作用
        if (finishedWork.effectTag & Update) {

          // 1. 执行挂载或更新函数
          if (current$$1 === null) {
            // 如果是首次渲染
            startPhaseTimer(finishedWork, 'componentDidMount');

            {
              if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                !(instance.props === finishedWork.memoizedProps) ? warning$1(false, 'Expected %s props to match memoized props before ' + 'componentDidMount. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance') : void 0;
                !(instance.state === finishedWork.memoizedState) ? warning$1(false, 'Expected %s state to match memoized state before ' + 'componentDidMount. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance') : void 0;
              }
            }
            // 执行componentDidMount函数，这个时候DOM已经展现在页面上了
            instance.componentDidMount();
            stopPhaseTimer();
          } else {
            // 如果不是首次渲染

            var prevProps = finishedWork.elementType === finishedWork.type ? current$$1.memoizedProps : resolveDefaultProps(finishedWork.type, current$$1.memoizedProps);
            var prevState = current$$1.memoizedState;
            startPhaseTimer(finishedWork, 'componentDidUpdate');

            {
              if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                !(instance.props === finishedWork.memoizedProps) ? warning$1(false, 'Expected %s props to match memoized props before ' + 'componentDidUpdate. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance') : void 0;
                !(instance.state === finishedWork.memoizedState) ? warning$1(false, 'Expected %s state to match memoized state before ' + 'componentDidUpdate. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance') : void 0;
              }
            }
            // 执行componentDidUpdate函数
            instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate);
            stopPhaseTimer();
          }
        }

        // 2. 把更新提交一下
        var updateQueue = finishedWork.updateQueue;
        if (updateQueue !== null) {
          {
            if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
              !(instance.props === finishedWork.memoizedProps) ? warning$1(false, 'Expected %s props to match memoized props before ' + 'processing the update queue. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance') : void 0;
              !(instance.state === finishedWork.memoizedState) ? warning$1(false, 'Expected %s state to match memoized state before ' + 'processing the update queue. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance') : void 0;
            }
          }

          commitUpdateQueue(finishedWork, updateQueue, instance, committedExpirationTime);
        }
        return;
      }
    case HostRoot:
      {
        var _updateQueue = finishedWork.updateQueue;
        if (_updateQueue !== null) {

          // 1. 如果root下面是原生节点或者是类组件，就更新一下_instance的值
          var _instance = null;
          if (finishedWork.child !== null) {
            switch (finishedWork.child.tag) {
              case HostComponent:
                _instance = getPublicInstance(finishedWork.child.stateNode);
                break;
              case ClassComponent:
                _instance = finishedWork.child.stateNode;
                break;
            }
          }

          // 2. 把更新提交一下
          commitUpdateQueue(finishedWork, _updateQueue, _instance, committedExpirationTime);
        }
        return;
      }
    case HostComponent:
      {
        var _instance2 = finishedWork.stateNode;

        // Renderers may schedule work to be done after host components are mounted
        // (eg DOM renderer may schedule auto-focus for inputs and form controls).
        // These effects should only be committed when components are first mounted,
        // aka when there is no current/alternate.
        if (current$$1 === null && finishedWork.effectTag & Update) {
          var type = finishedWork.type;
          var props = finishedWork.memoizedProps;
          commitMount(_instance2, type, props, finishedWork);
        }

        return;
      }
    case HostText:
      {
        // We have no life-cycles associated with text.
        return;
      }
    case HostPortal:
      {
        // We have no life-cycles associated with portals.
        return;
      }
      case Profiler:
        {
          if (enableProfilerTimer) {
            var onRender = finishedWork.memoizedProps.onRender;
  
            if (enableSchedulerTracing) {
              onRender(finishedWork.memoizedProps.id, current$$1 === null ? 'mount' : 'update', finishedWork.actualDuration, finishedWork.treeBaseDuration, finishedWork.actualStartTime, getCommitTime(), finishedRoot.memoizedInteractions);
            } else {
              onRender(finishedWork.memoizedProps.id, current$$1 === null ? 'mount' : 'update', finishedWork.actualDuration, finishedWork.treeBaseDuration, finishedWork.actualStartTime, getCommitTime());
            }
          }
          return;
        }
      case SuspenseComponent:
        break;
      case IncompleteClassComponent:
        break;
      default:
        {
          invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
        }
  }
}




function commitUpdateQueue(finishedWork, finishedQueue, instance, renderExpirationTime) {
  // 参数：finishedQueue是finishedWork.updateQueue
  
  // 如果有已经抓住的更新firstCapturedUpdate，说明也有lastCapturedUpdate，
  // 整个CapturedUpdate放到链表的末尾
  if (finishedQueue.firstCapturedUpdate !== null) {
    // Join the captured update list to the end of the normal list.
    if (finishedQueue.lastUpdate !== null) {
      finishedQueue.lastUpdate.next = finishedQueue.firstCapturedUpdate;
      finishedQueue.lastUpdate = finishedQueue.lastCapturedUpdate;
    }
    // 然后清空这个链表
    finishedQueue.firstCapturedUpdate = finishedQueue.lastCapturedUpdate = null;
  }

  // 执行更新
  commitUpdateEffects(finishedQueue.firstEffect, instance);
  // 相关属性恢复默认值
  finishedQueue.firstEffect = finishedQueue.lastEffect = null;

  commitUpdateEffects(finishedQueue.firstCapturedEffect, instance);
  finishedQueue.firstCapturedEffect = finishedQueue.lastCapturedEffect = null;
}


function commitUpdateEffects(effect, instance) {
  // effect是更新对象，instance是真实DOM
  // 依次执行更新队列里面的更新对象的callback函数
  while (effect !== null) {
    var _callback3 = effect.callback;
    if (_callback3 !== null) {
      effect.callback = null;
      callCallback(_callback3, instance);
    }
    effect = effect.nextEffect;
  }
}


function callCallback(callback, context) {
  !(typeof callback === 'function') ? invariant(false, 'Invalid argument passed as callback. Expected a function. Instead received: %s', callback) : void 0;
  callback.call(context);
}





function commitAttachRef(finishedWork) {
  var ref = finishedWork.ref;
  if (ref !== null) {
    var instance = finishedWork.stateNode;
    var instanceToUse = void 0;
    switch (finishedWork.tag) {
      case HostComponent:
        instanceToUse = getPublicInstance(instance);
        break;
      default:
        instanceToUse = instance;
    }
    if (typeof ref === 'function') {
      ref(instanceToUse);
    } else {
      {
        if (!ref.hasOwnProperty('current')) {
          warningWithoutStack$1(false, 'Unexpected ref object provided for %s. ' + 'Use either a ref-setter function or React.createRef().%s', getComponentName(finishedWork.type), getStackByFiberInDevAndProd(finishedWork));
        }
      }

      ref.current = instanceToUse;
    }
  }
}


// 为回调函数提供了一个“包装器”，并跟踪该函数执行过程中相关交互的工作
function unstable_wrap(callback) {
  // threadID 是可选参数，如果未传递则默认为 DEFAULT_THREAD_ID。它表示工作线程的 ID，用于区分不同的工作线程。
  var threadID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_THREAD_ID;

  // 如果未启用调度跟踪，函数直接返回原始的 callback，不进行任何包装和跟踪。
  if (!enableSchedulerTracing) {
    return callback;
  }

  // 获取当前的交互和订阅者
  var wrappedInteractions = exports.__interactionsRef.current;
  var subscriber = exports.__subscriberRef.current;

  // 存在一个调度的订阅者，则调用 onWorkScheduled 方法，
  // 告知订阅者当前的工作（由 wrappedInteractions 代表）已经计划好，并传递 threadID。
  if (subscriber !== null) {
    subscriber.onWorkScheduled(wrappedInteractions, threadID);
  }


  // wrappedInteractions 是当前的交互数组，interaction.__count++ 会将每个交互的计数器递增。
  // 这个计数器用来追踪每个交互的工作状态。工作开始时，计数器会增加，工作完成时，计数器会减少
  wrappedInteractions.forEach(function (interaction) {
    interaction.__count++;
  });

  var hasRun = false;

  // wrapped 函数是包装的实际工作回调。它会执行 callback，并在执行过程中进行状态管理
  function wrapped() {
    var prevInteractions = exports.__interactionsRef.current;
    exports.__interactionsRef.current = wrappedInteractions;

    subscriber = exports.__subscriberRef.current;

    try {
      var returnValue = void 0;

      try {
        if (subscriber !== null) {
          // 如果存在 subscriber，则通知它工作已开始
          subscriber.onWorkStarted(wrappedInteractions, threadID);
        }
      } finally {
        // 执行回调函数
        try {
          returnValue = callback.apply(undefined, arguments);
        } finally {
          exports.__interactionsRef.current = prevInteractions;
          // 通知工作已结束
          if (subscriber !== null) {
            subscriber.onWorkStopped(wrappedInteractions, threadID);
          }
        }
      }

      return returnValue;
    } finally {
      if (!hasRun) {
        // We only expect a wrapped function to be executed once,
        // But in the event that it's executed more than once–
        // Only decrement the outstanding interaction counts once.
        hasRun = true;

        // 更新交互的计数
        wrappedInteractions.forEach(function (interaction) {
          interaction.__count--;

          if (subscriber !== null && interaction.__count === 0) {
            subscriber.onInteractionScheduledWorkCompleted(interaction);
          }
        });
      }
    }
  }

  wrapped.cancel = function cancel() {
    subscriber = exports.__subscriberRef.current;

    try {
      if (subscriber !== null) {
        subscriber.onWorkCanceled(wrappedInteractions, threadID);
      }
    } finally {
      // Update pending async counts for all wrapped interactions.
      // If this was the last scheduled async work for any of them,
      // Mark them as completed.
      wrappedInteractions.forEach(function (interaction) {
        interaction.__count--;

        if (subscriber && interaction.__count === 0) {
          subscriber.onInteractionScheduledWorkCompleted(interaction);
        }
      });
    }
  };

  return wrapped;
}




// REVIEW - commitRoot函数中的【提交】的最后一个步骤：调度 + useEffect函数执行
// 仅供有使用useEffect钩子的函数使用，然后顺便调度了





function unstable_scheduleCallback(callback, deprecated_options) {
  // 将回调任务调度到一个任务队列，并根据优先级和过期时间对任务进行排序
  var startTime = currentEventStartTime !== -1 ? currentEventStartTime : now();
  var expirationTime;

  // 1. 根据当前任务的优先级 (currentPriorityLevel) 来确定 expirationTime。
  // 不同优先级的任务有不同的过期时间
  if (typeof deprecated_options === 'object' && deprecated_options !== null && typeof deprecated_options.timeout === 'number') {
    expirationTime = startTime + deprecated_options.timeout;
  } else {
    // 首次渲染没有输入deprecated_options参数
    switch (currentPriorityLevel) {
      case ImmediatePriority:
        expirationTime = startTime + IMMEDIATE_PRIORITY_TIMEOUT;
        break;
      case UserBlockingPriority:
        expirationTime = startTime + USER_BLOCKING_PRIORITY;
        break;
      case IdlePriority:
        expirationTime = startTime + IDLE_PRIORITY;
        break;
      case LowPriority:
        expirationTime = startTime + LOW_PRIORITY_TIMEOUT;
        break;
      case NormalPriority:
      default:
        expirationTime = startTime + NORMAL_PRIORITY_TIMEOUT;
    }
  }

  // 2. 创建一个新的回调节点
  // 这里的callback是commitPassiveEffects.bind(null, root, firstEffect)函数
  var newNode = {
    callback: callback,
    priorityLevel: currentPriorityLevel,
    expirationTime: expirationTime,
    next: null,
    previous: null
  };

  // 3.将新节点插入到任务队列（有序）
  // 首次渲染为null
  if (firstCallbackNode === null) {
    // 建立环形链表
    firstCallbackNode = newNode.next = newNode.previous = newNode;
    // 确保宿主函数正在调用中（后台）
    // 如果任务队列为空且有新的回调任务被调度进来，启动调度系统，
    ensureHostCallbackIsScheduled();
  } else {
    // 二更
    // 使用指针，将新节点按照时间的从小到大的顺序插入（很像排序，但也不是排序！）
    // （1.找到所在位置的后一个
    var next = null;
    var node = firstCallbackNode;
    do {
      if (node.expirationTime > expirationTime) {
        // 当前newNode的任务的时间小于某个node，优先级大
        // 停止，找到了需要插入的位置（插入在这个node的前面）
        next = node;
        break;
      }
      // 如果当前newNode的任务的时间大，优先级小
      // 继续往下走
      // 直到当前的时间小，或者走到末尾了
      node = node.next;
    } while (node !== firstCallbackNode);

    // （2. 处理找不到的情况 或者 某些情况下，一些变量需要调整
    // 此时的next要么是
    // （1）null，环形链到头了，而next一直没有被赋值。这里的话说明newNode的时间是最大的，要放在末尾
    // next就变为这个末尾的后一个，相当于插入在firstCallbackNode的前面了
    // （2）某个node，这个node要排在newNode的后面
    if (next === null) {
      // 此时是环形链到头了，说明newNode的时间是最大的，要放在末尾
      next = firstCallbackNode;
    } else if (next === firstCallbackNode) {
      // 此时newNode的时间是最小的，要放在开头
      // 调整firstCallbackNode变量的值
      firstCallbackNode = newNode;
      // 确保宿主函数正在调用中（后台）
      // 当新任务具有最高优先级时，意味着它应该尽早执行。如果当前调度队列已经有任务，那么我们需要确保新的任务被调度为优先执行。
      ensureHostCallbackIsScheduled();
    }

    // （3. 连接
    // 此时next是newNode节点的后一个
    // previous是位于newNode后一个的节点的原本前一个（newNode的前面的节点）
    var previous = next.previous;
    // 首先解决前后节点的pre和next的取值
    previous.next = next.previous = newNode;
    // 然后解决当前节点对前后节点的pre和next取值
    newNode.next = next;
    newNode.previous = previous;
  }

  return newNode;
}


function ensureHostCallbackIsScheduled() {
  if (isExecutingCallback) {
    // 如果当前正在执行回调，说明此时不应该再调度新的回调工作，避免递归或重复工作，
    // 所以直接返回，等待下次的工作处理。
    return;
  }
  // 拿到最新构建的eT
  // 确保是任务队列（时间从小到大排序）中的第一个（时间最小且优先级最大的）的过期时间
  var expirationTime = firstCallbackNode.expirationTime;

  // 表示是否已经调度了宿主回调。如果没有调度过，就将其标记为已调度。
  // 如果已经调度了回调（即存在一个待处理的回调），先取消已有的回调。
  // 一开始为false
  if (!isHostCallbackScheduled) {
    isHostCallbackScheduled = true;
  } else {
    // Cancel the existing host callback.
    cancelHostCallback();
  }

  // 调用 requestHostCallback 来调度一个新的宿主回调
  // 并传入 flushWork（回调任务）以及 expirationTime（任务的过期时间）作为参数。
  requestHostCallback(flushWork, expirationTime);
}


function cancelHostCallback () {
  _callback = null;
};


function requestHostCallback(callback, absoluteTimeout) {
  // callback是flushWork
  // absoluteTimeout是过期时间expirationTime
  scheduledHostCallback = callback;
  timeoutTime = absoluteTimeout;

  if (isFlushingHostCallback || absoluteTimeout < 0) {
    // 如果正在执行宿主回调（flushing），则直接执行回调，无需等待下一帧。
    // 如果过期时间没有了，直接执行回调，不需要等待

    // 通过 postMessage 向主线程发送消息，将任务处理逻辑（如检查帧剩余时间、执行回调）延迟到下一个事件循环中，避免阻塞主线程。
    // port1 被用作接收消息的端口（通过 channel.port1.onmessage 设置事件处理器），
    // 而 port2 则用于发送消息（port.postMessage(undefined)）
    port.postMessage(undefined);
  } else if (!isAnimationFrameScheduled) {
    // 首次渲染会进来这里，设置标识为true，然后把commitRoot执行完，
    // 然后才执行宏任务的回调，然后才通过messageChannel进入执行flushWork回调

    // 如果当前没有动画帧（rAF）调度，我们需要手动调度一个新的动画帧。
    isAnimationFrameScheduled = true;
    // 调度一个新的动画帧，这个动画帧会触发 animationTick，在下一帧执行。
    requestAnimationFrameWithTimeout(animationTick);
  }
};



channel.port1.onmessage = function (event) {
  // 进来执行回调了，因此把isMessageEventScheduled先恢复为原状，防止忘记
  isMessageEventScheduled = false;

  // 1.拿到全局变量，保存起来
  // prevScheduledCallback是flushWork
  // prevTimeoutTime是过期时间expirationTime
  // 然后恢复全局变量，scheduledHostCallback为null，回到animationTick函数的时候就不再进入死循环
  var prevScheduledCallback = scheduledHostCallback;
  var prevTimeoutTime = timeoutTime;
  scheduledHostCallback = null;
  timeoutTime = -1;

  var currentTime = now();
  var didTimeout = false;


  // 2. 判断当前时间是否已经超过了“帧的截止时间”（frameDeadline）。
  // 如果当前时间超过了帧的截止时间（即没有时间剩余），就标识一下变量
  if (frameDeadline - currentTime <= 0) {
    // 进入这里说明这个周期已经没有时间了。

    // 继续检查newNode的过期时间
    // prevTimeoutTime 被设置为 -1，意味着任务没有超时设置
    // 如果 prevTimeoutTime 小于或等于当前时间，意味着回调的超时时间节点在前面，已经过去了，回调因超时被执行了已经
    if (prevTimeoutTime !== -1 && prevTimeoutTime <= currentTime) {
      // 任务已经超时了
      didTimeout = true;
    } else {

      // 如果本周期内没有时间了，但是这个任务还没有超时（说明这是一个未来需要执行的任务），
      // 为了不阻塞，放到下一个帧周期执行
      // 重新调度动画帧回调（requestAnimationFrameWithTimeout），延后处理!!
      if (!isAnimationFrameScheduled) {
        isAnimationFrameScheduled = true;
        // 这里面会再次通过messageChannel呼叫执行本函数
        requestAnimationFrameWithTimeout(animationTick);
      }
      // 然后执行完上面的代码立刻到下面这里，
      // 因为超过frame的ddl了，所以把prevScheduledCallback和时间恢复给全局变量，以便下一个周期的时候执行
      scheduledHostCallback = prevScheduledCallback;
      timeoutTime = prevTimeoutTime;
      // 直接return掉
      return;
    }
  }

  // 3. 不管有没有时间剩余，都要执行flushWork的函数
  // flushWork强制执行useEffect钩子函数，
  // 然后根据标识来判断是否超时，从而有不同的策略
  // （能走到这里，要么帧周期内还有时间，要么本次任务已经超时了，必须立刻执行了，即使阻塞主进程也要执行了）
  if (prevScheduledCallback !== null) {
    // 有一个回调需要执行
    isFlushingHostCallback = true;
    try {
      // 这个时候执行的是flushWork
      prevScheduledCallback(didTimeout);
    } finally {
      isFlushingHostCallback = false;
    }
  }

  // PS：
  // frameDeadline 表示当前空闲时间段的结束时间。在空闲时间段内执行任务时，frameDeadline 就是该任务的最后执行时限。
  // prevTimeoutTime 是一个开发者设定的超时点，用来强制执行回调，即使当前没有空闲时间。它确保回调在指定的时间点之前执行。
  // 相当于后者是控制下一帧要不要执行某个回调函数
};



var animationTick = function (rafTime) {
  // 第一次：从requestHostCallback函数起放入宏任务，等从那往下执行一直回到ReactDOM.render才开始执行这个回调函数
  // 此时scheduledHostCallback是有值的，没有进入post1的函数，再次调用rAF
  // 第二次：从animationTick函数起放入宏任务，等从那往下执行到副作用函数到回到performWork试图重新渲染，再回到commitPassiveEffects再往上
  // 此时经过了post1的函数，scheduledHostCallback为null，退出动画调度了！
  // （或许还有第三次，）

  // scheduledHostCallback这个变量一开始在requestHostCallback这里被赋予flushWork的回调函数
  if (scheduledHostCallback !== null) {
    // 表示有一个回调任务已经被调度且仍在等待执行。等待下一帧，继续。
    // 在帧的开头发布回调可以确保它在最早的帧内被触发。
    // 如果我们等到帧结束后才发布回调，那么浏览器可能会跳过一帧，直到之后的帧才触发回调。
    requestAnimationFrameWithTimeout(animationTick);
  } else {
    // 退出动画调度！！！
    isAnimationFrameScheduled = false;
    return;
  }

  // 计算下一帧的时间
  // rafTime 是浏览器执行当前回调的时候的时间戳，是一个绝对时间（通常是自页面加载以来的毫秒数）
  // activeFrameTime 是当前帧的持续时间，默认值是33
  // 我们一开始假设我们以30fps运行，但如果我们得到更频繁的动画帧，启发式跟踪会将此值调整为更快的fps。

  // frameDeadline 是当前帧的截止时间，也是一个绝对时间，是rafTime + activeFrameTime，也就是本帧剩下的时间加上33的一个期限
  // nextFrameTime相当于这次的rafTime - 上一次的rafTime
  var nextFrameTime = rafTime - frameDeadline + activeFrameTime;

  // 检验帧时间的合理性，调整帧时间
  // 这里把不等式化简一下，相当于rafTime < frameDeadline，也就是本次rafTime 减去 上一次的rafTime 小于 33
  // 也就是帧率小于33，不行，太长了
  if (nextFrameTime < activeFrameTime && previousFrameTime < activeFrameTime) {
    // 连续两次本帧剩下的时间都是小于0的，也就是ddl一直在本帧剩下的时间之后
    if (nextFrameTime < 8) {
      // 如果计算出的帧时间小于 8ms，这通常不符合正常的帧速率（比如 120Hz 的显示器应该大约每 8ms 刷新一次）
      nextFrameTime = 8;
    }

    // 在某些情况下，如果某一帧过长，下一帧的时间可能会变短，来“追赶”上一帧的滞后。
    // 因此，我们会选择当前帧时间和上一帧时间中较大的那个作为新的
    activeFrameTime = nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime;
  } else {
    previousFrameTime = nextFrameTime;
  }
  // 当前的时间加上33，也就是说当前的时间戳加上33是本次任务周期的持续时间，过期了就不能再继续执行了，跳到下一帧执行
  frameDeadline = rafTime + activeFrameTime;

  // 用于标记是否已经调度了消息事件
  if (!isMessageEventScheduled) {
    isMessageEventScheduled = true;
    port.postMessage(undefined);
  }
};



var requestAnimationFrameWithTimeout = function (callback) {
  // 这里为什么要设两个宏任务，是为了防止有些浏览器不存在requestAnimationFrame这个API嘛
  rAFID = requestAnimationFrame(function (timestamp) {
    // cancel the setTimeout
    clearTimeout(rAFTimeoutID);
    callback(timestamp);
  });
  rAFTimeoutID = setTimeout(function () {
    // cancel the requestAnimationFrame
    cancelAnimationFrame(rAFID);
    callback(now());
  }, ANIMATION_FRAME_TIMEOUT);
};






function flushWork(didTimeout) {

  if (enableSchedulerDebugging && isSchedulerPaused) {
    return;
  }

  // 设置为当前正在执行回调，就是从requestHostCallback来的
  isExecutingCallback = true;
  var previousDidTimeout = currentDidTimeout;
  currentDidTimeout = didTimeout;

  // 处理effect函数
  try {
    if (didTimeout) {

      // 1. 处理超时的任务
      while (firstCallbackNode !== null && !(enableSchedulerDebugging && isSchedulerPaused)) {
        // 只要任务队列不为空，就开始处理任务。
        var currentTime = now();
        // 如果队列里面的任务没有超时，相对于现在
        // !为什么相对于现在？？？
        // 因为Node的eT相当于以前的一个过期时间，然后加上一定的范围，优先级越小，时间范围越大，
        // 如果时间流逝，到现在目前的点，这个【过期时间】还是小于当前时间，说明他已经超时了，两个点之间没有正的剩余时间了
        // 应该立即执行！！！
        if (firstCallbackNode.expirationTime <= currentTime) {
          do {
            // 执行队列中的第一个任务。
            flushFirstCallback();
            // 继续执行队列中的下一个任务，直到没有更多超时任务，或者调度器被暂停。
          } while (firstCallbackNode !== null && firstCallbackNode.expirationTime <= currentTime && !(enableSchedulerDebugging && isSchedulerPaused));
          continue;
        }
        break;
      }
    } else {

      // 2. 如果没有超时：继续执行队列中的任务，直到当前帧的时间用完（shouldYieldToHost()）
      if (firstCallbackNode !== null) {
        do {
          if (enableSchedulerDebugging && isSchedulerPaused) {
            break;
          }
          flushFirstCallback();
          // 开始执行队列中的任务，直到任务队列为空，或者决定是否放弃当前帧（shouldYieldToHost()）以避免阻塞页面渲染。
        } while (firstCallbackNode !== null && !shouldYieldToHost());
      }
    }
  } finally {
    // 恢复状态
    isExecutingCallback = false;
    currentDidTimeout = previousDidTimeout;

    // 如果队列中还有任务，则安排下一个回调执行
    if (firstCallbackNode !== null) {
      ensureHostCallbackIsScheduled();
    } else {
      // 如果没有任务，取消当前的回调调度
      isHostCallbackScheduled = false;
    }

    // 退出之前，清理所有立即需要执行的任务
    flushImmediateWork();
  }
}





function flushFirstCallback() {
  var flushedNode = firstCallbackNode;

  // 1. 拿出需要的node，更新链表
  var next = firstCallbackNode.next;
  if (firstCallbackNode === next) {
    // 链表里面只有一个节点，拿出来之后，删除链表的这个节点，防止循环过度了
    firstCallbackNode = null;
    next = null;
  } else {
    // 拿出最开始的那个node之后，删除链表的这个节点，防止循环过度了
    var lastCallbackNode = firstCallbackNode.previous;
    // 把链表的头和尾连到next上面
    firstCallbackNode = lastCallbackNode.next = next;
    // next本身的pre连到最后一个上面
    next.previous = lastCallbackNode;
  }

  // 这里为啥要把头节点的next和pre都设置为null
  flushedNode.next = flushedNode.previous = null;


  // 2. 把属性从node里面拿出来
  var callback = flushedNode.callback;
  var expirationTime = flushedNode.expirationTime;
  var priorityLevel = flushedNode.priorityLevel;

  // 初始的时候，currentExpirationTime是-1
  var previousPriorityLevel = currentPriorityLevel;
  var previousExpirationTime = currentExpirationTime;
  currentPriorityLevel = priorityLevel;
  currentExpirationTime = expirationTime;



  // 3. 执行回调函数，这里的callback是commitPassiveEffects.bind(null, root, firstEffect)
  var continuationCallback;
  try {
    continuationCallback = callback();
  } finally {
    // 恢复变量
    currentPriorityLevel = previousPriorityLevel;
    currentExpirationTime = previousExpirationTime;
  }

  // 这里应该不会有返回值吧，按照当前的这个回调来看
  // 如果有返回值，继续像unstable_scheduleCallback函数一样，创建一个有序的任务队列
  if (typeof continuationCallback === 'function') {
    var continuationNode = {
      callback: continuationCallback,
      priorityLevel: priorityLevel,
      expirationTime: expirationTime,
      next: null,
      previous: null
    };

    // 继续像unstable_scheduleCallback函数一样，创建一个有序的任务队列
    if (firstCallbackNode === null) {
      // This is the first callback in the list.
      firstCallbackNode = continuationNode.next = continuationNode.previous = continuationNode;
    } else {
      var nextAfterContinuation = null;
      var node = firstCallbackNode;
      do {
        if (node.expirationTime >= expirationTime) {
          // This callback expires at or after the continuation. We will insert
          // the continuation *before* this callback.
          nextAfterContinuation = node;
          break;
        }
        node = node.next;
      } while (node !== firstCallbackNode);

      if (nextAfterContinuation === null) {
        // No equal or lower priority callback was found, which means the new
        // callback is the lowest priority callback in the list.
        nextAfterContinuation = firstCallbackNode;
      } else if (nextAfterContinuation === firstCallbackNode) {
        // The new callback is the highest priority callback in the list.
        firstCallbackNode = continuationNode;
        ensureHostCallbackIsScheduled();
      }

      var previous = nextAfterContinuation.previous;
      previous.next = nextAfterContinuation.previous = continuationNode;
      continuationNode.next = nextAfterContinuation;
      continuationNode.previous = previous;
    }
  }
}

// 副作用 + 重新进入循环
// 处理 被动副作用（passive effects） 的函数，通常用于处理例如 useEffect 钩子的副作用，这些副作用会在组件渲染后被执行。
function commitPassiveEffects(root, firstEffect) {

  // 重置全局变量
  rootWithPendingPassiveEffects = null;
  passiveEffectCallbackHandle = null;
  passiveEffectCallback = null;

  // 设置正在render，防止再次进入构建树的过程
  var previousIsRendering = isRendering;
  isRendering = true;

  var effect = firstEffect;
  do {
    {
      setCurrentFiber(effect);
    }

    // 如果需要更新的节点的副作用是passive
    // 那么就进入下面的逻辑
    if (effect.effectTag & Passive) {
      var didError = false;
      var error = void 0;
      // 执行commitPassiveHookEffects，先卸载然后再挂载
      {
        invokeGuardedCallback(null, commitPassiveHookEffects, null, effect);
        if (hasCaughtError()) {
          didError = true;
          error = clearCaughtError();
        }
      }
      if (didError) {
        captureCommitPhaseError(effect, error);
      }
    }
    effect = effect.nextEffect;
  } while (effect !== null);
  {
    resetCurrentFiber();
  }

  isRendering = previousIsRendering;


  // 执行完副作用之后，进入循环
  // 如果 rootExpirationTime 不等于 NoWork，说明有工作需要执行，就会调用 requestWork 来调度这些工作
  // !疑问：首次渲染这里是0，但是root的eT什么时候变为0了？？？？
  var rootExpirationTime = root.expirationTime;
  if (rootExpirationTime !== NoWork) {
    requestWork(root, rootExpirationTime);
  }

  // isBatchingUpdates 是一个标志，表示是否处于批处理更新状态。
  // 如果没有在批量更新模式下（!isBatchingUpdates），且不在渲染过程中（!isRendering），那么执行同步工作。
  if (!isBatchingUpdates && !isRendering) {
    performSyncWork();
  }
}




function commitPassiveHookEffects(finishedWork) {
  // 先卸载，然后再挂载！！
  commitHookEffectList(UnmountPassive, NoEffect$1, finishedWork);
  commitHookEffectList(NoEffect$1, MountPassive, finishedWork);
}



// 如果通过performSyncWork和performWork进入的最后的这个清理函数，那么，两个if条件都没满足
// 通过performWork进入的这个函数，两个if条件都没满足
// !什么时候会满足？
function finishRendering() {
  nestedUpdateCount = 0;
  lastCommittedRootDuringThisBatch = null;

  if (completedBatches !== null) {
    var batches = completedBatches;
    completedBatches = null;
    for (var i = 0; i < batches.length; i++) {
      var batch = batches[i];
      try {
        batch._onComplete();
      } catch (error) {
        if (!hasUnhandledError) {
          hasUnhandledError = true;
          unhandledError = error;
        }
      }
    }
  }

  if (hasUnhandledError) {
    var error = unhandledError;
    unhandledError = null;
    hasUnhandledError = false;
    throw error;
  }
}






// REVIEW - commitRoot函数中执行完【提交】之后的操作





function stopCommitLifeCyclesTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    var count = effectCountInCurrentCommit;
    effectCountInCurrentCommit = 0;
    endMark('(Calling Lifecycle Methods: ' + count + ' Total)', '(Calling Lifecycle Methods)', null);
  }
}



function stopCommitTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }

    var warning = null;
    if (hasScheduledUpdateInCurrentCommit) {
      warning = 'Lifecycle hook scheduled a cascading update';
    } else if (commitCountInCurrentWorkLoop > 0) {
      warning = 'Caused by a cascading update in earlier commit';
    }
    hasScheduledUpdateInCurrentCommit = false;
    commitCountInCurrentWorkLoop++;
    isCommitting = false;
    labelsInCurrentCommit.clear();

    endMark('(Committing Changes)', '(Committing Changes)', warning);
  }
}



function onCommitRoot(root) {
  if (typeof onCommitFiberRoot === 'function') {
    onCommitFiberRoot(root);
  }
}




// 下面相当于onCommitFiberRoot就是hook.onCommitFiberRoot(rendererID, root)
// 只是用catchErrors包裹了一下

var rendererID = hook.inject(internals);
var onCommitFiberRoot = null;
onCommitFiberRoot = catchErrors(function (root) {
  return hook.onCommitFiberRoot(rendererID, root);
});

function catchErrors(fn) {
  return function (arg) {
    try {
      return fn(arg);
    } catch (err) {
      if (true && !hasLoggedError) {
        hasLoggedError = true;
        warningWithoutStack$1(false, 'React DevTools encountered an error: %s', err);
      }
    }
  };
}

var hook = {
  renderers: new Map(),
  supportsFiber: true,
  inject: function (injected) {
    return nextID++;
  },
  onScheduleFiberRoot: function (id, root, children) {},
  onCommitFiberRoot: function (id, root, maybePriorityLevel, didError) {},
  onCommitFiberUnmount: function () {}
};


hook.inject = function (injected) {
  var oldInject = hook.inject;
  var id = oldInject.apply(this, arguments);

  if (typeof injected.scheduleRefresh === 'function' && typeof injected.setRefreshHandler === 'function') {
    // This version supports React Refresh.
    helpersByRendererID.set(id, injected);
  }

  return id;
};


var oldOnCommitFiberRoot = hook.onCommitFiberRoot;

hook.onCommitFiberRoot = function (id, root, maybePriorityLevel, didError) {

  var helpers = helpersByRendererID.get(id);

  if (helpers !== undefined) {
    helpersByRoot.set(root, helpers);
    // 获取当前根节点的状态
    var current = root.current;
    var alternate = current.alternate; // We need to determine whether this root has just (un)mounted.
    
    //  判断当前根节点的挂载状态
    if (alternate !== null) {
      // 更新时
      var wasMounted = alternate.memoizedState != null && alternate.memoizedState.element != null;
      var isMounted = current.memoizedState != null && current.memoizedState.element != null;

      // wasMounted 和 isMounted 用来判断根节点在当前和上一次渲染时是否已挂载。
      if (!wasMounted && isMounted) {
        // 根节点从未挂载到已挂载：
        mountedRoots.add(root);
        failedRoots.delete(root);
      } else if (wasMounted && isMounted) {
        // 根节点仍然挂载：
      } else if (wasMounted && !isMounted) {
        // 根节点从挂载变为未挂载
        mountedRoots.delete(root);

        if (didError) {
          // We'll remount it on future edits.
          failedRoots.add(root);
        } else {
          helpersByRoot.delete(root);
        }
      } else if (!wasMounted && !isMounted) {
        // 从未挂载到未挂载
        if (didError) {
          // We'll remount it on future edits.
          failedRoots.add(root);
        }
      }
    } else {
      // 处理没有 alternate 的情况
      mountedRoots.add(root);
    }
  } // Always call the decorated DevTools hook.


  return oldOnCommitFiberRoot.apply(this, arguments);
};



function onCommit(root, expirationTime) {
  root.expirationTime = expirationTime;
  root.finishedWork = null;
}












// REVIEW - 以下是 交互后 更新时 触发的函数（以函数组件为例子）




// 之前挂的监听函数如下：
// addEventBubbleListener(element, getRawEventName(topLevelType), dispatch.bind(null, topLevelType));


// 因此应该执行以下函数：
// 1. dispatchInteractiveEvent：
// function dispatchInteractiveEvent(topLevelType, nativeEvent) {
//   interactiveUpdates$1(dispatchEvent, topLevelType, nativeEvent);
// }
// 2. 然后是interactiveUpdates$1
// 3. 然后是（这里的fn指的是dispatchEvent）
// unstable_runWithPriority(UserBlockingPriority, function () {
//   return fn(a, b);
// });

// 上面相当于包裹了一层外表皮，控制是否有交互式挂起任务，然后才【批量】执行dispatchEvent
// 可以在【事件触发相关】部分找到


// 等到事件部分的函数走完，在interactiveUpdates$1函数里面走finally的函数的时候，重新以同步方式进入performWork
// 然后在beginWork函数里面走下面的bailoutOnAlreadyFinishedWork函数



function bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime) {

  // 先取消与当前WIP相关的工作计时器。
  cancelWorkTimer(workInProgress);

  if (current$$1 !== null) {
    workInProgress.contextDependencies = current$$1.contextDependencies;
  }

  if (enableProfilerTimer) {
    stopProfilerTimerIfRunning(workInProgress);
  }

  // 检查孩子的时间是否小于nextRender的时间
  var childExpirationTime = workInProgress.childExpirationTime;
  if (childExpirationTime < renderExpirationTime) {
    // 如果过期时间小于当前的 renderExpirationTime（nextRender），那么就说明子节点已经完成了。
    return null;
  } else {
    // 当前节点的子节点还有工作需要完成
    // 二更时，childExpirationTime和renderExpirationTime是一样的，都是SYnc，
    // ?!什么时候赋予的，在commit的最后，这个还是0呢！

    // 给当前节点的孩子层创造fiber的替身
    cloneChildFibers(current$$1, workInProgress);
    return workInProgress.child;
  }
}

function cancelWorkTimer(fiber) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
      return;
    }
    // Remember we shouldn't complete measurement for this fiber.
    // Otherwise flamechart will be deep even for small updates.
    fiber._debugIsCurrentlyTiming = false;
    clearFiberMark(fiber, null);
  }
}
var clearFiberMark = function (fiber, phase) {
  var componentName = getComponentName(fiber.type) || 'Unknown';
  var debugID = fiber._debugID;
  var isMounted = fiber.alternate !== null;
  var label = getFiberLabel(componentName, isMounted, phase);
  var markName = getFiberMarkName(label, debugID);
  clearMark(markName);
};

var clearMark = function (markName) {
  performance.clearMarks(formatMarkName(markName));
};



function cloneChildFibers(current$$1, workInProgress) {

  if (workInProgress.child === null) {
    return;
  }

  var currentChild = workInProgress.child;
  // 给大孩子创造一个alternate（复制现有 fiber ）
  // 返回的是替身，也就是WIP是current的alternate，但里面的属性啥的都更新过了
  var newChild = createWorkInProgress(currentChild, currentChild.pendingProps, currentChild.expirationTime);
  workInProgress.child = newChild;

  newChild.return = workInProgress;

  // 给其他孩子也创造一个alternate（复制现有 fiber ）
  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps, currentChild.expirationTime);
    newChild.return = workInProgress;
  }
  newChild.sibling = null;
}





function updateFunctionComponent(current$$1, workInProgress, Component, nextProps, renderExpirationTime) {
  
  {
    if (workInProgress.type !== workInProgress.elementType) {
      // Lazy component props can't be validated in createElement
      // because they're only guaranteed to be resolved here.
      var innerPropTypes = Component.propTypes;
      if (innerPropTypes) {
        checkPropTypes(innerPropTypes, nextProps, // Resolved props
        'prop', getComponentName(Component), getCurrentFiberStackInDev);
      }
    }
  }

  // 拿到上下文
  var unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
  var context = getMaskedContext(workInProgress, unmaskedContext);


  var nextChildren = void 0;
  prepareToReadContext(workInProgress, renderExpirationTime);


  // 处理这个函数组件本身
  {
    ReactCurrentOwner$3.current = workInProgress;
    setCurrentPhase('render');

    // 处理这个函数组件本身
    nextChildren = renderWithHooks(current$$1, workInProgress, Component, nextProps, context, renderExpirationTime);
    
    
    if (debugRenderPhaseSideEffects || debugRenderPhaseSideEffectsForStrictMode && workInProgress.mode & StrictMode) {
      // Only double-render components with Hooks
      if (workInProgress.memoizedState !== null) {
        nextChildren = renderWithHooks(current$$1, workInProgress, Component, nextProps, context, renderExpirationTime);
      }
    }
    setCurrentPhase(null);
  }

  // 在beginWork分发到这里之前，已经给didReceiveUpdate赋值为false
  if (current$$1 !== null && !didReceiveUpdate) {
    bailoutHooks(current$$1, workInProgress, renderExpirationTime);
    return bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);
  }


  // React DevTools reads this flag.
  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(current$$1, workInProgress, nextChildren, renderExpirationTime);
  return workInProgress.child;
}



function setCurrentPhase(lifeCyclePhase) {
  {
    phase = lifeCyclePhase;
  }
}

