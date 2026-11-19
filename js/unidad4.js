// clase que implementa la factorización lu mediante los métodos de doolittle y crout
class FactorizacionLU {
    // constructor que inicializa la matriz A, el vector b y las matrices vacías L y U
    constructor(matriz, vector) {
        this.A = matriz;
        this.b = vector;
        this.n = matriz.length;
        this.L = Array.from({ length: this.n }, () => Array(this.n).fill(0));
        this.U = Array.from({ length: this.n }, () => Array(this.n).fill(0));
        this.pasos = [];
    }

    // función para convertir valores muy cercanos a cero en cero exacto
    limpiarCero(valor) {
        return Math.abs(valor) < 1e-9 ? 0.0 : valor;
    }

    // función para convertir un número decimal a fracción usando math.js
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

    // función para mostrar una matriz cuadrada centrada en fracciones sin bordes de tabla
    imprimirMatrizHTML(matriz, titulo) {
        let html = `<div style="text-align: center; margin-bottom: 20px;">`;
        html += `<div style="font-style: italic; margin-bottom: 10px;">${titulo}</div>`;
        html += `<div style="font-family: monospace; font-size: 15px;">`;
        for (let i = 0; i < this.n; i++) {
            let filaTexto = "";
            for (let j = 0; j < this.n; j++) {
                filaTexto += this.aFraccion(this.limpiarCero(matriz[i][j])).padStart(6, ' ') + "  ";
            }
            html += `<div style="white-space: pre;">${filaTexto}</div>`;
        }
        html += `</div></div>`;
        return html;
    }

    // función para mostrar un vector de resultados alineado al centro
    imprimirVectorHTML(vector, nombreVariable) {
        let html = `<div style="text-align: center; font-family: sans-serif; margin-bottom: 20px;">`;
        html += `<table style="margin: 0 auto; text-align: left;">`;
        for (let i = 0; i < this.n; i++) {
            html += `<tr><td style="padding: 3px; font-weight: bold;">${nombreVariable}${i + 1}</td><td style="padding: 3px;">=</td><td style="padding: 3px;">${this.aFraccion(this.limpiarCero(vector[i]))}</td></tr>`;
        }
        html += `</table></div>`;
        return html;
    }

    // método de doolittle que coloca unos en la diagonal principal de la matriz L
    resolverDoolittle() {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 15px;">INICIANDO MÉTODO DE DOOLITTLE</div>`);
        this.pasos.push(this.imprimirMatrizHTML(this.A, "Matriz Original A:"));

        for (let i = 0; i < this.n; i++) {
            // asigna 1 a la diagonal de L
            this.L[i][i] = 1.0;

            // calcula la fila i de la matriz triangular superior U
            for (let k = i; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[i][j] * this.U[j][k]);
                this.U[i][k] = this.limpiarCero(this.A[i][k] - suma);
            }

            // calcula la columna i de la matriz triangular inferior L
            for (let k = i + 1; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[k][j] * this.U[j][i]);
                if (Math.abs(this.U[i][i]) < 1e-9) {
                    this.pasos.push(`<div style="text-align: center; color: red;">Error: División por cero.</div>`);
                    return;
                }
                this.L[k][i] = this.limpiarCero((this.A[k][i] - suma) / this.U[i][i]);
            }
        }
        this.generarSolucionFinal();
    }

    // método de crout que coloca unos en la diagonal principal de la matriz U
    resolverCrout() {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 15px;">INICIANDO MÉTODO DE CROUT</div>`);
        this.pasos.push(this.imprimirMatrizHTML(this.A, "Matriz Original A:"));

        for (let i = 0; i < this.n; i++) {
            // asigna 1 a la diagonal de U
            this.U[i][i] = 1.0;

            // calcula la columna i de la matriz triangular inferior L
            for (let k = i; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[k][j] * this.U[j][i]);
                this.L[k][i] = this.limpiarCero(this.A[k][i] - suma);
            }

            // calcula la fila i de la matriz triangular superior U
            for (let k = i + 1; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[i][j] * this.U[j][k]);
                if (Math.abs(this.L[i][i]) < 1e-9) {
                    this.pasos.push(`<div style="text-align: center; color: red;">Error: División por cero.</div>`);
                    return;
                }
                this.U[i][k] = this.limpiarCero((this.A[i][k] - suma) / this.L[i][i]);
            }
        }
        this.generarSolucionFinal();
    }

    // función para resolver Lv = b y Ux = v una vez obtenidas las matrices L y U
    generarSolucionFinal() {
        this.pasos.push(this.imprimirMatrizHTML(this.L, "Matriz L:"));
        this.pasos.push(this.imprimirMatrizHTML(this.U, "Matriz U:"));

        // sustitución progresiva hacia adelante para calcular el vector auxiliar v
        let v = new Array(this.n).fill(0);
        for (let i = 0; i < this.n; i++) {
            let suma = 0;
            for (let j = 0; j < i; j++) suma += this.L[i][j] * v[j];
            v[i] = this.limpiarCero((this.b[i] - suma) / this.L[i][i]);
        }

        this.pasos.push(`<div style="text-align: center; font-style: italic; margin-top: 15px;">Resolviendo Lv = b (Sustitución hacia adelante)</div>`);
        this.pasos.push(this.imprimirVectorHTML(v, "v"));

        // sustitución regresiva hacia atrás para calcular el vector solución x
        let x = new Array(this.n).fill(0);
        for (let i = this.n - 1; i >= 0; i--) {
            let suma = 0;
            for (let j = i + 1; j < this.n; j++) suma += this.U[i][j] * x[j];
            x[i] = this.limpiarCero((v[i] - suma) / this.U[i][i]);
        }

        this.pasos.push(`<div style="text-align: center; font-style: italic; margin-top: 15px;">Resolviendo Ux = v (Sustitución hacia atrás)</div>`);
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 10px;">SOLUCIÓN FINAL</div>`);
        this.pasos.push(this.imprimirVectorHTML(x, "x"));
    }
}

