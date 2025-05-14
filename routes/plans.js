const express = require('express');
   const router = express.Router();
   const Plan = require('../models/Plan');

   // Lấy tất cả gói
   router.get('/', async (req, res) => {
     try {
       const plans = await Plan.find();
       res.json(plans);
     } catch (err) {
       res.status(500).json({ message: err.message });
     }
   });

   // Xử lý thêm, sửa, xóa gói qua POST
   router.post('/', async (req, res) => {
     try {
       const action = req.body.action;
       if (!action) {
         return res.status(400).json({ message: 'Action is required' });
       }

       if (action === 'create') {
         const plan = new Plan({
           plan: req.body.plan,
           price: req.body.price,
           description: req.body.description
         });

         const newPlan = await plan.save();
         res.status(201).json(newPlan);
       } else if (action === 'update') {
         const plan = await Plan.findById(req.body.id);
         if (!plan) return res.status(404).json({ message: 'Plan not found' });

         plan.plan = req.body.plan || plan.plan;
         plan.price = req.body.price !== undefined ? req.body.price : plan.price;
         plan.description = req.body.description || plan.description;

         const updatedPlan = await plan.save();
         res.json(updatedPlan);
       } else if (action === 'delete') {
         const plan = await Plan.findByIdAndDelete(req.body.id);
         if (!plan) return res.status(404).json({ message: 'Plan not found' });
         res.json({ message: 'Plan deleted' });
       } else {
         res.status(400).json({ message: 'Invalid action' });
       }
     } catch (err) {
       res.status(400).json({ message: err.message });
     }
   });

   module.exports = router;