/* --- <VARIABLES> --- */

var pseudoTitle     = document.getElementById("pseudo-title");
var connectBtn      = document.getElementById("connect-btn");
var usernameInput   = document.getElementById("input-username");

var pseudoBox       = document.getElementById("pseudo-box");
var chatBox         = document.getElementById("chat-box");

var chatHeading     = document.getElementById("chat-heading");
var sendBtn         = document.getElementById("button-send");
var inputText       = document.getElementById("input-text");

var chatMessages     = document.getElementById("chat-messages");
var chatUsers        = document.getElementById("chat-users");

var btnClose         = document.getElementById("close-btn");

var token = 899103812;
var username = "Gael";

var usersSaved = [];

var lastUpdate = 0;

/* --- </VARIABLES> --- */

/* --- <FUNCTIONS> --- */

function ajax(data, type)
{
    var http = new XMLHttpRequest();

    http.open(type, data.url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {
        if ( http.readyState === 4 && http.status === 200 ) data.success(http.responseText);
        else if ( http.readyState === 4 && http.status !== 200 ) data.error(http.responseText);
    };

    http.send( ( data.params === undefined ) ? null : data.params);
}

function refresh() {

    ajax({
        url : "/chat/"+ username +"/" + token + "/" + lastUpdate,
        success : function(m){
            var json = JSON.parse(m);

            var users = json.users;
            var msgs = json.general;
            var prvt = json.user;

            var all = sortMessages(json);

            for ( var i = 0; i < users.length; i++ )
            {
                if ( ! usersSaved.includes(users[i]) )
                    addUser(users[i]);
            }

            for ( var i = 0; i < all.length; i++ )
            {
                var classes = '';
                var ms = getDate(all[i].when);

                if ( username === all[i].from ) classes = 'me-text';
                if ( all[i].from === null )
                {
                    classes = 'system-text';
                    ms += " - (Système)"
                }
                else
                    ms += " - " + all[i].from;

                ms += " : " + all[i].text;

                addMessage(ms, classes);

                lastUpdate = Date.now();
            }
        },
        error : function(m) {
            console.error(m);
        }
    }, "GET");
}

function addMessage(m, classes) {
    chatMessages.innerHTML += "<li class='" + classes + "' >" + m + "</li>"
}

function addUser(m) {
    var li = document.createElement("li");
    li.innerText = m;

    li.addEventListener("click", function () {
        var pseudo = inputText.value.split(" ")[0].replace("/to:", '');
        var msgD = inputText.value.replace("/to:" + pseudo, "");

        inputText.value = "/to:" + m + ((! msgD.match(/^\s*$/)) ? " " : '') + msgD;

        inputText.focus();
    });

    chatUsers.append(li);

    usersSaved.push(m);
}

function sortMessages(m) {
    return m.user.concat(m.general).sort(function(a, b){ return (a.when < b.when); });
}

function getDate(timestamp) {
    var d = new Date(parseInt(timestamp));
    return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

/* --- </FUNCTIONS> --- */


connectBtn.addEventListener("click", function(){
    if ( usernameInput.value !== '' && usernameInput.value !== null)
    {

        ajax({
            url: "/chat/" + usernameInput.value,
            params : 'a=b',
            success: function (m) {
                var json = JSON.parse(m);
                if (json.key !== undefined) {
                    token = json.key;
                    username = usernameInput.value;

                    pseudoBox.classList.add("hidden");
                    chatBox.classList.remove("hidden");
                    chatHeading.innerText = "Chat de Robocode - Utilisateur : " + username;
                }
            },
            error : function (m) {
                pseudoTitle.innerText = m;
            }
        }, "POST");
    }
    else
    {
        pseudoTitle.innerText = "Pseudo invalide";
    }
});

sendBtn.addEventListener("click", function(){
    var msg = inputText.value;

    if ( msg.includes("/to:") )
    {
        var pseudo = msg.split(" ")[0].replace("/to:", '');
        var msgD = msg.replace("/to:" + pseudo, "");

        ajax({
            url : "/chat/" + username + "/" + token.toString() + "/" + pseudo,
            params : "message=" + msgD,
            success : function(m){
                console.log(m);
                refresh();
                //var d = new Date();
                //addMessage(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " - " + username + " : " + "[MP à " + pseudo + "] " + msgD, 'me-text');
            },
            error : function(m) {
                console.error(m);
            }
        }, "PUT");
    }
    else
    {
        ajax({
            url : "/chat/" + username + "/" + token.toString() ,
            params : "message=" + msg,
            success : function(m){
                refresh();
                //addMessage(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " - " + username + " : " + msg, 'me-text');
            },
            error : function(m) {
                console.error(m);
            }
        }, "PUT");
    }

    inputText.value = "";

});

btnClose.addEventListener("click", function(){
    ajax({
        url : "/chat/" + username + "/" + token.toString() ,
        success : function(m){
            window.location.replace("/");
        },
        error : function(m) {
            console.error(m);
        }
    }, "DELETE");
});

document.onbeforeunload = function() {
    ajax({
        url : "/chat/" + username + "/" + token.toString() ,
        success : function(m){
            window.location.replace("/");
        },
        error : function(m) {
            console.error(m);
        }
    }, "DELETE");
};


refresh();

setInterval(function() {
    refresh();
}, 1000);