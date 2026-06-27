/* ==========================================================================
   LINGOFLIP APPLICATION ENGINE
   Core Javascript for Parsing Notes, SRS, TTS, and Premium Mini-Games
   ========================================================================== */

// --- Global Application State ---
const state = {
    theme: 'dark',
    files: [], // Array of { name, path, content }
    decks: {}, // Keyed by deck ID (file path) -> { name, path, language, cards: [] }
    activeDeckId: null,
    activeView: 'view-upload',
    
    // Study Session State
    sessionCards: [],
    currentSessionIndex: 0,
    isCardFlipped: false,
    
    // Quiz Session State
    quizCards: [],
    quizIndex: 0,
    quizScore: { correct: 0, total: 0 },
    
    // German Suffix Game State
    suffixRules: [],
    suffixGameIndex: 0,
    suffixGameScore: { correct: 0, total: 0 },
    
    // User Stats & Settings
    streak: 0,
    lastStudyDate: null,
    cardProgress: {}, // Keyed by cardId -> { difficulty, reviewsCount, lastReviewDate }
    settings: {
        autoTTS: true,
        voiceRate: 1.0,
        enableShortcuts: true
    }
};

// --- Fallback/Demo Datasets ---
const demoDecks = {
    'demo-deutsch': {
        name: 'German Demo Cards',
        path: 'Deutsch/Vocabulary.md',
        language: 'Deutsch',
        cards: [
            { front: 'der Hund', back: 'dog', details: 'Noun | Plural: die Hunde' },
            { front: 'die Katze', back: 'cat', details: 'Noun | Plural: die Katzen' },
            { front: 'das Buch', back: 'book', details: 'Noun | Plural: die Bücher' },
            { front: 'die Universität', back: 'university', details: 'Ending in -tät makes it Feminine.' },
            { front: 'das Mädchen', back: 'girl', details: 'Ending in -chen makes it Neuter.' },
            { front: 'der Optimismus', back: 'optimism', details: 'Ending in -ismus makes it Masculine.' },
            { front: 'die Wohnung', back: 'apartment', details: 'Ending in -ung makes it Feminine.' },
            { front: 'schön', back: 'beautiful / nice', details: 'Adjective' },
            { front: 'laufen', back: 'to run / walk', details: 'Verb | läuft, lief, ist gelaufen' }
        ]
    },
    'demo-english': {
        name: 'English TOEIC Prep',
        path: 'English/Vocabulary.md',
        language: 'English',
        cards: [
            { front: 'lucrative', back: 'profitable / money-making', details: 'Adjective | Synonyms: gainful, productive' },
            { front: 'corroborate', back: 'to confirm or give support to', details: 'Verb | Example: The witness corroborated the story.' },
            { front: 'adversity', back: 'hardship / misfortune', details: 'Noun | Synonyms: difficulty, trouble' },
            { front: 'pragmatic', back: 'practical / realistic', details: 'Adjective | Opposite: idealistic' },
            { front: 'scrutinize', back: 'to examine closely and thoroughly', details: 'Verb | Example: The auditors scrutinized the accounts.' },
            { front: 'diligent', back: 'hard-working / attentive', details: 'Adjective | Synonyms: industrious, assiduous' }
        ]
    },
    'demo-japanese': {
        name: 'Japanese N5 Kanji',
        path: '日本語/日本語.md',
        language: '日本語',
        cards: [
            { front: '日本語 (にほんご)', back: 'Japanese language', details: 'Noun | Literally: Japan book language' },
            { front: '美味しい (おいしい)', back: 'delicious / tasty', details: 'I-Adjective | Kanji: 美味 (beautiful taste)' },
            { front: '食べる (たべる)', back: 'to eat', details: 'Group 2 Verb (Ru-verb)' },
            { front: '猫 (ねこ)', back: 'cat', details: 'Noun | On-yomi: BYOU' },
            { front: '学生 (がくせい)', back: 'student', details: 'Noun | Literally: study life' },
            { front: '先生 (せんせい)', back: 'teacher', details: 'Noun | Literally: born before' }
        ]
    }
};

const defaultSuffixRules = [
    { suffix: '-ung', gender: 'die', explanation: 'Noun suffixes ending in -ung are feminine (46% of all German nouns). Examples: die Wohnung (apartment), die Zeitung (newspaper).' },
    { suffix: '-heit', gender: 'die', explanation: 'Suffixes ending in -heit are feminine. Examples: die Freiheit (freedom), die Gesundheit (health).' },
    { suffix: '-keit', gender: 'die', explanation: 'Suffixes ending in -keit are feminine. Examples: die Möglichkeit (possibility), die Einsamkeit (solitude).' },
    { suffix: '-schaft', gender: 'die', explanation: 'Suffixes ending in -schaft are feminine. Examples: die Freundschaft (friendship), die Wissenschaft (science).' },
    { suffix: '-tion / -ion', gender: 'die', explanation: 'Words ending in -tion or -ion (mostly of Latin origin) are feminine. Examples: die Information, die Station.' },
    { suffix: '-tät', gender: 'die', explanation: 'Suffixes ending in -tät are feminine. Examples: die Universität (university), die Aktivität (activity).' },
    { suffix: '-or', gender: 'der', explanation: 'Suffixes ending in -or (mostly male professions or instruments) are masculine. Examples: der Motor (motor), der Professor (professor).' },
    { suffix: '-ismus', gender: 'der', explanation: 'Suffixes ending in -ismus are masculine. Examples: der Optimismus (optimism), der Realismus (realism).' },
    { suffix: '-ling', gender: 'der', explanation: 'Suffixes ending in -ling are masculine. Examples: der Schmetterling (butterfly), der Lehrling (apprentice).' },
    { suffix: '-chen', gender: 'das', explanation: 'Diminutives ending in -chen are always neuter. Examples: das Mädchen (girl), das Brötchen (bread roll).' },
    { suffix: '-lein', gender: 'das', explanation: 'Diminutives ending in -lein are always neuter. Examples: das Fräulein (miss), das Büchlein (small book).' },
    { suffix: '-ment', gender: 'das', explanation: 'Suffixes ending in -ment (mostly of French origin) are neuter. Examples: das Instrument, das Dokument.' },
    { suffix: '-um', gender: 'das', explanation: 'Suffixes ending in -um (Latin origin) are neuter. Examples: das Museum, das Zentrum (center).' }
];

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadProgress();
    updateStreak();
    initializeEventListeners();
    renderDecksList(); // Renders demo decks if nothing loaded
});

