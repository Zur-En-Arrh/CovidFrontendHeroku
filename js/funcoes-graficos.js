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
            if(document.querySelector('div#radioDados').innerHTML !== ''){
                document.querySelector('div#radioDados').innerHTML = ''
                /*const label = document.querySelector('label[for=dados]')
                estadoComboBox.parentNode.removeChild(estadoComboBox)
                label.parentNode.removeChild(label)*/
            }
            fillComboBox('radio')
        }else {
            const estadoComboBox = document.querySelector('select#dados')
            if(estadoComboBox){
                console.log('entrei aqui')
                document.querySelector('div#radioDados').innerHTML = ''
                const label = document.querySelector('label[for=dados]')
                estadoComboBox.parentNode.removeChild(estadoComboBox)
                label.parentNode.removeChild(label)
            }
            createRadioButton('estado')
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

function createRadioButton(type) {
    url = JS_API_BASE_URL
    if(type == 'estado') {
        url += `data/estados`
    }else {
        const combo = document.querySelector('select#dados')
        const item = combo.options[combo.selectedIndex].value
        url += `data/cidades/${item}`
        console.log(url)
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
        .catch(err => console.log(err))
}

function selecionarItem(valor) {
    selecionado = valor
}

function createTemporalSeries() {

    const radios = Array.from(document.querySelectorAll('input[name=gvalue]'))
    const checkedRadio = radios.find(radio => radio.checked)

    const obj = {
        valor: {Value: checkedRadio.value}, 
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
        axios(JS_API_BASE_URL+`data/${item}`)
            .then(resposta => {
                //console.log(resposta.data)
                elemento.innerHTML = ''
                resposta.data.forEach(obj => {
                    const child = document.createElement('option')
                    child.innerHTML = obj
                    elemento.appendChild(child)
                })
                if(document.querySelector('input[type=hidden]')) {
                    elemento.setAttribute('onchange', "createCheckBoxes('estado')")
                }else if(document.querySelector('div#radioDados')) {
                    elemento.setAttribute('onchange', "createRadioButton('cidade')")
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

function createCheckBoxes(type) {
    const multiselect = document.querySelector('div.multiselect')
    const createInnerHTML = option =>  `
    <label>${option}s</label>
    <div class="selectBox" onclick="showCheckboxes()">
        <select class='form-control'>
        <option>Escolha um(a) ${option}</option>
        </select>
        <div class="overSelect"></div>
    </div>
    <div id="chkDados">
    </div>
    `
    let url = JS_API_BASE_URL
    if(type == 'cidade')
    {
        url += `data/estados`
        multiselect.innerHTML = createInnerHTML('estado')
    }else if (type == 'estado')
    {
        const combo = document.querySelector('select#dados')
        const item = combo.options[combo.selectedIndex].value
        url += `data/cidades/${item}`
        multiselect.innerHTML = createInnerHTML('cidade')
    }
    const elemento = document.querySelector('div#chkDados')
    axios(url)
        .then(resposta => {
            elemento.innerHTML = ''
            resposta.data.forEach(cidade => {
                const findCity = obj => obj === cidade
                const child = `<div class="form-check"> 
                <label class="form-check-label" for="id${cidade}">
                <input type="checkbox" onclick="updateList('${cidade}')" class="form-check-input" id="id${cidade}" value="${cidade}" name="chk${type}" ${elementos.find(findCity)?'checked':''}/> 
                ${cidade}</label>
                </div>`
                elemento.innerHTML += child
            })
        })
        .catch(err => console.log(err))
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
    const id = `li${cidade.split(' ').join('')}`
    if(!elementos.find(findCity)) {
        const itemLista = document.createElement('li')
        itemLista.setAttribute('id', id)
        itemLista.innerText = cidade
        lista.appendChild(itemLista)
        elementos.push(cidade)
    }else {
        const deletedItem = document.querySelector('li#'+id)
        deletedItem.parentNode.removeChild(deletedItem)
        delete elementos[elementos.indexOf(cidade)]
    }
    console.log(elementos)
}

async function plotsAjax(url,body, tipo) {
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
        alert('Gráfico já criado')
        console.log(e)
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
            const columnView = document.createElement('td')
            const columnDemographic = document.createElement('td')
            const columnReach = document.createElement('td')
            const columnFileName = document.createElement('td')


            if(file.Tipo == 'temporal') {
                columnDemographic.innerText = 'infectados e mortos'
            }else {
                columnDemographic.innerText = file.Mortes
            }

            columnReach.innerText = file.Alcance

            columnFileName.innerText = file.Nome
            

            const linkView = document.createElement('a')
            linkView.setAttribute('href', file.caminho)
            linkView.setAttribute('target', '_blank')
            linkView.innerText = 'Ver'
            columnView.appendChild(linkView)

            line.appendChild(columnDemographic)
            line.appendChild(columnReach)
            line.appendChild(columnFileName)
            line.appendChild(columnView)
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
    const mortes = document.querySelector('input#chkMortes').checked
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
    const mortes = document.querySelector('input#chkMortes').checked
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

    const mortes = document.querySelector('input#chkMortes').checked

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
    plotsAjax(FLASK_API_BASE_URL+complemento,corpo, tipo)
}


async function ajaxNavigation(link, destino, push = true) {
    if(!link || !destino) return
    const div = document.querySelector(destino)
    try {
        const resposta = await axios(link)
        const html = await resposta.data
        div.innerHTML = html
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