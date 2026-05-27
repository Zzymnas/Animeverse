const BASE_URL = "https://animeverse.to";

export default {
  id: "animeverse",

  name: "AnimeVerse",

  async search(query) {
    const res = await fetch(
      `${BASE_URL}/search?keyword=${encodeURIComponent(query)}`
    );

    const html = await res.text();

    const results = [];

    const regex =
      /href="\/watch\/([^"]+)".*?<img[^>]+(?:data-src|src)="([^"]+)".*?alt="([^"]+)"/gs;

    let match;

    while ((match = regex.exec(html)) !== null) {
      results.push({
        id: match[1],
        title: match[3],
        image: match[2],
      });
    }

    return results;
  },

  async getEpisodes(animeId) {
    const res = await fetch(`${BASE_URL}/watch/${animeId}`);
    const html = await res.text();

    const episodes = [];

    const regex =
      /data-number="([^"]+)".*?data-id="([^"]+)"/gs;

    let match;

    while ((match = regex.exec(html)) !== null) {
      episodes.push({
        id: match[2],
        number: parseFloat(match[1]),
      });
    }

    return episodes.reverse();
  },

  async getSources(episodeId) {
    const res = await fetch(
      `${BASE_URL}/ajax/episode/sources?id=${episodeId}`
    );

    const data = await res.json();

    if (!data.link) return [];

    return [
      {
        url: data.link,
        quality: "auto",
      },
    ];
  },
};
