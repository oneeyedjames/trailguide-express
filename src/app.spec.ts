import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';

import * as supertest from 'supertest';
import * as dotenv from 'dotenv';

dotenv.config();

import { Application } from './app';

describe('loading server', () => {
	let app, request;

	beforeEach(() => {
		app = new Application();
		app.listen(3000);

		request = supertest(app.application);
	});

	afterEach((done) => {
		app.close().then(done);
	});

	it('should respond', (done) => {
		request.get('/api/v1')
		.expect(200, done);
	});
});
