// [2-4, 4-6, 6-8, 8-10, 10-12]
var scalingFactors = {
  0: [1, 2, 3, 4, 5],
  1: [0.5, 1, 1.5, 2, 2.5],
  2: [0.333, 0.666, 1, 1.333, 1.666],
  3: [0.25, 0.5, 0.75, 1, 1.25],
  4: [0.20, 0.40, 0.60, 0.80, 1]
};

var servingArrays = {
  range: ['2-4', '4-6', '6-8', '8-10', '10-12'],
  noRange: ['2', '4', '6', '8', '10']
};

var SERVES = 'SERVES';

var context = {
  currentDisplay: '',
  currentScaling: 1,
};

// sometimes has the word 'serves' in it
// sometimes it is a range of values
// accepts a string that contains the serving in it
// returns the full serving without the serves text.
function parseServing(serveText) {
  var upperText = serveText.toUpperCase();
  if (upperText.indexOf(SERVES) > -1) {
    upperText = upperText.slice(upperText.indexOf(SERVES) + serves.length + 1)
  }
  return upperText;
}

function isRange(parsedServing) {
  return parsedServing.indexOf('-') > -1;
}

function isFraction(parsedServing) {
  return parsedServing.indexOf('/') > -1;
}

// function for whether or not the serving is a ranged serving or not.
// 1 -- noRange
// 12 -- noRange
// 1-2 -- range
function getRangeKey(parsedServing) {
  return isRange(parsedServing) ? 'range' : 'noRange';
}

// intake something like 6 or 6-8
// returns the low number in the range
function getDefaultServing(parsedServing) {
  return parsedServing.split('-')[0];
}

// intake something like 6
// return something like 2
function getDefaultIndex(defaultServing) {
  return (parseInt(defaultServing) / 2) - 1;
}

// takes a serving and creates an array that creates scalings from 2 to 10.
// input 4-6 -- [{'displayText': '2-4', 'scaling': 1, 'isDefaultServing': false}, ... ]
function scaleServing(parsedServing) {
  var rangeKey = getRangeKey(parsedServing);
  var defaultServing = getDefaultServing(parsedServing);
  var defaultIndex = getDefaultIndex(defaultServing);
  var servings = servingArrays[rangeKey]
  console.log('rangeKey is', rangeKey);
  console.log('servings is', servings);
  console.log('serving arrays', servingArrays);
  var scaling = scalingFactors[defaultIndex];

  var scaledServings = servings.map((item, index) => {
    return {
      isDefaultServing: index === defaultIndex,
      scaling: scaling[index],
      displayText: item,
    };
  });

  return scaledServings;
}

function createDropdown(scaledServings) {
  var select = document.createElement('select');
  select.setAttribute('id', 'serving-dropdown');
  for (var i = 0; i < scaledServings.length; i++) {
    var option = document.createElement('option');
    option.setAttribute('value', JSON.stringify(scaledServings[i]))
    option.innerHTML = scaledServings[i].displayText;
    select.appendChild(option);
    if (scaledServings[i].isDefaultServing) {
      select.value = JSON.stringify(scaledServings[i]);
      context.currentScaling = scaledServings[i].scaling;
      context.currentDisplay = scaledServings[i].displayText;
    }
  }
  return select;
}

// accepts either 1 or 1-2 or 1/2
// 1 returns parsed 1. 1-2 returns array of 1, 2 and 1-2 returns arry of 1,2
function splitIngredientAmount(amount, delimeter) {
  var returnArray = amount.split(delimeter);
  return returnArray.map(parseInt);
}

function getDelimeter(amount) {
  var delimeter;
  if (isRange(amount)) {
    delimeter = '-';
  } else if (isFraction(amount)) {
    delimeter = '/';
  }
  return delimeter;
}

// accepts an array of DOMnodes that contain amounts of ingredients.
// scales it by the chosen scaling factor.
function scaleAmounts(amounts) {
  for (var i = 0; i < amounts.length; i++) {
    var amount = amounts[i];
    var delimeter = getDelimeter(amount.innerHTML);
    var parsedAmount = splitIngredientAmount(amount.innerHTML, delimeter);
    if (delimeter === '/') {
      // do fraction stuff
    } else if (delimeter === '-') {
      // do range stuff
    } else {
      // do regular stuff
    }
  }
}

// execution
var serving = document.getElementsByClassName("wprm-recipe-details-unit wprm-recipe-servings-unit")[0];
if (serving) { // not all pages have serving information
  var serve = serving.innerHTML;
  console.log('serve is', serve);

  var parsedServing = parseServing(serve);
  var scaledServings = scaleServing(parsedServing);
  console.log('parsedServing is', parsedServing);
  console.log('scaledServing is', scaledServings);
  var select = createDropdown(scaledServings);
  serving.replaceChild(select, serving.childNodes[0]); // first argument, node to replace. second is node to be replaced.
  var amounts = document.getElementsByClassName("wprm-recipe-ingredient-amount");
  scaleAmounts(amounts)
}
