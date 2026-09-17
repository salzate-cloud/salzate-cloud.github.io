(function(){
  "use strict";

  var dictEn = {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.courses": "Courses",
    "nav.research": "Research",
    "nav.sp": "Solving Problems",
    "nav.blog": "Blog",
    "nav.cv": "CV",
    "nav.contact": "Contact",

    "home.eyebrow": "Mathematician · Mathematics Professor",
    "home.affil1": "Institute of Mathematics, Universidad de Antioquia",
    "home.affil2": "Institución Universitaria de Envigado",
    "home.quote": "“The essence of mathematics lies in its freedom.”",
    "about.loc.label": "Location",
    "about.email.label": "Email",
    "about.email2.label": "Alternate email",
    "about.langs.label": "Languages",
    "about.langs.value": "Spanish (native), English (advanced)",
    "home.research.h2": "Research interest",
    "home.research.p": "I work in analysis, algebra, and topology, and I keep a standing habit of solving problems posed in high-impact journals — several of which have led to published notes and articles. Between research and the classroom, I'm especially interested in how the two feed each other.",

    "about.eyebrow": "About me",
    "about.h2": "Mathematician and professor",
    "about.bio1": "I'm a Colombian mathematician. I trained at Universidad de Antioquia and later at Binghamton University (New York), where I spent two years chasing the Peter–Weyl theorem and what it has to say about the hidden structure of compact groups. Since 2023 I've split my time between the classroom and solving problems — some of which have found their way into journals like <i>Fibonacci Quarterly</i>, <i>The College Mathematics Journal</i>, and <i>American Mathematical Monthly</i>.",
    "about.bio2": "Today I teach calculus, analysis, geometry, and algebra at Universidad de Antioquia and at Institución Universitaria de Envigado. This page is, in a way, my notebook held open: my courses, my class notes just as I bring them to the board, and a few loose thoughts on the mathematics I teach and research.",
    "about.areas.h3": "Areas of interest and research",
    "about.analysis.term": "Analysis",
    "about.analysis.desc": "Real and complex analysis, integration theory, fractional analysis.",
    "about.analysis.cap": "continuity, in the usual language",
    "about.functional.term": "Functional analysis",
    "about.functional.desc": "Spectral theory and operator theory.",
    "about.hahnbanach.cap": "the Hahn–Banach theorem: every f ∈ Y<sup>*</sup> extends to X without increasing its norm",
    "about.topology.term": "Algebra and topology",
    "about.topology.desc": "Category theory, functorial analysis, and non-associative algebra.",
    "about.pi1.cap": "the fundamental group of a circle",
    "about.edu.h3": "Education",
    "about.edu1.what": "Master's (M.A.) in Mathematics",
    "about.edu1.where": "Binghamton University, New York, USA",
    "about.edu1.desc": "Thesis: <i>The Peter–Weyl Theorem and Its Applications</i>.",
    "about.pw1.cap": "the Peter–Weyl decomposition for a compact group G",
    "about.edu2.what": "Undergraduate degree in Mathematics",
    "about.awards.h3": "Awards and scholarships",
    "about.award1.desc": "Distinction awarded to outstanding mathematics students during the academic year.",
    "about.award2.desc": "For undergraduate research work, supported by professors Rigoberto Flórez, Fernando Guzmán, and Leandro Junes.",
    "about.award3.desc": "For outstanding academic and research performance.",
    "about.award4.what": "Scholarships for outstanding academic performance",
    "about.award4.desc": "Awarded in four semesters for achieving the highest average.",
    "about.tools.h3": "Tools",
    "about.chip1": "LaTeX — advanced",
    "about.chip2": "Wolfram Mathematica — intermediate",
    "about.chip3": "Python — basic",
    "about.chip4": "MATLAB — basic",

    "courses.eyebrow": "Teaching",
    "courses.h2": "Courses and class notes",
    "courses.intro": "The courses I teach now and the ones I've taught recently — with the actual class notes from each, just as I use them at the board, not a version polished after the fact.",
    "courses.iue.badge": "2026 — present · Instructor",
    "courses.calc1": "Calculus I · Code 911",
    "courses.discrete1": "Discrete Mathematics · Code 920",
    "courses.discrete2": "Discrete Mathematics · Code 922",
    "courses.discrete3": "Discrete Mathematics · Code 923",
    "courses.logic": "Logical Reasoning · Code 806",
    "courses.notes1": "Notes coming soon",
    "courses.notes2": "Notes coming soon",
    "courses.notes3": "Notes coming soon",
    "courses.notes4": "Notes coming soon",
    "courses.notes5": "Notes coming soon",
    "courses.udea.badge": "2023 — present · Adjunct instructor",
    "courses.numerical": "Numerical Analysis",
    "courses.analysis2": "Analysis II",
    "courses.geometry": "Basic Geometry",
    "courses.current1": "Current semester (2026-2)",
    "courses.current2": "Current semester (2026-2)",
    "courses.current3": "Current semester (2026-2)",
    "courses.calc-combo": "Differential · Integral · Multivariable Calculus",
    "courses.cnote1": "Vector Geometry and Linear Algebra — taught in previous semesters.",
    "courses.math226": "Math 226 · Integration Techniques and Parametric Equations",
    "courses.spring2026": "Spring 2026",
    "courses.math227": "Math 227 · Polar Coordinates, Sequences and Series",
    "courses.spring2026b": "Spring 2026",
    "courses.math224": "Math 224–225 · Differential and Integral Calculus",
    "courses.terms1": "Fall 2025 · Winter 2026 · Summer 2026 (online)",
    "courses.math147": "Math 147 · Elementary Statistics",
    "courses.terms2": "Fall 2024 · Spring 2025 · Summer 2025 (online)",
    "courses.notes.clase1": "Class 1", "courses.notes.clase2": "Class 2", "courses.notes.clase3": "Class 3",
    "courses.notes.clase4": "Class 4", "courses.notes.clase5": "Class 5",
    "courses.notes.math225.clase1": "Class 1", "courses.notes.math225.clase2": "Class 2",
    "courses.notes.math225.clase3": "Class 3", "courses.notes.math225.clase4": "Class 4",
    "courses.notes.math225.clase5": "Class 5", "courses.notes.math225.clase6": "Class 6",
    "courses.notes.math225.clase7": "Class 7", "courses.notes.math225.clase8": "Class 8",
    "courses.notes.math225.clase9": "Class 9", "courses.notes.math225.clase10": "Class 10",
    "courses.notes.math225.clase11": "Class 11", "courses.notes.math225.clase12": "Class 12",
    "courses.notes.math225.clase13": "Class 13", "courses.notes.math225.clase14": "Class 14",
    "courses.notes.math225.clase15": "Class 15",
    "courses.notes.math226.clase1": "Class 1", "courses.notes.math226.clase2": "Class 2",
    "courses.notes.math226.clase3": "Class 3", "courses.notes.math226.clase4": "Class 4",
    "courses.notes.math226.clase5": "Class 5", "courses.notes.math226.clase6": "Class 6",
    "courses.notes.math226.clase7": "Class 7", "courses.notes.math226.clase8": "Class 8",
    "courses.notes.math226.clase9": "Class 9", "courses.notes.math226.clase10": "Class 10",
    "courses.notes.math226.clase11": "Class 11", "courses.notes.math226.clase12": "Class 12",
    "courses.notes.math226.clase13": "Class 13", "courses.notes.math226.clase15": "Class 15",
    "courses.notes.math226.clase16": "Class 16", "courses.notes.math226.clase17": "Class 17",
    "courses.notes.math226.clase18": "Class 18",
    "courses.notes.math227.clase1": "Class 1", "courses.notes.math227.clase2": "Class 2",
    "courses.notes.math227.clase3": "Class 3", "courses.notes.math227.clase4": "Class 4",
    "courses.notes.math227.clase5": "Class 5", "courses.notes.math227.clase8": "Class 8",
    "courses.notes.math227.clase9": "Class 9", "courses.notes.math227.clase10": "Class 10",
    "courses.notes.math227.clase11": "Class 11", "courses.notes.math227.clase13": "Class 13",
    "courses.notes.math227.clase14": "Class 14", "courses.notes.math227.clase16": "Class 16",
    "courses.notes.math227.clase17": "Class 17",
    "courses.notes.geo.u1": "Unit 1 summary (Midterm 1)",
    "courses.notes.an2.clase1": "Class 1",

    "research.eyebrow": "Research",
    "research.h2": "Publications and research",
    "research.intro": "Thirteen problems solved in international journals, one peer-reviewed article, and a thesis I still haven't entirely finished understanding — in the good sense: the kind that keeps teaching me something new every time I return to it.",
    "research.exp.h3": "Research experience",
    "research.exp.p": "Between 2021 and 2022 I was a young researcher in the Algebra Research Group at the Universidad de Antioquia, as part of my undergraduate thesis project on non-associative algebra and category theory. That work resulted in an article published in a peer-reviewed journal and contributions to the solution of thirteen mathematical problems published in international journals.",
    "research.articles.h3": "Peer-reviewed articles",
    "research.cassini.cap": "Cassini's identity, a classic of the Fibonacci world",
    "research.problems.h3": "Problems solved in international journals",
    "research.p1": " Vol. 25, No. 2 (2022), Problem 419",
    "research.p2": " Vol. 24, No. 3 (2021), Problem 408",
    "research.p3": " Vol. 52, No. 1 (2021), Problem 1167",
    "research.p4": " Vol. 58, No. 1 (2020), Problem H-819",
    "research.p5": " Vol. 58, No. 2 (2020), Problem B-1246",
    "research.p6": " Vol. 127, No. 4 (2020), Problem 12063 (limit of nested radicals)",
    "research.p7": " Vol. 51, No. 4 (2020), Problem 1157",
    "research.p8": " Vol. 57, No. 1 (2019), Problem B-1222",
    "research.p9": " Vol. 57, No. 2 (2019), Problem B-1226",
    "research.p10": " Vol. 57, No. 2 (2019), Problem B-1227",
    "research.p11": " Vol. 57, No. 3 (2019), Problem B-1231",
    "research.p12": " Vol. 57, No. 3 (2019), Problem B-1233",
    "research.p13": " Vol. 57, No. 3 (2019), Problem B-1235",
    "research.radical.cap": "the typical form of a nested radical, as in AMM problem 12063",
    "research.talks.h3": "Talks and presentations",
    "research.talk2.venue": "Mathematics Seminar, Institute of Mathematics, Universidad de Antioquia",
    "research.talk3.venue": "Fifth Meeting on Algebra and Topology, Universidad de Antioquia",

    "sp.eyebrow": "Student initiative",
    "sp.intro": "An initiative for undergraduate and graduate students to take their first steps into mathematical research by solving problems proposed in high-impact academic journals — with the chance to apply for the Gilberto García Pulgarín Research Award, inspired by Universidad de Antioquia alumni professors Dr. Rigoberto Flórez, Dr. Leandro Junes, and Dr. Fernando Guzmán.",
    "sp.personal": "I started exactly that way — solving problems published in journals like the ones you see in the Research section.",
    "sp.stat1": "Article publication",
    "sp.stat2": "Problem solutions",
    "sp.judgeslabel": "Award judges",
    "sp.cta": "See full details →",

    "blog.h2": "Notes and updates",
    "blog.note": "Short notes on whatever I'm teaching, researching, or simply turning over in my head this season.",
    "blog.tag1": "Teaching", "blog.tag2": "Research", "blog.tag3": "Problem solving",
    "blog.date1": "September 15, 2026", "blog.date2": "September 10, 2026", "blog.date3": "September 3, 2026",
    "blog.h3.1": "Starting the 2026-2 semester",
    "blog.p1": "This semester at the Universidad de Antioquia I'm teaching Numerical Analysis, Analysis II, and Basic Geometry: three advanced courses that call for different paces. I'll be leaving comments here on how the semester is going and what material I'm using in each one.",
    "blog.newton.cap": "Newton's method, the star of Numerical Analysis",
    "blog.h3.2": "The Peter–Weyl theorem, revisited",
    "blog.p2": "My master's thesis centered on this result about representations of compact groups. I want to use this space to revisit those ideas at a slower pace, in language closer to that of my undergraduate students.",
    "blog.pw2.cap": "the decomposition that gives my thesis its title",
    "blog.h3.3": "A limit of nested radicals",
    "blog.p3": "On problem 12063 published in the American Mathematical Monthly: a limit of nested radicals with a solution more elegant than it first appears. I'll soon write up the full solution, step by step.",
    "blog.radical2.cap": "the typical form of a nested radical",

    "cv.eyebrow": "Curriculum Vitae",
    "cv.h2": "My full CV",
    "cv.intro": "Education, teaching, research, publications, and awards — all in one document, available in both Spanish and English.",
    "cv.updated": "Updated — September 2026",
    "cv.view": "View PDF",
    "cv.download": "Download",

    "footer.eyebrow": "Contact",
    "footer.h2": "Let's talk math",
    "footer.lead": "If you're a student, a colleague, or someone who ran into a math question that won't leave you alone — write to me. I'm happy to talk about courses, collaborations, or problems worth chasing.",
    "footer.email.label": "Email",
    "footer.email2.label": "Alternate email",
    "footer.loc.label": "Location",
    "footer.tagline": "Made with LaTeX in the heart, HTML on the page."
  };

  var LANG_KEY = "santiago-site-lang";

  function ready(fn){
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function(){
    try {
      var elements = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
      var esCache = {};
      elements.forEach(function(el){
        esCache[el.getAttribute("data-i18n")] = el.innerHTML;
      });

      function renderMath(){
        try {
          if (window.renderMathInElement) {
            renderMathInElement(document.body, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
              ],
              throwOnError: false
            });
          }
        } catch(e) { /* math stays as plain LaTeX source if KaTeX failed to load */ }
      }

      function applyLang(lang){
        elements.forEach(function(el){
          var key = el.getAttribute("data-i18n");
          if (lang === "en" && Object.prototype.hasOwnProperty.call(dictEn, key)) {
            el.innerHTML = dictEn[key];
          } else if (Object.prototype.hasOwnProperty.call(esCache, key)) {
            el.innerHTML = esCache[key];
          }
        });
        try { document.documentElement.setAttribute("lang", lang); } catch(e) {}
        var btns = document.querySelectorAll("[data-lang-btn]");
        btns.forEach(function(b){
          b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === lang ? "true" : "false");
        });
        try { localStorage.setItem(LANG_KEY, lang); } catch(e) {}
        renderMath();
      }

      var initialLang = "es";
      try {
        var saved = localStorage.getItem(LANG_KEY);
        if (saved === "en" || saved === "es") initialLang = saved;
      } catch(e) {}

      var langBtns = document.querySelectorAll("[data-lang-btn]");
      langBtns.forEach(function(btn){
        btn.addEventListener("click", function(){
          applyLang(btn.getAttribute("data-lang-btn"));
        });
      });

      if (initialLang === "en") {
        applyLang("en");
      } else {
        renderMath();
      }
    } catch(err) {
      /* if anything goes wrong, the site simply stays in Spanish */
    }

    /* mark the current page's nav link as active */
    try {
      var here = (location.pathname.split("/").pop() || "index.html");
      if (here === "") here = "index.html";
      document.querySelectorAll(".navlink[href]").forEach(function(a){
        var href = a.getAttribute("href");
        if (href === here) a.classList.add("active");
      });
    } catch(e) {}
  });
})();
