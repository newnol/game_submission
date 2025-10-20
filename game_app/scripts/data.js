// Game configuration
const GAME_CONFIG = { boardSize: 30, maxTurns: 50, winGpThreshold: 12, loseCo2Threshold: 20, initialGp: 0, initialCo2: 0 };

// Board layout
const BOARD_LAYOUT = [
  { id: 1, position: 1, message: 'Start your green journey!', gpDelta: 0, co2Delta: 0, cellType: 'normal', color: 0x4CAF50 },
  { id: 2, position: 2, message: 'Plant trees +2 GP', gpDelta: 2, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 3, position: 3, message: 'Use renewable energy +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 4, position: 4, message: 'Old motorbike emissions +1 CO₂', gpDelta: 0, co2Delta: 1, cellType: 'penalty', color: 0xFF9800 },
  { id: 5, position: 5, message: 'Recycle waste +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 6, position: 6, message: 'Coal plant +2 CO₂', gpDelta: 0, co2Delta: 2, cellType: 'penalty', color: 0xF44336 },
  { id: 7, position: 7, message: 'Walk instead of ride +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 8, position: 8, message: 'Use cloth bag +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 9, position: 9, message: 'Bottled water +1 CO₂', gpDelta: 0, co2Delta: 1, cellType: 'penalty', color: 0xFF9800 },
  { id: 10, position: 10, message: 'Solar power +2 GP', gpDelta: 2, co2Delta: -2, cellType: 'bonus', color: 0x4CAF50 },
  { id: 11, position: 11, message: 'Electric vehicle +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 12, position: 12, message: 'Wildfire +3 CO₂', gpDelta: 0, co2Delta: 3, cellType: 'penalty', color: 0xF44336 },
  { id: 13, position: 13, message: 'Compost organic waste +2 GP', gpDelta: 2, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 14, position: 14, message: 'Sustainable shopping +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 15, position: 15, message: 'AC running 24/7 +2 CO₂', gpDelta: 0, co2Delta: 2, cellType: 'penalty', color: 0xFF9800 },
  { id: 16, position: 16, message: 'Energy-saving device +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 17, position: 17, message: 'Long-distance travel +2 CO₂', gpDelta: 0, co2Delta: 2, cellType: 'penalty', color: 0xFF9800 },
  { id: 18, position: 18, message: 'Home gardening +2 GP', gpDelta: 2, co2Delta: -1, cellType: 'bonus', color: 0x4CAF50 },
  { id: 19, position: 19, message: 'Meat production +2 CO₂', gpDelta: 0, co2Delta: 2, cellType: 'penalty', color: 0xF44336 },
  { id: 20, position: 20, message: 'Go vegetarian +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 21, position: 21, message: 'Recycled paper +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 22, position: 22, message: 'Old motorbike +1 CO₂', gpDelta: 0, co2Delta: 1, cellType: 'penalty', color: 0xFF9800 },
  { id: 23, position: 23, message: 'Join clean-up +2 GP', gpDelta: 2, co2Delta: -1, cellType: 'bonus', color: 0x4CAF50 },
  { id: 24, position: 24, message: 'Gas leak +2 CO₂', gpDelta: 0, co2Delta: 2, cellType: 'penalty', color: 0xF44336 },
  { id: 25, position: 25, message: 'Green tech +2 GP', gpDelta: 2, co2Delta: -2, cellType: 'bonus', color: 0x4CAF50 },
  { id: 26, position: 26, message: 'Reduce waste +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 27, position: 27, message: 'Coal power +3 CO₂', gpDelta: 0, co2Delta: 3, cellType: 'penalty', color: 0xF44336 },
  { id: 28, position: 28, message: 'Conserve energy +1 GP', gpDelta: 1, co2Delta: -1, cellType: 'bonus', color: 0x8BC34A },
  { id: 29, position: 29, message: 'Sustainable development +2 GP', gpDelta: 2, co2Delta: -1, cellType: 'bonus', color: 0x4CAF50 },
  { id: 30, position: 30, message: '🎉 Goal! You reached the end!', gpDelta: 0, co2Delta: 0, cellType: 'special', color: 0x2196F3 },
];

const MESSAGES = { WIN: '🎉 Congratulations! You saved the Earth!', LOSE: '💀 Earth is too hot! Game Over!', ROLL_DICE: 'Roll the dice to move!', GAME_OVER: 'Game over!' };

const RANDOM_EVENTS = [
  { title:'Community Choice', desc:'Your town considers a green initiative:', options:[
    { text:'Host a tree-planting day', gp:+2, co2:-1 },
    { text:'Postpone due to budget', gp:-1, co2:0 },
  ]},
  { title:'Unexpected Heatwave', desc:'A heatwave hits for 3 days:', options:[
    { text:'Run air conditioning more', gp:0, co2:+2 },
    { text:'Use fans and hydrate', gp:+1, co2:+1 },
  ]},
  { title:'Local Policy', desc:'Council votes on solar subsidy:', options:[
    { text:'Approve the subsidy', gp:+2, co2:-2 },
    { text:'Delay for more studies', gp:0, co2:0 },
  ]},
];

const QUIZZES = [
  { title: 'Challenge: Reduce CO₂', desc: 'Pick one everyday action:', options:[
    { text:'Turn off lights when not in use', gp:+1, co2:0 },
    { text:'Bike instead of car for short trips', gp:+2, co2:-1 },
  ]},
  { title: 'Challenge: Plastic Usage', desc: 'Pick your daily choice:', options:[
    { text:'Use a reusable bottle', gp:+1, co2:-1 },
    { text:'Buy a single-use bottle', gp:-1, co2:+1 },
  ]},
];

// Per-cell challenges map – each position can include additional contextual choices
const CELL_CHALLENGES = {
  2: { title: 'Trees Maintenance', desc: 'How do you maintain the planted trees?', options:[
    { text:'Weekly watering', gp:+1, co2:0 },
    { text:'Community volunteer day', gp:+2, co2:-1 },
  ]},
  6: { title: 'Energy Transition', desc: 'Coal plant seeks mitigation:', options:[
    { text:'Install scrubbers', gp:0, co2:-1 },
    { text:'Lobby for shutdown', gp:+1, co2:0 },
  ]},
  10:{ title: 'Solar Siting', desc: 'Pick a siting strategy:', options:[
    { text:'Rooftops first', gp:+1, co2:-1 },
    { text:'Open fields', gp:0, co2:-2 },
  ]},
  15:{ title: 'Cooling Efficiency', desc: 'Reduce AC footprint:', options:[
    { text:'Smart thermostat', gp:+1, co2:-1 },
    { text:'Seal insulation', gp:+1, co2:-1 },
  ]},
  20:{ title: 'Diet Shift', desc: 'Choose an approach:', options:[
    { text:'Meatless Mondays', gp:+1, co2:-1 },
    { text:'Join veg community', gp:+2, co2:-1 },
  ]},
  25:{ title: 'Green Tech Strategy', desc: 'Select an investment path:', options:[
    { text:'Battery storage', gp:+1, co2:-1 },
    { text:'Smart grid', gp:+2, co2:0 },
  ]},
};
