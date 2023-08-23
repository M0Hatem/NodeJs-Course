const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  // console.log(req.url, req.headers, req.method);
  const url = req.url;
  const method = req.method;
  if (url === '/') {
    res.write('<html>');
    res.write(
      '<body><form action="/message" method="post"><input type="text" name="message"></input><button type="submit">send</button></form></body>'
    );
    res.write('</html>');
    return res.end();
  }
  if (url === '/message' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1];
      fs.writeFileSync('user.text', message);
    });
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<body><h1>welcome to my first nodeJs server</h1></body>');
  res.write('</html>');
  res.end();
});

server.listen(3000);
