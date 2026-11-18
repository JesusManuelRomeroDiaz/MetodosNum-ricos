class SistemaEcuaciones {
    constructor(matriz, vector) {
        this.matriz = matriz;
        this.vector = vector;
        this.n = matriz.length;
        this.pasos = [];
    }

    limpiarCero(valor) {
        return Math.abs(valor) < 1e-9 ? 0.0 : valor;
    }

    imprimirEstadoActual() {
        let texto = "";
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                // Ajustado a 4 decimales
                texto += this.limpiarCero(this.matriz[i][j]).toFixed(4).padStart(9, ' ') + " ";
            }
            // Ajustado a 4 decimales
            texto += "| " + this.limpiarCero(this.vector[i]).toFixed(4).padStart(9, ' ') + "\n";
        }
        return texto;
    }

    //1. GAUSS - JORDAN
    resolverGaussJordan() {
        this.pasos.push("--- INICIANDO MÉTODO DE GAUSS-JORDAN ---\nMatriz Inicial:\n" + this.imprimirEstadoActual());

        for (let i = 0; i < this.n; i++) {
            let pivote = this.matriz[i][i];
            if (Math.abs(pivote) < 1e-9) {
                this.pasos.push(`Error: Pivote cero encontrado en la fila ${i + 1}.`);
                return;
            }

            for (let j = 0; j < this.n; j++) this.matriz[i][j] /= pivote;
            this.vector[i] /= pivote;
            // Ajustado a 4 decimales
            this.pasos.push(`\n-> Fila ${i + 1} dividida entre ${pivote.toFixed(4)} (Pivote):\n` + this.imprimirEstadoActual());

            for (let k = 0; k < this.n; k++) {
                if (k !== i) {
                    let factor = this.matriz[k][i];
                    if (Math.abs(factor) > 1e-9) {
                        for (let j = 0; j < this.n; j++) {
                            this.matriz[k][j] -= factor * this.matriz[i][j];
                        }
                        this.vector[k] -= factor * this.vector[i];
                        // Ajustado a 4 decimales
                        this.pasos.push(`\n-> Fila ${k + 1} = Fila ${k + 1} - (${factor.toFixed(4)} * Fila ${i + 1}):\n` + this.imprimirEstadoActual());
                    }
                }
            }
        }

        let solucionFinal = "\n\t=== SOLUCIÓN FINAL ===\n";
        for (let i = 0; i < this.n; i++) {
            // Ajustado a 4 decimales
            solucionFinal += `x${i + 1} = ${this.limpiarCero(this.vector[i]).toFixed(4)}\n`;
        }
        this.pasos.push(solucionFinal);
    }

    //2. JACOBI
    /* --- 2. JACOBI --- */
    resolverJacobi(tol, maxIter) {
        this.pasos.push("--- INICIANDO MÉTODO DE JACOBI ---\nVector inicial: x = [0, 0, ... 0]\n");
        let x = new Array(this.n).fill(0);
        let x_new = new Array(this.n).fill(0);

        for(let i = 0; i < this.n; i++) {
            if(Math.abs(this.matriz[i][i]) < 1e-9) {
                this.pasos.push(`Error: La diagonal A[${i+1}][${i+1}] es cero. Reordena el sistema.`);
                return;
            }
        }

        // Crear encabezado de la tabla dinámicamente
        let header = "Iter |";
        for(let i=1; i<=this.n; i++) header += `      x${i}      |`;
        header += "    Error    ";
        this.pasos.push(header);
        this.pasos.push("-".repeat(header.length));

        for (let k = 1; k <= maxIter; k++) {
            let errorMax = 0;
            
            // Operaciones matemáticas correctas de Jacobi (usar SOLO iteración anterior)
            for (let i = 0; i < this.n; i++) {
                let suma = 0;
                for (let j = 0; j < this.n; j++) {
                    if (i !== j) suma += this.matriz[i][j] * x[j];
                }
                x_new[i] = this.limpiarCero((this.vector[i] - suma) / this.matriz[i][i]);
                
                let errorAct = Math.abs(x_new[i] - x[i]);
                if (errorAct > errorMax) errorMax = errorAct;
            }

            // Formatear fila de la tabla a 4 decimales
            let paso = `${k.toString().padStart(4, ' ')} |`;
            for(let i = 0; i < this.n; i++) paso += ` ${x_new[i].toFixed(4).padStart(11, ' ')} |`;
            paso += ` ${errorMax.toFixed(4).padStart(11, ' ')}`;
            this.pasos.push(paso);

            for (let i = 0; i < this.n; i++) x[i] = x_new[i];

            if (errorMax < tol) {
                this.pasos.push(`\n\t=== SOLUCIÓN FINAL ===\nConvergencia alcanzada en la iteración ${k}.`);
                break;
            }
        }
    }

    /* --- 3. GAUSS - SEIDEL --- */
    resolverGaussSeidel(tol, maxIter) {
        this.pasos.push("--- INICIANDO MÉTODO DE GAUSS-SEIDEL ---\nVector inicial: x = [0, 0, ... 0]\n");
        let x = new Array(this.n).fill(0);

        for(let i = 0; i < this.n; i++) {
            if(Math.abs(this.matriz[i][i]) < 1e-9) {
                this.pasos.push(`Error: La diagonal A[${i+1}][${i+1}] es cero. Reordena el sistema.`);
                return;
            }
        }

        let header = "Iter |";
        for(let i=1; i<=this.n; i++) header += `      x${i}      |`;
        header += "    Error    ";
        this.pasos.push(header);
        this.pasos.push("-".repeat(header.length));

        for (let k = 1; k <= maxIter; k++) {
            let errorMax = 0;
            let paso = `${k.toString().padStart(4, ' ')} |`;
            
            // Operaciones matemáticas correctas de G-S (usa los nuevos valores INMEDIATAMENTE)
            for (let i = 0; i < this.n; i++) {
                let suma = 0;
                for (let j = 0; j < this.n; j++) {
                    if (i !== j) suma += this.matriz[i][j] * x[j];
                }
                
                let x_temp = this.limpiarCero((this.vector[i] - suma) / this.matriz[i][i]);
                let errorAct = Math.abs(x_temp - x[i]);
                if (errorAct > errorMax) errorMax = errorAct;
                
                x[i] = x_temp; // Sobrescribir inmediatamente
                paso += ` ${x[i].toFixed(4).padStart(11, ' ')} |`;
            }

            paso += ` ${errorMax.toFixed(4).padStart(11, ' ')}`;
            this.pasos.push(paso);

            if (errorMax < tol) {
                this.pasos.push(`\n\t=== SOLUCIÓN FINAL ===\nConvergencia alcanzada en la iteración ${k}.`);
                break;
            }
        }
    }
}

