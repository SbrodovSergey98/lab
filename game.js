// получите элементы с id 'map', 'progressBar' и 'log' из DOM и поместите их в переменные
// cvs, ctlProgress и logBox соответственно

/* BLOCK 1 */
var cvs = document.getElementById('map');
var ctlProgress = document.getElementById('progressBar');
var logBox = document.getElementById('logBox');
/* BLOCK 1 END */

var ctx = cvs.getContext('2d');

var gameController = new GameController(cvs);
var lastDirection = -1; //переменная хранит в себе значение текущего направления игрока
var icons = gameController.icons;


// с помощью setTimeout, спустя одну секунду скройте кнопки 'btnStart', 
// 'btnStop' и 'btnCancel', если пользователь не является хостом игры

/* BLOCK 2 */
var setUI = setTimeout(function () {
    if (
        gameController && gameController.game && gameController.game.owner
        && gameController.user.id !== gameController.game.owner.id) {
        document.getElementById('btnStart').classList.add('hidden');
        document.getElementById('btnStop').classList.add('hidden');
        document.getElementById('btnCancel').classList.add('hidden');
    }
}, 1000);
/* BLOCK 2 END */

// создайте функции start(), stop(), reconnect(),
// cancel(), leave(), join(), exit(), которые вызывают соответствующие методы
// объекта gameController

/* BLOCK 3 */
function start() {
    gameController.start();
};

function stop() {
    gameController.stop();
};

function reconnect() {
    gameController.reconnect();
};

function cancel() {
    gameController.cancel();
};

function leave() {
    gameController.leave();
};

function join() {
    gameController.join();
};

function exit() {
    gameController.disconnect();
    jsHelper.setNewPageUrl('index.html');
};
/* BLOCK 3 END */

//Moving---------------------------------------------------------------------------

// создайте обработчик события keydown, который вызывает метод gameController.movePlayer(direction)
// и присваивает это направление в lastDirection


/* BLOCK 4 */
document.addEventListener('keydown', movePlayer);

function movePlayer(event) {
    var event = event || window.event;

    var keyCode = event.keyCode;
    if (keyCode) {
        var direction = jsHelper.getDirection(keyCode);

        if (direction > -1 && direction != lastDirection) {
            gameController.movePlayer(direction);
            lastDirection = direction;
        }
    }
};
/* BLOCK 4 END */


// с помощью setInterval, каждые 100мс обновляйте текст с игровой статистикой команд
// в элементах ftName, ftScore, ftLifes и stName, stScore, stLifes
// эти данные хранятся в gameController.game.team1Stats и team2Stats

/* BLOCK 5 */
var showScore = setInterval(function () {
    if (gameController.game != null) {
        refreshScoreData(gameController.game.team1Stats, gameController.game.team2Stats);
    }
}, 100);

function refreshScoreData(team1, team2) {
    if (team1) {
        document.getElementById('ftName').innerText = team1.name;
        document.getElementById('ftScore').innerText = team1.coinsCollected || 0;
        document.getElementById('ftLifes').innerText = team1.currentLives;
    }

    if (team2) {
        document.getElementById('stName').innerText = team2.name;
        document.getElementById('stScore').innerText = team2.coinsCollected || 0;
        document.getElementById('stLifes').innerText = team2.currentLives || 0;
    }
};
/* BLOCK 5 END */


// напишите функцию displayCell(x, y, width, height, type), которая будет рисовать
// иконку согласно заданному типу. Иконки хранятся в объекте icons, 
// список возможных типов в GameApi.MapCellType

/* BLOCK 6 */
function displayCell(x, y, width, height, type) {
    var x = x * width;
    var y = y * height;
  
    var img = defineCellType(type);
    if (img != null) {
        ctx.drawImage(img, x, y, width, height);
    }
  
    function defineCellType(type) {
        switch (type) {
            case GameApi.MapCellType.empty:
            default:
                return icons.empty || null;
            case GameApi.MapCellType.wall:
                return icons.wall || null;
            case GameApi.MapCellType.coin:
                return icons.coin || null;
            case GameApi.MapCellType.life:
                return icons.life || null;
            case GameApi.MapCellType.swtch:
                return icons.switch || null;
            case GameApi.MapCellType.thiefRespawn:
                return icons.empty || null;
            case GameApi.MapCellType.policeRespawn:
                return icons.empty || null;
            case 7:
                return icons.police || null;
            case 8:
                return icons.thief || null;
        }
    };
  };
/* BLOCK 6 END */

// присвойте в gameController.displayStatic(map) метод, который будет вызывать displayCell()
// для каждой ячейки, если в ней стена (GameApi.MapCellType.wall)

/* BLOCK 7 */
gameController.displayStatic = function (map) {
    var blockSizeX = cvs.clientWidth / map.width;
    var blockSizeY = cvs.clientHeight / map.height;

    if (map) {
        for (var i = 0; i < map.cells.length; i++) {
            var cell = map.cells[i];
            if (cell === GameApi.MapCellType.wall) {
                var x = parseInt(i / map.height);
                var y = i - x * map.height;
                displayCell(x, y, blockSizeX, blockSizeY, cell);
            }
        }
    }
};
/* BLOCK 7 END */


// присвойте в gameController.displayDynamic(map) метод, который будет вызывать displayCell()
// для каждой ячейки, если в ней не стена, полицейский или вор

/* BLOCK 8 */
gameController.displayDynamic = function (map) {
    var blockSizeX = cvs.clientWidth / map.width;
    var blockSizeY = cvs.clientHeight / map.height;

    if (map != null) {
        for (var i = 0; i < map.cells.length; i++) {
            var cell = map.cells[i];
            if (cell !== GameApi.MapCellType.wall
                && cell !== GameApi.MapCellType.police
                && cell !== GameApi.MapCellType.thief
               ) {
                var x = parseInt(i / map.height);
                var y = i - x * map.height;
                displayCell(x, y, blockSizeX, blockSizeY, cell);
            }
        }
    }
};

/* BLOCK 8 END */

// присвойте в gameController.displayPlayers(map, players) метод, который будет вызывать drawImage()
// чтобы нарисовать иконки игроков в соответствующих местах

/* BLOCK 9 */
gameController.displayPlayers = function (map, players) {
    var blockSizeX = cvs.clientWidth / map.width;
    var blockSizeY = cvs.clientHeight / map.height;

    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var x = p.location.x * blockSizeX;
        var y = p.location.y * blockSizeY;
        ctx.drawImage(p.icon, x, y, blockSizeX, blockSizeY)
    }
};
/* BLOCK 9 END */



// присвойте в метод gameController.incrementProgress() функцию, которая
// будет отображать прогресс на элементе ctlProgress

/* BLOCK 10 */
function incrementProgress() {
    var percent = gameController.remainingSwitchTime * 100 / gameController.game.switchTimeout + '%';
    ctlProgress.style.width = percent;
    gameController.remainingSwitchTime += 100;
};
gameController.incrementProgress = incrementProgress;
/* BLOCK 10 END */


// присвойте в метод gameController.log(message) функцию, которая
// будет отображать текущее сообщение в элементе logBox

/* BLOCK 11 */
function log(message) {
    if (message) {
        logBox.textContent += message + '\r';
    }
};
gameController.log = log;
/* BLOCK 11 END */
