"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nodes = void 0;
const crypto_1 = __importDefault(require("crypto"));
class Nodes {
    constructor(portNumber) {
        this.allNodes = [];
        const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('rsa', { modulusLength: 2048 });
        this.publicKey = publicKey.export({ format: 'pem', type: 'spki' }).toString();
        this.privateKey = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
        this.p2pPort = portNumber;
    }
}
exports.Nodes = Nodes;
