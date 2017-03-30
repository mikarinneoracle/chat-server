var WebSocketServer = require('ws').Server;

var port = process.env.PORT || 3332;

var wss = new WebSocketServer({ port: port});

var messages = [];
wss.on('connection', function (ws) {
  messages.forEach(function(message){
    ws.send(message);
  });
  ws.on('message', function (message) {
    var exists = false;
    messages.forEach(function(messages){
      if(messages == message)
      {
        exists = true;
      }
    });
    if(!exists)
    {
        messages.push(message);
    } else {
        console.log('Msg exists ' + message);
    }
    console.log('Message Received: %s', message);
    wss.clients.forEach(function (conn) {
      if(!exists)
      {
        conn.send(message);
      }
    });
  });
});
