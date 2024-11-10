const cardValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
const suitValues = ['H', 'S', 'C', 'D']
const deck = [];

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

for (let i = 0; i < 3; i++ ){
	cur_hand.push([])
}
console.log(cur_hand)
const player1 = document.getElementById('player1');
const comp1 = document.getElementById('comp1');
const comp2 = document.getElementById('comp2');

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
		cur_num_cards[i] = cur_hand[i].length
		cur_scores[i] = get_score(cur_hand[i])
		if (i === 0){
			console.log("Setting comp1")
			player1.textContent = "Player: " + cur_num_cards[i] + " cards"
			//comp1.innerHTML += cur_num_cards[i] + " cards"
		}
		if (i === 1){
			console.log("Setting comp1")
			comp1.textContent = "Comp1: " + cur_num_cards[i] + " cards"
			//comp1.innerHTML += cur_num_cards[i] + " cards"
		}
		if (i === 2){
			//comp2.innerHTML += cur_num_cards[i] + " cards"
			comp2.textContent = "Comp2: " + cur_num_cards[i] + " cards"
		}
	}
	console.log(cur_hand)
	console.log(cur_num_cards)
	console.log(cur_scores)
	playerDisplay.textContent = cur_player;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function play_init_seven() {
	seven_index = cur_hand[cur_player].indexOf("7H")
	cur_hand[cur_player].splice(seven_index, 1);
	HeartDisplay.src = "cardsJS/cards/" + "7H" + ".svg"
	for (let i = 0; i < 3; i++){
		cur_num_cards[i] = cur_hand[i].length
		cur_scores[i] = get_score(cur_hand[i])
		if (i === 1){
			console.log("Setting comp1")
			comp1.textContent = "Comp1: " + cur_num_cards[i] + " cards"
			//comp1.innerHTML += cur_num_cards[i] + " cards"
		}
		if (i === 2){
			//comp2.innerHTML += cur_num_cards[i] + " cards"
			comp1.textContent = "Comp2: " + cur_num_cards[i] + " cards"
		}
	}
	console.log(cur_hand)
	console.log(cur_num_cards)
	console.log(cur_scores)
	cur_player = (cur_player + 1) % 3
}


function startGame() {
	init_cards()
	sleep(2000)
	//play_init_seven()
}






