'use strict';

(() => {
  async function readApiResponse(response) {
    const body = await response.text();
    let result;
    try {
      result = JSON.parse(body);
    } catch {
      if (response.status === 403 || /^\s*forbidden\b/i.test(body)) {
        throw new Error("Collabify's API returned Forbidden. You're likely using a static preview instead of the backend. Start PostgreSQL and `npm start` in the Collabify app folder, then open http://localhost:3000.");
      }
      throw new Error(`Collabify's API returned an unexpected non-JSON response (HTTP ${response.status}). Start the backend with PostgreSQL and open http://localhost:3000.`);
    }
    if (!response.ok) throw new Error(result.error || `Collabify's API request failed (HTTP ${response.status}).`);
    return result;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { readApiResponse };
  } else {
    window.CollabifyApi = Object.freeze({ readResponse: readApiResponse });
  }
})();
