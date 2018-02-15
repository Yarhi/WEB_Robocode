var gameContainer   = document.getElementById("game-table-container");
var headerText      = document.getElementById("header-text");

var redControls     = document.getElementById("red-controls");
var blueControls    = document.getElementById("blue-controls");

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

var game;

// Drag and drop variables
var dragTarget      = null;
var draggedElement  = null;

// Orientation type
var sentences = {
    chooseActions : function (playerName) {
        headerText.innerText = "Le joueur " + playerName + " choisit ses actions";
    },
    currentTour : function () {
        headerText.innerText = "Tour de jeu en cours";
    }
};

class Robot {
    constructor(name) {
        this.name   = name;
        this.dom    = null;

        this.pos = { x : 0, y : 0 };

        // Orientation action Type
        this.orientationAction = {
            north : {
                name : 'north',
                robot : this,
                forward     : function () { this.robot.setPos(this.robot.pos.x, this.robot.pos.y-1) },
                rearward    : function () { this.robot.setPos(this.robot.pos.x, this.robot.pos.y+1) }
            },
            south : {
                name : 'south',
                robot : this,
                forward     : function () { this.robot.setPos(this.robot.pos.x, this.robot.pos.y+1) },
                rearward    : function () { this.robot.setPos(this.robot.pos.x, this.robot.pos.y-1) }
            },
            west : {
                name : 'west',
                robot : this,
                forward     : function () { this.robot.setPos(this.robot.pos.x-1, this.robot.pos.y) },
                rearward    : function () { this.robot.setPos(this.robot.pos.x+1, this.robot.pos.y) }
            },
            east : {
                name : 'east',
                robot : this,
                forward     : function () { this.robot.setPos(this.robot.pos.x+1, this.robot.pos.y) },
                rearward    : function () { this.robot.setPos(this.robot.pos.x-1, this.robot.pos.y) }
            },
        };
        this.orientation = this.orientationAction.east;
        this.orientationClass = "east";
    }

    setPos(x, y, animate) {
        if ( this.dom != null ) this.dom.classList.add("animate-" + this.orientationClass);


        var robotInstance = this;
        var delay = (animate === undefined) ? 1000 : 0;

        setTimeout(function(){
            // Clearing old robot
            game.clearCell(robotInstance.pos.x, robotInstance.pos.y);

            // Robot div element
            var robotDom = document.createElement("div");
            robotDom.classList.add("robot");
            robotDom.classList.add("robot-" + robotInstance.name);
            robotDom.classList.add(robotInstance.orientationClass);


            var objName = "robot" + (robotInstance.name.toString()[0].toUpperCase()) + (robotInstance.name.substring(1));

            // For the first placement
            if ( x !== undefined && y !== undefined )
            {
                game.cells[y][x].dom.appendChild(robotDom);
                game.cells[y][x][objName] = robotDom;

                robotInstance.pos.x = x;
                robotInstance.pos.y = y;
            }

            robotInstance.dom = robotDom;

            // Creating new robot
            game.cells[robotInstance.pos.y][robotInstance.pos.x].dom.appendChild(robotDom);
            game.cells[robotInstance.pos.y][robotInstance.pos.x][objName] = robotDom;
        }, delay);

    }


    setOrientation(side) {
        // Removing current dom orientation
        this.dom.classList.remove(this.orientationClass);

        // Setting new orientation
        this.orientation = this.orientationAction[side];
        this.orientationClass = side;

        // Adding new dom orientation
        this.dom.classList.add(this.orientationClass);
    }
}

class Action {
    constructor(robot) {
        this.robot = robot;
    }

    allowedPosition() {
        // Return true if robot position is in the map
        return (this.robot.pos.x <= 8 && this.robot.pos.x >= 0
            && this.robot.pos.y <= 8 && this.robot.pos.y >= 0);
    }


    north() { this.robot.setOrientation("north"); }

    south() { this.robot.setOrientation("south"); }

    east() { this.robot.setOrientation("east"); }

    west() { this.robot.setOrientation("west"); }


    // if doAction === true, then the robot do the action.
    // else, it just check if the robot can do the action.
    forward(doAction) {
        // Saving old pos in case of action isn't allowed
        var oldPos = { x : this.robot.pos.x, y : this.robot.pos.y };
        this.robot.orientation.forward();

        if ( doAction !== undefined && doAction === true)
        {
            // Reset the old position if it's just a check
            game.clearCell(oldPos.x, oldPos.y);
            this.robot.pos.x = oldPos.x;
            this.robot.pos.y = oldPos.y;
            game.clearCell(oldPos.x, oldPos.y);
        }
        else
            game.clearCell(oldPos.y, oldPos.x);

        // Checking if action is possible (map out or not)
        return this.allowedPosition();
    }

