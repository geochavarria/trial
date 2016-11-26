// Descripcion: Uso de Gmapas para la creaciòn de rutas y geoposicionamiento.
//Autor: Ing. Josè Luis Olivares
//email: joseluiss_503@hotmail.com

    var map, lat, lng;
    //localStorage.clear();
    localStorage.string_array_puntos = (localStorage.string_array_puntos || '[]');
    var array_puntos = JSON.parse(localStorage.string_array_puntos);
   //escuchando al evento click  del boton inicializar
  	//$("#btnInicializar").on('click', alert('llamada'));


var socket = io.connect('https://gmaps20100.herokuapp.com/'); //Creando conexion con el socket del servidor de heroku,
                                                          //donde vive nuestra aplicacion  

/* ----> */

socket.on('messages', function(data) {  
  console.log(data);
  //render(data);
//var html =  data.posicionX + " ->" + data.posicionY + data.accion;
	var html =  data.accion;
	var mensaje = "";
	var context = "";
	switch(html)
	{
		case 1: //por llegar
			html =  "Por Salir";
			context = "label label-warning"
			break;
		case 2:
			html =  "En marcha";
			context = "label label-success"
			break;
		case 3:
			html  = "Por Llegar";
			context = "label label-info"
			break;
		default:
			html = "Detenido";
			context  = "label label-danger"
			break;
	}
	var elem =  $("#"+data.index);
	elem.find("statusItem").html = context;
	//element.getElementById('status-item').innerHTML = html;
	//document.getElementById('status-item').innerHTML = html;
	//document.getElementById('status-item').className= context;
})

function render (data) {  
  var html = data.map(function(elem, index) {
    return(`<div>
              <strong>${elem.posicionX}</strong>:
              <em>${elem.posicionY}</em>
            </div>`);
  }).join(" ");

  document.getElementById('messages').innerHTML = html;
}


function tableCreate(data)
{
	
	 var html = data.map(function(elem, index) {
		 var context =  "";
		 switch(html)
		{
			case 1: //por llegar
			context = "label label-warning"
			break;
			case 2:
			context = "label label-success"
			break;
			case 3:
			context = "label label-info"
			break;
			default:
			context = "label label-danger"
			break;
		}
   		 return(`<tr id="item-${index}">
				<td><a href="#"><i class="-alt fa fa-2x fa-eye fa-fw"></i></a></td>	
				<td>
					<h4><b>${elem.horaSalida} ${elem.periodo} - ${elem.horaLlegada} ${elem.periodo}</b></h4>
					<span class="${context}" id="statusItem">${elem.estado}</span> 
				</td>
				<td>
					<h4><b>${elem.tiempoRestante} </b></h4>
				</td>
				<td>
						<div class="col-xs-12">
						    <ul class="nav nav-pills nav-justified thumbnail">
							<li><a href="#" onclick="return addAction('item-${index}',1)">
							    <h4 class="list-group-item-heading">1</h4>
							    <p class="list-group-item-text">Por Salir</p>
							</a></li>
							<li class="active"><a href="#" onclick="return addAction('item-${index}',2)"> 
							    <h4 class="list-group-item-heading">2</h4>
							    <p class="list-group-item-text">En Marcha</p>
							</a></li>
							<li><a href="#" onclick="return addAction('item-${index}',3)">
							    <h4 class="list-group-item-heading">3</h4>
							    <p class="list-group-item-text">Por Llegar</p>
							</a></li>
						    </ul>
						</div>
				<td>
          	 	 </tr>`);
	}).join(" ");
	document.getElementById('body-table').innerHTML = html;
}

function addMessage(e) {  
  var message = {
    posicionX: document.getElementById('username').value,
    posicionY: document.getElementById('texto').value
  };

  socket.emit('new-message', message);
  return false;
}

function addAction(e,p_action) {  
  var message = {
	  accion : p_action,
	  index:e,
  //  posicionX: document.getElementById('username').value,
   // posicionY: document.getElementById('texto').value
  };

  socket.emit('new-message', message);
  return false;
}
/* ---->*/


var app={
      geolocalizar:function (){
        GMaps.geolocate({
          success: function(position){
            if(!array_puntos[0]) {
              lat = position.coords.latitude;  // guarda coords en lat y lng
              lng = position.coords.longitude;
            }else{
              lat = array_puntos[array_puntos.length-1][0] || position.coords.latitude;  // guarda coords en lat y lng
              lng = array_puntos[array_puntos.length-1][1] || position.coords.longitude;
            }
            
            array_puntos.push([lat,lng]); //insertando las nuevas geo posiciones

            map = new GMaps({  // muestra mapa centrado en coords [lat, lng]
              el: '#map',
              lat: lat,
              lng: lng,
              click: app.enlazarMarcador,
              tap: app.enlazarMarcador
            });

            app.pinta_rutas(); //dibujando rutas
            
            map.addMarker({ lat: lat, lng: lng});  // agregando marcador en [lat, lng]
          },
          error: function(error) { alert('Geolocalización falla: '+error.message); },
          not_supported: function(){ alert("Su navegador no soporta geolocalización"); },
        });
      },

	enlazarMarcador: function (e){
       // muestra ruta entre marcas anteriores y actuales
        map.drawRoute({
          origin: [lat, lng],  // origen en coordenadas anteriores
          // destino en coordenadas del click o toque actual
          destination: [e.latLng.lat(), e.latLng.lng()],
          travelMode: 'driving',  //opciones driving -walking
          strokeColor: '#C20041',  //color de linia
          strokeOpacity: 0.6,
          strokeWeight: 5
        });

        lat = e.latLng.lat();   // guarda coords para marca siguiente
        lng = e.latLng.lng();

        map.addMarker({ lat: lat, lng: lng});  // pone marcador en mapa

        array_puntos.push([lat,lng]);
        localStorage.string_array_puntos = JSON.stringify(array_puntos);
      },


      pinta_rutas:function (){ //se carga al inicio, para las primeras coordenadas
      		
        for (var i=0; i<array_puntos.length-1; i++){
          map.drawRoute({
            origin: [array_puntos[i][0], array_puntos[i][1]],  // origen en coordenadas anteriores
            // destino en coordenadas del click o toque actual
            destination: [array_puntos[i+1][0], array_puntos[i+1][1]],
            travelMode: 'driving',
            strokeColor: '#C20041',
            strokeOpacity: 0.6,
            strokeWeight: 5
          });
          map.addMarker({ lat: array_puntos[i][0], lng: array_puntos[i][1]});
        }
      },

      cargarMapa:function(){
		//alert('llama pinta_rutas');
		localStorage.string_array_puntos = '[]';
        array_puntos = JSON.parse(localStorage.string_array_puntos);
        app.geolocalizar();
      },

      listenSocket:function(){ //funcion para comunicarnos con Socketio
      /*    socket.on('usuario conectado', function(data){
            $('#divUsuarios').html(data); //displaying how many conncetions are.
          });  */
	     socket.on('horarios',function(data){
		     //console.log(data);
		    tableCreate(data);
	     });
	
	  
      },

    inicializar: function() {
		"use strict";
		var self=this;
		self.listenSocket(); //Conectando al server con SocketIo
        self.cargarMapa(); //llamando metodo que carga el mapa
	}

}; //cierra var app

app.inicializar(); //inicializando objeto al cargar la pagina
   
