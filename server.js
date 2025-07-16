const mongoose = require("mongoose")
const dotenv = require("dotenv")


dotenv.config({ path: "./config.env" })
const app = require("./app")

const DB = process.env.DATABASE

mongoose.connect(DB).then(() => console.log("DB connection Successful"))

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})
