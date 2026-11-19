// clase que contiene los métodos directos e iterativos para sistemas de ecuaciones lineales
class SistemaEcuaciones {
    // constructor que almacena la matriz de coeficientes, el vector de resultados y su dimensión
    constructor(matriz, vector) {
        this.matriz = matriz;
        this.vector = vector;
        this.n = matriz.length;
        this.pasos = [];
    }

    // función para convertir valores extremadamente pequeños en cero exacto
    limpiarCero(valor) {
        return Math.abs(valor) < 1e-9 ? 0.0 : valor;
    }

    // función para convertir un número decimal a su representación en fracción usando math.js
    aFraccion(valor) {
        if (Math.abs(valor) < 1e-9) return "0";
        try {
            let frac = math.fraction(valor);
            if (frac.d === 1) return `${frac.s * frac.n}`;
            return `${frac.s * frac.n}/${frac.d}`;
        } catch (e) {
            return valor.toFixed(4);
        }
    }

    // función para generar el html de la matriz aumentada en fracciones centrada y sin bordes
    imprimirMatrizHTML() {
        let html = `<div style="text-align: center; font-family: monospace; font-size: 15px; margin: 10px 0;">`;
        for (let i = 0; i < this.n; i++) {
            let filaTexto = "";
            for (let j = 0; j < this.n; j++) {
                filaTexto += this.aFraccion(this.limpiarCero(this.matriz[i][j])).padStart(6, ' ') + "  ";
            }
            filaTexto += "| " + this.aFraccion(this.limpiarCero(this.vector[i])).padStart(6, ' ');
            html += `<div style="white-space: pre;">${filaTexto}</div>`;
        }
        html += `</div>`;
        return html;
    }

    // función para reordenar las filas de la matriz y buscar que sea diagonalmente dominante
    pivotearDiagonalDominante() {
        let n = this.n;
        let intercambios = false;
        let filasNuevas = [];
        let vectorNuevo = [];
        let filasUsadas = new Array(n).fill(false);

        // comprueba si la matriz ya cumple con la condición de diagonal dominante
        let esDominante = true;
        for (let i = 0; i < n; i++) {
            let suma = 0;
            for (let j = 0; j < n; j++) {
                if (i !== j) suma += Math.abs(this.matriz[i][j]);
            }
            if (Math.abs(this.matriz[i][i]) < suma) {
                esDominante = false;
                break;
            }
        }

        if (esDominante) return;

        // busca la mejor fila disponible para cada posición de la diagonal
        for (let i = 0; i < n; i++) {
            let filaEncontrada = -1;

            // primero intenta encontrar una fila con dominancia estricta
            for (let r = 0; r < n; r++) {
                if (filasUsadas[r]) continue;
                let suma = 0;
                for (let c = 0; c < n; c++) {
                    if (i !== c) suma += Math.abs(this.matriz[r][c]);
                }
                if (Math.abs(this.matriz[r][i]) > suma) {
                    filaEncontrada = r;
                    break;
                }
            }

            // si no hay dominancia estricta, busca dominancia débil
            if (filaEncontrada === -1) {
                for (let r = 0; r < n; r++) {
                    if (filasUsadas[r]) continue;
                    let suma = 0;
                    for (let c = 0; c < n; c++) {
                        if (i !== c) suma += Math.abs(this.matriz[r][c]);
                    }
                    if (Math.abs(this.matriz[r][i]) >= suma && Math.abs(this.matriz[r][i]) > 1e-9) {
                        filaEncontrada = r;
                        break;
                    }
                }
            }

            // como último recurso elige la fila con el valor absoluto mayor en esa columna
            if (filaEncontrada === -1) {
                let maxVal = -1;
                for (let r = 0; r < n; r++) {
                    if (filasUsadas[r]) continue;
                    if (Math.abs(this.matriz[r][i]) > maxVal) {
                        maxVal = Math.abs(this.matriz[r][i]);
                        filaEncontrada = r;
                    }
                }
            }

            if (filaEncontrada !== -1) {
                filasNuevas.push([...this.matriz[filaEncontrada]]);
                vectorNuevo.push(this.vector[filaEncontrada]);
                filasUsadas[filaEncontrada] = true;
                if (filaEncontrada !== i) intercambios = true;
            }
        }

        // si se realizaron cambios, actualiza la matriz y avisa al usuario
        if (filasNuevas.length === n && intercambios) {
            this.matriz = filasNuevas;
            this.vector = vectorNuevo;
            this.pasos.push(`<div style="text-align: center; margin-bottom: 10px; font-style: italic; color: #002B5C; border: 1px dashed #002B5C; padding: 10px; background-color: #eef2f5;">Aviso: El sistema fue reordenado para ser diagonalmente dominante y asegurar la convergencia.</div>`);
            this.pasos.push(`<div style="text-align: center; font-style: italic;">Matriz Reordenada:</div>${this.imprimirMatrizHTML()}`);
        }
    }

