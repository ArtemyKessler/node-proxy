var express = require('express');
var router = express.Router();
const bodyParser = require("body-parser");
var axios = require('axios');

const jsonParser = bodyParser.json()
const proxy = require('http-proxy').createProxyServer();

proxy.on('proxyReq', (proxyReq, req) => {
  if (req.body) {
      const bodyData = JSON.stringify(req.body);
      // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
      proxyReq.setHeader('Content-Type','application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // stream the content
      proxyReq.write(bodyData);
      // TODO: restream to one more destination
      // axios.post(proxyReq);
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
 res.send("KEKES");
});

/* route apple callbacks */
router.post('/', jsonParser, async (req, res, next) => {
  const errors = [];
  try {
    console.log("FIRST PROXY");
    proxy.web(req, res, {
      target: 'http://localhost:3001/v2'
    }, next); 
  } catch (error) {
    errors.push(error);
  }
  try {
    console.log("SECOND PROXY");
    proxy.web(req, res, {
      target: 'https://api.apphud.com/appstore/app_voqFxa5PvbYTeK4AW2BpEGJ4hzbHs1'
    }, next); 
  } catch (error) {
    errors.push(error);
  }
  const proxyData = {
    message: errors.length ? "Errored" : "success",
    errors, 
  };
  res.status(200).send(proxyData);
});

module.exports = router;
