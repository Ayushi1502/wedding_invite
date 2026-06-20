// ================================
// Countdown Timer
// ================================
let countdownInterval;
function startCountdown() {
    const container = document.getElementById('countdown-container');
    if (!container) return;
    const weddingDate = new Date('2026-06-29T00:00:00'); // Updated wedding date
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    function updateTimer() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        if (distance < 0) {
            clearInterval(countdownInterval);
            daysEl.innerText = "00"; hoursEl.innerText = "00";
            minsEl.innerText = "00"; secsEl.innerText = "00";
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        daysEl.innerText = days < 10 ? "0" + days : days;
        hoursEl.innerText = hours < 10 ? "0" + hours : hours;
        minsEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        secsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
    }
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
    container.classList.add('revealed');
}

// ================================
// 3 Hearts Scratch Logic
// ================================
class ScratchHeart {
    constructor(canvasId, containerId, onReveal) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.container = document.getElementById(containerId);
        this.onReveal = onReveal;
        this.isDrawing = false;
        this.revealed = false;
        this.init();
    }
    init() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
        // Warm Terracotta fill for scratch layer
        this.ctx.fillStyle = '#B85940';
        this.ctx.fillRect(0, 0, this.width, this.height);
        // Scratch indication text
        this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
        this.ctx.font = "12px 'Tenor Sans', sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.letterSpacing = "2px";
        this.ctx.fillText("SCRATCH", this.width / 2, this.height / 2 + 4);
        this.canvas.addEventListener('mousedown', (e) => { this.isDrawing = true; this.scratch(e); });
        this.canvas.addEventListener('touchstart', (e) => { this.isDrawing = true; this.scratch(e); }, { passive: false });
        window.addEventListener('mouseup', () => { this.isDrawing = false; });
        window.addEventListener('touchend', () => { this.isDrawing = false; });
        this.canvas.addEventListener('mousemove', (e) => this.scratch(e));
        this.canvas.addEventListener('touchmove', (e) => this.scratch(e), { passive: false });
    }
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }
    scratch(e) {
        if (!this.isDrawing || this.revealed) return;
        if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
        const pos = this.getMousePos(e);
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.width * 0.22, 0, Math.PI * 2);
        this.ctx.fill();
        if (Math.random() > 0.2) this.checkProgress();
    }
    checkProgress() {
        if (this.revealed) return;
        const sampleRate = 32;
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        for (let i = 3; i < pixels.length; i += sampleRate) {
            if (pixels[i] < 128) transparentPixels++;
        }
        const totalPixels = pixels.length / sampleRate;
        if ((transparentPixels / totalPixels) * 100 > 45) {
            this.revealAll();
        }
    }
    revealAll() {
        this.revealed = true;
        this.canvas.style.opacity = '0';
        setTimeout(() => {
            this.canvas.style.display = 'none';
            this.onReveal();
        }, 1000);
    }
}
function initScratchHearts() {
    let revealedHeartsCount = 0;
    const totalHearts = 3;
    function checkAllRevealed() {
        revealedHeartsCount++;
        if (revealedHeartsCount === totalHearts) {
            const heartsRow = document.getElementById('heartsRow');
            if (heartsRow) heartsRow.classList.add('unlocked');
            const surpriseMsg = document.getElementById('surpriseMessage');
            if (surpriseMsg) {
                setTimeout(() => { 
                    surpriseMsg.classList.add('revealed');
                    startCountdown(); // Triggers the countdown display
                }, 500);
            }
            // Rich Canvas Confetti Explosion
            setTimeout(() => {
                const duration = 3000; // 3 seconds of confetti
                const end = Date.now() + duration;
                const colors = ['#B85940', '#C9963E', '#E8C07A', '#FFFFFF'];
                (function frame() {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0, y: 0.6 },
                        colors: colors,
                        zIndex: 9999
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1, y: 0.6 },
                        colors: colors,
                        zIndex: 9999
                    });
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }, 800);
        }
    }
    new ScratchHeart('scratchCanvas1', 'heartContainer1', checkAllRevealed);
    new ScratchHeart('scratchCanvas2', 'heartContainer2', checkAllRevealed);
    new ScratchHeart('scratchCanvas3', 'heartContainer3', checkAllRevealed);
}

