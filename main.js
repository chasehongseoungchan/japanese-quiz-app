// main.js 파일 전체 내용

const quizzes = {
    'hiragana': { '아': '아', '이': '이', '우': '우', '에': '에', '오': '오', '카': '카', '키': '키', '쿠': '쿠', '케': '케', '코': '코', '사': '사', '시': '시', '스': '스', '세': '세', '소': '소', '타': '타', '치': '치', '츠': '츠', '테': '테', '토': '토', '나': '나', '니': '니', '누': '누', '네': '네', '노': '노', '하': '하', '히': '히', '후': '후', '헤': '헤', '호': '호', '마': '마', '미': '미', '무': '무', '메': '메', '모': '모', '야': '야', '유': '유', '요': '요', '라': '라', '리': '리', '루': '루', '레': '레', '로': '로', '와': '와', '을': '오', '응': '응' },
    'katakana': {
        'ア': '아','イ': '이','ウ': '우','エ': '에','オ': '오',
        'カ': '카','キ': '키','ク': '쿠','ケ': '케','コ': '코',
        'サ': '사','シ': '시','ス': '스','セ': '세','ソ': '소',
        'タ': '타','チ': '치','ツ': '츠','テ': '테','ト': '토',
        'ナ': '나','ニ': '니','ヌ': '누','ネ': '네','ノ': '노',
        'ハ': '하','ヒ': '히','フ': '후','ヘ': '헤','ホ': '호',
        'マ': '마','ミ': '미','ム': '무','メ': '메','モ': '모',
        'ヤ': '야','ユ': '유','ヨ': '요',
        'ラ': '라','リ': '리','ル': '루','レ': '레','ロ': '로',
        'ワ': '와','ヲ': '오','ン': '응'
    }
};

let currentQuizType = "";
let currentGameMode = "";
let currentPronunciationMode = "japanese_to_pronunciation";
let currentChar = "";
let score = 0;
let totalQuestions = 0;
let unseenChars = [];
let wrongChars = [];
let isReviewMode = false;
// 추가: 정답으로 채워진 문자만 기록
let filledMap = {};

// =========================================================================================
// [핵심 기능] 드래그 모드 관련 데이터
// =========================================================================================

const KATAKANA_GRID_LAYOUT = [
    { label: '아', cells: ['ア','イ','ウ','エ','オ'] },   
    { label: '카', cells: ['カ','キ','ク','ケ','コ'] },
    { label: '사', cells: ['サ','シ','ス','セ','ソ'] },
    { label: '타', cells: ['タ','チ','ツ','テ','ト'] },
    { label: '나', cells: ['ナ','ニ','ヌ','ネ','ノ'] },
    { label: '하', cells: ['ハ','ヒ','フ','ヘ','ホ'] },
    { label: '마', cells: ['マ','ミ','ム','メ','モ'] },
    { label: '야', cells: ['ヤ','','ユ','','ヨ'] },     
    { label: '라', cells: ['ラ','リ','ル','レ','ロ'] },
    { label: '와', cells: ['ワ','','','','ヲ'] },
    { label: '응', cells: ['ン','','','',''] } 
];
const PRONUNCIATION_HEADERS = ['아 단', '이 단', '우 단', '에 단', '오 단'];

// =========================================================================================
// [유틸리티 및 흐름 함수]
// =========================================================================================

