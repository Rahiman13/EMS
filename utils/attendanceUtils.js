// Determine if user is late based on login time
exports.determineStatus = (loginTime) => {
  const standardLoginTime = new Date();
  standardLoginTime.setHours(9, 0, 0, 0); // 9:00 AM is standard login time

  if (loginTime > standardLoginTime) {
    return 'late';
  }
  return 'present';
};

// Calculate total hours worked
exports.calculateTotalHours = (loginTime, logoutTime) => {
  const diffMs = logoutTime - loginTime;
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  return diffHrs + (diffMins / 60); // return decimal hours
}; 