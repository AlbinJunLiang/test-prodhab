class JuegoMemoria extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.indiceActual = 0;
    this.palabraFormada = [];
    this.confettiInterval = null; // To store confetti animation interval
  }

  connectedCallback() {
    // Obtener atributos
    const textoIntroduccion =
      this.getAttribute("intro-text") ||
      "Este es un ejemplo de historia con palabras importantes.";

    const tema =
      this.getAttribute("tema") ||
      "Símbolos patrios"; // Valor por defecto si no se proporciona el atributo

    let palabras = [];
    try {
      palabras = JSON.parse(this.getAttribute("words") || "[]").filter(
        (palabra) =>
          typeof palabra === "string" &&
          palabra.trim() !== "" &&
          /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(palabra)
      );
    } catch (e) {
      console.error("Error al parsear el atributo palabras:", e);
    }

    // Normalizar texto para validación
    const normalizar = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Validar que las palabras estén en el texto de introducción
    const textoNormalizado = normalizar(textoIntroduccion);
    palabras = palabras.filter((palabra) => {
      const palabraNormalizada = normalizar(palabra);
      const regex = new RegExp(`\\b${palabraNormalizada}\\b`, "gi");
      if (!regex.test(textoNormalizado)) {
        console.warn(
          `La palabra "${palabra}" no se encuentra en el texto de introducción y será ignorada.`
        );
        return false;
      }
      return true;
    });

    if (palabras.length === 0) {
      palabras = ["ejemplo"];
    }

    this.palabras = this.mezclarArray([...palabras]);

    // Renderizar
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          box-sizing: border-box;
          background: transparent; /* Ensure transparent background */
        }

        .contenedor-juego {
        background: white;
          border-radius: 20px;
          padding: 30px;
          width: 600px; /* 🔹 Fixed width for all screen sizes */
          box-sizing: border-box; /* 🔹 Padding included in width */
          text-align: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: auto;
          position: relative; /* 🔹 For canvas positioning */
        }

        h2 {
          font-size: 1.8rem;
          margin-bottom: 15px;
          color: #2d2d6b;
        }

        p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #444;
          overflow-wrap: break-word;
          max-width: 100%; /* 🔹 Ensure text doesn't overflow */
        }

        .palabra-mezclada {
          font-size: 2rem;
          font-weight: bold;
          margin: 25px 0;
          letter-spacing: 6px;
          color: #2d2d6b;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
          word-break: break-word;
          max-width: 100%; /* 🔹 Prevent overflow */
        }

        .contenedor-letras {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 20px;
          min-height: 50px;
          max-width: 100%; /* 🔹 Constrain letter buttons */
        }

        .boton-letra {
          padding: 15px 20px;
          font-size: 1.3rem;
          border: 2px solid #4c6ef5;
          border-radius: 10px;
          background: #ffffff;
          color: #2d2d6b;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s, opacity 0.3s;
          min-width: 40px;
          text-align: center;
          font-weight: bold;
          flex: 1 1 auto;
          max-width: 60px;
        }

        .boton-letra:hover:enabled {
          background: #ffffffff;
          transform: scale(1.1);
        }

        .boton-letra:disabled {
          background: #ffffffff;
          color: #888;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .palabra-formada {
          font-size: 1.5rem;
          margin: 15px 0;
          min-height: 1.5em;
          color: #2d2d6b;
          font-weight: bold;
          word-break: break-word;
          max-width: 100%; /* 🔹 Prevent overflow */
        }

        .contenedor-acciones {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 15px;
        }

        button {
          width: 160px;
          padding: 14px 0;
          font-size: 1.1rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: bold;
          background: #4c6ef5;
          color: white;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          transition: background 0.3s, transform 0.2s;
        }

        button:hover:enabled {
          background: #364fc7;
          transform: translateY(-2px);
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
          box-shadow: none;
        }

        .contador {
          margin-top: 15px;
          font-weight: bold;
          color: #555;
          font-size: 1.1rem;
        }

        .oculto {
          display: none;
        }

        .mensaje-error {
          color: #e03131;
          font-weight: bold;
          margin: 15px 0;
          min-height: 1.4em;
          font-size: 1.1rem;
          overflow-wrap: break-word;
          max-width: 100%; /* 🔹 Prevent overflow */
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }

        .shake {
          animation: shake 0.3s;
        }

        #final h2 {
          color: #160752ff;
          font-size: 2rem;
        }

        #final p {
          font-size: 1.2rem;
          color: #333;
        }

        .contenedor-consentimiento {
          margin-top: 20px;
          margin-bottom: 18px;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          flex-wrap: nowrap;
          white-space: nowrap;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .contenedor-consentimiento label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          max-width: 85%;
          cursor: help;
        }

        #confetti-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none; /* 🔹 Prevent canvas from blocking interactions */
          z-index: 10; /* 🔹 Ensure confetti appears above other elements */
        }

        #final{
          height: 400px;
        }

        @media (max-width: 480px) {
          .contenedor-juego {
            width: 340px; /* 🔹 Fixed width for mobile */
            padding: 20px;
            border-radius: 14px;
          }
          h2 {
            font-size: 1.4rem;
          }
          p {
            font-size: 0.95rem;
          }
          .palabra-mezclada {
            font-size: 1.5rem;
            letter-spacing: 3px;
            margin: 12px 0;
          }
          .boton-letra {
            padding: 8px;
            font-size: 0.95rem;
            min-width: 28px;
            max-width: 42px;
            flex: 1 0 16%;
            margin: 2px;
          }
          .palabra-formada {
            font-size: 1.2rem;
          }
          button {
            width: 100%;
            padding: 10px 0;
            font-size: 0.9rem;
          }
          .contenedor-consentimiento {
            font-size: 0.85rem;
            gap: 8px;
          }
          .contenedor-consentimiento label {
            max-width: 80%;
          }
          .contenedor-letras {
            gap: 8px;
          }
        }

        @media (max-width: 768px) and (min-width: 481px) {
          .contenedor-juego {
            width: 500px; /* 🔹 Fixed width for tablets */
            padding: 15px;
          }
          .boton-letra {
            flex: 1 0 14%;
          }
        }
      </style>

      <div class="contenedor-juego">
        <canvas id="confetti-canvas" class="oculto"></canvas>
        <div id="introduccion">
          <h2>${this.getAttribute("tema") || "Ordena las palabras"}</h2>
          <p id="historia"></p>
          <p><em>Recuerda bien las palabras en negrita...</em></p>
          <div class="contenedor-consentimiento">
            <input type="checkbox" id="consentimiento" />
            <label for="consentimiento">He leído y entiendo las instrucciones</label>
          </div>
          <button id="botonInicio" disabled>¡Estoy listo!</button>
        </div>
        <div id="juego" class="oculto">
          <h2>Adivina la palabra</h2>
          <div class="palabra-mezclada" id="palabraMezclada"></div>
          <div class="contenedor-letras" id="contenedorLetras"></div>
          <div class="palabra-formada" id="palabraFormada"></div>
          <div class="contenedor-acciones">
            <button id="botonDeshacer">Limpiar</button>
            <button id="botonComprobar" disabled>Comprobar</button>
          </div>
          <p class="mensaje-error" id="error"></p>
          <p class="contador" id="contador"></p>
        </div>

