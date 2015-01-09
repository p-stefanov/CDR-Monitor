# Summary

Visualizing and updating in real-time the information gathered from [this daemon](https://github.com/p-stefanov/Meridian1CDR) with [Chart.js](http://www.chartjs.org/).

# More info

It is supposed to be a single-page application. When a user connects, they are given some initial information in order to have something to desplay. After that, whenever something new comes up from [the daemon](https://github.com/p-stefanov/Meridian1CDR), all users are notified of that (and the charts they are drawing are also changing).

# Libraries needed

  - [Chart.js](http://www.chartjs.org/)
  - [socket.io](http://socket.io/)
  - [Sequelize](http://sequelizejs.com/)
  - [sqlite3](https://www.npmjs.com/package/sqlite3)
  - express
  - http