    // método directo de gauss-jordan que reduce la matriz aumentada a la identidad
    resolverGaussJordan() {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px;">INICIANDO MÉTODO DE GAUSS-JORDAN</div>`);
        this.pasos.push(`<div style="text-align: center; font-style: italic;">Matriz Inicial:</div>${this.imprimirMatrizHTML()}`);

        for (let i = 0; i < this.n; i++) {
            let pivote = this.matriz[i][i];

            // valida que el pivote no sea cero
            if (Math.abs(pivote) < 1e-9) {
                this.pasos.push(`<div style="text-align: center; color: red;">Error: Pivote cero encontrado en la fila ${i + 1}.</div>`);
                return;
            }

            // divide toda la fila actual entre el pivote para obtener un 1 en la diagonal
            for (let j = 0; j < this.n; j++) this.matriz[i][j] /= pivote;
            this.vector[i] /= pivote;

            this.pasos.push(`<div style="text-align: center; font-style: italic;">-> Fila ${i + 1} dividida entre ${this.aFraccion(pivote)} (Pivote):</div>${this.imprimirMatrizHTML()}`);

            // hace ceros los elementos por encima y por debajo del pivote
            for (let k = 0; k < this.n; k++) {
                if (k !== i) {
                    let factor = this.matriz[k][i];
                    if (Math.abs(factor) > 1e-9) {
                        for (let j = 0; j < this.n; j++) {
                            this.matriz[k][j] -= factor * this.matriz[i][j];
                        }
                        this.vector[k] -= factor * this.vector[i];

                        let factorFrac = this.aFraccion(factor);
                        let operacionStr = factor < 0
                            ? `+ (${this.aFraccion(Math.abs(factor))} * Fila ${i + 1})`
                            : `- (${factorFrac} * Fila ${i + 1})`;

                        this.pasos.push(`<div style="text-align: center; font-style: italic;">-> Fila ${k + 1} = Fila ${k + 1} ${operacionStr}:</div>${this.imprimirMatrizHTML()}`);
                    }
                }
            }
        }

        // muestra el vector solución final en un bloque separado
        let htmlSolucion = `<div style="text-align: center;">
                            <div style="font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 10px;">SOLUCIÓN FINAL</div>
                            <table style="margin: 0 auto; text-align: left; font-family: sans-serif;">`;
        for (let i = 0; i < this.n; i++) {
            htmlSolucion += `<tr><td style="padding: 5px; font-weight: bold;">x${i + 1}</td><td style="padding: 5px;">=</td><td style="padding: 5px;">${this.aFraccion(this.limpiarCero(this.vector[i]))}</td></tr>`;
        }
        htmlSolucion += `</table></div>`;

        this.pasos.push(htmlSolucion);
    }

