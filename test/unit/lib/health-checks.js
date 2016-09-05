'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
require('sinon-as-promised');

describe('lib/health-checks', () => {
	let healthChecks;

	beforeEach(() => {
		global.fetch = sinon.stub();
		healthChecks = require('../../../lib/health-checks');
	});

	it('exports an object', () => {
		assert.isObject(healthChecks);
	});

	it('has an `init` method', () => {
		assert.isFunction(healthChecks.init);
	});

	describe('.init(config)', () => {

		beforeEach(() => {
			healthChecks.pingService = sinon.stub();
			sinon.stub(global, 'setInterval');
			healthChecks.init({
				cloudinaryAccountName: 'testaccount',
				customSchemeStore: 'http://foo/'
			});
		});

		afterEach(() => {
			global.setInterval.restore();
		});

		it('calls `pingService` with a Cloudinary URL', () => {
			assert.calledWithExactly(healthChecks.pingService, 'cloudinary', 'http://res.cloudinary.com/testaccount/image/fetch/http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img');
		});

		it('calls `pingService` with a custom scheme URL', () => {
			assert.calledWithExactly(healthChecks.pingService, 'customSchemeStore', 'http://foo/fticon/v1/cross.svg');
		});

		it('sets an interval to ping the services again', () => {
			assert.calledOnce(global.setInterval);
			assert.isFunction(global.setInterval.firstCall.args[0]);
			assert.strictEqual(global.setInterval.firstCall.args[1], 60 * 1000);
		});

		describe('when no custom scheme store is specified in the config', () => {

			beforeEach(() => {
				healthChecks.pingService.reset();
				healthChecks.init({
					cloudinaryAccountName: 'testaccount'
				});
			});

			it('calls `pingService` with the expected default store', () => {
				assert.calledWithExactly(healthChecks.pingService, 'customSchemeStore', '/fticon/v1/cross.svg');
			});

		});

	});

	it('has a `pingService` method', () => {
		assert.isFunction(healthChecks.pingService);
	});

	describe('.pingService(name, url)', () => {

		beforeEach(() => {
			global.fetch.resolves({
				ok: true
			});
			return healthChecks.pingService('foo', 'bar');
		});

		it('fetches the given URL', () => {
			assert.calledOnce(global.fetch);
			assert.calledWithExactly(global.fetch, 'bar');
		});

		it('sets the status of the check to `true`', () => {
			assert.isTrue(healthChecks.statuses.foo);
		});

		describe('when the response from the URL is not OK', () => {

			beforeEach(() => {
				global.fetch.resolves({
					ok: false
				});
				return healthChecks.pingService('foo', 'bar');
			});

			it('sets the status of the check to `false`', () => {
				assert.isFalse(healthChecks.statuses.foo);
			});

		});

		describe('when the fetch errors', () => {

			beforeEach(() => {
				global.fetch.rejects('error');
				return healthChecks.pingService('foo', 'bar');
			});

			it('sets the status of the check to `false`', () => {
				assert.isFalse(healthChecks.statuses.foo);
			});

		});

	});

	it('has a `statuses` property', () => {
		assert.isObject(healthChecks.statuses);
		assert.deepEqual(healthChecks.statuses, {});
	});

	it('has a `cloudinary` property', () => {
		assert.isObject(healthChecks.cloudinary);
	});

	describe('.cloudinary', () => {

		it('has a `getStatus` method', () => {
			assert.isFunction(healthChecks.cloudinary.getStatus);
		});

		describe('.getStatus()', () => {

			it('returns an object', () => {
				assert.isObject(healthChecks.cloudinary.getStatus());
			});

		});

	});

	it('has a `customSchemeStore` property', () => {
		assert.isObject(healthChecks.customSchemeStore);
	});

	describe('.customSchemeStore', () => {

		it('has a `getStatus` method', () => {
			assert.isFunction(healthChecks.customSchemeStore.getStatus);
		});

		describe('.getStatus()', () => {

			it('returns an object', () => {
				assert.isObject(healthChecks.customSchemeStore.getStatus());
			});

		});

	});

});