"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./resource.controller");
const issue_model_1 = require("./issue.model");
class IssueController extends resource_controller_1.ResourceController {
    constructor() {
        super('Issue', issue_model_1.IssueSchema);
        this.setRoutes('/issues', '/issue');
        this.addSubRoute('issue', 'Chapter', (chapter) => {
            return { _id: chapter.issue };
        }, true);
    }
}
exports.IssueController = IssueController;
exports.default = new IssueController();
