'use strict';

const { info } = require('console');
const fs = require('fs');
const path = require('path');

//path variables used when developing
const mainPath = path.resolve(__dirname, '..', '..', 'Stream Tool', 'Resources', 'Texts');
const charPath = path.resolve(__dirname, '..', '..', 'Stream Tool', 'Resources', 'Characters');

//change to these paths when building the executable
//Linux (appimage)
/* const mainPath = path.resolve('.', 'Resources', 'Texts');
const charPath = path.resolve('.', 'Resources', 'Characters'); */
//Windows (if building a portable exe)
/* const mainPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources', 'Texts');
const charPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources', 'Characters'); */


//yes we all like global variables
let currentP1WL = "Nada";
let currentP2WL = "Nada";
let currentBestOf = "Bo5";

let movedSettings = false;

let activeChar;

let inPF = false;
let currentFocus = -1;

let gamemode = 1;


const viewport = document.getElementById('viewport');

const charRoster = document.getElementById('charRoster')

const p1Win1 = document.getElementById('winP1-1');
const p1Win2 = document.getElementById('winP1-2');
const p1Win3 = document.getElementById('winP1-3');
const p2Win1 = document.getElementById('winP2-1');
const p2Win2 = document.getElementById('winP2-2');
const p2Win3 = document.getElementById('winP2-3');

const p1W = document.getElementById('p1W');
const p1L = document.getElementById('p1L');
const p2W = document.getElementById('p2W');
const p2L = document.getElementById('p2L');

const roundInp = document.getElementById('roundName');

const gmIcon1 = document.getElementById("gmIcon1");
const gmIcon2 = document.getElementById("gmIcon2");
const gmIcon3 = document.getElementById("gmIcon3");

const forceWL = document.getElementById('forceWLToggle');

const slidersH = document.getElementsByClassName("sliderH");
const slidersS = document.getElementsByClassName("sliderS");
const slidersV = document.getElementsByClassName("sliderV");

const recChecks = document.getElementsByClassName("recCheck");
const recList = document.getElementById("recList");
const recRadioF = document.getElementById("recRadioF");
const recRadioP = document.getElementById("recRadioP");

const recCan = document.getElementById("recolorImg");
let recSha, defaultCode, currentCode, skippedChars, currentRecCha;


// load gui settings
loadSettings();
function loadSettings() {
    let guiSettings = JSON.parse(fs.readFileSync(mainPath + "/GUI Settings.json", "utf-8"));
    if (guiSettings.forceWL) {forceWL.click()}
    document.getElementById("allowIntro").checked = guiSettings.allowIntro;
    defaultCode = guiSettings.defaultColorCode;
    currentCode = guiSettings.currentColorCode;
}

window.onload = init;
function init() {

    //first, add listeners for the bottom bar buttons
    document.getElementById('updateRegion').addEventListener("click", writeScoreboard);
    document.getElementById('settingsRegion').addEventListener("click", moveViewport);

    //if the viewport is moved, click anywhere on the center to go back
    document.getElementById('goBack').addEventListener("click", goBack);

    //move the viewport to the center (this is to avoid animation bugs)
    viewport.style.right = "100%";

    
    /* OVERLAY */


    //set initial values for the character selectors
    const charSelectors = document.getElementsByClassName("charSelector");
    for (let i = 0; i < charSelectors.length; i++) {
        //set the default image
        charSelectors[i].firstElementChild.firstElementChild.setAttribute('src', charPath + '/Random/Icon.png');
        //position the images
        positionChar("Random", charSelectors[i].firstElementChild.firstElementChild);
        //if clicking them, show the character roster
        charSelectors[i].addEventListener("click", openChars);
    }

    //create the character roster
    createCharRoster();
    //if clicking the entirety of the char roster div, hide it
    charRoster.addEventListener("click", hideChars);


    //check whenever an image isnt found so we replace it with a "?"
    document.getElementById('p1CharImg').addEventListener("error", () => {
        document.getElementById('p1CharImg').setAttribute('src', charPath + '/' + 'Random/Icon.png');
    });
    document.getElementById('p2CharImg').addEventListener("error", () => {
        document.getElementById('p2CharImg').setAttribute('src', charPath + '/' + 'Random/Icon.png');
    });


    //score tick listeners, to automatically check/uncheck the other ticks
    p1Win1.addEventListener("click", changeScoreTicks1);
    p2Win1.addEventListener("click", changeScoreTicks1);
    p1Win2.addEventListener("click", changeScoreTicks2);
    p2Win2.addEventListener("click", changeScoreTicks2);
    p1Win3.addEventListener("click", changeScoreTicks3);
    p2Win3.addEventListener("click", changeScoreTicks3);

    //set click listeners for the [W] and [L] buttons
    p1W.addEventListener("click", setWLP1);
    p1L.addEventListener("click", setWLP1);
    p2W.addEventListener("click", setWLP2);
    p2L.addEventListener("click", setWLP2);


    //for each player input field
    const pInputs = document.getElementsByClassName("playerText");
    for (let i = 0; i < pInputs.length; i++) {
        //prepare the player finder (player presets)
        preparePF(i+1);

        //check if theres a player preset every time we type in the player box
        pInputs[i].addEventListener("input", checkPlayerPreset);
        pInputs[i].addEventListener("focusin", checkPlayerPreset);
    }
    //for tag inputs, resize the container if it overflows
    const pTags = document.getElementsByClassName("tagText");
    Array.from(pTags).forEach(tag => {
        tag.addEventListener("input", resizeInput);
    });
    

    //set click listeners to change the "best of" status
    document.getElementById("bo3Div").addEventListener("click", changeBestOf);
    document.getElementById("bo5Div").addEventListener("click", changeBestOf);
    //set initial value
    document.getElementById("bo3Div").style.color = "var(--text2)";
    document.getElementById("bo5Div").style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";


    //check if the round is grand finals
    roundInp.addEventListener("input", checkRound);


    //gamemode selector
    document.getElementById("gamemode").addEventListener("click", changeGamemode);


    //add a listener to the swap button
    document.getElementById('swapButton').addEventListener("click", swap);
    //add a listener to the clear button
    document.getElementById('clearButton').addEventListener("click", clearPlayers);


    //quick trick to set all character variables to "Random", updating their images
    clearPlayers();


    /* SETTINGS */

    //set listeners for the settings checkboxes
    document.getElementById("allowIntro").addEventListener("click", allowIntroToggle)
    forceWL.addEventListener("click", forceWLtoggles);
    document.getElementById("copyMatch").addEventListener("click", copyMatch);
    document.getElementById("goToRecolor").addEventListener("click", toRecolors);


    /* KEYBOARD SHORTCUTS */

    //enter
    Mousetrap.bind('enter', () => {

        if (isPresetOpen()) {
            //if the player presets menu is open, load preset
            const pFinders = document.getElementsByClassName("playerFinder");
            Array.from(pFinders).forEach(pFinder => {
                if (pFinder.style.display == "block" && currentFocus > -1) {
                    pFinder.getElementsByClassName("finderEntry")[currentFocus].click();
                }
            });
        } else {
            //update scoreboard info (updates botBar color for visual feedback)
            writeScoreboard();
            document.getElementById('botBar').style.backgroundColor = "var(--bg3)";
        }

    }, 'keydown');
    Mousetrap.bind('enter', () => {
        document.getElementById('botBar').style.backgroundColor = "var(--bg5)";
    }, 'keyup');


    //esc to clear player info
    Mousetrap.bind('esc', () => {
        if (movedSettings) { //if settings are open, close them
            goBack();
        } else if (charRoster.style.display == "flex") { //if character roster is visible, hide it
            charRoster.click();
        } else if (isPresetOpen()) {
            const pFinders = document.getElementsByClassName("playerFinder")
            Array.from(pFinders).forEach(pFinder => {
                pFinder.style.display = "none";
            });
        } else {
            clearPlayers(); //by default, clear player info
        }
    });

    //F1 or F2 to give players a score tick
    Mousetrap.bind('f1', () => { giveWinP1() });
    Mousetrap.bind('f2', () => { giveWinP2() });

    //up/down, to navigate the player presets menu (only when a menu is shown)
    Mousetrap.bind('down', () => {
        const pFinders = document.getElementsByClassName("playerFinder");
        Array.from(pFinders).forEach(pFinder => {
            if (pFinder.style.display == "block") {
                currentFocus++;
                addActive(pFinder.getElementsByClassName("finderEntry"));
            }
        });
    });
    Mousetrap.bind('up', () => {
        const pFinders = document.getElementsByClassName("playerFinder");
        Array.from(pFinders).forEach(pFinder => {
            if (pFinder.style.display == "block") {
                currentFocus--;
                addActive(pFinder.getElementsByClassName("finderEntry"));
            }
        });
    });
}


