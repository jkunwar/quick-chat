// check for notificaiton permission when page loads
if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = Notification.permission
    switch (permission) {
        case 'granted':
            console.log('Notification permission granted by user')
            break
        case 'denied':
            console.log('Notification permission denied by user')
            break
        case 'default':
            break
    }

} else {
    sendNotification.style.display = 'none'
    alert("This browser does not support desktop notification")
}

// Request notification permission
requestNotificationPermission();
function requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
        if (permission == 'granted') {
            console.log('Notification permission granted')
        } else {
            console.log('Notification permission denied')
        }
    }).catch(error => console.log('ERROR: ', error))
}

// show message from service worker to the client
navigator.serviceWorker.addEventListener('message', function (message) {
    console.log(message)
});