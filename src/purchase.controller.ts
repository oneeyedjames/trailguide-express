import { ResourceController } from './resource.controller';

import { PurchaseModel, PurchaseDocument } from './purchase.model';

export class PurchaseController extends ResourceController<PurchaseDocument> {
	constructor() {
		super(PurchaseModel);

		this.setRoutes('/purchases', '/purchase');
	}
}

export default new PurchaseController();
