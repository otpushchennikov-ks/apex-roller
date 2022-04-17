"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var express_1 = __importDefault(require("express"));
var ws_1 = require("ws");
var room_1 = require("./modules/room");
var server_1 = require("./modules/server");
var Either_1 = require("fp-ts/lib/Either");
var shared_1 = require("@packages/shared");
var cors_1 = __importDefault(require("cors"));
var logger_1 = __importDefault(require("./modules/logger"));
var PORT = process.env.PORT || 5001;
var CLIENT_BUILD_PATH = path_1.default.join(__dirname, '..', '..', 'client', 'build');
var logger = (0, logger_1.default)('root');
var httpServer = (0, express_1.default)()
    .use((0, cors_1.default)())
    .use(express_1.default.static(CLIENT_BUILD_PATH))
    .get('/api/topRooms', function (_, res) { return res.json({ topRooms: rooms.recentlyUpdatedRooms.map(function (room) { return room.id; }) }); })
    .get('/*', function (_, res) { return res.sendFile(path_1.default.join(CLIENT_BUILD_PATH, 'index.html')); })
    .listen(PORT, function () { return console.log("Server is running in port: ".concat(PORT)); });
var rooms = new room_1.Rooms({ maxRooms: 50, maxUsers: 50, maxRoomsPerUser: 3, nRecentlyUpdatedRoomsToKeep: 5 });
(0, server_1.RollerWebSocketServer)(new ws_1.Server({ server: httpServer }), { reconnectTimeout: 10000, heartbeatTimeout: 120000 }, {
    onConnect: function (message, context, connection) {
        var roomId = message.roomId, userId = message.userId, state = message.state;
        var result = rooms.createOrJoinRoom(roomId, userId, connection, state);
        if ((0, Either_1.isLeft)(result)) {
            return {
                eventType: 'error',
                message: result.left,
            };
        }
        if (result.right.connectionToClose) {
            logger.info("dropping previous connection of user ".concat(userId, " to room ").concat(roomId));
            result.right.connectionToClose.send(shared_1.MessageCodec.encode({
                eventType: 'disconnect',
            }));
        }
        context.userId = userId;
        context.roomId = roomId;
        return {
            eventType: 'connected',
            isHost: result.right.room.hostId == userId,
            roomId: roomId,
            state: result.right.room.state
        };
    },
    onUpdate: function (message, context) {
        if (!context.userId || !context.roomId) {
            return {
                eventType: 'error',
                message: 'not connected to any room',
            };
        }
        ;
        var state = message.state;
        var result = rooms.updateRoomState(context.roomId, context.userId, state);
        if ((0, Either_1.isLeft)(result)) {
            return {
                eventType: 'error',
                message: result.left,
            };
        }
    },
    onDisconnect: function (context) {
        if (context.roomId && context.userId) {
            rooms.disconnectFromRoom(context.roomId, context.userId);
            logger.info("user ".concat(context.userId, " disconnected from room ").concat(context.roomId));
        }
    }
});
