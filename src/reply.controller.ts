import { ResourceController } from './resource.controller';

import { ReplyDocument, ReplySchema } from './reply.model';
import { ArticleDocument } from './article.model';

export class ReplyController extends ResourceController<ReplyDocument> {
	constructor() {
		super('Reply', ReplySchema);

		this.setRoutes('/replies', '/reply');

		this.addSubRoute('reply', 'Article', (article: ArticleDocument): object => {
			return { article: article.id, createdBy: this.user.id };
		}, true);
	}
}

export default new ReplyController();
