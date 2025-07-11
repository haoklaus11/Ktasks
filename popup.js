// FinDom Task Tracker - Popup JavaScript
class TaskTracker {
    constructor() {
        this.tasks = [];
        this.goals = [];
        this.journalEntries = [];
        this.tributeHistory = [];
        this.proofSubmissions = [];
        this.goddessMessages = [];
        this.praiseBoard = [];
        this.subId = null;
        this.userProfile = {
            submissionPoints: 0,
            level: 'Bronze Sub',
            penalties: 0,
            achievements: [],
            lastLogin: null,
            submissionStreak: 0
        };
        this.settings = {
            notifications: false,
            reminderTime: '09:00',
            privacyMode: false,
            consentGiven: false,
            tributeReminders: true,
            challengeMode: false,
            goddessName: 'Goddess Karo',
            throneUrl: 'https://throne.com/goddesskaro',
            linktreeUrl: 'https://linktr.ee/KGoddessxo',
            proofRequired: true,
            publicPraise: false,
            voiceFeedback: false,
            dashboardTitle: 'The Throne Room'
        };
        this.rewardMessages = [
            "Acceptable... barely. Don't let it go to your empty little head. �",
            "I'm feeling generous. You've earned 1 point. Try not to waste it. ✨",
            "Adequate effort. Perhaps you're not completely hopeless. 👑",
            "A mild improvement. Continue, and I might remember your name. 🖤",
            "Barely satisfactory. Your desperation amuses Me. 💜",
            "Your submission is noted. Don't expect praise for basic obedience. 🌟",
            "Weak, but not entirely worthless. Keep crawling forward. 💋",
            "This will do... for now. Don't disappoint Me again. 👸",
            "Your pathetic efforts have been acknowledged. Barely. 💖",
            "Minimum compliance achieved. How... predictable. 🎯"
        ];
        this.punishmentTasks = [
            "Write 'I exist only to serve and pay' 100 times in perfect handwriting",
            "Kneel in the corner for 15 minutes contemplating your failures",
            "No entertainment for 6 hours - think about how you've disappointed Me",
            "Complete 30 push-ups while reciting 'I am unworthy but grateful'",
            "Tribute penalty: Additional $20 for your disobedience and weakness",
            "Write a 300-word apology explaining why you failed Me",
            "No social media for 8 hours - your attention belongs to Me alone",
            "Send a tribute and explain why I deserve it more than you ever will",
            "Complete a reflection essay on your inadequacies (minimum 200 words)",
            "Punishment tribute: $15 for wasting My valuable time"
        ];
        this.goddessGreetings = [
            "Welcome back, pathetic worm. You have {tasks} unfinished tasks. Explain yourself.",
            "Look who crawls back to Me. Your Goddess has been waiting... impatiently.",
            "Another day, another chance to prove you're not completely worthless.",
            "I see you've returned. Let's see if you can disappoint Me less today.",
            "Welcome to My domain. Your obedience is required, not requested.",
            "Back for more punishment, are we? Show Me you're worth My time.",
            "Your Goddess demands progress. Don't make Me regret acknowledging you.",
            "Time to serve properly, or face the consequences of your weakness."
        ];
        this.levelTiers = {
            'Unimpressive Paypig': { minPoints: 0, maxPoints: 24, perks: [] },
            'Bronze Worm': { minPoints: 25, maxPoints: 49, perks: ['Acknowledged existence'] },
            'Silver Servant': { minPoints: 50, maxPoints: 99, perks: ['Acknowledged existence', 'Occasional praise'] },
            'Gold Gimp': { minPoints: 100, maxPoints: 199, perks: ['Acknowledged existence', 'Occasional praise', 'Priority humiliation'] },
            'Platinum Pet': { minPoints: 200, maxPoints: 499, perks: ['Acknowledged existence', 'Occasional praise', 'Priority humiliation', 'Personal attention'] },
            'Diamond Devotee': { minPoints: 500, maxPoints: 999, perks: ['All privileges', 'VIP degradation', 'Custom punishments'] },
            'Legendary Lapdog': { minPoints: 1000, maxPoints: 9999, perks: ['All privileges', 'VIP degradation', 'Custom punishments', 'Direct communication'] }
        };
        this.init();
    }

    async init() {
        console.log('TaskTracker initializing...');
        await this.loadData();
        console.log('Data loaded, consent given:', this.settings.consentGiven);
        await this.initializeSub();
        
        // Load GitHub tasks first
        await this.loadGitHubData();
        
        this.setupEventListeners();
        this.setupGitHubSync();
        this.updateUI();
        this.checkConsent();
        this.checkPauseStatus();
        this.loadSettingsUI();
        this.updateSyncStatus('ready');
        
        // Initialize advanced features after consent is given
        if (this.settings.consentGiven) {
            this.initializeAdvancedFeatures();
            this.updatePauseUI();
        }
        console.log('TaskTracker initialization complete');
    }

