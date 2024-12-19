import { isFunction } from './utils.js';
import { compareTwoElements } from './vdom.js'


export const updateQueue = {
  // 这里面放着将要执行的更新器对象，更新器对象记录当前状态
  updaters: [],

  // 表示是否批量更新
  // 为true表示批量更新，说明要等，要把一个个带有组件信息、state状态信息的更新器放到队列里面等待
  // 为false表示组件强制更新
  isPending: false,

  // 先把更新器放进来,不进行更新
  add(updater) {
    this.updaters.push(updater);
  },

  // 强行全部更新，
  batchUpdate() {
    let { updaters } = this;
    // !修改为批量更新模式？？？？？为什么？有必要吗？
    this.isPending = true;

    // 这个写法好源码！！
    // 更新所有的组件（注意是所有的组件，可能不止一个组件，因为一个事件函数修改的有可能是别的组件的状态）
    let updater;
    while (updater = updaters.pop()) {
      updater.updateComponent();
    }

    // !修改为强制更新模式？？？？？为什么？有必要吗？
    this.isPending = false;
  }
}


class Updater {
  constructor(componentInstance) {
    // 一个updater和一个类组件实例是一对一的关系
    this.componentInstance = componentInstance;
    // 先把分状态暂存到这个数组里面，到时候批量更新
    this.pendingState = [];
    // 新的属性对象
    this.nextProps = null;
  }
  addState(partialState) {
    // 先保存一下新的部分的状态到数组
    this.pendingState.push(partialState);
    // 开始试图更新
    this.emitUpdate();
  }

  // 判断能不能更新
  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    // 如果传递了【新的属性对象】或者【当前是非批量更新模式】的话，就直接更新
    if (nextProps || !updateQueue.isPending) {
      this.updateComponent();
    } else {
      // 否则的话就不能更新，把这个更新器放到队列里面
      updateQueue.add(this);
    }
  }

  // 强制更新（单独的方法）
  // 把组件实例的state和props直接覆盖了
  // 但是实际上这里只是在判断是否真的需要更新，真正的更新逻辑不在这里（需要render），在母亲组件Component上面的forceUpdate方法上
  updateComponent() {
    let { componentInstance, pendingState, nextProps } = this;

    // 先判断一下当前的pendingState数组是否有新的state，有就更新
    // 注意新的state是通过getState方法来合并的！
    // !这里相当于拦截了一下，用【用户自定义是否要更新】来拦截
    if (nextProps || pendingState.length > 0) {
      shouldUpdate(componentInstance, nextProps, this.getState());
    }
  }

  getState() {
    let { componentInstance, pendingState } = this;
    let { state } = componentInstance;

    // !用新的state直接原地覆盖老的state
    if (pendingState.length > 0) {
      pendingState.forEach((nextState, index) => {
        if (isFunction(nextState)) {
          // 如果是一个函数的话就执行，注意在以前定义这个函数的上下文去执行（componentInstance）
          // 传入的参数是老的state，得到的最新的state直接覆盖当前实例的最新的state

          // !等等这里在这个时候才执行这个函数，说明这个时候的state是最新的，用函数式的写法可以获得最新的state
          // **如果是对象-函数-对象-函数写法：打印0 0 3 4
          // 同步部分：
          // 首先对象写法，老state还是0，新state是1。
          // 然后函数写法，老state还是0，新state不知道，函数还没执行。

          // 强制更新部分：
          // 首先对象写法，把当前state变成了1，
          // 然后函数写法，来到这里才执行，在当前state的基础上加1（这个时候的当前state是1）变成了2，同时改变当前state为2

          // 异步部分：
          // 首先对象写法，新state是在当前的state基础上加1，变为3，且直接原地覆盖当前state为3
          // 然后函数写法：执行，在当前state的基础上加1（这个时候的当前state是3）变成了4，同时改变当前state为4

          // **如果是全函数写法：打印0 0 3 4
          // 同步部分：
          // 老state还是0，新state不知道

          // 强制更新部分：
          // 执行第一个函数，在当前state的基础上加1（这个时候的当前state是0）变为1，且当前state变为1，
          // 执行第二个函数，在当前state的基础上加1（这个时候的当前state是1）变为2，且当前state变为2，

          // 异步部分：
          // 执行异步内第一个函数，在当前state的基础上加1（这个时候的当前state是2）变为3，且当前state变为3，
          // 执行异步内第一个函数，在当前state的基础上加1（这个时候的当前state是3）变为4，且当前state变为4，
          state = nextState.call(componentInstance, state)
        } else {
          state = { ...state, ...nextState }
        }
      })
    }

    // 用完（原地改变state）之后把pendingState清理掉
    pendingState.length = 0;
    return state;
  }
}

// 判断一下是不是要更新？？？
function shouldUpdate(componentInstance, nextProps, nextState) {
  // 不管要不要更新，首先覆盖一下实例的props和state属性
  componentInstance.state = nextState;
  componentInstance.props = nextProps;

  // 先看用户的自定义，如果用户自己定义了不能更新，那就不要更新
  if (componentInstance.shouldComponentUpdate && !componentInstance.shouldComponentUpdate(nextProps, nextState)) {
    return false
  }

  componentInstance.forceUpdate();

}






class Component {
  constructor(props) {
    this.props = props;
    this.$updater = new Updater(this); // this就是类组件的实例
    this.state = {}; // 当前状态
    this.nextProps = null; // 下一个属性对象
  }

  // 实现批量更新
  // 入参叫做partialState，说明是【部分的】state，因为状态有可能会被合并
  setState(partialState) {
    this.$updater.addState(partialState);
  }


  // 最最真实的更新逻辑在这里
  forceUpdate() {
    // 之前往实例上面挂过renderElement的属性，是指的上一次（或者当前）render出来的结果（也就是当前显示在页面上面的结果）
    let { props, state, renderElement: oldRenderElement } = this;

    // 在更新逻辑里面，先执行一下【更新相关】的生命周期函数:准备开始更新了，也即是准备重新执行render方法了
    if (this.componentWillUpdate) {
      this.componentWillUpdate();
    }

    // 重新执行render方法，然后拿到最新的render出来的native形式的虚拟DOM
    // 新的和旧的对比，得到一个最新的虚拟DOM，然后覆盖当前的renderElement，为下一次更新做准备
    let newRenderElement = this.render();
    let currentElement = compareTwoElements(oldRenderElement, newRenderElement);
    this.renderElement = currentElement;

    // 在更新逻辑里面，执行一下【更新相关】的生命周期函数:更新完了，也即是render方法执行完了
    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }
  }
}


// 类组件和函数组件编译之后都是函数，通过这个属性来区分到底是函数组件还是类组件
// 因为这个是类组件才会继承的，所以原型上有这个isReactComponent属性就说明他是一个类组件
Component.prototype.isReactComponent = {};




export default Component;


