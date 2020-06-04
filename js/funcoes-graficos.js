const FLASK_API_BASE_URL = 'https://covid-19-flask-api.herokuapp.com/'
//const JS_API_BASE_URL = 'http://localhost:3000/'
const JS_API_BASE_URL = 'https://covidcoleta.herokuapp.com/'

let elementos = []
let selecionado = null
let tabela = []

function choosePath(temporal = false)
{
    if(temporal) {
        const combo = document.querySelector('select#csv')
        const item = combo.options[combo.selectedIndex].value
        if(item == 'estados') {
            //
            /*if(document.querySelector('div#radioDados').innerHTML !== ''){
                document.querySelector('div#radioDados').innerHTML = ''
                const label = document.querySelector('label[for=dados]')
                estadoComboBox.parentNode.removeChild(estadoComboBox)
                label.parentNode.removeChild(label)
            }*/
            const gvalueComboBox = document.querySelector('select#gvalue')
            if(gvalueComboBox) {
                gvalueComboBox.parentNode.removeChild(gvalueComboBox)
                const label = document.querySelector('label[for=gvalue]')
                label.parentNode.removeChild(label)
            }

            fillComboBox('temporal')
        }else {
            const estadoComboBox = document.querySelector('select#dados')
            if(estadoComboBox){
                console.log('entrei aqui')
                //document.querySelector('div#radioDados').innerHTML = ''*/
                let label = document.querySelector('label[for=gvalue]')
                if(label)
                    label.parentNode.removeChild(label)
                label = document.querySelector('label[for=dados]')
                label.parentNode.removeChild(label)
                const cidades = document.querySelector('select#gvalue')
                if(cidades) {
                    estadoComboBox.parentNode.removeChild(estadoComboBox)
                    cidades.parentNode.removeChild(cidades)
                }
            }
            createOptions('estado')
            //createRadioButton('estado')
        }
    }else {
        const combo = document.querySelector('select#csv')
        const item = combo.options[combo.selectedIndex].value
        if(item == 'estados')
        {
            elementos = []
            document.querySelector('ul#lista').innerHTML = ''
            document.querySelector('div.multiselect').innerHTML = ''
            fillComboBox()
            
        }else{
            elementos = []
            document.querySelector('ul#lista').innerHTML = ''
            const estadoComboBox = document.querySelector('select#dados')
            if(estadoComboBox){
                const label = document.querySelector('label[for=dados]')
                estadoComboBox.parentNode.removeChild(estadoComboBox)
                label.parentNode.removeChild(label)
            }
            createCheckBoxes('cidade')
        }
    }
}

function createOptions(type) {
    const formGValue = document.querySelector('div#formgvalue')
    if(formGValue)
        formGValue.parentNode.removeChild(formGValue)
    const formGroup = document.createElement('div')
    formGroup.setAttribute('class', 'form-group')
    formGroup.setAttribute('id', 'formgvalue')

    const label = document.createElement('label')
    label.setAttribute('for', 'gvalue')

    const elemento = document.createElement('select')
    elemento.setAttribute('id', 'gvalue')
    elemento.setAttribute('class', 'form-control')
    
    
    let estado = null
    url = ''
    if(type == 'cidade') {
        label.innerText = 'Cidades'
        const combo = document.querySelector('select#dados')
        estado = combo.options[combo.selectedIndex].value
        url += JS_API_BASE_URL
        url += `data/cidades/${estado}`
    }else {
        label.innerText = 'Estados'
        url += FLASK_API_BASE_URL
        url += `data/estados`
    }
    formGroup.appendChild(label)
    axios(url)
    .then(resposta => {
        elemento.innerHTML = ''
        resposta.data.sort()
        resposta.data.forEach(jsonItem => {
            const child = `<option value="${jsonItem.replace("-", "*")}"> 
            ${jsonItem.split('-')[0]}
            </option>`
            elemento.innerHTML += child
        })
        formGroup.appendChild(elemento)
        document.querySelector('div#select-group').appendChild(formGroup)
    })
    .catch(err => console.log(err))
    

    /*
    if(type == 'estado') {
        
    }else {
        
    }

    //console.log(url)

    const elemento = document.querySelector('div#radioDados')
    axios(url)
        .then(resposta => {
            elemento.innerHTML = ''
            resposta.data.forEach(jsonItem => {
                const child = `<div class="form-check"> 
                <input type="radio" onclick="selecionarItem('${jsonItem}')" class="form-check-input" id="id${jsonItem}" value="${jsonItem}" name="gvalue" ${selecionado === jsonItem?'checked':''}/> 
                <label class="form-check-label" for="id${jsonItem}">${jsonItem}</label>
                </div>`
                elemento.innerHTML += child
            })
        })
        .catch(err => console.log(err))*/
}

