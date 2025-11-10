/**
 * Netlify Serverless Function - Video Embed Generator
 * Creates embeddable video players for user-uploaded content
 */
import type { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      videoUrl,        // User's video URL (YouTube, Vimeo, or direct file)
      style = 'modern', // modern, minimal, cinema, retro
      autoplay = false,
      controls = true,
      loop = false,
      thumbnail = null // Custom thumbnail URL
    } = body;

    if (!videoUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Video URL is required' }),
      };
    }

    // Detect video platform
    const platform = detectPlatform(videoUrl);
    
    // Generate embed code
    const embedCode = generateEmbedCode(videoUrl, platform, {
      style,
      autoplay,
      controls,
      loop,
      thumbnail,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        embed: {
          html: embedCode.html,
          css: embedCode.css,
          js: embedCode.js,
          platform,
          responsive: true,
        },
        preview: embedCode.html,
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('twitch.tv')) return 'twitch';
  if (url.match(/\.(mp4|webm|ogg)$/i)) return 'direct';
  return 'unknown';
}

function generateEmbedCode(
  url: string, 
  platform: string, 
  options: any
): { html: string; css: string; js: string } {
  
  const styles: Record<string, string> = {
    modern: `
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 4px;
    `,
    minimal: `
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    `,
    cinema: `
      border-radius: 0;
      box-shadow: 0 0 0 8px #000, 0 0 60px rgba(0,0,0,0.9);
      overflow: hidden;
    `,
    retro: `
      border: 4px solid #ff00ff;
      box-shadow: 8px 8px 0 #00ffff;
      overflow: hidden;
    `,
  };

  let embedHtml = '';
  
  if (platform === 'youtube') {
    const videoId = extractYouTubeId(url);
    embedHtml = `
      <div class="video-container" style="${styles[options.style]}">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=${options.autoplay ? 1 : 0}&controls=${options.controls ? 1 : 0}&loop=${options.loop ? 1 : 0}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          style="width: 100%; aspect-ratio: 16/9; border: none;"
        ></iframe>
      </div>
    `;
  } else if (platform === 'vimeo') {
    const videoId = url.split('/').pop();
    embedHtml = `
      <div class="video-container" style="${styles[options.style]}">
        <iframe 
          src="https://player.vimeo.com/video/${videoId}?autoplay=${options.autoplay ? 1 : 0}&loop=${options.loop ? 1 : 0}"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          style="width: 100%; aspect-ratio: 16/9; border: none;"
        ></iframe>
      </div>
    `;
  } else if (platform === 'direct') {
    embedHtml = `
      <div class="video-container" style="${styles[options.style]}">
        <video 
          ${options.controls ? 'controls' : ''}
          ${options.autoplay ? 'autoplay muted' : ''}
          ${options.loop ? 'loop' : ''}
          ${options.thumbnail ? `poster="${options.thumbnail}"` : ''}
          style="width: 100%; aspect-ratio: 16/9; display: block;"
        >
          <source src="${url}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  }

  const css = `
    .video-container {
      position: relative;
      max-width: 100%;
      margin: 2rem auto;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .video-container:hover {
      transform: translateY(-4px);
      box-shadow: 0 30px 80px rgba(0,0,0,0.4) !important;
    }
    @media (max-width: 768px) {
      .video-container {
        margin: 1rem 0;
      }
    }
  `;

  const js = `
    // Auto-pause other videos when one plays
    document.querySelectorAll('video').forEach(video => {
      video.addEventListener('play', () => {
        document.querySelectorAll('video').forEach(other => {
          if (other !== video) other.pause();
        });
      });
    });
  `;

  return { html: embedHtml, css, js };
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : '';
}

export { handler };
