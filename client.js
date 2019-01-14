var fs = require('fs'); 
var https = require('https'); 

var options = { 
    hostname: 'localhost', 
    port: 3000, 
    path: '/', 
    method: 'GET',
    key: fs.readFileSync('certs/client_key.pem'),
    cert: fs.readFileSync('certs/client_certificate.pem'), 
    ca: fs.readFileSync('certs/server_certificate.pem') // Shouldn't be needed with CA signed certificate
}; 
var req = https.request(options, function(res) { 
    res.on('data', function(data) { 
        process.stdout.write('Server Response:\n' + data + '\n'); 
    }); 
}); 
req.end();