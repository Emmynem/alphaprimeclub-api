import { BadRequestError } from '../common/index.js';
import { max_upload_count } from '../config/config'; 

const image_allowed_extensions = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/jfif", "image/JFIF", "image/webp", "image/WEBP"];
const image_or_pdf_allowed_extensions = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/jfif", "image/JFIF", "image/webp", "image/WEBP", "application/pdf", "application/PDF"];
const document_allowed_extensions = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/jfif", "image/JFIF", "image/webp", "image/WEBP", "application/pdf", "application/PDF", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/x-zip-compressed", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
const media_allowed_extensions = ["audio/mpeg", "audio/wav", "audio/ogg", "video/x-matroska", "video/mp4", "video/x-m4v"];

const imageFilter = (filetype) => {
    if (image_allowed_extensions.includes(filetype)) {
        return true;
    } else {
        return false;
    }
};

const documentFilter = (filetype) => {
    if (document_allowed_extensions.includes(filetype)) {
        return true;
    } else {
        return false;
    }
};

const imageOrPdfFilter = (filetype) => {
    if (image_or_pdf_allowed_extensions.includes(filetype)) {
        return true;
    } else {
        return false;
    }
};

const mediaFilter = (filetype) => {
    if (media_allowed_extensions.includes(filetype)) {
        return true;
    } else {
        return false;
    }
};

export const imageMiddleware = (req, res, next) => {
    if (!req.files) {
        BadRequestError(res, "Image is required!", null);
    } else {
        const {
            fieldname,
            originalname,
            encoding,
            mimetype,
            buffer,
        } = req.files[0];
    
        if (!imageFilter(mimetype)) {
            BadRequestError(res, "Only image files are allowed!", null);
        } else {
            next();
        }
    }
};

export const imagesMiddleware = (req, res, next) => {
    if (!req.files) {
        BadRequestError(res, "Images are required!", null);
    } else if (req.files.length > max_upload_count) {
        BadRequestError(res, `Max files reached (${max_upload_count} max)!`, null);
    } else {
        var count = 0;
        var flag = 1;
        req.files.forEach((element, index) => {
            count += 1;
            if (!imageFilter(element.mimetype)) {
                flag = 0;
            }
        });

        if (count === req.files.length && flag === 1) next();
        else BadRequestError(res, "Only image files are allowed here!", null);
    }
};

export const mediaMiddleware = (req, res, next) => {
    if (!req.files) {
        BadRequestError(res, "Media file is required!", null);
    } else {
        const {
            fieldname,
            originalname,
            encoding,
            mimetype,
            buffer,
        } = req.files[0];
    
        if (!mediaFilter(mimetype)) {
            BadRequestError(res, "Only media files are allowed!", null);
        } else {
            next();
        }
    }
};

export const mediasMiddleware = (req, res, next) => {
    if (!req.files) {
        BadRequestError(res, "Media files are required!", null);
    } else if (req.files.length > max_upload_count) {
        BadRequestError(res, `Max files reached (${max_upload_count} max)!`, null);
    } else {
        var count = 0;
        var flag = 1;
        req.files.forEach((element, index) => {
            count += 1;
            if (!imageFilter(element.mimetype)) {
                flag = 0;
            }
        });

        if (count === req.files.length && flag === 1) next();
        else BadRequestError(res, "Only media files are allowed here!", null);
    }
};

export const documentMiddleware = (req, res, next) => {
    if (!req.files) {
        BadRequestError(res, "Document is required!", null);
    } else {
        const {
            fieldname,
            originalname,
            encoding,
            mimetype,
            buffer,
        } = req.files[0];
    
        if (!documentFilter(mimetype)) {
            BadRequestError(res, "Only Images, Texts, Docs, Powerpoint and Excel, PDFs files are allowed!", null);
        } else {
            next();
        }
    }
};

export const documentsMiddleware = (req, res, next) => {
    if (!req.files) {
        BadRequestError(res, "Documents are required!", null);
    } else if (req.files.length > max_upload_count) {
        BadRequestError(res, `Max files reached (${max_upload_count} max)!`, null);
    } else {
        var count = 0;
        var flag = 1;
        req.files.forEach((element, index) => {
            count += 1;
            if (!documentFilter(element.mimetype)) {
                flag = 0;
            }
        });

        if (count === req.files.length && flag === 1) next();
        else BadRequestError(res, "Only Images, Texts, Docs, Powerpoint and Excel, PDFs files are allowed!", null);
    }
};

export const imageOrPdfMiddleware = (req, res, next) => {
    if (!req.files) {
        BadRequestError(res, "Image or PDF is required!", null);
    } else {
        const {
            fieldname,
            originalname,
            encoding,
            mimetype,
            buffer,
        } = req.files[0];
    
        if (!imageOrPdfFilter(mimetype)) {
            BadRequestError(res, "Only pdf/image files are allowed!", null);
        } else {
            next();
        }
    }
};

export const imageOrPdfsMiddleware = (req, res, next) => {
    if (!req.files) {
        BadRequestError(res, "Images or PDFs are required!", null);
    } else if (req.files.length > max_upload_count) {
        BadRequestError(res, `Max files reached (${max_upload_count} max)!`, null);
    } else {
        var count = 0;
        var flag = 1;
        req.files.forEach((element, index) => {
            count += 1;
            if (!imageOrPdfFilter(element.mimetype)) {
                flag = 0;
            }
        });

        if (count === req.files.length && flag === 1) next();
        else BadRequestError(res, "Only Image or PDF files are allowed!", null);
    }
};