    // método iterativo de jacobi que calcula cada iteración usando solo los valores anteriores
    resolverJacobi(tol, maxIter) {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px;">INICIANDO MÉTODO DE JACOBI</div>`);
        this.pasos.push(`<div style="text-align: center; font-style: italic;">Matriz Inicial:</div>${this.imprimirMatrizHTML()}`);

        // intenta reordenar las filas para asegurar convergencia
        this.pivotearDiagonalDominante();

        this.pasos.push(`<div style="text-align: center; margin-bottom: 10px;">Vector inicial: x = [0, 0, ... 0]</div>`);
        let x = new Array(this.n).fill(0);
        let x_new = new Array(this.n).fill(0);

        // comprueba que no existan ceros en la diagonal principal
        for (let i = 0; i < this.n; i++) {
            if (Math.abs(this.matriz[i][i]) < 1e-9) {
                this.pasos.push(`<div style="text-align: center; color: red;">Error: La diagonal A[${i + 1}][${i + 1}] es cero. El sistema no pudo reordenarse correctamente.</div>`);
                return;
            }
        }

        // inicia la tabla con desplazamiento horizontal para evitar que se corte con números grandes
        let htmlTabla = `<div style="overflow-x: auto; width: 100%;">
                         <table style="margin: 0 auto; width: 100%; text-align: center; border-collapse: collapse; font-family: sans-serif; background-color: white;">`;
        htmlTabla += `<tr><th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5;">n</th>`;
        for (let i = 1; i <= this.n; i++) htmlTabla += `<th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5;">x${i}</th>`;
        htmlTabla += `</tr>`;

        // agrega la fila de la iteración 0 con el vector inicial de ceros
        htmlTabla += `<tr><td style="padding: 10px; border: 1px solid #ccc;">0</td>`;
        for (let i = 0; i < this.n; i++) htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">0.0000</td>`;
        htmlTabla += `</tr>`;

        let iteracionFinal = maxIter;

        // ciclo principal de iteraciones de jacobi
        for (let k = 1; k <= maxIter; k++) {
            let errorMax = 0;

            for (let i = 0; i < this.n; i++) {
                let suma = 0;
                for (let j = 0; j < this.n; j++) {
                    if (i !== j) suma += this.matriz[i][j] * x[j];
                }
                x_new[i] = this.limpiarCero((this.vector[i] - suma) / this.matriz[i][i]);

                let errorAct = Math.abs(x_new[i] - x[i]);
                if (errorAct > errorMax) errorMax = errorAct;
            }

            htmlTabla += `<tr><td style="padding: 10px; border: 1px solid #ccc;">${k}</td>`;
            for (let i = 0; i < this.n; i++) htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">${x_new[i].toFixed(4)}</td>`;
            htmlTabla += `</tr>`;

            // actualiza el vector completo al terminar la iteración
            for (let i = 0; i < this.n; i++) x[i] = x_new[i];

            // detiene el ciclo si el error máximo es menor o igual a la tolerancia
            if (errorMax <= tol || errorMax < 1e-9) {
                iteracionFinal = k;
                break;
            }
        }

        htmlTabla += `</table></div>`;
        this.pasos.push(htmlTabla);

        // construye el contenedor con la solución final
        let htmlSolucion = `<div style="text-align: center;">
                            <div style="font-family: sans-serif; margin-bottom: 15px;">Convergencia alcanzada en la iteración ${iteracionFinal}.</div>
                            <div style="font-weight: bold; margin-bottom: 10px; font-family: sans-serif; font-size: 16px;">SOLUCIÓN FINAL</div>`;
        htmlSolucion += `<table style="margin: 0 auto; text-align: left; font-family: sans-serif;">`;
        for (let i = 0; i < this.n; i++) {
            htmlSolucion += `<tr><td style="padding: 3px; font-weight: bold;">x${i + 1}</td><td style="padding: 3px;">=</td><td style="padding: 3px;">${x[i].toFixed(4)}</td></tr>`;
        }
        htmlSolucion += `</table></div>`;
        this.pasos.push(htmlSolucion);
    }

