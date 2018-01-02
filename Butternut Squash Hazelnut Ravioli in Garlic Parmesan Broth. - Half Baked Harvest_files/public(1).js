var wprm = wprm || {};

if (wprmp_public.settings.template_ingredient_list_style == 'checkbox' || wprmp_public.settings.template_instruction_list_style == 'checkbox') {

    jQuery(document).ready(function($) {
        var list_items = '';
        if (wprmp_public.settings.template_ingredient_list_style == 'checkbox' && wprmp_public.settings.template_instruction_list_style == 'checkbox') {
            list_items = 'li.wprm-recipe-ingredient, li.wprm-recipe-instruction';
        } else {
            list_items = wprmp_public.settings.template_ingredient_list_style == 'checkbox' ? 'li.wprm-recipe-ingredient' : 'li.wprm-recipe-instruction';
        }
        
        // Ingredient checkboxes
        jQuery(list_items).each(function() {
            jQuery(this).addClass('wprm-list-checkbox-container').prepend('<span class="wprm-list-checkbox"></span>')
        });

        jQuery(document).on('click', '.wprm-list-checkbox', function() {
            var checkbox = jQuery(this),
                container = checkbox.parents('.wprm-list-checkbox-container');

            checkbox.toggleClass('wprm-list-checkbox-checked');
            container.toggleClass('wprm-list-checkbox-checked');
        });
    });
}
var wprm = wprm || {};

