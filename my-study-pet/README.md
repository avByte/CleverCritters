# CleverCritters - Study Pet App

A vanilla HTML/CSS/JavaScript study companion app where you can create and care for a virtual pet while studying.

## Features

- **Pet Creation & Evolution**: Create a pet that evolves through stages based on study time
- **Study Timer**: Pomodoro-style timer with customizable duration and persistent overlay
- **Task Management**: Add and complete study tasks with difficulty levels for points
- **Quiz System**: Generate and take multiple choice quizzes to test your knowledge
- **Study Insights**: AI-powered personalized study tips and progress analysis
- **Data Persistence**: All progress saved to localStorage
- **Clean UI**: TETRITUTOR-inspired dark theme with modern design

## Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Gemini API key (optional, for AI-powered quiz generation)
- No build tools or dependencies required!

### Installation

1. Clone or download the repository
2. Open `index.html` in your web browser
3. That's it! No installation needed.

### Setting up Gemini API (Optional)

For AI-powered quiz generation, you can set up the Gemini API:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open the `.env` file in the project root
3. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. Save the file and refresh the app

**Note**: The app will work without the API key - it will use mock quiz data and insights as a fallback.

### Study Insights Feature

The Study Insights panel provides AI-powered analysis of your study habits:

- **Personalized Tips**: Get study advice based on your actual study patterns
- **Progress Analysis**: See your study time, quiz accuracy, and task completion stats
- **Motivational Messages**: Encouraging insights written as if from your pet companion
- **Study Statistics**: Detailed breakdown of your study performance

The insights are generated using your:
- Total study time and session patterns
- Quiz performance and accuracy
- Task completion rates
- Study streak and consistency

### Files

- `index.html` - Main HTML structure
- `styles.css` - Complete CSS styling
- `script.js` - All JavaScript functionality
- `api-config.js` - API configuration and environment variables
- `.env` - Environment variables (add your Gemini API key here)
- `.gitignore` - Git ignore file (excludes .env from version control)
- `README.md` - This file

## Tech Stack

- Vanilla HTML5
- CSS3 with modern features
- Vanilla JavaScript (ES6+)
- Local Storage API

## Usage

1. **Create a Pet**: Click "New Pet" and give your pet a name
2. **Load Pet**: Click "Load Pet" to continue with an existing pet
3. **Study with Timer**: Use the study timer to track your study sessions
4. **Complete Tasks**: Add study tasks and complete them for points
5. **Take Quizzes**: Generate quizzes to test your knowledge
6. **Watch Your Pet Evolve**: Your pet evolves as you study more!

## Pet Evolution

- **Stage 0 (Hatchling)**: 🐣 - Starting stage
- **Stage 1 (Scholar)**: 🦊 - After 1 hour of study
- **Stage 2 (Master)**: 🐉 - After 24 hours of study

## Customization

Since this is vanilla HTML/CSS/JS, you can easily customize:

- **Colors**: Edit the CSS variables in `styles.css`
- **Layout**: Modify the HTML structure in `index.html`
- **Functionality**: Add features in `script.js`
- **Styling**: Update the CSS classes and styles

## Browser Support

Works in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).