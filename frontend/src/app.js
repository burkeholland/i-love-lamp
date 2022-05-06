let $ = document.querySelector.bind(document);

// define variables
const app = $("#app");
const login = $("#login");
const goButton = $("#goButton");
const colorInput = $("#colorInput");
const currentColor = $("#currentColor");
const colorControl = $("#colorControl");
const logoutButton = $("#logoutButton");
const presenterModeAnchor = $("#presenterModeAnchor");
const presenterModeSpan = $("#presenterModeSpan");
let clientPrincipal = null;

class App {
  presentationMode = localStorage.getItem("presentationMode");
  /**
   * Initalize the page and websocket connection
   */
  async init() {
    // are we in presentation mode?
    presenterModeSpan.textContent = this.presentationMode ? "ON" : "OFF";

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

    presenterModeAnchor.addEventListener("click", (e) => {
      this.presentationMode = !this.presentationMode;
      localStorage.setItem("presentationMode", this.presentationMode);
      presenterModeSpan.textContent = this.presentationMode ? "ON" : "OFF";
      e.preventDefault();
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
      logoutButton.style.display = "inline-flex";
      colorControl.style.display = "flex";
    } else {
      login.style.display = "block";
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
    let today = this.getToday();
    currentColor.innerHTML = `<strong>${displayName}</strong> set the color to <span class='is-bold' style='color: #${color}'>${color}</span> on ${today}`;
  }

  /**
   *
   * Formatting dates in JavaScript is so long that getting the current
   * date and time merits its own function
   * @returns string
   */
  getToday() {
    let date = new Date().toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    let time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
    return `${date} at ${time}`;
  }
}

new App().init();