if (wprmp_public.settings.features_adjustable_servings) {
	wprm.analyze_quantities = function(recipe) {
		var servings = parseInt(recipe.find('.wprm-recipe-servings').data('original_servings'));
		if(servings > 0) {
			recipe.find('.wprm-recipe-ingredient-amount, .wprm-dynamic-quantity').each(function() {
				// Only do this once.
				if(0 === jQuery(this).find('.wprm-adjustable').length) {
					// Surround all the number blocks
					var quantity = jQuery(this),
						quantity_text = quantity.text();
					var fractions = '\u00BC\u00BD\u00BE\u2150\u2151\u2152\u2153\u2154\u2155\u2156\u2157\u2158\u2159\u215A\u215B\u215C\u215D\u215E';
					var number_regex = '[\\d'+fractions+']([\\d'+fractions+'.,\\/\\s]*[\\d'+fractions+'])?';
					var substitution = '<span class="wprm-adjustable">$&</span>';

					quantity_text = quantity_text.replace(new RegExp(number_regex, 'g'), substitution);
					quantity.html(quantity_text);
				}
			});

			recipe.find('.wprm-adjustable').each(function() {
				// Only do this once.
				if('undefined' == typeof jQuery(this).data('original_quantity')) {
					var quantity = wprm.parse_quantity(jQuery(this).text());
					quantity /= servings;

					jQuery(this)
						.data('original_quantity', jQuery(this).text())
						.data('unit_quantity', quantity);
				}
			});
		}
	};

	wprm.update_serving_size = function(recipe) {
		var servings_element = recipe.find('.wprm-recipe-servings'),
			servings = parseInt(servings_element.data('servings')),
			original_servings = servings_element.data('original_servings');

		var adjustable_quantities = recipe.find('.wprm-adjustable');
		
		if(adjustable_quantities.length == 0) {
			wprm.analyze_quantities(recipe);
			adjustable_quantities = recipe.find('.wprm-adjustable');
		}

		adjustable_quantities.each(function() {
			var quantity_element = jQuery(this);

			if(servings == original_servings) {
				quantity_element.text(quantity_element.data('original_quantity'));
			} else {
				var quantity = parseFloat(quantity_element.data('unit_quantity')) * servings;

				if(!isNaN(quantity)) {
					quantity_element.text(wprm.format_quantity(quantity));
				}
			}
		});
	};

	wprm.format_quantity = function(quantity) {
		return parseFloat(quantity.toFixed(2));
	};

	wprm.parse_quantity = function(sQuantity) {
		// Use . for decimals
		sQuantity = sQuantity.replace(',', '.');

		// Replace fraction characters with equivalent
		var fractionsRegex = /(\u00BC|\u00BD|\u00BE|\u2150|\u2151|\u2152|\u2153|\u2154|\u2155|\u2156|\u2157|\u2158|\u2159|\u215A|\u215B|\u215C|\u215D|\u215E)/;
		var fractionsMap = {
			'\u00BC': ' 1/4', '\u00BD': ' 1/2', '\u00BE': ' 3/4', '\u2150': ' 1/7',
			'\u2151': ' 1/9', '\u2152': ' 1/10', '\u2153': ' 1/3', '\u2154': ' 2/3',
			'\u2155': ' 1/5', '\u2156': ' 2/5', '\u2157': ' 3/5', '\u2158': ' 4/5',
			'\u2159': ' 1/6', '\u215A': ' 5/6', '\u215B': ' 1/8', '\u215C': ' 3/8',
			'\u215D': ' 5/8', '\u215E': ' 7/8'
		};
		sQuantity = (sQuantity + '').replace(fractionsRegex, function(m, vf) {
			return fractionsMap[vf];
		});

		// Split by spaces
		sQuantity = sQuantity.trim();
		var parts = sQuantity.split(' ');

		var quantity = false;

		if(sQuantity !== '') {
			quantity = 0;

			// Loop over parts and add values
			for(var i = 0; i < parts.length; i++) {
				if(parts[i].trim() !== '') {
					var division_parts = parts[i].split('/', 2);
					var part_quantity = parseFloat(division_parts[0]);

					if(division_parts[1] !== undefined) {
						var divisor = parseFloat(division_parts[1]);

						if(divisor !== 0) {
							part_quantity /= divisor;
						}
					}

					quantity += part_quantity;
				}			
			}
		}

		return quantity;
	};

	wprm.set_print_servings = function(servings) {
		if(servings > 0) {
			var recipe = jQuery('body');

			jQuery('.wprm-recipe-servings').each(function() {
				jQuery(this).text(servings);
				jQuery(this).data('servings', servings);
			});

			wprm.update_serving_size(recipe);
		}
	};

	wprm.init_tooltip_slider = function(servings_element) {
		// Make the servings a link
		servings_element.wrap('<a href="#" class="wprm-recipe-servings-link"></a>');

		// Add tooltip
		servings_element.tooltipster({
			content: '<input type="range" min="1" max="1" value="1" class="wprm-recipe-servings-slider">',
			contentAsHTML: true,
			functionBefore: function() {
				var instances = jQuery.tooltipster.instances();
				jQuery.each(instances, function(i, instance){
					instance.close();
				});
			},
			functionReady: function(instance, helper) {
				var max = 20,
					value = parseInt(jQuery(helper.origin).text());

				if( max < 2*value ) {
					max = 2*value;
				}

				// Set reference to correct servings changer.
				var uid = Date.now();
				jQuery(helper.origin).attr('id', 'wprm-tooltip-' + uid);

				jQuery(helper.tooltip)
					.find('.wprm-recipe-servings-slider').attr('max', max)
					.data('origin', 'wprm-tooltip-' + uid)
					.val(value);
			},
			interactive: true,
			delay: 0,
			trigger: 'custom',
			triggerOpen: {
				mouseenter: true,
				touchstart: true
			},
			triggerClose: {
				click: true,
				tap: true
			},
		});

		jQuery(document).on('input change', '.wprm-recipe-servings-slider', function() {
			var servings = jQuery(this).val(),
				origin = jQuery(this).data('origin'),
				servings_element = jQuery('#' + origin),
				recipe = servings_element.parents('.wprm-recipe-container');

			// Make sure all serving elements within this recipe are changed
			recipe.find('.wprm-recipe-servings').each(function() {
				jQuery(this).text(servings);
				jQuery(this).data('servings', servings);
			});
			wprm.update_serving_size(recipe);
		});

		jQuery(document).on('click', '.wprm-recipe-servings-link', function(e) {
			e.preventDefault();
			e.stopPropagation();
		});
	};

	wprm.init_text_field = function(servings_element) {
		var servings = servings_element.data('servings'),
			input = '<input type="number" class="wprm-recipe-servings" min="1" value="' + servings + '" data-servings="' + servings + '" data-original_servings="' + servings + '" />';

		servings_element.replaceWith(input);

		jQuery(document).on('input change', '.wprm-recipe-servings', function() {
			var servings_element = jQuery(this),
				servings = servings_element.val(),
				recipe = servings_element.parents('.wprm-recipe-container');

			// Make sure all serving elements within this recipe are changed
			recipe.find('.wprm-recipe-servings').each(function() {
				jQuery(this).val(servings);
				jQuery(this).data('servings', servings);
			});
			wprm.update_serving_size(recipe);
		});
	};

	jQuery(document).ready(function($) {
		jQuery('.wprm-recipe-servings').each(function() {
			var servings_element = jQuery(this),
				servings = parseInt(servings_element.text());

			if( servings > 0 ) {
				// Save original servings
				servings_element.data('servings', servings);
				servings_element.data('original_servings', servings);

				if( !jQuery('body').hasClass('wprm-print')) {
					if(wprmp_public.settings.servings_changer_display == 'text_field') {
						wprm.init_text_field(servings_element);
					} else { // Default = Tooltip Slider
						wprm.init_tooltip_slider(servings_element);
					}
				}
			}
		});
	});
}

