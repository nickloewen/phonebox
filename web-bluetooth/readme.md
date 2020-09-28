# Phonebox: Web Bluetooth &rarr; Twilio

To run:

    node server.js --account=<twilio account number --token=<twilio authentication token> --number=<twilio number>

There are two parts to this:

- A server which returns web pages in response to GET requests, and sends texts/makes phone calls in respose to PUT requests
  - server.js
- A webpage which connects to the micro:bit using Web Bluetooth, and makes PUT requests to the server to send texts/make phone calls
  - `index.html`
  - `ble-uart-module.js`
  - `telephony-module.js`


