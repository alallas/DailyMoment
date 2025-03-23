import Koa from "Koa";
import koaStatic from "koa-static";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { renderRoutes, matchRoutes } from "react-router-config";

import Routes from "./routes";
import createServerStore from "./store";
 
const app = new Koa();

app.use(koaStatic("public"));

app.use(async (ctx) => {

  // 匹配当前路由
  const matchArr = matchRoutes(Routes, ctx.request.path);

  // 准备异步函数合集
  let promiseArr = [];
  const store = createServerStore();

  matchArr.forEach((item) => {
    if (item.route.loadData) {
      // 将store透传过去，item.route.loadData() 返回的是一个promise
      promiseArr.push(item.route.loadData(store));
    }
  });

  // 等待异步执行
  await Promise.all(promiseArr);


  // 初始化context变量，存放css，透传到各个子路由
  let context = { css: [] };

  const content = renderToString(
    <Provider store={ store }>
      <StaticRouter location={ ctx.request.path } context={ context }>
        <div>{ renderRoutes(Routes) }</div>
      </StaticRouter>
    </Provider>
  );

  ctx.body = `
    <html>
      <head>
        <title>ssr</title>
        <style>${context.css.join("\n")}</style>
      </head>

      <body>
        <div id="root">${content}</div>

        <script>
          window.context = {
            state: ${JSON.stringify(store.getState())}
          }
        </script>

        <script src="./index.js"></script>
      </body>
    </html>
  `;

});


app.listen(3002, () => {
  console.log("listen:3002");
});