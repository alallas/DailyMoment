
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
  }

  increment = () => {
    this.setState({
      number: this.state.number++,
    });
  };

  render() {
    let p = React.createElement(
      "p",
      { style: { color: "red" } },
      this.props.name,
      this.state.number
    );
    let button = React.createElement("button", {}, "+");
    return React.createElement("div", { id: "counter" }, p, button);
  }
}

export default Counter;
