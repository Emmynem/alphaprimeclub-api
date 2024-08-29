import { checks } from "../middleware/index.js";
import { applications_rules } from "../rules/applications.rules.js";
import { getApplications, getApplication, addApplication, deleteApplication, updateApplicationStatus } from "../controllers/applications.controller.js";

export default function (app) {
	app.get("/applications", [checks.verifyKey], getApplications);
	app.get("/application", [checks.verifyKey, applications_rules.forFindingApplication], getApplication);

	app.post("/application", [applications_rules.forAdding], addApplication);
	
	app.put("/application/status", [checks.verifyKey, applications_rules.forFindingApplication, applications_rules.forUpdatingApplicationStatus], updateApplicationStatus);

	app.delete("/application", [checks.verifyKey, applications_rules.forFindingApplication], deleteApplication);
};
