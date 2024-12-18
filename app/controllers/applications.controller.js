import { validationResult, matchedData } from 'express-validator';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import {
	application_status, default_status, mailer_url, paginate, payment_methods, processing, random_uuid, return_all_letters_uppercase, transaction_types
} from '../config/config.js';
import db from "../models/index.js";
import dotenv from 'dotenv';
dotenv.config();

const {
	cloud_mailer_key, host_type, smtp_host, cloud_mailer_username, cloud_mailer_password, from_email, to_email
} = process.env;

const APPLICATIONS = db.applications;
const PAYMENTS = db.payments;
const Op = db.Sequelize.Op;

const getFileExtension = (filename) => {
	let lastDot = filename.lastIndexOf('.');
	let ext = filename.substring(lastDot + 1);
	return ext;
};

export async function getApplications(req, res) {
	const api_key = req.API_KEY;

	const total_records = await APPLICATIONS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	APPLICATIONS.findAndCountAll({
		attributes: { exclude: ['id', 'why', 'what', 'how', 'any', 'file_one_public_id', 'file_two_public_id'] },
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(applications => {
		if (!applications || applications.length === 0) {
			SuccessResponse(res, { unique_id: api_key, text: "Applications Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: api_key, text: "Applications loaded" }, { ...applications, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: api_key, text: err.message }, null);
	});
};

export function getApplication(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		APPLICATIONS.findOne({
			attributes: { exclude: ['id', 'file_one_public_id', 'file_two_public_id'] },
			where: {
				...payload
			},
		}).then(application => {
			if (!application) {
				NotFoundError(res, { unique_id: api_key, text: "Application not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: api_key, text: "Application loaded" }, application);
			}
		}).catch(err => {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		});
	}
};

export async function addApplication(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			// const mailer_response = await axios.post(
			// 	`${mailer_url}/send`,
			// 	host_type === "GOOGLE" ? {
			// 		host_type: host_type, 
			// 		username: cloud_mailer_username, 
			// 		password: cloud_mailer_password, 
			// 		from_email: from_email,
			// 		to_email: to_email,
			// 		to_email: payload.email,
			// 		subject: payload.subject,
			// 		text: payload.text,
			// 		html: payload.html
			// 	} :
			// 	{
			// 		host_type: host_type,
			// 		smtp_host: smtp_host, 
			// 		username: cloud_mailer_username,
			// 		password: cloud_mailer_password,
			// 		from_email: from_email,
			// 		to_email: to_email,
			// 		to_email: payload.email,
			// 		subject: payload.subject,
			// 		text: payload.text,
			// 		html: payload.html
			// 	},
			// 	{
			// 		headers: {
			// 			'mailer-access-key': cloud_mailer_key
			// 		}
			// 	}
			// );

			// if (mailer_response.data.success) {
			// 	if (mailer_response.data.data === null) {
			// 		BadRequestError(response, { unique_id: api_key, text: "No data found" }, null);
			// 	} else {
					const application_unique_id = uuidv4();
					const details = `NGN ${payload.amount.toLocaleString()} ${transaction_types.payment.toLowerCase()}, via ${payment_methods.card}`;
					const payment_unique_id = uuidv4();
					const reference = random_uuid(4);

					await db.sequelize.transaction(async (transaction) => {
						const application = await APPLICATIONS.create(
							{
								unique_id: application_unique_id,
								fullname: payload.fullname,
								email: payload.email,
								phone_number: payload.phone_number,
								gender: payload.gender,
								date_of_birth: payload.date_of_birth,
								job_title: payload.job_title,
								company_name: payload.company_name,
								industry: payload.industry,
								linkedin_profile: payload.linkedin_profile,
								residential_address: payload.residential_address,
								why: payload.why,
								what: payload.what,
								how: payload.how,
								any: payload.any ? payload.any : null,
								file_one: payload.file_one,
								file_one_type: payload.file_one_type,
								file_one_public_id: payload.file_one_public_id,
								file_two: payload.file_two,
								file_two_type: payload.file_two_type,
								file_two_public_id: payload.file_two_public_id,
								application_status: application_status.pending,
								status: default_status
							}, { transaction }
						);

						const payment = await PAYMENTS.create(
							{
								unique_id: payment_unique_id,
								application_unique_id: application_unique_id,
								type: transaction_types.payment,
								gateway: return_all_letters_uppercase(payload.gateway),
								payment_method: payment_methods.card,
								amount: parseInt(payload.amount),
								reference: payload.reference ? payload.reference : reference,
								payment_status: processing,
								details,
								status: default_status
							}, { transaction }
						);

						if (application && payment) {
							SuccessResponse(res, { unique_id: api_key, text: "Application added successfully!" }, { unique_id: payment_unique_id, reference: payment.reference, amount: payload.amount });
						} else {
							throw new Error("Error adding application");
						}
					});
			// 	}
			// } else {
			// 	BadRequestError(res, { unique_id: api_key, text: mailer_response.data.message }, null);
			// }
		} catch (err) {
			ServerError(res, { unique_id: api_key, text: err.response.data.message ? err.response.data.message : err.message }, null);
		}
	}
};

export async function updateApplicationStatus(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const application = await APPLICATIONS.update(
					{
						...payload,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (application > 0) {
					SuccessResponse(res, { unique_id: api_key, text: "Application status updated successfully!" }, null);
				} else {
					throw new Error("Application not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		}
	}
};

export async function deleteApplication(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const application = await APPLICATIONS.destroy(
				{
					where: {
						unique_id: payload.unique_id,
						status: default_status
					}
				}
			);

			if (application > 0) {
				SuccessResponse(res, { unique_id: api_key, text: "Application was deleted successfully!" });
			} else {
				BadRequestError(res, { unique_id: api_key, text: "Error deleting record" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		}
	}
};