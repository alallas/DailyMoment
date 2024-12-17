import React from "./react";

class Todo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textList: [],
      text: '',
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
      text: '',
    });
  };

  onDel = (index) => {
    this.setState({
      textList: [
        ...this.state.textList.slice(0, index),
        ...this.state.textList.slice(index + 1),
      ],
    });
  };

  componentDidMount() {
    // setTimeout(() => {
    //   this.setState({ text: 'new' })
    //   setTimeout(() => {
    //     this.handleClick()
    //   }, 5000)
    // }, 2000)
  }

  render() {
    let lists = this.state.textList.map((item, index) => {
      return React.createElement(
        "div",
        {},
        item,
        React.createElement(
          "button",
          { onClick: () => { this.onDel(index); }, },
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
