const FLASK_API_BASE_URL = 'https://covid-19-flask-api.herokuapp.com/'
const JS_API_BASE_URL = 'http://localhost:3000/'

function fillComboBox() {
    const combo = document.querySelector('select#csv')
    const elemento = document.querySelector('select#dados')
    const item = combo.options[combo.selectedIndex].value
    axios(JS_API_BASE_URL+`data/${item}`)
        .then(resposta => {
            elemento.innerHTML = ''
            resposta.data.forEach(obj => {
                const child = document.createElement('option')
                child.innerHTML = obj
                elemento.appendChild(child)
            })
        })
        .catch(err => console.log(err))
}

function createCheckBoxes() {
    const combo = document.querySelector('select#csv')
    const elemento = document.querySelector('div#chkDados')
    const item = combo.options[combo.selectedIndex].value
    axios(JS_API_BASE_URL+`data/${item}`)
        .then(resposta => {
            elemento.innerHTML = ''
            resposta.data.forEach(obj => {
                const child = `<label for="id${obj}">${obj}</label> 
                <input type="checkbox" id="id${obj}" value="${obj}" name="chk${item}"/> <br/>`
                elemento.innerHTML += child
            })
        })
        .catch(err => console.log(err))
}


async function ajaxGraficoDinamico(url,body) {
    console.log(JSON.stringify(body))
    try {
        const resposta = await axios.post(url, body)
        const graficoURL = resposta.data
        const link = document.createElement('a')
        link.setAttribute('href', graficoURL)
        link.innerText = 'Ver Gráfico'
        document.body.appendChild(link)
    }catch(e)
    {
        console.log(e)
    }
    
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
function construirGraficoDinamico() {
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

    let complemento = `comparison/`
    if(corpo.selecionado.Value.length == 2)
        complemento += `Two`
    else
        complemento += `Multiple`

    ajaxGraficoDinamico(FLASK_API_BASE_URL+complemento,corpo)
}


async function navegarAjax(link, destino, push = true) {
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