import {tavily as Tavily} from "@tavily/core"

const tavily = Tavily({
    apiKey: process.env.TAVILY_API_KEY,

})

const focusDomains = {
    news:["reuters.com","bbc.com","thehindu.com","theguardian.com","ndtv.com"],
    academic:["arxiv.org","researchgate.net","nature.com","sciencedirect.com","wikipedia.org"],
    forums:["quora.com","stackoverflow.com","dev.to","medium.com"],
    web:[]
}

export const searchInternet = async ({query,focus = "web"}) =>{
    const domains = focusDomains[focus] || []
    const results = await tavily.search(query,{
        maxResults:5,
        searchDepth:"advanced",
        ...(domains.length>0 && {includeDomains:domains})
    })

    return JSON.stringify(results)

}