const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

const app = express()
app.use(express.json())
const allowedOrigins = [
  'http://localhost:3000',
  'https://hieuphungfpt.sbs',
  'https://api.hieuphungfpt.sbs'
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      } else {
        return callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  })
)


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.get('/', (req, res) => {
  res.send('Welcome to User and Plan Management Backend!')
})

const userRoutes = require('./routes/users')
app.use('/api/users', userRoutes)

const planRoutes = require('./routes/plans')
app.use('/api/plans', planRoutes)

const PORT = process.env.PORT || 3090
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
