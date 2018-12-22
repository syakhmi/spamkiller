spam-killer
===========

Scripts for Twilio's Programmable Voice platform to filter incoming calls for spam. Designed for my idiosyncratic cell phone setup, which includes:

1. Cell Phone
1. Google Voice
1. Twilio Number w/ Programmable Voice
1. Smartphone-based SIP Endpoint App

This repo includes two scripts: 1) Cell phone forwards directly to Twilio, Google Voice used only for voicemail 2) Cell phone forwards to Google Voice, which has Twilio set up as a forwarding number.

In either case, I can only receive incoming calls through VOIP with an SIP smartphone app.

### twilioentry.js

Cell Phone +--> Twilio +--> Smartphone SIP Endpoint (contacts)
                       |
                       +--> Google Voicemail (non-contacts)

In this setup, the Twilio script receives all incoming calls, chooses whether to accept the call (i.e., forward to my smartphone), and forwards all calls to Google Voice for voicemail functionality.

### googlevoiceentry.js

Cell Phone +--> Google Voice +--> Twilio +--> Smartphone SIP Endpoint (contacts only)

In this setup, the Twilio script chooses whether to accept (i.e., foward to my smartphone) or reject the call from Google Voice.

License
-------

Copyright &copy; 2018 Sahil Yakhmi

>This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

>This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

>You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
