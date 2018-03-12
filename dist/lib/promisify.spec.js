"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const chai_1 = require("chai");
const promisify_1 = require("./promisify");
let succeed = (fn) => fn(null, 'You SUCCEED');
let fail = (fn) => fn(new Error('You FAIL'));
mocha_1.describe('Promisify<T> function for node-style async functions', () => {
    mocha_1.it('should succeed', () => __awaiter(this, void 0, void 0, function* () {
        let output = yield promisify_1.promisify(succeed);
        chai_1.expect(output).to.equal('You SUCCEED');
    }));
    mocha_1.it('should fail', () => __awaiter(this, void 0, void 0, function* () {
        let output;
        let err;
        try {
            output = yield promisify_1.promisify(fail);
        }
        catch (e) {
            err = e;
        }
        chai_1.expect(err.message).to.equal('You FAIL');
    }));
});
