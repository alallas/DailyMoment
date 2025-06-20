// 一些专题类的查找关键字：
// 上下文：【上下文】
// eT改为0：【eT改为0】
// 更新时给孩子节点层创建替身：【给孩子节点层创建替身】
// 往下右或上右的遍历写法：【上右或下右的遍历写法】
// 修改tag：【改tag】
// 更新eT与childET：【更新本eT与祖上childET】


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

// 副作用链effectTag的标识
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
var previousFrameTime = 33;
var activeFrameTime = 33;

var shouldYieldToHost;
shouldYieldToHost = function () {
  return frameDeadline <= now();
};

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


var supportsMutation = true;


var enableSuspenseServerRenderer = false;



// 16. 二次更新

var ReactCurrentOwner$3 = ReactSharedInternals.ReactCurrentOwner;






// 17. lazy加载组件相关

var Pending = 0;
var Resolved = 1;
var Rejected = 2;






// 18. 水化相关

// 代表不同类型的原生节点
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;



var warnedUnknownTags = void 0;
var suppressHydrationWarning = void 0;

var validatePropertiesInDevelopment = void 0;
var warnForTextDifference = void 0;
var warnForPropDifference = void 0;
var warnForExtraAttributes = void 0;
var warnForInvalidEventListener = void 0;
var canDiffStyleForHydrationWarning = void 0;

var normalizeMarkupForTextOrAttribute = void 0;
var normalizeHTML = void 0;




// 19.react18的交互回调事件绑定相关


var TotalLanes = 31;
var NoLanes = 0;
var NoLane = 0;
var SyncLane = 1;
var InputContinuousHydrationLane = 2;
var InputContinuousLane = 4;
var DefaultHydrationLane = 8;
var DefaultLane = 16;
var TransitionHydrationLane = 32;
var TransitionLanes = 4194240;
var SelectiveHydrationLane = 134217728;
var NonIdleLanes = 268435455;
var IdleHydrationLane = 268435456;
var IdleLane = 536870912;
var OffscreenLane = 1073741824;


var DiscreteEventPriority = SyncLane;
var ContinuousEventPriority = InputContinuousLane;
var DefaultEventPriority = DefaultLane;
var IdleEventPriority = IdleLane;
var currentUpdatePriority = NoLane;







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
        " You likely forgot to  your component from the file " +
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
        " Did you accidentally  a JSX literal instead of a component?";
    } else {
      typeString = typeof type;
    }

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
    $$typeof: REACT_ELEMENT_TYPE,

    type: type,
    key: key,
    ref: ref,
    props: props,

    _owner: owner,
  };

  {
    element._store = {};
    Object.defineProperty(element._store, "validated", {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false,
    });
    Object.defineProperty(element, "_self", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    });
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
    return null;
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





// REVIEW - ReactDOM的render方法-第一辑：主入口，创建root对象，fiber，ReactRoot对象等





var ReactDOM = {
  render: function (element, container, callback) {
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
  var shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  if (!shouldHydrate) {
    var warned = false;
    var rootSibling = void 0;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
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

  // 【注意！】type就是虚拟DOM本身
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

  // 当前fiber所对应的虚拟DOM（也就是<>节点上面的props对象）
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




// REVIEW - ReactDOM的render方法-第二辑：主入口后面的unbatchedUpdates更新函数，调用ReactRoot的render方法更新




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
  return updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback);
}





function requestCurrentTime() {
  // 在一次render中，如果我有一个新的任务进来了，要计算 expirationTime 发现现在处于渲染阶段，这时直接返回上次 render 开始的时间，再去计算 expirationTime
  // 好处是 前后两次计算出来的 expirationTime 是一样的，让这个任务提前进行调度
  if (isRendering) {
    return currentSchedulerTime;
  }

  // 找优先级最高的一个root
  findHighestPriorityRoot();

  // 如果nextFlushedExpirationTime是优先级低（1）和最低（0）的，都要重新计算一下当前的时间，为什么？？？？？？？
  // 在首次渲染阶段，nextFlushedExpirationTime是0，
  // 每次findHighestPriorityRoot执行完之后，都会把nextFlushedExpirationTime变为xxxxxx
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
  // 第一次执行这个函数（requestCurrentTime里面）：一开始的lastScheduledRoot最后一个root肯定为空，不走这里
  // 第二次执行这个函数（performWork里面）：lastScheduledRoot是root
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
        // 此时的root的eT不为0，通常为Sync
        if (remainingExpirationTime > highestPriorityWork) {
          // 更新两个变量
          highestPriorityWork = remainingExpirationTime;
          highestPriorityRoot = root;
        }
        if (root === lastScheduledRoot) {
          break;
        }
        if (highestPriorityWork === Sync) {
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

function updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback) {
  // 这里拿到的就是root对象的fiber
  var current$$1 = container.current;

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

  // 1. 拿到（新建或者复用）queue对象，这个对象是用来装下每个update对象的
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
    if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
      appendUpdateToQueue(queue1, update);
      appendUpdateToQueue(queue2, update);
    } else {
      appendUpdateToQueue(queue1, update);
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

  // 1. 首先先攀岩到根root（对象）上面，无论目前身处哪个fiber
  // 然后期间更新本节点的eT和往上任意节点的childET（包括替身）
  // 【更新本eT与祖上childET】——————>意味着，如果一个子组件进行了setState，那么祖上的所有父组件的expirationTime都会变得很大，以便更新！
  // （在beginWork那边，这个父组件就会因为rT很大而进不去bailout函数）
  // 这个root是root对象，而非原生的stateNode
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
}

function scheduleWorkToRoot(fiber, expirationTime) {
  // 本函数的作用是往上爬，一直爬到root
  // 然后期间更新本节点的eT和往上任意节点的childET（包括替身）

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
  // 同时更新一下过去的fiber的过期时间为最新的
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
    // 当前时间比剩下的时间还大，更新root的时间
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
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, currentRendererTime > nextFlushedExpirationTime);
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
      // 一般什么情况会进来这里？
      // 当lazyComponent组件在beginWork派发后执行import()函数拿到一个promise对象时，最后throw这个promise对象出来

      // 1.把上下文和hooks链表全部恢复为null
      resetContextDependences();
      resetHooks();

      // replayFailedUnitOfWorkWithInvokeGuardedCallback默认为true，进入下面if逻辑
      // 把mayReplay设置为true（mayReplayFailedUnitOfWork之前在completeUnitOfWork里面设为了true）
      var mayReplay = void 0;
      if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
        mayReplay = mayReplayFailedUnitOfWork;
        mayReplayFailedUnitOfWork = true;
      }

      if (nextUnitOfWork === null) {
        didFatal = true;
        onUncaughtError(thrownValue);

      } else {
        // 因为lazy组件抛出promise而来到这里，此时的nextUnitOfWork是有值的

        // 2.停止一些性能的计算
        if (enableProfilerTimer && nextUnitOfWork.mode & ProfileMode) {
          stopProfilerTimerIfRunningAndRecordDelta(nextUnitOfWork, true);
        }
        currentlyProcessingQueue = null

        // 3.进入修复工作
        // 如果是第一次抛出的promise对象，下面这个修复函数很快就退出来了
        // 如果是promise失败了，抛出了一个错误的东西，下面这个函数执行到底
        // （且在里面重新调度进入workLoop，但还是失败的，还是去到了下面）
        if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
          if (mayReplay) {
            var failedUnitOfWork = nextUnitOfWork;
            replayUnitOfWork(failedUnitOfWork, thrownValue, isYieldy);
          }
        }

        // 找到这个懒加载组件的父亲节点
        var sourceFiber = nextUnitOfWork;
        var returnFiber = sourceFiber.return;
        if (returnFiber === null) {
          didFatal = true;
          onUncaughtError(thrownValue);

        } else {
          // 一般来说都是能找到父节点的
          // 1）给suspense组件标记DidCapture，并且把promise对象保存到suspense组件的uQ里面
          throwException(root, returnFiber, sourceFiber, thrownValue, nextRenderExpirationTime);
          
          // 2）在这个懒加载的组件这里直接进入completeUnitOfWork，然后返回suspense组件本身
          nextUnitOfWork = completeUnitOfWork(sourceFiber);

          // 3）continue表示再一次进入本while循环，再一次进入workLoop
          // nextUnitOfWork正常来说是返回suspense组件本身
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

  // `nextRoot`指向正在进行的根。非空值表示我们正处于异步渲染中。
  // 将其设置为null表示当前批次中没有更多工作要做。
  nextRoot = null;
  interruptedBy = null;


  // 8. 处理异常的结果（需要挂起的）

  // 8.1 （下一次任务）在下一次render存在错误的时候，
  // 有高优先级工作，优先执行，挂起当前任务（root为整个树的代表）
  // 没有高优先级工作，尝试重新执行当前任务
  if (nextRenderDidError) {
    // 判断当前expirationTime是否存在高优先级的工作。
    if (hasLowerPriorityWork(root, expirationTime)) {
      // 如果存在高优先级的工作，React 会选择跳过当前的渲染任务，执行这个高优先级任务
      // 标记当前的渲染任务为挂起，表明它的优先级被降低，React 会在下次渲染时恢复该任务。
      markSuspendedPriorityLevel(root, expirationTime);

      var suspendedExpirationTime = expirationTime;
      var rootExpirationTime = root.expirationTime;

      // onSuspend 会被调用，表示当前渲染已经挂起（没有提交）
      onSuspend(root, rootWorkInProgress, suspendedExpirationTime, rootExpirationTime, -1);
      return;

    } else if (!root.didError && isYieldy) {
      // 没有低优先级的工作，但是正在进行异步渲染 (isYieldy 表示渲染过程是可以被暂停的)
      // React 会尝试同步渲染相同的级别，进行一次重试。
      root.didError = true;

      // 将 root.nextExpirationTimeToWorkOn 设置为当前的 expirationTime，
      // 并将 root.expirationTime 设置为 Sync（同步渲染）。
      // 这意味着 React 将立即尝试同步渲染。
      var _suspendedExpirationTime = (root.nextExpirationTimeToWorkOn = expirationTime);
      var _rootExpirationTime = (root.expirationTime = Sync);

      // 再次调用 onSuspend，通知渲染挂起，表示 React 会稍后再次尝试渲染
      onSuspend(root, rootWorkInProgress, _suspendedExpirationTime, _rootExpirationTime, -1);
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
    var earliestExpirationTime = findEarliestOutstandingPriorityLevel(root, expirationTime);

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
    onSuspend(root, rootWorkInProgress, _suspendedExpirationTime2, _rootExpirationTime2, msUntilTimeout);

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
// !核心作用是控制每一个节点是否进入工作间

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

      // 更新阶段：
      // 如果props是[{}, {}, {}...]或者{}这样的，props肯定都不一样，
      // 因为每次在执行函数组件的时候，相当于重新执行了创建虚拟DOM的函数，props重新指向一个新的内存地址
      didReceiveUpdate = true;
    } else if (updateExpirationTime < renderExpirationTime) {
      // 新旧的props一样，且fiber本身的过期时间（倒计时）小，说明这个fiber已经被处理过了，可以直接退出了

      // renderExpirationTime是nextRenderExpirationTime，为Sync的值（若从performWorkSync进来的）
      // 首次渲染时，fiber的eT和入参的eT对比，是一样的，不进入这里
      // 二更时
      // WIP为root或者文本节点时，根节点或者文本节点的WIP的eT为0（什么时候设置的？），则进入这部分逻辑
      // WIP不为root或者文本节点时，为函数/类组件之类的，WIP的eT为Sync（之前在首渲的时候就是Sync？？），不进去这部分逻辑
      // TODO---

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

        // 第二次更新时的suspenseComponent走这里
        case SuspenseComponent: {
          // 拿到之前的state，有值说明之前是超时的（显示的是fallback）
          var state = workInProgress.memoizedState;
          var didTimeout = state !== null;

          // 之前超时了（显示的是fallback），现在需要显示真正的孩子组件了
          if (didTimeout) {
            // 拿到真实的孩子，更新组件
            var primaryChildFragment = workInProgress.child;
            var primaryChildExpirationTime = primaryChildFragment.childExpirationTime;
            if (primaryChildExpirationTime !== NoWork && primaryChildExpirationTime >= renderExpirationTime) {
              return updateSuspenseComponent(current$$1, workInProgress, renderExpirationTime);
            
            } else {
              // 如果孩子的eT已经过期了，就拿到替身（新建或复用），找到sibling，显示fallback的内容
              var child = bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);
              if (child !== null) {
                return child.sibling;
              } else {
                return null;
              }
            }
          }

          // 之前没有超时（显示的是真实的孩子）
          // 不管，去下面的bailoutOnAlreadyFinishedWork，拿到（新建或复用）孩子的替身
          break;
        }
        case DehydratedSuspenseComponent: {
          if (enableSuspenseServerRenderer) {
            workInProgress.effectTag |= DidCapture;
            break;
          }
        }
      }

      // 注意！！！看这里
      // 二更且WIP为【root】或【文本节点】或者【root下面的一个函数/类组件（props没有children属性）】时，
      // 执行这个函数就好了，就直接return了，不走下面的分发
      return bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);

    }
  } else {
    // 【首次渲染且非根节点】，新旧props都是null，且fiber本身的和亟需更新的优先级的时间一样
    didReceiveUpdate = false;
  }

  // 【eT改为0】
  // 因为当前的fiber正在处理中
  // 把fiber本身的优先级改回为NoWork，最低的
  workInProgress.expirationTime = NoWork;


  // 2. 开始分发，哪种类型去哪里
  // 首次渲染是hostRoot类型，去updateHostRoot
  switch (workInProgress.tag) {
    // 函数组件【首渲染】走这里
    // BrowserRouter【首渲】走这里
    case IndeterminateComponent: {
      var elementType = workInProgress.elementType;
      return mountIndeterminateComponent(current$$1, workInProgress, elementType, renderExpirationTime);
    }

    // 使用了React.lazy(()=>import())包裹的组件走这里！
    case LazyComponent: {
      var _elementType = workInProgress.elementType;
      return mountLazyComponent(current$$1, workInProgress, _elementType, updateExpirationTime, renderExpirationTime);
    }

    // 【二更】时的函数组件走这里：
    // mountIndeterminateComponent函数里面改了WIP的tag是函数组件还是类组件
    case FunctionComponent: {
      var _Component = workInProgress.type;
      var unresolvedProps = workInProgress.pendingProps;
      var resolvedProps = workInProgress.elementType === _Component ? unresolvedProps : resolveDefaultProps(_Component, unresolvedProps);
      // renderExpirationTime是nextRenderExpirationTime，为Sync的值
      return updateFunctionComponent(current$$1, workInProgress, _Component, resolvedProps, renderExpirationTime);
    }

    // 【首渲和二更】时的类组件走这里
    case ClassComponent: {
      var _Component2 = workInProgress.type;
      var _unresolvedProps = workInProgress.pendingProps;
      var _resolvedProps = workInProgress.elementType === _Component2 ? _unresolvedProps : resolveDefaultProps(_Component2, _unresolvedProps);
      return updateClassComponent(current$$1, workInProgress, _Component2, _resolvedProps, renderExpirationTime);
    }

    // 根节点首次渲染走这里
    case HostRoot:
      // 这里分发完之后就没事了！！回到【performUnitOfWork】函数
      return updateHostRoot(current$$1, workInProgress, renderExpirationTime);

    // 普通原生节点走这里
    case HostComponent:
      return updateHostComponent(current$$1, workInProgress, renderExpirationTime);
    case HostText:
      return updateHostText(current$$1, workInProgress);
    case SuspenseComponent:
      return updateSuspenseComponent(current$$1, workInProgress, renderExpirationTime);
    case HostPortal:
      return updatePortalComponent(
        current$$1,
        workInProgress,
        renderExpirationTime
      );

    // 【forwardRef】，ForwardRef的组件走下面这里
    case ForwardRef: {
      // type是虚拟dom本身
      var type = workInProgress.type;
      var _unresolvedProps2 = workInProgress.pendingProps;
      // 这个变量一般来说等于props
      var _resolvedProps2 =
        workInProgress.elementType === type
          ? _unresolvedProps2
          : resolveDefaultProps(type, _unresolvedProps2);
      
      // 执行函数
      return updateForwardRef(current$$1, workInProgress, type, _resolvedProps2, renderExpirationTime);
    }
    case Fragment:
      return updateFragment(current$$1, workInProgress, renderExpirationTime);
    case Mode:
      return updateMode(current$$1, workInProgress, renderExpirationTime);
    case Profiler:
      return updateProfiler(current$$1, workInProgress, renderExpirationTime);

    // 函数组件和类组件的provider都来这里
    case ContextProvider:
      return updateContextProvider(current$$1, workInProgress, renderExpirationTime);
    
    // 使用了<Context.Consumer>以及(value) => {...}的组件来这里
    case ContextConsumer:
      // 这个对应的$$typeof就是REACT_CONTEXT_TYPE，<Context.Consumer>就会来到这里
      // 类组件的consumer来到这里，里面是一个函数(value) => {...}
      // 为什么函数组件的consumer不来这里
      // 也可以来，只是函数组件可以用useContext，不需要写<Context.Comsumer>(value) => {...}</Context.Comsumer>
      return updateContextConsumer(current$$1, workInProgress, renderExpirationTime);

    // 【memo(() => (<></>))】的类型的【首渲】走这里  
    case MemoComponent: {
      // 拿到memo这个对象
      var _type2 = workInProgress.type;
      var _unresolvedProps3 = workInProgress.pendingProps;

      // 把默认props和自定义的props融合到一起
      var _resolvedProps3 = resolveDefaultProps(_type2, _unresolvedProps3);
      // 把type对象的默认属性也融合到props里面
      _resolvedProps3 = resolveDefaultProps(_type2.type, _resolvedProps3);

      // 上面好像都不会走，走下面
      return updateMemoComponent(current$$1, workInProgress, _type2, _resolvedProps3, updateExpirationTime, renderExpirationTime);
    }

    // 【memo(() => (<></>))】的类型的【更新】走这里
    case SimpleMemoComponent: {
      // 之前在MemoComponent明确了这个是一个函数式的memo组件，因此改了tag为SimpleMemoComponent
      return updateSimpleMemoComponent(current$$1, workInProgress, workInProgress.type, workInProgress.pendingProps, updateExpirationTime, renderExpirationTime);
    }
    case IncompleteClassComponent: {
      var _Component3 = workInProgress.type;
      var _unresolvedProps4 = workInProgress.pendingProps;
      var _resolvedProps4 =
        workInProgress.elementType === _Component3 ? _unresolvedProps4 : resolveDefaultProps(_Component3, _unresolvedProps4);
      return mountIncompleteClassComponent(current$$1, workInProgress, _Component3, _resolvedProps4, renderExpirationTime);
    }
    case DehydratedSuspenseComponent: {
      if (enableSuspenseServerRenderer) {
        return updateDehydratedSuspenseComponent(current$$1, workInProgress, renderExpirationTime);
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
  processUpdateQueue(workInProgress, updateQueue, nextProps, null, renderExpirationTime);

  // 拿到接下来需要更新的state（已经经过队列的所有应该更新的state的合并）
  var nextState = workInProgress.memoizedState;

  // 这个element指的是当前节点的下一个节点的虚拟DOM对象，之前在scheduleRootUpdate给payload赋值过一个有element属性的对象
  var nextChildren = nextState.element;
  // 首次渲染阶段不走下面的逻辑
  if (nextChildren === prevChildren) {
    resetHydrationState();
    return bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);
  }

  // 这里拿到的是root对象
  var root = workInProgress.stateNode;

  // current$$1是workInProgress的替身
  // 【SSR】这是ssr的逻辑，如果是水化的话，副作用链为placement，相当于不用去reconcileChildren判断，直接进入首渲环节的mountChildFibers
  // enterHydrationState把isHydrating变为true，并且通过getFirstHydratableChild得到第一个水合实例
  if ((current$$1 === null || current$$1.child === null) && root.hydrate && enterHydrationState(workInProgress)) {
    workInProgress.effectTag |= Placement;
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
  } else {
    // 这是正常react的逻辑，开始对孩子进行调度！！！！！！
    // nextChildren指的是当前节点的虚拟DOM对象（在【首次渲染阶段】，这个element就是root的下一个节点的虚拟DOM，要么是函数组件，要么是类组件！！）
    reconcileChildren(current$$1, workInProgress, nextChildren, renderExpirationTime);
    resetHydrationState();
  }
  // 最后返回大儿子的fiber，回到【beginWork】函数
  return workInProgress.child;
}

function pushHostRootContext(workInProgress) {
  var root = workInProgress.stateNode;
  if (root.pendingContext) {
    pushTopLevelContextObject(workInProgress, root.pendingContext, root.pendingContext !== root.context);
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
  // nextRootInstance为：root的原生DOM 或者 body的原生DOM（portal的情况）
  // 首次渲染阶段，保存【root的原生DOM 或者 body的原生DOM】到rootInstanceStackCursor的current里面，再保存到valueStack
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

function processUpdateQueue(workInProgress, queue, props, instance, renderExpirationTime) {
  hasForceUpdate = false;

  // 这里需要保证替身的更新队列，和目前的更新队列不是一个内存地址的对象，为什么？为啥queue对象就不能复用呢？
  queue = ensureWorkInProgressQueueIsAClone(workInProgress, queue);

  // 然后替换掉全局的正在更新中的队列对象
  {
    currentlyProcessingQueue = queue;
  }


  // 1. 处理普通类型的更新
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

    if (updateExpirationTime < renderExpirationTime) {
      // 如果更新的过期时间比较小，准备到期了，要跳过
      if (newFirstUpdate === null) {
        newFirstUpdate = update;
        newBaseState = resultState;
      }
      // 这个更新还留在链表里面
      // 如果更新的时间更大，更富足，更新newExpirationTime时间
      if (newExpirationTime < updateExpirationTime) {
        newExpirationTime = updateExpirationTime;
      }

    } else {
      // 首次渲染and更新走下面的逻辑（updateExpirationTime等于renderExpirationTime）更新的过期时间大，需要进行更新
      // 拿到最新的整合过后的state，更新resultState变量，下一次遍历还是用回这个变量
      resultState = getStateFromUpdate(workInProgress, queue, update, resultState, props, instance);

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


  // 2. 处理CapturedUpdate类型的更新

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
      resultState = getStateFromUpdate(workInProgress, queue, update, resultState, props, instance);

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


  // 3. 更新属性
  // 如果说一整个下来，newFirstUpdate都是空的，
  // 意味着每个update的过期时间都很大，都处理完了，把queue.lastUpdate恢复为null
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
    // 说明update对象的过期时间大，全部都处理完了，此时的resultState就是最新的状态
    newBaseState = resultState;
  }

  // 更新queue对象的属性
  // 把队列链表恢复为null
  queue.baseState = newBaseState;
  queue.firstUpdate = newFirstUpdate;
  queue.firstCapturedUpdate = newFirstCapturedUpdate;

  // 把过期时间和state数据一起更新在workInProgress里面（以此到外面改变组件的state）
  // 【eT改为0】过期时间恢复为0
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

function getStateFromUpdate(workInProgress, queue, update, prevState, nextProps, instance) {

  // 这个函数仅仅是处理单个update对象的

  switch (update.tag) {
    case ReplaceState: {
      var _payload = update.payload;
      if (typeof _payload === "function") {
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
      workInProgress.effectTag = (workInProgress.effectTag & ~ShouldCapture) | DidCapture;
    }
    // 首渲和二更走下面
    case UpdateState: {
      // payload是state对象或者一个函数
      var _payload2 = update.payload;
      var partialState = void 0;

      // 以下可以看出：如果setState传入一个函数，其prevState就是会不断更新的
      // 如果传入一个对象，在当初执行dispatchAction或enqueueUpdate的时候，拿到的state对象永远是{number: 当前页面显示的值 + 1}，也就是永远是一个数字{number: 1}
      // 假设当前页面的值是0：
      // 执行了三次对象式的setState，最后的结果还是1
      // 执行了一次函数式的setState，两次对象式的setState（如下），最后的结果是0.3
      // this.setState((state) => ({ number: state.number + 1 }));
      // this.setState({ number: this.state.number + 0.2 });
      // this.setState({ number: this.state.number + 0.3 });


      if (typeof _payload2 === "function") {
        // 如果state是一个函数，就执行他，这个时候的prevState就是最新的state（入参传入的，在外部不断遍历变化的state）

        // 这里的instance在首次渲染的时候是null
        // 这个函数的入参是过去的state，和下一个props
        partialState = _payload2.call(instance, prevState, nextProps);

      } else {
        // 如果payload也就是state的对象不是一个函数，就直接覆盖当前函数的变量
        partialState = _payload2;
      }

      if (partialState === null || partialState === undefined) {
        // 如果state是null，那就用之前的state（用来显示在页面上！！）
        return prevState;
      }

      // 用来和之前的state对象合并！注意是合并！
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




function reconcileChildren(current$$1, workInProgress, nextChildren, renderExpirationTime) {
  // 这里的current$$1是WIP的替身，
  // nextChildren是下一个节点的element虚拟DOM（这个会有变化吗，这是nextState.element），
  // renderExpirationTime就是全局的nextRenderET（就是root的nextETToWork），
  if (current$$1 === null) {
    // 下面的函数也就是ChildReconciler(false);也就是reconcileChildFibers
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
  } else {
    // 首次渲染且WIP为root时走下面的逻辑，current$$1.child将会是null，nextChildren就是root的大儿子（唯一的儿子）
    // 开始处理fiber的大儿子！！！！
    // 得到处理好的大儿子之后给到child属性
    workInProgress.child = reconcileChildFibers(workInProgress, current$$1.child, nextChildren, renderExpirationTime);
  }
}



// ChildReconciler里面的子函数目录：
// reconcileChildFibers
// reconcileSingleElement
// reconcileChildrenArray

// createChild
// placeChild
// placeSingleChild

// deleteRemainingChildren
// deleteChild

// useFiber
// createFiberFromElement
// createFiberFromTypeAndProps
// updateSlot

// shouldConstruct
// coerceRef


function ChildReconciler(shouldTrackSideEffects) {
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
    // returnFiber是父亲fiber
    // currentFirstChild是父亲fiber的替身的大儿子（也是一个fiber），也就是当前页面显示的对应的节点
    // （PS：注意！用这个是否为null来判断处于什么阶段？渲染阶段root下面大儿子没有替身。更新阶段，root在beginWork的bailOut被拦截了，并给大儿子新建了替身，所有是有值的）
    // newChild是nextState.element，是最新的虚拟DOM

    // 1. 用来处理这种情况 <>{[...]}</> 和 <>...</>
    // 在这种情况下，保证newChild除去了空的标签符号，剩下里面的所有孩子
    // !因此用这个<></>可以不用渲染多一个div节点，可以减少树的遍历开支！！！!
    var isUnkeyedTopLevelFragment = typeof newChild === 'object' && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children;
    }

    var isObject = typeof newChild === "object" && newChild !== null;


    // 2. 开始分发
    // 2.1 如果newChild是只有一个，且是一个对象（虚拟DOM）
    // （数组不在这里面，去到下面的逻辑，因为数组本身没有$$typeof的属性）
    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // 首次渲染走这里！！！如果首次渲染的root的大儿子是一个单纯的函数组件或类组件的话
          // 通过reconcileSingleElement拿到大儿子节点的fiber
          // 然后修改effectTag属性，看是新增还是更新
          // 最后返回fiber！
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, expirationTime));
        case REACT_PORTAL_TYPE:
          // 指定容器的节点
          return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, expirationTime));
      }
    }

    // 2.2 文本节点
    if (typeof newChild === "string" || typeof newChild === "number") {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, "" + newChild, expirationTime));
    }

    // 2.3 数组形式
    // 一般来说，一个大的父节点下面肯定有很多个子节点，因此newChild就是一个数组的形式
    // 这里面涉及到diff的算法
    if (isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime);
    }

    // 2.4 类数组形式
    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, expirationTime);
    }


    // 3. 警告与错误处理
    if (isObject) {
      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === "function") {
        warnOnFunctionType();
      }
    }

    // 没有子虚拟DOM树（错误处理）
    if (typeof newChild === "undefined" && !isUnkeyedTopLevelFragment) {
      switch (returnFiber.tag) {
        case ClassComponent: {
          {
            var instance = returnFiber.stateNode;
            if (instance.render._isMockFunction) {
              break;
            }
          }
        }
        case FunctionComponent: {
        }
      }
    }

    // 其他情况就视为一个空的元素，要删掉
    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element, expirationTime) {
    // 这个函数是孩子fiber建设的分发器

    // returnFiber是父亲fiber节点
    // currentFirstChild就是父亲fiber节点的替身的大儿子fiber，也就是当前在页面显示出来的还没有更新的节点！！
    // element就是父亲节点的大儿子，是最新的虚拟DOM，也就是接下来要处理的节点！！
    // expirationTime就是全局的nextRenderET（就是root的nextETToWork）

    var key = element.key;
    var child = currentFirstChild;


    // 在首次渲染的时候，currentFirstChild是null
    // 如果有替身，就用替身，不用再新建一个fiber
    while (child !== null) {
      // 1. 如果key是一样的，那继续操作（目的是拿到孩子们的fiber）
      if (child.key === key) {
        if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.elementType === element.type) {
          // 1.1 如果类型是一样的，继续操作

          // 把其他兄弟姐妹的节点删掉（因为当前是处理单个节点的情况，看函数名字！！）
          deleteRemainingChildren(returnFiber, child.sibling);

          // 【给孩子节点层创建替身】给当前节点的孩子（当前节点肯定只有一个孩子）创造替身
          var existing = useFiber(child, element.type === REACT_FRAGMENT_TYPE ? element.props.children : element.props, expirationTime);

          // 更新亲子关系的指针
          existing.ref = coerceRef(returnFiber, child, element);
          existing.return = returnFiber;

          // 这个existing就是大儿子
          return existing;

        } else {
          // 1.2 如果连类型都不一样，那直接删掉剩下的所有吧（注意，这里只是做个标记而已！）
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        // 2. 如果连key都不一样，那就把本次这个节点直接删掉好了
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }


    // 首次渲染（child为null）走下面的
    // 新旧节点的key（删掉自己）和类型（删掉剩下所有的）都不一样，走下面


    // 空标签走下面的逻辑
    if (element.type === REACT_FRAGMENT_TYPE) {
      var created = createFiberFromFragment(element.props.children, returnFiber.mode, expirationTime, element.key);
      created.return = returnFiber;
      return created;

    } else {
      // 单纯的函数组件或类组件走下面的逻辑

      // 给自己创建一个fiber
      var _created4 = createFiberFromElement(element, returnFiber.mode, expirationTime);

      // 【注意】然后更新ref属性，父元素的ref属性传入给子元素！！！【forwardRef】（父元素肯定有ref，因为是必须要自己写上的！！）
      _created4.ref = coerceRef(returnFiber, currentFirstChild, element);

      // 给return的属性赋予父亲fiber
      _created4.return = returnFiber;
      return _created4;
    }
  }

  function reconcileSinglePortal(returnFiber, currentFirstChild, portal, lanes) {
    // currentFirstChild就是父亲fiber节点的替身的大儿子fiber，也就是当前在页面显示出来的还没有更新的节点！！
    // portal就是父亲节点的大儿子，是最新的虚拟DOM，也就是接下来要处理的节点！！
    // 这个portal的虚拟DOM的形式如下：【没有props属性】
    // {
    //   $$typeof: REACT_PORTAL_TYPE,
    //   key: key == null ? null : '' + key,
    //   children: children,
    //   containerInfo: containerInfo,
    //   implementation: implementation
    // }


    var key = portal.key;
    var child = currentFirstChild;

    // 在首次渲染的时候，currentFirstChild是null
    // 如果有替身，就用替身，不用再新建一个fiber
    while (child !== null) {
      if (child.key === key) {
        if (child.tag === HostPortal && child.stateNode.containerInfo === portal.containerInfo && child.stateNode.implementation === portal.implementation) {
          // 使用旧fiber
          deleteRemainingChildren(returnFiber, child.sibling);
          var existing = useFiber(child, portal.children || []);
          existing.return = returnFiber;
          // 直接return出去，不走下面的sibling
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
    // 创建一个新的fiber
    var created = createFiberFromPortal(portal, returnFiber.mode, lanes);
    created.return = returnFiber;
    return created;
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
    var fiber = createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, expirationTime);
    {
      fiber._debugSource = element._source;
      fiber._debugOwner = element._owner;
    }
    return fiber;
  }

  function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, expirationTime) {
    var fiber = void 0;

    // 先假定一个中间类型的fiberTag
    var fiberTag = IndeterminateComponent;
    // 这是虚拟DOM的类型
    var resolvedType = type;

    // 开始定义fiberTag
    // 函数组件下面的判断都走不了，fiberTag只能是IndeterminateComponent
    // (但是后面在mountIndeterminateComponent的时候会改为FunctionComponent，
    // 设这个的目的是用来在首渲阶段把处理函数/类组件的逻辑整合到一起）
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
        }
      }
    }

    fiber = createFiber(fiberTag, pendingProps, key, mode);
    fiber.elementType = type;
    fiber.type = resolvedType;
    fiber.expirationTime = expirationTime;

    return fiber;
  }

  function createFiberFromPortal(portal, mode, lanes) {
    // portal的pendingProps不是普通的虚拟DOM的pendingProps，就是children本身！
    // 因此在以portal为父节点进入reconciliationChildren的函数的时候，传入的nextChild参数就是pendingProps本身
    var pendingProps = portal.children !== null ? portal.children : [];
    var fiber = createFiber(HostPortal, pendingProps, portal.key, mode);
    fiber.lanes = lanes;

    // portal的fiber的stateNode不是原生dom本身，而是一个对象，里面的containerInfo是dom树真正的父节点！
    fiber.stateNode = {
      containerInfo: portal.containerInfo,
      pendingChildren: null,
      implementation: portal.implementation
    };
    return fiber;
  }

  function shouldConstruct(Component) {
    var prototype = Component.prototype;
    return !!(prototype && prototype.isReactComponent);
  }

  function coerceRef(returnFiber, current$$1, element) {
    // returnFiber就是父节点
    // current$$1就是父亲fiber节点的替身的大儿子fiber，也就是当前在页面显示出来的还没有更新的节点！！
    // element就是父亲节点的大儿子，是最新的虚拟DOM，也就是接下来要处理的节点！！

    // 拿到孩子当前的ref
    var mixedRef = element.ref;

    // 处理字符串类型的ref
    if (
      mixedRef !== null &&
      typeof mixedRef !== "function" &&
      typeof mixedRef !== "object"
    ) {
      {
        if (returnFiber.mode & StrictMode) {
          var componentName = getComponentName(returnFiber.type) || "Component";
          if (!didWarnAboutStringRefInStrictMode[componentName]) {
            didWarnAboutStringRefInStrictMode[componentName] = true;
          }
        }
      }

      if (element._owner) {
        var owner = element._owner;
        var inst = void 0;
        if (owner) {
          var ownerFiber = owner;
          inst = ownerFiber.stateNode;
        }

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
        // 警告信息
      }
    }

    // 对象类型的ref直接返回本身
    return mixedRef;
  }

  // 给单个孩子节点赋予place（新增）的副作用标识
  function placeSingleChild(newFiber) {
    // placement的标识说明这是一个新建的fiber
    // shouldTrackSideEffects肯定是true
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement;
    }
    // 如果是更新，直接return，不走上面的逻辑
    return newFiber;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, expirationTime) {
    // 这里源码说有双端优化的更好的算法！！
    // 针对某一层进行处理！！！

    // 入参：
    // currentFirstChild是替身WIP的大儿子
    // newChildren是数组形式的虚拟DOM

    {
      // 检查key是否重复，是否是字符串类型
      // 保证每个子元素的 key 是唯一的，并且不会在子树中产生重复
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


    // 0. 总说明，
    // 总共有三轮循环：
    // 1）顺序比对
    // 2）新建节点
    // 3）map查询式比对

    // 可能发生的情况如下：
    // （1）顺序比对 + （中途在“key匹配不上”或“旧节点位于右侧”这两个情况停下，oldFiber还有值，进不去第二轮） + map查询式比对
    // （2）顺序比对 + （key全部匹配上了，旧fiber遍历到底部，newIndx还有值） + 新建节点（结束后newIndx到末尾，进不去第三轮）



    // 1. 第一轮循环：顺序比对（目的是找key按顺序匹配的情况）
    // !下面是更新时的逻辑（oldFiber存在）
    // (经过首次渲染，lastPlacedIndex为0)
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {

      // 1.1 检查位置是否正确，并提前更新下一个需要处理的旧子节点
      if (oldFiber.index > newIdx) {
        // 什么时候会进来这种情况？？？
        // 说明原本在后面的旧子节点被往前移动了，比如：
        // 旧的子节点列表（oldFiber 链表）：
        //   oldFiber1，index = 0
        //   oldFiber2，index = 2
        //   oldFiber3，index = 3
        // 新的子节点列表（newChildren 数组）：
        //   newChild1，index = 0
        //   newChild2，index = 1
        //   newChild3，index = 2
        //   newChild4，index = 3
        // 在遍历到第二次的时候，new的index为1，而旧的index为2，匹配不上！
        // 此时暂停顺序比对，因为此时说明旧的子节点列表中有节点被删除或移动

        // oldFiber设为null，在后面的updateSlot那里会让新节点也输出null，然后直接break退出循环。
        // 不去第二轮的【新建节点】环节，去到【查找比对】环节，后续需要通过Map处理可能的移动或新增节点。
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        // 旧节点在左侧时继续处理
        // 提前更新nextOldFiber
        nextOldFiber = oldFiber.sibling;
      }

      // 1.2 更新每个子节点
      // （1）尝试复用旧节点（仅仅根据key逐一比对）
      // 更新的时候，走这里【给孩子节点层创建替身】
      var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);

      // （2）拿不到可复用的（key不一样）
      // ?!直接退出循环（剩下的也不管了？），去到【查找比对】环节
      // 退出循环是因为顺序比对已失效，顺序比对的前提是key按顺序匹配。当遇到key不匹配时，继续顺序比对没有意义。
      // 后续需要通过Map处理可能的移动或新增节点。
      if (newFiber === null) {
        // 这里是key不匹配，直接break，oldFiber还有值，继续在第三轮处理本次的这个旧fiber（使得进不去第二轮循环）
        if (oldFiber === null) {
          // 两个都为null（是oldFiber.index > newIdx的情况），直接break，oldFiber还有值，继续在第三轮处理本次的这个旧fiber（使得进不去第二轮循环）
          oldFiber = nextOldFiber;
        }
        break;
      }

      // （!删除逻辑!）
      // （3）删除数组中的旧子节点
      // 更新时shouldTrackSideEffects为true
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // 新的 Fiber 没有复用旧的 Fiber，此时需要删除旧的子节点
          deleteChild(returnFiber, oldFiber);
        }
      }

      // （4）移动或新增节点
      // diff算法，看谁需要移动，谁需要插入（移动和插入都是placement）
      // 注意：这里面没有处理（!删除逻辑!）
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);


      // 1.3 处理每个孩子相互之间的sibling关系
      // 构建新Fiber链表
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;

      // 横向处理下一个oldFiber
      oldFiber = nextOldFiber;
    }



    // 2. 第二轮循环：处理剩余节点（新旧数组分别多出来的）
    // 有可能在这里是因为一个数组前半部分的key对了，后面的没对上（旧数组多了 或者 新数组多了）

    // （!删除逻辑!）
    // 2.1 （旧数组多出来的）删除数组之外的旧节点
    // 到了新数组的最后，把现有的（旧fiber）以及剩下的都删掉
    if (newIdx === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }


    // 2.2 （新数组多出来的）剩余的新节点全部插入
    // 仅当旧Fiber已全部遍历完时触发，
    // 也就是说，只有在第一轮循环遍历到底部（旧fiber为null）的时候才会进来，这个接着的newIdx就是新数组多出来的节点的起始点
    // 没有剩余的旧子节点，说明新子节点多于旧子节点，需要遍历剩下的新子节点并创建它们
    // !首次渲染走下面
    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {

        // 2.2.1 首先新建孩子fiber，每个孩子都新建一个fiber。
        // 由此可见当遍历到一个节点的时候，他的所有孩子节点都会相应地建立起fiber
        // 往右探索的时候，这个fiber已经存在了
        var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);
        if (!_newFiber) {
          continue;
        }

        // 2.2.2 然后移动孩子的顺序，都是新增的节点（没有替身）最后lastPlacedIndex不变，还是为0
        // 这里给fiber加上index的属性，记录位置
        lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);

        // 2.2.3 继续为previousNewFiber链表新增节点（需要新增的节点）
        // （在这里赋予sibling的属性）
        // 首次渲染且遍历第一遍这个previousNewFiber变量为null
        // 更新时，previousNewFiber为上一轮遍历留下来的，继续往后面添加
        if (previousNewFiber === null) {
          // 让大儿子变量（resultingFirstChild）为_newFiber
          resultingFirstChild = _newFiber;
        } else {
          // 遍历第二遍往后
          // 在这里赋予sibling的属性
          previousNewFiber.sibling = _newFiber;
        }

        // 让当前的fiber进入一个中间变量（等待空间）等待下一次给他赋予sibling的属性，以便连接兄弟
        previousNewFiber = _newFiber;
      }

      // 返回大儿子
      return resultingFirstChild;
    }


    // 3. 第三轮循环：查询式比对（非顺序比对）
    // 这里是newIdx还有效的时候才会进来，也就是一旦进入了第二轮遍历，就不可能进入第三轮遍历

    // 3.1 存一下孩子fiber和key的关系，返回一个map映射表（以key或index为键， fiber本身为孩子）
    // 注意，这里存的是 “ 未被第一轮顺序比对处理的所有旧Fiber节点 ” ，也就是存的是需要进行移动的旧节点（oldFiber以及其往后的兄弟姐妹）
    var existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // 3.2 使用现有的子节点进行更新
    for (; newIdx < newChildren.length; newIdx++) {
      // （1）从旧的映射里面找到可复用的节点（不是逐一顺序比对key，而是从映射表里面查找）
      var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], expirationTime);

      // （2）将已被复用的旧节点从existingChildren中移除，标记副作用，添加到链表
      if (_newFiber2) {
        if (shouldTrackSideEffects) {
          if (_newFiber2.alternate !== null) {
            // 如果这个节点是存在替身的，说明是复用的，删掉existingChildren里面的这个_newFiber2
            // 因为existingChildren存的是需要删除的节点，可复用的节点不能被删掉了
            // 怎么复用？alternate指向map找到的旧节点就行，不需要移动（删除 + 新增）
            existingChildren.delete(_newFiber2.key === null ? newIdx : _newFiber2.key);
          }
        }

        // （3）移动或新增节点标记（这个时候的fiber是替身fiber，且属性已经更新（虽然可能属性不变，只是移动了一下节点）
        // 然后标记副作用，然后后面提交的时候就会更新（实际上如果仅仅只是移动也不太需要更新）
        lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);

        // （4）继续为previousNewFiber链表新增节点（需要移动的节点）
        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber2;
        } else {
          previousNewFiber.sibling = _newFiber2;
        }
        previousNewFiber = _newFiber2;
      }
    }

    // 3.3 剩下的所有都是没找到复用的节点的，直接删掉（标记删除）吧！
    if (shouldTrackSideEffects) {
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
        // 那就说明左边有（更远的）东西要向右移动到这里，这个节点本身自己则不需要处理，同时更新一下最大的lastPlacedIndex
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

    // returnFiber是父亲fiber
    // currentFirstChild是父亲fiber的替身的大儿子（也是一个fiber），也就是当前页面显示的对应的节点

    if (!shouldTrackSideEffects) {
      return null;
    }

    // 标记这个fiber为删掉，
    // 一种情况是：因为newChild(新的虚拟DOM)为null，来到这里
    // 另一种情况是：在更新的时候，对比两个单独的fiber之间，发现 类型 不一样，把替身的这个fiber删掉
    var childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  }


  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      return;
    }

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


  function useFiber(fiber, pendingProps, expirationTime) {
    // 拿到当前的更新过的WIP（拿的是替身的）
    // 更新阶段，相当于在这里给当前节点的孩子们创造替身
    var clone = createWorkInProgress(fiber, pendingProps, expirationTime);

    // 我们目前在这里将兄弟设置为null，索引设置为0，因为在返回它之前很容易忘记这样做。
    // 例如，对于独生子女的情况。
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {

    // 入参：
    // oldFiber是替身WIP的某个儿子（外面在遍历中，oldFiber是替身WIP的任意一个儿子）
    // newChild是单个虚拟DOM（从newChildren里面用索引拿出来的）

    var key = oldFiber !== null ? oldFiber.key : null;

    // 如果孩子是文本节点
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // 文本节点没有 key
      if (key !== null) {
        return null;
      }
      return updateTextNode(returnFiber, oldFiber, '' + newChild, expirationTime);
    }

    // 如果孩子是对象（数组形式的孩子不会走下面，因为数组没有$$typeof属性）
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            // 判断新旧节点的key是否一样
            if (newChild.key === key) {
              // 如果新旧节点的key是一样的
              if (newChild.type === REACT_FRAGMENT_TYPE) {
                return updateFragment(returnFiber, oldFiber, newChild.props.children, expirationTime, key);
              }
              // 更新节点，返回替身（但是把属性都更新了，包括props）
              return updateElement(returnFiber, oldFiber, newChild, expirationTime);
            } else {
              // 新旧节点的key不一样，说明新节点需要重新创建
              return null;
            }
          }

        case REACT_PORTAL_TYPE:
          {
            if (newChild.key === key) {
              // 如果新旧节点的key是一样的，尝试复用
              return updatePortal(returnFiber, oldFiber, newChild, expirationTime);
            } else {
              return null;
            }
          }
      }

      // 如果孩子是数组
      if (isArray(newChild) || getIteratorFn(newChild)) {
        // 如果key存在就返回一个null， 因为React不允许数组元素有key
        if (key !== null) {
          return null;
        }

        return updateFragment(returnFiber, oldFiber, newChild, expirationTime, null);
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

  function updateElement(returnFiber, current$$1, element, expirationTime) {

    // current$$1是父节点的替身的孩子（对应的是当前孩子）
    // （注意！不是孩子本身的替身，这个仅仅用于看当前是什么阶段，如果是第一次更新：
    // 父节点替身的孩子是有的，但是这个孩子就没有替身了，也就是没有第二个节点，需要新建）
    // element是需要新建/复用fiber的新虚拟DOM

    if (current$$1 !== null && current$$1.elementType === element.type) {
      // 说明是更新阶段
      // 复用/新建替身
      var existing = useFiber(current$$1, element.props, expirationTime);
      existing.ref = coerceRef(returnFiber, current$$1, element);
      existing.return = returnFiber;
      {
        existing._debugSource = element._source;
        existing._debugOwner = element._owner;
      }
      // 返回替身fiber
      return existing;
    } else {
      // 说明是首渲阶段
      // 新建一个fiber
      var created = createFiberFromElement(element, returnFiber.mode, expirationTime);
      created.ref = coerceRef(returnFiber, current$$1, element);
      created.return = returnFiber;
      return created;
    }
  }

  function updateFragment(returnFiber, current$$1, fragment, expirationTime, key) {
    if (current$$1 === null || current$$1.tag !== Fragment) {
      // 没有替身
      var created = createFiberFromFragment(fragment, returnFiber.mode, expirationTime, key);
      created.return = returnFiber;
      return created;
    } else {
      // 有替身
      var existing = useFiber(current$$1, fragment, expirationTime);
      existing.return = returnFiber;
      return existing;
    }
  }

  function updatePortal(returnFiber, current, portal, lanes) {
    if (current === null || current.tag !== HostPortal || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) {
      // Insert
      var created = createFiberFromPortal(portal, returnFiber.mode, lanes);
      created.return = returnFiber;
      return created;
    } else {
      // Update
      var existing = useFiber(current, portal.children || []);
      existing.return = returnFiber;
      return existing;
    }
  }

  function mapRemainingChildren(returnFiber, currentFirstChild) {
    var existingChildren = new Map();

    var existingChild = currentFirstChild;
    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild);
      } else {
        existingChildren.set(existingChild.index, existingChild);
      }
      existingChild = existingChild.sibling;
    }
    return existingChildren;
  }

  // 这个很像updateSlot
  function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {

    // 孩子是文本节点
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var matchedFiber = existingChildren.get(newIdx) || null;
      return updateTextNode(returnFiber, matchedFiber, '' + newChild, expirationTime);
    }

    // 孩子是一个虚拟DOM（对象）
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            var _matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
            if (newChild.type === REACT_FRAGMENT_TYPE) {
              return updateFragment(returnFiber, _matchedFiber, newChild.props.children, expirationTime, newChild.key);
            }
            // 查看是否可以复用旧fiber
            return updateElement(returnFiber, _matchedFiber, newChild, expirationTime);
          }
        case REACT_PORTAL_TYPE:
          {
            var _matchedFiber2 = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
            return updatePortal(returnFiber, _matchedFiber2, newChild, expirationTime);
          }
      }

      // 孩子是一个数组
      if (isArray(newChild) || getIteratorFn(newChild)) {
        var _matchedFiber3 = existingChildren.get(newIdx) || null;
        return updateFragment(returnFiber, _matchedFiber3, newChild, expirationTime, null);
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

  function updateTextNode(returnFiber, current$$1, textContent, expirationTime) {
    // 同步工作下，expirationTime都是一个Sync的最大时间
    if (current$$1 === null || current$$1.tag !== HostText) {
      // 首渲阶段
      var created = createFiberFromText(textContent, returnFiber.mode, expirationTime);
      created.return = returnFiber;
      return created;
    } else {
      // 更新阶段
      var existing = useFiber(current$$1, textContent, expirationTime);
      existing.return = returnFiber;
      return existing;
    }
  }

  function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, expirationTime) {
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
      var existing = useFiber(currentFirstChild, textContent, expirationTime);
      existing.return = returnFiber;
      return existing;
    }
    deleteRemainingChildren(returnFiber, currentFirstChild);
    var created = createFiberFromText(textContent, returnFiber.mode, expirationTime);
    created.return = returnFiber;
    return created;
  }

  return reconcileChildFibers;
}


