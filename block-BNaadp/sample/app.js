let express = require('express');
const cookieParser = require('cookie-parser');
let app = express()

app.use(cookieParser())

app.use((req,res)=>{
res.cookie('name', 'lovekush')
})

app.listen(5000, () => {
    console.log('port is listening on server 5000')
})