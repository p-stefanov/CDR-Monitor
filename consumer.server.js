var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Sequelize = require('sequelize');

var dbName = process.argv[2] || "demo.db";

var sequelize = new Sequelize(null, null, null, {
  dialect: 'sqlite',
  storage: dbName,
  define: {
    timestamps: false,
    freezeTableName: true
  }
});

var User = sequelize.define('user', {
  dn: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: false
  },
  callscount: Sequelize.INTEGER,
  seconds: Sequelize.INTEGER,
  bill: Sequelize.FLOAT
});

var Call = sequelize.define('call', {
  callid: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  dn: Sequelize.INTEGER,
  seconds: Sequelize.INTEGER,
  trunk: Sequelize.STRING,
  date: Sequelize.STRING,
  called: Sequelize.STRING,
  price: Sequelize.FLOAT,
  type: Sequelize.CHAR
});

User.hasMany(Call, { foreignKey: 'dn' });

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('topperReq', function (topperDn) {
    Call.findAll({
      where: { dn: topperDn }
    })
    .then(function (res) {
      socket.emit('topperRes', res);
    })   
  });

  User.findAll().then(function (res) {
    var infoToSend = res.map(function (user) {
      return user.dataValues;
    });
    socket.emit('initial info', infoToSend);
  });
});

http.listen(3000, function () {
  console.log('listening on port 3000');
});

process.stdin.on('data', function (data) {
  data = data.toString().replace(/^\s+|\s+$/g, '');
  var regex = /(\d+) called (\d+) on (.*?) for (\d+) s. costing (.*)/;
  var matched = regex.exec(data);
  var newCall = {
    dn: parseInt(matched[1]),
    called: matched[2],
    date: matched[3],
    seconds: parseInt(matched[4]),
    price: parseFloat(matched[5])
  };
  console.log('producer.pl says: ' + data);

  io.emit('update info', newCall);
});
