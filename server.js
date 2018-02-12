var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

var chat = require('./myChat');

/*  
 *  Structure de l'API du chat
 *  POST    /chat/:user                 -->     création de l'utilisateur :user
 *  DELETE  /chat/:user/:key            -->     suppression d'un utilisateur
 *  GET     /chat/:user/:key/:since     -->     récupération des messages pour l'utilisateur :user depuis :since 
 *  PUT     /chat/:user/:key            -->     post d'un message de l'utilisateur :user sur le forum général
 *  PUT     /chat/:user/:key/:to        -->     post d'un message privé de l'utilisateur :user pour l'utilisateur :to 
 */


/**
 *  Création d'un nouvel utilisateur 
 *  Réponses possibles : 
 *      utilisateur invalide        --> 403 + message 
 *      utilisateur déjà utilisé    --> 409 + message 
 *      utilisateur OK et ajouté    --> 200 + {user, key}
 */
app.post('/chat/:user', function(req, res) {
    var user = req.params.user;
    console.log("[server] Reçu POST /chat/" + user);
    var key = chat.createUser(user);
    switch (key) {
        case -1:    //  403 --> unauthorized
            res.status(403).end("Le nom d'utilisateur est invalide.");
            break;
        case -2:    //  409 --> conflict
            res.status(409).end("Le nom d'utilisateur existe déjà.");
            break;
        default:    //  200 --> OK 
            res.status(200).json({user: user, key: key});
    }
});
       

/**
 *  Suppression d'un utilisateur existant 
 *  Pas de réponse. Opération silencieuse. 
 */
app.delete('/chat/:user/:key', function(req, res) {
    var user = req.params.user;  
    var key = req.params.key;
    console.log("[server] Reçu DELETE /chat/" + user + "/" + key);
    chat.deleteUser(user, key);
    res.status(200).end();
});
    

/**
 *  Récupération d'un message (voir fichier myChat.js pour le format des messages)
 *  Réponses : 
 *      utilisateur incorrect   --> 401 + message
 *      succès                  --> 200 + objet { general: [...], user: [...], users: [...] }
 */
app.get('/chat/:user/:key/:since', function(req, res) {
    var user = req.params.user;  
    var key = req.params.key;
    var since = req.params.since;
    // console.log("Reçu demande de " + user + "(key : " + key + ") depuis " + since); 
    var mess = chat.getMessages(user, key, since);
    if (mess == null) {
        res.status(401).end("Utilisateur incorrect");
    }
    else {
        res.status(200).json(mess);
    }
});


/** 
 *  Envoi d'un message à destination d'un utilisateur
 *  Réponses :
 *      utilisateur incorrect   --> 401 + message
 *      succès                  --> 200
 */
app.put('/chat/:from/:key/:to', function(req, res) {
    var from = req.params.from;  
    var key = req.params.key;
    var to = req.params.to;
    var mess = req.body.message;
    console.log("Reçu message de " + from + "(key : " + key + ") pour " + to + " : " + mess);
    var r = chat.postMessage(from, key, to, mess); 
    if (r == 0) {
        res.status(200).end();
    }
    else {
        res.status(401).end("Utilisateur incorrect");
    }
});



/** 
 *  Envoi d'un message à destination de tous
 *  Réponses :
 *      utilisateur incorrect   --> 401 + message
 *      succès                  --> 200
 */
app.put('/chat/:from/:key', function(req, res) {
    var from = req.params.from;  
    var key = req.params.key;
    var mess = req.body.message;
    console.log("Reçu message de " + from + "(key : " + key + ") : " + mess);
    var r = chat.postMessage(from, key, null, mess); 
    if (r == 0) {
        res.status(200).end();
    }
    else {
        res.status(401).end("Utilisateur incorrect");
    }
});




// redirection automatique vers le répertoire "public" pour les autres requêtes 
app.use(express.static('public'));

// démarrage du serveur sur le port 8080
app.listen(8080);

console.log("C'est parti ! En attente de connexion...");