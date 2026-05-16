// Achievement System for MojQuiz
// Tracks user progress and unlocks badges

const ACHIEVEMENTS = {
    first_quiz: {
        id: 'first_quiz',
        name: 'Getting Started',
        description: 'Complete your first quiz',
        icon: '🎯',
        condition: (stats) => stats.totalQuizzes >= 1
    },
    quiz_master: {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Complete 10 quizzes',
        icon: '🏆',
        condition: (stats) => stats.totalQuizzes >= 10
    },
    quiz_legend: {
        id: 'quiz_legend',
        name: 'Quiz Legend',
        description: 'Complete 50 quizzes',
        icon: '👑',
        condition: (stats) => stats.totalQuizzes >= 50
    },
    perfect_score: {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '💯',
        condition: (stats) => stats.perfectScores >= 1
    },
    perfectionist: {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Get 100% on 5 different quizzes',
        icon: '⭐',
        condition: (stats) => stats.perfectScores >= 5
    },
    category_explorer: {
        id: 'category_explorer',
        name: 'Category Explorer',
        description: 'Try at least 5 different categories',
        icon: '🗺️',
        condition: (stats) => Object.keys(stats.categoriesPlayed || {}).length >= 5
    },
    knowledge_seeker: {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Complete all 10 quiz categories',
        icon: '🧠',
        condition: (stats) => Object.keys(stats.categoriesPlayed || {}).length >= 10
    },
    hard_mode: {
        id: 'hard_mode',
        name: 'Hard Mode Champion',
        description: 'Complete a Hard difficulty quiz with 80%+ score',
        icon: '🔥',
        condition: (stats) => stats.hardModeWins >= 1
    },
    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a quiz in under 2 minutes',
        icon: '⚡',
        condition: (stats) => stats.fastestTime && stats.fastestTime < 120
    },
    dedicated_learner: {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Complete quizzes on 7 different days',
        icon: '📅',
        condition: (stats) => (stats.uniqueDays || []).length >= 7
    },
    early_bird: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a quiz before 8 AM',
        icon: '🌅',
        condition: (stats) => stats.earlyBird === true
    },
    night_owl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a quiz after 10 PM',
        icon: '🦉',
        condition: (stats) => stats.nightOwl === true
    },
    social_sharer: {
        id: 'social_sharer',
        name: 'Social Sharer',
        description: 'Share your quiz results',
        icon: '📢',
        condition: (stats) => stats.timesShared >= 1
    },
    comeback_kid: {
        id: 'comeback_kid',
        name: 'Comeback Kid',
        description: 'Improve a category score by 30%+',
        icon: '📈',
        condition: (stats) => stats.biggestImprovement >= 30
    },
    diversity_champion: {
        id: 'diversity_champion',
        name: 'Diversity Champion',
        description: 'Score 70%+ in all three difficulty levels',
        icon: '🎨',
        condition: (stats) => {
            const { easy = 0, medium = 0, hard = 0 } = stats.bestByDifficulty || {};
            return easy >= 70 && medium >= 70 && hard >= 70;
        }
    }
};

class AchievementManager {
    constructor() {
        this.stats = this.loadStats();
        this.achievements = this.loadAchievements();
    }

    loadStats() {
        const saved = localStorage.getItem('user_stats');
        return saved ? JSON.parse(saved) : {
            totalQuizzes: 0,
            perfectScores: 0,
            categoriesPlayed: {},
            hardModeWins: 0,
            fastestTime: null,
            uniqueDays: [],
            earlyBird: false,
            nightOwl: false,
            timesShared: 0,
            biggestImprovement: 0,
            bestByDifficulty: { easy: 0, medium: 0, hard: 0 }
        };
    }

    loadAchievements() {
        const saved = localStorage.getItem('unlocked_achievements');
        return saved ? JSON.parse(saved) : [];
    }

    saveStats() {
        localStorage.setItem('user_stats', JSON.stringify(this.stats));
    }

    saveAchievements() {
        localStorage.setItem('unlocked_achievements', JSON.stringify(this.achievements));
    }

