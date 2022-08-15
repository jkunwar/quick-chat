export default class LocalMessages {
    // class LocalMessages {


    constructor() {
        const request = window.indexedDB.open("messagesDB", 1)

        request.onsuccess = (event) => {
            // console.log('On Success: ', event);
            this.db = event.target.result;
        };

        request.onerror = (event) => {
            console.log('Open error: ', event.target.console.error.message);
        }

        request.onupgradeneeded = event => {
            const db = event.target.result;
            const objectStore = db.createObjectStore("messages", { keyPath: "id" });
            console.log("objectStore: ", objectStore);
        }

    }

    addMessage(user, message) {
        return new Promise((resolve, reject) => {

            const transaction = this.db.transaction(['messages'], "readwrite");
            const store = transaction.objectStore("messages");

            let request = store.add({
                id: Date.now(),
                message: message,
                username: user.username,
                email: user.email
            });
            request.onsuccess = event => {
                console.log('ADD MESSAGE SUCCESS')
                resolve(event)
            }

            request.onerror = event => {
                console.log('ADD MESSAGE ERROR: ', event.target.error.message)
                reject(event.target.error.message)
            }
        })

    }

    getAll() {
        console.log('dsndnkjk')
        return new Promise((resolve, reject) => {
            console.log('GETALL')
            const request = this.db.transaction(['messages'], "readwrite")
                .objectStore("messages")
                .getAll();

            request.onsuccess = event => {
                resolve(event.target.result)
            }

            request.onerror = event => {
                console.log('GET MESSAGE ERROR: ', event.target.error.message)
                reject(event.target.error.message)
            }
        })

    }

    delete(message) {
        return new Promise((resolve, reject) => {

            const request = this.db.transaction(['messages'], "readwrite")
                .objectStore("messages")
                .delete(message);

            request.onsuccess = event => {
                console.log('DELETE MESSAGE SUCCESS')
                resolve(event.target.result)
            }

            request.onerror = event => {
                console.log('DELETE MESSAGE ERROR: ', event.target.error.message)
                reject(event.target.error.message)
            }
        })
    }
}