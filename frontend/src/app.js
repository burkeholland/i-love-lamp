// define variables
const app = document.getElementById("app");
const login = document.getElementById("login");
const goButton = document.getElementById("goButton");
const colorInput = document.getElementById("colorInput");
const currentColor = document.getElementById("currentColor");
const bulb = document.getElementById("bulb");
let userName = null;

class App {
  /**
   * Initalize the page and websocket connection
   */
  async init() {  

    // are we logged in?
    await this.checkLogin();

    if (userName) {
      // show the app / hide the login
      app.style.display = "block";
      login.style.display = "none";

      // initialize signalR hub (websockets connection)
      let connection = new signalR.HubConnectionBuilder()
        .withUrl("/api")
        .build();

      // receives the "colorChanged" web socket event
      connection.on("colorChanged", (hex, userName) => {
        // add a color circle
        this.updateColor(hex, userName);
      });

      // start the websocket connection
      await connection.start();

      goButton.addEventListener("click", async () => {
        const color = colorInput.value;
        this.setColor(color);
      });
    }
    else {
      // show the login - it's hidden by default to avoid
      // it flashing briefly while the authentication is checked
      login.style.visibility = "visible";
    }
  }

  /**
   * Checks to see if the user is logged in
   * 
   */
  async checkLogin() {
    const res = await fetch("/.auth/me");
    const json = await res.json();
    if (json.clientPrincipal) {
      userName = json.clientPrincipal.userDetails;
    }
  }

  /**
   * Calls the API to update the lamp color
   * @param {string} color
   */
  async setColor(color) {
    await fetch(
      `/api/setColor?color=${color.substring(1, color.length)}&userName=${userName}`
    );
  }

  /**
   * Adds a circle representing the most recently updated color and changes
   * the color of the bulb
   * @param {string} color
   */
  updateColor(color, userName) {
    // add a color circle
    bulb.style = `fill: #${color};`;
    currentColor.innerHTML = `<strong>${userName}</strong> set the color to <span class='has-background-white p-1' style='color: #${color}'>${color}</span>`
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
