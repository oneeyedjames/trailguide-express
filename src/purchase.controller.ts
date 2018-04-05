import { ResourceController } from './resource.controller';

import { IssueDocument }                   from './issue.model';
import { PurchaseModel, PurchaseDocument } from './purchase.model';

export class PurchaseController extends ResourceController<PurchaseDocument> {
	constructor() {
		super(PurchaseModel);

		this.setRoutes('/purchases', '/purchase');

		this.addSubRoute('purchases', 'Issue', (issue: IssueDocument): object => {
			return { issue: issue._id };
		});
	}
}

export default new PurchaseController();