function navigate(renderFunction) {
    const mainContent = document.getElementById('main_content');
    mainContent.classList.add('fade-out');
    setTimeout(() => {
        renderFunction();
        mainContent.classList.remove('fade-out');
    }, 150);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function sample(array, count) {
    const shuffled = [...array]; shuffle(shuffled); return shuffled.slice(0, count);
}

// =========================================================================================
// [UI 렌더링 함수]
// =========================================================================================

function renderMenu() {
    document.body.className = '';
    const mainContent = document.getElementById('main_content');
    const modeText = currentPronunciationMode === "japanese_to_pronunciation" ? "일본어 → 발음" : "발음 → 일본어";
    mainContent.innerHTML = `
        <div class="screen-container">
            <div class="app-icon">あ</div>
            <h1 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">원하는 퀴즈를 선택하세요</h1>
            <p style="font-size: 1.125rem; color: #6c757d; margin-bottom: 1.5rem;">현재 모드: ${modeText}</p>
            <div class="menu-buttons">
                <button onclick="navigate(() => showGameModeMenu('hiragana'))" class="quiz-button">히라가나</button>
                <button onclick="navigate(() => showGameModeMenu('katakana'))" class="quiz-button">가타카나</button>
                <button onclick="switchPronunciationMode()" class="quiz-button" style="margin-top: 1rem; background-color: var(--button-hover-bg-color);">모드 전환</button>
            </div>
        </div>`;
}

function showGameModeMenu(quizType) {
    currentQuizType = quizType;
    const mainContent = document.getElementById('main_content');
    const quizTypeText = {hiragana: "히라가나", katakana: "가타카나"}[quizType];

    const dragButton = quizType === 'katakana' ? `
        <button onclick="navigate(() => startQuiz('drag'))" class="quiz-button">표 채우기 (드래그)</button>
    ` : '';

    mainContent.innerHTML = `
        <div class="screen-container">
            <button onclick="navigate(renderMenu)" class="top-bar-button" style="position:absolute; top: calc(1rem + env(safe-area-inset-top, 0px)); left: calc(1rem + env(safe-area-inset-left, 0px));">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">${quizTypeText} 학습 방식을 선택하세요</h1>
            <div class="menu-buttons">
                ${dragButton}
                <button onclick="navigate(() => startQuiz('flashcard'))" class="quiz-button">플래시카드 (객관식)</button>
                <button onclick="navigate(() => startQuiz('typing'))" class="quiz-button">타이핑 (주관식)</button>
            </div>
        </div>`;
}

function showQuizUI() {
    const mainContent = document.getElementById('main_content');
    const isTypingMode = currentGameMode === 'typing';
    const isDragMode = currentGameMode === 'drag';

    let quizInteractionHTML = '';
    if (isTypingMode) {
        quizInteractionHTML = `
            <div class="typing-interaction-wrapper">
                <button type="button" id="skip-btn-main" class="quiz-button" onclick="handleSkip()">모르겠음</button>
                <div class="typing-container">
                    <form id="typing-form" onsubmit="checkTypingAnswer(); return false;" class="typing-form-wrapper">
                        <input type="text" id="answer-input" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="발음을 입력하세요">
                        <button type="submit" id="submit-answer-btn">확인</button>
                    </form>
                </div>
            </div>
        `;
        document.body.className = 'typing-mode';
    } else if (isDragMode) {
        quizInteractionHTML = `
            <div class="drag-interaction-wrapper">
                <div id="drag_grid_container">
                    <div id="drag_grid" class="drag-grid"></div>
                </div>
                <div class="drag-container">
                    <div id="draggable_kana" class="draggable-kana" draggable="true" aria-grabbed="false"></div>
                </div>
            </div>
        `;
        document.body.className = 'drag-mode';
    } else {
        quizInteractionHTML = `<div class="buttons-grid"></div>`;
        document.body.className = 'flashcard-mode';
    }

    mainContent.innerHTML = `
        <div id="main_box" class="main-container">
            <div class="top-bar">
                <button onclick="navigate(renderMenu)" class="top-bar-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span id="mode_label" style="font-size: 1.25rem; font-weight: 600;"></span>
                <span id="score_label" style="font-size: 1.5rem; font-weight: bold;">✅ 0</span>
            </div>
            <div class="question-box"><div id="question_content"></div></div>
            ${quizInteractionHTML}
        </div>`;
}

function showResultsScreen() {
    document.body.className = '';
    const mainContent = document.getElementById('main_content');
    const resultMessage = `${totalQuestions}개 중 ${score}개 정답!`;

    mainContent.innerHTML = `
        <div class="screen-container">
            <div class="app-icon">📊</div>
            <h1 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">퀴즈 결과</h1>
            <p style="font-size: 1.5rem; color: #6c757d; margin-bottom: 2rem;">${resultMessage}</p>
            <div class="menu-buttons">
                <button onclick="navigate(startReviewQuiz)" class="quiz-button">오답 노트 시작하기 (${wrongChars.length}개)</button>
                <button onclick="navigate(() => startQuiz(currentGameMode))" class="quiz-button">다시 문제풀기</button>
                <button onclick="navigate(renderMenu)" class="quiz-button" style="background-color: var(--button-hover-bg-color);">메인 메뉴로</button>
            </div>
        </div>`;
}

function showCompletionScreen() {
    document.body.className = '';
    const mainContent = document.getElementById('main_content');
    mainContent.innerHTML = `
        <div class="screen-container">
            <div class="app-icon">🎉</div>
            <h1 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">퀴즈 완료!</h1>
            <p style="font-size: 1.125rem; color: #6c757d; margin-bottom: 1.5rem;">모든 문제를 완벽하게 학습했습니다!</p>
            <div class="menu-buttons">
                <button onclick="navigate(renderMenu)" class="quiz-button">메인 메뉴로 돌아가기</button>
            </div>
        </div>`;
}

// =========================================================================================
// [퀴즈 흐름 함수]
// =========================================================================================

function startQuiz(gameMode) {
    currentGameMode = gameMode;
    score = 0;
    
    if (currentGameMode === 'drag') {
        unseenChars = KATAKANA_GRID_LAYOUT.flatMap(row => row.cells.filter(c => c !== ''));
        shuffle(unseenChars);
        totalQuestions = unseenChars.length;
        // 새 드래그 퀴즈 시작 시 정답 기록 초기화
        filledMap = {};
    } else {
        const quizData = quizzes[currentQuizType];
        unseenChars = Object.keys(quizData);
        totalQuestions = unseenChars.length;
        shuffle(unseenChars);
    }
    
    wrongChars = [];
    isReviewMode = false;
    
    showQuizUI();
    updateModeLabel();
    nextQuestion();
}

function startReviewQuiz() {
    isReviewMode = true;
    unseenChars = [...new Set(wrongChars)];
    wrongChars = [];
    shuffle(unseenChars);
    
    showQuizUI();
    updateModeLabel();
    nextQuestion();
}

function nextQuestion() {
    if (unseenChars.length === 0) {
        if (wrongChars.length > 0) {
            if (isReviewMode) {
                startReviewQuiz();
            } else {
                showResultsScreen();
            }
        } else {
            showCompletionScreen();
        }
        return;
    }
    
    currentChar = unseenChars.shift();
    const quizData = quizzes[currentQuizType];
    
    const questionContent = document.getElementById('question_content');
    const interactionArea = document.querySelector('.typing-interaction-wrapper, .buttons-grid, .drag-interaction-wrapper');
    if (interactionArea) {
        interactionArea.style.display = '';
    }

    if (currentGameMode === 'drag') {
        questionContent.innerHTML = ``; 
        setupDragMode();
    } else {
        let questionText = (currentPronunciationMode === "japanese_to_pronunciation") ? currentChar : quizData[currentChar];
        questionContent.innerHTML = `<span class="question-label">${questionText}</span>`;
        
        const questionBox = document.querySelector('.question-box');
        if (questionBox) questionBox.style.display = 'flex';
        
        if (currentGameMode === 'flashcard') {
            setupFlashcardOptions();
        } else {
            setupTypingInput();
        }
    }

    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 50);
}

