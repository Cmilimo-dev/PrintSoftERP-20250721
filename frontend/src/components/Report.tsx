import React, { useState } from 'react';
import { X, Download, FileText, TrendingUp, Users, Calendar, BarChart3, DollarSign } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: number;
  email: string;
  phone: string;
  startDate: string;
  status: string;
}

interface HRReportingProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onGenerateReport: (reportData: any) => void;
}

const HRReporting: React.FC<HRReportingProps> = ({ 
  isOpen, 
  onClose, 
  employees, 
  onGenerateReport 
}) => {
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const onLeaveEmployees = employees.filter(emp => emp.status === 'on_leave').length;
  
  // Department distribution
  const departmentCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Salary statistics
  const salaries = employees.map(emp => emp.salary).filter(Boolean);
  const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0;
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
  const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0;

  const handleGenerateReport = async () => {
    if (!selectedReportType) return;

    setIsGenerating(true);
    
    const reportData = {
      type: selectedReportType,
      dateRange,
      stats: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        departmentCounts,
        avgSalary,
        maxSalary,
        minSalary
      },
      employees: selectedReportType.includes('detailed') ? employees : null,
      generatedAt: new Date().toISOString()
    };

    try {
      await onGenerateReport(reportData);
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setSelectedReportType('');
    setDateRange({ start: '', end: '' });
    onClose();
  };

  const ProgressBar = ({ label, current, total, color = 'blue' }: { label: string; current: number; total: number; color?: string }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{current}/{total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            HR Reporting & Analytics
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-900">{totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-900">{activeEmployees}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">On Leave</p>
                  <p className="text-2xl font-bold text-orange-900">{onLeaveEmployees}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg. Salary</p>
                  <p className="text-2xl font-bold text-purple-900">${avgSalary.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
            <div className="space-y-3">
              {Object.entries(departmentCounts).map(([department, count]) => (
                <ProgressBar 
                  key={department}
                  label={department || 'Unassigned'}
                  current={count}
                  total={totalEmployees}
                  color="blue"
                />
              ))}
            </div>
          </div>

          {/* Salary Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Salary Range</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Minimum:</span>
                  <span className="font-medium">${minSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average:</span>
                  <span className="font-medium">${avgSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Maximum:</span>
                  <span className="font-medium">${maxSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Employee Status</h4>
              <div className="space-y-2">
                <ProgressBar label="Active" current={activeEmployees} total={totalEmployees} color="green" />
                <ProgressBar label="On Leave" current={onLeaveEmployees} total={totalEmployees} color="orange" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Departments:</span>
                  <span className="font-medium">{Object.keys(departmentCounts).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Positions:</span>
                  <span className="font-medium">{new Set(employees.map(e => e.position)).size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Payroll:</span>
                  <span className="font-medium">${(avgSalary * totalEmployees).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Generation */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select report type...</option>
                  <option value="employee-summary">Employee Summary</option>
                  <option value="department-analysis">Department Analysis</option>
                  <option value="salary-report">Salary Report</option>
                  <option value="attendance-report">Attendance Report</option>
                  <option value="performance-summary">Performance Summary</option>
                  <option value="detailed-employee-list">Detailed Employee List</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || !selectedReportType}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                'Generating Report...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRReporting;

