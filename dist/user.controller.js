"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const promisify_1 = require("./lib/promisify");
const http_1 = require("./lib/http");
const authenticator_1 = require("./lib/authenticator");
const user_model_1 = require("./user.model");
class UserController extends authenticator_1.Authenticator {
    constructor() {
        super();
        this.model = mongoose_1.model('User', user_model_1.UserSchema);
        // this.router.use((req, resp, next) => {
        // 	this.findUser('admin').then((user: UserDocument) => {
        // 		if (!user.admin) {
        // 			user.admin = true;
        // 			return user.save();
        // 		} else {
        // 			return user;
        // 		}
        // 	})
        // 	.then((user: UserDocument) => next())
        // 	.catch((err: any) => resp.sendStatus(500));
        // });
        this.router.use(this.initSessionUser.bind(this));
        this.router.get('/users', this.getAll.bind(this));
        this.router.get('/user/me', this.getMe.bind(this));
        this.router.get('/user/:id', this.getOne.bind(this));
        this.router.put('/user/:id', this.update.bind(this));
    }
    findUser(username) {
        return promisify_1.promisify(this.model.findOne.bind(this.model), {
            username: username
        });
    }
    createUser(username, passwordHash) {
        let now = new Date();
        return this.model.create({
            username: username,
            passwordHash: passwordHash,
            createdAt: now,
            modifiedAt: now
        });
    }
    initSessionUser(req, resp, next) {
        let userId = req.session.userId;
        if (userId) {
            this.model.findById(userId).populate('roles').exec()
                .then((user) => this.sessionUser = user)
                .then((user) => next())
                .catch((err) => next());
        }
        else {
            next();
        }
    }
    getAll(req, resp) {
        if (this.sessionUser) {
            if (!this.sessionUser.admin)
                throw new http_1.HttpError(401);
            this.model.find().populate('roles').exec()
                .then((users) => {
                let userData = [];
                for (let user of users)
                    userData.push(this.sanitize(user));
                resp.json(userData);
            })
                .catch(this.error(resp));
        }
        else {
            resp.sendStatus(401);
        }
    }
    getOne(req, resp) {
        let id = this.parseId(req.params.id);
        let args = id ? { _id: id } : { username: req.params.id };
        this.model.findOne(args).populate('roles').exec()
            .then((user) => this.sanitize(user))
            .then((userData) => resp.json(userData))
            .catch(this.error(resp));
    }
    getMe(req, resp) {
        if (this.sessionUser) {
            resp.json(this.sanitize(this.sessionUser));
        }
        else {
            resp.sendStatus(401);
        }
    }
    update(req, resp) {
        this.model.findById(req.params.id).exec()
            .then(this.authorize.bind(this))
            .then((user) => {
            for (let key in req.body)
                user[key] = req.body[key];
            user.modifiedAt = new Date();
            return user.save();
        })
            .then((user) => user.populate('roles').execPopulate())
            .then((user) => this.sanitize(user))
            .then((userData) => resp.json(userData))
            .catch(this.error(resp));
    }
    delete(req, resp) {
        this.model.findById(req.params.id).exec()
            .then(this.authorize.bind(this))
            .then((user) => user.remove())
            .then((user) => resp.sendStatus(204))
            .catch(this.error(resp));
    }
    parseId(id) {
        if (id.length == 12 || id.length == 24) {
            try {
                return mongoose_1.Types.ObjectId(id);
            }
            catch (e) {
                return null;
            }
        }
        return null;
    }
    authorize(user) {
        if (!user)
            throw new http_1.HttpError(404);
        if (!this.sessionUser)
            throw new http_1.HttpError(401);
        if (this.sessionUser.id != user.id && !this.sessionUser.admin)
            throw new http_1.HttpError(401);
        return user;
    }
    sanitize(user) {
        if (!user)
            throw new http_1.HttpError(404);
        let allowProtected = user.id == this.sessionUser.id || this.sessionUser.admin;
        let userData = {};
        user_model_1.UserSchema.eachPath((path, type) => {
            if (UserController.privateFields.indexOf(path) >= 0)
                return;
            if (UserController.protectedFields.indexOf(path) >= 0 && !allowProtected)
                return;
            userData[path] = user[path];
        });
        return userData;
    }
    error(resp) {
        return (err) => {
            if (err instanceof http_1.HttpError) {
                resp.status(err.status).json({
                    error: {
                        name: err.name,
                        message: err.message
                    }
                });
            }
            else {
                resp.status(500).json({
                    error: {
                        name: err.name || 'Error',
                        message: err.message || err
                    }
                });
            }
        };
    }
}
UserController.privateFields = ['passwordHash'];
UserController.protectedFields = ['roles', 'admin'];
exports.default = new UserController();
