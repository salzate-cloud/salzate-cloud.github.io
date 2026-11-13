(function(){
  "use strict";

  var dictEn = {
    "courses.group.libro": "Course book",
    "courses.group.notas": "Class notes",
    "courses.notes.math147.notas": "Course notes",
    "courses.group.resumenes": "Summaries",
    "courses.group.soluciones": "Midterms",
    "courses.group.iueTalleresPrep": "Preparation workshops",
    "courses.group.iueColab": "Collaborative workshop solutions",
    "courses.group.iueQuizzes": "Quiz solutions",    "courses.group.iueSoluciones": "Partial exam solutions",
    "courses.notes.an2.p3sol": "Midterm 3 · Solution",
    "courses.notes.geovec.p3sol": "Midterm 3 · Solution",
    "courses.notes.geovec.p2sol": "Midterm 2 · Solution",
    "courses.index.title": "Explore by university",
    "courses.index.iue": "Institución Universitaria de Envigado",
    "courses.index.udea": "Universidad de Antioquia",
    "courses.index.binghamton": "Binghamton University",
    "courses.index.current": "Current",
    "courses.index.archive": "Past courses",
    "home.cta.courses": "Explore courses",
    "home.cta.feedback": "Leave a comment",
    "feedback.eyebrow": "A note for Santiago",
    "feedback.title": "What would you like to share?",
    "feedback.description": "Suggest an improvement, point out an error, or tell me what helped you learn.",
    "feedback.privacy": "Comments are not published on the site. Name and email are optional. Formspree processes and stores submissions in its dashboard; avoid including sensitive information about other students. <a href=\"https://formspree.io/legal/privacy-policy/\" target=\"_blank\" rel=\"noopener\">Read its privacy policy.</a>",
    "feedback.message": "Your comment",
    "feedback.placeholder": "Write your comment here…",
    "feedback.anonymous": "I prefer to leave this anonymously",
    "feedback.name": "Name (optional)",
    "feedback.namePlaceholder": "Your name",
    "feedback.email": "Email (optional, if you would like a reply)",
    "feedback.emailPlaceholder": "you@example.com",
    "feedback.submit": "Send comment",
    "feedback.pending": "Mailbox not connected yet: we will enable sending when the destination email is configured.",
    "feedback.ready": "Your comment will be emailed to Santiago. You can send it anonymously.",
    "courses.search.label": "Find a course or topic",
    "courses.search.placeholder": "Try: Banach, Fourier, Geometry…",
    "courses.search.description": "Search by institution, course, or topic. Materials filter as you type.",
    "feedback.quickLink": "Leave a comment",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.courses": "Courses",
    "nav.research": "Research",
    "nav.sp": "Solving Problems",
    "nav.blog": "Blog",
    "nav.cv": "CV",
    "nav.contact": "Contact",
    "contact.feedback": "Would you rather suggest an improvement or leave an anonymous comment?",
    "contact.feedback.link": "Go to comments →",

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
    "home.visitas.label": "visits to this site",
    "home.visitas.pie": "Thanks for stopping by.",
    "home.research.p": "I work in analysis, geometry, and topology, and I keep a standing habit of solving problems posed in high-impact journals — several of which have led to published notes and articles. Between research and the classroom, I'm especially interested in how the two feed each other.",

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
    "about.edu0.period": "From 2027",
    "about.edu0.what": "Ph.D. in Mathematics",
    "about.edu0.desc": "Starting in the first semester of 2027.",
    "about.edu1.what": "Master's (M.A.) in Mathematics",
    "about.edu1.where": "Binghamton University, New York, USA",
    "about.edu1.desc": "Thesis: <i>The Peter–Weyl Theorem and Its Applications</i>.",
    "about.pw1.cap": "the Peter–Weyl decomposition for a compact group G",
    "about.edu2.what": "Undergraduate degree in Mathematics",
    "about.awards.h3": "Awards and scholarships",
    "award.label": "Teaching excellence award",
    "about.award6.desc": "Teaching excellence award, given for the first time in 2026, based on student surveys and the recommendation of the department awards committee.",
    "about.award1.desc": "Distinction awarded to outstanding mathematics students during the academic year.",
    "about.award2.desc": "For undergraduate research work, supported by professors Rigoberto Flórez, Fernando Guzmán, and Leandro Junes.",
    "about.award3.desc": "For outstanding academic and research performance.",
    "about.award4.what": "Scholarships for outstanding academic performance",
    "about.award4.desc": "Awarded in four semesters for achieving the highest average.",
    "about.award5.what": "Best Graduate Scholarship",
    "about.award5.desc": "Awarded to the top graduate of the program to pursue any postgraduate degree at the University.",
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
    "courses.notes.discrete.libro": "Course book",
    "courses.notes.discrete1.notas": "Full course notes",
    "courses.notes.discrete2.notas": "Full course notes",
    "courses.notes.discrete3.notas": "Full course notes",
    "courses.udea.badge": "2023 — present · Adjunct instructor",
    "courses.numerical": "Numerical Analysis",
    "courses.analysis2": "Analysis II",
    "courses.geometry": "Basic Geometry",
    "courses.status.current": "In progress",
    "courses.status.past": "Past course",
    "courses.period.2026-2": "Semester 2026-2",
    "courses.material.updated": "Latest material:",
    "courses.material.date.20261113": "Nov 13, 2026",
    "courses.material.date.20261106": "Nov 6, 2026",
    "courses.material.date.20260920": "Sep 20, 2026",
    "courses.material.date.20260929": "Sep 29, 2026",
    "courses.material.date.20261109": "Nov 9, 2026",
    "courses.current1": "Semester 2026-2",
    "courses.current2": "Semester 2026-2",
    "courses.current3": "Semester 2026-2",
    "courses.calcdif": "Differential Calculus",
    "courses.geovec": "Vector and Analytic Geometry",
    "courses.calcint": "Integral Calculus",
    "courses.algebra": "Linear Algebra",
    "courses.notes.algebra.libro": "Full course book",
    "courses.calc-combo": "Multivariable Calculus",
    "courses.cnote1": "Taught in a previous semester.",
    "courses.math226": "Math 226 · Integration Techniques and Parametric Equations",
    "courses.spring2026": "Spring 2026",
    "courses.math227": "Math 227 · Polar Coordinates, Sequences and Series",
    "courses.spring2026b": "Spring 2026",
    "courses.math224": "Math 224–225 · Differential and Integral Calculus",
    "courses.terms1": "Fall 2025 · Winter 2026 · Summer 2026 (online)",
    "courses.math147": "Math 147 · Elementary Statistics",
    "courses.terms2": "Fall 2024 · Spring 2025 · Summer 2025 (online)",
    "courses.notes.clase1": "Class 1", "courses.notes.clase2": "Class 2", "courses.notes.clase3": "Class 3",
    "courses.notes.clase4": "Class 4", "courses.notes.clase5": "Class 5", "courses.notes.clase6": "Class 6", "courses.notes.clase7": "Class 7",
    "courses.notes.clase8": "Class 8",
    "courses.notes.clase9": "Class 9",
    "courses.notes.clase10": "Class 10",
    "courses.notes.an.p1sol": "Midterm 1 · Solutions",
    "courses.notes.an.sup1sol": "Make-up Midterm 1 · Solutions",
    "courses.notes.an.p2sol": "Midterm 2 · Solutions",
    "courses.notes.an.sup2sol": "Make-up Midterm 2 · Solutions",
    "courses.notes.clase11": "Class 11",
    "courses.notes.clase12": "Class 12",
    "courses.notes.clase13": "Class 13",
    "courses.notes.iue.prepCalc1": "Preparation workshop",
    "courses.notes.iue.calc1Colab1sol": "Collaborative workshop 1 · Solution",
    "courses.notes.iue.prepDiscrete": "Preparation workshop",
    "courses.notes.iue.discreteP1sol": "Midterm 1 · Solution",
    "courses.notes.iue.calc1P1sol": "Midterm 1 · Solution",
    "courses.notes.iue.logicP1sol": "Midterm 1 · Solution",
    "courses.notes.iue.grafos": "Unit 3 · Graphs",
    "courses.notes.iue.prepLogic": "Preparation workshop",
    "courses.notes.iue.logicColab1sol": "Collaborative workshop 1 · Solution",
    "courses.notes.iue.hamilton": "Unit 3 · Part 2: Hamilton, trees and traversals",
    "courses.notes.iue.noResources": "No files published yet.",
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
    "courses.notes.geo.libro": "Full course book",
    "courses.notes.geo.espacio": "Solid Geometry · 2.7.8–2.7.14",
    "courses.notes.geo.analitica": "Analytic Geometry · Chapter 3",
    "courses.notes.geo.vectorial": "Vector Geometry · Chapter 4",
    "courses.notes.geo.p1sol": "Midterm 1 · Solutions",
    "courses.notes.geo.sup1sol": "Make-up Midterm 1 · Solutions",
    "courses.notes.geo.p2sol": "Midterm 2 · Solutions",
    "courses.notes.geo.sup2sol": "Make-up Midterm 2 · Solutions",
    "courses.notes.an2.clase1": "Class 1",
    "courses.notes.an2.parcial1": "Midterm 1 notes",
    "courses.notes.an2.parcial2": "Midterm 2 notes",
    "courses.notes.an2.parcial3": "Midterm 3 notes",
    "courses.notes.an2.parcial4": "Midterm 4 (final) notes",
    "courses.notes.an2.p2sol": "Midterm 2 · Solutions",
    "courses.notes.an2.sup2sol": "Make-up Midterm 2 · Solutions",
    "courses.notes.calcdif.p1": "Midterm 1 summary",
    "courses.notes.calcdif.p2": "Midterm 2 summary",
    "courses.notes.calcdif.p3": "Midterm 3 summary",
    "courses.notes.calcdif.p3sol": "Midterm 3 · Solution",
    "courses.notes.calcdif.p2sol": "Midterm 2 · Solution",
    "courses.notes.calcdif.p4": "Midterm 4 summary",
    "courses.notes.geovec.p1": "Midterm 1 summary",
    "courses.notes.geovec.p2": "Midterm 2 summary",
    "courses.notes.geovec.p3": "Midterm 3 summary",
    "courses.notes.geovec.p4": "Midterm 4 summary",
    "courses.notes.calcint.resumen": "Full course summary",
    "courses.notes.calc1.clases14taller": "Course notes",
    "courses.notes.logic.clases14": "Course notes",
    "courses.notes.logic.u3": "Unit 3 · Proportionality and the rule of three",
    "courses.notes.math224.clase1": "Class 1",
    "courses.notes.math224.clase2": "Class 2",
    "courses.notes.math224.clase3": "Class 3",
    "courses.notes.math224.clase4": "Class 4",
    "courses.notes.math224.clase5": "Class 5",
    "courses.notes.math224.clase6": "Class 6",
    "courses.notes.math224.clase7": "Class 7",
    "courses.notes.math224.clase8": "Class 8",
    "courses.notes.math224.clase9": "Class 9",
    "courses.notes.math224.clase10": "Class 10",
    "courses.notes.math224.clase11": "Class 11",

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
    "sp.archivelabel": "What we've done so far",
    "sp.archiveintro": "These are the posters we've put up in the hallways of the Institute of Mathematics at Universidad de Antioquia, inviting students to take on problems proposed in academic journals with my mentorship. You can download each poster to see the full problems.",
    "sp.poster4.date": "June – October 2024",
    "sp.poster4.title": "Problem set 4",
    "sp.poster4.p1": "Óscar Ciaurri (Universidad de La Rioja, Spain) — inequality involving sums of harmonic numbers.",
    "sp.poster4.p2": "George Stoica (Saint John, Canada) — integral estimates with power weights.",
    "sp.poster4.p3": "Vasile Mircea Popa (Lucian Blaga University, Romania) — evaluating an improper integral with a logarithm.",
    "sp.poster7.date": "February – June 2025",
    "sp.poster7.title": "Problem set 7",
    "sp.poster7.p1": "Ovidiu Furdui and Alina Sîntămărian (Technical University of Cluj-Napoca, Romania) — computing a limit involving an integral.",
    "sp.poster7.p2": "Florin Stanescu (Şerban Cioculescu School, Romania) — matrix rank and determinant.",
    "sp.poster7.p3": "Moubinool Ormajee (Paris, France) — continuous functions and integrals.",
    "sp.poster7.p4": "Ovidiu Furdui and Alina Sîntămărian (Technical University of Cluj-Napoca, Romania) — evaluating a series.",
    "sp.viewpdf": "View poster (PDF) →",
    "sp.clicktoenlarge": "Click to view the full poster →",
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
    "cv.clicktoenlarge": "Click to view the full CV →",

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
      var placeholderCache = {};
      document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el){
        placeholderCache[el.getAttribute("data-i18n-placeholder")] = el.getAttribute("placeholder") || "";
      });
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
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el){
          var key = el.getAttribute("data-i18n-placeholder");
          var value = lang === "en" && Object.prototype.hasOwnProperty.call(dictEn, key)
            ? dictEn[key] : placeholderCache[key];
          if (value) el.setAttribute("placeholder", value);
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

/* ============================================================
   Visor de PDF en la página (solo lectura, sin descarga)
   Intercepta los enlaces con data-pdf y los abre en un modal
   que renderiza las páginas con PDF.js sobre un <canvas>.
   ============================================================ */
(function(){
  var PDFJS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  var PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  var T = {
    es: { page:"Página", of:"de", prev:"Página anterior", next:"Página siguiente",
          zoomin:"Acercar", zoomout:"Alejar", close:"Cerrar",
          loading:"Cargando documento…",
          error:"No se pudo cargar el visor en este momento. Revisa tu conexión e inténtalo de nuevo.",
          foot:"Documento en modo lectura." },
    en: { page:"Page", of:"of", prev:"Previous page", next:"Next page",
          zoomin:"Zoom in", zoomout:"Zoom out", close:"Close",
          loading:"Loading document…",
          error:"The viewer could not be loaded right now. Check your connection and try again.",
          foot:"Read-only document." }
  };
  function txt(){
    var l = "es";
    try { if (localStorage.getItem("santiago-site-lang") === "en") l = "en"; } catch(e){}
    if (document.documentElement.getAttribute("lang") === "en") l = "en";
    return T[l] || T.es;
  }

  var pdfjsPromise = null;
  function loadPdfJs(){
    if (pdfjsPromise) return pdfjsPromise;
    pdfjsPromise = new Promise(function(resolve, reject){
      if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
      var s = document.createElement("script");
      s.src = PDFJS_SRC;
      s.onload = function(){
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
          resolve(window.pdfjsLib);
        } else { reject(new Error("pdfjsLib no disponible")); }
      };
      s.onerror = function(){ reject(new Error("no se pudo cargar PDF.js")); };
      document.head.appendChild(s);
    });
    return pdfjsPromise;
  }

  var ui = null, doc = null, pageNum = 1, zoom = 1, rendering = false, pending = null, lastFocus = null;

  function buildUI(){
    if (ui) return ui;
    var t = txt();
    var ov = document.createElement("div");
    ov.className = "pdfv-overlay";
    ov.setAttribute("role","dialog");
    ov.setAttribute("aria-modal","true");
    ov.innerHTML =
      '<div class="pdfv-panel">' +
        '<div class="pdfv-bar">' +
          '<div class="pdfv-title"></div>' +
          '<div class="pdfv-tools">' +
            '<button type="button" class="pdfv-btn pdfv-prev">&#8249;</button>' +
            '<span class="pdfv-count"></span>' +
            '<button type="button" class="pdfv-btn pdfv-next">&#8250;</button>' +
            '<button type="button" class="pdfv-btn pdfv-zout">&minus;</button>' +
            '<button type="button" class="pdfv-btn pdfv-zin">+</button>' +
            '<button type="button" class="pdfv-btn pdfv-close">&times;</button>' +
          '</div>' +
        '</div>' +
        '<div class="pdfv-stage"><div class="pdfv-msg"></div></div>' +
        '<div class="pdfv-foot"></div>' +
      '</div>';
    document.body.appendChild(ov);
    ui = {
      overlay: ov,
      panel: ov.querySelector(".pdfv-panel"),
      title: ov.querySelector(".pdfv-title"),
      count: ov.querySelector(".pdfv-count"),
      stage: ov.querySelector(".pdfv-stage"),
      msg: ov.querySelector(".pdfv-msg"),
      foot: ov.querySelector(".pdfv-foot"),
      prev: ov.querySelector(".pdfv-prev"),
      next: ov.querySelector(".pdfv-next"),
      zin: ov.querySelector(".pdfv-zin"),
      zout: ov.querySelector(".pdfv-zout"),
      close: ov.querySelector(".pdfv-close")
    };
    ui.prev.title = t.prev; ui.next.title = t.next;
    ui.zin.title = t.zoomin; ui.zout.title = t.zoomout;
    ui.close.title = t.close; ui.close.setAttribute("aria-label", t.close);
    ui.foot.textContent = t.foot;

    ui.prev.addEventListener("click", function(){ go(pageNum - 1); });
    ui.next.addEventListener("click", function(){ go(pageNum + 1); });
    ui.zin.addEventListener("click", function(){ zoom = Math.min(zoom + 0.25, 3); render(); });
    ui.zout.addEventListener("click", function(){ zoom = Math.max(zoom - 0.25, 0.5); render(); });
    ui.close.addEventListener("click", close);
    ov.addEventListener("click", function(e){ if (e.target === ov) close(); });
    ov.addEventListener("contextmenu", function(e){ e.preventDefault(); });
    document.addEventListener("keydown", function(e){
      if (!ov.classList.contains("open")) return;
      if (e.key === "Escape") { close(); }
      else if (e.key === "ArrowRight" || e.key === "PageDown") { go(pageNum + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { go(pageNum - 1); }
    });
    return ui;
  }

  function setControls(){
    var t = txt();
    if (!doc) { ui.count.textContent = ""; ui.prev.disabled = ui.next.disabled = true; return; }
    ui.count.textContent = t.page + " " + pageNum + " " + t.of + " " + doc.numPages;
    ui.prev.disabled = (pageNum <= 1);
    ui.next.disabled = (pageNum >= doc.numPages);
  }

  function go(n){
    if (!doc) return;
    n = Math.min(Math.max(n, 1), doc.numPages);
    if (n === pageNum) return;
    pageNum = n;
    render();
  }

  function render(){
    if (!doc) return;
    if (rendering) { pending = pageNum; return; }
    rendering = true;
    setControls();
    doc.getPage(pageNum).then(function(page){
      var base = page.getViewport({ scale: 1 });
      var avail = Math.max(ui.stage.clientWidth - 36, 260);
      var fit = Math.min(avail / base.width, 1.9);
      var viewport = page.getViewport({ scale: fit * zoom });
      var ratio = window.devicePixelRatio || 1;
      var canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";
      var ctx = canvas.getContext("2d");
      ctx.scale(ratio, ratio);
      return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function(){
        ui.stage.innerHTML = "";
        ui.stage.appendChild(canvas);
        ui.stage.scrollTop = 0;
      });
    }).catch(function(){
      ui.stage.innerHTML = '<div class="pdfv-msg">' + txt().error + '</div>';
    }).then(function(){
      rendering = false;
      if (pending !== null) { var p = pending; pending = null; if (p !== pageNum) { pageNum = p; } render(); }
    });
  }

  function open(url, title){
    buildUI();
    var t = txt();
    lastFocus = document.activeElement;
    doc = null; pageNum = 1; zoom = 1;
    ui.title.textContent = title || "";
    ui.foot.textContent = t.foot;
    ui.close.title = t.close; ui.close.setAttribute("aria-label", t.close);
    ui.stage.innerHTML = '<div class="pdfv-msg">' + t.loading + '</div>';
    setControls();
    ui.overlay.classList.add("open");
    document.body.classList.add("pdfv-lock");
    ui.close.focus();
    loadPdfJs().then(function(lib){
      return lib.getDocument({ url: url }).promise;
    }).then(function(d){
      doc = d;
      render();
    }).catch(function(){
      ui.stage.innerHTML = '<div class="pdfv-msg">' + txt().error + '</div>';
      setControls();
    });
  }

  function close(){
    if (!ui) return;
    ui.overlay.classList.remove("open");
    document.body.classList.remove("pdfv-lock");
    ui.stage.innerHTML = "";
    if (doc && doc.destroy) { try { doc.destroy(); } catch(e){} }
    doc = null;
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch(e){} }
  }

  document.addEventListener("click", function(e){
    var a = e.target.closest ? e.target.closest("a[data-pdf]") : null;
    if (!a || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    var span = a.querySelector("span");
    open(a.getAttribute("data-pdf"), span ? span.textContent.trim() : "");
  });
})();

/* ============================================================
   Aparición al desplazar
   Marca bloques con .reveal y los hace aparecer cuando entran
   en pantalla. Si el navegador no lo soporta, o si el sistema
   pide menos movimiento, no se toca nada y todo se ve de una.
   ============================================================ */
(function(){
  var SELECTORES = [
    ".home-grid > *",
    ".home-intro",
    ".page-head .eyebrow",
    ".page-head h1",
    ".page-head .rule-accent",
    ".page-head p.lead",
    "h2.section-title",
    ".page > .wrap > .block",
    ".course-card",
    ".cv-card",
    ".sp-poster-card",
    ".post-card",
    ".tl-item",
    ".talk",
    ".def-row",
    ".body-text"
  ];

  function arranca(){
    try {
      if (!("IntersectionObserver" in window)) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      var vistos = [];
      SELECTORES.forEach(function(sel){
        Array.prototype.forEach.call(document.querySelectorAll(sel), function(el){
          if (vistos.indexOf(el) === -1 && !el.closest(".pdfv-overlay")) vistos.push(el);
        });
      });
      if (!vistos.length) return;

      /* un elemento dentro de otro ya marcado no se marca: evita dobles animaciones */
      vistos = vistos.filter(function(el){
        return !vistos.some(function(otro){ return otro !== el && otro.contains(el); });
      });

      var porPadre = new Map();
      vistos.forEach(function(el){
        el.classList.add("reveal");
        var n = porPadre.get(el.parentNode) || 0;
        porPadre.set(el.parentNode, n + 1);
        el.style.transitionDelay = (Math.min(n, 6) * 65) + "ms";
      });

      var obs = new IntersectionObserver(function(entradas){
        entradas.forEach(function(e){
          if (e.isIntersecting){
            e.target.classList.add("is-in");
            obs.unobserve(e.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });

      vistos.forEach(function(el){ obs.observe(el); });

      /* red de seguridad: si algo falla, a los 3 s todo queda visible */
      setTimeout(function(){
        vistos.forEach(function(el){ el.classList.add("is-in"); });
      }, 3000);
    } catch(e){
      try {
        Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function(el){
          el.classList.add("is-in");
        });
      } catch(e2){}
    }
  }

  if (document.readyState !== "loading") arranca();
  else document.addEventListener("DOMContentLoaded", arranca);
})();

/* ------------------------------------------------ contador de visitas
 * Pide el total al Worker de Cloudflare y lo muestra donde haya un
 * bloque .bloque-visitas (portada grande, cursos pequeno). Si la
 * peticion falla, los bloques siguen ocultos y la pagina se ve igual.
 */
(function(){
  var ENDPOINT = "https://contador.alzattesantiago.workers.dev";

  function conPuntos(n){
    try { return n.toLocaleString("es-CO"); }
    catch(e){ return String(n); }
  }

  function anima(el, hasta){
    var reducido = false;
    try {
      reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch(e){}
    if (reducido || hasta <= 0){ el.textContent = conPuntos(hasta); return; }

    var inicio = null, dura = 1100;
    function paso(t){
      if (inicio === null) inicio = t;
      var k = Math.min((t - inicio) / dura, 1);
      k = 1 - Math.pow(1 - k, 3);                 /* desacelera al final */
      el.textContent = conPuntos(Math.round(hasta * k));
      if (k < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  function arranca(){
    var bloques = document.querySelectorAll(".bloque-visitas");
    if (!bloques.length || !ENDPOINT) return;

    /* una visita por sesion: recargar o cambiar de pagina no infla la cuenta */
    var nueva = true;
    try {
      if (sessionStorage.getItem("visita-contada")) nueva = false;
      else sessionStorage.setItem("visita-contada", "1");
    } catch(e){}

    var destino = ENDPOINT.replace(/\/+$/, "") + (nueva ? "/visita" : "/");
    var opciones = { method: nueva ? "POST" : "GET", cache: "no-store" };

    fetch(destino, opciones)
      .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(d){
        var n = parseInt(d && d.total, 10);
        if (!isFinite(n) || n < 0) return;
        Array.prototype.forEach.call(bloques, function(bloque){
          bloque.hidden = false;
          bloque.classList.add("is-in");
          Array.prototype.forEach.call(
            bloque.querySelectorAll(".visitas-numero"),
            function(el){ anima(el, n); }
          );
        });
      })
      .catch(function(){
        /* Mantiene visible el bloque y no muestra un cero si el servicio falla. */
        Array.prototype.forEach.call(bloques, function(bloque){
          Array.prototype.forEach.call(
            bloque.querySelectorAll(".visitas-numero, .visitas-mini-num"),
            function(el){ el.textContent = "—"; }
          );
        });
      });
  }

  if (document.readyState !== "loading") arranca();
  else document.addEventListener("DOMContentLoaded", arranca);
})();


/* ---------- Buzon de comentarios ---------- */
(function(){
  function arranca(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-feedback-form]"),function(form){
      var toggle=form.querySelector("[data-anonymous-toggle]");
      var fields=form.querySelector("[data-anonymous-fields]");
      var submit=form.querySelector('[type="submit"]');
      var status=form.querySelector("[data-feedback-status]");
      var endpoint=(form.getAttribute("data-feedback-endpoint")||"").trim();
      var english=document.documentElement.getAttribute("lang")==="en";
      function syncAnonymous(){
        if(!toggle||!fields) return;
        fields.hidden=toggle.checked;
        Array.prototype.forEach.call(fields.querySelectorAll("input"),function(input){input.disabled=toggle.checked;});
      }
      syncAnonymous();
      if(submit) submit.disabled=!endpoint;
      if(!endpoint&&status){status.setAttribute("data-state","pending");}
      if(toggle) toggle.addEventListener("change",syncAnonymous);
      form.addEventListener("submit",function(event){
        event.preventDefault();
        if(!endpoint){
          if(status) status.textContent=english
            ?"The mailbox is not connected yet. No comment has been sent."
            :"El buzón todavía no está conectado. No se ha enviado ningún comentario.";
          return;
        }
        if(submit) submit.disabled=true;
        if(status){status.removeAttribute("data-state");status.textContent=english?"Sending…":"Enviando…";}
        fetch(endpoint,{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}})
          .then(function(response){if(!response.ok) throw new Error("Submission failed");return response.json();})
          .then(function(){
            form.reset();syncAnonymous();
            if(status){status.setAttribute("data-state","success");status.textContent=english
              ?"Thank you. Your comment has been sent to Santiago."
              :"Gracias. Tu comentario fue enviado a Santiago.";}
          })
          .catch(function(){
            if(status){status.setAttribute("data-state","error");status.textContent=english
              ?"We could not send the comment. Please try again later."
              :"No pudimos enviar el comentario. Inténtalo de nuevo más tarde.";}
          })
          .finally(function(){if(submit) submit.disabled=false;});
      });
    });
  }
  if(document.readyState!=="loading") arranca();
  else document.addEventListener("DOMContentLoaded",arranca);
})();


/* ---------- Pestañas de universidad y busqueda de materiales ---------- */
(function(){
  function normaliza(valor){
    return String(valor||"").normalize("NFD").split("").filter(function(caracter){
      var codigo=caracter.charCodeAt(0);
      return codigo<768||codigo>879;
    }).join("").toLowerCase();
  }
  function inicia(){
    var input=document.getElementById("course-search");
    var tabs=Array.prototype.slice.call(document.querySelectorAll(".course-index a[role='tab'][href^='#course-']"));
    var cards=Array.prototype.slice.call(document.querySelectorAll(".course-card[id^='course-']"));
    if(!tabs.length||!cards.length) return;
    var status=document.querySelector("[data-course-search-status]");
    var indexLinks=document.querySelectorAll(".course-index a[href^='#course-']");
    var activeId="course-iue";
    if(location.hash){
      var hashId=location.hash.slice(1);
      if(cards.some(function(card){return card.id===hashId;})) activeId=hashId;
    }
    function filtra(){
      var query=normaliza(input?input.value.trim():"");
      var english=document.documentElement.getAttribute("lang")==="en";
      var visibleMaterials=0;
      cards.forEach(function(card){
        var rows=card.querySelectorAll(".course-row");
        var visibleRows=0;
        Array.prototype.forEach.call(rows,function(row){
          var name=normaliza((row.querySelector(".cname")||{}).textContent);
          var time=normaliza((row.querySelector(".cwhen")||{}).textContent);
          var headingMatch=!query||name.indexOf(query)!==-1||time.indexOf(query)!==-1;
          var rowHasMatch=headingMatch;
          var groups=row.querySelectorAll(".notes-group");
          Array.prototype.forEach.call(groups,function(group){
            var title=normaliza((group.querySelector(".ng-title")||{}).textContent);
            var groupMatch=headingMatch||!query||title.indexOf(query)!==-1;
            var resources=group.querySelectorAll(".notes-links a,.notes-links button");
            var groupHasMatch=false;
            Array.prototype.forEach.call(resources,function(resource){
              var text=normaliza((resource.textContent||"")+" "+(resource.getAttribute("title")||"")+" "+(resource.getAttribute("aria-label")||""));
              var matches=groupMatch||text.indexOf(query)!==-1;
              resource.hidden=!matches;
              if(matches){groupHasMatch=true;visibleMaterials++;}
            });
            group.hidden=!!query&&!groupHasMatch;
            if(group.tagName==="DETAILS") group.open=!!query&&groupHasMatch;
            if(groupHasMatch) rowHasMatch=true;
          });
          row.hidden=!!query&&!rowHasMatch;
          if(rowHasMatch) visibleRows++;
        });
        card.hidden=query?!visibleRows:card.id!==activeId;
      });
      Array.prototype.forEach.call(indexLinks,function(link){
        var target=document.querySelector(link.getAttribute("href"));
        link.hidden=!!query&&(!target||target.hidden);
      });
      if(status){
        if(!query) status.textContent=english
          ?"Search by institution, course, or topic. Materials filter as you type."
          :"Busca por institución, curso o tema. Los materiales se filtran mientras escribes.";
        else if(visibleMaterials) status.textContent=english
          ?"Found "+visibleMaterials+" materials."
          :"Se encontraron "+visibleMaterials+" materiales.";
        else status.textContent=english
          ?"No materials match that search."
          :"No encontramos materiales con esa búsqueda.";
      }
    }
    function activar(tab,focus,scroll){
      activeId=tab.getAttribute("href").slice(1);
      if(input) input.value="";
      tabs.forEach(function(item){
        var selected=item===tab;
        item.setAttribute("aria-selected",String(selected));
        item.tabIndex=selected?0:-1;
      });
      filtra();
      try{history.replaceState(null,"","#"+activeId);}catch(e){}
      if(focus) tab.focus();
      if(scroll){
        var target=document.getElementById(activeId);
        if(target) target.scrollIntoView({behavior:"smooth",block:"start"});
      }
    }
    tabs.forEach(function(tab,index){
      tab.addEventListener("click",function(event){
        event.preventDefault();
        activar(tab,false,true);
      });
      tab.addEventListener("keydown",function(event){
        var next=index;
        if(event.key==="ArrowRight") next=(index+1)%tabs.length;
        else if(event.key==="ArrowLeft") next=(index+tabs.length-1)%tabs.length;
        else if(event.key==="Home") next=0;
        else if(event.key==="End") next=tabs.length-1;
        else return;
        event.preventDefault();
        activar(tabs[next],true,false);
      });
    });
    if(input) input.addEventListener("input",filtra);
    document.querySelectorAll("[data-lang-btn]").forEach(function(button){button.addEventListener("click",filtra);});
    var activeTab=tabs.find(function(tab){return tab.getAttribute("href")==="#"+activeId;})||tabs[0];
    tabs.forEach(function(tab){var selected=tab===activeTab;tab.setAttribute("aria-selected",String(selected));tab.tabIndex=selected?0:-1;});
    activeId=activeTab.getAttribute("href").slice(1);
    filtra();
  }
  if(document.readyState!=="loading") inicia();
  else document.addEventListener("DOMContentLoaded",inicia);
})();
