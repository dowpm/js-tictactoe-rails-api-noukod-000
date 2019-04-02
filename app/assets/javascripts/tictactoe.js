// Code your JavaScript / jQuery solution here
turn = 0
currentGame = 0

const winningComb = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
]

$(document).ready(function() {
    attachListeners();
  });

function player(){
    return turn % 2 ? 'O' : 'X'
}

function updateState(tdPosition) {
    $(tdPosition).text(player())
}

function setMessage(msg) {
    $('div#message').text(msg)
}

function checkWinner() {
    const $squares = $.makeArray($('td'))
    let win;
    winningComb.some( comb => {
        win = comb.every(c => $squares[c].innerHTML === 'X') ||
        comb.every(c => $squares[c].innerHTML === 'O')
        if(win){
            setMessage('Player '+$squares[comb[0]].innerHTML+' Won!')
            return win
        }
    })

    return win    
}

function doTurn(square) {
    updateState(square);
    turn++;
    if (checkWinner()) {
        saveGame();
        resetBoard();
    } else if (turn === 9) {
        setMessage("Tie game.");
        saveGame();
        resetBoard();
    }
}

function attachListeners() {
    $('td').click( function (){
        if(!$.text(this) && !checkWinner()){
            doTurn(this)
        }
    } )
    
    $('#previous').click( () => showPreviousGamesList() )

    $('#clear').click( () => resetBoard() )
    
    $('#save').click( () => saveGame() )
}

function resetBoard() {
    turn *= 0
    currentGame *= 0
    $('td').empty()
    $('#games').empty()
    $('#message').innerHTML = '';
}

function showPreviousGamesList() {
    $('#games').empty()

    $.get('/games', res => {
        res.data.length && res.data.forEach(game => {
            $('#games').append(`<button id="gameid-${game.id}">${game.id}</button><br>`);
            $(`#gameid-${game.id}`).click( () => reloadGame(game.id));
        })
    }).fail(function(error) {
        console.log('Something went wrong: ' + error.statusText);
    });
}

function reloadGame(gameId) {
    $('#message').innerHTML = '';

    $.get('/games/'+gameId, res => {
        res.data.attributes.state.forEach((v,i)=>{
            $('td')[i].innerHTML = v
        })
        turn = res.data.attributes.state.join('').length
        currentGame = gameId;
        if (!checkWinner() && turn === 9) {
            setMessage('Tie game.');
          }
    })  

}

function saveGame() {
    var state = [];
    var gameData;
  
    $('td').text( square => {
      state.push(square);
    });
  
    gameData = { state: state };
  
    if (currentGame) {
      $.ajax({
        type: 'PATCH',
        url: `/games/${currentGame}`,
        data: gameData
      });
    } else {
      $.post('/games', gameData, function(game) {
        currentGame = game.data.id;
        $('#games').append(`<button id="gameid-${game.data.id}">${game.data.id}</button><br>`);
        $("#gameid-" + game.data.id).on('click', () => reloadGame(game.data.id));
      });
    }
}
  