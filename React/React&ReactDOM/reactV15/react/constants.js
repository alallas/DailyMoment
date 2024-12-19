
// Symbol.for() 创建的 Symbol 是全局唯一的，不同脚本或模块中使用相同的 key 会得到同一个 Symbol

// 文本类型，单纯的原始值类型
export const TEXT = Symbol.for('react.text')
// 原生的dom类型，比如div，span的由createElement创建出来的
export const ELEMENT = Symbol.for('react.element')

export const FUNCTION_COMPONENT = Symbol.for('react.functionComponent')
export const CLASS_COMPONENT = Symbol.for('react.classComponent')



export const MOVE = 'MOVE';
export const REMOVE = 'REMOVE';
export const INSERT = 'INSERT';



