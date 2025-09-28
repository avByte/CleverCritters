// Global State
let currentPet = null;
let tasks = [];
let timerInterval = null;
let timerRunning = false;
let timerMinutes = 25;
let timerRemaining = 25 * 60;
let quizQuestions = [];
let currentQuestionIndex = 0;
let currentQuizResults = {
    correct: 0,
    total: 0,
    topic: '',
    pointsEarned: 0,
    startTime: null,
    endTime: null
};

// Pet Message System
let petMessageInterval = null;
let lastPetMessageTime = 0;

// Pet Data
const PET_SPRITES = {
    "-1": "🥚", // Egg stage - before any activity
    "0": "🐣", // Hatchling - after 1 minute of study or 1 quiz
    "1": "🦊", // Scholar - after 1 hour of study
    "2": "🐉"  // Master - after 24 hours of study
};

const STAGE_NAMES = {
    "-1": "Egg",
    "0": "Hatchling",
    "1": "Scholar", 
    "2": "Master"
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadState();
    showHome();
});

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showHome() {
    showScreen('home-screen');
}

function showNewPet() {
    showScreen('new-pet-screen');
    document.getElementById('pet-name').value = '';
}

function showPetLounge() {
    showScreen('pet-lounge-screen');
    updatePetDisplay();
}

// Pet Management
function createPet() {
    const name = document.getElementById('pet-name').value.trim() || 'Pet';
    const pet = {
        id: Math.random().toString(36).slice(2),
        name: name,
        createdAt: Math.floor(Date.now() / 1000),
        studiedSeconds: 0,
        points: 0,
        stage: -1, // Start as egg
        hasCompletedQuiz: false, // Track if pet has completed at least one quiz
        prizesUnlocked: []
    };
    
    currentPet = pet;
    saveState();
    showPetLounge();
}

function loadPet() {
    if (currentPet) {
        // Ensure existing pets have the new properties
        if (currentPet.hasCompletedQuiz === undefined) {
            currentPet.hasCompletedQuiz = false;
        }
        // If pet is at stage 0 but hasn't done any activity, make it an egg
        if (currentPet.stage === 0 && currentPet.studiedSeconds === 0 && !currentPet.hasCompletedQuiz) {
            currentPet.stage = -1;
        }
        
        showPetLounge();
        // Show welcome back message
        setTimeout(() => {
            showPetMessage("Welcome back! Ready to study?");
        }, 1500);
    } else {
        // Create default pet if none exists
        const pet = {
            id: Math.random().toString(36).slice(2),
            name: 'My Pet',
            createdAt: Math.floor(Date.now() / 1000),
            studiedSeconds: 0,
            points: 0,
            stage: -1, // Start as egg
            hasCompletedQuiz: false,
            prizesUnlocked: []
        };
        currentPet = pet;
        saveState();
        showPetLounge();
        // Show welcome message for new pet
        setTimeout(() => {
            showPetMessage("Hello! I'm your new study companion! 🎓");
        }, 1500);
    }
}

function goHome() {
    currentPet = null;
    tasks = [];
    stopTimer();
    stopPetMessageSystem();
    saveState();
    showHome();
}

function updatePetDisplay() {
    if (!currentPet) return;
    
    // Check for evolution
    checkPetEvolution();
    
    document.getElementById('pet-emoji').textContent = PET_SPRITES[currentPet.stage];
    document.getElementById('pet-name-display').textContent = currentPet.name;
    document.getElementById('stage-badge').textContent = `${STAGE_NAMES[currentPet.stage]} • Stage ${currentPet.stage + 1}`;
    document.getElementById('points-display').textContent = currentPet.points;
    document.getElementById('studied-display').textContent = formatSeconds(currentPet.studiedSeconds);
    
    // Update progress bar
    const progress = Math.min((currentPet.studiedSeconds / (24 * 3600)) * 100, 100);
    document.getElementById('progress-percentage').textContent = Math.floor(progress) + '%';
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Start pet message system
    startPetMessageSystem();
}

// Check if pet should evolve based on activity
function checkPetEvolution() {
    if (!currentPet) return;
    
    let newStage = currentPet.stage;
    
    // Evolution from Egg to Hatchling
    if (currentPet.stage === -1) {
        // Evolve if: 1 minute of study OR 1 quiz completed
        if (currentPet.studiedSeconds >= 60 || currentPet.hasCompletedQuiz) {
            newStage = 0;
        }
    }
    // Evolution from Hatchling to Scholar
    else if (currentPet.stage === 0) {
        // Evolve if: 1 hour of study
        if (currentPet.studiedSeconds >= 3600) {
            newStage = 1;
        }
    }
    // Evolution from Scholar to Master
    else if (currentPet.stage === 1) {
        // Evolve if: 24 hours of study
        if (currentPet.studiedSeconds >= 24 * 3600) {
            newStage = 2;
        }
    }
    
    // If pet evolved, show celebration message
    if (newStage > currentPet.stage) {
        currentPet.stage = newStage;
        saveState();
        
        // Show evolution message
        setTimeout(() => {
            if (newStage === 0) {
                showPetMessage("🎉 I hatched! I'm ready to learn with you! 🐣");
            } else if (newStage === 1) {
                showPetMessage("🌟 I'm evolving! I'm becoming a scholar! 🦊");
            } else if (newStage === 2) {
                showPetMessage("🔥 I've reached mastery! I'm a dragon now! 🐉");
            }
        }, 1000);
    }
}

