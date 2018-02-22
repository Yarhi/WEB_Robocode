var gameContainer   = document.getElementById("game-table-container");
var headerText      = document.getElementById("header-text");

var redControls     = document.getElementById("red-sidebar");
var blueControls    = document.getElementById("blue-sidebar");

var controlSection  = document.getElementById("controls-section");

// The action which are related to classes
var controlsToActions = [
    { action : "north",     class : "north" },
    { action : "south",     class : "south" },
    { action : "east",      class : "east" },
    { action : "west",      class : "west" },
    { action : "gox2",      class : null },
    { action : "take",      class : "take" },
    { action : "put",       class : "put" },
    { action : "push",      class : "push" },
    { action : "cancel",    class : "cancel" },
    { action : "x2",        class : "x2" },
    { action : "pause",     class : "pause" },
];

// Sentences related to actions
var sentences = {
    chooseActions : function (playerName) {
        headerText.innerText = "Le joueur " + playerName + " choisit ses actions";
    },
    currentTour : function () {
        headerText.innerText = "Tour de jeu en cours";
    }
};


// Drag and drop variables
var dragTarget      = null;
var draggedElement  = null;

class ControlBlock {
    constructor(dom, action, playerName) {
        this.dom = dom;
        this.action = action;
        this.playerName = playerName;
    }

    clear() {
        var classList = Array.from(this.dom.classList);

        this.action = null;

        // Removing the class of the "action"
        for ( var i = 0; i < controlsToActions.length; i++ )
        {
            if ( classList.includes( this.playerName + "-" + controlsToActions[i].class ) )
                classList = classList.removeFromArray(this.playerName + "-" + controlsToActions[i].class);
        }

        // Exceptions red special && blue special
        if ( classList.includes("blue-westx2") ) classList = classList.removeFromArray("blue-westx2");
        if ( classList.includes("red-eastx2") ) classList = classList.removeFromArray("red-eastx2");

        // Setting new class
        this.dom.classList = classList.join(' ');
    }

    animate(clear) {
        // Animate the block
        this.dom.classList.add("animate");
        setTimeout( () => this.dom.classList.remove("animate"), 500);

        // if clear is defined and is true, then it clear the cell just after the animation
        if ( clear !== undefined && clear === true )
            setTimeout( () => this.clear(), 500);
    }
}

class Player {
    constructor(name, logo, robot) {
        this.name = name;
        this.logo = logo;
        this.robot = robot;

        this.hasFlag = false;

        this.dom = null;

        this.controlBlock = [];

        this.actions = [
            null,
            null,
            null,
            null,
            null
        ];

        this.actionIndex = 0;
        this.executingAction = false;
    }

    actionsValidated()
    {
        for ( var i = 0; i < 5; i++ )
            if ( this.actions[i] === null ) return false;

        return true;
    }

    actionsDone()
    {
        for ( var i = 0; i < 5; i++ )
            if ( this.actions[i] !== null ) return false;

        this.actionIndex = 0;

        return true;
    }

    executeActions()
    {
        var actionInstance = new Action(this);

        // Getting the method
        var actionMethod = this.actions[this.actionIndex];

        // Execute if the method isn't null
        if ( actionMethod !== null )
        {
            var res = actionInstance[actionMethod]();

            // Impossible action
            if ( res === false && actionMethod !== "push")
            {
                // Creating emoji and adding animation
                var emojiDom = document.createElement("span");
                emojiDom.innerText = '!';
                emojiDom.classList.add("emoji");

                game.cells[this.robot.y][this.robot.x].dom.appendChild(emojiDom);

                this.robot.dom.classList.add("bloqued");

                var spanIndex = 0;
                game.cells[this.robot.y][this.robot.x].dom.childNodes.forEach((e, index) => {
                    if ( e.classList.contains("emoji") ) spanIndex = index;
                });

                console.log(spanIndex);


                // Deleting after 1s (end of animation)
                setTimeout(() => this.robot.dom.classList.remove("bloqued"), 1000);
                setTimeout(() => game.cells[this.robot.y][this.robot.x].dom.removeChild(game.cells[this.robot.y][this.robot.x].dom.childNodes[spanIndex]), 1000);
            }
        }


        // Saving last action
        this.robot.lastAction = this.actions[this.actionIndex];

        // Reseting action and controlBlock's action to null
        this.actions[this.actionIndex] = null;

        // Animating the controlBlock
        this.controlBlock[this.actionIndex].animate(true);

        // Going to the next action
        this.actionIndex++;

        // Setting executingAction to true and then to false when it's finished
        this.executingAction = true;
        setTimeout( () => this.executingAction = false, 1500);
    }

