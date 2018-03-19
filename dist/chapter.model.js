"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resource_model_1 = require("./resource.model");
var ObjectId = mongoose_1.Schema.Types.ObjectId;
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
    createdBy: resource_model_1.UserRef,
    createdAt: Date,
    modifiedBy: resource_model_1.UserRef,
    modifiedAt: Date
});
exports.ChapterModel = mongoose_1.model('Chapter', exports.ChapterSchema);
