import { Server } from 'http';

import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

import { Application } from './app';

dotenv.config();

mongoose.connect('mongodb://localhost/trailguide', (error: Error) => {
	if (error) {
		console.error('DB Connect Error: ', error);
	} else {
		const app = new Application();
		app.listen(process.env.PORT).then((server: Server) => {
			let addr = server.address();
			let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
			console.log(`Server listening on ${bind}...`);
		}).catch((error: Error) => {
			console.error('Server Error: ', error);
		});
	}
});
