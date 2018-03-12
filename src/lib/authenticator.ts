import { Router, Request, Response, NextFunction } from 'express';
import { Document, Schema, model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import { promisify } from './promisify';

export interface UserData {
	id?: string;
	username: string;
	passwordHash: string;
}

export abstract class Authenticator {
	public router: Router;

	constructor() {
		this.router = Router()
			.post('/login', this.logIn.bind(this))
			.post('/logout', this.logOut.bind(this))
			.post('/register', this.register.bind(this));
	}

	protected abstract findUser(username: string): Promise<UserData>;
	protected abstract createUser(username: string, passwordHash: string): Promise<UserData>;

	public authenticate(username: string, password: string): Promise<UserData> {
		let userData: UserData;

		return this.findUser(username)
		.then((user: UserData) => {
			if (user == null) throw new Error('Invalid Username');
			userData = user;
			return bcrypt.compare(password, user.passwordHash);
		})
		.then((isMatch: boolean) => {
			if (!isMatch) throw new Error('Invalid Password');
			return userData;
		});
	}

	private logIn(req: Request, res: Response) {
		this.authenticate(req.body.username, req.body.password)
		.then((user: UserData) => {
			req.session.userId = user.id;
			res.sendStatus(204);
		})
		.catch((err: any) => {
			req.session.userId = null;
			res.status(500).json(err);
		});
	}

	private logOut(req: Request, res: Response) {
		promisify(req.session.destroy.bind(req.session))
		.then(() => res.sendStatus(204))
		.catch((err: Error) => res.status(500).json(err));
	}

	private register(req: Request, res: Response) {
		this.findUser(req.body.username)
		.then((user: UserData) => {
			if (user != null) throw new Error('Username already exists');
			return bcrypt.genSalt(10);
		})
		.then((salt) => bcrypt.hash(req.body.password, salt))
		.then((hash) => this.createUser(req.body.username, hash))
		.then((user: UserData) => {
			req.session.userId = user.id;
			user.passwordHash = null;
			res.json(user);
		})
		.catch((err: any) => res.status(500).json(err));
	}
}
