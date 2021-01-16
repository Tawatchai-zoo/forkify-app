import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';

// if (module.hot) {
//     module.hot.accept();
//     // Clear console when save
// }

// when hash changed or browser is loaded
const controlRecipes = async function () {
    try {
        const id = window.location.hash.slice(1);

        if (!id) return;
        recipeView.renderSpinner();

        // 1) Update results view(not render new entire) to mark selected search result
        resultsView.update(model.getSearchResultsPage());

        // 2) Update bookmarks view
        bookmarksView.update(model.state.bookmarks);

        // 3) Loading recipe
        await model.loadRecipe(id);

        // 4) Render recipe
        recipeView.render(model.state.recipe);
    } catch (err) {
        recipeView.renderError();
    }
};

const controlSearchResults = async function () {
    try {
        resultsView.renderSpinner();

        // 1) Get search query
        const query = searchView.getQuery();
        if (!query) return;

        // 2) load search results
        await model.loadSearchResults(query);

        // 3) Render results
        // resultsView.render(model.state.search.results);
        resultsView.render(model.getSearchResultsPage());

        // Render initial pagination buttons
        paginationView.render(model.state.search);
    } catch (err) {
        console.error(err);
    }
};

const controlPagination = function (goToPage) {
    // 3) Render results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // Render initial pagination buttons
    paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
    // Update the recipe servings (in state)
    model.updateServings(newServings);

    // Update the recipe view
    // recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
    // Add/remove bookmarks
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // Update recipe view
    recipeView.update(model.state.recipe);

    // Render bookmarksView
    bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
    bookmarksView.render(model.state.bookmarks);
};

const controlOpenAddRecipeForm = function () {
    addRecipeView.render(true);
    addRecipeView.toggleWindow();
};

const controlAddRecipe = async function (newRecipe) {
    try {
        // Show loading spinner
        addRecipeView.renderSpinner();

        // Upload the new recipe data
        await model.uploadRecipe(newRecipe);

        // Render recipe
        recipeView.render(model.state.recipe);

        // Success message
        addRecipeView.renderMessage();

        // Render bookmark view
        bookmarksView.render(model.state.bookmarks);

        // Change ID in URL
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // Close form window
        setTimeout(() => addRecipeView.hideWindow(), MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        addRecipeView.renderError(err.message);
    }
};

const init = function () {
    // Have to Render bookmarks on load before update it!
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);

    addRecipeView.addHandlerShowWindow(controlOpenAddRecipeForm);
    // addRecipeView.addHandlerHideWindow();
    addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
