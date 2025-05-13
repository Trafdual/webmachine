const {min}=require('date-fns')
const mongoose = require('mongoose')

const machineSchema = new mongoose.Schema({
  machine_id: { type: String },
  plan: { type: String },
  activate_time: { type: Date },
  expire_time: { type: Date, default: null },
  note: { type: String },
  name: { type: String },
  count: { type: Number, default: 1 }
})

const machine = mongoose.model('machine', machineSchema)
module.exports = machine
