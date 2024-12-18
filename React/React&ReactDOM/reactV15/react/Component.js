
export const updateQueue = {
  // 这里面放着将要执行的更新器对象，更新器对象记录当前状态
  updaters: [],

  // 表示是否批量更新
  // 为true表示批量更新，说明要等，要把一个个带有组件信息、state状态信息的更新器放到队列里面等待
  // 为false表示组件强制更新
  isPending: false,

  // 先把更新器放进来
  add(updaters) {
    this.updaters.push();
  },

  // 强行全部更新，
  batchUpdate() {
    let { updaters } = this;
    let updater;
    while (updater = updaters.pop()) {
      updater.updateComponent();
    }
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

  updateComponent() {

  }
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
}


// 类组件和函数组件编译之后都是函数，通过这个属性来区分到底是函数组件还是类组件
// 因为这个是类组件才会继承的，所以原型上有这个isReactComponent属性就说明他是一个类组件
Component.prototype.isReactComponent = {};




export default Component;


