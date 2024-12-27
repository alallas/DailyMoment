


function setProps(dom, oldProps, newProps) {
  for (let key in oldProps) {
    if (key !== 'children') {
      if (!newProps.hasOwnProperty(key)) {
        // 新的没有，老的有，需要删除
        dom.removeAttribute(key)
      } else {
        // 新的有，老的也有，需要覆盖
        setProp(dom, key, newProps[key])
      }
    }
  }
  // 新的有，老的没有，需要新增
  for (let key in newProps) {
    if (key !== 'children') {
      if (!oldProps.hasOwnProperty(key)) {
        setProp(dom, key, newProps[key])
      }
    }
  }
  // 其实可以只是在遍历newProps的时候，不用判断老有没有，因为不管哪个，都是执行一样的函数
}


function setProp(dom, key, value) {
  if (/^on/.test(key)) {
    dom[key.toLowerCase()] = value;
  } else if (key === 'style') {
    for(let styleName in value) {
      dom.style[styleName] = value[styleName];
    }
  } else {
    dom.setAttribute(key, value);
  }
}



export {
  setProps
}
