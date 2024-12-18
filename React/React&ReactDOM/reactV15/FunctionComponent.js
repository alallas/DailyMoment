import React from "./react";

function FunctionComponent(props) {
  return React.createElement('div', { id: 'functionComponent' }, 'hello functionComponent')


  // 如果类组件导出的虚拟DOM的type是我这个FunctionComponent函数
  // 想要显示那边的children，需要在我这边自己【手动写入】props的属性
  // return React.createElement('div', { id: props.id + 'functionComponent' }, 'hello functionComponent', props.children)

  // 补充一下jsx这么写
  // return (
  //   <div id={props.id + 'functionComponent'}>
  //     hello functionComponent
  //     {props.children}
  //   </div>
  // )
}

export default FunctionComponent