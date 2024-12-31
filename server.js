const express = require('express');
const http = require('http');
const socketIo = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000
app.use(express.static(__dirname + '/assets'));
app.set('view engine', 'ejs')

let num_players = 0

app.get('/',function(req, res) {
	res.render('seven_of_hearts_mp');
	//res.sendFile(__dirname + '/assets/seven_of_hearts.html');
});

let gameState = {
    players: {},
    cards: [],
    // Other game state properties
};

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);
    num_players = num_players + 1
    // Add new player to the game state
    gameState.players[socket.id] = { /* player properties */ };
    // When a player enters their name 
    socket.on('setPlayerName', (name) => { 
        gameState.players[socket.id] = { 
        name: name, /* other player properties */ }; 
        console.log(`Player ${name} connected with ID ${socket.id}`); // Notify other players about the new player 
        io.emit('updateGameState', gameState); // Check if there are exactly three players i
        if (Object.keys(gameState.players).length === 3) { 
            io.emit('threePlayersJoined', gameState); } 
    });
    socket.on('threePlayersJoined', (gameState) => { 
        console.log('Three players have joined:', gameState); // Start the game or take other actions 
    });
    //io.emit('updateGameState', gameState);

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        delete gameState.players[socket.id];
        // Notify other players about the disconnection
        io.emit('updateGameState', gameState);
        num_players = num_players - 1
    });

    if(num_players == 3){
        console.log("Full Session (Three Players)")
    }

    socket.on('playCard', (card) => {
        // Handle card play
        // Update game state
        gameState.cards.push(card);
        // Broadcast the updated game state to all clients
        io.emit('updateGameState', gameState);
    });
});

server.listen(port, () => {
    console.log('Server is running on http://localhost:' + port);
});

