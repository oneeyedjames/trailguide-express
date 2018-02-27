import { Router, Request, Response, NextFunction } from 'express';
import { Document, Schema, model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import { promisify } from './promisify';

interface Session { session: any }

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

	public isAuthenticated(req: Request & Session, res: Response, next: NextFunction) {
		// console.log(req.session.userId);
		next();
	}

	private logIn(req: Request & Session, res: Response) {
		this.findUser(req.body.username).then((user: UserData) => {
			if (user == null) throw new Error('Invalid Username');
			bcrypt.compare(req.body.password, user.passwordHash)
			.then((isMatch: boolean) => {
				if (!isMatch) throw new Error('Invalid Password');
				req.session.userId = user.id;
				res.sendStatus(204);
			});
		}).catch((err: any) => {
			req.session.userId = null;
			res.status(500).json(err);
		});
	}

	private logOut(req: Request & Session, res: Response) {
		promisify(req.session.destroy.bind(req.session))
		.then(() => res.sendStatus(204))
		.catch((err: Error) => res.status(500).json(err));
	}

	private register(req: Request & Session, res: Response) {
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
