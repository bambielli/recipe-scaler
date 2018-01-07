## [Recipe-Scaler](http://www.bambielli.com/recipe-scaler/)

Chrome extension that scales recipe ingredient proportions based on chosen serving size.

Works on [halfbakedharvest.com](https://www.halfbakedharvest.com).

![recipe scaling picture](/recipe-scaler.png)

## Installation

1. Download the code in this repository.
2. Open chrome, navigate to [chrome://extensions](chrome://extensions).
3. Once you are on the chrome://extensions page, drag the downloaded code folder into the browser window. it should install automatically.

Now navigate to any recipe on HalfBakedHarvest.com. If the recipe contains a servings box, you'll see a dropdown like the screenshot above where you can modify the serving amount to fit your entertaining needs.

## Motivation

This chrome extension was created over the 2017 holidays.

We were making a recipe off of Half Baked Harvest. The ingredients were proportioned for 6 people, but wanted to scale it up for 10.

We wound up scaling all of the ingredients by hand (up by 2/3), which was a pain.

I made this chrome extension to scale recipe ingredients for you so you don't have to mess with ingredient conversions by hand anymore!

The extension creates a dropdown in place of the original recipe serving number. The dropdown defaults to the original serving size.

The ingredient values are scaled differently based on the servings for which the recipe was originally intended.

For example, if the recipe was originally intended for 4, scaling to 2 people is a factor of 0.5. Scaling to 6 people is a factor of 1.5, to 8 people is a factor of 2, and to 10 people is a factor of 2.5.

Ingredient scaling rounds to the nearest 1/4, and represents fractions as mixed numbers instead of decimals.

On HBH recipes, the numerical amounts of ingredients are segregated into their own span, away from the text description of the ingredient. 
This makes scraping / scaling the amounts much simpler.
If there are ingredient amounts in the ingredient list that are not separated into their own span, I do not scale them. 

## Interest in Incorporating This on your Site?

Feel free to reach out to me at `brian.ambielli@gmail.com`.