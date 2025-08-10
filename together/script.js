// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyBDf6JKlwQp5z7q5yTKs2dWgudV7RhldPw",
    authDomain: "site-studies.firebaseapp.com",
    databaseURL: "https://site-studies-default-rtdb.firebaseio.com",
    projectId: "site-studies",
    storageBucket: "site-studies.firebasestorage.app",
    messagingSenderId: "46474461244",
    appId: "1:46474461244:web:3fec48b5d1ffded6e28339"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Generate a unique ID for this user
const userId = Math.random().toString(36).substring(2);

// Reference to the presence system
const userStatusRef = database.ref('/presence/' + userId);
const totalOnlineRef = database.ref('.info/connected');

// When the page loads
$(document).ready(() => {
    // Set up the presence system
    totalOnlineRef.on('value', (snapshot) => {
        // If we're connected to Firebase
        if (snapshot.val()) {
            // Remove the user when they disconnect
            userStatusRef.onDisconnect().remove();
            
            // Set the user as online
            userStatusRef.set(true);
        }
    });

    // Listen for changes in the number of online users
    database.ref('/presence').on('value', (snapshot) => {
        const numUsersOnline = snapshot.numChildren();
        $('#count').text(numUsersOnline);
        
        // Toggle visibility based on user count
        if (numUsersOnline > 1) {
            $('#alone').hide();
            $('#together').show();
            $('#enter').prop('disabled', false);  // Enable the button
        } else {
            $('#alone').show();
            $('#together').hide();
            $('#enter').prop('disabled', true);   // Disable the button
        }
    });

    $(document).on('click', '#enter', function() {
        console.log('enter clicked');
        
        $('#together').hide();
        $('#hangout').show();
    });
});
