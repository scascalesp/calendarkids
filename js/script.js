let calendarHolidays = {};
let availableCalendarUsers = [];
let datesSeted = {}; // Aquí guardaremos solo las fechas con personas, extraídas del JSON de usuarios
var userPerms = [];

var rango = {
  inicio: "2025-09-01",
  fin: "2026-08-31"
};

const mesesNombres = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

$(document).on('input keyup', '.comentario-dia', function () {
  this.style.height = 'auto';                // reinicia altura
  this.style.height = this.scrollHeight + 'px'; // ajusta a contenido
});

function ajustarAlturaTextareas($context) {
  $context.find(".comentario-dia").each(function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });
}

// =====================
// Generar calendario completo
// =====================
function generarCalendarioRango(fechaInicioStr, fechaFinStr) {
  const fechaInicio = new Date(fechaInicioStr);
  const fechaFin = new Date(fechaFinStr);
  const $contenedor = $("#calendario");
  $contenedor.empty();

  let y = fechaInicio.getFullYear();
  let m = fechaInicio.getMonth();

  while (y < fechaFin.getFullYear() || (y === fechaFin.getFullYear() && m <= fechaFin.getMonth())) {
    const primerDia = new Date(y, m, 1);
    const ultimoDia = new Date(y, m + 1, 0);
    const nombreMes = `${mesesNombres[m]} ${y}`;

    let html = `<div class="mes"><h2>${nombreMes}</h2>
      <table><thead><tr>
      <th>Lu</th><th>Ma</th><th>Mi</th><th>Ju</th><th>Vi</th><th>Sá</th><th>Do</th>
      </tr></thead><tbody><tr>`;

    let diaSemana = (primerDia.getDay() + 6) % 7;
    for (let i = 0; i < diaSemana; i++) html += "<td></td>";

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const festivoObj = calendarHolidays.find(f => f.fecha === fecha);

      let claseFestivo = "";
      let tooltip = "";
      if (festivoObj) {
        if (festivoObj.festivo_estatal) {
          claseFestivo = "festivo-estatal";
          tooltip = "Festivo Estatal";
        } else if (festivoObj.festivo_autonomico) {
          claseFestivo = "festivo-autonomico";
          tooltip = "Festivo Autonómico";
        } else if (festivoObj.festivo_local) {
          claseFestivo = "festivo-local";
          tooltip = "Festivo Local";
        }
      }

      // 🔹 Añadir clase para sábado (6) y domingo (0)
      const diaSemanaReal = new Date(y, m, d).getDay();
      const claseFinDeSemana = (diaSemanaReal === 6 || diaSemanaReal === 0) ? "fin-de-semana" : "";

      const festivo = festivoObj && (festivoObj.festivo_estatal || festivoObj.festivo_local);

      html += `<td title="${tooltip}" class="monthtd ${claseFestivo} ${claseFinDeSemana} ${festivo ? 'festivo' : ''}" data-fecha="${fecha}">
        <div>${d}</div>
        <div class="asignados"></div>
        <button class="btn btn-sm btn-secondary add-btn mt-1">+</button>
        
        <div class="multi-menu card p-2 menu-ext" style="display:none; position:absolute; z-index:10; background:#222;">
          ${availableCalendarUsers.map(u => `
            <div class="form-check text-start">
              <input class="form-check-input chkUser" type="checkbox" value="${u.nombre}" id="${fecha}-${u.nombre.replace(/\s+/g, '_')}">
              <label class="form-check-label" for="${fecha}-${u.nombre.replace(/\s+/g, '_')}" style="color:${u.color}">${u.nombre}</label>
            </div>`).join('')}
            
          <div class="form-control mt-2 comentario-dia" contentEditable="true" placeholder="Añadir comentario..." style="min-height: 2em; overflow:auto;"></div>
          <button class="btn btn-sm btn-success mt-2 btn-hecho">Hecho</button>
        </div>

        <div class="comentario-oculto" style="display:none;"></div>
      </td>`;

      diaSemana++;
      if (diaSemana === 7 && d < ultimoDia.getDate()) {
        html += "</tr><tr>";
        diaSemana = 0;
      }
    }

    while (diaSemana < 7 && diaSemana !== 0) {
      html += "<td class='monthtd'></td>";
      diaSemana++;
    }

    html += "</tr></tbody></table></div>";
    $contenedor.append(html);

    m++;
    if (m > 11) { m = 0; y++; }
  } // 🔹 Cierre del while principal


  // =====================
  // Eventos
  // =====================

  // Mostrar el menú de selección
  $(".add-btn").on("click", function (e) {
    e.stopPropagation();
    const $menu = $(this).siblings(".multi-menu");
    const $td = $(this).closest("td");
    const fecha = $td.data("fecha");

    // Marcar checkboxes
    $menu.find(".chkUser").prop("checked", false); // reset
    if (datesSeted[fecha]?.users) {
      datesSeted[fecha].users.forEach(nombre => {
        $menu.find(`#${fecha}-${nombre.replace(/\s+/g, '_')}`).prop("checked", true);
      });
    }

    // Leer comentario del div oculto
    const comentarioOculto = $td.find(".comentario-oculto")[0].innerHTML;
    $menu.find(".comentario-dia")[0].innerHTML = comentarioOculto || "";

    $(".multi-menu").not($menu).hide();

    $menu.toggle();

    if (!userPerms.includes("write")) {
      $menu.prop("disabled", true).addClass("disabled-control");
      $menu.find(".btn-hecho").hide();
      $menu.find("input, .comentario-dia").attr("contenteditable", false).prop("disabled", true);
    }
  });


  // Botón "Hecho"
  $(".btn-hecho").on("click", function (e) {
    e.stopPropagation();
    const $menu = $(this).closest(".multi-menu");
    const $td = $menu.closest("td");
    const fecha = $td.data("fecha");

    const seleccionados = [];
    $menu.find(".chkUser:checked").each(function () {
      seleccionados.push($(this).val());
    });

    const comentariodiatext = $menu.find(".comentario-dia").text();
    var comentarioRaw = $menu.find(".comentario-dia")[0].innerHTML;
    if (comentariodiatext.trim() === "" && seleccionados.length === 0) {
      // Si no hay nada seleccionado ni comentario, eliminar la entrada
      comentarioRaw = "";
    }    
    const comentario = limpiarComentario(comentarioRaw); // Limpiamos <br> y espacios
    $td.find(".comentario-oculto")[0].innerHTML = comentario;
    datesSeted[fecha] = { users: seleccionados, comment: comentario };

    $menu.hide();
    actualizarDia($td, datesSeted[fecha]);

    saveCalendarData();
    guardarJSON();
  });

  // Evita cerrar el menú al hacer clic dentro de él
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".multi-menu, .add-btn").length) {
      $(".multi-menu").hide();
    }
  });

  // Inicializa los días con datos ya existentes
  $(".mes td").each(function () {
    const fecha = $(this).data("fecha");
    if (fecha && datesSeted[fecha]) {
      const data = datesSeted[fecha];

      // Actualizar iniciales y div oculto
      actualizarDia($(this), data);

      // Rellenar textarea con comentario del div oculto
      const $div = $(this).find(".comentario-dia");
      $div.html(data.comment || "");
    }
  });

  //ajustarAlturaTextareas($(".mes"));
}

