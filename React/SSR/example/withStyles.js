import React, { Component } from "react";


export default function withStyles(OriginComponent, styles) {
  class proxyComponent extends Component {
    constructor(props) {
      super(props)
      if (props.staticContext) {
        props.staticContext.csses.push(styles._getCss())
      }
    }
    render() {
      return (
        <OriginComponent {...this.props} />
      )
    }
  }
  return proxyComponent
}


