import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  email: string;
  phone: string;
  startDate: string;
}

interface PayrollData {
  employeeId: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  overtime: number;
  totalSalary: number;
  payPeriod: string;
}

interface PayrollProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onGeneratePayslip: (payrollData: PayrollData) => void;
}

const Payroll: React.FC<PayrollProps> = ({ isOpen, onClose, employees, onGeneratePayslip }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [bonus, setBonus] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [overtime, setOvertime] = useState(0);
  const [payPeriod, setPayPeriod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const baseSalary = selectedEmployee?.salary || 0;
  const totalSalary = baseSalary + bonus + overtime - deductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !payPeriod) return;

    setIsProcessing(true);
    
    const payrollData: PayrollData = {
      employeeId: selectedEmployeeId,
      baseSalary,
      bonus,
      deductions,
      overtime,
      totalSalary,
      payPeriod
    };

    try {
      await onGeneratePayslip(payrollData);
      handleClose();
    } catch (error) {
      console.error('Error generating payslip:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployeeId(null);
    setBonus(0);
    setDeductions(0);
    setOvertime(0);
    setPayPeriod('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Payroll Management</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              value={selectedEmployeeId || ''}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose an employee...</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          {selectedEmployee && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Employee Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedEmployee.name}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {selectedEmployee.position}
                </div>
                <div>
                  <span className="font-medium">Base Salary:</span> ${baseSalary.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedEmployee.email}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Period
              </label>
              <input
                type="month"
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overtime Hours (Rate: $25/hr)
              </label>
              <input
                type="number"
                value={overtime / 25}
                onChange={(e) => setOvertime(Number(e.target.value) * 25)}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bonus ($)
              </label>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deductions ($)
              </label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                min="0"
                step="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {selectedEmployee && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Salary Calculation</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base Salary:</span>
                  <span>${baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime:</span>
                  <span>+${overtime.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus:</span>
                  <span>+${bonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span>-${deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Salary:</span>
                  <span>${totalSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !selectedEmployeeId || !payPeriod}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Generate Payslip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payroll;
