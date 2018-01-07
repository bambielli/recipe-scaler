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
  var num = this.num * otherFrac.num;
  var denom = this.denom * otherFrac.denom;
  return new Fraction(`${num}/${denom}`);
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

  // extract whole numbers out of the parts
  var whole = 0;
  while (numParts >= NEAREST_DENOM) {
    whole += 1;
    numParts -= NEAREST_DENOM;
  }

  if (numParts === 0) {
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
  return whole ? whole + " " + frac : frac;
}

// [2-4, 4-6, 6-8, 8-10, 10-12]
var SCALING_FACTORS = {
  0: [new Fraction('1/1'), new Fraction('2/1'), new Fraction('3/1'), new Fraction('4/1'), new Fraction('5/1')],
  1: [new Fraction('1/2'), new Fraction('2/2'), new Fraction('3/2'), new Fraction('4/2'), new Fraction('5/2')],
  2: [new Fraction('1/3'), new Fraction('2/3'), new Fraction('3/3'), new Fraction('4/3'), new Fraction('5/3')],
  3: [new Fraction('1/4'), new Fraction('2/4'), new Fraction('3/4'), new Fraction('4/4'), new Fraction('5/4')],
  4: [new Fraction('1/5'), new Fraction('2/5'), new Fraction('3/5'), new Fraction('4/5'), new Fraction('5/5')],
};

var SERVING_ARRAYS = {
  range: ['2-4', '4-6', '6-8', '8-10', '10-12'],
  noRange: ['2', '4', '6', '8', '10']
};

var SERVES = 'SERVES';

var cache = {
  cachedAmounts: [],
  servings: [],
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
function enumerateServings(parsedServing) {
  var rangeKey = getRangeKey(parsedServing);
  var defaultServing = getDefaultServing(parsedServing);
  var defaultIndex = getDefaultIndex(defaultServing);
  var servings = SERVING_ARRAYS[rangeKey]
  var scaling = SCALING_FACTORS[defaultIndex];
  var scaledServings = servings.map((item, index) => {
    return {
      isDefaultServing: index === defaultIndex,
      scaling: scaling[index],
      displayText: item,
    };
  });

  return scaledServings;
}

// TODO: reevaluate if storing the entire json blob in HTML is necessary.
function createDropdown(scaledServings) {
  var select = document.createElement('select');
  select.setAttribute('id', 'serving-dropdown');
  for (var i = 0; i < scaledServings.length; i++) {
    var option = document.createElement('option');
    option.setAttribute('value', i)
    option.innerHTML = scaledServings[i].displayText;
    select.appendChild(option);
    if (scaledServings[i].isDefaultServing) {
      select.value = i;
    }
  }
  select.onchange = onServingChange;
  return select;
}

// array of arrays.
// each item in the array either represents a fraction
// a whole number.
// or has two entries which represent the top and bottom portions of the ingredient range.
function getAmountsFromDomNodes(amounts) {
  var amountValues = [];
  for (var i = 0; i < amounts.length; i++) {
    var amount = amounts[i].innerHTML;
    if (isRange(amount)) {
      // this is when it is a range of numbers
      parts = amount.split('-');
      amount = [new Fraction(parts[0]), new Fraction(parts[1])];
    } else {
      // this is when it is just a single number
      // or when it is a fraction
      amount = [new Fraction(amount)];
    }
    amountValues.push(amount);
  }
  return amountValues;
}

// accepts an array of DOMnodes that contain amounts of ingredients.
// scales it by the chosen scaling factor.
// returns the scaled version of the cached values for the current scale.
function scaleAmounts(amounts, scale) {
  var scaledArrayOfAmounts = [];
  for (var i = 0; i < amounts.length; i++) {
    var amountArray = amounts[i];
    amountArray = amountArray.map((item) => {
      return item.multiply(scale);
    });
    scaledArrayOfAmounts.push(amountArray);
  }
  return scaledArrayOfAmounts;
}

// used when serving changes to update the dom.
function onServingChange(e) {
  var index = parseInt(e.target.value);
  var currentScaling = cache.servings[index].scaling;
  var afterScaling = scaleAmounts(cache.cachedAmounts, currentScaling);
  var amountsFromDom = document.getElementsByClassName("wprm-recipe-ingredient-amount");
  for(var i = 0; i < amountsFromDom.length; i++) {
    var domNode = amountsFromDom[i];
    var amount = afterScaling[i].length === 1 ? afterScaling[i][0].toString() : `${afterScaling[i][0].toString()}-${afterScaling[i][1].toString()}`;
    domNode.innerHTML = amount;
  }
}

// execution
var serving = document.getElementsByClassName("wprm-recipe-details-unit wprm-recipe-servings-unit")[0];
if (serving) { // not all pages have serving information
  var serve = serving.innerHTML;

  // parse serving out of dom and construct the appropriate array of options.
  var parsedServing = parseServing(serve);
  var enumeratedServings = enumerateServings(parsedServing);
  cache.servings = enumeratedServings;

  // create the dropdown from the serving options. attachn onchange handler.
  var select = createDropdown(enumeratedServings);
  serving.replaceChild(select, serving.childNodes[0]); // first argument, node to replace. second is node to be replaced.
  var descriptionText = document.createElement('div');
  descriptionText.innerHTML = 'Scale your recipe with the dropdown'
  serving.appendChild(descriptionText);

  // scrape ingredients from dom, cache for reference later.
  var amountsFromDom = document.getElementsByClassName("wprm-recipe-ingredient-amount");
  cache.cachedAmounts = getAmountsFromDomNodes(amountsFromDom);
} else {
  console.log('no serving was detected');
}
