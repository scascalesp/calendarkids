// Representa a cada usuario disponible
class AvailableUser {
  constructor(nombre, inicial, color) {
    this.nombre = nombre;
    this.inicial = inicial;
    this.color = color;
  }
}

// Representa un festivo del calendario
class Holiday {
  constructor(fecha, festivo_estatal, festivo_local, festivo_autonomico = 0) {
    this.fecha = fecha;
    this.festivo_estatal = festivo_estatal;
    this.festivo_local = festivo_local;
    this.festivo_autonomico = festivo_autonomico;
  }
}

// Representa todo el conjunto de datos del calendario
class CalendarData {
  constructor(user, availableUsers = [], calendarStart, calendarEnd, holidays = [], datesSeted = {}) {
    this.user = user;
    this.availableUsers = availableUsers;
    this.calendarStart = calendarStart;
    this.calendarEnd = calendarEnd;
    this.holidays = holidays;
    this.datesSeted = datesSeted;
  }

  // --- FACTORÍA ---
  static fromJSON(json) {
    return new calendarData(
      json.user,
      json.availableUsers.map(u => new AvailableUser(u.nombre, u.inicial, u.color)),
      json.calendarStart,
      json.calendarEnd,
      json.holidays.map(h => new Holiday(h.fecha, h.festivo_estatal, h.festivo_local, h.festivo_autonomico)),
      json.datesSeted
    );
  }

  // --- SERIALIZACIÓN ---
  toJSON() {
    return {
      user: this.user,
      availableUsers: this.availableUsers,
      calendarStart: this.calendarStart,
      calendarEnd: this.calendarEnd,
      holidays: this.holidays,
      datesSeted: this.datesSeted
    };
  }

  // --- MÉTODOS PARA AVAILABLE USERS ---
  addUser(nombre, inicial, color) {
    this.availableUsers.push(new AvailableUser(nombre, inicial, color));
  }

  removeUser(nombre) {
    this.availableUsers = this.availableUsers.filter(u => u.nombre !== nombre);
  }

  // --- MÉTODOS PARA HOLIDAYS ---
  addHoliday(fecha, festivo_estatal = 0, festivo_local = 0, festivo_autonomico = 0) {
    this.holidays.push(new Holiday(fecha, festivo_estatal, festivo_local, festivo_autonomico));
  }

  removeHoliday(fecha) {
    this.holidays = this.holidays.filter(h => h.fecha !== fecha);
  }

  // --- MÉTODOS PARA DATES SETED ---
  addDateSeted(fecha, nombre) {
    if (!this.datesSeted[fecha]) {
      this.datesSeted[fecha] = [];
    }
    if (!this.datesSeted[fecha].includes(nombre)) {
      this.datesSeted[fecha].push(nombre);
    }
  }

  removeDateSeted(fecha, nombre) {
    if (!this.datesSeted[fecha]) return;
    this.datesSeted[fecha] = this.datesSeted[fecha].filter(n => n !== nombre);
    if (this.datesSeted[fecha].length === 0) {
      delete this.datesSeted[fecha];
    }
  }
}
