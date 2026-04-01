const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/assets'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('seven_of_hearts_mp');
});

// Game constants
const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suitValues = ['H', 'S', 'C', 'D'];
const Suit = { HEART: 0, SPADE: 1, DIAMOND: 2, CLUB: 3 };

// Game state
let gameState = {
	players: {},
	gameStarted: false,
	gameOver: false,
};
let playerOrder = [];
let curPlayerIndex = -1;
let hands = {};
let sevenPlayed = [0, 0, 0, 0];
let upper = ['7', '7', '7', '7'];
let lower = ['7', '7', '7', '7'];
let deck = [];

// Helper functions
function getRank(card) {
	if (card[0] === '1') return '10';
	return card[0];
}

function getSuit(card) {
	return card.slice(-1);
}

function getSuitIndex(suit) {
	if (suit === 'H') return Suit.HEART;
	if (suit === 'S') return Suit.SPADE;
	if (suit === 'D') return Suit.DIAMOND;
	if (suit === 'C') return Suit.CLUB;
}

function getRankNumeric(rank) {
	if (rank === 'A') return 1;
	if (rank === 'J') return 11;
	if (rank === 'Q') return 12;
	if (rank === 'K') return 13;
	return parseInt(rank, 10);
}

function incrementRank(rank) {
	let n = getRankNumeric(rank);
	if (n >= 13) return null;
	n++;
	if (n === 1) return 'A';
	if (n === 11) return 'J';
	if (n === 12) return 'Q';
	if (n === 13) return 'K';
	return n.toString();
}

function decrementRank(rank) {
	let n = getRankNumeric(rank);
	if (n <= 1) return null;
	n--;
	if (n === 1) return 'A';
	if (n === 11) return 'J';
	if (n === 12) return 'Q';
	if (n === 13) return 'K';
	return n.toString();
}

function getOptions(hand) {
	let options = [];
	for (let i = 0; i < hand.length; i++) {
		let rank = getRank(hand[i]);
		let suit = getSuit(hand[i]);
		let suitIdx = getSuitIndex(suit);

		if (rank === '7') {
			options.push(hand[i]);
		} else if (sevenPlayed[suitIdx] === 1) {
			let aboveUpper = incrementRank(upper[suitIdx]);
			let belowLower = decrementRank(lower[suitIdx]);
			if ((aboveUpper && rank === aboveUpper) || (belowLower && rank === belowLower)) {
				options.push(hand[i]);
			}
		}
	}
	return options;
}

function isValidPlay(card, hand, options) {
	return hand.includes(card) && options.includes(card);
}

function playCardOnServer(card) {
	let rank = getRank(card);
	let suit = getSuit(card);
	let suitIdx = getSuitIndex(suit);

	if (rank === '7') {
		sevenPlayed[suitIdx] = 1;
		upper[suitIdx] = '7';
		lower[suitIdx] = '7';
	} else {
		let aboveUpper = incrementRank(upper[suitIdx]);
		let belowLower = decrementRank(lower[suitIdx]);
		if (aboveUpper && rank === aboveUpper) {
			upper[suitIdx] = rank;
		} else if (belowLower && rank === belowLower) {
			lower[suitIdx] = rank;
		}
	}
}

function getBoardState() {
	return { sevenPlayed: [...sevenPlayed], upper: [...upper], lower: [...lower] };
}

function advanceToNextTurn() {
	curPlayerIndex = (curPlayerIndex + 1) % 3;
	let nextId = playerOrder[curPlayerIndex];
	let nextOptions = getOptions(hands[nextId]);

	if (nextOptions.length === 0) {
		io.emit('skipTurn', { playerIndex: curPlayerIndex, playerName: gameState.players[nextId].name });
		advanceToNextTurn();
	} else {
		io.to(nextId).emit('yourTurn', {
			playerIndex: curPlayerIndex,
			options: nextOptions,
			playerName: gameState.players[nextId].name
		});
		io.emit('notYourTurn', { currentPlayerIndex: curPlayerIndex });
	}
}

function autoPlay7H() {
	for (let i = 0; i < 3; i++) {
		let pid = playerOrder[i];
		let idx = hands[pid].indexOf('7H');
		if (idx >= 0) {
			curPlayerIndex = i;
			hands[pid].splice(idx, 1);
			playCardOnServer('7H');
			io.emit('cardPlayed', {
				card: '7H',
				playerIndex: i,
				playerName: gameState.players[pid].name,
				handSize: hands[pid].length,
				board: getBoardState(),
				hands: { [pid]: [...hands[pid]] }
			});
			advanceToNextTurn();
			return;
		}
	}
}

