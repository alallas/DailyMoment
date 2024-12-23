import { addEvent } from './event.js'

function onlyOne(obj) {
  return Array.isArray(obj) ? obj[0] : obj
}


// 给原生的dom设置属性（更新dom的属性）
// 这个遍历对象！！！
function setProps(dom, props) {
  for (let key in props) {
    if(key !== 'children') {
      let value = props[key];
      setProp(dom, key, value);
    }
  }
}
// 这里处理属性！！！
function setProp(dom, key, value) {
  
  if (/^on/.test(key)) {
    // 这是原生事件的绑定法
    // dom[key.toLowerCase()] = value;

    // 但是react自己实现了【合成事件】的机制！
    addEvent(dom, key, value);
    
  } else if (key === 'style') {
    for (let styleName in value) {
      dom.style[styleName] = value[styleName];
    }
  } else if (key === 'className') {
    dom.className = value;
  } else if (key === 'value') {
    dom.value = value;
  } else {
    dom.setAttribute(key, value);
  }
}



// 展开一个多维数组，不用原来的array的flat的方法，避免深度克隆
function flatten(array) {
  let flatten = [];
  (function flat(array) {
    array.forEach(item => {
      if (Array.isArray(item)) {
        flat(item);
      } else {
        flatten.push(item)
      }
    })
  }(array));
  return flatten;
}
// 我自己写的，好像更加复杂了！！从下往上收集的话
// function flatten(array) {
//   if (!Array.isArray(array)) return array;
//   let layerArray = [];
//   array.forEach((item, index) => {
//       if (Array.isArray(item)) {
//           const innerArray = flatten(item);
//           layerArray.push(...innerArray);
//       } else {
//           layerArray.push(item);
//       }
//   })
//   return layerArray;
// }




// 判断是不是一个函数
function isFunction(obj) {
  return typeof obj === 'function'
}




// 打属性的补丁
// 老有新没有-删除
// 新有老没有-添加
// 新有老有-修改
function patchProps(dom, oldProps, newProps) {
  // 先把新的没有的全部删除
  for (let key in oldProps) {
    if (key !== 'children') {
      if (!newProps.hasOwnProperty(key)) {
        dom.removeAttribute(key);
      }
    }
  }

  // 剩下遍历新的属性对象，修改dom的属性为新的属性
  // 其中的事件应该取消老的事件绑定，然后对dom重新绑定一个新的事件，（因为不删除老的，dom会同时绑定两个新老事件）
  // 但在事件合成那边的处理，每个dom的新事件都会覆盖原来的eventStore里面的事件，所以这里其实不需要加这个操作
  for (let key in newProps) {
    if (key !== 'children') {
      setProp(dom, key, newProps[key])
    }
  }
}





export {
  onlyOne,
  setProps,
  flatten,
  isFunction,
  patchProps,
}





