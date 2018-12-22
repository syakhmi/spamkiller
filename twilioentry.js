const request = require('request');

function validContactResponse(context, event) {
  let twiml = new Twilio.twiml.VoiceResponse();
  const dial = twiml.dial({
    action: context.SIP_DIAL_ACTION
  });
  dial.sip(context.SIP_DIAL_URL);
  return twiml;
}

function invalidContactResponse(context, event) {
  let twiml = new Twilio.twiml.VoiceResponse();
  twiml.say('This number is not accepting calls from unknown numbers. Please ' +
            'contact this number\'s owner via WhatsApp or Email, or stay on ' +
            'the line to leave a message.');
  twiml.dial(context.FORWARDING_NUMBER);
  return twiml;
}

function checkContact(context, event, token) {
  let phoneNumber = event.From;

  let params = {
    v: '3.0',
    alt: 'json',
    q: phoneNumber,
    access_token: token
  };
  let url = `${context.CONTACTS_API_URL}/full`

  return new Promise((resolve, reject) => {
    request.get({url : url, qs: params,
               qsStringifyOptions: {encode: false}, json: true},
              (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        if (body && body.feed && body.feed.entry && body.feed.entry.length > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}

function requestAccessToken(context, event) {
  let params = {
    client_id: context.CLIENT_ID,
    client_secret: context.CLIENT_SECRET,
    refresh_token: context.OAUTH_TOKEN,
    grant_type: 'refresh_token'
  }
  let url = `${context.OAUTH_API_URL}/token`

  return new Promise((resolve, reject) => {
    request.post({url : url, body: params, json: true}, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        if (body && body.access_token) {
          resolve(body.access_token);
        } else {
          reject("No access_token received");
        }
      }
    });
  });
}

async function runHandlerAsync(context, event) {
  let token = await requestAccessToken(context, event);
  let contactValid = await checkContact(context, event, token);
  if (contactValid) {
    return validContactResponse(context, event);
  } else {
    return invalidContactResponse(context, event);
  }
}

exports.handler = function(context, event, callback) {
  runHandlerAsync(context, event)
    .then((value) => {
      callback(null, value);
    })
    .catch((err) => {
      callback(err, null);
    });
};
