import React from "./React";

class Todo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textList: [],
      text: "",
    };
  }

  onChange = (event) => {
    this.setState({
      text: event.target.value,
    });
  };

  handleClick = () => {
    let text = this.state.text;
    this.setState({
      textList: [...this.state.textList, text],
    });
  };

  onDel = (index) => {
    this.setState({
      list: [
        ...this.state.textList.slice(0, index),
        ...this.state.textList.slice(index + 1),
      ],
    });
  };

  render() {
    let lists = this.state.textList.map((item, index) => {
      return React.createElement(
        "div",
        {},
        item,
        React.createElement(
          "button",
          {
            onClick: () => {
              this.onDel(index);
            },
          },
          "X"
        )
      );
    });

    let input = React.createElement("input", {
      onKeyup: this.onChange,
      value: this.state.text,
    });

    let button = React.createElement(
      "button",
      { onClick: this.handleClick },
      "+"
    );

    return React.createElement("div", {}, input, button, ...lists);
  }
}

export default Todo;