var reconcileChildFibers = ChildReconciler(true);
var mountChildFibers = ChildReconciler(false);


function createFiberFromFragment(elements, mode, expirationTime, key) {
  var fiber = createFiber(Fragment, elements, key, mode);
  fiber.expirationTime = expirationTime;
  return fiber;
}

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

function mountIndeterminateComponent(_current, workInProgress, Component, renderExpirationTime) {
  // 入参：
  // _current是workInProgress的替身fiber
  // Component是workInProgress.elementType，如果是函数组件的话也就是函数组件的函数本身
  // renderExpirationTime是全局的nextRenderET（就是root的nextETToWork）

  // 更新阶段走下面，首次渲染阶段不走下面
  if (_current !== null) {
    _current.alternate = null;
    workInProgress.alternate = null;
    workInProgress.effectTag |= Placement;
  }

  // 1. 拿到当前的pendingProps，在createFiberFromElement的时候，props被存到了fiber的这个属性里面
  var props = workInProgress.pendingProps;

  // 2. 下面是在找这个函数组件是不是用了context
  // 获取自定义/默认的上下文
  var unmaskedContext = getUnmaskedContext(workInProgress, Component, false);
  // 复制自定义的上下文，进行检查/缓存的工作
  var context = getMaskedContext(workInProgress, unmaskedContext);

  // 看上下文的过期时间是否很大，很大（所剩不多）的话需要标记didReceivedUpdate更新！
  prepareToReadContext(workInProgress, renderExpirationTime);

  var value = void 0;

  {
    // 3. 真正的函数隐藏在里面！！！使用钩子的函数组件的更新！！（包含函数的调用）
    // 重要的函数！！跟hooks相关的
    // 把当前的workInProgress保存到ReactCurrentOwner$3.current
    ReactCurrentOwner$3.current = workInProgress;
    // 把hooks的工具箱赋给全局变量，这样react对象就能拿到对应的函数，在函数组件执行中就能使用这些钩子函数
    // 拿到的是孩子树
    value = renderWithHooks(null, workInProgress, Component, props, context, renderExpirationTime);
  }

  // React DevTools副作用
  workInProgress.effectTag |= PerformedWork;


  // 4. 开始分发（根据孩子树的类型）
  // 第一种情况是是一个类组件
  // !（但是实际上，类组件在beginWork里面分发之后，是去到updateClassComponent了，不会走下面）
  if (typeof value === "object" && value !== null && typeof value.render === "function" && value.$$typeof === undefined) {
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

    var getDerivedStateFromProps = Component.getDerivedStateFromProps;
    if (typeof getDerivedStateFromProps === "function") {
      applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, props);
    }

    // 4.4 更新类组件：
    adoptClassInstance(workInProgress, value);
    mountClassInstance(workInProgress, Component, props, renderExpirationTime);
    return finishClassComponent(null, workInProgress, Component, true, hasContext, renderExpirationTime);

  } else {

    // 第二种情况不是一个类组件，其他任何类型只要不是类组件都归类于FunctionComponent
    workInProgress.tag = FunctionComponent;

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

function getUnmaskedContext(workInProgress, Component, didPushOwnContextIfProvider) {

  // PS：从constructClassInstance过来的didPushOwnContextIfProvider是true

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
  // 复制一份自定义的上下文对象（经过检查和缓存的）
  var type = workInProgress.type;
  var contextTypes = type.contextTypes;

  // 处理一下可以额外提前退出的情况
  // 1）这里在找函数中是不是用了context上下文，不是的话就直接回到原来的函数了
  if (!contextTypes) {
    return emptyContextObject;
  }

  // 2）如果是类组件，拿到类组件的实例，如果之前保存过在这个属性里面，就直接返回，不用费内存再复制一份
  var instance = workInProgress.stateNode;
  if (instance && instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext) {
    return instance.__reactInternalMemoizedMaskedChildContext;
  }

  // 复制一份上下文
  var context = {};
  for (var key in contextTypes) {
    context[key] = unmaskedContext[key];
  }

  // 检查上下文对象的属性的合法性
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

  // 如果是类组件，缓存这个上下文到类组件实例里面
  if (instance) {
    cacheContext(workInProgress, unmaskedContext, context);
  }

  // 返回复制的自己定义的一个上下文对象
  return context;
}



function prepareToReadContext(workInProgress, renderExpirationTime) {
  currentlyRenderingFiber = workInProgress;

  // 重置了当前上下文依赖的状态。
  lastContextDependency = null;
  // 重置当前渲染过程中上下文的观察状态。
  lastContextWithAllBitsObserved = null;

  var currentDependencies = workInProgress.contextDependencies;

  // 检查当前 Fiber 节点是否有上下文依赖
  // 以及这些上下文的过期时间是否大于或等于 renderExpirationTime（即是否有挂起的更新，即将要处理的更新）
  if (
    currentDependencies !== null &&
    currentDependencies.expirationTime >= renderExpirationTime
  ) {
    // 记录当前 Fiber 节点已经收到了一个更新，这样就能确保这个 Fiber 在渲染时能够正确地处理依赖的上下文变化。
    // 设置didReceivedUpdate为true
    markWorkInProgressReceivedUpdate();
  }

  // 重置当前 Fiber 节点的上下文依赖。
  workInProgress.contextDependencies = null;
}





function renderWithHooks(current, workInProgress, Component, props, refOrContext, nextRenderExpirationTime) {
  // 入参：
  // 从mountIndeterminateComponent过来的current为null
  // Component是函数组件的函数本身
  // props是WIPfiber的pendingProps
  // refOrContext是context对象或者ref
    // 从mountIndeterminateComponent过来的话就是context
    // 从updateForwardRef过来的就是ref【forwardRef】
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
      ReactCurrentDispatcher$1.current = HooksDispatcherOnMountWithHookTypesInDEV;
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

  // 【forwardRef】第二个参数就是ref，这个ref就是当前的workInProgress的父节点的ref
  // 在reconcileSingleElement那边，子元素的ref被赋予了父元素的ref值，而父元素肯定有ref值，因为这是使用这个功能所必须要写的
  var children = Component(props, refOrContext);


  // 是否在当前执行的渲染过程中安排了更新，首次渲染的时候这个变量为false，不走这里
  // 更新阶段应该会走这里，这里是在找到hook的链条，然后从头开始计数，同时执行函数，得到最后被覆盖的最新的子树
  if (didScheduleRenderPhaseUpdate) {
    do {
      didScheduleRenderPhaseUpdate = false;
      numberOfReRenders += 1;

      nextCurrentHook = current !== null ? current.memoizedState : null;
      nextWorkInProgressHook = firstWorkInProgressHook;

      currentHook = null;
      workInProgressHook = null;
      componentUpdateQueue = null;
      {
        hookTypesUpdateIndexDev = -1;
      }
      ReactCurrentDispatcher$1.current = HooksDispatcherOnUpdateInDEV;

      children = Component(props, refOrContext);
    } while (didScheduleRenderPhaseUpdate);

    renderPhaseUpdates = null;
    numberOfReRenders = 0;
  }


  // 4. 函数组件执行完之后，对一些全局变量进行覆盖更新

  ReactCurrentDispatcher$1.current = ContextOnlyDispatcher;

  // 拿到已经执行过函数的WIP
  var renderedWork = currentlyRenderingFiber$1;

  // （1）WIP的state保存一下hook链条的第一个hook对象
  // 也就是说，凡是函数组件，他的state就是hook链条的第一个
  renderedWork.memoizedState = firstWorkInProgressHook;

  // （2）首次渲染的时候，WIP的eT改为了NoWork
  // !在这里把【eT改为0】，说明已经执行过了
  renderedWork.expirationTime = remainingExpirationTime;

  // （3）WIP的更新队列变成了effect的链表
  // 注意：函数类型的fiber的updateQueue不是update对象的链表，而是effect对象的链表componentUpdateQueue
  // （准确来说是effect对象的环形链表的最后一个，保存在componentUpdateQueue的lastEffect属性里面）
  // !这个时候已经在useEffect那里保存好了，然后接下来会在提交阶段的commitPassive那边用到
  renderedWork.updateQueue = componentUpdateQueue;

  // （4）变成有副作用的effectTag，后续会在提交阶段执行副作用并调度
  // 注意，这里的sideEffectTag默认是0，只有在有且执行effect相关的钩子才会把sideEffectTag改掉
  renderedWork.effectTag |= sideEffectTag;


  // 5. 重置所有的hook相关的全局变量
  // 把renderExpirationTime也变为0，为什么？？？
  // 这个renderExpirationTime什么时候会用到
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

  // 剩余时间也改为0？？？
  remainingExpirationTime = NoWork;
  componentUpdateQueue = null;
  sideEffectTag = 0;

  // These were reset above
  // didScheduleRenderPhaseUpdate = false;
  // renderPhaseUpdates = null;
  // numberOfReRenders = 0;


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
  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
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
  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
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
    // 有替身！！更新过一次之后，第二次更新时，就有了替身了
    // 这个时候仅仅只是创建一个update对象，并不会进去scheduleWork
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
    // 保存在一个map映射表里面，WIP的updateQueue为key，update对象为值
    var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
    if (firstRenderPhaseUpdate === undefined) {
      renderPhaseUpdates.set(queue, update);
    } else {
      // 加到update对象链条的末尾
      var lastRenderPhaseUpdate = firstRenderPhaseUpdate;
      while (lastRenderPhaseUpdate.next !== null) {
        lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      }
      lastRenderPhaseUpdate.next = update;
    }

  } else {
    // 首次渲染，之后进行的交互，此刻没有替身fiber

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

    // 4. 把这个新建的对象放到hook.queue的last属性里面，也就是说last属性是update对象链表
    var _last = queue.last;
    if (_last === null) {
      // 链表里面有无东西，创造环形链表
      _update2.next = _update2;
    } else {
      // 判断是否存在环形链表
      var first = _last.next;
      if (first !== null) {
        _update2.next = first;
      }
      _last.next = _update2;
    }
    // hook的queue的last属性存的是update链表（且是最后一个update）
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

    // 接下来如果这个click函数里面还有下一个setXXX，就继续新建update，然后加入到hook的queue的last属性（update链表）的最后一个
    // 所有setXXX整理完之后，才会结束dispatchAction函数，在batchedUpdates$1函数的finally部分进入performSyncWork
  }
}


function is(x, y) {
  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
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






// 7. useLayoutEffect钩子函数

function mountLayoutEffect(create, deps) {
  return mountEffectImpl(Update, UnmountMutation | MountLayout, create, deps);
}
// 此外，useLayoutEffect的hookEffectTag变成UnmountMutation或者MountLayout


// function mountEffect(create, deps) {
//   return mountEffectImpl(Update | Passive, UnmountPassive | MountPassive, create, deps);
// }


// 这个于useEffect的区别在于：
// useLayoutEffect是用的Update的fiber副作用
// 是在commitAllHostEffect那里执行卸载函数，在commitLifeCycles那里执行挂载函数（页面绘制之后）
// 是同步操作

// 而useEffect用的是passive的fiber副作用，
// passive是在绘制页面完成之后才进行操作
// 是异步操作









// REVIEW - 【上下文】下面是上下文相关的方法
// !包括初始化上下文对象，provider的组件更新，useContext钩子函数



// 建立一个全局的上下文对象（存储数据的仓库）
// !实际上这个方法在React.render函数执行之前执行
// 第二个参数如果自己没有输入的话就是null，在calculateChangedBits函数内部，如果上下文变化了，那changedBits就是maxSigned31BitInt
function createContext(defaultValue, calculateChangedBits) {
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null;
  } else {
  }

  var context = {
    // 这个REACT_CONTEXT_TYPE就是“Context.Consumer”
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
      // 这个REACT_CONTEXT_TYPE就是“Context.consumer”
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

  // 1. 拿到初始化的上下文对象
  var providerType = workInProgress.type;
  var context = providerType._context;

  var newProps = workInProgress.pendingProps;
  var oldProps = workInProgress.memoizedProps;

  // 2. 拿到这个fiber的props里面的value
  var newValue = newProps.value;


  // 3. 构建/更新最新的上下文，把Provider的value放到全局的context里面
  // 消费者从哪里拿到？答：在useContext钩子或函数组件实例的context属性或consumer那边
  pushProvider(workInProgress, newValue);


  // 4. 更新的时候，比较两个上下文是否发生了变化
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
      // 上下文已经变化，修改consumer的节点或保存了上下文的函数/类组件节点的eT及其祖上的childET
      // 一般更新的时候上下文都会变，因为在生成<>创造虚拟DOM的时候，新建了一个对象，是不同的内存地址
      propagateContextChange(workInProgress, context, changedBits, renderExpirationTime);
    }
  }

  // 然后开始调和孩子树
  var newChildren = newProps.children;
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

    // 总结：上面相当于nextValue存到valueCursor的current里面 以及 _context的_currentValue里面
    // valueCursor存到一个数组里面


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



function calculateChangedBits(context, newValue, oldValue) {
  if (is(oldValue, newValue)) {
    // 没变化，返回0
    return 0;
  } else {
    // 这里肯定有变化
    // 看是哪一位发生了变化
    var changedBits = typeof context._calculateChangedBits === 'function' ? context._calculateChangedBits(oldValue, newValue) : maxSigned31BitInt;
    return changedBits | 0;
  }
}





// 下面是useContext钩子的函数

