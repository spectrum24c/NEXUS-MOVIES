const apiKeys = {
    tmdb: "62c59007d93c96aa3cca9f3422d51af5", // Replace with your TMDb API key
    youtube: "AIzaSyDXm-Wl4rlMXXhS0hWxoJDMdsc3mllh_ok" // Replace with your YouTube API key
};

const tmdbApiEndpoint = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original"; // Use the original image size for better quality

const apiPaths = {
    fetchAllCategories: `${tmdbApiEndpoint}/genre/movie/list?api_key=${apiKeys.tmdb}`,
    fetchMoviesList: (id) => `${tmdbApiEndpoint}/discover/movie?api_key=${apiKeys.tmdb}&with_genres=${id}`,
    fetchTrending: `${tmdbApiEndpoint}/trending/all/day?api_key=${apiKeys.tmdb}&language=en-US`,
    searchMoviesTMDb: (query) => `${tmdbApiEndpoint}/search/movie?api_key=${apiKeys.tmdb}&query=${query}`,
    searchAnimeJikan: (query) => `https://api.jikan.moe/v4/anime?q=${query}`, // Directly use the URL
    fetchPopularMovies: `${tmdbApiEndpoint}/movie/popular?api_key=${apiKeys.tmdb}&language=en-US`,
    searchOnYoutube: (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKeys.youtube}`,
    fetchMovieDetails: (movieId) => `${tmdbApiEndpoint}/movie/${movieId}?api_key=${apiKeys.tmdb}&language=en-US`, // Fetch movie details from TMDb
    fetchMovieTrailer: (movieId) => `${tmdbApiEndpoint}/movie/${movieId}/videos?api_key=${apiKeys.tmdb}&language=en-US`, // Fetch movie trailer from TMDb
    fetchTVShowDetails: (tvShowId) => `${tmdbApiEndpoint}/tv/${tvShowId}?api_key=${apiKeys.tmdb}&language=en-US`, // Fetch TV show details from TMDb
    fetchTVShowEpisodes: (tvShowId, seasonNumber) => `${tmdbApiEndpoint}/tv/${tvShowId}/season/${seasonNumber}?api_key=${apiKeys.tmdb}&language=en-US`, // Fetch TV show episodes from TMDb
    fetchPopularTVShows: `${tmdbApiEndpoint}/tv/popular?api_key=${apiKeys.tmdb}&language=en-US`, // Fetch popular TV shows
    fetchPopularAnimatedSeries: `${tmdbApiEndpoint}/discover/tv?api_key=${apiKeys.tmdb}&with_genres=16&language=en-US` // Fetch popular animated series
};

let exploredCategoryId = null; // Keep track of the explored category ID
const processedCategories = new Set(); // Keep track of processed categories
let initialMoviesContHTML = ''; // Store the initial state of .movies-cont

// Boots up the app
function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
    fetchPopularContent();
    // Save the initial state of .movies-cont
    initialMoviesContHTML = document.getElementById('movies-cont').innerHTML;
}

function fetchTrendingMovies() {
    fetchAndbuildMovieSection(apiPaths.fetchTrending, 'Trending Now')
        .then(list => {
            const randomIndex = parseInt(Math.random() * list.length);
            buildBannerSection(list[randomIndex]);
        }).catch(err => {
            console.error(err);
        });
}

function fetchAndBuildAllSections() {
    fetch(apiPaths.fetchAllCategories)
        .then(res => res.json())
        .then(res => {
            const categories = res.genres;
            if (Array.isArray(categories) && categories.length) {
                categories.forEach(category => {
                    if (!processedCategories.has(category.id)) {
                        processedCategories.add(category.id);
                        fetchAndbuildMovieSection(
                            apiPaths.fetchMoviesList(category.id),
                            category.name,
                            category.id // Pass the category ID
                        );
                    }
                });
            }
        })
        .catch(err => console.error(err));
}

function fetchPopularContent() {
    fetchAndbuildMovieSection(apiPaths.fetchPopularMovies, 'Popular Movies');
    fetchAndbuildTVShowSection(apiPaths.fetchPopularTVShows, 'Popular TV Shows');
    fetchAndbuildTVShowSection(apiPaths.fetchPopularAnimatedSeries, 'Popular Animated Series');
}

async function fetchAndbuildMovieSection(fetchUrl, categoryName, categoryId) {
    console.log(fetchUrl, categoryName);
    try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        const movies = data.results || data.data;
        if (Array.isArray(movies) && movies.length) {
            const moviesWithTrailers = await filterMoviesWithTrailers(movies);
            buildMoviesSection(moviesWithTrailers, categoryName, categoryId); // Pass the category ID
        }
    } catch (err) {
        console.error(err);
    }
}

async function fetchAndbuildTVShowSection(fetchUrl, categoryName) {
    console.log(fetchUrl, categoryName);
    try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        const tvShows = data.results;
        if (Array.isArray(tvShows) && tvShows.length) {
            buildTVShowsSection(tvShows, categoryName);
        }
    } catch (err) {
        console.error(err);
    }
}

async function filterMoviesWithTrailers(movies) {
    const moviesWithTrailers = [];
    for (const movie of movies) {
        const trailer = await fetchMovieTrailer(movie.id);
        if (trailer) {
            moviesWithTrailers.push(movie);
        }
    }
    return moviesWithTrailers;
}

async function fetchMovieTrailer(movieId) {
    try {
        const res = await fetch(apiPaths.fetchMovieTrailer(movieId));
        const data = await res.json();
        return data.results.find(video => video.type === 'Trailer');
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function fetchAndbuildAnimeSection(fetchUrl, categoryName) {
    console.log(fetchUrl, categoryName);
    try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        const anime = data.data;
        if (Array.isArray(anime) && anime.length) {
            const animeWithTrailers = await filterAnimeWithTrailers(anime);
            buildAnimeSection(animeWithTrailers, categoryName);
        }
    } catch (err) {
        console.error(err);
    }
}

async function filterAnimeWithTrailers(animeList) {
    const animeWithTrailers = [];
    for (const anime of animeList) {
        const trailer = await fetchAnimeTrailer(anime.title);
        if (trailer) {
            animeWithTrailers.push(anime);
        }
    }
    return animeWithTrailers;
}

async function fetchAnimeTrailer(animeTitle) {
    try {
        const res = await fetch(apiPaths.searchOnYoutube(animeTitle + ' trailer'));
        const data = await res.json();
        return data.items.length > 0 ? data.items[0] : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function buildMoviesSection(list, categoryName, categoryId) {
    console.log(list, categoryName);

    const moviesCont = document.getElementById('movies-cont');

    const moviesListHTML = list.map(item => {
        return `
        <div class="movie-item" onclick="playMovie('${item.id}')">
            <img decoding="async" class="move-item-img" src="${imgPath}${item.poster_path}" alt="${item.title || item.name}" />
            <div class="movie-info">
                <h3>${item.title || item.name}</h3>
            </div>
        </div>`;
    }).join('');

    const moviesSectionHTML = `
        <h2 class="movie-section-heading">${categoryName}</h2>
        <div class="movies-row">
            ${moviesListHTML}
        </div>
    `;

    const div = document.createElement('div');
    div.className = "movies-section";
    div.innerHTML = moviesSectionHTML;

    // append html into movies container
    moviesCont.append(div);
}

function buildTVShowsSection(list, categoryName) {
    console.log(list, categoryName);

    const moviesCont = document.getElementById('movies-cont');

    const tvShowsListHTML = list.map(item => {
        return `
        <div class="movie-item" onclick="playMovie('${item.id}', true)">
            <img decoding="async" class="move-item-img" src="${imgPath}${item.poster_path}" alt="${item.name}" />
            <div class="movie-info">
                <h3>${item.name}</h3>
            </div>
        </div>`;
    }).join('');

    const tvShowsSectionHTML = `
        <h2 class="movie-section-heading">${categoryName}</h2>
        <div class="movies-row">
            ${tvShowsListHTML}
        </div>
    `;

    const div = document.createElement('div');
    div.className = "movies-section";
    div.innerHTML = tvShowsSectionHTML;

    // append html into movies container
    moviesCont.append(div);
}

function buildAnimeSection(list, categoryName) {
    console.log(list, categoryName);

    const moviesCont = document.getElementById('movies-cont');

    const moviesListHTML = list.map(item => {
        return `
        <div class="movie-item" onclick="playAnimeTrailer('${item.title}')">
            <img decoding="async" class="move-item-img" src="${item.images.jpg.image_url}" alt="${item.title_english || item.title}" />
            <div class="movie-info">
                <h3>${item.title_english || item.title}</h3>
            </div>
        </div>`;
    }).join('');

    const moviesSectionHTML = `
        <h2 class="movie-section-heading">${categoryName}</h2>
        <div class="movies-row">
            ${moviesListHTML}
        </div>
    `;

    const div = document.createElement('div');
    div.className = "movies-section";
    div.innerHTML = moviesSectionHTML;

    // append html into movies container
    moviesCont.append(div);
}

function playMovie(movieId, isTVShow = false) {
    const fetchDetails = isTVShow ? apiPaths.fetchTVShowDetails(movieId) : apiPaths.fetchMovieDetails(movieId);
    fetch(fetchDetails)
        .then(res => res.json())
        .then(details => {
            const playerContainer = document.querySelector('.player-container');
            const truncatedOverview = details.overview.split('\n').slice(0, 2).join('\n'); // Reduce description to 2 lines
            playerContainer.innerHTML = `
                <div class="movie-details">
                    <img src="${imgPath}${details.poster_path}" alt="${details.title || details.name}" class="movie-poster">
                    <div class="movie-info">
                        <h2>${details.title || details.name}</h2>
                        <p>${truncatedOverview}</p>
                        ${isTVShow ? buildSeasonsDropdown(details) : ''}
                        <button onclick="playTrailer('${details.id}', ${isTVShow})">Watch Trailer</button>
                        <button onclick="playStreaming('${details.id}', ${isTVShow})">Watch Now</button>
                        <button onclick="downloadMovie('${details.id}')">Download</button>
                        <button onclick="exitPlayer()">Exit</button>
                    </div>
                </div>
                <iframe id="movie-player" src="" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
            `;
            playerContainer.style.display = 'block';
        })
        .catch(err => console.error(err));
}

function buildSeasonsDropdown(tvShow) {
    const seasons = tvShow.seasons.map(season => `<option value="${season.season_number}">${season.name}</option>`).join('');
    return `
        <label for="seasons">Select Season:</label>
        <select id="seasons" onchange="fetchEpisodes('${tvShow.id}', this.value)">
            ${seasons}
        </select>
        <div id="episodes-cont"></div>
    `;
}

function fetchEpisodes(tvShowId, seasonNumber) {
    fetch(apiPaths.fetchTVShowEpisodes(tvShowId, seasonNumber))
        .then(res => res.json())
        .then(season => {
            const episodesCont = document.getElementById('episodes-cont');
            const episodesList = season.episodes.map(episode => `
                <div class="episode-item" onclick="playStreaming('${tvShowId}', true, ${seasonNumber}, ${episode.episode_number})">
                    <h4>${episode.name}</h4>
                    <p>${episode.overview}</p>
                </div>
            `).join('');
            episodesCont.innerHTML = `<h3>Episodes</h3>${episodesList}`;
        })
        .catch(err => console.error(err));
}

async function playStreaming(movieId, isTVShow = false, seasonNumber = null, episodeNumber = null) {
    const streamingUrl = isTVShow 
        ? `https://vidsrc.in/embed/${movieId}/${seasonNumber}/${episodeNumber}` 
        : `https://vidsrc.in/embed/${movieId}`; // Use VidSrc API for streaming
    const streamingCont = document.getElementById('streaming-cont');
    streamingCont.innerHTML = `
        <button class="close-btn" onclick="exitStreaming()">Close</button>
        <iframe id="movie-player-${movieId}" src="${streamingUrl}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
    `;
    streamingCont.style.display = 'flex';
}

