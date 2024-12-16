
import React from "./React.js";
import Test from "./Test.js";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    // diff算法演示
    // this.state = { number: 0 };

    // 节点复用演示
    this.state = { odd: true }

  }

  componentWillMount() {
    console.log("componentWillMount");
  }

  componentDidMount() {
    // console.log("componentDidMount");
    // setInterval(() => {
    //   this.setState({ number: this.state.number + 1 })
    // }, 1000)

    setTimeout(() => {
      this.setState({ odd: !this.state.odd })
    }, 2000)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentDidUpdate() {
    console.log('componentDidUpdate')
  }

  // increment = () => {
  //   this.setState({
  //     number: this.state.number++,
  //   });
  // };

  handleClick = () => {
    this.setState({ number: this.state.number + 1 })
  }



  render() {
    // 返回native版
    // let p = React.createElement(
    //   "p",
    //   {},
    //   this.props.name,
    //   this.state.number
    // );
    // let button = React.createElement("button", { onClick: () => { this.handleClick() } }, "+");
    // return React.createElement("div", { style: { color: this.state.number % 2 === 0 ? 'red' : 'green', backgroundColor: this.state.number % 2 === 0 ? 'green' : 'red' } }, p, button);


    // 返回composite版
    // let p = React.createElement(
    //   "p",
    //   { style: { color: "red" } },
    //   this.props.name,
    //   this.state.number
    // );
    // let button = React.createElement("button", {}, "+");
    // return React.createElement(Test, { id: "counter" }, p, button);


    // 返回文字版（原始值版）：
    // return this.state.number;


    if(this.state.odd) {
      return React.createElement(
        'ul',
        { id: 'oldCounter' },
        React.createElement('li', { key: 'A' }, 'A'),
        React.createElement('li', { key: 'B' }, 'B'),
        React.createElement('li', { key: 'C' }, 'C'),
        React.createElement('li', { key: 'D' }, 'D'),
        )
    } else {
      return React.createElement(
        'ul',
        { id: 'newCounter' },
        React.createElement('span', { key: 'A' }, 'A1'),
        React.createElement('li', { key: 'C' }, 'C1'),
        React.createElement('li', { key: 'B' }, 'B1'),
        React.createElement('li', { key: 'E' }, 'E1'),
        React.createElement('li', { key: 'F' }, 'F1'),
      )
    }
  }
}

export default Counter;


