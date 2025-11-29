/**
 * P.S-FULL.AI DOWNLOAD WIDGET
 * 
 * Embeddable widget for ANY website to offer P.S-Full.AI downloads
 * Just add: <script src="https://pssi.netlify.app/ps-ai-widget.js"></script>
 */

(function() {
  'use strict';
  
  const PSFullAI = {
    version: '1.0.0',
    baseURL: 'https://pssi.netlify.app',
    
    /**
     * Initialize the widget
     */
    init: function(options = {}) {
      const config = {
        container: options.container || '#ps-full-ai-widget',
        theme: options.theme || 'dark',
        showDownload: options.showDownload !== false,
        showDemo: options.showDemo !== false,
        showPricing: options.showPricing || false,
        position: options.position || 'inline', // 'inline' or 'floating'
        ...options
      };
      
      const container = document.querySelector(config.container);
      if (!container) {
        console.error('PSFullAI: Container not found:', config.container);
        return;
      }
      
      // Create widget HTML
      const widgetHTML = this.createWidget(config);
      container.innerHTML = widgetHTML;
      
      // Add event listeners
      this.attachEventListeners(container, config);
      
      // Add styles
      this.injectStyles(config);
      
      console.log('✅ P.S-Full.AI Widget initialized');
    },
    
    /**
     * Create widget HTML
     */
    createWidget: function(config) {
      const isDark = config.theme === 'dark';
      const bgColor = isDark ? '#1a1a2e' : '#ffffff';
      const textColor = isDark ? '#ffffff' : '#333333';
      const accentColor = '#667eea';
      
      return `
        <div class="ps-ai-widget" data-theme="${config.theme}" style="
          background: ${bgColor};
          color: ${textColor};
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 600px;
          margin: 20px auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="
              margin: 0 0 10px 0;
              font-size: 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">
              👑 P.S-Full.AI God Mode
            </h2>
            <p style="margin: 0; opacity: 0.8; font-size: 16px;">
              The Ultimate AI System - Combines OpenAI, Anthropic & Google
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
              <div style="text-align: center; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                <div style="font-size: 24px;">🧠</div>
                <div style="font-size: 12px; opacity: 0.8;">39+ Functions</div>
              </div>
              <div style="text-align: center; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                <div style="font-size: 24px;">💙</div>
                <div style="font-size: 12px; opacity: 0.8;">Emotional AI</div>
              </div>
              <div style="text-align: center; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                <div style="font-size: 24px;">🔌</div>
                <div style="font-size: 12px; opacity: 0.8;">Works Offline</div>
              </div>
              <div style="text-align: center; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                <div style="font-size: 24px;">🧬</div>
                <div style="font-size: 12px; opacity: 0.8;">Self-Evolving</div>
              </div>
            </div>
            
            ${config.showDownload ? `
              <button class="ps-ai-download-btn" style="
                width: 100%;
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                margin-bottom: 10px;
              ">
                🚀 Download God Mode Now
              </button>
            ` : ''}
            
            ${config.showDemo ? `
              <button class="ps-ai-demo-btn" style="
                width: 100%;
                padding: 12px 30px;
                background: transparent;
                color: ${accentColor};
                border: 2px solid ${accentColor};
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 10px;
              ">
                ✨ Try Live Demo
              </button>
            ` : ''}
            
            ${config.showPricing ? `
              <button class="ps-ai-pricing-btn" style="
                width: 100%;
                padding: 12px 30px;
                background: transparent;
                color: ${textColor};
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
              ">
                💳 View Pricing
              </button>
            ` : ''}
          </div>
          
          <div style="text-align: center; font-size: 12px; opacity: 0.6;">
            ⭐ Trusted by thousands • ⚡ Instant Setup • 🔒 Secure & Private
          </div>
        </div>
      `;
    },
    
    /**
     * Attach event listeners
     */
    attachEventListeners: function(container, config) {
      // Download button
      const downloadBtn = container.querySelector('.ps-ai-download-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          this.trackEvent('download_click');
          window.open(`${this.baseURL}/ai-demo.html`, '_blank');
        });
        
        downloadBtn.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
        });
        
        downloadBtn.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
        });
      }
      
      // Demo button
      const demoBtn = container.querySelector('.ps-ai-demo-btn');
      if (demoBtn) {
        demoBtn.addEventListener('click', () => {
          this.trackEvent('demo_click');
          this.openDemo();
        });
        
        demoBtn.addEventListener('mouseenter', function() {
          this.style.background = 'rgba(102, 126, 234, 0.1)';
        });
        
        demoBtn.addEventListener('mouseleave', function() {
          this.style.background = 'transparent';
        });
      }
      
      // Pricing button
      const pricingBtn = container.querySelector('.ps-ai-pricing-btn');
      if (pricingBtn) {
        pricingBtn.addEventListener('click', () => {
          this.trackEvent('pricing_click');
          this.showPricing();
        });
      }
    },
    
    /**
     * Inject styles
     */
    injectStyles: function(config) {
      if (document.getElementById('ps-ai-widget-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'ps-ai-widget-styles';
      style.textContent = `
        .ps-ai-widget * {
          box-sizing: border-box;
        }
        
        @keyframes ps-ai-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ps-ai-widget {
          animation: ps-ai-fade-in 0.5s ease-out;
        }
      `;
      
      document.head.appendChild(style);
    },
    
    /**
     * Open demo in modal
     */
    openDemo: function() {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      `;
      
      modal.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 1200px; height: 90vh; background: white; border-radius: 16px; overflow: hidden;">
          <button style="
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 10;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          " onclick="this.closest('[style*=fixed]').remove()">×</button>
          <iframe src="${this.baseURL}/ai-demo.html" style="width: 100%; height: 100%; border: none;"></iframe>
        </div>
      `;
      
      document.body.appendChild(modal);
    },
    
    /**
     * Show pricing modal
     */
    showPricing: function() {
      alert('Pricing:\n\n' +
        'Free: Basic features\n' +
        'Pro: $19.99/month - All features\n' +
        'Family: $9.99/user (up to 10) - 50% off!\n' +
        'Enterprise: Custom pricing\n\n' +
        'Visit ' + this.baseURL + '/ai-demo.html for more info!');
    },
    
    /**
     * Track events (integrate with your analytics)
     */
    trackEvent: function(eventName) {
      console.log('📊 Event:', eventName);
      
      // Google Analytics
      if (window.gtag) {
        gtag('event', eventName, {
          event_category: 'PS-Full-AI Widget',
          event_label: window.location.href
        });
      }
      
      // Facebook Pixel
      if (window.fbq) {
        fbq('trackCustom', eventName);
      }
    },
    
    /**
     * Create floating widget
     */
    createFloatingWidget: function() {
      const widget = document.createElement('div');
      widget.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999998;
        cursor: pointer;
      `;
      
      widget.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 25px;
          border-radius: 50px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          font-weight: 600;
          transition: transform 0.2s;
        ">
          👑 Get God AI
        </div>
      `;
      
      widget.addEventListener('click', () => {
        window.open(`${this.baseURL}/ai-demo.html`, '_blank');
      });
      
      widget.addEventListener('mouseenter', function() {
        this.querySelector('div').style.transform = 'scale(1.05)';
      });
      
      widget.addEventListener('mouseleave', function() {
        this.querySelector('div').style.transform = 'scale(1)';
      });
      
      document.body.appendChild(widget);
    }
  };
  
  // Make globally available
  window.PSFullAI = PSFullAI;
  
  // Auto-init if container exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.querySelector('#ps-full-ai-widget')) {
        PSFullAI.init();
      }
    });
  } else if (document.querySelector('#ps-full-ai-widget')) {
    PSFullAI.init();
  }
  
  console.log('✅ P.S-Full.AI Widget loaded - Use PSFullAI.init() to activate');
})();
