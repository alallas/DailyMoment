function fetchData() {
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('i am data!')
    }, 2000)
  }).then(res => {
    console.log(res)
    return res
  })
}



export {
  fetchData
}