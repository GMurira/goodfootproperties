const handleDatabaseError = (error, operation) => {
  console.error(`Database Error in ${operation}:`, error);
  
  // Log to file in production
  if (process.env.NODE_ENV === 'production') {
    const fs = require('fs');
    const logEntry = `${new Date().toISOString()} - ${operation}: ${error.message}\n`;
    fs.appendFileSync('error.log', logEntry);
  }
  
  return {
    success: false,
    message: 'Database operation failed',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  };
};

module.exports = { handleDatabaseError };
