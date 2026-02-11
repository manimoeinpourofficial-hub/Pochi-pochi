// منطق کامل بازی

let currentLevel = "beginner";
let currentTopic = "daily";

let learnList = [];
let learnIndex = 0;

let gameQuestions = [];
let gameIndex = 0;
let wrongWords = [];
let wrongCount = 0;
let totalCount = 0;
let score = 0;
let bestScore = 0;

let timerInterval = null;
const timeLimit = 5;

// DOM
const screenStart = document.getElementById("screen-start");
const screenLearn = document.getElementById("screen-learn");
const screenGame = document.getElementById("screen-game");
const screenResult = document.getElementById("screen-result");

const levelChips = document.getElementById("level-chips");
const topicChips = document.getElementById("topic-chips");

const btnStartLearn = document.getElementById("btn-start-learn");
const btnStartGame = document.getElementById("btn-start-game");

const learnWordEl = document.getElementById("learn-word");
const learnMeaningEl = document.getElementById("learn-meaning");
const learnIndexEl = document.getElementById("learn-index");

const btnLearnPrev = document.getElementById("btn-learn-prev");
const btnLearnNext = document.getElementById("btn-learn-next");
const btnLearnRandom = document.getElementById("btn-learn-random");
const btnLearnBack = document.getElementById("btn-learn-back");

const recordLabel = document.getElementById("record-label");
const statsLabel = document.getElementById("stats-label");
const avatarGame = document.getElementById("avatar-game");
const gameWordEl = document.getElementById("game-word");
const optionButtons = document.querySelectorAll(".option");

const timerBar = document.getElementById("timer-bar");
const btnExitGame = document.getElementById("btn-exit-game");

const finalScoreLabel = document.getElementById("final-score");
const finalBestLabel = document.getElementById("final-best");
const finalWrongLabel = document.getElementById("final-wrong");
const finalTotalLabel = document.getElementById("final-total");
const resultsList = document.getElementById("results-list");

const btnRepeatWrong = document.getElementById("btn-repeat-wrong");
const btnPlayAgain = document.getElementById("btn-play-again");
const btnBackHome = document.getElementById("btn-back-home");

// Helpers
function showScreen(screen) {
  [screenStart, screenLearn, screenGame, screenResult].forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function setAvatar(mood) {
  let src = "assets/avatar_neutral.png";
  if (mood === "happy") src = "assets/avatar_happy.png";
  if (mood === "sad") src = "assets/avatar_sad.png";
  if (mood === "super") src = "assets/avatar_super_happy.png";

  avatarGame.src = src;
  avatarGame.classList.remove("avatar-bounce");
  void avatarGame.offsetWidth;
  avatarGame.classList.add("avatar-bounce");
}

function vibrate(ms) {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

// Level & topic selection
levelChips.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  levelChips.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
  chip.classList.add("selected");
  currentLevel = chip.dataset.level;
});

topicChips.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  topicChips.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
  chip.classList.add("selected");
  currentTopic = chip.dataset.topic;
});

// LEARN
btnStartLearn.addEventListener("click", () => {
  const list = WORDS_DATA[currentLevel][currentTopic];
  if (!list || !list.length) {
    alert("No words for this level/topic yet.");
    return;
  }
  learnList = shuffle(list);
  learnIndex = 0;
  showLearn();
  showScreen(screenLearn);
});

function showLearn() {
  const item = learnList[learnIndex];
  learnWordEl.textContent = item.word;
  learnMeaningEl.textContent = item.meaning;
  learnIndexEl.textContent = `${learnIndex + 1} / ${learnList.length}`;
}

btnLearnPrev.onclick = () => {
  learnIndex = (learnIndex - 1 + learnList.length) % learnList.length;
  showLearn();
};

btnLearnNext.onclick = () => {
  learnIndex = (learnIndex + 1) % learnList.length;
  showLearn();
};

btnLearnRandom.onclick = () => {
  learnIndex = Math.floor(Math.random() * learnList.length);
  showLearn();
};

btnLearnBack.onclick = () => showScreen(screenStart);

