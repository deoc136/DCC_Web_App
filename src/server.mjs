import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import { readFileSync } from 'fs';

const hostname = 'localhost';
const port = 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
   key: readFileSync('src/https_cert/localhost-key.pem'),
   cert: readFileSync('src/https_cert/localhost.pem'),
};

app.prepare().then(() => {
   createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
   }).listen(port, err => {
      if (err) throw err;
      console.log('ready - started server on url: https://localhost:' + port);
   });
});
