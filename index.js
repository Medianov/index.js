


let player = document.getElementById("player");
let board = document.getElementById("board");
let touchstartX = 0;
let touchstartY=0;
let touchendeY=0;
let keyboard = 0;
let points = 0;
let speed = 300;
let bewegen;
setSpeed(speed);


window.addEventListener('touchstart', function (event) {
    touchstartX = event.changedTouches[0].pageX;
    touchstartY = event.changedTouches[0].pageY;
});
window.addEventListener('touchend', function (event) {
    touchendeY=event.changedTouches[0].pageY;
    links_rechts_schiessen();
});
window.addEventListener("keydown", function (e) {
    keyboard = e.code;
    links_rechts_schiessen();
});
//passt die veränderte Höhe auf
document.addEventListener("DOMContentLoaded", fitHeight)
window.addEventListener("resize", fitHeight)

enemies_erstellen = setInterval(() => {
    //erstellt ein enemy jede 200 ms
    let enemy = document.createElement("div");
    enemy.classList.add("enemies");
    let enemies = document.getElementsByClassName("enemies");
    let j = 0;
    let feindid1;
    let feindid2;
    let enemy_breite;
    let feind1_style;
    let feind2_style;

    for (let i = 0; i < enemies.length; i++) {
        let enemy1 = enemies[i];
        enemy1.setAttribute("id", i.toString()) //gibt die enemies id
        enemy_breite = parseInt(window.getComputedStyle(enemy1).getPropertyValue("width")); //gibt die bereite für jede Enemy
        //die vergleich zwichen enemies Id fängt nach mindestens 2 enemies erstellt wird
        if (i === 1) {
            j++
        }
        feindid1 = parseInt(enemy1.getAttribute("id")) - j //die Id,für die neue enemy die nachher erstellt wird
        feindid2 = parseInt(enemy1.getAttribute("id")) //die Id, für die enemy die schon vorher erstllt wird
        let feind1 = document.getElementsByClassName("enemies").item(feindid1)// nachherige enemy
        let feind2 = document.getElementsByClassName("enemies").item(feindid2)// vorherig enemy
        feind1_style = feind1.getBoundingClientRect();// so kann man auf style zugreif(top- bottom.....)
        feind2_style = feind2.getBoundingClientRect();
    }
    //erstellt enemies in verschiedene Positionen in der Board
    enemy.style.left = Math.floor(Math.random() * (board.clientWidth - enemy_breite)) + "px";
    board.appendChild(enemy);
    if(feindid2 >=1){ //die Schleife fängt nach mindestens 2 enemies erstellt wird
        //die schleife überprüft ob die enemies sich berühren
        if ((feind1_style.bottom >= feind2_style.bottom && feind2_style.bottom >= feind1_style.top)
            || (feind1_style.left <= feind2_style.left && feind2_style.left <= feind1_style.right) ||
            (feind1_style.left <= feind2_style.right && feind2_style.right <= feind1_style.right)
        ) {
            //enemies löschen um sich nicht zu überlapen
            enemy.parentElement.removeChild(document.getElementsByClassName("enemies").item(feindid2))
        }
    }


}, 200);

async function levels() {
    //überprüft die points um eine höhre level einzustellen(die enemy werden schneller von oben fallen)
    //diese Funktion funktioniert nur wenn man die Projekt-verzeichnis in einer entwicklungsumgebung aufmacht oder Das Spiel auf einer Server zu Verfügung hochlädt(spiel.html alleine aufzumachen funktioniert nicht)
    let result = await fetch('./levels.json')
     result = await result.json()

    for(let i=0;i<result.length;i++){
        let currentPoints = result[i].points;
        let currentSpeed = result[i].speed;
        let currentLevel = result[i].level;
        if(points=== currentPoints){
            setSpeed(currentSpeed);
            document.getElementById("level").innerHTML = currentLevel;
        }
    }
}

function setSpeed(newSpeed) {
    //durch diese Funktion kann man die schnelligkeit die enemies einstellen
    console.log("new speed ", newSpeed)
    speed = newSpeed;
    if (bewegen) clearInterval(bewegen);
    bewegen = setInterval(() => {
        enemies_bewegen();
    }, newSpeed);
}

function enemies_bewegen() {
    //die enemies bewegen sich nach unten
    levels();
    let enemies = document.getElementsByClassName("enemies");
    if (enemies !== undefined) {
        for (let i = 0; i < enemies.length; i++) {
            //in einem Array definieren
            let enemy = enemies[i];
            //definiert die übere Kante für jede enemy
            let enemytop = parseInt(window.getComputedStyle(enemy).getPropertyValue("top"));
            let feind = enemy.getBoundingClientRect(); // so kann man auf style zugreif(top- bottom.....)
            let spieler = player.getBoundingClientRect();
            //überprüft ob die enemy zu Ende des Spielboardes kommt
            if ((enemytop + feind.height) >= board.clientHeight ||
                //überprüft ob die enemy und player sich berühren
                ((enemytop + feind.height) >= (board.clientHeight - player.clientHeight) &&
                    ((feind.left <= spieler.left && spieler.left <= feind.right) ||
                        (feind.left <= spieler.right && spieler.right <= feind.right))
                )) {
                //startet das Spiel erneut

                alert("Sie haben verloren");
                clearInterval(bewegen);
                window.location.reload();
            }
            //ansonsten beweget sich die enemies bei die eingestellte Geschwindigkeit
            enemy.style.top = enemytop + (board.offsetHeight*0.01) + "px";
        }
    }
}

