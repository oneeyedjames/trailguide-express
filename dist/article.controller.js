"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./lib/controller");
const article_model_1 = require("./article.model");
class ArticleController extends controller_1.Controller {
    constructor() {
        super('Article', article_model_1.ArticleSchema);
        this.setRoutes('/articles', '/article');
        this.addSubRoute('articles', 'Chapter', (chapter) => {
            return { chapter: chapter._id };
        });
    }
}
exports.ArticleController = ArticleController;
exports.default = new ArticleController();