    setAction(index, action)
    {
        var actionExist = this.hasAction(action);
        if ( actionExist !== -1 )
        {
            this.actions[actionExist] = null;
            this.controlBlock[actionExist].clear();
        }

        this.actions[index] = action;
        this.controlBlock[index].action = action;
        this.controlBlock[index].animate();
    }

    hasAction(action)
    {
        var ret = -1;
        this.actions.forEach((e, index) => {if ( e === action ) ret = index});
        return ret;
    }

}
class Robot {

    constructor(name) {
        this.name = name;

        this.x = 0;
        this.y = 0;

        this.dom = null;

        this.orientationClass = "east";
        this.lastAction = null;
    }

    setPos(x, y, animate) {
        if (this.dom != null)
        {
            var animateClass = "animate-" + this.orientationClass;

            // Verify if it's eastx2 or westx2
            if ( x === this.x - 2 || x === this.x + 2 )
                animateClass += "x2";

            this.dom.classList.add(animateClass);
        }


        var robotInstance = this;
        var delay = (animate === undefined) ? 1000 : 0 ;
        if ( ! isNaN(parseInt(animate)) )
            delay = parseInt(animate);

        setTimeout(function () {
            // Clearing old robot
            game.clearCell(robotInstance.x, robotInstance.y);

            // Robot div element
            var robotDom = document.createElement("div");
            robotDom.classList.add("robot");
            robotDom.classList.add("robot-" + robotInstance.name);
            robotDom.classList.add(robotInstance.orientationClass);


            var objName = "robot" + (robotInstance.name.toString()[0].toUpperCase()) + (robotInstance.name.substring(1));

            // For the first placement
            if (x !== undefined && y !== undefined) {
                game.cells[y][x].dom.appendChild(robotDom);
                game.cells[y][x][objName] = robotDom;

                robotInstance.x = x;
                robotInstance.y = y;
            }

            robotInstance.dom = robotDom;

            // Creating new robot
            game.cells[robotInstance.y][robotInstance.x].dom.appendChild(robotDom);
            game.cells[robotInstance.y][robotInstance.x][objName] = robotDom;

            game.cells[robotInstance.y][robotInstance.x].gotRobot = robotInstance.name;
        }, delay);
    }

    setOrientation(side) {
        // Removing current dom orientation
        this.dom.classList.remove(this.orientationClass);

        // Setting new orientation
        this.orientationClass = side;

        // Adding new dom orientation
        this.dom.classList.add(this.orientationClass);
    }

}


class Action {
    constructor(player) { this.player = player; }

    static allowedPosition(x, y) {
        return ( x >= 0 && x <= 8 && y >= 0 && y <=8 && game.cells[y][x].gotRobot === null);
    }

