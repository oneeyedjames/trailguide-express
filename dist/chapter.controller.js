"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./resource.controller");
const chapter_model_1 = require("./chapter.model");
class ChapterController extends resource_controller_1.ResourceController {
    constructor() {
        super(chapter_model_1.ChapterModel);
        this.setRoutes('/chapters', '/chapter');
        this.addSubRoute('chapters', 'Issue', (issue) => {
            return { issue: issue._id };
        });
        this.addSubRoute('chapter', 'Article', (article) => {
            return { _id: article.chapter };
        }, true);
    }
}
exports.ChapterController = ChapterController;
exports.default = new ChapterController();
