
class Component {
  constructor(props) {
    this.props = props;
  }

  setState(partialState) {
    // 组件更新的时候，自己不更新而是把这个任务交给对应的类型的unit来处理
    // 第一个参数是新的元素，第二个参数是新的状态
    this._currentUnit.update(null, partialState)
  }
}


export {
  Component,
}