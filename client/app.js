const loginForm = document.getElementById('welcome-form');
const messagesSection = document.getElementById('messages-section');
const messagesList = document.getElementById('messages-list');
const addMessageForm = document.getElementById('add-messages-form');
const userNameInput = document.getElementById('username');
const messageContentInput = document.getElementById('message-content');
const socket = io();
let userName;

socket.on('message', (event) => addMessage(event.author, event.content));
socket.on('join', (login) => {
    if (login !== userName) {
        const joinMessage = `${login} has joined the conversation!`;
        const botMessage = { author: 'Chat Bot', content: joinMessage };
        addMessage(botMessage.author, botMessage.content, true);
    }
});

function login(event) {
    event.preventDefault();

    const enteredUserName = userNameInput.value;

    if (enteredUserName.trim() === '') {
        alert('Please enter your name');
        return;
    }

    userName = enteredUserName;

    loginForm.classList.remove('show');
    messagesSection.classList.add('show');

    emitJoin(userName);
}

function addMessage(author, content, isSpecial = false) {
    const message = document.createElement('li');
    message.classList.add('message');
    if (isSpecial) {
        message.classList.add('message--special');
    } else {
        message.classList.add('message--received');
        if (author === userName) {
            message.classList.add('message--self');
        }
    }
    message.innerHTML = `
    <h3 class="message__author">${userName === author ? 'You' : author}</h3>
    <div class="message__content">
      ${content}
    </div>
  `;
    messagesList.appendChild(message);
}

function sendMessage(event) {
    event.preventDefault();

    const messageContent = messageContentInput.value.trim();

    if (messageContent === '') {
        alert('Please enter a message');
        return;
    }

    addMessage(userName, messageContent);
    socket.emit('message', { author: userName, content: messageContent });

    messageContentInput.value = '';
}
function emitJoin(login) {
    socket.emit('join', login);
}

loginForm.addEventListener('submit', login);

addMessageForm.addEventListener('submit', sendMessage);