// =========================================================================================
// [드래그 로직 함수] (최종 FIX)
// =========================================================================================

function setupDragMode() {
    if (currentQuizType !== 'katakana') {
        alert('드래그 모드는 현재 가타카나만 지원합니다.');
        navigate(() => showGameModeMenu('katakana'));
        return;
    }
    
    const questionBox = document.querySelector('.question-box');
    if (questionBox) questionBox.style.display = 'none';

    const draggable = document.getElementById('draggable_kana');
    const dragGridContainer = document.getElementById('drag_grid_container');
    
    const oldGrid = document.getElementById('drag_grid');
    if (oldGrid) oldGrid.remove();
    
    const grid = document.createElement('div');
    grid.id = 'drag_grid';
    grid.className = 'drag-grid';
    if (dragGridContainer) dragGridContainer.appendChild(grid);

    // small helper: auto-scroll the grid container when pointer/touch near edges
    const SCROLL_MARGIN = 80; // px from top/bottom to start auto-scroll
    const MAX_SPEED = 18; // px per tick
    function autoScrollPointer(clientY) {
        if (!dragGridContainer) return;
        const rect = dragGridContainer.getBoundingClientRect();
        // 1) 내부 컨테이너 스크롤 우선
        if (clientY < rect.top + SCROLL_MARGIN) {
            const pct = Math.max(0, (SCROLL_MARGIN - (clientY - rect.top)) / SCROLL_MARGIN);
            dragGridContainer.scrollBy(0, -Math.ceil(MAX_SPEED * pct));
        } else if (clientY > rect.bottom - SCROLL_MARGIN) {
            const pct = Math.max(0, (clientY - (rect.bottom - SCROLL_MARGIN)) / SCROLL_MARGIN);
            dragGridContainer.scrollBy(0, Math.ceil(MAX_SPEED * pct));
        }
        // 2) 내부 컨테이너가 더 이상 스크롤할 수 없으면 페이지(윈도우) 스크롤로 보완
        const atTop = dragGridContainer.scrollTop <= 0;
        const atBottom = dragGridContainer.scrollTop + dragGridContainer.clientHeight >= dragGridContainer.scrollHeight - 1;
        if (clientY < rect.top + SCROLL_MARGIN && atTop) {
            const pct = Math.max(0, (SCROLL_MARGIN - (clientY - rect.top)) / SCROLL_MARGIN);
            window.scrollBy({ top: -Math.ceil(MAX_SPEED * pct), behavior: 'auto' });
        } else if (clientY > rect.bottom - SCROLL_MARGIN && atBottom) {
            const pct = Math.max(0, (clientY - (rect.bottom - SCROLL_MARGIN)) / SCROLL_MARGIN);
            window.scrollBy({ top: Math.ceil(MAX_SPEED * pct), behavior: 'auto' });
        }
    }

    // Show current draggable kana
    draggable.textContent = currentChar;
    draggable.className = 'draggable-kana quiz-button';
    draggable.setAttribute('draggable', 'true');
    draggable.classList.remove('incorrect', 'correct', 'shake'); 

    // 1. Header row (가로축: 단)
    const headerRow = document.createElement('div');
    headerRow.className = 'grid-row header-row';
    const emptyCorner = document.createElement('div');
    emptyCorner.className = 'row-label header-corner';
    headerRow.appendChild(emptyCorner);
    PRONUNCIATION_HEADERS.forEach(ch => {
        const h = document.createElement('div');
        h.className = 'col-header';
        h.textContent = ch;
        headerRow.appendChild(h);
    });
    grid.appendChild(headerRow);

    // 2. Table rows (세로축: 행)
    // 현재 출제해야 할 문자를 제외하고 이미 정답 처리된 문자를 확인하기 위해 전체 문자를 사용합니다.
    const ALL_KANA = KATAKANA_GRID_LAYOUT.flatMap(row => row.cells.filter(c => c !== ''));

    KATAKANA_GRID_LAYOUT.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'grid-row';

        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = row.label; 
        rowEl.appendChild(label);

        row.cells.forEach(expectedKana => {
             const cell = document.createElement('div');
             cell.className = 'drop-cell';
             
             if (!expectedKana) {
                 cell.classList.add('empty-cell');
                 cell.dataset.expected = '';
                 cell.setAttribute('aria-disabled', 'true');
             } else {
                 cell.dataset.expected = expectedKana; 
                 
                 // Prefill only if the kana was actually answered (filledMap), not just removed from unseenChars.
                 if (filledMap && filledMap[expectedKana]) {
                     cell.textContent = expectedKana;
                     cell.classList.add('correct');
                     cell.style.pointerEvents = 'none';
                 } else {
                     cell.textContent = '';
                     cell.classList.remove('correct');
                     cell.style.pointerEvents = 'auto';
                 }
                 
                 cell.addEventListener('dragover', e => { 
                     e.preventDefault(); 
                     cell.classList.add('drag-over'); 
                     // auto-scroll on native dragover (mouse)
                     if (e.clientY) autoScrollPointer(e.clientY);
                });
                 cell.addEventListener('dragleave', e => { cell.classList.remove('drag-over'); });
                 cell.addEventListener('drop', e => {
                     e.preventDefault();
                     cell.classList.remove('drag-over');
                     const draggedChar = e.dataTransfer.getData('text/plain');
                     handleDragDrop(draggedChar, cell);
                 });
             }
             rowEl.appendChild(cell);
         });

        grid.appendChild(rowEl);
    });

    // -------------------------------------------------------------
    // 드래그/터치 이벤트 리스너 재부착 (수정 없음)
    // -------------------------------------------------------------

    // Desktop drag start / end: attach auto-scroll handler on mousemove
    try { draggable.removeEventListener('dragstart', draggable._dragStartHandler); } catch(e){}
    try { draggable.removeEventListener('dragend', draggable._dragEndHandler); } catch(e){}

    draggable._dragStartHandler = function (e) {
        e.dataTransfer.setData('text/plain', currentChar);
        draggable.setAttribute('aria-grabbed', 'true');
        // start auto-scroll listening while dragging with mouse
        window._autoScrollMouseHandler = function (ev) { autoScrollPointer(ev.clientY); };
        window.addEventListener('mousemove', window._autoScrollMouseHandler);
    };
    draggable._dragEndHandler = function (e) {
        draggable.setAttribute('aria-grabbed', 'false');
        // remove auto-scroll listener
        try { window.removeEventListener('mousemove', window._autoScrollMouseHandler); } catch(err){}
        delete window._autoScrollMouseHandler;
    };
    draggable.addEventListener('dragstart', draggable._dragStartHandler);
    draggable.addEventListener('dragend', draggable._dragEndHandler);
    
    /* Touch support */
    let touchClone = null;
    let touchDragging = false;

    function onTouchStart(ev) {
        if (ev.target !== draggable) return; 
        ev.preventDefault();
        touchDragging = true;
        const t = ev.touches[0];
        touchClone = draggable.cloneNode(true);
        touchClone.style.position = 'fixed';
        touchClone.style.left = (t.clientX - touchClone.offsetWidth / 2) + 'px';
        touchClone.style.top = (t.clientY - touchClone.offsetHeight / 2) + 'px';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.opacity = '0.95';
        touchClone.classList.add('dragging-clone');
        document.body.appendChild(touchClone);
    }
    function onTouchMove(ev) {
        if (!touchDragging || !touchClone) return;
        const t = ev.touches[0];
        touchClone.style.left = (t.clientX - touchClone.offsetWidth / 2) + 'px';
        touchClone.style.top = (t.clientY - touchClone.offsetHeight / 2) + 'px';
        const el = document.elementFromPoint(t.clientX, t.clientY);
        document.querySelectorAll('.drop-cell').forEach(c => c.classList.remove('drag-over'));
        // auto-scroll while moving touch near edges
        autoScrollPointer(t.clientY);
        if (el) {
            const cell = el.closest('.drop-cell');
            if (cell && cell.dataset.expected && cell.textContent === '') cell.classList.add('drag-over');
        }
    }
    function onTouchEnd(ev) {
        if (!touchDragging) return;
        touchDragging = false;
        const t = ev.changedTouches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        let cell = null;
        if (el) cell = el.closest('.drop-cell');
        if (touchClone) { touchClone.remove(); touchClone = null; }
        document.querySelectorAll('.drop-cell').forEach(c => c.classList.remove('drag-over'));
        
        if (cell && cell.dataset.expected && cell.textContent === '') {
            handleDragDrop(currentChar, cell);
        } else {
            draggable.classList.add('incorrect');
            setTimeout(() => draggable.classList.remove('incorrect'), 350);
        }
    }

    try { draggable.removeEventListener('touchstart', draggable._touchStartHandler); } catch(e){}
    try { window.removeEventListener('touchmove', draggable._touchMoveHandler); } catch(e){}
    try { window.removeEventListener('touchend', draggable._touchEndHandler); } catch(e){}

    draggable._touchStartHandler = onTouchStart;
    draggable._touchMoveHandler = onTouchMove;
    draggable._touchEndHandler = onTouchEnd;

    draggable.addEventListener('touchstart', draggable._touchStartHandler, {passive:false});
    window.addEventListener('touchmove', draggable._touchMoveHandler, {passive:false});
    window.addEventListener('touchend', draggable._touchEndHandler, {passive:false});
}

