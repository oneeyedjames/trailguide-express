"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./resource.controller");
const article_model_1 = require("./article.model");
class ArticleController extends resource_controller_1.ResourceController {
    constructor() {
        super('Article', article_model_1.ArticleSchema);
        this.setRoutes('/articles', '/article');
        this.addSubRoute('articles', 'Chapter', (chapter) => {
            return { chapter: chapter._id };
        });
    }
    beforeCreate(doc) {
        return super.beforeCreate(doc);
    }
    beforeUpdate(doc) {
        doc = super.beforeUpdate(doc);
        return doc;
    }
    afterUpdate(doc) {
        doc = super.beforeUpdate(doc);
        return doc;
    }
}
exports.ArticleController = ArticleController;
exports.default = new ArticleController();