// ==========================================================================
// Event Listeners Setup
// ==========================================================================
function initializeEventListeners() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    themeBtn.addEventListener('click', toggleTheme);

    // Navigation
    document.getElementById('nav-dashboard-btn').addEventListener('click', () => {
        switchView('view-dashboard');
    });
    
    // File Input & Drag/Drop
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('btn-select-files');
    const dropZone = document.getElementById('drop-zone');

    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', handleFileDrop);

    // Paste Toggle & Submit
    const togglePasteBtn = document.getElementById('toggle-paste-btn');
    const pasteArea = document.getElementById('paste-area-container');
    togglePasteBtn.addEventListener('click', () => {
        const isHidden = pasteArea.classList.toggle('hidden');
        togglePasteBtn.textContent = isHidden ? 'Show Paste Area' : 'Hide Paste Area';
    });
    document.getElementById('btn-parse-paste').addEventListener('click', handlePasteParsing);

    // Demo Loader
    document.getElementById('btn-load-demo').addEventListener('click', loadDemoData);

    // Re-upload from dashboard
    document.getElementById('btn-re-upload').addEventListener('click', () => {
        switchView('view-upload');
    });

    // Reset Progress
    document.getElementById('btn-reset-stats').addEventListener('click', handleResetStats);
    document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('active');
    });
    document.getElementById('btn-confirm-ok').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('active');
        executeResetStats();
    });

    // Settings listeners
    document.getElementById('select-voice-rate').addEventListener('input', (e) => {
        state.settings.voiceRate = parseFloat(e.target.value);
        saveSettings();
    });
    document.getElementById('setting-auto-tts').addEventListener('change', (e) => {
        state.settings.autoTTS = e.target.checked;
        saveSettings();
    });
    document.getElementById('setting-shortcuts').addEventListener('change', (e) => {
        state.settings.enableShortcuts = e.target.checked;
        saveSettings();
    });

    // Study View controls
    const flashcard = document.getElementById('flashcard-element');
    flashcard.addEventListener('click', flipCard);
    
    document.getElementById('btn-show-answer').addEventListener('click', flipCard);
    document.getElementById('study-back-btn').addEventListener('click', () => switchView('view-dashboard'));
    
    document.getElementById('btn-rate-easy').addEventListener('click', (e) => {
        spawnConfetti(e.clientX, e.clientY);
        submitSRS('easy');
    });
    document.getElementById('btn-rate-medium').addEventListener('click', () => submitSRS('medium'));
    document.getElementById('btn-rate-hard').addEventListener('click', () => submitSRS('hard'));

    // Speak buttons
    document.getElementById('card-front-tts-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Stop card flipping
        speakActiveCard(true);
    });
    document.getElementById('card-back-tts-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Stop card flipping
        speakActiveCard(false);
    });

    // Quiz View controls
    document.getElementById('quiz-back-btn').addEventListener('click', () => switchView('view-dashboard'));
    document.getElementById('quiz-tts-btn').addEventListener('click', () => speakQuizQuestion());
    document.getElementById('quiz-next-card-btn').addEventListener('click', loadNextQuizCard);

    // Suffix Game controls
    document.getElementById('suffix-back-btn').addEventListener('click', () => switchView('view-dashboard'));
    document.getElementById('suffix-btn-der').addEventListener('click', () => checkSuffixGuess('der'));
    document.getElementById('suffix-btn-die').addEventListener('click', () => checkSuffixGuess('die'));
    document.getElementById('suffix-btn-das').addEventListener('click', () => checkSuffixGuess('das'));
    document.getElementById('suffix-btn-next').addEventListener('click', loadNextSuffixRule);

    // Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyDown);
}

// ==========================================================================
// File Upload & Drag-and-Drop Processing
// ==========================================================================
async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    await processUploadedFiles(files);
}

async function handleFileDrop(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.remove('dragover');
    
    const items = Array.from(e.dataTransfer.items);
    const files = [];

    // Helper to read entries recursively
    async function traverseFileTree(item, path = '') {
        if (item.isFile) {
            const file = await new Promise((resolve) => item.file(resolve));
            // Keep track of the relative path if possible
            file.relativePath = path + file.name;
            files.push(file);
        } else if (item.isDirectory) {
            const dirReader = item.createReader();
            const entries = await new Promise((resolve) => dirReader.readEntries(resolve));
            for (const entry of entries) {
                await traverseFileTree(entry, path + item.name + '/');
            }
        }
    }

    const promises = items.map(item => {
        const entry = item.webkitGetAsEntry();
        if (entry) return traverseFileTree(entry);
    });

    await Promise.all(promises);
    if (files.length > 0) {
        await processUploadedFiles(files);
    } else {
        showToast('No readable files found.', 'error');
    }
}

