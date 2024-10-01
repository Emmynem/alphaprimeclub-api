import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import appDefaultsModel from "./appDefaults.model.js";
import applicationsModel from "./applications.model.js";
import paymentsModel from "./payments.model.js";

const sequelize = new Sequelize(
    DB,
    USER,
    PASSWORD,
    {
        host: HOST,
        dialect: _dialect,
        logging: _logging,
        operatorsAliases: 0,
        pool: {
            max: _pool.max,
            min: _pool.min,
            acquire: _pool.acquire,
            idle: _pool.idle,
            evict: _pool.evict
        },
        dialectOptions: {
            // useUTC: _dialectOptions.useUTC, 
            dateStrings: _dialectOptions.dateStrings,
            typeCast: _dialectOptions.typeCast
        },
        timezone: timezone
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// * Binding models
db.app_defaults = appDefaultsModel(sequelize, Sequelize);
db.applications = applicationsModel(sequelize, Sequelize);
db.payments = paymentsModel(sequelize, Sequelize);

// End - Binding models

// Associations

//    - Payments
db.applications.hasMany(db.payments, { foreignKey: 'application_unique_id', sourceKey: 'unique_id' });
db.payments.belongsTo(db.applications, { foreignKey: 'application_unique_id', targetKey: 'unique_id' });

// End - Associations

export default db;