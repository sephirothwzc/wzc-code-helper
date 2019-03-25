const inflect = require('i')();
const _ = require('lodash');

class EggModelTemplate {
  constructor (elitem, columns, conn) {
    this.elitem = elitem;
    this.columns = columns;
    this.conn = conn;
  }

  findTypeTxt (element, getLength = true) {
    switch (element.DATA_TYPE) {
      case 'nvarchar':
      case 'varchar':
        if (element.CHARACTER_MAXIMUM_LENGTH && getLength) {
          return `STRING(${element.CHARACTER_MAXIMUM_LENGTH})`;
        }
        return 'STRING';
      case 'datetime':
        return `DATE`;
      case 'timestamp':
      case 'int':
        return `INTEGER`;
      case 'decimal':
        return `DECIMAL`;
      case 'boolean':
        return 'BOOLEAN';
      case 'bigint':
        return 'BIGINT';
      case 'double':
        return 'DOUBLE';
      case 'json':
        return 'app.Sequelize.JSON';
    }
  }
  /**
   * 设置attributes
   *
   * @returns
   * @memberof EggModelTemplate
   */
  privateFindModelAttributes () {
    let attr = '[';
    _(this.columns)
      .filter(
        x =>
          x.COLUMN_NAME !== 'created_at' &&
          x.COLUMN_NAME !== 'updated_at' &&
          x.COLUMN_NAME !== 'deleted_at'
      )
      .map(p => {
        const colName = p.COLUMN_NAME;
        const proName = inflect.camelize(p.COLUMN_NAME, false);
        if (colName.length === proName.length) {
          return ` '${proName}'`;
        } else {
          return ` [ '${colName}', '${proName}' ]`;
        }
      })
      .value()
      .forEach(p => {
        attr += p;
        attr += ',';
      });
    attr += ']';
    return attr;
  }

  findModelTxt () {
    let col = '';
    const typeGroup = ['BIGINT'];
    this.columns
      .filter(x => x.COLUMN_NAME !== 'id')
      .forEach(element => {
        const typetest = this.findTypeTxt(element, false);
        !typeGroup.includes(typetest) && typeGroup.push(typetest);
        // #region
        col += `// ${element.COLUMN_COMMENT}
        ${inflect.camelize(element.COLUMN_NAME, false)}: ${this.findTypeTxt(
  element
)},
        `;
        // #endregion
      });
    // const attr = this.privateFindModelAttributes();
    // return '123' + col + attr

    return `'use strict';
const FlakeId = require('flake-idgen');
const intformat = require('biguint-format');
const flakeIdGen = new FlakeId({ epoch: 1300000000000 });

module.exports = app => {
  const { ${typeGroup.toString()} } = app.Sequelize;

  const ${inflect.camelize(this.elitem.TABLE_NAME)}Do = app.model.define(
    '${inflect.camelize(this.elitem.TABLE_NAME, false)}',
    {
      id: {
        type: BIGINT,
        primaryKey: true,
        defaultValue: () => intformat(flakeIdGen.next(), 'dec'),
      },
      ${col}
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: '${this.elitem.TABLE_NAME}',
      underscored: true,
      paranoid: true
      ${this.conn.createdAt ? '' : '//'} createdAt: '${this.conn.createdAt}',
      ${this.conn.updatedAt ? '' : '//'} updatedAt: '${this.conn.updatedAt}',
      ${this.conn.deletedAt ? '' : '//'} deletedAt: '${this.conn.deletedAt}',
    }
  );

  return ${inflect.camelize(this.elitem.TABLE_NAME)}Do;
};
`;
  }
}

export default EggModelTemplate;
