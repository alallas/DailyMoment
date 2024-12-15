
import React from "./React.js";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }

  componentWillMount() {
    console.log("componentWillMount");
  }

  componentDidMount() {
    console.log("componentDidMount");
    setInterval(() => {
      this.setState({ number: this.state.number + 1 })
    }, 1000)
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

  render() {
    // let p = React.createElement(
    //   "p",
    //   { style: { color: "red" } },
    //   this.props.name,
    //   this.state.number
    // );
    // let button = React.createElement("button", {}, "+");
    // return React.createElement("div", { id: "counter" }, p, button);


    // 先简单写一下：
    return this.state.number;
  }



}

export default Counter;


