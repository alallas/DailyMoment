// 创建一个【store】的切片

var createSlice = buildCreateSlice();

// createSlice实际上执行的是createSlice2函数
function buildCreateSlice({ creators } = {}) {
  const cAT = creators?.asyncThunk?.[asyncThunkSymbol];
  return function createSlice2(options) {
    // 入参options是一个对象，里面有initialState、reducers、extraReducers等等
    const { name, reducerPath = name } = options;

    // 数据校验
    if (!name) {
      throw new Error(
        false ? 0 : "`name` is a required option for createSlice"
      );
    }
    if (typeof process !== "undefined" && "development" === "development") {
      if (options.initialState === void 0) {
        console.error(
          "You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`"
        );
      }
    }

    // 创建上下文
    const context = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: [],
    };

    // 定义方法
    const contextMethods = {
      addCase(typeOrActionCreator, reducer2) {
        // typeOrActionCreator是reducer的标识，reducer2是函数
        // 在示例中，typeOrActionCreator是"test/increment"

        const type =
          typeof typeOrActionCreator === "string"
            ? typeOrActionCreator
            : typeOrActionCreator.type;
        if (!type) {
          throw new Error(
            false
              ? 0
              : "`context.addCase` cannot be called with an empty action type"
          );
        }
        if (type in context.sliceCaseReducersByType) {
          throw new Error(
            false
              ? 0
              : "`context.addCase` cannot be called with two reducers for the same action type: " +
                type
          );
        }

        // 把函数保存到（此切片内部）上下文的sliceCaseReducersByType里面
        context.sliceCaseReducersByType[type] = reducer2;
        // 继续返回方法，可以链式调用
        return contextMethods;
      },
      addMatcher(matcher, reducer2) {
        context.sliceMatchers.push({
          matcher,
          reducer: reducer2,
        });
        return contextMethods;
      },
      exposeAction(name2, actionCreator) {
        // 把actionCreator的方法存起来！
        context.actionCreators[name2] = actionCreator;
        return contextMethods;
      },
      exposeCaseReducer(name2, reducer2) {
        // name2的入参是"increment"
        // 把函数保存到（此切片内部）上下文的sliceCaseReducersByName里面
        context.sliceCaseReducersByName[name2] = reducer2;
        return contextMethods;
      },
    };

    // 保存每一个reducer（初始化）
    const reducers =
      (typeof options.reducers === "function"
        ? options.reducers(buildReducerCreators())
        : options.reducers) || {};
    const reducerNames = Object.keys(reducers);
    reducerNames.forEach((reducerName) => {
      const reducerDefinition = reducers[reducerName];

      // 包装每一个reducer函数
      const reducerDetails = {
        reducerName,
        // 独一无二的标识
        type: getType(name, reducerName),
        createNotation: typeof options.reducers === "function",
      };

      // 根据是异步还是同步来判断进入哪一个逻辑
      if (isAsyncThunkSliceReducerDefinition(reducerDefinition)) {
        // 如果reducer函数本身被外部标记了一个属性（_reducerDefinitionType），就走下面
        handleThunkCaseReducerDefinition(
          reducerDetails,
          reducerDefinition,
          contextMethods,
          cAT
        );
      } else {
        // 如果是一个正常的reducer函数就走下面
        // 目的是保存reducer函数、和对应的action创建函数（一个reducer一个action）
        handleNormalReducerDefinition(
          reducerDetails,
          reducerDefinition,
          contextMethods
        );
      }
    });
    function buildReducer() {
      if (true) {
        if (typeof options.extraReducers === "object") {
          throw new Error(
            false
              ? 0
              : "The object notation for `createSlice.extraReducers` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createSlice"
          );
        }
      }
      const [
        extraReducers = {},
        actionMatchers = [],
        defaultCaseReducer = void 0,
      ] =
        typeof options.extraReducers === "function"
          ? executeReducerBuilderCallback(options.extraReducers)
          : [options.extraReducers];
      const finalCaseReducers = {
        ...extraReducers,
        ...context.sliceCaseReducersByType,
      };
      return createReducer(options.initialState, (builder) => {
        for (let key in finalCaseReducers) {
          builder.addCase(key, finalCaseReducers[key]);
        }
        for (let sM of context.sliceMatchers) {
          builder.addMatcher(sM.matcher, sM.reducer);
        }
        for (let m of actionMatchers) {
          builder.addMatcher(m.matcher, m.reducer);
        }
        if (defaultCaseReducer) {
          builder.addDefaultCase(defaultCaseReducer);
        }
      });
    }
    const selectSelf = (state) => state;
    const injectedSelectorCache = new Map();
    const injectedStateCache = new WeakMap();
    let _reducer;
    function reducer(state, action) {
      if (!_reducer) _reducer = buildReducer();
      return _reducer(state, action);
    }
    function getInitialState() {
      if (!_reducer) _reducer = buildReducer();
      return _reducer.getInitialState();
    }
    function makeSelectorProps(reducerPath2, injected = false) {
      function selectSlice(state) {
        let sliceState = state[reducerPath2];
        if (typeof sliceState === "undefined") {
          if (injected) {
            sliceState = getOrInsertComputed(
              injectedStateCache,
              selectSlice,
              getInitialState
            );
          } else if (true) {
            throw new Error(
              false
                ? 0
                : "selectSlice returned undefined for an uninjected slice reducer"
            );
          }
        }
        return sliceState;
      }
      function getSelectors(selectState = selectSelf) {
        const selectorCache = getOrInsertComputed(
          injectedSelectorCache,
          injected,
          () => /* @__PURE__ */ new WeakMap()
        );
        return getOrInsertComputed(selectorCache, selectState, () => {
          const map = {};
          for (const [name2, selector] of Object.entries(
            options.selectors ?? {}
          )) {
            map[name2] = wrapSelector(
              selector,
              selectState,
              () =>
                getOrInsertComputed(
                  injectedStateCache,
                  selectState,
                  getInitialState
                ),
              injected
            );
          }
          return map;
        });
      }
      return {
        reducerPath: reducerPath2,
        getSelectors,
        get selectors() {
          return getSelectors(selectSlice);
        },
        selectSlice,
      };
    }

    // 返回一个方法汇总工具包
    const slice = {
      name,
      reducer, // reducer的执行方法
      actions: context.actionCreators, // action创建函数的集合对象
      caseReducers: context.sliceCaseReducersByName, // 真实的reducer函数对象
      getInitialState,
      ...makeSelectorProps(reducerPath), // selector相关方法
      injectInto(injectable, { reducerPath: pathOpt, ...config } = {}) {
        const newReducerPath = pathOpt ?? reducerPath;
        injectable.inject(
          {
            reducerPath: newReducerPath,
            reducer,
          },
          config
        );
        return {
          ...slice,
          ...makeSelectorProps(newReducerPath, true),
        };
      },
    };
    return slice;
  };
}

