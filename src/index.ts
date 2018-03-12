import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

import { Address, Application } from './app';

dotenv.config();

mongoose.connect('mongodb://localhost/trailguide', (error: Error) => {
	if (error) {
		console.error('DB Connect Error: ', error);
	} else {
		new Application().listen(process.env.PORT)
		.then((addr: Address) => console.log(`Server listening on ${addr.address}:${addr.port} ...`))
		.catch((error: Error) => console.error('Server Error: ', error.message || error));
	}
});
