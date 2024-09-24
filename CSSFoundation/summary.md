## CSS动画

分类：
1. transition + transform
2. animation

### 类型一：transition + transform
### transition
基本写法：
```
// 一个属性（第一个时间表示duration持续的时间，最后一个表示delay的时间）
transition: margin-right 4s ease-in-out 1s;

// 多个属性
transition:
  margin-right 4s,
  color 1s;

// 所有属性
transition: all 0.5s ease-out;

// 继承父元素
transition: inherit;
transition: initial;
transition: unset;
```


### transform
1. 可变属性
```
// 尺寸大小
transform: scale(1.2);

// 形状角度
transform: skew(-15deg);

// 旋转
transform: rotate(-15deg)

// 位置移动
transform: translate3d(0, 10px, 0);
```

2. 改变原点
https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin

```
// 前者是上下，后者是左右
transform-origin: 0 50%;
```

- 应用例子：
1. 从左边向右边滑动
红色是关键：让before一开始显现不了，但设定transform的原点位置，然后交互之后scaleX为1
```
.color {
    position: relative;
    transition: all 1s ease-in-out;
    z-index: 1;
}
.color::before {
    position: absolute;
    content: "";
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    
    z-index: -1;
    transform-origin: 0 50%;
    transform: scaleX(0);
    transition: all 1s ease-in-out;
}
.color:hover::before {
    background-color: #00bc9b;
    transform: scaleX(1);
}
```

2. 从中间向两侧滑动
```
// 跟上面代码一样，但是删掉下面这一行
// 因为默认就是从中间开始往两侧transform的

    transform-origin: 0 50%;
```

- 别的方法：（不用transform-origin）
1. 从左边向右边滑动
left为0，width为0，交互之后width为100%

2. 从中间向两侧滑动
left开始为50%位于中间，width为0；交互之后left为0，width为100%
```
// 从左边向右边滑动

.underline::after {
    position: absolute;
    content: '';
    left: 0;
    bottom: 0;
    width: 0;
    height: 5px;
    background-color: brown;
    transition: all 1s ease-in-out;
}
.underline:hover::after {
    width: 100%;
}


// 从中间向两侧滑动

.underline::after {
    position: absolute;
    content: '';
    left: 50%;
    bottom: 0;
    width: 0;
    height: 5px;
    background-color: brown;
    transition: all 1s ease-in-out;
}
.underline:hover::after {
    width: 100%;
    left: 0;
}
```


### 类型二：animation
```
.heart {
    animation: identifier 1s ease-in-out infinite;
}
@keyframes identifier {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}
```
