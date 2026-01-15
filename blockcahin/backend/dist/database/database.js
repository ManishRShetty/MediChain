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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAllRecords = exports.deleteRecord = exports.updateRecord = exports.readRecord = exports.createRecord = void 0;
const levelup_1 = __importDefault(require("levelup"));
const leveldown_1 = __importDefault(require("leveldown"));
const dbPath = './mydb';
const db = (0, levelup_1.default)((0, leveldown_1.default)(dbPath));
const createRecord = (table, key, value) => __awaiter(void 0, void 0, void 0, function* () {
    const tableKey = `${table}:${key}`;
    yield db.put(tableKey, value);
});
exports.createRecord = createRecord;
const readRecord = (table, key) => __awaiter(void 0, void 0, void 0, function* () {
    const tableKey = `${table}:${key}`;
    try {
        const value = yield db.get(tableKey);
        return value;
    }
    catch (error) {
        throw new Error('Record not found');
    }
});
exports.readRecord = readRecord;
const updateRecord = (table, key, value) => __awaiter(void 0, void 0, void 0, function* () {
    const tableKey = `${table}:${key}`;
    yield db.put(tableKey, value);
});
exports.updateRecord = updateRecord;
const deleteRecord = (table, key) => __awaiter(void 0, void 0, void 0, function* () {
    const tableKey = `${table}:${key}`;
    yield db.del(tableKey);
});
exports.deleteRecord = deleteRecord;
const readAllRecords = (table) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const records = [];
        db.createReadStream()
            .on('data', ({ key, value }) => {
            if (key.toString().startsWith(`${table}:`)) {
                records.push({ key: key.toString().split(`${table}:`)[1], value });
            }
        })
            .on('error', (err) => {
            reject(err);
        })
            .on('end', () => {
            resolve(records);
        });
    });
});
exports.readAllRecords = readAllRecords;
