const mongoose = require('mongoose');

  const userSchema = new mongoose.Schema({
    machine_id: { type: String, required: true, unique: true },
    plan: { type: String, enum: ['free', 'month', 'unlimit'], required: true },
    activate_time: { type: String, required: true },
    expire_time: { type: String, required: true },
    note: { type: String, default: '' },
    name: { type: String, required: true },
    count: { type: Number, default: function() { return this.plan === 'free' ? 10 : 0; } },
    expiration: { type: Number, required: true }
  });

  module.exports = mongoose.model('User', userSchema);