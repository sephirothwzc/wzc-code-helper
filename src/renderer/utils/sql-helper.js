// import mysql from 'mysql2'
const mysql = require('mysql')

class SqlHelper {
  constructor (conn) {
    this.connString = conn
  }

  findTablesSql () {
    switch (this.connString.dbType) {
      case 'mysql': {
        return `select table_name,table_comment from information_schema.tables where table_schema='${
          this.connString.database
        }'`
      }
    }
  }

  findColumnSql (tableName) {
    switch (this.connString.dbType) {
      case 'mysql': {
        return `SELECT * FROM information_schema.columns WHERE table_schema='${
          this.connString.database
        }' AND table_name='${tableName}'`
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
    connection.end(() => {})
  }
}

export default SqlHelper
