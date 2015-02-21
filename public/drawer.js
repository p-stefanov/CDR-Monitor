// "topper" is the one who talks the most

var gBillsChart = null;
var gCallsChart = null;
var gTopper = {};
var gUsers = [];

// returns DN
function findTopperDn(users) { // find out who talks the most from the users array
  var topperIdx = users.length - 1;
  for (var i = users.length - 1; i >= 0; i -= 1) {
    if (users[i].bill > users[topperIdx].bill) {
      topperIdx = i;
    }
  }
  return users[topperIdx].dn;
}

function findLongestCall(calls) {
  var longest = calls[0];
  for (var i = calls.length - 1; i >= 1; i -= 1) {
    if (calls[i].seconds > longest.seconds) {
      longest = calls[i];
    }
  }
  return longest;
}

function findMostFrequentCallee(calls) {
  var lookUp = {};
  var mode = calls[0].called;
  var maxCount = 1;
  for (var i = calls.length - 1; i >= 0; i -= 1) {
    var el = calls[i].called;
    if (!lookUp[el]) {
      lookUp[el] = 1;
    }
    else {
      lookUp[el]++;
    }
    if (lookUp[el] > maxCount) {
      mode = el;
      maxCount = lookUp[el];
    }
  }
  return mode;
}

function drawCharts() {
  var labels = gUsers.map(function (x) {
    return x.dn;
  });
  var bills = gUsers.map(function (x) {
    return x.bill;
  });
  var calls = gUsers.map(function (x) {
    return x.callscount;
  });

  if (!gBillsChart || !gCallsChart) {
    gBillsChart = new
      Chart($("#userBills").get(0).getContext("2d"))
        .Bar({ labels: labels, datasets: [{data: bills}] });
    gCallsChart = new
      Chart($("#userCalls").get(0).getContext("2d"))
        .Bar({ labels: labels, datasets: [{data: calls}] });
  } else {
    bills.map(function (bill, i) {
      gBillsChart.datasets[0].bars[i].value = bill;
    });

    calls.map(function (call, i) {
      gCallsChart.datasets[0].bars[i].value = call;
    });
    gBillsChart.update();
    gCallsChart.update();
  }
}

var socket = io();
socket.on('initial info', function (users) {
  gUsers = users.slice();
  drawCharts();

  gTopper.dn = findTopperDn(gUsers);
  socket.emit('topperReq', gTopper.dn);
  $("#topper h1:first").html("Topper is " + gTopper.dn);
});

socket.on('topperRes', function (calls) {
  gTopper.calls = calls.length;

  var longestCall = findLongestCall(calls);
  var mostFreqNum = findMostFrequentCallee(calls);
  $("#topper h2:nth-child(2)").html("Topper's longest call was with: " + longestCall.called
                      + " - " + longestCall.seconds + " seconds.");
  $("#topper h2:nth-child(3)").html("Topper mode a lot of calls with: " + mostFreqNum);
});

socket.on('update info', function (newCall) {
  var exists = false;
  for (var i = gUsers.length - 1; i >= 0; i -= 1) {
    if (gUsers[i].dn === newCall.dn) {
      gUsers[i].callscount += 1;
      gUsers[i].seconds += newCall.seconds;
      gUsers[i].bill += newCall.price;
      gUsers[i].bill = +gUsers[i].bill.toFixed(2); // take note of +
      exists = true;
      break;
    }
  }

  if (!exists) {
    gBillsChart.addData([newCall.price], newCall.dn);
    gCallsChart.addData([1], newCall.dn);
    gUsers.push({
      dn: newCall.dn,
      seconds: newCall.seconds,
      bill: newCall.price,
      callscount: 1
    });
    debugger;
  }
  else {
    drawCharts();
  }

  var newTopperDn = findTopperDn(gUsers);
  if (newTopperDn !== gTopper.dn) { // we have a new topper
    gTopper.dn = newTopperDn;
    socket.emit('topperReq', gTopper.dn);
    $("#topper h1:first").html("Topper is " + gTopper.dn);
  }
});

socket.once('disconnect', function() {
  alert("Connection lost.");
  socket.disconnect();
});
