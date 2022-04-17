"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopRoomsCodec = exports.MessageCodec = exports.JSONCodec = exports.ErrorMessageCodec = exports.DisconnectMessageCodec = exports.UpdateMessageCodec = exports.ConnectedMessageCodec = exports.ConnectMessageCodec = exports.UserIdCodec = exports.RoomIdCodec = void 0;
var T = __importStar(require("io-ts"));
var AmmoTypeCodec = T.union([
    T.literal('Light'),
    T.literal('Heavy'),
    T.literal('Energy'),
    T.literal('Shotgun'),
    T.literal('Sniper'),
    T.literal('Arrows'),
    T.array(T.union([
        T.literal('Light'),
        T.literal('Heavy'),
        T.literal('Energy'),
        T.literal('Shotgun'),
        T.literal('Sniper'),
        T.literal('Arrows'),
    ])),
]);
var WeaponTypeCodec = T.union([
    T.literal('AR'),
    T.literal('SMG'),
    T.literal('LMG'),
    T.literal('Marksman'),
    T.literal('Shotgun'),
    T.literal('Pistol'),
    T.literal('Sniper'),
]);
var WeaponCodec = T.type({
    type: WeaponTypeCodec,
    ammoType: AmmoTypeCodec,
    name: T.union([
        T.literal('HAVOC Rifle'),
        T.literal('VK-47 Flatline'),
        T.literal('Hemlok Burst AR'),
        T.literal('R-301 Carbine'),
        T.literal('Alternator SMG'),
        T.literal('R-99 SMG'),
        T.literal('C.A.R SMG'),
        T.literal('Volt SMG'),
        T.literal('RE-45 Auto'),
        T.literal('Prowler Burst PDW'),
        T.literal('Devotion LMG'),
        T.literal('M600 Spitfire'),
        T.literal('Rampage LMG'),
        T.literal('L-STAR EMG'),
        T.literal('G7 Scout'),
        T.literal('30-30 Repeater'),
        T.literal('Bocek Compound Bow'),
        T.literal('Triple Take'),
        T.literal('EVA-8 Auto'),
        T.literal('Mastiff Shotgun'),
        T.literal('Peacekeeper'),
        T.literal('Mozambique Shotgun'),
        T.literal('Wingman'),
        T.literal('P2020'),
        T.literal('Charge Rifle'),
        T.literal('Longbow DMR'),
        T.literal('Sentinel'),
        T.literal('Kraber .50-Cal Sniper'),
    ]),
    isAirdrop: T.boolean,
    isArenaStart: T.boolean,
});
var ChallengeSettingsCodec = T.record(T.string, T.union([T.number, T.boolean, T.undefined]));
var UserShareableStateCodec = T.type({
    challengeMode: T.string,
    challengeIndex: T.number,
    challengeSettings: ChallengeSettingsCodec,
    groupedValues: T.array(T.array(WeaponCodec)),
});
exports.RoomIdCodec = T.brand(T.string, function (s) { return s.length <= 64 && s.length > 0; }, 'RoomId');
exports.UserIdCodec = T.brand(T.string, function (s) { return s.length === 36; }, 'UserId');
var ConnectEventTypeCodec = T.literal('connect');
var ConnectedEventTypeCodec = T.literal('connected');
var UpdateEventTypeCodec = T.literal('update');
var DisconnectEventTypeCodec = T.literal('disconnect');
var ErrorEventTypeCodec = T.literal('error');
var EventTypeCodec = T.union([
    ConnectEventTypeCodec,
    ConnectedEventTypeCodec,
    UpdateEventTypeCodec,
    DisconnectEventTypeCodec,
    ErrorEventTypeCodec
]);
exports.ConnectMessageCodec = T.type({
    eventType: ConnectEventTypeCodec,
    roomId: exports.RoomIdCodec,
    userId: exports.UserIdCodec,
    state: UserShareableStateCodec,
});
exports.ConnectedMessageCodec = T.type({
    eventType: ConnectedEventTypeCodec,
    roomId: exports.RoomIdCodec,
    isHost: T.boolean,
    state: UserShareableStateCodec,
});
exports.UpdateMessageCodec = T.type({
    eventType: UpdateEventTypeCodec,
    roomId: exports.RoomIdCodec,
    state: UserShareableStateCodec,
});
exports.DisconnectMessageCodec = T.type({
    eventType: DisconnectEventTypeCodec
});
exports.ErrorMessageCodec = T.type({
    eventType: ErrorEventTypeCodec,
    message: T.string
});
exports.JSONCodec = new T.Type('JSONCodec', function (input) { return typeof input === 'string'; }, function (input, context) {
    try {
        return T.success(JSON.parse(input));
    }
    catch (_a) {
        return T.failure(input, context);
    }
}, function (input) { return JSON.stringify(input); });
exports.MessageCodec = exports.JSONCodec.pipe(T.union([
    exports.ConnectMessageCodec,
    exports.ConnectedMessageCodec,
    exports.UpdateMessageCodec,
    exports.DisconnectMessageCodec,
    exports.ErrorMessageCodec
]));
exports.TopRoomsCodec = T.type({
    topRooms: T.array(exports.RoomIdCodec),
});
