## 适配器模式（改造旧功能）
- 本质上：允许不兼容的接口能在一起工作。通过在现有功能和新接口之间创建一个中间层来兼容。
- 应用场景：连接使用不同接口的多个外部API，数据处理器

- 基础例子：

```
// 适配器模式基础
class Old {
    getData() {
        const oldData = 'old data'
        return oldData
    }
}
class Adapter {
    constructor() {
        this.old = new Old()
    }
    getNewStructureData() {
        // 对old数据进行处理，使其满足新的需求
        const oldData = this.old.getData()
        const newData = oldData + ' combine new data'

        console.log(newData)
        return newData
    }
}

const a = new Adapter()
a.getNewStructureData()
```


- 进一步例子——数据构造器：

```
// 老数据结构
const oldData = {
  key1: 1111,
  key2: 2222,
  key3: 3333,
};

// 新数据结构
const newData = [
  {
    key: 'key4',
    value: 4444,
  },
  {
    key: 'key5',
    value: 5555,
  },
];

// 统一使用函数
const useData = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    console.log(`使用数据${key} -- ${value}`);
  });
};

// 适配器函数
const newDataAdapter = (oldData) => {
  return newData.reduce((preData, { key, value }) => {
    preData[key] = value;
    return preData;
  }, oldData);
};

useData(newDataAdapter(oldData));
// 打印
// 使用数据key1 -- 1111
// 使用数据key2 -- 2222
// 使用数据key3 -- 3333
// 使用数据key4 -- 4444
// 使用数据key5 – 5555

```




## 装饰器模式（添加新功能）

- 好处：动态添加对象的新功能，而不修改原有结构。为对象提供了一种扩展功能的方法，提供了比继承更有弹性的替代方案。
- 应用场景：增强组件（如React组件）的功能而不改变其代码。（当需要为对象增加额外的功能，又不想改变对象自身或使用子类时。）

- 示例：

```
// 装饰器模式
// 原来的功能还能用，增加的新功能不改变原有的功能
// 可以增加多个装饰
class Old {
    constructor() {
        this.num = 1
    }
    getNum() {
        console.log('old method', this.num)
    }
}
// 拿到原有的旧功能
class OldDecorator {
    constructor() {
        this.old = new Old()
    }
    getNum() {
        this.old.getNum()
    }
}
// 扩展新功能(可以扩展多个！)
class NewDecorator extends OldDecorator {
    constructor() {
        super()
        this.name = 'n'
    }
    getNum() {
        this.old.getNum()
        console.log('name', this.name)
    }
}

const n = new NewDecorator()
n.getNum()
```

## PS：适配器和装饰器模式总结

核心是拿到原有的功能，不能直接extends 旧类，因为这样导致其原型链上都是旧类的方法，想执行旧类的方法也是直接调用原来的函数名就好了，这时没有办法区分新（同名函数）方法和旧方法！！！！！

通用的做法是：

```
this.old = new Old()
```

