// ! ******以less和css和style以及url的loader做例子，查看导出后的结果是如何进行执行的


// ****第一种情况是less和css和style的loader都没有pitch函数，正常按顺序执行normal函数
// ! 大对象
var __webpack_modules__ = {
  "./src/index.less":
  (module, __unused_webpack_exports, __webpack_require__) => {
    let style = document.createElement("style");
    style.innerHTML =
      `` + __webpack_require__("./src/global.css") +
      `\r\n#root {\n  color: red;\n}\n.avatar2 {\n  width: 300px;\n  height: 200px;\n  background-image: url('` +
      __webpack_require__("./src/test.jpg")["default"] +
      `');\n}\n`;
    document.head.appendChild(style);
    module.exports = style.innerHTML;
  },

  "./src/global.css":
  (module) => {
    let style = document.createElement("style");
    style.innerHTML = `\r\nbody {\r\n  background-color: gray;\r\n}\r\n\r\n\r\ndiv {\r\n  border: 1px solid black;\r\n}\r\n\r\n`;
    document.head.appendChild(style);
    module.exports = style.innerHTML;
  },

  "./src/test.jpg":
  (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
      default: () => __WEBPACK_DEFAULT_EXPORT__,
    });
    const __WEBPACK_DEFAULT_EXPORT__ =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gAXR2VuZXJhdGVkIGJ5IFNuaXBhc3Rl/9sAQwAKBwcIBwYKCAgICwoKCw4YEA4NDQ4dFRYRGCMfJSQiHyIhJis3LyYpNCkhIjBBMTQ5Oz4+PiUuRElDPEg3PT47/8AACwgAQgB1AQERAP/EANIAAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKCxAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oACAEBAAA/APZqKKKytW/4/LT/AHX/AJrVy3+4KsDpS0UUUUUUUUUUVkawwW8tMnHyv/Nat280ewfN+lWBNHj736UedH/e/Sjzo/736UedH/e/Sjzo/wC9+lHnR/3v0o86P+9+lHnR/wB79KPOj/vfpUlFFFZeqjN7af7r/wA1q5APkFT0tFFFFFFFcf8A23pX/Qy23/gwH/xVH9t6V/0Mtt/4MB/8VR/belf9DLbf+DAf/FUDW9K/6GW2/wDBiP8A4qpItZ0MSq8niCycqMAvfK2Pzb2rTj8TeHlXH9u6b/4Fx/41J/wlHh7/AKD2m/8AgXH/AI0f8JR4e/6D2m/+Bcf+NH/CUeHv+g9pv/gXH/jR/wAJR4e/6D2m/wDgXH/jR/wlHh7/AKD2m/8AgXH/AI0f8JR4e/6D2m/+Bcf+NH/CUeHv+g9pv/gXH/jR/wAJR4e/6D2m/wDgXH/jR/wlHh7/AKD2m/8AgXH/AI1864FGBRgUYFLgUYoxRijFGKMUYoxRijFGaM0ZozRmjNGaM0ZozRmjNGaM0ZpKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK/9k=";
  },
};

// ! 入口处
(() => {
  __webpack_require__("./src/index.less");
})();




// ****第二种情况是style-loader有pitch函数且有返回值，只按顺序执行了less和css的loader的normal函数
// ! 大对象
var __webpack_modules__ = {
  "./loaders/css-loader2.js!./loaders/less-loader2.js!./src/index.less": (module, __unused_webpack_exports, __webpack_require__) => {
    module.exports =
      `` + __webpack_require__("./loaders/css-loader2.js!./src/global.css") +
      `#root {
        color: red;
      }
      .avatar2 {
        width: 300px;
        height: 200px;
        background-image: url('` + __webpack_require__("./src/test.jpg")["default"] + `'); 
      }
    `;
  },

  "./loaders/css-loader2.js!./src/global.css": (module) => {
    module.exports = `
      body {
        background-color: gray;
      }
      div {
        border: 1px solid black;
      }
    `;
  },

  "./src/index.less": (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
    let style = document.createElement("style");
    style.innerHTML = __webpack_require__("./loaders/css-loader2.js!./loaders/less-loader2.js!./src/index.less");
    document.head.appendChild(style);
  },

  "./src/test.jpg": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
      default: () => __WEBPACK_DEFAULT_EXPORT__,
    });
    const __WEBPACK_DEFAULT_EXPORT__ =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gAXR2VuZXJhdGVkIGJ5IFNuaXBhc3Rl/9sAQwAKBwcIBwYKCAgICwoKCw4YEA4NDQ4dFRYRGCMfJSQiHyIhJis3LyYpNCkhIjBBMTQ5Oz4+PiUuRElDPEg3PT47/8AACwgAQgB1AQERAP/EANIAAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKCxAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oACAEBAAA/APZqKKKytW/4/LT/AHX/AJrVy3+4KsDpS0UUUUUUUUUUVkawwW8tMnHyv/Nat280ewfN+lWBNHj736UedH/e/Sjzo/736UedH/e/Sjzo/wC9+lHnR/3v0o86P+9+lHnR/wB79KPOj/vfpUlFFFZeqjN7af7r/wA1q5APkFT0tFFFFFFFcf8A23pX/Qy23/gwH/xVH9t6V/0Mtt/4MB/8VR/belf9DLbf+DAf/FUDW9K/6GW2/wDBiP8A4qpItZ0MSq8niCycqMAvfK2Pzb2rTj8TeHlXH9u6b/4Fx/41J/wlHh7/AKD2m/8AgXH/AI0f8JR4e/6D2m/+Bcf+NH/CUeHv+g9pv/gXH/jR/wAJR4e/6D2m/wDgXH/jR/wlHh7/AKD2m/8AgXH/AI0f8JR4e/6D2m/+Bcf+NH/CUeHv+g9pv/gXH/jR/wAJR4e/6D2m/wDgXH/jR/wlHh7/AKD2m/8AgXH/AI1864FGBRgUYFLgUYoxRijFGKMUYoxRijFGaM0ZozRmjNGaM0ZozRmjNGaM0ZpKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK/9k=";
  },
};

// ! 入口处
(() => {
  __webpack_require__("./src/index.less");
})();

