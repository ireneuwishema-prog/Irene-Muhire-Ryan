// =====================
// LOGIN CHECK (ONLY COURSE PAGE)
// =====================
if (window.location.pathname.includes("course.html")) {
    if (!localStorage.getItem("loggedIn")) {
        // window.location.href = "login.html";
    }
}

// =====================
// LOGIN
// =====================
window.login = function () {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "course.html";
};

// =====================
// REGISTER
// =====================
window.register = function () {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "course.html";
};

// =====================
// COURSE INTERACTIVE UI (human-only, no “AI stickers”)
// =====================

function normalizeText(t) {
    return (t || "")
        .replace(/\r\n/g, "\n")
        .replace(/[\t ]+/g, " ")
        .trim();
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "<")
        .replaceAll(">", ">")
.replaceAll('"')
}

function loadingCard(message) {
    return `
        <div class="state-card">
            <span class="spinner"></span>
            <div class="state-sub">${escapeHtml(message)}</div>
        </div>
    `;
}

function emptyCard(title, subtitle) {
    return `
        <div class="state-card">
            <div style="text-align:center">
                <div style="font-weight:900; font-size:14px">${escapeHtml(title)}</div>
                <div class="state-sub" style="margin-top:6px">${escapeHtml(subtitle)}</div>
            </div>
        </div>
    `;
}

function setContainerState(container, html) {
    if (!container) return;
    container.innerHTML = html;
}

function extractSentences(notes) {
    const text = normalizeText(notes);
    if (!text) return [];

    const parts = text
        .split(/(?<=[.!?])\s+|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);

    return parts.slice(0, 30);
}

function uniq(arr) {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
        const key = String(x).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(x);
    }
    return out;
}

function keywordsFromNotes(notes) {
    const text = normalizeText(notes).toLowerCase();
    if (!text) return [];

    const stop = new Set([
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "if",
        "then",
        "else",
        "to",
        "of",
        "in",
        "on",
        "at",
        "for",
        "with",
        "without",
        "from",
        "by",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "it",
        "this",
        "that",
        "these",
        "those",
        "as",
        "i",
        "you",
        "we",
        "they",
        "he",
        "she",
        "them",
        "your",
        "our",
        "their",
        "can",
        "will",
        "would",
        "should",
        "could",
        "may",
        "might",
        "not",
        "no",
        "yes",
        "do",
        "does",
        "did",
        "done",
        "have",
        "has",
        "had",
        "having",
        "subject",
        "chapter",
        "lesson",
        "page",
    ]);

    const words = text.split(/[^a-z0-9]+/g).filter(Boolean);
    const filtered = words.filter((w) => w.length >= 4 && !stop.has(w));
    return uniq(filtered).slice(0, 18);
}

function makeFlashcardsFromNotes(notes) {
    const sentences = extractSentences(notes);
    const cards = [];

    for (const s of sentences) {
        const clean = s.replace(/^[\-•\*\d\s\.]+/, "");
        if (!clean) continue;

        const q = clean.length > 55 ? clean.slice(0, 55).trim() + "…" : clean;
        cards.push({ q, a: clean });
        if (cards.length >= 10) break;
    }

    if (cards.length < 4) {
        const kws = keywordsFromNotes(notes);
        for (const k of kws) {
            cards.push({
                q: `Explain: ${k}`,
                a: `From your notes, relate “${k}” to the main idea you wrote.`,
            });
            if (cards.length >= 10) break;
        }
    }

    return cards.slice(0, 10);
}

function renderFlashcards(cards) {
    const container = document.getElementById("flashcardsContainer");
    if (!container) return;

    if (!cards.length) {
        setContainerState(container, emptyCard("No flashcards yet", "Write notes and click Flashcards."));
        return;
    }

    const cardsHtml = cards
        .map((c, idx) => {
            return `
            <div class="flashcard" data-idx="${idx}">
                <div class="flashcard-inner" aria-label="Flashcard">
                    <div class="flashcard-front">
                        <div style="max-width: 260px">${escapeHtml(c.q)}</div>
                        <div style="font-size:12px; opacity:0.7; margin-top:10px">Click to reveal</div>
                    </div>
                    <div class="flashcard-back">
                        <div style="max-width: 260px">${escapeHtml(c.a)}</div>
                        <div style="font-size:12px; opacity:0.7; margin-top:10px">Click to hide</div>
                    </div>
                </div>
            </div>
        `;
        })
        .join("");

    container.innerHTML = cardsHtml;

    container.querySelectorAll(".flashcard").forEach((card) => {
        card.addEventListener("click", () => {
            card.classList.toggle("revealed");
        });
    });
}