function patroneerstellen(position, legendpatrone, wieschnell) {
    let right = parseInt(window.getComputedStyle(player).getPropertyValue("right"));
    let bullet = document.createElement("div");
    bullet.classList.add("patrone");
    board.appendChild(bullet);
    let movebullet = setInterval(() => {
        let enemies = document.getElementsByClassName("enemies");
        for (let i = 0; i < enemies.length; i++) {
            let enemy = enemies[i];
            if (enemy !== undefined) {
                let feind = enemy.getBoundingClientRect();// so kann man auf style zugreifen(top- bottom.....)
                let patrone1 = bullet.getBoundingClientRect();

                if (
                    //überprüft ob die Patrone und Enemy sich berühern
                    ((feind.left <= patrone1.left && patrone1.left <= feind.right) ||
                        (feind.left <= patrone1.right && patrone1.right <= feind.right)) &&
                    patrone1.top <= feind.bottom
                ) {
                    // löscht enemy vom Board
                    enemy.parentElement.removeChild(enemy);
                    //legendpatrone heißt, dass die Patrone weiter läuft auch wenn sie ein oder mehre enemy killt
                    if (!legendpatrone) {
                        bullet.parentElement.removeChild(bullet);
                    }
                    //erhöht die Points bei wenn player ein enemy gekillt hat
                    points = parseInt(document.getElementById("points").innerHTML) + 1;
                    document.getElementById("points").innerHTML = points;
                }
            }
        }
        // so kann man auf style zugreif(bottom)
        let patronebottom = parseInt(
            window.getComputedStyle(bullet).getPropertyValue("bottom")
        );
        //die Patrone wir gelöscht sobald die übere kante berührt hat
        if (patronebottom >= board.offsetHeight) {
            clearInterval(movebullet);
        }
        //die Patrone wird vom verschiedne Positionen eingeschoßen
        bullet.style.right = right + position + "px";
        //die Patrone bewegt sich nach oben mit geschwindigkeit
        bullet.style.bottom = patronebottom + wieschnell + "px";
    });
}

function patronen(){
    //der Player bekommt Vorteile bei höhren Levels, er kann mehrere Patronen gleichzeitig schießen,die manchmal mehr als ein enemy killt
    if (points >= 0 && points < 10) {
        patroneerstellen(player.clientWidth / 2, false,1);// mittig

    } else if (points >= 10 && points < 20) {
        patroneerstellen(player.clientWidth * 0.95, false,1);//links
        patroneerstellen(0, false,1);//rechts
    } else if (points >= 20 && points < 30) {
        patroneerstellen(player.clientWidth / 2, false,2);
        patroneerstellen(player.clientWidth * 0.95, false,2);
        patroneerstellen(0, false,2);
    } else if (points >= 30 && points < 40) {
        patroneerstellen(player.clientWidth / 2, true,1);
    } else if (points >= 40 && points < 50) {
        patroneerstellen(player.clientWidth * 0.95, true,1);
        patroneerstellen(0, true,1);
    } else if (points >= 50) {
        patroneerstellen(player.clientWidth / 2, true,2);
        patroneerstellen(player.clientWidth * 0.95, true,2);
        patroneerstellen(0, true,2);
    }
}

function links_rechts_schiessen() {
    let left = parseInt(window.getComputedStyle(player).getPropertyValue("left"));
    //player nach links bewegen wenn man ArrowLeft drückt
    if ((keyboard === "ArrowLeft" ||
            // für Handy version wenn man auf die sechstl die breite  und inner halb der Player Höhe anfasst
        (touchstartX <(board.clientWidth/6) && touchstartY>(board.clientHeight-player.clientHeight)))
        //Player bewegt sich nicht außer Board
        && left > 0 && !(player.offsetLeft < (board.clientWidth * 0.03))) {
        // die Schritt Größe
        player.style.left = left - (board.clientWidth * 0.03) + "px";
    } else if ((keyboard === "ArrowLeft" ||
        touchstartX <(board.clientWidth/6) && touchstartY>(board.clientHeight-player.clientHeight))
        //überprüft ob die abstand zwischen die Rechte kante der Player und der Rechte kante der Board kleiner als die Schritt Größe
        && player.offsetLeft < (board.clientWidth * 0.03)) {
        player.style.left = 0 + "px";
    } else if ((keyboard === "ArrowRight" ||
        touchstartX >(5*board.clientWidth/6)&& touchstartY>(board.clientHeight-player.clientHeight))
        && ((board.clientWidth - player.clientWidth - player.offsetLeft) < (board.clientWidth * 0.03))) {
        player.style.left = board.clientWidth - player.clientWidth + "px";
    }
    else if ((keyboard === "ArrowRight" ||
            touchstartX >(5*board.clientWidth/6) && touchstartY>(board.clientHeight-player.clientHeight))
        && left <= (board.clientWidth - player.clientWidth) &&
        !((board.clientWidth - player.clientWidth - player.offsetLeft) < (board.clientWidth * 0.03))
    ) {
        player.style.left = left + (board.clientWidth * 0.03) + "px";
    }
    // wenn man Space drückt oder wenn man in Handy Version nach oben swipt ,schießt der Player Patronen
    if ((keyboard === "Space") || (touchendeY < touchstartY ) && touchstartY<(board.clientHeight-player.clientHeight)) {
        patronen();
    }
}

function fitHeight() {
    // passt die geänderte Höhe ein
    let height = window.innerHeight
    document.getElementById("board").style.cssText = 'height:' + (height/1.033) + 'px'
}
