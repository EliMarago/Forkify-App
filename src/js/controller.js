import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';

// per polyfilling generale
import 'core-js/stable';
// per polyfilling asyn/await
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import resultsView from './view/resultsView.js';

if (module.hot) {
  module.hot.accept();
}
/////// //////// ////////// ///////// ////////

///////////////////////////////////////

// 1 CHIAMATA API
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //aggiornare il caricamento dei risultati
    resultsView.update(model.getSearchResultsPage());

    bookmarksView.update(model.state.bookmarks);

    // caricamento ricetta
    await model.loadRecipe(id);
    const { recipe } = model.state;

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage(1));

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

//controllo gestione eventi click pagine
const controlPagination = function (gotToPage) {
  resultsView.render(model.getSearchResultsPage(gotToPage));

  paginationView.render(model.state.search);
};

//controllo gestione eventi click numero persone
const controlServing = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddBookmarks = function () {
  if (!model.state.recipe.bookmarked) model.addBookmarks(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    addRecipeView.renderMessage();

    //render la nuova ricetta nei bookmarks
    bookmarksView.render(model.state.bookmarks);

    //cambiare l'id dell'url
    window.history.pushState(null, '', `${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServing);
  recipeView.addHandlerAddBookmark(controlAddBookmarks);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

// per cambiare l'id nell'url della ricetta
// window.addEventListener('hashchange', controlRecipes);

// caricare l'url una volta copiato nella barra
// window.addEventListener('load', controlRecipes);

// si possono scrivere questi due EVENTI in un unica riga insieme in questo modo:
// ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, controlRecipes));
