// import mysql from 'mysql2'
const mysql = require('mysql')
const mssql = require('mssql')

class SqlHelper {
  constructor (conn) {
    this.connString = conn
  }

  findTablesSql () {
    switch (this.connString.dbType) {
      case 'mysql': {
        return `select table_name AS TABLE_NAME,table_comment AS TABLE_COMMENT from information_schema.tables where table_schema='${
          this.connString.database
        }' order by table_name`
      }
      case 'mssql': {
        return "SELECT DISTINCT d.name as TABLE_NAME,f.value as TABLE_COMMENT FROM syscolumns a LEFT JOIN systypes b ON a.xusertype= b.xusertype INNER JOIN sysobjects d ON a.id= d.id AND d.xtype= 'U' AND d.name<> 'dtproperties' LEFT JOIN syscomments e ON a.cdefault= e.id LEFT JOIN sys.extended_properties g ON a.id= G.major_id AND a.colid= g.minor_id LEFT JOIN sys.extended_properties f ON d.id= f.major_id AND f.minor_id= 0 order by d.name"
      }
    }
  }

  findColumnSql (tableName) {
    switch (this.connString.dbType) {
      case 'mysql': {
        return `SELECT * FROM information_schema.columns WHERE table_schema='${
          this.connString.database
        }' AND table_name='${tableName}' order by COLUMN_NAME`
      }
      case 'mssql': {
        return `SELECT 
A.name AS table_name,a.value AS COLUMN_COMMENT
,d.COLUMN_NAME,d.DATA_TYPE,d.CHARACTER_MAXIMUM_LENGTH,d.IS_NULLABLE
FROM 
sys.extended_properties a, 
sysobjects b, 
sys.columns c,
information_schema.columns d
WHERE 
a.major_id = b.id 
AND c.object_id = b.id 
AND c.column_id = a.minor_id 
and c.name = d.COLUMN_NAME
AND b.name = '${tableName}'
and d.table_name='${tableName}'`
      }
    }
  }

  query (sql, resultFunc, errFunc) {
    this[`${this.connString.dbType}query`](sql, resultFunc, errFunc)
  }

  mysqlquery (sql, resultFunc, errFunc) {
    const connection = mysql.createConnection({
      host: this.connString.host,
      port: this.connString.port,
      user: this.connString.user,
      password: this.connString.password,
      database: this.connString.database
    })
    connection.connect(err => {
      if (err) {
        errFunc(err)
      }
    })
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        errFunc(err)
      }
      resultFunc(rows)
    })
    connection.end(() => { })
  }

  async mssqlquery (sql, resultFunc, errFunc) {
    let pool = await mssql.connect({
      user: this.connString.user,
      password: this.connString.password,
      server: this.connString.host,
      database: this.connString.database,
      port: this.connString.port
    })
    pool
      .request()
      .query(sql)
      .then(result => {
        resultFunc(result.recordset)
        mssql.close()
      })
      .catch(err => {
        errFunc(err)
        mssql.close()
      })

    mssql.on('error', err => {
      errFunc(err)
    })
  }
}

export default SqlHelper
