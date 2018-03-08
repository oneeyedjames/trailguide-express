"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const controller_1 = require("./lib/controller");
const promisify_1 = require("./lib/promisify");
const user_model_1 = require("./user.model");
const role_model_1 = require("./role.model");
class ResourceController extends controller_1.Controller {
    constructor(name, schema) {
        super(name, schema);
        this.resourceType = name.toLowerCase();
        this.userModel = mongoose_1.model('User', user_model_1.UserSchema);
        this.roleModel = mongoose_1.model('Role', role_model_1.RoleSchema);
        this.router.use(this.getUser());
    }
    get user() { return this._user; }
    get roles() { return this._roles; }
    get isAuthenticated() { return this._user != null; }
    hasPermission(action, resource) {
        for (let role of this.roles) {
            for (let perm of role.permissions) {
                if (perm.action == action && perm.resource == resource)
                    return true;
            }
        }
        return false;
    }
    hasOverridePermission(action, resource) {
        for (let role of this.roles) {
            for (let perm of role.permissions) {
                if (perm.action == action && perm.resource == resource && perm.override)
                    return true;
            }
        }
        return false;
    }
    canRead(doc) {
        if (doc == undefined)
            return true;
        return true;
    }
    canEdit(doc) {
        if (!this.isAuthenticated)
            return false;
        if (doc == undefined)
            return this.hasPermission('create', this.resourceType);
        if (doc.createdBy == this.user.id || doc.createdBy == null)
            return this.hasPermission('update', this.resourceType);
        return this.hasOverridePermission('update', this.resourceType);
    }
    canDelete(doc) {
        if (!this.isAuthenticated)
            return false;
        if (doc.createdBy == this.user.id || doc.createdBy == null)
            return this.hasPermission('delete', this.resourceType);
        return this.hasOverridePermission('delete', this.resourceType);
    }
    beforeCreate(doc) {
        doc.modifiedBy = doc.createdBy = this.user.id;
        doc.modifiedAt = doc.createdAt = new Date();
        return doc;
    }
    beforeUpdate(doc) {
        doc.modifiedBy = this.user.id;
        doc.modifiedAt = new Date();
        if (doc.createdBy == undefined)
            doc.createdBy = doc.modifiedBy;
        if (doc.createdAt == undefined)
            doc.createdAt = doc.modifiedAt;
        return doc;
    }
    getUser() {
        const userQuery = this.userModel.findById.bind(this.userModel);
        const roleQuery = this.roleModel.find.bind(this.roleModel);
        return (req, res, next) => {
            // Required for preflight in CORS requests
            if (req.method == 'OPTIONS')
                return res.sendStatus(200);
            promisify_1.promisify(userQuery, req.session.userId)
                .then((user) => {
                this._user = user;
                return promisify_1.promisify(roleQuery, { _id: user.roles });
            })
                .then((roles) => {
                this._roles = roles;
                next();
            })
                .catch((err) => res.sendStatus(500));
        };
    }
}
exports.ResourceController = ResourceController;