function selecionarItem(valor) {
    selecionado = valor
}

function createTemporalSeries() {

    const values = document.querySelector('select#gvalue')
    if(values) {
        const gvalue = values.options[values.selectedIndex].value

        const obj = {
            valor: {Value: gvalue}, 
            taxa: {Value: 'Population'}
        }

        

        const comboEstados = document.querySelector('select#csv')
        const item = comboEstados.options[comboEstados.selectedIndex].innerText
        if(item == 'Por Cidades') {
            obj.tipo = {Value: 'city'}
            /**/
        }else if (item == 'Por Estados') {
            obj.tipo = {Value: 'state'}
        }

        const url = FLASK_API_BASE_URL+`temporalseries`
        console.log(obj)
        plotsAjax(url, obj, 'temporal')
    }else {
        alert('Selecione um município ou estado para gerar o gráfico')
    }
    
}

function fillComboBox(input = 'checkbox') {
    const formGroup = document.createElement('div')
    formGroup.setAttribute('class', 'form-group')

    const label = document.createElement('label')
    label.setAttribute('for', 'dados')

    const elemento = document.createElement('select')
    elemento.setAttribute('id', 'dados')
    elemento.setAttribute('class', 'form-control')
    
    const combo = document.querySelector('select#csv')
    let item = combo.options[combo.selectedIndex].value
    if(item == 'Cities')
        label.innerText = 'Cidades'
    else
        label.innerText = 'Estados'
    formGroup.appendChild(label)
    if(item === 'estados') {
        axios(FLASK_API_BASE_URL+`data/${item}`)
            .then(resposta => {
                //console.log(resposta.data)
                elemento.innerHTML = ''
                resposta.data.sort()
                resposta.data.forEach(obj => {
                    const child = document.createElement('option')
                    child.innerHTML = obj
                    elemento.appendChild(child)
                })
                if(document.querySelector('input[type=hidden]')) {
                    elemento.setAttribute('onchange', "createCheckBoxes('estado')")
                }else if(input == 'temporal') {
                    elemento.setAttribute('onchange', "createOptions('cidade')")
                }
                formGroup.appendChild(elemento)
                document.querySelector('div#select-group').appendChild(formGroup)
            })
            .catch(err => console.log(err))
    }else {
        if(document.querySelector('select#dados')) {
            const estadoComboBox = document.querySelector('select#dados')
            const label = document.querySelector('label[for=dados]')
            estadoComboBox.parentNode.removeChild(estadoComboBox)
            label.parentNode.removeChild(label)
        }
    }
}

