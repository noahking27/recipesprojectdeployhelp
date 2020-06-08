const API_KEY = '520acba345fb4fc582e4496d65f38cef';

$(document).ready(function() {

  const url = window.location;
  const urlString = url.toString();
  const idIndex = urlString.lastIndexOf('/');
  const id = urlString.substring(idIndex + 1);

  $.get(`/api/details/${id}`, function(data) {

    if (data) {
      console.log('recipe: ', data);

      const { title, vegetarian, vegan, veryHealthy, prepTime,
        servings, description, imageUrlLg, sourceName, sourceUrl } = data;

      const cuisines = JSON.parse(data.cuisines);
      const diets = JSON.parse(data.diets);
      const ingredients = JSON.parse(data.ingredients);
      const nutrition = JSON.parse(data.nutrition);

      displayRecipeDetails(title, vegetarian, vegan, veryHealthy, prepTime,
        servings, description, imageUrlLg, sourceName, sourceUrl, cuisines,
        diets, ingredients, nutrition);

    } else {
      console.log('recipe not found in database');
      const startCooking = false;
      getApiData(id, startCooking);
    }
  });

  $('.start-cooking').on('click', function(event) {
    event.preventDefault();

    $.get(`/api/details/${id}`, function(data) {

      if (data) {

        let steps = data.steps;

        if (steps !== '') {
          console.log('recipe has steps');
          steps = JSON.parse(data.steps);
          beginRecipeSteps(id);

        } else {
          console.log('recipe has no steps');
          // If the recipe is not available, alert the user:
          alert('The recipe for this meal is not available.');
        }

      } else {
        console.log('recipe not found in database');
        const startCooking = true;
        getApiData(id, startCooking);

      }

    }); // end $.get route

  }); // end start cooking click event

  $('.previous').on('click', function(event) {
    event.preventDefault();
    window.location.replace('/members');
  });

});

const displayRecipeDetails = (title, vegetarian, vegan, veryHealthy, prepTime,
  servings, description, imageUrlLg, sourceName, sourceUrl, cuisines,
  diets, ingredients, nutrition) => {

  $('#recipe-title').text(title);
  $('#prep-time').text(prepTime);
  $('#servings').text(servings);

  if (cuisines.length > 0) {
    $('#cuisines').show();

    for (let i = 0; i < cuisines.length; i++) {
      $('#cuisines-list').append(`<li>${cuisines[i]}</li>`);
    }
  } else {
    $('#cuisines').hide();
  }

  if (imageUrlLg !== null) {
    $('#recipe-image').show();
    $('#recipe-image').append(`<img src="${imageUrlLg}" alt="${title}" class="img-fluid">`);
  } else {
    $('#recipe-image').hide();
  }

  if (description !== null) {
    $('#recipe-description').show().append(description);
  } else {
    $('#recipe-description').hide();
  }

  if (ingredients.length > 0) {
    $('#recipe-ingredients').show();
    const ingredientsList = getIngredientTiles(ingredients);
    $('#ingredients-list').append(ingredientsList);
  } else {
    $('#recipe-ingredients').hide();
  }

  if (veryHealthy === true) {
    $('#very-healthy').show();
  } else {
    $('#very-healthy').hide();
  }

  if (vegetarian === true) {
    $('#vegetarian').show();
  } else {
    $('#vegetarian').hide();
  }

  if (vegan === true) {
    $('#vegan').show();
  } else {
    $('#vegan').hide();
  }

  if (diets.length > 0) {
    $('#diets').show();

    for (let i = 0; i < diets.length; i++) {
      $('#diets-list').append(`<li>${diets[i]}</li>`);
    }
  } else {
    $('#diets').hide();
  }

  const nutritionTable = getNutritionTable(nutrition);
  $('#nutrition-table tbody').append(nutritionTable);

  if (sourceName !== null) {
    $('#source-name').show().text(sourceName).attr('href', sourceUrl);
  } else {
    $('#source-name').hide();
  }

};

const getIngredientTiles = ingredients => {

  let ingredientsList = '';
  let imagesAdded = [];

  for (i = 0; i < ingredients.length; i++) {

    const name = ingredients[i].name;

    let ingredientImage = '';
    let imagePath = '';
    let imageTag = '';
    if (ingredients[i].image !== null && ingredients[i].image !== 'no.jpg') {
      ingredientImage = ingredients[i].image;
      imagePath = `https://spoonacular.com/cdn/ingredients_100x100/${ingredientImage}`;
      imageTag = `<img src="${imagePath}" alt="${name}" title="${name}">`;

    } else {
      imageTag = `<img src="https://via.placeholder.com/100x100.png/eee/?text=Image+Not+Available" class="img-fluid" title="Image not available">
                  <br><label>(Image not available)</label>`;
    }

    imagePath = `https://spoonacular.com/cdn/ingredients_100x100${ingredientImage}`;

    const ingredientExists = imagesAdded.find(ingredient => ingredient === ingredientImage);

    if (ingredientExists === undefined) {
      imagesAdded.push(ingredientImage);

      ingredientsList += `<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                          <div class="ingredient-item">
                            ${imageTag}
                            <p><label>${name}</label><p>
                          </div>
                        </div>`;

    }

  }

  return ingredientsList;

};

