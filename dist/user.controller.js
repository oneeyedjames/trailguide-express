"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const promisify_1 = require("./lib/promisify");
const authenticator_1 = require("./lib/authenticator");
const user_model_1 = require("./user.model");
const role_model_1 = require("./role.model");
class UserController extends authenticator_1.Authenticator {
    constructor() {
        super();
        this.model = mongoose_1.model('User', user_model_1.UserSchema);
        // const roleModel = model<RoleDocument>('Role', RoleSchema);
        //
        // this.router.use((req, resp, next) => {
        // 	this.findUser('admin').then((user: UserDocument) => {
        // 		if (!user.admin) {
        // 			user.admin = true;
        // 			return user.save();
        // 		} else {
        // 			return user;
        // 		}
        // 	}).then((user: UserDocument) => {
        // 		console.log(user);
        // 		if (user.roles.length == 0) {
        // 			promisify<RoleDocument>(roleModel.findOne.bind(roleModel), {
        // 				title: 'Administrator'
        // 			}).then((role: RoleDocument) => {
        // 				if (!role) {
        // 					return promisify<RoleDocument>(roleModel.create.bind(roleModel), {
        // 						title: 'Administrator',
        // 						description: 'This is an administrator.',
        // 						permissions: [{
        // 							action: 'create',
        // 							resource: 'issue',
        // 							override: true
        // 						}, {
        // 							action: 'update',
        // 							resource: 'issue',
        // 							override: true
        // 						}, {
        // 							action: 'delete',
        // 							resource: 'issue',
        // 							override: true
        // 						}]
        // 					});
        // 				}
        // 			}).then((role: RoleDocument) => {
        // 				user.roles.push(role._id);
        // 				return user.save();
        // 			}).then((user: UserDocument) => {
        // 				next();
        // 			});
        // 		}
        // 	}).catch((err: any) => resp.sendStatus(500));
        // });
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
            let userDoc;
            const roleModel = mongoose_1.model('Role', role_model_1.RoleSchema);
            let userQuery = this.model.findById.bind(this.model);
            let roleQuery = roleModel.find.bind(roleModel);
            promisify_1.promisify(userQuery, userId)
                .then((user) => userDoc = user)
                .then((user) => promisify_1.promisify(roleQuery, { _id: user.roles }))
                .then((roles) => this.sanitize(userDoc, roles))
                .then((userData) => resp.json(userData))
                .catch(this.error(resp));
        }
        else {
            resp.sendStatus(401);
        }
    }
    sanitize(user, roles) {
        if (!user)
            throw new Error('Not Found');
        let userData = {};
        user_model_1.UserSchema.eachPath((path, type) => {
            if (UserController.protectedFields.indexOf(path) < 0)
                userData[path] = user[path];
        });
        if (roles != undefined)
            userData['roles'] = roles;
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
UserController.protectedFields = ['passwordHash', 'roles', 'admin'];
exports.default = new UserController();
