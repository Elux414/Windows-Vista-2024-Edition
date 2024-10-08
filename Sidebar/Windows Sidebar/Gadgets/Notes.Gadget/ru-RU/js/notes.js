////////////////////////////////////////////////////////////////////////////////
//
//  THIS CODE IS NOT APPROVED FOR USE IN/ON ANY OTHER UI ELEMENT OR PRODUCT COMPONENT.
//  Copyright (c) 2006 Microsoft Corporation.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
var gadgetArray         = new Array();

var L_YELLOW_TEXT        = "Желтый";
var L_PURPLE_TEXT        = "Сиреневый";
var L_BLUE_TEXT          = "Синий";
var L_GREEN_TEXT         = "Зеленый";
var L_PINK_TEXT          = "Розовый";
var L_WHITE_TEXT         = "Белый";
var L_colorArray         = new Array(L_YELLOW_TEXT, L_PURPLE_TEXT, L_BLUE_TEXT, L_GREEN_TEXT, L_PINK_TEXT, L_WHITE_TEXT);

var L_DELETENOTE_TEXT    = "Удалить";
var L_PREVIOUSNOTE_TEXT  = "Предыдущая";
var L_NEXTNOTE_TEXT      = "Следующая";
var L_ADDNOTE_TEXT       = "Добавить";

var L_FONT_1_TEXT        = "Segoe Print";
var L_FONT_2_TEXT        = "Segoe Script";
var L_FONT_3_TEXT        = "Segoe UI";
var L_FONT_4_TEXT        = "NA";
var L_FONT_5_TEXT        = "NA";
var L_FONT_6_TEXT        = "NA";
var L_FONT_7_TEXT        = "NA";
var L_FONT_8_TEXT        = "NA";
var L_FONT_9_TEXT        = "NA";
var L_FONT_10_TEXT       = "NA";

var fontArray;
loadFonts();

