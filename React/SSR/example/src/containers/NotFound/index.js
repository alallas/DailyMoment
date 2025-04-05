import React, { Component } from "react";
import { connect } from "react-redux";
import session from "../../store/actions/session";

class NotFound extends Component {

  componentDidMount() {
    if (this.props.staticContext) {
      this.props.staticContext.notFound = true
    }
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-6 col-md-offset-6">
            页面不存在
          </div>
        </div>
      </>
    )
  }
}


export default NotFound



