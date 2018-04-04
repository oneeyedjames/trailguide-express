"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./lib/controller");
const promisify_1 = require("./lib/promisify");
const user_model_1 = require("./user.model");
const role_model_1 = require("./role.model");
class ResourceController extends controller_1.Controller {
    constructor(resModel) {
        super(resModel);
        this.resourceType = resModel.modelName.toLowerCase();
        this.router.use(this.getUser());
    }
    get user() { return this._user; }
    get roles() { return this._roles; }
    get isAuthenticated() { return this._user != null; }
    get isAdministrator() { return this.isAuthenticated && this.user.admin; }
    hasPermission(action, resource) {
        if (this.isAdministrator)
            return true;
        for (let role of this.roles) {
            for (let perm of role.permissions) {
                if (perm.action == action && perm.resource == resource)
                    return true;
            }
        }
        return false;
    }
    hasOverridePermission(action, resource) {
        if (this.isAdministrator)
            return true;
        for (let role of this.roles) {
            for (let perm of role.permissions) {
                if (perm.action == action && perm.resource == resource && perm.override)
                    return true;
            }
        }
        return false;
    }
    searchArgs(args) {
        args = super.searchArgs(args);
        if (!this.hasOverridePermission('read', this.resourceType))
            args['createdBy'] = this.user.id;
        return args;
    }
    canRead(doc) {
        if (!this.isAuthenticated)
            return false;
        if (doc == undefined || doc.createdBy == this.user.id || doc.createdBy == null)
            return this.hasPermission('read', this.resourceType);
        return this.hasOverridePermission('read', this.resourceType);
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
        const userQuery = user_model_1.UserModel.findById.bind(user_model_1.UserModel);
        const roleQuery = role_model_1.RoleModel.find.bind(role_model_1.RoleModel);
        return (req, resp, next) => {
            // Required for preflight in CORS requests
            if (req.method == 'OPTIONS')
                return resp.sendStatus(200);
            let userId = req.session.userId;
            if (userId) {
                promisify_1.promisify(userQuery, req.session.userId)
                    .then((user) => this._user = user)
                    .then((user) => promisify_1.promisify(roleQuery, { _id: user.roles }))
                    .then((roles) => this._roles = roles)
                    .then((roles) => next())
                    .catch((err) => resp.sendStatus(500));
            }
            else {
                resp.sendStatus(401);
            }
        };
    }
}
exports.ResourceController = ResourceController;
