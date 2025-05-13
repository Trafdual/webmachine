const router = require('express').Router()
const BangGia = require('../models/BangGiaModel')

router.get('/getbanggia', async (req, res) => {
  try {
    const banggia = await BangGia.find().lean()
    res.json(banggia)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/postbanggia', async (req, res) => {
  try {
    const { plan, price, description } = req.body
    const banggia = new BangGia({
      plan,
      price,
      description
    })
    await banggia.save()
    res.json(banggia)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/updatebanggia/:idbanggia', async (req, res) => {
  try {
    const { plan, price, description } = req.body
    const idbanggia = req.params.idbanggia
    const banggia = await BangGia.findById(idbanggia)
    if (!banggia) {
      return res.status(400).json({
        error: 'bảng giá không tồn tại'
      })
    }

    if (plan) {
      banggia.plan = plan
    }
    if (price) {
      banggia.price = price
    }
    if (description) {
      banggia.description = description
    }
    await banggia.save()
    res.json(banggia)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
