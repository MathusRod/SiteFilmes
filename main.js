import { apiKey } from "./apiKey.js";
const moviesContainer = document.querySelector(".movies");

const inputSearch = document.querySelector("#busca");
const btnSearch = document.querySelector(".pesquisa-icon");

btnSearch.addEventListener("click", searchMovie);

inputSearch.addEventListener("keyup", (event) => {
  console.log(event.key);
  if (event.key == "Enter") {
    searchMovie();
    return;
  }
});

async function searchMovie() {
  const inputValue = inputSearch.value;
  if (inputValue != "") {
    cleanAllMovies();
    const movies = await searchMovieByName(inputValue);
    movies.forEach((movie) => renderMovie(movie));
  } else {
    cleanAllMovies();
    initFilmes();
  }
}
const onlyFavs = document.getElementById("onlyFavorites");
onlyFavs.addEventListener("change", handleShowFavoritesChange);
function handleShowFavoritesChange() {
  if (onlyFavs.checked) {
    showFavoriteMovies();
  } else {
    cleanAllMovies();
    initFilmes();
  }
}
function showFavoriteMovies() {
  cleanAllMovies();
  const favoriteIds = getFavoriteMovieIds();
  favoriteIds.forEach(async (movieId) => {
    const movie = await searchMovieById(movieId);
    renderMovie(movie);
  });
}
function getFavoriteMovieIds() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}
async function searchMovieById(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-BR`;
  const fetchResponse = await fetch(url);
  const movie = await fetchResponse.json();
  return movie;
}

function cleanAllMovies() {
  moviesContainer.innerHTML = "";
}

async function searchMovieByName(title) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${title}&language=pt-BR&page=1`;
  const fetchResponse = await fetch(url);
  const { results } = await fetchResponse.json();
  return results;
}

async function getPopularMovies() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
  const fetchReponse = await fetch(url);
  const { results } = await fetchReponse.json();
  return results;
}
window.onload = function () {
  initFilmes();
};
async function initFilmes() {
  const movies = await getPopularMovies();
  movies.forEach((movie) => renderMovie(movie));
}

function renderMovie(movie) {
  const { id, title, poster_path, vote_average, release_date, overview } =
    movie;
  const isFavorited = isMovieFavorited(id);
  const year = new Date(release_date).getFullYear();

  const image = `https://image.tmdb.org/t/p/w500${poster_path}`;

  const movieElement = document.createElement("div");
  movieElement.classList.add("movie");
  moviesContainer.appendChild(movieElement);

  const movieInformation = document.createElement("div");
  movieInformation.classList.add("movie-information");

  const movieImageContainer = document.createElement("div");
  movieImageContainer.classList.add("movie-image");
  const movieImage = document.createElement("img");
  movieImage.src = image;
  movieImage.alt = `${title} Poster`;

  movieImageContainer.appendChild(movieImage);
  movieInformation.appendChild(movieImageContainer);

  const movieTextContainer = document.createElement("div");
  movieTextContainer.classList.add("movie-text");
  const movieTitle = document.createElement("h4");
  movieTitle.textContent = `${title} (${year})`;
  movieTextContainer.appendChild(movieTitle);

  const favRateContainer = document.createElement("div");
  favRateContainer.classList.add("rating-favorites");

  const rateContainer = document.createElement("div");
  rateContainer.classList.add("rating");
  const star = document.createElement("img");
  star.src = "../images/Star.svg";
  star.alt = "Star";
  const movieRate = document.createElement("span");
  movieRate.classList.add("movie-rate");
  movieRate.textContent = vote_average.toFixed(1);
  rateContainer.appendChild(star);

  rateContainer.appendChild(movieRate);

  const favContainer = document.createElement("div");
  favContainer.classList.add("favorite");

  const favButton = document.createElement("button");
  favButton.classList.add("favorite-icon");

  if (isFavorited) {
    favButton.classList.add("true");
  }

  favButton.setAttribute("data-movie-id", id);
  favButton.addEventListener("click", function (event) {
    const target = event.target;

    if (target.classList.contains("true")) {
      unMarkFavorite.call(target);
    } else {
      markFavorite.call(target);
    }
  });

  function unMarkFavorite() {
    this.classList.remove("true");
    movieElement.classList.remove("Favorited");

    removeFromLocalStorage(this.dataset.movieId); // Remova do localStorage
  }

  function markFavorite() {
    this.classList.add("true");
    movieElement.classList.add("Favorited");
    addToLocalStorage(this.dataset.movieId); // Adicione ao localStorage
  }

  function addToLocalStorage(movieId) {
    // Obtenha a lista atual de favoritos do localStorage ou inicialize uma nova lista vazia
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Adicione o ID do filme à lista se ainda não estiver presente
    if (!favorites.includes(movieId)) {
      favorites.push(movieId);
    }

    // Atualize a lista de favoritos no localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  function removeFromLocalStorage(movieId) {
    // Obtenha a lista atual de favoritos do localStorage ou inicialize uma nova lista vazia
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Remova o ID do filme da lista se estiver presente
    const index = favorites.indexOf(movieId);
    if (index !== -1) {
      favorites.splice(index, 1);
    }

    // Atualize a lista de favoritos no localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
  const favSpan = document.createElement("span");
  favSpan.textContent = "Favoritar";

  favContainer.appendChild(favButton);
  favContainer.appendChild(favSpan);
  favRateContainer.appendChild(rateContainer);
  favRateContainer.appendChild(favContainer);
  movieInformation.appendChild(movieTextContainer);
  movieTextContainer.appendChild(favRateContainer);

  const descriptionContainer = document.createElement("div");
  descriptionContainer.classList.add("movie-description");
  const description = document.createElement("p");
  description.textContent = overview;

  descriptionContainer.appendChild(description);

  movieElement.appendChild(movieInformation);
  movieElement.appendChild(descriptionContainer);
  moviesContainer.appendChild(movieElement);
}
function isMovieFavorited(movieId) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  return favorites.includes(movieId);
}
