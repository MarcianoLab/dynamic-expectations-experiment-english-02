class DiceGame {
    constructor() {
        this.IS_REAL = false;
        this.NUM_OF_DICE = 6;
        this.NUM_OF_GAMES = 5;
        this.CURRENT_SUM = 0;
        this.GAME_LIST = [];
        this.CURRENT_GAME = {};
        this.GAME_DATA = {};
        this.IS_STARTED = false;
        this.startTime = 0;
        this.endTime = 0;
        this.app = this.createGeneralElement("div", ["app"], "app");
        this.app.setAttribute("dir", "ltr");

        const body = document.querySelector("body");
        body.append(this.app);
        
        this.hideQualtricsElements();
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

    initGameArray(isPractice) {
        if (isPractice) {
            this.GAME_LIST = [PRACTICE_GAME];
            this.CURRENT_GAME = this.GAME_LIST[0];
            return;
        }
        this.GAME_LIST = this.IS_REAL
            ? this.createGameArray(this.NUM_OF_GAMES, this.NUM_OF_DICE)
            : _.shuffle(PREPARED_GAME_LIST);
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
        const rollBtn = this.createButton("roll", ["roll"], "Roll Dice");
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
            chanceText.innerHTML = "Current winning<br>chance";
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
        circle.innerText = "Pre-start";

        const { progressWrapper, progress, progressText } = this.createProgressBar("pre-start", true);

        longContainer.append(progressWrapper);
        container.append(circle);
        longContainer.append(container);
        this.addCurrentScore("pre-start", longContainer, "visible");

        longContainer.style.marginRight = "20px";

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
            resultText = "You Won!"
            resultTextColor = "#012060"
        } else {
            resultText = "You Lose!"
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

        this.IS_STARTED = false;

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
        title.textContent = "How satisfied are you at this moment?";

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
            this.createLabel("Very dissatisfied", "0%"),
            this.createCircle("black", "100%"),
            this.createLabel("Very satisfied", "100%"),
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
        button.textContent = "Continue";
        button.disabled = true;

        const reminder = this.createGeneralElement(
            "div",
            ["reminder"],
            "reminderText"
        );
        reminder.textContent =
            "Please move the slider according to the instructions";

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
            this.startNextGame();
        });

        return parent;
    }

    createGameArray(numOfGames, numOfDice) {
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
                id: `game${num + 1}`,
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
            "Continue"
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