    // método iterativo de gauss-seidel que actualiza cada incógnita inmediatamente al calcularla
    resolverGaussSeidel(tol, maxIter) {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px;">INICIANDO MÉTODO DE GAUSS-SEIDEL</div>`);
        this.pasos.push(`<div style="text-align: center; font-style: italic;">Matriz Inicial:</div>${this.imprimirMatrizHTML()}`);

        // intenta reordenar las filas para asegurar convergencia
        this.pivotearDiagonalDominante();

        this.pasos.push(`<div style="text-align: center; margin-bottom: 10px;">Vector inicial: x = [0, 0, ... 0]</div>`);
        let x = new Array(this.n).fill(0);

        // comprueba que no existan ceros en la diagonal principal
        for (let i = 0; i < this.n; i++) {
            if (Math.abs(this.matriz[i][i]) < 1e-9) {
                this.pasos.push(`<div style="text-align: center; color: red;">Error: La diagonal A[${i + 1}][${i + 1}] es cero. El sistema no pudo reordenarse correctamente.</div>`);
                return;
            }
        }

        // inicia la tabla con desplazamiento horizontal
        let htmlTabla = `<div style="overflow-x: auto; width: 100%;">
                         <table style="margin: 0 auto; width: 100%; text-align: center; border-collapse: collapse; font-family: sans-serif; background-color: white;">`;
        htmlTabla += `<tr><th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5;">n</th>`;
        for (let i = 1; i <= this.n; i++) htmlTabla += `<th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5;">x${i}</th>`;
        htmlTabla += `</tr>`;

        // agrega la fila de la iteración 0
        htmlTabla += `<tr><td style="padding: 10px; border: 1px solid #ccc;">0</td>`;
        for (let i = 0; i < this.n; i++) htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">0.0000</td>`;
        htmlTabla += `</tr>`;

        let iteracionFinal = maxIter;

        // ciclo principal de iteraciones de gauss-seidel
        for (let k = 1; k <= maxIter; k++) {
            let errorMax = 0;
            htmlTabla += `<tr><td style="padding: 10px; border: 1px solid #ccc;">${k}</td>`;

            for (let i = 0; i < this.n; i++) {
                let suma = 0;
                for (let j = 0; j < this.n; j++) {
                    if (i !== j) suma += this.matriz[i][j] * x[j];
                }

                let x_temp = this.limpiarCero((this.vector[i] - suma) / this.matriz[i][i]);
                let errorAct = Math.abs(x_temp - x[i]);
                if (errorAct > errorMax) errorMax = errorAct;

                // guarda el valor inmediatamente para usarlo en las siguientes ecuaciones de la misma iteración
                x[i] = x_temp;
                htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">${x[i].toFixed(4)}</td>`;
            }
            htmlTabla += `</tr>`;

            // detiene el ciclo si se alcanza la tolerancia
            if (errorMax <= tol || errorMax < 1e-9) {
                iteracionFinal = k;
                break;
            }
        }

        htmlTabla += `</table></div>`;
        this.pasos.push(htmlTabla);

        // construye el contenedor con la solución final
        let htmlSolucion = `<div style="text-align: center;">
                            <div style="font-family: sans-serif; margin-bottom: 15px;">Convergencia alcanzada en la iteración ${iteracionFinal}.</div>
                            <div style="font-weight: bold; margin-bottom: 10px; font-family: sans-serif; font-size: 16px;">SOLUCIÓN FINAL</div>`;
        htmlSolucion += `<table style="margin: 0 auto; text-align: left; font-family: sans-serif;">`;
        for (let i = 0; i < this.n; i++) {
            htmlSolucion += `<tr><td style="padding: 3px; font-weight: bold;">x${i + 1}</td><td style="padding: 3px;">=</td><td style="padding: 3px;">${x[i].toFixed(4)}</td></tr>`;
        }
        htmlSolucion += `</table></div>`;
        this.pasos.push(htmlSolucion);
    }
}

// función para actualizar la descripción y mostrar u ocultar los campos de tolerancia e iteraciones
function cambiarDescripcion() {
    const met = document.getElementById("metodo-u3").value;
    const desc = document.getElementById("desc-metodo");
    const config = document.getElementById("config-iterativos");

    if (met === "gauss_jordan") {
        desc.textContent = "Explicación: Reduce la matriz a la matriz identidad usando operaciones elementales (método directo).";
        config.style.display = "none";
    } else if (met === "gauss_seidel") {
        desc.textContent = "Explicación: Método iterativo que aproxima la solución usando los valores más recientes calculados en la misma iteración (converge más rápido).";
        config.style.display = "grid";
    } else if (met === "jacobi") {
        desc.textContent = "Explicación: Método iterativo que aproxima la solución usando únicamente los valores de la iteración anterior.";
        config.style.display = "grid";
    }
}

