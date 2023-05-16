const express = require('express');
const path = require('path');
const socket = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'client')));

const messages = [];
const users = [];

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

server.listen(process.env.PORT || 8000, () => {
    console.log('Server is running on port: 8000');
});

const io = socket(server);

io.on('connection', (socket) => {
    console.log('New client! Its id – ' + socket.id);

    socket.on('join', (login) => {
        const user = { name: login, id: socket.id };
        users.push(user);
        console.log('New user joined:', user);

        const joinMessage = `${login} has joined the conversation!`;
        const botMessage = { author: 'Chat Bot', content: joinMessage };
        socket.broadcast.emit('message', botMessage);
    });

    socket.on('message', (message) => {
        console.log('Oh, I\'ve got something from ' + socket.id);
        messages.push(message);
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', () => {
        const index = users.findIndex(user => user.id === socket.id);
        if (index !== -1) {
            const removedUser = users.splice(index, 1)[0];
            console.log('User disconnected:', removedUser);
            const leaveMessage = `${removedUser.name} has left the conversation... :(`;
            const botMessage = { author: 'Chat Bot', content: leaveMessage };
            socket.broadcast.emit('message', botMessage);
        }
    });

    console.log('I\'ve added a listener on message event \n');
});
