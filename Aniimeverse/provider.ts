import { load } from "cheerio"

const BASE_URL = "https://animeverse.to"

export interface SearchResult {
  id: string
  title: string
  image?: string
}

export interface Episode {
  id: string
  number: number
}

export interface VideoSource {
  url: string
  quality?: string
}

export default class AnimeVerseProvider {

  async search(query: string): Promise<SearchResult[]> {
    const res = await fetch(
      `${BASE_URL}/search?keyword=${encodeURIComponent(query)}`
    )

    const html = await res.text()
    const $ = load(html)

    const results: SearchResult[] = []

    $(".flw-item").each((_, el) => {
      const link = $(el).find("a").attr("href") || ""
      const title = $(el).find(".film-name").text().trim()
      const image = $(el).find("img").attr("data-src")

      const id = link.split("/").pop() || ""

      results.push({
        id,
        title,
        image
      })
    })

    return results
  }

  async getEpisodes(animeId: string): Promise<Episode[]> {
    const res = await fetch(`${BASE_URL}/watch/${animeId}`)
    const html = await res.text()

    const $ = load(html)

    const episodes: Episode[] = []

    $(".ss-list a").each((_, el) => {
      const epId = $(el).attr("data-id") || ""
      const number =
        parseInt($(el).attr("data-number") || "0")

      episodes.push({
        id: epId,
        number
      })
    })

    return episodes.reverse()
  }

  async getSources(episodeId: string): Promise<VideoSource[]> {
    const ajaxUrl =
      `${BASE_URL}/ajax/episode/sources?id=${episodeId}`

    const res = await fetch(ajaxUrl, {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    })

    const data = await res.json()

    const sourceLink = data.link

    if (!sourceLink) return []

    return [
      {
        url: sourceLink,
        quality: "auto"
      }
    ]
  }
}
