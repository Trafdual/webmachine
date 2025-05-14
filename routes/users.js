const express = require('express');
  const router = express.Router();
  const User = require('../models/User');

  // Hàm tính expiration động dựa trên thời gian server
  const calculateExpiration = (expireTime) => {
    try {
      const expireDate = new Date(expireTime.split(' ')[0].split('/').reverse().join('-') + 'T' + expireTime.split(' ')[1]);
      const today = new Date(); // Lấy thời gian từ server
      return Math.max(0, Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24)));
    } catch (err) {
      return 0;
    }
  };

  // Lấy tất cả user
  router.get('/', async (req, res) => {
    try {
      const users = await User.find();
      // Cập nhật expiration động
      const updatedUsers = users.map(user => ({
        ...user._doc,
        expiration: calculateExpiration(user.expire_time)
      }));
      res.json(updatedUsers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Thêm, sửa, xóa user
  router.post('/', async (req, res) => {
    try {
      const action = req.body.action;
      if (!action) {
        return res.status(400).json({ message: 'Action is required' });
      }

      if (action === 'create') {
        const expireDate = new Date(req.body.expire_time.split(' ')[0].split('/').reverse().join('-') + 'T' + req.body.expire_time.split(' ')[1]);
        const today = new Date();
        const expiration = Math.max(0, Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24)));

        const user = new User({
          machine_id: req.body.machine_id,
          plan: req.body.plan,
          activate_time: req.body.activate_time,
          expire_time: req.body.expire_time,
          note: req.body.note || '',
          name: req.body.name,
          count: req.body.plan === 'free' ? 10 : req.body.count || 0,
          expiration
        });

        const newUser = await user.save();
        res.status(201).json({
          ...newUser._doc,
          expiration: calculateExpiration(newUser.expire_time)
        });
      } else if (action === 'update') {
        const user = await User.findById(req.body.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.machine_id = req.body.machine_id || user.machine_id;
        user.plan = req.body.plan || user.plan;
        user.activate_time = req.body.activate_time || user.activate_time;
        user.expire_time = req.body.expire_time || user.expire_time;
        user.note = req.body.note !== undefined ? req.body.note : user.note;
        user.name = req.body.name || user.name;
        user.count = req.body.count !== undefined ? req.body.count : user.count;

        const updatedUser = await user.save();
        res.json({
          ...updatedUser._doc,
          expiration: calculateExpiration(updatedUser.expire_time)
        });
      } else if (action === 'delete') {
        const user = await User.findByIdAndDelete(req.body.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
      } else {
        res.status(400).json({ message: 'Invalid action' });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // Trừ count của user
  router.post('/decrement-count', async (req, res) => {
    try {
      const { machine_id } = req.body;
      if (!machine_id) {
        return res.status(400).json({ message: 'machine_id is required' });
      }

      const user = await User.findOne({ machine_id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.count <= 0) {
        return res.status(400).json({ message: 'Count is already 0' });
      }

      user.count -= 1;
      await user.save();
      res.json({
        ...user._doc,
        expiration: calculateExpiration(user.expire_time)
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Đăng ký user
  router.post('/register', async (req, res) => {
    try {
      const { machine_id, plan, activate_time, expire_time, note, name, count } = req.body;
      if (!machine_id || !plan || !activate_time || !expire_time || !name) {
        return res.status(400).json({ message: 'machine_id, plan, activate_time, expire_time, and name are required' });
      }

      let user = await User.findOne({ machine_id });
      if (user) {
        res.json({
          ...user._doc,
          expiration: calculateExpiration(user.expire_time)
        });
        return;
      }

      const expireDate = new Date(expire_time.split(' ')[0].split('/').reverse().join('-') + 'T' + expire_time.split(' ')[1]);
      const today = new Date();
      const expiration = Math.max(0, Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24)));

      user = new User({
        machine_id,
        plan,
        activate_time,
        expire_time,
        note: note || '',
        name,
        count: plan === 'free' ? 10 : count || 0,
        expiration
      });

      const newUser = await user.save();
      res.status(201).json({
        ...newUser._doc,
        expiration: calculateExpiration(newUser.expire_time)
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // Refresh expiration cho tất cả user (chỉ cập nhật expiration, không sửa expire_time)
  router.post('/refresh-expiration', async (req, res) => {
    try {
      const users = await User.find();
      if (users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }

      const updatedUsers = [];

      for (let user of users) {
        user.expiration = calculateExpiration(user.expire_time);
        await user.save();
        updatedUsers.push({
          ...user._doc,
          expiration: user.expiration
        });
      }

      res.json(updatedUsers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;