function useContext(Context, unstable_observedBits) {
  // 拿到hooks的工具箱
  var dispatcher = resolveDispatcher();
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

  // lastContextWithAllBitsObserved初始为null，在prepareToReadContext函数里面也将其变为null
  if (lastContextWithAllBitsObserved === context) {
    // 当前上下文已经被完全观察（意味着之前已经被更新过了）

  } else if (observedBits === false || observedBits === 0) {
    // 当前不打算监听任何更新

  } else {
    // 如果 observedBits 是一个数字并且不等于最大值 maxSigned31BitInt
    // 表示当前只想监听上下文的某些更新

    var resolvedObservedBits = void 0;
    if (typeof observedBits !== 'number' || observedBits === maxSigned31BitInt) {
      // 如果是最大的数字，表示希望监听所有更新
      // 改变lastContextWithAllBitsObserved为当前的上下文，说明已经监听了当前的上下文
      lastContextWithAllBitsObserved = context;
      resolvedObservedBits = maxSigned31BitInt;
    } else {
      // 不是的话，更新resolvedObservedBits为当前的数字
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
      // 首次渲染进入
      // 保存到lastContextDependency
      lastContextDependency = contextItem;

      // 同时当前Fiber也要保存，且再包装一层对象，加上过期时间
      // 此时的fiber就是:
      // 函数组件本身（从useContext来的）或者 
      // 类组件本身（从updateClassInstance、mountClassInstance、constructClassInstance来的）或者 
      // 函数/类组件下面的大孩子即consumer组件<Context.Consumer>（这种组件他的孩子是(value)=>{}函数）（从updateContextConsumer来的）
      // 1和3一般很少共存！用了钩子就不需要用consumer去拿数据了
      currentlyRenderingFiber.contextDependencies = {
        first: contextItem,
        expirationTime: NoWork
      };
    } else {
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  }

  // 返回之前在provider里面push进去过的_currentValue，也就是provider的value的对象/或者其他任何自己定义的数据
  return isPrimaryRenderer ? context._currentValue : context._currentValue2;
}



function propagateContextChange(workInProgress, context, changedBits, renderExpirationTime) {
  // 本函数是从provider的孩子开始，找到保存了上下文的函数组件或者类组件或者consumer组件，凡是fiber有保存上下文对象的都要处理
  // 找到之后干嘛？答：修改当前fiber与替身的eT，以及所有祖上的childET

  // 拿到provider的孩子，也就是说本函数是从provider的孩子开始起更新的
  var fiber = workInProgress.child;
  if (fiber !== null) {
    fiber.return = workInProgress;
  }

  // 将provider的孩子作为起点，开始往下遍历
  // 直到找到 保存了上下文的 函数组件 或者 类组件 或者consumer组件 为止，凡是fiber有保存上下文对象的都要处理
  // 然后修改当前节点的eT和每一个祖上的childET
  while (fiber !== null) {
    var nextFiber = void 0;

    // 拿到上下文相关信息（如果是consumer就可以拿到）
    var list = fiber.contextDependencies;
    if (list !== null) {
      // 提前设置下一个处理的fiber（下面一个节点）
      nextFiber = fiber.child;

      // 拿到上下文对象（只有consumer（类组件就是类组件本身，函数组件就是）才能拿到）
      var dependency = list.first;
      while (dependency !== null) {
        // 查看上下文依赖与传入的是否一样，一般来说都是一样的
        if (dependency.context === context && (dependency.observedBits & changedBits) !== 0) {

          // 如果是类组件（contextType有值）的话，修改更新的tag为强制更新！
          if (fiber.tag === ClassComponent) {
            // 新建一个update对象
            var update = createUpdate(renderExpirationTime);

            // 【改tag】，改一下更新队列的update对象为强制更新
            update.tag = ForceUpdate;

            // 把update对象放到queue里面
            enqueueUpdate(fiber, update);
          }

          // 【更新本eT与祖上childET】
          // 如果renderExpirationTime比较大，更新一下当前fiber及其替身的时间
          if (fiber.expirationTime < renderExpirationTime) {
            fiber.expirationTime = renderExpirationTime;
          }
          var alternate = fiber.alternate;
          if (alternate !== null && alternate.expirationTime < renderExpirationTime) {
            alternate.expirationTime = renderExpirationTime;
          }

          // 向上遍历，更新每一个祖先的childExpirationTime时间
          // 在更新阶段，这里的childExpirationTime全部变为sync了
          scheduleWorkOnParentPath(fiber.return, renderExpirationTime);

          // 把fiber里面的contextDependencies存的这个时间也改一下
          if (list.expirationTime < renderExpirationTime) {
            list.expirationTime = renderExpirationTime;
          }

          break;
        }
        // 如果不一样就要一直找下去
        dependency = dependency.next;
      }

    } else if (fiber.tag === ContextProvider) {
      // 如果是一个ContextProvider，往下遍历，啥也不干
      nextFiber = fiber.type === workInProgress.type ? null : fiber.child;

    } else if (enableSuspenseServerRenderer && fiber.tag === DehydratedSuspenseComponent) {
      // ssr的逻辑
      if (fiber.expirationTime < renderExpirationTime) {
        fiber.expirationTime = renderExpirationTime;
      }
      var _alternate = fiber.alternate;
      if (_alternate !== null && _alternate.expirationTime < renderExpirationTime) {
        _alternate.expirationTime = renderExpirationTime;
      }
      scheduleWorkOnParentPath(fiber, renderExpirationTime);
      nextFiber = fiber.sibling;

    } else {
      // 其他不是provider（fiber没有上下文的那个属性），也不是ssr相关的fiber
      // 往下遍历
      nextFiber = fiber.child;
    }


    // 【上右或下右的遍历写法】
    // 遍历到最底层没有了
    if (nextFiber !== null) {
      nextFiber.return = fiber;
    } else {
      // 没有孩子，就回到上一个节点
      nextFiber = fiber;

      while (nextFiber !== null) {
        // 发现父亲回到了最开始的起点（WIP就是provider）
        if (nextFiber === workInProgress) {
          nextFiber = null;
          break;
        }

        // 开始从底层节点往右遍历，找到兄弟就退出循环，使得nextFiber变为兄弟
        var sibling = nextFiber.sibling;
        if (sibling !== null) {
          sibling.return = nextFiber.return;
          // 找兄弟
          nextFiber = sibling;
          break;
        }

        // 连兄弟也没有了，回到父亲，一直回去
        nextFiber = nextFiber.return;
      }
    }
    // 更新一下当前fiber的值
    // 因为fiber就是当前的要处理的节点（这里下一个代码就是处理fiber了）
    fiber = nextFiber;
  }
}



function scheduleWorkOnParentPath(parent, renderExpirationTime) {
  // 向上遍历，更新每一个祖先的时间
  var node = parent;
  while (node !== null) {
    var alternate = node.alternate;
    if (node.childExpirationTime < renderExpirationTime) {
      node.childExpirationTime = renderExpirationTime;
      if (alternate !== null && alternate.childExpirationTime < renderExpirationTime) {
        alternate.childExpirationTime = renderExpirationTime;
      }
    } else if (alternate !== null && alternate.childExpirationTime < renderExpirationTime) {
      alternate.childExpirationTime = renderExpirationTime;
    } else {
      // 某个祖上的时间都很大，意味着更上的节点的时间也很大，直接退出循环
      break;
    }
    node = node.return;
  }
}



// 一个myConetxt.Consumer组件，经过beginWork分发之后，来到这里
function updateContextConsumer(current$$1, workInProgress, renderExpirationTime) {
  // 拿到consumer对象
  var context = workInProgress.type;
  context = context._context;


  // 拿到新的props，以及参数为value的函数孩子
  var newProps = workInProgress.pendingProps;
  var render = newProps.children;

  // 看上下文的过期时间是否很大，很大（所剩不多）的话需要标记didReceivedUpdate更新！
  prepareToReadContext(workInProgress, renderExpirationTime);

  // 拿到当前的上下文里面的_currentValue值
  var newValue = readContext(context, newProps.unstable_observedBits);
  var newChildren = void 0;

  // 把当前的上下文newValue作为参数传给这个【参数为value的函数孩子】
  // 拿到孩子
  {
    ReactCurrentOwner$3.current = workInProgress;
    setCurrentPhase('render');
    newChildren = render(newValue);
    setCurrentPhase(null);
  }
  workInProgress.effectTag |= PerformedWork;

  // 处理孩子(这里的孩子是(value)=>{}下面的孩子，不是这个函数本身)
  reconcileChildren(current$$1, workInProgress, newChildren, renderExpirationTime);
  return workInProgress.child;
}












// REVIEW - 类组件经过beginWork分发来到updateClassComponent！！！！


function updateClassComponent(current$$1, workInProgress, Component, nextProps, renderExpirationTime) {
  // 入参：
  // current$$1是WIP的替身
  // Component是类组件的对象
  // nextProps是WIP的pendingProps
  // renderExpirationTime是全局的nextRenderExpirationTime


  // 1. 检查异常情况
  // 检查组件是否是惰性加载组件
  // 如果组件有 propTypes，就会使用 checkPropTypes 来检查 nextProps
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


  // 2. 处理上下文相关
  // 整合上下文，如果是类组件的话（不是<Conetxt.Provider>），isContextProvider(Component)为false
  var hasContext = void 0;
  if (isContextProvider(Component)) {
    hasContext = true;
    pushContextProvider(workInProgress);
  } else {
    hasContext = false;
  }

  // 查看上下文是否存在，且是否需要更新（要的话标记一下didReceivedUpdate的标识）
  prepareToReadContext(workInProgress, renderExpirationTime);


  // 3. 执行类组件constructor（初始化类组件）
  // 拿到这个组件的实例
  var instance = workInProgress.stateNode;
  var shouldUpdate = void 0;
  if (instance === null) {
    // 拿不到组件的实例，该实例尚未创建

    if (current$$1 !== null) {
      // 这是二更阶段，这个组件已经被渲染过，但是可能被置为不一样的状态，需要重新挂载
      // 重置一些变量，标记为需要新增的副作用
      current$$1.alternate = null;
      workInProgress.alternate = null;
      // Since this is conceptually a new fiber, schedule a Placement effect
      workInProgress.effectTag |= Placement;
    }

    // 首次渲染走这里，需要创造组件实例（上下文初始化，创造实例，保存信息）
    constructClassInstance(workInProgress, Component, nextProps, renderExpirationTime);
    // 并且挂载这个实例（上下文存储，更新state数据（update队列批量更新），执行生命周期函数）
    mountClassInstance(workInProgress, Component, nextProps, renderExpirationTime);

    // 这个标识类组件是否应该执行render函数
    shouldUpdate = true;

  } else if (current$$1 === null) {
    // 能够拿到组件实例，但是没有替身，说明是第一次挂载，
    // 需要恢复挂载
    shouldUpdate = resumeMountClassInstance(workInProgress, Component, nextProps, renderExpirationTime);
  } else {
    // 这是普通的更新阶段，是能够拿到组件实例，又有替身的情况
    // 返回是否需要更新的标识，以便后续判断是否需要执行render
    shouldUpdate = updateClassInstance(current$$1, workInProgress, Component, nextProps, renderExpirationTime);
  }

  // 4. 执行类组件的render方法，拿到大儿子
  var nextUnitOfWork = finishClassComponent(current$$1, workInProgress, Component, shouldUpdate, hasContext, renderExpirationTime)

  // 5. 返回大儿子，也就是执行render方法后返回的东西
  return nextUnitOfWork;
}





function constructClassInstance(workInProgress, ctor, props, renderExpirationTime) {
  // 入参：
  // ctor是类组件
  // nextProps是WIP的pendingProps


  // 1. 处理上下文
  // 拿到上下文相关变量
  var isLegacyContextConsumer = false;
  var unmaskedContext = emptyContextObject;
  var context = null;
  var contextType = ctor.contextType;

  // 检测上下文对象contextType的合理性...这里省略

  // 读取上下文，拿到上下文对象里面的value值，也就是用户自定义的上下文
  if (typeof contextType === 'object' && contextType !== null) {
    // （consumer的情况）有这个属性的话，直接读取里面的对象，同时把这个对象保存到全局
    context = readContext(contextType);

  } else {
    // 拿到自定义（如这个是一个consumer（有contextTypes属性））/默认的上下文
    unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    // 复制上下文，进行缓存/检查
    var contextTypes = ctor.contextTypes;
    isLegacyContextConsumer = contextTypes !== null && contextTypes !== undefined;
    context = isLegacyContextConsumer ? getMaskedContext(workInProgress, unmaskedContext) : emptyContextObject;
  }


  // 2. 初始化类组件，拿到实例和state，保存state

  // 注意：这里把context放进去初始化了，也就是说可以利用this.context拿到上下文的数据，不需要借助(value) => {...}
  var instance = new ctor(props, context);
  var state = workInProgress.memoizedState = instance.state !== null && instance.state !== undefined ? instance.state : null;

  // 保存一些信息（包括实例和fiber之间的相互引用）
  adoptClassInstance(workInProgress, instance);


  // 3. 处理生命周期函数（在执行render方法之前）
  // 检查生命函数名称是否正确
  {
    if (typeof ctor.getDerivedStateFromProps === 'function' && state === null) {
      var componentName = getComponentName(ctor) || 'Component';
      if (!didWarnAboutUninitializedState.has(componentName)) {
        didWarnAboutUninitializedState.add(componentName);
        warningWithoutStack$1(false, '`%s` uses `getDerivedStateFromProps` but its initial state is ' + '%s. This is not recommended. Instead, define the initial state by ' + 'assigning an object to `this.state` in the constructor of `%s`. ' + 'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.', componentName, instance.state === null ? 'null' : 'undefined', componentName);
      }
    }

    if (typeof ctor.getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function') {
      var foundWillMountName = null;
      var foundWillReceivePropsName = null;
      var foundWillUpdateName = null;
      if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true) {
        foundWillMountName = 'componentWillMount';
      } else if (typeof instance.UNSAFE_componentWillMount === 'function') {
        foundWillMountName = 'UNSAFE_componentWillMount';
      }
      if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
        foundWillReceivePropsName = 'componentWillReceiveProps';
      } else if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
        foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
      }
      if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
        foundWillUpdateName = 'componentWillUpdate';
      } else if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
        foundWillUpdateName = 'UNSAFE_componentWillUpdate';
      }
      if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
        var _componentName = getComponentName(ctor) || 'Component';
        var newApiName = typeof ctor.getDerivedStateFromProps === 'function' ? 'getDerivedStateFromProps()' : 'getSnapshotBeforeUpdate()';
        if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(_componentName)) {
          didWarnAboutLegacyLifecyclesAndDerivedState.add(_componentName);
          warningWithoutStack$1(false, 'Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' + '%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\n' + 'The above lifecycles should be removed. Learn more about this warning here:\n' + 'https://fb.me/react-async-component-lifecycle-hooks', _componentName, newApiName, foundWillMountName !== null ? '\n  ' + foundWillMountName : '', foundWillReceivePropsName !== null ? '\n  ' + foundWillReceivePropsName : '', foundWillUpdateName !== null ? '\n  ' + foundWillUpdateName : '');
        }
      }
    }
  }

  // 如果是一个consumer，保存一下上下文到类组件实例里面
  if (isLegacyContextConsumer) {
    cacheContext(workInProgress, unmaskedContext, context);
  }

  return instance;
}



// PS：类组件的大Component组件如下
// super(props) 类似于 new Component(props) 加 Object.assign(this, instanceOfComponent)
// 实际上没有创建父类实例，父类构造函数直接操作当前子类实例 (this)
// 更准确地说，是
// 1. 调用父类构造函数，在子类实例上初始化父类定义的属性（如 this.props、this.其他属性）
// 2. 然后继续执行子类自己的初始化逻辑
// 底层做法是：
// 1. 当 new ClassCounter() 时，JS 引擎会先创建一个空对象（子类实例）
// 2. 执行ClassCounter的constructor构造函数时，super(props) 调用父类constructor构造函数，父类构造函数直接在子类实例上设置 this.props = props
// 3. 继续执行子类构造函数，设置 this.state = {...}

function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};






function adoptClassInstance(workInProgress, instance) {
  // instance是类组件实例

  // 把类组件的更新器赋予到实例的updater属性上面
  // 其中包括enqueueSetState、enqueueReplaceState、enqueueForceUpdate三个方法
  instance.updater = classComponentUpdater;

  // 把实例挂到WIP身上
  workInProgress.stateNode = instance;

  // 把fiber保存到实例的_reactInternalFiber属性上
  set(instance, workInProgress);

  {
    instance._reactInternalInstance = fakeInternalInstance;
  }
}




function set(key, value) {
  key._reactInternalFiber = value;
}


function cacheContext(workInProgress, unmaskedContext, maskedContext) {
  var instance = workInProgress.stateNode;
  instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
  instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
}





function mountClassInstance(workInProgress, ctor, newProps, renderExpirationTime) {

  // 检查这个实例的生命周期函数
  {
    checkClassInstance(workInProgress, ctor, newProps);
  }

  // 更新组件实例的一些变量
  var instance = workInProgress.stateNode;
  instance.props = newProps;
  instance.state = workInProgress.memoizedState;
  instance.refs = emptyRefsObject;

  // 保存上下文到全局，以及组件实例的context属性
  var contextType = ctor.contextType;
  if (typeof contextType === 'object' && contextType !== null) {
    // 创造上下文，保存lastContextDependency全局，以及fiber的contextDependencies属性
    // （以及lastContextWithAllBitsObserved全局）
    instance.context = readContext(contextType);
  } else {
    var unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    instance.context = getMaskedContext(workInProgress, unmaskedContext);
  }

  // 处理异常情况
  // 如果这个state和接下来的新的pendingProps一样，给出一些警告信息
  {
    if (instance.state === newProps) {
      var componentName = getComponentName(ctor) || 'Component';
      if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
        didWarnAboutDirectlyAssigningPropsToState.add(componentName);
        warningWithoutStack$1(false, '%s: It is not recommended to assign props directly to state ' + "because updates to props won't be reflected in state. " + 'In most cases, it is better to use props directly.', componentName);
      }
    }

    if (workInProgress.mode & StrictMode) {
      ReactStrictModeWarnings.recordUnsafeLifecycleWarnings(workInProgress, instance);

      ReactStrictModeWarnings.recordLegacyContextWarning(workInProgress, instance);
    }

    if (warnAboutDeprecatedLifecycles) {
      ReactStrictModeWarnings.recordDeprecationWarnings(workInProgress, instance);
    }
  }


  // 更新state数据
  // 拿到WIP的更新队列
  var updateQueue = workInProgress.updateQueue;
  if (updateQueue !== null) {
    // 整合所有更新队列，保存到WIP的memoizedState
    processUpdateQueue(workInProgress, updateQueue, newProps, instance, renderExpirationTime);
    // 更新这个实例的state属性
    instance.state = workInProgress.memoizedState;
  }


  // 处理生命周期函数
  // 执行getDerivedStateFromProps生命周期函数
  var getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, newProps);
    // 再次更新state数据，直接改一下state
    instance.state = workInProgress.memoizedState;
  }

  // 防止有人用componentWillMount这个函数
  if (typeof ctor.getDerivedStateFromProps !== 'function' && typeof instance.getSnapshotBeforeUpdate !== 'function' && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
    callComponentWillMount(workInProgress, instance);
    // 这个生命周期可能会改变state，重新执行processUpdateQueue
    updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null) {
      processUpdateQueue(workInProgress, updateQueue, newProps, instance, renderExpirationTime);
      instance.state = workInProgress.memoizedState;
    }
  }


  // 标记副作用为更新
  if (typeof instance.componentDidMount === 'function') {
    workInProgress.effectTag |= Update;
  }

}



function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, nextProps) {
  var prevState = workInProgress.memoizedState;

  // 执行getDerivedStateFromProps生命周期函数
  var partialState = getDerivedStateFromProps(nextProps, prevState);

  // 把新的state和原来的state结合到一起，然后保存到WIP
  var memoizedState = partialState === null || partialState === undefined ? prevState : _assign({}, prevState, partialState);
  workInProgress.memoizedState = memoizedState;

  // 一旦updateQueue不是空，且当前没有工作了，把当前的memoizedState保存到updateQueue的baseState
  var updateQueue = workInProgress.updateQueue;
  if (updateQueue !== null && workInProgress.expirationTime === NoWork) {
    updateQueue.baseState = memoizedState;
  }
}





function finishClassComponent(current$$1, workInProgress, Component, shouldUpdate, hasContext, renderExpirationTime) {

  // 标记一下ref需要更新（即便shouldComponentUpdate返回false（意味着不用执行render函数））
  markRef(current$$1, workInProgress);


  var didCaptureError = (workInProgress.effectTag & DidCapture) !== NoEffect;

  // 如果经过shouldComponentUpdate，得到不应该更新的命令，那么直接退出
  if (!shouldUpdate && !didCaptureError) {
    // 退出前，首先重新计算一下上下文
    if (hasContext) {
      invalidateContextProvider(workInProgress, Component, false);
    }
    return bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);
  }

  // 拿到组件的实例
  var instance = workInProgress.stateNode;
  ReactCurrentOwner$3.current = workInProgress;
  var nextChildren = void 0;

  // 有错误就返回null
  if (didCaptureError && typeof Component.getDerivedStateFromError !== 'function') {
    nextChildren = null;
    if (enableProfilerTimer) {
      stopProfilerTimerIfRunning(workInProgress);
    }
  } else {
    // 没有错误就执行render方法
    {
      setCurrentPhase('render');
      nextChildren = instance.render();
      setCurrentPhase(null);
    }
  }
  // devtool的副作用
  workInProgress.effectTag |= PerformedWork;

  // 进入孩子层次
  if (current$$1 !== null && didCaptureError) {
    forceUnmountCurrentAndReconcile(current$$1, workInProgress, nextChildren, renderExpirationTime);
  } else {
    // 没有错误的时候直接调和孩子
    reconcileChildren(current$$1, workInProgress, nextChildren, renderExpirationTime);
  }

  // 把state变回为memoizedState
  workInProgress.memoizedState = instance.state;

  // 重新计算一下上下文
  if (hasContext) {
    invalidateContextProvider(workInProgress, Component, true);
  }

  return workInProgress.child;
}




function updateClassInstance(current, workInProgress, ctor, newProps, renderExpirationTime) {
  // 入参：
  // current是替身
  // ctor是大component组件
  // newProps是WIP的pendingProps

  var instance = workInProgress.stateNode;
  var oldProps = workInProgress.memoizedProps;

  // 更新组件的props属性
  instance.props = workInProgress.type === workInProgress.elementType ? oldProps : resolveDefaultProps(workInProgress.type, oldProps);

  // 更新上下文（上下文如果有变化的话）
  var oldContext = instance.context;
  var contextType = ctor.contextType;
  var nextContext = void 0;
  if (typeof contextType === 'object' && contextType !== null) {
    nextContext = readContext(contextType);
  } else {
    var nextUnmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    nextContext = getMaskedContext(workInProgress, nextUnmaskedContext);
  }


  // 处理生命周期函数，包括
  // getDerivedStateFromProps（渲染 + 更新阶段）
  // ShouldComponentUpdate（更新阶段）


  // 废弃生命周期函数处理
  var getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  var hasNewLifecycles = typeof getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function';
  if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillReceiveProps === 'function' || typeof instance.componentWillReceiveProps === 'function')) {
    if (oldProps !== newProps || oldContext !== nextContext) {
      callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext);
    }
  }

  // 把hasForceUpdate改为false
  resetHasForceUpdateBeforeProcessing();

  // （1）更新state数据
  var oldState = workInProgress.memoizedState;
  var newState = instance.state = oldState;
  var updateQueue = workInProgress.updateQueue;
  if (updateQueue !== null) {
    processUpdateQueue(workInProgress, updateQueue, newProps, instance, renderExpirationTime);
    newState = workInProgress.memoizedState;
  }

  // 处理state不变的情况，直接return出去，不执行生命周期函数
  if (oldProps === newProps && oldState === newState && !hasContextChanged() && !checkHasForceUpdateAfterProcessing()) {
    // 有生命周期就赋予副作用标志！后面遍历副作用链要执行
    // 下面两个函数都是在commit阶段执行的
    if (typeof instance.componentDidUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Update;
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Snapshot;
      }
    }
    return false;
  }


  // （2）执行getDerivedStateFromProps（渲染 + 更新阶段）
  // 最后关头执行函数，改变state状态，把结果作为state的最新状态
  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, newProps);
    newState = workInProgress.memoizedState;
  }

  // （3）执行ShouldComponentUpdate（更新阶段）
  var shouldUpdate = checkHasForceUpdateAfterProcessing() || checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext);


  if (shouldUpdate) {
    // 应该更新

    // 废弃生命周期函数处理
    if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillUpdate === 'function' || typeof instance.componentWillUpdate === 'function')) {
      startPhaseTimer(workInProgress, 'componentWillUpdate');
      if (typeof instance.componentWillUpdate === 'function') {
        instance.componentWillUpdate(newProps, newState, nextContext);
      }
      if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
        instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
      }
      stopPhaseTimer();
    }

    // 有生命周期就赋予副作用标志！后面遍历副作用链要执行
    if (typeof instance.componentDidUpdate === 'function') {
      workInProgress.effectTag |= Update;
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      workInProgress.effectTag |= Snapshot;
    }

  } else {
    // 不应该更新

    // 有生命周期就赋予副作用标志！后面遍历副作用链要执行
    if (typeof instance.componentDidUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Update;
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Snapshot;
      }
    }

    // 更新memoizedProps/State属性
    workInProgress.memoizedProps = newProps;
    workInProgress.memoizedState = newState;
  }

  // 更新组件实例的信息
  instance.props = newProps;
  instance.state = newState;
  instance.context = nextContext;

  return shouldUpdate;
}

function resetHasForceUpdateBeforeProcessing() {
  hasForceUpdate = false;
}

function checkHasForceUpdateAfterProcessing() {
  return hasForceUpdate;
}

function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
  var instance = workInProgress.stateNode;

  // 执行shouldComponentUpdate函数
  if (typeof instance.shouldComponentUpdate === 'function') {
    startPhaseTimer(workInProgress, 'shouldComponentUpdate');
    var shouldUpdate = instance.shouldComponentUpdate(newProps, newState, nextContext);
    stopPhaseTimer();
    return shouldUpdate;
  }

  // 是否继承了纯函数？
  // 这么看来最好是继承的！
  if (ctor.prototype && ctor.prototype.isPureReactComponent) {
    // 如果是纯函数，浅对比props和state，但凡有一个不相同，都要返回false
    return !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState);
  }

  // 没有这个函数直接返回true
  return true;
}





// REVIEW - 下面是经过beginWork分发后来到【原生的普通的DOM节点】以及【单纯文本节点】的更新函数





// !【原生的普通DOM节点】




function updateHostComponent(current$$1, workInProgress, renderExpirationTime) {

  // 1.更新一下全局的上下文信息
  pushHostContext(workInProgress);

  // 【SSR】首次渲染的时候，如果是ssr的情况，走下面
  // 给fiber赋予一个parent属性
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

  // 拿到目前的根节点真实DOM（要么是id为root的节点，要么是body）
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

function updatedAncestorInfo(oldInfo, tag) {
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



function shouldSetTextContent(type, props) {
  return type === 'textarea' || type === 'option' || type === 'noscript' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
}


function markRef(current$$1, workInProgress) {
  var ref = workInProgress.ref;
  if (current$$1 === null && ref !== null || current$$1 !== null && current$$1.ref !== ref) {
    workInProgress.effectTag |= Ref;
  }
}



function shouldDeprioritizeSubtree(type, props) {
  return !!props.hidden;
}





// !【单纯文本节点】



function updateHostText(current$$1, workInProgress) {
  if (current$$1 === null) {
    // 水化走下面
    tryToClaimNextHydratableInstance(workInProgress);
  }
  // 返回null，因为这是超级底层节点了（直接文字，没有div兜着！）
  return null;
}






// REVIEW - 下面是经过beginWork分发后来到【suspense类型】的更新函数



function updateSuspenseComponent(current$$1, workInProgress, renderExpirationTime) {
  var mode = workInProgress.mode;
  var nextProps = workInProgress.pendingProps;
  var nextState = workInProgress.memoizedState;
  var nextDidTimeout = void 0;


  // 首先判断当前的WIP是否捕获到错误？即是否超时？？
  // 根据标志修改nextState和nextDidTimeout（人为显式地修改）
  if ((workInProgress.effectTag & DidCapture) === NoEffect) {
    // 首渲走下面，没有DidCapture的标记
    nextState = null;
    nextDidTimeout = false;
  } else {
    // 有DidCapture的标记，需要显示fallback
    // 记录标识（nextState用于比较下一次，nextDidTimeout用于比较本次）

    // 提问，什么时候走这里？
    // 在懒加载组件抛出promise对象之后，在catch部分处理suspense组件的副作用标志，
    // 执行到continue，再一次从suspense组件开始进入workLoop

    nextState = {
      timedOutAt: nextState !== null ? nextState.timedOutAt : NoWork
    };
    nextDidTimeout = true;

    // 清除副作用
    workInProgress.effectTag &= ~DidCapture;
  }

  var child = void 0;
  var next = void 0;

  if (current$$1 === null) {
    // 首渲走下面

    // 处理服务端渲染脱水（Dehydrate）情况
    if (enableSuspenseServerRenderer) {
      if (nextProps.fallback !== undefined) {
        tryToClaimNextHydratableInstance(workInProgress);
        if (workInProgress.tag === DehydratedSuspenseComponent) {
          return updateDehydratedSuspenseComponent(null, workInProgress, renderExpirationTime);
        }
      }
    }

    if (nextDidTimeout) {
      // 如果超时了，需要显示fallback的东西

      // 为孩子创建一个fiber，但是这个fiber是一个空的！为什么？
      // 因为孩子树太大太复杂了，不可能很快构建好fiber，就先创造一个容器，预计用来保留下下面的真实节点
      var primaryChildFragment = createFiberFromFragment(null, mode, NoWork, null);

      // 如果不是并发模式
      if ((workInProgress.mode & ConcurrentMode) === NoContext) {
        // 拿到WIP的state，这里面存的是：{ timedOutAt: NoWork }（超时）或者null（没超时）
        // 如果超时了，说明之前创建的树中有空fiber，让这个新的空fiber的大儿子为：当前WIP的大孩子的大孩子（即旧空fiber的大儿子即真正的孩子）
        var progressedState = workInProgress.memoizedState;
        var progressedPrimaryChild = progressedState !== null ? workInProgress.child.child : workInProgress.child;
        primaryChildFragment.child = progressedPrimaryChild;
      }

      // 无论是否并发模式都需要走下面
      // 为fallback创造一个fiber
      var nextFallbackChildren = nextProps.fallback;
      var fallbackChildFragment = createFiberFromFragment(nextFallbackChildren, mode, renderExpirationTime, null);
      
      // 使用兄弟关系把真正的孩子和fallback的孩子联系在一起
      primaryChildFragment.sibling = fallbackChildFragment;
      child = primaryChildFragment;
      next = fallbackChildFragment;

      // 联系父节点
      child.return = next.return = workInProgress;

    } else {
      // 如果没有超时，直接显示真实的孩子，往下创造fiber，直接忽略fallback的属性内容
      // child和next都是正常的孩子树
      var nextPrimaryChildren = nextProps.children;
      child = next = mountChildFibers(workInProgress, null, nextPrimaryChildren, renderExpirationTime);
    }

  } else {
    // 更新走下面（使用了【lazy】组件的都算更新，走下面！）

    // 通过替身的 memoizedState 判断之前是否处于超时状态
    // 替身的state有值，说明过去是超时的
    var prevState = current$$1.memoizedState;
    var prevDidTimeout = prevState !== null;

    if (prevDidTimeout) {
      // 之前超时了，之前显示的是fallback

      // 替身的大孩子要么是一个真实的孩子节点，要么是一个空fiber，后面跟着真实的孩子节点
      // 二孩子是fallback的内容
      var currentPrimaryChildFragment = current$$1.child;
      var currentFallbackChildFragment = currentPrimaryChildFragment.sibling;

      if (nextDidTimeout) {
        // 现在超时了，现在需要显示fallback（之前显示的是fallback）
        // 旧:fallback，新:fallback

        // 复用空fiber（以前的真实的孩子）
        var _primaryChildFragment = createWorkInProgress(currentPrimaryChildFragment, currentPrimaryChildFragment.pendingProps, NoWork);

        // 如果不是并发模式走下面，跳过空fiber拿到真实的孩子树
        if ((workInProgress.mode & ConcurrentMode) === NoContext) {
          var _progressedState = workInProgress.memoizedState;
          var _progressedPrimaryChild = _progressedState !== null ? workInProgress.child.child : workInProgress.child;
          if (_progressedPrimaryChild !== currentPrimaryChildFragment.child) {
            _primaryChildFragment.child = _progressedPrimaryChild;
          }
        }

        // 一些计时
        if (enableProfilerTimer && workInProgress.mode & ProfileMode) {
          var treeBaseDuration = 0;
          var hiddenChild = _primaryChildFragment.child;
          while (hiddenChild !== null) {
            treeBaseDuration += hiddenChild.treeBaseDuration;
            hiddenChild = hiddenChild.sibling;
          }
          _primaryChildFragment.treeBaseDuration = treeBaseDuration;
        }

        // 复用以前的fallback的fiber
        var _nextFallbackChildren = nextProps.fallback;
        var _fallbackChildFragment = _primaryChildFragment.sibling = createWorkInProgress(currentFallbackChildFragment, _nextFallbackChildren, currentFallbackChildFragment.expirationTime);
        
        // 更新变量
        child = _primaryChildFragment;
        _primaryChildFragment.childExpirationTime = NoWork;
        next = _fallbackChildFragment;
        child.return = next.return = workInProgress;

      } else {
        // 现在没超时，现在直接显示真实的孩子（之前显示的是fallback）
        // 旧:fallback，新:真实的孩子

        // 复用替身的真实孩子
        // currentPrimaryChild是替身的大孩子（空fiber）的大孩子（真实的孩子树）
        var _nextPrimaryChildren = nextProps.children;
        var currentPrimaryChild = currentPrimaryChildFragment.child;
        var primaryChild = reconcileChildFibers(workInProgress, currentPrimaryChild, _nextPrimaryChildren, renderExpirationTime);
        child = next = primaryChild;
      }

    } else {
      // 之前没超时，之前显示的是真实的子树
      var _currentPrimaryChild = current$$1.child;

      if (nextDidTimeout) {
        // 现在超时了，现在需要显示fallback（之前显示的是真实的子树）
        // 旧:真实的孩子，新:fallback
        // （使用了【lazy】都会进来这里这里！）

        // 1）处理真实的孩子树
        // 新创造一个空的fiber，让 替身的真实孩子树 附在这个 空fiber的child属性 上面
        var _primaryChildFragment2 = createFiberFromFragment(null, mode, NoWork, null);
        _primaryChildFragment2.child = _currentPrimaryChild;

        // 非并发模式（同步模式）走下面，更新孩子树!!
        if ((workInProgress.mode & ConcurrentMode) === NoContext) {
          // 拿到的是之前的state，看有无值
          // 有值：说明之前显示的是fallback，中间有一个空fiber（suspense->空fiber->孩子树），因此会有.child.child
          // 没有值（在lazy组件抛出之后重新进入的loop这里是没有值的）：拿到当前的孩子树，更新空fiber的孩子
          // （这次这个树的底层孩子的type是null了，因为是一个lazy组件，替身的树的底层孩子是navigate或别的）
          var _progressedState2 = workInProgress.memoizedState;
          var _progressedPrimaryChild2 = _progressedState2 !== null ? workInProgress.child.child : workInProgress.child;
          _primaryChildFragment2.child = _progressedPrimaryChild2;
        }

        // 一些计时
        if (enableProfilerTimer && workInProgress.mode & ProfileMode) {
          var _treeBaseDuration = 0;
          var _hiddenChild = _primaryChildFragment2.child;
          while (_hiddenChild !== null) {
            _treeBaseDuration += _hiddenChild.treeBaseDuration;
            _hiddenChild = _hiddenChild.sibling;
          }
          _primaryChildFragment2.treeBaseDuration = _treeBaseDuration;
        }

        // 2）处理fallback树
        // 为fallback新建一个fiber，并且给予新增的副作用标识
        var _nextFallbackChildren2 = nextProps.fallback;
        var _fallbackChildFragment2 = _primaryChildFragment2.sibling = createFiberFromFragment(_nextFallbackChildren2, mode, renderExpirationTime, null);
        _fallbackChildFragment2.effectTag |= Placement;

        // 3）更新变量
        child = _primaryChildFragment2;
        _primaryChildFragment2.childExpirationTime = NoWork;
        next = _fallbackChildFragment2;
        child.return = next.return = workInProgress;

      } else {
        // 现在没超时，现在需要显示真实的子树（之前显示的是真实的子树）
        // 旧:真实的孩子，新:真实的子树

        var _nextPrimaryChildren2 = nextProps.children;
        // 直接进入孩子层更新孩子
        next = child = reconcileChildFibers(workInProgress, _currentPrimaryChild, _nextPrimaryChildren2, renderExpirationTime);
      }
    }
    workInProgress.stateNode = current$$1.stateNode;
  }

  // 更新state的值
  workInProgress.memoizedState = nextState;
  workInProgress.child = child;

  // 返回的是fallback的fiber/真实孩子树
  // （如果返回fallback，注意是fragment类型的fiber，然后再继续进入孩子分发的时候，来到updateFragment）
  return next;
}


// fragment类型的fiber的特点是type为null，pendingProps保存的是虚拟DOM的内容
function updateFragment(current$$1, workInProgress, renderExpirationTime) {
  var nextChildren = workInProgress.pendingProps;
  reconcileChildren(current$$1, workInProgress, nextChildren, renderExpirationTime);
  return workInProgress.child;
}







// ?!提交阶段【commitWork】里面的suspense组件的函数


function hideOrUnhideAllChildren(finishedWork, isHidden) {
  if (supportsMutation) {
    // 如果在commitWork那边：
    // state有值，这个传入的node就是suspense组件的孩子，也就是空fiber
    // state没值，传入的node就是suspense组件本身
    // isHidden等于newDidTimeout，超时了（需要显示fallback）传入的就是true
    var node = finishedWork;
    while (true) {
      if (node.tag === HostComponent) {
        // 原生节点走这里
        var instance = node.stateNode;
        if (isHidden) {
          // 拿到真实DOM，设置display为none
          hideInstance(instance);
        } else {
          // 拿到过去的props，把display的属性本身设置为空，相当于把display属性去掉
          // （一般来说，fiber上面的props是不会被设置了有style属性的）
          unhideInstance(node.stateNode, node.memoizedProps);
        }
        // 之后直接开始往右或上找，这个节点不显示下面的子树都不会显示

      } else if (node.tag === HostText) {
        // 文本节点走这里
        var _instance3 = node.stateNode;
        if (isHidden) {
          hideTextInstance(_instance3);
        } else {
          unhideTextInstance(_instance3, node.memoizedProps);
        }

      } else if (node.tag === SuspenseComponent && node.memoizedState !== null) {
        // suspense组件且需要显示fallback的走这里

        var fallbackChildFragment = node.child.sibling;
        fallbackChildFragment.return = node;
        node = fallbackChildFragment;
        continue;

      } else if (node.child !== null) {
        // 继续往下走
        node.child.return = node;
        node = node.child;
        continue;
      }

      // 当前节点回到初始位置，直接退出
      if (node === finishedWork) {
        return;
      }

      // 没有兄弟姐妹就往上找
      while (node.sibling === null) {
        if (node.return === null || node.return === finishedWork) {
          // 找到原本的空fiber或者suspense组件的下一个节点（开发者写出来的<suspense>的下一个<>）就直接退出了！
          // 【开发者写出来的<suspense>的下一个<>】实际上没有兄弟姐妹
          // 【空fiber】这一层的兄弟姐妹是不处理的
          return;
        }
        node = node.return;
      }
      // 有兄弟姐妹就往右边找
      node.sibling.return = node.return;
      node = node.sibling;
    }
  }
}



function hideInstance(instance) {
  instance = instance;
  instance.style.display = 'none';
}


function unhideInstance(instance, props) {
  // instance是真实的DOM
  // props是fiber上面的style属性
  instance = instance;
  var styleProp = props[STYLE];

  // 一般来说，fiber上面的props是不会被设置了有style属性的
  // 因此下面把display的属性本身设置为空“”，相当于把display属性去掉
  var display = styleProp !== undefined && styleProp !== null && styleProp.hasOwnProperty('display') ? styleProp.display : null;
  instance.style.display = dangerousStyleValue('display', display);
}



function dangerousStyleValue(name, value, isCustomProperty) {
  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) {
    return '';
  }

  if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
    return value + 'px';
  }

  return ('' + value).trim();
}

