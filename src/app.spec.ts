import * as supertest from 'supertest';

import { describe, it, beforeEach, afterEach } from 'mocha';

import * as dotenv from 'dotenv';

dotenv.config();

import { Application } from './app';

describe('loading server', () => {
	let app;

	beforeEach(() => {
		app = new Application();
		app.listen(3000);
	});

	afterEach((done) => {
		app.close().then(() => done());
	});

	it('should respond', (done) => {
		supertest(app.application)
		.get('/api/issues')
		.expect(200, done);
		done();
	});
});
