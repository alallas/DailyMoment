import { createDOM } from "../react/vdom.js";
import { updateQueue } from "../react/component.js";

function render(element, container) {
  // debugger
  // 要把虚拟dom变成真实的dom
  let dom = createDOM(element);

  // 把真实的dom挂载到容器(也就是最最外层的root)上面
  container.appendChild(dom);
}

function unstable_batchedUpdates(fn) {
  // 强行改为批量更新模式（要进入等待队列）
  updateQueue.isPending = true;
  // 执行外部函数，执行setState
  fn();
  // 恢复默认，强制更新模式
  updateQueue.isPending = false;
  updateQueue.batchUpdate();
}



export {
  unstable_batchedUpdates,
}

export default {
  render,
};
