const express = require('express'),
  chalk = require('chalk'),
  fs = require('fs');

const pkg = require('./package.json');

const start = Date.now(),
  protocol = process.env.PROTOCOL || 'https',
  port = process.env.PORT || '3000',
  host = process.env.HOST || 'localhost';

let server;

function sendBootStatus(status) {
  // don't send anything if we're not running in a fork
  if (!process.send) {
    return;
  }
  process.send({ boot: status });
}

const app = express();

app.get('/', (req, res) => {
  const cert = req.connection.getPeerCertificate();

  if (req.client.authorized) {
    res.send(`Hello ${cert.subject.CN}, your certificate was issued by ${cert.issuer.CN}!`);
  }
  else if (cert.subject) {
    res.status(403)
      .send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`)
  }
  else {
    res.status(401)
      .send(`Sorry, but you need to provide a client certificate to continue.`)
  }
});

app.get('/version', function (request, response) {
  response.json({
    version: pkg.version,
  });
});

console.log(
  chalk.yellow('%s booted in %dms - %s://%s:%s'),
  pkg.name,
  Date.now() - start,
  protocol,
  host,
  port
);

// Start a development HTTPS server.
if (protocol === 'https') {
  const { execSync } = require('child_process');
  const execOptions = { encoding: 'utf-8', windowsHide: true };
  let serverKey = './certs/server_key.pem';
  let serverCertificate = './certs/server_certificate.pem';

  if (!fs.existsSync(serverKey) || !fs.existsSync(serverCertificate)) {
    try {
      execSync('openssl version', execOptions);
      execSync(
        `openssl req -x509 -newkey rsa:2048 -keyout ${serverKey} -out ${serverCertificate} -days 365 -nodes -subj "/C=US/ST=Georgia/L=Atlanta/CN=localhost"`,
        execOptions
      );
    } catch (error) {
      console.error(error);
    }
  }

  const options = {
    key: fs.readFileSync(serverKey),
    cert: fs.readFileSync(serverCertificate),
    ca: fs.readFileSync(serverCertificate), // pretty sure this is only needed because client cert not issued by CA
    requestCert: true,
    rejectUnauthorized: false
  };

  server = require('https').createServer(options, app);

} else {
  server = require('http').createServer(app);
}

server.listen({ port, host }, function () {
  // Tell the parent process that Server has booted.
  sendBootStatus('ready');
});
