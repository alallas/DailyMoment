import React from "react";
import ClassCounter from "./ClassCounter";


const MyContext = React.createContext();
const ADD = 'ADD'


function FunctionCounterSub(props) {
  const context = React.useContext(MyContext)

  return React.createElement('div', { id: 'context-sub' }, 'context-sub-' + context.passValue)
}




// useState是一个语法糖，是基于useReducer实现的
function FunctionCounter(props) {
  // useReducer的写法：
  // 两个参数，第一个参数会返回一个最新的state对象，第二个参数是state的初始值
  const [countState, setCountState] = React.useReducer(reducer, { count: 0 });

  // useState的写法：
  const [numberState, setNumberState] = React.useState({ number: 0 })
  const [scalerState, setScalerState] = React.useState({ scaler: 0 });

  // useEffect
  React.useEffect(() => {
    console.log('Effect: count changed to', numberState.number)
    return () => {
      console.log('Cleanup: count was', numberState.number)
    }
  }, [numberState.number]) // 依赖项是 numberState.number，当 numberState.number 改变时会触发 effect

// useMemo: 缓存计算值
  const expensiveCalculation = React.useMemo(() => {
    console.log('Computing expensive value...');
    return numberState.number * 2;
  }, [numberState.number]); // 只有 numberState.number 改变时才重新计算

  // useCallback: 缓存函数
  const handleClickScaler = React.useCallback(() => {
    setScalerState({ scaler: scalerState.scaler + 1 });
  }, [scalerState.scaler]); // 空依赖数组意味着这个函数只会在第一次渲染时创建一次，避免每次渲染都创建新函数


  const myRef = React.useRef(Math.random());


  function handleClickCount() {
    setCountState({ type: ADD })
  }

  function handleClickNumber() {
    setNumberState({ number: numberState.number + 1 })
  }

  let span1 = React.createElement('span', {}, 'function-count-' + countState.count)
  let button1 = React.createElement('button', { onClick: () => handleClickCount() }, '+1')
  let div1 = React.createElement('div', { id: 'counter1' }, span1, button1)

  let span2 = React.createElement('span', {}, 'memo-' + expensiveCalculation)
  let button2 = React.createElement('button', { onClick: () => handleClickNumber() }, '+1')
  let div2 = React.createElement('div', { id: 'counter2' }, span2, button2)

  let span3 = React.createElement('span', {}, 'callback' + scalerState.scaler)
  let button3 = React.createElement('button', { onClick: () => handleClickScaler() }, '+1')
  let div3 = React.createElement('div', { id: 'counter3' }, span3, button3)

  let div4 = React.createElement('div', { ref: myRef, id: 'ref4' }, 'refTest')

  let contextDiv = React.createElement(MyContext.Provider, { value: { passValue: numberState.number } }, React.createElement(FunctionCounterSub))

  let div = React.createElement('div', {}, contextDiv, div1, div2, div3, div4)
  
  return div
}



function reducer(state, action) {
  switch(action.type) {
    case 'ADD' :
      return { count: state.count + 1 }
    default:
      return state;
  }
}


// Q：hooks为什么不要改变调用顺序，
// A：因为在react里面是用数组来记录每一个hooks的，调用函数本身就去调用useReducer，也就是遍历hooks数组，进行state的更新。如果顺序换了，index拿到的就不是以前的对应的hooks对象了

// Q：hooks为什么不要改变数量，不能写在if或者for里面
// A：还是一个原因，使用数组来管每次更新的hooks，如果有些更新的hooks有时有，有时没有，那数组index就会乱，拿不到对应的hooks及其老状态，及其更新器
// 比如写了：
// if (Math.random() > 0.5) {
//   const [numberState, setNumberState] = React.useState({ number: 0 })
// }

// Q：hooks为什么要写在顶层，
// A：因为只有首先执行useReducer，才能拿到最新的state，然后才能渲染或者对这个state做操作

// PS：其实源码里面的hooks管理是在链表里面维护的



export default FunctionCounter;


//# sourceMappingURL=http://example.com/path/to/your/sourcemap.map