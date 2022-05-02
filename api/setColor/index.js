const axios = require('axios');

const config = {
  headers: {
    Authorization: `Bearer ${process.env.LIFX_TOKEN}`
  }
}

module.exports = async function (context, req) {
  let newColor = req.query.color;
  let userName = req.query.userName;
    if (newColor) {
      try {
        const res = await axios.put('https://api.lifx.com/v1/lights/label:Lamp/state', { color: newColor }, config)
        context.res = {
          body: "OK"
        };
        context.bindings.signalRMessage = {
          target: 'colorChanged',
          arguments: [ newColor, userName ]
        };
      }
      catch (err) {
        context.res = {
          status: 500,
          body: err.message
        };
      }
    }
    else {
      context.res = {
        status: 500,
        body: 'Please pass the color parameter'
      }
    }
};