async function processUploadedFiles(fileList) {
    showToast('Scanning files...', 'info');
    const mdFiles = fileList.filter(f => f.name.endsWith('.md'));
    
    if (mdFiles.length === 0) {
        showToast('No markdown (.md) files found.', 'error');
        return;
    }

    state.files = [];
    state.decks = {};
    let suffixFileFound = false;

    for (const file of mdFiles) {
        const path = file.relativePath || file.webkitRelativePath || file.name;
        const content = await file.text();
        state.files.push({ name: file.name, path, content });

        // Identify Language based on path
        let language = 'Custom';
        const pathParts = path.split('/');
        if (pathParts.length > 1) {
            const folderName = pathParts[0];
            language = folderName.charAt(0).toUpperCase() + folderName.slice(1);
        } else {
            const lowerPath = path.toLowerCase();
            if (lowerPath.includes('deutsch') || lowerPath.includes('german') || lowerPath.includes('deutch')) {
                language = 'Deutsch';
            } else if (lowerPath.includes('english')) {
                language = 'English';
            } else if (lowerPath.includes('japanese') || lowerPath.includes('日本語')) {
                language = '日本語';
            }
        }
        
        // Normalize language name to align with features and speech synthesis
        if (language.toLowerCase() === 'german' || language.toLowerCase() === 'deutch') {
            language = 'Deutsch';
        } else if (language.toLowerCase() === 'japanese') {
            language = '日本語';
        }

        // Special Parse for Deutsch Gender Learn Suffixes
        if (file.name.toLowerCase().includes('gender learn') || file.name.toLowerCase().includes('deutch gender learn')) {
            parseSuffixRules(content);
            suffixFileFound = true;
        }

        // Parse regular cards
        const cards = parseMarkdownCards(content);
        if (cards.length > 0) {
            const deckId = path;
            state.decks[deckId] = {
                name: file.name.replace('.md', ''),
                path,
                language,
                cards
            };
        }
    }

    const deckCount = Object.keys(state.decks).length;
    if (deckCount === 0 && !suffixFileFound) {
        showToast('Found markdown files, but could not parse any flashcards inside them.', 'warning');
        loadDemoData();
    } else {
        showToast(`Successfully loaded ${deckCount} decks!`, 'success');
        switchView('view-dashboard');
        renderDecksList();
        saveLastUploadState();
    }
}

function handlePasteParsing() {
    const text = document.getElementById('paste-textarea').value.trim();
    if (!text) {
        showToast('Please paste some text first.', 'warning');
        return;
    }

    const cards = parseMarkdownCards(text);
    if (cards.length === 0) {
        showToast('Could not find flashcard patterns. Use "Front :: Back" format.', 'error');
        return;
    }

    state.decks['pasted-deck'] = {
        name: 'Pasted Flashcards',
        path: 'Pasted Text',
        language: 'Custom',
        cards: cards
    };

    showToast(`Parsed ${cards.length} cards from paste area.`, 'success');
    switchView('view-dashboard');
    renderDecksList();
}

function loadDemoData() {
    state.decks = JSON.parse(JSON.stringify(demoDecks));
    state.suffixRules = [...defaultSuffixRules];
    showToast('Loaded pre-configured demo vocabulary!', 'success');
    switchView('view-dashboard');
    renderDecksList();
}

