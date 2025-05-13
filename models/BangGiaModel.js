const mongoose = require('mongoose')

const banggiaSchema = new mongoose.Schema({
  plan: { type: String },
  price: { type: Number },
  description: { type: String }
})

const banggia = mongoose.model('banggia', banggiaSchema)
module.exports = banggia
