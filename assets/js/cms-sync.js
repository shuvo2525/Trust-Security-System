/**
 * Trust Security System - Universal Multi-Platform CMS Synchronizer
 * Compatible with cPanel, InfinityFree, Vercel, Netlify, Cloudflare, GitHub Pages, Local Server & Offline Disk
 */
(function () {
  "use strict";

  function deepMerge(target, source) {
    if (!source) return target;
    var output = Object.assign({}, target);
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
    }
    return output;
  }

  function getSiteDataAsync(callback) {
    var baseData = window.DEFAULT_SITE_DATA || {};
    var localData = null;
    try {
      var raw = localStorage.getItem("trust_security_site_data");
      if (raw) localData = JSON.parse(raw);
    } catch (e) {}

    // Check if Cloud DB (Supabase / REST) is configured
    var cloudConfig = null;
    try {
      var cloudRaw = localStorage.getItem("trust_cloud_db_config");
      if (cloudRaw) cloudConfig = JSON.parse(cloudRaw);
    } catch (e) {}

    if (cloudConfig && cloudConfig.url && cloudConfig.key) {
      fetch(cloudConfig.url + "/rest/v1/trust_site_data?key_name=eq.site_main_data&select=data_content", {
        headers: {
          "apikey": cloudConfig.key,
          "Authorization": "Bearer " + cloudConfig.key
        },
        cache: "no-store"
      })
      .then(function (res) { if (res.ok) return res.json(); throw new Error(); })
      .then(function (rows) {
        if (rows && rows.length > 0 && rows[0].data_content) {
          var cloudData = JSON.parse(rows[0].data_content);
          var merged = deepMerge(baseData, cloudData);
          if (localData) merged = deepMerge(merged, localData);
          callback(merged);
          return;
        }
        throw new Error();
      })
      .catch(function () {
        fetchFromServerOrLocal(baseData, localData, callback);
      });
      return;
    }

    fetchFromServerOrLocal(baseData, localData, callback);
  }

  function fetchFromServerOrLocal(baseData, localData, callback) {
    if (window.location.protocol.startsWith("http")) {
      // 1. Try PHP API (cPanel, InfinityFree, Shared Hosting)
      var phpUrl = window.location.pathname.includes("/api/") ? "get.php" : "api/get.php";
      fetch(phpUrl + "?t=" + Date.now(), { cache: "no-store" })
        .then(function (res) {
          if (res.ok) return res.json();
          throw new Error("PHP API not found");
        })
        .then(function (serverData) {
          var merged = deepMerge(baseData, serverData);
          if (localData) merged = deepMerge(merged, localData);
          callback(merged);
        })
        .catch(function () {
          // 2. Try JSON file / Node / Vercel API
          var jsonUrl = window.location.pathname.includes("/api/") ? "../data/site-data.json" : "data/site-data.json?t=" + Date.now();
          fetch(jsonUrl, { cache: "no-store" })
            .then(function (res) {
              if (res.ok) return res.json();
              throw new Error("JSON not found");
            })
            .then(function (jsonData) {
              var merged = deepMerge(baseData, jsonData);
              if (localData) merged = deepMerge(merged, localData);
              callback(merged);
            })
            .catch(function () {
              var fallback = localData ? deepMerge(baseData, localData) : baseData;
              callback(fallback);
            });
        });
    } else {
      // file:/// mode
      var fallback = localData ? deepMerge(baseData, localData) : baseData;
      callback(fallback);
    }
  }

  // 1. Comprehensive Dynamic Theme Colors
  function applyThemeColors(data) {
    if (!data || !data.themeColors) return;
    var c = data.themeColors;
    var primary = c.primary || "#0ea5e9";
    var primaryDark = c.primaryDark || "#0284c7";
    var primaryLight = c.primaryLight || "#38bdf8";

    var styleEl = document.getElementById("dynamic-cms-theme-css");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-cms-theme-css";
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      :root {
        --theme-primary: ${primary} !important;
        --theme-primary-dark: ${primaryDark} !important;
        --theme-primary-light: ${primaryLight} !important;
        --theme-blue: ${primary} !important;
        --theme-blue-dark: ${primaryDark} !important;
        --theme-blue-light: ${primaryLight} !important;
      }

      /* 1. All Buttons & CTA */
      .header-btn1, .header-btn2, .header-btn3, .header-elements .header-btn1,
      .modern-submit-btn, .cta-author-area button, .branch-cta-btn,
      .service-boxarea .readmore, .btn-primary {
        background: linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%) !important;
        border-color: ${primary} !important;
        color: #ffffff !important;
        box-shadow: 0 4px 18px rgba(14, 165, 233, 0.35) !important;
      }

      .header-btn1:hover, .header-btn2:hover, .header-btn3:hover,
      .header-elements .header-btn1:hover, .modern-submit-btn:hover,
      .cta-author-area button:hover, .branch-cta-btn:hover {
        background: linear-gradient(135deg, ${primaryDark} 0%, #0369a1 100%) !important;
        color: #ffffff !important;
      }

      /* 2. Menu Hover & Underline Indicators */
      .main-menu ul li a {
        color: #000000 !important;
      }
      .main-menu ul li a:hover,
      .main-menu ul li:hover > a,
      .main-menu ul li a:active,
      .main-menu ul li a:focus,
      .top-header-bar a:hover,
      .footer1-section-area a:hover,
      .footer-contact-row a,
      .branch-info-item a:hover {
        color: ${primary} !important;
      }

      .main-menu ul li a::after {
        background: linear-gradient(90deg, ${primary}, ${primaryLight}) !important;
      }

      /* 3. Badges, Pills & Tags */
      .top-header-bar .branch-badge,
      .bdcom-badge,
      .branch-badge-pill,
      .about1-section-area h5,
      .service1-section-area h5,
      .team1-section-area h5,
      .blog1-section-area h5,
      .counter-section-area h5 {
        background: ${primary}18 !important;
        color: ${primaryDark} !important;
        border-color: ${primary}40 !important;
      }

      .bdcom-badge, .branch-badge-pill, .hero-main-area h5 {
        background: linear-gradient(135deg, ${primary}, ${primaryDark}) !important;
        color: #ffffff !important;
      }

      .hero-main-area .hero-subtitle {
        color: #ffffff !important;
      }

      /* 4. Counters, Numbers & Icons */
      .others-area .counter,
      .counter-boxarea .counter,
      .counter-box h2,
      .counter-box h2 span,
      .sector-icon,
      .service-boxarea .icons i,
      .branch-info-item i,
      .footer-contact-row i,
      .modern-form-group .form-icon,
      .bdcom-card .feature-list li i,
      .top-header-bar .contact-item i {
        color: ${primary} !important;
      }

      .sector-card:hover {
        background: linear-gradient(135deg, ${primary}, ${primaryLight}) !important;
        border-color: transparent !important;
      }

      .sector-card:hover .sector-icon {
        color: ${primary} !important;
        background: #ffffff !important;
      }

      .service-boxarea:hover .icons {
        background: ${primary} !important;
      }

      .service-boxarea:hover .icons i {
        color: #ffffff !important;
      }

      /* 5. Borders & Highlights */
      .bdcom-card:hover, .branch-card:hover, .modern-contact-card {
        border-color: ${primaryLight} !important;
      }

      .modern-form-input:focus {
        border-color: ${primary} !important;
        box-shadow: 0 0 0 4px ${primary}25 !important;
      }

      .others-area h4 {
        color: ${primary} !important;
      }
    `;
  }

  function setTextSafe(el, text) {
    if (!el || text === undefined || text === null) return;
    el.innerHTML = text;
  }

  // 2. Flash SMS / Picture Popup
  function setupFlashPopup(data) {
    var existingModal = document.getElementById("cmsFlashPopupModal");
    if (existingModal) existingModal.remove();

    if (!data || !data.flashPopup || data.flashPopup.enabled === false || data.flashPopup.enabled === "false" || data.flashPopup.enabled === 0) {
      return;
    }

    if (window.location.pathname.includes("admin.html")) return;

    var fp = data.flashPopup;
    var modalHtml = `
      <div class="modal fade" id="cmsFlashPopupModal" tabindex="-1" aria-hidden="true" style="z-index: 99999;">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content" style="border-radius: 20px; overflow: hidden; border: none; box-shadow: 0 25px 60px rgba(0,0,0,0.4);">
            <div style="position: absolute; top: 14px; right: 16px; z-index: 10;">
              <button type="button" class="btn-close bg-white p-2 rounded-circle shadow-sm" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="row g-0 align-items-center">
              ${fp.image ? `
              <div class="col-md-5 text-center p-3" style="background: #f8fafc;">
                <img src="${fp.image}" alt="Flash Announcement" class="img-fluid rounded-4 shadow-sm" style="max-height: 280px; object-fit: cover;">
              </div>` : ''}
              <div class="${fp.image ? 'col-md-7' : 'col-12'} p-4 p-md-5">
                <span class="badge bg-primary px-3 py-2 mb-2"><i class="fa-solid fa-bullhorn me-1"></i> SPECIAL ANNOUNCEMENT</span>
                <h3 class="fw-bold text-dark mb-3">${fp.title || 'Special Announcement'}</h3>
                <p class="text-muted mb-4">${fp.message || ''}</p>
                <div class="d-flex gap-2">
                  <a href="${fp.btnLink || 'contact.html'}" class="header-btn2 py-2 px-4 text-decoration-none">${fp.btnText || 'Learn More'}</a>
                  <button type="button" class="btn btn-outline-secondary py-2 px-3" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    setTimeout(function () {
      try {
        var modalEl = document.getElementById("cmsFlashPopupModal");
        if (modalEl && typeof bootstrap !== "undefined") {
          var bsModal = new bootstrap.Modal(modalEl);
          bsModal.show();
        }
      } catch (e) {}
    }, 1200);
  }

  // 3. Branding
  function syncBranding(data) {
    if (!data || !data.branding) return;
    var b = data.branding;

    // Logos
    if (b.logoUrl) {
      document.querySelectorAll(".site-logo img, .mobile-logo img, .logos img, .footer-logo-box img").forEach(function (img) {
        img.src = b.logoUrl;
      });
    }

    // Favicon
    if (b.faviconUrl) {
      var fav = document.querySelector('link[rel="shortcut icon"]');
      if (fav) fav.href = b.faviconUrl;
    }

    // Hotlines
    if (b.hotline) {
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        if (!a.closest(".branch-card")) {
          a.textContent = a.textContent.includes("Hotline") ? "Hotline: " + b.hotline : b.hotline;
          a.href = "tel:" + (b.hotlineTel || b.hotline.replace(/[^0-9+]/g, ""));
        }
      });
    }

    // Social Links
    if (b.socialLinks) {
      document.querySelectorAll('.footer1-section-area a[title="Facebook"]').forEach(function (a) { a.href = b.socialLinks.facebook || "#"; });
      document.querySelectorAll('.footer1-section-area a[title="WhatsApp"]').forEach(function (a) { a.href = b.socialLinks.whatsapp || "#"; });
      document.querySelectorAll('.footer1-section-area a[title="YouTube"]').forEach(function (a) { a.href = b.socialLinks.youtube || "#"; });
      document.querySelectorAll('.footer1-section-area a[title="LinkedIn"]').forEach(function (a) { a.href = b.socialLinks.linkedin || "#"; });
    }

    // Copyright
    if (b.copyright) {
      var copyEl = document.querySelector(".copyright p");
      if (copyEl) copyEl.innerHTML = b.copyright;
    }

    // Branch Addresses
    if (b.dhakaBranch && b.dhakaBranch.address) {
      document.querySelectorAll(".top-contacts .contact-item").forEach(function (item) {
        if (item.textContent.includes("Dhaka Branch")) {
          item.innerHTML = '<span class="branch-badge">Dhaka Branch</span> <i class="fa-solid fa-location-dot"></i> ' + b.dhakaBranch.address;
        }
      });
    }
    if (b.rajshahiBranch && b.rajshahiBranch.address) {
      document.querySelectorAll(".top-contacts .contact-item").forEach(function (item) {
        if (item.textContent.includes("Rajshahi Branch")) {
          item.innerHTML = '<span class="branch-badge">Rajshahi Branch</span> <i class="fa-solid fa-location-dot"></i> ' + b.rajshahiBranch.address;
        }
      });
    }
  }

  // 4. Homepage
  function syncHomePage(data) {
    if (!data || !data.home) return;
    var h = data.home;

    // Hero
    if (h.hero) {
      var heroTag = document.querySelector(".hero-main-area h5");
      if (heroTag && h.hero.tagline) heroTag.innerHTML = '<img src="assets/img/icons/finger1.svg" alt=""> ' + h.hero.tagline;

      var heroSub = document.querySelector(".hero-main-area .hero-subtitle");
      if (heroSub && h.hero.subtitle) heroSub.textContent = h.hero.subtitle;

      var heroTitle = document.querySelector(".hero-main-area h1");
      if (heroTitle && h.hero.title) setTextSafe(heroTitle, h.hero.title);

      var heroDesc = document.querySelector(".hero-main-area p");
      if (heroDesc && h.hero.description) heroDesc.textContent = h.hero.description;

      var heroRating = document.querySelector(".others-area .counter");
      if (heroRating && h.hero.rating) heroRating.textContent = h.hero.rating;

      var heroClientText = document.querySelector(".others-area p");
      if (heroClientText && h.hero.clientCountText) heroClientText.textContent = h.hero.clientCountText;

      var heroClientAvatar = document.querySelector(".others-area .img1 img");
      if (heroClientAvatar && h.hero.clientAvatarImg) heroClientAvatar.src = h.hero.clientAvatarImg;

      var heroImg = document.querySelector(".header-images .image img");
      if (heroImg && h.hero.heroImg) heroImg.src = h.hero.heroImg;
    }

    // About - "Safeguarding Your Peace of Mind"
    if (h.about) {
      var aboutBadge = document.querySelector(".about1-section-area h5");
      if (aboutBadge && h.about.badge) aboutBadge.innerHTML = '<img src="assets/img/icons/finger2.svg" alt=""> ' + h.about.badge;

      var aboutTitle = document.querySelector(".about1-section-area h2");
      if (aboutTitle && h.about.title) setTextSafe(aboutTitle, h.about.title);

      var aboutDesc = document.querySelector(".about1-section-area .about-content-area > p");
      if (aboutDesc && h.about.description) aboutDesc.textContent = h.about.description;

      var aboutImg = document.querySelector(".about1-section-area .about-images img");
      if (aboutImg && h.about.aboutImg) aboutImg.src = h.about.aboutImg;

      // Stats
      var counterAreas = document.querySelectorAll(".about1-section-area .counter-area");
      if (counterAreas[0] && h.about.stat1) {
        if (counterAreas[0].querySelector(".counter")) counterAreas[0].querySelector(".counter").textContent = (h.about.stat1.percent || "21").replace(/[^0-9]/g, "");
        if (counterAreas[0].querySelector(".pera p")) counterAreas[0].querySelector(".pera p").textContent = h.about.stat1.text;
      }
      if (counterAreas[1] && h.about.stat2) {
        if (counterAreas[1].querySelector(".counter")) counterAreas[1].querySelector(".counter").textContent = (h.about.stat2.percent || "30").replace(/[^0-9]/g, "");
        if (counterAreas[1].querySelector(".pera p")) counterAreas[1].querySelector(".pera p").textContent = h.about.stat2.text;
      }
      if (counterAreas[2] && h.about.stat3) {
        if (counterAreas[2].querySelector(".counter")) counterAreas[2].querySelector(".counter").textContent = (h.about.stat3.percent || "12").replace(/[^0-9]/g, "");
        if (counterAreas[2].querySelector(".pera p")) counterAreas[2].querySelector(".pera p").textContent = h.about.stat3.text;
      }
    }

    // Service Header
    if (h.serviceHeader) {
      var servH2 = document.querySelector(".service1-section-area .service-header h2");
      if (servH2 && h.serviceHeader.title) setTextSafe(servH2, h.serviceHeader.title);
      var servP = document.querySelector(".service1-section-area .service-header p");
      if (servP && h.serviceHeader.description) servP.textContent = h.serviceHeader.description;
    }

    // Video Section
    if (h.video) {
      var videoSec = document.querySelector(".video-section-area");
      if (videoSec) {
        if (h.video.videoCoverImg) {
          videoSec.style.backgroundImage = "url('" + h.video.videoCoverImg + "')";
        }
        var activeVideoUrl = (h.video.videoType === "local" && h.video.localVideoUrl) ? h.video.localVideoUrl : (h.video.youtubeUrl || "https://www.youtube.com/watch?v=Y8XpQpW5OVY");
        videoSec.querySelectorAll(".popup-youtube").forEach(function (btn) {
          btn.href = activeVideoUrl;
          if (btn.tagName === "A" && !btn.querySelector("img") && h.video.heading) {
            btn.textContent = h.video.heading;
          }
        });
      }
      if (h.video.brandTitle) {
        var brandHead = document.querySelector(".testimonial-header h4");
        if (brandHead) brandHead.textContent = h.video.brandTitle;
      }
    }

    // Team Members
    if (h.teamHeader) {
      var teamH2 = document.querySelector(".team1-section-area h2");
      if (teamH2 && h.teamHeader.title) setTextSafe(teamH2, h.teamHeader.title);
      var teamP = document.querySelector(".team1-section-area .team-header p");
      if (teamP && h.teamHeader.description) teamP.textContent = h.teamHeader.description;
    }
    if (data.team && data.team.length > 0) {
      var teamBoxes = document.querySelectorAll(".team1-section-area .team-boxarea");
      data.team.forEach(function (tm, idx) {
        if (teamBoxes[idx]) {
          var img = teamBoxes[idx].querySelector(".img1 img");
          if (img && tm.img) img.src = tm.img;
          var nameEl = teamBoxes[idx].querySelector(".content a");
          if (nameEl && tm.name) nameEl.textContent = tm.name;
          var roleEl = teamBoxes[idx].querySelector(".content p");
          if (roleEl && tm.role) roleEl.textContent = tm.role;
        }
      });
    }

    // Milestone Counters
    if (h.counters) {
      var counterBoxes = document.querySelectorAll(".counter-section-area .counter-boxarea");
      if (counterBoxes[0] && h.counters.stat1Number) {
        var span0 = counterBoxes[0].querySelector(".counter");
        if (span0) span0.textContent = h.counters.stat1Number;
        var p0 = counterBoxes[0].querySelector("p");
        if (p0 && h.counters.stat1Label) p0.textContent = h.counters.stat1Label;
      }
      if (counterBoxes[1] && h.counters.stat2Number) {
        var span1 = counterBoxes[1].querySelector(".counter");
        if (span1) span1.textContent = h.counters.stat2Number;
        var p1 = counterBoxes[1].querySelector("p");
        if (p1 && h.counters.stat2Label) p1.textContent = h.counters.stat2Label;
      }
      if (counterBoxes[2] && h.counters.stat3Number) {
        var span2 = counterBoxes[2].querySelector(".counter");
        if (span2) span2.textContent = h.counters.stat3Number;
        var p2 = counterBoxes[2].querySelector("p");
        if (p2 && h.counters.stat3Label) p2.textContent = h.counters.stat3Label;
      }
      if (counterBoxes[3] && h.counters.stat4Number) {
        var span3 = counterBoxes[3].querySelector(".counter");
        if (span3) span3.textContent = h.counters.stat4Number;
        var p3 = counterBoxes[3].querySelector("p");
        if (p3 && h.counters.stat4Label) p3.textContent = h.counters.stat4Label;
      }
    }

    // Blog Posts
    if (h.blogHeader) {
      var blogH2 = document.querySelector(".blog1-section-area h2");
      if (blogH2 && h.blogHeader.title) setTextSafe(blogH2, h.blogHeader.title);
      var blogP = document.querySelector(".blog1-section-area .blog-header p");
      if (blogP && h.blogHeader.description) blogP.textContent = h.blogHeader.description;
    }
    if (data.blogs && data.blogs.length > 0) {
      var blogBoxes = document.querySelectorAll(".blog-author-boxraea");
      data.blogs.forEach(function (blg, idx) {
        if (blogBoxes[idx]) {
          var aImg = blogBoxes[idx].querySelector(".othera-content .img1 img");
          if (aImg && blg.authorImg) aImg.src = blg.authorImg;
          var aName = blogBoxes[idx].querySelector(".othera-content .text a");
          if (aName && blg.author) aName.textContent = blg.author;
          var coverImg = blogBoxes[idx].querySelector(".blog-img img");
          if (coverImg && blg.coverImg) coverImg.src = blg.coverImg;
          var tag = blogBoxes[idx].querySelector(".blog-content .tags");
          if (tag && blg.date) tag.innerHTML = '<i class="fa-regular fa-calendar-days"></i> ' + blg.date;
          var titleEl = blogBoxes[idx].querySelector(".blog-content > a:nth-of-type(2)");
          if (titleEl && blg.title) titleEl.textContent = blg.title;
          var pEl = blogBoxes[idx].querySelector(".blog-content p");
          if (pEl && blg.desc) pEl.textContent = blg.desc;
        }
      });
    }

    // CTA
    if (h.cta) {
      var ctaH2 = document.querySelector(".cta-author-area h2");
      if (ctaH2 && h.cta.title) setTextSafe(ctaH2, h.cta.title);
      var ctaBtn = document.querySelector(".cta-author-area button");
      if (ctaBtn && h.cta.buttonText) ctaBtn.innerHTML = h.cta.buttonText + ' <i class="fa-solid fa-arrow-right"></i>';
      var ctaImg = document.querySelector(".cta-images .img1 img");
      if (ctaImg && h.cta.ctaImg) ctaImg.src = h.cta.ctaImg;
    }
  }

  // 5. Products Page Dynamic Synchronizer
  function syncProducts(data) {
    if (!data || !data.products || data.products.length === 0) return;
    var container = document.querySelector(".bdcom-section-area .row.g-4");
    if (!container) return;

    container.innerHTML = "";
    data.products.forEach(function (p) {
      var col = document.createElement("div");
      col.className = "col-lg-6";
      col.innerHTML = `
        <div class="bdcom-card p-4 h-100 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="card-tag"><i class="fa-solid fa-bolt me-1"></i> ${p.tag || 'Hardware'}</span>
            <span class="badge bg-success">In Stock</span>
          </div>
          <div class="row align-items-center flex-grow-1">
            <div class="col-md-5 text-center mb-3 mb-md-0">
              <img src="${p.img || 'assets/img/all-images/shop-img1.png'}" alt="${p.title}" class="img-fluid rounded" style="max-height: 140px; object-fit: contain;">
            </div>
            <div class="col-md-7">
              <h3 class="fw-bold mb-2">${p.title}</h3>
              <p class="product-desc mb-2 text-muted small">${p.desc || ''}</p>
              <ul class="feature-list small mb-3">
                ${(p.specs || []).map(function (s) { return '<li><i class="fa-solid fa-circle-check text-success me-1"></i> ' + s + '</li>'; }).join('')}
              </ul>
              <a href="contact.html" class="header-btn2 py-2 px-3 d-inline-block text-decoration-none">Inquire / Order</a>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }

  // 6. Services Dynamic Synchronizer
  function syncServices(data) {
    if (!data || !data.services || data.services.length === 0) return;
    var sBoxes = document.querySelectorAll(".service-boxs-area .service-boxarea, .service-boxes-grid .service-card");
    if (sBoxes.length > 0) {
      data.services.forEach(function (s, idx) {
        if (sBoxes[idx]) {
          var titleEl = sBoxes[idx].querySelector(".content a, h3");
          if (titleEl && s.title) titleEl.textContent = s.title;
          var pEl = sBoxes[idx].querySelector(".content p, p");
          if (pEl && s.desc) pEl.textContent = s.desc;
          var iconImg = sBoxes[idx].querySelector(".icons img, .service-icon img");
          if (iconImg && s.icon) iconImg.src = s.icon;
        }
      });
    }
  }

  // 7. Quotations Catcher
  function setupInquiryCatcher() {
    var form = document.querySelector(".modern-contact-card form");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var inquiry = {
          id: "INQ-" + Date.now(),
          date: new Date().toLocaleString(),
          name: (form.querySelector('input[placeholder*="John Doe"]') || {}).value || "Anonymous",
          phone: (form.querySelector('input[type="tel"]') || {}).value || "N/A",
          branch: (form.querySelector("select") || {}).value || "General",
          service: (form.querySelectorAll("select")[1] || {}).value || "General Inquiry",
          message: (form.querySelector("textarea") || {}).value || "",
          status: "New"
        };

        // 1. Submit to PHP / Server API if online
        if (window.location.protocol.startsWith("http")) {
          var inqUrl = window.location.pathname.includes("/api/") ? "inbox.php" : "api/inbox.php";
          fetch(inqUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inquiry)
          }).catch(function () {
            // Try vercel API
            fetch("/api/inbox", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(inquiry)
            }).catch(function () {});
          });
        }

        // 2. Save locally as fallback
        try {
          var inboxes = JSON.parse(localStorage.getItem("trust_security_inbox") || "[]");
          inboxes.unshift(inquiry);
          localStorage.setItem("trust_security_inbox", JSON.stringify(inboxes));
        } catch (err) {}

        alert("Thank you! Your quotation request has been submitted successfully.\nOur engineering team will connect with you shortly.\nHotline: 01911-660036");
        form.reset();
      };
    }
  }

  function runAllSync() {
    getSiteDataAsync(function (data) {
      applyThemeColors(data);
      syncBranding(data);
      syncHomePage(data);
      syncProducts(data);
      syncServices(data);
      setupFlashPopup(data);
      setupInquiryCatcher();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAllSync);
  } else {
    runAllSync();
  }

  window.addEventListener("storage", function (e) {
    if (e.key === "trust_security_site_data") {
      runAllSync();
    }
  });

})();