<div id="final" class="oculto" style="position: relative; width: 100%; min-height: 400px; margin-bottom: -30px;">
  <h2>¡Juego terminado!</h2>
  <p>Has recordado todas las palabras clave.</p>
  <button id="botonReiniciar">Jugar de nuevo</button>

  <video id="videoFinal" 
         src="blanco.webm" 
         autoplay 
         muted 
         loop
         style="position: absolute; bottom: 0; left: 0; width: 100%; height: auto; max-height: 60%; object-fit: contain;">
    Tu navegador no soporta la etiqueta <code>video</code>.
  </video>
</div>



      </div>
    `;

    // Referencias
    this.botonInicio = this.shadowRoot.getElementById("botonInicio");
    this.consentimiento = this.shadowRoot.getElementById("consentimiento");
    this.palabraMezclada = this.shadowRoot.getElementById("palabraMezclada");
    this.contenedorLetras = this.shadowRoot.getElementById("contenedorLetras");
    this.palabraFormada = this.shadowRoot.getElementById("palabraFormada");
    this.error = this.shadowRoot.getElementById("error");
    this.contador = this.shadowRoot.getElementById("contador");
    this.juego = this.shadowRoot.getElementById("juego");
    this.introduccion = this.shadowRoot.getElementById("introduccion");
    this.final = this.shadowRoot.getElementById("final");
    this.botonReiniciar = this.shadowRoot.getElementById("botonReiniciar");
    this.botonComprobar = this.shadowRoot.getElementById("botonComprobar");
    this.botonDeshacer = this.shadowRoot.getElementById("botonDeshacer");
    this.historia = this.shadowRoot.getElementById("historia");
    this.confettiCanvas = this.shadowRoot.getElementById("confetti-canvas");

    // Resaltar palabras
    this.historia.innerHTML = this.resaltarPalabras(
      textoIntroduccion,
      this.palabras
    );

    // Eventos
    this.configurarEventos();


    const video = this.shadowRoot.getElementById("videoFinal");

    // Asegurarse de que no se repita
    video.loop = false;

    // Al terminar, se queda en el último frame
    video.addEventListener('ended', () => {
      video.pause(); // ya está al final
      video.currentTime = video.duration; // opcional, asegurar último frame
    });

  }

  mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  resaltarPalabras(texto, palabras) {
    let resultado = texto;
    const palabrasOrdenadas = [...palabras].sort((a, b) => b.length - a.length);
    palabrasOrdenadas.forEach((palabra) => {
      const palabraEscapada = palabra.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const regex = new RegExp(`\\b${palabraEscapada}\\b`, "gi");
      resultado = resultado.replace(regex, `<strong>$&</strong>`);
    });
    return resultado;
  }

  // Confetti animation logic
  startConfetti() {
    if (!this.confettiCanvas) return;
    this.confettiCanvas.classList.remove("oculto");
    const ctx = this.confettiCanvas.getContext("2d");
    const particles = [];
    const colors = ["#ADD8E6", "#4682B4", "#0000FF", "#1E90FF", "#87CEEB"]; // 🔹 Shades of blue

    // Set canvas size to match contenedor-juego
    this.confettiCanvas.width = this.confettiCanvas.offsetWidth;
    this.confettiCanvas.height = this.confettiCanvas.offsetHeight;

    const createParticle = () => {
      return {
        x: Math.random() * this.confettiCanvas.width,
        y: -10, // 🔹 Start above canvas for rain effect
        size: Math.random() * 8 + 4, // 🔹 Smaller squares for rain-like effect
        speedX: Math.random() * 0.2 - 0.1, // 🔹 Minimal horizontal movement
        speedY: Math.random() * 2 + 2, // 🔹 Consistent downward speed
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const updateParticles = () => {
      ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.size *= 0.99; // 🔹 Slightly slower shrink for visibility
        if (particle.size < 0.5 || particle.y > this.confettiCanvas.height) {
          particles.splice(index, 1);
        }
      });

      // Add new particles
      if (Math.random() < 0.7) { // 🔹 Higher chance for continuous rain
        particles.push(createParticle());
      }

      // Draw particles as squares
      particles.forEach((particle) => {
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        ); // 🔹 Draw squares
      });

      if (particles.length > 0) {
        requestAnimationFrame(updateParticles);
      } else {
        this.stopConfetti();
      }
    };

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push(createParticle());
    }

    // Start animation
    this.confettiInterval = requestAnimationFrame(updateParticles);
  }

  stopConfetti() {
    if (this.confettiInterval) {
      cancelAnimationFrame(this.confettiInterval);
      this.confettiInterval = null;
    }
    if (this.confettiCanvas) {
      const ctx = this.confettiCanvas.getContext("2d");
      ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
      this.confettiCanvas.classList.add("oculto");
    }
  }

  validarPalabra() {
    const normalizar = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const palabraIngresada = this.palabraFormada.textContent.trim();

    if (!palabraIngresada) {
      this.error.textContent = "❌ Por favor, forma una palabra.";
      this.palabraMezclada.classList.add("shake");
      setTimeout(() => {
        this.palabraMezclada.classList.remove("shake");
      }, 400);
      return false;
    }

    if (
      normalizar(palabraIngresada) ===
      normalizar(this.palabras[this.indiceActual])
    ) {
      this.contenedorLetras.querySelectorAll(".boton-letra").forEach(
        (b) => (b.disabled = true)
      );
      this.indiceActual++;
      if (this.indiceActual < this.palabras.length) {
        this.mostrarPalabra();
      } else {
        this.juego.classList.add("oculto");
        this.final.classList.remove("oculto");
        this.startConfetti(); // 🔹 Trigger confetti when game ends
      }
      return true;
    } else {
      this.error.textContent = "❌ Palabra incorrecta, intenta de nuevo.";
      this.palabraMezclada.classList.add("shake");
      setTimeout(() => {
        this.palabraMezclada.classList.remove("shake");
      }, 400);
      return false;
    }
  }

  configurarEventos() {
    this.botonInicio.addEventListener("click", () => {
      this.introduccion.classList.add("oculto");
      this.juego.classList.remove("oculto");
      this.mostrarPalabra();
    });

    this.consentimiento.addEventListener("change", () => {
      this.botonInicio.disabled = !this.consentimiento.checked;
    });

    this.botonComprobar.addEventListener("click", () => {
      this.validarPalabra();
    });

    this.botonDeshacer.addEventListener("click", () => {
      this.palabraFormada.textContent = "";
      this.contenedorLetras
        .querySelectorAll(".boton-letra")
        .forEach((b) => (b.disabled = false));
      this.error.textContent = "";
    });

    this.botonReiniciar.addEventListener("click", () => {
      this.indiceActual = 0;
      let palabrasOriginales = [];
      try {
        palabrasOriginales = JSON.parse(
          this.getAttribute("words") || "[]"
        ).filter(
          (palabra) =>
            typeof palabra === "string" &&
            palabra.trim() !== "" &&
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/.test(palabra)
        );
      } catch (e) {
        console.error("Error al parsear el atributo palabras:", e);
      }
      if (palabrasOriginales.length === 0) {
        palabrasOriginales = ["ejemplo"];
      }
      this.palabras = this.mezclarArray([...palabrasOriginales]);
      this.introduccion.classList.remove("oculto");
      this.juego.classList.add("oculto");
      this.final.classList.add("oculto");
      this.consentimiento.checked = false;
      this.botonInicio.disabled = true;
      this.palabraFormada.textContent = "";
      this.historia.innerHTML = this.resaltarPalabras(
        this.getAttribute("intro-text") || "",
        this.palabras
      );
      this.stopConfetti(); // 🔹 Clear confetti on reset
    });
  }

  mezclarPalabra(palabra) {
    if (!palabra || palabra.trim() === "") return "";
    const letras = palabra.toUpperCase().split("");
    return letras.sort(() => Math.random() - 0.5).join("");
  }

  mostrarPalabra() {
    if (this.indiceActual >= this.palabras.length) {
      this.juego.classList.add("oculto");
      this.final.classList.remove("oculto");
      this.startConfetti(); // 🔹 Trigger confetti if navigating directly to final
      return;
    }
    const palabraMezclada = this.mezclarPalabra(
      this.palabras[this.indiceActual]
    );
    this.palabraMezclada.textContent = palabraMezclada;
    this.contador.textContent = `Palabra ${this.indiceActual + 1} de ${this.palabras.length}`;
    this.palabraFormada.textContent = "";
    this.error.textContent = "";
    this.botonDeshacer.disabled = false;

    this.contenedorLetras.innerHTML = "";
    palabraMezclada.split("").forEach((letra) => {
      const boton = document.createElement("button");
      boton.classList.add("boton-letra");
      boton.textContent = letra;
      boton.addEventListener("click", () => {
        this.palabraFormada.textContent += letra;
        boton.disabled = true;
        if (
          this.palabraFormada.textContent.length ===
          this.palabras[this.indiceActual].length
        ) {
          this.validarPalabra();
        }
      });
      this.contenedorLetras.appendChild(boton);
    });
  }
}

customElements.define("juego-memoria", JuegoMemoria);