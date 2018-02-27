"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./lib/controller");
const chapter_model_1 = require("./chapter.model");
class ChapterController extends controller_1.Controller {
    constructor() {
        super('Chapter', chapter_model_1.ChapterSchema);
        this.setRoutes('/chapters', '/chapter');
        this.addSubRoute('chapters', 'Issue', (issue) => {
            return { issue: issue._id };
        });
    }
}
exports.ChapterController = ChapterController;
exports.default = new ChapterController();
