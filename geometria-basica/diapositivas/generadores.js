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
  function VF(e, v, x) { return { e: 'Verdadero o falso: ' + e, o: ['Verdadero', 'Falso'], c: v ? 0 : 1, x: x }; }
  function g(n) { return n + '°'; }
  var i = function (s) { return '<i>' + s + '</i>'; };
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [9, 40, 41]];
  function fr(n) { return String(n).replace('.', ','); }
  function pi(n) { n = +(+n).toFixed(2); return (n === 1 ? '' : fr(n)) + 'π'; }

  var G = {
    1: [
      function () { var p = Math.random() < .5, q = Math.random() < .5, v = !p || q;
        return Q('Si ' + i('p') + ' es ' + (p ? 'verdadera' : 'falsa') + ' y ' + i('q') + ' es ' + (q ? 'verdadera' : 'falsa') + ', la implicación ' + i('p') + ' → ' + i('q') + ' es…',
          v ? 'verdadera' : 'falsa', [v ? 'falsa' : 'verdadera', 'no se puede saber', 'verdadera y falsa a la vez'],
          'La implicación solo es falsa cuando ' + i('p') + ' es verdadera y ' + i('q') + ' es falsa.'); },
      function () { var P = pick([['un número es múltiplo de 6', 'es par', 'no es par', 'no es múltiplo de 6'], ['llueve', 'el suelo se moja', 'el suelo no se moja', 'no llueve'], ['un número termina en 0', 'es divisible por 5', 'no es divisible por 5', 'no termina en 0'], ['estudio', 'apruebo', 'no apruebo', 'no estudio']]);
        return Q('¿Cuál es el contrarrecíproco de «si ' + P[0] + ', entonces ' + P[1] + '»?', 'Si ' + P[2] + ', entonces ' + P[3] + '.',
          ['Si ' + P[1] + ', entonces ' + P[0] + '.', 'Si ' + P[3] + ', entonces ' + P[2] + '.', P[0].charAt(0).toUpperCase() + P[0].slice(1) + ' y ' + P[2] + '.'],
          'El contrarrecíproco de ' + i('p') + ' → ' + i('q') + ' es ¬' + i('q') + ' → ¬' + i('p') + '; es equivalente a la frase original.'); },
      function () { var S = pick([['los gatos', 'son negros', 'no es negro', 'gato'], ['los números primos', 'son impares', 'no es impar', 'número primo'], ['los estudiantes', 'llegaron temprano', 'no llegó temprano', 'estudiante'], ['los cuadrados perfectos', 'son pares', 'no es par', 'cuadrado perfecto']]);
        return Q('¿Cuál es la negación de «todos ' + S[0] + ' ' + S[1] + '»?', 'Existe algún ' + S[3] + ' que ' + S[2] + '.',
          ['Ningún ' + S[3] + ' ' + S[1].replace(/^son /, 'es ').replace(/n$/, '') + '.', 'Todos ' + S[0] + ' no ' + S[1] + '.', 'Existe algún ' + S[3] + ' que ' + S[1].replace(/^son /, 'es ') + '.'],
          'La negación de «para todo» es «existe al menos uno que no».'); },
      function () { var U = mezcla([1, 2, 3, 4, 5, 6, 7, 8, 9]), A = U.slice(0, 4).sort(function (a, b) { return a - b; }), B = U.slice(2, 6).sort(function (a, b) { return a - b; });
        var op = pick(['∩', '∪', '∖']), R;
        if (op === '∩') R = A.filter(function (x) { return B.indexOf(x) >= 0; }); else if (op === '∪') R = A.concat(B.filter(function (x) { return A.indexOf(x) < 0; })); else R = A.filter(function (x) { return B.indexOf(x) < 0; });
        R.sort(function (a, b) { return a - b; });
        var f = function (L) { return '{' + L.join(', ') + '}'; };
        var I = A.filter(function (x) { return B.indexOf(x) >= 0; }), Un = A.concat(B.filter(function (x) { return A.indexOf(x) < 0; })).sort(function (a, b) { return a - b; }), D = B.filter(function (x) { return A.indexOf(x) < 0; });
        return Q('Si ' + i('A') + ' = ' + f(A) + ' y ' + i('B') + ' = ' + f(B) + ', ¿cuánto es ' + i('A') + ' ' + op + ' ' + i('B') + '?', f(R), [f(I), f(Un), f(D), f(A.filter(function (x) { return B.indexOf(x) < 0; }))],
          op === '∩' ? 'Los elementos que están en los dos.' : op === '∪' ? 'Los elementos que están en alguno de los dos.' : 'Los elementos de ' + i('A') + ' que no están en ' + i('B') + '.'); }
    ],
    2: [
      function () { var a = pick([2, 3, 5]), b = a * pick([2, 3]), m = [a * ri(1, 4), a * ri(5, 9)];
        var cx = a; while (cx % b === 0) cx += a; var ex = []; for (var k = 1; ex.length < 3; k++) if ((b * k) !== cx) ex.push(b * k);
        return Q('¿Cuál es un contraejemplo de «todo múltiplo de ' + a + ' es múltiplo de ' + b + '»?', cx, ex,
          cx + ' es múltiplo de ' + a + ' pero no de ' + b + '. (Los otros sí cumplen la afirmación: no la refutan.)'); },
      function () { var L = [['Hay infinitos números primos.', 'Reducción al absurdo'], ['Si ' + i('n') + '² es impar, entonces ' + i('n') + ' es impar.', 'Contrarrecíproco'], ['Para todo entero ' + i('n') + ', ' + i('n') + '² + ' + i('n') + ' es par.', 'Disyunción de casos'], ['La suma de dos pares es par.', 'Demostración directa'], ['√3 no es racional.', 'Reducción al absurdo'], ['La ecuación 3' + i('x') + ' + 1 = 7 tiene una única solución.', 'Existencia y unicidad']];
        var s = pick(L);
        return Q('¿Qué método es el más natural para probar: «' + s[0] + '»?', s[1], mezcla(['Reducción al absurdo', 'Contrarrecíproco', 'Disyunción de casos', 'Demostración directa', 'Existencia y unicidad']).filter(function (x) { return x !== s[1]; }),
          'Es el método que el libro usa para ese tipo de enunciado.'); },
      function () { var a = 2 * ri(1, 20) + 1, b = 2 * ri(1, 20) + 1;
        return Q('Si ' + i('a') + ' = 2' + i('m') + ' + 1 y ' + i('b') + ' = 2' + i('n') + ' + 1 (con ' + i('a') + ' = ' + a + ', ' + i('b') + ' = ' + b + '), el producto ' + i('ab') + ' = ' + (a * b) + ' es…', 'impar', ['par', 'múltiplo de 4', 'primo'],
          i('ab') + ' = 2(2' + i('mn') + ' + ' + i('m') + ' + ' + i('n') + ') + 1: siempre es impar.'); },
      function () { var n = ri(1, 39), v = n * n + n + 41;
        return VF('como ' + i('n') + '² + ' + i('n') + ' + 41 es primo para ' + i('n') + ' = ' + n + ' (da ' + v + '), es primo para todo ' + i('n') + '.', false,
          'Un caso (o muchos) nunca demuestra un «para todo». Con ' + i('n') + ' = 40 sale 41², que no es primo.'); }
    ],
    3: [
      function () { var a = ri(12, 78); return Q('Dos ángulos son complementarios y uno mide ' + g(a) + '. ¿Cuánto mide el otro?', g(90 - a), [g(180 - a), g(a), g(90 + a)], 'Complementarios suman 90°: 90 − ' + a + ' = ' + (90 - a) + '.'); },
      function () { var a = ri(20, 160); return Q('En un par lineal, uno de los ángulos mide ' + g(a) + '. ¿Cuánto mide el otro?', g(180 - a), [g(a), g(90 - a > 0 ? 90 - a : a + 10), g(360 - a)], 'Un par lineal suma 180°.'); },
      function () { var p = ri(-5, 5), q = p + ri(3, 12); return Q('En la recta, ' + i('P') + ' tiene coordenada ' + p + ' y ' + i('Q') + ' tiene coordenada ' + q + '. ¿Cuál es la coordenada del punto medio?', fr((p + q) / 2), [fr(q - p), fr((q - p) / 2), fr(p + q)], 'El punto medio tiene coordenada (' + i('p') + ' + ' + i('q') + ')/2.'); },
      function () { var ab = ri(2, 15), bc = ri(2, 15); return Q(i('B') + ' está entre ' + i('A') + ' y ' + i('C') + '. Si ' + i('AB') + ' = ' + ab + ' y ' + i('BC') + ' = ' + bc + ', ¿cuánto mide ' + i('AC') + '?', ab + bc, [Math.abs(ab - bc) || ab + bc + 2, ab * bc, ab + bc + 1], 'Si ' + i('B') + ' está entre ' + i('A') + ' y ' + i('C') + ', ' + i('AB') + ' + ' + i('BC') + ' = ' + i('AC') + '.'); },
      function () { var x = ri(10, 40), k = ri(2, 4); return Q('Dos ángulos opuestos por el vértice miden (' + k + i('x') + ' − ' + ((k - 1) * x) + ')° y ' + i('x') + '°. ¿Cuánto vale ' + i('x') + '?', x, [x + 5, 2 * x, x - 5], 'Los opuestos por el vértice son congruentes: ' + k + i('x') + ' − ' + ((k - 1) * x) + ' = ' + i('x') + '.'); }
    ],
    4: [
      function () { var a = ri(25, 80), b = ri(25, 150 - a); return Q('Dos ángulos de un triángulo miden ' + g(a) + ' y ' + g(b) + '. ¿Cuánto mide el tercero?', g(180 - a - b), [g(a + b), g(180 - a), g(90 - Math.abs(a - b))], '180 − ' + a + ' − ' + b + ' = ' + (180 - a - b) + '.'); },
      function () { var v = 2 * ri(10, 70); return Q('En un triángulo isósceles el ángulo del vértice mide ' + g(v) + '. ¿Cuánto mide cada ángulo de la base?', g((180 - v) / 2), [g(v), g(180 - v), g(v / 2)], 'Los de la base son iguales: (180 − ' + v + ')/2.'); },
      function () { var a = ri(30, 70), b = ri(30, 70); return Q('Un ángulo exterior de un triángulo mide ' + g(a + b) + ' y uno de los interiores no adyacentes mide ' + g(a) + '. ¿Cuánto mide el otro interior no adyacente?', g(b), [g(180 - a - b), g(a + b), g(180 - b)], 'El ángulo exterior es la suma de los dos interiores no adyacentes.'); },
      function () { var a = ri(3, 12), b = ri(3, 12); return Q('Dos lados de un triángulo miden ' + a + ' y ' + b + '. Si el tercero es entero, ¿cuál es su mayor valor posible?', a + b - 1, [a + b, a + b + 1, Math.max(a, b)], 'Desigualdad triangular: el tercer lado es menor que ' + a + ' + ' + b + ' = ' + (a + b) + '.'); },
      function () { var a = ri(3, 9), b = ri(3, 9), ok = ri(Math.abs(a - b) + 1, a + b - 1), malo = a + b + ri(0, 3);
        return Q('¿Con cuál terna se puede construir un triángulo?', a + ', ' + b + ', ' + ok, [a + ', ' + b + ', ' + malo, a + ', ' + b + ', ' + (a + b), '1, 2, ' + (3 + ri(0, 4)), '2, 3, ' + (5 + ri(1, 4)), '1, 1, ' + ri(2, 5)], 'Cada lado debe ser menor que la suma de los otros dos.'); }
    ],
    5: [
      function () { var n = ri(5, 12); return Q('¿Cuánto suman los ángulos interiores de un polígono convexo de ' + n + ' lados?', g((n - 2) * 180), [g(n * 180), g((n - 1) * 180), g(360)], '(' + n + ' − 2)·180 = ' + ((n - 2) * 180) + '.'); },
      function () { var n = ri(5, 14); return Q('¿Cuántas diagonales tiene un polígono de ' + n + ' lados?', n * (n - 3) / 2, [n * (n - 3), n - 3, n * (n - 1) / 2], i('n') + '(' + i('n') + ' − 3)/2 = ' + n + '·' + (n - 3) + '/2.'); },
      function () { var n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]); return Q('Cada ángulo exterior de un polígono regular mide ' + fr(360 / n) + '°. ¿Cuántos lados tiene?', n, [n + 2, n - 1, 2 * n], 'Los exteriores suman 360°: 360/' + fr(360 / n) + ' = ' + n + '.'); },
      function () { var n = pick([5, 6, 8, 9, 10, 12]); return Q('¿Cuánto mide cada ángulo interior de un polígono regular de ' + n + ' lados?', fr((n - 2) * 180 / n) + '°', [fr(360 / n) + '°', fr((n - 2) * 180) + '°', fr(180 - (n - 2) * 180 / n + 10) + '°'], '(' + n + ' − 2)·180/' + n + '.'); },
      function () { var L = [['rectángulo', 'Sus diagonales son congruentes.'], ['rombo', 'Sus diagonales son perpendiculares.'], ['cuadrado', 'Sus diagonales son congruentes y perpendiculares.']]; var s = pick(L);
        return Q('Un paralelogramo es un ' + s[0] + ' exactamente cuando…', s[1], ['Sus diagonales se bisecan.', 'Tiene un par de lados paralelos.'].concat(L.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; })), 'Todo paralelogramo tiene diagonales que se bisecan; lo que distingue al ' + s[0] + ' es esto.'); }
    ],
    6: [
      function () { var c = 2 * ri(3, 20); return Q('En un triángulo, ' + i('M') + ' y ' + i('N') + ' son puntos medios de dos lados y el tercer lado mide ' + c + '. ¿Cuánto mide ' + i('MN') + '?', c / 2, [c, 2 * c, c / 4], 'La base media mide la mitad del tercer lado.'); },
      function () { var a = ri(4, 15), b = a + 2 * ri(1, 8); return Q('Las bases de un trapecio miden ' + a + ' y ' + b + '. ¿Cuánto mide la base media?', (a + b) / 2, [a + b, b - a, (b - a) / 2], '(' + a + ' + ' + b + ')/2.'); },
      function () { var m = 3 * ri(3, 12); return Q('Una mediana mide ' + m + '. ¿Cuánto mide la parte que va del vértice al baricentro?', 2 * m / 3, [m / 3, m / 2, m], 'El baricentro está a 2/3 de la mediana desde el vértice.'); },
      function () { var m = 3 * ri(3, 12); return Q('Una mediana mide ' + m + '. ¿A qué distancia está el baricentro del lado (punto medio)?', m / 3, [2 * m / 3, m / 2, m / 4], 'La razón es 2 : 1, así que del baricentro al punto medio hay 1/3.'); },
      function () { var n = pick([6, 8, 10, 12]); return Q('¿Cuánto mide el ángulo central de un polígono regular de ' + n + ' lados?', g(360 / n), [g((n - 2) * 180 / n), g(180 / n), g(360 / n + 10)], '360/' + n + '.'); }
    ],
    7: [
      function () { var b = ri(4, 16), h = 2 * ri(2, 9); return Q('Un triángulo tiene base ' + b + ' y altura ' + h + '. ¿Cuál es su área?', b * h / 2, [b * h, b + h, 2 * b * h], '½·' + b + '·' + h + '.'); },
      function () { var a = ri(3, 10), b = a + 2 * ri(1, 6), h = ri(2, 9); return Q('Un trapecio tiene bases ' + a + ' y ' + b + ' y altura ' + h + '. ¿Cuál es su área?', (a + b) * h / 2, [(a + b) * h, a * b * h / 2, (b - a) * h], '(' + a + ' + ' + b + ')/2 · ' + h + '.'); },
      function () { var b = ri(5, 14), l = ri(4, 9), h = ri(2, l - 1); return Q('Un paralelogramo tiene lados ' + b + ' y ' + l + ', y la altura sobre el lado ' + b + ' mide ' + h + '. ¿Cuál es su área?', b * h, [b * l, b * h / 2, l * h], 'Base por altura. El lado ' + l + ' no es la altura.'); },
      function () { var k = ri(2, 5), ad = ri(2, 6), db = ri(2, 6), ae = ad * k, ec = db * k;
        return Q('En △' + i('ABC') + ', ' + i('DE') + ' ∥ ' + i('BC') + '. Si ' + i('AD') + ' = ' + ad + ', ' + i('DB') + ' = ' + db + ' y ' + i('AE') + ' = ' + ae + ', ¿cuánto mide ' + i('EC') + '?', ec, [ae + db - ad, ae, ad * db], 'Thales: ' + i('AD') + '/' + i('DB') + ' = ' + i('AE') + '/' + i('EC') + '.'); },
      function () { var d1 = 2 * ri(2, 9), d2 = ri(3, 12); return Q('Las diagonales de un rombo miden ' + d1 + ' y ' + d2 + '. ¿Cuál es su área?', d1 * d2 / 2, [d1 * d2, d1 + d2, d1 * d2 / 4], i('d') + '₁' + i('d') + '₂/2.'); }
    ],
    8: [
      function () { var t = pick(TRIPLES), k = ri(1, 3); return Q('Los catetos de un triángulo rectángulo miden ' + t[0] * k + ' y ' + t[1] * k + '. ¿Cuánto mide la hipotenusa?', t[2] * k, [(t[0] + t[1]) * k, t[2] * k + 1, t[1] * k + 1], '√(' + (t[0] * k) + '² + ' + (t[1] * k) + '²) = ' + (t[2] * k) + '.'); },
      function () { var t = pick(TRIPLES); return Q('La hipotenusa de un triángulo rectángulo mide ' + t[2] + ' y un cateto ' + t[0] + '. ¿Cuánto mide el otro cateto?', t[1], [t[2] - t[0], t[1] + 1, t[2] + t[0]], '√(' + t[2] + '² − ' + t[0] + '²).'); },
      function () { var k = ri(2, 5), A = ri(2, 9); return Q('Dos triángulos semejantes tienen razón de semejanza ' + k + '. Si el área del menor es ' + A + ', ¿cuál es el área del mayor?', A * k * k, [A * k, A * k * k * k, A + k], 'Las áreas están en razón ' + k + '² = ' + (k * k) + '.'); },
      function () { var b = ri(2, 6), c = ri(2, 6), s = ri(2, 4); var BD = b * s, DC = c * s;
        return Q('La bisectriz desde ' + i('A') + ' corta ' + i('BC') + ' en ' + i('D') + '. Si ' + i('AB') + ' = ' + (b * 3) + ', ' + i('AC') + ' = ' + (c * 3) + ' y ' + i('BC') + ' = ' + (BD + DC) + ', ¿cuánto mide ' + i('BD') + '?', BD, [DC === BD ? BD + 1 : DC, (BD + DC) / 2, BD + 2], i('BD') + '/' + i('DC') + ' = ' + i('AB') + '/' + i('AC') + '.'); },
      function () { var t = pick(TRIPLES), ok = Math.random() < .5, c = ok ? t[2] : t[2] + 1;
        return VF('un triángulo de lados ' + t[0] + ', ' + t[1] + ' y ' + c + ' es rectángulo.', ok, t[0] + '² + ' + t[1] + '² = ' + (t[0] * t[0] + t[1] * t[1]) + (ok ? ' = ' : ' ≠ ') + c + '² = ' + (c * c) + '.'); }
    ],
    9: [
      function () { var a = 2 * ri(20, 85); return Q('Un ángulo inscrito abarca un arco de ' + g(a) + '. ¿Cuánto mide?', g(a / 2), [g(a), g(2 * a > 360 ? a - 10 : 2 * a), g(180 - a / 2)], 'El inscrito mide la mitad del arco.'); },
      function () { var t = pick(TRIPLES); return Q('Una cuerda mide ' + 2 * t[1] + ' y está a distancia ' + t[0] + ' del centro. ¿Cuánto mide el radio?', t[2], [t[0] + t[1], 2 * t[1], t[2] + 1], 'La perpendicular desde el centro biseca la cuerda: ' + i('r') + '² = ' + t[1] + '² + ' + t[0] + '².'); },
      function () { var t = pick(TRIPLES); return Q('Desde un punto a distancia ' + t[2] + ' del centro de una circunferencia de radio ' + t[0] + ' se traza una tangente. ¿Cuánto mide el segmento tangente?', t[1], [t[2] - t[0], t[2] + t[0], t[1] + 2], 'La tangente es perpendicular al radio: Pitágoras con hipotenusa ' + t[2] + '.'); },
      function () { var c = 2 * ri(20, 80); return Q('Un ángulo central mide ' + g(c) + '. ¿Cuánto mide un ángulo inscrito que abarca el mismo arco?', g(c / 2), [g(c), g(2 * c > 360 ? c + 10 : 2 * c), g(180 - c)], 'El inscrito mide la mitad del central.'); },
      function () { var r = ri(3, 9), d = pick([r - ri(1, r - 1), r, r + ri(1, 4)]); var res = d < r ? 'secante' : d === r ? 'tangente' : 'exterior';
        return Q('Una recta está a distancia ' + d + ' del centro de una circunferencia de radio ' + r + '. La recta es…', res, ['secante', 'tangente', 'exterior', 'un diámetro'].filter(function (x) { return x !== res; }), i('d') + ' < ' + i('r') + ': secante; ' + i('d') + ' = ' + i('r') + ': tangente; ' + i('d') + ' > ' + i('r') + ': exterior.'); }
    ],
    10: [
      function () { var a = ri(40, 140); return Q('En un cuadrilátero cíclico un ángulo mide ' + g(a) + '. ¿Cuánto mide el ángulo opuesto?', g(180 - a), [g(a), g(360 - a), g(90 - a / 2 | 0)], 'En un cuadrilátero cíclico los opuestos suman 180°.'); },
      function () { var r = ri(2, 12); return Q('¿Cuál es el área de un círculo de radio ' + r + '?', pi(r * r), [pi(2 * r), pi(r * r * 2), pi(r)], 'π' + i('r') + '² = ' + pi(r * r) + '. (2π' + i('r') + ' sería la longitud.)'); },
      function () { var r = ri(2, 12); return Q('¿Cuál es la longitud de una circunferencia de radio ' + r + '?', pi(2 * r), [pi(r * r), pi(r), pi(4 * r)], '2π' + i('r') + '.'); },
      function () { var r1 = ri(3, 8), r2 = ri(1, r1 - 1), op = pick(['ext', 'int', 'sec', 'fuera']); var d = op === 'ext' ? r1 + r2 : op === 'int' ? r1 - r2 : op === 'sec' ? r1 + r2 - 1 : r1 + r2 + ri(1, 3);
        var res = { ext: 'tangentes exteriores', int: 'tangentes interiores', sec: 'secantes', fuera: 'exteriores' }[op];
        return Q('Dos circunferencias de radios ' + r1 + ' y ' + r2 + ' tienen sus centros a distancia ' + d + '. Son…', res, ['tangentes exteriores', 'tangentes interiores', 'secantes', 'exteriores'].filter(function (x) { return x !== res; }), 'Compare ' + i('d') + ' con ' + i('r') + '₁ + ' + i('r') + '₂ = ' + (r1 + r2) + ' y con ' + i('r') + '₁ − ' + i('r') + '₂ = ' + (r1 - r2) + '.'); },
      function () { var r = ri(2, 10), a = pick([60, 90, 120, 180]); return Q('¿Cuál es el área de un sector circular de radio ' + r + ' y ángulo ' + g(a) + '?', pi(r * r * a / 360), [pi(r * r), pi(r * a / 180), pi(r * r * a / 180)], 'Es la fracción ' + a + '/360 del círculo.'); }
    ],
    11: [
      function () { var P = pick([[8, 12, 6, 'cubo'], [4, 6, 4, 'tetraedro'], [6, 12, 8, 'octaedro'], [12, 30, 20, 'icosaedro'], [20, 30, 12, 'dodecaedro'], [10, 15, 7, 'prisma pentagonal'], [12, 18, 8, 'prisma hexagonal'], [6, 10, 6, 'pirámide pentagonal'], [7, 12, 7, 'pirámide hexagonal']]);
        return Q('Un poliedro convexo tiene ' + P[0] + ' vértices y ' + P[1] + ' aristas. ¿Cuántas caras tiene?', P[2], [P[2] + 2, P[1] - P[0], P[2] - 2], i('V') + ' − ' + i('A') + ' + ' + i('C') + ' = 2 ⇒ ' + i('C') + ' = 2 − ' + P[0] + ' + ' + P[1] + ' = ' + P[2] + ' (' + P[3] + ').'); },
      function () { var n = ri(3, 9); return Q('Un prisma cuya base tiene ' + n + ' lados, ¿cuántas aristas tiene?', 3 * n, [2 * n, n + 2, 3 * n + 2], n + ' en cada base y ' + n + ' laterales.'); },
      function () { var n = ri(3, 9); return Q('Una pirámide cuya base tiene ' + n + ' lados, ¿cuántas caras tiene?', n + 1, [n, n + 2, 2 * n], 'La base y ' + n + ' caras laterales.'); },
      function () { var L = [['dos rectas que no se cortan y no son paralelas', 'alabeadas'], ['dos planos distintos que se cortan', 'una recta'], ['una recta perpendicular a dos rectas secantes de un plano, en su punto de corte', 'perpendicular al plano'], ['dos planos paralelos cortados por un tercero', 'rectas paralelas']], s = pick(L);
        return Q('Complete: ' + s[0] + ' → …', s[1], L.filter(function (x) { return x !== s; }).map(function (x) { return x[1]; }), 'Es uno de los resultados de la sección de rectas y planos.'); }
    ],
    12: [
      function () { var B = ri(4, 20), h = ri(2, 12); return Q('¿Cuál es el volumen de un prisma con base de área ' + B + ' y altura ' + h + '?', B * h, [B * h / 3, B + h, B * h / 2], i('B h') + '.'); },
      function () { var B = 3 * ri(2, 10), h = ri(2, 12); return Q('Una pirámide tiene base de área ' + B + ' y altura ' + h + '. ¿Cuál es su volumen?', B * h / 3, [B * h, B * h / 2, B + h], '⅓·' + i('B h') + '.'); },
      function () { var r = 3 * ri(1, 3); return Q('¿Cuál es el volumen de una esfera de radio ' + r + '?', pi(4 * r * r * r / 3), [pi(4 * r * r), pi(r * r * r), pi(2 * r * r * r)], '⁴⁄₃π' + i('r') + '³ = ' + (4 * r * r * r / 3) + 'π. (' + (4 * r * r) + 'π es el área.)'); },
      function () { var r = ri(1, 6), h = 3 * ri(1, 4); return Q('Un cono tiene radio ' + r + ' y altura ' + h + '. ¿Cuál es su volumen?', pi(r * r * h / 3), [pi(r * r * h), pi(r * h), pi(r * r * h / 2)], '⅓π' + i('r') + '²' + i('h') + '.'); },
      function () { var k = ri(2, 4); return Q('Si se multiplica por ' + k + ' la arista de un cubo, su volumen se multiplica por…', k * k * k, [k, k * k, 3 * k], '(' + k + i('a') + ')³ = ' + (k * k * k) + i('a') + '³.'); },
      function () { var r = ri(1, 8); return Q('¿Cuál es el área de una esfera de radio ' + r + '?', pi(4 * r * r), [pi(r * r), pi(Math.round(4 * r * r * r / 3) + 1), pi(2 * r * r)], '4π' + i('r') + '².'); }
    ],
    13: [
      function () { var t = pick(TRIPLES.slice(0, 5)), x = ri(-4, 4), y = ri(-4, 4), sx = pick([1, -1]), sy = pick([1, -1]);
        return Q('¿Cuál es la distancia entre (' + x + ', ' + y + ') y (' + (x + sx * t[0]) + ', ' + (y + sy * t[1]) + ')?', t[2], [t[0] + t[1], t[2] * t[2], t[2] + 1], '√(' + t[0] + '² + ' + t[1] + '²) = ' + t[2] + '.'); },
      function () { var m = pick([-3, -2, -1, 1, 2, 3, 4]), x = ri(-4, 3), y = ri(-5, 5), d = ri(1, 3);
        return Q('¿Cuál es la pendiente de la recta que pasa por (' + x + ', ' + y + ') y (' + (x + d) + ', ' + (y + m * d) + ')?', m, [-m, m === 0 ? 1 : fr(1 / m), m + 1], 'Cambio en ' + i('y') + ' sobre cambio en ' + i('x') + ': ' + (m * d) + '/' + d + '.'); },
      function () { var a = ri(-6, 6), b = ri(-6, 6), c = a + 2 * ri(-4, 4), d = b + 2 * ri(-4, 4);
        return Q('¿Cuál es el punto medio de (' + a + ', ' + b + ') y (' + c + ', ' + d + ')?', '(' + (a + c) / 2 + ', ' + (b + d) / 2 + ')', ['(' + (c - a) / 2 + ', ' + (d - b) / 2 + ')', '(' + (a + c) + ', ' + (b + d) + ')', '(' + (b + d) / 2 + ', ' + (a + c) / 2 + ')', '(' + ((a + c) / 2 + 1) + ', ' + ((b + d) / 2 - 1) + ')', '(' + (c - a) + ', ' + (d - b) + ')'], 'Se promedian las coordenadas.'); },
      function () { var m = pick([2, 3, -2, -3, 4]); return Q('Una recta tiene pendiente ' + m + '. ¿Qué pendiente tiene una perpendicular a ella?', (m > 0 ? '−' : '') + '1/' + Math.abs(m), [String(-m), (m > 0 ? '' : '−') + '1/' + Math.abs(m), String(m)], 'El producto de las pendientes debe ser −1.'); },
      function () { var p = [ri(-3, 3), ri(-3, 3)], d = [ri(-3, 3) || 1, ri(-3, 3) || 2], t = ri(2, 3);
        return Q('La recta ' + i('P') + '(' + i('t') + ') = (' + p[0] + ', ' + p[1] + ') + ' + i('t') + '(' + d[0] + ', ' + d[1] + ') pasa por el punto…', '(' + (p[0] + t * d[0]) + ', ' + (p[1] + t * d[1]) + ')', ['(' + d[0] + ', ' + d[1] + ')', '(' + (p[0] + t * d[1]) + ', ' + (p[1] + t * d[0]) + ')', '(' + (p[0] + d[0] + 1) + ', ' + (p[1] + d[1]) + ')'], 'Con ' + i('t') + ' = ' + t + '.'); }
    ],
    14: [
      function () { var T = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9]]), k = ri(1, 2);
        return Q('¿Cuál es la distancia del origen al punto (' + T[0] * k + ', ' + T[1] * k + ', ' + T[2] * k + ')?', T[3] * k, [(T[0] + T[1] + T[2]) * k, T[3] * k + 1, T[3] * T[3] * k], '√(' + (T[0] * k) + '² + ' + (T[1] * k) + '² + ' + (T[2] * k) + '²).'); },
      function () { var a = pick([-3, -2, -1, 1, 2, 3, 4]), b = pick([-3, -2, -1, 1, 2, 3]), c = ri(1, 5);
        return Q('Un vector normal al plano ' + a + i('x') + ' ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + i('y') + ' + ' + c + i('z') + ' = 7 es…', '(' + a + ', ' + b + ', ' + c + ')', ['(' + a + ', ' + b + ', 7)', '(7, 0, 0)', '(' + b + ', ' + a + ', ' + c + ')'], 'Los coeficientes de ' + i('x') + ', ' + i('y') + ', ' + i('z') + '.'); },
      function () { var u = [ri(-5, 5), ri(-5, 5)], v = [ri(-5, 5), ri(-5, 5)];
        return Q('Si ' + i('u') + ' = (' + u + ') y ' + i('v') + ' = (' + v + '), entonces ' + i('u') + ' + ' + i('v') + ' es…', '(' + (u[0] + v[0]) + ', ' + (u[1] + v[1]) + ')', ['(' + (u[0] - v[0]) + ', ' + (u[1] - v[1]) + ')', '(' + (u[0] * v[0]) + ', ' + (u[1] * v[1]) + ')', '(' + (u[0] + v[1]) + ', ' + (u[1] + v[0]) + ')'], 'Se suma componente a componente.'); },
      function () { var P = [ri(-3, 4), ri(-3, 4)], Qq = [ri(-3, 4), ri(-3, 4)];
        return Q('Si ' + i('P') + ' = (' + P + ') y ' + i('Q') + ' = (' + Qq + '), el vector ' + i('PQ') + ' es…', '(' + (Qq[0] - P[0]) + ', ' + (Qq[1] - P[1]) + ')', ['(' + (P[0] - Qq[0]) + ', ' + (P[1] - Qq[1]) + ')', '(' + (P[0] + Qq[0]) + ', ' + (P[1] + Qq[1]) + ')', '(' + (Qq[1] - P[1]) + ', ' + (Qq[0] - P[0]) + ')'], i('PQ') + ' = ' + i('Q') + ' − ' + i('P') + '.'); },
      function () { var a = ri(1, 3), b = ri(1, 3), c = ri(1, 3), x = ri(-2, 3), y = ri(-2, 3), z = ri(-2, 3), d = a * x + b * y + c * z, ok = Math.random() < .5;
        return VF('el punto (' + x + ', ' + y + ', ' + z + ') está en el plano ' + a + i('x') + ' + ' + b + i('y') + ' + ' + c + i('z') + ' = ' + (ok ? d : d + 1) + '.', ok, 'Al reemplazar se obtiene ' + d + '.'); }
    ],
    15: [
      function () { var u = [ri(-5, 5), ri(-5, 5)], v = [ri(-5, 5), ri(-5, 5)], p = u[0] * v[0] + u[1] * v[1];
        return Q('Calcule (' + u + ')·(' + v + ').', p, [u[0] * v[1] + u[1] * v[0], '(' + u[0] * v[0] + ', ' + u[1] * v[1] + ')', p + 2], u[0] + '·' + v[0] + ' + ' + u[1] + '·' + v[1] + '. Es un número, no un vector.'); },
      function () { var t = pick(TRIPLES.slice(0, 5)), sx = pick([1, -1]), sy = pick([1, -1]);
        return Q('¿Cuál es la norma de (' + sx * t[0] + ', ' + sy * t[1] + ')?', t[2], [t[0] + t[1], t[2] * t[2], Math.abs(sx * t[0] + sy * t[1])], '√(' + t[0] + '² + ' + t[1] + '²).'); },
      function () { var a = pick([1, 2, 3, 4]), b = a * pick([1, 2, 3]), x = ri(-4, 5) || 2;
        return Q('¿Para qué valor de ' + i('x') + ' son perpendiculares (' + i('x') + ', ' + a + ') y (' + b + ', ' + (-b * x / a) + ')?', x, [-x, x + 1, 2 * x], 'Producto interno cero: ' + b + i('x') + ' − ' + (b * x) + ' = 0.'); },
      function () { var u = [ri(1, 4), ri(-3, 4)], k = pick([-3, -2, 2, 3]), v = [u[0] * k, u[1] * k];
        var res = k > 0 ? 'colineales con el mismo sentido' : 'colineales con sentidos opuestos';
        return Q('Los vectores (' + u + ') y (' + v + ') son…', res, ['ortogonales', 'una base del plano', k > 0 ? 'colineales con sentidos opuestos' : 'colineales con el mismo sentido'], '(' + v + ') = ' + k + '·(' + u + ').'); },
      function () { var s = pick([[1, 'agudo'], [0, 'recto'], [-1, 'obtuso']]);
        return Q('Si ' + i('u') + '·' + i('v') + ' ' + (s[0] > 0 ? '> 0' : s[0] < 0 ? '< 0' : '= 0') + ', el ángulo entre ' + i('u') + ' y ' + i('v') + ' es…', s[1], ['agudo', 'recto', 'obtuso', 'llano'].filter(function (x) { return x !== s[1]; }), 'El signo del producto interno es el signo de cos θ.'); }
    ],
    16: [
      function () { var V = [['ı', 'ȷ', 'k'], ['ȷ', 'k', 'ı'], ['k', 'ı', 'ȷ']], s = pick(V), inv = Math.random() < .5;
        var a = inv ? s[1] : s[0], b = inv ? s[0] : s[1], r = (inv ? '−' : '') + s[2];
        return Q(a + ' × ' + b + ' es igual a…', r, [inv ? s[2] : '−' + s[2], '0', '1'], 'Orden cíclico ı → ȷ → k → ı; al invertir el orden cambia el signo.'); },
      function () { var a = ri(1, 5), b = ri(1, 5), c = ri(1, 4);
        return Q('¿Cuál es el área del paralelogramo determinado por (' + a + ', 0, 0) y (' + c + ', ' + b + ', 0)?', a * b, [a * c, a * b * c, a + b], '(' + a + ', 0, 0) × (' + c + ', ' + b + ', 0) = (0, 0, ' + (a * b) + ').'); },
      function () { var a = ri(1, 5), b = ri(1, 5), c = ri(1, 5);
        return Q('¿Cuál es el volumen del paralelepípedo determinado por (' + a + ', 0, 0), (0, ' + b + ', 0) y (0, 0, ' + c + ')?', a * b * c, [a + b + c, a * b, a * b * c / 6], 'Es una caja de lados ' + a + ', ' + b + ', ' + c + '.'); },
      function () { var a = ri(1, 4), b = ri(1, 4), c = ri(1, 4);
        return Q('¿Cuál es el volumen del tetraedro de vértices el origen, (' + a + ', 0, 0), (0, ' + b + ', 0) y (0, 0, ' + c + ')?', fr(+(a * b * c / 6).toFixed(2)), [a * b * c, fr(+(a * b * c / 2).toFixed(2)), fr(+(a * b * c / 3).toFixed(2))], '⅙ del valor absoluto del producto mixto.'); },
      function () { var ok = Math.random() < .5, a = ri(1, 3), b = ri(1, 3);
        return VF('los vectores (1, 0, ' + a + '), (0, 1, ' + b + ') y (1, 1, ' + (ok ? a + b : a + b + 1) + ') son coplanares.', ok, 'El tercero ' + (ok ? 'es' : 'no es') + ' la suma de los dos primeros: el producto mixto ' + (ok ? 'es' : 'no es') + ' cero.'); }
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
