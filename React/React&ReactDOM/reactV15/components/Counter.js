import React from "../react";
import { unstable_batchedUpdates } from "../react-dom/index.js";

function FunctionCounter(props) {
  const p = React.createElement('p', {}, props.number)
  const button = React.createElement('button', { onClick: props.changeNumber }, '+')
  return React.createElement('div', { id: 'counter' + props.number }, p, button)
}


class ClassCounter2 extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }
  render() {
    const p = React.createElement('p', {}, this.props.number)
    const button = React.createElement('button', { onClick: this.props.changeNumber }, '+')
    return React.createElement('div', { id: 'counter' + this.props.number }, p, button)
  }
}


class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0, name: 'zyl' }
  }

  // 下面同步函数部分两次打印都是同一个数字，为什么？
  // 因为react进行事件处理函数执行的时候，会进入批量更新模式
  // 在执行这个函数的时候，引起多次state的变化，但处于批量更新的模式，不会立即更新state
  // 等到【事件函数执行完成之后】，全部更新这个脏组件（注意：这个是更新时机！！）

  
  // !注意：为什么说函数式的更新state是最新的，因为函数的执行时机是在强制更新模式下才执行这个时候的state永远被覆盖成最新的
  // !可以看updater的getState方法的实现
  // 如果是全对象写法：打印0 0 2 3
  // 如果是对象-函数-对象-函数写法：打印0 0 3 4
  // 如果是全函数写法：打印0 0 3 4

  // !REVIEW - 所以！react里面如果事件函数是同步的话，那么一般把setState放到最后面写，因为这个时候写，下面很快就更新了！核心就是：【把state的值算好了再setState】

  handleClick() {
    this.setState({ number: this.state.number + 1 })
    console.log(this.state.number)
    this.setState({ number: this.state.number + 1 })
    console.log(this.state.number)
    // this.setState(state => ({ number: state.number + 1 }))
    // console.log(this.state.number)
    // this.setState(state => ({ number: state.number + 1 }))
    // console.log(this.state.number)


    // 这个时候如果开始有异步的函数，那么event那边的代码会先走，然后改变isPending为false，
    // 这个时候再次回到异步函数体里面的setState的时候就会一直处于强制更新模式了
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 })
      console.log(this.state.number)
      this.setState({ number: this.state.number + 1 })
      console.log(this.state.number)
      // this.setState(state => ({ number: state.number + 1 }))
      // console.log(this.state.number)
      // this.setState(state => ({ number: state.number + 1 }))
      // console.log(this.state.number)
    }, 2000)
  }


  changeNumber() {
    this.setState((state) => ({ number: state.number + 1 }));

    // ! 这里有一个问题，如何干掉状态里面的老属性？？？？
    // 比如：通过setState的方式把name这个属性给干掉
    // 可以这么写：把新的state对象放到一个数组里面！！！
    // 好吧┗( T﹏T )┛被证明是不行的！！！还是干不掉，还是会合并所有属性
    // this.setState(state => [{ number: state.number + 1 }])
    // setTimeout(() => {
    //   console.log(this.state)
    // }, 2000)
  }


  componentDidMount() {
    this.setState({ number: this.state.number + 1 })
    console.log(this.state.number)
    this.setState({ number: this.state.number + 1 })
    console.log(this.state.number)
  }


  render() {
    // return React.createElement('div', { id: 'counter' + this.state.number, onClick: () => this.handleClick() }, '+')


    const p = React.createElement('p', {}, this.state.name, this.state.number)
    const button = React.createElement('button', { onClick: () => this.changeNumber() }, '+')
    return React.createElement('div', { id: 'counter' + this.state.number }, p, button)


    // return React.createElement(
    //   ClassCounter2,
    //   { number: this.state.number, changeNumber: this.changeNumber.bind(this) }
    // )

  }
}


export default Counter;

