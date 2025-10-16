// Representa a un usuario con sus permisos
class BinUser {
  constructor(key, permissions = []) {
    this.key = key;
    this.permissions = permissions;
  }

  addPermission(permission) {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
    }
  }

  removePermission(permission) {
    this.permissions = this.permissions.filter(p => p !== permission);
  }
}

// Representa todo un bin (contenedor)
class BinData {
  constructor(binId, users = []) {
    this.binId = binId;
    this.users = users; // array de BinUser
  }

  // --- FACTORÍA ---
  static fromJSON(json) {
    return new BinData(
      json.binId,
      (json.users || []).map(u => new BinUser(u.key, u.permisions))
    );
  }

  // --- SERIALIZACIÓN ---
  toJSON() {
    return {
      binId: this.binId,
      users: this.users.map(u => ({
        key: u.key,
        permisions: u.permissions
      }))
    };
  }

  // --- MÉTODOS DE BIN ---
  getUserByKey(key) {
    return this.users.find(u => u.key === key) || null;
  }

  addUser(key, permissions = []) {
    if (!this.getUserByKey(key)) {
      this.users.push(new BinUser(key, permissions));
    }
  }

  removeUser(key) {
    this.users = this.users.filter(u => u.key !== key);
  }

  addPermissionToUser(key, permission) {
    const user = this.getUserByKey(key);
    if (user) user.addPermission(permission);
  }

  removePermissionFromUser(key, permission) {
    const user = this.getUserByKey(key);
    if (user) user.removePermission(permission);
  }
}

// --- NUEVA CLASE PARA GESTIONAR MULTIPLES BINS ---
class BinManager {
  constructor(bins = []) {
    this.bins = bins; // array de BinData
  }

  // Crear desde JSON (array de bins)
  static fromJSON(jsonArray) {
    return new BinManager(jsonArray.map(binJson => BinData.fromJSON(binJson)));
  }

  // Convertir a JSON
  toJSON() {
    return this.bins.map(bin => bin.toJSON());
  }

  // Buscar un bin por binId
  getBinById(binId) {
    return this.bins.find(b => b.binId === binId) || null;
  }

  // Añadir un nuevo bin
  addBin(binId) {
    if (!this.getBinById(binId)) {
      this.bins.push(new BinData(binId));
    }
  }

  // Eliminar un bin
  removeBin(binId) {
    this.bins = this.bins.filter(b => b.binId !== binId);
  }

  // Buscar usuario por email en un bin específico
  getUser(binId, email) {
    const bin = this.getBinById(binId);
    return bin ? bin.getUserByKey(email) : null;
  }

  // Métodos rápidos para añadir/elim usuarios o permisos en un bin
  addUserToBin(binId, email, permissions = []) {
    const bin = this.getBinById(binId);
    if (bin) bin.addUser(email, permissions);
  }

  removeUserFromBin(binId, email) {
    const bin = this.getBinById(binId);
    if (bin) bin.removeUser(email);
  }

  addPermissionToUser(binId, email, permission) {
    const bin = this.getBinById(binId);
    if (bin) bin.addPermissionToUser(email, permission);
  }

  removePermissionFromUser(binId, email, permission) {
    const bin = this.getBinById(binId);
    if (bin) bin.removePermissionFromUser(email, permission);
  }
}
