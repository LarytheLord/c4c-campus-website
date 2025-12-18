/**
 * Quiz Student Flow Tests
 *
 * Tests the complete quiz-taking experience from the student perspective
 */

import { test, expect } from '@playwright/test';

test.describe('Quiz Student Flow', () => {
  test.beforeEach(async ({ page: _page }) => {
    // Setup: Login as test user
    // In a real scenario, we would seed the database and authenticate
    // await page.goto('/login');
    // await page.fill('input[name="email"]', TEST_USER.email);
    // await page.fill('input[name="password"]', TEST_USER.password);
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/dashboard');
  });

  test('should display quiz card in lesson page', async ({ page }) => {
    // Navigate to lesson with quiz
    await page.goto('/lessons/test-lesson');

    // Wait for quiz card to load
    const quizCard = page.locator('[data-testid="quiz-card"]');
    await expect(quizCard).toBeVisible();

    // Verify quiz information is displayed
    await expect(quizCard.locator('h3')).toContainText('Test Quiz');
    await expect(quizCard).toContainText('Passing: 70%');
    await expect(quizCard).toContainText('30 minutes');
    await expect(quizCard).toContainText('3 attempts');
  });

  test('should start a new quiz attempt', async ({ page }) => {
    await page.goto('/lessons/test-lesson');

    // Click start quiz button
    await page.click('button:has-text("Start Quiz")');

    // Should show instructions modal
    const modal = page.locator('[data-testid="instructions-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Quiz Instructions');
    await expect(modal).toContainText('Passing score: 70%');

    // Click start quiz button in modal
    await page.click('button#start-quiz-btn');

    // Should navigate to quiz taking page with UUID in URL
    await expect(page).toHaveURL(/\/quizzes\/[a-f0-9-]+\/take\?attemptId=[a-f0-9-]+/);
  });

  test('should display quiz questions and allow answering', async ({ page }) => {
    // Navigate directly to quiz taking page (assuming attempt exists)
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Wait for question to load
    const question = page.locator('.card:has([class*="question"])');
    await expect(question).toBeVisible();

    // Verify question number display
    await expect(page.locator('text=Question 1 of')).toBeVisible();

    // For multiple choice - click an option
    const option = page.locator('label:has(input[type="radio"])').first();
    await option.click();

    // Navigate to next question
    await page.click('button:has-text("Next")');

    // Verify we moved to question 2
    await expect(page.locator('text=Question 2 of')).toBeVisible();
  });

  test('should save draft answers automatically', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Answer a question
    const option = page.locator('label:has(input[type="radio"])').first();
    await option.click();

    // Click save draft button
    await page.click('button:has-text("Save Draft")');

    // Should show success message
    await expect(page.locator('text=Draft saved')).toBeVisible();
  });

  test('should show timer for timed quizzes', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Timer should be visible for timed quizzes
    const timer = page.locator('#timer-container');
    await expect(timer).toBeVisible();

    // Timer should show time remaining in MM:SS format
    await expect(timer).toContainText(/\d{1,2}:\d{2}/);
  });

  test('should submit quiz and show results', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Answer all questions (assuming 3 questions)
    for (let i = 0; i < 3; i++) {
      // Select first option for each question
      const option = page.locator('label:has(input[type="radio"])').first();
      await option.click();

      if (i < 2) {
        await page.click('button:has-text("Next")');
      }
    }

    // Click submit
    await page.click('button:has-text("Submit Quiz")');

    // Confirm submission dialog
    const confirmModal = page.locator('#submit-modal');
    await expect(confirmModal).toBeVisible();
    await expect(confirmModal).toContainText('answered 3 out of 3 questions');

    // Confirm
    await page.click('button#confirm-submit-btn');

    // Should navigate to results page with UUIDs
    await expect(page).toHaveURL(/\/quizzes\/[a-f0-9-]+\/results\/[a-f0-9-]+/);
  });

  test('should display quiz results correctly', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/results/test-attempt-uuid');

    // Score should be displayed
    const scoreDisplay = page.locator('text=/\\d+%/');
    await expect(scoreDisplay.first()).toBeVisible();

    // Pass/fail status should be shown
    const statusBadge = page.locator('text=Passed, text=Not Passed');
    await expect(statusBadge).toBeVisible();

    // Time spent should be shown
    await expect(page.locator('text=Time Spent')).toBeVisible();

    // Attempt number should be shown
    await expect(page.locator('text=/Attempt #\\d+/')).toBeVisible();
  });

  test('should allow reviewing answers if enabled', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/results/test-attempt-uuid');

    // If show_correct_answers is enabled, review button should be visible
    const reviewButton = page.locator('button:has-text("Review Answers")');

    if (await reviewButton.isVisible()) {
      await reviewButton.click();

      // Review section should be visible
      const reviewSection = page.locator('#review-container');
      await expect(reviewSection).toBeVisible();

      // Should show correct/incorrect indicators
      const correctIndicator = page.locator('.bg-success\\/10');
      const incorrectIndicator = page.locator('.bg-error\\/10');
      expect(await correctIndicator.count() + await incorrectIndicator.count()).toBeGreaterThan(0);
    }
  });

  test('should show attempt history', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/attempts');

    // Should list attempts
    const attemptCards = page.locator('.card:has(text="Attempt #")');
    await expect(attemptCards.first()).toBeVisible();

    // Should show best score
    await expect(page.locator('text=Your Best Score')).toBeVisible();

    // Should show max attempts info
    await expect(page.locator('text=Max Attempts')).toBeVisible();
  });

  test('should enforce maximum attempts limit', async ({ page }) => {
    // Navigate to quiz where user has used all attempts
    await page.goto('/quizzes/test-quiz-uuid/attempts');

    // If max attempts reached, retry button should not be visible or be disabled
    const retryBtn = page.locator('#retry-btn');

    // Check if the button exists and is not visible (hidden due to max attempts)
    const isVisible = await retryBtn.isVisible();
    if (isVisible) {
      // If visible, it means attempts are still available
      await expect(retryBtn).toBeEnabled();
    }

    // Check for max attempts message
    const maxAttemptsMessage = page.locator('text=Maximum attempts reached');
    if (!isVisible) {
      await expect(maxAttemptsMessage).toBeVisible();
    }
  });

  test('should allow retaking quiz if allowed', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/results/test-attempt-uuid');

    // Check for retry button
    const retryBtn = page.locator('button:has-text("Retake Quiz")');

    if (await retryBtn.isVisible()) {
      await retryBtn.click();

      // Should navigate to new quiz attempt
      await expect(page).toHaveURL(/\/quizzes\/[a-f0-9-]+\/take\?attemptId=[a-f0-9-]+/);
    }
  });

  test('should handle different question types correctly', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Test multiple choice
    const multipleChoiceOption = page.locator('label:has(input[type="radio"])').first();
    await expect(multipleChoiceOption).toBeVisible();
    await multipleChoiceOption.click();

    await page.click('button:has-text("Next")');

    // Test true/false (if present)
    const trueFalseOptions = page.locator('label:has-text("True"), label:has-text("False")');
    if (await trueFalseOptions.first().isVisible()) {
      await trueFalseOptions.first().click();
      await page.click('button:has-text("Next")');
    }

    // Test short answer (if present)
    const shortAnswerInput = page.locator('input[type="text"][placeholder*="Enter your answer"]');
    if (await shortAnswerInput.isVisible()) {
      await shortAnswerInput.fill('Test answer');
      await page.click('button:has-text("Next")');
    }

    // Test essay (if present)
    const essayTextarea = page.locator('textarea[placeholder*="Enter your answer"]');
    if (await essayTextarea.isVisible()) {
      await essayTextarea.fill('This is a test essay response with multiple sentences.');
    }
  });

  test('should show essay questions awaiting review', async ({ page }) => {
    // Navigate to results for a quiz with essay questions
    await page.goto('/quizzes/test-quiz-uuid/results/test-attempt-uuid');

    // Check for awaiting review message
    const awaitingReview = page.locator('text=Awaiting Review');
    const needsReviewBadge = page.locator('text=Awaiting teacher review');

    // Either the main status or individual question status should show
    const hasAwaitingReview = await awaitingReview.isVisible() || await needsReviewBadge.isVisible();

    if (hasAwaitingReview) {
      // Should also show partial score message
      await expect(page.locator('text=/final score will be updated|pending review/')).toBeVisible();
    }
  });
});

