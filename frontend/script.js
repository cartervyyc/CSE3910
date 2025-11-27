// Handles sending/receiving messages from backend

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// ===== LOCAL MODEL INTEGRATION =====
// C++ Backend connection configuration
const cppBackendConfig = {
    // Update these to match your C++ server details
    host: 'localhost',
    port: 5000, // Change to your C++ server port
    useWebSocket: false, // Set to true if using WebSocket, false for HTTP
};

// Model configuration - update with your model paths when ready
const modelConfig = {
    Dill: {
        name: 'Dill',
        description: 'Conversational',
        modelPath: null, // Not used when connecting to C++ backend
        loaded: false,
        instance: null
    },
    Cucumber: {
        name: 'Cucumber',
        description: 'Math-focused',
        modelPath: null, // Not used when connecting to C++ backend
        loaded: false,
        instance: null
    },
    Gourmet: {
        name: 'Gourmet',
        description: 'Premium',
        modelPath: null, // Not used when connecting to C++ backend
        loaded: false,
        instance: null
    }
};

// Model selection (persisted)
let currentModel = localStorage.getItem('pickleModel') || 'Dill';

// Scrollbar selection (persisted) - declare early so overlay init can read it
let currentScrollbar = localStorage.getItem('pickleScrollbar') || 'auto';

// UI elements for model selection (will be available after DOM load)
const changeModelBtn = document.getElementById('changeModelBtn');
const modelDropdown = document.getElementById('modelDropdown');
const currentModelEl = document.getElementById('currentModel');
const changeScrollbarBtn = document.getElementById('changeScrollbarBtn');
const scrollbarDropdown = document.getElementById('scrollbarDropdown');
const currentScrollbarEl = document.getElementById('currentScrollbar');
const overlayScrollbar = document.getElementById('overlayScrollbar');
const overlayThumb = document.getElementById('overlayThumb');

let overlayDragging = false;
let dragStartY = 0;
let startScrollTop = 0;

function updateOverlayThumb() {
    if (!chatBox || !overlayScrollbar || !overlayThumb) return;
    const visibleHeight = chatBox.clientHeight;
    const contentHeight = chatBox.scrollHeight;
    if (contentHeight <= visibleHeight) {
        overlayThumb.style.display = 'none';
        return;
    } else {
        overlayThumb.style.display = 'block';
    }

    const trackHeight = overlayScrollbar.clientHeight;
    const thumbHeight = Math.max((visibleHeight / contentHeight) * trackHeight, 24);
    overlayThumb.style.height = thumbHeight + 'px';

    const maxThumbTop = trackHeight - thumbHeight;
    const scrollRatio = chatBox.scrollTop / (contentHeight - visibleHeight);
    const thumbTop = Math.max(0, Math.min(maxThumbTop, scrollRatio * maxThumbTop));
    overlayThumb.style.transform = `translateY(${thumbTop}px)`;
}

// Position the overlay (overlayScrollbar) to match chatBox on the viewport so it won't be clipped
function positionOverlay() {
    if (!chatBox || !overlayScrollbar) return;
    const rect = chatBox.getBoundingClientRect();
    // Use fixed positioning relative to viewport
    overlayScrollbar.style.position = 'fixed';
    // place it a few pixels inset from the right edge of the chat box
    const offsetRight = 2; // moved more to the right (left in visual space)
    const left = Math.round(rect.right - overlayScrollbar.offsetWidth - offsetRight);
    overlayScrollbar.style.left = left + 'px';
    overlayScrollbar.style.top = Math.round(rect.top) + 'px';
    overlayScrollbar.style.height = Math.round(rect.height) + 'px';
}

// Update overlay position on resize/scroll/content changes
window.addEventListener('resize', positionOverlay);
window.addEventListener('scroll', positionOverlay, true); // capture scrolling in ancestors

// call positionOverlay after content changes
const overlayPositionObserver = new MutationObserver(() => {
    positionOverlay();
    updateOverlayThumb();
});
if (chatBox) overlayPositionObserver.observe(chatBox, { childList: true, subtree: true });

// ensure position initially and after DOM ready
window.addEventListener('load', () => { positionOverlay(); updateOverlayThumb(); });

function applyOverlayMode() {
    if (!overlayScrollbar || !chatBox) return;
    overlayScrollbar.classList.remove('thin', 'hidden-by-mode');

    if (currentScrollbar === 'always') {
        overlayScrollbar.classList.remove('hidden-by-mode');
    } else if (currentScrollbar === 'thin') {
        overlayScrollbar.classList.add('thin');
        overlayScrollbar.classList.remove('hidden-by-mode');
    } else { // auto
        overlayScrollbar.classList.add('hidden-by-mode');
    }
    updateOverlayThumb();
}

