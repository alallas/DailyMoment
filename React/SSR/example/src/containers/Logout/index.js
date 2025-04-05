import React, { Component } from "react";
import { connect } from "react-redux";
import session from "../../store/actions/session";

class Logout extends Component {

  handleOnClick = () => {
    this.props.userLogout()
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-6 col-md-offset-6">
            <button type="submit" className="btn btn-primary" onClick={this.handleOnClick}>Logout</button>
          </div>
        </div>
      </>
    )
  }
}



Logout = connect(state => state.session, session)(Logout)

export default Logout



