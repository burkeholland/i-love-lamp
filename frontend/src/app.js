let $ = document.querySelector.bind(document);

// define variables
const app = $("#app");
const login = $("#login");
const goButton = $("#goButton");
const colorInput = $("#colorInput");
const currentColor = $("#currentColor");
const bulb = $("#bulb");
const colorControl = $("#colorControl");
const logoutButton = $("#logoutButton");
let clientPrincipal = null;

class App {
  presentationMode = localStorage.getItem("presentationMode") || false;
  /**
   * Initalize the page and websocket connection
   */
  async init() {
    // are we logged in?
    await this.setLoginState();

    // initialize signalR hub (websockets connection)
    let connection = new signalR.HubConnectionBuilder().withUrl("/api").build();

    // receives the "colorChanged" web socket event
    connection.on("colorChanged", (hex, userName, identityProvider) => {
      // add a color circle
      this.updateColor(hex, userName, identityProvider);
    });

    // start the websocket connection
    await connection.start();

    goButton.addEventListener("click", async () => {
      const color = colorInput.value;
      this.setColor(color);
    });

    // double-clicking the bulb puts the app in presentation mode
    // where usernames will not be shown
    bulb.addEventListener("dblclick", () => {
      this.presentationMode = !this.presentationMode;
      localStorage.setItem("presentationMode", this.presentationMode);
      alert(`Presentation mode is ${this.presentationMode ? "ON" : "OFF"}`);
    });
  }

  /**
   * Checks to see if the user is logged in
   *
   */
  async setLoginState() {
    const res = await fetch("/.auth/me");
    const json = await res.json();
    if (json.clientPrincipal) {
      clientPrincipal = json.clientPrincipal;
      login.style.display = "none";
      logoutButton.style.display = "inline";
      colorControl.style.display = "flex";
    } else {
      login.style.visibility = "visible";
      logoutButton.style.display = "none";
    }
  }

  /**
   * Calls the API to update the lamp color
   * @param {string} color
   */
  async setColor(color) {
    await fetch(
      `/api/setColor?color=${color.substring(1, color.length)}&userName=${
        clientPrincipal.userDetails
      }&identityProvider=${clientPrincipal.identityProvider}`
    );
  }

  /**
   * Adds a circle representing the most recently updated color and changes
   * the color of the bulb
   * @param {string} color
   */
  updateColor(color, userName, identityProvider) {
    // add a color circle
    bulb.style = `fill: #${color};`;
    let displayName = this.presentationMode ? identityProvider : userName;
    currentColor.innerHTML = `<strong>${displayName}</strong> user set the color to <span class='has-background-white p-1' style='color: #${color}'>${color}</span>`;
  }

  /**
   * Creates the color circle HTML element
   * @param {string} color
   */
  createColumn(color) {
    let column = document.createElement("div");
    column.className = "column is-1 pastColor drop";
    column.style = `background-color: #${color}`;
    column.addEventListener("click", () => {
      this.setColor(color);
    });

    return column;
  }
}

new App().init();
