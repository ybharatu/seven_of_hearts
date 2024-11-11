const cardValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
const suitValues = ['H', 'S', 'C', 'D']
const deck = [];
const Suit = Object.freeze({ HEART: 0, DIAMOND: 2, CLUB: 1, SPADE: 3 });

//Using cardsJS from https://richardschneider.github.io/cardsJS/

// Create a deck of cards
for (let i = 0; i < 4; i++) {
    cardValues.forEach(value => deck.push(value + suitValues[i]));
}
console.log(deck)

deck.sort(() => Math.random() - 0.5); // Shuffle the deck
console.log(deck)
// let currentCard = deck.pop();
// console.log(currentCard)
// Variables
let score = 0;
let cur_scores = [0, 0, 0]
let cur_hand = []
let reached_three = [0,0,0]
let cur_win = []
let cur_num_cards = [0,0,0]
let cur_player = 0
let game_over = 0
let seven_played = [0,0,0,0]
let upper = ['8', '8', '8', '8']
let lower = ['6', '6', '6', '6']

for (let i = 0; i < 3; i++ ){
	cur_hand.push([])
}
console.log(cur_hand)
const player_hand = document.getElementById('player_hand');
console.log(player_hand)

const player1 = document.getElementById('player1');
const comp1 = document.getElementById('comp1');
const comp2 = document.getElementById('comp2');
const players = [player1, comp1, comp2]
const player_names = ["Player", "Comp1", "Comp2"]

const card1 = document.getElementById('c1');
const card2 = document.getElementById('c2');
const card3 = document.getElementById('c3');
const card4 = document.getElementById('c4');
const card5 = document.getElementById('c5');
const card6 = document.getElementById('c6');
const card7 = document.getElementById('c7');
const card8 = document.getElementById('c8');
const card9 = document.getElementById('c9');
const card10 = document.getElementById('c10');
const card11 = document.getElementById('c11');
const card12 = document.getElementById('c12');
const card13 = document.getElementById('c13');
const card14 = document.getElementById('c14');
const card15 = document.getElementById('c15');
const card16 = document.getElementById('c16');
const card17 = document.getElementById('c17');
const card18 = document.getElementById('c18');
const card19 = document.getElementById('c19');
const all_cards = [card1, card2, card3, card4, card5, card6, card7, card8, card9, card10, card11, card12, card13, card14, card15, card16, card17, card18, card19]

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

const scoreDisplay = document.getElementById('score');
const playerDisplay = document.getElementById('cur_player');
//const higherBtn = document.getElementById('higherBtn');
//const lowerBtn = document.getElementById('lowerBtn');

//cardDisplay.src = "cardsJS/cards/" + currentCard + ".svg";

// higherBtn.addEventListener('click', () => guess('higher'));
// lowerBtn.addEventListener('click', () => guess('lower'));
startBtn.addEventListener('click', () => startGame());

function guess(direction) {
    const nextCard = deck.pop();
    //cardDisplay.textContent = nextCard;
    cardDisplay.src = "cardsJS/cards/" + nextCard + ".svg";
    
    if ((direction === 'higher' && getValue(nextCard) > getValue(currentCard)) ||
        (direction === 'lower' && getValue(nextCard) < getValue(currentCard))) {
        score++;
    } else {
        alert('Game Over!');
        score = 0;
    }

    currentCard = nextCard;
    scoreDisplay.textContent = score;

    if (deck.length === 0) {
        alert('You went through the entire deck!');
        resetGame();
    }
}

function getValue(card) {
    if (card === 'J') return 11;
    if (card === 'Q') return 12;
    if (card === 'K') return 13;
    if (card === 'A') return 14;
    return card;
}

function resetGame() {
    deck.push(...cardValues.flatMap(value => [value, value, value, value]));
    deck.sort(() => Math.random() - 0.5);
    currentCard = deck.pop();
    cardDisplay.textContent = currentCard;
}

function get_score(hand){
	sum = 0
	for (let i = 0; i < hand.length; i++){
		cur_num = hand[i][0]
		// console.log(cur_num)
		// console.log(sum)
		if (cur_num === 'J') cur_num = 11;
		if (cur_num === 'Q') cur_num = 12;
		if (cur_num === 'K') cur_num = 13;
		if (cur_num === 'A') cur_num = 10;
		if (cur_num === '1') cur_num = 10;
		else cur_num = Number(cur_num)
		sum = sum + cur_num
	}
	return sum
}
function sortCards(cards) {
    const suitOrder = ['H', 'C', 'D', 'S']; // Clubs, Diamonds, Hearts, Spades
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    cards.sort((a, b) => {
        const suitA = a.slice(-1);
        const suitB = b.slice(-1);
        const rankA = a.slice(0, -1);
        const rankB = b.slice(0, -1);

        if (suitA !== suitB) {
            return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB);
        }

        return rankOrder.indexOf(rankA) - rankOrder.indexOf(rankB);
    });

    return cards;
}

