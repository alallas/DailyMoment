import { TEXT } from "./constants";

function createElement(type, config, ...children) {
  delete config._self;
  delete config._source;

  let handledChildren = children.map((child, index) => {
    if (typeof child === 'object' || typeof child === 'function') {
      return child
    } else {
      return {
        type: TEXT,
        props: { text: child, children: [] }
      }
    }
  })

  const props = {
    ...config,
    children: handledChildren,
  }

  return {
    type,
    props,
  }

}

const React = {
  createElement,
}


export default React;

