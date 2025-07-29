# TestMate Backend API Requirements Report

OPENAI API KEY
"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";


## Overview
This document outlines all the APIs and endpoints required for the TestMate IELTS preparation platform backend. The backend should support user authentication, progress tracking, AI-powered feedback, test management, and data analytics.

## 1. Authentication & User Management

### 1.1 Email-Only Authentication
```
POST /api/auth/login
- Body: { email }
- Response: { message: "OTP sent successfully" }

POST /api/auth/verify-otp
- Body: { email, otp }
- Response: { token, user: { id, email, name, level, xp } }

POST /api/auth/resend-otp
- Body: { email }
- Response: { message: "OTP resent successfully" }

POST /api/auth/logout
- Headers: { Authorization: Bearer <token> }
- Response: { message: "Logged out successfully" }

POST /api/auth/refresh
- Headers: { Authorization: Bearer <token> }
- Response: { token, user: { id, email, name, level, xp } }
```

### 1.2 User Registration (First Time Login)
```
POST /api/auth/register
- Body: { email, name, targetScore, testDate }
- Response: { message: "OTP sent successfully" }

POST /api/auth/complete-registration
- Body: { email, otp, name, targetScore, testDate }
- Response: { token, user: { id, email, name, level, xp, targetScore, testDate } }
```

### 1.3 Account Management
```
PUT /api/auth/update-profile
- Headers: { Authorization: Bearer <token> }
- Body: { name, targetScore, testDate }
- Response: { user: { id, email, name, level, xp, targetScore, testDate } }

DELETE /api/auth/delete-account
- Headers: { Authorization: Bearer <token> }
- Response: { message: "Account deleted successfully" }
```

## 2. User Profile & Settings

### 2.1 Profile Management
```
GET /api/user/profile
- Headers: { Authorization: Bearer <token> }
- Response: { user: { id, email, name, level, xp, targetScore, testDate, preferences } }

PUT /api/user/profile
- Headers: { Authorization: Bearer <token> }
- Body: { name, targetScore, testDate, preferences }
- Response: { user: { id, email, name, level, xp, targetScore, testDate, preferences } }

DELETE /api/user/account
- Headers: { Authorization: Bearer <token> }
- Response: { message: "Account deleted successfully" }
```

### 2.2 Progress Tracking
```
GET /api/user/progress
- Headers: { Authorization: Bearer <token> }
- Response: { 
    level, xp, totalXP, 
    skills: { speaking, listening, reading, writing },
    achievements: [{ id, name, description, earned, date }],
    recentActivity: [{ type, action, score, timestamp }]
  }

GET /api/user/achievements
- Headers: { Authorization: Bearer <token> }
- Response: { achievements: [{ id, name, description, icon, earned, date }] }

GET /api/user/activity
- Headers: { Authorization: Bearer <token> }
- Query: { limit: number, offset: number }
- Response: { activities: [{ type, action, score, timestamp, details }] }
```

## 3. AI-Powered Feedback Services

### 3.1 Speaking Test Feedback
```
POST /api/ai/speaking-feedback
- Headers: { Authorization: Bearer <token> }
- Body: { question, transcript, audioUrl? }
- Response: {
    band: number,
    comment: string,
    words: [{ word, native_like, score, tip }],
    length_feedback: string,
    suggestions: [string],
    pronunciation_tips: [string],
    grammar_feedback: string,
    vocabulary_feedback: string,
    coherence_feedback: string
  }
```

### 3.2 Writing Test Feedback
```
POST /api/ai/writing-feedback
- Headers: { Authorization: Bearer <token> }
- Body: { prompt, answer, taskType: "essay" | "letter" | "report" }
- Response: {
    band: number,
    comment: string,
    task_achievement: string,
    coherence_cohesion: string,
    lexical_resource: string,
    grammatical_range: string,
    suggestions: [string],
    improved_version: string
  }
```

### 3.3 Study Plan Generation
```
POST /api/ai/study-plan
- Headers: { Authorization: Bearer <token> }
- Body: { currentScore, targetScore, testDate, availableTime }
- Response: {
    summary: string,
    weeks: number,
    recommendations: [string],
    weekly_schedule: [{ week, focus, tasks: [string] }],
    focus_areas: [{ skill, reason, priority }]
  }
```

## 4. Test Management

