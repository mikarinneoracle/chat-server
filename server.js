var WebSocketServer = require('ws').Server;
var MongoClient = require('mongodb').MongoClient;
var mongodb_host = process.env.BACKEND_MONGODB_HOST || null;

var port = process.env.PORT || 3332;
var wss = new WebSocketServer({ port: port});

var mongodb;
var messages = [];
if(mongodb_host)
{
  MongoClient.connect('mongodb://' + mongodb_host + '/messages', function(err, db) {
    if(err)
    {
      console.log(err);
    } else {
      mongodb = db;
      var collection = mongodb.collection('messages');
      collection.find().toArray(function(err, m) {
        m.forEach(function(message){
          messages.push('{"user":"' + message.user+'","text":"'+message.text + '"}');
        });
      });
    }
  });
}

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
        if(mongodb)
        {
          var collection = mongodb.collection('messages');
          collection.insert(JSON.parse(message), function(err, r) {
            if(err)
            {
                console.log(err);
            }
          });
        }
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