// 这是在readLazyComponentType里面的then函数调用之后，才调用的retryTimedOutBoundary
function retryTimedOutBoundary(boundaryFiber, thenable) {
  // 入参：
  // boundaryFiber就是suspense组件的fiber
  // thenable就是promise对象

  // 1. 拿到之前在commitWork创建的缓存
  var retryCache = void 0;
  // 下面的enableSuspenseServerRenderer默认是false，不走这个
  if (enableSuspenseServerRenderer) {
    switch (boundaryFiber.tag) {
      case SuspenseComponent:
        retryCache = boundaryFiber.stateNode;
        break;
      case DehydratedSuspenseComponent:
        retryCache = boundaryFiber.memoizedState;
        break;
      default:
        invariant(false, 'Pinged unknown suspense boundary type. This is probably a bug in React.');
    }

  } else {
    // 从suspense组件的fiber里面拿出缓存（里面存着promise对象）
    retryCache = boundaryFiber.stateNode;
  }

  // 因为已经解决了这个promise，就可以从内存里面删掉了
  if (retryCache !== null) {
    retryCache.delete(thenable);
  }

  // 2. 计算过期时间，改变root的过期时间
  var currentTime = requestCurrentTime();
  var retryTime = computeExpirationForFiber(currentTime, boundaryFiber);
  var root = scheduleWorkToRoot(boundaryFiber, retryTime);

  // 3. 最后拿到root对象（是对象不是fiber），如果这个时间不为0，再次进入调度流程
  // 进入调度流程之后，在lazy组件那边执行readLazyComponentType，已经可以拿到promise对象的result了
  if (root !== null) {
    markPendingPriorityLevel(root, retryTime);
    var rootExpirationTime = root.expirationTime;
    if (rootExpirationTime !== NoWork) {
      requestWork(root, rootExpirationTime);
    }
  }
}











// REVIEW - 下面是经过beginWork分发后来到memo类型【memo(() => { return (<></>) })】的更新函数


// 注意memo函数是在render方法执行之前就执行了的



// !下面这个是【包裹着memo(() => ())的函数】
// 作用是处理和管理 React 组件中的签名和自定义 hooks

function createSignatureFunctionForTransform() {
  var savedType;
  var hasCustomHooks;
  var didCollectHooks = false;

  // 下面返回的闭包函数是需要执行的，是包裹memo的函数
  return function (type, key, forceReset, getCustomHooks) {
    // 如果已经有了签名，把函数本身和一个工具保存在这个作用域里面
    if (typeof key === 'string') {
      if (!savedType) {
        savedType = type;
        hasCustomHooks = typeof getCustomHooks === 'function';
      }
      // 执行签名函数
      if (type != null && (typeof type === 'function' || typeof type === 'object')) {
        setSignature(type, key, forceReset, getCustomHooks);
      }
      // 最后返回这个参数（对象）本身
      return type;

    } else {
      // 如果没有签名，根据每个自定义hooks去签名（实际上拿的是所有的ownKey，中间用换行符号连接）
      if (!didCollectHooks && hasCustomHooks) {
        didCollectHooks = true;
        collectCustomHooksForSignature(savedType);
      }
    }
  };
}


function setSignature(type, key) {
  // 如果有传入forceReset作为第三个参数，说明forceReset是对的
  var forceReset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var getCustomHooks = arguments.length > 3 ? arguments[3] : undefined;

  // 这里在签名
  // 保存一下这个类型的虚拟DOM（节点）到签名库中
  if (!allSignaturesByType.has(type)) {
    allSignaturesByType.set(type, {
      forceReset: forceReset,
      ownKey: key,
      fullKey: null,
      getCustomHooks: getCustomHooks || function () {
        return [];
      }
    });
  }

  // 为不同的组件，递归签名，
  if (typeof type === 'object' && type !== null) {
    switch (getProperty(type, '$$typeof')) {
      case REACT_FORWARD_REF_TYPE:
        setSignature(type.render, key, forceReset, getCustomHooks);
        break;

      case REACT_MEMO_TYPE:
        setSignature(type.type, key, forceReset, getCustomHooks);
        break;
    }
  }
}


// 从签名库里面拿出签名对象，并计算完整的签名
function collectCustomHooksForSignature(type) {
  var signature = allSignaturesByType.get(type);
  if (signature !== undefined) {
    computeFullKey(signature);
  }
}


function computeFullKey(signature) {
  if (signature.fullKey !== null) {
    return signature.fullKey;
  }

  var fullKey = signature.ownKey;
  var hooks;

  // 拿到自定义hooks数组
  try {
    hooks = signature.getCustomHooks();
  } catch (err) {
    signature.forceReset = true;
    signature.fullKey = fullKey;
    return fullKey;
  }

  // 遍历自定义数组
  for (var i = 0; i < hooks.length; i++) {
    var hook = hooks[i];
    if (typeof hook !== 'function') {
      signature.forceReset = true;
      signature.fullKey = fullKey;
      return fullKey;
    }
    // 如果这个hook有嵌套的hook，递归执行，然后返回fullKey
    var nestedHookSignature = allSignaturesByType.get(hook);
    if (nestedHookSignature === undefined) {
      continue;
    }
    var nestedHookKey = computeFullKey(nestedHookSignature);
    if (nestedHookSignature.forceReset) {
      signature.forceReset = true;
    }
    // 用换行符号连接
    fullKey += '\n---\n' + nestedHookKey;
  }
  // 最后放回签名对象里面
  signature.fullKey = fullKey;
  return fullKey;
}




// !下面是【memo函数】本身：


function memo(type, compare) {
  // 直接返回一个对象
  return {
    $$typeof: REACT_MEMO_TYPE,
    type: type,
    compare: compare === undefined ? null : compare
  };
}




// !下面才是memo组件在【beginWork之后分发】的函数：



function updateMemoComponent(current$$1, workInProgress, Component, nextProps, updateExpirationTime, renderExpirationTime) {
  if (current$$1 === null) {
    // 首渲走这里
    
    // component是WIP的type属性，也是memo的一个对象，见上面的memo函数
    // 在此基础上又拿了一个type属性，这个type还是memo函数本身
    var type = Component.type;
    if (isSimpleFunctionComponent(type) && Component.compare === null && Component.defaultProps === undefined) {
      // 首次渲染走下面
      // 如果是函数组件的话，就改tag为SimpleMemoComponent
      workInProgress.tag = SimpleMemoComponent;
      workInProgress.type = type;

      // 检验函数
      validateFunctionComponentInDev(workInProgress, type);

      // 改为去SimpleMemoComponent那边再走一遍
      return updateSimpleMemoComponent(current$$1, workInProgress, type, nextProps, updateExpirationTime, renderExpirationTime);
    }

    // 直接创建一个孩子！不走reconcile那边
    var child = createFiberFromTypeAndProps(Component.type, null, nextProps, null, workInProgress.mode, renderExpirationTime);
    child.ref = workInProgress.ref;
    child.return = workInProgress;
    workInProgress.child = child;

    // 直接返回大孩子
    return child;
  }

  // 更新都走下面！
  var currentChild = current$$1.child;
  // updateExpirationTime也就是fiber本身的expirationTime
  // fiber本身的eT小于当前的eT，说明这个更新已经过期了，需要立刻检查前后props是否一样，以判断是否需要提前退出
  if (updateExpirationTime < renderExpirationTime) {
    var prevProps = currentChild.memoizedProps;
    var compare = Component.compare;
    compare = compare !== null ? compare : shallowEqual;
    if (compare(prevProps, nextProps) && current$$1.ref === workInProgress.ref) {
      return bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);
    }
  }

  // React DevTools的副作用
  workInProgress.effectTag |= PerformedWork;

  // 直接创建一个孩子！不走reconcile那边
  var newChild = createWorkInProgress(currentChild, nextProps, renderExpirationTime);
  // 父亲的ref确保和孩子的ref一样，为什么？？？
  // ！！！因为：
  // memo 组件本身只是一个包装器（wrapper），它不渲染任何实际内容，真正的渲染工作是由其包裹的组件完成的
  // 需要将这个 ref "穿透"传递到内部的真实组件
  newChild.ref = workInProgress.ref;

  newChild.return = workInProgress;
  workInProgress.child = newChild;
  return newChild;
}



function isSimpleFunctionComponent(type) {
  return typeof type === 'function' && !shouldConstruct(type) && type.defaultProps === undefined;
}


// 下面函数用来判断一个组件是否是一个类组件（即继承自 React.Component 或者 React.PureComponent 的组件）
function shouldConstruct(Component) {
  var prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}





function updateSimpleMemoComponent(current$$1, workInProgress, Component, nextProps, updateExpirationTime, renderExpirationTime) {
  // updateExpirationTime也就是fiber本身的expirationTime

  // 异常信息检验
  {
    if (workInProgress.type !== workInProgress.elementType) {
      // 经过在updateMemoComponent那里把【WIP的type】改为了【WIP的type的type】，这里是不一样的，走下面的逻辑
      // 但是下面的两个if条件都不满足，直接跳过
      var outerMemoType = workInProgress.elementType;
      if (outerMemoType.$$typeof === REACT_LAZY_TYPE) {
        outerMemoType = refineResolvedLazyComponent(outerMemoType);
      }
      var outerPropTypes = outerMemoType && outerMemoType.propTypes;
      if (outerPropTypes) {
        checkPropTypes(outerPropTypes, nextProps,
        'prop', getComponentName(outerMemoType), getCurrentFiberStackInDev);
      }
    }
  }

  if (current$$1 !== null) {
    // 更新走下面！
    var prevProps = current$$1.memoizedProps;

    // 检查前后props是否一样，以判断是否需要更新，
    // 这里是浅比较！！！
    if (shallowEqual(prevProps, nextProps) && current$$1.ref === workInProgress.ref) {
      didReceiveUpdate = false;
      if (updateExpirationTime < renderExpirationTime) {
        // fiber本身的eT小于当前的eT，说明这个更新已经过期了，需要立刻提前退出
        return bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);
      }
    }
  }

  // 首渲走下面，直接去函数组件的逻辑
  return updateFunctionComponent(current$$1, workInProgress, Component, nextProps, renderExpirationTime);
}



function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty$1.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}

var hasOwnProperty$1 = Object.prototype.hasOwnProperty;










// REVIEW - 下面是懒加载的组件经过beginWork分发后来到Lazy类型组件的更新函数

// 懒加载组件长这样：
// <Login />
// const Login = React.lazy(() => import("../views/login"));



// PS：React.lazy()这个函数在进入render函数的时候就已经执行了，为什么？
// !以下是【React.lazy()】的函数


// 直接返回一个lazy对象（把里面的懒函数保存起来！！）

function lazy(ctor) {
  var lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _ctor: ctor,
    _status: -1,
    _result: null
  };

  {
    var defaultProps = void 0;
    var propTypes = void 0;
    Object.defineProperties(lazyType, {
      defaultProps: {
        configurable: true,
        get: function () {
          return defaultProps;
        },
        set: function (newDefaultProps) {
          defaultProps = newDefaultProps;
          Object.defineProperty(lazyType, 'defaultProps', {
            enumerable: true
          });
        }
      },
      propTypes: {
        configurable: true,
        get: function () {
          return propTypes;
        },
        set: function (newPropTypes) {
          propTypes = newPropTypes;
          Object.defineProperty(lazyType, 'propTypes', {
            enumerable: true
          });
        }
      }
    });
  }

  return lazyType;
}






// !下面才是lazy组件在【beginWork之后分发】的函数：


function mountLazyComponent(_current, workInProgress, elementType, updateExpirationTime, renderExpirationTime) {
  if (_current !== null) {
    // 更新走下面
    // 把替身恢复为null，因为这个是一个懒加载的组件，每次更新都要重新加载一个<script>
    _current.alternate = null;
    workInProgress.alternate = null;
    // 标记为新插入的副作用
    workInProgress.effectTag |= Placement;
  }

  var props = workInProgress.pendingProps;
  cancelWorkTimer(workInProgress);

  // 1. 读取组件的类型
  // 为什么要读取WIP的类型？
  // 回答：一开始创建虚拟DOM时，因为是一个lazy对象（里面保存了懒函数），所以还没定义WIP的type，此时的type是null

  // 经过再次调度之后，这个时候的异步promise被解决了，可以从里面拿到
  var Component = readLazyComponentType(elementType);

  // 1）如果懒加载的代码传过来很慢的时候，下面的函数是不会执行的
  // 2）经过再次调度，拿到这个虚拟DOM，开始根据她修改当前的这个lazy节点的fiber的信息（type、tag和props都要修改）
  workInProgress.type = Component;
  // 组件的类型辨别
  var resolvedTag = workInProgress.tag = resolveLazyComponentTag(Component);
  startWorkTimer(workInProgress);
  // 组件的props合并
  var resolvedProps = resolveDefaultProps(Component, props);
  var child = void 0;

  // 2. 根据tag分发到相应的地方处理！
  switch (resolvedTag) {
    case FunctionComponent:
      {
        {
          validateFunctionComponentInDev(workInProgress, Component);
        }
        child = updateFunctionComponent(null, workInProgress, Component, resolvedProps, renderExpirationTime);
        break;
      }
    case ClassComponent:
      {
        child = updateClassComponent(null, workInProgress, Component, resolvedProps, renderExpirationTime);
        break;
      }
    case ForwardRef:
      {
        child = updateForwardRef(null, workInProgress, Component, resolvedProps, renderExpirationTime);
        break;
      }
    case MemoComponent:
      {
        {
          if (workInProgress.type !== workInProgress.elementType) {
            var outerPropTypes = Component.propTypes;
            if (outerPropTypes) {
              checkPropTypes(outerPropTypes, resolvedProps, // Resolved for outer only
              'prop', getComponentName(Component), getCurrentFiberStackInDev);
            }
          }
        }
        // memo组件把虚拟DOM的type也保存到props里面
        child = updateMemoComponent(null, workInProgress, Component, resolveDefaultProps(Component.type, resolvedProps),
        updateExpirationTime, renderExpirationTime);
        break;
      }
    default:
  }
  return child;
}






function readLazyComponentType(lazyComponent) {
  // 一开始的status是-1
  var status = lazyComponent._status;
  var result = lazyComponent._result;

  // 一开始的status为-1，只能走默认的那一项
  switch (status) {
    case Resolved:
      {
        var Component = result;
        return Component;
      }
    case Rejected:
      {
        var error = result;
        throw error;
      }
    case Pending:
      {
        var thenable = result;
        throw thenable;
      }
    default:
      {
        // 把status改成pending状态
        lazyComponent._status = Pending;
        // 拿到这个懒加载函数() => import('xxxx')
        var ctor = lazyComponent._ctor;
        // 在这里立刻执行这个函数，因为import('xxx')得到的是一个promise对象，是异步执行
        var _thenable = ctor();

        // 然后先给他定义好then之后要干嘛，相当于先把后面的回调函数先保存起来
        _thenable.then(function (moduleObject) {
          // 如果当前的lazy虚拟DOM的状态为pending，把他改为resolved，并且把结果保存到虚拟DOM身上！
          // （注意：这里的结果是保存在then的结果的default属性里面（类似于webpack的export的导出结果））
          if (lazyComponent._status === Pending) {
            var defaultExport = moduleObject.default;
            // 改变状态，后续直接通过这个虚拟DOM的状态判断
            lazyComponent._status = Resolved;
            // 缓存组件（这里的result保存的通常是 React 组件）
            lazyComponent._result = defaultExport;
          }
        }, function (error) {
          if (lazyComponent._status === Pending) {
            lazyComponent._status = Rejected;
            lazyComponent._result = error;
          }
        });

        // 然后先执行下面的函数，处理同步 thenable（极少数情况）
        // 如果状态还是-1的话，result一直都是null的状态
        switch (lazyComponent._status) {
          case Resolved:
            return lazyComponent._result;
          case Rejected:
            throw lazyComponent._result;
        }

        // 先把保存这个promise对象保存起来，然后抛出这个promise对象，
        // 使得调用者继续等待 Promise 完成！！！！
        lazyComponent._result = _thenable;
        throw _thenable;
      }

    // 抛出Promise后，当前的函数会立刻中断，
    // 在workLoop的catch部分会捕获这个抛出的Promise对象，
    // 显示Suspense的fallback内容
    // 直到 thenable（即一个 Promise）完成，此时会再次调用 readLazyComponentType
    // 然后调用retryTimedOutBoundary

  }
}





// 这个ctor()函数（实际上是() => import()）就是下面这个e方法
// 去看webpack懒加载那边的函数

function e (chunkId) {
  return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
    __webpack_require__.f[key](chunkId, promises);
    return promises;
  }, []));
}






// 下面是throw出一个promise对象之后，
// 来到renderRoot函数里面的workLoop函数下面的catch模块，进行修复工作

function replayUnitOfWork (failedUnitOfWork, thrownValue, isYieldy) {
  // 入参：
  // failedUnitOfWork就是nextUnitOfWork，此时就是lazy组件的fiber
  // thrownValue是抛出来的promise对象或者promise执行失败的结果对象

  // 懒加载组件抛出的promise在这里都满足条件，直接return出去了
  if (thrownValue !== null && typeof thrownValue === 'object' && typeof thrownValue.then === 'function') {
    return;
  }

  // 1. 恢复这个WIP（lazy fiber）的属性为之前的原始信息
  // stashedWorkInProgressProperties记录着当前的出错的fiber在performUniOfWork那里记录的原始信息（lazy fiber）
  if (stashedWorkInProgressProperties === null) {
    warningWithoutStack$1(false, 'Could not replay rendering after an error. This is likely a bug in React. ' + 'Please file an issue.');
    return;
  }
  assignFiberPropertiesInDEV(failedUnitOfWork, stashedWorkInProgressProperties);

  // 2. 如果有下面这些类型的，需要弹出当前的上下文
  switch (failedUnitOfWork.tag) {
    case HostRoot:
      popHostContainer(failedUnitOfWork);
      popTopLevelContextObject(failedUnitOfWork);
      break;
    case HostComponent:
      popHostContext(failedUnitOfWork);
      break;
    case ClassComponent:
      {
        var Component = failedUnitOfWork.type;
        if (isContextProvider(Component)) {
          popContext(failedUnitOfWork);
        }
        break;
      }
    case HostPortal:
      popHostContainer(failedUnitOfWork);
      break;
    case ContextProvider:
      popProvider(failedUnitOfWork);
      break;
  }

  // 3. 重新调度workLoop函数，起点是lazy节点
  // 但肯定还是失败的，因为lazy虚拟DOM本身存的status就是失败的标识
  isReplayingFailedUnitOfWork = true;
  originalReplayError = thrownValue;
  invokeGuardedCallback(null, workLoop, null, isYieldy);
  isReplayingFailedUnitOfWork = false;
  originalReplayError = null;

  if (hasCaughtError()) {
    var replayError = clearCaughtError();
    if (replayError != null && thrownValue != null) {
      try {
        if (replayError._suppressLogging) {
          thrownValue._suppressLogging = true;
        }
      } catch (inner) {
      }
    }
  } else {
    nextUnitOfWork = failedUnitOfWork;
  }
};







function throwException(root, returnFiber, sourceFiber, value, renderExpirationTime) {
  // 入参：
  // root是根节点fiber
  // returnFiber是懒加载组件的父亲节点fiber
  // sourceFiber是懒加载组件自己的fiber（type为null，一直想要读取type来着）
  // value是抛出的promise对象
  // renderET一般是Sync

  // 给这个懒加载组件fiber标记为未完成，如果能够找到suspense组件的话，标记suspense就好，不需要这个标记
  // 后面在commitWork那边会处理
  sourceFiber.effectTag |= Incomplete;
  // 把她的副作用链条也消除了
  sourceFiber.firstEffect = sourceFiber.lastEffect = null;

  if (value !== null && typeof value === 'object' && typeof value.then === 'function') {
    // 抛出的是一个promise，进来这里

    var thenable = value;
    var _workInProgress = returnFiber;
    var earliestTimeoutMs = -1;
    var startTimeMs = -1;

    // 1）向上遍历祖先节点，找到最近的 SuspenseComponent，并计算其超时时间。
    do {
      // 一直往上找suspenseComponent，直到找到为止
      if (_workInProgress.tag === SuspenseComponent) {
        var current$$1 = _workInProgress.alternate;
        if (current$$1 !== null) {
          // 更新走下面
          var currentState = current$$1.memoizedState;
          if (currentState !== null) {
            // suspense过去的state有值，超时了（之前显示的是fallback的内容）
            // 记录当前的开始时间（timedOutAt初始为0）
            var timedOutAt = currentState.timedOutAt;
            startTimeMs = expirationTimeToMs(timedOutAt);
            break;
          }
        }

        // 【首渲】以及【更新但是之前显示的不是fallback的内容】走下面
        // 拿到suspense组件的props里面的maxDuration，没有maxDuration的话不走下面
        // maxDuration是设置suspense组件在展示之前所能容忍的最大等待时间，也就是这个时间之内页面是空白的

        // 如果maxDuration小于等于 0，表示该Suspense组件不允许等待异步操作，应该立即超时。
        // 如果 maxDuration 大于 0，则选择记录最小的超时时间。
        // 通过这种方式，多个 Suspense 组件的超时会被合并，选择最短的超时时间。
        var timeoutPropMs = _workInProgress.pendingProps.maxDuration;
        if (typeof timeoutPropMs === 'number') {
          if (timeoutPropMs <= 0) {
            earliestTimeoutMs = 0;
          } else if (earliestTimeoutMs === -1 || timeoutPropMs < earliestTimeoutMs) {
            earliestTimeoutMs = timeoutPropMs;
          }
        }
      }
      
      _workInProgress = _workInProgress.return;
    } while (_workInProgress !== null);

    // 此时的_workInProgress改为懒组件的父亲节点returnFiber
    _workInProgress = returnFiber;

    // 2）再次遍历祖先节点，寻找 Suspense 组件，标记DidCapture，保存promise数据
    do {
      if (_workInProgress.tag === SuspenseComponent && shouldCaptureSuspense(_workInProgress)) {
        // 这种情况是当前suspense组件没超时（用了navigate组件开始首次更新时进来这里）

        // 给suspense组件的uQ加一个更新对象（实际上是promise）
        // 相当于把promise对象保存到suspense组件的uQ里面，后续会用到
        var thenables = _workInProgress.updateQueue;
        if (thenables === null) {
          var updateQueue = new Set();
          updateQueue.add(thenable);
          _workInProgress.updateQueue = updateQueue;
        } else {
          thenables.add(thenable);
        }

        // 非并发模式（同步模式）
        if ((_workInProgress.mode & ConcurrentMode) === NoEffect) {
          // 标记suspense组件的didCapture的错误，并取消懒加载组件的Incomplete副作用
          _workInProgress.effectTag |= DidCapture;
          sourceFiber.effectTag &= ~(LifecycleEffectMask | Incomplete);

          // 懒加载组件fiber的tag不可能是classComponent，是LazyComponent
          // 如果是类组件，首渲阶段就更新tag，更新阶段创造一个ForceUpdate类型的update对象并放进入队列
          if (sourceFiber.tag === ClassComponent) {
            var currentSourceFiber = sourceFiber.alternate;
            if (currentSourceFiber === null) {
              sourceFiber.tag = IncompleteClassComponent;
            } else {
              var update = createUpdate(Sync);
              update.tag = ForceUpdate;
              enqueueUpdate(sourceFiber, update);
            }
          }

          // 【改eT】懒加载组件fiber的eT设置为同步执行
          sourceFiber.expirationTime = Sync;

          // 直接退出了！
          return;
        }

        // 非同步模式走下面
        attachPingListener(root, renderExpirationTime, thenable);

        // 计算超时的绝对时间
        var absoluteTimeoutMs = void 0;
        if (earliestTimeoutMs === -1) {
          absoluteTimeoutMs = maxSigned31BitInt;
        } else {
          if (startTimeMs === -1) {
            var earliestExpirationTime = findEarliestOutstandingPriorityLevel(root, renderExpirationTime);
            var earliestExpirationTimeMs = expirationTimeToMs(earliestExpirationTime);
            startTimeMs = earliestExpirationTimeMs - LOW_PRIORITY_EXPIRATION;
          }
          absoluteTimeoutMs = startTimeMs + earliestTimeoutMs;
        }

        // 开始准备显示fallback的内容
        renderDidSuspend(root, absoluteTimeoutMs, renderExpirationTime);

        _workInProgress.effectTag |= ShouldCapture;
        _workInProgress.expirationTime = renderExpirationTime;

        // 退出
        return;

      } else if (enableSuspenseServerRenderer && _workInProgress.tag === DehydratedSuspenseComponent) {
        // 水化走下面

        attachPingListener(root, renderExpirationTime, thenable);
        
        var retryCache = _workInProgress.memoizedState;
        if (retryCache === null) {
          retryCache = _workInProgress.memoizedState = new PossiblyWeakSet();
          var _current = _workInProgress.alternate;
          !_current ? invariant(false, 'A dehydrated suspense boundary must commit before trying to render. This is probably a bug in React.') : void 0;
          _current.memoizedState = retryCache;
        }
        // Memoize using the boundary fiber to prevent redundant listeners.
        if (!retryCache.has(thenable)) {
          retryCache.add(thenable);
          var retry = retryTimedOutBoundary.bind(null, _workInProgress, thenable);
          if (enableSchedulerTracing) {
            retry = tracing.unstable_wrap(retry);
          }
          thenable.then(retry, retry);
        }
        _workInProgress.effectTag |= ShouldCapture;
        _workInProgress.expirationTime = renderExpirationTime;

        // 直接退出了！
        return;
      }

      _workInProgress = _workInProgress.return;
    } while (_workInProgress !== null);

    value = new Error((getComponentName(sourceFiber.type) || 'A React component') + ' suspended while rendering, but no fallback UI was specified.\n' + '\n' + 'Add a <Suspense fallback=...> component higher in the tree to ' + 'provide a loading indicator or placeholder to display.' + getStackByFiberInDevAndProd(sourceFiber));
  }


  // 这种情况是
  // 1. 抛出的错误不是一个promise，说明promise执行失败了，抛出了一个error。或者别的组件有误
  // 2. 是懒加载组件，但是当前suspense组件超时了（之前的nextState有值），且不是水化

  nextRenderDidError = true;
  // 包装一下错误信息
  value = {
    value: value, // promise的错误对象
    source: sourceFiber, // 懒加载组件自己的fiber
    stack: getStackByFiberInDevAndProd(source) // fiber的描述信息
  };

  // 开始从当前的lazy节点向上遍历，直到找到根fiber，然后保存一下CapturedUpdate对象到队列里面
  // 接着去到completeUnitOfWork，在执行到suspense组件的时候，因为组件本身没有didcapture的副作用，因此只是标记了删除和更新
  // 接着重新调度，发现
  var workInProgress = returnFiber;
  do {
    switch (workInProgress.tag) {
      case HostRoot:
        {
          // 记录错误信息，给这个根节点标记副作用链
          var _errorInfo = value;
          workInProgress.effectTag |= ShouldCapture;
          workInProgress.expirationTime = renderExpirationTime;

          // 创建一个update对象，保存错误信息
          var _update = createRootErrorUpdate(workInProgress, _errorInfo, renderExpirationTime);

          // 把错误保存在queue的CapturedUpdate的队列里面
          enqueueCapturedUpdate(workInProgress, _update);
          return;
        }

      case ClassComponent:
        // Capture and retry
        var errorInfo = value;
        var ctor = workInProgress.type;
        var instance = workInProgress.stateNode;
        if ((workInProgress.effectTag & DidCapture) === NoEffect && (typeof ctor.getDerivedStateFromError === 'function' || instance !== null && typeof instance.componentDidCatch === 'function' && !isAlreadyFailedLegacyErrorBoundary(instance))) {
          workInProgress.effectTag |= ShouldCapture;
          workInProgress.expirationTime = renderExpirationTime;
          // Schedule the error boundary to re-render using updated state
          var _update2 = createClassErrorUpdate(workInProgress, errorInfo, renderExpirationTime);
          enqueueCapturedUpdate(workInProgress, _update2);
          return;
        }
        break;
      default:
        break;
    }
    workInProgress = workInProgress.return;
  } while (workInProgress !== null);

}




function shouldCaptureSuspense(workInProgress) {
  // 保证suspense必须有fallbcak属性
  if (workInProgress.memoizedProps.fallback === undefined) {
    return false;
  }
  // 如果当前的state没有值，也就是没超时，返回true
  var nextState = workInProgress.memoizedState;
  return nextState === null;
}



function getStackByFiberInDevAndProd(workInProgress) {
  var info = '';
  var node = workInProgress;
  do {
    info += describeFiber(node);
    node = node.return;
  } while (node);
  return info;
}



function createRootErrorUpdate(fiber, errorInfo, expirationTime) {
  // 创建一个update对象
  var update = createUpdate(expirationTime);
  update.tag = CaptureUpdate;
  update.payload = { element: null };
  var error = errorInfo.value;

  // 给这个对象的callback赋予一个处理错误的函数
  update.callback = function () {
    onUncaughtError(error);
    logError(fiber, errorInfo);
  };
  return update;
}



function enqueueCapturedUpdate(workInProgress, update) {
  var workInProgressQueue = workInProgress.updateQueue;
  if (workInProgressQueue === null) {
    workInProgressQueue = workInProgress.updateQueue = createUpdateQueue(workInProgress.memoizedState);
  } else {
    workInProgressQueue = ensureWorkInProgressQueueIsAClone(workInProgress, workInProgressQueue);
  }

  if (workInProgressQueue.lastCapturedUpdate === null) {
    workInProgressQueue.firstCapturedUpdate = workInProgressQueue.lastCapturedUpdate = update;
  } else {
    workInProgressQueue.lastCapturedUpdate.next = update;
    workInProgressQueue.lastCapturedUpdate = update;
  }
}




// !【恢复正常之后】，在readLazyComponentType之后执行的函数

// 看这个组件是什么类型
function resolveLazyComponentTag(Component) {
  if (typeof Component === 'function') {
    return shouldConstruct(Component) ? ClassComponent : FunctionComponent;
  } else if (Component !== undefined && Component !== null) {
    var $$typeof = Component.$$typeof;
    if ($$typeof === REACT_FORWARD_REF_TYPE) {
      return ForwardRef;
    }
    if ($$typeof === REACT_MEMO_TYPE) {
      return MemoComponent;
    }
  }
  return IndeterminateComponent;
}




function resolveDefaultProps(Component, baseProps) {
  // 把默认的prop和自定义的prop融合到一起，并且返回一个新的内存地址的对象
  if (Component && Component.defaultProps) {
    var props = _assign({}, baseProps);
    var defaultProps = Component.defaultProps;
    for (var propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
    return props;
  }
  return baseProps;
}







// REVIEW - 下面是portal组件经过beginWork分发后来到的更新函数


function updatePortalComponent(current, workInProgress, renderLanes) {

  // 【注意】这里推入的上下文是body（workInProgress.stateNode.containerInfo一般是body）
  pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);

  // 拿到WIP的pendingProps，实际上是children属性
  // （在createFiberFromPortal函数那边将pendingProps设置为虚拟DOM的children属性）
  var nextChildren = workInProgress.pendingProps;

  if (current === null) {
    workInProgress.child = reconcileChildFibers(workInProgress, null, nextChildren, renderLanes);
  } else {
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  }

  return workInProgress.child;
}












// REVIEW - 下面是当WIP的大儿子为null的时候，开始向右遍历，进入completeUnitOfWork（从performUnitOfWork函数进来）
// 里面的结构有点像performUnitOfWork里面有beginWork，分发之后最终去到reconcileChildren
// 这里就是compeleteUnitOfWork里面有completeWork





