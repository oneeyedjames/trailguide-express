"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./resource.controller");
const article_model_1 = require("./article.model");
class ArticleController extends resource_controller_1.ResourceController {
    constructor() {
        super(article_model_1.ArticleModel);
        this.setRoutes('/articles', '/article');
        this.addSubRoute('articles', 'Chapter', (chapter) => {
            return { chapter: chapter._id };
        });
    }
}
exports.ArticleController = ArticleController;
exports.default = new ArticleController();
