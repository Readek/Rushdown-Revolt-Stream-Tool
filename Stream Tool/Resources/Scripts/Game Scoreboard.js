'use strict';

//animation stuff
const pMove = 50; //distance to move for the player names (pixels)
const pCharMove = 20; //distance to move for the character icons

const fadeInTime = .3; //(seconds)
const fadeOutTime = .2;
let introDelay = .8; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const nameSizeIntro = '110px';
const nameSize = '36px';
const tagSize = '25px';
const roundSize = '30px';

//to avoid the code constantly running the same method over and over
let p1CharacterPrev, p2CharacterPrev, p3CharacterPrev, p4CharacterPrev, p5CharacterPrev, p6CharacterPrev;
let leftScorePrev, p1wlPrev, rightScorePrev, p2wlPrev;
let bestOfPrev;

//team/player texts intervals
let leftInt, rightInt;
let sideSwitch = false; //true = teams, false = players
const sideTimer = 12000;

//to run some code just once
let startup = true;

//set some elements here so code is easier later
const leftWrapper = document.getElementById("leftWrapper");
const rightWrapper = document.getElementById("rightWrapper");
const leftTeam = document.getElementById("leftTeam");
const rightTeam = document.getElementById("rightTeam");
const roundEL = document.getElementById('round');


/* script begin */
async function mainLoop() {
	const scInfo = await getInfo();
	getData(scInfo);
}
mainLoop();
setInterval( () => { mainLoop(); }, 500); //update interval


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
				const introVid = document.getElementById('introVid');
				introVid.setAttribute('src', 'Resources/Overlay/Scoreboard/Intro.webm');
				introVid.play();
			}, 0); //if you need it to start later, change that 0 (and also update the introDelay)

			if (score[1] + score[2] == 0) { //if this is the first game, introduce players

				const p1IntroEL = document.getElementById('p1Intro');
				const p2IntroEL = document.getElementById('p2Intro');

				//update players intro text
				if (gamemode == 1) {
					p1IntroEL.textContent = player[1].name;
					p2IntroEL.textContent = player[2].name;
				} else {
					p1IntroEL.textContent = teamName[1];
					p2IntroEL.textContent = teamName[2];
				}
				p1IntroEL.style.fontSize = nameSizeIntro; //resize the font to its max size
				resizeText(p1IntroEL); //resize the text if its too large
				p2IntroEL.style.fontSize = nameSizeIntro;
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
			introDelay += 1.8;
		}


		//finally out of the intro, lets check the gamemode and show whats needed
		gamemodeStart(gamemode);


		//update player names and tags
		updatePlayerTexts(player, "left", "L");
		//we will also update the team name
		updateText('leftTeam', teamName[1], nameSize);

		//if singles, just show the player texts
		if (gamemode == 1) {
			fadeIn(leftWrapper, introDelay+.25);
		} else {
			//if the team name exists
			if (teamName[1]) {
				fadeIn(leftTeam, introDelay+.25); //show team name
				//keep changing team name and player names
				leftInt = setInterval(() => {
					switchTexts("left");
				}, sideTimer);
			} else { //if no team name, just show player texts
				fadeIn(leftWrapper, introDelay+.25);
			}
		}

		//sets the starting position for the player text container, then fades in and moves the text to the next keyframe
		gsap.fromTo("#nameP1div", 
			{x: -pMove, opacity: 0}, //from
			{delay: introDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime} //to
		);


		//set the character image for the player
		await updateChar(player[1].character, 'p1Character');
		//when the image finishes loading, fade-in-move the character to the overlay
		if (gamemode == 1) {
			initCharaFade("#charP1", -pCharMove*2, introDelay);
		} else if (gamemode == 2) {
			initCharaFade("#charP1", -pCharMove*2, introDelay+.3);
		} else {
			initCharaFade("#charP1", -pCharMove*2, introDelay+.6);
		}
		//do the same for the other characters if doubles or trios
		if (gamemode == 2 || gamemode == 3) {
			await updateChar(player[3].character, 'p3Character');
			if (gamemode == 2) {
				initCharaFade("#charP3", -pCharMove*2, introDelay);
			} else {
				initCharaFade("#charP3", -pCharMove*2, introDelay+.3);
			}
			if (gamemode == 3) {
				await updateChar(player[5].character, 'p5Character');
				initCharaFade("#charP5", -pCharMove*2, introDelay);
			}
		}

		//save the character values so we run the character change code only when this doesnt equal to the next
		p1CharacterPrev = player[1].character;
		p3CharacterPrev = player[3].character;
		p5CharacterPrev = player[5].character;


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
		updateScore('scoreL', score[1], bestOf, "L", false);
		//fade the score image in with the rest of the overlay
		fadeIn("#scoreL", introDelay);
		leftScorePrev = score[1];


		//took notes from player 1? well, this is exactly the same!
		updatePlayerTexts(player, "right", "R");
		updateText('rightTeam', teamName[2], nameSize);

		if (gamemode == 1) {
			fadeIn(rightWrapper, introDelay+.25);
		} else {
			if (teamName[2]) {
				fadeIn(rightTeam, introDelay+.25);
				rightInt = setInterval(() => {
					switchTexts("right");
				}, sideTimer);
			} else {
				fadeIn(rightWrapper, introDelay+.25);
			}
		}
		gsap.fromTo("#nameP2div", 
			{x: pMove, opacity: 0},
			{delay: introDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}
		);


		await updateChar(player[2].character, 'p2Character');
		initCharaFade("#charP2", pCharMove*2, introDelay);
		if (gamemode == 2 || gamemode == 3) {
			await updateChar(player[4].character, 'p4Character');
			initCharaFade("#charP4", pCharMove*2, introDelay + .3);
			if (gamemode == 3) {
				await updateChar(player[6].character, 'p6Character');
				initCharaFade("#charP6", pCharMove*2, introDelay+.6);
			}
		}
		p2CharacterPrev = player[2].character;
		p4CharacterPrev = player[4].character;
		p6CharacterPrev = player[6].character;


		if (wl[2] != "Nada") {
			updateWL(wl[2], "R");
			gsap.fromTo("#wlR",
				{x: pMove, opacity: 0},
				{delay: introDelay+.5, x: 0, opacity: 1, ease: "power2.out", duration: .5});
		}
		p2wlPrev = wl[2];


		updateScore('scoreR', score[2], bestOf, "R", false);
		fadeIn("#scoreR", introDelay);
		rightScorePrev = score[2];


		//this is what decides when to change the players/team text
		if (gamemode != 1) {
			sideSwitch = true;
			setInterval(() => {
				if (sideSwitch) {
					sideSwitch = false;
				} else {
					sideSwitch = true;
				};
			}, sideTimer);
		}


		//update the round text
		updateText("round", round, roundSize);
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
		if (checkPTexts(player, "left")) {
			//move and fade out the player 1's text
			fadeOut(leftWrapper, () => {
				//now that nobody is seeing it, quick, change the text's content!
				updatePlayerTexts(player, "left", "L");
				//fade the text back in with a sick movement
				if (!sideSwitch || !teamName[1]) {
					fadeIn(leftWrapper, .2);
				}
			});
		}

		//team check, and some weird conditions
		if (leftTeam.textContent != teamName[1] && gamemode != 1) {
			const prevText = leftTeam.textContent;
			fadeOut(leftTeam, () => {
				if (prevText && teamName[1]) {
					if (sideSwitch) {
						fadeIn(leftTeam);
					}
				} else if (!prevText && teamName[1]) {

					if (sideSwitch) {
						fadeOut(leftWrapper, () => {
							fadeIn(leftTeam);
						});
					}
					leftInt = setInterval(() => {
						switchTexts("left");
					}, sideTimer);

					if (teamName[2]) {
						clearInterval(rightInt);
						rightInt = setInterval(() => {
							switchTexts("right");
						}, sideTimer);
					}

				} else if (prevText && !teamName[1]) {
					clearInterval(leftInt);
					fadeIn(leftWrapper);
				}
				updateText('leftTeam', teamName[1], nameSize);
			});
		};

		//player 1's character icon change
		if (p1CharacterPrev != player[1].character) {
			//fade out the image while also moving it because that always looks cool
			fadeOutMove("#p1Character", -pCharMove, async () => {
				//now that nobody can see it, lets change the image!
				const charScale = await updateChar(player[1].character, 'p1Character'); //will return scale
				//and now, fade it in
				fadeInChara("#p1Character", charScale);
			});
			p1CharacterPrev = player[1].character;
		}
		//same with the other players when in teams
		if (p3CharacterPrev != player[3].character) {
			fadeOutMove("#p3Character", -pCharMove, async () => {
				const charScale = await updateChar(player[3].character, 'p3Character');
				fadeInChara("#p3Character", charScale);
			});
			p3CharacterPrev = player[3].character;
		}
		if (p5CharacterPrev != player[5].character) {
			fadeOutMove("#p5Character", -pCharMove, async () => {
				const charScale = await updateChar(player[5].character, 'p5Character');
				fadeInChara("#p5Character", charScale);
			});
			p5CharacterPrev = player[5].character;
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
		if (leftScorePrev != score[1]) {
			updateScore('scoreL', score[1], bestOf, "L", true);
			leftScorePrev = score[1];
		}


		//did you pay attention earlier? Well, this is the same as player 1!
		if (checkPTexts(player, "right")){
			fadeOut(rightWrapper, () => {
				updatePlayerTexts(player, "right", "R");
				if (!sideSwitch || !teamName[2]) {
					fadeIn(rightWrapper, .2);
				}
			});
		}

		//team check
		if (rightTeam.textContent != teamName[2] && gamemode != 1) {
			const prevText = rightTeam.textContent;
			fadeOut(rightTeam, () => {
				if (prevText && teamName[2]) {
					if (sideSwitch) {
						fadeIn(rightTeam);
					}
				} else if (!prevText && teamName[2]) {

					if (sideSwitch) {
						fadeOut(rightWrapper, () => {
							fadeIn(rightTeam);
						});
					}
					rightInt = setInterval(() => {
						switchTexts("right");
					}, sideTimer);

					if (teamName[1]) {
						clearInterval(rightInt);
						rightInt = setInterval(() => {
							switchTexts("right");
						}, sideTimer);
					}

				} else if (prevText && !teamName[2]) {
					clearInterval(rightInt);
					fadeIn(rightWrapper);
				}
				updateText('rightTeam', teamName[2], nameSize);
			});
		};

		if (p2CharacterPrev != player[2].character) {
			fadeOutMove("#p2Character", -pCharMove, async () => {
				const charScale = await updateChar(player[2].character, 'p2Character');
				fadeInChara("#p2Character", charScale);
			});
			p2CharacterPrev = player[2].character;
		}
		if (p4CharacterPrev != player[4].character) {
			fadeOutMove("#p4Character", -pCharMove, async () => {
				const charScale = await updateChar(player[4].character, 'p4Character');
				fadeInChara("#p4Character", charScale);
			});
			p4CharacterPrev = player[4].character;
		}
		if (p6CharacterPrev != player[6].character) {
			fadeOutMove("#p6Character", -pCharMove, async () => {
				const charScale = await updateChar(player[6].character, 'p6Character');
				fadeInChara("#p6Character", charScale);
			});
			p6CharacterPrev = player[6].character;
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

		if (rightScorePrev != score[2]) {
			updateScore('scoreR', score[2], bestOf, "R", true);
			rightScorePrev = score[2];
		}


		//if the "bestOf" status changed, update the score ticks
		if (bestOfPrev != bestOf) {
			updateScore('scoreL', score[1], bestOf, "L", false);
			updateScore('scoreR', score[2], bestOf, "R", false);
			bestOfPrev = bestOf;
		}

		
		//update the round text
		if (roundEL.textContent != round){
			if (round) { //if theres actual text
				if (document.getElementById("overlayRound").style.opacity == 0) {
					updateText("round", round, roundSize);
					fadeIn("#overlayRound")
				} else {
					fadeOut("#round", () => {
						updateText("round", round, roundSize);
						fadeIn("#round");
					});	
				}
			} else { //if no text, hide everything
				fadeOut("#overlayRound");
				updateText("round", round, roundSize);
			}
		}

	}
}


