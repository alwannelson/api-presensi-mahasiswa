const db = require('../../configs/database')

async function selectAllExcept(tableName, excludedColumn = 'id') {
    const [columns] = await db.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME !=`,
        [tableName, excludedColumn]
    )

    const columnNames = columns.map(col => col.COLUMN_NAME).join(', ')
    const [rows] = await db.query(`SELECT ${columnNames} FROM ${tableName}`)

    return rows
}

module.exports = selectAllExcept