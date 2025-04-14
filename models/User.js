const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['CEO', 'Manager', 'Employee'], default: 'Employee' },
  category: { type: String, enum: ['HR', 'Developer', 'DevOps'] },
  profilePic: String,
  preferences: Object,
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }, // 👈 added field
  createdAt: { type: Date, default: Date.now }
});


// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
