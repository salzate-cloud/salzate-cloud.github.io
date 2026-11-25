(function(){
  "use strict";

  var dictEn = {
    "books.al.course": "Universidad de Antioquia \u00b7 Institute of Mathematics",
    "books.al.sub": "From \u211d\u207f to the Jordan form",
    "books.al.desc": "The full course in four exams, with every proof: vector spaces, independence, bases and dimension, the fundamental subspaces, change of basis, orthogonality, Gram\u2013Schmidt and least squares, linear transformations and isometries, eigenvalues, diagonalization, Markov chains, quadratic forms and the Jordan form. Over two hundred worked examples and a mock exam at the end of each part. Written in Spanish.",
    "books.al.f1": "Interactive cover: drag the columns of A and watch the grid deform",
    "books.al.f2": "Exact step-by-step Gauss\u2013Jordan with rank, nullity and bases",
    "books.al.f3": "Gram\u2013Schmidt in 3D, least squares with your own data and change of basis",
    "books.al.f4": "Eigenvalues, conics and phase portraits with Jordan blocks",
    "courses.notes.algebra.interactivo": "Interactive book",
    "books.num.course": "Universidad de Antioquia \u00b7 Institute of Mathematics",
    "books.num.sub": "Methods, errors and algorithms",
    "books.num.desc": "The course in three exams, following Burden and Faires: error and floating point, bisection, fixed point and Banach, Newton and secant, Lagrange and Hermite interpolation, splines, Weierstrass; numerical differentiation and integration, Romberg, adaptive and Gaussian quadrature; initial value problems, Euler, Runge\u2013Kutta, multistep methods and stiffness; direct and iterative linear solvers and conjugate gradient. With mock exams and a chapter of topics beyond the course. Written in Spanish.",
    "books.num.f1": "Fractal cover: Newton basins in the complex plane",
    "books.num.f2": "The optimal h measured with your browser's real arithmetic",
    "books.num.f3": "Cobwebs, Runge vs Chebyshev, quadratures and Gauss",
    "books.num.f4": "Euler and RK4, stiffness, iterative methods and PageRank",
    "courses.notes.an.interactivo": "Interactive book",
    "books.cint.course": "Universidad de Antioquia \u00b7 Institute of Mathematics",
    "books.cint.sub": "Areas, volumes and series",
    "books.cint.desc": "The whole course in four exams: antiderivatives, Riemann sums and the fundamental theorem; integration techniques and improper integrals; area between curves, volumes by slicing, disks, washers and shells, arc length, centroids, Pappus and work; sequences, series and Taylor series. With a mock exam at the end of each part. Written in Spanish.",
    "books.cint.f1": "3D solids you rotate with your finger: disks, washers and cross sections",
    "books.cint.f2": "Cylindrical shells that unroll and Pappus's torus",
    "books.cint.f3": "Gabriel's horn: volume \u03c0, infinite area",
    "books.cint.f4": "Partial sums, the Basel problem and Riemann's rearrangement",
    "courses.notes.calcint.interactivo": "Interactive book",
    "books.an2.course": "Universidad de Antioquia \u00b7 Institute of Mathematics",
    "books.an2.sub": "Integration, convergence and Fourier analysis",
    "books.an2.desc": "The class notes of the four exams in one book: the Riemann\u2013Stieltjes integral and bounded variation, improper integrals, uniform convergence, power series, parametric integrals, Fourier series, integral and transform, with complete proofs and worked problems. Written in Spanish.",
    "books.an2.f1": "Darboux\u2013Stieltjes sums and the uniform-convergence band",
    "books.an2.f2": "Taylor polynomials, radii of convergence and a non-analytic C\u221e function",
    "books.an2.f3": "Fourier sums, the Dirichlet kernel and the Gibbs phenomenon",
    "books.an2.f4": "The transform, uncertainty and a sliding convolution",
    "courses.notes.an2.interactivo": "Interactive book",
    "books.gva.course": "Universidad de Antioquia \u00b7 Institute of Mathematics",
    "books.gva.sub": "Theory summary and worked problems",
    "books.gva.desc": "The four course summaries in one book: linear systems and matrices, determinants, geometric and coordinate vectors, lines and planes, dot and cross products, applications to physics, and conic sections. Written in Spanish.",
    "books.gva.f1": "Step-by-step Gauss\u2013Jordan and matrices that deform the plane",
    "books.gva.f2": "The determinant as a signed area",
    "books.gva.f3": "Vectors, planes and products in rotatable 3D",
    "books.gva.f4": "Forces in equilibrium and the four conics in motion",
    "courses.notes.geovec.interactivo": "Interactive book",
    "books.calc.course": "Universidad de Antioquia \u00b7 School of Engineering",
    "books.calc.sub": "Theory and worked problems",
    "books.calc.desc": "The four course summaries gathered into one book: real numbers and inequalities, functions and their transformations, transcendental functions, limits and continuity, the derivative and its rules, and its applications to curve sketching and optimization. Written in Spanish.",
    "books.calc.f1": "A function plotter and transformations with sliders",
    "books.calc.f2": "Two-sided limits and the secant line that becomes a tangent",
    "books.calc.f3": "Monotonicity, concavity and L\u2019H\u00f4pital, in color",
    "books.calc.f4": "Folded worked problems and review questions",
    "courses.notes.calcdif.interactivo": "Interactive book",
    "books.md.course": "Institución Universitaria de Envigado · DM1905",
    "books.status.complete": "Complete",
    "books.md.sub": "Learning by doing",
    "books.md.desc": "The course textbook for engineering students: propositional logic and proof, Boolean algebra and circuits, Karnaugh maps, sequences and recurrences, graphs and trees. Short definitions, 67 worked examples and 82 exercises with answers. Written in Spanish.",
    "books.md.f1": "A truth-table calculator and an argument-validity checker",
    "books.md.f2": "Circuits you can switch on and Karnaugh maps that solve themselves",
    "books.md.f3": "A graph editor, Euler trails and Hamilton's puzzle",
    "books.md.f4": "Trees traversed step by step, and review questions",
    "books.md.open": "Open the book",
    "books.md.cap1": "Go to chapter 1",
    "courses.notes.discrete.interactivo": "Interactive book",
    "nav.books": "Interactive texts",
    "books.eyebrow": "Interactive texts",
    "books.h1": "Interactive books",
    "books.lead": "The texts from my courses, designed for studying on screen: figures you can drag and rotate, cited theorems that unfold in place, proofs that open once you have tried them, and questions that grade themselves.",
    "books.geo.course": "Universidad de Antioquia · Basic Geometry",
    "books.status.building": "In progress",
    "books.geo.sub": "From Euclid's postulates to vectors in space",
    "books.geo.desc": "The course textbook: logic and proof techniques, plane geometry with every proof, solid geometry, analytic and vector geometry, plus appendices on matrices, rotations, transformations and conics. Written in Spanish.",
    "books.geo.f1": "Figures you can drag, and 3D figures you can rotate",
    "books.geo.f2": "Cited theorems that unfold right where they are cited",
    "books.geo.f3": "Review questions that grade themselves",
    "books.geo.f4": "Exercises you can mark as solved",
    "books.geo.avail.t": "Available now:",
    "books.geo.avail": "Chapter 0, Foundations of logic and sets. The remaining chapters will be released throughout the course.",
    "books.geo.open": "Read chapter 0",
    "books.geo.cover": "See the book's cover page",
    "books.note": "This section will grow with texts from my other courses.",
    "courses.notes.geo.interactivo": "Interactive book · Chapter 0",
    "courses.group.libro": "Course book",
    "courses.group.diapos": "Class slides",
    "courses.notes.geo.diapos": "All 16 weeks",
    "courses.notes.geo.diapos1": "Midterm 1 · Weeks 1–4",
    "courses.notes.geo.diapos2": "Midterm 2 · Weeks 5–8",
    "courses.notes.geo.diapos3": "Midterm 3 · Weeks 9–12",
    "courses.notes.geo.diapos4": "Midterm 4 · Weeks 13–16",
    "courses.notes.geo.quiz": "In-class quiz",
    "courses.group.notas": "Class notes",
    "courses.notes.math147.notas": "Course notes",
    "courses.group.resumenes": "Summaries",
    "courses.group.soluciones": "Midterms",
    "courses.group.talleres": "Workshops",
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
    "courses.downloadNote": "PDFs open in a new tab. To save one on your computer, use the PDF viewer’s download button.",
    "feedback.quickLink": "Leave a comment",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.courses": "Courses",
    "nav.research": "Research",
    "nav.sp": "Solving Problems",
    "nav.blog": "Blog",
    "nav.cv": "CV",
    "nav.contact": "Contact",
    "nav.agenda": "Create your agenda",
    "home.cta.agenda": "My teaching agenda",
    "agenda.addButton": "Add to schedule",
    "agenda.addDescription": "Choose where, when, and what you will teach.",
    "agenda.addTitle": "Add a class",
    "agenda.backup": "Save backup",
    "agenda.cancel": "Cancel",
    "agenda.catalogNote": "Initial selection based on public SNIES institution profiles (2025). The list is not complete; you can type any institution.",
    "agenda.classesTitle": "Classes in your agenda",
    "agenda.clear": "Clear classes",
    "agenda.color": "Class color",
    "agenda.colorHint": "Change it whenever you like.",
    "agenda.course": "Course",
    "agenda.coursePlaceholder": "e.g., Numerical Analysis",
    "agenda.day": "Day",
    "agenda.dialogEyebrow": "CUSTOMIZE YOUR DIRECTORY",
    "agenda.dialogIntro": "Save an institution to reuse it in your classes. Any crest you add stays in this browser.",
    "agenda.dialogTitle": "Add institution",
    "agenda.directoryEmpty": "Institutions you use will appear here after you add a class.",
    "agenda.directoryTitle": "Institutions",
    "agenda.emptyText": "Add your first class with the form and it will appear here.",
    "agenda.emptyTitle": "Your week is ready.",
    "agenda.end": "Ends",
    "agenda.eyebrow": "FREE TOOL FOR TEACHERS AND STUDENTS",
    "agenda.mode.kicker": "CHOOSE YOUR PROFILE",
    "agenda.mode.label": "How will you use this agenda?",
    "agenda.mode.teacher": "Teacher",
    "agenda.mode.student": "Student",
    "agenda.mode.teacherHint": "Choose your university, then add your classes.",
    "agenda.mode.studentHint": "Add your subjects without choosing a university.",
    "agenda.institution": "Institution",
    "agenda.institutionPlaceholder": "Search or type an institution",
    "agenda.intro": "Organize classes by institution, course, day, and time. Your schedule is saved in this browser; nothing is sent to a server.",
    "agenda.location": "Room or location",
    "agenda.locationPlaceholder": "e.g., Building 12 · Room 301",
    "agenda.newColor": "Institution color",
    "agenda.newColorHint": "Used as a suggested color.",
    "agenda.newLogo": "Crest or logo",
    "agenda.newName": "Institution name",
    "agenda.optional": "(optional)",
    "agenda.pageTitle": "Teacher Agenda — Santiago Alzate",
    "agenda.privacyText": "Your schedule is saved only in this browser. Download a JSON copy to back it up or move it to another device. Do not enter private student information.",
    "agenda.privacyTitle": "Private on this device",
    "agenda.proof.free": "Free, no account needed",
    "agenda.proof.local": "Your data stays here",
    "agenda.proof.pdf": "Ready to print or save as PDF",
    "agenda.print": "Print / PDF",
    "agenda.restore": "Restore backup",
    "agenda.saveInstitution": "Save institution",
    "agenda.saved": "Saved in this browser",
    "agenda.sniesLink": "View official directory ↗",
    "agenda.start": "Starts",
    "agenda.step": "PLAN YOUR WEEK",
    "agenda.stepCalendar": "YOUR WEEKLY VIEW",
    "agenda.stepInstitutions": "YOUR INSTITUTIONS",
    "agenda.title": "Your week, clear from day one.",
    "agenda.weekSub": "Monday to Saturday · 6:00 a.m. – 10:00 p.m.",
    "agenda.weekTitle": "Class schedule",
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
    "courses.material.date.20261116": "Nov 16, 2026",
    "courses.material.date.20261113": "Nov 13, 2026",
    "courses.material.date.20261119": "Nov 19, 2026",
    "courses.material.date.20261106": "Nov 6, 2026",
    "courses.material.date.20260920": "Sep 20, 2026",
    "courses.material.date.20260929": "Sep 29, 2026",
    "courses.material.date.20261109": "Nov 9, 2026",
    "courses.material.date.20261120": "Nov 20, 2026",
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
    "courses.notes.an.exposicionesFinal": "Final Exam Presentation Topics",
    "courses.notes.an.tallerp1": "Workshop for Midterm 1",
    "courses.notes.an.tallerp2sol": "Workshop for Midterm 2",
    "courses.notes.an.tallerp3parte1sol": "Workshop for Midterm 3 · Part 1",
    "courses.notes.an.tallerp3sol": "Workshop for Midterm 3",
    "courses.notes.a2.tallerp1": "Workshop for Midterm 1",
    "courses.notes.a2.tallerp2": "Workshop for Midterm 2",
    "courses.notes.a2.tallerp3sol": "Workshop for Midterm 3",
    "courses.notes.a2.tallerp4sol": "Workshop for Midterm 4",
    "courses.notes.clase11": "Class 11",
    "courses.notes.clase12": "Class 12",
    "courses.notes.clase13": "Class 13",
    "courses.notes.iue.prepCalc1": "Preparation workshop",
    "courses.notes.iue.calc1Colab2sol": "Collaborative workshop 2 · Solution",
    "courses.notes.iue.prepDiscrete": "Preparation workshop",
    "courses.notes.iue.discreteP1sol": "Midterm 1 · Solution",
    "courses.notes.iue.calc1P1sol": "Midterm 1 · Solution",
    "courses.notes.iue.logicP1sol": "Midterm 1 · Solution",
    "courses.notes.iue.grafos": "Unit 3 · Graphs",
    "courses.notes.iue.prepLogic": "Preparation workshop",
    "courses.notes.iue.logicColab1sol": "Collaborative workshop 1 · Solution",
    "courses.notes.iue.logicColab2sol": "Collaborative workshop 2 · Solution",
    "courses.notes.iue.discreteColab2sol": "Collaborative workshop 2 · Solution",
    "courses.notes.iue.discreteColab1sol": "Collaborative workshop 1 · Solution",
    "courses.notes.iue.calc1Colab1sol": "Collaborative workshop 1 · Solution",
    "courses.notes.iue.calc1Quiz1sol": "Quiz I · Solution",
    "courses.notes.iue.discreteQuiz1sol": "Quiz I · Solution",
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
    "courses.notes.geo.notas1": "Midterm 1 · Proof and foundations",
    "courses.notes.geo.notas2": "Midterm 2 · Polygons, areas and similarity",
    "courses.notes.geo.notas3": "Midterm 3 · Circle and solid geometry",
    "courses.notes.geo.notas4": "Midterm 4 · Analytic and vector geometry",
    "courses.notes.geo.p1sol": "Midterm 1 · Solutions",
    "courses.notes.geo.sup1sol": "Make-up Midterm 1 · Solutions",
    "courses.notes.geo.p2sol": "Midterm 2 · Solutions",
    "courses.notes.geo.p3sol": "Midterm 3 · Solutions",
    "courses.notes.geo.sup2sol": "Make-up Midterm 2 · Solutions",
    "courses.notes.geo.taller3": "Class workshop · Midterm 3 · Solutions",
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

/* ---------- Cursos: tarjetas más ricas (ícono, conteo de materiales, accesos destacados) ---------- */
(function(){
  "use strict";
  var SIMB={"courses.calc1":"∫","courses.discrete1":"∑","courses.discrete2":"⊕","courses.discrete3":"∀","courses.logic":"∴",
    "courses.numerical":"≈","courses.analysis2":"ℱ","courses.geometry":"△","courses.calcdif":"f′","courses.geovec":"→",
    "courses.calcint":"∫","courses.algebra":"⊗","courses.calc-combo":"∇","courses.math226":"∫","courses.math227":"Σ",
    "courses.math224":"∂","courses.math147":"x̄"};
  var ICO={
    libro:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5V4.5"/><path d="M9 7h7"/>',
    notas:'<path d="M6 2h9l3 3v17H6z"/><path d="M15 2v3h3"/><path d="M9 11h6M9 15h6"/>',
    taller:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.6-.6-.6-2.6z"/>',
    sol:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.5 9"/>',
    quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><path d="M12 17h.01"/>',
    resumen:'<path d="M4 6h16M4 12h10M4 18h13"/>',
    diapos:'<rect x="2" y="3" width="20" height="13" rx="2"/><path d="M12 16v4M8 20h8"/><path d="M7 12l3-3 3 2 4-4"/>'
  };
  function tipo(k){
    if(/diapos/.test(k))return"diapos"; if(/libro/.test(k))return"libro"; if(/notas/.test(k))return"notas";
    if(/Quizzes/.test(k))return"quiz"; if(/resumen/.test(k))return"resumen"; if(/[Tt]aller|Colab/.test(k)&&!/Soluc/.test(k))return"taller";
    return"sol";
  }
  function svg(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
  function corta(t,n){t=(t||"").replace(/\s+/g," ").trim(); if(t.length<=n)return t; var c=t.slice(0,n); return c.slice(0,c.lastIndexOf(" "))+"…";}
  function inicia(){
    var filas=document.querySelectorAll(".course-row");
    if(!filas.length)return;
    document.documentElement.classList.add("cursos-v2");
    Array.prototype.forEach.call(filas,function(fila){
      var info=fila.querySelector(".course-info"), nom=fila.querySelector(".cname");
      if(!info||!nom||fila.querySelector(".course-ico"))return;
      var ico=document.createElement("span"); ico.className="course-ico"; ico.setAttribute("aria-hidden","true");
      ico.textContent=SIMB[nom.getAttribute("data-i18n")]||(nom.textContent.trim()[0]||"·");
      info.insertBefore(ico,info.firstChild);
      var total=0;
      Array.prototype.forEach.call(fila.querySelectorAll(".notes-group"),function(g){
        var s=g.querySelector(".ng-title"), n=g.querySelectorAll(".notes-links a").length; total+=n;
        if(!s)return;
        g.classList.add("ng-"+tipo(s.getAttribute("data-i18n")||""));
        var i=document.createElement("span"); i.className="ng-ico"; i.innerHTML=svg(ICO[tipo(s.getAttribute("data-i18n")||"")]);
        s.insertBefore(i,s.firstChild);
        if(n){var c=document.createElement("span"); c.className="ng-count"; c.setAttribute("aria-hidden","true"); c.textContent=n; s.appendChild(c);}
        Array.prototype.forEach.call(g.querySelectorAll(".notes-links a"),function(a){
          var t=a.getAttribute("title"); if(!t||a.querySelector(".nl-desc"))return;
          var d=document.createElement("small"); d.className="nl-desc"; d.textContent=corta(t.replace(/^[^:]*:\s*/,function(m){return m.length<45?"":m;}),92);
          a.appendChild(d);
          if(/\.pdf(\?|#|$)/i.test(a.getAttribute("href")||""))a.classList.add("es-pdf"); else a.classList.add("es-web");
        });
      });
      if(total){
        var t=document.createElement("span"); t.className="course-total";
        t.innerHTML='<b>'+total+'</b> <span data-es="materiales" data-en="materials">'+(document.documentElement.lang==="en"?"materials":"materiales")+'</span>';
        info.appendChild(t);
      }
      /* accesos destacados: lo interactivo (libros web, diapositivas, quiz) */
      var web=Array.prototype.filter.call(fila.querySelectorAll(".notes-links a"),function(a){
        var h=a.getAttribute("href")||""; return !/\.pdf(\?|#|$)/i.test(h)&&!/^https?:/i.test(h)&&h.indexOf("#")<0;
      });
      if(web.length){
        var dest=document.createElement("div"); dest.className="course-destacados";
        web.slice(0,4).forEach(function(a){
          var b=document.createElement("a"); b.href=a.getAttribute("href"); b.className="dest";
          var lab=a.querySelector("span[data-i18n]"); var txt=lab?lab.textContent:a.textContent;
          var k=(lab&&lab.getAttribute("data-i18n"))||"";
          b.innerHTML=svg(/quiz/.test(k)?ICO.quiz:/diapos/.test(k)?ICO.diapos:ICO.libro)+'<span></span>';
          b.lastChild.textContent=txt.trim();
          if(lab){b.lastChild.setAttribute("data-i18n",k);}
          dest.appendChild(b);
        });
        info.appendChild(dest);
      }
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function(btn){btn.addEventListener("click",function(){
      setTimeout(function(){var en=document.documentElement.lang==="en";
        document.querySelectorAll(".course-total span[data-es]").forEach(function(s){s.textContent=en?s.getAttribute("data-en"):s.getAttribute("data-es");});},30);});});
  }
  if(document.readyState!=="loading") inicia(); else document.addEventListener("DOMContentLoaded",inicia);
})();

/* ---------- Cursos v3: «Lo más reciente», cursos anteriores compactos, sin duplicados ---------- */
(function(){
  "use strict";
  function en(){return document.documentElement.lang==="en";}
  function hace(iso){
    var d=Math.floor((Date.now()-new Date(iso).getTime())/864e5);
    if(d<=0)return en()?"today":"hoy"; if(d===1)return en()?"yesterday":"ayer";
    if(d<7)return en()?d+" days ago":"hace "+d+" días";
    var s=Math.round(d/7); if(d<31)return en()?(s===1?"1 week ago":s+" weeks ago"):(s===1?"hace 1 semana":"hace "+s+" semanas");
    var m=Math.round(d/30); return en()?(m===1?"1 month ago":m+" months ago"):(m===1?"hace 1 mes":"hace "+m+" meses");
  }
  function inicia(){
    var zona=document.querySelector(".cursos-zona"); if(!zona||!document.querySelector(".course-row"))return;
    document.documentElement.classList.add("cursos-v3");
    /* 1. lo que ya está como botón destacado no se repite dentro del grupo */
    Array.prototype.forEach.call(document.querySelectorAll(".course-row"),function(fila){
      var dest=Array.prototype.map.call(fila.querySelectorAll(".course-destacados .dest"),function(b){return b.getAttribute("href");});
      Array.prototype.forEach.call(fila.querySelectorAll(".notes-group"),function(g){
        var n=0;
        Array.prototype.forEach.call(g.querySelectorAll(".notes-links a"),function(a){
          if(dest.indexOf(a.getAttribute("href"))>=0)a.classList.add("es-promovido"); else n++;
        });
        var c=g.querySelector(".ng-count"); if(c)c.textContent=n;
        if(!n)g.classList.add("ng-vacio");
      });
    });
    /* 2. cursos anteriores: compactos y plegados cuando hay cursos actuales */
    Array.prototype.forEach.call(document.querySelectorAll(".course-card"),function(card){
      var lista=card.querySelector(".course-list"); if(!lista)return;
      var filas=Array.prototype.slice.call(lista.querySelectorAll(":scope > .course-row"));
      var viejas=filas.filter(function(f){return f.querySelector(".course-status.is-archive");});
      viejas.forEach(function(f){f.classList.add("es-anterior");});
      if(!viejas.length||viejas.length===filas.length)return;
      var d=document.createElement("details"); d.className="cursos-anteriores";
      d.innerHTML='<summary><span data-es="Cursos anteriores" data-en="Previous courses">'+(en()?"Previous courses":"Cursos anteriores")+'</span> <b>'+viejas.length+'</b></summary>';
      var cont=document.createElement("div"); cont.className="course-list"; d.appendChild(cont);
      viejas.forEach(function(f){cont.appendChild(f);});
      lista.parentNode.insertBefore(d,lista.nextSibling);
    });
    var input=document.getElementById("course-search");
    if(input)input.addEventListener("input",function(){
      var q=input.value.trim();
      Array.prototype.forEach.call(document.querySelectorAll(".cursos-anteriores"),function(d){
        var hay=d.querySelector(".course-row:not([hidden])"); d.open=!!q&&!!hay; d.hidden=!!q&&!hay;});
    });
    /* 3. la nota de los PDF pasa a un ícono de ayuda junto al buscador */
    var nota=document.querySelector(".course-download-note"), lab=document.querySelector(".course-search label");
    if(nota&&lab){var i=document.createElement("span");i.className="ayuda-pdf";i.tabIndex=0;i.textContent="i";
      i.setAttribute("title",nota.textContent.replace(/^[^A-Za-zÁÉÍÓÚáéíóúÑñ]+/,"")); i.setAttribute("aria-label",i.getAttribute("title")); lab.appendChild(i);}
    /* 4. «Lo más reciente» */
    fetch("assets/recientes.json?v="+Date.now().toString().slice(0,7)).then(function(r){return r.json();}).then(function(L){
      var tarjetas=[];
      L.forEach(function(it){
        var a=document.querySelector('.course-row .notes-links a[href="'+it.href+'"]'); if(!a)return;
        var fila=a.closest(".course-row"), lab=a.querySelector("span[data-i18n]"), ico=fila.querySelector(".course-ico");
        var card=fila.closest(".course-card");
        var x=document.createElement("a"); x.className="reciente"; x.href=it.href;
        if(/\.pdf/.test(it.href)){x.target="_blank";x.rel="noopener";}
        x.setAttribute("style",fila.getAttribute("style")||"");
        x.innerHTML='<span class="r-ico"></span><span class="r-txt"><b></b><small></small></span><time></time>';
        x.querySelector(".r-ico").textContent=ico?ico.textContent:"·";
        x.querySelector("b").textContent=(lab?lab.textContent:a.textContent).trim();
        x.querySelector("small").textContent=fila.querySelector(".cname").textContent.replace(/\s*·\s*Código.*$/,"");
        x.querySelector("time").textContent=hace(it.fecha); x.querySelector("time").setAttribute("datetime",it.fecha);
        x.setAttribute("data-inst",card?card.id:"");
        tarjetas.push(x);
      });
      if(!tarjetas.length)return;
      var sec=document.createElement("section"); sec.className="recientes";
      sec.innerHTML='<h2><span data-es="Lo más reciente" data-en="Latest materials">'+(en()?"Latest materials":"Lo más reciente")+'</span></h2><div class="recientes-fila"></div>';
      tarjetas.forEach(function(t){sec.querySelector(".recientes-fila").appendChild(t);});
      var grid=zona.querySelector(".course-grid"); zona.insertBefore(sec,grid);
    }).catch(function(){});
    document.querySelectorAll("[data-lang-btn]").forEach(function(btn){btn.addEventListener("click",function(){setTimeout(function(){
      document.querySelectorAll(".cursos-v3 [data-es]").forEach(function(s){s.textContent=en()?s.getAttribute("data-en"):s.getAttribute("data-es");});
      document.querySelectorAll(".reciente time").forEach(function(t){t.textContent=hace(t.getAttribute("datetime"));});},40);});});
  }
  if(document.readyState!=="loading") inicia(); else document.addEventListener("DOMContentLoaded",inicia);
})();

/* ---------- Cursos: íconos ilustrados (SVG) para cada materia ---------- */
(function(){
  "use strict";
  var F='fill="currentColor" fill-opacity=".16" stroke="none"';
  var D={
    "courses.calc1":'<path d="M4 27h24M6 29V4"/><path d="M6 23c5 0 7-14 12-14s5 6 9 6"/><circle cx="18" cy="9" r="1.8" fill="var(--paper,#fff)"/><path d="M18 13v-1.5M18 27v-9" stroke-dasharray="1.5 2"/>',
    "courses.discrete1":'<path d="M7 8l9 -3 9 5-2 10-11 6-6-9z" '+F+'/><path d="M7 8l9-3 9 5M7 8l-1 9 6 9 11-6 2-10M16 5l-4 21M6 17l17 3M16 5l7 15"/><g fill="currentColor" stroke="none"><circle cx="7" cy="8" r="2.2"/><circle cx="16" cy="5" r="2.2"/><circle cx="25" cy="10" r="2.2"/><circle cx="23" cy="20" r="2.2"/><circle cx="12" cy="26" r="2.2"/><circle cx="6" cy="17" r="2.2"/></g>',
    "courses.discrete2":'<path d="M16 6v6M16 12l-8 7M16 12l8 7M8 19l-3 7M8 19l3 7M24 19v7"/><g fill="currentColor" stroke="none"><circle cx="16" cy="5" r="2.4"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="19" r="2"/><circle cx="24" cy="19" r="2"/><circle cx="5" cy="26" r="2"/><circle cx="11" cy="26" r="2"/><circle cx="24" cy="26" r="2"/></g>',
    "courses.discrete3":'<path d="M13 8a8 8 0 1 0 0 16 8 8 0 0 0 0-16" /><circle cx="19" cy="16" r="8"/><path d="M16 9.6a8 8 0 0 1 0 12.8 8 8 0 0 1 0-12.8z" fill="currentColor" fill-opacity=".35" stroke="none"/>',
    "courses.logic":'<path d="M5 9h7M5 23h7M12 5v22h5a11 11 0 0 0 0-22z" /><path d="M12 5v22h5a11 11 0 0 0 0-22z" '+F+'/><path d="M28 16h-1"/><circle cx="26" cy="16" r="0"/><path d="M28 16h0"/>',
    "courses.numerical":'<path d="M4 27h24"/><path d="M5 25C11 25 15 21 18 14s5-9 9-10"/><path d="M26 5l-4 22M22 27l-2-11M20 16l-2 11" stroke-dasharray="1.6 1.8"/><g fill="currentColor" stroke="none"><circle cx="26" cy="5" r="1.8"/><circle cx="20" cy="16" r="1.8"/><circle cx="18.2" cy="20" r="1.8"/></g>',
    "courses.analysis2":'<path d="M3 16h26" stroke-opacity=".4"/><path d="M3 16c2-8 4-8 6 0s4 8 6 0 4-8 6 0 4 8 6 0"/><path d="M3 16c1.3-4 2.7-4 4 0s2.7 4 4 0 2.7-4 4 0 2.7 4 4 0 2.7-4 4 0 2.7 4 4 0" stroke-opacity=".45"/>',
    "courses.geometry":'<path d="M16 4L4 26h24z" '+F+'/><path d="M16 4L4 26h24z"/><circle cx="16" cy="18.4" r="6.6"/><path d="M16 26V4" stroke-dasharray="1.5 2" stroke-opacity=".6"/><circle cx="16" cy="18.4" r="1.3" fill="currentColor" stroke="none"/>',
    "courses.calcdif":'<path d="M4 27h24M6 29V4"/><path d="M7 24c6-1 9-12 13-14 3-1.5 5 0 7 2"/><path d="M9 22L29 6" stroke-opacity=".7"/><circle cx="19" cy="10.4" r="2" fill="currentColor" stroke="none"/>',
    "courses.geovec":'<path d="M8 22V5M8 22l17 0M8 22l-5 6" stroke-opacity=".55"/><path d="M8 22l14-11"/><path d="M22 11l-5.2.6M22 11l-2.2 4.8"/><path d="M22 11v11M22 22h-14" stroke-dasharray="1.4 1.8" stroke-opacity=".6"/><circle cx="22" cy="11" r="1.6" fill="currentColor" stroke="none"/>',
    "courses.calcint":'<path d="M4 27h24"/><path d="M7 27v-9h4v-5h4v-3h4v1h4v4h3v12z" '+F+'/><path d="M7 27v-9h4v-5h4v-3h4v1h4v4h3v12" stroke-opacity=".55"/><path d="M5 21c5-12 12-14 16-11s5 6 7 8"/>',
    "courses.algebra":'<path d="M6 6l20 4-4 16-20-4z" '+F+'/><path d="M6 6l20 4-4 16-20-4zM16 8l-4 16M4 14l20 4"/><path d="M9 4H6v24h3M23 4h3v24h-3" stroke-opacity="0"/>',
    "courses.calc-combo":'<ellipse cx="16" cy="16" rx="12" ry="8"/><ellipse cx="16" cy="16" rx="8" ry="5" stroke-opacity=".75"/><ellipse cx="16" cy="16" rx="4" ry="2.4" '+F+'/><ellipse cx="16" cy="16" rx="4" ry="2.4"/><path d="M16 16l9-9" stroke-opacity=".8"/><path d="M25 7l-4.6.6M25 7l-.6 4.6"/>',
    "courses.math226":'<path d="M3 24c2 0 3-8 6.5-8S13 24 16 24s3-8 6.5-8S26 24 29 24"/><circle cx="9.5" cy="16" r="4" stroke-opacity=".5"/><circle cx="9.5" cy="16" r="1.2" fill="currentColor" stroke="none"/>',
    "courses.math227":'<path d="M16 3v26M3 16h26" stroke-opacity=".3"/><circle cx="16" cy="16" r="11" stroke-opacity=".3" stroke-dasharray="1.5 2"/><path d="M27.0 16.0 L27.0 15.8 L26.9 15.6 L26.8 15.4 L26.7 15.2 L26.6 15.1 L26.4 14.9 L26.2 14.7 L26.0 14.6 L25.7 14.5 L25.4 14.3 L25.1 14.2 L24.7 14.1 L24.3 14.1 L23.9 14.0 L23.5 14.0 L23.1 14.0 L22.6 14.0 L22.1 14.0 L21.7 14.0 L21.2 14.1 L20.7 14.2 L20.1 14.3 L19.6 14.5 L19.1 14.6 L18.6 14.8 L18.1 15.0 L17.5 15.2 L17.0 15.5 L16.5 15.7 L16.0 16.0 L15.5 16.3 L15.0 16.6 L14.6 16.9 L14.1 17.3 L13.7 17.6 L13.2 18.0 L12.9 18.4 L12.5 18.8 L12.1 19.1 L11.8 19.5 L11.5 19.9 L11.2 20.3 L10.9 20.7 L10.7 21.1 L10.5 21.5 L10.3 21.9 L10.2 22.3 L10.0 22.6 L9.9 23.0 L9.9 23.3 L9.8 23.6 L9.8 23.9 L9.8 24.2 L9.9 24.5 L9.9 24.7 L10.0 24.9 L10.1 25.1 L10.2 25.3 L10.3 25.4 L10.5 25.5 L10.7 25.6 L10.9 25.7 L11.1 25.7 L11.3 25.7 L11.5 25.6 L11.7 25.6 L12.0 25.5 L12.2 25.3 L12.5 25.2 L12.7 25.0 L13.0 24.7 L13.2 24.5 L13.5 24.2 L13.7 23.9 L14.0 23.5 L14.2 23.1 L14.4 22.7 L14.7 22.3 L14.9 21.9 L15.0 21.4 L15.2 20.9 L15.4 20.4 L15.5 19.9 L15.6 19.4 L15.8 18.8 L15.8 18.3 L15.9 17.7 L16.0 17.1 L16.0 16.6 L16.0 16.0 L16.0 15.4 L16.0 14.9 L15.9 14.3 L15.8 13.7 L15.8 13.2 L15.6 12.6 L15.5 12.1 L15.4 11.6 L15.2 11.1 L15.0 10.6 L14.9 10.1 L14.7 9.7 L14.4 9.3 L14.2 8.9 L14.0 8.5 L13.7 8.1 L13.5 7.8 L13.2 7.5 L13.0 7.3 L12.7 7.0 L12.5 6.8 L12.2 6.7 L12.0 6.5 L11.7 6.4 L11.5 6.4 L11.3 6.3 L11.1 6.3 L10.9 6.3 L10.7 6.4 L10.5 6.5 L10.3 6.6 L10.2 6.7 L10.1 6.9 L10.0 7.1 L9.9 7.3 L9.9 7.5 L9.8 7.8 L9.8 8.1 L9.8 8.4 L9.9 8.7 L9.9 9.0 L10.0 9.4 L10.2 9.7 L10.3 10.1 L10.5 10.5 L10.7 10.9 L10.9 11.3 L11.2 11.7 L11.5 12.1 L11.8 12.5 L12.1 12.9 L12.5 13.2 L12.9 13.6 L13.2 14.0 L13.7 14.4 L14.1 14.7 L14.6 15.1 L15.0 15.4 L15.5 15.7 L16.0 16.0 L16.5 16.3 L17.0 16.5 L17.5 16.8 L18.1 17.0 L18.6 17.2 L19.1 17.4 L19.6 17.5 L20.1 17.7 L20.7 17.8 L21.2 17.9 L21.7 18.0 L22.1 18.0 L22.6 18.0 L23.1 18.0 L23.5 18.0 L23.9 18.0 L24.3 17.9 L24.7 17.9 L25.1 17.8 L25.4 17.7 L25.7 17.5 L26.0 17.4 L26.2 17.3 L26.4 17.1 L26.6 16.9 L26.7 16.8 L26.8 16.6 L26.9 16.4 L27.0 16.2 L27.0 16.0Z" '+F+'/><path d="M27.0 16.0 L27.0 15.8 L26.9 15.6 L26.8 15.4 L26.7 15.2 L26.6 15.1 L26.4 14.9 L26.2 14.7 L26.0 14.6 L25.7 14.5 L25.4 14.3 L25.1 14.2 L24.7 14.1 L24.3 14.1 L23.9 14.0 L23.5 14.0 L23.1 14.0 L22.6 14.0 L22.1 14.0 L21.7 14.0 L21.2 14.1 L20.7 14.2 L20.1 14.3 L19.6 14.5 L19.1 14.6 L18.6 14.8 L18.1 15.0 L17.5 15.2 L17.0 15.5 L16.5 15.7 L16.0 16.0 L15.5 16.3 L15.0 16.6 L14.6 16.9 L14.1 17.3 L13.7 17.6 L13.2 18.0 L12.9 18.4 L12.5 18.8 L12.1 19.1 L11.8 19.5 L11.5 19.9 L11.2 20.3 L10.9 20.7 L10.7 21.1 L10.5 21.5 L10.3 21.9 L10.2 22.3 L10.0 22.6 L9.9 23.0 L9.9 23.3 L9.8 23.6 L9.8 23.9 L9.8 24.2 L9.9 24.5 L9.9 24.7 L10.0 24.9 L10.1 25.1 L10.2 25.3 L10.3 25.4 L10.5 25.5 L10.7 25.6 L10.9 25.7 L11.1 25.7 L11.3 25.7 L11.5 25.6 L11.7 25.6 L12.0 25.5 L12.2 25.3 L12.5 25.2 L12.7 25.0 L13.0 24.7 L13.2 24.5 L13.5 24.2 L13.7 23.9 L14.0 23.5 L14.2 23.1 L14.4 22.7 L14.7 22.3 L14.9 21.9 L15.0 21.4 L15.2 20.9 L15.4 20.4 L15.5 19.9 L15.6 19.4 L15.8 18.8 L15.8 18.3 L15.9 17.7 L16.0 17.1 L16.0 16.6 L16.0 16.0 L16.0 15.4 L16.0 14.9 L15.9 14.3 L15.8 13.7 L15.8 13.2 L15.6 12.6 L15.5 12.1 L15.4 11.6 L15.2 11.1 L15.0 10.6 L14.9 10.1 L14.7 9.7 L14.4 9.3 L14.2 8.9 L14.0 8.5 L13.7 8.1 L13.5 7.8 L13.2 7.5 L13.0 7.3 L12.7 7.0 L12.5 6.8 L12.2 6.7 L12.0 6.5 L11.7 6.4 L11.5 6.4 L11.3 6.3 L11.1 6.3 L10.9 6.3 L10.7 6.4 L10.5 6.5 L10.3 6.6 L10.2 6.7 L10.1 6.9 L10.0 7.1 L9.9 7.3 L9.9 7.5 L9.8 7.8 L9.8 8.1 L9.8 8.4 L9.9 8.7 L9.9 9.0 L10.0 9.4 L10.2 9.7 L10.3 10.1 L10.5 10.5 L10.7 10.9 L10.9 11.3 L11.2 11.7 L11.5 12.1 L11.8 12.5 L12.1 12.9 L12.5 13.2 L12.9 13.6 L13.2 14.0 L13.7 14.4 L14.1 14.7 L14.6 15.1 L15.0 15.4 L15.5 15.7 L16.0 16.0 L16.5 16.3 L17.0 16.5 L17.5 16.8 L18.1 17.0 L18.6 17.2 L19.1 17.4 L19.6 17.5 L20.1 17.7 L20.7 17.8 L21.2 17.9 L21.7 18.0 L22.1 18.0 L22.6 18.0 L23.1 18.0 L23.5 18.0 L23.9 18.0 L24.3 17.9 L24.7 17.9 L25.1 17.8 L25.4 17.7 L25.7 17.5 L26.0 17.4 L26.2 17.3 L26.4 17.1 L26.6 16.9 L26.7 16.8 L26.8 16.6 L26.9 16.4 L27.0 16.2 L27.0 16.0Z"/>',
    "courses.math224":'<path d="M4 27h24"/><path d="M5 23c5-1 7-13 12-13s7 9 10 9"/><path d="M17 27V10" stroke-dasharray="1.5 2" stroke-opacity=".6"/><path d="M5 23c5-1 7-13 12-13v17H5z" '+F+'/>',
    "courses.math147":'<path d="M4 27h24"/><g '+F+'><rect x="6" y="22" width="3" height="5"/><rect x="10" y="15" width="3" height="12"/><rect x="14" y="9" width="3" height="18"/><rect x="18" y="12" width="3" height="15"/><rect x="22" y="20" width="3" height="7"/></g><path d="M4 26c5 0 6-17 12-17s7 17 12 17"/>'
  };
  function svg(k){var p=D[k]; if(!p)return null;
    return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
  function aplica(){
    Array.prototype.forEach.call(document.querySelectorAll(".course-row"),function(f){
      var n=f.querySelector(".cname"), i=f.querySelector(".course-ico"); if(!n||!i||i.querySelector("svg"))return;
      var s=svg(n.getAttribute("data-i18n")); if(s){i.innerHTML=s;i.classList.add("con-svg");}
    });
    Array.prototype.forEach.call(document.querySelectorAll(".reciente"),function(r){
      var a=document.querySelector('.course-row .notes-links a[href="'+r.getAttribute("href")+'"]');
      var n=a&&a.closest(".course-row").querySelector(".cname"), i=r.querySelector(".r-ico");
      if(n&&i&&!i.querySelector("svg")){var s=svg(n.getAttribute("data-i18n")); if(s){i.innerHTML=s;i.classList.add("con-svg");}}
    });
  }
  function inicia(){aplica(); var z=document.querySelector(".cursos-zona");
    if(z&&window.MutationObserver){var o=new MutationObserver(aplica); o.observe(z,{childList:true}); setTimeout(function(){o.disconnect();},8000);}}
  if(document.readyState!=="loading") setTimeout(inicia,0); else document.addEventListener("DOMContentLoaded",function(){setTimeout(inicia,0);});
})();