    north(verify)     {
        if ( ! Action.allowedPosition(this.player.robot.x, this.player.robot.y-1) )
        {
            // Setting orientation for 'bloqued' animation
            var renemberOrientation = this.player.robot.orientationClass;
            this.player.robot.setOrientation("north");

            // After the animation, resetting the old one
            setTimeout(() => this.player.robot.setOrientation(renemberOrientation), 1000);

            return false;
        }

        if ( verify === undefined ) {
            this.player.robot.setOrientation("north");
            this.player.robot.setPos(this.player.robot.x, this.player.robot.y-1);
        }

        return true;
    }
    south(verify)     {
        if ( ! Action.allowedPosition(this.player.robot.x, this.player.robot.y+1) )
        {
            // Setting orientation for 'bloqued' animation
            var renemberOrientation = this.player.robot.orientationClass;
            this.player.robot.setOrientation("south");

            // After the animation, resetting the old one
            setTimeout(() => this.player.robot.setOrientation(renemberOrientation), 1000);

            return false;
        }

        if ( verify === undefined ) {
            this.player.robot.setOrientation("south");
            this.player.robot.setPos(this.player.robot.x, this.player.robot.y+1);
        }

        return true;
    }
    east(verify)      {
        if ( ! Action.allowedPosition(this.player.robot.x+1, this.player.robot.y) )
        {
            // Setting orientation for 'bloqued' animation
            var renemberOrientation = this.player.robot.orientationClass;
            this.player.robot.setOrientation("east");

            // After the animation, resetting the old one
            setTimeout(() => this.player.robot.setOrientation(renemberOrientation), 1000);

            return false;
        }

        if ( verify === undefined ) {
            this.player.robot.setOrientation("east");
            this.player.robot.setPos(this.player.robot.x+1, this.player.robot.y);
        }

        return true;
    }
    west(verify)      {
        if ( ! Action.allowedPosition(this.player.robot.x-1, this.player.robot.y) )
        {
            // Setting orientation for 'bloqued' animation
            var renemberOrientation = this.player.robot.orientationClass;
            this.player.robot.setOrientation("west");

            // After the animation, resetting the old one
            setTimeout(() => this.player.robot.setOrientation(renemberOrientation), 1000);

            return false;
        }

        if ( verify === undefined ) {
            this.player.robot.setOrientation("west");
            this.player.robot.setPos(this.player.robot.x-1, this.player.robot.y);
        }

        return true;
    }
    //forward()   { }
    gox2(verify)      {
        var goEast = ( this.player.robot.name === 'red' );

        if ( goEast )
        {
            if ( ! Action.allowedPosition(this.player.robot.x+2, this.player.robot.y) )
            {
                // Setting orientation for 'bloqued' animation
                var renemberOrientation = this.player.robot.orientationClass;
                this.player.robot.setOrientation("east");

                // After the animation, resetting the old one
                setTimeout(() => this.player.robot.setOrientation(renemberOrientation), 1000);

                return false;
            }

            if ( verify === undefined ) {
                this.player.robot.setOrientation("east");
                this.player.robot.setPos(this.player.robot.x+2, this.player.robot.y);
            }
        }
        else
        {
            if ( ! Action.allowedPosition(this.player.robot.x-2, this.player.robot.y) )
            {
                // Setting orientation for 'bloqued' animation
                var renemberOrientation = this.player.robot.orientationClass;
                this.player.robot.setOrientation("west");

                // After the animation, resetting the old one
                setTimeout(() => this.player.robot.setOrientation(renemberOrientation), 1000);

                return false;
            }

            if ( verify === undefined ) {
                this.player.robot.setOrientation("west");
                this.player.robot.setPos(this.player.robot.x-2, this.player.robot.y);
            }
        }

        return true;
    }

    take(verify)      {

    }

    put(verify)       {

    }

    push(verify)      {
        if ( this.player.name === 'red' )
        {
            var rob = game.players.blue.robot;

            if ( ! Action.allowedPosition( rob.x + 1, rob.y )  )
                return false;

            if ( verify === undefined )
            {
                rob.setOrientation("east");
                rob.setPos(rob.x + 1, rob.y);
            }
        }
        else
        {
            var rob = game.players.red.robot;

            if ( ! Action.allowedPosition( rob.x - 1, rob.y )  )
                return false;

            if ( verify === undefined )
            {
                rob.setOrientation("west");                
                rob.setPos(rob.x - 1, rob.y);
            }
        }

        return true;
    }

    cancel(verify)    {
        var p;

        if ( this.player.name === 'red' )
            p = game.players.blue;
        else
            p = game.players.red;

        p.actions[p.actionIndex] = null;
    }

    x2(verify)        {
        var ActionInstance = new Action(this.player);

        if ( verify === undefined )
            ActionInstance[this.player.robot.lastAction]();
        else
            return ActionInstance[this.player.robot.lastAction](verify);
    }

    pause(verify)     {
        return true;
    }
}

class Cell {
    constructor(htmlDivElement, x, y) {
        this.dom        = htmlDivElement;
        this.x          = x;
        this.y          = y;

        this.gotFlag    = null;
        this.gotRobot   = null;
    }
}

class Game {
    constructor() {
        /*
         * Init Robots
         */
        this.robots  = {
            red : new Robot("red"),
            blue: new Robot("blue")
        };

        /*
         * Init Players
         */
        this.players = {
            red : new Player("red", null, this.robots.red),
            blue: new Player("blue", null, this.robots.blue)
        };

        this.cells = [];
        this.redBase = [];
        this.blueBase = [];

        this.currentPlayer = this.players.red;
    }

