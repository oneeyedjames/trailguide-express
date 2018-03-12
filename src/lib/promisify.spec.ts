import { describe, it } from 'mocha';
import { expect } from 'chai';

import { promisify } from './promisify';

let succeed = (fn: (err: any, res?: string) => void) => fn(null, 'You SUCCEED');
let fail = (fn: (err: any, res?: string) => void) => fn(new Error('You FAIL'));

describe('Promisify<T> function for node-style async functions', () => {
	it('should succeed', async () => {
		let output = await promisify<string>(succeed);

		expect(output).to.equal('You SUCCEED');
	});

	it('should fail', async () => {
		let output: string;
		let err: Error;

		try {
			output = await promisify<string>(fail);
		} catch (e) {
			err = e as Error;
		}

		expect(err.message).to.equal('You FAIL');
	});
});
