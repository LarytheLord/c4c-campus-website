/**
 * Quiz grading and validation utilities for C4C Campus
 * @module lib/quiz-grading
 */

export interface QuizValidationResult {
  valid: boolean;
  errors: string[];
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  reasonCode?: 'not_published' | 'not_yet_available' | 'deadline_passed' | 'max_attempts_reached' | 'not_enrolled';
  attemptsRemaining: number | null; // null means unlimited
  canAttempt: boolean;
}

export interface GradingResult {
  answers: Array<{
    question_id: string;
    answer: unknown;
    is_correct: boolean | null;
    points_earned: number;
    feedback: string | null; // Always include feedback field for consistency
  }>;
  score: number;
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  gradingStatus: 'auto_graded' | 'needs_review' | 'pending';
}

export interface Quiz {
  id: string;
  title: string;
  time_limit_minutes?: number;
  passing_score: number;
  max_attempts: number;
  is_published: boolean;
  available_from?: string;
  available_until?: string;
  randomize_questions?: boolean;
}

/**
 * Question option structure - must match QuestionOption in types/quiz.ts
 */
export interface QuestionOptionForGrading {
  id: string; // Option identifier (e.g., "a", "b", "c", "d" or UUID)
  text: string;
  is_correct?: boolean; // Used by grading logic to identify correct answers
}

export interface Question {
  id: string;
  question_type: 'multiple_choice' | 'true_false' | 'multiple_select' | 'short_answer' | 'essay';
  question_text: string;
  points: number;
  options?: QuestionOptionForGrading[];
  correct_answer?: string | boolean; // For short_answer/true_false questions
  correct_answers?: string[]; // For multiple acceptable answers (short_answer)
}

export interface QuizAttempt {
  id: string;
  started_at: string;
  submitted_at?: string;
}

/**
 * Validate quiz data structure and settings
 * @param quizData - Quiz data to validate
 * @returns Validation result with errors
 */