function moveViewport() {
    if (!movedSettings) {
        viewport.style.right = "140%";
        document.getElementById('overlay').style.opacity = "25%";
        document.getElementById('goBack').style.display = "block"
        movedSettings = true;
    }
}

function goBack() {
    viewport.style.right = "100%";
    document.getElementById('overlay').style.opacity = "100%";
    document.getElementById('goBack').style.display = "none";
    movedSettings = false;
}

function isPresetOpen() {
    let theBool = false;
    const pFinders = document.getElementsByClassName("playerFinder");
    Array.from(pFinders).forEach(pFinder => {
        if (pFinder.style.display == "block") {
            theBool = true;
        }
    });

    return theBool;
}


function getCharJson(char) {
    try {
        const settingsRaw = fs.readFileSync(charPath + "/" + char + "/_Info.json");
        return JSON.parse(settingsRaw);
    } catch (error) {
        return undefined;
    }
}
function getPInfoJson(player) {
    try {
        const settingsRaw = fs.readFileSync(mainPath + "/Player Info/" + player + ".json");
        return JSON.parse(settingsRaw);
    } catch (error) {
        return undefined;
    }
}


//whenever we click on the character change button
function openChars() {
    activeChar = this;

    charRoster.style.display = "flex"; //show the thing
    setTimeout( () => { //right after, change opacity and scale
        charRoster.style.opacity = 1;
        charRoster.style.transform = "scale(1)";
    }, 0);
}
//to hide the character grid
function hideChars() {
    charRoster.style.opacity = 0;
    charRoster.style.transform = "scale(1.2)";
    setTimeout(() => {
        charRoster.style.display = "none";
    }, 200);
}

function createCharRoster() {

    // get the character list
    const characterList = getCharList();
    
    // add random at the end to make our lives easier later
    characterList.push("Random")

    //this separates top/bot rows by half of the list
    let row1 = characterList.length / 2;
    row1 = Math.ceil(row1); //if not even, round up

    //for each character on the list
    for (let i = 0; i < characterList.length; i++) {
        //create the container with the image and text
        const newDiv = document.createElement("div");
        newDiv.className = "rosterEntry";
        newDiv.id = characterList[i]; //we will read this value later
        newDiv.addEventListener("click", changeCharacter); //do this if clicked

        //create the actual image
        const newImg = document.createElement('img');
        newImg.className = "charRosterImg";
        if (i == characterList.length - 1) {
            newImg.setAttribute('src', charPath + '/Random/Icon.png');
        } else {
            newImg.setAttribute('src', charPath + '/' +characterList[i]+ '/CharSel.png');
        }
        newDiv.appendChild(newImg);

        //add in some sexy text with the name of the character
        const newText = document.createElement("div");
        newText.className = "textRoster";
        newText.innerHTML = characterList[i];
        newDiv.appendChild(newText);

        //does it go top row or bottom row?
        if (i < row1) {
            document.getElementById("rosterLine1").appendChild(newDiv);
        } else {
            document.getElementById("rosterLine2").appendChild(newDiv);
        }
    }
}

// check the names of the folders inside "Characters" (except for 'Random')
function getCharList() {
    const characterList = fs.readdirSync(charPath).filter((name) => {
        if (name != "Random") {
            return true;
        }
    });
    return characterList;
}

//called whenever clicking an image in the character roster
function changeCharacter() {

    //this gets us the players char selector image
    const selectorImg = activeChar.firstElementChild.firstElementChild;

    const character = this.id; //the character name we stored earlier
    activeChar.style.setProperty("--char", character); //will be read when updating the scoreboard

    //change of the char selector image
    selectorImg.setAttribute('src', charPath + '/' + character + '/Full.png');
    positionChar(character, selectorImg);

    //change of the character image in the background
    const pNum = activeChar.id.substring(activeChar.id.length - 1); //yes this is hella dirty
    charImgChange(document.getElementById('p'+pNum+'CharImg'), character);

}


//change the image path depending on the character, only when in singles mode
function charImgChange(charImg, charName) {
    if (gamemode == 1) {
        charImg.setAttribute('src', charPath + '/' + charName + '/Full.png');
    }
}