function limpiarComentario(texto) {
  if (!texto) return "";
  // Eliminar espacios al principio y final, y reemplazar <br> por vacío
  let limpio = texto.replace(/<br\s*\/?>/gi, '').trim();
  return limpio;
}


// =====================
// Actualiza un día
// =====================
function actualizarDia($td, data = { users: [], comment: "" }) {
  const seleccionados = data.users || [];
  const comentario = limpiarComentario(data.comment || "");

  const $contenedor = $td.find(".asignados");
  $contenedor.empty();

  seleccionados.forEach(nombre => {
    const u = availableCalendarUsers.find(x => x.nombre === nombre);
    if (u) $contenedor.append(`<span class="inicial" style="background:${u.color}">${u.inicial}</span>`);
  });

  // Actualizar div oculto con el comentario
  $td.find(".comentario-oculto").html(comentario);

  // Actualizar icono de comentario
  $td.find(".comentario-icono").remove(); // eliminar todos los iconos previos
  if (comentario && comentario.trim() !== "") {
    $td.append('<span class="comentario-icono">?</span>');
  }

  actualizarResumen();
}



function onUserDataChangeCalendar() {
  // Recorre cada celda y actualiza los días
  $(".mes td").each(function () {
    const fecha = $(this).data("fecha");
    const data = datesSeted[fecha];
    if (fecha && data) {
      actualizarDia($(this), data.users, data.comment);
      // Rellenar también el textarea si está abierto
      $(this).find(".comentario-dia").html(limpiarComentario(data.comment || ""));
      data.users?.forEach(nombre => {
        $(this).find(`#${fecha}-${nombre}`).prop("checked", true);
      });
    }
  });
}

