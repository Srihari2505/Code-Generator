// Application State Management
class AppState {
    constructor() {
        this.currentUser = null;
        this.users = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
                socials: 'linkedin.com/in/admin',
                contacts: '+1-555-0123',
                profilePhoto: null
            },
            {
                id: 2,
                name: 'Demo User',
                email: 'user@example.com',
                password: 'user123',
                role: 'user',
                socials: 'github.com/demouser',
                contacts: '+1-555-0456',
                profilePhoto: null
            }
        ];
        this.feedback = [];
        this.codeGenerations = 0;
        this.sessionStartTime = new Date();
        this.totalUsageTime = 0;
        this.init();
    }

    init() {
        // Load state from localStorage simulation (using memory instead)
        const savedState = this.getStoredState();
        if (savedState) {
            this.users = savedState.users || this.users;
            this.feedback = savedState.feedback || [];
            this.codeGenerations = savedState.codeGenerations || 0;
        }
    }

    getStoredState() {
        // Simulate localStorage - in a real app this would use localStorage
        return window.appData || null;
    }

    saveState() {
        // Simulate localStorage
        window.appData = {
            users: this.users,
            feedback: this.feedback,
            codeGenerations: this.codeGenerations
        };
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = { ...user };
            delete this.currentUser.password;
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    updateProfile(profileData) {
        if (!this.currentUser) return false;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...profileData };
            this.currentUser = { ...this.users[userIndex] };
            delete this.currentUser.password;
            this.saveState();
            return true;
        }
        return false;
    }

    addFeedback(feedback) {
        this.feedback.push({
            id: Date.now(),
            feedback,
            user: this.currentUser ? this.currentUser.email : 'Anonymous',
            timestamp: new Date().toISOString()
        });
        this.saveState();
    }

    incrementCodeGenerations() {
        this.codeGenerations++;
        this.saveState();
    }
}

// Code Generation Engine with Gemini API
class CodeGenerator {
    constructor() {
        this.apiKey = 'AIzaSyAaOT7gMD2pZ8PgocER2HxmU7fzZRwmLA0';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.supportedLanguages = ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'TypeScript', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Rust'];
    }

