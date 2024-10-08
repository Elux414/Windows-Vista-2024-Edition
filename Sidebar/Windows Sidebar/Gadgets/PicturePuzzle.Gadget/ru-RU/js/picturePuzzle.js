////////////////////////////////////////////////////////////////////////////////
//
//  THIS CODE IS NOT APPROVED FOR USE IN/ON ANY OTHER UI ELEMENT OR PRODUCT COMPONENT.
//  Copyright (c) 2006 Microsoft Corporation.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
var L_PAUSE_TEXT = "Приостановить таймер";
var L_SHOW_TEXT = "Показать изображение";
var L_SHUFFLE_TEXT = "Перемешать";
var L_SOLVE_TEXT = "Решить";
var L_CONGRATULATIONS_TEXT = "";
var L_YOU_WIN_TEXT = "Вы выиграли!";
var toolbarTextList = new Array(L_PAUSE_TEXT, L_SHOW_TEXT, L_SOLVE_TEXT);
var tile = new Array(), x, y, i;
var solvedTiles = new Array();
var gShuffleCount = 1000;
var emptyTile = null;
var gridSize = 4;
var tileSize = 27;
var allowEvent = true;
var puzzleObject = new clsPuzzleObject();
var gameStarted = System.Gadget.Settings.read("gameStarted");
var puzzleDirection = new Array(4);
var sourceImage = "../images/1.png";
var shuffleEvent = false;
var totalSeconds = System.Gadget.Settings.read("totalSeconds") || 0;
var timerActive = false;
var timerTick = null;

puzzleDirection[0] = "U";
puzzleDirection[1] = "D";
puzzleDirection[2] = "L";
puzzleDirection[3] = "R";

