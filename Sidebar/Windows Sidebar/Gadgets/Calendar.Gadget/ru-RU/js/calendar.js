////////////////////////////////////////////////////////////////////////////////
//
//  THIS CODE IS NOT APPROVED FOR USE IN/ON ANY OTHER UI ELEMENT OR PRODUCT COMPONENT.
//  Copyright (c) 2006 Microsoft Corporation.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

 
 var L_PREVIOUS_text = "Назад";
 var L_NEXT_text = "Далее";
 var g_filter = 1;
 var g_todayView = true;
 var g_calendar_top_margin_unDocked = 20;
 var g_calendar_top_margin_docked = 20;
 var g_dayView_monthHdr = 5;
 var g_dayView_dayOfWeekHdr = 90;
 var g_calendar_date = new Date().toDateString();
 var g_initDate = new Date().toDateString();
 var g_defaultView = "";
 var g_defaultDOW = "";
 var gView = "month";
 var g_curl_img = null;
 var g_curl_hitRegion = null;
 var g_day_view = null;
 var BIDI = "";
 var temp;
 var g_calendarAlarm = null;
 var g_mySettings = new calendarSettings();
 var g_monthYearLayout = "";
 var loc = new locClass();
 var g_userLanguage = "";
 
  
////////////////////////////////////////////////////////////////////////////////
//
// Initialize
//
////////////////////////////////////////////////////////////////////////////////
BIDI = document.getElementsByTagName("HTML")(0).dir;

if (BIDI == "rtl" || BIDI == "RTL")
{
    temp = L_PREVIOUS_text;
    
    L_PREVIOUS_text = L_NEXT_text;
    L_NEXT_text = temp;
    
    BIDI = "rtl";
}
else
{
    BIDI = "ltr";
}

btnPrevious.alt = L_PREVIOUS_text;
btnNext.alt     = L_NEXT_text;

g_mySettings.loadSettings();

loc.load();

setCalendarAlarm(true);

System.Gadget.visibilityChanged=checkVisibility;
System.Gadget.onDock=Dock;
System.Gadget.onUndock=unDock;
window.onload = System.Gadget.docked ? Dock : unDock;


////////////////////////////////////////////////////////////////////////////////
//
// Calendar Object
//
////////////////////////////////////////////////////////////////////////////////
function locClass()
{
    this.load = function()
    {
        this.day=
        {
            first: null,
            short: null,
            long : null,
            dayofweek: null
        };
        this.month=
        {
            short: null,
            long : null
        };
    };
    
    this.parseNode = function(xmlStr, nloc)
    {
        var dayStr = nloc.selectSingleNode(xmlStr);
        
        if (dayStr)
        {
            return dayStr.text.split(";");
        }
        else
        {
            return [];
        }
    };
}
////////////////////////////////////////////////////////////////////////////////
//
// Initialize calendar to user locale settings
//
////////////////////////////////////////////////////////////////////////////////
function reLoad()
{         
    clearTimeout(g_calendarAlarm);
    setCalendarAlarm(true);
    
    if (g_userLanguage != navigator.userLanguage )
    {  
        g_userLanguage = navigator.userLanguage;
        
        vbsSetLocale("");
        
        loc.day.first = vbsFirstDayOfWeek()-1;
        
        if (loc.day.short != null)
        {
            loc.day.short.splice();
            loc.day.long.splice();
            loc.month.short.splice();
            loc.month.long.splice();
        }
        
        loc.day.short = buildWeekDayNameShort();
        loc.day.long = buildWeekDayNameLong();
        loc.month.short = buildMonthNameShort();
        loc.month.long = buildMonthNameLong();
        
        loc.day.dayofweek = null;
        
        var nloc = xloc.documentElement.selectSingleNode("lang[@id='"+g_userLanguage.toLowerCase()+"']");
        
        if (nloc)
        {
            loc.day.dayofweek = loc.parseNode("day/@dayofweek", nloc);
        }
        
        setYearBeforeMonthFlag();   
    }
} 