// Timer Functions
function startTimer() {
    const hours = parseInt(document.getElementById('timer-hours').value) || 0;
    const minutes = parseInt(document.getElementById('timer-minutes').value) || 25;
    const seconds = parseInt(document.getElementById('timer-seconds').value) || 0;
    
    timerMinutes = minutes;
    timerRemaining = (hours * 3600) + (minutes * 60) + seconds;
    
    timerRunning = true;
    
    timerInterval = setInterval(() => {
        timerRemaining--;
        updateTimerDisplay();
        
        if (timerRemaining <= 0) {
            finishTimer();
        }
    }, 1000);
    
    updateTimerDisplay();
    showTimerOverlay();
    closePanel();
}

function stopTimer() {
    timerRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    hideTimerOverlay();
}

function finishTimer() {
    if (!currentPet) return;
    
    const newSec = currentPet.studiedSeconds + timerMinutes * 60;
    currentPet.studiedSeconds = newSec;
    
    updatePetDisplay();
    saveState();
    stopTimer();
    
    // Trigger pet message for completing study session
    setTimeout(() => {
        showPetMessage("Amazing work! You completed a study session! 🎉");
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(timerRemaining / 3600);
    const minutes = Math.floor((timerRemaining % 3600) / 60);
    const seconds = timerRemaining % 60;
    
    let timeString;
    if (hours > 0) {
        timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    document.getElementById('timer-display').textContent = timeString;
    document.getElementById('timer-overlay-display').textContent = timeString;
}

function showTimerOverlay() {
    document.getElementById('timer-overlay').classList.remove('hidden');
}

function hideTimerOverlay() {
    document.getElementById('timer-overlay').classList.add('hidden');
}

// Panel Management
function openPanel(panelType) {
    document.getElementById(panelType + '-panel').classList.add('active');
    
    if (panelType === 'tasks') {
        updateTasksList();
    } else if (panelType === 'insights') {
        generateInsights();
    } else if (panelType === 'pomodoro-settings') {
        loadPomodoroSettings();
    }
}

function closePanel() {
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });
}

// Task Management
function addTask() {
    const title = document.getElementById('task-title').value.trim();
    if (!title) return;
    
    const difficulty = parseInt(document.getElementById('task-difficulty').value);
    const task = {
        id: Math.random().toString(36).slice(2),
        title: title,
        difficulty: difficulty,
        completed: false
    };
    
    tasks.push(task);
    document.getElementById('task-title').value = '';
    updateTasksList();
    saveState();
}

function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    
    const pointsMap = { 1: 10, 2: 25, 3: 50 };
    const gained = pointsMap[task.difficulty];
    currentPet.points += gained;
    
    task.completed = true;
    updatePetDisplay();
    updateTasksList();
    saveState();
    
    // Trigger pet message for completing task
    setTimeout(() => {
        showPetMessage(`Great job completing that task! +${gained} points! ⭐`);
    }, 500);
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    updateTasksList();
    saveState();
}

