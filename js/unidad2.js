// clase que agrupa los métodos numéricos para resolver ecuaciones no lineales
class EcuacionNoLineal {
    // constructor que inicializa los datos de entrada y compila la función y su derivada
    constructor(funcionTexto, a, b, tol, maxIter) {
        this.funcionTexto = funcionTexto;
        this.a = a;
        this.b = b;
        this.tol = tol;
        this.maxIter = maxIter;
        this.pasos = [];

        // intenta compilar la expresión matemática y calcular su derivada simbólica con math.js
        try {
            this.funcionCompilada = math.compile(this.funcionTexto);
            this.derivadaCompilada = math.derivative(this.funcionTexto, 'x');
        } catch (error) {
            this.errorSintaxis = error.message;
        }
    }

    // función para evaluar la expresión f(x) en un valor dado
    funcion(xValor) {
        return this.funcionCompilada.evaluate({ x: xValor });
    }

    // función para evaluar la derivada f'(x) en un valor dado
    derivada(xValor) {
        return this.derivadaCompilada.evaluate({ x: xValor });
    }

    // función para evitar ceros negativos o residuos muy pequeños por precisión flotante
    limpiarCero(valor) {
        return Math.abs(valor) < 1e-9 ? 0.0 : valor;
    }

    // función para construir una tabla html con los encabezados y filas de iteraciones
    crearTablaHTML(encabezados, filas) {
        let html = `<div style="overflow-x: auto; width: 100%;">`;
        html += `<table style="width: 100%; text-align: center; border-collapse: collapse; font-family: monospace; margin-top: 10px; background-color: white;">`;

        html += `<tr>`;
        encabezados.forEach(enc => {
            html += `<th style="padding: 10px; border: 1px solid #ccc; background-color: #eef2f5; font-family: sans-serif;">${enc}</th>`;
        });
        html += `</tr>`;

        filas.forEach(fila => {
            html += `<tr>`;
            fila.forEach(celda => {
                html += `<td style="padding: 10px; border: 1px solid #ccc;">${celda}</td>`;
            });
            html += `</tr>`;
        });

        html += `</table></div>`;
        return html;
    }

    // método de bisección para encontrar una raíz dentro de un intervalo [a, b]
    resolverBiseccion() {
        // verifica si hubo un error al leer la sintaxis de la función
        if (this.errorSintaxis) {
            this.pasos.push(`<div style="text-align: center; color: red;">Error al leer la función: Verifica la sintaxis matemática.<br>Detalle: ${this.errorSintaxis}</div>`);
            return;
        }

        // evalúa la función en los extremos del intervalo para comprobar el teorema de bolzano
        let fa = this.funcion(this.a);
        let fb = this.funcion(this.b);

        if (fa * fb >= 0) {
            this.pasos.push(`<div style="text-align: center;">Error: No hay cambio de signo en el intervalo [${this.a.toFixed(4)}, ${this.b.toFixed(4)}].<br>f(${this.a.toFixed(4)}) = ${fa.toFixed(4)} y f(${this.b.toFixed(4)}) = ${fb.toFixed(4)}</div>`);
            return;
        }

        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px;">INICIANDO MÉTODO DE BISECCIÓN</div>`);

        let filasTabla = [];
        let c, fc, f_a, f_b;
        let iteracionFinal = this.maxIter;

        // ciclo principal que divide el intervalo a la mitad en cada iteración
        for (let i = 1; i <= this.maxIter; i++) {
            c = (this.a + this.b) / 2.0;
            f_a = this.funcion(this.a);
            f_b = this.funcion(this.b);
            fc = this.funcion(c);

            // guarda los valores de la iteración actual formateados a 4 decimales
            filasTabla.push([
                i,
                this.limpiarCero(this.a).toFixed(4),
                this.limpiarCero(f_a).toFixed(4),
                this.limpiarCero(this.b).toFixed(4),
                this.limpiarCero(c).toFixed(4),
                this.limpiarCero(f_b).toFixed(4),
                this.limpiarCero(fc).toFixed(4)
            ]);

            // detiene el ciclo si se encontró la raíz exacta o si el error cumple la tolerancia
            if (Math.abs(fc) < 1e-9 || Math.abs(this.b - this.a) / 2.0 <= this.tol) {
                iteracionFinal = i;
                break;
            }

            // actualiza el extremo del intervalo donde ocurre el cambio de signo
            if (fc * f_a < 0) {
                this.b = c;
            } else {
                this.a = c;
            }
        }

        let encabezados = ["n", "a", "f(a)", "b", "c", "f(b)", "f(c)"];
        this.pasos.push(this.crearTablaHTML(encabezados, filasTabla));

        this.pasos.push(`<div style="text-align: center; font-family: sans-serif; margin-top:15px;">Raíz encontrada en la iteración ${iteracionFinal}.</div>`);
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif;">Raíz aproximada: ${this.limpiarCero(c).toFixed(4)}</div>`);
    }

