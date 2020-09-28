const http = require('http');
const qs = require('querystring');
const urlParse = require('url-parse');
const fs = require('fs').promises;
const yargs = require('yargs');

var argv = yargs
  .scriptName("phonebox")
  .option('account', { alias: 'a', describe: 'Twilio account SID' })
  .option('token', { alias: 't', describe: 'Twilio authentication token' })
  .option('number', { alias: 'n', describe: 'Phone number to call' })
  .option('port', { alias: 'p', describe: 'Server port number' })
  .default('port', 8080)
  .demandOption(['a', 't', 'n'])
  .usage("Phonebox usage:\n$0 -a [Twilio account SID] -t [Twilio auth token]")
  .argv;

// Set up Twilio

let twilio = require('twilio');
let client = new twilio(argv.account, argv.token);
let outgoingNumber = argv.number;

async function text(to, msg) {
  let sentMessage = await client.messages.create({
    body: msg,
    to: to,
    from: outgoingNumber
  });
  console.log(sentMessage.sid);
  return sentMessage.sid;
}

async function call(to) {
  let callMade = await client.calls.create({
    twiml: '<?xml version="1.0" encoding="UTF-8"?> <Response> <Play loop="10">https://api.twilio.com/cowbell.mp3</Play> </Response>', // TODO
    to: to,
    from: outgoingNumber
  });
  console.log(callMade.sid);
  return callMade.sid;
}

// Server

// Useful tutorial:
// www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module

const host = 'localhost';
const port = argv.port;

const requestListener = function (req, res) {
  if (req.method === "GET") {
    handleGet(req, res);
  } else if (req.method === "PUT") {
    handlePut(req, res);
  }
};

// Serves static content
async function handleGet(req, res) {
  console.log("GET", req.url);
  let url = urlParse(req.url);

  if (url.pathname === '/') {
    let contents = await fs.readFile(__dirname + "/index.html")
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(contents);
  } else {
    try {
      let contents = await fs.readFile(__dirname + url.pathname);
      // Set mime type based on filename
      if ( url.pathname.endsWith('.html') ) {
        res.setHeader("Content-Type", "text/html");
      } else if ( url.pathname.endsWith('.js') ) {
        res.setHeader("Content-Type", "application/javascript");
      }
      res.writeHead(200);
      res.end(contents);
    } catch (err) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(404);
      res.end("404");
      throw err;
    }
  }
}

// Handles telephony
function handlePut(req, res) {
  console.log('PUT', req.url);
  const chunks = []
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    const data = qs.parse( Buffer.concat(chunks).toString() );
    console.log('to:', data.to, 'msg:', data.msg);

    if (req.url === '/text') {
      text(data.to, data.msg).then(
        (sid) => { res.end("Sent '"+data.msg+"' to "+data.to); });
    } else if (req.url === '/call') {
      call(data.to).then(
        (sid) => { res.end("Called " + data.to); });
    }
  });
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Phonebox server is running on http://${host}:${port}`);
});
