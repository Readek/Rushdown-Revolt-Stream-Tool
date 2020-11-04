//animation stuff
const pCharMove = 30; //distance to move for the character images

const fadeInTime = .4; //(seconds)
const fadeOutTime = .3;
const introDelay = .5; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const playerSize = '120px';
const tagSize = '70px';
const roundSize = '70px';
const tournamentSize = '50px';
const casterSize = '40px';
const twitterSize = '35px';

//to avoid the code constantly running the same method over and over
let p1CharacterPrev, p2CharacterPrev, p3CharacterPrev, p4CharacterPrev, p5CharacterPrev, p6CharacterPrev;
let p1ScorePrev, p2ScorePrev;
let bestOfPrev;

//variables for the twitter/twitch constant change
let socialInt1, socialInt2;
let twitter1, twitch1, twitter2, twitch2;
let socialSwitch = true; //true = twitter, false = twitch
const socialTimer = 7000;

//team/player texts intervals
let leftInt, rightInt;
let sideSwitch = true; //true = teams, false = players
const sideTimer = 10000;

let startup = true;


window.onload = init;
function init() {
	async function mainLoop() {
		const scInfo = await getInfo();
		getData(scInfo);
	}

	mainLoop();
	setInterval( () => { mainLoop() }, 500); //update interval
}

	
async function getData(scInfo) {

	const player = scInfo['player'];
	const teamName = scInfo['teamName'];

	const score = scInfo['score'];

	const bestOf = scInfo['bestOf'];
	const gamemode = scInfo['gamemode'];

	const round = scInfo['round'];
	const tournamentName = scInfo['tournamentName'];

	const caster = scInfo['caster'];


	//first, things that will happen only the first time the html loads
	if (startup) {

		//first, check the gamemode and show whats needed
		if (gamemode == 2) {
			const doubles = document.getElementsByClassName("doubles");
			Array.from(doubles).forEach(el => {
				el.style.display = "inline";
			});

			document.getElementById("charImgP1").style.left = "-140px";
			document.getElementById("charP1").style.clip = "rect(0px,480px,1080px,0px)";
			document.getElementById("charImgP3").style.left = "340px";
			document.getElementById("charP3").style.clip = "rect(0px,1060px,1080px,480px)";

			document.getElementById("charImgP2").style.right = "340px";
			document.getElementById("charP2").style.clip = "rect(0px,-480px,1080px,-1060px)";
			document.getElementById("charImgP4").style.right = "-140px";
			document.getElementById("charP4").style.clip = "rect(0px,0px,1080px,-480px)";

			document.getElementById("separator").setAttribute('src', "Resources/Overlay/VS Screen/Duos Separators.png")
		} else if (gamemode == 3) {
			const trios = document.getElementsByClassName("trios");
			Array.from(trios).forEach(el => {
				el.style.display = "inline";
			});

			document.getElementById("charImgP1").style.left = "-380px";
			document.getElementById("charP1").style.clip = "rect(0px,326px,1080px,0px)";
			document.getElementById("charImgP3").style.left = "-50px";
			document.getElementById("charP3").style.clip = "rect(0px,652px,1080px,326px)";
			document.getElementById("charImgP5").style.left = "270px";
			document.getElementById("charP5").style.clip = "rect(0px,1060px,1080px,652px)";

			document.getElementById("charImgP2").style.right = "270px";
			document.getElementById("charP2").style.clip = "rect(0px,-652px,1080px,-1060px)";
			document.getElementById("charImgP4").style.right = "-50px";
			document.getElementById("charP4").style.clip = "rect(0px,-326px,1080px,-652px)";
			document.getElementById("charImgP6").style.right = "-380px";
			document.getElementById("charP6").style.clip = "rect(0px,0px,1080px,-326px)";

			document.getElementById("separator").setAttribute('src', "Resources/Overlay/VS Screen/Trios Separators.png")
		}
		

		//left side texts
		updatePlayerTexts(player, "left", "L");
		//we will also update the team name
		updateText('leftTeam', teamName[1], playerSize);
		document.getElementById("leftTeam").style.webkitTextStrokeWidth = strokeCalc(teamName[1].length) + "px";

		//if singles, just show the player texts
		if (gamemode == 1) {
			fadeIn("#leftWrapper", introDelay+.25);
		} else {
			//if the team name exists
			if (teamName[1]) {
				fadeIn("#leftTeam", introDelay+.25); //show team name
				//keep changing team name and player names
				leftInt = setInterval(() => {
					switchTexts("left");
				}, sideTimer);
			} else { //if no team name, just show player texts
				fadeIn("#leftWrapper", introDelay+.25);
			}
		}


		//same for player 2
		updatePlayerTexts(player, "right", "R");
		updateText('rightTeam', teamName[2], playerSize);
		document.getElementById("rightTeam").style.webkitTextStrokeWidth = strokeCalc(teamName[2].length) + "px";

		if (gamemode == 1) {
			fadeIn("#rightWrapper", introDelay+.25);
		} else {
			if (teamName[2]) {
				fadeIn("#rightTeam", introDelay+.25);
				rightInt = setInterval(() => {
					switchTexts("right");
				}, sideTimer);
			} else {
				fadeIn("#rightWrapper", introDelay+.25);
			}
		}


		//this is what decides when to change something
		setInterval(() => {
			if (sideSwitch) {
				sideSwitch = false;
			} else {
				sideSwitch = true;
			};
		}, sideTimer);


		//set p1 character
		updateChar(player[1].character, 'charImgP1',);
		//move the character
		initCharaFade("#charP1");

		if (gamemode == 1) {
			updateBG(player[1].character, 'bgImgL');
		} else {
			updateChar(player[3].character, 'charImgP3');
			initCharaFade("#charP3", .15);
			if (gamemode == 3) {
				updateChar(player[5].character, 'charImgP5');
				initCharaFade("#charP5", .3);
			}
			updateBG("Ashani", 'bgImgL');
		}
		//save character info so we change them later if different
		p1CharacterPrev = player[1].character;
		p3CharacterPrev = player[3].character;
		p5CharacterPrev = player[5].character;

		//same for p2
		updateChar(player[2].character, 'charImgP2');
		initCharaFade("#charP2");
		if (gamemode == 1) {
			updateBG(player[2].character, 'bgImgR');
		} else {
			updateChar(player[4].character, 'charImgP4');
			initCharaFade("#charP4", .15);
			if (gamemode == 3) {
				updateChar(player[6].character, 'charImgP6');
				initCharaFade("#charP6", .3);
			}
			updateBG("Ezzie", 'bgImgR');
		}
		initCharaFade("#charP2");
		p2CharacterPrev = player[2].character;
		p4CharacterPrev = player[4].character;
		p6CharacterPrev = player[6].character;


		//set the intial score with an animation depending on the score
		if (bestOf == "Bo3") { //+1 if bo3 so assets show alright
			scoreIntro("L", score[1]+1, introDelay+.3);
			scoreIntro("R", score[2]+1, introDelay+.3);
		} else {
			scoreIntro("L", score[1], introDelay+.3);
			scoreIntro("R", score[2], introDelay+.3);
		}
		//fade in the scores, hide if no names in case you want to do thumbnails or something idk
		if (player[1].name && player[2].name) {
			fadeIn("#scores", introDelay+.25);
		}
		p1ScorePrev = score[1];
		p2ScorePrev = score[2];


		//set the initial "best of" status
		updateBo(bestOf);
		bestOfPrev = bestOf;


		//set the round and tournament texts
		updateText("round", round, roundSize);
		updateText("tournament", tournamentName, tournamentSize);
		//if neither have anything, dont fade the thing
		if (round || tournamentName) {
			fadeIn("#roundInfo", introDelay+.25)
		}


		//set the caster info
		updateText("caster1", caster[1].name, casterSize);
		updateSocialText("twitter1", caster[1].twitter, twitterSize, "twitter1Wrapper");
		updateSocialText("twitch1", caster[1].twitch, twitterSize, "twitch1Wrapper");
		updateText("caster2", caster[2].name, casterSize);
		updateSocialText("twitter2", caster[2].twitter, twitterSize, "twitter2Wrapper");
		updateSocialText("twitch2", caster[2].twitch, twitterSize, "twitch2Wrapper");

		//setup twitter/twitch change
		twitter1 = caster[1].twitter;
		twitch1 = caster[1].twitch;
		twitter2 = caster[2].twitter;
		twitch2 = caster[2].twitch;
		socialChange1("twitter1Wrapper", "twitch1Wrapper");
		socialChange2("twitter2Wrapper", "twitch2Wrapper");
		//set an interval to keep changing the names
		socialInt1 = setInterval( () => {
			socialChange1("twitter1Wrapper", "twitch1Wrapper");
		}, socialTimer);
		socialInt2 = setInterval( () => {
			socialChange2("twitter2Wrapper", "twitch2Wrapper");
		}, socialTimer);

		//keep changing this boolean for the previous intervals ()
		setInterval(() => {
			if (socialSwitch) { //true = twitter, false = twitch
				socialSwitch = false;
			} else {
				socialSwitch = true;
			}
		}, socialTimer);

		//if no casters, dont show anything
		if (caster[1].name || caster[2].name) {
			fadeIn("#casterInfo", introDelay+.25);
		}

		startup = false; //next time we run this function, it will skip all we just did
	}

	//now things that will happen constantly
	else {

		//player 1 name change
		if (document.getElementById('p1Name').textContent != player[1].name ||
			document.getElementById('p1Tag').textContent != player[1].tag ||
			document.getElementById('p3Name').textContent != player[3].name ||
			document.getElementById('p3Tag').textContent != player[3].tag ||
			document.getElementById('p5Name').textContent != player[5].name ||
			document.getElementById('p5Tag').textContent != player[5].tag) { //well this is ugly
			//fade out player 1 text
			fadeOut("#leftWrapper", () => {
				//now that nobody is seeing it, change the text content!
				updatePlayerTexts(player, "left", "L");
				//and fade the name back in
				if (!sideSwitch || !teamName[1]) {
					fadeIn("#leftWrapper", .2);
				}
			});

			//hide the score overlay when no texts
			if (player[1].name || player[2].name) {
				fadeIn("#scores");
			} else {
				fadeOut("#scores");
			}
		}

		//same for player 2
		if (document.getElementById('p2Name').textContent != player[2].name ||
			document.getElementById('p2Tag').textContent != player[2].tag ||
			document.getElementById('p4Name').textContent != player[4].name ||
			document.getElementById('p4Tag').textContent != player[4].tag ||
			document.getElementById('p6Name').textContent != player[6].name ||
			document.getElementById('p6Tag').textContent != player[6].tag){
			fadeOut("#rightWrapper", () => {
				updatePlayerTexts(player, "right", "R");
				if (!sideSwitch || !teamName[2]) {
					fadeIn("#rightWrapper", .2);
				}
			});

			if (player[1].name || player[2].name) {
				fadeIn("#scores");
			} else {
				fadeOut("#scores");
			}
		}


		//team check
		if (document.getElementById('leftTeam').textContent != teamName[1] && gamemode != 1) {
			const prevText = document.getElementById("leftTeam").textContent;
			fadeOut("#leftTeam", () => {
				if (prevText && teamName[1]) {
					if (sideSwitch) {
						fadeIn("#leftTeam");
					}
				} else if (!prevText && teamName[1]) {

					if (sideSwitch) {
						fadeOut("#leftWrapper", () => {
							fadeIn("#leftTeam");
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
					fadeIn("#leftWrapper");
				}
				updateText('leftTeam', teamName[1], playerSize);
			});
		};

		if (document.getElementById('rightTeam').textContent != teamName[2] && gamemode != 1) {
			const prevText = document.getElementById("rightTeam").textContent;
			fadeOut("#rightTeam", () => {
				if (prevText && teamName[2]) {
					if (sideSwitch) {
						fadeIn("#rightTeam");
					}
				} else if (!prevText && teamName[2]) {

					if (sideSwitch) {
						fadeOut("#rightWrapper", () => {
							fadeIn("#rightTeam");
						});
					}

					rightInt = setInterval(() => {
						switchTexts("right");
					}, sideTimer);

					if (teamName[1]) {
						clearInterval(leftInt);
						leftInt = setInterval(() => {
							switchTexts("left");
						}, sideTimer);
					}

				} else if (prevText && !teamName[2]) {
					clearInterval(rightInt);
					fadeIn("#rightWrapper");
				}
				updateText('rightTeam', teamName[2], playerSize);
			});
		};


		//player 1 character change
		if (p1CharacterPrev != player[1].character) {

			//move and fade out the character
			charaFadeOut("#charP1", () => {
				//update the character image and trail, and also storing its scale for later
				updateChar(player[1].character, 'charImgP1');
				//move and fade them back
				charaFadeIn("#charP1");
			});

			if (gamemode == 1) {
				fadeOut("#bgImgL", () => {
					updateBG(player[1].character, 'bgImgL');
					fadeIn("#bgImgL")
				});
			}

			p1CharacterPrev = player[1].character;
		}

		//same for player 2
		if (p2CharacterPrev != player[2].character) {

			charaFadeOut("#charP2", () => {
				updateChar(player[2].character, 'charImgP2');
				charaFadeIn("#charP2");
			});

			if (gamemode == 1) {
				fadeOut("#bgImgL", () => {
					updateBG(player[1].character, 'bgImgL');
					fadeIn("#bgImgL")
				});
			}
		
			p2CharacterPrev = player[2].character;
		}

		if (p3CharacterPrev != player[3].character) {
			charaFadeOut("#charP3", () => {
				updateChar(player[3].character, 'charImgP3');
				charaFadeIn("#charP3");
			});
			p3CharacterPrev = player[3].character;
		}
		if (p4CharacterPrev != player[4].character) {
			charaFadeOut("#charP4", () => {
				updateChar(player[4].character, 'charImgP4');
				charaFadeIn("#charP4");
			});
			p4CharacterPrev = player[4].character;
		}
		if (p5CharacterPrev != player[5].character) {
			charaFadeOut("#charP5", () => {
				updateChar(player[5].character, 'charImgP5');
				charaFadeIn("#charP5");
			});
			p5CharacterPrev = player[5].character;
		}
		if (p6CharacterPrev != player[6].character) {
			charaFadeOut("#charP6", () => {
				updateChar(player[6].character, 'charImgP6');
				charaFadeIn("#charP6");
			});
			p6CharacterPrev = player[6].character;
		}


		//update the score if it changed
		if (p1ScorePrev != score[1]) {
			//if this is best of 3, we will add +1 to the score count to change the right assets
			if (bestOf == "Bo3") {
				scoreUpdate("L", score[1]+1);
			} else {
				scoreUpdate("L", score[1]);
			}
			p1ScorePrev = score[1];
		}

		//time for the right side
		if (p2ScorePrev != score[2]) {
			//if this is best of 3, we will add +1 to the score count to change the right assets
			if (bestOf == "Bo3") {
				scoreUpdate("R", score[2]+1);
			} else {
				scoreUpdate("R", score[2]);
			}
			p2ScorePrev = score[2];
		}


		//"best of" update
		if (bestOfPrev != bestOf) {
			updateBo(bestOf);
			if (bestOf == "Bo3") {
				scoreUpdate("L", score[1]+1);
				scoreUpdate("R", score[2]+1);
			} else {
				scoreUpdate("L", score[1]);
				scoreUpdate("R", score[2]);
			}
			bestOfPrev = bestOf;
		}


		//update round text
		if (document.getElementById('round').textContent != round){
			fadeOut("#round", () => {
				updateText("round", round, roundSize);
				fadeIn("#round", .2);
			});

			//hide the background if no text is found
			if (round || tournamentName) {
				fadeIn("#roundInfo");
			} else {
				fadeOut("#roundInfo");
			}
		}

		//update tournament text
		if (document.getElementById('tournament').textContent != tournamentName){
			fadeOut("#tournament", () => {
				updateText("tournament", tournamentName, tournamentSize);
				fadeIn("#tournament", .2);
			});

			if (round || tournamentName) {
				fadeIn("#roundInfo");
			} else {
				fadeOut("#roundInfo");
			}
		}


		//update caster 1 info
		if (document.getElementById('caster1').textContent != caster[1].name){
			fadeOut("#caster1", () => {
				updateText("caster1", caster[1].name, casterSize);
				fadeIn("#caster1", .2);
			});
			//hide the background if no caster names
			if (caster[1].name || caster[2].name) {
				fadeIn("#casterInfo");
			} else {
				fadeOut("#casterInfo");
			}
		}
		//caster 1's twitter
		if (document.getElementById('twitter1').textContent != caster[1].twitter){
			twitter1 = caster[1].twitter;
			updateSocial(caster[1].twitter, "twitter1", "twitter1Wrapper", twitch1, "twitch1Wrapper");
		}
		//caster 2's twitch (same as above)
		if (document.getElementById('twitch1').textContent != caster[1].twitch){
			twitch1 = caster[1].twitch;
			updateSocial(caster[1].twitch, "twitch1", "twitch1Wrapper", caster[1].twitter, "twitter1Wrapper");
		}

		//caster 2, same as above
		if (document.getElementById('caster2').textContent != caster[2].name){
			fadeOut("#caster2", () => {
				updateText("caster2", caster[2].name, casterSize);
				fadeIn("#caster2", .2);
			});
			if (caster[1].name || caster[2].name) {
				fadeIn("#casterInfo");
			} else {
				fadeOut("#casterInfo");
			}
		}
		if (document.getElementById('twitter2').textContent != caster[2].twitter){
			twitter2 = caster[2].twitter;
			updateSocial(caster[2].twitter, "twitter2", "twitter2Wrapper", twitch2, "twitch2Wrapper");
		}

		if (document.getElementById('twitch2').textContent != caster[2].twitch){
			twitch2 = caster[2].twitch;
			updateSocial(caster[2].twitch, "twitch2", "twitch2Wrapper", caster[2].twitter, "twitter2Wrapper");
		}
	}
}


//did an image fail to load? this will be used to show nothing
function showNothing(itemEL) {
	itemEL.setAttribute('src', 'Resources/Literally Nothing.png');
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


//the logic behind the twitter/twitch constant change
function socialChange1(twitterWrapperID, twitchWrapperID) {

	const twitterWrapperEL = document.getElementById(twitterWrapperID);
	const twitchWrapperEL = document.getElementById(twitchWrapperID);

	if (startup) {

		//if first time, set initial opacities so we can read them later
		if (!twitter1 && !twitch1) { //if all blank
			twitterWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 0;
		} else if (!twitter1 && !!twitch1) { //if twitter blank
			twitterWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 1;
		} else {
			twitterWrapperEL.style.opacity = 1;
			twitchWrapperEL.style.opacity = 0;
		}
		

	} else if (!!twitter1 && !!twitch1) {

		if (socialSwitch) {
			fadeOut(twitterWrapperEL, () => {
				fadeIn(twitchWrapperEL, 0);
			});
		} else {
			fadeOut(twitchWrapperEL, () => {
				fadeIn(twitterWrapperEL, 0);
			});
		}

	}
}
//i didnt know how to make it a single function im sorry ;_;
function socialChange2(twitterWrapperID, twitchWrapperID) {

	const twitterWrapperEL = document.getElementById(twitterWrapperID);
	const twitchWrapperEL = document.getElementById(twitchWrapperID);

	if (startup) {

		if (!twitter2 && !twitch2) {
			twitterWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 0;
		} else if (!twitter2 && !!twitch2) {
			twitterWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 1;
		} else {
			twitterWrapperEL.style.opacity = 1;
			twitchWrapperEL.style.opacity = 0;
		}

	} else if (!!twitter2 && !!twitch2) {

		if (socialSwitch) {
			fadeOut(twitterWrapperEL, () => {
				fadeIn(twitchWrapperEL, 0);
			});
		} else {
			fadeOut(twitchWrapperEL, () => {
				fadeIn(twitterWrapperEL, 0);
			});
		}

	}
}
//function to decide when to change to what
function updateSocial(mainSocial, mainText, mainWrapper, otherSocial, otherWrapper) {
	//check if this is for twitch or twitter
	let localSwitch = socialSwitch;
	if (mainText.includes("twitch")) {
		localSwitch = !localSwitch;
	}
	//check if this is their turn so we fade out the other one
	if (localSwitch) {
		fadeOut("#"+otherWrapper, () => {})
	}

	//now do the classics
	fadeOut("#"+mainWrapper, () => {
		updateSocialText(mainText, mainSocial, twitterSize, mainWrapper);
		//check if its twitter's turn to show up
		if (otherSocial == "" && mainSocial != "") {
			fadeIn("#"+mainWrapper, .2);
		} else if (localSwitch && mainSocial != "") {
			fadeIn("#"+mainWrapper, .2);
		} else if (otherSocial != "") {
			fadeIn("#"+otherWrapper, .2);
		}
	});
}

//player text change
function updatePlayerName(nameID, tagID, pName, pTag) {
	const nameEL = document.getElementById(nameID);
	nameEL.style.fontSize = playerSize; //set original text size
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
//social text changer
function updateSocialText(textID, textToType, maxSize, wrapper) {
	const textEL = document.getElementById(textID);
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	const wrapperEL = document.getElementById(wrapper)
	resizeText(wrapperEL); //resize it if it overflows
}

//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth || textEL.scrollHeight > textEL.offsetHeight) {
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

//updates the 3 player texts of a side at once
function updatePlayerTexts(player, side, s) {
	let i = side == "left" ? 1 : 2;
	//calculate the text stroke width depending on the length of the wrapper
	const strokeNum = strokeCalc(
		player[i].name.length + player[i].tag.length + 
		player[i+2].name.length + player[i+2].tag.length + 
		player[i+4].name.length + player[i+4].tag.length
	);
	for (i; i < 7; i+=2) {
		//update the actual texts
		updatePlayerName('p'+i+'Name', 'p'+i+'Tag', player[i].name, player[i].tag);
		//change the stroke width
		document.getElementById('p'+i+'Name').style.webkitTextStrokeWidth = strokeNum + "px";
		document.getElementById('p'+i+'Tag').style.webkitTextStrokeWidth = strokeNum-1 + "px";
	}
	//set the initial size for the slashes so they get resized later
	document.getElementById("slash"+s+"1").style.fontSize = playerSize;
	document.getElementById("slash"+s+"2").style.fontSize = playerSize;
	//resize texts if they overflows, wont affect texts that are not displayed
	resizeText(document.getElementById(side+'Wrapper'));
}

//"calculates" stroke width
function strokeCalc(num) {
	if (num > 15) {
		if (num > 20) {
			return 2;
		} else {
			return 3;
		}
	} else {
		return 4;
	}
}

//fade out
function fadeOut(itemID, funct = () => {}, dur = fadeOutTime) {
	gsap.to(itemID, {opacity: 0, duration: dur, onComplete: funct});
}

//fade in
function fadeIn(itemID, timeDelay, dur = fadeInTime) {
	gsap.to(itemID, {delay: timeDelay, opacity: 1, duration: dur});
}

//fade out for the characters
function charaFadeOut(itemID, funct) {
	gsap.to(itemID, {delay: .2, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: funct});
}

//fade in characters edition
function charaFadeIn(charaID) {
	//move the character
	gsap.to(charaID, {delay: .3, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
}

//initial characters fade in
function initCharaFade(charaID, timeDelay = 0) {
	//character movement
	gsap.fromTo(charaID,
		{opacity: 0},
		{delay: introDelay + timeDelay, opacity: 1, ease: "power2.out", duration: fadeInTime});
}


//score intro animation, not using gsap because idk how to make it work with filters
function scoreIntro(side, score, timeDelay) {
	if (score > 0) {
		setTimeout(() => {
			document.getElementById("score"+side+"1").style.filter = "grayscale(0)";
		}, timeDelay*1000+500);
	}
	if (score > 1) {
		setTimeout(() => {
			document.getElementById("score"+side+"2").style.filter = "grayscale(0)";
		}, timeDelay*1000+750);
	}
	if (score > 2) {
		setTimeout(() => {
			document.getElementById("score"+side+"3").style.filter = "grayscale(0)";
		}, timeDelay*1000+1000);
	}
}

//score update and some ugly hardcoding
function scoreUpdate(side, score) {
	if (score == 0) {
		document.getElementById("score"+side+"1").style.filter = "grayscale(1)";
		document.getElementById("score"+side+"2").style.filter = "grayscale(1)";
		document.getElementById("score"+side+"3").style.filter = "grayscale(1)";
	} else if (score == 1) {
		document.getElementById("score"+side+"1").style.filter = "grayscale(0)";
		document.getElementById("score"+side+"2").style.filter = "grayscale(1)";
		document.getElementById("score"+side+"3").style.filter = "grayscale(1)";
	} else if (score == 2) {
		document.getElementById("score"+side+"1").style.filter = "grayscale(0)";
		document.getElementById("score"+side+"2").style.filter = "grayscale(0)";
		document.getElementById("score"+side+"3").style.filter = "grayscale(1)";
	} else {
		document.getElementById("score"+side+"1").style.filter = "grayscale(0)";
		document.getElementById("score"+side+"2").style.filter = "grayscale(0)";
		document.getElementById("score"+side+"3").style.filter = "grayscale(0)";
	}
}


//"best of" update
function updateBo(bestOf) {
	if (bestOf == "Bo5") {
		fadeIn("#scoreL1");
		fadeIn("#scoreR1");
	} else {
		fadeOut("#scoreL1");
		fadeOut("#scoreR1");
	}
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


//character update!
function updateChar(pCharacter, charID) {

	//store so code looks cleaner later
	const charEL = document.getElementById(charID);

	//this will trigger whenever the image loaded cant be found
	if (startup) {
		//if the image fails to load, we will put a placeholder
		charEL.addEventListener("error", () => {
			showNothing(charEL);
		});
	}

	//change the image path depending on the character and skin
	charEL.setAttribute('src', 'Resources/Characters/Poster/' + pCharacter + '.png');
}

//background change, same as above
function updateBG(pCharacter, bgID) {
	const bgEL = document.getElementById(bgID);
	if (startup) {
		bgEL.addEventListener("error", () => {
			showNothing(bgEL);
		});
	}
	bgEL.setAttribute('src', 'Resources/Backgrounds/' + pCharacter + '.jpg');
}