function updateTasksList() {
    const tasksList = document.getElementById('tasks-list');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>No tasks yet. Add one above to get started!</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-info">
                <div class="difficulty-badge difficulty-${['', 'easy', 'medium', 'hard'][task.difficulty]}">
                    ${['', 'Easy', 'Medium', 'Hard'][task.difficulty]}
                </div>
                <span class="task-title ${task.completed ? 'completed' : ''}">${task.title}</span>
            </div>
            <div class="task-actions">
                ${!task.completed ? `<button class="btn btn-success" onclick="completeTask('${task.id}')">Complete</button>` : ''}
                <button class="btn btn-minimal" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Quiz Management
async function generateQuiz() {
    const prompt = document.getElementById('quiz-prompt').value.trim();
    if (!prompt) return;
    
    // Initialize quiz results tracking
    currentQuizResults = {
        correct: 0,
        total: 0,
        topic: prompt,
        pointsEarned: 0,
        startTime: Date.now(),
        endTime: null
    };
    
    // Show loading state
    const generateBtn = document.querySelector('#quiz-setup button');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = 'Generating Quiz...';
    generateBtn.disabled = true;
    
    try {
        // Check if API key is configured
        if (!window.GEMINI_CONFIG || window.GEMINI_CONFIG.apiKey === 'your_gemini_api_key_here') {
            throw new Error('Please configure your Gemini API key in the .env file');
        }
        
        // Generate quiz using Gemini API
        const quizData = await generateQuizWithGemini(prompt);
        quizQuestions = quizData;
        currentQuestionIndex = 0;
        currentQuizResults.total = quizQuestions.length;
        showQuiz();
        
    } catch (error) {
        console.error('Error generating quiz:', error);
        alert('Error generating quiz: ' + error.message + '\n\nPlease check your API key configuration.');
        
        // Fallback to mock data
        quizQuestions = [
            { q: "What is 2+2?", choices: ['1', '2', '3', '4'], answer: 3 },
            { q: "Which is a prime number?", choices: ['4', '6', '7', '8'], answer: 2 },
            { q: "What is the capital of France?", choices: ['London', 'Berlin', 'Paris', 'Madrid'], answer: 2 }
        ];
        currentQuestionIndex = 0;
        currentQuizResults.total = quizQuestions.length;
        showQuiz();
    } finally {
        // Reset button state
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

async function generateQuizWithGemini(topic) {
    const apiKey = window.GEMINI_CONFIG.apiKey;
    const apiUrl = window.GEMINI_CONFIG.apiUrl;
    
    const prompt = `Generate a quiz about "${topic}" with exactly 3 multiple choice questions. 
    Return the response as a JSON array where each question has this structure:
    {
        "q": "Question text here",
        "choices": ["Option A", "Option B", "Option C", "Option D"],
        "answer": 0
    }
    
    The answer field should be the index (0-3) of the correct choice.
    Make the questions educational and relevant to the topic.
    Ensure all questions have exactly 4 choices.`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Could not parse quiz data from API response');
    }
    
    const quizData = JSON.parse(jsonMatch[0]);
    
    // Validate the quiz data structure
    if (!Array.isArray(quizData) || quizData.length === 0) {
        throw new Error('Invalid quiz data structure');
    }
    
    // Validate each question
    for (let i = 0; i < quizData.length; i++) {
        const question = quizData[i];
        if (!question.q || !Array.isArray(question.choices) || 
            question.choices.length !== 4 || typeof question.answer !== 'number' ||
            question.answer < 0 || question.answer > 3) {
            throw new Error(`Invalid question structure at index ${i}`);
        }
    }
    
    return quizData;
}

function showQuiz() {
    document.getElementById('quiz-setup').classList.add('hidden');
    document.getElementById('quiz-questions').classList.remove('hidden');
    displayCurrentQuestion();
}

function displayCurrentQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    
    document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    document.getElementById('question-text').textContent = question.q;
    
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = progress + '%';
    
    const choicesHtml = question.choices.map((choice, index) => `
        <button class="answer-choice" onclick="answerQuestion(${index})">
            <span class="choice-letter">${String.fromCharCode(65 + index)}.</span>
            ${choice}
        </button>
    `).join('');
    
    document.getElementById('answer-choices').innerHTML = choicesHtml;
}

function answerQuestion(choiceIndex) {
    const question = quizQuestions[currentQuestionIndex];
    
    if (choiceIndex === question.answer) {
        currentPet.points += 5;
        currentQuizResults.correct++;
        currentQuizResults.pointsEarned += 5;
        updatePetDisplay();
    }
    
    // Track quiz statistics for insights
    const quizData = getQuizData();
    if (!quizData.questionsAnswered) quizData.questionsAnswered = 0;
    if (!quizData.correctAnswers) quizData.correctAnswers = 0;
    
    quizData.questionsAnswered++;
    if (choiceIndex === question.answer) {
        quizData.correctAnswers++;
    }
    
    quizData.accuracy = Math.round((quizData.correctAnswers / quizData.questionsAnswered) * 100);
    setQuizData(quizData);
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizQuestions.length) {
        displayCurrentQuestion();
    } else {
        // Quiz completed - show results
        currentQuizResults.endTime = Date.now();
        showQuizResults();
        
        // Update total quizzes
        quizData.totalQuizzes = (quizData.totalQuizzes || 0) + 1;
        setQuizData(quizData);
    }
    
    saveState();
}

function showQuizResults() {
    // Hide questions, show results
    document.getElementById('quiz-questions').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');
    
    // Calculate and display score
    const percentage = Math.round((currentQuizResults.correct / currentQuizResults.total) * 100);
    const timeSpent = Math.round((currentQuizResults.endTime - currentQuizResults.startTime) / 1000);
    
    document.getElementById('quiz-score-percentage').textContent = percentage + '%';
    document.getElementById('quiz-score-text').textContent = `${currentQuizResults.correct} out of ${currentQuizResults.total} correct`;
    document.getElementById('quiz-points-earned').textContent = currentQuizResults.pointsEarned;
    
    // Store quiz result for insights
    storeQuizResult(currentQuizResults);
    
    // Mark that pet has completed a quiz (for evolution)
    if (currentPet) {
        currentPet.hasCompletedQuiz = true;
        saveState();
    }
    
    // Generate personalized feedback
    generateQuizFeedback(percentage, currentQuizResults.topic, timeSpent);
    
    // Trigger pet message for completing quiz
    setTimeout(() => {
        if (percentage >= 80) {
            showPetMessage(`Fantastic quiz performance! ${percentage}% is amazing! 🌟`);
        } else if (percentage >= 60) {
            showPetMessage(`Good job on the quiz! ${percentage}% is solid progress! 👍`);
        } else {
            showPetMessage(`Keep practicing! Every quiz makes you stronger! 💪`);
        }
    }, 2000);
}