//how about some ugly code to show and position stuff if 2v2 or 3v3?
function gamemodeStart(gamemode) {

	const nameBGL = document.getElementById("nameBGL");
	const nameBGR = document.getElementById("nameBGR");
	const charP1 = document.getElementById("charP1");
	const charP2 = document.getElementById("charP2");
	const charP3 = document.getElementById("charP3");
	const charP4 = document.getElementById("charP4");
	const wlL = document.getElementById("wlL");
	const wlR = document.getElementById("wlR");

	if (gamemode == 2) {
		const doubles = document.getElementsByClassName("doubles");
		Array.from(doubles).forEach(el => {
			el.style.display = "inline";
		});

		nameBGL.setAttribute('src', "Resources/Overlay/Scoreboard/Name BG Duo.png");
		nameBGL.style.left = "301px";
		leftWrapper.style.left = "360px";
		leftWrapper.style.width = "340px";
		leftTeam.style.left = "360px";
		leftTeam.style.width = "340px";

		nameBGR.setAttribute('src', "Resources/Overlay/Scoreboard/Name BG Duo.png");
		nameBGR.style.right = "299px";
		rightWrapper.style.right = "358px";
		rightWrapper.style.width = "340px";
		rightTeam.style.right = "358px";
		rightTeam.style.width = "340px";

		charP1.style.top = "57px";
		charP1.style.left = "-17px";
		charP2.style.top = "57px";
		charP2.style.right = "119px";

		wlL.style.left = "-275px";
		wlR.style.right = "-275px";

	} else if (gamemode == 3) {
		const trios = document.getElementsByClassName("trios");
		Array.from(trios).forEach(el => {
			el.style.display = "inline";
		});

		nameBGL.setAttribute('src', "Resources/Overlay/Scoreboard/Name BG Trio.png");
		nameBGL.style.left = "335px";
		nameBGL.style.top = "61px";
		leftWrapper.style.left = "398px";
		leftWrapper.style.top = "59px";
		leftWrapper.style.width = "420px";
		leftTeam.style.left = "398px";
		leftTeam.style.top = "59px";
		leftTeam.style.width = "420px";

		nameBGR.setAttribute('src', "Resources/Overlay/Scoreboard/Name BG Trio.png");
		nameBGR.style.right = "333px";
		nameBGR.style.top = "61px";
		rightWrapper.style.right = "398px";
		rightWrapper.style.top = "59px";
		rightWrapper.style.width = "420px";
		rightTeam.style.right = "398px";
		rightTeam.style.top = "59px";
		rightTeam.style.width = "420px";

		charP1.style.left = "-278px";
		charP3.style.left = "-139px";
		charP3.style.top = "0px";
		
		charP4.style.right = "-141px";
		charP4.style.top = "0px";

		wlL.style.left = "-27px";
		wlL.style.top = "56px";
		wlR.style.right = "-29px";
		wlR.style.top = "56px";

	}
}


