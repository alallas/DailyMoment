
import React from "../react";


// 这个效果是滚轴定在初始位置（最底端），不会跟随着数字的增长而滚动
// 且即使我滑动一下滚动条，也会停在滑动到的那个地方不动，不会跟随着数字的增长而滚动


class ScrollingList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
    // 下面createRef方法会返回一个对象，其中的current属性值是null
    // 然后把这个对象作为ref的属性值给到一个dom
    // 等到这个dom挂载到真实的DOM节点之后，让current = 真实的DOM元素
    this.wrapper = React.createRef(); // { current: null }
  }

  addMessage() {
    this.setState((state) => ({
      messages: [`${state.messages.length}`, ...state.messages],
    }))
  }

  componentDidMount() {
    // 确定挂载完成之后设置一个定时器
    // this.timeID = window.setInterval(() => {
    //   this.addMessage();
    // }, 1000)
  }

  componentWillUnmount() {
    // 卸载的时候清除定时器
    window.clearInterval(this.timeID);
  }

  getSnapshotBeforeUpdate() {
    // 更新前先取一下上一次的整个元素的总高度
    // 传递到componentDidUpdate
    return this.wrapper.current.scrollHeight;
  }

  componentDidUpdate(prevProps, prevState, prevScrollHeight) {
    // 当前向上滚动过的高度
    const curScrollTop = this.wrapper.current.scrollTop;

    // 当前向上滚动过的高度加上增加的内容高度，使得滚轮保持在原地不动
    // 增加的内容怎么计算？？通过【新的整个元素的总高度】减去【旧的整个元素的总高度】来实现
    this.wrapper.current.scrollTop = curScrollTop + (this.wrapper.current.scrollHeight - prevScrollHeight)
  }

  render() {
    let style = {
      height: '100px',
      width: '200px',
      border: '1px solid red',
      overflow: 'auto',
    }

    let list = [];
    for (let i = 0; i < this.state.messages.length; i++) {
      list.push(React.createElement('div', { key: i }, this.state.messages[i]))
    }
    return React.createElement('div', { style, ref: this.wrapper }, ...list)

    
    // return (
    //   <div style={style} ref={this.wrapper}>
    //     {
    //       this.state.messages.map((message, index) => (
    //         <div key={index}>{message}</div>
    //       ))
    //     }
    //   </div>
    // )
  }
}


export default ScrollingList;


