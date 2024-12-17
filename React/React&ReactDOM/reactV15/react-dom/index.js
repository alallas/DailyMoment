import { createDOM } from '../react/vdom.js';


function render(element, container) {
  // debugger
  // 要把虚拟dom变成真实的dom
  let dom = createDOM(element);

  // 把真实的dom挂载到容器(也就是最最外层的root)上面
  container.appendChild(dom);
}



export default {
  render
}






