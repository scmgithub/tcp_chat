var net = require('net');
var fs=require("fs");
var port = 3000
var clients=[];
var numclients=0;
var chatlog = "chatlog.json";

// Clear chat log
fs.writeFile(chatlog, null , function(err) {
	if (err) {
		console.log("Error clearing chat log: "+err);
	}
});

var server = net.createServer(function(socket) {
	var thisclient={};
	var thisclientnumber=numclients;
	var outstring = "";
	thisclient['number']=thisclientnumber;
	thisclient['socket'] = socket;
	console.log('Client '+numclients+' connected');
	var outstring = "Hello Client "+thisclientnumber;
	outstring += "\n\nChat instructions:\n";
	outstring += "/exit to exit\n\n";

	var chat_history = fs.readFile(chatlog, function(err, data) {
		if (err) {
			console.log("Error reading chat log: "+err);
			outstring += "Chat log error.  Sorry.  You can still chat though.\n";
		} else {
			var chat_json = data.toString();
			var chat_hist=JSON.parse(chat_json);
			if (chat_hist) {
				outstring += "Here is the chat history so far:\n" + chat_hist;
				outstring += "=== Live below this line ===\n";
			} else {
				outstring += "You are the first one here.\n";
				chat_hist="";  // empty, not null or undefined.
			}
		
			//console.log(chat_hist);
			socket.write(outstring);
			chat_hist += "Client "+thisclientnumber+" logged in.\n";
			chat_json=JSON.stringify(chat_hist);
			fs.writeFile(chatlog, chat_json , function(err) {
				if (err) {
					console.log("Error updating chat history: "+err);
				} else {

				//	console.log(server);
				//	console.log(thisclient);
					clients[numclients]=thisclient;
				//	console.log(clients);

					numclients++;

					socket.on('data', function(data) {
						var input = data.toString().trim();
						console.log("Client "+thisclientnumber+" said "+input);

						var addToChatHistory = fs.readFile(chatlog, function(err, data) {
							if (err) {
								console.log("Error reading chat history: "+err);
							} else {
								chat_json = data.toString();
								chat_hist=JSON.parse(chat_json);

								if(input === "/exit") {
									chat_hist += "Client "+thisclientnumber+" logged out.\n";
									chat_json=JSON.stringify(chat_hist);
									fs.writeFile(chatlog, chat_json, function(err){
										if (err) {
											console.log("Error updating chat history: "+err);
										} else {
											console.log("Client "+thisclientnumber+" requested exit.")
											socket.write("Goodbye Client "+thisclientnumber+"\n");
											socket.end();
										}  // end of file write not an error
									});  // end of fs.writeFile
								}

								// Client is sending a message
								chat_hist += "Client "+thisclientnumber+": "+input+"\n";
								chat_json=JSON.stringify(chat_hist);
								fs.writeFile(chatlog, chat_json, function(err){
									if (err) {
										console.log("Error updating chat history: "+err);
									} else {
										//nothing to do here?
									}  // end of file write not an error
								});  // end of fs.writeFile

								// Broadcast
								for (var cli=0; cli<clients.length; cli++) {
									if(cli != thisclientnumber) {
										if(clients[cli].socket==="disconnected") {
											console.log("Skipping disconnected client "+cli);
										} else {
											console.log("Broadcasting to client "+clients[cli].number);
											clients[cli].socket.write("Client "+thisclientnumber+": "+input+"\n");
										}
									}
								}
							}  // end file read not an error
						});  // end of fs.readFile
					});

					socket.on('end', function() {
						clients[thisclientnumber].socket="disconnected";
						console.log('Client '+thisclientnumber+' disconnected');
					});
				}  // end of file write not an error
			});  // end of fs.writeFile
		}  // end file read not an error
	});  // end fs.readFile
});  // end net.createServer

server.listen(port, function() { //'listening' listener
	console.log('Listening on port ' + port );
});
