import { Server } from 'http';

import * as express	from 'express';
import * as session	from 'express-session';
import * as mongoose from 'mongoose';

import * as connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import * as bodyParser   from 'body-parser';
import * as cookieParser from 'cookie-parser';

import UserController from './user.controller';
import RoleController from './role.controller';

import IssueController   from './issue.controller';
import ChapterController from './chapter.controller';
import ArticleController from './article.controller';
import ReplyController   from './reply.controller';

export interface Address {
	port: number;
	family: string;
	address: string;
}

export class Application {
	public application: express.Application;
	public server: Server;

	constructor() {
		this.application = express()
		.use(bodyParser.json())
		.use(bodyParser.urlencoded({ extended: false }))
		.use(cookieParser())
		.use(session({
			secret: process.env.COOKIE_SECRET,
			resave: false,
			saveUninitialized: false,
			store: new MongoStore({
				mongooseConnection: mongoose.connection,
				autoRemove: 'native'
			})
		}))
		.use(this.enableCors)
		.get('/api/v1', (req, resp) => resp.sendStatus(200))
		.get('/api', (req, resp) => resp.sendStatus(200));

		let controllers = [
			UserController,
			RoleController,
			IssueController,
			ChapterController,
			ArticleController,
			ReplyController
		];

		for (let controller of controllers) {
			this.application
			.use('/api/v1', controller.router)
			.use('/api', controller.router);
		}
	}

	public listen(port: number|string): Promise<Address> {
		port = this.normalizePort(port) || 3000;

		this.application.set('port', port);

		return new Promise<Address>((resolve, reject) => {
			this.server = this.application
			.listen(port, () => resolve(this.server.address()))
			.on('error', (error: Error) => reject(error));
		});
	}

	public close(): Promise<any> {
		if (this.server) {
			return new Promise<any>((resolve, reject) => {
				this.server.close(() => {
					this.server = null;
					resolve();
				});
			});
		} else {
			return Promise.reject(new Error('Server is already closed.'));
		}
	}

	private normalizePort(val: number|string): number|string {
		let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;

		if (isNaN(port))
			return val;

		return port;
	}

	private enableCors(req, res, next) {
		res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		res.header('Access-Control-Allow-Credentials', 'true');
		res.header('Access-Control-Expose-Headers', 'Set-Cookie');

		next();
	}
}
