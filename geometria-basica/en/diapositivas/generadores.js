/* Generadores de preguntas nuevas para el quiz de cada semana.
   Cada generador devuelve {e: enunciado, o: [opciones], c: índice correcto, x: explicación}.
   Las fórmulas van en HTML sencillo (sin KaTeX) para poder crearlas en el navegador. */
var GENERADORES = (function () {
  'use strict';
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(L) { return L[Math.floor(Math.random() * L.length)]; }
  function mezcla(L) { L = L.slice(); for (var i = L.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = L[i]; L[i] = L[j]; L[j] = t; } return L; }
  /* arma la pregunta: correcta + distractores distintos, en orden aleatorio */
  function Q(e, correcta, distr, x) {
    var fx = function (v) { return typeof v === 'number' ? fr(+v.toFixed(2)) : String(v); };
    correcta = fx(correcta);
    var ops = [correcta];
    distr.forEach(function (d) { d = fx(d); if (ops.indexOf(d) < 0 && ops.length < 4) ops.push(d); });
    var m = /^(-?\d+(?:[.,]\d+)?)(\D*)$/.exec(String(correcta).replace('−', '-')); if (String(correcta) === 'π') m = ['π', '1', 'π'];
    for (var k = 1; ops.length < 4 && m && k < 60; k++) {
      var base = parseFloat(m[1].replace(',', '.')), paso = Math.max(1, Math.round(Math.abs(base) / 6));
      var val = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * paso; if (val <= 0 && base > 0) continue;
      var v = m[2] === 'π' ? pi(val) : fr(+val.toFixed(2)) + m[2]; if (ops.indexOf(v) < 0) ops.push(v);
    }
    var t = /^\((.*)\)$/.exec(correcta);
    for (var j = 0; ops.length < 4 && t && j < 40; j++) {
      var c = t[1].split(',').map(function (z) { return parseFloat(z); }), w = j % c.length;
      c[w] += (j % 2 ? -1 : 1) * (1 + Math.floor(j / c.length));
      var v2 = '(' + c.join(', ') + ')'; if (ops.indexOf(v2) < 0) ops.push(v2);
    }
    var mm = mezcla(ops);
    return { e: e, o: mm, c: mm.indexOf(correcta), x: x };
  }
  function VF(e, v, x) { return { e: 'True or false: ' + e, o: ['True', 'False'], c: v ? 0 : 1, x: x }; }
  function g(n) { return n + '°'; }
  var i = function (s) { return '<i>' + s + '</i>'; };
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [9, 40, 41]];
  function fr(n) { return String(n); }
  function pi(n) { n = +(+n).toFixed(2); return (n === 1 ? '' : fr(n)) + 'π'; }

  var G = {
    1: [
      function () { var p = Math.random() < .5, q = Math.random() < .5, v = !p || q;
        return Q('If ' + i('p') + ' is ' + (p ? 'true' : 'false') + ' and ' + i('q') + ' is ' + (q ? 'true' : 'false') + ', the implication ' + i('p') + ' → ' + i('q') + ' is…',
          v ? 'true' : 'false', [v ? 'false' : 'true', 'it cannot be determined', 'true and false at the same time'],
          'The implication is false only when ' + i('p') + ' is true and ' + i('q') + ' is false.'); },
      function () { var P = pick([['a number is a multiple of 6', 'it is even', 'it is not even', 'it is not a multiple of 6'], ['it rains', 'the ground gets wet', 'the ground does not get wet', 'it does not rain'], ['a number ends in 0', 'it is divisible by 5', 'it is not divisible by 5', 'it does not end in 0'], ['I study', 'I pass', 'I do not pass', 'I do not study']]);
        return Q('What is the contrapositive of “if ' + P[0] + ', then ' + P[1] + '”?', 'If ' + P[2] + ', then ' + P[3] + '.',
          ['If ' + P[1] + ', then ' + P[0] + '.', 'If ' + P[3] + ', then ' + P[2] + '.', P[0].charAt(0).toUpperCase() + P[0].slice(1) + ' and ' + P[2] + '.'],
          'The contrapositive of ' + i('p') + ' → ' + i('q') + ' is ¬' + i('q') + ' → ¬' + i('p') + '; it is equivalent to the original sentence.'); },
      function () { var S = pick([['cats', 'are black', 'is not black', 'cat', 'is black', 'are not black'], ['prime numbers', 'are odd', 'is not odd', 'prime number', 'is odd', 'are not odd'], ['students', 'arrived early', 'did not arrive early', 'student', 'arrived early', 'did not arrive early'], ['perfect squares', 'are even', 'is not even', 'perfect square', 'is even', 'are not even']]);
        return Q('What is the negation of “all ' + S[0] + ' ' + S[1] + '”?', 'There is some ' + S[3] + ' that ' + S[2] + '.',
          ['No ' + S[3] + ' ' + S[4] + '.', 'All ' + S[0] + ' ' + S[5] + '.', 'There is some ' + S[3] + ' that ' + S[4] + '.'],
          'The negation of “for all” is “there is at least one that does not”.'); },
      function () { var U = mezcla([1, 2, 3, 4, 5, 6, 7, 8, 9]), A = U.slice(0, 4).sort(function (a, b) { return a - b; }), B = U.slice(2, 6).sort(function (a, b) { return a - b; });
        var op = pick(['∩', '∪', '∖']), R;
        if (op === '∩') R = A.filter(function (x) { return B.indexOf(x) >= 0; }); else if (op === '∪') R = A.concat(B.filter(function (x) { return A.indexOf(x) < 0; })); else R = A.filter(function (x) { return B.indexOf(x) < 0; });
        R.sort(function (a, b) { return a - b; });
        var f = function (L) { return '{' + L.join(', ') + '}'; };
        var I = A.filter(function (x) { return B.indexOf(x) >= 0; }), Un = A.concat(B.filter(function (x) { return A.indexOf(x) < 0; })).sort(function (a, b) { return a - b; }), D = B.filter(function (x) { return A.indexOf(x) < 0; });
        return Q('If ' + i('A') + ' = ' + f(A) + ' and ' + i('B') + ' = ' + f(B) + ', what is ' + i('A') + ' ' + op + ' ' + i('B') + '?', f(R), [f(I), f(Un), f(D), f(A.filter(function (x) { return B.indexOf(x) < 0; }))],
          op === '∩' ? 'The elements that are in both.' : op === '∪' ? 'The elements that are in at least one of the two.' : 'The elements of ' + i('A') + ' that are not in ' + i('B') + '.'); }
    ],
    2: [
      function () { var a = pick([2, 3, 5]), b = a * pick([2, 3]), m = [a * ri(1, 4), a * ri(5, 9)];
        var cx = a; while (cx % b === 0) cx += a; var ex = []; for (var k = 1; ex.length < 3; k++) if ((b * k) !== cx) ex.push(b * k);
        return Q('Which is a counterexample to “every multiple of ' + a + ' is a multiple of ' + b + '”?', cx, ex,
          cx + ' is a multiple of ' + a + ' but not of ' + b + '. (The others do satisfy the statement: they do not disprove it.)'); },
      function () { var L = [['There are infinitely many primes.', 'Proof by contradiction'], ['If ' + i('n') + '² is odd, then ' + i('n') + ' is odd.', 'Contrapositive'], ['For every integer ' + i('n') + ', ' + i('n') + '² + ' + i('n') + ' is even.', 'Proof by cases'], ['The sum of two even numbers is even.', 'Direct proof'], ['√3 is not rational.', 'Proof by contradiction'], ['The equation 3' + i('x') + ' + 1 = 7 has a unique solution.', 'Existence and uniqueness']];
        var s = pick(L);
        return Q('Which method is the most natural to prove: “' + s[0] + '”?', s[1], mezcla(['Proof by contradiction', 'Contrapositive', 'Proof by cases', 'Direct proof', 'Existence and uniqueness']).filter(function (x) { return x !== s[1]; }),
          'It is the method the book uses for that kind of statement.'); },
      function () { var a = 2 * ri(1, 20) + 1, b = 2 * ri(1, 20) + 1;
        return Q('If ' + i('a') + ' = 2' + i('m') + ' + 1 and ' + i('b') + ' = 2' + i('n') + ' + 1 (with ' + i('a') + ' = ' + a + ', ' + i('b') + ' = ' + b + '), the product ' + i('ab') + ' = ' + (a * b) + ' is…', 'odd', ['even', 'a multiple of 4', 'prime'],
          i('ab') + ' = 2(2' + i('mn') + ' + ' + i('m') + ' + ' + i('n') + ') + 1: it is always odd.'); },
      function () { var n = ri(1, 39), v = n * n + n + 41;
        return VF('since ' + i('n') + '² + ' + i('n') + ' + 41 is prime for ' + i('n') + ' = ' + n + ' (it gives ' + v + '), it is prime for every ' + i('n') + '.', false,
          'One case (or many) never proves a “for all”. With ' + i('n') + ' = 40 we get 41², which is not prime.'); }
    ],
    3: [
      function () { var a = ri(12, 78); return Q('Two angles are complementary and one measures ' + g(a) + '. What does the other measure?', g(90 - a), [g(180 - a), g(a), g(90 + a)], 'Complementary angles add up to 90°: 90 − ' + a + ' = ' + (90 - a) + '.'); },
      function () { var a = ri(20, 160); return Q('In a linear pair, one of the angles measures ' + g(a) + '. What does the other measure?', g(180 - a), [g(a), g(90 - a > 0 ? 90 - a : a + 10), g(360 - a)], 'A linear pair adds up to 180°.'); },
      function () { var p = ri(-5, 5), q = p + ri(3, 12); return Q('On the line, ' + i('P') + ' has coordinate ' + p + ' and ' + i('Q') + ' has coordinate ' + q + '. What is the coordinate of the midpoint?', fr((p + q) / 2), [fr(q - p), fr((q - p) / 2), fr(p + q)], 'The midpoint has coordinate (' + i('p') + ' + ' + i('q') + ')/2.'); },
      function () { var ab = ri(2, 15), bc = ri(2, 15); return Q(i('B') + ' is between ' + i('A') + ' and ' + i('C') + '. If ' + i('AB') + ' = ' + ab + ' and ' + i('BC') + ' = ' + bc + ', what is ' + i('AC') + '?', ab + bc, [Math.abs(ab - bc) || ab + bc + 2, ab * bc, ab + bc + 1], 'If ' + i('B') + ' is between ' + i('A') + ' and ' + i('C') + ', ' + i('AB') + ' + ' + i('BC') + ' = ' + i('AC') + '.'); },
      function () { var x = ri(10, 40), k = ri(2, 4); return Q('Two vertical angles measure (' + k + i('x') + ' − ' + ((k - 1) * x) + ')° and ' + i('x') + '°. What is ' + i('x') + '?', x, [x + 5, 2 * x, x - 5], 'Vertical angles are congruent: ' + k + i('x') + ' − ' + ((k - 1) * x) + ' = ' + i('x') + '.'); }
    ],
    4: [
      function () { var a = ri(25, 80), b = ri(25, 150 - a); return Q('Two angles of a triangle measure ' + g(a) + ' and ' + g(b) + '. What does the third one measure?', g(180 - a - b), [g(a + b), g(180 - a), g(90 - Math.abs(a - b))], '180 − ' + a + ' − ' + b + ' = ' + (180 - a - b) + '.'); },
      function () { var v = 2 * ri(10, 70); return Q('In an isosceles triangle the apex angle measures ' + g(v) + '. What does each base angle measure?', g((180 - v) / 2), [g(v), g(180 - v), g(v / 2)], 'The base angles are equal: (180 − ' + v + ')/2.'); },
      function () { var a = ri(30, 70), b = ri(30, 70); return Q('An exterior angle of a triangle measures ' + g(a + b) + ' and one of the remote interior angles measures ' + g(a) + '. What does the other remote interior angle measure?', g(b), [g(180 - a - b), g(a + b), g(180 - b)], 'The exterior angle is the sum of the two remote interior angles.'); },
      function () { var a = ri(3, 12), b = ri(3, 12); return Q('Two sides of a triangle measure ' + a + ' and ' + b + '. If the third one is an integer, what is its largest possible value?', a + b - 1, [a + b, a + b + 1, Math.max(a, b)], 'Triangle inequality: the third side is less than ' + a + ' + ' + b + ' = ' + (a + b) + '.'); },
      function () { var a = ri(3, 9), b = ri(3, 9), ok = ri(Math.abs(a - b) + 1, a + b - 1), malo = a + b + ri(0, 3);
        return Q('With which triple can a triangle be built?', a + ', ' + b + ', ' + ok, [a + ', ' + b + ', ' + malo, a + ', ' + b + ', ' + (a + b), '1, 2, ' + (3 + ri(0, 4)), '2, 3, ' + (5 + ri(1, 4)), '1, 1, ' + ri(2, 5)], 'Each side must be less than the sum of the other two.'); }
    ],
    5: [
      function () { var n = ri(5, 12); return Q('What is the sum of the interior angles of a convex polygon with ' + n + ' sides?', g((n - 2) * 180), [g(n * 180), g((n - 1) * 180), g(360)], '(' + n + ' − 2)·180 = ' + ((n - 2) * 180) + '.'); },
      function () { var n = ri(5, 14); return Q('How many diagonals are there in a polygon with ' + n + ' sides?', n * (n - 3) / 2, [n * (n - 3), n - 3, n * (n - 1) / 2], i('n') + '(' + i('n') + ' − 3)/2 = ' + n + '·' + (n - 3) + '/2.'); },
      function () { var n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]); return Q('Each exterior angle of a regular polygon measures ' + fr(360 / n) + '°. How many sides does it have?', n, [n + 2, n - 1, 2 * n], 'The exterior angles add up to 360°: 360/' + fr(360 / n) + ' = ' + n + '.'); },
      function () { var n = pick([5, 6, 8, 9, 10, 12]); return Q('What is the measure of each interior angle of a regular polygon with ' + n + ' sides?', fr((n - 2) * 180 / n) + '°', [fr(360 / n) + '°', fr((n - 2) * 180) + '°', fr(180 - (n - 2) * 180 / n + 10) + '°'], '(' + n + ' − 2)·180/' + n + '.'); },
      function () { var L = [['rectangle', 'Its diagonals are congruent.'], ['rhombus', 'Its diagonals are perpendicular.'], ['square', 'Its diagonals are congruent and perpendicular.']]; var s = pick(L);
        return Q('A parallelogram is a ' + s[0] + ' exactly when…', s[1], ['Its diagonals bisect each other.', 'It has a pair of parallel sides.'].concat(L.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; })), 'Every parallelogram has diagonals that bisect each other; what distinguishes the ' + s[0] + ' is this.'); }
    ],
    6: [
      function () { var c = 2 * ri(3, 20); return Q('In a triangle, ' + i('M') + ' and ' + i('N') + ' are midpoints of two sides and the third side measures ' + c + '. What is ' + i('MN') + '?', c / 2, [c, 2 * c, c / 4], 'The midsegment measures half the third side.'); },
      function () { var a = ri(4, 15), b = a + 2 * ri(1, 8); return Q('The bases of a trapezoid measure ' + a + ' and ' + b + '. What is the length of the midsegment?', (a + b) / 2, [a + b, b - a, (b - a) / 2], '(' + a + ' + ' + b + ')/2.'); },
      function () { var m = 3 * ri(3, 12); return Q('A median measures ' + m + '. How long is the part from the vertex to the centroid?', 2 * m / 3, [m / 3, m / 2, m], 'The centroid is 2/3 of the way along the median from the vertex.'); },
      function () { var m = 3 * ri(3, 12); return Q('A median measures ' + m + '. How far is the centroid from the side (midpoint)?', m / 3, [2 * m / 3, m / 2, m / 4], 'The ratio is 2 : 1, so from the centroid to the midpoint there is 1/3.'); },
      function () { var n = pick([6, 8, 10, 12]); return Q('What is the central angle of a regular polygon with ' + n + ' sides?', g(360 / n), [g((n - 2) * 180 / n), g(180 / n), g(360 / n + 10)], '360/' + n + '.'); }
    ],
    7: [
      function () { var b = ri(4, 16), h = 2 * ri(2, 9); return Q('A triangle has base ' + b + ' and height ' + h + '. What is its area?', b * h / 2, [b * h, b + h, 2 * b * h], '½·' + b + '·' + h + '.'); },
      function () { var a = ri(3, 10), b = a + 2 * ri(1, 6), h = ri(2, 9); return Q('A trapezoid has bases ' + a + ' and ' + b + ' and height ' + h + '. What is its area?', (a + b) * h / 2, [(a + b) * h, a * b * h / 2, (b - a) * h], '(' + a + ' + ' + b + ')/2 · ' + h + '.'); },
      function () { var b = ri(5, 14), l = ri(4, 9), h = ri(2, l - 1); return Q('A parallelogram has sides ' + b + ' and ' + l + ', and the height on the side ' + b + ' is ' + h + '. What is its area?', b * h, [b * l, b * h / 2, l * h], 'Base times height. The side ' + l + ' is not the height.'); },
      function () { var k = ri(2, 5), ad = ri(2, 6), db = ri(2, 6), ae = ad * k, ec = db * k;
        return Q('In △' + i('ABC') + ', ' + i('DE') + ' ∥ ' + i('BC') + '. If ' + i('AD') + ' = ' + ad + ', ' + i('DB') + ' = ' + db + ' and ' + i('AE') + ' = ' + ae + ', what is ' + i('EC') + '?', ec, [ae + db - ad, ae, ad * db], 'Thales: ' + i('AD') + '/' + i('DB') + ' = ' + i('AE') + '/' + i('EC') + '.'); },
      function () { var d1 = 2 * ri(2, 9), d2 = ri(3, 12); return Q('The diagonals of a rhombus measure ' + d1 + ' and ' + d2 + '. What is its area?', d1 * d2 / 2, [d1 * d2, d1 + d2, d1 * d2 / 4], i('d') + '₁' + i('d') + '₂/2.'); }
    ],
    8: [
      function () { var t = pick(TRIPLES), k = ri(1, 3); return Q('The legs of a right triangle measure ' + t[0] * k + ' and ' + t[1] * k + '. What is the hypotenuse?', t[2] * k, [(t[0] + t[1]) * k, t[2] * k + 1, t[1] * k + 1], '√(' + (t[0] * k) + '² + ' + (t[1] * k) + '²) = ' + (t[2] * k) + '.'); },
      function () { var t = pick(TRIPLES); return Q('The hypotenuse of a right triangle measures ' + t[2] + ' and one leg ' + t[0] + '. What is the other leg?', t[1], [t[2] - t[0], t[1] + 1, t[2] + t[0]], '√(' + t[2] + '² − ' + t[0] + '²).'); },
      function () { var k = ri(2, 5), A = ri(2, 9); return Q('Two similar triangles have similarity ratio ' + k + '. If the area of the smaller one is ' + A + ', what is the area of the larger one?', A * k * k, [A * k, A * k * k * k, A + k], 'The areas are in the ratio ' + k + '² = ' + (k * k) + '.'); },
      function () { var b = ri(2, 6), c = ri(2, 6), s = ri(2, 4); var BD = b * s, DC = c * s;
        return Q('The angle bisector from ' + i('A') + ' meets ' + i('BC') + ' at ' + i('D') + '. If ' + i('AB') + ' = ' + (b * 3) + ', ' + i('AC') + ' = ' + (c * 3) + ' and ' + i('BC') + ' = ' + (BD + DC) + ', what is ' + i('BD') + '?', BD, [DC === BD ? BD + 1 : DC, (BD + DC) / 2, BD + 2], i('BD') + '/' + i('DC') + ' = ' + i('AB') + '/' + i('AC') + '.'); },
      function () { var t = pick(TRIPLES), ok = Math.random() < .5, c = ok ? t[2] : t[2] + 1;
        return VF('a triangle with sides ' + t[0] + ', ' + t[1] + ' and ' + c + ' is a right triangle.', ok, t[0] + '² + ' + t[1] + '² = ' + (t[0] * t[0] + t[1] * t[1]) + (ok ? ' = ' : ' ≠ ') + c + '² = ' + (c * c) + '.'); }
    ],
    9: [
      function () { var a = 2 * ri(20, 85); return Q('An inscribed angle subtends an arc of ' + g(a) + '. What does it measure?', g(a / 2), [g(a), g(2 * a > 360 ? a - 10 : 2 * a), g(180 - a / 2)], 'The inscribed angle measures half the arc.'); },
      function () { var t = pick(TRIPLES); return Q('A chord measures ' + 2 * t[1] + ' and is at distance ' + t[0] + ' from the center. What is the radius?', t[2], [t[0] + t[1], 2 * t[1], t[2] + 1], 'The perpendicular from the center bisects the chord: ' + i('r') + '² = ' + t[1] + '² + ' + t[0] + '².'); },
      function () { var t = pick(TRIPLES); return Q('From a point at distance ' + t[2] + ' from the center of a circle of radius ' + t[0] + ' a tangent is drawn. How long is the tangent segment?', t[1], [t[2] - t[0], t[2] + t[0], t[1] + 2], 'The tangent is perpendicular to the radius: Pythagoras with hypotenuse ' + t[2] + '.'); },
      function () { var c = 2 * ri(20, 80); return Q('A central angle measures ' + g(c) + '. What does an inscribed angle subtending the same arc measure?', g(c / 2), [g(c), g(2 * c > 360 ? c + 10 : 2 * c), g(180 - c)], 'The inscribed angle measures half the central one.'); },
      function () { var r = ri(3, 9), d = pick([r - ri(1, r - 1), r, r + ri(1, 4)]); var res = d < r ? 'secant' : d === r ? 'tangent' : 'exterior';
        return Q('A line is at distance ' + d + ' from the center of a circle of radius ' + r + '. The line is…', res, ['secant', 'tangent', 'exterior', 'a diameter'].filter(function (x) { return x !== res; }), i('d') + ' < ' + i('r') + ': secant; ' + i('d') + ' = ' + i('r') + ': tangent; ' + i('d') + ' > ' + i('r') + ': exterior.'); }
    ],
    10: [
      function () { var a = ri(40, 140); return Q('In a cyclic quadrilateral one angle measures ' + g(a) + '. What does the opposite angle measure?', g(180 - a), [g(a), g(360 - a), g(90 - a / 2 | 0)], 'In a cyclic quadrilateral opposite angles add up to 180°.'); },
      function () { var r = ri(2, 12); return Q('What is the area of a circle of radius ' + r + '?', pi(r * r), [pi(2 * r), pi(r * r * 2), pi(r)], 'π' + i('r') + '² = ' + pi(r * r) + '. (2π' + i('r') + ' would be the circumference.)'); },
      function () { var r = ri(2, 12); return Q('What is the circumference of a circle of radius ' + r + '?', pi(2 * r), [pi(r * r), pi(r), pi(4 * r)], '2π' + i('r') + '.'); },
      function () { var r1 = ri(3, 8), r2 = ri(1, r1 - 1), op = pick(['ext', 'int', 'sec', 'fuera']); var d = op === 'ext' ? r1 + r2 : op === 'int' ? r1 - r2 : op === 'sec' ? r1 + r2 - 1 : r1 + r2 + ri(1, 3);
        var res = { ext: 'externally tangent', int: 'internally tangent', sec: 'intersecting', fuera: 'exterior to each other' }[op];
        return Q('Two circles with radii ' + r1 + ' and ' + r2 + ' have their centers at distance ' + d + '. They are…', res, ['externally tangent', 'internally tangent', 'intersecting', 'exterior to each other'].filter(function (x) { return x !== res; }), 'Compare ' + i('d') + ' with ' + i('r') + '₁ + ' + i('r') + '₂ = ' + (r1 + r2) + ' and with ' + i('r') + '₁ − ' + i('r') + '₂ = ' + (r1 - r2) + '.'); },
      function () { var r = ri(2, 10), a = pick([60, 90, 120, 180]); return Q('What is the area of a circular sector of radius ' + r + ' and angle ' + g(a) + '?', pi(r * r * a / 360), [pi(r * r), pi(r * a / 180), pi(r * r * a / 180)], 'It is the fraction ' + a + '/360 of the circle.'); }
    ],
    11: [
      function () { var P = pick([[8, 12, 6, 'cube'], [4, 6, 4, 'tetrahedron'], [6, 12, 8, 'octahedron'], [12, 30, 20, 'icosahedron'], [20, 30, 12, 'dodecahedron'], [10, 15, 7, 'pentagonal prism'], [12, 18, 8, 'hexagonal prism'], [6, 10, 6, 'pentagonal pyramid'], [7, 12, 7, 'hexagonal pyramid']]);
        return Q('A convex polyhedron has ' + P[0] + ' vertices and ' + P[1] + ' edges. How many faces does it have?', P[2], [P[2] + 2, P[1] - P[0], P[2] - 2], i('V') + ' − ' + i('E') + ' + ' + i('F') + ' = 2 ⇒ ' + i('F') + ' = 2 − ' + P[0] + ' + ' + P[1] + ' = ' + P[2] + ' (' + P[3] + ').'); },
      function () { var n = ri(3, 9); return Q('A prism whose base has ' + n + ' sides, how many edges does it have?', 3 * n, [2 * n, n + 2, 3 * n + 2], n + ' on each base and ' + n + ' lateral.'); },
      function () { var n = ri(3, 9); return Q('A pyramid whose base has ' + n + ' sides, how many faces does it have?', n + 1, [n, n + 2, 2 * n], 'The base and ' + n + ' lateral faces.'); },
      function () { var L = [['two lines that do not meet and are not parallel', 'skew'], ['two distinct planes that meet', 'a line'], ['a line perpendicular to two intersecting lines of a plane, at their intersection point', 'perpendicular to the plane'], ['two parallel planes cut by a third', 'parallel lines']], s = pick(L);
        return Q('Complete: ' + s[0] + ' → …', s[1], L.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; }), 'It is one of the results of the section on lines and planes.'); }
    ],
    12: [
      function () { var B = ri(4, 20), h = ri(2, 12); return Q('What is the volume of a prism with base area ' + B + ' and height ' + h + '?', B * h, [B * h / 3, B + h, B * h / 2], i('B h') + '.'); },
      function () { var B = 3 * ri(2, 10), h = ri(2, 12); return Q('A pyramid has base area ' + B + ' and height ' + h + '. What is its volume?', B * h / 3, [B * h, B * h / 2, B + h], '⅓·' + i('B h') + '.'); },
      function () { var r = 3 * ri(1, 3); return Q('What is the volume of a sphere of radius ' + r + '?', pi(4 * r * r * r / 3), [pi(4 * r * r), pi(r * r * r), pi(2 * r * r * r)], '⁴⁄₃π' + i('r') + '³ = ' + (4 * r * r * r / 3) + 'π. (' + (4 * r * r) + 'π is the area.)'); },
      function () { var r = ri(1, 6), h = 3 * ri(1, 4); return Q('A cone has radius ' + r + ' and height ' + h + '. What is its volume?', pi(r * r * h / 3), [pi(r * r * h), pi(r * h), pi(r * r * h / 2)], '⅓π' + i('r') + '²' + i('h') + '.'); },
      function () { var k = ri(2, 4); return Q('If the edge of a cube is multiplied by ' + k + ' , its volume is multiplied by…', k * k * k, [k, k * k, 3 * k], '(' + k + i('a') + ')³ = ' + (k * k * k) + i('a') + '³.'); },
      function () { var r = ri(1, 8); return Q('What is the surface area of a sphere of radius ' + r + '?', pi(4 * r * r), [pi(r * r), pi(Math.round(4 * r * r * r / 3) + 1), pi(2 * r * r)], '4π' + i('r') + '².'); }
    ],
    13: [
      function () { var t = pick(TRIPLES.slice(0, 5)), x = ri(-4, 4), y = ri(-4, 4), sx = pick([1, -1]), sy = pick([1, -1]);
        return Q('What is the distance between (' + x + ', ' + y + ') and (' + (x + sx * t[0]) + ', ' + (y + sy * t[1]) + ')?', t[2], [t[0] + t[1], t[2] * t[2], t[2] + 1], '√(' + t[0] + '² + ' + t[1] + '²) = ' + t[2] + '.'); },
      function () { var m = pick([-3, -2, -1, 1, 2, 3, 4]), x = ri(-4, 3), y = ri(-5, 5), d = ri(1, 3);
        return Q('What is the slope of the line through (' + x + ', ' + y + ') and (' + (x + d) + ', ' + (y + m * d) + ')?', m, [-m, m === 0 ? 1 : fr(1 / m), m + 1], 'Change in ' + i('y') + ' over change in ' + i('x') + ': ' + (m * d) + '/' + d + '.'); },
      function () { var a = ri(-6, 6), b = ri(-6, 6), c = a + 2 * ri(-4, 4), d = b + 2 * ri(-4, 4);
        return Q('What is the midpoint of (' + a + ', ' + b + ') and (' + c + ', ' + d + ')?', '(' + (a + c) / 2 + ', ' + (b + d) / 2 + ')', ['(' + (c - a) / 2 + ', ' + (d - b) / 2 + ')', '(' + (a + c) + ', ' + (b + d) + ')', '(' + (b + d) / 2 + ', ' + (a + c) / 2 + ')', '(' + ((a + c) / 2 + 1) + ', ' + ((b + d) / 2 - 1) + ')', '(' + (c - a) + ', ' + (d - b) + ')'], 'Average the coordinates.'); },
      function () { var m = pick([2, 3, -2, -3, 4]); return Q('A line has slope ' + m + '. What is the slope of a line perpendicular to it?', (m > 0 ? '−' : '') + '1/' + Math.abs(m), [String(-m), (m > 0 ? '' : '−') + '1/' + Math.abs(m), String(m)], 'The product of the slopes must be −1.'); },
      function () { var p = [ri(-3, 3), ri(-3, 3)], d = [ri(-3, 3) || 1, ri(-3, 3) || 2], t = ri(2, 3);
        return Q('The line ' + i('P') + '(' + i('t') + ') = (' + p[0] + ', ' + p[1] + ') + ' + i('t') + '(' + d[0] + ', ' + d[1] + ') passes through the point…', '(' + (p[0] + t * d[0]) + ', ' + (p[1] + t * d[1]) + ')', ['(' + d[0] + ', ' + d[1] + ')', '(' + (p[0] + t * d[1]) + ', ' + (p[1] + t * d[0]) + ')', '(' + (p[0] + d[0] + 1) + ', ' + (p[1] + d[1]) + ')'], 'With ' + i('t') + ' = ' + t + '.'); }
    ],
    14: [
      function () { var T = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9]]), k = ri(1, 2);
        return Q('What is the distance from the origin to the point (' + T[0] * k + ', ' + T[1] * k + ', ' + T[2] * k + ')?', T[3] * k, [(T[0] + T[1] + T[2]) * k, T[3] * k + 1, T[3] * T[3] * k], '√(' + (T[0] * k) + '² + ' + (T[1] * k) + '² + ' + (T[2] * k) + '²).'); },
      function () { var a = pick([-3, -2, -1, 1, 2, 3, 4]), b = pick([-3, -2, -1, 1, 2, 3]), c = ri(1, 5);
        return Q('A normal vector to the plane ' + a + i('x') + ' ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + i('y') + ' + ' + c + i('z') + ' = 7 is…', '(' + a + ', ' + b + ', ' + c + ')', ['(' + a + ', ' + b + ', 7)', '(7, 0, 0)', '(' + b + ', ' + a + ', ' + c + ')'], 'The coefficients of ' + i('x') + ', ' + i('y') + ', ' + i('z') + '.'); },
      function () { var u = [ri(-5, 5), ri(-5, 5)], v = [ri(-5, 5), ri(-5, 5)];
        return Q('If ' + i('u') + ' = (' + u + ') and ' + i('v') + ' = (' + v + '), then ' + i('u') + ' + ' + i('v') + ' is…', '(' + (u[0] + v[0]) + ', ' + (u[1] + v[1]) + ')', ['(' + (u[0] - v[0]) + ', ' + (u[1] - v[1]) + ')', '(' + (u[0] * v[0]) + ', ' + (u[1] * v[1]) + ')', '(' + (u[0] + v[1]) + ', ' + (u[1] + v[0]) + ')'], 'Add component by component.'); },
      function () { var P = [ri(-3, 4), ri(-3, 4)], Qq = [ri(-3, 4), ri(-3, 4)];
        return Q('If ' + i('P') + ' = (' + P + ') and ' + i('Q') + ' = (' + Qq + '), the vector ' + i('PQ') + ' is…', '(' + (Qq[0] - P[0]) + ', ' + (Qq[1] - P[1]) + ')', ['(' + (P[0] - Qq[0]) + ', ' + (P[1] - Qq[1]) + ')', '(' + (P[0] + Qq[0]) + ', ' + (P[1] + Qq[1]) + ')', '(' + (Qq[1] - P[1]) + ', ' + (Qq[0] - P[0]) + ')'], i('PQ') + ' = ' + i('Q') + ' − ' + i('P') + '.'); },
      function () { var a = ri(1, 3), b = ri(1, 3), c = ri(1, 3), x = ri(-2, 3), y = ri(-2, 3), z = ri(-2, 3), d = a * x + b * y + c * z, ok = Math.random() < .5;
        return VF('the point (' + x + ', ' + y + ', ' + z + ') lies in the plane ' + a + i('x') + ' + ' + b + i('y') + ' + ' + c + i('z') + ' = ' + (ok ? d : d + 1) + '.', ok, 'Substituting gives ' + d + '.'); }
    ],
    15: [
      function () { var u = [ri(-5, 5), ri(-5, 5)], v = [ri(-5, 5), ri(-5, 5)], p = u[0] * v[0] + u[1] * v[1];
        return Q('Compute (' + u + ')·(' + v + ').', p, [u[0] * v[1] + u[1] * v[0], '(' + u[0] * v[0] + ', ' + u[1] * v[1] + ')', p + 2], u[0] + '·' + v[0] + ' + ' + u[1] + '·' + v[1] + '. It is a number, not a vector.'); },
      function () { var t = pick(TRIPLES.slice(0, 5)), sx = pick([1, -1]), sy = pick([1, -1]);
        return Q('What is the norm of (' + sx * t[0] + ', ' + sy * t[1] + ')?', t[2], [t[0] + t[1], t[2] * t[2], Math.abs(sx * t[0] + sy * t[1])], '√(' + t[0] + '² + ' + t[1] + '²).'); },
      function () { var a = pick([1, 2, 3, 4]), b = a * pick([1, 2, 3]), x = ri(-4, 5) || 2;
        return Q('For which value of ' + i('x') + ' are (' + i('x') + ', ' + a + ') and (' + b + ', ' + (-b * x / a) + ') perpendicular?', x, [-x, x + 1, 2 * x], 'Zero dot product: ' + b + i('x') + ' − ' + (b * x) + ' = 0.'); },
      function () { var u = [ri(1, 4), ri(-3, 4)], k = pick([-3, -2, 2, 3]), v = [u[0] * k, u[1] * k];
        var res = k > 0 ? 'collinear with the same direction' : 'collinear with opposite directions';
        return Q('The vectors (' + u + ') and (' + v + ') are…', res, ['orthogonal', 'a basis of the plane', k > 0 ? 'collinear with opposite directions' : 'collinear with the same direction'], '(' + v + ') = ' + k + '·(' + u + ').'); },
      function () { var s = pick([[1, 'acute'], [0, 'right'], [-1, 'obtuse']]);
        return Q('If ' + i('u') + '·' + i('v') + ' ' + (s[0] > 0 ? '> 0' : s[0] < 0 ? '< 0' : '= 0') + ', the angle between ' + i('u') + ' and ' + i('v') + ' is…', s[1], ['acute', 'right', 'obtuse', 'straight'].filter(function (x) { return x !== s[1]; }), 'The sign of the dot product is the sign of cos θ.'); }
    ],
    16: [
      function () { var V = [['ı', 'ȷ', 'k'], ['ȷ', 'k', 'ı'], ['k', 'ı', 'ȷ']], s = pick(V), inv = Math.random() < .5;
        var a = inv ? s[1] : s[0], b = inv ? s[0] : s[1], r = (inv ? '−' : '') + s[2];
        return Q(a + ' × ' + b + ' equals…', r, [inv ? s[2] : '−' + s[2], '0', '1'], 'Cyclic order ı → ȷ → k → ı; reversing the order changes the sign.'); },
      function () { var a = ri(1, 5), b = ri(1, 5), c = ri(1, 4);
        return Q('What is the area of the parallelogram determined by (' + a + ', 0, 0) and (' + c + ', ' + b + ', 0)?', a * b, [a * c, a * b * c, a + b], '(' + a + ', 0, 0) × (' + c + ', ' + b + ', 0) = (0, 0, ' + (a * b) + ').'); },
      function () { var a = ri(1, 5), b = ri(1, 5), c = ri(1, 5);
        return Q('What is the volume of the parallelepiped determined by (' + a + ', 0, 0), (0, ' + b + ', 0) and (0, 0, ' + c + ')?', a * b * c, [a + b + c, a * b, a * b * c / 6], 'It is a box with sides ' + a + ', ' + b + ', ' + c + '.'); },
      function () { var a = ri(1, 4), b = ri(1, 4), c = ri(1, 4);
        return Q('What is the volume of the tetrahedron with vertices the origin, (' + a + ', 0, 0), (0, ' + b + ', 0) and (0, 0, ' + c + ')?', fr(+(a * b * c / 6).toFixed(2)), [a * b * c, fr(+(a * b * c / 2).toFixed(2)), fr(+(a * b * c / 3).toFixed(2))], '⅙ of the absolute value of the triple product.'); },
      function () { var ok = Math.random() < .5, a = ri(1, 3), b = ri(1, 3);
        return VF('the vectors (1, 0, ' + a + '), (0, 1, ' + b + ') and (1, 1, ' + (ok ? a + b : a + b + 1) + ') are coplanar.', ok, 'The third one ' + (ok ? 'is' : 'is not') + ' the sum of the first two: the triple product ' + (ok ? 'is' : 'is not') + ' zero.'); }
    ]
  };
  /* arma un quiz: 3 preguntas nuevas con datos al azar + 3 del banco, sin repetir las de la ronda anterior */
  function armar(semana, banco, previas) {
    previas = previas || [];
    var gens = mezcla(G[semana] || []).slice(0, 3).map(function (f) { var q = f(); q.nueva = true; return q; });
    var b = banco.map(function (q, k) { return { q: q, k: k }; });
    var frescas = mezcla(b.filter(function (x) { return previas.indexOf(x.k) < 0; })), viejas = mezcla(b.filter(function (x) { return previas.indexOf(x.k) >= 0; }));
    var elegidas = frescas.concat(viejas).slice(0, 6 - gens.length);
    var est = elegidas.map(function (x) {
      var orden = mezcla(x.q.o.map(function (_, j) { return j; }));
      if (x.q.o.length === 2) orden = [0, 1];       /* verdadero / falso conserva el orden */
      return { e: x.q.e, o: orden.map(function (j) { return x.q.o[j]; }), c: orden.indexOf(x.q.c), x: x.q.x, k: x.k };
    });
    return { q: mezcla(est.concat(gens)), usadas: elegidas.map(function (x) { return x.k; }) };
  }
  return { armar: armar, G: G };
})();
