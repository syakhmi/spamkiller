const nock = require('nock');
const chai = require('chai');

// Add to global scope.
Twilio = require('twilio');

const twilioentry = require('./twilioentry.js')

let expect = chai.expect;
let assert = chai.assert;

NOCK_BASE_URL = 'https://localhost:2020/nock'

CLIENT_ID = 'my-client-id';
CLIENT_SECRET = 'my-client-secret';
OAUTH_TOKEN = 'my-oauth-refresh-token';
OAUTH_API_URL = `${NOCK_BASE_URL}/oauth`;
CONTACTS_API_URL = `${NOCK_BASE_URL}/contacts`;
SIP_DIAL_URL = 'sip:me@localhost:2020'
SIP_DIAL_ACTION = 'https://localhost:2020/sipdialaction';
FORWARDING_NUMBER = '+12394930285';

let base_context = {
	CLIENT_ID: CLIENT_ID,
	CLIENT_SECRET: CLIENT_SECRET,
	OAUTH_TOKEN: OAUTH_TOKEN,
	OAUTH_API_URL: OAUTH_API_URL,
	CONTACTS_API_URL: CONTACTS_API_URL,
	SIP_DIAL_URL: SIP_DIAL_URL,
	SIP_DIAL_ACTION: SIP_DIAL_ACTION,
	FORWARDING_NUMBER: FORWARDING_NUMBER
}

describe('handler', () => {
	let token_request = null;
	let contact_request = null;

	beforeEach(()=>{
		nock.cleanAll();
		token_request = nock(NOCK_BASE_URL)
			.post('/oauth/token')
			.reply(200, {
				access_token: 'access_token'
			});
		contact_request = nock(NOCK_BASE_URL)
			.filteringPath((path) => {
				return '/nock/contacts/full'
			})
			.get('/contacts/full')
			.reply(200, {
				feed: {
					entry: [
						{}
					]
				}
			});
	});

	it('retreives access key', (done) => {
		twilioentry.handler(base_context, {}, ()=>{
			token_request.done();
			done();
		});
	});

	it('requests contact', (done) => {
		twilioentry.handler(base_context, {}, ()=>{
			token_request.done();
			contact_request.done()
			done();
		});
	});

	it('responds with SIP dial for valid contact', (done) => {
		twilioentry.handler(base_context, {}, (err, result)=>{
			token_request.done();
			contact_request.done();
			assert.isNull(err);
			assert.isNotNull(result);
			let responseXml = result.response.toString();
			expect(responseXml).to.contain('</Dial>');
			expect(responseXml).to.contain('</Sip>');
			expect(responseXml).to.contain(SIP_DIAL_URL);
			expect(responseXml).to.contain(`action="${SIP_DIAL_ACTION}"`);
			done();
		});
	});

	it('forwards for invalid contact', (done) => {
		nock.cleanAll();
		token_request = nock(NOCK_BASE_URL)
			.post('/oauth/token')
			.reply(200, {
				access_token: 'access_token'
			});
		contact_request = nock(NOCK_BASE_URL)
			.filteringPath((path) => {
				return '/nock/contacts/full'
			})
			.get('/contacts/full')
			.reply(200, {
				feed: {
					entry: []
				}
			});
		twilioentry.handler(base_context, {}, (err, result)=>{
			token_request.done();
			contact_request.done();
			assert.isNull(err);
			assert.isNotNull(result);
			let responseXml = result.response.toString();
			expect(responseXml).to.contain('</Dial>');
			expect(responseXml).to.contain(FORWARDING_NUMBER);
			done();
		});
	});

	it('propagates 401 error', (done) => {
		nock.cleanAll();
		token_request = nock(NOCK_BASE_URL)
			.post('/oauth/token')
			.reply(401);
		contact_request = nock(NOCK_BASE_URL)
			.filteringPath((path) => {
				return '/nock/contacts/full'
			})
			.get('/contacts/full')
			.reply(200, {
				feed: {
					entry: []
				}
			});
		twilioentry.handler(base_context, {}, (err, result)=>{
			token_request.done();
			expect(contact_request.isDone()).to.equal(false);
			assert.isNotNull(err);
			assert.isNull(result);
			expect(err).to.contain('No access_token')
			done();
		});
	});
});