function capitalize(s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

function createCheckBoxes(type) {
    const multiselect = document.querySelector('div.multiselect')
    const createInnerHTML = option =>  `
    <label>${capitalize(option)}s</label>
    <div class="selectBox" onclick="showCheckboxes()">
        <select class='form-control'>
        <option>Escolha um(a) ou mais ${option}(s)</option>
        </select>
        <div class="overSelect"></div>
    </div>
    <div id="chkDados">
    </div>
    `
    let url = FLASK_API_BASE_URL
    if(type == 'cidade')
    {
        url += `data/estados`
        multiselect.innerHTML = createInnerHTML('estado')
    }else if (type == 'estado')
    {
        const combo = document.querySelector('select#dados')
        const item = combo.options[combo.selectedIndex].value


        const radios = Array.from(document.querySelectorAll('input[name=deaths]'))
        let mortes = radios.filter(radio => radio.checked)[0].value

        if(mortes == 'mortes') mortes = 'Deaths'
        else mortes = 'Infected'

        url += `dados/${mortes}/${item}`
        multiselect.innerHTML = createInnerHTML('cidade')
    }
    const elemento = document.querySelector('div#chkDados')
    console.log(url)
    axios(url)
        .then(resposta => {
            elemento.innerHTML = ''
            resposta.data.sort()
            resposta.data.forEach(cidade => {
                cidade = decodeURIComponent( escape(cidade) );
                const findCity = obj => obj === cidade
                const child = `<div class="form-check"> 
                <label class="form-check-label" for="id${cidade}">
                <input type="checkbox" onclick="updateList('${cidade}')" class="form-check-input" id="id${cidade}" value="${cidade}" name="chk${type}" ${elementos.find(findCity)?'checked':''}/> 
                ${cidade.split('*')[0]}</label>
                </div>`
                elemento.innerHTML += child
            })
        })
        .catch(err => console.log(err))
}

function changeCheckBoxes() {
    const checkboxDiv = document.querySelector('div#chkDados')
    if(checkboxDiv) {
        const selectCSV = document.querySelector('select#csv')
        if(selectCSV.options[selectCSV.selectedIndex].innerText == 'Por Cidades') {
            createCheckBoxes('estado')
            document.querySelector('ul#lista').innerHTML = ''
            elementos = []
            console.log('teoricamente esvaziei a lista')
        }else
            console.log('Nada')
    }
    else console.log('Não tem nada')
}

function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}
  
function decode_utf8(s) {
    return decodeURIComponent(encodeURI(s));
}

function clearList() {
    elementos.forEach(elemento => {
        Array.from(document.querySelectorAll('div#chkDados input[type=checkbox]')).forEach(check => {
            if(check.checked)
                check.click()
        })
        document.querySelector('ul').innerHTML = ''
    })

    elementos = []
}


function updateList(cidade) {
    const findCity = obj => obj === cidade
    const lista = document.querySelector('ul#lista')
    const id = `li${cidade.split(' ').join('').replace('*', '')}`
    if(!elementos.find(findCity)) {
        const itemLista = document.createElement('li')
        itemLista.setAttribute('id', id)
        itemLista.innerText = cidade.replace('*', '-')
        lista.appendChild(itemLista)
        elementos.push(cidade)
    }else {
        const deletedItem = document.querySelector('li#'+id)
        deletedItem.parentNode.removeChild(deletedItem)
        delete elementos[elementos.indexOf(cidade)]
    }
    console.log(elementos)
}

function deleteFromTable(id) {
    const i = tabela.indexOf(tabela.find(file => file.Nome == id))
    delete tabela[i]
    tabela = tabela.filter(file => file !== null || file !== undefined)
    const linhas = document.querySelectorAll('tr')
    let node = ''
    linhas.forEach(linha => {
        let linhaId = linha.getAttribute('id')
        if(linhaId == id)
            node = linha
    })
    node.parentNode.removeChild(node)
}

async function plotsAjax(url,body, tipo) {
    let incompleto = false
    let campo = ''
    const chaves = Object.keys(body)
    console.log(chaves)
    const itensNulos = chaves.map(chave => {
        console.log(body[chave])
        return body[chave].Value == null || body[chave].Value == ''
    })
    console.log(itensNulos)
    itemNulo = itensNulos.find(item => item == true)

    if(itemNulo) {
        campo = chaves[itensNulos.indexOf(itemNulo)]
        incompleto = true
    }
    const combo = document.querySelector('select#csv')
    const item = combo.options[combo.selectedIndex].value

    if(item == '')
    {
        campo = 'parâmetro'
        incompleto = true
    }

    if(incompleto) {
        
        alert('O campo '+campo+' está nulo. Preencha-o')
    }else {
    //console.log(JSON.stringify(body))
        try {
            const resposta = await axios.post(url, body, {headers: {'Content-Type': 'application/json'}})
            console.log(resposta)
            if(resposta.data.Erro)
                alert('Cidades sem mortes')
            else
                addToTable([resposta.data], tipo)
        }catch(e)
        {
            alert('Erro desconhecido!')
            console.log(e)
        }
    }
}

