import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import { default_status, default_delete_status, check_length_TEXT } from '../config/config.js';

const APPLICATIONS = db.applications;
const Op = db.Sequelize.Op;

export const applications_rules = {
	forFindingApplicationInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return APPLICATIONS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Application not found!');
				});
			})
	],
	forFindingApplication: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return APPLICATIONS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Application not found!');
				});
			})
	],
	forFindingApplicationFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return APPLICATIONS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Application not found!');
				});
			})
	],
	forFindingApplicationAlt: [
		check('application_unique_id', "Application Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(application_unique_id => {
				return APPLICATIONS.findOne({ where: { unique_id: application_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Application not found!');
				});
			})
	],
	forAdding: [
		check('fullname', "Fullname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom(email => {
				return APPLICATIONS.findOne({ where: { email } }).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
		check('phone_number', "Phone Number is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isMobilePhone()
			.withMessage('Invalid phone number'),
			// .bail()
			// .custom(phone_number => {
			// 	return APPLICATIONS.findOne({ where: { phone_number } }).then(data => {
			// 		if (data) return Promise.reject('Phone number already exists!');
			// 	});
			// }),
		check('gender', "Gender is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters"),
		check('date_of_birth', "Date of Birth is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(date_of_birth => {
				const later = moment(date_of_birth, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid Date of Birth format (YYYY-MM-DD)"),
		check('job_title', "Job Title is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 100 })
			.withMessage("Invalid length (3 - 100) characters"),
		check('company_name', "Company Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 100 })
			.withMessage("Invalid length (3 - 100) characters"),  
		check('industry', "Industry is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 100 })
			.withMessage("Invalid length (3 - 100) characters"),  
		check('linkedin_profile', "LinkedIn Profile is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isURL()
			.withMessage("Value must be a specified url"),
		check('why', "Why is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 3000 })
			.withMessage("Invalid length (3 - 3000) characters"),  
		check('what', "What is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 3000 })
			.withMessage("Invalid length (3 - 3000) characters"),
		check('how', "How is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: 3000 })
			.withMessage(`Invalid length (3 - ${3000}) characters`),
		check('any')
			.optional({ checkFalsy: false })
			.bail()
			.isLength({ min: 3, max: 3000 })
			.withMessage(`Invalid length (3 - ${3000}) characters`),
	], 
	forUpdatingApplicationStatus: [
		check('application_status', "Application Status is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isLength({ min: 3, max: 50 })
			.withMessage(`Invalid length (3 - ${50}) characters`),
	],
};  