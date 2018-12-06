var ctx = document.getElementById("myChart").getContext('2d');
var myChart = new Chart(ctx, {
	options: {
		title: {
			display: true,
			text: 'Could not load data'
		}
	}
});

function renderTransactions(years, creditAmounts, debitAmounts) {
	var ctx = document.getElementById("myChart").getContext('2d');
	var data = {
		labels: years,
		datasets: [
			{
				label: 'Credits',
				data: creditAmounts,
				backgroundColor: 'rgba(75, 192, 192, 1)',
	            borderColor: 'rgba(75, 192, 192, 1)',
	            borderWidth: 1
			},
			{
				label: 'Debits',
				data: debitAmounts,
				backgroundColor: 'rgba(255, 99, 132, 1)',
	            borderColor: 'rgba(255,99,132,1)',
	            borderWidth: 1
			}]
	};
	var options = {
		scales: {
			xAxes: [{
				gridLines: {
					display: false
				},
				barPercentage: 1.0,
				categoryPercentage: 1.0,
				barThickness: 'flex'
			}],
			yAxes: [{
				gridLines: {
					display: false
				},
				ticks: {
					beginAtZero: true
				}
			}]
		}
	};
	var myChart = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: options
	});
}

function parseTransactionFile(allText) {
	var debits = [];
	var credits = [];
	var lines = allText.split("\n");
	var i;
	for (i = 1; i < lines.length-1; i++) {
		var line = lines[i];
		var items = line.split(",");

		var dateString = items[4].replace('"','');
		var amountString = (items[6] + "." + items[7]).replace('"','');

		var unixtime = Date.parse(dateString, "YYYY-MM-DD");
		var date = new Date(unixtime);

		var amount = parseFloat(amountString);

		if (amount < 0.0) {
			credits.push({"unixtime": unixtime, 
						 "year" : date.getFullYear(), 
						 "month" : date.getMonth(), 
						 "day" : date.getDate(), 
						 "amount" : 0.0 });
			debits.push({"unixtime": unixtime, 
						 "year" : date.getFullYear(), 
						 "month" : date.getMonth(), 
						 "day" : date.getDate(), 
						 "amount" : amount });
		} else {
			credits.push({"unixtime": unixtime, 
						 "year" : date.getFullYear(), 
						 "month" : date.getMonth(), 
						 "day" : date.getDate(), 
						 "amount" : amount });
			debits.push({"unixtime": unixtime, 
						 "year" : date.getFullYear(), 
						 "month" : date.getMonth(), 
						 "day" : date.getDate(), 
						 "amount" : 0.0 });
		}
	}
	function compareTransactions(a, b) {
		if (a.unixtime < b.unixtime) {
			return -1;
		}
		if (a.unixtime > b.unixtime) {
			return 1;
		}
		return 0;
	}
	credits.sort(compareTransactions);
	debits.sort(compareTransactions);

	// Instead of transaction objects, we want arrays for rendering: 
	// One for the dates, one for the amounts.
	var years = [];
	var creditAmounts = [];
	var debitAmounts = [];
	for (i = 0; i < credits.length; i++) {
		years[i] = credits[i].year;
		creditAmounts[i] = credits[i].amount;
		debitAmounts[i] = -debits[i].amount;
	}

	renderTransactions(years, creditAmounts, debitAmounts);
	//console.log(JSON.stringify(transactions));
}

function readTransactionFile(filename) {
	var allText;
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", filename, false);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status == 0) {
				parseTransactionFile(rawFile.responseText);
			}
		}
	}
	rawFile.send(null);
}

readTransactionFile("./data/CSV_A_20181206_104718.csv");