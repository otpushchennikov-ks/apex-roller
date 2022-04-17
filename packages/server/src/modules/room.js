"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rooms = exports.Room = void 0;
var Either_1 = require("fp-ts/lib/Either");
var shared_1 = require("@packages/shared");
var logger_1 = __importDefault(require("./logger"));
var logger = (0, logger_1.default)('rooms');
var Room = /** @class */ (function () {
    function Room(id, host, state) {
        this.id = id;
        this.state = state;
        this.hostId = host;
        this.userIds = new Set();
        this.addUser(this.hostId);
    }
    Room.prototype.addUser = function (userId) {
        this.userIds.add(userId);
    };
    Room.prototype.removeUser = function (userId) {
        this.userIds.delete(userId);
        if (userId == this.hostId) {
            var _a = this.userIds.values().next(), done = _a.done, value = _a.value;
            if (done) {
                return { isEmpty: true };
            }
            this.hostId = value;
            return { isEmpty: false, newHostId: this.hostId };
        }
        return { isEmpty: false };
    };
    Room.prototype.updateState = function (state) {
        this.state = state;
    };
    return Room;
}());
exports.Room = Room;
var Rooms = /** @class */ (function () {
    function Rooms(_a) {
        var maxRooms = _a.maxRooms, maxUsers = _a.maxUsers, maxRoomsPerUser = _a.maxRoomsPerUser, nRecentlyUpdatedRoomsToKeep = _a.nRecentlyUpdatedRoomsToKeep;
        this.maxRooms = maxRooms;
        this.maxUsers = maxUsers;
        this.maxRoomsPerUser = maxRoomsPerUser;
        this.nRecentlyUpdatedRoomsToKeep = nRecentlyUpdatedRoomsToKeep;
        this.rooms = new Map();
        this.userConnections = new Map();
        this.recentlyUpdatedRooms = new Array();
    }
    Rooms.prototype.putToRecentlyUpdatedRooms = function (room) {
        this.removeFromRecentlyUpdatedRooms(room);
        if (this.recentlyUpdatedRooms.length >= this.nRecentlyUpdatedRoomsToKeep) {
            this.recentlyUpdatedRooms.pop();
        }
        this.recentlyUpdatedRooms.unshift(room);
    };
    Rooms.prototype.removeFromRecentlyUpdatedRooms = function (room) {
        for (var i = 0; i < this.recentlyUpdatedRooms.length; ++i) {
            if (room.id == this.recentlyUpdatedRooms[i].id) {
                this.recentlyUpdatedRooms.splice(i, 1);
                break;
            }
        }
    };
    /**
     * Creates a room with user as host, or joins a room.
     * If user was not previously known to system, also registers user.
     *
     * @returns error if any of system limits has been reached; reference to created room otherwise.
     * If user has joined a room they were previously in, also returns handle to the previous connection.
     */
    Rooms.prototype.createOrJoinRoom = function (roomId, userId, connection, state) {
        var _a;
        var room = this.rooms.get(roomId);
        if (!room && this.rooms.size >= this.maxRooms) {
            return (0, Either_1.left)("cannot create more rooms: max rooms (".concat(this.maxRooms, ") reached"));
        }
        var userRooms = this.userConnections.get(userId);
        if (userRooms) {
            if (userRooms.size >= this.maxRoomsPerUser && !userRooms.has(roomId)) {
                return (0, Either_1.left)("cannot enter room: max user rooms (".concat(this.maxRoomsPerUser, ") reached"));
            }
        }
        else {
            if (this.userConnections.size >= this.maxUsers) {
                return (0, Either_1.left)("cannot register user: max users (".concat(this.maxUsers, ") reached"));
            }
        }
        // register user, returning existing connection
        var existingConnection = userRooms === null || userRooms === void 0 ? void 0 : userRooms.get(roomId);
        (_a = userRooms === null || userRooms === void 0 ? void 0 : userRooms.set(roomId, connection)) !== null && _a !== void 0 ? _a : this.userConnections.set(userId, new Map([[roomId, connection]]));
        if (room) {
            room.addUser(userId);
            this.putToRecentlyUpdatedRooms(room);
            logger.info("added user ".concat(userId, " to existing room ").concat(room.id));
            return (0, Either_1.right)({ room: room, connectionToClose: existingConnection });
        }
        else {
            var newRoom = new Room(roomId, userId, state);
            this.rooms.set(roomId, newRoom);
            // not possible to have existing connection here
            existingConnection;
            this.putToRecentlyUpdatedRooms(newRoom);
            logger.info("created new room ".concat(newRoom.id, " with host ").concat(userId));
            return (0, Either_1.right)({ room: newRoom });
        }
    };
    /**
     * Updates room state.
     *
     * @returns error if room does not exist, or user is not a host of the room; otherwise nothing.
     */
    Rooms.prototype.updateRoomState = function (roomId, userId, state) {
        var _this = this;
        var room = this.rooms.get(roomId);
        if (!room) {
            return (0, Either_1.left)('cannot update: room does not exist');
        }
        if ((room === null || room === void 0 ? void 0 : room.hostId) !== userId) {
            return (0, Either_1.left)('cannot update: not a host');
        }
        room.updateState(state);
        var serializedUpdate = shared_1.MessageCodec.encode({ eventType: 'update', roomId: roomId, state: state });
        room.userIds.forEach(function (userId) {
            var _a, _b;
            // TODO do we want to send update to host (back)?
            if (userId === room.hostId)
                return;
            (_b = (_a = _this.userConnections.get(userId)) === null || _a === void 0 ? void 0 : _a.get(roomId)) === null || _b === void 0 ? void 0 : _b.send(serializedUpdate);
        });
        logger.info("updated state of room ".concat(room.id, ": ").concat(serializedUpdate));
        this.putToRecentlyUpdatedRooms(room);
        return (0, Either_1.right)(null);
    };
    /**
     * Disconnects user from room.
     *
     * Does nothing if room does not exist.
     *
     * If user disconnect has caused host re-election in the room, notifies the new host.
     */
    Rooms.prototype.disconnectFromRoom = function (roomId, userId) {
        var _a, _b;
        var room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        // should always exist
        this.userConnections.get(userId).delete(roomId);
        var _c = room.removeUser(userId), isEmpty = _c.isEmpty, newHost = _c.newHostId;
        this.removeFromRecentlyUpdatedRooms(room);
        if (isEmpty) {
            this.rooms.delete(room.id);
            logger.info("deleted empty room ".concat(room.id));
        }
        else if (newHost) {
            (_b = (_a = this.userConnections.get(newHost)) === null || _a === void 0 ? void 0 : _a.get(roomId)) === null || _b === void 0 ? void 0 : _b.send(shared_1.MessageCodec.encode({
                eventType: 'connected',
                isHost: true,
                roomId: roomId,
                state: room.state,
            }));
            logger.info("elected new host ".concat(newHost, " in room ").concat(room.id));
        }
    };
    return Rooms;
}());
exports.Rooms = Rooms;
