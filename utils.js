// function createGeneralElement(element, classes, id) {
//     const newElement = document.createElement(element);
//     newElement.classList.add(...classes);
//     newElement.id = id;
//     return newElement;
// }

// function createContainer(id, containerType) {
//     const className = containerType + "-container";
//     const container = createGeneralElement("div", [className], className + id);
//     return container;
// }

// function createButton(id, classes, text) {
//     const button = createGeneralElement("button", classes, "btn" + id);
//     button.innerText = text;
//     return button;
// }

// function createProgressBar(id) {
//     const classes = ["progress-wrapper", "progress", "progress-text"];
//     const elements = classes.map((className) => {
//         return createGeneralElement("div", [className], className + id);
//     });
//     const [progressWrapper, progress, progressText] = elements;
//     progressText.innerText = "0%";
//     progressWrapper.appendChild(progress);
//     progress.appendChild(progressText);
//     return { progressWrapper, progress, progressText };
// }

// function createDiceElement(id) {
//     const dice = createGeneralElement("div", ["dice"], "dice" + id);
//     const faces = ["front", "back", "left", "right", "top", "bottom"];
//     faces.forEach((face, _) => {
//         const faceDiv = createGeneralElement("div", ["face", face], face + id);
//         dice.appendChild(faceDiv);
//     });
//     return dice;
// }

// function setContainerDisable(diceId) {
//     const normalContainer = "#normal-container";
//     const longContainer = "#long-container";
//     const currentNormalDiceContainer = document.querySelector(
//         normalContainer + diceId
//     );
//     const nextLongDiceContainer = document.querySelector(
//         longContainer + `${Number(diceId) + 1}`
//     );
//     const nextNormalDiceContainer = document.querySelector(
//         normalContainer + `${Number(diceId) + 1}`
//     );
//     currentNormalDiceContainer.classList.add("disable");
//     if (!nextLongDiceContainer) return;
//     nextLongDiceContainer.classList.remove("disable");
//     nextNormalDiceContainer.classList.remove("disable");
// }

// function rollDice(random, dice) {
//     const xRotation = 1440 + Math.random() * 360;
//     const yRotation = 1440 + Math.random() * 360;

//     void dice.offsetHeight;

//     dice.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;

//     setTimeout(() => {
//         setFinalPosition(random, dice);
//     }, 500);
// }

// function setFinalPosition(random, dice) {
//     dice.style.transition = "transform 0.5s ease-out";

//     switch (random) {
//         case 1:
//             dice.style.transform = "rotateX(0deg) rotateY(0deg)";
//             break;
//         case 6:
//             dice.style.transform = "rotateX(180deg) rotateY(0deg)";
//             break;
//         case 2:
//             dice.style.transform = "rotateX(-90deg) rotateY(0deg)";
//             break;
//         case 5:
//             dice.style.transform = "rotateX(90deg) rotateY(0deg)";
//             break;
//         case 3:
//             dice.style.transform = "rotateX(0deg) rotateY(90deg)";
//             break;
//         case 4:
//             dice.style.transform = "rotateX(0deg) rotateY(-90deg)";
//             break;
//     }
// }

// function interpolateColor(color1, color2, factor) {
//     const hexToRgb = (hex) => {
//         const bigint = parseInt(hex.slice(1), 16);
//         return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
//     };

//     const rgbToHex = (rgb) => {
//         return (
//             "#" +
//             rgb
//                 .map((val) => {
//                     const hex = val.toString(16);
//                     return hex.length === 1 ? "0" + hex : hex;
//                 })
//                 .join("")
//         );
//     };

//     const rgb1 = hexToRgb(color1);
//     const rgb2 = hexToRgb(color2);

//     const result = rgb1.map((c1, i) =>
//         Math.round(c1 + factor * (rgb2[i] - c1))
//     );

//     return rgbToHex(result);
// }

// function calculateProbability(currentSum, remainingDice, targetSum = 21) {
//     if (currentSum >= targetSum) return 1;
//     if (remainingDice === 0) return currentSum >= targetSum ? 1 : 0;

//     let favorableOutcomes = 0;
//     const totalOutcomes = Math.pow(6, remainingDice);

//     function countFavorableOutcomes(sum, diceLeft) {
//         if (diceLeft === 0) {
//             if (sum >= targetSum) favorableOutcomes++;
//             return;
//         }
//         for (let i = 1; i <= 6; i++) {
//             countFavorableOutcomes(sum + i, diceLeft - 1);
//         }
//     }

//     countFavorableOutcomes(currentSum, remainingDice);
//     return favorableOutcomes / totalOutcomes;
// }

// function createPreStartElement() {
//     const longContainer = createContainer("pre-start", "long");
//     const container = createContainer("pre-start", "normal");

//     const circle = createGeneralElement(
//         "div",
//         ["dice", "circle"],
//         "pre-start-circle"
//     );
//     circle.innerText = "Pre-start";

