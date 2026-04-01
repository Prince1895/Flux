const express = require('express');
const { getSchedules, upsertSchedule, toggleSchedule } = require('../controllers/automationController');

const router = express.Router();

// GET  /api/automation       — list all schedules for tenant
router.get('/', getSchedules);

// POST /api/automation       — create/update a schedule
router.post('/', upsertSchedule);

// PATCH /api/automation/:id/toggle — enable/disable a schedule
router.patch('/:id/toggle', toggleSchedule);

module.exports = router;
