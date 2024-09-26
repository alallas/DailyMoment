let arr = [3, 5, 7, 1, 9, 2, 8, 5, 6, 0]
console.log('before', arr)


// 冒泡排序--n平方--稳定
function bubbleSort(arr) {
  // 外层遍历，每个数都要两两比较
  // 内层遍历，两两比较的长度
  // 优化，如果一个层都不交换，肯定是排好了
  for (let i = 0; i < arr.length; i++) {
    let isDone = true
    for (let j = 0; j < arr.length - i; j++) {
      if (arr[j+1] < arr[j]) {
        isDone = false
        // [arr[j], arr[j+1]] = [arr[j+1], arr[j]]
        let temp = arr[j+1]
        arr[j+1] = arr[j]
        arr[j] = temp
      }
    }
    if (isDone) break
  }
}
// bubbleSort(arr)


// 选择排序--n平方--不稳定
function selectSort(arr) {
  // 外层for循环，每个数字推后面。内层循环找最大值，找到放到当前数组的最后，就是len-i-1
  for (let i = 0; i < arr.length; i++) {
    let maxIndex = 0
    for (let j = 0; j < arr.length - i; j++) {
      if (arr[j] > arr[maxIndex]) {
        maxIndex = j
      }
    }
    let temp = arr[maxIndex]
    arr[maxIndex] = arr[arr.length - 1 - i]
    arr[arr.length - 1 - i] = temp
  }
}
// selectSort(arr)


// 插入排序--n平方--稳定
function insertSort(arr) {
  // 遍历每一个数字，遍历到他的时候，找他前面的所有数字，如果他比前面的数还要小，就往回插入
  for (let i = 0; i < arr.length; i++) {
    let curNum = arr[i]
    let j = i-1
    while(arr[j] > curNum && j >= 0) {
      [arr[j], arr[j+1]] = [arr[j+1], arr[j]]
      j--
    }
    //这个时候cur大于他前面的那个数，要在这个数字的后面
    arr[j+1] = curNum
  }
}
// insertSort(arr)


// 归并排序--nlogn--稳定

// 在头部收集结果，一层一层return返回,在后序的位置合并左右结果
function merge(arr1, arr2) {
  let point1 = 0, point2 = 0;
  let temp = []
  while (point1 < arr1.length && point2 < arr2.length) {
    if (arr1[point1] > arr2[point2]) {
      temp.push(arr2[point2])
      point2++
    } else {
      temp.push(arr1[point1])
      point1++
    }
  }
  if (point1 < arr1.length) {
    temp.push(...arr1.slice(point1))
  }
  if (point2 < arr2.length) {
    temp.push(...arr2.slice(point2))
  }
  return temp
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = arr.slice(0, mid)
  const right = arr.slice(mid)
  
  const leftRes = mergeSort(left)
  const rightRes = mergeSort(right)

  return merge(leftRes, rightRes)
  
}
// arr = mergeSort(arr)


// 快速排序--nlogn---不稳定（最坏是n平方）
// 在底层收集结果，改变数组，首先通过找基准值，然后小放左边，大放右边，然后从上往下，更新左右指针，
function findBaseIndex(arr, left, right) {
  const base = arr[left]
  while(left < right && left < arr.length && right >= 0) {
    while(arr[right] >= base && left < right) {
      right--
    }
    // 这个时候，right的数值比base小，左指针为一个坑
    arr[left] = arr[right]
    while(arr[left] <= base && left < right) {
      left++
    }
    arr[right] = arr[left]
  }
  arr[left] = base
  return left
}


function fastSort(arr, left, right) {
  if (left >= right) return

  const baseIndex = findBaseIndex(arr, left, right)

  fastSort(arr, left, baseIndex - 1)
  fastSort(arr, baseIndex + 1, right)
}

fastSort(arr, 0, arr.length - 1)



// 堆排序--nlogn--不稳定
// 找到所有父节点，维护大顶堆，然后遍历所有元素拿出最大的那个值，给到数组的末尾，然后更新数组的长度，

function heapify(arr, len, curIndex) {
  let parentIndex = curIndex
  const leftIndex = curIndex * 2 + 1
  const rightIndex = curIndex * 2 + 2

  if (arr[leftIndex] > arr[parentIndex] && leftIndex < len) {
    parentIndex = leftIndex
  }
  if (arr[rightIndex] > arr[parentIndex] && rightIndex < len) {
    parentIndex = rightIndex
  }
  if (parentIndex !== curIndex) {
    [arr[curIndex], arr[parentIndex]] = [arr[parentIndex], arr[curIndex]]
    heapify(arr, len, parentIndex)
  }
}

function heapSort(arr) {
  const len = arr.length
  for (let i = Math.floor(len / 2) - 1; i >= 0; i--) {
    heapify(arr, len, i)
  }
  for (let j = arr.length - 1; j >= 0; j--) {
    [arr[0], arr[j]] = [arr[j], arr[0]]
    heapify(arr, j, 0)
  }
}

// arr = heapSort(arr)












console.log('after', arr)