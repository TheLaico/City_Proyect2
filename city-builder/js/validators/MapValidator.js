// Valida formato del mapa .txt antes de cargarlo
class MapValidator {
  static VALID_SYMBOLS = new Set([
    'g', 'r',
    'R1', 'R2',
    'C1', 'C2',
    'I1', 'I2',
    'S1', 'S2', 'S3',
    'U1', 'U2',
    'P1'
  ]);

  validate(fileContent) {
    const errors = [];
    const warnings = [];
    let grid = null;

    if (!fileContent || !fileContent.trim()) {
      errors.push('El archivo está vacío');
      return { valid: false, errors, warnings, grid: null };
    }

    // Parseo de filas
    let rows = fileContent.split(/\r?\n/).filter(row => row.trim().length > 0);
    const rowCount = rows.length;
    if (rowCount < 15 || rowCount > 30) {
      errors.push('El número de filas debe estar entre 15 y 30');
    }

    // Parseo de columnas y consistencia
    let colCount = null;
    grid = rows.map((row, i) => {
      // Soporta celdas de 1 o 2 caracteres (ej: R1, S2, g, r)
      const cells = row.match(/([A-Z][0-9]|[a-z][0-9]?)/g) || [];
      if (colCount === null) colCount = cells.length;
      if (cells.length !== colCount) {
        errors.push(`Fila ${i + 1} tiene ${cells.length} columnas, se esperaban ${colCount}`);
      }
      return cells;
    });
    if (colCount < 15 || colCount > 30) {
      errors.push('El número de columnas debe estar entre 15 y 30');
    }

    // Validación de símbolos
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const symbol = grid[y][x];
        if (!MapValidator.VALID_SYMBOLS.has(symbol)) {
          errors.push(`Símbolo inválido '${symbol}' en posición (${y + 1}, ${x + 1})`);
        }
      }
    }

    if (errors.length > 0) grid = null;
    return { valid: errors.length === 0, errors, warnings, grid };
  }
}

export default MapValidator;