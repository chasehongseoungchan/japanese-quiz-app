const quizzes = {
    'hiragana': { 'あ': '아', 'い': '이', 'う': '우', 'え': '에', 'お': '오', 'か': '카', 'き': '키', 'く': '쿠', 'け': '케', 'こ': '코', 'さ': '사', 'し': '시', 'す': '스', 'せ': '세', 'そ': '소', 'た': '타', 'ち': '치', 'つ': '츠', 'て': '테', 'と': '토', 'な': '나', 'に': '니', 'ぬ': '누', 'ね': '네', 'の': '노', 'は': '하', 'ひ': '히', 'ふ': '후', 'へ': '헤', 'ほ': '호', 'ま': '마', 'み': '미', 'む': '무', 'め': '메', 'も': '모', 'や': '야', 'ゆ': '유', 'よ': '요', 'ら': '라', 'り': '리', 'る': '루', 'れ': '레', 'ろ': '로', 'わ': '와', 'を': '오', 'ん': '응' },
    'katakana': { 'ア': '아', 'イ': '이', 'ウ': '우', 'エ': '에', 'オ': '오', 'カ': '카', 'キ': '키', 'ク': '쿠', 'ケ': '케', 'コ': '코', 'サ': '사', 'シ': '시', 'ス': '스', 'セ': '세', 'ソ': '소', 'タ': '타', 'チ': '치', 'ツ': '츠', 'テ': '테', 'ト': '토', 'ナ': '나', 'ニ': '니', 'ヌ': '누', 'ネ': '네', 'ノ': '노', 'ハ': '하', 'ヒ': '히', 'フ': '후', 'ヘ': '헤', 'ホ': '호', 'マ': '마', 'ミ': '미', 'ム': '무', 'メ': '메', 'モ': '모', 'ヤ': '야', 'ユ': '유', 'ヨ': '요', 'ラ': '라', 'リ': '리', 'ル': '루', 'レ': '레', 'ロ': '로', 'ワ': '와', 'ヲ': '오', 'ン': '응' },
    'advanced': { 'が': '가', 'ぎ': '기', 'ぐ': '구', 'げ': '게', 'ご': '고', 'ざ': '자', 'じ': '지', 'ず': '즈', 'ぜ': '제', 'ぞ': '조', 'だ': '다', 'ぢ': '지', 'づ': '즈', 'で': '데', 'ど': '도', 'ば': '바', 'び': '비', 'ぶ': '부', 'べ': '베', 'ぼ': '보', 'ぱ': '파', 'ぴ': '피', 'ぷ': '푸', 'ぺ': '페', 'ぽ': '포', 'きゃ': '캬', 'きゅ': '큐', 'きょ': '쿄', 'しゃ': '샤', 'しゅ': '슈', 'しょ': '쇼', 'ちゃ': '챠', 'ちゅ': '츄', 'ちょ': '쵸', 'にゃ': '냐', 'にゅ': '뉴', 'にょ': '뇨', 'ひゃ': '햐', 'ひゅ': '휴', 'ひょ': '효', 'みゃ': '먀', 'みゅ': '뮤', 'みょ': '묘', 'りゃ': '랴', 'りゅ': '류', 'りょ': '료', 'っ': '촉음', 'ー': '장음' }
};

