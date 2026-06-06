
  /**
   * Returns a normalized provider name for better matching against user-selected streaming services.
   * This function checks if the provider name includes certain keywords and returns a standardized
   * name for that provider.
   */
function normalizeProviderName(name) {
    if (name.includes('Max')) return 'HBO Max';
    if (name.includes('Prime Video')) return 'Prime Video';
    if (name.includes('Crunchyroll')) return 'Crunchyroll';
    if (name.includes('Peacock')) return 'Peacock';
    if (name.includes('Paramount')) return 'Paramount+';
    if (name.includes('Disney')) return 'Disney+';
    if (name.includes('Netflix')) return 'Netflix';
    return name;
    }

function getSelectedServices() {
      return JSON.parse(localStorage.getItem("selectedServices")) || [];
    }

/** Checks whether a movie is available on at least one of the user's selected streaming services. * *
 * @param {Object} movie - The movie object returned from the TMDB API, including watch provider data.
 * @param {string[]} selectedServices - An array of streaming service names selected by the user, usually retrieved from the database or local storage.
 * @returns {boolean} True if the movie has a matching streaming provider; otherwise, false.
 */
export function hasSelectedStreamingService(movie, selectedServices = getSelectedServices()) {
    const providers =
      movie["watch/providers"]?.results?.US?.flatrate ?? [];
  /**
   * .some iterates through the providers and returns true if any provider's name is
   * included in the user's selected services.
   */
    return providers.some((provider) =>
      selectedServices.includes( normalizeProviderName(provider.provider_name) )
    )
  }

