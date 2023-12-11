$(function() {
  console.log( "ready!" );
  getTGC_Scorecards();
});

async function getTGC_Scorecards() {
  console.log("calling api getTGC_Scorecards");
  var qs = getQueryStrings();
  var code = qs["code"];
  var deploymetId = "AKfycbzSYWSMzPgX8E0Pa5TwcC3lucELsOjgIIXx5mehCmXZGa4XTPNiU8Ua7lDgKJaCpapJCQ";
  const response = await fetch(`https://script.google.com/macros/s/${deploymetId}/exec?code=${code}`);
  const scoreCard = await response.json();
  console.log(JSON.stringify(scoreCard));
  $("#game").text(scoreCard[0].Game.Name);
  $("#golfer1").text(scoreCard[0].Game.Golfers[0].Name);
  $("#golfer2").text(scoreCard[0].Game.Golfers[1].Name);
  $("#golfer3").text(scoreCard[0].Game.Golfers[2].Name);
  $("#golfer4").text(scoreCard[0].Game.Golfers[3].Name);
  $("#golfer1Tee").text(scoreCard[0].Game.Golfers[0].Tee);
  $("#golfer2Tee").text(scoreCard[0].Game.Golfers[1].Tee);
  $("#golfer3Tee").text(scoreCard[0].Game.Golfers[2].Tee);
  $("#golfer4Tee").text(scoreCard[0].Game.Golfers[3].Tee);
  $("#golfer1Hcp").text(scoreCard[0].Game.Golfers[0].Hcp);
  $("#golfer2Hcp").text(scoreCard[0].Game.Golfers[1].Hcp);
  $("#golfer3Hcp").text(scoreCard[0].Game.Golfers[2].Hcp);
  $("#golfer4Hcp").text(scoreCard[0].Game.Golfers[3].Hcp);
  console.log($("#game"));
  console.log(scoreCard[0].Game.Name);
}

function getQueryStrings() { 
  var assoc  = {};
  var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
  var queryString = location.search.substring(1); 
  var keyValues = queryString.split('&'); 

  for(var i in keyValues) { 
    var key = keyValues[i].split('=');
    if (key.length > 1) {
      assoc[decode(key[0])] = decode(key[1]);
    }
  } 

  return assoc; 
}