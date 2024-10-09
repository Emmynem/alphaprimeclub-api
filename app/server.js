import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import { SuccessResponse } from './common/index.js';
import logger from "./common/logger.js";
import { alphaprimeclub_header_key, primary_domain } from './config/config.js';
import { createAppDefaults } from './config/default.config.js';
import morganMiddleware from "./middleware/morgan.js";
import db from "./models/index.js";
import applicationsRoutes from "./routes/applications.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";

const app = express();

const appWhitelist = [primary_domain, "http://localhost", "http://localhost:80", "http://localhost:3000", "http://localhost:5173", "https://alphaprimeclub.netlify.app"];
//options for cors midddleware
const options = cors.CorsOptions = {
	allowedHeaders: [
		'Access-Control-Allow-Headers',
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		alphaprimeclub_header_key
	],
	methods: 'GET,PUT,POST,DELETE',
	credentials: true,
	origin: function (origin, callback) {
		if (appWhitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(null, false);
		}
	},
};

app.use(json());
app.use(urlencoded({ extended: true, limit: '100mb' }));
app.use(helmet());
app.use(morganMiddleware);

// add cors
app.use(cors(options));

// simple route
app.get("/", (request, response) => {
	SuccessResponse(response, "Alpha Prime Club API activated!");
})

// Sequelize initialization
db.sequelize.sync({ alter: false }).then(() => {
	logger.info("DB Connected 🚀");
	// creating defaults
	createAppDefaults();
});

// app.use(express.static(path.join(__dirname, '../public')));

// Binding routes
applicationsRoutes(app);
paymentsRoutes(app);

// change timezone for app
process.env.TZ = "UTC";

process.on('SIGINT', function () {
	db.sequelize.close(function (err) {
		process.exit(err ? 1 : 0);
	});
});

export default app;
