# TestMate AI - IELTS Preparation Platform

TestMate AI is an intelligent, interactive web platform designed to help international students prepare for English proficiency exams, with a focus on IELTS. The platform uses AI and speech recognition to deliver personalized, flexible learning solutions.

## Features

- **AI-Driven Diagnostic Tests**: Quickly assess current proficiency level and identify areas for improvement
- **Real-Time Speaking Feedback**: Practice speaking with AI-powered feedback on pronunciation, fluency, and grammar
- **Simulated Mock Tests**: Full-length, automated mock exams with scoring aligned to IELTS standards
- **Progress Tracking**: Monitor development with detailed analytics and insights
- **Modern UI/UX**: Beautiful, responsive design built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React.js
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Heroicons (SVG)
- **Fonts**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd testmate
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── Home.js         # Landing page
│   ├── Login.js        # User authentication
│   └── SpeakingTest.js # AI-powered speaking practice
├── App.js              # Main app component with routing
├── index.js            # App entry point
└── index.css           # Global styles and Tailwind imports
```

## Pages

### Home Page (`/`)
- Landing page with feature overview
- Call-to-action buttons
- Professional design showcasing TestMate AI capabilities

### Login Page (`/login`)
- User authentication form
- Form validation
- Demo credentials for testing
- Responsive design

### Speaking Test Page (`/speaking-test`)
- AI-powered speaking practice
- Real-time recording functionality
- Timer and progress tracking
- AI feedback simulation
- Multiple question types

## Demo Credentials

For testing purposes, you can use these demo credentials on the login page:
- **Email**: demo@testmate.com
- **Password**: demo123

## Features in Detail

### Speaking Test Functionality
- **Recording**: Uses browser's MediaRecorder API for audio capture
- **Timer**: Automatic timing with configurable limits per question
- **Playback**: Listen to recorded responses
- **AI Feedback**: Simulated AI analysis with detailed scoring
- **Progress Tracking**: Visual progress indicators

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Accessible design patterns

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

### Code Style

- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Write clean, readable code with comments

## Future Enhancements

- Backend integration with real AI services
- User authentication and profile management
- Progress analytics dashboard
- Additional test types (Reading, Writing, Listening)
- Peer learning communities
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Team

- Raphael Bernard Bonifacio (A00130994)
- Nijesh Manandhar (A00143435)
- Hien Pham (A00141910)
- Minh Quoc Vo (A00144753)

## Acknowledgments

- ITW601 Information Technology - Work Integrated Learning
- Ejoe Tso (Instructor)
- University of South Australia

---

**Note**: This is a frontend prototype. Backend integration and real AI services are planned for future development phases.
