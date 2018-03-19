import { ResourceController } from './resource.controller';

import { RoleModel, RoleDocument } from './role.model';

export class RoleController extends ResourceController<RoleDocument> {
	constructor() {
		super(RoleModel);

		this.setRoutes('/roles', '/role');
	}
}

export default new RoleController();