    initGrid() {
        for ( var i = 0; i < 9; i++ )
        {
            var tmp = [];
            for ( var j = 0; j < 9; j++ )
            {
                var cell = new Cell(document.createElement("div"), j, i);
                cell.dom.classList.add("cell");

                gameContainer.appendChild(cell.dom);
                tmp.push(cell);
            }
            this.cells.push(tmp);
        }
        // TOP            // CENTER         // BOTTOM         // RIGHT / LEFT
        this.redBase    = [ this.cells[3][0], this.cells[4][0], this.cells[5][0], this.cells[4][1] ];
        this.blueBase   = [ this.cells[3][8], this.cells[4][8], this.cells[5][8], this.cells[4][7] ];
        /*
         * Red base
         */
        this.redBase.forEach(function (c) {
            c.basePlayer = game.players.red;
            c.dom.classList.add("red");
        });

        /*
         * Blue base
         */
        this.blueBase.forEach(function (c) {
            c.basePlayer = game.players.blue;
            c.dom.classList.add("blue");
        });

    }

    initBlocks()
    {
        if ( game.players.blue.controlBlock.length !== 0 && game.players.red.controlBlock.length)
        {
            game.players.blue.controlBlock.forEach((e) => e.clear());
            game.players.red.controlBlock.forEach((e) => e.clear());
            return;
        }

        /* Red controlBlock && Blue controlBlock */
        for ( var i = 1; i < 11; i++ )
        {
            // Getting the player ( red < 6; blue >= 6)
            var player = ( i < 6 ) ? this.players.red : this.players.blue;
            // Getting the player's control dom ( red < 6; blue >= 6)
            var ctrl   = ( i < 6 ) ? redControls : blueControls;

            var index = (( i < 6 ) ? i : i - 5 ) - 1;


            // Creating the tile
            var tile = document.createElement("div");
            tile.classList.add("block");
            tile.classList.add("block-" + player.name );
            // Setting the related player to the Tile
            tile.setAttribute("related-player", player.name);
            // Setting the action number to the Tile
            tile.setAttribute("data-id", index+1);

            tile.innerText = index+1;

            // Called when the user stop dragging (or leave)
            tile.addEventListener("dragleave", function(event) {
                if ( draggedElement.getAttribute("related-player") === this.getAttribute("related-player") )
                    dragTarget = this;
                else
                    dragTarget = null;
            });


            // Adding the control block event that allow to clear
            tile.addEventListener("dblclick", function() {
                console.log(game.currentPlayer.name, game.players[this.getAttribute("related-player")]);
                if ( game.currentPlayer === game.players[this.getAttribute("related-player")] )
                    game.players[this.getAttribute("related-player")].controlBlock[this.getAttribute("data-id") - 1].clear();
            });

            // Adding the player's tile
            player.controlBlock.push( new ControlBlock(tile, null, ( i < 6 ) ? "red" : "blue" ) );

            // Displaying the tile
            ctrl.appendChild(tile);
        }
    }

    initFlags() {
        /* -- Deux Disposition Différentes :
         *   R B R   ou  B R B
         *     B           R
         */

        var disposition = {
            // LEFT             // CENTER        // RIGHT        // BOTTOM / TOP
            true    : [ this.cells[0][3], this.cells[0][5], this.cells[8][4], this.cells[7][4] ],
            false   : [ this.cells[8][3], this.cells[8][5], this.cells[0][4], this.cells[1][4] ]
        };

        var randDisposition = Math.random() < 0.5;


        // Si true : Player 1 = true, Player 2 = false;
        // Sinon   : Player 2 = true, player 1 = false;

        disposition.true.forEach(function(c) {
            c.dom.classList.add("flag");
            c.dom.classList.add("flag-" + (randDisposition ? 'red' : 'blue'));
            c.gotFlag = (randDisposition ? 'red' : 'blue');
        });

        disposition.false.forEach(function(c) {
            c.dom.classList.add("flag");
            c.dom.classList.add("flag-" + (randDisposition ? 'blue' : 'red'));
            c.gotFlag = (randDisposition ? 'blue' : 'red');
        });
    }

    initRobots() {
        var randomCell = Math.floor(Math.random() * 4);

        var randomBluePos = randomCell, randomRedPos = randomCell;

        // Then, robots positions can be "symetric"
        if ( randomCell === 0 ) randomBluePos = 2;
        if ( randomCell === 2 ) randomBluePos = 0;

        // Setting robots position
        game.robots.red.setPos(this.redBase[randomRedPos].x, this.redBase[randomRedPos].y, 0);
        game.robots.blue.setPos(this.blueBase[randomBluePos].x, this.blueBase[randomBluePos].y, 0);

        // Setting blue robot default orientation to west
        waitUntil( () => {
            return ( game.robots.blue.dom !== null )
        }, () => {
            game.robots.blue.setOrientation("west");
        }, 1);
    }

