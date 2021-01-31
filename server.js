const express = require("express");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const app = (require = express());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// Mongoose DB: visualbudgetDB
mongoose.connect(
	process.env.MONGODB_URI || "mongodb://localhost/visualbudgetDB",
	{
		useNewUrlParser: true,
		useFindAndModify: false,
	},
);

//Routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
	console.log(`App running on port ${PORT}`);
});
