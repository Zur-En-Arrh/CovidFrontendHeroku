const express = require('express')
const app = express()
//Permite usar o caminho para ver os arquivos na pasta
app.use(express.static('.'))

//process.env.PORT || 8080
app.listen(process.env.PORT || 8080, () => console.log('Executando...'))