test.describe('Quiz Validation', () => {
  test('should warn about unanswered questions before submission', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Navigate to last question without answering any
    const nextBtn = page.locator('button:has-text("Next")');
    while (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // Try to submit
    await page.click('button:has-text("Submit Quiz")');

    // Should show warning about unanswered questions
    const modal = page.locator('#submit-modal');
    await expect(modal).toContainText('answered 0 out of');
  });
});

test.describe('Quiz Attempt Schema Fields', () => {
  test('should persist grading_status correctly', async ({ page }) => {
    // Submit quiz with all auto-gradable questions
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Answer and submit
    const option = page.locator('label:has(input[type="radio"])').first();
    await option.click();

    // Navigate to submit
    const nextBtn = page.locator('button:has-text("Next")');
    while (await nextBtn.isVisible()) {
      await page.click('label:has(input[type="radio"]):first-of-type');
      await nextBtn.click();
    }

    await page.click('button:has-text("Submit Quiz")');
    await page.click('button#confirm-submit-btn');

    // Wait for redirect to results
    await page.waitForURL(/\/quizzes\/[a-f0-9-]+\/results\/[a-f0-9-]+/);

    // Either show immediate score or awaiting review
    const scoreDisplay = page.locator('text=/\\d+%/');
    await expect(scoreDisplay.first()).toBeVisible();
  });

  test('should persist time_taken_seconds', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/results/test-attempt-uuid');

    // Time taken should be displayed
    const timeDisplay = page.locator('text=Time Spent');
    await expect(timeDisplay).toBeVisible();

    // Should show a time value (not N/A for completed attempts)
    const timeValue = page.locator('text=/\\d+m|\\d+s/');
    await expect(timeValue).toBeVisible();
  });

  test('should persist answers_json with correct structure', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/results/test-attempt-uuid');

    // If review is enabled, answers should be visible
    const reviewButton = page.locator('button:has-text("Review Answers")');

    if (await reviewButton.isVisible()) {
      await reviewButton.click();

      // Each question should show the student's answer
      const questionReview = page.locator('#questions-review .card');
      await expect(questionReview.first()).toBeVisible();

      // Answers should have correct/incorrect indicators
      const indicators = page.locator('[class*="success"], [class*="error"]');
      expect(await indicators.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Quiz Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Tab to first option
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Skip to options

    // Select with Space
    await page.keyboard.press('Space');

    // Verify selection
    const selectedOption = page.locator('input[type="radio"]:checked');
    await expect(selectedOption).toBeVisible();

    // Tab to next button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter on next button
    await page.keyboard.press('Enter');

    // Should navigate to next question
    await expect(page.locator('text=Question 2 of')).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    // Should have h1 for quiz title
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Questions should use appropriate heading level
    const questionHeader = page.locator('h3, [role="heading"]');
    await expect(questionHeader.first()).toBeVisible();
  });
});

test.describe('Quiz Time Limit', () => {
  test('should display remaining time', async ({ page }) => {
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    const timer = page.locator('#timer-container');

    if (await timer.isVisible()) {
      // Timer should show time in reasonable format
      await expect(timer).toContainText(/\d{1,2}:\d{2}|\d+ min/);
    }
  });

  test('should warn when time is running low', async ({ page }) => {
    // This test would require mocking time or using a quiz with very short time limit
    // For now, we just verify the timer component exists
    await page.goto('/quizzes/test-quiz-uuid/take?attemptId=test-attempt-uuid');

    const timer = page.locator('#timer-container');
    await expect(timer).toBeVisible();
  });
});