System.Gadget.settingsUI = "settings.html"
System.Gadget.onSettingsClosed = settingsClosed;
////////////////////////////////////////////////////////////////////////////////
//
// Load main gadget function
//
////////////////////////////////////////////////////////////////////////////////
function loadMain()
{ 
    L_CONGRATULATIONS.innerHTML = L_CONGRATULATIONS_TEXT;
    L_YOU_WIN.innerHTML = L_YOU_WIN_TEXT;
    
    if (document.getElementsByTagName("html")[0].dir != "")
    {
        pageDir = document.getElementsByTagName("html")[0].dir;
    }
    
    mySettings.load();
    disableToolbar();
    
    sourceImage = "../images/" + mySettings.imageID + ".png";
    gamePicture.src = sourceImage;
    
    // Attaching events to the toolbar buttons
    timer.attachEvent("onmousedown", function(){doTimer('stop');});
    timer.attachEvent("onkeydown", function(){doTimer('stop');});
    hint.attachEvent("onmousedown", function(){hintShow()});
    hint.attachEvent("onmouseup", function(){hintHide();});
    hint.attachEvent("onkeydown", function(){hintShow()});
    hint.attachEvent("onkeyup", function(){hintHide();});
    shuffle.attachEvent("onmousedown", function(){shuffleHandler('true');});
    shuffle.attachEvent("onkeydown", function(){shuffleHandler('true');});
    
    toolbar();
    displayGame();
}
////////////////////////////////////////////////////////////////////////////////
//
// Move tile pieces if arrow keys down
//
////////////////////////////////////////////////////////////////////////////////
function testKey()
{
    if (event.keyCode == 37 || event.keyCode == 39 ||
        event.keyCode == 38 || event.keyCode == 40)
    {
        self.focus;document.body.focus();
        testTarget();
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Validate selected target tile
//
////////////////////////////////////////////////////////////////////////////////
function testTarget()
{
    var newTile;
    var tileCount = 0;
    var posCount = 0;
    var xCord = 1;
    var yCord = 1;
    
    // Stop right-clicking from causing tile movement
    if (allowEvent == false || (event && event.button == 2))
    {
        return false;
    }
    
    // Left
    if (event.keyCode == 39)
    {
        newTile = emptyTile.index - 1;
    }
    // Right
    else if (event.keyCode == 37)
    {
        newTile = emptyTile.index + 1;
    }
    // Up
    else if (event.keyCode == 40)
    {
        newTile = emptyTile.index - 4;
    }
    // Down
    else if (event.keyCode == 38)
    {
        newTile = emptyTile.index + 4;
    }
    
    // Spoof x&y coords from arrow click for position values
    if (newTile && (newTile > 0) && (newTile < 17))
    {
        for(y = 0; y < 4; y++)
        {
            for(x = 0; x < 4; x++, posCount++)
            {
                if ((newTile - 1) == posCount)
                {
                    xCord = 1 + (tileSize * x);
                    yCord = 1 + (tileSize * y);
                }
            }
        }
    }
    // Grab x&y mouse click coords
    else
    {
        xCord = event.offsetX;
        yCord = event.offsetY;
    }

    isValidChoice(xCord, yCord);
}
////////////////////////////////////////////////////////////////////////////////
//
// 
//
////////////////////////////////////////////////////////////////////////////////
document.onselectstart = document.ondragstart = function shutup()
{
    return false;
}
////////////////////////////////////////////////////////////////////////////////
//
// Puzzle object
//
////////////////////////////////////////////////////////////////////////////////
function clsPuzzleObject()
{
    this.invalidDirection = "";
    this.currentIndex = 0;
    this.newIndex = 0;
    this.tileArray = new Array();
    
    this.resetPuzzle = function()
    {    
        this.currentIndex = (gridSize * gridSize);
        if (this.tileArray.length > 0)
        {
            this.tileArray.splice(0);
        }
        for (var i = 0; i < (gridSize * gridSize); i++)
        {
            this.tileArray[i] = i;
        }
        this.reOrderPuzzle();
    }
    
    this.reOrderPuzzle = function()
    {
        
        var tempArray = new Array();
        for (var i = 0; i < solvedTiles.length; i++)
        {
            tempArray[i] = solvedTiles[i];
        }
        tile.splice(0,tile.length);
        
        // If first display of a game, shuffle
        if (gameStarted != true)
        {
            this.shuffle();
            for (var i = 0; i < this.tileArray.length; i++)
            {
                tile[i] = tempArray[ this.tileArray[i] ];
            }
        }
        // If game has been displayed but sidebar closed and re-opened,
        // then display saved pattern
        else
        {
            for (var i = 0; i < this.tileArray.length; i++)
            {
                var tileIndex = System.Gadget.Settings.read("savedTile"+(i+1));
                tile[i] = tempArray[tileIndex-1];
            }
        }
    }
    
    this.shuffle = function(tempArray)
    {	
        var hold = 0;
        for (var i = 0; i < gShuffleCount; i++)
        {		
            puzzleDirection.sort(function()
            {
                return Math.random()-0.5;
            });
            for (var ii=0; ii < puzzleDirection.length; ii++)
            {
                if ( this.isDirectionValid( puzzleDirection[ii] ) )
                {
                    this.newIndex = this.getNextMove(puzzleDirection[ii]);
                    if (this.newIndex != 0)
                    {
                        if ( this.isNextMoveValid() )
                        {
                            hold = this.tileArray[this.currentIndex-1];
                            this.tileArray[this.currentIndex-1] = this.tileArray[this.newIndex - 1];
                            this.tileArray[this.newIndex - 1] = hold;
                            this.setInvalidDirection(puzzleDirection[ii]);
                            this.currentIndex = this.newIndex;
                            break;
                        }
                    }
                }	
            }
        }
    }
    
    this.setInvalidDirection = function(direction)
    {
        switch (direction)
        {
            case "U" : this.invalidDirection = "D"; break;
            case "L" : this.invalidDirection = "R"; break;
            case "R" : this.invalidDirection = "L"; break;
            case "D" : this.invalidDirection = "U"; break;			
        }	
    }

    this.isNextMoveValid = function()
    {
        var returnVal = false;
    
        // Validates Up, Down, Left, and Right tiles
        if ((this.currentIndex - gridSize == this.newIndex) ||
            (this.currentIndex + gridSize == this.newIndex) ||
            ((this.currentIndex - 1 == this.newIndex) && (this.currentIndex % gridSize != 1)) ||
            ((this.currentIndex + 1 == this.newIndex) && (this.currentIndex % gridSize != 0)))
            {
            returnVal = true;
        }
        return returnVal;
    }
    
    this.getNextMove = function( direction )
    {
        var index = 0;
        switch (direction)
        {
            case "U" : index = (this.currentIndex - gridSize); break;
            case "L" : index = (this.currentIndex - 1); break;
            case "R" : index = (this.currentIndex + 1); break;
            case "D" : index = (this.currentIndex + gridSize); break;			
        }
        if ( index <= 0 | index > 16)
        {
            index = 0;
        }
        return index;
    }

    this.isDirectionValid = function ( direction )
    {
        return ( this.invalidDirection != direction );
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// No Animation Shuffle
//
////////////////////////////////////////////////////////////////////////////////
function onShuffleNoAnimation()
{    
    disableEvents();
    pad.filters(0).apply();
    puzzleObject.resetPuzzle();
    
    for(y = 0, i = 0; y < gridSize; y++)
    {
        for(x = 0; x < gridSize; x++, i++)
        {
            if (tile[i])
            {
                tile[i].setAttribute("index", i + 1);
                moveNoAnimation(tile[i], x * tileSize, y * tileSize);
            }
        }
    }
    
    pad.filters(0).play();
    emptyTile.style.display = "";
    setTimeout(enableEvents, 1000);
    setTimeout("hint.disabled = ''", 900);
    setTimeout("shuffle.disabled = ''", 900);
    System.Gadget.Settings.write("gameStarted", true);
}
////////////////////////////////////////////////////////////////////////////////
//
// No Animation Move
//
////////////////////////////////////////////////////////////////////////////////
function moveNoAnimation(tileObj, x, y)
{
    tileObj.x = x; 
    tileObj.y = y;
    tileObj.runtimeStyle.left = x;
    tileObj.runtimeStyle.top = y;
    tileObj.runtimeStyle.zIndex = 0
    
    if (gameStarted != true)
    {
        saveTile(tileObj.index, tileObj.originalPosition);
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Settings close
//
////////////////////////////////////////////////////////////////////////////////
function settingsClosed(event)
{
    if (event.closeAction == event.Action.commit)
    {     
        mySettings.load();
        sourceImage = "../images/" + mySettings.imageID + ".png";
        gamePicture.src = sourceImage;

        for (var i = 1; i < 16; i++)
        {
            document.getElementById("img"+i).parentElement.style.backgroundImage = 'url('+sourceImage+')';
        }
    }
    else if(event.closeAction == event.Action.cancel)
    {
    }
    event.cancel = false;
}
////////////////////////////////////////////////////////////////////////////////
//
// Display Game
//
////////////////////////////////////////////////////////////////////////////////
function displayGame()
{
    var counter = 0;
    for(y = 0; y < gridSize; y++)
    {
        for(x = 0; x < gridSize; x++)
        {
            var tileLeft = x * tileSize;
            var tileTop = y * tileSize;
            pad.insertAdjacentHTML("beforeEnd",
                "<div dir='ltr' id='t"+y+x+"' onclick='swapTile(this)' originalPosition='"+(++counter)+"' "+
                "style='position: absolute; width: "+tileSize+"; height: "+tileSize+"; left: "+tileLeft+"; top: "+tileTop+"; background: no-repeat -"+tileLeft+" -"+tileTop+" url("+sourceImage+");'>"+
                "<img id='img"+counter+"' style='position: absolute; left: 0; top: 0; width: "+tileSize+"; height: "+tileSize+"' src='../images/tile_bezel.png'></div>"
            );
            tile.push(pad.lastChild);
            solvedTiles.push(pad.lastChild);
        }
    }

    img16.parentElement.style.background="";
    img16.parentElement.disabled = true;
    img16.src = "../images/tile_drop_shadow.png";
    emptyTile = tile[15]; 
    setTimeout(onShuffleNoAnimation,500);
}
////////////////////////////////////////////////////////////////////////////////
//
// On Shuffle
//
////////////////////////////////////////////////////////////////////////////////
function onShuffle()
{
    if ((event.button && event.button != 1) || (event.keyCode && event.keyCode != 13))
    {
        return false;
    }
    
    disableToolbar();
    disableEvents();
    pad.filters(0).apply();
    gamePictureDiv.style.display = "none";
    emptyTile.index = "";
    puzzleObject.resetPuzzle();
    
    for(y = 0, i = 0; y < gridSize; y++)
    {
        for(x = 0; x < gridSize; x++, i++)
        {
            tile[i].setAttribute("index", i + 1);
            moveNoAnimation(tile[i], x * tileSize, y * tileSize);
        }
    }
    
    pad.filters(0).play();
    emptyTile.style.display = "";
    setTimeout(enableEvents, 1000);
    setTimeout("hint.disabled = ''", 900);
    setTimeout("shuffle.disabled = ''", 900);
    gameStarted = true;
    self.focus;document.body.focus();
}
////////////////////////////////////////////////////////////////////////////////
//
// Handler to decide whether to shuffle or solve the puzzle
//
////////////////////////////////////////////////////////////////////////////////
function doTimer(timerAction)
{
    if ((event.button && event.button != 1) ||
        (event.keyCode && event.keyCode != 13 &&
        event.keyCode != 37 && event.keyCode != 39 &&
        event.keyCode != 38 && event.keyCode != 40))
    {
        return false;
    }
    
    switch (timerAction)
    {
        case 'start':
            timerTick = setInterval(function(){tick();}, 1000);
            timerActive = true;
            timer.disabled = '';
            break;
            
        case 'stop':
            clearInterval(timerTick);
            timer.disabled = 'true';
            timerActive = false;
            break;
        
        case 'reset':
            clearInterval(timerTick);
            timer.disabled = 'true';
            timerActive = false;
            totalSeconds = -1;
            timerTick = setInterval(function(){tick();}, 1);
            setTimeout('clearInterval(timerTick)', 1);
            break;
        
        default:
            timer.disabled = 'true';
            timerActive = false;
            totalSeconds = totalSeconds - 1;
            timerTick = setInterval(function(){tick();}, 1);
            setTimeout('clearInterval(timerTick)', 1);
            break;
    }
    
    function tick()
    {
        var timeCount = Math.abs(++totalSeconds);
        var hours = parseInt(timeCount / 3600);
        var minutes = parseInt((timeCount / 60) % 60);
        var seconds = parseInt(timeCount % 60);
        timerCount.innerText = (hours < 10 ? "0" : "")+hours+":"+(minutes < 10 ? "0" : "")+minutes+":"+(seconds < 10 ? "0" : "")+seconds;
        System.Gadget.Settings.write("totalSeconds", totalSeconds);
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Handler to decide whether to shuffle or solve the puzzle
//
////////////////////////////////////////////////////////////////////////////////
function shuffleHandler(action)
{
    if (shuffleEvent == true)
    {
        if (action)
        {
            gameStarted = false;
            onShuffle();
            doTimer('reset');
        }
        shuffleEvent = false;
        shuffle.title = L_SOLVE_TEXT;
    }
    else
    {
        if (action)
        {
            onSolve();
            doTimer('reset');
        }
        shuffleEvent = true;
        shuffle.title = L_SHUFFLE_TEXT;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Disable mouse clicks and key presses
//
////////////////////////////////////////////////////////////////////////////////
function disableEvents()
{
    allowEvent = false;
}
////////////////////////////////////////////////////////////////////////////////
//
// Enable mouse clicks and key presses
//
////////////////////////////////////////////////////////////////////////////////
function enableEvents()
{
    allowEvent = true;
}
////////////////////////////////////////////////////////////////////////////////
//
// On Solve
//
////////////////////////////////////////////////////////////////////////////////
function onSolve()
{
    if ((event.button && event.button != 1) || (event.keyCode && event.keyCode != 13))
    {
        return false;
    }
    
    disableToolbar();
    disableEvents();
    pad.filters(0).apply();
    var i = 0;
    
    for(var y = 0; y < gridSize; y++)
    {
        for(var x = 0; x < gridSize; x++)
        {
            var style = window["t"+y+x].runtimeStyle;
            style.posLeft = x * tileSize, style.posTop = y * tileSize;
            document.getElementById("t"+y+x).setAttribute("index", ++i);
            tile[i-1] = document.getElementById("t"+y+x);
	        saveTile(tile[i-1].index, tile[i-1].originalPosition);
        }
    }
    
    pad.filters(0).play();
    setTimeout('gamePictureDiv.style.display = "none"', 70);
    enableEvents();
    setTimeout("hint.disabled = ''", 900);
    setTimeout("shuffle.disabled = ''", 900);
}
////////////////////////////////////////////////////////////////////////////////
//
// Check For Valid Choice
//
////////////////////////////////////////////////////////////////////////////////
function isValidChoice(xCord, yCord)
{
    // Find tile in array with matching x/y coords
    var tileCount = 0;
    while(tileObj = tile[tileCount++])
    {
        var runObj = tileObj.runtimeStyle;
        if(runObj.posLeft < xCord &&
            runObj.posLeft + tileSize > xCord &&
            runObj.posTop < yCord &&
            runObj.posTop + tileSize > yCord)
        {
            // Validates Up, Down, Left, and Right tiles
            var index = tileObj.index;
            if ((index > 0) && (index < 17) &&
                ((index == emptyTile.index - gridSize) ||
                (index == emptyTile.index + gridSize) ||
                ((index == emptyTile.index - 1) && (emptyTile.index % gridSize != 1)) ||
                ((index == emptyTile.index + 1) && (emptyTile.index % gridSize != 0))))
            {
                // Fire off a click for that tile
                tileObj.click();
                if (!timerActive && !isGameOver())
                {
                    doTimer('start');
                }
                
                if (shuffleEvent && !isGameOver())
                {
                    shuffleHandler();
                }
            }
        }
    }

    if ((index  != emptyTile.index) && (Math.ceil(index / gridSize) == Math.ceil(emptyTile.index / gridSize)))
    {
        // Slide multiple tiles left
        if (index > emptyTile.index)
        {
            for (count = emptyTile.index + 1; count <= index; count++)
            {
                var left = emptyTile.runtimeStyle.posLeft + (tileSize+1);
                var top = emptyTile.runtimeStyle.posTop + 1;
                isValidChoice(left, top);
            }
        }
        else
        {
            // Slide multiple tiles right
            for (count = emptyTile.index - 1; count >= index; count--)
            {
                var left = emptyTile.runtimeStyle.posLeft - (tileSize-1);
                var top = emptyTile.runtimeStyle.posTop + 1;
                isValidChoice(left, top);
            }
        }
    }
    else if ((index != emptyTile.index) && (index % gridSize == emptyTile.index % gridSize))
    {
        // Slide multiple tiles up
        if (index > emptyTile.index)
        {
            for (count = emptyTile.index + gridSize; count <= index; count = count + gridSize)
            {
                var left = emptyTile.runtimeStyle.posLeft + 1;
                var top = emptyTile.runtimeStyle.posTop + (tileSize+1);
                isValidChoice(left, top);
            }
        }
        else
        {
            // Slide multiple tiles down
            for (count = emptyTile.index - gridSize; count >= index; count = count - gridSize)
            {
                var left = emptyTile.runtimeStyle.posLeft + 1;
                var top = emptyTile.runtimeStyle.posTop - (tileSize-1);
                isValidChoice(left, top);
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Swap Tiles
//
////////////////////////////////////////////////////////////////////////////////
function swapTile(tileObj)
{
    disableEvents();
    var index = "";
    var increment = 9;
    var count = 0;
    var startTop = tileObj.runtimeStyle.posTop;
    var endTop = emptyTile.runtimeStyle.posTop;
    var startLeft = tileObj.runtimeStyle.posLeft;
    var endLeft = emptyTile.runtimeStyle.posLeft;
    var endIndex = emptyTile.index;
    
    // Swap tile indices
    tempIndex = tileObj.index;
    tileObj.index = emptyTile.index;
    emptyTile.index = tempIndex;
    
    // Swap runtimeStyle left position
    tempLeft = tileObj.runtimeStyle.posLeft;
    emptyTile.runtimeStyle.posLeft = tempLeft;
    
    // Swap runtimeStyle top position
    tempTop = tileObj.runtimeStyle.posTop;
    emptyTile.runtimeStyle.posTop = tempTop;
    
    emptyTile.runtimeStyle.zIndex = -1;
    
    // Slide tiles
    setTimeout(tilePosition);
    
    function tilePosition()
    {
        if (count++ < increment)
        {
            tileObj.runtimeStyle.posTop = tileObj.runtimeStyle.posTop - ((startTop - endTop) / increment);
            tileObj.runtimeStyle.posLeft = tileObj.runtimeStyle.posLeft - ((startLeft - endLeft) / increment);
            return setTimeout(tilePosition, 10);
        }
        else
        {
            enableEvents();
        }
    }
    
    // Write tile/emptyTile data, erase old tile data
	saveTile(tileObj.index, tileObj.originalPosition);
	System.Gadget.Settings.write("savedTile" + emptyTile.index, 16);
    
    if (isGameOver())
    {
        doTimer('stop');
        winner();
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Save Tile Data
//
////////////////////////////////////////////////////////////////////////////////
function saveTile(currentPos, originalPos)
{
    // Write tile/emptyTile data, erase old tile data
    System.Gadget.Settings.write("savedTile" + currentPos, originalPos);
}
////////////////////////////////////////////////////////////////////////////////
//
// Win Game
//
////////////////////////////////////////////////////////////////////////////////
function winner()
{
    if (!shuffleEvent)
    {
        shuffleHandler();
    }
    disableToolbar();
    gamePictureDiv.filters(0).apply();
    gamePictureDiv.style.display = "";
    gamePictureDiv.filters(0).play();
    setTimeout("winMessageDisplay(100)", 1000);
}
////////////////////////////////////////////////////////////////////////////////
//
// Win Game
//
////////////////////////////////////////////////////////////////////////////////
function winMessageDisplay(val)
{
    winMessage.style.visibility = 'visible';
    
    if (val > 0)
    {
        val--;
        winMessage.style.filter = "alpha(opacity=" + val + ")";
        if (val == 35)
        {
            shuffle.disabled = '';
        }
        setTimeout("winMessageDisplay(" + val + ");", 60);
    }
    else
    {
        winMessage.style.visibility = 'hidden';
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Game Over
//
////////////////////////////////////////////////////////////////////////////////
function isGameOver()
{
    var returnVal = true;
    
    for (var i = 0; i < tile.length; i++)
    {
        if (tile[i].index != tile[i].originalPosition)
        {
            returnVal = false;
            break;
        }
    }
    
    return returnVal;
}
////////////////////////////////////////////////////////////////////////////////
//
// Toolbar
//
////////////////////////////////////////////////////////////////////////////////
function toolbar()
{
    var imgList = bar.all.tags("img");
    var i = 0;
    var img;
    
    doTimer();
    
    while (img = imgList[i++])
    {
        with (img)
        {
            src = "../images/"+id+"_up.png";
            title = toolbarTextList[i-1];
            tabIndex = i+1;
            onmouseover = function(){this.over = true; swapImage(this)}
            onmouseout = function(){this.over = false; swapImage(this)}
            onmousedown = function(){this.down = true; swapImage(this); this.setCapture()}
            onmouseup = function()
            {
                this.down = false;
                this.releaseCapture();
                var button = document.elementFromPoint(event.clientX, event.clientY);
                if (button != this)
                {
                    this.over = false;
                    button.fireEvent("onmouseover");
                }
                swapImage(this);
            }
        
            function swapImage(button){
                var state = "up";
                if (button.down && !button.disabled)
                {
                    state = "down";
                }
                else if (button.over && !button.disabled)
                {
                    state = "over";
                }
                button.src = "../images/"+button.id+"_"+state+".png";                
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Disable toolbar buttons
//
////////////////////////////////////////////////////////////////////////////////
function disableToolbar()
{
    timer.disabled = 'true';
    hint.disabled = 'true';
    shuffle.disabled = 'true';
}
////////////////////////////////////////////////////////////////////////////////
//
// Show Hint image
//
////////////////////////////////////////////////////////////////////////////////
function hintShow()
{
    if (!hint.disabled && (event.button == 1 || event.keyCode == 13))
    {
        gamePictureDiv.style.display = "";
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Hide Hint image
//
////////////////////////////////////////////////////////////////////////////////
function hintHide()
{
    if (!hint.disabled && (event.button == 1 || event.keyCode == 27))
    {
        gamePictureDiv.style.display = "none";
    }
}
