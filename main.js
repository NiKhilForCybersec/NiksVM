/* ============================================
   Vulnerability Management Documentation
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initSearch();
    initCodeBlocks();
    initReadingProgress();
    initNavSections();
    initMobileMenu();
    initAnimations();
});

/* ============================================
   Sidebar Navigation
   ============================================ */

function initSidebar() {
    // Mark current page as active
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.endsWith(href)) {
            item.classList.add('active');
            // Expand parent section
            const section = item.closest('.nav-section');
            if (section) {
                section.classList.remove('collapsed');
            }
        }
    });
}

function initNavSections() {
    const sectionHeaders = document.querySelectorAll('.nav-section-header');
    
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.closest('.nav-section');
            section.classList.toggle('collapsed');
            
            // Store state in localStorage
            const sectionId = section.dataset.section;
            if (sectionId) {
                const collapsed = section.classList.contains('collapsed');
                localStorage.setItem(`nav-section-${sectionId}`, collapsed);
            }
        });
    });
    
    // Restore collapsed state from localStorage
    const sections = document.querySelectorAll('.nav-section[data-section]');
    sections.forEach(section => {
        const sectionId = section.dataset.section;
        const collapsed = localStorage.getItem(`nav-section-${sectionId}`);
        if (collapsed === 'true') {
            section.classList.add('collapsed');
        }
    });
}

/* ============================================
   Search Functionality
   ============================================ */

// Search index - will be populated with page data
const searchIndex = [
    { title: 'Introduction to Vulnerability Management', section: 'Section 1: Fundamentals', url: 'section1/1-1-introduction.html', keywords: 'vm vulnerability management lifecycle risk rbvm' },
    { title: 'VM Program Framework', section: 'Section 1: Fundamentals', url: 'section1/1-2-program-framework.html', keywords: 'program framework stakeholder policy sla raci maturity' },
    { title: 'Vulnerability Scoring Systems', section: 'Section 1: Fundamentals', url: 'section1/1-3-scoring-systems.html', keywords: 'cvss epss ssvc kev scoring risk' },
    { title: 'Compliance & Regulatory Requirements', section: 'Section 1: Fundamentals', url: 'section1/1-4-compliance.html', keywords: 'pci hipaa sox nist cis iso compliance regulatory' },
    { title: 'VM Program Metrics & KPIs', section: 'Section 1: Fundamentals', url: 'section1/1-5-metrics-kpis.html', keywords: 'metrics kpi mttr sla dashboard reporting' },
    { title: 'Scanner Types & Selection', section: 'Section 2: Scanning', url: 'section2/2-1-scanner-types.html', keywords: 'scanner network agent passive authenticated' },
    { title: 'Nessus Deep Dive', section: 'Section 2: Scanning', url: 'section2/2-2-nessus.html', keywords: 'nessus tenable scan plugin policy' },
    { title: 'Qualys Platform', section: 'Section 2: Scanning', url: 'section2/2-3-qualys.html', keywords: 'qualys vmdr cloud agent qql trurisk' },
    { title: 'Rapid7 InsightVM', section: 'Section 2: Scanning', url: 'section2/2-4-rapid7.html', keywords: 'rapid7 insightvm nexpose scan engine' },
    { title: 'Microsoft Defender VM', section: 'Section 2: Scanning', url: 'section2/2-5-defender.html', keywords: 'microsoft defender endpoint tvm mde' },
];

function initSearch() {
    const searchInput = document.querySelector('.sidebar-search input');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput || !searchResults) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }
        
        const results = searchIndex.filter(item => {
            return item.title.toLowerCase().includes(query) ||
                   item.keywords.toLowerCase().includes(query) ||
                   item.section.toLowerCase().includes(query);
        }).slice(0, 5);
        
        if (results.length > 0) {
            searchResults.innerHTML = results.map(item => `
                <a href="${item.url}" class="search-result-item">
                    <div class="search-result-title">${highlightMatch(item.title, query)}</div>
                    <div class="search-result-section">${item.section}</div>
                </a>
            `).join('');
            searchResults.classList.add('active');
        } else {
            searchResults.innerHTML = '<div class="search-result-item"><div class="search-result-title">No results found</div></div>';
            searchResults.classList.add('active');
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.sidebar-search')) {
            searchResults.classList.remove('active');
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            this.blur();
        }
    });
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<strong style="color: var(--accent-cyan);">$1</strong>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ============================================
   Code Block Copy Functionality
   ============================================ */

function initCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach(block => {
        const copyBtn = block.querySelector('.code-block-copy');
        const code = block.querySelector('code');
        
        if (!copyBtn || !code) return;
        
        copyBtn.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(code.textContent);
                
                // Visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = '<span>✓</span> Copied!';
                this.classList.add('copied');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                this.innerHTML = '<span>✗</span> Failed';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            }
        });
    });
    
    // Also handle plain pre blocks without wrapper
    const plainPreBlocks = document.querySelectorAll('pre:not(.code-block pre)');
    plainPreBlocks.forEach(pre => {
        // Wrap in code-block div
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block';
        
        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.innerHTML = `
            <span class="code-block-lang">Code</span>
            <button class="code-block-copy"><span>📋</span> Copy</button>
        `;
        
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
        
        // Add click handler
        const copyBtn = header.querySelector('.code-block-copy');
        const code = pre.querySelector('code') || pre;
        
        copyBtn.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(code.textContent);
                this.innerHTML = '<span>✓</span> Copied!';
                this.classList.add('copied');
                setTimeout(() => {
                    this.innerHTML = '<span>📋</span> Copy';
                    this.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

/* ============================================
   Reading Progress Bar
   ============================================ */

function initReadingProgress() {
    const progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) return;
    
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}

/* ============================================
   Mobile Menu
   ============================================ */

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (!toggle || !sidebar) return;
    
    toggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        this.innerHTML = sidebar.classList.contains('active') ? '✕' : '☰';
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
                sidebar.classList.remove('active');
                toggle.innerHTML = '☰';
            }
        }
    });
    
    // Close sidebar when navigating
    const navLinks = sidebar.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
                toggle.innerHTML = '☰';
            }
        });
    });
}

/* ============================================
   Animations
   ============================================ */

function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animatedElements = document.querySelectorAll('.feature-card, .card, .info-box');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

/* ============================================
   Syntax Highlighting (Basic)
   ============================================ */

function highlightSyntax(code, language) {
    const patterns = {
        powershell: [
            { regex: /#.*/g, class: 'token-comment' },
            { regex: /\b(function|param|if|else|elseif|foreach|for|while|switch|try|catch|finally|return|break|continue)\b/g, class: 'token-keyword' },
            { regex: /\$[\w]+/g, class: 'token-variable' },
            { regex: /"[^"]*"|'[^']*'/g, class: 'token-string' },
            { regex: /\b\d+\b/g, class: 'token-number' },
            { regex: /\b(Get-|Set-|New-|Remove-|Add-|Import-|Export-|Invoke-|Start-|Stop-|Write-|Read-)[\w-]+/g, class: 'token-function' },
        ],
        python: [
            { regex: /#.*/g, class: 'token-comment' },
            { regex: /\b(def|class|if|elif|else|for|while|try|except|finally|return|import|from|as|with|lambda|yield|raise|pass|break|continue|and|or|not|in|is|True|False|None)\b/g, class: 'token-keyword' },
            { regex: /"""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*'/g, class: 'token-string' },
            { regex: /\b\d+\.?\d*\b/g, class: 'token-number' },
            { regex: /\b[A-Za-z_]\w*(?=\s*\()/g, class: 'token-function' },
        ],
        bash: [
            { regex: /#.*/g, class: 'token-comment' },
            { regex: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|source|export|local|readonly)\b/g, class: 'token-keyword' },
            { regex: /\$[\w{}]+|\$\([^)]+\)/g, class: 'token-variable' },
            { regex: /"[^"]*"|'[^']*'/g, class: 'token-string' },
            { regex: /\b\d+\b/g, class: 'token-number' },
        ],
        sql: [
            { regex: /--.*|\/\*[\s\S]*?\*\//g, class: 'token-comment' },
            { regex: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|AS|DISTINCT|COUNT|SUM|AVG|MIN|MAX)\b/gi, class: 'token-keyword' },
            { regex: /'[^']*'/g, class: 'token-string' },
            { regex: /\b\d+\b/g, class: 'token-number' },
        ],
        json: [
            { regex: /"[^"]*"\s*:/g, class: 'token-property' },
            { regex: /"[^"]*"/g, class: 'token-string' },
            { regex: /\b(true|false|null)\b/g, class: 'token-keyword' },
            { regex: /\b\d+\.?\d*\b/g, class: 'token-number' },
        ]
    };
    
    const lang = patterns[language.toLowerCase()];
    if (!lang) return escapeHtml(code);
    
    let result = escapeHtml(code);
    lang.forEach(pattern => {
        result = result.replace(pattern.regex, match => `<span class="${pattern.class}">${match}</span>`);
    });
    
    return result;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ============================================
   Table of Contents Generator
   ============================================ */

function generateTOC() {
    const content = document.querySelector('.content-wrapper');
    const headings = content.querySelectorAll('h2, h3');
    
    if (headings.length < 3) return;
    
    const toc = document.createElement('nav');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h4>On this page</h4>';
    
    const list = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        // Add ID if not present
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        const li = document.createElement('li');
        li.className = heading.tagName.toLowerCase() === 'h3' ? 'toc-h3' : 'toc-h2';
        
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        
        li.appendChild(link);
        list.appendChild(li);
    });
    
    toc.appendChild(list);
    
    // Insert TOC after page header
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        pageHeader.after(toc);
    }
}

/* ============================================
   Utility Functions
   ============================================ */

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Smooth scroll to anchor
function scrollToAnchor(hash) {
    const target = document.querySelector(hash);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Handle anchor links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        scrollToAnchor(link.getAttribute('href'));
        history.pushState(null, null, link.getAttribute('href'));
    }
});

// Initialize TOC on page load (if needed)
// Uncomment the line below to auto-generate TOC
// document.addEventListener('DOMContentLoaded', generateTOC);
