
let map = null
let infowindow = null
let request = null
let service = null
let markers = []
let filtro = null
let busca = []

const JASON = `{
    "Elite":{"Value":4},
    "K":{"Value":10},
    "M":{"Value":8},
    "Mutant":{"Value":2},
    "N":{"Value":20},
    "P":{"Value":20},
    "S":{"Value":"1"},
    "Type":{"Value":true},
    "City":{"Value":["RS-4","MG-2","RN-3","RS-4","RJ-2","MG-0","RJ-0","SC-0","AC-1","RJ-3","RJ-2","RS-2","SC-2","RJ-6","RN-3","RN-6","SC-4","SC-2","AM-2","AM-3","AP-4","AP-3","RJ-1","RO-4","MT-2","MT-4","RS-4","GO-4","RS-0"]},
    "Cover":{"Value":[5400,3580,2351,3223,4123,3212,2512,5132,8078,3124,4151,5131,5643,5131,5132,9787,5779,5808,507,7507,3122,3125,6432,1245,6421,1425,1315,6432,5122]},
    "Cost":{"Value":[321321,753654,523334,321412,321517,635523,516821,215168,512356,132186,972198,351285,865565,841798,135652,571971,312979,312756,319267,946732,321512,521321,211514,312312,315164,875435,735223,642189,879768]}
}`




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
    console.log(montarJSON(inputJson))
    /*var URL = "https://covid-19-flask-api.herokuapp.com/brkga";
    const segundaResposta = await axios.post(URL, JSON, {headers: {'Content-Type': 'application/json'}}) 
    console.log(segundaResposta)*/
}

function montarJSON(obj) {
    let str = `
    {
        "Elite":{"Value":${obj.Elite}},
        "K":{"Value":${obj.K}},
        "M":{"Value":${obj.M}},
        "Mutant":{"Value":${obj.Mutant}},
        "N":{"Value":${obj.N}},
        "P":{"Value":${obj.P}},
        "S":{"Value":"${obj.S}"},
        "Type":{"Value":${obj.Type}},
    `

    str += `City: {Value: [`
    let reduce = obj.city.value.reduce((acumulador, atual) => `${acumulador}"${atual}",`,``)
    let stringFinal = reduce.substring(0,(reduce.length - 1));
    str += stringFinal
    str += `]},`


    str += `Cost: {Value: [`
    reduce = obj.cost.value.reduce((acumulador, atual) => `${acumulador}${atual},`,``)
    stringFinal = reduce.substring(0,(reduce.length - 1));
    str += stringFinal
    str += `]},`

    str += `Cover: {Value: [`
    reduce = obj.cost.value.reduce((acumulador, atual) => `${acumulador}${atual},`,``)
    stringFinal = reduce.substring(0,(reduce.length - 1));
    str += stringFinal
    str += `]}`

    str += `}`
    return str
}