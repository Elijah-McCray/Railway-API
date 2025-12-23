// Global Jest setup for longer timeouts (servers need a moment to boot)
jest.setTimeout(20000);

// Silence noisy server logs to avoid "Cannot log after tests are done"
const noop = () => {};
global.console.log = noop;
global.console.error = noop;
global.console.warn = noop;
