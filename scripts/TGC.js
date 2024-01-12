let game;
const cDeploymentId = "AKfycbyCpekdGBoPsrLrgDfu0vpq8cI5PUSRYze8iLTW1XywHKh_hf-SXySqczqd1UVsPJ_d";
const cURL = `https://script.google.com/macros/s/${cDeploymentId}/exec`
$(function () {
  console.log("ready!");
  getTGC_Scorecards();
});

async function getTGC_Scorecards() {
  try {
    console.log("calling api");
    var qs = getQueryStrings();
    var queryString;

    for (const property in qs) {
      if (!queryString) { queryString = "?"; } else { queryString = `${queryString}&`; }
      queryString = `${queryString}${property}=${qs[property]}`;
    }

    const response = await fetch(`https://script.google.com/macros/s/${cDeploymentId}/exec${queryString}`);
    game = await response.json();
    console.log(JSON.stringify(game));

    $("#game").text(game.name);
    bindGolferInfo();
    bindCurrentHoleInfo();
  }
  catch (error) {
    $("#game").text("Error loading game!");
    console.log(error);
  }
}

function getQueryStrings() {
  var assoc = {};
  var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
  var queryString = location.search.substring(1);
  var keyValues = queryString.split('&');

  for (var i in keyValues) {
    var key = keyValues[i].split('=');
    if (key.length > 1) {
      assoc[decode(key[0])] = decode(key[1]);
    }
  }

  return assoc;
}

function handicapHole(golferHcp, holeHcp) {
  if (golferHcp < 0) {
    if ((18 + golferHcp) < holeHcp) {
      return -1;
    }
    else { return 0; }
  }
  else if (golferHcp == 0) {
    return 0;
  }
  else {
    if (golferHcp >= holeHcp) {
      return 1;
    }
    else { return 0; }
  }
}

$("#holeMenu").on("click", "li", function () {
  //Save scores to server
  let golfersHoleScores={};

  //get the code
  for (const property in getQueryStrings()) {
    if (property == "code"){
      golfersHoleScores.code = getQueryStrings()[property];
      break;
    }
  }

  //TODO:read this from local storage!!!!
  golfersHoleScores.scores = [];
  game.scorecard.golfers.forEach((golfer, i) => {
    golfersHoleScores.scores.push({golfer:golfer.name,score:currentHoleScore(i + 1)});
  });

  golfersHoleScores.holeNumber = currentHole();
  saveHole(golfersHoleScores).then((data) => {
    console.log(data); // JSON data parsed by `data.json()` call
  });

  if ($(this).text() == 'Previous') {
    if (currentHole() > 1) {
      let previousHole = currentHole() - 1;
      $("#holeMenu").children().removeClass("active");
      $(`#hole${previousHole}MenuItem`).addClass("active");
    }
  }
  else if ($(this).text() == 'Next') {
    if (currentHole() < 18) {
      let nextHole = currentHole() + 1;
      $("#holeMenu").children().removeClass("active");
      $(`#hole${nextHole}MenuItem`).addClass("active");
    }
  }
  else {
    $("#holeMenu").children().removeClass("active");
    $(this).addClass("active");
  }
  bindCurrentHoleInfo();
});

function currentHole() {
  let hole = parseInt($("#holeMenu").children(".active").text());
  return hole;
}

function currentHoleScore(golferNumber){
  return $(`#golfer${golferNumber}HoleScore`).val();
}

function bindCurrentHoleInfo() {
  for (let i = 1; i <= 4; i++) {
  }

  game.scorecard.golfers.forEach((golfer, i) => {
    $(`#golfer${i + 1}HolePar`).text(getTee(golfer)[`hole${currentHole()}Par`]);
    $(`#golfer${i + 1}HoleHcp`).text(getTee(golfer)[`hole${currentHole()}Hcp`]);

    //if we have a score for this hole bind it
    if (golfer.scores[currentHole() - 1]) {
      $(`#golfer${i + 1}HoleScore`).val(golfer.scores[currentHole() - 1]);
      $(`#golfer${i + 1}HoleScore`).removeClass("bg-warning");
      $(`#golfer${i + 1}HoleScore`).addClass("bg-success");
    }
    else {
      let golferExpectedScore = getTee(golfer)[`hole${currentHole()}Par`] + handicapHole(golfer.hcp, getTee(golfer)[`hole${currentHole()}Hcp`]);
      $(`#golfer${i + 1}HoleScore`).val(golferExpectedScore);
      $(`#golfer${i + 1}HoleScore`).removeClass("bg-success");
      $(`#golfer${i + 1}HoleScore`).addClass("bg-warning");
    }
  });
}

function bindGolferInfo() {
  game.scorecard.golfers.forEach((golfer, i) => {
    $(`#golfer${i + 1}`).text(golfer.name);
    $(`#golfer${i + 1}Tee`).text(golfer.tee);
    $(`#golfer${i + 1}Hcp`).text(golfer.hcp);
  });
}

function getTee(golfer) {
  return game.tees.find((element) => element.name == golfer.tee);
}

function getGolfer(golferNumber) {
  return game.scorecard.golfers[golferNumber - 1];
}

async function saveHole(golfersHoleScores) {
  // Default options are marked with *
  const response = await fetch(cURL, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(golfersHoleScores), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}