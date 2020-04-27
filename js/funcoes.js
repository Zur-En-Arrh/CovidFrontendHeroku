
let map = null
let infowindow = null
let request = null
let service = null
let markers = []
let filtro = null
let busca = []

const JASON = ` {
        "Elite":{"Value":4},
        "K":{"Value":10},
        "M":{"Value":8},
        "Mutant":{"Value":2},
        "N":{"Value":20},
        "P":{"Value":20},
        "S":{"Value":"1"},
        "Type":{"Value":true},
    "City": {"Value": ["SP-1","SP-1","SP-0","SP-0","SP-0","SP-0","SP-0","SP-0","SP-0","SP-0","SP-50","SP-50","SP-50","RJ-9","RJ-9","RJ-2","RJ-2","RJ-2","RJ-0","RJ-2"]},"Cost": {"Value": [4564,1356,4642,4623,1235,4562,5648,2135,4545,4465,8799,5456,4546,4566,4565,4879,1321,5462,4897,2315]},"Cover": {"Value": [3315,3000,1354,2135,6548,8792,4889,4564,9845,5646,5546,5464,8646,5466,2313,4648,5468,3158,4687,1235]}}`




function initMap() {

    const center = {lat: -23.3256 , lng: -46.3820}
    const div = document.querySelector('div#map')
    map = new google.maps.Map(div, {
        zoom: 10,
        center: center
    })

    /*request = { 
        location: center,
        radius: 100000,
        types: ['stadium']
    }*/

    infowindow = new google.maps.InfoWindow()
    service = new google.maps.places.PlacesService(map)


    //service.nearbySearch(request, callback)

    google.maps.event.addListener(map, 'rightclick', event => {
        let radius = parseFloat(document.querySelector('input#radius').value)
        let select = document.querySelector('select#filtro')
        filtro = select.options[select.selectedIndex].value
        let param = filtro
        //console.log(filtro, radius)
        map.setCenter(event.latLng)
        //clearResults(markers)
        request = {
            fields: ['name', 'vicinity', 'plus_code'],
            location: event.latLng,
            radius: radius,
            types: [filtro]
        }

        service.nearbySearch(request, putMarkers)

    })
}

async function putMarkers(results, status) {
    if(status == google.maps.places.PlacesServiceStatus.OK) {
        
        //console.log(results)
        results.forEach(place => {
            //console.log(place)
            markers.push(createMarker(place))
            let existe = busca.find(element => { 
                if(element != undefined) 
                    return element.id === place.id
                return false
            })
            console.log(existe)
            if(!existe) {
                busca.push(place)
            }else {
                console.log('Já existe')
            }
        })
        console.log(busca)
        
        gerarLista()
        /*const resposta = await axios.post('/construirCSV', {lugares: results, filtro})
        console.log(resposta)
        alert(resposta.data)*/
    }
}

function createMarker(place) {
    const placeLoc = place.geometry.location
    const marker = new google.maps.Marker({
        map: map,
        position: placeLoc
    })

    google.maps.event.addListener(marker, 'click', () => {
        infowindow.setContent(place.name)
        infowindow.open(map, marker)
    })
    return marker
}

function clearResults(){
    markers.forEach(marker => marker.setMap(null))
    markers = []
    busca = []
    gerarLista()
}

function gerarLista() {
    const tabela = document.getElementById('lista') 
    tabela.innerHTML = `<tr>
                    <td>Nome</td>
                    <td>Custo</td>
                    <td>Cobertura</td>
                    <td>Confirmar</td>
                    <td>Deletar</td>
                </tr>`
    busca.forEach(lugar => {
        const linha = document.createElement('tr')
        linha.innerHTML = `<td>${lugar.name}</td>
        <td> 
            <input type="number" size="3pt" id='txtCusto${lugar.id}' name="custo">
        </td>
        <td> 
            <input type="number" size="3pt" id='txtCobertura${lugar.id}' name="cobertura">
        </td>
        <td><button class="btn btn-primary" type="button" onclick="confirmar('${lugar.id}')">Confirmar</button></td>
        <td><button class="btn btn-danger" onclick="remover('${lugar.id}')" type="button">Deletar</button></td>`
        tabela.append(linha)
    })
    
}

