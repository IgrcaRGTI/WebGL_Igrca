//LOGIC FOR THE GAME
//============================
//CLOCK
//URA
var mins = 3;
var sec = 0;
var TextToDisplay;

//Odštevalnik
setInterval(function CountDown()
{
   
    if (sec == 0 && mins > 0)
    {
        mins--;
        sec = 59;
        TextToDisplay = mins.toString() + ":" + sec.toString();
    }
    else if (sec > 0)
    {
        sec--;

        if (sec == 0 && mins == 0) {
            //maybe play sound....
            TextToDisplay = "GAME OVER";
        }
        else if (sec < 10)
            TextToDisplay = mins.toString() + ":0" + sec.toString();
        else
            TextToDisplay = mins.toString() + ":" + sec.toString();
       
    }    
    var b = document.getElementById("t");
    b.innerText = TextToDisplay;
}, 1000);
//===========================================