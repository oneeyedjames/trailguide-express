"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resource_model_1 = require("./resource.model");
var ObjectId = mongoose_1.Schema.Types.ObjectId;
exports.ReplySchema = new mongoose_1.Schema({
    article: {
        type: ObjectId,
        ref: 'Article',
        required: true
    },
    observation: String,
    interpretation: String,
    application: String,
    implementation: String,
    createdBy: resource_model_1.UserRef,
    createdAt: Date,
    modifiedBy: resource_model_1.UserRef,
    modifiedAt: Date
});
exports.ReplyModel = mongoose_1.model('Reply', exports.ReplySchema);
