class FactorizacionLU {
    constructor(matriz) {
        this.A = matriz;
        this.n = matriz.length;
        this.L = Array.from({length: this.n}, () => Array(this.n).fill(0));
        this.U = Array.from({length: this.n}, () => Array(this.n).fill(0));
        this.pasos = [];
    }

    limpiarCero(valor) { return Math.abs(valor) < 1e-9 ? 0.0 : valor; }

    imprimirMatriz(matriz) {
        let texto = "";
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                texto += this.limpiarCero(matriz[i][j]).toFixed(4).padStart(9, ' ') + " ";
            }
            texto += "\n";
        }
        return texto;
    }

    resolverDoolittle() {
        for (let i = 0; i < this.n; i++) {
            this.L[i][i] = 1.0;
            this.pasos.push(`\n\t--- Paso ${i + 1} (Fila/Columna ${i + 1}) ---`);
            
            for (let k = i; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[i][j] * this.U[j][k]);
                this.U[i][k] = this.limpiarCero(this.A[i][k] - suma);
            }
            
            for (let k = i + 1; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[k][j] * this.U[j][i]);
                this.L[k][i] = this.limpiarCero((this.A[k][i] - suma) / this.U[i][i]);
            }
            
            this.pasos.push("Matriz L Iterada:\n" + this.imprimirMatriz(this.L));
            this.pasos.push("Matriz U Iterada:\n" + this.imprimirMatriz(this.U));
        }
    }

    resolverCrout() {
        for (let i = 0; i < this.n; i++) {
            this.U[i][i] = 1.0; // En Crout, U tiene la diagonal de unos
            this.pasos.push(`\n\t--- Paso ${i + 1} (Fila/Columna ${i + 1}) ---`);
            
            for (let k = i; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[k][j] * this.U[j][i]);
                this.L[k][i] = this.limpiarCero(this.A[k][i] - suma);
            }

            for (let k = i + 1; k < this.n; k++) {
                let suma = 0;
                for (let j = 0; j < i; j++) suma += (this.L[i][j] * this.U[j][k]);
                this.U[i][k] = this.limpiarCero((this.A[i][k] - suma) / this.L[i][i]);
            }
            
            this.pasos.push("Matriz L Iterada:\n" + this.imprimirMatriz(this.L));
            this.pasos.push("Matriz U Iterada:\n" + this.imprimirMatriz(this.U));
        }
    }
}

function cambiarDescripcionU4() {
    const met = document.getElementById("metodo-u4").value;
    const desc = document.getElementById("desc-metodo-u4");
    if(met === "doolittle") desc.textContent = "Explicación: Descompone la matriz A en LU donde la diagonal principal de L son unos (1).";
    else if(met === "crout") desc.textContent = "Explicación: Descompone la matriz A en LU donde la diagonal principal de U son unos (1).";
}

function generarMatrizLU() {
    const n = parseInt(document.getElementById('tamano_u4').value);
    const contenedor = document.getElementById('contenedor-matriz');
    contenedor.innerHTML = ""; 
    const grid = document.createElement('div');
    grid.className = 'matriz-grid';
    grid.style.gridTemplateColumns = `repeat(${n}, auto)`;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) grid.innerHTML += `<input type="number" id="m_${i}_${j}" step="any" placeholder="A${i+1}${j+1}">`;
    }
    contenedor.appendChild(grid);
    document.getElementById('btn-resolver-u4').style.display = "block";
}

function ejecutarFactorizacionLU() {
    const n = parseInt(document.getElementById('tamano_u4').value);
    const metodo = document.getElementById('metodo-u4').value;
    let matrizObj = [];

    for (let i = 0; i < n; i++) {
        matrizObj[i] = [];
        for (let j = 0; j < n; j++) matrizObj[i].push(parseFloat(document.getElementById(`m_${i}_${j}`).value) || 0);
    }

    const sistema = new FactorizacionLU(matrizObj);
    if (metodo === "doolittle") sistema.resolverDoolittle();
    else if (metodo === "crout") sistema.resolverCrout();

    const contenedorResultados = document.getElementById('resultados-u4');
    contenedorResultados.innerHTML = "";
    sistema.pasos.forEach(paso => {
        let div = document.createElement('div');
        div.className = 'paso-resolucion';
        div.textContent = paso;
        contenedorResultados.appendChild(div);
    });
}