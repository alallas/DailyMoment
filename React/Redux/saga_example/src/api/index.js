function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("i am data!");
    }, 2000);
  }).then((res) => {
    console.log('2 time', new Date().getSeconds());
    console.log("fetchData API 拿到了结果", res);
    return res;
  });
}

export { fetchData };
