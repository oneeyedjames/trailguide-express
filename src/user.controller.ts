import { Request, Response } from 'express';
import { Model, model } from 'mongoose';

import { promisify } from './lib/promisify';
import { Authenticator, UserData } from './lib/authenticator';

import { UserDocument, UserSchema } from './user.model';

class UserController extends Authenticator {
	private model: Model<UserDocument>;

	constructor() {
		super();

		this.model = model<UserDocument>('User', UserSchema);

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
			let query = this.model.findById.bind(this.model);

			promisify<UserDocument>(query, userId)
			.then((user: UserDocument) => this.sanitize(user))
			.then((userData: object) => resp.json(userData))
			.catch(this.error(resp));
		} else {
			resp.sendStatus(401);
		}
	}

	private sanitize(user: UserDocument): object {
		if (!user)
			throw new Error('Not Found');

		let userData = {};

		UserSchema.eachPath((path, type) => {
			if (path != 'passwordHash')
				userData[path] = user[path];
		});

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