// Socket.io handlers
io.on('connection', (socket) => {
	console.log('A user connected: ' + socket.id);

	socket.on('setPlayerName', (name) => {
		if (playerOrder.includes(socket.id)) return;
		if (Object.keys(gameState.players).length >= 3) return;

		gameState.players[socket.id] = { name: name };
		playerOrder.push(socket.id);

		console.log('Player ' + name + ' connected with ID ' + socket.id);
		io.emit('updateGameState', gameState);

		if (playerOrder.length === 3) {
			let allNamed = playerOrder.every(id => gameState.players[id] && gameState.players[id].name);
			if (allNamed) {
				io.emit('threePlayersJoined', gameState);
			}
		}
	});

	socket.on('startGame', () => {
		if (gameState.gameStarted) return;
		gameState.gameStarted = true;

		console.log('Game starting! Players:', playerOrder.map(id => gameState.players[id].name));

		// Reset game state
		sevenPlayed = [0, 0, 0, 0];
		upper = ['7', '7', '7', '7'];
		lower = ['7', '7', '7', '7'];

		// Build and shuffle deck
		deck = [];
		for (let i = 0; i < 4; i++) {
			cardValues.forEach(v => deck.push(v + suitValues[i]));
		}
		deck.sort(() => Math.random() - 0.5);

		// Deal cards, checking for 3 kings rule
		let needsRedeal = true;
		while (needsRedeal) {
			hands = {};
			playerOrder.forEach(id => hands[id] = []);
			let tempDeck = [...deck];
			let p = Math.floor(Math.random() * 3);
			while (tempDeck.length > 0) {
				hands[playerOrder[p]].push(tempDeck.pop());
				p = (p + 1) % 3;
			}
			needsRedeal = false;
			for (let i = 0; i < 3; i++) {
				let numKings = hands[playerOrder[i]].filter(c => getRank(c) === 'K').length;
				if (numKings >= 3) {
					console.log('Player ' + i + ' has 3 kings, redealing');
					needsRedeal = true;
					deck.sort(() => Math.random() - 0.5);
					break;
				}
			}
		}

		// Send each player their hand
		for (let i = 0; i < 3; i++) {
			let pid = playerOrder[i];
			io.to(pid).emit('dealHand', {
				hand: [...hands[pid]],
				playerOrder: [...playerOrder],
				playerNames: playerOrder.map(id => gameState.players[id].name),
				playerIndex: i
			});
		}

		// Auto-play 7 of hearts after a short delay
		setTimeout(() => {
			autoPlay7H();
		}, 2000);
	});

	socket.on('passTurn', () => {
		if (!gameState.gameStarted || gameState.gameOver) return;
		if (playerOrder[curPlayerIndex] !== socket.id) return;
		advanceToNextTurn();
	});

	socket.on('playCard', (card) => {
		if (!gameState.gameStarted || gameState.gameOver) return;
		if (playerOrder[curPlayerIndex] !== socket.id) {
			console.log('Not ' + gameState.players[socket.id].name + ' turn, ignoring playCard');
			return;
		}

		let hand = hands[socket.id];
		let options = getOptions(hand);

		console.log(gameState.players[socket.id].name + ' trying to play ' + card + ', hand: ' + hand.join(','));
		console.log('Valid options: ' + options.join(','));

		if (!isValidPlay(card, hand, options)) {
			console.log('Invalid play by ' + gameState.players[socket.id].name + ': ' + card);
			return;
		}

		hand.splice(hand.indexOf(card), 1);
		playCardOnServer(card);

		console.log(gameState.players[socket.id].name + ' played ' + card);

		io.emit('cardPlayed', {
			card: card,
			playerIndex: curPlayerIndex,
			playerName: gameState.players[socket.id].name,
			handSize: hand.length,
			board: getBoardState(),
			hands: { [socket.id]: [...hand] }
		});

		if (hand.length === 0) {
			gameState.gameOver = true;
			io.emit('gameOver', {
				winner: gameState.players[socket.id].name,
				winnerIndex: curPlayerIndex
			});
			return;
		}

		advanceToNextTurn();
	});

	socket.on('disconnect', () => {
		if (gameState.players[socket.id]) {
			let name = gameState.players[socket.id].name;
			console.log('Player disconnected: ' + name + ' (' + socket.id + ')');

			if (gameState.gameStarted && !gameState.gameOver) {
				gameState.gameOver = true;
				io.emit('gameOver', {
					disconnected: true,
					playerName: name
				});
			}

			delete gameState.players[socket.id];
			playerOrder = playerOrder.filter(id => id !== socket.id);
			io.emit('updateGameState', gameState);
		}
	});
});

server.listen(port, () => {
	console.log('Server is running on http://localhost:' + port);
});
