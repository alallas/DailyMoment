import { TAG_ROOT } from "./constants";
import { scheduleRoot } from "./scheduler";

function render(element, container) {
  let rootFiber = {
    // 每个fiber都会有一个tag标识，标识这个元素的类型，有点像v15里面的$$typeof
    tag: TAG_ROOT,
    // 如果这是一个原生的节点，stateNode指向真实的dom元素
    stateNode: container,
    // element是一个虚拟DOM
    props: {
      children: [element],
    },
  };

  scheduleRoot(rootFiber);
}

const ReactDOM = {
  render,
};

export default ReactDOM;
