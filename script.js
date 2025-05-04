let cur = 0;
let t = document.getElementById("para");
let typ = document.getElementById("typ");
let time = new Date();
let t1;
let synth = window.speechSynthesis;


const playErrorSound = () => {
  const errorSound = new Audio('Error.mp3');
  errorSound.play().catch((e) => {
    console.error("ErrorSound playback failed:", e);
  });
  return;
}

const playCorrectionSound = () => {
  const errorSound = new Audio('Correction.mp3');
  errorSound.play().catch((e) => {
    console.error("ErrorSound playback failed:", e);
  });
  return;
}

const playBackspaceSound = () => {
  const keyPressSound = new Audio('./Backspace.mp3');
  keyPressSound.play().catch((e) => {
    console.error("BackspaceSound playback failed:", e);
  });
  return;
}

const playKeyPressSound = () => {
  const keyPressSound = new Audio('./Keypress.mp3');
  keyPressSound.play().catch((e) => {
    console.error("KeyPressSound playback failed:", e);
  });
  return;
}

function speak(text) {
	if (!synth) return;
	console.log('speak called with text:', text);
	if (text.charCodeAt(0) === NaN) {
	  text = "space";
	}
  
	const specialChars = {
	  ".": "period",
	  ",": "comma",
	  "\n": "newline",
	  "⏎": "newline",
	  "!": "exclamation mark",
	  "?": "question mark",
	  ":": "colon",
	  ";": "semicolon",
	  "-": "dash",
	  "(": "open bracket",
	  ")": "close bracket",
	  "[": "open square bracket",
	  "]": "close square bracket",
	  "{": "open curly bracket",
	  "}": "close curly bracket",
	  "\"": "double quote",
	  "'": "apostrophe",
	  "/": "slash",
	  "\\": "backslash",
	  "*": "asterisk",
	  "+": "plus",
	  "=": "equals",
	  "<": "less than",
	  ">": "greater than",
	  "&": "ampersand",
	  "%": "percent",
	  "$": "dollar",
	  "#": "hash",
	  "@": "at",
	  "^": "caret",
	  "`": "backtick",
	  "~": "tilde",
	  "|": "pipe"
	};
  
	if (text.match(/[A-Z]/)) {
	  text = `cap ${text.toLowerCase()}`;
	} else if (text.match(/[a-z]/)) {
	  text = text;
	}
  
	const spokenText = specialChars[text] || text;
	const utterance = new SpeechSynthesisUtterance(spokenText);
  
	const speedSelect = document.getElementById('speedSelect');
	if (speedSelect) {
	  utterance.rate = parseFloat(speedSelect.value);
	} else {
	  utterance.rate = 2;
	}
  
	synth.cancel();
	synth.speak(utterance);
}

function getPara(r) {
  console.log('getPara called.');
  typ.innerHTML = "";

  let x;
  if (!r) x = Math.floor(Math.random() * 20 + 1);
  let filename = "./Articles/" + x + ".txt";

  console.log("Filename ->", filename);

  fetch(filename)
    .then(response => response.text())
    .then(text => {
      text = text.replaceAll("\r\n", "\n");
      t.innerText = text;

      for (let i = 0; i < text.length; i++) {
        let ch = document.createElement("span");
        ch.id = i;
        ch.tabIndex = 0;
        ch.appendChild(document.createTextNode(text[i] === '\n' ? '⏎\n' : text[i]));
        typ.appendChild(ch);
      }
      document.getElementById("0").classList.add("current");
      speak(document.getElementById("0").innerText.trim());
    })
    .catch(error => {
      para.appendChild('Could not fetch the file', filename);
      console.error(error);
    });
}

function reset() {
  document.getElementById("but").blur();
  document.getElementById(cur)?.classList.remove("current");
  cur = 0;
  getPara();
}

function back(event) {
  if (event.key === "Backspace") {
    playBackspaceSound();
    document.getElementById(cur).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    document.getElementById(cur).classList.remove("current");
    
    if (cur > 0) cur--;

    const element = document.getElementById(cur);
    if (element) {
      if (element.classList.contains("incorrect")) {
        element.classList.add("wasIncorrect");
      }
      element.classList.remove("current", "correct", "incorrect");
      element.classList.add("current");
      element.focus();
      // playCorrectionSound();
      
      // announceWordOrChar(element);
    }
  }
}

function isCorrect(event) {
  // playKeyPressSound();
  const keyPressSound = new Audio('./keypress.mp3');
  keyPressSound.play();
  document.getElementById(cur)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

  if (cur === 0) {
    time = new Date();
    t1 = time.getTime();
  }

  const currentChar = document.getElementById(cur);
  if (!currentChar) return;

  currentChar.classList.add("current");

  if ([" ", "Enter"].includes(event.key) || event.keyCode === 13) {
    event.preventDefault();
  }

  if (
    (event.key === 'Enter' && currentChar.innerText === '⏎\n') ||
    event.key === currentChar.innerText
  ) {
    if(currentChar.classList.contains("wasIncorrect")) {
      playCorrectionSound();
    }
    currentChar.classList.add("correct");
    currentChar.classList.remove("incorrect", "current");
  } else {
    // playCorrectionSound();
    currentChar.classList.remove("correct");
    // errorSound.play().catch((e) => {
    //   console.error("Audio playback failed:", e);
    // });
    playErrorSound();
    currentChar.classList.add("incorrect");
    currentChar.classList.remove("current");
  }

  cur++;

  const nextChar = document.getElementById(cur);
  if (nextChar) {
    nextChar.classList.add("current");
    nextChar.focus();
    
    // announceWordOrChar(nextChar);
  } else {
    console.log('Completed.');
    showResults();
  }
}

function announceWordOrChar(element) {
  if (!element) return;

  // Check if cursor is at start of a word
  const prevChar = document.getElementById(element.id - 1);
  if (!prevChar || prevChar.innerText === " " || prevChar.innerText === "\n" || prevChar.innerText === "⏎\n") {
    // Cursor is at beginning of a word
    let word = "";
    let temp = element;
    while (temp && temp.innerText !== " " && temp.innerText !== "\n" && temp.innerText !== "⏎\n") {
      word += temp.innerText;
      temp = document.getElementById(Number(temp.id) + 1);
    }
    speak(word.trim());
  } else {
    speak(element.innerText.trim());
  }
}

function showResults() {
  console.log('showResults called.');
  const resultSection = document.getElementById('resultSection');
  resultSection.tabIndex = 0;
  resultSection.focus();
  resultSection.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  document.getElementById("but").disabled = true;

  const len = document.getElementById("para").innerText.length;
  const correct = document.getElementsByClassName("correct").length;
  const wrong = document.getElementsByClassName("incorrect").length;
  const corrections = document.querySelectorAll('.wasIncorrect').length;
  const accuracy = ((100 * (len - wrong)) / len).toFixed(2);
  const tim = new Date();
  const t2 = tim.getTime();
  const typingTime = ((t2 - t1) / 1000).toFixed(2);

  console.log(`Typing time: ${typingTime} seconds`);
  console.log(`# Correct characters: ${correct}`);
  console.log(`# Incorrect characters: ${wrong}`);

  resultSection.innerText = `Accuracy: ${accuracy}%\nErrors: ${wrong}\nCorrections: ${corrections}\nSpeed: ${(countWords() * 60 / typingTime).toFixed(2)} words per minute.`;
}

function countWords() {
  let words = document.getElementById('para').innerText.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

document.getElementById('resultSection').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.location.reload();
});
