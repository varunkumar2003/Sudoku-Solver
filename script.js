document
  .getElementById("sudoku-board")
  .addEventListener("keydown", function (event) {
    if (event.target && event.target.nodeName == "TD") {
      var tdEl = event.target;
      if (event.key === "Backspace") {
        tdEl.innerText = "";
      }
    }
  });

document
  .getElementById("sudoku-board")
  .addEventListener("keydown", function (event) {
    var focused = document.activeElement;
    var tds = document.getElementsByTagName("td");
    var currentIndex = Array.prototype.indexOf.call(tds, focused);
    var newRow, newCol;
    switch (event.key) {
      case "ArrowUp":
        newRow = Math.max(Math.floor(currentIndex / 9) - 1, 0);
        newCol = currentIndex % 9;
        break;
      case "ArrowDown":
        newRow = Math.min(Math.floor(currentIndex / 9) + 1, 8);
        newCol = currentIndex % 9;
        break;
      case "ArrowLeft":
        if (focused.innerText.length === 0 || !focused.hasAttribute("readonly")) {
          newRow = Math.floor(currentIndex / 9);
          newCol = Math.max(currentIndex % 9 - 1, 0);
        }
        break;
      case "ArrowRight":
        newRow = Math.floor(currentIndex / 9);
        newCol = Math.min(currentIndex % 9 + 1, 8);
        break;
      default:
        return;
    }
    var newFocus = tds[newRow * 9 + newCol];
    if (newFocus && !newFocus.hasAttribute("readonly")) {
      newFocus.focus();
      event.preventDefault();
    }
  });

document
  .getElementById("sudoku-board")
  .addEventListener("keyup", function (event) {
    if (event.target && event.target.nodeName == "TD") {
      var validNum = /[1-9]/;
      var tdEl = event.target;
      if (tdEl.innerText.length > 0 && validNum.test(tdEl.innerText[0])) {
        tdEl.innerText = tdEl.innerText[0];
      } else {
        tdEl.innerText = "";
      }
    }
  });

document
  .getElementById("solve-button")
  .addEventListener("click", function (event) {
    var boardString = boardToString();
    var solution = SudokuSolver.solve(boardString);
    if (solution) {
      stringToBoard(solution);
    } else {
      alert("Invalid board!");
    }
  });

document.getElementById("clear-button").addEventListener("click", clearBoard);

function clearBoard() {
  var tds = document.getElementsByTagName("td");
  for (var i = 0; i < tds.length; i++) {
    tds[i].innerText = "";
  }
}

function boardToString() {
  var string = "";
  var validNum = /[1-9]/;
  var tds = document.getElementsByTagName("td");
  for (var i = 0; i < tds.length; i++) {
    if (validNum.test(tds[i].innerText[0])) {
      string += tds[i].innerText;
    } else {
      string += "-";
    }
  }
  return string;
}

function stringToBoard(string) {
  var currentCell;
  var validNum = /[1-9]/;
  var cells = string.split("");
  var tds = document.getElementsByTagName("td");
  for (var i = 0; i < tds.length; i++) {
    currentCell = cells.shift();
    if (validNum.test(currentCell)) {
      tds[i].innerText = currentCell;
    }
  }
}

