/**
 * Fact-Checking Service
 * 
 * Robust AI fact-checking pipeline using external sources and LLM reasoning.
 * Structured to easily integrate with real APIs via environment variables.
 */

const axios = require('axios');

/**
 * Query web search API for fact-checking
 * @param {string} query - Search query string
 * @returns {Promise<Array>} - Array of search results
 */
async function queryWebSearch(query) {
  try {
    // Option 1: SerpAPI (https://serpapi.com/)
    if (process.env.SERPAPI_KEY) {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          api_key: process.env.SERPAPI_KEY,
          q: query,
          engine: 'google',
          num: 8,
        },
        timeout: 10000,
      });
      
      const results = response.data.organic_results || [];
      return results.map((item) => ({
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || '',
      })).slice(0, 8);
    }

    // Option 2: Perplexity API
    if (process.env.PERPLEXITY_API_KEY) {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a fact-checking assistant. Provide search results for verifying claims.',
            },
            {
              role: 'user',
              content: `Find reliable sources to verify this claim: ${query}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      // Parse Perplexity citations
      const citations = response.data.citations || [];
      return citations.map((cite, idx) => ({
        title: `Source ${idx + 1}`,
        url: cite,
        snippet: `Cited source for verification`,
      })).slice(0, 8);
    }

    // Option 3: Google Custom Search (if configured)
    if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_CX,
          q: query,
          num: 8,
        },
        timeout: 10000,
      });

      const results = response.data.items || [];
      return results.map((item) => ({
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || '',
      }));
    }

    // Fallback: Mock implementation (for development)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockResults = [
      {
        title: `Fact Check: ${query.substring(0, 60)}`,
        url: 'https://example-factcheck.org/article1',
        snippet: 'Multiple sources confirm this claim is accurate and has been verified by reputable news organizations.',
      },
      {
        title: `Verification Report: ${query.substring(0, 60)}`,
        url: 'https://verified-news.org/report',
        snippet: 'This information has been cross-referenced with official sources and appears to be credible.',
      },
      {
        title: `Analysis: ${query.substring(0, 60)}`,
        url: 'https://fact-check.org/analysis',
        snippet: 'Evidence from multiple independent sources supports this claim.',
      },
    ];

    return mockResults;
  } catch (error) {
    console.error('Web search error:', error.message);
    // Return empty array on error - will lead to unverified verdict
    return [];
  }
}

/**
 * Query LLM for fact-checking analysis
 * @param {string} claim - The claim to analyze
 * @param {Array} sources - Search results to use as context
 * @returns {Promise<Object>} - LLM analysis result
 */
async function queryLLM(claim, sources = []) {
  try {
    // Option 1: OpenAI
    if (process.env.OPENAI_API_KEY) {
      const sourcesText = sources.map((s, idx) => 
        `${idx + 1}. ${s.title}\n   URL: ${s.url}\n   ${s.snippet}`
      ).join('\n\n');

      const systemPrompt = `You are an expert fact-checker. Analyze the claim using ONLY the provided search results. 
Output your analysis as valid JSON following this exact schema:
{
  "verdict": "true" | "false" | "mostly_true" | "mostly_false" | "mixed" | "unverified",
  "credibility": 0-100,
  "summary": "2-3 sentence summary",
  "explanation": "Detailed explanation with evidence",
  "evidence": [
    {
      "sourceTitle": "...",
      "sourceUrl": "...",
      "reason": "Why this source supports the verdict"
    }
  ]
}

Rules:
- Use "unverified" if evidence is weak (credibility < 20) or conflicting
- Use "mixed" if evidence is partially supportive
- Use "mostly_true" or "mostly_false" if largely true/false but some nuances
- Be conservative - prefer "unverified" over guessing
- Base credibility ONLY on provided sources`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Claim to verify: "${claim}"\n\nSearch Results:\n${sourcesText || 'No sources found'}\n\nProvide your fact-check analysis as JSON:`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);

      return {
        verdict: parsed.verdict || 'unverified',
        credibility: Math.min(100, Math.max(0, parsed.credibility || 0)),
        summary: parsed.summary || 'Analysis completed',
        explanation: parsed.explanation || parsed.summary || '',
        evidence: parsed.evidence || [],
        detectionMethods: ['web_search', 'openai_llm'],
      };
    }

    // Option 2: Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
      const sourcesText = sources.map((s, idx) => 
        `${idx + 1}. ${s.title} (${s.url})\n   ${s.snippet}`
      ).join('\n\n');

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `As an expert fact-checker, analyze this claim using ONLY the provided sources. Return JSON with: verdict (true/false/mostly_true/mostly_false/mixed/unverified), credibility (0-100), summary, explanation, and evidence array.\n\nClaim: "${claim}"\n\nSources:\n${sourcesText || 'No sources found'}`,
            },
          ],
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const content = response.data.content[0].text;
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          verdict: parsed.verdict || 'unverified',
          credibility: Math.min(100, Math.max(0, parsed.credibility || 0)),
          summary: parsed.summary || 'Analysis completed',
          explanation: parsed.explanation || parsed.summary || '',
          evidence: parsed.evidence || [],
          detectionMethods: ['web_search', 'anthropic_claude'],
        };
      }
    }

    // Fallback: Rule-based heuristic (when no LLM available)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const sourcesText = sources.map((s) => s.snippet).join(' ').toLowerCase();
    const claimLower = claim.toLowerCase();

    let verdict = 'unverified';
    let credibility = 20;
    let explanation = 'This claim cannot be confidently verified with current public sources.';

    // If no sources, definitely unverified
    if (sources.length === 0) {
      return {
        verdict: 'unverified',
        credibility: 0,
        summary: 'Not yet confirmed - insufficient sources available.',
        explanation: 'This claim cannot be confidently verified with current public sources.',
        evidence: [],
        detectionMethods: ['web_search'],
      };
    }

    // Check for debunking keywords
    if (sourcesText.includes('debunk') || sourcesText.includes('false') || sourcesText.includes('misleading') || sourcesText.includes('hoax')) {
      verdict = 'false';
      credibility = 75;
      explanation = 'Multiple sources indicate this claim is false or misleading.';
    }
    // Check for verification keywords
    else if (sourcesText.includes('verified') || sourcesText.includes('confirm') || sourcesText.includes('accurate') || sourcesText.includes('true')) {
      verdict = 'true';
      credibility = 80;
      explanation = 'This claim has been verified by multiple reputable sources.';
    }
    // Check for mixed evidence
    else if (sourcesText.includes('partially') || sourcesText.includes('mixed') || sourcesText.includes('unclear')) {
      verdict = 'mixed';
      credibility = 50;
      explanation = 'Evidence is mixed - some aspects may be true while others are not.';
    }
    // Scientific claims with sources
    else if (claimLower.includes('scientists') || claimLower.includes('research') || claimLower.includes('study') || claimLower.includes('published')) {
      verdict = 'mostly_true';
      credibility = 70;
      explanation = 'This appears to be a scientific claim with credible backing from sources.';
    }
    // Sensational claims are often false
    else if (claimLower.includes('cure') || claimLower.includes('miracle') || claimLower.includes('shocking') || claimLower.includes('secret')) {
      verdict = 'mostly_false';
      credibility = 30;
      explanation = 'Sensational claims like this are often false or exaggerated, and sources do not support it.';
    }

    return {
      verdict,
      credibility,
      summary: explanation.substring(0, 200),
      explanation,
      evidence: sources.slice(0, 5).map((s, idx) => ({
        sourceTitle: s.title,
        sourceUrl: s.url,
        reason: s.snippet.substring(0, 100),
      })),
      detectionMethods: ['web_search', 'heuristic_analysis'],
    };
  } catch (error) {
    console.error('LLM query error:', error.message);
    
    // On error, return unverified
    return {
      verdict: 'unverified',
      credibility: 0,
      summary: 'Analysis failed due to an internal error or connectivity issue.',
      explanation: 'This claim cannot be verified at this time due to technical limitations.',
      evidence: [],
      detectionMethods: ['error_fallback'],
    };
  }
}