//     const { progressWrapper, progress, progressText } =
//         createProgressBar("pre-start");
//     const chanceText = createGeneralElement(
//         "div",
//         ["chance-text"],
//         "chance-text"
//     );
//     chanceText.innerText = "Current winning chance";
//     progress.appendChild(chanceText);
//     longContainer.append(progressWrapper);
//     container.append(circle);
//     longContainer.append(container);
//     addCurrentScore("pre-start", longContainer, "visible");

//     longContainer.style.marginRight = "20px";

//     const initialProbability = calculateProbability(0, NUM_OF_DICE) * 100;
//     const maxHeight = window.innerHeight * 0.0035;
//     progress.style.height = initialProbability * maxHeight + "px";
//     progressText.textContent = Math.round(initialProbability) + "%";

//     return longContainer;
// }

// function getRollResult(diceId) {
//     const roll = CURRENT_GAME.diceResults[diceId];
//     CURRENT_SUM += roll;
//     return roll;
// }

// function randomDice(dice, rollBtn, gameId) {
//     if (!dice) return;
//     if (!IS_STARTED) {
//         const preStartNormalContainer = document.querySelector(
//             "#normal-containerpre-start"
//         );
//         preStartNormalContainer.classList.add("disable");
//         IS_STARTED = true;
//     }
//     const diceId = dice.id.slice(-1);
//     const random = getRollResult(diceId);
//     const longDiceContainer = document.querySelector(
//         "#long-container" + diceId
//     );
//     rollBtn.disabled = true;
//     rollDice(random, dice);
//     setTimeout(() => {
//         const { progressWrapper, progress, progressText } =
//             createProgressBar(diceId);
//         longDiceContainer.prepend(progressWrapper);
//         const remainingDice = NUM_OF_DICE - parseInt(diceId) - 1;
//         const probability =
//             calculateProbability(CURRENT_SUM, remainingDice) * 100;
//         const maxHeight = window.innerHeight * 0.0035;
//         void progress.offsetHeight;
//         progress.style.height = probability * maxHeight + "px";

//         const currentGame = GAME_DATA[gameId];

//         currentGame.probabilities.push(Math.round(probability));

//         const duration = 1500;
//         const start = performance.now();

//         const animateText = (timestamp) => {
//             const elapsed = timestamp - start;
//             const progressValue = Math.min(elapsed / duration, 1);
//             const current = Math.floor(progressValue * probability);
//             progressText.textContent = current + "%";
//             const currentDiceContainer = document.querySelector(
//                 `#long-container${parseInt(diceId)}`
//             );
//             if (currentDiceContainer) {
//                 const chanceText = document.querySelector(".chance-text");
//                 if (chanceText) {
//                     currentDiceContainer
//                         .querySelector(".progress")
//                         .prepend(chanceText);
//                 }
//             }

//             let factor = Math.pow(current / 100, 2.0);
//             const min = 0.0;
//             const max = 0.9;
//             factor = min + factor * (max - min);

//             const color = interpolateColor("#2fc9ff", "#012060", factor);
//             progress.style.backgroundColor = color;

//             if (progressValue < 1) {
//                 requestAnimationFrame(animateText);
//             } else {
//                 changeCurrentScore(diceId);

//                 rollBtn.disabled = false;
//                 setContainerDisable(diceId);

//                 if (remainingDice <= 0) {
//                     finishGame(rollBtn, gameId, dice, progress, progressText);
//                 }
//             }
//         };

//         requestAnimationFrame(animateText);
//     }, 1000);
// }

// function finishGame(rollBtn, gameId, dice, progress, progressText) {
//     const isWin = CURRENT_SUM >= 21;
//     const resultText = isWin ? "You Won!" : "You Lost!";
//     const resultTextColor = isWin ? "#2fc9ff" : "#ff2f2f";

//     const modal = createModal(resultText, resultTextColor, gameId);
//     app.appendChild(modal);
//     modal.classList.add("open");

//     const maxHeight = window.innerHeight * 0.0035;
//     progress.style.height = isWin ? 100 * maxHeight + "px" : "0px";
//     progressText.textContent = isWin ? "100%" : "0%";

//     GAME_DATA[gameId].sum = CURRENT_SUM;
//     GAME_DATA[gameId].result = isWin ? "win" : "loss";

//     IS_STARTED = false;
//     rollBtn.removeEventListener("click", () => randomDice(dice, rollBtn));
// }

// function createCircle(color, left, isMovable = false) {
//     const circle = createGeneralElement(
//         "div",
//         ["circle-slider", `${color}`],
//         isMovable ? "sliderThumb" : ""
//     );
//     circle.style.left = left;
//     return circle;
// }

// function createLabel(text, left) {
//     const label = createGeneralElement("div", ["label"]);
//     label.textContent = text;
//     label.style.left = left;
//     return label;
// }

// function createCustomSlider(gameId) {
//     const parent = createGeneralElement(
//         "div",
//         ["slider-parent"],
//         "slider-parent"
//     );
//     const title = createGeneralElement("h2", [], "slider-title");
//     title.textContent = "How satisfied are you at this moment?";

//     const sliderContainer = createGeneralElement(
//         "div",
//         ["slider-container"],
//         "sliderContainer"
//     );

