import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Schema, Model, model } from 'mongoose';

import { Controller } from './lib/controller';
import { promisify } from './lib/promisify';

import { ResourceDocument } from './resource.model'
import { UserDocument, UserModel } from './user.model';
import { RoleDocument, RoleModel } from './role.model';

export class ResourceController<T extends ResourceDocument> extends Controller<T> {
	private _user: UserDocument;
	private _roles: RoleDocument[];

	protected resourceType: string;

	get user(): UserDocument { return this._user; }

	get roles(): RoleDocument[] { return this._roles; }

	get isAuthenticated(): boolean { return this._user != null; }

	get isAdministrator(): boolean { return this.isAuthenticated && this.user.admin; }

	constructor(resModel: Model<T>) {
		super(resModel);

		this.resourceType = resModel.modelName.toLowerCase();

		this.router.use(this.getUser());
	}

	protected hasPermission(action: string, resource: string): boolean {
		for (let role of this.roles) {
			for (let perm of role.permissions) {
				if (perm.action == action && perm.resource == resource)
					return true;
			}
		}

		return false;
	}

	protected hasOverridePermission(action: string, resource: string): boolean {
		for (let role of this.roles) {
			for (let perm of role.permissions) {
				if (perm.action == action && perm.resource == resource && perm.override)
					return true;
			}
		}

		return false;
	}

	protected canEdit(doc?: T): boolean {
		if (!this.isAuthenticated)
			return false;
		else if (this.isAdministrator)
			return true;

		if (doc == undefined)
			return this.hasPermission('create', this.resourceType);

		if (doc.createdBy == this.user.id || doc.createdBy == null)
			return this.hasPermission('update', this.resourceType);

		return this.hasOverridePermission('update', this.resourceType);
	}

	protected canDelete(doc: T): boolean {
		if (!this.isAuthenticated)
			return false;
		else if (this.isAdministrator)
			return true;

		if (doc.createdBy == this.user.id || doc.createdBy == null)
			return this.hasPermission('delete', this.resourceType);

		return this.hasOverridePermission('delete', this.resourceType);
	}

	protected beforeCreate(doc: T): T {
		doc.modifiedBy = doc.createdBy = this.user.id;
		doc.modifiedAt = doc.createdAt = new Date();

		return doc;
	}

	protected beforeUpdate(doc: T): T {
		doc.modifiedBy = this.user.id;
		doc.modifiedAt = new Date();

		if (doc.createdBy == undefined)
			doc.createdBy = doc.modifiedBy;

		if (doc.createdAt == undefined)
			doc.createdAt = doc.modifiedAt;

		return doc;
	}

	private getUser(): RequestHandler {
		const userQuery = UserModel.findById.bind(UserModel);
		const roleQuery = RoleModel.find.bind(RoleModel);

		return (req: Request, resp: Response, next: NextFunction) => {
			// Required for preflight in CORS requests
			if (req.method == 'OPTIONS')
				return resp.sendStatus(200);

			let userId = req.session.userId;
			if (userId) {
				promisify<UserDocument>(userQuery, req.session.userId)
				.then((user: UserDocument) => this._user = user)
				.then((user: UserDocument) => promisify<RoleDocument[]>(roleQuery, { _id: user.roles }))
				.then((roles: RoleDocument[]) => this._roles = roles)
				.then((roles: RoleDocument[]) => next())
				.catch((err: any) => resp.sendStatus(500));
			} else {
				resp.sendStatus(401);
			}
		};
	}
}
