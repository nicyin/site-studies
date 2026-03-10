const firebaseConfig = {
    apiKey: "AIzaSyBDf6JKlwQp5z7q5yTKs2dWgudV7RhldPw",
    authDomain: "site-studies.firebaseapp.com",
    databaseURL: "https://site-studies-default-rtdb.firebaseio.com",
    projectId: "site-studies",
    storageBucket: "site-studies.firebasestorage.app",
    messagingSenderId: "46474461244",
    appId: "1:46474461244:web:3fec48b5d1ffded6e28339"
  };

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

const userId = Math.random().toString(36).substring(2);

const userStatusRef = database.ref('/presence/' + userId);
const totalOnlineRef = database.ref('.info/connected');

//online status
$(document).ready(() => {
    totalOnlineRef.on('value', (snapshot) => {
        if (snapshot.val()) {
            userStatusRef.onDisconnect().remove();
            userStatusRef.set(true);
        }
    });

let friends = 0;
let currentstate = 'alone';

const maxwidth = window.innerWidth - 60;
const maxheight = window.innerHeight - 60;

function randomspeed() {
    return Math.random() * 0.4 + 0.2;
}

function randomdirection() {
    return Math.random() < 0.5 ? 1 : -1;
}

function maketea() {
    const t = {
            cuppa: $('<div class="tea">🍵</div>').appendTo('body')[0],
            x: Math.random() * maxwidth,
            y: Math.random() * maxheight,
            dx: randomspeed() * randomdirection(),
            dy: randomspeed() * randomdirection(),
        };

        function move() {
            t.x += t.dx;
            t.y += t.dy;
            if (t.x <= 0 || t.x >= maxwidth) t.dx *= -1;
            if (t.y <= 0 || t.y >= maxheight) t.dy *= -1;
            t.cuppa.style.left = t.x + 'px';
            t.cuppa.style.top = t.y + 'px';
            requestAnimationFrame(move);
        }
        move();
}

function syncteas() {
    const diff = friends - $('.tea').length;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) maketea();
    } else if (diff < 0) {
        $('.tea').slice(diff).remove();
    }
}

//how many online
    database.ref('/presence').on('value', (snapshot) => {
        friends = snapshot.numChildren();
        $('#count').text(friends);
        
        // button visibility
        if (currentstate === 'hangout' && friends > 1) {
            syncteas();
        } else if (friends > 1) {
            currentstate = 'together';
            $('body').removeClass('state-alone').addClass('state-together');
            $('#alone').hide();
            $('#together').show();
            $('#together-msg').text(`${friends} friends are here!`);
            $('#enter').prop('disabled', false);
        } else {
            currentstate = 'alone';
            $('body').removeClass('state-together').addClass('state-alone');
            $('#alone').show();
            $('#together').hide();
            $('#hangout').hide();
            $('.tea').remove();
            $('#enter').prop('disabled', true);
        }
    });

    $(document).on('click', '#enter', function() {

        currentstate = 'hangout';

        $('body').removeClass('state-together');
        $('#together').hide();
        syncteas();
        $('#hangout').show();
    });
});
