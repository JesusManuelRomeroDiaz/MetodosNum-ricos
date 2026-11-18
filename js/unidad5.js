class ValoresPropios {
    constructor(matriz, vectorInicial, tol, maxIter) {
        this.A = matriz;
        this.x = vectorInicial;
        this.tol = tol;
        this.maxIter = maxIter;
        this.n = matriz.length;
        this.pasos = [];
    }

    limpiarCero(valor) {
        return Math.abs(valor) < 1e-9 ? 0.0 : valor;
    }

    resolverPotencia() {
        let lambda_ant = 0, lambda_nuevo = 0;
        let x_nuevo = new Array(this.n).fill(0);

        for (let k = 1; k <= this.maxIter; k++) {
            this.pasos.push(`\n\t--- Iteración ${k} ---`);
            
            for (let i = 0; i < this.n; i++) {
                x_nuevo[i] = 0;
                for (let j = 0; j < this.n; j++) {
                    x_nuevo[i] += this.A[i][j] * this.x[j];
                }
                x_nuevo[i] = this.limpiarCero(x_nuevo[i]);
            }
            
            lambda_nuevo = Math.abs(x_nuevo[0]);
            for (let i = 1; i < this.n; i++) {
                if (Math.abs(x_nuevo[i]) > lambda_nuevo) lambda_nuevo = Math.abs(x_nuevo[i]);
            }
            
            for (let i = 0; i < this.n; i++) {
                if (Math.abs(Math.abs(x_nuevo[i]) - lambda_nuevo) < 1e-9) {
                    lambda_nuevo = x_nuevo[i];
                    break;
                }
            }
            
            lambda_nuevo = this.limpiarCero(lambda_nuevo);
            this.pasos.push(`Valor propio extraído (Lambda): ${lambda_nuevo.toFixed(6)}`);
            
            let vectorString = "Nuevo vector normalizado:\n";
            for (let i = 0; i < this.n; i++) {
                this.x[i] = this.limpiarCero(x_nuevo[i] / lambda_nuevo);
                vectorString += `x[${i+1}] = ${this.x[i].toFixed(6)}\n`;
            }
            this.pasos.push(vectorString);
            
            if (Math.abs(lambda_nuevo - lambda_ant) < this.tol) {
                this.pasos.push("\n¡Convergencia alcanzada!");
                break;
            }
            lambda_ant = lambda_nuevo;
        }
        
        this.pasos.push(`\n\t=== RESULTADO FINAL ===\nValor propio máximo: ${lambda_nuevo.toFixed(6)}`);
    }
}

function generarMatrizPotencia() {
    const n = parseInt(document.getElementById('tamano_u5').value);
    const contenedor = document.getElementById('contenedor-matriz');
    contenedor.innerHTML = ""; 
    
    const grid = document.createElement('div');
    grid.className = 'matriz-grid';
    grid.style.gridTemplateColumns = `repeat(${n + 1}, auto)`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            grid.innerHTML += `<input type="number" id="m_${i}_${j}" step="any" placeholder="A${i+1}${j+1}">`;
        }
        grid.innerHTML += `<input type="number" id="x_${i}" step="any" placeholder="X${i+1}" style="background:#fff3cd;" value="1">`;
    }

    contenedor.appendChild(grid);
    document.getElementById('btn-resolver-u5').style.display = "block";
}

function ejecutarPotencia() {
    const n = parseInt(document.getElementById('tamano_u5').value);
    const tol = parseFloat(document.getElementById('tol_u5').value);
    const iter = parseInt(document.getElementById('iter_u5').value);
    
    let matrizObj = [], vectorInicialObj = [];

    for (let i = 0; i < n; i++) {
        matrizObj[i] = [];
        for (let j = 0; j < n; j++) {
            matrizObj[i].push(parseFloat(document.getElementById(`m_${i}_${j}`).value) || 0);
        }
        vectorInicialObj.push(parseFloat(document.getElementById(`x_${i}`).value) || 1);
    }

    const sistema = new ValoresPropios(matrizObj, vectorInicialObj, tol, iter);
    sistema.resolverPotencia();

    const contenedorResultados = document.getElementById('resultados-u5');
    contenedorResultados.innerHTML = "";
    sistema.pasos.forEach(paso => {
        let div = document.createElement('div');
        div.className = 'paso-resolucion';
        div.textContent = paso;
        contenedorResultados.appendChild(div);
    });
}

function cambiarDescripcionU5() {
    const met = document.getElementById("metodo-u5").value;
    const desc = document.getElementById("desc-metodo-u5");
    if(met === "potencia") desc.textContent = "Explicación: Encuentra el valor propio dominante (máximo) y su vector propio correspondiente.";
    else if(met === "potencia_inversa") desc.textContent = "Explicación: Encuentra el valor propio de menor magnitud (mínimo) resolviendo A*y = x en cada paso.";
}