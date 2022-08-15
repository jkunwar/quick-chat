export default class FirebaseDB {
    // class FirebaseDB {

    constructor() {


        const firebaseConfig = {
            apiKey: "AIzaSyB-F3xM_DPJYMFP15r2k_321jx6AJ78D8g",
            authDomain: "pwa-1070233.firebaseapp.com",
            databaseURL: "https://pwa-1070233-default-rtdb.firebaseio.com",
            projectId: "pwa-1070233",
            storageBucket: "pwa-1070233.appspot.com",
            messagingSenderId: "402904683754",
            appId: "1:402904683754:web:7843c2f3c1f8a7ad1eb393"
        };
        const app = firebase.initializeApp(firebaseConfig);
        this.db = firebase.database();
    }

    loginUser(email, password) {
        return new Promise((resolve, reject) => {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    //fetch username form user table
                    this.getUsernameByUid(userCredential.user.uid)
                        .then(res => resolve({ ...res, uid: userCredential.user.uid }))
                        .catch(err => reject(err))
                })
                .catch((error) => {
                    // console.log(error)
                    reject(error)
                })
        })
    }

    getUsernameByUid(uid) {
        return new Promise((resolve, reject) => {
            const userRef = this.db.ref('final-project/users');
            userRef.child(uid)
                .on('value', snapshot => {
                    if (snapshot.exists()) {
                        resolve(snapshot.val())
                    }
                    reject(null)
                })
        })
    }

    registerUser(username, email, password) {
        return new Promise((resolve, reject) => {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    //store username in users table
                    const userRef = this.db.ref('final-project/users');
                    userRef.child(userCredential.user.uid)
                        .update({
                            username: username, email: email
                        }, (err) => {
                            if (err) {
                                reject(err)
                            } else {
                                let user = {
                                    username,
                                    email,
                                    uid: userCredential.user.uid
                                }
                                resolve(user)
                            }
                        })
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }

    getAutenticatedUser() {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged((user, error) => {
                if (user) {
                    //logged in user
                    this.getUsernameByUid(user.uid)
                        .then(res => resolve(new User(user.uid, res.email, res.username)))
                        .catch(err => reject(err))
                } else {
                    //user logged out
                    console.log('not logged in')
                    reject()
                }
            })
        })
    }

    getMessages(user) {
        const messagesRef = this.db.ref(`final-project/messages`);
        let newItems = false

        //Load the messages from firebase once
        messagesRef.once("value", function (snapshot) {
            newItems = true
            const messages = snapshot.val();
            Object.values(messages).forEach(message => {
                const messageHTML = `<li class=${user.username === message.username ? "sent" : "receive"
                    }><span>${message.username}: </span>${message.message}</li>`;
                // append the message on the page
                document.getElementById("messages").innerHTML += messageHTML;
            })
        });

        //Listen to new messages added to the firebase database
        messagesRef.on('child_added', function (snapshot) {
            if (!newItems) { return }

            const messages = snapshot.val();
            const messageHTML = `<li class=${user.username === messages.username ? "sent" : "receive"
                }><span>${messages.username}: </span>${messages.message}</li>`;
            // append the message on the page
            document.getElementById("messages").innerHTML += messageHTML;

            if (user.email != messages.email) {
                const options = {
                    body: messages.message
                }
                navigator.serviceWorker.ready
                    .then((registration) => {
                        registration.showNotification("You have new message", options)
                    })
            }
        })
    }


    addMessage(user, message) {
        const timestamp = Date.now();
        // create db collection and send in the data
        this.db.ref(`final-project/messages/${timestamp}`).set({
            email: user.email,
            username: user.username,
            message: message,
        });
    }

}

class User {
    constructor(uid, email, username) {
        this.uid = uid
        this.email = email
        this.username = username
    }
}
