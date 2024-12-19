import React from "../react";
import FunctionComponent from "./FunctionComponent";

class ClassComponent extends React.Component {
  constructor(props) {
    // 下面这个super其实相当于this.props = props;
    super(props);
  }
  render() {
    return React.createElement(
      "div",
      { id: "classComponent" },
      "hello classComponent"
    );

    // 下面这个生成的虚拟DOM的孩子hello classComponent，实际上在页面显示不出来
    // 因为当进入到createFunctionComponent函数时，根本没有处理此时的children数组
    // 如果要显示，可以去FunctionComponent修改，把props传入，那个props包含了这里的id属性和这里的children属性数组。
    // 把props.children加入到FunctionComponent后面返回的虚拟dom的孩子数组中，（注意这个时候的虚拟dom是一个原生的Element形式了，可以处理children孩子）
    // return React.createElement(FunctionComponent, { id: "classComponent" }, "hello classComponent");

    // 补充一下jsx这么写
    // return (
    //   <FunctionComponent id="classComponent">
    //     hello classComponent
    //   </FunctionComponent>
    // );
  }
}

export default ClassComponent;
