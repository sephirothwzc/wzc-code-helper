/*
 * @Author: 吴占超
 * @Date: 2019-05-26 10:04:42
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-07-22 17:01:23
 */
const inflect = require('i')();

const findTypeTxt = Symbol('findTypeTxt');
const findLength = Symbol('findLength');
const findEnum = Symbol('findEnum');

class JoiSchema {
  constructor (elitem, columns, conn) {
    this.elitem = elitem;
    this.columns = columns;
    this.conn = conn;
  }

  [findTypeTxt] (element, getLength = true) {
    switch (element.DATA_TYPE) {
      case 'nvarchar':
      case 'varchar':
      case 'bigint':
        return 'string()';
      case 'datetime':
        return `date()`;
      case 'timestamp':
      case 'int':
      case 'decimal':
      case 'double':
        return `number()`;
      case 'boolean':
        return 'boolean()';
      case 'json':
        return 'object()';
    }
  }

  [findLength] (element) {
    switch (element.DATA_TYPE) {
      case 'nvarchar':
      case 'varchar':
        return `.max(${element.CHARACTER_MAXIMUM_LENGTH})`;
      case 'datetime':
      case 'timestamp':
      case 'int':
      case 'decimal':
      case 'boolean':
      case 'bigint':
      case 'double':
      case 'json':
        return '';
    }
  }

  [findEnum] (element) {
    if (!element.COLUMN_COMMENT) {
      return '';
    }
    const regex2 = /\[(.+?)\]/g; // [] 中括号
    const value = element.COLUMN_COMMENT.match(regex2);
    if (!value) {
      return '';
    }
    const ee = value[value.length - 1]
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .map(p => {
        const rd3 = p.split(' ');
        return rd3[1] ? `'${rd3[1]}'` : `'${rd3[0]}'`;
      })
      .join(',')
      .toString();
    return `.valid(${ee})`;
  }

  findSchema () {
    let col = '';
    this.columns
      .filter(
        x =>
          x.COLUMN_NAME !== 'id' &&
          x.COLUMN_NAME !== 'created_at' &&
          x.COLUMN_NAME !== 'updated_at' &&
          x.COLUMN_NAME !== 'deleted_at'
      )
      .forEach(element => {
        const typeString = this[findTypeTxt](element);
        const lengthStr = this[findLength](element);
        const enumString = this[findEnum](element);
        // #region
        col += `  ${inflect.camelize(element.COLUMN_NAME, false)}: joi.${typeString}.required()${lengthStr}${enumString}.description('${element.COLUMN_COMMENT}'),
`;
        // #endregion
      });
    // const attr = this.privateFindModelAttributes();
    // return '123' + col + attr

    return `
export const ${inflect.camelize(this.elitem.TABLE_NAME)} = joi.object().keys({
  ${col}
});
`;
  }
}

export default JoiSchema;
