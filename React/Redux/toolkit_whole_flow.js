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
        context.sliceCaseReducersByType[type] = reducer2;
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
        context.actionCreators[name2] = actionCreator;
        return contextMethods;
      },
      exposeCaseReducer(name2, reducer2) {
        context.sliceCaseReducersByName[name2] = reducer2;
        return contextMethods;
      },
    };

    // 执行每一个reducer（初始化执行）
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
        // 否则就是一个正常的reducer函数
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
    const injectedSelectorCache = /* @__PURE__ */ new Map();
    const injectedStateCache = /* @__PURE__ */ new WeakMap();
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
    const slice = {
      name,
      reducer,
      actions: context.actionCreators,
      caseReducers: context.sliceCaseReducersByName,
      getInitialState,
      ...makeSelectorProps(reducerPath),
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
  let caseReducer;
  let prepareCallback;
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
    caseReducer = maybeReducerWithPrepare;
  }
  context
    .addCase(type, caseReducer)
    .exposeCaseReducer(reducerName, caseReducer)
    .exposeAction(
      reducerName,
      prepareCallback ? createAction(type, prepareCallback) : createAction(type)
    );
}
