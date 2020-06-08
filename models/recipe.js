// Creating the Recipe model
module.exports = function(sequelize, DataTypes) {
  const Recipe = sequelize.define('Recipe', {
    // Recipe Id:
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // User id:
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Recipe Title:
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Recipe Vegetarian true/false
    vegetarian: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    // Recipe Vegan true/false
    vegan: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    // Recipe Very Healthy true/false
    veryHealthy: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    // Recipe prep time:
    prepTime: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Recipe servings:
    servings: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Recipe Cuisine Type List:
    cuisines: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Recipe Image displayed on the Details page:
    imageUrlLg: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Recipe Image displayed on the Search page:
    imageUrlSm: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Recipe Description:
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Recipe Diet Restrictions:
    diets: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Recipe Ingredients List (includes title, amount, unit, and image url):
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // Recipe Nutrition List (includes title, amount and unit):
    nutrition: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    steps: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Recipe Original Source Name:
    sourceName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Recipe Original Source Link:
    sourceUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }

  });

  return Recipe;

};
