class InicioAdivinaComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.index = 0;

    this.shadowRoot.innerHTML = `
      <style>

        :host {
          --radius: 16px;
          display: flex;               /* ✅ flex para centrar */
          justify-content: center;     /* ✅ centra horizontal */
          align-items: center;         /* ✅ centra vertical */
          width: 100%;
          height: 100%;
          text-align: center;          /* ✅ centra texto */
        }

        .card {
          border-radius: var(--radius);
          box-shadow: 0 10px 30px rgba(20, 30, 60, 0.12);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          background-color: #fff;
          width: 90%;                  /* ✅ ocupa 90% en móvil */
          max-width: 600px;            /* ✅ límite en desktop */
          margin: auto;
        }

        .video-wrap {
          width: 100%;
          max-width: 600px;
          aspect-ratio: 16/9;
          background-color: #fff;
          border-radius: var(--radius);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        video {
          width: 60%;
          height: 60%;
          object-fit: cover;
          display: block;
        }

        #streaming-text {
          text-align: center;
          word-wrap: break-word;
          min-height: 3.5em; /* espacio reservado */
          line-height: 1.4;
        }

        .btn {
          margin-top: 16px;
          padding: 10px 24px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          background-color: #0a0043;
          color: white;
          cursor: pointer;
          transition: background 0.3s, opacity 0.5s;
          opacity: 0;              /* oculto visualmente */
          pointer-events: none;    /* no clickeable al inicio */
        }

        .btn.visible {
          opacity: 1;
          pointer-events: auto;    /* clickeable cuando aparece */
        }

        .btn:hover {
          background-color: #190134;
        }

        @media (max-width: 520px) {
          .card {
            padding: 12px;
          }
          .btn {
            font-size: 14px;
            width: 80%;
            padding: 8px 20px;
          }
          video {
            width: 80%;
            height: 80%;
          }
        }
      </style>

      <main class="card" role="main">
        <h2 style="margin: 0; font-weight: 600; margin-top: 30px;">
          Ordena las palabras
        </h2>
        <p id="streaming-text"></p>

        <div class="video-wrap">
          <video autoplay loop muted playsinline>
            <source src="super.webm" type="video/webm" />
            Tu navegador no soporta video HTML5.
          </video>
        </div>

        <button id="btn-jugar" class="btn" onclick="nextCard()">
          Jugar
        </button>
      </main>
    `;
  }

  connectedCallback() {
    this.escribir();
  }

  escribir() {
    const texto = "Recuerda leer bien el texto y recordar palabras claves antes de iniciar el juego.";
    const contenedor = this.shadowRoot.getElementById("streaming-text");
    const btnJugar = this.shadowRoot.getElementById("btn-jugar");

    if (this.index < texto.length) {
      contenedor.textContent += texto.charAt(this.index);
      this.index++;
      setTimeout(() => this.escribir(), 50);
    } else {
      btnJugar.classList.add("visible"); // aparece sin expandir
    }
  }
}

customElements.define('inicio-adivina-component', InicioAdivinaComponent);
