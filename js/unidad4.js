class FactorizacionLU {
    constructor(matriz, vector) {
        this.A = matriz;
        this.b = vector;
        this.n = matriz.length;
        this.L = Array.from({length: this.n}, () => Array(this.n).fill(0));
        this.U = Array.from({length: this.n}, () => Array(this.n).fill(0));
        this.pasos = [];
    }

    limpiarCero(valor) { 
        return Math.abs(valor) < 1e-9 ? 0.0 : valor; 
    }

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

    // Imprime matrices limpias y centradas sin bordes de tabla
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

    // Imprime vectores de solución en formato de lista
    imprimirVectorHTML(vector, nombreVariable) {
        let html = `<div style="text-align: center; font-family: sans-serif; margin-bottom: 20px;">`;
        html += `<table style="margin: 0 auto; text-align: left;">`;
        for (let i = 0; i < this.n; i++) {
            html += `<tr><td style="padding: 3px; font-weight: bold;">${nombreVariable}${i+1}</td><td style="padding: 3px;">=</td><td style="padding: 3px;">${this.aFraccion(this.limpiarCero(vector[i]))}</td></tr>`;
        }
        html += `</table></div>`;
        return html;
    }

    /* --- 1. MÉTODO DE DOOLITTLE --- */
    resolverDoolittle() {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 15px;">INICIANDO MÉTODO DE DOOLITTLE</div>`);
        this.pasos.push(this.imprimirMatrizHTML(this.A, "Matriz Original A:"));

        for (let i = 0; i < this.n; i++) {
            this.L[i][i] = 1.0; // Doolittle tiene 1s en la diagonal de L
            
            for (let k = i; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[i][j] * this.U[j][k]);
                this.U[i][k] = this.limpiarCero(this.A[i][k] - suma);
            }
            
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

    /* --- 2. MÉTODO DE CROUT --- */
    resolverCrout() {
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px; margin-bottom: 15px;">INICIANDO MÉTODO DE CROUT</div>`);
        this.pasos.push(this.imprimirMatrizHTML(this.A, "Matriz Original A:"));

        for (let i = 0; i < this.n; i++) {
            this.U[i][i] = 1.0; // Crout tiene 1s en la diagonal de U
            
            for (let k = i; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[k][j] * this.U[j][i]);
                this.L[k][i] = this.limpiarCero(this.A[k][i] - suma);
            }

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

    // Calcula los vectores v y x, e imprime todo en orden
    generarSolucionFinal() {
        this.pasos.push(this.imprimirMatrizHTML(this.L, "Matriz L:"));
        this.pasos.push(this.imprimirMatrizHTML(this.U, "Matriz U:"));

        // 1. Sustitución hacia adelante: L * v = b
        let v = new Array(this.n).fill(0);
        for (let i = 0; i < this.n; i++) {
            let suma = 0;
            for (let j = 0; j < i; j++) suma += this.L[i][j] * v[j];
            v[i] = this.limpiarCero((this.b[i] - suma) / this.L[i][i]);
        }
        
        this.pasos.push(`<div style="text-align: center; font-style: italic; margin-top: 15px;">Resolviendo Lv = b (Sustitución hacia adelante)</div>`);
        this.pasos.push(this.imprimirVectorHTML(v, "v"));

        // 2. Sustitución hacia atrás: U * x = v
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

/* ==========================================
   INTERACCIÓN CON LA INTERFAZ (DOM)
   ========================================== */

function cambiarDescripcionU4() {
    const met = document.getElementById("metodo-u4").value;
    const desc = document.getElementById("desc-metodo-u4");
    if(met === "doolittle") {
        desc.textContent = "Explicación: Descompone la matriz A en LU donde la diagonal principal de L son unos (1).";
    } else if(met === "crout") {
        desc.textContent = "Explicación: Descompone la matriz A en LU donde la diagonal principal de U son unos (1).";
    }
}

function generarMatrizLU() {
    const n = parseInt(document.getElementById('tamano_u4').value);
    const contenedor = document.getElementById('contenedor-matriz');
    contenedor.innerHTML = ""; 
    
    const grid = document.createElement('div');
    grid.className = 'matriz-grid';
    // Se agregan n+1 columnas para permitir ingresar el vector b
    grid.style.gridTemplateColumns = `repeat(${n + 1}, auto)`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            grid.innerHTML += `<input type="number" id="m_${i}_${j}" step="any" placeholder="A${i+1}${j+1}">`;
        }
        grid.innerHTML += `<input type="number" id="b_${i}" step="any" placeholder="b${i+1}" style="background:#eef2f5;">`;
    }

    contenedor.appendChild(grid);
    document.getElementById('btn-resolver-u4').style.display = "block";
}

function ejecutarFactorizacionLU() {
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

    const contenedorResultados = document.getElementById('resultados-u4');
    contenedorResultados.innerHTML = "";
    
    sistema.pasos.forEach(paso => {
        let div = document.createElement('div');
        div.className = 'paso-resolucion';
        div.innerHTML = paso;
        contenedorResultados.appendChild(div);
    });
}