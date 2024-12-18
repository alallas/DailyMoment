// import React from "./react/index.js";
import React from "react";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }


  // 在这里，tick的event的属性值全部是null，event只能使用一次(不支持传递)
  // 为什么event只能使用一次(不支持传递)？？？？
  // 因为是生成了原生event之后，然后执行listener函数，【（注意这个函数是异步的setInterval）】，可以理解为在另一个线程等待继续执行中，好这个时候发现冒泡完毕了，原生event销毁了，跳出循环，把合成事件对象的所有属性都变为null了
  // 这个时候的listener函数只执行到打印一次event那里！！！后面的事件对象都变为null了
  // tick(event) {
  //   setInterval(() => {
  //     console.log(event);
  //   }, 1000)
  // }
  // handleClick(event) {
  //   console.log(event);
  //   this.tick(event)
  // }

  // 下面这个也是只有第一个event的属性有值，而第二个往后的event的属性值都是null
  // handleClick(event) {
  //   console.log(event);
  //   setInterval(() => {
  //     console.log(event);
  //   }, 1000)
  // }


  // 下面的三个event的属性值都存在，都是有效的，同步执行就可以！！！！！
  // handleClick(event) {
  //   console.log(event);
  //   this.tick(event);
  // }
  // tick(event) {
  //   console.log(event)
  //   console.log(event)
  // }

  // 下面的两个event的属性值都存在，都是有效的，同步执行就可以！！！！！
  // handleClick(event) {
  //   console.log(event)
  //   console.log(event)
  // }


  // 如果不想异步执行的函数拿不到event，有两个方法
  // 方法一：一个是把想要的event里面的属性值首先存到一个新的内存空间，存到一个新变量里面。（const need = event.dispatchConfig）
  // 至于event本身的话，直接const newEvent = event;是不行的这样还是指向同一个内存空间，可以进行深拷贝
  // 方法二：使用event.persist()方法，原因看event.js，核心就是：【借助persist函数在中途改掉顶层GO的obj的内存地址，使得后面的属性值清除影响不到旧的内存地址】

  handleClick(event) {
    console.log(event);
    // const need = event.dispatchConfig
    event.persist();
    setInterval(() => {
      console.log(event);
    }, 1000)
  }



  render() {
    // 实际上，下面的写法等于返回React.createElement(xxxxx)

    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={(e) => { this.handleClick(e) }}>+</button>
      </div>
    );

    
    // let p = React.createElement('p', {}, this.state.number)
    // let button = React.createElement('button', { onClick: () => this.handleClick() }, '+')
    // return React.createElement('div', {}, p, button)

  }
}

export default Counter;
