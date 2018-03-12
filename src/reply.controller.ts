import { ResourceController } from './resource.controller';

import { ArticleDocument }           from './article.model';
import { ReplyModel, ReplyDocument } from './reply.model';

export class ReplyController extends ResourceController<ReplyDocument> {
	constructor() {
		super(ReplyModel);

		this.setRoutes('/replies', '/reply');

		this.addSubRoute('reply', 'Article', (article: ArticleDocument): object => {
			return { article: article.id, createdBy: this.user.id };
		}, true);
	}
}

export default new ReplyController();
