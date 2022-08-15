import FirebaseDB from "./firebase.js";
import ChatMessages from "./chatMessages.js";
import LocalMessages from "./storage.js";

//IndexDB
const indexDB = new LocalMessages()

// Firebase database
const firebaseDB = new FirebaseDB()

//Messages
let chatMessages = new ChatMessages(firebaseDB, indexDB)

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js', {
            scope: '/',
            type: 'module'
        })
        .then((res) => { })
        .catch(err => console.log(err));

    navigator.serviceWorker.ready
        .then((registration) => {

        })

} else {
    console.log('Service worker is not supported.')
}

firebaseDB.getAutenticatedUser().then(user => {
    //logged in

    //Hide login/Register screen
    toggleLoginRegisterContainer(false)

    //show chat screen
    toggleChatContainer(true)

    //get all messages
    firebaseDB.getMessages(user)

    //send message
    document.getElementById("message-form").addEventListener("click", () => {
        // get values to be submitted
        const messageInput = document.getElementById("message-input");
        const message = messageInput.value;

        if (!message) {
            messageInput.classList.add('invalid')
            return
        }
        // clear the input box
        messageInput.value = "";


        //auto scroll to bottom
        document.getElementById("messages")
            .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });


        chatMessages.addMessage(user, message)
    });

}).catch(err => {
    //not logged in
    //hide chat
    toggleChatContainer(false)

    //show login/register
    toggleLoginRegisterContainer(true)
})

function toggleChatContainer(isVisible) {
    const chatContainer = document.getElementById('chat')
    chatContainer.style.display = isVisible ? 'block' : 'none'
}

function toggleLoginRegisterContainer(isVisible) {
    const loginRegsiterContainer = document.getElementById('loginRegister')
    loginRegsiterContainer.style.display = isVisible ? 'block' : 'none'
    toggleLoginForm(true)
}

// Login
document.getElementById('login').addEventListener('click', login)
async function login() {
    //hide error message
    clearErrorMessages()

    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    try {
        const user = await firebaseDB.loginUser(email, password)
        console.log('Logged in user: ', user)

        toggleLoginRegisterContainer(false)
        toggleChatContainer(true)
        window.location.reload()

    } catch (error) {
        displayLoginError(error)
        console.log('Error: Error logging in user: ', error)
    }
}

function clearErrorMessages() {
    document.getElementById('login-error').innerText = ''
    document.getElementById('login-error').innerHTML = ''
}

function displayLoginError(error) {
    let errorMsg;
    switch (error.code) {
        case 'auth/invalid-email':
            errorMsg = 'Enter a valid email address'
            break
        case 'auth/user-not-found':
            errorMsg = 'Invalid email or password'
            break
        case 'auth/wrong-password':
            errorMsg = 'Invalid email or password'
            break
        default:
            errorMsg = 'Invalid email or password'

    }

    const loginError = document.getElementById('login-error');
    loginError.innerText = errorMsg
}


// Registration
document.getElementById('register').addEventListener('click', register)
async function register() {
    clearErrorMessages()
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    const username = document.getElementById('username').value
    try {
        const user = await firebaseDB.registerUser(username, email, password)
        console.log('Registerd user: ', user)

        toggleLoginRegisterContainer(false)
        toggleChatContainer(true)
        window.location.reload()
    } catch (error) {
        displayRegisterError(error)
        console.log('Error registering user: ', error)
    }
}

function displayRegisterError(error) {
    let errorMsg;
    console.log(error.code)
    switch (error.code) {
        case 'auth/invalid-email':
            errorMsg = 'Enter a valid email address'
            break
        case 'auth/email-already-in-use':
            errorMsg = 'The email address is already in use.'
            break
        default:
            errorMsg = 'Invalid email or password'

    }

    const registerError = document.getElementById('register-error');
    registerError.innerText = errorMsg
}

// Toggle between login and registration form
document.getElementById('loginLink').addEventListener('click', () => toggleLoginForm(true))
document.getElementById('registerLink').addEventListener('click', () => toggleLoginForm(false))
function toggleLoginForm(isLoggingIn) {
    clearErrorMessages()
    const loginForm = document.getElementById('login-form')
    const registerForm = document.getElementById('register-form')
    if (isLoggingIn) {
        registerForm.style.display = 'none'
        loginForm.style.display = 'block'
    } else {
        loginForm.style.display = 'none'
        registerForm.style.display = 'block'
    }
}


//listen to post message from serive worker and sync to remote database
navigator.serviceWorker.addEventListener('message', function (message) {

    if (message.data == 'sync-message') {
        chatMessages.dbOffline.getAll().then(res => {
            res.forEach(result => {
                chatMessages.dbOnline.addMessage({ email: result.email, username: result }, result.message).then(() => {
                    chatMessages.dbOffline.delete(result)
                })

            })
        }).catch(err => console.log(err))
    }

})