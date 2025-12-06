/**
 * Assignment Card Component
 * Display assignment details and allow student submission
 */

import { useState } from 'react';
import type { AssignmentWithSubmission } from '@/types/assignment';
import FileUploader from './FileUploader';
import SubmissionHistory from './SubmissionHistory';

interface AssignmentCardProps {
  assignment: AssignmentWithSubmission;
  onSubmissionComplete?: () => void;
}

export default function AssignmentCard({ assignment, onSubmissionComplete }: AssignmentCardProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const now = new Date();
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isPastDue = dueDate && now > dueDate;
  const canSubmit = !isPastDue || assignment.allow_late_submissions;
  const hasSubmission = assignment.user_submission !== null;
  const canResubmit = assignment.allow_resubmission && hasSubmission &&
    (!assignment.user_submission || assignment.user_submission.submission_number < assignment.max_submissions);

  const getStatusBadge = () => {
    if (!hasSubmission) {
      if (isPastDue && !assignment.allow_late_submissions) {
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Closed</span>;
      }
      if (isPastDue) {
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">Late</span>;
      }
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Not Submitted</span>;
    }

    const submission = assignment.user_submission!;
    if (submission.status === 'graded') {
      const percentage = (submission.points_earned || submission.grade || 0) / assignment.max_points * 100;
      const color = percentage >= 90 ? 'green' : percentage >= 70 ? 'blue' : percentage >= 60 ? 'yellow' : 'red';
      return (
        <span className={`px-3 py-1 bg-${color}-100 text-${color}-700 text-sm font-medium rounded-full`}>
          Graded: {submission.points_earned || submission.grade}/{assignment.max_points}
        </span>
      );
    }

    return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Submitted</span>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleSubmissionComplete = () => {
    setShowUploader(false);
    if (onSubmissionComplete) {
      onSubmissionComplete();
    }
  };

  if (showHistory && hasSubmission) {
    return (
      <SubmissionHistory
        assignmentId={assignment.id}
        assignmentTitle={assignment.title}
        onClose={() => setShowHistory(false)}
      />
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{assignment.title}</h3>
          {assignment.description && (
            <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Assignment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
        {dueDate && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Due:</span>
            <span className={`font-medium ${isPastDue ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(assignment.due_date!)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Points:</span>
          <span className="font-medium">{assignment.max_points}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">File Types:</span>
          <span className="font-medium text-xs">
            {assignment.allowed_file_types.slice(0, 3).join(', ')}
            {assignment.allowed_file_types.length > 3 && ` +${assignment.allowed_file_types.length - 3} more`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Max Size:</span>
          <span className="font-medium">{assignment.max_file_size_mb}MB</span>
        </div>
      </div>

      {/* Instructions */}
      {assignment.instructions && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Instructions:</h4>
          <div className="text-sm text-gray-700 prose prose-sm max-w-none">
            {assignment.instructions.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Submission Info */}
      {hasSubmission && assignment.user_submission && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Your Submission:</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">File:</span>
              <span className="font-medium">{assignment.user_submission.file_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Submitted:</span>
              <span className="font-medium">
                {formatDate(assignment.user_submission.submitted_at)}
                {assignment.user_submission.is_late && (
                  <span className="ml-2 text-red-600">(Late)</span>
                )}
              </span>
            </div>
            {assignment.user_submission.grade !== null && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grade:</span>
                  <span className="font-bold text-green-600">
                    {assignment.user_submission.points_earned || assignment.user_submission.grade} / {assignment.max_points}
                  </span>
                </div>
                {assignment.user_submission.feedback && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-gray-600 font-medium mb-1">Feedback:</p>
                    <p className="text-gray-700">{assignment.user_submission.feedback}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showUploader && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-4">
            {hasSubmission ? `Resubmission #${(assignment.user_submission?.submission_number || 0) + 1}` : 'Submit Your Work'}
          </h4>
          <FileUploader
            assignmentId={assignment.id}
            allowedTypes={assignment.allowed_file_types}
            maxSizeMB={assignment.max_file_size_mb}
            onSuccess={handleSubmissionComplete}
            onCancel={() => setShowUploader(false)}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!showUploader && canSubmit && (!hasSubmission || canResubmit) && (
          <button
            onClick={() => setShowUploader(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            {hasSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
          </button>
        )}

        {hasSubmission && (
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View History
          </button>
        )}

        {!canSubmit && !hasSubmission && (
          <div className="text-sm text-red-600 font-medium">
            This assignment is closed for submissions
          </div>
        )}
      </div>

      {/* Warnings */}
      {isPastDue && !hasSubmission && assignment.allow_late_submissions && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
          <strong>Late Submission:</strong> A {assignment.late_penalty_percent}% penalty will be applied to your grade.
        </div>
      )}
    </div>
  );
}
