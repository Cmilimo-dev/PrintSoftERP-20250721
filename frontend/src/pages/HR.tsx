import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileDashboardLayout } from '@/components/ui/mobile-dashboard-layout';
import AddEmployee from '@/components/HR/AddEmployee';
import EditEmployee from '@/components/HR/EditEmployee';
import LeaveRequest from '@/components/HR/LeaveRequest';
import LeaveApproval from '@/components/HR/LeaveApproval';
import Payroll from '@/components/Payroll';
import PerformanceReview from '@/components/PerformanceReview';
import HRReporting from '@/components/Report';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Award, 
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { 
  useEmployees, 
  useLeaveRequests, 
  usePayrollRecords, 
  useHRStats,
  useUpdateLeaveRequest,
  useDeleteEmployee,
  useCreatePerformanceReview,
  useCreatePayrollRecord,
  useCreateEmployee,
  useUpdateEmployee,
  useCreateLeaveRequest
} from '@/hooks/useHR';

const HR = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isLeaveRequestOpen, setLeaveRequestOpen] = useState(false);
  const [isLeaveApprovalOpen, setLeaveApprovalOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);
  const [isPayrollOpen, setPayrollOpen] = useState(false);
  const [isPerformanceReviewOpen, setPerformanceReviewOpen] = useState(false);
  const [isReportingOpen, setReportingOpen] = useState(false);

  const handleAddEmployeeSubmit = async (newEmployee) => {
    try {
      await createEmployee.mutateAsync({
        employee_id: newEmployee.employeeId || `EMP${Date.now()}`,
        first_name: newEmployee.firstName,
        last_name: newEmployee.lastName,
        email: newEmployee.email,
        phone: newEmployee.phone,
        position: newEmployee.position,
        department: newEmployee.department,
        hire_date: newEmployee.startDate,
        salary: newEmployee.salary,
        status: 'active'
      });
      setAddEmployeeOpen(false);
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEditEmployeeOpen(true);
  };

  const handleEditEmployeeSubmit = async (updatedEmployee) => {
    try {
      await updateEmployee.mutateAsync({
        id: editingEmployee.id,
        first_name: updatedEmployee.firstName,
        last_name: updatedEmployee.lastName,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        position: updatedEmployee.position,
        department: updatedEmployee.department,
        salary: updatedEmployee.salary,
        status: updatedEmployee.status
      });
      setEditEmployeeOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleLeaveRequestSubmit = async (leaveRequest) => {
    try {
      await createLeaveRequest.mutateAsync({
        employee_id: leaveRequest.employeeId,
        employee_name: leaveRequest.employeeName,
        leave_type: leaveRequest.leaveType,
        start_date: leaveRequest.startDate,
        end_date: leaveRequest.endDate,
        days_requested: leaveRequest.daysRequested,
        reason: leaveRequest.reason,
        status: 'pending'
      });
      setLeaveRequestOpen(false);
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  const handleApproveLeave = async (id, comments) => {
    console.log('Leave approved:', id, comments);
    setIsLeaveApprovalOpen(false);
  };

  const handleRejectLeave = async (id, comments) => {
    console.log('Leave rejected:', id, comments);
    setIsLeaveApprovalOpen(false);
  };

  const handleLeaveDecision = (request) => {
    setSelectedLeaveRequest(request);
    setIsLeaveApprovalOpen(true);
  };

  // Mutation hooks
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const createLeaveRequest = useCreateLeaveRequest();
  const createPerformanceReview = useCreatePerformanceReview();
  const createPayrollRecord = useCreatePayrollRecord();

  const handleGeneratePayslip = async (payrollData) => {
    try {
      // Create payroll record using the API
      await createPayrollRecord.mutateAsync({
        employee_id: payrollData.employeeId.toString(),
        pay_period_start: new Date().toISOString().split('T')[0], // Current date as start
        pay_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days later
        base_salary: payrollData.baseSalary,
        overtime_hours: payrollData.overtime / 25, // Convert back to hours
        overtime_rate: 25,
        bonuses: payrollData.bonus,
        deductions: payrollData.deductions,
        gross_pay: payrollData.totalSalary,
        tax_deductions: payrollData.totalSalary * 0.2, // 20% tax
        net_pay: payrollData.totalSalary * 0.8, // After tax
        status: 'processed'
      });
      setPayrollOpen(false);
    } catch (error) {
      console.error('Error generating payslip:', error);
    }
  };

  const handleSubmitPerformanceReview = async (performanceData) => {
    try {
      // Create performance review using the API
      await createPerformanceReview.mutateAsync({
        employee_id: performanceData.employeeId.toString(),
        review_period: performanceData.reviewPeriod,
        overall_rating: performanceData.overallRating,
        technical_skills: performanceData.technicalSkills,
        communication: performanceData.communication,
        teamwork: performanceData.teamwork,
        leadership: performanceData.leadership,
        problem_solving: performanceData.problemSolving,
        goals: performanceData.goals,
        achievements: performanceData.achievements,
        areas_for_improvement: performanceData.areasForImprovement,
        next_period_goals: performanceData.nextPeriodGoals,
        reviewer_comments: performanceData.reviewerComments,
        review_date: performanceData.reviewDate
      });
      setPerformanceReviewOpen(false);
    } catch (error) {
      console.error('Error submitting performance review:', error);
    }
  };

  const handleGenerateReport = (reportData) => {
    console.log('Report generated:', reportData);
    setReportingOpen(false);
  };

  // Backend data hooks
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: leaveRequests = [], isLoading: leaveLoading } = useLeaveRequests();
  const { data: payrollRecords = [], isLoading: payrollLoading } = usePayrollRecords();
  const { data: hrStats, isLoading: statsLoading } = useHRStats();
  
  // Mutations
  const updateLeaveRequest = useUpdateLeaveRequest();
  const deleteEmployee = useDeleteEmployee();
const handleAddEmployee = () => { console.log('Add Employee button clicked'); };

const handleExportReport = () => { console.log('Export Report button clicked'); };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || 
           employee.position?.toLowerCase().includes(query) ||
           employee.department?.toLowerCase().includes(query) ||
           employee.email?.toLowerCase().includes(query);
  });

  // Handle leave request approval/rejection
  const handleLeaveAction = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await updateLeaveRequest.mutateAsync({ 
        id: requestId, 
        status,
        approved_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update leave request:', error);
    }
  };

  // Handle employee deletion
  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee.mutateAsync(employeeId);
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  if (employeesLoading || statsLoading) {
    return (
      <MobileDashboardLayout className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading HR data...</span>
        </div>
      </MobileDashboardLayout>
    );
  }

  return (
    <MobileDashboardLayout className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">HR Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage employees, leave requests, and payroll</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button className="w-full sm:w-auto" onClick={() => setAddEmployeeOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Employee</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setPayrollOpen(true)}>
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Payroll</span>
              <span className="sm:hidden">Payroll</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setPerformanceReviewOpen(true)}>
              <Award className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Performance Review</span>
              <span className="sm:hidden">Review</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setReportingOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Reports</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Employees</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{hrStats?.totalEmployees || 0}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{hrStats?.activeEmployees || 0}</p>
                </div>
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">On Leave</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">{hrStats?.onLeave || 0}</p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">New Hires</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{hrStats?.newHires || 0}</p>
                </div>
                <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending Requests</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">{hrStats?.pendingRequests || 0}</p>
                </div>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Birthdays</p>
                  <p className="text-lg sm:text-2xl font-bold text-pink-600">{hrStats?.upcomingBirthdays || 0}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="employees" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Employees</TabsTrigger>
            <TabsTrigger value="leave" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Leave</TabsTrigger>
            <TabsTrigger value="payroll" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Payroll</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Reports</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Employee</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No employees found</p>
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">
                            {employee.first_name} {employee.last_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {employee.position} • {employee.department}
                          </p>
                          <p className="text-xs text-gray-500">
                            Started: {new Date(employee.hire_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2">
                        <Badge 
                          variant={employee.status === 'active' ? 'default' : employee.status === 'on_leave' ? 'secondary' : 'outline'} 
                          className="text-xs"
                        >
                          {employee.status === 'active' ? 'Active' : employee.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                        </Badge>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Leave Management Tab */}
          <TabsContent value="leave" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold">Leave Management</h3>
                <p className="text-sm text-gray-600">Manage leave requests and approvals</p>
              </div>
              <Button onClick={() => setLeaveRequestOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Request Leave</span>
                <span className="sm:hidden">Request</span>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {leaveRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No leave requests found</p>
                    </div>
                  ) : (
                    leaveRequests.map((request) => (
                      <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">
                            {request.employee_name || 'Unknown Employee'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 capitalize">
                            {request.leave_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Duration: {request.days_requested} days
                          </p>
                          {request.reason && (
                            <p className="text-xs text-gray-500 mt-1">
                              Reason: {request.reason}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <Badge 
                            variant={request.status === 'approved' ? 'default' : request.status === 'pending' ? 'secondary' : 'destructive'} 
                            className="text-xs w-fit capitalize"
                          >
                            {request.status}
                          </Badge>
                          {request.status === 'pending' && (
                            <div className="flex space-x-1 sm:space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs px-2 py-1"
                                onClick={() => handleLeaveDecision(request)}
                              >
                                Review
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {payrollLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Loading payroll data...</p>
                    </div>
                  ) : payrollRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No payroll records found</p>
                    </div>
                  ) : (
                    payrollRecords.map((payroll) => (
                      <div key={payroll.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">
                            {payroll.employee_name || 'Unknown Employee'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Pay Period: {new Date(payroll.pay_period_start).toLocaleDateString()} - {new Date(payroll.pay_period_end).toLocaleDateString()}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Gross Pay: ${payroll.gross_pay.toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Net Pay: ${payroll.net_pay.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <Badge 
                            variant={payroll.status === 'paid' ? 'default' : payroll.status === 'processed' ? 'secondary' : 'outline'} 
                            className="text-xs w-fit capitalize"
                          >
                            {payroll.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Employee Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm p-2 sm:p-3">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Employee Directory Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm p-2 sm:p-3">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Attendance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm p-2 sm:p-3">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Performance Report
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Payroll Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm p-2 sm:p-3">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Monthly Payroll Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm p-2 sm:p-3">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Tax Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm p-2 sm:p-3">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Leave Balance Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <AddEmployee 
        isOpen={isAddEmployeeOpen} 
        onClose={() => setAddEmployeeOpen(false)} 
        onAdd={handleAddEmployeeSubmit} 
      />
      <EditEmployee 
        isOpen={isEditEmployeeOpen} 
        onClose={() => setEditEmployeeOpen(false)} 
        onSave={handleEditEmployeeSubmit}
        employee={editingEmployee}
      />
      <LeaveRequest 
        isOpen={isLeaveRequestOpen} 
        onClose={() => setLeaveRequestOpen(false)} 
        onRequest={handleLeaveRequestSubmit}
      />
      <LeaveApproval 
        isOpen={isLeaveApprovalOpen} 
        onClose={() => setIsLeaveApprovalOpen(false)} 
        request={selectedLeaveRequest}
        onApprove={handleApproveLeave}
        onReject={handleRejectLeave}
      />
      <Payroll
        isOpen={isPayrollOpen}
        onClose={() => setPayrollOpen(false)}
        employees={employees}
        onGeneratePayslip={handleGeneratePayslip}
      />
      <PerformanceReview
        isOpen={isPerformanceReviewOpen}
        onClose={() => setPerformanceReviewOpen(false)}
        employees={employees}
        onSubmitReview={handleSubmitPerformanceReview}
      />
      <HRReporting
        isOpen={isReportingOpen}
        onClose={() => setReportingOpen(false)}
        employees={employees}
        onGenerateReport={handleGenerateReport}
      />
    </MobileDashboardLayout>
  );
};

export default HR;
