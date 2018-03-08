"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resource_model_1 = require("./resource.model");
exports.RoleSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    permissions: Array,
    createdBy: resource_model_1.UserRef,
    createdAt: Date,
    modifiedBy: resource_model_1.UserRef,
    modifiedAt: Date
});