// función para generar las cajas de texto de la matriz validando un tamaño máximo de 10x10
function generarMatrizUI() {
    const inputTamano = document.getElementById('tamano');
    const n = parseInt(inputTamano.value);
    const contenedor = document.getElementById('contenedor-matriz');

    // limita el tamaño de la matriz entre 2 y 10 para evitar alto consumo de memoria
    if (isNaN(n) || n < 2 || n > 10) {
        alert("El tamaño de la matriz debe estar entre 2 y 10.");
        inputTamano.value = Math.min(Math.max(n || 3, 2), 10);
        return;
    }

    contenedor.innerHTML = "";
    const grid = document.createElement('div');
    grid.className = 'matriz-grid';
    grid.style.gridTemplateColumns = `repeat(${n + 1}, auto)`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            grid.innerHTML += `<input type="number" id="m_${i}_${j}" step="any" placeholder="A${i + 1}${j + 1}">`;
        }
        grid.innerHTML += `<input type="number" id="v_${i}" step="any" placeholder="R${i + 1}" style="background:#eef2f5;">`;
    }

    contenedor.appendChild(grid);
    protegerEntradasMatriz(contenedor);
    document.getElementById('btn-resolver').style.display = "block";
}

// función para leer los valores ingresados y ejecutar el método de la unidad 3
function ejecutarMetodo() {
    // valida que todos los valores estén dentro del rango permitido
    if (!validarValoresMatriz(document.getElementById('contenedor-matriz'))) return;

    const n = parseInt(document.getElementById('tamano').value);
    let matrizObj = [], vectorObj = [];

    for (let i = 0; i < n; i++) {
        matrizObj[i] = [];
        for (let j = 0; j < n; j++) {
            matrizObj[i].push(parseFloat(document.getElementById(`m_${i}_${j}`).value) || 0);
        }
        vectorObj.push(parseFloat(document.getElementById(`v_${i}`).value) || 0);
    }

    const sistema = new SistemaEcuaciones(matrizObj, vectorObj);
    const metodo = document.getElementById("metodo-u3").value;

    if (metodo === "gauss_jordan") {
        sistema.resolverGaussJordan();
    } else {
        let tol = parseFloat(document.getElementById('tol_u3').value);
        let iter = parseInt(document.getElementById('iter_u3').value);

        if (metodo === "gauss_seidel") {
            sistema.resolverGaussSeidel(tol, iter);
        } else if (metodo === "jacobi") {
            sistema.resolverJacobi(tol, iter);
        }
    }

    // imprime todos los bloques de resultados en el documento
    const contenedorResultados = document.getElementById('resultados');
    contenedorResultados.innerHTML = "";

    sistema.pasos.forEach(paso => {
        let div = document.createElement('div');
        div.className = 'paso-resolucion';
        div.innerHTML = paso;
        contenedorResultados.appendChild(div);
    });
}

// función para bloquear notación científica y limitar la longitud de dígitos en cada casilla
function protegerEntradasMatriz(contenedor, maxCaracteres = 8, maxValor = 999999) {
    const inputs = contenedor.querySelectorAll('input[type="number"]');

    inputs.forEach(input => {
        input.min = -maxValor;
        input.max = maxValor;

        // bloquea las teclas de notación científica y signo positivo
        input.addEventListener('keydown', (e) => {
            if (['e', 'E', '+'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // bloquea pegar texto con notación científica o números fuera de rango
        input.addEventListener('paste', (e) => {
            const texto = (e.clipboardData || window.clipboardData).getData('text');
            if (/[eE+]/.test(texto) || isNaN(Number(texto)) || Math.abs(Number(texto)) > maxValor) {
                e.preventDefault();
                alert(`Solo se permiten números entre -${maxValor} y ${maxValor} sin notación científica.`);
            }
        });

        // recorta el texto si supera el límite de caracteres o el valor máximo permitido
        input.addEventListener('input', () => {
            if (input.value.length > maxCaracteres) {
                input.value = input.value.slice(0, maxCaracteres);
            }
            const num = parseFloat(input.value);
            if (!isNaN(num) && Math.abs(num) > maxValor) {
                input.value = num > 0 ? maxValor : -maxValor;
            }
        });
    });
}

// función para comprobar que ningún campo de la matriz tenga valores inválidos antes de calcular
function validarValoresMatriz(contenedor, maxValor = 999999) {
    const inputs = contenedor.querySelectorAll('input[type="number"]');
    for (const input of inputs) {
        const val = parseFloat(input.value || "0");
        if (!Number.isFinite(val) || Math.abs(val) > maxValor) {
            alert(`Hay un valor fuera de rango. Ingresa únicamente números entre -${maxValor} y ${maxValor}.`);
            input.focus();
            return false;
        }
    }
    return true;
}