function handleDragDrop(draggedChar, cell) {
    const expectedKana = cell.dataset.expected || '';
    if (!expectedKana || cell.textContent !== '') return;

    const draggable = document.getElementById('draggable_kana');

    if (draggedChar === expectedKana) {
        if (!isReviewMode) score++;
        document.getElementById('score_label').textContent = `✅ ${score}`;
        
        // mark kana as filled so grid rendering keeps it
        filledMap[expectedKana] = true;
        
        cell.classList.add('correct');
        cell.textContent = expectedKana;
        cell.style.pointerEvents = 'none';

        if (draggable) draggable.classList.add('correct');

        setTimeout(() => {
            cell.classList.remove('correct');
            showAnswerAndProceed(false, true);
        }, 600);
    } else {
        if (!wrongChars.includes(currentChar)) wrongChars.push(currentChar);
        
        cell.classList.add('incorrect');
        if (draggable) {
            draggable.classList.add('incorrect');
            draggable.classList.add('shake');
        }

        setTimeout(() => {
            cell.classList.remove('incorrect');
            if (draggable) {
                draggable.classList.remove('incorrect');
                draggable.classList.remove('shake');
            }
        }, 600);
    }
}

// =========================================================================================
// [기타 기능 함수] (수정 없음)
// =========================================================================================

