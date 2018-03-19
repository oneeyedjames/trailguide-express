import { Request, Response, NextFunction } from 'express';
import { Types, Schema, Model, model } from 'mongoose';

import { HttpError } from './lib/http';
import { Authenticator, UserData } from './lib/authenticator';

import { UserModel, UserDocument, UserSchema } from './user.model';
import { RoleModel, RoleDocument } from './role.model';

import ObjectId = Schema.Types.ObjectId;

class UserController extends Authenticator {
	private static hiddenFields = [ 'passwordHash' ];
	private static privateFields = [ 'roles', 'admin' ];

	private sessionUser: UserDocument;

	constructor() {
		super();

		// this.router.use((req, resp, next) => {
		// 	this.findUser('admin').then((user: UserDocument) => {
		// 		if (!user.admin) {
		// 			user.admin = true;
		// 			return user.save();
		// 		} else {
		// 			return user;
		// 		}
		// 	})
		// 	.then((user: UserDocument) => next())
		// 	.catch((err: any) => resp.sendStatus(500));
		// });

		this.router.use(this.initSessionUser.bind(this));
		this.router.get('/users',    this.getAll.bind(this));
		this.router.get('/user/me',  this.getMe.bind(this));
		this.router.get('/user/:id', this.getOne.bind(this));
		this.router.put('/user/:id', this.update.bind(this));
	}

	protected findUser(username: string): Promise<UserData> {
		return UserModel.findOne({ username: username }).exec();
	}

	protected createUser(username: string, passwordHash: string): Promise<UserData> {
		return RoleModel.findOne({ title: 'Reader' }).exec()
		.then((role: RoleDocument) => {
			let now = new Date();

			return UserModel.create({
				username: username,
				passwordHash: passwordHash,
				roles: [ role.id ],
				admin: false,
				createdAt: now,
				modifiedAt: now
			});
		});
	}

	private initSessionUser(req: Request, resp: Response, next: NextFunction) {
		let userId = req.session.userId;
		if (userId) {
			UserModel.findById(userId).populate('roles').exec()
			.then((user: UserDocument) => this.sessionUser = user)
			.then((user: UserDocument) => next())
			.catch((err: Error) => next());
		} else {
			next();
		}
	}

	private getAll(req: Request, resp: Response) {
		if (this.sessionUser) {
			if (!this.sessionUser.admin)
				throw new HttpError(401);

			UserModel.find().populate('roles').exec()
			.then((users: UserDocument[]) => {
				let userData: object[] = [];

				for (let user of users)
					userData.push(this.sanitize(user));

				resp.json(userData);
			})
			.catch(this.error(resp));

		} else {
			resp.sendStatus(401);
		}
	}

	private getOne(req: Request, resp: Response) {
		let id = this.parseId(req.params.id);
		let args = id ? { _id: id } : { username: req.params.id };

		UserModel.findOne(args).populate('roles').exec()
		.then((user: UserDocument) => this.sanitize(user))
		.then((userData: object) => resp.json(userData))
		.catch(this.error(resp));
	}

	private getMe(req: Request, resp: Response) {
		if (this.sessionUser) {
			resp.json(this.sanitize(this.sessionUser));
		} else {
			resp.sendStatus(401);
		}
	}

	private update(req: Request, resp: Response) {
		UserModel.findById(req.params.id).exec()
		.then(this.authorize.bind(this))
		.then((user: UserDocument) => {
			for (let key in req.body)
				user[key] = req.body[key];

			user.modifiedAt = new Date();

			return user.save();
		})
		.then((user: UserDocument) => user.populate('roles').execPopulate())
		.then((user: UserDocument) => this.sanitize(user))
		.then((userData: object) => resp.json(userData))
		.catch(this.error(resp));
	}

	private delete(req: Request, resp: Response) {
		UserModel.findById(req.params.id).exec()
		.then(this.authorize.bind(this))
		.then((user: UserDocument) => user.remove())
		.then((user: UserDocument) => resp.sendStatus(204))
		.catch(this.error(resp));
	}

	private parseId(id: string): Types.ObjectId {
		if (id.length == 12 || id.length == 24) {
			try {
				return Types.ObjectId(id);
			} catch (e) {
				return null;
			}
		}

		return null;
	}

	private authorize(user: UserDocument): UserDocument {
		if (!user)
			throw new HttpError(404);

		if (!this.sessionUser)
			throw new HttpError(401);

		if (this.sessionUser.id != user.id && !this.sessionUser.admin)
			throw new HttpError(401);

		return user;
	}

	private sanitize(user: UserDocument): object {
		if (!user) throw new HttpError(404);

		let isPrivate = user.id == this.sessionUser.id || this.sessionUser.admin;

		let userData = {};

		UserSchema.eachPath((path, type) => {
			if (UserController.hiddenFields.indexOf(path) >= 0)
				return;

			if (UserController.privateFields.indexOf(path) >= 0 && !isPrivate)
				return;

			userData[path] = user[path];
		});

		return userData;
	}

	private error(resp: Response): (err: Error) => void {
		return (err: Error) => {
			if (err instanceof HttpError) {
				resp.status(err.status).json({
					error: {
						name: err.name,
						message: err.message
					}
				});
			} else {
				resp.status(500).json({
					error: {
						name: err.name || 'Error',
						message: err.message || err
					}
				});
			}
		}
	}
}

export default new UserController();
