    class ModalPareo extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
          <style>
            :host {
              font-family: 'Segoe UI', Roboto, Arial, sans-serif;
            }
            .modal {
              display: none;
              position: fixed;
              inset: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0, 0, 0, 0.45);
              backdrop-filter: blur(4px);
              justify-content: center;
              align-items: center;
              z-index: 1000;
              animation: fadeIn 0.3s ease forwards;
            }
            .modal-content {
              background: #fff;
              border-radius: 12px;
              padding: 25px 30px 60px; 
              width: 90%;
              max-width: 250px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.15);
              position: relative;
              animation: scaleUp 0.3s ease forwards;
            }
            .modal-content h1 {
              font-size: 20px;
              color: #222;
              margin-bottom: 18px;
              font-weight: 600;
            }
            .modal-content p {
              font-size: 14px;
              color: #555;
              margin-top: 12px;
              line-height: 1.5;
            }
            .modal-content a {
              color: #007BFF;
              text-decoration: none;
              font-weight: 600;
            }
            .modal-content a:hover {
              text-decoration: underline;
            }
            .close-btn {
              position: absolute;
              top: 8px;
              right: 10px;
              background: transparent;
              color: #888;
              border: none;
              font-size: 22px;
              line-height: 1;
              cursor: pointer;
              transition: color 0.2s ease;
            }
            .close-btn:hover {
              color: #000;
            }
            .close-bottom-btn {
              margin-top: 20px;
              padding: 10px 20px;
              background:  #1e355e;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              cursor: pointer;
              transition: background 0.2s ease;
              position: absolute;
              bottom: 15px;
              left: 50%;
              transform: translateX(-50%);
            }
            .close-bottom-btn:hover {
              background: #0056b3;
            }
            #character {
              width: 120px;
              animation: float 4s infinite ease-in-out;
              margin: 0 auto;
              display: block;
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-15px); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          </style>
          <div class="modal">
            <div class="modal-content">
              <button class="close-btn">×</button>
              <h1 id="modal-title"></h1>
              <img id="character" alt="Personaje volando">
              <p>Puedes ver más información en el siguiente enlace: 
                <a id="modal-link" target="_blank">clic</a>
              </p>
              <button class="close-bottom-btn">Cerrar</button>
            </div>
          </div>
        `;
      }

      static get observedAttributes() {
        return ["title", "img", "link"];
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (!this.shadowRoot) return;
        if (name === "title") {
          this.shadowRoot.querySelector("#modal-title").textContent = newValue;
        }
        if (name === "img") {
          this.shadowRoot.querySelector("#character").src = newValue;
        }
        if (name === "link") {
          this.shadowRoot.querySelector("#modal-link").href = newValue;
        }
      }

      connectedCallback() {
        this.modal = this.shadowRoot.querySelector(".modal");
        this.shadowRoot.querySelector(".close-btn").addEventListener("click", () => this.close());
        this.shadowRoot.querySelector(".close-bottom-btn").addEventListener("click", () => this.close());
        this.shadowRoot.querySelector(".modal").addEventListener("click", (e) => {
          if (e.target === this.modal) this.close();
        });

        // Inicializar con atributos
        if (this.hasAttribute("title")) {
          this.shadowRoot.querySelector("#modal-title").textContent = this.getAttribute("title");
        }
        if (this.hasAttribute("img")) {
          this.shadowRoot.querySelector("#character").src = this.getAttribute("img");
        }
        if (this.hasAttribute("link")) {
          this.shadowRoot.querySelector("#modal-link").href = this.getAttribute("link");
        }
      }

      open() {
        this.modal.style.display = "flex";
      }

      close() {
        this.modal.style.display = "none";
      }
    }

    customElements.define("modal-pareo", ModalPareo);