    // Same than forward
    rearward(doAction) {
        // Checking if action is possible (map out or not)
        var oldPos = { x : this.robot.pos.x, y : this.robot.pos.y };
        this.robot.orientation.rearward();

        // Checking if action is possible (map out or not)
        if ( doAction !== undefined && doAction === true)
        {
            // Reset the old position if it's just a check
            game.clearCell(oldPos.x, oldPos.y);
            this.robot.pos.x = oldPos.x;
            this.robot.pos.y = oldPos.y;
        }
        else
            game.clearCell(oldPos.y, oldPos.x);

        // Checking if action is possible (map out or not)
        return this.allowedPosition();
    }

    gox2()
    {
        this.forward();
        this.forward();
    }

    take()
    {

    }

    put()
    {

    }

    push()
    {
        if ( this.robot === game.robots.red )
            game.robots.blue.ExecuteAction("rearward");
        else
            game.robots.red.ExecuteAction("rearward");
    }

    cancel()
    {

    }

    x2()
    {

    }

    pause()
    {

    }
}

class Player {
    constructor(name, logo, robot) {
        this.name = name;
        this.logo = logo;
        this.robot = robot;

        this.tiles = [];

        this.actions = [
            null,
            null,
            null,
            null,
            null
        ];

        this.actionsDone = [false, false, false, false, false];
        this.actionIndex = 0;

        this.actionsValidated = false;
    }

    chooseActions() {

    }


    ExecuteAction(func)
    {
        var actionInstance = new Action(this.robot);
        actionInstance[func]();

        this.actionsDone[this.actionIndex] = true;
        this.actionIndex++;
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

        this.turn = 0;
    }

    initGrid() {
        for ( var i = 0; i < 9; i++ )
        {
            var tmp = [];
            for ( var j = 0; j < 9; j++ )
            {
                var cell = {dom : document.createElement("div"), x : j, y : i};
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

        /* Red Tiles && Blue Tiles */
        for ( var i = 1; i < 11; i++ )
        {
            // Getting the player ( red < 6; blue >= 6)
            var player = ( i < 6 ) ? this.players.red : this.players.blue;
            // Getting the player's control dom ( red < 6; blue >= 6)
            var ctrl   = ( i < 6 ) ? redControls : blueControls;

            // Creating the tile
            var tile = document.createElement("div");
            tile.classList.add("block");
            tile.classList.add("block-" + player.name );
            // Setting the related player to the Tile
            tile.setAttribute("related-player", player.name);
            // Setting the action number to the Tile
            tile.setAttribute("data-id", (i < 6) ? i : i - 5);

            tile.innerText = ( i < 6 ) ? i : i - 5;

            // Called when the user stop dragging (or leave)
            tile.addEventListener("dragleave", function(event) {
                if ( draggedElement.getAttribute("related-player") === this.getAttribute("related-player") )
                    dragTarget = this;
                else
                    dragTarget = null;
            });

            // Adding the player's tile
            player.tiles.push( {dom : tile, action : null} );
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
            c.dom.classList.add("flag-" + (randDisposition ? 'red' : 'blue'));
        });

        disposition.false.forEach(function(c) {
            c.dom.classList.add("flag-" + (randDisposition ? 'blue' : 'red'));
        });
    }

    initRobots() {
        var randomCell = Math.floor(Math.random() * 4);

        var randomBluePos = randomCell, randomRedPos = randomCell;

        // Then, robots positions can be "symetric"
        if ( randomCell === 0 ) randomBluePos = 2;
        if ( randomCell === 2 ) randomBluePos = 0;

        // Setting robots position
        game.robots.red.setPos(this.redBase[randomRedPos].x, this.redBase[randomRedPos].y);
        game.robots.blue.setPos(this.blueBase[randomBluePos].x, this.blueBase[randomBluePos].y);

        // Setting blue robot default orientation to west
        waitUntil( () => {
            return ( game.robots.blue.dom !== null )
        }, () => {
            game.robots.blue.setOrientation("west");
        } );
    }

    static initControls(player) {
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
            dom.setAttribute("draggable", true);

            // Called when the user start dragging
            dom.addEventListener("dragstart", (event) => draggedElement = event.target );

            // Called when the user stop draggin
            dom.addEventListener("dragend", () => {
                // If dragTarget isn't null, which mean that the target is draggable by this element
                if ( dragTarget != null )
                {
                    // Adding the class of the current dragged element
                    dragTarget.classList.add(draggedElement.classList[1]);

                    // Getting the action index from the Tile
                    var actionIndex = parseInt(dragTarget.getAttribute("data-id"));

                    // Setting the action in player's actions
                    game.players[player].actions[actionIndex] = draggedElement.getAttribute("data-action");

                    // Reset values of target and source
                    draggedElement  = null;
                    dragTarget      = null;
                }
            });

            // Adding the control-block to the main footer
            controlSection.appendChild(dom);
        }
    }

