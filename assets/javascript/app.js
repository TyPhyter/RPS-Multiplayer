$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAj3hBdCB5qiPCb-FmjF2TTgN7rgw4DXVo",
        authDomain: "rockpaperscissors-c7509.firebaseapp.com",
        databaseURL: "https://rockpaperscissors-c7509.firebaseio.com",
        projectId: "rockpaperscissors-c7509",
        storageBucket: "",
        messagingSenderId: "637982656787"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

//============================== SET REFS =======================================//

    var connectionsRef = database.ref("/connections");
    var playersRef = database.ref("/players");
    var spectatorsRef = database.ref("/spectators");
    var connectedRef = database.ref(".info/connected");
    var stateRef = database.ref("/state");

//============================== FUNCTIONS =======================================//


    var assignPlayer = function (name) {
        //send player name to database, return number based on number of current connections
        //set
        database.ref().set({

        });
    }

    var removePlayer = function (number) {
        //
    }

    var setPlayerChoice = function (number, choice) {
        //send player choice to database, use player number to avoid name conflicts (same name)
        //set
    };

    var sendMessage = function (number, message) {
        //send player chat message to database, use player number
        //push
    }

//============================== LOCAL VARS =======================================//

    var playerRef; //will store the key for our firebase player entry
    var playerName = "";
    var playerNumber = 0; //0 is default, 1 or 2 will be assigned
    var playerMove = "";
    var totalPlayers = 0;

    var wins = 0;
    var losses = 0;

    
    var $target = $("#target");
    $target.html(`
    <form class="center">
        User Name:<br>
        <input type="text" id="username" placeholder="Enter your username">
        <br><br>
        <button id="sign-in-btn">SIGN IN</button>  
    </form> 
    `);

//============================== LISTENERS =======================================//

    connectedRef.on("value", function (snap) {

        if (snap.val() === true) {
            // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
            var con = connectionsRef.push();
            
            // When I disconnect, remove this device
            con.onDisconnect().remove(function(){
                
            });

            // Add this device to my connections list
            con.set(true);

            // If we lose connection without closing window, auto-sign in on reconnect
            if(playerName !== ""){
                var player = playersRef.push();
                player.onDisconnect().remove();
                player.set(playerName);
            }

        }
    });

    connectionsRef.on("value", function (snap) {
        
    });

    playersRef.on("value", function(snap){
        var numPlayers = snap.numChildren();
        stateRef.set(numPlayers + " players");
    });

    //runs once for each existing child, then again for each added child
    playersRef.on("child_added", function (snap) {
        
        totalPlayers++;

    });

    playersRef.on("child_removed", function(snap) {

        totalPlayers--;
        playerRef.set({playerName: playerName, playerNumber: totalPlayers});
        $("#player-number").html(`Player Number: ${totalPlayers}`);

    });

    
    $("#sign-in-btn").on("click", function(evt){

        //TO DO: Change behavior to add spectators to their own list

        evt.preventDefault();

        playerName = $("#username").val().trim();
        playerRef = playersRef.push();
        playerRef.onDisconnect().remove();
        playerRef.set({playerName: playerName, playerNumber: totalPlayers+1});
        playerNumber = totalPlayers;//don't need the + 1 because the "value" listener runs on set
        console.log(playerName + " signed in");

        $("#username").val("");
        $target.html(`
            <div>Logged in as: ${playerName} <br> </div>
            <div id="player-number">Player Number: ${playerNumber} </div>
            <form>
                <input type="text" id="player-move" placeholder="Enter 'Rock', 'Paper', or 'Scissors'">
                <br><br>
                <button id="send-move-btn">SEND</button>
            </form>
        `);

    });

    $("#send-move-btn").on("click", function(evt){
         
        evt.preventDefault();

        playerMove = $("#player-move").val().trim();


    });


    //database will store game state, player names, player choices, and wins/losses, and chat logs
    //what is displayed on either client will be determined by game state
    //-----> log in player 1 || log in player 2 || player 1 choose || player 2 choose || show results -----v
    //                                             ^-------------------------------------------------------

});