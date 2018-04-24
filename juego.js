/**
 * Captura el evento generado al seleccionar una casilla del tablero y permite mover una ficha o situarla,
 * dependiendo del modo de juego en el que nos encontremos.
 * @param elEvento
 */
function elegir(elEvento) {
    var evento = elEvento || window.event;
    var origenEvento = evento.target;

    try {
        juego.posActual = juego.getCasilla(origenEvento.id);
        if (juego.aMedida) {
            juego.situarFicha();
        } else {
            // Ya había seleccionado una ficha origen y ahora la quiero mover a un hueco destino.
            if (juego.posAnterior != null && juego.posActual.tipo == "hueco") {
                juego.moverFicha();
                juego.posAnterior = null;
            // Selecciono una ficha y la guardo como posAnterior para moverla más tarde.
            } else if (juego.posActual.tipo == "ficha") {
                juego.posAnterior = juego.posActual;
            }
        }
    } catch (excepcion) {
        console.log(excepcion);
    }
}

/**
 * Constructor
 * @param aMedida
 * @constructor
 */
function Juego(aMedida) {
    this.posActual = null;
    this.posAnterior = null;
    this.contrarreloj = true;
    this.tiempo = null;
    this.puntuacion = -1;
    this.inicializado = false;
    this.idTemporizador = null;
    this.arrayFilas = {
        "f1": new Fila("fila1"),
        "f2": new Fila("fila2"),
        "f3": new Fila("fila3"),
        "f4": new Fila("fila4"),
        "f5": new Fila("fila5"),
        "f6": new Fila("fila6"),
        "f7": new Fila("fila7")
    };
    this.aMedida = aMedida;
}

/**
 * Constructor de una fila con 7 casillas disponibles. Se usarán 3 ó 7 de ellas según
 * la fila en la que nos encontremos.
 * @param id
 * @constructor
 */
function Fila(id) {
    this.idFila = id;
    this.posicionesFila = new Array(7);
}

/**
 * Constructor de una casilla del tablero.
 * @param id
 * @param posicion
 * @param tipo
 * @constructor
 */
function Casilla(id, posicion, tipo) {
    this.idCasilla = id;
    this.posicion = posicion;
    this.tipo = tipo;
}

/**
 * Crea una casilla del tipo pasado por parámetro (ficha o hueco) en la posición
 * proporcionada.
 * @param posicion
 * @param tipo
 */
Fila.prototype.dibujarCasilla = function (posicion, tipo) {
    var clasesPos = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];
    var i = posicion + 1;
    var idCasilla = "b" + this.idFila.substring(4) + i; // fila[1-7]
    this.posicionesFila[posicion] = new Casilla(idCasilla, clasesPos[posicion], tipo);
}

/**
 * Restaura los valores iniciales del objeto para iniciar una nueva partida.
 */
Juego.prototype.limpiar = function () {
    this.posActual = null;
    this.posAnterior = null;
    this.contrarreloj = true;
    this.tiempo = -1;
    this.puntuacion = 0;

    for (i in this.arrayFilas) {
        this.arrayFilas[i].posicionesFila = Array(7);
        var hijo = document.getElementById(i);
        document.getElementById("tablero").removeChild(hijo);
    }

    try {
        var bloqueFin = document.getElementById("bloqueFin");
        bloqueFin.parentNode.removeChild(bloqueFin);
    } catch (excepcion) {
        console.log(excepcion);
    } finally {
        this.inicializar(false);
    }
}

/**
 * Entramos en el modo editor de tablero al pulsar Situar en la GUI. Dibujaremos huecos
 * en cada posición por el selector "aMedida = true" al llamar a dibujarFila(fila).
 */
