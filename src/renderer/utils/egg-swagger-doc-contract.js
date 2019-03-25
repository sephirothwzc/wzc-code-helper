/*
 * @Author: 吴占超
 * @Date: 2019-03-25 18:01:51
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-03-25 18:45:36
 */
'use strict';
const inflect = require('i')();
// const _ = require('lodash');

class EggContractTemplate {
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
          return `string`;
        }
        return 'string';
      case 'datetime':
        return `string`;
      case 'timestamp':
      case 'int':
        return `integer`;
      case 'decimal':
        return `number`;
      case 'boolean':
        return 'boolean';
      case 'bigint':
        return 'string';
      case 'double':
        return 'number';
      case 'json':
        return '自定义类型手动修改吧';
    }
  }

  findEnum (COLUMN_COMMENT) {
    if (!COLUMN_COMMENT) {
      return '';
    }
    const regex2 = /\[(.+?)\]/g; // [] 中括号
    const value = COLUMN_COMMENT.match(regex2);
    if (!value) {
      return '';
    }
    const ee = value[value.length - 1]
      .split(',')
      .map(p => `'${p}'`)
      .join(',')
      .toString();
    return `
    enum: [${ee}]`;
  }

  findModelTxt () {
    let col = '';
    const typeGroup = ['BIGINT'];
    this.columns
      .filter(
        x =>
          x.COLUMN_NAME !== 'id' &&
          x.COLUMN_NAME !== 'created_at' &&
          x.COLUMN_NAME !== 'updated_at' &&
          x.COLUMN_NAME !== 'deleted_at'
      )
      .forEach(element => {
        const typetest = this.findTypeTxt(element, false);
        !typeGroup.includes(typetest) && typeGroup.push(typetest);
        // #region
        col += `// ${element.COLUMN_COMMENT}
        ${inflect.camelize(element.COLUMN_NAME, false)}:{ 
          type: '${this.findTypeTxt(element)}', 
          // required: true, 
          // example: '1' ,${this.findEnum(element.COLUMN_COMMENT)}
        },
        `;
        // #endregion
      });

    return `  ${inflect.camelize(this.elitem.TABLE_NAME)}: {
    ${col}
  },`;
  }
}

export default EggContractTemplate;
