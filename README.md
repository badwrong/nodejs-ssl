# nodejs-ssl
Mutual TLS Example

npm start - Will start server and generate server private key and certificate
npm run generate:client_csr - Generate RSA key for client and CSR (which would normally be submitted to CA)
npm run generate:client_cert - Self-sign client certificate using the server key and certificate (this would normally come from a CA)

