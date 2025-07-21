const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getEmployees,
  createEmployee,
  getLeaveRequests,
  createLeaveRequest,
  getPayrollRecords,
  createPayrollRecord
} = require('../controllers/hrController');

// All HR routes require authentication
router.use(authenticateToken);

// Employee routes
router.get('/employees', getEmployees);
router.post('/employees', createEmployee);

// Leave request routes
router.get('/leave_requests', getLeaveRequests);
router.post('/leave_requests', createLeaveRequest);

// Payroll routes
router.get('/payroll_records', getPayrollRecords);
router.post('/payroll_records', createPayrollRecord);

module.exports = router;
