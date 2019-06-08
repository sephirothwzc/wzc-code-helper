<template>
  <el-container style="height:auto; border: 1px solid #eee">
    <el-aside width="auto" style="background-color: rgb(238, 241, 246)">
      <el-menu :default-openeds="['1', '3']">
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-message"></i>
            {{dbConn.database}}
          </template>
          <el-menu-item-group>
            <template slot="title">表</template>
            <el-menu-item
              v-for="(elitem,index) in tableData"
              :key="elitem.TABLE_NAME"
              :index="`1-${index}`"
              @click="menuColumn(elitem)"
            >{{elitem.TABLE_NAME}}-{{elitem.TABLE_COMMENT}}</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-button type="primary" circle @click="clickTypeorm">
          typeorm-entity
          <i class="el-icon-upload el-icon--download"></i>
        </el-button>
        <el-button type="primary" circle @click="clickSequelizeTypeScriptModel">
          st-model
          <i class="el-icon-upload el-icon--download"></i>
        </el-button>
        <el-button type="primary" circle @click="eggModelClick">
          egg-model
          <i class="el-icon-upload el-icon--download"></i>
        </el-button>
        <el-button type="primary" circle @click="eggContractClick">
          egg-contract
          <i class="el-icon-upload el-icon--download"></i>
        </el-button>
        <el-button type="danger" icon="el-icon-setting" circle @click="settingClick"></el-button>
        <span>{{dbConn.dbType}}</span>
        <el-button type="danger" icon="el-icon-delete" circle @click="deleteClick"></el-button>
      </el-header>

      <el-main>
        <el-table :data="columnData">
          <el-table-column prop="COLUMN_NAME" label="字段名"></el-table-column>
          <el-table-column prop="COLUMN_COMMENT" label="说明"></el-table-column>
          <el-table-column prop="IS_NULLABLE" label="必填"></el-table-column>
          <el-table-column prop="DATA_TYPE" label="数据类型"></el-table-column>
          <el-table-column prop="CHARACTER_MAXIMUM_LENGTH" label="长度"></el-table-column>
        </el-table>
      </el-main>
    </el-container>
    <!-- 弹出数据选择 -->
    <el-dialog width="90vw" custom-class="dialog" title="数据库设置" :visible.sync="dialogFormVisible">
      <el-form :model="dbConn">
        <el-form-item label="数据库" :label-width="formLabelWidth">
          <el-select v-model="dbConn.dbType" placeholder="请选择数据库类型">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="host" :label-width="formLabelWidth">
          <el-input v-model="dbConn.host" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="port" :label-width="formLabelWidth">
          <el-input v-model="dbConn.port" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="user" :label-width="formLabelWidth">
          <el-input v-model="dbConn.user" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="password" :label-width="formLabelWidth">
          <el-input v-model="dbConn.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="database" :label-width="formLabelWidth">
          <el-input v-model="dbConn.database" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="createdAt" :label-width="formLabelWidth">
          <el-input v-model="dbConn.createdAt" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="updatedAt" :label-width="formLabelWidth">
          <el-input v-model="dbConn.updatedAt" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="deletedAt" :label-width="formLabelWidth">
          <el-input v-model="dbConn.deletedAt" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitClick">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 代码生成 -->
    <el-dialog width="90vw" custom-class="dialog" title="代码生成" :visible.sync="dialogCodeVisible">
      <el-input type="textarea" :rows="10" v-model="htmlTxt" autocomplete="off"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCodeVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import SqlHelper from '@/utils/sql-helper.js'
import EggModelTemplate from '@/utils/egg-model-template5.js'
import TypeormEntityTemplate from '@/utils/typeorm-entity-template.js';
import EggSwaggerDocContract from '@/utils/egg-swagger-doc-contract.js';
import SequelizeTypeScriptModel from '@/utils/sequelize-typescript-model.js'