    // método de newton-raphson usando un valor inicial y la derivada automática
    resolverNewton() {
        // verifica si la función ingresada tiene errores de sintaxis
        if (this.errorSintaxis) {
            this.pasos.push(`<div style="text-align: center; color: red;">Error al leer la función: Verifica la sintaxis matemática.<br>Detalle: ${this.errorSintaxis}</div>`);
            return;
        }

        let x = this.a;
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px;">INICIANDO MÉTODO DE NEWTON</div>`);
        this.pasos.push(`<div style="text-align: center; font-family: sans-serif;">Valor inicial (x0) = ${x.toFixed(4)}</div>`);

        let filasTabla = [];
        let iteracionFinal = this.maxIter;

        // ciclo iterativo para aproximar la raíz con la recta tangente
        for (let i = 0; i <= this.maxIter; i++) {
            let fx = this.funcion(x);
            let dfx = this.derivada(x);

            // detiene el método si la derivada es cero para evitar división por cero
            if (Math.abs(dfx) < 1e-9) {
                this.pasos.push(`<div style="text-align: center; color: red;">Error: Derivada cero en x = ${x.toFixed(4)}. No se puede continuar calculando.</div>`);
                return;
            }

            // calcula la siguiente aproximación y el error absoluto entre iteraciones
            let x_new = x - (fx / dfx);
            let errorAct = Math.abs(x_new - x);

            filasTabla.push([
                i,
                this.limpiarCero(x).toFixed(4),
                this.limpiarCero(fx).toFixed(4),
                this.limpiarCero(dfx).toFixed(4),
                this.limpiarCero(x_new).toFixed(4)
            ]);

            // detiene el ciclo si se alcanza la tolerancia deseada o la diferencia es despreciable
            if (errorAct <= this.tol || errorAct < 1e-9) {
                iteracionFinal = i;
                x = x_new;
                break;
            }
            x = x_new;
        }

        let encabezados = ["i", "Xi", "f(Xi)", "f'(Xi)", "X(i+1)"];
        this.pasos.push(this.crearTablaHTML(encabezados, filasTabla));

        this.pasos.push(`<div style="text-align: center; font-family: sans-serif; margin-top:15px;">Raíz encontrada en la iteración ${iteracionFinal}.</div>`);
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif;">Raíz aproximada: ${this.limpiarCero(x).toFixed(4)}</div>`);
    }

