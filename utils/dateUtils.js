const moment = require('moment');

// Get Current Date (Formatted)
exports.getCurrentDate = () => {
  return moment().format('YYYY-MM-DD');
};

// Get Current Date and Time (Formatted)
exports.getCurrentDateTime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

// Get Start of Week (Monday)
exports.getStartOfWeek = () => {
  return moment().startOf('week').format('YYYY-MM-DD');
};

// Get End of Week (Sunday)
exports.getEndOfWeek = () => {
  return moment().endOf('week').format('YYYY-MM-DD');
};
