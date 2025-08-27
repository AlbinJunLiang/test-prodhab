/*const obtenerPreguntas = async (cantidad = 5) => {
    try {
        const res = await fetch(`http://localhost:5133/api/Preguntas/aleatorias?cantidad=${cantidad}`);
        if (!res.ok) throw new Error('Error al obtener preguntas');
        return await res.json();
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
};*/



const obtenerPreguntas = async (cantidad = 5) => {
    try {
        const res = await fetch("https://adsulfwwjlenhqbxwmyo.supabase.co/rest/v1/rpc/obtener_lista_por_clave", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc3VsZnd3amxlbmhxYnh3bXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3ODQzMjcsImV4cCI6MjA0NDM2MDMyN30.gzUiqwnfWMxwKB8s2VH13gE8NKgu92D0ZatnmsPZ-58" // o el nombre del header que use tu API
            },
            body: JSON.stringify({ p_clave: cantidad }) // ajusta al nombre del parámetro que espera tu RPC
        });

        if (!res.ok) throw new Error("Error al obtener preguntas");

        const data = await res.json(); // ✅ ahora sí tienes el JSON parseado
        console.log(data); // aquí ya puedes ver el array con lista, clave, etc.
        return data;

    } catch (error) {
        console.error("Error fetching questions:", error);
        return [];
    }
};


const mapearPreguntaAPI = (preguntaAPI) => {
    return {
        id: 'pregunta' + preguntaAPI.idPregunta,
        titulo: preguntaAPI.enunciado,
        categoria: preguntaAPI.tipo,
        opciones: preguntaAPI.respuestas.map(r => ({
            id: 'o' + r.id,
            texto: r.texto,
            correcta: r.es_correcta,
            retroalimentacion: r.retroalimentacion
        }))
    };
};