let currentQuizType = "";
let currentGameMode = "";
let currentPronunciationMode = "japanese_to_pronunciation";
let currentChar = "";
let score = 0;
let totalQuestions = 0;
let unseenChars = [];
let wrongChars = []; // 오답 기록 배열
let isReviewMode = false; // 오답 노트 모드 플래그

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
                <button onclick="navigate(() => showGameModeMenu('advanced'))" class="quiz-button">탁음, 요음, 촉음 등</button>
                <button onclick="switchPronunciationMode()" class="quiz-button" style="margin-top: 1rem; background-color: #e9ecef;">모드 전환</button>
            </div>
        </div>`;
}

function showGameModeMenu(quizType) {
    currentQuizType = quizType;
    const mainContent = document.getElementById('main_content');
    const quizTypeText = {hiragana: "히라가나", katakana: "가타카나", advanced: "탁음 등"}[quizType];

    mainContent.innerHTML = `
        <div class="screen-container">
            <button onclick="navigate(renderMenu)" class="top-bar-button" style="position:absolute; top: calc(1rem + env(safe-area-inset-top, 0px)); left: calc(1rem + env(safe-area-inset-left, 0px));">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">${quizTypeText} 학습 방식을 선택하세요</h1>
            <div class="menu-buttons">
                <button onclick="navigate(() => startQuiz('flashcard'))" class="quiz-button">플래시카드 (객관식)</button>
                <button onclick="navigate(() => startQuiz('typing'))" class="quiz-button">타이핑 (주관식)</button>
            </div>
        </div>`;
}

function showQuizUI() {
    const mainContent = document.getElementById('main_content');
    const isTypingMode = currentGameMode === 'typing';

    const quizInteractionHTML = isTypingMode ? `
        <div class="typing-interaction-wrapper">
            <button type="button" id="skip-btn-main" class="quiz-button" onclick="handleSkip()">모르겠음</button>
            <div class="typing-container">
                <form id="typing-form" onsubmit="checkTypingAnswer(); return false;" class="typing-form-wrapper">
                    <input type="text" id="answer-input" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="발음을 입력하세요">
                    <button type="submit" id="submit-answer-btn">확인</button>
                </form>
            </div>
        </div>
    ` : `
        <div class="buttons-grid"></div>
    `;

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
                <button onclick="navigate(renderMenu)" class="quiz-button" style="background-color: #e9ecef;">메인 메뉴로</button>
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

function startQuiz(gameMode) {
    document.body.className = gameMode === 'typing' ? 'typing-mode' : 'flashcard-mode';
    currentGameMode = gameMode;
    score = 0;
    
    const quizData = quizzes[currentQuizType];
    unseenChars = Object.keys(quizData);
    totalQuestions = unseenChars.length;
    shuffle(unseenChars);
    
    wrongChars = [];
    isReviewMode = false;
    
    showQuizUI();
    updateModeLabel();
    nextQuestion();
}

function startReviewQuiz() {
    isReviewMode = true;
    unseenChars = [...new Set(wrongChars)]; // 중복 제거
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
                startReviewQuiz(); // 오답 노트에서 또 틀리면 다시 오답 노트 시작
            } else {
                showResultsScreen(); // 첫 사이클 끝나고 틀린게 있으면 결과 화면
            }
        } else {
            showCompletionScreen(); // 틀린게 하나도 없으면 최종 완료
        }
        return;
    }
    
    currentChar = unseenChars.shift();
    const quizData = quizzes[currentQuizType];
    let questionText = (currentPronunciationMode === "japanese_to_pronunciation") ? currentChar : quizData[currentChar];
    
    const questionContent = document.getElementById('question_content');
    questionContent.innerHTML = `<span class="question-label">${questionText}</span>`;

    // ✅ FIX: 입력창 사라지는 버그 해결
    const interactionArea = document.querySelector('.typing-interaction-wrapper, .buttons-grid');
    if (interactionArea) {
        interactionArea.style.display = ''; // display 속성 초기화
    }

    // 모든 모드에서 항상 스크롤을 맨 위로 이동
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 50);

    if (currentGameMode === 'flashcard') {
        setupFlashcardOptions();
    } else {
        setupTypingInput();
    }
}

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
    wrongChars.push(currentChar);
    showAnswerAndProceed(true); // isSkipped = true
}

function checkFlashcardAnswer(button) {
    const userAnswer = button.textContent;
    const quizData = quizzes[currentQuizType];
    const correctAnswer = (currentPronunciationMode === "japanese_to_pronunciation") ? quizData[currentChar] : currentChar;

    if (userAnswer === correctAnswer) {
        if (!isReviewMode) score++;
        button.classList.add('correct');
    } else {
        wrongChars.push(currentChar);
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
        wrongChars.push(currentChar); // 오답 기록
        input.classList.add('incorrect');
        setTimeout(() => {
            input.classList.remove('incorrect');
            nextQuestion(); // 정답 여부와 관계없이 다음 문제로
        }, 500);
    }
}

function showAnswerAndProceed(isSkipped = false) {
    if (!isReviewMode) {
         document.getElementById('score_label').textContent = `✅ ${score}`;
    }
    const quizData = quizzes[currentQuizType];
    const japaneseChar = currentChar;
    const pronunciation = quizData[currentChar];
    
    document.getElementById('question_content').innerHTML = `
        <div class="answered-content">
            <div class="answered-char">${japaneseChar}</div>
            <div class="answered-pronunciation">${pronunciation}</div>
        </div>`;
    
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
         text = currentPronunciationMode === "japanese_to_pronunciation" ? "타이핑 (일본어 → 발음)" : "타이핑 (발음 → 일본어)";
    } else {
         text = currentPronunciationMode === "japanese_to_pronunciation" ? "일본어 → 발음" : "발음 → 일본어";
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

renderMenu();
