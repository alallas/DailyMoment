import React from "react"
import { connect } from "react-redux"
import actions from "../store/actions/counter"

class Counter extends React.Component {

  handleImageClick = () => {
    this.props.fetchImageData()
  }

  render() {
    return (
      <div>
        <p>{this.props.number}</p>
        <button onClick={() => this.props.addNumber()}>+1</button>
        <br/><img src={this.props.image} /><br/>
        <button onClick={this.handleImageClick}>+1</button>
      </div>
    )
  }
}

Counter = connect(
  state => state.counter,
  actions
)(Counter)

export default Counter



// 一种写法：dispatch那边是自己写的包装好的dispatch函数

// const mapStateToProps = (state) => ({
//   counter: state.counter.counter,
//   banners: state.home.banners,
//   recommends: state.home.recommends,
// })

// const mapDispatchToProps = (dispatch) => ({
//   addNumber:(num) => dispatch(addNumberAction(num)),
//   subNumber:(num) => dispatch(subNumberAction(num)),
// })

// export default connect(mapStateToProps,mapDispatchToProps)(About)
// const { counter, addNumber, subNumber, banners } =this.props;



// 另一种写法：dispatch那边是整个action对象，到时内部函数用dispatch包装每个函数
// {
//   addNumber: () => action对象,
//   fetchImageData: () => action对象,
// }

// Counter = connect(
//   state => state.counter,
//   actions
// )(Counter)