    async generate(prompt, language) {
        try {
            // Validate language support
            if (!this.supportedLanguages.includes(language)) {
                throw new Error(`Language ${language} is not supported. Supported languages: ${this.supportedLanguages.join(', ')}`);
            }

            // Validate prompt length
            if (prompt.length > 1000) {
                throw new Error('Prompt is too long. Please keep it under 1000 characters.');
            }

            // Create the prompt for Gemini
            const systemPrompt = `You are an expert ${language} programmer. Generate clean, well-commented, and production-ready code based on the user's request. 

Requirements:
- Write only the code, no explanations or markdown formatting
- Include proper comments for complex logic
- Follow ${language} best practices and conventions
- Make the code functional and complete
- Use appropriate libraries and imports
- Handle edge cases when relevant
- Ensure the code is syntactically correct and can run

User Request: ${prompt}

Generate ${language} code:`;

            const requestBody = {
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            };

            // Add timeout to the fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                
                if (errorData.error?.message) {
                    errorMessage += `. ${errorData.error.message}`;
                }
                
                // Handle specific error cases
                if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
                } else if (response.status === 403) {
                    errorMessage = 'API access denied. Please check your API key.';
                } else if (response.status === 400) {
                    errorMessage = 'Invalid request. Please check your prompt and try again.';
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format from Gemini API');
            }

            const generatedCode = data.candidates[0].content.parts[0].text;
            
            // Clean up the response (remove any markdown formatting if present)
            const cleanCode = this.cleanGeneratedCode(generatedCode);
            
            // Validate that we got actual code
            if (!cleanCode || cleanCode.trim().length < 10) {
                throw new Error('Generated code is too short or empty');
            }
            
            return cleanCode;

        } catch (error) {
            console.error('Gemini API Error:', error);
            
            // Handle specific error types
            if (error.name === 'AbortError') {
                return this.generateFallbackCode(language, prompt, 'Request timeout - API took too long to respond');
            }
            
            // Fallback to a basic response if API fails
            return this.generateFallbackCode(language, prompt, error.message);
        }
    }

    cleanGeneratedCode(code) {
        // Remove markdown code blocks if present
        let cleanCode = code.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
        
        // Remove any leading/trailing whitespace
        cleanCode = cleanCode.trim();
        
        // Ensure the code doesn't start with explanatory text
        const lines = cleanCode.split('\n');
        let codeStartIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Look for lines that look like code (contain programming keywords or syntax)
            if (line.match(/^(import|from|def|class|function|const|let|var|public|private|#include|package|using)/) ||
                line.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*[=\(]/) ||
                line.match(/^[{}]/) ||
                line.match(/^\s*\/\//) ||
                line.match(/^\s*#/)) {
                codeStartIndex = i;
                break;
            }
        }
        
        return lines.slice(codeStartIndex).join('\n').trim();
    }

    generateFallbackCode(language, prompt, errorMessage) {
        const fallbackTemplates = {
            Python: `# Generated code for: ${prompt}\n# Note: AI generation temporarily unavailable\n# Error: ${errorMessage}\n\ndef main():\n    print("Hello, World!")\n    # TODO: Implement your logic here\n\nif __name__ == "__main__":\n    main()`,
            JavaScript: `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\nfunction main() {\n    console.log("Hello, World!");\n    // TODO: Implement your logic here\n}\n\nmain();`,
            Java: `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\npublic class GeneratedCode {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        // TODO: Implement your logic here\n    }\n}`,
            'C++': `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    // TODO: Implement your logic here\n    return 0;\n}`,
            Go: `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n    // TODO: Implement your logic here\n}`,
            TypeScript: `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\nfunction main(): void {\n    console.log("Hello, World!");\n    // TODO: Implement your logic here\n}\n\nmain();`,
            'C#': `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\nusing System;\n\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("Hello, World!");\n        // TODO: Implement your logic here\n    }\n}`,
            PHP: `<?php\n// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\necho "Hello, World!";\n// TODO: Implement your logic here\n?>`,
            Ruby: `# Generated code for: ${prompt}\n# Note: AI generation temporarily unavailable\n# Error: ${errorMessage}\n\nputs "Hello, World!"\n# TODO: Implement your logic here`,
            Swift: `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\nimport Foundation\n\nprint("Hello, World!")\n// TODO: Implement your logic here`,
            Kotlin: `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\nfun main() {\n    println("Hello, World!")\n    // TODO: Implement your logic here\n}`,
            Rust: `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\nfn main() {\n    println!("Hello, World!");\n    // TODO: Implement your logic here\n}`
        };

        return fallbackTemplates[language] || `// Generated code for: ${prompt}\n// Note: AI generation temporarily unavailable\n// Error: ${errorMessage}\n\n// TODO: Implement your logic here`;
    }
}

// Main Application Class
class IntelligentCodeAssistant {
    constructor() {
        this.state = new AppState();
        this.codeGenerator = new CodeGenerator();
        this.currentPage = 'main';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAuthUI();
        
        // Check if user is logged in, if not show login modal
        if (!this.state.isLoggedIn()) {
            this.showLoginModal();
        } else {
            this.showPage('main');
        }
        
        // Additional event listener setup for buttons that might be added dynamically
        this.setupDynamicEventListeners();
    }

    setupEventListeners() {
        // Navigation event listeners
        document.addEventListener('click', (e) => {
            // Handle navigation links
            if (e.target.matches('[data-page]')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
                return;
            }
        });

        // Auth button
        document.getElementById('auth-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.state.isLoggedIn()) {
                this.logout();
            } else {
                this.showLoginModal();
            }
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideLoginModal();
        });

        // Code generator
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Generate button clicked');
                this.generateCode();
            });
        } else {
            console.error('Generate button not found');
        }

        // Copy code button
        document.getElementById('copy-btn').addEventListener('click', () => {
            this.copyCode();
        });

        // Profile management
        document.getElementById('save-profile').addEventListener('click', () => {
            this.saveProfile();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Profile photo preview
        document.getElementById('profile_photo').addEventListener('change', (e) => {
            this.handleProfilePhotoChange(e);
        });

        // Feedback submission
        const feedbackBtn = document.getElementById('submit-feedback');
        if (feedbackBtn) {
            feedbackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Submit feedback button clicked');
                this.submitFeedback();
            });
        } else {
            console.error('Submit feedback button not found');
        }

        // Modal backdrop click
        document.getElementById('login-modal').addEventListener('click', (e) => {
            if (e.target.id === 'login-modal') {
                this.hideLoginModal();
            }
        });
    }

    setupDynamicEventListeners() {
        // Use event delegation for buttons that might be dynamically added
        document.addEventListener('click', (e) => {
            console.log('Click detected on:', e.target);
            
            // Handle generate button
            if (e.target.id === 'generate-btn' || e.target.closest('#generate-btn')) {
                e.preventDefault();
                console.log('Generate button clicked (delegated)');
                alert('Generate button clicked!'); // Test alert
                this.generateCode();
                return;
            }
            
            // Handle submit feedback button
            if (e.target.id === 'submit-feedback' || e.target.closest('#submit-feedback')) {
                e.preventDefault();
                console.log('Submit feedback button clicked (delegated)');
                alert('Submit feedback button clicked!'); // Test alert
                this.submitFeedback();
                return;
            }
            
            // Handle copy button
            if (e.target.id === 'copy-btn' || e.target.closest('#copy-btn')) {
                e.preventDefault();
                console.log('Copy button clicked (delegated)');
                this.copyCode();
                return;
            }
        });
    }

    navigateTo(page) {
        // Check if user is logged in for any page access
        if (!this.state.isLoggedIn()) {
            this.showLoginModal();
            return;
        }

        // Check admin page access
        if (page === 'admin' && !this.state.isAdmin()) {
            this.showNotification('Access denied. Admin privileges required.', 'error');
            return;
        }

        this.showPage(page);
        this.updateNavigation(page);
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show current page
        const currentPage = document.getElementById(`${pageId}-page`);
        if (currentPage) {
            currentPage.classList.add('active');
            this.currentPage = pageId;

            // Load page-specific data
            switch(pageId) {
                case 'main':
                    this.updateDashboard();
                    break;
                case 'profile':
                    this.loadProfile();
                    break;
                case 'admin':
                    this.loadAdminData();
                    break;
                case 'feedback':
                    this.resetFeedbackForm();
                    break;
            }
        }
    }

    updateNavigation(activePage) {
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Activate current nav link
        const currentLink = document.querySelector(`[data-page="${activePage}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('login-email').focus();
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }

    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (this.state.login(email, password)) {
            this.hideLoginModal();
            this.updateAuthUI();
            this.showNotification('Login successful! Welcome back!', 'success');
            // Navigate to main page after login
            this.showPage('main');
            this.updateNavigation('main');
        } else {
            this.showNotification('Invalid credentials. Try admin@example.com/admin123 or user@example.com/user123', 'error');
        }
    }

    logout() {
        this.state.logout();
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'success');
        this.showLoginModal();
    }

    updateAuthUI() {
        const authBtn = document.getElementById('auth-btn');
        if (this.state.isLoggedIn()) {
            authBtn.textContent = '🚪 Logout';
            authBtn.title = `Logged in as ${this.state.currentUser.email}`;
        } else {
            authBtn.textContent = '🔐 Login';
            authBtn.title = 'Click to login';
        }
    }

    async generateCode() {
        console.log('generateCode method called');
        const prompt = document.getElementById('prompt_input').value.trim();
        const platform = document.getElementById('platform_dropdown').value;
        
        console.log('Prompt:', prompt);
        console.log('Platform:', platform);

        if (!prompt) {
            this.showNotification('Please enter a prompt', 'error');
            return;
        }

        if (!platform) {
            this.showNotification('Please select a programming language', 'error');
            return;
        }

        const responseBox = document.getElementById('response_box');
        const loading = document.getElementById('loading');
        const codeOutput = document.getElementById('code-output');
        const generateBtn = document.getElementById('generate-btn');

        responseBox.classList.remove('hidden');
        loading.classList.remove('hidden');
        codeOutput.style.display = 'none';
        generateBtn.disabled = true;
        generateBtn.textContent = '⏳ Generating...';

        try {
            const code = await this.codeGenerator.generate(prompt, platform);
            codeOutput.querySelector('code').textContent = code;
            loading.classList.add('hidden');
            codeOutput.style.display = 'block';
            this.state.incrementCodeGenerations();
            
            // Check if the code contains fallback indicators
            if (code.includes('AI generation temporarily unavailable')) {
                this.showNotification('Code generated with fallback (API temporarily unavailable)', 'warning');
            } else {
                this.showNotification('Code generated successfully using Gemini AI!', 'success');
            }
        } catch (error) {
            loading.classList.add('hidden');
            console.error('Code generation error:', error);
            
            // Show more specific error messages
            let errorMessage = 'Error generating code';
            if (error.message.includes('API request failed')) {
                errorMessage = 'API request failed. Please check your internet connection and try again.';
            } else if (error.message.includes('rate limit')) {
                errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
            } else if (error.message.includes('quota')) {
                errorMessage = 'API quota exceeded. Please try again later.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = '🚀 Generate Code';
        }
    }

    copyCode() {
        const codeOutput = document.getElementById('code-output');
        const code = codeOutput.querySelector('code').textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Code copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy code', 'error');
        });
    }

    loadProfile() {
        if (!this.state.currentUser) return;

        const user = this.state.currentUser;
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('socials').value = user.socials || '';
        document.getElementById('contacts').value = user.contacts || '';

        // Load profile photo
        const photoPreview = document.getElementById('photo-preview');
        if (user.profilePhoto) {
            photoPreview.innerHTML = `<img src="${user.profilePhoto}" alt="Profile Photo">`;
        } else {
            photoPreview.innerHTML = '<span class="photo-placeholder">📷</span>';
        }

        // Show welcome message
        this.showNotification(`Welcome back, ${user.name}!`, 'success');
    }

    handleProfilePhotoChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const photoPreview = document.getElementById('photo-preview');
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfile() {
        const profileData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            socials: document.getElementById('socials').value.trim(),
            contacts: document.getElementById('contacts').value.trim()
        };

        // Get profile photo
        const photoImg = document.querySelector('#photo-preview img');
        if (photoImg) {
            profileData.profilePhoto = photoImg.src;
        }

        if (!profileData.name || !profileData.email) {
            this.showNotification('Name and email are required', 'error');
            return;
        }

        if (this.state.updateProfile(profileData)) {
            this.showNotification('Profile updated successfully!', 'success');
        } else {
            this.showNotification('Failed to update profile', 'error');
        }
    }

    resetFeedbackForm() {
        document.getElementById('feedback_input').value = '';
        document.getElementById('feedback-success').classList.add('hidden');
    }

    submitFeedback() {
        console.log('submitFeedback method called');
        const feedback = document.getElementById('feedback_input').value.trim();
        console.log('Feedback:', feedback);
        
        if (!feedback) {
            this.showNotification('Please enter your feedback', 'error');
            return;
        }

        this.state.addFeedback(feedback);
        document.getElementById('feedback_input').value = '';
        document.getElementById('feedback-success').classList.remove('hidden');
        this.showNotification('Thank you for your feedback!', 'success');
    }

    loadAdminData() {
        // Update statistics
        document.getElementById('total-users').textContent = this.state.users.length;
        document.getElementById('code-generations').textContent = this.state.codeGenerations;
        document.getElementById('feedback-count').textContent = this.state.feedback.length;

        // Load users table
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';

        this.state.users.forEach(user => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="status status--${user.role === 'admin' ? 'warning' : 'info'}">${user.role}</span></td>
                <td>
                    <button class="btn btn--sm btn--outline" onclick="app.viewUser(${user.id})">View</button>
                </td>
            `;
        });
    }

    viewUser(userId) {
        const user = this.state.users.find(u => u.id === userId);
        if (user) {
            alert(`User Details:\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nSocials: ${user.socials || 'N/A'}\nContacts: ${user.contacts || 'N/A'}`);
        }
    }

    updateDashboard() {
        // Update code generation count
        const codeCountElement = document.getElementById('user-code-count');
        if (codeCountElement) {
            codeCountElement.textContent = this.state.codeGenerations;
        }

        // Update session time
        const sessionTimeElement = document.getElementById('session-time');
        if (sessionTimeElement) {
            const now = new Date();
            const sessionTime = Math.floor((now - this.state.sessionStartTime) / 1000 / 60);
            sessionTimeElement.textContent = `${sessionTime}m`;
        }

        // Update languages used (simplified - in a real app, track this properly)
        const languagesUsedElement = document.getElementById('languages-used');
        if (languagesUsedElement) {
            // For demo purposes, show a random number between 1-5
            const languagesUsed = Math.min(5, Math.max(1, Math.floor(this.state.codeGenerations / 2)));
            languagesUsedElement.textContent = languagesUsed;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 4 seconds with fade out animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new IntelligentCodeAssistant();
});