function makeQuizFromNotes(notes) {
    const sentences = extractSentences(notes);
    const kws = keywordsFromNotes(notes);

    const pool = (sentences.length ? sentences : kws.map((k) => `Concept: ${k}`)).slice(0, 12);
    const questions = [];

    for (let i = 0; i < Math.min(6, pool.length); i++) {
        const correct = pool[i];
        const distractors = uniq(pool.filter((_, idx) => idx !== i)).slice(0, 3);

        const distractorsFilled = [...distractors];
        while (distractorsFilled.length < 3 && kws.length) {
            const k = kws[distractorsFilled.length % kws.length];
            const concept = `Concept: ${k}`;
            if (!distractorsFilled.includes(concept)) distractorsFilled.push(concept);
        }

        const options = uniq([correct, ...distractorsFilled]).slice(0, 4);

        for (let j = options.length - 1; j > 0; j--) {
            const r = Math.floor(Math.random() * (j + 1));
            [options[j], options[r]] = [options[r], options[j]];
        }

        questions.push({
            id: `q_${i}_${Date.now()}`,
            prompt: `Which option best matches: “${correct.length > 40 ? correct.slice(0, 40).trim() + "…" : correct}”?`,
            options,
            correct,
        });
    }

    return questions;
}

function renderQuiz(quiz) {
    const quizContainer = document.getElementById("quizContainer");
    if (!quizContainer) return;

    const state = {
        quiz,
        selected: new Map(),
        answered: false,
    };

    const html = quiz
        .map((q, idx) => {
            return `
            <div class="quiz-card" data-qindex="${idx}">
                <div class="quiz-q">Q${idx + 1}. ${escapeHtml(q.prompt)}</div>
                <div class="quiz-options">
                    ${q.options
                        .map((opt) => {
                            return `
                            <div class="quiz-option" role="button" tabindex="0" data-option="${escapeHtml(opt)}">
                                ${escapeHtml(opt)}
                            </div>
                        `;
                        })
                        .join("")}
                </div>
            </div>
        `;
        })
        .join("");

    quizContainer.innerHTML = html + `
        <div class="quiz-footer">
            <button id="submitQuizBtn" class="btn-main" type="button">Submit Quiz</button>
            <button id="retryQuizBtn" class="btn-outline" type="button" style="margin:0">Retry</button>
        </div>
    `;

    quizContainer.querySelectorAll(".quiz-card").forEach((cardEl) => {
        const qIndex = Number(cardEl.getAttribute("data-qindex"));

        cardEl.querySelectorAll(".quiz-option").forEach((optEl) => {
            const choose = () => {
                if (state.answered) return;

                const picked = optEl.getAttribute("data-option");
                state.selected.set(qIndex, picked);

                cardEl.querySelectorAll(".quiz-option").forEach((e) => e.classList.remove("selected"));
                optEl.classList.add("selected");
            };

            optEl.addEventListener("click", choose);
            optEl.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose();
                }
            });
        });
    });

    const scoreQuiz = () => {
        let correctCount = 0;

        state.quiz.forEach((q, idx) => {
            const picked = state.selected.get(idx);
            const cardEl = quizContainer.querySelector(`.quiz-card[data-qindex="${idx}"]`);
            if (!cardEl) return;

            cardEl.querySelectorAll(".quiz-option").forEach((el) => {
                const val = el.getAttribute("data-option");
                el.classList.remove("correct", "wrong");

                if (val === q.correct) el.classList.add("correct");
                if (picked && val === picked && picked !== q.correct) el.classList.add("wrong");
            });

            if (picked === q.correct) correctCount++;
        });

        state.answered = true;
        quizContainer.querySelectorAll(".quiz-option").forEach((el) => {
            el.style.cursor = "default";
        });

        const resultPct = Math.round((correctCount / state.quiz.length) * 100);
        quizContainer.innerHTML += `
            <div class="quiz-result">Score: ${correctCount}/${state.quiz.length} (${resultPct}%)</div>
        `;
    };

    const submitBtn = document.getElementById("submitQuizBtn");
    const retryBtn = document.getElementById("retryQuizBtn");

    if (submitBtn) submitBtn.addEventListener("click", scoreQuiz);
    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            const quizBtn = document.getElementById("generateQuizBtn");
            if (quizBtn) quizBtn.click();
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Tabs navigation (Book / Notes / Flashcards / Smart Quiz / Past Paper)
    const tabBtns = document.querySelectorAll(".tab-btn[data-tab]");
    const panels = document.querySelectorAll(".panel");

    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            tabBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const tab = btn.getAttribute("data-tab");
            const panelMap = {
                book: "book-panel",
                notes: "notes-panel",
                flashcards: "flashcards-panel",
                quiz: "quiz-panel",
                pastpaper: "pastpaper-panel",
            };

            const panelId = panelMap[tab];
            panels.forEach((p) => p.classList.remove("active"));
            const target = document.getElementById(panelId);
            if (target) target.classList.add("active");
        });
    });

    const notesInputEl = document.getElementById("notesInput");
    const existingNotes = localStorage.getItem("notes");
    if (notesInputEl && existingNotes) notesInputEl.value = existingNotes;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "login.html";
        });
    }

    const saveBtn = document.getElementById("saveNotesBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const notes = document.getElementById("notesInput").value;
            localStorage.setItem("notes", notes);

            const old = saveBtn.textContent;
            saveBtn.textContent = "Saved ✓";
            saveBtn.disabled = true;
            setTimeout(() => {
                saveBtn.textContent = old;
                saveBtn.disabled = false;
            }, 900);
        });
    }

    const flashcardsBtn = document.getElementById("generateFlashcardsBtn");
    const quizBtn = document.getElementById("generateQuizBtn");

    const flashcardsContainer = document.getElementById("flashcardsContainer");
    const quizContainer = document.getElementById("quizContainer");

    if (flashcardsContainer) {
        setContainerState(
            flashcardsContainer,
            emptyCard("Ready when you are", "Click Flashcards after saving notes.")
        );
    }
    if (quizContainer) {
        setContainerState(
            quizContainer,
            emptyCard("Quiz will appear here", "Click Quiz after saving notes.")
        );
    }


    const getNotesOrSaved = () => {
        const typed = notesInputEl ? notesInputEl.value : "";
        const saved = localStorage.getItem("notes") || "";
        return normalizeText(typed) || normalizeText(saved);
    };

    if (flashcardsBtn) {
        flashcardsBtn.addEventListener("click", () => {
            const notes = getNotesOrSaved();
            if (!notes) {
                setContainerState(flashcardsContainer, emptyCard("No notes yet", "Write something in Notes first."));
                return;
            }

            setContainerState(flashcardsContainer, loadingCard("Generating flashcards…"));
            setTimeout(() => {
                const cards = makeFlashcardsFromNotes(notes);
                renderFlashcards(cards);
            }, 450);
        });
    }

    if (quizBtn) {
        quizBtn.addEventListener("click", () => {
            const notes = getNotesOrSaved();
            if (!notes) {
                setContainerState(quizContainer, emptyCard("No notes yet", "Write something in Notes first."));
                return;
            }

            setContainerState(quizContainer, loadingCard("Generating quiz…"));
            setTimeout(() => {
                const quiz = makeQuizFromNotes(notes);
                if (!quiz.length) {
                    setContainerState(quizContainer, emptyCard("No quiz yet", "Write more notes and try again."));
                    return;
                }
                renderQuiz(quiz);
            }, 650);
        });
    }
});

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupLogout();
    setupTabs();
});

