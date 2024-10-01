import { checks } from "../middleware/index.js";
import { payment_rules } from "../rules/payments.rules.js";
import { applications_rules } from "../rules/applications.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addPayment, cancelPayment, cancelPaymentViaReference, completePayment, deletePayment, getPayment, getPayments, searchPayments, getPaymentsSpecifically
} from "../controllers/payments.controller.js";

export default function (app) {
	app.get("/payments", [checks.verifyKey], getPayments);
	app.get("/payments/via/application", [checks.verifyKey, applications_rules.forFindingApplicationAlt], getPaymentsSpecifically);
	app.get("/payments/via/type", [checks.verifyKey, payment_rules.forFindingViaType], getPaymentsSpecifically);
	app.get("/payments/via/gateway", [checks.verifyKey, payment_rules.forFindingViaGateway], getPaymentsSpecifically);
	app.get("/payments/via/payment_status", [checks.verifyKey, payment_rules.forFindingViaPaymentStatus], getPaymentsSpecifically);
	app.get("/payments/via/reference", [checks.verifyKey, payment_rules.forFindingViaReference], getPaymentsSpecifically);
	app.get("/search/payments", [checks.verifyKey, default_rules.forSearching], searchPayments);
	app.get("/payment", [checks.verifyKey, payment_rules.forFindingPayment], getPayment);
	
	app.post("/add/payment", [checks.verifyKey, payment_rules.forAdding], addPayment);

	app.put("/complete/payment", [checks.verifyKey, payment_rules.forFindingViaReference], completePayment);
	app.put("/cancel/payment", [checks.verifyKey, payment_rules.forFindingPayment], cancelPayment);
	app.put("/cancel/payment/via/reference", [checks.verifyKey, payment_rules.forFindingViaReference], cancelPaymentViaReference);

	app.delete("/payment", [checks.verifyKey, payment_rules.forFindingPayment], deletePayment);
};
