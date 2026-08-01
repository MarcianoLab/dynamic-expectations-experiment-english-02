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
        this.gameStartTime = 0;
        this.HEBREW = HEBREW;
        this.TEXT = this.HEBREW ? UI_TEXT.he : UI_TEXT.en;
        if (
            typeof chance_loading_animation_enabled === "undefined" ||
            typeof chance_loading_animation_duration_ms === "undefined" ||
            typeof chances_text_glow_enabled === "undefined" ||
            typeof chances_text_glow_duration_ms === "undefined" ||
            typeof chance_scale_enabled === "undefined" ||
            typeof extended_satisfaction_scale_enabled === "undefined"
        ) {
            console.error("Missing required configuration: chance_loading_animation_enabled, chance_loading_animation_duration_ms, chances_text_glow_enabled, chances_text_glow_duration_ms, chance_scale_enabled, and extended_satisfaction_scale_enabled must be defined in constants.js");
            throw new Error("Missing configuration in constants.js");
        }
        this.TEXT_ANIMATION_ENABLED = chances_text_glow_enabled;
        this.CHANCES_TEXT_GLOW_DURATION = chances_text_glow_duration_ms;
        this.CHANCE_LOADING_ANIMATION_ENABLED = chance_loading_animation_enabled;
        this.CHANCE_LOADING_DURATION = chance_loading_animation_duration_ms;
        this.CHANCE_SCALE_ENABLED = chance_scale_enabled;
        this.EXTENDED_SATISFACTION_SCALE_ENABLED = extended_satisfaction_scale_enabled;
        this.FINAL_CHANCE_ANIMATION_DURATION = typeof final_chance_animation_duration_ms !== 'undefined' ? final_chance_animation_duration_ms : 1500;
        this.scaleArrow = null;
        this.startTime = 0;
        this.endTime = 0;
        this.app = this.createGeneralElement("div", ["app"], "app");
        this.applyLanguageSettings();

        const body = document.querySelector("body");
        body.append(this.app);

        this.hideQualtricsElements();

        window.addEventListener("resize", () => {
            document.querySelectorAll(".progress-wrapper").forEach((wrapper) => {
                const prob = wrapper.dataset.probability;
                const prog = wrapper.querySelector(".progress");
                if (prob !== undefined && prog) {
                    this.updateProgressBarHeight(wrapper, prog, parseFloat(prob));
                }
            });
        });
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
            this.playTone(246.94, 0, 0.12, 0.075, "triangle");
            this.playTone(220, 0.12, 0.12, 0.07, "triangle");
        } else {
            this.playTone(164.81, 0, 0.12, 0.08, "triangle");
            this.playTone(146.83, 0.12, 0.12, 0.075, "triangle");
            this.playTone(130.81, 0.24, 0.12, 0.07, "triangle");
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

    getPreparedGameName(game) {
        const preparedGameNames = [
            { game: Trajectory_B_Lose, name: "Trajectory_B_Lose" },
            { game: Trajectory_A_Lose, name: "Trajectory_A_Lose" },
            { game: Trajectory_D_Win, name: "Trajectory_D_Win" },
            { game: Trajectory_C_Win, name: "Trajectory_C_Win" },
            { game: GAME_5, name: "GAME_5" },
            { game: Trajectory_B_Win, name: "Trajectory_B_Win" },
            { game: Trajectory_A_Win, name: "Trajectory_A_Win" },
            { game: GAME_8, name: "GAME_8" },
            { game: GAME_9, name: "GAME_9" },
        ];
        const preparedGame = preparedGameNames.find(({ game: preparedGameRef }) => preparedGameRef === game);
        return preparedGame ? preparedGame.name : "Random";
    }

    isRestrictedGamePair(firstGame, secondGame) {
        if (!firstGame || !secondGame) return false;

        const pair = [firstGame.sourceGameName, secondGame.sourceGameName].sort().join("-");
        return pair === "Trajectory_B_Lose-Trajectory_B_Win" || pair === "Trajectory_A_Lose-Trajectory_A_Win";
    }

    buildValidGameOrder(remainingGames, orderedGames = []) {
        if (remainingGames.length === 0) return orderedGames;

        const shuffledOptions = _.shuffle(remainingGames.map((game, index) => ({ game, index })));
        for (const { game, index } of shuffledOptions) {
            if (this.isRestrictedGamePair(orderedGames[orderedGames.length - 1], game)) continue;

            const nextRemainingGames = remainingGames.filter((_, remainingIndex) => remainingIndex !== index);
            const validOrder = this.buildValidGameOrder(nextRemainingGames, [...orderedGames, game]);
            if (validOrder) return validOrder;
        }

        return null;
    }

    randomizeGameOrder(gameList) {
        return this.buildValidGameOrder(gameList) || _.shuffle(gameList);
    }

    createGamesSummary() {
        const summary = {};

        Object.keys(this.GAME_DATA).forEach((gameId) => {
            const game = this.GAME_DATA[gameId];
            summary[gameId] = {
                serial_num: game.serial_num,
                source: game.isPredefined,
                diceResults: game.diceResults,
                probabilities: game.probabilities,
                sum: game.sum,
                result: game.result,
                duration: game.duration,
                satisfaction: game.surveyResult,
                satisfactionRt: game.surveyRt,
            };
        });

        return JSON.stringify(summary, null, 2);
    }

    writeTrajectoryLogs(game) {
        const sourceName = game.isPredefined;
        if (!sourceName || sourceName === "Random") return;

        Object.keys(game).forEach((data) => {
            const fieldName = data === "duration" ? `${sourceName}_duration` : `${sourceName}-${data}`;
            this.writeToLogs(fieldName, game[data]);
        });
    }

    initGameArray(isPractice) {
        if (isPractice) {
            this.GAME_LIST = [{ ...PRACTICE_GAME, id: "practice", isPredefined: "PRACTICE_GAME", sourceGameName: "PRACTICE_GAME" }];
            this.CURRENT_GAME = this.GAME_LIST[0];
            return;
        }

        const preparedGames = PREPARED_GAME_LIST.map(game => ({
            ...game,
            isPredefined: this.getPreparedGameName(game),
            sourceGameName: this.getPreparedGameName(game),
        }));

        let randomGames = [];
        const numRandomGames = this.NUM_OF_GAMES - preparedGames.length;

        if (numRandomGames > 0) {
            randomGames = this.createGameArray(numRandomGames, this.NUM_OF_DICE, preparedGames.length).map(game => ({
                ...game,
                isPredefined: "Random",
                sourceGameName: "Random",
            }));
        }

        let combinedList = this.randomizeGameOrder([...preparedGames, ...randomGames]);

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

        this.gameStartTime = performance.now();
        const gameId = this.CURRENT_GAME.id;
        this.GAME_DATA[gameId] = {
            gameId: gameId,
            serial_num: Number(gameId.replace("game", "")),
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
        if (this.CHANCE_SCALE_ENABLED) {
            const scale = this.createChanceScale();
            this.app.prepend(scale);
            const initialProbability = this.calculateProbability(0, this.NUM_OF_DICE) * 100;
            this.scaleArrow.style.transition = 'none';
            this.updateScaleArrow(Math.round(initialProbability), false);
            void this.scaleArrow.offsetHeight;
            this.scaleArrow.style.transition = '';
        }
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

        if (this.CHANCE_SCALE_ENABLED) {
            progressWrapper.style.display = "none";
        }

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
            chanceText.style.marginBottom = "10px";

            textContainer.appendChild(chanceText);
            textContainer.appendChild(progressText);
            progress.innerHTML = '';
            progress.appendChild(textContainer);
        }

        return { progressWrapper, progress, progressText };
    }

    createChanceScale() {
        const wrapper = this.createGeneralElement("div", ["chance-scale-wrapper"], "chance-scale");

        const title = this.createGeneralElement("div", ["chance-scale-title"], "scale-title");
        title.textContent = this.TEXT.scaleTitle;

        const barArea = this.createGeneralElement("div", ["chance-scale-bar-area"], "scale-bar-area");

        const arrowTrack = this.createGeneralElement("div", ["chance-scale-arrow-track"], "scale-arrow-track");
        const arrow = this.createGeneralElement("div", ["chance-scale-arrow"], "scale-arrow");
        const arrowLabel = this.createGeneralElement("div", ["chance-scale-arrow-label"], "scale-arrow-label");
        arrowLabel.textContent = "0%";
        arrow.appendChild(arrowLabel);
        arrowTrack.appendChild(arrow);

        const bar = this.createGeneralElement("div", ["chance-scale-bar"], "scale-bar");

        const ticksContainer = this.createGeneralElement("div", ["chance-scale-ticks"], "scale-ticks");
        const tickGroups = [];

        for (let i = 0; i <= 100; i += 10) {
            const tickGroup = this.createGeneralElement("div", ["chance-scale-tick-group"], `scale-tick-group-${i}`);
            tickGroup.style.left = `${i}%`;

            const tickMark = this.createGeneralElement("div", ["chance-scale-tick-mark"], `scale-tick-${i}`);
            const tickLabel = this.createGeneralElement("span", ["chance-scale-tick-label"], `scale-label-${i}`);
            tickLabel.textContent = i + "%";

            tickGroup.appendChild(tickMark);
            tickGroup.appendChild(tickLabel);
            ticksContainer.appendChild(tickGroup);

            tickGroups.push({ element: tickGroup, percentage: i });
        }

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                const dpr = window.devicePixelRatio || 1;
                tickGroups.forEach(tick => {
                    // Snap to physical pixel boundaries by rounding in physical space first
                    const physicalPos = Math.round((tick.percentage / 100) * width * dpr);
                    const cssPos = physicalPos / dpr;
                    tick.element.style.left = `${cssPos}px`;
                });
            }
        });
        resizeObserver.observe(ticksContainer);

        barArea.appendChild(arrowTrack);
        barArea.appendChild(bar);
        barArea.appendChild(ticksContainer);

        wrapper.appendChild(title);
        wrapper.appendChild(barArea);

        this.scaleArrow = arrow;
        this.scaleArrowLabel = arrowLabel;
        this.scaleArrowCurrentValue = 0;
        return wrapper;
    }

    updateScaleArrow(probability, animate = true) {
        if (!this.scaleArrow) return;
        this.scaleArrow.style.left = `${probability}%`;

        if (!this.scaleArrowLabel) return;

        const to = Math.round(probability);

        if (!animate) {
            this.scaleArrowLabel.textContent = to + "%";
            this.scaleArrowCurrentValue = to;
            return;
        }

        const from = this.scaleArrowCurrentValue !== undefined ? this.scaleArrowCurrentValue : 0;
        const duration = 400; // ms — matches the CSS transition duration
        const startTime = performance.now();

        // Cancel any in-progress animation
        if (this._arrowLabelRaf) cancelAnimationFrame(this._arrowLabelRaf);

        const animationStep = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic to match CSS ease-out feel
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (to - from) * eased);
            this.scaleArrowLabel.textContent = current + "%";
            if (progress < 1) {
                this._arrowLabelRaf = requestAnimationFrame(animationStep);
            } else {
                this.scaleArrowCurrentValue = to;
                this._arrowLabelRaf = null;
            }
        };

        this._arrowLabelRaf = requestAnimationFrame(animationStep);
    }

    updateProgressBarHeight(progressWrapper, progress, probability) {
        if (!progressWrapper || !progress) return;
        progressWrapper.dataset.probability = probability;
        const scaleEl = this.CHANCE_SCALE_ENABLED ? document.querySelector('.chance-scale-wrapper') : null;
        const scaleBottom = scaleEl ? scaleEl.getBoundingClientRect().bottom : 0;
        const barBottom = progressWrapper.getBoundingClientRect().bottom || (window.innerHeight * 0.7);
        const textContainer = progress.querySelector('.text-container');
        const textHeight = textContainer ? Math.max(textContainer.offsetHeight, Math.abs(textContainer.offsetTop || 0)) : 100;
        const availableHeight = Math.max(20, barBottom - scaleBottom - textHeight - 15);
        const standardMaxHeight = window.innerHeight * 0.35;
        const maxProgressHeight = Math.max(15, Math.min(standardMaxHeight, availableHeight));
        progress.style.height = ((probability / 100) * maxProgressHeight) + "px";
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
        progressText.textContent = Math.round(initialProbability) + "%";
        requestAnimationFrame(() => {
            this.updateProgressBarHeight(progressWrapper, progress, initialProbability);
        });

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

            const remainingDice = this.NUM_OF_DICE - parseInt(diceId) - 1;

            if (remainingDice <= 0) {
                this.setContainerDisable(diceId);
                const isWin = this.CURRENT_SUM >= 21;
                this.GAME_DATA[gameId].probabilities.push(isWin ? 100 : 0);
                this.finishGame(rollBtn, gameId, dice);
            } else {
                const { progressWrapper, progress, progressText } = this.createProgressBar(diceId, true);
                longDiceContainer.prepend(progressWrapper);

                const probability = this.calculateProbability(this.CURRENT_SUM, remainingDice) * 100;

                const currentGame = this.GAME_DATA[gameId];
                currentGame.probabilities.push(Math.round(probability));

                // Hide all other progress texts and spinners
                document.querySelectorAll('.progress-text').forEach(el => {
                    if (el !== progressText) {
                        el.style.display = 'none';
                    }
                });
                document.querySelectorAll('.chance-spinner').forEach(el => el.remove());

                // Hide all other chance texts
                const currentChanceText = progress.querySelector('.chance-text');
                document.querySelectorAll('.chance-text').forEach(el => {
                    if (el !== currentChanceText) {
                        el.style.display = 'none';
                    }
                });

                const finishRollStep = () => {
                    this.setContainerDisable(diceId);
                    rollBtn.disabled = false;
                };

                const showChanceResult = () => {
                    void progress.offsetHeight;
                    progressText.textContent = Math.floor(probability) + "%";
                    progressText.style.display = "";

                    this.updateProgressBarHeight(progressWrapper, progress, probability);

                    if (this.CHANCE_SCALE_ENABLED) {
                        this.updateScaleArrow(probability);
                    }

                    this.playChanceSound(probability);

                    // Yellow glow animation on the chance label and percentage text
                    if (this.TEXT_ANIMATION_ENABLED) {
                        rollBtn.disabled = true;
                        [progressText, currentChanceText].forEach(el => {
                            if (!el) return;
                            el.classList.remove('progress-text-glow', 'chance-text-glow');
                            void el.offsetWidth; // force reflow so animation restarts
                            el.classList.add(progressText === el ? 'progress-text-glow' : 'chance-text-glow');
                        });

                        setTimeout(() => {
                            finishRollStep();
                        }, this.CHANCES_TEXT_GLOW_DURATION);
                    } else {
                        finishRollStep();
                    }
                };

                if (this.CHANCE_LOADING_ANIMATION_ENABLED && !this.CHANCE_SCALE_ENABLED) {
                    progress.style.height = "0px";
                    progressText.style.display = "none";
                    rollBtn.disabled = true;

                    const textContainer = progress.querySelector('.text-container');
                    const spinner = this.createGeneralElement("div", ["chance-spinner"], `spinner-${diceId}`);
                    if (textContainer) {
                        textContainer.appendChild(spinner);
                    }

                    setTimeout(() => {
                        if (spinner && spinner.parentNode) {
                            spinner.parentNode.removeChild(spinner);
                        }
                        showChanceResult();
                    }, this.CHANCE_LOADING_DURATION);
                } else {
                    showChanceResult();
                }
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
            resultTextColor = this.CHANCE_SCALE_ENABLED ? "green" : "#012060";
        } else {
            resultText = this.TEXT.youLose;
            resultTextColor = this.CHANCE_SCALE_ENABLED ? "red" : "#012060";
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

        if (this.CHANCE_SCALE_ENABLED) {
            const scaleWrapper = document.getElementById('chance-scale');
            if (scaleWrapper) {
                resultElement.style.position = 'absolute';
                resultElement.style.bottom = '100%';
                resultElement.style.margin = '0';
                resultElement.style.marginBottom = '20px';
                resultElement.style.width = 'max-content';
                scaleWrapper.prepend(resultElement);
            }
        } else {
            longDiceContainer.prepend(resultElement);
        }

        // Hide all progress texts and chance texts
        document.querySelectorAll('.progress-text').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.chance-text').forEach(el => el.style.display = 'none');

        // Move arrow to 0 or 100
        if (this.CHANCE_SCALE_ENABLED) {
            this.updateScaleArrow(isWin ? 100 : 0);
        }

        this.GAME_DATA[gameId].sum = this.CURRENT_SUM;
        this.GAME_DATA[gameId].result = isWin ? "win" : "loss";
        this.GAME_DATA[gameId].totalWins = this.TOTAL_WINS;

        this.IS_STARTED = false;
        this.playResultSound(isWin);

        setTimeout(() => {
            this.GAME_DATA[gameId].duration = Math.round(performance.now() - this.gameStartTime);
            this.showSliderScreen(gameId);
        }, this.FINAL_CHANCE_ANIMATION_DURATION);
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
        ];

        if (this.EXTENDED_SATISFACTION_SCALE_ENABLED) {
            sliderElements.push(
                this.createCircle("black", "33.33%"),
                this.createLabel(this.TEXT.dissatisfied, "33.33%"),
                this.createCircle("black", "66.67%"),
                this.createLabel(this.TEXT.satisfied, "66.67%")
            );
        }

        sliderElements.push(
            this.createCircle("black", "100%"),
            this.createLabel(this.TEXT.verySatisfied, "100%"),
            thumb
        );

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
                const fieldName = data === "duration" ? `${gameId}_duration` : `${gameId}-${data}`;
                this.writeToLogs(fieldName, currentGame[data]);
            });
            this.writeTrajectoryLogs(currentGame);
            if (this.GAME_LIST.length === 1) {
                this.writeToLogs("totalWins", this.TOTAL_WINS);
                this.writeToLogs("games_summary", this.createGamesSummary());
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