function setupFlashcardOptions() {
    const quizData = quizzes[currentQuizType];
    const correctAnswer = (currentPronunciationMode === "japanese_to_pronunciation") ? quizData[currentChar] : currentChar;
    const allOptions = (currentPronunciationMode === "japanese_to_pronunciation") ? Object.values(quizData) : Object.keys(quizData);

    const incorrectOptions = allOptions.filter(opt => opt !== correctAnswer);
    const incorrectAnswers = sample(incorrectOptions, 3);
    const answerOptions = [...incorrectAnswers, correctAnswer];
    shuffle(answerOptions);
    
    const buttonsGrid = document.querySelector('.buttons-grid');
    if (!buttonsGrid) return;
    buttonsGrid.innerHTML = '';

    answerOptions.forEach(optionText => {
        const button = document.createElement('button');
        button.className = 'quiz-button';
        button.textContent = optionText;
        button.onclick = () => checkFlashcardAnswer(button);
        buttonsGrid.appendChild(button);
    });
    
    const questionBox = document.querySelector('.question-box');
    if (questionBox) questionBox.style.display = 'flex';
}

function checkFlashcardAnswer(button) {
    const userAnswer = button.textContent;
    const quizData = quizzes[currentQuizType];
    const correctAnswer = (currentPronunciationMode === "japanese_to_pronunciation") ? quizData[currentChar] : currentChar;

    if (userAnswer === correctAnswer) {
        if (!isReviewMode) score++;
        button.classList.add('correct');
    } else {
        if (!wrongChars.includes(currentChar)) wrongChars.push(currentChar);
        document.querySelectorAll('.buttons-grid .quiz-button').forEach(btn => {
            if (btn.textContent === correctAnswer) btn.classList.add('correct');
        });
        button.classList.add('incorrect');
    }
    showAnswerAndProceed();
}

