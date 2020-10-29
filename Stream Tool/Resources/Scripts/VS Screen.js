//animation stuff
const pCharMove = 30; //distance to move for the character images

const fadeInTime = .4; //(seconds)
const fadeOutTime = .3;
const introDelay = .5; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const playerSize = '120px';
const teamSize = '70px';
const roundSize = '70px';
const tournamentSize = '50px';
const casterSize = '40px';
const twitterSize = '35px';

//to store the current character info
let p1CharInfo, p2CharInfo;

//to avoid the code constantly running the same method over and over
let p1CharacterPrev, p2CharacterPrev;
let p1ScorePrev, p2ScorePrev;
let bestOfPrev;

//variables for the twitter/twitch constant change
let socialInt1, socialInt2;
let twitter1, twitch1, twitter2, twitch2;
let socialSwitch = true; //true = twitter, false = twitch
const socialInterval = 7000;

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
	const wl = scInfo['wl'];

	const bestOf = scInfo['bestOf'];
	const gamemode = scInfo['gamemode'];

	const round = scInfo['round'];
	const tournamentName = scInfo['tournamentName'];

	const caster = scInfo['caster'];


	//first, things that will happen only the first time the html loads
	if (startup) {
		//starting with the player 1 name
		updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', player[1].name, player[1].tag);
		//fade in the player text
		fadeIn("#p1Wrapper", introDelay+.15);

		//same for player 2
		updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', player[2].name, player[2].tag);
		fadeIn("#p2Wrapper", introDelay+.15);


		//set the character info for p1
		p1CharInfo = await getCharInfo(player[1].character);
		//set p1 character
		updateChar(player[1].character, 'charImgP1', p1CharInfo, 'bgImgP1');
		//move the character
		initCharaFade("#charP1");
		//save character info so we change them later if different
		p1CharacterPrev = player[1].character;

		//same for p2
		p2CharInfo = await getCharInfo(player[2].character);
		updateChar(player[2].character, 'charImgP2', p2CharInfo, 'bgImgP2');
		initCharaFade("#charP2");
		p2CharacterPrev = player[2].character;


		//set the intial score with an animation depending on the score
		if (bestOf == "Bo3") { //+1 if bo3 so assets show alright
			scoreIntro("L", score[1]+1, introDelay);
			scoreIntro("R", score[2]+1, introDelay);
		} else {
			scoreIntro("L", score[1], introDelay);
			scoreIntro("R", score[2], introDelay);
		}
		p1ScorePrev = score[1];
		p2ScorePrev = score[2];


		//set the initial "best of" status
		updateBo(bestOf);
		bestOfPrev = bestOf;


		//set the round text
		updateText("round", round, roundSize);

		//set the tournament text
		updateText("tournament", tournamentName, tournamentSize);

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
		}, socialInterval);
		socialInt2 = setInterval( () => {
			socialChange2("twitter2Wrapper", "twitch2Wrapper");
		}, socialInterval);

		//keep changing this boolean for the previous intervals ()
		setInterval(() => {
			if (socialSwitch) { //true = twitter, false = twitch
				socialSwitch = false;
			} else {
				socialSwitch = true;
			}
		}, socialInterval);


		startup = false; //next time we run this function, it will skip all we just did
	}

	//now things that will happen constantly
	else {

		//player 1 name change
		if (document.getElementById('p1Name').textContent != player[1].name ||
			document.getElementById('p1Team').textContent != player[1].tag) {
			//fade out player 1 text
			fadeOut("#p1Wrapper", () => {
				//now that nobody is seeing it, change the text content!
				updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', player[1].name, player[1].tag);
				//and fade the name back in
				fadeIn("#p1Wrapper", .2);
			});
		}

		//same for player 2
		if (document.getElementById('p2Name').textContent != player[2].name ||
			document.getElementById('p2Team').textContent != player[2].tag){
			fadeOut("#p2Wrapper", () => {
				updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', player[2].name, player[2].tag);
				fadeIn("#p2Wrapper", .2);
			});
		}


		//player 1 character change
		if (p1CharacterPrev != player[1].character) {

			//update the info
			p1CharInfo = await getCharInfo(player[1].character);

			//move and fade out the character
			charaFadeOut("#charP1", () => {
				//update the character image and trail, and also storing its scale for later
				updateChar(player[1].character, 'charImgP1', p1CharInfo, 'bgImgP1');
				//move and fade them back
				charaFadeIn("#charP1");
			});

			p1CharacterPrev = player[1].character;
		}

		//same for player 2
		if (p2CharacterPrev != player[2].character) {

			p2CharInfo = await getCharInfo(player[2].character);

			charaFadeOut("#charP2", () => {
				updateChar(player[2].character, 'charImgP2', p2CharInfo, 'bgImgP2');
				charaFadeIn("#charP2");
			});
		
			p2CharacterPrev = player[2].character;
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
		}

		//update tournament text
		if (document.getElementById('tournament').textContent != tournamentName){
			fadeOut("#tournament", () => {
				updateText("tournament", tournamentName, tournamentSize);
				fadeIn("#tournament", .2);
			});
		}


		//update caster 1 info
		if (document.getElementById('caster1').textContent != caster[1].name){
			fadeOut("#caster1", () => {
				updateText("caster1", caster[1].name, casterSize);
				fadeIn("#caster1", .2);
			});
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
function updatePlayerName(wrapperID, nameID, teamID, pName, pTeam) {
	const nameEL = document.getElementById(nameID);
	nameEL.style.fontSize = playerSize; //set original text size
	nameEL.textContent = pName; //change the actual text
	const teamEL = document.getElementById(teamID);
	teamEL.style.fontSize = teamSize;
	teamEL.textContent = pTeam;

	resizeText(document.getElementById(wrapperID)); //resize if it overflows
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

//fade out
function fadeOut(itemID, funct = console.log("Hola!"), dur = fadeOutTime) {
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
function initCharaFade(charaID) {
	//character movement
	gsap.fromTo(charaID,
		{opacity: 0},
		{delay: introDelay, opacity: 1, ease: "power2.out", duration: fadeInTime});
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
		document.getElementById("scoreL1").style.opacity = 1;
		document.getElementById("scoreR1").style.opacity = 1;
	} else {
		document.getElementById("scoreL1").style.opacity = 0;
		document.getElementById("scoreR1").style.opacity = 0;
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

//character update!
function updateChar(pCharacter, charID, charInfo, bgID) {

	//store so code looks cleaner later
	const charEL = document.getElementById(charID);
	const bgEL = document.getElementById(bgID);

	//this will trigger whenever the image loaded cant be found
	if (startup) {
		//if the image fails to load, we will put a placeholder
		charEL.addEventListener("error", () => {
			showNothing(charEL);
		});
		bgEL.addEventListener("error", () => {
			showNothing(bgEL);
		});
	}

	//change the image path depending on the character and skin
	charEL.setAttribute('src', 'Resources/Characters/Poster/' + pCharacter + '.png');
	bgEL.setAttribute('src', 'Resources/Backgrounds/' + pCharacter + '.jpg');


	/* //             x, y, scale
	let charPos = [0, 0, 1];
	//now, check if the character or skin exists in the json file we checked earler
	if (charInfo != "notFound") {
		if (charInfo.vsScreen) { 
			charPos[0] = charInfo.vsScreen.x;
			charPos[1] = charInfo.vsScreen.y;
			charPos[2] = charInfo.vsScreen.scale;
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		charPos[0] = 0;
		charPos[1] = 0;
		charPos[2] = 1;
	}

	charPos[0] = 200;
	charPos[1] = 0;
	charPos[2] = 1.5;

	//to position the character
	charEL.style.left = charPos[0] + "px";
	charEL.style.top = charPos[1] + "px";
	charEL.style.transform = "scale(" + charPos[2] + ")"; */
}