function exitStreaming() {
    const streamingCont = document.getElementById('streaming-cont');
    streamingCont.style.display = 'none';
    streamingCont.innerHTML = '';
}

async function downloadMovie(movieId) {
    const response = await fetch(apiPaths.fetchMovieDetails(movieId));
    const movie = await response.json();
    const movieTitle = movie.title || movie.name;

    const downloadApiUrl = "http://your-backend-url/download"; // Update this with your backend URL

    const requestBody = JSON.stringify({
        url: `https://vidsrc.to/embed/${movieId}` // Replace with a valid source
    });

    try {
        const res = await fetch(downloadApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: requestBody
        });

        const data = await res.json();
        if (data.file) {
            window.open(`http://your-backend-url/download-file/${data.file}`, "_blank");
        } else {
            alert("Download failed!");
        }
    } catch (error) {
        console.error("Download error:", error);
    }
}

function exitPlayer() {
    const playerContainer = document.querySelector('.player-container');
    playerContainer.style.display = 'none';
    playerContainer.innerHTML = '';
}

function exitTrailer() {
    const trailerContainer = document.querySelector('.trailer-container');
    trailerContainer.style.display = 'none';
    trailerContainer.innerHTML = '';
}

window.addEventListener('load', function () {
    init();
    window.addEventListener('scroll', function () {
        // header ui update
        const header = document.getElementById('header');
        if (window.scrollY > 5) header.classList.add('black-bg');
        else header.classList.remove('black-bg');
    });
});

