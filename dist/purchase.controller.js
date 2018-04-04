"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./resource.controller");
const purchase_model_1 = require("./purchase.model");
class PurchaseController extends resource_controller_1.ResourceController {
    constructor() {
        super(purchase_model_1.PurchaseModel);
        this.setRoutes('/purchases', '/purchase');
    }
}
exports.PurchaseController = PurchaseController;
exports.default = new PurchaseController();