    recordQuizCompletion(quizData) {
        const { category, difficulty, score, percentage, timeSpent } = quizData;
        
        // Update basic stats
        this.stats.totalQuizzes++;
        
        // Track perfect scores
        if (percentage === 100) {
            this.stats.perfectScores++;
        }
        
        // Track categories
        if (!this.stats.categoriesPlayed[category]) {
            this.stats.categoriesPlayed[category] = { attempts: 0, bestScore: 0 };
        }
        this.stats.categoriesPlayed[category].attempts++;
        
        // Calculate improvement
        const previousBest = this.stats.categoriesPlayed[category].bestScore;
        if (percentage > previousBest) {
            const improvement = percentage - previousBest;
            if (improvement > this.stats.biggestImprovement) {
                this.stats.biggestImprovement = improvement;
            }
            this.stats.categoriesPlayed[category].bestScore = percentage;
        }
        
        // Track hard mode wins
        if (difficulty === 'hard' && percentage >= 80) {
            this.stats.hardModeWins++;
        }
        
        // Track fastest time
        if (!this.stats.fastestTime || timeSpent < this.stats.fastestTime) {
            this.stats.fastestTime = timeSpent;
        }
        
        // Track unique days
        const today = new Date().toDateString();
        if (!this.stats.uniqueDays.includes(today)) {
            this.stats.uniqueDays.push(today);
        }
        
        // Track time of day
        const hour = new Date().getHours();
        if (hour < 8) {
            this.stats.earlyBird = true;
        }
        if (hour >= 22) {
            this.stats.nightOwl = true;
        }
        
        // Track best by difficulty
        if (percentage > this.stats.bestByDifficulty[difficulty]) {
            this.stats.bestByDifficulty[difficulty] = percentage;
        }
        
        this.saveStats();
        this.checkAchievements();
    }

    recordShare() {
        this.stats.timesShared++;
        this.saveStats();
        this.checkAchievements();
    }

    checkAchievements() {
        const newAchievements = [];
        
        for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
            // Skip if already unlocked
            if (this.achievements.includes(achievement.id)) {
                continue;
            }
            
            // Check if condition is met
            if (achievement.condition(this.stats)) {
                this.achievements.push(achievement.id);
                newAchievements.push(achievement);
            }
        }
        
        if (newAchievements.length > 0) {
            this.saveAchievements();
            this.showAchievementNotifications(newAchievements);
        }
        
        return newAchievements;
    }

    showAchievementNotifications(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showAchievementToast(achievement);
            }, index * 2000); // Stagger notifications
        });
    }

    showAchievementToast(achievement) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-toast-content">
                <div class="achievement-toast-icon">${achievement.icon}</div>
                <div class="achievement-toast-text">
                    <div class="achievement-toast-title">🎉 Achievement Unlocked!</div>
                    <div class="achievement-toast-name">${achievement.name}</div>
                    <div class="achievement-toast-desc">${achievement.description}</div>
                </div>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('achievement-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'achievement-toast-styles';
            style.textContent = `
                .achievement-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(102,126,234,0.4);
                    z-index: 10000;
                    animation: achievementSlideIn 0.5s ease-out, achievementSlideOut 0.5s ease-in 4.5s;
                    max-width: 350px;
                    border: 2px solid rgba(255,255,255,0.3);
                }
                
                .achievement-toast-content {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }
                
                .achievement-toast-icon {
                    font-size: 3rem;
                    line-height: 1;
                }
                
                .achievement-toast-text {
                    flex: 1;
                }
                
                .achievement-toast-title {
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 4px;
                    opacity: 0.9;
                }
                
                .achievement-toast-name {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                
                .achievement-toast-desc {
                    font-size: 0.9rem;
                    opacity: 0.95;
                }
                
                @keyframes achievementSlideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes achievementSlideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
                
                @media (max-width: 768px) {
                    .achievement-toast {
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remove after animation completes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
        
        // Track with Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'achievement_unlocked', {
                'event_category': 'engagement',
                'event_label': achievement.id
            });
        }
    }

    getUnlockedAchievements() {
        return this.achievements.map(id => ACHIEVEMENTS[Object.keys(ACHIEVEMENTS).find(key => ACHIEVEMENTS[key].id === id)]);
    }

    getProgress() {
        const total = Object.keys(ACHIEVEMENTS).length;
        const unlocked = this.achievements.length;
        const percentage = Math.round((unlocked / total) * 100);
        
        return {
            total,
            unlocked,
            percentage,
            achievements: this.getUnlockedAchievements()
        };
    }

    getAllAchievements() {
        return Object.values(ACHIEVEMENTS).map(achievement => ({
            ...achievement,
            unlocked: this.achievements.includes(achievement.id)
        }));
    }
}

// Initialize global achievement manager
const achievementManager = new AchievementManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementManager;
}
