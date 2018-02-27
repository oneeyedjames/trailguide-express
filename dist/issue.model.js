"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.IssueSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    volumeNumber: Number,
    issueNumber: Number,
    publishedAt: Date,
    createdAt: Date,
    modifiedAt: Date
}).pre('save', function (next) {
    this.modifiedAt = new Date();
    if (!this.createdAt)
        this.createdAt = this.modifiedAt;
    next();
});