var wprm = wprm || {};

wprm.timer_seconds = 0;
wprm.timer_seconds_remaining = 0;
wprm.timer_alarm_sound = 'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=';
wprm.timer = undefined;
wprm.alarm_timer = undefined;

wprm.timer_play = function() {
    jQuery('#wprm-timer-play').hide();
    jQuery('#wprm-timer-pause').show();

    clearInterval(wprm.timer);
    wprm.timer = setInterval(wprm.update_timer, 1000);
};

wprm.timer_pause = function() {
    jQuery('#wprm-timer-pause').hide();
    jQuery('#wprm-timer-play').show();
    
    clearInterval(wprm.timer);
};

wprm.update_timer = function() {
    wprm.timer_seconds_remaining--;
    if(wprm.timer_seconds_remaining <= 0) {
        wprm.timer_seconds_remaining = 0;
        wprm.timer_finished();
    }

    jQuery('#wprm-timer-remaining').text(wprm.timer_seconds_to_hms(wprm.timer_seconds_remaining));

    var percentage_elapsed = 100 * (wprm.timer_seconds - wprm.timer_seconds_remaining) / wprm.timer_seconds;
    jQuery('#wprm-timer-bar-elapsed').css('width', percentage_elapsed + '%');
};

wprm.timer_finished = function() {
    // Clear existing timers.
    wprm.timer_pause();
    clearInterval(wprm.alarm_timer);

    // Keep sounding alarm and pulsate background until closed.
    wprm.timer_finished_sequence();
    wprm.timer = setInterval(wprm.timer_finished_sequence, 2000);
};

wprm.timer_finished_sequence = function() {
    wprm.timer_play_alarm();

    jQuery('#wprm-timer-container')
        .animate({ opacity: 0.5 }, 500 )
        .animate({ opacity: 1 }, 500 )
        .animate({ opacity: 0.5 }, 500 )
        .animate({ opacity: 1 }, 500 );
};

wprm.timer_play_alarm = function() {
    var alarm = new Audio(wprm.timer_alarm_sound);
    wprm.alarm_timer = setInterval(function() { alarm.play() }, 250);
    setTimeout(function() { clearInterval(wprm.alarm_timer); }, 1250);
};

wprm.open_timer = function(seconds) {
    wprm.remove_timer(function() {
        if(seconds > 0) {
            wprm.timer_seconds = seconds;
            wprm.timer_seconds_remaining = seconds;

            var timer = jQuery('<div id="wprm-timer-container"></div>').hide(),
                play = jQuery('<span id="wprm-timer-play" class="wprm-timer-icon">' + wprmp_timer.icons.play + '</span>'),
                pause = jQuery('<span id="wprm-timer-pause" class="wprm-timer-icon">' + wprmp_timer.icons.pause + '</span>'),
                time_remaining = jQuery('<span id="wprm-timer-remaining"></span>'),
                bar = jQuery('<span id="wprm-timer-bar-container"><span id="wprm-timer-bar"><span id="wprm-timer-bar-elapsed"></span></span></span>'),
                close = jQuery('<span id="wprm-timer-close" class="wprm-timer-icon">' + wprmp_timer.icons.close + '</span>');

            time_remaining.text(wprm.timer_seconds_to_hms(seconds));

            timer
                .append(play)
                .append(pause)
                .append(time_remaining)
                .append(bar)
                .append(close);

            jQuery('body').append(timer);
            wprm.timer_play();
            timer.fadeIn();
        }
    });
};