function addToTable(files, type) {
    console.log(files)
    const lines = files.map(file => {
        if(tabela.find(obj => obj.caminho == file.caminho)) {
            return null
        }else {
            tabela.push(file)
            console.log(tabela)
            const line = document.createElement('tr')
            line.setAttribute('id', file.Nome)
            const columnView = document.createElement('td')
            const columnDemographic = document.createElement('td')
            const columnItems = document.createElement('td')
            const columnReach = document.createElement('td')
            const columnDelete = document.createElement('td')

            let itens = []
            let innerText = ''
            if(file.Tipo == 'barra' || file.Tipo == 'pizza') {
                if(file.Alcance == 'estado' ) {
                    innerText = file.Alcance+'s'
                }else if(file.Alcance == 'regiao') {
                    innerText = 'regiões'
                }else {
                    innerText = file.selecionados.split('_')[0]
                }
            }else if(file.Tipo == 'temporal') {
                //console.log(file.selecionados.split('-'))
                innerText = file.selecionados.split('*')[0]
            }else {
                itens.push(...file.selecionados.split('X'))
                
                let cont = 0
                itens.forEach(item => {
                    if(file.Alcance == 'cidade')
                        item = item.split('*')[0]
                    innerText += item
                    cont += 1
                    if(cont < itens.length)
                        innerText += ', '
                })
            }

            columnItems.innerText = innerText
            const deleteButton = document.createElement('button')
            delete
            deleteButton.setAttribute('type', 'button')
            deleteButton.setAttribute('class', 'btn btn-danger float-left')
            deleteButton.setAttribute('onclick', `deleteFromTable('${file.Nome}')`)
            deleteButton.innerText = 'Excluir'

            columnDelete.appendChild(deleteButton)


            if(file.Tipo == 'temporal') {
                columnDemographic.innerText = 'infectados e mortos'
            }else {
                columnDemographic.innerText = file.Mortes
            }

            columnReach.innerText = file.Alcance

            

            const linkView = document.createElement('a')
            linkView.setAttribute('href', file.caminho)
            linkView.setAttribute('target', '_blank')
            linkView.innerText = 'Visualizar Gráfico'
            columnView.appendChild(linkView)

            line.appendChild(columnDemographic)
            line.appendChild(columnReach)
            line.appendChild(columnItems)
            line.appendChild(columnView)
            line.appendChild(columnDelete)
            return line
        }
    })
    
    lines.forEach(line => {
        if(line != null)
            document.querySelector('table#graficos tbody').appendChild(line)
        else
            alert('Gráfico repetido')
    })
}

function createPie() {
    const input = Array.from(document.querySelectorAll('input[name=deaths]')).find(input => input.checked == true)
    let mortes = true
    if(input.value == 'infectados')
        mortes = false
    //console.log(mortes)
    const sltCSV = document.querySelector('select#csv')
    const csv = sltCSV.options[sltCSV.selectedIndex].value
    let cobertura = ''
    if(csv == 'states') {
        cobertura = 'state'
    }else if(csv == 'estados') {
        cobertura = 'city'
    }else {
        cobertura = csv
    }

    const obj = {mortes: {Value: mortes}}
    if(cobertura === 'city') {
        const sltValor = document.querySelector('select#dados')
        const valor = sltValor.options[sltValor.selectedIndex].value
        obj.valor = {Value: valor}
    }

    const url = FLASK_API_BASE_URL+`pie/${cobertura}`

    plotsAjax(url, obj, 'Pizza')
    /*console.log(JSON.stringify(obj))
    const resposta = await axios.post("https://covid-19-flask-api.herokuapp.com/teste", JSON.stringify(obj))
    console.log(resposta)*/
}

