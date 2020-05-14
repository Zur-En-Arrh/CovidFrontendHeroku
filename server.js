const express = require('express')
const app = express()
//Permite usar o caminho para ver os arquivos na pasta
app.use(express.static('.'))

app.listen(8080, () => console.log('Executando...'))