// init overlay mode
applyOverlayMode();

// update overlay when chat scrolls or window resizes
if (chatBox) {
    chatBox.addEventListener('scroll', updateOverlayThumb);
    window.addEventListener('resize', updateOverlayThumb);
    
    // Show overlay scrollbar on hover in auto mode
    chatBox.addEventListener('mouseenter', () => {
        if (overlayScrollbar && currentScrollbar === 'auto') {
            overlayScrollbar.classList.add('visible-on-hover');
        }
    });
    
    chatBox.addEventListener('mouseleave', () => {
        if (overlayScrollbar && currentScrollbar === 'auto') {
            overlayScrollbar.classList.remove('visible-on-hover');
        }
    });
}

// track thumb dragging
if (overlayThumb) {
    overlayThumb.addEventListener('mousedown', (e) => {
        overlayDragging = true;
        dragStartY = e.clientY;
        startScrollTop = chatBox.scrollTop;
        document.body.classList.add('no-select');
        e.preventDefault();
    });
}

document.addEventListener('mousemove', (e) => {
    if (!overlayDragging) return;
    const deltaY = e.clientY - dragStartY;
    const visibleHeight = chatBox.clientHeight;
    const contentHeight = chatBox.scrollHeight;
    const trackHeight = overlayScrollbar.clientHeight;
    const thumbHeight = overlayThumb.clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    const scrollable = contentHeight - visibleHeight;
    if (maxThumbTop <= 0 || scrollable <= 0) return;
    const pixelsPerScroll = scrollable / maxThumbTop;
    const newThumbTop = Math.max(0, Math.min(maxThumbTop, (startScrollTop / pixelsPerScroll) + deltaY));
    chatBox.scrollTop = Math.round(newThumbTop * pixelsPerScroll);
});

document.addEventListener('mouseup', () => {
    if (overlayDragging) {
        overlayDragging = false;
        document.body.classList.remove('no-select');
    }
});

// click on track to jump
if (overlayScrollbar) {
    overlayScrollbar.addEventListener('click', (e) => {
        if (e.target === overlayThumb) return; // ignore clicks on thumb itself
        const rect = overlayScrollbar.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const trackHeight = overlayScrollbar.clientHeight;
        const visibleHeight = chatBox.clientHeight;
        const contentHeight = chatBox.scrollHeight;
        const thumbHeight = overlayThumb.clientHeight;
        const maxThumbTop = trackHeight - thumbHeight;
        const ratio = Math.max(0, Math.min(1, (clickY - thumbHeight / 2) / maxThumbTop));
        const scrollable = contentHeight - visibleHeight;
        chatBox.scrollTop = Math.round(ratio * scrollable);
    });
}

function applyScrollbarClass() {
    if (!chatBox) return;
    chatBox.classList.remove('scrollbar-auto', 'scrollbar-always', 'scrollbar-thin');
    chatBox.classList.add('scrollbar-' + currentScrollbar);
    if (currentScrollbarEl) currentScrollbarEl.textContent = currentScrollbar.charAt(0).toUpperCase() + currentScrollbar.slice(1);
}

// Apply initial scrollbar mode
applyScrollbarClass();

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key press
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') return;

    // Disable input and button while AI is thinking
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Display user message
    displayUserMessage(message);
    userInput.value = '';
    
    // Get response from C++ backend
    try {
        const response = await getCppBackendResponse(currentModel, message);
        displayBotMessage(response);
    } catch (error) {
        console.error('Error:', error);
        displayBotMessage('Sorry, I encountered an error. Please try again.');
    } finally {
        // Re-enable input and button after AI response
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Get response from the C++ backend
async function getCppBackendResponse(modelName, userMessage) {
    const url = `http://${cppBackendConfig.host}:${cppBackendConfig.port}/api/chat`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                model: modelName
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply || data.response || 'Sorry, I could not process your message.';
    } catch (error) {
        console.error('C++ Backend error:', error);
        throw error;
    }
}

function displayUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <span class="user-label">You:</span>
        <p>${escapeHtml(message)}</p>
    `;
    chatBox.appendChild(messageDiv);
    scrollToBottom();
}

function displayBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <span class="bot-label">Pickle:</span>
        <p>${escapeHtml(message)}</p>
    `;
    chatBox.appendChild(messageDiv);
    scrollToBottom();
}

