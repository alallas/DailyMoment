import React from "../react";

class ClassCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }

  handleClick() {
    this.setState((state) => ({ number: state.number + 1 }));
  }

  render() {
    let span = React.createElement("span", {}, this.state.number);
    let button = React.createElement(
      "button",
      { onClick: () => this.handleClick() },
      "+1"
    );
    let div = React.createElement("div", { id: "counter" }, span, button);
    return div;
  }
}

export default ClassCounter;
