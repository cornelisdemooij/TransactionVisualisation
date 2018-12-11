let filename = 'CSV_A_20181206_104718.csv';

let ctx = document.getElementById("balanceChart").getContext('2d');
let balanceChart = new Chart(ctx, {
	options: {
		title: {
			display: true,
			text: 'Could not load data'
		}
	}
});

function renderBalances(datesAndBalances) {
	let ctx = document.getElementById("balanceChart").getContext('2d');
	let data = {
		datasets: [
			{
				label: 'Balance',
				data: datesAndBalances,
				backgroundColor: 'rgba(255, 98, 0, 0.2)',
	            borderColor: 'rgba(255, 98, 0, 1)',
	            borderWidth: 1
			}
		]
	};
	let options = {
		scales: {
			xAxes: [{
				type: 'time',
				time: {
					unit: 'year'
				},
				gridLines: {
					display: false
				}
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
	let balanceChart = new Chart(ctx, {
		type: 'scatter',
		data: data,
		options: options
	});
}

function parseTransactionFile(allText) {
	let debits = [];
	let credits = [];
	let lines = allText.split("\n");
	let i;
	for (i = 1; i < lines.length-1; i++) {
		let line = lines[i];
		let items = line.split(",");

		let dateString = items[4].replace('"','');
		let amountString = (items[6] + "." + items[7]).replace('"','');

		let unixtime = Date.parse(dateString, "YYYY-MM-DD");
		let date = new Date(unixtime);

		let amount = parseFloat(amountString);

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
	let years = [];
	let creditAmounts = [];
	let debitAmounts = [];
	for (i = 0; i < credits.length; i++) {
		years[i] = credits[i].year;
		creditAmounts[i] = credits[i].amount;
		debitAmounts[i] = -debits[i].amount;
	}

	// Calculate balance, going backwards:
	let balanceFinal = 645.58;
	let balance = balanceFinal;

	let datesAndBalances = [ {x: new Date(), y: balance} ];
	for (i = credits.length-1; i >= 0; i--) {
		balance += -creditAmounts[i] + debitAmounts[i];
		datesAndBalances.push({ x: new Date(credits[i].unixtime),
								y: balance });
	}

	renderBalances(datesAndBalances);
	//console.log(JSON.stringify(transactions));
}

function readTransactionFile(filename) {
	let allText;
	let rawFile = new XMLHttpRequest();
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

readTransactionFile('./data/' + filename);