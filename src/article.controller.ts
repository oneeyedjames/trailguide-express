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
}

export default new ArticleController();
