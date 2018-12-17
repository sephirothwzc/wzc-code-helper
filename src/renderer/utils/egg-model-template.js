const inflect = require('i')()

class EggModelTemplate {
  constructor (elitem, columns, conn) {
    this.elitem = elitem
    this.columns = columns
    this.conn = conn
  }

  findTypeTxt (element) {
    switch (element.DATA_TYPE) {
      case 'nvarchar':
      case 'varchar':
        if (element.CHARACTER_MAXIMUM_LENGTH) {
          return `STRING(${element.CHARACTER_MAXIMUM_LENGTH})`
        }
        return 'STRING'
      case 'datetime':
        return `DATE`
      case 'timestamp':
      case 'int':
        return `INTEGER`
      case 'decimal':
        return `DECIMAL`
      case 'boolean':
        return 'BOOLEAN'
      case 'bigint':
        return 'BIGINT'
      case 'double':
        return 'DOUBLE'
    }
  }

  findModelTxt () {
    let col = ''
    this.columns
      .filter(
        x =>
          x.COLUMN_NAME !== 'id' &&
          x.COLUMN_NAME !== 'create_date' &&
          x.COLUMN_NAME !== 'update_date'
      )
      .forEach(element => {
        col += `// ${element.COLUMN_COMMENT}
        ${inflect.camelize(
    element.COLUMN_NAME,
    false
  )}: { type: ${this.findTypeTxt(element)}, field: '${
  element.COLUMN_NAME
}' },
        `
      })
    return `'use strict';
const snowflake = require('node-snowflake').Snowflake;

module.exports = app => {
  const { STRING, INTEGER, DATE, DOUBLE, DECIMAL, BIGINT, BOOLEAN } = app.Sequelize;

  const ${inflect.camelize(this.elitem.table_name)}Do = app.model.define(
    '${this.elitem.table_name}',
    {
      id: {
        type: STRING(36),
        primaryKey: true,
        defaultValue: snowflake.nextId(),
      },
      ${col}
    },
    {
      timestamps: false,
      freezeTableName: true,
      underscored: false,
      createdAt: '${this.conn.createdAt}',
      updatedAt: '${this.conn.updatedAt}',
    }
  );

  return ${inflect.camelize(this.elitem.table_name)}Do;
};
`
  }
}

export default EggModelTemplate
