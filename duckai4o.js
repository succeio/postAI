const axios = require('axios');
const { randomUUID } = require('crypto');
const { setTimeout } = require('timers/promises');

class DDGS {
    constructor(headers = null, proxy = null, timeout = 10000) {
        /**
         * Initialize the DDGS object.
         *
         * @param {Object} headers - Optional headers for the HTTP client.
         * @param {String} proxy - Optional proxy URL for the HTTP client.
         * @param {Number} timeout - Timeout in milliseconds for the HTTP client.
         */
        this.proxy = proxy || null;
        this.headers = headers || {};
        this.headers['Referer'] = 'https://duckduckgo.com/';
        this.client = axios.create({
            headers: this.headers,
            proxy: proxy ? { host: proxy } : false,
            timeout: timeout,
        });
        this._chatMessages = [];
        this._chatTokensCount = 0;
        this._chatVqd = '';
        this._impersonates = [
            "chrome_100", "chrome_108", "chrome_127", "safari_ios_17.4.1", "edge_122", "safari_18"
        ];
        this._exceptionEvent = false;
    }

    async enter() {
        return this;
    }

    async exit() {
        return;
    }

    async getVqd(keywords) {
        /**
         * Get the vqd value for a search query.
         *
         * @param {String} keywords - The search keywords.
         * @return {String} vqd - The vqd value.
         */
        if (this._exceptionEvent) throw new Error('Exception occurred in previous call.');
        try {
            const resp = await this.client.post('https://duckduckgo.com', { q: keywords });
            return this._extractVqd(resp.data, keywords);
        } catch (error) {
            this._exceptionEvent = true;
            throw new Error(`Failed to get vqd: ${error.message}`);
        }
    }

    async chat(keywords, model = 'gpt-4o-mini', timeout = 30000) {
        /**
         * Initiates a chat session with DuckDuckGo AI.
         *
         * @param {String} keywords - Initial user message.
         * @param {String} model - The model to use for the chat (default is gpt-4o-mini).
         * @param {Number} timeout - Timeout value for the request.
         * @return {String} The response from the AI.
         */
        const models = {
            'claude-3-haiku': 'claude-3-haiku-20240307',
            'gpt-4o-mini': 'gpt-4o-mini',
            'llama-3.1-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
            'mixtral-8x7b': 'mistralai/Mixtral-8x7B-Instruct-v0.1'
        };

        try {
            // Get vqd if not already set
            if (!this._chatVqd) {
                const statusResp = await this.client.get('https://duckduckgo.com/duckchat/v1/status', {
                    headers: { 'x-vqd-accept': '1' }
                });
                this._chatVqd = statusResp.headers['x-vqd-4'] || '';
            }

            this._chatMessages.push({ role: 'user', content: keywords });
            this._chatTokensCount += Math.max(Math.floor(keywords.length / 4), 1);

            const jsonData = {
                model: models[model],
                messages: this._chatMessages,
            };

            // Send chat request
            const chatResp = await this.client.post(
                'https://duckduckgo.com/duckchat/v1/chat',
                jsonData,
                {
                    headers: { 'x-vqd-4': this._chatVqd },
                    timeout: timeout,
                }
            );

            this._chatVqd = chatResp.headers['x-vqd-4'] || '';

            // Process chat response
            const messages = this._processChatResponse(chatResp.data);

            this._chatMessages.push({ role: 'assistant', content: messages });
            this._chatTokensCount += messages.length;

            return messages;
        } catch (error) {
            throw new Error(`Chat failed: ${error.message}`);
        }
    }

    _processChatResponse(data) {
        /**
         * Processes the response from DuckDuckGo chat and extracts messages.
         *
         * @param {String} data - The raw response data from the chat API.
         * @return {String} The combined chat response.
         */
        const lines = data.replace('data: ', '').split('\n\n');
        const results = [];

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                try {
                    const jsonLine = trimmedLine.replace(/^\s*data:\s*/, '').trim();
                    const parsedLine = JSON.parse(jsonLine);
                    if (parsedLine.message) {
                        results.push(parsedLine.message);
                    }
                } catch (error) {
                    //console.error(`Failed to parse response: ${trimmedLine}`, error);
                }
            }
        }

        return results.join('');
    }

    _extractVqd(responseData, keywords) {
        // Mock implementation of extracting vqd from the HTML page
        const match = /vqd=([\d-]+)/.exec(responseData);
        return match ? match[1] : '';
    }
}

module.exports = DDGS;
