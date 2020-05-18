const FLASK_API_BASE_URL = 'https://covid-19-flask-api.herokuapp.com/'
//const JS_API_BASE_URL = 'http://localhost:3000/'
const JS_API_BASE_URL = 'https://covidcoleta.herokuapp.com/'
function fillComboBox() {
    const formGroup = document.createElement('div')
    formGroup.setAttribute('class', 'form-group')
    const label = document.createElement('label')
    label.setAttribute('for', 'dados')
    const combo = document.querySelector('select#csv')
    const elemento = document.createElement('select')
    elemento.setAttribute('id', 'dados')
    elemento.setAttribute('class', 'form-control')
    const item = combo.options[combo.selectedIndex].value
    if(item == 'Cities')
        label.innerText = 'Cidades'
    else
        label.innerText = 'Estados'
    formGroup.appendChild(label)
    if(item === 'Cities' || item === 'States') {
        axios(JS_API_BASE_URL+`data/${item}`)
            .then(resposta => {
                elemento.innerHTML = ''
                resposta.data.forEach(obj => {
                    const child = document.createElement('option')
                    child.innerHTML = obj
                    elemento.appendChild(child)
                })
                formGroup.appendChild(elemento)
                document.querySelector('div#select-group').appendChild(formGroup)
            })
            .catch(err => console.log(err))
    }
}

function createCheckBoxes() {

    const combo = document.querySelector('select#csv')
    const elemento = document.querySelector('div#chkDados')
    const item = combo.options[combo.selectedIndex].value
    axios(JS_API_BASE_URL+`data/${item}`)
        .then(resposta => {
            elemento.innerHTML = ''
            resposta.data.forEach(obj => {
                const child = `<div class="form-check"> 
                <input type="checkbox" class="form-check-input" id="id${obj}" value="${obj}" name="chk${item}"/> 
                <label class="form-check-label" for="id${obj}">${obj}</label>
                </div>`
                elemento.innerHTML += child
            })
        })
        .catch(err => console.log(err))
}


async function plotsAjax(url,body, tipo) {
    //console.log(JSON.stringify(body))
    try {
        const resposta = await axios.post(url, body, {headers: {'Content-Type': 'application/json'}})
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
    if(csv == 'States') {
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
    }else if(csv == 'States') {
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
    const item = combo.options[combo.selectedIndex].value
    const checkboxes = Array.from(document.querySelectorAll('input[name=chk'+item+']'))
    const selecionados = chk => chk.checked
    const valor = chk => chk.value
    const mortes = document.querySelector('input#chkMortes').checked

    const corpo = {
        parametro: {Value: item},
        tipo: {Value: 'bar'},
        selecionado: {Value: checkboxes.filter(selecionados).map(valor)},
        mortes: {Value: mortes}
    }

    let complemento = `/${radioEscolhido.value}/`

    if(item == 'Cities')
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