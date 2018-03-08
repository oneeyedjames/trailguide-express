import { Request, Response } from 'express';
import { Model, model } from 'mongoose';

import { promisify } from './lib/promisify';
import { Authenticator, UserData } from './lib/authenticator';

import { UserDocument, UserSchema } from './user.model';
import { RoleDocument, RoleSchema } from './role.model';

class UserController extends Authenticator {
	private model: Model<UserDocument>;

	constructor() {
		super();

		this.model = model<UserDocument>('User', UserSchema);

		// const roleModel = model<RoleDocument>('Role', RoleSchema);
		//
		// this.router.use((req, resp, next) => {
		// 	this.findUser('admin').then((user: UserDocument) => {
		// 		console.log(user);
        //
		// 		if (user.roles.length == 0) {
		// 			promisify<RoleDocument>(roleModel.findOne.bind(roleModel), {
		// 				title: 'Administrator'
		// 			}).then((role: RoleDocument) => {
		// 				if (!role) {
		// 					return promisify<RoleDocument>(roleModel.create.bind(roleModel), {
		// 						title: 'Administrator',
		// 						description: 'This is an administrator.',
		// 						permissions: [{
		// 							action: 'create',
		// 							resource: 'issue',
		// 							override: true
		// 						}, {
		// 							action: 'update',
		// 							resource: 'issue',
		// 							override: true
		// 						}, {
		// 							action: 'delete',
		// 							resource: 'issue',
		// 							override: true
		// 						}]
		// 					});
		// 				}
		// 			}).then((role: RoleDocument) => {
		// 				user.roles.push(role._id);
		// 				return user.save();
		// 			}).then((user: UserDocument) => {
		// 				next();
		// 			});
		// 		}
		// 	}).catch((err: any) => resp.sendStatus(500));
		// });

		this.router.get('/user/me', this.getCurrentUser.bind(this));
		this.router.get('/user/:username', this.getUser.bind(this));
	}

	protected findUser(username: string): Promise<UserData> {
		return promisify<UserData>(this.model.findOne.bind(this.model), {
			username: username
		});
	}

	protected createUser(username: string, passwordHash: string) {
		return this.model.create({
			username: username,
			passwordHash: passwordHash
		});
	}

	private getUser(req: Request, resp: Response) {
		this.findUser(req.params.username)
		.then((user: UserDocument) => this.sanitize(user))
		.then((userData: object) => resp.json(userData))
		.catch(this.error(resp));
	}

	private getCurrentUser(req: Request, resp: Response) {
		let userId = req.session.userId;
		if (userId) {
			let userDoc: UserDocument;

			let query = this.model.findById.bind(this.model);

			const roleModel = model<RoleDocument>('Role', RoleSchema);

			promisify<UserDocument>(query, userId)
			.then((user: UserDocument) => {
				userDoc = user;

				return promisify<RoleDocument[]>(roleModel.find.bind(roleModel), {
					_id: user.roles
				});
			})
			.then((roles: RoleDocument[]) => this.sanitize(userDoc, roles))
			.then((userData: object) => resp.json(userData))
			.catch(this.error(resp));
		} else {
			resp.sendStatus(401);
		}
	}

	private sanitize(user: UserDocument, roles?: RoleDocument[]): object {
		if (!user)
			throw new Error('Not Found');

		let userData = {};

		UserSchema.eachPath((path, type) => {
			if (path != 'passwordHash' && path != 'roles')
				userData[path] = user[path];
		});

		if (roles != undefined)
			userData['roles'] = roles;

		return userData;
	}

	private error(resp: Response): (err: Error) => void {
		return (err: Error) => {
			switch (err.message) {
				case 'Unauthorized':
					resp.sendStatus(401);
					break;
				case 'Not Found':
					resp.sendStatus(404);
					break;
				default:
					resp.status(500).json(err);
					break;
			}
		}
	}
}

export default new UserController();
