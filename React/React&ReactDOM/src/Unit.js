import { Element, createElement } from "./Element";
import $ from "jquery";

// 这是一个抽象类，不能实例化！！！
// 不能对父类的getMarkUp方法进行调用

class Unit {
  constructor(element) {
    // 每个单元保存一下自己的Element
    // 凡是挂载到私有属性上的都以_开头
    this._currentElement = element;
  }

  // 没什么用，只是用来提示说子类要写一个getMarkUp方法
  // 或前面加上abstract，子类一定要实现一个这个方法
  // abstract getMarkUp() {}
  getMarkUp() {
    throw Error("此方法不能被调用");
  }
}

class TextUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid;
    return `<span data-reactid="${reactid}">${this._currentElement}</span>`;
  }
}

// 这种情况是处理原生dom对象
// 这种情况下的currentElement就是下面这样
// { type: 'button', props: { id: 'sayHello' }, children: [ 'say', { type: 'b', props: {}, children: ['Hello'] } ] }
class NativeUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid;
    // 最后肯定要生成纯纯html语言
    // <button id="sayHello" style="color:red;background-color:green" onclick="sayHello">
    //   <span>say</span>
    //   <b>Hello</b>
    // </button>

    let { type, props } = this._currentElement;
    let tagStart = `<${type} data-reactid="${this._reactid}"`;
    let childString = "";
    let tagEnd = `</${type}>`;

    for (let propName in props) {
      // 如果是onXXX说明要绑定事件
      if (/^on[A-Z]/.test(propName)) {
        // 拿到单纯没有on的交互名字
        let eventName = propName.slice(2).toLowerCase();

        // 绑定事件，根据id来绑定
        // 如果是自定义属性，需要这么来获取，像对象里面的字符串的取法
        $(document).delegate(
          `[data-reactid="${this._reactid}"]`,
          `${eventName}.${this._reactid}`,
          props[propName]
        );
      } else if (propName === "children") {
        // 需要递归
        let children = props[propName];

        // 首先靠工厂为孩子发配一个xx肉食店
        // 然后孩子去执行这个店铺的一个getMarkUp方法，也就是为店铺布置肉类食品，填充内容，并需要为店铺整一个id
        // 这个id使用母亲的id和当前孩子个数的index
        // 然后把这个孩子汇总到本母亲店铺里面
        children.map((child, index) => {
          let childUnit = createUnit(child);
          let childMarkUp = childUnit.getMarkUp(`${this._reactid}.${index}`);
          childString += childMarkUp;
        });
      } else if (propName === "style") {
        let styleObj = props[propName];

        // 处理大写和分号问题
        let styles = Object.entries(styleObj)
          .map(([attr, value]) => {
            let newArrt = attr.replace(/[A-Z]/g, (matched, g1) => {
              return `-${matched.toLowerCase()}`;
            });
            return `${newArrt}:${value}`;
          })
          .join(";");

        tagStart += ` style="${styles}"`;
      } else if (propName === "className") {
        // PS：为什么jsx没有用class，不跟html保持一样，因为js里面class是一个关键字啊！
        tagStart += ` class="${props[propName]}"`;
      } else {
        tagStart += ` ${propName}=${props[propName]}`;
      }
    }

    return tagStart + ">" + childString + tagEnd;
  }
}


class CompositeUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid;
    // 此时这个type是一个类组件
    let { type: Component, props } = this._currentElement;

    // 构造他的实例
    // 同时缓存一下这个实例【也就是整个组件的实例】
    let componentInstance = this._componentInstance = new Component(props);

    // 同时让组件的实例的currentUnit属性等于当前的unit【也就是CompositeUnit】
    // 后面会有setState的组件更新，可以通过组件的实例拿到当前的unit
    this._componentInstance.currentUnit = this;

    // 执行一下生命周期函数，在渲染之前
    componentInstance.componentWillMount && componentInstance.componentWillMount();

    // 然后执行render方法
    let renderedElement = componentInstance.render();

    // 得到的是一个（原生的dom对象）（情况之一），继续发配构造能够亮相的html字符串
    // 同时缓存下返回的对应的类别的小类unit【也就是NativeUnit的实例】
    let renderedUnitInstance = this._renderedUnitInstance = createUnit(renderedElement);
    // 装饰店铺，输出可观的html标签信息
    let renderedMarkUp = renderedUnitInstance.getMarkUp(this._reactid);

    // 在这个时候绑定mounted事件，这个里面的didMount什么时候触发呢，应该是要在把这个markup字符串放到了html上面才会触发，这里先中转一下，因为这里直接拿到了组件的实例，获取里面的方法比较方便！
    // 相当于发布事件！！！
    $(document).on('mounted', () => {
      componentInstance.componentDidMount && componentInstance.componentDidMount();
    });

    return renderedMarkUp;

  }
}


// 这个函数就像是一个肉食工厂，他有很多种类的小店铺，比如牛肉店，猪肉店等等
// 有些dom可能擅长的是牛肉也可能是猪肉，要靠工厂统一发配一个店铺来运营
// 一个标签（也就是<括号）或者说是dom就是一个单元，也就是一个具体的肉食店
function createUnit(element) {
  if (typeof element === "string" || typeof element === "number") {
    return new TextUnit(element);
  }
  if (element instanceof Element && typeof element.type === "string") {
    return new NativeUnit(element);
  }
  if (element instanceof Element && typeof element.type === "function") {
    return new CompositeUnit(element);
  }
}

export { createUnit, Unit, TextUnit, NativeUnit };