export default {
  data: () => ({
    formLabelWidth: '120px',
    dialogFormVisible: false,
    dialogCodeVisible: false,
    dbConn: {
      dbType: undefined,
      host: undefined,
      port: undefined,
      user: undefined,
      password: undefined,
      database: undefined,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    },
    options: [{
      value: 'mysql',
      label: 'mysql'
    }, {
      value: 'mssql',
      label: 'mssql'
    }],
    tableData: undefined,
    sqlHelper: undefined,
    columnData: undefined,
    tableElement: undefined,
    htmlTxt: undefined
  }),
  created () {
    // 数据库链接
    this.initListTable()
  },
  methods: {
    // 加载试图和表格
    initListTable () {
      try {
        const db = window.localStorage.getItem('dbConn')
        if (db) {
          this.dbConn = JSON.parse(db)
          this.submitClick()
        } else {
          this.dialogFormVisible = true
        }
      } catch (err) {
        console.log(err)
        this.dialogFormVisible = true
      }
    },
    submitClick () {
      window.localStorage.setItem('dbConn', JSON.stringify(this.dbConn))
      this.sqlHelper = new SqlHelper(this.dbConn)
      this.sqlHelper.query(this.sqlHelper.findTablesSql(), (rows) => {
        this.tableData = rows
        this.dialogFormVisible = false
      }, (errFunc) => {
        console.log(errFunc)
      })
    },
    settingClick () {
      this.dialogFormVisible = !this.dialogFormVisible
    },
    menuColumn (elitem) {
      this.tableElement = elitem
      this.sqlHelper.query(this.sqlHelper.findColumnSql(elitem.TABLE_NAME), (rows) => {
        this.columnData = rows
      }, (errFunc) => {
        console.log(errFunc)
      })
    },
    clickSequelizeTypeScriptModel () {
      if (!this.tableElement) {
        return this.$message.error('请先点选表格！')
      }
      this.htmlTxt = new SequelizeTypeScriptModel(this.tableElement, this.columnData, this.dbConn).findModelTxt()
      this.dialogCodeVisible = true
      // this.$prompt('typeorm-entity 内容', '提示', {
      //   confirmButtonText: '确定',
      //   inputType: 'textarea',
      //   inputValue: this.htmlTxt
      // }).then((result) => {
      //   console.log(result)
      // }).catch((err) => {
      //   console.log(err)
      // })
    },
    clickTypeorm () {
      if (!this.tableElement) {
        return this.$message.error('请先点选表格！')
      }
      this.htmlTxt = new TypeormEntityTemplate(this.tableElement, this.columnData, this.dbConn).findModelTxt()
      this.$prompt('typeorm-entity 内容', '提示', {
        confirmButtonText: '确定',
        inputType: 'textarea',
        inputValue: this.htmlTxt
      }).then((result) => {
        console.log(result)
      }).catch((err) => {
        console.log(err)
      })
    },
    eggModelClick () {
      if (!this.tableElement) {
        return this.$message.error('请先点选表格！')
      }
      this.htmlTxt = new EggModelTemplate(this.tableElement, this.columnData, this.dbConn).findModelTxt()
      this.$prompt('model内容', '提示', {
        confirmButtonText: '确定',
        inputType: 'textarea',
        inputValue: this.htmlTxt
      }).then((result) => {
        console.log(result)
      }).catch((err) => {
        console.log(err)
      })
    },
    eggContractClick () {
      if (!this.tableElement) {
        return this.$message.error('请先点选表格！')
      }
      this.htmlTxt = new EggSwaggerDocContract(this.tableElement, this.columnData, this.dbConn).findModelTxt()
      this.$prompt('model内容', '提示', {
        confirmButtonText: '确定',
        inputType: 'textarea',
        inputValue: this.htmlTxt
      }).then((result) => {
        console.log(result)
      }).catch((err) => {
        console.log(err)
      })
    },
    deleteClick () {
      window.localStorage.removeItem('dbConn')
    }
  }
}
</script>

<style scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}

.dialog {
  width: 80vw;
  height: 80vh;
}
</style>