var SudokuSolver = (function () {
  function solve(boardString) {
    var boardArray = boardString.split("");
    if (boardIsInvalid(boardArray)) {
      return false;
    }
    return recursiveSolve(boardString);
  }

  function solveAndPrint(boardString) {
    var solvedBoard = solve(boardString);
    console.log(Conv_To_Str(solvedBoard.split("")));
    return solvedBoard;
  }

  function recursiveSolve(boardString) {
    var boardArray = boardString.split("");
    if (boardIsSolved(boardArray)) {
      return boardArray.join("");
    }
    var cellPossibilities = getNextCellAndPossibilities(boardArray);
    var nextUnsolvedCellIndex = cellPossibilities.index;
    var possibilities = cellPossibilities.choices;
    for (var i = 0; i < possibilities.length; i++) {
      boardArray[nextUnsolvedCellIndex] = possibilities[i];
      var solvedBoard = recursiveSolve(boardArray.join(""));
      if (solvedBoard) {
        return solvedBoard;
      }
    }
    return false;
  }

  function boardIsInvalid(boardArray) {
    return !boardIsValid(boardArray);
  }

  function boardIsValid(boardArray) {
    return (
      allRowsValid(boardArray) &&
      allColumnsValid(boardArray) &&
      allBoxesValid(boardArray)
    );
  }

  function boardIsSolved(boardArray) {
    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] === "-") {
        return false;
      }
    }
    return true;
  }

  function getNextCellAndPossibilities(boardArray) {
    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] === "-") {
        var existingValues = getAllIntersections(boardArray, i);
        var choices = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].filter(
          function (num) {
            return existingValues.indexOf(num) < 0;
          }
        );
        return { index: i, choices: choices };
      }
    }
  }

  function getAllIntersections(boardArray, i) {
    return getRow(boardArray, i)
      .concat(getColumn(boardArray, i))
      .concat(getBox(boardArray, i));
  }

  function allRowsValid(boardArray) {
    return [0, 9, 18, 27, 36, 45, 54, 63, 72]
      .map(function (i) {
        return getRow(boardArray, i);
      })
      .map(function (row) {
        return IscollectionValid(row);
      })
      .every(function (validity) {
        return validity;
      });
  }

  function getRow(boardArray, i) {
    var startingEl = Math.floor(i / 9) * 9;
    return boardArray.slice(startingEl, startingEl + 9);
  }

  function allColumnsValid(boardArray) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8]
      .map(function (i) {
        return getColumn(boardArray, i);
      })
      .reduce(function (validity, row) {
        return IscollectionValid(row) && validity;
      }, true);
  }

  function getColumn(boardArray, i) {
    var startingEl = Math.floor(i % 9);
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (num) {
      return boardArray[startingEl + num * 9];
    });
  }

  function allBoxesValid(boardArray) {
    return [0, 3, 6, 27, 30, 33, 54, 57, 60]
      .map(function (i) {
        return getBox(boardArray, i);
      })
      .reduce(function (validity, row) {
        return IscollectionValid(row) && validity;
      }, true);
  }

  function getBox(boardArray, i) {
    var boxCol = Math.floor(i / 3) % 3;
    var boxRow = Math.floor(i / 27);
    var startingIndex = boxCol * 3 + boxRow * 27;
    return [0, 1, 2, 9, 10, 11, 18, 19, 20].map(function (num) {
      return boardArray[startingIndex + num];
    });
  }

  function IscollectionValid(collection) {
    var numCounts = new Set();
    for (var i = 0; i < collection.length; i++) {
      if (collection[i] !== "-" && numCounts.has(collection[i])) {
        return false;
      }
      numCounts.add(collection[i]);
    }
    return true;
  }

  function Conv_To_Str(boardArray) {
    var string = "";
    for (var i = 0; i < 9; i++) {
      string += getRow(boardArray, i * 9).join(" ");
      if (i < 8) string += "\n";
    }
    return string;
  }

  return {
    solve: solve,
    solveAndPrint: solveAndPrint,
    recursiveSolve: recursiveSolve,
    boardIsInvalid: boardIsInvalid,
    boardIsValid: boardIsValid,
    boardIsSolved: boardIsSolved,
    getNextCellAndPossibilities: getNextCellAndPossibilities,
    getAllIntersections: getAllIntersections,
    allRowsValid: allRowsValid,
    getRow: getRow,
    allColumnsValid: allColumnsValid,
    getColumn: getColumn,
    allBoxesValid: allBoxesValid,
    getBox: getBox,
    IscollectionValid: IscollectionValid,
    Conv_To_Str: Conv_To_Str,
  };
})();
