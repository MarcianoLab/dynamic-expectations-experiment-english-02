var DiceGame = class DiceGame {
    constructor() {
        this.NUM_OF_DICE = 6;
        this.NUM_OF_GAMES = 12;
        this.CURRENT_SUM = 0;
        this.TOTAL_WINS = 0;
        this.GAME_LIST = [];
        this.CURRENT_GAME = {};
        this.GAME_DATA = {};
        this.IS_STARTED = false;
        this.ENABLE_GAME_SOUNDS = ENABLE_GAME_SOUNDS;
        this.audioContext = null;
        this.HEBREW = HEBREW;
        this.TEXT = this.HEBREW ? UI_TEXT.he : UI_TEXT.en;
        this.startTime = 0;
        this.endTime = 0;
        this.app = this.createGeneralElement("div", ["app"], "app");
        this.applyLanguageSettings();

        const body = document.querySelector("body");
        body.append(this.app);
        
        this.hideQualtricsElements();
    }

    getAudioContext() {
        if (!this.ENABLE_GAME_SOUNDS) return null;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;

        if (!this.audioContext) {
            this.audioContext = new AudioContextClass();
        }

        if (this.audioContext.state === "suspended") {
            this.audioContext.resume();
        }

        return this.audioContext;
    }

    playTone(frequency, startTime, duration, volume, type = "sine") {
        const audioContext = this.getAudioContext();
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime + startTime;
        const endTime = now + duration;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(endTime + 0.02);
    }

    playChanceSound(probability) {
        if (!this.ENABLE_GAME_SOUNDS) return;

        const chance = Math.max(0, Math.min(100, probability));

        if (chance >= 80) {
            this.playTone(659.25, 0, 0.08, 0.07);
            this.playTone(783.99, 0.08, 0.09, 0.075);
            this.playTone(987.77, 0.17, 0.12, 0.08);
        } else if (chance >= 60) {
            this.playTone(523.25, 0, 0.08, 0.065);
            this.playTone(659.25, 0.09, 0.1, 0.07);
        } else if (chance >= 40) {
            this.playTone(440, 0, 0.07, 0.055, "triangle");
            this.playTone(493.88, 0.08, 0.08, 0.055, "triangle");
        } else if (chance >= 20) {
            this.playTone(293.66, 0, 0.24, 0.075, "triangle");
        } else {
            this.playTone(196, 0, 0.34, 0.08, "triangle");
        }
    }

    playResultSound(isWin) {
        if (!this.ENABLE_GAME_SOUNDS) return;

        if (isWin) {
            this.playTone(523.25, 0, 0.08, 0.1);
            this.playTone(659.25, 0.08, 0.08, 0.11);
            this.playTone(783.99, 0.16, 0.1, 0.12);
            this.playTone(1046.5, 0.27, 0.16, 0.14);
            this.playTone(1318.51, 0.37, 0.22, 0.1);
        } else {
            this.playTone(293.66, 0, 0.2, 0.1, "triangle");
            this.playTone(246.94, 0.18, 0.24, 0.095, "triangle");
            this.playTone(196, 0.4, 0.35, 0.085, "triangle");
        }
    }

    hideQualtricsElements() {
        // Hide Qualtrics header, logo, and question text
        const elementsToHide = [
            "#Header",
            "#Logo",
            ".QuestionText",
            "#Buttons",
            ".QuestionOuter .QuestionText"
        ];
        
        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = "none";
            }
        });

        // Make SkinInner full screen
        const skinInner = document.getElementsByClassName("SkinInner")[0];
        if (skinInner) {
            skinInner.style.padding = "0";
            skinInner.style.margin = "0";
        }
    }

    applyLanguageSettings() {
        const direction = this.HEBREW ? "rtl" : "ltr";

        this.app.setAttribute("dir", direction);
        this.app.style.direction = direction;
        this.app.classList.toggle("hebrew", this.HEBREW);

        document.body.setAttribute("dir", direction);
        document.body.style.direction = direction;

        document.documentElement.lang = this.HEBREW ? "he" : "en";
        document.documentElement.dir = direction;
    }

    initGameArray(isPractice) {
        if (isPractice) {
            this.GAME_LIST = [{ ...PRACTICE_GAME, id: "practice", isPredefined: true }];
            this.CURRENT_GAME = this.GAME_LIST[0];
            return;
        }

        const preparedGames = PREPARED_GAME_LIST.map(game => ({
            ...game,
            isPredefined: true
        }));
        
        let randomGames = [];
        const numRandomGames = this.NUM_OF_GAMES - preparedGames.length;
        
        if (numRandomGames > 0) {
            randomGames = this.createGameArray(numRandomGames, this.NUM_OF_DICE, preparedGames.length).map(game => ({
                ...game,
                isPredefined: false
            }));
        }

        let combinedList = _.shuffle([...preparedGames, ...randomGames]);

        this.GAME_LIST = combinedList.map((game, index) => ({
            ...game,
            id: `game${index + 1}`
        }));

        this.CURRENT_GAME = this.GAME_LIST[0];
    }

    showDiceScreen() {
        this.app.innerHTML = "";
        this.app.classList.remove("slider-page");
        document.body.classList.add("body-style");
        document.body.style.backgroundColor = "#dddddd";
        document.body.style.height = "100vh";
        const qualtricsElements =
            document.getElementsByClassName("SkinInner")[0];
        if (qualtricsElements) {
            qualtricsElements.style.backgroundColor = "#dddddd";
        }

        const gameId = this.CURRENT_GAME.id;
        this.GAME_DATA[gameId] = {
            gameId: gameId,
            isPredefined: this.CURRENT_GAME.isPredefined,
            diceResults: this.CURRENT_GAME.diceResults,
            probabilities: [],
        };
        const numArray = [];
        for (let i = 0; i < this.NUM_OF_DICE; i++) {
            numArray.push(i);
        }
        const dices = numArray.map((num) => {
            return this.createDiceElement(num);
        });
        this.startTime = performance.now();
        const rollBtn = this.createButton("roll", ["roll"], this.TEXT.rollDice);
        rollBtn.addEventListener("click", () => {
            this.endTime = performance.now();
            const rt = this.endTime - this.startTime;
            return this.randomDice(
                dices ? dices.shift() : null,
                rollBtn,
                gameId,
                rt,
            );
        });

        const wideContainerDices = this.createContainer("dices", "wide");
        const wideContainerBtn = this.createContainer("btn", "wide");
        const longContainerBtn = this.createContainer("btn", "long");

        longContainerBtn.append(rollBtn);
        wideContainerBtn.append(longContainerBtn);

        const preStartElement = this.createPreStartElement();
        wideContainerDices.append(preStartElement);

        dices.forEach((dice, ind) => {
            const longContainer = this.createContainer(ind, "long");
            const container = this.createContainer(ind, "normal");
            container.append(dice);
            longContainer.append(container);
            wideContainerDices.append(longContainer);
            this.addCurrentScore(ind, longContainer);
            if (ind === 0) return;
            longContainer.classList.add("disable");
        });
        this.app.append(wideContainerDices);
        this.app.append(wideContainerBtn);
    }

    showSliderScreen(gameId) {
        this.app.innerHTML = "";
        this.app.classList.add("slider-page");

        const slider = this.createCustomSlider(gameId);
        this.app.append(slider);
    }

    startNextGame() {
        this.GAME_LIST.shift();

        if (this.GAME_LIST.length > 0) {
            this.CURRENT_GAME = this.GAME_LIST[0];
            this.CURRENT_SUM = 0;
            this.showDiceScreen();
        } else {
            this.app.innerHTML = "";
            this.app.classList.remove("slider-page");
            const qualtricsElements =
                document.getElementsByClassName("SkinInner")[0];
            if (qualtricsElements) {
                qualtricsElements.style.backgroundColor = "#fff";
            }
            document.body.style.backgroundColor = "#fff";
            this.showQualtricsElements();
            window.postMessage("next", "*");
        }
    }

    showQualtricsElements() {
        // Show Qualtrics elements again when game ends
        const elementsToShow = [
            "#Header",
            "#Logo",
            ".QuestionText",
            "#Buttons",
            ".QuestionOuter .QuestionText"
        ];
        
        elementsToShow.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = "";
            }
        });
    }

    createGeneralElement(element, classes, id) {
        const newElement = document.createElement(element);
        newElement.classList.add(...classes);
        newElement.id = id;
        return newElement;
    }

    createContainer(id, containerType) {
        const className = containerType + "-container";
        const container = this.createGeneralElement(
            "div",
            [className],
            className + id
        );
        if (containerType === "wide") {
            container.style.direction = this.HEBREW ? "rtl" : "ltr";
        }
        return container;
    }

    createButton(id, classes, text) {
        const button = this.createGeneralElement("button", classes, "btn" + id);
        button.innerText = text;
        return button;
    }

    createProgressBar(id, showChanceText = false) {
        const classes = ["progress-wrapper", "progress", "progress-text"];
        const elements = classes.map((className) => {
            return this.createGeneralElement(
                "div",
                [className],
                className + id
            );
        });
        const [progressWrapper, progress, progressText] = elements;
        progressText.innerText = "0%";
        progressWrapper.appendChild(progress);
        progress.appendChild(progressText);

        if (showChanceText) {
            const textContainer = this.createGeneralElement(
                "div",
                ["text-container"],
                `text-container-${id}`
            );
            const chanceText = this.createGeneralElement(
                "div",
                ["chance-text"],
                `chance-text-${id}`
            );
            chanceText.innerHTML = this.TEXT.currentWinningChance;
            chanceText.style.fontSize = "17px";
            chanceText.style.marginBottom = "10px"

            textContainer.appendChild(chanceText);
            textContainer.appendChild(progressText);
            progress.innerHTML = '';
            progress.appendChild(textContainer);
        }

        return { progressWrapper, progress, progressText };
    }

    createDiceElement(id) {
        const dice = this.createGeneralElement("div", ["dice"], "dice" + id);
        const faces = ["front", "back", "left", "right", "top", "bottom"];
        faces.forEach((face, _) => {
            const faceDiv = this.createGeneralElement(
                "div",
                ["face", face],
                face + id
            );
            dice.appendChild(faceDiv);
        });
        return dice;
    }

    setContainerDisable(diceId) {
        const normalContainer = "#normal-container";
        const longContainer = "#long-container";
        const currentNormalDiceContainer = document.querySelector(
            normalContainer + diceId
        );
        const nextLongDiceContainer = document.querySelector(
            longContainer + `${Number(diceId) + 1}`
        );
        const nextNormalDiceContainer = document.querySelector(
            normalContainer + `${Number(diceId) + 1}`
        );
        currentNormalDiceContainer.classList.add("disable");
        if (!nextLongDiceContainer) return;
        nextLongDiceContainer.classList.remove("disable");
        nextNormalDiceContainer.classList.remove("disable");
    }

    rollDice(random, dice) {
        const xRotation = 1440 + Math.random() * 360;
        const yRotation = 1440 + Math.random() * 360;

        void dice.offsetHeight;

        dice.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;

        setTimeout(() => {
            this.setFinalPosition(random, dice);
        }, 200);
    }

    setFinalPosition(random, dice) {
        dice.style.transition = "transform 0.2s ease-out";

        switch (random) {
            case 1:
                dice.style.transform = "rotateX(0deg) rotateY(0deg)";
                break;
            case 6:
                dice.style.transform = "rotateX(180deg) rotateY(0deg)";
                break;
            case 2:
                dice.style.transform = "rotateX(-90deg) rotateY(0deg)";
                break;
            case 5:
                dice.style.transform = "rotateX(90deg) rotateY(0deg)";
                break;
            case 3:
                dice.style.transform = "rotateX(0deg) rotateY(90deg)";
                break;
            case 4:
                dice.style.transform = "rotateX(0deg) rotateY(-90deg)";
                break;
        }
    }

    calculateProbability(currentSum, remainingDice, targetSum = 21) {
        if (currentSum >= targetSum) return 1;
        if (remainingDice === 0) return currentSum >= targetSum ? 1 : 0;

        let favorableOutcomes = 0;
        const totalOutcomes = Math.pow(6, remainingDice);

        function countFavorableOutcomes(sum, diceLeft) {
            if (diceLeft === 0) {
                if (sum >= targetSum) favorableOutcomes++;
                return;
            }
            for (let i = 1; i <= 6; i++) {
                countFavorableOutcomes(sum + i, diceLeft - 1);
            }
        }

        countFavorableOutcomes(currentSum, remainingDice);
        return favorableOutcomes / totalOutcomes;
    }

    createPreStartElement() {
        const longContainer = this.createContainer("pre-start", "long");
        const container = this.createContainer("pre-start", "normal");

        const circle = this.createGeneralElement(
            "div",
            ["dice", "circle"],
            "pre-start-circle"
        );
        circle.innerText = this.TEXT.preStart;

        const { progressWrapper, progress, progressText } = this.createProgressBar("pre-start", true);

        longContainer.append(progressWrapper);
        container.append(circle);
        longContainer.append(container);
        this.addCurrentScore("pre-start", longContainer, "visible");

        if (this.HEBREW) {
            longContainer.style.marginLeft = "20px";
        } else {
            longContainer.style.marginRight = "20px";
        }

        const initialProbability = this.calculateProbability(0, this.NUM_OF_DICE) * 100;
        const maxHeight = window.innerHeight * 0.0035;
        progress.style.height = initialProbability * maxHeight + "px";
        progressText.textContent = Math.round(initialProbability) + "%";

        return longContainer;
    }

    getRollResult(diceId) {
        const roll = this.CURRENT_GAME.diceResults[diceId];
        this.CURRENT_SUM += roll;
        return roll;
    }

    randomDice(dice, rollBtn, gameId, rt) {
        if (!dice) return;
        if (!this.IS_STARTED) {
            const preStartNormalContainer = document.querySelector(
                "#normal-containerpre-start"
            );
            preStartNormalContainer.classList.add("disable");
            this.IS_STARTED = true;
        }
        const diceId = dice.id.slice(-1);
        const random = this.getRollResult(diceId);
        const longDiceContainer = document.querySelector(
            "#long-container" + diceId
        );
        rollBtn.disabled = true;
        this.rollDice(random, dice);
        setTimeout(() => {
            this.changeCurrentScore(diceId);
            this.GAME_DATA[gameId][`dice${parseInt(diceId) + 1}-rt`] = rt;
            this.setContainerDisable(diceId);

            const remainingDice = this.NUM_OF_DICE - parseInt(diceId) - 1;

            if (remainingDice <= 0) {
                const isWin = this.CURRENT_SUM >= 21;
                this.GAME_DATA[gameId].probabilities.push(isWin ? 100 : 0);
                this.finishGame(rollBtn, gameId, dice);
            } else {
                const { progressWrapper, progress, progressText } = this.createProgressBar(diceId, true);
                longDiceContainer.prepend(progressWrapper);

                const probability = this.calculateProbability(this.CURRENT_SUM, remainingDice) * 100;
                const maxHeight = window.innerHeight * 0.0035;
                void progress.offsetHeight;
                progress.style.height = probability * maxHeight + "px";
                progressText.textContent = Math.floor(probability) + "%";

                const currentGame = this.GAME_DATA[gameId];
                currentGame.probabilities.push(Math.round(probability));
                rollBtn.disabled = false;
                this.playChanceSound(probability);

                // Hide all other progress texts
                document.querySelectorAll('.progress-text').forEach(el => {
                    if (el !== progressText) {
                        el.style.display = 'none';
                    }
                });

                // Hide all other chance texts
                const currentChanceText = progress.querySelector('.chance-text');
                document.querySelectorAll('.chance-text').forEach(el => {
                    if (el !== currentChanceText) {
                        el.style.display = 'none';
                    }
                });
            }

        }, 425);
    }

    finishGame(rollBtn, gameId, dice) {
        const isWin = this.CURRENT_SUM >= 21;
        let resultText;
        let resultTextColor;
        if (isWin) {
            this.TOTAL_WINS += 1;
            resultText = this.TEXT.youWon;
            resultTextColor = "#012060"
        } else {
            resultText = this.TEXT.youLose;
            resultTextColor = "#012060"
        }

        const diceId = dice.id.slice(-1);
        const longDiceContainer = document.querySelector(
            "#long-container" + diceId
        );

        const resultElement = this.createGeneralElement(
            "h2",
            ["modal-text"],
            "result-text"
        );
        resultElement.innerText = resultText;
        resultElement.style.color = resultTextColor;

        longDiceContainer.prepend(resultElement);

        // Hide all progress texts and chance texts
        document.querySelectorAll('.progress-text').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.chance-text').forEach(el => el.style.display = 'none');

        this.GAME_DATA[gameId].sum = this.CURRENT_SUM;
        this.GAME_DATA[gameId].result = isWin ? "win" : "loss";
        this.GAME_DATA[gameId].totalWins = this.TOTAL_WINS;

        this.IS_STARTED = false;
        this.playResultSound(isWin);

        setTimeout(() => {
            this.showSliderScreen(gameId);
        }, 1500);
    }

    createCircle(color, left, isMovable = false) {
        const circle = this.createGeneralElement(
            "div",
            ["circle-slider", `${color}`],
            isMovable ? "sliderThumb" : ""
        );
        circle.style.left = left;
        return circle;
    }

    createLabel(text, left) {
        const label = this.createGeneralElement("div", ["label"]);
        label.textContent = text;
        label.style.left = left;
        return label;
    }

    createCustomSlider(gameId) {
        
        const parent = this.createGeneralElement(
            "div",
            ["slider-parent"],
            "slider-parent"
        );
        const title = this.createGeneralElement("h2", [], "slider-title");
        title.textContent = this.TEXT.satisfiedQuestion;

        const sliderContainer = this.createGeneralElement(
            "div",
            ["slider-container"],
            "sliderContainer"
        );

        const track = this.createGeneralElement(
            "div",
            ["slider-track"],
            "sliderTrack"
        );
        const thumb = this.createCircle("yellow", "50%", true);
        const sliderElements = [
            track,
            this.createCircle("black", "0%"),
            this.createLabel(this.TEXT.veryDissatisfied, "0%"),
            this.createCircle("black", "100%"),
            this.createLabel(this.TEXT.verySatisfied, "100%"),
            thumb,
        ];

        sliderElements.forEach((element) => {
            sliderContainer.appendChild(element);
        });

        const button = this.createGeneralElement(
            "button",
            ["roll"],
            "continueBtn"
        );
        button.textContent = this.TEXT.continue;
        button.disabled = true;

        const reminder = this.createGeneralElement(
            "div",
            ["reminder"],
            "reminderText"
        );
        reminder.textContent = this.TEXT.sliderReminder;

        const elements = [title, sliderContainer, button, reminder];
        elements.forEach((element) => {
            parent.appendChild(element);
        });
        const startTime = performance.now();

        let hasMoved = false;
        let reminderTimeout = setTimeout(() => {
            if (!hasMoved) {
                reminder.style.display = "block";
            }
        }, 4000);

        let currentSliderValue = 50;

        sliderContainer.addEventListener("mousedown", (e) => {
            e.preventDefault();
            thumb.style.transition = "none";
            if (!hasMoved) {
                hasMoved = true;
                button.disabled = false;
                reminder.style.display = "none";
                clearTimeout(reminderTimeout);
            }

            const rect = sliderContainer.getBoundingClientRect();
            const thumbWidth = thumb.offsetWidth;

            const setThumbPosition = (clientX) => {
                let x = clientX - rect.left;
                x = Math.max(0, Math.min(rect.width, x));
                const percent = (x / rect.width) * 100;
                thumb.style.left = `calc(${percent}% - ${thumbWidth / 2}px)`;
                currentSliderValue = Math.round(percent);
            };

            setThumbPosition(e.clientX);

            const onMouseMove = (moveEvent) => {
                setThumbPosition(moveEvent.clientX);
            };

            const onMouseUp = () => {
                thumb.style.transition = "left 0.2s ease";
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        button.addEventListener("click", () => {
            const endTime = performance.now();
            const rt = endTime - startTime;
            const currentGame = this.GAME_DATA[gameId];
            currentGame.surveyResult = currentSliderValue;
            currentGame.surveyRt = rt;
            Object.keys(currentGame).forEach((data) => {
                this.writeToLogs(`${gameId}-${data}`, currentGame[data]);
            });
            if (this.GAME_LIST.length === 1) {
                this.writeToLogs("totalWins", this.TOTAL_WINS);
            }
            this.startNextGame();
        });

        return parent;
    }

    createGameArray(numOfGames, numOfDice, startId = 0) {
        const numArray = [];
        const diceArray = [];
        for (let i = 0; i < numOfGames; i++) {
            numArray.push(i);
        }
        for (let i = 0; i < numOfDice; i++) {
            diceArray.push(i);
        }

        const gamesArray = numArray.map((num) => {
            const diceResults = diceArray.map((diceNum) => {
                return Math.floor(Math.random() * 6) + 1;
            });

            return {
                id: `game${startId + num + 1}`,
                diceResults: diceResults,
            };
        });

        return gamesArray;
    }

    addCurrentScore(diceId, longContainer, visibility = "hidden") {
        const currentScore = this.createGeneralElement(
            "p",
            [],
            "current-score" + diceId
        );
        const maxScore = this.createGeneralElement(
            "b",
            ["current-score"],
            "max-score" + diceId
        );
        const boldScore = this.createGeneralElement(
            "b",
            ["bold-score"],
            "bold-score" + diceId
        );

        maxScore.textContent = "/21";
        boldScore.textContent = "0";
        currentScore.appendChild(boldScore);
        currentScore.appendChild(maxScore);
        currentScore.style.visibility = visibility;
        longContainer.append(currentScore);
    }

    changeCurrentScore(diceId) {
        const boldScore = document.querySelector("#bold-score" + diceId);
        const currentScore = document.querySelector("#current-score" + diceId);
        boldScore.innerText = this.CURRENT_SUM;
        currentScore.style.visibility = "visible";
    }

    createModal(text, textColor, gameId) {
        const modal = this.createGeneralElement("div", ["modal"], "modal");
        const modalContent = this.createGeneralElement(
            "div",
            ["modal-inner"],
            "modal-inner"
        );
        const continueButton = this.createButton(
            "close",
            ["modal-btn"],
            this.TEXT.continue
        );
        continueButton.addEventListener("click", () => {
            modal.classList.remove("open");
            this.showSliderScreen(gameId);
        });

        const modalText = this.createGeneralElement(
            "h2",
            ["modal-text"],
            "modal-text"
        );
        modalText.innerText = text;
        modalText.style.color = textColor;
        modalContent.appendChild(modalText);
        modalContent.appendChild(continueButton);
        modal.appendChild(modalContent);
        return modal;
    }

    writeToLogs(field, value) {
        window.console.log(field, ":", value);
        window.postMessage([field, value], "*");
    }
}
