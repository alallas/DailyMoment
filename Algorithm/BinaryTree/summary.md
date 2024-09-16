
## 几种情况：
- 树本身：
四种遍历顺序
树上节点的数学运算与增删改查

- 树与其他生物的交流：
数组变树

### 四种遍历顺序
#### 层序遍历
队列里面放的是节点而不是节点的值！
基本框架：
```
queue，res 新建队列，结果容器

【遍历，队列不为空】
记录当时队列长度，新建单层数组path

【遍历单层内数量】
队列取数存入path数组
当前数的左右孩子放入队列

单层数组存入res
```

```
var levelOrder = function(root) {
    if (root === null) return []
    let queue = [root]
    const res = []

    while (queue.length > 0) {
        let len = queue.length
        let path = []
        for (let i = 0; i < len; i++) {
            const node = queue.shift()
            path.push(node.val)
            node.left && queue.push(node.left)
            node.right && queue.push(node.right)
        }
        res.push(path)
    }
    console.log(res)
    return res
};
```

#### 迭代遍历
栈里面放的是节点而不是节点的值！
基本框架：

前序和后序：
```
前序栈：先放右，再放左，中-左-右
后序栈：先放左，再放右，中-右-左，再翻转变：左-右-中
stack，res 新建栈和结果容器

【遍历，栈不为空】
拿出栈底元素存入res数组（消灭栈底元素）

分别推入右和左元素
```

为什么用栈？
实现深度优先遍历，把其中一个元素及其下面所有层的子元素处理完，才执行下一个元素及其内部层次

```
var preorderTraversal = function(root) {
    if (root === null) return []
    let stack = [root], res = []
    while (stack.length > 0) {
        const node = stack.pop()
        res.push(node.val)
        node.right && stack.push(node.right)
        node.left && stack.push(node.left)
    }
    console.log(res)
    return res
};
```

中序：
```
通过指针遍历到底部然后pop回弹的方式处理【左中右】
stack，res 新建栈和结果容器
point 新建指针

【遍历，栈不为空或指针不为空】
@指针存在：（有效值）
放入栈，更新指针到左孩子

@指针不存在：（此时栈末尾为叶子节点或其父节点）
更新指针为栈末尾，删除拿出栈末尾存入res，指针更新到叶子节点的右孩子
```

其中：
更新指针为栈末尾，删除拿出栈末尾存入res
这两步很重要，把叶子节点或上级父节点（中节点）从树里面删除，使得栈底部可以回退触达到上一个中节点

```
var inorderTraversal = function(root) {
    if (root === null) return []
    let stack = [], res = []
    let point = root
    while (stack.length || point) {
        if (point) {
            stack.push(point)
            point = point.left
        } else {
            point = stack.pop()
            res.push(point.val)
            point = point.right
        }
    }
    return res
};
```

#### 递归遍历
```
let res = []
function back(root) {
    if (root === null) return
    
    // 前序
    res.push(root.val)
    back(root.left)
    back(root.right)
    
    // 中序
    back(root.left)
    res.push(root.val)
    back(root.right)
    
    // 后序
    back(root.left)
    back(root.right)
    res.push(root.val)

}
back(root)
return res
```

### 树上节点的数学运算与增删改查
递归 = 进入下一层

基本框架：
记录的变量一直跟随层的变化而变化，一层只有一个变量，各层互不干扰
#### 写法一：（从下至上）利用返回值
常用于：要求计算【树】的某些属性，找“上面”的节点，增删改查（bec要求返回root）
例子：二叉树最大最小深度/最近公共祖先/二叉搜索树的插入、删除与修剪
```
if null 终止条件

左侧递归，拿到return值（更新左孩子）
右侧递归，拿到return值（更新右孩子）

当前层 = 左右两侧最大深度 + 1（当前层）

return当前层高度
```

#### 写法二：（从上至下）利用入参
常用于：要求输出【树】的节点路径，找“下面”的节点
例子：二叉树的路径/找左下角的值/左叶子之和
```
if l&r null（叶子节点）终止条件
记录此时的层数，覆盖最大层数

左递归，入参层数+1
右递归，入参层数+1

拿到最大层数
```

记录的变量一直跟随节点的变化而变化，变量游窜在各层中
#### 写法三：（从下至上 OR 从上至下）利用游窜 变量
常用于：需要全局统计的值（不是节点）
例子：找树的众数/任意两节点最小绝对值
```
if null 终止条件

拿到preNode操作
（更新当前节点为preNode）——>前中后序位置皆可

递归左节点
递归右节点

拿到操作结果
```


