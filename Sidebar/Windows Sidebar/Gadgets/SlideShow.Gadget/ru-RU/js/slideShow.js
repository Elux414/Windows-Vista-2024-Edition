////////////////////////////////////////////////////////////////////////////////
//
//  THIS CODE IS NOT APPROVED FOR USE IN/ON ANY OTHER UI ELEMENT OR PRODUCT COMPONENT.
//  Copyright (c) 2006 Microsoft Corporation.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
var L_NONE_TEXT         = "Нет";
var L_BARN_TEXT         = "Амбар";
var L_BLINDS_TEXT       = "Жалюзи";
var L_CHECKERBOARD_TEXT = "Шахматная доска";
var L_DISSOLVE_TEXT     = "Растворение";
var L_FADE_TEXT         = "Угасание";
var L_INSET_TEXT        = "Вовнутрь";
var L_PLUS_TEXT         = "Плюс";
var L_PIXELATE_TEXT     = "Точечное";
var L_RADIALWIPE_TEXT   = "Лучевое стирание";
var L_SLIDE_TEXT        = "Слайд";
var L_SPIRAL_TEXT       = "Виток";
var L_STRETCH_TEXT      = "Растянуть";
var L_WIPE_TEXT         = "Стирание";
var L_WHEEL_TEXT        = "Колесо";
var L_PREVIOUS_TEXT     = "Назад";
var L_PLAY_TEXT         = "Воспроизвести";
var L_PAUSE_TEXT        = "Приостановить";
var L_NEXT_TEXT         = "Далее";
var L_VIEW_TEXT         = "Просмотреть";
var L_SECONDS_TEXT      = "сек.";
var L_MINUTES_TEXT      = "мин.";
var L_MINUTE_TEXT       = "мин.";
var L_PICTURESNAME_TEXT = "Образцы изображений";
var L_CHOOSEFOLDER_TEXT	= "Показывать элементы из этой папки во время показа слайдов:";

var pictureArray        = new Array();
var selectArray         = new Array();
var slideTimeArray      = new Array(
                            ["5 " + L_SECONDS_TEXT, 5],
                            ["10 " + L_SECONDS_TEXT, 10],
                            ["15 " + L_SECONDS_TEXT, 15],
                            ["30 " + L_SECONDS_TEXT, 30],
                            ["1 " + L_MINUTE_TEXT, 60],
                            ["2 " + L_MINUTES_TEXT, 120],
                            ["5 " + L_MINUTES_TEXT, 300]);

var fadeEffectName      = new Array(
                            L_BARN_TEXT,
                            L_BLINDS_TEXT,
                            L_CHECKERBOARD_TEXT,
                            L_DISSOLVE_TEXT,
                            L_FADE_TEXT,
                            L_INSET_TEXT,
                            L_PLUS_TEXT,
                            L_PIXELATE_TEXT,
                            L_RADIALWIPE_TEXT,
                            L_SLIDE_TEXT,
                            L_SPIRAL_TEXT,
                            L_STRETCH_TEXT,
                            L_WIPE_TEXT,
                            L_WHEEL_TEXT);

