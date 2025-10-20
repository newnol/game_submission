# Eco Dice – Game Submission

## Overview
Eco Dice is a lightweight web game built with Phaser 3. Players roll a dice to traverse a 30-cell sustainability board, balancing Green Points (GP) against CO₂ emissions. Each cell includes contextual challenges to deepen decision-making and replayability.

## How to Run
- Open `game_app/index.html` directly in a modern browser (Chrome, Edge, Safari).
- No build step required; all assets are static.

## Controls
- Click "ROLL DICE" to move.
- Use power-ups from the dock: Reroll, Offset CO₂, Double Step.
- When challenge/event cards appear, click an option to apply effects.

## Win/Lose Conditions
- Win: Reach the end with at least the GP threshold.
- Lose: Reach the CO₂ threshold or run out of turns.

## Project Structure
```
game_submission/
├── README.md
├── project_report.pdf
├── youtube_link.txt
├── prompts/
│   ├── concept_prompts.txt
│   ├── asset_generation_prompts.txt
│   ├── code_generation_prompts.txt
│   └── refinement_prompts.txt
├── game_app/
│   ├── index.html
│   ├── assets/
│   │   └── styles.css
│   └── scripts/
│       ├── data.js
│       └── game.js
└── screenshots/
    ├── menu_screen.png
    ├── play_screen1.png
    ├── play_screen2.png
    ├── play_screen3.png
    └── results_screen.png
```

## Notes
- Replace the 5 screenshots with actual captures from your gameplay.
- Update `youtube_link.txt` with your unlisted video URL.
- Replace `project_report.pdf` with your final report.
