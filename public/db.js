//My global db
let db;
//This will create a new db for my "visualbudgetDB"
const request = indexedDB.open("visualbudgetDB", 1);

request.onupgradeneeded = function (event) {
	//This will create object store called "pending" and set autoIncrement to true
	const db = event.target.result;
	db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
	db = event.target.result;

	//Check if app is online before reading the db
	if (navigator.onLine) {
		checkDatabase();
	}
};

request.onerror = function (event) {
	console.log("Oops!" + event.target.errorCode);
};

function saveRecord(record) {
	//This will create a transaction on the pending db with readwrite access
	//This will open up your indexDB asking for permissions
	//Opening up a connection to the pending table
	const transaction = db.transaction(["pending"], "readwrite");

	//This will access your pending object store, store is the reference to the
	//pending table.
	const store = transaction.objectStore("pending");

	//Add a record to your store with add method.
	//This will add your record to the local DB in the pending method
	store.add(record);
}

function checkDatabase() {
	//This will open a transaction on your pending db
	const transaction = db.transaction(["pending"], "readwrite");
	//This will access your pending object store
	const store = transaction.objectStore("pending");
	//This will get all records from the store and set to a variable
	const getAll = store.getAll();

	//Once back online it will execute this function.
	//This will do a post to pass the offline records saved in indexedDB
	getAll.onsuccess = function () {
		if (getAll.result.length > 0) {
			fetch("./api/transaction/bulk", {
				method: "POST",
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
				},
			})
				//If the function above works, then functions will activate below
				.then((res) => res.json())
				.then(() => {
					//If successful, open a transaction on your pending db
					const transaction = db.transaction(["pending"], "readwrite");

					//Accessing the pending object store
					const store = transaction.objectStore("pending");

					//This will clear all items in the store
					store.clear();
				});
		}
	};
}

//This will listen for the App to come back online
//When this is back online it will execute the "checkDatabase" function
window.addEventListener("online", checkDatabase);
