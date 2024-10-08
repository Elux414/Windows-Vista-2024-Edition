////////////////////////////////////////////////////////////////////////////////
//
//  THIS CODE IS NOT APPROVED FOR USE IN/ON ANY OTHER UI ELEMENT OR PRODUCT COMPONENT.
//  Copyright (c) 2006 Microsoft Corporation.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
var maxImage = 11;
var pageDir;

var L_PREVIOUS_Text = "Назад";
var L_NEXT_Text = "Далее";

//container to my settings
var mySettings = new picturePuzzleSettings();

////////////////////////////////////////////////////////////////////////////////
//
// Load main settings function
//
////////////////////////////////////////////////////////////////////////////////
function loadSettings()
{    
    //restore values to current setting
    mySettings.load();
    
    // Check direction
    pageDir = document.getElementsByTagName("html")[0].dir;
    
    if (pageDir == "rtl")
    {
        buttonTable.dir = "rtl";
        
        var temp = buttonLeftCell.innerHTML;
        buttonLeftCell.innerHTML = buttonRightCell.innerHTML;
        buttonRightCell.innerHTML = temp;
        
        temp = buttonLeft.onmousedown;
        buttonLeft.onmousedown = buttonRight.onmousedown;
        buttonRight.onmousedown = temp;
        
        temp = buttonLeftAnchor.onkeydown;
        buttonLeftAnchor.onkeydown = buttonRightAnchor.onkeydown;
        buttonRightAnchor.onkeydown = temp;

        buttonLeft.alt = L_NEXT_Text;
        buttonRight.alt = L_PREVIOUS_Text;
    }
    else
    {
        buttonLeft.alt = L_PREVIOUS_Text;
        buttonRight.alt = L_NEXT_Text;
    }

    updateImage(mySettings.imageID);

    System.Gadget.onSettingsClosing = settingsClosing;
    
    self.focus;document.body.focus();
}
////////////////////////////////////////////////////////////////////////////////
//
// Update selected image
//
////////////////////////////////////////////////////////////////////////////////
function updateImage(imageID)
{
    imgTheme.src = "images/" + imageID + ".png";
    currentIndex.innerHTML = imageID;
    maxIndex.innerHTML = maxImage;
}
////////////////////////////////////////////////////////////////////////////////
//
// OK/Cancel closing event conditions
//
////////////////////////////////////////////////////////////////////////////////
function settingsClosing(event)
{
    if (event.closeAction == event.Action.commit)
    {
        mySettings.save();
    }
    
    event.cancel = false;
}
////////////////////////////////////////////////////////////////////////////////
//
// Calls to the save and load settings functions
//
////////////////////////////////////////////////////////////////////////////////
function picturePuzzleSettings()
{   
    this.imageID = 1;
    this.save = saveSettingToDisk;
    this.load = loadSettingFromDisk;
}
////////////////////////////////////////////////////////////////////////////////
//
// Load setting information from disk if exists
//
////////////////////////////////////////////////////////////////////////////////
function loadSettingFromDisk()
{
    if (System.Gadget.Settings.read("SettingExist") == true) 
    {
        mySettings.imageID = System.Gadget.Settings.read("imageID");
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// Save settings
//
////////////////////////////////////////////////////////////////////////////////
function saveSettingToDisk()
{
    System.Gadget.Settings.write("imageID", mySettings.imageID);
    System.Gadget.Settings.write("SettingExist", true);
}
////////////////////////////////////////////////////////////////////////////////
//
// Select left arrow
//
////////////////////////////////////////////////////////////////////////////////
function buttonBack()
{
    if ((event.keyCode && event.keyCode != 32) || (event.button == 2))
    {
        return false;
    }
    
    if (mySettings.imageID > 1)
    {
        mySettings.imageID = mySettings.imageID - 1;
    }
    else
    {
        mySettings.imageID = maxImage;
    }
    updateImage(mySettings.imageID);
}
////////////////////////////////////////////////////////////////////////////////
//
// Select right arrow
//
////////////////////////////////////////////////////////////////////////////////
function buttonForward()
{
    if ((event.keyCode && event.keyCode != 32) || (event.button == 2))
    {
        return false;
    }
    
    if (mySettings.imageID < maxImage)
    {
        mySettings.imageID = mySettings.imageID + 1;
    }
    else
    {
        mySettings.imageID = 1;
    }
    
    updateImage(mySettings.imageID);
}
////////////////////////////////////////////////////////////////////////////////
//
// Swap images for arrow button mouse events
//
////////////////////////////////////////////////////////////////////////////////
function swapImage(img, state)
{
    img.src = "images/settings_" + img.src.split("_")[1] + "_" + state + ".png";
}
