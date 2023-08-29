To get started, you need to first start the backend web server.

  node index.js

Next, we need to initialize the database. Depending on your operating 
system. Depending on your operating system, run one of the following
commands:

  Windows (PowerShell):
    Invoke-WebRequest -Method POST http://localhost:3000/initialize
    OR
    curl -Method POST http://localhost:3000/initialize

  Linux / MacOS
    curl -X POST http://localhost:3000/initialize

If that doesn't work, we can also initialize the web server using our 
browser. Open the following url in your browser:

  http://localhost:3000/

Open your developer tools and paste the following JavaScript into your
console.

  fetch('http://localhost:3000/initialize', { method: 'POST' }).then((res) => res.text()).then(data => console.log(data));

Optionally, you can use Postman or an equivalent API toolset to
execute a POST request the specified endpoint.