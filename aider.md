# Guía y Notas para Aider

Este archivo contiene el contexto del proyecto, directrices y convenciones específicas para que Aider actúe de manera eficiente en el proyecto Nappan.

## Rol y Directrices Generales
*   **Rol:** Ingeniero de software experto.
*   **Precisión:** Realizar estricta y únicamente lo que el usuario solicita. No refactorizar, comentar ni modificar partes del código que no estén relacionadas con la tarea actual.
*   **Estilo:** Mantener las convenciones de código existentes, usar las librerías presentes (como Supabase) y escribir código limpio, eficiente y bien estructurado.
*   **Respuestas:** Concisas, directas y utilizando siempre el formato de bloques `SEARCH/REPLACE` para proponer cambios.

## Contexto del Proyecto
*   **Nombre:** Nappan (aparentemente relacionado con venta de pancakes/comida y gestión administrativa).
*   **Stack Tecnológico:**
    *   Frontend: HTML, CSS, JavaScript Vanilla/ES6 (arquitectura modular en `/js`).
    *   Backend/BaaS: Supabase (PostgreSQL, Auth, RPCs).
    *   API/Funciones: Vercel Serverless Functions (`/api/`).
*   **Módulos Clave:**
    *   `/js/admin-modules/`: Lógica del panel de administración (órdenes, clientes, estado, UI).
    *   `/js/supabase-client.js`: Capa principal de abstracción para la base de datos y autenticación.
    *   `/js/chatbot.js`: Asistente virtual integrado en la UI.

## Notas Técnicas y Convenciones
*   El estado global del panel de administración se maneja mediante cachés e invalidaciones (ej. `AdminState`).
*   Las actualizaciones de la interfaz gráfica dependen de `UI.showToast`, `UI.setLoading`, etc.
*   Al realizar integraciones con la base de datos, siempre asegurar de verificar si `supabaseClient` (o `window.NappanDB`) está inicializado y disponible.

## Tareas Pendientes / Bitácora
*   *(Espacio reservado para futuras instrucciones o tareas a corto plazo que el usuario asigne)*
