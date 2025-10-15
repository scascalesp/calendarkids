// ----------------------------
// CONFIG
// ----------------------------
const API_KEY = "$2a$10$xVvyPoFrdc3vTXMTamVNp.M.fJK2JwhXSSH1s5AizCX7RzCg8DNGC";
const BIN_ID_MAESTRO = "68eeb64e43b1c97be9682041"; // Bin fijo donde guardamos email → binId

function onAsignacionesChange() {
  console.log("✅ asignaciones ha cambiado:", asignaciones);
  const datos = asignacionesObject(); // tu función que devuelve JSON
  const email = localStorage.getItem("userEmail");
  if (email) {
    crearBin(email, datos);
  } else {
    alert("No hay email de usuario, no se crea bin");
  }
}

asignaciones = new Proxy(asignaciones, {
  set(target, prop, value) {
    target[prop] = value;
    onAsignacionesChange();
    return true;
  },
  deleteProperty(target, prop) {
    delete target[prop];
    onAsignacionesChange();
    return true;
  }
});

// ----------------------------
// LOGIN GOOGLE
// ----------------------------
function onLogin(response) {
  const data = jwt_decode(response.credential);
  const email = data.email;
  console.log("Login correcto:", email);

  localStorage.setItem("userEmail", email);

  $("#login-container").hide();
  $("#app").show();

  // Revisar si existe binId para este email en el bin maestro
  $.ajax({
    url: `https://api.jsonbin.io/v3/b/${BIN_ID_MAESTRO}/latest`,
    headers: { "X-Master-Key": API_KEY },
    success: function (res) {
      const maestro = res.record; // {email: binId, ...}
      if (maestro[email]) {        
        asignaciones = maestro;
      }
    },
    error: function (err) {
      console.error("Error al leer bin maestro:", err);
    }
  });
}

// ----------------------------
// CREAR BIN DE USUARIO
// ----------------------------
function crearBin(email, datosIniciales = {}) {
  $.ajax({
    url: "https://api.jsonbin.io/v3/b",
    type: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
      "X-Bin-Name": email
    },
    data: JSON.stringify(datosIniciales),
    success: function (res) {
      const binId = res.metadata.id;
      console.log("Bin creado para usuario:", email, binId);
      localStorage.setItem("binId", binId);

      // Actualizar bin maestro
      $.ajax({
        url: `https://api.jsonbin.io/v3/b/${BIN_ID_MAESTRO}`,
        type: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY
        },
        data: JSON.stringify({
          ...res.record,        // datos anteriores
          [email]: binId        // añadir nuevo usuario
        }),
        success: function () {
          console.log("Bin maestro actualizado ✅");
        },
        error: function (err) {
          console.error("Error al actualizar bin maestro:", err);
        }
      });
    },
    error: function (err) {
      console.error("Error al crear bin de usuario:", err);
    }
  });
}

// ----------------------------
// GUARDAR JSON DEL USUARIO
// ----------------------------
function guardarJSON(datos) {
  const binId = localStorage.getItem("binId");
  if (!binId) return alert("No hay binId asignado al usuario");

  $.ajax({
    url: `https://api.jsonbin.io/v3/b/${binId}`,
    type: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    data: JSON.stringify(datos),
    success: function (res) {
      console.log("Datos sincronizados ✅", res);
      alert("Datos sincronizados correctamente");
    },
    error: function (err) {
      console.error("Error al guardar JSON:", err);
      alert("Error al sincronizar ❌");
    }
  });
}

 
// ----------------------------
// BOTÓN SYNC
// ----------------------------
$(document).on("click", "#sync", function () {
  const email = localStorage.getItem("userEmail");
  if (!email) return alert("Debes iniciar sesión primero");

  const datos = asignacionesObject(); // tu función que devuelve JSON
  guardarJSON(datos);
});
