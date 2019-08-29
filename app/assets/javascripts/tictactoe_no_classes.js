// class CurrentGame {
//   constructor(turn, gameId) {
//     this.turn = turn;
//     this.gameId = gameId;
//   }
// }
//
// let game = new CurrentGame(0)

$(document).ready(function() {
  attachListeners()
})

var turn = 0;
var gameId

function saveGame() {
  //unsaved...not sure how to tell yet
  const data = {state: currentBoard()}
  if (gameId === undefined){
    $.post('/games', data)
      .done(function(json) {
        gameId = json.data.id
      })
  } else {
    $.ajax({
       type: 'PATCH',
       url: `/games/${gameId}`,
       data: data,
       processData: false,
       contentType: 'application/merge-patch+json',
   /* success and error handling omitted for brevity */
    });
  }
}

function player() {
  return turn % 2 === 0 ? 'X' : 'O'
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
  if (turn < 8) {
    updateState(el)
    turn += 1
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
  turn = 0
  gameId = undefined
  for(let i=0; i<9; i++) {
    $('td')[i].innerText = ""
  }
}

function attachListeners() {
  $('td').click(function() {
    if (this.innerText === "" && turn < 8 && !checkWinner()) {
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
    gameId = json.data.id
  })
}

function loadBoard(board) {
  resetGame()
  $('td')
  for (i=0; i<9; i++) {
    $('td')[i].innerText = board[i]
    if (board[i] !== "") {
      turn++
    }
  }
}
