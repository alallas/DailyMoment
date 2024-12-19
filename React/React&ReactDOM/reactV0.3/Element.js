// 这个其实就是虚拟dom
class Element {
  constructor(type, props) {
    // 两个参数一个是dom的类型一个是dom的属性
    this.type = type;
    this.props = props;
  }



}


function createElement(type, props = {}, ...children) {
  // children也是props的一部分，也是一个属性，先保存起来
  props.children = children || [];
  return new Element(type, props)
}


export {
  Element,
  createElement,
}