function display_hand(hand){
	for (let i = 0; i < hand.length; i++){
		all_cards[i].src = "cardsJS/cards/" + hand[i] + ".svg";
	}
}

function init_cards(){
	player = Math.floor(Math.random()*3)
	cur_player = player
	//console.log(player)
	//console.log("distribute cards")
	dlen = deck.length
	for( let i = 0; i < dlen; i++){
		cur_hand[player].push(deck.pop())
		player = (player + 1) % 3
		//console.log(player)
	}
	for (let i = 0; i < 3; i++){
		//cur_hand[i].sort()
		cur_hand[i] = sortCards(cur_hand[i])

		cur_num_cards[i] = cur_hand[i].length
		cur_scores[i] = get_score(cur_hand[i])
		if (i === 0){
			player1.textContent = "Player: " + cur_num_cards[i] + " cards"
			display_hand(cur_hand[i])
			//comp1.innerHTML += cur_num_cards[i] + " cards"
		}
		else {
			players[i].textContent = player_names[i] + ": " + cur_num_cards[i] + " cards"
		}
	}
	console.log(cur_hand)
	console.log(cur_num_cards)
	console.log(cur_scores)
	
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function play_init_seven() {
	for (let i = 0; i < 3; i ++){
		seven_index = cur_hand[i].indexOf("7H")
		if (seven_index >= 0){
			cur_player = i
			playerDisplay.textContent = cur_player;
			players[cur_player].style.background = 'green'
			console.log(i + " has the 7H")
			break;
		}
	}
	await sleep(2000)
	
	seven_played[Suit.HEART] = 1
	cur_hand[cur_player].splice(seven_index, 1);
	HeartDisplay.src = "cardsJS/cards/" + "7H" + ".svg"
	for (let i = 0; i < 3; i++){
		cur_num_cards[i] = cur_hand[i].length
		cur_scores[i] = get_score(cur_hand[i])
		if (i === 0){
			player1.textContent = "Player: " + cur_num_cards[i] + " cards"
			display_hand(cur_hand[i])
			//comp1.innerHTML += cur_num_cards[i] + " cards"
		}
		else {
			players[i].textContent = player_names[i] + ": " + cur_num_cards[i] + " cards"
		}
	}
	console.log(cur_hand)
	console.log(cur_num_cards)
	console.log(cur_scores)
	//await sleep(5000)
	players[cur_player].style.background = '#d3d3d3'
	cur_player = (cur_player + 1) % 3
	playerDisplay.textContent = cur_player;
	players[cur_player].style.background = 'green'
}

function get_options(hand){
	options = []
	for(let i = 0; i < hand.length; i++){
		if (hand[i][0] === '7'){
			options.push(hand[i])
		}
		if (hand[i][hand.length - 1] === 'H' && seven_played[Suit.HEART] == 1){
			if (hand[i][0] == upper[Suit.HEART] || hand[i][0] == lower[Suit.HEART]) {
				options.push(hand[i])
			}
		}
		if (hand[i][hand.length - 1] === 'C' && seven_played[Suit.CLUB] == 1){
			if (hand[i][0] == upper[Suit.CLUB] || hand[i][0] == lower[Suit.CLUB]) {
				options.push(hand[i])
			}
		}
		if (hand[i][hand.length - 1] === 'D' && seven_played[Suit.DIAMOND] == 1){
			if (hand[i][0] == upper[Suit.DIAMOND] || hand[i][0] == lower[Suit.DIAMOND]) {
				options.push(hand[i])
			}
		}
		if (hand[i][hand.length - 1] === 'S' && seven_played[Suit.SPADE] == 1){
			if (hand[i][0] == upper[Suit.SPADE] || hand[i][0] == lower[Suit.SPADE]) {
				options.push(hand[i])
			}
		}
	}
	return options
}

function random_comp_choice(options){
	if (options.length == 0) {
		return -1
	}
	return options[Math.floor(Math.random()*options.length)]
}

function main_game () {
	while(game_over == 0){
		options = get_options(cur_hand[cur_player])
		console.log("Options: ")
		console.log(cur_player)
		console.log(cur_hand[cur_player])
		console.log(options)
		game_over = 1
		// if (cur_player == 0) {
		// 	options = get_options(cur_hand[cur_player])
		// 	console.log(options)
		// }
	}
}




async function startGame() {
	init_cards()
	await sleep(2000)
	play_init_seven()
	await sleep(2000)
	main_game()
}