var colorArray           = new Array("yellow", "purple", "blue", "green", "pink", "white");
var sizePointArray       = new Array("9", "10", "11", "12", "14", "16", "18");
var sizePixelArray       = new Array("12", "13", "15", "16", "18", "20", "22");
var bgImgDockState       = "_docked";
var curId                = 0;
var lastId               = 0;
var totalId              = 0;
var noteLength           = 0;
var maxNumberNotes       = 10;
var curColor;
var curFont;
var curSizeUndocked;
var curSizeDocked;
var curCount;
var settingsColor;
var settingsFont;
var settingsSize;
var initFlag;
var areaCleared          = -1;
var areaFocus            = false;
var bodyFocus            = false;
var textAreaFocus        = false;
var imagePressed         = false;
var maxNoteSize          = 1000;
var pageSeparator        = "/";
var pageDir;
////////////////////////////////////////////////////////////////////////////////
//
// gadget initial startup routine
//
////////////////////////////////////////////////////////////////////////////////
function loadMain()
{
    pageDir = document.getElementsByTagName("html")[0].dir;
    
    if (System.Gadget.Settings.read("SettingsExist"))
    {
        curId = 0;

        curColor = getValidSetting(System.Gadget.Settings.readString("ColorSaved"), colorArray, 0);
        
        var fontSaved = System.Gadget.Settings.readString("FontSaved");
        
        if (fontSaved)
        {
            curFont = System.Gadget.Settings.readString("FontSaved");
        }
        else
        {
            curFont = L_FONT_1_TEXT;
        }
        
        curSizeDocked = getValidSetting(System.Gadget.Settings.read("SizeDockedSaved"), sizePixelArray, 0);
        curSizeUndocked = getValidSetting(System.Gadget.Settings.read("SizeUndockedSaved"), sizePixelArray, 0);

        loadSaved();
        
        var noteDir = System.Gadget.Settings.readString("NoteDir");
        
        if (noteDir)
        {
            noteArea.dir = noteDir;
        }
    }
    else
    {
        curColor = colorArray[0];
        curFont = L_FONT_1_TEXT;
        curSizeDocked = sizePixelArray[0];
        curSizeUndocked = sizePixelArray[0];
        
        addNote();
    }
    
    writeSettings(curColor, curFont, curSizeDocked, curSizeUndocked);
    
    noteArea.style.fontFamily = curFont;
    noteArea.innerText = getSettings(curId);
    
    System.Gadget.onDock = checkState;
    System.Gadget.onUndock = checkState;
    
    System.Gadget.settingsUI = "settings.html";
    System.Gadget.onSettingsClosed = settingsClosed;
    
    setDeleteIcon("disabled");
    setLeftArrow("disabled");
    setRightArrow("disabled");
    setAddIcon("disabled");
    
    setImages(curColor);
    checkImageState();
    checkState();
    
    deleteIcon.alt = forDeleteNoteID.innerText = L_DELETENOTE_TEXT;
    leftArrow.alt = forLeftAnchor.innerText = L_PREVIOUSNOTE_TEXT;
    rightArrow.alt = forRightAnchor.innerText = L_NEXTNOTE_TEXT;
    plusIcon.alt = forAddNoteID.innerText = L_ADDNOTE_TEXT;
}
////////////////////////////////////////////////////////////////////////////////
//
// SETTINGS
// load settings - populate form 
//
////////////////////////////////////////////////////////////////////////////////
function loadSaved()
{
    curCount = 1;
    
    if (System.Gadget.Settings.read("NoteCount"))
    {
        curCount = getNoteCount();
    }
    
    var loadedFromReload = false;
    
    if (!gadgetArray[0])
    {
        loadedFromReload = true;
    }
    
    for (var i = 0; i < curCount; i++)
    {
        if (loadedFromReload)
        {
            gadgetArray.push(new setNote());
        }
        
        gadgetArray[i].oNoteText = getSettings(i);
        gadgetArray[i].oId = i;
        
        curId++;
        lastId++;
        totalId++;
    }

    noteState();
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function loadFonts()
{
    fontArray = new Array();

    var fontIndex = 1;
    
    while(eval("typeof L_FONT_" + fontIndex + "_TEXT != 'undefined'"))
    {
        var fontName = eval("L_FONT_" + fontIndex + "_TEXT");
        
        if (fontName != "" && fontName != "NA")
        {
            fontArray.push(eval("L_FONT_" + fontIndex + "_TEXT"));
        }
        
        fontIndex++;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// check gadget docked state
//
////////////////////////////////////////////////////////////////////////////////
function checkState()
{
    if (System.Gadget.docked) 
    { 
        dockedState();
    } 
    else
    {
        undockedState();
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//  set gadget state to UNDOCKED
//
////////////////////////////////////////////////////////////////////////////////
function undockedState()
{
    bgImgDockState = "";

    with (document.body.style)
    {
        width = "197px";
        height = "177px";
    }
    notesBg.style.width = "197px";
    notesBg.style.height = "177px";
    notesBg.src = "url(images/sticky_" + curColor + bgImgDockState + ".png)";

    with (noteArea.style)
    {
        width = "160px";
        height = "125px";
        top = "10px";
        left = "16px";
        fontSize = curSizeUndocked + "px";
    }

    with (leftArrow.style)
    {
        top = "140px";
        left = "63px";
    }

    with (pageWell.style)
    {
        width = "197px";
        height = "20px";
        top = "138px"; 
    }
    
    with (rightArrow.style)
    {
        top = "140px";
        left = "117px";
    }

    with (plusIcon.style)
    {
        top = "140px"; 
        left = "164px";
    }
    
    with (deleteIcon.style)
    {
        top = "141px";
        left = "10px";
    }

    updateIconPositioning();
}
////////////////////////////////////////////////////////////////////////////////
//
// set gadget state to DOCKED
//
////////////////////////////////////////////////////////////////////////////////
function dockedState()
{
    bgImgDockState = "_docked";

    with (document.body.style)
    {
        width = "130px";
        height = "121px";
    }
    notesBg.style.width = "130px";
    notesBg.style.height = "121px";
    notesBg.src = "url(images/sticky_" + curColor + bgImgDockState + ".png)";
    
    with (noteArea.style)
    {
        top = "12px";
        left = "11px";
        width = "102px";
        height = "65px";
        fontSize = curSizeDocked + "px";
    }
    
    with (leftArrow.style)
    {
        top = "83px";
        left = "29px";
    }
    
    with (pageWell.style)
    {
        top = "81px";
        height = "20px";
        width = "129px";
    }
    
    with (rightArrow.style)
    {
        top = "83px";
        left = "83px";
    }
    
    with (plusIcon.style)
    {
        top = "83px";
        left = "104px";
    }
    
    with (deleteIcon.style)
    {
        top = "84px";
        left = "8px";
    }
    
    updateIconPositioning(true);
}
////////////////////////////////////////////////////////////////////////////////
//
// reload main after settings page closed
//
////////////////////////////////////////////////////////////////////////////////
function settingsClosed(event)
{
    if (event.closeAction == event.Action.commit)
    {
        loadMain();
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function writeSettings(color, font, sizeDocked, sizeUndocked)
{
    System.Gadget.Settings.write("SettingsExist", true);
    
    if (color)
    {
        System.Gadget.Settings.writeString("ColorSaved", color);
    }
    
    if (font)
    {
        System.Gadget.Settings.writeString("FontSaved", font);
    }

    if (sizeDocked)
    {
        System.Gadget.Settings.write("SizeDockedSaved", sizeDocked);
    }
    
    if (sizeUndocked)
    {
        System.Gadget.Settings.write("SizeUndockedSaved", sizeUndocked);
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// set new settings
//
////////////////////////////////////////////////////////////////////////////////
function setSettings(noteId)
{
    gadgetArray[noteId].oNoteText = gadgetArray[noteId].oNoteText.toString().substring(0, maxNoteSize);
    
    System.Gadget.Settings.writeString(noteId, gadgetArray[noteId].oNoteText);
    System.Gadget.Settings.write("NoteCount", gadgetArray.length);
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function getSettings(noteId)
{   
    return System.Gadget.Settings.readString(noteId);
}
////////////////////////////////////////////////////////////////////////////////
//
// set new images based on color
//
////////////////////////////////////////////////////////////////////////////////
function setImages(setColor)
{
    curColor = setColor;
    notesBg.src = "url(images/sticky_" + setColor + bgImgDockState + ".png)";
}
////////////////////////////////////////////////////////////////////////////////
//
// update images based on state
//
////////////////////////////////////////////////////////////////////////////////
function updateImage(objImage, action, state)
{
    if (pageDir == "rtl")
    {
        if (action == "left")
        {
            action = "right";
        }
        else if (action == "right")
        {
            action = "left";
        }
    }
    
    if (objImage.src.indexOf("disabled") == -1)
    {
        objImage.src = "images/sticky_" + action + "_" + state + ".png";
    }
    
    if (state == "pressed")
    {
        imagePressed = true;
    }
    else
    {
        imagePressed = false;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// update tab index
//
////////////////////////////////////////////////////////////////////////////////
function updateTabIndex(objImage)
{
    if (!imagePressed)
    {
        var controlArray = new Array(noteArea, deleteIcon, leftArrow, rightArrow, plusIcon);

        if (objImage.src.indexOf("disabled") != -1)
        {
            var index = -1;
            
            for (var i = 0; i < controlArray.length; i++)
            {
                if (objImage == controlArray[i])
                {
                    index = i;
                    break;
                }
            }
            
            if (index != -1)
            {
                do
                {
                    index++;
                    
                    if (index == controlArray.length)
                    {
                        index = 0;
                    }
                }
                while (controlArray[index].disabled)
                
                controlArray[index].focus();
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// add a new note
//
////////////////////////////////////////////////////////////////////////////////
function addNote(bKeyPress)
{
    if (bKeyPress && event.keyCode != 32)
    {
        return;
    }

    if (gadgetArray.length < maxNumberNotes)
    {
        if (gadgetArray.length > 0)
        {
            saveText();
        }

        if (initFlag)
        {
            lastId++;
            totalId++
        }
        
        gadgetArray.push(new setNote());
        noteArea.innerText = "";
        
        var displayCount;
        
        if (curId == 0)
        {
            displayCount = 1;
        }
        else
        {
            displayCount = curId + 1;
        }

        curId = gadgetArray.length - 1;

        pageText.innerHTML = gadgetArray.length + " " + pageSeparator + " " + gadgetArray.length;
        
        initFlag = true;

        checkImageState();
        setSettings(curId);

        System.Gadget.Settings.write("SettingsExist", true);
        System.Gadget.Settings.write("NoteState", curId);

        if (gadgetArray.length == maxNumberNotes)
        {
            setAddIcon("disabled");
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// enable/disable note controls
//
////////////////////////////////////////////////////////////////////////////////
function enableControls(bVisible, bOverride)
{
    if (!bVisible && !bOverride && (bodyFocus || textAreaFocus || areaFocus))
    {
        return;
    }

    with (leftArrow)
    {
        if (bVisible && gadgetArray.length > 1)
        {
            style.visibility = "visible";
            disabled = false;
        }
        else
        {
            style.visibility = "hidden";
            disabled = true;
        }
    }
    
    with (rightArrow)
    {
        if (bVisible && gadgetArray.length > 1)
        {
            style.visibility = "visible";
            disabled = false;
        }
        else
        {
            style.visibility = "hidden";
            disabled = true;
        }
    }
        
    with (pageWell.style)
    {
        if (bVisible && gadgetArray.length > 1)
        {
            visibility = "visible";
        }
        else
        {
            visibility = "hidden";
        }
    }
    
    if (!bOverride)
    {
        with (plusIcon)
        {
            if (bVisible)
            {
                style.visibility = "visible";
                disabled = false;
            }
            else
            {
                style.visibility = "hidden";
                disabled = true;
            }
        }
        
        with (deleteIcon)
        {
            if (bVisible)
            {
                style.visibility = "visible";
                disabled = false;
            }
            else
            {
                style.visibility = "hidden";
                disabled = true;
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// delete current note
//
////////////////////////////////////////////////////////////////////////////////
function deleteNote(bKeyPress)
{
    if (bKeyPress && event.keyCode != 32)
    {
        return;
    }
    
    System.Gadget.Settings.writeString(gadgetArray.length - 1, "");
    gadgetArray.splice(curId, 1);
    
    for (var i = 0; i < gadgetArray.length; i++)
    {
        System.Gadget.Settings.writeString(i, gadgetArray[i].oNoteText);
    }
    
    if (curId == 0)
    {
        System.Gadget.Settings.write("NoteState", curId);
    }
    else
    {
        System.Gadget.Settings.write("NoteState", curId - 1);
    }
    
    System.Gadget.Settings.write("NoteCount", gadgetArray.length);
    
    setAddIcon("rest");
    setImages(curColor);
    checkImageState();
    loadSaved();
}
////////////////////////////////////////////////////////////////////////////////
//
// update left arrow image
//
////////////////////////////////////////////////////////////////////////////////
function setLeftArrow(stateNow)
{
    var imageDir = "left";
    
    if (pageDir == "rtl")
    {
        imageDir = "right";
    }
    
    leftArrow.src = "images/sticky_" + imageDir + "_" + stateNow + ".png";
    
    if (stateNow == "disabled")
    {
        leftArrow.disabled = true;
    }
    else
    {
        leftArrow.disabled = false;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// update right arrow image
//
////////////////////////////////////////////////////////////////////////////////
function setRightArrow(stateNow)
{
    var imageDir = "right";
    
    if (pageDir == "rtl")
    {
        imageDir = "left";
    }
    
    rightArrow.src = "images/sticky_" + imageDir + "_" + stateNow + ".png";
    
    if (stateNow == "disabled")
    {
        rightArrow.disabled = true;
    }
    else
    {
        rightArrow.disabled = false;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// update add image
//
////////////////////////////////////////////////////////////////////////////////
function setAddIcon(stateNow)
{
    plusIcon.src = "images/sticky_plus_" + stateNow + ".png";
    
    if (stateNow == "disabled")
    {
        plusIcon.disabled = true;
    }
    else
    {
        plusIcon.disabled = false;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// update delete image
//
////////////////////////////////////////////////////////////////////////////////
function setDeleteIcon(stateNow)
{
    deleteIcon.src = "images/sticky_delete_" + stateNow + ".png";
    
    if (stateNow == "disabled")
    {
        deleteIcon.disabled = true;
    }
    else
    {
        deleteIcon.disabled = false;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// create new note
//
////////////////////////////////////////////////////////////////////////////////
function setNote()
{
    this.oId = "";
    this.oNoteText = "";
}
////////////////////////////////////////////////////////////////////////////////
//
// key down handler - test for ESC press
//
////////////////////////////////////////////////////////////////////////////////
function keyDownHandler()
{
    if (event.keyCode == 27)
    {
        noteArea.value = "";
    }
    else
    {
        checkMaxLength();
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// check if current length within max length
//
////////////////////////////////////////////////////////////////////////////////
function checkMaxLength()
{
    if (noteArea.value.length > maxNoteSize)
    {
        noteArea.value = noteArea.value.substring(0, maxNoteSize);
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// ensures pasted text does not exceed max length
//
////////////////////////////////////////////////////////////////////////////////
function checkNote(bCleared)
{
    if ((bCleared || areaCleared != -1) && (curId == areaCleared) && (noteLength == noteArea.length))
    {
        noteLength = noteArea.length;
        setAreaCleared(curId);
        setTimeout("checkNote()", 100);
    }
    else
    {
        saveText();
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// save current note text
//
////////////////////////////////////////////////////////////////////////////////
function saveText()
{
    setAreaCleared(-1);
    checkMaxLength();
    gadgetArray[curId].oNoteText = noteArea.value.toString();
    setSettings(curId);
    
    System.Gadget.Settings.writeString("NoteDir", noteArea.dir);
    
    if (gadgetArray.length == 1 && gadgetArray[0].oNoteText == "")
    {
        setDeleteIcon("disabled");
    }
    else
    {
        setDeleteIcon("rest");
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// get corrected note count
//
////////////////////////////////////////////////////////////////////////////////
function getNoteCount()
{
    var noteCount = 0;
    
    if (parseInt(System.Gadget.Settings.read("NoteCount")) > -1)
    {
        noteCount = parseInt(System.Gadget.Settings.readString("NoteCount"));
    }
    else
    {
        while (getSettings(noteCount) != "" && noteCount < maxNumberNotes)
        {
            noteCount++;
        }
        
        noteCount++;
    }
    
    if (noteCount > maxNumberNotes)
    {
        noteCount = maxNumberNotes;
    }
    
    System.Gadget.Settings.write("NoteCount", noteCount);
    
    return noteCount;
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function setAreaCleared(curClearId)
{
    areaCleared = curClearId;
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function setAreaFocus(bFocus, bBodyFocus, bTextAreaFocus)
{
    if (bFocus != null)
    {
        areaFocus = bFocus;
    }

    if (bBodyFocus != null)
    {
        bodyFocus = bBodyFocus;
    }

    if (bTextAreaFocus != null)
    {
        textAreaFocus = bTextAreaFocus;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function checkImageState()
{
    if (curId > 0)
    {
        setLeftArrow("rest");
    }
    else
    {
        setLeftArrow("disabled");
    }
    
    if (gadgetArray.length > (curId + 1))
    {
        setRightArrow("rest");
    }
    else
    {
        setRightArrow("disabled");
    }
    
    if (gadgetArray.length < maxNumberNotes)
    {
        setAddIcon("rest");
    }
    else
    {
        setAddIcon("disabled");
    }
    
    if (gadgetArray.length > 1)
    {
        setDeleteIcon("rest");
        enableControls(true);
    }
    else
    {
        setDeleteIcon("disabled");
        enableControls(false, true);
    }
    
    noteArea.focus();
}
////////////////////////////////////////////////////////////////////////////////
//
// set note state
//
////////////////////////////////////////////////////////////////////////////////
function noteState()
{
    curId = System.Gadget.Settings.read("NoteState");
    
    if (curId > (curCount - 1))
    {
        curId = curCount - 1;
    }
    
    noteArea.innerText = gadgetArray[curId].oNoteText;
    
    var displayCount = curId + 1;
    
    pageText.innerHTML = displayCount + " " + pageSeparator + " " + gadgetArray.length;
    
    System.Gadget.Settings.write("NoteState", curId);
    
    checkImageState();
}
////////////////////////////////////////////////////////////////////////////////
//
// show next note
//
////////////////////////////////////////////////////////////////////////////////
function nextNote(bKeyPress)
{
    if (bKeyPress && event.keyCode != 32)
    {
        return;
    }
    
    saveText();
    
    if (gadgetArray[curId + 1])
    {
        curId++;

        noteArea.innerText = gadgetArray[curId].oNoteText;
        pageText.innerHTML = (curId + 1) + " " + pageSeparator + " " + gadgetArray.length;
        
        System.Gadget.Settings.write("NoteState", curId);
    }

    checkImageState();
}
////////////////////////////////////////////////////////////////////////////////
//
// show previous note
//
////////////////////////////////////////////////////////////////////////////////
function previousNote(bKeyPress)
{
    if (bKeyPress && event.keyCode != 32)
    {
        return;
    }
    
    saveText();
    
    if (gadgetArray[curId - 1])
    {
        curId--;
        
        noteArea.innerText = gadgetArray[curId].oNoteText;
        pageText.innerHTML = (curId + 1) + " " + pageSeparator + " " + gadgetArray.length;
        
        System.Gadget.Settings.write("NoteState", curId);
    }
    
    checkImageState();
}
////////////////////////////////////////////////////////////////////////////////
//
// scroll text area with mouse wheel
//
////////////////////////////////////////////////////////////////////////////////
function scrollTextArea(oArea)
{
    if (event.wheelDelta > 0)
    {
        oArea.doScroll("scrollbarUp");
    }
    else
    {
        oArea.doScroll("scrollbarDown");
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// reverse icons for RTL
//
////////////////////////////////////////////////////////////////////////////////
function updateIconPositioning(bDocked)
{
    if (pageDir == "rtl")
    {
        var temp = parseInt(plusIcon.style.left);

        with (plusIcon.style)
        {
            left = deleteIcon.style.left;
            top = (parseInt(top) + 1) + "px";
        }

        with (deleteIcon.style)
        {
            left = (temp + 1) + "px";
            top = (parseInt(top) - 1) + "px";
        }
        
        temp = parseInt(leftArrow.style.left);
        
        with (leftArrow.style)
        {
            left = parseInt(rightArrow.style.left) + "px";
            
            if (bDocked)
            {
                left = (parseInt(left) + 1) + "px";
            }
        }
        
        with (rightArrow.style)
        {
            left = temp + "px";
            
            if (bDocked)
            {
                left = (parseInt(left) + 1) + "px";
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function getValidSetting(setting, objArray, index)
{
    if (setting != null)
    {
        for (var i = 0; i < objArray.length; i++)
        {
            if (setting == objArray[i])
            {
                index = i;
                break;
            }
        }
    }
    
    return objArray[index];
}
