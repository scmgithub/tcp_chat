var net = require('net');
var client = net.Socket();

process.stdin.setEncoding('utf8');

client.connect(3000, function() {
  console.log('Connected to Server');

  client.on('data', function(data){
    console.log(data.toString().trim())
  });

  client.on('end', function() {
    console.log('disconnected from server');
  });

	process.stdin.on('readable', function() {
	  var chunk = process.stdin.read();
	  if (chunk !== null) {
//    process.stdout.write('data: ' + chunk);
		client.write(chunk);
	  }
	});

	process.stdin.on('end', function() {
	  process.stdout.write('end');
	});
});

