//animation stuff
const pMove = 50; //distance to move for the player names (pixels)
const pCharMove = 20; //distance to move for the character icons

const fadeInTime = .3; //(seconds)
const fadeOutTime = .2;
let introDelay = .8; //all animations will get this delay when the html loads (use this so it times with your transition)

//to avoid the code constantly running the same method over and over
let p1CharacterPrev, p1ScorePrev, p1wlPrev;
let p2CharacterPrev, p2ScorePrev, p2wlPrev;
let bestOfPrev;

let startup = true;

window.onload = init;

function init() {
	async function mainLoop() {
		const scInfo = await getInfo();
		getData(scInfo);
	}

	mainLoop();
	setInterval( () => { mainLoop(); }, 500); //update interval
}

async function getData(scInfo) {

	const player = scInfo['player'];
	const teamName = scInfo['teamName'];

	const score = scInfo['score'];
	const wl = scInfo['wl'];

	const bestOf = scInfo['bestOf'];
	const gamemode = scInfo['gamemode'];

	const round = scInfo['round'];


	//first, things that will happen only the first time the html loads
	if (startup) {
		//of course, we have to start with the cool intro stuff
		if (scInfo['allowIntro']) {

			//lets see that intro
			document.getElementById('overlayIntro').style.opacity = 1;

			//this vid is just the bars moving (todo: maybe do it through javascript?)
			setTimeout(() => { 
				document.getElementById('introVid').setAttribute('src', 'Resources/Overlay/Scoreboard/Intro.webm');
				document.getElementById('introVid').play();
			}, 0); //if you need it to start later, change that 0 (and also update the introDelay)

			if (score[1] + score[2] == 0) { //if this is the first game, introduce players

				const p1IntroEL = document.getElementById('p1Intro');
				const p2IntroEL = document.getElementById('p2Intro');

				p1IntroEL.textContent = player[1].name; //update player 1 intro text
				p1IntroEL.style.fontSize = '110px'; //resize the font to its max size
				resizeText(p1IntroEL); //resize the text if its too large
				p2IntroEL.style.fontSize = '110px';
				p2IntroEL.textContent = player[2].name; //p2
				resizeText(p2IntroEL);

				//change the color of the player text shadows
				p1IntroEL.style.textShadow = '0px 0px 20px #F3E67D';
				p2IntroEL.style.textShadow = '0px 0px 20px #ECACFF';

				//player 1 name fade in
				gsap.fromTo("#p1Intro",
					{x: -pMove}, //from
					{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

				//same for player 2
				gsap.fromTo("#p2Intro",
					{x: pMove},
					{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

			} else { //if its not the first game, show game count
				const midTextEL = document.getElementById('midTextIntro');
				if ((score[1] + score[2]) != 4) { //if its not the last game of a bo5

					//just show the game count in the intro
					midTextEL.textContent = "Game " + (score[1] + score[2] + 1);

				} else { //if game 5

					if ((round.toUpperCase() == "True Finals".toUpperCase())) { //if true finals

						midTextEL.textContent = "True Final Game"; //i mean shit gets serious here
						
					} else {

						midTextEL.textContent = "Final Game";
						
						//if GF, we dont know if its the last game or not, right?
						if (round.toLocaleUpperCase() == "Grand Finals".toLocaleUpperCase() && !(wl[1] == "L" && wl[2] == "L")) {
							gsap.to("#superCoolInterrogation", {delay: introDelay+.5, opacity: 1, ease: "power2.out", duration: 1.5});
						}

					}
				}
			}

			document.getElementById('roundIntro').textContent = round;
			document.getElementById('tNameIntro').textContent = scInfo['tournamentName'];
			
			//round, tournament and VS/GameX text fade in
			gsap.to(".textIntro", {delay: introDelay-.2, opacity: 1, ease: "power2.out", duration: fadeInTime});

			//aaaaand fade out everything
			gsap.to("#overlayIntro", {delay: introDelay+1.6, opacity: 0, ease: "power2.out", duration: fadeInTime+.2});

			//lets delay everything that comes after this so it shows after the intro
			introDelay = 2.6;
		}

		//finally out of the intro, now lets start with player 1 first
		//update player name and team name texts
		updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', player[1].name, player[1].tag);
		//sets the starting position for the player text, then fades in and moves the p1 text to the next keyframe
		gsap.fromTo("#nameP1div", 
			{x: -pMove, opacity: 0}, //from
			{delay: introDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to


		//set the character image for the player
		await updateChar(player[1].character, 'p1Character');
		//when the image finishes loading, fade-in-move the character to the overlay
		gsap.fromTo("#charP1",
			{x: -pCharMove*2},
			{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
		//save the character value so we run the character change code only when this doesnt equal to the next
		p1CharacterPrev = player[1].character;

		//if its grands, we need to show the [W] and/or the [L] on the players
		if (wl[1] != "Nada") {
			updateWL(wl[1], "L");
			gsap.fromTo("#wlL",
				{x: -pMove},
				{delay: introDelay+.5, x: 0, opacity: 1, ease: "power2.out", duration: .5});
		}
		//save for later so the animation doesn't repeat over and over
		p1wlPrev = wl[1];
		

		//set the current score
		updateScore('scoreL', score[1], bestOf, "L");
		//fade the score image in with the rest of the overlay
		fadeIn("#scoreL", introDelay);
		p1ScorePrev = score[1];


		//took notes from player 1? well, this is exactly the same!
		updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', player[2].name, player[2].tag);
		gsap.fromTo("#nameP2div", 
			{x: pMove, opacity: 0},
			{delay: introDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

		await updateChar(player[2].character, 'p2Character');
		gsap.fromTo("#charP2",
			{x: pCharMove*2, opacity: 0},
			{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
		p2CharacterPrev = player[2].character;

		if (wl[2] != "Nada") {
			updateWL(wl[2], "R");
			gsap.fromTo("#wlR",
				{x: pMove, opacity: 0},
				{delay: introDelay+.5, x: 0, opacity: 1, ease: "power2.out", duration: .5});
		}
		p2wlPrev = wl[2];

		updateScore('scoreR', score[2], bestOf, "R");
		fadeIn("#scoreR", introDelay);
		p2ScorePrev = score[2];


		//update the round text
		updateRound(round);
		//fade it in, but only if theres text
		if (round != "") {
			gsap.to("#overlayRound", {delay: introDelay, opacity: 1, ease: "power2.out", duration: fadeInTime+.2});
		} else {
			document.getElementById("overlayRound").opacity = 0;
		}


		//setup for later
		bestOfPrev = bestOf;


		startup = false; //next time we run this function, it will skip all we just did
	}

	//now things that will happen constantly
	else {

		//player 1 time!
		if (document.getElementById('p1Name').textContent != player[1].name ||
			document.getElementById('p1Team').textContent != player[1].tag) {
			//move and fade out the player 1's text
			fadeOutMove("#p1Wrapper", -pMove, () => {
				//now that nobody is seeing it, quick, change the text's content!
				updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', player[1].name, player[1].tag);
				//fade the name back in with a sick movement
				fadeInMove("#p1Wrapper");
			});
		}

		//player 1's character icon change
		if (p1CharacterPrev != player[1].character) {
			//fade out the image while also moving it because that always looks cool
			fadeOutMove("#p1Character", -pCharMove, async () => {
				//now that nobody can see it, lets change the image!
				await updateChar(player[1].character, 'p1Character'); //will return scale
				//and now, fade it in
				fadeInChara("#p1Character");
			});
			p1CharacterPrev = player[1].character;
		}

		//the [W] and [L] status for grand finals
		if (p1wlPrev != wl[1]) {
			//move it away!
			gsap.to("#wlL", {x: -pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pwlMoved});
			function pwlMoved() {
				//change the thing!
				updateWL(wl[1], "L");
				//move it back!
				if (wl[1] != "Nada") {
					gsap.to("#wlL", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				}
			}
			p1wlPrev = wl[1];
		}

		//score check
		if (p1ScorePrev != score[1]) {
			updateScore('scoreL', score[1], bestOf, "L");
			p1ScorePrev = score[1];
		}


		//did you pay attention earlier? Well, this is the same as player 1!
		if (document.getElementById('p2Name').textContent != player[2].name ||
			document.getElementById('p2Team').textContent != player[2].tag){
			fadeOutMove("#p2Wrapper", pMove, () => {
				updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', player[2].name, player[2].tag);
				fadeInMove("#p2Wrapper");
			});
		}

		if (p2CharacterPrev != player[2].character) {
			fadeOutMove("#p2Character", -pCharMove, async () => {
				await updateChar(player[2].character, 'p2Character'); //will return scale
				fadeInChara("#p2Character");
			});
			p2CharacterPrev = player[2].character;
		}

		if (p2wlPrev != wl[2]) {
			gsap.to("#wlR", {x: pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pwlMoved});
			function pwlMoved() {
				updateWL(wl[2], "R");
				if (wl[2] != "Nada") {
					gsap.to("#wlR", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				}
			}
			p2wlPrev = wl[2];
		}

		if (p2ScorePrev != score[2]) {
			updateScore('scoreR', score[2], bestOf, "R");
			p2ScorePrev = score[2];
		}


		//if the "bestOf" status changed, update the score ticks
		if (bestOfPrev != bestOf) {
			updateScore('scoreL', score[1], bestOf, "L");
			updateScore('scoreR', score[2], bestOf, "R");
			bestOfPrev = bestOf;
		}

		
		//update the round text
		if (document.getElementById('round').textContent != round){
			if (round) { //if theres actual text
				if (document.getElementById("overlayRound").style.opacity == 0) {
					updateRound(round);
					fadeIn("#overlayRound")
				} else {
					fadeOut("#round", () => {
						updateRound(round);
						fadeIn("#round");
					});	
				}
			} else { //if no text, hide everything
				fadeOut("#overlayRound");
				updateRound(round);
			}

		}
	}
}


//did an image fail to load? this will be used to show nothing
function showNothing(itemEL) {
	itemEL.setAttribute('src', 'Resources/Literally Nothing.png');
}

//score change
function updateScore(scoreID, pScore, bestOf, side) {
	let delay = 0;
	/* if (playAnim) { //do we want to play the score up animation?
		//depending on the "bestOf" and the color, change the clip
		const scoreUpEL = document.getElementById(scoreUpID);
		scoreUpEL.setAttribute('src', 'Resources/Overlay/Score/Scoreboard/ScoreUp ' + bestOf + '.webm');
		scoreUpEL.play();
		delay = 200; //add a bit of delay so the score change fits with the vid
	} */
	const scoreEL = document.getElementById(scoreID);
	//set timeout to the actual image change so it fits with the animation (if it played)
	setTimeout(() => {
		//change the image depending on the bestOf status and, of course, the current score
		if (pScore == 0) {
			scoreEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Score/' + bestOf + ' ' + pScore + '.png')
		} else {
			scoreEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Score/' + bestOf + ' ' + pScore + ' ' + side + '.png')
		}
	}, delay);
	//nothing will show if the score is set to 3 which is intended
	if (startup) {scoreEL.addEventListener("error", () => {showNothing(scoreEL)})}
}

//player text change
function updatePlayerName(wrapperID, nameID, teamID, pName, pTeam) {
	const nameEL = document.getElementById(nameID);
	nameEL.style.fontSize = '36px'; //set original text size
	nameEL.textContent = pName; //change the actual text
	const teamEL = document.getElementById(teamID);
	teamEL.style.fontSize = '25px';
	teamEL.textContent = pTeam;
	resizeText(document.getElementById(wrapperID)); //resize if it overflows
}

//round change
function updateRound(round) {
	const roundEL = document.getElementById('round');
	roundEL.style.fontSize = '30px'; //set original text size
	roundEL.textContent = round; //change the actual text
	resizeText(roundEL); //resize it if it overflows
}

//fade out
function fadeOut(itemID, funct) {
	gsap.to(itemID, {opacity: 0, duration: fadeOutTime, onComplete: funct});
}

//fade out but with movement
function fadeOutMove(itemID, move, funct) {
	gsap.to(itemID, {x: move, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: funct});
}

//fade in
function fadeIn(itemID, timeDelay = .2) {
	gsap.to(itemID, {delay: timeDelay, opacity: 1, duration: fadeInTime});
}

//fade in but with movement
function fadeInMove(itemID) {
	gsap.to(itemID, {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

//fade in but for the character image
function fadeInChara(itemID) {
	gsap.to(itemID, {delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

//fade in for the characters when first loading
function initCharaFade(charaID) {
	gsap.fromTo(charaID,
		{x: -pCharMove, opacity: 0},
		{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

//check if winning or losing in a GF, then change image
function updateWL(pWL, side) {
	const pWLEL = document.getElementById('wlText' + side);
	if (pWL == "W") {
		pWLEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Winners.png')
	} else if (pWL == "L") {
		pWLEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Losers.png')
	} else if (pWL == "Nada") {
		pWLEL.setAttribute('src', 'Resources/Literally Nothing.png')
	}

	if (startup) {
		pWLEL.addEventListener("error", () => {
			showNothing(pWLEL);
		})
	}
}

//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth || textEL.scrollHeight > textEL.offsetHeight) {
		if (childrens.length > 0) { //for team+player texts
			Array.from(childrens).forEach(function (child) {
				child.style.fontSize = getFontSize(child);
			});
		} else {
			textEL.style.fontSize = getFontSize(textEL);
		}
	}
}

//returns a smaller fontSize for the given element
function getFontSize(textElement) {
	return (parseFloat(textElement.style.fontSize.slice(0, -2)) * .90) + 'px';
}

//searches for the main json file
function getInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Texts/ScoreboardInfo.json');
		oReq.send();

		//will trigger when file loads
		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
	//i would gladly have used fetch, but OBS local files wont support that :(
}

//searches for a json file with character data
function getCharInfo(pCharacter) {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.onerror = () => {resolve("notFound")}; //for obs local file browser sources
		oReq.open("GET", 'Resources/Texts/Character Info/' + pCharacter + '.json');
		oReq.send();

		function reqListener () {
			try {resolve(JSON.parse(oReq.responseText))}
			catch {resolve("notFound")} //for live servers
		}
	})
}

//now the complicated "change character image" function!
async function updateChar(pCharacter, charID) {

	//store so code looks cleaner later
	const charEL = document.getElementById(charID);

	//if the image fails to load, we will put a placeholder
	if (startup) {charEL.addEventListener("error", () => {
		//simple check to see if we are updating P1 or P2
		const pNum = charEL == document.getElementById("p1Character") ? 1 : 2;

		charEL.setAttribute('src', 'Resources/Characters/Random '+pNum+'.png');
	})}

	//change the image path depending on the character and skin
	charEL.setAttribute('src', 'Resources/Characters/Portrait/' + pCharacter + '.png');

	//get the character positions
	const charInfo = await getCharInfo(pCharacter);
	//             x, y, scale
	let charPos = [0, 0, 1];
	//now, check if the character and skin exist in the database down there
	if (charInfo != "notFound") {
		//grab the character positions
		charPos[0] = charInfo.scoreboard.x;
		charPos[1] = charInfo.scoreboard.y;
		charPos[2] = charInfo.scoreboard.scale;
	} else { //if the character isnt on the database, set positions for the "?" image
		charPos[0] = 598;
		charPos[1] = -22;
		charPos[2] = .65;
	}
	
	//to position the character
	charEL.style.left = charPos[0] + "px";
	charEL.style.top = charPos[1] + "px";
	charEL.style.transform = "scale(" + charPos[2] + ")";
}