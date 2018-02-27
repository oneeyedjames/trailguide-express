"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ObjectId = mongoose_1.Schema.Types.ObjectId;
exports.ArticleSchema = new mongoose_1.Schema({
    chapter: {
        type: ObjectId,
        ref: 'Chapter',
        required: true
    },
    title: String,
    bibleReading: String,
    extraReading: String,
    content: String,
    publishedAt: Date,
    createdAt: Date,
    modifiedAt: Date
}).pre('save', function (next) {
    this.modifiedAt = new Date();
    if (!this.createdAt)
        this.createdAt = this.modifiedAt;
    next();
});
