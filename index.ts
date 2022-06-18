const Websocket = require("koa-easy-ws");

interface wsOptions {
  heartbeat?: boolean;
  checkTime?: number;
}

let myServer: any;
function createWsServer(wsOptions: wsOptions = {}): any {
  const wsServer = Websocket("ws", {
    wsOptions: {
      ...wsOptions,
      clientTracking: true,
    },
  });
  // 是否心跳
  let heartbeat = wsOptions.heartbeat ?? true;
  // 心跳时间
  let checkTime = wsOptions.checkTime ?? 30000;

  if (heartbeat) {
    setInterval(() => {
      wsServer.server.clients.forEach((ws: any) => {
        ws.ping((err: any) => {
          if (err) wsServer.server.clients.delete(ws);
        });
      });
    }, checkTime);
  }
  myServer = wsServer;
  return wsServer;
}

/**
 * @description:升级协议
 * @param {any} ctx ctx
 * @param {string} clientId 唯一id
 * @param {object} state 保存在client上的数据
 * @return {*} ws
 */
const upgradeWs = async (ctx: any, clientId: string, state: object = {}) => {
  let ws;
  if (ctx.ws) {
    ws = await ctx.ws();
    ws.clientId = clientId;
    ws.state = state;
  }
  return ws;
};

/**
 * @description: 广播消息
 * @param {any} data 数据
 * @param {string} clientId 唯一id
 */
const broadcastClient = (data: any, clientId?: string) => {
  getClients(clientId).forEach((ws: any) => {
    ws.send(data);
  });
};

/**
 * @description: 获取客户端
 * @param {string} clientId 唯一id
 * @return {clients} clients
 */
const getClients = (clientId?: string) => {
  let clients;
  if (clientId) {
    clients = Array.from(myServer.server.clients).filter((ws: any) => ws.clientId == clientId);
  } else {
    clients = Array.from(myServer.server.clients);
  }
  return clients;
};

/**
 * @description: 获取当前客户端数量
 * @return {number}
 */
const getClientNumber = (): number => {
  return myServer.server.clients.size;
};

module.exports = {
  createWsServer,
  upgradeWs,
  getClients,
  getClientNumber,
  broadcastClient,
};