    // método de la secante usando dos puntos iniciales sin requerir la derivada
    resolverSecante() {
        // verifica si la función ingresada tiene errores de sintaxis
        if (this.errorSintaxis) {
            this.pasos.push(`<div style="text-align: center; color: red;">Error al leer la función: Verifica la sintaxis matemática.<br>Detalle: ${this.errorSintaxis}</div>`);
            return;
        }

        let x0 = this.a;
        let x1 = this.b;
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif; font-size: 16px;">INICIANDO MÉTODO DE LA SECANTE</div>`);
        this.pasos.push(`<div style="text-align: center; font-family: sans-serif;">Valores iniciales: X(-1) = ${x0.toFixed(4)}, X(0) = ${x1.toFixed(4)}</div>`);

        let filasTabla = [];
        let iteracionFinal = this.maxIter;
        let raizFinal = x1;

        // ciclo iterativo que calcula el cruce de la recta secante con el eje x
        for (let i = 1; i <= this.maxIter; i++) {
            let fx0 = this.funcion(x0);
            let fx1 = this.funcion(x1);

            // valida que el denominador no sea cero antes de dividir
            if (Math.abs(fx1 - fx0) < 1e-12) {
                this.pasos.push(`<div style="text-align: center; margin-top:10px;">Aviso: Denominador muy pequeño. Se detuvo la iteración para evitar división por cero.</div>`);
                iteracionFinal = i - 1;
                break;
            }

            // aplica la fórmula de la secante para obtener el nuevo punto
            let x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
            let fx2 = this.funcion(x2);
            let errorAct = Math.abs(x2 - x1);

            filasTabla.push([
                i,
                this.limpiarCero(x0).toFixed(4),
                this.limpiarCero(fx0).toFixed(4),
                this.limpiarCero(x1).toFixed(4),
                this.limpiarCero(fx1).toFixed(4),
                this.limpiarCero(x2).toFixed(4),
                this.limpiarCero(fx2).toFixed(4)
            ]);

            // detiene el ciclo si se cumple el criterio de tolerancia
            if (errorAct <= this.tol || errorAct < 1e-9) {
                iteracionFinal = i;
                raizFinal = x2;
                break;
            }

            // recorre los puntos para la siguiente iteración
            x0 = x1;
            x1 = x2;
            raizFinal = x2;
        }

        let encabezados = ["Iteración", "X(i-1)", "f(X(i-1))", "Xi", "f(Xi)", "X(i+1)", "f(X(i+1))"];
        this.pasos.push(this.crearTablaHTML(encabezados, filasTabla));

        this.pasos.push(`<div style="text-align: center; font-family: sans-serif; margin-top:15px;">Raíz encontrada en la iteración ${iteracionFinal}.</div>`);
        this.pasos.push(`<div style="text-align: center; font-weight: bold; font-family: sans-serif;">Raíz aproximada: ${this.limpiarCero(raizFinal).toFixed(4)}</div>`);
    }
}

// función para leer los datos del formulario y ejecutar el método seleccionado en la unidad 2
function ejecutarUnidad2() {
    let funcionStr = document.getElementById('funcion_input').value;
    let a = parseFloat(document.getElementById('val_a').value);
    let b = parseFloat(document.getElementById('val_b').value) || 0;
    let tol = parseFloat(document.getElementById('tol_u2').value);
    let iter = parseInt(document.getElementById('iter_u2').value);
    let metodo = document.getElementById('metodo-u2').value;

    let ecuacion = new EcuacionNoLineal(funcionStr, a, b, tol, iter);

    if (metodo === "biseccion") {
        ecuacion.resolverBiseccion();
    } else if (metodo === "newton") {
        ecuacion.resolverNewton();
    } else if (metodo === "secante") {
        ecuacion.resolverSecante();
    }

    // limpia el contenedor de resultados e inserta cada paso generado
    let divRes = document.getElementById('resultados-u2');
    divRes.innerHTML = "";

    ecuacion.pasos.forEach(paso => {
        let div = document.createElement('div');
        div.className = 'paso-resolucion';
        div.innerHTML = paso;
        divRes.appendChild(div);
    });
}

// función para actualizar el texto explicativo según el método seleccionado
function cambiarDescripcionU2() {
    const met = document.getElementById("metodo-u2").value;
    const desc = document.getElementById("desc-metodo-u2");
    if (met === "biseccion") {
        desc.textContent = "Explicación: Encuentra raíces dividiendo el intervalo a la mitad iterativamente.";
    } else if (met === "newton") {
        desc.textContent = "Explicación: Utiliza la derivada de la función para encontrar la raíz con rápida convergencia.";
    } else if (met === "secante") {
        desc.textContent = "Explicación: Aproxima la derivada mediante una recta secante usando dos puntos iniciales.";
    }
}