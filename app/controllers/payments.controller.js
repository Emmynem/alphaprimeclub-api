import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import dotenv from 'dotenv';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, paginate, tag_root, return_all_letters_uppercase, random_uuid,
	anonymous, zero, completed, processing, cancelled, refunded, payment_methods, gateways, transaction_types, mailer_url, return_all_letters_lowercase, 
	paystack_verify_payment_url, squad_sandbox_verify_payment_url, squad_live_verify_payment_url, app_defaults, application_status, 
} from '../config/config.js';
import { user_cancel_payment, user_cancel_payment_via_reference, user_complete_payment } from '../config/templates.js';
import db from "../models/index.js";

dotenv.config();

const { clouder_key, cloudy_name, cloudy_key, cloudy_secret, cloud_mailer_key, host_type, smtp_host, cloud_mailer_username, cloud_mailer_password, from_email } = process.env;

const PAYMENTS = db.payments;
const APPLICATIONS = db.applications;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export async function getPayments(req, res) {
	const api_key = req.API_KEY;

	const total_records = await PAYMENTS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	PAYMENTS.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: APPLICATIONS,
				attributes: ['unique_id', 'fullname', 'email', 'application_status']
			},
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(payments => {
		if (!payments || payments.length === 0) {
			SuccessResponse(res, { unique_id: api_key, text: "Payments Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: api_key, text: "Payments loaded" }, { ...payments, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: api_key, text: err.message }, null);
	});
};

export function getPayment(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		PAYMENTS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload
			},
			include: [
				{
					model: APPLICATIONS,
					attributes: ['unique_id', 'fullname', 'email', 'application_status']
				},
			],
		}).then(payment => {
			if (!payment) {
				NotFoundError(res, { unique_id: api_key, text: "Payment not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: api_key, text: "Payment loaded" }, payment);
			}
		}).catch(err => {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		});
	}
};

