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

export class Application {
	public application: express.Application;

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
			.use('/api/v1', UserController.router)
			.use('/api/v1', RoleController.router)
			.use('/api/v1', IssueController.router)
			.use('/api/v1', ChapterController.router)
			.use('/api/v1', ArticleController.router)
			.use('/api/v1', ReplyController.router)
			.use('/api', UserController.router)
			.use('/api', RoleController.router)
			.use('/api', IssueController.router)
			.use('/api', ChapterController.router)
			.use('/api', ArticleController.router)
			.use('/api', ReplyController.router);
	}

	public listen(port: number|string): Promise<Server> {
		port = this.normalizePort(port) || 3000;

		this.application.set('port', port);

		return new Promise<Server>((resolve, reject) => {
			const server = this.application.listen(port, () => resolve(server))
			.on('error', (error: Error) => reject(error));
		});
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
