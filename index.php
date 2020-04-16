<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <title>Google Maps API</title>
    <link rel="stylesheet" href="css/estilos.css">
</head>
<body>

    <div class="container">
        Raio de busca (em metros): <input class="form-control" type="number" name="radius" id="radius">
        Filtro: <select class="form-control mb-2" name="filtro" id="filtro">
            <option value="stadium">Estádios</option>
            <option value="hospital">Hospitais</option>
        </select>

        <button id="submit" class="btn btn-success" onclick="ajax()">Requisitar Flask</button>
        <button id="submit" class="btn btn-warning" onclick="clearResults()">Limpar</button>


        <h1>Mapa (clique com o botão esquerdo do mouse adicionar os estabelecimentos na lista)</h1>
        <div id="content" class="row">
            <div class="col-6" id="map"></div>
            <div class="col-6 overflow-auto" id="side-bar">
                <table class="table" id="lista">
                    
                </table>
            </div>
        </div>
        <button id="confirmar" class="btn btn-primary mt-2" onclick="confirmarTodos()" type="button">Confirmar Todos</button>
        <button type="button" class="btn btn-warning mt-2" data-toggle="modal" data-target="#parametros">Configurar Parâmetros</button>

    </div>

    

    <div class="modal" id="parametros" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Parâmetros do Algoritmo BRKGA</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
                <form  class="form-container">
                    <table border ="0">
                    <tr><td>
                    <label for="n"><b>N</b></label>
                    <input type="text"  id="txtN" value = "20" required>
                    </td><td>
                    <label for="m"><b>M</b></label>
                    <input type="text"  id="txtM" value = "8" required>
                    </td></tr><tr><td>
                    <label for="p"><b>P</b></label>
                    <input type="text"  id="txtP" value = "20" required>
                    </td><td>
                    <label for="elite"><b>Elite</b></label>
                    <input type="text"  id="txtElite" value = "4" required>
                    </td></tr><tr><td>
                    <label for="mutant"><b>Mutante</b></label>
                    <input type="text"  id="txtMutant" value = "2" required>
                    </td><td>
                    <label for="k"><b>k</b></label>
                    <input type="text"  id="txtK" value = "10" required>
                    </td></tr> <tr><td>
                    <label for="s"><b>S</b></label>
                    <input type="text"  id="txtS" value = "1" required>
                    </td><td>
                    <label for="type"><b>Cobertura</b></label>
                    <input type="checkbox"  id="txtType" checked = true required>
                    </td></tr>  
                    </table>
            </div>
            <div class="modal-footer">
              <button type="button" data-dismiss="modal" class="btn btn-primary">Salvar/Confirmar</button>
            </div>
          </div>
        </div>
      </div>


      <!--<button class="w3-button w3-left w3-blue" id= "btConfigurar" value="Configurar Parâmetros" onclick="configurar()"> Configurar Parâmetros</button>
    <div class="form-popup" id="myForm">
        <form  class="form-container">
         <h1>Parâmetros do Algoritmo BRKGA</h1>
         <table border ="0">
         <tr><td>
         <label for="n"><b>N</b></label>
         <input type="text"  id="txtN" value = "20" required>
         </td><td>
         <label for="m"><b>M</b></label>
         <input type="text"  id="txtM" value = "8" required>
         </td></tr><tr><td>
         <label for="p"><b>P</b></label>
         <input type="text"  id="txtP" value = "20" required>
         </td><td>
         <label for="elite"><b>Elite</b></label>
         <input type="text"  id="txtElite" value = "4" required>
         </td></tr><tr><td>
         <label for="mutant"><b>Mutante</b></label>
         <input type="text"  id="txtMutant" value = "2" required>
         </td><td>
         <label for="k"><b>k</b></label>
         <input type="text"  id="txtK" value = "10" required>
         </td></tr> <tr><td>
         <label for="s"><b>S</b></label>
         <input type="text"  id="txtS" value = "1" required>
         </td><td>
         <label for="type"><b>Cobertura</b></label>
         <input type="checkbox"  id="txtType" checked = true required>
         </td></tr>  
         </table>
         
         <button type="button" class="btn cancel" onclick="closeForm()">Salvar/Confirmar</button>
       </form>
     </div>-->


    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <script src="js/axios.js"></script>
    <script src="js/funcoes.js"></script> 
    <!--<script src="js/funcoeshenrique.js"></script>-->
    <script async defer src="https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyBofqU_V-dLDeMwfha5K8RcYwxwABYD_tY&callback=initMap"
    type="text/javascript"></script>
    
</body>
</html>