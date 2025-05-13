const router = require('express').Router()
const Machine = require('../models/MachineModel')
const moment_timezone = require('moment-timezone')
const moment = require('moment')

router.post('/postmachine', async (req, res) => {
  try {
    const { machine_id, note, name } = req.body
    const machine_exist = await Machine.findOne({ machine_id })
    if (machine_exist) {
      return res.status(400).json({
        error: 'Thiết bị đã tồn tại'
      })
    }
    const machine = new Machine({
      machine_id,
      plan: 'free',
      note,
      name,
      activate_time: moment_timezone().toDate()
    })
    await machine.save()
    res.json(machine)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/getmachine', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Machine.countDocuments()

    const machines = await Machine.find({})
      .skip(skip)
      .limit(limit)
      .select('_id machine_id plan activate_time expire_time note name count')
      .lean()

    const machinejson = machines.map(mc => {
      const now = moment()
      const expireMoment = mc.expire_time ? moment(mc.expire_time) : null

      const expiration =
        expireMoment && expireMoment.isAfter(now)
          ? expireMoment.diff(now, 'days')
          : 0
      return {
        _id: mc._id,
        machine_id: mc.machine_id,
        plan: mc.plan,
        activate_time: mc.activate_time
          ? moment(mc.activate_time).format('DD/MM/YYYY HH:mm')
          : null,
        expire_time: mc.expire_time
          ? moment(mc.expire_time).format('DD/MM/YYYY HH:mm')
          : null,
        note: mc.note,
        name: mc.name,
        count: mc.count,
        expiration: expiration
      }
    })

    res.json({
      data: machinejson,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/updatemachine/:idmachine', async (req, res) => {
  try {
    const { plan } = req.body
    let expire_time = null
    const machine = await Machine.findById(req.params.idmachine)

    switch (plan) {
      case 'month':
        expire_time = moment(machine.activate_time).add(30, 'days').toDate()
        break
      case 'unlimit':
        expire_time = moment(machine.activate_time).add(100, 'years').toDate()
        break
      default:
        expire_time = null
        break
    }

    machine.plan = plan
    machine.expire_time = expire_time
    await machine.save()
    res.json(machine)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/giahan/:idmachine', async (req, res) => {
  try {
    const idmachine = req.params.idmachine
    const machine = await Machine.findById(idmachine)
    if (!machine) {
      return res.status(400).json({
        error: 'Thiết bị không tồn tại'
      })
    }
    machine.expire_time = moment(machine.expire_time).add(30, 'days').toDate()

    await machine.save()
    res.json(machine)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/getdetailmachine/:machine_id', async (req, res) => {
  try {
    const machine_id = req.params.machine_id
    const machine = await Machine.findOne({ machine_id })
    if (!machine) {
      return res.status(400).json({
        error: 'Thiết bị không tồn tại'
      })
    }
    const now = moment()
    const expireMoment = machine.expire_time
      ? moment(machine.expire_time)
      : null

    const expiration =
      expireMoment && expireMoment.isAfter(now)
        ? expireMoment.diff(now, 'days')
        : 0
    const machinejson = {
      machine_id: machine.machine_id,
      plan: machine.plan,
      activate_time: machine.activate_time
        ? moment(machine.activate_time).format('DD/MM/YYYY HH:mm')
        : null,
      expire_time: machine.expire_time
        ? moment(machine.expire_time).format('DD/MM/YYYY HH:mm')
        : null,
      note: machine.note,
      name: machine.name,
      count: machine.count,
      expiration: expiration
    }
    res.json(machinejson)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/exceptcount/:machine_id', async (req, res) => {
  try {
    const machine_id = req.params.machine_id
    const machine = await Machine.findOne({ machine_id })
    if (!machine) {
      return res.status(400).json({
        error: 'Thiết bị không tồn tại'
      })
    }
    if (machine.count > 0) {
      machine.count = machine.count - 1
    }

    await machine.save()
    res.json(machine)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
module.exports = router
