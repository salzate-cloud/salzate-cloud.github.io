/* Quiz de la clase: preguntas del banco de la semana (sin generadores aleatorios).
   Misma interfaz que Geometría Básica: GENERADORES.armar(semana, banco, previas).
   © 2026 Santiago Alzate Suárez. Todos los derechos reservados. */
var GENERADORES = (function () {
  'use strict';
  function mezcla(L) { L = L.slice(); for (var i = L.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = L[i]; L[i] = L[j]; L[j] = t; } return L; }
  function armar(semana, banco, previas) {
    previas = previas || [];
    var b = banco.map(function (q, k) { return { q: q, k: k }; });
    var frescas = mezcla(b.filter(function (x) { return previas.indexOf(x.k) < 0; })), viejas = mezcla(b.filter(function (x) { return previas.indexOf(x.k) >= 0; }));
    var elegidas = frescas.concat(viejas).slice(0, 6);
    var est = elegidas.map(function (x) {
      var orden = x.q.o.length === 2 ? [0, 1] : mezcla(x.q.o.map(function (_, j) { return j; }));
      return { e: x.q.e, o: orden.map(function (j) { return x.q.o[j]; }), c: orden.indexOf(x.q.c), x: x.q.x, k: x.k };
    });
    return { q: est, usadas: elegidas.map(function (x) { return x.k; }) };
  }
  return { armar: armar, G: {} };
})();
