import React, { Component } from "react";
import session from "../../store/actions/session";
import { connect } from "react-redux";

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {username: ''}
  }

  handleLoin = (event) => {
    event.preventDefault()
    this.props.userLogin({username: this.state.username})
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-6 col-md-offset-6">
            <form onSubmit={this.handleLoin}>
              <div className="form-group">
                <label htmlFor="username">name</label>
                <input type="text" className="form-control" value={this.state.username}  onChange={event => this.setState({username: event.target.value})}/>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary">login</button>
              </div>
            </form>
          </div>
        </div>
      </>
    )
  }
}

Login = connect(state => state.session, session)(Login)


export default Login



