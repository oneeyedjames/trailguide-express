import { ResourceController } from './resource.controller';

import { RoleDocument, RoleSchema } from './role.model';

export class RoleController extends ResourceController<RoleDocument> {
	constructor() {
		super('Role', RoleSchema);

		this.setRoutes('/roles', '/role');
	}
}

export default new RoleController();