const getNutritionTable = nutrition => {

  let nutritionTable = '';

  for (let i = 0; i < nutrition.length; i++) {

    const { title, amount, unit } = nutrition[i];

    nutritionTable += `<tr>
        <td>${title}</td>
        <td><span>${amount}</span><span>${unit}</span></td>
    </tr>`;

  }

  return nutritionTable;

};

const getApiData = (id, startCooking) => {

  //Get API data:
  const query = `https://api.spoonacular.com/recipes/${id}/information?addRecipeInformation=true&includeNutrition=true&apiKey=${API_KEY}`;

  let recipe = {};

  let title, vegetarian, vegan, veryHealthy, prepTime,
    servings, description, imageType, cuisines,
    diets, ingredients, steps, imageUrlLg, imageUrlSm,
    nutrition, sourceName, sourceUrl;

  $.ajax({
    url: query,
    success: function(data) {

      if (data) {
        //if data was returned, add it to localStorage:

        console.log('Recipe Details: ', data);

        title = data.title;
        vegetarian = data.vegetarian;
        vegan = data.vegan;
        veryHealthy = data.veryHealthy;
        prepTime = data.readyInMinutes;
        servings = data.servings;
        description = data.summary;
        sourceName = data.sourceName;
        sourceUrl = data.sourceUrl;
        cuisines = data.cuisines;
        diets = data.diets;
        ingredients = data.extendedIngredients;
        nutrition = data.nutrition.nutrients;

        //Assign each sequential step an incremental number:
        if (data.analyzedInstructions.length > 0) {

          const allSteps = data.analyzedInstructions;

          steps = [];

          for (let i = 0; i < allSteps.length; i++) {
            for (let j = 0; j < allSteps[i].steps.length; j++) {
            //console.log('step added: ', allSteps[i].steps[j]);
              steps.push(allSteps[i].steps[j]);
            }
          }

          //change the step number to sequence 1 - total:
          for (let i = 0; i < steps.length; i++) {
            steps[i].number = (i + 1);
          }

        } else {
          steps = undefined;
        }

        //large image (on details page):
        imageUrlLg = data.image;

        //small image (on search page):
        imageUrlSm = imageUrlLg.replace('556x370', '480x360');

        // Get the image file type:
        imageType = data.imageType;

        if (startCooking === false) {
          //If start cooking button was not pressed, output the data to the page:
          displayRecipeDetails(title, vegetarian, vegan, veryHealthy, prepTime,
            servings, description, imageUrlLg, sourceName, sourceUrl, cuisines,
            diets, ingredients, nutrition);
        }

        // Convert objects and arrays to strings in order to enter them into localStorage:
        cuisines = JSON.stringify(cuisines);
        diets = JSON.stringify(diets);
        ingredients = JSON.stringify(ingredients);
        nutrition = JSON.stringify(nutrition);
        steps = JSON.stringify(steps);

      }

    }

  }).then(() => {

    // Create recipe object:
    recipe = {
      id: id,
      title: title,
      vegetarian: vegetarian,
      vegan: vegan,
      veryHealthy: veryHealthy,
      prepTime: prepTime,
      servings: servings,
      cuisines: cuisines,
      imageUrlLg: imageUrlLg,
      imageUrlSm: imageUrlSm,
      imageType: imageType,
      description: description,
      diets: diets,
      ingredients: ingredients,
      nutrition: nutrition,
      steps: steps,
      sourceName: sourceName,
      sourceUrl: sourceUrl
    };

    // add recipe to localStorage:
    window.localStorage.setItem(id, JSON.stringify(recipe));

    if (startCooking === true) {
      if (steps !== undefined) {
        $('.content').empty();
        console.log('recipe has steps');

        beginRecipeSteps(id);

      } else {
        console.log('recipe has no steps');
        // If the recipe is not available, alert the user:
        alert('The recipe for this meal is not available.');
      }
    }

  });

};

const beginRecipeSteps = id => {

  //If the recipe contains steps, send it to the steps page:
  $.get(`/${id}/steps/:steps`).then(() => {
    window.location.replace(`/${id}/steps/1`);
    // If there's an error, log the error
  }).catch(handleDetailsErr);

};

const handleDetailsErr = err => {
  console.log(err);
};