//whenever clicking on the first score tick
function changeScoreTicks1() {
    const pNum = this == p1Win1 ? 1 : 2;

    //deactivate wins 2 and 3
    document.getElementById('winP'+pNum+'-2').checked = false;
    document.getElementById('winP'+pNum+'-3').checked = false;
}
//whenever clicking on the second score tick
function changeScoreTicks2() {
    const pNum = this == p1Win2 ? 1 : 2;

    //deactivate win 3, activate win 1
    document.getElementById('winP'+pNum+'-1').checked = true;
    document.getElementById('winP'+pNum+'-3').checked = false;
}
//something something the third score tick
function changeScoreTicks3() {
    const pNum = this == p1Win3 ? 1 : 2;

    //activate wins 1 and 2
    document.getElementById('winP'+pNum+'-1').checked = true;
    document.getElementById('winP'+pNum+'-2').checked = true;
}

//returns how much score does a player have
function checkScore(tick1, tick2, tick3) {
    let totalScore = 0;

    if (tick1.checked) {
        totalScore++;
    }
    if (tick2.checked) {
        totalScore++;
    }
    if (tick3.checked) {
        totalScore++;
    }

    return totalScore;
}

//gives a victory to player 1 
function giveWinP1() {
    if (p1Win2.checked) {
        p1Win3.checked = true;
    } else if (p1Win1.checked) {
        p1Win2.checked = true;
    } else if (!p1Win1.checked) {
        p1Win1.checked = true;
    }
}
//same but for P2
function giveWinP2() {
    if (p2Win2.checked) {
        p2Win3.checked = true;
    } else if (p2Win1.checked) {
        p2Win2.checked = true;
    } else if (!p2Win1.checked) {
        p2Win1.checked = true;
    }
}


function setWLP1() {
    if (this == p1W) {
        currentP1WL = "W";
        this.style.color = "var(--text1)";
        p1L.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1L.style.backgroundImage = "var(--bg4)";
    } else {
        currentP1WL = "L";
        this.style.color = "var(--text1)";
        p1W.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1W.style.backgroundImage = "var(--bg4)";
    }
}
function setWLP2() {
    if (this == p2W) {
        currentP2WL = "W";
        this.style.color = "var(--text1)";
        p2L.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2L.style.backgroundImage = "var(--bg4)";
    } else {
        currentP2WL = "L";
        this.style.color = "var(--text1)";
        p2W.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2W.style.backgroundImage = "var(--bg4)";
    }
}

//simply deactivates all the W/L buttons
function deactivateWL() {
    currentP1WL = "Nada";
    currentP2WL = "Nada";

    const pWLs = document.getElementsByClassName("wlBox");
    for (let i = 0; i < pWLs.length; i++) {
        pWLs[i].style.color = "var(--text2)";
        pWLs[i].style.backgroundImage = "var(--bg4)";
    }
}


//player presets setup
function preparePF(pNum) {
    const pFinderEL = document.getElementById("pFinder"+pNum);

    //if the mouse is hovering a player preset, let us know
    pFinderEL.addEventListener("mouseenter", () => { inPF = true });
    pFinderEL.addEventListener("mouseleave", () => { inPF = false });

    //hide the player presets menu if text input loses focus
    document.getElementById('pName'+pNum).addEventListener("focusout", () => {
        if (!inPF) { //but not if the mouse is hovering a player preset
            pFinderEL.style.display = "none";
        }
    });
}

//called whenever the user types something in the player name box
function checkPlayerPreset() {

    //remove the "focus" for the player presets list
    currentFocus = -1;

    //player number check
    const pNum = this.id.substring(this.id.length - 1); //dirty way, but it works
    const pFinderEL = document.getElementById("pFinder"+pNum);

    //clear the current list each time we type
    pFinderEL.innerHTML = "";

    //if we typed at least 3 letters
    if (this.value.length >= 3) {

        //setup for later
        let match = false;

        //check the files in that folder
        const files = fs.readdirSync(mainPath + "/Player Info/");
        files.forEach(file => {

            //removes ".json" from the file name
            file = file.substring(0, file.length - 5);

            //if the current text matches a file from that folder
            if (file.toLocaleLowerCase().includes(this.value.toLocaleLowerCase())) {

                //let us know something was found
                match = true;

                //un-hides the player presets div
                pFinderEL.style.display = "block";

                //go inside that file to get the player info
                const playerInfo = getPInfoJson(file);
                //for each character that player plays
                playerInfo.characters.forEach(char => {

                    //this will be the div to click
                    const newDiv = document.createElement('div');
                    newDiv.className = "finderEntry";
                    newDiv.addEventListener("click", playerPreset);
                    
                    //create the texts for the div, starting with the tag
                    const spanTag = document.createElement('span');
                    //if the tag is empty, dont do anything
                    if (playerInfo.tag != "") {
                        spanTag.innerHTML = playerInfo.tag;
                        spanTag.className = "pfTag";
                    }

                    //player name
                    const spanName = document.createElement('span');
                    spanName.innerHTML = playerInfo.name;
                    spanName.className = "pfName";

                    //player character
                    const spanChar = document.createElement('span');
                    spanChar.innerHTML = char.character;
                    spanChar.className = "pfChar";

                    //we will use css variables to store data to read when clicked
                    newDiv.style.setProperty("--tag", playerInfo.tag);
                    newDiv.style.setProperty("--name", playerInfo.name);
                    newDiv.style.setProperty("--char", char.character);

                    //add them to the div we created before
                    newDiv.appendChild(spanTag);
                    newDiv.appendChild(spanName);
                    newDiv.appendChild(spanChar);

                    //now for the character image, this is the mask/mirror div
                    const charImgBox = document.createElement("div");
                    charImgBox.className = "pfCharImgBox";

                    //actual image
                    const charImg = document.createElement('img');
                    charImg.className = "pfCharImg";
                    charImg.setAttribute('src', charPath + '/' + char.character + '/CharSel.png');
                    //we have to position it
                    positionCharPF(charImg);
                    //and add it to the mask
                    charImgBox.appendChild(charImg);

                    //add it to the main div
                    newDiv.appendChild(charImgBox);

                    //and now add the div to the actual interface
                    pFinderEL.appendChild(newDiv);
                });
            }
        });

        //if nothing was found, hide the thing
        if (!match) {
            pFinderEL.style.display = "none";
        }

    } else {
        pFinderEL.style.display = "none";
    }

    //take the chance to resize the box
    changeInputWidth(this);
}

