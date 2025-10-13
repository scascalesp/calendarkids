let dias = {};
let usuarios = [];
let asignaciones = {};

const rango = {
  inicio: "2025-09-01",
  fin: "2026-08-31"
};

const mesesNombres = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

$(document).ready(function() {
  // Carga datos
  $.when(
    $.getJSON("holidays.json", data => dias = data),
    $.getJSON("users.json", data => usuarios = data.usuarios)
  ).done(() => generarCalendarioRango(rango.inicio, rango.fin));

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
        const festivo = dias[fecha] && (dias[fecha].festivo_estatal || dias[fecha].festivo_local);

        html += `<td class="${festivo ? 'festivo' : ''}" data-fecha="${fecha}">
          <div>${d}</div>
          <div class="asignados"></div>
          <button class="btn btn-sm btn-secondary add-btn mt-1">+</button>
          <div class="multi-menu card p-2" style="display:none; position:absolute; z-index:10; background:#222;">
            ${usuarios.map(u => `
              <div class="form-check text-start">
                <input class="form-check-input chkUser" type="checkbox" value="${u.nombre}" id="${fecha}-${u.nombre}">
                <label class="form-check-label" for="${fecha}-${u.nombre}" style="color:${u.color}">${u.nombre}</label>
              </div>`).join('')}
            <button class="btn btn-sm btn-success mt-2 btn-hecho">Hecho</button>
          </div>
        </td>`;

        diaSemana++;
        if (diaSemana === 7 && d < ultimoDia.getDate()) {
          html += "</tr><tr>";
          diaSemana = 0;
        }
      }

      while (diaSemana < 7 && diaSemana !== 0) {
        html += "<td></td>";
        diaSemana++;
      }

      html += "</tr></tbody></table></div>";
      $contenedor.append(html);

      m++;
      if (m > 11) { m = 0; y++; }
    }

    // =====================
    // Eventos
    // =====================

    // Mostrar el menú de selección
    $(".add-btn").on("click", function(e) {
      e.stopPropagation();
      const $menu = $(this).siblings(".multi-menu");
      $(".multi-menu").not($menu).hide();
      $menu.toggle();
    });

    // Botón "Hecho"
    $(".btn-hecho").on("click", function(e) {
      e.stopPropagation();
      const $menu = $(this).closest(".multi-menu");
      const $td = $menu.closest("td");
      const fecha = $td.data("fecha");

      const seleccionados = [];
      $menu.find(".chkUser:checked").each(function() {
        seleccionados.push($(this).val());
      });
      asignaciones[fecha] = seleccionados;
      $menu.hide();
      actualizarDia($td, seleccionados);
    });

    // Evita cerrar el menú al hacer clic dentro de él
    $(document).on("click", function(e) {
      if (!$(e.target).closest(".multi-menu, .add-btn").length) {
        $(".multi-menu").hide();
      }
    });
  }

  // =====================
  // Actualiza un día
  // =====================
  function actualizarDia($td, seleccionados) {
    const $contenedor = $td.find(".asignados");
    $contenedor.empty();
    seleccionados.forEach(nombre => {
      const u = usuarios.find(x => x.nombre === nombre);
      if (u) $contenedor.append(`<span class="inicial" style="background:${u.color}">${u.inicial}</span>`);
    });
    actualizarResumen();
  }

  // =====================
  // Actualiza resumen global
  // =====================
  function actualizarResumen() {
    const resumen = {};
    for (const fecha in asignaciones) {
      asignaciones[fecha].forEach(nombre => {
        if (!resumen[nombre]) resumen[nombre] = 0;
        resumen[nombre]++;
      });
    }

    const html = Object.entries(resumen)
      .map(([nombre, dias]) => {
        const u = usuarios.find(x => x.nombre === nombre);
        const color = u ? u.color : "#fff";
        return `<div style="display:inline-block; margin:4px; padding:4px; background:${color}; color:#000; border-radius:4px;">
          ${nombre}: ${dias} día${dias > 1 ? 's' : ''}
        </div>`;
      }).join('');
    $("#resumen").html(html);
  }

  // =====================
  // Guardar/Importar JSON
  // =====================
  $("#guardar").on("click", function() {
    const dataStr = JSON.stringify(asignaciones, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asignaciones.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  $("#importar").on("click", function() {
    $("#importarFile").click();
  });

  $("#importarFile").on("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        asignaciones = data;
        $(".mes td").each(function() {
          const fecha = $(this).data("fecha");
          if (fecha && asignaciones[fecha]) actualizarDia($(this), asignaciones[fecha]);
        });
      } catch (err) {
        alert("Archivo JSON inválido");
      }
    };
    reader.readAsText(file);
  });
});