function generateQuizFeedback(percentage, topic, timeSpent) {
    let feedback = '';
    let emoji = '';
    
    if (percentage >= 90) {
        emoji = '🌟';
        feedback = `Excellent work! You've mastered ${topic}! Your ${percentage}% score shows you really understand this material.`;
    } else if (percentage >= 70) {
        emoji = '👍';
        feedback = `Good job! You scored ${percentage}% on ${topic}. You're on the right track - keep studying to improve even more!`;
    } else if (percentage >= 50) {
        emoji = '📚';
        feedback = `You scored ${percentage}% on ${topic}. This is a great starting point! Review the material and try another quiz to improve.`;
    } else {
        emoji = '💪';
        feedback = `You scored ${percentage}% on ${topic}. Don't worry - every expert was once a beginner! Keep studying and you'll improve.`;
    }
    
    // Add time-based feedback
    if (timeSpent < 30) {
        feedback += ` You completed the quiz quickly in ${timeSpent} seconds - great focus!`;
    } else if (timeSpent < 120) {
        feedback += ` You took your time (${timeSpent} seconds) - good approach to learning!`;
    } else {
        feedback += ` You spent ${Math.round(timeSpent/60)} minutes on this quiz - thorough learning!`;
    }
    
    document.getElementById('quiz-feedback').innerHTML = `
        <div class="feedback-message">
            <div class="feedback-emoji">${emoji}</div>
            <div class="feedback-text">${feedback}</div>
        </div>
    `;
}

function resetQuiz() {
    document.getElementById('quiz-setup').classList.remove('hidden');
    document.getElementById('quiz-questions').classList.add('hidden');
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-prompt').value = '';
    quizQuestions = [];
    currentQuestionIndex = 0;
    currentQuizResults = {
        correct: 0,
        total: 0,
        topic: '',
        pointsEarned: 0,
        startTime: null,
        endTime: null
    };
}

// Utility Functions
function formatSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

// Local Storage
function saveState() {
    const state = {
        pet: currentPet,
        tasks: tasks
    };
    localStorage.setItem('clevercritters_state', JSON.stringify(state));
}

function loadState() {
    try {
        const saved = localStorage.getItem('clevercritters_state');
        if (saved) {
            const state = JSON.parse(saved);
            currentPet = state.pet;
            tasks = state.tasks || [];
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
}

// Initialize Pomodoro settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPomodoroSettings();
});

// Study Insights Management
let studyStats = {
    totalStudyTime: 0,
    studySessions: 0,
    averageSessionLength: 0,
    bestStudyTime: 'morning',
    quizAccuracy: 0,
    totalQuizzes: 0,
    completedTasks: 0,
    totalTasks: 0,
    studyStreak: 0,
    lastStudyDate: null
};

async function generateInsights() {
    const loadingElement = document.getElementById('insights-loading');
    const mainElement = document.getElementById('insights-main');
    const messagesElement = document.getElementById('insights-messages');
    
    // Show loading state
    loadingElement.classList.remove('hidden');
    mainElement.classList.add('hidden');
    
    try {
        // Update study stats
        updateStudyStats();
        
        // Check if API key is configured
        if (!window.GEMINI_CONFIG || window.GEMINI_CONFIG.apiKey === 'your_gemini_api_key_here') {
            throw new Error('Please configure your Gemini API key in the .env file');
        }
        
        // Generate insights using Gemini API
        const insights = await generateInsightsWithGemini();
        
        // Display insights
        displayInsights(insights);
        
        // Display struggle topics
        displayStruggleTopics();
        
    } catch (error) {
        console.error('Error generating insights:', error);
        
        // Fallback to mock insights
        const mockInsights = generateMockInsights();
        displayInsights(mockInsights);
        
        // Still show struggle topics even with fallback
        displayStruggleTopics();
        
        if (error.message.includes('API key')) {
            alert('Please configure your Gemini API key in the .env file to get AI-powered insights!');
        }
    } finally {
        // Hide loading state
        loadingElement.classList.add('hidden');
        mainElement.classList.remove('hidden');
    }
}

