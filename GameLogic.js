//LOGIC FOR THE GAME
//============================
var gamePassed=false;
//URA
var mins = 3;
var sec = 0;
var TextToDisplay;

//Odstevalnik
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
        if(gamePassed)
        {

           location.href="./game_passed.html";
        }
        sec--;
        if (sec == 0 && mins == 0)
        {
            sec = 0;
            var b = document.getElementById("paragraph");
            if (b != null)
                b.innerText = TextToDisplay;
            location.href = "./game_over.html";
           
        }
        else if (sec < 10)
            TextToDisplay = mins.toString() + ":0" + sec.toString();
        else
            TextToDisplay = mins.toString() + ":" + sec.toString();
    }

    var b = document.getElementById("paragraph");
    if (b!= null)
        b.innerText = TextToDisplay;
      /* 
    var ctx_ = canvas.getContext("2d");
    ctx_.fillStyle = "blue";
    ctx_.font = "bold 16px Arial";
    ctx_.fillText(TextToDisplay, (canvas.width / 2) - 17, (canvas.height / 2) + 8);*/


}, 1000);
//===========================================
//Zaštartamo game over glasbo
function PlaySound()
{
    var audio = document.getElementById("carteSoudCtrl");
    audio.play();
}