// función para actualizar la descripción del método seleccionado en la unidad 4
function cambiarDescripcionU4() {
    const met = document.getElementById("metodo-u4").value;
    const desc = document.getElementById("desc-metodo-u4");
    if (met === "doolittle") {
        desc.textContent = "Explicación: Descompone la matriz A en LU donde la diagonal principal de L son unos (1).";
    } else if (met === "crout") {
        desc.textContent = "Explicación: Descompone la matriz A en LU donde la diagonal principal de U son unos (1).";
    }
}

// función para generar los campos de la matriz A y el vector b con límite de 10x10
function generarMatrizLU() {
    const inputTamano = document.getElementById('tamano_u4');
    const n = parseInt(inputTamano.value);
    const contenedor = document.getElementById('contenedor-matriz');

    // limita el tamaño entre 2 y 10 para proteger el rendimiento del navegador
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
        grid.innerHTML += `<input type="number" id="b_${i}" step="any" placeholder="b${i + 1}" style="background:#eef2f5;">`;
    }

    contenedor.appendChild(grid);
    protegerEntradasMatriz(contenedor);
    document.getElementById('btn-resolver-u4').style.display = "block";
}

// función para leer la matriz y ejecutar doolittle o crout
function ejecutarFactorizacionLU() {
    // valida que todos los números ingresados estén dentro del rango permitido
    if (!validarValoresMatriz(document.getElementById('contenedor-matriz'))) return;

    const n = parseInt(document.getElementById('tamano_u4').value);
    const metodo = document.getElementById('metodo-u4').value;
    let matrizObj = [];
    let vectorObj = [];

    for (let i = 0; i < n; i++) {
        matrizObj[i] = [];
        for (let j = 0; j < n; j++) {
            matrizObj[i].push(parseFloat(document.getElementById(`m_${i}_${j}`).value) || 0);
        }
        vectorObj.push(parseFloat(document.getElementById(`b_${i}`).value) || 0);
    }

    const sistema = new FactorizacionLU(matrizObj, vectorObj);

    if (metodo === "doolittle") {
        sistema.resolverDoolittle();
    } else if (metodo === "crout") {
        sistema.resolverCrout();
    }

    // muestra los pasos y resultados en pantalla
    const contenedorResultados = document.getElementById('resultados-u4');
    contenedorResultados.innerHTML = "";

    sistema.pasos.forEach(paso => {
        let div = document.createElement('div');
        div.className = 'paso-resolucion';
        div.innerHTML = paso;
        contenedorResultados.appendChild(div);
    });
}

// función para bloquear notación científica y limitar la cantidad de dígitos al escribir o pegar
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

// función para verificar que los valores de la matriz sean finitos y estén en rango antes de calcular
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