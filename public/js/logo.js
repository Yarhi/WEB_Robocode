/* <DOM VARIABLES> */

var frontCanvas = document.getElementById('frontCanvas');
var frontCtx = frontCanvas.getContext('2d');

var backCanvas = document.getElementById('backCanvas');
var backCtx = backCanvas.getContext('2d');

var rangeInput = document.getElementById("disk-size");

var clearfix = document.getElementsByClassName("clearfix")[0];
var imageContainer = document.getElementById("imageContainer");

/* </DOM VARIABLES> */
/* --------------------------------------------------------------------- */
/* <FUNCTIONS> */

function setPen(name) {
    if ( document.getElementsByClassName("current").length !== 0 )
        document.getElementsByClassName("current")[0].classList.remove("current");

    currentPen = pen[name];
    document.getElementsByClassName("btn-" + name.toLowerCase())[0].className += " current";
}

function getPos(event, rect) {
    return {x : event.clientX - rect.left, y : event.clientY - rect.top};
}

function drawBackground() {
    backCtx.drawImage(frontCanvas, 0, 0);
}

function clearFront() {
    frontCtx.clearRect(0,0,500,500);
}

function startDraw() {
    frontCtx.beginPath();
    if ( currentPen === pen.Line ) frontCtx.strokeStyle = "#fff";
    else frontCtx.fillStyle = "#fff";

    if ( currentPen === pen.Line || currentPen === pen.Square ) clearFront();
}

function stopDraw() {
    if ( currentPen === pen.Line ) frontCtx.stroke();
    frontCtx.closePath();
    frontCtx.fill();
}

function toggleClearfix() {
    if ( clearfix.classList.contains("hidden") ) clearfix.classList.remove("hidden");
    else clearfix.classList.add("hidden");
}

function loadSavedImages() {
    imageContainer.innerHTML = "";
    var keys = Object.keys(localStorage);

    for ( var i = 0; i < keys.length; i++ )
    {
        var imgDom = document.createElement("img");
        var trashDom = document.createElement("button");

        var item = localStorage.getItem(keys[i]);
        var key = keys[i];

        imgDom.setAttribute('src', item);
        imgDom.setAttribute('alt', keys[i]);

        trashDom.classList.add('btn-trash');
        trashDom.setAttribute("value", keys[i]);

        trashDom.addEventListener('click', function(){
            localStorage.removeItem(this.getAttribute("value"));
            loadSavedImages();
        });

        imgDom.addEventListener('click', function(){
            var loadedImg = new Image();
            loadedImg.src = localStorage.getItem( this.getAttribute("alt") );
            backCtx.clearRect(0,0,500,500);
            backCtx.drawImage(loadedImg, 0, 0);
            toggleClearfix();
        });

        var divDom = document.createElement("div");
        divDom.classList.add("element");
        divDom.innerHTML = "<span>" + keys[i] + "</span>";

        divDom.appendChild(imgDom);
        divDom.appendChild(trashDom);

        imageContainer.appendChild(divDom);
    }
}

function btnNew() {
    clearFront();
    backCtx.clearRect(0,0,500,500);
}

function btnOpen() {
    toggleClearfix();
    loadSavedImages();
}

function btnSave(exist) {
    var imgName = prompt( ( exist ) ? "Cette image existe déjà." : "Donnez un nom à l'image :" );
    if ( imgName != null && imgName !== "" )
    {
        if ( localStorage.getItem(imgName) != null )
            btnSave(true);
        else
            localStorage.setItem(imgName, backCanvas.toDataURL("image/png"));
    }
}


/* </FUNCTIONS> */
/* --------------------------------------------------------------------- */
/* <PEN OBJECT> */

