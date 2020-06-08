const API_KEY = '520acba345fb4fc582e4496d65f38cef';

$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page

  let userId;

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

    $.get(`/api/${userId}/recipes`).then(function(data) {
      console.log('recipe data: ', data);

      if (data.length > 0) {
        $('#content-container').append('<h3>My Recipe Book</h3>');

        for (let i = 0; i < data.length; i++) {
          const recipe = createMyRecipeCard(data[i]);
          $('#content-container').append(recipe);
        }

      } else {
        $('#content-container').append(`
          <h3>My Recipe Book</h3>
          <p>You do not currently have any recipes in your Recipes Book. 
          Enter a search term in the Search box above and click search or
          go to the Advanced search page and complete the form</p>
        `);
      }
    });

  });

  $('#global-search').on('submit', function(event) {
    event.preventDefault();

    $('#content-container').empty();

    const searchInput = $('#search-query').val();

    const validInput = validateSearchInput(searchInput);

    if (validInput) {
      hideError('#search-error-alert');

      const searchTrim = searchInput.trim();

      const searchString = searchTrim.replace(/ /g, ',+');

      const query = `https://api.spoonacular.com/recipes/search?query=${searchString}&number=20&apiKey=${API_KEY}`;

      console.log(query);

      $.ajax({
        url: query,
        success: function(data) {

          const results = data.results;

          console.log('Search Results: ', results);

          if (results.length === 0) {

            $('#content-container').html('<div class="col-sm-3"><h4>No results found.</h4></div>');

          } else {

            const searchResults = searchString.replace(/,\+/g, ' ');

            $('#content-container').append(`<h3>Search Results for "${searchResults}":`);

            for (let i = 0; i < results.length; i++) {
              const recipe = createRecipeCard(results[i]);
              $('#content-container').append(recipe);
            }

          }

        }
      });

    } else {
      textInputError('#search-error-alert', '#search-error-msg', 'Invalid search field. Must be alphabetical and cannot contain punctuation marks.');
    }

  });
});

const textInputError = (type, messageContainer, message) => {
  $(type + ' ' + messageContainer).text(message);
  $(type).fadeIn(500);
};

const hideError = type => {
  $(type).hide();
};

const createRecipeCard = recipe => {

  const { id, image, readyInMinutes, servings, sourceUrl } = recipe;

  const title = recipe.title.replace(/\+/g, ' ');

  let sourceLink;

  if (sourceUrl !== '') {
    sourceLink = `<a href="${sourceUrl}">View Source</a>`;
  } else {
    sourceLink = '<p>Source is not available</p>';
  }

  let imgTag;

  if (image !== undefined) {

    const imageTypeIndex = image.lastIndexOf('.', image.length);

    const imageType = image.substring(imageTypeIndex);

    const imageSize = '480x360';

    const imagePath = `https://spoonacular.com/recipeImages/${id}-${imageSize}${imageType}`;

    imgTag = `<img src="${imagePath}" class="card-img-top img-fluid" alt="${title}">`;

  } else {
    imgTag = '<img src="https://via.placeholder.com/480x360.png?text=Image+Not+Available" class="img-fluid" title="Image not available">';
  }

  return `<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
            <div class="card">
              ${imgTag}
              <div class="card-body">
                <h4 class="card-title">${title}</h4>
                <p class="card-text">Prep Time: ${readyInMinutes} minutes</p>
                <p class="card-text">Servings: ${servings}</p>
              </div>
              <div class="card-body">
                <a href="#" name="${id}" onclick="addToRecipeBook(name)" class="btn btn-primary">Add</a>
                <a href="#" name="${id}" onclick="viewRecipeDetails(name)" class="btn btn-primary">Details</a>
                <div>${sourceLink}</div>
              </div>
            </div>
          </div>`;

};

const createMyRecipeCard = recipe => {
  const { id, imageUrlSm, prepTime, servings, sourceName, sourceUrl } = recipe;

  const title = recipe.title.replace('+', ' ');

  const imgTag = `<img src="${imageUrlSm}" class="card-img-top img-fluid" alt="${title}">`;

  let sourceLink;

  if (sourceName !== '' && sourceUrl !== '') {
    sourceLink = `<a href="${sourceUrl}">${sourceName}</a>`;
  }

  if (sourceName !== '' && sourceUrl === '') {
    sourceLink = `<p>${sourceName}</p>`;
  }

  if (sourceName === '' && sourceUrl !== '') {
    sourceLink = `<a href="${sourceUrl}">${sourceUrl}</a>`;
  }

  if (sourceName === '' && sourceUrl === '') {
    sourceLink = '<p>Source is not available</p>';
  }

  return `<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
            <div class="card">
              ${imgTag}
              <div class="card-body">
                <h4 class="card-title">${title}</h4>
                <p class="card-text">Prep Time: ${prepTime} minutes</p>
                <p class="card-text">Servings: ${servings}</p>
              </div>
              <div class="card-body">
                <a href="#" name="${id}" onclick="viewRecipeDetails(name)" class="btn btn-primary">Details</a>
                <a href="#" name="${id}" onclick="deleteRecipe(name)" class="btn btn-primary">Delete</a>
                <div>${sourceLink}</div>
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
      userId = data.id;
      console.log('user id: ', userId);
    } else {
      console.log('user not found');
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

// eslint-disable-next-line no-unused-vars
const deleteRecipe = id => {
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

    $.ajax({
      method: 'DELETE',
      url: `/api/delete_recipe/${userId}/${id}`,
      success:
        window.location.reload(true)
    });

  });

};

const handleErr = err => {
  console.log(err.responseJSON.error);
};

const validateSearchInput = input => {
  var rmSp = input.trim();
  var result = rmSp.search(/^[A-Za-z\s']+$/); //check to make sure the input is alphabetical
  return (result === 0 ? true : false); //return true if it is alphabetical, false if not
};
