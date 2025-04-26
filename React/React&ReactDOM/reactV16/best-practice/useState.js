// 情况一：一个组件内，子组件包括 一个高阶组件 和 一个普通组件互为兄弟
// 遇到的问题是，高阶组件的state变化，普通组件的props（一个对象）深层参数有变化（dom的属性变化），但是普通组件并没有更新

import Son1 from './';
import { useState } from 'react';

const HOC = WrapSon1(Son1);
const Father = () => {
  const son1Ref = useRef(null);
  return (
    <>
      <div ref={son1Ref}>
        <HOC />
      </div>
      <Son2 formRef={son1Ref} />
    </>
  )
};
// Son2里面有逻辑是son1Ref变化，Son2的样式就会变化


function WrapSon1 (Component) {
  return function HOC () {
    const [state, setState] = useState(false);
    const onChange = () => {
      setState(!state);
    }
    return (
      <div style={{display: state ? 'block' : 'none'}} onClick={onChange}>
        <div>补丁！</div>
        <Component/>
      </div>
    )
  }
}


// 上面的Son2的样式不会随着click而变化，原因如下：
// HOC的state变化，会让didReceiveUpdate变为true（为true之后就会继续往下构建子树），也就是说这个state的变化，只会影响她及其下面的子组件

// 而对于Son2来说，他的state和props都没有变化（props的son1Ref的内存地址不变），所以didReceiveUpdate为false，就会直接去bailout，返回null
// 然后这个Son2组件及其下面的子组件，都不会再次通过beginWork进入，也就不会更新了。

// 而对于Father来说，他的子组件HOC在setState时进入scheduleWork，里面有一个scheduleWorkToRoot(fiber, expirationTime)函数是更新自己及其祖上的父节点的eT，
// 当Father组件去到beginWork的时候，有这么一个判断else if (updateExpirationTime < renderExpirationTime) {
// 此时的Father节点的eT是Sync，因此需要继续往下遍历

// 【关键就是Son2和HOC是兄弟组件】


// fix的最佳实践：
// 在两个兄弟组件的共同父亲组件，强行update一下
// 在HOC组件click的时候，执行父组件的回调函数，父组件的回调函数内执行setState，修改父组件维护的state，
// 这样父组件因为state修改了就强制更新，那么下面的Son2就会重新执行了


// 总结补充：
// 组件什么时候要更新？
// props变化、state变化、子组件setState了

