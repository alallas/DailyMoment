import React from "./react";



class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 }
    setInterval(() => {
      this.setState({ number: this.state.number + 1 })
    }, 2000)
  }

  render() {
    return React.createElement('div', { id: 'counter' + this.state.number })
  }
}


export default Counter;

