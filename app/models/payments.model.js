import { db_end, db_start } from "../config/config";
import applicationsModel from "./applications.model.js";

export default (sequelize, Sequelize) => {

	const applications = applicationsModel(sequelize, Sequelize);

	const payments = sequelize.define("payment", {
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
		application_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			references: {
				model: applications,
				key: "unique_id"
			}
		},
		type: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		gateway: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		payment_method: {
			type: Sequelize.STRING(50),
			allowNull: false,
		}, 
		amount: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		reference: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		payment_status: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		details: {
			type: Sequelize.STRING(500),
			allowNull: true,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}payments${db_end}`
	});
	return payments;
};