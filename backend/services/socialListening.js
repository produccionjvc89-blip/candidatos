import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ==================== CLASE PRINCIPAL DE ESCUCHA SOCIAL ====================

export class SocialListeningService {
    constructor() {
        this.results = {};
        this.errors = [];
    }

    /**
     * TWITTER/X - Búsqueda de menciones
     */
    async searchTwitter(keyword) {
        try {
            const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
                headers: {
                    'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
                },
                params: {
                    query: keyword,
                    max_results: 100,
                    'tweet.fields': 'created_at,author_id,public_metrics',
                    'expansions': 'author_id',
                    'user.fields': 'username,verified'
                }
            });

            return {
                platform: 'Twitter/X',
                count: response.data.meta.result_count,
                tweets: response.data.data || [],
                includes: response.data.includes || {}
            };
        } catch (error) {
            this.errors.push({ service: 'Twitter', error: error.message });
            return null;
        }
    }

    /**
     * REDDIT - Búsqueda de posts y comentarios
     */
    async searchReddit(keyword) {
        try {
            const response = await axios.get('https://www.reddit.com/r/all/search.json', {
                params: {
                    q: keyword,
                    limit: 50,
                    sort: 'new',
                    t: 'week'
                },
                headers: {
                    'User-Agent': 'candidatos-app-v1.0'
                }
            });

            const posts = response.data.data.children.map(post => ({
                title: post.data.title,
                author: post.data.author,
                subreddit: post.data.subreddit,
                score: post.data.score,
                comments: post.data.num_comments,
                created_at: new Date(post.data.created_utc * 1000),
                url: post.data.url
            }));

            return {
                platform: 'Reddit',
                count: posts.length,
                posts: posts
            };
        } catch (error) {
            this.errors.push({ service: 'Reddit', error: error.message });
            return null;
        }
    }

    /**
     * NEWS API - Noticias sobre el candidato
     */
    async searchNews(keyword) {
        try {
            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: keyword,
                    sortBy: 'publishedAt',
                    language: 'es',
                    apiKey: process.env.NEWSAPI_KEY,
                    pageSize: 50
                }
            });

            return {
                platform: 'News API',
                count: response.data.totalResults,
                articles: response.data.articles
            };
        } catch (error) {
            this.errors.push({ service: 'News API', error: error.message });
            return null;
        }
    }

    /**
     * MASTODON - Búsqueda en Fediverse
     */
    async searchMastodon(keyword) {
        try {
            const instance = process.env.MASTODON_INSTANCE || 'mastodon.social';
            const response = await axios.get(`https://${instance}/api/v2/search`, {
                params: {
                    q: keyword,
                    type: 'statuses',
                    limit: 50
                }
            });

            return {
                platform: 'Mastodon',
                count: response.data.statuses.length,
                statuses: response.data.statuses
            };
        } catch (error) {
            this.errors.push({ service: 'Mastodon', error: error.message });
            return null;
        }
    }

    /**
     * GITHUB - Búsqueda de repositorios y actividad
     */
    async searchGitHub(keyword) {
        try {
            const response = await axios.get('https://api.github.com/search/repositories', {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`
                },
                params: {
                    q: keyword,
                    sort: 'stars',
                    order: 'desc',
                    per_page: 50
                }
            });

            return {
                platform: 'GitHub',
                count: response.data.total_count,
                repositories: response.data.items
            };
        } catch (error) {
            this.errors.push({ service: 'GitHub', error: error.message });
            return null;
        }
    }

    /**
     * YOUTUBE - Búsqueda de vídeos
     */
    async searchYouTube(keyword) {
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    q: keyword,
                    type: 'video',
                    part: 'snippet',
                    maxResults: 50,
                    key: process.env.GOOGLE_API_KEY,
                    order: 'viewCount'
                }
            });

            return {
                platform: 'YouTube',
                count: response.data.items.length,
                videos: response.data.items
            };
        } catch (error) {
            this.errors.push({ service: 'YouTube', error: error.message });
            return null;
        }
    }

    /**
     * TIKTOK - Búsqueda de videos (requiere scraping)
     */
    async searchTikTok(keyword) {
        try {
            // Usando API no-oficial o scraping
            const response = await axios.get(`https://api.douyin.com/v1/video/search`, {
                params: {
                    keyword: keyword,
                    offset: 0,
                    count: 50
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });

            return {
                platform: 'TikTok',
                count: response.data.data?.length || 0,
                videos: response.data.data || []
            };
        } catch (error) {
            this.errors.push({ service: 'TikTok', error: error.message });
            return null;
        }
    }

    /**
     * INSTAGRAM - Búsqueda (requiere Meta API)
     */
    async searchInstagram(keyword) {
        try {
            const response = await axios.get(
                `https://graph.instagram.com/ig_hashtag_search`,
                {
                    params: {
                        user_id: process.env.INSTAGRAM_USER_ID,
                        fields: 'id,name',
                        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
                    }
                }
            );

            return {
                platform: 'Instagram',
                count: response.data.data?.length || 0,
                hashtags: response.data.data || []
            };
        } catch (error) {
            this.errors.push({ service: 'Instagram', error: error.message });
            return null;
        }
    }

    /**
     * FACEBOOK - Búsqueda de posts públicos
     */
    async searchFacebook(keyword) {
        try {
            const response = await axios.get(
                'https://graph.facebook.com/v18.0/ig_hashtag_search',
                {
                    params: {
                        fields: 'id,name,results',
                        access_token: process.env.FACEBOOK_ACCESS_TOKEN
                    }
                }
            );

            return {
                platform: 'Facebook',
                count: response.data.data?.length || 0,
                data: response.data.data || []
            };
        } catch (error) {
            this.errors.push({ service: 'Facebook', error: error.message });
            return null;
        }
    }

    /**
     * LINKEDIN - Búsqueda de posts
     */
    async searchLinkedIn(keyword) {
        try {
            const response = await axios.get(
                'https://api.linkedin.com/v2/search/queries',
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                        'X-Restli-Protocol-Version': '2.0.0'
                    },
                    params: {
                        keywords: keyword,
                        count: 50
                    }
                }
            );

            return {
                platform: 'LinkedIn',
                count: response.data.data?.length || 0,
                results: response.data.data || []
            };
        } catch (error) {
            this.errors.push({ service: 'LinkedIn', error: error.message });
            return null;
        }
    }

    /**
     * WIKIPEDIA - Búsqueda de información
     */
    async searchWikipedia(keyword) {
        try {
            const response = await axios.get(
                'https://es.wikipedia.org/w/api.php',
                {
                    params: {
                        action: 'query',
                        list: 'search',
                        srsearch: keyword,
                        format: 'json',
                        srlimit: 50
                    }
                }
            );

            return {
                platform: 'Wikipedia',
                count: response.data.query.search.length,
                results: response.data.query.search
            };
        } catch (error) {
            this.errors.push({ service: 'Wikipedia', error: error.message });
            return null;
        }
    }

    /**
     * STACKOVERFLOW - Búsqueda de Q&A
     */
    async searchStackOverflow(keyword) {
        try {
            const response = await axios.get(
                'https://api.stackexchange.com/2.3/search',
                {
                    params: {
                        intitle: keyword,
                        site: 'stackoverflow',
                        pagesize: 50,
                        order: 'desc',
                        sort: 'activity'
                    }
                }
            );

            return {
                platform: 'Stack Overflow',
                count: response.data.items.length,
                questions: response.data.items
            };
        } catch (error) {
            this.errors.push({ service: 'Stack Overflow', error: error.message });
            return null;
        }
    }

    /**
     * MEDIUM - Búsqueda de artículos
     */
    async searchMedium(keyword) {
        try {
            const response = await axios.get(
                `https://api.medium.com/v1/search?q=${keyword}`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.MEDIUM_ACCESS_TOKEN}`
                    }
                }
            );

            return {
                platform: 'Medium',
                count: response.data.data?.length || 0,
                articles: response.data.data || []
            };
        } catch (error) {
            this.errors.push({ service: 'Medium', error: error.message });
            return null;
        }
    }

    /**
     * ARCHIVE.ORG - Búsqueda del historial de web
     */
    async searchArchiveOrg(url) {
        try {
            const response = await axios.get(
                'https://archive.org/advancedsearch.php',
                {
                    params: {
                        url: url,
                        output: 'json',
                        fl: ['timestamp', 'statuscode'],
                        filter: 'statuscode:200'
                    }
                }
            );

            return {
                platform: 'Archive.org',
                count: response.data.response.numFound,
                snapshots: response.data.response.docs
            };
        } catch (error) {
            this.errors.push({ service: 'Archive.org', error: error.message });
            return null;
        }
    }

    /**
     * EJECUTAR BÚSQUEDA COMPLETA EN TODAS LAS REDES
     */
    async analyzeAllPlatforms(keyword) {
        console.log(`🔍 Iniciando análisis de "${keyword}" en todas las plataformas...`);

        const results = await Promise.all([
            this.searchTwitter(keyword),
            this.searchReddit(keyword),
            this.searchNews(keyword),
            this.searchMastodon(keyword),
            this.searchGitHub(keyword),
            this.searchYouTube(keyword),
            this.searchWikipedia(keyword),
            this.searchStackOverflow(keyword)
        ]);

        return {
            keyword,
            timestamp: new Date(),
            platforms: results.filter(r => r !== null),
            errors: this.errors,
            summary: {
                totalMentions: results.reduce((acc, r) => acc + (r?.count || 0), 0),
                activePlatforms: results.filter(r => r !== null).length,
                failedPlatforms: this.errors.length
            }
        };
    }

    /**
     * ANÁLISIS DE SENTIMIENTO (requiere API externa)
     */
    async analyzeSentiment(text) {
        try {
            const response = await axios.post(
                'https://api.meaningcloud.com/sentiment-2.1',
                new URLSearchParams({
                    key: process.env.MEANINGCLOUD_KEY,
                    txt: text,
                    lang: 'es'
                })
            );

            return {
                score: response.data.score,
                confidence: response.data.confidence,
                sentiment: response.data.score_tag // P, N, NEU, NONE
            };
        } catch (error) {
            this.errors.push({ service: 'Sentiment Analysis', error: error.message });
            return null;
        }
    }
}

export default new SocialListeningService();
