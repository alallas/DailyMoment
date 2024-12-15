
import React from "./React.js";
import Test from "./Test.js";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }

  componentWillMount() {
    console.log("componentWillMount");
  }

  componentDidMount() {
    // console.log("componentDidMount");
    // setInterval(() => {
    //   this.setState({ number: this.state.number + 1 })
    // }, 1000)
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
    this.setState({ number: ++this.state.number })
  }



  render() {
    let p = React.createElement(
      "p",
      {},
      this.props.name,
      this.state.number
    );
    let button = React.createElement("button", { onClick: () => { this.handleClick() } }, "+");
    return React.createElement("div", { style: { color: this.state.number % 2 === 0 ? 'red' : 'green', backgroundColor: this.state.number % 2 === 0 ? 'green' : 'red' } }, p, button);


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
  }



}

export default Counter;