// Search functionality
const movieSearchInput = document.getElementById('movieSearch');
movieSearchInput.addEventListener('input', function (event) {
    const query = event.target.value;
    const searchResultsCont = document.getElementById('search-results-cont');

    if (query.length > 2) { // Start searching after 3 characters
        searchMovies(query);
        searchResultsCont.style.display = 'block';
    } else {
        // Clear search results and reset to normal when input is empty
        searchResultsCont.innerHTML = '';
        searchResultsCont.style.display = 'none';
        restoreMoviesCont();
    }
});

movieSearchInput.addEventListener('blur', function () {
    movieSearchInput.style.cursor = 'none';
});

movieSearchInput.addEventListener('focus', function () {
    movieSearchInput.style.cursor = 'text';
});

function searchMovies(query) {
    const tmdbUrl = apiPaths.searchMoviesTMDb(query);
    const jikanUrl = apiPaths.searchAnimeJikan(query);

    Promise.all([fetch(tmdbUrl), fetch(jikanUrl)])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(data => {
            const tmdbResults = data[0].results || [];
            const jikanResults = data[1].data || [];
            const combinedResults = [...tmdbResults, ...jikanResults];
            filterAndDisplayResults(combinedResults);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

async function filterAndDisplayResults(movies) {
    const moviesWithTrailers = [];
    for (const movie of movies) {
        const trailer = await fetchMovieTrailer(movie.id || movie.mal_id);
        if (trailer) {
            moviesWithTrailers.push(movie);
        }
    }
    displayResults(moviesWithTrailers);
}

function displayResults(movies) {
    const searchResultsCont = document.getElementById('search-results-cont');
    searchResultsCont.innerHTML = ''; // Clear previous results

    const moviesListHTML = movies.map(movie => {
        const posterPath = movie.poster_path ? `${imgPath}${movie.poster_path}` : movie.images?.jpg?.image_url;
        const title = movie.title || movie.title_english || movie.name;
        return `
        <div class="movie-item" onclick="playMovie('${movie.id || movie.mal_id}')">
            <img decoding="async" class="move-item-img" src="${posterPath}" alt="${title}" />
            <div class="movie-info">
                <h3>${title}</h3>
            </div>
        </div>`;
    }).join('');

    const resultsSectionHTML = `
        <h2 class="movie-section-heading">Search Results</h2>
        <div class="movies-row">
            ${moviesListHTML}
        </div>
    `;

    searchResultsCont.innerHTML = resultsSectionHTML;
}