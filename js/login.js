// ----------------------------
// CONFIG
// ----------------------------
const API_KEY = "$2a$10$xVvyPoFrdc3vTXMTamVNp.M.fJK2JwhXSSH1s5AizCX7RzCg8DNGC";
const BIN_ID_MAESTRO = "68f15d87d0ea881f40a6f4cf"; // Bin configuración maestro
var binId = null; // Bin del usuario (se asigna al crear bin o al loguearse)
/** @type {BinData} */
var calendarData = null; // Datos del bin del usuario

function onUserDataChange() {
  calendarData.datesSeted = datesSeted;
  guardarJSON();
}

datesSeted = new Proxy(datesSeted, {
  set(target, prop, value) {
    target[prop] = value;
    onUserDataChange();
    return true;
  },
  deleteProperty(target, prop) {
    delete target[prop];
    onUserDataChange();
    return true;
  }
});

// ----------------------------
// LOGIN 
// ----------------------------
function onLogin(response) {
  $("#loading-overlay").removeClass("d-none");
  const data = jwt_decode(response.credential);
  const email = data.email;
  console.log("Login correcto:", email);

  localStorage.setItem("userEmail", email);

  //$("#login-container-div").hide();
  $("#login-container-div").addClass("d-none");
  $("#app").show();

  // Revisar si existe binId para este email en el bin maestro
  $.ajax({
    url: `https://api.jsonbin.io/v3/b/${BIN_ID_MAESTRO}/latest`,
    headers: { "X-Master-Key": API_KEY },
    success: function (res) {
      const maestroJson = res.record; // tu JSON

      //debugger;
      if (maestroJson) {
        // 🔹 Mapear a clase
        const manager = BinManager.fromJSON(maestroJson);
        manager.bins.forEach(bind => {
          //loop users
          var user = bind.getUserByKey(email);
          if (user) {
            console.log("Usuario encontrado en bin:", user);
            binId = bind.binId;
            getBindData();
          }
        });
      }
      else {
        //TODO: crear bin maestro
        alert("Bin maestro vacío. Pida al admin crear bin maestro");
      }
    },
    error: function (err) {
      console.error("Error al leer bin maestro:", err);
    }
  });s
}

function getBindData() {
  $.ajax({
    url: `https://api.jsonbin.io/v3/b/${binId}/latest`,
    headers: { "X-Master-Key": API_KEY },
    success: function (res) {
      calendarData = res.record; // tu JSON
      loadCalendarData(calendarData);
      $("#loading-overlay").addClass("d-none");
    },
    error: function (err) {
      console.error("Error al leer bin maestro:", err);
    }
  });
}

// ----------------------------
// GUARDAR JSON DEL USUARIO
// ----------------------------
function guardarJSON() {
  if (calendarData == null) {
    alert("No hay datos de usuario para guardar");
    return;
  }

  $.ajax({
    url: `https://api.jsonbin.io/v3/b/${binId}`,
    type: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    data: JSON.stringify(calendarData),
    success: function (res) {
      console.log("Datos sincronizados correctamente");
    },
    error: function (err) {
      console.error("Error al guardar JSON:", err);
      alert("Error al sincronizar los datos. Error: " + err);
    }
  });
}