////////////////////////////////////////////////////////////////////////////////
//
// Initialize Year before Month flag
//
////////////////////////////////////////////////////////////////////////////////
function setYearBeforeMonthFlag()
{
   var testDate = new Date("january 25, 1999").toLocaleString();
    
   if (testDate.indexOf("25") < testDate.indexOf("99") )
   {
        g_monthYearLayout = "MM YY";
   }
   else
   {
        g_monthYearLayout = "YY MM";
   }
}

////////////////////////////////////////////////////////////////////////////////
//
// Initialize Long Name Day of Week Array
//
////////////////////////////////////////////////////////////////////////////////
function buildWeekDayNameLong()
{
    var arr = [];
    for (var i = 0 ; i < 7 ; i++)
    {
        arr[i] = vbsWeekDayNameLong(i+1);
    }   
    return arr;
}
////////////////////////////////////////////////////////////////////////////////
//
// Initialize Short Name Day of Week Array
//
////////////////////////////////////////////////////////////////////////////////
function buildWeekDayNameShort()
{
    var arr = [];
    for (var i = 0 ; i < 7 ; i++)
    {
        arr[i] = vbsWeekDayNameShort(i+1,true);
    }   
    return arr;
}
////////////////////////////////////////////////////////////////////////////////
//
// Initialize Short Month Name Array
//
////////////////////////////////////////////////////////////////////////////////
function buildMonthNameShort()
{
    var arr = [];
    
    setYearBeforeMonthFlag();
    
    for (var i = 0 ; i < 12 ; i++)
    {
        arr[i] = vbsMonthNameShort(i+1,true);
    }   
    return arr;
}
////////////////////////////////////////////////////////////////////////////////
//
// Initialize Long Month Name Array
//
////////////////////////////////////////////////////////////////////////////////
function buildMonthNameLong()
{
    var arr = [];
    for (var i = 0 ; i < 12 ; i++)
    {
        arr[i] = vbsMonthNameLong(i+1);
    }   
    return arr;
}         
                