//INTERACCIÓN CON LA INTERFAZ (DOM)

function cambiarDescripcion() {
    const met = document.getElementById("metodo-u3").value;
    const desc = document.getElementById("desc-metodo");
    const config = document.getElementById("config-iterativos");

    if(met === "gauss_jordan") {
        desc.textContent = "Explicación: Reduce la matriz a la matriz identidad usando operaciones elementales (método directo).";
        config.style.display = "none";
    } else if(met === "gauss_seidel") {
        desc.textContent = "Explicación: Método iterativo que aproxima la solución usando los valores más recientes calculados en la misma iteración (converge más rápido).";
        config.style.display = "grid";
    } else if(met === "jacobi") {
        desc.textContent = "Explicación: Método iterativo que aproxima la solución usando únicamente los valores de la iteración anterior.";
        config.style.display = "grid";
    }
}

function generarMatrizUI() {
    const n = parseInt(document.getElementById('tamano').value);
    const contenedor = document.getElementById('contenedor-matriz');
    contenedor.innerHTML = ""; 
    
    const grid = document.createElement('div');
    grid.className = 'matriz-grid';
    grid.style.gridTemplateColumns = `repeat(${n + 1}, auto)`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            grid.innerHTML += `<input type="number" id="m_${i}_${j}" step="any" placeholder="A${i+1}${j+1}">`;
        }
        grid.innerHTML += `<input type="number" id="v_${i}" step="any" placeholder="R${i+1}" style="background:#eef2f5;">`;
    }

    contenedor.appendChild(grid);
    document.getElementById('btn-resolver').style.display = "block";
}

function ejecutarMetodo() {
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

    const contenedorResultados = document.getElementById('resultados');
    contenedorResultados.innerHTML = "";
    sistema.pasos.forEach(paso => {
        let div = document.createElement('div');
        div.className = 'paso-resolucion';
        div.textContent = paso;
        contenedorResultados.appendChild(div);
    });
}