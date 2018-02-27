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
        this.router.get('/user/me', this.getCurrentUser.bind(this));
        this.router.get('/user/:username', this.getUser.bind(this));
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
    getUser(req, resp) {
        this.findUser(req.params.username)
            .then((user) => this.sanitize(user))
            .then((userData) => resp.json(userData))
            .catch(this.error(resp));
    }
    getCurrentUser(req, resp) {
        let userId = req.session.userId;
        if (userId) {
            let query = this.model.findById.bind(this.model);
            promisify_1.promisify(query, userId)
                .then((user) => this.sanitize(user))
                .then((userData) => resp.json(userData))
                .catch(this.error(resp));
        }
        else {
            resp.sendStatus(401);
        }
    }
    sanitize(user) {
        if (!user)
            throw new Error('Not Found');
        let userData = {};
        user_model_1.UserSchema.eachPath((path, type) => {
            if (path != 'passwordHash')
                userData[path] = user[path];
        });
        return userData;
    }
    error(resp) {
        return (err) => {
            switch (err.message) {
                case 'Unauthorized':
                    resp.sendStatus(401);
                    break;
                case 'Not Found':
                    resp.sendStatus(404);
                    break;
                default:
                    resp.status(500).json(err);
                    break;
            }
        };
    }
}
exports.default = new UserController();
