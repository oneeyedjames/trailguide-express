import { Model, model } from 'mongoose';

import { promisify } from './lib/promisify';
import { Authenticator, UserData } from './lib/authenticator';

import { UserDocument, UserSchema } from './user.model';

class UserController extends Authenticator {
	private model: Model<UserDocument>;

	constructor() {
		super();

		this.model = model<UserDocument>('User', UserSchema);

		this.router.get('/profile', this.getProfile.bind(this));
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

	private getProfile(req, res) {
		let userId = req['session'].userId;
		if (userId) {
			promisify<UserDocument>(this.model.findById.bind(this.model), userId)
			.then((user: UserDocument) => {
				let userData = {};

				UserSchema.eachPath((path, type) => {
					if (path != 'passwordHash')
						userData[path] = user[path];
				});

				res.json(userData);
			})
			.catch((err: Error) => res.sendStatus(500));
		} else {
			res.sendStatus(401);
		}
	}
}

export default new UserController();
