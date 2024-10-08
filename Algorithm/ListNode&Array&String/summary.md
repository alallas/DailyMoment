
## 双指针
### 跳动指针
探路者和锚子：结束条件为探路者超出范围

#### 合并/分解多个xxx
合并两个无序链表or数组为一个有序链表或数组

合并 K 个升序链表

基本框架：
```
- 合并函数
两个指针，一个新temp数组

【遍历两个指针都在数组范围内】（任何一个出数组表示结束）
谁小谁移动

合并剩下的数组
返回合并之后的数组
合并/分解n个，需要递归拆分成单独的两个，再合并，再return往上
```


#### 判断xxx的形状

- 相交：通分找相遇点
- 环：快慢找相遇点


基本框架：
```
相交：
【遍历，指针相遇停下】
指针不为空继续，为空则走另一个表

环：
【遍历，快指针为null或为末尾停下】
中途但凡双方相遇就return
```


#### 找xxx的某个位置的值
环形链表 II、删除链表的倒数第 N 个结点

基本框架：
```
两个指针

【遍历，快指针为null或为末尾停下】
（快指针走多少之后，慢指针开始走）
（快指针走两步，慢指针走一步）

慢指针所在位置即为所求
```


### 窗口类

#### 扩大左侧窗口
常用：从左到右找相同值，找目标值

例子：去重

基本框架：
```
两指针

【遍历，fast超过范围时停止】
如果fast的值与slow的值相同或等于xx
（交换元素值）
（slow移动）

fast移动

slow所在位置为结果
```


#### 缩小中间窗口
常用：从两侧向中间判断，对称性强

从两侧往中间移动：二分查找，反转数组，回文串判断，二数之和/三数之和

```
两指针

【遍历，左侧大于右侧停止】
左右两侧分别做操作
（有时需要跳过一些数）

返回值
```


#### 滑动窗口
常用：有固定长度或内容的规则

- 基本框架：
```
left right map创建指针和对象
【循环条件是right小于数组长度】
给对象添加信息

【触发窗口条件】（窗口长度，窗口内信息符合要求）

操作窗口信息
移动左指针

移动右指针
```


- 应用场景：
字符串截取

- 例子：
1. 指定固定长度固定规则子串
不需要滑动窗口，只需要遍历每个字符，生成固定窗口然后判断规则
```
let res = 0;
const yuan = ["a", "e", "i", "o", "u"];
function backing(startIndex) {
    if (startIndex > str.length - 5) {
        return;
    }
    let window = new Map();
    let sub = str.substring(startIndex, startIndex + 5);
    for (let j = 0; j < sub.length; j++) {
        const curR = sub[j];
        window.set(curR, window.has(curR) ? window.get(curR) + 1 : 1);
        if (window.get(curR) > 1) {
            break;
        }
    }
    const arr = [...window];
    if (arr.length === 5) {
        const s1 = arr[0][0];
        const s2 = arr[1][0];
        const s3 = arr[2][0];
        const s4 = arr[3][0];
        const s5 = arr[4][0];
        if (
            yuan.indexOf(s1) === -1 &&
            yuan.indexOf(s4) === -1&&
            yuan.includes(s2) &&
            yuan.includes(s3) &&
            yuan.includes(s5)
        ) {
            res += 1;
        }
    }
    backing(startIndex + 1);
}
backing(0);
console.log(res);
```



## 栈

常用于：
- "分散"对称性：一对一对，每对的左侧先放进去，右侧后放，右侧的与左侧的末尾往前的值对应起来！
- 父亲孩子：父亲逐一放进去，找到最后一个父亲的所有孩子，再往前找

### 配对关系——分散对称性

例子：
- 括号匹配

右侧总是试图与【左侧的最后一个位置】（或者说【与离自己最近的一个左侧】）配对

```
function isValid(str) {
    const stack = []
    const map = new Map()
    map.set(')', '(')
    map.set('}', '{')
    map.set(']', '[')

    for (let i = 0; i < str.length; i++) {
        if (['(', '{', '['].includes(str[i])) {
            stack.push(str[i])
        } else {
            // 考虑都是左括号，以及最后一个弹出的左侧和右侧对不上
            if (stack.length === 0 || map.get(str[i]) !== stack.pop()) return false
        }
    }
    if (stack.length === 0) {
        return true
    }
}
```


- 最长括号

栈找最长，关键在于找【满足窗口条件】的左右下标，栈记录下标，符合条件就记录并销毁下标
```
var longestValidParentheses = function(s) {
    const stack = [-1]
    let maxLen = 0
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') {
            stack.push(i)
        } else {
            stack.pop()
            if (stack.length === 0) {
                stack.push(i)
            } else {
                maxLen = Math.max(maxLen, i - stack[stack.length - 1])
            }
        }
    }
    return maxLen
};
```

匹配关系里面，要求右侧与左侧匹配：

- 先存还是先弹出？前者的话存谁？什么时候弹出？
- 先存：要存的是左半类，等待弹出；配对成功的时候弹出，这样就能够找到前后的下标，累积最大值。

（PS：如果当前栈没有东西，说明没有和右半类匹配的，可以存入，如果到时还是右半类，就把上一次右半类的弹出了）



### 上下级关系——因果线性链

见二叉树的迭代遍历

关键：
- 先存还是先弹出？前者的话存谁？什么时候弹出？
- 先弹出：弹出上级，存当前的下级，等待弹出；