// =====================
// Actualiza resumen global
// =====================
function actualizarResumen() {
  const resumen = {};
  for (const fecha in datesSeted) {
    const data = datesSeted[fecha]; // ahora es { users: [...], comment: "..." }
    data.users.forEach(nombre => { // ✅ accedemos al array users
      if (!resumen[nombre]) resumen[nombre] = 0;
      resumen[nombre]++;
    });
  }

  const html = Object.entries(resumen)
    .map(([nombre, dias]) => {
      const u = availableCalendarUsers.find(x => x.nombre === nombre);
      const color = u ? u.color : "#fff";
      return `<div style="display:inline-block; margin:4px; padding:4px; background:${color}; color:#000; border-radius:4px;">
            ${nombre}: ${dias} día${dias > 1 ? 's' : ''}
          </div>`;
    }).join('');
  $("#resumen").html(html);
}

function loadCalendarData(calendarDataObject) {
  // debugger;
  if (calendarDataObject) {
    // 🔹 Mapear a clase
    //calendarData = JSON.parse(calendarDataJson); //CalendarData.fromJSON(calendarDataJson); //ko
    //set calendarHolidays = {};
    calendarHolidays = calendarDataObject.calendarHolidays || {};
    availableCalendarUsers = calendarDataObject.availableCalendarUsers || [];
    datesSeted = calendarDataObject.datesSeted || {};
    rango.inicio = calendarDataObject.calendarStart;
    rango.fin = calendarDataObject.calendarEnd;
    //$("#calendar-title").text(`Calendario ${rango.inicio.getFullYear()}-${rango.fin.getFullYear()}`);
    $("#calendar-title").text(calendarDataObject.calendarTitle);

    console.log("Datos del bin del usuario cargados");

    generarCalendarioRango(rango.inicio, rango.fin);

    if (!userPerms.includes("write")) {
      $("#importar, #exportar").prop("disabled", true).addClass("disabled");
      console.log("Modo lectura: no puede modificar datos");
    }
  }
  else {
    console.log("Bin del usuario vacío");
  }
}

function saveCalendarData() {
  if (!calendarData) {
    calendarData = {};
  }
  calendarData.calendarHolidays = calendarHolidays;
  calendarData.availableCalendarUsers = availableCalendarUsers;
  calendarData.datesSeted = datesSeted;
  calendarData.calendarStart = rango.inicio;
  calendarData.calendarEnd = rango.fin;
}

$(document).ready(function () {
  $("#legend-toggle").on("click", function () {
    $("#legend-content").toggle();
  });

  $("#exportar").on("click", function () {
    const dataStr = JSON.stringify(calendarData);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendarData_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  $("#importar").on("click", function () {
    $("#importarFile").click();
  });

  $("#importarFile").on("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        calendarData = JSON.parse(evt.target.result);
        if (!calendarData || typeof calendarData !== 'object') throw new Error("Invalid JSON");
        loadCalendarData(calendarData);
        alert("importación completada");
      } catch (err) {
        alert("Archivo JSON inválido");
      }
    };
    reader.readAsText(file);
  });

  setTimeout(() => {
    //ajustarAlturaTextareas($(".mes"));
    forzarAlturaTextareasSimulandoInput($(".mes"));
  }, 2000);
});

function forzarAlturaTextareasSimulandoInput($context) {
  $context.find(".comentario-dia").each(function () {
    const e = new Event('input', { bubbles: true });
    this.dispatchEvent(e);
  });
}

