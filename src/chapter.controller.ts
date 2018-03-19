import { ResourceController } from './resource.controller';

import { IssueDocument }				 from './issue.model';
import { ChapterModel, ChapterDocument } from './chapter.model';
import { ArticleDocument }               from './article.model';

export class ChapterController extends ResourceController<ChapterDocument> {
	constructor() {
		super(ChapterModel);

		this.setRoutes('/chapters', '/chapter');

		this.addSubRoute('chapters', 'Issue', (issue: IssueDocument): object => {
			return { issue: issue._id };
		});

		this.addSubRoute('chapter', 'Article', (article: ArticleDocument): object => {
			return { _id: article.chapter };
		}, true);
	}
}

export default new ChapterController();
