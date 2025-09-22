const AppManager = require('./main/app-manager');

// Create and initialize the application
const appManager = new AppManager();
appManager.initialize();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', error);
  // In production, you might want to log this to a file or service
});

process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to log this to a file or service
});