// GAME
btnStartGame.onclick = () => {
  const list = WORDS_DATA[currentLevel][currentTopic];
  if (!list || !list.length) {
    alert("No words for this level/topic yet.");
    return;
  }

  gameQuestions = shuffle(list);
  gameIndex = 0;
  wrongWords = [];
  wrongCount = 0;
  totalCount = gameQuestions.length;
  score = 0;

  bestScore = parseInt(localStorage.getItem("anfo_best_pastel") || "0");
  recordLabel.textContent = "Best: " + bestScore;

  statsLabel.textContent = `Wrong 0 / ${totalCount}`;
  setAvatar("neutral");

  showScreen(screenGame);
  loadGameQuestion();
};

function startTimer() {
  clearInterval(timerInterval);
  let timeLeft = timeLimit;
  timerBar.style.transition = "none";
  timerBar.style.width = "100%";

  setTimeout(() => {
    timerBar.style.transition = `width ${timeLimit}s linear`;
    timerBar.style.width = "0%";
  }, 50);

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  wrongCount++;
  statsLabel.textContent = `Wrong ${wrongCount} / ${totalCount}`;
  setAvatar("sad");
  vibrate(120);

  const q = gameQuestions[gameIndex];
  wrongWords.push(q);

  setTimeout(() => {
    gameIndex++;
    loadGameQuestion();
  }, 600);
}

function loadGameQuestion() {
  clearInterval(timerInterval);

  optionButtons.forEach(btn => {
    btn.classList.remove("correct", "wrong");
    btn.disabled = false;
  });

  if (gameIndex >= gameQuestions.length) {
    endGame();
    return;
  }

  const q = gameQuestions[gameIndex];
  gameWordEl.textContent = q.word;

  let options = [q.meaning];
  while (options.length < 4) {
    const random = gameQuestions[Math.floor(Math.random() * gameQuestions.length)].meaning;
    if (!options.includes(random)) options.push(random);
  }

  options = shuffle(options);

  optionButtons.forEach((btn, i) => {
    btn.textContent = options[i];
    btn.onclick = () => checkAnswer(options[i] === q.meaning, q, btn);
  });

  startTimer();
}

function checkAnswer(isCorrect, wordObj, btn) {
  clearInterval(timerInterval);
  optionButtons.forEach(b => b.disabled = true);

  if (isCorrect) {
    score += 10;
    btn.classList.add("correct");
    setAvatar("happy");
  } else {
    score -= 5;
    wrongCount++;
    wrongWords.push(wordObj);
    btn.classList.add("wrong");
    setAvatar("sad");
    vibrate(150);
  }

  statsLabel.textContent = `Wrong ${wrongCount} / ${totalCount}`;

  setTimeout(() => {
    gameIndex++;
    loadGameQuestion();
  }, 650);
}

function endGame() {
  showScreen(screenResult);

  finalScoreLabel.textContent = score;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("anfo_best_pastel", bestScore);
  }

  finalBestLabel.textContent = bestScore;
  finalWrongLabel.textContent = wrongCount;
  finalTotalLabel.textContent = totalCount;

  resultsList.innerHTML = "";
  if (!wrongWords.length) {
    resultsList.innerHTML = "<li>No wrong words. Perfect run! 🎉</li>";
  } else {
    wrongWords.forEach(w => {
      const li = document.createElement("li");
      li.textContent = `${w.word} = ${w.meaning}`;
      resultsList.appendChild(li);
    });
  }
}

// Buttons
btnExitGame.onclick = () => {
  clearInterval(timerInterval);
  showScreen(screenStart);
};

btnRepeatWrong.onclick = () => {
  if (!wrongWords.length) {
    alert("No wrong words to repeat.");
    return;
  }

  gameQuestions = shuffle(wrongWords);
  wrongWords = [];
  wrongCount = 0;
  gameIndex = 0;
  score = 0;
  totalCount = gameQuestions.length;

  statsLabel.textContent = `Wrong 0 / ${totalCount}`;
  setAvatar("neutral");

  showScreen(screenGame);
  loadGameQuestion();
};

btnPlayAgain.onclick = () => {
  const list = WORDS_DATA[currentLevel][currentTopic];
  if (!list || !list.length) {
    alert("No words for this level/topic yet.");
    return;
  }

  gameQuestions = shuffle(list);
  wrongWords = [];
  wrongCount = 0;
  gameIndex = 0;
  score = 0;
  totalCount = gameQuestions.length;

  statsLabel.textContent = `Wrong 0 / ${totalCount}`;
  setAvatar("neutral");

  showScreen(screenGame);
  loadGameQuestion();
};

btnBackHome.onclick = () => {
  showScreen(screenStart);
};
