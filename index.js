const express = require('express')
const basicAuth = require('express-basic-auth')
const mysql = require('mysql')
const argv = require('minimist')(process.argv.slice(2))
const authUsers = require('./auth-users.json')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const { genSerialCode } = require('./utils')

const { u: user, p: password, database } = argv
if (!user || !password || !database) {
  console.log('usage: node index.js -u "username" -p "password" -database "dbname"')
  process.exit(1)
}

const app = express()
const port = 8200

app.use(basicAuth({
  users: authUsers,
  challenge: true,
  realm: 'Imb4T3st4ppXN'
}))

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

const pool  = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user,
  password,
  database: database
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/gen', (req, res, next) => {
  const amount = parseInt(req.body.amount)
  if (amount <= 0) {
    return next(new Error('生产数量必须大于0'))
  }

  pool.getConnection((err, connection) => {
    if (err) {
      return next(err)
    }
    connection.beginTransaction(err => {
      if (err) {
        return next(err)
      }
      connection.query('INSERT INTO batch SET amount = ?', [amount], (err, results) => {
        if (err) {
          return connection.rollback(function() {
            next(err)
          })
        }
        const batchId = results.insertId
        // 1000 records per insert
        const batchNum = 1000

        const serials = genSerialCode(batchId, amount)

        function batchInsert() {
          let records = serials.slice(index * batchNum, (index + 1) * batchNum)

          connection.query('INSERT INTO serial (batch_id, serial, code, dos) VALUES ?', [records], (err) => {
            if (err) {
              return connection.rollback(function() {
                next(err)
              })
            }
            index++
            if (index < top) {
              batchInsert()
            } else {
              // commit transaction
              connection.commit(function(err) {
                if (err) {
                  return connection.rollback(function() {
                    next(err)
                  })
                }
                res.send('success')
              })
            }
          })
        }

        let index = 0, top = Math.ceil(amount / batchNum)
        batchInsert()
      })
    })
  })
})

app.get('/api/batches', (req, res) => {
  const page = parseInt(req.query.page), size = parseInt(req.query.size)
  pool.query('SELECT * FROM batch ORDER BY created_at DESC LIMIT ? OFFSET ?', [size, page * size], (err, result) => {
    if (err) {
      return failJSON(res, err)
    }
    pool.query('SELECT COUNT(*) as count FROM batch', (err, result2) => {
      if (err) {
        return failJSON(res, err)
      }
      const [{count}] = result2

      res.header('Content-Type', 'text/plain; charset=UTF-8');
      res.json(({
        code: 0,
        message: 'OK',
        data: {
          total: count,
          page,
          size,
          data: result
        }
      }))
    })
  })
})

app.get('/api/download/:batchId', (req, res) => {
  const batchId = req.params.batchId
  pool.query('SELECT serial, code FROM serial WHERE batch_id = ?', [batchId], (err, result) => {
    if (err) {
      return failJSON(res, err)
    }
    // create directory if not exist
    const dir = './download'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    const filepath = `${dir}/${batchId}.csv`
    if (fs.existsSync(filepath)) {
      res.download(filepath, `WN-${batchId}.csv`)
    } else {
      const header = ['序列号,防伪码']
      const rows = result.map(row => `${row.serial},${row.code}`)
      const fileContent = header.concat(rows).join('\n')
      fs.writeFile(filepath, fileContent, err => {
        if (err) {
          return failJSON(res, err)
        } else {
          res.download(filepath, `WN-${batchId}.csv`)
        }
      })
    }
  })
})

function failJSON(res, err) {
  res.header('Content-Type', 'text/plain; charset=UTF-8');
  res.json({
    code: err.code,
    message: err.message
  })
  return
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})