var serve = document.getElementsByClassName("wprm-recipe-details-unit wprm-recipe-servings-unit")[0].innerHTML;
console.log('serve is', serve);
var scalingFactors = {
  0: [1, 1.5, 2, 2.5, 3],
  1: [0.666, 1, 1.5, 2, 2.5],
  2: [0.25, 0.75, 1, 1.5, 2],
  3: [0.125, 0.25, 0.75, 1, 1.5],
  4: [0.0625, 0.125, 0.5625, 0.75, 1]
}

// sometimes has the word 'serves' in it
// sometimes it is a range of values
// accepts a string that contains the serving in it
// returns the full serving without the serves text.
function parseServing(serveText) {
  var lowerText = serveText.toLowerCase();
  var serves = 'serves';
  if (lowerText.indexOf(serves) > -1) {
    console.log('in here bro');
    lowerText = lowerText.slice(lowerText.indexOf(serves) + serves.length + 1)
  }
  return lowerText;
}

// function for whether or not the serving is a ranged serving or not.
// 1 -- false
// 12 -- false
// 1-2 -- true
function isServingRange(parsedServing) {
  return parsedServing.indexOf('-') > -1;
}

// takes a serving and creates an array that creates scalings from 2 to 10.
// input 4-6 -- [2-4, 4-6, 6-8, 8-10, 10-12]
function scaleServing(parsedServing) {
  var returnArray = [];
  var defaultInt = parseInt(parsedServing[0]);
  var isRange = isServingRange(parsedServing);
  var defaultIndex;
  for (var i = 2; i < 12; i += 2) {
    var obj = {};
    var displayText = isRange ? `${i}-${i+2}` : `${i}`;
    var isDefaultServing = defaultInt === i;
    if (isDefaultServing) {
      defaultIndex = (i / 2) - 1; // the index in the array of the default serving
      console.log('default index is', defaultIndex);
    }
    obj.displayText = displayText;
    obj.isDefaultServing = isDefaultServing;
    returnArray.push(obj);
  }
  var scalingFactors = [1, 1, 1, 1, 1];
  for (var j = 0; j < returnArray.length; j++) {


  }

  return returnArray;
}

var parsedServing = parseServing(serve);
var scaledServing = scaleServing(parsedServing);
console.log('parsedServing is', parsedServing);
console.log('scaledServing is', scaledServing);
