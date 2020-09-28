// Functions for communicating with server.js

export async function phone(method, num) {
  let path = 'text';
  if (method === 'call') {
    path = 'call';
  } else if (method != 'text') {
    throw new Error('Path must be "text" or "call"');
  }

  let d = new Date();
  let t = d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString();
  let msg = "Testing at " + t;

  let response = await fetch(
    'http://localhost:8080/' + path,
    { method: 'PUT',
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: 'to=%2B1' + num + '&msg=' + msg // %2B is "+"
    }
  );

  // let rStatus = response.status;
  let rBody = await response.text();

  return rBody;
}
