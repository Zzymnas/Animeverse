/// <reference path="./online-streaming-provider.d.ts" />

class Provider {

    base = "https://animeverse.to"

    getSettings(): Settings {
        return {
            episodeServers: ["vidnest"],
            supportsDub: true,
        }
    }

    async search(query: SearchOptions): Promise<SearchResult[]> {

        const res = await fetch(this.base + "/search?q=" + encodeURIComponent(query.query))
        const html = await res.text()

        const results: SearchResult[] = []
        const regex = /href="(\/anime\/[^"]+)".*?>([^<]+)</g
        let match

        while ((match = regex.exec(html)) !== null) {
            results.push({
                id: match[1],
                title: match[2].trim(),
                url: this.base + match[1],
                subOrDub: query.dub ? "dub" : "sub",
            })
        }

        return results
    }

    async findEpisodes(id: string): Promise<EpisodeDetails[]> {

        const res = await fetch(this.base + id)
        const html = await res.text()

        const episodes: EpisodeDetails[] = []
        const regex = /href="(\/episode\/[^"]+)".*?(\d+)/g
        let match

        while ((match = regex.exec(html)) !== null) {
            episodes.push({
                id: match[1],
                number: Number(match[2]),
                url: this.base + match[1],
            })
        }

        return episodes
    }

    async findEpisodeServer(episode: EpisodeDetails, _server: string): Promise<EpisodeServer> {

        const res = await fetch(episode.url)
        const html = await res.text()

        const videoSources: VideoSource[] = []
        const subtitles: VideoSubtitle[] = []

        // =========================
        // VIDNEST (MAIN SOURCE)
        // =========================
        const vidnest = html.match(/https:\/\/vidnest\.fun\/anime\/[^"']+/)

        if (vidnest) {
            videoSources.push({
                url: vidnest[0],
                type: "m3u8",
                quality: "VidNest",
                subtitles: []
            })
        }

        // =========================
        // IFRAME FALLBACK
        // =========================
        const iframe = html.match(/iframe.*src="([^"]+)"/)

        if (iframe) {
            videoSources.push({
                url: iframe[1],
                type: "unknown",
                quality: "iframe",
                subtitles: []
            })
        }

        // =========================
        // OPTIONAL: DIRECT STREAM API (if ever exposed)
        // =========================
        const api = html.match(/\/api\/v1\/anime\/[^"']+stream\/\d+/)

        if (api) {
            videoSources.push({
                url: this.base + api[0],
                type: "unknown",
                quality: "api",
                subtitles: []
            })
        }

        return {
            server: "vidnest",
            headers: {},
            videoSources
        }
    }
}
