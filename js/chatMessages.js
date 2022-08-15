export default class ChatMessages {
    // class ChatMessages {

    constructor(firebaseDB, indexedDb) {
        this.dbOnline = firebaseDB
        this.dbOffline = indexedDb

        this.hasSync = false
        this.swController = null
        this.swRegistration = null

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready
                .then((registration) => {
                    if (registration.active && registration.sync) {
                        this.hasSync = true
                        this.swController = registration.active
                        this.swRegistration = registration
                    }
                })
        }

    }

    addMessage(user, message) {
        if (navigator.onLine) {
            return this.dbOnline.addMessage(user, message)
        }

        this.swRegistration.sync.register('add-message')
        return this.dbOffline.addMessage(user, message)
    }

}