//now the complicated "change character image" function!
function positionChar(character, charEL) {

    //get the character positions
    const charInfo = getCharJson(character);
	
	//             x, y, scale
	let charPos = [0, 0, 1];
	//now, check if the character exists in the database down there
	if (charInfo != undefined) {
        charPos[0] = charInfo.gui.x;
        charPos[1] = charInfo.gui.y;
        charPos[2] = charInfo.gui.scale;
	} else { //these will get used if the png exists, but theres no file with positions
		charPos[0] = 28;
        charPos[1] = 0;
        charPos[2] = 1.4;
	}
    
    //to position the character
    charEL.style.left = charPos[0] + "px";
    charEL.style.top = charPos[1] + "px";
    charEL.style.transform = "scale(" + charPos[2] + ")";
    
    //if the image fails to load, use a placeholder
	charEL.addEventListener("error", () => {
        charEL.setAttribute('src', charPath + '/Random/Icon.png');
        charEL.style.left = "28px";
        charEL.style.top = "0px";
        charEL.style.transform = "scale(1.4)";
	});
}
// to position them on the player presets UI
function positionCharPF(charEL) {

    //to position the character
    charEL.style.left = "25px";
    charEL.style.top = "-10px";
    charEL.style.transform = "scale(5)";
    
    //if the image fails to load, use a placeholder
	charEL.addEventListener("error", () => {
        charEL.setAttribute('src', charPath + '/Random/Icon Flip.png');
        charEL.style.left = "28px";
        charEL.style.top = "0px";
        charEL.style.transform = "scale(1.4)";
	});
}

//called when the user clicks on a player preset
function playerPreset() {

    //dirty way to know the player number
    const pNum = this.parentElement.id.substring(this.parentElement.id.length - 1);

    const pTagEL = document.getElementById('pTag'+pNum);
    const pNameEL = document.getElementById('pName'+pNum);
    const pCharEL = document.getElementById('p'+pNum+'CharSelectorImg');

    pTagEL.value = this.style.getPropertyValue("--tag");
    changeInputWidth(pTagEL); //resizes the text box if it overflows

    pNameEL.value = this.style.getPropertyValue("--name");
    changeInputWidth(pNameEL);


    const character = this.style.getPropertyValue("--char");

    //will be read when updating the scoreboard
    pCharEL.parentElement.parentElement.style.setProperty("--char", character);

    //change of the char selector image
    pCharEL.setAttribute('src', charPath + '/' + character + '/Full.png');
    positionChar(character, pCharEL);

    //change of the character image in the background
    charImgChange(document.getElementById('p'+pNum+'CharImg'), character);


    //hide the thing when finished
    document.getElementById("pFinder"+pNum).style.display = "none";
}


//visual feedback to navigate the player presets menu
function addActive(x) {
    //clears active from all entries
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("finderEntry-active");
    }

    //if end of list, cicle
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);

    //add to the selected entry the active class
    x[currentFocus].classList.add("finderEntry-active");
}


//resizes an input box
function resizeInput() {
    changeInputWidth(this);
}

//changes the width of an input box depending on the text
function changeInputWidth(input) {
    input.style.width = getTextWidth(input.value,
        window.getComputedStyle(input).fontSize + " " +
        window.getComputedStyle(input).fontFamily
        ) + 12 + "px";
}


//used to get the exact width of a text considering the font used
function getTextWidth(text, font) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}


//used when clicking on the "Best of" buttons
function changeBestOf() {
    let theOtherBestOf; //we always gotta know
    if (this == document.getElementById("bo5Div")) {
        currentBestOf = "Bo5";
        theOtherBestOf = document.getElementById("bo3Div");
        p1Win3.style.display = "block";
        p2Win3.style.display = "block";
        
        document.getElementById("scoreBox1").style.width = "113px";
        document.getElementById("scoreBox2").style.width = "113px";

    } else {
        currentBestOf = "Bo3";
        theOtherBestOf = document.getElementById("bo5Div");
        p1Win3.style.display = "none";
        p2Win3.style.display = "none";

        document.getElementById("scoreBox1").style.width = "91px";
        document.getElementById("scoreBox2").style.width = "91px";
    }

    //change the color and background of the buttons
    this.style.color = "var(--text1)";
    this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    theOtherBestOf.style.color = "var(--text2)";
    theOtherBestOf.style.backgroundImage = "var(--bg4)";
}


//for checking if its "Grands" so we make the WL buttons visible
function checkRound() {
    if (!forceWL.checked) { //dont do it if we are already forcing it
        const wlButtons = document.getElementsByClassName("wlButtons");

        if (roundInp.value.toLocaleUpperCase().includes("Grand".toLocaleUpperCase())) {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "flex";
            }
        } else {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "none";
                deactivateWL();
            }
        }
    }
}


//called when clicking on the gamemode icon, cycles through singles, doubles, trios
function changeGamemode() {
    if (gamemode == 1) {
        
        gamemode = 2;

        //show 3v3 icon
        gmIcon3.style.opacity = 1;
        gmIcon1.style.left = "-1px";
        gmIcon2.style.left = "11px";
        gmIcon3.style.left = "23px";
        
        //hide the background character image to reduce clutter
        document.getElementById('p1CharImg').style.opacity = 0;
        document.getElementById('p2CharImg').style.opacity = 0;

        //things are about to get messy
        for (let i = 1; i < 3; i++) {
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('wlButtons'+i));
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            
            document.getElementById("scoreText"+i).style.display = "none";

            document.getElementById('teamName'+i).style.display = "block";

            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('teamName'+i));

            document.getElementById('row2-'+i).insertAdjacentElement("beforeend", document.getElementById('pInfo'+i));

            document.getElementById('charSelectorP'+(i+2)).style.display = "block";

            document.getElementById('pInfo'+(i+2)).style.display = "block";
        }

        //change the hover tooltip
        this.setAttribute('title', "Change the gamemode to 3v3");

        //dropdown menus for the right side will now be positioned to the right
        for (let i = 2; i < 7; i+=2) {
            document.getElementById("pFinder"+i).style.right = "0px";
            document.getElementById("pFinder"+i).style.left = "";
        }


    } else if (gamemode == 2) {

        gamemode = 3;

        //show singles icon
        gmIcon2.style.opacity = 0;
        gmIcon3.style.opacity = 0;
        gmIcon1.style.left = "11px";        

        //show the 4th row
        document.getElementById("row4-1").style.display = "flex";
        document.getElementById("row4-2").style.display = "flex";

        this.setAttribute('title', "Change the gamemode to Singles");

    } else if (gamemode == 3) {

        gamemode = 1;

        //show doubles icon
        gmIcon2.style.opacity = 1;
        gmIcon1.style.left = "4px";
        gmIcon2.style.left = "17px";
        

        //move everything back to normal
        for (let i = 1; i < 3; i++) {
            document.getElementById('p'+i+'CharImg').style.opacity = 1;

            document.getElementById("row4-"+i).style.display = "none";

            document.getElementById('teamName'+i).style.display = "none";
            document.getElementById('charSelectorP'+(i+2)).style.display = "none";
            document.getElementById('pInfo'+(i+2)).style.display = "none";

            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", document.getElementById('wlButtons'+i));
            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            document.getElementById("scoreText"+i).style.display = "block";
        
            document.getElementById('row1-'+i).insertAdjacentElement("afterbegin", document.getElementById('pInfo'+i));
        }

        this.setAttribute('title', "Change the gamemode to Doubles");

        //dropdown menus for the right side will now be positioned to the left
        for (let i = 2; i < 7; i+=2) {
            document.getElementById("pFinder"+i).style.left = "0px";
            document.getElementById("pFinder"+i).style.right = "";
        }

        //update the character background image
        charImgChange(document.getElementById('p1CharImg'), document.getElementById('charSelectorP1').style.getPropertyValue("--char"));
        charImgChange(document.getElementById('p2CharImg'), document.getElementById('charSelectorP2').style.getPropertyValue("--char"));
    }
}