wprm.remove_timer = function(callback) {
    clearInterval(wprm.timer);
    clearInterval(wprm.alarm_timer);
    var timer = jQuery('#wprm-timer-container');

    if(timer.length > 0) {
        timer.clearQueue();
        timer.fadeOut(400, function() {
            timer.remove();
            if(callback !== undefined) {
                callback();
            }
        });
    } else {
        if(callback !== undefined) {
            callback();
        }
    }
}

wprm.timer_seconds_to_hms = function(s) {
    var h = Math.floor(s/3600);
    s -= h*3600;
    var m = Math.floor(s/60);
    s -= m*60;
    return (h < 10 ? '0'+h : h)+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s);
}


jQuery(document).ready(function($) {
	jQuery('.wprm-timer').each(function() {
		var timer_element = jQuery(this),
				seconds = parseInt(timer_element.data('seconds'));

		if( seconds > 0 ) {
			if( !jQuery('body').hasClass('wprm-print')) {
				// Make the servings a link
				timer_element.wrap('<a href="#" class="wprm-timer-link"></a>');

				// Add tooltip
				timer_element.tooltipster({
					content: wprmp_timer.text.start_timer,	
					interactive: true,
					delay: 0,
					trigger: 'hover',
				});
			}
		}
	});


	jQuery(document).on('click', '.wprm-timer-link', function(e) {
		e.preventDefault();
		e.stopPropagation();

        var seconds = parseInt(jQuery(this).find('.wprm-timer').data('seconds'));
        wprm.open_timer(seconds);
	});

	jQuery(document).on('click', '#wprm-timer-play', function(e) {
		wprm.timer_play();
	});
    jQuery(document).on('click', '#wprm-timer-pause', function(e) {
		wprm.timer_pause();
	});
    jQuery(document).on('click', '#wprm-timer-close', function(e) {
		wprm.remove_timer();
	});
});

var wprm = wprm || {};

if (wprmp_public.settings.features_user_ratings) {
	
	jQuery(document).ready(function($) {
		var color = wprmp_public.settings.template_color_icon;

		jQuery(document).on('mouseenter', '.wprm-user-rating-allowed .wprm-rating-star', function() {
			jQuery(this).prevAll().andSelf().each(function() {
				jQuery(this).find('polygon').css('fill', color);
			});
			jQuery(this).nextAll().each(function() {
				jQuery(this).find('polygon').css('fill', 'none');
			});
		});
		jQuery(document).on('mouseleave', '.wprm-user-rating-allowed .wprm-rating-star', function() {
			jQuery(this).siblings().andSelf().each(function() {
				jQuery(this).find('polygon').css('fill', '');
			});
		});

		jQuery(document).on('click', '.wprm-user-rating-allowed .wprm-rating-star', function() {
			var star = jQuery(this),
				rating_container = star.parents('.wprm-recipe-rating'),
				rating = star.data('rating'),
				recipe_id = star.parents('.wprm-recipe-container').data('recipe-id');

			// Update current view.
			if(rating_container.length > 0) {
				var count = rating_container.data('count'),
					total = rating_container.data('total'),
					user = rating_container.data('user');

				if(user > 0) {
					total -= user;
				} else {
					count++;
				}

				total += rating;

				var average = Math.ceil(total/count * 100) / 100;

				// Upate details.
				rating_container.find('.wprm-recipe-rating-average').text(average);
				rating_container.find('.wprm-recipe-rating-count').text(count);

				// Update stars.
				var stars = Math.ceil(average);

				for(var i = 1; i <= 5; i++) {
					var star = rating_container.find('.wprm-rating-star-' + i);
					star.removeClass('wprm-rating-star-full').removeClass('wprm-rating-star-empty');

					if(i <= stars) {
						star.addClass('wprm-rating-star-full');
					} else {
						star.addClass('wprm-rating-star-empty');
					}
				}
			}

			// Update rating via AJAX.
			var data = {
				action: 'wprm_user_rate_recipe',
				security: wprm_public.nonce,
				recipe_id: recipe_id,
				rating: rating
			};
	
			jQuery.post(wprm_public.ajax_url, data);
		});
	});
}