Juego.prototype.editar = function () {
    if (this.inicializado == false) {
        this.inicializar();
    }
    this.aMedida = true;
    this.posActual = null;
    this.posAnterior = null;
    this.contrarreloj = true;
    this.tiempo = -1;
    this.puntuacion = 0;

    // Si estamos jugando previamente una partida contrarreloj, paramos el temporizador.
    clearTimeout(this.idTemporizador);

    for (var i in this.arrayFilas) {
        this.dibujarFila(i);
    }

    try {
        var bloqueFin = document.getElementById("bloqueFin");
        bloqueFin.parentNode.removeChild(bloqueFin);
    } catch (excepcion){
        console.log(excepcion);
    } finally {
        this.mostrarTablero();
    }
}

/**
 * Mientras esté el modo de edición activo (se ha pulsado Situar) permite cambiar una ficha
 * por un hueco y viceversa, dependiendo de lo que se encuentre en esa posición en primer lugar.
 */
Juego.prototype.situarFicha = function () {
    if (this.posActual.tipo == "hueco") {
        this.posActual.tipo = "ficha"
    } else if (this.posActual.tipo == "ficha") {
        this.posActual.tipo = "hueco";
    }
    this.mostrarTablero();
}

/**
 * Comienza la partida iniciando la cuenta atrás (si aplica) y mostrando el tablero de juego. Elimina también
 * el mensaje de fin de partida en caso de que ya se haya terminado una y se desee jugar de nuevo.
 */
Juego.prototype.jugar = function () {
    if (this.inicializado == false) {
        this.inicializar();
    }

     if (this.aMedida) {
         this.aMedida = false;
         try {
            var bloqueFin = document.getElementById("bloqueFin");
            bloqueFin.parentNode.removeChild(bloqueFin);
         } catch (excepcion) {
             console.log(excepcion);
         } finally {
            temporizar();
            this.mostrarTablero();
         }
     } else {
         this.limpiar();
     }
}

/**
 * Inicializa los elementos necesarios para comenzar una partida, capturando el estilo de tablero y dibujando el hueco
 * según el mismo.
 */
Juego.prototype.inicializar = function () {
    this.inicializado = true;
    this.puntuacion = 0;

    for (i in this.arrayFilas) {
        this.dibujarFila(i);
        this.crearBotonesCasillas(i);
    }

    for (j in estilos = document.getElementsByName("estiloJuego")) {
        if (estilos[j].checked) {
            // Colocamos el huevo en la posición central (b44)
            if(estilos[j].value == "central") {
                this.arrayFilas["f4"].posicionesFila[3].tipo = "hueco";
            // Colocamos el hueco en una posición aleatoria del tablero.
            } else if(estilos[j].value == "aleatorio") {
                var aleatorio = this.arrayFilas["f1"].posicionesFila[0];
                while(aleatorio.tipo != "ficha") {
                    var numFila = 0; // [1-7]
                    var posFila = -1; // Columna [0-6]
                    while (numFila < 1 || numFila > 7) {
                        // Math.random() devuelve entre [0, 1)
                        numFila = Math.floor((Math.random() * 10));
                    }
                    while (posFila < 0 || posFila > 6) {
                        posFila = Math.floor((Math.random() * 10));
                    }
                    var aleatorio = this.arrayFilas["f" + numFila].posicionesFila[posFila];
                }
                aleatorio.tipo = "hueco";
            }
        }
    }

    temporizar();
    this.mostrarTablero();
}

/**
 * Crea en pantalla la fila de casillas pasada por parámetro. Depende de la posición en el tablero
 * se dibujará una ficha, un hueco o un espacio vacío (zona que no tiene ni ficha ni hueco).
 * @param fila
 */
Juego.prototype.dibujarFila = function (fila) {
    if (this.aMedida == false) {
        var tipo = "ficha";
    } else {
        tipo = "hueco";
    }

    var pos = this.arrayFilas[fila].posicionesFila;
    for (var i = 0; i < pos.length; i++) {
        // Filas del medio del tablero con 7 casillas mostradas (3 filas [3-5] y 3 columnas [2-4])
        if ((fila == "f3" || fila == "f4" || fila == "f5") || (i > 1 && i < 5)) {
            this.arrayFilas[fila].dibujarCasilla(i, tipo);
        } else {
            this.arrayFilas[fila].dibujarCasilla(i, "vacio");
        }
    }
}

