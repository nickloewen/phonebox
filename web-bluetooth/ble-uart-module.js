// Provides easy access to the micro:bit Bluetooth UART

// EXPORTS
export const uBitUart = {
  connect,
  disconnect,
  getConnectionStatus, // Returns true or false
  startUart,
  subscribe, // Takes a callback, calls it with the UART datat as a string
  resetDevice
  // TODO--other possible features:
  // - `send(<string>)`
  // - a function for reading once
}

// SETUP
const NAME_PREFIX = 'BBC micro:bit'
const UART_SERV = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const UART_CHAR_TX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // micro:bit -> web
const UART_CHAR_RX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // web -> micro:bit
// (Remember that UUIDs have to be lowercase)

// STATE
let device;
let server; // Actual connection
let uart = {}; // Services and characteristics

// MAIN FUNCTIONS
async function connect() {
  device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: NAME_PREFIX }],
    optionalServices: [ UART_SERV ]
  });
  server = await device.gatt.connect();
  console.log('Connected to', device.name);
}

async function startUart() {
  uart.service = await server.getPrimaryService(UART_SERV);
  uart.receive = await uart.service.getCharacteristic(UART_CHAR_TX);
  uart.send = await uart.service.getCharacteristic(UART_CHAR_RX);
}

// Returns a string
async function subscribe(handleMessage) {
  if (!uart.receive) {
    await startUart();
  }

  function wrapper(e, callback) {
    callback( decodeUartMessage( e) );
  }

  uart.receive.addEventListener('characteristicvaluechanged', (e) => wrapper(e, handleMessage) );
  uart.receive.startNotifications();
}

function disconnect() {
  if (!device || !device.gatt.connected) return;
  device.gatt.disconnect();
  uart = {};
}

// Reset micro:bit hardware
// micro:bit must be listening for a newline-terminated 'reset' message
async function resetDevice() {
  if (!device || !device.gatt.connected) {
    throw new Error("Can't reset; device not connected");
  }

  if (!uart.service) {
    await startUart();
  }

  uart.send.writeValue(encodeUartMessage("reset\n"));
}

function getConnectionStatus() {
  if (!device || !device.gatt.connected) return false;
  return true;
}

// HELPERS
function decodeUartMessage(uartEvent) {
  let encodedMessage = [];
  for (let i = 0; i < uartEvent.target.value.byteLength; i++) {
    encodedMessage[i] = uartEvent.target.value.getUint8(i);
  }
  let message = String.fromCharCode.apply(null, encodedMessage);
  return message;
}

function encodeUartMessage(str) {
  var output = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) {
    output[i] = str[i].charCodeAt()
  }
  return output;
}
