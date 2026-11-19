// clase que calcula valores y vectores propios por el método de la potencia y potencia inversa
class ValoresPropios {
    // constructor que guarda la matriz, el vector inicial propuesto, la tolerancia y las iteraciones
    constructor(matriz, vectorInicial, tol, maxIter) {
        this.A = matriz;
        this.x = vectorInicial;
        this.tol = tol;
        this.maxIter = maxIter;
        this.n = matriz.length;
        this.pasos = [];
    }

    // función para limpiar residuos numéricos muy cercanos a cero
    limpiarCero(valor) {
        return Math.abs(valor) < 1e-9 ? 0.0 : valor;
    }

    // función para convertir un número a fracción usando math.js
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

    // función para imprimir una matriz cuadrada centrada en fracciones
    imprimirMatrizHTML(matriz, titulo) {
        let html = `<div style="text-align: center; margin-bottom: 15px;">`;
        html += `<div style="font-style: italic; margin-bottom: 10px;">${titulo}</div>`;
        html += `<div style="font-family: monospace; font-size: 15px;">`;
        for (let i = 0; i < this.n; i++) {
            let filaTexto = "";
            for (let j = 0; j < this.n; j++) {
                filaTexto += this.aFraccion(this.limpiarCero(matriz[i][j])).padStart(8, ' ') + "  ";
            }
            html += `<div style="white-space: pre;">${filaTexto}</div>`;
        }
        html += `</div></div>`;
        return html;
    }

    // método de la potencia para calcular el valor propio dominante (máximo)
    resolverPotencia() {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 15px;">INICIANDO MÉTODO DE LA POTENCIA</div>`);
        this.pasos.push(this.imprimirMatrizHTML(this.A, "Matriz Original A:"));
        this.ejecutarAlgoritmo(this.A, false);
    }

    // método de la potencia inversa para calcular el valor propio mínimo usando la inversa de A
    resolverPotenciaInversa() {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 15px;">INICIANDO MÉTODO DE LA POTENCIA INVERSA</div>`);
        this.pasos.push(this.imprimirMatrizHTML(this.A, "Matriz Original A:"));

        // intenta calcular la matriz inversa con math.js
        try {
            let A_inv = math.inv(this.A);
            this.pasos.push(`<div style="text-align: center; margin-bottom: 10px; font-style: italic; color: #002B5C; border: 1px dashed #002B5C; padding: 10px; background-color: #eef2f5;">Se calculó la Matriz Inversa (A^-1) para proceder con el método.</div>`);
            this.pasos.push(this.imprimirMatrizHTML(A_inv, "Matriz Inversa (B = A^-1):"));

            this.ejecutarAlgoritmo(A_inv, true);
        } catch (e) {
            this.pasos.push(`<div style="text-align: center; color: red;">Error: La matriz no tiene inversa (es singular o su determinante es cero). No se puede aplicar este método.</div>`);
        }
    }