/**
 * Añade al árbol DOM los elementos de tipo <button> correspondientes a cada casilla
 * (de c1 a c7) en la fila pasada por parámetro.
 * @param fila
 */
Juego.prototype.crearBotonesCasillas = function (fila) {
    var divFila = document.createElement("div");
    var pos = this.arrayFilas[fila].posicionesFila;
    divFila.setAttribute("id", fila);
    divFila.setAttribute("class", "fila");
    document.getElementById("tablero").appendChild(divFila);

    for (i = 0; i < pos.length; i++) {
        var button = document.createElement("button");
        button.setAttribute("id", pos[i].idCasilla);
        button.setAttribute("class", pos[i].tipo);
        button.setAttribute("name", pos[i].posicion);
        document.getElementById(fila).appendChild(button);
    }
}

/**
 * Devuelve la casilla correspondiente a la id pasada por parámetro.
 * @param id
 * @returns {*}
 */
Juego.prototype.getCasilla = function (id) {
    var fila = "f" + id.substring(1, 2);
    var columna = parseInt(id.substring(2, 3));
    columna--;

    try {
        return this.arrayFilas[fila].posicionesFila[columna];
    } catch (excepcion) {
        return null;
    }
}

/**
 * Dibuja el tablero en el panel de juego acorde al modo de juego.
 * Gestiona además los mensajes de fin de partida tras acabarse los movimientos, el tiempo o al ganar la misma.
 */
Juego.prototype.mostrarTablero = function () {
    for (var i in this.arrayFilas) {
        var posicion = this.arrayFilas[i].posicionesFila;
        for (var j = 0; j < posicion.length; j++) {
            var button = document.createElement("button");
            button.setAttribute("id", posicion[j].idCasilla);
            button.setAttribute("class", posicion[j].tipo);
            button.setAttribute("name", posicion[j].posicion);
            document.getElementById(i).replaceChild(button, document.getElementById(i).childNodes.item(j));
        }
    }

    // Si ya no quedan movimientos posibles y no estoy situando fichas (ya que se pueden situar fichas aunque
    // sus posiciones no den lugar a un tablero con solución -> sin movimientos posibles).
    if (!this.hayMovPosible() && this.aMedida == false) {
        // Si queda más de una ficha en el tablero significa que nos hemos quedado sin movimientos y no hemos ganado.
        if (this.getFichasRestantes() != 1) {
            try {
                var divBloqueFin = document.getElementById("bloqueFin")
                divBloqueFin.parentNode.removeChild(divBloqueFin);
            } catch (error) {
                var bloqueFin = document.createElement("div");
                bloqueFin.setAttribute("id", "bloqueFin");
                var etiqueta = document.createElement("h1");
                etiqueta.setAttribute("id", "etiqueta");
                document.getElementById("tablero").appendChild(bloqueFin);
                document.getElementById("bloqueFin").appendChild(etiqueta);
                document.getElementById("etiqueta").innerHTML = "¡No hay más movimientos!";
                clearTimeout(this.idTemporizador);
            }
            this.puntuacion = this.puntuacion - (parseInt(this.getFichasRestantes()) * 50);

        } else {
            // No quedan movimientos restantes pero sólo queda una ficha, por lo que hemos ganado.
            try {
                var divBloqueFin = document.getElementById("bloqueFin")
                divBloqueFin.parentNode.removeChild(divBloqueFin);
            } catch (error) {
                var bloqueFin = document.createElement("div");
                bloqueFin.setAttribute("id", "bloqueFin");
                var etiqueta = document.createElement("h1");
                etiqueta.setAttribute("id", "etiqueta");
                document.getElementById("tablero").appendChild(bloqueFin);
                document.getElementById("bloqueFin").appendChild(etiqueta);
                document.getElementById("etiqueta").innerHTML = "¡Enhorabuena! <br> Has ganado.";
                clearTimeout(this.idTemporizador);
            }

            // Sumo 150 puntos si gano con la ficha en posición central.
            if(document.getElementById("b44").className == "ficha") {
                this.puntuacion += 150;
            }
        }
    }

    if (!this.contrarreloj) {
        try {
            var divBloqueFin = document.getElementById("bloqueFin")
            divBloqueFin.parentNode.removeChild(divBloqueFin);
        } catch (error) {
            var bloqueFin = document.createElement("div");
            bloqueFin.setAttribute("id", "bloqueFin");
            var etiqueta = document.createElement("h1");
            etiqueta.setAttribute("id", "etiqueta");
            document.getElementById("tablero").appendChild(bloqueFin);
            document.getElementById("bloqueFin").appendChild(etiqueta);
            document.getElementById("etiqueta").innerHTML = "¡Se ha acabado el tiempo!";
        }
        this.puntuacion = this.puntuacion - (parseInt(this.getFichasRestantes()) * 50);
    }

    // Colores según signo de la puntuación.
    if (this.puntuacion >= 0) {
        document.getElementById("puntuacion").setAttribute("class", "puntuacionPositiva");
    } else {
        document.getElementById("puntuacion").setAttribute("class", "puntuacionNegativa");
    }
    document.getElementById("puntuacion").innerHTML = this.puntuacion;
}

