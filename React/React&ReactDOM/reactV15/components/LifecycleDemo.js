import React from "../react";

// 下面的打印顺序是：
// 1.刷新页面：
// LifecycleDemo- constructor
// LifecycleDemo- componentWillMount
// LifecycleDemo- render
// ChildComponent- componentWillMount
// ChildComponent- render
// ChildComponent- componentDidMount
// LifecycleDemo- componentDidMount
// 2.点击一次按钮：（state变为1）
// LifecycleDemo- shouldComponentUpdate
// 3.点击第二次按钮：（state变为2）
// LifecycleDemo- shouldComponentUpdate
// LifecycleDemo- componentWillUpdate
// LifecycleDemo- render
// ChildComponent- componentWillReceiveProps
// ChildComponent- shouldComponentUpdate
// LifecycleDemo- componentDidUpdate
// 4.点击第三次按钮：（state变为3）
// LifecycleDemo- shouldComponentUpdate
// LifecycleDemo- componentWillUpdate
// LifecycleDemo- render
// ChildComponent- componentWillReceiveProps
// ChildComponent- shouldComponentUpdate
// ChildComponent- componentWillUpdate
// ChildComponent- render
// ChildComponent- componentDidUpdate
// LifecycleDemo- componentDidUpdate
// 5.点击第四次按钮：（state变为4）
// LifecycleDemo- shouldComponentUpdate
// LifecycleDemo- componentWillUpdate
// LifecycleDemo- render
// ChildComponent- componentWillUnmount
// LifecycleDemo- componentDidUpdate
// 6.点击第五次按钮：（state变为5）
// LifecycleDemo- shouldComponentUpdate
// LifecycleDemo- componentWillUpdate
// LifecycleDemo- render
// LifecycleDemo- componentDidUpdate



class ChildComponent extends React.Component {
  constructor(props) {
    super(props)
  }
  // 1.即将挂载
  componentWillMount() {
    console.log('ChildComponent- componentWillMount')
  }

  render() {
    console.log('ChildComponent- render')

    return React.createElement('div', {}, this.props.number)
  }

  // 2.挂载完毕
  componentDidMount() {
    console.log('ChildComponent- componentDidMount')
  }

  // 3.组件即将接受到新的属性
  componentWillReceiveProps(nextProps) {
    console.log('ChildComponent- componentWillReceiveProps')
  }

  // 4.组件是否要更新
  shouldComponentUpdate(nextProps, nextState) {
    console.log('ChildComponent- shouldComponentUpdate')
    // 新的props只要一大于2就可以立即更新
    return nextProps.number > 2;
  }

  // 5.即将更新
  componentWillUpdate() {
    console.log('ChildComponent- componentWillUpdate')
  }

  // 6.更新完毕
  componentDidUpdate() {
    console.log('ChildComponent- componentDidUpdate')
  }

  // 7.即将卸载
  componentWillUnmount() {
    console.log('ChildComponent- componentWillUnmount')
  }
}



class LifecycleDemo extends React.Component {
  // 这是一个默认属性
  static defaultProps = { name: 'zyl' }
  constructor(props) {
    super(props);
    this.state = { number: 0 };
    console.log('LifecycleDemo- constructor');
  }
  // 1.即将挂载
  componentWillMount() {
    console.log('LifecycleDemo- componentWillMount')
  }

  // 组件本体代码
  handleClick() {
    this.setState({ number: this.state.number + 1 });
  }
  render() {
    console.log('LifecycleDemo- render')
    
    const p = React.createElement('p', {}, this.state.number)
    let childCounter = this.state.number > 3 ? null : React.createElement(ChildComponent, { number: this.state.number })
    const button = React.createElement('button', { onClick: () => this.handleClick() }, '+')

    return React.createElement('div', {}, p, childCounter, button)
  }

  // 2.挂载完毕
  componentDidMount() {
    console.log('LifecycleDemo- componentDidMount')
  }

  // 3.组件是否要更新
  shouldComponentUpdate(nextProps, nextState) {
    console.log('LifecycleDemo- shouldComponentUpdate')
    // 新的state只要一大于1就可以立即更新
    return nextState.number > 1;
  }

  // 4.即将更新
  componentWillUpdate() {
    console.log('LifecycleDemo- componentWillUpdate')
  }

  // 5.更新完毕
  componentDidUpdate() {
    console.log('LifecycleDemo- componentDidUpdate')
  }
}

export default LifecycleDemo;

