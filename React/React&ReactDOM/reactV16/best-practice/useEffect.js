

// 情况一：一个组件内，多个useEffect之间相互依赖对方的值
// 后一个useEffect拿不到前一个useEffect的值，无法执行（若没有实时变化的依赖项）

import { useEffect, useRef } from "react"

const Component = ({lat, lon}) => {
  const fatherMapRef = useRef(null)
  useEffect(() => {
    fatherMapRef.current = new OlMap();
  }, []);
  useEffect(() => {
    if (fatherMapRef.current) {
      console.log('能打印我！');
    }
  }, []);
}

// 上面的console.log('能打印我！')无法打印，原因如下：
// 1. 在执行Component函数组件本身的时候，useEffect钩子把回调函数存入对象中
// 2. 渲染完DOM，且开始异步执行useEffect的回调函数，此时的回调函数的上层作用域是之前执行函数组件的作用域，ref的值为null

// fix的最佳实践：
// 两个effect合并为一个
// Q：两个的依赖项有所不同的时候，思考如何结合？
// A：举例，A函数的依赖项是源头，B函数的依赖项依赖A函数的依赖项，
// 那么在合并的时候，需要额外判断B函数的依赖项是否随着A函数的依赖项变化而变化，假设有变化就执行B函数，没有就不执行







// 情况二：两个父子组件，子传递参数给父，useEffect依赖这个传递的参数
// useEffect拿不到子传递过来的值

// 父组件
const Father = ({lat, lon}) => {
  const fatherMapRef = useRef(null)
  useEffect(() => {
    if (fatherMapRef.current) {
      console.log('能打印我！')
    }
  }, [])

  return (
    <Son getMapRef={(ref) => fatherMapRef.current = ref } />
  )
}
// 子组件
const Son = ({getMapRef}) => {
  const sonMapRef = useRef(null)
  useEffect(() => {
    sonMapRef.current = new OlMap();
    if (getMapRef) {
      getMapRef(sonMapRef.current)
    }
  }, [])
}


// 上面的console.log('能打印我！')无法打印，原因如下：
// 1. 在执行Father和Son函数组件本身的时候，useEffect钩子把回调函数存入对象中
// 2. 渲染完DOM，且开始异步执行useEffect的回调函数，首先执行子组件的useEffect函数，内部执行父组件的回调函数，把map实例给到了父组件的ref
// 3. 然后执行父组件的useEffect函数，这个时候函数的上层作用域是之前执行父函数组件的作用域，ref的值为null


// fix的最佳实践：
// 父组件的useEffect加上实时变化的变量作为依赖项，
// 下次参数变化，然后再次执行useEffect，这个时候的上层作用域就可以拿到正确的值了