/**
 * Devuelve el número de fichas restantes en el tablero de juego.
 * @returns {number}
 */
Juego.prototype.getFichasRestantes = function () {
    var numFichas = 0;
    for (i in this.arrayFilas) {
        for (j in this.arrayFilas[i].posicionesFila) {
            if (this.arrayFilas[i].posicionesFila[j].tipo == "ficha") {
                numFichas++;
            }
        }
    }
    return numFichas;
}

/**
 * Devuelve un objeto cuyas propiedades/atributos son los movimientos posibles de la ficha pasada por parámetro.
 * @param idFicha
 * @returns {{superior: number, inferior: number, izquierda: number, derecha: number}}
 */
Juego.prototype.getMovsPosibles = function (idFicha) {
    var posicion = parseInt(idFicha.substring(1));

    // Movimientos posibles (2 casillas por movimiento en cada dirección)
    var movimientos = {
        "superior": posicion - 20,
        "inferior": posicion + 20,
        "izquierda": posicion - 2,
        "derecha": posicion + 2
    };

    for (i in movimientos) {
        if (this.getCasilla("b" + movimientos[i]) == null || this.getCasilla("b" + movimientos[i]).tipo == "vacio") {
            movimientos[i] = null;
        }
    }

    return movimientos;
}

/**
 * Devuelve true si puede realizarse un movimiento válido de al menos una de las fichas
 * del tablero (la ficha ha de saltar otra para poder comerla, y no un hueco).
 * @returns {boolean}
 */