### 4.1 Test Questions & Content
```
GET /api/tests/speaking/questions
- Headers: { Authorization: Bearer <token> }
- Query: { difficulty: "easy" | "medium" | "hard", topic?: string }
- Response: { questions: [{ id, text, topic, difficulty, category }] }

GET /api/tests/listening/passages
- Headers: { Authorization: Bearer <token> }
- Query: { difficulty: "easy" | "medium" | "hard" }
- Response: { 
    passages: [{ 
      id, title, text, audioUrl, duration, 
      questions: [{ id, text, type, options?, correct }] 
    }] 
  }

GET /api/tests/reading/passages
- Headers: { Authorization: Bearer <token> }
- Query: { difficulty: "easy" | "medium" | "hard" }
- Response: { 
    passages: [{ 
      id, title, text, 
      questions: [{ id, text, type, options?, correct }] 
    }] 
  }

GET /api/tests/writing/prompts
- Headers: { Authorization: Bearer <token> }
- Query: { taskType: "essay" | "letter" | "report" }
- Response: { prompts: [{ id, text, taskType, wordLimit, timeLimit }] }
```

### 4.2 Test Sessions
```
POST /api/tests/start
- Headers: { Authorization: Bearer <token> }
- Body: { testType: "speaking" | "listening" | "reading" | "writing", difficulty }
- Response: { sessionId, questions, timeLimit, instructions }

POST /api/tests/submit
- Headers: { Authorization: Bearer <token> }
- Body: { sessionId, answers, timeSpent }
- Response: { score, feedback, band, detailedResults }

GET /api/tests/history
- Headers: { Authorization: Bearer <token> }
- Query: { testType?, limit, offset }
- Response: { 
    tests: [{ 
      id, testType, score, band, date, timeSpent, 
      questions: [{ id, userAnswer, correct, feedback }] 
    }] 
  }
```

## 5. Progress & Analytics

### 5.1 XP & Leveling System
```
POST /api/progress/update-xp
- Headers: { Authorization: Bearer <token> }
- Body: { testType, score, xpEarned }
- Response: { newLevel, newXp, leveledUp, achievements: [string] }

GET /api/progress/skills
- Headers: { Authorization: Bearer <token> }
- Response: {
    speaking: { level, xp, progress, lastScore, testsCompleted },
    listening: { level, xp, progress, lastScore, testsCompleted },
    reading: { level, xp, progress, lastScore, testsCompleted },
    writing: { level, xp, progress, lastScore, testsCompleted }
  }

GET /api/progress/analytics
- Headers: { Authorization: Bearer <token> }
- Query: { period: "week" | "month" | "year" }
- Response: {
    totalTests: number,
    averageScore: number,
    improvementRate: number,
    timeSpent: number,
    skillBreakdown: { speaking, listening, reading, writing },
    weeklyProgress: [{ week, tests, averageScore }]
  }
```

### 5.2 Achievement System
```
GET /api/achievements/available
- Headers: { Authorization: Bearer <token> }
- Response: { achievements: [{ id, name, description, icon, criteria, progress }] }

POST /api/achievements/check
- Headers: { Authorization: Bearer <token> }
- Body: { action, value }
- Response: { earned: [{ id, name, description, icon }] }
```

## 6. Content Management

### 6.1 Question Bank
```
GET /api/content/questions
- Headers: { Authorization: Bearer <token> }
- Query: { testType, difficulty, topic, limit, offset }
- Response: { questions: [{ id, text, type, options, correct, difficulty, topic }] }

POST /api/content/questions
- Headers: { Authorization: Bearer <token> }
- Body: { testType, text, type, options, correct, difficulty, topic }
- Response: { id, message: "Question created successfully" }

PUT /api/content/questions/:id
- Headers: { Authorization: Bearer <token> }
- Body: { text, type, options, correct, difficulty, topic }
- Response: { message: "Question updated successfully" }

DELETE /api/content/questions/:id
- Headers: { Authorization: Bearer <token> }
- Response: { message: "Question deleted successfully" }
```

### 6.2 Audio Content
```
POST /api/content/audio/upload
- Headers: { Authorization: Bearer <token> }
- Body: FormData with audio file
- Response: { audioUrl, duration, size }

GET /api/content/audio/:id
- Headers: { Authorization: Bearer <token> }
- Response: { audioUrl, metadata: { duration, size, format } }
```

## 7. Admin & Analytics

