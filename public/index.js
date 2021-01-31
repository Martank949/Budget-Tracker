let transactions = [];
let myChart;

fetch("/api/transaction")
	.then((res) => res.json())
	.then((data) => {
		//Saving the DB data on a global var
		transactions = data;
		populateTotal();
		populateTable();
		populateChart();
	});

function populateTotal() {
	// This will reduce transaction amounts to a single total value
	const total = transactions
		.reduce((total, t) => {
			return total + parseFloat(t.value);
		}, 0)
		.toFixed(2);

	const totalElem = document.querySelector("#total");
	totalElem.textContent = total;
}

function populateTable() {
	const tableBod = document.querySelector("#tableBod");
	tableBod.innerHTML = " ";

	transactions.forEach((transaction) => {
		//This will create and populate a table row
		const tableRow = document.createElement("tableRow");
		tableRow.innerHTML = `
		<td>${transaction.name}</td>
		<td>${transaction.value}</td>
		`;

		tableBod.appendChild(tableRow);
	});
}

function populateChart() {
	//This will copy the array and reverse it
	const reversed = transactions.slice().reverse();
	let sum = 0;

	//This creates date labels for the chart
	const labels = reversed.map((t) => {
		const date = new Date(t.date);
		return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	});

	//This create incremental values for chart
	const data = reversed.map((t) => {
		sum += parseInt(t.value);
		return sum;
	});

	//This will remove the old charts if they exists
	if (myChart) {
		myChart.destroy();
	}

	const context = document.getElementById("myChart").getContext("2d");

	myChart = new Chart(context, {
		type: "line",
		data: {
			labels,
			datasets: [
				{
					label: "Total Over Time",
					fill: true,
					backgroundColor: "#6666ff",
					data,
				},
			],
		},
	});
}

function sendTransaction(isAdding) {
	const nameElem = document.querySelector("#tableName");
	const amountElem = document.querySelector("#tableAmount");
	const errorElem = document.querySelector("form, .error");

	//This will validate the form
	if (nameElem.value === "" || amountElem.value === "") {
		errorElem.textContent = "Missing Information";
		return;
	} else {
		errorElem.textContent = "";
	}

	//This will create a record
	const transaction = {
		name: nameElem.value,
		value: amountElem.value,
		date: new Date().toISOString(),
	};

	//If subtracting funds, convert amount to a negative number
	if (!isAdding) {
		transaction.value *= -1;
	}

	//This will add to the beginning of the current array of data
	transactions.unshift(transaction);

	//This will re-run logic to populate UI with a new record
	populateChart();
	populateTable();
	populateTotal();

	//Also send to server
	fetch("/api/transaction", {
		method: "POST",
		body: JSON.stringify(transaction),
		headers: {
			Accept: "application/json, text/plain, */*",
			"Content-Type": "application/json",
		},
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.errors) {
				errorElem.textContent = "Missing Information";
			} else {
				//This will clear the form
				nameElem.value = " ";
				amountElem.value = " ";
			}
		})
		.catch((err) => {
			console.log(err);
			//Fetch failed, so save in indexed db
			saveRecord(transaction);

			//This will clear the form
			nameElem.value = " ";
			amountElem.value = " ";
		});
}

document.querySelector("#add-btn").addEventListener("click", function (event) {
	event.preventDefault();
	sendTransaction(true);
});

document.querySelector("#sub-btn").addEventListener("click", function (event) {
	event.preventDefault();
	sendTransaction(false);
});