function confirmar(id) {
    const indice = busca.indexOf(busca.find(element => {
        if(element)
            return element.id === id
        else
            return false
    }))

    const custo = document.querySelector(`#txtCusto${busca[indice].id}`).value
    const cobertura = document.querySelector(`#txtCobertura${busca[indice].id}`).value
    busca[indice].custo = parseFloat(custo)
    busca[indice].cobertura = parseInt(cobertura)
    //console.log(busca[indice])
}

function confirmarTodos() {
    busca.forEach(lugar => {
        if(lugar) {
            const custo = document.querySelector(`#txtCusto${lugar.id}`).value
            const cobertura = document.querySelector(`#txtCobertura${lugar.id}`).value
            lugar.custo = parseFloat(custo)
            lugar.cobertura = parseInt(cobertura)
        }
    })
    console.log(busca)
}

function remover(id) {
    const indice = busca.indexOf(busca.find(element => {
        if(element)
            return element.id === id
        else
            return false
        }))
    console.log('Remoção', busca[indice])
    markers.forEach(marker => {
        if(marker.position === busca[indice].geometry.location){
            console.log('Achei')
            marker.setMap(null)
        }
    })
    delete busca[indice]
    console.log(busca)
    gerarLista()
}

async function ajax() {
    //busca.forEach(elemento => console.log(elemento.state))
    const urlheroku = 'https://covidcoleta.herokuapp.com/construirJson'
    const teste = 'http://localhost:3000/construirJson'
    const resposta = await axios.post(urlheroku, {lugares: busca})
    console.log(resposta)
    var inputJson = {}
    inputJson.N = {Value: parseInt(document.getElementById("txtN").value)}
    inputJson.M = {Value: parseInt(document.getElementById("txtM").value)}
    inputJson.P = {Value: parseInt(document.getElementById("txtP").value)}
    inputJson.Elite = {Value: parseInt(document.getElementById("txtElite").value)}
    inputJson.Mutant = {Value: parseInt(document.getElementById("txtMutant").value)}
    inputJson.K = {Value: parseInt(document.getElementById("txtK").value)}
    inputJson.S = {Value: document.getElementById("txtS").value}
    inputJson.Type = {Value: document.getElementById("txtType").checked}
    inputJson.Cover = {Value: resposta.data.cover.value}
    inputJson.Cost = {Value: resposta.data.cost.value}
    inputJson.City = {Value: resposta.data.city.value}
    const JSON = montarJSON(inputJson)
    console.log(JSON)
    var URL = "https://covid-19-flask-api.herokuapp.com/brkga";
    const segundaResposta = await axios.post(URL, JSON, {headers: {'Content-Type': 'application/json'}}) 
    console.log(segundaResposta)
}

function montarJSON(obj) {
    let str = `
    {
        "Elite":{"Value":${obj.Elite.Value}},
        "K":{"Value":${obj.K.Value}},
        "M":{"Value":${obj.M.Value}},
        "Mutant":{"Value":${obj.Mutant.Value}},
        "N":{"Value":${obj.N.Value}},
        "P":{"Value":${obj.P.Value}},
        "S":{"Value":"${obj.S.Value}"},
        "Type":{"Value":${obj.Type.Value}},
    `

    str += `"City": {"Value": [`
    let reduce = obj.City.Value.reduce((acumulador, atual) => `${acumulador}"${atual}",`,``)
    let stringFinal = reduce.substring(0,(reduce.length - 1));
    str += stringFinal
    str += `]},`


    str += `"Cost": {"Value": [`
    reduce = obj.Cost.Value.reduce((acumulador, atual) => `${acumulador}${atual},`,``)
    stringFinal = reduce.substring(0,(reduce.length - 1));
    str += stringFinal
    str += `]},`

    str += `"Cover": {"Value": [`
    reduce = obj.Cover.Value.reduce((acumulador, atual) => `${acumulador}${atual},`,``)
    stringFinal = reduce.substring(0,(reduce.length - 1));
    str += stringFinal
    str += `]}`

    str += `}`
    return str
}