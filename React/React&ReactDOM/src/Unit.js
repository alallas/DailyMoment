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
import types from "./types";

// 这是在diff函数中用到的
// 差异队列
let diffQueue = [];
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
    // 文本内容不一样的话直接原地替换！！！！
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

    // ! 需要收集所有的孩子的单元，用来在更新的时候拿到“老状态”的孩子工具集和信息
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

          // ! 保存一些孩子信息
          // ! 保存所有孩子的单元
          this._renderedChildrenUnits.push(childUnit);
          // ! 保存孩子在母亲节点中的位置，即索引
          childUnit._mountIndex = index;

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
      if (/^on[A-Z]/.test(propName)) {
        $(document).undelegate(`.${this._reactid}`);
      }
    }
    for (propName in newProps) {
      if (propName === "children") {
        continue;
      } else if (/^on[A-Z]/.test(propName)) {
        let eventName = propName.slice(2).toLowerCase();
        $(document).delegate(
          `[data-reactid="${this._reactid}"]`,
          `${eventName}.${this._reactid}`,
          newProps[propName]
        );
      } else if (propName === "style") {
        let styleObj = newProps[propName];
        Object.entries(styleObj).map(([attr, value]) => {
          // ! 直接用jquery的方法，不需要转化大小写，会把这些style放到这个属性的标签上面
          $(`[data-reactid="${this._reactid}"]`).css(attr, value);
        });
      } else if (propName === "className") {
        $(`[data-reactid="${this._reactid}"]`).attr("class", newProps[propName]);
      } else {
        $(`[data-reactid="${this._reactid}"]`).attr(propName, newProps[propName]);
      }
    }
  }

  // 此时要对新老孩子们进行对比，找出差异，进而修改DOM
  // 传入的参数是newProps.children数组
  updateDOMChildren(newChildrenElements) {
    // 每次进入这个数组都要让他++，记录一下当前的节点树的深度
    updateDepth++;
    this.diff(diffQueue, newChildrenElements);
    updateDepth--;

    // 这里是回到了顶层
    if (updateDepth === 0) {
      this.patch(diffQueue);
      diffQueue = [];
    }
  }


  diff(diffQueue, newChildrenElements) {
    // ! 第一步生成一个map，拿到老的unit对象
    let oldChildrenUnitMap = this.getOldChildrenMap(this._renderedChildrenUnits);
    // ! 第二步生成一个新的unit数组（！处理孩子数组的元素本身（类型、属性、内容）问题，主要是做属性和内容的更新）
    let { newChildrenUnits, newChildrenUnitMap } = this.getNewChildren(oldChildrenUnitMap, newChildrenElements);

    // 上一个已经确定位置的索引。
    let lastIndex = 0;

    // ! 这里第三步其实对于那些textUnit没有什么用处，（那个时候的newChildrenUnits只有一个元素，也就是字符串原始值）主要是对于那些孩子节点是nativeUnit的母亲节点进行处理的，用于收集要操作的顺序信息
    // 第三步开始回到处理孩子数组的顺序问题，收集孩子的移动或删除或新建的操作
    for (let i = 0; i < newChildrenUnits.length; i++) {
      let newUnit = newChildrenUnits[i];
      let newKey = (newUnit._currentElement.props && newUnit._currentElement.props.key) || i.toString();
      let oldChildUnit = oldChildrenUnitMap[newKey];

      // 第一种情况是，新老一致，两个对象完全一样（内存地址一样，因为是直接复用的，在处理孩子的时候已经把老节点更新过了）
      if (oldChildUnit === newUnit) {
        // 第1.1种情况是，新老元素在母节点中的位置一样，那就什么也不用处理
        // 第1.2种情况是，新老元素在母节点中的位置不一样，
          // 1.2.1的情况是，此时的元素在老数组中的位置是最大的（位于最右边的）（也就是lastIndex是最大的时候），这时什么也不用处理
          // 1.2.2的情况是，此时的元素在老数组中的位置不是最大的（小于lastIndex），就要把这个元素从左往右移动

        if (oldChildUnit._mountIndex < lastIndex) {
          diffQueue.push({
            parentId: this._reactid,
            parentNode: $(`[data-reactid="${this._reactid}"]`),
            type: types.MOVE,
            fromIndex: oldChildUnit._mountIndex,
            toIndex: i,
          })
        }
        lastIndex = Math.max(lastIndex, oldChildUnit._mountIndex)
      } else {
        // 第二种情况是，oldChildUnit为null，老数组没有这个节点，新数组有这个节点，相当于新建了一个！！
        // 但是还有另外一个情况！oldChildUnit和newUnit的key一样，可以拿到，但是两者不===，比如新的元素改了他的type，他在进行第二步的getNewChildren的时候往新数组里面加入的是一个新创建的unit，内存地址肯定不一样！
        // 这个时候新节点被标记为添加，但是旧节点没有被标记为删除，因为是按照key是否同时存在来判断的！！
        if (oldChildUnit) {
          // 如果这个时候拿得到老节点，说明两者key一样，但是类型不一样，需要先把老的删除
          diffQueue.push({
            parentId: this._reactid,
            parentNode: $(`[data-reactid="${this._reactid}"]`),
            type: types.REMOVE,
            fromIndex: oldChildUnit._mountIndex,
          });
          $(document).undelegate(`.${oldChildUnit._reactid}`)
        }
        diffQueue.push({
          parentId: this._reactid,
          parentNode: $(`[data-reactid="${this._reactid}"]`),
          type: types.INSERT,
          toIndex: i,
          markUp: newUnit.getMarkUp(`${this._reactid}.${i}`)
        })
      }
      // 这个是保证当前的遍历的index和新节点的index一样
      newUnit._mountIndex = i;
    }
    // 第三种情况是，老数组有这个节点，但是新数组没有这个节点，需要删掉！！
    for(let oldKey in oldChildrenUnitMap) {
      if(!newChildrenUnitMap.hasOwnProperty(oldKey)) {
        diffQueue.push({
          parentId: this._reactid,
          parentNode: $(`[data-reactid="${this._reactid}"]`),
          type: types.REMOVE,
          fromIndex: oldChildrenUnitMap[oldKey]._mountIndex,
        })
      }
    }
  }

  // 这里传入的参数是老的状态的孩子工具集
  getOldChildrenMap(childrenUnits = []) {
    let map = {};
    for (let i = 0; i < childrenUnits.length; i++) {
      let childUnit = childrenUnits[i];
      let key =
        (childUnit &&
          childUnit._currentElement.props &&
          childUnit._currentElement.props.key) ||
        i.toString();
      map[key] = childUnit;
    }
    return map;
  }

  // 这里的逻辑是：
  // 1.找到老的里面有没有能用的，能用的直接复用
  // 2.没找到的新建一个

  // PS:这里有一个问题就是为什么老的数组是unit，而新的数组是Element，因为等会更新的时候需要用到老的unit的update方法来更新
  // PS:核心大问题：为什么说在写react的强调一定要给key，千万不要走内部的索引key
  // 回答：因为内部索引key是用索引来表示的，假如上一次的孩子元素是ABC，这次是CAB，那按照道理其实都可以复用的，但是用新的孩子的元素数组的索引对应着去取老元素的时候，新的0是C，而老的0是A，两者类型都不一样，就要强制更新了。如果用一些标识,把这个标识存到每个Element的属性里面，相当于每个Element有一个唯一的id，就可以方便地准确找到对应的元素
  getNewChildren(oldChildrenUnitMap, newChildrenElements) {
    // 创建一个新的存储空间来存储新的children的元素
    let newChildrenUnits = [];
    let newChildrenUnitMap = {};
    newChildrenElements.forEach((newChildElement, index) => {
      let newKey = (newChildElement.props && newChildElement.props.key) || index.toString();

      // 用新的key去找老的数组里面的元素，看能不能找到可以复用的元素
      let oldUnit = oldChildrenUnitMap[newKey];
      let oldElement = oldUnit && oldUnit._currentElement;

      // 即使找到了还是要判断一下是不是类型一样
      if (shouldDeepCompare(oldElement, newChildElement)) {
        // 注意！！！！这里是递归的逻辑
        // 当前这个孩子数组的某个孩子，采用对应的这个孩子元素的老状态的工具包，去做以这个元素为根节点的更新。注意oldUnit是指的当前这个孩子元素的老状态的unit。所以他的this的currentElement就是这个孩子元素！！！
        oldUnit.update(newChildElement);

        // 然后说明这个是一个可以复用的节点，直接拿老的来用
        // 提问：但是有一个问题，如果类型一样的但是文本内容不一样呢？？？
        // 回答：去看TextUnit里面的更新方法，他用新的文本内容直接替换了this._currentELement，也就是这个时候的oldUnit其实是最新版本的了。
        // 拓展：其实每一次不管什么类型的unit都会对当前的老状态的属性做原地修改的！！
        newChildrenUnits.push(oldUnit);
        newChildrenUnitMap[newKey] = oldUnit;
      } else {
        let newUnit = createUnit(newChildElement);
        newChildrenUnits.push(newUnit);
        newChildrenUnitMap[newKey] = newUnit;
      }
    });
    return { newChildrenUnits, newChildrenUnitMap };
  }

  patch(diffQueue) {
    let deleteChildren = [];
    let deleteMap = {};

    // 首先先收集所有需要删除的元素（包括确实要删除的元素和需要移动的元素，因为移动的元素需要先删除然后再添加）
    for (let i = 0; i < diffQueue.length; i++) {
      let difference = diffQueue[i];
      if(difference.type === types.MOVE || difference.type === types.REMOVE) {
        let fromIndex = difference.fromIndex;
        // 这里拿到要删除的那个孩子节点
        let oldChild = difference.parentNode.children().get(fromIndex)

        // 收集所有节点，并保存一些他们的fromIndex信息，等会插入的时候要用到
        deleteMap[fromIndex] = oldChild;
        deleteChildren.push(oldChild);
      }
    }

    // $().remove()这个方法相当于先去找html树里面的某个节点，然后删除。
    // 而删除什么节点，遍历整个数组删除里面的节点
    // 这是绕过了已经生成的各种Element和unit的内部属性，直接去到html树上面删除
    $.each(deleteChildren, (idx, item) => $(item).remove())


    // 然后这个时候的html的children已经是删除过的样子了，注意是原地删除，在例子中此时为AC。接下来要进行移动节点的添加和新建节点的添加
    for (let i = 0; i < diffQueue.length; i++) {
      let difference = diffQueue[i];
      switch (difference.type) {
        case types.INSERT:
          this.insertChildAt(difference.parentNode, difference.toIndex, $(difference.markUp))
          break;
        // 这个时候使用fromIndex拿到对应的要移动的原节点
        case types.MOVE:
          this.insertChildAt(difference.parentNode, difference.toIndex, deleteMap[difference.fromIndex])
          break;
        default:
          break;
      }
    }
  }

  insertChildAt(parentNode, index, newNode) {
    // 如果当前的位置已经有元素占着了，那就需要在他前面插入，为什么？？
    // 回答：比如说原来是ABCDEFG，后面是ADBGCE，这个时候B要插入的位置被G占用了，需要移动到他的前面
    let oldChild = parentNode.children().get(index);

    // 如果当前位置没有节点
    // 最后一个位置肯定是当前的新数组的节点需要加入的位置，所以用appendTo母亲节点的形式
    // ! 其实这里有比较巧的构思吧我觉得！因为需要删除的都是排在前面或左边的节点，跟随着前一个节点的节点已经被相对移动到他后面了
    oldChild ? $(newNode).insertBefore(oldChild) : $(newNode).appendTo(parentNode)
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
    let nextState = (this._componentInstance.state = Object.assign(
      this._componentInstance.state,
      partialState || {}
    ));

    // 获取到最新的元素的属性和children内容（有改变的话）
    let nextProps = this._currentElement.props;

    if (
      this._componentInstance.shouldComponentUpdate &&
      !this._componentInstance.shouldComponentUpdate(nextProps, nextState)
    ) {
      return;
    }

    // 下面要进行比较更新
    // 先得到上次渲染的单元，
    let preRenderedUnitInstance = this._renderedUnitInstance;
    // 再拿到这个单元的这个element(就是上一次执行组件实例的render方法执行的返回值)，也就是拿到上次渲染的DOM或组件元素
    let preRenderedELement = preRenderedUnitInstance._currentElement;

    // 然后再拿到这次渲染之后的新的元素(这个时候的state是已经变化了的)
    let nextRenderElement = this._componentInstance.render();

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
      this._componentInstance.componentDidUpdate &&
        this._componentInstance.componentDidUpdate();
    } else {
      // 更新一下已经渲染的原来的单元实例
      this._renderedUnitInstance = createUnit(nextElement);
      let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._reactid);

      // 把新的html内容进行原地替换
      $(`[data-reactid="${this.reactid}"]`).replaceWith(nextMarkUp);
    }
  }
  getMarkUp(reactid) {
    this._reactid = reactid;
    // 此时这个type是一个类组件
    let { type: Component, props } = this._currentElement;

    // 构造他的实例
    // 同时缓存一下这个实例【也就是整个组件的实例】
    let componentInstance = (this._componentInstance = new Component(props));

    // 同时让组件的实例的currentUnit属性等于当前的unit【也就是CompositeUnit】
    // ! 其实就相当于是互相引用对方，组件实例可以找到对应的unit工具包，unit工具包也可以找到当前的组件实例
    // 后面会有setState的组件更新，可以通过组件的实例拿到当前的unit
    componentInstance._currentUnit = this;

    // 执行一下生命周期函数，在渲染之前
    componentInstance.componentWillMount &&
      componentInstance.componentWillMount();

    // 然后执行render方法
    let renderedElement = componentInstance.render();

    // 得到的是一个（原生的dom对象）（情况之一），继续发配构造能够亮相的html字符串
    // 同时缓存下返回的对应的类别的小类unit【也就是NativeUnit的实例】
    let renderedUnitInstance = (this._renderedUnitInstance =
      createUnit(renderedElement));
    // 装饰店铺，输出可观的html标签信息
    let renderedMarkUp = renderedUnitInstance.getMarkUp(this._reactid);

    // 在这个时候绑定mounted事件，这个里面的didMount什么时候触发呢，应该是要在把这个markup字符串放到了html上面才会触发，这里先中转一下，因为这里直接拿到了组件的实例，获取里面的方法比较方便！
    // 相当于发布事件！！！
    $(document).on("mounted", () => {
      componentInstance.componentDidMount &&
        componentInstance.componentDidMount();
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
  if (oldElement !== null && newElement !== null) {
    // ! element有可能不是一个React.createElement的产物，有可能是普通的字符串和数字。就要看render方法导出的是什么
    // ! 第一种情况判断的是普通的原始值情况，第二种情况判断的是组件或者dom的情况！！！

    let oldType = typeof oldElement;
    let newType = typeof oldElement;
    if (
      (oldType === "string" || oldType === "number") &&
      (newType === "string" || newType === "number")
    ) {
      return true;
    }

    if (oldElement instanceof Element && newElement instanceof Element) {
      return oldElement.type === newElement.type;
    }
  }
  // 没有传递两个参数，肯定要重新更新以下
  return false;
}

export { createUnit, Unit, TextUnit, NativeUnit };
