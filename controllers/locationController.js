const Location = require("../models/location");
const debug = require("debug")("app:location");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.location_list = asyncHandler(async (req, res, next) => {});
exports.location_detail = asyncHandler(async (req, res, next) => {});
exports.location_get_create = asyncHandler(async (req, res, next) => {});
exports.location_post_create = asyncHandler(async (req, res, next) => {});
exports.location_get_delete = asyncHandler(async (req, res, next) => {});
exports.location_post_delete = asyncHandler(async (req, res, next) => {});
exports.location_get_update = asyncHandler(async (req, res, next) => {});
exports.location_post_update = asyncHandler(async (req, res, next) => {});
