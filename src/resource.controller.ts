import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Schema, Model, model } from 'mongoose';

import { Controller } from './lib/controller';
import { promisify } from './lib/promisify';

import { ResourceDocument } from './resource.model'
import { UserDocument, UserSchema } from './user.model';

export class ResourceController<T extends ResourceDocument> extends Controller<T> {
	private userModel: Model<UserDocument>;
	private _user: UserDocument;

	get user(): UserDocument { return this._user; }

	get isAuthenticated(): boolean { return this._user != null; }

	constructor(name: string, schema: Schema) {
		super(name, schema);

		this.userModel = model<UserDocument>('User', UserSchema);
		this.router.use(this.getUser());
	}

	protected canRead(doc?: T): boolean {
		if (doc == undefined)
			return true;

		return true;
	}

	protected canEdit(doc?: T): boolean {
		if (!this.isAuthenticated)
			return false;

		if (doc == undefined)
			return true;

		return doc.createdBy == this.user.id;
	}

	protected canDelete(doc: T): boolean {
		if (!this.isAuthenticated)
			return false;

		return doc.createdBy == this.user.id;
	}

	protected beforeCreate(doc: T): T {
		doc.modifiedBy = doc.createdBy = this.user.id;
		doc.modifiedAt = doc.createdAt = new Date();
		return doc;
	}

	protected afterCreate(doc: T): T {
		console.log(doc);
		return doc;
	}

	protected beforeUpdate(doc: T): T {
		doc.modifiedBy = this.user.id;
		doc.modifiedAt = new Date();
		return doc;
	}

	protected afterUpdate(doc: T): T {
		console.log(doc);
		return doc;
	}

	private getUser(): RequestHandler {
		const query = this.userModel.findById.bind(this.userModel);
		return (req: Request, res: Response, next: NextFunction) => {
			promisify<UserDocument>(query, req.session.userId)
			.then((user: UserDocument) => {
				this._user = user;
				next();
			}).catch((err: any) => res.sendStatus(500));
		};
	}
}
