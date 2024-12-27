import { ELEMENT_TEXT } from "./constants";
import { scheduleRoot } from "./scheduler";
import { UpdateQueue, Update } from "./update";

function createElement(type, config = {}, ...children) {
  delete config._self;
  delete config._source;

  let handledChildren = children.map((child, index) => {
    if (typeof child === "object" || typeof child === "function") {
      return child;
    } else {
      return {
        type: ELEMENT_TEXT,
        props: { text: child, children: [] },
      };
    }
  });

  return {
    type,
    props: {
      ...config,
      children: handledChildren || [],
    },
  };
}

class Component {
  constructor(props) {
    this.props = props;
    this.updateQueue = new UpdateQueue();
  }
  setState(payload) {
    let update = new Update(payload);
    this.updateQueue.enqueueUpdate(update);
    // 源码的updateQueue其实是放在此类组件对应的fiber节点的internalFiber的属性上
    // this.internalFiber.updateQueue.enqueueUpdate(update);

    // V16从根节点开始调用！！！！！！！
    scheduleRoot();
  }
}
// 类组件的识别标识
Component.prototype.isReactComponent = {};

const React = {
  createElement,
  Component,
};

export default React;
