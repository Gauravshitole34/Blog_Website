/**
 * Markdown Blog Application
 * Features: Live preview, post management, theme switching, export/import
 */

class MarkdownBlog {
    constructor() {
        // Initialize application state
        this.currentPost = null;
        this.posts = [];
        this.currentTheme = 'primary';
        
        // DOM elements
        this.markdownEditor = document.getElementById('markdownEditor');
        this.markdownPreview = document.getElementById('markdownPreview');
        this.postTitle = document.getElementById('postTitle');
        this.postTags = document.getElementById('postTags');
        this.postsList = document.getElementById('postsList');
        this.searchPosts = document.getElementById('searchPosts');
        this.filterTags = document.getElementById('filterTags');
        this.noPostsMessage = document.getElementById('noPostsMessage');
        
        // Configure marked.js for better security and features
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: false,
            sanitize: false // We'll use DOMPurify instead
        });
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.loadPosts();
        this.loadSamplePosts();
        this.setupEventListeners();
        this.loadTheme();
        this.updateTagFilter();
        this.renderPostsList();
        
        // Initial preview update
        this.updatePreview();
        
        console.log('Markdown Blog initialized successfully');
    }
    
    /**
     * Load sample posts if no posts exist
     */
    loadSamplePosts() {
        const samplePosts = [
            {
                id: 1,
                title: "Getting Started with Markdown",
                contentMarkdown: `# Getting Started with Markdown

Markdown is a **lightweight markup language** that you can use to add formatting elements to plaintext text documents.

## Why Use Markdown?

- Simple and easy to learn
- Portable across platforms
- Future-proof format
- Great for technical writing

### Basic Syntax

Here are some basic examples:

\`\`\`javascript
function hello() {
    console.log('Hello, Markdown!');
}
\`\`\`

> Markdown is a great tool for writers and developers alike.

[Learn more about Markdown](https://www.markdownguide.org/)

![Placeholder Image](https://via.placeholder.com/400x200/C7F464/042A2A?text=Markdown+Guide)`,
                excerpt: "Learn the basics of Markdown syntax and why it's useful for writers and developers.",
                tags: ["markdown", "tutorial", "writing"],
                date: "2025-09-01T10:00:00Z",
                published: true
            },
            {
                id: 2,
                title: "Building Responsive Web Applications",
                contentMarkdown: `# Building Responsive Web Applications

Creating websites that work seamlessly across all devices is crucial in today's digital landscape.

## Key Principles

1. **Mobile-First Design**
   - Start with mobile layouts
   - Progressive enhancement for larger screens

2. **Flexible Grid Systems**
   - Use CSS Grid or Flexbox
   - Bootstrap framework benefits

3. **Responsive Images**
   - Use \`srcset\` attribute
   - Optimize for different screen densities

### CSS Media Queries

\`\`\`css
@media (min-width: 768px) {
    .container {
        max-width: 1200px;
    }
}
\`\`\`

**Pro tip:** Always test on real devices, not just browser dev tools!

![Responsive Design](https://via.placeholder.com/500x300/00B4D8/ffffff?text=Responsive+Design)`,
                excerpt: "Essential principles and techniques for creating responsive web applications that work on all devices.",
                tags: ["web-development", "responsive", "css"],
                date: "2025-08-30T14:30:00Z",
                published: true
            },
            {
                id: 3,
                title: "JavaScript ES6+ Features Every Developer Should Know",
                contentMarkdown: `# JavaScript ES6+ Features Every Developer Should Know

Modern JavaScript has evolved significantly. Here are the essential features you should master.

## Arrow Functions

\`\`\`javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;
\`\`\`

## Destructuring Assignment

\`\`\`javascript
const user = { name: 'John', age: 30 };
const { name, age } = user;

const colors = ['red', 'green', 'blue'];
const [primary, secondary] = colors;
\`\`\`

## Template Literals

\`\`\`javascript
const name = 'World';
const greeting = \`Hello, \${name}!\`;
\`\`\`

## Async/Await

\`\`\`javascript
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}
\`\`\`

### Modern Array Methods

- \`map()\` - Transform array elements
- \`filter()\` - Select elements based on condition
- \`reduce()\` - Accumulate array values
- \`find()\` - Find first matching element

> **Remember:** These features improve code readability and maintainability.

![JavaScript](https://via.placeholder.com/450x250/8B5CF6/ffffff?text=Modern+JavaScript)`,
                excerpt: "Explore essential ES6+ features that every JavaScript developer should master for modern web development.",
                tags: ["javascript", "es6", "programming", "tutorial"],
                date: "2025-08-28T09:15:00Z",
                published: false
            }
        ];
        
        // Only add sample posts if no posts exist
        if (this.posts.length === 0) {
            this.posts = samplePosts;
            this.savePosts();
            console.log('Sample posts loaded');
        }
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Markdown editor live preview
        this.markdownEditor.addEventListener('input', () => {
            this.updatePreview();
        });
        
        // Toolbar buttons - Fixed to handle clicks properly
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const button = e.currentTarget; // Use currentTarget instead of closest
                const markdown = button.getAttribute('data-markdown');
                if (markdown) {
                    this.insertMarkdown(markdown);
                }
            });
        });
        
        // Action buttons
        document.getElementById('saveDraft').addEventListener('click', () => this.savePost(false));
        document.getElementById('publishPost').addEventListener('click', () => this.savePost(true));
        document.getElementById('clearEditor').addEventListener('click', () => this.clearEditor());
        document.getElementById('exportMd').addEventListener('click', () => this.exportMarkdown());
        document.getElementById('importMd').addEventListener('change', (e) => this.importMarkdown(e));
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Posts toggle - Make sure this works
        const postsToggle = document.getElementById('postsToggle');
        if (postsToggle) {
            postsToggle.addEventListener('click', () => {
                console.log('Posts toggle clicked');
            });
        }
        
        // Search and filter
        this.searchPosts.addEventListener('input', () => this.renderPostsList());
        this.filterTags.addEventListener('change', () => this.renderPostsList());
        document.getElementById('clearSearch').addEventListener('click', () => {
            this.searchPosts.value = '';
            this.renderPostsList();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.savePost(false);
                        break;
                    case 'Enter':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.savePost(true);
                        }
                        break;
                }
            }
        });
        
        console.log('Event listeners setup complete');
    }
    
    /**
     * Update the markdown preview
     */
    updatePreview() {
        const markdown = this.markdownEditor.value;
        
        if (!markdown.trim()) {
            this.markdownPreview.innerHTML = `
                <div class="text-muted text-center py-5">
                    <i class="bi bi-eye-slash fs-1"></i>
                    <p class="mt-2">Start typing to see the preview...</p>
                </div>
            `;
            return;
        }
        
        try {
            // Parse markdown to HTML
            const html = marked.parse(markdown);
            
            // Sanitize HTML to prevent XSS attacks
            const cleanHtml = DOMPurify.sanitize(html);
            
            // Update preview
            this.markdownPreview.innerHTML = cleanHtml;
        } catch (error) {
            console.error('Error parsing markdown:', error);
            this.markdownPreview.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error parsing markdown. Please check your syntax.
                </div>
            `;
        }
    }
    
    /**
     * Insert markdown syntax at cursor position - Fixed implementation
     */
    insertMarkdown(syntax) {
        const textarea = this.markdownEditor;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let replacement = syntax;
        let cursorOffset = 0;
        
        // Handle different markdown types
        if (syntax.includes('**text**')) {
            if (selectedText) {
                replacement = `**${selectedText}**`;
                cursorOffset = replacement.length;
            } else {
                replacement = '**text**';
                cursorOffset = 2; // Position cursor between asterisks
            }
        } else if (syntax.includes('*text*')) {
            if (selectedText) {
                replacement = `*${selectedText}*`;
                cursorOffset = replacement.length;
            } else {
                replacement = '*text*';
                cursorOffset = 1; // Position cursor between asterisks
            }
        } else if (syntax.includes('`code`')) {
            if (selectedText) {
                replacement = `\`${selectedText}\``;
                cursorOffset = replacement.length;
            } else {
                replacement = '`code`';
                cursorOffset = 1; // Position cursor between backticks
            }
        } else if (syntax.includes('[text](url)')) {
            if (selectedText) {
                replacement = `[${selectedText}](url)`;
                // Position cursor at 'url' part
                cursorOffset = selectedText.length + 3;
            } else {
                replacement = '[text](url)';
                cursorOffset = 1; // Position cursor at 'text' part
            }
        } else if (syntax === '# ' || syntax === '## ') {
            // For headers, add at beginning of line
            const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = textarea.value.indexOf('\n', start);
            const currentLine = textarea.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
            
            // If line already has header syntax, don't add more
            if (!currentLine.match(/^#{1,6}\s/)) {
                replacement = syntax + (selectedText || currentLine.trim() || 'Heading');
                // Replace entire line
                const newValue = 
                    textarea.value.substring(0, lineStart) + 
                    replacement + 
                    textarea.value.substring(lineEnd === -1 ? textarea.value.length : lineEnd);
                
                textarea.value = newValue;
                const newCursorPos = lineStart + replacement.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
                this.updatePreview();
                return;
            }
        } else if (syntax === '- ') {
            // For lists, add at beginning of line or new line
            const beforeCursor = textarea.value.substring(0, start);
            const needsNewLine = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
            replacement = (needsNewLine ? '\n' : '') + '- ' + (selectedText || 'List item');
            cursorOffset = replacement.length;
        } else {
            replacement = syntax + selectedText;
            cursorOffset = replacement.length;
        }
        
        // Replace the selected text
        const newValue = 
            textarea.value.substring(0, start) + 
            replacement + 
            textarea.value.substring(end);
        
        textarea.value = newValue;
        
        // Set cursor position
        const newCursorPos = start + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        
        // Update preview and focus
        textarea.focus();
        this.updatePreview();
    }
    
    /**
     * Save post as draft or published
     */
    savePost(publish = false) {
        const title = this.postTitle.value.trim();
        const content = this.markdownEditor.value.trim();
        const tags = this.postTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (!title) {
            this.showAlert('Please enter a post title', 'warning');
            this.postTitle.focus();
            return;
        }
        
        if (!content) {
            this.showAlert('Please write some content', 'warning');
            this.markdownEditor.focus();
            return;
        }
        
        const post = {
            id: this.currentPost ? this.currentPost.id : Date.now(),
            title: title,
            contentMarkdown: content,
            excerpt: this.generateExcerpt(content),
            tags: tags,
            date: this.currentPost ? this.currentPost.date : new Date().toISOString(),
            lastModified: new Date().toISOString(),
            published: publish
        };
        
        if (this.currentPost) {
            // Update existing post
            const index = this.posts.findIndex(p => p.id === this.currentPost.id);
            this.posts[index] = post;
        } else {
            // Add new post
            this.posts.unshift(post);
        }
        
        this.currentPost = post;
        this.savePosts();
        this.updateTagFilter();
        this.renderPostsList();
        
        const action = publish ? 'published' : 'saved as draft';
        this.showAlert(`Post ${action} successfully!`, 'success');
        
        console.log(`Post ${action}:`, post.title);
    }
    
    /**
     * Generate excerpt from markdown content
     */
    generateExcerpt(content, maxLength = 150) {
        // Remove markdown syntax for excerpt
        let text = content
            .replace(/#{1,6}\s+/g, '')  // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
            .replace(/\*(.*?)\*/g, '$1')  // Remove italic
            .replace(/`(.*?)`/g, '$1')  // Remove inline code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove links
            .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
            .replace(/>/g, '')  // Remove blockquotes
            .replace(/[-*+]\s+/g, '')  // Remove list markers
            .replace(/\n+/g, ' ')  // Replace newlines with spaces
            .trim();
        
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    /**
     * Clear the editor
     */
    clearEditor() {
        if (this.markdownEditor.value.trim() || this.postTitle.value.trim()) {
            if (!confirm('Are you sure you want to clear the editor? Unsaved changes will be lost.')) {
                return;
            }
        }
        
        this.postTitle.value = '';
        this.postTags.value = '';
        this.markdownEditor.value = '';
        this.currentPost = null;
        this.updatePreview();
        this.markdownEditor.focus();
        
        this.showAlert('Editor cleared', 'info');
    }
    
    /**
     * Load a post into the editor
     */
    loadPost(post) {
        this.currentPost = post;
        this.postTitle.value = post.title;
        this.postTags.value = post.tags.join(', ');
        this.markdownEditor.value = post.contentMarkdown;
        this.updatePreview();
        
        // Scroll to top and focus editor
        window.scrollTo(0, 0);
        this.markdownEditor.focus();
        
        // Close offcanvas on mobile
        const offcanvasEl = document.getElementById('postsOffcanvas');
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (offcanvas) {
            offcanvas.hide();
        }
        
        console.log('Post loaded:', post.title);
    }
    
    /**
     * Delete a post
     */
    deletePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
            return;
        }
        
        this.posts = this.posts.filter(p => p.id !== postId);
        
        // Clear editor if current post is being deleted
        if (this.currentPost && this.currentPost.id === postId) {
            this.clearEditor();
        }
        
        this.savePosts();
        this.updateTagFilter();
        this.renderPostsList();
        
        this.showAlert('Post deleted successfully', 'success');
        console.log('Post deleted:', post.title);
    }
    
    /**
     * Export markdown file
     */
    exportMarkdown() {
        const title = this.postTitle.value.trim() || 'untitled';
        const content = this.markdownEditor.value;
        
        if (!content.trim()) {
            this.showAlert('No content to export', 'warning');
            return;
        }
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showAlert('Markdown exported successfully', 'success');
    }
    
    /**
     * Import markdown file
     */
    importMarkdown(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            
            if (this.markdownEditor.value.trim() || this.postTitle.value.trim()) {
                if (!confirm('This will replace current content. Continue?')) {
                    return;
                }
            }
            
            // Extract title from filename or first heading
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const firstHeading = content.match(/^#\s+(.+)$/m);
            const title = firstHeading ? firstHeading[1] : fileName;
            
            this.postTitle.value = title;
            this.markdownEditor.value = content;
            this.postTags.value = '';
            this.currentPost = null;
            this.updatePreview();
            
            this.showAlert('Markdown imported successfully', 'success');
        };
        
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
    
    /**
     * Toggle between themes
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'primary' ? 'secondary' : 'primary';
        
        if (this.currentTheme === 'secondary') {
            document.documentElement.setAttribute('data-theme', 'secondary');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        localStorage.setItem('blog-theme', this.currentTheme);
        this.showAlert(`Switched to ${this.currentTheme} theme`, 'info');
    }
    
    /**
     * Load saved theme
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('blog-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            if (savedTheme === 'secondary') {
                document.documentElement.setAttribute('data-theme', 'secondary');
            }
        }
    }
    
    /**
     * Update tag filter dropdown
     */
    updateTagFilter() {
        const allTags = new Set();
        this.posts.forEach(post => {
            post.tags.forEach(tag => allTags.add(tag));
        });
        
        const sortedTags = Array.from(allTags).sort();
        const currentValue = this.filterTags.value;
        
        this.filterTags.innerHTML = '<option value="">All tags</option>';
        sortedTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            this.filterTags.appendChild(option);
        });
        
        // Restore previous selection if it still exists
        if (sortedTags.includes(currentValue)) {
            this.filterTags.value = currentValue;
        }
    }
    
    /**
     * Render the posts list
     */
    renderPostsList() {
        const searchTerm = this.searchPosts.value.toLowerCase();
        const selectedTag = this.filterTags.value;
        
        let filteredPosts = this.posts.filter(post => {
            const matchesSearch = !searchTerm || 
                post.title.toLowerCase().includes(searchTerm) ||
                post.excerpt.toLowerCase().includes(searchTerm) ||
                post.contentMarkdown.toLowerCase().includes(searchTerm);
            
            const matchesTag = !selectedTag || post.tags.includes(selectedTag);
            
            return matchesSearch && matchesTag;
        });
        
        // Sort posts by date (newest first)
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredPosts.length === 0) {
            this.postsList.innerHTML = '';
            this.noPostsMessage.classList.remove('d-none');
            return;
        }
        
        this.noPostsMessage.classList.add('d-none');
        
        this.postsList.innerHTML = filteredPosts.map(post => {
            const isSelected = this.currentPost && this.currentPost.id === post.id;
            const date = new Date(post.date).toLocaleDateString();
            
            return `
                <div class="post-item ${isSelected ? 'selected' : ''}" data-post-id="${post.id}">
                    <div class="post-title">${this.escapeHtml(post.title)}</div>
                    <div class="post-excerpt">${this.escapeHtml(post.excerpt)}</div>
                    <div class="post-meta">
                        <div class="post-date">
                            <i class="bi bi-calendar3"></i>
                            <span>${date}</span>
                        </div>
                        <div class="post-status ${post.published ? 'status-published' : 'status-draft'}">
                            <i class="bi bi-${post.published ? 'check-circle' : 'clock'}"></i>
                            ${post.published ? 'Published' : 'Draft'}
                        </div>
                    </div>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag-badge">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-primary btn-sm load-post" data-post-id="${post.id}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-outline-danger btn-sm delete-post" data-post-id="${post.id}">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to post items
        this.postsList.querySelectorAll('.load-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = parseInt(e.target.closest('.load-post').dataset.postId);
                const post = this.posts.find(p => p.id === postId);
                if (post) this.loadPost(post);
            });
        });
        
        this.postsList.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = parseInt(e.target.closest('.delete-post').dataset.postId);
                this.deletePost(postId);
            });
        });
        
        // Make post items clickable
        this.postsList.querySelectorAll('.post-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.post-actions')) return;
                const postId = parseInt(item.dataset.postId);
                const post = this.posts.find(p => p.id === postId);
                if (post) this.loadPost(post);
            });
        });
    }
    
    /**
     * Save posts to localStorage
     */
    savePosts() {
        try {
            localStorage.setItem('blog-posts', JSON.stringify(this.posts));
        } catch (error) {
            console.error('Error saving posts:', error);
            this.showAlert('Error saving posts. Storage might be full.', 'danger');
        }
    }
    
    /**
     * Load posts from localStorage
     */
    loadPosts() {
        try {
            const savedPosts = localStorage.getItem('blog-posts');
            if (savedPosts) {
                this.posts = JSON.parse(savedPosts);
                console.log('Posts loaded from localStorage:', this.posts.length);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showAlert('Error loading saved posts', 'warning');
            this.posts = [];
        }
    }
    
    /**
     * Show alert message
     */
    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 1060; max-width: 300px;';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.markdownBlog = new MarkdownBlog();
});