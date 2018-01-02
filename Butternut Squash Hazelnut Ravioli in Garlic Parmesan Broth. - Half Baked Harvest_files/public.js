var wprm = wprm || {};

if (wprm_public.settings.features_comment_ratings) {
	jQuery(document).ready(function($) {
		if (jQuery('.wprm-recipe-container').length > 0 || jQuery('body.wp-admin').length > 0) {
			jQuery('.comment-form-wprm-rating').show();

			var color = jQuery('.comment-form-wprm-rating').data('color');

			jQuery(document).on('mouseenter', '.comment-form-wprm-rating .wprm-rating-star', function() {
				jQuery(this).prevAll().andSelf().each(function() {
					jQuery(this).find('polygon').css('fill', color);
				});
				jQuery(this).nextAll().each(function() {
					jQuery(this).find('polygon').css('fill', 'none');
				});
			});
			jQuery(document).on('mouseleave', '.comment-form-wprm-rating .wprm-rating-star', function() {
				jQuery(this).siblings().andSelf().each(function() {
					jQuery(this).find('polygon').css('fill', '');
				});
			});
			jQuery(document).on('click', '.comment-form-wprm-rating .wprm-rating-star', function() {
				var star = jQuery(this),
					rating = star.data('rating'),
					input = star.parents('.comment-form-wprm-rating').find('#wprm-comment-rating'),
					current_rating = input.val();

				if (current_rating == rating) {
					input.val('');

					jQuery(this).siblings('').andSelf().each(function() {
						jQuery(this).removeClass('rated');
					});
				} else {
					input.val(rating);

					jQuery(this).prevAll().andSelf().each(function() {
						jQuery(this).addClass('rated');
					});
					jQuery(this).nextAll().each(function() {
						jQuery(this).removeClass('rated');
					});
				}
			});
		} else {
			// Hide when no recipe is found.
			jQuery('.comment-form-wprm-rating').hide();
		}
	});
}

var wprm = wprm || {};

wprm.print_recipe = function(recipe_id, servings, system) {
		var print_window = window.open(wprm_public.home_url + 'wprm_print/' + recipe_id, '_blank');
		print_window.onload = function() {
			print_window.focus();
			print_window.document.title = document.title;
			print_window.history.pushState('', 'Print Recipe', location.href.replace(location.hash,""));
			print_window.wprm.set_print_system(system);
			print_window.wprm.set_print_servings(servings);
			print_window.print();
		};
};

jQuery(document).ready(function($) {
		jQuery('.wprm-recipe-print').on('click', function(e) {
				e.preventDefault();

				var recipe = jQuery(this).parents('.wprm-recipe-container'),
					servings = parseInt(recipe.find('.wprm-recipe-servings').data('servings')),
					system = 1,
					recipe_id = recipe.data('recipe-id');

				if('undefined' !== typeof wprmpuc) {
					system = wprmpuc.get_active_system(recipe);
				}

				wprm.print_recipe(recipe_id, servings, system);
		});
		jQuery('.wprm-print-recipe-shortcode').on('click', function(e) {
				e.preventDefault();

				var recipe_id = jQuery(this).data('recipe-id');
				wprm.print_recipe(recipe_id, false, 1);
		});
});