### 7.1 Admin Dashboard
```
GET /api/admin/dashboard
- Headers: { Authorization: Bearer <token> }
- Response: {
    totalUsers: number,
    activeUsers: number,
    totalTests: number,
    averageScores: { speaking, listening, reading, writing },
    recentActivity: [{ user, action, timestamp }]
  }

GET /api/admin/users
- Headers: { Authorization: Bearer <token> }
- Query: { limit, offset, search? }
- Response: { users: [{ id, email, name, level, joinDate, lastActive }] }

GET /api/admin/analytics
- Headers: { Authorization: Bearer <token> }
- Query: { period: "day" | "week" | "month" }
- Response: {
    userGrowth: [{ date, newUsers, activeUsers }],
    testCompletion: [{ testType, completed, averageScore }],
    popularContent: [{ id, title, usageCount }]
  }
```

## 8. Error Handling & Validation

### 8.1 Standard Error Responses
```
400 Bad Request: { error: "Validation failed", details: [string] }
401 Unauthorized: { error: "Invalid token" }
403 Forbidden: { error: "Insufficient permissions" }
404 Not Found: { error: "Resource not found" }
429 Too Many Requests: { error: "Rate limit exceeded" }
500 Internal Server Error: { error: "Something went wrong" }
```

### 8.2 Rate Limiting
- Authentication endpoints: 5 requests per minute
- AI feedback endpoints: 10 requests per hour
- Test submission: 20 requests per hour
- General API: 100 requests per minute

## 9. WebSocket Endpoints (Real-time Features)

### 9.1 Real-time Progress Updates
```
WS /ws/progress
- Headers: { Authorization: Bearer <token> }
- Events: 
  - progress_update: { level, xp, achievements }
  - achievement_earned: { id, name, description }
  - level_up: { newLevel, rewards }
```

### 9.2 Live Speaking Feedback
```
WS /ws/speaking
- Headers: { Authorization: Bearer <token> }
- Events:
  - audio_stream: { audioData }
  - real_time_feedback: { band, suggestions }
  - session_end: { finalScore, detailedFeedback }
```

## 10. Database Schema Requirements

### 10.1 Core Tables
- users (id, email, name, level, xp, target_score, test_date, created_at, updated_at)
- otp_codes (id, email, otp, expires_at, created_at)
- test_sessions (id, user_id, test_type, difficulty, score, band, time_spent, created_at)
- test_answers (id, session_id, question_id, user_answer, is_correct, feedback)
- achievements (id, name, description, icon, criteria, created_at)
- user_achievements (user_id, achievement_id, earned_at)
- questions (id, test_type, text, type, options, correct, difficulty, topic, created_at)
- study_plans (id, user_id, current_score, target_score, test_date, plan_data, created_at)

### 10.2 Analytics Tables
- user_activity (id, user_id, action, details, timestamp)
- test_analytics (id, test_type, average_score, completion_rate, date)
- content_usage (id, content_id, content_type, usage_count, date)

## 11. Security Requirements

### 11.1 Authentication
- JWT tokens with refresh mechanism
- Email-only authentication with OTP verification
- Rate limiting on authentication endpoints (5 OTP requests per hour per email)
- Session management
- OTP expiration (5 minutes)
- Email service integration for OTP delivery

### 11.2 Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- HTTPS enforcement

### 11.3 API Security
- API key management for AI services
- Request signing for sensitive operations
- Audit logging for admin actions
- Data encryption for sensitive user data

## 12. Performance Requirements

### 12.1 Response Times
- Authentication: < 200ms
- Test questions: < 100ms
- AI feedback: < 5 seconds
- Progress updates: < 50ms
- Analytics: < 1 second

### 12.2 Scalability
- Support for 10,000+ concurrent users
- Database connection pooling
- CDN for static content
- Caching for frequently accessed data
- Horizontal scaling capability

## 13. Integration Requirements

### 13.1 External Services
- OpenAI API for AI feedback
- Email service (SendGrid/AWS SES) for notifications
- File storage (AWS S3) for audio files
- Analytics service (Google Analytics/Mixpanel)
- Payment processing (Stripe) for premium features

### 13.2 Monitoring
- Application performance monitoring (APM)
- Error tracking and alerting
- User behavior analytics
- System health monitoring
- Database performance monitoring

This comprehensive API specification provides the foundation for building a robust backend that supports all current and future features of the TestMate platform. 