import axios from "axios"
import * as $ from 'jquery';
import { ids } from "webpack";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const BASE_URL = "http://api.tvmaze.com/";
const DEFAULT_IMAGE_URL = "https://static1.colliderimages.com/wordpress/wp-content/uploads/2020/01/fast-and-furious-9-vin-diesel-poster-379x600.jpg?q=50&fit=crop&w=750&dpr=1.5"

// http://api.tvmaze.com/search/shows?q=bletchley

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

interface Show {
  id: number,
  name: string,
  summary: string,
  image: string
}

async function getShowsByTerm(term: string): Promise<Show[]> { //questionable
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get(`${BASE_URL}search/shows?q=${term}`);
  console.log("getShowsByTerm response --->", response);
  const shows: Array<Show> = response.data.map(s => {
    if (!s.show.image) {
      return { id: s.show.id, name: s.show.name, summary: s.show.summary, image: DEFAULT_IMAGE_URL }
    } else {
      return { id: s.show.id, name: s.show.name, summary: s.show.summary, image: s.show.image.original }
    }
  })
  return shows;

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media" attribute=${show.id}>
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


interface Episode {
  id: number,
  name: string,
  season: string,
  number: string
}
/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<Episode[]> {
  const resp = await axios.get(`${BASE_URL}shows/${id}/episodes`)

  const episodes = resp.data.map((e: Episode) => {
    return {
      id: e.id,
      name: e.name,
      season: e.season,
      number: e.number
    }
  })
  console.log("episodes ==>", episodes)
  return episodes;
}

/** for each episode in episodes list, 
 * append episode LI element to $episodesList
 */


function populateEpisodes(episodes) : void {
  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name}
      (Season${episode.season}, 
      Episode${episode.number})
      </li>`
    );
    $episodesList.append($episode);
    
  }
  $episodesArea.show()
}

$showsList.on("click",async  function(evt){
  $episodesList.empty()
  let showDiv = evt.target.closest(".Show")
  
  console.log("button clicked", $(showDiv).data("showId"));
  
  let episodes = await getEpisodesOfShow($(showDiv).data("showId"));
  console.log("Episodes ==>", episodes)
  
  populateEpisodes(episodes);

} )
