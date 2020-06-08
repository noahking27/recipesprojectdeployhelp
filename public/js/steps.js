const API_KEY = '520acba345fb4fc582e4496d65f38cef';

$(document).ready(function() {

  const url = window.location;
  let urlString = url.toString();
  urlString = urlString.replace('http://', '');

  let step = getStep(urlString);
  step = parseInt(step);

  const id = getId(urlString);

  console.log('step: ', step);
  console.log('id: ', id);

  $('#step').text(step);

  $.get(`/api/details/${id}`, function(data) {
    console.log('recipe: ', data);

    if (data) {
      //Recipe is in the database, use database data:
      console.log('recipe exists');

      //Add Recipe title:
      const title = data.title;
      $('#title').text(title);

      const steps = JSON.parse(data.steps);
      const ingredients = JSON.parse(data.ingredients);

      //Get current step object from database:
      const currentDbStepDetails = steps.find(({number}) => number === step);

      console.log('current step details: ', currentDbStepDetails);

      const dblastStep = checkForLastStep(step, steps);

      if (dblastStep === true) {
        $('#next-step').text('Done');
      }

      let stepHtml = displayStep(currentDbStepDetails, ingredients);
      $('#step-container').html(stepHtml);

    } else {
      //Recipe is not in the database, use API and localStorage:
      console.log('Recipe does not exist in the database.');

      let storedRecipe = window.localStorage.getItem(id);

      if (storedRecipe === null) {
        //set Recipe to localStorage:
        setLocalStorageRecipe(id);

      } else {

        storedRecipe = JSON.parse(storedRecipe);

        //Add Recipe title:
        const title = storedRecipe.title;
        $('#title').text(title);

        const ingredients = JSON.parse(storedRecipe.ingredients);

        const recipeSteps = JSON.parse(storedRecipe.steps);

        const currentStepDetails = recipeSteps.find(({number}) => number === step);

        console.log('currentStepDetails', currentStepDetails);

        const lastStep = checkForLastStep(step, recipeSteps);

        if (lastStep === true) {
          $('#next-step').text('Done');
        }

        let stepHtml = displayStep(currentStepDetails, ingredients);
        $('#step-container').html(stepHtml);

      }
    }
  }); // end $.get route

  $('#next-step').on('click', function() {
    event.preventDefault();

    $.get(`/api/details/${id}`, function(data) {
      console.log('recipe: ', data);

      if (data) {
        //Recipe is in the database, use database data:
        console.log('recipe exists');

        //Add Recipe title:
        const title = data.title;
        $('#title').text(title);

        const nextStep = (step + 1);

        const steps = JSON.parse(data.steps);

        const dbNextStepDetails = steps.find( ({ number }) => number === nextStep );

        if (dbNextStepDetails !== undefined) {
          console.log('Next step exists');

          //go to next step
          $.get(`/${id}/steps/:steps`).then(() => {

            window.location.replace(`/${id}/steps/${nextStep}`);
            // If there's an error, log the error
          }).catch(handleStepsErr);

        } else {
          // Finished recipe steps
          window.localStorage.clear();
          window.location.replace('/members');
        }

      } else {
        //Recipe is not in the database, use API and localStorage:
        let storedRecipe = window.localStorage.getItem(id);

        if (storedRecipe === null) {
          //set Recipe to localStorage:
          setLocalStorageRecipe(id);

        } else {

          storedRecipe = JSON.parse(storedRecipe);

          const recipeSteps = JSON.parse(storedRecipe.steps);

          const nextStep = (step + 1);

          const nextStepDetails = recipeSteps.find(({number}) => number === nextStep);

          console.log('nextStepDetails', nextStepDetails);

          if (nextStepDetails !== undefined) {
            console.log('Next step exists');

            //go to next step
            $.get(`/${id}/steps/:steps`).then(() => {

              window.location.replace(`/${id}/steps/${nextStep}`);
              // If there's an error, log the error
            }).catch(handleStepsErr);

          } else {
            // Finished recipe steps
            window.localStorage.clear();
            window.location.replace('/members');
          }

        } // end localStorage check

      } // end database Recipe exists/does not exist check

    }); // end $.get details request

  }); // end next step button click

  $('#previous-step').on('click', function() {

    $.get(`/api/details/${userId}/${id}`, function(data) {
      console.log('recipe: ', data);

      if (data) {
        //Recipe is in the database, use database data:
        console.log('recipe exists');

        //Add Recipe title:
        const title = data.title;
        $('#title').text(title);

        const steps = JSON.parse(data.steps);

        console.log('current step: ', step);

        const previousStep = (step - 1);

        console.log('previous step: ', previousStep);

        const dbPreviousStepDetails = steps.find(({number}) => number === previousStep);

        console.log('dbPreviousStepDetails', dbPreviousStepDetails);

        if (dbPreviousStepDetails !== undefined) {
          console.log('Previous step exists');

          //go to previous step
          $.get(`/${id}/steps/:steps`).then(() => {

            window.location.replace(`/${id}/steps/${previousStep}`);
            // If there's an error, log the error
          }).catch(handleStepsErr);

        } else {
          window.location.replace(`/details/${id}`);
        }

      } else {
        //Recipe is not in the database, use API and localStorage:
        let storedRecipe = window.localStorage.getItem(id);

        if (storedRecipe === null) {
          //set Recipe to localStorage:
          setLocalStorageRecipe(id);

        } else {

          storedRecipe = JSON.parse(storedRecipe);

          const recipeSteps = JSON.parse(storedRecipe.steps);

          console.log('current step: ', step);
          const previousStep = (step - 1);
          console.log('previous step: ', previousStep);

          const previousStepDetails = recipeSteps.find(({number}) => number === previousStep);

          console.log('previousStepDetails', previousStepDetails);

          if (previousStepDetails !== undefined) {
            console.log('Previous step exists');

            //go to previous step
            $.get(`/${id}/steps/:steps`).then(() => {

              window.location.replace(`/${id}/steps/${previousStep}`);
              // If there's an error, log the error
            }).catch(handleStepsErr);

          } else {
            window.location.replace(`/details/${id}`);
          }

        } // end localStorage check

      } // end database Recipe exists/does not exist check

    }); // end $.get details request

  }); // end previous step button click

}); // end document.ready()