function completeUnitOfWork(workInProgress) {
  // 试图complete当前的fiber，然后往右边走，不然就返回父亲
  // 如果是懒加载组件在catch部分进来的，懒加载组件本身在这个函数里面没干啥，
  // 但是会一直返回父节点，然后当来到suspendse组件的时候（之前在throwException给她赋予了didCapture的副作用）
  // 在completeWork里面返回suspense组件本身，再在本函数退出去，return suspense组件

  while (true) {
    var current$$1 = workInProgress.alternate;

    // 把全局变量current改为当前的fiber
    setCurrentFiber(workInProgress);

    var returnFiber = workInProgress.return;
    var siblingFiber = workInProgress.sibling;

    // 第一种情况是：fiber当前没有Incomplete的副作用
    // 首次渲染的时候进入到这里面
    if ((workInProgress.effectTag & Incomplete) === NoEffect) {

      // 定义是否需要修复
      if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
        mayReplayFailedUnitOfWork = false;
      }

      nextUnitOfWork = workInProgress;

      // 1.1 在当前停下来的fiber处建立真实的DOM（completeWork）
      // 注意，如果是懒加载组件在catch部分进来的，completeWork里面没有懒加载组件的逻辑，直接退出了
      if (enableProfilerTimer) {
        // 时间暂停，表明从上往下遍历的阶段结束，开始向右向上遍历
        if (workInProgress.mode & ProfileMode) {
          startProfilerTimer(workInProgress);
        }

        // 进入到completeWork，新建DOM，并为DOM赋予props属性和填充children的内容
        // 最后肯定返回null
        nextUnitOfWork = completeWork(current$$1, workInProgress, nextRenderExpirationTime);

        if (workInProgress.mode & ProfileMode) {
          stopProfilerTimerIfRunningAndRecordDelta(workInProgress, false);
        }
      } else {
        nextUnitOfWork = completeWork(current$$1, workInProgress, nextRenderExpirationTime);
      }

      // 因为已经走完了comleteWork，所以可以replay
      if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
        mayReplayFailedUnitOfWork = true;
      }
      stopWorkTimer(workInProgress);


      // 1.2 更新WIP的孩子eT
      resetChildExpirationTime(workInProgress, nextRenderExpirationTime);
      resetCurrentFiber();


      // 【特殊情况】
      // 正常渲染的话这个情况貌似不会走，因为completeWork返回的都是null
      // 如果有懒加载组件，那么在遍历到suspense组件的时候，completeWork会返回suspense组件本身
      // 然后直接退出去到catch部分，继续continue，回到workLoop里面
      if (nextUnitOfWork !== null) {
        return nextUnitOfWork;
      }

      // 1.3 开始针对父亲fiber挂上effect的链条
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

      // 1.4 开始向右遍历
      if (siblingFiber !== null) {
        return siblingFiber;
        // 没有兄弟姐妹就向上遍历
      } else if (returnFiber !== null) {
        // 回到父亲节点，然后继续执行completeUnitOfWork
        // （因为这个函数是一个while(true)的死循环函数）
        workInProgress = returnFiber;
        continue;
      } else {
        return null;
      }

    } else {
      // 什么时候会走下面？？？？
      if (enableProfilerTimer && workInProgress.mode & ProfileMode) {
        stopProfilerTimerIfRunningAndRecordDelta(workInProgress, false);

        var actualDuration = workInProgress.actualDuration;
        var child = workInProgress.child;
        while (child !== null) {
          actualDuration += child.actualDuration;
          child = child.sibling;
        }
        workInProgress.actualDuration = actualDuration;
      }

      var next = unwindWork(workInProgress, nextRenderExpirationTime);
      if (workInProgress.effectTag & DidCapture) {
        stopFailedWorkTimer(workInProgress);
      } else {
        stopWorkTimer(workInProgress);
      }

      resetCurrentFiber();

      if (next !== null) {
        stopWorkTimer(workInProgress);
        if (true && ReactFiberInstrumentation_1.debugTool) {
          ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
        }
        next.effectTag &= HostEffectMask;
        return next;
      }

      if (returnFiber !== null) {
        returnFiber.firstEffect = returnFiber.lastEffect = null;
        returnFiber.effectTag |= Incomplete;
      }

      if (true && ReactFiberInstrumentation_1.debugTool) {
        ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
      }

      if (siblingFiber !== null) {
        return siblingFiber;
      } else if (returnFiber !== null) {
        workInProgress = returnFiber;
        continue;
      } else {
        return null;
      }
    }
  }
}




// 这个函数是收集所有要变化的属性/内容的信息到一个全局数组里面
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
        // 把上下文从栈中弹出，恢复XXcursor的current属性
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

        // 情况一：普通的element：拿到根节点的root原生DOM节点
        // 情况二：portal节点下面的子节点：拿到documen.body
        // 【补充】Q：什么时候会pushHostContainer？
        // A：只有在beginWork分发后处理根节点（updateHostRoot函数），和处理portal节点（updatePortalComponent函数）里面会pushHostContainer
        var rootContainerInstance = getRootHostContainer();
        var type = workInProgress.type;

        if (current !== null && workInProgress.stateNode != null) {
          // 更新走这里
          updateHostComponent$1(current, workInProgress, type, newProps, rootContainerInstance);
          if (current.ref !== workInProgress.ref) {
            markRef$1(workInProgress);
          }

        } else {
          // 首次渲染走这里
          if (!newProps) {
            break;
          }
          // 这里拿到的上下文不是之前那个fiber节点的上下文吗，因为在前面已经pop出去了
          var currentHostContext = getHostContext();

          // 根据是否水化来看要新建dom还是根据已经有的dom更新属性？？
          var wasHydrated = popHydrationState(workInProgress);
          if (wasHydrated) {
            // 水化走下面

            // 开始水化（其实就是在对比服和客的属性值，然后选择一个进行处理（监听函数/类名确认/孩子内容等），然后收集变化的孩子内容的信息）
            // 如果孩子内容变化了，标注更新，不变的话就跳过了就不构建DOM节点了！！
            if (prepareToHydrateHostInstance(workInProgress, rootContainerInstance, currentHostContext)) {
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

        // 【react18版本】
        bubbleProperties(workInProgress);

        // 【react16版本】
        break;
      }
    case HostText:
      {
        var newText = newProps;
        if (current && workInProgress.stateNode != null) {
          // 更新阶段走下面
          var oldText = current.memoizedProps;
          updateHostText$1(current, workInProgress, oldText, newText);
        } else {
          // 首渲阶段走下面
          // 拿到根节点的原生DOM和上下文
          var _rootContainerInstance = getRootHostContainer();
          var _currentHostContext = getHostContext();

          // 是否水化
          var _wasHydrated = popHydrationState(workInProgress);
          if (_wasHydrated) {
            // 水化
            if (prepareToHydrateHostTextInstance(workInProgress)) {
              markUpdate(workInProgress);
            }
          } else {
            // 非水化
            // 生成文本节点，然后保存在WIP的stateNode
            workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext, workInProgress);
          }
        }
        break;
      }
    case ForwardRef:
      break;
    case SuspenseComponent:
      {
        // 如果有错误的话，更新一下此时WIP的时间，直接return本次的WIP
        // 在懒加载组件进入到catch的throwException里面，给suspense组件加了DidCapture的副作用
        // 这是completeWork唯一一次返回的不是null，而是有值的情况，目的是回退到catch的continue那儿
        if ((workInProgress.effectTag & DidCapture) !== NoEffect) {
          // 把同步的时间给到suspense组件
          workInProgress.expirationTime = renderExpirationTime;
          return workInProgress;
        }

        // 如果WIP的memoizedState有值的话，说明接下来显示的是fallback里面的内容
        var nextState = workInProgress.memoizedState;
        var nextDidTimeout = nextState !== null;
        var prevDidTimeout = current !== null && current.memoizedState !== null;

        // 1）要删除的情况
        if (current !== null && !nextDidTimeout && prevDidTimeout) {
          // 更新 且 上一次显示fallback内容，本次没超时，需要显示真实孩子

          // 拿到替身的孩子的兄弟，也就是上次fallback的内容
          var currentFallbackChild = current.child.sibling;

          // 把替身的孩子的兄弟加到WIP的副作用链条的头部
          if (currentFallbackChild !== null) {
            var first = workInProgress.firstEffect;
            if (first !== null) {
              workInProgress.firstEffect = currentFallbackChild;
              currentFallbackChild.nextEffect = first;
            } else {
              workInProgress.firstEffect = workInProgress.lastEffect = currentFallbackChild;
              currentFallbackChild.nextEffect = null;
            }
            // 然后把替身的孩子的兄弟赋予一个副作用就是删除
            currentFallbackChild.effectTag = Deletion;
          }
        }

        // 2）要更新的情况
        // 首次渲染走下面
        // 只要之前之后有一次超时了（显示fallback的内容），就需要标记更新（在原来的副作用标志基础上添加！）
        if (nextDidTimeout || prevDidTimeout) {
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
      // portal节点本身走下面
      // 把body的hostContainers从栈中弹出 + 把上下文也弹出
      // 恢复XXcursor的current的属性（其中rootInstanceStackCursor恢复为root的DOM节点）
      popHostContainer(workInProgress);
      // 下面的函数啥也不干
      updateHostContainer(workInProgress);

      // 【react18版本】
      if (current === null) {
        // 【portal事件绑定的关键函数】监听所有事件到body上面，注意是所有！
        preparePortalMount(workInProgress.stateNode.containerInfo);
      }
      bubbleProperties(workInProgress);

      // 【react16版本】（16版本没有上面两个函数）
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
  var domElement = createElement$1(type, props, rootContainerInstance, parentNamespace);

  // 把fiber赋到真正的DOM的属性上面（这个属性名是随机的）
  precacheFiberNode(internalInstanceHandle, domElement);

  // 把props赋到真正的DOM的属性上面（这个属性名是随机的）
  updateFiberProps(domElement, props);

  // 返回的是一个空的真实的DOM
  return domElement;
}



function validateDOMNesting(childTag, childText, ancestorInfo) {
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





function createElement$1(type, props, rootContainerElement, parentNamespace) {
  // parentNamespace是标准
  // rootContainerInstance是root的容器

  // 首先拿到整个文档
  var ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
  var domElement = void 0;
  var namespaceURI = parentNamespace;
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(type);
  }
  if (namespaceURI === HTML_NAMESPACE) {
    // 开始根据type建立DOM节点
    if (type === 'script') {
      var div = ownerDocument.createElement('div');
      div.innerHTML = '<script><' + '/script>';
      var firstChild = div.firstChild;
      domElement = div.removeChild(firstChild);

    } else if (typeof props.is === 'string') {
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




function appendAllChildren(parent, workInProgress, needsVisibilityToggle, isHidden) {

  // 参数：
  // parent是真实的空的DOM

  // 1.如果这个WIP是一个原生的，内容为文本的节点，那么他的child为null
  // 因为在beginWork分发出去的函数处理children的过程中，把此fiber的child变为了null
  // 2.如果这个WIP不是上述情况，那么都会经过下面的操作，都有child，直到把所有的原生的节点都放到当前的节点下面

  // 向下递归这个节点的所有子节点，直到最最底层的，没有child
  // 【上右或下右的遍历写法】
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
  } catch (err) { }
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
    return;
  }

  // React 中表示没有工作的常量。
  var newChildExpirationTime = NoWork;

  if (enableProfilerTimer && workInProgress.mode & ProfileMode) {

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



function updateHostContainer(workInProgress) {
  // Noop
};





function createTextInstance(text, rootContainerInstance, hostContext, internalInstanceHandle) {
  // internalInstanceHandle就是WIP

  // 检查DOM
  var hostContextDev = hostContext;
  validateDOMNesting(null, text, hostContextDev.ancestorInfo);

  // 创建一个文本节点原生DOM
  var textNode = createTextNode(text, rootContainerInstance);
  // 保存fiber到真实DOM节点上
  precacheFiberNode(internalInstanceHandle, textNode);
  // 返回文本节点
  return textNode;
}

function createTextNode(text, rootContainerElement) {
  // 拿到document，然后利用这个createTextNode方法创建一个 原生DOM
  return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(text);
}

function getOwnerDocumentFromRootContainer(rootContainerElement) {
  return rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;
}


function updateHostText$1(current, workInProgress, oldText, newText) {
  if (oldText !== newText) {
    var rootContainerInstance = getRootHostContainer();
    var currentHostContext = getHostContext();
    workInProgress.stateNode = createTextInstance(newText, rootContainerInstance, currentHostContext, workInProgress);
    markUpdate(workInProgress);
  }
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
  validatePropertiesInDevelopment(tag, rawProps);

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
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'textarea':
      initWrapperState$2(domElement, rawProps);
      props = getHostProps$3(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
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
        trapClickOnNonInteractiveElement(domElement);
      }
      break;
  }
}

function trapClickOnNonInteractiveElement(node) {
  node.onclick = function(){};
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
      // 如果是children，且children是单个文本，直接填充内容
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
        // 检验函数
        if (true && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        // 【react16版本】
        // 这个时候propKey是一个函数
        // 如果是一个事件，开启监听！
        ensureListeningTo(rootContainerElement, propKey);

        // 【react18版本】
        // 到时候在completeWork那边的分发函数里面各自执行bubbleProperties
        // 20250517为止，仅仅补充了portal和hostComponent的分发函数的逻辑
        if (propKey === 'onScroll') {
          listenToNonDelegatedEvent('scroll', domElement);
        }
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
  // 1. 如果是一个自定义的tag或者不是一个普通的元素
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

  // 2. 接着开始处理必须要有的props，加到真实的DOM里面
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






// !!【react18版本】的处理completeWork分发之后的portal的预备函数
// !!【这个函数是portal节点处理交互回调函数的关键，把所有的事件都绑定到了body上面】

function preparePortalMount(portalInstance) {
  // 入参：
  // portalInstance是body的dom
  listenToAllSupportedEvents(portalInstance);
}

var listeningMarker = '_reactListening' + Math.random().toString(36).slice(2);
function listenToAllSupportedEvents(rootContainerElement) {
  // 入参：
  // rootContainerElement是body的dom

  if (!rootContainerElement[listeningMarker]) {
    // 给body赋予一个属性
    rootContainerElement[listeningMarker] = true;
    allNativeEvents.forEach(function (domEventName) {
      // 对原生的非selectionchange的所有事件进行处理
      if (domEventName !== 'selectionchange') {
        // 冒泡阶段：对非委托的事件进行处理
        // nonDelegatedEvents 集合存储了必须使用捕获阶段监听的事件（如 focus/blur），不能用冒泡，跳过冒泡
        if (!nonDelegatedEvents.has(domEventName)) {
          listenToNativeEvent(domEventName, false, rootContainerElement);
        }
        // 捕获阶段：对所有的事件进行处理，全部事件包装之后，绑定到顶层父级节点
        listenToNativeEvent(domEventName, true, rootContainerElement);
      }
    });

    // 找到document
    var ownerDocument = rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;

    // 给document加上特殊的监听函数
    if (ownerDocument !== null) {
      if (!ownerDocument[listeningMarker]) {
        ownerDocument[listeningMarker] = true;
        listenToNativeEvent('selectionchange', false, ownerDocument);
      }
    }
  }
}

function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
  // 入参：
  // domEventName事件名称
  // isCapturePhaseListener表示是否捕获阶段，false表示冒泡
  // target是顶层父级节点的DOM（要么body，要么root）

  var eventSystemFlags = 0;

  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }

  // 给顶层的父级节点绑定本fiber的事件监听函数
  addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
}

function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener, isDeferredListenerForLegacyFBSupport) {
  // 入参：
  // targetContainer是顶层父级节点的DOM（要么body，要么root）
  // domEventName事件名称
  // eventSystemFlags表示捕获还是冒泡，用二进制数字表示
  // isCapturePhaseListener表示捕获还是冒泡，用boolean表示

  // 1. 拿到事件对应的dispatchEvent_v18函数
  var listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags);

  // 对高频事件启用 passive 模式优化性能
  var isPassiveListener = undefined;
  if (passiveBrowserEventsSupported) {
    if (domEventName === 'touchstart' || domEventName === 'touchmove' || domEventName === 'wheel') {
      isPassiveListener = true;
    }
  }

  targetContainer =  targetContainer;
  var unsubscribeListener;

  // 2. 给顶层的父级节点绑定dispatchEvent_18的监听函数
  if (isCapturePhaseListener) {
    // 捕获阶段
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventCaptureListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener);
    } else {
      unsubscribeListener = addEventCaptureListener(targetContainer, domEventName, listener);
    }
  } else {
    // 冒泡阶段
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventBubbleListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener);
    } else {
      unsubscribeListener = addEventBubbleListener(targetContainer, domEventName, listener);
    }
  }
}

function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
  // 入参：
  // targetContainer是父级节点的DOM（要么body，要么root）
  // domEventName事件名称
  // eventSystemFlags表示捕获还是冒泡，用二进制数字表示

  // 拿到事件的优先级
  var eventPriority = getEventPriority(domEventName);
  var listenerWrapper;

  // 根据不同的优先级赋予不同的dispatchEvent_v18函数
  switch (eventPriority) {
    case DiscreteEventPriority:
      listenerWrapper = dispatchDiscreteEvent;
      break;

    case ContinuousEventPriority:
      listenerWrapper = dispatchContinuousEvent;
      break;

    case DefaultEventPriority:
    default:
      listenerWrapper = dispatchEvent_v18;
      break;
  }

  // 返回绑定了入参的dispatchEvent_v18函数
  return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
}

function getEventPriority(domEventName) {
  switch (domEventName) {
    // Used by SimpleEventPlugin:
    case 'cancel':
    case 'click':
    case 'close':
    case 'contextmenu':
    case 'copy':
    case 'cut':
    case 'auxclick':
    case 'dblclick':
    case 'dragend':
    case 'dragstart':
    case 'drop':
    case 'focusin':
    case 'focusout':
    case 'input':
    case 'invalid':
    case 'keydown':
    case 'keypress':
    case 'keyup':
    case 'mousedown':
    case 'mouseup':
    case 'paste':
    case 'pause':
    case 'play':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'ratechange':
    case 'reset':
    case 'resize':
    case 'seeked':
    case 'submit':
    case 'touchcancel':
    case 'touchend':
    case 'touchstart':
    case 'volumechange': // Used by polyfills:
    // eslint-disable-next-line no-fallthrough

    case 'change':
    case 'selectionchange':
    case 'textInput':
    case 'compositionstart':
    case 'compositionend':
    case 'compositionupdate': // Only enableCreateEventHandleAPI:
    // eslint-disable-next-line no-fallthrough

    case 'beforeblur':
    case 'afterblur': // Not used by React but could be by user code:
    // eslint-disable-next-line no-fallthrough

    case 'beforeinput':
    case 'blur':
    case 'fullscreenchange':
    case 'focus':
    case 'hashchange':
    case 'popstate':
    case 'select':
    case 'selectstart':
      return DiscreteEventPriority;

    case 'drag':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'scroll':
    case 'toggle':
    case 'touchmove':
    case 'wheel': 

    case 'mouseenter':
    case 'mouseleave':
    case 'pointerenter':
    case 'pointerleave':
      return ContinuousEventPriority;

    case 'message':
      {
        var schedulerPriority = getCurrentPriorityLevel();

        switch (schedulerPriority) {
          case ImmediatePriority:
            return DiscreteEventPriority;

          case UserBlockingPriority:
            return ContinuousEventPriority;

          case NormalPriority:
          case LowPriority:
            return DefaultEventPriority;

          case IdlePriority:
            return IdleEventPriority;

          default:
            return DefaultEventPriority;
        }
      }

    default:
      return DefaultEventPriority;
  }
}

function addEventCaptureListener(target, eventType, listener) {
  // 入参：
  // target是顶层父级节点的DOM（要么body，要么root）
  // eventType事件名称
  // listener是对应的dispatchEvent_v18函数
  
  // 下面的true表示是捕获
  // 因此所有节点都放到顶层父级（要么body，要么root）上面监听事件
  target.addEventListener(eventType, listener, true);
  return listener;
}

function addEventBubbleListener(target, eventType, listener) {
  // 入参：
  // target是顶层父级节点的DOM（要么body，要么root）
  // eventType事件名称
  // listener是对应的dispatchEvent_v18函数

  // 下面的false表示是捕获
  // 因此所有节点都放到顶层父级（要么body，要么root）上面监听事件
  target.addEventListener(eventType, listener, false);
  return listener;
}









// !!【react18版本】的处理交互回调函数的函数

function bubbleProperties(completedWork) {
  // 入参：
  // completedWork是WIP

  // 看孩子是否有变化（内存地址）
  var didBailout = completedWork.alternate !== null && completedWork.alternate.child === completedWork.child;
  var newChildLanes = NoLanes;
  var subtreeFlags = NoFlags;

  if (!didBailout) {
    // 没变化走下面：
    if ( (completedWork.mode & ProfileMode) !== NoMode) {
      // 性能分析模式走下面
      // 拿 统计时间 相关数据
      var actualDuration = completedWork.actualDuration;
      var treeBaseDuration = completedWork.selfBaseDuration;
      var child = completedWork.child;

      // 有孩子节点走下面
      while (child !== null) {
        // 合并子节点及其子树的优先级车道
        newChildLanes = mergeLanes(newChildLanes, mergeLanes(child.lanes, child.childLanes));
        
        // 合并子树标记
        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags;

        // 累加时间统计
        actualDuration += child.actualDuration;
        treeBaseDuration += child.treeBaseDuration;
        child = child.sibling;
      }

      completedWork.actualDuration = actualDuration;
      completedWork.treeBaseDuration = treeBaseDuration;
    } else {
      // 普通模式走下面
      var _child = completedWork.child;

      while (_child !== null) {
        newChildLanes = mergeLanes(newChildLanes, mergeLanes(_child.lanes, _child.childLanes));
        subtreeFlags |= _child.subtreeFlags;
        subtreeFlags |= _child.flags;

        // 更新子节点的 return 指针（指向当前父节点）
        _child.return = completedWork;
        _child = _child.sibling;
      }
    }

    completedWork.subtreeFlags |= subtreeFlags;
  } else {
    // 发生 bailout 时的处理（复用子节点）
    if ( (completedWork.mode & ProfileMode) !== NoMode) {

      var _treeBaseDuration = completedWork.selfBaseDuration;
      var _child2 = completedWork.child;

      while (_child2 !== null) {
        newChildLanes = mergeLanes(newChildLanes, mergeLanes(_child2.lanes, _child2.childLanes));
        
        // 只合并静态标记（生命周期与 Fiber 节点一致）
        subtreeFlags |= _child2.subtreeFlags & StaticMask;
        subtreeFlags |= _child2.flags & StaticMask;
        _treeBaseDuration += _child2.treeBaseDuration;
        _child2 = _child2.sibling;
      }

      completedWork.treeBaseDuration = _treeBaseDuration;
    } else {
      var _child3 = completedWork.child;

      while (_child3 !== null) {
        newChildLanes = mergeLanes(newChildLanes, mergeLanes(_child3.lanes, _child3.childLanes));

        subtreeFlags |= _child3.subtreeFlags & StaticMask;
        subtreeFlags |= _child3.flags & StaticMask;

        _child3.return = completedWork;
        _child3 = _child3.sibling;
      }
    }

    completedWork.subtreeFlags |= subtreeFlags;
  }

  // 更新父节点的子优先级车道
  completedWork.childLanes = newChildLanes;
  return didBailout;
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
  // mountAt是根节点的真实DOM，所有的事件都挂载到根节点上，等原生的冒泡到根节点然后执行react的模拟冒泡过程函数
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



function isInteractiveTopLevelEventType(topLevelType) {
  // topLevelEventsToDispatchConfig将事件类型（例如，"click"）映射到与该事件相关的配置。
  // 配置通常包含有关事件类型的详细信息，例如该事件是否是交互式的、该事件的优先级等
  var config = topLevelEventsToDispatchConfig[topLevelType];
  return config !== undefined && config.isInteractive === true;
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
  // 入参是合成事件对象

  // 1. 找到这个事件对象的fiber
  var targetInst = bookKeeping.targetInst;
  var ancestor = targetInst;


  // 2. 下面是：收集发生交互事件的节点
  do {
    if (!ancestor) {
      bookKeeping.ancestors.push(ancestor);
      break;
    }
    // 情况一：正常的element节点：这个root已经是根节点root的真实的DOM了
    // 情况二：portal节点及下面的子节点（body底部的节点）：root是null
    var root = findRootContainerNode(ancestor);
    // 情况二：第一次循环的时候就直接退出了，bookKeeping.ancestors里面没有这个【有交互的元素】
    if (!root) {
      break;
    }
    // 把当前节点的fiber（例如被点击的按钮节点）保存到本次事件对象的祖先队列中
    bookKeeping.ancestors.push(ancestor);

    // 找到距离根节点（原生DOM）最近的fiber
    // 如果是root传入的话，肯定返回null，结束循环
    ancestor = getClosestInstanceFromNode(root);
  } while (ancestor);

  // 情况一：正常的element：到这里bookKeeping.ancestors数组只有交互节点本身
  // 情况二：portal节点及下面的子节点：到这里bookKeeping.ancestors数组为空

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
    // 这种情况什么时候会出现？？
    // 当inst这个fiber不在id为root的react树下面，而是在body的底部，这里就返回null
    // （portal类型的节点，antd里面的弹窗经常用到）
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
        if (getEventCharCode(nativeEvent) === 0) {
          return null;
        }
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
      case TOP_AUX_CLICK:
      case TOP_DOUBLE_CLICK:
      case TOP_MOUSE_DOWN:
      case TOP_MOUSE_MOVE:
      case TOP_MOUSE_UP:
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
  var doc = getEventTargetDocument(nativeEventTarget);

  if (mouseDown || activeElement$1 == null || activeElement$1 !== getActiveElement(doc)) {
    return null;
  }

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

function executeDispatchesAndRelease (event) {
  // 派发事件（也就是执行listener函数）
  if (event) {
    executeDispatchesInOrder(event);

    // 里面的事件函数执行完之后，在executeDispatch和executeDispatchesInOrder最后会把
    // event.currentTarget（被交互的原生DOM）
    // event._dispatchListeners（交互函数）
    // event._dispatchInstances（交互的fiber）
    // 上面这些全部变为null

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
  // 入参：
  // event合成事件对象
  // listener是回调函数
  // inst是被交互元素的fiber

  var type = event.type || 'unknown-event';
  // 通过fiber拿到原生DOM，赋予给合成对象的currentTarget
  event.currentTarget = getNodeFromInstance(inst);

  // 开始执行监听函数，然后才执行里面的listener，也就是setXXXX，这个时候去看钩子函数返回的是什么样的函数（dispatchAction）
  invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
  event.currentTarget = null;
}


function getNodeFromInstance(inst) {
  if (inst.tag === HostComponent || inst.tag === HostText) {
    return inst.stateNode;
  }

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

function invokeGuardedCallbackDev (name, func, context, a, b, c, d, e, f) {

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
    Object.defineProperty(this, 'preventDefault', getPooledWarningPropertyDefinition('preventDefault', function () { }));
    Object.defineProperty(this, 'stopPropagation', getPooledWarningPropertyDefinition('stopPropagation', function () { }));
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








// REVIEW - react18版本的事件触发相关函数


function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  // pointover-->mouseover-->pointmove-->mousemove
  // pointout-->mouseout

  // 入参：
  // container是顶层父级节点的DOM（要么body，要么root）
  // domEventName事件名称
  // eventSystemFlags表示捕获还是冒泡，用二进制数字表示
  // nativeEvent是原生的事件对象

  var previousPriority = getCurrentUpdatePriority();
  var prevTransition = ReactCurrentBatchConfig.transition;
  ReactCurrentBatchConfig.transition = null;

  try {
    // 设置当前的事件的优先级！
    setCurrentUpdatePriority(ContinuousEventPriority);

    // 进入dispatchEvent_v18函数，开始模拟冒泡/捕获
    dispatchEvent_v18(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    setCurrentUpdatePriority(previousPriority);
    ReactCurrentBatchConfig.transition = prevTransition;
  }
}

function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  // onClick事件会进入这里！！！！

  // 入参：
  // container是顶层父级节点的DOM（要么body，要么root）
  // domEventName事件名称
  // eventSystemFlags表示捕获还是冒泡，用二进制数字表示
  // nativeEvent是原生的事件对象
  
  var previousPriority = getCurrentUpdatePriority();
  var prevTransition = ReactCurrentBatchConfig.transition;
  ReactCurrentBatchConfig.transition = null;

  try {
    setCurrentUpdatePriority(DiscreteEventPriority);
    dispatchEvent_v18(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    setCurrentUpdatePriority(previousPriority);
    ReactCurrentBatchConfig.transition = prevTransition;
  }
}

function getCurrentUpdatePriority() {
  return currentUpdatePriority;
}
function setCurrentUpdatePriority(newPriority) {
  currentUpdatePriority = newPriority;
}

function dispatchEvent_v18(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  if (!_enabled) {
    return;
  }

  {
    dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(domEventName, eventSystemFlags, targetContainer, nativeEvent);
  }
}


function dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  // 入参：
  // targetContainer是顶层父级节点的DOM（要么body，要么root）
  // domEventName事件名称
  // eventSystemFlags表示捕获还是冒泡，用二进制数字表示
  // nativeEvent是原生的事件对象

  // 1. 拿到被交互的元素的fiber（就是return_targetInst这个全局变量）
  var blockedOn = findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);

  // 当被点击的元素不是root或suspense，则blockedOn一定是null，下面一定会走
  if (blockedOn === null) {
    // 2. 真正的dispatchEvent函数
    dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
    clearIfContinuousEvent(domEventName, nativeEvent);
    return;
  }
  if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)) {
    nativeEvent.stopPropagation();
    return;
  }
  clearIfContinuousEvent(domEventName, nativeEvent);
  if (eventSystemFlags & IS_CAPTURE_PHASE && isDiscreteEventThatRequiresHydration(domEventName)) {
    while (blockedOn !== null) {
      var fiber = getInstanceFromNode(blockedOn);
      if (fiber !== null) {
        attemptSynchronousHydration(fiber);
      }
      var nextBlockedOn = findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);
      if (nextBlockedOn === null) {
        dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
      }
      if (nextBlockedOn === blockedOn) {
        break;
      }
      blockedOn = nextBlockedOn;
    }
    if (blockedOn !== null) {
      nativeEvent.stopPropagation();
    }
    return;
  }
  dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
}

var return_targetInst = null;
function findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  // 入参：
  // targetContainer是顶层父级节点的DOM（要么body，要么root）
  // domEventName事件名称
  // eventSystemFlags表示捕获还是冒泡，用二进制数字表示
  // nativeEvent是原生的事件对象

  return_targetInst = null;

  // 1. 通过这个事件对象找到这个原生的DOM对象
  var nativeEventTarget = getEventTarget(nativeEvent);

  // 2. 从原生的节点里面找到相应的fiber
  // 之前依靠一个随机key名保存在原生的DOM对象上，可以直接找到fiber
  var targetInst = getClosestInstanceFromNode(nativeEventTarget);

  if (targetInst !== null) {
    // 3. 查找距离当前Fiber最近的已插入到 DOM 中的祖先节点
    // （一般来说点击的时候已经挂载页面了，所以一般是返回这个fiber本身）
    var nearestMounted = getNearestMountedFiber(targetInst);

    if (nearestMounted === null) {
      targetInst = null;
    } else {
      // 根据当前fiber的类型，拿到对应的fiber（？）
      var tag = nearestMounted.tag;
      if (tag === SuspenseComponent) {
        var instance = getSuspenseInstanceFromFiber(nearestMounted);
        if (instance !== null) {
          return instance;
        }
        targetInst = null;
      } else if (tag === HostRoot) {

        var root = nearestMounted.stateNode;
        if (isRootDehydrated(root)) {
          return getContainerFromFiber(nearestMounted);
        }
        targetInst = null;
      } else if (nearestMounted !== targetInst) {

        targetInst = null;
      }
    }
  }
  // 返回这个fiber本身
  return_targetInst = targetInst;

  return null;
}


function getNearestMountedFiber(fiber) {
  var node = fiber;
  var nearestMounted = fiber;
  if (!fiber.alternate) {
    var nextNode = node;
    do {
      node = nextNode;
      // 检查是否处于挂载或注水状态（这个情况是此时此刻还没有挂载页面！）
      if ((node.flags & (Placement | Hydrating)) !== NoFlags) {
        nearestMounted = node.return;
      }
      nextNode = node.return;
    } while (nextNode);
  } else {
    while (node.return) {
      node = node.return;
    }
  }
  // 最后直到根节点停下来，返回这个fiber本身
  if (node.tag === HostRoot) {
    return nearestMounted;
  }
  return null;
}

