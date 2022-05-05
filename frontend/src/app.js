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
const togglePresenterModeButton = $("#togglePresenterModeButton");
let clientPrincipal = null;

class App {
  presentationMode = this.setPresenterMode(
    localStorage.getItem("presentationMode")
  );
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

    togglePresenterModeButton.addEventListener("click", () => {
      this.setPresenterMode(!this.presentationMode);
    });
  }

  setPresenterMode(value) {
    this.presentationMode = value;
    localStorage.setItem("presentationMode", this.presentationMode);
    togglePresenterModeButton.textContent = `Presenter Mode : ${
      this.presentationMode ? "ON" : "OFF"
    }`;
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
      logoutButton.style.display = "inline-flex";
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
    // bulb.style = `fill: #${color};`;
    let displayName = this.presentationMode
      ? `${identityProvider} user`
      : userName;
    currentColor.innerHTML = `<strong>${displayName}</strong> set the color to <span class='is-bold' style='color: #${color}'>${color}</span>`;
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
