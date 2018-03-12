"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./resource.controller");
const role_model_1 = require("./role.model");
class RoleController extends resource_controller_1.ResourceController {
    constructor() {
        super(role_model_1.RoleModel);
        this.setRoutes('/roles', '/role');
    }
}
exports.RoleController = RoleController;
exports.default = new RoleController();
