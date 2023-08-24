const requsetHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>greeting</title></head>');
    res.write('<body><h2>hello UsEr o-O</h2></body>');
    res.write(`
      <form action="/create-user" method="POST">
        <input type="text" name="username">
        <button type="submit">Submit</button>
      </form>`);
    res.write('</html>');
    return res.end();
  }

  if (url === '/create-user' && method === 'POST') {
    const userName = [];
    req.on('data', (chunk) => {
      userName.push(chunk);
    });

    return req.on('end', () => {
      const parsedBody = Buffer.concat(userName).toString();
      const message = parsedBody.split('=')[1];
      res.statusCode = 302;
      res.setHeader('Location', '/users');
      console.log(message);
      return res.end();
    });
  }

  if (url === '/users') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Users</title></head>');
    res.write(
      '<body><ul><li>User 1</li><li>User 2</li><li>User 3</li></ul></body>'
    );

    res.write('</html>');
    return res.end();
  }
};

module.exports = requsetHandler;
