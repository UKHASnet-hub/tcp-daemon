var pg = require('pg')
var dbConfig = require('./config.json')

var net = require('net');
var sockets = [];
var port = 3010;
var clientId = 0;

var server = net.createServer(function(socket) {
	clientId++;
	
	socket.nickname = clientId;

	sockets.push(socket);


	// When client leaves
	socket.on('end', function() {

		// Remove client from socket array
		removeSocket(socket);
	});


	// When socket gets errors
	socket.on('error', function(error) {

		console.log('Socket Error: ', error.message);

	});
});


function broadcast(message) {

	// If there are no sockets, then don't broadcast any messages
	if (sockets.length === 0) {
		return;
	}

	sockets.forEach(function(socket, index, array){
		socket.write(message);
	});
	
};

// Remove disconnected client from sockets array
function removeSocket(socket) {

	sockets.splice(sockets.indexOf(socket), 1);

};


// Listening for any problems with the server
server.on('error', function(error) {

	console.log("Error: ", error.message);

});

// Listen for a port to telnet to
// then in the terminal just run 'telnet localhost [port]'
server.listen(port, function() {

	console.log("Server listening on:" + port);

});

// Postgres Notifications
pg.connect(dbConfig, function(err, client) {
    if(err) {
        console.log('DB Connection Error: ',err);
    }
    client.on('notification', function(msg) {
        switch(msg.channel) {
            case "upload_row":
                broadcast(clientName, msg.payload);
                //logtail_namespace.emit("upload_row",msg.payload)
                break;
            case "upload_parse":
                //logtail_namespace.emit("upload_parse",msg.payload)
                break;
        }
    });
    client.query("LISTEN upload_row");
    //client.query("LISTEN upload_parse");
});