    initControls(player) {
        controlSection.innerHTML = "";

        for ( var i = 0; i < controlsToActions.length; i++ )
        {
            // The object is special with eastx2 and westx2 which is different for each player
            var special =  ( controlsToActions[i].class === null );

            // Creating the img's dom element
            var dom = document.createElement("img");
            dom.classList.add("control-block");
            dom.classList.add( (special) ? ( player === 'red' ? 'red-eastx2' : 'blue-westx2' ) : player + '-' + controlsToActions[i].class );

            // Related-action is the action related to the control-block
            dom.setAttribute("related-action", controlsToActions[i].action);
            // Related-player is the player related to the control-block
            dom.setAttribute("related-player", player);
            // Setting draggable for the drag and drop
            dom.setAttribute("draggable", 'true');

            // Called when the user start dragging
            dom.addEventListener("dragstart", (event) => draggedElement = event.target );

            // Called when the user stop draggin
            dom.addEventListener("dragend", () => {
                // If dragTarget isn't null, which mean that the target is draggable by this element
                if ( dragTarget != null )
                {
                    // Getting the action index from the Tile
                    var actionIndex = parseInt(dragTarget.getAttribute("data-id")) - 1;

                    // Deleting the old class (if present)
                    game.players[player].controlBlock[actionIndex].clear();

                    // Adding the class of the current dragged element
                    dragTarget.classList.add(draggedElement.classList[1]);

                    // Setting the action in player's actions and in the corresponding controlBlock
                    game.players[player].setAction(actionIndex, draggedElement.getAttribute("related-action"));

                    // Reset values of target and source
                    draggedElement  = null;
                    dragTarget      = null;
                }
            });

            dom.addEventListener("dblclick", function(){
                // Getting the last empty controlBlock

                var i = 0;
                while ( i < 5 && game.players[player].controlBlock[i].action !== null ) i++;

                // all filled
                if ( i === 5 ) return;

                // Adding the class of the current dragged element
                game.players[player].controlBlock[i].dom.classList.add(this.classList[1]);

                // Setting the action in player's actions
                game.players[player].setAction(i, this.getAttribute("related-action"));
            });

            // Adding the control-block to the main footer
            controlSection.appendChild(dom);
        }
    }

    clearCell(x, y) {
        this.cells[y][x].dom.innerHTML  = "";
        this.cells[y][x].gotRobot       = null;
    }

    playersChooseAction() {
        this.initBlocks();

        // Player red choose his controlBlock
        sentences.chooseActions("rouge");
        this.initControls("red");
        game.currentPlayer = game.players.red;

        // Waiting until red player have finished to choose his controlBlock
        waitUntil( () => {
            return (game.players.red.actionsValidated() === true);
        }, () => {
            console .log("-- Callback 1 : game.players.RED.actions.length === 5");

            // Then, the blue player can choose his controlBlock
            sentences.chooseActions("bleu");
            this.initControls("blue");
            game.currentPlayer = game.players.blue;
        });

        // Waiting until blue player (and red played then) have finished to choose his controlBlock
        waitUntil( () => {
            return (game.players.blue.actionsValidated() === true);
        }, () => {
            console .log("-- Callback 2 : game.players.BLUE.actions.length === 5");

            // Playing actions of each players
            sentences.currentTour();
            this.playActions();
        });
    }

    playActions() {
        game.currentPlayer = game.players.blue;
        for ( var i = 0; i < 10; i++ )
        {
            waitUntil( () => {
                return ( game.currentPlayer.executingAction === false )
            }, () => {
                var p = ( game.players.red === game.currentPlayer ) ? game.players.blue : game.players.red;
                p.executeActions();
                game.currentPlayer = p;
            } );
        }

        waitUntil( () => {
            return ( game.players.red.actionsDone() && game.players.blue.actionsDone() );
        }, () => {
            this.playersChooseAction();
        })
    }

    start()
    {
        this.playersChooseAction();
    }
}

function waitUntil(boolFunction, callback, delay) {
    delay = ( delay === undefined ) ? 500 : delay;
    // Waiting until boolFunction return true, then it execute the callback
    setTimeout(function () {
        ( typeof boolFunction === "function" ? boolFunction() : null )
            ? callback()
            : waitUntil(boolFunction, callback, delay);
    }, delay);
}

Object.prototype.removeFromArray = function remove(element) {
    return this.filter(e => e !== element);
};

function init() {
    game = new Game();
    game.initGrid();

    game.initFlags();
    game.initRobots();


    game.start();
}

init();


