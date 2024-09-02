const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { parse } = require('node:querystring');
const { requestHandler, notFountContent } = require('./request-handler');
const usersData = require('./assets/user-data.json');
const users = require('./assets/user-login.json');

// Server Config
const serverHost = '127.0.0.1';
const serverPort = 8000;

// Resources
const usersAsText = JSON.stringify(usersData);
const pizzaImage = readFileSync(join(__dirname, '/assets/pizza.jpg'));
const loginPageHtml = readFileSync(join(__dirname, 'assets/login.html'));
const homePageHtml = readFileSync(
  join(__dirname, 'assets/parallax/index.html')
);
const homePageStyle = readFileSync(
  join(__dirname, 'assets/parallax/style.css')
);
const homePageImage1 = readFileSync(
  join(__dirname, 'assets/parallax/image1.jpg')
);
const homePageImage2 = readFileSync(
  join(__dirname, 'assets/parallax/image2.jpg')
);
const homePageImage3 = readFileSync(
  join(__dirname, 'assets/parallax/image3.jpg')
);
const profilePageHtml = readFileSync(
  join(__dirname, 'assets/profile.html'),
  'utf-8'
);

// Server
const server = createServer((request, response) => {
  const { url: pathname, method } = request;

  // Logger (hw5-3)
  console.info(`${method} ${pathname}`);

  if (method === 'GET') {
    // Routing
    switch (pathname) {
      // Root Route (hw5-1)

      case '/':
        requestHandler(response, 'Hello world from Root Route');
        break;

      case '/login-page':
        requestHandler(response, loginPageHtml, 'text/html');
        break;

      // Pizza Image Route
      case '/pizza-image':
        requestHandler(response, pizzaImage, 'image/jpeg');
        break;

      // Users Route
      case '/users':
        requestHandler(response, usersAsText, 'application/json');
        break;

      // Home Route
      case '/home':
        requestHandler(response, homePageHtml, 'text/html');
        break;
      case '/style.css':
        requestHandler(response, homePageStyle, 'text/css');
        break;
      case '/image1.jpg':
        requestHandler(response, homePageImage1, 'image/jpeg');
        break;
      case '/image2.jpg':
        requestHandler(response, homePageImage2, 'image/jpeg');
        break;
      case '/image3.jpg':
        requestHandler(response, homePageImage3, 'image/jpeg');
        break;

      // 404: Not Found Route
      default:
        requestHandler(response, notFountContent, 'text/html', 404);
        break;
    }
  } else if (method === 'POST') {
    if (pathname === '/login') {
      const body = [];

      request.on('data', (chunk) => {
        body.push(chunk);
      });

      request.on('end', () => {
        const requestBody = Buffer.concat(body).toString();
        const { username = null, password = null } = parse(requestBody);

        if (!username || !password) {
          return requestHandler(
            response,
            'username or password not match',
            'text/plain',
            400
          );
        }

        const user = users.find((user) => {
          if (user.username === username && user.password === password) {
            return true;
          }
        });

        if (!!user) {
          // server side rendering
          const profileHtml = profilePageHtml
            .replaceAll('{%USERNAME%}', username)
            .replaceAll('{%PASSWORD%}', password);
          return requestHandler(response, profileHtml, 'text/html');
        }

        requestHandler(
          response,
          'username and password not match',
          'text/plain',
          400
        );
      });
    }
  } else {
    requestHandler(response, notFountContent, 'text/html', 404);
  }
});

server.listen(serverPort, serverHost, () => {
  console.info(`[i]: Listening on ${serverHost}:${serverPort} ...`);
});
