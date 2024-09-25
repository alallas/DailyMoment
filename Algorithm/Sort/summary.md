
### 冒泡排序
基本框架：
```
【遍历每个数字】
【遍历“单个数字”两两比较次数】（之前处理过的数字不用遍历）

两两交换位置（把最大的往后移动）
```

写法：
```
// 对于整个数组来说，每一个数字都要比较
//（其实这里可以<len-1,因为比剩最后一个数字肯定位置是对的）下同
for (let i = 0; i < arr.length; i++) {
    // 对于一个数字来说，两两比较
    // 因为越往后，比过的数值位置都固定了，就不需要和他们比较
    for (let j = 0; j < arr.length - i; j++) {
        if (arr[j] > arr[j+1]) {
            temp = arr[j]
            arr[j] = arr[j+1]
            arr[j+1] = temp
        }
    }
}
```
优化：
如果一个数字在与其他任何一个数比较的过程中都没有发生移动，说明整个数组已经排序好了
```
// 对于整个数组来说，每一个数字都要比较
//（其实这里可以<len-1,因为比剩最后一个数字肯定位置是对的）下同
for (let i = 0; i < arr.length; i++) {
    // 对于一个数字来说，这个数与剩余的其他数进行比较
    // 因为越往后，比过的数值位置都固定了，就不需要和他们比较
    let isOk = true
    for (let j = 0; j < arr.length - i; j++) {
        if (arr[j] > arr[j+1]) {
            isOk = false
            temp = arr[j]
            arr[j] = arr[j+1]
            arr[j+1] = temp
        }
    }
    if (isOk) break
}
```


### 选择排序

基本框架：
```
【遍历数组每个数字】
【遍历当前没处理过的数组长度】

找到最大值Index（更新覆盖）

交换最大Index的值与当前末尾数字（把最大的往后移动）
```

写法：
```
for (let i = 0; i < arr.length; i++) {
    let maxIndex = 0
    for (let j = 0; j < arr.length - i; j++) {
        if (arr[j] > arr[maxIndex]) {
            maxIndex = j
        }
    }
    [arr[maxIndex], arr[arr.length - 1 - i]] = [arr[arr.length - 1 - i], arr[maxIndex]]
}
```


### 插入排序

基础框架：
```
【遍历数组每个数字】
拿到当前的数

【遍历这个数字之前的所有数字】（遇到对的位置停下）
当前数往后移动一位

在当前位置插入这个数字
```

写法：
```
// 对于整个数组来说，每一个数字都要比较
for (let i = 0; i < arr.length; i++) {
    // 记录当前的这个数，且搞一个指针
    let cur = arr[i]
    let j = i - 1
    // 遍历这个数之前的所有数，找到合适的插入位置
    while(arr[j] > cur && j >= 0) {
        arr[j+1] = arr[j]
        j--
    }
    // 插入这个数
    arr[j+1] = cur
}
```


### 归并排序

基本框架：
```
利用了【return值向上覆盖的特点】，先指针探到最深处，然后向上返回值，然后利用返回的值做操作，再向上返回
- 递归拆分函数
if arr.len为1，终止条件，return 本身

差分数组为左右两半

递归左数组， 拿到return值
递归右数组，拿到return值

合并两个return值，拿到结果
return结果


- 合并函数
两个指针，一个新temp数组

【遍历两个指针都在数组范围内】（任何一个出数组表示结束）
谁小谁移动

合并剩下的数组
返回合并之后的数组
```

写法：
```
// 对于整个数组来说，拆分函数（递归函数）二分拆分法（每次折半分到最小只剩一个数字的数组）
function mergeSort(arr) {
    if (arr.length <= 1) return arr

    const mid = Math.floor(arr.length / 2)
    const left = arr.slice(0, mid)
    const right = arr.slice(mid)

    // 一是每次拆到最小 return arr
    // 二是记录下合并之后的数组，继续往上合并 return merge(leftSorted, rightSorted)
    const leftSorted = mergeSort(left)
    const rightSorted = mergeSort(right)
    return merge(leftSorted, rightSorted)
}

// 对于两个单元数组来说，合并函数（双链表合并为单链表，双指针技术）
function merge(left, right) {
    // 需要一个temp额外记录，典型的空间换时间
    const temp = []
    let leftIndex = 0
    let rightIndex = 0

    // 只有两个数组的指针都在数组内才比较，不然说明有一个指针已经走完他的数组了
    while(leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex] < right[rightIndex]) {
            temp.push(left[leftIndex])
            leftIndex++
        } else {
            temp.push(right[rightIndex])
            rightIndex++
        }
    }

    // 把其中一个剩下的数合并到temp的最后面
    if (leftIndex < left.length) {
        temp.push(...left.slice(leftIndex))
    }
    if (rightIndex < right.length) {
        temp.push(...right.slice(rightIndex))
    }
    return temp
}
```


