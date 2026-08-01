var Trajectory_B_Lose = { diceResults: [2, 2, 2, 6, 5, 3] };
var Trajectory_A_Lose = { diceResults: [4, 5, 5, 1, 2, 3] };
var Trajectory_D_Win = { diceResults: [1, 4, 3, 5, 6, 6] };
var Trajectory_C_Win = { diceResults: [5, 6, 2, 4, 2, 4] };

var GAME_5 = { diceResults: [3, 4, 5, 1, 3, 6] };

var Trajectory_B_Win = { diceResults: [2, 2, 2, 6, 5, 4] };
var Trajectory_A_Win = { diceResults: [4, 5, 5, 1, 2, 6] };
var GAME_8 = { diceResults: [1, 4, 3, 5, 6, 1] };
var GAME_9 = { diceResults: [5, 6, 2, 4, 2, 1] };

var PRACTICE_GAME = { diceResults: [6, 1, 3, 4, 1, 2] };

var PREPARED_GAME_LIST = [
    Trajectory_B_Lose,
    Trajectory_A_Lose,
    Trajectory_D_Win,
    Trajectory_C_Win,
    Trajectory_B_Win,
    Trajectory_A_Win,
];

var HEBREW = true;
var ENABLE_GAME_SOUNDS = false;

var chances_text_glow_enabled = window.chances_text_glow_enabled || false;
var chances_text_glow_duration_ms = 500;

var chance_loading_animation_enabled = window.chance_loading_animation_enabled || false;
var chance_loading_animation_duration_ms = 2000;

var chance_scale_enabled = window.chance_scale_enabled || false;
var extended_satisfaction_scale_enabled = window.extended_satisfaction_scale_enabled || false;
var final_chance_animation_duration_ms = window.final_chance_animation_duration_ms || 1500;

var UI_TEXT = {
    en: {
        rollDice: "Roll Dice",
        currentWinningChance: "Current winning<br>chance",
        preStart: "Pre-start",
        youWon: "You Won!",
        youLose: "You Lose!",
        satisfiedQuestion: "How satisfied are you at this moment?",
        veryDissatisfied: "Very dissatisfied",
        dissatisfied: "Dissatisfied",
        satisfied: "Satisfied",
        verySatisfied: "Very satisfied",
        continue: "Continue",
        sliderReminder: "Please move the slider according to the instructions",
        scaleTitle: "Current Winning (21+ points) Chance",
    },
    he: {
        rollDice: "להטיל קובייה",
        currentWinningChance: "הסיכויים שלך לזכות",
        preStart: "טרום משחק",
        youWon: "ניצחת!",
        youLose: "הפסדת!",
        satisfiedQuestion: "כמה את/ה מרוצה כרגע?",
        veryDissatisfied: "מאוד לא מרוצה",
        dissatisfied: "לא כל כך מרוצה",
        satisfied: "מרוצה",
        verySatisfied: "מאוד מרוצה",
        continue: "המשך/י",
        sliderReminder: "גרור/י את המחוון למיקום המתאים",
        scaleTitle: "הסיכויים שלך לזכות (21 נקודות ומעלה)",
    },
};

