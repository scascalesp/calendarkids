
function onLogin(response) {
  const data = jwt_decode(response.credential);
  const email = data.email;
  console.log("Login correcto:", email);

  // Guarda el email en localStorage
  localStorage.setItem("userEmail", email);

  // Oculta login y muestra app
  $("#login-container").hide();
  $("#app").show();

  // Recuperar datos existentes del usuario
  cargarJSON(email);
}

const API_KEY = "$2a$10$xVvyPoFrdc3vTXMTamVNp.M.fJK2JwhXSSH1s5AizCX7RzCg8DNGC"; // Consíguela en jsonbin.io
const binId = '68eeb64e43b1c97be9682041';

// Guardar/Actualizar JSON
function guardarJSON(email, datos) {
  $.ajax({
    url: `https://api.jsonbin.io/v3/b/${binId}`,
    type: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    data: JSON.stringify(datos),
    success: function(res) {
      console.log("Datos sincronizados con éxito:", res);
      alert("Datos sincronizados correctamente ✅");
    },
    error: function(err) {
      console.error("Error al guardar JSON:", err);
      alert("Error al sincronizar ❌");
    }
  });
}

// Cargar JSON
function cargarJSON() {
  $.ajax({
    url: `https://api.jsonbin.io/v3/b/${binId}/latest`,
    headers: { "X-Master-Key": API_KEY },
    success: function(res) {
      console.log("Datos recuperados:", res.record);
      // Aquí restauras las asignaciones en el calendario
    },
    error: function(err) {
      console.error("Error al cargar JSON:", err);
    }
  });
}

// Botón de sincronización
$(document).on("click", "#sync", function() {
  const email = localStorage.getItem("userEmail");
  if (!email) return alert("Debes iniciar sesión primero");

  const datos = obtenerDatosCalendario(); // tu función que devuelve el JSON
  guardarJSON(email, datos);
});
