# Phonebox

TODO Github description: Make a phone call when a box is opened, using a Bluetooth Low Energy connection to a micro:bit

***

A small box which, when opened, causes your phone to ring and play a pre-recorded message.

Created for my dad's birthday, to demonstrate the capabilities of the [micro:bit](http://microbit.org/) (part of his gift).

(When the micro:bit detects light, it sends a message to a nearby computer using BLE. The computer sends a request to Twilio, and Twilio makes the phone call.)

## This repository

There are three parts to this project:

1. The micro:bit code
2. A local server (node.js) which hosts a page that can connect to the micro:bit (using Web Bluetooth in Google Chrome), and which passes messages from that page to Twilio
3. A regular webserver serving the recording that Twilio should play

This repository contains the [micro:bit code](TODO) and the [web bluetooth](TODO) code.

## Run it

1. Flash the micro:bit with [TODO.hex](TODO)
2. Run the web server: `node server.js --account=<Twilio account ID> --token=<Twilio authentication token> --number=<Twilio number>`
3. Open the webpage, and give the number to dial as a query string: `http://localhost:8080?num=5551234567`
4. Connect to micro:bit...

## Editing the micro:bit code

The micro:bit code is written in [MakeCode](http://makecode.microbit.org).
You can import the hex file into MakeCode to edit it.

There's also [a printable copy of the micro:bit source](TODO) in the `microbit/` folder.
