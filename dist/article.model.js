"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resource_model_1 = require("./resource.model");
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
    questions: Object,
    publishedAt: Date,
    createdBy: resource_model_1.UserRef,
    createdAt: Date,
    modifiedBy: resource_model_1.UserRef,
    modifiedAt: Date
});
exports.ArticleModel = mongoose_1.model('Article', exports.ArticleSchema);
