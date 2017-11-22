//LOGIC FOR THE GAME
//============================
//CLOCK
//URA
var mins = 3;
var sec = 0;
var TextToDisplay;

//Od�tevalnik
var odstevalnik = setInterval(function CountDown()
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

//Uganke
var mysteries = [];
var mystery;    //Za gumbe


//Ustvari uganke
var initmysteries = function(){
    mysteries[0] = new Mystery("Predmet", "RGTI");
    mysteries[1] = new Mystery("Deadline", "Petek");
    //console.log(mysteries);
}

//Preveri če so vse uganke rešene
var checkAll = function(){
    for(var i = 0; i < mysteries.length; i++){
        if (!mysteries[i].done){
            return;
        }
    }
    clearInterval(odstevalnik);
    TextToDisplay = "VICTORY";
    var b = document.getElementById("t");
    b.innerText = TextToDisplay;
}

//===========================================