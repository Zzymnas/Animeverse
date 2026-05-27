function Provider() {
    this.base = "https://animeverse.to"
}

/**
 * REQUIRED: Settings
 */
Provider.prototype.getSettings = function () {
    return {
        type: "main",
        supportsAdult: false
    }
}

/**
 * SEARCH ANIME
 */
Provider.prototype.search = function (query) {
    var url = this.base + "/search?q=" + encodeURIComponent(query)

    return fetch(url)
        .then(function (res) { return res.text() })
        .then(function (html) {

            var results = []
            var regex = /href="(\/anime\/[^"]+)".*?>([^<]+)</g
            var match

            while ((match = regex.exec(html)) !== null) {
                results.push({
                    id: match[1],
                    title: match[2].trim()
                })
            }

            return results
        })
}

/**
 * GET EPISODES
 */
Provider.prototype.getEpisodes = function (anime) {
    var url = this.base + anime.id

    return fetch(url)
        .then(function (res) { return res.text() })
        .then(function (html) {

            var episodes = []
            var regex = /href="(\/episode\/[^"]+)".*?(\d+)/g
            var match

            while ((match = regex.exec(html)) !== null) {
                episodes.push({
                    id: match[1],
                    number: Number(match[2])
                })
            }

            return episodes
        })
}

/**
 * GET STREAM URL
 */
Provider.prototype.getStreamUrl = function (episode) {
    var url = this.base + episode.id

    return fetch(url)
        .then(function (res) { return res.text() })
        .then(function (html) {

            var sources = []

            // VidNest iframe (PRIMARY SOURCE)
            var iframeMatch = html.match(/vidnest\.fun\/anime\/[^"']+/)
            if (iframeMatch) {
                sources.push({
                    url: iframeMatch[0],
                    quality: "VidNest",
                    isIframe: true
                })
            }

            // API fallback
            var apiMatch = html.match(/\/api\/v1\/anime\/[^"']+stream\/\d+/)
            if (apiMatch) {
                sources.push({
                    url: "https://animeverse.to" + apiMatch[0],
                    quality: "API_STREAM"
                })
            }

            // Generic iframe fallback
            var iframe = html.match(/iframe.*src="([^"]+)"/)
            if (iframe) {
                sources.push({
                    url: iframe[1],
                    quality: "IFRAME",
                    isIframe: true
                })
            }

            return sources
        })
}
