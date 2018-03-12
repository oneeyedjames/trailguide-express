import { describe, it } from 'mocha';
import { expect } from 'chai';

import * as bcrypt from 'bcrypt';
import { Authenticator, UserData } from './authenticator';

class TestAuthenticator extends Authenticator {
	public testUser: UserData

	constructor(testUser: UserData) {
		super();
		this.testUser = testUser;
	}

	protected findUser(username: string): Promise<UserData> {
		return new Promise<UserData>((resolve, reject) => {
			if (username == this.testUser.username)
				resolve(this.testUser);
			else
				reject('Invalid username');
		});
	}

	protected createUser(username: string, passwordHash: string): Promise<UserData> {
		return new Promise<UserData>((resolve, reject) => {
			if (username == 'testuser')
				resolve(this.testUser);
		});
	}
}

describe('Authenticator for Express server', () => {
	it('uses promises', async () => {
		let salt = await bcrypt.genSalt(10);
		let hash = await bcrypt.hash('testpass', salt);
		let auth = new TestAuthenticator({
			username: 'testuser',
			passwordHash: hash
		});

		let user = await auth.authenticate('testuser', 'testpass');

		expect(user.username).to.equal('testuser');
		expect(user.passwordHash).to.equal(hash);
	});
});
