import React from "../react";


class ChildComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0, name: 'child' };
  }

  
  // 这个新的生命周期函数替代以前的componentWillReceiveProps（在shouldUpdateComponent之前执行，这个时候拿到到的state和props都是最新最新的了）
  // 从新的属性对象中派生state状态（就是用新的props，来修改子组件的state，然后和老的state进行合并，再进去更新，这个时候再执行getState方法也是基于已经原地覆盖过的state进行合并修改！！）

  // !注意！！这个生命周期在初始create的时候和update的时候都触发了
  // 也就是这两个时刻，子组件已经接受到了来自父组件传递过来的props
  static getDerivedStateFromProps(nextProps, prevState) {
    const { number } = nextProps;
    // 当传入的props发生变化的时候，更新state
    if(number % 2 === 0) {
      console.log('偶数')
      return { number: number * 2 }
    } else {
      console.log('奇数')
      return { number: number * 3 }
    }
    // 否则，对于state不进行任何操作
    // return null
  }

  render() {
    return React.createElement('div', {}, this.state.name, this.state.number)
  }

}



class NewLifecycleDemo extends React.Component {
  static defaultProps = {
    name: 'zyl'
  }
  constructor(props) {
    super(props);
    this.state = { number: 2 };
  }

  // 组件本体代码
  handleClick() {
    this.setState({ number: this.state.number + 1 });
  }
  render() {
    const p = React.createElement('p', {}, this.state.number)
    let childCounter = React.createElement(ChildComponent, { number: this.state.number })
    const button = React.createElement('button', { onClick: () => this.handleClick() }, '+')

    return React.createElement('div', {}, p, childCounter, button)
  }
}


export default NewLifecycleDemo;