    // función iterativa compartida por potencia y potencia inversa para obtener c y normalizar el vector
    ejecutarAlgoritmo(MatrizObjetivo, esInversa) {
        let cAnterior = 0;
        let iteracionFinal = this.maxIter;

        this.pasos.push(`<div style="text-align: center; margin-bottom: 10px;">Vector inicial propuesto: x = [${this.x.join(', ')}]</div>`);

        // construye la tabla de iteraciones con desplazamiento horizontal
        let htmlTabla = `<div style="overflow-x: auto; width: 100%;">
                         <table style="margin: 0 auto; width: 100%; text-align: center; border-collapse: collapse; font-family: sans-serif; background-color: white;">`;
        htmlTabla += `<tr><th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5;">n</th>`;
        htmlTabla += `<th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5;">Constante (c)</th>`;
        for (let i = 1; i <= this.n; i++) htmlTabla += `<th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5;">x${i}</th>`;
        htmlTabla += `<th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5;">Error</th></tr>`;

        // agrega la fila inicial n = 0 con el vector propuesto
        htmlTabla += `<tr><td style="padding: 10px; border: 1px solid #ccc;">0</td>`;
        htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">-</td>`;
        for (let i = 0; i < this.n; i++) htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">${this.x[i].toFixed(4)}</td>`;
        htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">-</td></tr>`;

        // ciclo principal de multiplicación y normalización
        for (let k = 1; k <= this.maxIter; k++) {
            // multiplica la matriz objetivo por el vector actual: y = M * x
            let y = new Array(this.n).fill(0);
            for (let i = 0; i < this.n; i++) {
                for (let j = 0; j < this.n; j++) {
                    y[i] += MatrizObjetivo[i][j] * this.x[j];
                }
            }

            // busca la componente dominante c con el mayor valor absoluto
            let cActual = 0;
            let maxAbs = -1;
            for (let i = 0; i < this.n; i++) {
                if (Math.abs(y[i]) > maxAbs) {
                    maxAbs = Math.abs(y[i]);
                    cActual = y[i];
                }
            }

            // valida que el vector resultante no sea nulo
            if (Math.abs(cActual) < 1e-12) {
                this.pasos.push(`<div style="text-align: center; color: red;">Error: El vector se volvió nulo durante las iteraciones. Prueba con otro vector inicial.</div>`);
                return;
            }

            // normaliza el vector dividiendo cada componente entre c
            for (let i = 0; i < this.n; i++) {
                this.x[i] = y[i] / cActual;
            }

            let errorAct = Math.abs(cActual - cAnterior);

            htmlTabla += `<tr><td style="padding: 10px; border: 1px solid #ccc;">${k}</td>`;
            htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">${this.limpiarCero(cActual).toFixed(4)}</td>`;
            for (let i = 0; i < this.n; i++) htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">${this.limpiarCero(this.x[i]).toFixed(4)}</td>`;
            htmlTabla += `<td style="padding: 10px; border: 1px solid #ccc;">${errorAct.toFixed(4)}</td></tr>`;

            // detiene el método si se cumple la tolerancia
            if (errorAct <= this.tol || errorAct < 1e-9) {
                iteracionFinal = k;
                cAnterior = cActual;
                break;
            }
            cAnterior = cActual;
        }

        htmlTabla += `</table></div>`;
        this.pasos.push(htmlTabla);
        this.pasos.push(`<div style="text-align: center; font-family: sans-serif; margin: 15px 0;">Convergencia alcanzada en la iteración ${iteracionFinal}.</div>`);

        // si es potencia inversa, invierte la constante c para obtener el valor propio mínimo
        let lambdaFinal = esInversa ? (1 / cAnterior) : cAnterior;
        let tipoValorPropio = esInversa ? "Valor Propio Mínimo (λ)" : "Valor Propio Dominante (λ)";

        let htmlSolucion = `<div style="text-align: center;">
                            <div style="font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 10px;">SOLUCIÓN FINAL</div>`;

        if (esInversa) {
            htmlSolucion += `<div style="margin-bottom: 10px; font-family: sans-serif; font-style: italic;">Nota: λ = 1 / c = 1 / ${cAnterior.toFixed(4)}</div>`;
        }

        htmlSolucion += `<div style="margin-bottom: 15px; font-family: sans-serif; font-size: 16px;">${tipoValorPropio} = <span style="font-weight:bold;">${this.limpiarCero(lambdaFinal).toFixed(4)}</span></div>
                         <div style="font-family: sans-serif; margin-bottom: 5px;">Vector Propio Asociado:</div>
                         <table style="margin: 0 auto; text-align: left; font-family: sans-serif;">`;
        for (let i = 0; i < this.n; i++) {
            htmlSolucion += `<tr><td style="padding: 3px; font-weight: bold;">x${i + 1}</td><td style="padding: 3px;">=</td><td style="padding: 3px;">${this.limpiarCero(this.x[i]).toFixed(4)}</td></tr>`;
        }
        htmlSolucion += `</table></div>`;

        this.pasos.push(htmlSolucion);
    }
}