var maxDockedWidth      = 120;
var maxDockedHeight     = 90;
var maxUndockedWidth    = 320;
var maxUndockedHeight   = 240;
var gMaxSecondsToShow   = 300;
var gSecondsToShow      = 15;
var gSlideFadeEffect    = "";
var counter             = 0;
var increment           = 0;
var gFolderCount        = 0;
var gFolderCountMax     = 500;
var gImageCountMax      = 2000;
var gBarShowing         = false;
var timer;
var slideSettings;
var imagePathAndName;
var pictureDetails;
var heightWidthLoad;
var gPlayingFlag;
var gDropDownPos;
var gPageDir; 
var gUndockFlag;
////////////////////////////////////////////////////////////////////////////////
//
// SETTINGS
// load settings - populate form 
//
////////////////////////////////////////////////////////////////////////////////
function BrowseFolder(textBox)
{
    var shellFolder = System.Shell.chooseFolder(L_CHOOSEFOLDER_TEXT, 512);
    if(shellFolder) 
    {   
        selectArray[gDropDownPos] = shellFolder.path
        imagePathSel.value = shellFolder.path;
        dropDownFromBrowse();
        
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function loadSettings()
{  
    counter = 0;                        
    slideSettings = new GetSlideshowSettings();    
    dropDownFromBrowse();
    dropDownForFade();
    gDropDownPos = selectArray.length;
    System.Gadget.onSettingsClosing = SettingsClosing;
    slideShowSpeed.value = slideSettings.secondsToShow;
    fadeEffectNameField.value = slideSettings.slideFadeEffect;
    imagePathSel.value = slideSettings.slideFolder;

                
    if(slideSettings.includeSubDirectories == "checked")
    {
        includeSubDirectories.checked = true;
    }
    if(slideSettings.shuffleImages == "checked")
    {
        shuffleImages.checked = true;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Gadget specific settings
// determine if gadget is in sidebar - docked or on the desktop - undocked
//
////////////////////////////////////////////////////////////////////////////////
function dropDownForFade()
{
    fadeEffectNameField.options[0]=new Option(L_NONE_TEXT, "");
    fadeEffectNameField.options[0].title=L_NONE_TEXT;

    for(var i=0;i<fadeEffectName.length;i++)
    {
        fadeEffectNameField.options[i+1]=new Option(fadeEffectName[i], i);
        fadeEffectNameField.options[i+1].title=fadeEffectName[i];
    }
    
    for(var i=0;i<slideTimeArray.length;i++)
    {
        slideShowSpeed.options[i]=new Option(slideTimeArray[i][0], slideTimeArray[i][1]);
        slideShowSpeed.options[i].title=slideTimeArray[i][0];
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// create dynamic drop downlist from pictures directory
//
////////////////////////////////////////////////////////////////////////////////
function dropDownFromBrowse()
{
    var j=0;
    var startPoint = selectArray.length - 1;
    for(var i = startPoint; i >= 0; i--)
    {
        imagePathSel.options[j] = new Option(selectArray[i], selectArray[i]);
        imagePathSel.options[j].title = selectArray[i];
        j++;
    }
    
    var myPicturesObj = System.Shell.knownFolder("pictures").Self;
    var myPicturesPath = myPicturesObj.path;
    var myPicturesName = myPicturesObj.name;
    imagePathSel.options[selectArray.length] = new Option(myPicturesName, myPicturesPath);
    imagePathSel.options[selectArray.length].title = myPicturesName;
   
    var permanentPath = slideSettings.myPicturesFolder;
    var permanentName = slideSettings.myPicturesName;
    imagePathSel.options[selectArray.length+1] = new Option(permanentName, permanentPath);
    imagePathSel.options[selectArray.length+1].title = permanentName;
}
////////////////////////////////////////////////////////////////////////////////
//
// determine if gadget is visible
//
////////////////////////////////////////////////////////////////////////////////
function checkVisibility()
{
    isVisible = System.Gadget.visible;
    if(gPlayingFlag)
    {
        if (!isVisible)
        {
            clearInterval(timer);
        }
        if(isVisible)
        {
            startTimer(slideSettings.secondsToShow, "playSlides()");
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Gadget specific settings
// determine if gadget is in sidebar - docked or on the desktop - undocked
//
////////////////////////////////////////////////////////////////////////////////
function checkState()
{
    if(!System.Gadget.docked) 
    {
        undockedState();
    } 
    else if (System.Gadget.docked)
    {
        dockedState(); 
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function checkHeightWidth()
{
    if(!System.Gadget.docked) 
    {
        var sHeight = maxUndockedHeight;
        var sWidth = maxUndockedWidth;
        heightWidthLoad = "?width="+maxUndockedWidth+"&height="+maxUndockedHeight;
        var temp = document.createElement("img");
        temp.src = "gimage:///" + encodeURIComponent(imagePathAndName) + heightWidthLoad;
        document.body.appendChild(temp);
        if (temp.width > maxUndockedWidth) 
        {                       
            sHeight = temp.height * maxUndockedWidth/temp.width;            
        }
        else if (temp.height > maxUndockedHeight) 
        {
            sWidth = temp.width * maxUndockedHeight/temp.height;
        }
        if(temp.width > 0 && temp.height > 0 && temp.width < maxUndockedWidth && temp.height < maxUndockedHeight)
        {
        	if (temp.width >= temp.height) //portrait or square
        	{
        		sHeight = "";
        	}
        	if(temp.width <= temp.height) //landscape or square
        	{
        		sWidth =  temp.width * maxUndockedHeight/temp.height;
        	}
        }
        heightWidthLoad = "?width="+sWidth+"&height="+sHeight; 
        document.body.removeChild(document.body.lastChild);     
    } 
    else if (System.Gadget.docked)
    {
        heightWidthLoad = "?width="+maxDockedWidth+"&height="+maxDockedHeight;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// styles for gadget when UNDOCKED
//
////////////////////////////////////////////////////////////////////////////////
function undockedState()
{
    gUndockFlag = true;
    with(document.body.style)
        width=360, 
        height=280;

    with(slideshowBg.style)
        width=360, 
        height=280;
    slideshowBg.src="url(images/on_desktop/slideshow_glass_frame.png)";

    with(bar.style)
        width=112,
        height=23,
        top=220,
        left=119;

    with(pictureFrame.style)
        top=16,left=17,width=320, height=240;
        
    if(imagePathAndName != undefined)
    {  
        scaleImageForDisplay();
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// styles for gadget when DOCKED
// 
////////////////////////////////////////////////////////////////////////////////
function dockedState()
{   
    with(document.body.style)
        width=130,
        height=100;

    with(slideshowBg.style)
        width=130,
        height=100;
    slideshowBg.src="url(Images/in_sidebar/slideshow_glass_frame.png)";

    with(bar.style)
        width=112,
        height=23,
        top=68,
        left=7;

    with(pictureFrame.style)
        top=5,left=4,width=120, height=90;
        
    if(imagePathAndName != undefined)
    {  
        scaleImageForDisplay();
    }        
}
////////////////////////////////////////////////////////////////////////////////
//
// functions/events to do when settings page is about to close
//
////////////////////////////////////////////////////////////////////////////////
function SettingsClosing(event)
{
    if (event.closeAction == event.Action.commit)
    {
        System.Gadget.Settings.write("GadgetViewed","yes");
        SaveSettings();
    }
    else if(event.closeAction == event.Action.cancel)
    {
    }
    event.cancel = false;
}
////////////////////////////////////////////////////////////////////////////////
//
// save the new settings
//
////////////////////////////////////////////////////////////////////////////////
function SaveSettings()
{   
    if(includeSubDirectories.checked)
    {
        slideSettings.includeSubDirectories = "checked";
    }
    else
    {
        slideSettings.includeSubDirectories = "unchecked";
    }
    if(shuffleImages.checked)
    {
        slideSettings.shuffleImages = "checked";
    }
    else
    {
        slideSettings.shuffleImages = "unchecked";
    }
    slideSettings.slideFolder = imagePathSel.value;
    slideSettings.slideFadeEffect = fadeEffectNameField.value;
    slideSettings.secondsToShow = slideShowSpeed.value;   
    SetSlideshowSettings(slideSettings);
}
////////////////////////////////////////////////////////////////////////////////
//
// settings getter
//
////////////////////////////////////////////////////////////////////////////////
function GetSlideshowSettings()
{
    var samplePictPath          = System.Environment.getEnvironmentVariable("Public");
    this.myPicturesFolder       = samplePictPath + "\\Pictures\\Sample Pictures";
    this.myPicturesName         = L_PICTURESNAME_TEXT;
    this.slideFolder            = System.Gadget.Settings.read("Folder");
    this.includeSampleFolder    = System.Gadget.Settings.read("SampleFolder");
    this.includeSubDirectories  = System.Gadget.Settings.read("SubDirectories");
    this.shuffleImages          = System.Gadget.Settings.read("shuffleImages");
    this.slideFadeEffect        = gSlideFadeEffect;
    this.secondsToShow          = gSecondsToShow;
    this.savedPathCount         = System.Gadget.Settings.read("savedPathCount");
    this.gadgetViewed           = System.Gadget.Settings.read("GadgetViewed");
    
    if(this.savedPathCount > 0)
    {
        for(var i = 0; i < this.savedPathCount; i++)
        {
            var pathName = "savedPath"+i;
            selectArray.push(System.Gadget.Settings.read(pathName));
        }
    }
    var fadeEffectNumCheck      = parseInt(System.Gadget.Settings.read("FadeEffect"));
    if(!isNaN(fadeEffectNumCheck))
    {
        if(fadeEffectNumCheck >= 0 && fadeEffectNumCheck < fadeEffectName.length)
        {
            this.slideFadeEffect = fadeEffectNumCheck;
        }
    }
    var secondsNumCheck         = parseInt(System.Gadget.Settings.read("HowOften"));
    if(!isNaN(secondsNumCheck))
    {        
        if(secondsNumCheck >= 0 && secondsNumCheck <= gMaxSecondsToShow)
        {
            this.secondsToShow = secondsNumCheck;
        }
    }
    if (this.slideFolder == "")
    {
        this.slideFolder = this.myPicturesFolder;
    }
    if(this.includeSubDirectories == "")
    {
        this.includeSubDirectories="checked";
    }
    if(this.includeSampleFolder == "")
    {
        this.includeSampleFolder="checked";
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// settings setter
//
////////////////////////////////////////////////////////////////////////////////
function SetSlideshowSettings(settings)
{
    System.Gadget.Settings.write("SampleFolder", settings.includeSampleFolder);
    System.Gadget.Settings.write("SubDirectories", settings.includeSubDirectories);
    System.Gadget.Settings.write("shuffleImages", settings.shuffleImages);
    System.Gadget.Settings.write("Folder", settings.slideFolder);
    System.Gadget.Settings.write("HowOften", settings.secondsToShow);
    System.Gadget.Settings.write("FadeEffect", settings.slideFadeEffect);
    var lastIndex = 0;
    for(var i = 0; i<selectArray.length; i++)
    {
        var pathName = "savedPath" + i;
        System.Gadget.Settings.write(pathName, selectArray[i]);
        lastIndex++;
    }
    System.Gadget.Settings.write("savedPathCount", lastIndex);
}
////////////////////////////////////////////////////////////////////////////////
//
// GADGET FUNCTIONS
//
////////////////////////////////////////////////////////////////////////////////
function loadMain()
{
    checkState();
    System.Gadget.settingsUI = "settings.html";
    System.Gadget.onSettingsClosed = SettingsClosed;
    System.Gadget.onUndock = checkState;
    System.Gadget.onDock = checkState;
    
    // make the navigation bar
    gPageDir = document.getElementsByTagName("html")[0].dir;  
    if (gPageDir == "rtl")
    {
        bar.innerHTML = "next play pause prev - reveal";
    }
    else
    {
        bar.innerHTML = "prev play pause next - reveal";
    }
    makeBar(bar);
    setAltLabels(); 
    bar_play.style.display="none";
    bar_pause.style.display="";

    // clear picture array populate with selected folder and it's sub-directories
    slideSettings = new GetSlideshowSettings();
    imagePathAndName=slideSettings.slideFolder;    
    if(slideSettings.gadgetViewed == "")
    {  
        imagePathAndName = slideSettings.myPicturesFolder + "\\Garden.jpg";
        checkState(); 
        checkHeightWidth();
        picture.src = "gimage:///" + encodeURIComponent(imagePathAndName) + heightWidthLoad; 
        startTimer(15, "loadData()");
    }
    else
    {
        startTimer(.25, "loadData()");
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// GADGET FUNCTIONS
//
////////////////////////////////////////////////////////////////////////////////
function loadData()
{        

    // clear picture array populate with selected folder and it's sub-directories
    makePicList(slideSettings.slideFolder);
    
    // start the slide show
    increment = 0; 
    playSlides();
    gPlayingFlag = true;
    startTimer(slideSettings.secondsToShow, "playSlides()");
    System.Gadget.visibilityChanged = checkVisibility;
}
////////////////////////////////////////////////////////////////////////////////
//
// slideshow's main timer for displaying pictures
//
////////////////////////////////////////////////////////////////////////////////
function startTimer(slideTime, timeFunction) 
{
    clearInterval(timer);
    if(slideTime >= 0)
    {
        if(!isNaN(parseInt(slideSettings.slideFadeEffect)))
        {
            var slideTime = parseInt(slideTime + 1);
        }
        timer = setInterval(timeFunction, slideTime * 1000);
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// creates navigation bar
//
////////////////////////////////////////////////////////////////////////////////
function makeBar(controlsString)
{
    var controlsArray=controlsString.innerText.split(" ");
    var controlName;
    var newImageToAdd;
    var newLabelToAdd;
    var labelsForRollovers = "";
    var imageRollovers = "<div id='backBar'></div><div id='topBar'>";
    var i=0;
    while(controlName=controlsArray[i++])
    {
        var controlNameAction = controlName;
        if(gPageDir == "rtl")
        {
            if (controlName == "next")
            {
                controlNameAction = "prev";
            }
            if(controlName == "prev")
            {
                controlNameAction = "next";
            }
        }
        if (controlName=="-")
        {
            newImageToAdd = "";
        }
        else
        {
            newImageToAdd = "<a id='link_" + controlNameAction + "' href='javascript:void(0);' onClick='this.blur();'>"
                + "<img border=0 id='bar_" + controlNameAction + "' hspace='3' src='images/"+controlName+"_rest.png' "
                + "onMouseOver='src=\"images/" + controlName + "_hov.png\"' onMouseOut='src=\"images/" + controlName + "_rest.png\"' "
                + "onMouseDown='src=\"images/" + controlName + "_down.png\"' onMouseUp='src=\"images/" + controlName + "_hov.png\";"
                + "onAction(\"" + controlNameAction + "\");' \>"
                + "</a>";
            newLabelToAdd = "<label for='link_"+controlName+"'>"+controlName+"</label>";
        }
        imageRollovers += newImageToAdd;
        labelsForRollovers += newLabelToAdd;
    }
    imageRollovers += "</div>";
    controlsString.innerHTML=imageRollovers;
    labelHolder.innerHTML=labelsForRollovers;    
    if (gPageDir == "rtl")
    {
        backBar.style.filter="flipH()";
        bar_reveal.style.marginRight = "5px";
        topBar.style.left = "-5px";
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// set's alt tabs for navigation;
//
////////////////////////////////////////////////////////////////////////////////
function setAltLabels()
{
    bar_prev.setAttribute("alt",L_PREVIOUS_TEXT);
    bar_play.setAttribute("alt",L_PLAY_TEXT);
    bar_pause.setAttribute("alt",L_PAUSE_TEXT);
    bar_next.setAttribute("alt",L_NEXT_TEXT);
    bar_reveal.setAttribute("alt",L_VIEW_TEXT);
}
////////////////////////////////////////////////////////////////////////////////
//
// navigation controls
//
////////////////////////////////////////////////////////////////////////////////
function onAction(action)
{
    if (event.button == 2 || event.button == 3)
    {
        return false
    }
    else
    {
        var flagPlay = false;
        switch(action)
        {
            case "prev":
                if (bar_play.style.display == "")
                {
                    bar_play.style.display="none";
                    bar_pause.style.display="";
                }
                increment = increment - 2;
                startTimer(slideSettings.secondsToShow, "playSlides()")
                flagPlay = true;
                gPlayingFlag = true;
                break;
            case "play":
                bar_play.style.display="none";
                bar_pause.style.display="";
                startTimer(slideSettings.secondsToShow, "playSlides()")
                flagPlay = true;
                gPlayingFlag = true;
                break;
            case "pause":
                clearInterval(timer);
                bar_play.style.display="";
                bar_pause.style.display="none";
                gPlayingFlag = false ;
                break; 
            case "next":
                if (bar_play.style.display == "")
                {
                    bar_play.style.display="none";
                    bar_pause.style.display="";
                }
                startTimer(slideSettings.secondsToShow, "playSlides()")
                flagPlay = true;
                gPlayingFlag = true;
                break;
            case "reveal":
                System.Shell.execute(imagePathAndName);
                break;
       }
    }
    if(flagPlay)
    {
        playSlides();
        startTimer(slideSettings.secondsToShow, "playSlides()");
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// picture list creator controller
//
////////////////////////////////////////////////////////////////////////////////
function makePicList(curFolderPath)
{   
    pictureArray.splice(0,pictureArray.length);
    gFolderCount = 0;
    addToPicList(curFolderPath);
    if(slideSettings.shuffleImages == "checked")
    {
        pictureArray.sort(randomSort);
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Sort Function
//
////////////////////////////////////////////////////////////////////////////////
function randomSort()
{
    return Math.random() - 0.5;
}
////////////////////////////////////////////////////////////////////////////////
//
// picture list creator
//
////////////////////////////////////////////////////////////////////////////////
function addToPicList(curFolderPath)
{   
    try
    {
        var curFolderObject = System.Shell.itemFromPath(curFolderPath); 
    }
    catch(e)
    {
        return null;
    }
    var curImageItemsFromPath = curFolderObject.SHFolder.Items;
    if(curFolderObject.type != "Compressed (zipped) Folder")
    {
        var pictureLimit = curImageItemsFromPath.count;
        if(pictureLimit > gImageCountMax)
        {
            pictureLimit = gImageCountMax;
        }
        for(var i=0;i<pictureLimit;i++)
        {
            var curImagePath                = curImageItemsFromPath.item(i).path;
            var curImageIsLink              = curImageItemsFromPath.item(i).isLink;
            var curImageIsFolder            = curImageItemsFromPath.item(i).isFolder;
            var imageNameArray              = new Array(".jpg", ".jpeg", ".jpe", ".gif", ".png", ".bmp");  
            if(!curImageIsFolder)
            {
                var flagFoundImageType = false;                
                var curImageExtension = curImagePath.substr(curImagePath.lastIndexOf("."));
                if(curImageExtension)
                {
                    curImageExtension = curImageExtension.toLowerCase();
                }
                for(var j=0;j<imageNameArray.length;j++)
                {
                    var tempNameFromArray = imageNameArray[j];
                    if (curImageExtension == tempNameFromArray)
                    {   
                        flagFoundImageType = true;
                        break;
                    }
                }
                if(flagFoundImageType)
                {
                    pictureArray.push(curImagePath);
                }
            }
        }
        if(slideSettings.includeSubDirectories == "checked" && gFolderCount <= gFolderCountMax)
        {
            for(var i=0;i<curImageItemsFromPath.count;i++)
            {
                var curImagePath                = curImageItemsFromPath.item(i).path;
                var curImageIsFolder            = curImageItemsFromPath.item(i).isFolder;
                if(curImageIsFolder)
                {   
                    gFolderCount++
                    addToPicList(curImagePath);
                }
            }
        }
        
    }
    curFolderObject = null;
    return null;
}
////////////////////////////////////////////////////////////////////////////////
//
// picture display
//
////////////////////////////////////////////////////////////////////////////////
function playSlides()
{
    var retry = true;
    var remadeList = false;
    
    while(retry)
    {
        if (increment >= pictureArray.length)
        {
            if (!remadeList)
            {
                makePicList(slideSettings.slideFolder);
                increment = 0;
                remadeList = true;
            }
            else
            {
                pictureArray.splice(0, pictureArray.length);
            }
        }
        else if(increment < 0)
        {
            if (!remadeList)
            {
                makePicList(slideSettings.slideFolder);
                increment = pictureArray.length - 1;
                remadeList = true;
            }
            else
            {
                pictureArray.splice(0, pictureArray.length);
            }
        }

        if(pictureArray.length > 0)
        {
            imagePathAndName = pictureArray[increment];
            try
            {
                System.Shell.itemFromPath(imagePathAndName);
                increment++;
                retry = false;
            }
            catch(e)
            {
                pictureArray.splice(increment, 1);
                retry = true;
                continue;
            }
        }
        else
        {
            imagePathAndName = System.Gadget.path+"\\images\\Garden.jpg";
            loadSlide(false);
            retry = false;
            break;
        }

        try
        {
            loadSlide(true);
            retry = false;
            break;
        }
        catch(e)
        {
            increment--;    // undo ++ from above
            pictureArray.splice(increment, 1);
            retry = true;
            continue;
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// load picture
//
////////////////////////////////////////////////////////////////////////////////
function loadSlide(transFlag)
{
    var picToGet = imagePathAndName;
    if(transFlag)
    {
        scaleImageForDisplay()
    }
    else
    {
        checkState(); 
        checkHeightWidth();
        picture.src = "gimage:///" + encodeURIComponent(picToGet)+heightWidthLoad;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// scale picture
//
////////////////////////////////////////////////////////////////////////////////
function scaleImageForDisplay()
{        
        if(isNaN(parseInt(slideSettings.slideFadeEffect)) || gUndockFlag)
        {  
            checkHeightWidth();
            picture.src = "gimage:///" + encodeURIComponent(imagePathAndName) + heightWidthLoad; 
            gUndockFlag = false;
        }
        else
        {
            pictureFrame.filters(slideSettings.slideFadeEffect).Apply();  
            checkHeightWidth();  
            picture.src = "gimage:///" + encodeURIComponent(imagePathAndName) + heightWidthLoad;      
            pictureFrame.filters(slideSettings.slideFadeEffect).Play();         
       }
       
}

////////////////////////////////////////////////////////////////////////////////
//
// show navigation bar with fade-in
//
////////////////////////////////////////////////////////////////////////////////
function showBar()
{
    if(event.fromElement)
    {
        return;
    }
    clearTimeout(bar.timer);
    up();
}
////////////////////////////////////////////////////////////////////////////////
//
// hide navigation bar with fade-out
//
////////////////////////////////////////////////////////////////////////////////
function hideBar()
{
    if(event.toElement)
    {
        return;
    }
    clearTimeout(bar.timer);
    down();
    bar.blur();
} 
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////      
function up()
{
    with(bar.filters("alpha"))
    {
        if((opacity+=15)<75)
        {
            bar.timer=setTimeout(up,25);
        }
        else
        {
            opacity=75;
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////    
function down()
{
    with(bar.filters("alpha"))
    {
        if((opacity-=15)>0)
        {
            bar.timer=setTimeout(down,25);
        }
        else
        {
            opacity=0;
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function keyNavigate()
{       
    switch(event.keyCode)
    {
        case 37:
        case 100:
            onAction("prev");
            break;
        case 39:
        case 102:
            onAction("next");
            break;
        case 32: 
        case 13:
            if(event.srcElement.id == "link_reveal")
            {
                onAction("reveal");
            }
            else if(event.srcElement.id == "link_next")
            {
                onAction("next");
            }
            else if(event.srcElement.id == "link_prev")
            {
                onAction("prev");
            }
            else
            {
                checkPlayingState();
            }
            break;
        case 9:
            showBar();
            break;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function checkPlayingState()
{ 
    if(gPlayingFlag)
    {
        onAction("pause");
        gPlayingFlag = false;
    }
    else
    {
        onAction("play");
        gPlayingFlag = true;
    }
}












