
const config = require('../etc/config.json');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const co = require('co');
const pg = require('co-pg')(require('pg'));
const path = require('path');

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function(socket) {
  socket.on('delete all', function(data) {
    co(deleteAll(socket, data));
  });

  socket.on('select', function(data) {
    co(select(socket, data));
  });

  socket.on('select pid nid', function(data) {
    co(selectPidNid(socket, data));
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function base(f) { return function * () {
  let done;
  try {
    // connect to DB
    let conn = yield(pg.connectPromise(config.PG_URL));
    let db = conn[0];
    done = conn[1];

    yield f(db);

  } catch(e) {
    console.log('error!!');
    console.log(e);

  } finally {
    if (done) {
      done();
    }
  }
};}

function deleteAll(socket, data) { return base(function * (db) {
  yield db.queryPromise('delete from log_node');
});}

function select(socket, data) { return base(function * (db) {
  let where = ' where';
  let keyword = [];
  let isFirst = true;

  data.keyword.forEach(function(key, idx) {
    if (isFirst) {
      isFirst = false;
      where += " record->>'message' ilike $1";
    } else {
      where += " or record->>'message' ilike $" + (idx + 1);
    }
    keyword.push('%' + key + '%');
  });

  let result = yield db.queryPromise(
    ' select * from log_node where log_id in' +
    ' (select distinct log_node.log_id' +
    ' from log_node ,(select log_id from log_node' + where + ' order by log_id desc) ids' +
    ' where log_node.log_id between (ids.log_id - ' + config.prev_num + ')' +
    ' and (ids.log_id + ' + config.post_num + ')' +
    ' limit ' + config.limit + ')', keyword);

  result.rows.sort(function(a, b) {
    return a.log_id - b.log_id;
  });
  socket.emit('result', result.rows);
});}

function selectPidNid(socket, data) { return base(function * (db) {
  let pidNid = {};
  let result = yield db.queryPromise(
    "  select record->>'message' m from log_node where record->>'mid' = 'L1013'");

  result.rows.forEach(function(row, idx) {
    let groups = row.m.match(/\(native_pid=(.*), nid=(.*)\)/);
    let pid = groups[1];
    let nid = groups[2];

    pidNid[pid] = nid;
  });

  socket.emit('pid nid', pidNid);
});}
