const socket = io();
document.getElementById('gameContainer').style.display = 'none';

let cur_gamestate = { players: {}, cards: [] };
let myIndex = -1;
let myName = '';
let options = [];
let canPlay = false;

// Prompt for player name
const playerName = prompt('Please enter your name:');
myName = playerName;
socket.emit('setPlayerName', playerName);

// ---- DOM element references ----

const HeartDisplay = document.getElementById('HeartDisplay');
const ClubDisplay = document.getElementById('ClubDisplay');
const DiamondDisplay = document.getElementById('DiamondDisplay');
const SpadeDisplay = document.getElementById('SpadeDisplay');

const HeartDisplayUp = document.getElementById('HeartDisplayUp');
const ClubDisplayUp = document.getElementById('ClubDisplayUp');
const DiamondDisplayUp = document.getElementById('DiamondDisplayUp');
const SpadeDisplayUp = document.getElementById('SpadeDisplayUp');

const HeartDisplayDown = document.getElementById('HeartDisplayDown');
const ClubDisplayDown = document.getElementById('ClubDisplayDown');
const DiamondDisplayDown = document.getElementById('DiamondDisplayDown');
const SpadeDisplayDown = document.getElementById('SpadeDisplayDown');

const allDisplays = [HeartDisplay, ClubDisplay, DiamondDisplay, SpadeDisplay,
	HeartDisplayUp, ClubDisplayUp, DiamondDisplayUp, SpadeDisplayUp,
	HeartDisplayDown, ClubDisplayDown, DiamondDisplayDown, SpadeDisplayDown];

const player_hand = document.getElementById('player_hand');
const all_cards = [];
for (let i = 1; i <= 19; i++) {
	all_cards.push(document.getElementById('c' + i));
}

const player1 = document.getElementById('player1');
const comp1 = document.getElementById('comp1');
const comp2 = document.getElementById('comp2');
const displaySlots = [player1, comp1, comp2];
let player_names = ["Player", "Comp1", "Comp2"];

const connected_players = document.getElementById('connected_players');
const scoreDisplay = document.getElementById('score');
const C1scoreDisplay = document.getElementById('comp1_score');
const C2scoreDisplay = document.getElementById('comp2_score');
const all_scores = [scoreDisplay, C1scoreDisplay, C2scoreDisplay];
const playerDisplay = document.getElementById('cur_player');

const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

startBtn.addEventListener('click', () => startGame());
resetBtn.addEventListener('click', () => resetGame());
document.getElementById('newStartButton').addEventListener('click', () => startGame());

// Card display state
let seven_played = [0, 0, 0, 0];
let upper = ['8', '8', '8', '8'];
let lower = ['6', '6', '6', '6'];
let cur_hand = [];

// Sort cards by suit then rank
function sortCards(cards) {
	const suitOrder = ['H', 'C', 'D', 'S'];
	const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	return cards.slice().sort((a, b) => {
		let suitA = a.slice(-1), suitB = b.slice(-1);
		let rankA = a.slice(0, -1), rankB = b.slice(0, -1);
		if (suitA !== suitB) return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB);
		return rankOrder.indexOf(rankA) - rankOrder.indexOf(rankB);
	});
}

