class ModalPareo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host { font-family: 'Segoe UI', Roboto, Arial, sans-serif; }

        .modal {
          display: none;
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          background: rgba(0,0,0,0.45); /* overlay semi-transparente */
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #fff;
          border-radius: 12px;
          padding: 25px 30px 60px; 
          width: 90%;
          max-width: 350px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          position: relative;
        }

        .modal-content h1 { font-size: 20px; color: #222; margin-bottom: 18px; font-weight: 600; }
        .modal-content p { font-size: 14px; color: #555; margin-top: 12px; line-height: 1.5; }
        .modal-content a { color: #007BFF; text-decoration: none; font-weight: 600; }
        .modal-content a:hover { text-decoration: underline; }

        .close-btn { position: absolute; top: 8px; right: 10px; background: transparent; color: #888; border: none; font-size: 22px; cursor: pointer; }
        .close-btn:hover { color: #000; }

        .close-bottom-btn { margin-top: 20px; padding: 10px 20px; background: #1e355e; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); }
        .close-bottom-btn:hover { background: #0056b3; }

        #character, #video { display: block; margin: 0 auto; }

        #character { width: 120px; }

        #video {
          width: 250px;
          max-width: 100%;
          border-radius: 10px;
          object-fit: cover;
        }

        #character.float, #video.float { animation: float 4s infinite ease-in-out; }

        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* Responsive para móviles */
        @media (max-width: 600px) {
          .modal-content {
          max-width: 60%;           width: 70%; /* ocupa 90% del ancho en móviles */
          }
          #video {
            width: 90%;
          }
        }
      </style>

      <div class="modal">
        <div class="modal-content">
          <button class="close-btn">×</button>
          <h1 id="modal-title"></h1>
          <img id="character" alt="Personaje">
          <video id="video" loop muted style="display:none"></video>
          <p>Puedes ver más información en el siguiente enlace: 
            <a id="modal-link" target="_blank">clic</a>
          </p>
          <button class="close-bottom-btn">Aceptar</button>
        </div>
      </div>
    `;
  }

  static get observedAttributes() { return ["title", "img", "video", "link", "animated", "float", "opaque"]; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.shadowRoot) return;

    const modal = this.shadowRoot.querySelector(".modal");
    const content = this.shadowRoot.querySelector(".modal-content");
    const character = this.shadowRoot.querySelector("#character");
    const video = this.shadowRoot.querySelector("#video");

    if (name === "title") this.shadowRoot.querySelector("#modal-title").textContent = newValue;

    if (name === "img") {
      character.src = newValue;
      character.style.display = 'block';
      video.style.display = 'none';
    }

    if (name === "video") {
      if (newValue) {
        video.src = newValue;
        video.style.display = 'block';
        character.style.display = 'none';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
      } else {
        video.pause();
        video.style.display = 'none';
        character.style.display = 'block';
      }
    }

    if (name === "link") this.shadowRoot.querySelector("#modal-link").href = newValue;
    if (name === "animated") {
      const hasAnim = this.hasAttribute("animated");
      hasAnim ? (modal.classList.add("animated"), content.classList.add("animated"))
              : (modal.classList.remove("animated"), content.classList.remove("animated"));
    }
    if (name === "float") {
      const hasFloat = this.hasAttribute("float");
      hasFloat ? (character.classList.add("float"), video.classList.add("float"))
               : (character.classList.remove("float"), video.classList.remove("float"));
    }
    if (name === "opaque") {
      const hasOpaque = this.hasAttribute("opaque");
      modal.style.background = hasOpaque ? "rgba(0,0,0,0.45)" : "transparent";
      modal.style.backdropFilter = hasOpaque ? "blur(4px)" : "none";
    }
  }

  connectedCallback() {
    this.modal = this.shadowRoot.querySelector(".modal");
    this.modalContent = this.shadowRoot.querySelector(".modal-content");
    this.character = this.shadowRoot.querySelector("#character");
    this.video = this.shadowRoot.querySelector("#video");

    this.shadowRoot.querySelector(".close-btn").addEventListener("click", () => this.close());
    this.shadowRoot.querySelector(".close-bottom-btn").addEventListener("click", () => this.close());
   // this.modal.addEventListener("click", e => { if (e.target === this.modal) this.close(); });

    if (this.hasAttribute("title")) this.shadowRoot.querySelector("#modal-title").textContent = this.getAttribute("title");
    if (this.hasAttribute("img")) { this.character.src = this.getAttribute("img"); this.character.style.display='block'; this.video.style.display='none'; }
    if (this.hasAttribute("video")) { 
      const v = this.getAttribute("video");
      this.video.src = v;
      this.video.style.display = 'block';
      this.character.style.display='none';
      this.video.autoplay = true;
      this.video.loop = true;
      this.video.muted = true;
    }
    if (this.hasAttribute("link")) this.shadowRoot.querySelector("#modal-link").href = this.getAttribute("link");
    if (this.hasAttribute("animated")) { this.modal.classList.add("animated"); this.modalContent.classList.add("animated"); }
    if (this.hasAttribute("float")) { this.character.classList.add("float"); this.video.classList.add("float"); }

    // Fondo por defecto blanco si no tiene 'opaque'
    if (this.hasAttribute("opaque")) { 
      this.modal.style.background="rgba(0,0,0,0.45)"; 
      this.modal.style.backdropFilter="blur(4px)"; 
    } else { 
      this.modal.style.background="transparent"; 
      this.modal.style.backdropFilter="none"; 
    }
  }

  open() { 
    this.modal.style.display = "flex"; 
    if (this.video) this.video.play(); // reproduce al abrir
  }

  close() { 
    this.modal.style.display = "none"; 
    if (this.video) this.video.pause(); // pausa al cerrar
  }
}

customElements.define("modal-pareo", ModalPareo);
