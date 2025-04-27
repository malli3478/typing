let cur = 0;
let t = document.getElementById("para");
let typ = document.getElementById("typ");
let time = new Date();
let t1;
let synth = window.speechSynthesis;

// Error sound to be played when the user types an incorrect key
let errorSound = new Audio('https://www.soundjay.com/button/beep-07.wav'); // You can replace this with any error sound URL

// Function to play the error sound
function playErrorSound() {
  errorSound.play();
}

function speak(text) {
  if (!synth) return;
  console.log('speak called with text:', text);

  // Check if text is a space and convert it to the word "space"
  if (text === " ") {
    text = "space"; // Explicitly handle space as "space"
  }

  // Define special characters and their corresponding spoken names
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

  // Check if it's a capital letter
  if (text.match(/[A-Z]/)) {
    text = `capital ${text.toLowerCase()}`; // Convert to lowercase and prepend "capital"
  } 
  // Otherwise, check if it's a lowercase letter
  else if (text.match(/[a-z]/)) {
    // No changes needed for lowercase letters
    text = text;
  }

  // Get spoken equivalent for special characters
  const spokenText = specialChars[text] || text;

  // Create the speech utterance
  const utterance = new SpeechSynthesisUtterance(spokenText);

  // Get selected speed (if any)
  const speedSelect = document.getElementById('speedSelect');
  if (speedSelect) {
    utterance.rate = parseFloat(speedSelect.value);
  } else {
    utterance.rate = 1; // Default to normal speed
  }

  // Cancel previous speech (if any)
  synth.cancel();
  
  // Speak the final text (either character or special character name)
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
    document.getElementById(cur).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    document.getElementById(cur).classList.remove("current");

    if (cur > 0) cur--;

    const element = document.getElementById(cur);
    if (element) {
      if (element.classList.contains("incorrect")) element.classList.add("wasIncorrect");
      element.classList.remove("current", "correct", "incorrect");
      element.classList.add("current");
      element.focus();
      speak(element.innerText.trim());
    }
  }
}

function isCorrect(event) {
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

  // Check if the key typed is correct
  if (
    (event.key === 'Enter' && currentChar.innerText === '⏎\n') ||
    event.key === currentChar.innerText
  ) {
    currentChar.classList.add("correct");
    currentChar.classList.remove("incorrect", "current");
  } else {
    currentChar.classList.remove("correct");
    currentChar.classList.add("incorrect");
    currentChar.classList.remove("current");

    // Play error sound if incorrect key
    playErrorSound();
  }

  cur++;

  const nextChar = document.getElementById(cur);
  if (nextChar) {
    nextChar.classList.add("current");
    nextChar.focus();

    // Check if we're at the beginning of a word and announce the entire word
    const wordStart = nextChar.previousElementSibling && nextChar.previousElementSibling.innerText === " ";
    if (wordStart) {
      let word = "";
      let temp = nextChar;
      while (temp && temp.innerText !== " " && temp.innerText !== "\n") {
        word += temp.innerText;
        temp = temp.nextElementSibling;
      }
      speak(word); // Announce the full word
    } else {
      speak(nextChar.innerText.trim());
    }
  } else {
    console.log('Completed.');
    showResults();
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

// Event listener for result section (press Enter to reload)
document.getElementById('resultSection').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.location.reload();
});
