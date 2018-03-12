import { ResourceController } from './resource.controller';

import { IssueModel, IssueDocument } from './issue.model';
import { ChapterDocument }           from './chapter.model';

export class IssueController extends ResourceController<IssueDocument> {
	constructor() {
		super(IssueModel);

		this.setRoutes('/issues', '/issue');

		this.addSubRoute('issue', 'Chapter', (chapter: ChapterDocument): object => {
			return { _id: chapter.issue };
		}, true);
	}
}

export default new IssueController();
