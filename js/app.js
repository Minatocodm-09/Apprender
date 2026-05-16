// MojQuiz - Main App Logic

let categories = [];

// Load categories from JSON (enhances static HTML)
async function loadCategories() {
    try {
        const response = await fetch('data/categories.json');
        categories = await response.json();
        // JavaScript loaded successfully - categories are already in static HTML
        // No need to re-render, just enhance existing cards with click handlers
        enhanceCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        // Static HTML is already present, so users can still navigate
    }
}

// Enhance existing static category cards with JavaScript
function enhanceCategories() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        // Add hover effects or additional JavaScript functionality if needed
        card.style.cursor = 'pointer';
    });
}

// Toggle side menu
function toggleMenu() {
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');

    if (sideMenu && overlay) {
        sideMenu.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Start quiz with selected category
function startQuiz(category) {
    // Save selected category to localStorage
    localStorage.setItem('selectedCategory', category);

    // Redirect to category/difficulty selection page
    window.location.href = 'category';
}

// Cookie consent handling
function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookie-banner').style.display = 'none';
}

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    console.log('Aprender App Initialized');

    // Load categories if on home page
    if (document.getElementById('categories-grid')) {
        loadCategories();
    }

    // Check if cookies were already accepted
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted === 'true') {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    // Initialize ads after content is ready (delay to ensure content renders first)
    // Wait for content to be fully visible before injecting ads

    // Initialize Quick Challenge button
    const quickChallengeBtn = document.getElementById('start-quick-challenge');
    if (quickChallengeBtn) {
        quickChallengeBtn.addEventListener('click', function () {
            console.log('Quick Challenge button clicked');

            // Create quiz container dynamically
            createQuickQuizContainer();

            // Small delay to ensure DOM is updated before starting quiz
            setTimeout(() => {
                // Start the quiz
                startQuickQuiz();

                // Scroll to quiz
                const quizContainer = document.getElementById('quick-quiz-container');
                if (quizContainer) {
                    quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);

            // Hide the button
            quickChallengeBtn.parentElement.style.display = 'none';
        });
    }

});

// ============================================
// Create Quick Quiz Container Dynamically
// ============================================
function createQuickQuizContainer() {
    const wrapper = document.getElementById('quick-quiz-wrapper');
    if (!wrapper) return;

    // Create the entire quiz container HTML
    const quizHTML = `
        <div id="quick-quiz-container" style="margin: 0 0 32px 0; padding: 24px; background: linear-gradient(135deg, rgba(230,126,34,0.25), rgba(255,71,87,0.2)); border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid rgba(230,126,34,0.3);">
            <h2 style="color: #FFB3BA; margin-bottom: 16px; font-size: 1.5rem; font-weight: 600; text-align: center;">⚡ Quick Challenge</h2>
            
            <!-- Question will be displayed here -->
            <div id="quick-quiz-question">
                <div style="background: rgba(255,255,255,0.12); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                    <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 8px;">
                        Question <span id="qq-current">1</span> of 3
                    </p>
                    <h3 id="qq-question-text" style="color: #fff; font-size: 1.1rem; line-height: 1.5; margin-bottom: 20px;"></h3>
                    <div id="qq-options" style="display: grid; gap: 12px;">
                        <!-- Options will be inserted here -->
                    </div>
                </div>
                <div style="text-align: center; margin-top: 16px;">
                    <p id="qq-feedback" style="font-weight: 600; font-size: 1.1rem; min-height: 24px;"></p>
                </div>
            </div>
            
            <div id="quick-quiz-result" style="display: none; text-align: center;">
                <div style="background: linear-gradient(135deg, var(--primary-color), var(--accent-orange)); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: #fff; font-size: 1.8rem; margin-bottom: 8px;">🎉 Quiz Complete!</h3>
                    <p style="color: rgba(255,255,255,0.95); font-size: 1.3rem;">
                        You scored <span id="qq-score" style="font-weight: bold;">0/3</span>
                    </p>
                </div>
                <button onclick="startQuickQuiz()" class="btn btn-primary">
                    <i class="fas fa-redo" style="margin-right: 8px;"></i>Try Again
                </button>
            </div>
        </div>
    `;

    // Insert the container into the wrapper
    wrapper.innerHTML = quizHTML;
}

// ============================================
// Quick Quiz Functionality
// ============================================
let quickQuizQuestions = [];
let currentQuickQuestion = 0;
let quickQuizScore = 0;
let selectedAnswer = null;

const quickQuizData = [
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
    { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correct: 1 },
    { question: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"], correct: 2 },
    { question: "What is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], correct: 3 },
    { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2 },
    { question: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Bangkok"], correct: 2 },
    { question: "Which animal is known as the King of the Jungle?", options: ["Tiger", "Lion", "Elephant", "Bear"], correct: 1 },
    { question: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2 },
    { question: "How many days are in a leap year?", options: ["365", "366", "367", "364"], correct: 1 }
];

function startQuickQuiz() {
    console.log('Starting Quick Quiz');

    // Check if required elements exist
    const resultElement = document.getElementById('quick-quiz-result');
    const questionElement = document.getElementById('quick-quiz-question');

    if (!resultElement || !questionElement) {
        console.error('Quiz elements not found');
        return;
    }

    // Shuffle and pick 3 random questions
    const shuffled = [...quickQuizData].sort(() => Math.random() - 0.5);
    quickQuizQuestions = shuffled.slice(0, 3);
    currentQuickQuestion = 0;
    quickQuizScore = 0;
    selectedAnswer = null;

    resultElement.style.display = 'none';
    questionElement.style.display = 'block';

    loadQuickQuestion();
}

function loadQuickQuestion() {
    const question = quickQuizQuestions[currentQuickQuestion];
    selectedAnswer = null;

    document.getElementById('qq-current').textContent = currentQuickQuestion + 1;
    document.getElementById('qq-question-text').textContent = question.question;
    document.getElementById('qq-feedback').textContent = '';

    const optionsContainer = document.getElementById('qq-options');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.style.cssText = 'padding: 14px 20px; background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff; cursor: pointer; text-align: left; transition: all 0.3s; font-size: 1rem;';
        button.textContent = option;
        button.onclick = () => selectQuickAnswer(index, button);

        button.onmouseover = () => {
            if (selectedAnswer === null) {
                button.style.background = 'rgba(255,71,87,0.2)';
                button.style.borderColor = 'var(--primary-color)';
            }
        };
        button.onmouseout = () => {
            if (selectedAnswer === null) {
                button.style.background = 'rgba(255,255,255,0.08)';
                button.style.borderColor = 'rgba(255,255,255,0.2)';
            }
        };

        optionsContainer.appendChild(button);
    });
}

function selectQuickAnswer(index, button) {
    if (selectedAnswer !== null) return; // Already answered

    selectedAnswer = index;
    const question = quickQuizQuestions[currentQuickQuestion];
    const isCorrect = index === question.correct;
    const feedback = document.getElementById('qq-feedback');
    const allButtons = document.querySelectorAll('#qq-options button');

    // Disable all buttons
    allButtons.forEach(btn => {
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.6';
    });

    if (isCorrect) {
        quickQuizScore++;
        button.style.background = 'rgba(46,213,115,0.3)';
        button.style.borderColor = '#2ed573';
        button.style.opacity = '1';
        feedback.style.color = '#e1f9e8ff';
        feedback.textContent = '✔ Correct!';
    } else {
        button.style.background = 'rgba(255,71,87,0.3)';
        button.style.borderColor = '#ff4757';
        button.style.opacity = '1';
        // Show correct answer
        allButtons[question.correct].style.background = 'rgba(46,213,115,0.3)';
        allButtons[question.correct].style.borderColor = '#2ed573';
        allButtons[question.correct].style.opacity = '1';
        feedback.style.color = '#d9f8a8ff';
        feedback.textContent = '✘ Incorrect';
    }

    // Move to next question or show results after 2 seconds
    setTimeout(() => {
        currentQuickQuestion++;
        if (currentQuickQuestion < quickQuizQuestions.length) {
            loadQuickQuestion();
        } else {
            showQuickResults();
        }
    }, 2000);
}

function showQuickResults() {
    document.getElementById('quick-quiz-question').style.display = 'none';
    document.getElementById('quick-quiz-result').style.display = 'block';
    document.getElementById('qq-score').textContent = `${quickQuizScore}/3`;
}