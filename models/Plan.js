const mongoose = require('mongoose');

   const planSchema = new mongoose.Schema({
     plan: { type: String, required: true, unique: true },
     price: { type: Number, required: true },
     description: { type: String, required: true }
   });

   module.exports = mongoose.model('Plan', planSchema);