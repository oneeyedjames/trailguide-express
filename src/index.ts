import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

import { promisify } from './lib/promisify';
import { Address, Application } from './app';

dotenv.config();

promisify<void>(mongoose.connect.bind(mongoose), 'mongodb://localhost/trailguide')
.then(() => new Application(mongoose.connection).listen(process.env.PORT))
.then((addr: Address) => console.log(`Server listening on ${addr.address}:${addr.port} ...`))
.catch((error: Error) => console.error('Server Error: ', error.message || error));