// Check if user is logged in
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }

    // Display user info
    document.getElementById('userName').textContent = currentUser.name || 'User';
    document.getElementById('userEmail').textContent = currentUser.email || '';

    // Show admin link if user is admin
    if (currentUser.isAdmin === true) {
        document.getElementById('adminLink').style.display = 'inline-block';
    }
}

// Setup logout
function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            sessionStorage.clear();
            window.location.href = 'login.html';
        }
    });
}

// Setup tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(tabName + '-panel').classList.add('active');
        });
    });
}

const translations = {
    en: {
        langLabel: 'Language',
        topbarTitle: '📚 L3 Study Helper Pro',
        logout: 'Logout',
        bookTab: '📖 Book Upload',
        notesTab: '✏️ Notes',
        flashcardsTab: '🃏 Flashcards',
        quizTab: '✅ Smart Quiz',
        pastpaperTab: '📄 Past Paper',
        bookTitle: '📖 Book & Document Summarizer',
        bookDesc: 'Upload any book, article, or document - Get instant summary, key points, flashcards & quiz!',
        bookUploadHint: 'Supports .txt files (Copy-paste from PDF/Word)',
        bookTextLabel: '📝 Or paste your text here:',
        summarizeBtn: '✨ Generate Summary & Key Points',
        bookToFlashcardsBtn: 'Create Flashcards from Book',
        bookToQuizBtn: 'Create Quiz from Book',
        doAllBtn: 'Do All (Summary + Flashcards + Quiz)',
        notesTitle: '📝 Your Study Notes',
        notesDesc: 'Write or paste your L3 subject notes below',
        saveNotesBtn: '💾 Save Notes',
        generateFlashcardsBtn: '✨ Make Flashcards',
        generateQuizBtn: '🎯 Make Smart Quiz',
        flashcardsTitle: '🃏 Study Flashcards',
        flashcardsInfo: '📌 No flashcards yet. Go to Notes or Book Upload tab to create some!',
        resetFlashcardsBtn: '🗑️ Delete All Flashcards',
        quizTitle: '✅ Smart Quiz System',
        quizDesc: 'Test your knowledge with interactive quizzes',
        standardQuizBtn: '📋 Standard Quiz',
        reviewWrongBtn: '🔄 Review Wrong Answers',
        randomQuizBtn: '🎲 Random Order Quiz',
        submitQuizBtn: '📊 Submit & Grade',
        showExplanationsBtn: '💡 Show Explanations',
        retryWrongBtn: '🔄 Retry Wrong Answers',
        resetQuizBtn: '🗑️ Reset Quiz',
        pastpaperTitle: '📄 Past Paper to Study',
        pastpaperDesc: 'Upload a past exam or paste the questions',
        fileUploadHint: '(Save your exam as .txt file first)',
        processPastPaperBtn: '🚀 Generate Flashcards & Quiz from Past Paper'
    },
    rw: {
        langLabel: 'Ururimi',
        topbarTitle: '📚 L3 Study Helper Pro',
        logout: 'Gusohoka',
        bookTab: '📖 Gutanga Igitabo',
        notesTab: '✏️ Ibyanditswe',
        flashcardsTab: '🃏 Flashcards',
        quizTab: '✅ Ikizamini',
        pastpaperTab: '📄 Impapuro z’Ikizamini',
        bookTitle: '📖 Ihuriro ry’Igitabo n’Umwandiko',
        bookDesc: 'Ohereza igitabo, inyandiko cyangwa inyandiko - ubone incamake, ingingo z’ingenzi, flashcards na quiz!',
        bookUploadHint: 'Ifasha .txt (Copy-paste kuva PDF/Word)',
        bookTextLabel: '📝 Cyangwa shyiramo inyandiko hano:',
        summarizeBtn: '✨ Kora Incamake & Ingingo z’ingenzi',
        bookToFlashcardsBtn: 'Kora Flashcards uhereye ku gitabo',
        bookToQuizBtn: 'Kora Ikizamini uhereye ku gitabo',
        doAllBtn: 'Kora byose (Incamake + Flashcards + Quiz)',
        notesTitle: '📝 Inyandiko zawe z’Icyigisho',
        notesDesc: 'Andika cyangwa shyiramo inyandiko zawe za L3',
        saveNotesBtn: '💾 Bika Inyandiko',
        generateFlashcardsBtn: '✨ Kora Flashcards',
        generateQuizBtn: '🎯 Kora Ikizamini Cyiza',
        flashcardsTitle: '🃏 Flashcards zo Kwiga',
        flashcardsInfo: '📌 Nta flashcards ziriho. Jya kuri Notes cyangwa Book Upload kugirango ukore!',
        resetFlashcardsBtn: '🗑️ Siba Flashcards Zose',
        quizTitle: '✅ Sisitemu y’Ikizamini',
        quizDesc: 'Gerageza ubumenyi bwawe n’ibizamini bitandukanye',
        standardQuizBtn: '📋 Ikizamini Gisanzwe',
        reviewWrongBtn: '🔄 Reba Ibyakozwe Neza',
        randomQuizBtn: '🎲 Ikizamini mu buryo bwa Gutoranya',
        submitQuizBtn: '📊 Ohereza & Hagaragaza',
        showExplanationsBtn: '💡 Erekana Ibisobanuro',
        retryWrongBtn: '🔄 Ongera Usubireho Ibitagize neza',
        resetQuizBtn: '🗑️ Subiramo Ikizamini',
        pastpaperTitle: '📄 Impapuro z’Ikizamini zo Kwiga',
        pastpaperDesc: 'Ohereza ikizamini cya kera cyangwa shyiramo ibibazo',
        fileUploadHint: '(Bika ikizamini cyawe nka .txt mbere)',
        processPastPaperBtn: '🚀 Kora Flashcards & Quiz uhereye ku mpapuro'
    }
};

