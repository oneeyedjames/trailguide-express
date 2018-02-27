"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ObjectId = mongoose_1.Schema.Types.ObjectId;
exports.ChapterSchema = new mongoose_1.Schema({
    issue: {
        type: ObjectId,
        ref: 'Issue',
        required: true
    },
    title: String,
    description: String,
    scripture: String,
    publishedAt: Date,
    createdAt: Date,
    modifiedAt: Date
}).pre('save', function (next) {
    this.modifiedAt = new Date();
    if (!this.createdAt)
        this.createdAt = this.modifiedAt;
    next();
});