function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
  // 入参：
  // targetContainer是顶层父级节点的DOM（要么body，要么root）
  // domEventName事件名称
  // eventSystemFlags表示捕获还是冒泡，用二进制数字表示
  // nativeEvent是原生的事件对象
  // targetInst是被交互的元素的fiber
  
  var ancestorInst = targetInst;

  // 两个条件：事件需要委托处理，且目标节点是 React 管理的 DOM 元素
  // 内部在判断当前fiber的顶层父级元素DOM是不是和targetContainer入参一样
  if ((eventSystemFlags & IS_EVENT_HANDLE_NON_MANAGED_NODE) === 0 && (eventSystemFlags & IS_NON_DELEGATED) === 0) {
    var targetContainerNode = targetContainer;
    if (targetInst !== null) {
      var node = targetInst;
      mainLoop: while (true) {
        if (node === null) {
          return;
        }
        var nodeTag = node.tag;

        // 从当前的fiber节点循环一直往上找，必须找到portal或者是root
        if (nodeTag === HostRoot || nodeTag === HostPortal) {
          // 拿到顶层的父级真实DOM
          var container = node.stateNode.containerInfo;

          // 判断这个顶层的父级真实DOM是不是和入参一样，是的话就直接退出循环
          if (isMatchingRootContainer(container, targetContainerNode)) {
            break;
          }
          if (nodeTag === HostPortal) {
            var grandNode = node.return;
            while (grandNode !== null) {
              var grandTag = grandNode.tag;
              if (grandTag === HostRoot || grandTag === HostPortal) {
                var grandContainer = grandNode.stateNode.containerInfo;
                if (isMatchingRootContainer(grandContainer, targetContainerNode)) {
                  return;
                }
              }
              grandNode = grandNode.return;
            }
          }
          // 假设和入参不一样，那就找最近的祖上元素DOM
          while (container !== null) {
            var parentNode = getClosestInstanceFromNode(container);
            if (parentNode === null) {
              return;
            }
            var parentTag = parentNode.tag;
            if (parentTag === HostComponent || parentTag === HostText) {
              node = ancestorInst = parentNode;
              continue mainLoop;
            }
            container = container.parentNode;
          }
        }
        node = node.return;
      }
    }
  }

  // 一样的话就开始真正的dispatchEvent
  batchedUpdates(function () {
    return dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, ancestorInst);
  });
}

function isMatchingRootContainer(grandContainer, targetContainer) {
  return grandContainer === targetContainer || grandContainer.nodeType === COMMENT_NODE && grandContainer.parentNode === targetContainer;
}

function dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
  // 通过这个事件对象找到这个原生的DOM对象
  var nativeEventTarget = getEventTarget(nativeEvent);
  var dispatchQueue = [];
  extractEvents$5(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
  // 处理【每个事件对应的所有捕获与冒泡函数】数组
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}

function extractEvents$5(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
  extractEvents$4(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
  
  // 判断是否需要处理 polyfill 插件
  var shouldProcessPolyfillPlugins = (eventSystemFlags & SHOULD_NOT_PROCESS_POLYFILL_EVENT_PLUGINS) === 0;
  if (shouldProcessPolyfillPlugins) {
    // 按需执行兼容性处理
    // 处理鼠标/指针的进出事件
    extractEvents$2(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
    // 选择事件
    extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
    // 表单事件
    extractEvents$3(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
    // 兜底处理
    extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
  }
}

function extractEvents$4(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
  // 入参：
  // dispatchQueue是一个数组
  // domEventName事件名称
  // nativeEvent是原生的事件对象
  // targetInst是被交互的元素的fiber
  // nativeEventTarget是当前被交互的节点的原生DOM对象
  // eventSystemFlags表示捕获还是冒泡，用二进制数字表示

  // topLevelEventsToReactNames是一个map，长下面这样
  // 1: {"canplay" => "onCanPlay"}
  // 2: {"canplaythrough" => "onCanPlayThrough"}
  // 3: {"click" => "onClick"}
  // 4: {"close" => "onClose"}

  var reactName = topLevelEventsToReactNames.get(domEventName);

  if (reactName === undefined) {
    return;
  }

  // 1. 初始化合成事件对象
  var SyntheticEventCtor = SyntheticEvent_v18;
  var reactEventType = domEventName;

  // 2. 根据不同的事件类型更改合成事件对象
  switch (domEventName) {
    case 'keypress':
      if (getEventCharCode(nativeEvent) === 0) {
        return;
      }
    case 'keydown':
    case 'keyup':
      SyntheticEventCtor = SyntheticKeyboardEvent;
      break;
    case 'focusin':
      reactEventType = 'focus';
      SyntheticEventCtor = SyntheticFocusEvent;
      break;
    case 'focusout':
      reactEventType = 'blur';
      SyntheticEventCtor = SyntheticFocusEvent;
      break;
    case 'beforeblur':
    case 'afterblur':
      SyntheticEventCtor = SyntheticFocusEvent;
      break;
    case 'click':
      if (nativeEvent.button === 2) {
        return;
      }
    case 'auxclick':
    case 'dblclick':
    case 'mousedown':
    case 'mousemove':
    case 'mouseup': 
    case 'mouseout':
    case 'mouseover':
    case 'contextmenu':
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
    case 'drag':
    case 'dragend':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'dragstart':
    case 'drop':
      SyntheticEventCtor = SyntheticDragEvent;
      break;
    case 'touchcancel':
    case 'touchend':
    case 'touchmove':
    case 'touchstart':
      SyntheticEventCtor = SyntheticTouchEvent;
      break;
    case ANIMATION_END:
    case ANIMATION_ITERATION:
    case ANIMATION_START:
      SyntheticEventCtor = SyntheticAnimationEvent;
      break;
    case TRANSITION_END:
      SyntheticEventCtor = SyntheticTransitionEvent;
      break;
    case 'scroll':
      SyntheticEventCtor = SyntheticUIEvent;
      break;
    case 'wheel':
      SyntheticEventCtor = SyntheticWheelEvent;
      break;
    case 'copy':
    case 'cut':
    case 'paste':
      SyntheticEventCtor = SyntheticClipboardEvent;
      break;
    case 'gotpointercapture':
    case 'lostpointercapture':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'pointerup':
      // 点击事件（pointerover）来到这里
      SyntheticEventCtor = SyntheticPointerEvent;
      break;
  }
  // 当前是捕获还是冒泡？？
  var inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  var accumulateTargetOnly = !inCapturePhase && domEventName === 'scroll';

  // 3. 拿到当前的事件的祖上元素所有事件合集数组
  var _listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase, accumulateTargetOnly);

  // 4. 新建合成事件对象实例，放入dispatchQueue数组
  if (_listeners.length > 0) {
    var _event = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget);
    // !重要
    // 相当于dispatchQueue的二级分类是【捕获和冒泡】，三级分类是从交互节点到顶层父节点的所有对应的回调函数
    // 比如：
    // click的捕获(listeners是从底层到顶层的顺序)-->click的冒泡(listeners是从底层到顶层的顺序)
    dispatchQueue.push({
      event: _event,
      listeners: _listeners
    });
  }
}

function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, inCapturePhase, accumulateTargetOnly, nativeEvent) {
  // 入参：
  // reactName是react类型的事件名称
  // targetFiber是被交互的元素的fiber
  // inCapturePhase表示捕获还是冒泡，用boolean表示
  // accumulateTargetOnly标识当前是否冒泡阶段的滚动事件
  
  var captureName = reactName !== null ? reactName + 'Capture' : null;
  var reactEventName = inCapturePhase ? captureName : reactName;
  var listeners = [];
  var instance = targetFiber;
  var lastHostComponent = null;

  while (instance !== null) {
    var _instance2 = instance,
        stateNode = _instance2.stateNode,
        tag = _instance2.tag;

    if (tag === HostComponent && stateNode !== null) {
      lastHostComponent = stateNode;
      if (reactEventName !== null) {
        // 拿到这个fiber上的对应事件的回调函数
        // 【按道理，捕获的事件都拿不到】
        var listener = getListener(instance, reactEventName);
        // 经过包装的回调函数放入数组里面
        if (listener != null) {
          listeners.push(createDispatchListener(instance, listener, lastHostComponent));
        }
      }
    }
    if (accumulateTargetOnly) {
      break;
    }
    // 一个事件就要往上遍历，收集祖上所有的冒泡和捕获的同一个事件
    // 对于有一个事件首先肯定是捕获，从本节点开始往上，形成的数组为：[底层节点捕获、中间层节点捕获、顶层节点捕获]
    // 然后是冒泡，从本节点开始往上，形成的数组为：[底层节点冒泡、中间层节点冒泡、顶层节点冒泡]
    instance = instance.return;
  }
  return listeners;
}

function createDispatchListener(instance, listener, currentTarget) {
  // instance是被交互的元素的fiber
  // currentTarget是被交互元素的真实的DOM
  return {
    instance: instance,
    listener: listener,
    currentTarget: currentTarget
  };
}






// 下面函数仅处理鼠标/指针的进出事件
function extractEvents$2(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
  // 入参：
  // dispatchQueue是一个数组
  // domEventName事件名称
  // nativeEvent是原生的事件对象
  // targetInst是被交互的元素的fiber
  // nativeEventTarget是当前被交互的节点的原生DOM对象

  var isOverEvent = domEventName === 'mouseover' || domEventName === 'pointerover';
  var isOutEvent = domEventName === 'mouseout' || domEventName === 'pointerout';

  // 已处理则跳过
  if (isOverEvent && !isReplayingEvent(nativeEvent)) {
    var related = nativeEvent.relatedTarget || nativeEvent.fromElement;
    if (related) {
      if (getClosestInstanceFromNode(related) || isContainerMarkedAsRoot(related)) {
        return;
      }
    }
  }
  if (!isOutEvent && !isOverEvent) {
    return;
  }

  // 确定窗口对象
  // 确保事件能正确关联到窗口上下文，处理跨窗口或 iframe 场景。
  var win;
  if (nativeEventTarget.window === nativeEventTarget) {
    win = nativeEventTarget;
  } else {
    // 拿到document
    var doc = nativeEventTarget.ownerDocument;
    if (doc) {
      // 拿到window
      win = doc.defaultView || doc.parentWindow;
    } else {
      win = window;
    }
  }

  // 定义来去的fiber
  var from;
  var to;
  // 处理鼠标移出事件
  if (isOutEvent) {
    var _related = nativeEvent.relatedTarget || nativeEvent.toElement;

    from = targetInst;
    to = _related ? getClosestInstanceFromNode(_related) : null;

    if (to !== null) {
      var nearestMounted = getNearestMountedFiber(to);

      if (to !== nearestMounted || to.tag !== HostComponent && to.tag !== HostText) {
        to = null;
      }
    }
  } else {
    // 处理鼠标移入事件
    from = null;
    to = targetInst;
  }

  if (from === to) {
    return;
  }

  // 初始化默认的鼠标类型的合成事件对象
  var SyntheticEventCtor = SyntheticMouseEvent;
  var leaveEventType = 'onMouseLeave';
  var enterEventType = 'onMouseEnter';
  var eventTypePrefix = 'mouse';

  if (domEventName === 'pointerout' || domEventName === 'pointerover') {
    SyntheticEventCtor = SyntheticPointerEvent;
    leaveEventType = 'onPointerLeave';
    enterEventType = 'onPointerEnter';
    eventTypePrefix = 'pointer';
  }

  // 创建离开事件
  // 拿到来去fiber的原生DOM
  var fromNode = from == null ? win : getNodeFromInstance(from);
  var toNode = to == null ? win : getNodeFromInstance(to);
  // 新建事件对象的实例
  var leave = new SyntheticEventCtor(leaveEventType, eventTypePrefix + 'leave', from, nativeEvent, nativeEventTarget);
  leave.target = fromNode;
  leave.relatedTarget = toNode;

  // 创建进入事件（仅当目标实例匹配时）
  var enter = null;
  var nativeTargetInst = getClosestInstanceFromNode(nativeEventTarget);
  if (nativeTargetInst === targetInst) {
    var enterEvent = new SyntheticEventCtor(enterEventType, eventTypePrefix + 'enter', to, nativeEvent, nativeEventTarget);
    enterEvent.target = toNode;
    enterEvent.relatedTarget = fromNode;
    enter = enterEvent;
  }

  // 收集这个事件的祖上相关元素的所有回调函数数组！
  accumulateEnterLeaveTwoPhaseListeners(dispatchQueue, leave, enter, from, to);
}


function accumulateEnterLeaveTwoPhaseListeners(dispatchQueue, leaveEvent, enterEvent, from, to) {
  // 入参：
  // dispatchQueue是一个数组
  // leaveEvent/enterEvent是离开或进入的事件对象
  // from/to是来去的fiber

  var common = from && to ? getLowestCommonAncestor(from, to) : null;
  if (from !== null) {
    accumulateEnterLeaveListenersForEvent(dispatchQueue, leaveEvent, from, common, false);
  }
  if (to !== null && enterEvent !== null) {
    accumulateEnterLeaveListenersForEvent(dispatchQueue, enterEvent, to, common, true);
  }
}

function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
  // 入参：
  // dispatchQueue是一个数组
  // event是离开或进入的事件对象
  // target是来或去的fiber
  // common是来fiber和去fiber的共同的祖先
  // inCapturePhase标识冒泡还是捕获（to有值的时候是捕获阶段，from有值的时候是冒泡阶段）
  
  var registrationName = event._reactName;
  var listeners = [];
  var instance = target;

  while (instance !== null) {
    if (instance === common) {
      break;
    }

    var _instance4 = instance,
        alternate = _instance4.alternate,
        stateNode = _instance4.stateNode,
        tag = _instance4.tag;

    if (alternate !== null && alternate === common) {
      break;
    }

    if (tag === HostComponent && stateNode !== null) {
      var currentTarget = stateNode;

      if (inCapturePhase) {
        var captureListener = getListener(instance, registrationName);

        if (captureListener != null) {
          listeners.unshift(createDispatchListener(instance, captureListener, currentTarget));
        }
      } else if (!inCapturePhase) {
        var bubbleListener = getListener(instance, registrationName);

        if (bubbleListener != null) {
          listeners.push(createDispatchListener(instance, bubbleListener, currentTarget));
        }
      }
    }

    instance = instance.return;
  }

  if (listeners.length !== 0) {
    dispatchQueue.push({
      event: event,
      listeners: listeners
    });
  }
}



function extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
  var targetNode = targetInst ? getNodeFromInstance(targetInst) : window;
  var getTargetInstFunc, handleEventFunc;

  if (shouldUseChangeEvent(targetNode)) {
    getTargetInstFunc = getTargetInstForChangeEvent;
  } else if (isTextInputElement(targetNode)) {
    if (isInputEventSupported) {
      getTargetInstFunc = getTargetInstForInputOrChangeEvent;
    } else {
      getTargetInstFunc = getTargetInstForInputEventPolyfill;
      handleEventFunc = handleEventsForInputEventPolyfill;
    }
  } else if (shouldUseClickEvent(targetNode)) {
    getTargetInstFunc = getTargetInstForClickEvent;
  }

  if (getTargetInstFunc) {
    var inst = getTargetInstFunc(domEventName, targetInst);

    if (inst) {
      createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, nativeEventTarget);
      return;
    }
  }

  if (handleEventFunc) {
    handleEventFunc(domEventName, targetNode, targetInst);
  } // When blurring, set the value attribute for number inputs


  if (domEventName === 'focusout') {
    handleControlledInputBlur(targetNode);
  }
}


function extractEvents$3(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
  var targetNode = targetInst ? getNodeFromInstance(targetInst) : window;
  switch (domEventName) {
    case 'focusin':
      if (isTextInputElement(targetNode) || targetNode.contentEditable === 'true') {
        activeElement$1 = targetNode;
        activeElementInst$1 = targetInst;
        lastSelection = null;
      }
      break;
    case 'focusout':
      activeElement$1 = null;
      activeElementInst$1 = null;
      lastSelection = null;
      break;
    case 'mousedown':
      mouseDown = true;
      break;
    case 'contextmenu':
    case 'mouseup':
    case 'dragend':
      mouseDown = false;
      constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
      break;
    case 'selectionchange':
      if (skipSelectionChangeEvent) {
        break;
      }
    case 'keydown':
    case 'keyup':
      constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
  }
}

function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
  // 处理合成事件
  extractCompositionEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
  // 处理输入事件
  extractBeforeInputEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
}

function extractCompositionEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget) {
  var eventType;
  var fallbackData;

  if (canUseCompositionEvent) {
    eventType = getCompositionEventType(domEventName);
  } else if (!isComposing) {
    if (isFallbackCompositionStart(domEventName, nativeEvent)) {
      eventType = 'onCompositionStart';
    }
  } else if (isFallbackCompositionEnd(domEventName, nativeEvent)) {
    eventType = 'onCompositionEnd';
  }

  if (!eventType) {
    return null;
  }

  if (useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)) {
    // The current composition is stored statically and must not be
    // overwritten while composition continues.
    if (!isComposing && eventType === 'onCompositionStart') {
      isComposing = initialize(nativeEventTarget);
    } else if (eventType === 'onCompositionEnd') {
      if (isComposing) {
        fallbackData = getData();
      }
    }
  }

  var listeners = accumulateTwoPhaseListeners(targetInst, eventType);

  if (listeners.length > 0) {
    var event = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget);
    dispatchQueue.push({
      event: event,
      listeners: listeners
    });

    if (fallbackData) {
      // Inject data generated from fallback path into the synthetic event.
      // This matches the property of native CompositionEventInterface.
      event.data = fallbackData;
    } else {
      var customData = getDataFromCustomEvent(nativeEvent);

      if (customData !== null) {
        event.data = customData;
      }
    }
  }
}

function extractBeforeInputEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget) {
  var chars;

  if (canUseTextInputEvent) {
    chars = getNativeBeforeInputChars(domEventName, nativeEvent);
  } else {
    chars = getFallbackBeforeInputChars(domEventName, nativeEvent);
  } // If no characters are being inserted, no BeforeInput event should
  // be fired.


  if (!chars) {
    return null;
  }

  var listeners = accumulateTwoPhaseListeners(targetInst, 'onBeforeInput');

  if (listeners.length > 0) {
    var event = new SyntheticInputEvent('onBeforeInput', 'beforeinput', null, nativeEvent, nativeEventTarget);
    dispatchQueue.push({
      event: event,
      listeners: listeners
    });
    event.data = chars;
  }
}




// !【react18版本】SyntheticEvent类

// 创建出一个默认的合成事件对象
var EventInterface = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: function (event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: 0,
  isTrusted: 0
};
var SyntheticEvent_v18 = createSyntheticEvent(EventInterface);

// 点击类事件的合成事件对象
var MouseEventInterface = assign({}, UIEventInterface, {
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  getModifierState: getEventModifierState,
  button: 0,
  buttons: 0,
  relatedTarget: function (event) {
    if (event.relatedTarget === undefined) return event.fromElement === event.srcElement ? event.toElement : event.fromElement;
    return event.relatedTarget;
  },
  movementX: function (event) {
    if ('movementX' in event) {
      return event.movementX;
    }
    updateMouseMovementPolyfillState(event);
    return lastMovementX;
  },
  movementY: function (event) {
    if ('movementY' in event) {
      return event.movementY;
    }
    return lastMovementY;
  }
});
var PointerEventInterface = assign({}, MouseEventInterface, {
  pointerId: 0,
  width: 0,
  height: 0,
  pressure: 0,
  tangentialPressure: 0,
  tiltX: 0,
  tiltY: 0,
  twist: 0,
  pointerType: 0,
  isPrimary: 0
});
var SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);


// 创建合成事件的类的工厂
function createSyntheticEvent(Interface) {
  function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
    this._reactName = reactName;
    this._targetInst = targetInst;
    this.type = reactEventType;
    this.nativeEvent = nativeEvent;
    this.target = nativeEventTarget;
    this.currentTarget = null;

    for (var _propName in Interface) {
      if (!Interface.hasOwnProperty(_propName)) {
        continue;
      }

      var normalize = Interface[_propName];

      if (normalize) {
        this[_propName] = normalize(nativeEvent);
      } else {
        this[_propName] = nativeEvent[_propName];
      }
    }

    var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;

    if (defaultPrevented) {
      this.isDefaultPrevented = functionThatReturnsTrue;
    } else {
      this.isDefaultPrevented = functionThatReturnsFalse;
    }

    this.isPropagationStopped = functionThatReturnsFalse;
    return this;
  }

  assign(SyntheticBaseEvent.prototype, {
    preventDefault: function () {
      this.defaultPrevented = true;
      var event = this.nativeEvent;
      if (!event) {
        return;
      }
      if (event.preventDefault) {
        // 用原生事件去阻止默认事件的发生！
        event.preventDefault();
      } else if (typeof event.returnValue !== 'unknown') {
        event.returnValue = false;
      }
      this.isDefaultPrevented = functionThatReturnsTrue;
    },
    stopPropagation: function () {
      var event = this.nativeEvent;
      if (!event) {
        return;
      }
      if (event.stopPropagation) {
        // 用原生事件去阻止冒泡！！
        event.stopPropagation();
      } else if (typeof event.cancelBubble !== 'unknown') {
        event.cancelBubble = true;
      }
      this.isPropagationStopped = functionThatReturnsTrue;
    },
    persist: function () {
    },
    isPersistent: functionThatReturnsTrue
  });
  return SyntheticBaseEvent;
}





function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  // 入参：
  // dispatchQueue汇集所有需要执行的回调函数，格式是
  // click的捕获(listeners是从底层到顶层的顺序)-->click的冒泡(listeners是从底层到顶层的顺序)
  // eventSystemFlags是捕获（4）还是冒泡（0）

  var inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;

  for (var i = 0; i < dispatchQueue.length; i++) {
    var _dispatchQueue$i = dispatchQueue[i],
        event = _dispatchQueue$i.event,
        listeners = _dispatchQueue$i.listeners;
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
  }
  rethrowCaughtError();
}


function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
  // 入参：
  // event是合成事件对象
  // dispatchListeners是当前事件所有要执行的回调函数的数组

  var previousInstance;

  if (inCapturePhase) {
    // 如果是捕获事件，要从顶层节点开始往下执行
    for (var i = dispatchListeners.length - 1; i >= 0; i--) {
      var _dispatchListeners$i = dispatchListeners[i],
          instance = _dispatchListeners$i.instance,
          currentTarget = _dispatchListeners$i.currentTarget,
          listener = _dispatchListeners$i.listener;

      if (instance !== previousInstance && event.isPropagationStopped()) {
        return;
      }

      executeDispatch_v18(event, listener, currentTarget);
      previousInstance = instance;
    }
  } else {
    // 如果是冒泡事件，要从底层往上执行
    for (var _i = 0; _i < dispatchListeners.length; _i++) {
      var _dispatchListeners$_i = dispatchListeners[_i],
          // 分别是fiber、原生DOM、监听函数
          _instance = _dispatchListeners$_i.instance,
          _currentTarget = _dispatchListeners$_i.currentTarget,
          _listener = _dispatchListeners$_i.listener;

      // 如果是冒泡阻止，就不执行listener函数
      if (_instance !== previousInstance && event.isPropagationStopped()) {
        return;
      }

      executeDispatch_v18(event, _listener, _currentTarget);
      previousInstance = _instance;
    }
  }
}

function executeDispatch_v18(event, listener, currentTarget) {
  // 入参：
  // event是合成事件对象
  // listener是回调函数
  // currentTarget是被交互元素的真实DOM
  var type = event.type || 'unknown-event';
  event.currentTarget = currentTarget;
  invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
  event.currentTarget = null;
}


function rethrowCaughtError() {
  if (hasRethrowError) {
    var error = rethrowError;
    hasRethrowError = false;
    rethrowError = null;
    throw error;
  }
}



// !最后结束了dispatchEventForPluginEventSystem函数，进入到清理函数