const displayStep = (step, allIngredients) => {
  //console.log('allIngredients :', allIngredients);

  const stepDirections = step.step;

  const { ingredients, equipment } = step;

  const stepIngredients = ingredients;

  let ingredientsList = '';

  if (stepIngredients.length > 0) {
    ingredientsList = '<h4>Ingredients Needed:</h4>';
    ingredientsList += getIngredientNames(stepIngredients);
    ingredientsList += getIngredients(stepDirections, stepIngredients, allIngredients);
  }

  let equipmentList = '';

  if (equipment.length > 0) {
    equipmentList = '<h4>Equipment Needed:</h4>';
    equipmentList += getList(equipment, 'equipment');
  }

  return `<div class="col-sm-12">
            <div class="row">
                ${equipmentList}
            </div>
            <div class="row">    
                ${ingredientsList}
            </div>
            <div class="row">
              <h4>Directions</h4>
              <p>${stepDirections}</p>
            </div>
          </div>
          `;
};

const getIngredientNames = stepIngredients => {
  console.log('step Ingredients: ', stepIngredients);

  let stepIngredientNames = '';

  for (let i = 0; i < stepIngredients.length; i++) {
    const ingredient = stepIngredients[i].name;
    if (i === 0) {
      const firstLetter = ingredient.substring(0, 1);
      const fLetterUppercase = firstLetter.toUpperCase();
      const restOfName = ingredient.substring(1);
      if (stepIngredients.length === 1) {
        stepIngredientNames += `${fLetterUppercase}${restOfName}`;
      } else {
        stepIngredientNames += `${fLetterUppercase}${restOfName}, `;
      }
      //Initial caps on first word:

    } else {
      //add comma after all ingredients except last one:
      if (i === stepIngredients.length - 1) {
        stepIngredientNames += ingredient;
      } else {
        stepIngredientNames += `${ingredient}, `;
      }
    }

  }

  return `<p>${stepIngredientNames}</p>`;

};

