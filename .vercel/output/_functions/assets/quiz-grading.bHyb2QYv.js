function validateQuiz(quizData) {
  const errors = [];
  if (!quizData.title?.trim()) {
    errors.push("Quiz title is required");
  }
  if (quizData.time_limit_minutes !== void 0) {
    if (typeof quizData.time_limit_minutes !== "number" || quizData.time_limit_minutes < 0) {
      errors.push("Time limit must be a non-negative number");
    }
  }
  if (quizData.passing_score !== void 0) {
    if (typeof quizData.passing_score !== "number" || quizData.passing_score < 0 || quizData.passing_score > 100) {
      errors.push("Passing score must be between 0 and 100");
    }
  }
  if (quizData.max_attempts !== void 0) {
    if (typeof quizData.max_attempts !== "number" || quizData.max_attempts < 0) {
      errors.push("Max attempts must be a non-negative number (0 = unlimited)");
    }
  }
  if (quizData.available_from && quizData.available_until) {
    const from = new Date(quizData.available_from);
    const until = new Date(quizData.available_until);
    if (until <= from) {
      errors.push("Available until date must be after available from date");
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function checkQuizAvailability(quiz, submittedAttemptsCount) {
  if (!quiz.is_published) {
    return {
      available: false,
      reason: "This quiz is not yet available"
    };
  }
  if (quiz.max_attempts > 0 && submittedAttemptsCount >= quiz.max_attempts) {
    return {
      available: false,
      reason: `You have reached the maximum number of attempts (${quiz.max_attempts})`
    };
  }
  const now = /* @__PURE__ */ new Date();
  if (quiz.available_from) {
    const from = new Date(quiz.available_from);
    if (now < from) {
      return {
        available: false,
        reason: `This quiz will be available starting ${from.toLocaleDateString()}`
      };
    }
  }
  if (quiz.available_until) {
    const until = new Date(quiz.available_until);
    if (now > until) {
      return {
        available: false,
        reason: "This quiz is no longer available"
      };
    }
  }
  return { available: true };
}
function shuffleQuestions(questions, inPlace = false) {
  const arr = inPlace ? questions : [...questions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function autoGradeQuizAttempt(questions, studentAnswers, quiz) {
  let totalPoints = 0;
  let pointsEarned = 0;
  let needsReview = false;
  const gradedAnswers = questions.map((question) => {
    totalPoints += question.points;
    const studentAnswer = studentAnswers[question.id];
    let isCorrect = false;
    let points = 0;
    switch (question.question_type) {
      case "multiple_choice": {
        if (question.options) {
          const correctOption = question.options.findIndex((opt) => opt.is_correct);
          isCorrect = studentAnswer === correctOption || studentAnswer === String(correctOption);
        }
        break;
      }
      case "true_false": {
        const studentBool = studentAnswer === true || studentAnswer === "true";
        const correctBool = question.correct_answer === true || question.correct_answer === "true";
        isCorrect = studentBool === correctBool;
        break;
      }
      case "multiple_select": {
        if (Array.isArray(studentAnswer) && question.options) {
          const correctIndices = question.options.map((opt, idx) => opt.is_correct ? idx : -1).filter((idx) => idx !== -1);
          const studentIndices = studentAnswer.map((a) => typeof a === "string" ? parseInt(a, 10) : a).sort();
          isCorrect = correctIndices.length === studentIndices.length && correctIndices.every((idx, i) => idx === studentIndices[i]);
        }
        break;
      }
      case "short_answer": {
        if (typeof studentAnswer === "string" && typeof question.correct_answer === "string") {
          isCorrect = studentAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
        }
        break;
      }
      case "essay": {
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
      is_correct: isCorrect,
      points_earned: points
    };
  });
  const score = totalPoints > 0 ? Math.round(pointsEarned / totalPoints * 100) : 0;
  const passed = score >= quiz.passing_score;
  return {
    answers: gradedAnswers,
    score,
    pointsEarned,
    totalPoints,
    passed,
    gradingStatus: needsReview ? "needs_review" : "auto_graded"
  };
}
export {
  autoGradeQuizAttempt as a,
  checkQuizAvailability as c,
  shuffleQuestions as s,
  validateQuiz as v
};
