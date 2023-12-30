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

  golfersHoleScores.scores = [{golfer:getGolfer(1).name,score:currentHoleScore(1)},
                              {golfer:getGolfer(2).name,score:currentHoleScore(2)},
                              {golfer:getGolfer(3).name,score:currentHoleScore(3)},
                              {golfer:getGolfer(4).name,score:currentHoleScore(4)}];
  golfersHoleScores.holeNumber = currentHole();

  console.log(JSON.stringify(golfersHoleScores));

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
    $(`#golfer${i}HolePar`).text(getTee(getGolfer(i))[`hole${currentHole()}Par`]);
    $(`#golfer${i}HoleHcp`).text(getTee(getGolfer(i))[`hole${currentHole()}Hcp`]);

    //if we have a score for this hole bind it
    if (getGolfer(i).scores[currentHole() - 1]) {
      $(`#golfer${i}HoleScore`).val(getGolfer(i).scores[currentHole() - 1]);
      $(`#golfer${i}HoleScore`).removeClass("bg-warning");
      $(`#golfer${i}HoleScore`).addClass("bg-success");
    }
    else {
      let golferExpectedScore = getTee(getGolfer(i))[`hole${currentHole()}Par`] + handicapHole(getGolfer(i).hcp, getTee(getGolfer(i))[`hole${currentHole()}Hcp`]);
      $(`#golfer${i}HoleScore`).val(golferExpectedScore);
      $(`#golfer${i}HoleScore`).removeClass("bg-success");
      $(`#golfer${i}HoleScore`).addClass("bg-warning");
    }
  }
}

function bindGolferInfo() {
  $("#golfer1").text(getGolfer(1).name);
  $("#golfer2").text(getGolfer(2).name);
  $("#golfer3").text(getGolfer(3).name);
  $("#golfer4").text(getGolfer(4).name);
  $("#golfer1Tee").text(getGolfer(1).tee);
  $("#golfer2Tee").text(getGolfer(2).tee);
  $("#golfer3Tee").text(getGolfer(3).tee);
  $("#golfer4Tee").text(getGolfer(4).tee);
  $("#golfer1Hcp").text(getGolfer(1).hcp);
  $("#golfer2Hcp").text(getGolfer(2).hcp);
  $("#golfer3Hcp").text(getGolfer(3).hcp);
  $("#golfer4Hcp").text(getGolfer(4).hcp);
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