function checkTypingAnswer() {
    const input = document.getElementById('answer-input');
    input.blur();

    const userAnswer = input.value.trim();
    const quizData = quizzes[currentQuizType];
    const correctAnswer = (currentPronunciationMode === "japanese_to_pronunciation") ? quizData[currentChar] : (currentPronunciationMode === "pronunciation_to_japanese" ? currentChar : quizData[currentChar]);

    if (userAnswer === correctAnswer) {
        if (!isReviewMode) score++;
        document.getElementById('score_label').textContent = `✅ ${score}`;
        input.classList.add('correct');
        input.disabled = true;
        setTimeout(nextQuestion, 300);
    } else {
        if (!wrongChars.includes(currentChar)) wrongChars.push(currentChar);
        input.classList.add('incorrect');
        setTimeout(() => {
            input.classList.remove('incorrect');
            nextQuestion();
        }, 500);
    }
}

function showAnswerAndProceed(isSkipped = false, isDragMode = false) {
    if (!isReviewMode) {
         document.getElementById('score_label').textContent = `✅ ${score}`;
    }
    const quizData = quizzes[currentQuizType];
    const japaneseChar = currentChar;
    const pronunciation = quizData[japaneseChar];
    
    if (!isDragMode) {
        document.getElementById('question_content').innerHTML = `
            <div class="answered-content">
                <div class="answered-char">${japaneseChar}</div>
                <div class="answered-pronunciation">${pronunciation}</div>
            </div>`;
    }
    
    if (currentGameMode === 'drag') {
         const draggable = document.getElementById('draggable_kana');
         if (draggable) draggable.classList.remove('correct', 'incorrect');
         setTimeout(nextQuestion, isSkipped ? 1200 : 800);
         return;
    }

    const interactionArea = document.querySelector('.typing-interaction-wrapper, .buttons-grid');
    if (interactionArea) {
        interactionArea.style.display = 'none';
    }

    setTimeout(nextQuestion, isSkipped ? 1200 : 800);
}

