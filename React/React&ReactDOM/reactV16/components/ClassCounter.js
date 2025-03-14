
// import React from "../react";
import React from "react";

let ThemeContext = React.createContext(null);


class ClassCounterSub extends React.Component {
  static contextType = ThemeContext
  constructor(props) {
    super(props);
    this.state = { number: 0 }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('getDerivedStateFromProps run')
    if (nextProps.passValue !== prevState.number) {
      console.log('getDerivedStateFromProps--not equal')
      return { number: nextProps.passValue };
    }
    return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate run')
    return nextProps.passValue !== nextState.number
  }


  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('getSnapshotBeforeUpdate-prevProps-', prevProps)
    console.log('getSnapshotBeforeUpdate-prevState-', prevState)
    let sum = prevProps + prevState
    return sum
  }

  componentDidMount() {
    console.log('componentDidMount run--start to fetch data')
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate run -- snapshot', snapshot)
    console.log('componentDidUpdate run--prevProps', prevProps)
    console.log('componentDidUpdate run--prevState', prevState)
  }

  componentWillUnmount() {
    console.log('componentWillUnmount run')
  }

  render() {

    let fn = (value) => React.createElement(
      'div', 
      {}, 
      'getDerivedStateFromProps--testNumber-' + this.state.number,
      React.createElement('div', { id: 'sub-bottom' }, 'context-sub--value.number-' + value.number + '--this.context.number-' + this.context.number)
    )
    return React.createElement(ThemeContext.Consumer, {}, fn)

  }
}



class ClassCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0, commons: 2 };
  }

  handleClick() {
    this.setState((state) => ({ number: state.number + 1 }));
    this.setState({ number: this.state.number + 0.2 });
    this.setState({ number: this.state.number + 0.3 });
    this.setState({ commons: this.state.commons + 2 })
    this.setState({ commons: this.state.commons + 2 })
  }


  render() {
    let contextVal = { handleClick: this.handleClick, number: this.state.number }

    let span = React.createElement("span", {}, this.state.number, '--commons--', this.state.commons);
    let button = React.createElement(
      "button",
      { onClick: () => this.handleClick() },
      "+1"
    );
    let div = React.createElement("div", { id: "counter" }, 'class-count--', span, button);
    let div2 = React.createElement(ClassCounterSub, { passValue: this.state.commons })

    return React.createElement(ThemeContext.Provider, { value: contextVal }, div, div2);
  }
}

export default ClassCounter;
