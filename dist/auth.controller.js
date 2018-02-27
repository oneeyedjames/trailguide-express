"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const promisify_1 = require("./lib/promisify");
const authenticator_1 = require("./lib/authenticator");
const user_model_1 = require("./user.model");
const userModel = mongoose_1.model('User', user_model_1.UserSchema);
class UserController extends authenticator_1.Authenticator {
    findUser(username) {
        return promisify_1.promisify(userModel.findOne.bind(userModel), {
            username: username
        });
    }
    createUser(username, passwordHash) {
        return userModel.create({
            username: username,
            passwordHash: passwordHash
        });
    }
}
exports.default = new AuthController();
