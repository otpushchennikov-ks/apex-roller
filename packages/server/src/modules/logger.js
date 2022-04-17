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
var winston_1 = __importStar(require("winston"));
function getOrCreateLogger(name) {
    if (winston_1.default.loggers.has(name)) {
        return winston_1.default.loggers.get(name);
    }
    return winston_1.default.loggers.add(name, {
        level: 'info',
        format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.label({ label: name }), winston_1.format.printf(function (_a) {
            var timestamp = _a.timestamp, level = _a.level, label = _a.label, message = _a.message;
            return "".concat(timestamp, " [").concat(level.toUpperCase().padStart(5, " "), "] ").concat(label === null || label === void 0 ? void 0 : label.padStart(5, " "), ": ").concat(message);
        }), winston_1.format.colorize({ all: true })),
        transports: [
            new winston_1.default.transports.Console(),
        ]
    });
}
exports.default = getOrCreateLogger;