var pen = {
    Brush : {
        down : function(event) {
            var pos = getPos(event, frontCanvas.getBoundingClientRect());
            savePos = { x: pos.x, y: pos.y};
        },
        move : function(event) {
            if ( pressed )
            {
                var pos = getPos(event, frontCanvas.getBoundingClientRect());
                startDraw();

                // Facultatif : Pour éviter les "espaces" entre les points lorsque l'on bouge trop vite
                if ( savePos.x != null && savePos.y != null )
                {
                    frontCtx.strokeStyle = "#fff";
                    frontCtx.moveTo(savePos.x, savePos.y);
                    frontCtx.lineTo(pos.x, pos.y);
                    frontCtx.lineWidth = penSize * 2;
                    frontCtx.stroke();
                }

                frontCtx.arc(pos.x, pos.y, penSize, 0, Math.PI * 2, true);
                stopDraw();
                savePos = { x : pos.x, y : pos.y };
            }
        },
        up : function (event) {
            var pos = getPos(event, frontCanvas.getBoundingClientRect());
            if ( pos.x === savePos.x && pos.y === savePos.y ) // Dans le cas ou on clique juste
            {
                startDraw();
                frontCtx.arc(pos.x, pos.y, penSize, 0, Math.PI * 2, true);
                stopDraw();
            }
            savePos = { x: null, y: null};
        }
    },
    Rubber : {
        down : function(event) {
            var pos = getPos(event, frontCanvas.getBoundingClientRect());
            savePos = { x: pos.x, y: pos.y};
        },
        move : function(event) {
            if ( pressed )
            {
                var pos = getPos(event, frontCanvas.getBoundingClientRect());
                startDraw();
                backCtx.clearRect(pos.x, pos.y, penSize, penSize);
                frontCtx.clearRect(pos.x, pos.y, penSize, penSize);
                stopDraw();
            }
        },
        up : function(event)
        {
            var pos = getPos(event, frontCanvas.getBoundingClientRect());
            if ( pos.x === savePos.x && pos.y === savePos.y ) // Dans le cas ou on clique juste
            {
                startDraw();
                backCtx.clearRect(pos.x, pos.y, penSize, penSize);
                frontCtx.clearRect(pos.x, pos.y, penSize, penSize);
                stopDraw();
            }
            savePos = { x: null, y: null};
        }
    },
    Line : {
        down : function (event) {
            var pos = getPos(event, frontCanvas.getBoundingClientRect());
            savePos = { x : pos.x, y : pos.y };
        },
        move : function(event) {
            if ( pressed )
            {
                var pos = getPos(event, frontCanvas.getBoundingClientRect());
                startDraw();
                frontCtx.moveTo(savePos.x, savePos.y);
                frontCtx.lineTo(pos.x, pos.y);
                frontCtx.lineWidth = penSize;
                stopDraw();
            }
        },
        up : function(event) {
            var pos = getPos(event, frontCanvas.getBoundingClientRect());
            stopDraw();
            frontCtx.moveTo(savePos.x, savePos.y);
            frontCtx.lineTo(pos.x, pos.y);
            frontCtx.lineWidth = penSize;
            stopDraw();
        }
    },
    Square : {
        down : function(event) {
            var pos = getPos(event, frontCanvas.getBoundingClientRect());
            savePos = { x : pos.x, y : pos.y };
        },
        move: function(event) {
            if ( pressed )
            {
                var pos = getPos(event, frontCanvas.getBoundingClientRect());
                frontCtx.beginPath();
                startDraw();
                frontCtx.fillRect(savePos.x, savePos.y, pos.x - savePos.x, pos.y - savePos.y);
                stopDraw();
            }
        },
        up : function(event) {
            var pos = getPos(event, frontCanvas.getBoundingClientRect());
            startDraw();
            frontCtx.fillRect(savePos.x, savePos.y, pos.x - savePos.x, pos.y - savePos.y);
            stopDraw();
        }
    }
};

/* </PEN OBJECT> */
/* --------------------------------------------------------------------- */
/* <EVENT LISTENER> */

frontCanvas.addEventListener('mousedown', function(event) {
    pressed = true;
    if (currentPen.down !== undefined ) currentPen.down(event);
});

frontCanvas.addEventListener('mouseup', function (event) {
    pressed = false;
    if ( currentPen.up !== undefined ) currentPen.up(event);
    drawBackground();
});

frontCanvas.addEventListener('mousemove', function (event) {
    if ( currentPen.move !== undefined ) currentPen.move(event);
});

rangeInput.addEventListener("change", function(){
    penSize = rangeInput.value;
});

/* </EVENT LISTENER> */
/* --------------------------------------------------------------------- */
/* <DEFAULT VARIABLES> */

var currentPen = pen.Brush;
var pressed = false;
var penSize = 15;
var savePos = { x: null, y: null};

/* </DEFAULT VARIABLES> */
