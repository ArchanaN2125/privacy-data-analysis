const http = require('http');
http.createServer((req, res) => {
    res.end('Hello from minimal server');
}).listen(5000, () => {
    console.log('Minimal server running on 5000');
});
// keep event loop alive with a setInterval
setInterval(() => console.log('Ping'), 2000);