// ==========================================================================
// Note Parsers (Markdown parsing logic)
// ==========================================================================
function parseMarkdownCards(text) {
    const cards = [];
    const lines = text.split('\n');
    let isInTable = false;
    let tableHeaders = [];
    let tableLines = [];

    // Cleaning functions
    const cleanWord = (w) => w.replace(/[\*\_\`\~]/g, '').trim();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // --- 1. Markdown Table Parsing ---
        if (line.startsWith('|')) {
            // Check if it's a separator line like |---|---|
            if (line.includes('---') || line.includes('===') || line.includes('-|-')) {
                isInTable = true;
                continue;
            }
            const parts = line.split('|').map(p => p.trim()).filter((p, index, arr) => index > 0 && index < arr.length - 1);
            
            if (!isInTable) {
                // Potential header row
                tableHeaders = parts;
                tableLines = [];
            } else {
                tableLines.push(parts);
            }
            continue;
        } else {
            // End of table check
            if (isInTable && tableLines.length > 0) {
                processTable(tableHeaders, tableLines, cards);
                isInTable = false;
                tableHeaders = [];
                tableLines = [];
            }
        }

        // --- 2. Inline Separators (::, ->, or -) ---
        if (line.includes('::')) {
            const splitIndex = line.indexOf('::');
            const front = line.substring(0, splitIndex).replace(/^-\s+/, '');
            const back = line.substring(splitIndex + 2);
            cards.push({
                front: escapeHTML(cleanWord(front)),
                back: escapeHTML(cleanWord(back)),
                details: ''
            });
            continue;
        }

        if (line.includes(' -> ')) {
            const parts = line.split(' -> ');
            cards.push({
                front: escapeHTML(cleanWord(parts[0].replace(/^-\s+/, ''))),
                back: escapeHTML(cleanWord(parts[1])),
                details: ''
            });
            continue;
        }

        // --- 3. Bullet list with : separator ---
        const bulletMatch = line.match(/^[\*\-\+]\s+([^\:]+)\s*\:\s*(.+)$/);
        if (bulletMatch) {
            cards.push({
                front: escapeHTML(cleanWord(bulletMatch[1])),
                back: escapeHTML(cleanWord(bulletMatch[2])),
                details: ''
            });
            continue;
        }
    }

    // Process table if it was the last thing in the file
    if (isInTable && tableLines.length > 0) {
        processTable(tableHeaders, tableLines, cards);
    }

    return cards;
}

// Convert parsed markdown tables into cards
function processTable(headers, rows, cardsList) {
    if (headers.length < 2) return;
    
    // Find index of columns intelligently
    let frontIdx = 0;
    let backIdx = 1;
    let detailsIdx = -1;
    let hiraganaIdx = -1;
    let romajiIdx = -1;
    let sentenceIdx = -1;

    const lowerHeaders = headers.map(h => h.toLowerCase());
    
    for (let i = 0; i < lowerHeaders.length; i++) {
        const h = lowerHeaders[i];
        if (h.includes('deutsch') || h.includes('word') || h.includes('term') || h.includes('vocabulary') || h.includes('kanji') || h.includes('front')) {
            frontIdx = i;
        } else if (h.includes('english') || h.includes('meaning') || h.includes('definition') || h.includes('translation') || h.includes('back')) {
            backIdx = i;
        } else if (h.includes('hiragana') || h.includes('kana') || h.includes('よみ') || h.includes('読み方') || h.includes('yomikata')) {
            hiraganaIdx = i;
        } else if (h.includes('romaji') || h.includes('rōmaji') || h.includes('romanji') || h.includes('romanization')) {
            romajiIdx = i;
        } else if (h.includes('sentence') || h.includes('example') || h.includes('例文')) {
            sentenceIdx = i;
        } else if (h.includes('gender') || h.includes('pronunciation') || h.includes('plural') || h.includes('note') || h.includes('details')) {
            detailsIdx = i;
        }
    }

    // Force different columns for front and back
    if (frontIdx === backIdx) {
        backIdx = frontIdx === 0 ? 1 : 0;
    }

    for (const row of rows) {
        if (row.length > Math.max(frontIdx, backIdx)) {
            const frontVal = row[frontIdx] ? row[frontIdx].trim() : '';
            const backVal = row[backIdx] ? row[backIdx].trim() : '';
            let detailsVal = '';
            
            const detailParts = [];
            
            if (hiraganaIdx !== -1 && row.length > hiraganaIdx && row[hiraganaIdx].trim()) {
                detailParts.push(`<strong>Hiragana:</strong> ${escapeHTML(row[hiraganaIdx].trim())}`);
            }
            if (romajiIdx !== -1 && row.length > romajiIdx && row[romajiIdx].trim()) {
                detailParts.push(`<strong>Romaji:</strong> ${escapeHTML(row[romajiIdx].trim())}`);
            }
            if (sentenceIdx !== -1 && row.length > sentenceIdx && row[sentenceIdx].trim()) {
                detailParts.push(`<strong>Sentence:</strong> ${escapeHTML(row[sentenceIdx].trim())}`);
            }
            if (detailsIdx !== -1 && row.length > detailsIdx && row[detailsIdx].trim()) {
                // If there's a gender column, style it
                const rawDetails = row[detailsIdx].trim();
                const g = rawDetails.toLowerCase();
                if (['der', 'die', 'das', 'masculine', 'feminine', 'neuter'].includes(g)) {
                    const article = g.startsWith('d') ? g : (g.startsWith('m') ? 'der' : (g.startsWith('f') ? 'die' : 'das'));
                    detailParts.push(`<span class="gender-span ${article}">${article.toUpperCase()}</span>`);
                } else {
                    detailParts.push(escapeHTML(rawDetails));
                }
            }

            if (detailParts.length > 0) {
                detailsVal = detailParts.join('<br>');
            }

            if (frontVal && backVal) {
                cardsList.push({
                    front: escapeHTML(frontVal),
                    back: escapeHTML(backVal),
                    details: detailsVal.trim()
                });
            }
        }
    }
}

// Special parser to extract German suffix rules from Deutch Gender Learn.md
function parseSuffixRules(text) {
    const rules = [];
    const lines = text.split('\n');
    let currentGender = null;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        // Match header like ### Feminine(46%, Die):
        if (line.startsWith('###') || line.startsWith('##')) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('feminine') || lowerLine.includes('die')) {
                currentGender = 'die';
            } else if (lowerLine.includes('masculine') || lowerLine.includes('der')) {
                currentGender = 'der';
            } else if (lowerLine.includes('neuter') || lowerLine.includes('das')) {
                currentGender = 'das';
            }
            continue;
        }

        // Parse bullet items starting with suffix, e.g. - -ung or - -heit
        if (currentGender && line.startsWith('-')) {
            // Extract suffix like -ung
            const suffixMatch = line.match(/^-\s+(-[a-zA-Zäöüß]+|\-[a-zA-Zäöüß]+\/[a-zA-Zäöüß]+)/);
            if (suffixMatch) {
                const suffix = suffixMatch[1].trim();
                
                // Formulate description
                let explanation = `Words ending with suffix <strong>${suffix}</strong> are grammatically <strong>${currentGender.toUpperCase()}</strong>.`;
                const genderExamples = {
                    'die': {
                        '-ung': 'Examples: die Zeitung (newspaper), die Wohnung (apartment).',
                        '-heit': 'Examples: die Freiheit (freedom), die Schönheit (beauty).',
                        '-keit': 'Examples: die Möglichkeit (possibility), die Einsamkeit (solitude).',
                        '-schaft': 'Examples: die Freundschaft (friendship), die Gesellschaft (society).',
                        '-tion': 'Examples: die Station (station), die Information (information).',
                        '-ion': 'Examples: die Station (station), die Information (information).',
                        '-tät': 'Examples: die Universität (university), die Qualität (quality).',
                        '-ie': 'Examples: die Biologie (biology), die Chemie (chemistry).'
                    },
                    'der': {
                        '-or': 'Examples: der Motor (motor), der Professor (professor).',
                        '-ismus': 'Examples: der Optimismus (optimism), der Tourismus (tourism).',
                        '-ling': 'Examples: der Lehrling (apprentice), der Schmetterling (butterfly).',
                        '-er': 'Examples: der Lehrer (teacher), der Computer (computer).',
                        '-ent': 'Examples: der Student (student), der Patient (patient).'
                    },
                    'das': {
                        '-chen': 'Examples: das Mädchen (girl), das Brötchen (bread roll). Always Neuter.',
                        '-lein': 'Examples: das Fräulein (miss), das Büchlein (booklet). Always Neuter.',
                        '-ment': 'Examples: das Instrument (instrument), das Dokument (document).',
                        '-um': 'Examples: das Museum (museum), das Zentrum (center).',
                        '-nis': 'Examples: das Ergebnis (result), das Zeugnis (report card).'
                    }
                };

                if (genderExamples[currentGender] && genderExamples[currentGender][suffix]) {
                    explanation += ` ${genderExamples[currentGender][suffix]}`;
                }

                rules.push({
                    suffix,
                    gender: currentGender,
                    explanation
                });
            }
        }
    }

    if (rules.length > 0) {
        state.suffixRules = rules;
    } else {
        // Fallback to default
        state.suffixRules = [...defaultSuffixRules];
    }
}

// ==========================================================================
// Dashboard View Renders & Statistics
// ==========================================================================
function renderDecksList() {
    const container = document.getElementById('decks-list-container');
    container.innerHTML = '';

    const deckIds = Object.keys(state.decks);
    
    // Updates dashboard statistics numbers
    let totalCardsCount = 0;
    let masteredCardsCount = 0;
    let reviewCardsCount = 0;

    deckIds.forEach(deckId => {
        const deck = state.decks[deckId];
        totalCardsCount += deck.cards.length;

        // Calculate card statistics from local progress
        deck.cards.forEach(card => {
            const cardId = getCardId(deckId, card);
            const progress = state.cardProgress[cardId];
            if (progress) {
                if (progress.difficulty === 'easy') masteredCardsCount++;
                if (progress.difficulty === 'hard' || progress.difficulty === 'medium') reviewCardsCount++;
            }
        });
        
        // Render Row Card
        const deckRow = document.createElement('div');
        deckRow.className = 'deck-row-card';
        deckRow.innerHTML = `
            <div class="deck-meta-info">
                <span class="deck-lang-pill ${deck.language.toLowerCase()}">${deck.language}</span>
                <h4 class="deck-title">${deck.name}</h4>
                <span class="deck-file-path">${deck.path}</span>
            </div>
            <div class="deck-actions-group">
                <span class="deck-count">${deck.cards.length} cards</span>
                <button class="primary-btn" onclick="startStudySession('${deckId}')">
                    <i class="fa-solid fa-play"></i> Study
                </button>
                <button class="secondary-btn" onclick="startQuizSession('${deckId}')">
                    <i class="fa-solid fa-circle-question"></i> Quiz
                </button>
            </div>
        `;
        container.appendChild(deckRow);
    });

    // Check if we have German suffixes loaded for the special trainer game
    if (state.suffixRules.length > 0) {
        const gameRow = document.createElement('div');
        gameRow.className = 'deck-row-card';
        gameRow.style.borderColor = 'var(--accent-secondary)';
        gameRow.innerHTML = `
            <div class="deck-meta-info">
                <span class="deck-lang-pill deutsch">German rules</span>
                <h4 class="deck-title">Deutsch Suffix-Gender Game</h4>
                <span class="deck-file-path">Minigame parsed from Deutch Gender Learn.md</span>
            </div>
            <div class="deck-actions-group">
                <span class="deck-count">${state.suffixRules.length} rules loaded</span>
                <button class="secondary-btn" style="border-color: var(--accent-secondary); color: var(--accent-secondary);" onclick="startSuffixGame()">
                    <i class="fa-solid fa-gamepad"></i> Play Game
                </button>
            </div>
        `;
        container.insertBefore(gameRow, container.firstChild);
    }

    // Inject Stats numbers into DOM
    document.getElementById('stat-decks-count').textContent = deckIds.length;
    document.getElementById('stat-cards-count').textContent = totalCardsCount;
    document.getElementById('stat-learned-count').textContent = masteredCardsCount;
    document.getElementById('stat-pending-count').textContent = reviewCardsCount || (totalCardsCount - masteredCardsCount);
}

// ==========================================================================
// Spaced Repetition Study Engine (Leitner-based)
// ==========================================================================
function startStudySession(deckId) {
    const deck = state.decks[deckId];
    if (!deck || deck.cards.length === 0) {
        showToast('This deck has no cards!', 'error');
        return;
    }

    state.activeDeckId = deckId;
    
    // Leitner Selection: Sort cards based on historical performance
    // Hard cards first, then Medium, then new, then Easy
    const sortedCards = [...deck.cards].map((card, originalIndex) => {
        const cardId = getCardId(deckId, card);
        const progress = state.cardProgress[cardId] || { difficulty: 'new', score: 2 };
        
        let priority = 2; // Default for new cards
        if (progress.difficulty === 'hard') priority = 0;
        else if (progress.difficulty === 'medium') priority = 1;
        else if (progress.difficulty === 'easy') priority = 3;

        return { card, originalIndex, priority };
    });

    // Sort by priority (ascending, so Hard(0) & Medium(1) first)
    sortedCards.sort((a, b) => a.priority - b.priority);

    // Study sessions will contain all cards in the deck/file
    state.sessionCards = sortedCards.map(item => item.card);
    state.currentSessionIndex = 0;
    state.isCardFlipped = false;

    document.getElementById('study-deck-title').textContent = `Deck: ${deck.name}`;
    switchView('view-study');
    renderSessionCard();
}

function renderSessionCard() {
    if (state.sessionCards.length === 0) return;
    
    const card = state.sessionCards[state.currentSessionIndex];
    const deck = state.decks[state.activeDeckId];
    
    // Elements update
    document.getElementById('study-current-index').textContent = state.currentSessionIndex + 1;
    document.getElementById('study-total-cards').textContent = state.sessionCards.length;
    
    const progressPercent = ((state.currentSessionIndex) / state.sessionCards.length) * 100;
    document.getElementById('study-progress-bar').style.width = `${progressPercent}%`;

    // Setup front card face
    document.getElementById('card-front-word').textContent = card.front;
    document.getElementById('card-front-lang').textContent = deck.language;
    document.getElementById('card-source-file').textContent = deck.path;

    // Setup back card face
    document.getElementById('card-back-translation').textContent = card.back;
    document.getElementById('card-back-lang').textContent = 'Translation';
    
    const detailsContainer = document.getElementById('card-back-details');
    detailsContainer.innerHTML = '';
    
    if (card.details) {
        const detailsP = document.createElement('p');
        detailsP.innerHTML = card.details;
        detailsContainer.appendChild(detailsP);
    }

    // Apply color accents for German genders on front if word starts with der/die/das
    const frontWordLower = card.front.toLowerCase();
    const isGerman = deck.language === 'Deutsch';
    
    // Clean any previous gender styles
    const wordHeader = document.getElementById('card-front-word');
    wordHeader.className = 'card-word';
    
    if (isGerman) {
        if (frontWordLower.startsWith('der ')) {
            wordHeader.classList.add('gender-der-text');
        } else if (frontWordLower.startsWith('die ')) {
            wordHeader.classList.add('gender-die-text');
        } else if (frontWordLower.startsWith('das ')) {
            wordHeader.classList.add('gender-das-text');
        }
    }

    // Set SRS state badge
    const cardId = getCardId(state.activeDeckId, card);
    const progress = state.cardProgress[cardId];
    const badge = document.getElementById('card-status-badge');
    
    if (progress) {
        badge.textContent = progress.difficulty.toUpperCase();
        badge.className = `difficulty-level ${progress.difficulty}`;
    } else {
        badge.textContent = 'NEW CARD';
        badge.className = 'difficulty-level new';
    }

    // Reset card flip states
    state.isCardFlipped = false;
    document.getElementById('flashcard-element').classList.remove('flipped');
    
    // Buttons toggling
    document.getElementById('btn-show-answer').classList.remove('hidden');
    document.getElementById('srs-rating-buttons').classList.add('hidden');

    // Auto-TTS if configured
    if (state.settings.autoTTS) {
        // Delay TTS slightly to allow smooth transition animation to complete
        setTimeout(() => {
            if (state.activeView === 'view-study' && state.currentSessionIndex < state.sessionCards.length) {
                speakActiveCard(true);
            }
        }, 350);
    }
}

function flipCard() {
    if (state.isCardFlipped) return;
    
    state.isCardFlipped = true;
    document.getElementById('flashcard-element').classList.add('flipped');
    
    document.getElementById('btn-show-answer').classList.add('hidden');
    document.getElementById('srs-rating-buttons').classList.remove('hidden');

    // Speech translation automatically if auto TTS is active
    if (state.settings.autoTTS) {
        setTimeout(() => {
            speakActiveCard(false);
        }, 400);
    }
}

function submitSRS(difficulty) {
    const card = state.sessionCards[state.currentSessionIndex];
    const cardId = getCardId(state.activeDeckId, card);

    // Save SRS state locally
    state.cardProgress[cardId] = {
        difficulty: difficulty,
        lastReviewDate: new Date().toISOString(),
        reviewsCount: (state.cardProgress[cardId]?.reviewsCount || 0) + 1
    };

    saveProgress();
    trackStudyActivity(); // Record study date for streak tracking

    // If rated Hard, put it back in the session queue so they see it again
    if (difficulty === 'hard') {
        state.sessionCards.push(card);
    }

    // Progress to next card
    state.currentSessionIndex++;
    if (state.currentSessionIndex < state.sessionCards.length) {
        renderSessionCard();
    } else {
        // Completed Session
        finishStudySession();
    }
}

function finishStudySession() {
    showToast('Session finished! Great job!', 'success');
    updateStreak();
    switchView('view-dashboard');
    renderDecksList();
}

// ==========================================================================
// Quiz Interactive Mode (Multiple-choice)
// ==========================================================================
function startQuizSession(deckId) {
    const deck = state.decks[deckId];
    if (!deck || deck.cards.length === 0) {
        showToast('This deck has no cards to quiz!', 'error');
        return;
    }

    state.activeDeckId = deckId;
    state.quizCards = shuffleArray([...deck.cards]);
    state.quizIndex = 0;
    state.quizScore = { correct: 0, total: 0 };

    document.getElementById('quiz-deck-title').textContent = `Deck: ${deck.name}`;
    switchView('view-quiz');
    loadNextQuizCard();
}

function loadNextQuizCard() {
    // Hide feedback panel
    document.getElementById('quiz-feedback-box').classList.add('hidden');
    
    if (state.quizIndex >= state.quizCards.length) {
        // Quiz completed
        showToast(`Quiz completed! Score: ${state.quizScore.correct}/${state.quizScore.total}`, 'success');
        switchView('view-dashboard');
        renderDecksList();
        return;
    }

    const card = state.quizCards[state.quizIndex];
    const deck = state.decks[state.activeDeckId];

    // Progress bar
    const progressPercent = (state.quizIndex / state.quizCards.length) * 100;
    document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;

    // Elements
    document.getElementById('quiz-question-word').textContent = card.front;
    document.getElementById('quiz-score-correct').textContent = state.quizScore.correct;
    document.getElementById('quiz-score-total').textContent = state.quizIndex;

    // Create Options (1 Correct + 3 Distractors from same deck if possible, else other files)
    const options = [card.back];
    const allDeckBacks = deck.cards.map(c => c.back).filter(b => b !== card.back);
    
    // Shuffle distractors and pick 3
    const shuffledDistractors = shuffleArray(allDeckBacks);
    for (let i = 0; i < Math.min(3, shuffledDistractors.length); i++) {
        options.push(shuffledDistractors[i]);
    }

    // Fill options up to 4 if deck is very small
    while (options.length < Math.min(4, deck.cards.length)) {
        // Add random items
        options.push('Option ' + options.length);
    }

    // Shuffle option buttons
    const shuffledOptions = shuffleArray(options);

    // Render option buttons
    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = opt;
        btn.addEventListener('click', (e) => handleQuizOptionClick(e, opt, card.back));
        optionsContainer.appendChild(btn);
    });

    if (state.settings.autoTTS) {
        speakQuizQuestion();
    }
}

function handleQuizOptionClick(e, chosenVal, correctVal) {
    const buttons = document.querySelectorAll('.quiz-option-btn');
    // Disable all options once clicked
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.innerHTML === correctVal) {
            btn.classList.add('correct');
        }
    });

    const isCorrect = chosenVal === correctVal;
    state.quizScore.total++;

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const feedbackText = document.getElementById('quiz-feedback-text');

    feedbackBox.className = 'quiz-feedback-banner';
    feedbackBox.classList.remove('hidden');

    if (isCorrect) {
        state.quizScore.correct++;
        feedbackBox.classList.add('success');
        feedbackText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Correct!';
        spawnConfetti(e.clientX, e.clientY);
        
        // Log study progress
        trackStudyActivity();
    } else {
        e.target.classList.add('incorrect');
        feedbackBox.classList.add('error');
        feedbackText.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Incorrect. Correct: <strong>${correctVal}</strong>`;
    }

    // Trigger score numbers updates in real-time
    document.getElementById('quiz-score-correct').textContent = state.quizScore.correct;
    document.getElementById('quiz-score-total').textContent = state.quizScore.total;

    state.quizIndex++;
}

// ==========================================================================
// German Suffix Gender Training Game
// ==========================================================================
function startSuffixGame() {
    if (state.suffixRules.length === 0) {
        showToast('German suffix rules could not be loaded.', 'error');
        return;
    }

    state.suffixRules = shuffleArray([...state.suffixRules]);
    state.suffixGameIndex = 0;
    state.suffixGameScore = { correct: 0, total: 0 };

    switchView('view-suffix-game');
    loadNextSuffixRule();
}

function loadNextSuffixRule() {
    // Hide feedback pane
    document.getElementById('suffix-feedback-panel').classList.add('hidden');
    
    // Enable buttons
    const choiceButtons = ['suffix-btn-der', 'suffix-btn-die', 'suffix-btn-das'];
    choiceButtons.forEach(id => {
        const btn = document.getElementById(id);
        btn.disabled = false;
        btn.className = btn.className.split(' ').filter(c => c !== 'correct-ans' && c !== 'incorrect-ans').join(' ');
    });

    if (state.suffixGameIndex >= state.suffixRules.length) {
        showToast(`Suffix Training Complete! Final Score: ${state.suffixGameScore.correct}/${state.suffixGameScore.total}`, 'success');
        switchView('view-dashboard');
        renderDecksList();
        return;
    }

    const rule = state.suffixRules[state.suffixGameIndex];
    document.getElementById('suffix-game-display').textContent = rule.suffix;
    
    // Examples hint helper
    let hint = '';
    if (rule.explanation.includes('Examples:')) {
        const index = rule.explanation.indexOf('Examples:');
        hint = rule.explanation.substring(index);
        // Hide the actual answer (e.g. die, der, das) inside hint
        hint = hint.replace(/die\s/g, '___ ').replace(/der\s/g, '___ ').replace(/das\s/g, '___ ');
    }
    document.getElementById('suffix-game-word-hint').textContent = hint || 'Suffix word ending';

    document.getElementById('suffix-score-correct').textContent = state.suffixGameScore.correct;
    document.getElementById('suffix-score-total').textContent = state.suffixGameIndex;
}

function checkSuffixGuess(guess) {
    const rule = state.suffixRules[state.suffixGameIndex];
    const correctGender = rule.gender; // 'der', 'die', or 'das'

    const buttons = {
        'der': document.getElementById('suffix-btn-der'),
        'die': document.getElementById('suffix-btn-die'),
        'das': document.getElementById('suffix-btn-das')
    };

    // Disable choices
    Object.values(buttons).forEach(btn => btn.disabled = true);

    const isCorrect = guess === correctGender;
    state.suffixGameScore.total++;

    // Apply button styling
    buttons[correctGender].classList.add('correct-ans');

    if (isCorrect) {
        state.suffixGameScore.correct++;
        // Confetti explosion on the correct button
        const rect = buttons[guess].getBoundingClientRect();
        spawnConfetti(rect.left + rect.width/2, rect.top + rect.height/2);
    } else {
        buttons[guess].classList.add('incorrect-ans');
    }

    // Render explanations panel
    const feedbackTitle = document.getElementById('suffix-feedback-title');
    const feedbackDesc = document.getElementById('suffix-feedback-desc');
    const feedbackPane = document.getElementById('suffix-feedback-panel');

    feedbackPane.classList.remove('hidden');
    if (isCorrect) {
        feedbackTitle.textContent = 'Correct!';
        feedbackTitle.style.color = 'var(--color-success)';
    } else {
        feedbackTitle.textContent = 'Incorrect!';
        feedbackTitle.style.color = 'var(--color-danger)';
    }

    feedbackDesc.innerHTML = rule.explanation;

    document.getElementById('suffix-score-correct').textContent = state.suffixGameScore.correct;
    document.getElementById('suffix-score-total').textContent = state.suffixGameScore.total;

    state.suffixGameIndex++;
}

// ==========================================================================
// Text-to-Speech (TTS) Voice Engine
// ==========================================================================
function speakText(text, langCode) {
    if (!window.speechSynthesis) return;
    
    // Stop ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = state.settings.voiceRate;
    
    // Locale mapping table for future language support
    const localesMap = {
        'deutsch': 'de-DE', 'german': 'de-DE', 'deutch': 'de-DE',
        'english': 'en-GB',
        'japanese': 'ja-JP', '日本語': 'ja-JP',
        'spanish': 'es-ES', 'español': 'es-ES', 'spain': 'es-ES',
        'french': 'fr-FR', 'français': 'fr-FR',
        'italian': 'it-IT', 'italiano': 'it-IT',
        'dutch': 'nl-NL', 'nederlands': 'nl-NL',
        'danish': 'da-DK', 'dansk': 'da-DK',
        'portuguese': 'pt-PT', 'português': 'pt-PT',
        'swedish': 'sv-SE', 'svenska': 'sv-SE',
        'norwegian': 'no-NO', 'norsk': 'no-NO',
        'icelandic': 'is-IS', 'íslenska': 'is-IS',
        'chinese': 'zh-CN', '中文': 'zh-CN',
        'korean': 'ko-KR', '한국어': 'ko-KR'
    };

    const cleanLangKey = langCode.toLowerCase().trim();
    let voiceLang = localesMap[cleanLangKey] || 'en-US';

    utterance.lang = voiceLang;

    // Load matching voices list
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(voice => voice.lang.includes(voiceLang) || voice.lang.substring(0,2) === voiceLang.substring(0,2));
    if (matchedVoice) {
        utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
}

function speakActiveCard(isFront) {
    const card = state.sessionCards[state.currentSessionIndex];
    if (!card) return;

    const deck = state.decks[state.activeDeckId];
    if (!deck) return;

    if (isFront) {
        // Speak word using the deck's target language
        // Strip out parenthetical details, e.g. "日本語 (にほんご)" -> read "日本語"
        const cleanTxt = card.front.split('(')[0].trim();
        speakText(cleanTxt, deck.language);
    } else {
        // Speak translation in English (default)
        speakText(card.back, 'English');
    }
}

function speakQuizQuestion() {
    const card = state.quizCards[state.quizIndex];
    const deck = state.decks[state.activeDeckId];
    if (card && deck) {
        speakText(card.front.split('(')[0].trim(), deck.language);
    }
}

// ==========================================================================
// User Profile & LocalStorage State
// ==========================================================================
function loadSettings() {
    const settings = localStorage.getItem('lingoflip_settings');
    if (settings) {
        state.settings = { ...state.settings, ...JSON.parse(settings) };
        document.getElementById('select-voice-rate').value = state.settings.voiceRate;
        document.getElementById('setting-auto-tts').checked = state.settings.autoTTS;
        document.getElementById('setting-shortcuts').checked = state.settings.enableShortcuts;
    }
}

function saveSettings() {
    localStorage.setItem('lingoflip_settings', JSON.stringify(state.settings));
}

function loadProgress() {
    const progress = localStorage.getItem('lingoflip_card_progress');
    if (progress) {
        state.cardProgress = JSON.parse(progress);
    }
}

function saveProgress() {
    localStorage.setItem('lingoflip_card_progress', JSON.stringify(state.cardProgress));
}

// Daily Streak tracking
function updateStreak() {
    let streakVal = localStorage.getItem('lingoflip_streak_count');
    let lastDateStr = localStorage.getItem('lingoflip_last_study_date');

    // Fallback to day_count.js backup if localStorage has no streak data
    if (streakVal === null && typeof window !== 'undefined' && window.LingoFlipStreak) {
        streakVal = window.LingoFlipStreak.streak;
        lastDateStr = window.LingoFlipStreak.lastStudyDate;
        localStorage.setItem('lingoflip_streak_count', streakVal);
        if (lastDateStr) {
            localStorage.setItem('lingoflip_last_study_date', lastDateStr);
        } else {
            localStorage.removeItem('lingoflip_last_study_date');
        }
    }

    state.streak = streakVal ? parseInt(streakVal) : 0;
    state.lastStudyDate = lastDateStr ? new Date(lastDateStr) : null;

    if (state.lastStudyDate) {
        const today = new Date();
        const diffTime = Math.abs(today - state.lastStudyDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            // Streak broken
            state.streak = 0;
            localStorage.setItem('lingoflip_streak_count', 0);
        }
    }
    
    document.getElementById('streak-count').textContent = state.streak;
}

function trackStudyActivity() {
    const today = new Date();
    const todayStr = today.toDateString();
    
    if (!state.lastStudyDate || state.lastStudyDate.toDateString() !== todayStr) {
        if (state.lastStudyDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (state.lastStudyDate.toDateString() === yesterday.toDateString()) {
                // Streak incremented
                state.streak++;
            } else {
                // Streak reset
                state.streak = 1;
            }
        } else {
            // First time studying
            state.streak = 1;
        }

        localStorage.setItem('lingoflip_streak_count', state.streak);
        localStorage.setItem('lingoflip_last_study_date', today.toISOString());
        state.lastStudyDate = today;
        
        document.getElementById('streak-count').textContent = state.streak;
    }
}

function handleResetStats() {
    // Show custom modal instead of native confirm
    const modal = document.getElementById('confirm-modal');
    modal.classList.add('active');
}

function executeResetStats() {
    localStorage.removeItem('lingoflip_card_progress');
    localStorage.removeItem('lingoflip_streak_count');
    localStorage.removeItem('lingoflip_last_study_date');
    
    // Reset in-memory fallback backup streak so it does not immediately override
    if (typeof window !== 'undefined' && window.LingoFlipStreak) {
        window.LingoFlipStreak.streak = 0;
        window.LingoFlipStreak.lastStudyDate = "";
    }
    
    state.cardProgress = {};
    state.streak = 0;
    state.lastStudyDate = null;
    
    // Explicitly set to 0 in localStorage to prevent fallback on next loading
    localStorage.setItem('lingoflip_streak_count', 0);
    
    updateStreak();
    renderDecksList();
    showToast('All progress metrics cleared!', 'info');
}

// Preserve folder selection state when re-opening
function saveLastUploadState() {
    // We cannot store full file paths or content buffers easily in localStorage without sizing errors,
    // so we just notify the user their decks are loaded for this session.
}

// ==========================================================================
// User Interface Transitions & Polish
// ==========================================================================
function switchView(viewId) {
    // Hide active views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active-view');
        view.classList.add('hidden');
    });

    // Show selected view
    const newView = document.getElementById(viewId);
    newView.classList.remove('hidden');
    newView.classList.add('active-view');

    state.activeView = viewId;

    // Show/Hide top header navigation
    const navHomeBtn = document.getElementById('nav-dashboard-btn');
    if (viewId === 'view-upload') {
        navHomeBtn.classList.add('hidden');
    } else {
        navHomeBtn.classList.remove('hidden');
    }
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        state.theme = 'light';
        themeIcon.className = 'fa-solid fa-moon';
        // Funny light mode message
        showToast('Switched to light mode – let the sunshine in! 😎', 'info');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        state.theme = 'dark';
        themeIcon.className = 'fa-solid fa-sun';
        showToast('Switched to dark mode – welcome to the shadows! 🌙', 'info');
    }
}

