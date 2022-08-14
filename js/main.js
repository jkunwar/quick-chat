import Firebase from "./firebase.js";

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', { scope: '/' })
        .then((res) => { console.log(res) })
        .catch(err => console.log(err));

    navigator.serviceWorker.ready
        .then((registration) => { console.log(registration) })

} else {
    console.log('Service worker is not supported.')
}

let groupName = 'iOS'
const firebaseDB = new Firebase()
firebaseDB.getAutenticatedUser().then(user => {
    //logged in

    //Hide login/Register screen
    toggleLoginRegisterContainer(false)

    //show chat screen
    toggleChatContainer(true)

    //get all messages
    firebaseDB.getMessages(user.username, groupName)

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

        //send message
        firebaseDB.sendMessage(user.username, message, groupName)
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
}

document.getElementById('login').addEventListener('click', login)
async function login() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    try {
        const user = await firebaseDB.loginUser(email, password)
        console.log('Logged in user: ', user)

        toggleLoginRegisterContainer(false)
        toggleChatContainer(true)

    } catch (error) {
        console.log('Error: Error logging in user: ', error)
    }
}

document.getElementById('register').addEventListener('click', register)
async function register() {

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const username = document.getElementById('username').value

    try {
        const user = await firebaseDB.registerUser(username, email, password)
        console.log('Registerd user: ', user)

        toggleLoginRegisterContainer(false)
        toggleChatContainer(true)

    } catch (error) {
        console.log('Error registering user: ', error)
    }
}