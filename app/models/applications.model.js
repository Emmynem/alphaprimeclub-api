import { db_end, db_start } from "../config/config";

export default (sequelize, Sequelize) => {

	const applications = sequelize.define("application", {
		id: {
			type: Sequelize.BIGINT,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			unique: true
		},
		fullname: {
			type: Sequelize.STRING(200),
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING(255),
			allowNull: false
		},
		phone_number: {
			type: Sequelize.STRING(20),
			allowNull: false
		},
		gender: {
			type: Sequelize.STRING(20),
			allowNull: false,
		},
		date_of_birth: {
			type: Sequelize.DATEONLY,
			allowNull: false,
		},
		job_title: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		company_name: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		industry: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		linkedin_profile: {
			type: Sequelize.STRING(300),
			allowNull: false,
		},
		why: {
			type: Sequelize.STRING(3000),
			allowNull: false
		},
		what: {
			type: Sequelize.STRING(3000),
			allowNull: false,
		},
		how: {
			type: Sequelize.STRING(3000),
			allowNull: false,
		},
		any: {
			type: Sequelize.STRING(3000),
			allowNull: true,
		},
		application_status: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}applications${db_end}`
	});
	return applications;
};