export function validateQuiz(quizData: Partial<Quiz>): QuizValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!quizData.title?.trim()) {
    errors.push('Quiz title is required');
  }

  // Time limit validation
  if (quizData.time_limit_minutes !== undefined) {
    if (typeof quizData.time_limit_minutes !== 'number' || quizData.time_limit_minutes < 0) {
      errors.push('Time limit must be a non-negative number');
    }
  }

  // Passing score validation
  if (quizData.passing_score !== undefined) {
    if (typeof quizData.passing_score !== 'number' ||
        quizData.passing_score < 0 ||
        quizData.passing_score > 100) {
      errors.push('Passing score must be between 0 and 100');
    }
  }

  // Max attempts validation
  if (quizData.max_attempts !== undefined) {
    if (typeof quizData.max_attempts !== 'number' || quizData.max_attempts < 0) {
      errors.push('Max attempts must be a non-negative number (0 = unlimited)');
    }
  }

  // Date validation
  if (quizData.available_from && quizData.available_until) {
    const from = new Date(quizData.available_from);
    const until = new Date(quizData.available_until);
    if (until <= from) {
      errors.push('Available until date must be after available from date');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a student can start a quiz attempt
 * @param quiz - Quiz configuration
 * @param submittedAttemptsCount - Number of attempts already submitted
 * @returns Availability result with canAttempt and attemptsRemaining
 */
export function checkQuizAvailability(
  quiz: Quiz,
  submittedAttemptsCount: number
): AvailabilityResult {
  // Calculate attempts remaining - 0 means unlimited
  const attemptsRemaining = quiz.max_attempts === 0
    ? null
    : Math.max(0, quiz.max_attempts - submittedAttemptsCount);

  // Check if quiz is published
  if (!quiz.is_published) {
    return {
      available: false,
      reason: 'This quiz is not yet available',
      reasonCode: 'not_published',
      attemptsRemaining,
      canAttempt: false,
    };
  }

  // Check max attempts (0 means unlimited)
  if (quiz.max_attempts > 0 && submittedAttemptsCount >= quiz.max_attempts) {
    return {
      available: false,
      reason: `You have reached the maximum number of attempts (${quiz.max_attempts})`,
      reasonCode: 'max_attempts_reached',
      attemptsRemaining: 0,
      canAttempt: false,
    };
  }

  // Check availability window
  const now = new Date();

  if (quiz.available_from) {
    const from = new Date(quiz.available_from);
    if (now < from) {
      return {
        available: false,
        reason: `This quiz will be available starting ${from.toLocaleDateString()}`,
        reasonCode: 'not_yet_available',
        attemptsRemaining,
        canAttempt: false,
      };
    }
  }

  if (quiz.available_until) {
    const until = new Date(quiz.available_until);
    if (now > until) {
      return {
        available: false,
        reason: 'This quiz is no longer available',
        reasonCode: 'deadline_passed',
        attemptsRemaining,
        canAttempt: false,
      };
    }
  }

  return {
    available: true,
    attemptsRemaining,
    canAttempt: true,
  };
}

/**
 * Fisher-Yates shuffle algorithm
 * @param array - Array to shuffle
 * @param inPlace - Shuffle in place or create new array
 * @returns Shuffled array
 */
export function shuffleQuestions<T>(questions: T[], inPlace: boolean = false): T[] {
  const arr = inPlace ? questions : [...questions];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * Shuffle options within a question
 * @param question - Question with options
 * @param inPlace - Modify in place or create new object
 * @returns Question with shuffled options
 */
export function shuffleQuestionOptions<T extends { options?: unknown[] }>(
  question: T,
  inPlace: boolean = false
): T {
  if (!question.options || question.options.length === 0) {
    return question;
  }

  const result = inPlace ? question : { ...question };
  result.options = shuffleQuestions(question.options, false);

  return result;
}

/**
 * Check if a quiz attempt has expired based on time limit
 * @param attempt - Quiz attempt data
 * @param quiz - Quiz configuration
 * @returns True if attempt has expired
 */
export function isAttemptExpired(attempt: QuizAttempt, quiz: Quiz): boolean {
  if (!quiz.time_limit_minutes || quiz.time_limit_minutes === 0) {
    return false;
  }

  const startTime = new Date(attempt.started_at).getTime();
  const timeLimitMs = quiz.time_limit_minutes * 60 * 1000;
  const expiryTime = startTime + timeLimitMs;

  return Date.now() > expiryTime;
}

/**
 * Student answer input - can be array or record format.
 *
 * IMPORTANT: The array format is the canonical PUBLIC interface documented in
 * src/types/quiz.ts (StudentAnswer, SaveAnswersRequest, SubmitQuizAttemptRequest).
 * External clients and API handlers should ONLY use the array format:
 *   [{ questionId: "uuid-1", answer: "option-a" }, ...]
 *
 * The record format ({ [questionId]: answer, ... }) is provided for INTERNAL
 * convenience only and should not be used directly by external clients.
 * API handlers should normalize incoming requests to the array format before
 * calling grading functions.
 */
export type StudentAnswerInput =
  | Array<{ questionId: string; answer: string | string[] }>
  | Record<string, unknown>;

/**
 * Auto-grade a quiz attempt
 * @param questions - Quiz questions with correct answers
 * @param studentAnswers - Student's submitted answers (array or record format)
 * @param quiz - Quiz configuration
 * @returns Grading result
 */
export function autoGradeQuizAttempt(
  questions: Question[],
  studentAnswers: StudentAnswerInput,
  quiz: Quiz
): GradingResult {
  // Convert array format to record format for consistent processing
  let answersMap: Record<string, unknown>;
  if (Array.isArray(studentAnswers)) {
    answersMap = {};
    for (const ans of studentAnswers) {
      answersMap[String(ans.questionId)] = ans.answer;
    }
  } else {
    answersMap = studentAnswers;
  }

  let totalPoints = 0;
  let pointsEarned = 0;
  let needsReview = false;

  const gradedAnswers = questions.map((question) => {
    totalPoints += question.points;
    const studentAnswer = answersMap[String(question.id)];

    let isCorrect = false;
    let points = 0;

    switch (question.question_type) {
      case 'multiple_choice': {
        // Compare selected option by ID (not index)
        if (question.options) {
          const correctOption = question.options.find(opt => opt.is_correct);
          if (correctOption) {
            // Student answer should be the option ID
            isCorrect = studentAnswer === correctOption.id;
          }
        }
        break;
      }

      case 'true_false': {
        // Compare boolean answer
        const studentBool = studentAnswer === true || studentAnswer === 'true';
        const correctBool = question.correct_answer === true || question.correct_answer === 'true';
        isCorrect = studentBool === correctBool;
        break;
      }

      case 'multiple_select': {
        // Compare arrays by option IDs - all correct selections, no incorrect
        if (Array.isArray(studentAnswer) && question.options) {
          const correctIds = question.options
            .filter(opt => opt.is_correct)
            .map(opt => opt.id)
            .sort();
          const studentIds = (studentAnswer as string[])
            .map(String)
            .sort();

          isCorrect = correctIds.length === studentIds.length &&
            correctIds.every((id, i) => id === studentIds[i]);
        }
        break;
      }

      case 'short_answer': {
        // Case-insensitive exact match - support multiple acceptable answers
        if (typeof studentAnswer === 'string') {
          const normalizedAnswer = studentAnswer.trim().toLowerCase();

          // Check against correct_answers array if present
          if (question.correct_answers && Array.isArray(question.correct_answers)) {
            isCorrect = question.correct_answers.some(
              ca => ca.trim().toLowerCase() === normalizedAnswer
            );
          } else if (typeof question.correct_answer === 'string') {
            // Fall back to single correct_answer
            isCorrect = normalizedAnswer === question.correct_answer.trim().toLowerCase();
          }
        }
        break;
      }

      case 'essay': {
        // Essays need manual review
        needsReview = true;
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      points = question.points;
      pointsEarned += points;
    }

    return {
      question_id: question.id,
      answer: studentAnswer,
      is_correct: question.question_type === 'essay' ? null : isCorrect, // null for essay (needs review)
      points_earned: points,
      feedback: null, // Default to null, teachers can add feedback later
    };
  });

  const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
  const passed = score >= quiz.passing_score;

  return {
    answers: gradedAnswers,
    score,
    pointsEarned,
    totalPoints,
    passed,
    gradingStatus: needsReview ? 'needs_review' : 'auto_graded',
  };
}

/**
 * Calculate remaining time for an attempt
 * @param attempt - Quiz attempt
 * @param quiz - Quiz with time limit
 * @returns Remaining time in seconds, or null if no limit
 */
export function getRemainingTime(attempt: QuizAttempt, quiz: Quiz): number | null {
  if (!quiz.time_limit_minutes || quiz.time_limit_minutes === 0) {
    return null;
  }

  const startTime = new Date(attempt.started_at).getTime();
  const timeLimitMs = quiz.time_limit_minutes * 60 * 1000;
  const expiryTime = startTime + timeLimitMs;
  const remainingMs = expiryTime - Date.now();

  return Math.max(0, Math.floor(remainingMs / 1000));
}