    clearCell(x, y) {
        var dom = this.cells[y][x].dom;
        this.cells[y][x].dom.innerHTML = "";
        this.cells[y][x] = { dom : dom, x: x, y : y };
    }

    playersChooseAction() {

        // Player red choose his tiles
        sentences.chooseActions("rouge");
        Game.initControls("red");

        setTimeout(function () {
            game.players.red.actions = [
                "forward",
                "forward",
                "forward",
                "forward",
                "forward",
            ];
            game.players.red.actionsValidated = true;
        }, 1000);

        // Waiting until red player have finished to choose his tiles
        waitUntil( () => {
            return (game.players.red.actionsValidated === true);
        }, () => {
            console .log("-- Callback 1 : game.players.RED.actions.length === 5");

            // Then, the blue player can choose his tiles
            sentences.chooseActions("bleu");
            Game.initControls("blue");

            setTimeout(function () {
                game.players.blue.actions = [
                    "forward",
                    "forward",
                    "forward",
                    "forward",
                    "forward",
                ];
                game.players.blue.actionsValidated = true;
                console.log("done");
            }, 1000);
        });

        // Waiting until blue player (and red played then) have finished to choose his tiles
        waitUntil( () => {
            return (game.players.blue.actionsValidated === true);
        }, () => {
            console .log("-- Callback 2 : game.players.BLUE.actions.length === 5");

            // Playing actions of each players
            sentences.currentTour();
            this.playActions();
        });

    }

    playActions() {
        // Doing each players actions
        // Animate and execute players actions

        game.Execute(game.players.red, 0);

        waitUntil(
            () => { return ( game.players.red.actionsDone[0] ) },
            () => { game.Execute(game.players.blue, 0) }
        );

        waitUntil(
            () => { return ( game.players.blue.actionsDone[0] ) },
            () => { game.Execute(game.players.red, 1) }
        );

        waitUntil(
            () => { return ( game.players.red.actionsDone[1] ) },
            () => { game.Execute(game.players.blue, 1) }
        );

        waitUntil(
            () => { return ( game.players.blue.actionsDone[1] ) },
            () => { game.Execute(game.players.red, 2) }
        );

        waitUntil(
            () => { return ( game.players.red.actionsDone[2] ) },
            () => { game.Execute(game.players.blue, 2) }
        );

        waitUntil(
            () => { return ( game.players.blue.actionsDone[2] ) },
            () => { game.Execute(game.players.red, 3) }
        );

        waitUntil(
            () => { return ( game.players.red.actionsDone[3] ) },
            () => { game.Execute(game.players.blue, 3) }
        );

        waitUntil(
            () => { return ( game.players.blue.actionsDone[3] ) },
            () => { game.Execute(game.players.red, 4) }
        );

        waitUntil(
            () => { return ( game.players.red.actionsDone[4] ) },
            () => { game.Execute(game.players.blue, 4) }
        );

        /*
        waitUntil(
            () => { return ( game.players.blue.actionsDone[0] ) },
            () => {
                waitUntil( () => {
                   return ( game.players.red.actionsDone[0] )
                }, () => {

                });
                game.Execute(game.players.red.actions[1], game.players.blue.actions[1], 1100);
            }
        );
        waitUntil(
            () => { return ( game.players.red.actionsDone[1] && game.players.blue.actionsDone[1] ) },
            () => { game.Execute(game.players.red.actions[2], game.players.blue.actions[2], 1100); }
        );
        waitUntil(
            () => { return ( game.players.red.actionsDone[2] && game.players.blue.actionsDone[2] ) },
            () => { game.Execute(game.players.red.actions[3], game.players.blue.actions[3], 1100); }
        );
        waitUntil(
            () => { return ( game.players.red.actionsDone[3] && game.players.blue.actionsDone[3] ) },
            () => { game.Execute(game.players.red.actions[4], game.players.blue.actions[4], 1100); }
        );*/

    }

    Execute(player, actionIndex, delay) {
        if ( delay === undefined ) delay = 500;
        setTimeout(function(){
            if ( player.actions[actionIndex] !== null ) player.ExecuteAction(player.actions[actionIndex]);
        }, delay);
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

function init() {
    game = new Game();
    game.initGrid();
    game.initFlags();
    game.initRobots();


    game.playersChooseAction();
}



init();
