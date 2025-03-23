const path = require("path");
const resolve = (dir) => path.resolve(__dirname, "./src", dir);


module.exports = {
  mode: "development",

  entry: "./client.js",

  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "public"),
  },

  module: {
    rules: [
      {
        test: /\.css?$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      }
      // babel-loader处理js的一些配置
    ],
  },

};