// Convert global player index to display slot index
function globalToSlot(globalIdx) {
	return (globalIdx - myIndex + 3) % 3;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Calculate score from remaining cards in a hand
function handScore(hand) {
	let score = 0;
	for (let i = 0; i < hand.length; i++) {
		let rank = hand[i].slice(0, -1);
		if (rank === 'A') rank = '10';
		else if (rank === 'J') rank = '11';
		else if (rank === 'Q') rank = '12';
		else if (rank === 'K') rank = '13';
		score += parseInt(rank, 10);
	}
	return score;
}

// Toggle clickable state on hand cards using CSS
function setHandClickable(clickable) {
	if (clickable) {
		player_hand.classList.remove('no-click');
		// Mark each card as playable or not based on options
		for (let i = 0; i < all_cards.length; i++) {
			let src = all_cards[i].src;
			let startIndex = src.indexOf('cards/') + 'cards/'.length;
			let endIndex = src.indexOf('.svg');
			if (startIndex >= 0 && endIndex >= 0) {
				let cardName = src.substring(startIndex, endIndex);
				if (options.indexOf(cardName) >= 0) {
					all_cards[i].classList.remove('not-playable');
				} else {
					all_cards[i].classList.add('not-playable');
				}
			}
		}
	} else {
		player_hand.classList.add('no-click');
		for (let i = 0; i < all_cards.length; i++) {
			all_cards[i].classList.remove('not-playable');
		}
	}
}

// Process a card click - mirrors single-player process_click
function process_click(img) {
	if (options.length === 0) return;
	let str = img.src;
	let startIndex = str.indexOf('cards/') + 'cards/'.length;
	let endIndex = str.indexOf('.svg');
	if (startIndex < 0 || endIndex < 0) return;
	let extractedString = str.substring(startIndex, endIndex);

	if (options.indexOf(extractedString) >= 0) {
		console.log(extractedString + ' is playable');
		socket.emit('playCard', extractedString);
		options = [];
		canPlay = false;
		setHandClickable(false);
	} else {
		console.log(extractedString + ' NOT playable');
	}
}

// ---- Socket event handlers ----

socket.on('updateGameState', (gameState) => {
	cur_gamestate = gameState;
});

socket.on('threePlayersJoined', (gameState) => {
	console.log('Three players joined!');
	cur_gamestate = gameState;
	document.getElementById('newStartButton').style.display = 'block';
	let playersList = document.getElementById('playersList');
	playersList.innerHTML = '';
	Object.values(gameState.players).forEach(player => {
		const listItem = document.createElement('li');
		listItem.textContent = player.name;
		playersList.appendChild(listItem);
	});
});

socket.on('dealHand', (data) => {
	console.log('Received hand:', data.hand);
	console.log('Player order:', data.playerNames);
	console.log('My index:', data.playerIndex);

	myIndex = data.playerIndex;
	options = [];
	canPlay = false;
	setHandClickable(false);
	player_names = data.playerNames;

	for (let i = 0; i < 3; i++) {
		let globalIdx = (myIndex + i) % 3;
		displaySlots[i].textContent = player_names[globalIdx] + ': ' + data.hand.length + ' cards';
		displaySlots[i].style.background = '#d3d3d3';
	}

	cur_hand = [data.hand, [], []];
	display_hand(sortCards(data.hand));

	renderBoard({ sevenPlayed: [0, 0, 0, 0], upper: ['8', '8', '8', '8'], lower: ['6', '6', '6', '6'] });

	document.getElementById('startupScreen').style.display = 'none';
	document.getElementById('gameContainer').style.display = 'block';
	document.getElementById('gameContainer').style.visibility = 'visible';
	startBtn.style.visibility = 'hidden';
	resetBtn.style.visibility = 'visible';
});

socket.on('yourTurn', (data) => {
	console.log('Turn of player ' + data.playerIndex + ', Options:', data.options);

	// Reset all backgrounds
	for (let i = 0; i < 3; i++) {
		displaySlots[i].style.background = '#d3d3d3';
	}
	// Highlight whose turn
	let turnSlot = globalToSlot(data.playerIndex);
	if (turnSlot >= 0 && turnSlot < 3) {
		displaySlots[turnSlot].style.background = 'green';
	}

	if (data.playerIndex === myIndex) {
		options = data.options;
		canPlay = options.length > 0;
		if (canPlay) {
			setHandClickable(true);
		} else {
			setHandClickable(false);
			socket.emit('passTurn');
		}
	} else {
		options = [];
		canPlay = false;
		setHandClickable(false);
	}
});

socket.on('notYourTurn', (data) => {
	if (data.currentPlayerIndex !== myIndex) {
		options = [];
		canPlay = false;
		setHandClickable(false);
	}
});

socket.on('cardPlayed', (data) => {
	console.log(data.playerName + ' played ' + data.card);

	if (data.hands) {
		for (let [pid, hand] of Object.entries(data.hands)) {
			if (pid === socket.id) {
				cur_hand[myIndex] = hand;
				display_hand(sortCards(hand));
			}
		}
	}

	let playedSlot = globalToSlot(data.playerIndex);
	if (playedSlot >= 0 && playedSlot < 3) {
		displaySlots[playedSlot].textContent = player_names[data.playerIndex] + ': ' + data.handSize + ' cards';
	}

	for (let i = 0; i < 3; i++) {
		displaySlots[i].style.background = '#d3d3d3';
	}

	if (data.board) {
		renderBoard(data.board);
	}
});

socket.on('skipTurn', (data) => {
	let skippedSlot = globalToSlot(data.playerIndex);
	if (skippedSlot >= 0 && skippedSlot < 3) {
		console.log(player_names[data.playerIndex] + ' was skipped');
		displaySlots[skippedSlot].textContent = 'SKIP';
		displaySlots[skippedSlot].style.background = 'red';
		let slot = skippedSlot;
		let gIdx = data.playerIndex;
		setTimeout(() => {
			displaySlots[slot].textContent = player_names[gIdx];
			displaySlots[slot].style.background = '#d3d3d3';
		}, 2000);
	}
});

socket.on('gameOver', (data) => {
	canPlay = false;
	options = [];
	setHandClickable(false);

	let scores = [0, 0, 0];
	if (data.scores) {
		scores = data.scores;
	} else if (data.hands) {
		let handList = Object.values(data.hands);
		for (let i = 0; i < handList.length && i < 3; i++) {
			scores[i] = handScore(handList[i]);
		}
	} else {
		for (let i = 0; i < cur_hand.length && i < 3; i++) {
			scores[i] = handScore(cur_hand[i]);
		}
	}

	for (let i = 0; i < 3; i++) {
		all_scores[i].textContent = scores[i];
	}

	if (data.disconnected) {
		alert(data.playerName + ' disconnected. Game over!');
	} else {
		let winnerSlot = globalToSlot(data.winnerIndex);
		if (winnerSlot >= 0 && winnerSlot < 3) {
			displaySlots[winnerSlot].textContent = 'Winner!';
			displaySlots[winnerSlot].style.background = 'gold';
		}
		alert(data.winner + ' wins!');
	}
});

// ---- Game functions ----

// Render the board from server state
function renderBoard(board) {
	seven_played = board.sevenPlayed;
	upper = board.upper;
	lower = board.lower;

	// Order matches EJS template: Heart, Spade, Diamond, Club
	// Matches server Suit indices: HEART=0, SPADE=1, DIAMOND=2, CLUB=3
	const suitNames = ['Heart', 'Spade', 'Diamond', 'Club'];
	const suitLetters = ['H', 'S', 'D', 'C'];
	const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

	for (let s = 0; s < 4; s++) {
		let upDisplay = document.getElementById(suitNames[s] + 'DisplayUp');
		let downDisplay = document.getElementById(suitNames[s] + 'DisplayDown');
		let mainDisplay = document.getElementById(suitNames[s] + 'Display');

		upDisplay.innerHTML = '';
		downDisplay.innerHTML = '';
		mainDisplay.innerHTML = '';

		if (seven_played[s] === 1) {
			// Show 7 in main display
			let sevenImg = document.createElement('img');
			sevenImg.src = 'cardsJS/cards/7' + suitLetters[s] + '.svg';
			sevenImg.classList.add('card');
			mainDisplay.appendChild(sevenImg);

			let upperIdx = rankOrder.indexOf(upper[s]);
			let lowerIdx = rankOrder.indexOf(lower[s]);
			let sevenIdx = rankOrder.indexOf('7');

			// Up display: cards from upper down to 8 (highest at top)
			if (upperIdx > sevenIdx) {
				for (let i = upperIdx; i > sevenIdx; i--) {
					let r = rankOrder[i];
					let img = document.createElement('img');
					img.src = 'cardsJS/cards/' + r + suitLetters[s] + '.svg';
					img.classList.add('card');
					upDisplay.appendChild(img);
				}
			} else {
				let backImg = document.createElement('img');
				backImg.src = 'cardsJS/cards/BLUE_BACK.svg';
				backImg.classList.add('card');
				upDisplay.appendChild(backImg);
			}

			// Down display: cards from 6 down to lower (highest at top)
			if (lowerIdx <= sevenIdx - 1) {
				for (let i = sevenIdx - 1; i >= lowerIdx; i--) {
					let r = rankOrder[i];
					let img = document.createElement('img');
					img.src = 'cardsJS/cards/' + r + suitLetters[s] + '.svg';
					img.classList.add('card');
					downDisplay.appendChild(img);
				}
			} else {
				let backImg = document.createElement('img');
				backImg.src = 'cardsJS/cards/BLUE_BACK.svg';
				backImg.classList.add('card');
				downDisplay.appendChild(backImg);
			}
		} else {
			let backImg = document.createElement('img');
			backImg.src = 'cardsJS/cards/BLUE_BACK.svg';
			backImg.classList.add('card');
			mainDisplay.appendChild(backImg);
			let upBack = document.createElement('img');
			upBack.src = 'cardsJS/cards/BLUE_BACK.svg';
			upBack.classList.add('card');
			upDisplay.appendChild(upBack);
			let downBack = document.createElement('img');
			downBack.src = 'cardsJS/cards/BLUE_BACK.svg';
			downBack.classList.add('card');
			downDisplay.appendChild(downBack);
		}
	}
}

// Display player's hand - like single player, sets src and adds listeners
function display_hand(hand) {
	for (let i = 0; i < all_cards.length; i++) {
		if (i < hand.length) {
			all_cards[i].src = 'cardsJS/cards/' + hand[i] + '.svg';
			all_cards[i].style.display = '';
			// Remove old listener by cloning, then add new one
			let oldEl = all_cards[i];
			let newEl = oldEl.cloneNode(false);
			newEl.addEventListener('click', function () { process_click(newEl); });
			if (oldEl.parentNode) {
				oldEl.parentNode.replaceChild(newEl, oldEl);
			} else {
				player_hand.appendChild(newEl);
			}
			all_cards[i] = newEl;
		} else {
			all_cards[i].src = '';
			all_cards[i].style.display = 'none';
		}
	}
	// Re-apply clickable state
	setHandClickable(canPlay);
}

async function startGame() {
	startBtn.style.visibility = 'hidden';
	resetBtn.style.visibility = 'visible';
	document.getElementById('newStartButton').style.display = 'none';

	let statusEl = document.getElementById('startupStatus');
	if (!statusEl) {
		statusEl = document.createElement('p');
		statusEl.id = 'startupStatus';
		statusEl.textContent = 'Game starting...';
		document.getElementById('startupScreen').appendChild(statusEl);
	} else {
		statusEl.textContent = 'Game starting...';
		statusEl.style.display = 'block';
	}

	socket.emit('startGame');
}

async function resetGame() {
	socket.emit('resetGame');

	options = [];
	canPlay = false;
	setHandClickable(false);
	seven_played = [0, 0, 0, 0];
	upper = ['8', '8', '8', '8'];
	lower = ['6', '6', '6', '6'];
	cur_hand = [];
	myIndex = -1;

	resetBtn.style.visibility = 'hidden';
	startBtn.style.visibility = 'visible';
	document.getElementById('gameContainer').style.display = 'none';
	document.getElementById('startupScreen').style.display = 'block';

	let statusEl = document.getElementById('startupStatus');
	if (statusEl) statusEl.style.display = 'none';

	for (let i = 0; i < allDisplays.length; i++) {
		let images = allDisplays[i].getElementsByTagName('img');
		while (images.length > 0) {
			allDisplays[i].removeChild(images[0]);
		}
		let new_img = document.createElement('img');
		new_img.src = 'cardsJS/cards/BLUE_BACK.svg';
		new_img.classList.add('card');
		allDisplays[i].appendChild(new_img);
	}

	displaySlots[0].textContent = 'Player';
	displaySlots[1].textContent = 'Comp1';
	displaySlots[2].textContent = 'Comp2';
	for (let i = 0; i < 3; i++) {
		displaySlots[i].style.background = '#d3d3d3';
	}

	// Reset hand cards
	for (let i = 0; i < all_cards.length; i++) {
		all_cards[i].src = '';
		all_cards[i].style.display = 'none';
	}

	player_names = ['Player', 'Comp1', 'Comp2'];
}