function updateStudyStats() {
    const pet = getPet();
    if (!pet) return;
    
    // Calculate study time stats
    studyStats.totalStudyTime = pet.studiedSeconds;
    studyStats.studySessions = Math.floor(pet.studiedSeconds / 1500); // Assuming 25min sessions
    studyStats.averageSessionLength = studyStats.studySessions > 0 ? 
        Math.round(pet.studiedSeconds / studyStats.studySessions) : 0;
    
    // Calculate quiz stats
    const quizData = getQuizData();
    studyStats.totalQuizzes = quizData.totalQuizzes || 0;
    studyStats.quizAccuracy = quizData.accuracy || 0;
    
    // Calculate task stats
    const tasks = getTasks();
    studyStats.totalTasks = tasks.length;
    studyStats.completedTasks = tasks.filter(t => t.completed).length;
    
    // Calculate study streak (simplified)
    studyStats.studyStreak = Math.floor(studyStats.totalStudyTime / 3600); // 1 hour = 1 day streak
    
    // Determine best study time (mock for now)
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) studyStats.bestStudyTime = 'morning';
    else if (hour >= 12 && hour < 18) studyStats.bestStudyTime = 'afternoon';
    else studyStats.bestStudyTime = 'evening';
}

async function generateInsightsWithGemini() {
    const apiKey = window.GEMINI_CONFIG.apiKey;
    const apiUrl = window.GEMINI_CONFIG.apiUrl;
    
    // Get recent quiz performance data
    const quizData = getQuizData();
    const recentQuizResults = getRecentQuizResults();
    
    const prompt = `Generate personalized study insights for a student based on these stats:
    
    - Total study time: ${formatTime(studyStats.totalStudyTime)}
    - Study sessions completed: ${studyStats.studySessions}
    - Average session length: ${formatTime(studyStats.averageSessionLength)}
    - Quiz accuracy: ${studyStats.quizAccuracy}%
    - Total quizzes taken: ${studyStats.totalQuizzes}
    - Tasks completed: ${studyStats.completedTasks}/${studyStats.totalTasks}
    - Study streak: ${studyStats.studyStreak} days
    - Best study time: ${studyStats.bestStudyTime}
    ${recentQuizResults.length > 0 ? `
    - Recent quiz topics: ${recentQuizResults.map(q => q.topic).join(', ')}
    - Recent quiz performance: ${recentQuizResults.map(q => `${q.percentage}% on ${q.topic}`).join(', ')}
    - Average recent quiz score: ${Math.round(recentQuizResults.reduce((sum, q) => sum + q.percentage, 0) / recentQuizResults.length)}%
    ` : ''}
    
    Generate 3-4 short, encouraging insights (2-3 sentences each) that:
    1. Acknowledge their progress and achievements
    2. Provide specific, actionable study tips based on their quiz performance
    3. Motivate them to continue studying
    4. Are written as if coming from their study pet companion
    5. Reference specific quiz topics and performance where relevant
    
    Return as JSON array with this structure:
    [
        {
            "title": "Insight Title",
            "content": "Insight content here...",
            "icon": "🎯",
            "stats": ["stat1", "stat2"]
        }
    ]
    
    Make it encouraging and personalized!`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Could not parse insights data from API response');
    }
    
    const insights = JSON.parse(jsonMatch[0]);
    
    // Validate the insights data structure
    if (!Array.isArray(insights) || insights.length === 0) {
        throw new Error('Invalid insights data structure');
    }
    
    return insights;
}

function generateMockInsights() {
    const insights = [
        {
            title: "Great Progress! 🎉",
            content: `You've studied for ${formatTime(studyStats.totalStudyTime)} total! Your dedication is really paying off. Keep up the momentum!`,
            icon: "🎉",
            stats: [`${formatTime(studyStats.totalStudyTime)} studied`, `${studyStats.studySessions} sessions`]
        }
    ];
    
    if (studyStats.quizAccuracy > 0) {
        insights.push({
            title: "Quiz Master! 🧠",
            content: `Your ${studyStats.quizAccuracy}% quiz accuracy shows you're really understanding the material. Try challenging yourself with harder topics!`,
            icon: "🧠",
            stats: [`${studyStats.quizAccuracy}% accuracy`, `${studyStats.totalQuizzes} quizzes`]
        });
    }
    
    if (studyStats.completedTasks > 0) {
        insights.push({
            title: "Task Champion! ✅",
            content: `You've completed ${studyStats.completedTasks} out of ${studyStats.totalTasks} tasks. Your organized approach is working wonders!`,
            icon: "✅",
            stats: [`${studyStats.completedTasks}/${studyStats.totalTasks} tasks`, `${Math.round((studyStats.completedTasks/studyStats.totalTasks)*100)}% completion`]
        });
    }
    
    insights.push({
        title: "Study Tips! 💡",
        content: `Your best study time is in the ${studyStats.bestStudyTime}. Try scheduling your most challenging topics during this time for maximum focus!`,
        icon: "💡",
        stats: [`Best time: ${studyStats.bestStudyTime}`, `${studyStats.studyStreak} day streak`]
    });
    
    return insights;
}

