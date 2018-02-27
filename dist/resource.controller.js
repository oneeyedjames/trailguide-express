"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const controller_1 = require("./lib/controller");
const promisify_1 = require("./lib/promisify");
const user_model_1 = require("./user.model");
class ResourceController extends controller_1.Controller {
    constructor(name, schema) {
        super(name, schema);
        this.userModel = mongoose_1.model('User', user_model_1.UserSchema);
        this.router.use(this.getUser());
    }
    get user() { return this._user; }
    get isAuthenticated() { return this._user != null; }
    canRead(doc) {
        if (doc == undefined)
            return true;
        return true;
    }
    canEdit(doc) {
        if (!this.isAuthenticated)
            return false;
        if (doc == undefined)
            return true;
        return doc.createdBy == this.user.id;
    }
    canDelete(doc) {
        if (!this.isAuthenticated)
            return false;
        return doc.createdBy == this.user.id;
    }
    beforeCreate(doc) {
        doc.modifiedBy = doc.createdBy = this.user.id;
        doc.modifiedAt = doc.createdAt = new Date();
        return doc;
    }
    afterCreate(doc) {
        console.log(doc);
        return doc;
    }
    beforeUpdate(doc) {
        doc.modifiedBy = this.user.id;
        doc.modifiedAt = new Date();
        return doc;
    }
    afterUpdate(doc) {
        console.log(doc);
        return doc;
    }
    getUser() {
        const query = this.userModel.findById.bind(this.userModel);
        return (req, res, next) => {
            promisify_1.promisify(query, req.session.userId)
                .then((user) => {
                this._user = user;
                next();
            }).catch((err) => res.sendStatus(500));
        };
    }
}
exports.ResourceController = ResourceController;