////////////////////////////////////////////////////////////////////////////////
//
// Settings object
//
////////////////////////////////////////////////////////////////////////////////
function calendarSettings()
{
    this.dockedCalendarView       = System.Gadget.Settings.read("dockedCalendarView");
    this.dockedCalendarDivType    = System.Gadget.Settings.read("dockedCalendarDivType");
    this.unDockedCalendarView     = System.Gadget.Settings.read("unDockedCalendarView");
    
////////////////////////////////////////////////////////////////////////////////    
    this.save = function(dockedCalendarView, dockedCalendarDivType)
    {
        if (dockedCalendarDivType == "reset")
        {
            dockedCalendarDivType = "year";
        }
        
        if (dockedCalendarView == "" || dockedCalendarView == "curlDocked" )
        {
            dockedCalendarView = "DAY_DOCKED";
            dockedCalendarDivType = "dow";
        }   
          
        System.Gadget.Settings.write("dockedCalendarView", dockedCalendarView );
        System.Gadget.Settings.write("dockedCalendarDivType", dockedCalendarDivType );
        this.dockedCalendarView  = dockedCalendarView;
        this.dockedCalendarDivType = dockedCalendarDivType;
    }
////////////////////////////////////////////////////////////////////////////////      
    this.saveUnDocked = function(unDockedCalendarView)
    {
        if (unDockedCalendarView != "MONTH_UNDOCKED" )
        {
            unDockedCalendarView = "MONTH_UNDOCKED";
        } 
        System.Gadget.Settings.write("unDockedCalendarView", unDockedCalendarView );
        this.unDockedCalendarView  = unDockedCalendarView;   
    }
////////////////////////////////////////////////////////////////////////////////    
    this.loadSettings = function()
    { 
        this.dockedCalendarView     = System.Gadget.Settings.read("dockedCalendarView");
        this.dockedCalendarDivType  = System.Gadget.Settings.read("dockedCalendarDivType"); 
        this.unDockedCalendarView   = System.Gadget.Settings.read("unDockedCalendarView");
      
        if (this.dockedCalendarView == "")
        {
            this.save("DAY_DOCKED","dow");
        }  
        
        if (this.unDockedCalendarView == "")
        {
            this.saveUnDocked("MONTH_UNDOCKED");
        }               
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// determine if gadget is visible
//
////////////////////////////////////////////////////////////////////////////////
function checkVisibility()
{
    var isVisible = System.Gadget.visible;
    var now = new Date().toDateString();
    var initDtd = new Date(g_initDate).toDateString();

    if (g_userLanguage != navigator.userLanguage)
    {
        if ( System.Gadget.docked )
        {
            Dock();
        }
        else
        {
            unDock();
        }
    } 
 
    if (! isVisible)
    {
        clearTimeout(g_calendarAlarm);
    }
        
    if (isVisible)
    {
        setCalendarAlarm(false);
    }
}
////////////////////////////////////////////////////////////////////////////////
//
// 
//
////////////////////////////////////////////////////////////////////////////////
function setCalendarAlarm(isFirstPass)
{
    var now = new Date();
    var delta = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    var MilliSecondsPerDay = (24 * 60 * 60 * 1000);
    var today = null;
    var now = new Date();
    
    hours = now.getHours();
    minutes = now.getMinutes();
    seconds = now.getSeconds();
    
    delta = MilliSecondsPerDay - (hours * 60 * 60 * 1000) - (minutes * 60 * 1000) - (seconds * 1000);
       
    g_calendar_date = now.toDateString();
    
    if (! isFirstPass)
    {
        if ( System.Gadget.docked )
        {
            today=new Date(DAY_DOCKED.d);
            if (today.toDateString() != DAY_DOCKED.d)
                today.setDate(today.getDate()+1);
            isToday=today.toDateString()==new Date().toDateString();
            
            if (isToday || today.toDateString()==new Date(now.getYear(),now.getMonth(),now.getDate()-1).toDateString() )
            {
                    g_initDate = DAY_DOCKED.d = new Date().toDateString();
                    Calendar(DAY_DOCKED).day.initDay(new Date());                  
            }
            
            Dock();
        }
        else
        {
            today=new Date(DAY_UNDOCKED.d);
            if (today.toDateString() != DAY_UNDOCKED.d)
                today.setDate(today.getDate()+1);
            isToday=today.toDateString()==new Date().toDateString();
             
            if (isToday || today.toDateString()==new Date(now.getYear(),now.getMonth(),now.getDate()-1).toDateString() )
            {
                    g_initDate = DAY_UNDOCKED.d = new Date().toDateString();
                    Calendar(DAY_UNDOCKED).day.initDay(new Date());                  
            }
                    
            unDock();
        }
    }
    
    g_calendarAlarm = setTimeout('setCalendarAlarm(false)',delta);  
}
////////////////////////////////////////////////////////////////////////////////
//
// 
//
////////////////////////////////////////////////////////////////////////////////
function swapBackgrounds()
{
    divPrevNext.style.visibility = "visible";
   
    with(document.body.style)
        backgroundImage="url(images/calendar_single.png)";             
}
////////////////////////////////////////////////////////////////////////////////
//
// Docked
//
////////////////////////////////////////////////////////////////////////////////
function Dock(){
    reLoad();
    docked.style.display = "none";
    unDocked.style.display = "none"; 
    gView = "month";
    g_curl_img = curlDocked;
    g_curl_hitRegion = dockedHitRegion;
    
    g_day_view = DAY_DOCKED;

    divPrevNext.className = "prevnext";     
      

    with(document.body.style)
        width=130,
        height=141,
        backgroundRepeat="no-repeat",
        backgroundImage = checkBackground();

    var today = new Date(g_initDate);
    if (today.toDateString() != g_initDate)
        today.setDate(today.getDate()+1)
    Calendar(YEAR_DOCKED).year.initYear(today);
    Calendar(MONTH_DOCKED).month.initMonth(today);
    Calendar(DAY_DOCKED).day.initDay(today);

    MONTH_DOCKED.style.visibility   = "hidden";
    DAY_DOCKED.style.visibility     = "hidden";
    YEAR_DOCKED.style.visibility    = "hidden";
    divPrevNext.style.visibility    = "hidden";
    g_mySettings.loadSettings();
    
    eval( g_mySettings.dockedCalendarView + ".divType = g_mySettings.dockedCalendarDivType");
    swap( eval( g_mySettings.dockedCalendarView ) );
    
    docked.style.display = "";
    g_mySettings.saveUnDocked("");
};
////////////////////////////////////////////////////////////////////////////////
//
//  UnDock
//
////////////////////////////////////////////////////////////////////////////////
function unDock()
{
    reLoad();
    docked.style.display = "none";
    g_curl_img = curlUnDocked;
    g_curl_hitRegion = unDockedHitRegion;
    g_day_view = DAY_UNDOCKED;
    gView = "month";
    tID.divType = "year";
  
    
    with(document.body.style)
       width=129,
       height=264, 
       backgroundImage = checkBackground(); 
    
    divPrevNext.className = "prevnext_unDocked";
    divPrevNext.style.visibility = "hidden";

    var today = new Date(g_initDate);
    if (today.toDateString() != g_initDate)
        today.setDate(today.getDate()+1)
    Calendar(YEAR_UNDOCKED).year.initYear(today);
    Calendar(MONTH_UNDOCKED).month.initMonth(today);
    Calendar(DAY_UNDOCKED).day.initDay(today);
    
    MONTH_UNDOCKED.style.visibility   = "hidden";
    YEAR_UNDOCKED.style.visibility    = "hidden";
    
    swap( eval( g_mySettings.unDockedCalendarView ) );
    
    unDocked.style.display = "";  
    g_mySettings.save("","");
};
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function checkBackground()
{
    var sRetVal = "";
    var initDate = new Date(g_initDate);
    if (initDate.toDateString() != g_initDate)
        initDate.setDate(initDate.getDate()+1);
    var isToday = ( initDate.toDateString()== new Date().toDateString() );    

    if (System.Gadget.docked)
    {
            if ( isToday )
            {
                sRetVal = "url(images/calendar_single_orange.png)";
                divBgImageDocked.style.backgroundImage = "url(images/calendar_single_orange.png)";
                dockedCalendarRing.style.visibility = "hidden";   
                g_curl_img.style.visibility     = "hidden";
                g_curl_hitRegion.style.visibility = "hidden";
            }
            else
            {
                sRetVal = "url(images/calendar_single.png)";
                divBgImageDocked.style.backgroundImage = "url(images/calendar_single.png)";
                g_curl_img.style.visibility         = "visible";
                g_curl_hitRegion.style.visibility   = "visible";
                dockedCalendarRing.style.visibility = "visible";     
            }           
    }
    else
    {
            if ( isToday )
            {
                sRetVal = "url(images/calendar_double_orange.png)";
                divBgImageUnDocked.style.backgroundImage = "url(images/calendar_single_bkg_orange.png)";
            }
            else
            {
                sRetVal = "url(images/calendar_double.png)";
                divBgImageUnDocked.style.backgroundImage = "url(images/calendar_single_bkg.png)";
                g_curl_img.style.visibility              = "visible";
                g_curl_hitRegion.style.visibility        = "visible";   
            }           
    }
       
    return sRetVal; 
}
////////////////////////////////////////////////////////////////////////////////
//
// Calendar object 
//
////////////////////////////////////////////////////////////////////////////////
function Calendar(o)
{
////////////////////////////////////////////////////////////////////////////////
//
// Day view
//
////////////////////////////////////////////////////////////////////////////////
    o.day={
        d:new Date(),
        
        html:function(d)
        {
            if (System.Gadget.docked)
            {
                divPrevNext.style.visibility = "hidden";
            }
            
            this.d = new Date(d);
            if (this.d.toDateString() != d.toDateString())
                this.d.setDate(this.d.getDate()+1);
            
            g_day_view.d = d.toDateString();
            
            var isToday=d.toDateString() == new Date().toDateString();
            var layout = g_monthYearLayout;
            
            if (System.Gadget.docked)
            {
                g_initDate = d.toDateString();
            }

            if (isToday)
            {
                g_curl_img.style.visibility = "hidden";
                g_curl_hitRegion.style.visibility   = "hidden";
            }
            else
            {
                g_curl_img.style.visibility = "visible";
                g_curl_hitRegion.style.visibility   = "visible";
                g_curl_img.d = ( new Date().toDateString() );
            }
       
            layout = layout.replace("YY",d.getFullYear());
            layout = layout.replace("MM",loc.month.long[d.getMonth()]);            
            
           return "<table id='dowId' valign=center width='100%' cellpadding=0 cellspacing=0><tr><td align=center style='"+(isToday?"color:white;":"color:black;")+"'><span id='ellipsisHeadingTop'>"+layout+"</span></td></tr><tr><td align=center><div id='ellipsisMiddle' style='"+ (isToday?"color:white;":"color:black;") +"'>"+d.getDate()+"</div></td></tr><tr><td align=center valign=top style='"+(isToday?"color:white;":"color:black;")+"'><span id='ellipsisHeadingBottom'>"+loc.day.long[d.getDay()]+"</span></td></tr></table>";
        },

        initDay:function(d)
        {
            o.innerHTML = this.html(d);
        }

    };
    
////////////////////////////////////////////////////////////////////////////////
//
// Month view
//
////////////////////////////////////////////////////////////////////////////////
    o.month=
    {
        html:function(d)
        {
            var layout = g_monthYearLayout;
            if(d)
            {
                this.d=new Date(d);
                if (this.d.toDateString() != d.toDateString())
                    this.d.setDate(this.d.getDate()+1);
            }
            else
            {
                d=this.d;
            }
            layout = layout.replace("YY",d.getFullYear().toString().substr(2));
            layout = layout.replace("MM",loc.month.short[d.getMonth()]);
            
            return "<span UNSELECTABLE='on'>"+prevNext(layout,monthGrid(d.getYear(),d.getMonth()) )+"</span>";
        },

        initMonth:function(d)
        {
             tID.omo = "";             
             o.innerHTML=this.html(d);
        }
    };
////////////////////////////////////////////////////////////////////////////////
//
// Year view
//
////////////////////////////////////////////////////////////////////////////////
    o.year=
    {
        html:function(d){
            if(d)
            {
                this.d=new Date(d);
                if (this.d.toDateString() != d.toDateString())
                    this.d.setDate(this.d.getDate()+1);
            }
            else
            {
                d=this.d;
            }
            var s="<div UNSELECTABLE='on' style='margin:5 0 0 5'>",m=0,y,x;
            for(y=0; y<3; y++, s+="<br>")
                for(x=0; x<4; x++, m++)
                    s+="<var omo tabindex=1 divType='zoomMonth' onkeypress='swap(this);' onclick='swap(this)' m='"+m+"'>"+loc.month.short[m]+"</var>";
            s+="</div>";
            return "<span >"+
                   prevNext(this.d.getFullYear(),s)+
                   "</span>";
        },
        initYear:function(d){
          tID.removeAttribute("omo");
          tID.className = "";
          o.innerHTML = this.html(d);
        }
    };
////////////////////////////////////////////////////////////////////////////////
    function prevNext(tIDle,body)
    {
       tID.innerHTML = tIDle;

       return "<div UNSELECTABLE='on' class='divMonthView_docked'>"+ body + "</div>";
    };
////////////////////////////////////////////////////////////////////////////////
    function monthGrid(year,month){
        
        var dow = vbsDayOfWeek();
        var d=new Date(year,month,1-new Date(year,month,1).getDay()+loc.day.first);
        var d2 = new Date(d.getYear(),d.getMonth(),d.getDate(),d.getHours()+1);
        if(d.getDate() != d2.getDate())
            d.setDate(d.getDate()+1);
        var dateString = d.toDateString();
        
        if(d.getMonth()==month && d.getDate()>1)
            d.setDate(d.getDate()-7);
        var s="",today=new Date().toDateString();
        for(var y=0; y<7 && (d.getMonth()<=month || d.getYear()<year); y++){
            for(var x=0; x<7; x++){
                s+="<q divType='dow' class='day"+(x?" lb":"") ;
                if(y){
                    if(d.getMonth()!=month)
                        s+=" dim'";
                    else if(d.toDateString()==today)
                        s+=" today' tabindex=1";
                    else
                        s+="' omo tabindex=1";
                    s+=" d='"+d.toDateString()+"' onkeypress='swap(this);' onclick='swap(this);' >"+d.getDate()+"</q>";
                    dateString = d.toDateString();
                    d.setDate(d.getDate()+1);
                    if(d.toDateString() == dateString)
                        d.setDate(d.getDate()+1);
                }else
                    s+=(dow != x ? " name ": ckCurrentMonth(year,month) ) +"' title='"+loc.day.long[(x+loc.day.first)%7]+"'>"+(loc.day.dayofweek != null ? loc.day.dayofweek[(x+loc.day.first)%7] : loc.day.short[(x+loc.day.first)%7].substr(0,1))+"</q>";
            }
            s+="<br>";
        }
        return s;
    };
////////////////////////////////////////////////////////////////////////////////    
    function ckCurrentMonth(year,month)
    { 
        var oDate = new Date(g_calendar_date);
        if (oDate.toDateString() != g_calendar_date)
            oDate.setDate(oDate.getDate()+1);
        var sRetVal = " name";
        
        if (year == oDate.getFullYear() && month == oDate.getMonth() )
        {
            sRetVal = " dow";
        }
        return sRetVal;
    }
////////////////////////////////////////////////////////////////////////////////
    function dayPos(d){
        var x=(d.getDay()-loc.day.first)%7,
            y=parseInt((d.getDate()+6+loc.day.first-d.getDay())/7);
        if(x<0)x+=7,y--;
        return {x:2+x*17,y:39+y*13}
    };
////////////////////////////////////////////////////////////////////////////////
    function monthPos(d){
        var x=d.getMonth()%4,
            y=parseInt(d.getMonth()/4);
        return {x:7+x*28,y:27+y*28}
    };

    o.tabIndex=1;
    return o;
}
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function evalPrevNext(direction,o)
{
    var oDate = new Date(g_initDate);
    if (oDate.toDateString() != g_initDate)
        oDate.setDate(oDate.getDate()+1);

    if (BIDI == "rtl")
    {
        direction *= -1;
    }
      
    
    switch (gView)
    {
        case "month":
                o.divType = "changeMonth";
                oDate.setMonth(oDate.getMonth()+ direction);
                
                break;
        case "year":
                o.divType = "changeYear";
                oDate.setFullYear(oDate.getFullYear()+ direction);
                break;                
    }
   
    g_initDate = oDate.toDateString();
    
    if (event.button == 2)
    {
        if (direction == -1)
        {
            o.src = 'images/bprev.png';
        }
        else
        {
            o.src = 'images/bnext-hot.png';
        }
    }
    swap(o);
}
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function swap(o)
{
    if (event)
    {
        if (event.button == 2)
        {
            return;
        }
    }
    
    if (System.Gadget.docked)
    {
        renderDocked(o);
    }
    else
    {
        renderUnDocked(o);
    }
    g_filter = 1;
}
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function setInitDate(o)
{
    g_filter = 0;
    oDate = new Date(g_initDate);
    if (oDate.toDateString() != g_initDate)
        oDate.setDate(oDate.getDate()+1);

    oDOW  = new Date(o.d);
    if (oDOW.toDateString() != o.d)
        oDOW.setDate(oDOW.getDate()+1);
    
    if (oDate.getMonth() != oDOW.getMonth() | oDate.getFullYear() != oDOW.getFullYear() | gView == "year" )
    {  
        g_initDate = oDOW.toDateString();
        swap(o);
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function renderUnDocked(o)
{
    var sType = o.divType;
    var today = null;
    var isToday = null;
    var oDate = null;
    var viewMode = "";

    if (o.id == "btnPrevious" || o.id == "btnNext")
    {
         if (sType == "changeMonth")
         {
            viewMode = "MONTH_UNDOCKED";
         }
         else if (sType == "year")
         {
            viewMode = "tID";
         }
     }
     else
     {
         viewMode = o.id;
     }

    g_mySettings.saveUnDocked(viewMode);

    switch (sType)
    {
        case "dow": 
                gView = "month";
                if (! System.Gadget.docked)
                {
                    g_filter = 1;
                }
                divFilterBottomUndocked.filters[g_filter].enabled = true;
                divFilterBottomUndocked.filters[g_filter].Apply();
                today = new Date(o.d);
                if (o.d != today.toDateString())
                    today.setDate(today.getDate()+1);
                DAY_UNDOCKED.day.initDay(today);
                g_initDate = today.toDateString();
                isToday=today.toDateString()==new Date().toDateString();  
               
                if (isToday)
                {                                            
                    divBgImageUnDocked.style.backgroundImage = "url(images/calendar_single_bkg_orange.png)";
                    g_todayView = true;
                    setTimeout("showBackground(0);",300);
                }
                else
                {
                    divBgImageUnDocked.style.backgroundImage = "url(images/calendar_single_bkg.png)";
                    g_todayView = false;
                    setTimeout("showBackground(1);",300);
                }
                divFilterBottomUndocked.filters[g_filter].Play(); 
                if (o.id == "curlUnDocked")
                {
                    swap(DAY_UNDOCKED);
                }
                break;
                    
        case "year":
                gView = "year";
                
                divFilterTopUndocked.filters[g_filter].enabled = true;
                divPrevNext.className = "prevnext_unDocked";
                divPrevNext.style.visibility = "visible";                 
                divFilterTopUndocked.filters[g_filter].Apply();
                today = new Date(g_initDate);
                if (g_initDate != today.toDateString())
                    today.setDate(today.getDate()+1);
                YEAR_UNDOCKED.year.initYear(today);
                YEAR_UNDOCKED.style.visibility = "visible";
                MONTH_UNDOCKED.style.visibility = "hidden";
               
                divFilterTopUndocked.filters[g_filter].Play();
                tID.divType="reset"; 
                break;
                
        case "zoomMonth":
                oDate = new Date(g_initDate);
                if (g_initDate != oDate.toDateString())
                    oDate.setDate(oDate.getDate()+1);
                oDate.setMonth(o.m);
                g_initDate = oDate.toDateString();
                o.divType = 'day';
                swap(o);
                break;

        case "changeMonth": 
                o.divType = 'day';
                g_filter = 0;
                swap(o);
                break;
                
        case "changeYear": 
                o.divType = 'year';
                g_filter = 0;
                swap(o);
                break;   
                
        case "day":
                gView = "month";
                MONTH_UNDOCKED.month.initMonth(new Date(g_initDate));
                divFilterTopUndocked.filters[g_filter].enabled = true;               
                divFilterTopUndocked.filters[g_filter].Apply();
                YEAR_UNDOCKED.style.visibility = "hidden";
                MONTH_UNDOCKED.style.visibility = "visible";
                divFilterTopUndocked.filters[g_filter].Play();
                showControls(true);
                tID.divType="year";
                break;
    }
}
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function renderDocked(o)
{ 
    var sType = o.divType;
    var today = null;
    var isToday = null;
    var oDate = null;
     
   g_mySettings.save(o.id,o.divType);

   switch (sType)
    {
        case "changeMonth": 
                o.divType = 'day';
                g_filter = 1;
                swap(o);
                break;
                
        case "changeYear": 
                o.divType = 'year';
                g_filter = 1;
                swap(o);
                break;
                
        case "zoomMonth":
                oDate = new Date(g_initDate);
                if (g_initDate != oDate.toDateString())
                    oDate.setDate(oDate.getDate()+1);
                oDate.setMonth(o.m);
                g_initDate = oDate.toDateString();
                o.divType = 'day';
                g_filter = 0;
                swap(o);
                break;
                
        case "resetMonth":
                g_initDate = new Date().toDateString();
                o.divType = 'day';
                swap(o);
                break;

        case "dow":
                gView = "dow";
                if (o.id != "curlDocked")
                {
                    o.divType = "day";
                }
                divFilterDocked.filters[g_filter].enabled = true;
                divFilterDocked.filters[g_filter].Apply();
                today=new Date(o.d);
                if (o.d != today.toDateString())
                    today.setDate(today.getDate()+1);
                Calendar(DAY_DOCKED).day.initDay(today);               
                DAY_DOCKED.style.visibility = "visible";
                MONTH_DOCKED.style.visibility = "hidden";   
                isToday=today.toDateString()==new Date().toDateString();  
              
                if (isToday)
                {              
                    divBgImageDocked.style.backgroundImage = "url(images/calendar_single_orange.png)";
                    g_todayView = true;
                    setTimeout("showBackground(0);",300);
                }
                else
                {
                    divBgImageDocked.style.backgroundImage = "url(images/calendar_single.png)";
                    g_todayView = false;
                    setTimeout("showBackground(1);",300);
                }
                divFilterDocked.filters[g_filter].Play();
                showControls(false); 
                break;
                
        case "day":
                g_curl_img.style.visibility = "hidden";
                g_curl_hitRegion.style.visibility   = "hidden";
                gView = "month";
                today=new Date(g_initDate);
                if (g_initDate != today.toDateString())
                    today.setDate(today.getDate()+1);
                MONTH_DOCKED.month.initMonth(today);
                divFilterDocked.filters[g_filter].enabled = true;             
                divFilterDocked.filters[g_filter].Apply();
                YEAR_DOCKED.style.visibility = "hidden";
                DAY_DOCKED.style.visibility = "hidden";
                MONTH_DOCKED.style.visibility = "visible";
                divBgImageDocked.style.backgroundImage = "url(images/calendar_single.png)";
                divFilterDocked.filters[g_filter].Play();
                showControls(true);
                showBackground(1);
                tID.divType="year";
                break;

        case "year":
                gView = "year";
                
                g_curl_img.style.visibility = "hidden";
                g_curl_hitRegion.style.visibility   = "hidden";
                divFilterDocked.filters[0].enabled = true;
                divFilterDocked.filters[0].Apply();
                today=new Date(g_initDate);
                if (g_initDate != today.toDateString())
                    today.setDate(today.getDate()+1);
                YEAR_DOCKED.year.initYear(today);
                YEAR_DOCKED.style.visibility = "visible";
                MONTH_DOCKED.style.visibility = "hidden";
                divBgImageDocked.style.backgroundImage = "url(images/calendar_single.png)";
                divFilterDocked.filters[0].Play(); 
                showBackground(1); 
                showControls(true);
                tID.divType="reset";  
                break;                
    }
    

}
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function showBackground(skin)
{
    var bgFile =  "url(images/calendar_single.png)";
    
    switch (skin)
    {
        case 0 :
            if (System.Gadget.docked)
            {
                bgFile = "url(images/calendar_single_orange.png)";
            }
            else
            {
                bgFile = "url(images/calendar_double_orange.png)";
            }
            break;
            
        case 1 :
            if (System.Gadget.docked)
            {
                bgFile = "url(images/calendar_single.png)";
            }
            else
            {
                bgFile = "url(images/calendar_double.png)";
            }        
            break;     
    }
    
    document.body.style.backgroundImage = bgFile;
}
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
function showControls(show)
{
    var showHide = "hidden";
    
    if (show)
    {
        showHide = "visible";
    }
    
    dockedCalendarRing.style.visibility = showHide;
    divPrevNext.style.visibility = showHide;
}
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
document.onmouseover=document.onmouseout=function(){
    var e=event.srcElement;
    if(e.omo!=null)
        e.className=event.type=="mouseout"?e.className.replace(/ hot/,""):e.className+" hot";
}