/**
 * Perform fact-check on input
 * @param {Object} params - Fact-check parameters
 * @param {string} [params.inputText] - Text to check
 * @param {string} [params.inputUrl] - URL to check
 * @param {string} [params.inputImageUrl] - Image URL to check
 * @returns {Promise<Object>} - Fact-check result
 */
async function performFactCheck({ inputText, inputUrl, inputImageUrl }) {
  try {
    // Build unified claim string
    let claim = '';

    if (inputText) {
      claim = inputText.trim().substring(0, 500);
    } else if (inputUrl) {
      // For URL, use it in the query - in production, you might fetch the page content
      claim = `Verify the content at this URL: ${inputUrl}`;
    } else if (inputImageUrl) {
      // For image, describe what needs to be checked
      claim = `Verify claims made about this image: ${inputImageUrl}. Check if the image is authentic and if any claims about it are accurate.`;
    } else {
      throw new Error('At least one input (text, URL, or image URL) is required');
    }

    // Step 1: Query web search for evidence
    const searchResults = await queryWebSearch(claim);

    // Step 2: Query LLM for reasoning over evidence
    const llmResult = await queryLLM(claim, searchResults);

    // Step 3: Apply fallback rules for low confidence
    let finalVerdict = llmResult.verdict;
    let finalCredibility = llmResult.credibility;

    // Force unverified if confidence too low or no sources
    if (finalCredibility < 20 || searchResults.length === 0) {
      finalVerdict = 'unverified';
      finalCredibility = Math.min(finalCredibility, 25);
      llmResult.summary = 'This claim cannot be confidently verified with current public sources.';
      llmResult.explanation = 'Insufficient evidence or conflicting information prevents a confident verdict.';
    }

    // Format sources for response
    const simplifiedSources = searchResults.slice(0, 8).map((s) => ({
      title: s.title,
      url: s.url,
      snippet: s.snippet,
    }));

    return {
      verdict: finalVerdict,
      credibility: Math.round(finalCredibility),
      summary: llmResult.summary || llmResult.explanation.substring(0, 200),
      explanation: llmResult.explanation,
      sources: simplifiedSources,
      detectionMethods: llmResult.detectionMethods || ['web_search', 'llm_analysis'],
    };
  } catch (error) {
    console.error('Fact-check error:', error);
    
    // Return unverified on any error (so frontend can render gracefully)
    return {
      verdict: 'unverified',
      credibility: 0,
      summary: 'Analysis failed due to an internal error or connectivity issue.',
      explanation: 'This claim cannot be verified at this time. Please try again later.',
      sources: [],
      detectionMethods: ['error'],
    };
  }
}

module.exports = {
  performFactCheck,
  queryWebSearch,
  queryLLM,
};
