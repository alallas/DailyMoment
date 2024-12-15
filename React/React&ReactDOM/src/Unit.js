// 补充一些jquery和原生方法的对应关系：

// jquery的方法：
// $(document).delegate(
//   `[data-reactid="${this._reactid}"]`,
//   `${eventName}.${this._reactid}`,
//   props[propName]
// );

// 原生的方法：
// const eventType = `${eventName}.${this._reactid}`;
// const element = document.querySelector(`[data-reactid="${this._reactid}"]`);
// element.addEventListener(eventName, function(event) {
//   newProps[propName].call(element, event);
// }, false);

// jquery的方法：（这两个好像差不多诶！！）
// $(`[data-reactid="${this._reactid}"]`).props(propName, newProps[propName])
// $(`[data-reactid="${this._reactid}"]`).attr(propName, newProps[propName])

// 原生的方法：
// var element = document.querySelector(`[data-reactid="${this._reactid}"]`);
// element.setAttribute(propName, newProps[propName]) 





import { Element, createElement } from "./Element";
import $ from "jquery";

// 这是在diff函数中用到的
// 差异队列
let diffQueue;
// 更新的级别
let updateDepth = 0;


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
  update(nextElement) {

    // 这里element都是原始值，直接对比就好了！！！
    if (this._currentElement !== nextElement) {
      this._currentElement = nextElement;
      $(`[data-reactid="${this._reactid}"]`).html(this._currentElement);
    }

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

    // 需要收集所有的孩子的单元，用来在更新的时候拿到“老状态”的孩子工具集和信息
    this._renderedChildrenUnits = [];

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
          this._renderedChildrenUnits.push(childUnit)
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

  update(nextElement) {
    let oldProps = this._currentElement.props;
    let newProps = nextElement.props;

    this.updateDOMProperties(oldProps, newProps);
    this.updateDOMChildren(newProps.children);
  }

  updateDOMProperties(oldProps, newProps) {
    let propName;

    // 循环老的属性，因为目标是改变老的属性
    for (propName in oldProps) {
      // 第一种情况是找要删掉的那些属性
      if (!newProps.hasOwnProperty(propName)) {
        $(`[data-reactid="${this._reactid}"]`).removeAttr(propName);
      }
      // 第二种情况是把以前绑定到旧的节点上的旧的事件取消掉，不然节点有变，事件还绑定着有点不太OK
      if(/^on[A-Z]/.test(propName)) {
        $(document).undelegate(`.${this._reactid}`);
      }
    }
    for(propName in newProps) {
      if (propName === 'children') {
        continue
      } else if (/^on[A-Z]/.test(propName)) {
        let eventName = propName.slice(2).toLowerCase();
        $(document).delegate(
          `[data-reactid="${this._reactid}"]`,
          `${eventName}.${this._reactid}`,
          newProps[propName]
        );
      } else if (propName === 'style') {
        let styleObj = newProps[propName];
        Object.entries(styleObj).map(([attr, value]) => {
          // ! 直接用jquery的方法，不需要转化大小写，会把这些style放到这个属性的标签上面
          $(`[data-reactid="${this._reactid}"]`).css(attr, value);
        })
      } else if (propName === 'className') {
        $(`[data-reactid="${this._reactid}"]`).attr('class', newProps[propName])
      } else {
        $(`[data-reactid="${this._reactid}"]`).props(propName, newProps[propName])
      }
    }
  }

  // 此时要对新老孩子们进行对比，找出差异，进而修改DOM
  // 传入的参数是newProps.children数组
  updateDOMChildren(newChildrenElements) {
    this.diff(diffQueue, newChildrenElements);
  }
  diff(diffQueue, newChildrenElements) {
    let oldChildrenUnitMap = this.getOldChildrenMap(this._renderedChildrenUnits);
    let newChildren = this.getNewChildren(oldChildrenUnitMap, newChildrenElements)
  }

  // 这里传入的参数是老的状态的孩子工具集
  getOldChildrenMap(childrenUnits = []) {
    let map = {};
    for (let i = 0; i < childrenUnits.length; i++) {
      let childUnit = childrenUnits[i]
      let key = childUnit && childUnit._currentElement.props && childUnit._currentElement.props.key || i.toString();
      map[key] = childUnit;
    }
    return map;
  }

  // 这里的逻辑是：
  // 1.找到老的里面有没有能用的，能用的直接复用
  // 2.没找到的新建一个
  getNewChildren(oldChildrenUnitMap, newChildrenElements) {
    let newChildren = [];
    newChildrenElements.forEach((newChildElement, index) => {

    })
  }
}




