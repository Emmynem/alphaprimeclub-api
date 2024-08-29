import dotenv from 'dotenv';
import { UnauthorizedError, ForbiddenError } from '../common/index.js';
import { default_delete_status, alphaprimeclub_header_key, tag_root, api_keys } from "../config/config.js";

dotenv.config();

const verifyKey = (req, res, next) => {
    const key = req.headers[alphaprimeclub_header_key] || req.query.key || req.body.key || '';
    if (!key) {
        ForbiddenError(res, "No key provided!", null);
    } else if (!api_keys.includes(key)) {
        UnauthorizedError(res, "Invalid API Key!", null);
    } else {
        req.API_KEY = key;
        next();
    }
};

export default { verifyKey };