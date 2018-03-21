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
    var movesRef = database.ref("/moves");
    var messagesRef = database.ref("/messages");

//============================== FUNCTIONS =======================================//
    var sendMessage = function(sender, message) {
        messagesRef.push({sender, message});
    }

    var localMessage = function(sender, message) {
        $("#messages-target").append(`<p class="message"><span class="sender">${sender}:</span> ${message}</p>`);
        //keep textbox scrolled to bottom to show newest message
        var scrollTarget = document.getElementById("messages-target");
        scrollTarget.scrollTop = scrollTarget.scrollHeight;
    }


//============================== LOCAL VARS =======================================//

    var playerRef; //will store the key for our firebase player entry
    var playerName = "";
    var playerNumber = 0; //0 is default, 1 or 2 will be assigned
    var playerMove = "";
    var opponentMove = "";
    var moves = [];
    var totalPlayers = 0;

    var wins = 0;
    var losses = 0;

    
    var $target = $("#target");
    $target.html(`
        <form class="center">
            User Name:
            <br><br>
            <input type="text" id="username" placeholder="Enter your username">
            <br><br>
            <button class="btn btn-primary" id="sign-in-btn">SIGN IN</button>  
        </form> 
    `);

//============================== LISTENERS =======================================//

    connectedRef.on("value", function(snap) {

        if (snap.val() === true) {
            // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
            var con = connectionsRef.push();
            
            // When I disconnect, remove this device
            con.onDisconnect().remove(function() {
                
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

    connectionsRef.on("value", function(snap) {
        
    });

    playersRef.on("value", function(snap) {
        var numPlayers = snap.numChildren();
        stateRef.set(numPlayers + " players");
    });

    //runs once for each existing child, then again for each added child
    playersRef.on("child_added", function (snap) {
        
        totalPlayers++;
        
    });
    //make player 2->player 1 when player 1 signs off, so player number can always be determined by the
    //number of children of the players Array
    playersRef.on("child_removed", function(snap) {

        totalPlayers--;
        playerNumber = totalPlayers;
        playerRef.set({playerName: playerName, playerNumber: totalPlayers, playerMove: playerMove});
        $("#player-number").html(`Player Number: ${playerNumber}`);
        //delete the recorded moves if a player leaves before they are evaluated
        movesRef.remove();
        moves = [];

        //delete record of messages on disconnect
        //remaining player will still have a record of messages in client
        //new player will only see messages starting from when they sign in
        messagesRef.remove();
        localMessage("","The other player left. Awaiting a new challenger...");

    });

    movesRef.on("child_added", function(snap) {
        //map moves into the array based on player number so our 
        //string check logic below works consistently
        moves[snap.val().playerNumber-1] = snap.val().playerMove;
        
        if(playerMove){
            localMessage("", "Waiting for opponent's move...");
        }

        
        if(moves.length === 2 && moves[0]){

            switch(moves.join(" ")){
                case "rock paper" : 
                    localMessage("", "RvP - Player Two Wins!");
                    if(playerNumber == 2) {
                        wins++;
                    } else {
                        losses++;
                    }
                    break;
                case "rock scissors" : 
                    localMessage("", "RvS - Player One Wins!");
                    if(playerNumber == 1) {
                        wins++;
                    }  else {
                        losses++;
                    }
                    break;
                case "paper rock" : 
                    localMessage("", "PvR - Player One Wins!");
                    if(playerNumber == 1) {
                        wins++;
                    }  else {
                        losses++
                    }
                    break;
                case "paper scissors" : 
                    localMessage("", "PvS - Player Two Wins!");
                    if(playerNumber == 2) {
                        wins++;
                    }  else {
                        losses++;
                    }
                    break;
                case "scissors rock" : 
                    localMessage("", "SvR - Player Two Wins");
                    if(playerNumber == 2) {
                        wins++;
                    }  else {
                        losses++;
                    }
                    break;
                case "scissors paper" : 
                    localMessage("", "SvP - Player One Wins!");
                    if(playerNumber == 1) {
                        wins++;
                    }  else {
                        losses++;
                    }
                    break;
                default : 
                    if(moves[0] === moves[1]){ 
                        localMessage("", "It's a tie!");
                    } else {
                        localMessage("", "Something went wrong...");
                    }
            }
            
                //delete moves locally and from database after winner is decided
                movesRef.remove();
                moves = [];
                playerMove = "";
                console.log(moves);
                $("#wins").text(`Wins: ${wins} `);
                $("#losses").text(` Losses: ${losses}`);
                setTimeout(function(){$("#send-move-btn").prop("disabled", false);}, 500);
      
            }
    });

    messagesRef.on("child_added", function(snap) {

        $("#messages-target").append(`<p class="message"><span class="sender">${snap.val().sender}:</span> ${snap.val().message}</p>`);
        //keep textbox scrolled to bottom to show newest message
        var scrollTarget = document.getElementById("messages-target");
        scrollTarget.scrollTop = scrollTarget.scrollHeight;

    });

    

    
    $("#sign-in-btn").on("click", function(evt) {

        //TO DO: Change behavior to limit players to 2, maybe add spectators to their own list

        evt.preventDefault();

        if(totalPlayers < 2){

            playerName = $("#username").val().trim();
            playerRef = playersRef.push();
            playerRef.onDisconnect().remove();
            playerRef.set({playerName: playerName, playerNumber: totalPlayers + 1});
            playerNumber = totalPlayers;//don't need the + 1 because the "value" listener runs on set
            

            $("#username").val("");
            $target.html(`
                <div>Logged in as: ${playerName} <br> </div>
                <br>
                <div id="player-number">Player Number: ${playerNumber} </div>
                <br>
                <div id="wins-losses"><span id="wins">Wins: ${wins} </span><span id="losses"> Losses: ${losses}</span></div>
                <label class="radio-inline"><input class="my-radio" type="radio" name="rock">Rock</label>
                <label class="radio-inline"><input class="my-radio" type="radio" name="paper">Paper</label>
                <label class="radio-inline"><input class="my-radio" type="radio" name="scissors">Scissors</label>
                <button class="btn btn-primary" id="send-move-btn">Shoot!</button>
                <br><br>
                <div id="messages-target"></div>
                <form>
                    <input type="text" id="message-input" placeholder="Type a message">
                    <br><br>
                    <button class="btn btn-primary" id="send-message-btn">Send</button>
                    <br>
                </form>
            `);
            sendMessage("", `${playerName} signed in`);
            if(totalPlayers === 2) {
                sendMessage("", "The room is full! Choose your moves!");
            }
        }

        else if(totalPlayers >= 2){
            alert("This room is full! Try again later.");
        }
    
    });

    $(document).on("click", "#send-message-btn", function(evt) {
        
        evt.preventDefault();

        var $messageInput = $("#message-input");

        var message = $messageInput.val();

        messagesRef.push({sender: playerName, message: message});

        $messageInput.val("");
        
    });

    $(document).on("click", "#send-move-btn", function(evt) {
        
        evt.preventDefault();

        $radios = $(".my-radio");
        $radios.each(function(){
            if($(this).prop("checked")){
                playerMove = $(this).attr("name");
                //uncheck the button after we send the move
                $(this).prop("checked", false);
            }
        });

        movesRef.push({playerNumber: playerNumber, playerMove: playerMove});

        $("#send-move-btn").prop("disabled", true);

    });


    //database will store game state, player names, player choices, and wins/losses, and chat logs
    //what is displayed on either client will be determined by game state
    //-----> log in player 1 || log in player 2 || player 1 choose || player 2 choose || show results -----v
    //                                             ^-------------------------------------------------------

});