function clearIfContinuousEvent(domEventName, nativeEvent) {
  switch (domEventName) {
    case 'focusin':
    case 'focusout':
      queuedFocus = null;
      break;

    case 'dragenter':
    case 'dragleave':
      queuedDrag = null;
      break;

    case 'mouseover':
    case 'mouseout':
      queuedMouse = null;
      break;

    case 'pointerover':
    case 'pointerout':
      {
        var pointerId = nativeEvent.pointerId;
        queuedPointers.delete(pointerId);
        break;
      }

    case 'gotpointercapture':
    case 'lostpointercapture':
      {
        var _pointerId = nativeEvent.pointerId;
        queuedPointerCaptures.delete(_pointerId);
        break;
      }
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
  } catch (err) { }
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
  // 首次渲染的时候孩子的eT和root的eT是一样的，都是0，什么时候重设的？
  // TODO- 答：beginWork的时候（或许还有整合更新队列的时候？？）
  var updateExpirationTimeBeforeCommit = finishedWork.expirationTime;
  var childExpirationTimeBeforeCommit = finishedWork.childExpirationTime;
  var earliestRemainingTimeBeforeCommit = childExpirationTimeBeforeCommit > updateExpirationTimeBeforeCommit ? childExpirationTimeBeforeCommit : updateExpirationTimeBeforeCommit;
  markCommittedPriorityLevels(root, earliestRemainingTimeBeforeCommit);


  // 1. 更新一些全局变量
  var prevInteractions = null;
  if (enableSchedulerTracing) {
    prevInteractions = tracing.__interactionsRef.current;
    tracing.__interactionsRef.current = root.memoizedInteractions;
  }

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
  // 首次渲染会走下面的逻辑，更新的时候，rootWithPendingPassiveEffects为null
  if (firstEffect !== null && rootWithPendingPassiveEffects !== null) {

    // 这个函数是用来处理 被动副作用（passive effects） 的函数，
    // 通常用于处理例如 useEffect 钩子的副作用，这些副作用会在组件渲染后被执行。
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
  if (currentEventStartTime === -1 && firstCallbackNode !== null && firstCallbackNode.priorityLevel === ImmediatePriority) {
    // 确保我们已经退出了所有的回调函数，但是这个时候，宏任务还没执行（比如useEffect的钩子）
    // currentEventStartTime 是当前事件的开始时间，如果它等于 -1，意味着没有正在进行的事件处理器。
    // 确保第一个回调的优先级是 立即优先级

    // 标识正在进行中
    isExecutingCallback = true;
    try {
      do {
        // 处理副作用 + 进入新循环（performWork）
        flushFirstCallback();
      } while (firstCallbackNode !== null && firstCallbackNode.priorityLevel === ImmediatePriority);
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
      commitBeforeMutationLifeCycles$1(current$$1, nextEffect);
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



function commitBeforeMutationLifeCycles$1(current$$1, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent:
      commitHookEffectList(UnmountSnapshot, NoEffect$1, finishedWork);
      return;
    case ClassComponent:
      {
        if (finishedWork.effectTag & Snapshot) {
          if (current$$1 !== null) {
            var prevProps = current$$1.memoizedProps;
            var prevState = current$$1.memoizedState;

            // 记录时间，getSnapshotBeforeUpdate函数的执行时间
            startPhaseTimer(finishedWork, 'getSnapshotBeforeUpdate');

            // 拿到类组件的对象
            var instance = finishedWork.stateNode;

            // 执行getSnapshotBeforeUpdate生命周期函数，DOM构建完成，还没绘制在页面上！
            // !注意！这里给的都是页面上显示出来的数据（替身的memorized数据），而非自己本身fiber的memorized数据
            var snapshot = instance.getSnapshotBeforeUpdate(finishedWork.elementType === finishedWork.type ? prevProps : resolveDefaultProps(finishedWork.type, prevProps), prevState);

            // 把结果保存起来，到类对象的一个属性里面
            // 后续给到componentDidUpdate的最后一个参数使用
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
      return;
    default:
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
  // 也就是执行useEffect或者useLayoutEffect函数，挂载和卸载

  // 注意，这里的unmountTag或者mountTag有可能是以下两者情况：
  // useLayoutEffect函数的UnmountMutation和MountMutation
  // useEffect函数的UnmountLayout和MountLayout

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
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}





// REVIEW - commitRoot函数中的【提交】的第二步：操作原生DOM，在页面上显示DOM内容




function commitAllHostEffects() {
  // 遍历副作用链子

  while (nextEffect !== null) {
    // 设置全局变量
    setCurrentFiber(nextEffect);

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

    // 3. 副作用是三个（增删改）中的一个，操作原生DOM
    // !可是之前在commitRoot那里不是已经把原生的DOM设置好内容和属性放到父亲的DOM上面了吗
    // 在首次渲染阶段，最底层节点的primaryEffectTag为0，不走下面
    // （首次渲染，函数/类组件下面的原生标签的stateNode已经有完整内容了，但若相互是平行的关系，相互之间是没有联系的，只是root对象的containerInfo只有root自己的原生DOM）
    // 而root下面的函数/类组件走的是PlacementAndUpdate，也就是必会让root下面的函数/类组件逐个逐个加到root里面
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


// 绘制页面（把已经在completeWork里面创建好的真实DOM树放到root真实DOM节点之下）
function commitPlacement(finishedWork) {
  if (!supportsMutation) {
    return;
  }

  // 1. 拿到祖上最近的一个原生节点fiber（有可能是root节点，也有可能不是！）
  var parentFiber = getHostParentFiber(finishedWork);

  var parent = void 0;
  var isContainer = void 0;

  // 拿到这个原生节点的原生DOM
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
  }

  // 如果root节点是重置文本的副作用，执行函数
  if (parentFiber.effectTag & ContentReset) {
    resetTextContent(parent);
    // 重置副作用
    parentFiber.effectTag &= ~ContentReset;
  }

  // 2. 找到本兄弟节点的原生DOM
  var before = getHostSibling(finishedWork);


  // 3. 开始绘制页面（从当前节点开始往下，当前节点往下往右所有都遍历了！）
  // 【上右或下右的遍历写法】
  var node = finishedWork;
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      // 当前的节点是原生的节点
      if (before) {
        // 有兄弟节点的指示
        if (isContainer) {
          // 加入到祖上最近的原生节点DOM之下
          insertInContainerBefore(parent, node.stateNode, before);
        } else {
          // 普通原生节点
          insertBefore(parent, node.stateNode, before);
        }
      } else {
        // 没有兄弟节点的指示
        if (isContainer) {
          // 加入到祖上最近的原生节点DOM之下
          appendChildToContainer(parent, node.stateNode);
        } else {
          appendChild(parent, node.stateNode);
        }
      }
    } else if (node.tag === HostPortal) {
      // nope
    } else if (node.child !== null) {
      // 1. 当前的节点还有大儿子，继续往下寻找，看能否找到一个原生节点
      node.child.return = node;
      node = node.child;
      continue;
    }

    // 当遍历结束，node回到了原点
    if (node === finishedWork) {
      return;
    }


    // 这里一旦有一个节点进入上面if的前面的循环之后（就不继续找下面的节点，进不去最后一个else if）
    // 意味着这个节点及其孩子全部被加入到root里面


    // 3. 最后如果没有兄弟节点，就往上找（直到有兄弟节点），然后往右边找
    while (node.sibling === null) {
      // 如果已经到头了，没有兄弟，没有儿子，父亲也是开始的那个fiber，回去commitAllHostEffects
      if (node.return === null || node.return === finishedWork) {
        return;
      }
      node = node.return;
    }

    // 2. 往底层找不到了，接着往右边找
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
        commitHookEffectList(UnmountMutation, MountMutation, finishedWork);
        return;
    }
    commitContainer(finishedWork);
    return;
  }

  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent:
      commitHookEffectList(UnmountMutation, MountMutation, finishedWork);
      return;

    // 注意上面！会发生fall-through：
    // 如果一个case不满足条件但是又没有break或return，代码会“掉到”下一个 case，直到遇到 break、return 或 switch 语句结束。

    // 因此标记了update副作用（使用了useLayoutEffect）的函数组件和memo组件都会进去执行commitHookEffectList函数
    // 这里只能对上useLayoutEffect的destory函数的副作用（UnmountMutation），也就是说，他的卸载是在页面绘制的同时卸载的
    case ClassComponent:
      return;
    case HostComponent:
      // 原生节点
      {
        var instance = finishedWork.stateNode;
        if (instance != null) {
          // 拿到新老props对象
          var newProps = finishedWork.memoizedProps;
          var oldProps = current$$1 !== null ? current$$1.memoizedProps : newProps;
          var type = finishedWork.type;

          // 从fiber身上拿到updateQueue数组
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
      // 
      {
        // 1. 根据state判断是否超时，拿到对应内容（WIP或WIP的孩子即空fiber）
        // 拿到过去的state，有值说明超时了，需要显示fallback内容
        var newState = finishedWork.memoizedState;
        var newDidTimeout = void 0;
        var primaryChildParent = finishedWork;

        // 拿到要显示的孩子
        if (newState === null) {
          // 没超时走下面
          // primaryChildParent还是suspense组件本身，他的孩子是正常的孩子
          newDidTimeout = false;
        } else {
          // 超时走下面
          // primaryChildParent是当前节点的孩子，就是一个空fiber
          newDidTimeout = true;
          primaryChildParent = finishedWork.child;
          // 更新newState的时间（这个时间是提交时刻的时间）
          if (newState.timedOutAt === NoWork) {
            newState.timedOutAt = requestCurrentTime();
          }
        }

        // 2. 把当前节点以下的所有节点都改成不显示（/显示）
        // 即：超时则不显示【空fiber】往下所有的孩子树，不超时则显示【<suspense>】往下的所有孩子树
        // （下面的函数在遍历到【开发者写出来的<suspense>的下一个<>】就退出了，这个节点实际上没有兄弟姐妹，她的父节点要么是【空fiber】，要么是【<suspense>】）

        // !问：但是要显示正确的内容呀？都不显示或都显示怎么可以呢？！
        // 回答：超时的时候，传入的起始节点是【空fiber】，在其大孩子处退出了，没处理【空fiber】的兄弟姐妹
        // 不超时的时候，传入的起始节点是【<suspense>】，此时不显示的节点是fallback的节点（已经在这个链的effect之前被真实操作DOM删掉了），其他都要显示
        if (primaryChildParent !== null) {
          hideOrUnhideAllChildren(primaryChildParent, newDidTimeout);
        }

        // 3. 缓存promise对象，添加回调函数，无论异步操作成功或失败均触发重试
        // 之前的uQ是用的set来存的，可遍历！
        var thenables = finishedWork.updateQueue;
        if (thenables !== null) {
          // 处理完了，恢复原状
          finishedWork.updateQueue = null;

          // 构建缓存，把这个缓存保存到WIP的stateNode里面！优先使用弱引用的set避免内存泄漏
          var retryCache = finishedWork.stateNode;
          if (retryCache === null) {
            retryCache = finishedWork.stateNode = new PossiblyWeakSet$1();
          }

          // 缓存promise对象，并为其添加回调函数，无论异步操作成功或失败均触发重试
          thenables.forEach(function (thenable) {
            // 定义一个过期函数，包装起来
            var retry = retryTimedOutBoundary.bind(null, finishedWork, thenable);
            if (enableSchedulerTracing) {
              retry = unstable_wrap(retry);
            }

            // 把promise对象放到缓存里面，无论异步操作成功或失败均触发重试
            if (!retryCache.has(thenable)) {
              retryCache.add(thenable);
              thenable.then(retry, retry);
            }
          });
        }

        // 自此之后，等待加载一个<script>，
        // 加载成功之后，执行readLazyComponentType里面的then函数和上面的retryTimedOutBoundary函数

        return;
      }
    case IncompleteClassComponent:
      return;
    default:
  }
}



function commitUpdate(domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
  // 把props放到真实的DOM上面，用一个随机key
  updateFiberProps(domElement, newProps);
  // 更新props（属性和内容）
  updateProperties(domElement, updatePayload, type, oldProps, newProps);
}



function updateProperties(domElement, updatePayload, tag, lastRawProps, nextRawProps) {
  // 针对输入类型的（选项）元素，有额外的更新逻辑
  if (tag === 'input' && nextRawProps.type === 'radio' && nextRawProps.name != null) {
    updateChecked(domElement, nextRawProps);
  }

  var wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
  var isCustomComponentTag = isCustomComponent(tag, nextRawProps);

  // 更新DOM的属性
  updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag);

  // 针对输入类型的元素
  switch (tag) {
    case 'input':
      updateWrapper(domElement, nextRawProps);
      break;
    case 'textarea':
      updateWrapper$1(domElement, nextRawProps);
      break;
    case 'select':
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

function commitTextUpdate(textInstance, oldText, newText) {
  textInstance.nodeValue = newText;
}






function commitDeletion(current$$1) {
  // supportsMutation一般都是true
  if (supportsMutation) {
    // 走这里，操作原生节点，真实地删掉这个节点及往下的所有节点
    unmountHostComponents(current$$1);
  } else {
    commitNestedUnmounts(current$$1);
  }
  // 
  detachFiber(current$$1);
}





function unmountHostComponents(current$$1) {
  // current$$1是要删除的节点fiber
  var node = current$$1;

  var currentParentIsValid = false;

  var currentParent = void 0;
  var currentParentIsContainer = void 0;

  while (true) {

    // 1. 拿到距离自己最近的一个原生祖上节点
    if (!currentParentIsValid) {
      // 拿到当前节点的父节点
      var parent = node.return;
      // 直到找到一个原生的祖上节点（HostComponent）
      findParent: while (true) {
        switch (parent.tag) {
          case HostComponent:
            currentParent = parent.stateNode;
            currentParentIsContainer = false;
            break findParent;
          case HostRoot:
            currentParent = parent.stateNode.containerInfo;
            currentParentIsContainer = true;
            break findParent;
          case HostPortal:
            currentParent = parent.stateNode.containerInfo;
            currentParentIsContainer = true;
            break findParent;
        }
        parent = parent.return;
      }
      currentParentIsValid = true;
    }

    // 2. 往下遍历，把这个节点的下面所有节点都删掉！
    // （1）如果不是原生节点就执行清理函数
    // （2）如果是原生节点就操作真实的DOM直接删掉
    if (node.tag === HostComponent || node.tag === HostText) {
      // 这个节点fiber本身是一个原生的节点，走下面

      commitNestedUnmounts(node);

      // 操作真实的DOM，把节点删掉
      if (currentParentIsContainer) {
        removeChildFromContainer(currentParent, node.stateNode);
      } else {
        removeChild(currentParent, node.stateNode);
      }

    } else if (enableSuspenseServerRenderer && node.tag === DehydratedSuspenseComponent) {
      // 这个节点fiber本身不是一个原生的节点，且是一个水化的节点
      
      if (currentParentIsContainer) {
        clearSuspenseBoundaryFromContainer(currentParent, node.stateNode);
      } else {
        clearSuspenseBoundary(currentParent, node.stateNode);
      }

    } else if (node.tag === HostPortal) {
      // 这个节点fiber本身是HostPortal类型的节点

      if (node.child !== null) {
        currentParent = node.stateNode.containerInfo;
        currentParentIsContainer = true;
        node.child.return = node;
        node = node.child;
        continue;
      }
    } else {
      // 这个这个节点fiber本身不是一个原生的节点，并且也不是一个水化的节点
      // 1）首先执行这个节点上面的uQ的effect链条的destroy函数，进行清理！
      commitUnmount(node);

      // 然后往下执行
      if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
    }

    // 如果回到了当前的节点，直接退出
    if (node === current$$1) {
      return;
    }

    // 没有兄弟姐妹就往上找，直到有兄弟姐妹为止
    while (node.sibling === null) {
      // 到顶了直接退出
      if (node.return === null || node.return === current$$1) {
        return;
      }
      node = node.return;
      if (node.tag === HostPortal) {
        currentParentIsValid = false;
      }
    }

    // 往右手边的兄弟姐妹开始遍历
    node.sibling.return = node.return;
    node = node.sibling;
  }
}



function commitUnmount(current$$1) {
  // 下面暂时不知道在干嘛
  onCommitUnmount(current$$1);

  switch (current$$1.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent:
      // 函数组件、memo组件都走下面的这个！
      {
        // 拿到uQ里面的effect对象，执行清理函数
        var updateQueue = current$$1.updateQueue;
        if (updateQueue !== null) {
          var lastEffect = updateQueue.lastEffect;
          if (lastEffect !== null) {
            var firstEffect = lastEffect.next;
            var effect = firstEffect;
            do {
              var destroy = effect.destroy;
              if (destroy !== undefined) {
                safelyCallDestroy(current$$1, destroy);
              }
              effect = effect.next;
            } while (effect !== firstEffect);
          }
        }
        break;
      }
    case ClassComponent:
      {
        safelyDetachRef(current$$1);
        var instance = current$$1.stateNode;
        if (typeof instance.componentWillUnmount === 'function') {
          safelyCallComponentWillUnmount(current$$1, instance);
        }
        return;
      }
    case HostComponent:
      {
        safelyDetachRef(current$$1);
        return;
      }
    case HostPortal:
      {
        if (supportsMutation) {
          unmountHostComponents(current$$1);
        } else if (supportsPersistence) {
          emptyPortalContainer(current$$1);
        }
        return;
      }
  }
}



function onCommitUnmount(fiber) {
  catchErrors(function (fiber) {
    return hook.onCommitFiberUnmount(rendererID, fiber);
  });
}




function removeChild(parentInstance, child) {
  parentInstance.removeChild(child);
}

function removeChildFromContainer(container, child) {
  if (container.nodeType === COMMENT_NODE) {
    container.parentNode.removeChild(child);
  } else {
    container.removeChild(child);
  }
}





function detachFiber(current$$1) {
  // 把这个节点和别人的联系全部删掉！这样就可以被垃圾回收了！！！
  current$$1.return = null;
  current$$1.child = null;
  current$$1.memoizedState = null;
  current$$1.updateQueue = null;
  var alternate = current$$1.alternate;
  if (alternate !== null) {
    alternate.return = null;
    alternate.child = null;
    alternate.memoizedState = null;
    alternate.updateQueue = null;
  }
}









// REVIEW - commitRoot函数中的【提交】的第三步：执行其他生命周期函数
// 包括componentDidUpdate/Mount、getSnapshotBeforeUpdate





function commitAllLifeCycles(finishedRoot, committedExpirationTime) {
  // 开始遍历副作用链
  while (nextEffect !== null) {
    // 重设全局信息
    {
      setCurrentFiber(nextEffect);
    }
    var effectTag = nextEffect.effectTag;

    // 如果是 更新 或 执行回调 的副作用
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

    // 在这里设置useEffect钩子函数的触发标识
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
      commitHookEffectList(UnmountLayout, MountLayout, finishedWork);
      break;

    // 注意，函数组件和简单memo组件都走上面这个函数，
    // 也就是说，useLayoutEffect钩子的create函数是在页面绘制完之后执行的（mount的时候使用MountLayout副作用）
    case ClassComponent:
      {
        var instance = finishedWork.stateNode;
        // 如果是更新的副作用
        if (finishedWork.effectTag & Update) {

          // 1. 执行挂载或更新函数
          if (current$$1 === null) {
            // 如果是首次渲染
            startPhaseTimer(finishedWork, 'componentDidMount');

            // 执行componentDidMount函数，这个时候DOM已经展现在页面上了
            instance.componentDidMount();
            stopPhaseTimer();
          } else {
            // 如果不是首次渲染

            var prevProps = finishedWork.elementType === finishedWork.type ? current$$1.memoizedProps : resolveDefaultProps(finishedWork.type, current$$1.memoizedProps);
            var prevState = current$$1.memoizedState;
            startPhaseTimer(finishedWork, 'componentDidUpdate');

            // 执行componentDidUpdate函数
            // !注意：这里传入的prevProps和prevState都是当前节点的替身的memorized数据，是显示在页面上的数据！！
            // 也就是和getSnapshotBeforeUpdate是一样的入参！
            // 这里的第三个函数是保存在实例的__reactInternalSnapshotBeforeUpdate属性的这个snapshot结果
            instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate);
            stopPhaseTimer();
          }
        }

        // 2. 把更新提交一下
        var updateQueue = finishedWork.updateQueue;
        if (updateQueue !== null) {
          commitUpdateQueue(finishedWork, updateQueue, instance, committedExpirationTime);
        }
        return;
      }
    case HostRoot:
      // 最后的root节点肯定会进来这里！
      {
        var _updateQueue = finishedWork.updateQueue;
        if (_updateQueue !== null) {
          // 而且，也会进到这里面，因为root默认就有一个update对象保存在队列里面
          // 1. 如果root下面是原生节点或者是类组件，就更新一下_instance的值
          var _instance = null;
          if (finishedWork.child !== null) {
            switch (finishedWork.child.tag) {
              case HostComponent:
                _instance = finishedWork.child.stateNode;
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
        if (current$$1 === null && finishedWork.effectTag & Update) {
          var type = finishedWork.type;
          var props = finishedWork.memoizedProps;
          commitMount(_instance2, type, props, finishedWork);
        }
        return;
      }
    case HostText:
      return;
    case HostPortal:
      return;
    case Profiler:
      if (enableProfilerTimer) {
        var onRender = finishedWork.memoizedProps.onRender;
        if (enableSchedulerTracing) {
          onRender(finishedWork.memoizedProps.id, current$$1 === null ? 'mount' : 'update', finishedWork.actualDuration, finishedWork.treeBaseDuration, finishedWork.actualStartTime, getCommitTime(), finishedRoot.memoizedInteractions);
        } else {
          onRender(finishedWork.memoizedProps.id, current$$1 === null ? 'mount' : 'update', finishedWork.actualDuration, finishedWork.treeBaseDuration, finishedWork.actualStartTime, getCommitTime());
        }
      }
      return;
    case SuspenseComponent:
      break;
    case IncompleteClassComponent:
      break;
    default:
  }
}




function commitUpdateQueue(finishedWork, finishedQueue, instance, renderExpirationTime) {
  // 参数：finishedQueue是finishedWork.updateQueue

  // 如果有已经抓住的更新firstCapturedUpdate，说明也有lastCapturedUpdate，
  // 整个CapturedUpdate放到链表的末尾
  if (finishedQueue.firstCapturedUpdate !== null) {
    if (finishedQueue.lastUpdate !== null) {
      finishedQueue.lastUpdate.next = finishedQueue.firstCapturedUpdate;
      finishedQueue.lastUpdate = finishedQueue.lastCapturedUpdate;
    }
    // 然后清空这个链表
    finishedQueue.firstCapturedUpdate = finishedQueue.lastCapturedUpdate = null;
  }

  // 执行render方法传入的函数
  commitUpdateEffects(finishedQueue.firstEffect, instance);
  // 相关属性恢复默认值
  finishedQueue.firstEffect = finishedQueue.lastEffect = null;

  // 针对firstCapturedEffect同理
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
        instanceToUse = instance;
        break;
      default:
        instanceToUse = instance;
    }
    if (typeof ref === 'function') {
      ref(instanceToUse);
    } else {
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



function commitMount(domElement, type, newProps, internalInstanceHandle) {
  if (shouldAutoFocusHostComponent(type, newProps)) {
    domElement.focus();
  }
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
    cancelHostCallback();
  }

  // 调用 requestHostCallback 来调度一个新的宿主回调
  // 并传入 flushWork（回调任务）以及 expirationTime（任务的过期时间）作为参数。
  requestHostCallback(flushWork, expirationTime);
}


function cancelHostCallback() {
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



function animationTick(rafTime) {
  // 渲染阶段：
  // 第一次：从requestHostCallback函数起放入宏任务，等从那往下执行一直回到ReactDOM.render才开始执行这个回调函数
  // 此时scheduledHostCallback是有值的，再次调用rAF放入宏任务，然后继续往下执行进入post1的函数
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
  // 这里为什么要设两个宏任务？？
  // !为了确保回调函数 callback 在合理时间内被调用，即使在浏览器因某些原因（如页面隐藏、帧率限制）未及时触发

  // requestAnimationFrame期望在下一帧渲染前执行。
  rAFID = requestAnimationFrame(function (timestamp) {
    // cancel the setTimeout
    clearTimeout(rAFTimeoutID);
    callback(timestamp);
  });

  // 在 ANIMATION_FRAME_TIMEOUT 毫秒后执行。
  rAFTimeoutID = setTimeout(function () {
    // cancel the requestAnimationFrame
    cancelAnimationFrame(rAFID);
    callback(now());
  }, ANIMATION_FRAME_TIMEOUT);


  // 虽然 requestAnimationFrame 优先级更高，但在以下场景中，setTimeout 的回调会优先触发：

  // 1. 页面处于非激活状态（如后台标签页），requestAnimationFrame 会被浏览器暂停，rAF 回调无法触发。
  // 即使页面隐藏，setTimeout 仍会计时并触发
  
  // 2. 帧率低于 ANIMATION_FRAME_TIMEOUT（ANIMATION_FRAME_TIMEOUT 设置过短）
  // 若浏览器帧率极低（如 10Hz，每帧 100ms），而 ANIMATION_FRAME_TIMEOUT 设置为更短时间（如 50ms），则 setTimeout 会先触发。
  
  // 3. 主线程长时间阻塞：
  // 若主线程被同步任务阻塞超过 ANIMATION_FRAME_TIMEOUT，则 setTimeout 回调会在空闲后立即执行，而 rAF 需等待下一帧。


  // 总结：
  // 正常情况（页面激活且帧率稳定）：
  // requestAnimationFrame 回调触发：在下一帧渲染前执行，取消 setTimeout，回调参数为 timestamp（精确帧时间）。
  // 异常情况（页面隐藏或主线程阻塞）：
  // setTimeout 计时器到期：触发回调，取消 rAF，回调参数为 unstable_now()（当前时间）。

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
      firstCallbackNode = continuationNode.next = continuationNode.previous = continuationNode;
    } else {
      var nextAfterContinuation = null;
      var node = firstCallbackNode;
      do {
        if (node.expirationTime >= expirationTime) {
          nextAfterContinuation = node;
          break;
        }
        node = node.next;
      } while (node !== firstCallbackNode);

      if (nextAfterContinuation === null) {
        nextAfterContinuation = firstCallbackNode;
      } else if (nextAfterContinuation === firstCallbackNode) {
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
  // 万一useEffect函数里面有setState函数，可以防止通过dispatchAction进入scheduleWork
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


  // 执行完副作用之后，isRendering恢复为false，重新进入调度循环
  // 情况一：如果 rootExpirationTime 不等于 NoWork，说明有工作需要执行
  // 之前在dispatchAction那里进入了scheduleWork(fiber, _expirationTime)，其中_expirationTime是当前计算的时间为Sync
  // 在scheduleWorkToRoot中，首先根据入参改变了自己的fiber的时间，然后往上攀岩到root，使得root的ChildET为Sync，
  // 然后在markPendingPriorityLevel把root.earliestPendingTime改成Sync，
  // 然后在findNextExpirationTimeToWorkOn的最后，把root的ET改为earliestPendingTime，也就是Sync
  
  // 情况二：root的eT为0：
  // !疑问：首次渲染这里是0，但是root的eT什么时候变为0了？？？？
  var rootExpirationTime = root.expirationTime;
  if (rootExpirationTime !== NoWork) {
    requestWork(root, rootExpirationTime);
  }

  // 当前是非批量更新，且isRendering已经恢复为false了
  // 一般都会往下走
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
// 此时的nextFlushedExpirationTime为0，nextFlushedRoot为null
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
    var oldInject = function (injected) {
      return nextID++;
    }
    var id = oldInject.apply(this, arguments);

    if (typeof injected.scheduleRefresh === 'function' && typeof injected.setRefreshHandler === 'function') {
      helpersByRendererID.set(id, injected);
    }

    return id;
  },
  onCommitFiberUnmount: function () { },
  onScheduleFiberRoot: function (id, root, children) { },
  onCommitFiberRoot: function (id, root, maybePriorityLevel, didError) {

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
            failedRoots.add(root);
          }
        }
      } else {
        // 处理没有 alternate 的情况
        mountedRoots.add(root);
      }
    }
  },
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
    // 返回null说明不需要处理这个节点的大孩子了（文本节点没有大孩子！）
    return null;

  } else {
    // 当前节点的子节点还有工作需要完成
    // 二更时，childExpirationTime和renderExpirationTime是一样的，都是SYnc，
    // ?!什么时候赋予的，在commit的最后，这个还是0呢？？
    // !回答：在触发交互函数后的batchedUpdate$1里面执行的是同步更新工作

    // 【给孩子节点层创建替身】给当前节点的孩子（root下面的函数/类组件节点）创造fiber的替身
    cloneChildFibers(current$$1, workInProgress);
    // 自此之后，root下面的大函数/类组件有替身了！
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

  // 这里要重新指一下child和return的指针
  workInProgress.child = newChild;
  newChild.return = workInProgress;

  // 给本层的其他兄弟姐妹孩子也创造一个alternate（复制现有 fiber ）
  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps, currentChild.expirationTime);
    newChild.return = workInProgress;
  }
  newChild.sibling = null;
}





function updateFunctionComponent(current$$1, workInProgress, Component, nextProps, renderExpirationTime) {

  // 1. 拿到上下文
  var unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
  var context = getMaskedContext(workInProgress, unmaskedContext);

  // 看上下文的过期时间是否很大，很大（所剩不多）的话需要标记didReceivedUpdate更新！
  prepareToReadContext(workInProgress, renderExpirationTime);

  var nextChildren = void 0;

  // 2. 处理这个函数组件本身（renderWithHooks函数）
  {
    ReactCurrentOwner$3.current = workInProgress;
    setCurrentPhase('render');

    // 进入renderWithHooks函数
    nextChildren = renderWithHooks(current$$1, workInProgress, Component, nextProps, context, renderExpirationTime);

    setCurrentPhase(null);
  }

  // 判断是否需要更新？？？是否需要截止！！
  // 如果没有收到更新，就直接截止了
  // 在beginWork分发到这里之前，已经给didReceiveUpdate赋值为false
  // 但是在renderWithHooks过程中，didReceiveUpdate有可能在某个钩子函数中被赋值为true（说明此时的state有变化）
  if (current$$1 !== null && !didReceiveUpdate) {
    bailoutHooks(current$$1, workInProgress, renderExpirationTime);
    return bailoutOnAlreadyFinishedWork(current$$1, workInProgress, renderExpirationTime);
  }


  // 更新孩子
  // React DevTools副作用
  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(current$$1, workInProgress, nextChildren, renderExpirationTime);
  return workInProgress.child;
}



function setCurrentPhase(lifeCyclePhase) {
  {
    phase = lifeCyclePhase;
  }
}





// 下面是更新阶段，使用到的钩子

// 首先是一些公用的函数！

function updateHookTypesDev() {
  {
    var hookName = currentHookNameInDev;

    if (hookTypesDev !== null) {
      hookTypesUpdateIndexDev++;
      if (hookTypesDev[hookTypesUpdateIndexDev] !== hookName) {
        warnOnHookMismatchInDev(hookName);
      }
    }
  }
}



function updateWorkInProgressHook() {
  // 判断是否有工作中的 hook
  if (nextWorkInProgressHook !== null) {
    // ?!什么时候这个有值？？？
    // 有的话直接用，并提前更新下一个，防止忘记了
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;

    currentHook = nextCurrentHook;
    nextCurrentHook = currentHook !== null ? currentHook.next : null;
  } else {
    // 没有的话，
    // （在renderWithHooks函数最后，nextWorkInProgressHook被恢复为null）

    // nextCurrentHook在renderWithHooks函数一开始被设置为本函数组件FIber的第一个hook对象
    // 之后在本函数末尾进行了更新
    // 因此currentHook每次都被更新为当前的hook
    currentHook = nextCurrentHook;

    // 重新新建一个hook对象，这个对象只是为了更新阶段使用
    var newHook = {
      memoizedState: currentHook.memoizedState,

      baseState: currentHook.baseState,
      queue: currentHook.queue,
      baseUpdate: currentHook.baseUpdate,

      next: null
    };

    // workInProgressHook没有链条的话，说明只有一个链条
    // 并覆盖一下之前在mount阶段保存的hook链条的第一个hook，也就是firstWorkInProgressHook变量
    if (workInProgressHook === null) {
      workInProgressHook = firstWorkInProgressHook = newHook;
    } else {
      // 加到链表的最后（线性链表）
      workInProgressHook = workInProgressHook.next = newHook;
    }

    // 更新下一个hook
    nextCurrentHook = currentHook.next;
  }
  return workInProgressHook;
}




// （一）useReducer

function updateReducer(reducer, initialArg, init) {

  // 拿到当前的一个更新类的hook（没有的话就新建，一个钩子一个更新hook）
  var hook = updateWorkInProgressHook();
  var queue = hook.queue;

  // 把reducer函数更新一下
  queue.lastRenderedReducer = reducer;


  if (numberOfReRenders > 0) {
    // ?!什么时候走这里？
    // 如果当前的hook链条指针有指向某个位置
    // 这是说明正在处于渲染阶段

    var _dispatch = queue.dispatch;

    // 处理渲染阶段更新
    if (renderPhaseUpdates !== null) {
      //renderPhaseUpdates映射表将 queue 与渲染阶段的更新队列联系起来
      var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
      if (firstRenderPhaseUpdate !== undefined) {
        renderPhaseUpdates.delete(queue);

        // 拿到以前的state，准备更新覆盖
        var newState = hook.memoizedState;
        var update = firstRenderPhaseUpdate;
        do {
          // 拿到新的state，如果有多个更新，就一直更新覆盖
          var _action = update.action;
          newState = reducer(newState, _action);
          update = update.next;
        } while (update !== null);

        // 如果两者不相同，标记一下更新
        if (!is(newState, hook.memoizedState)) {
          markWorkInProgressReceivedUpdate();
        }

        // 更新一下hook.memoizedState的值
        hook.memoizedState = newState;

        // 如果队列中的最后一个更新就是 baseUpdate，那么将 baseState 设置为新的状态
        if (hook.baseUpdate === queue.last) {
          hook.baseState = newState;
        }

        queue.lastRenderedState = newState;

        return [newState, _dispatch];
      }
    }

    return [hook.memoizedState, _dispatch];
  }


  // 能走下面说明：当前的hook链条是第一个（非渲染阶段）
  // 开始处理update队列，更新state的值

  // 拿到一些属性
  var last = queue.last;
  var baseUpdate = hook.baseUpdate;
  var baseState = hook.baseState;


  // 找到第一个update对象（从hook.queue里面的last属性）
  var first = void 0;
  if (baseUpdate !== null) {
    // 说明有未处理的更新。需要处理这些更新。
    if (last !== null) {
      // 在dispatchAction里面，hook的queue的last属性存的是update链表（且是最后一个update）
      // update对象长这样：
      // var update = {
      //   expirationTime: renderExpirationTime,
      //   action: action,
      //   eagerReducer: null,
      //   eagerState: null,
      //   next: null
      // };
      last.next = null;
    }
    // 先处理baseUpdate链表的第一个update对象
    first = baseUpdate.next;
  } else {
    // 通过最后一个update对象找到第一个update对象
    first = last !== null ? last.next : null;
  }


  // 找到了第一个update对象，走下面开始处理
  if (first !== null) {
    var _newState = baseState;
    var newBaseState = null;
    var newBaseUpdate = null;
    var prevUpdate = baseUpdate;
    var _update = first;
    var didSkip = false;

    // 更新队列里面的所有state
    do {
      var updateExpirationTime = _update.expirationTime;
      if (updateExpirationTime < renderExpirationTime) {
        // 这个更新过期了，直接跳过
        // 如果是同步更新，那么上面两个时间都是一样的，都是Sync，则不走下面
        if (!didSkip) {
          didSkip = true;
          newBaseUpdate = prevUpdate;
          newBaseState = _newState;
        }
        // 更新剩下的时间（如果更新的时间比较大）
        if (updateExpirationTime > remainingExpirationTime) {
          remainingExpirationTime = updateExpirationTime;
        }
      } else {
        // 开始更新
        if (_update.eagerReducer === reducer) {
          // 一样的reducer，直接拿到最新的结果
          _newState = _update.eagerState;
        } else {
          var _action2 = _update.action;
          _newState = reducer(_newState, _action2);
        }
      }
      prevUpdate = _update;
      _update = _update.next;
    } while (_update !== null && _update !== first);

    // 不跳过的话都要更新一下两个变量
    if (!didSkip) {
      newBaseUpdate = prevUpdate;
      newBaseState = _newState;
    }

    // 两者不一样，标记一下didReceiveUpdate，为true
    if (!is(_newState, hook.memoizedState)) {
      markWorkInProgressReceivedUpdate();
    }

    // 更新数据
    hook.memoizedState = _newState;
    hook.baseUpdate = newBaseUpdate;
    hook.baseState = newBaseState;

    queue.lastRenderedState = _newState;
  }

  // 返回新数据
  // 然后到时候在页面上（函数组件的最后return那里）拿的是hook.memoizedState的值，
  // 这个时候的值就已经变化了，他的children就变了，后面在commit阶段会改一下
  var dispatch = queue.dispatch;
  return [hook.memoizedState, dispatch];
}


function markWorkInProgressReceivedUpdate() {
  didReceiveUpdate = true;
}


// （二）useState

function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState);
}



// （三）useEffect

function updateEffect(create, deps) {
  return updateEffectImpl(Update | Passive, UnmountPassive | MountPassive, create, deps);
}


function updateEffectImpl(fiberEffectTag, hookEffectTag, create, deps) {

  // 从全局拿到当前的一个更新类的hook（没有的话就新建，一个钩子一个更新hook）
  var hook = updateWorkInProgressHook();

  var nextDeps = deps === undefined ? null : deps;

  var destroy = undefined;

  // 如果当前是更新阶段
  if (currentHook !== null) {

    // 拿到最新的一个state
    // （注意：在useEffect专属的hook里面，hook的memoizedState保存的是effect对象链表的最后一个！）
    var prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;

    // 如果依赖数组有东西
    if (nextDeps !== null) {
      var prevDeps = prevEffect.deps;

      // 看过去的依赖数组和现在的依赖数组有啥变化
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 如果相同的话（浅层相同）
        // 给effect链条加一个无副作用的effect对象，然后直接退出，不改变hook.memoizedState
        // 进去之后componentUpdateQueue是null
        pushEffect(NoEffect$1, create, destroy, nextDeps);
        return;
      }
    }
  }

  // 走到这说明两个依赖之间有不同，需要给hook.memoizedState的链条加上一个有副作用的effect对象
  sideEffectTag |= fiberEffectTag;
  hook.memoizedState = pushEffect(hookEffectTag, create, destroy, nextDeps);
}



function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    return false;
  }

  // 遍历数组（相当于遍历两个数组）
  // 但是这里不是深度对比！！！！
  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    // 逐一比较两个数组的值，如果有一个不同就返回false
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}



// ！提问如果想要写一个包装React的useEffect的钩子，是深度对比的，怎么写？
function deepEffect(fn, deps) {
  let prevDeps = null
  let sign = 0
  return function () {
    function isObject(obj) {
      return typeof obj === 'object' && obj !== null
    }
    function isDeepEqual(arr1, arr2) {
      if (!isObject(arr1) || !isObject(arr2)) {
        if (!isObject(arr1) && !isObject(arr2)) {
          if (arr1 === arr2) {
            return true
          } else {
            return false
          }
        }
        return false
      }
      let valueArr1 = Object.values(arr1)
      let valueArr2 = Object.values(arr2)
      let layerIsEqual = true
      for (let i = 0; i < valueArr1.length && i < valueArr2.length; i++) {
        let curValue1 = valueArr1[i]
        let curValue2 = valueArr2[i]
        let res = isDeepEqual(curValue1, curValue2)
        if (!res) {
          layerIsEqual = false
          break
        }
      }
      return layerIsEqual
    }
    if (!isDeepEqual(prevDeps, deps)) {
      React.useEffect(fn, [sign++])
    }
    prevDeps = deps
  }
}

// 改进一：
// 使用useRef(arr)来记录东西，每次这个东西都是放在一个空间，而不是每次都重新新建一个空间
function useDeepEffect(callback, arr) {
  if (!Array.isArray(arr)) return new Error('not arr')
  const pre = useRef(arr)
  const init = useRef(false)
  if (!init.current) {
    callback.apply(this, arguments)
    init.current = true
  } else {
    const isSame = deepDiff(arr, pre.current)
    if (!isSame) {
      callback.apply(this, arguments)
      pre.current = arr
    }
  }
}


// 改进二：
function useDeepEffect(fn, deps) {
  const prevDeps = useRef(deps);
  const signRef = useRef(0);

  // 执行深度比较
  if (!isEqual(deps, prevDeps.current)) {
    signRef.current += 1;    // 依赖变化时更新签名
    prevDeps.current = deps; // 保存新依赖
  }

  useEffect(fn, [signRef.current]); // 依赖项为签名
}

// 自定义深度比较函数 (备用方案)
function deepEqual(a, b) {
  if (a === b) return true;

  if (typeof a !== 'object' || a === null ||
    typeof b !== 'object' || b === null) {
    return false;
  }

  if (Array.isArray(a)) {
    return Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, i) => deepEqual(val, b[i]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  return (
    keysA.length === keysB.length &&
    keysA.every(key =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      deepEqual(a[key], b[key])
    )
  );
}






// （四）useMemo

function updateMemo(nextCreate, deps) {

  // 从全局拿到hook，
  var hook = updateWorkInProgressHook();

  var nextDeps = deps === undefined ? null : deps;
  var prevState = hook.memoizedState;

  // 拿到过去的值
  if (prevState !== null) {
    if (nextDeps !== null) {

      // 之前的hook的MState存的是hook.memoizedState = [nextValue, nextDeps]
      var prevDeps = prevState[1];
      // 如果两者完全相同，那就返回原来的值，不执行memo里面的函数（因为这个函数要计算的话非常麻烦）
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }

    }
  }
  // 不相同的话，执行函数
  var nextValue = nextCreate();
  // 保存一个新数组
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}






// （五）useCallback


function updateCallback(callback, deps) {

  // 从全局拿到hook，
  var hook = updateWorkInProgressHook();
  var nextDeps = deps === undefined ? null : deps;
  var prevState = hook.memoizedState;

  // 拿到过去的依赖项和新的依赖项
  if (prevState !== null) {
    if (nextDeps !== null) {
      // 之前保存的是hook.memoizedState = [callback, nextDeps];
      var prevDeps = prevState[1];
      // 依赖项相同就复用之前的
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  hook.memoizedState = [callback, nextDeps];
  return callback;
}



// （六）useRef

function updateRef(initialValue) {
  var hook = updateWorkInProgressHook();
  // 用回之前的那个对象里面存的东西！
  return hook.memoizedState;
}





function updateHostComponent$1(current, workInProgress, type, newProps, rootContainerInstance) {
  // 首先对比新老props
  var oldProps = current.memoizedProps;
  if (oldProps === newProps) {
    return;
  }

  // 拿到当前的WIP的原生DOM
  var instance = workInProgress.stateNode;
  // 拿到当前的上下文
  var currentHostContext = getHostContext();

  // 收集汇总所有更新数据
  var updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);

  // 把这个数组赋予给updateQueue队列
  workInProgress.updateQueue = updatePayload;

  // 标识一下这个fiber是需要更新！
  if (updatePayload) {
    markUpdate(workInProgress);
  }
};


function prepareUpdate(domElement, type, oldProps, newProps, rootContainerInstance, hostContext) {
  {
    var hostContextDev = hostContext;

    // 如果新旧节点的文本孩子的类型不一样
    if (typeof newProps.children !== typeof oldProps.children && (typeof newProps.children === 'string' || typeof newProps.children === 'number')) {
      // 新孩子节点改为字符串类型
      var string = '' + newProps.children;
      // 更新标准、元素名称等信息
      var ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type);
      // 检验元素的类型是否合法！
      validateDOMNesting(null, string, ownAncestorInfo);
    }
  }

  return diffProperties(domElement, type, oldProps, newProps, rootContainerInstance);
}