//checks if any of the player texts has been changed
function checkPTexts(player, side) {
	let i = side == "left" ? 1 : 2;
	for (i; i < 7; i+=2) {
		if (document.getElementById('p'+i+'Name').textContent != player[i].name ||
		  document.getElementById('p'+i+'Tag').textContent != player[i].tag) {
			return true;
		}
	}
	return false;
}


//did an image fail to load? this will be used to show nothing
function showNothing(itemEL) {
	itemEL.setAttribute('src', 'Resources/Literally Nothing.png');
}


//score change
function updateScore(scoreID, pScore, bestOf, side, playAnim) {
	if (playAnim) { //do we want to play the score up animation?
		//depending on the side, change the clip
		const scoreUpEL = document.getElementById("scoreUp" + side);
		scoreUpEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Score/ScoreUp ' + side + '.webm');
		scoreUpEL.play();
	}
	const scoreEL = document.getElementById(scoreID);
	//change the image depending on the bestOf status and, of course, the current score
	if (pScore == 0) {
		scoreEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Score/' + bestOf + ' ' + pScore + '.png')
	} else {
		scoreEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Score/' + bestOf + ' ' + pScore + ' ' + side + '.png')
	}

	if (startup) {scoreEL.addEventListener("error", () => {showNothing(scoreEL)})}
}