class CompositeUnit extends Unit {
  // 这个负责组件的更新操作
  update(nextElement, partialState) {
    // 先获取到当前的需要更新的最新的元素
    this._currentElement = nextElement || this._currentElement;

    // 获取新的状态
    // 并且不管要不要更新组件，状态都要修改，这个时候的组件的state已经被改变了！！！！
    // 也就是说如果在这句之后重新执行一下render，肯定在内容上有所变化！！！
    let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state, partialState || {});

    // 获取到最新的元素的属性和children内容（有改变的话）
    let nextProps = this._currentElement.props;

    if(this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps, nextState)) {
      return
    }


    // 下面要进行比较更新
    // 先得到上次渲染的单元，
    let preRenderedUnitInstance = this._renderedUnitInstance;
    // 再拿到这个单元的这个element(就是上一次执行组件实例的render方法执行的返回值)，也就是拿到上次渲染的DOM或组件元素
    let preRenderedELement = preRenderedUnitInstance._currentElement;


    // 然后再拿到这次渲染之后的新的元素(这个时候的state是已经变化了的)
    let nextRenderElement = this._componentInstance.render()

    // 开始比较
    // 比较的时候依次比较类型、属性和孩子（内容）
    // 1.然后先判断新旧两个元素的类型是否一样
    // 如果是false直接用新的元素替换原element
    // 如果比较出来的结果是true也就是两者类型一样，需要进一步深度比较
    // 2.深度比较：也就是将这个工作给到上一个节点工具包，上一个节点工具包实现update方法，直接对比【这里因为上一个节点是文本，而更新之后的节点类型已经判断过没变化，且一般都不变，所以可以直接===对比】

    if (shouldDeepCompare(preRenderedELement, nextRenderElement)) {

      // ! 相当于是对组件做向内层的深挖，以此来实现递归

      // ! 如果类型一样，需要进行深度比较的话，把更新工作交给上一次渲染出来的那个element的unit来处理
      // 这里之前的单元类型肯定和现在的单元类型是一样的，相当于是去对应的类型的unit下进行进一步比较【为什么要把这个任务放到update身上呢】
      // 1.如果大家都是TextUnit的类型，也就是render返回的都是原始值，那么很好，直接===对比就可以了
      // 2.如果大家都是一个dom节点类型，也就是render返回是一个组件或者dom，且最外层的节点的type一样的话，那就要回到本update函数了
      // 回到本update函数是什么逻辑？？？？？？有bug？？？
      preRenderedUnitInstance.update(nextRenderElement);


      // 更新完之后执行一下生命周期函数！！
      this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate();


    } else {
      // 更新一下已经渲染的原来的单元实例
      this._renderedUnitInstance = createUnit(nextElement)
      let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._reactid);

      // 把新的html内容进行原地替换
      $(`[data-reactid="${this.reactid}"]`).replaceWith(nextMarkUp)
    }

  }
  getMarkUp(reactid) {
    this._reactid = reactid;
    // 此时这个type是一个类组件
    let { type: Component, props } = this._currentElement;

    // 构造他的实例
    // 同时缓存一下这个实例【也就是整个组件的实例】
    let componentInstance = this._componentInstance = new Component(props);

    // 同时让组件的实例的currentUnit属性等于当前的unit【也就是CompositeUnit】
    // ! 其实就相当于是互相引用对方，组件实例可以找到对应的unit工具包，unit工具包也可以找到当前的组件实例
    // 后面会有setState的组件更新，可以通过组件的实例拿到当前的unit
    componentInstance._currentUnit = this;

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


// 判断两个元素的类型是否一致
function shouldDeepCompare(oldElement, newElement) {
  // 这个时候两个元素都是element的实例
  if(oldElement !== null && newElement !== null) {
    // ! element有可能不是一个React.createElement的产物，有可能是普通的字符串和数字。就要看render方法导出的是什么
    // ! 第一种情况判断的是普通的原始值情况，第二种情况判断的是组件或者dom的情况！！！

    let oldType = typeof oldElement;
    let newType = typeof oldElement;
    if ((oldType === 'string' || oldType === 'number') && (newType === 'string' || newType === 'number')) {
      return true;
    }

    if ((oldElement instanceof Element) && (newElement instanceof Element)) {
      return oldElement.type === newElement.type;
    }
  }
  // 没有传递两个参数，肯定要重新更新以下
  return false
}





export { createUnit, Unit, TextUnit, NativeUnit };


