// 文本类型，单纯的原始值类型
export const ELEMENT_TEXT = Symbol.for('ELEMENT_TEXT')

// React需要一个根节点，也就是根Fiber
export const TAG_ROOT = Symbol.for('TAG_ROOT')
// 原生的节点，比如div、span等
export const TAG_HOST = Symbol.for('TAG_HOST')
// 文本节点
export const TAG_TEXT = Symbol.for('TAG_TEXT')
// 类组件
export const TAG_CLASS = Symbol.for('TAG_CLASS')
// 函数组件
export const TAG_FUNCTION = Symbol.for('TAG_FUNCTION')



// 副作用标识
// 插入/增加
export const PLACEMENT = Symbol.for('PLACEMENT')
// 更新
export const UPDATE = Symbol.for('UPDATE')
// 删除
export const DELETION = Symbol.for('DELETION')





