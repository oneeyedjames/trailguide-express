import { Controller } from './lib/controller';

import { IssueDocument, IssueSchema } from './issue.model';
import { ChapterDocument }			from './chapter.model';

export class IssueController extends Controller<IssueDocument> {
	constructor() {
		super('Issue', IssueSchema);

		this.setRoutes('/issues', '/issue');

		this.addSubRoute('issue', 'Chapter', (chapter: ChapterDocument): object => {
			return { _id: chapter.issue };
		}, true);
	}
}

export default new IssueController();
