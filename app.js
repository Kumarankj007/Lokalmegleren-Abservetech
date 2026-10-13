import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import webmeglerRoutes from './routes/webmeglerRoute.js'

const app = express()
app.use(express.json({ limit: '500mb' }))
app.use(cors())
app.use("/uploads", express.static("uploads"));
app.use(morgan('dev'))
app.use(express.urlencoded({ limit: '500mb', extended: true }))
app.use('/api', webmeglerRoutes)


mongoose.connect('mongodb://localhost:27017/lokalmegleren')
  .then(() => console.log('Mongodb Connected Successfully'))
  .catch((err) => console.error('Mongodb Connection Failed:', err))

app.get('/', (req, res) => {
  res.send('Api Working')
})

app.listen(3005, () => {
  console.log('Server is running on port 3005')
})
