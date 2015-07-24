var through = require('through');
var jade = require('jade');

module.exports = function(file) {
  if (!/\.jade$/.test(file)) {
    return through();
  }

  var data = '';

  function write(buf) {
    data += buf;
  }

  function end() {
    var that = this;

    var result;

    try {
      result = jade.compileClientWithDependenciesTracked(data, {filename:file});
    } catch(e) {
      self.emit('error', e);
      return;
    }

    result.dependencies.forEach(function(dep) {
      that.emit('file', dep);
    });

    var content = result.body + ';;\n';
    content += 'module.exports = template();';

    that.queue(content);
    that.queue(null);

  }

  return through(write, end);
};
