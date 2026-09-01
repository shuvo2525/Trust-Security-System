;(function($){
"use strict";

$(document).ready(function(){

  //========== HEADER ACTIVE ============= //
  if ($("#header").length > 0) {
    $(window).on("scroll", function () {
      var scroll = $(window).scrollTop();
      if (scroll < 1) {
        $(".header-area").removeClass("sticky");
      } else {
        $(".header-area").addClass("sticky");
      }
    });
  }

  //========== MOBILE SIDEBAR ============= //
  $(".dots-menu, .mobile-nav-icon").on("click", function () {
    $(".mobile-sidebar").addClass("mobile-menu-active");
  });
  $(".menu-close").on("click", function () {
    $(".mobile-sidebar").removeClass("mobile-menu-active");
  });

  //========== PAGE PROGRESS ============= //
  var progressPath = document.querySelector(".progress-wrap path");
  if (progressPath) {
    var pathLength = progressPath.getTotalLength();
    progressPath.style.transition = progressPath.style.WebkitTransition = "none";
    progressPath.style.strokeDasharray = pathLength + " " + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition = "stroke-dashoffset 10ms linear";
    
    var updateProgress = function () {
      var scroll = $(window).scrollTop();
      var height = $(document).height() - $(window).height();
      if (height > 0) {
        var progress = pathLength - (scroll * pathLength) / height;
        progressPath.style.strokeDashoffset = progress;
      }
    };
    updateProgress();
    $(window).scroll(updateProgress);
    
    var offset = 50;
    var duration = 550;
    $(window).on("scroll", function () {
      if ($(this).scrollTop() > offset) {
        $(".progress-wrap").addClass("active-progress");
      } else {
        $(".progress-wrap").removeClass("active-progress");
      }
    });
    $(".progress-wrap").on("click", function (event) {
      event.preventDefault();
      $("html, body").animate({ scrollTop: 0 }, duration);
      return false;
    });
  }

  //========== VIDEO POPUP ============= //
  if (typeof $.fn.magnificPopup !== 'undefined' && $(".popup-youtube").length > 0) {
    $(".popup-youtube").magnificPopup({
      type: "iframe",
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false
    });
  }

  //========== NICE SELECT ============= //
  if (typeof $.fn.niceSelect !== 'undefined' && $('select').length > 0) {
    $('select').niceSelect();
  }

  //========== AOS ANIMATION ============= //
  if (typeof AOS !== 'undefined') {
    AOS.init({
      disable: 'mobile',
      duration: 800,
      once: true
    });
  }

  //========== COUNTER UP ============= //
  if (typeof $.fn.countUp !== 'undefined' && $('.counter').length > 0) {
    $('.counter').countUp({
      time: 1500,
      delay: 10
    });
  }

  //========== OWL CAROUSELS ============= //
  if (typeof $.fn.owlCarousel !== 'undefined') {
    // Project Carousel
    if ($('.project-slider-area').length > 0) {
      $('.project-slider-area').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        dots: true,
        items: 3,
        autoplay: true,
        smartSpeed: 1500,
        autoplayTimeout: 3500,
        responsiveClass: true,
        responsive: {
          0: { items: 1 },
          600: { items: 2 },
          1000: { items: 3 }
        }
      });
    }

    // Brand Partners Carousel
    if ($('.testimonial-slider').length > 0) {
      $('.testimonial-slider').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        dots: false,
        items: 5,
        autoplay: true,
        smartSpeed: 1500,
        autoplayTimeout: 2500,
        responsiveClass: true,
        responsive: {
          0: { items: 2 },
          600: { items: 4 },
          1000: { items: 5 }
        }
      });
    }
  }

});

//========== PRELOADER & GSAP ============= //
$(window).on("load", function () {
  setTimeout(function () {
    $(".preloader").fadeOut(300);
  }, 200);

  // GSAP Animations
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Reveal images
    if ($('.reveal').length > 0) {
      document.querySelectorAll(".reveal").forEach(function(container) {
        var image = container.querySelector("img");
        if (image) {
          var tl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              toggleActions: "play none none none"
            }
          });
          tl.set(container, { autoAlpha: 1 });
          tl.from(container, 1.2, { xPercent: -100, ease: Power2.out });
          tl.from(image, 1.2, { xPercent: 100, scale: 1.2, delay: -1.2, ease: Power2.out });
        }
      });
    }

    // Text animations with fallback if SplitText is present
    if (typeof SplitText !== 'undefined') {
      if ($('.text-anime-style-3').length > 0) {
        document.querySelectorAll('.text-anime-style-3').forEach(function(element) {
          try {
            var split = new SplitText(element, { type: "lines,words,chars", linesClass: "split-line" });
            gsap.set(element, { perspective: 400 });
            gsap.set(split.chars, { opacity: 0, x: "30" });
            gsap.to(split.chars, {
              scrollTrigger: { trigger: element, start: "top 90%" },
              x: "0",
              opacity: 1,
              duration: 0.8,
              ease: Back.easeOut,
              stagger: 0.02
            });
          } catch(e) {
            // fallback gracefully
            $(element).css("opacity", 1);
          }
        });
      }
    }
  }
});

})(jQuery);
