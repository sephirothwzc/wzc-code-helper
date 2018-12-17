const inflect = require('i')()

class EggModelTemplate {
  constructor (elitem, columns) {
    this.elitem = elitem
    this.columns = columns
  }

  findTypeTxt (element) {
    switch (element.DATA_TYPE) {
      case 'varchar':
        return `STRING(${element.CHARACTER_MAXIMUM_LENGTH})`
      case 'datetime':
        return `DATE`
      case 'timestamp':
      case 'int':
        return `INTEGER`
      case 'decimal':
        return `DOUBLE`
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
        col += `${inflect.camelize(
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
  const { STRING, INTEGER, DATE, DOUBLE } = app.Sequelize;

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
      createdAt: 'create_date',
      updatedAt: 'update_date',
    }
  );

  return ${inflect.camelize(this.elitem.table_name)}Do;
};
`
  }
}

export default EggModelTemplate