function swap() {
    //names
    for (let i = 1; i < 7; i+=2) {
        const ele1 = document.getElementById('pName'+i);
        const ele2 = document.getElementById('pName'+(i+1));
        const store = ele1.value;
        ele1.value = ele2.value;
        ele2.value = store;
        changeInputWidth(ele1);
        changeInputWidth(ele2);
    }
    //tags
    for (let i = 1; i < 7; i+=2) {
        const ele1 = document.getElementById('pTag'+i);
        const ele2 = document.getElementById('pTag'+(i+1));
        const store = ele1.value;
        ele1.value = ele2.value;
        ele2.value = store;
        changeInputWidth(ele1);
        changeInputWidth(ele2);
    }
    //team name
    const team1 = document.getElementById('teamName1');
    const team2 = document.getElementById('teamName2');
    const teamStore = team1.value;
    team1.value = team2.value;
    team2.value = teamStore;


    //characters
    for (let i = 1; i < 7; i+=2) {
        const ele1 = document.getElementById('charSelectorP'+i);
        const ele2 = document.getElementById('charSelectorP'+(i+1));
        const store = ele1.style.getPropertyValue("--char");
        
        //the value read when updating the scoreboard
        ele1.style.setProperty("--char", ele2.style.getPropertyValue("--char"));
        //change of the char selector image
        ele1.firstElementChild.firstElementChild.setAttribute('src', charPath + '/' + ele2.style.getPropertyValue("--char") + '/Full.png');
        positionChar(ele2.style.getPropertyValue("--char"), ele1.firstElementChild.firstElementChild);
        //change of the character image in the background
        if (i == 1) {
            charImgChange(document.getElementById('p1CharImg'), ele2.style.getPropertyValue("--char"));
        };

        //repeat for the second one
        ele2.style.setProperty("--char", store);
        ele2.firstElementChild.firstElementChild.setAttribute('src', charPath + '/' + store + '/Full.png');
        positionChar(store, ele2.firstElementChild.firstElementChild);
        if (i == 1) {
            charImgChange(document.getElementById('p2CharImg'), store);
        };  
    }


    //scores
    const tempP1Score = checkScore(p1Win1, p1Win2, p1Win3);
    const tempP2Score = checkScore(p2Win1, p2Win2, p2Win3);
    setScore(tempP2Score, p1Win1, p1Win2, p1Win3);
    setScore(tempP1Score, p2Win1, p2Win2, p2Win3);

    //W/K, only if they are visible
    if (document.getElementById("wlButtons1").style.display == "flex") {
        const previousP1WL = currentP1WL;
        const previousP2WL = currentP2WL;

        if (previousP2WL == "W") {
            p1W.click();
        } else if (previousP2WL == "L") {
            p1L.click();
        }

        if (previousP1WL == "W") {
            p2W.click();
        } else if (previousP1WL == "L") {
            p2L.click();
        }
    }
}

function clearPlayers() {
    //clear player texts and tags
    const pTexts = document.getElementsByClassName('playerText');
    for (let i = 0; i < pTexts.length; i++) {
        pTexts[i].value = "";
        changeInputWidth(pTexts[i]);
    }
    const tTexts = document.getElementsByClassName('tagText');
    for (let i = 0; i < tTexts.length; i++) {
        tTexts[i].value = "";
        changeInputWidth(tTexts[i]);
    }

    //clear team names
    document.getElementById('teamName1').value = "";
    document.getElementById('teamName2').value = "";

    //reset characters to random
    const charSels = document.getElementsByClassName('charSelector');
    Array.from(charSels).forEach(charSel => {

        //the value read when updating the scoreboard
        charSel.style.setProperty("--char", "Random");

        //change of the char selector image
        charSel.firstElementChild.firstElementChild.setAttribute('src', charPath + '/Random/Icon.png');
        positionChar("Random", charSel.firstElementChild.firstElementChild);

        //change of the character image in the background
        const pNum = charSel.id.substring(charSel.id.length - 1);
        if (pNum == 1 || pNum == 2) {
            charImgChange(document.getElementById('p'+pNum+'CharImg'), "Random");
        };
        
    });

    //clear player scores
    const checks = document.getElementsByClassName("scoreCheck");
    for (let i = 0; i < checks.length; i++) {
        checks[i].checked = false;
    }
}


//manually sets the player's score
function setScore(score, tick1, tick2, tick3) {
    tick1.checked = false;
    tick2.checked = false;
    tick3.checked = false;
    if (score > 0) {
        tick1.checked = true;
        if (score > 1) {
            tick2.checked = true;
            if (score > 2) {
                tick3.checked = true;
            }
        }
    }
}


function allowIntroToggle() {
    let guiSettings = JSON.parse(fs.readFileSync(mainPath + "/GUI Settings.json", "utf-8"));
    guiSettings.allowIntro = this.checked;
    guiSettings = JSON.stringify(guiSettings, null, 2);
    fs.writeFileSync(mainPath + "/GUI Settings.json", guiSettings);
}

//forces the W/L buttons to appear, or unforces them
function forceWLtoggles() {
    
    const wlButtons = document.getElementsByClassName("wlButtons");

    let guiSettings = JSON.parse(fs.readFileSync(mainPath + "/GUI Settings.json", "utf-8"));

    if (forceWL.checked) {
        for (let i = 0; i < wlButtons.length; i++) {
            wlButtons[i].style.display = "flex";
            guiSettings.forceWL = true;
        }
    } else {
        for (let i = 0; i < wlButtons.length; i++) {
            wlButtons[i].style.display = "none";
            deactivateWL();
            guiSettings.forceWL = false;
        }
    }

    guiSettings = JSON.stringify(guiSettings, null, 2);
    fs.writeFileSync(mainPath + "/GUI Settings.json", guiSettings);

}


