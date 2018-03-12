"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ObjectId = mongoose_1.Schema.Types.ObjectId;
exports.UserSchema = new mongoose_1.Schema({
    username: String,
    passwordHash: String,
    roles: [{
            type: ObjectId,
            ref: 'Role'
        }],
    createdAt: Date,
    modifiedAt: Date
}).pre('save', (next) => {
    this.modifiedAt = new Date();
    if (!this.createdAt)
        this.createdAt = this.modifiedAt;
    next();
});
exports.UserModel = mongoose_1.model('User', exports.UserSchema);