const ui = {
    langLabel: document.getElementById('langLabel'),
    topbarTitle: document.querySelector('.topbar-title'),
    logoutBtn: document.getElementById('logoutBtn'),
    bookTab: document.querySelector('[data-tab="book"]'),
    notesTab: document.querySelector('[data-tab="notes"]'),
    flashcardsTab: document.querySelector('[data-tab="flashcards"]'),
    quizTab: document.querySelector('[data-tab="quiz"]'),
    pastpaperTab: document.querySelector('[data-tab="pastpaper"]'),
    bookTitle: document.querySelector('#book-panel h2'),
    bookDesc: document.querySelector('#book-panel .panel-desc'),
    bookUploadHint: document.querySelector('#bookUploadArea .upload-hint'),
    bookTextLabel: document.querySelector('label[for="bookTextInput"]'),
    summarizeBtn: document.getElementById('summarizeBtn'),
    bookToFlashcardsBtn: document.getElementById('bookToFlashcardsBtn'),
    bookToQuizBtn: document.getElementById('bookToQuizBtn'),
    doAllBtn: document.getElementById('doAllBtn'),
    notesTitle: document.querySelector('#notes-panel h2'),
    notesDesc: document.querySelector('#notes-panel .panel-desc'),
    saveNotesBtn: document.getElementById('saveNotesBtn'),
    generateFlashcardsBtn: document.getElementById('generateFlashcardsBtn'),
    generateQuizBtn: document.getElementById('generateQuizBtn'),
    flashcardsTitle: document.querySelector('#flashcards-panel h2'),
    flashcardsInfo: document.querySelector('#flashcards-panel .info-text'),
    resetFlashcardsBtn: document.getElementById('resetFlashcardsBtn'),
    quizTitle: document.querySelector('#quiz-panel h2'),
    quizDesc: document.querySelector('#quiz-panel .panel-desc'),
    standardQuizBtn: document.getElementById('standardQuizBtn'),
    reviewWrongBtn: document.getElementById('reviewWrongBtn'),
    randomQuizBtn: document.getElementById('randomQuizBtn'),
    submitQuizBtn: document.getElementById('submitQuizBtn'),
    showExplanationsBtn: document.getElementById('showExplanationsBtn'),
    retryWrongBtn: document.getElementById('retryWrongBtn'),
    resetQuizBtn: document.getElementById('resetQuizBtn'),
    pastpaperTitle: document.querySelector('#pastpaper-panel h2'),
    pastpaperDesc: document.querySelector('#pastpaper-panel .panel-desc'),
    fileUploadHint: document.querySelector('#uploadArea .upload-hint'),
    processPastPaperBtn: document.getElementById('processPastPaperBtn')
};

function applyLanguage(lang) {
    const current = translations[lang] || translations.en;
    Object.keys(ui).forEach(key => {
        const element = ui[key];
        if (!element) return;
        const text = current[key];
        if (text !== undefined) element.textContent = text;
    });
    document.documentElement.lang = lang;
}

document.querySelectorAll('.lang-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.lang-btn.active')?.classList.remove('active');
        button.classList.add('active');
        applyLanguage(button.dataset.lang);
    });
});

applyLanguage('en');

