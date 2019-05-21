/*
 * @Author: 吴占超
 * @Date: 2019-05-20 22:47:00
 * @Last Modified by: 吴占超
 * @Last Modified time: 2019-05-21 09:50:11
 */
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
        return 'String';
      case 'datetime':
        return `Date`;
      case 'timestamp':
      case 'int':
        return `Number`;
      case 'decimal':
        return `Number`;
      case 'boolean':
        return 'Boolean';
      case 'bigint':
        return 'String';
      case 'double':
        return 'Number';
      case 'json':
        return 'json';
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

  findLength (element) {
    switch (element.DATA_TYPE) {
      case 'nvarchar':
      case 'varchar':
        return `
        length:${element.CHARACTER_MAXIMUM_LENGTH}`;
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

  findEnum (COLUMN_COMMENT, typeString) {
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
      .map(p => typeString === 'string' ? `'${p}'` : p)
      .join(',')
      .toString();
    return `
    enum: [${ee}]`;
  }

  findModelTxt () {
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
        const typeString = this.findTypeTxt(element);
        // #region
        col += `// ${element.COLUMN_COMMENT}
  @Column({ ${this.findEnum(element.COLUMN_COMMENT, typeString)}
    comment: '${element.COLUMN_COMMENT}',
    name: '${element.COLUMN_NAME}', ${this.findLength(element)}
  })
  ${inflect.camelize(element.COLUMN_NAME, false)}: ${typeString};
        `;
        // #endregion
      });
    // const attr = this.privateFindModelAttributes();
    // return '123' + col + attr

    return `import BizEntity from './BizEntity';
import { Entity, Column } from 'typeorm';

@Entity({ name: '${this.elitem.TABLE_NAME}' })
export class ${inflect.camelize(this.elitem.TABLE_NAME)} extends BizEntity {

  ${col}
}
`;
  }
}

export default EggModelTemplate;
