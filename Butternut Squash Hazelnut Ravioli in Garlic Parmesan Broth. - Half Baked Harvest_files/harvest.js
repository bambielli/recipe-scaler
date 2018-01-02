var spotlights = jQuery(".index-spotlight a");
function spotlightSizer(el) {
  // get heights of all the elements
  var lengths = [];
  for(i=0; i < el.length; i++) {
    var length = el[i].offsetHeight;
    lengths.push(length);
  }
  lengths.sort();
  var longest = el[lengths.length - 1];
  var newHeight = el[lengths.length - 1].offsetHeight;
  // var newStyle = "min-height: " + lengths[lengths.length - 1].offsetHeight;
  // add style to the elements
  for(h=0; h < el.length; h++) {
    el[h].style.minHeight = newHeight + 30 + "px";
  }
  // sheet.insertRule(".index-spotlight a { min-height: " + minHeight + " }");
} 
spotlightSizer(spotlights);