// función para cambiar la descripción del método seleccionado en la unidad 5
function cambiarDescripcionU5() {
    const met = document.getElementById("metodo-u5").value;
    const desc = document.getElementById("desc-metodo-u5");
    if (met === "potencia") {
        desc.textContent = "Explicación: Encuentra el valor propio dominante (máximo) y su vector propio correspondiente iterando sobre A.";
    } else if (met === "potencia_inversa") {
        desc.textContent = "Explicación: Encuentra el valor propio de menor magnitud (mínimo) iterando sobre la matriz inversa (A^-1).";
    }
}

// función para generar las casillas de la matriz A y del vector inicial x0 con límite de 10x10
function generarMatrizVector() {
    const inputTamano = document.getElementById('tamano_u5');
    const n = parseInt(inputTamano.value);
    const contenedor = document.getElementById('contenedor-matriz');

    // limita el tamaño entre 2 y 10 para evitar alto consumo de memoria
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
        grid.innerHTML += `<input type="number" id="v_${i}" step="any" placeholder="x0_${i + 1}" style="background:#eef2f5;">`;
    }

    contenedor.appendChild(grid);
    protegerEntradasMatriz(contenedor);
    document.getElementById('btn-resolver-u5').style.display = "block";
}

// función para leer los valores de la interfaz y ejecutar el cálculo de valores propios
function ejecutarValoresPropios() {
    // valida que los valores ingresados estén en rango antes de iniciar el método
    if (!validarValoresMatriz(document.getElementById('contenedor-matriz'))) return;

    const n = parseInt(document.getElementById('tamano_u5').value);
    const metodo = document.getElementById('metodo-u5').value;
    const tol = parseFloat(document.getElementById('tol_u5').value);
    const iter = parseInt(document.getElementById('iter_u5').value);

    let matrizObj = [];
    let vectorObj = [];

    for (let i = 0; i < n; i++) {
        matrizObj[i] = [];
        for (let j = 0; j < n; j++) {
            matrizObj[i].push(parseFloat(document.getElementById(`m_${i}_${j}`).value) || 0);
        }
        vectorObj.push(parseFloat(document.getElementById(`v_${i}`).value) || 0);
    }

    const sistema = new ValoresPropios(matrizObj, vectorObj, tol, iter);

    if (metodo === "potencia") {
        sistema.resolverPotencia();
    } else if (metodo === "potencia_inversa") {
        sistema.resolverPotenciaInversa();
    }

    // muestra los bloques de resultados en el contenedor correspondiente
    const contenedorResultados = document.getElementById('resultados-u5');
    contenedorResultados.innerHTML = "";

    sistema.pasos.forEach(paso => {
        let div = document.createElement('div');
        div.className = 'paso-resolucion';
        div.innerHTML = paso;
        contenedorResultados.appendChild(div);
    });
}

// función para bloquear notación científica y limitar los caracteres en las entradas de la matriz
function protegerEntradasMatriz(contenedor, maxCaracteres = 8, maxValor = 999999) {
    const inputs = contenedor.querySelectorAll('input[type="number"]');

    inputs.forEach(input => {
        input.min = -maxValor;
        input.max = maxValor;

        input.addEventListener('keydown', (e) => {
            if (['e', 'E', '+'].includes(e.key)) {
                e.preventDefault();
            }
        });

        input.addEventListener('paste', (e) => {
            const texto = (e.clipboardData || window.clipboardData).getData('text');
            if (/[eE+]/.test(texto) || isNaN(Number(texto)) || Math.abs(Number(texto)) > maxValor) {
                e.preventDefault();
                alert(`Solo se permiten números entre -${maxValor} y ${maxValor} sin notación científica.`);
            }
        });

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

// función para comprobar que todas las entradas sean números válidos y dentro del rango permitido
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