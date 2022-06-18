"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Websocket = require("koa-easy-ws");
let myServer;
function createWsServer(wsOptions = {}) {
    var _a, _b;
    const wsServer = Websocket("ws", {
        wsOptions: Object.assign(Object.assign({}, wsOptions), { clientTracking: true }),
    });
    // 是否心跳
    let heartbeat = (_a = wsOptions.heartbeat) !== null && _a !== void 0 ? _a : true;
    // 心跳时间
    let checkTime = (_b = wsOptions.checkTime) !== null && _b !== void 0 ? _b : 30000;
    if (heartbeat) {
        setInterval(() => {
            wsServer.server.clients.forEach((ws) => {
                ws.ping((err) => {
                    if (err)
                        wsServer.server.clients.delete(ws);
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
const upgradeWs = (ctx, clientId, state = {}) => __awaiter(void 0, void 0, void 0, function* () {
    let ws;
    if (ctx.ws) {
        ws = yield ctx.ws();
        ws.clientId = clientId;
        ws.state = state;
    }
    return ws;
});
/**
 * @description: 广播消息
 * @param {any} data 数据
 * @param {string} clientId 唯一id
 */
const broadcastClient = (data, clientId) => {
    getClients(clientId).forEach((ws) => {
        ws.send(data);
    });
};
/**
 * @description: 获取客户端
 * @param {string} clientId 唯一id
 * @return {clients} clients
 */
const getClients = (clientId) => {
    let clients;
    if (clientId) {
        clients = Array.from(myServer.server.clients).filter((ws) => ws.clientId == clientId);
    }
    else {
        clients = Array.from(myServer.server.clients);
    }
    return clients;
};
/**
 * @description: 获取当前客户端数量
 * @return {number}
 */
const getClientNumber = () => {
    return myServer.server.clients.size;
};
module.exports = {
    createWsServer,
    upgradeWs,
    getClients,
    getClientNumber,
    broadcastClient,
};
