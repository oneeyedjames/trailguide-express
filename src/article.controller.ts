import { Controller } from './lib/controller';

import { ChapterDocument }				from './chapter.model';
import { ArticleDocument, ArticleSchema } from './article.model';

export class ArticleController extends Controller<ChapterDocument> {
	constructor() {
		super('Article', ArticleSchema);

		this.setRoutes('/articles', '/article');

		this.addSubRoute('articles', 'Chapter', (chapter: ChapterDocument): object => {
			return { chapter: chapter._id };
		});
	}
}

export default new ArticleController();
