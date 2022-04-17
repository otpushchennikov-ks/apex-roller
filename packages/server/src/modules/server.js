"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollerWebSocketServer = void 0;
var PathReporter_1 = require("io-ts/lib/PathReporter");
var Either_1 = require("fp-ts/lib/Either");
var shared_1 = require("@packages/shared");
var logger_1 = __importDefault(require("./logger"));
var logger = (0, logger_1.default)('ws');
function RollerWebSocketServer(server, options, handlers) {
    var potentialReconnects = new Map();
    server.on('connection', function (connection, request) {
        var context = { isAlive: true, lastPong: Date.now() };
        var disconnect = function () {
            logger.info("closing connection to ".concat(request.socket.remoteAddress));
            if (heartbeat) {
                clearInterval(heartbeat);
            }
            context.isAlive = false;
            var userId = context.userId;
            if (userId) {
                var timeoutHandle = setTimeout(function () {
                    potentialReconnects.delete(userId + context.roomId);
                    handlers.onDisconnect(context);
                }, options.reconnectTimeout);
                potentialReconnects.set(userId + context.roomId, timeoutHandle);
            }
        };
        var heartbeat = setInterval(function () {
            if ((Date.now() - context.lastPong) > options.heartbeatTimeout) {
                disconnect();
            }
            else {
                connection.ping();
            }
        }, 20000);
        connection.on('message', function (data) {
            var _a, _b;
            var maybeMessage = shared_1.MessageCodec.decode(data.toString());
            if ((0, Either_1.isLeft)(maybeMessage)) {
                logger.error(PathReporter_1.PathReporter.report(maybeMessage));
                return;
            }
            var message = maybeMessage.right;
            logger.info("".concat((_a = context.userId) !== null && _a !== void 0 ? _a : request.socket.remoteAddress, " -> ").concat(data.toString()));
            var response;
            switch (message.eventType) {
                case 'connect': {
                    var reconnectTimeoutHandle = potentialReconnects.get(message.userId + message.roomId);
                    if (reconnectTimeoutHandle) {
                        clearTimeout(reconnectTimeoutHandle);
                        logger.info("user ".concat(message.userId, " is reconnecting to room ").concat(message.roomId));
                    }
                    response = handlers.onConnect(message, context, connection);
                    break;
                }
                case 'update': {
                    response = handlers.onUpdate(message, context, connection);
                    break;
                }
                default:
                    break;
            }
            if (response) {
                var serializedResponse = shared_1.MessageCodec.encode(response);
                connection.send(serializedResponse);
                logger.info("".concat((_b = context.userId) !== null && _b !== void 0 ? _b : request.socket.remoteAddress, " <- ").concat(serializedResponse));
            }
        });
        connection.on('pong', function () { return context.lastPong = Date.now(); });
        connection.on('close', disconnect);
    });
    return server;
}
exports.RollerWebSocketServer = RollerWebSocketServer;
