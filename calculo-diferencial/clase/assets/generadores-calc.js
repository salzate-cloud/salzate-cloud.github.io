/* Cálculo Diferencial: preguntas nuevas con datos al azar para el quiz de cada semana.
   Misma interfaz que el de Geometría Básica: GENERADORES.armar(semana, banco, previas).
   © 2026 Santiago Alzate Suárez. Todos los derechos reservados. */
var GENERADORES = (function () {
  'use strict';
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var v; do { v = ri(a, b); } while (v === 0); return v; }
  function mezcla(L) { L = L.slice(); for (var i = L.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = L[i]; L[i] = L[j]; L[j] = t; } return L; }
  function fr(n) { n = +(+n).toFixed(3); return String(n).replace('-', '−').replace('.', ','); }
  function Q(e, correcta, distr, x) {
    var c = typeof correcta === 'number' ? fr(correcta) : String(correcta), ops = [c];
    distr.forEach(function (d) { d = typeof d === 'number' ? fr(d) : String(d); if (ops.indexOf(d) < 0 && ops.length < 4) ops.push(d); });
    for (var k = 1; ops.length < 4 && typeof correcta === 'number' && k < 40; k++) { var v = fr(correcta + (k % 2 ? k : -k)); if (ops.indexOf(v) < 0) ops.push(v); }
    var m = mezcla(ops); return { e: e, o: m, c: m.indexOf(c), x: x };
  }
  function VF(e, v, x) { return { e: 'Verdadero o falso: ' + e, o: ['Verdadero', 'Falso'], c: v ? 0 : 1, x: x }; }
  var i = function (s) { return '<i>' + s + '</i>'; }, X = i('x');
  function sg(n) { return n < 0 ? ' − ' + (-n) : ' + ' + n; }
  function lin(a, b) { return (a === 1 ? '' : a === -1 ? '−' : fr(a)) + X + (b ? sg(b) : ''); }
  function itv(a, b, ca, cb) { return (ca ? '[' : '(') + fr(a) + ', ' + fr(b) + (cb ? ']' : ')'); }

  var G = {
    1: [
      function () { var a = nz(2, 6), b = ri(-8, 8), c = ri(-8, 12), s = Math.random() < .5;
        var r = (c - b) / a; return Q('La solución de ' + lin(a, b) + (s ? ' < ' : ' > ') + fr(c) + ' es…', s ? '(−∞, ' + fr(r) + ')' : '(' + fr(r) + ', ∞)', [s ? '(' + fr(r) + ', ∞)' : '(−∞, ' + fr(r) + ')', '(−∞, ' + fr(-r) + ')', '(' + fr(-r) + ', ∞)'], 'Se despeja: ' + X + (s ? ' < ' : ' > ') + fr(r) + '.'); },
      function () { var a = ri(-5, 0), b = ri(1, 6);
        return Q('La solución de (' + X + sg(-a) + ')(' + X + sg(-b) + ') < 0 es…', itv(a, b), ['(−∞, ' + fr(a) + ') ∪ (' + fr(b) + ', ∞)', itv(a, b, 1, 1), itv(-b, -a)], 'El producto es negativo entre las raíces.'); },
      function () { var a = ri(-6, 2), b = a + ri(2, 6), c = ri(a + 1, b + 4), d = c + ri(2, 5);
        var lo = Math.max(a, c), hi = Math.min(b, d); var resp = lo < hi ? itv(lo, hi) : '∅';
        return Q('(' + fr(a) + ', ' + fr(b) + ') ∩ (' + fr(c) + ', ' + fr(d) + ') =', resp, [itv(Math.min(a, c), Math.max(b, d)), itv(a, d), '∅', itv(c, b, 1, 1)], 'Lo que está en ambos intervalos.'); }
    ],
    2: [
      function () { var a = ri(-5, 5), r = ri(1, 6);
        return Q('|' + X + sg(-a) + '| < ' + r + ' equivale a…', itv(a - r, a + r), [itv(-r, r), itv(a - r, a + r, 1, 1), '(−∞, ' + fr(a - r) + ') ∪ (' + fr(a + r) + ', ∞)'], 'Distancia de ' + X + ' a ' + fr(a) + ' menor que ' + r + '.'); },
      function () { var m = nz(-5, 5), k = ri(1, 3), mm = k === 1 ? -1 / m : m;
        return Q('La pendiente de una recta ' + (k === 1 ? 'perpendicular' : 'paralela') + ' a ' + i('y') + ' = ' + lin(m, ri(-4, 4)) + ' es…', mm, [k === 1 ? m : -1 / m, -m, 1 / m], k === 1 ? 'm₁m₂ = −1.' : 'Paralelas: misma pendiente.'); },
      function () { var t = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]][ri(0, 3)], x = ri(-4, 4), y = ri(-4, 4);
        return Q('La distancia entre (' + fr(x) + ', ' + fr(y) + ') y (' + fr(x + t[0]) + ', ' + fr(y + t[1]) + ') es…', t[2], [t[0] + t[1], t[2] * t[2], t[2] + 1], 'Pitágoras: √(' + t[0] * t[0] + ' + ' + t[1] * t[1] + ').'); }
    ],
    3: [
      function () { var a = ri(-6, 6), s = Math.random() < .5;
        return Q('El dominio de √(' + (s ? X + sg(-a) : fr(a) + ' − ' + X) + ') es…', s ? '[' + fr(a) + ', ∞)' : '(−∞, ' + fr(a) + ']', [s ? '(' + fr(a) + ', ∞)' : '(−∞, ' + fr(a) + ')', s ? '(−∞, ' + fr(a) + ']' : '[' + fr(a) + ', ∞)', 'ℝ'], 'El radicando debe ser ≥ 0.'); },
      function () { var a = nz(-3, 3), b = ri(-6, 6), h = -b / (2 * a);
        return Q('El vértice de ' + i('y') + ' = ' + fr(a) + X + '² ' + sg(b).trim() + X + ' + 1 está en ' + X + ' =', h, [-h, b / a, h + 1], '−b/(2a).'); },
      function () { var t = ri(0, 3), F = [['x⁴ − x²', 'par'], ['x³ + x', 'impar'], ['x² + x', 'ni par ni impar'], ['|x| + x²', 'par']][t];
        return Q(i('f') + '(' + X + ') = ' + F[0] + ' es…', F[1], ['par', 'impar', 'ni par ni impar', 'par e impar'], 'Compare ' + i('f') + '(−' + X + ') con ' + i('f') + '(' + X + ').'); }
    ],
    4: [
      function () { var h = nz(-5, 5), k = nz(-5, 5);
        return Q('La gráfica de ' + i('y') + ' = ' + i('f') + '(' + X + sg(-h) + ')' + sg(k) + ' es la de ' + i('f') + ' movida…', (h > 0 ? h + ' a la derecha' : -h + ' a la izquierda') + ' y ' + (k > 0 ? k + ' arriba' : -k + ' abajo'),
          [(h > 0 ? h + ' a la izquierda' : -h + ' a la derecha') + ' y ' + (k > 0 ? k + ' arriba' : -k + ' abajo'), (h > 0 ? h + ' a la derecha' : -h + ' a la izquierda') + ' y ' + (k > 0 ? k + ' abajo' : -k + ' arriba'), (h > 0 ? h + ' a la izquierda' : -h + ' a la derecha') + ' y ' + (k > 0 ? k + ' abajo' : -k + ' arriba')], 'Dentro va al revés; fuera, al derecho.'); },
      function () { var a = ri(1, 4), b = ri(-3, 3), x = ri(-2, 3);
        var g = a * x + b; return Q('Si ' + i('f') + '(' + X + ') = ' + X + '² y ' + i('g') + '(' + X + ') = ' + lin(a, b) + ', entonces (' + i('f') + '∘' + i('g') + ')(' + fr(x) + ') =', g * g, [x * x * a + b, g, a * x * x + b], i('g') + '(' + fr(x) + ') = ' + fr(g) + ', y luego se eleva al cuadrado.'); },
      function () { var a = ri(1, 9);
        return Q('El dominio de (' + i('f') + '∘' + i('g') + ')(' + X + ') con ' + i('f') + '(' + X + ') = √' + X + ' y ' + i('g') + '(' + X + ') = ' + X + ' − ' + a + ' es…', '[' + a + ', ∞)', ['[0, ∞)', 'ℝ', '(' + a + ', ∞)'], 'Se necesita ' + X + ' − ' + a + ' ≥ 0.'); }
    ],
    5: [
      function () { var a = nz(-5, 5), b = ri(-6, 6);
        return Q('La inversa de ' + i('f') + '(' + X + ') = ' + lin(a, b) + ' es…', '(' + X + sg(-b) + ')/' + fr(a), ['(' + X + sg(b) + ')/' + fr(a), fr(a) + X + sg(-b), '1/(' + lin(a, b) + ')'], 'Despejar ' + X + ' en ' + i('y') + ' = ' + lin(a, b) + '.'); },
      function () { var b = [2, 3, 5][ri(0, 2)], k = ri(1, 4), n = Math.pow(b, k);
        return Q('log<sub>' + b + '</sub>(' + n + ') =', k, [n / b, b * k, k + 1], b + '<sup>' + k + '</sup> = ' + n + '.'); },
      function () { var a = ri(-4, 4);
        return Q('El dominio de ln(' + X + sg(-a) + ') es…', '(' + fr(a) + ', ∞)', ['[' + fr(a) + ', ∞)', '(−∞, ' + fr(a) + ')', 'ℝ'], 'El argumento debe ser positivo.'); }
    ],
    6: [
      function () { var B = ri(2, 6);
        return Q('El período de sen(' + B + X + ') es…', '2π/' + B, ['π/' + B, B + 'π', '2' + B + 'π'], '2π/|B|.'); },
      function () { var t = ri(0, 3), F = [['arcsen(1/2)', 'π/6'], ['arccos(0)', 'π/2'], ['arctan(1)', 'π/4'], ['arcsen(−1)', '−π/2']][t];
        return Q(F[0] + ' =', F[1], ['π/6', 'π/3', 'π/4', 'π/2', '−π/2'].filter(function (z) { return z !== F[1]; }).slice(0, 3), 'El ángulo del rango de la inversa.'); },
      function () { var a = ri(-4, 4), l = ri(-3, 3), r = l + nz(-3, 3);
        return Q('Si el límite por la izquierda en ' + fr(a) + ' es ' + fr(l) + ' y por la derecha es ' + fr(r) + ', el límite en ' + fr(a) + '…', 'no existe', ['es ' + fr(l), 'es ' + fr(r), 'es ' + fr((l + r) / 2)], 'Los laterales deben coincidir.'); }
    ],
    7: [
      function () { var a = nz(-5, 5);
        return Q('lím<sub>' + X + '→' + fr(a) + '</sub> (' + X + '² − ' + a * a + ')/(' + X + sg(-a) + ') =', 2 * a, [0, a, a * a], 'Factorizar: ' + X + sg(a) + ' → ' + fr(2 * a) + '.'); },
      function () { var a = ri(2, 9), b = ri(2, 9);
        return Q('lím<sub>' + X + '→0</sub> sen(' + a + X + ')/(' + b + X + ') =', a / b, [b / a, 1, a * b], 'Arme sen(u)/u con u = ' + a + X + '.'); },
      function () { var k = [1, 4, 9, 16, 25][ri(0, 4)], s = Math.sqrt(k);
        return Q('lím<sub>' + X + '→0</sub> (√(' + X + ' + ' + k + ') − ' + s + ')/' + X + ' =', 1 / (2 * s), [1 / s, 2 * s, 0], 'Racionalizar: 1/(√(' + X + '+' + k + ') + ' + s + ').'); }
    ],
    8: [
      function () { var a = ri(1, 6), b = ri(1, 6), c = ri(1, 6);
        return Q('lím<sub>' + X + '→∞</sub> (' + a + X + '² + ' + b + ')/(' + c + X + '² − ' + X + ') =', a / c, [c / a, 0, '∞'], 'Mismo grado: cociente de coeficientes.'); },
      function () { var a = ri(1, 6);
        return Q('Las asíntotas verticales de 1/(' + X + '² − ' + a * a + ') son…', X + ' = ±' + a, [X + ' = ' + a, X + ' = ' + a * a, 'no tiene'], 'El denominador se anula en ±' + a + '.'); },
      function () { var a = ri(1, 5), b = ri(1, 5);
        return Q('Para que ' + i('f') + '(' + X + ') = ' + i('k') + X + ' (si ' + X + ' < ' + a + ') y ' + X + ' + ' + b + ' (si ' + X + ' ≥ ' + a + ') sea continua, ' + i('k') + ' =', (a + b) / a, [a + b, b / a, (a + b) / b], 'Iguale los laterales en ' + a + '.'); }
    ],
    9: [
      function () { var a = nz(-3, 4), x = ri(-3, 3);
        return Q('Si ' + i('f') + '(' + X + ') = ' + fr(a) + X + '², entonces ' + i('f') + '′(' + fr(x) + ') =', 2 * a * x, [a * x * x, a * x, 2 * a], i('f') + '′(' + X + ') = ' + fr(2 * a) + X + '.'); },
      function () { var x = ri(-3, 3);
        return Q('La pendiente de la tangente a ' + i('y') + ' = ' + X + '³ en ' + X + ' = ' + fr(x) + ' es…', 3 * x * x, [x * x * x, 3 * x, x * x], '3' + X + '².'); },
      function () { var a = ri(-4, 4);
        return VF('|' + X + sg(-a) + '| es derivable en ' + X + ' = ' + fr(a) + '.', false, 'Tiene un pico: los laterales son −1 y 1.'); }
    ],
    10: [
      function () { var n = ri(2, 6), a = ri(2, 5);
        return Q('La derivada de (' + a + X + ' + 1)<sup>' + n + '</sup> es…', n * a + '(' + a + X + ' + 1)<sup>' + (n - 1) + '</sup>', [n + '(' + a + X + ' + 1)<sup>' + (n - 1) + '</sup>', n * a + '(' + a + X + ' + 1)<sup>' + n + '</sup>', a + '(' + a + X + ' + 1)<sup>' + (n - 1) + '</sup>'], 'Cadena.'); },
      function () { var a = ri(2, 6);
        return Q('La derivada de e<sup>' + a + X + '</sup> es…', a + 'e<sup>' + a + X + '</sup>', ['e<sup>' + a + X + '</sup>', a + X + 'e<sup>' + (a - 1) + X + '</sup>', 'e<sup>' + a + '</sup>'], 'Cadena: (e<sup>u</sup>)′ = e<sup>u</sup>u′.'); },
      function () { var g5 = ri(-3, 3), gp = nz(-4, 4), fp = nz(-4, 4);
        return Q('Si ' + i('g') + '(1) = ' + fr(g5) + ', ' + i('g') + '′(1) = ' + fr(gp) + ' y ' + i('f') + '′(' + fr(g5) + ') = ' + fr(fp) + ', entonces (' + i('f') + '∘' + i('g') + ')′(1) =', fp * gp, [fp + gp, fp, gp], i('f') + '′(' + i('g') + '(1))·' + i('g') + '′(1).'); }
    ],
    11: [
      function () { var x = ri(1, 4), y = ri(1, 4); var r2 = x * x + y * y;
        return Q('En el círculo ' + X + '² + ' + i('y') + '² = ' + r2 + ', la pendiente de la tangente en (' + x + ', ' + y + ') es…', -x / y, [x / y, -y / x, y / x], i('y') + '′ = −' + X + '/' + i('y') + '.'); },
      function () { var n = ri(3, 6), k = ri(1, n);
        var c = 1; for (var j = 0; j < k; j++) c *= (n - j);
        return Q('La derivada número ' + k + ' de ' + X + '<sup>' + n + '</sup> evaluada en ' + X + ' = 1 es…', c, [n * k, n, c / n], 'Cada derivada baja el exponente.'); },
      function () { var t = ri(0, 2), F = [['arcsen ' + X, '1/√(1 − ' + X + '²)'], ['arctan ' + X, '1/(1 + ' + X + '²)'], ['arccos ' + X, '−1/√(1 − ' + X + '²)']][t];
        return Q('La derivada de ' + F[0] + ' es…', F[1], ['1/√(1 − ' + X + '²)', '1/(1 + ' + X + '²)', '−1/√(1 − ' + X + '²)', 'sec²' + X].filter(function (z) { return z !== F[1]; }).slice(0, 3), 'Tabla de derivadas.'); }
    ],
    12: [
      function () { var a = ri(2, 6), b = ri(1, 6);
        return Q('La derivada de ln(' + a + X + ' + ' + b + ') es…', a + '/(' + a + X + ' + ' + b + ')', ['1/(' + a + X + ' + ' + b + ')', a + '·ln(' + a + X + ' + ' + b + ')', '1/' + X], '(ln u)′ = u′/u.'); },
      function () { var r = ri(1, 5), dr = ri(1, 3);
        return Q('Si el radio de un círculo crece a ' + dr + ' cm/s, ¿a qué ritmo crece el área cuando ' + i('r') + ' = ' + r + ' cm? (en π cm²/s)', 2 * r * dr, [r * r * dr, 2 * r, r * dr], 'A′ = 2π' + i('r') + i('r') + '′.'); },
      function () { var t = ri(1, 4);
        return Q('Si ' + i('s') + '(' + i('t') + ') = ' + i('t') + '³ − 6' + i('t') + ', la velocidad en ' + i('t') + ' = ' + t + ' es…', 3 * t * t - 6, [t * t * t - 6 * t, 6 * t, 3 * t * t], i('v') + ' = 3' + i('t') + '² − 6.'); }
    ],
    13: [
      function () { var a = ri(1, 4);
        return Q('Los puntos críticos de ' + X + '³ − ' + 3 * a * a + X + ' son…', X + ' = ±' + a, [X + ' = ' + a, X + ' = ±' + 3 * a * a, X + ' = 0'], '3' + X + '² − ' + 3 * a * a + ' = 0.'); },
      function () { var a = ri(-4, 4), b = ri(-3, 3), s = Math.random() < .5;
        return Q('Si ' + i('f') + '(' + X + ') = ' + (s ? '' : '−') + '(' + X + sg(-a) + ')² ' + sg(b).trim() + ', en ' + X + ' = ' + fr(a) + ' hay…', s ? 'un mínimo local' : 'un máximo local', [s ? 'un máximo local' : 'un mínimo local', 'una inflexión', 'un punto sin derivada'], 'Parábola ' + (s ? 'hacia arriba' : 'hacia abajo') + ' con vértice en ' + fr(a) + '.'); },
      function () { var b = ri(2, 4);
        return Q('El máximo absoluto de ' + X + '² en [−1, ' + b + '] es…', b * b, [1, 0, b], 'Se compara ' + i('f') + '(−1), ' + i('f') + '(0) y ' + i('f') + '(' + b + ').'); }
    ],
    14: [
      function () { var a = ri(1, 4);
        return Q('El punto de inflexión de ' + X + '³ − ' + 3 * a + X + '² está en ' + X + ' =', a, [2 * a, 0, 3 * a], i('f') + '′′ = 6' + X + ' − ' + 6 * a + '.'); },
      function () { var a = ri(2, 7), b = ri(2, 7);
        return Q('lím<sub>' + X + '→0</sub> (e<sup>' + a + X + '</sup> − 1)/(' + b + X + ') =', a / b, [b / a, 1, a], 'L\'Hôpital: ' + a + 'e<sup>0</sup>/' + b + '.'); },
      function () { var a = ri(2, 6);
        return Q('lím<sub>' + X + '→∞</sub> (1 + ' + a + '/' + X + ')<sup>' + X + '</sup> =', 'e<sup>' + a + '</sup>', ['e', a, '1'], 'Tomando ln: ' + X + '·ln(1 + ' + a + '/' + X + ') → ' + a + '.'); }
    ],
    15: [
      function () { var a = ri(1, 5);
        return Q('La asíntota oblicua de (' + X + '² + ' + a + ')/' + X + ' es…', i('y') + ' = ' + X, [i('y') + ' = ' + X + ' + ' + a, i('y') + ' = ' + a, 'no tiene'], X + ' + ' + a + '/' + X + '.'); },
      function () { var s1 = Math.random() < .5, s2 = Math.random() < .5;
        return Q('Si ' + i('f') + '′ ' + (s1 ? '> 0' : '< 0') + ' y ' + i('f') + '′′ ' + (s2 ? '> 0' : '< 0') + ', la curva…', (s1 ? 'sube' : 'baja') + ' y es cóncava hacia ' + (s2 ? 'arriba' : 'abajo'), [(s1 ? 'baja' : 'sube') + ' y es cóncava hacia ' + (s2 ? 'arriba' : 'abajo'), (s1 ? 'sube' : 'baja') + ' y es cóncava hacia ' + (s2 ? 'abajo' : 'arriba'), (s1 ? 'baja' : 'sube') + ' y es cóncava hacia ' + (s2 ? 'abajo' : 'arriba')], i('f') + '′ da el crecimiento y ' + i('f') + '′′ la concavidad.'); },
      function () { var a = ri(1, 5);
        return Q('Las asíntotas verticales de ' + X + '/(' + X + '² − ' + a * a + ') son…', X + ' = ±' + a, [X + ' = 0', X + ' = ' + a, 'no tiene'], 'El denominador se anula en ±' + a + '.'); }
    ],
    16: [
      function () { var P = 4 * ri(2, 10);
        return Q('El rectángulo de perímetro ' + P + ' con área máxima tiene área…', (P / 4) * (P / 4), [P * P / 8, P, (P / 4) * (P / 4 + 1)], 'Es el cuadrado de lado ' + P / 4 + '.'); },
      function () { var S = 2 * ri(3, 12);
        return Q('Dos números positivos suman ' + S + '. El mayor producto posible es…', (S / 2) * (S / 2), [S, (S / 2 - 1) * (S / 2 + 1), S * S], 'Máximo de ' + X + '(' + S + ' − ' + X + ') en ' + X + ' = ' + S / 2 + '.'); },
      function () { var k = ri(1, 5);
        return Q('El mínimo de ' + X + ' + ' + k * k + '/' + X + ' para ' + X + ' > 0 se alcanza en ' + X + ' =', k, [k * k, 2 * k, 1], '1 − ' + k * k + '/' + X + '² = 0.'); }
    ]
  };
  function armar(semana, banco, previas) {
    previas = previas || [];
    var gens = mezcla(G[semana] || []).slice(0, 3).map(function (f) { var q = f(); q.nueva = true; return q; });
    var b = banco.map(function (q, k) { return { q: q, k: k }; });
    var frescas = mezcla(b.filter(function (x) { return previas.indexOf(x.k) < 0; })), viejas = mezcla(b.filter(function (x) { return previas.indexOf(x.k) >= 0; }));
    var elegidas = frescas.concat(viejas).slice(0, 6 - gens.length);
    var est = elegidas.map(function (x) {
      var orden = mezcla(x.q.o.map(function (_, j) { return j; }));
      if (x.q.o.length === 2) orden = [0, 1];
      return { e: x.q.e, o: orden.map(function (j) { return x.q.o[j]; }), c: orden.indexOf(x.q.c), x: x.q.x, k: x.k };
    });
    return { q: mezcla(est.concat(gens)), usadas: elegidas.map(function (x) { return x.k; }) };
  }
  return { armar: armar, G: G };
})();
