$(document).ready(function() {
  attachListeners()
})

var turn = 0;
var gameId

class CurrentGame {
  constructor(turn, gameId) {
    this.turn = turn;
    this.gameId = gameId;
  }
}

let game = new CurrentGame(0)

function saveGame() {
  const data = {state: currentBoard()}
  if (game.gameId === undefined){
    $.post('/games', data)
      .done(function(json) {
        game.gameId = json.data.id
      })
  } else {
    $.ajax({
       type: 'PATCH',
       url: `/games/${game.gameId}`,
       data: data,
       processData: false,
       contentType: 'application/merge-patch+json',
   /* success and error handling omitted for brevity */
    });
  }
}

function player() {
  return game.turn % 2 === 0 ? 'X' : 'O'
}

function updateState(td) {
  $(td).text(player())
}

function setMessage(message) {
  $('#message').text(message)
}

function currentBoard() {
  var board = []
  for(let i=0; i<9; i++) {
    board.push($('td')[i].innerText)
  }
  return board
}

function checkWinner() {
  var board = currentBoard()
  for (const curr of ['X', 'O']) {
    if((board[0]===curr && board[1]===curr && board[2]===curr) ||
       (board[3]===curr && board[4]===curr && board[5]===curr) ||
       (board[6]===curr && board[7]===curr && board[8]===curr) ||

       (board[0]===curr && board[3]===curr && board[6]===curr) ||
       (board[1]===curr && board[4]===curr && board[7]===curr) ||
       (board[2]===curr && board[5]===curr && board[8]===curr) ||

       (board[0]===curr && board[4]===curr && board[8]===curr) ||
       (board[2]===curr && board[4]===curr && board[6]===curr)) {

       setMessage(`Player ${curr} Won!`)
       return true
       }
    }
  return false
}

function doTurn(el) {
  if (game.turn < 8) {
    updateState(el)
    game.turn += 1
    if (checkWinner()) {
      saveGame()
      resetGame()
    }
  } else {
    setMessage(`Tie game.`)
    saveGame()
    resetGame()
  }
}

function resetGame() {
  game.turn = 0
  game.gameId = undefined
  for(let i=0; i<9; i++) {
    $('td')[i].innerText = ""
  }
}

function attachListeners() {
  $('td').click(function() {
    if (this.innerText === "" && game.turn < 8 && !checkWinner()) {
      doTurn(this)
    }
  })

  $('#save').click(saveGame)

  $('#previous').click(function() {
    $.get("/games", function(json) {
      for(let i=0; i<json["data"].length; i++) {
        const id = json["data"][i].id
        const element = document.createElement('button')
        element.id = id
        element.className = "saved-game"
        element.innerHTML = `Game #${id}`
        if (document.getElementById(element.id) === null) {
          document.querySelector('div#games').appendChild(element).addEventListener("click", loadGame)
        }
      }
    })
  })

  $('#clear').click(function() {
    resetGame()
  })

}

function loadGame() {
  $.get("/games/" + this.id, function(json) {
    loadBoard(json.data.attributes.state)
    game.gameId = json.data.id
  })
}

function loadBoard(board) {
  resetGame()
  $('td')
  for (i=0; i<9; i++) {
    $('td')[i].innerText = board[i]
    if (board[i] !== "") {
      game.turn++
    }
  }
}
