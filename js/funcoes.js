
let map = null
let infowindow = null
let request = null
let service = null
let markers = []
let filtro = null
let busca = []
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
    inputJson.N = {Value: document.getElementById("txtN").value}
    inputJson.M = {Value: document.getElementById("txtM").value}
    inputJson.P = {Value: document.getElementById("txtP").value}
    inputJson.Elite = {Value: document.getElementById("txtElite").value}
    inputJson.Mutant = {Value: document.getElementById("txtMutant").value}
    inputJson.K = {Value: document.getElementById("txtK").value}
    inputJson.S = {Value: document.getElementById("txtS").value}
    inputJson.Type = {Value: document.getElementById("txtType").checked}
    inputJson.Cover = resposta.data.cover
    inputJson.Cost = resposta.data.cost
    inputJson.City = resposta.data.city
    console.log(JSON.stringify(inputJson))
    var URL = "https://covid-19-flask-api.herokuapp.com/brkga";
    const segundaResposta = await axios.post(URL, JSON.stringify(inputJson), {headers: {'Content-Type': 'application/json'}}) 
    console.log(segundaResposta)
}