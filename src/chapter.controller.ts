import { ResourceController } from './resource.controller';

import { IssueDocument }				  from './issue.model';
import { ChapterDocument, ChapterSchema } from './chapter.model';

export class ChapterController extends ResourceController<ChapterDocument> {
	constructor() {
		super('Chapter', ChapterSchema);

		this.setRoutes('/chapters', '/chapter');

		this.addSubRoute('chapters', 'Issue', (issue: IssueDocument): object => {
			return { issue: issue._id };
		});
	}
}

export default new ChapterController();
