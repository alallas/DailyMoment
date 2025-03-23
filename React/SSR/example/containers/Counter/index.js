import React, {Component} from "react";
import { connect } from "react-redux";
import actions from '../../store/actions/counter'

class Counter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
  }
  // 高级一点的写法，写类的属性
  // state = {
  //   number: 0
  // }

  // handleClick() {
  //   this.setState({ number: this.state.number + 1 })
  // }

  // 

  render() {
    return (
      <div>
        <p>{this.props.number}</p>
        {/* <button onClick={() => this.handleClick()}>+1</button> */}
        <button onClick={() => this.props.increment()}>+1</button>
      </div>
    )
  }
}


Counter = connect(
  state => state.counter,
  actions
)(Counter)

export default Counter


