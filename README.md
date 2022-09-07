
![preview](https://github.com/Readek/Rushdown-Revolt-Stream-Tool/blob/main/preview.png)

# Rushdown Revolt Stream Tool
*Also available for [Rivals of Aether](https://github.com/Readek/RoA-Stream-Tool) and [Super Smash Bros. Melee](https://github.com/Readek/Melee-Stream-Tool)!*

So you want to do a Rushdown Revolt tournament stream, huh? Don't you worry, here you have everything you need! This is a stream tool with included overlays to make the tournament stream setup process as fast and easy as possible.

---

## Features
- [Handy interface](https://gfycat.com/thriftyfluffydingo) to quickly change everything you need, including:
  - Quick changes to player names, characters, scores, round, casters...
  - Support for 2v2 **and** 3v3 modes!
  - Customizable Player Presets to setup your match in no time!
- A [game overlay](https://gfycat.com/jampackedmindlessamericanriverotter) is included, showing player names, characters, scores, round, [W]/[L] status.
- A "[VS Screen](https://gfycat.com/plushobedientfulmar)" used to hide the game while waiting for the next match.
- [Custom colors](https://gfycat.com/whichfilthyhawk) to allow for some personal creativity for your stream!
- [Easy and fast setup](https://gfycat.com/impeccablerealisticaustraliancattledog) using a browser source. Drag and drop!
- Easy to customize! Add new characters, customize the overlays or even dive into the code if you're brave enough!
- This is **not** a [Stream Control](http://farpnut.net/StreamControl) clone. It doesn't have anything to do with it, everything is custom made.

---

## How to setup
These are instructions for regular OBS Studio, but I imagine you can do the same with other streaming software:
- Get the [latest release](https://github.com/Readek/Rushdown-Revolt-Stream-Tool/releases).
- Extract somewhere.
- Drag and drop `Game Scoreboard.html` into OBS, or add a new browser source in OBS pointing at the local file.
  - If the source looks weird, manually set the source's properties to 1920 width and 1080 height, or set your OBS canvas resolution to 1080p, or make the source fit the screen.
- In the source's properties, change *Use custom frame rate* -> `60` (if streaming at 60fps of course).
- Also tick `Refresh browser when scene becomes active`.
- Manage it all with the `RR Stream Tool` executable.

Repeat from the 3rd step to add the `VS Screen.html`, though I recommend you to do so on another scene.

### Interface shortcuts!
- Press `Enter` to update.
- Press either `F1` or `F2` to increase P1's or P2's score.
- Press `ESC` to clear player info.

### Other things to know
- When **changing the gamemode** (for example form singles to 2v2), or updating custom colors, a browser source refresh is needed.
- The Scoreboard's optional intro will only play when refreshing the browser (so when changing scenes).

2 basic transitions are included in the `Resources/OBS Transitions` folder, if you don't have a transition yourself of course. To use them on OBS:
- Add a new stinger transition.
- Set the video file to `Game In.webm` or `Swoosh.webm`.
- Transition point -> `350 ms`.
- I recommend you to set the Audio Fade Style to crossfade, just in case.
- On the scene's right click menu, set it to Transition Override to the transition you just created.

The interface will also update basic text files with the match info at `Resources/Texts/Simple Texts/` so you can add them to OBS with ease.

---

## Customizing stuff

To add a new player preset, go to `Resources/Texts/Player Info/` and create a new file with the name of your player. You can use the existing file as a template. You can add as many characters as you want in the `.json` file.

For the overlays, there are PSD files for both the game scoreboard and the VS screen to help you customize them.

If you want to add a new character:
- Add your character assets in `Resources/Characters/`. For the poster assets, it is recommended that you use the same resolutions as the rest.
- To position the portrait images, you will have to create and edit an `_Info.json` file. You can use any other character json as a template.
- You can add a character background, but if you don't, the background will show greyish by default.

If you're brave enough to dive into the code, I tried my best to document everything inside the code so you have an easier time, so go grab those `html` and `js` files!

If you want to customize the GUI appearance, thats going to be a bit complicated since you will have to learn how electron works yourself. In any case, the source code is also on this github!

And most importantly, this project was created using [RoA-Stream-Tool](https://github.com/Readek/RoA-Stream-Tool) as a base, so if you wanna go crazy on customizations, I really recomend you to check out that first, since it's way more documented (and also has a wiki!), especially if you wanna adapt this to other games.

---

Do you want to adapt this project to another game but can't figure out how to? Lucky for you, I'm open for commisions! Contact me on Twitter [@Readeku](https://twitter.com/Readeku) or on Discord `Readek#5869`!.

Do you want to support this project? [Buy me a ko-fi](https://ko-fi.com/readek) or tip me [directly](https://streamlabs.com/readek/tip)!

This is one of my first projects in Javascript, if you know your stuff and look at the code, you may find ways to make the thing a bit more optimized. Pull requests are highly appreciated! Please, use this github to leave suggestions on how to imporve things.
