const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const { db, uuidv4 } = require('../config/database');
const { generateNextNumber } = require('./numberGenerationController');

const getEmployees = async (req, res) => {
  try {
    const [employees] = await db.execute(`
      SELECT 
        id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        department,
        position,
        hire_date,
        salary,
        status,
        created_at,
        updated_at
      FROM employees
      WHERE status != 'inactive'
      ORDER BY first_name, last_name
    `);

    res.json({
      success: true,
      data: employees,
      total: employees.length
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

const createEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      department,
      position,
      hire_date,
      salary
    } = req.body;

    if (!first_name || !last_name || !email || !department || !position) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const employeeId = uuidv4();
    const employeeNumber = await generateNextNumber('EMPLOYEE');

    await db.execute(`
      INSERT INTO employees (
        id, employee_id, first_name, last_name, email, phone, department, 
        position, hire_date, salary, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
    `, [
      employeeId,
      employeeNumber,
      first_name,
      last_name,
      email,
      phone || '',
      department,
      position,
      hire_date || new Date().toISOString().split('T')[0],
      parseFloat(salary) || 0
    ]);

    const [newEmployees] = await db.execute(`
      SELECT 
        id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        department,
        position,
        hire_date,
        salary,
        status,
        created_at,
        updated_at
      FROM employees
      WHERE id = ?
    `, [employeeId]);

    res.status(201).json({
      success: true,
      data: newEmployees[0],
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
};

const getLeaveRequests = async (req, res) => {
  try {
    const [leaveRequests] = await db.execute(`
      SELECT 
        lr.id,
        lr.employee_id,
        lr.employee_name,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        lr.days_requested as days,
        lr.reason,
        lr.status,
        lr.created_at,
        lr.updated_at
      FROM leave_requests lr
      ORDER BY lr.created_at DESC
    `);

    res.json({
      success: true,
      data: leaveRequests,
      total: leaveRequests.length
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message
    });
  }
};

const createLeaveRequest = async (req, res) => {
  try {
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason
    } = req.body;

    if (!employee_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if employee exists
    const [employees] = await db.execute('SELECT first_name, last_name FROM employees WHERE id = ?', [employee_id]);
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const employee = employees[0];
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequestId = uuidv4();
    const employeeName = `${employee.first_name} ${employee.last_name}`;

    await db.execute(`
      INSERT INTO leave_requests (
        id, employee_id, employee_name, leave_type, start_date, end_date, 
        days_requested, reason, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `, [
      leaveRequestId,
      employee_id,
      employeeName,
      leave_type,
      start_date,
      end_date,
      days,
      reason || ''
    ]);

    const [newLeaveRequests] = await db.execute(`
      SELECT 
        id,
        employee_id,
        employee_name,
        leave_type,
        start_date,
        end_date,
        days_requested as days,
        reason,
        status,
        created_at,
        updated_at
      FROM leave_requests
      WHERE id = ?
    `, [leaveRequestId]);

    res.status(201).json({
      success: true,
      data: newLeaveRequests[0],
      message: 'Leave request created successfully'
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave request',
      error: error.message
    });
  }
};

const getPayrollRecords = async (req, res) => {
  try {
    const [payrollRecords] = await db.execute(`
      SELECT 
        id,
        employee_id,
        employee_name,
        pay_period_start,
        pay_period_end,
        base_salary as basic_salary,
        overtime_hours * overtime_rate as overtime,
        bonuses,
        deductions,
        net_pay,
        status,
        created_at,
        updated_at
      FROM payroll_records
      ORDER BY pay_period_start DESC
    `);

    res.json({
      success: true,
      data: payrollRecords,
      total: payrollRecords.length
    });
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll records',
      error: error.message
    });
  }
};

const createPayrollRecord = async (req, res) => {
  try {
    const {
      employee_id,
      pay_period_start,
      pay_period_end,
      basic_salary,
      overtime_hours = 0,
      overtime_rate = 0,
      bonuses,
      deductions
    } = req.body;

    if (!employee_id || !pay_period_start || !pay_period_end || !basic_salary) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if employee exists
    const [employees] = await db.execute('SELECT first_name, last_name FROM employees WHERE id = ?', [employee_id]);
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const employee = employees[0];
    const overtimeAmount = parseFloat(overtime_hours) * parseFloat(overtime_rate);
    const bonusAmount = parseFloat(bonuses) || 0;
    const deductionAmount = parseFloat(deductions) || 0;
    const basicAmount = parseFloat(basic_salary);
    const grossPay = basicAmount + overtimeAmount + bonusAmount;
    const netPay = grossPay - deductionAmount;

    const payrollId = uuidv4();
    const employeeName = `${employee.first_name} ${employee.last_name}`;

    await db.execute(`
      INSERT INTO payroll_records (
        id, employee_id, employee_name, pay_period_start, pay_period_end, 
        base_salary, overtime_hours, overtime_rate, bonuses, deductions, 
        gross_pay, net_pay, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP)
    `, [
      payrollId,
      employee_id,
      employeeName,
      pay_period_start,
      pay_period_end,
      basicAmount,
      parseFloat(overtime_hours) || 0,
      parseFloat(overtime_rate) || 0,
      bonusAmount,
      deductionAmount,
      grossPay,
      netPay
    ]);

    const [newPayrollRecords] = await db.execute(`
      SELECT 
        id,
        employee_id,
        employee_name,
        pay_period_start,
        pay_period_end,
        base_salary as basic_salary,
        overtime_hours * overtime_rate as overtime,
        bonuses,
        deductions,
        net_pay,
        status,
        created_at,
        updated_at
      FROM payroll_records
      WHERE id = ?
    `, [payrollId]);

    res.status(201).json({
      success: true,
      data: newPayrollRecords[0],
      message: 'Payroll record created successfully'
    });
  } catch (error) {
    console.error('Error creating payroll record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payroll record',
      error: error.message
    });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  getLeaveRequests,
  createLeaveRequest,
  getPayrollRecords,
  createPayrollRecord
};