//set on an interval, to change the main side's texts
function switchTexts(side) {
	if (sideSwitch) {
		fadeOut("#"+side+"Team", () => {
			fadeIn("#"+side+"Wrapper");
		});
	} else {
		fadeOut("#"+side+"Wrapper", () => {
			fadeIn("#"+side+"Team");
		});
	}
}

//updates the 3 player texts of a side at once
function updatePlayerTexts(player, side, s) {
	let i = side == "left" ? 1 : 2;
	for (i; i < 7; i+=2) {
		//update the actual texts
		updatePlayerName('p'+i+'Name', 'p'+i+'Tag', player[i].name, player[i].tag);
	}
	//set the initial size for the slashes so they get resized later
	document.getElementById("slash"+s+"1").style.fontSize = nameSize;
	document.getElementById("slash"+s+"2").style.fontSize = nameSize;
	//resize texts if they overflows, wont affect texts that are not displayed
	resizeText(document.getElementById(side+'Wrapper'));
}

//player text change
function updatePlayerName(nameID, tagID, pName, pTag) {
	const nameEL = document.getElementById(nameID);
	nameEL.style.fontSize = nameSize; //set original text size
	nameEL.textContent = pName; //change the actual text
	const tagEL = document.getElementById(tagID);
	tagEL.style.fontSize = tagSize;
	tagEL.textContent = pTag;
}


