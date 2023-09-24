/**
 * 'api/scripts': Scripts API to POST run script
 */

const fs = require('fs');
const path = require('path');
var express = require('express');
const authJwt = require('../jwt-helper');
var runtime;
var secureFnc;
var checkGroupsFnc;

module.exports = {
  init: function (_runtime, _secureFnc, _checkGroupsFnc) {
    runtime = _runtime;
    secureFnc = _secureFnc;
    checkGroupsFnc = _checkGroupsFnc;
  },
  app: function () {
    var scriptsApp = express();
    scriptsApp.use(function (req, res, next) {
      if (!runtime.project) {
        res.status(404).end();
      } else {
        next();
      }
    });

    /**
     * POST runscript
     * Run script, can be call with script id or script content as test
     */
    scriptsApp.post(
      '/scada/api/runscript',
      secureFnc,
      function (req, res, next) {
        var groups = checkGroupsFnc(req);
        if (res.statusCode === 403) {
          runtime.logger.error('api post runscript: Tocken Expired');
        } else if (
          !runtime.scriptsMgr.isAuthorised(req.body.params.script, groups)
        ) {
          res
            .status(401)
            .json({ error: 'unauthorized_error', message: 'Unauthorized!' });
          runtime.logger.error('api post runscript: Unauthorized');
        } else {
          runtime.scriptsMgr
            .runScript(req.body.params.script)
            .then(function (result) {
              res.json(result);
            })
            .catch(function (err) {
              if (err.code) {
                res.status(400).json({ error: err.code, message: err.message });
                runtime.logger.error('api post runscript: ' + err.message);
              } else {
                res
                  .status(400)
                  .json({ error: 'unexpected_error', message: err.toString() });
                runtime.logger.error('api post runscript: ' + err);
              }
            });
        }
      }
    );

    return scriptsApp;
  },
};