//     const track = createGeneralElement("div", ["slider-track"], "sliderTrack");
//     const thumb = createCircle("yellow", "50%", true);
//     const sliderElements = [
//         track,
//         createCircle("black", "0%"),
//         createLabel("very dissatisfied", "0%"),
//         createCircle("black", "100%"),
//         createLabel("very satisfied", "100%"),
//         thumb,
//     ];

//     sliderElements.forEach((element) => {
//         sliderContainer.appendChild(element);
//     });

//     const button = createGeneralElement("button", ["roll"], "continueBtn");
//     button.textContent = "Continue";
//     button.disabled = true;

//     const reminder = createGeneralElement("div", ["reminder"], "reminderText");
//     reminder.textContent =
//         "Please move the slider according to the instructions";

//     const elements = [title, sliderContainer, button, reminder];
//     elements.forEach((element) => {
//         parent.appendChild(element);
//     });

//     let hasMoved = false;
//     let reminderTimeout = setTimeout(() => {
//         if (!hasMoved) {
//             reminder.style.display = "block";
//         }
//     }, 4000);

//     let currentSliderValue = 50;

//     thumb.addEventListener("mousedown", (e) => {
//         e.preventDefault();
//         thumb.style.transition = "none";
//         if (!hasMoved) {
//             hasMoved = true;
//             button.disabled = false;
//             reminder.style.display = "none";
//             clearTimeout(reminderTimeout);
//         }

//         const rect = sliderContainer.getBoundingClientRect();
//         const thumbWidth = thumb.offsetWidth;

//         const onMouseMove = (moveEvent) => {
//             moveEvent.preventDefault();
//             let x = moveEvent.clientX - rect.left;
//             x = Math.max(0, Math.min(rect.width, x));
//             const percent = (x / rect.width) * 100;
//             thumb.style.left = `calc(${percent}% - ${thumbWidth / 2}px)`;
//             currentSliderValue = Math.round(percent);
//         };

//         const onMouseUp = () => {
//             thumb.style.transition = "left 0.2s ease";
//             document.removeEventListener("mousemove", onMouseMove);
//             document.removeEventListener("mouseup", onMouseUp);
//         };

//         document.addEventListener("mousemove", onMouseMove);
//         document.addEventListener("mouseup", onMouseUp);
//     });

//     button.addEventListener("click", () => {
//         const currentGame = GAME_DATA[gameId];
//         currentGame.surveyResult = currentSliderValue;
//         Object.keys(currentGame).forEach((data) => {
//             writeToLogs(`${gameId}-${data}`, currentGame[data]);
//         });
//         startNextGame();
//     });

//     return parent;
// }

// function createGameArray(numOfGames, numOfDice) {
//     const numArray = [];
//     const diceArray = [];
//     for (let i = 0; i < numOfGames; i++) {
//         numArray.push(i);
//     }
//     for (let i = 0; i < numOfDice; i++) {
//         diceArray.push(i);
//     }

//     const gamesArray = numArray.map((num) => {
//         const diceResults = diceArray.map((diceNum) => {
//             return Math.floor(Math.random() * 6) + 1;
//         });

//         return {
//             id: `game${num + 1}`,
//             diceResults: diceResults,
//         };
//     });

//     return gamesArray;
// }

// function addCurrentScore(diceId, longContainer, visibility = "hidden") {
//     const currentScore = createGeneralElement(
//         "p",
//         [],
//         "current-score" + diceId
//     );
//     const maxScore = createGeneralElement(
//         "b",
//         ["current-score"],
//         "max-score" + diceId
//     );
//     const boldScore = createGeneralElement(
//         "b",
//         ["bold-score"],
//         "bold-score" + diceId
//     );

//     maxScore.textContent = "/21";
//     boldScore.textContent = "0";
//     currentScore.appendChild(boldScore);
//     currentScore.appendChild(maxScore);
//     currentScore.style.visibility = visibility;
//     longContainer.append(currentScore);
// }

// function changeCurrentScore(diceId) {
//     const boldScore = document.querySelector("#bold-score" + diceId);
//     const currentScore = document.querySelector("#current-score" + diceId);
//     boldScore.innerText = CURRENT_SUM;
//     currentScore.style.visibility = "visible";
// }

// function createModal(text, textColor, gameId) {
//     const modal = createGeneralElement("div", ["modal"], "modal");
//     const modalContent = createGeneralElement(
//         "div",
//         ["modal-inner"],
//         "modal-inner"
//     );
//     const continueButton = createButton("close", ["modal-btn"], "Continue");
//     continueButton.addEventListener("click", () => {
//         modal.classList.remove("open");
//         showSliderScreen(gameId);
//     });

//     const modalText = createGeneralElement("h2", ["modal-text"], "modal-text");
//     modalText.innerText = text;
//     modalText.style.color = textColor;
//     modalContent.appendChild(modalText);
//     modalContent.appendChild(continueButton);
//     modal.appendChild(modalContent);
//     return modal;
// }

// function writeToLogs(field, value) {
//     window.console.log(field, ":", value);
//     window.postMessage([field, value], "*");
// }
