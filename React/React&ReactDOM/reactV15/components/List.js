import React from "../react";

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: true };
  }

  handleClick() {
    this.setState({ show: !this.state.show });
  }

  render() {
    if (this.state.show) {
      return React.createElement(
        "ul",
        { id: "oldCounter", onClick: () => this.handleClick() },
        React.createElement("li", { key: "A" }, "A"),
        React.createElement("li", { key: "B" }, "B"),
        React.createElement("li", { key: "C" }, "C"),
        React.createElement("li", { key: "D" }, "D")
      );
    } else {
      return React.createElement(
        "ul",
        { id: "newCounter", onClick: () => this.handleClick() },
        React.createElement("li", { key: "A" }, "A1"),
        React.createElement("li", { key: "C" }, "C1"),
        React.createElement("li", { key: "B" }, "B1"),
        React.createElement("li", { key: "E" }, "E1"),
        React.createElement("li", { key: "F" }, "F1")
      );
    }
  }
}

export default List;
