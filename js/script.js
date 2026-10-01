"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formTrabajador");
    const mensaje = document.getElementById("mensaje");
    const tabla = document.getElementById("tablaTrabajadores");
    const sinTrabajadores = document.getElementById("sinTrabajadores");

    const API_URL = "/trabajadores";


    // Comprobar que los elementos existen

    if (!formulario || !mensaje || !tabla || !sinTrabajadores) {

        console.error(
            "Error: No se encontraron todos los elementos de HU1."
        );

        return;

    }

    

    // Mostrar mensajes

    function mostrarMensaje(texto, tipo) {

        mensaje.className = `alert alert-${tipo}`;
        mensaje.textContent = texto;

    }


    // Mostrar trabajadores en la tabla

    async function mostrarTrabajadores() {

        try {

            const respuesta = await fetch(API_URL);

            if (!respuesta.ok) {
                throw new Error("No fue posible obtener los trabajadores.");
            }

            const trabajadores = await respuesta.json();

            tabla.innerHTML = "";


            if (trabajadores.length === 0) {

                sinTrabajadores.classList.remove("d-none");

                return;

            }


            sinTrabajadores.classList.add("d-none");


            trabajadores.forEach(function (trabajador) {

                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${trabajador.nombre}</td>
                    <td>${trabajador.rut}</td>
                    <td>${trabajador.cargo}</td>
                    <td>${trabajador.telefono || "No registrado"}</td>
                `;

                tabla.appendChild(fila);

            });

        } catch (error) {

            console.error("Error al cargar trabajadores:", error);

            mostrarMensaje(
                "No fue posible cargar los trabajadores.",
                "danger"
            );

        }

    }


    // Enviar formulario

    formulario.addEventListener("submit", async function (evento) {

        // Evitar que la página se recargue

        evento.preventDefault();

        console.log("Formulario enviado correctamente.");


        // Obtener valores

        const nombre = document.getElementById("nombre").value.trim();

        const rut = document.getElementById("rut").value.trim();

        const cargo = document.getElementById("cargo").value.trim();

        const telefono = document.getElementById("telefono").value.trim();

        const antecedentes = document.getElementById("antecedentes").value.trim();


        // Validar campos obligatorios

        if (!nombre || !rut || !cargo) {

            mostrarMensaje(
                "Debe completar los campos obligatorios.",
                "danger"
            );

            return;

        }


        // Preparar datos para enviar al backend

        const trabajador = {

            nombre: nombre,

            rut: rut,

            cargo: cargo,

            telefono: telefono,

            antecedentes: antecedentes

        };


        try {

            // Enviar trabajador al backend

            const respuesta = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(trabajador)

            });


            const resultado = await respuesta.json();


            // Error por RUT duplicado

            if (respuesta.status === 409) {

                mostrarMensaje(
                    resultado.error,
                    "danger"
                );

                return;

            }


            // Otros errores de validación

            if (!respuesta.ok) {

                mostrarMensaje(
                    resultado.error || "No fue posible registrar el trabajador.",
                    "danger"
                );

                return;

            }


            // Registro exitoso

            mostrarMensaje(
                "Trabajador registrado correctamente.",
                "success"
            );


            // Limpiar formulario

            formulario.reset();


            // Actualizar tabla desde la base de datos

            mostrarTrabajadores();


        } catch (error) {

            console.error("Error al registrar trabajador:", error);

            mostrarMensaje(
                "No fue posible conectar con el servidor.",
                "danger"
            );

        }

    });


    // Mostrar trabajadores al abrir la página

    mostrarTrabajadores();

    // ============================
    // HU2 - REGISTRAR INGRESO
    // ============================

    const formularioIngreso = document.getElementById("formIngreso");
    const mensajeIngreso = document.getElementById("mensajeIngreso");
    const trabajadorIngreso = document.getElementById("trabajadorIngreso");
    const ubicacionIngreso = document.getElementById("ubicacionIngreso");
    const fechaIngreso = document.getElementById("fechaIngreso");
    const horaIngreso = document.getElementById("horaIngreso");

    function mostrarMensajeIngreso(texto, tipo) {
        mensajeIngreso.className = `alert alert-${tipo}`;
        mensajeIngreso.textContent = texto;
    }

    async function cargarTrabajadoresIngreso() {
        try {
            const respuesta = await fetch("/trabajadores/ingreso");

            if (!respuesta.ok) {
                throw new Error("No fue posible obtener los trabajadores.");
            }

            const trabajadores = await respuesta.json();

            trabajadorIngreso.innerHTML = `
                <option value="">
                    Seleccione un trabajador
                </option>
            `;

            trabajadores.forEach(function (trabajador) {

                const opcion = document.createElement("option");

                opcion.value = trabajador.id;

                opcion.textContent =
                    `${trabajador.nombre} - ${trabajador.rut}`;

                trabajadorIngreso.appendChild(opcion);
            });

        } catch (error) {

            console.error(
                "Error al cargar trabajadores para ingreso:",
                error
            );

            mostrarMensajeIngreso(
                "No fue posible cargar los trabajadores.",
                "danger"
            );
        }
    }

    function actualizarFechaHora() {

        const ahora = new Date();

        fechaIngreso.value = ahora.toLocaleDateString("es-CL");

        horaIngreso.value = ahora.toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    if (formularioIngreso) {

        actualizarFechaHora();

        cargarTrabajadoresIngreso();

        formularioIngreso.addEventListener(
            "submit",
            async function (evento) {

                evento.preventDefault();

                const trabajador_id = trabajadorIngreso.value;
                const ubicacion = ubicacionIngreso.value.trim();

                if (!trabajador_id || !ubicacion) {

                    mostrarMensajeIngreso(
                        "Debe seleccionar un trabajador e ingresar la ubicación.",
                        "danger"
                    );

                    return;
                }

                try {

                    const respuesta = await fetch("/ingresos", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            trabajador_id: trabajador_id,
                            ubicacion: ubicacion
                        })

                    });

                    const resultado = await respuesta.json();

                    if (!respuesta.ok) {

                        mostrarMensajeIngreso(
                            resultado.error ||
                            "No fue posible registrar el ingreso.",
                            "danger"
                        );

                        return;
                    }

                    mostrarMensajeIngreso(
                        "Ingreso registrado correctamente.",
                        "success"
                    );

                    actualizarFechaHora();

                    formularioIngreso.reset();

                    cargarTrabajadoresPresentesHU4();

                    actualizarFechaHora();

                } catch (error) {

                    console.error(
                        "Error al registrar ingreso:",
                        error
                    );

                    mostrarMensajeIngreso(
                        "No fue posible conectar con el servidor.",
                        "danger"
                    );
                }
            }
        );
    }

    // ============================
    // HU3 - REGISTRAR SALIDA
    // ============================

    const formularioSalida =
        document.getElementById("formSalida");

    const mensajeSalida =
        document.getElementById("mensajeSalida");

    const trabajadorSalida =
        document.getElementById("trabajadorSalida");

    const fechaSalida =
        document.getElementById("fechaSalida");

    const horaSalida =
        document.getElementById("horaSalida");


    // Mostrar mensajes de HU3
    function mostrarMensajeSalida(texto, tipo) {

        mensajeSalida.className =
            `alert alert-${tipo}`;

        mensajeSalida.textContent =
            texto;
    }


    // Cargar trabajadores actualmente presentes
    async function cargarTrabajadoresPresentes() {

        try {

            const respuesta =
                await fetch("/trabajadores/presentes");

            if (!respuesta.ok) {

                throw new Error(
                    "No fue posible obtener los trabajadores presentes."
                );

            }

            const trabajadores =
                await respuesta.json();

            trabajadorSalida.innerHTML = `
                <option value="">
                    Seleccione un trabajador
                </option>
            `;


            trabajadores.forEach(function (trabajador) {

                const opcion =
                    document.createElement("option");

                opcion.value =
                    trabajador.id;

                opcion.textContent =
                    `${trabajador.nombre} - ${trabajador.rut}`;

                trabajadorSalida.appendChild(
                    opcion
                );

            });


        } catch (error) {

            console.error(
                "Error al cargar trabajadores presentes:",
                error
            );

            mostrarMensajeSalida(
                "No fue posible cargar los trabajadores presentes.",
                "danger"
            );

        }

    }


    // Actualizar fecha y hora visual
    function actualizarFechaHoraSalida() {

        const ahora =
            new Date();

        fechaSalida.value =
            ahora.toLocaleDateString("es-CL");

        horaSalida.value =
            ahora.toLocaleTimeString("es-CL", {

                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"

            });

    }


    // Inicializar HU3
    if (formularioSalida) {

        actualizarFechaHoraSalida();

        cargarTrabajadoresPresentes();

        cargarTrabajadoresPresentesHU4();

        formularioSalida.addEventListener(
            "submit",
            async function (evento) {

                evento.preventDefault();


                const trabajador_id =
                    trabajadorSalida.value;


                // CA1
                if (!trabajador_id) {

                    mostrarMensajeSalida(
                        "Debe seleccionar un trabajador presente.",
                        "danger"
                    );

                    return;

                }


                try {

                    const respuesta =
                        await fetch("/salidas", {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                trabajador_id:
                                    trabajador_id
                            })

                        });


                    const resultado =
                        await respuesta.json();


                    if (!respuesta.ok) {

                        mostrarMensajeSalida(
                            resultado.error ||
                            "No fue posible registrar la salida.",
                            "danger"
                        );

                        return;

                    }


                    // CA2
                    mostrarMensajeSalida(
                        "Salida registrada correctamente.",
                        "success"
                    );


                    actualizarFechaHoraSalida();


                    formularioSalida.reset();


                    actualizarFechaHoraSalida();


                    // Actualizar lista de trabajadores presentes
                    cargarTrabajadoresPresentes();


                } catch (error) {

                    console.error(
                        "Error al registrar salida:",
                        error
                    );

                    mostrarMensajeSalida(
                        "No fue posible conectar con el servidor.",
                        "danger"
                    );

                }

            }
        );

    }

    // ============================
    // HU4 - CONSULTAR TRABAJADORES PRESENTES
    // ============================

    const tablaPresentes =
        document.getElementById("tablaPresentes");

    const sinPresentes =
        document.getElementById("sinPresentes");

    const mensajePresentes =
        document.getElementById("mensajePresentes");

    const actualizarPresentes =
        document.getElementById("actualizarPresentes");


    // Mostrar mensaje de HU4
    function mostrarMensajePresentes(texto, tipo) {

        mensajePresentes.className =
            `alert alert-${tipo}`;

        mensajePresentes.textContent =
            texto;
    }


    // Cargar trabajadores presentes
    async function cargarTrabajadoresPresentesHU4() {

        try {

            const respuesta =
                await fetch("/trabajadores/presentes");


            if (!respuesta.ok) {

                throw new Error(
                    "No fue posible obtener los trabajadores presentes."
                );

            }


            const trabajadores =
                await respuesta.json();


            // Limpiar la tabla
            tablaPresentes.innerHTML = "";


            // CA1
            if (trabajadores.length === 0) {

                const fila =
                    document.createElement("tr");

                fila.innerHTML = `
                    <td
                        colspan="4"
                        class="text-center">

                        No hay trabajadores presentes
                        actualmente.

                    </td>
                `;

                tablaPresentes.appendChild(fila);

                return;

            }


            // CA2
            trabajadores.forEach(function (trabajador) {

                const fila =
                    document.createElement("tr");


                fila.innerHTML = `
                    <td>${trabajador.id}</td>

                    <td>${trabajador.nombre}</td>

                    <td>${trabajador.rut}</td>

                    <td>${trabajador.cargo}</td>
                `;


                tablaPresentes.appendChild(fila);

            });


        } catch (error) {

            console.error(
                "Error al cargar trabajadores presentes:",
                error
            );


            mostrarMensajePresentes(
                "No fue posible cargar los trabajadores presentes.",
                "danger"
            );

        }

    }


    // CA3
    // Actualizar la lista manualmente
    if (actualizarPresentes) {

        actualizarPresentes.addEventListener(
            "click",
            function () {

                cargarTrabajadoresPresentesHU4();

            }
        );

    }


    // Cargar la lista al abrir la página
    if (tablaPresentes) {

        cargarTrabajadoresPresentesHU4();

    }

});