function switchPronunciationMode() {
    currentPronunciationMode = currentPronunciationMode === "japanese_to_pronunciation" ? "pronunciation_to_japanese" : "japanese_to_pronunciation";
    navigate(renderMenu);
}

function updateModeLabel() {
    const modeLabel = document.getElementById('mode_label');
    let text = "";
    if (currentGameMode === 'typing') {
         text = currentPronunciationMode === "japanese_to_pronunciation" ? "타이핑 (일→발)" : "타이핑 (발→일)";
    } else if (currentGameMode === 'drag') {
         text = "표 채우기 (가타카나)";
    } else {
         text = currentPronunciationMode === "japanese_to_pronunciation" ? "객관식 (일→발)" : "객관식 (발→일)";
    }
    
    if (isReviewMode) {
        text += " (오답 노트)";
        document.getElementById('score_label').style.visibility = 'hidden';
    } else {
         document.getElementById('score_label').style.visibility = 'visible';
         document.getElementById('score_label').textContent = `✅ ${score}`;
    }
    
    modeLabel.textContent = text;
}

function setupTypingInput() {
    const input = document.getElementById('answer-input');
    if (!input) return;

    input.value = '';
    input.disabled = false;
    input.className = '';

    setTimeout(() => {
        input.focus();
        window.scrollTo(0, 0);
    }, 150);
}

function handleSkip() {
    if (!wrongChars.includes(currentChar)) {
        wrongChars.push(currentChar);
    }
    showAnswerAndProceed(true);
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        renderMenu();
    } catch (err) {
        console.error('Failed to render menu:', err);
    }
});
