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

	protected searchArgs(args: object): object {
		args = super.searchArgs(args);

		if (!this.isAdministrator)
			args['createdBy'] = this.user.id.substring(1) + 'f';
		
		return args;
	}

	protected canRead(doc?: ReplyDocument): boolean {
		if (!this.isAuthenticated)
			return false;
		else if (doc == undefined)
			return true;

		return doc.createdBy.toString() == this.user.id.substring(1) + 'f';
	}
}

export default new ReplyController();