    async loadData() {
        try {
            const result = await chrome.storage.local.get([
                'tasks', 'goals', 'settings', 'journalEntries', 'tributeHistory',
                'proofSubmissions', 'goddessMessages', 'userProfile', 'praiseBoard'
            ]);
            this.tasks = result.tasks || [];
            this.goals = result.goals || [];
            this.journalEntries = result.journalEntries || [];
            this.tributeHistory = result.tributeHistory || [];
            this.proofSubmissions = result.proofSubmissions || [];
            this.goddessMessages = result.goddessMessages || [];
            this.praiseBoard = result.praiseBoard || [];
            this.userProfile = { ...this.userProfile, ...result.userProfile };
            this.settings = { ...this.settings, ...result.settings };
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async saveData() {
        try {
            await chrome.storage.local.set({
                tasks: this.tasks,
                goals: this.goals,
                settings: this.settings,
                journalEntries: this.journalEntries,
                tributeHistory: this.tributeHistory,
                proofSubmissions: this.proofSubmissions,
                goddessMessages: this.goddessMessages,
                userProfile: this.userProfile,
                praiseBoard: this.praiseBoard
            });
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    checkConsent() {
        const consentNotice = document.getElementById('consent-notice');
        const mainContent = document.getElementById('main-content');
        
        console.log('Checking consent status:', this.settings.consentGiven);
        
        if (!this.settings.consentGiven) {
            console.log('Consent not given, showing consent notice');
            if (consentNotice) consentNotice.style.display = 'flex';
            if (mainContent) mainContent.style.display = 'none';
            document.body.classList.remove('consent-given');
        } else {
            console.log('Consent given, showing main content');
            if (consentNotice) consentNotice.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            document.body.classList.add('consent-given');
        }
    }

    setupEventListeners() {
        // Helper function to safely add event listeners
        const addEventListenerSafely = (elementId, event, handler) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, handler);
                console.log(`Event listener added for ${elementId}`);
            } else {
                console.warn(`Element with ID '${elementId}' not found`);
            }
        };

        // Consent buttons
        addEventListenerSafely('accept-consent', 'click', async () => {
            console.log('Consent accepted by user');
            this.settings.consentGiven = true;
            await this.saveData();
            console.log('Consent saved to storage');
            this.checkConsent();
            this.initializeAdvancedFeatures();
            this.updatePauseUI();
            this.showNotification('Welcome to My domain. Your submission begins now.', 'success');
            // Re-setup event listeners after main content is shown
            this.setupMainContentEventListeners();
        });

        addEventListenerSafely('decline-consent', 'click', () => {
            window.close();
        });

        // Setup main content event listeners if consent is already given
        if (this.settings.consentGiven) {
            this.setupMainContentEventListeners();
        }
    }

    setupMainContentEventListeners() {
        // Helper function to safely add event listeners
        const addEventListenerSafely = (elementId, event, handler) => {
            const element = document.getElementById(elementId);
            if (element) {
                // Remove existing event listeners to prevent duplicates
                element.replaceWith(element.cloneNode(true));
                const newElement = document.getElementById(elementId);
                if (newElement) {
                    newElement.addEventListener(event, handler);
                    console.log(`Main content event listener added for ${elementId}`);
                }
            } else {
                console.warn(`Element with ID '${elementId}' not found`);
            }
        };

        // Task/Goal buttons
        addEventListenerSafely('add-task-btn', 'click', () => {
            console.log('Accept First Task button clicked');
            this.acceptFirstTask();
        });

        addEventListenerSafely('add-goal-btn', 'click', () => {
            console.log('Add Goal button clicked');
            this.showTaskModal('goal');
        });

        // Daily check-in
        addEventListenerSafely('daily-check-in-btn', 'click', () => {
            console.log('Daily check-in button clicked');
            this.performDailyCheckin();
        });

        // Proof submission system
        addEventListenerSafely('upload-proof-btn', 'click', () => {
            const fileInput = document.getElementById('proof-file');
            if (fileInput) fileInput.click();
        });

        addEventListenerSafely('proof-file', 'change', (e) => {
            this.handleProofFileUpload(e);
        });

        addEventListenerSafely('submit-proof-btn', 'click', () => {
            this.submitProof();
        });

        // Journal button
        addEventListenerSafely('add-journal-btn', 'click', () => {
            console.log('Add Journal button clicked');
            this.showJournalModal();
        });

        // Tribute and links
        addEventListenerSafely('tribute-btn', 'click', () => {
            console.log('Tribute button clicked');
            this.openTributeLink();
        });

        addEventListenerSafely('throne-link', 'click', () => {
            console.log('Throne link clicked');
            window.open(this.settings.throneUrl, '_blank');
        });

        addEventListenerSafely('linktree-link', 'click', () => {
            console.log('Linktree link clicked');
            window.open(this.settings.linktreeUrl, '_blank');
        });

        // Social media buttons
        addEventListenerSafely('twitter-link', 'click', () => {
            console.log('Twitter link clicked');
            window.open('https://x.com/xKGoddessx', '_blank');
        });

        addEventListenerSafely('loyalfans-link', 'click', () => {
            console.log('LoyalFans link clicked');
            window.open('https://www.loyalfans.com/kgoddessxo', '_blank');
        });

        addEventListenerSafely('onlyfans-link', 'click', () => {
            console.log('OnlyFans link clicked');
            window.open('https://onlyfans.com/goddesskaro', '_blank');
        });

        addEventListenerSafely('discord-link', 'click', () => {
            console.log('Discord link clicked');
            window.open('https://discord.com/invite/QXSnA9cs', '_blank');
        });

        // Redemption task
        addEventListenerSafely('redeem-btn', 'click', () => {
            console.log('Redeem button clicked');
            this.triggerRedemptionTask();
        });

        // Quick actions
        addEventListenerSafely('view-history', 'click', () => {
            console.log('View History button clicked');
            this.showHistory();
        });

        addEventListenerSafely('settings-btn', 'click', () => {
            console.log('Settings button clicked');
            this.toggleSettings();
        });

        addEventListenerSafely('sync-btn', 'click', () => {
            console.log('Sync button clicked');
            this.syncNow();
        });

        // Settings
        addEventListenerSafely('close-settings', 'click', () => {
            console.log('Close Settings button clicked');
            this.toggleSettings();
        });

        addEventListenerSafely('manual-sync', 'click', () => {
            console.log('Manual Sync button clicked');
            this.debugGitHubTasks();
        });

        addEventListenerSafely('export-data', 'click', () => {
            console.log('Export Data button clicked');
            this.exportData();
        });

        addEventListenerSafely('clear-data', 'click', () => {
            console.log('Clear Data button clicked');
            this.clearAllData();
        });

        // Modal
        addEventListenerSafely('cancel-task', 'click', () => {
            console.log('Cancel Task button clicked');
            this.hideTaskModal();
        });

        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Task form submitted');
                this.saveTask();
            });
        }

        // Setup dynamic button event listeners
        this.setupDynamicEventListeners();
    }

    setupDynamicEventListeners() {
        // This function sets up event listeners for dynamically created buttons
        document.addEventListener('click', (e) => {
            // Handle dynamically created "Accept Your First Task" buttons
            if (e.target && e.target.id === 'add-task-btn') {
                console.log('Dynamic Accept First Task button clicked');
                e.preventDefault();
                this.acceptFirstTask();
            }
            
            // Handle dynamically created "Add Goal" buttons
            if (e.target && e.target.id === 'add-goal-btn') {
                console.log('Dynamic Add Goal button clicked');
                e.preventDefault();
                this.showTaskModal('goal');
            }
            
            // Handle task checkboxes
            if (e.target && e.target.classList.contains('task-checkbox')) {
                console.log('Task checkbox clicked');
                const taskId = e.target.dataset.taskId;
                if (taskId) {
                    this.completeTask(taskId);
                }
            }
            
            // Handle proof submission buttons
            if (e.target && e.target.classList.contains('proof-submit-btn')) {
                console.log('Proof submit button clicked');
                const taskId = e.target.dataset.taskId;
                if (taskId) {
                    this.showProofSubmissionModal(taskId);
                }
            }
            
            // Handle goal update buttons
            if (e.target && e.target.onclick && e.target.onclick.toString().includes('updateGoalProgress')) {
                console.log('Goal update button clicked');
                // Extract goal ID from onclick attribute
                const onclickStr = e.target.onclick.toString();
                const match = onclickStr.match(/updateGoalProgress\('([^']+)'\)/);
                if (match) {
                    const goalId = match[1];
                    this.updateGoalProgress(goalId);
                }
            }
        });
    }

    setupTaskTypeListener() {
        // Task type change
        const taskTypeSelect = document.getElementById('task-type');
        if (taskTypeSelect) {
            taskTypeSelect.addEventListener('change', (e) => {
                const amountGroup = document.getElementById('amount-group');
                if (amountGroup) {
                    amountGroup.style.display = e.target.value === 'tribute' ? 'block' : 'none';
                }
            });
        }
    }

    setupSettingsEventListeners() {
        // Helper function to safely add event listeners
        const addEventListenerSafely = (elementId, event, handler) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, handler);
                console.log(`Settings event listener added for ${elementId}`);
            } else {
                console.warn(`Element with ID '${elementId}' not found`);
            }
        };

        // Settings event listeners
        addEventListenerSafely('notifications-toggle', 'change', (e) => {
            this.updateSetting('notifications', e.target.checked);
        });

        addEventListenerSafely('reminder-time', 'change', (e) => {
            this.updateSetting('reminderTime', e.target.value);
        });

        addEventListenerSafely('privacy-mode', 'change', (e) => {
            this.updateSetting('privacyMode', e.target.checked);
            this.togglePrivacyMode(e.target.checked);
        });

        addEventListenerSafely('challenge-mode', 'change', (e) => {
            this.updateSetting('challengeMode', e.target.checked);
            this.toggleChallengeMode(e.target.checked);
        });

        addEventListenerSafely('tribute-reminders', 'change', (e) => {
            this.updateSetting('tributeReminders', e.target.checked);
        });

        addEventListenerSafely('proof-required', 'change', (e) => {
            this.updateSetting('proofRequired', e.target.checked);
        });

        addEventListenerSafely('public-praise', 'change', (e) => {
            this.updateSetting('publicPraise', e.target.checked);
        });

        addEventListenerSafely('voice-feedback', 'change', (e) => {
            this.updateSetting('voiceFeedback', e.target.checked);
        });

        addEventListenerSafely('dashboard-title-select', 'change', (e) => {
            this.updateSetting('dashboardTitle', e.target.value);
            this.updateDashboardTitle(e.target.value);
        });

        addEventListenerSafely('goddess-name', 'change', (e) => {
            this.updateSetting('goddessName', e.target.value);
        });

        // Safeword button
        addEventListenerSafely('safeword-btn', 'click', () => {
            this.showSafewordModal();
        });

        // Safeword modal buttons
        addEventListenerSafely('pause-1-hour', 'click', () => {
            this.pauseActivities(1);
        });

        addEventListenerSafely('pause-24-hours', 'click', () => {
            this.pauseActivities(24);
        });

        addEventListenerSafely('emergency-stop', 'click', () => {
            this.emergencyStop();
        });

        addEventListenerSafely('mental-health-resources', 'click', () => {
            this.openMentalHealthResources();
        });

        addEventListenerSafely('cancel-safeword', 'click', () => {
            this.hideModal('safeword-modal');
        });

        // Proof modal buttons
        addEventListenerSafely('submit-proof', 'click', () => {
            const taskId = document.getElementById('proof-task-id')?.value;
            if (taskId) {
                this.submitProof(taskId);
            }
        });

        addEventListenerSafely('cancel-proof', 'click', () => {
            this.hideModal('proof-modal');
        });
    }

    updateUI() {
        this.updateStats();
        this.updateTaskList();
        this.updateGoalsList();
        this.updateSettings();
        this.updateStatus();
        this.updateFeedbackSystem();
        this.updateJournalPreview();
        this.updateDailyCheckin();
        this.updateUserProfile();
        this.updateGoddessMessagesDisplay();
        this.updateDashboardTitle();
        this.updatePraiseBoardDisplay();
        this.checkDailyCommands(); // Check for daily commands
    }

    updateStats() {
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const currentStreak = this.calculateStreak();
        const goalsMetCount = this.goals.filter(goal => goal.completed).length;

        document.getElementById('tasks-completed').textContent = completedTasks;
        document.getElementById('current-streak').textContent = currentStreak;
        document.getElementById('goals-met').textContent = goalsMetCount;
    }

    updateFeedbackSystem() {
        const overdueTasks = this.tasks.filter(task => 
            !task.completed && task.deadline && new Date(task.deadline) < new Date()
        );
        const completedToday = this.tasks.filter(task => 
            task.completed && this.isToday(new Date(task.completedAt))
        ).length;

        const feedbackCard = document.getElementById('last-feedback');
        const punishmentWarning = document.getElementById('punishment-warning');
        const feedbackText = document.getElementById('feedback-text');
        const warningText = document.getElementById('warning-text');

        if (overdueTasks.length > 0) {
            punishmentWarning.style.display = 'block';
            feedbackCard.style.display = 'none';
            warningText.textContent = `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Time for redemption.`;
        } else if (completedToday > 0) {
            feedbackCard.style.display = 'block';
            punishmentWarning.style.display = 'none';
            feedbackText.textContent = this.getRandomReward();
        } else {
            feedbackCard.style.display = 'none';
            punishmentWarning.style.display = 'none';
        }
    }

    updateJournalPreview() {
        const journalPreview = document.getElementById('journal-preview');
        const lastEntry = document.getElementById('last-journal-entry');
        
        if (this.journalEntries.length > 0) {
            const latest = this.journalEntries[this.journalEntries.length - 1];
            lastEntry.style.display = 'block';
            lastEntry.querySelector('.journal-date').textContent = new Date(latest.date).toLocaleDateString();
            lastEntry.querySelector('.journal-content').textContent = latest.content.substring(0, 100) + '...';
        } else {
            lastEntry.style.display = 'none';
        }
    }

    updateDailyCheckin() {
        const today = new Date().toDateString();
        const lastCheckin = localStorage.getItem('lastCheckin');
        const checkinMessage = document.getElementById('checkin-message');
        const checkinMeta = document.getElementById('checkin-meta');
        const checkinBtn = document.getElementById('daily-check-in-btn');

        if (lastCheckin === today) {
            checkinMessage.textContent = 'Daily check-in complete! ✓';
            checkinMeta.textContent = 'Come back tomorrow for another check-in';
            checkinBtn.disabled = true;
            checkinBtn.textContent = 'Done Today';
        } else {
            checkinMessage.textContent = 'Ready for today\'s check-in';
            checkinMeta.textContent = 'Build your streak!';
            checkinBtn.disabled = false;
            checkinBtn.textContent = 'Check In';
        }
    }

    // Enhanced FinDom Features

    // 1. Proof Submission System
    showProofSubmissionModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content proof-submission-modal">
                <h3>📸 Submit Your Proof, Pet</h3>
                <p class="task-title-reminder">"${task.title}"</p>
                <div class="proof-warning">
                    <p>⚠️ <strong>Note:</strong> Weak submissions will be rejected. Half-effort is an insult to My presence.</p>
                </div>
                <form id="proof-form">
                    <div class="form-group">
                        <label>Proof Type</label>
                        <select id="proof-type" required>
                            <option value="">What have you done to please Me?</option>
                            <option value="text">Written submission/confession</option>
                            <option value="image">Screenshot/Photo evidence</option>
                            <option value="receipt">Payment receipt/transaction</option>
                            <option value="link">Link/URL verification</option>
                        </select>
                    </div>
                    <div class="form-group" id="proof-content-group">
                        <label>Proof Details</label>
                        <textarea id="proof-content" placeholder="Describe your submission in detail... impress Me." rows="4" required></textarea>
                    </div>
                    <div class="form-group" id="image-upload-group" style="display: none;">
                        <label>Upload Evidence</label>
                        <input type="file" id="proof-image" accept="image/*">
                        <small>Your evidence is encrypted and stored locally</small>
                    </div>
                    <div class="form-group">
                        <label>Additional Groveling (Optional)</label>
                        <textarea id="proof-notes" placeholder="Any additional begging for My approval..." rows="2"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Submit for Judgment</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Retreat</button>
                    </div>
                </form>
                <div class="submission-warning">
                    <p><small>I'll be watching. Every submission is evaluated personally.</small></p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle proof type change
        document.getElementById('proof-type').addEventListener('change', (e) => {
            const imageGroup = document.getElementById('image-upload-group');
            const contentGroup = document.getElementById('proof-content-group');
            
            if (e.target.value === 'image') {
                imageGroup.style.display = 'block';
                contentGroup.style.display = 'none';
            } else {
                imageGroup.style.display = 'none';
                contentGroup.style.display = 'block';
            }
        });

        // Handle form submission
        document.getElementById('proof-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitProof(taskId);
            modal.remove();
        });
    }

    async submitProof(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        const proofType = document.getElementById('proof-type').value;
        const proofContent = document.getElementById('proof-content').value;
        const proofNotes = document.getElementById('proof-notes').value;
        const imageFile = document.getElementById('proof-image').files[0];

        let imageData = null;
        if (imageFile) {
            imageData = await this.encryptAndStoreImage(imageFile);
        }

        const proof = {
            id: 'proof_' + Date.now(),
            taskId: taskId,
            type: proofType,
            content: proofContent,
            notes: proofNotes,
            imageData: imageData,
            submittedAt: new Date().toISOString(),
            status: 'pending', // pending, approved, rejected
            goddessResponse: null,
            points: 0
        };

        this.proofSubmissions.push(proof);
        
        // Auto-evaluate proof based on type and content
        this.evaluateProof(proof);
        
        // Mark task as completed if proof is auto-approved
        if (proof.status === 'approved') {
            this.toggleTask(taskId, true);
        }

        this.saveData();
        this.updateUI();
        this.showNotification('Proof submitted! Awaiting Goddess judgment...', 'info');
    }

    async encryptAndStoreImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Basic base64 encoding for local storage
                resolve({
                    data: e.target.result,
                    filename: file.name,
                    size: file.size,
                    type: file.type
                });
            };
            reader.readAsDataURL(file);
        });
    }

    evaluateProof(proof) {
        const task = this.tasks.find(t => t.id === proof.taskId);
        let autoApprove = false;
        let points = 0;
        let response = '';

        // Auto-evaluation logic with dominant responses
        if (proof.type === 'text' && proof.content.length > 20) {
            autoApprove = true;
            points = 5;
            response = "Acceptable... barely. Your words amuse Me, if nothing else.";
        } else if (proof.type === 'receipt' && proof.content.includes('$')) {
            autoApprove = true;
            points = 15;
            response = "Your tribute has been noted. At least you understand your primary purpose. 💰";
        } else if (proof.type === 'link' && proof.content.includes('http')) {
            autoApprove = true;
        }

        if (autoApprove) {
            proof.status = 'approved';
            proof.points = points;
            proof.goddessResponse = response;
            this.awardSubmissionPoints(points);
            this.addGoddessMessage(response, 'approval');
        } else {
            proof.status = 'pending';
            proof.goddessResponse = "Awaiting Judgment. Your submission is in My queue. Remain patient - your value is determined at My leisure, not your convenience.";
            this.addGoddessMessage("Your pathetic submission requires My personal attention. Wait.", 'general');
        }
    }

    // 2. Gamification System
    awardSubmissionPoints(points) {
        this.userProfile.submissionPoints += points;
        this.updateUserLevel();
        this.checkAchievements();
    }

    updateUserLevel() {
        const currentPoints = this.userProfile.submissionPoints;
        let newLevel = 'Bronze Sub';
        
        // Level progression based on points
        const levels = [
            { level: 'Bronze Sub', minPoints: 0, maxPoints: 49 },
            { level: 'Silver Sub', minPoints: 50, maxPoints: 149 },
            { level: 'Gold Sub', minPoints: 150, maxPoints: 299 },
            { level: 'Platinum Sub', minPoints: 300, maxPoints: 499 },
            { level: 'Diamond Sub', minPoints: 500, maxPoints: 999 },
            { level: 'Elite Sub', minPoints: 1000, maxPoints: Infinity }
        ];

        for (const data of levels) {
            if (currentPoints >= data.minPoints && currentPoints <= data.maxPoints) {
                newLevel = data.level;
                break;
            }
        }

        if (newLevel !== this.userProfile.level) {
            const oldLevel = this.userProfile.level;
            this.userProfile.level = newLevel;
            this.addGoddessMessage(`Level up! You are now a ${newLevel}. ${this.getLevelUpMessage()}`, 'levelup');
            this.showNotification(`A mild improvement. You've crawled up to ${newLevel}. Don't disappoint Me.`, 'success');
        }
    }

    getLevelUpMessage() {
        const messages = [
            "You've ascended... barely. Don't let it go to your worthless head. 👑",
            "A mild improvement. Perhaps you're not completely hopeless. �",
            "Your rank has increased. Try not to disappoint Me immediately. ✨",
            "Progress noted. Continue crawling toward adequacy. 🌟",
            "You've earned this advancement through persistent groveling. 🎯",
            "Climb higher, worm. Each level brings you closer to usefulness. 💜",
            "Your devotion is... acceptable. For now. 👸",
            "Rise, pathetic one. You've barely met minimum standards. 🖤"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    checkAchievements() {
        const achievements = [];
        
        // Check various achievement conditions
        if (this.userProfile.submissionPoints >= 100 && !this.userProfile.achievements.includes('Century')) {
            achievements.push('Century');
            this.addGoddessMessage("100 points achieved! You're becoming quite the devoted servant. 💯", 'achievement');
        }
        
        if (this.tasks.filter(t => t.completed).length >= 50 && !this.userProfile.achievements.includes('Task Master')) {
            achievements.push('Task Master');
            this.addGoddessMessage("50 tasks completed! Your obedience is impressive. 📋", 'achievement');
        }
        
        if (this.proofSubmissions.length >= 25 && !this.userProfile.achievements.includes('Proof Collector')) {
            achievements.push('Proof Collector');
            this.addGoddessMessage("25 proofs submitted! Such dedication to accountability. 📸", 'achievement');
        }

        this.userProfile.achievements = [...this.userProfile.achievements, ...achievements];
        
        achievements.forEach(achievement => {
            this.showNotification(`You've earned a small recognition: ${achievement}. Perhaps you're not entirely worthless.`, 'success');
        });
    }

    // 3. Goddess Messaging System
    addGoddessMessage(message, type = 'general') {
        const goddessMessage = {
            id: 'msg_' + Date.now(),
            message: message,
            type: type, // general, approval, punishment, levelup, achievement
            timestamp: new Date().toISOString(),
            read: false
        };

        this.goddessMessages.push(goddessMessage);
        this.saveData();
    }

    showGoddessGreeting() {
        const unfinishedTasks = this.tasks.filter(t => !t.completed).length;
        const greeting = this.goddessGreetings[Math.floor(Math.random() * this.goddessGreetings.length)];
        const personalizedGreeting = greeting.replace('{tasks}', unfinishedTasks);
        
        this.addGoddessMessage(personalizedGreeting, 'greeting');
        this.updateGoddessMessagesDisplay();
    }

    updateGoddessMessagesDisplay() {
        const messagesContainer = document.getElementById('goddess-messages');
        if (!messagesContainer) return;

        const recentMessages = this.goddessMessages
            .slice(-3)
            .reverse();

        messagesContainer.innerHTML = recentMessages.map(msg => `
            <div class="goddess-message ${msg.type}" data-id="${msg.id}">
                <div class="message-content">${msg.message}</div>
                <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    // Daily Commands System
    checkDailyCommands() {
        const today = new Date().toDateString();
        const lastCommandDate = localStorage.getItem('lastCommandDate');
        
        if (lastCommandDate !== today) {
            this.deliverDailyCommand();
            localStorage.setItem('lastCommandDate', today);
        }
    }

    deliverDailyCommand() {
        const dailyCommands = [
            {
                message: "💰 Today's tribute target: $25. Pay now and prove your devotion isn't just empty words.",
                amount: 25,
                type: 'tribute'
            },
            {
                message: "💸 Time for a $35 tribute, worm. Your Goddess demands immediate payment for Her attention.",
                amount: 35,
                type: 'tribute'
            },
            {
                message: "👑 Send $20 tribute and write a 200-word essay about why you exist to serve Me.",
                amount: 20,
                type: 'tribute_task'
            },
            {
                message: "🎯 Today's task: Send $30 tribute and post 'I live to serve My Goddess' on your social media.",
                amount: 30,
                type: 'tribute_task'
            },
            {
                message: "⚡ Tribute time: $40 to acknowledge My superiority. Don't make Me wait.",
                amount: 40,
                type: 'tribute'
            },
            {
                message: "💎 Premium task: $50 tribute + photo proof of you kneeling. Show proper respect.",
                amount: 50,
                type: 'tribute_proof'
            },
            {
                message: "🔥 Weekly reminder: $75 tribute for the privilege of existing in My presence.",
                amount: 75,
                type: 'tribute'
            },
            {
                message: "👸 Send $15 and spend 30 minutes writing about your inadequacies. Self-reflection is required.",
                amount: 15,
                type: 'tribute_task'
            }
        ];

        const command = dailyCommands[Math.floor(Math.random() * dailyCommands.length)];
        
        // Add the command as a goddess message
        this.addGoddessMessage(command.message, 'daily_command');
        
        // Create associated task if it includes a task component
        if (command.type.includes('task') || command.type.includes('proof')) {
            const task = {
                id: 'daily_command_' + Date.now(),
                title: `💰 Daily Command: $${command.amount} Tribute`,
                description: command.message,
                type: 'tribute',
                priority: 'high',
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                completed: false,
                createdAt: new Date().toISOString(),
                source: 'goddess',
                amount: command.amount,
                reward: `${command.amount} Obedience Points`
            };
            
            this.tasks.push(task);
        }
        
        this.saveData();
        this.updateUI();
        this.showNotification('New command received from your Superior.', 'goddess-message');
    }

    // 4. Punishment System
    triggerPunishment(reason) {
        const punishment = this.punishmentTasks[Math.floor(Math.random() * this.punishmentTasks.length)];
        const penaltyPoints = Math.floor(Math.random() * 10) + 5;
        
        this.userProfile.penalties += 1;
        this.userProfile.submissionPoints = Math.max(0, this.userProfile.submissionPoints - penaltyPoints);
        
        const punishmentTask = {
            id: 'punishment_' + Date.now(),
            title: '⚠️ PUNISHMENT TASK',
            description: punishment,
            type: 'punishment',
            priority: 'urgent',
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            createdAt: new Date().toISOString(),
            isPunishment: true,
            reason: reason
        };

        this.tasks.push(punishmentTask);
        this.addGoddessMessage(`Punishment assigned for: ${reason}. Complete immediately or face worse consequences.`, 'punishment');
        this.saveData();
        this.updateUI();
        this.showNotification(`Punishment task assigned! ${penaltyPoints} points deducted.`, 'error');
    }

    // 5. Task Countdown System
    createTaskHTML(task) {
        const privacy = this.settings.privacyMode;
        const title = privacy ? '••••••' : task.title;
        const description = privacy ? 'Hidden for privacy' : task.description;
        const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;
        const timeLeft = task.deadline ? this.getTimeUntilDeadline(task.deadline) : null;
        const priorityColor = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'urgent': '#dc3545'
        }[task.priority] || '#6c757d';
        
        const hasProof = this.proofSubmissions.some(p => p.taskId === task.id);
        const needsProof = this.settings.proofRequired && !task.completed && !hasProof;
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${task.isPunishment ? 'punishment-task' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="taskTracker.toggleTask('${task.id}')"></div>
                <div class="task-info">
                    <div class="task-title">${title}</div>
                    <div class="task-meta">
                        ${description ? description + ' • ' : ''}
                        <span class="task-type-badge" style="background-color: ${priorityColor}">
                            ${task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                        </span>
                        ${task.amount ? ' • $' + task.amount : ''}
                        ${timeLeft ? ' • ' + timeLeft : ''}
                        ${task.reward ? ' • 🎁 ' + task.reward : ''}
                    </div>
                    ${task.isPunishment ? '<div class="punishment-badge">⚠️ PUNISHMENT: ' + task.reason + '</div>' : ''}
                    ${task.isRedemption ? '<div class="redemption-badge">⚠️ Redemption Task</div>' : ''}
                    ${needsProof ? '<div class="proof-required">📸 Proof Required</div>' : ''}
                    ${hasProof ? '<div class="proof-submitted">✅ Proof Submitted</div>' : ''}
                </div>
                <div class="task-actions">
                    ${!task.completed && !hasProof ? `<button class="btn btn-sm btn-outline" onclick="taskTracker.showProofSubmissionModal('${task.id}')">Submit Proof</button>` : ''}
                    ${timeLeft && timeLeft.includes('⏰') ? '<div class="countdown-warning">⏰ URGENT</div>' : ''}
                </div>
            </div>
        `;
    }

    getTimeUntilDeadline(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const timeDiff = deadlineDate.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
            return '⏰ OVERDUE';
        }
        
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours < 1) {
            return `⏰ ${minutes}m remaining`;
        } else if (hours < 24) {
            return `⏰ ${hours}h ${minutes}m remaining`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h remaining`;
        }
    }

    // 6. Enhanced UI Updates
    updateUI() {
        this.updateStats();
        this.updateTaskList();
        this.updateGoalsList();
        this.updateSettings();
        this.updateStatus();
        this.updateFeedbackSystem();
        this.updateJournalPreview();
        this.updateDailyCheckin();
        this.updateUserProfile();
        this.updateGoddessMessagesDisplay();
        this.updateDashboardTitle();
        this.updatePraiseBoardDisplay();
        this.checkDailyCommands(); // Check for daily commands
    }

    updateUserProfile() {
        document.getElementById('user-level').textContent = this.userProfile.level;
        document.getElementById('submission-points').textContent = this.userProfile.submissionPoints;
        document.getElementById('user-penalties').textContent = this.userProfile.penalties;
        document.getElementById('achievement-count').textContent = this.userProfile.achievements.length;
        
        // Update progress bar to next level
        const currentTier = this.levelTiers[this.userProfile.level];
        const progressPercent = ((this.userProfile.submissionPoints - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints)) * 100;
        document.getElementById('level-progress').style.width = Math.min(progressPercent, 100) + '%';
    }

    updateDashboardTitle() {
        const titleElement = document.getElementById('dashboard-title');
        if (titleElement) {
            titleElement.textContent = this.settings.dashboardTitle;
        }
    }

    updateSettings() {
        document.getElementById('notifications-toggle').checked = this.settings.notifications;
        document.getElementById('reminder-time').value = this.settings.reminderTime;
        document.getElementById('privacy-mode').checked = this.settings.privacyMode;
        document.getElementById('challenge-mode').checked = this.settings.challengeMode;
        document.getElementById('tribute-reminders').checked = this.settings.tributeReminders;
        document.getElementById('proof-required').checked = this.settings.proofRequired;
        document.getElementById('public-praise').checked = this.settings.publicPraise;
        document.getElementById('voice-feedback').checked = this.settings.voiceFeedback;
        document.getElementById('dashboard-title-select').value = this.settings.dashboardTitle;
        document.getElementById('goddess-name').value = this.settings.goddessName;
    }

    updateStatus() {
        const statusText = document.getElementById('status-text');
        const hasTasks = this.tasks.length > 0 || this.goals.length > 0;
        statusText.textContent = hasTasks ? 'Active' : 'Ready to Start';
    }

    showSafewordModal() {
        const modal = document.getElementById('safeword-modal');
        modal.style.display = 'flex';
        
        // Set up event listeners for safeword options
        document.getElementById('pause-activities-btn').addEventListener('click', () => {
            const duration = document.getElementById('pause-duration').value;
            this.pauseActivities(parseInt(duration));
        });
        
        document.getElementById('emergency-stop-btn').addEventListener('click', () => {
            this.emergencyStop();
        });
        
        document.getElementById('mental-health-btn').addEventListener('click', () => {
            this.openMentalHealthResources();
        });
        
        document.getElementById('cancel-safeword').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    getTimeRemaining(endTime) {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;
        
        if (diff <= 0) return 'Expired';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    checkPauseStatus() {
        if (this.settings.pausedUntil && new Date(this.settings.pausedUntil) <= new Date()) {
            // Pause has expired
            delete this.settings.pausedUntil;
            delete this.settings.pauseReason;
            this.saveData();
            
            this.showNotification('Your pathetic pause has expired. Welcome back to your obligations.', 'info');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    toggleTask(taskId, forceComplete = false) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (forceComplete || !task.completed) {
            // Check if proof is required and not submitted
            const hasProof = this.proofSubmissions.some(p => p.taskId === taskId);
            if (this.settings.proofRequired && !hasProof && !forceComplete) {
                this.showProofSubmissionModal(taskId);
                return;
            }

            // Complete the task
            task.completed = true;
            task.completedAt = new Date().toISOString();
            
            // Award points based on task type and difficulty
            let points = 1;
            if (task.type === 'tribute') points = 3;
            else if (task.type === 'punishment') points = 5;
            else if (task.priority === 'urgent') points = 4;
            else if (task.priority === 'high') points = 3;
            else if (task.priority === 'medium') points = 2;
            
            this.awardSubmissionPoints(points);
            
            // Show reward message
            if (task.reward) {
                this.showNotification(`Task completed! Reward: ${task.reward}`, 'success');
            } else {
                const rewardMessage = this.rewardMessages[Math.floor(Math.random() * this.rewardMessages.length)];
                this.showNotification(rewardMessage, 'success');
            }
            
            // Add to praise board if enabled
            if (this.settings.publicPraise) {
                this.addToPraiseBoard('praise', `Completed task: ${task.title}`, task.type);
            }
            
            // Add goddess message
            this.addGoddessMessage(this.rewardMessages[Math.floor(Math.random() * this.rewardMessages.length)], 'approval');
            
        } else {
            // Uncomplete the task
            task.completed = false;
            task.completedAt = null;
        }

        this.saveData();
        this.updateUI();
        this.checkAchievements();
    }

    updateTaskList() {
        console.log('🔄 updateTaskList() called');
        const taskList = document.getElementById('task-list');
        if (!taskList) {
            console.log('❌ Task list element not found');
            return;
        }

        console.log('📋 Task list element found');

        // Clear existing tasks
        taskList.innerHTML = '';

        // Filter active tasks (not completed)
        const activeTasks = this.tasks.filter(task => !task.completed);
        console.log(`📋 Active tasks count: ${activeTasks.length}`);
        console.log(`📋 All tasks:`, this.tasks);

        if (activeTasks.length === 0) {
            console.log('📋 No active tasks, showing empty state');
            taskList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>No active tasks yet. Your submission awaits...</p>
                    <button id="add-task-btn" class="btn btn-outline">Accept Your First Task</button>
                </div>
            `;
            
            // Re-add event listener for the new button
            const addTaskBtn = document.getElementById('add-task-btn');
            if (addTaskBtn) {
                addTaskBtn.addEventListener('click', () => {
                    console.log('Accept First Task button clicked');
                    this.acceptFirstTask();
                });
            }
            return;
        }

        console.log(`📋 Displaying ${activeTasks.length} active tasks`);
        // Display tasks
        activeTasks.forEach((task, index) => {
            console.log(`📋 Creating task ${index + 1}:`, task);
            const taskElement = document.createElement('div');
            taskElement.className = 'task-wrapper';
            const taskHTML = this.generateTaskHTML(task);
            console.log(`📋 Generated HTML for task ${task.id}:`, taskHTML);
            taskElement.innerHTML = taskHTML;
            taskList.appendChild(taskElement);
        });

        // Add event listeners for task actions
        this.setupTaskEventListeners();
        console.log('📋 Task list update completed');
    }

    setupTaskEventListeners() {
        // Add event listeners for task completion checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                this.completeTask(taskId);
            });
        });

        // Add event listeners for proof submission buttons
        document.querySelectorAll('.proof-submit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                this.showProofSubmissionModal(taskId);
            });
        });
    }

    generateTaskHTML(task) {
        const timeLeft = task.deadline ? this.getTimeUntilDeadline(task.deadline) : '';
        const needsProof = this.settings.proofRequired && !task.completed;
        const hasProof = this.proofSubmissions.some(proof => proof.taskId === task.id);
        const isOverdue = task.deadline && new Date(task.deadline) < new Date();
        const source = task.source || 'local';

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     data-task-id="${task.id}" onclick="taskTracker.toggleTask('${task.id}')">
                </div>
                <div class="task-info">
                    <div class="task-title ${isOverdue ? 'overdue' : ''}">${task.title}</div>
                    <div class="task-description">${task.description || ''}</div>
                    <div class="task-meta">
                        <span class="task-type">${task.type || 'Task'}</span>
                        ${task.priority ? `<span class="task-priority priority-${task.priority.toLowerCase()}">${task.priority}</span>` : ''}
                        ${timeLeft ? `<span class="task-deadline">${timeLeft}</span>` : ''}
                        ${task.reward ? `<span class="task-reward">🎁 ${task.reward}</span>` : ''}
                        <span class="task-source">📡 ${source}</span>
                    </div>
                    ${needsProof ? '<div class="proof-required">📸 Proof Required</div>' : ''}
                    ${hasProof ? '<div class="proof-submitted">✅ Proof Submitted</div>' : ''}
                </div>
                <div class="task-actions">
                    ${!task.completed && !hasProof ? `<button class="btn btn-sm btn-outline proof-submit-btn" data-task-id="${task.id}" onclick="taskTracker.showProofSubmissionModal('${task.id}')">Submit Proof</button>` : ''}
                    ${isOverdue ? '<div class="countdown-warning">⏰ URGENT</div>' : ''}
                </div>
            </div>
        `;
    }

    // GitHub sync methods
    async loadGitHubData() {
        console.log('🔄 Loading GitHub data...');
        try {
            // Load daily tasks
            await this.loadDailyTasks();
            
            // Load global tasks  
            await this.loadGlobalTasks();
            
            // Load announcements
            await this.loadAnnouncements();
            
            console.log('✅ GitHub data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading GitHub data:', error);
            this.showNotification('GitHub sync failed. Using local data.', 'warning');
        }
    }

    async loadDailyTasks() {
        try {
            console.log('📅 Loading daily tasks from GitHub repository...');
            const response = await fetch('https://raw.githubusercontent.com/haoklaus11/Ktasks/main/daily-tasks.json');
            if (!response.ok) throw new Error('Failed to load daily-tasks.json');
            
            const data = await response.json();
            console.log('📅 Daily tasks data:', data);
            
            // Convert GitHub tasks to our format
            const convertedTasks = data.tasks.filter(task => task.active).map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                type: task.category || 'daily',
                priority: task.difficulty === 'hard' ? 'high' : task.difficulty === 'medium' ? 'medium' : 'low',
                deadline: this.getNextRecurringTime(task.recurringTime),
                completed: false,
                createdAt: new Date().toISOString(),
                source: 'github-daily',
                reward: `${task.points} Obedience Points`,
                proofRequired: task.proofRequired || false,
                proofType: task.proofType || 'text',
                instructions: task.instructions || '',
                recurring: task.recurring || false,
                recurringType: task.recurringType || 'none'
            }));

            // Add to tasks array (avoid duplicates)
            convertedTasks.forEach(newTask => {
                if (!this.tasks.find(existing => existing.id === newTask.id)) {
                    this.tasks.push(newTask);
                    console.log('➕ Added daily task:', newTask.title);
                }
            });

            this.showNotification(`Loaded ${convertedTasks.length} daily tasks from GitHub`, 'success');
        } catch (error) {
            console.error('❌ Error loading daily tasks:', error);
        }
    }

    async loadGlobalTasks() {
        try {
            console.log('🌍 Loading global tasks from GitHub repository...');
            const response = await fetch('https://raw.githubusercontent.com/haoklaus11/Ktasks/main/example-global-tasks.json');
            if (!response.ok) throw new Error('Failed to load example-global-tasks.json');
            
            const data = await response.json();
            console.log('🌍 Global tasks data:', data);
            
            // Convert GitHub tasks to our format
            const convertedTasks = data.tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                type: task.type,
                priority: task.priority,
                deadline: task.deadline === 'daily-09:00' ? this.getTodayAt('09:00') : 
                         task.deadline === 'daily-22:00' ? this.getTodayAt('22:00') : 
                         task.deadline,
                completed: false,
                createdAt: task.createdAt,
                source: 'github-global',
                reward: task.reward,
                amount: task.amount || null,
                expiresAt: task.expiresAt || null
            }));

            // Add to tasks array (avoid duplicates)
            convertedTasks.forEach(newTask => {
                if (!this.tasks.find(existing => existing.id === newTask.id)) {
                    this.tasks.push(newTask);
                    console.log('➕ Added global task:', newTask.title);
                }
            });

            this.showNotification(`Loaded ${convertedTasks.length} global tasks from GitHub`, 'success');
        } catch (error) {
            console.error('❌ Error loading global tasks:', error);
        }
    }

    async loadAnnouncements() {
        try {
            console.log('📢 Loading announcements from GitHub repository...');
            const response = await fetch('https://raw.githubusercontent.com/haoklaus11/Ktasks/main/example-announcements.json');
            if (!response.ok) throw new Error('Failed to load example-announcements.json');
            
            const data = await response.json();
            console.log('📢 Announcements data:', data);
            
            // Add announcements as goddess messages
            if (data.announcements && data.announcements.length > 0) {
                data.announcements.forEach(announcement => {
                    this.addGoddessMessage(announcement.message, 'announcement');
                });
                this.showNotification(`Loaded ${data.announcements.length} announcements from GitHub`, 'success');
            }
        } catch (error) {
            console.error('❌ Error loading announcements:', error);
        }
    }

    getNextRecurringTime(timeString) {
        if (!timeString) return null;
        
        const [hours, minutes] = timeString.split(':').map(Number);
        const today = new Date();
        const targetTime = new Date();
        targetTime.setHours(hours, minutes, 0, 0);
        
        // If the time has passed today, set for tomorrow
        if (targetTime <= today) {
            targetTime.setDate(targetTime.getDate() + 1);
        }
        
        return targetTime.toISOString();
    }

    getTodayAt(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const today = new Date();
        today.setHours(hours, minutes, 0, 0);
        return today.toISOString();
    }

    setupGitHubSync() {
        console.log('⚙️ Setting up GitHub sync...');
        
        // Auto-sync every 5 minutes
        setInterval(() => {
            this.loadGitHubData();
        }, 5 * 60 * 1000);
        
        console.log('✅ GitHub sync scheduled every 5 minutes');
    }

    async syncNow() {
        this.showNotification('Syncing with GitHub...', 'info');
        await this.loadGitHubData();
        await this.saveData();
        this.updateUI();
        this.showNotification('GitHub sync completed!', 'success');
    }

    // MISSING CRITICAL METHODS - Adding them now
    async acceptFirstTask() {
        try {
            console.log('🎯 acceptFirstTask() called');
            
            // First, try to sync with GitHub to get fresh tasks
            console.log('🔄 Checking GitHub for tasks...');
            await this.loadGitHubData();
            
            // Check if we now have tasks from GitHub
            console.log(`📋 Current tasks count after GitHub sync: ${this.tasks.length}`);
            if (this.tasks.length > 0) {
                console.log('📋 Tasks loaded from GitHub, showing them');
                this.showNotification(`${this.tasks.length} task(s) loaded from GitHub. Your assignments await!`, 'success');
                this.updateUI();
                return;
            }
            
            // If no GitHub tasks, create a default local task
            this.showNotification('No GitHub tasks found. Creating local starter task...', 'info');
            
            const firstTask = {
                id: 'local_task_' + Date.now(),
                title: '🎯 First Submission Task',
                description: 'Complete your initial act of submission by following this simple task. Prove your dedication to serve.',
                type: 'submission',
                priority: 'medium',
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                completed: false,
                createdAt: new Date().toISOString(),
                source: 'local',
                reward: '5 Obedience Points'
            };

            console.log('➕ Creating local first task:', firstTask);
            this.tasks.push(firstTask);
            console.log(`📋 Tasks array now has ${this.tasks.length} items`);
            
            await this.saveData();
            console.log('💾 Data saved to storage');
            
            this.updateUI();
            console.log('🔄 UI updated');
            
            this.showNotification('Your first task has been assigned. Begin your submission journey.', 'success');
            
            // Add goddess message
            this.addGoddessMessage('Your journey of submission begins now. Complete your first task to prove your worth.', 'general');
            this.updateGoddessMessagesDisplay();
            
        } catch (error) {
            console.error('❌ Error accepting first task:', error);
            this.showNotification('Task assignment failed. Please try again.', 'error');
        }
    }

    async performDailyCheckin() {
        const today = new Date().toDateString();
        const lastCheckin = localStorage.getItem('lastCheckin');
        
        if (lastCheckin === today) {
            this.showNotification('You have already reported for duty today, pet.', 'info');
            return;
        }

        try {
            // Mark today as checked in
            localStorage.setItem('lastCheckin', today);
            
            // Update streak
            this.userProfile.submissionStreak += 1;
            this.userProfile.lastLogin = new Date().toISOString();
            
            // Award daily check-in points
            this.addObediencePoints(2, 'Daily check-in');
            
            // Show proof submission area
            const proofSection = document.getElementById('proof-submission');
            if (proofSection) {
                proofSection.style.display = 'block';
            }
            
            // Update UI to reflect check-in
            this.updateDailyCheckin();
            
            // Random goddess messages for check-in
            const messages = [
                "Your daily compliance is noted. Don't let it go to your head.",
                "Bare minimum compliance achieved. Continue.",
                "Your submission streak grows. Impressive... barely."
            ];
            
            const message = messages[Math.floor(Math.random() * messages.length)];
            this.showNotification(message, 'success');
            this.addGoddessMessage(message, 'general');
            
            await this.saveData();
            
        } catch (error) {
            console.error('Error performing daily check-in:', error);
            this.showNotification('Check-in failed. Your goddess is displeased.', 'error');
        }
    }

    // Proof submission functionality
    handleProofFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Only image files are allowed for proof submission.', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image file too large. Maximum 5MB allowed.', 'error');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayProofPreview(e.target.result, 'image');
        };
        reader.readAsDataURL(file);
    }

    displayProofPreview(content, type) {
        const preview = document.getElementById('proof-preview');
        if (!preview) return;

        preview.classList.add('has-content');
        
        if (type === 'image') {
            preview.innerHTML = `<img src="${content}" alt="Proof preview">`;
        } else if (type === 'link') {
            preview.innerHTML = `<div class="link-preview">🔗 ${content}</div>`;
        }
    }

    async submitProof() {
        const proofLink = document.getElementById('proof-link');
        const proofFile = document.getElementById('proof-file');
        const preview = document.getElementById('proof-preview');

        let proofData = null;
        let proofType = 'none';

        // Check for link proof
        if (proofLink && proofLink.value.trim()) {
            proofData = proofLink.value.trim();
            proofType = 'link';
            this.displayProofPreview(proofData, 'link');
        }
        // Check for file proof
        else if (proofFile && proofFile.files.length > 0) {
            // For security, we'll store just metadata about the file, not the actual file
            proofData = {
                fileName: proofFile.files[0].name,
                fileSize: proofFile.files[0].size,
                fileType: proofFile.files[0].type,
                uploadTime: new Date().toISOString()
            };
            proofType = 'file';
        }

        if (!proofData) {
            this.showNotification('Please provide proof (photo or link) before submitting.', 'error');
            return;
        }

        try {
            // Create proof submission record
            const submission = {
                id: 'proof_' + Date.now(),
                type: proofType,
                data: proofData,
                submittedAt: new Date().toISOString(),
                taskId: 'daily_compliance', // Could link to specific tasks
                status: 'submitted',
                submitterId: this.subId || 'anonymous'
            };

            // Save to proof submissions
            if (!this.proofSubmissions) {
                this.proofSubmissions = [];
            }
            this.proofSubmissions.push(submission);

            // Award points for proof submission
            this.addObediencePoints(3, 'Proof submission');

            await this.saveData();

            // Clear the form
            if (proofLink) proofLink.value = '';
            if (proofFile) proofFile.value = '';
            if (preview) {
                preview.classList.remove('has-content');
                preview.innerHTML = 'Proof submitted successfully!';
            }

            this.showNotification('Proof submitted. Your compliance is noted.', 'success');
            this.addGoddessMessage('Your proof has been received. Continue serving.', 'praise');
            this.updateGoddessMessagesDisplay();

            // Hide proof submission area after successful submission
            setTimeout(() => {
                const proofSection = document.getElementById('proof-submission');
                if (proofSection) proofSection.style.display = 'none';
            }, 2000);

        } catch (error) {
            console.error('Error submitting proof:', error);
            this.showNotification('Proof submission failed. Try again, worm.', 'error');
        }
    }

    // Additional critical method - initializeSub
    async initializeSub() {
        if (!this.subId) {
            this.subId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            await this.saveData();
        }
        console.log('Sub initialized with ID:', this.subId);
    }
}

// Initialize the app when the popup loads
let taskTracker;
document.addEventListener('DOMContentLoaded', () => {
    taskTracker = new TaskTracker();
});

// Handle extension messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'dailyReminder') {
        taskTracker.showNotification('Your daily report is overdue, worm. Submit yourself.', 'info');
    }
});