### 快速排序

基本框架：
```
- 递归拆分数组
if left大于等于right 终止条件

拿到此时这个left和right包裹的数组的base值的Index

左数组递归
右数组递归


- 找基准Index
拿到基准值

【遍历left小于right】

【遍历右比base值小或等于，停下】（注意left要小于right）（注意要加上【或等于】）
值给到“停下来的”左
【遍历左比base值大或等于，停下】（注意left要小于right）（注意要加上【或等于】）
值给到“停下来的”右

最后左右肯定相同，把base值给到这个位置
return 基准值
```

写法：
```
// 对于一个单元数组来说，双指针移动到分割点，途中交换值的位置（指针指向坑的不动，另一个动）
function findBaseIndex(arr, left, right) {
    const base = arr[left]
    while(left < right && left <= arr.length - 1 && right >= 0) {

        // 循环到右边第一个居然比base小的数，就停下来（注意要加上【或等于】，防止漏了一种情况）
        while(arr[right] >= base && left < right) {
            right--
        }
        // 到这一步把right的值放到left上面，right可以保证为一个坑
        arr[left] = arr[right]

        // 循环到左边第一个居然比base大的数，就停下来（注意要加上【或等于】，防止漏了一种情况）
        while(arr[left] <= base && left < right) {
            left++
        }
        // 到这一步把left的值放到right上面，left可以保证为一个坑
        arr[right] = arr[left]
    }

    // 这里left和right一样，都是一个坑，把基准值填入
    arr[left] = base

    // 这个时候的left和right都指向的是base所在的Index，也就是分割点
    // 下一次递归应该使用0到这个点的前一位，和这个点的后一位
    return left
}

// 对于整个数组来说，拆分递归，拿到分割点拆分数组（表现为越来越短的left和right）
function quickSort(arr, left, right) {
    // 终止条件是left大于等于right，因为baseIndex不能一直减或加一
    if (left >= right) return
    const baseIndex = findBaseIndex(arr, left, right)

    //递归使用0到baseIndex的前一位，和baseIndex的后一位
    quickSort(arr, left, baseIndex - 1)
    quickSort(arr, baseIndex + 1, right)
}
```


### 堆排序

基本框架：

```
- 维护单个大顶堆及其后代大顶堆（三人家庭地位及其后代家庭地位）
暂定父亲i的值最大，记录此时的largest
左孩子右孩子index分别2i+1, 2i+2

如果左右孩子大于父亲，接续更新largest

如果largest被改过，说明要移动largest的值到i上
继续调用自己递归，此时入参的父节点的Index为largest（后代：要么左孩子要么右孩子）
（这里必须用递归，因为函数的定义是维护此刻及其后代的大顶堆）


- 拿顶排序
【遍历一半以前的父节点】
构造大顶堆

【遍历数组每个数字】
首末元素交换
从首开始重新维护大顶堆（因为把末元素放到首位置了）
```

写法：
```
// 维护大顶堆的性质（维护单簇大顶堆的性质，必要的时候才会继续向下递归）
// len为当前需要维护的数组的长度，i为当前所在的父亲节点Index
function heapify(arr, len, i) {
    // 记录当前的父节点的下标值，等会用来被更新
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2

    if (left < len && arr[left] > arr[largest]) {
        largest = left
    }
    if (right < len && arr[right] > arr[largest]) {
        largest = right
    }

    // largest只是一个下标，永远指向一个数字
    // 这里交换父节点只是交换数值，largest下标永远都是指向左右节点中的某个
    // 所以递归的时候就用largest来递归，因为largest所在位置的节点数值变化了
    // len不变，因为这是针对一个树做维护

    // 递归的终止条件是largest发生了变化，不然不需要递归维护
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]]
        heapify(arr, len, largest)
    }
}


function heapSort(arr) {
    const len = arr.length

    // 构建大顶堆
    // 从最后一个非叶子节点开始，一半数组的末尾Index，往上遍历，维护以上的单簇树的大顶堆性质
    for (let i = Math.floor(len / 2) - 1; i >= 0; i--) {
        heapify(arr, len, i)
    }

    // 收集最大值放到末尾
    // 遍历所有数字，拿到大顶堆最顶的元素arr[0]，放入当前数组末尾arr[i]位置
    for (let i = len - 1; i >= 0; i--) {
        [arr[i], arr[0]] = [arr[0], arr[i]]

        // 然后再维护堆，数组少了一个数，把剩下的i传入
        // 因为最顶端的数值被改变了，从最顶端的父亲节点开始维护
        heapify(arr, i, 0)
    }
    return arr
}
```

