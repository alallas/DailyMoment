import * as effectTypes from './effectTypes';


// 统一一下effect函数返回值，是这样一个对象
const makeEffect = (type, payload) => {
  return { type, payload };
};



// 也就是take函数的payload就是一个对象，里面有pattern属性
export function take(pattern) {
  return makeEffect(effectTypes.TAKE, { pattern })
}








