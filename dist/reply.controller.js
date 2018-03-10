"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./resource.controller");
const reply_model_1 = require("./reply.model");
class ReplyController extends resource_controller_1.ResourceController {
    constructor() {
        super('Reply', reply_model_1.ReplySchema);
        this.setRoutes('/replies', '/reply');
        this.addSubRoute('reply', 'Article', (article) => {
            return { article: article.id, createdBy: this.user.id };
        }, true);
    }
}
exports.ReplyController = ReplyController;
exports.default = new ReplyController();