- 利用返回值一个比较厉害的例子：找最近公共祖先
（绿色部分）利用return目标节点或null，往上覆盖结果，最终肯定能够同时出现在左右节点的return值上，此时root为答案
```
var lowestCommonAncestor = function(root, p, q) {
    function back(root) {
        if (root === null || root === p || root === q) return root
        const left = back(root.left)
        const right = back(root.right)

        if (left === null && right === null) {
            return null
        } else if (left === null && right !== null) {
            return right
        } else if (left !== null && right === null) {
            return left
        } else if (left !== null && right !== null) {
            return root
        }
    }
    return back(root)
};
```

- 利用入参一个比较厉害的例子：验证搜索树
（绿色部分）利用搜索树的特征，左节点小于中节点，右节点大于中节点
```
// 写法一
var isValidBST = function (root) {
  function er(root, max, min) {
    if (root === null) return true;
    const l = er(root.left, root.val, min);
    const r = er(root.right, max, root.val);
    if (root.val >= max || root.val <= min) {return false}
    return l && r;
  }
  return er(root, Infinity, -Infinity)
};

// 写法二（游窜变量）
let pre = null;
var isValidBST = function (root) {
    let pre = null;
    const inOrder = (root) => {
        if (root === null) return true;
        let left = inOrder(root.left);
        
        if (pre !== null && pre.val >= root.val) return false;
        pre = root;
        
        let right = inOrder(root.right);
        return left && right;
    }
    return inOrder(root);
};
```

- 游窜变量一个比较厉害的例子：拿搜索树的众数
（绿色部分）利用搜索树的特征，众数肯定相邻分布，只计算相邻的众数的数量
```
var findMode = function(root) {
  let maxCount = -Infinity, count = 0, res = [], pre = null;
  function er(root) {
    if (root === null) return;
    er(root.left);
    if (pre === null) {
      count = 1;
    }
    if (pre === root.val) {
      count ++;
    } else {
      count = 1;
    }
    pre = root.val;
    if(count === maxCount) {
      res.push(root.val);
    }
    if(count > maxCount) {
      maxCount = count;
      res = [];
      res.push(root.val);
    }
    er(root.right);
  }
  er(root);
  return res;
};
```


PS：比较难的增删改查的思路：（【返回值】额外的例子）
利用返回值，分4种情况return新的自己及后代，覆盖上一层原有的左或者右孩子
- 删除：当前节点变为右孩子的最左节点 + 删除右孩子的最左节点
- 插入：遍历到末尾时，把null变为新节点
- 修剪：直接忽略当前，把当前的下一层返回给上一层（孙给爸）

基本框架：
```
if null 终止条件

如果找到目标值
分4类-->操作

如果小于或大于
分别覆盖右孩子和左孩子

返回当前节点
```

删除：
```
function findZuoNode(root) {
  while(root.left) {
    root = root.left
  }
  return root;
}
var deleteNode = function(root, key) {
  if (root === null) {
    return null;
  }
  if (root.val === key) {
    if (root.left && root.right) {
      const min = findZuoNode(root.right);
      root.val = min.val;
      root.right = deleteNode(root.right, min.val)
      return root
    } else if (root.left && !root.right) {
      return root.left;
    } else if (root.right && !root.left) {
      return root.right;
    } else {
      return null;
    }
  } else if (root.val > key) {
    root.left =  deleteNode(root.left, key);
  } else {
    root.right = deleteNode(root.right, key);
  }
  return root
};
```

插入：
```
var insertIntoBST = function(root, val) {
  if (root === null) {
    let root = new TreeNode(val);
    return root
  }
  if(root.val > val) {
    root.left = insertIntoBST(root.left, val);
  } else if (root.val < val) {
    root.right = insertIntoBST(root.right, val);
  }
  return root;
};
```

修剪：
```
var trimBST = function(root, low, high) {
  if (root === null) {
    return null;
  }
  if (root.val < low) {
    return trimBST(root.right, low, high);
  }
  if (root.val > high) {
    return trimBST(root.left, low, high);
  }
  root.left = trimBST(root.left, low, high);
  root.right = trimBST(root.right, low, high);
  return root;
};
```


### 数组变树
使用return的写法（节点的增删改查），用下一层及其后代更新上一层的左或者右

基本框架：
```
if 数组.len 为空 终止条件

弹出后序数组的中节点
找中序遍历的index

OR（找搜索树中间节点mid）

截断数组，遍历root.left
截断数组，遍历root.right

返回root
```

例子：根据中序和后序数组构造树
```
var buildTree = function(inorder, postorder) {
    if (inorder.length <= 0) return null
    const mid = postorder.pop()
    const index = inorder.indexOf(mid)

    const root = new TreeNode(mid)

    root.left = buildTree(inorder.slice(0, index), postorder.slice(0, index))
    root.right = buildTree(inorder.slice(index + 1), postorder.slice(index))

    return root
};
```

