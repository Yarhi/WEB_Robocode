/**
 *  Module pour réaliser un chat 
 *  -> enregistrement du fil de discussion (jusqu'à une certaine limite -- 100 lignes)
 *  -> consultation possible à partir d'un 
 *  -> messages privés vers un utilisateur
 */


/**
 *  Créer un utilisateur qui vient de se connecter
 *  Réponse : 0 OK, -1 nom invalide, -2 existe déjà
 */
exports.createUser = function(u) {
    var match = /^[a-zA-Z][a-zA-Z0-9_]*/g.exec(u);
    if (match == null || match[0] !== u) {
        console.log("--> [chat] Erreur : format incorrect.");
        return -1;   
    }
    if (users[u]) {
        console.log("--> [chat] Erreur : l'utilisateur existe déjà.");
        return -2;   
    }
    var k = Math.abs(Math.random() * 1000000000) | 0;    // clé aléatoire générée pour le nouvel utilisateur
    users[u] = { key: k, messages: [] };
    console.log("--> [chat] Succès : utilisateur " + u + " ajouté (clé : " + k + ")");
    addMessage(general, {from: null, text: u + " a rejoint le chat.", when: Date.now()});
    return k;
}


/**
 *  Supprimer un utilisateur qui quitte la page
 *  (ne pas oublier le page unload qui déclenchera cette fonction)
 *  Réponse : 0 OK, -1 accès refusé, -2 utilisateur n'existe pas
 */
exports.deleteUser = function(u, k) {
    if (users[u] && users[u].key == k) {
        delete users[u];
        console.log("--> [chat] Utilisateur " + u + " supprimé.");
        addMessage(general, {from: null, text: u + " a quitté le chat.", when: Date.now()});
        return 0;
    }
    console.log("--> [chat] Utilisateur inconnu ou clé incorrecte.");
    return -1;
}


/**
 *  Ajout d'un message pour le destinataire spécifié.
 *  - Si ce dernier n'existe pas, un message d'information en informe l'utilisateur courant.  
 *  - Si ce dernier n'est pas spécifié, le message est posté sur le chat général 
 *  Réponse : 0 OK, -1 accès refusé
 */
exports.postMessage = function(from, key, to, txt) {
    if (!users[from] || users[from].key != key) {
        console.log("--> [chat] Utilisateur inconnu ou clé incorrecte.");
        return -1;   
    }
    
    if (to) {
        if (users[to]) {
            addMessage(users[to].messages, {from: from, text: "[MP] " + txt, when: Date.now()});
            addMessage(users[from].messages, {from: from, text: "[MP à " + to + "] " + txt, when: Date.now()});
        }
        else {
            addMessage(users[from].messages, {from: null, text: "[MP non délivré à " + to + "] " + txt, when: Date.now()});
        }
    }
    else {
        addMessage(general, {from: from, text: txt, when: Date.now()});   
    }
    return 0;
}



/**
 *  Récupération des messages d'un utilisateur donné. 
 *  Réponse : null -> problème d'authentification de l'utilisateur
 *            objet -> { general: tableau des messages du chat général, 
                         user: tableau des messages personnels du l'utilisateur, 
                         users: tableau des utilisateurs actuellement connectés }
 */
exports.getMessages = function(u, k, since) {
    if (!users[u] || users[u].key != k) {
        console.log("--> [chat] Utilisateur inconnu ou clé incorrecte.");
        return null;   
    }
    // console.log("--> [chat] Récupération des messages depuis " + since.toLocaleString());
    return {    
        general:    getMessagesFromTabSince(general, since), 
        user:       users[u] ? getMessagesFromTabSince(users[u].messages, since) : [],
        users:      Object.keys(users)
    };
}




/*** FONCTIONS PRIVEES ***/

// taille maximale 
var MAX_SIZE = 100;

// tableau des messages
var general = [];

// pour chaque utilisateur -> tableau de messages reçus en privé
var users = {};

/**
 *  Ajout d'un message dans un tableau 
 *  @param  tab     tableau dans lequel sera ajouté le message
 *  @param  msg     le message en lui-même { from, text, when }    
 */
function addMessage(tab, msg) {
    while (tab.length >= MAX_SIZE) {
        tab.splice(0, 1);
    }
    tab.push(msg);
}

/** 
 *  Renvoie les messages d'un tableau, depuis une certaine date
 *  @param  tab     le tableau source 
 *  @param  since   la date de référence
 *  @return         [ { from, text, when }, ... ]
 */
function getMessagesFromTabSince(tab, since) {
    var newtab = [];
    for (var i=tab.length - 1; i >= 0; i--) {
        if (tab[i].when < since) {
            return newtab;
        }
        newtab.splice(0, 0, tab[i]);
    }
    return newtab;
}

