"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./resource.controller");
const reply_model_1 = require("./reply.model");
class ReplyController extends resource_controller_1.ResourceController {
    constructor() {
        super(reply_model_1.ReplyModel);
        this.setRoutes('/replies', '/reply');
        this.addSubRoute('reply', 'Article', (article) => {
            return { article: article.id, createdBy: this.user.id };
        }, true);
    }
    searchArgs(args) {
        args = super.searchArgs(args);
        if (!this.isAdministrator)
            args['createdBy'] = this.user.id.substring(1) + 'f';
        return args;
    }
    canRead(doc) {
        if (!this.isAuthenticated)
            return false;
        else if (doc == undefined)
            return true;
        return doc.createdBy.toString() == this.user.id.substring(1) + 'f';
    }
}
exports.ReplyController = ReplyController;
exports.default = new ReplyController();
