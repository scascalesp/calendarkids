
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

function guardarJSON(email, datos) {
  $.ajax({
    url: "https://api.jsonbin.io/v3/b",
    type: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
      "X-Bin-Name": email
    },
    data: JSON.stringify(datos),
    success: function(res) {
      console.log("Datos sincronizados con éxito:", res);
      alert("Datos sincronizados correctamente ✅");
      localStorage.setItem("jsonBinId", res.metadata.id);
    },
    error: function(err) {
      console.error("Error al guardar JSON:", err);
      alert("Error al sincronizar ❌");
    }
  });
}

function cargarJSON(email) {
  // Si ya guardaste el binId previamente
  const binId = localStorage.getItem("jsonBinId");
  if (!binId) return;

  $.ajax({
    url: `https://api.jsonbin.io/v3/b/${binId}/latest`,
    headers: { "X-Master-Key": API_KEY },
    success: function(res) {
      console.log("Datos recuperados:", res.record);
      // Aquí podrías restaurar las asignaciones en el calendario
    }
  });
}

// Botón de sincronización
$(document).on("click", "#sync", function() {
  const email = localStorage.getItem("userEmail");
  if (!email) return alert("Debes iniciar sesión primero");

  const datos = obtenerDatosCalendario(); // función tuya que devuelve el JSON del calendario
  guardarJSON(email, datos);
});
