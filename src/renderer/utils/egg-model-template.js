const inflect = require('i')()
const _ = require('lodash')

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
  /**
   * 设置attributes
   *
   * @returns
   * @memberof EggModelTemplate
   */
  privateFindModelAttributes () {
    let attr = '['
    _(this.columns).filter(
      x =>
        x.COLUMN_NAME !== 'created_at' &&
        x.COLUMN_NAME !== 'updated_at' &&
        x.COLUMN_NAME !== 'deleted_at'
    ).map(p => {
      const colName = p.COLUMN_NAME
      const proName = inflect.camelize(p.COLUMN_NAME, false)
      if (colName.length === proName.length) {
        return ` '${proName}'`
      } else {
        return ` [ '${colName}', '${proName}' ]`
      }
    }).value().forEach(p => {
      attr += p
      attr += ','
    })
    attr += ']'
    return attr
  }

  findModelTxt () {
    let col = ''
    this.columns
      .filter(
        x =>
          x.COLUMN_NAME !== 'id'
      )
      .forEach(element => {
        // #region
        col += `// ${element.COLUMN_COMMENT}
        ${inflect.camelize(
    element.COLUMN_NAME,
    false
  )}: { type: ${this.findTypeTxt(element)}, field: '${
  element.COLUMN_NAME
}' },
        `
        // #endregion
      })
    const attr = this.privateFindModelAttributes()
    // return '123' + col + attr

    return `'use strict';
const snowflake = require('node-snowflake').Snowflake;

module.exports = app => {
  const { STRING, INTEGER, DATE, DOUBLE, DECIMAL, BIGINT, BOOLEAN } = app.Sequelize;

  const ${inflect.camelize(this.elitem.TABLE_NAME)}Do = app.model.define(
    '${this.elitem.TABLE_NAME}',
    {
      id: {
        type: BIGINT,
        primaryKey: true,
        defaultValue: () => snowflake.nextId(),
      },
      ${col}
    },
    {
      timestamps: false,
      freezeTableName: true,
      underscored: true,
      underscoredAll: true,
      paranoid: true
      // createdAt: '${this.conn.createdAt}',
      // updatedAt: '${this.conn.updatedAt}',
      // deletedAt: 'deleted_at',
    }
  );

  ${inflect.camelize(this.elitem.TABLE_NAME)}Do.attributes = ${attr};

  return ${inflect.camelize(this.elitem.TABLE_NAME)}Do;
};
`
  }
}

export default EggModelTemplate