// Toast message emitter
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    else if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    // Slide out after 3.5s
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
}

// Particle explosion logic
function spawnConfetti(x, y) {
    const container = document.getElementById('particles-container');
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    const particlesCount = 28;

    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random dimensions
        const size = Math.random() * 8 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Place particle at client coordinates
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Form random velocities in 360 degrees
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 120 + 60;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;

        particle.style.setProperty('--x', `${velocityX}px`);
        particle.style.setProperty('--y', `${velocityY}px`);
        
        // Animation specs
        particle.style.animationDuration = `${Math.random() * 0.6 + 0.6}s`;
        
        container.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
    }
}

// Keyboard navigation listener
function handleKeyDown(e) {
    if (!state.settings.enableShortcuts) return;

    // Study shortcuts
    if (state.activeView === 'view-study' && state.sessionCards.length > 0) {
        if (e.code === 'Space') {
            e.preventDefault(); // Stop page scrolling
            if (!state.isCardFlipped) {
                flipCard();
            }
        } else if (state.isCardFlipped) {
            if (e.key === '1') {
                submitSRS('hard');
            } else if (e.key === '2') {
                submitSRS('medium');
            } else if (e.key === '3') {
                // Emulate mouse coordinates on the master button to fire confetti
                const rect = document.getElementById('btn-rate-easy').getBoundingClientRect();
                spawnConfetti(rect.left + rect.width/2, rect.top + rect.height/2);
                submitSRS('easy');
            }
        }
    }
}

// --- General Helpers ---
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getCardId(deckId, card) {
    // Generate unique card reference
    return `${deckId}_${card.front.replace(/\s+/g, '_')}`;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
