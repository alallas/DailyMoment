import { addEvent } from './event.js'

function onlyOne(obj) {
  return Array.isArray(obj) ? obj[0] : obj
}


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

export {
  onlyOne,
  setProps,
  flatten,
}