function diffProperties(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
  // 入参：
  // domElement：当前的WIP的原生DOM
  // tag：当前WIP的type属性
  // lastRawProps：替身的memoizedProps
  // nextRawProps：当前WIP的pendingProps
  // rootContainerElement：根节点的root原生DOM节点

  // 1. 检验props是否合法
  validatePropertiesInDevelopment(tag, nextRawProps);

  var updatePayload = null;

  var lastProps = void 0;
  var nextProps = void 0;


  // 2.处理文本输入类的元素，拿到增强好的封装好的一个props对象
  switch (tag) {
    case 'input':
      lastProps = getHostProps(domElement, lastRawProps);
      nextProps = getHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'option':
      lastProps = getHostProps$1(domElement, lastRawProps);
      nextProps = getHostProps$1(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'select':
      lastProps = getHostProps$2(domElement, lastRawProps);
      nextProps = getHostProps$2(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'textarea':
      lastProps = getHostProps$3(domElement, lastRawProps);
      nextProps = getHostProps$3(domElement, nextRawProps);
      updatePayload = [];
      break;
    default:
      lastProps = lastRawProps;
      nextProps = nextRawProps;
      if (typeof lastProps.onClick !== 'function' && typeof nextProps.onClick === 'function') {
        trapClickOnNonInteractiveElement(domElement);
      }
      break;
  }

  // 检验props是否合法
  assertValidProps(tag, nextProps);

  var propKey = void 0;
  var styleName = void 0;
  var styleUpdates = null;


  // 3. 处理老props
  for (propKey in lastProps) {
    if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
      continue;
    }

    // 如果是style
    if (propKey === STYLE$1) {
      // 拿到style对象
      var lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          // 初始化styleUpdates为空对象
          if (!styleUpdates) {
            styleUpdates = {};
          }
          // 保存一下style作为key，在styleUpdates对象中
          styleUpdates[styleName] = '';
        }
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
      // Noop.
    } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
      // Noop
    } else if (propKey === AUTOFOCUS) {
      // Noop. It doesn't work on updates anyway.
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (!updatePayload) {
        updatePayload = [];
      }

    } else {
      // 如果是老props的别的属性
      // 【存】把数据（key及其null）加到updatePayload里面
      // 说明是需要删除的属性
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }


  // 4. 处理新props
  for (propKey in nextProps) {
    // 拿到新老属性的对应的值
    var nextProp = nextProps[propKey];
    var lastProp = lastProps != null ? lastProps[propKey] : undefined;
    if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || nextProp == null && lastProp == null) {
      continue;
    }

    if (propKey === STYLE$1) {
      // 1）如果是style
      {
        if (nextProp) {
          Object.freeze(nextProp);
        }
      }
      if (lastProp) {
        // 保存老的style的属性到styleUpdates
        for (styleName in lastProp) {
          if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = '';
          }
        }
        // 更新styleUpdates的值为新的style的值
        for (styleName in nextProp) {
          if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        // 没有老的props
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = [];
          }
          // 【存】此时为style，把数据（key及其对应的styleUpdates对象（此时为null，后续变为一整个对象））加到updatePayload里面
          updatePayload.push(propKey, styleUpdates);
        }
        // 直接把最新的props对象赋予给styleUpdates
        styleUpdates = nextProp;
      }

    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      // 2）如果是内置HTML
      var nextHtml = nextProp ? nextProp[HTML] : undefined;
      var lastHtml = lastProp ? lastProp[HTML] : undefined;
      if (nextHtml != null) {
        // 【存】内置html有改变，把数据（key及其内容）加到updatePayload里面
        if (lastHtml !== nextHtml) {
          (updatePayload = updatePayload || []).push(propKey, '' + nextHtml);
        }
      } else {
        // inserted already.
      }

    } else if (propKey === CHILDREN) {
      // 3）如果是孩子
      // 【存】文本有改变，把数据（key及其内容）加到updatePayload里面
      if (lastProp !== nextProp && (typeof nextProp === 'string' || typeof nextProp === 'number')) {
        (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
      }
    } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
      // Noop

    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      // 4）如果是事件名称！
      if (nextProp != null) {
        if (true && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        // 保证监听！（到时候在WIP里面拿到props对象，通过propKey取出交互函数）
        ensureListeningTo(rootContainerElement, propKey);
      }
      if (!updatePayload && lastProp !== nextProp) {
        updatePayload = [];
      }

    } else {
      // 5）剩下的属性！
      // 【存】把数据（key及其内容）加到updatePayload里面
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }

  // 如果这个styleUpdates存在
  if (styleUpdates) {
    // 检验里面的名称是否正确
    {
      validateShorthandPropertyCollisionInDev(styleUpdates, nextProps[STYLE$1]);
    }
    (updatePayload = updatePayload || []).push(STYLE$1, styleUpdates);
  }

  // 返回需要更新的数据收集的汇总
  return updatePayload;
}



// 提交阶段！
// 这是在commitWork里面派发出来的HostComponent类别里面的commitUpdate
function updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag) {
  // 每两个每两个遍历updatePayload数组，
  // 这是之前在updateHostComponent$1里面的prepareUpdate里面收集汇总的需要更新的数据
  for (var i = 0; i < updatePayload.length; i += 2) {

    // 拿到要更新的key和value
    var propKey = updatePayload[i];
    var propValue = updatePayload[i + 1];

    // 直接操作原生DOM，修改props值
    if (propKey === STYLE$1) {
      setValueForStyles(domElement, propValue);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      setInnerHTML(domElement, propValue);
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {
      setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
    }
  }
}







// REVIEW - 以下是 交互后 更新时 触发的函数（以类组件为例子）


// 触发之后一路执行到executeDispatchesInOrder，然后再读取事件函数，再触发this.setState，然后进来这里
Component.prototype.setState = function (partialState, callback) {
  !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? invariant(false, 'setState(...): takes an object of state variables to update or a function which returns an object of state variables.') : void 0;
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};



var classComponentUpdater = {
  isMounted: isMounted,

  // this.setState的函数
  enqueueSetState: function (inst, payload, callback) {
    // 入参：
    // inst组件实例
    // payload是state对象或者一个函数
    // callback是setState的第二个参数

    // 拿到保存在实例中的fiber
    var fiber = get(inst);

    // 计算过期事件
    var currentTime = requestCurrentTime();
    var expirationTime = computeExpirationForFiber(currentTime, fiber);

    // 创建一个update对象，把当前的state数据或函数保存到update对象的payload里面
    var update = createUpdate(expirationTime);
    update.payload = payload; // 这个可能是state数据，也可能是参数为prevState返回值为newState的函数


    // 处理副作用函数
    flushPassiveEffects();

    // 把update对象加入queue队列（没有的话还要新建）里面
    enqueueUpdate(fiber, update);

    // 直接进入调度
    // 但是在batchedUpdates$1函数中，把isBatchingUpdates改为true
    // 在requestWork函数中，进入下面逻辑，直接return掉了
    // if (isBatchingUpdates) {
    //   if (isUnbatchingUpdates) {
    //     nextFlushedRoot = root;
    //     nextFlushedExpirationTime = Sync;
    //     performWorkOnRoot(root, Sync, false);
    //   }
    //   return;
    // }
    scheduleWork(fiber, expirationTime);


    // 接下来如果这个click函数里面还有下一个this.setState，
    // 就继续新建update，然后加入到queue对象里面，然后放到fiber.updateQueue（queue链表）的最后一个
    // 函数组件是直接加入到hook的queue（实际上也是fiber.updateQueue）的last属性（update链表）的最后一个，不走enqueueUpdate函数
    // 所有setXXX整理完之后，才会结束enqueueSetState函数，在batchedUpdates$1函数的finally部分进入performSyncWork
  },


  enqueueReplaceState: function (inst, payload, callback) {
    var fiber = get(inst);
    var currentTime = requestCurrentTime();
    var expirationTime = computeExpirationForFiber(currentTime, fiber);

    var update = createUpdate(expirationTime);
    update.tag = ReplaceState;
    update.payload = payload;

    if (callback !== undefined && callback !== null) {
      {
        warnOnInvalidCallback$1(callback, 'replaceState');
      }
      update.callback = callback;
    }

    flushPassiveEffects();
    enqueueUpdate(fiber, update);
    scheduleWork(fiber, expirationTime);
  },


  enqueueForceUpdate: function (inst, callback) {
    var fiber = get(inst);
    var currentTime = requestCurrentTime();
    var expirationTime = computeExpirationForFiber(currentTime, fiber);

    var update = createUpdate(expirationTime);
    update.tag = ForceUpdate;

    if (callback !== undefined && callback !== null) {
      {
        warnOnInvalidCallback$1(callback, 'forceUpdate');
      }
      update.callback = callback;
    }

    // 处理与副作用相关的函数
    flushPassiveEffects();

    // 把update对象加入queue队列（没有的话还要新建）里面
    enqueueUpdate(fiber, update);

    scheduleWork(fiber, expirationTime);
  }

};




function get(key) {
  return key._reactInternalFiber;
}








// REVIEW - 水化走下面


// 简单总结一句话就是：
// 在beginWork那边照样生成fiber，只不过立刻赋予statNode属性为真实的DOM节点
// 在completeWork那边不用新建DOM，直接对旧的DOM进行属性处理，



// 水化入口的render与正常render的区别就是：
// 进入legacyRenderSubtreeIntoContainer函数，传入的第四个参数是true，也就是forceHydrate为true

// 1. 入口
var ReactDOM = {
  hydrate: function (element, container, callback) {
    !isValidContainer(container) ? invariant(false, 'Target container is not a DOM element.') : void 0;
    {
      !!container._reactHasBeenPassedToCreateRootDEV ? warningWithoutStack$1(false, 'You are calling ReactDOM.hydrate() on a container that was previously ' + 'passed to ReactDOM.%s(). This is not supported. ' + 'Did you mean to call createRoot(container, {hydrate: true}).render(element)?', enableStableConcurrentModeAPIs ? 'createRoot' : 'unstable_createRoot') : void 0;
    }
    return legacyRenderSubtreeIntoContainer(null, element, container, true, callback);
  },
}


// 2. 根节点分发之后，来到这里
function enterHydrationState(fiber) {
  if (!supportsHydration) {
    return false;
  }

  // 通过根节点的原生DOM，拿到孩子层的一个原生节点，作为下一个水合实例
  var parentInstance = fiber.stateNode.containerInfo;
  nextHydratableInstance = getFirstHydratableChild(parentInstance);

  // 变量赋予
  hydrationParentFiber = fiber;
  isHydrating = true;
  return true;
}


function getFirstHydratableChild(parentInstance) {
  // 拿到root下面的第一个孩子
  var next = parentInstance.firstChild;

  // 找到【孩子层】最近的一个原生DOM节点
  while (next && next.nodeType !== ELEMENT_NODE && next.nodeType !== TEXT_NODE && (!enableSuspenseServerRenderer || next.nodeType !== COMMENT_NODE || next.data !== SUSPENSE_START_DATA)) {
    next = next.nextSibling;
  }
  return next;
}





// 3. updateHostComponent进来这里！
// beginWork阶段开始水合！！相当于把原生DOM赋予到fiber的stateNode上面！
function tryToClaimNextHydratableInstance(fiber) {
  if (!isHydrating) {
    return;
  }
  // 记录下一个要水合的instance，初始为root的大孩子（或其他孩子（情况少见））
  var nextInstance = nextHydratableInstance;

  // 什么情况会走下面？？？
  // 将当前 fiber 插入到树中作为一个非水合的实例。
  if (!nextInstance) {
    insertNonHydratedInstance(hydrationParentFiber, fiber);
    // 标识水合操作已经完成，更新当前的 hydrationParentFiber 变量，直接退出
    isHydrating = false;
    hydrationParentFiber = fiber;
    return;
  }

  // 一般走下面
  var firstAttemptedInstance = nextInstance;
  // 尝试对当前的 fiber 和 nextInstance 进行水合。
  // 当前fiber的原生DOM就是nextInstance（都是root下面的第一个原生DOM大孩子）
  if (!tryHydrate(fiber, nextInstance)) {
    // 失败
    // 尝试获取 firstAttemptedInstance 的下一个水合实例，
    nextInstance = getNextHydratableSibling(firstAttemptedInstance);

    // 都不行的话，插入一个新的非水合实例，更新变量之后就直接退出了
    if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
      insertNonHydratedInstance(hydrationParentFiber, fiber);
      isHydrating = false;
      hydrationParentFiber = fiber;
      return;
    }

    // 下一个水合实例拿得到的话，删除多余的实例
    deleteHydratableInstance(hydrationParentFiber, firstAttemptedInstance);
  }

  // 更新当前水合的父实例，获取nextInstance的第一个子元素作为下一个待水合的实例
  // 问：为什么永远都是第一个子元素，因为现在在beginWork阶段！！！
  // 下一次再进入这个函数时，nextHydratableInstance就是新的
  hydrationParentFiber = fiber;
  nextHydratableInstance = getFirstHydratableChild(nextInstance);
}


function tryHydrate(fiber, nextInstance) {
  // 当前fiber的原生DOM就是nextInstance（都是root下面的第一个原生DOM大孩子）
  switch (fiber.tag) {
    case HostComponent:
      {
        var type = fiber.type;
        var props = fiber.pendingProps;
        // 如果是原生的DOM节点就可以水合，再次检查一下！！
        var instance = canHydrateInstance(nextInstance, type, props);
        if (instance !== null) {
          // 直接把原生DOM挂到fiber的stateNode属性上面！！！
          fiber.stateNode = instance;
          return true;
        }
        return false;
      }
    case HostText:
      {
        var text = fiber.pendingProps;
        var textInstance = canHydrateTextInstance(nextInstance, text);
        if (textInstance !== null) {
          fiber.stateNode = textInstance;
          return true;
        }
        return false;
      }
    case SuspenseComponent:
      {
        if (enableSuspenseServerRenderer) {
          var suspenseInstance = canHydrateSuspenseInstance(nextInstance);
          if (suspenseInstance !== null) {
            // Downgrade the tag to a dehydrated component until we've hydrated it.
            fiber.tag = DehydratedSuspenseComponent;
            fiber.stateNode = suspenseInstance;
            return true;
          }
        }
        return false;
      }
    default:
      return false;
  }
}


function canHydrateInstance(instance, type, props) {
  if (instance.nodeType !== ELEMENT_NODE || type.toLowerCase() !== instance.nodeName.toLowerCase()) {
    return null;
  }
  return instance;
}







// 4. completeWork阶段走下面
// 4.1 这个函数是在找下一个水合实例
function popHydrationState(fiber) {
  if (!supportsHydration) {
    return false;
  }
  if (fiber !== hydrationParentFiber) {
    return false;
  }
  if (!isHydrating) {
    popToNextHostParent(fiber);
    isHydrating = true;
    return false;
  }

  var type = fiber.type;
  if (fiber.tag !== HostComponent || type !== 'head' && type !== 'body' && !shouldSetTextContent(type, fiber.memoizedProps)) {
    // 如果是普通的div节点，那么第一次到这里nextHydratableInstance为null
    var nextInstance = nextHydratableInstance;
    while (nextInstance) {
      deleteHydratableInstance(fiber, nextInstance);
      nextInstance = getNextHydratableSibling(nextInstance);
    }
  }

  // 最后，更新【下一个水合节点】的值————往右找兄弟姐妹，找到是原生节点为止
  // （1）首先向上找，并更新hydrationParentFiber的值为祖上是原生节点的fiber
  popToNextHostParent(fiber);
  // （2）有父亲的前提下，找这个节点的兄弟节点
  nextHydratableInstance = hydrationParentFiber ? getNextHydratableSibling(fiber.stateNode) : null;
  return true;
}

function popToNextHostParent(fiber) {
  var parent = fiber.return;
  while (parent !== null && parent.tag !== HostComponent && parent.tag !== HostRoot && parent.tag !== DehydratedSuspenseComponent) {
    parent = parent.return;
  }
  hydrationParentFiber = parent;
}

function getNextHydratableSibling(instance) {
  // 入参instance就是：fiber.stateNode，原生节点

  // 找这个原生节点的兄弟姐妹节点
  var node = instance.nextSibling;
  // 不是文字或原生节点，就继续找兄弟
  while (node && node.nodeType !== ELEMENT_NODE && node.nodeType !== TEXT_NODE && (!enableSuspenseServerRenderer || node.nodeType !== COMMENT_NODE || node.data !== SUSPENSE_START_DATA)) {
    node = node.nextSibling;
  }
  // 返回一个是原生节点的真实DOM
  return node;
}



// 4.2 开始真正的水合！
// 这个函数是真正水合的函数！！
function prepareToHydrateHostInstance(fiber, rootContainerInstance, hostContext) {
  if (!supportsHydration) {
    invariant(false, 'Expected prepareToHydrateHostInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.');
  }

  // 开始水化！！！
  var instance = fiber.stateNode;
  var updatePayload = hydrateInstance(instance, fiber.type, fiber.memoizedProps, rootContainerInstance, hostContext, fiber);
  
  // 把要更新的属性放到uQ上面！！！！
  fiber.updateQueue = updatePayload;
  if (updatePayload !== null) {
    return true;
  }
  // 如果没有要更新的信息，直接返回false
  return false;
}



function hydrateInstance(instance, type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
  // 入参：
  // instance是真实的节点（fiber.stateNode）
  // type是此时的div或别的类型
  // props是将要挂上去的props（memoizedProps）
  // rootContainerInstance是根节点的root原生DOM节点
  // internalInstanceHandle是当前的fiber

  // 保存fiber到真实节点上
  precacheFiberNode(internalInstanceHandle, instance);
  // 保存props到真实节点上
  updateFiberProps(instance, props);

  var parentNamespace = void 0;
  {
    var hostContextDev = hostContext;
    parentNamespace = hostContextDev.namespace;
  }

  // 处理属性（拿到属性值，对比 + 抉择（采用服or客））
  return diffHydratedProperties(instance, type, props, parentNamespace, rootContainerInstance);
}


function diffHydratedProperties(domElement, tag, rawProps, parentNamespace, rootContainerElement) {
  // 入参：
  // domElement就是真实的节点（fiber.stateNode）
  // tag就是type
  // rawProps就是将要挂上去的props（memoizedProps）
  // rootContainerElement就是根节点的root原生DOM节点

  var isCustomComponentTag = void 0;
  var extraAttributeNames = void 0;


  // 1. 特殊类型处理
  // iframe 和 object 监听 load 事件。
  // video 和 audio 监听所有媒体事件（如 play、pause 等）。
  switch (tag) {
    case 'iframe':
    case 'object':
      trapBubbledEvent(TOP_LOAD, domElement);
      break;
    case 'video':
    case 'audio':
      for (var i = 0; i < mediaEventTypes.length; i++) {
        trapBubbledEvent(mediaEventTypes[i], domElement);
      }
      break;
    case 'source':
      trapBubbledEvent(TOP_ERROR, domElement);
      break;
    case 'img':
    case 'image':
    case 'link':
      trapBubbledEvent(TOP_ERROR, domElement);
      trapBubbledEvent(TOP_LOAD, domElement);
      break;
    case 'form':
      trapBubbledEvent(TOP_RESET, domElement);
      trapBubbledEvent(TOP_SUBMIT, domElement);
      break;
    case 'details':
      trapBubbledEvent(TOP_TOGGLE, domElement);
      break;
    case 'input':
      initWrapperState(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'option':
      validateProps(domElement, rawProps);
      break;
    case 'select':
      initWrapperState$1(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'textarea':
      initWrapperState$2(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
  }

  // 检查props
  assertValidProps(tag, rawProps);

  // 2. 针对服务器端
  // 遍历 DOM 元素的所有属性，将未处理的属性添加到 extraAttributeNames 集合中。
  {
    extraAttributeNames = new Set();
    var attributes = domElement.attributes;
    for (var _i = 0; _i < attributes.length; _i++) {
      var name = attributes[_i].name.toLowerCase();
      switch (name) {
        case 'data-reactroot':
          break;
        case 'value':
          break;
        case 'checked':
          break;
        case 'selected':
          break;
        default:
          extraAttributeNames.add(attributes[_i].name);
      }
    }
  }

  // 3. 针对客户端，收集属性信息!
  // 如果服务器端和客户端不一样，那么给出警告，然后孩子以客户端为主
  var updatePayload = null;
  for (var propKey in rawProps) {
    if (!rawProps.hasOwnProperty(propKey)) {
      continue;
    }
    var nextProp = rawProps[propKey];
    if (propKey === CHILDREN) {
      // （1）孩子属性
      if (typeof nextProp === 'string') {
        if (domElement.textContent !== nextProp) {
          // 如果下一个props的children内容和服务器传过来的不一样，就要警告
          // 然后以服务器这边的nextProp为主！
          if ( true && !suppressHydrationWarning) {
            warnForTextDifference(domElement.textContent, nextProp);
          }
          updatePayload = [CHILDREN, nextProp];
        }
      } else if (typeof nextProp === 'number') {
        if (domElement.textContent !== '' + nextProp) {
          if ( true && !suppressHydrationWarning) {
            warnForTextDifference(domElement.textContent, nextProp);
          }
          updatePayload = [CHILDREN, '' + nextProp];
        }
      }

    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        // （2）事件监听处理！
        // 可见这个事件监听是写在客户端的！
        if ( true && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        ensureListeningTo(rootContainerElement, propKey);
      }

    } else if ( true && typeof isCustomComponentTag === 'boolean') {
      // （3）如果是自定义标签（比如className）
      var serverValue = void 0;
      // 拿到这个属性的信息，结果是一个对象如下：
      // acceptsBooleans = false
      // attributeName = 'class'
      // attributeNamespace = null
      // mustUseProperty = false
      // propertyName = 'className'
      // type = 1
      var propertyInfo = getPropertyInfo(propKey);

      if (suppressHydrationWarning) {
        // Noop

      } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1 ||
      propKey === 'value' || propKey === 'checked' || propKey === 'selected') {
        // Noop

      } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
        // dangerouslySetInnerHTML标签的处理
        var serverHTML = domElement.innerHTML;
        var nextHtml = nextProp ? nextProp[HTML] : undefined;
        var expectedHTML = normalizeHTML(domElement, nextHtml != null ? nextHtml : '');
        if (expectedHTML !== serverHTML) {
          warnForPropDifference(propKey, serverHTML, expectedHTML);
        }

      } else if (propKey === STYLE$1) {
        // style标签处理
        extraAttributeNames.delete(propKey);
        // 这个变量一开始是空值
        if (canDiffStyleForHydrationWarning) {
          var expectedStyle = createDangerousStringForStyles(nextProp);
          serverValue = domElement.getAttribute('style');
          if (expectedStyle !== serverValue) {
            warnForPropDifference(propKey, serverValue, expectedStyle);
          }
        }

      } else if (isCustomComponentTag) {
        // 自定义标签处理
        extraAttributeNames.delete(propKey.toLowerCase());
        serverValue = getValueForAttribute(domElement, propKey, nextProp);
        if (nextProp !== serverValue) {
          warnForPropDifference(propKey, serverValue, nextProp);
        }

      } else if (!shouldIgnoreAttribute(propKey, propertyInfo, isCustomComponentTag) && !shouldRemoveAttribute(propKey, nextProp, propertyInfo, isCustomComponentTag)) {
        // 其他剩下的标签（className）
        var isMismatchDueToBadCasing = false;
        if (propertyInfo !== null) {
          // 在【额外属性】那边删掉自己本身的属性
          extraAttributeNames.delete(propertyInfo.attributeName);
          // 拿到经过对比处理的属性值！（服与客不同就用服）
          serverValue = getValueForProperty(domElement, propKey, nextProp, propertyInfo);

        } else {
          var ownNamespace = parentNamespace;
          if (ownNamespace === HTML_NAMESPACE) {
            ownNamespace = getIntrinsicNamespace(tag);
          }
          if (ownNamespace === HTML_NAMESPACE) {
            extraAttributeNames.delete(propKey.toLowerCase());
          } else {
            var standardName = getPossibleStandardName(propKey);
            if (standardName !== null && standardName !== propKey) {
              isMismatchDueToBadCasing = true;
              extraAttributeNames.delete(standardName);
            }
            extraAttributeNames.delete(propKey);
          }
          serverValue = getValueForAttribute(domElement, propKey, nextProp);
        }

        if (nextProp !== serverValue && !isMismatchDueToBadCasing) {
          warnForPropDifference(propKey, serverValue, nextProp);
        }
      }
    }
  }

  // 处理额外的 DOM 属性
  {
    if (extraAttributeNames.size > 0 && !suppressHydrationWarning) {
      warnForExtraAttributes(extraAttributeNames);
    }
  }

  // 4. 特定标签的后续处理
  switch (tag) {
    case 'input':
      track(domElement);
      postMountWrapper(domElement, rawProps, true);
      break;
    case 'textarea':
      track(domElement);
      postMountWrapper$3(domElement, rawProps);
      break;
    case 'select':
    case 'option':
      break;
    default:
      if (typeof rawProps.onClick === 'function') {
        trapClickOnNonInteractiveElement(domElement);
      }
      break;
  }

  // 返回收集的信息
  // 只有在孩子不一样的时候才会收集信息
  return updatePayload;
}


// 看是不是要忽略这个属性
function shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag) {
  // name是属性名字
  // propertyInfo是属性信息
  // isCustomComponentTag是自定义组件

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

// 看是不是要移除这个属性
function shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag) {
  // name是属性名字
  // value是属性值
  // propertyInfo是属性信息
  // isCustomComponentTag是自定义组件

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


function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
  if (propertyInfo !== null && propertyInfo.type === RESERVED) {
    return false;
  }
  switch (typeof value) {
    case 'function':
    // $FlowIssue symbol is perfectly valid here
    case 'symbol':
      // eslint-disable-line
      return true;
    case 'boolean':
      {
        if (isCustomComponentTag) {
          return false;
        }
        if (propertyInfo !== null) {
          return !propertyInfo.acceptsBooleans;
        } else {
          var prefix = name.toLowerCase().slice(0, 5);
          return prefix !== 'data-' && prefix !== 'aria-';
        }
      }
    default:
      return false;
  }
}


// 这是在拿到经过对比处理的属性值
function getValueForProperty(node, name, expected, propertyInfo) {
  // node是原生节点
  // name是属性名字
  // expected是属性值，也就是对应的nextProps，也就是客户端的属性值！
  // propertyInfo是属性名字信息

  {
    if (propertyInfo.mustUseProperty) {
      var propertyName = propertyInfo.propertyName;
      return node[propertyName];

    } else {
      // 拿到正统的属性名字（比如class）
      var attributeName = propertyInfo.attributeName;
      var stringValue = null;

      if (propertyInfo.type === OVERLOADED_BOOLEAN) {
        if (node.hasAttribute(attributeName)) {
          var value = node.getAttribute(attributeName);
          if (value === '') {
            return true;
          }
          if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
            return value;
          }
          if (value === '' + expected) {
            return expected;
          }
          return value;
        }

      } else if (node.hasAttribute(attributeName)) {
        // 假设原生DOM节点有这个属性
        if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
          return node.getAttribute(attributeName);
        }
        if (propertyInfo.type === BOOLEAN) {
          return expected;
        }

        // 原生DOM节点方法，拿到属性值
        stringValue = node.getAttribute(attributeName);
      }

      // 看这个真实DOM的属性值（服务器）与fiber的nextProps的属性值（客户端）是否一样
      if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
        return stringValue === null ? expected : stringValue;
      } else if (stringValue === '' + expected) {
        return expected;
      } else {
        // 两者不一样，使用服务器端的
        return stringValue;
      }
    }
  }
}



// 【额外】
// 这个函数的作用是把children（一个react虚拟DOM）放到containerInfo（一个真实的DOM节点）里面
// 在antd-mobile的弹窗类型的组件中（popup）一般弹窗类型的组件都被放到了body的最下面
// 注意portal组件的冒泡还是遵循react树（在root节点里面）而不是dom树（在body的最后）
function createPortal(children, containerInfo, implementation) {
  // children是一个孩子树，比如(<div></div>)
  // containerInfo通常是document.body
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  {
    checkKeyStringCoercion(key);
  }

  return {
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children: children,
    containerInfo: containerInfo,
    implementation: implementation
  };
}


// 总结一下portal节点和普通节点的事件处理函数
// 一、portal节点把所有的所有的事件（包括捕获和冒泡）全部挂到body上面
// 一旦portal节点内部有任何一个节点的事件触发：
// 1. 捕获阶段：
//   1.1 body元素-->组件外部自己设置的body监听先执行（因为是在beginWork阶段挂上去的）（若有对body的addEventListener）
//   1.2 body元素-->组件内部设置的dispatchEvent后执行（在completeWork阶段挂上去）-->收集好所有祖上要执行的函数 倒序 遍历执行
//   1.3 body下面的所有链路上的元素-->没有元素被addEventListener
// 2. 冒泡阶段：
//   2.1 被交互的元素本身往上-->没有元素被addEventListener
//   2.2 body元素-->组件外部自己设置的body监听先执行（因为是在beginWork阶段挂上去的）（若有对body的addEventListener）
//   2.3 body元素-->组件内部设置的dispatchEvent后执行（在completeWork阶段挂上去）-->收集好所有祖上要执行的函数遍历执行

// 二、普通节点把onXXX对应的事件挂到root上（一般只监听冒泡）
// 一旦portal节点外部有任何一个普通节点的事件触发：
// 1. 捕获阶段：
//   1.1 body元素-->组件外部自己设置的body监听执行（若有对body的addEventListener）
//   1.2 body下面的所有链路上的元素-->没有元素被addEventListener
// 2. 冒泡阶段：
//   2.1 被交互的元素本身往上-->没有元素被addEventListener
//   2.2 root元素-->组件内部设置的dispatchEvent执行（在completeWork阶段挂上去）-->收集好所有祖上要执行的函数遍历执行
//   2.3 body元素-->组件外部自己设置的body监听执行（若有对body的addEventListener）








// REVIEW - forwardRef的内部逻辑
// 去beginWork找forwardRef的case，查找关键词：【forwardRef】

function forwardRef(render) {
  // 入参render是一个函数，接收props和ref两个参数
  // 这个包裹函数返回的是一个虚拟DOM对象，而不是一个Function组件
  var elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render
  };
  {
    var ownName;
    Object.defineProperty(elementType, 'displayName', {
      enumerable: false,
      configurable: true,
      get: function () {
        return ownName;
      },
      set: function (name) {
        ownName = name;
        if (!render.name && !render.displayName) {
          render.displayName = name;
        }
      }
    });
  }
  return elementType;
}



function updateForwardRef(current, workInProgress, Component, nextProps, renderLanes) {
  // 入参：
  // current是workInProgress的替身fiber
  // component是虚拟dom，要么是函数/类组件，要么是forwardRef的返回的虚拟DOM对象
  // nextProps是pendingProps
  // renderLanes是当前的渲染优先级（过期时间）

  {
    if (workInProgress.type !== workInProgress.elementType) {
      var innerPropTypes = Component.propTypes;
      if (innerPropTypes) {
        checkPropTypes(innerPropTypes, nextProps,
        'prop', getComponentNameFromType(Component));
      }
    }
  }

  // 拿到函数组件本身render
  // 以及ref参数，这里的ref是一个对象，里面是{current: null}，实际上就是父元素的ref
  var render = Component.render;
  var ref = workInProgress.ref;

  var nextChildren;
  var hasId;
  prepareToReadContext(workInProgress, renderLanes);
  markComponentRenderStarted(workInProgress);

  {
    ReactCurrentOwner$1.current = workInProgress;
    setIsRendering(true);

    // 开始执行函数组件的函数
    // 注意，里面的ref是传入到函数组件的第二个参数里面的，也就是Component(props, ref)
    nextChildren = renderWithHooks(current, workInProgress, render, nextProps, ref, renderLanes);
    hasId = checkDidRenderIdHook();
    // 如果是严格模式下的legacy模式，再次执行函数组件
    if ( workInProgress.mode & StrictLegacyMode) {
      setIsStrictModeForDevtools(true);
      try {
        nextChildren = renderWithHooks(current, workInProgress, render, nextProps, ref, renderLanes);
        hasId = checkDidRenderIdHook();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }
    setIsRendering(false);
  }

  {
    markComponentRenderStopped();
  }

  if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }

  if (getIsHydrating() && hasId) {
    pushMaterializedTreeId(workInProgress);
  }

  workInProgress.flags |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}






// 下面是useImperativeHandle钩子



function useImperativeHandle(ref, create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useImperativeHandle(ref, create, deps);
}


// 上面的useImperativeHandle方法进入了下面的方法
const HooksDispatcherOnMountInDEV = {
  useImperativeHandle: function (ref, create, deps) {
    currentHookNameInDev = 'useImperativeHandle';
    mountHookTypesDev();
    checkDepsAreArrayDev(deps);
    return mountImperativeHandle(ref, create, deps);
  }
}



function mountImperativeHandle(ref, create, deps) {
  // 依赖项加上父亲的ref！父亲的ref变化，那么子组件的useImperativeHandle也会更新
  // 一般这个钩子的依赖项都不传递东西，所以deps是null
  var effectDeps = deps !== null && deps !== undefined ? deps.concat([ref]) : null;
  var fiberFlags = Update;

  {
    fiberFlags |= LayoutStatic;
  }
  if ( (currentlyRenderingFiber$1.mode & StrictEffectsMode) !== NoMode) {
    fiberFlags |= MountLayoutDev;
  }

  // 下面相当于去调用useEffect调用的函数，内部的callback是imperativeHandleEffect函数
  // 把包含很多信息的effect对象放到hook.memoizedState里面
  // 然后在本轮渲染的末尾执行这个imperativeHandleEffect函数（就像useEffect里面的回调函数）
  return mountEffectImpl(fiberFlags, Layout, imperativeHandleEffect.bind(null, create, ref), effectDeps);
}




// 【核心】相当于子方法的向上传递只是发生在异步的时候，由钩子实现这个功能
// 而forwardRef的包裹只是为了给renderWithHook多传递一个ref的参数，别的和普通的函数组件的更新函数没有区别！
// （forwardRef的包裹的使用有点冗余，我个人感觉！）

function imperativeHandleEffect(create, ref) {
  if (typeof ref === 'function') {
    // ref是一个函数的情况
    var refCallback = ref;
    var _inst = create();

    // 里面的对象作为父ref函数的入参
    refCallback(_inst);

    // 返回一个入参为null的函数，再次执行父亲ref函数，卸载的时候执行
    return function () {
      refCallback(null);
    };

  } else if (ref !== null && ref !== undefined) {
    // ref是一个对象（useRef的对象）的情况
    var refObject = ref;
    // 执行这个函数，没有入参，也就是执行钩子的回调函数
    // 得到一个对象，这个对象里面有很多方法
    var _inst2 = create();

    // 把这个对象给到ref的current，父亲就可以拿到子组件提供的方法集合
    refObject.current = _inst2;

    // 返回一个清除的函数，清除父组件的ref信息，在子组件卸载的时候执行
    return function () {
      refObject.current = null;
    };
  }
}