// ================================
// Entry Gate & Smooth Scrolling
// ================================
const gate        = document.getElementById('entry-gate');
const entryVideo  = document.getElementById('entry-video');
const playOverlay = document.getElementById('play-overlay');
const bgAudio     = document.getElementById('bg-audio');
const mainEl      = document.getElementById('main-content');
const petalCanvas = document.getElementById('petals-canvas');
let audioPlaying = false;
let mainRevealed = false;
let autoScrollTimeout;
let userInteracted = false;
let scratchInitialized = false;
function smoothScrollTo(endY, duration) {
    const startY = window.scrollY; const distanceY = endY - startY;
    let startTime = null; let animationFrameId;
    function animation(currentTime) {
        if (userInteracted) { cancelAnimationFrame(animationFrameId); return; }
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        let t = timeElapsed / (duration / 2); let run;
        if (t < 1) run = distanceY / 2 * t * t * t + startY;
        else { t -= 2; run = distanceY / 2 * (t * t * t + 2) + startY; }
        window.scrollTo(0, run);
        if (timeElapsed < duration) animationFrameId = requestAnimationFrame(animation);
    }
    animationFrameId = requestAnimationFrame(animation);
}
function handleUserInteraction() {
    userInteracted = true; clearTimeout(autoScrollTimeout);
    window.removeEventListener('wheel', handleUserInteraction);
    window.removeEventListener('touchstart', handleUserInteraction);
    window.removeEventListener('mousedown', handleUserInteraction);
    window.removeEventListener('keydown', handleUserInteraction);
}
entryVideo.addEventListener('loadedmetadata', () => { entryVideo.currentTime = 0.001; });
entryVideo.addEventListener('loadeddata', () => { if (entryVideo.currentTime < 0.001) entryVideo.currentTime = 0.001; });
function revealMain() {
    if (mainRevealed) return;
    mainRevealed = true;
    gate.classList.add('fade-out');
    setTimeout(() => { gate.style.display = 'none'; }, 900);
    mainEl.classList.add('visible', 'fade-in');
    petalCanvas.classList.add('active');
    document.body.style.overflow = 'auto';
    initReveal(); initEventAutoExpand(); initMemoriesSlideshow();
    // Initialize the hearts logic
    if(!scratchInitialized) { initScratchHearts(); scratchInitialized = true; } 
    setTimeout(() => {
        window.addEventListener('wheel', handleUserInteraction, { passive: true });
        window.addEventListener('touchstart', handleUserInteraction, { passive: true });
        window.addEventListener('mousedown', handleUserInteraction, { passive: true });
        window.addEventListener('keydown', handleUserInteraction, { passive: true });
    }, 1000);
    autoScrollTimeout = setTimeout(() => {
        if (!userInteracted) {
            const scratchSection = document.getElementById('scratch-reveal-section');
            if (scratchSection) {
                const targetY = scratchSection.getBoundingClientRect().top + window.scrollY + (scratchSection.offsetHeight / 2) - (window.innerHeight / 2);
                smoothScrollTo(targetY, 2500);
            }
        }
    }, 5000);
}

gate.addEventListener('click', async () => {
    if (mainRevealed) return;
    playOverlay.classList.add('hidden');
    try {
        entryVideo.muted = false; 
        await entryVideo.play();
        try { await bgAudio.play(); audioPlaying = true; updateAudioIcon(); } catch(_) {}
    } catch(err) {
        entryVideo.muted = true;
        try { await entryVideo.play(); try { await bgAudio.play(); audioPlaying = true; updateAudioIcon(); } catch(_) {} } catch(e2) { revealMain(); }
    }
});
entryVideo.addEventListener('ended', revealMain);
entryVideo.addEventListener('error', () => { if (!mainRevealed) setTimeout(revealMain, 500); });

