// FRACTION CLASS
// accepts an improper fraction as a string param ('1/2', '5/2')
// toString class returns a mixed num rounded to nearest param for display.
// i.e
function Fraction(mixedNum) {
  var parts = mixedNum.split('/');
  this.num = parseInt(parts[0]);
  this.denom = parts.length > 1 ? parseInt(parts[1]) : 1;
  return this;
}

Fraction.prototype.multiply = function(otherFrac) {
  this.num *=  otherFrac.num;
  this.denom *= otherFrac.denom;
}

Fraction.prototype.toString = function() {
  var NEAREST_DENOM = 4; // constant
  var nearestNum = 1;
  var mixedNum = this.num;
  // convert to common base
  nearestNum *= this.denom;
  mixedNum *= NEAREST_DENOM;

  // find out how many parts are in the improper fraction.
  var numParts = 0;
  while (mixedNum >= nearestNum) {
    numParts += 1;
    mixedNum -= nearestNum;
  }

  // if mixedNum is greater than or equal to 1/2 of nearestNum, add one to numParts.
  // this rounds to the nearest fraction.
  if (mixedNum >= (nearestNum / 2)) {
    numParts += 1;
  }
  console.log('NUMPARTS IS', numParts);

  // extract whole numbers out of the parts
  var whole = 0;
  while (numParts >= NEAREST_DENOM) {
    whole += 1;
    numParts -= NEAREST_DENOM;
  }

  console.log('WHOLE IS', whole);

  if (!frac) {
    return `${whole}`;
  }

  // reduce to 1/2 if there are 2 4ths left over.
  var frac;
  if (numParts === 2) {
    frac = '1/2';
  } else {
    frac = `${numParts}/${NEAREST_DENOM}`;
  }

  // if there was a whole number in the improper fraction, return that, else just the frac
  return whole ? `${whole} ${frac}` : frac;
}

// var frac1 = new Fraction('1/2');
// console.log('to string is', frac1.toString());
var frac2 = new Fraction('10/5');
console.log('to string is', frac2.toString());

// [2-4, 4-6, 6-8, 8-10, 10-12]
var scalingFactors = {
  0: [new Fraction('1/1'), new Fraction('2/1'), new Fraction('3/1'), new Fraction('4/1'), new Fraction('5/1')],
  1: [new Fraction('1/2'), new Fraction('2/2'), new Fraction('3/2'), new Fraction('4/2'), new Fraction('5/2')],
  2: [new Fraction('1/3'), new Fraction('2/3'), new Fraction('3/3'), new Fraction('4/3'), new Fraction('5/3')],
  3: [new Fraction('1/4'), new Fraction('2/4'), new Fraction('3/4'), new Fraction('4/4'), new Fraction('5/4')],
  4: [new Fraction('1/5'), new Fraction('2/5'), new Fraction('3/5'), new Fraction('4/5'), new Fraction('5/5')],
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

function scaleAndRound(amount, scale) {

}

// accepts an array of DOMnodes that contain amounts of ingredients.
// scales it by the chosen scaling factor.
function scaleAmounts(amounts) {
  for (var i = 0; i < amounts.length; i++) {
    var amount = amounts[i];
    var delimeter = getDelimeter(amount.innerHTML);
    var parsedAmount = splitIngredientAmount(amount.innerHTML, delimeter);
    if (delimeter === '/') {
      parsedAmount = [(parseInt(parsedAmount[0]) / parseInt(parsedAmount[1])).toString()]
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
  // cache the initial amounts. Need to scale from here for the session;
  scaleAmounts(amounts)
}