const getIngredients = (stepDirections, stepIngredients, allIngredients) => {

  //Track all images that have been added to prevent duplicates:
  let imagesAdded = [];

  //Initialize Ingredients list:
  let ingredientsList = '';

  //This loop matches the step ingredients with the list of all recipe ingredients. This loop needs to
  //be done in order to extract the ingredient measurements from the list of all ingredients
  for (let i = 0; i < stepIngredients.length; i++) {
    const stepIngredientImage = stepIngredients[i].image;

    for (let j = 0; j < allIngredients.length; j++) {
      const allIngredientDetails = allIngredients[j];
      const allIngredientImage = allIngredients[j].image;
      //if images match, add them to the ingredients images array:
      if (stepIngredientImage === allIngredientImage) {
        ingredientsList = addOrIgnoreIngredient(imagesAdded, allIngredientImage, allIngredientDetails, ingredientsList);
      }
    }

  }

  //This loop searches the directions and adds any ingredient images not listed in the step ingredients array:
  for (let i = 0; i < allIngredients.length; i++) {
    const ingredientDetails = allIngredients[i];
    const ingredientName = allIngredients[i].name;
    const ingredientImage = allIngredients[i].image;

    const exists = stepDirections.indexOf(ingredientName);
    //console.log(ingredientName + ' ingredient exists at: ', exists);

    if (exists !== -1) {
      //Ingredient exists within directions, add it to ingredients list:
      ingredientsList = addOrIgnoreIngredient(imagesAdded, ingredientImage, ingredientDetails, ingredientsList);
    }
  }

  return ingredientsList;

};

const addOrIgnoreIngredient = (imagesAdded, image, ingredientDetails, ingredientsList) => {

  let add = true;

  if (image !== null && image !== 'no.jpg') {
    //If the ingredient matches an ingredient already added, don't add it.
    for (let i = 0; i < imagesAdded.length; i++) {
      if (image === imagesAdded[i]) {
        add = false;
      }
    }
  }

  // Add the ingredient if it is not already in the imagesAdded array:
  if (add === true) {
    // console.log('image ' + image + ' does not exist in array.');
    // Add image to array:
    imagesAdded.push(image);
    // Add ingredient and image to ingredients string:
    const imagePath = `https://spoonacular.com/cdn/ingredients_100x100/${image}`;

    const ingredientMeasurement = ingredientDetails.original;

    ingredientsList += `<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                              <div class="ingredient-item">
                                <img src="${imagePath}" alt="${ingredientMeasurement}" title="${ingredientMeasurement}">
                                <p><label>${ingredientMeasurement}</label><p>
                              </div>
                        </div>`;
  }

  //Return new ingredients list, or the same one unchanged:
  return ingredientsList;

};

const getList = (list, type) => {

  let listHtml = '';

  for (let i = 0; i < list.length; i++) {

    const { name, image } = list[i];

    const imagePath = `https://spoonacular.com/cdn/${type}_100x100/${image}`;

    listHtml += `<div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                          <div class="ingredient-item">
                            <img src="${imagePath}" alt="${name}" title="${name}">
                            <p><label>${name}</label><p>
                          </div>
                        </div>`;
  }

  return listHtml;

};

const setLocalStorageRecipe = id => {

  //if recipe is not in localStorage, set it:
  const query = `https://api.spoonacular.com/recipes/${id}/information?instructionsRequired=true&addRecipeInformation=true&includeNutrition=true&apiKey=${API_KEY}`;

  let recipe = {};

  let title, vegetarian, vegan, veryHealthy, prepTime,
    servings, description, imageType, cuisines,
    diets, ingredients, steps, imageUrlLg, imageUrlSm,
    nutrition, sourceName, sourceUrl;

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

      if (data) {
        console.log('start cooking');

        $.get(`/${id}/steps/:steps`).then(() => {
          window.location.replace(`/${id}/steps/1`);
          // If there's an error, log the error
        }).catch(handleDetailsErr);
      } else {
        // If the recipe is not available, alert the user with a modal:
        alert('The recipe for this meal is not available.');
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

  });

};

const checkForLastStep = (step, storedRecipe) => {

  const lastStep = (storedRecipe.length);
  console.log('last step: ', lastStep);
  console.log('current step: ', step);

  //last step cook
  if (step === lastStep) {
    return true;
  }

  return false;
};

const handleStepsErr = err => {
  console.log(err);
};

const getStep = urlString => {
  const stepIndex = urlString.lastIndexOf('/');
  const step = urlString.substring(stepIndex + 1);
  return step;
};

const getId = urlString => {
  const idStartIndex = urlString.indexOf('/');
  const idEndIndex = urlString.indexOf('/steps');
  const id = urlString.substring(idStartIndex + 1, idEndIndex);
  return id;
};