document.body.style.overflow = 'hidden';
// ================================
// Audio Toggle
// ================================
const audioBtn = document.getElementById('audio-btn');
const iconOn   = document.getElementById('icon-on');
const iconOff  = document.getElementById('icon-off');
function updateAudioIcon() {
    iconOn.style.display  = audioPlaying ? '' : 'none';
    iconOff.style.display = audioPlaying ? 'none' : '';
}
audioBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (audioPlaying) { bgAudio.pause(); audioPlaying = false; } else { try { await bgAudio.play(); audioPlaying = true; } catch(err) {} }
    updateAudioIcon();
});
// ================================
// Scroll Reveal & Video Auto-Expand
// ================================
function initReveal() {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
}
function initEventAutoExpand() {
    const wraps = document.querySelectorAll('.event-video-wrap');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('unlocked'); io.unobserve(entry.target); } });
    }, { threshold: 0.3 });
    wraps.forEach(w => io.observe(w));
}
// ================================
// RSVP Form & Modal (Updated and Improved)
// ================================
const rsvpForm  = document.getElementById('rsvp-form');
const submitBtn = document.getElementById('submit-btn');
const btnText   = document.getElementById('btn-text');
const btnSpinner= document.getElementById('btn-spinner');
const extraIds  = ['guests-card','events-card','extra-cards','mood-card'];
// Handle the "Joyfully Accept" vs "Regrettably Decline" UI toggle
document.querySelectorAll('input[name="attending"]').forEach(r => {
    r.addEventListener('change', () => {
        const decline = r.value === 'no';
        extraIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) { 
                el.style.opacity = decline ? '0.4' : '1'; 
                el.style.pointerEvents = decline ? 'none' : '';
            }
        });
    });
});
rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true; 
    btnText.textContent = 'Sending...'; 
    btnSpinner.style.display = 'inline';
    const formData = new FormData(e.target); 
    const data = {};
    // Extract values and properly join arrays into strings
    for (let key of formData.keys()) {
        const values = formData.getAll(key);
        data[key] = values.length > 1 ? values.join(', ') : values[0];
    }
    // Improvement: Clean up the data if they are declining
    if (data.attending === 'no') {
        data.guest_count = "0";
        data.attending_events = "None";
    }
    data.clientId = 'SourabhwedsTejaswini-wedding-2026';
    try {
        const res = await fetch('https://wedding-backend-k67l.onrender.com/api/rsvp', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(data) 
        });
        const result = await res.json();
        showModal(result.success ? 'success' : 'error');
        if (result.success) {
            e.target.reset();
            // Reset the UI styling in case they declined but want to submit again
            extraIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.style.opacity = '1'; el.style.pointerEvents = ''; }
            });
        }
    } catch(err) { 
        showModal('error'); 
    } finally { 
        submitBtn.disabled = false; 
        btnText.textContent = 'Send Love'; 
        btnSpinner.style.display = 'none'; 
    }
});
const modal       = document.getElementById('rsvp-modal');
const modalTitle  = document.getElementById('modal-title');
const modalMsg    = document.getElementById('modal-msg');
const modalSucc   = document.getElementById('modal-success-svg');
const modalErr    = document.getElementById('modal-error-svg');
const modalIcon   = document.getElementById('modal-icon');
const modalClose  = document.getElementById('modal-close');
function showModal(type) {
    if (type === 'success') {
        modalTitle.textContent = 'Thank You!'; modalMsg.textContent = "We can't wait to celebrate with you!";
        modalSucc.style.display = ''; modalErr.style.display = 'none'; modalIcon.style.background = 'rgba(184,89,64,0.1)';
    } else {
        modalTitle.textContent = 'Oops!'; modalMsg.textContent = 'There was an error submitting your RSVP. Please try again.';
        modalSucc.style.display = 'none'; modalErr.style.display = ''; modalIcon.style.background = 'rgba(220,38,38,0.08)';
    }
    modal.classList.add('open');
}
function closeModal() { modal.classList.remove('open'); }
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
// Handle dynamic resizing for scratch cards natively
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => { }, 250);
});

// ================================
// Memories Image Slideshow
// ================================
function initMemoriesSlideshow() {
    const slides = document.querySelectorAll('.memories-inner img.slide');
    if (slides.length <= 1) return;
    let currentIndex = 0;
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 3000); // Change slide every 3 seconds
}
