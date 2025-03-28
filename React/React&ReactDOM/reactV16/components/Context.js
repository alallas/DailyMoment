import React, { Component } from "../react";

let ThemeContext = React.createContext(null);



// STUB - 下面是class类型的
// 相当于Consumer的children不能写函数了，替换成写一个类的静态属性，指向context对象
// 同时拿数据从this.context里面拿取


class ClassHeader extends Component {
  static contextType = ThemeContext
  render() {
    let com = React.createElement(ClassTitle)
    return React.createElement('div', { style: { border: `5px solid ${this.context.color}`, padding: '5px' } }, 'header', com)
  }
}

class ClassTitle extends Component {
  static contextType = ThemeContext
  render() {
    return React.createElement('div', { style: { border: `5px solid ${this.context.color}` } }, 'title')
  }
}

class ClassMain extends Component {
  static contextType = ThemeContext
  render() {
    let com = React.createElement(ClassContent)
    return React.createElement('div', { style: { border: `5px solid ${this.context.color}`, margin: '5px', padding: '5px' } }, 'main', com)
  }
}

class ClassContent extends Component {
  static contextType = ThemeContext
  render() {
    return React.createElement(
      'div',
      { style: { border: `5px solid ${this.context.color}`, padding: '5px' } },
      'Content',
      React.createElement('button', { onClick: () => this.context.changeColor('red'), style: { color: 'red' } }, 'red'),
      React.createElement('button', { onClick: () => this.context.changeColor('green'), style: { color: 'green' } }, 'green')
    )
  }
}


class ClassPage extends Component {
  constructor(props) {
    super(props);
    this.state = { color: 'red' };
  }

  changeColor = (color) => {
    this.setState({ color })
  }
  render() {
    let contextVal = { changeColor: this.changeColor, color: this.state.color }

    let style = {
      margin: '10px',
      border: `5px solid ${this.state.color}`,
      padding: '5px',
      width: '200px',
    }
    let com1 = React.createElement(ClassHeader)
    let com2 = React.createElement(ClassMain)

    let div = React.createElement('div', { style, }, 'page', com1, com2)
    return React.createElement(ThemeContext.Provider, { value: contextVal }, div)
  }
}





// STUB - 下面是function类型的


class FunctionHeader extends Component {
  render() {
    // return (
    //   <ThemeContext.Consumer>
    //     {
    //       (value) => (
    //         <div style={{ border: `5px solid ${value.color}`, padding: '5px' }}>
    //           header
    //           <FunctionTitle />
    //         </div>
    //       )
    //     }
    //   </ThemeContext.Consumer>
    // )

    let com = React.createElement(FunctionTitle)
    let fn = (value) => React.createElement('div', { style: { border: `5px solid ${value.color}`, padding: '5px' } }, 'header', com)
    return React.createElement(ThemeContext.Consumer, {}, fn)
  }
}

class FunctionTitle extends Component {
  render() {
    // return (
    //   <ThemeContext.Consumer>
    //     {
    //       (value) => (
    //         <div style={{ border: `5px solid ${value.color}` }}>
    //           title
    //         </div>
    //       )
    //     }
    //   </ThemeContext.Consumer>
    // )

    let fn = (value) => React.createElement('div', { style: { border: `5px solid ${value.color}` } }, 'title')
    return React.createElement(ThemeContext.Consumer, {}, fn)
  }
}

class FunctionMain extends Component {
  render() {
    // return (
    //   <ThemeContext.Consumer>
    //     {
    //       (value) => (
    //         <div style={{ border: `5px solid ${value.color}`, margin: '5px', padding: '5px' }}>
    //           main
    //           <FunctionContent/>
    //         </div>
    //       )
    //     }
    //   </ThemeContext.Consumer>
    // )

    let com = React.createElement(FunctionContent)
    let fn = (value) => React.createElement('div', { style: { border: `5px solid ${value.color}`, margin: '5px', padding: '5px' } }, 'main', com)
    return React.createElement(ThemeContext.Consumer, {}, fn)
  }
}

class FunctionContent extends Component {
  render() {
    // return (
    //   <ThemeContext.Consumer>
    //     {
    //       (value) => (
    //         <div style={{ border: `5px solid ${value.color}`, padding: '5px' }}>
    //           Content
    //           <button onClick={() => value.changeColor('red')} style={{color: 'red'}}>red</button>
    //           <button onClick={() => value.changeColor('green')} style={{color: 'green'}}>green</button>
    //         </div>
    //       )
    //     }
    //   </ThemeContext.Consumer>
    // )


    let fn = (value) => React.createElement(
      'div',
      { style: { border: `5px solid ${value.color}`, padding: '5px' } },
      'Content',
      React.createElement('button', { onClick: () => value.changeColor('red'), style: { color: 'red' } }, 'red'),
      React.createElement('button', { onClick: () => value.changeColor('green'), style: { color: 'green' } }, 'green')
    )
    return React.createElement(ThemeContext.Consumer, {}, fn)
  }
}



class FunctionPage extends Component {
  constructor(props) {
    super(props);
    this.state = { color: 'red' };
  }

  changeColor = (color) => {
    this.setState({ color })
  }
  render() {
    let contextVal = { changeColor: this.changeColor, color: this.state.color }

    let style = {
      margin: '10px',
      border: `5px solid ${this.state.color}`,
      padding: '5px',
      width: '200px',
    }

    // return (
    //   <ThemeContext.Provider value={contextVal}>
    //     <div style={style}>
    //       <FunctionHeader />
    //       <FunctionMain />
    //     </div>
    //   </ThemeContext.Provider>
    // )

    let com1 = React.createElement(FunctionHeader)
    let com2 = React.createElement(FunctionMain)

    let div = React.createElement('div', { style, }, 'page', com1, com2)
    return React.createElement(ThemeContext.Provider, { value: contextVal }, div)
  }
}


export {
  FunctionPage,
  ClassPage,
};




