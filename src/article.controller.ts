import { ResourceController } from './resource.controller';

import { ChapterDocument }				from './chapter.model';
import { ArticleDocument, ArticleSchema } from './article.model';

export class ArticleController extends ResourceController<ArticleDocument> {
	constructor() {
		super('Article', ArticleSchema);

		this.setRoutes('/articles', '/article');

		this.addSubRoute('articles', 'Chapter', (chapter: ChapterDocument): object => {
			return { chapter: chapter._id };
		});
	}

	protected beforeCreate(doc: ArticleDocument): ArticleDocument {
		return super.beforeCreate(doc);
	}

	protected beforeUpdate(doc: ArticleDocument): ArticleDocument {
		doc = super.beforeUpdate(doc);

		return doc;
	}

	protected afterUpdate(doc: ArticleDocument): ArticleDocument {
		doc = super.beforeUpdate(doc);

		return doc;
	}
}

export default new ArticleController();
