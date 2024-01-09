let cur = 0;
let t = document.getElementById("para");
let typ = document.getElementById('typ');
let time = new Date();
let paraLength;

function getPara(r) {
	let x;
	console.log('func called.')
  	document.getElementById("typ").innerHTML = "";
  	if (!r) x = Math.floor(Math.random() * 20 + 1);
	let filename = "./Articles/" + x + ".txt";
	// let filename = 'TestTextFile.txt';
	
	console.log("Filename -> ", filename);
	fetch(filename)
	.then((response) => response.text())
	.then((text) => {
		text = text.replaceAll("\r\n", "\n");
		t.innerText = text;
		for (let i = 0; i < text.length; i++) {
			ch = document.createElement("span");
			ch.setAttribute("id", i);
			ch.setAttribute('tabindex', 0);
			ch.appendChild((text[i] == '\n') ? document.createTextNode('⏎\n') : document.createTextNode(text[i]));
			document.getElementById("typ").appendChild(ch);
		}
		document.getElementById("0").classList.add("current");
	})
	.catch((e) => {
		para.appendChild('Could not fetch the file', filename);
		console.log(e);
	});	
}

////////////////////////////////////////////////

function reset() {
  document.getElementById("but").blur();
  cur = 0;
  document.getElementById(cur).classList.remove("current");
  getPara();
}

function back(event) {
  if (event.key == "Backspace") {
    document.getElementById(cur).scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    document.getElementById(cur).classList.remove("current");
    cur == 0 ? (cur = 0) : cur--;
    if (document.getElementById(cur).classList.contains("incorrect"))
		document.getElementById(cur).classList.add("wasIncorrect");
    document.getElementById(cur).classList.remove("current");
    document.getElementById(cur).classList.remove("correct");
    document.getElementById(cur).classList.remove("incorrect");
	document.getElementById(cur).classList.add("current");
	document.getElementById(cur).focus();
  }
}

function isCorrect(event) {
	// console.log(cur);
    document.getElementById(cur).scrollIntoView({
		behavior: "smooth",
        block: "center",
        inline: "nearest",
	});
    
    if (cur == 0) {
		time = new Date();
		t1 = time.getTime();
    }
    document.getElementById(cur).classList.add("current");
    if (event.key === " " || event.keyCode == 13 || event.key === "Enter")
	event.preventDefault();		
	if ((event.key === 'Enter' && document.getElementById(cur).innerText === '⏎\n') || event.key === document.getElementById(cur).innerText) {
		document.getElementById(cur).classList.add("correct");
		document.getElementById(cur).classList.remove("incurrect");
		document.getElementById(cur).classList.remove("current");
	}
	else {
		document.getElementById(cur).classList.remove("correct");
		document.getElementById(cur).classList.add("incorrect");
		document.getElementById(cur).classList.remove("current");
	}

	cur++;
	
	if (document.getElementById(cur) != null) {
		document.getElementById(cur).classList.add("current");
		document.getElementById(cur).focus();
	}
	// if (cur == t.length) {
	// 	console.log('Completed.');
	// 	showResults();
	// // } else 
	
	else {
		console.log('Completed.');
		showResults();
	} 
}

function showResults() {
	console.log('showResults called.')
	document.getElementById('resultSection').setAttribute('tabindex',0)
	document.getElementById('resultSection').focus();
	document.getElementById('resultSection').scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
	document.getElementById("but").disabled = true;
	let len = document.getElementById("para").innerText.length;
	let correct = document.getElementsByClassName("correct").length;
	let wrong = document.getElementsByClassName("incorrect").length;
	let corrections = document.querySelectorAll('.wasIncorrect').length;
	let accuracy = ((100 * (len - wrong)) / len).toFixed(2);
	let tim = new Date();
	let t2 = tim.getTime();
	let typingTime = ((t2 - t1) / 1000).toFixed(2);
	console.log(typingTime);
	console.log("#of correct characters =", correct);
	console.log("#of wrong characters =", wrong);
	let res = document.getElementById("resultSection");
	res.innerText = `Accuracy: ${accuracy}%\nErrors: ${wrong}\nCorrections : ${corrections}\nSpeed: ${(countWords()*60/(typingTime)).toFixed(2)} words per minute.`;	
	return;
}



function countWords() {
  var words = document.getElementById('para').innerText.split(/\s+/);

  words = words.filter(function (word) {
    return word.length > 0;
  });

  return words.length;
}

let res = document.getElementById('resultSection')
res.addEventListener('keydown', (e) => {
	if (e.key == 'Enter')
		window.location.reload();
})