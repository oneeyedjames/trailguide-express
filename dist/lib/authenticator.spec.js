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
const bcrypt = require("bcrypt");
const authenticator_1 = require("./authenticator");
class TestAuthenticator extends authenticator_1.Authenticator {
    constructor(testUser) {
        super();
        this.testUser = testUser;
    }
    findUser(username) {
        return new Promise((resolve, reject) => {
            if (username == this.testUser.username)
                resolve(this.testUser);
            else
                reject('Invalid username');
        });
    }
    createUser(username, passwordHash) {
        return new Promise((resolve, reject) => {
            if (username == 'testuser')
                resolve(this.testUser);
        });
    }
}
mocha_1.describe('Authenticator for Express server', () => {
    mocha_1.it('uses promises', () => __awaiter(this, void 0, void 0, function* () {
        let salt = yield bcrypt.genSalt(10);
        let hash = yield bcrypt.hash('testpass', salt);
        let auth = new TestAuthenticator({
            username: 'testuser',
            passwordHash: hash
        });
        let user = yield auth.authenticate('testuser', 'testpass');
        chai_1.expect(user.username).to.equal('testuser');
        chai_1.expect(user.passwordHash).to.equal(hash);
    }));
});