// --- Model dropdown logic ---
// Initialize display
if (currentModelEl) currentModelEl.textContent = currentModel;

function positionModelDropdown() {
    if (!modelDropdown || !changeModelBtn) return;
    const rect = changeModelBtn.getBoundingClientRect();
    modelDropdown.style.position = 'fixed';
    modelDropdown.style.top = (rect.bottom + 8) + 'px';
    modelDropdown.style.right = (window.innerWidth - rect.right) + 'px';
}

function toggleModelDropdown(open) {
    if (!modelDropdown) return;
    const isOpen = !modelDropdown.classList.contains('hidden');
    const shouldOpen = (typeof open === 'boolean') ? open : !isOpen;
    if (shouldOpen) {
        modelDropdown.classList.remove('hidden');
        changeModelBtn.setAttribute('aria-expanded', 'true');
        positionModelDropdown();
    } else {
        modelDropdown.classList.add('hidden');
        changeModelBtn.setAttribute('aria-expanded', 'false');
    }
}

if (changeModelBtn) {
    changeModelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModelDropdown();
    });
}

// click outside to close
document.addEventListener('click', (e) => {
    if (!modelDropdown) return;
    if (!modelDropdown.classList.contains('hidden')) {
        // if click is outside the dropdown and the button
        if (!modelDropdown.contains(e.target) && e.target !== changeModelBtn) {
            toggleModelDropdown(false);
        }
    }
});

// keyboard support: close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        toggleModelDropdown(false);
        toggleScrollbarDropdown(false);
    }
});

// reposition dropdown on window resize
window.addEventListener('resize', () => {
    if (!modelDropdown || modelDropdown.classList.contains('hidden')) return;
    positionModelDropdown();
});

// Scrollbar dropdown positioning
function positionScrollbarDropdown() {
    if (!scrollbarDropdown || !changeScrollbarBtn) return;
    const rect = changeScrollbarBtn.getBoundingClientRect();
    scrollbarDropdown.style.position = 'fixed';
    scrollbarDropdown.style.top = (rect.bottom + 8) + 'px';
    scrollbarDropdown.style.right = (window.innerWidth - rect.right) + 'px';
}

function toggleScrollbarDropdown(open) {
    if (!scrollbarDropdown) return;
    const isOpen = !scrollbarDropdown.classList.contains('hidden');
    const shouldOpen = (typeof open === 'boolean') ? open : !isOpen;
    if (shouldOpen) {
        scrollbarDropdown.classList.remove('hidden');
        changeScrollbarBtn.setAttribute('aria-expanded', 'true');
        positionScrollbarDropdown();
    } else {
        scrollbarDropdown.classList.add('hidden');
        changeScrollbarBtn.setAttribute('aria-expanded', 'false');
    }
}

if (changeScrollbarBtn) {
    changeScrollbarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleScrollbarDropdown();
    });
}

// click outside to close scrollbar dropdown
document.addEventListener('click', (e) => {
    if (!scrollbarDropdown) return;
    if (!scrollbarDropdown.classList.contains('hidden')) {
        if (!scrollbarDropdown.contains(e.target) && e.target !== changeScrollbarBtn) {
            toggleScrollbarDropdown(false);
        }
    }
});

// reposition scrollbar dropdown on window resize
window.addEventListener('resize', () => {
    if (!scrollbarDropdown || scrollbarDropdown.classList.contains('hidden')) return;
    positionScrollbarDropdown();
});

// wire scrollbar items
if (scrollbarDropdown) {
    const items = scrollbarDropdown.querySelectorAll('.scrollbar-item');
    items.forEach(item => {
        item.addEventListener('click', (ev) => {
            const v = item.dataset.value;
            if (v) {
                currentScrollbar = v;
                localStorage.setItem('pickleScrollbar', currentScrollbar);
                applyScrollbarClass();
                applyOverlayMode();
            }
            toggleScrollbarDropdown(false);
        });
        // allow keyboard selection via Enter
        item.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                item.click();
            }
        });
    });
}

// wire model items
if (modelDropdown) {
    const items = modelDropdown.querySelectorAll('.model-item');
    items.forEach(item => {
        item.addEventListener('click', (ev) => {
            const v = item.dataset.value;
            if (v) {
                currentModel = v;
                localStorage.setItem('pickleModel', currentModel);
                if (currentModelEl) currentModelEl.textContent = currentModel;
            }
            toggleModelDropdown(false);
        });
        // allow keyboard selection via Enter
        item.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                item.click();
            }
        });
    });
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
