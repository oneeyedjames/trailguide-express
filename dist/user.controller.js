"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const promisify_1 = require("./lib/promisify");
const authenticator_1 = require("./lib/authenticator");
const user_model_1 = require("./user.model");
class UserController extends authenticator_1.Authenticator {
    constructor() {
        super();
        this.model = mongoose_1.model('User', user_model_1.UserSchema);
        this.router.get('/profile', this.getProfile.bind(this));
    }
    findUser(username) {
        return promisify_1.promisify(this.model.findOne.bind(this.model), {
            username: username
        });
    }
    createUser(username, passwordHash) {
        return this.model.create({
            username: username,
            passwordHash: passwordHash
        });
    }
    getProfile(req, res) {
        let userId = req['session'].userId;
        if (userId) {
            promisify_1.promisify(this.model.findById.bind(this.model), userId)
                .then((user) => {
                let userData = {};
                user_model_1.UserSchema.eachPath((path, type) => {
                    if (path != 'passwordHash')
                        userData[path] = user[path];
                });
                res.json(userData);
            })
                .catch((err) => res.sendStatus(500));
        }
        else {
            res.sendStatus(401);
        }
    }
}
exports.default = new UserController();
