/**
 *  Utilisateur courant, objet { user: pseudo, key: cle }
 */
currentUser = null;

/**
 *  Connexion de l'utilisateur au chat.
 */
function connect() {
    // recupération du pseudo
    var user = document.getElementById("pseudo").value.trim();
    if (! user) return;
    var xhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                currentUser = JSON.parse(this.responseText);
                sessionStorage.setItem("chat:credentials", this.responseText);
                document.getElementById("login").innerHTML = currentUser.user;
                swapView();
                lastUpdate = Date.now();
                retrieveMessages();
            }
            else {
                alert(this.responseText);
            }
        }
    }
    xhttp.open("POST", "/chat/" + user, true);
    xhttp.send();
}

var xhrMsg = null;
var lastUpdate = Date.now();
function retrieveMessages() {
    if (! xhrMsg) {
        xhrMsg = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhrMsg.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    afficherMessages(JSON.parse(this.responseText));
                }
                else {
                    alert(this.responseText);
                    clearTimeout(TO);
                }
            }
        }
    }
    xhrMsg.open("GET", "/chat/" + currentUser.user + "/" + currentUser.key + "/" + lastUpdate, true);
    xhrMsg.send();
    setTimeout(retrieveMessages, 1000);
}

/**
 *  Affichage des messages récupérés depuis le serveur sous le format :
 *  { general: [...], user: [...], users: [...] }
 */
function afficherMessages(data) {

    // fusion et ordonnancement des nouveaux messages
    var allmessages = data.general.concat(data.user).sort(function(v1, v2) { return v1.when < v2.when; });
    lastUpdate = (allmessages.length > 0) ? allmessages[allmessages.length-1].when*1+1 : lastUpdate;

    // traitement des emojis
    function traiterEmoticones(txt) {
        txt = txt.replace(/:[-]?\)/g,'<span class="emoji sourire"></span>');
        txt = txt.replace(/:[-]?D/g,'<span class="emoji banane"></span>');
        txt = txt.replace(/:[-]?[oO]/g,'<span class="emoji grrr"></span>');
        txt = txt.replace(/<3/g,'<span class="emoji love"></span>');
        txt = txt.replace(/:[-]?[Ss]/g,'<span class="emoji malade"></span>');
        return txt;
    }

    // affichage des nouveaux messages
    var bcMessages = document.querySelector("#content main");
    allmessages.forEach(function(elem) {
        var classe = "";
        if (elem.from == currentUser.user) {
            classe = "moi";
        }
        else if (elem.from == null) {
            classe = "system";
        }
        else if (elem.to != null) {
            classe = "mp";
        }
        var date = new Date(elem.when);
        date = date.toISOString().substr(11,8);
        if (elem.from == null) {
            elem.from = "(Système)";
        }

        elem.text = traiterEmoticones(elem.text);

        bcMessages.innerHTML += "<p class='" + classe + "'>" + date + " - " + elem.from + " : " + elem.text + "</p>";
    });

    // affichage de la liste d'utilisateurs
    var bcUsers = document.querySelector("#content aside").innerHTML = data.users.join("<br>");
}


/**
 *  Envoyer un message
 */
function envoyer() {
    var msg = document.getElementById("monMessage").value.trim();
    if (!msg) return;
    var xhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

    var to = null;

    if (msg.startsWith("/to:")) {
        var i = msg.indexOf(" ");
        to = msg.substring(4, i);
        msg = msg.substring(i);
    }

    var url = "/chat/" + currentUser.user + "/" + currentUser.key;
    if (to) {
        url += "/" + to;
    }
    xhttp.open("PUT", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("message=" + msg);
    document.getElementById("monMessage").value = "";
    document.getElementById("monMessage").focus();
}



/**
 *  Démarrage : si l'utilisateur est déjà connecté (variable dans le sessionStorage),
 *  sa reconnexion est automatique.
 */
document.addEventListener("DOMContentLoaded", function(e) {
    currentUser = sessionStorage.getItem("chat:credentials");
    if (currentUser != null) {
        currentUser = JSON.parse(currentUser);
        document.getElementById("login").innerHTML = currentUser.user;
        swapView();
        retrieveMessages();
    }
});


/** Changer la vue entre la fenêtre de connexion et le chat */
function swapView() {
    document.getElementById("logScreen").classList.toggle("visible");
    document.getElementById("content").classList.toggle("visible");
}


/**
 *  Quitter le chat et revenir à la page d'accueil.
 */
function quitter() {
    if (currentUser) {
        var xhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhttp.open("DELETE", "/chat/" + currentUser.user + "/" + currentUser.key, true);
        xhttp.onreadystatechange = function() {
            if (this.readyState >= 1) {
                sessionStorage.removeItem("chat:credentials");
                document.location.assign("../index.html");
            }
        }
        xhttp.send();
    }
    else
        document.location.assign("../index.html");
};