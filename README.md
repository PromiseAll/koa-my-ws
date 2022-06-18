# koa-my-ws

基于 koa2 简单封装 websocket,集成心跳检测,广播消息等功能

### 安裝

```bash
npm i koa-my-ws
```

### 基本使用

```js
const Koa = require("koa");
const Router = require("koa-router");
const app = new Koa();
const { createWsServer, upgradeWs, broadcastClient } = require("koa-my-ws");
// 创建ws服务，设置心跳检测时间
app.use(createWsServer({ checkTime: 3000 }));

const router = new Router();
router.get("/ws/:id", async (ctx, next) => {
  const { id } = ctx.query;
  // 升级协议 返回当前ws对象
  let ws = await upgradeWs(ctx, id);
  if (ws) {
    ws.on("message", data => {
      console.log(data);
    });
  }
  next();
});

app.use(router.routes());
app.listen(3000);
```

### 内置方法

#### createWsServer([wsOptions])

创建一个 websocket 服务，返回一个中间件

- wsOptions(可选) 配置选项
  - heartbeat 是否开启心跳检测 默认 true
  - checkTime 检测心跳轮询时间 默认 30 秒 单位 毫秒
  - ...options 合并 ws 的基本配置 参考 api [options](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketaddress-protocols-options)

#### upgradeWs(ctx[,clientId][,state])

升级协议，返回当前 ws 客户端

- ctx 上下文
- clientId(可选) 指定连接的唯一 建议用户 id 或者 token 等建立关联
- state(可选) 自定义数据 挂载在 ws 对象上方便后续可能使用

#### broadcastClient(data[,clientId])

发送广播消息,可选指定 clientId 发送

- data 消息内容
- clientId(可选) 指定 id

#### getClients([clientId])

根据 clientId 获取客户端 返回数组

- clientId(可选) 唯一 id 不传则返回全部

#### getClientNumber()

获取当前已连接客户端数量
