// parser.js
var Transform = require('stream').Transform;
var util = require('util');
var split = require('split');
var fs = require('fs');

var n1_regexp = /(?:^|\s)n1=(.*?)(?:\s|$)/g;
var n2_regexp = /(?:^|\s)n2=(.*?)(?:\s|$)/g;
var in_regexp = /(?:^|\s)in=\"(.*?)\"(?:\s|$)/g;

process.stdin.setEncoding("utf8"); // convert bytes to utf8 characters

util.inherits(ProblemStream, Transform); // inherit Transform
util.inherits(BinaryStream, Transform); // inherit Transform

var binbuff = new BinaryStream();

function BinaryStream () {
  Transform.call(this, { "objectMode": false });
  
  this._lastChunkData = null;
  // console.log('constructor');
}

BinaryStream.prototype._transform = function(chunk, encoding, cb)
{
  var buffer =  (Buffer.isBuffer(chunk)) ? chunk : new Buffer(chunk, enc);
  
  var str;
  for(var i=0; i<buffer.length; i+=4)
  {
    buffer.writeFloatLE(buffer.readFloatLE(i)*2,i);
  }
  this.push(buffer);
  cb();
}

BinaryStream.prototype._flush = function(cb){
  cb();
}
  
function ProblemStream () {
    Transform.call(this, { "objectMode": true });

    this.numProblemsToSolve = null;
}

ProblemStream.prototype._transform = function (line, encoding, processed) {
    if (this.numProblemsToSolve === null) // handle first line 
    { 
        this.numProblemsToSolve = +line;
    }
    else 
    {
      // n1
      var values = n1_regexp.exec(line); // break line into an array of numbers
      if (values !== undefined && values !== null)
      {
        var n1 = parseInt(values[1]);
        console.log('N1 = '+n1);
      }       
      
      // n2  
      values = n2_regexp.exec(line); // break line into an array of numbers
      if (values !== undefined && values !== null)
      {
        var n2 = parseInt(values[1]);
        console.log('N2 = '+n2);
      }   
      
      // in  
      values = in_regexp.exec(line); // break line into an array of numbers
      if (values !== undefined && values !== null)
      {
        var _in = values[1];
        console.log('in = '+_in);
        fs.createReadStream(_in)
          .pipe(binbuff)
          .pipe(fs.createWriteStream(process.env.DATAPATH+'out.rsf@'));
      }  
    }
    this.push(line+'\n');
    processed(); // we're done processing the current line
};

// Pipe the streams
process.stdin
  .pipe(split())
  .pipe(new ProblemStream())
  .pipe(process.stdout);

// Some programs like `head` send an error on stdout
// when they don't want any more data
process.stdout.on('error', process.exit);