//generic text changer
function updateText(textID, textToType, maxSize) {
	const textEL = document.getElementById(textID);
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	resizeText(textEL); //resize it if it overflows
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
function fadeInChara(itemID, charScale) {
	gsap.fromTo(itemID,
		{scale: charScale}, //set scale keyframe so it doesnt scale while transitioning
		{delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}
	);
}

//fade in for the characters when first loading
function initCharaFade(charaID, move, timeDelay = introDelay) {
	gsap.fromTo(charaID,
		{x: move, opacity: 0},
		{delay: timeDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
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

	if (startup) {pWLEL.addEventListener("error", () => {showNothing(pWLEL);})}
}

//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth) {
		if (childrens.length > 0) { //for tag+player texts
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
		oReq.open("GET", 'Resources/Characters/' + pCharacter + '/_Info.json');
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
		charEL.setAttribute('src', 'Resources/Characters/Random/Icon.png');
	})}

	//change the image path depending on the character and skin
	if (pCharacter == "Random") {
		const pNum = charID.substring(1, 2);
		if (pNum % 2 == 0) {
			charEL.setAttribute('src', 'Resources/Characters/Random/Icon Flip.png');
		} else {
			charEL.setAttribute('src', 'Resources/Characters/Random/Icon.png');
		}
	} else {
		charEL.setAttribute('src', 'Resources/Characters/' + pCharacter + '/Full.png');
	}


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

	return charPos[2]; //we need this one to set scale keyframe when fading back
}
