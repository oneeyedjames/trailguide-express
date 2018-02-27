"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
    username: String,
    passwordHash: String,
    createdAt: Date,
    modifiedAt: Date
}).pre('save', (next) => {
    this.modifiedAt = new Date();
    if (!this.createdAt)
        this.createdAt = this.modifiedAt;
    next();
});