function getType(slice, actionKey) {
  return `${slice}/${actionKey}`;
}

function isAsyncThunkSliceReducerDefinition(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "asyncThunk";
}

function handleNormalReducerDefinition(
  { type, reducerName, createNotation },
  maybeReducerWithPrepare,
  context
) {
  // 入参：
  // 第一个入参是reducer函数的一些信息（type是唯一的reducer函数的标识，reducerName是reducer函数的名字，createNotation是true）
  // 第二个入参是reducer函数
  // 第三个入参是上下文方法合集

  let caseReducer;
  let prepareCallback;

  //
  if ("reducer" in maybeReducerWithPrepare) {
    if (
      createNotation &&
      !isCaseReducerWithPrepareDefinition(maybeReducerWithPrepare)
    ) {
      throw new Error(
        false
          ? 0
          : "Please use the `create.preparedReducer` notation for prepared action creators with the `create` notation."
      );
    }
    caseReducer = maybeReducerWithPrepare.reducer;
    prepareCallback = maybeReducerWithPrepare.prepare;
  } else {
    // 普通的走下面，创建一个中间变量保存reducer函数
    caseReducer = maybeReducerWithPrepare;
  }

  // 执行
  context
    .addCase(type, caseReducer)
    .exposeCaseReducer(reducerName, caseReducer)
    .exposeAction(
      reducerName,
      prepareCallback ? createAction(type, prepareCallback) : createAction(type)
    );
}

function createAction(type, prepareAction) {
  // type是reducer的唯一标识
  // prepareAction是reducer的prepare方法
  function actionCreator(...args) {
    if (prepareAction) {
      let prepared = prepareAction(...args);
      if (!prepared) {
        throw new Error(false ? 0 : "prepareAction did not return an object");
      }
      return {
        type,
        payload: prepared.payload,
        ...("meta" in prepared && {
          meta: prepared.meta,
        }),
        ...("error" in prepared && {
          error: prepared.error,
        }),
      };
    }
    return {
      type,
      payload: args[0],
    };
  }
  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  actionCreator.match = (action) =>
    (0, redux__WEBPACK_IMPORTED_MODULE_0__.isAction)(action) &&
    action.type === type;
  return actionCreator;
}
