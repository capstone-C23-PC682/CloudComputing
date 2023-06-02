const express = require('express');

const app = express();
const cors = require('cors')

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 2115;

const homeRoute = require('./routes/home_route.js');
const firebaseRoute = require('./routes/firebase_route.js');
const queuesRoute = require('./routes/queue_route.js');

app.use(homeRoute.router);
app.use(firebaseRoute.router);
app.use(queuesRoute.router);

app.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});