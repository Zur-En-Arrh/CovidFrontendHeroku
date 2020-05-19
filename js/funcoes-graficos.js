const FLASK_API_BASE_URL = 'https://covid-19-flask-api.herokuapp.com/'
const JS_API_BASE_URL = 'http://localhost:3000/'
//const JS_API_BASE_URL = 'https://covidcoleta.herokuapp.com/'

let elementos = []

function choosePath()
{
    const combo = document.querySelector('select#csv')
    const item = combo.options[combo.selectedIndex].value
    if(item == 'estados')
    {
        elementos = []
        if(document.querySelector('select#dados')){
            const estadoComboBox = document.querySelector('select#dados')
            const label = document.querySelector('label[for=dados]')
            estadoComboBox.parentNode.removeChild(estadoComboBox)
            label.parentNode.removeChild(label)
        }
        document.querySelector('ul#lista').innerHTML = ''
        document.querySelector('div#chkDados').innerHTML = ''
        fillComboBox()
        
    }else{
        elementos = []
        document.querySelector('ul#lista').innerHTML = ''
        if(document.querySelector('div#chkDados').innerHTML !== ''){
            const estadoComboBox = document.querySelector('select#dados')
            const label = document.querySelector('label[for=dados]')
            estadoComboBox.parentNode.removeChild(estadoComboBox)
            label.parentNode.removeChild(label)
        }
        createCheckBoxes('cidade')
    }
}

function fillComboBox() {
    const formGroup = document.createElement('div')
    formGroup.setAttribute('class', 'form-group')

    const label = document.createElement('label')
    label.setAttribute('for', 'dados')

    const elemento = document.createElement('select')
    elemento.setAttribute('id', 'dados')
    elemento.setAttribute('class', 'form-control')
    
    const combo = document.querySelector('select#csv')
    const item = combo.options[combo.selectedIndex].value
    if(item == 'Cities')
        label.innerText = 'Cidades'
    else
        label.innerText = 'Estados'
    formGroup.appendChild(label)
    if(item === 'Cities' || item === 'estados') {
        axios(JS_API_BASE_URL+`data/${item}`)
            .then(resposta => {
                elemento.innerHTML = ''
                resposta.data.forEach(obj => {
                    const child = document.createElement('option')
                    child.innerHTML = obj
                    elemento.appendChild(child)
                })
                if(document.querySelector('input[type=radio]#radioHeatmap'))
                    elemento.setAttribute('onchange', "createCheckBoxes('estado')")
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
    let url = JS_API_BASE_URL
    if(type == 'cidade')
    {
        url += `data/estados`
    }else if (type == 'estado')
    {
        const combo = document.querySelector('select#dados')
        const item = combo.options[combo.selectedIndex].value
        url += `data/cidades/${item}`
    }
    const elemento = document.querySelector('div#chkDados')
    axios(url)
        .then(resposta => {
            elemento.innerHTML = ''
            resposta.data.forEach(cidade => {
                const findCity = obj => obj === cidade
                const child = `<div class="form-check"> 
                <input type="checkbox" onclick="updateList('${cidade}')" class="form-check-input" id="id${cidade}" value="${cidade}" name="chk${type}" ${elementos.find(findCity)?'checked':''}/> 
                <label class="form-check-label" for="id${cidade}">${cidade}</label>
                </div>`
                elemento.innerHTML += child
            })
        })
        .catch(err => console.log(err))
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
        if(resposta.data == 'ERRO') {
            alert('Gráfico já existente!')
        }else {
            const graficoURL = resposta.data
            const linha = document.createElement('tr')
            const colunaView = document.createElement('td')
            const colunaNome = document.createElement('td')
            
            const linkView = document.createElement('a')
            linkView.setAttribute('href', graficoURL)
            linkView.setAttribute('target', '_blank')
            linkView.innerText = 'Ver'

            colunaNome.innerText = tipo
            colunaView.appendChild(linkView)

            linha.appendChild(colunaNome)
            linha.appendChild(colunaView)
            
            document.querySelector('table#graficos tbody').appendChild(linha)
        }
    }catch(e)
    {
        console.log(e)
    }
    
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
function createDinamicPlots() {
    const radios = Array.from(document.querySelectorAll('input[name=grafico]'))
    const radioEscolhido = radios.find(radio => radio.checked)
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

    let complemento = `${radioEscolhido.value}/`

    if(item == 'Por Cidades')
        complemento += 'cities'
    else
        complemento += 'states'
    
    let tipo = ''
    if(radioEscolhido.value == 'comparison') {
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
    }catch(e) {
        div.innerHTML = e
    }
}