function displayInsights(insights) {
    const messagesElement = document.getElementById('insights-messages');
    
    messagesElement.innerHTML = insights.map(insight => `
        <div class="insights-message">
            <div class="insights-message-header">
                <span class="insights-message-icon">${insight.icon}</span>
                <span class="insights-message-title">${insight.title}</span>
            </div>
            <div class="insights-message-content">${insight.content}</div>
            <div class="insights-message-stats">
                ${insight.stats.map(stat => `<span class="insight-stat">${stat}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function showStudyStats() {
    const messagesElement = document.getElementById('insights-messages');
    
    messagesElement.innerHTML = `
        <div class="study-stats">
            <h4>📊 Your Study Statistics</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${formatTime(studyStats.totalStudyTime)}</div>
                    <div class="stat-label">Total Time</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${studyStats.studySessions}</div>
                    <div class="stat-label">Sessions</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${formatTime(studyStats.averageSessionLength)}</div>
                    <div class="stat-label">Avg Session</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${studyStats.quizAccuracy}%</div>
                    <div class="stat-label">Quiz Accuracy</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${studyStats.completedTasks}/${studyStats.totalTasks}</div>
                    <div class="stat-label">Tasks Done</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${studyStats.studyStreak}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
            </div>
        </div>
    `;
    
    // Also display struggle topics when showing stats
    displayStruggleTopics();
}

// Helper functions for data retrieval
function getQuizData() {
    const data = localStorage.getItem('quizData');
    return data ? JSON.parse(data) : { totalQuizzes: 0, accuracy: 0 };
}

function setQuizData(data) {
    localStorage.setItem('quizData', JSON.stringify(data));
}

// Store recent quiz results for insights
function storeQuizResult(result) {
    const recentResults = getRecentQuizResults();
    recentResults.push({
        topic: result.topic,
        percentage: Math.round((result.correct / result.total) * 100),
        correct: result.correct,
        total: result.total,
        timeSpent: Math.round((result.endTime - result.startTime) / 1000),
        timestamp: Date.now()
    });
    
    // Keep only the last 10 quiz results
    if (recentResults.length > 10) {
        recentResults.splice(0, recentResults.length - 10);
    }
    
    localStorage.setItem('recentQuizResults', JSON.stringify(recentResults));
}

function getRecentQuizResults() {
    const data = localStorage.getItem('recentQuizResults');
    return data ? JSON.parse(data) : [];
}

// Analyze quiz performance to identify struggle topics
function analyzeStruggleTopics() {
    const recentResults = getRecentQuizResults();
    const struggleThreshold = 70; // Topics with scores below 70% are considered struggles
    
    // Group results by topic
    const topicPerformance = {};
    
    recentResults.forEach(result => {
        if (!topicPerformance[result.topic]) {
            topicPerformance[result.topic] = {
                topic: result.topic,
                scores: [],
                attempts: 0,
                totalScore: 0,
                averageScore: 0,
                lowestScore: 100,
                lastAttempt: 0
            };
        }
        
        topicPerformance[result.topic].scores.push(result.percentage);
        topicPerformance[result.topic].attempts++;
        topicPerformance[result.topic].totalScore += result.percentage;
        topicPerformance[result.topic].averageScore = Math.round(topicPerformance[result.topic].totalScore / topicPerformance[result.topic].attempts);
        topicPerformance[result.topic].lowestScore = Math.min(topicPerformance[result.topic].lowestScore, result.percentage);
        topicPerformance[result.topic].lastAttempt = Math.max(topicPerformance[result.topic].lastAttempt, result.timestamp);
    });
    
    // Identify struggle topics
    const struggleTopics = Object.values(topicPerformance)
        .filter(topic => topic.averageScore < struggleThreshold)
        .sort((a, b) => a.averageScore - b.averageScore); // Sort by worst performance first
    
    return struggleTopics;
}

// Display struggle topics in the insights panel
function displayStruggleTopics() {
    const struggleTopics = analyzeStruggleTopics();
    const container = document.getElementById('struggle-topics-list');
    
    if (struggleTopics.length === 0) {
        container.innerHTML = `
            <div class="empty-struggles">
                <div class="empty-icon">🎉</div>
                <p>Great job! No struggle topics found.<br>You're performing well on all your quizzes!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = struggleTopics.map(topic => `
        <div class="struggle-topic-item">
            <div class="topic-info">
                <div class="topic-name">${topic.topic}</div>
                <div class="topic-details">
                    <span class="topic-score">Average: ${topic.averageScore}%</span>
                    <span class="topic-frequency">${topic.attempts} attempt${topic.attempts > 1 ? 's' : ''}</span>
                    <span class="topic-score">Lowest: ${topic.lowestScore}%</span>
                </div>
            </div>
            <div class="topic-actions">
                <button class="btn btn-secondary" onclick="retakeTopicQuiz('${topic.topic}')">Retake Quiz</button>
                <button class="btn btn-minimal" onclick="viewTopicDetails('${topic.topic}')">Details</button>
            </div>
        </div>
    `).join('');
}

// Retake quiz for a specific topic
function retakeTopicQuiz(topic) {
    // Close insights panel
    closePanel();
    
    // Open quiz panel
    openPanel('quiz');
    
    // Pre-fill the quiz prompt with the topic
    document.getElementById('quiz-prompt').value = topic;
    
    // Generate quiz automatically
    generateQuiz();
}

// View detailed performance for a topic
function viewTopicDetails(topic) {
    const recentResults = getRecentQuizResults();
    const topicResults = recentResults.filter(result => result.topic === topic);
    
    if (topicResults.length === 0) {
        alert('No quiz results found for this topic.');
        return;
    }
    
    // Calculate summary statistics
    const totalAttempts = topicResults.length;
    const averageScore = Math.round(topicResults.reduce((sum, result) => sum + result.percentage, 0) / totalAttempts);
    const bestScore = Math.max(...topicResults.map(result => result.percentage));
    const worstScore = Math.min(...topicResults.map(result => result.percentage));
    const latestAttempt = new Date(Math.max(...topicResults.map(result => result.timestamp)));
    
    // Update modal title
    document.getElementById('modal-topic-title').textContent = `"${topic}" Performance Details`;
    
    // Create performance summary
    document.getElementById('topic-performance-chart').innerHTML = `
        <div class="performance-summary">
            <div class="summary-item">
                <div class="summary-value">${averageScore}%</div>
                <div class="summary-label">Average</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${bestScore}%</div>
                <div class="summary-label">Best</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${worstScore}%</div>
                <div class="summary-label">Worst</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${totalAttempts}</div>
                <div class="summary-label">Attempts</div>
            </div>
        </div>
    `;
    
    // Create attempts list
    const attemptsHtml = topicResults
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
        .map((result, index) => {
            const scoreClass = getScoreClass(result.percentage);
            const date = new Date(result.timestamp).toLocaleDateString();
            const time = new Date(result.timestamp).toLocaleTimeString();
            
            return `
                <div class="attempt-item">
                    <div class="attempt-info">
                        <div class="attempt-number">Attempt ${totalAttempts - index}</div>
                        <div class="attempt-date">${date} at ${time}</div>
                    </div>
                    <div class="attempt-score ${scoreClass}">${result.percentage}%</div>
                </div>
            `;
        }).join('');
    
    document.getElementById('topic-attempts-list').innerHTML = attemptsHtml;
    
    // Show modal
    document.getElementById('topic-details-modal').classList.remove('hidden');
}

// Get CSS class for score styling
function getScoreClass(percentage) {
    if (percentage >= 90) return 'score-excellent';
    if (percentage >= 80) return 'score-good';
    if (percentage >= 70) return 'score-fair';
    return 'score-poor';
}

// Close topic details modal
function closeTopicDetails() {
    document.getElementById('topic-details-modal').classList.add('hidden');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('topic-details-modal');
    if (event.target === modal) {
        closeTopicDetails();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTopicDetails();
    }
});

// Pet Message System
function startPetMessageSystem() {
    // Clear any existing interval
    if (petMessageInterval) {
        clearInterval(petMessageInterval);
    }
    
    // Set up random message interval (every 30 seconds)
    petMessageInterval = setInterval(() => {
        const timeSinceLastMessage = Date.now() - lastPetMessageTime;
        if (timeSinceLastMessage > 30000) { // At least 30 seconds between messages
            generateRandomPetMessage();
        }
    }, 30000); // Check every 30 seconds
}

function stopPetMessageSystem() {
    if (petMessageInterval) {
        clearInterval(petMessageInterval);
        petMessageInterval = null;
    }
    hidePetMessage();
}

async function generateRandomPetMessage() {
    try {
        // Get current stats for context
        const quizData = getQuizData();
        const recentResults = getRecentQuizResults();
        const studyTime = currentPet ? formatSeconds(currentPet.studiedSeconds) : '0s';
        const points = currentPet ? currentPet.points : 0;
        const stage = currentPet ? currentPet.stage : 0;
        
        // Check if API is available
        if (!window.GEMINI_CONFIG || window.GEMINI_CONFIG.apiKey === 'your_gemini_api_key_here') {
            showPetMessage(getFallbackPetMessage());
            return;
        }
        
        // Create context for the pet message
        const context = `
        You are a friendly study pet companion. Generate a short, encouraging message (1-2 sentences) based on the student's progress:
        
        - Pet name: ${currentPet ? currentPet.name : 'Student'}
        - Study time: ${studyTime}
        - Points earned: ${points}
        - Pet stage: ${STAGE_NAMES[stage]}
        - Total quizzes taken: ${quizData.totalQuizzes || 0}
        - Quiz accuracy: ${quizData.accuracy || 0}%
        - Recent quiz topics: ${recentResults.slice(-3).map(r => r.topic).join(', ') || 'None yet'}
        
        Make the message:
        - Encouraging and supportive
        - Reference their actual progress
        - Be enthusiastic but not overwhelming
        - Keep it under 50 words
        - Use emojis appropriately
        - Sound like a caring study companion
        
        Examples of good messages:
        - "Great job! You've completed ${quizData.totalQuizzes || 0} quizzes! 🎉"
        - "I love seeing you study! You've earned ${points} points! ⭐"
        - "You're doing amazing! Keep up the great work! 💪"
        `;
        
        const apiKey = window.GEMINI_CONFIG.apiKey;
        const apiUrl = window.GEMINI_CONFIG.apiUrl;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: context
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 100,
            }
        };
        
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const message = data.candidates[0].content.parts[0].text.trim();
            showPetMessage(message);
        } else {
            throw new Error('Invalid response from API');
        }
        
    } catch (error) {
        console.error('Error generating pet message:', error);
        // Fallback to predefined messages
        showPetMessage(getFallbackPetMessage());
    }
}

function getFallbackPetMessage() {
    const quizData = getQuizData();
    const points = currentPet ? currentPet.points : 0;
    const studyTime = currentPet ? formatSeconds(currentPet.studiedSeconds) : '0s';
    
    const messages = [
        `Great work! You've earned ${points} points! ⭐`,
        `You've studied for ${studyTime} - amazing! 🎓`,
        `I'm so proud of your progress! 💪`,
        `Keep up the excellent work! 🌟`,
        `You're becoming a study master! 🧠`,
        `I love seeing you learn! 📚`,
        `Your dedication is inspiring! ✨`,
        `You've completed ${quizData.totalQuizzes || 0} quizzes! 🎉`,
        `Every study session makes you stronger! 💪`,
        `You're doing fantastic! Keep it up! 🌟`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

function showPetMessage(message) {
    const speechBubble = document.getElementById('pet-speech-bubble');
    const messageText = document.getElementById('pet-message');
    
    if (!speechBubble || !messageText) {
        return;
    }
    
    // Update message text
    messageText.textContent = message;
    
    // Show speech bubble
    speechBubble.classList.remove('hidden', 'fade-out');
    
    // Hide after 4 seconds
    setTimeout(() => {
        speechBubble.classList.add('fade-out');
        setTimeout(() => {
            speechBubble.classList.add('hidden');
            speechBubble.classList.remove('fade-out');
        }, 300);
    }, 4000);
    
    // Update last message time
    lastPetMessageTime = Date.now();
}

function hidePetMessage() {
    const speechBubble = document.getElementById('pet-speech-bubble');
    speechBubble.classList.add('hidden', 'fade-out');
}


function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Pomodoro Settings Management
let pomodoroSettings = {
    studyMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4
};

function loadPomodoroSettings() {
    // Load settings from localStorage or use defaults
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        pomodoroSettings = JSON.parse(saved);
    }
    
    // Update the input fields
    document.getElementById('study-minutes').value = pomodoroSettings.studyMinutes;
    document.getElementById('break-minutes').value = pomodoroSettings.breakMinutes;
    document.getElementById('long-break-minutes').value = pomodoroSettings.longBreakMinutes;
    document.getElementById('sessions-before-long-break').value = pomodoroSettings.sessionsBeforeLongBreak;
    
    // Update current settings display
    updateCurrentSettingsDisplay();
}

function savePomodoroSettings() {
    // Get values from inputs
    pomodoroSettings.studyMinutes = parseInt(document.getElementById('study-minutes').value) || 25;
    pomodoroSettings.breakMinutes = parseInt(document.getElementById('break-minutes').value) || 5;
    pomodoroSettings.longBreakMinutes = parseInt(document.getElementById('long-break-minutes').value) || 15;
    pomodoroSettings.sessionsBeforeLongBreak = parseInt(document.getElementById('sessions-before-long-break').value) || 4;
    
    // Save to localStorage
    localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings));
    
    // Update display
    updateCurrentSettingsDisplay();
    
    // Show success message
    alert('Pomodoro settings saved successfully!');
}

function updateCurrentSettingsDisplay() {
    document.getElementById('current-study').textContent = `${pomodoroSettings.studyMinutes} minutes`;
    document.getElementById('current-break').textContent = `${pomodoroSettings.breakMinutes} minutes`;
    document.getElementById('current-long-break').textContent = `${pomodoroSettings.longBreakMinutes} minutes`;
    document.getElementById('current-sessions').textContent = pomodoroSettings.sessionsBeforeLongBreak;
}

function startPomodoroSession() {
    // Set the timer to the study period
    document.getElementById('timer-hours').value = 0;
    document.getElementById('timer-minutes').value = pomodoroSettings.studyMinutes;
    document.getElementById('timer-seconds').value = 0;
    
    // Close the pomodoro settings panel
    closePanel();
    
    // Start the timer
    startTimer();
}

