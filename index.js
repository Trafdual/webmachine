const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const machineroutes = require('./router/MachineRoutes')

var app = express()
app.use(methodOverride('_method'))

const uri =
  'mongodb+srv://totnghiepduan2023:webmachine123@cluster0.tzx1qqh.mongodb.net/webmachine?retryWrites=true&w=majority&appName=webmachine'

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log('kết nối thành công'))

const mongoStoreOptions = {
  mongooseConnection: mongoose.connection,
  mongoUrl: uri,
  collection: 'sessions'
}

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create(mongoStoreOptions),
    cookie: {
      secure: false
    }
  })
)
app.use(cors())
app.use(express.static(path.join(__dirname, '/uploads')))

app.use('/', machineroutes)

app.listen(3090, () => {
  try {
    console.log('kết nối thành công 3090')
  } catch (error) {
    console.log('kết nối thất bại 3090', error)
  }
})
