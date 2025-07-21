import React, { useState } from 'react';
import { X, Star, TrendingUp, Target, Award } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  startDate: string;
}

interface PerformanceData {
  employeeId: number;
  reviewPeriod: string;
  overallRating: number;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  leadership: number;
  problemSolving: number;
  goals: string;
  achievements: string;
  areasForImprovement: string;
  nextPeriodGoals: string;
  reviewerComments: string;
  reviewDate: string;
}

interface PerformanceReviewProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSubmitReview: (performanceData: PerformanceData) => void;
}

const PerformanceReview: React.FC<PerformanceReviewProps> = ({ 
  isOpen, 
  onClose, 
  employees, 
  onSubmitReview 
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [reviewPeriod, setReviewPeriod] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [technicalSkills, setTechnicalSkills] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [teamwork, setTeamwork] = useState(0);
  const [leadership, setLeadership] = useState(0);
  const [problemSolving, setProblemSolving] = useState(0);
  const [goals, setGoals] = useState('');
  const [achievements, setAchievements] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [nextPeriodGoals, setNextPeriodGoals] = useState('');
  const [reviewerComments, setReviewerComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !reviewPeriod) return;

    setIsSubmitting(true);
    
    const performanceData: PerformanceData = {
      employeeId: selectedEmployeeId,
      reviewPeriod,
      overallRating,
      technicalSkills,
      communication,
      teamwork,
      leadership,
      problemSolving,
      goals,
      achievements,
      areasForImprovement,
      nextPeriodGoals,
      reviewerComments,
      reviewDate: new Date().toISOString()
    };

    try {
      await onSubmitReview(performanceData);
      handleClose();
    } catch (error) {
      console.error('Error submitting performance review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployeeId(null);
    setReviewPeriod('');
    setOverallRating(0);
    setTechnicalSkills(0);
    setCommunication(0);
    setTeamwork(0);
    setLeadership(0);
    setProblemSolving(0);
    setGoals('');
    setAchievements('');
    setAreasForImprovement('');
    setNextPeriodGoals('');
    setReviewerComments('');
    onClose();
  };

  const StarRating = ({ rating, setRating, label }: { rating: number; setRating: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`p-1 rounded-full transition-colors ${
              star <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Award className="h-6 w-6 mr-2 text-blue-600" />
            Performance Review
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Period
              </label>
              <select
                value={reviewPeriod}
                onChange={(e) => setReviewPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select period...</option>
                <option value="Q1-2024">Q1 2024</option>
                <option value="Q2-2024">Q2 2024</option>
                <option value="Q3-2024">Q3 2024</option>
                <option value="Q4-2024">Q4 2024</option>
                <option value="Annual-2024">Annual 2024</option>
              </select>
            </div>
          </div>

          {selectedEmployee && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Employee Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedEmployee.name}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {selectedEmployee.position}
                </div>
                <div>
                  <span className="font-medium">Department:</span> {selectedEmployee.department}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Performance Ratings
              </h3>
              
              <StarRating 
                rating={overallRating} 
                setRating={setOverallRating} 
                label="Overall Performance" 
              />
              <StarRating 
                rating={technicalSkills} 
                setRating={setTechnicalSkills} 
                label="Technical Skills" 
              />
              <StarRating 
                rating={communication} 
                setRating={setCommunication} 
                label="Communication" 
              />
              <StarRating 
                rating={teamwork} 
                setRating={setTeamwork} 
                label="Teamwork" 
              />
              <StarRating 
                rating={leadership} 
                setRating={setLeadership} 
                label="Leadership" 
              />
              <StarRating 
                rating={problemSolving} 
                setRating={setProblemSolving} 
                label="Problem Solving" 
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Review Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goals for This Period
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What were the employee's goals for this review period?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Achievements
                </label>
                <textarea
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Highlight the employee's key achievements and accomplishments"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  value={areasForImprovement}
                  onChange={(e) => setAreasForImprovement(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Identify areas where the employee can improve"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goals for Next Period
                </label>
                <textarea
                  value={nextPeriodGoals}
                  onChange={(e) => setNextPeriodGoals(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Set goals and objectives for the next review period"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reviewer Comments
                </label>
                <textarea
                  value={reviewerComments}
                  onChange={(e) => setReviewerComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional comments and feedback"
                />
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
              type="submit"
              disabled={isSubmitting || !selectedEmployeeId || !reviewPeriod}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting Review...' : 'Submit Performance Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceReview;