//will copy the current match info to the clipboard
// Format: "Tournament Name - Round - Player1 (Character1) VS Player2 (Character2)"
function copyMatch() {

    //initialize the string
    let copiedText = document.getElementById('tournamentName').value + " - " + roundInp.value + " - ";

    if (gamemode == 1) { //for singles matches
        //check if the player has a tag to add
        if (document.getElementById('pTag1').value) {
            copiedText += document.getElementById('pTag1').value + " | ";
        }
        copiedText += document.getElementById('pName1').value + " (" + document.getElementById('charSelectorP1').style.getPropertyValue("--char") + ") VS ";
        if (document.getElementById('pTag2').value) {
            copiedText += document.getElementById('pTag2').value + " | ";
        }
        copiedText += document.getElementById('pName2').value + " (" + document.getElementById('charSelectorP2').style.getPropertyValue("--char") + ")";
    } else { //for team matches
        copiedText += document.getElementById("teamName1").value + " VS " + document.getElementById("teamName2").value;
    }

    //send the string to the user's clipboard
    navigator.clipboard.writeText(copiedText);
}


//time to write it down
function writeScoreboard() {

    //this is what's going to be in the json file
    const scoreboardJson = {
        "player": [
            {},
            {
                name: document.getElementById('pName1').value,
                tag: document.getElementById('pTag1').value,
                character: document.getElementById('charSelectorP1').style.getPropertyValue("--char"),
            },
            {
                name: document.getElementById('pName2').value,
                tag: document.getElementById('pTag2').value,
                character: document.getElementById('charSelectorP2').style.getPropertyValue("--char"),
            },
            {
                name: document.getElementById('pName3').value,
                tag: document.getElementById('pTag3').value,
                character: document.getElementById('charSelectorP3').style.getPropertyValue("--char"),
            },
            {
                name: document.getElementById('pName4').value,
                tag: document.getElementById('pTag4').value,
                character: document.getElementById('charSelectorP4').style.getPropertyValue("--char"),
            },
            {
                name: document.getElementById('pName5').value,
                tag: document.getElementById('pTag5').value,
                character: document.getElementById('charSelectorP5').style.getPropertyValue("--char"),
            },
            {
                name: document.getElementById('pName6').value,
                tag: document.getElementById('pTag6').value,
                character: document.getElementById('charSelectorP6').style.getPropertyValue("--char"),
            }
        ],
        "teamName": [
            ,
            document.getElementById("teamName1").value,
            document.getElementById("teamName2").value
        ],
        "score": [
            ,
            checkScore(p1Win1, p1Win2, p1Win3),
            checkScore(p2Win1, p2Win2, p2Win3)
        ],
        "wl": [
            ,
            currentP1WL,
            currentP2WL
        ],
        gamemode : gamemode,
        bestOf: currentBestOf,
        round: roundInp.value,
        tournamentName: document.getElementById('tournamentName').value,
        "caster": [
            {},
            {
                name: document.getElementById('cName1').value,
                twitter: document.getElementById('cTwitter1').value,
                twitch: document.getElementById('cTwitch1').value,
            },
            {
                name: document.getElementById('cName2').value,
                twitter: document.getElementById('cTwitter2').value,
                twitch: document.getElementById('cTwitch2').value,
            }
        ],        
        allowIntro: document.getElementById('allowIntro').checked
    };

    //now convert it to a text we can save intro a file
    const data = JSON.stringify(scoreboardJson, null, 2);
    fs.writeFileSync(mainPath + "/ScoreboardInfo.json", data);


    //simple .txt files
    fs.writeFileSync(mainPath + "/Simple Texts/Player 1.txt", document.getElementById('pName1').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 2.txt", document.getElementById('pName2').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 3.txt", document.getElementById('pName3').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 4.txt", document.getElementById('pName4').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 5.txt", document.getElementById('pName5').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 6.txt", document.getElementById('pName6').value);

    fs.writeFileSync(mainPath + "/Simple Texts/Score L.txt", checkScore(p1Win1, p1Win2, p1Win3));
    fs.writeFileSync(mainPath + "/Simple Texts/Score R.txt", checkScore(p2Win1, p2Win2, p2Win3));

    fs.writeFileSync(mainPath + "/Simple Texts/Round.txt", roundInp.value);
    fs.writeFileSync(mainPath + "/Simple Texts/Tournament Name.txt", document.getElementById('tournamentName').value);

    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Name.txt", document.getElementById('cName1').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Twitter.txt", document.getElementById('cTwitter1').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Twitch.txt", document.getElementById('cTwitch1').value);

    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Name.txt", document.getElementById('cName2').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Twitter.txt", document.getElementById('cTwitter2').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Twitch.txt", document.getElementById('cTwitch2').value);

}


/* time to talk about recolors */

// to move the viewport to the recolors section
function toRecolors() {

    // hide normal settings
    document.getElementById("actualSettings").style.display = "none";
    // show recolor controls
    document.getElementById("recolorSettings").style.display = "inherit";
    // change settings title
    document.getElementById("settingsTitle").innerText = "RECOLOR SETTINGS";

    viewport.style.right = "200%";
}

// to go back to the settings view
document.getElementById("backToSettings").addEventListener("click", () => {
    document.getElementById("actualSettings").style.display = "inherit";
    document.getElementById("recolorSettings").style.display = "none";
    document.getElementById("settingsTitle").innerText = "SETTINGS";

    viewport.style.right = "140%";
});

// h/s/v buttons will just show their sliders and hide the rest
document.getElementById("hueButt").addEventListener("click", () => {
    Array.from(slidersH).forEach(el => {el.style.display = "inherit"});
    Array.from(slidersS).forEach(el => {el.style.display = "none"});
    Array.from(slidersV).forEach(el => {el.style.display = "none"});
    document.getElementById("hueButt").style.background = "var(--bg2)";
    document.getElementById("satButt").style.background = "var(--bg5)";
    document.getElementById("valButt").style.background = "var(--bg5)";
})
document.getElementById("satButt").addEventListener("click", () => {
    Array.from(slidersH).forEach(el => {el.style.display = "none"});
    Array.from(slidersS).forEach(el => {el.style.display = "inherit"});
    Array.from(slidersV).forEach(el => {el.style.display = "none"});
    document.getElementById("hueButt").style.background = "var(--bg5)";
    document.getElementById("satButt").style.background = "var(--bg2)";
    document.getElementById("valButt").style.background = "var(--bg5)";
})
document.getElementById("valButt").addEventListener("click", () => {
    Array.from(slidersH).forEach(el => {el.style.display = "none"});
    Array.from(slidersS).forEach(el => {el.style.display = "none"});
    Array.from(slidersV).forEach(el => {el.style.display = "inherit"});
    document.getElementById("hueButt").style.background = "var(--bg5)";
    document.getElementById("satButt").style.background = "var(--bg5)";
    document.getElementById("valButt").style.background = "var(--bg2)";
})


// use the stored code to set the initial values
decodeCode(currentCode);

// to enable/disable sliders
for (let i = 0; i < recChecks.length; i++) {
    recChecks[i].addEventListener("click", () => {disEnSliders(i)})
}
function disEnSliders(num) {

    const isDisabled = !recChecks[num].checked;

    slidersH[num].disabled = isDisabled;
    slidersS[num].disabled = isDisabled;
    slidersV[num].disabled = isDisabled;
    if (num == 1) { // for character sliders
        for (let i = 0; i < 3; i++) {
            slidersH[i+2].disabled = isDisabled;
            slidersS[i+2].disabled = isDisabled;
            slidersV[i+2].disabled = isDisabled;
        }
    }

}

// set the initial color for the S and V sliders
for (let i = 0; i < slidersH.length; i++) {
    colorSliders(i);    
}

// defaults button, just restores everything
document.getElementById("defaultRecolor").addEventListener("click", () => {
    decodeCode(defaultCode);
    if (currentRecCha == -1) {
        sliderMoved(0);
    } else {
        sliderMoved(1);
    }
    for (let i = 0; i < slidersH.length; i++) {
        colorSliders(i);    
    }
    changeCurrentCode();
})


for (let i = 0; i < slidersH.length; i++) {
    slidersH[i].oninput = () => {sliderMoved(i)};
    slidersS[i].oninput = () => {sliderMoved(i)}; 
    slidersV[i].oninput = () => {sliderMoved(i)}; 
}

async function sliderMoved(num) {

    if (num == 0 && currentRecCha >= 0) {
        currentRecCha = -1;
        recSha = new RRecolor([212, 133, 135, 1], [100, 100, 100, 1]);
        await recSha.addImage(recCan, mainPath + "/../Overlay/VS Screen/VS Lightning RecBase.png");
    } else if (num > 0 && currentRecCha == -1) {
        currentRecCha = recList.selectedIndex;
        const charName = recList.selectedOptions[0].text;
        const charInfo = getCharJson(charName);
        if (recRadioP.checked) {
            recSha = new RRecolor(charInfo.recolor.poster.oc, charInfo.recolor.poster.cr);
            await recSha.addImage(recCan, charPath + "/" + charName + "/Poster RecBase.png");
        } else {
            recSha = new RRecolor(charInfo.recolor.full.oc, charInfo.recolor.full.cr);
            await recSha.addImage(recCan, charPath + "/" + charName + "/Full RecBase.png");
        }

    }

    const rgbFromHsv = getSliderValueRgb(num)

    if (currentRecCha >= 0) {
        
        const finalRgb = [];

        for (let i = 0; i < 4; i++) {
            const slidValues = getSliderValueRgb(i+1);
            finalRgb.push(slidValues[0], slidValues[1], slidValues[2], 1);
        }

        recSha.recolor(finalRgb);

    } else {
        recSha.recolor([rgbFromHsv[0], rgbFromHsv[1], rgbFromHsv[2], 1]);
    }

    colorSliders(num);

}

function getSliderValueRgb(num) {
    const rgbFromHsv = hsv2rgb(
        slidersH[num].value / 360,
        slidersS[num].value / 100,
        slidersV[num].value / 100
    );
    rgbFromHsv[0] = Math.round(rgbFromHsv[0] * 255);
    rgbFromHsv[1] = Math.round(rgbFromHsv[1] * 255);
    rgbFromHsv[2] = Math.round(rgbFromHsv[2] * 255);

    return rgbFromHsv;
}

function colorSliders(num) {
    const cssRgb = hsv2rgb(slidersH[num].value / 360, 1, 1);
    cssRgb[0] = cssRgb[0] * 255;
    cssRgb[1] = cssRgb[1] * 255;
    cssRgb[2] = cssRgb[2] * 255;
    slidersS[num].style.background = "linear-gradient(to right, white, rgb(" + cssRgb[0] + ", " + cssRgb[1] + ", " + cssRgb[2] + ")";
    slidersV[num].style.background = "linear-gradient(to right, black, rgb(" + cssRgb[0] + ", " + cssRgb[1] + ", " + cssRgb[2] + ")";
}


// Add new entries to the char list for each character
const characterList = getCharList();
for (let i = 0; i < characterList.length; i++) {
    const option = document.createElement('option'); //create new entry
    option.text = characterList[i]; //set the text of entry
    recList.add(option); //add the entry to the combo list
}

// startup the shader with a random character
currentRecCha = genRnd(0, characterList.length-1);
recList.selectedIndex = currentRecCha;
newCharImg();


recList.addEventListener("change", newCharImg);
async function newCharImg() {
    const charName = recList.selectedOptions[0].text;
    const finalRgb = [];
    const charInfo = getCharJson(charName);

    for (let i = 0; i < 4; i++) {
        const slidValues = getSliderValueRgb(i+1);            
        finalRgb.push(slidValues[0], slidValues[1], slidValues[2], 1)          
    }

    if (recRadioP.checked) {
        recSha = new RRecolor(charInfo.recolor.poster.oc, charInfo.recolor.poster.cr);
        recSha.addImage(recCan, charPath + "/" + charName + "/Poster RecBase.png").then(
            () => {recSha.recolor(finalRgb)}
        );
    } else {
        recSha = new RRecolor(charInfo.recolor.full.oc, charInfo.recolor.full.cr);
        recSha.addImage(recCan, charPath + "/" + charName + "/Full RecBase.png").then(
            () => {recSha.recolor(finalRgb)}
        );
    }

    currentRecCha = recList.selectedIndex;
}

// when radio buttons are clicked, swap the render (if we have a char selected)
recRadioF.addEventListener("click", () => {newCharImg()});
recRadioP.addEventListener("click", () => {newCharImg()});


// save images
document.getElementById("saveRecolor").addEventListener("click", () => {

    skippedChars = [];

    const promises = [
        recSaveVS(),
        recSaveChars()
    ]
    Promise.all(promises).then( () => {
        const recFeedback = document.getElementById("recFeedback");

        if (skippedChars[0]) {
            let infoText = "Saved, but skipped:\n";
            for (let i = 0; i < skippedChars.length; i++) {
                if (i != skippedChars.length - 1) {
                    infoText += skippedChars[i] + ", "
                } else {
                    infoText += skippedChars[i] + "."
                }                
            }
            recFeedback.innerHTML = infoText;
            recFeedback.classList.remove("recFeedbackSucc");
            recFeedback.classList.add("recFeedbackAlert");
        } else {
            recFeedback.innerHTML = "Images saved successfully";
            recFeedback.classList.remove("recFeedbackAlert");
            recFeedback.classList.add("recFeedbackSucc");
        }

        recFeedback.classList.remove("showFeedbackAnim");
        setTimeout(() => { // yes i know this is bad practice
            recFeedback.classList.add("showFeedbackAnim");
        }, 20);

    })

    // save the color code so the GUI retains the slider values next time it loads
    changeCurrentCode();
    
})
function recSaveVS() {

    if (recChecks[0].checked) { // if we got stuff to recolor
        
        const rgbFromHsv = getSliderValueRgb(0);
        const vsShader = new RRecolor([212, 133, 135, 1], [100, 100, 100, 1]);
        const vsCanv = document.createElement("canvas");
        vsShader.addImage(vsCanv, mainPath + "/../Overlay/VS Screen/VS Lightning RecBase.png").then(
            () => {
                const buff = vsShader.download([rgbFromHsv[0], rgbFromHsv[1], rgbFromHsv[2], 1])
                fs.writeFileSync(mainPath + "/../Overlay/VS Screen/VS Lightning.png", buff);
            }
        );

    } else { // if no recolors, overwrite the image with the original
        const buff = fs.readFileSync(mainPath + "/../Overlay/VS Screen/VS Lightning Original.png");
        fs.writeFileSync(mainPath + "/../Overlay/VS Screen/VS Lightning.png", buff);
    }
}
function recSaveChars() {
    if (recChecks[1].checked) {

        for (let i = 0; i < characterList.length; i++) {
            
            try {

                const charName = characterList[i];
                const finalRgb = [];
                const charInfo = getCharJson(charName);

                for (let i = 0; i < 4; i++) {
                    const slidValues = getSliderValueRgb(i+1);            
                    finalRgb.push(slidValues[0], slidValues[1], slidValues[2], 1);
                }

                const fullShader = new RRecolor(charInfo.recolor.full.oc, charInfo.recolor.full.cr);
                const postShader = new RRecolor(charInfo.recolor.poster.oc, charInfo.recolor.poster.cr);
                
                const fullCanv = document.createElement("canvas");
                const postCanv = document.createElement("canvas");

                fullShader.addImage(fullCanv, charPath + "/" + charName + "/Full RecBase.png").then(
                    () => {
                        const buff = fullShader.download(finalRgb);
                        fs.writeFileSync(charPath + "/" + charName + "/Full.png", buff);
                    }
                );
                postShader.addImage(postCanv, charPath + "/" + charName + "/Poster RecBase.png").then(
                    () => {
                        const buff = postShader.download(finalRgb);
                        fs.writeFileSync(charPath + "/" + charName + "/Poster.png", buff);
                    }
                );

            } catch (e) {
                // if a character doesnt have recolors set up, skip this character
                skippedChars.push(characterList[i]);
            }
            
        }
        
    } else { // if unchecked, just overwrite with the original image
        for (let i = 0; i < characterList.length; i++) {
            try {
                const buffF = fs.readFileSync(charPath + "/" + characterList[i] + "/Full Original.png");
                fs.writeFileSync(charPath + "/" + characterList[i] + "/Full.png", buffF);
                const buffP = fs.readFileSync(charPath + "/" + characterList[i] + "/Poster Original.png");
                fs.writeFileSync(charPath + "/" + characterList[i] + "/Poster.png", buffP);
            } catch (e) {
                // if a character doesnt have recolors set up, skip this character
            }
        }
    }
}


function changeCurrentCode() {
    
    let guiSettings = JSON.parse(fs.readFileSync(mainPath + "/GUI Settings.json", "utf-8"));

    let newCurrent = "";

    if (recChecks[0].checked) {
        const rgbSliders = getSliderValueRgb(0)
        newCurrent += rgb2Hex(rgbSliders[0], rgbSliders[1], rgbSliders[2]);
        newCurrent += "-"
    } else {
        newCurrent += "XXXXXX-"
    }

    if (recChecks[1].checked) {
        for (let i = 0; i < 4; i++) {
            
            const rgbSliders = getSliderValueRgb(i+1)
            newCurrent += rgb2Hex(rgbSliders[0], rgbSliders[1], rgbSliders[2]);
            
            if (i < 3) {
                newCurrent += "-"
            }

        }
    } else {
        newCurrent += "XXXXXX-XXXXXX-XXXXXX-XXXXXX"
    }

    guiSettings.currentColorCode = newCurrent.toUpperCase();
    
    guiSettings = JSON.stringify(guiSettings, null, 2);
    fs.writeFileSync(mainPath + "/GUI Settings.json", guiSettings);

}


function decodeCode(code) {

    // delete those "-" from the code
    const newHex = code.replace(/-/g, "");

    // split each color for every 6 characters
    const charHex = newHex.match(/.{1,6}/g);

    for (let i = 0; i < 2; i++) {
        
        if (charHex[i] == "XXXXXX") {
            recChecks[i].checked = false;
            disEnSliders(i);
        } else {
            recChecks[i].checked = true;
            disEnSliders(i);
            if (i == 1) {
                for (let i = 0; i < 4; i++) {
                    const codeRgb = hex2rgb(charHex[i+1]);
                    const codeHsv = rgb2hsv(codeRgb[0], codeRgb[1], codeRgb[2]);
                    slidersH[i+1].value = Math.round(codeHsv[0]);
                    slidersS[i+1].value = Math.round(codeHsv[1]);
                    slidersV[i+1].value = Math.round(codeHsv[2]);                 
                }
            } else {
                const codeRgb = hex2rgb(charHex[i]);
                const codeHsv = rgb2hsv(codeRgb[0], codeRgb[1], codeRgb[2]);
                slidersH[i].value = Math.round(codeHsv[0]);
                slidersS[i].value = Math.round(codeHsv[1]);
                slidersV[i].value = Math.round(codeHsv[2]);
            }
        }
        
    }
    
}

function hex2rgb(hex) {
    const rgb = [];
    const bigint = parseInt(hex, 16);
    rgb[0] = (bigint >> 16) & 255;
    rgb[1] = (bigint >> 8) & 255;
    rgb[2] = bigint & 255;
    return rgb;
}
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgb2Hex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hsv2rgb(H, S, V) {

    let C = V * S;
 
    H *= 6;
    let X = C * (1 - Math.abs( H % 2 - 1 ));
    let m = V - C;
    C += m;
    X += m;
 
    if (H < 1) return [C, X, m];
    if (H < 2) return [X, C, m];
    if (H < 3) return [m, C, X];
    if (H < 4) return [m, X, C];
    if (H < 5) return [X, m, C];
    else       return [C, m, X];

}

function rgb2hsv (r, g, b) {

    r = r/255, g = g/255, b = b/255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = h * 360;
    s = s * 100;
    v = v * 100;

    return [h, s, v];

}

//just a simple random function
function genRnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}