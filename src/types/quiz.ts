/**
 * Quiz System Type Definitions
 *
 * Comprehensive TypeScript types for the quiz and assessment system
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank';

export type GradingStatus = 'pending' | 'auto_graded' | 'manually_graded' | 'needs_review';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface Quiz {
  id: string; // UUID
  course_id: number;
  module_id: number | null;
  lesson_id: number | null;
  title: string;
  description: string | null;

  // Configuration
  time_limit_minutes: number | null;
  passing_score: number; // Percentage (0-100)
  max_attempts: number;
  randomize_questions: boolean;
  show_correct_answers: boolean;
  show_results_immediately: boolean;

  // Availability
  available_from: string | null; // ISO timestamp
  available_until: string | null; // ISO timestamp

  // Status
  is_published: boolean;

  // Metadata
  created_by: string; // UUID
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface QuizQuestion {
  id: string; // UUID
  quiz_id: string; // UUID

  // Content
  question_type: QuestionType;
  question_text: string;
  points: number;
  order_index: number;

  // Answers
  options: QuestionOption[] | null; // JSONB
  correct_answer: string | null;
  answer_explanation: string | null;

  // Metadata
  created_at: string;
}

export interface QuestionOption {
  id: string; // e.g., "a", "b", "c", "d"
  text: string;
}

export interface QuizAttempt {
  id: string; // UUID
  quiz_id: string; // UUID
  user_id: string; // UUID
  attempt_number: number;

  // Timing
  started_at: string;
  submitted_at: string | null;
  time_taken_seconds: number | null;

  // Scoring
  score: number | null; // Percentage (0-100)
  passed: boolean | null;

  // Answers
  answers: QuestionAnswer[] | null; // JSONB

  // Grading
  graded_by: string | null; // UUID
  graded_at: string | null;
}

export interface QuestionAnswer {
  question_id: number;
  answer: string | string[]; // Single answer or array for multiple choice
  is_correct: boolean | null;
  points_earned: number;
  feedback: string | null;
}

export interface QuestionBankItem {
  id: number;
  teacher_id: string; // UUID
  category: string | null;
  difficulty: QuestionDifficulty | null;
  tags: string[] | null;

  // Question data (same as QuizQuestion)
  type: QuestionType;
  question_text: string;
  question_image_url: string | null;
  explanation: string | null;
  options_json: QuestionOption[] | null;
  correct_answer: string | null;
  correct_answers_json: string[] | null;
  case_sensitive: boolean;
  points: number;

  // Usage
  times_used: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface CreateQuizRequest {
  lessonId: number;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  published?: boolean;
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {
  id: number;
}

export interface CreateQuestionRequest {
  quizId: number;
  type: QuestionType;
  questionText: string;
  questionImageUrl?: string;
  explanation?: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  correctAnswers?: string[];
  caseSensitive?: boolean;
  points?: number;
  orderIndex: number;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  id: number;
}

export interface StartQuizAttemptRequest {
  cohortId?: number;
}

export interface SaveAnswersRequest {
  answers: Array<{
    questionId: number;
    answer: string | string[];
  }>;
}

export interface SubmitQuizAttemptRequest {
  answers: Array<{
    questionId: number;
    answer: string | string[];
  }>;
}

export interface GradeAttemptRequest {
  answers: Array<{
    questionId: number;
    pointsEarned: number;
    feedback?: string;
  }>;
  teacherFeedback?: string;
}

export interface ReorderQuestionsRequest {
  questionIds: number[];
}

export interface ImportFromBankRequest {
  questionBankId: number;
  orderIndex: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface QuizWithDetails extends Quiz {
  questions?: QuizQuestion[];
  userAttempts?: QuizAttempt[];
  canAttempt?: boolean;
  attemptsRemaining?: number;
}

export interface QuizAttemptWithQuestions extends QuizAttempt {
  quiz: Quiz;
  questions: QuizQuestionWithAnswer[];
}

export interface QuizQuestionWithAnswer extends QuizQuestion {
  your_answer?: string | string[];
  is_correct?: boolean | null;
  points_earned?: number;
}

export interface StartAttemptResponse {
  success: true;
  attempt: {
    id: number;
    attemptNumber: number;
    startedAt: string;
    timeLimit: number | null;
  };
  questions: QuizQuestionForStudent[];
}

export interface QuizQuestionForStudent {
  id: number;
  type: QuestionType;
  questionText: string;
  questionImageUrl: string | null;
  options: QuestionOption[] | null;
  points: number;
  orderIndex: number;
  // Note: Does NOT include correct_answer or correct_answers_json
}

export interface SubmitAttemptResponse {
  success: true;
  attempt: {
    id: number;
    score: number;
    pointsEarned: number;
    totalPoints: number;
    passed: boolean;
    gradingStatus: GradingStatus;
    submittedAt: string;
  };
  results?: {
    questions: Array<{
      id: number;
      questionText: string;
      yourAnswer: string | string[];
      correctAnswer?: string | string[];
      isCorrect?: boolean | null;
      pointsEarned: number;
      explanation?: string;
    }>;
  };
}

export interface QuizResultsResponse {
  quiz: Quiz;
  results: StudentQuizResult[];
  stats: QuizStats;
}

export interface StudentQuizResult {
  userId: string;
  userName: string;
  userEmail: string;
  attempts: number;
  bestScore: number;
  latestScore: number;
  passed: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  needsGrading: boolean;
  lastAttemptAt: string | null;
}

export interface QuizStats {
  totalStudents: number;
  completed: number;
  passed: number;
  averageScore: number;
  averageAttempts: number;
  needsGrading: number;
}

export interface PendingGradingResponse {
  attempts: Array<{
    id: number;
    userId: string;
    userName: string;
    userEmail: string;
    attemptNumber: number;
    startedAt: string;
    submittedAt: string;
    autoGradedScore: number;
    essayQuestions: Array<{
      questionId: number;
      questionText: string;
      studentAnswer: string;
      points: number;
    }>;
  }>;
}

export interface QuizAnalyticsResponse {
  questionAnalytics: Array<{
    questionId: number;
    questionText: string;
    type: QuestionType;
    totalAnswers: number;
    correctAnswers: number;
    successRate: number;
    averagePoints: number;
    commonWrongAnswers?: Array<{ answer: string; count: number }>;
  }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  timeAnalytics: {
    averageTime: number; // seconds
    medianTime: number;
    quickest: number;
    longest: number;
  };
}

export interface AttemptsHistoryResponse {
  attempts: Array<{
    id: number;
    attemptNumber: number;
    score: number;
    pointsEarned: number;
    totalPoints: number;
    passed: boolean;
    startedAt: string;
    submittedAt: string | null;
    gradingStatus: GradingStatus;
    timeSpentSeconds: number | null;
  }>;
  canRetake: boolean;
  attemptsRemaining: number | null;
}

// ============================================================================
// VALIDATION & GRADING TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface GradingResult {
  isCorrect: boolean | null; // null for essay questions
  pointsEarned: number;
  feedback?: string;
}

export interface AutoGradeResult {
  answers: QuestionAnswer[];
  totalPoints: number;
  pointsEarned: number;
  score: number; // percentage
  passed: boolean;
  gradingStatus: GradingStatus;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface QuizTimerState {
  startTime: number;
  endTime: number;
  remainingSeconds: number;
  isExpired: boolean;
}

export interface QuizProgress {
  questionsAnswered: number;
  totalQuestions: number;
  percentComplete: number;
}

export interface QuizAvailability {
  isAvailable: boolean;
  reason?: 'not_published' | 'not_yet_available' | 'deadline_passed' | 'max_attempts_reached' | 'not_enrolled';
  availableFrom?: string;
  availableUntil?: string;
  attemptsRemaining?: number;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface QuizCardProps {
  quiz: QuizWithDetails;
  userAttempts?: QuizAttempt[];
  canAttempt: boolean;
  onStart?: () => void;
}

export interface QuizTakingProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  questions: QuizQuestionForStudent[];
  onSubmit: (answers: SaveAnswersRequest['answers']) => Promise<void>;
  onSave: (answers: SaveAnswersRequest['answers']) => Promise<void>;
}

export interface QuizReviewProps {
  attempt: QuizAttemptWithQuestions;
  showCorrectAnswers: boolean;
}

export interface QuizBuilderProps {
  quiz?: QuizWithDetails;
  lessonId: number;
  onSave: (quiz: CreateQuizRequest | UpdateQuizRequest) => Promise<void>;
  onCancel: () => void;
}

export interface QuestionEditorProps {
  question?: QuizQuestion;
  quizId: number;
  orderIndex: number;
  onSave: (question: CreateQuestionRequest | UpdateQuestionRequest) => Promise<void>;
  onCancel: () => void;
}

export interface QuizResultsProps {
  quiz: Quiz;
  results: StudentQuizResult[];
  stats: QuizStats;
}

export interface GradingQueueProps {
  quiz: Quiz;
  pendingAttempts: PendingGradingResponse['attempts'];
  onGrade: (attemptId: number, grading: GradeAttemptRequest) => Promise<void>;
}

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

export function isMultipleChoiceQuestion(question: QuizQuestion): boolean {
  return question.type === 'multiple_choice';
}

export function isTrueFalseQuestion(question: QuizQuestion): boolean {
  return question.type === 'true_false';
}

export function isShortAnswerQuestion(question: QuizQuestion): boolean {
  return question.type === 'short_answer';
}

export function isEssayQuestion(question: QuizQuestion): boolean {
  return question.type === 'essay';
}

export function needsManualGrading(question: QuizQuestion): boolean {
  return question.type === 'essay';
}

export function canAutoGrade(question: QuizQuestion): boolean {
  return !needsManualGrading(question);
}
