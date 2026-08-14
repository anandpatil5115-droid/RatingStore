const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[Store Rating API] Listening on http://localhost:${port}`);
});