export async function getPaymentsSpecifically(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PAYMENTS.count({ where: { ...payload } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		PAYMENTS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				...payload
			}, 
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: APPLICATIONS,
					attributes: ['unique_id', 'fullname', 'email', 'application_status']
				},
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(payments => {
			if (!payments || payments.length === 0) {
				SuccessResponse(res, { unique_id: api_key, text: "Payments specifically Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: api_key, text: "Payments specifically loaded" }, { ...payments, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		});
	}
};

export async function searchPayments(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PAYMENTS.count({
			where: {
				[Op.or]: [
					{
						reference: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						},
					},
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						gateway: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						payment_method: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}, 
					{
						payment_status: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		PAYMENTS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				[Op.or]: [
					{
						reference: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						},
					},
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						gateway: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						payment_method: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						payment_status: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}
				]
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [
				{
					model: APPLICATIONS,
					attributes: ['unique_id', 'fullname', 'email', 'application_status']
				},
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(payments => {
			if (!payments || payments.length === 0) {
				SuccessResponse(res, { unique_id: api_key, text: "Payments Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: api_key, text: "Payments loaded" }, { ...payments, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		});
	}
};

export async function addPayment(req, res) {
	const api_key = req.API_KEY;
	
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const application_details = await APPLICATIONS.findOne({
				attributes: ['unique_id', 'fullname', 'email'],
				where: {
					unique_id: payload.application_unique_id
				}
			});

			if (!application_details) {
				BadRequestError(res, { unique_id: api_key, text: "User not found" }, null);
			} else {
				const current_payment = await PAYMENTS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						application_unique_id: payload.application_unique_id,
						type: transaction_types.payment,
						payment_status: processing,
						status: default_status
					},
				});

				if (current_payment) {
					BadRequestError(res, { unique_id: api_key, text: "You have a pending payment!!" }, { reference: current_payment.reference, unique_id: current_payment.unique_id });
				} else {
					const details = `NGN ${payload.amount.toLocaleString()} ${transaction_types.payment.toLowerCase()}, via ${payment_methods.card}`;
					const payment_unique_id = uuidv4();
					const reference = random_uuid(4);
		
					await db.sequelize.transaction(async (transaction) => {
						const payment = await PAYMENTS.create(
							{
								unique_id: payment_unique_id,
								application_unique_id: payload.application_unique_id,
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
		
						if (payment) {
							SuccessResponse(res, { unique_id: api_key, text: "Payment created successfully!" }, { unique_id: payment_unique_id, reference: payment.reference, amount: payload.amount });
						} else {
							throw new Error("Error adding payment");
						}
					});
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		}
	}
};

export async function cancelPayment(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const current_payment = await PAYMENTS.findOne({
				attributes: { exclude: ['id'] },
				where: {
					unique_id: payload.unique_id,
					type: transaction_types.payment,
					payment_status: processing,
					status: default_status
				},
				include: [
					{
						model: APPLICATIONS,
						attributes: ['unique_id', 'fullname', 'email', 'application_status']
					},
				]
			});

			if (current_payment) {
				const { email_html, email_subject, email_text } = user_cancel_payment();

				const mailer_response = await axios.post(
					`${mailer_url}/send`,
					{
						host_type: host_type,
						smtp_host: smtp_host,
						username: cloud_mailer_username,
						password: cloud_mailer_password,
						from_email: from_email,
						to_email: current_payment.application.email,
						subject: email_subject,
						text: email_text,
						html: email_html
					},
					{
						headers: {
							'mailer-access-key': cloud_mailer_key
						}
					}
				);

				if (mailer_response.data.success) {
					if (mailer_response.data.data === null) {
						BadRequestError(response, { unique_id: api_key, text: "Unable to send email to user" }, null);
					} else {
						await db.sequelize.transaction(async (transaction) => {
							const payments = await PAYMENTS.update(
								{
									payment_status: cancelled,
								}, {
									where: {
										unique_id: payload.unique_id,
										status: default_status
									},
									transaction
								}
							);
		
							if (payments > 0) {
								SuccessResponse(res, { unique_id: api_key, text: "Payment was cancelled successfully!" }, null);
							} else {
								throw new Error("Payment not found");
							}
						});
					}
				} else {
					BadRequestError(res, { unique_id: api_key, text: mailer_response.data.message }, null);
				}
			} else {
				BadRequestError(res, { unique_id: api_key, text: "Processing Payment not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		}
	}
};

export async function cancelPaymentViaReference(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const current_payment = await PAYMENTS.findOne({
				attributes: { exclude: ['id'] },
				where: {
					reference: payload.reference,
					type: transaction_types.payment,
					payment_status: processing,
					status: default_status
				},
				include: [
					{
						model: APPLICATIONS,
						attributes: ['unique_id', 'fullname', 'email', 'application_status']
					},
				]
			});

			if (current_payment) {
				const { email_html, email_subject, email_text } = user_cancel_payment_via_reference({ reference: payload.reference });

				const mailer_response = await axios.post(
					`${mailer_url}/send`,
					{
						host_type: host_type,
						smtp_host: smtp_host,
						username: cloud_mailer_username,
						password: cloud_mailer_password,
						from_email: from_email,
						to_email: current_payment.application.email,
						subject: email_subject,
						text: email_text,
						html: email_html
					},
					{
						headers: {
							'mailer-access-key': cloud_mailer_key
						}
					}
				);

				if (mailer_response.data.success) {
					if (mailer_response.data.data === null) {
						BadRequestError(response, { unique_id: api_key, text: "Unable to send email to user" }, null);
					} else {
						await db.sequelize.transaction(async (transaction) => {
							const payments = await PAYMENTS.update(
								{
									payment_status: cancelled,
								}, {
									where: {
										reference: payload.reference,
										type: transaction_types.payment,
										payment_status: processing,
										status: default_status
									},
									transaction
								}
							);
		
							if (payments > 0) {
								SuccessResponse(res, { unique_id: api_key, text: "Payment was cancelled successfully!" }, null);
							} else {
								throw new Error("Payment not found");
							}
						});
					}
				} else {
					BadRequestError(res, { unique_id: api_key, text: mailer_response.data.message }, null);
				}
			} else {
				BadRequestError(res, { unique_id: api_key, text: "Processing Payment not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		}
	}
};

export async function completePayment(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const current_payments_details = await PAYMENTS.findOne({
				attributes: { exclude: ['id'] },
				where: {
					reference: payload.reference,
					type: transaction_types.payment,
					payment_status: processing,
					status: default_status
				},
				include: [
					{
						model: APPLICATIONS,
						attributes: ['unique_id', 'fullname', 'email', 'application_status']
					},
				]
			});

			if (current_payments_details) {
				if (current_payments_details.payment_method === payment_methods.card) {
					if (current_payments_details.gateway === gateways.paystack) {
						const app_default = await APP_DEFAULTS.findOne({
							attributes: { exclude: ['id'] },
							where: {
								criteria: app_defaults.paystack_secret_key
							}
						});

						if (app_default) {
							try {
								const paystack_transaction_res = await axios.get(
									`${paystack_verify_payment_url}${current_payments_details.reference}`,
									{
										headers: {
											'Authorization': `Bearer ${app_default.value}`
										}
									}
								);

								if (paystack_transaction_res.data.status !== true) {
									BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: "Error getting payment for validation" }, null);
								} else if (paystack_transaction_res.data.data.status !== "success") {
									BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: `Payment unsuccessful (Status - ${return_all_letters_uppercase(paystack_transaction_res.data.data.status)})` }, null);
								} else {
									const { email_html, email_subject, email_text } = user_complete_payment({ reference: payload.reference, amount: "NGN " + current_payments_details.amount.toLocaleString() });

									const mailer_response = await axios.post(
										`${mailer_url}/send`,
										{
											host_type: host_type,
											smtp_host: smtp_host,
											username: cloud_mailer_username,
											password: cloud_mailer_password,
											from_email: from_email,
											to_email: current_payments_details.application.email,
											subject: email_subject,
											text: email_text,
											html: email_html
										},
										{
											headers: {
												'mailer-access-key': cloud_mailer_key
											}
										}
									);

									if (mailer_response.data.success) {
										if (mailer_response.data.data === null) {
											BadRequestError(response, { unique_id: api_key, text: "Unable to send email to user" }, null);
										} else {
											await db.sequelize.transaction(async (transaction) => {
												const payments = await PAYMENTS.update(
													{
														payment_status: completed,
													}, {
														where: {
															unique_id: current_payments_details.unique_id,
															type: transaction_types.payment,
															status: default_status
														},
														transaction
													}
												);
		
												if (payments > 0) {
													const application_update = await APPLICATIONS.update(
														{
															application_status: application_status.paid,
														}, {
															where: {
																unique_id: current_payments_details.application_unique_id,
																status: default_status
															},
															transaction
														}
													);
		
													if (application_update > 0) {
														SuccessResponse(res, { unique_id: current_payments_details.application_unique_id, text: "Payment was completed successfully!" });
													} else {
														throw new Error("Error updating application status");
													}
												} else {
													throw new Error("Error completing payment");
												}
											});
										}
									} else {
										BadRequestError(res, { unique_id: api_key, text: mailer_response.data.message }, null);
									}
								}
							} catch (error) {
								BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: error.response ? error.response.data.message : error.message }, { err_code: error.code });
							}
						} else {
							BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: "App Default for Paystack Gateway not found!" }, null);
						}
					} else if (current_payments_details.gateway === gateways.squad) {
						const app_default = await APP_DEFAULTS.findOne({
							attributes: { exclude: ['id'] },
							where: {
								criteria: app_defaults.squad_secret_key
							}
						});

						if (app_default) {
							try {
								const squad_transaction_res = await axios.get(
									`${squad_sandbox_verify_payment_url}${current_payments_details.reference}`,
									{
										headers: {
											'Authorization': `Bearer ${app_default.value}`
										}
									}
								);

								if (squad_transaction_res.data.success !== true) {
									BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: "Error getting payment for validation" }, null);
								} else if (squad_transaction_res.data.data.transaction_status !== "success") {
									BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: `Payment unsuccessful (Status - ${squad_transaction_res.data.data.transaction_status})` }, null);
								} 
								// else if (squad_transaction_res.data.data.transaction_amount < current_payments.amount) {
								// 	BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: `Invalid transaction amount!` }, null);
								// } 
								else {
									const { email_html, email_subject, email_text } = user_complete_payment({ reference: payload.reference, amount: "NGN " + current_payments_details.amount.toLocaleString() });

									const mailer_response = await axios.post(
										`${mailer_url}/send`,
										{
											host_type: host_type,
											smtp_host: smtp_host,
											username: cloud_mailer_username,
											password: cloud_mailer_password,
											from_email: from_email,
											to_email: current_payments_details.application.email,
											subject: email_subject,
											text: email_text,
											html: email_html
										},
										{
											headers: {
												'mailer-access-key': cloud_mailer_key
											}
										}
									);

									if (mailer_response.data.success) {
										if (mailer_response.data.data === null) {
											BadRequestError(response, { unique_id: api_key, text: "Unable to send email to user" }, null);
										} else {
											await db.sequelize.transaction(async (transaction) => {
												const payments = await PAYMENTS.update(
													{
														payment_status: completed,
													}, {
														where: {
															unique_id: current_payments_details.unique_id,
															reference: payload.reference,
															type: transaction_types.payment,
															status: default_status
														},
														transaction
													}
												);
		
												if (payments > 0) {
													const application_update = await APPLICATIONS.update(
														{
															application_status: application_status.paid,
														}, {
															where: {
																unique_id: current_payments_details.application_unique_id,
																status: default_status
															},
															transaction
														}
													);
		
													if (application_update > 0) {
														SuccessResponse(res, { unique_id: current_payments_details.application_unique_id, text: "Payment was completed successfully!" });
													} else {
														throw new Error("Error updating application status");
													}
												} else {
													throw new Error("Error completing payment");
												}
											});
										}
									} else {
										BadRequestError(res, { unique_id: api_key, text: mailer_response.data.message }, null);
									}
								}
							} catch (error) {
								BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: error.response ? error.response.data.message : error.message }, { err_code: error.code });
							}
						} else {
							BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: "App Default for Squad Gateway not found!" }, null);
						}
					} else {
						BadRequestError(res, { unique_id: current_payments_details.application_unique_id, text: "Invalid transaction gateway!" }, null);
					}
				} else {
					const { email_html, email_subject, email_text } = user_complete_payment({ reference: payload.reference, amount: "NGN " + current_payments_details.amount.toLocaleString() });

					const mailer_response = await axios.post(
						`${mailer_url}/send`,
						{
							host_type: host_type,
							smtp_host: smtp_host,
							username: cloud_mailer_username,
							password: cloud_mailer_password,
							from_email: from_email,
							to_email: current_payments_details.application.email,
							subject: email_subject,
							text: email_text,
							html: email_html
						},
						{
							headers: {
								'mailer-access-key': cloud_mailer_key
							}
						}
					);

					if (mailer_response.data.success) {
						if (mailer_response.data.data === null) {
							BadRequestError(response, { unique_id: api_key, text: "Unable to send email to user" }, null);
						} else {
							await db.sequelize.transaction(async (transaction) => {
								const payments = await PAYMENTS.update(
									{
										payment_status: completed,
									}, {
										where: {
											unique_id: current_payments_details.unique_id,
											reference: payload.reference,
											type: transaction_types.payment,
											status: default_status
										},
										transaction
									}
								);
		
								if (payments > 0) {
									const application_update = await APPLICATIONS.update(
										{
											application_status: application_status.paid,
										}, {
											where: {
												unique_id: current_payments_details.application_unique_id,
												status: default_status
											},
											transaction
										}
									);
		
									if (application_update > 0) {
										SuccessResponse(res, { unique_id: current_payments_details.application_unique_id, text: "Payment was completed successfully!" });
									} else {
										throw new Error("Error updating application status");
									}
								} else {
									throw new Error("Error completing payment");
								}
							});
						}
					} else {
						BadRequestError(res, { unique_id: api_key, text: mailer_response.data.message }, null);
					}
				}
			} else {
				BadRequestError(res, { unique_id: api_key, text: "Processing Payment not found!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		}
	}
};

export async function deletePayment(req, res) {
	const api_key = req.API_KEY;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: api_key, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const payment = await PAYMENTS.destroy(
					{
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (payment > 0) {
					OtherSuccessResponse(res, { unique_id: api_key, text: "Payment was deleted successfully!" });
				} else {
					throw new Error("Error deleting payment");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: api_key, text: err.message }, null);
		}
	}
};