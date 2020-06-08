const API_KEY = '520acba345fb4fc582e4496d65f38cef';

$(document).ready(() => {

  // Max calories slider
  const calSlider = $('#cal-range');
  const calOutput = $('#cal-output');
  calOutput.text(calSlider.val());
  calSlider.on('input', function() {
    calOutput.text($(this).val());
  });

  // Max carb slider
  const carbSlider = $('#carb-range');
  const carbOutput = $('#carb-output');
  carbOutput.text(carbSlider.val());
  carbSlider.on('input', function() {
    carbOutput.text($(this).val());
  });

  // Max fat slider
  const fatSlider = $('#fat-range');
  const fatOutput = $('#fat-output');
  fatOutput.text(fatSlider.val());
  fatSlider.on('input', function() {
    fatOutput.text($(this).val());
  });

  $('#advanced-search').on('submit', (event) => {

    event.preventDefault();
    $('#advanced-search-results').empty();
    $('#no-recipes').empty();

    const dishInput = $('#dish').val();
    const dishTrimmed = dishInput.trim();
    let dishString = dishTrimmed.replace(/ /g, ',+');

    const cuisine = $('#cuisine').val();

    const dietInput = $('input[name=diet]:checked').val();

    const allergyInput = [];
    $.each($('input[name=\'allergy\']:checked'), function(){
      allergyInput.push($(this).val());
    });

    const prepTime = $('#prep-time').val();

    const maxCalories = calOutput.text();

    const maxCarbs = carbOutput.text();

    const maxFat = fatOutput.text();

    const maxSaturatedFat = 1000;

    const maxCholesterol = 1000;

    const maxFiber = 1000;

    const maxSodium = $('#sodium').val();

    const maxSugar = $('#sugar').val();

    const query = `https://api.spoonacular.com/recipes/complexSearch?query=${dishString}&cuisine=${cuisine}&maxReadyTime=${prepTime}&diet=${dietInput}&maxCalories=${maxCalories}&maxSugar=${maxSugar}&intolerances=${allergyInput}&maxFat${maxFat}&maxSaturatedFat=${maxSaturatedFat}&maxCholestero=${maxCholesterol}&maxFiber=${maxFiber}&maxCarbs${maxCarbs}&maxSodium=${maxSodium}&instructionsRequired=true&addRecipeInformation=true&sort=popularity&sort=desc&number=20&apiKey=${API_KEY}`;

    console.log(query);

    $.ajax({
      url: query,
      success: (data) => {

        // Scrolls down to search results
        const offset = $('#advanced-search-results').offset();
        $('html,body').animate({
          scrollTop: offset.top
        });

        const {length} = data.results;

        console.log(data);

        if (length === 0) {
          $('#no-recipes').text('No found recipes, try again...');
        } else {

          if (dishString !== '') {
            dishString = dishString.replace(/,\+/g, ' ');
            $('#advanced-search-results').append(`<h3>Search Results for "${dishString}":`);
          }

          const results = data.results;

          results.forEach(rec => {
            const recipe = createRecipeCard(rec);
            $('#advanced-search-results').append(recipe);
          });
        }

      }

    });

  });

});

const createRecipeCard = (recipe) => {

  const { id, title, image, readyInMinutes, servings, sourceUrl } = recipe;

  const imageTypeIndex = image.lastIndexOf('.', image.length);

  const imageType = image.substring(imageTypeIndex);

  const imageSize = '480x360';

  const imagePath = `https://spoonacular.com/recipeImages/${id}-${imageSize}${imageType}`;

  return `<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
              <div class="card">
                <img src="${imagePath}" class="card-img-top img-fluid" alt="${title}">
                <div class="card-body">
                  <h4 class="card-title">${title}</h4>
                  <p class="card-text">Prep Time: ${readyInMinutes} minutes</p>
                  <p class="card-text">Servings: ${servings}</p>
                </div>
                <div class="card-body">
                  <a href="#" name="${id}" onclick="addToRecipeBook(name)" class="btn btn-primary">Add</a>
                  <a href="#" name="${id}" onclick="viewRecipeDetails(name)" class="btn btn-primary">Details</a>
                  <p><a href="${sourceUrl}">View Source Link</a></p>
                </div>
              </div>
            </div>`;

};

// eslint-disable-next-line no-unused-vars
const addToRecipeBook = id => {
  event.preventDefault();

  let userId, title, vegetarian, vegan, veryHealthy, prepTime,
    servings, description, imageType, cuisines,
    diets, ingredients, steps, imageUrlLg, imageUrlSm,
    nutrition, sourceName, sourceUrl;

  $.get('/api/user_data', function(data) {
    if (data) {
      $('.member-name').text(', ' + data.fname);
      userId = data.id;
      console.log('user id: ', userId);
    } else {
      console.log('user not found');
      window.location.replace('/login');
    }
  }).then(() => {

    const query = `https://api.spoonacular.com/recipes/${id}/information?instructionsRequired=true&addRecipeInformation=true&includeNutrition=true&apiKey=${API_KEY}`;

    $.ajax({
      url: query,
      success: function(data) {

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

        cuisines = JSON.stringify(data.cuisines);
        diets = JSON.stringify(data.diets);

        ingredients = JSON.stringify(data.extendedIngredients);

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

          steps = JSON.stringify(steps);

        } else {
          steps = null;
        }
        //large image (on details page):
        imageUrlLg = data.image;

        //small image (on search page):
        imageUrlSm = imageUrlLg.replace('556x370', '480x360');

        imageType = data.imageType;

        nutrition = JSON.stringify(data.nutrition.nutrients);

      }
    }).then(() => {

    //Insert Recipe into database:
      $.post(`/api/${userId}/add_recipe`, {
        id: id,
        userId: userId,
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
      })
        .catch(handleErr);

    }).then(() => {
      alert('Recipe successfully added to your Recipe Book');
    });

  });

};

// eslint-disable-next-line no-unused-vars
const viewRecipeDetails = id => {
  event.preventDefault();
  console.log(id);

  let userId;

  $.get('/api/user_data').then(function(data) {
    if (data) {
      userId = data.id;
      console.log('user id: ', userId);
    } else {
      console.log('user not found');
    }
  }).then(() => {
    $.get(`/details/${id}`).then(function() {
      window.location.replace(`/details/${id}`);
      // If there's an error, log the error
    }).catch(handleErr);
  });

};

const handleErr = err => {
  console.log(err);
};