Juego.prototype.hayMovPosible = function () {
    for (var i in this.arrayFilas) {
        for (var j in this.arrayFilas[i].posicionesFila) {
            var casilla = this.arrayFilas[i].posicionesFila[j];
            if (casilla.tipo == "ficha") {
                var movimientos = this.getMovsPosibles(casilla.idCasilla);
                for (var m in movimientos) {
                    if (movimientos[m] != null) {
                        var boton = this.getCasilla("b" + movimientos[m]);
                        if (boton.tipo == "hueco") {
                            var botonMedio = this.getCasilla("b" + this.getPosicionMedia(casilla, boton));
                            if (botonMedio.tipo == "ficha") {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
}

/**
 * Obtiene la posición media para cada uno de los movimientos posibles desde la posición
 * destino de la ficha en cada movimiento.
 * @param posAnterior
 * @param posActual
 * @returns {*}
 */
Juego.prototype.getPosicionMedia = function (posAnterior, posActual) {
    if (posActual.tipo == "hueco" && posAnterior.tipo == "ficha") {
        var movimientos = this.getMovsPosibles(posAnterior.idCasilla);
        var posicionActual = parseInt(posActual.idCasilla.substring(1));
        var posicionMedia = null;
        for (var m in movimientos) {
            if (movimientos[m] == posicionActual) {
                // La posición media será el valor medio de cada movimiento posible
                switch (m) {
                    case "superior":
                        posicionMedia = posicionActual + 10;
                        break;
                    case "inferior":
                        posicionMedia = posicionActual - 10;
                        break;
                    case "izquierda":
                        posicionMedia = posicionActual + 1;
                        break;
                    case "derecha":
                        posicionMedia = posicionActual - 1;
                        break;
                    default :
                        break;
                }
            }
        }
    }
    return posicionMedia;
}

/**
 * Mueve una ficha del tablero tomada desde posAnterior (ficha) hasta posActual (hueco).
 * Si se ha podido mover (al haber otra ficha en la posición media) y comerla se sumarán 15 puntos al marcador.
 */
Juego.prototype.moverFicha = function () {
    if (this.contrarreloj && this.hayMovPosible()) {
        var posicionMedia = this.getPosicionMedia(this.posAnterior, this.posActual);

        var casillaMedia = this.getCasilla("b" + posicionMedia);
        if (casillaMedia.tipo == "ficha") {
            this.posActual.tipo = "ficha";
            this.posAnterior.tipo = "hueco";
            casillaMedia.tipo = "hueco";
            this.puntuacion += 15;
        }
        this.mostrarTablero();
    }
}

/**
 * Captura el valor de tiempo del <input> de la página para asignarlo al atributo
 * que será utilizado para la cuenta atrás.
 */
Juego.prototype.setCuentaAtras = function () {
    var inputSegundos = document.getElementById("segundos").value;
    var segundos = 0;

    if (inputSegundos != "") {
        segundos = parseInt(inputSegundos);
    }

    this.tiempo = segundos;
}

/**
 * Decrementa el valor del temporizador establecido mediante setCuentaAtras() en 1 segundo y lo muestra.
 */
Juego.prototype.actualizarCuentaAtras = function () {
    this.tiempo--;
    var segundos = this.tiempo;

    // jQuery para actualizar los segundos en el dial selector según la documentación de jQuery-knob.
    $('.dial').val(segundos).trigger('change');

    var minutos = Math.floor(segundos / 60);
    segundos -= minutos * 60;

    var tiempoRestante = tiempoReloj(minutos) + ":" + tiempoReloj(segundos);

    /*
     * Al comenzar a jugar sin establecer un tiempo aparece "0-1:59", resultado de concatenar
     * el 0 de la funcion tiempoReloj al -1 (atribuido por el método limpiar(), llamado por
     * jugar()). Pondremos el contador a 00:00.
     */
    if (tiempoRestante != "0-1:59") {
        document.getElementById("cuentaAtras").innerHTML = tiempoRestante;
    } else {
        document.getElementById("cuentaAtras").innerHTML = "00:00";
    }
}

function tiempoReloj(tiempo) {
    if (tiempo < 10) {
        return "0" + tiempo; // Ajuste mm:ss
    } else {
        return tiempo;
    }
}

function temporizar() {
    if (juego.tiempo == -1) {
        juego.setCuentaAtras();
        iniciarTemporizador();
    }
}

function iniciarTemporizador() {
    juego.actualizarCuentaAtras();
    if (juego.tiempo > 0) {
        var temporizador = window.setTimeout("iniciarTemporizador()", 1000);
        juego.idTemporizador = temporizador;
    }
    else if (juego.tiempo == 0) {
        juego.contrarreloj = false;
        juego.mostrarTablero();
    }
}