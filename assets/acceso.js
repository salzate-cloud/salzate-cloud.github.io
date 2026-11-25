/* © 2026 Santiago Alzate Suárez. Todos los derechos reservados.
   Acceso con contraseña al material de clase: el contenido está cifrado (AES-GCM) y solo
   se descifra en el navegador con la clave que el profesor entrega en clase. */
window.ACCESO = (function () {
  var guion = document.currentScript && document.currentScript.src;
  var BASE = guion ? guion.replace(/[^/]*$/, '') : '/assets/';
  var CLAVE_LS = 'sa-acceso';
  var cfg = null, llaveP = null;

  function deB64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function aB64(u) { var s = ''; u = new Uint8Array(u); for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }

  function config() {
    if (!cfg) cfg = fetch(BASE + 'acceso.json?' + Date.now()).then(function (r) { return r.json(); });
    return cfg;
  }
  function importa(raw) { return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']); }
  function abre(llave, datos) {
    datos = new Uint8Array(datos);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: datos.slice(0, 12) }, llave, datos.slice(12));
  }
  function prueba(llave, c) {
    return abre(llave, deB64(c.prueba)).then(function () { return llave; });
  }
  function deriva(pw, c) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(pw.trim().toLowerCase()), 'PBKDF2', false, ['deriveBits'])
      .then(function (k) { return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: deB64(c.sal), iterations: c.iter }, k, 256); });
  }

  function formulario(c) {
    return new Promise(function (listo) {
      var st = document.createElement('style');
      st.textContent = '.acc-fondo{position:fixed;inset:0;z-index:99999;background:#eef0f4;display:flex;align-items:center;justify-content:center;padding:20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#1d2233}' +
        '.acc-caja{width:100%;max-width:420px;background:#fff;border-radius:14px;padding:30px 30px 24px;box-shadow:0 1px 2px rgba(20,30,60,.08),0 12px 40px rgba(20,30,60,.12)}' +
        '.acc-caja h1{font:600 24px/1.25 "Palatino Linotype",Palatino,Georgia,serif;margin:0 0 8px}' +
        '.acc-caja p{margin:0 0 18px;font-size:15px;line-height:1.5;color:#4a5068}' +
        '.acc-caja label{display:block;font-size:14px;font-weight:600;margin-bottom:6px}' +
        '.acc-caja input{width:100%;box-sizing:border-box;font-family:inherit;font-size:17px;padding:11px 12px;border:1.5px solid #c5cada;border-radius:8px;outline:none}' +
        '.acc-caja input:focus{border-color:#23317a;box-shadow:0 0 0 3px rgba(35,49,122,.15)}' +
        '.acc-caja button{margin-top:14px;width:100%;font-family:inherit;font-size:16px;font-weight:600;padding:11px;border:0;border-radius:8px;background:#23317a;color:#fff;cursor:pointer}' +
        '.acc-caja button:hover{background:#1a255e}.acc-caja button:focus-visible{outline:3px solid #8fa0e6;outline-offset:2px}' +
        '.acc-caja button[disabled]{opacity:.6;cursor:wait}' +
        '.acc-err{min-height:20px;margin-top:10px;font-size:14px;color:#9f1239}' +
        '.acc-pie{margin-top:16px;font-size:12px;color:#7a8096;line-height:1.45}';
      document.head.appendChild(st);
      var f = document.createElement('div');
      f.className = 'acc-fondo';
      f.innerHTML = '<form class="acc-caja" autocomplete="off"><h1>Material del curso</h1>' +
        '<p>Las clases y los talleres son para los estudiantes del curso. Escriba la contraseña que el profesor dio en clase.</p>' +
        '<label for="acc-pw">Contraseña</label><input id="acc-pw" type="password" autocapitalize="off" spellcheck="false" required>' +
        '<button type="submit">Entrar</button><div class="acc-err" role="alert"></div>' +
        '<div class="acc-pie">Este navegador recordará la contraseña. © 2026 Santiago Alzate Suárez. Todos los derechos reservados.</div></form>';
      (document.body || document.documentElement).appendChild(f);
      var form = f.querySelector('form'), inp = f.querySelector('input'), btn = f.querySelector('button'), err = f.querySelector('.acc-err');
      setTimeout(function () { inp.focus(); }, 30);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        btn.disabled = true; btn.textContent = 'Comprobando…'; err.textContent = '';
        var raw;
        deriva(inp.value, c).then(function (r) { raw = r; return importa(r); }).then(function (k) { return prueba(k, c); })
          .then(function (k) {
            try { localStorage.setItem(CLAVE_LS, c.v + ':' + aB64(raw)); } catch (x) {}
            f.remove(); st.remove(); listo(k);
          })
          .catch(function () {
            btn.disabled = false; btn.textContent = 'Entrar';
            err.textContent = 'Esa contraseña no es correcta. Revísela e intente de nuevo.';
            inp.select();
          });
      });
    });
  }

  function llave() {
    if (llaveP) return llaveP;
    llaveP = config().then(function (c) {
      var g = null;
      try { g = localStorage.getItem(CLAVE_LS); } catch (x) {}
      if (g && g.indexOf(c.v + ':') === 0) {
        return importa(deB64(g.slice(c.v.length + 1))).then(function (k) { return prueba(k, c); })
          .catch(function () { return formulario(c); });
      }
      return formulario(c);
    });
    return llaveP;
  }

  function descifra(url) {
    return Promise.all([llave(), fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })])
      .then(function (x) { return abre(x[0], x[1]); });
  }

  /* página HTML cifrada: reemplaza el documento por el contenido descifrado */
  function pagina(url) {
    descifra(url).then(function (buf) {
      var html = new TextDecoder().decode(buf);
      document.open(); document.write(html); document.close();
    }).catch(function () {
      document.body.innerHTML = '<p style="font:16px sans-serif;margin:60px auto;max-width:520px;text-align:center">No se pudo abrir este material. Recargue la página.</p>';
    });
  }

  function salir() { try { localStorage.removeItem(CLAVE_LS); } catch (x) {} location.reload(); }

  return { llave: llave, descifra: descifra, pagina: pagina, salir: salir };
})();