function createTotalBar() {
    const input = Array.from(document.querySelectorAll('input[name=deaths]')).find(input => input.checked == true)
    let mortes = true
    if(input.value == 'infectados')
        mortes = false
    const sltCSV = document.querySelector('select#csv')
    const csv = sltCSV.options[sltCSV.selectedIndex].value

    const sltRatio = document.querySelector('select#sltRatio')
    const taxa = sltRatio.options[sltRatio.selectedIndex].value

    
    const obj = {mortes: {Value: mortes}, taxa: {Value: taxa}}

    let complemento = 'totalbar/'
    if(csv == 'region') {
        complemento += 'state'
    }else if(csv == 'estados') {
        const sltValor = document.querySelector('select#dados')
        const valor = sltValor.options[sltValor.selectedIndex].value
        obj.estado = {Value: valor}
        complemento += 'city'
    }

    const url = FLASK_API_BASE_URL+complemento
    plotsAjax(url, obj, 'Barra')
}

/*
async function ajaxGraficoEstatico() {
    const obj = {}
    obj.mortes = {Value: document.querySelector('input#chkMortes').checked}
    const sltTaxa = document.querySelector('select#sltRatio')
    obj.taxa = {Value: sltTaxa.options[sltTaxa.selectedIndex].value}

    const sltDados = document.querySelector('select#dados')
    obj.selecionado = {Value: sltDados.options[sltDados.selectedIndex].value}
    console.log(JSON.stringify(obj))
    const resposta = await axios.post("https://covid-19-flask-api.herokuapp.com/teste", JSON.stringify(obj))
    console.log(resposta)
}
*/
function createDinamicPlots(type) {
    const combo = document.querySelector('select#csv')
    const item = combo.options[combo.selectedIndex].text
    //const chkId = item == 'Por Cidades'?'City':'State'
    /*
    const checkboxes = Array.from(document.querySelectorAll('input[name=chk'+chkId+']'))
    const selecionados = chk => chk.checked
    const valor = chk => chk.value
    */

   const input = Array.from(document.querySelectorAll('input[name=deaths]')).find(input => input.checked == true)
   let mortes = true
   if(input.value == 'infectados')
       mortes = false

    const filtro = elementos.filter(obj => obj !== undefined)

    const corpo = {
        selecionado: {Value: filtro},
        mortes: {Value: mortes}
    }

    console.log(JSON.stringify(corpo))

    let complemento = `${type}/`

    if(item == 'Por Cidades')
        complemento += 'cities'
    else
        complemento += 'states'
    
    let tipo = ''
    if(type == 'comparison') {
        tipo = 'Comparação'
        if(corpo.selecionado.Value.length == 2)
            complemento += `/Two`
        else
            complemento += `/Multiple`
    }else {
        tipo = 'Mapa de Calor'
    }

    if(filtro.length == 0)
        alert('Selecione municípios ou estados para gerar o gráfico')
    else {
        console.log(FLASK_API_BASE_URL+complemento)
        
        plotsAjax(FLASK_API_BASE_URL+complemento,corpo, tipo)
    }
}


async function ajaxNavigation(link, destino, push = true) {
    if(!link || !destino) return
    const div = document.querySelector(destino)
    try {
        const resposta = await axios(link)
        const html = await resposta.data
        div.innerHTML = html
        if(link == 'sobre.html')
            document.querySelector('div#tabela').style.visibility = 'hidden'
        else
            document.querySelector('div#tabela').style.visibility = 'visible'
        /*let url = FLASK_API_BASE_URL+'teste/'
        let tipo = ''
        switch(link) {
            case 'form_barra.html':
                url += '__fixed/t'
                tipo = 'barra'
                break
            case 'form_pizza.html':
                url += '__fixed/p'
                tipo = 'pizza'
                break
            case 'form_mapacalor.html':
                url += '__custom/h'
                tipo = 'mapa de calor'
                break
            case 'form_comparativo.html':
                url += '__custom/c'
                tipo = 'comparativo'
                break
            default:
                url += '__fixed/ts'
                tipo = 'temporal'
                break
        }

        document.querySelector('table tbody').innerHTML = ''

        findFiles(url, tipo)*/

    }catch(e) {
        div.innerHTML = e
    }
}

async function findFiles(url, type){
    const resposta = await axios(url)
    //console.log(resposta.data)
    addToTable(resposta.data.Filenames, type)
}